/**
 * Integration-agnostic helpers for the free Irrigation module.
 *
 * Everything here is pure (no Lit, no DOM) so it can be unit tested: preset
 * detection, service-call building, running / remaining-time parsing, zone
 * auto-suggestion, rain-delay control and soil-moisture banding.
 *
 * Timed runs are always handed to Home Assistant (an integration service, a
 * script or a user-supplied action), so a run keeps going and stops on time
 * even when the dashboard is closed. The card never runs its own timer to turn
 * a zone off and never sequences zones client-side.
 */

import type { HomeAssistant } from '../ha/types';
import type {
  IrrigationModule,
  IrrigationServicePreset,
  IrrigationZone,
} from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IrrigationServiceCall {
  domain: string;
  service: string;
  data: Record<string, unknown>;
}

/** The parts of a hass state object these helpers read. */
export interface IrrigationStateLike {
  state: string;
  attributes?: Record<string, unknown> | undefined;
  last_changed?: string | undefined;
}

/** A concrete preset (never 'auto'). */
export type IrrigationConcretePreset = Exclude<IrrigationServicePreset, 'auto'>;

/** How the Run button behaves for one zone once the config is resolved. */
export interface IrrigationRunPlan {
  /** toggle = on/off; service = preset timed run; custom = user action; none = read-only. */
  kind: 'toggle' | 'service' | 'custom' | 'none';
  preset: IrrigationConcretePreset;
  /** True when HA itself ends the run after the requested duration. */
  timed: boolean;
}

export type IrrigationZoneStatus = 'running' | 'queued' | 'idle' | 'unavailable';

export type MoistureBand = 'dry' | 'ok' | 'wet';

export type RainDelayKind = 'toggle' | 'number' | 'select' | 'readonly';

interface RegistryEntityRow {
  platform?: string | null | undefined;
  device_id?: string | null | undefined;
  disabled_by?: string | null | undefined;
  hidden_by?: string | null | undefined;
}

interface RegistryDeviceRow {
  name?: string | null | undefined;
  name_by_user?: string | null | undefined;
}

interface HassRegistries {
  entities?: Record<string, RegistryEntityRow | undefined> | undefined;
  devices?: Record<string, RegistryDeviceRow | undefined> | undefined;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Words that mark an entity as a likely irrigation zone. */
export const IRRIGATION_KEYWORDS = [
  'irrigation',
  'sprinkler',
  'zone',
  'valve',
  'station',
  'drip',
  'watering',
] as const;

/** Integrations (entity registry platforms) whose entities are irrigation zones. */
const PLATFORM_PRESETS: Record<string, IrrigationConcretePreset> = {
  opensprinkler: 'opensprinkler',
  rachio: 'rachio',
  irrigation_unlimited: 'irrigation_unlimited',
  bhyve: 'bhyve',
};

/** Domains the card can switch with plain on/off. */
const TOGGLE_DOMAINS = new Set(['switch', 'input_boolean', 'valve', 'light', 'fan']);

/** Domains offered as zone entities in the editor. */
export const ZONE_ENTITY_DOMAINS = ['switch', 'valve', 'binary_sensor', 'sensor', 'input_boolean'];

const RUNNING_STATES = new Set([
  'on',
  'open',
  'opening',
  'running',
  'watering',
  'irrigating',
  'active',
  // OpenSprinkler station status sensor states while a station waters.
  'manual',
  'program',
  'once_program',
  'master_engaged',
]);

const QUEUED_STATES = new Set(['waiting', 'queued', 'pending', 'scheduled']);

const UNAVAILABLE_STATES = new Set(['unavailable', 'unknown']);

/** Run-duration steps (minutes) for the in-card stepper. */
export const DURATION_STEPS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180, 240];

export const DEFAULT_DURATION_MINUTES = 10;
export const DEFAULT_MOISTURE_DRY = 30;
export const DEFAULT_MOISTURE_WET = 70;

/** Quick rain-delay choices (hours) for number entities. */
export const RAIN_DELAY_HOURS = [24, 48, 72];

// ─── Small utilities ──────────────────────────────────────────────────────────

export function entityDomain(entityId: string | undefined): string {
  if (!entityId) return '';
  const i = entityId.indexOf('.');
  return i > 0 ? entityId.slice(0, i) : '';
}

function registries(hass: HomeAssistant | undefined): HassRegistries {
  return (hass || {}) as unknown as HassRegistries;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** "domain.service" → parts, or null when malformed. */
export function splitService(raw: string | undefined): { domain: string; service: string } | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const m = /^([a-z0-9_]+)\.([a-z0-9_]+)$/i.exec(trimmed);
  if (!m || !m[1] || !m[2]) return null;
  return { domain: m[1], service: m[2] };
}

/** Seconds → "HH:MM:SS" (used by Irrigation Unlimited's `time` field). */
export function toHms(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Seconds → compact countdown: "1:05:03", "5:03", "0:42". */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/**
 * Parse a duration string: "H:MM:SS", "MM:SS", "1 day, 0:05:00" (Python
 * timedelta), or ISO 8601 "PT1H5M". Returns seconds or null.
 */
export function parseDurationString(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;

  const iso = /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i.exec(
    text
  );
  if (iso && text.length > 1 && text.toUpperCase() !== 'PT') {
    const [, d, h, m, s] = iso;
    return (
      Number(d || 0) * 86400 + Number(h || 0) * 3600 + Number(m || 0) * 60 + Number(s || 0)
    );
  }

  let days = 0;
  let rest = text;
  const dayMatch = /^(\d+)\s+days?,?\s*(.*)$/i.exec(text);
  if (dayMatch) {
    days = Number(dayMatch[1]);
    rest = dayMatch[2] || '0:00:00';
  }
  const parts = rest.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map(p => Number(p));
  if (nums.some(n => !Number.isFinite(n) || n < 0)) return null;
  const [a = 0, b = 0, c = 0] = nums;
  const seconds = parts.length === 3 ? a * 3600 + b * 60 + c : a * 60 + b;
  return days * 86400 + seconds;
}

// ─── Preset detection ─────────────────────────────────────────────────────────

/** Integration platform of an entity, from the entity registry when the frontend has it. */
export function entityPlatform(hass: HomeAssistant | undefined, entityId: string): string {
  const row = registries(hass).entities?.[entityId];
  return typeof row?.platform === 'string' ? row.platform : '';
}

/** Best-guess integration preset for a zone entity. */
export function detectPreset(
  hass: HomeAssistant | undefined,
  entityId: string
): IrrigationConcretePreset {
  const platform = entityPlatform(hass, entityId);
  const fromPlatform = PLATFORM_PRESETS[platform];
  if (fromPlatform) return fromPlatform;
  if (/^binary_sensor\.irrigation_unlimited_/.test(entityId)) return 'irrigation_unlimited';
  if (entityDomain(entityId) === 'valve') return 'valve';
  return 'switch';
}

/** Presets whose start service takes a duration (HA ends the run, not the browser). */
export function presetSupportsDuration(preset: IrrigationConcretePreset): boolean {
  return (
    preset === 'opensprinkler' ||
    preset === 'rachio' ||
    preset === 'irrigation_unlimited' ||
    preset === 'bhyve'
  );
}

/** Resolve a zone's run mode + preset into what the Run button actually does. */
export function resolveRunPlan(
  zone: IrrigationZone,
  hass: HomeAssistant | undefined
): IrrigationRunPlan {
  const entityId = zone.entity || '';
  const detected = detectPreset(hass, entityId);
  const mode = zone.run_mode || 'auto';
  const canToggle = TOGGLE_DOMAINS.has(entityDomain(entityId));

  if (mode === 'custom') {
    return { kind: 'custom', preset: detected, timed: true };
  }
  if (mode === 'toggle') {
    return { kind: canToggle ? 'toggle' : 'none', preset: detected, timed: false };
  }
  const preset: IrrigationConcretePreset =
    mode === 'service' && zone.preset && zone.preset !== 'auto' ? zone.preset : detected;
  if (presetSupportsDuration(preset)) {
    return { kind: 'service', preset, timed: true };
  }
  if (preset === 'valve' || canToggle) {
    return { kind: 'toggle', preset, timed: false };
  }
  return { kind: 'none', preset, timed: false };
}

// ─── Placeholder substitution ─────────────────────────────────────────────────

export interface DurationVariables {
  entity_id: string;
  /** Minutes. */
  duration: number;
  duration_minutes: number;
  duration_seconds: number;
  /** "HH:MM:SS". */
  duration_hms: string;
}

export function durationVariables(entityId: string, minutes: number): DurationVariables {
  const safe = Math.max(0, Number.isFinite(minutes) ? minutes : 0);
  const seconds = Math.round(safe * 60);
  return {
    entity_id: entityId,
    duration: safe,
    duration_minutes: safe,
    duration_seconds: seconds,
    duration_hms: toHms(seconds),
  };
}

const PLACEHOLDER_RE = /\{\{\s*([a-z_]+)\s*\}\}/g;
const WHOLE_PLACEHOLDER_RE = /^\{\{\s*([a-z_]+)\s*\}\}$/;

/**
 * Replace `{{ duration }}`, `{{ duration_seconds }}`, `{{ duration_minutes }}`,
 * `{{ duration_hms }}` and `{{ entity_id }}` in every string of `data`.
 * A string that is only a numeric placeholder becomes a number, so
 * `duration: "{{ duration }}"` sends `duration: 10`, not `"10"`.
 */
export function substitutePlaceholders(value: unknown, vars: DurationVariables): unknown {
  const table = vars as unknown as Record<string, string | number>;
  if (typeof value === 'string') {
    const whole = WHOLE_PLACEHOLDER_RE.exec(value.trim());
    if (whole && whole[1] && whole[1] in table) return table[whole[1]];
    return value.replace(PLACEHOLDER_RE, (match, name: string) =>
      name in table ? String(table[name]) : match
    );
  }
  if (Array.isArray(value)) return value.map(v => substitutePlaceholders(v, vars));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = substitutePlaceholders(v, vars);
    }
    return out;
  }
  return value;
}

/** Default data offered when a zone switches to a custom action. */
export function defaultCustomData(): Record<string, unknown> {
  return { entity_id: '{{ entity_id }}', duration: '{{ duration }}' };
}

// ─── Service calls ────────────────────────────────────────────────────────────

function toggleCall(entityId: string, on: boolean): IrrigationServiceCall | null {
  const domain = entityDomain(entityId);
  if (!entityId || !TOGGLE_DOMAINS.has(domain)) return null;
  if (domain === 'valve') {
    return { domain: 'valve', service: on ? 'open_valve' : 'close_valve', data: { entity_id: entityId } };
  }
  return {
    domain: 'homeassistant',
    service: on ? 'turn_on' : 'turn_off',
    data: { entity_id: entityId },
  };
}

/**
 * Timed start for a known integration.
 *
 * Service names / fields come from each integration's services.yaml as of
 * writing. Where an integration renamed things across versions the preset
 * keeps the most widely deployed name; users on another version can switch the
 * zone to "Custom action" and type the exact service.
 */
export function presetStartCall(
  preset: IrrigationConcretePreset,
  entityId: string,
  minutes: number
): IrrigationServiceCall | null {
  const vars = durationVariables(entityId, minutes);
  switch (preset) {
    case 'opensprinkler':
      // hass-opensprinkler (custom integration): `opensprinkler.run_station`
      // with `run_seconds`. Newer releases also offer the unified
      // `opensprinkler.run` with the same fields; run_station is kept because
      // it exists on both old and current installs. Target is the station
      // entity (switch / binary_sensor / status sensor of that station).
      return {
        domain: 'opensprinkler',
        service: 'run_station',
        data: { entity_id: entityId, run_seconds: vars.duration_seconds },
      };
    case 'rachio':
      // Core Rachio integration: `rachio.start_watering`, duration in minutes,
      // targeting the zone switch. The controller ends the run itself.
      return {
        domain: 'rachio',
        service: 'start_watering',
        data: { entity_id: entityId, duration: Math.max(1, Math.round(vars.duration)) },
      };
    case 'irrigation_unlimited':
      // Irrigation Unlimited: `irrigation_unlimited.manual_run` with `time`
      // as "HH:MM:SS", targeting the zone binary_sensor (…_c1_z1).
      return {
        domain: 'irrigation_unlimited',
        service: 'manual_run',
        data: { entity_id: entityId, time: vars.duration_hms },
      };
    case 'bhyve':
      // Orbit B-hyve (custom integration): `bhyve.start_watering` with
      // `minutes`, targeting the zone switch. Assumed from the integration's
      // README; override with a custom action if your version differs.
      return {
        domain: 'bhyve',
        service: 'start_watering',
        data: { entity_id: entityId, minutes: Math.max(1, Math.round(vars.duration)) },
      };
    default:
      return null;
  }
}

/** Stop for a known integration (falls back to turning the entity off). */
export function presetStopCall(
  preset: IrrigationConcretePreset,
  entityId: string
): IrrigationServiceCall | null {
  switch (preset) {
    case 'opensprinkler':
      // hass-opensprinkler: `opensprinkler.stop` on the station entity.
      return { domain: 'opensprinkler', service: 'stop', data: { entity_id: entityId } };
    case 'irrigation_unlimited':
      // Irrigation Unlimited: `irrigation_unlimited.cancel` ends the current run.
      return { domain: 'irrigation_unlimited', service: 'cancel', data: { entity_id: entityId } };
    case 'bhyve':
      // Assumed counterpart of bhyve.start_watering.
      return { domain: 'bhyve', service: 'stop_watering', data: { entity_id: entityId } };
    default:
      // Rachio zone switches, plain switches and valves stop by turning off.
      return toggleCall(entityId, false);
  }
}

function customCall(
  service: string | undefined,
  data: Record<string, unknown> | undefined,
  vars: DurationVariables
): IrrigationServiceCall | null {
  const parts = splitService(service);
  if (!parts) return null;
  const resolved = substitutePlaceholders(data || {}, vars);
  return {
    domain: parts.domain,
    service: parts.service,
    data:
      resolved && typeof resolved === 'object' && !Array.isArray(resolved)
        ? (resolved as Record<string, unknown>)
        : {},
  };
}

/** The service call the Run button makes, or null when the zone cannot be started. */
export function buildStartCall(
  zone: IrrigationZone,
  plan: IrrigationRunPlan,
  minutes: number
): IrrigationServiceCall | null {
  const entityId = zone.entity || '';
  if (plan.kind === 'custom') {
    return customCall(zone.custom_service, zone.custom_data, durationVariables(entityId, minutes));
  }
  if (plan.kind === 'service') return presetStartCall(plan.preset, entityId, minutes);
  if (plan.kind === 'toggle') return toggleCall(entityId, true);
  return null;
}

/** The service call the Stop button makes, or null when the zone cannot be stopped. */
export function buildStopCall(
  zone: IrrigationZone,
  plan: IrrigationRunPlan
): IrrigationServiceCall | null {
  const entityId = zone.entity || '';
  if (plan.kind === 'custom') {
    if (zone.custom_stop_service) {
      return customCall(
        zone.custom_stop_service,
        zone.custom_stop_data || { entity_id: '{{ entity_id }}' },
        durationVariables(entityId, 0)
      );
    }
    return presetStopCall(plan.preset, entityId);
  }
  if (plan.kind === 'service') return presetStopCall(plan.preset, entityId);
  if (plan.kind === 'toggle') return toggleCall(entityId, false);
  return null;
}

/** Run-all through a script or service (never a client-side sequence). */
export function buildRunAllCall(
  m: IrrigationModule,
  minutes: number
): IrrigationServiceCall | null {
  const mode = m.run_all_mode || 'none';
  if (mode === 'script') {
    const script = m.run_all_entity || '';
    if (entityDomain(script) !== 'script') return null;
    // Passed as script variables so a script can use {{ duration }} itself.
    const vars = durationVariables(script, minutes);
    return {
      domain: 'script',
      service: 'turn_on',
      data: {
        entity_id: script,
        variables: { duration: vars.duration, duration_seconds: vars.duration_seconds },
      },
    };
  }
  if (mode === 'service') {
    return customCall(m.run_all_service, m.run_all_data, durationVariables('', minutes));
  }
  return null;
}

// ─── State parsing ────────────────────────────────────────────────────────────

export function zoneStatus(stateObj: IrrigationStateLike | undefined): IrrigationZoneStatus {
  if (!stateObj) return 'unavailable';
  const s = String(stateObj.state || '').toLowerCase();
  if (UNAVAILABLE_STATES.has(s)) return 'unavailable';
  if (RUNNING_STATES.has(s)) return 'running';
  if (QUEUED_STATES.has(s)) return 'queued';
  return 'idle';
}

const SECONDS_KEYS = [
  'remaining_seconds',
  'seconds_remaining',
  'time_remaining_seconds',
  'run_seconds_remaining',
];
const MINUTES_KEYS = ['remaining_minutes', 'minutes_remaining', 'time_remaining_minutes'];
const GENERIC_KEYS = ['time_remaining', 'remaining_time', 'remaining', 'remaining_duration'];
const END_KEYS = ['end_time', 'ends_at', 'end_at', 'finish_time', 'stop_time', 'end'];

/**
 * Remaining seconds from the zone entity's own attributes, when the
 * integration exposes them (e.g. Irrigation Unlimited `time_remaining`, an
 * `end_time` timestamp). Returns null when nothing usable is present.
 */
export function remainingFromAttributes(
  attrs: Record<string, unknown> | undefined,
  nowMs: number
): number | null {
  if (!attrs) return null;
  for (const key of SECONDS_KEYS) {
    const n = toNumber(attrs[key]);
    if (n !== null && n >= 0) return n;
  }
  for (const key of MINUTES_KEYS) {
    const n = toNumber(attrs[key]);
    if (n !== null && n >= 0) return n * 60;
  }
  for (const key of GENERIC_KEYS) {
    const raw = attrs[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const n = toNumber(raw);
    if (n !== null && n >= 0) return n;
    if (typeof raw === 'string') {
      const parsed = parseDurationString(raw);
      if (parsed !== null) return parsed;
    }
  }
  for (const key of END_KEYS) {
    const raw = attrs[key];
    if (typeof raw !== 'string' || !raw) continue;
    const t = Date.parse(raw);
    if (Number.isFinite(t)) return Math.max(0, (t - nowMs) / 1000);
  }
  return null;
}

/** Remaining seconds from a dedicated sensor (seconds / minutes / hours / timestamp / H:MM:SS). */
export function remainingFromSensor(
  stateObj: IrrigationStateLike | undefined,
  nowMs: number
): number | null {
  if (!stateObj) return null;
  const raw = String(stateObj.state || '');
  if (!raw || UNAVAILABLE_STATES.has(raw.toLowerCase())) return null;
  const attrs = stateObj.attributes || {};
  if (attrs.device_class === 'timestamp' || /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const t = Date.parse(raw);
    return Number.isFinite(t) ? Math.max(0, (t - nowMs) / 1000) : null;
  }
  const n = toNumber(raw);
  if (n !== null) {
    const unit = String(attrs.unit_of_measurement || '').toLowerCase();
    if (unit === 'h' || unit === 'hr' || unit === 'hours') return n * 3600;
    if (unit === 's' || unit === 'sec' || unit === 'seconds') return n;
    // Minutes is the common irrigation unit; also the default for bare numbers.
    return n * 60;
  }
  return parseDurationString(raw);
}

/** A run this browser asked for — only used to estimate the countdown. */
export interface RunRequest {
  durationSeconds: number;
  requestedAt: number;
}

/**
 * Estimated remaining seconds: start time (the later of when we asked and
 * when the entity turned on) plus the requested duration, minus now.
 */
export function estimateRemaining(
  request: RunRequest | undefined,
  lastChanged: string | undefined,
  nowMs: number
): number | null {
  if (!request || !(request.durationSeconds > 0)) return null;
  const changed = lastChanged ? Date.parse(lastChanged) : NaN;
  // Ignore a last_changed from long before our request (entity was already on).
  const start =
    Number.isFinite(changed) && changed >= request.requestedAt - 5000 ? changed : request.requestedAt;
  return Math.max(0, (start + request.durationSeconds * 1000 - nowMs) / 1000);
}

/** Seconds since the entity last changed state (for "running for …"). */
export function elapsedSince(lastChanged: string | undefined, nowMs: number): number | null {
  if (!lastChanged) return null;
  const t = Date.parse(lastChanged);
  return Number.isFinite(t) ? Math.max(0, (nowMs - t) / 1000) : null;
}

// ─── Duration stepper ─────────────────────────────────────────────────────────

export function stepDuration(current: number, direction: 1 | -1): number {
  const cur = Number.isFinite(current) && current > 0 ? current : DEFAULT_DURATION_MINUTES;
  if (direction > 0) {
    const next = DURATION_STEPS.find(s => s > cur);
    return next ?? cur;
  }
  let prev: number | undefined;
  for (const s of DURATION_STEPS) {
    if (s < cur) prev = s;
  }
  return prev ?? cur;
}

// ─── Soil moisture ────────────────────────────────────────────────────────────

export function moistureBand(value: number, dry: number, wet: number): MoistureBand {
  const lo = Math.min(dry, wet);
  const hi = Math.max(dry, wet);
  if (value < lo) return 'dry';
  if (value > hi) return 'wet';
  return 'ok';
}

// ─── Rain delay / rain sensor ─────────────────────────────────────────────────

export function rainDelayKind(entityId: string | undefined): RainDelayKind {
  const d = entityDomain(entityId);
  if (d === 'switch' || d === 'input_boolean') return 'toggle';
  if (d === 'number' || d === 'input_number') return 'number';
  if (d === 'select' || d === 'input_select') return 'select';
  return 'readonly';
}

/** True when a rain delay is currently in effect. */
export function isRainDelayActive(
  entityId: string | undefined,
  stateObj: IrrigationStateLike | undefined
): boolean {
  if (!entityId || !stateObj) return false;
  const s = String(stateObj.state || '').toLowerCase();
  if (UNAVAILABLE_STATES.has(s)) return false;
  const kind = rainDelayKind(entityId);
  if (kind === 'number') return (toNumber(stateObj.state) ?? 0) > 0;
  if (kind === 'select') return !['off', 'none', '0', 'disabled', 'no delay', ''].includes(s);
  if (/^\d{4}-\d{2}-\d{2}T/.test(stateObj.state)) {
    const t = Date.parse(stateObj.state);
    return Number.isFinite(t) && t > Date.now();
  }
  return s === 'on' || s === 'true' || s === 'active' || (toNumber(s) ?? 0) > 0;
}

/** Service call that sets a rain delay. `hours` = 0 clears it. Number entities are clamped. */
export function buildRainDelayCall(
  entityId: string,
  stateObj: IrrigationStateLike | undefined,
  hours: number
): IrrigationServiceCall | null {
  const kind = rainDelayKind(entityId);
  const domain = entityDomain(entityId);
  if (kind === 'toggle') {
    return {
      domain: 'homeassistant',
      service: hours > 0 ? 'turn_on' : 'turn_off',
      data: { entity_id: entityId },
    };
  }
  if (kind === 'number') {
    const attrs = stateObj?.attributes || {};
    const min = toNumber(attrs.min);
    const max = toNumber(attrs.max);
    let value = hours;
    if (min !== null) value = Math.max(min, value);
    if (max !== null) value = Math.min(max, value);
    return { domain, service: 'set_value', data: { entity_id: entityId, value } };
  }
  return null;
}

export function buildSelectOptionCall(entityId: string, option: string): IrrigationServiceCall {
  return {
    domain: entityDomain(entityId),
    service: 'select_option',
    data: { entity_id: entityId, option },
  };
}

/** True when a rain sensor / skip indicator says watering should be skipped. */
export function isRainSensorActive(stateObj: IrrigationStateLike | undefined): boolean {
  if (!stateObj) return false;
  const s = String(stateObj.state || '').toLowerCase();
  if (UNAVAILABLE_STATES.has(s)) return false;
  if (['on', 'true', 'wet', 'rain', 'raining', 'rainy', 'skip', 'skipped', 'yes'].includes(s)) {
    return true;
  }
  const n = toNumber(s);
  return n !== null && n > 0;
}

// ─── Zone auto-suggestion ─────────────────────────────────────────────────────

function deviceName(hass: HomeAssistant | undefined, entityId: string): string {
  const reg = registries(hass);
  const deviceId = reg.entities?.[entityId]?.device_id;
  if (!deviceId) return '';
  const dev = reg.devices?.[deviceId];
  return String(dev?.name_by_user || dev?.name || '');
}

/**
 * Entities that look like irrigation zones: switch / valve entities whose id,
 * friendly name or device name mentions irrigation words, plus zone entities
 * of the known irrigation integrations.
 *
 * OpenSprinkler's `switch.*_station_enabled` switches enable / disable a
 * station (they do not water), so they are skipped; its station
 * `binary_sensor.*_station_running` entities are suggested instead and run via
 * the OpenSprinkler preset.
 */
export function suggestZoneEntities(
  hass: HomeAssistant | undefined,
  exclude: string[] = [],
  limit = 24
): string[] {
  const states = hass?.states;
  if (!states) return [];
  const skip = new Set(exclude);
  const reg = registries(hass);
  const out: string[] = [];
  for (const entityId of Object.keys(states).sort()) {
    if (skip.has(entityId)) continue;
    const domain = entityDomain(entityId);
    const row = reg.entities?.[entityId];
    if (row?.disabled_by || row?.hidden_by) continue;
    const platform = entityPlatform(hass, entityId);
    const preset = PLATFORM_PRESETS[platform];

    let match = false;
    if (preset === 'opensprinkler') {
      match = domain === 'binary_sensor' && /_station_running$/.test(entityId);
    } else if (preset === 'irrigation_unlimited' || /^binary_sensor\.irrigation_unlimited_/.test(entityId)) {
      // Zone sensors look like …_c1_z1; controllers (…_c1_m) are not zones.
      match = domain === 'binary_sensor' && /_c\d+_z\d+$/.test(entityId);
    } else if (preset === 'rachio' || preset === 'bhyve') {
      match = domain === 'switch' && !/(rain_delay|standby|schedule|smart_watering)/.test(entityId);
    } else if (domain === 'switch' || domain === 'valve') {
      const st = states[entityId];
      const haystack = [
        entityId,
        String(st?.attributes?.friendly_name || ''),
        deviceName(hass, entityId),
      ]
        .join(' ')
        .toLowerCase();
      match = IRRIGATION_KEYWORDS.some(k => haystack.includes(k));
    }
    if (match) out.push(entityId);
    if (out.length >= limit) break;
  }
  return out;
}

/** Stable-ish zone id for new zones. */
export function newZoneId(entityId: string): string {
  const slug = (entityId.split('.')[1] || 'zone').replace(/[^a-z0-9_]/gi, '').slice(0, 24);
  return `zone_${slug}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Reconcile the zones list with a new list of entity ids: keeps each existing
 * zone's settings (matched by entity), in the order of `entities`.
 */
export function reconcileZones(zones: IrrigationZone[], entities: string[]): IrrigationZone[] {
  const byEntity = new Map<string, IrrigationZone>();
  for (const z of zones) {
    if (z.entity && !byEntity.has(z.entity)) byEntity.set(z.entity, z);
  }
  const seen = new Set<string>();
  const out: IrrigationZone[] = [];
  for (const entity of entities) {
    if (!entity || seen.has(entity)) continue;
    seen.add(entity);
    out.push(byEntity.get(entity) || { id: newZoneId(entity), entity });
  }
  return out;
}
