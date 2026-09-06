import type { HomeAssistant } from 'custom-card-helpers';
import type {
  AccordionModule,
  AlertCenterModule,
  ApplianceModule,
  AreaSummaryModule,
  AutoEntityListModule,
  BarModule,
  BatteryMonitorModule,
  CameraModule,
  CardModule,
  ClockModule,
  CoverModule,
  FanModule,
  GraphsModule,
  HorizontalModule,
  HumidifierModule,
  IconModule,
  InfoModule,
  LightModule,
  LockModule,
  MediaPlayerModule,
  NativeCardModule,
  PeopleModule,
  SliderControlModule,
  StatusSummaryModule,
  UltraCardConfig,
  UpdateMonitorModule,
  VerticalModule,
  WeatherModule,
} from '../types';
import { getModuleRegistry } from '../modules/module-registry';
import { inferRole, type RoomEntityRole } from '../services/uc-area-discovery-service';
import {
  loadDashboardRegistry,
  type AreaInfo,
  type DashboardRegistry,
} from './uc-dashboard-registry';
import { getDashboardStyle, type UltraDashboardStyle } from './uc-dashboard-styles';
import type {
  LovelaceCardRawConfig,
  LovelaceDashboardRawConfig,
  LovelaceSectionRawConfig,
  LovelaceViewRawConfig,
  UltraDashboardAreaViewStrategyConfig,
  UltraDashboardStrategyConfig,
} from './types';

/**
 * Builds the Ultra Dashboard: a Home overview plus one sections view per area
 * (or per floor). Every card is a plain `custom:ultra-card`, assembled from the
 * modules' own `createDefault()` so the result is exactly what the visual
 * editor would have produced. Only Free modules are used.
 *
 * A room page is composed from what the room actually has, and each kind of
 * thing gets the module that suits it rather than one list for everything:
 * lights get scene buttons and brightness sliders, the thermostat gets a
 * thermostat, sensors get a 24h chart and gauges, switches and scenes get a
 * grid of tap targets, appliances get their appliance card. What is left goes
 * into a collapsed "More" list so nothing is lost but nothing is dumped.
 */

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

class IdMinter {
  private counts = new Map<string, number>();
  next(prefix: string): string {
    const n = (this.counts.get(prefix) ?? 0) + 1;
    this.counts.set(prefix, n);
    return `${prefix}-${n}`;
  }
}

interface Ctx {
  hass: HomeAssistant;
  registry: DashboardRegistry;
  style: UltraDashboardStyle;
  ids: IdMinter;
  /** `/<dashboard>` prefix for navigate actions, when known. */
  dashboardPath: string;
}

/** Everything the generator may emit; loaded up front so `createDefault` is synchronous. */
const MODULE_TYPES = [
  'area_summary',
  'auto_entity_list',
  'alert_center',
  'battery_monitor',
  'update_monitor',
  'people',
  'weather',
  'clock',
  'horizontal',
  'media_player',
  'cover',
  'fan',
  'lock',
  'camera',
  'light',
  'slider_control',
  'icon',
  'info',
  'bar',
  'graphs',
  'status_summary',
  'accordion',
  'native_card',
  'humidifier',
  'washer',
  'dryer',
  'dishwasher',
  'fridge',
  'range',
] as const;

async function ensureModulesLoaded(): Promise<void> {
  const reg = getModuleRegistry();
  await Promise.all(
    MODULE_TYPES.map(t =>
      reg.isModuleLoaded(t)
        ? Promise.resolve()
        : reg.ensureModuleLoaded(t).then(
            () => undefined,
            () => undefined
          )
    )
  );
}

/** A module from its `createDefault()`, with a stable id and the given overrides. */
function mod<T extends CardModule>(ctx: Ctx, type: T['type'], overrides: Partial<T>): T {
  const id = ctx.ids.next(type);
  const base =
    (getModuleRegistry().createDefaultModule(type, id, ctx.hass) as T | null) ??
    ({ id, type } as unknown as T);
  return { ...base, ...overrides, id, type } as T;
}

/**
 * The first item of a module's default item list (an icon, an info entity, a
 * light preset, ...), used as the template for the items we generate so every
 * field the editor expects is present.
 */
function defaultItem<T extends CardModule, K extends keyof T>(
  ctx: Ctx,
  type: T['type'],
  listKey: K
): Record<string, unknown> {
  const base = getModuleRegistry().createDefaultModule(type, 'template', ctx.hass) as T | null;
  const list = base?.[listKey] as unknown;
  return Array.isArray(list) && list[0] && typeof list[0] === 'object'
    ? { ...(list[0] as Record<string, unknown>) }
    : {};
}

interface CardOptions {
  name: string;
  transparent?: boolean | undefined;
  columns?: number | 'full' | undefined;
}

/**
 * Wrap module rows in an Ultra Card that follows the style's theme. Chrome is
 * not baked in: `uc_theme` resolves it live, so re-theming after "take
 * control" is one change per card (or one global default) rather than a
 * rewrite of every `card_*` key.
 */
function card(
  ctx: Ctx,
  rows: CardModule[] | CardModule[][],
  opts: CardOptions
): LovelaceCardRawConfig {
  const rowsOfModules: CardModule[][] =
    rows.length && Array.isArray(rows[0]) ? (rows as CardModule[][]) : [rows as CardModule[]];
  const config: UltraCardConfig & LovelaceCardRawConfig = {
    type: 'custom:ultra-card',
    _config_version: 2,
    card_name: opts.name,
    uc_theme: ctx.style.themeId,
    ...(opts.transparent ? { card_transparent: true, card_padding: 0 } : {}),
    layout: {
      rows: rowsOfModules.map(modules => {
        const rowId = ctx.ids.next('row');
        return { id: rowId, columns: [{ id: `${rowId}-col`, modules }] };
      }),
    },
  };
  if (opts.columns) config.grid_options = { columns: opts.columns };
  return config;
}

const NO_AREAS_HINT: LovelaceCardRawConfig = {
  type: 'markdown',
  content:
    '### Nothing to show yet\n\nUltra Dashboard builds pages from your **areas**. Assign devices to areas under *Settings → Areas, labels & zones*, then reload this dashboard.',
};

function heading(
  text: string,
  icon?: string,
  style: 'title' | 'subtitle' = 'title'
): LovelaceCardRawConfig {
  return { type: 'heading', heading: text, heading_style: style, ...(icon ? { icon } : {}) };
}

const domainOf = (id: string): string => id.split('.')[0] ?? '';

const attrs = (hass: HomeAssistant, id: string): Record<string, unknown> =>
  (hass.states[id]?.attributes ?? {}) as Record<string, unknown>;

const friendlyName = (hass: HomeAssistant, id: string): string =>
  String(attrs(hass, id).friendly_name ?? id);

// Number(), not parseFloat(): "94:2a:6f" (a BSSID) is not a reading.
const isNumeric = (hass: HomeAssistant, id: string): boolean => {
  const state = hass.states[id]?.state;
  return state !== undefined && state.trim() !== '' && Number.isFinite(Number(state));
};

function slugForPath(id: string): string {
  return (
    id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'area'
  );
}

/** Room accent: the style's own accent, else one from the palette by area order. */
function roomAccent(ctx: Ctx, area: AreaInfo): string | undefined {
  if (ctx.style.accent) return ctx.style.accent;
  const palette = ctx.style.roomPalette;
  if (!palette?.length) return undefined;
  const index = Math.max(
    0,
    ctx.registry.areas.findIndex(a => a.area_id === area.area_id)
  );
  return palette[index % palette.length];
}

/* ------------------------------------------------------------------ */
/* Entity classification                                                */
/* ------------------------------------------------------------------ */

export type AreaGroups = Record<RoomEntityRole, string[]> & {
  cameras: string[];
  scenes: string[];
  humidifiers: string[];
  /** Controls that are unavailable right now; listed under More, not in the grids. */
  unavailable: string[];
};

export function classifyAreaEntities(hass: HomeAssistant, entityIds: string[]): AreaGroups {
  const g: AreaGroups = {
    lights: [],
    climate: [],
    temperature: [],
    humidity: [],
    motion: [],
    doors_windows: [],
    media: [],
    presence: [],
    covers: [],
    fans: [],
    locks: [],
    switches: [],
    other: [],
    cameras: [],
    scenes: [],
    humidifiers: [],
    unavailable: [],
  };
  for (const id of entityIds) {
    const domain = domainOf(id);
    const state = hass.states[id]?.state;
    if (
      CONTROL_DOMAINS.has(domain) &&
      domain !== 'scene' &&
      domain !== 'script' &&
      (state === 'unavailable' || state === 'unknown')
    ) {
      g.unavailable.push(id);
    } else if (domain === 'camera') g.cameras.push(id);
    else if (domain === 'scene' || domain === 'script') g.scenes.push(id);
    else if (domain === 'humidifier') g.humidifiers.push(id);
    else if (domain === 'input_boolean') g.switches.push(id);
    else g[inferRole(id, hass)].push(id);
  }
  const byName = (a: string, b: string) =>
    friendlyName(hass, a).localeCompare(friendlyName(hass, b), undefined, { sensitivity: 'base' });
  for (const key of Object.keys(g) as (keyof AreaGroups)[]) g[key].sort(byName);
  return g;
}

/** Domains that land in the "More" list when they have no dedicated block. */
const MORE_DOMAINS = [
  'sensor',
  'binary_sensor',
  'vacuum',
  'water_heater',
  'valve',
  'siren',
  'remote',
  'button',
  'number',
  'select',
  'input_number',
  'input_select',
  'lawn_mower',
  'timer',
  'counter',
];

/** Does the room have something you can operate, as opposed to only readings? */
const CONTROL_DOMAINS = new Set([
  'light',
  'switch',
  'climate',
  'media_player',
  'cover',
  'fan',
  'lock',
  'camera',
  'humidifier',
  'vacuum',
  'scene',
  'script',
  'input_boolean',
]);

/**
 * An area earns a page when it is a room and not a bucket: something in it can
 * be controlled, or it has enough readings to be worth a visit. A "Misc" area
 * holding two utility sensors would otherwise become a near-empty page.
 */
function areaDeservesPage(registry: DashboardRegistry, areaId: string): boolean {
  const ids = registry.entitiesByArea.get(areaId) ?? [];
  if (!ids.length) return false;
  if (ids.some(id => CONTROL_DOMAINS.has(domainOf(id)))) return true;
  return ids.length >= 4;
}

/* ------------------------------------------------------------------ */
/* Lights                                                               */
/* ------------------------------------------------------------------ */

/** Lights whose colour modes go beyond on/off. */
function supportsBrightness(hass: HomeAssistant, id: string): boolean {
  const a = attrs(hass, id);
  const modes = a.supported_color_modes;
  if (Array.isArray(modes) && modes.length) return modes.some(m => m !== 'onoff');
  if (typeof a.brightness === 'number') return true;
  const features = typeof a.supported_features === 'number' ? a.supported_features : 0;
  return (features & 1) === 1;
}

/**
 * The lights a person would actually reach for. Members of a light group in
 * the same room hide behind the group, and a device exposing many lights (a
 * WLED strip with one light per segment) is represented by its main light.
 */
export function primaryLights(ctx: Ctx, lights: string[]): { primary: string[]; hidden: string[] } {
  const { hass } = ctx;
  const hidden = new Set<string>();

  for (const id of lights) {
    const members = attrs(hass, id).entity_id;
    if (Array.isArray(members)) {
      for (const m of members) if (typeof m === 'string' && lights.includes(m)) hidden.add(m);
    }
  }

  const byDevice = new Map<string, string[]>();
  for (const id of lights) {
    if (hidden.has(id)) continue;
    const dev = ctx.registry.deviceOf.get(id);
    if (dev) byDevice.set(dev, [...(byDevice.get(dev) ?? []), id]);
  }
  for (const ids of byDevice.values()) {
    if (ids.length < 3) continue;
    const main =
      ids.find(id => !/\bsegment\b/i.test(friendlyName(hass, id))) ??
      [...ids].sort((a, b) => friendlyName(hass, a).length - friendlyName(hass, b).length)[0];
    for (const id of ids) if (id !== main) hidden.add(id);
  }

  // Without device info, "X Segment 3" still hides behind "X".
  for (const id of lights) {
    if (hidden.has(id)) continue;
    const name = friendlyName(hass, id);
    if (!/\bsegment\b/i.test(name)) continue;
    const parent = lights.find(
      o =>
        o !== id &&
        !hidden.has(o) &&
        name.toLowerCase().startsWith(friendlyName(hass, o).toLowerCase())
    );
    if (parent) hidden.add(id);
  }

  return { primary: lights.filter(id => !hidden.has(id)), hidden: [...hidden] };
}

/** Bright / Dim / Off for every primary light in the room. */
function lightScenes(ctx: Ctx, lights: string[], accent: string | undefined): LightModule {
  const template = defaultItem<LightModule, 'presets'>(ctx, 'light', 'presets');
  const preset = (
    id: string,
    name: string,
    icon: string,
    extra: Record<string, unknown>
  ): LightModule['presets'][number] =>
    ({
      ...template,
      id: ctx.ids.next(id),
      name,
      icon,
      entities: lights,
      enable_color: false,
      enable_color_temp: false,
      use_light_color_for_button: false,
      ...(accent ? { button_color: accent, icon_color: accent } : {}),
      ...extra,
    }) as LightModule['presets'][number];
  return mod<LightModule>(ctx, 'light', {
    presets: [
      preset('bright', 'Bright', 'mdi:brightness-7', { action: 'turn_on', brightness: 255 }),
      preset('dim', 'Dim', 'mdi:brightness-4', { action: 'turn_on', brightness: 64 }),
      preset('off', 'Off', 'mdi:lightbulb-off-outline', {
        action: 'turn_off',
        brightness: undefined,
        button_style: 'outlined',
      }),
    ],
    layout: 'buttons',
    button_alignment: 'space-between',
    button_style: 'filled',
  });
}

/** One brightness slider per dimmable light; the icon toggles the light. */
function lightSliders(ctx: Ctx, lights: string[], accent: string | undefined): SliderControlModule {
  const template = defaultItem<SliderControlModule, 'bars'>(ctx, 'slider_control', 'bars');
  return mod<SliderControlModule>(ctx, 'slider_control', {
    bars: lights.map(
      entity =>
        ({
          ...template,
          id: ctx.ids.next('bar'),
          type: 'brightness',
          entity,
          min_value: 0,
          max_value: 100,
          step: 1,
          show_icon: true,
          show_name: true,
          show_value: true,
        }) as SliderControlModule['bars'][number]
    ),
    orientation: 'horizontal',
    layout_mode: 'overlay',
    slider_style: 'theme',
    slider_height: 48,
    bar_spacing: 10,
    slider_radius: 'pill',
    dynamic_fill_color: true,
    ...(accent ? { slider_fill_color: accent } : {}),
    icon_as_toggle: true,
    show_toggle: false,
    show_value: true,
    value_suffix: '%',
  });
}

/* ------------------------------------------------------------------ */
/* Tap grids (switches, scenes, on/off lights)                          */
/* ------------------------------------------------------------------ */

type TapKind = 'toggle' | 'activate';

/** A grid of icon buttons: toggles for switches and plain lights, run for scenes. */
function iconGrid(
  ctx: Ctx,
  entities: string[],
  kind: TapKind,
  accent: string | undefined
): IconModule {
  const { hass } = ctx;
  const template = defaultItem<IconModule, 'icons'>(ctx, 'icon', 'icons');
  const iconFor = (id: string): string => {
    const icon = attrs(hass, id).icon;
    if (typeof icon === 'string' && icon) return icon;
    switch (domainOf(id)) {
      case 'light':
        return 'mdi:lightbulb';
      case 'scene':
        return 'mdi:palette';
      case 'script':
        return 'mdi:script-text-play';
      case 'input_boolean':
        return 'mdi:toggle-switch';
      default:
        return 'mdi:power-socket';
    }
  };
  const columns = Math.min(4, Math.max(2, entities.length));
  return mod<IconModule>(ctx, 'icon', {
    icons: entities.map(entity => {
      const icon = iconFor(entity);
      const domain = domainOf(entity);
      const action =
        kind === 'toggle'
          ? { action: 'toggle' as const, entity }
          : {
              action: 'perform-action' as const,
              perform_action: domain === 'script' ? 'script.turn_on' : 'scene.turn_on',
              target: { entity_id: entity },
            };
      return {
        ...template,
        id: ctx.ids.next('icon-item'),
        icon_mode: 'entity',
        entity,
        name: friendlyName(hass, entity),
        icon_inactive: icon,
        icon_active: icon,
        show_state: kind === 'toggle',
        show_state_when_active: kind === 'toggle',
        show_state_when_inactive: kind === 'toggle',
        ...(accent ? { color_active: accent, active_icon_color: accent } : {}),
        icon_background: 'rounded-square',
        icon_background_color: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06)',
        tap_action: action,
        click_action: kind === 'toggle' ? 'toggle' : 'none',
      } as IconModule['icons'][number];
    }),
    columns,
    gap: 12,
    allow_wrap: true,
    icon_position: 'top',
    alignment: 'center',
  });
}

/* ------------------------------------------------------------------ */
/* Sensors                                                              */
/* ------------------------------------------------------------------ */

/** Sensors on appliances or hardware that should not stand in for the room's reading. */
const NOT_A_ROOM_SENSOR =
  /fridge|freezer|refrigerator|oven|range|stove|grill|cpu|gpu|battery|water|pool|hot\s?tub|pump|boiler|heater|dryer|washer|tank|probe|outdoor|outside/i;

/**
 * Pick the sensor that best represents the room: reporting a number right now,
 * and not obviously attached to an appliance. `area_summary` would otherwise
 * take the first match, which on a kitchen tends to be the oven.
 */
function pickRoomSensor(hass: HomeAssistant, candidates: string[]): string | undefined {
  const live = candidates.filter(id => isNumeric(hass, id));
  if (!live.length) return undefined;
  return live.find(id => !NOT_A_ROOM_SENSOR.test(friendlyName(hass, id))) ?? live[0];
}

/**
 * Readings that read well as a level bar, with sensible ranges and a short
 * label: the room is the context, so "CO₂" beats "Main Floor Detector CO₂ Level".
 */
const GAUGE_CLASSES: Record<string, { min: number; max: number; icon: string; label: string }> = {
  illuminance: { min: 0, max: 1000, icon: 'mdi:brightness-6', label: 'Light level' },
  carbon_dioxide: { min: 400, max: 2000, icon: 'mdi:molecule-co2', label: 'CO₂' },
  pm25: { min: 0, max: 100, icon: 'mdi:blur', label: 'PM2.5' },
  pm10: { min: 0, max: 150, icon: 'mdi:blur', label: 'PM10' },
  volatile_organic_compounds: { min: 0, max: 1000, icon: 'mdi:air-filter', label: 'VOC' },
  volatile_organic_compounds_parts: { min: 0, max: 1000, icon: 'mdi:air-filter', label: 'VOC' },
  aqi: { min: 0, max: 300, icon: 'mdi:air-filter', label: 'Air quality' },
  power: { min: 0, max: 2000, icon: 'mdi:flash', label: 'Power' },
  sound_pressure: { min: 30, max: 100, icon: 'mdi:volume-high', label: 'Noise' },
  moisture: { min: 0, max: 100, icon: 'mdi:water-percent', label: 'Soil moisture' },
};

/** Cumulative or bookkeeping sensors nobody wants on a room page. */
const SKIP_SENSOR_CLASSES = new Set([
  'battery', // the Home page has a Batteries block
  'timestamp',
  'date',
  'duration',
  'energy',
  'gas',
  'water',
  'monetary',
  'signal_strength',
  'data_size',
  'data_rate',
  'enum',
]);

interface SensorSplit {
  gauges: string[];
  readings: string[];
}

/** Numeric sensors worth showing, split into gauge-worthy and plain readings. */
function splitSensors(hass: HomeAssistant, ids: string[]): SensorSplit {
  const gauges: string[] = [];
  const readings: string[] = [];
  for (const id of ids) {
    if (domainOf(id) !== 'sensor' || !isNumeric(hass, id)) continue;
    const a = attrs(hass, id);
    const dc = String(a.device_class ?? '');
    if (SKIP_SENSOR_CLASSES.has(dc)) continue;
    // A bare number with no unit and no class (step counters, indices) is
    // not a room reading.
    if (!dc && !a.unit_of_measurement) continue;
    if (a.state_class === 'total' || a.state_class === 'total_increasing') continue;
    if (dc in GAUGE_CLASSES && gauges.length < 3) gauges.push(id);
    else readings.push(id);
  }
  return { gauges, readings };
}

function sensorChart(
  ctx: Ctx,
  temperature: string | undefined,
  humidity: string | undefined,
  accent: string | undefined
): GraphsModule {
  const template = defaultItem<GraphsModule, 'entities'>(ctx, 'graphs', 'entities');
  const entities: GraphsModule['entities'] = [];
  if (temperature)
    entities.push({
      ...template,
      id: ctx.ids.next('series'),
      entity: temperature,
      name: 'Temperature',
      color: accent ?? 'var(--primary-color)',
      fill_area: true,
      line_width: 2,
      show_points: false,
      is_primary: true,
    } as GraphsModule['entities'][number]);
  if (humidity)
    entities.push({
      ...template,
      id: ctx.ids.next('series'),
      entity: humidity,
      name: 'Humidity',
      color: 'var(--info-color, #3b82f6)',
      fill_area: false,
      line_width: 2,
      line_style: 'dashed',
      show_points: false,
    } as GraphsModule['entities'][number]);
  return mod<GraphsModule>(ctx, 'graphs', {
    chart_type: 'line',
    entities,
    time_period: '24h',
    show_title: false,
    title: '',
    // Two series on different scales (°F vs %) only share a chart normalised.
    normalize_values: entities.length > 1,
    // The legend is the only label on the chart, so keep it for one series too.
    show_legend: true,
    legend_position: 'top_right',
    chart_layout: 'full',
    show_info_overlay: false,
    show_display_name: false,
    show_entity_value: false,
    show_grid: false,
    show_x_axis: false,
    show_y_axis: false,
    show_time_intervals: false,
    smooth_curves: true,
    fill_opacity: 0.15,
    show_tooltips: true,
    // The module reserves 80px of this for its (hidden) header, and the line
    // chart keeps a 3:1 aspect, so this lands at about 120px of chart.
    chart_height: 200,
    background_color: 'transparent',
  } as Partial<GraphsModule>);
}

function sensorGauges(ctx: Ctx, ids: string[], accent: string | undefined): VerticalModule {
  const { hass } = ctx;
  const classOf = (id: string) => String(attrs(hass, id).device_class ?? '');
  const seen = new Map<string, number>();
  for (const id of ids) seen.set(classOf(id), (seen.get(classOf(id)) ?? 0) + 1);
  return mod<VerticalModule>(ctx, 'vertical', {
    modules: ids.map(entity => {
      const dc = classOf(entity);
      const range = GAUGE_CLASSES[dc] ?? { min: 0, max: 100, icon: 'mdi:gauge', label: '' };
      // Two of a kind (say, two power meters) keep their own names.
      const label =
        range.label && (seen.get(dc) ?? 0) === 1 ? range.label : friendlyName(hass, entity);
      return mod<BarModule>(ctx, 'bar', {
        entity,
        name: label,
        percentage_type: 'entity',
        percentage_min: range.min,
        percentage_max: range.max,
        bar_size: 'thin',
        bar_radius: 'pill',
        bar_style: 'theme',
        bar_width: 100,
        show_percentage: false,
        show_value: false,
        // Renders as "CO₂: 1,545 ppm" under the bar.
        left_enabled: true,
        left_title: label,
        left_entity: entity,
        right_enabled: false,
        label_alignment: 'left',
        ...(accent ? { bar_color: accent } : {}),
      } as Partial<BarModule>);
    }),
    gap: 10,
  });
}

function sensorReadings(ctx: Ctx, ids: string[], accent: string | undefined): InfoModule {
  const { hass } = ctx;
  const template = defaultItem<InfoModule, 'info_entities'>(ctx, 'info', 'info_entities');
  return mod<InfoModule>(ctx, 'info', {
    info_entities: ids.map(entity => {
      const icon = attrs(hass, entity).icon;
      return {
        ...template,
        id: ctx.ids.next('info-item'),
        entity,
        name: friendlyName(hass, entity),
        icon: typeof icon === 'string' && icon ? icon : 'mdi:eye-outline',
        show_icon: true,
        show_name: true,
        show_state: true,
        show_units: true,
        overall_alignment: 'left',
        ...(accent ? { icon_color: accent } : {}),
      } as InfoModule['info_entities'][number];
    }),
    // Long names (most integrations prefix the device) need the full width.
    columns: ids.length > 1 && ids.every(id => friendlyName(hass, id).length <= 18) ? 2 : 1,
    gap: 12,
    alignment: 'left',
  });
}

/* ------------------------------------------------------------------ */
/* Appliances                                                           */
/* ------------------------------------------------------------------ */

const APPLIANCE_TYPES: ReadonlyArray<{ type: ApplianceModule['type']; match: RegExp }> = [
  { type: 'washer', match: /\bwash(er|ing)\b/i },
  { type: 'dryer', match: /\bdryer\b/i },
  { type: 'dishwasher', match: /\bdishwasher\b/i },
  { type: 'fridge', match: /\b(fridge|refrigerator|freezer)\b/i },
  { type: 'range', match: /\b(oven|range|stove|cooktop)\b/i },
];

interface ApplianceHit {
  type: ApplianceModule['type'];
  entity: string;
  name: string;
  /** Every entity of the appliance's device, so other blocks skip them. */
  entities: string[];
}

/**
 * Devices in the room that are one of the appliances Ultra Card has a card
 * for. Recognised by device name; the appliance module discovers the rest of
 * the device's entities itself. Needs a device with a few entities so a
 * single "Oven light" bulb does not turn into a range.
 */
function findAppliances(ctx: Ctx, ids: string[]): ApplianceHit[] {
  const byDevice = new Map<string, string[]>();
  for (const id of ids) {
    const dev = ctx.registry.deviceOf.get(id);
    if (dev) byDevice.set(dev, [...(byDevice.get(dev) ?? []), id]);
  }
  const hits: ApplianceHit[] = [];
  for (const [dev, entities] of byDevice) {
    if (entities.length < 3) continue;
    const device = ctx.registry.devices.get(dev);
    if (!device) continue;
    const kind = APPLIANCE_TYPES.find(t => t.match.test(device.name));
    if (!kind) continue;
    const main =
      entities.find(id => /machine_state|job_state|operation_state/.test(id)) ??
      entities.find(id => domainOf(id) === 'sensor') ??
      entities[0]!;
    hits.push({ type: kind.type, entity: main, name: device.name, entities });
  }
  return hits;
}

/* ------------------------------------------------------------------ */
/* Area content                                                         */
/* ------------------------------------------------------------------ */

interface TileOptions {
  navigateTo?: string | undefined;
  /** Cap for the quick-action badges; keeps Home tiles a uniform height. */
  maxQuickActions?: number | undefined;
}

function areaTile(ctx: Ctx, area: AreaInfo, opts: TileOptions = {}): LovelaceCardRawConfig {
  const ids = ctx.registry.entitiesByArea.get(area.area_id) ?? [];
  const g = classifyAreaEntities(ctx.hass, ids);
  const temperature = pickRoomSensor(ctx.hass, g.temperature);
  const humidity = pickRoomSensor(ctx.hass, g.humidity);
  const accent = roomAccent(ctx, area);
  const tile = mod<AreaSummaryModule>(ctx, 'area_summary', {
    area_id: area.area_id,
    title: area.name,
    style_preset: 'theme',
    ...(temperature ? { temperature_entity: temperature } : {}),
    ...(humidity ? { humidity_entity: humidity } : {}),
    ...(area.icon ? { room_icon: area.icon } : {}),
    ...(accent ? { accent_color: accent } : {}),
    ...(opts.maxQuickActions ? { max_quick_actions: opts.maxQuickActions } : {}),
    ...(opts.navigateTo
      ? { tap_action: { action: 'navigate', navigation_path: opts.navigateTo } }
      : {}),
  });
  return card(ctx, [tile], { name: area.name });
}

/**
 * An `auto_entity_list` scoped to the room. Discovery stays on (new devices
 * appear after "take control") but agrees with the generator: the room's
 * config/diagnostic and hidden entities, plus anything a dedicated block
 * already shows, are hidden, and unavailable entities are listed rather than
 * silently dropped, so the list is never empty when we made it.
 */
function entityList(
  ctx: Ctx,
  area: AreaInfo,
  filter: Partial<AutoEntityListModule>,
  alsoHidden: string[] = []
): AutoEntityListModule {
  const noise = ctx.registry.noiseByArea.get(area.area_id) ?? [];
  return mod<AutoEntityListModule>(ctx, 'auto_entity_list', {
    include_areas: [area.area_id],
    row_style: 'theme',
    show_title: false,
    show_unavailable: true,
    max_items: 20,
    empty_state_text: 'Nothing here right now',
    ...filter,
    hidden_entities: [...new Set([...noise, ...alsoHidden, ...(filter.hidden_entities ?? [])])],
  });
}

interface AreaBlock {
  title: string;
  icon: string;
  cards: LovelaceCardRawConfig[];
}

/** The content blocks for one area, in display order. */
function areaBlocks(ctx: Ctx, area: AreaInfo): AreaBlock[] {
  const { hass } = ctx;
  const ids = ctx.registry.entitiesByArea.get(area.area_id) ?? [];
  const accent = roomAccent(ctx, area);
  const appliances = findAppliances(ctx, ids);
  const applianceEntities = new Set(appliances.flatMap(a => a.entities));
  const g = classifyAreaEntities(
    hass,
    ids.filter(id => !applianceEntities.has(id))
  );
  const blocks: AreaBlock[] = [];
  const named = (title: string) => `${area.name} · ${title}`;
  /** Entities a dedicated block shows, so the More list does not repeat them. */
  const covered: string[] = [];

  // Lights: scenes for the room, sliders for dimmable lights, toggles for the rest.
  if (g.lights.length) {
    const { primary, hidden } = primaryLights(ctx, g.lights);
    const rows: CardModule[][] = [];
    if (primary.length >= 2) rows.push([lightScenes(ctx, primary, accent)]);
    if (primary.length <= 6) {
      const dimmable = primary.filter(id => supportsBrightness(hass, id));
      const plain = primary.filter(id => !dimmable.includes(id));
      if (dimmable.length) rows.push([lightSliders(ctx, dimmable, accent)]);
      if (plain.length) rows.push([iconGrid(ctx, plain, 'toggle', accent)]);
    } else {
      rows.push([entityList(ctx, area, { include_domains: ['light'] }, hidden)]);
    }
    blocks.push({
      title: 'Lights',
      icon: 'mdi:lightbulb-group',
      cards: [card(ctx, rows, { name: named('Lights') })],
    });
  }

  // Climate: the thermostat itself, the room's 24h trend, humidifiers.
  const temperature = pickRoomSensor(hass, g.temperature);
  const humidity = pickRoomSensor(hass, g.humidity);
  if (g.climate.length || temperature || humidity || g.humidifiers.length) {
    const cards: LovelaceCardRawConfig[] = [];
    for (const entity of g.climate.slice(0, 2)) {
      cards.push(
        card(
          ctx,
          [
            mod<NativeCardModule>(ctx, 'native_card', {
              card_type: 'hui-thermostat-card',
              card_config: { type: 'thermostat', entity },
            }),
          ],
          { name: named(friendlyName(hass, entity)) }
        )
      );
    }
    if (temperature || humidity) {
      cards.push(
        card(ctx, [sensorChart(ctx, temperature, humidity, accent)], {
          name: named('Temperature & humidity'),
        })
      );
      covered.push(...g.temperature, ...g.humidity);
    }
    for (const entity of g.humidifiers.slice(0, 2)) {
      cards.push(
        card(ctx, [mod<HumidifierModule>(ctx, 'humidifier', { entity })], {
          name: named(friendlyName(hass, entity)),
        })
      );
    }
    blocks.push({ title: 'Climate', icon: 'mdi:thermostat', cards });
  }

  // Media: a lone speaker gets the full card with artwork; TVs (mostly off,
  // no artwork) and rooms with several players stay compact.
  if (g.media.length) {
    const [first, ...rest] = g.media;
    const isTv = attrs(hass, first!).device_class === 'tv';
    const rows: CardModule[][] = [
      [
        mod<MediaPlayerModule>(ctx, 'media_player', {
          entity: first!,
          layout: rest.length || isTv ? 'compact' : 'card',
          card_size: 180,
        }),
      ],
      ...rest
        .slice(0, 3)
        .map(entity => [
          mod<MediaPlayerModule>(ctx, 'media_player', { entity, layout: 'compact' }),
        ]),
    ];
    blocks.push({
      title: 'Media',
      icon: 'mdi:speaker',
      cards: [card(ctx, rows, { name: named('Media') })],
    });
  }

  for (const appliance of appliances.slice(0, 3)) {
    blocks.push({
      title: appliance.name,
      icon: 'mdi:washing-machine',
      cards: [
        card(
          ctx,
          [
            mod<ApplianceModule>(ctx, appliance.type, {
              entity: appliance.entity,
              name: appliance.name,
              layout: 'standard',
              show_title: false,
            }),
          ],
          { name: named(appliance.name) }
        ),
      ],
    });
  }

  if (g.covers.length) {
    blocks.push({
      title: 'Covers',
      icon: 'mdi:window-shutter',
      cards: [
        card(
          ctx,
          g.covers
            .slice(0, 6)
            .map(entity => [mod<CoverModule>(ctx, 'cover', { entity, layout: 'compact' })]),
          { name: named('Covers') }
        ),
      ],
    });
  }

  if (g.fans.length) {
    blocks.push({
      title: 'Fans',
      icon: 'mdi:fan',
      cards: [
        card(
          ctx,
          g.fans
            .slice(0, 6)
            .map(entity => [mod<FanModule>(ctx, 'fan', { entity, layout: 'compact' })]),
          { name: named('Fans') }
        ),
      ],
    });
  }

  if (g.locks.length) {
    blocks.push({
      title: 'Locks',
      icon: 'mdi:lock',
      cards: [
        card(
          ctx,
          g.locks
            .slice(0, 6)
            .map(entity => [mod<LockModule>(ctx, 'lock', { entity, layout: 'compact' })]),
          { name: named('Locks') }
        ),
      ],
    });
  }

  if (g.cameras.length) {
    blocks.push({
      title: 'Cameras',
      icon: 'mdi:cctv',
      cards: g.cameras.slice(0, 4).map(entity =>
        card(ctx, [mod<CameraModule>(ctx, 'camera', { entity, show_name: true })], {
          name: named(friendlyName(hass, entity)),
        })
      ),
    });
  }

  // Scenes and scripts as a row of tap targets.
  if (g.scenes.length) {
    blocks.push({
      title: 'Scenes',
      icon: 'mdi:palette',
      cards: [
        card(ctx, [iconGrid(ctx, g.scenes.slice(0, 8), 'activate', accent)], {
          name: named('Scenes'),
        }),
      ],
    });
  }

  // Security: doors, windows, motion with how long ago they changed.
  const security = [
    ...g.doors_windows,
    ...g.motion,
    ...g.presence.filter(id => domainOf(id) === 'binary_sensor'),
  ];
  if (security.length) {
    const template = defaultItem<StatusSummaryModule, 'entities'>(
      ctx,
      'status_summary',
      'entities'
    );
    blocks.push({
      title: 'Security',
      icon: 'mdi:shield-home',
      cards: [
        card(
          ctx,
          [
            mod<StatusSummaryModule>(ctx, 'status_summary', {
              entities: security.slice(0, 10).map(
                entity =>
                  ({
                    ...template,
                    id: ctx.ids.next('status-item'),
                    entity,
                    color_mode: 'none',
                  }) as StatusSummaryModule['entities'][number]
              ),
              enable_auto_filter: false,
              show_title: false,
              show_last_change_header: false,
              show_time_header: false,
              sort_by: 'last_change',
              sort_direction: 'desc',
              global_color_mode: 'none',
              global_show_icon: true,
              global_show_state: true,
              show_separator_lines: false,
            }),
          ],
          { name: named('Security') }
        ),
      ],
    });
    covered.push(...security);
  }

  // Switches (and helpers) as a tap grid; a long list stays a list.
  if (g.switches.length) {
    const modules: CardModule[] =
      g.switches.length <= 8
        ? [iconGrid(ctx, g.switches, 'toggle', accent)]
        : [entityList(ctx, area, { include_domains: ['switch', 'input_boolean'] })];
    blocks.push({
      title: 'Switches',
      icon: 'mdi:toggle-switch',
      cards: [card(ctx, modules, { name: named('Switches') })],
    });
  }

  // Environment: air quality, light level and power as gauges, other readings as a grid.
  const { gauges, readings } = splitSensors(
    hass,
    g.other.filter(id => !covered.includes(id))
  );
  if (gauges.length || readings.length) {
    const rows: CardModule[][] = [];
    const shown = readings.slice(0, 6);
    if (gauges.length) rows.push([sensorGauges(ctx, gauges, accent)]);
    // The info module shows three entities and folds the rest, so chunk by three.
    for (let i = 0; i < shown.length; i += 3) {
      rows.push([sensorReadings(ctx, shown.slice(i, i + 3), accent)]);
    }
    blocks.push({
      title: 'Environment',
      icon: 'mdi:leaf',
      cards: [card(ctx, rows, { name: named('Environment') })],
    });
    covered.push(...gauges, ...shown);
  }

  // Everything else, folded away: leftover readings plus controls that are
  // unavailable right now (the list says so; a dead button in a grid does not).
  const more = [
    ...g.other.filter(id => !covered.includes(id) && MORE_DOMAINS.includes(domainOf(id))),
    ...g.unavailable,
  ];
  const moreDomains = [...new Set([...MORE_DOMAINS, ...g.unavailable.map(domainOf)])];
  if (more.length) {
    blocks.push({
      title: 'More',
      icon: 'mdi:dots-horizontal-circle-outline',
      cards: [
        card(
          ctx,
          [
            mod<AccordionModule>(ctx, 'accordion', {
              title_mode: 'custom',
              title_text: `${more.length} more`,
              default_open: false,
              header_alignment: 'apart',
              modules: [
                entityList(
                  ctx,
                  area,
                  { include_domains: moreDomains, max_items: 24 },
                  ids.filter(id => !more.includes(id))
                ),
              ],
            }),
          ],
          { name: named('More') }
        ),
      ],
    });
  }

  return blocks;
}

/** Sections for a dedicated area view: room tile, then one section per block. */
export function buildAreaViewSections(ctx: Ctx, area: AreaInfo): LovelaceSectionRawConfig[] {
  const sections: LovelaceSectionRawConfig[] = [{ type: 'grid', cards: [areaTile(ctx, area)] }];
  for (const block of areaBlocks(ctx, area)) {
    sections.push({ type: 'grid', cards: [heading(block.title, block.icon), ...block.cards] });
  }
  return sections;
}

/** One section per area for a floor view: heading, tile, then the blocks with subtitles. */
function buildFloorAreaSection(ctx: Ctx, area: AreaInfo): LovelaceSectionRawConfig {
  const cards: LovelaceCardRawConfig[] = [heading(area.name, area.icon), areaTile(ctx, area)];
  for (const block of areaBlocks(ctx, area)) {
    cards.push(heading(block.title, block.icon, 'subtitle'), ...block.cards);
  }
  return { type: 'grid', cards };
}

/* ------------------------------------------------------------------ */
/* Home view                                                            */
/* ------------------------------------------------------------------ */

function pickWeatherEntity(hass: HomeAssistant, preferred?: string): string | undefined {
  if (preferred && hass.states[preferred]) return preferred;
  return Object.keys(hass.states)
    .filter(id => domainOf(id) === 'weather')
    .sort()[0];
}

function personEntities(hass: HomeAssistant): string[] {
  return Object.keys(hass.states)
    .filter(id => domainOf(id) === 'person')
    .sort((a, b) => friendlyName(hass, a).localeCompare(friendlyName(hass, b)));
}

function hasDomain(hass: HomeAssistant, domain: string): boolean {
  return Object.keys(hass.states).some(id => domainOf(id) === domain);
}

function hasBatteries(hass: HomeAssistant): boolean {
  return Object.values(hass.states).some(
    s => s.attributes?.device_class === 'battery' || typeof s.attributes?.battery_level === 'number'
  );
}

function buildHomeView(
  ctx: Ctx,
  config: UltraDashboardStrategyConfig,
  areas: AreaInfo[],
  path: string,
  pathFor: (area: AreaInfo) => string
): LovelaceViewRawConfig {
  const { hass } = ctx;
  const sections: LovelaceSectionRawConfig[] = [];

  // Header: clock, and the weather when there is a weather entity.
  const weatherEntity = pickWeatherEntity(hass, config.weather_entity);
  const headerModules: CardModule[] = [
    mod<ClockModule>(ctx, 'clock', { show_date: true, alignment: 'left', time_size: 40 }),
  ];
  if (weatherEntity) {
    headerModules.push(
      mod<WeatherModule>(ctx, 'weather', {
        weather_entity: weatherEntity,
        show_forecast: false,
        show_humidity: false,
        show_wind: false,
      })
    );
  }
  sections.push({
    type: 'grid',
    column_span: 4,
    cards: [
      card(
        ctx,
        [
          mod<HorizontalModule>(ctx, 'horizontal', {
            modules: headerModules,
            alignment: 'space-between',
            vertical_alignment: 'center',
            wrap: true,
            gap: 16,
          }),
        ],
        { name: 'Header', transparent: true }
      ),
    ],
  });

  // Rooms, grouped by floor when the home has floors.
  const floors = ctx.registry.floors.filter(f => areas.some(a => a.floor_id === f.floor_id));
  const roomGroups: { title: string; icon?: string | undefined; areas: AreaInfo[] }[] = [];
  for (const f of floors) {
    roomGroups.push({
      title: f.name,
      icon: f.icon,
      areas: areas.filter(a => a.floor_id === f.floor_id),
    });
  }
  const loose = areas.filter(a => !floors.some(f => f.floor_id === a.floor_id));
  if (loose.length)
    roomGroups.push({ title: floors.length ? 'Other rooms' : 'Rooms', areas: loose });

  if (!areas.length) {
    sections.push({ type: 'grid', cards: [heading('Rooms', 'mdi:floor-plan'), NO_AREAS_HINT] });
  }
  for (const group of roomGroups) {
    sections.push({
      type: 'grid',
      cards: [
        heading(group.title, group.icon ?? 'mdi:floor-plan'),
        ...group.areas.map(a => {
          const tile = areaTile(ctx, a, {
            navigateTo: `${ctx.dashboardPath}/${pathFor(a)}`,
            maxQuickActions: 3,
          });
          tile.grid_options = { columns: 6 };
          return tile;
        }),
      ],
    });
  }

  const people = config.show_people !== false ? personEntities(hass) : [];
  if (people.length) {
    sections.push({
      type: 'grid',
      cards: [
        heading('People', 'mdi:account-group'),
        card(
          ctx,
          [
            mod<HorizontalModule>(ctx, 'horizontal', {
              modules: people.map(person_entity =>
                mod<PeopleModule>(ctx, 'people', { person_entity, layout_style: 'compact' })
              ),
              alignment: 'space-around',
              vertical_alignment: 'top',
              wrap: true,
              gap: 12,
            }),
          ],
          { name: 'People' }
        ),
      ],
    });
  }

  if (config.show_alerts !== false) {
    sections.push({
      type: 'grid',
      cards: [
        heading('Alerts', 'mdi:bell-alert'),
        card(
          ctx,
          [
            mod<AlertCenterModule>(ctx, 'alert_center', {
              show_title: false,
              show_all_clear: true,
              max_alerts: 8,
              ...(ctx.style.accent ? { accent_color: ctx.style.accent } : {}),
            }),
          ],
          { name: 'Alerts' }
        ),
      ],
    });
  }

  if (config.show_batteries !== false && hasBatteries(hass)) {
    sections.push({
      type: 'grid',
      cards: [
        heading('Batteries', 'mdi:battery-alert'),
        card(
          ctx,
          [
            mod<BatteryMonitorModule>(ctx, 'battery_monitor', {
              discovery_mode: 'auto',
              show_title: false,
              style: 'list',
              max_items: 8,
              sort_direction: 'lowest_first',
            }),
          ],
          { name: 'Batteries' }
        ),
      ],
    });
  }

  if (config.show_updates !== false && hasDomain(hass, 'update')) {
    sections.push({
      type: 'grid',
      cards: [
        heading('Updates', 'mdi:update'),
        card(
          ctx,
          [
            mod<UpdateMonitorModule>(ctx, 'update_monitor', {
              show_title: false,
              max_items: 8,
              sort_direction: 'updates_first',
            }),
          ],
          { name: 'Updates' }
        ),
      ],
    });
  }

  return {
    title: 'Home',
    path,
    icon: 'mdi:home',
    type: 'sections',
    max_columns: 4,
    sections,
  };
}

/* ------------------------------------------------------------------ */
/* Entry points                                                         */
/* ------------------------------------------------------------------ */

function selectAreas(
  registry: DashboardRegistry,
  config: UltraDashboardStrategyConfig
): AreaInfo[] {
  const include = new Set((config.areas ?? []).filter(Boolean));
  const exclude = new Set((config.exclude_areas ?? []).filter(Boolean));
  return registry.areas.filter(a => {
    if (include.size && !include.has(a.area_id)) return false;
    if (exclude.has(a.area_id)) return false;
    // An explicitly included area is wanted even when thin.
    return include.has(a.area_id)
      ? (registry.entitiesByArea.get(a.area_id)?.length ?? 0) > 0
      : areaDeservesPage(registry, a.area_id);
  });
}

function floorIcon(level: number | undefined, icon: string | undefined): string {
  if (icon) return icon;
  if (typeof level === 'number' && level >= 0 && level <= 3) return `mdi:home-floor-${level}`;
  return 'mdi:floor-plan';
}

function makeCtx(
  hass: HomeAssistant,
  registry: DashboardRegistry,
  styleId: string | undefined
): Ctx {
  const panelUrl = (hass as { panelUrl?: string }).panelUrl;
  return {
    hass,
    registry,
    style: getDashboardStyle(styleId),
    ids: new IdMinter(),
    dashboardPath: panelUrl ? `/${panelUrl}` : '',
  };
}

export async function generateUltraDashboard(
  config: UltraDashboardStrategyConfig,
  hass: HomeAssistant
): Promise<LovelaceDashboardRawConfig> {
  const [registry] = await Promise.all([loadDashboardRegistry(hass), ensureModulesLoaded()]);
  const ctx = makeCtx(hass, registry, config.style);
  const areas = selectAreas(registry, config);
  const groupBy = config.group_by === 'floor' && registry.floors.length ? 'floor' : 'area';

  const usedPaths = new Set<string>();
  const uniquePath = (base: string): string => {
    let p = base;
    for (let i = 2; usedPaths.has(p); i++) p = `${base}-${i}`;
    usedPaths.add(p);
    return p;
  };

  const views: LovelaceViewRawConfig[] = [];
  const homePath = uniquePath('home');

  if (groupBy === 'area') {
    const areaPaths = new Map(areas.map(a => [a.area_id, uniquePath(slugForPath(a.area_id))]));
    if (config.home_view !== false) {
      views.push(buildHomeView(ctx, config, areas, homePath, a => areaPaths.get(a.area_id)!));
    }
    for (const area of areas) {
      views.push({
        title: area.name,
        path: areaPaths.get(area.area_id),
        ...(area.icon ? { icon: area.icon } : {}),
        type: 'sections',
        max_columns: 3,
        sections: buildAreaViewSections(ctx, area),
      });
    }
  } else {
    const floors = registry.floors.filter(f => areas.some(a => a.floor_id === f.floor_id));
    const loose = areas.filter(a => !floors.some(f => f.floor_id === a.floor_id));
    const floorPaths = new Map(floors.map(f => [f.floor_id, uniquePath(slugForPath(f.floor_id))]));
    const loosePath = loose.length ? uniquePath('other') : '';
    const pathFor = (a: AreaInfo) => (a.floor_id && floorPaths.get(a.floor_id)) || loosePath;

    if (config.home_view !== false) {
      views.push(buildHomeView(ctx, config, areas, homePath, pathFor));
    }
    for (const floor of floors) {
      views.push({
        title: floor.name,
        path: floorPaths.get(floor.floor_id),
        icon: floorIcon(floor.level, floor.icon),
        type: 'sections',
        max_columns: 4,
        sections: areas
          .filter(a => a.floor_id === floor.floor_id)
          .map(a => buildFloorAreaSection(ctx, a)),
      });
    }
    if (loose.length) {
      views.push({
        title: floors.length ? 'Other' : 'Rooms',
        path: loosePath,
        icon: 'mdi:floor-plan',
        type: 'sections',
        max_columns: 4,
        sections: loose.map(a => buildFloorAreaSection(ctx, a)),
      });
    }
  }

  if (!views.length) {
    views.push({
      title: 'Home',
      path: homePath,
      type: 'sections',
      sections: [{ type: 'grid', cards: [NO_AREAS_HINT] }],
    });
  }

  return { ...(config.title ? { title: config.title } : {}), views };
}

export async function generateUltraAreaView(
  config: UltraDashboardAreaViewStrategyConfig,
  hass: HomeAssistant
): Promise<LovelaceViewRawConfig> {
  const [registry] = await Promise.all([loadDashboardRegistry(hass), ensureModulesLoaded()]);
  const ctx = makeCtx(hass, registry, config.style);
  const area = registry.areas.find(a => a.area_id === config.area);
  if (!area) {
    return {
      type: 'sections',
      sections: [
        {
          type: 'grid',
          cards: [
            {
              type: 'markdown',
              content: `Ultra Dashboard: area \`${config.area || '(none)'}\` was not found.`,
            },
          ],
        },
      ],
    };
  }
  return {
    ...(config.title ? { title: config.title } : {}),
    type: 'sections',
    max_columns: 3,
    sections: buildAreaViewSections(ctx, area),
  };
}
