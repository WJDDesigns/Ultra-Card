/**
 * UniFi Network discovery + telemetry.
 *
 * Reads the official Home Assistant UniFi integration
 * (https://www.home-assistant.io/integrations/unifi/) via the state machine
 * and entity/device registries. Never talks to the UniFi controller directly.
 *
 * Sync path (render): memoized scan of hass.states + hass.entities + hass.devices.
 * Async path (wizard): TTL-cached config/entity_registry/list +
 * config/device_registry/list so disabled entities are visible too.
 *
 * Port identity comes from unique_id prefixes:
 *   port_rx-<mac>_<idx>, port_tx-, port_link_speed-, poe_power-,
 *   poe-, port-, power_cycle-, outlet-
 */

import { HomeAssistant } from 'custom-card-helpers';
import { UcStatesMemo, statesMemoKey } from '../utils/uc-states-memo';
import { ucUnifiDeviceDb } from './uc-unifi-device-db';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type UnifiDeviceKind = 'gateway' | 'switch' | 'ap' | 'pdu' | 'plug' | 'other';

export type UnifiPortRole =
  | 'rx'
  | 'tx'
  | 'link_speed'
  | 'poe_power'
  | 'poe_switch'
  | 'port_enable'
  | 'power_cycle'
  | 'outlet_power'
  | 'outlet_switch';

export interface UnifiPort {
  /** 1-based port index parsed from unique_id. */
  index: number;
  name: string;
  /** Link speed in Mbps when known. */
  linkSpeedMbps: number | null;
  /** RX rate in the entity's native unit (often B/s or MB/s). */
  rx: number | null;
  tx: number | null;
  rxEntityId?: string | undefined;
  txEntityId?: string | undefined;
  linkSpeedEntityId?: string | undefined;
  poePowerW: number | null;
  poePowerEntityId?: string | undefined;
  poeOn: boolean | null;
  poeSwitchEntityId?: string | undefined;
  enabled: boolean | null;
  portEnableEntityId?: string | undefined;
  powerCycleEntityId?: string | undefined;
  /** True when the port has a positive link speed or measurable traffic. */
  up: boolean;
}

export interface UnifiOutlet {
  index: number;
  name: string;
  powerW: number | null;
  powerEntityId?: string | undefined;
  on: boolean | null;
  switchEntityId?: string | undefined;
}

export interface UnifiDevice {
  deviceId: string;
  mac: string;
  name: string;
  model: string;
  manufacturer: string;
  swVersion?: string | undefined;
  kind: UnifiDeviceKind;
  /** Rack units estimated from model / port count. */
  heightU: number;
  state?: string | undefined;
  stateEntityId?: string | undefined;
  cpuPct: number | null;
  cpuEntityId?: string | undefined;
  memoryPct: number | null;
  memoryEntityId?: string | undefined;
  temperatureC: number | null;
  temperatureEntityId?: string | undefined;
  uptimeEntityId?: string | undefined;
  clients: number | null;
  clientsEntityId?: string | undefined;
  uplinkMac?: string | undefined;
  uplinkMacEntityId?: string | undefined;
  /** Device id of the uplink peer when resolved. */
  uplinkDeviceId?: string | undefined;
  ledEntityId?: string | undefined;
  restartEntityId?: string | undefined;
  updateEntityId?: string | undefined;
  trackerEntityId?: string | undefined;
  acPowerBudgetW: number | null;
  acPowerBudgetEntityId?: string | undefined;
  acPowerConsumptionW: number | null;
  acPowerConsumptionEntityId?: string | undefined;
  ports: UnifiPort[];
  outlets: UnifiOutlet[];
  /** All entity ids belonging to this device (for getRuntimeEntityIds). */
  entityIds: string[];
  areaId?: string | undefined;
  areaName?: string | undefined;
}

export interface UnifiClient {
  deviceId: string;
  mac: string;
  name: string;
  rx: number | null;
  tx: number | null;
  rxEntityId?: string | undefined;
  txEntityId?: string | undefined;
  linkSpeedMbps: number | null;
  linkSpeedEntityId?: string | undefined;
  uptimeEntityId?: string | undefined;
  blockEntityId?: string | undefined;
  blocked: boolean | null;
  trackerEntityId?: string | undefined;
  entityIds: string[];
}

export interface UnifiWanLatency {
  target: string;
  wan: string;
  latencyMs: number | null;
  entityId: string;
}

export interface UnifiTopology {
  devices: UnifiDevice[];
  clients: UnifiClient[];
  wanLatency: UnifiWanLatency[];
  /** Every entity id the topology knows about. */
  allEntityIds: string[];
  hasUnifiIntegration: boolean;
}

export type CapStatus = 'enabled' | 'disabled' | 'absent';

export interface UnifiCapabilityReport {
  hasDevices: boolean;
  /** Port RX/TX sensors exist and are enabled. */
  portBandwidth: CapStatus;
  portLinkSpeed: CapStatus;
  portPoe: CapStatus;
  deviceClients: CapStatus;
  wanLatency: CapStatus;
  /** Entity ids that exist but are disabled_by (candidates for one-click enable). */
  disabledEntityIds: string[];
  /** True when no port_rx-* unique_ids exist at all (bandwidth option off). */
  bandwidthOptionMissing: boolean;
  /** Human-readable tips keyed by view. */
  tipsByView: Partial<Record<string, string>>;
}

export interface UnifiDiscoveryConfig {
  hidden_device_ids?: readonly string[] | undefined;
  include_device_ids?: readonly string[] | undefined;
  include_clients?: boolean | undefined;
  area_filter?: readonly string[] | undefined;
}

/* -------------------------------------------------------------------------- */
/* Registry row shapes                                                         */
/* -------------------------------------------------------------------------- */

interface HassEntityRow {
  entity_id?: string;
  device_id?: string | null;
  area_id?: string | null;
  platform?: string;
  unique_id?: string;
  translation_key?: string | null;
  disabled_by?: string | null;
  hidden_by?: string | null;
  original_name?: string | null;
  name?: string | null;
  entity_category?: string | null;
}

interface HassDeviceRow {
  id?: string;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  sw_version?: string | null;
  area_id?: string | null;
  connections?: Array<[string, string]> | undefined;
  identifiers?: Array<[string, string]> | undefined;
  disabled_by?: string | null;
  entry_type?: string | null | undefined;
}

interface HassAreaRow {
  area_id?: string;
  name?: string;
}

interface HassRegistries {
  entities?: Record<string, HassEntityRow | undefined> | undefined;
  devices?: Record<string, HassDeviceRow | undefined> | undefined;
  areas?: Record<string, HassAreaRow | undefined> | undefined;
}

interface EntityRegistryListRow {
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
  platform?: string;
  unique_id?: string;
  translation_key?: string | null;
  disabled_by?: string | null;
  hidden_by?: string | null;
  original_name?: string | null;
  name?: string | null;
}

interface DeviceRegistryListRow {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  sw_version?: string | null;
  area_id?: string | null;
  connections?: Array<[string, string]>;
  identifiers?: Array<[string, string]>;
  disabled_by?: string | null;
  entry_type?: string | null | undefined;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const UBNT_MANUFACTURERS = new Set([
  'ubiquiti',
  'ubiquiti networks',
  'ubnt',
  'ui',
  'unifi',
]);

/** Models that clearly identify UniFi infrastructure (not clients). */
const INFRA_MODEL_RE =
  /\b(UDM|UDMP|UXG|UCG|USG|UDR|USW|US-8|US-16|US-24|US-48|U6|U7|UAP|E7|UX|USP|PDU|UCK|UNVR|UVC|ULTE|UGW|AGGREGATION|ENTERPRISE|DREAM\s*MACHINE|CLOUD\s*GATEWAY|SECURITY\s*GATEWAY|ACCESS\s*POINT|SWITCH)\b/i;

/** unique_id prefixes used by the official UniFi integration for ports/outlets. */
export const PORT_UID_PREFIXES: Record<string, UnifiPortRole> = {
  'port_rx-': 'rx',
  'port_tx-': 'tx',
  'port_link_speed-': 'link_speed',
  'poe_power-': 'poe_power',
  'poe-': 'poe_switch',
  'port-': 'port_enable',
  'power_cycle-': 'power_cycle',
  'outlet-': 'outlet_switch',
};

/** Client-only unique_id prefixes from the UniFi integration. */
const CLIENT_UID_PREFIXES = [
  'rx-',
  'tx-',
  'wired_speed-',
  'uptime-',
  'block-',
] as const;

const DEVICE_SENSOR_KEYS = [
  'device_state',
  'device_cpu_utilization',
  'device_memory_utilization',
  'device_clients',
  'device_uplink_mac',
  'wan_latency',
  'smartpower_ac_power_budget',
  'smartpower_ac_power_consumption',
  'outlet_power',
  'port_bandwidth_rx',
  'port_bandwidth_tx',
  'port_link_speed',
  'port_poe_power',
  'poe_port_control',
] as const;

const topologyMemo = new UcStatesMemo<UnifiTopology>();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

export function normalizeMac(mac: string | undefined | null): string {
  if (!mac) return '';
  return mac.toLowerCase().replace(/[^0-9a-f]/g, '');
}

export function formatMac(mac: string): string {
  const n = normalizeMac(mac);
  if (n.length !== 12) return mac;
  return n.match(/.{1,2}/g)!.join(':');
}

/**
 * Strict manufacturer match. Never use substring includes for short tokens like
 * "ui" — that falsely matched hundreds of client OUIs ("Audio…", "Build…", etc.).
 */
export function isUbiquitiManufacturer(mfr: string | null | undefined): boolean {
  if (!mfr) return false;
  const lower = mfr.toLowerCase().trim();
  if (UBNT_MANUFACTURERS.has(lower)) return true;
  // Allow "Ubiquiti Inc." / "Ubiquiti Inc" style names
  if (lower.startsWith('ubiquiti')) return true;
  if (lower.startsWith('ubnt')) return true;
  return false;
}

export function looksLikeUnifiInfraModel(model: string | null | undefined): boolean {
  if (!model) return false;
  if (/^unifi\s+wlan$/i.test(model.trim())) return false;
  if (/^unifi\s+network$/i.test(model.trim())) return false;
  return INFRA_MODEL_RE.test(model);
}

function parseNum(state: string | undefined | null): number | null {
  if (state == null || state === '' || state === 'unavailable' || state === 'unknown') {
    return null;
  }
  const n = Number(state);
  return Number.isFinite(n) ? n : null;
}

function friendlyName(
  hass: HomeAssistant,
  entityId: string,
  fallback?: string
): string {
  const st = hass.states[entityId];
  const fn = st?.attributes?.friendly_name;
  if (typeof fn === 'string' && fn.trim()) return fn.trim();
  return fallback || entityId;
}

/**
 * Parse `<prefix><mac>_<index>` unique_ids from the UniFi integration.
 * Returns null when the unique_id does not match a known port/outlet prefix.
 */
export function parsePortUniqueId(
  uniqueId: string | undefined | null
): { role: UnifiPortRole; mac: string; index: number } | null {
  if (!uniqueId) return null;
  for (const [prefix, role] of Object.entries(PORT_UID_PREFIXES)) {
    if (!uniqueId.startsWith(prefix)) continue;
    const rest = uniqueId.slice(prefix.length);
    const us = rest.lastIndexOf('_');
    if (us <= 0) return null;
    const macPart = rest.slice(0, us);
    const idxPart = rest.slice(us + 1);
    const index = Number(idxPart);
    if (!Number.isFinite(index)) return null;
    const mac = normalizeMac(macPart);
    if (mac.length < 12) return null;
    return { role, mac, index };
  }
  return null;
}

export function isClientUniqueId(uniqueId: string | undefined | null): boolean {
  if (!uniqueId) return false;
  // Port unique_ids also start with patterns — check port prefixes first
  if (parsePortUniqueId(uniqueId)) return false;
  return CLIENT_UID_PREFIXES.some(p => uniqueId.startsWith(p));
}

/**
 * Map a Ubiquiti catalog deviceType (from the public device database) to a
 * card kind. Returns null for types we render generically.
 */
export function kindFromDbType(
  deviceType: string | null | undefined,
  model?: string | null | undefined
): UnifiDeviceKind | null {
  switch (deviceType) {
    case 'access-point':
    case 'mesh-point':
      return 'ap';
    case 'switch':
      return 'switch';
    case 'console':
    case 'gateway':
    case 'router':
      return 'gateway';
    case 'power-supply': {
      const m = (model || '').toUpperCase();
      // Rack-mount power (PDU Pro, RPS) vs. wall plugs / power strips
      return /PDU|RPS/.test(m) ? 'pdu' : 'plug';
    }
    default:
      return null;
  }
}

/**
 * AP model codes are prefixes, not whole words: the registry reports raw codes
 * like "U7PIW", "U7PROMAX", "U6M" with no separator after the family token.
 * Deliberately no generic "WIFI" token — third-party "WiFi Smart Plug" style
 * models must never classify as access points.
 */
const AP_MODEL_RE = /(^|[^A-Z0-9])(U[67][A-Z0-9+-]*|UAP[A-Z0-9-]*|UAL[A-Z0-9-]*|E7[A-Z0-9-]*|ACCESS\s*POINT|IW-HD|BEACON)([^A-Z0-9]|$)/;

/** Anything plug/outlet-shaped, Ubiquiti or otherwise, is a plug — never rack gear. */
const PLUG_MODEL_RE = /(^|[^A-Z0-9])(UP1|UP6|USP[\s-]?PLUG[A-Z0-9-]*|USP[\s-]?STRIP[A-Z0-9-]*|SMART\s*POWER|PLUG|OUTLET)([^A-Z0-9]|$)/;

/** Classify a UniFi device from model string + entity fingerprint. */
export function classifyDevice(
  model: string,
  fingerprint: {
    hasPorts?: boolean;
    hasWanLatency?: boolean;
    hasOutlets?: boolean;
    outletCount?: number;
    hasAcPower?: boolean;
    hasClients?: boolean;
    hasDeviceState?: boolean;
    hasCpu?: boolean;
  } = {}
): UnifiDeviceKind {
  const m = (model || '').toUpperCase();

  // Authoritative: Ubiquiti's own catalog when it is loaded and knows the model
  const dbEntry = ucUnifiDeviceDb.lookup(model);
  const dbKind = dbEntry ? kindFromDbType(dbEntry.deviceType, model) : null;
  if (dbKind) return dbKind;

  if (PLUG_MODEL_RE.test(m)) return 'plug';

  if (/\b(PDU|USP-PDU|USP-RPS|SMARTPOWER)\b/.test(m)) return 'pdu';

  if (
    fingerprint.hasWanLatency ||
    /\b(UDM[A-Z0-9-]*|UXG[A-Z0-9-]*|UCG[A-Z0-9-]*|USG[A-Z0-9-]*|UDR[A-Z0-9-]*|UX\b|CLOUD\s*GATEWAY|DREAM\s*MACHINE|SECURITY\s*GATEWAY)/.test(
      m
    )
  ) {
    return 'gateway';
  }

  if (AP_MODEL_RE.test(m) && !fingerprint.hasPorts) {
    return 'ap';
  }

  if (fingerprint.hasPorts || /\b(USW[A-Z0-9-]*|US[0-9]+[A-Z0-9]*|US-8|US-16|US-24|US-48|SWITCH|AGGREGATION)\b/.test(m)) {
    return 'switch';
  }

  if (AP_MODEL_RE.test(m)) return 'ap';

  // AC power budget sensors only exist on rack power (SmartPower PDU / RPS)
  if (fingerprint.hasAcPower) return 'pdu';

  // Outlet entities without a recognizable model: 1–2 outlets is a smart
  // plug / in-wall outlet, more is rack power.
  if (fingerprint.hasOutlets) {
    return (fingerprint.outletCount ?? 0) > 2 ? 'pdu' : 'plug';
  }

  return 'other';
}

/**
 * True when this registry row is UniFi *network equipment*, not a tracked client
 * and not a service entry (WLAN / DPI / "UniFi Network" shell).
 */
export function isUnifiInfrastructureDevice(
  row: {
    manufacturer?: string | null | undefined;
    model?: string | null | undefined;
    entry_type?: string | null | undefined;
    identifiers?: Array<[string, string]> | undefined;
    connections?: Array<[string, string]> | undefined;
  } | null | undefined
): boolean {
  if (!row) return false;
  if (row.entry_type === 'service') return false;
  const model = (row.model || '').trim();
  if (/^unifi\s+wlan$/i.test(model) || /^unifi\s+network$/i.test(model)) return false;

  // Ubiquiti manufacturer alone is not enough: tracked *clients* get their
  // manufacturer from the MAC OUI, so a UniFi plug/camera joined as a WiFi
  // client also says "Ubiquiti". Real adopted hardware always reports a model.
  if (isUbiquitiManufacturer(row.manufacturer) && model) return true;
  if (looksLikeUnifiInfraModel(model)) return true;

  // Identifier (unifi, <mac>) — only when the id looks like a device MAC
  if (row.identifiers) {
    for (const id of row.identifiers) {
      if (!Array.isArray(id) || id[0] !== 'unifi' || !id[1]) continue;
      const mac = normalizeMac(id[1]);
      if (mac.length === 12) return true;
    }
  }
  return false;
}

/**
 * After entities are attached: drop buckets that look like clients
 * (no infra sensors / ports / Ubiquiti manufacturer).
 */
export function isInfrastructureAccumulator(acc: {
  device: {
    manufacturer?: string | null;
    model?: string | null;
    entry_type?: string | null;
  };
  ports: { readonly size: number };
  outlets: { readonly size: number };
  stateEntityId?: string | undefined;
  cpuEntityId?: string | undefined;
  memoryEntityId?: string | undefined;
  clientsEntityId?: string | undefined;
  uplinkMacEntityId?: string | undefined;
  ledEntityId?: string | undefined;
  restartEntityId?: string | undefined;
  acBudgetEntityId?: string | undefined;
  acConsumeEntityId?: string | undefined;
  wanLatency: readonly unknown[];
}): boolean {
  if (!isUnifiInfrastructureDevice(acc.device)) {
    // Non-Ubiquiti manufacturer: only keep if we found clear infra entities
    const hasInfraEntities =
      acc.ports.size > 0 ||
      acc.outlets.size > 0 ||
      !!acc.stateEntityId ||
      !!acc.cpuEntityId ||
      !!acc.memoryEntityId ||
      !!acc.uplinkMacEntityId ||
      !!acc.acBudgetEntityId ||
      acc.wanLatency.length > 0;
    if (!hasInfraEntities) return false;
  }
  // Ubiquiti shell / empty client-shaped device with only a tracker
  const hasSomething =
    acc.ports.size > 0 ||
    acc.outlets.size > 0 ||
    !!acc.stateEntityId ||
    !!acc.cpuEntityId ||
    !!acc.memoryEntityId ||
    !!acc.clientsEntityId ||
    !!acc.uplinkMacEntityId ||
    !!acc.ledEntityId ||
    !!acc.restartEntityId ||
    !!acc.acBudgetEntityId ||
    !!acc.acConsumeEntityId ||
    acc.wanLatency.length > 0 ||
    looksLikeUnifiInfraModel(acc.device.model);
  return hasSomething;
}

export function estimateHeightU(kind: UnifiDeviceKind, portCount: number, model: string): number {
  const m = (model || '').toUpperCase();
  if (kind === 'ap' || kind === 'plug') return 1;
  if (kind === 'pdu') {
    if (/PRO|24|20/.test(m)) return 1;
    return 1;
  }
  if (kind === 'gateway') {
    if (/PRO|SE|ENTERPRISE|MAX/.test(m)) return 1;
    return 1;
  }
  if (portCount >= 48) return 1;
  if (portCount >= 24) return 1;
  return 1;
}

/**
 * Default visible set for a new card: gateways, switches, PDUs first.
 * APs are included only when the total stays small so racks don't explode.
 */
export function suggestVisibleDeviceIds(
  devices: UnifiDevice[],
  options?: { max?: number | undefined; includeAps?: boolean | undefined }
): string[] {
  const max = options?.max ?? 16;
  const includeAps = options?.includeAps ?? devices.filter(d => d.kind === 'ap').length <= 8;

  const priority = (k: UnifiDeviceKind): number => {
    switch (k) {
      case 'gateway':
        return 0;
      case 'switch':
        return 1;
      case 'pdu':
        return 2;
      case 'ap':
        return 3;
      default:
        return 4;
    }
  };

  const sorted = [...devices].sort((a, b) => {
    const p = priority(a.kind) - priority(b.kind);
    if (p !== 0) return p;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const out: string[] = [];
  for (const d of sorted) {
    if (d.kind === 'ap' && !includeAps) continue;
    // Smart plugs / outlets and unclassified gear stay hidden until the user
    // explicitly shows them.
    if (d.kind === 'plug') continue;
    if (d.kind === 'other' && d.ports.length === 0) continue;
    out.push(d.deviceId);
    if (out.length >= max) break;
  }
  // Always keep at least gateways even if max is tiny
  if (out.length === 0) {
    for (const d of sorted) {
      if (d.kind === 'gateway' || d.kind === 'switch') {
        out.push(d.deviceId);
        if (out.length >= Math.max(1, max)) break;
      }
    }
  }
  return out;
}

/**
 * Seed hidden_device_ids so the card doesn't dump every device into the rack
 * on first open. Returns null when no change is needed.
 */
export function seedCuration(
  devices: UnifiDevice[],
  current: {
    hidden_device_ids?: readonly string[] | undefined;
    device_order?: readonly string[] | undefined;
    curation_seeded?: boolean | undefined;
    rack_max_devices?: number | undefined;
  }
): { hidden_device_ids: string[]; device_order: string[]; curation_seeded: true } | null {
  if (current.curation_seeded) return null;
  if ((current.hidden_device_ids?.length || 0) > 0) {
    return {
      hidden_device_ids: [...(current.hidden_device_ids || [])],
      device_order: [...(current.device_order || [])],
      curation_seeded: true,
    };
  }
  const visible = new Set(
    suggestVisibleDeviceIds(devices, { max: current.rack_max_devices ?? 16 })
  );
  const hidden = devices.filter(d => !visible.has(d.deviceId)).map(d => d.deviceId);
  return {
    hidden_device_ids: hidden,
    device_order: [...visible],
    curation_seeded: true,
  };
}

function deviceMac(row: HassDeviceRow | DeviceRegistryListRow | undefined): string {
  if (!row?.connections) return '';
  for (const conn of row.connections) {
    if (Array.isArray(conn) && conn[0] === 'mac' && conn[1]) {
      return normalizeMac(conn[1]);
    }
  }
  // Fallback: unifi identifier is often the mac
  if (row.identifiers) {
    for (const id of row.identifiers) {
      if (Array.isArray(id) && id[0] === 'unifi' && id[1]) {
        const n = normalizeMac(id[1]);
        if (n.length === 12) return n;
      }
    }
  }
  return '';
}

function deviceDisplayName(row: HassDeviceRow | DeviceRegistryListRow): string {
  return (row.name_by_user || row.name || row.model || row.id || 'UniFi device').trim();
}

/* -------------------------------------------------------------------------- */
/* Sync discovery                                                              */
/* -------------------------------------------------------------------------- */

function getRegistries(hass: HomeAssistant): HassRegistries {
  return hass as unknown as HassRegistries;
}

function collectUnifiDeviceIds(hass: HomeAssistant): Map<string, HassDeviceRow> {
  const reg = getRegistries(hass);
  const out = new Map<string, HassDeviceRow>();
  const devices = reg.devices;
  if (!devices) return out;

  for (const [id, row] of Object.entries(devices)) {
    if (!row || row.disabled_by) continue;
    if (!isUnifiInfrastructureDevice(row)) continue;
    out.set(id, { ...row, id });
  }
  return out;
}

interface PortBucket {
  index: number;
  name: string;
  rx?: string;
  tx?: string;
  link?: string;
  poePower?: string;
  poeSwitch?: string;
  portEnable?: string;
  powerCycle?: string;
}

interface OutletBucket {
  index: number;
  name: string;
  power?: string;
  switch?: string;
}

function ensurePort(map: Map<number, PortBucket>, index: number, name: string): PortBucket {
  let b = map.get(index);
  if (!b) {
    b = { index, name: name || `Port ${index}` };
    map.set(index, b);
  } else if (name && (!b.name || b.name.startsWith('Port '))) {
    b.name = name;
  }
  return b;
}

function buildTopologyFromHass(
  hass: HomeAssistant,
  config: UnifiDiscoveryConfig | undefined
): UnifiTopology {
  const reg = getRegistries(hass);
  const deviceMap = collectUnifiDeviceIds(hass);
  const entities = reg.entities || {};
  const areas = reg.areas || {};

  // Visibility (hidden / include) is applied by orderDevices for views — discovery
  // always returns the full infrastructure set so the editor can show/hide freely.
  const areaFilter = config?.area_filter?.length ? new Set(config.area_filter) : null;

  // Per-device accumulators
  type Acc = {
    device: HassDeviceRow;
    entityIds: string[];
    /** Count of entities from the `unifi` platform on this device. */
    unifiCount: number;
    ports: Map<number, PortBucket>;
    outlets: Map<number, OutletBucket>;
    stateEntityId?: string;
    cpuEntityId?: string;
    memoryEntityId?: string;
    temperatureEntityId?: string;
    uptimeEntityId?: string;
    clientsEntityId?: string;
    uplinkMacEntityId?: string;
    ledEntityId?: string;
    restartEntityId?: string;
    updateEntityId?: string;
    trackerEntityId?: string;
    acBudgetEntityId?: string;
    acConsumeEntityId?: string;
    wanLatency: UnifiWanLatency[];
  };

  const byDevice = new Map<string, Acc>();
  for (const [id, row] of deviceMap) {
    byDevice.set(id, {
      device: row,
      entityIds: [],
      unifiCount: 0,
      ports: new Map(),
      outlets: new Map(),
      wanLatency: [],
    });
  }

  const clients: UnifiClient[] = [];
  const clientByDevice = new Map<string, UnifiClient>();
  const orphanWan: UnifiWanLatency[] = [];
  const allEntityIds: string[] = [];

  const ensureClient = (deviceId: string, entityId: string, uniqueId: string): UnifiClient => {
    let client = clientByDevice.get(deviceId);
    if (!client) {
      const drow = reg.devices?.[deviceId];
      const mac =
        deviceMac(drow) ||
        normalizeMac(uniqueId.replace(/^(rx-|tx-|wired_speed-|uptime-|block-)/, ''));
      client = {
        deviceId,
        mac,
        name: drow ? deviceDisplayName(drow) : friendlyName(hass, entityId, 'Client'),
        rx: null,
        tx: null,
        linkSpeedMbps: null,
        blocked: null,
        entityIds: [],
      };
      clientByDevice.set(deviceId, client);
      clients.push(client);
    }
    return client;
  };

  const stateKeys = Object.keys(hass.states || {});

  for (const entityId of stateKeys) {
    const row = entities[entityId];
    const deviceId = row?.device_id || undefined;
    const isUnifiPlatform = row?.platform === 'unifi';
    const onInfraDevice = !!(deviceId && byDevice.has(deviceId));

    if (!isUnifiPlatform && !onInfraDevice) continue;

    const st = hass.states[entityId];
    const tKey = row?.translation_key || '';
    const uniqueId = row?.unique_id || '';
    const domain = entityId.split('.')[0];
    const originalName = row?.original_name || row?.name || '';

    // Client entities — never promote their HA device into infrastructure
    const isClientEntity =
      tKey === 'client_bandwidth_rx' ||
      tKey === 'client_bandwidth_tx' ||
      tKey === 'wired_client_link_speed' ||
      tKey === 'block_client' ||
      isClientUniqueId(uniqueId) ||
      (isUnifiPlatform &&
        !onInfraDevice &&
        (domain === 'device_tracker' ||
          domain === 'switch' ||
          (domain === 'sensor' && !parsePortUniqueId(uniqueId))));

    if (isClientEntity && deviceId && !onInfraDevice) {
      allEntityIds.push(entityId);
      const client = ensureClient(deviceId, entityId, uniqueId);
      client.entityIds.push(entityId);
      if (tKey === 'client_bandwidth_rx' || uniqueId.startsWith('rx-')) {
        client.rx = parseNum(st?.state);
        client.rxEntityId = entityId;
      } else if (tKey === 'client_bandwidth_tx' || uniqueId.startsWith('tx-')) {
        client.tx = parseNum(st?.state);
        client.txEntityId = entityId;
      } else if (tKey === 'wired_client_link_speed' || uniqueId.startsWith('wired_speed-')) {
        client.linkSpeedMbps = parseNum(st?.state);
        client.linkSpeedEntityId = entityId;
      } else if (
        uniqueId.startsWith('uptime-') ||
        (domain === 'sensor' &&
          st?.attributes?.device_class === 'timestamp' &&
          /uptime/i.test(originalName))
      ) {
        client.uptimeEntityId = entityId;
      } else if (uniqueId.startsWith('block-') || tKey === 'block_client' || domain === 'switch') {
        client.blockEntityId = entityId;
        client.blocked = st?.state === 'off' ? true : st?.state === 'on' ? false : null;
      } else if (domain === 'device_tracker') {
        client.trackerEntityId = entityId;
      }
      continue;
    }

    // Do NOT create new device buckets from platform=unifi alone — that is what
    // previously sucked every client into the rack as a "UniFi device".
    if (!deviceId || !byDevice.has(deviceId)) continue;

    allEntityIds.push(entityId);
    const acc = byDevice.get(deviceId)!;
    acc.entityIds.push(entityId);
    if (isUnifiPlatform) acc.unifiCount++;

    // Port / outlet via unique_id
    const parsed = parsePortUniqueId(uniqueId);
    if (parsed) {
      if (parsed.role === 'outlet_switch' || parsed.role === 'outlet_power') {
        let ob = acc.outlets.get(parsed.index);
        if (!ob) {
          ob = { index: parsed.index, name: originalName || `Outlet ${parsed.index}` };
          acc.outlets.set(parsed.index, ob);
        }
        if (parsed.role === 'outlet_switch') ob.switch = entityId;
        continue;
      }
      const pb = ensurePort(acc.ports, parsed.index, originalName || `Port ${parsed.index}`);
      switch (parsed.role) {
        case 'rx':
          pb.rx = entityId;
          break;
        case 'tx':
          pb.tx = entityId;
          break;
        case 'link_speed':
          pb.link = entityId;
          break;
        case 'poe_power':
          pb.poePower = entityId;
          break;
        case 'poe_switch':
          pb.poeSwitch = entityId;
          break;
        case 'port_enable':
          pb.portEnable = entityId;
          break;
        case 'power_cycle':
          pb.powerCycle = entityId;
          break;
      }
      continue;
    }

    // Outlet power via translation_key
    if (tKey === 'outlet_power') {
      // Try to extract index from unique_id: often outlet_power-<mac>_<idx> — but
      // the official sensor uses unique_id poe-style. Fall back to name parsing.
      const m = uniqueId.match(/_(\d+)$/) || entityId.match(/_(\d+)$/);
      const idx = m ? Number(m[1]) : acc.outlets.size + 1;
      let ob = acc.outlets.get(idx);
      if (!ob) {
        ob = { index: idx, name: originalName || `Outlet ${idx}` };
        acc.outlets.set(idx, ob);
      }
      ob.power = entityId;
      continue;
    }

    // Device-level sensors via translation_key / unique_id / name heuristics
    if (tKey === 'device_state' || uniqueId.startsWith('device_state-') || (domain === 'sensor' && /state$/i.test(entityId) && !acc.stateEntityId)) {
      if (tKey === 'device_state' || uniqueId.includes('device_state') || /_state$/.test(entityId)) {
        acc.stateEntityId = entityId;
        continue;
      }
    }
    if (tKey === 'device_cpu_utilization' || uniqueId.includes('cpu') || /cpu_utilization|_cpu$/i.test(entityId)) {
      if (tKey === 'device_cpu_utilization' || /cpu/i.test(uniqueId) || /cpu/i.test(entityId)) {
        acc.cpuEntityId = entityId;
        continue;
      }
    }
    if (tKey === 'device_memory_utilization' || /memory/i.test(uniqueId) || /memory/i.test(entityId)) {
      if (tKey === 'device_memory_utilization' || /memory/i.test(uniqueId + entityId)) {
        acc.memoryEntityId = entityId;
        continue;
      }
    }
    if (
      tKey === 'device_clients' ||
      tKey === 'wlan_clients' ||
      (/clients/i.test(uniqueId) && domain === 'sensor')
    ) {
      acc.clientsEntityId = entityId;
      continue;
    }
    if (tKey === 'device_uplink_mac' || /uplink_mac/i.test(uniqueId) || /uplink_mac/i.test(entityId)) {
      acc.uplinkMacEntityId = entityId;
      continue;
    }
    if (tKey === 'wan_latency' || /_latency-/i.test(uniqueId) || /latency/i.test(entityId)) {
      const placeholders = extractWanTarget(uniqueId, originalName, entityId);
      acc.wanLatency.push({
        target: placeholders.target,
        wan: placeholders.wan,
        latencyMs: parseNum(st?.state),
        entityId,
      });
      continue;
    }
    if (tKey === 'smartpower_ac_power_budget' || /ac_power_budget/i.test(uniqueId + entityId)) {
      acc.acBudgetEntityId = entityId;
      continue;
    }
    if (tKey === 'smartpower_ac_power_consumption' || /ac_power_consumption/i.test(uniqueId + entityId)) {
      acc.acConsumeEntityId = entityId;
      continue;
    }
    if (domain === 'sensor' && st?.attributes?.device_class === 'temperature' && !acc.temperatureEntityId) {
      acc.temperatureEntityId = entityId;
      continue;
    }
    if (domain === 'sensor' && (st?.attributes?.device_class === 'timestamp' || /uptime/i.test(entityId)) && /uptime/i.test(uniqueId + entityId + originalName)) {
      acc.uptimeEntityId = entityId;
      continue;
    }
    if (domain === 'light' && !acc.ledEntityId) {
      acc.ledEntityId = entityId;
      continue;
    }
    if (domain === 'button' && (st?.attributes?.device_class === 'restart' || /restart/i.test(uniqueId + entityId))) {
      acc.restartEntityId = entityId;
      continue;
    }
    if (domain === 'update' && !acc.updateEntityId) {
      acc.updateEntityId = entityId;
      continue;
    }
    if (domain === 'device_tracker' && !acc.trackerEntityId) {
      acc.trackerEntityId = entityId;
      continue;
    }

    // Port entities via translation_key when unique_id parse failed
    if (
      tKey === 'port_bandwidth_rx' ||
      tKey === 'port_bandwidth_tx' ||
      tKey === 'port_link_speed' ||
      tKey === 'port_poe_power' ||
      tKey === 'poe_port_control'
    ) {
      const idxMatch = uniqueId.match(/_(\d+)$/) || entityId.match(/(?:port|poe)[_-]?(\d+)/i);
      const idx = idxMatch ? Number(idxMatch[1]) : 0;
      if (idx > 0) {
        const pb = ensurePort(acc.ports, idx, originalName || `Port ${idx}`);
        if (tKey === 'port_bandwidth_rx') pb.rx = entityId;
        else if (tKey === 'port_bandwidth_tx') pb.tx = entityId;
        else if (tKey === 'port_link_speed') pb.link = entityId;
        else if (tKey === 'port_poe_power') pb.poePower = entityId;
        else if (tKey === 'poe_port_control') pb.poeSwitch = entityId;
      }
    }
  }

  // Also walk entity registry for disabled entities belonging to UniFi devices
  // so capability reporting can see them even when not in hass.states.
  // (Sync path only sees enabled entities in states; async path fills the rest.)

  const macToDeviceId = new Map<string, string>();
  for (const [id, acc] of byDevice) {
    const mac = deviceMac(acc.device);
    if (mac) macToDeviceId.set(mac, id);
  }

  const devices: UnifiDevice[] = [];
  const wanLatency: UnifiWanLatency[] = [...orphanWan];

  for (const [id, acc] of byDevice) {
    if (!isInfrastructureAccumulator(acc as Parameters<typeof isInfrastructureAccumulator>[0])) continue;
    // Devices with zero `unifi`-platform entities are shells owned by other
    // integrations (e.g. the same UDM registered again by UniFi Protect).
    // Rendering them would duplicate hardware in the rack.
    if (acc.unifiCount === 0) continue;

    const areaId = acc.device.area_id || undefined;
    if (areaFilter) {
      // Also check entity-level areas — use device area primarily
      if (!areaId || !areaFilter.has(areaId)) continue;
    }

    const mac = deviceMac(acc.device);
    const model = acc.device.model || '';
    const portCount = acc.ports.size;
    const hasWan = acc.wanLatency.length > 0;
    const hasOutlets = acc.outlets.size > 0;
    const hasAc = !!(acc.acBudgetEntityId || acc.acConsumeEntityId);

    const kind = classifyDevice(model, {
      hasPorts: portCount > 0,
      hasWanLatency: hasWan,
      hasOutlets,
      outletCount: acc.outlets.size,
      hasAcPower: hasAc,
      hasClients: !!acc.clientsEntityId,
      hasDeviceState: !!acc.stateEntityId,
      hasCpu: !!acc.cpuEntityId,
    });

    const ports: UnifiPort[] = [...acc.ports.values()]
      .sort((a, b) => a.index - b.index)
      .map(pb => {
        const linkSpeedMbps = pb.link ? parseNum(hass.states[pb.link]?.state) : null;
        const rx = pb.rx ? parseNum(hass.states[pb.rx]?.state) : null;
        const tx = pb.tx ? parseNum(hass.states[pb.tx]?.state) : null;
        const poePowerW = pb.poePower ? parseNum(hass.states[pb.poePower]?.state) : null;
        const poeOn = pb.poeSwitch
          ? hass.states[pb.poeSwitch]?.state === 'on'
            ? true
            : hass.states[pb.poeSwitch]?.state === 'off'
              ? false
              : null
          : null;
        const enabled = pb.portEnable
          ? hass.states[pb.portEnable]?.state === 'on'
            ? true
            : hass.states[pb.portEnable]?.state === 'off'
              ? false
              : null
          : null;
        const up =
          (linkSpeedMbps != null && linkSpeedMbps > 0) ||
          (rx != null && rx > 0) ||
          (tx != null && tx > 0) ||
          (poePowerW != null && poePowerW > 0) ||
          poeOn === true;
        return {
          index: pb.index,
          name: pb.name,
          linkSpeedMbps,
          rx,
          tx,
          rxEntityId: pb.rx,
          txEntityId: pb.tx,
          linkSpeedEntityId: pb.link,
          poePowerW,
          poePowerEntityId: pb.poePower,
          poeOn,
          poeSwitchEntityId: pb.poeSwitch,
          enabled,
          portEnableEntityId: pb.portEnable,
          powerCycleEntityId: pb.powerCycle,
          up,
        };
      });

    const outlets: UnifiOutlet[] = [...acc.outlets.values()]
      .sort((a, b) => a.index - b.index)
      .map(ob => ({
        index: ob.index,
        name: ob.name,
        powerW: ob.power ? parseNum(hass.states[ob.power]?.state) : null,
        powerEntityId: ob.power,
        on: ob.switch
          ? hass.states[ob.switch]?.state === 'on'
            ? true
            : hass.states[ob.switch]?.state === 'off'
              ? false
              : null
          : null,
        switchEntityId: ob.switch,
      }));

    const uplinkRaw = acc.uplinkMacEntityId
      ? String(hass.states[acc.uplinkMacEntityId]?.state || '')
      : '';
    const uplinkMac = normalizeMac(uplinkRaw) || undefined;
    const uplinkDeviceId = uplinkMac ? macToDeviceId.get(uplinkMac) : undefined;

    const areaName = areaId ? areas[areaId]?.name || areaId : undefined;

    devices.push({
      deviceId: id,
      mac,
      name: deviceDisplayName(acc.device),
      model,
      manufacturer: acc.device.manufacturer || 'Ubiquiti Networks',
      swVersion: acc.device.sw_version || undefined,
      kind,
      heightU: estimateHeightU(kind, ports.length, model),
      state: acc.stateEntityId ? String(hass.states[acc.stateEntityId]?.state || '') : undefined,
      stateEntityId: acc.stateEntityId,
      cpuPct: acc.cpuEntityId ? parseNum(hass.states[acc.cpuEntityId]?.state) : null,
      cpuEntityId: acc.cpuEntityId,
      memoryPct: acc.memoryEntityId ? parseNum(hass.states[acc.memoryEntityId]?.state) : null,
      memoryEntityId: acc.memoryEntityId,
      temperatureC: acc.temperatureEntityId
        ? parseNum(hass.states[acc.temperatureEntityId]?.state)
        : null,
      temperatureEntityId: acc.temperatureEntityId,
      uptimeEntityId: acc.uptimeEntityId,
      clients: acc.clientsEntityId ? parseNum(hass.states[acc.clientsEntityId]?.state) : null,
      clientsEntityId: acc.clientsEntityId,
      uplinkMac,
      uplinkMacEntityId: acc.uplinkMacEntityId,
      uplinkDeviceId,
      ledEntityId: acc.ledEntityId,
      restartEntityId: acc.restartEntityId,
      updateEntityId: acc.updateEntityId,
      trackerEntityId: acc.trackerEntityId,
      acPowerBudgetW: acc.acBudgetEntityId
        ? parseNum(hass.states[acc.acBudgetEntityId]?.state)
        : null,
      acPowerBudgetEntityId: acc.acBudgetEntityId,
      acPowerConsumptionW: acc.acConsumeEntityId
        ? parseNum(hass.states[acc.acConsumeEntityId]?.state)
        : null,
      acPowerConsumptionEntityId: acc.acConsumeEntityId,
      ports,
      outlets,
      entityIds: acc.entityIds,
      areaId,
      areaName,
    });

    wanLatency.push(...acc.wanLatency);
  }

  // Sort: gateways first, then switches, APs, PDUs, plugs, other — alpha within kind
  const kindOrder: Record<UnifiDeviceKind, number> = {
    gateway: 0,
    switch: 1,
    ap: 2,
    pdu: 3,
    plug: 4,
    other: 5,
  };
  devices.sort((a, b) => {
    const k = kindOrder[a.kind] - kindOrder[b.kind];
    if (k !== 0) return k;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const includeClients = config?.include_clients !== false;
  const finalClients = includeClients ? clients : [];
  for (const c of finalClients) {
    allEntityIds.push(...c.entityIds);
  }

  const hasUnifiIntegration =
    devices.length > 0 ||
    finalClients.length > 0 ||
    Object.values(entities).some(e => e?.platform === 'unifi');

  return {
    devices,
    clients: finalClients,
    wanLatency,
    allEntityIds: [...new Set(allEntityIds)],
    hasUnifiIntegration,
  };
}

function extractWanTarget(
  uniqueId: string,
  originalName: string,
  entityId: string
): { target: string; wan: string } {
  // unique_id like "microsoft_wan_latency-<mac>" or name "Microsoft WAN latency"
  const src = `${uniqueId} ${originalName} ${entityId}`.toLowerCase();
  let target = 'Unknown';
  if (src.includes('microsoft')) target = 'Microsoft';
  else if (src.includes('google')) target = 'Google';
  else if (src.includes('cloudflare') || src.includes('1.1.1.1')) target = 'Cloudflare';
  const wan = src.includes('wan2') ? 'WAN2' : 'WAN';
  return { target, wan };
}

/**
 * Synchronous, memoized topology discovery for render paths.
 * Call from renderPreview / getRuntimeEntityIds.
 */
export function discoverUnifiTopology(
  hass: HomeAssistant | undefined | null,
  moduleId: string,
  config?: UnifiDiscoveryConfig
): UnifiTopology {
  if (!hass?.states) {
    return {
      devices: [],
      clients: [],
      wanLatency: [],
      allEntityIds: [],
      hasUnifiIntegration: false,
    };
  }
  const reg = hass as unknown as HassRegistries;
  const key = statesMemoKey(config);
  return topologyMemo.read(
    moduleId,
    [hass.states, reg.entities, reg.devices, reg.areas],
    key,
    () => buildTopologyFromHass(hass, config)
  );
}

export function forgetUnifiTopology(moduleId: string): void {
  topologyMemo.forget(moduleId);
}

/** Apply device_order + hidden filters and return ordered visible devices. */
export function orderDevices(
  devices: UnifiDevice[],
  deviceOrder?: readonly string[] | undefined,
  hiddenIds?: readonly string[] | undefined,
  includeIds?: readonly string[] | undefined
): UnifiDevice[] {
  const hidden = new Set(hiddenIds || []);
  const include = includeIds?.length ? new Set(includeIds) : null;
  let visible = devices.filter(d => !hidden.has(d.deviceId));
  if (include) visible = visible.filter(d => include.has(d.deviceId));
  if (!deviceOrder?.length) return visible;
  const byId = new Map(visible.map(d => [d.deviceId, d]));
  const ordered: UnifiDevice[] = [];
  for (const id of deviceOrder) {
    const d = byId.get(id);
    if (d) {
      ordered.push(d);
      byId.delete(id);
    }
  }
  for (const d of byId.values()) ordered.push(d);
  return ordered;
}

/* -------------------------------------------------------------------------- */
/* Async registry (wizard + disabled entities)                                 */
/* -------------------------------------------------------------------------- */

interface RegistryCache {
  at: number;
  entities: EntityRegistryListRow[];
  devices: DeviceRegistryListRow[];
}

const REGISTRY_TTL_MS = 45_000;

class UcUnifiService {
  private registryCache: RegistryCache | null = null;
  private inflight: Promise<RegistryCache> | null = null;

  invalidateRegistryCache(): void {
    this.registryCache = null;
  }

  async loadRegistries(hass: HomeAssistant): Promise<RegistryCache> {
    const now = Date.now();
    if (this.registryCache && now - this.registryCache.at < REGISTRY_TTL_MS) {
      return this.registryCache;
    }
    if (this.inflight) return this.inflight;

    this.inflight = (async () => {
      const ws = (msg: Record<string, unknown>) =>
        (hass as any).callWS(msg) as Promise<unknown>;
      try {
        const [entities, devices] = await Promise.all([
          ws({ type: 'config/entity_registry/list' }) as Promise<EntityRegistryListRow[]>,
          ws({ type: 'config/device_registry/list' }) as Promise<DeviceRegistryListRow[]>,
        ]);
        this.registryCache = {
          at: Date.now(),
          entities: Array.isArray(entities) ? entities : [],
          devices: Array.isArray(devices) ? devices : [],
        };
        return this.registryCache;
      } finally {
        this.inflight = null;
      }
    })();

    return this.inflight;
  }

  /**
   * Build a capability report using the full entity registry (including disabled).
   */
  async getCapabilityReport(
    hass: HomeAssistant,
    topology?: UnifiTopology
  ): Promise<UnifiCapabilityReport> {
    const topo = topology || discoverUnifiTopology(hass, '__caps__', {});
    let entities: EntityRegistryListRow[] = [];
    let devices: DeviceRegistryListRow[] = [];
    try {
      const cache = await this.loadRegistries(hass);
      entities = cache.entities;
      devices = cache.devices;
    } catch {
      // Fall back to sync-only view
    }

    const unifiDeviceIds = new Set<string>();
    for (const d of devices) {
      if (isUnifiInfrastructureDevice(d)) unifiDeviceIds.add(d.id);
    }
    // Also include devices already in topology
    for (const d of topo.devices) unifiDeviceIds.add(d.deviceId);

    const relevant = entities.filter(
      e =>
        e.platform === 'unifi' ||
        (e.device_id && unifiDeviceIds.has(e.device_id))
    );

    const disabledEntityIds: string[] = [];
    let portRxEnabled = 0;
    let portRxDisabled = 0;
    let portRxAbsent = true;
    let linkEnabled = 0;
    let linkDisabled = 0;
    let poeEnabled = 0;
    let poeDisabled = 0;
    let clientsEnabled = 0;
    let clientsDisabled = 0;
    let wanEnabled = 0;
    let wanDisabled = 0;

    for (const e of relevant) {
      const uid = e.unique_id || '';
      const tKey = e.translation_key || '';
      const disabled = !!e.disabled_by;

      const isPortRx =
        uid.startsWith('port_rx-') || tKey === 'port_bandwidth_rx';
      const isPortTx =
        uid.startsWith('port_tx-') || tKey === 'port_bandwidth_tx';
      const isLink =
        uid.startsWith('port_link_speed-') || tKey === 'port_link_speed';
      const isPoe =
        uid.startsWith('poe_power-') ||
        uid.startsWith('poe-') ||
        tKey === 'port_poe_power' ||
        tKey === 'poe_port_control';
      const isClients =
        tKey === 'device_clients' || tKey === 'wlan_clients' || /clients/i.test(uid);
      const isWan = tKey === 'wan_latency' || /latency/i.test(uid);
      // Disabled by default in HA; required to resolve topology uplinks.
      const isUplink =
        tKey === 'device_uplink_mac' || /uplink_mac/i.test(uid) || /uplink_mac/i.test(e.entity_id);

      if (isPortRx || isPortTx) {
        portRxAbsent = false;
        if (disabled) {
          portRxDisabled++;
          disabledEntityIds.push(e.entity_id);
        } else portRxEnabled++;
      } else if (isLink) {
        if (disabled) {
          linkDisabled++;
          disabledEntityIds.push(e.entity_id);
        } else linkEnabled++;
      } else if (isPoe) {
        if (disabled) {
          poeDisabled++;
          disabledEntityIds.push(e.entity_id);
        } else poeEnabled++;
      } else if (isClients) {
        if (disabled) {
          clientsDisabled++;
          disabledEntityIds.push(e.entity_id);
        } else clientsEnabled++;
      } else if (isWan) {
        if (disabled) {
          wanDisabled++;
          disabledEntityIds.push(e.entity_id);
        } else wanEnabled++;
      } else if (isUplink) {
        if (disabled) disabledEntityIds.push(e.entity_id);
      } else if (disabled && e.platform === 'unifi') {
        // Other useful disabled diagnostics
        if (
          DEVICE_SENSOR_KEYS.some(k => tKey === k || uid.includes(k.replace(/_/g, ''))) ||
          uid.startsWith('power_cycle-') ||
          uid.startsWith('port-')
        ) {
          disabledEntityIds.push(e.entity_id);
        }
      }
    }

    const status = (enabled: number, disabled: number, absent: boolean): CapStatus => {
      if (absent && enabled === 0 && disabled === 0) return 'absent';
      if (enabled > 0) return 'enabled';
      if (disabled > 0) return 'disabled';
      return 'absent';
    };

    const bandwidthOptionMissing = portRxAbsent && portRxEnabled === 0 && portRxDisabled === 0;

    const tipsByView: UnifiCapabilityReport['tipsByView'] = {};
    if (topo.devices.length === 0) {
      tipsByView.rack =
        'No UniFi devices found. Install and configure the official UniFi Network integration in Home Assistant.';
    }
    if (bandwidthOptionMissing) {
      tipsByView.ports =
        'Port bandwidth sensors are missing. Enable “Bandwidth usage sensors for network clients” under UniFi integration → Configure → More options.';
      tipsByView.topology =
        'Enable bandwidth sensors in the UniFi integration options for live traffic on topology links.';
    } else if (portRxDisabled > 0) {
      tipsByView.ports = `${portRxDisabled} port bandwidth sensors are disabled. Enable them for live RX/TX.`;
      tipsByView.rack = `${portRxDisabled} port sensors are disabled — enable them for port LED activity.`;
    }
    if (linkDisabled > 0) {
      tipsByView.ports =
        (tipsByView.ports ? tipsByView.ports + ' ' : '') +
        `${linkDisabled} link-speed sensors are disabled.`;
    }

    return {
      hasDevices: topo.devices.length > 0,
      portBandwidth: status(portRxEnabled, portRxDisabled, bandwidthOptionMissing),
      portLinkSpeed: status(linkEnabled, linkDisabled, linkEnabled === 0 && linkDisabled === 0),
      portPoe: status(poeEnabled, poeDisabled, poeEnabled === 0 && poeDisabled === 0),
      deviceClients: status(
        clientsEnabled,
        clientsDisabled,
        clientsEnabled === 0 && clientsDisabled === 0
      ),
      wanLatency: status(wanEnabled, wanDisabled, wanEnabled === 0 && wanDisabled === 0),
      disabledEntityIds: [...new Set(disabledEntityIds)],
      bandwidthOptionMissing,
      tipsByView,
    };
  }

  /**
   * One-click enable for disabled UniFi entities.
   * Requires admin. Returns counts of succeeded / failed updates.
   */
  async enableEntities(
    hass: HomeAssistant,
    entityIds: string[],
    onProgress?: (done: number, total: number) => void
  ): Promise<{ ok: number; failed: number }> {
    const isAdmin = Boolean((hass as any)?.user?.is_admin);
    if (!isAdmin) {
      return { ok: 0, failed: entityIds.length };
    }
    const unique = [...new Set(entityIds)];
    let ok = 0;
    let failed = 0;
    const concurrency = 4;
    let cursor = 0;

    const worker = async () => {
      while (cursor < unique.length) {
        const i = cursor++;
        const entityId = unique[i];
        try {
          await (hass as any).callWS({
            type: 'config/entity_registry/update',
            entity_id: entityId,
            disabled_by: null,
          });
          ok++;
        } catch {
          failed++;
        }
        onProgress?.(ok + failed, unique.length);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, unique.length) }, () => worker())
    );
    this.invalidateRegistryCache();
    return { ok, failed };
  }

  isAdmin(hass: HomeAssistant | undefined | null): boolean {
    return Boolean((hass as any)?.user?.is_admin);
  }
}

export const ucUnifiService = new UcUnifiService();

/* -------------------------------------------------------------------------- */
/* Display helpers                                                             */
/* -------------------------------------------------------------------------- */

/** Convert a raw rate to Mbps for consistent LED / bar scaling. */
export function toMbps(
  value: number | null,
  unit?: string | undefined
): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const u = (unit || '').toLowerCase().replace(/\s+/g, '');
  if (u.includes('gbit') || u === 'gbit/s' || u === 'gbps') return value * 1000;
  if (u.includes('mbit') || u === 'mbit/s' || u === 'mbps') return value;
  if (u.includes('kbit') || u === 'kbit/s' || u === 'kbps') return value / 1000;
  if (u.includes('mbyte') || u === 'mb/s' || u === 'mib/s') return value * 8;
  if (u.includes('kbyte') || u === 'kb/s' || u === 'kib/s') return (value * 8) / 1000;
  // Bytes per second — HA port sensors use BYTES_PER_SECOND ('B/s')
  if (u.includes('byte') || u === 'b/s' || u === 'b/sec') {
    return (value * 8) / 1_000_000;
  }
  if (u.includes('bit') && !u.includes('byte')) {
    return value / 1_000_000;
  }
  // Heuristic: very large numbers are likely B/s
  if (value > 10_000) return (value * 8) / 1_000_000;
  return value;
}

/** Matches the official UniFi Etherlighting "port speed" theme:
 *  10G cyan, 2.5/5G blue, 1G green, 100M yellow. */
export function linkSpeedColor(mbps: number | null | undefined): string {
  if (mbps == null || mbps <= 0) return 'rgba(120,130,150,0.35)';
  if (mbps >= 10000) return '#00e5ff';
  if (mbps >= 2500) return '#4a9eff';
  if (mbps >= 1000) return '#69f0ae';
  if (mbps >= 100) return '#ffd740';
  return '#ffab40';
}

export function formatRate(mbps: number | null): string {
  if (mbps == null || !Number.isFinite(mbps)) return '—';
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
  if (mbps >= 1) return `${mbps.toFixed(1)} Mbps`;
  if (mbps >= 0.001) return `${(mbps * 1000).toFixed(0)} Kbps`;
  return '0';
}

export function formatUptime(state: string | undefined): string {
  if (!state || state === 'unavailable' || state === 'unknown') return '—';
  // HA uptime sensors are often ISO timestamps (device class timestamp)
  const ts = Date.parse(state);
  if (!Number.isFinite(ts)) return state;
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function kindIcon(kind: UnifiDeviceKind): string {
  switch (kind) {
    case 'gateway':
      return 'mdi:router-network';
    case 'switch':
      return 'mdi:switch';
    case 'ap':
      return 'mdi:wifi';
    case 'pdu':
      return 'mdi:power-socket-us';
    case 'plug':
      return 'mdi:power-plug-outline';
    default:
      return 'mdi:lan';
  }
}
