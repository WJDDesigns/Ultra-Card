import { CORE_MANIFESTS } from '../modules/module-manifest-data';
import {
  getComposableSmartModuleSpecs,
  getRegistryCatalogLines,
  getRegistryKeywordLines,
  getSmartModuleSpec,
  isRegistryProSmartModule,
  isRegistrySmartContainerType,
  isRegistrySmartModuleType,
  matchSmartModuleTypesForPrompt,
} from './smart/uc-smart-module-registry';
import type { SmartEntityTarget } from './smart/uc-smart-entity-context';

export type SmartModuleCapability = {
  type: string;
  title: string;
  category: string;
  use: string;
  fields: string[];
  keywords: string[];
  entityDomains?: string[] | undefined;
  isPro: boolean;
  isContainer: boolean;
};

export type SmartModuleIntentHint = {
  type: string;
  title: string;
  category: string;
  keywords: string[];
  isPro: boolean;
  isContainer: boolean;
  isSmartComposable: boolean;
};

const CONTAINER_TYPES = new Set([
  'horizontal',
  'vertical',
  'stack',
  'grid',
  'tabs',
  'accordion',
  'slider',
  'popup',
]);

const SMART_MODULE_OVERRIDES: Record<
  string,
  Pick<SmartModuleCapability, 'use' | 'fields' | 'entityDomains' | 'isContainer'>
> = {
  text: {
    use: 'Headings, labels, short status text.',
    fields: ['text', 'font_size', 'font_weight', 'alignment'],
    isContainer: false,
  },
  markdown: {
    use: 'Rich text only when the user explicitly asks for notes or formatted text.',
    fields: ['content'],
    isContainer: false,
  },
  info: {
    use: 'Entity name, state, units, and attributes in rows.',
    fields: ['info_entities', 'columns', 'alignment'],
    entityDomains: ['*'],
    isContainer: false,
  },
  icon: {
    use: 'Entity-aware icons with active/inactive states and colors.',
    fields: ['icons', 'columns', 'alignment'],
    entityDomains: ['*'],
    isContainer: false,
  },
  button: {
    use: 'Action buttons for navigation, services, toggles, and scenes.',
    fields: ['label', 'icon', 'show_icon', 'tap_action', 'style'],
    isContainer: false,
  },
  light: {
    use: 'Light preset buttons with on/off/toggle, brightness, and color styling.',
    fields: ['presets', 'layout', 'columns', 'button_style'],
    entityDomains: ['light'],
    isContainer: false,
  },
  lock: {
    use: 'Lock/unlock controls with status display.',
    fields: ['entity', 'name', 'layout', 'show_state', 'show_open_button'],
    entityDomains: ['lock'],
    isContainer: false,
  },
  cover: {
    use: 'Cover, garage door, shade, and blind controls.',
    fields: ['entity', 'name', 'layout', 'show_state'],
    entityDomains: ['cover'],
    isContainer: false,
  },
  fan: {
    use: 'Fan speed and control UI.',
    fields: ['entity', 'name', 'layout'],
    entityDomains: ['fan'],
    isContainer: false,
  },
  washer: {
    use: 'Animated washing machine card with cycle status, remaining time, and controls.',
    fields: ['entity', 'layout', 'show_status', 'show_controls', 'enable_animations'],
    entityDomains: ['select', 'sensor', 'switch', 'binary_sensor'],
    isContainer: false,
  },
  dryer: {
    use: 'Animated dryer card with cycle status, remaining time, and controls.',
    fields: ['entity', 'layout', 'show_status', 'show_controls', 'enable_animations'],
    entityDomains: ['select', 'sensor', 'switch', 'binary_sensor'],
    isContainer: false,
  },
  dishwasher: {
    use: 'Animated dishwasher card with cycle status, remaining time, and wash options.',
    fields: ['entity', 'layout', 'show_status', 'show_controls', 'enable_animations'],
    entityDomains: ['select', 'sensor', 'switch', 'binary_sensor'],
    isContainer: false,
  },
  fridge: {
    use: 'Refrigerator card with temperatures, setpoints, door alerts, and feature switches.',
    fields: ['entity', 'layout', 'show_status', 'show_temperatures', 'enable_animations'],
    entityDomains: ['sensor', 'binary_sensor', 'number', 'switch'],
    isContainer: false,
  },
  range: {
    use: 'Kitchen range/oven card with cooktop burner indicators, oven status and temperature, and light control.',
    fields: ['entity', 'layout', 'show_status', 'show_temperatures', 'show_cooktop', 'enable_animations'],
    entityDomains: ['sensor', 'binary_sensor', 'select', 'light', 'button'],
    isContainer: false,
  },
  climate: {
    use: 'Thermostat and climate control UI.',
    fields: ['entity'],
    entityDomains: ['climate'],
    isContainer: false,
  },
  media_player: {
    use: 'Media playback controls with album art and progress.',
    fields: ['entity', 'name', 'layout'],
    entityDomains: ['media_player'],
    isContainer: false,
  },
  status_summary: {
    use: 'Activity/status list for multiple entities.',
    fields: ['entities', 'show_icon', 'show_state'],
    entityDomains: ['*'],
    isContainer: false,
  },
  horizontal: {
    use: 'Place modules side-by-side, such as icon + buttons.',
    fields: ['modules', 'gap', 'alignment', 'vertical_alignment'],
    isContainer: true,
  },
  vertical: {
    use: 'Stack modules vertically as a grouped section.',
    fields: ['modules', 'gap', 'horizontal_alignment'],
    isContainer: true,
  },
  stack: {
    use: 'Layer modules on top of each other.',
    fields: ['modules', 'layers'],
    isContainer: true,
  },
  grid: {
    use: 'Display entities in a grid of tiles.',
    fields: ['entities', 'style_preset', 'columns'],
    entityDomains: ['*'],
    isContainer: false,
  },
  gauge: {
    use: 'Numeric sensor readouts such as fuel level, tank percentage, or range.',
    fields: ['entity', 'name', 'min_value', 'max_value', 'gauge_style', 'gauge_size'],
    entityDomains: ['sensor'],
    isContainer: false,
  },
  tabs: {
    use: 'Organize modules into tabbed sections.',
    fields: ['sections'],
    isContainer: true,
  },
  accordion: {
    use: 'Collapsible sections containing child modules.',
    fields: ['modules', 'title'],
    isContainer: true,
  },
};

const SMART_MODULE_KEYWORD_OVERRIDES: Record<string, string[]> = {
  horizontal: ['beside', 'side-by-side', 'next-to', 'row'],
  vertical: ['stack', 'under', 'below', 'column'],
  grid: ['tiles', 'matrix', 'cards'],
  info: ['status', 'attribute', 'details'],
  light: ['lights', 'bulbs', 'lamp'],
  media_player: ['music', 'audio', 'speaker', 'tv'],
  status_summary: ['activity', 'history', 'timeline'],
  gauge: ['fuel', 'tank', 'meter', 'percentage'],
  washer: ['washer', 'washing machine', 'laundry'],
  dryer: ['dryer', 'tumble dryer', 'laundry'],
  dishwasher: ['dishwasher', 'dish washer'],
  fridge: ['fridge', 'refrigerator', 'freezer'],
  range: ['range', 'oven', 'stove', 'cooktop'],
};

const SMART_ALLOWED_TYPES = new Set(Object.keys(SMART_MODULE_OVERRIDES));

function normalizeKeyword(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function extractKeywordTokens(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .split(/[^a-z0-9]+/)
    .map(part => part.trim())
    .filter(part => part.length >= 3);
}

function buildKeywords(type: string): string[] {
  const manifest = CORE_MANIFESTS.find(item => item.type === type);
  const set = new Set<string>();

  const addKeyword = (value: string): void => {
    const normalized = normalizeKeyword(value);
    if (!normalized || normalized.length < 3) return;
    set.add(normalized);
    extractKeywordTokens(value).forEach(token => set.add(token));
  };

  addKeyword(type);
  addKeyword(type.replace(/_/g, ' '));
  if (manifest?.title) addKeyword(manifest.title);
  (manifest?.tags || []).forEach(addKeyword);
  (SMART_MODULE_KEYWORD_OVERRIDES[type] || []).forEach(addKeyword);

  return Array.from(set).sort();
}

function buildRegistry(): SmartModuleCapability[] {
  const manifestByType = new Map(CORE_MANIFESTS.map(m => [m.type, m]));
  return Array.from(SMART_ALLOWED_TYPES).map(type => {
    const manifest = manifestByType.get(type);
    const override = SMART_MODULE_OVERRIDES[type];
    const isPro = !!manifest?.tags?.includes('pro');
    return {
      type,
      title: manifest?.title || type,
      category: manifest?.category || 'custom',
      use: override.use,
      fields: override.fields,
      keywords: buildKeywords(type),
      entityDomains: override.entityDomains,
      isPro,
      isContainer: override.isContainer,
    };
  });
}

function buildIntentLibrary(): SmartModuleIntentHint[] {
  return CORE_MANIFESTS.map(manifest => ({
    type: manifest.type,
    title: manifest.title,
    category: manifest.category || 'custom',
    keywords: buildKeywords(manifest.type),
    isPro: !!manifest.tags?.includes('pro'),
    isContainer: CONTAINER_TYPES.has(manifest.type),
    isSmartComposable: SMART_ALLOWED_TYPES.has(manifest.type),
  }));
}

export const SMART_MODULE_REGISTRY: SmartModuleCapability[] = buildRegistry();
export const SMART_MODULE_INTENT_LIBRARY: SmartModuleIntentHint[] = buildIntentLibrary();

export const SMART_CONTAINER_TYPES = CONTAINER_TYPES;

export function isSmartModuleType(type: string): boolean {
  return isRegistrySmartModuleType(type);
}

export function isSmartContainerType(type: string): boolean {
  return isRegistrySmartContainerType(type);
}

export function isProSmartModule(type: string): boolean {
  return isRegistryProSmartModule(type);
}

export function getSmartModuleCatalogLines(tier: 'free' | 'pro'): string[] {
  return getRegistryCatalogLines(tier);
}

export function getSmartModuleKeywordLines(tier: 'free' | 'pro'): string[] {
  return getRegistryKeywordLines(tier);
}

function promptTokenSet(prompt: string): Set<string> {
  return new Set(
    prompt
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .split(/[^a-z0-9]+/)
      .map(token => token.trim())
      .filter(token => token.length >= 2)
  );
}

export function suggestSmartModuleTypesForPrompt(
  prompt: string,
  tier: 'free' | 'pro',
  options: { max?: number; includeLibraryOnly?: boolean } = {}
): string[] {
  const { max = 12, includeLibraryOnly = true } = options;
  return matchSmartModuleTypesForPrompt(prompt, tier, {
    max,
    composableOnly: !includeLibraryOnly,
  }).map(item => item.type);
}

export function promptWantsTextContent(prompt: string): boolean {
  const text = prompt.toLowerCase();
  return /\b(markdown|notes?|instructions?|explain|description|paragraph|write text|text only)\b/.test(
    text
  );
}

export type { SmartEntityTarget };

type TargetRule = {
  pattern: RegExp;
  domain: string;
  deviceClasses?: string[];
  /** Skip this rule when the guard matches (e.g. "temperature" belongs to weather when weather is mentioned). */
  unless?: RegExp;
};

const WEATHER_WORDS = /\bweather\b|\bforecast\b|\boutside\b|\boutdoors?\b|\bconditions?\b/;

/**
 * Ordered so the resulting domain list keeps a sensible top-to-bottom reading order:
 * weather/header first, then controls, then status sensors.
 */
const TARGET_RULES: TargetRule[] = [
  { pattern: WEATHER_WORDS, domain: 'weather' },
  // "temp" without any weather context is a temperature sensor, not a weather module.
  { pattern: /\btemperatures?\b|\btemp\b|\bthermometer\b/, domain: 'sensor', deviceClasses: ['temperature'], unless: WEATHER_WORDS },
  { pattern: /\bhumidity\b|\bmoisture level\b/, domain: 'sensor', deviceClasses: ['humidity'] },
  { pattern: /\blights?\b|\blamps?\b|\bbulbs?\b|\bled strip\b|\bleds\b/, domain: 'light' },
  { pattern: /\bswitch(?:es)?\b|\bplugs?\b|\boutlets?\b|\bsockets?\b|\bsmart plug\b/, domain: 'switch' },
  { pattern: /\blocks?\b|\bdeadbolts?\b|\bdoor locks?\b/, domain: 'lock' },
  {
    pattern: /\bdoors?\b|\bwindows?\b|\bopenings?\b|\bcontact sensors?\b/,
    domain: 'binary_sensor',
    deviceClasses: ['door', 'window', 'garage_door', 'opening'],
    unless: /\bdoor locks?\b|\block the door\b|\bunlock\b|\bgarage\b/,
  },
  { pattern: /\bcovers?\b|\bgarage\b|\bshades?\b|\bblinds?\b|\bshutters?\b|\bcurtains?\b|\bawnings?\b/, domain: 'cover' },
  { pattern: /\bfans?\b|\bceiling fan\b|\bexhaust\b/, domain: 'fan' },
  { pattern: /\bclimate\b|\bthermostats?\b|\bhvac\b|\bheating\b|\bcooling\b|\bair con(?:ditioning|ditioner)?\b|\ba\/c\b/, domain: 'climate' },
  { pattern: /\bhumidifiers?\b|\bdehumidifiers?\b/, domain: 'humidifier' },
  { pattern: /\bwater heaters?\b|\bboiler\b|\bhot water\b/, domain: 'water_heater' },
  { pattern: /\bmedia\b|\bmusic\b|\bspotify\b|\bspeakers?\b|\btv\b|\btelevision\b|\bsonos\b|\bnow playing\b/, domain: 'media_player' },
  { pattern: /\bvacuums?\b|\broomba\b|\brobot vac\b|\brobovac\b/, domain: 'vacuum' },
  { pattern: /\bcameras?\b|\bcctv\b|\bdoorbell\b|\blive feed\b/, domain: 'camera' },
  {
    pattern:
      /\bwho(?:'s| is| are)\s+(?:at\s+)?home\b|\bwho(?:'s| is)\s+away\b|\banyone(?:'s| is)?\s+(?:at\s+)?home\b|\bhome occupancy\b|\bpresence\b|\bpeople\b|\bpersons?\b|\bfamily\b|\bhousehold\b|\beveryone\b|\beverybody\b|\boccupants?\b/,
    domain: 'person',
  },
  { pattern: /\balarm\b|\bsecurity system\b|\barm(?:ed|ing)?\b|\bdisarm\b/, domain: 'alarm_control_panel' },
  { pattern: /\bcalendar\b|\bevents?\b|\bagenda\b|\bappointments?\b/, domain: 'calendar' },
  { pattern: /\bto-?do\b|\bshopping list\b|\btasks?\b|\bchores\b|\bchecklist\b/, domain: 'todo' },
  { pattern: /\bscenes?\b/, domain: 'scene' },
  { pattern: /\bscripts?\b/, domain: 'script' },
  { pattern: /\bautomations?\b/, domain: 'automation' },
  { pattern: /\bmotion\b|\boccupancy\b|\bmovement\b/, domain: 'binary_sensor', deviceClasses: ['motion', 'occupancy', 'presence'] },
  { pattern: /\bsmoke\b|\bfire alarm\b|\bco2? alarm\b|\bcarbon monoxide\b/, domain: 'binary_sensor', deviceClasses: ['smoke', 'carbon_monoxide', 'gas', 'safety'] },
  { pattern: /\bleaks?\b|\bflood(?:ing)?\b|\bwater leak\b|\bwater sensor\b/, domain: 'binary_sensor', deviceClasses: ['moisture'] },
  { pattern: /\bbattery\b|\bbatteries\b|\bbattery levels?\b/, domain: 'sensor', deviceClasses: ['battery'] },
  { pattern: /\bpower\b|\benergy\b|\bwatts?\b|\bwattage\b|\bkwh\b|\bconsumption\b|\belectricity\b/, domain: 'sensor', deviceClasses: ['power', 'energy'] },
  { pattern: /\bair quality\b|\bco2\b|\bpm2\.?5\b|\bvoc\b|\baqi\b/, domain: 'sensor', deviceClasses: ['carbon_dioxide', 'pm25', 'volatile_organic_compounds', 'aqi', 'pm10'] },
  { pattern: /\billuminance\b|\blux\b|\blight level\b/, domain: 'sensor', deviceClasses: ['illuminance'] },
  { pattern: /\bpressure\b|\bbarometer\b/, domain: 'sensor', deviceClasses: ['pressure', 'atmospheric_pressure'] },
  { pattern: /\bfuel\b|\btank\b|\bgas level\b/, domain: 'sensor', deviceClasses: ['fuel', 'volume_storage'] },
];

/**
 * Entity targets (domain + optional device classes) the prompt is asking for, in reading order.
 * Multiple rules can contribute to the same domain; device classes are merged per domain.
 */
export function inferEntityTargetsFromPrompt(prompt: string): SmartEntityTarget[] {
  const text = prompt.toLowerCase();
  const targets: SmartEntityTarget[] = [];

  for (const rule of TARGET_RULES) {
    if (!rule.pattern.test(text)) continue;
    if (rule.unless && rule.unless.test(text)) continue;

    const existing = targets.find(target => target.domain === rule.domain);
    if (!existing) {
      targets.push({
        domain: rule.domain,
        ...(rule.deviceClasses ? { deviceClasses: [...rule.deviceClasses] } : {}),
      });
      continue;
    }
    if (!rule.deviceClasses) {
      // A generic mention of the domain widens a previously class-restricted target.
      existing.deviceClasses = undefined;
      continue;
    }
    if (existing.deviceClasses) {
      for (const deviceClass of rule.deviceClasses) {
        if (!existing.deviceClasses.includes(deviceClass)) existing.deviceClasses.push(deviceClass);
      }
    }
  }

  if (!targets.length && /\bsensors?\b|\bstatus\b|\blist\b|\bgauge\b|\breadings?\b|\bmeter\b/.test(text)) {
    targets.push({ domain: 'sensor' });
  }
  return targets;
}

export function inferEntityDomainsFromPrompt(prompt: string): string[] {
  const domains: string[] = [];
  for (const target of inferEntityTargetsFromPrompt(prompt)) {
    if (!domains.includes(target.domain)) domains.push(target.domain);
  }
  return domains;
}

const OPENING_CLASSES = ['door', 'window', 'garage_door', 'opening'];

/**
 * Stand-in targets tried when a target has no matching entities, e.g. "front door"
 * on a home that only has a door lock, or "who is home" with only device trackers.
 */
export function relatedEntityTargets(target: SmartEntityTarget): SmartEntityTarget[] {
  switch (target.domain) {
    case 'binary_sensor':
      if (target.deviceClasses?.some(deviceClass => OPENING_CLASSES.includes(deviceClass))) {
        return [{ domain: 'lock' }, { domain: 'cover' }];
      }
      return [];
    case 'lock':
      return [{ domain: 'binary_sensor', deviceClasses: ['door', 'lock'] }];
    case 'person':
      return [{ domain: 'device_tracker' }];
    case 'water_heater':
      return [{ domain: 'climate' }];
    case 'switch':
      return [{ domain: 'input_boolean' }];
    case 'todo':
      return [{ domain: 'shopping_list' }];
    case 'calendar':
      return [];
    default:
      return [];
  }
}
