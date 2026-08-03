import { HomeAssistant } from 'custom-card-helpers';

/**
 * Shared recorder-history access + numeric analysis helpers.
 *
 * Modules render synchronously, so the fetch API here is deliberately
 * "request and notify": `query()` returns whatever is already cached (possibly
 * nothing) and schedules a background fetch that invokes `onReady` when the
 * data lands. Callers re-render at that point via `triggerPreviewUpdate()`.
 */

export interface HistoryStatePoint {
  /** Epoch milliseconds. */
  t: number;
  state: string;
  attributes?: Record<string, unknown> | null | undefined;
}

export interface NumericPoint {
  /** Epoch milliseconds. */
  t: number;
  v: number;
}

export interface HistoryQuery {
  /** Stable cache key. Include everything that changes the result. */
  key: string;
  entityIds: string[];
  startMs: number;
  endMs: number;
  /** How long a completed result stays fresh. Default 5 minutes. */
  ttlMs?: number | undefined;
  /** Ask the recorder for attributes too (needed for `battery_level` style reads). */
  withAttributes?: boolean | undefined;
}

export interface HistoryResult {
  data: Map<string, HistoryStatePoint[]>;
  loading: boolean;
  /** Epoch ms of the last successful fetch, 0 when never fetched. */
  fetchedAt: number;
  error: string | null;
}

interface CacheEntry {
  data: Map<string, HistoryStatePoint[]>;
  fetchedAt: number;
  loading: boolean;
  error: string | null;
  /** Guards against duplicate in-flight fetches for the same key. */
  inflight: Promise<void> | null;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const EMPTY_RESULT: HistoryResult = Object.freeze({
  data: new Map<string, HistoryStatePoint[]>(),
  loading: false,
  fetchedAt: 0,
  error: null,
});

class UltraCardHistoryService {
  private _cache = new Map<string, CacheEntry>();

  /**
   * Returns cached history immediately and refreshes in the background when stale.
   * `onReady` fires only when new data actually arrived.
   */
  query(hass: HomeAssistant, q: HistoryQuery, onReady?: () => void): HistoryResult {
    if (!hass || q.entityIds.length === 0) return EMPTY_RESULT;

    const ttl = q.ttlMs ?? DEFAULT_TTL_MS;
    const entry = this._cache.get(q.key);
    const now = Date.now();
    const stale = !entry || now - entry.fetchedAt > ttl;

    if (stale && !entry?.inflight) {
      this._startFetch(hass, q, onReady);
    }

    const current = this._cache.get(q.key);
    if (!current) return EMPTY_RESULT;
    return {
      data: current.data,
      loading: current.loading,
      fetchedAt: current.fetchedAt,
      error: current.error,
    };
  }

  /** Awaitable variant for services and tests. */
  async fetch(hass: HomeAssistant, q: HistoryQuery): Promise<Map<string, HistoryStatePoint[]>> {
    if (!hass || q.entityIds.length === 0) return new Map();
    await this._startFetch(hass, q);
    return this._cache.get(q.key)?.data ?? new Map();
  }

  /** Drop a cached window so the next `query()` refetches. */
  invalidate(key: string): void {
    this._cache.delete(key);
  }

  clear(): void {
    this._cache.clear();
  }

  private _startFetch(hass: HomeAssistant, q: HistoryQuery, onReady?: () => void): Promise<void> {
    const existing = this._cache.get(q.key);
    if (existing?.inflight) return existing.inflight;

    const entry: CacheEntry = existing ?? {
      data: new Map(),
      fetchedAt: 0,
      loading: false,
      error: null,
      inflight: null,
    };
    entry.loading = true;
    this._cache.set(q.key, entry);

    const promise = this._doFetch(hass, q)
      .then(data => {
        entry.data = data;
        entry.fetchedAt = Date.now();
        entry.error = null;
      })
      .catch((err: unknown) => {
        entry.error = err instanceof Error ? err.message : String(err);
        // Back off so a persistently failing query doesn't refetch every render.
        entry.fetchedAt = Date.now();
      })
      .finally(() => {
        entry.loading = false;
        entry.inflight = null;
        if (onReady) {
          try {
            onReady();
          } catch {
            /* consumer errors must not break the cache */
          }
        }
      });

    entry.inflight = promise;
    return promise;
  }

  private async _doFetch(
    hass: HomeAssistant,
    q: HistoryQuery
  ): Promise<Map<string, HistoryStatePoint[]>> {
    const entityIds = q.entityIds.filter(id => !!id);
    if (entityIds.length === 0) return new Map();

    const startISO = new Date(q.startMs).toISOString();
    const endISO = new Date(q.endMs).toISOString();
    const noAttributes = !q.withAttributes;
    let raw: Record<string, unknown[]> = {};

    try {
      raw = (await hass.callWS({
        type: 'history/history_during_period',
        start_time: startISO,
        end_time: endISO,
        entity_ids: entityIds,
        include_start_time_state: true,
        significant_changes_only: false,
        minimal_response: false,
        no_attributes: noAttributes,
      })) as Record<string, unknown[]>;
    } catch {
      // REST fallback returns an array of per-entity arrays.
      const rest = (await hass.callApi('GET', `history/period/${startISO}`, {
        filter_entity_id: entityIds.join(','),
        end_time: endISO,
      })) as unknown[];
      raw = {};
      if (Array.isArray(rest)) {
        for (const entityHistory of rest) {
          if (Array.isArray(entityHistory) && entityHistory.length > 0) {
            const first = entityHistory[0] as { entity_id?: string };
            if (first?.entity_id) raw[first.entity_id] = entityHistory;
          }
        }
      }
    }

    const out = new Map<string, HistoryStatePoint[]>();
    for (const [entityId, items] of Object.entries(raw)) {
      if (!Array.isArray(items) || items.length === 0) continue;
      const points: HistoryStatePoint[] = [];
      for (const item of items) {
        const p = parseHistoryItem(item);
        if (p) points.push(p);
      }
      if (points.length > 0) {
        points.sort((a, b) => a.t - b.t);
        out.set(entityId, points);
      }
    }
    return out;
  }
}

/** Accepts both WS compressed (`{s, a, lu}`) and REST (`{state, last_changed}`) shapes. */
export function parseHistoryItem(item: unknown): HistoryStatePoint | null {
  if (item == null || typeof item !== 'object') return null;
  const o = item as Record<string, any>;
  if (o.s !== undefined && (o.lu !== undefined || o.lc !== undefined)) {
    const seconds = Number(o.lu ?? o.lc);
    if (!Number.isFinite(seconds)) return null;
    return { t: seconds * 1000, state: String(o.s), attributes: o.a ?? null };
  }
  if (o.state !== undefined) {
    const stamp = o.last_changed ?? o.last_updated;
    const t = stamp ? new Date(String(stamp)).getTime() : NaN;
    if (!Number.isFinite(t)) return null;
    return { t, state: String(o.state), attributes: o.attributes ?? null };
  }
  return null;
}

export const ucHistoryService = new UltraCardHistoryService();

/* -------------------------------------------------------------------------- */
/* Numeric analysis helpers                                                    */
/* -------------------------------------------------------------------------- */

const UNAVAILABLE_STATES = new Set(['unavailable', 'unknown', 'none', '', 'null']);

/** Converts state history into a numeric series, dropping unavailable samples. */
export function toNumericSeries(
  points: HistoryStatePoint[] | undefined,
  options?: { attribute?: string | undefined }
): NumericPoint[] {
  if (!points || points.length === 0) return [];
  const attribute = options?.attribute;
  const out: NumericPoint[] = [];
  for (const p of points) {
    const rawValue = attribute ? p.attributes?.[attribute] : p.state;
    if (rawValue === undefined || rawValue === null) continue;
    const asString = String(rawValue).trim().toLowerCase();
    if (UNAVAILABLE_STATES.has(asString)) continue;
    const v = Number(rawValue);
    if (!Number.isFinite(v)) continue;
    out.push({ t: p.t, v });
  }
  return out;
}

/**
 * Average weighted by how long each sample was held, which is what you want for
 * step-shaped recorder data (a 2-second 2000 W spike shouldn't outweigh 8 hours
 * at 3 W the way a plain mean would).
 */
export function timeWeightedAverage(
  series: NumericPoint[],
  startMs?: number,
  endMs?: number
): number | null {
  if (series.length === 0) return null;
  if (series.length === 1) return series[0]!.v;
  const from = startMs ?? series[0]!.t;
  const to = endMs ?? series[series.length - 1]!.t;
  if (to <= from) return series[series.length - 1]!.v;

  let weighted = 0;
  let totalMs = 0;
  for (let i = 0; i < series.length; i++) {
    const point = series[i]!;
    const segStart = Math.max(point.t, from);
    const segEnd = Math.min(i + 1 < series.length ? series[i + 1]!.t : to, to);
    const dt = segEnd - segStart;
    if (dt <= 0) continue;
    weighted += point.v * dt;
    totalMs += dt;
  }
  if (totalMs <= 0) return series[series.length - 1]!.v;
  return weighted / totalMs;
}

/**
 * Time-weighted percentile. Used to find a "standby floor" that ignores brief
 * active bursts — the 10th percentile of held time is a robust baseline.
 */
export function timeWeightedPercentile(
  series: NumericPoint[],
  percentile: number,
  startMs?: number,
  endMs?: number
): number | null {
  if (series.length === 0) return null;
  if (series.length === 1) return series[0]!.v;
  const from = startMs ?? series[0]!.t;
  const to = endMs ?? series[series.length - 1]!.t;

  const buckets: Array<{ v: number; ms: number }> = [];
  let totalMs = 0;
  for (let i = 0; i < series.length; i++) {
    const point = series[i]!;
    const segStart = Math.max(point.t, from);
    const segEnd = Math.min(i + 1 < series.length ? series[i + 1]!.t : to, to);
    const dt = segEnd - segStart;
    if (dt <= 0) continue;
    buckets.push({ v: point.v, ms: dt });
    totalMs += dt;
  }
  if (buckets.length === 0 || totalMs <= 0) return series[series.length - 1]!.v;

  buckets.sort((a, b) => a.v - b.v);
  const target = totalMs * Math.min(Math.max(percentile, 0), 1);
  let running = 0;
  for (const bucket of buckets) {
    running += bucket.ms;
    if (running >= target) return bucket.v;
  }
  return buckets[buckets.length - 1]!.v;
}

/** Least-squares slope in value-units per millisecond. `null` when undetermined. */
export function linearSlopePerMs(series: NumericPoint[]): number | null {
  if (series.length < 2) return null;
  const n = series.length;
  const t0 = series[0]!.t;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const p of series) {
    const x = p.t - t0;
    sumX += x;
    sumY += p.v;
    sumXY += x * p.v;
    sumXX += x * x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  return (n * sumXY - sumX * sumY) / denom;
}

export interface DischargeEstimate {
  /** Percent lost per hour (positive = draining). */
  ratePerHour: number;
  /** Milliseconds until the series would reach `floor`, or null when not draining. */
  msToEmpty: number | null;
  /** Fraction of the window that was spent discharging, 0–1. Low values = noisy estimate. */
  coverage: number;
  /** True when the most recent segment is rising (device is charging right now). */
  charging: boolean;
}

/**
 * Estimates a battery's drain rate by looking only at the falling segments of
 * the series. Charge events reset the analysis, so a device that was topped up
 * mid-window still reports a sane discharge rate.
 */
export function estimateDischarge(
  series: NumericPoint[],
  options?: { floor?: number | undefined; riseToleranceUnits?: number | undefined }
): DischargeEstimate | null {
  if (series.length < 3) return null;
  const floor = options?.floor ?? 0;
  const riseTolerance = options?.riseToleranceUnits ?? 1;

  // Split into monotonically-non-increasing runs, breaking on a real rise.
  const segments: NumericPoint[][] = [];
  let current: NumericPoint[] = [series[0]!];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1]!;
    const point = series[i]!;
    if (point.v - prev.v > riseTolerance) {
      if (current.length >= 2) segments.push(current);
      current = [point];
    } else {
      current.push(point);
    }
  }
  if (current.length >= 2) segments.push(current);
  if (segments.length === 0) return null;

  let totalDrop = 0;
  let totalMs = 0;
  for (const segment of segments) {
    const first = segment[0]!;
    const last = segment[segment.length - 1]!;
    const drop = first.v - last.v;
    const dt = last.t - first.t;
    if (dt <= 0 || drop <= 0) continue;
    totalDrop += drop;
    totalMs += dt;
  }

  const windowMs = series[series.length - 1]!.t - series[0]!.t;
  const coverage = windowMs > 0 ? Math.min(totalMs / windowMs, 1) : 0;
  const lastSegment = segments[segments.length - 1]!;
  const charging =
    series.length >= 2 &&
    series[series.length - 1]!.v - series[series.length - 2]!.v > riseTolerance;

  if (totalMs <= 0 || totalDrop <= 0) {
    return { ratePerHour: 0, msToEmpty: null, coverage, charging };
  }

  const ratePerHour = (totalDrop / totalMs) * 3600000;
  const latest = series[series.length - 1]!.v;
  const remaining = latest - floor;
  const msToEmpty = ratePerHour > 0 && remaining > 0 ? (remaining / ratePerHour) * 3600000 : null;

  void lastSegment;
  return { ratePerHour, msToEmpty, coverage, charging };
}

export interface RunSegment {
  startMs: number;
  endMs: number;
  durationMs: number;
  peak: number;
  /** Time-weighted mean value across the run. */
  mean: number;
  /** Integrated value·hours (Wh when the series is watts). */
  areaHours: number;
}

/**
 * Finds contiguous "active" runs in a numeric series using hysteresis: a run
 * starts when the value crosses `startThreshold` and ends only once it stays
 * below `stopThreshold` for `settleMs`. The two-threshold + settle approach
 * stops a washer's spin-pause-spin pattern from registering as many short runs.
 */
export function detectRuns(
  series: NumericPoint[],
  options: {
    startThreshold: number;
    stopThreshold?: number | undefined;
    settleMs?: number | undefined;
    minDurationMs?: number | undefined;
    endMs?: number | undefined;
  }
): RunSegment[] {
  if (series.length < 2) return [];
  const startThreshold = options.startThreshold;
  const stopThreshold = options.stopThreshold ?? startThreshold * 0.5;
  const settleMs = options.settleMs ?? 3 * 60 * 1000;
  const minDurationMs = options.minDurationMs ?? 5 * 60 * 1000;
  const seriesEnd = options.endMs ?? series[series.length - 1]!.t;

  const runs: RunSegment[] = [];
  let runStart: number | null = null;
  let belowSince: number | null = null;
  let peak = 0;
  let weighted = 0;
  let heldMs = 0;
  // Integral as of `belowSince`, so a run that ends up closing there can discard
  // the idle tail instead of letting it dilute the mean.
  let weightedAtBelow = 0;
  let heldMsAtBelow = 0;

  const closeRun = (endMs: number) => {
    if (runStart === null) return;
    const durationMs = endMs - runStart;
    if (durationMs >= minDurationMs) {
      runs.push({
        startMs: runStart,
        endMs,
        durationMs,
        peak,
        mean: heldMs > 0 ? weighted / heldMs : peak,
        areaHours: weighted / 3600000,
      });
    }
    runStart = null;
    belowSince = null;
    peak = 0;
    weighted = 0;
    heldMs = 0;
  };

  for (let i = 0; i < series.length; i++) {
    const point = series[i]!;
    const nextT = i + 1 < series.length ? series[i + 1]!.t : seriesEnd;
    const dt = Math.max(nextT - point.t, 0);

    if (runStart === null) {
      if (point.v >= startThreshold) {
        runStart = point.t;
        peak = point.v;
        weighted = point.v * dt;
        heldMs = dt;
        belowSince = null;
      }
      continue;
    }

    peak = Math.max(peak, point.v);

    if (point.v < stopThreshold) {
      if (belowSince === null) {
        belowSince = point.t;
        weightedAtBelow = weighted;
        heldMsAtBelow = heldMs;
      }
      weighted += point.v * dt;
      heldMs += dt;

      // Recorder samples are step-shaped: this value holds until `nextT`, which
      // may be hours away with no further sample. Measuring the settle window
      // against `nextT` rather than against the next below-threshold sample is
      // what keeps two cycles separated by a long idle gap from merging.
      if (nextT - belowSince >= settleMs) {
        weighted = weightedAtBelow;
        heldMs = heldMsAtBelow;
        closeRun(belowSince);
      }
    } else {
      belowSince = null;
      weighted += point.v * dt;
      heldMs += dt;
    }
  }

  if (runStart !== null) {
    if (belowSince !== null) {
      weighted = weightedAtBelow;
      heldMs = heldMsAtBelow;
      closeRun(belowSince);
    } else {
      closeRun(seriesEnd);
    }
  }
  return runs;
}

/** Most recent value in a series, or null when empty. */
export function latestValue(series: NumericPoint[]): number | null {
  return series.length > 0 ? series[series.length - 1]!.v : null;
}

/** Reads a numeric entity state, returning null for unavailable/non-numeric. */
export function numericState(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
  attribute?: string
): number | null {
  if (!hass || !entityId) return null;
  const st = hass.states?.[entityId];
  if (!st) return null;
  const raw = attribute ? (st.attributes as Record<string, unknown>)?.[attribute] : st.state;
  if (raw === undefined || raw === null) return null;
  if (UNAVAILABLE_STATES.has(String(raw).trim().toLowerCase())) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}
