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
