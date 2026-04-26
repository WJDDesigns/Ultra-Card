/**
 * Home Assistant area discovery — joins area, device, and entity registries
 * to resolve entities assigned to an area (device area + entity-level area overrides).
 */

import { HomeAssistant } from 'custom-card-helpers';
import type {
  AreaSummaryDiscoveryToggles,
  AreaSummaryModule,
} from '../types';

export type RoomEntityRole =
  | 'lights'
  | 'climate'
  | 'temperature'
  | 'humidity'
  | 'motion'
  | 'doors_windows'
  | 'media'
  | 'presence'
  | 'covers'
  | 'fans'
  | 'locks'
  | 'switches'
  | 'other';

export interface RoomQuickEntity {
  entity_id: string;
  role: RoomEntityRole;
  /** Lower sorts earlier */
  sort_bucket: number;
  active: boolean;
  icon: string;
}

export interface RoomSummaryModel {
  area_id: string;
  area_name: string;
  climate_entity_id?: string;
  temperature_entity_id?: string;
  humidity_entity_id?: string;
  temperature_label?: string;
  humidity_label?: string;
  lights_on: number;
  lights_total: number;
  quick_entities: RoomQuickEntity[];
  /** Default entity for tile tap → more-info */
  primary_entity_id?: string;
}

interface AreaRegistryRow {
  area_id: string;
  name: string;
}

interface DeviceRegistryRow {
  id: string;
  area_id?: string | null;
}

interface EntityRegistryRow {
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
  disabled_by?: string | null;
  hidden_by?: string | null;
}

const DEFAULT_TOGGLES: Required<AreaSummaryDiscoveryToggles> = {
  lights: true,
  climate: true,
  temperature: true,
  humidity: true,
  motion: true,
  doors_windows: true,
  media: true,
  presence: true,
  covers: true,
  fans: true,
  locks: true,
  switches: true,
};

function togglesEffective(t?: AreaSummaryDiscoveryToggles): Required<AreaSummaryDiscoveryToggles> {
  return { ...DEFAULT_TOGGLES, ...t };
}

function domainOf(entityId: string): string {
  return entityId.includes('.') ? entityId.split('.')[0] : '';
}

function inferRole(entityId: string, hass: HomeAssistant): RoomEntityRole {
  const st = hass.states[entityId];
  const attrs = (st?.attributes || {}) as Record<string, unknown>;
  const deviceClass = String(attrs.device_class || '');
  const domain = domainOf(entityId);

  if (domain === 'light') return 'lights';
  if (domain === 'climate') return 'climate';
  if (domain === 'media_player') return 'media';
  if (domain === 'cover') return 'covers';
  if (domain === 'fan') return 'fans';
  if (domain === 'lock') return 'locks';
  if (domain === 'switch') return 'switches';
  if (domain === 'person') return 'presence';

  if (domain === 'binary_sensor') {
    if (deviceClass === 'motion' || deviceClass === 'occupancy') return 'motion';
    if (deviceClass === 'presence') return 'presence';
    if (
      deviceClass === 'door' ||
      deviceClass === 'window' ||
      deviceClass === 'garage_door' ||
      deviceClass === 'opening'
    ) {
      return 'doors_windows';
    }
  }

  if (domain === 'sensor') {
    if (deviceClass === 'temperature') return 'temperature';
    if (deviceClass === 'humidity') return 'humidity';
  }

  return 'other';
}

function mdiForRole(role: RoomEntityRole, entityId: string, hass: HomeAssistant): string {
  const st = hass.states[entityId];
  const attrs = (st?.attributes || {}) as Record<string, unknown>;
  const icon = typeof attrs.icon === 'string' ? attrs.icon : '';
  if (icon) return icon;

  switch (role) {
    case 'lights':
      return 'mdi:lightbulb';
    case 'climate':
      return 'mdi:thermostat';
    case 'temperature':
      return 'mdi:thermometer';
    case 'humidity':
      return 'mdi:water-percent';
    case 'motion':
      return 'mdi:motion-sensor';
    case 'doors_windows':
      return 'mdi:door-sliding';
    case 'media':
      return 'mdi:cast-audio';
    case 'presence':
      return 'mdi:account';
    case 'covers':
      return 'mdi:window-shutter';
    case 'fans':
      return 'mdi:fan';
    case 'locks':
      return 'mdi:lock';
    case 'switches':
      return 'mdi:flash';
    default:
      return 'mdi:help-circle-outline';
  }
}

function isActive(entityId: string, role: RoomEntityRole, hass: HomeAssistant): boolean {
  const st = hass.states[entityId];
  if (!st) return false;
  const s = String(st.state).toLowerCase();
  if (s === 'unavailable' || s === 'unknown') return false;

  switch (role) {
    case 'lights':
    case 'switches':
    case 'fans':
      return s === 'on' || s === 'open';
    case 'climate':
      return s !== 'off' && s !== 'idle';
    case 'media':
      return s === 'playing' || s === 'paused' || s === 'on';
    case 'motion':
    case 'doors_windows':
      return s === 'on';
    case 'locks':
      return s === 'unlocked' || s === 'open';
    case 'covers':
      return s === 'open' || s === 'opening';
    case 'presence':
      return s === 'home' || s === 'on';
    default:
      return s !== 'off' && s !== 'closed' && s !== 'locked';
  }
}

function sortBucket(role: RoomEntityRole, active: boolean): number {
  if (!active) return 80;
  if (role === 'doors_windows') return 0;
  if (role === 'locks') return 1;
  if (role === 'motion') return 2;
  if (role === 'lights') return 3;
  if (role === 'media') return 4;
  if (role === 'climate') return 5;
  if (role === 'fans') return 6;
  if (role === 'covers') return 7;
  if (role === 'switches') return 8;
  return 50;
}

class UcAreaDiscoveryService {
  private registryCache:
    | {
        at: number;
        areas: AreaRegistryRow[];
        devices: DeviceRegistryRow[];
        entities: EntityRegistryRow[];
      }
    | null = null;

  private readonly registryTtlMs = 45_000;

  private async loadRegistries(hass: HomeAssistant): Promise<{
    areas: AreaRegistryRow[];
    devices: DeviceRegistryRow[];
    entities: EntityRegistryRow[];
  }> {
    const now = Date.now();
    if (this.registryCache && now - this.registryCache.at < this.registryTtlMs) {
      return {
        areas: this.registryCache.areas,
        devices: this.registryCache.devices,
        entities: this.registryCache.entities,
      };
    }

    const ws = (msg: Record<string, unknown>) => hass.callWS(msg as never);
    const [areas, devices, entities] = await Promise.all([
      ws({ type: 'config/area_registry/list' }) as Promise<AreaRegistryRow[]>,
      ws({ type: 'config/device_registry/list' }) as Promise<DeviceRegistryRow[]>,
      ws({ type: 'config/entity_registry/list' }) as Promise<EntityRegistryRow[]>,
    ]);

    this.registryCache = { at: now, areas, devices, entities };
    return { areas, devices, entities };
  }

  /** Invalidate in-memory registry cache (e.g. after area rename in HA). */
  invalidateRegistryCache(): void {
    this.registryCache = null;
  }

  async listAreas(hass: HomeAssistant): Promise<{ area_id: string; name: string }[]> {
    const { areas } = await this.loadRegistries(hass);
    return areas
      .map(a => ({ area_id: a.area_id, name: a.name || a.area_id }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }

  /**
   * Returns entity IDs belonging to an area, filtered to those present in hass.states.
   */
  async listEntityIdsInArea(hass: HomeAssistant, areaId: string): Promise<string[]> {
    if (!areaId?.trim()) return [];
    const { devices, entities } = await this.loadRegistries(hass);

    const deviceIdsInArea = new Set<string>();
    for (const d of devices) {
      if (d.area_id === areaId) deviceIdsInArea.add(d.id);
    }

    const out: string[] = [];
    for (const e of entities) {
      if (e.disabled_by) continue;
      if (e.hidden_by) continue;

      const viaDevice = e.device_id && deviceIdsInArea.has(e.device_id);
      const viaEntityArea = e.area_id === areaId;
      if (!viaDevice && !viaEntityArea) continue;

      if (!hass.states[e.entity_id]) continue;
      out.push(e.entity_id);
    }
    return out;
  }

  async resolveRoom(hass: HomeAssistant, module: AreaSummaryModule): Promise<RoomSummaryModel> {
    const areaId = (module.area_id || '').trim();
    const toggles = togglesEffective(module.discovery);
    const hidden = new Set((module.hidden_entities || []).map(x => x.trim()).filter(Boolean));
    const pinned = (module.pinned_entities || []).map(x => x.trim()).filter(Boolean);

    if (!areaId) {
      return {
        area_id: '',
        area_name: '',
        lights_on: 0,
        lights_total: 0,
        quick_entities: [],
      };
    }

    const { areas } = await this.loadRegistries(hass);
    const areaName = areas.find(a => a.area_id === areaId)?.name || areaId;

    const areaEntityIds = await this.listEntityIdsInArea(hass, areaId);

    const pinnedSet = new Set(pinned);
    const roles: { entity_id: string; role: RoomEntityRole }[] = [];
    for (const id of areaEntityIds) {
      if (hidden.has(id)) continue;
      const role = inferRole(id, hass);
      const isPinned = pinnedSet.has(id);

      // Pinned entities are always allowed (unless hidden), even if their role is "other"
      // or their discovery toggle is disabled.
      if (!isPinned) {
        if (role === 'other') continue;
        if (toggles[role as keyof AreaSummaryDiscoveryToggles] === false) continue;
      }

      roles.push({ entity_id: id, role });
    }

    let climate_entity_id: string | undefined;
    for (const r of roles) {
      if (r.role === 'climate') {
        climate_entity_id = r.entity_id;
        break;
      }
    }

    let temperature_entity_id: string | undefined;
    for (const r of roles) {
      if (r.role === 'temperature') {
        temperature_entity_id = r.entity_id;
        break;
      }
    }

    let humidity_entity_id: string | undefined;
    for (const r of roles) {
      if (r.role === 'humidity') {
        humidity_entity_id = r.entity_id;
        break;
      }
    }

    const climateState = climate_entity_id ? hass.states[climate_entity_id] : undefined;
    const cAttr = (climateState?.attributes || {}) as Record<string, unknown>;

    let temperature_label: string | undefined;
    if (climateState && typeof cAttr.current_temperature === 'number') {
      temperature_label = `${cAttr.current_temperature}°`;
    } else if (temperature_entity_id && hass.states[temperature_entity_id]) {
      temperature_label = String(hass.states[temperature_entity_id].state);
      const tAttrs = (hass.states[temperature_entity_id].attributes || {}) as Record<string, unknown>;
      const unit = tAttrs.unit_of_measurement;
      if (unit && !temperature_label.includes(String(unit))) {
        temperature_label = `${temperature_label} ${unit}`;
      }
    }

    let humidity_label: string | undefined;
    if (climateState && typeof cAttr.current_humidity === 'number') {
      humidity_label = `${cAttr.current_humidity}%`;
    } else if (humidity_entity_id && hass.states[humidity_entity_id]) {
      humidity_label = String(hass.states[humidity_entity_id].state);
      const hAttrs = (hass.states[humidity_entity_id].attributes || {}) as Record<string, unknown>;
      const unit = hAttrs.unit_of_measurement;
      if (unit && !humidity_label.includes(String(unit))) {
        humidity_label = `${humidity_label} ${unit}`;
      }
    }

    let lights_on = 0;
    let lights_total = 0;
    for (const r of roles) {
      if (r.role !== 'lights') continue;
      lights_total += 1;
      if (isActive(r.entity_id, 'lights', hass)) lights_on += 1;
    }

    const quickById = new Map<string, RoomQuickEntity>();
    for (const r of roles) {
      const active = isActive(r.entity_id, r.role, hass);
      quickById.set(r.entity_id, {
        entity_id: r.entity_id,
        role: r.role,
        sort_bucket: sortBucket(r.role, active),
        active,
        icon: mdiForRole(r.role, r.entity_id, hass),
      });
    }

    // Ensure pinned entities always appear in quick actions (unless hidden),
    // even if they are outside the area registry join or filtered by discovery roles.
    for (const id of pinned) {
      if (hidden.has(id)) continue;
      if (quickById.has(id)) continue;
      if (!hass.states[id]) continue;
      const role = inferRole(id, hass);
      const active = isActive(id, role, hass);
      quickById.set(id, {
        entity_id: id,
        role,
        sort_bucket: sortBucket(role, active),
        active,
        icon: mdiForRole(role, id, hass),
      });
    }

    const quick: RoomQuickEntity[] = [...quickById.values()];

    const pinIndex = new Map<string, number>();
    pinned.forEach((id, i) => pinIndex.set(id, i));

    quick.sort((a, b) => {
      const pa = pinIndex.get(a.entity_id) ?? 999;
      const pb = pinIndex.get(b.entity_id) ?? 999;
      if (pa !== pb) return pa - pb;
      if (a.sort_bucket !== b.sort_bucket) return a.sort_bucket - b.sort_bucket;
      if (a.active !== b.active) return a.active ? -1 : 1;
      return a.entity_id.localeCompare(b.entity_id);
    });

    const max = Math.max(1, Math.min(12, module.max_quick_actions ?? 6));
    const quick_entities = quick.slice(0, max);

    const primary_entity_id =
      climate_entity_id ||
      temperature_entity_id ||
      quick_entities.find(q => q.role === 'lights')?.entity_id ||
      quick_entities[0]?.entity_id;

    return {
      area_id: areaId,
      area_name: areaName,
      climate_entity_id,
      temperature_entity_id,
      humidity_entity_id,
      temperature_label,
      humidity_label,
      lights_on,
      lights_total,
      quick_entities,
      primary_entity_id,
    };
  }
}

export const ucAreaDiscoveryService = new UcAreaDiscoveryService();
