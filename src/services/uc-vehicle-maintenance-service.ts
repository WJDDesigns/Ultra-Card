import { HomeAssistant } from 'custom-card-helpers';
import { VehicleMaintenanceModule, VehicleServiceItem } from '../types';
import { localize } from '../localize/localize';
import { ucRecordStore, type UcStoredRecord } from './uc-record-store';
import { ucHistoryService, toNumericSeries, type NumericPoint } from './uc-history-service';

/**
 * Vehicle Maintenance (Pro) — service interval math and log persistence.
 *
 * Two ideas carry this module. The first is that a service is due on whichever
 * axis arrives first: an oil change is "every 5,000 miles or 6 months", and the
 * one that lands sooner wins. Everything here computes both axes and reports
 * the more urgent one.
 *
 * The second is that the service log — persisted in a to-do list — is the
 * authority for when a service last happened. The module config carries
 * `last_distance` / `last_date` as a seed, but the moment the log has an entry
 * for a service, that entry wins. That is what lets "Mark serviced" behave
 * identically in the editor (where the module config can be written back) and
 * on a live dashboard (where it cannot).
 */

/** Namespace tag for records this module owns inside a shared to-do list. */
export const VEHICLE_MAINTENANCE_NS = 'vehicle_maintenance';

const MI_PER_KM = 0.621371;
const KM_PER_MI = 1.609344;
const MS_PER_DAY = 86400000;

/** A single entry written to the service log. */
export interface ServiceLogPayload {
  service_id: string;
  service_name: string;
  /** ISO date (YYYY-MM-DD) the service was performed. */
  at: string;
  odometer: number | null;
  cost: number | null;
  note?: string;
}

export type VehicleServiceLogEntry = UcStoredRecord<ServiceLogPayload>;

export interface ServiceStatus {
  item: VehicleServiceItem;
  /** Remaining distance until due; null when this service has no distance interval. */
  distanceRemaining: number | null;
  /** Remaining days until due; null when this service has no time interval. */
  daysRemaining: number | null;
  /** 0–1+ progress toward due, taking the *sooner* of the two axes. */
  progress: number | null;
  /** Which axis will trigger first. */
  drivenBy: 'distance' | 'time' | 'none';
  state: 'ok' | 'due_soon' | 'overdue' | 'unknown';
  /** Pre-formatted, e.g. "in 1,240 mi" / "overdue by 2 months". */
  dueLabel: string;
  nextDueDate: number | null;
}

/** Odometer read with enough provenance to explain itself in the editor. */
export interface OdometerReading {
  /** Value in the module's configured `distance_unit`, including `odometer_offset`. */
  value: number;
  /** Raw sensor value, before conversion and offset. */
  raw: number;
  /** Unit detected on the source entity, or null when it could not be determined. */
  sourceUnit: 'mi' | 'km' | null;
  /** Raw `unit_of_measurement` string as reported by the entity. */
  sourceUnitRaw: string;
  /** True when the source unit differed from the configured unit and was converted. */
  converted: boolean;
}

export interface DailyDistanceEstimate {
  /** Average distance covered per day, in the series' own unit. */
  perDay: number;
  /** How many days of history the estimate is based on. */
  days: number;
  /** How many usable samples were in the window. */
  samples: number;
}

/* -------------------------------------------------------------------------- */
/* Units                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Maps a `unit_of_measurement` string onto one of the two units this module
 * understands. Returns null for anything unrecognised so callers can fall back
 * to assuming the configured unit rather than converting on a guess.
 */
export function normalizeDistanceUnit(raw: string | undefined | null): 'mi' | 'km' | null {
  if (!raw) return null;
  const u = String(raw).trim().toLowerCase().replace(/\./g, '');
  if (u === 'mi' || u === 'mile' || u === 'miles') return 'mi';
  if (
    u === 'km' ||
    u === 'kilometer' ||
    u === 'kilometers' ||
    u === 'kilometre' ||
    u === 'kilometres'
  ) {
    return 'km';
  }
  return null;
}

/** Converts a distance between the two supported units. */
export function convertDistance(value: number, from: 'mi' | 'km', to: 'mi' | 'km'): number {
  if (from === to) return value;
  return from === 'km' ? value * MI_PER_KM : value * KM_PER_MI;
}

/* -------------------------------------------------------------------------- */
/* Odometer                                                                    */
/* -------------------------------------------------------------------------- */

const UNAVAILABLE = new Set(['unavailable', 'unknown', 'none', '', 'null']);

/**
 * Current odometer in the configured unit, including `odometer_offset`.
 *
 * The offset is applied *after* unit conversion so it always reads in the same
 * unit the user typed it in. Returns null when the entity is missing,
 * unavailable, or non-numeric — every caller degrades to time-only tracking
 * rather than showing a wrong number.
 *
 * @param odometerEntity Optional resolved entity id, for `$variable` indirection.
 */
export function readOdometer(
  hass: HomeAssistant | undefined,
  config: VehicleMaintenanceModule,
  odometerEntity?: string
): OdometerReading | null {
  const entityId = odometerEntity || config?.odometer_entity || '';
  if (!hass || !entityId) return null;

  const st = hass.states?.[entityId];
  if (!st) return null;
  if (UNAVAILABLE.has(String(st.state).trim().toLowerCase())) return null;

  const raw = Number(st.state);
  if (!Number.isFinite(raw)) return null;

  const target = config?.distance_unit === 'km' ? 'km' : 'mi';
  const sourceUnitRaw = String(st.attributes?.['unit_of_measurement'] ?? '');
  const sourceUnit = normalizeDistanceUnit(sourceUnitRaw);
  const converted = sourceUnit !== null && sourceUnit !== target;
  const inTargetUnit = converted ? convertDistance(raw, sourceUnit as 'mi' | 'km', target) : raw;
  const offset = Number(config?.odometer_offset) || 0;

  return {
    value: inTargetUnit + offset,
    raw,
    sourceUnit,
    sourceUnitRaw,
    converted,
  };
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                       */
/* -------------------------------------------------------------------------- */

/** Parses `YYYY-MM-DD` (or a full ISO stamp) into local-midnight epoch ms. */
export function parseIsoDate(value: string | undefined | null): number | null {
  if (!value) return null;
  const text = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (!match) {
    const fallback = new Date(text).getTime();
    return Number.isFinite(fallback) ? fallback : null;
  }
  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const stamp = new Date(y, mo - 1, d).getTime();
  return Number.isFinite(stamp) ? stamp : null;
}

/** Local `YYYY-MM-DD` for an epoch timestamp (defaults to now). */
export function toIsoDate(stamp: number = Date.now()): string {
  const d = new Date(stamp);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mo}-${day}`;
}

/**
 * Adds whole months, clamping to the last valid day so 31 Jan + 1 month lands
 * on 28/29 Feb rather than rolling into March.
 */
export function addMonths(stamp: number, months: number): number {
  const d = new Date(stamp);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d.getTime();
}

/* -------------------------------------------------------------------------- */
/* Baselines: config seed vs. log truth                                        */
/* -------------------------------------------------------------------------- */

export interface ServiceBaseline {
  lastDistance: number | null;
  lastDate: string | null;
  /** True when the values came from a log entry rather than the module config. */
  fromLog: boolean;
}

/**
 * Resolves when a service last happened.
 *
 * The most recent log entry for the service wins, because that is the record
 * both the editor and a read-only dashboard can see. `last_distance` /
 * `last_date` on the config act as the seed for services that have never been
 * logged, and as a fallback for the odometer when a log entry was written
 * without one.
 */
export function resolveServiceBaseline(
  item: VehicleServiceItem,
  log: VehicleServiceLogEntry[] | undefined
): ServiceBaseline {
  const seedDistance = Number.isFinite(Number(item.last_distance))
    ? Number(item.last_distance)
    : null;
  const seedDate = item.last_date ? String(item.last_date) : null;

  const newest = latestLogEntryFor(item.id, log);
  if (!newest) {
    return { lastDistance: seedDistance, lastDate: seedDate, fromLog: false };
  }

  const loggedDate = newest.payload?.at ? String(newest.payload.at).slice(0, 10) : null;
  const loggedOdometer = Number.isFinite(Number(newest.payload?.odometer))
    ? Number(newest.payload.odometer)
    : null;

  // A logged service with no odometer still moves the time axis forward; the
  // distance axis keeps whatever baseline it had.
  return {
    lastDistance: loggedOdometer ?? seedDistance,
    lastDate: loggedDate ?? seedDate,
    fromLog: true,
  };
}

/** Newest log entry belonging to a service, or null. */
export function latestLogEntryFor(
  serviceId: string,
  log: VehicleServiceLogEntry[] | undefined
): VehicleServiceLogEntry | null {
  if (!log || log.length === 0 || !serviceId) return null;
  let best: VehicleServiceLogEntry | null = null;
  let bestStamp = -Infinity;
  for (const entry of log) {
    if (entry.payload?.service_id !== serviceId) continue;
    const stamp = parseIsoDate(entry.payload?.at) ?? -Infinity;
    if (stamp >= bestStamp) {
      bestStamp = stamp;
      best = entry;
    }
  }
  return best;
}

/**
 * Returns a copy of `services` with `last_distance` / `last_date` replaced by
 * the log-derived baseline where one exists. Feed the result to
 * {@link computeStatuses} so both the editor and the dashboard agree.
 */
export function applyBaselines(
  services: VehicleServiceItem[] | undefined,
  log: VehicleServiceLogEntry[] | undefined
): VehicleServiceItem[] {
  if (!Array.isArray(services)) return [];
  if (!log || log.length === 0) return services;
  return services.map(item => {
    const baseline = resolveServiceBaseline(item, log);
    if (!baseline.fromLog) return item;
    return {
      ...item,
      last_distance: baseline.lastDistance ?? undefined,
      last_date: baseline.lastDate ?? undefined,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Interval math                                                               */
/* -------------------------------------------------------------------------- */

function positiveOrNull(value: number | undefined): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Computes due status for every service, taking the more urgent of the
 * distance and time axes.
 *
 * `odometer` may be null (no odometer configured, or unavailable) — distance
 * axes then report null and the module falls back to time-only tracking.
 */
export function computeStatuses(
  services: VehicleServiceItem[] | undefined,
  odometer: number | null,
  now: number,
  config: VehicleMaintenanceModule,
  lang: string = 'en'
): ServiceStatus[] {
  if (!Array.isArray(services)) return [];
  const unit = config?.distance_unit === 'km' ? 'km' : 'mi';
  const dueSoonDistance = Number.isFinite(Number(config?.due_soon_distance))
    ? Number(config.due_soon_distance)
    : 500;
  const dueSoonDays = Number.isFinite(Number(config?.due_soon_days))
    ? Number(config.due_soon_days)
    : 14;

  return services.map(item => {
    const intervalDistance = positiveOrNull(item.interval_distance);
    const intervalMonths = positiveOrNull(item.interval_months);
    const lastDistance = Number.isFinite(Number(item.last_distance))
      ? Number(item.last_distance)
      : null;
    const lastDateMs = parseIsoDate(item.last_date);

    // ── Distance axis ────────────────────────────────────────────────────
    let distanceRemaining: number | null = null;
    let distanceProgress: number | null = null;
    if (intervalDistance !== null && odometer !== null && lastDistance !== null) {
      const dueAt = lastDistance + intervalDistance;
      distanceRemaining = dueAt - odometer;
      distanceProgress = (odometer - lastDistance) / intervalDistance;
    }

    // ── Time axis ────────────────────────────────────────────────────────
    let daysRemaining: number | null = null;
    let timeProgress: number | null = null;
    let nextDueDate: number | null = null;
    if (intervalMonths !== null && lastDateMs !== null) {
      nextDueDate = addMonths(lastDateMs, intervalMonths);
      daysRemaining = Math.ceil((nextDueDate - now) / MS_PER_DAY);
      const span = nextDueDate - lastDateMs;
      timeProgress = span > 0 ? (now - lastDateMs) / span : 1;
    }

    // ── Whichever arrives first ──────────────────────────────────────────
    let drivenBy: 'distance' | 'time' | 'none' = 'none';
    let progress: number | null = null;
    if (distanceProgress !== null && timeProgress !== null) {
      drivenBy = distanceProgress >= timeProgress ? 'distance' : 'time';
      progress = Math.max(distanceProgress, timeProgress);
    } else if (distanceProgress !== null) {
      drivenBy = 'distance';
      progress = distanceProgress;
    } else if (timeProgress !== null) {
      drivenBy = 'time';
      progress = timeProgress;
    }

    let state: ServiceStatus['state'] = 'unknown';
    if (drivenBy !== 'none') {
      const overdue =
        (distanceRemaining !== null && distanceRemaining <= 0) ||
        (daysRemaining !== null && daysRemaining <= 0);
      const dueSoon =
        (distanceRemaining !== null && distanceRemaining <= dueSoonDistance) ||
        (daysRemaining !== null && daysRemaining <= dueSoonDays);
      state = overdue ? 'overdue' : dueSoon ? 'due_soon' : 'ok';
    }

    const dueLabel = formatDueLabel(
      { drivenBy, state, distanceRemaining, daysRemaining },
      unit,
      lang
    );

    return {
      item,
      distanceRemaining,
      daysRemaining,
      progress,
      drivenBy,
      state,
      dueLabel,
      nextDueDate,
    };
  });
}

/** Sorts statuses by urgency: overdue first, then closest to due. */
export function sortByUrgency(statuses: ServiceStatus[]): ServiceStatus[] {
  const rank: Record<ServiceStatus['state'], number> = {
    overdue: 0,
    due_soon: 1,
    ok: 2,
    unknown: 3,
  };
  return [...statuses].sort((a, b) => {
    if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state];
    const pa = a.progress ?? -1;
    const pb = b.progress ?? -1;
    return pb - pa;
  });
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                      */
/* -------------------------------------------------------------------------- */

function formatNumber(value: number, lang: string, maximumFractionDigits = 0): string {
  try {
    return new Intl.NumberFormat(lang, { maximumFractionDigits }).format(value);
  } catch {
    return String(Math.round(value));
  }
}

function fill(template: string, values: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{${key}}`).join(value);
  }
  return out;
}

/**
 * Human due text such as "in 1,240 mi" or "overdue by 2 months". Distance wins
 * whenever it is the driving axis, because that is the number an owner checks.
 */
export function formatDueLabel(
  status: Pick<ServiceStatus, 'drivenBy' | 'state' | 'distanceRemaining' | 'daysRemaining'>,
  unit: 'mi' | 'km',
  lang: string
): string {
  if (status.drivenBy === 'none') {
    return localize('editor.vehicle_maintenance.due_unknown', lang, 'No history yet');
  }

  const unitLabel =
    unit === 'km'
      ? localize('editor.vehicle_maintenance.unit_km', lang, 'km')
      : localize('editor.vehicle_maintenance.unit_mi', lang, 'mi');

  // Overdue reports whichever axis passed, preferring the one further past due.
  if (status.state === 'overdue') {
    const distOver = status.distanceRemaining !== null && status.distanceRemaining <= 0;
    const timeOver = status.daysRemaining !== null && status.daysRemaining <= 0;
    if (distOver && (!timeOver || status.drivenBy === 'distance')) {
      return fill(
        localize(
          'editor.vehicle_maintenance.due_overdue_distance',
          lang,
          'overdue by {value} {unit}'
        ),
        { value: formatNumber(Math.abs(status.distanceRemaining as number), lang), unit: unitLabel }
      );
    }
    if (timeOver) {
      const days = Math.abs(status.daysRemaining as number);
      if (days === 0) {
        return localize('editor.vehicle_maintenance.due_today', lang, 'due today');
      }
      return fill(
        localize('editor.vehicle_maintenance.due_overdue_time', lang, 'overdue by {value}'),
        { value: formatDuration(days, lang) }
      );
    }
  }

  if (status.drivenBy === 'distance' && status.distanceRemaining !== null) {
    return fill(localize('editor.vehicle_maintenance.due_in_distance', lang, 'in {value} {unit}'), {
      value: formatNumber(status.distanceRemaining, lang),
      unit: unitLabel,
    });
  }

  if (status.daysRemaining !== null) {
    if (status.daysRemaining === 0) {
      return localize('editor.vehicle_maintenance.due_today', lang, 'due today');
    }
    return fill(localize('editor.vehicle_maintenance.due_in_time', lang, 'in {value}'), {
      value: formatDuration(status.daysRemaining, lang),
    });
  }

  return localize('editor.vehicle_maintenance.due_unknown', lang, 'No history yet');
}

/** "9 days" / "3 weeks" / "5 months", picking the unit that reads naturally. */
export function formatDuration(days: number, lang: string): string {
  const abs = Math.max(Math.abs(Math.round(days)), 0);
  if (abs >= 60) {
    const months = Math.round(abs / 30.44);
    return months === 1
      ? localize('editor.vehicle_maintenance.duration_month', lang, '1 month')
      : fill(localize('editor.vehicle_maintenance.duration_months', lang, '{value} months'), {
          value: String(months),
        });
  }
  if (abs >= 14) {
    const weeks = Math.round(abs / 7);
    return weeks === 1
      ? localize('editor.vehicle_maintenance.duration_week', lang, '1 week')
      : fill(localize('editor.vehicle_maintenance.duration_weeks', lang, '{value} weeks'), {
          value: String(weeks),
        });
  }
  return abs === 1
    ? localize('editor.vehicle_maintenance.duration_day', lang, '1 day')
    : fill(localize('editor.vehicle_maintenance.duration_days', lang, '{value} days'), {
        value: String(abs),
      });
}

/** "every 5,000 mi / 6 mo", omitting whichever axis is switched off. */
export function formatIntervalSummary(
  item: VehicleServiceItem,
  unit: 'mi' | 'km',
  lang: string
): string {
  const distance = positiveOrNull(item.interval_distance);
  const months = positiveOrNull(item.interval_months);
  const unitLabel =
    unit === 'km'
      ? localize('editor.vehicle_maintenance.unit_km', lang, 'km')
      : localize('editor.vehicle_maintenance.unit_mi', lang, 'mi');
  const monthLabel = localize('editor.vehicle_maintenance.unit_months_short', lang, 'mo');

  const parts: string[] = [];
  if (distance !== null) parts.push(`${formatNumber(distance, lang)} ${unitLabel}`);
  if (months !== null) parts.push(`${formatNumber(months, lang)} ${monthLabel}`);

  if (parts.length === 0) {
    return localize('editor.vehicle_maintenance.interval_none', lang, 'No interval set');
  }
  return fill(localize('editor.vehicle_maintenance.interval_every', lang, 'every {value}'), {
    value: parts.join(' / '),
  });
}

/* -------------------------------------------------------------------------- */
/* Service log (to-do backed)                                                  */
/* -------------------------------------------------------------------------- */

/** Every log entry for this module, newest first. */
export async function getLog(
  hass: HomeAssistant,
  todoEntity: string,
  onUpdate?: () => void
): Promise<VehicleServiceLogEntry[]> {
  if (!hass || !todoEntity) return [];
  const records = await ucRecordStore.getRecords<ServiceLogPayload>(
    hass,
    todoEntity,
    VEHICLE_MAINTENANCE_NS,
    onUpdate
  );
  return records
    .filter(r => !!r.payload && typeof r.payload.service_id === 'string')
    .sort((a, b) => (parseIsoDate(b.payload.at) ?? 0) - (parseIsoDate(a.payload.at) ?? 0));
}

/**
 * Writes a completed service to the log.
 *
 * Returns the payload it stored so the caller can mirror `last_distance` /
 * `last_date` back into the module config when it has an `updateModule`
 * available. Callers without one rely on {@link resolveServiceBaseline}
 * reading it back out of the log instead.
 */
export async function recordService(
  hass: HomeAssistant,
  todoEntity: string,
  item: VehicleServiceItem,
  details: { odometer?: number | null; cost?: number | null; note?: string; at?: string }
): Promise<ServiceLogPayload | null> {
  if (!hass || !todoEntity || !item) return null;

  const at = details.at ? String(details.at).slice(0, 10) : toIsoDate();
  const odometer =
    details.odometer !== undefined && details.odometer !== null && Number.isFinite(details.odometer)
      ? Number(details.odometer)
      : null;
  const cost =
    details.cost !== undefined && details.cost !== null && Number.isFinite(details.cost)
      ? Number(details.cost)
      : null;

  const payload: ServiceLogPayload = {
    service_id: item.id,
    service_name: item.name,
    at,
    odometer,
    cost,
  };
  const note = details.note?.trim();
  if (note) payload.note = note;

  const summary = `${item.name} — ${at}`;
  await ucRecordStore.addRecord<ServiceLogPayload>(
    hass,
    todoEntity,
    VEHICLE_MAINTENANCE_NS,
    summary,
    payload,
    { due: at }
  );
  // Logged work is history, not a task — close it so it doesn't sit in the
  // user's to-do list as an open item.
  try {
    const records = await getLog(hass, todoEntity);
    const written = records.find(
      r => r.payload.service_id === item.id && r.payload.at === at && r.status !== 'completed'
    );
    if (written) await ucRecordStore.setStatus(hass, todoEntity, written.uid, 'completed');
  } catch {
    /* Status is cosmetic; the record itself is already stored. */
  }
  return payload;
}

export async function deleteLogEntry(
  hass: HomeAssistant,
  todoEntity: string,
  uid: string
): Promise<void> {
  if (!hass || !todoEntity || !uid) return;
  await ucRecordStore.removeRecord(hass, todoEntity, uid);
}

/** Drops the cached to-do items so the next read hits Home Assistant again. */
export function invalidateLog(hass: HomeAssistant | undefined, todoEntity: string): void {
  if (!hass || !todoEntity) return;
  ucRecordStore.invalidate(hass, todoEntity);
}

export interface LogTotals {
  totalCost: number;
  entriesWithCost: number;
  /** Distance covered between the oldest and newest logged odometer readings. */
  distanceSpan: number | null;
  /** Cost per distance unit, or null when the log can't support the figure. */
  costPerDistance: number | null;
}

/**
 * Aggregate spend across the log. `costPerDistance` needs at least two entries
 * with odometer readings spanning real distance, otherwise it is null rather
 * than a nonsense figure derived from a single point.
 */
export function summarizeLog(log: VehicleServiceLogEntry[] | undefined): LogTotals {
  const empty: LogTotals = {
    totalCost: 0,
    entriesWithCost: 0,
    distanceSpan: null,
    costPerDistance: null,
  };
  if (!log || log.length === 0) return empty;

  let totalCost = 0;
  let entriesWithCost = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const entry of log) {
    const cost = entry.payload?.cost;
    if (typeof cost === 'number' && Number.isFinite(cost)) {
      totalCost += cost;
      entriesWithCost += 1;
    }
    const odo = entry.payload?.odometer;
    if (typeof odo === 'number' && Number.isFinite(odo)) {
      min = Math.min(min, odo);
      max = Math.max(max, odo);
    }
  }

  const distanceSpan = Number.isFinite(min) && Number.isFinite(max) && max > min ? max - min : null;
  const costPerDistance =
    distanceSpan !== null && distanceSpan > 0 && entriesWithCost >= 2
      ? totalCost / distanceSpan
      : null;

  return { totalCost, entriesWithCost, distanceSpan, costPerDistance };
}

/* -------------------------------------------------------------------------- */
/* Usage estimate from recorder history                                        */
/* -------------------------------------------------------------------------- */

const ESTIMATE_MIN_DAYS = 5;
const ESTIMATE_MIN_SAMPLES = 5;

/**
 * Average distance driven per day, from an odometer series.
 *
 * Only positive deltas count, so a sensor that resets to zero (or a vehicle
 * swapped onto the same entity) drops out instead of producing a huge negative
 * or a phantom spike. Returns null unless the window is long enough and has
 * enough samples to mean anything — a two-point sample should say "not enough
 * data", not print a confident number.
 */
export function estimateDailyDistance(
  history: NumericPoint[] | undefined
): DailyDistanceEstimate | null {
  if (!history || history.length < ESTIMATE_MIN_SAMPLES) return null;

  const first = history[0];
  const last = history[history.length - 1];
  if (!first || !last) return null;

  const spanMs = last.t - first.t;
  const days = spanMs / MS_PER_DAY;
  if (days < ESTIMATE_MIN_DAYS) return null;

  let travelled = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const cur = history[i];
    if (!prev || !cur) continue;
    const delta = cur.v - prev.v;
    if (delta > 0) travelled += delta;
  }
  if (travelled <= 0) return null;

  return { perDay: travelled / days, days, samples: history.length };
}

/**
 * Non-blocking recorder query for the odometer, returning a usage estimate in
 * the module's configured unit. Kicks off a background fetch and calls
 * `onReady` when fresh data lands; safe to call on every render.
 */
export function queryUsageEstimate(
  hass: HomeAssistant | undefined,
  config: VehicleMaintenanceModule,
  odometerEntity: string,
  onReady?: () => void,
  days: number = 30
): { estimate: DailyDistanceEstimate | null; loading: boolean } {
  if (!hass || !odometerEntity) return { estimate: null, loading: false };

  const endMs = Date.now();
  const startMs = endMs - days * MS_PER_DAY;
  const result = ucHistoryService.query(
    hass,
    {
      key: `vehicle_maintenance:${config?.id ?? 'x'}:${days}:${odometerEntity}`,
      entityIds: [odometerEntity],
      startMs,
      endMs,
      ttlMs: 30 * 60 * 1000,
      withAttributes: false,
    },
    onReady
  );

  const series = toNumericSeries(result.data.get(odometerEntity));
  const estimate = estimateDailyDistance(series);
  if (!estimate) return { estimate: null, loading: result.loading };

  // History carries the source entity's unit; align it with the module's.
  const target = config?.distance_unit === 'km' ? 'km' : 'mi';
  const sourceUnit = normalizeDistanceUnit(
    String(hass.states?.[odometerEntity]?.attributes?.['unit_of_measurement'] ?? '')
  );
  const perDay =
    sourceUnit && sourceUnit !== target
      ? convertDistance(estimate.perDay, sourceUnit, target)
      : estimate.perDay;

  return {
    estimate: { perDay, days: estimate.days, samples: estimate.samples },
    loading: result.loading,
  };
}

/**
 * Turns remaining distance into a rough date using the usage estimate, so a
 * distance-only service can still answer "when?". Returns null when the
 * estimate is too weak or the vehicle is effectively parked.
 */
export function projectDaysFromDistance(
  distanceRemaining: number | null,
  estimate: DailyDistanceEstimate | null
): number | null {
  if (distanceRemaining === null || !estimate) return null;
  if (estimate.perDay <= 0.5) return null;
  return Math.max(Math.round(distanceRemaining / estimate.perDay), 0);
}

/* -------------------------------------------------------------------------- */
/* Preset catalogue                                                            */
/* -------------------------------------------------------------------------- */

export interface VehicleServicePreset {
  key: string;
  /** Localization key suffix under `editor.vehicle_maintenance.`. */
  labelKey: string;
  fallbackName: string;
  icon: string;
  /** Interval in miles; converted when the module is set to km. */
  intervalMiles: number;
  intervalMonths: number;
}

/**
 * Common services offered by the "Add from presets" menu, so nobody has to
 * recall manufacturer intervals from memory. Distances are authored in miles
 * and converted on insert when the module is configured for km.
 */
export const VEHICLE_SERVICE_PRESETS: readonly VehicleServicePreset[] = [
  {
    key: 'oil',
    labelKey: 'preset_oil',
    fallbackName: 'Oil Change',
    icon: 'mdi:oil',
    intervalMiles: 5000,
    intervalMonths: 6,
  },
  {
    key: 'tires',
    labelKey: 'preset_tires',
    fallbackName: 'Tire Rotation',
    icon: 'mdi:tire',
    intervalMiles: 6000,
    intervalMonths: 6,
  },
  {
    key: 'brakes',
    labelKey: 'preset_brakes',
    fallbackName: 'Brake Inspection',
    icon: 'mdi:car-brake-alert',
    intervalMiles: 20000,
    intervalMonths: 24,
  },
  {
    key: 'coolant',
    labelKey: 'preset_coolant',
    fallbackName: 'Coolant Flush',
    icon: 'mdi:car-coolant-level',
    intervalMiles: 60000,
    intervalMonths: 60,
  },
  {
    key: 'transmission',
    labelKey: 'preset_transmission',
    fallbackName: 'Transmission Fluid',
    icon: 'mdi:car-shift-pattern',
    intervalMiles: 60000,
    intervalMonths: 60,
  },
  {
    key: 'air_filter',
    labelKey: 'preset_air_filter',
    fallbackName: 'Air Filter',
    icon: 'mdi:air-filter',
    intervalMiles: 15000,
    intervalMonths: 12,
  },
  {
    key: 'cabin_filter',
    labelKey: 'preset_cabin_filter',
    fallbackName: 'Cabin Filter',
    icon: 'mdi:air-conditioner',
    intervalMiles: 15000,
    intervalMonths: 12,
  },
  {
    key: 'wipers',
    labelKey: 'preset_wipers',
    fallbackName: 'Wiper Blades',
    icon: 'mdi:wiper',
    intervalMiles: 0,
    intervalMonths: 12,
  },
  {
    key: 'battery',
    labelKey: 'preset_battery',
    fallbackName: 'Battery Check',
    icon: 'mdi:car-battery',
    intervalMiles: 0,
    intervalMonths: 12,
  },
  {
    key: 'spark_plugs',
    labelKey: 'preset_spark_plugs',
    fallbackName: 'Spark Plugs',
    icon: 'mdi:spark-plug',
    intervalMiles: 60000,
    intervalMonths: 60,
  },
  {
    key: 'registration',
    labelKey: 'preset_registration',
    fallbackName: 'Registration',
    icon: 'mdi:card-account-details',
    intervalMiles: 0,
    intervalMonths: 12,
  },
  {
    key: 'inspection',
    labelKey: 'preset_inspection',
    fallbackName: 'Safety Inspection',
    icon: 'mdi:clipboard-check-outline',
    intervalMiles: 0,
    intervalMonths: 12,
  },
];

/** Rounds a converted interval to a tidy number so presets don't read "9,656 km". */
export function roundInterval(value: number): number {
  if (value <= 0) return 0;
  if (value >= 10000) return Math.round(value / 1000) * 1000;
  if (value >= 1000) return Math.round(value / 500) * 500;
  if (value >= 100) return Math.round(value / 100) * 100;
  return Math.round(value);
}
