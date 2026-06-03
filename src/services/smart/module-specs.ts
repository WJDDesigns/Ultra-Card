import { CORE_MANIFESTS } from '../../modules/module-manifest-data';
import type { SmartModuleSpec } from './smart-module-types';

const LIBRARY_ONLY_TYPES = new Set([
  'video_bg',
  'living_canvas',
  'dynamic_weather',
  'background',
  'screensaver',
  'virtual_pet',
  'badge_of_honor',
  'external_card',
  'native_card',
  'pagebreak',
  'navigation',
  'popup',
]);

const CONTAINER_TYPES = new Set([
  'horizontal',
  'vertical',
  'stack',
  'grid',
  'tabs',
  'accordion',
  'slider',
]);

const KEYWORD_OVERRIDES: Record<string, string[]> = {
  horizontal: ['beside', 'side-by-side', 'next-to', 'row'],
  vertical: ['stack', 'under', 'below', 'column'],
  grid: ['tiles', 'matrix', 'cards'],
  info: ['status', 'attribute', 'details'],
  light: ['lights', 'bulbs', 'lamp'],
  media_player: ['music', 'audio', 'speaker', 'tv'],
  status_summary: ['activity', 'history', 'timeline'],
  gauge: ['fuel', 'tank', 'meter', 'percentage'],
  bar: ['progress bar', 'percentage bar', 'progress'],
  camera: ['live feed', 'surveillance', 'security camera'],
  image: ['picture', 'photo'],
  qr_code: ['qr', 'qrcode', 'wifi code'],
  calendar: ['events', 'schedule', 'agenda'],
  battery_monitor: ['battery', 'low battery', 'phone battery'],
  area_summary: ['room summary', 'room tile', 'floor plan'],
  auto_entity_list: ['auto entities', 'entity list', 'filtered list'],
  'dynamic-list': ['jinja list', 'template list'],
  slider_control: ['slider control', 'dimmer'],
  spinbox: ['stepper', 'number stepper'],
  animated_weather: ['weather animation', 'animated weather'],
  animated_forecast: ['forecast animation'],
  animated_clock: ['flip clock', 'animated clock'],
  energy_display: ['energy flow', 'sankey'],
  solar_analytics: ['solar panel', 'solar power'],
  sports_score: ['sports', 'scoreboard', 'nfl', 'nba'],
  vacuum: ['robot vacuum', 'roomba'],
  text_input: ['input text', 'text helper'],
  number_input: ['input number', 'number helper'],
  boolean_input: ['input boolean', 'boolean helper'],
  select_input: ['input select', 'select helper'],
  datetime_input: ['input datetime', 'date picker'],
  slider_input: ['input slider', 'range input'],
  button_input: ['input button', 'press button'],
  counter_input: ['input counter'],
  color_input: ['color picker', 'input color'],
};

const AI_FIELD_OVERRIDES: Record<string, { purpose: string; fields: string[]; example?: Record<string, unknown> }> = {
  text: {
    purpose: 'Headings, labels, short status text.',
    fields: ['text', 'font_size', 'font_weight', 'alignment'],
    example: { type: 'text', text: 'Kitchen Lights', font_size: 18, font_weight: '600' },
  },
  markdown: {
    purpose: 'Rich text only when the user explicitly asks for notes or formatted text.',
    fields: ['content'],
  },
  info: {
    purpose: 'Entity name, state, units, and attributes in rows.',
    fields: ['info_entities', 'columns', 'alignment', 'text_size', 'icon_size'],
    example: {
      type: 'info',
      info_entities: [{ entity: 'sensor.temperature', name: 'Temperature', show_state: true }],
      columns: 1,
    },
  },
  icon: {
    purpose: 'Entity-aware icons with active/inactive states and colors.',
    fields: ['icons', 'columns', 'alignment'],
  },
  button: {
    purpose: 'Action buttons for navigation, services, toggles, and scenes.',
    fields: ['label', 'icon', 'show_icon', 'tap_action', 'style'],
  },
  bar: {
    purpose: 'Horizontal progress bars for numeric sensors such as fuel level, battery, or percentage values.',
    fields: ['entity', 'name', 'percentage_min', 'percentage_max', 'show_percentage', 'bar_style', 'height'],
    example: {
      type: 'bar',
      entity: 'sensor.car_fuel_level',
      name: 'Fuel Level',
      percentage_min: 0,
      percentage_max: 100,
      show_percentage: true,
    },
  },
  gauge: {
    purpose: 'Circular or arc gauge readouts for fuel level, tank percentage, or numeric sensors.',
    fields: ['entity', 'name', 'min_value', 'max_value', 'gauge_style', 'gauge_size'],
    example: {
      type: 'gauge',
      entity: 'sensor.car_fuel_level',
      name: 'Fuel Level',
      min_value: 0,
      max_value: 100,
    },
  },
  light: {
    purpose: 'Light preset buttons with on/off/toggle, brightness, and color styling.',
    fields: ['presets', 'layout', 'columns', 'button_style'],
  },
  lock: {
    purpose: 'Lock/unlock controls with status display.',
    fields: ['entity', 'name', 'layout', 'show_state', 'show_open_button'],
  },
  cover: {
    purpose: 'Cover, garage door, shade, and blind controls.',
    fields: ['entity', 'name', 'layout', 'show_state'],
  },
  fan: {
    purpose: 'Fan speed and control UI.',
    fields: ['entity', 'name', 'layout'],
  },
  climate: {
    purpose: 'Thermostat and climate control UI.',
    fields: ['entity'],
  },
  media_player: {
    purpose: 'Media playback controls with album art and progress.',
    fields: ['entity', 'name', 'layout'],
  },
  status_summary: {
    purpose: 'Activity/status list for multiple entities.',
    fields: ['entities', 'show_icon', 'show_state', 'title'],
  },
  grid: {
    purpose: 'Display entities in a grid of tiles.',
    fields: ['entities', 'style_preset', 'columns'],
  },
  horizontal: {
    purpose: 'Place modules side-by-side, such as icon + buttons.',
    fields: ['modules', 'gap', 'gap_unit', 'alignment', 'vertical_alignment'],
  },
  vertical: {
    purpose: 'Stack modules vertically as a grouped section.',
    fields: ['modules', 'gap', 'gap_unit', 'horizontal_alignment'],
  },
  stack: {
    purpose: 'Layer modules on top of each other.',
    fields: ['modules', 'layers'],
  },
  tabs: {
    purpose: 'Organize modules into tabbed sections.',
    fields: ['sections'],
  },
  accordion: {
    purpose: 'Collapsible sections containing child modules.',
    fields: ['modules', 'title_text'],
  },
  separator: {
    purpose: 'Visual divider between sections.',
    fields: ['style', 'thickness', 'margin'],
  },
  image: {
    purpose: 'Static image from URL, path, or entity picture.',
    fields: ['image_url', 'entity', 'fit', 'tap_action'],
  },
  camera: {
    purpose: 'Live camera feed from a camera entity.',
    fields: ['entity', 'name', 'live_view'],
  },
  calendar: {
    purpose: 'Upcoming calendar events from calendar entities.',
    fields: ['entities', 'days_to_show', 'view'],
  },
  qr_code: {
    purpose: 'QR code from text, URL, template, or entity state.',
    fields: ['content_source', 'text', 'entity'],
  },
  timer: {
    purpose: 'Countdown timer with optional completion action.',
    fields: ['duration', 'name', 'tap_action'],
  },
  people: {
    purpose: 'Person presence cards with avatar and location.',
    fields: ['entities', 'layout'],
  },
  toggle: {
    purpose: 'Multi-state toggle buttons with custom actions.',
    fields: ['states', 'entity'],
  },
  spinbox: {
    purpose: 'Numeric stepper for entity or helper values.',
    fields: ['entity', 'min', 'max', 'step'],
  },
  slider_control: {
    purpose: 'Slider control for lights, covers, fans, or numeric entities.',
    fields: ['entity', 'min', 'max'],
  },
  dropdown: {
    purpose: 'Dropdown selector for scenes, services, or entity options.',
    fields: ['options', 'entity'],
  },
  area_summary: {
    purpose: 'Room/area summary tile with auto-discovered entities.',
    fields: ['area', 'show_climate', 'show_lights'],
  },
  alert_center: {
    purpose: 'Prioritized alert and warning list.',
    fields: ['entities', 'max_items'],
  },
  battery_monitor: {
    purpose: 'Battery level monitor for devices and phones.',
    fields: ['entities', 'style_preset', 'low_threshold'],
  },
  animated_clock: {
    purpose: 'Animated flip clock display.',
    fields: ['format', 'show_seconds'],
  },
  animated_weather: {
    purpose: 'Animated current weather display.',
    fields: ['weather_entity'],
  },
  animated_forecast: {
    purpose: 'Animated multi-day weather forecast.',
    fields: ['weather_entity', 'days'],
  },
  graphs: {
    purpose: 'Historical charts for entity statistics.',
    fields: ['entities', 'hours_to_show'],
  },
  energy_display: {
    purpose: 'Energy flow visualization between grid, solar, battery, and home.',
    fields: ['entities', 'layout'],
  },
  solar_analytics: {
    purpose: 'Solar production and grid balance analytics.',
    fields: ['entities'],
  },
  sports_score: {
    purpose: 'Live sports scores and upcoming games.',
    fields: ['team', 'league'],
  },
  vacuum: {
    purpose: 'Robot vacuum control with map and stats.',
    fields: ['entity'],
  },
  map: {
    purpose: 'Interactive map with entity markers.',
    fields: ['entities', 'default_zoom'],
  },
  auto_entity_list: {
    purpose: 'Auto-filtered entity list by domain or device class.',
    fields: ['filters', 'max_items'],
  },
  'dynamic-list': {
    purpose: 'Template-driven dynamic module list.',
    fields: ['template'],
  },
  text_input: {
    purpose: 'Text input linked to input_text helpers.',
    fields: ['entity'],
  },
  number_input: {
    purpose: 'Number input linked to input_number helpers.',
    fields: ['entity'],
  },
  boolean_input: {
    purpose: 'Toggle linked to input_boolean or switch entities.',
    fields: ['entity'],
  },
  select_input: {
    purpose: 'Select dropdown linked to input_select helpers.',
    fields: ['entity'],
  },
  datetime_input: {
    purpose: 'Date/time picker linked to input_datetime helpers.',
    fields: ['entity'],
  },
  slider_input: {
    purpose: 'Range slider linked to input_number helpers.',
    fields: ['entity'],
  },
  button_input: {
    purpose: 'Press button linked to input_button helpers.',
    fields: ['entity'],
  },
  counter_input: {
    purpose: 'Counter linked to counter helpers.',
    fields: ['entity'],
  },
  color_input: {
    purpose: 'Color picker linked to input_text or light entities.',
    fields: ['entity'],
  },
};

const ENTITY_DOMAIN_OVERRIDES: Record<string, string[]> = {
  info: ['*'],
  icon: ['*'],
  status_summary: ['*'],
  grid: ['*'],
  bar: ['sensor'],
  gauge: ['sensor'],
  light: ['light'],
  lock: ['lock'],
  cover: ['cover'],
  fan: ['fan'],
  climate: ['climate'],
  media_player: ['media_player'],
  camera: ['camera'],
  image: ['camera', '*'],
  vacuum: ['vacuum'],
  people: ['person', 'device_tracker'],
  calendar: ['calendar'],
  text_input: ['input_text'],
  number_input: ['input_number'],
  boolean_input: ['input_boolean', 'switch'],
  select_input: ['input_select'],
  datetime_input: ['input_datetime'],
  slider_input: ['input_number'],
  button_input: ['input_button'],
  counter_input: ['counter'],
  color_input: ['input_text', 'light'],
  battery_monitor: ['sensor', 'binary_sensor'],
  spinbox: ['number', 'input_number'],
  slider_control: ['light', 'cover', 'fan', 'number', 'input_number'],
  dropdown: ['input_select', 'select'],
  toggle: ['*'],
  timer: ['*'],
  map: ['device_tracker', 'person'],
  auto_entity_list: ['*'],
  'dynamic-list': ['*'],
  area_summary: ['*'],
  alert_center: ['*'],
  graphs: ['sensor'],
  energy_display: ['sensor'],
  solar_analytics: ['sensor'],
  sports_score: ['*'],
  qr_code: ['*'],
  animated_weather: ['weather'],
  animated_forecast: ['weather'],
  animated_clock: ['*'],
  separator: ['*'],
  text: ['*'],
  markdown: ['*'],
  horizontal: ['*'],
  vertical: ['*'],
  stack: ['*'],
  tabs: ['*'],
  accordion: ['*'],
  slider: ['*'],
};

const DEVICE_CLASS_OVERRIDES: Record<string, string[]> = {
  bar: ['battery', 'fuel', 'moisture', 'humidity'],
  gauge: ['battery', 'fuel'],
  battery_monitor: ['battery'],
};

const UNIT_HINT_OVERRIDES: Record<string, string[]> = {
  bar: ['%'],
  gauge: ['%'],
};

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

function buildPromptAliases(type: string, manifestTags: string[] = []): string[] {
  const set = new Set<string>();
  const add = (value: string): void => {
    const normalized = normalizeKeyword(value);
    if (!normalized || normalized.length < 2) return;
    set.add(normalized);
    extractKeywordTokens(value).forEach(token => set.add(token));
  };

  add(type);
  add(type.replace(/_/g, ' '));
  manifestTags.forEach(add);
  (KEYWORD_OVERRIDES[type] || []).forEach(add);

  return Array.from(set).sort();
}

function buildPromptPhrases(type: string): RegExp[] {
  const phrases: RegExp[] = [];
  const escaped = type.replace(/_/g, '[ _]');
  phrases.push(new RegExp(`\\b${escaped}\\b`, 'i'));
  (KEYWORD_OVERRIDES[type] || []).forEach(alias => {
    const pattern = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    phrases.push(new RegExp(`\\b${pattern}\\b`, 'i'));
  });
  return phrases;
}

function manifestCategory(type: string): SmartModuleSpec['category'] {
  const manifest = CORE_MANIFESTS.find(item => item.type === type);
  const category = manifest?.category || 'data';
  if (category === 'layout') return 'layout';
  if (category === 'input') return 'input';
  if (category === 'media') return 'media';
  if (category === 'interactive') return 'control';
  if (category === 'content') return 'content';
  return 'data';
}

function buildSpecForType(type: string): SmartModuleSpec {
  const manifest = CORE_MANIFESTS.find(item => item.type === type);
  const tags = manifest?.tags || [];
  const aiOverride = AI_FIELD_OVERRIDES[type];
  const isPro = tags.includes('pro');
  const isSmartComposable = !LIBRARY_ONLY_TYPES.has(type);
  const entityDomains = ENTITY_DOMAIN_OVERRIDES[type] || ['*'];

  return {
    type,
    title: manifest?.title || type,
    category: manifestCategory(type),
    tier: isPro ? 'pro' : 'free',
    isContainer: CONTAINER_TYPES.has(type),
    isSmartComposable,
    entityDomains,
    ...(DEVICE_CLASS_OVERRIDES[type] ? { deviceClasses: DEVICE_CLASS_OVERRIDES[type] } : {}),
    ...(UNIT_HINT_OVERRIDES[type] ? { unitHints: UNIT_HINT_OVERRIDES[type] } : {}),
    promptAliases: buildPromptAliases(type, tags),
    promptPhrases: buildPromptPhrases(type),
    aiFields: aiOverride?.fields || ['entity'],
    ...(aiOverride?.example ? { aiExample: aiOverride.example } : {}),
    aiPurpose: aiOverride?.purpose || manifest?.description || `${manifest?.title || type} module`,
    ...(isPro && type === 'climate' ? { proDowngradeType: 'info' } : {}),
    ...(isPro &&
    (type === 'animated_weather' || type === 'animated_forecast' || type === 'dynamic_weather')
      ? { proDowngradeType: 'icon' }
      : {}),
  };
}

/** Metadata specs for every manifest module plus library-only entries. */
export const SMART_MODULE_SPEC_DEFINITIONS: SmartModuleSpec[] = CORE_MANIFESTS.map(manifest =>
  buildSpecForType(manifest.type)
);

export const SMART_LIBRARY_ONLY_TYPES = LIBRARY_ONLY_TYPES;
export const SMART_CONTAINER_TYPE_SET = CONTAINER_TYPES;

export function getManifestTypesMissingRegistry(): string[] {
  const registered = new Set(SMART_MODULE_SPEC_DEFINITIONS.map(spec => spec.type));
  return CORE_MANIFESTS.filter(manifest => !registered.has(manifest.type)).map(manifest => manifest.type);
}
