/**
 * Smart entity context: a registry-aware, relevance-ranked view of `hass.states`.
 *
 * The frontend exposes the area / device / entity registries synchronously on
 * `hass` (`hass.areas`, `hass.devices`, `hass.entities`) on reasonably recent
 * cores. When present we use them to know which room an entity lives in and to
 * filter out config/diagnostic noise; when absent (older cores, unit tests) we
 * degrade to a states-only view so the Smart builder still works.
 */

export type SmartEntityRecord = {
  entityId: string;
  name: string;
  domain: string;
  objectId: string;
  deviceClass?: string | undefined;
  unit?: string | undefined;
  state: string;
  /** false when state is `unavailable` / `unknown` or missing. */
  available: boolean;
  areaId?: string | undefined;
  areaName?: string | undefined;
  deviceName?: string | undefined;
  /** Registry entity_category is `config` or `diagnostic`. */
  isDiagnostic: boolean;
  isHidden: boolean;
  /** Group-style entity that wraps other entities (e.g. a light group). */
  isGroup: boolean;
};

export type SmartAreaRecord = { areaId: string; name: string };

export type SmartEntityContext = {
  entities: SmartEntityRecord[];
  areas: SmartAreaRecord[];
  /** True when the registries were available and area data is trustworthy. */
  hasRegistry: boolean;
};

export type SmartEntityTarget = {
  domain: string;
  /** Optional device_class filter (matched against attributes.device_class or name tokens). */
  deviceClasses?: string[] | undefined;
};

type StateLike = { state?: unknown; attributes?: Record<string, unknown> };

type RegistryHass = {
  states?: Record<string, unknown>;
  areas?: Record<string, { area_id?: string; name?: string | null }> | undefined;
  devices?: Record<string, { id?: string; area_id?: string | null; name?: string | null; name_by_user?: string | null }> | undefined;
  entities?: Record<
    string,
    {
      entity_id?: string;
      device_id?: string | null;
      area_id?: string | null;
      entity_category?: string | null;
      hidden?: boolean;
      hidden_by?: string | null;
      disabled_by?: string | null;
    }
  > | undefined;
};

const EXCLUDED_DOMAINS = new Set([
  'conversation',
  'ai_task',
  'tts',
  'stt',
  'persistent_notification',
  'zone',
  'sun',
  'update',
  'event',
  'tag',
  'assist_satellite',
]);

/** Prompt words that never help identify a specific entity. */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'then', 'show', 'showing', 'card', 'make', 'build',
  'create', 'add', 'display', 'please', 'want', 'need', 'give', 'below', 'above', 'under', 'next',
  'beside', 'top', 'bottom', 'left', 'right', 'row', 'rows', 'list', 'grid', 'section', 'sections',
  'module', 'modules', 'style', 'modern', 'clean', 'minimal', 'dense', 'bold', 'large', 'small',
  'big', 'text', 'size', 'icon', 'icons', 'status', 'state', 'controls', 'control', 'buttons',
  'button', 'toggle', 'all', 'only', 'some', 'each', 'every', 'from', 'into', 'onto', 'using',
  'use', 'have', 'has', 'are', 'was', 'can', 'should', 'would', 'like', 'also', 'plus', 'card',
  'dashboard', 'overview', 'summary', 'house', 'home', 'room', 'rooms', 'area', 'areas',
  'off', 'nice', 'layout', 'side', 'stacked', 'vertical', 'horizontal', 'compact', 'readings',
  'reading', 'level', 'levels', 'usage', 'monitor', 'panel', 'info', 'details', 'detail', 'quick',
  'simple', 'basic', 'view', 'page', 'tile', 'tiles', 'chart', 'graph', 'history', 'current',
  'value', 'values', 'first', 'second', 'third', 'few', 'couple', 'several', 'many', 'useful',
  'pretty', 'good', 'great', 'best', 'favourite', 'favorite', 'important', 'just', 'really',
  'very', 'quite', 'them', 'they', 'its', 'their', 'there', 'here', 'where', 'what', 'which',
  'who', 'when', 'about', 'around', 'conditions',
  // Domain nouns: matching these against entity ids would boost every entity of the domain equally.
  'light', 'lights', 'lamp', 'lamps', 'bulb', 'bulbs', 'switch', 'switches', 'plug', 'plugs',
  'outlet', 'outlets', 'sensor', 'sensors', 'lock', 'locks', 'door', 'doors', 'window', 'windows',
  'cover', 'covers', 'blind', 'blinds', 'shade', 'shades', 'fan', 'fans', 'climate', 'thermostat',
  'thermostats', 'media', 'player', 'players', 'speaker', 'speakers', 'weather', 'forecast',
  'temperature', 'temp', 'humidity', 'battery', 'batteries', 'power', 'energy', 'motion', 'camera',
  'cameras', 'vacuum', 'person', 'people', 'scene', 'scenes', 'script', 'scripts', 'automation',
  'automations', 'alarm', 'calendar', 'todo', 'clock', 'gauge', 'bar', 'entity', 'entities',
]);

function domainOf(entityId: string): string {
  return entityId.includes('.') ? entityId.split('.')[0] : '';
}

function labelFromObjectId(objectId: string): string {
  return objectId
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildSmartEntityContext(hass: RegistryHass | null | undefined): SmartEntityContext {
  const states = (hass?.states || {}) as Record<string, StateLike>;
  const registryEntities = hass?.entities && typeof hass.entities === 'object' ? hass.entities : null;
  const registryDevices = hass?.devices && typeof hass.devices === 'object' ? hass.devices : null;
  const registryAreas = hass?.areas && typeof hass.areas === 'object' ? hass.areas : null;
  const hasRegistry = Boolean(registryEntities && registryAreas);

  const areas: SmartAreaRecord[] = registryAreas
    ? Object.entries(registryAreas)
        .map(([key, area]) => ({ areaId: area?.area_id || key, name: String(area?.name || key) }))
        .filter(area => area.areaId)
    : [];
  const areaNameById = new Map(areas.map(area => [area.areaId, area.name]));

  const entities: SmartEntityRecord[] = [];
  for (const [entityId, rawState] of Object.entries(states)) {
    const domain = domainOf(entityId);
    if (!domain || EXCLUDED_DOMAINS.has(domain)) continue;

    const stateObj = (rawState && typeof rawState === 'object' ? rawState : {}) as StateLike;
    const attrs = (stateObj.attributes || {}) as Record<string, unknown>;
    const registry = registryEntities?.[entityId];
    if (registry?.disabled_by) continue;

    const device = registry?.device_id && registryDevices ? registryDevices[registry.device_id] : undefined;
    const areaId = registry?.area_id || device?.area_id || undefined;
    const state = stateObj.state === undefined || stateObj.state === null ? '' : String(stateObj.state);
    const objectId = entityId.split('.')[1] || entityId;

    entities.push({
      entityId,
      name: String(attrs.friendly_name || labelFromObjectId(objectId)),
      domain,
      objectId,
      deviceClass: attrs.device_class ? String(attrs.device_class) : undefined,
      unit: attrs.unit_of_measurement ? String(attrs.unit_of_measurement) : undefined,
      state,
      available: state !== '' && state !== 'unavailable' && state !== 'unknown',
      areaId: areaId || undefined,
      areaName: areaId ? areaNameById.get(areaId) : undefined,
      deviceName: device ? String(device.name_by_user || device.name || '') || undefined : undefined,
      isDiagnostic: Boolean(registry?.entity_category),
      isHidden: Boolean(registry?.hidden || registry?.hidden_by),
      isGroup: Array.isArray(attrs.entity_id) && attrs.entity_id.length > 0,
    });
  }

  return { entities, areas, hasRegistry };
}

/** Normalize for fuzzy comparisons: lowercase, alphanumerics and single spaces only. */
function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_\-./]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function promptTokens(prompt: string): string[] {
  const seen = new Set<string>();
  for (const token of normalizeText(prompt).split(' ')) {
    if (token.length < 3 || STOPWORDS.has(token)) continue;
    seen.add(token);
    // Naive singular so "bedrooms" still matches "Bedroom".
    if (token.endsWith('s') && token.length > 4) seen.add(token.slice(0, -1));
  }
  return Array.from(seen);
}

/**
 * Area names (or the object-id form of them) mentioned in the prompt, longest first so
 * "Master Bedroom" wins over "Bedroom".
 */
export function extractAreaHints(prompt: string, areas: SmartAreaRecord[]): SmartAreaRecord[] {
  const text = ` ${normalizeText(prompt)} `;
  if (!text.trim()) return [];
  return areas
    .filter(area => {
      const name = normalizeText(area.name);
      const id = normalizeText(area.areaId);
      return (name.length >= 3 && text.includes(` ${name} `)) || (id.length >= 3 && text.includes(` ${id} `));
    })
    .sort((a, b) => b.name.length - a.name.length);
}

export type SmartEntityScoreOptions = {
  tokens: string[];
  areaHints: SmartAreaRecord[];
  hasRegistry: boolean;
};

/**
 * Whole-word match so "off" does not hit "Office" and "front" still hits "front_door".
 * A token may also be the stem of a longer word ("kettle" → "kettles").
 */
export function haystackHasToken(haystack: string, token: string): boolean {
  return haystack.split(' ').some(word => word === token || (token.length >= 4 && word.startsWith(token)));
}

export function scoreSmartEntity(entity: SmartEntityRecord, options: SmartEntityScoreOptions): number {
  const haystack = normalizeText(`${entity.entityId} ${entity.name} ${entity.deviceName || ''}`);
  let score = 0;

  for (const token of options.tokens) {
    if (haystackHasToken(haystack, token)) score += 12;
  }

  if (options.areaHints.length) {
    const inHintedArea = entity.areaId && options.areaHints.some(area => area.areaId === entity.areaId);
    const nameMentionsArea = options.areaHints.some(area => haystack.includes(normalizeText(area.name)));
    if (inHintedArea) score += 40;
    else if (nameMentionsArea) score += 30;
    else if (entity.areaId && options.hasRegistry) score -= 25;
    else if (options.hasRegistry) score -= 8;
  }

  if (entity.isDiagnostic) score -= 30;
  if (entity.isHidden) score -= 15;
  if (!entity.available) score -= 20;
  if (entity.isGroup) score -= 4;
  if (entity.areaId) score += 2;

  return score;
}

export function entityMatchesTarget(entity: SmartEntityRecord, target: SmartEntityTarget): boolean {
  if (entity.domain !== target.domain) return false;
  if (!target.deviceClasses?.length) return true;
  if (entity.deviceClass && target.deviceClasses.includes(entity.deviceClass)) return true;
  const haystack = normalizeText(`${entity.entityId} ${entity.name}`);
  return target.deviceClasses.some(deviceClass => haystack.includes(normalizeText(deviceClass)));
}

export function entityMatchesAnyTarget(entity: SmartEntityRecord, targets: SmartEntityTarget[]): boolean {
  return targets.some(target => entityMatchesTarget(entity, target));
}

export type RankSmartEntitiesOptions = {
  targets?: SmartEntityTarget[] | undefined;
  exclude?: Set<string> | undefined;
  /** Drop diagnostic/hidden/unavailable entities when enough good candidates remain. */
  preferClean?: boolean | undefined;
  limit?: number | undefined;
};

export type RankedSmartEntity = { entity: SmartEntityRecord; score: number };

/**
 * Rank entities for a prompt. Sorting is stable so equal scores keep inventory order,
 * which keeps deterministic output for prompts without distinguishing words.
 */
export function rankSmartEntities(
  context: SmartEntityContext,
  prompt: string,
  options: RankSmartEntitiesOptions = {}
): RankedSmartEntity[] {
  const areaHints = extractAreaHints(prompt, context.areas);
  // Area words are handled by the area logic below; keeping them as name tokens would
  // double-count and would narrow "kitchen lights" to lights literally named "kitchen".
  const areaWords = new Set(areaHints.flatMap(area => normalizeText(area.name).split(' ')));
  const tokens = promptTokens(prompt).filter(token => !areaWords.has(token));
  const scoreOptions: SmartEntityScoreOptions = { tokens, areaHints, hasRegistry: context.hasRegistry };

  let candidates = context.entities.filter(entity => !options.exclude?.has(entity.entityId));
  if (options.targets?.length) {
    candidates = candidates.filter(entity => entityMatchesAnyTarget(entity, options.targets as SmartEntityTarget[]));
  }

  if (options.preferClean !== false) {
    const clean = candidates.filter(entity => !entity.isDiagnostic && !entity.isHidden && entity.available);
    if (clean.length) candidates = clean;
  }

  let ranked = candidates
    .map(entity => ({ entity, score: scoreSmartEntity(entity, scoreOptions) }))
    .sort((a, b) => b.score - a.score);

  const haystackFor = (entity: SmartEntityRecord): string =>
    normalizeText(`${entity.entityId} ${entity.name} ${entity.deviceName || ''}`);

  // When the prompt names a room, entities outside that room are only fillers. Drop them
  // per domain whenever the room itself has that kind of entity, so "living room lights and
  // the front door lock" keeps the (hallway) lock while narrowing lights to the living room.
  if (areaHints.length) {
    const isInArea = (entity: SmartEntityRecord): boolean =>
      (!!entity.areaId && areaHints.some(area => area.areaId === entity.areaId)) ||
      areaHints.some(area => haystackFor(entity).includes(normalizeText(area.name)));
    ranked = narrowPerDomain(ranked, isInArea);
  }

  // When the prompt names a specific thing ("front door", "kettle"), entities of the same
  // domain that match none of those words are fillers too.
  if (tokens.length) {
    const mentionsToken = (entity: SmartEntityRecord): boolean => {
      const haystack = haystackFor(entity);
      return tokens.some(token => haystackHasToken(haystack, token));
    };
    ranked = narrowPerDomain(ranked, mentionsToken);
  }

  return options.limit ? ranked.slice(0, options.limit) : ranked;
}

/** Keep only matching entities in every domain that has at least one match; leave other domains intact. */
function narrowPerDomain(
  ranked: RankedSmartEntity[],
  matches: (entity: SmartEntityRecord) => boolean
): RankedSmartEntity[] {
  const domainsWithMatch = new Set(ranked.filter(item => matches(item.entity)).map(item => item.entity.domain));
  if (!domainsWithMatch.size) return ranked;
  return ranked.filter(item => !domainsWithMatch.has(item.entity.domain) || matches(item.entity));
}

/** Display label for an area mention, e.g. "Living Room". Empty when no area is mentioned. */
export function areaLabelForPrompt(prompt: string, context: SmartEntityContext): string {
  return extractAreaHints(prompt, context.areas)[0]?.name || '';
}
