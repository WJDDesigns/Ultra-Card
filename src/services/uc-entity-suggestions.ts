import type { SmartSanitizeHass } from './uc-smart-module-sanitizer';
import {
  defaultDisplayActions,
  entityDeviceClass,
  entityIcon,
  entityName,
  iconPairForEntity,
  type SmartIconPair,
  type SmartModule,
} from './smart/smart-sanitize-utils';

/**
 * Suggestions for Home Assistant's "Add to dashboard > By entity" picker
 * (HA 2026.6+). HA calls `getEntitySuggestion(hass, entityId)` on every
 * `window.customCards` entry and lists what it returns under "Community".
 *
 * The call is synchronous, while module implementations are lazy chunks, so
 * each suggestion is a ready-made config in the same shapes the Smart layout
 * builder emits. The card's config validation fills in every remaining module
 * default on load, exactly as it does for the stub config.
 */

export interface UcEntitySuggestion {
  label?: string;
  config: Record<string, unknown>;
}

interface SuggestionContext {
  hass: SmartSanitizeHass;
  entityId: string;
  domain: string;
  name: string;
  /** Pro-only modules render behind an upgrade overlay for free users, so they are only offered to Pro. */
  pro: boolean;
}

type Builder = (ctx: SuggestionContext, id: string) => SmartModule | null;

interface SuggestionRecipe {
  label: string;
  build: Builder;
}

const NO_ACTIONS = {
  tap_action: { action: 'nothing' },
  hold_action: { action: 'nothing' },
  double_tap_action: { action: 'nothing' },
};

function wrapInCard(module: SmartModule): Record<string, unknown> {
  return {
    type: 'custom:ultra-card',
    _config_version: 2,
    card_padding: 16,
    layout: {
      rows: [{ id: 'row1', columns: [{ id: 'col1', modules: [module] }] }],
    },
  };
}

function iconsFor(ctx: SuggestionContext): SmartIconPair {
  return iconPairForEntity(
    ctx.domain,
    entityDeviceClass(ctx.hass, ctx.entityId),
    entityIcon(ctx.hass, ctx.entityId)
  );
}

function iconItem(
  ctx: SuggestionContext,
  id: string,
  icons: SmartIconPair,
  showState: boolean
): SmartModule {
  return {
    id: `${id}-icon`,
    type: 'icon',
    icons: [
      {
        id: `${id}-icon-entity`,
        icon_mode: 'entity',
        entity: ctx.entityId,
        name: ctx.name,
        icon_inactive: icons.inactive,
        icon_active: icons.active,
        inactive_state: icons.inactiveState,
        active_state: icons.activeState,
        use_entity_color_for_icon: !icons.stateless,
        show_name_when_inactive: true,
        show_name_when_active: true,
        show_state_when_inactive: showState,
        show_state_when_active: showState,
        show_icon_when_inactive: true,
        show_icon_when_active: true,
      },
    ],
    columns: 1,
    alignment: 'left',
    vertical_alignment: 'center',
  };
}

function row(id: string, modules: SmartModule[]): SmartModule {
  return {
    id,
    type: 'horizontal',
    gap: 10,
    gap_unit: 'px',
    alignment: 'space-between',
    vertical_alignment: 'center',
    modules,
  };
}

/** Icon + name on the left, the state on the right. Works for any entity. */
const statusRow: Builder = (ctx, id) =>
  row(id, [
    iconItem(ctx, id, iconsFor(ctx), false),
    {
      id: `${id}-details`,
      type: 'info',
      info_entities: [
        {
          id: `${id}-state`,
          entity: ctx.entityId,
          name: '',
          show_icon: false,
          show_name: false,
          show_state: true,
        },
      ],
      columns: 1,
      alignment: 'right',
      vertical_alignment: 'center',
    },
  ]);

/** Icon + name + state on the left, a toggle button on the right. */
const toggleRow: Builder = (ctx, id) =>
  row(id, [
    iconItem(ctx, id, iconsFor(ctx), true),
    {
      id: `${id}-toggle`,
      type: 'button',
      label: 'Toggle',
      style: 'flat',
      show_icon: true,
      icon: 'mdi:toggle-switch',
      icon_position: 'before',
      ...NO_ACTIONS,
      tap_action: { action: 'toggle', entity: ctx.entityId },
    },
  ]);

/** Icon + name on the left, a Run/Activate button on the right. */
const activateRow: Builder = (ctx, id) => {
  const isScene = ctx.domain === 'scene';
  const icon = isScene ? 'mdi:palette' : 'mdi:script-text-play';
  return row(id, [
    iconItem(ctx, id, { inactive: icon, active: icon, inactiveState: '', activeState: '', stateless: true }, false),
    {
      id: `${id}-run`,
      type: 'button',
      label: isScene ? 'Activate' : 'Run',
      style: 'flat',
      show_icon: true,
      icon: isScene ? 'mdi:play-circle-outline' : 'mdi:play',
      icon_position: 'before',
      ...NO_ACTIONS,
      tap_action: {
        action: 'perform-action',
        service: `${ctx.domain}.turn_on`,
        service_data: { entity_id: ctx.entityId },
      },
    },
  ]);
};

/** Light: icon + state with On / Off preset buttons. */
const lightButtonsRow: Builder = (ctx, id) =>
  row(id, [
    iconItem(
      ctx,
      id,
      { inactive: 'mdi:lightbulb-outline', active: 'mdi:lightbulb', inactiveState: 'off', activeState: 'on', stateless: false },
      true
    ),
    {
      id: `${id}-buttons`,
      type: 'light',
      presets: [
        {
          id: `${id}-on`,
          name: 'On',
          action: 'turn_on',
          icon: 'mdi:lightbulb-on',
          entities: [ctx.entityId],
          brightness: 255,
          use_light_color_for_icon: true,
          use_light_color_for_button: true,
          smart_color: true,
          button_style: 'filled',
          show_label: true,
          border_radius: 8,
        },
        {
          id: `${id}-off`,
          name: 'Off',
          action: 'turn_off',
          icon: 'mdi:lightbulb-off',
          entities: [ctx.entityId],
          use_light_color_for_icon: false,
          use_light_color_for_button: false,
          smart_color: true,
          button_style: 'outlined',
          show_label: true,
          border_radius: 8,
        },
      ],
      layout: 'buttons',
      button_alignment: 'right',
      allow_wrapping: false,
      button_gap: 0.4,
      columns: 2,
      show_labels: true,
      button_style: 'filled',
      default_transition_time: 0.5,
      ...NO_ACTIONS,
    },
  ]);

function sliderBar(
  ctx: SuggestionContext,
  id: string,
  type: string,
  min = 0,
  max = 100,
  step = 1
): SmartModule {
  return {
    id,
    type,
    entity: ctx.entityId,
    name: ctx.name,
    min_value: min,
    max_value: max,
    step,
    slider_style: 'theme',
    show_icon: true,
    show_name: true,
    show_value: true,
    icon_position: 'left',
    name_position: 'left',
    value_position: 'right',
    info_section_position: 'left',
    outside_text_position: 'left',
    outside_name_position: 'top_left',
    outside_value_position: 'bottom_left',
    invert_direction: false,
  };
}

function sliderControl(id: string, bars: SmartModule[]): SmartModule {
  return { id, type: 'slider_control', bars, ...defaultDisplayActions() };
}

/** Light: brightness slider, plus color and white-temperature sliders when the light supports them. */
const lightSliders: Builder = (ctx, id) => {
  const attrs = attributes(ctx);
  const modes = Array.isArray(attrs.supported_color_modes) ? (attrs.supported_color_modes as string[]) : [];
  const dimmable = modes.some(mode => mode !== 'onoff') || attrs.brightness !== undefined;
  if (!dimmable) return null;
  const bars = [sliderBar(ctx, `${id}-brightness`, 'brightness')];
  if (modes.some(mode => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(mode))) {
    bars.push(sliderBar(ctx, `${id}-rgb`, 'rgb'));
  }
  if (modes.includes('color_temp')) {
    bars.push(sliderBar(ctx, `${id}-color-temp`, 'color_temp'));
  }
  return sliderControl(id, bars);
};

/** Cover position, fan speed or a number helper as one slider. */
const numericSlider: Builder = (ctx, id) => {
  const attrs = attributes(ctx);
  if (ctx.domain === 'cover' && attrs.current_position === undefined) return null;
  if (ctx.domain === 'fan' && attrs.percentage === undefined) return null;
  const isNumber = ctx.domain === 'number' || ctx.domain === 'input_number';
  return sliderControl(id, [
    sliderBar(
      ctx,
      `${id}-bar`,
      'numeric',
      isNumber ? numberOr(attrs.min, 0) : 0,
      isNumber ? numberOr(attrs.max, 100) : 100,
      isNumber ? numberOr(attrs.step, 1) : 1
    ),
  ]);
};

/** A module that takes one `entity` and needs nothing else to render. */
function entityModule(type: string, extras: Record<string, unknown> = {}, opts: { pro?: boolean } = {}): Builder {
  return (ctx, id) => {
    if (opts.pro && !ctx.pro) return null;
    return { id, type, entity: ctx.entityId, name: ctx.name, ...defaultDisplayActions(), ...extras };
  };
}

const graph: Builder = (ctx, id) => ({
  id,
  type: 'graphs',
  title: ctx.name,
  chart_type: 'line',
  chart_height: 200,
  entities: [{ id: `${id}-graph-0`, entity: ctx.entityId, name: ctx.name }],
  time_period: '24h',
  ...defaultDisplayActions(),
});

/** Gauge only where the range is known: percentages (battery, humidity, ...). */
const percentGauge: Builder = (ctx, id) => {
  if (attributes(ctx).unit_of_measurement !== '%') return null;
  return {
    id,
    type: 'gauge',
    entity: ctx.entityId,
    name: ctx.name,
    value_type: 'entity',
    min_value: 0,
    max_value: 100,
    gauge_style: 'speedometer',
    gauge_size: 180,
    gauge_thickness: 15,
    pointer_enabled: true,
    pointer_style: 'needle',
    gauge_color_mode: 'gradient',
    use_gradient: true,
    gradient_stops: gaugeStops(id, entityDeviceClass(ctx.hass, ctx.entityId) === 'battery'),
    show_name: true,
    show_value: true,
    ...defaultDisplayActions(),
  };
};

function gaugeStops(id: string, highIsGood: boolean): SmartModule[] {
  const [low, high] = highIsGood ? ['#F44336', '#4CAF50'] : ['#4CAF50', '#F44336'];
  return [
    { id: `${id}-stop-0`, position: 0, color: low },
    { id: `${id}-stop-50`, position: 50, color: '#FFC107' },
    { id: `${id}-stop-100`, position: 100, color: high },
  ];
}

const percentBar: Builder = (ctx, id) => {
  if (attributes(ctx).unit_of_measurement !== '%') return null;
  return {
    id,
    type: 'bar',
    entity: ctx.entityId,
    name: ctx.name,
    percentage_type: 'entity',
    percentage_entity: ctx.entityId,
    percentage_min: 0,
    percentage_max: 100,
    height: 20,
    bar_style: 'flat',
    bar_size: 'medium',
    bar_radius: 'round',
    bar_direction: 'left-to-right',
    bar_width: 100,
    show_percentage: true,
    show_value: false,
    label_alignment: 'space-between',
    use_gradient: false,
    ...defaultDisplayActions(),
  };
};

const weather =
  (forecastType: 'daily' | 'hourly'): Builder =>
  (ctx, id) => ({
    id,
    type: 'weather',
    weather_entity: ctx.entityId,
    forecast_type: forecastType,
    forecast_count: 5,
    ...defaultDisplayActions(),
  });

const people: Builder = (ctx, id) => ({
  id,
  type: 'people',
  person_entity: ctx.entityId,
  layout_style: 'horizontal_compact',
  show_avatar: true,
  show_location_badge: true,
  ...defaultDisplayActions(),
});

const calendar: Builder = (ctx, id) =>
  ctx.pro
    ? {
        id,
        type: 'calendar',
        calendars: [{ id: `${id}-calendar-0`, entity: ctx.entityId, name: ctx.name, visible: true }],
        view_type: 'compact_list',
        days_to_show: 7,
        ...defaultDisplayActions(),
      }
    : null;

const dropdown: Builder = (ctx, id) => ({
  id,
  type: 'dropdown',
  source_mode: 'entity',
  source_entity: ctx.entityId,
  placeholder: ctx.name.slice(0, 60),
  ...defaultDisplayActions(),
});

const STATUS: SuggestionRecipe = { label: 'Status', build: statusRow };
const TOGGLE: SuggestionRecipe = { label: 'Toggle', build: toggleRow };

/** Ordered best-first; the first entry per domain is the one most people want. */
const RECIPES: Record<string, SuggestionRecipe[]> = {
  light: [
    { label: 'Light buttons', build: lightButtonsRow },
    { label: 'Light sliders', build: lightSliders },
    STATUS,
  ],
  switch: [TOGGLE, STATUS],
  input_boolean: [TOGGLE, { label: 'Switch', build: entityModule('boolean_input') }, STATUS],
  automation: [TOGGLE, STATUS],
  fan: [{ label: 'Fan', build: entityModule('fan', { layout: 'standard' }) }, { label: 'Speed slider', build: numericSlider }, TOGGLE],
  cover: [
    {
      label: 'Cover',
      build: entityModule('cover', {
        layout: 'standard',
        show_title: true,
        show_icon: true,
        show_state: true,
        show_position: true,
        show_stop: true,
        show_position_control: true,
      }),
    },
    { label: 'Position slider', build: numericSlider },
    STATUS,
  ],
  lock: [
    {
      label: 'Lock',
      build: entityModule('lock', {
        layout: 'standard',
        alignment: 'center',
        show_title: true,
        show_icon: true,
        show_state: true,
        show_open_button: true,
      }),
    },
    STATUS,
  ],
  climate: [{ label: 'Thermostat', build: entityModule('climate', {}, { pro: true }) }, STATUS],
  humidifier: [{ label: 'Humidifier', build: entityModule('humidifier') }, TOGGLE],
  vacuum: [{ label: 'Vacuum', build: entityModule('vacuum', {}, { pro: true }) }, STATUS],
  alarm_control_panel: [{ label: 'Alarm panel', build: entityModule('alarm_panel', {}, { pro: true }) }, STATUS],
  media_player: [
    {
      label: 'Media player',
      build: entityModule('media_player', {
        layout: 'card',
        show_name: true,
        show_album_art: true,
        show_track_info: true,
        show_progress: true,
      }),
    },
    {
      label: 'Compact player',
      build: entityModule('media_player', {
        layout: 'compact',
        show_name: true,
        show_album_art: true,
        show_track_info: true,
        show_progress: true,
      }),
    },
  ],
  camera: [{ label: 'Camera', build: entityModule('camera', { live_view: true }) }],
  weather: [
    { label: 'Daily forecast', build: weather('daily') },
    { label: 'Hourly forecast', build: weather('hourly') },
  ],
  person: [{ label: 'Person', build: people }],
  device_tracker: [{ label: 'Person', build: people }, STATUS],
  calendar: [{ label: 'Calendar', build: calendar }],
  todo: [{ label: 'To-do list', build: entityModule('todo_list') }],
  scene: [{ label: 'Activate', build: activateRow }],
  script: [{ label: 'Run', build: activateRow }],
  input_number: [{ label: 'Slider', build: numericSlider }, { label: 'Number', build: entityModule('number_input') }],
  number: [{ label: 'Slider', build: numericSlider }, STATUS],
  input_select: [{ label: 'Dropdown', build: dropdown }, STATUS],
  select: [{ label: 'Dropdown', build: dropdown }, STATUS],
  counter: [{ label: 'Counter', build: entityModule('counter_input') }, STATUS],
  input_button: [{ label: 'Button', build: entityModule('button_input') }],
};

const NUMERIC_SENSOR: SuggestionRecipe[] = [
  STATUS,
  { label: 'Graph', build: graph },
  { label: 'Gauge', build: percentGauge },
  { label: 'Bar', build: percentBar },
];

function attributes(ctx: SuggestionContext): Record<string, unknown> {
  const state = ctx.hass.states?.[ctx.entityId] as { attributes?: Record<string, unknown> } | undefined;
  return state?.attributes || {};
}

function numberOr(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

function recipesFor(ctx: SuggestionContext): SuggestionRecipe[] {
  const recipes = RECIPES[ctx.domain];
  if (recipes) return recipes;
  if (ctx.domain === 'sensor') {
    const state = (ctx.hass.states?.[ctx.entityId] as { state?: string } | undefined)?.state;
    const numeric = attributes(ctx).unit_of_measurement !== undefined || Number.isFinite(parseFloat(String(state)));
    return numeric ? NUMERIC_SENSOR : [STATUS];
  }
  return [STATUS];
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function getUltraCardEntitySuggestions(
  hass: SmartSanitizeHass | undefined,
  entityId: string,
  options: { pro?: boolean } = {}
): UcEntitySuggestion[] {
  if (!hass?.states || !entityId || !(entityId in hass.states)) return [];
  const domain = entityId.split('.')[0] || '';
  const ctx: SuggestionContext = {
    hass,
    entityId,
    domain,
    name: entityName(hass, entityId),
    pro: options.pro === true,
  };
  // Unique per call so two suggestions added to one dashboard never share module ids.
  const suffix = randomSuffix();
  const suggestions: UcEntitySuggestion[] = [];
  recipesFor(ctx).forEach((recipe, index) => {
    const module = recipe.build(ctx, `uc_suggest_${index}_${suffix}`);
    if (module) suggestions.push({ label: recipe.label, config: wrapInCard(module) });
  });
  return suggestions;
}
