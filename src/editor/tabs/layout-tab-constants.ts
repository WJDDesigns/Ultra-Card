/**
 * Constants and static data for the Layout tab (module palette, fonts, native cards).
 * Extracted from layout-tab.ts to support future splitting of the layout editor.
 */

export interface FontOption {
  value: string;
  label: string;
  category: string;
}

export interface NativeCardEntry {
  type: string;
  name: string;
  icon?: string;
  description?: string;
}

// Typography and font definitions matching the professional interface
export const DEFAULT_FONTS: FontOption[] = [{ value: 'default', label: '– Default –', category: 'default' }];

export const TYPOGRAPHY_FONTS: FontOption[] = [
  { value: 'Montserrat', label: 'Montserrat (used as default font)', category: 'typography' },
];

// Native Home Assistant cards (hui-* elements)
// Special entry for Custom YAML Card - allows pasting any card YAML configuration
export const CUSTOM_YAML_CARD_TYPE = 'custom-yaml-card';

export const NATIVE_HA_CARDS: NativeCardEntry[] = [
  {
    type: CUSTOM_YAML_CARD_TYPE,
    name: 'Custom YAML Card',
    icon: 'mdi:code-braces',
    description: 'Paste any card configuration',
  },
  { type: 'hui-activity-card', name: 'Activity' },
  { type: 'hui-alarm-panel-card', name: 'Alarm Panel' },
  { type: 'hui-area-card', name: 'Area' },
  { type: 'hui-button-card', name: 'Button' },
  { type: 'hui-calendar-card', name: 'Calendar' },
  { type: 'hui-clock-card', name: 'Clock' },
  { type: 'hui-conditional-card', name: 'Conditional' },
  { type: 'hui-entities-card', name: 'Entities' },
  { type: 'hui-entity-card', name: 'Entity' },
  { type: 'hui-entity-filter-card', name: 'Entity Filter' },
  { type: 'hui-gauge-card', name: 'Gauge' },
  { type: 'hui-glance-card', name: 'Glance' },
  { type: 'hui-grid-card', name: 'Grid' },
  { type: 'hui-heading-card', name: 'Heading' },
  { type: 'hui-history-graph-card', name: 'History Graph' },
  { type: 'hui-horizontal-stack-card', name: 'Horizontal Stack' },
  { type: 'hui-humidifier-card', name: 'Humidifier' },
  { type: 'hui-light-card', name: 'Light' },
  { type: 'hui-map-card', name: 'Map' },
  { type: 'hui-markdown-card', name: 'Markdown' },
  { type: 'hui-media-control-card', name: 'Media Control' },
  { type: 'hui-picture-card', name: 'Picture' },
  { type: 'hui-picture-elements-card', name: 'Picture Elements' },
  { type: 'hui-picture-entity-card', name: 'Picture Entity' },
  { type: 'hui-picture-glance-card', name: 'Picture Glance' },
  { type: 'hui-plant-status-card', name: 'Plant Status' },
  { type: 'hui-sensor-card', name: 'Sensor' },
  { type: 'hui-statistic-card', name: 'Statistic' },
  { type: 'hui-statistics-graph-card', name: 'Statistics Graph' },
  { type: 'hui-thermostat-card', name: 'Thermostat' },
  { type: 'hui-tile-card', name: 'Tile' },
  { type: 'hui-todo-list-card', name: 'To-do List' },
  { type: 'hui-vertical-stack-card', name: 'Vertical Stack' },
  { type: 'hui-weather-forecast-card', name: 'Weather Forecast' },
  { type: 'hui-webpage-card', name: 'Webpage' },
];

export const WEB_SAFE_FONTS: FontOption[] = [
  { value: 'Georgia, serif', label: 'Georgia, serif', category: 'websafe' },
  {
    value: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    label: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    category: 'websafe',
  },
  {
    value: 'Times New Roman, Times, serif',
    label: 'Times New Roman, Times, serif',
    category: 'websafe',
  },
  {
    value: 'Arial, Helvetica, sans-serif',
    label: 'Arial, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Impact, Charcoal, sans-serif',
    label: 'Impact, Charcoal, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    label: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    category: 'websafe',
  },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma, Geneva, sans-serif', category: 'websafe' },
  {
    value: 'Trebuchet MS, Helvetica, sans-serif',
    label: 'Trebuchet MS, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Verdana, Geneva, sans-serif',
    label: 'Verdana, Geneva, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Courier New, Courier, monospace',
    label: 'Courier New, Courier, monospace',
    category: 'websafe',
  },
  {
    value: 'Lucida Console, Monaco, monospace',
    label: 'Lucida Console, Monaco, monospace',
    category: 'websafe',
  },
];
