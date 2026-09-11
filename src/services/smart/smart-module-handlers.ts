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

const SEPARATOR_STYLES = ['line', 'double_line', 'dotted', 'double_dotted', 'shadow', 'blank'];
const SEPARATOR_STYLE_ALIASES: Record<string, string> = { space: 'blank', gradient: 'shadow', dots: 'dotted' };

function sanitizeSeparatorModule(module: SmartModule, id: string): SmartModule | null {
  const requested = String(module.separator_style || module.style || '');
  return {
    id,
    type: 'separator',
    separator_style: oneOf(SEPARATOR_STYLE_ALIASES[requested] || requested, SEPARATOR_STYLES, 'line'),
    thickness: numberInRange(module.thickness, 1, 12, 1),
    ...defaultDisplayActions(),
  };
}

function sanitizeImageModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.image_entity || module.entity || '');
  const imageUrl = String(module.image_url || module.url || '');
  const objectFit = oneOf(module.object_fit || module.fit, ['cover', 'contain', 'fill', 'none', 'scale-down'], 'cover');
  if (entityId && entityExists(hass, entityId)) {
    return {
      id,
      type: 'image',
      image_type: 'entity',
      image_entity: entityId,
      object_fit: objectFit,
      ...defaultDisplayActions(),
      tap_action: sanitizeAction(module.tap_action, hass),
    };
  }
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('/')) {
    return {
      id,
      type: 'image',
      image_type: 'url',
      image_url: imageUrl.slice(0, 2048),
      object_fit: objectFit,
      ...defaultDisplayActions(),
      tap_action: sanitizeAction(module.tap_action, hass),
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

function entityAttributes(hass: SmartSanitizeHass, entityId: string): Record<string, unknown> {
  const state = (hass.states || {})[entityId] as { attributes?: Record<string, unknown> } | undefined;
  return state?.attributes || {};
}

function sanitizeSpinboxModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  const attrs = entityAttributes(hass, entityId);
  return sanitizeEntityModule('spinbox', ['number', 'input_number'], module, hass, id, {
    min_value: numberInRange(module.min_value ?? module.min ?? attrs.min, -100000, 100000, 0),
    max_value: numberInRange(module.max_value ?? module.max ?? attrs.max, -100000, 100000, 100),
    step: numberInRange(module.step ?? attrs.step, 0.01, 1000, 1),
  });
}

/** slider_control renders `bars`; one bar per entity (brightness for lights, numeric otherwise). */
function sanitizeSliderControlModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const fromBars = Array.isArray(module.bars)
    ? (module.bars as SmartModule[]).map(bar => String(bar?.entity || ''))
    : [];
  const entityIds = collectEntityIds({ ...module, bars: fromBars }, hass, 'bars').filter(entityId =>
    ['light', 'cover', 'fan', 'number', 'input_number'].some(domain => entityId.startsWith(`${domain}.`))
  );
  if (!entityIds.length) return null;
  return {
    id,
    type: 'slider_control',
    bars: entityIds.slice(0, 6).map((entityId, index) => {
      const attrs = entityAttributes(hass, entityId);
      const isLight = entityId.startsWith('light.');
      return {
        id: `${id}-bar-${index}`,
        type: isLight ? 'brightness' : 'numeric',
        entity: entityId,
        name: entityName(hass, entityId),
        min_value: numberInRange(module.min_value ?? module.min ?? attrs.min, -100000, 100000, 0),
        max_value: numberInRange(module.max_value ?? module.max ?? attrs.max, -100000, 100000, 100),
        step: numberInRange(module.step ?? attrs.step, 0.01, 1000, 1),
        show_icon: true,
        show_name: true,
        show_value: true,
      };
    }),
    ...defaultDisplayActions(),
  };
}

function sanitizeDropdownModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.source_entity || module.entity || '');
  if (
    entityId &&
    entityExists(hass, entityId) &&
    (entityId.startsWith('input_select.') || entityId.startsWith('select.'))
  ) {
    return {
      id,
      type: 'dropdown',
      source_mode: 'entity',
      source_entity: entityId,
      placeholder: String(module.placeholder || entityName(hass, entityId)).slice(0, 60),
      ...defaultDisplayActions(),
    };
  }
  const rawOptions = Array.isArray(module.options) ? (module.options as unknown[]) : [];
  const options = rawOptions
    .map((option, index) => {
      if (!option || typeof option !== 'object') return null;
      const record = option as SmartModule;
      const label = String(record.label || record.name || '').trim();
      if (!label) return null;
      const action = sanitizeAction(record.action || record.tap_action, hass);
      return { id: `${id}-option-${index}`, label: label.slice(0, 60), action };
    })
    .filter(Boolean)
    .slice(0, 20);
  if (!options.length) return null;
  return { id, type: 'dropdown', source_mode: 'manual', options, ...defaultDisplayActions() };
}

/** toggle renders `toggle_points`; an entity becomes Off/On points that track its state. */
function sanitizeToggleModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.tracking_entity || module.entity || '');
  const rawPoints = Array.isArray(module.toggle_points)
    ? (module.toggle_points as unknown[])
    : Array.isArray(module.states)
      ? (module.states as unknown[])
      : [];
  const points = rawPoints
    .map((point, index) => {
      if (typeof point === 'string') return { id: `${id}-point-${index}`, label: point.slice(0, 40) };
      if (!point || typeof point !== 'object') return null;
      const record = point as SmartModule;
      const label = String(record.label || record.name || record.state || '').trim();
      if (!label) return null;
      return {
        id: `${id}-point-${index}`,
        label: label.slice(0, 40),
        ...(record.icon ? { icon: String(record.icon) } : {}),
        ...(record.tap_action ? { tap_action: sanitizeAction(record.tap_action, hass) } : {}),
        ...(record.match_state ? { match_state: record.match_state } : {}),
      };
    })
    .filter(Boolean)
    .slice(0, 8);

  if (points.length >= 2) {
    return {
      id,
      type: 'toggle',
      toggle_points: points,
      ...(entityExists(hass, entityId) ? { tracking_entity: entityId } : {}),
      ...defaultDisplayActions(),
    };
  }
  if (!entityExists(hass, entityId)) return null;
  const name = entityName(hass, entityId);
  return {
    id,
    type: 'toggle',
    title: name,
    show_title: true,
    tracking_entity: entityId,
    toggle_points: [
      {
        id: `${id}-point-off`,
        label: 'Off',
        icon: 'mdi:power-off',
        match_entity: entityId,
        match_state: ['off', 'closed', 'locked', 'not_home', 'idle', 'docked'],
        tap_action: { action: 'perform-action', service: 'homeassistant.turn_off', service_data: { entity_id: entityId } },
      },
      {
        id: `${id}-point-on`,
        label: 'On',
        icon: 'mdi:power-on',
        match_entity: entityId,
        match_state: ['on', 'open', 'unlocked', 'home', 'playing', 'cleaning'],
        tap_action: { action: 'perform-action', service: 'homeassistant.turn_on', service_data: { entity_id: entityId } },
      },
    ],
    ...defaultDisplayActions(),
  };
}

function sanitizeTimerModule(module: SmartModule, id: string): SmartModule | null {
  const durationSeconds = numberInRange(module.duration_seconds ?? module.duration, 1, 86400, 300);
  return {
    id,
    type: 'timer',
    duration_seconds: durationSeconds,
    title: String(module.title || module.name || 'Timer').slice(0, 40),
    style: oneOf(module.style, ['circle', 'progress_bar', 'digital', 'background_fill'], 'circle'),
    ...defaultDisplayActions(),
  };
}

const PEOPLE_LAYOUTS = ['compact', 'banner', 'horizontal_compact', 'horizontal_detailed', 'header', 'music_overlay'];

/** One real `people` module: the module shows a single `person_entity`. */
function buildPeopleModule(id: string, entityId: string, layoutStyle: string): SmartModule {
  return {
    id,
    type: 'people',
    person_entity: entityId,
    layout_style: layoutStyle,
    show_avatar: true,
    show_location_badge: true,
    ...defaultDisplayActions(),
  };
}

/**
 * The people module is per-person, so several people become a row (up to 4) or a column of
 * horizontal person cards. Accepts the AI's `person_entity`, `entity`, or `entities` forms.
 */
/** "who is home", "the family", "everyone", "home occupancy"... — the whole household, not one person. */
export const HOUSEHOLD_PROMPT =
  /\b(who(?:'s| is| are)\s+(?:at\s+)?home|who(?:'s| is)\s+away|(?:whether|if)\s+anyone|anyone(?:'s| is)?\s+(?:at\s+)?home|everyone|everybody|family|household|people|persons|presence|home occupancy|occupants?)\b/i;

export function allPersonEntityIds(hass: SmartSanitizeHass): string[] {
  return Object.keys(hass.states || {}).filter(entityId => entityId.startsWith('person.'));
}

/** True when the prompt names one of the given people (by friendly name or object id). */
export function promptNamesAPerson(prompt: string, hass: SmartSanitizeHass, entityIds: string[]): boolean {
  const text = ` ${prompt.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
  return entityIds.some(entityId => {
    const names = [entityName(hass, entityId), entityId.split('.')[1] || '']
      .map(name => name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())
      .filter(name => name.length >= 3);
    return names.some(name => text.includes(` ${name} `));
  });
}

function sanitizePeopleModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const raw = Array.isArray(module.entities)
    ? module.entities
    : module.person_entity || module.entity
      ? [module.person_entity || module.entity]
      : [];
  let entityIds = raw
    .map(item => (typeof item === 'string' ? item : String((item as SmartModule).entity || '')))
    .filter(entityId => entityExists(hass, entityId))
    .filter(entityId => entityId.startsWith('person.') || entityId.startsWith('device_tracker.'));
  if (!entityIds.length) {
    // The AI asked for people but named none (or named badly): every person in the home.
    entityIds = allPersonEntityIds(hass);
  }
  if (!entityIds.length) return null;

  const requestedLayout = String(module.layout_style || module.layout || '');
  if (entityIds.length === 1) {
    return buildPeopleModule(id, entityIds[0], oneOf(requestedLayout, PEOPLE_LAYOUTS, 'horizontal_compact'));
  }
  const inRow = entityIds.length <= 4;
  const layoutStyle = oneOf(requestedLayout, PEOPLE_LAYOUTS, inRow ? 'compact' : 'horizontal_compact');
  const people = entityIds.slice(0, 8).map((entityId, index) => buildPeopleModule(`${id}-person-${index}`, entityId, layoutStyle));
  return inRow
    ? { id, type: 'horizontal', gap: 12, gap_unit: 'px', alignment: 'space-around', vertical_alignment: 'top', modules: people }
    : { id, type: 'vertical', gap: 8, gap_unit: 'px', horizontal_alignment: 'stretch', modules: people };
}

function sanitizeTrainModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.departure_entities)
    ? module.departure_entities
    : Array.isArray(module.entities)
      ? module.entities
      : module.entity
        ? [module.entity]
        : [];
  const departure_entities = rawEntities
    .map(item => (typeof item === 'string' ? item : String((item as SmartModule).entity || '')))
    .filter(entityId => entityExists(hass, entityId) && entityId.startsWith('sensor.'))
    .slice(0, 6);
  if (!departure_entities.length) return null;
  return {
    id,
    type: 'train',
    source: 'entities',
    departure_entities,
    name: String(module.name || '').slice(0, 60),
    layout: oneOf(module.layout, ['standard', 'compact'], 'standard'),
    board_style: oneOf(module.board_style, ['modern', 'led'], 'modern'),
    max_departures: numberInRange(module.max_departures, 1, 6, 3),
    ...defaultDisplayActions(),
  };
}

/** Entity ids from the AI's `entities` (strings or `{entity}` objects), `entity`, or a named list field. */
function collectEntityIds(module: SmartModule, hass: SmartSanitizeHass, ...keys: string[]): string[] {
  const seen = new Set<string>();
  for (const key of [...keys, 'entities', 'entity']) {
    const raw = module[key];
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const item of list) {
      const entityId = typeof item === 'string' ? item : String((item as SmartModule)?.entity || '');
      if (entityId && entityExists(hass, entityId)) seen.add(entityId);
    }
  }
  return Array.from(seen);
}

const CALENDAR_VIEWS = ['compact_list', 'month', 'week', 'day', 'table', 'grid'];
const CALENDAR_VIEW_ALIASES: Record<string, string> = { list: 'compact_list', agenda: 'compact_list', compact: 'compact_list' };

function sanitizeCalendarModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  let entityIds = collectEntityIds(module, hass, 'calendars').filter(entityId => entityId.startsWith('calendar.'));
  if (!entityIds.length) {
    entityIds = Object.keys(hass.states || {}).filter(entityId => entityId.startsWith('calendar.')).slice(0, 4);
  }
  if (!entityIds.length) return null;
  const requestedView = String(module.view_type || module.view || '');
  return {
    id,
    type: 'calendar',
    calendars: entityIds.map((entityId, index) => ({
      id: `${id}-calendar-${index}`,
      entity: entityId,
      name: entityName(hass, entityId),
      visible: true,
    })),
    view_type: oneOf(CALENDAR_VIEW_ALIASES[requestedView] || requestedView, CALENDAR_VIEWS, 'compact_list'),
    days_to_show: numberInRange(module.days_to_show, 1, 31, 7),
    ...defaultDisplayActions(),
  };
}

function sanitizeAreaSummaryModule(module: SmartModule, id: string): SmartModule | null {
  const areaId = String(module.area_id || module.area || '').trim();
  if (!areaId) return null;
  return {
    id,
    type: 'area_summary',
    area_id: areaId,
    ...defaultDisplayActions(),
  };
}

function sanitizeAlertCenterModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const includeEntities = collectEntityIds(module, hass, 'include_entities');
  return {
    id,
    type: 'alert_center',
    include_entities: includeEntities,
    max_alerts: numberInRange(module.max_alerts ?? module.max_items, 1, 30, Math.max(includeEntities.length, 6)),
    ...defaultDisplayActions(),
  };
}

const BATTERY_STYLE_ALIASES: Record<string, string> = { compact: 'list', minimal: 'strip', bars: 'bars', cards: 'cards', rings: 'rings', list: 'list', strip: 'strip' };

function sanitizeBatteryMonitorModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  let entityIds = collectEntityIds(module, hass);
  if (!entityIds.length) {
    entityIds = Object.keys(hass.states || {})
      .filter(entityId => {
        const state = (hass.states || {})[entityId] as { attributes?: Record<string, unknown> } | undefined;
        return state?.attributes?.device_class === 'battery' || /battery/.test(entityId);
      })
      .slice(0, 12);
  }
  const requestedStyle = String(module.style || module.style_preset || '');
  return {
    id,
    type: 'battery_monitor',
    // Manual entities when the AI/planner picked some; otherwise let the module discover them.
    discovery_mode: entityIds.length ? 'manual' : 'auto',
    entities: entityIds.map((entityId, index) => ({
      id: `${id}-battery-${index}`,
      entity: entityId,
      label: entityName(hass, entityId),
    })),
    style: BATTERY_STYLE_ALIASES[requestedStyle] || (entityIds.length > 6 ? 'list' : 'cards'),
    low_threshold: numberInRange(module.low_threshold, 1, 50, 20),
    ...defaultDisplayActions(),
  };
}

function sanitizeQrCodeModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const text = String(module.content_static || module.text || module.content || '').trim();
  const entityId = String(module.content_entity || module.entity || '');
  if (text) {
    return {
      id,
      type: 'qr_code',
      content_mode: 'static',
      content_static: text.slice(0, 500),
      ...defaultDisplayActions(),
    };
  }
  if (entityId && entityExists(hass, entityId)) {
    return {
      id,
      type: 'qr_code',
      content_mode: 'entity',
      content_entity: entityId,
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
    forecast_days: numberInRange(module.forecast_days ?? module.days, 1, 7, 5),
    ...defaultDisplayActions(),
  };
}

function sanitizeAnimatedClockModule(module: SmartModule, id: string): SmartModule | null {
  const requested = String(module.time_format || module.format || '').replace(/h$/i, '');
  return {
    id,
    type: 'animated_clock',
    time_format: oneOf(requested, ['12', '24'], '12'),
    show_seconds: module.show_seconds !== false,
    ...defaultDisplayActions(),
  };
}

const GRAPH_PERIODS = ['today', '1h', '3h', '6h', '12h', '24h', '2d', '7d', '30d', '90d', '365d'];
const GRAPH_CHART_TYPES = ['line', 'bar', 'area', 'scatter', 'bubble', 'pie', 'donut', 'radar', 'histogram', 'heatmap', 'waterfall', 'combo'];

function graphPeriodFromHours(hours: number): string {
  if (hours <= 1) return '1h';
  if (hours <= 3) return '3h';
  if (hours <= 6) return '6h';
  if (hours <= 12) return '12h';
  if (hours <= 24) return '24h';
  if (hours <= 48) return '2d';
  if (hours <= 168) return '7d';
  return '30d';
}

function sanitizeGraphsModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityIds = collectEntityIds(module, hass);
  if (!entityIds.length) return null;
  const requestedPeriod = String(module.time_period || '');
  const timePeriod = GRAPH_PERIODS.includes(requestedPeriod)
    ? requestedPeriod
    : graphPeriodFromHours(numberInRange(module.hours_to_show, 1, 720, 24));
  return {
    id,
    type: 'graphs',
    chart_type: oneOf(String(module.chart_type || '').replace('doughnut', 'donut'), GRAPH_CHART_TYPES, 'line'),
    entities: entityIds.slice(0, 6).map((entityId, index) => ({
      id: `${id}-graph-${index}`,
      entity: entityId,
      name: entityName(hass, entityId),
    })),
    time_period: timePeriod,
    ...defaultDisplayActions(),
  };
}

const ENERGY_NODE_TYPES = ['solar', 'grid', 'battery', 'home'];

/** Energy display needs typed nodes; accept `nodes`, `<type>_entity`, or guess from entity names. */
function sanitizeEnergyDisplayModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const nodes: SmartModule[] = [];
  const pushNode = (nodeType: string, entityId: unknown): void => {
    const value = String(entityId || '');
    if (!ENERGY_NODE_TYPES.includes(nodeType) || !entityExists(hass, value)) return;
    if (nodes.some(node => node.node_type === nodeType)) return;
    nodes.push({
      id: `${id}-node-${nodeType}`,
      node_type: nodeType,
      entity: value,
      label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
      enabled: true,
    });
  };
  if (Array.isArray(module.nodes)) {
    for (const node of module.nodes as SmartModule[]) pushNode(String(node?.node_type || ''), node?.entity);
  }
  for (const nodeType of ENERGY_NODE_TYPES) pushNode(nodeType, module[`${nodeType}_entity`]);
  for (const entityId of collectEntityIds(module, hass)) {
    const guess = ENERGY_NODE_TYPES.find(nodeType => entityId.toLowerCase().includes(nodeType));
    if (guess) pushNode(guess, entityId);
  }
  if (!nodes.length) return null;
  return { id, type: 'energy_display', nodes, ...defaultDisplayActions() };
}

function sanitizeSolarAnalyticsModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const pick = (key: string, needle: RegExp): string => {
    const explicit = String(module[key] || '');
    if (entityExists(hass, explicit)) return explicit;
    return collectEntityIds(module, hass).find(entityId => needle.test(entityId)) || '';
  };
  const solarEntity = pick('solar_entity', /solar|pv|inverter|production/i);
  if (!solarEntity) return null;
  return {
    id,
    type: 'solar_analytics',
    solar_entity: solarEntity,
    grid_entity: pick('grid_entity', /grid|import|export/i),
    battery_entity: pick('battery_entity', /battery/i),
    home_entity: pick('home_entity', /home|house|consumption|load/i),
    ...defaultDisplayActions(),
  };
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
  // Accept the module's own `markers` as well as the AI's `entities` / `entity`.
  const markerEntities = Array.isArray(module.markers)
    ? (module.markers as SmartModule[]).map(marker => marker?.entity).filter(Boolean)
    : [];
  let entityIds = collectEntityIds({ ...module, markers: markerEntities }, hass, 'markers');
  if (!entityIds.length) {
    entityIds = Object.keys(hass.states || {})
      .filter(entityId => entityId.startsWith('person.') || entityId.startsWith('device_tracker.'))
      .slice(0, 8);
  }
  if (!entityIds.length) return null;
  return {
    id,
    type: 'map',
    markers: entityIds.map((entityId, index) => ({
      id: `${id}-marker-${index}`,
      name: entityName(hass, entityId),
      type: 'entity',
      entity: entityId,
    })),
    zoom: numberInRange(module.zoom ?? module.default_zoom, 1, 20, 12),
    auto_zoom_entities: true,
    ...defaultDisplayActions(),
  };
}

function sanitizeAutoEntityListModule(module: SmartModule, id: string): SmartModule | null {
  const fromFilters =
    module.filters && typeof module.filters === 'object' ? (module.filters as SmartModule).domain : undefined;
  const requested = Array.isArray(module.include_domains)
    ? module.include_domains
    : fromFilters
      ? [fromFilters]
      : Array.isArray(module.domains)
        ? module.domains
        : [];
  const includeDomains = requested.map(domain => String(domain)).filter(domain => /^[a-z_]+$/.test(domain));
  return {
    id,
    type: 'auto_entity_list',
    include_domains: includeDomains.length ? includeDomains : ['light'],
    max_items: numberInRange(module.max_items, 1, 100, 12),
    ...defaultDisplayActions(),
  };
}

function sanitizeDynamicListModule(module: SmartModule, id: string): SmartModule | null {
  const template = String(module.dynamic_template || module.template || '').trim();
  if (!template) return null;
  return { id, type: 'dynamic-list', dynamic_template: template.slice(0, 4000), ...defaultDisplayActions() };
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

/**
 * Default builder that feeds the planner's entities through the type's own sanitizer, so the
 * emitted shape can never drift from what the module renders.
 */
function createSanitizedDefaultBuilder(
  type: string,
  sanitize: (module: SmartModule, hass: SmartSanitizeHass, id: string) => SmartModule | null,
  extras: Record<string, unknown> = {}
): (ctx: SmartBuildContext) => SmartModule | null {
  return ctx => {
    const entities = ctx.entities?.length ? ctx.entities : ctx.entity ? [ctx.entity] : [];
    const raw: SmartModule = {
      type,
      ...(entities[0] ? { entity: entities[0].entityId, name: entities[0].name } : {}),
      entities: entities.map(entity => entity.entityId),
      ...extras,
    };
    return sanitize(raw, ctx.hass, ctx.id);
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
    defaultBuilder: createSanitizedDefaultBuilder('spinbox', sanitizeSpinboxModule),
  },
  slider_control: {
    sanitize: wrapSanitize(sanitizeSliderControlModule),
    defaultBuilder: createSanitizedDefaultBuilder('slider_control', sanitizeSliderControlModule),
  },
  dropdown: {
    sanitize: wrapSanitize(sanitizeDropdownModule),
    defaultBuilder: createSanitizedDefaultBuilder('dropdown', sanitizeDropdownModule),
  },
  toggle: {
    sanitize: wrapSanitize(sanitizeToggleModule),
    defaultBuilder: createSanitizedDefaultBuilder('toggle', sanitizeToggleModule),
  },
  timer: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeTimerModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => sanitizeTimerModule({ type: 'timer' }, ctx.id),
  },
  people: {
    sanitize: wrapSanitize(sanitizePeopleModule),
    defaultBuilder: createSanitizedDefaultBuilder('people', sanitizePeopleModule),
  },
  calendar: {
    sanitize: wrapSanitize(sanitizeCalendarModule),
    defaultBuilder: createSanitizedDefaultBuilder('calendar', sanitizeCalendarModule, { days_to_show: 7 }),
  },
  area_summary: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeAreaSummaryModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => {
      // Resolve the area from the registry when the prompt names one; otherwise the first area.
      const areas = (ctx.hass as { areas?: Record<string, { area_id?: string; name?: string }> }).areas || {};
      const prompt = ctx.prompt.toLowerCase();
      const match =
        Object.values(areas).find(area => area?.name && prompt.includes(String(area.name).toLowerCase())) ||
        Object.values(areas)[0];
      const areaId = match?.area_id || Object.keys(areas)[0] || '';
      return areaId ? sanitizeAreaSummaryModule({ type: 'area_summary', area_id: areaId }, ctx.id) : null;
    },
  },
  alert_center: {
    sanitize: wrapSanitize(sanitizeAlertCenterModule),
    defaultBuilder: createSanitizedDefaultBuilder('alert_center', sanitizeAlertCenterModule),
  },
  battery_monitor: {
    sanitize: wrapSanitize(sanitizeBatteryMonitorModule),
    defaultBuilder: createSanitizedDefaultBuilder('battery_monitor', sanitizeBatteryMonitorModule, {
      low_threshold: 20,
    }),
  },
  qr_code: {
    sanitize: wrapSanitize(sanitizeQrCodeModule),
    defaultBuilder: (ctx: SmartBuildContext) =>
      sanitizeQrCodeModule(
        ctx.entity ? { type: 'qr_code', content_entity: ctx.entity.entityId } : { type: 'qr_code', content_static: 'https://www.home-assistant.io' },
        ctx.hass,
        ctx.id
      ),
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
        ? sanitizeAnimatedForecastModule({ type: 'animated_forecast', weather_entity: ctx.entity.entityId }, ctx.hass, ctx.id)
        : null,
  },
  animated_clock: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeAnimatedClockModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => sanitizeAnimatedClockModule({ type: 'animated_clock' }, ctx.id),
  },
  graphs: {
    sanitize: wrapSanitize(sanitizeGraphsModule),
    defaultBuilder: createSanitizedDefaultBuilder('graphs', sanitizeGraphsModule, { time_period: '24h' }),
  },
  energy_display: {
    sanitize: wrapSanitize(sanitizeEnergyDisplayModule),
    defaultBuilder: createSanitizedDefaultBuilder('energy_display', sanitizeEnergyDisplayModule),
  },
  solar_analytics: {
    sanitize: wrapSanitize(sanitizeSolarAnalyticsModule),
    defaultBuilder: createSanitizedDefaultBuilder('solar_analytics', sanitizeSolarAnalyticsModule),
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
    defaultBuilder: createSanitizedDefaultBuilder('map', sanitizeMapModule, { zoom: 12 }),
  },
  auto_entity_list: {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeAutoEntityListModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) => {
      const domains = Array.from(new Set((ctx.entities || []).map(entity => entity.domain)));
      return sanitizeAutoEntityListModule(
        { type: 'auto_entity_list', include_domains: domains.length ? domains : [ctx.entity?.domain || 'light'] },
        ctx.id
      );
    },
  },
  'dynamic-list': {
    sanitize: wrapSanitize((module, _hass, id) => sanitizeDynamicListModule(module, id)),
    defaultBuilder: (ctx: SmartBuildContext) =>
      sanitizeDynamicListModule(
        { type: 'dynamic-list', dynamic_template: '{{ states.light | map(attribute="entity_id") | list }}' },
        ctx.id
      ),
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
  boiler: {
    sanitize: wrapSanitize((module, hass, id) =>
      sanitizeEntityModule('boiler', ['water_heater', 'climate', 'sensor'], module, hass, id)
    ),
    defaultBuilder: createEntityDefaultBuilder('boiler'),
  },
  train: {
    sanitize: wrapSanitize(sanitizeTrainModule),
    defaultBuilder: (ctx: SmartBuildContext): SmartModule | null => {
      const entities = ctx.entities?.length ? ctx.entities : ctx.entity ? [ctx.entity] : [];
      const sensors = entities.filter(entity => entity.entityId.startsWith('sensor.')).slice(0, 6);
      if (!sensors.length) return null;
      return {
        id: ctx.id,
        type: 'train',
        source: 'entities',
        departure_entities: sensors.map(entity => entity.entityId),
        name: '',
        layout: 'standard',
        board_style: 'modern',
        max_departures: 3,
        ...defaultDisplayActions(),
      };
    },
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
