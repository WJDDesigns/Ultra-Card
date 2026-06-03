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

export function inferEntityDomainsFromPrompt(prompt: string): string[] {
  const text = prompt.toLowerCase();
  const domains: string[] = [];
  if (/\bweather\b|\bforecast\b|\btemperature\b|\btemp\b|\bconditions?\b/.test(text)) {
    domains.push('weather');
  }
  if (/\blights?\b|\blamps?\b|\bbulbs?\b/.test(text)) domains.push('light');
  if (/\blocks?\b|\bdoors?\b|\bdeadbolts?\b/.test(text)) domains.push('lock');
  if (/\bcovers?\b|\bgarage\b|\bshades?\b|\bblinds?\b/.test(text)) domains.push('cover');
  if (/\bfans?\b/.test(text)) domains.push('fan');
  if (/\bclimate\b|\bthermostats?\b|\bhvac\b/.test(text)) domains.push('climate');
  if (/\bmedia\b|\bmusic\b|\bspotify\b|\bspeaker\b|\btv\b/.test(text)) domains.push('media_player');

  if (!domains.length && /\bsensors?\b|\bstatus\b|\blist\b|\bgauge\b|\bfuel\b/.test(text)) {
    domains.push('sensor');
  }
  return domains;
}
