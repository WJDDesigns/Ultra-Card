/**
 * Playground controls for ultracard.io/template-mode.
 *
 * Kept beside the demo hass so a scope cannot reference an entity that does
 * not exist in the simulated home. Exposed as UCDemo.templates.playground.
 */

export interface PlaygroundSimEntity {
  id: string;
  label: string;
  icon: string;
  kind: 'range' | 'switch' | 'choice';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  attr?: string;
  on?: string;
  off?: string;
  onLabel?: string;
  offLabel?: string;
  options?: string[];
}

export interface PlaygroundSource {
  id: string;
  label: string;
  numeric: boolean;
  high?: number;
  low?: number;
  match?: string;
  words: string[];
  colors: string[];
  icons: string[];
}

/** Entities the playground sliders/switches can drive. */
export const PLAYGROUND_SIM: PlaygroundSimEntity[] = [
  {
    id: 'sensor.temperature',
    label: 'sensor.temperature',
    icon: 'mdi:thermometer',
    kind: 'range',
    min: -5,
    max: 42,
    step: 0.5,
    unit: ' °C',
  },
  {
    id: 'sensor.battery',
    label: 'sensor.battery',
    icon: 'mdi:battery-60',
    kind: 'range',
    min: 0,
    max: 100,
    step: 1,
    unit: ' %',
  },
  {
    id: 'sensor.humidity',
    label: 'sensor.humidity',
    icon: 'mdi:water-percent',
    kind: 'range',
    min: 0,
    max: 100,
    step: 1,
    unit: ' %',
  },
  {
    id: 'cover.garage',
    label: 'cover.garage',
    icon: 'mdi:garage',
    kind: 'range',
    min: 0,
    max: 100,
    step: 5,
    attr: 'current_position',
    unit: ' %',
  },
  {
    id: 'binary_sensor.door',
    label: 'binary_sensor.door',
    icon: 'mdi:door',
    kind: 'switch',
    on: 'on',
    off: 'off',
    onLabel: 'Open',
    offLabel: 'Closed',
  },
  {
    id: 'input_boolean.show_section',
    label: 'input_boolean.show_section',
    icon: 'mdi:eye-outline',
    kind: 'switch',
    on: 'on',
    off: 'off',
    onLabel: 'On',
    offLabel: 'Off',
  },
  {
    id: 'input_boolean.show_fill',
    label: 'input_boolean.show_fill',
    icon: 'mdi:chart-areaspline',
    kind: 'switch',
    on: 'on',
    off: 'off',
    onLabel: 'On',
    offLabel: 'Off',
  },
  {
    id: 'sensor.day_period',
    label: 'sensor.day_period',
    icon: 'mdi:theme-light-dark',
    kind: 'choice',
    options: ['night', 'morning', 'afternoon', 'evening'],
  },
  {
    id: 'weather.home',
    label: 'weather.home',
    icon: 'mdi:weather-partly-cloudy',
    kind: 'choice',
    options: ['sunny', 'cloudy', 'rainy', 'snowy'],
  },
];

/**
 * Entities offered as the "read from" source in the builder.
 * Order of words/colors/icons is always [high branch, low branch, otherwise].
 */
export const PLAYGROUND_SOURCES: PlaygroundSource[] = [
  {
    id: 'sensor.temperature',
    label: 'sensor.temperature (a number in °C)',
    numeric: true,
    high: 28,
    low: 12,
    words: ['Too warm', 'Too cold', 'Comfortable'],
    colors: ['#ff4444', '#2196f3', '#4ade80'],
    icons: ['mdi:fire', 'mdi:snowflake', 'mdi:thermometer'],
  },
  {
    id: 'sensor.battery',
    label: 'sensor.battery (a percentage)',
    numeric: true,
    high: 80,
    low: 20,
    words: ['Charged', 'Low battery', 'OK'],
    colors: ['#4ade80', '#ff4444', '#ffa726'],
    icons: ['mdi:battery', 'mdi:battery-alert', 'mdi:battery-50'],
  },
  {
    id: 'sensor.humidity',
    label: 'sensor.humidity (a percentage)',
    numeric: true,
    high: 65,
    low: 35,
    words: ['Humid', 'Dry', 'Comfortable'],
    colors: ['#2196f3', '#ffa726', '#4ade80'],
    icons: ['mdi:water', 'mdi:water-off', 'mdi:water-check'],
  },
  {
    id: 'binary_sensor.door',
    label: 'binary_sensor.door (on / off)',
    numeric: false,
    match: 'on',
    words: ['Open', 'Closed'],
    colors: ['#ff4444', '#4ade80'],
    icons: ['mdi:door-open', 'mdi:door-closed'],
  },
  {
    id: 'sensor.day_period',
    label: 'sensor.day_period (night / morning / …)',
    numeric: false,
    match: 'night',
    words: ['Night', 'Daytime'],
    colors: ['#7c4dff', '#ffa726'],
    icons: ['mdi:weather-night', 'mdi:weather-sunny'],
  },
  {
    id: 'weather.home',
    label: 'weather.home (a condition)',
    numeric: false,
    match: 'sunny',
    words: ['Sunny', 'Not sunny'],
    colors: ['#ffa726', '#8d97a8'],
    icons: ['mdi:weather-sunny', 'mdi:weather-cloudy'],
  },
];
