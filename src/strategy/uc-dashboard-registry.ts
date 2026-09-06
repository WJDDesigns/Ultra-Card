import type { HomeAssistant } from 'custom-card-helpers';

/**
 * Registry snapshot the dashboard generator works from: areas, floors and the
 * entity ids that belong to each area (directly or through their device).
 *
 * The frontend exposes the registries synchronously on `hass` (`areas`,
 * `floors`, `devices`, `entities`); a strategy runs with that same `hass`, so
 * that is the fast path. Older cores, and the unit tests, fall back to the
 * websocket list commands the area discovery service already uses.
 */

export interface AreaInfo {
  area_id: string;
  name: string;
  icon?: string | undefined;
  floor_id?: string | undefined;
}

export interface FloorInfo {
  floor_id: string;
  name: string;
  icon?: string | undefined;
  level?: number | undefined;
}

export interface DashboardRegistry {
  areas: AreaInfo[];
  floors: FloorInfo[];
  /** area_id -> entity ids present in `hass.states`, config/diagnostic entities excluded */
  entitiesByArea: Map<string, string[]>;
}

interface AreaRow {
  area_id: string;
  name?: string | null | undefined;
  icon?: string | null | undefined;
  floor_id?: string | null | undefined;
}
interface FloorRow {
  floor_id: string;
  name?: string | null | undefined;
  icon?: string | null | undefined;
  level?: number | null | undefined;
}
interface DeviceRow {
  id: string;
  area_id?: string | null | undefined;
}
interface EntityRow {
  entity_id: string;
  device_id?: string | null | undefined;
  area_id?: string | null | undefined;
  entity_category?: string | null | undefined;
  disabled_by?: string | null | undefined;
  hidden_by?: string | null | undefined;
  hidden?: boolean | undefined;
}

type RegistryHass = HomeAssistant & {
  areas?: Record<string, AreaRow> | undefined;
  floors?: Record<string, FloorRow> | undefined;
  devices?: Record<string, DeviceRow> | undefined;
  entities?: Record<string, EntityRow> | undefined;
};

async function loadRows(hass: RegistryHass): Promise<{
  areas: AreaRow[];
  floors: FloorRow[];
  devices: DeviceRow[];
  entities: EntityRow[];
}> {
  if (hass.areas && hass.devices && hass.entities) {
    return {
      areas: Object.values(hass.areas),
      floors: hass.floors ? Object.values(hass.floors) : [],
      devices: Object.values(hass.devices),
      entities: Object.values(hass.entities),
    };
  }
  const ws = <T>(type: string): Promise<T> => hass.callWS({ type } as never) as Promise<T>;
  const [areas, devices, entities, floors] = await Promise.all([
    ws<AreaRow[]>('config/area_registry/list'),
    ws<DeviceRow[]>('config/device_registry/list'),
    ws<EntityRow[]>('config/entity_registry/list'),
    // Floors arrived in 2024.4; treat a failure as "no floors".
    ws<FloorRow[]>('config/floor_registry/list').catch(() => [] as FloorRow[]),
  ]);
  return { areas, floors, devices, entities };
}

const byName = <T extends { name: string }>(a: T, b: T): number =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

export async function loadDashboardRegistry(hass: HomeAssistant): Promise<DashboardRegistry> {
  const rows = await loadRows(hass as RegistryHass);

  const areas: AreaInfo[] = rows.areas
    .map(a => ({
      area_id: a.area_id,
      name: a.name || a.area_id,
      icon: a.icon || undefined,
      floor_id: a.floor_id || undefined,
    }))
    .sort(byName);

  const floors: FloorInfo[] = rows.floors
    .map(f => ({
      floor_id: f.floor_id,
      name: f.name || f.floor_id,
      icon: f.icon || undefined,
      level: typeof f.level === 'number' ? f.level : undefined,
    }))
    // Top floor first reads like a house; unknown levels go last by name.
    .sort((a, b) =>
      a.level === b.level
        ? byName(a, b)
        : (b.level ?? Number.NEGATIVE_INFINITY) - (a.level ?? Number.NEGATIVE_INFINITY)
    );

  const deviceArea = new Map<string, string>();
  for (const d of rows.devices) {
    if (d.area_id) deviceArea.set(d.id, d.area_id);
  }

  const entitiesByArea = new Map<string, string[]>();
  for (const a of areas) entitiesByArea.set(a.area_id, []);
  for (const e of rows.entities) {
    if (e.disabled_by || e.hidden_by || e.hidden) continue;
    // Config/diagnostic entities (signal strength, restart buttons, ...) are
    // noise on a room page.
    if (e.entity_category) continue;
    if (!hass.states?.[e.entity_id]) continue;
    const areaId = e.area_id || (e.device_id ? deviceArea.get(e.device_id) : undefined);
    if (!areaId) continue;
    const list = entitiesByArea.get(areaId);
    if (list) list.push(e.entity_id);
  }

  return { areas, floors, entitiesByArea };
}
