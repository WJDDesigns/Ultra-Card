import {
  inferEntityDomainsFromPrompt,
  suggestSmartModuleTypesForPrompt,
} from './uc-smart-module-capabilities';
import {
  findBestEntityForModuleSpec,
  getForcedModuleTypeFromPrompt,
  getSmartModuleSpec,
} from './smart/uc-smart-module-registry';

export type SmartCompositionHass = {
  states?: Record<string, unknown>;
};

export type SmartEntityRef = {
  entityId: string;
  name: string;
  domain: string;
  deviceClass?: string | undefined;
  unit?: string | undefined;
};

export type SmartLayoutRecipe =
  | 'header'
  | 'entityList'
  | 'controlList'
  | 'entityGrid'
  | 'domainModule'
  | 'gaugeModule'
  | 'barModule'
  | 'singleModule'
  | 'moduleRow'
  | 'mixedSections';

export type SmartSectionKind = 'header' | 'control' | 'status' | 'list' | 'grid' | 'details';

export type SmartCompositionSection = {
  id: string;
  kind: SmartSectionKind;
  recipe: SmartLayoutRecipe;
  domains: string[];
  entities: SmartEntityRef[];
  forcedModuleType?: string | undefined;
  /** Ordered module types for moduleRow sections (e.g. clock + weather). */
  moduleIntents?: string[] | undefined;
  wantsButtons: boolean;
  wantsDetails: boolean;
  wantsLargeText: boolean;
  layoutPreference: 'vertical' | 'horizontal' | 'grid';
  entityLimit?: number | undefined;
  detailAttributes: string[];
};

export type SmartCompositionPlan = {
  prompt: string;
  sections: SmartCompositionSection[];
};

const SECTION_SPLIT_PATTERN =
  /\s+(?:then|and then|followed by|after that|next)\s+|\s+(?:,\s*)?(?:and\s+)?(?:below that|below|under that|under|beneath)\s+/i;

export function parseSmartCompositionPlan(
  prompt: string,
  hass: SmartCompositionHass,
  tier: 'free' | 'pro' = 'pro'
): SmartCompositionPlan {
  const inventory = getEntityInventory(hass);
  const mixedSections = parseMixedModulePrompt(prompt, tier);
  const sectionTexts = splitPromptIntoSections(prompt);
  const sections =
    mixedSections ||
    (sectionTexts.length > 1
      ? sectionTexts.map((text, index) => buildSectionFromText(`section-${index}`, text, prompt, undefined, tier))
      : expandMultiDomainSinglePrompt(prompt, tier) ||
        [buildSectionFromText('section-0', prompt, prompt, undefined, tier)]);

  assignEntitiesToSections(sections, inventory, prompt, tier);

  return {
    prompt,
    sections: sections.filter(sectionHasContent),
  };
}

export function sectionHasContent(section: SmartCompositionSection): boolean {
  return (
    section.entities.length > 0 ||
    section.recipe === 'entityGrid' ||
    section.recipe === 'gaugeModule' ||
    section.recipe === 'barModule' ||
    section.recipe === 'singleModule' ||
    section.recipe === 'moduleRow'
  );
}

export function resolveClockModuleType(tier: 'free' | 'pro', prompt: string): string {
  const text = prompt.toLowerCase();
  if (tier === 'pro' && (/\banimated\b|\bflip\b/.test(text) || !/\bdigital\b/.test(text))) {
    return 'animated_clock';
  }
  return 'clock';
}

export function resolveWeatherModuleType(
  tier: 'free' | 'pro',
  prompt: string,
  sectionText = ''
): string {
  const text = `${prompt} ${sectionText}`.toLowerCase();
  if (/\bicon\b|\btemp\b|\btemperature\b|\bheader\b/.test(text) && !/\bforecast\b|\bmodule\b/.test(text)) {
    return 'header';
  }
  if (tier === 'pro') {
    if (/\bforecast\b/.test(text)) return 'animated_forecast';
    return 'animated_weather';
  }
  if (/\bforecast\b/.test(text)) return 'weather';
  return 'weather';
}

function parseMixedModulePrompt(
  prompt: string,
  tier: 'free' | 'pro'
): SmartCompositionSection[] | null {
  const text = prompt.toLowerCase();
  const hasClock = /\bclock\b/.test(text);
  const hasWeather = /\bweather\b/.test(text);
  const hasLights = /\blights?\b/.test(text);

  if (hasClock && hasWeather) {
    const clockType = resolveClockModuleType(tier, prompt);
    const weatherType = hasClock ? 'header' : resolveWeatherModuleType(tier, prompt, 'weather');

    const sections: SmartCompositionSection[] = [
      {
        id: 'section-top-row',
        kind: 'header',
        recipe: 'moduleRow',
        domains: ['weather'],
        entities: [],
        moduleIntents: [clockType, weatherType],
        wantsButtons: false,
        wantsDetails: false,
        wantsLargeText: false,
        layoutPreference: 'horizontal',
        detailAttributes: [],
      },
    ];

    if (hasLights) {
      sections.push(
        buildSectionFromText(
          'section-lights',
          /\bbelow\b|\bunder\b|\bbeneath\b/.test(text) ? 'list of lights below' : 'list of lights',
          prompt,
          ['light'],
          tier
        )
      );
    }

    return sections;
  }

  const explicitModules = detectExplicitModuleSections(prompt, tier);
  if (explicitModules.length >= 2) {
    return explicitModules;
  }

  return null;
}

function detectExplicitModuleSections(
  prompt: string,
  tier: 'free' | 'pro'
): SmartCompositionSection[] {
  const text = prompt.toLowerCase();
  const sections: SmartCompositionSection[] = [];

  if (/\bclock\b/.test(text) && !/\bweather\b/.test(text)) {
    sections.push({
      id: 'section-clock',
      kind: 'details',
      recipe: 'singleModule',
      domains: [],
      entities: [],
      forcedModuleType: resolveClockModuleType(tier, prompt),
      wantsButtons: false,
      wantsDetails: false,
      wantsLargeText: false,
      layoutPreference: 'vertical',
      detailAttributes: [],
    });
  }

  return sections.length >= 2 ? sections : [];
}

function scoreEntityForPrompt(entity: SmartEntityRef, prompt: string): number {
  const tokens = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 3);
  const haystack = `${entity.entityId} ${entity.name}`.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 12;
  }
  return score;
}

function splitPromptIntoSections(prompt: string): string[] {
  const normalized = prompt.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const parts = normalized
    .split(SECTION_SPLIT_PATTERN)
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length > 1) return parts;

  const topBottomMatch = normalized.match(
    /^(.*?)(?:on top|at the top|above)(?:.*?\bwith\b|\bshowing\b|\bdisplaying\b|\b)(.*?)(?:below|under|beneath)(.+)$/i
  );
  if (topBottomMatch) {
    return [topBottomMatch[1].trim(), topBottomMatch[3].trim()].filter(Boolean);
  }

  return [normalized];
}

function expandMultiDomainSinglePrompt(
  prompt: string,
  tier: 'free' | 'pro' = 'pro'
): SmartCompositionSection[] | null {
  const text = prompt.toLowerCase();
  const domains = inferEntityDomainsFromPrompt(prompt);
  if (domains.length < 2) return null;
  const wantsSideBySide =
    /\bbeside\b|\bnext to\b|\bside by side\b|\bone row\b|\bsame row\b|\bhorizontal\b/.test(text);

  if (wantsSideBySide) {
    return [buildSectionFromText('section-side-by-side', prompt, prompt, domains, tier)];
  }

  const sections: SmartCompositionSection[] = [];
  const hasTopBottom =
    /\bon top\b|\bat the top\b|\babove\b/.test(text) &&
    (/\bbelow\b|\bunder\b|\bbeneath\b/.test(text) || /\blist\b|\bgrid\b/.test(text));

  if (hasTopBottom && domains.includes('weather')) {
    const weatherText = extractDomainPhrase(prompt, 'weather') || 'weather icon and temperature on top';
    sections.push(buildSectionFromText('section-weather', weatherText, prompt, undefined, tier));

    const remainingDomains = domains.filter(domain => domain !== 'weather');
    const restText =
      remainingDomains.map(domain => extractDomainPhrase(prompt, domain)).filter(Boolean).join(' then ') ||
      prompt.replace(/\bweather\b[^.]*?(?=below|under|lights?|list|grid|$)/i, '').trim() ||
      prompt;
    sections.push(buildSectionFromText('section-rest', restText, prompt, undefined, tier));
    return sections;
  }

  if (domains.length >= 2) {
    return domains.map((domain, index) =>
      buildSectionFromText(
        `section-${domain}-${index}`,
        extractDomainPhrase(prompt, domain) || `${domain} controls`,
        prompt,
        [domain],
        tier
      )
    );
  }

  return null;
}

function extractDomainPhrase(prompt: string, domain: string): string | null {
  const patterns: Record<string, RegExp> = {
    weather: /\bweather\b[^.;,]*/i,
    light: /\blights?\b[^.;,]*/i,
    fan: /\bfans?\b[^.;,]*/i,
    lock: /\blocks?\b[^.;,]*/i,
    cover: /\bcovers?\b[^.;,]*/i,
    climate: /\bclimate\b|\bthermostats?\b[^.;,]*/i,
    media_player: /\bmedia\b|\bmusic\b|\bspeakers?\b[^.;,]*/i,
    sensor: /\bsensors?\b[^.;,]*/i,
  };
  const match = prompt.match(patterns[domain] || new RegExp(`\\b${domain}\\b[^.;,]*`, 'i'));
  return match ? match[0].trim() : null;
}

function buildSectionFromText(
  id: string,
  sectionText: string,
  fullPrompt: string,
  forcedDomains?: string[],
  tier: 'free' | 'pro' = 'pro'
): SmartCompositionSection {
  const text = sectionText.toLowerCase();
  const suggestedModules = suggestSmartModuleTypesForPrompt(sectionText, tier, {
    includeLibraryOnly: true,
    max: 12,
  });
  const forcedModuleType = resolveForcedModuleType(sectionText, forcedDomains, tier);
  const forcedSpec = forcedModuleType ? getSmartModuleSpec(forcedModuleType) : undefined;
  const domains = forcedSpec?.entityDomains.filter(domain => domain !== '*').length
    ? forcedSpec.entityDomains.filter(domain => domain !== '*')
    : forcedDomains?.length
      ? forcedDomains
      : inferEntityDomainsFromPrompt(sectionText);
  const resolvedDomains = [...domains];
  if (/\bgrid\b/.test(text) && !resolvedDomains.length) resolvedDomains.push('sensor');

  if (forcedModuleType && forcedSpec?.defaultBuilder) {
    return {
      id,
      kind: 'details',
      recipe: 'singleModule',
      domains: resolvedDomains.length ? resolvedDomains : forcedSpec.entityDomains,
      entities: [],
      forcedModuleType,
      wantsButtons: false,
      wantsDetails: true,
      wantsLargeText: false,
      layoutPreference: 'vertical',
      detailAttributes: [],
    };
  }

  const wantsList = /\blist\b|\brows?\b/.test(text);
  const wantsSideBySide =
    /\bbeside\b|\bnext to\b|\bside by side\b|\bone row\b|\bsame row\b|\bhorizontal\b/.test(text) ||
    suggestedModules.includes('horizontal');
  const wantsButtons =
    /\bbuttons?\b|\bon\/off\b|\bon and off\b|\btoggle\b|\bturn on\b|\bturn off\b/.test(text);
  const wantsDetails =
    /\bstatus\b|\bbrightness\b|\bcolor\b|\bcolour\b|\bdetails?\b|\battributes?\b/.test(text);
  const wantsLargeText =
    /\blarge text\b|\blarge font\b|\bbig text\b|\blarge size\b|\bin large\b/.test(text) ||
    (/\blarge text\b|\blarge font\b|\bbig text\b|\blarge size\b/.test(fullPrompt.toLowerCase()) &&
      resolvedDomains.includes('weather'));
  const entityLimit = parseEntityLimit(sectionText);
  const wantsBar =
    /\bbar\b|\bprogress bar\b|\bpercentage bar\b/.test(text) || suggestedModules.includes('bar');
  const wantsGauge =
    (/\bgauge\b|\bfuel\b|\bgas left\b|\btank level\b|\bfuel level\b|\bfuel left\b/.test(text) ||
      suggestedModules.includes('gauge')) &&
    !wantsBar;
  const wantsGrid =
    /\bgrid\b|\btiles?\b|\bmatrix\b/.test(text) ||
    (/\bshow\s+\d+\b/.test(text) && resolvedDomains.includes('light') && !wantsDetails && !wantsButtons);

  const detailAttributes: string[] = [];
  if (/\bbrightness\b|\bbright\b/.test(text)) detailAttributes.push('brightness');
  if (/\bcolor\b|\bcolour\b/.test(text)) detailAttributes.push('rgb_color');
  if (/\btemperature\b|\btemp\b/.test(text) && resolvedDomains.includes('weather')) {
    detailAttributes.push('temperature');
  }

  let kind: SmartSectionKind = 'list';
  let recipe: SmartLayoutRecipe = 'entityList';

  if (
    resolvedDomains.includes('weather') &&
    (/\bicon\b|\btemp\b|\btemperature\b|\bheader\b|\bon top\b|\btop\b/.test(text) ||
      detailAttributes.includes('temperature'))
  ) {
    kind = 'header';
    recipe = 'header';
  } else if (wantsBar) {
    kind = 'details';
    recipe = 'barModule';
    if (!resolvedDomains.includes('sensor')) resolvedDomains.push('sensor');
  } else if (wantsGauge || (/\bcar\b|\bvehicle\b|\bautomobile\b/.test(text) && /\bfuel\b|\btank\b/.test(text))) {
    kind = 'details';
    recipe = 'gaugeModule';
    if (!resolvedDomains.includes('sensor')) resolvedDomains.push('sensor');
  } else if (wantsGrid || (resolvedDomains.includes('light') && entityLimit && !wantsDetails && !wantsButtons)) {
    kind = 'grid';
    recipe = 'entityGrid';
  } else if (
    resolvedDomains.includes('light') &&
    /\bshow\b.*\blights?\b/.test(text) &&
    !wantsDetails &&
    !wantsButtons &&
    !wantsList
  ) {
    kind = 'grid';
    recipe = 'entityGrid';
  } else if (
    wantsButtons ||
    (resolvedDomains.some(domain =>
      ['light', 'lock', 'fan', 'cover', 'media_player', 'climate'].includes(domain)
    ) &&
      /\bcontrols?\b|\bon\/off\b|\bon and off\b|\bbuttons?\b/.test(text))
  ) {
    kind = 'control';
    recipe = 'controlList';
  } else if (
    resolvedDomains.length >= 1 &&
    resolvedDomains.every(domain =>
      ['lock', 'fan', 'cover', 'climate', 'media_player'].includes(domain)
    ) &&
    !wantsList &&
    !wantsGrid &&
    !wantsButtons
  ) {
    kind = 'control';
    recipe = 'domainModule';
  } else if (wantsDetails || wantsList) {
    kind = wantsDetails ? 'details' : 'status';
    recipe = 'entityList';
  }

  if (!detailAttributes.length && wantsDetails && resolvedDomains.includes('light')) {
    if (/\bbrightness\b|\bbright\b/.test(text)) detailAttributes.push('brightness');
    if (/\bcolor\b|\bcolour\b/.test(text)) detailAttributes.push('rgb_color');
  }

  return {
    id,
    kind,
    recipe,
    domains: resolvedDomains,
    entities: [],
    wantsButtons,
    wantsDetails: wantsDetails || detailAttributes.length > 0,
    wantsLargeText,
    layoutPreference: wantsGrid ? 'grid' : wantsSideBySide ? 'horizontal' : 'vertical',
    ...(entityLimit ? { entityLimit } : {}),
    detailAttributes,
  };
}

function resolveForcedModuleType(
  sectionText: string,
  forcedDomains?: string[],
  tier: 'free' | 'pro' = 'pro'
): string | undefined {
  if (forcedDomains?.length) {
    const text = sectionText.toLowerCase();
    if (/\bclock\b/.test(text)) {
      return resolveClockModuleType(tier, sectionText);
    }
    return undefined;
  }

  const text = sectionText.toLowerCase();
  const domains = inferEntityDomainsFromPrompt(sectionText);
  const isMultiEntityControlPrompt =
    domains.length > 1 &&
    (/\bbeside\b|\bnext to\b|\bside by side\b|\bone row\b|\bsame row\b/.test(text) ||
      (/\bcontrols?\b/.test(text) && /\band\b/.test(text)));

  if (isMultiEntityControlPrompt) return undefined;

  const forced = getForcedModuleTypeFromPrompt(sectionText, tier);

  // Header-style weather prompts ("weather icon and temp on top") keep the dedicated
  // header recipe (icon + large temperature) instead of the basic weather module.
  if (
    forced === 'weather' &&
    /\bicon\b|\btemp\b|\btemperature\b|\bheader\b|\bon top\b|\btop\b/.test(text)
  ) {
    return undefined;
  }

  return forced;
}

function parseEntityLimit(sectionText: string): number | undefined {
  const lightMatch = sectionText.match(/\b(\d+)\s+lights?\b/i);
  if (lightMatch) return Number(lightMatch[1]);
  const genericMatch = sectionText.match(/\bshow\s+(\d+)\b/i);
  if (genericMatch) return Number(genericMatch[1]);
  return undefined;
}

function assignEntitiesToSections(
  sections: SmartCompositionSection[],
  inventory: SmartEntityRef[],
  prompt: string,
  tier: 'free' | 'pro' = 'pro'
): void {
  const usedEntityIds = new Set<string>();

  for (const section of sections) {
    const domainFilter = resolveSectionDomains(section);
    let candidates = inventory.filter(entity => domainFilter.includes(entity.domain));

    if (section.recipe === 'entityGrid' && !candidates.length) {
      candidates = inventory.filter(
        entity => entity.domain === 'sensor' || entity.domain === 'binary_sensor'
      );
    }

    if (section.recipe === 'header' && section.domains.includes('weather')) {
      candidates = candidates.filter(entity => entity.domain === 'weather').slice(0, 1);
    }

    if (section.recipe === 'gaugeModule') {
      section.entities = findGaugeEntities(inventory, prompt, section);
      section.entities.forEach(entity => usedEntityIds.add(entity.entityId));
      continue;
    }

    if (section.recipe === 'barModule') {
      section.entities = findBarEntities(inventory, prompt, section);
      section.entities.forEach(entity => usedEntityIds.add(entity.entityId));
      continue;
    }

    if (section.recipe === 'moduleRow' && section.domains.includes('weather')) {
      const weatherCandidates = inventory
        .filter(entity => entity.domain === 'weather')
        .map(entity => ({ entity, score: scoreEntityForPrompt(entity, prompt) }))
        .sort((a, b) => b.score - a.score);
      const bestWeather = weatherCandidates[0]?.entity;
      section.entities = bestWeather ? [bestWeather] : [];
      if (bestWeather) usedEntityIds.add(bestWeather.entityId);
      continue;
    }

    if (section.recipe === 'singleModule' && section.forcedModuleType) {
      const spec = getSmartModuleSpec(section.forcedModuleType);
      if (spec) {
        const entity = findBestEntityForModuleSpec(inventory, spec, `${prompt} ${sectionTextFromSection(section)}`, usedEntityIds);
        section.entities = entity ? [entity] : [];
        if (entity) usedEntityIds.add(entity.entityId);
      }
      continue;
    }

    const entityLimit =
      section.entityLimit ??
      (section.recipe === 'entityGrid' ? 12 : section.domains.includes('light') ? 8 : 8);

    section.entities = candidates
      .filter(entity => !usedEntityIds.has(entity.entityId))
      .map(entity => ({ entity, score: scoreEntityForPrompt(entity, prompt) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, entityLimit)
      .map(item => item.entity);

    if (section.recipe !== 'entityGrid') {
      section.entities.forEach(entity => usedEntityIds.add(entity.entityId));
    }
  }

  if (!sections.some(section => sectionHasContent(section)) && inventory.length) {
    const inferredDomains = inferEntityDomainsFromPrompt(prompt);
    if (inferredDomains.length) {
      const fallback = buildSectionFromText('section-fallback', prompt, prompt, inferredDomains, tier);
      fallback.entities = inventory
        .filter(entity => inferredDomains.includes(entity.domain))
        .map(entity => ({ entity, score: scoreEntityForPrompt(entity, prompt) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(item => item.entity);
      if (fallback.entities.length) {
        sections.splice(0, sections.length, fallback);
      }
    }
  }
}

function getEntityInventory(hass: SmartCompositionHass): SmartEntityRef[] {
  return Object.entries(hass.states || {})
    .filter(
      ([entityId]) =>
        entityId.includes('.') &&
        !entityId.startsWith('conversation.') &&
        !entityId.startsWith('ai_task.')
    )
    .map(([entityId, state]) => {
      const attrs =
        state && typeof state === 'object' && 'attributes' in state
          ? ((state as { attributes?: Record<string, unknown> }).attributes || {})
          : {};
      return {
        entityId,
        name: resolveEntityName(hass, entityId, state),
        domain: entityId.split('.')[0],
        deviceClass: attrs.device_class ? String(attrs.device_class) : undefined,
        unit: attrs.unit_of_measurement ? String(attrs.unit_of_measurement) : undefined,
      };
    });
}

function findBarEntities(
  inventory: SmartEntityRef[],
  prompt: string,
  section: SmartCompositionSection
): SmartEntityRef[] {
  const barSpec = getSmartModuleSpec('bar');
  if (!barSpec) return findGaugeEntities(inventory, prompt, section);
  const entity = findBestEntityForModuleSpec(inventory, barSpec, prompt);
  return entity ? [entity] : findGaugeEntities(inventory, prompt, section);
}

function sectionTextFromSection(section: SmartCompositionSection): string {
  return `${section.domains.join(' ')} ${section.forcedModuleType || ''}`;
}

function findGaugeEntities(
  inventory: SmartEntityRef[],
  prompt: string,
  section: SmartCompositionSection
): SmartEntityRef[] {
  const context = `${prompt} ${section.domains.join(' ')}`.toLowerCase();
  const scored = inventory
    .filter(entity => entity.domain === 'sensor')
    .map(entity => ({
      entity,
      score: scoreGaugeCandidate(entity, context),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) return [scored[0].entity];

  const fallback = inventory.find(entity => entity.domain === 'sensor');
  return fallback ? [fallback] : [];
}

function scoreGaugeCandidate(entity: SmartEntityRef, context: string): number {
  const haystack = `${entity.entityId} ${entity.name} ${entity.deviceClass || ''}`.toLowerCase();
  let score = 0;
  if (/\bfuel\b|\bgas\b|\btank\b/.test(haystack)) score += 20;
  if (entity.deviceClass === 'fuel') score += 25;
  if (entity.unit === '%') score += 5;
  if (/\bcar\b|\bvehicle\b|\bautomobile\b/.test(context) && /\bfuel\b|\bgauge\b|\btank\b/.test(context)) {
    if (/\bcar\b|\bvehicle\b|\bfuel\b|\btank\b/.test(haystack)) score += 10;
  }
  if (/\bgauge\b|\bfuel left\b|\bfuel level\b/.test(context) && entity.domain === 'sensor') score += 3;
  return score;
}

function resolveEntityName(hass: SmartCompositionHass, entityId: string, state?: unknown): string {
  const stateObj = state ?? hass.states?.[entityId];
  const attrs =
    stateObj && typeof stateObj === 'object' && 'attributes' in stateObj
      ? ((stateObj as { attributes?: Record<string, unknown> }).attributes || {})
      : {};
  if (attrs.friendly_name) return String(attrs.friendly_name);
  const objectId = entityId.split('.')[1] || entityId;
  return objectId
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveSectionDomains(section: SmartCompositionSection): string[] {
  if (section.recipe === 'entityGrid' && section.domains.includes('sensor')) {
    return Array.from(new Set([...section.domains, 'binary_sensor']));
  }
  return section.domains;
}

export function getCompositionCatalogLines(): string[] {
  return [
    '- moduleRow: horizontal row of explicit modules such as clock beside weather',
    '- header: horizontal(icon + info) for weather or summary headers; use info.text_size for large temperature text',
    '- entityList: vertical list of horizontal(icon + info) status rows',
    '- controlList: vertical list of domain controls or icon + button rows (or horizontal when prompt says beside/side-by-side)',
    '- entityGrid: grid module for multiple entities such as "show 4 lights"',
    '- gaugeModule: gauge module for fuel level, tank, or numeric sensor readouts',
    '- barModule: bar/progress module for fuel level, battery, or percentage sensors',
    '- singleModule: explicit module type named in the prompt (clock, bar, calendar, qr_code, etc.)',
    '- domainModule: single full domain module such as lock or fan',
    '- mixedSections: vertical stack of multiple sections from the prompt order',
  ];
}
