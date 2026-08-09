/**
 * The catalog of native Home Assistant cards, discovered from the running HA.
 *
 * HA gives custom cards no way to enumerate its own cards. The list its picker
 * renders (`coreCards` in `panels/lovelace/editor/lovelace-cards.ts`) is not
 * re-exported by `window.loadCardHelpers()`, and `hass` carries no `resources`
 * map, so the translation keys cannot be read off the object either.
 *
 * What HA does ship alongside every card, in the same release bundle, is the
 * editor translation pair its own picker labels cards with:
 *
 *   ui.panel.lovelace.editor.card.<yaml type>.name
 *   ui.panel.lovelace.editor.card.<yaml type>.description
 *
 * In HA 2026.x every one of the 37 core and 20 energy card types has that pair
 * and only two non-card keys (`generic`, `empty_state`) share the namespace, so
 * the key set stands in faithfully for the card set. Discovery therefore reads
 * the lovelace translation fragment and derives the catalog from it, which also
 * yields HA's own labels in the user's own language.
 *
 * Everything degrades to CURATED_NATIVE_CARDS, so a failed or empty discovery
 * leaves the picker exactly as it was before discovery existed.
 */

export interface NativeCardInfo {
  type: string; // element name, e.g. 'hui-entities-card'
  name: string; // e.g. 'Entities'
  description?: string | undefined;
}

/**
 * Baseline used when discovery is unavailable, and the source of names and
 * descriptions for anything discovery turns up without a translation.
 *
 * Keyed by element name because that is what saved configs store.
 */
export const CURATED_NATIVE_CARDS: NativeCardInfo[] = [
  // HA renamed this card to "Activity" in the picker but kept `type: logbook`,
  // and the element name has to match the type, not the label.
  { type: 'hui-logbook-card', name: 'Activity', description: 'Shows a list of events for entities' },
  { type: 'hui-alarm-panel-card', name: 'Alarm Panel', description: 'Control alarm panel entities' },
  { type: 'hui-area-card', name: 'Area', description: 'Display area information and controls' },
  { type: 'hui-button-card', name: 'Button', description: 'Simple button for entity control' },
  { type: 'hui-calendar-card', name: 'Calendar', description: 'Display calendar events' },
  { type: 'hui-clock-card', name: 'Clock', description: 'Display a clock' },
  { type: 'hui-conditional-card', name: 'Conditional', description: 'Show cards based on conditions' },
  { type: 'hui-entities-card', name: 'Entities', description: 'List multiple entities' },
  { type: 'hui-entity-card', name: 'Entity', description: 'Display single entity' },
  { type: 'hui-entity-filter-card', name: 'Entity Filter', description: 'Filter entities based on state' },
  { type: 'hui-gauge-card', name: 'Gauge', description: 'Display value as gauge' },
  { type: 'hui-glance-card', name: 'Glance', description: 'Quick overview of entities' },
  { type: 'hui-grid-card', name: 'Grid', description: 'Display cards in grid layout' },
  { type: 'hui-heading-card', name: 'Heading', description: 'Display heading text' },
  { type: 'hui-history-graph-card', name: 'History Graph', description: 'Display historical data' },
  { type: 'hui-horizontal-stack-card', name: 'Horizontal Stack', description: 'Stack cards horizontally' },
  { type: 'hui-humidifier-card', name: 'Humidifier', description: 'Control humidifier entities' },
  { type: 'hui-light-card', name: 'Light', description: 'Control light entities' },
  { type: 'hui-map-card', name: 'Map', description: 'Display map with device trackers' },
  { type: 'hui-markdown-card', name: 'Markdown', description: 'Display markdown content' },
  { type: 'hui-media-control-card', name: 'Media Control', description: 'Control media player entities' },
  { type: 'hui-picture-card', name: 'Picture', description: 'Display static image' },
  { type: 'hui-picture-elements-card', name: 'Picture Elements', description: 'Interactive image with elements' },
  { type: 'hui-picture-entity-card', name: 'Picture Entity', description: 'Display entity with image' },
  { type: 'hui-picture-glance-card', name: 'Picture Glance', description: 'Glance card with image' },
  { type: 'hui-plant-status-card', name: 'Plant Status', description: 'Display plant information' },
  { type: 'hui-sensor-card', name: 'Sensor', description: 'Display sensor entity' },
  { type: 'hui-statistic-card', name: 'Statistic', description: 'Display statistic data' },
  { type: 'hui-statistics-graph-card', name: 'Statistics Graph', description: 'Display statistical graph' },
  { type: 'hui-thermostat-card', name: 'Thermostat', description: 'Control thermostat entities' },
  { type: 'hui-tile-card', name: 'Tile', description: 'Modern tile card for entities' },
  { type: 'hui-todo-list-card', name: 'To-do List', description: 'Manage to-do list items' },
  { type: 'hui-vertical-stack-card', name: 'Vertical Stack', description: 'Stack cards vertically' },
  { type: 'hui-weather-forecast-card', name: 'Weather Forecast', description: 'Display weather forecast' },
  // Same rename as Activity/logbook: the picker says "Webpage", the type is `iframe`.
  { type: 'hui-iframe-card', name: 'Webpage', description: 'Embed a webpage' },
];

const CARD_TRANSLATION_PREFIX = 'ui.panel.lovelace.editor.card.';

/** `ui.panel.lovelace.editor.card.<type>.name`, with `<type>` captured. */
const CARD_NAME_KEY = /^ui\.panel\.lovelace\.editor\.card\.([a-z0-9][a-z0-9-]*)\.name$/;

/** Keys that live in the card namespace without describing a card. */
const NON_CARD_KEYS = new Set(['generic', 'empty_state', 'config', 'entity-row']);

/**
 * Energy, power and water cards get their own section in HA's picker because
 * they only work on a dashboard that has energy configured. Ultra Card's palette
 * has no such section, and the curated list never offered them, so leave them out.
 */
const EXCLUDED_TYPE_PREFIXES = ['energy-', 'power-', 'water-'];

/** Cards HA builds for itself: error, startup and setup states, never picked. */
const EXCLUDED_TYPES = new Set([
  'manual',
  'section',
  'error',
  'starting',
  'empty-state',
  'recovery-mode',
  'safe-mode',
  'repairs',
  'updates',
  'discovered-devices',
  'home-summary',
  'shopping-list',
  'entity-button',
]);

/**
 * Card types to probe when the translation fragment cannot be read but
 * `hass.localize` still works. A superset of the curated list; anything HA does
 * not have is dropped by the probe.
 */
const EXTRA_PROBE_TYPES = ['distribution', 'shortcut', 'toggle-group'];

/**
 * Below this, discovery is treated as having failed rather than as a genuinely
 * tiny card set, and the curated list is used instead.
 */
const MIN_PLAUSIBLE_CARD_COUNT = 10;

type LocalizeFn = (key: string) => string;

/** Only the parts of `hass` discovery touches; the real type is HA-internal. */
interface DiscoveryHass {
  language?: string;
  config?: { version?: string };
  localize?: LocalizeFn;
  loadFragmentTranslation?: (fragment: string) => Promise<LocalizeFn | undefined>;
  translationMetadata?: { translations?: Record<string, { hash?: string }> };
}

/**
 * Convert an element name to its YAML config type.
 * e.g. 'hui-entities-card' -> 'entities'
 */
export function elementNameToConfigType(elementName: string): string {
  if (!elementName || !elementName.startsWith('hui-')) {
    return elementName;
  }

  let configType = elementName.substring(4);

  if (configType.endsWith('-card')) {
    configType = configType.substring(0, configType.length - 5);
  }

  return configType;
}

/**
 * Convert a YAML config type to its element name.
 * e.g. 'entities' -> 'hui-entities-card'
 *
 * Holds for every card HA registers: each entry in HA's own lazy-load map
 * imports `hui-<type>-card`.
 */
export function configTypeToElementName(configType: string): string {
  if (!configType || configType.startsWith('hui-')) {
    return configType;
  }

  return `hui-${configType}-card`;
}

/** Whether a discovered YAML type is a card users should be offered. */
export function isSelectableCardType(configType: string): boolean {
  if (!configType || NON_CARD_KEYS.has(configType) || EXCLUDED_TYPES.has(configType)) {
    return false;
  }
  return !EXCLUDED_TYPE_PREFIXES.some(prefix => configType.startsWith(prefix));
}

/** 'alarm-panel' -> 'Alarm Panel', for a card with no translated name. */
function humanizeCardType(configType: string): string {
  return configType
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

let cachedCards: NativeCardInfo[] | null = null;
let cacheKey: string | null = null;
let inFlight: Promise<NativeCardInfo[]> | null = null;

/** Discovery result if it has already completed, else null. Never throws. */
export function getDiscoveredNativeCards(): NativeCardInfo[] | null {
  return cachedCards;
}

/** Drop cached discovery. For tests, and for an explicit picker refresh. */
export function resetNativeCardDiscovery(): void {
  cachedCards = null;
  cacheKey = null;
  inFlight = null;
}

/**
 * Discover the cards this HA has, falling back to the curated list.
 *
 * Cached per HA version and language, and deduped while in flight, so opening
 * the picker repeatedly costs one lookup per session.
 */
export async function discoverNativeCards(hass: unknown): Promise<NativeCardInfo[]> {
  const source = (hass ?? {}) as DiscoveryHass;
  const key = `${source.config?.version ?? '?'}|${source.language ?? '?'}`;

  if (cacheKey === key) {
    if (cachedCards) return cachedCards;
    if (inFlight) return inFlight;
  }

  cacheKey = key;
  cachedCards = null;
  inFlight = runDiscovery(source)
    .catch(() => [])
    .then(cards => {
      const resolved = cards.length >= MIN_PLAUSIBLE_CARD_COUNT ? cards : CURATED_NATIVE_CARDS;
      // A newer call for a different HA version owns the cache now.
      if (cacheKey === key) {
        cachedCards = resolved;
        inFlight = null;
      }
      return resolved;
    });

  return inFlight;
}

/** Card types found, plus the raw strings they came with, when there were any. */
interface DiscoveredTypes {
  types: Set<string>;
  strings: Record<string, string>;
}

async function runDiscovery(hass: DiscoveryHass): Promise<NativeCardInfo[]> {
  const localize = await resolveLovelaceLocalize(hass);

  const discovered =
    (await fetchCardTypesFromFragment(hass)) ?? probeCardTypesWithLocalize(localize);

  return buildCatalog(discovered, localize);
}

/**
 * Get a localize function that can see the lovelace translations.
 *
 * They arrive as a fragment, so a card rendered outside the lovelace panel (the
 * Ultra Card panel, for instance) may not have them yet. `loadFragmentTranslation`
 * is on `hass` for exactly this and returns a localize that includes them.
 */
async function resolveLovelaceLocalize(hass: DiscoveryHass): Promise<LocalizeFn> {
  const fallback: LocalizeFn =
    typeof hass.localize === 'function' ? key => hass.localize!(key) || '' : () => '';

  try {
    const loaded = await hass.loadFragmentTranslation?.('lovelace');
    if (typeof loaded === 'function') {
      return key => loaded(key) || '';
    }
  } catch {
    // Older HA, or the fragment is unavailable. `hass.localize` may still work.
  }

  return fallback;
}

/**
 * Read every card type out of the lovelace translation fragment.
 *
 * HA serves each fragment as one flat, dot-keyed JSON file whose name carries
 * the build hash from `hass.translationMetadata`. It is the same file HA itself
 * fetched to render the dashboard, so this is a cache hit in practice.
 *
 * Returns null when the file cannot be read, which hands over to the probe.
 */
async function fetchCardTypesFromFragment(hass: DiscoveryHass): Promise<DiscoveredTypes | null> {
  const language = hass.language;
  const hash = language ? hass.translationMetadata?.translations?.[language]?.hash : undefined;
  if (!language || !hash || typeof fetch !== 'function') {
    return null;
  }

  try {
    const response = await fetch(`/static/translations/lovelace/${language}-${hash}.json`, {
      credentials: 'same-origin',
    });
    if (!response.ok) return null;

    const data = (await response.json()) as Record<string, unknown> | null;
    if (!data || typeof data !== 'object') return null;

    const types = new Set<string>();
    const strings: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        strings[key] = value;
      }
      const match = CARD_NAME_KEY.exec(key);
      if (match?.[1] && isSelectableCardType(match[1])) {
        types.add(match[1]);
      }
    }
    return types.size ? { types, strings } : null;
  } catch {
    // Offline, blocked, or HA moved the file. The probe still works.
    return null;
  }
}

/**
 * Ask `localize` about each candidate type instead of enumerating.
 *
 * Misses cards added to HA after this list was written, but it needs no network
 * and still drops anything the running HA does not have. `localize` returns an
 * empty string for a key it does not know, so this is quiet and free.
 */
function probeCardTypesWithLocalize(localize: LocalizeFn): DiscoveredTypes {
  const candidates = new Set<string>(EXTRA_PROBE_TYPES);
  for (const card of CURATED_NATIVE_CARDS) {
    candidates.add(elementNameToConfigType(card.type));
  }

  const types = new Set<string>();
  for (const configType of candidates) {
    if (!isSelectableCardType(configType)) continue;
    if (localize(`${CARD_TRANSLATION_PREFIX}${configType}.name`)) {
      types.add(configType);
    }
  }
  return { types, strings: {} };
}

/**
 * Names come from `localize` first, then the raw fragment strings, then the
 * curated list, then the type itself. The fragment tier matters when the
 * lovelace strings were fetched here but never loaded into `hass.localize`,
 * which is what happens outside the lovelace panel.
 */
function buildCatalog(
  { types, strings }: DiscoveredTypes,
  localize: LocalizeFn
): NativeCardInfo[] {
  const curatedByElement = new Map(CURATED_NATIVE_CARDS.map(card => [card.type, card]));

  const cards: NativeCardInfo[] = [];
  for (const configType of types) {
    const elementName = configTypeToElementName(configType);
    const curated = curatedByElement.get(elementName);
    const nameKey = `${CARD_TRANSLATION_PREFIX}${configType}.name`;
    const descriptionKey = `${CARD_TRANSLATION_PREFIX}${configType}.description`;

    cards.push({
      type: elementName,
      name:
        localize(nameKey) || strings[nameKey] || curated?.name || humanizeCardType(configType),
      description:
        localize(descriptionKey) || strings[descriptionKey] || curated?.description,
    });
  }

  return cards.sort((a, b) => a.name.localeCompare(b.name));
}
