import {
  inferEntityDomainsFromPrompt,
  inferEntityTargetsFromPrompt,
  relatedEntityTargets,
  suggestSmartModuleTypesForPrompt,
  type SmartEntityTarget,
} from './uc-smart-module-capabilities';
import {
  findBestEntityForModuleSpec,
  findEntitiesForModuleSpec,
  getForcedModuleTypeFromPrompt,
  getSmartModuleSpec,
  MULTI_ENTITY_MODULE_TYPES,
} from './smart/uc-smart-module-registry';
import {
  buildSmartEntityContext,
  rankSmartEntities,
  type SmartEntityContext,
  type SmartEntityRecord,
} from './smart/uc-smart-entity-context';

export type SmartCompositionHass = {
  states?: Record<string, unknown>;
};

export type SmartEntityRef = {
  entityId: string;
  name: string;
  domain: string;
  deviceClass?: string | undefined;
  unit?: string | undefined;
  areaName?: string | undefined;
};

/** Domains that have a dedicated full-width Ultra Card module worth using on their own. */
export const DOMAIN_MODULE_DOMAINS = [
  'lock',
  'fan',
  'cover',
  'climate',
  'media_player',
  'vacuum',
  'camera',
  'humidifier',
  'alarm_control_panel',
  'person',
  'device_tracker',
  'calendar',
  'todo',
  'water_heater',
  'scene',
  'script',
];

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
  /** Domain + device-class targets the section asked for (drives entity filtering). */
  targets?: SmartEntityTarget[] | undefined;
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
  const context = buildSmartEntityContext(hass);
  const mixedSections = parseMixedModulePrompt(prompt, tier);
  const sectionTexts = splitPromptIntoSections(prompt);
  const sections =
    mixedSections ||
    (sectionTexts.length > 1
      ? sectionTexts.map((text, index) => buildSectionFromText(`section-${index}`, text, prompt, undefined, tier))
      : expandMultiDomainSinglePrompt(prompt, tier) ||
        [buildSectionFromText('section-0', prompt, prompt, undefined, tier)]);

  assignEntitiesToSections(sections, context, prompt, tier);

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
    washer: /\b(washer|washing\s*machine)s?\b[^.;,]*/i,
    dryer: /\b(dryer|tumble\s*dryer)s?\b[^.;,]*/i,
    dishwasher: /\b(dishwasher|dish\s*washer)s?\b[^.;,]*/i,
    fridge: /\b(fridge|refrigerator|freezer)s?\b[^.;,]*/i,
    range: /\b(oven|stove|cooktop|kitchen\s*range)s?\b[^.;,]*/i,
    cover: /\b(covers?|garage|shades?|blinds?|shutters?|curtains?)\b[^.;,]*/i,
    climate: /\b(climate|thermostats?|hvac|heating|cooling)\b[^.;,]*/i,
    media_player: /\b(media|music|speakers?|tv|television|sonos)\b[^.;,]*/i,
    sensor: /\b(sensors?|temperatures?|temp|humidity|battery|batteries|power|energy|fuel)\b[^.;,]*/i,
    switch: /\b(switch(?:es)?|plugs?|outlets?|sockets?)\b[^.;,]*/i,
    binary_sensor: /\b(doors?|windows?|motion|occupancy|smoke|leaks?|contact sensors?)\b[^.;,]*/i,
    vacuum: /\b(vacuums?|roomba)\b[^.;,]*/i,
    camera: /\b(cameras?|cctv|doorbell)\b[^.;,]*/i,
    person:
      /\b(who(?:'s| is| are)\s+(?:at\s+)?home|who(?:'s| is)\s+away|(?:whether\s+|if\s+)?anyone(?:'s| is)?\s+(?:at\s+)?home|home occupancy|presence|people|persons?|family|household|everyone|everybody)\b[^.;,]*/i,
    alarm_control_panel: /\b(alarm|security system)\b[^.;,]*/i,
    humidifier: /\b(humidifiers?|dehumidifiers?)\b[^.;,]*/i,
    water_heater: /\b(water heaters?|boiler|hot water)\b[^.;,]*/i,
    calendar: /\b(calendar|events?|agenda)\b[^.;,]*/i,
    todo: /\b(to-?do|shopping list|tasks?|chores)\b[^.;,]*/i,
    scene: /\bscenes?\b[^.;,]*/i,
    script: /\bscripts?\b[^.;,]*/i,
    automation: /\bautomations?\b[^.;,]*/i,
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
  const inferredTargets = inferEntityTargetsFromPrompt(sectionText);
  const targets: SmartEntityTarget[] = forcedSpec?.entityDomains.filter(domain => domain !== '*').length
    ? forcedSpec.entityDomains.filter(domain => domain !== '*').map(domain => ({ domain }))
    : forcedDomains?.length
      ? forcedDomains.map(domain => {
          // Keep device-class hints from the section text when they agree with the forced domain.
          const inferred = inferredTargets.find(target => target.domain === domain);
          return inferred ? { ...inferred } : { domain };
        })
      : inferredTargets;
  const domains = Array.from(new Set(targets.map(target => target.domain)));
  const resolvedDomains = [...domains];
  if (/\bgrid\b/.test(text) && !resolvedDomains.length) {
    resolvedDomains.push('sensor');
    targets.push({ domain: 'sensor' });
  }

  if (forcedModuleType && forcedSpec?.defaultBuilder) {
    return {
      id,
      kind: 'details',
      recipe: 'singleModule',
      domains: resolvedDomains.length ? resolvedDomains : forcedSpec.entityDomains,
      targets,
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
      ['light', 'lock', 'fan', 'cover', 'media_player', 'climate', 'switch', 'scene', 'script'].includes(domain)
    ) &&
      /\bcontrols?\b|\bon\/off\b|\bon and off\b|\bbuttons?\b/.test(text))
  ) {
    kind = 'control';
    recipe = 'controlList';
  } else if (
    resolvedDomains.length >= 1 &&
    resolvedDomains.every(domain => DOMAIN_MODULE_DOMAINS.includes(domain)) &&
    !wantsList &&
    !wantsGrid &&
    !wantsButtons
  ) {
    kind = 'control';
    recipe = 'domainModule';
  } else if (
    resolvedDomains.length === 1 &&
    ['light', 'switch', 'automation'].includes(resolvedDomains[0]) &&
    !wantsList &&
    !wantsGrid &&
    !wantsDetails
  ) {
    // "kitchen lights" / "plugs" / "automations" are things you switch: a control row beats a status row.
    kind = 'control';
    recipe = 'controlList';
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
    targets,
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

/** Targets a section should pull entities from, including the weather header special case. */
function resolveSectionTargets(section: SmartCompositionSection): SmartEntityTarget[] {
  const base: SmartEntityTarget[] = section.targets?.length
    ? section.targets
    : section.domains.map(domain => ({ domain }));
  if (section.recipe === 'entityGrid' && section.domains.includes('sensor')) {
    return base.some(target => target.domain === 'binary_sensor')
      ? base
      : [...base, { domain: 'binary_sensor' }];
  }
  return base;
}

/**
 * Ranked candidates for a section. Falls back to related domains (door sensor -> lock,
 * person -> device_tracker) so a prompt still produces something on homes that model
 * the concept differently.
 */
function rankSectionCandidates(
  context: SmartEntityContext,
  section: SmartCompositionSection,
  prompt: string,
  usedEntityIds: Set<string>
): SmartEntityRecord[] {
  const targets = resolveSectionTargets(section);
  if (!targets.length) return [];
  const primary = rankSmartEntities(context, prompt, { targets, exclude: usedEntityIds }).map(item => item.entity);
  if (primary.length) return primary;

  // Relax device-class filters before jumping to related domains: "door sensors" on a
  // home whose contact sensors have no device_class should still find them by domain.
  const relaxed = targets.filter(target => target.deviceClasses?.length).map(target => ({ domain: target.domain }));
  if (relaxed.length) {
    const byDomain = rankSmartEntities(context, prompt, { targets: relaxed, exclude: usedEntityIds }).map(item => item.entity);
    if (byDomain.length) return byDomain;
  }

  const related = targets.flatMap(relatedEntityTargets);
  if (!related.length) return [];
  return rankSmartEntities(context, prompt, { targets: related, exclude: usedEntityIds }).map(item => item.entity);
}

function assignEntitiesToSections(
  sections: SmartCompositionSection[],
  context: SmartEntityContext,
  prompt: string,
  tier: 'free' | 'pro' = 'pro'
): void {
  const usedEntityIds = new Set<string>();
  const inventory = context.entities;

  for (const section of sections) {
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

    if (
      (section.recipe === 'moduleRow' || section.recipe === 'header') &&
      section.domains.includes('weather')
    ) {
      const bestWeather = rankSmartEntities(context, prompt, {
        targets: [{ domain: 'weather' }],
        limit: 1,
      })[0]?.entity;
      section.entities = bestWeather ? [bestWeather] : [];
      if (bestWeather) usedEntityIds.add(bestWeather.entityId);
      continue;
    }

    if (section.recipe === 'singleModule' && section.forcedModuleType) {
      const spec = getSmartModuleSpec(section.forcedModuleType);
      if (spec) {
        const specPrompt = `${prompt} ${sectionTextFromSection(section)}`;
        if (MULTI_ENTITY_MODULE_TYPES.has(spec.type)) {
          section.entities = findEntitiesForModuleSpec(inventory, spec, specPrompt, usedEntityIds);
        } else {
          const entity = findBestEntityForModuleSpec(inventory, spec, specPrompt, usedEntityIds);
          section.entities = entity ? [entity] : [];
        }
        section.entities.forEach(entity => usedEntityIds.add(entity.entityId));
      }
      continue;
    }

    let candidates = rankSectionCandidates(context, section, prompt, usedEntityIds);

    if (section.recipe === 'entityGrid' && !candidates.length) {
      candidates = rankSmartEntities(context, prompt, {
        targets: [{ domain: 'sensor' }, { domain: 'binary_sensor' }],
      }).map(item => item.entity);
    }

    if (section.recipe === 'header') {
      candidates = candidates.slice(0, 1);
    }

    const entityLimit =
      section.entityLimit ??
      (section.recipe === 'entityGrid' ? 12 : section.recipe === 'domainModule' ? 6 : 8);

    section.entities = candidates.slice(0, entityLimit);

    if (section.recipe !== 'entityGrid') {
      section.entities.forEach(entity => usedEntityIds.add(entity.entityId));
    }
  }

  if (!sections.some(section => sectionHasContent(section)) && inventory.length) {
    const inferredTargets = inferEntityTargetsFromPrompt(prompt);
    const inferredDomains = Array.from(new Set(inferredTargets.map(target => target.domain)));
    if (inferredDomains.length) {
      const fallback = buildSectionFromText('section-fallback', prompt, prompt, inferredDomains, tier);
      fallback.entities = rankSmartEntities(context, prompt, { targets: inferredTargets, limit: 8 }).map(
        item => item.entity
      );
      if (!fallback.entities.length) {
        fallback.entities = rankSmartEntities(context, prompt, {
          targets: inferredTargets.flatMap(relatedEntityTargets),
          limit: 8,
        }).map(item => item.entity);
      }
      if (fallback.entities.length) {
        sections.splice(0, sections.length, fallback);
      }
    } else {
      // No domain word at all ("kettle", "the roomba"): fall back to entities whose names match
      // the prompt, and let their domain pick the recipe.
      // A name-token hit scores 12 and an area hit 40; the small "has an area" bonus alone must not count.
      const named = rankSmartEntities(context, prompt, { limit: 6 }).filter(item => item.score >= 10);
      if (named.length) {
        const domains = Array.from(new Set(named.map(item => item.entity.domain)));
        const fallback = buildSectionFromText('section-fallback', prompt, prompt, domains, tier);
        fallback.entities = named.map(item => item.entity);
        sections.splice(0, sections.length, fallback);
      }
    }
  }
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
