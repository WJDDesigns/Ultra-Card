import { HomeAssistant } from 'custom-card-helpers';
import { BatteryFleetEntity } from '../types';
import {
  estimateDischarge,
  toNumericSeries,
  type HistoryStatePoint,
  type NumericPoint,
} from './uc-history-service';

/**
 * Battery Fleet — discovery + drain analysis.
 *
 * The free `battery_monitor` module answers "what is the level right now?".
 * This service answers "which battery dies next, and when?" by pairing the
 * current state with recorder history.
 *
 * Everything here is pure and synchronous apart from `discoverDevices`, which
 * reads `hass`. History is fetched by the caller (see `uc-history-service`) and
 * handed to `analyze` so the module can paint current levels immediately and
 * fill in predictions when the recorder query lands.
 *
 * Honesty rule: a prediction built from a handful of samples is worse than no
 * prediction, so `confidence: 'none'` is treated as "say nothing" everywhere.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type BatterySource = 'sensor' | 'binary_sensor' | 'attribute' | 'manual';

export interface BatteryDevice {
  entityId: string;
  name: string;
  /** Current percentage, or null when the entity is unavailable. */
  level: number | null;
  icon: string;
  areaId?: string | undefined;
  areaName?: string | undefined;
  batteryType?: string | undefined;
  source: BatterySource;
  /** Attribute name when the level lives in an attribute (usually `battery_level`). */
  attribute?: string | undefined;
  charging: boolean;
}

export type BatteryConfidence = 'none' | 'low' | 'medium' | 'high';

export type BatteryStatus = 'critical' | 'low' | 'ok' | 'charging' | 'unknown';

export interface BatteryAnalysis extends BatteryDevice {
  /** Percentage points lost per day. Null when no drain could be measured. */
  ratePerDay: number | null;
  /** Days until the level reaches `replacement_floor`. Null unless trustworthy. */
  daysRemaining: number | null;
  /** Epoch ms of the projected replacement date. */
  replaceBy: number | null;
  confidence: BatteryConfidence;
  /** Sort key blending current level and projected time left. Higher = sooner. */
  urgency: number;
  status: BatteryStatus;
  /** Downsampled history for the sparkline. */
  series: NumericPoint[];
  /** Hours of actual observed discharge behind the estimate. */
  observedHours: number;
  /** Fraction of the history window spent discharging, 0–1. */
  coverage: number;
}

export interface BatteryFleetDiscoveryConfig {
  discovery_mode?: 'auto' | 'manual' | 'both' | undefined;
  entities?: readonly BatteryFleetEntity[] | undefined;
  exclude_patterns?: readonly string[] | undefined;
  hidden_entities?: readonly string[] | undefined;
  include_battery_level_attribute?: boolean | undefined;
  include_binary_sensors?: boolean | undefined;
  area_filter?: readonly string[] | undefined;
}

export interface BatteryFleetAnalysisConfig {
  predict_replacement?: boolean | undefined;
  replacement_floor?: number | undefined;
  min_confidence_hours?: number | undefined;
  urgent_days?: number | undefined;
  critical_threshold?: number | undefined;
  low_threshold?: number | undefined;
  show_charging_indicator?: boolean | undefined;
}

export type BatterySortMode = 'urgency' | 'level' | 'name' | 'drain_rate';

export interface FleetSummary {
  /** Devices discovered (before `max_items` / problem filtering). */
  total: number;
  critical: number;
  low: number;
  ok: number;
  charging: number;
  unknown: number;
  /** Projected to hit the replacement floor within 30 days. */
  replacingThisMonth: number;
  /** Projected to hit the replacement floor within `urgent_days`. */
  urgent: number;
  /** How many devices produced a trustworthy prediction. */
  predicted: number;
  mostUrgent: BatteryAnalysis | null;
}

/** Structured ETA so the module can localize without string surgery here. */
export type EtaDescriptor =
  | { kind: 'charging' }
  | { kind: 'gathering' }
  | { kind: 'now' }
  | { kind: 'days'; value: number }
  | { kind: 'weeks'; value: number }
  | { kind: 'months'; value: number }
  | { kind: 'beyond' }
  | { kind: 'off' };

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const UNAVAILABLE = new Set(['unavailable', 'unknown', 'none', '', 'null']);

/** Recorder queries get expensive fast; never ask for more than this many ids. */
export const MAX_HISTORY_ENTITIES = 80;

/** Sparkline is ~60px wide, so more than this many points is wasted work. */
const SPARKLINE_POINTS = 48;

const DAY_MS = 86400000;

const SOURCE_PRIORITY: Record<BatterySource, number> = {
  manual: 0,
  sensor: 1,
  attribute: 2,
  binary_sensor: 3,
};

/* -------------------------------------------------------------------------- */
/* Small helpers                                                               */
/* -------------------------------------------------------------------------- */

function num(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const asString = String(raw).trim().toLowerCase();
  if (UNAVAILABLE.has(asString)) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function objectId(entityId: string): string {
  const idx = entityId.indexOf('.');
  return idx === -1 ? entityId : entityId.slice(idx + 1);
}

function domainOf(entityId: string): string {
  const idx = entityId.indexOf('.');
  return idx === -1 ? '' : entityId.slice(0, idx);
}

/**
 * Collapses `sensor.front_door_battery` and `lock.front_door` to the same key so
 * one physical device isn't listed twice.
 */
function physicalKey(entityId: string): string {
  let base = objectId(entityId).toLowerCase();
  base = base
    .replace(/_battery_level$/, '')
    .replace(/_battery_percent(age)?$/, '')
    .replace(/_battery_state$/, '')
    .replace(/_battery$/, '')
    .replace(/_batterylevel$/, '');
  return base.replace(/[^a-z0-9]/g, '');
}

/** Trims the redundant "… Battery" suffix HA appends to most battery sensors. */
function cleanName(raw: string): string {
  const trimmed = raw.trim();
  const stripped = trimmed.replace(/\s+battery(\s+(level|percentage|percent|state))?$/i, '');
  return stripped.length >= 2 ? stripped : trimmed;
}

/** Level-appropriate MDI battery icon, matching HA's own battery iconography. */
export function batteryIcon(level: number | null, charging: boolean): string {
  if (level === null) return 'mdi:battery-unknown';
  const step = Math.round(clampPct(level) / 10) * 10;
  if (charging) {
    return `mdi:battery-charging-${Math.max(10, step)}`;
  }
  if (step <= 0) return 'mdi:battery-alert-variant-outline';
  if (step >= 100) return 'mdi:battery';
  return `mdi:battery-${step}`;
}

/* -------------------------------------------------------------------------- */
/* Registry access (all optional — older HA and tests have none of it)         */
/* -------------------------------------------------------------------------- */

interface RegistryEntityRow {
  area_id?: string | null | undefined;
  device_id?: string | null | undefined;
}

interface RegistryDeviceRow {
  area_id?: string | null | undefined;
  name_by_user?: string | null | undefined;
  name?: string | null | undefined;
}

interface RegistryAreaRow {
  area_id?: string | undefined;
  name?: string | undefined;
}

export interface RegistryLookup {
  deviceOf(entityId: string): string | undefined;
  areaOf(entityId: string): { id: string; name: string } | undefined;
  hasAreas: boolean;
}

interface HassRegistries {
  areas?: Record<string, RegistryAreaRow | undefined> | undefined;
  devices?: Record<string, RegistryDeviceRow | undefined> | undefined;
  entities?: Record<string, RegistryEntityRow | undefined> | undefined;
}

/**
 * `hass.areas` / `hass.devices` / `hass.entities` only exist on reasonably
 * recent frontends and never in unit tests, so every access is guarded and the
 * lookup degrades to "no area information" rather than throwing.
 */
export function buildRegistry(hass: HomeAssistant | undefined | null): RegistryLookup {
  const reg = (hass ?? undefined) as unknown as HassRegistries | undefined;
  const entities = reg?.entities;
  const devices = reg?.devices;
  const areas = reg?.areas;
  const hasAreas = !!areas && Object.keys(areas).length > 0;

  const areaCache = new Map<string, { id: string; name: string } | undefined>();

  const deviceOf = (entityId: string): string | undefined => {
    const row = entities?.[entityId];
    const deviceId = row?.device_id;
    return typeof deviceId === 'string' && deviceId ? deviceId : undefined;
  };

  const areaOf = (entityId: string): { id: string; name: string } | undefined => {
    if (areaCache.has(entityId)) return areaCache.get(entityId);
    let resolved: { id: string; name: string } | undefined;
    try {
      const entityRow = entities?.[entityId];
      let areaId = typeof entityRow?.area_id === 'string' ? entityRow.area_id : undefined;
      if (!areaId) {
        const deviceId = deviceOf(entityId);
        const deviceRow = deviceId ? devices?.[deviceId] : undefined;
        if (typeof deviceRow?.area_id === 'string') areaId = deviceRow.area_id;
      }
      if (areaId) {
        const areaRow = areas?.[areaId];
        resolved = { id: areaId, name: areaRow?.name || areaId };
      }
    } catch {
      resolved = undefined;
    }
    areaCache.set(entityId, resolved);
    return resolved;
  };

  return { deviceOf, areaOf, hasAreas };
}

/** Areas available for the editor's area filter. Empty when the registry is absent. */
export function listAreaOptions(
  hass: HomeAssistant | undefined | null
): Array<{ value: string; label: string }> {
  const reg = (hass ?? undefined) as unknown as HassRegistries | undefined;
  const areas = reg?.areas;
  if (!areas) return [];
  const out: Array<{ value: string; label: string }> = [];
  for (const [id, row] of Object.entries(areas)) {
    if (!id) continue;
    out.push({ value: id, label: row?.name || id });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}

/* -------------------------------------------------------------------------- */
/* Charging detection                                                          */
/* -------------------------------------------------------------------------- */

interface ChargingIndex {
  byDevice: Map<string, boolean>;
  byBase: Map<string, boolean>;
}

/**
 * One pass over `hass.states` collecting every `battery_charging` binary sensor,
 * keyed by device and by normalized name. Doing this up front turns the
 * per-device charging lookup from O(all states) into O(1).
 */
function buildChargingIndex(states: HomeAssistant['states'], reg: RegistryLookup): ChargingIndex {
  const byDevice = new Map<string, boolean>();
  const byBase = new Map<string, boolean>();

  for (const entityId of Object.keys(states)) {
    if (!entityId.startsWith('binary_sensor.')) continue;
    const st = states[entityId];
    if (!st) continue;
    const deviceClass = (st.attributes as Record<string, unknown> | undefined)?.['device_class'];
    const looksLikeCharging =
      deviceClass === 'battery_charging' || /_(battery_)?charging$/.test(objectId(entityId));
    if (!looksLikeCharging) continue;

    const on = st.state === 'on';
    const deviceId = reg.deviceOf(entityId);
    if (deviceId) byDevice.set(deviceId, (byDevice.get(deviceId) ?? false) || on);
    const base = physicalKey(entityId.replace(/_(battery_)?charging$/, ''));
    if (base) byBase.set(base, (byBase.get(base) ?? false) || on);
  }

  return { byDevice, byBase };
}

function detectCharging(
  entityId: string,
  attributes: Record<string, unknown> | undefined,
  reg: RegistryLookup,
  index: ChargingIndex
): boolean {
  if (attributes) {
    if (attributes['is_charging'] === true) return true;
    if (attributes['battery_charging'] === true) return true;
    if (attributes['charging'] === true) return true;
    const status = attributes['battery_status'] ?? attributes['charging_status'];
    if (
      typeof status === 'string' &&
      /charg/i.test(status) &&
      !/not\s*charg|discharg/i.test(status)
    ) {
      return true;
    }
  }
  const deviceId = reg.deviceOf(entityId);
  if (deviceId && index.byDevice.get(deviceId)) return true;
  const base = physicalKey(entityId);
  return base ? index.byBase.get(base) === true : false;
}

/* -------------------------------------------------------------------------- */
/* Discovery                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Finds every battery in the house from four sources:
 *  a) `sensor` entities with `device_class: battery` and a numeric state
 *  b) `binary_sensor` entities with `device_class: battery` (on = low → 0%)
 *  c) any entity carrying a numeric `battery_level` attribute (vacuums, phones)
 *  d) the user's manual list
 *
 * Filters (`exclude_patterns`, `hidden_entities`, `area_filter`) apply to
 * auto-discovered entities only — a manually listed entity is an explicit
 * choice and is never silently dropped.
 */
export function discoverDevices(
  hass: HomeAssistant | undefined | null,
  config: BatteryFleetDiscoveryConfig | undefined
): BatteryDevice[] {
  const states = hass?.states;
  if (!states) return [];

  const mode = config?.discovery_mode || 'auto';
  const reg = buildRegistry(hass);
  const chargingIndex = buildChargingIndex(states, reg);

  const hidden = new Set(
    (config?.hidden_entities || []).map(x => String(x).trim()).filter(Boolean)
  );
  const patterns = (config?.exclude_patterns || [])
    .map(p => String(p).trim().toLowerCase())
    .filter(Boolean);
  const areaFilter = new Set(
    (config?.area_filter || []).map(a => String(a).trim()).filter(Boolean)
  );

  const isExcluded = (entityId: string, name: string): boolean => {
    if (hidden.has(entityId)) return true;
    if (patterns.length === 0) return false;
    const id = entityId.toLowerCase();
    const label = name.toLowerCase();
    return patterns.some(p => id.includes(p) || label.includes(p));
  };

  const manualRows = new Map<string, BatteryFleetEntity>();
  if (mode !== 'auto') {
    for (const row of config?.entities || []) {
      const entityId = (row?.entity || '').trim();
      if (entityId) manualRows.set(entityId, row);
    }
  }

  const found: BatteryDevice[] = [];

  // ── (d) manual rows first: highest priority in the dedupe pass ────────────
  for (const [entityId, row] of manualRows) {
    const st = states[entityId];
    if (!st) continue;
    const attributes = st.attributes as Record<string, unknown> | undefined;
    const direct = num(st.state);
    const fromAttribute = num(attributes?.['battery_level']);
    let level: number | null = null;
    let attribute: string | undefined;
    if (direct !== null) {
      level = clampPct(direct);
    } else if (fromAttribute !== null) {
      level = clampPct(fromAttribute);
      attribute = 'battery_level';
    } else if (domainOf(entityId) === 'binary_sensor') {
      level = st.state === 'on' ? 0 : st.state === 'off' ? 100 : null;
    }

    const charging = detectCharging(entityId, attributes, reg, chargingIndex);
    const area = reg.areaOf(entityId);
    found.push({
      entityId,
      name: row.label?.trim() || cleanName(String(attributes?.['friendly_name'] || entityId)),
      level,
      icon: row.icon?.trim() || batteryIcon(level, charging),
      areaId: area?.id,
      areaName: area?.name,
      batteryType: row.battery_type?.trim() || undefined,
      source: 'manual',
      attribute,
      charging,
    });
  }

  // ── (a)(b)(c) auto discovery ──────────────────────────────────────────────
  if (mode !== 'manual') {
    const includeAttribute = config?.include_battery_level_attribute !== false;
    const includeBinary = config?.include_binary_sensors === true;

    for (const entityId of Object.keys(states)) {
      if (manualRows.has(entityId)) continue;
      const st = states[entityId];
      if (!st) continue;
      const attributes = st.attributes as Record<string, unknown> | undefined;
      const friendly = String(attributes?.['friendly_name'] || entityId);
      if (isExcluded(entityId, friendly)) continue;

      const domain = domainOf(entityId);
      const deviceClass = attributes?.['device_class'];
      let level: number | null = null;
      let source: BatterySource | null = null;
      let attribute: string | undefined;

      if (domain === 'sensor' && deviceClass === 'battery') {
        const v = num(st.state);
        if (v === null) continue;
        level = clampPct(v);
        source = 'sensor';
      } else if (includeBinary && domain === 'binary_sensor' && deviceClass === 'battery') {
        if (st.state !== 'on' && st.state !== 'off') continue;
        level = st.state === 'on' ? 0 : 100;
        source = 'binary_sensor';
      } else if (includeAttribute) {
        const v = num(attributes?.['battery_level']);
        if (v === null) continue;
        level = clampPct(v);
        source = 'attribute';
        attribute = 'battery_level';
      }

      if (source === null) continue;

      const area = reg.areaOf(entityId);
      if (areaFilter.size > 0 && (!area || !areaFilter.has(area.id))) continue;

      const charging = detectCharging(entityId, attributes, reg, chargingIndex);
      found.push({
        entityId,
        name: cleanName(friendly),
        level,
        icon: batteryIcon(level, charging),
        areaId: area?.id,
        areaName: area?.name,
        source,
        attribute,
        charging,
      });
    }
  }

  return dedupe(found, reg);
}

/**
 * Removes duplicates of the same physical device. Two entities of the *same*
 * source are always kept (a device really can have two batteries); only
 * cross-source duplicates — the classic `sensor.x_battery` plus a
 * `battery_level` attribute on `vacuum.x` — collapse to the better source.
 */
function dedupe(devices: BatteryDevice[], reg: RegistryLookup): BatteryDevice[] {
  const groups = new Map<string, BatteryDevice[]>();
  for (const device of devices) {
    const key = reg.deviceOf(device.entityId) || `name:${physicalKey(device.entityId)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(device);
    else groups.set(key, [device]);
  }

  const kept = new Set<string>();
  for (const bucket of groups.values()) {
    let best = Number.POSITIVE_INFINITY;
    for (const device of bucket) best = Math.min(best, SOURCE_PRIORITY[device.source]);
    for (const device of bucket) {
      if (SOURCE_PRIORITY[device.source] === best) kept.add(device.entityId);
    }
  }

  const seen = new Set<string>();
  return devices.filter(device => {
    if (!kept.has(device.entityId) || seen.has(device.entityId)) return false;
    seen.add(device.entityId);
    return true;
  });
}

/** Entity ids worth asking the recorder about, capped so the query stays sane. */
export function historyEntityIds(devices: readonly BatteryDevice[]): string[] {
  if (devices.length <= MAX_HISTORY_ENTITIES) return devices.map(d => d.entityId);
  // Lowest batteries first — those are the ones a prediction actually matters for.
  return [...devices]
    .sort((a, b) => (a.level ?? 101) - (b.level ?? 101))
    .slice(0, MAX_HISTORY_ENTITIES)
    .map(d => d.entityId);
}

/** True when any device reads its level from an attribute, so history needs them. */
export function needsAttributes(devices: readonly BatteryDevice[]): boolean {
  return devices.some(d => !!d.attribute);
}

/* -------------------------------------------------------------------------- */
/* Analysis                                                                    */
/* -------------------------------------------------------------------------- */

function binarySeries(points: readonly HistoryStatePoint[] | undefined): NumericPoint[] {
  if (!points) return [];
  const out: NumericPoint[] = [];
  for (const p of points) {
    if (p.state === 'on') out.push({ t: p.t, v: 0 });
    else if (p.state === 'off') out.push({ t: p.t, v: 100 });
  }
  return out;
}

function seriesFor(device: BatteryDevice, points: HistoryStatePoint[] | undefined): NumericPoint[] {
  if (device.source === 'binary_sensor') return binarySeries(points);
  return device.attribute
    ? toNumericSeries(points, { attribute: device.attribute })
    : toNumericSeries(points);
}

/** Evenly samples a series down to `max` points, always keeping first and last. */
export function downsample(series: readonly NumericPoint[], max: number): NumericPoint[] {
  if (series.length <= max) return [...series];
  const out: NumericPoint[] = [];
  const stride = (series.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) {
    const point = series[Math.round(i * stride)];
    if (point) out.push(point);
  }
  return out;
}

/**
 * Urgency for a battery level alone. Deliberately non-linear: anything at or
 * below the critical threshold pins to 100 so a nearly-dead battery can never
 * be out-ranked by a healthy one with a slightly steeper slope.
 */
function levelUrgency(level: number | null, critical: number, low: number): number {
  if (level === null) return 0;
  if (level <= critical) return 100;
  if (level <= low) {
    const span = Math.max(low - critical, 1);
    return 50 + 50 * ((low - level) / span);
  }
  const span = Math.max(100 - low, 1);
  return 50 * (1 - (level - low) / span);
}

/** Urgency from the projected replacement date, decaying over the urgent window. */
function etaUrgency(daysRemaining: number | null, urgentDays: number): number {
  if (daysRemaining === null) return 0;
  if (daysRemaining <= 0) return 100;
  const window = Math.max(urgentDays, 1);
  return 100 * Math.exp(-daysRemaining / window);
}

/**
 * Turns current levels + recorder history into ranked, honest predictions.
 *
 * `history` may be empty (the recorder query hasn't landed yet, or the user
 * turned predictions off) — every device still gets an entry so the caller can
 * render live levels immediately.
 */
export function analyze(
  devices: readonly BatteryDevice[],
  history: Map<string, HistoryStatePoint[]> | undefined,
  config: BatteryFleetAnalysisConfig | undefined
): BatteryAnalysis[] {
  const predict = config?.predict_replacement !== false;
  const floor = Math.max(0, Math.min(90, config?.replacement_floor ?? 5));
  const minHours = Math.max(1, config?.min_confidence_hours ?? 12);
  const urgentDays = Math.max(1, config?.urgent_days ?? 14);
  const critical = config?.critical_threshold ?? 10;
  const low = config?.low_threshold ?? 25;
  const showCharging = config?.show_charging_indicator !== false;

  const out: BatteryAnalysis[] = [];

  for (const device of devices) {
    const raw = seriesFor(device, history?.get(device.entityId));
    const estimate = raw.length >= 3 ? estimateDischarge(raw, { floor }) : null;

    const spanMs = raw.length >= 2 ? raw[raw.length - 1]!.t - raw[0]!.t : 0;
    const coverage = estimate?.coverage ?? 0;
    const observedHours = (spanMs * coverage) / 3600000;

    const ratePerHour = estimate?.ratePerHour ?? 0;
    let ratePerDay: number | null = ratePerHour > 0 ? ratePerHour * 24 : null;
    // A drift below ~0.05 %/day is indistinguishable from sensor rounding.
    if (ratePerDay !== null && ratePerDay < 0.05) ratePerDay = null;

    const charging = device.charging || (showCharging && estimate?.charging === true);

    let confidence: BatteryConfidence = 'none';
    if (ratePerDay !== null && observedHours >= minHours) {
      if (observedHours < minHours * 2 || coverage < 0.2) confidence = 'low';
      else if (observedHours < minHours * 4 || coverage < 0.5) confidence = 'medium';
      else confidence = 'high';
    }

    let daysRemaining: number | null = null;
    let replaceBy: number | null = null;
    if (predict && confidence !== 'none' && ratePerDay !== null && device.level !== null) {
      const headroom = device.level - floor;
      if (headroom <= 0) {
        daysRemaining = 0;
      } else {
        // Clamp to a decade so a 0.06 %/day drift can't print "in 4,300 days".
        daysRemaining = Math.min(headroom / ratePerDay, 3650);
      }
      replaceBy = Date.now() + daysRemaining * DAY_MS;
    }

    let status: BatteryStatus;
    if (device.level === null) status = 'unknown';
    else if (charging && showCharging) status = 'charging';
    else if (device.level <= critical) status = 'critical';
    else if (device.level <= low) status = 'low';
    else status = 'ok';

    const byLevel = levelUrgency(device.level, critical, low);
    const byEta = predict ? etaUrgency(daysRemaining, urgentDays) : 0;
    // Weight the worse signal heavily but let the other one still count, so a
    // 60% battery losing 8%/day outranks a stable 30% one.
    const dominant = Math.max(byLevel, byEta);
    const secondary = Math.min(byLevel, byEta);
    let urgency = dominant * 0.75 + secondary * 0.25;
    if (device.level === null) urgency = -1;
    else if (charging && showCharging) urgency *= 0.25;

    out.push({
      ...device,
      charging,
      ratePerDay,
      daysRemaining,
      replaceBy,
      confidence,
      urgency,
      status,
      series: downsample(raw, SPARKLINE_POINTS),
      observedHours,
      coverage,
    });
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Sorting, filtering, summarizing                                             */
/* -------------------------------------------------------------------------- */

export function sortAnalyses(
  list: readonly BatteryAnalysis[],
  mode: BatterySortMode | undefined
): BatteryAnalysis[] {
  const copy = [...list];
  switch (mode) {
    case 'level':
      copy.sort((a, b) => (a.level ?? 101) - (b.level ?? 101) || a.name.localeCompare(b.name));
      break;
    case 'name':
      copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      break;
    case 'drain_rate':
      copy.sort(
        (a, b) => (b.ratePerDay ?? -1) - (a.ratePerDay ?? -1) || a.name.localeCompare(b.name)
      );
      break;
    case 'urgency':
    default:
      copy.sort((a, b) => b.urgency - a.urgency || (a.level ?? 101) - (b.level ?? 101));
      break;
  }
  return copy;
}

/** True when a device deserves attention: low/critical, or replaced within the window. */
export function isProblem(
  analysis: BatteryAnalysis,
  config: BatteryFleetAnalysisConfig | undefined
): boolean {
  const urgentDays = Math.max(1, config?.urgent_days ?? 14);
  if (analysis.status === 'critical' || analysis.status === 'low') return true;
  if (analysis.status === 'unknown') return true;
  if (analysis.status === 'charging') return false;
  return analysis.daysRemaining !== null && analysis.daysRemaining <= urgentDays;
}

/**
 * True when a device is worth calling out at the top of the card: it is already
 * low, or its projected replacement is close enough to act on. Used to keep the
 * summary bar quiet when the whole fleet is healthy.
 */
export function isActionable(
  analysis: BatteryAnalysis | null | undefined,
  config: BatteryFleetAnalysisConfig | undefined
): boolean {
  if (!analysis) return false;
  if (analysis.status === 'critical' || analysis.status === 'low') return true;
  if (analysis.status === 'charging') return false;
  const urgentDays = Math.max(1, config?.urgent_days ?? 14);
  const window = Math.max(urgentDays, 30);
  return analysis.daysRemaining !== null && analysis.daysRemaining <= window;
}

export function summarize(
  list: readonly BatteryAnalysis[],
  config: BatteryFleetAnalysisConfig | undefined
): FleetSummary {
  const urgentDays = Math.max(1, config?.urgent_days ?? 14);
  const summary: FleetSummary = {
    total: list.length,
    critical: 0,
    low: 0,
    ok: 0,
    charging: 0,
    unknown: 0,
    replacingThisMonth: 0,
    urgent: 0,
    predicted: 0,
    mostUrgent: null,
  };

  for (const item of list) {
    switch (item.status) {
      case 'critical':
        summary.critical++;
        break;
      case 'low':
        summary.low++;
        break;
      case 'charging':
        summary.charging++;
        break;
      case 'unknown':
        summary.unknown++;
        break;
      default:
        summary.ok++;
        break;
    }
    if (item.confidence !== 'none') summary.predicted++;
    // A device on the charger isn't going to need new batteries, however steep
    // its recent discharge looked.
    if (item.daysRemaining !== null && item.status !== 'charging') {
      if (item.daysRemaining <= 30) summary.replacingThisMonth++;
      if (item.daysRemaining <= urgentDays) summary.urgent++;
    }
    if (!summary.mostUrgent || item.urgency > summary.mostUrgent.urgency) {
      summary.mostUrgent = item;
    }
  }

  if (summary.mostUrgent && summary.mostUrgent.urgency <= 0) summary.mostUrgent = null;
  return summary;
}

/**
 * Buckets devices by area, preserving the incoming order inside each bucket.
 * Devices with no area land in a trailing `null` group.
 */
export function groupByArea(
  list: readonly BatteryAnalysis[]
): Array<{ areaId: string | null; areaName: string | null; items: BatteryAnalysis[] }> {
  const groups = new Map<
    string,
    { areaId: string | null; areaName: string | null; items: BatteryAnalysis[] }
  >();
  for (const item of list) {
    const key = item.areaId || '__none__';
    let group = groups.get(key);
    if (!group) {
      group = {
        areaId: item.areaId || null,
        areaName: item.areaName || null,
        items: [],
      };
      groups.set(key, group);
    }
    group.items.push(item);
  }
  return [...groups.values()].sort((a, b) => {
    if (a.areaId === null) return 1;
    if (b.areaId === null) return -1;
    return (a.areaName || '').localeCompare(b.areaName || '', undefined, { sensitivity: 'base' });
  });
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers (still string-free so the module owns localization)    */
/* -------------------------------------------------------------------------- */

export function describeEta(
  analysis: BatteryAnalysis,
  options?: { predict?: boolean | undefined }
): EtaDescriptor {
  if (options?.predict === false) return { kind: 'off' };
  if (analysis.status === 'charging') return { kind: 'charging' };
  if (analysis.confidence === 'none' || analysis.daysRemaining === null) {
    return { kind: 'gathering' };
  }
  const days = analysis.daysRemaining;
  if (days <= 0.75) return { kind: 'now' };
  if (days < 14) return { kind: 'days', value: Math.max(1, Math.round(days)) };
  if (days < 60) return { kind: 'weeks', value: Math.max(2, Math.round(days / 7)) };
  if (days < 183) return { kind: 'months', value: Math.max(2, Math.round(days / 30.44)) };
  return { kind: 'beyond' };
}

/** Rounded drain rate for display, or null when there's nothing trustworthy to show. */
export function formatRatePerDay(analysis: BatteryAnalysis): number | null {
  if (analysis.ratePerDay === null || analysis.confidence === 'none') return null;
  const rate = analysis.ratePerDay;
  return rate >= 10 ? Math.round(rate) : Math.round(rate * 10) / 10;
}
