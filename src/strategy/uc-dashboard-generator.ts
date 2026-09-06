import type { HomeAssistant } from 'custom-card-helpers';
import type {
  AlertCenterModule,
  AreaSummaryModule,
  AutoEntityListModule,
  BatteryMonitorModule,
  CameraModule,
  CardModule,
  ClockModule,
  CoverModule,
  FanModule,
  HorizontalModule,
  LockModule,
  MediaPlayerModule,
  PeopleModule,
  UltraCardConfig,
  UpdateMonitorModule,
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

interface CardOptions {
  name: string;
  transparent?: boolean | undefined;
  columns?: number | 'full' | undefined;
}

/** Wrap modules in a single-column Ultra Card carrying the style chrome. */
function card(ctx: Ctx, modules: CardModule[], opts: CardOptions): LovelaceCardRawConfig {
  const rowId = ctx.ids.next('row');
  const config: UltraCardConfig & LovelaceCardRawConfig = {
    type: 'custom:ultra-card',
    _config_version: 2,
    card_name: opts.name,
    ...(opts.transparent ? { card_transparent: true, card_padding: 0 } : ctx.style.card),
    layout: {
      rows: [{ id: rowId, columns: [{ id: `${rowId}-col`, modules }] }],
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

function heading(text: string, icon?: string): LovelaceCardRawConfig {
  return { type: 'heading', heading: text, heading_style: 'title', ...(icon ? { icon } : {}) };
}

const domainOf = (id: string): string => id.split('.')[0] ?? '';

const friendlyName = (hass: HomeAssistant, id: string): string =>
  String(hass.states[id]?.attributes?.friendly_name ?? id);

function slugForPath(id: string): string {
  return (
    id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'area'
  );
}

/* ------------------------------------------------------------------ */
/* Entity classification                                                */
/* ------------------------------------------------------------------ */

export type AreaGroups = Record<RoomEntityRole, string[]> & { cameras: string[] };

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
  };
  for (const id of entityIds) {
    if (domainOf(id) === 'camera') {
      g.cameras.push(id);
      continue;
    }
    g[inferRole(id, hass)].push(id);
  }
  const byName = (a: string, b: string) =>
    friendlyName(hass, a).localeCompare(friendlyName(hass, b), undefined, { sensitivity: 'base' });
  for (const key of Object.keys(g) as (keyof AreaGroups)[]) g[key].sort(byName);
  return g;
}

/** Domains that land in the "More" list when they have no dedicated block. */
const MORE_DOMAINS = [
  'sensor',
  'scene',
  'script',
  'vacuum',
  'humidifier',
  'water_heater',
  'valve',
  'siren',
  'remote',
  'button',
  'number',
  'select',
  'input_boolean',
  'input_number',
  'input_select',
  'lawn_mower',
];

/* ------------------------------------------------------------------ */
/* Area content                                                         */
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
  const live = candidates.filter(id => Number.isFinite(parseFloat(hass.states[id]?.state ?? '')));
  if (!live.length) return undefined;
  return live.find(id => !NOT_A_ROOM_SENSOR.test(friendlyName(hass, id))) ?? live[0];
}

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
  const tile = mod<AreaSummaryModule>(ctx, 'area_summary', {
    area_id: area.area_id,
    title: area.name,
    style_preset: ctx.style.areaSummaryPreset,
    ...(temperature ? { temperature_entity: temperature } : {}),
    ...(humidity ? { humidity_entity: humidity } : {}),
    ...(area.icon ? { room_icon: area.icon } : {}),
    ...(ctx.style.accent ? { accent_color: ctx.style.accent } : {}),
    ...(opts.maxQuickActions ? { max_quick_actions: opts.maxQuickActions } : {}),
    ...(opts.navigateTo
      ? { tap_action: { action: 'navigate', navigation_path: opts.navigateTo } }
      : {}),
  });
  return card(ctx, [tile], { name: area.name });
}

function entityList(
  ctx: Ctx,
  area: AreaInfo,
  title: string,
  showTitle: boolean,
  filter: Partial<AutoEntityListModule>
): AutoEntityListModule {
  return mod<AutoEntityListModule>(ctx, 'auto_entity_list', {
    include_areas: [area.area_id],
    row_style: ctx.style.listRowStyle,
    title,
    show_title: showTitle,
    max_items: 20,
    ...filter,
  });
}

interface AreaBlock {
  title: string;
  icon: string;
  modules: CardModule[];
  /** Blocks that want their own card each (cameras). */
  splitCards?: boolean | undefined;
}

/**
 * The content blocks for one area, in display order. `showTitles` puts the
 * block title on the module itself (floor mode) instead of a heading card.
 */
function areaBlocks(ctx: Ctx, area: AreaInfo, showTitles: boolean): AreaBlock[] {
  const { hass } = ctx;
  const ids = ctx.registry.entitiesByArea.get(area.area_id) ?? [];
  const g = classifyAreaEntities(hass, ids);
  const blocks: AreaBlock[] = [];

  if (g.lights.length) {
    blocks.push({
      title: 'Lights',
      icon: 'mdi:lightbulb-group',
      modules: [entityList(ctx, area, 'Lights', showTitles, { include_domains: ['light'] })],
    });
  }

  if (g.climate.length || g.temperature.length || g.humidity.length) {
    const modules: CardModule[] = [];
    if (g.climate.length) {
      modules.push(entityList(ctx, area, 'Climate', showTitles, { include_domains: ['climate'] }));
    }
    if (g.temperature.length || g.humidity.length) {
      modules.push(
        entityList(ctx, area, g.climate.length ? 'Sensors' : 'Climate', showTitles, {
          include_domains: ['sensor'],
          include_device_classes: ['temperature', 'humidity'],
        })
      );
    }
    blocks.push({ title: 'Climate', icon: 'mdi:thermostat', modules });
  }

  if (g.media.length) {
    blocks.push({
      title: 'Media',
      icon: 'mdi:speaker',
      modules: g.media
        .slice(0, 4)
        .map(entity => mod<MediaPlayerModule>(ctx, 'media_player', { entity, layout: 'compact' })),
    });
  }

  if (g.covers.length) {
    blocks.push({
      title: 'Covers',
      icon: 'mdi:window-shutter',
      modules: g.covers
        .slice(0, 6)
        .map(entity => mod<CoverModule>(ctx, 'cover', { entity, layout: 'compact' })),
    });
  }

  if (g.fans.length) {
    blocks.push({
      title: 'Fans',
      icon: 'mdi:fan',
      modules: g.fans
        .slice(0, 6)
        .map(entity => mod<FanModule>(ctx, 'fan', { entity, layout: 'compact' })),
    });
  }

  if (g.locks.length) {
    blocks.push({
      title: 'Locks',
      icon: 'mdi:lock',
      modules: g.locks
        .slice(0, 6)
        .map(entity => mod<LockModule>(ctx, 'lock', { entity, layout: 'compact' })),
    });
  }

  if (g.cameras.length) {
    blocks.push({
      title: 'Cameras',
      icon: 'mdi:cctv',
      splitCards: true,
      modules: g.cameras
        .slice(0, 4)
        .map(entity => mod<CameraModule>(ctx, 'camera', { entity, show_name: true })),
    });
  }

  if (g.motion.length || g.doors_windows.length || g.presence.length) {
    blocks.push({
      title: 'Security',
      icon: 'mdi:shield-home',
      modules: [
        entityList(ctx, area, 'Security', showTitles, {
          include_domains: ['binary_sensor'],
          include_device_classes: [
            'door',
            'window',
            'garage_door',
            'opening',
            'motion',
            'occupancy',
            'presence',
          ],
        }),
      ],
    });
  }

  if (g.switches.length) {
    blocks.push({
      title: 'Switches',
      icon: 'mdi:toggle-switch',
      modules: [entityList(ctx, area, 'Switches', showTitles, { include_domains: ['switch'] })],
    });
  }

  const more = g.other.filter(id => MORE_DOMAINS.includes(domainOf(id)));
  if (more.length) {
    blocks.push({
      title: 'More',
      icon: 'mdi:dots-horizontal-circle-outline',
      modules: [
        entityList(ctx, area, 'More', showTitles, {
          include_domains: MORE_DOMAINS,
          // Temperature/humidity already live in the Climate block.
          hidden_entities: [...g.temperature, ...g.humidity],
          max_items: 12,
        }),
      ],
    });
  }

  return blocks;
}

/** Sections for a dedicated area view: room tile, then one section per block. */
export function buildAreaViewSections(ctx: Ctx, area: AreaInfo): LovelaceSectionRawConfig[] {
  const sections: LovelaceSectionRawConfig[] = [{ type: 'grid', cards: [areaTile(ctx, area)] }];
  for (const block of areaBlocks(ctx, area, false)) {
    const cards: LovelaceCardRawConfig[] = [heading(block.title, block.icon)];
    if (block.splitCards) {
      for (const m of block.modules) {
        cards.push(
          card(ctx, [m], {
            name: `${area.name} · ${friendlyName(ctx.hass, String((m as { entity?: string }).entity ?? block.title))}`,
          })
        );
      }
    } else {
      cards.push(card(ctx, block.modules, { name: `${area.name} · ${block.title}` }));
    }
    sections.push({ type: 'grid', cards });
  }
  return sections;
}

/** One compact section per area for a floor view: heading, tile, then the blocks. */
function buildFloorAreaSection(ctx: Ctx, area: AreaInfo): LovelaceSectionRawConfig {
  const cards: LovelaceCardRawConfig[] = [heading(area.name, area.icon), areaTile(ctx, area)];
  for (const block of areaBlocks(ctx, area, true)) {
    if (block.splitCards) {
      for (const m of block.modules)
        cards.push(card(ctx, [m], { name: `${area.name} · ${block.title}` }));
    } else {
      cards.push(card(ctx, block.modules, { name: `${area.name} · ${block.title}` }));
    }
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
    // An area with nothing in it would be an empty page.
    return (registry.entitiesByArea.get(a.area_id)?.length ?? 0) > 0;
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
