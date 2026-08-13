import type { SmartSanitizeHass } from '../uc-smart-module-sanitizer';
import {
  defaultDisplayActions,
  entityExists,
  entityName,
  numberInRange,
  oneOf,
  sanitizeAction,
  type SmartModule,
} from './smart-sanitize-utils';
import type { SmartBuildContext, SmartSanitizeModuleContext } from './smart-module-types';

type EntityDomainRule = string | string[];

function sanitizeEntityModule(
  type: string,
  domainRule: EntityDomainRule,
  module: SmartModule,
  hass: SmartSanitizeHass,
  id: string,
  extras: Record<string, unknown> = {}
): SmartModule | null {
  const entityId = String(module.entity || module.weather_entity || '');
  if (!entityExists(hass, entityId)) return null;
  const domains = Array.isArray(domainRule) ? domainRule : [domainRule];
  if (!domains.some(domain => domain === '*' || entityId.startsWith(`${domain}.`))) return null;
  return {
    id,
    type,
    entity: entityId,
    name: String(module.name || entityName(hass, entityId)),
    ...defaultDisplayActions(),
    ...extras,
  };
}

function wrapSanitize(
  fn: (module: SmartModule, hass: SmartSanitizeHass, id: string) => SmartModule | null
): (raw: unknown, ctx: SmartSanitizeModuleContext) => SmartModule | null {
  return (raw, ctx) => {
    if (!raw || typeof raw !== 'object') return null;
    return fn(raw as SmartModule, ctx.hass, ctx.id);
  };
}

export function sanitizeBarModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (!entityExists(hass, entityId)) return null;
  const name = String(module.name || entityName(hass, entityId));
  return {
    id,
    type: 'bar',
    entity: entityId,
    name,
    percentage_type: 'entity',
    percentage_entity: entityId,
    percentage_min: numberInRange(module.percentage_min, 0, 1000, 0),
    percentage_max: numberInRange(module.percentage_max, 1, 1000, 100),
    height: numberInRange(module.height, 8, 80, 20),
    bar_style: oneOf(
      module.bar_style,
      ['flat', 'glossy', 'embossed', 'inset', 'gradient-overlay', 'neon-glow', 'outline', 'glass', 'metallic', 'neumorphic', 'dashed', 'dots', 'minimal'],
      'flat'
    ),
    bar_size: oneOf(module.bar_size, ['extra-thick', 'thick', 'medium', 'thin'], 'medium'),
    bar_radius: oneOf(module.bar_radius, ['square', 'round', 'pill'], 'round'),
    bar_direction: oneOf(module.bar_direction, ['left-to-right', 'right-to-left'], 'left-to-right'),
    bar_width: numberInRange(module.bar_width, 10, 100, 100),
    show_percentage: module.show_percentage !== false,
    show_value: Boolean(module.show_value),
    label_alignment: oneOf(module.label_alignment, ['left', 'center', 'right', 'space-between'], 'space-between'),
    use_gradient: Boolean(module.use_gradient),
    ...defaultDisplayActions(),
  };
}

export function buildBarModule(id: string, entityId: string, name: string, label?: string): SmartModule {
  return {
    id,
    type: 'bar',
    entity: entityId,
    name: label || name,
    percentage_type: 'entity',
    percentage_entity: entityId,
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
}

export function buildBarModuleFromContext(ctx: SmartBuildContext): SmartModule | null {
  const entity = ctx.entity;
  if (!entity) return null;
  const label = /\bfuel\b|\bcar\b|\bvehicle\b/.test(ctx.prompt) ? 'Fuel Level' : entity.name;
  return buildBarModule(ctx.id, entity.entityId, entity.name, label);
}

function sanitizeSeparatorModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'separator',
    style: oneOf(module.style, ['line', 'space', 'gradient', 'dots'], 'line'),
    thickness: numberInRange(module.thickness, 1, 12, 1),
    margin: numberInRange(module.margin, 0, 48, 8),
  };
}

function sanitizeImageModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  const imageUrl = String(module.image_url || module.url || '');
  if (entityId && entityExists(hass, entityId)) {
    return {
      id,
      type: 'image',
      entity: entityId,
      fit: oneOf(module.fit, ['cover', 'contain', 'fill', 'none'], 'cover'),
      tap_action: sanitizeAction(module.tap_action, hass),
      ...defaultDisplayActions(),
    };
  }
  if (imageUrl) {
    return {
      id,
      type: 'image',
      image_url: imageUrl.slice(0, 2048),
      fit: oneOf(module.fit, ['cover', 'contain', 'fill', 'none'], 'cover'),
      tap_action: sanitizeAction(module.tap_action, hass),
      ...defaultDisplayActions(),
    };
  }
  return null;
}

function sanitizeCameraModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  return sanitizeEntityModule('camera', 'camera', module, hass, id, {
    name: String(module.name || entityName(hass, String(module.entity || ''))),
    live_view: module.live_view !== false,
  });
}

function sanitizeSpinboxModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  return sanitizeEntityModule('spinbox', ['number', 'input_number'], module, hass, id, {
    min: numberInRange(module.min, -100000, 100000, 0),
    max: numberInRange(module.max, -100000, 100000, 100),
    step: numberInRange(module.step, 0.01, 1000, 1),
  });
}

function sanitizeSliderControlModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  return sanitizeEntityModule(
    'slider_control',
    ['light', 'cover', 'fan', 'number', 'input_number'],
    module,
    hass,
    id,
    {
      min: numberInRange(module.min, 0, 1000, 0),
      max: numberInRange(module.max, 1, 1000, 100),
    }
  );
}

function sanitizeDropdownModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  const options = Array.isArray(module.options) ? module.options : [];
  if (entityId && entityExists(hass, entityId)) {
    return sanitizeEntityModule('dropdown', ['input_select', 'select'], module, hass, id);
  }
  if (options.length) {
    return {
      id,
      type: 'dropdown',
      options: options.slice(0, 20),
      ...defaultDisplayActions(),
    };
  }
  return null;
}

function sanitizeToggleModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (entityExists(hass, entityId)) {
    return sanitizeEntityModule('toggle', '*', module, hass, id);
  }
  const states = Array.isArray(module.states) ? module.states : [];
  if (!states.length) return null;
  return { id, type: 'toggle', states: states.slice(0, 8), ...defaultDisplayActions() };
}

function sanitizeTimerModule(module: SmartModule, id: string): SmartModule | null {
  const duration = numberInRange(module.duration, 1, 86400, 300);
  return {
    id,
    type: 'timer',
    duration,
    name: String(module.name || 'Timer').slice(0, 40),
    ...defaultDisplayActions(),
  };
}

function sanitizePeopleModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : module.entity ? [module.entity] : [];
  const entities = rawEntities
    .map((item, index) => {
      const entityId = typeof item === 'string' ? item : String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      if (!entityId.startsWith('person.') && !entityId.startsWith('device_tracker.')) return null;
      return { id: `${id}-person-${index}`, entity: entityId, name: entityName(hass, entityId) };
    })
    .filter(Boolean);
  if (!entities.length) return null;
  return { id, type: 'people', entities, layout: oneOf(module.layout, ['card', 'compact', 'list'], 'card') };
}

function sanitizeCalendarModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : module.entity ? [module.entity] : [];
  const entities = rawEntities
    .map((item, index) => {
      const entityId = typeof item === 'string' ? item : String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId) || !entityId.startsWith('calendar.')) return null;
      return entityId;
    })
    .filter(Boolean);
  if (!entities.length) {
    const fallback = Object.keys(hass.states || {}).find(entityId => entityId.startsWith('calendar.'));
    if (!fallback) return null;
    entities.push(fallback);
  }
  return {
    id,
    type: 'calendar',
    entities,
    days_to_show: numberInRange(module.days_to_show, 1, 14, 5),
    view: oneOf(module.view, ['list', 'grid', 'agenda'], 'list'),
    ...defaultDisplayActions(),
  };
}

function sanitizeAreaSummaryModule(module: SmartModule, id: string): SmartModule | null {
  const area = String(module.area || module.area_id || '').trim();
  if (!area) return null;
  return {
    id,
    type: 'area_summary',
    area,
    show_climate: module.show_climate !== false,
    show_lights: module.show_lights !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeAlertCenterModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : [];
  const entities = rawEntities
    .map((item, index) => {
      const entityId = typeof item === 'string' ? item : String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      return { id: `${id}-alert-${index}`, entity: entityId, name: entityName(hass, entityId) };
    })
    .filter(Boolean);
  return {
    id,
    type: 'alert_center',
    entities,
    max_items: numberInRange(module.max_items, 1, 50, Math.max(entities.length, 8)),
    ...defaultDisplayActions(),
  };
}

function sanitizeBatteryMonitorModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : [];
  let entities = rawEntities
    .map((item, index) => {
      const entityId = typeof item === 'string' ? item : String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      return { id: `${id}-battery-${index}`, entity: entityId, name: entityName(hass, entityId) };
    })
    .filter(Boolean);
  if (!entities.length) {
    entities = Object.keys(hass.states || {})
      .filter(entityId => entityId.includes('battery'))
      .slice(0, 12)
      .map((entityId, index) => ({
        id: `${id}-battery-${index}`,
        entity: entityId,
        name: entityName(hass, entityId),
      }));
  }
  return {
    id,
    type: 'battery_monitor',
    entities,
    style_preset: oneOf(module.style_preset, ['compact', 'cards', 'list', 'minimal', 'rings'], 'compact'),
    low_threshold: numberInRange(module.low_threshold, 1, 50, 20),
    ...defaultDisplayActions(),
  };
}

function sanitizeQrCodeModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const text = String(module.text || module.content || '').trim();
  const entityId = String(module.entity || '');
  if (text) {
    return {
      id,
      type: 'qr_code',
      content_source: 'text',
      text: text.slice(0, 500),
      ...defaultDisplayActions(),
    };
  }
  if (entityId && entityExists(hass, entityId)) {
    return {
      id,
      type: 'qr_code',
      content_source: 'entity',
      entity: entityId,
      ...defaultDisplayActions(),
    };
  }
  return null;
}

function sanitizeAnimatedWeatherModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.weather_entity || module.entity || '');
  if (!entityExists(hass, entityId)) return null;
  return { id, type: 'animated_weather', weather_entity: entityId, ...defaultDisplayActions() };
}

function sanitizeAnimatedForecastModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.weather_entity || module.entity || '');
  if (!entityExists(hass, entityId)) return null;
  return {
    id,
    type: 'animated_forecast',
    weather_entity: entityId,
    days: numberInRange(module.days, 1, 7, 5),
    ...defaultDisplayActions(),
  };
}

function sanitizeAnimatedClockModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'animated_clock',
    format: oneOf(module.format, ['12h', '24h'], '12h'),
    show_seconds: module.show_seconds !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeGraphsModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : module.entity ? [module.entity] : [];
  const entities = rawEntities
    .map((item, index) => {
      const entityId = typeof item === 'string' ? item : String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      return { id: `${id}-graph-${index}`, entity: entityId, name: entityName(hass, entityId) };
    })
    .filter(Boolean);
  if (!entities.length) return null;
  return {
    id,
    type: 'graphs',
    entities,
    hours_to_show: numberInRange(module.hours_to_show, 1, 168, 24),
    ...defaultDisplayActions(),
  };
}

function sanitizeEnergyDisplayModule(module: SmartModule, id: string): SmartModule | null {
  return { id, type: 'energy_display', ...defaultDisplayActions(), ...(module.entities ? { entities: module.entities } : {}) };
}

function sanitizeSolarAnalyticsModule(module: SmartModule, id: string): SmartModule | null {
  return { id, type: 'solar_analytics', ...defaultDisplayActions(), ...(module.entities ? { entities: module.entities } : {}) };
}

function sanitizeLunarPhaseModule(module: SmartModule, id: string): SmartModule | null {
  const views = new Set(['phase', 'calendar', 'horizon']);
  const layouts = new Set(['full', 'compact', 'minimal', 'moon_only']);
  return {
    id,
    type: 'lunar_phase',
    default_view: views.has(String(module.default_view)) ? module.default_view : 'phase',
    layout: layouts.has(String(module.layout)) ? module.layout : 'full',
    ...defaultDisplayActions(),
  };
}

function sanitizeSportsScoreModule(module: SmartModule, id: string): SmartModule | null {
  const team = String(module.team || '').trim();
  if (!team) return null;
  return {
    id,
    type: 'sports_score',
    team: team.slice(0, 80),
    league: String(module.league || 'nfl').slice(0, 20),
    ...defaultDisplayActions(),
  };
}

function sanitizeVacuumModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  return sanitizeEntityModule('vacuum', 'vacuum', module, hass, id);
}

function sanitizeMapModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : module.entity ? [module.entity] : [];
  const entities = rawEntities
    .map((item, index) => {
      const entityId = typeof item === 'string' ? item : String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      return { id: `${id}-map-${index}`, entity: entityId, name: entityName(hass, entityId) };
    })
    .filter(Boolean);
  if (!entities.length) return null;
  return {
    id,
    type: 'map',
    entities,
    default_zoom: numberInRange(module.default_zoom, 1, 20, 12),
    ...defaultDisplayActions(),
  };
}

function sanitizeAutoEntityListModule(module: SmartModule, id: string): SmartModule | null {
  const filters = module.filters && typeof module.filters === 'object' ? module.filters : { domain: 'light' };
  return {
    id,
    type: 'auto_entity_list',
    filters,
    max_items: numberInRange(module.max_items, 1, 100, 12),
    ...defaultDisplayActions(),
  };
}

function sanitizeDynamicListModule(module: SmartModule, id: string): SmartModule | null {
  const template = String(module.template || '').trim();
  if (!template) return null;
  return { id, type: 'dynamic-list', template: template.slice(0, 4000), ...defaultDisplayActions() };
}

function sanitizeInputHelperModule(
  type: string,
  domain: string | string[],
  module: SmartModule,
  hass: SmartSanitizeHass,
  id: string
): SmartModule | null {
  return sanitizeEntityModule(type, domain, module, hass, id);
}

function createEntityDefaultBuilder(
  type: string,
  extras: Record<string, unknown> = {}
): (ctx: SmartBuildContext) => SmartModule | null {
  return ctx => {
    const entity = ctx.entity;
    if (!entity) return null;
    return {
      id: ctx.id,
      type,
      entity: entity.entityId,
      name: entity.name,
      ...defaultDisplayActions(),
      ...extras,
    };
  };
}

function createEntitiesDefaultBuilder(
  type: string,
  extras: Record<string, unknown> = {}
): (ctx: SmartBuildContext) => SmartModule | null {
  return ctx => {
    const entities = ctx.entities?.length ? ctx.entities : ctx.entity ? [ctx.entity] : [];
    if (!entities.length) return null;
    return {
      id: ctx.id,
      type,
      entities: entities.map((entity, index) => ({
        id: `${ctx.id}-entity-${index}`,
        entity: entity.entityId,
        name: entity.name,
      })),
      ...defaultDisplayActions(),
      ...extras,
    };
  };
}

function sanitizeUpdateMonitorModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'update_monitor',
    show_up_to_date: Boolean(module.show_up_to_date),
    max_items: numberInRange(module.max_items, 1, 100, 25),
    ...defaultDisplayActions(),
  };
}

function sanitizeClockModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'clock',
    time_format: oneOf(module.time_format, ['12', '24'], '12'),
    show_seconds: Boolean(module.show_seconds),
    show_date: module.show_date !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeWeatherModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.weather_entity || module.entity || '');
  if (!entityExists(hass, entityId) || !entityId.startsWith('weather.')) return null;
  return {
    id,
    type: 'weather',
    weather_entity: entityId,
    forecast_type: oneOf(module.forecast_type, ['daily', 'hourly'], 'daily'),
    forecast_count: numberInRange(module.forecast_count, 1, 8, 5),
    ...defaultDisplayActions(),
  };
}

/* -------------------------------------------------------------------------- */
/* Pro household modules                                                       */
/*                                                                             */
/* These are configuration-heavy (floorplan geometry, per-appliance wattage    */
/* thresholds, service intervals), so the planner can only ever produce a      */
/* sensible skeleton. Each sanitizer therefore keeps the analysis knobs at     */
/* their safe defaults and only carries across what a prompt can plausibly     */
/* specify. Battery Fleet and Vampire Power are the exceptions: they           */
/* auto-discover their own entities, so an empty config is already useful.     */
/* -------------------------------------------------------------------------- */

function sanitizeCleaningZonesModule(
  module: SmartModule,
  hass: SmartSanitizeHass,
  id: string
): SmartModule | null {
  const todoEntity = String(module.todo_entity || '');
  if (todoEntity && !entityExists(hass, todoEntity)) return null;
  return {
    id,
    type: 'cleaning_zones',
    todo_entity: todoEntity,
    floorplan_image: String(module.floorplan_image || ''),
    zones: Array.isArray(module.zones) ? module.zones : [],
    view_mode: oneOf(module.view_mode, ['map', 'list', 'both'] as const, 'both'),
    default_interval_days: numberInRange(module.default_interval_days, 1, 365, 7),
    overdue_grace_days: numberInRange(module.overdue_grace_days, 0, 30, 1),
    sort_mode: oneOf(module.sort_mode, ['staleness', 'name', 'interval'] as const, 'staleness'),
    staleness_style: oneOf(module.staleness_style, ['heat', 'outline', 'badge'] as const, 'heat'),
    zone_opacity: numberInRange(module.zone_opacity, 0.1, 1, 0.55),
    show_title: module.show_title !== false,
    show_summary_bar: module.show_summary_bar !== false,
    show_legend: module.show_legend !== false,
    show_zone_labels: module.show_zone_labels !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeBatteryFleetModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'battery_fleet',
    discovery_mode: oneOf(module.discovery_mode, ['auto', 'manual', 'both'] as const, 'auto'),
    entities: Array.isArray(module.entities) ? module.entities : [],
    exclude_patterns: Array.isArray(module.exclude_patterns) ? module.exclude_patterns : [],
    hidden_entities: [],
    include_battery_level_attribute: module.include_battery_level_attribute !== false,
    include_binary_sensors: Boolean(module.include_binary_sensors),
    area_filter: [],
    history_days: numberInRange(module.history_days, 1, 30, 14),
    predict_replacement: module.predict_replacement !== false,
    replacement_floor: numberInRange(module.replacement_floor, 0, 50, 5),
    min_confidence_hours: numberInRange(module.min_confidence_hours, 1, 72, 12),
    layout: oneOf(module.layout, ['table', 'cards', 'compact'] as const, 'table'),
    sort_mode: oneOf(
      module.sort_mode,
      ['urgency', 'level', 'name', 'drain_rate'] as const,
      'urgency'
    ),
    max_items: numberInRange(module.max_items, 1, 100, 25),
    critical_threshold: numberInRange(module.critical_threshold, 0, 50, 10),
    low_threshold: numberInRange(module.low_threshold, 0, 75, 25),
    urgent_days: numberInRange(module.urgent_days, 1, 90, 14),
    show_title: module.show_title !== false,
    show_summary_bar: module.show_summary_bar !== false,
    show_sparkline: module.show_sparkline !== false,
    show_drain_rate: module.show_drain_rate !== false,
    show_eta: module.show_eta !== false,
    show_charging_indicator: module.show_charging_indicator !== false,
    show_only_problems: Boolean(module.show_only_problems),
    ...defaultDisplayActions(),
  };
}

function sanitizePlantCareModule(
  module: SmartModule,
  hass: SmartSanitizeHass,
  id: string
): SmartModule | null {
  const todoEntity = String(module.todo_entity || '');
  if (todoEntity && !entityExists(hass, todoEntity)) return null;
  return {
    id,
    type: 'plant_care',
    todo_entity: todoEntity,
    plants: Array.isArray(module.plants) ? module.plants : [],
    layout: oneOf(module.layout, ['grid', 'list', 'map'] as const, 'grid'),
    map_image: String(module.map_image || ''),
    columns: numberInRange(module.columns, 1, 6, 3),
    default_water_interval_days: numberInRange(module.default_water_interval_days, 1, 365, 7),
    default_fertilize_interval_days: numberInRange(
      module.default_fertilize_interval_days,
      0,
      365,
      30
    ),
    moisture_source: oneOf(
      module.moisture_source,
      ['schedule', 'sensor', 'both'] as const,
      'both'
    ),
    seasonal_adjust: Boolean(module.seasonal_adjust),
    show_title: module.show_title !== false,
    show_summary_bar: module.show_summary_bar !== false,
    show_photos: module.show_photos !== false,
    show_moisture: module.show_moisture !== false,
    show_next_due: module.show_next_due !== false,
    show_fertilize: module.show_fertilize !== false,
    overdue_first: module.overdue_first !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeLaundryTrackerModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'laundry_tracker',
    appliances: Array.isArray(module.appliances) ? module.appliances : [],
    history_days: numberInRange(module.history_days, 1, 30, 7),
    layout: oneOf(module.layout, ['stack', 'row'] as const, 'stack'),
    energy_rate: numberInRange(module.energy_rate, 0, 10, 0.15),
    currency_symbol: String(module.currency_symbol || '$'),
    notify_service: '',
    show_title: module.show_title !== false,
    show_status_cards: module.show_status_cards !== false,
    show_timeline: module.show_timeline !== false,
    show_history_stats: module.show_history_stats !== false,
    show_energy: module.show_energy !== false,
    show_idle_alert: module.show_idle_alert !== false,
    show_handoff_hint: module.show_handoff_hint !== false,
    acknowledge_enabled: module.acknowledge_enabled !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeVehicleMaintenanceModule(
  module: SmartModule,
  hass: SmartSanitizeHass,
  id: string
): SmartModule | null {
  const odometerEntity = String(module.odometer_entity || '');
  if (odometerEntity && !entityExists(hass, odometerEntity)) return null;
  const todoEntity = String(module.todo_entity || '');
  if (todoEntity && !entityExists(hass, todoEntity)) return null;
  return {
    id,
    type: 'vehicle_maintenance',
    vehicle_name: String(module.vehicle_name || module.name || 'My Vehicle'),
    vehicle_image: String(module.vehicle_image || ''),
    odometer_entity: odometerEntity,
    odometer_offset: numberInRange(module.odometer_offset, -1000000, 1000000, 0),
    distance_unit: oneOf(module.distance_unit, ['mi', 'km'] as const, 'mi'),
    fuel_entity: '',
    battery_entity: '',
    todo_entity: todoEntity,
    services: Array.isArray(module.services) ? module.services : [],
    layout: oneOf(module.layout, ['hero', 'list', 'compact'] as const, 'hero'),
    due_soon_distance: numberInRange(module.due_soon_distance, 0, 5000, 500),
    due_soon_days: numberInRange(module.due_soon_days, 0, 180, 14),
    log_limit: numberInRange(module.log_limit, 5, 100, 25),
    currency_symbol: String(module.currency_symbol || '$'),
    show_title: module.show_title !== false,
    show_vehicle_image: module.show_vehicle_image !== false,
    show_odometer: module.show_odometer !== false,
    show_fuel: module.show_fuel !== false,
    show_next_service: module.show_next_service !== false,
    show_service_log: module.show_service_log !== false,
    show_costs: module.show_costs !== false,
    show_progress_bars: module.show_progress_bars !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeVampirePowerModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'vampire_power',
    discovery_mode: oneOf(module.discovery_mode, ['auto', 'manual', 'both'] as const, 'auto'),
    entities: Array.isArray(module.entities) ? module.entities : [],
    exclude_patterns: Array.isArray(module.exclude_patterns) ? module.exclude_patterns : [],
    hidden_entities: [],
    history_days: numberInRange(module.history_days, 1, 30, 7),
    baseline_percentile: numberInRange(module.baseline_percentile, 0.01, 0.5, 0.1),
    min_standby_watts: numberInRange(module.min_standby_watts, 0, 20, 0.5),
    max_standby_watts: numberInRange(module.max_standby_watts, 10, 500, 100),
    energy_rate: numberInRange(module.energy_rate, 0, 10, 0.15),
    currency_symbol: String(module.currency_symbol || '$'),
    cost_period: oneOf(module.cost_period, ['day', 'month', 'year'] as const, 'year'),
    layout: oneOf(module.layout, ['ranked', 'cards', 'compact'] as const, 'ranked'),
    sort_mode: oneOf(module.sort_mode, ['cost', 'watts', 'name'] as const, 'cost'),
    max_items: numberInRange(module.max_items, 1, 50, 15),
    highlight_threshold_watts: numberInRange(module.highlight_threshold_watts, 0, 50, 5),
    show_title: module.show_title !== false,
    show_total_bar: module.show_total_bar !== false,
    show_bars: module.show_bars !== false,
    show_cost: module.show_cost !== false,
    show_savings_hint: module.show_savings_hint !== false,
    ...defaultDisplayActions(),
  };
}

function sanitizeUnifiModule(module: SmartModule, id: string): SmartModule | null {
  return {
    id,
    type: 'unifi',
    view: oneOf(
      module.view,
      ['rack', 'ports', 'devices', 'topology', 'clients', 'wan'] as const,
      'rack'
    ),
    device_order: [],
    hidden_device_ids: [],
    include_clients: true,
    client_ids: [],
    curation_seeded: false,
    rack_max_devices: numberInRange(module.rack_max_devices, 1, 64, 16),
    use_device_images: module.use_device_images !== false,
    show_camera_previews: module.show_camera_previews !== false,
    show_title: module.show_title !== false,
    title: String(module.title || 'UniFi Network'),
    rack_style: oneOf(module.rack_style, ['dark', 'light', 'glass', 'blueprint', 'blank'] as const, 'dark'),
    blank_background: module.blank_background === true,
    show_port_labels: true,
    show_advanced: module.show_advanced !== false,
    show_sparklines: module.show_sparklines !== false,
    animation_intensity: oneOf(module.animation_intensity, ['full', 'subtle', 'off'] as const, 'full'),
    topology_layout: oneOf(module.topology_layout, ['tree', 'radial'] as const, 'tree'),
    setup_dismissed: false,
    ...defaultDisplayActions(),
  };
}

export const supplementalSmartModuleHandlers = {
  bar: {
    sanitize: wrapSanitize(sanitizeBarModule),
    defaultBuilder: buildBarModuleFromContext,
  },
  separator: { sanitize: wrapSanitize((module, _hass, id) => sanitizeSeparatorModule(module, id)) },
  image: { sanitize: wrapSanitize(sanitizeImageModule) },
  camera: {
    sanitize: wrapSanitize(sanitizeCameraModule),
    defaultBuilder: createEntityDefaultBuilder('camera', { live_view: true }),
  },
  spinbox: {
    sanitize: wrapSanitize(sanitizeSpinboxModule),
    defaultBuilder: createEntityDefaultBuilder('spinbox'),
  },
  slider_control: {
    sanitize: wrapSanitize(sanitizeSliderControlModule),
    defaultBuilder: createEntityDefaultBuilder('slider_control'),
  },
  dropdown: { sanitize: wrapSanitize(sanitizeDropdownModule) },
  toggle: {
    sanitize: wrapSanitize(sanitizeToggleModule),
    defaultBuilder: createEntityDefaultBuilder('toggle'),
  },
  timer: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeTimerModule(module, id)),
    defaultBuilder: () => ({
      id: 'timer',
      type: 'timer',
      duration: 300,
      name: 'Timer',
      ...defaultDisplayActions(),
    }),
  },
  people: {
    sanitize: wrapSanitize(sanitizePeopleModule),
    defaultBuilder: createEntitiesDefaultBuilder('people', { layout: 'card' }),
  },
  calendar: {
    sanitize: wrapSanitize(sanitizeCalendarModule),
    defaultBuilder: createEntitiesDefaultBuilder('calendar', { days_to_show: 5, view: 'list' }),
  },
  area_summary: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeAreaSummaryModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'area_summary',
      area: String(ctx.prompt.match(/\b(?:room|area)\s+([a-z0-9 _-]+)/i)?.[1] || 'home').trim(),
      show_climate: true,
      show_lights: true,
      ...defaultDisplayActions(),
    }),
  },
  alert_center: {
    sanitize: wrapSanitize(sanitizeAlertCenterModule),
    defaultBuilder: createEntitiesDefaultBuilder('alert_center', { max_items: 8 }),
  },
  battery_monitor: {
    sanitize: wrapSanitize(sanitizeBatteryMonitorModule),
    defaultBuilder: createEntitiesDefaultBuilder('battery_monitor', {
      style_preset: 'compact',
      low_threshold: 20,
    }),
  },
  qr_code: {
    sanitize: wrapSanitize(sanitizeQrCodeModule),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'qr_code',
      content_source: ctx.entity ? 'entity' : 'text',
      ...(ctx.entity ? { entity: ctx.entity.entityId } : { text: 'wifi-password' }),
      ...defaultDisplayActions(),
    }),
  },
  dog_duty: {
    sanitize: wrapSanitize((module, hass, id) => {
      const cameraEntity = String(
        (module as any).camera_entity ||
          (String(module.entity || '').startsWith('camera.') ? module.entity : '') ||
          ''
      );
      const todoEntity = String((module as any).todo_entity || '');
      if (cameraEntity && !entityExists(hass, cameraEntity)) return null;
      if (todoEntity && !entityExists(hass, todoEntity)) return null;
      return {
        id,
        type: 'dog_duty',
        camera_entity: cameraEntity,
        todo_entity: todoEntity,
        lookback_hours: numberInRange((module as any).lookback_hours, 6, 168, 48),
        marker_style: oneOf((module as any).marker_style, ['x', 'emoji', 'pin'] as const, 'x'),
        show_heatmap: !!(module as any).show_heatmap,
        show_cleaned: !!(module as any).show_cleaned,
        background_mode: oneOf(
          (module as any).background_mode,
          ['live_snapshot', 'reference'] as const,
          'live_snapshot'
        ),
        scan_cooldown_minutes: numberInRange((module as any).scan_cooldown_minutes, 1, 60, 10),
        show_status_bar: true,
        show_scrubber: true,
        show_scan_now: true,
        show_title: true,
        ...defaultDisplayActions(),
      };
    }),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'dog_duty',
      camera_entity: ctx.entity?.entityId?.startsWith('camera.') ? ctx.entity.entityId : '',
      todo_entity: '',
      lookback_hours: 48,
      marker_style: 'x',
      show_heatmap: false,
      show_cleaned: false,
      background_mode: 'live_snapshot',
      scan_cooldown_minutes: 10,
      show_status_bar: true,
      show_scrubber: true,
      show_scan_now: true,
      show_title: true,
      ...defaultDisplayActions(),
    }),
  },
  cleaning_zones: {
    sanitize: wrapSanitize(sanitizeCleaningZonesModule),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'cleaning_zones',
      todo_entity: ctx.entity?.entityId?.startsWith('todo.') ? ctx.entity.entityId : '',
      floorplan_image: '',
      zones: [],
      view_mode: 'both',
      default_interval_days: 7,
      overdue_grace_days: 1,
      sort_mode: 'staleness',
      staleness_style: 'heat',
      zone_opacity: 0.55,
      show_title: true,
      show_summary_bar: true,
      show_legend: true,
      show_zone_labels: true,
      ...defaultDisplayActions(),
    }),
  },
  battery_fleet: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeBatteryFleetModule(module, id)),
    // Auto-discovery means no entity context is required to produce a useful card.
    defaultBuilder: (ctx: SmartBuildContext) =>
      sanitizeBatteryFleetModule({ type: 'battery_fleet' } as SmartModule, ctx.id),
  },
  plant_care: {
    sanitize: wrapSanitize(sanitizePlantCareModule),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'plant_care',
      todo_entity: ctx.entity?.entityId?.startsWith('todo.') ? ctx.entity.entityId : '',
      plants: [],
      layout: 'grid',
      map_image: '',
      columns: 3,
      default_water_interval_days: 7,
      default_fertilize_interval_days: 30,
      moisture_source: 'both',
      seasonal_adjust: false,
      show_title: true,
      show_summary_bar: true,
      show_photos: true,
      show_moisture: true,
      show_next_due: true,
      show_fertilize: true,
      overdue_first: true,
      ...defaultDisplayActions(),
    }),
  },
  laundry_tracker: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeLaundryTrackerModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) =>
      sanitizeLaundryTrackerModule({ type: 'laundry_tracker' } as SmartModule, ctx.id),
  },
  vehicle_maintenance: {
    sanitize: wrapSanitize(sanitizeVehicleMaintenanceModule),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'vehicle_maintenance',
      vehicle_name: 'My Vehicle',
      vehicle_image: '',
      odometer_entity: ctx.entity?.entityId?.startsWith('sensor.') ? ctx.entity.entityId : '',
      odometer_offset: 0,
      distance_unit: 'mi',
      fuel_entity: '',
      battery_entity: '',
      todo_entity: '',
      services: [],
      layout: 'hero',
      due_soon_distance: 500,
      due_soon_days: 14,
      log_limit: 25,
      currency_symbol: '$',
      show_title: true,
      show_vehicle_image: true,
      show_odometer: true,
      show_fuel: true,
      show_next_service: true,
      show_service_log: true,
      show_costs: true,
      show_progress_bars: true,
      ...defaultDisplayActions(),
    }),
  },
  vampire_power: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeVampirePowerModule(module, id)),
    // Auto-discovery means no entity context is required to produce a useful card.
    defaultBuilder: (ctx: SmartBuildContext) =>
      sanitizeVampirePowerModule({ type: 'vampire_power' } as SmartModule, ctx.id),
  },
  unifi: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeUnifiModule(module, id)),
    // UniFi gear is auto-discovered from the integration — no entity required.
    defaultBuilder: (ctx: SmartBuildContext) =>
      sanitizeUnifiModule({ type: 'unifi' } as SmartModule, ctx.id),
  },
  animated_weather: {
    sanitize: wrapSanitize(sanitizeAnimatedWeatherModule),
    defaultBuilder: (ctx: SmartBuildContext) =>
      ctx.entity
        ? { id: ctx.id, type: 'animated_weather', weather_entity: ctx.entity.entityId, ...defaultDisplayActions() }
        : null,
  },
  animated_forecast: {
    sanitize: wrapSanitize(sanitizeAnimatedForecastModule),
    defaultBuilder: (ctx: SmartBuildContext) =>
      ctx.entity
        ? {
            id: ctx.id,
            type: 'animated_forecast',
            weather_entity: ctx.entity.entityId,
            days: 5,
            ...defaultDisplayActions(),
          }
        : null,
  },
  animated_clock: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeAnimatedClockModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'animated_clock',
      format: '12h',
      show_seconds: true,
      ...defaultDisplayActions(),
    }),
  },
  graphs: {
    sanitize: wrapSanitize(sanitizeGraphsModule),
    defaultBuilder: createEntitiesDefaultBuilder('graphs', { hours_to_show: 24 }),
  },
  energy_display: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeEnergyDisplayModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({ id: ctx.id, type: 'energy_display', ...defaultDisplayActions() }),
  },
  solar_analytics: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeSolarAnalyticsModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({ id: ctx.id, type: 'solar_analytics', ...defaultDisplayActions() }),
  },
  lunar_phase: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeLunarPhaseModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'lunar_phase',
      default_view: 'phase',
      layout: 'full',
      ...defaultDisplayActions(),
    }),
  },
  sports_score: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeSportsScoreModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'sports_score',
      team: 'local team',
      league: 'nfl',
      ...defaultDisplayActions(),
    }),
  },
  vacuum: {
    sanitize: wrapSanitize(sanitizeVacuumModule),
    defaultBuilder: createEntityDefaultBuilder('vacuum'),
  },
  map: {
    sanitize: wrapSanitize(sanitizeMapModule),
    defaultBuilder: createEntitiesDefaultBuilder('map', { default_zoom: 12 }),
  },
  auto_entity_list: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeAutoEntityListModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'auto_entity_list',
      filters: { domain: ctx.entity?.domain || 'light' },
      max_items: 12,
      ...defaultDisplayActions(),
    }),
  },
  'dynamic-list': {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeDynamicListModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'dynamic-list',
      template: '{{ states.light | map(attribute="entity_id") | list }}',
      ...defaultDisplayActions(),
    }),
  },
  text_input: {
    sanitize: wrapSanitize((module, hass, id) => sanitizeInputHelperModule('text_input', 'input_text', module, hass, id)),
    defaultBuilder: createEntityDefaultBuilder('text_input'),
  },
  number_input: {
    sanitize: wrapSanitize((module, hass, id) => sanitizeInputHelperModule('number_input', 'input_number', module, hass, id)),
    defaultBuilder: createEntityDefaultBuilder('number_input'),
  },
  boolean_input: {
    sanitize: wrapSanitize((module, hass, id) =>
      sanitizeInputHelperModule('boolean_input', ['input_boolean', 'switch'], module, hass, id)
    ),
    defaultBuilder: createEntityDefaultBuilder('boolean_input'),
  },
  select_input: {
    sanitize: wrapSanitize((module, hass, id) => sanitizeInputHelperModule('select_input', 'input_select', module, hass, id)),
    defaultBuilder: createEntityDefaultBuilder('select_input'),
  },
  datetime_input: {
    sanitize: wrapSanitize((module, hass, id) => sanitizeInputHelperModule('datetime_input', 'input_datetime', module, hass, id)),
    defaultBuilder: createEntityDefaultBuilder('datetime_input'),
  },
  slider_input: {
    sanitize: wrapSanitize((module, hass, id) => sanitizeInputHelperModule('slider_input', 'input_number', module, hass, id)),
    defaultBuilder: createEntityDefaultBuilder('slider_input'),
  },
  button_input: {
    sanitize: wrapSanitize((module, hass, id) => sanitizeInputHelperModule('button_input', 'input_button', module, hass, id)),
    defaultBuilder: createEntityDefaultBuilder('button_input'),
  },
  counter_input: {
    sanitize: wrapSanitize((module, hass, id) => sanitizeInputHelperModule('counter_input', 'counter', module, hass, id)),
    defaultBuilder: createEntityDefaultBuilder('counter_input'),
  },
  color_input: {
    sanitize: wrapSanitize((module, hass, id) =>
      sanitizeInputHelperModule('color_input', ['input_text', 'light'], module, hass, id)
    ),
    defaultBuilder: createEntityDefaultBuilder('color_input'),
  },
  update_monitor: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeUpdateMonitorModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'update_monitor',
      show_up_to_date: false,
      max_items: 25,
      ...defaultDisplayActions(),
    }),
  },
  clock: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeClockModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => ({
      id: ctx.id,
      type: 'clock',
      time_format: '12',
      show_seconds: false,
      show_date: true,
      ...defaultDisplayActions(),
    }),
  },
  humidifier: {
    sanitize: wrapSanitize((module, hass, id) =>
      sanitizeEntityModule('humidifier', 'humidifier', module, hass, id)
    ),
    defaultBuilder: createEntityDefaultBuilder('humidifier'),
  },
  ...Object.fromEntries(
    (['washer', 'dryer', 'dishwasher', 'fridge', 'range'] as const).map(applianceType => [
      applianceType,
      {
        sanitize: wrapSanitize((module, hass, id) =>
          sanitizeEntityModule(
            applianceType,
            ['select', 'input_select', 'sensor', 'switch', 'binary_sensor', 'number'],
            module,
            hass,
            id,
            {
              layout: module.layout || 'standard',
              show_title: module.show_title !== false,
              show_status: module.show_status !== false,
              enable_animations: module.enable_animations !== false,
            }
          )
        ),
        defaultBuilder: createEntityDefaultBuilder(applianceType, {
          layout: 'standard',
          show_title: true,
          show_status: true,
          enable_animations: true,
        }),
      },
    ])
  ),
  todo_list: {
    sanitize: wrapSanitize((module, hass, id) =>
      sanitizeEntityModule('todo_list', 'todo', module, hass, id)
    ),
    defaultBuilder: createEntityDefaultBuilder('todo_list'),
  },
  weather: {
    sanitize: wrapSanitize(sanitizeWeatherModule),
    defaultBuilder: (ctx: SmartBuildContext) =>
      ctx.entity
        ? {
            id: ctx.id,
            type: 'weather',
            weather_entity: ctx.entity.entityId,
            forecast_type: 'daily',
            forecast_count: 5,
            ...defaultDisplayActions(),
          }
        : null,
  },
};
