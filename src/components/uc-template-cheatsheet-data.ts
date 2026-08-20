/**
 * Reference data for Template Mode: the context variables a template receives,
 * the properties it can return, and worked examples per module.
 *
 * Kept separate from `uc-template-cheatsheet.ts` so non-UI consumers can read it
 * without pulling in the dialog: the in-app cheatsheet, the Hub templates tab,
 * and the ultracard.io Template Mode page all render from this one source.
 */

export interface CheatsheetEntry {
  key: string;
  type: string;
  description: string;
  snippet: string;
  modules: string[];
}

/** Context variables available in all unified templates (from template-context.ts) */
export const CONTEXT_VARIABLES: Omit<CheatsheetEntry, 'modules'>[] = [
  { key: 'entity', type: 'string', description: 'Entity ID (e.g., sensor.temperature)', snippet: '{{ entity }}' },
  { key: 'state', type: 'string', description: 'Current entity state value', snippet: '{{ state }}' },
  { key: 'name', type: 'string', description: 'Custom name or friendly name', snippet: '{{ name }}' },
  { key: 'friendly_name', type: 'string', description: "Entity's friendly_name attribute", snippet: '{{ friendly_name }}' },
  { key: 'attributes', type: 'object', description: 'All entity attributes', snippet: '{{ attributes }}' },
  { key: 'unit', type: 'string', description: 'Unit of measurement (e.g., °C, %)', snippet: '{{ unit }}' },
  { key: 'domain', type: 'string', description: 'Entity domain (sensor, light, switch, etc.)', snippet: '{{ domain }}' },
  { key: 'device_class', type: 'string', description: 'Device class attribute', snippet: '{{ device_class }}' },
  { key: 'state_number', type: 'number', description: 'Parsed numeric state value', snippet: '{{ state_number }}' },
  { key: 'state_boolean', type: 'boolean', description: 'Boolean interpretation of state (on/true/yes)', snippet: '{{ state_boolean }}' },
  { key: 'config', type: 'object', description: 'Config object passed to template', snippet: '{{ config }}' },
];

/** Return properties the template can output (from template-parser.ts UnifiedTemplateResult) */
export const RETURN_PROPERTIES: CheatsheetEntry[] = [
  { key: 'icon', type: 'string', description: 'Icon name (e.g., mdi:fire)', snippet: '"icon": "mdi:fire"', modules: ['icon', 'info', 'text'] },
  { key: 'icon_color', type: 'string', description: 'Icon color (CSS color value)', snippet: '"icon_color": "red"', modules: ['icon', 'info', 'text'] },
  { key: 'container_background_color', type: 'string', description: 'Container background color', snippet: '"container_background_color": "rgba(255,0,0,0.1)"', modules: ['icon', 'info', 'markdown', 'text'] },
  { key: 'name', type: 'string', description: 'Display name text', snippet: '"name": "{{ friendly_name }}"', modules: ['icon', 'info'] },
  { key: 'name_color', type: 'string', description: 'Name text color', snippet: '"name_color": "var(--primary-color)"', modules: ['icon', 'info'] },
  { key: 'state_text', type: 'string', description: 'State value text ("state" also works as an alias)', snippet: '"state_text": "{{ state }} {{ unit }}"', modules: ['icon', 'info'] },
  { key: 'state_color', type: 'string', description: 'State text color', snippet: '"state_color": "green"', modules: ['icon', 'info'] },
  {
    key: 'active',
    type: 'boolean',
    description:
      'Force the icon\'s active state, choosing between the active and inactive icon and colors ("is_active" also works)',
    snippet: '"active": {{ state_number > 50 }}',
    modules: ['icon'],
  },
  {
    key: 'content',
    type: 'string',
    description:
      'Text or markdown body. HTML tags are shown as text, not parsed — style it with the color keys below, or use the Markdown module with Enable HTML for real markup.',
    snippet: '"content": "{{ state }}"',
    modules: ['text', 'markdown'],
  },
  {
    key: 'color',
    type: 'string',
    description: 'Text, bar fill or status color (CSS color)',
    snippet: '"color": "#333"',
    modules: ['text', 'markdown', 'bar', 'status_summary'],
  },
  {
    key: 'value',
    type: 'number | string',
    description: 'Displayed value for bar, gauge and spinbox',
    snippet: '"value": {{ state_number }}',
    modules: ['bar', 'gauge', 'spinbox'],
  },
  { key: 'label', type: 'string', description: 'Bar label text', snippet: '"label": "{{ name }}"', modules: ['bar'] },
  {
    key: 'left_label',
    type: 'string',
    description: 'Bar left label text',
    snippet: '"left_label": "{{ name }}"',
    modules: ['bar'],
  },
  {
    key: 'right_label',
    type: 'string',
    description: 'Bar right label text',
    snippet: '"right_label": "{{ state }} {{ unit }}"',
    modules: ['bar'],
  },
  {
    key: 'value_min',
    type: 'number | string',
    description: 'Bar scale minimum',
    snippet: '"value_min": 0',
    modules: ['bar'],
  },
  {
    key: 'value_max',
    type: 'number | string',
    description: 'Bar scale maximum',
    snippet: '"value_max": 100',
    modules: ['bar'],
  },
  {
    key: 'ticks',
    type: '[{position, label?, color?}]',
    description:
      'Per-tick scale customization. Position is in entity units; color applies to both the tick mark and its label. Overrides static custom ticks/labels when provided. Use "-" as a label to hide it.',
    snippet:
      '"ticks": [{"position": 20, "label": "Low", "color": "#f44336"}, {"position": 80, "label": "High", "color": "#4caf50"}]',
    modules: ['bar'],
  },
  { key: 'gauge_color', type: 'string', description: 'Gauge color', snippet: '"gauge_color": "red"', modules: ['gauge'] },
  { key: 'colors', type: 'string[]', description: 'Array of colors for graphs', snippet: '"colors": ["red","green"]', modules: ['graphs'] },
  { key: 'global_color', type: 'string', description: 'Single color for all graph entities', snippet: '"global_color": "blue"', modules: ['graphs'] },
  { key: 'fill_area', type: 'boolean', description: 'Control line chart area fill', snippet: '"fill_area": true', modules: ['graphs'] },
  { key: 'pie_fill', type: 'number | string', description: 'Pie/donut slice fill percentage', snippet: '"pie_fill": 0.8', modules: ['graphs'] },
  { key: 'button_background_color', type: 'string', description: 'Spinbox button background', snippet: '"button_background_color": "#333"', modules: ['spinbox'] },
  { key: 'button_text_color', type: 'string', description: 'Spinbox button text color', snippet: '"button_text_color": "#fff"', modules: ['spinbox'] },
  { key: 'value_color', type: 'string', description: 'Spinbox value text color', snippet: '"value_color": "#000"', modules: ['spinbox'] },
  { key: 'entity', type: 'string', description: 'Camera entity ID', snippet: '"entity": "camera.front_door"', modules: ['camera'] },
  {
    key: 'visible',
    type: 'boolean',
    description: 'Camera stream visibility',
    snippet: '"visible": true',
    modules: ['camera'],
  },
  {
    key: 'visible',
    type: 'boolean',
    description: 'Layout row/column visibility (unified template on row or column)',
    snippet: '"visible": {{ states(\'input_boolean.show_section\') == \'on\' }}',
    modules: ['layout'],
  },
  { key: 'overlay_text', type: 'string', description: 'Camera overlay text', snippet: '"overlay_text": "Live"', modules: ['camera'] },
  { key: 'overlay_color', type: 'string', description: 'Camera overlay text color', snippet: '"overlay_color": "white"', modules: ['camera'] },
  {
    key: 'card_background',
    type: 'string',
    description: 'Card container background (color or gradient)',
    snippet: '"card_background": "#1b1f3a"',
    modules: ['card'],
  },
  {
    key: 'card_border_color',
    type: 'string',
    description: 'Card border color',
    snippet: '"card_border_color": "var(--divider-color)"',
    modules: ['card'],
  },
  {
    key: 'card_border_radius',
    type: 'number | string',
    description: 'Card border radius in px',
    snippet: '"card_border_radius": 12',
    modules: ['card'],
  },
  {
    key: 'card_border_width',
    type: 'number | string',
    description: 'Card border width in px',
    snippet: '"card_border_width": 1',
    modules: ['card'],
  },
  {
    key: 'card_padding',
    type: 'number | string',
    description: 'Card inner padding in px',
    snippet: '"card_padding": 16',
    modules: ['card'],
  },
  {
    key: 'card_shadow_enabled',
    type: 'boolean',
    description: 'Enable custom card drop shadow',
    snippet: '"card_shadow_enabled": true',
    modules: ['card'],
  },
  {
    key: 'card_shadow_color',
    type: 'string',
    description: 'Card shadow color',
    snippet: '"card_shadow_color": "rgba(0,0,0,0.15)"',
    modules: ['card'],
  },
  {
    key: 'card_shadow_horizontal',
    type: 'number | string',
    description: 'Card shadow horizontal offset (px)',
    snippet: '"card_shadow_horizontal": 0',
    modules: ['card'],
  },
  {
    key: 'card_shadow_vertical',
    type: 'number | string',
    description: 'Card shadow vertical offset (px)',
    snippet: '"card_shadow_vertical": 2',
    modules: ['card'],
  },
  {
    key: 'card_shadow_blur',
    type: 'number | string',
    description: 'Card shadow blur radius (px)',
    snippet: '"card_shadow_blur": 8',
    modules: ['card'],
  },
  {
    key: 'card_shadow_spread',
    type: 'number | string',
    description: 'Card shadow spread (px)',
    snippet: '"card_shadow_spread": 0',
    modules: ['card'],
  },
  {
    key: 'match',
    type: 'boolean | string',
    description: 'When true (or on/yes/1) this toggle point is selected',
    snippet: '"match": "{{ states(\'light.kitchen\') == \'on\' }}"',
    modules: ['toggle'],
  },
  {
    key: 'qr_content',
    type: 'string',
    description: 'URL or text encoded in the QR code',
    snippet: '"qr_content": "{{ states(\'input_text.guest_wifi\') }}"',
    modules: ['qr'],
  },
];

/** Full example templates by module */
export const EXAMPLE_TEMPLATES: Record<string, { label: string; code: string }[]> = {
  icon: [
    {
      label: 'Simple icon by temperature',
      code: '{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}',
    },
    {
      label: 'Battery icon and color',
      code: `{% set level = state | int %}
{
  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",
  "icon_color": "{% if level <= 20 %}#FF0000{% elif level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"
}`,
    },
  ],
  info: [
    {
      label: 'Icon and color by state',
      code: `{
  "icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}",
  "icon_color": "{% if state|int > 25 %}red{% else %}blue{% endif %}",
  "state_text": "{{ state }} {{ unit }}"
}`,
    },
    {
      label: 'Full styling',
      code: `{
  "name": "{{ friendly_name }}",
  "state_text": "{{ state }}°F",
  "icon_color": "{% if state|int > 75 %}#FF0000{% else %}#00FF00{% endif %}",
  "container_background_color": "rgba(255, 0, 0, 0.1)"
}`,
    },
  ],
  text: [
    {
      // Text modules have no entity of their own, so the entity context
      // variables (`state`, `unit`, ...) are empty here — name the entity.
      label: 'Dynamic text with unit',
      code: `{% set s = states.sensor.temperature %}
{{ s.name }}: {{ s.state }} {{ s.attributes.unit_of_measurement }}`,
    },
    {
      // A <span style="..."> in "content" renders as literal text, which is the
      // single most common Template Mode surprise. Colour belongs in its own key.
      label: 'Styled text via JSON (HTML tags will not work here)',
      code: `{% set t = states('sensor.temperature') | float(0) %}
{
  "content": "Temperature: {{ t }}°",
  "color": "{% if t > 30 %}#FF4444{% else %}var(--primary-text-color){% endif %}"
}`,
    },
    {
      label: 'Multi-entity summary',
      code: `{% set temp = states('sensor.temperature') %}
{% set hum = states('sensor.humidity') %}
{
  "content": "🌡 {{ temp }}° · 💧 {{ hum }}%",
  "color": "{% if temp|float > 30 %}red{% else %}var(--primary-text-color){% endif %}"
}`,
    },
    {
      label: 'Text with dynamic icon and icon color',
      code: `{% set t = states('sensor.temperature') | float(0) %}
{
  "content": "{{ t }}°",
  "color": "{% if t > 30 %}#FF4444{% else %}var(--primary-text-color){% endif %}",
  "icon": "{% if t > 30 %}mdi:fire{% elif t < 10 %}mdi:snowflake{% else %}mdi:thermometer{% endif %}",
  "icon_color": "{% if t > 30 %}#FF4444{% elif t < 10 %}#2196F3{% else %}var(--primary-color){% endif %}"
}`,
    },
  ],
  markdown: [
    {
      // The one place template output can carry markup — and only with the
      // module's Enable HTML switch on, which is off by default.
      label: 'Inline HTML (needs Enable HTML on the module)',
      code: `{% set t = states('sensor.temperature') | float(0) %}
{
  "content": "Temperature: <span style=\\"color:{% if t > 30 %}#FF4444{% else %}#4CAF50{% endif %}\\">{{ t }}°</span>"
}`,
    },
    {
      label: 'Status dashboard',
      code: `{
  "content": "## Status\\n\\n- **Temp:** {{ states('sensor.temp') }}°\\n- **Mode:** {{ states('climate.home') }}"
}`,
    },
    {
      // As with text, a markdown module has no entity context of its own.
      label: 'Styled markdown with background',
      code: `{% set s = states.sensor.temp %}
{
  "content": "### {{ s.name }}\\n\\nCurrent: **{{ s.state }}{{ s.attributes.unit_of_measurement }}**\\n\\nLast updated: {{ as_timestamp(s.last_changed) | timestamp_custom('%H:%M') }}",
  "color": "{% if s.state | float(0) > 25 %}#FF6B6B{% else %}var(--primary-text-color){% endif %}",
  "container_background_color": "rgba(0,0,0,0.05)"
}`,
    },
  ],
  bar: [
    {
      label: 'Battery percentage with label',
      code: `{% set level = state | float %}
{
  "value": {{ level }},
  "label": "{{ friendly_name }} — {{ level | round(0) }}%"
}`,
    },
    {
      label: 'Disk usage with color thresholds',
      code: `{% set used = state | float %}
{
  "value": {{ used }},
  "label": "{{ friendly_name }}: {{ used | round(1) }}%",
  "color": "{% if used > 90 %}#FF0000{% elif used > 70 %}#FF8800{% else %}#4CAF50{% endif %}"
}`,
    },
    {
      label: 'Battery 20–80% range highlight',
      code: `{% set lvl = state | float %}
{
  "value": {{ lvl }},
  "ticks": [
    {"position": 0,   "label": "0%",   "color": "var(--secondary-text-color)"},
    {"position": 20,  "label": "20%",  "color": "#4caf50"},
    {"position": 50,  "label": "-"},
    {"position": 80,  "label": "80%",  "color": "#4caf50"},
    {"position": 100, "label": "100%", "color": "var(--secondary-text-color)"}
  ]
}`,
    },
    {
      label: 'Fuel gauge with reserve mark',
      code: `{% set lvl = state | float %}
{
  "value": {{ lvl }},
  "value_min": 0,
  "value_max": 60,
  "ticks": [
    {"position": 0,  "label": "E",       "color": "#f44336"},
    {"position": 8,  "label": "Reserve", "color": "#f44336"},
    {"position": 30, "label": "1/2"},
    {"position": 60, "label": "F",       "color": "#4caf50"}
  ]
}`,
    },
    {
      label: 'Dynamic colors via Jinja loop',
      code: `{% set lvl = state | float %}
{% set marks = [0, 25, 50, 75, 100] %}
{
  "value": {{ lvl }},
  "ticks": [
    {% for m in marks %}
    {
      "position": {{ m }},
      "label": "{{ m }}%",
      "color": "{% if m == (lvl // 25 * 25) | int %}#2196f3{% else %}var(--secondary-text-color){% endif %}"
    }{{ "," if not loop.last }}
    {% endfor %}
  ]
}`,
    },
  ],
  gauge: [
    {
      label: 'Temperature gauge with color',
      code: `{% set temp = state | float %}
{
  "value": {{ temp }},
  "gauge_color": "{% if temp > 25 %}#FF4444{% elif temp > 20 %}#FF8800{% else %}#00CC00{% endif %}"
}`,
    },
    {
      label: 'Humidity gauge',
      code: `{% set hum = state | float %}
{
  "value": {{ hum }},
  "gauge_color": "{% if hum > 70 %}#2196F3{% elif hum > 40 %}#4CAF50{% else %}#FF9800{% endif %}"
}`,
    },
  ],
  graphs: [
    {
      label: 'Color line by current value',
      code: `{
  "global_color": "{% if state_number > 25 %}#FF4444{% elif state_number > 15 %}#FF8800{% else %}#4CAF50{% endif %}"
}`,
    },
    {
      label: 'Multi-entity colors with fill',
      code: `{
  "colors": ["#2196F3", "#4CAF50", "#FF9800"],
  "fill_area": {{ states('input_boolean.show_fill') == 'on' }}
}`,
    },
    {
      label: 'Pie chart fill from state',
      code: `{% set pct = state | float / 100 %}
{
  "pie_fill": {{ pct | round(2) }},
  "global_color": "{% if pct > 0.8 %}#4CAF50{% elif pct > 0.5 %}#FF9800{% else %}#F44336{% endif %}"
}`,
    },
  ],
  spinbox: [
    {
      label: 'Color buttons by temperature',
      code: `{% set temp = state | float %}
{
  "button_background_color": "{% if temp > 25 %}#FF4444{% elif temp > 18 %}#FF8800{% else %}#2196F3{% endif %}",
  "button_text_color": "white",
  "value_color": "{% if temp > 25 %}#FF4444{% else %}var(--primary-text-color){% endif %}"
}`,
    },
    {
      label: 'Dimmer-style styling',
      code: `{% set level = state | int %}
{
  "button_background_color": "{% if level > 0 %}var(--primary-color){% else %}var(--disabled-color){% endif %}",
  "button_text_color": "var(--text-primary-color)",
  "value_color": "{% if level > 0 %}var(--primary-text-color){% else %}var(--disabled-text-color){% endif %}"
}`,
    },
  ],
  camera: [
    {
      label: 'Switch camera by weather',
      code: "{{ 'camera.outdoor' if is_state('weather.home', 'sunny') else 'camera.indoor' }}",
    },
    {
      label: 'Camera with overlay',
      code: `{
  "entity": "camera.front_door",
  "overlay_text": "{{ now().strftime('%H:%M') }}",
  "overlay_color": "white"
}`,
    },
  ],
  toggle: [
    {
      label: 'Match by numeric range',
      code: `{
  "match": "{{ state_attr('cover.garage', 'current_position') | int >= 15 and state_attr('cover.garage', 'current_position') | int <= 25 }}"
}`,
    },
    {
      label: 'Plain boolean Jinja',
      code: "{{ states('climate.hvac') == 'heat' and state_attr('climate.hvac', 'temperature') | float > 20 }}",
    },
  ],
  qr: [
    {
      label: 'Guest Wi\u2011Fi from helper',
      code: `{
  "qr_content": "{{ states('input_text.guest_wifi_password') }}"
}`,
    },
    {
      label: 'Plain URL string',
      code: "{{ 'https://' + states('sensor.door_url_suffix') }}",
    },
  ],
  status_summary: [
    {
      label: 'Color by entity state',
      code: `{
  "color": "{% if is_state(entity, 'on') %}#4caf50{% else %}var(--disabled-text-color){% endif %}"
}`,
    },
    {
      label: 'Plain color string',
      code: '{{ \'#2196f3\' if state|float > 25 else \'#ff9800\' }}',
    },
  ],
  layout: [
    {
      label: 'Boolean visible from helper',
      code: `{
  "visible": {{ states('input_boolean.show_section') == 'on' }}
}`,
    },
    {
      label: 'Plain true/false string',
      code: "{{ 'true' if states('sensor.count') | int > 0 else 'false' }}",
    },
  ],
  card: [
    {
      label: 'Background by time of day',
      code: `{% set period = states('sensor.day_period') %}
{% if period == 'night' %}
  #1b1f3a
{% elif period == 'morning' %}
  #fff3cd
{% elif period == 'afternoon' %}
  #d1ecf1
{% else %}
  #343a40
{% endif %}`,
    },
    {
      label: 'Full card appearance JSON',
      code: `{% set period = states('sensor.day_period') %}
{
  "card_background": "{% if period == 'night' %}#1b1f3a{% else %}var(--card-background-color){% endif %}",
  "card_border_color": "{% if period == 'night' %}#3d4570{% else %}var(--divider-color){% endif %}",
  "card_border_radius": 12,
  "card_padding": 16,
  "card_shadow_enabled": true,
  "card_shadow_color": "rgba(0,0,0,0.2)"
}`,
    },
  ],
};

/**
 * Where a unified template is attached in config. Icons and info entities are
 * templated per item; toggle points per point; everything else per module.
 */
export type TemplateTarget = 'module' | 'icons' | 'info_entities' | 'toggle_points' | 'qr';

/**
 * ultracard.io Template Mode playground wiring for one scope.
 * Lives on the scope so a new TEMPLATE_SCOPES entry gets a playground
 * automatically once these fields are filled in.
 */
export interface TemplateScopeDemo {
  /** Default entity the playground binds the module to. Empty for layout/card. */
  entity: string;
  /** When set, the builder reads from a named entity rather than the bound one. */
  readFrom?: 'named';
  /** How the playground preview is staged. Defaults to the module itself. */
  preview?: 'module' | 'layout' | 'card';
  /** Return keys the builder can drive for this scope. */
  builderKeys: string[];
  /** Shape the default module so it points at the playground entity. */
  bind?: (module: any, entity: string) => void;
  /** Cheap merge applied on every keystroke with the current template string. */
  patch?: (tpl: string) => Record<string, unknown>;
}

/**
 * Teaching metadata for each place Template Mode can be switched on: what it
 * controls, why you'd reach for it, and which module renders it.
 *
 * Ordered the way a new user should meet them — the visual, obvious wins first.
 */
export interface TemplateScope {
  /** Key into EXAMPLE_TEMPLATES / RETURN_PROPERTIES.modules. */
  id: string;
  label: string;
  icon: string;
  /** Where the toggle lives in the editor. */
  where: string;
  /** The one-sentence reason to use templates here. */
  why: string;
  /** Concrete things people build with it. */
  useCases: string[];
  /**
   * Whether the template runs with an entity in context.
   *
   * Modules bound to an entity pass it in, so `state`, `unit`, `attributes` and
   * friends resolve. Text, Markdown and QR templates have no entity of their
   * own — there, name the entity with `states('sensor.x')` instead.
   */
  entityContext: boolean;
  /** Module type in the registry, for a live preview. */
  demoType?: string;
  target?: TemplateTarget;
  /** Playground wiring for ultracard.io/template-mode. */
  demo?: TemplateScopeDemo;
}

export const TEMPLATE_SCOPES: TemplateScope[] = [
  {
    id: 'icon',
    label: 'Icon',
    icon: 'mdi:emoticon-happy-outline',
    where: 'Icon module → per icon → Template Mode',
    why: 'One icon can stand in for a dozen. The template picks the glyph, its colour, the name and the state text every time the entity changes, so a single icon reports level, status and urgency at a glance.',
    useCases: [
      'Battery glyph that steps through mdi:battery-10 … mdi:battery-100',
      'Red when a door is open, dimmed grey when everything is closed',
      'Weather icon driven by the current condition attribute',
      'Drive the active/inactive state so animations fire on your own rule',
    ],
    entityContext: true,
    demoType: 'icon',
    target: 'icons',
    demo: {
      entity: 'sensor.temperature',
      builderKeys: ['icon', 'icon_color', 'state_text', 'name_color'],
      bind(m, entity) {
        const base = (m.icons && m.icons[0]) || {};
        m.icons = [
          Object.assign({}, base, {
            id: 'uct_icon',
            icon_mode: 'entity',
            entity,
            name: '',
            icon_active: 'mdi:thermometer',
            icon_inactive: 'mdi:thermometer',
          }),
        ];
      },
      patch(tpl) {
        return { icons: [{ unified_template_mode: true, unified_template: tpl }] };
      },
    },
  },
  {
    id: 'info',
    label: 'Info',
    icon: 'mdi:information-outline',
    where: 'Info module → per entity → Template Mode',
    why: 'Info rows are where raw states go to look ugly. Templates reformat the value, rename the row, and colour it by threshold, per entity, without adding more modules.',
    useCases: [
      'Show "Warm · 24.6 °C" instead of "24.6"',
      'Turn the row background red while a leak sensor is wet',
      'Rename rows from an attribute so one card works in every room',
    ],
    entityContext: true,
    demoType: 'info',
    target: 'info_entities',
    demo: {
      entity: 'sensor.temperature',
      builderKeys: ['icon', 'icon_color', 'state_text', 'name', 'state_color', 'container_background_color'],
      bind(m, entity) {
        const base = (m.info_entities && m.info_entities[0]) || {};
        m.info_entities = [Object.assign({}, base, { id: 'uct_info', entity, name: '' })];
      },
      patch(tpl) {
        return { info_entities: [{ unified_template_mode: true, unified_template: tpl }] };
      },
    },
  },
  {
    id: 'text',
    label: 'Text',
    icon: 'mdi:format-text',
    where: 'Text module → Template Mode',
    why: 'Write a sentence instead of stacking modules. A text template can read as many entities as you like and return the copy, its colour, and an icon to sit beside it.',
    useCases: [
      '"3 lights on · house locked" summary line',
      'Turn the sentence red only when something needs attention',
      'Pluralise and pick units correctly ("1 door open" vs "2 doors open")',
    ],
    entityContext: false,
    demoType: 'text',
    target: 'module',
    demo: {
      entity: 'sensor.temperature',
      builderKeys: ['content', 'color', 'icon', 'icon_color'],
      bind(m) {
        m.text = 'Static text';
        m.font_size = 20;
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'markdown',
    label: 'Markdown',
    icon: 'mdi:language-markdown-outline',
    where: 'Markdown module → Template Mode',
    why: 'Full markdown built from live data: headings, lists and bold values in one block, so a status panel is one module instead of fifteen.',
    useCases: [
      'A "house report" list that rebuilds itself as states change',
      'Loop over a group and print a line per member',
      'Timestamp the last change with timestamp_custom',
    ],
    entityContext: false,
    demoType: 'markdown',
    target: 'module',
    demo: {
      entity: 'sensor.temperature',
      builderKeys: ['content', 'color', 'container_background_color'],
      bind(m) {
        m.markdown_content = '### Static markdown';
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'bar',
    label: 'Bar',
    icon: 'mdi:chart-bar',
    where: 'Bar module → Template Mode',
    why: 'The value, the scale and the tick marks all become computed. Bars can measure something no single entity reports, and recolour themselves as they cross your thresholds.',
    useCases: [
      'Percentage derived from two sensors (used ÷ total)',
      'Green under 70, amber to 90, red above',
      'Custom scale labels: E / Reserve / 1/2 / F on a fuel bar',
    ],
    entityContext: true,
    demoType: 'bar',
    target: 'module',
    demo: {
      entity: 'sensor.battery',
      builderKeys: ['label', 'color'],
      bind(m, entity) {
        m.entity = entity;
        if (m.bars && m.bars[0]) m.bars[0].entity = entity;
        m.left_enabled = true;
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'gauge',
    label: 'Gauge',
    icon: 'mdi:gauge',
    where: 'Gauge module → Template Mode',
    why: 'Compute the needle from a formula and paint the dial by severity, so the gauge reads as a warning light as well as a number.',
    useCases: [
      'Combine several sensors into one score',
      'Colour the dial by how close the value is to its limit',
      'Convert units before display',
    ],
    entityContext: true,
    demoType: 'gauge',
    target: 'module',
    demo: {
      entity: 'sensor.temperature',
      builderKeys: ['gauge_color'],
      bind(m, entity) {
        m.entity = entity;
        m.min_value = -5;
        m.max_value = 45;
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'graphs',
    label: 'Graphs',
    icon: 'mdi:chart-line',
    where: 'Graphs module → Template Mode',
    why: 'Series colours, area fill and pie fill become conditional, so a chart can flag its own bad news instead of always being blue.',
    useCases: [
      "Line turns red once today's usage passes budget",
      'Toggle area fill from a helper',
      'Set the donut fill from a percentage sensor',
    ],
    entityContext: true,
    demoType: 'graphs',
    target: 'module',
    demo: {
      entity: 'sensor.temperature',
      builderKeys: ['global_color'],
      bind(m, entity) {
        m.entities = [{ id: 'uct_g1', entity, name: 'Temperature' }];
        m.title = 'Temperature · 24h';
        m.chart_height = 150;
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'spinbox',
    label: 'Spinbox',
    icon: 'mdi:plus-minus-variant',
    where: 'Spinbox module → Template Mode',
    why: 'Colour the value and the +/- buttons by what the number means, warm at 24° and blue at 18°, so a setpoint control reads at a glance.',
    useCases: [
      'Heat/cool colouring on a thermostat setpoint',
      'Grey the buttons out while the device is off',
    ],
    entityContext: true,
    demoType: 'spinbox',
    target: 'module',
    demo: {
      entity: 'sensor.temperature',
      builderKeys: ['value_color', 'button_background_color', 'button_text_color'],
      bind(m) {
        m.value = 22;
        m.min_value = 5;
        m.max_value = 35;
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'camera',
    label: 'Camera',
    icon: 'mdi:video-outline',
    where: 'Camera module → Template Mode',
    why: 'Pick which camera to show and what to write over it at render time, so one module covers a whole set of cameras.',
    useCases: [
      'Swap to the driveway camera when motion is detected',
      'Stamp the current time or the door state over the stream',
      'Hide the stream entirely while everyone is home',
    ],
    entityContext: true,
    demoType: 'camera',
    target: 'module',
    demo: {
      entity: 'camera.front_door',
      readFrom: 'named',
      builderKeys: ['overlay_text', 'overlay_color'],
      bind(m, entity) {
        m.entity = entity;
        m.camera_name = 'Front Door';
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'toggle',
    label: 'Toggle',
    icon: 'mdi:toggle-switch-outline',
    where: 'Toggle module → per point → Match Mode: Template (Advanced)',
    why: 'Decide which toggle point counts as selected with a rule instead of a single exact state. Ranges, attributes and combinations all work.',
    useCases: [
      'Highlight "half open" when a cover sits between 15% and 25%',
      'Select a point from two entities agreeing',
    ],
    entityContext: true,
    demoType: 'toggle',
    target: 'toggle_points',
    demo: {
      entity: 'cover.garage',
      builderKeys: ['match'],
      bind(m, entity) {
        m.tracking_entity = entity;
      },
      patch(tpl) {
        return {
          toggle_points: [
            { match_mode: 'template', unified_template_mode: true, unified_template: tpl },
          ],
        };
      },
    },
  },
  {
    id: 'qr',
    label: 'QR code',
    icon: 'mdi:qrcode',
    where: 'QR module → Content source → Unified template',
    why: 'Generate the encoded payload live, so the code always carries the current value rather than something you pasted once.',
    useCases: [
      'Guest Wi-Fi password from an input_text',
      'A URL assembled from a sensor',
    ],
    entityContext: false,
    demoType: 'qr_code',
    target: 'qr',
    demo: {
      entity: 'input_text.guest_wifi_password',
      builderKeys: ['qr_content'],
      patch(tpl) {
        return { content_mode: 'unified', unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'status_summary',
    label: 'Status summary',
    icon: 'mdi:view-list-outline',
    where: 'Status Summary → module or per entity → Template Mode',
    why: 'Colour each summarised entity by your own rule, either once for the whole module or per row.',
    useCases: [
      'Green for on, dimmed for off, red for unavailable',
      'Per-entity overrides for the ones that matter most',
    ],
    entityContext: true,
    demoType: 'status_summary',
    target: 'module',
    demo: {
      entity: 'binary_sensor.door',
      builderKeys: ['color'],
      bind(m, entity) {
        m.enable_auto_filter = false;
        m.entities = [{ id: 'uct_ss1', entity }];
        m.max_items_to_show = 1;
      },
      patch(tpl) {
        return { unified_template_mode: true, unified_template: tpl };
      },
    },
  },
  {
    id: 'layout',
    label: 'Rows & columns',
    icon: 'mdi:view-dashboard-outline',
    where: 'Row or column → Logic tab → Template Mode',
    why: 'Return `visible` and whole sections of the card appear and disappear: one dashboard that reshapes itself instead of several you switch between.',
    useCases: [
      'Hide the away-mode section while someone is home',
      'Only show the irrigation row in summer',
      'Reveal a debug row from a helper toggle',
    ],
    entityContext: false,
    demo: {
      entity: '',
      preview: 'layout',
      builderKeys: ['visible'],
    },
  },
  {
    id: 'card',
    label: 'Card appearance',
    icon: 'mdi:card-outline',
    where: 'Card Settings → Appearance Template Mode',
    why: 'Background, border, radius, padding and shadow become live, so the card itself responds to context: dark at night, red during an alarm.',
    useCases: [
      'Night-time background tint',
      'Red border while the alarm is triggered',
      'Tighter padding on a wall tablet dashboard',
    ],
    entityContext: false,
    demo: {
      entity: '',
      preview: 'card',
      builderKeys: ['card_background', 'card_border_color'],
    },
  },
];
