import { HomeAssistant } from 'custom-card-helpers';
import { LaundryApplianceConfig } from '../types';
import {
  ucHistoryService,
  toNumericSeries,
  timeWeightedPercentile,
  detectRuns,
  numericState,
  type HistoryStatePoint,
  type NumericPoint,
  type RunSegment,
} from './uc-history-service';

/**
 * Laundry Tracker (Pro) — infers wash/dry cycles from a plain power sensor and
 * tracks what happens *after* the cycle ends.
 *
 * The interesting question is not "is the washer running" (a wattage reading
 * answers that) but "did anybody take the clothes out". Everything here exists
 * to answer that second question from cheap hardware: a smart plug, and
 * optionally a door/lid sensor.
 */

export type LaundryPhase = 'idle' | 'running' | 'finished' | 'forgotten' | 'unknown';

export interface LaundryCycle {
  startMs: number;
  endMs: number;
  durationMs: number;
  peakW: number;
  meanW: number;
  energyKwh: number;
  costEstimate: number;
}

export interface LaundryStatus {
  appliance: LaundryApplianceConfig;
  phase: LaundryPhase;
  currentW: number | null;
  /** For a running cycle: when it started. For finished: when it ended. */
  sinceMs: number | null;
  /** ms since the cycle ended; drives the forgotten-load logic. */
  sittingMs: number | null;
  doorOpen: boolean | null;
  lastCycle: LaundryCycle | null;
  cycles: LaundryCycle[];
  acknowledged: boolean;
  /** How the phase was determined, so the UI can be honest. */
  source: 'power' | 'state' | 'none';
  /** Recorder samples found in the window — 0 means "nothing learned yet". */
  historyPoints: number;
  /** True when a door/lid sensor reported the load being retrieved. */
  retrievedByDoor: boolean;
}

export interface LaundryStats {
  cycleCount: number;
  totalKwh: number;
  totalCost: number;
  avgDurationMs: number | null;
  /** Local ISO date (YYYY-MM-DD) with the most cycles, or null. */
  busiestDay: string | null;
}

export interface LaundryAnalyzeOptions {
  moduleId: string;
  appliances: LaundryApplianceConfig[];
  historyDays: number;
  energyRate: number;
  acknowledgeEnabled: boolean;
  /** Override "now" — tests only. */
  nowMs?: number | undefined;
}

export interface LaundryAnalysis {
  statuses: LaundryStatus[];
  stats: LaundryStats;
  loading: boolean;
  fetchedAt: number;
  error: string | null;
  /** Numeric power history per appliance id. Powers the threshold helper. */
  series: Map<string, NumericPoint[]>;
  windowStartMs: number;
  windowEndMs: number;
}

export interface LaundryDistribution {
  min: number;
  median: number;
  max: number;
  /** Time-weighted 10th percentile — the machine's standby floor. */
  floor: number;
  samples: number;
}

export interface LaundryThresholdSuggestion {
  startW: number;
  stopW: number;
  distribution: LaundryDistribution;
}

export interface LaundryNotifyRequest {
  moduleId: string;
  applianceId: string;
  /** Identity of the cycle. The guard keys on this, never on wall-clock time. */
  cycleEndMs: number;
  /** Either `notify.mobile_app_x` or a bare `mobile_app_x`. */
  service: string;
  title: string;
  message: string;
}

/** Broad default for `state_entity` matching across integrations. */
export const DEFAULT_LAUNDRY_RUNNING_STATES: readonly string[] = [
  'run',
  'running',
  'washing',
  'drying',
  'on',
  'in_progress',
  'program_running',
  'active',
];

/** Per-kind detection defaults. A dryer idles higher and gets a longer grace. */
export const LAUNDRY_KIND_DEFAULTS: Record<
  'washer' | 'dryer',
  {
    icon: string;
    start_threshold_w: number;
    stop_threshold_w: number;
    settle_minutes: number;
    min_cycle_minutes: number;
    unload_grace_minutes: number;
  }
> = {
  washer: {
    icon: 'mdi:washing-machine',
    start_threshold_w: 20,
    stop_threshold_w: 5,
    settle_minutes: 5,
    min_cycle_minutes: 15,
    unload_grace_minutes: 30,
  },
  dryer: {
    icon: 'mdi:tumble-dryer',
    start_threshold_w: 50,
    stop_threshold_w: 10,
    settle_minutes: 5,
    min_cycle_minutes: 15,
    unload_grace_minutes: 60,
  },
};

const DAY_MS = 86400000;
const MIN_HISTORY_DAYS = 1;
const MAX_HISTORY_DAYS = 30;
const HISTORY_TTL_MS = 5 * 60 * 1000;

/**
 * Past this point a "forgotten" load stops being a useful alert. Without a door
 * sensor we cannot see the unload, so a machine last used a week ago would nag
 * forever and make the card look broken. After a day the nag has either worked
 * or nobody is listening, so the appliance falls back to idle.
 */
const FORGOTTEN_MAX_MS = 24 * 3600 * 1000;

/** Notification guard survives a browser reload so a refresh can't re-nag. */
const NOTIFY_STORAGE_KEY = 'uc_laundry_notified_v1';
const NOTIFY_RETENTION_MS = 7 * DAY_MS;

const OPEN_DOOR_STATES = new Set(['on', 'open', 'opened', 'true']);
const UNAVAILABLE = new Set(['unavailable', 'unknown', 'none', '', 'null']);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function num(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Local YYYY-MM-DD, so "busiest day" matches the user's calendar, not UTC. */
export function localDateKey(ms: number): string {
  const d = new Date(ms);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Detection parameters for an appliance, with per-kind defaults applied. */
export function resolveDetectionParams(appliance: LaundryApplianceConfig): {
  startThreshold: number;
  stopThreshold: number;
  settleMs: number;
  minDurationMs: number;
  graceMs: number;
} {
  const defaults = LAUNDRY_KIND_DEFAULTS[appliance.kind === 'dryer' ? 'dryer' : 'washer'];
  const startThreshold = Math.max(1, num(appliance.start_threshold_w, defaults.start_threshold_w));
  const stopThresholdRaw = num(appliance.stop_threshold_w, defaults.stop_threshold_w);
  // A stop threshold at or above the start threshold destroys the hysteresis.
  const stopThreshold = clamp(stopThresholdRaw, 0, Math.max(0, startThreshold - 1));
  return {
    startThreshold,
    stopThreshold,
    settleMs: Math.max(0, num(appliance.settle_minutes, defaults.settle_minutes)) * 60000,
    minDurationMs:
      Math.max(0, num(appliance.min_cycle_minutes, defaults.min_cycle_minutes)) * 60000,
    graceMs:
      Math.max(0, num(appliance.unload_grace_minutes, defaults.unload_grace_minutes)) * 60000,
  };
}

/**
 * Start time of a run that is still open at the end of the series, or null.
 * Mirrors `detectRuns` hysteresis but ignores the minimum-duration filter, so a
 * cycle that started two minutes ago still reports as running.
 *
 * Like `detectRuns`, the settle window is measured against the *next* sample's
 * timestamp, because a recorder sample holds its value until the next one.
 */
function openRunStart(
  series: NumericPoint[],
  startThreshold: number,
  stopThreshold: number,
  settleMs: number,
  endMs: number
): number | null {
  let runStart: number | null = null;
  let belowSince: number | null = null;

  for (let i = 0; i < series.length; i++) {
    const point = series[i]!;
    if (runStart === null) {
      if (point.v >= startThreshold) {
        runStart = point.t;
        belowSince = null;
      }
      continue;
    }
    if (point.v < stopThreshold) {
      if (belowSince === null) belowSince = point.t;
      const heldUntil = series[i + 1]?.t ?? endMs;
      if (heldUntil - belowSince >= settleMs) {
        runStart = null;
        belowSince = null;
      }
    } else {
      belowSince = null;
    }
  }
  return runStart;
}

/**
 * Recorder history lags the live state by up to the cache TTL, and a power
 * sensor that hasn't changed emits no new points at all. Appending the live
 * reading at `now` keeps the settle timer honest — otherwise a machine that
 * finished four minutes ago never crosses its settle window.
 */
function appendLiveSample(
  series: NumericPoint[],
  currentW: number | null,
  nowMs: number
): NumericPoint[] {
  if (currentW === null) return series;
  const last = series.length > 0 ? series[series.length - 1] : undefined;
  if (last && last.t >= nowMs) return series;
  return [...series, { t: nowMs, v: currentW }];
}

function runToCycle(run: RunSegment, energyRate: number): LaundryCycle {
  const energyKwh = Math.max(0, run.areaHours / 1000);
  return {
    startMs: run.startMs,
    endMs: run.endMs,
    durationMs: run.durationMs,
    peakW: run.peak,
    meanW: run.mean,
    energyKwh,
    costEstimate: energyKwh * (Number.isFinite(energyRate) ? energyRate : 0),
  };
}

function isOpenState(state: string | undefined | null): boolean {
  if (!state) return false;
  return OPEN_DOOR_STATES.has(String(state).trim().toLowerCase());
}

function parseTimestamp(value: unknown): number | null {
  if (!value) return null;
  const t = new Date(String(value)).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Suggests start/stop wattage from a sensor's own distribution. Guessing these
 * blind is the hardest part of setting the module up: the standby floor sets the
 * lower bound and the active range sets how far above it a real cycle sits.
 */
export function suggestThresholds(
  series: NumericPoint[],
  endMs?: number
): LaundryThresholdSuggestion | null {
  const distribution = describeDistribution(series, endMs);
  if (!distribution || distribution.samples < 3) return null;

  const { floor, max } = distribution;
  const span = Math.max(0, max - floor);
  const rawStart = floor + Math.max(5, span * 0.02);
  // Round to something a human would have typed.
  const startW = clamp(
    rawStart >= 20 ? Math.round(rawStart / 5) * 5 : Math.ceil(rawStart),
    3,
    2000
  );
  const rawStop = Math.max(floor + 1, startW * 0.35);
  const stopW = clamp(Math.round(rawStop), 1, Math.max(1, startW - 1));

  return { startW, stopW, distribution };
}

/**
 * Min / median / max / standby floor for the threshold helper readout.
 *
 * `endMs` matters: the percentiles are time-weighted, and without an explicit
 * window end the last sample is held for zero time. A machine that has been
 * idling at 1 W since its last recorded change would otherwise report the
 * *cycle* median as its typical draw.
 */
export function describeDistribution(
  series: NumericPoint[],
  endMs?: number
): LaundryDistribution | null {
  if (!series || series.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const point of series) {
    if (point.v < min) min = point.v;
    if (point.v > max) max = point.v;
  }
  const startMs = series[0]!.t;
  const median = timeWeightedPercentile(series, 0.5, startMs, endMs) ?? min;
  const floor = timeWeightedPercentile(series, 0.1, startMs, endMs) ?? min;
  return { min, median, max, floor, samples: series.length };
}

class UltraCardLaundryTrackerService {
  /** applianceId -> the cycle `endMs` the user marked as unloaded. In-memory only. */
  private _acks = new Map<string, number>();
  /** `moduleId|applianceId|endMs` for every cycle already notified about. */
  private _notified: Set<string> | null = null;
  /** Guards against a second dispatch while the first service call is in flight. */
  private _notifyInFlight = new Set<string>();
  /** Memoized `detectRuns` output — the analysis re-runs on every render. */
  private _runCache = new Map<string, { sig: string; runs: RunSegment[] }>();

  /* ---------------------------------------------------------------------- */
  /* Analysis                                                                */
  /* ---------------------------------------------------------------------- */

  analyze(
    hass: HomeAssistant | undefined,
    options: LaundryAnalyzeOptions,
    onReady?: () => void
  ): LaundryAnalysis {
    const nowMs = options.nowMs ?? Date.now();
    const days = clamp(num(options.historyDays, 7), MIN_HISTORY_DAYS, MAX_HISTORY_DAYS);
    const windowStartMs = nowMs - days * DAY_MS;
    const appliances = (options.appliances || []).filter(a => !!a && !!a.id);

    const empty: LaundryAnalysis = {
      statuses: [],
      stats: { cycleCount: 0, totalKwh: 0, totalCost: 0, avgDurationMs: null, busiestDay: null },
      loading: false,
      fetchedAt: 0,
      error: null,
      series: new Map(),
      windowStartMs,
      windowEndMs: nowMs,
    };
    if (!hass || appliances.length === 0) return empty;

    const entityIds: string[] = [];
    for (const appliance of appliances) {
      for (const id of [appliance.power_entity, appliance.state_entity, appliance.door_entity]) {
        if (id && !entityIds.includes(id)) entityIds.push(id);
      }
    }

    let data = new Map<string, HistoryStatePoint[]>();
    let loading = false;
    let fetchedAt = 0;
    let error: string | null = null;

    if (entityIds.length > 0) {
      const result = ucHistoryService.query(
        hass,
        {
          key: `laundry:${options.moduleId}:${days}:${entityIds.join(',')}`,
          entityIds,
          startMs: windowStartMs,
          endMs: nowMs,
          ttlMs: HISTORY_TTL_MS,
          withAttributes: false,
        },
        onReady
      );
      data = result.data;
      loading = result.loading;
      fetchedAt = result.fetchedAt;
      error = result.error;
    }

    const series = new Map<string, NumericPoint[]>();
    const statuses: LaundryStatus[] = [];

    for (const appliance of appliances) {
      const status = this._analyzeAppliance(
        hass,
        appliance,
        data,
        fetchedAt,
        nowMs,
        options.energyRate,
        options.acknowledgeEnabled,
        series
      );
      statuses.push(status);
    }

    return {
      statuses,
      stats: this.computeStats(statuses),
      loading,
      fetchedAt,
      error,
      series,
      windowStartMs,
      windowEndMs: nowMs,
    };
  }

  private _analyzeAppliance(
    hass: HomeAssistant,
    appliance: LaundryApplianceConfig,
    data: Map<string, HistoryStatePoint[]>,
    fetchedAt: number,
    nowMs: number,
    energyRate: number,
    acknowledgeEnabled: boolean,
    seriesOut: Map<string, NumericPoint[]>
  ): LaundryStatus {
    const params = resolveDetectionParams(appliance);
    const hasPower = !!appliance.power_entity && !!hass.states?.[appliance.power_entity];
    const hasState = !!appliance.state_entity && !!hass.states?.[appliance.state_entity];

    const door = this._readDoor(hass, appliance, data);

    let phaseInput: {
      running: boolean;
      runStart: number | null;
      cycles: LaundryCycle[];
      currentW: number | null;
      historyPoints: number;
      source: 'power' | 'state' | 'none';
    };

    if (hasPower) {
      phaseInput = this._analyzePower(
        hass,
        appliance,
        data,
        fetchedAt,
        nowMs,
        energyRate,
        params,
        seriesOut
      );
    } else if (hasState) {
      phaseInput = this._analyzeState(hass, appliance, data, nowMs, params);
    } else {
      phaseInput = {
        running: false,
        runStart: null,
        cycles: [],
        currentW: appliance.power_entity ? numericState(hass, appliance.power_entity) : null,
        historyPoints: 0,
        source: 'none',
      };
    }

    const { running, runStart, cycles, currentW, historyPoints, source } = phaseInput;
    const lastCycle = cycles.length > 0 ? cycles[cycles.length - 1]! : null;
    const sittingMs = !running && lastCycle ? Math.max(0, nowMs - lastCycle.endMs) : null;
    const acknowledged =
      !!lastCycle && acknowledgeEnabled && this.isAcknowledged(appliance.id, lastCycle.endMs);

    // A door opening after the cycle ended is the most reliable unload signal
    // there is, so it outranks the grace timer in both directions.
    const retrievedByDoor = !!lastCycle && door.openedAfter(lastCycle.endMs);

    let phase: LaundryPhase;
    if (source === 'none') {
      phase = 'unknown';
    } else if (running) {
      phase = 'running';
    } else if (!lastCycle || sittingMs === null) {
      phase = 'idle';
    } else if (retrievedByDoor || acknowledged) {
      phase = 'idle';
    } else if (sittingMs <= params.graceMs) {
      phase = 'finished';
    } else if (sittingMs > FORGOTTEN_MAX_MS) {
      phase = 'idle';
    } else {
      phase = 'forgotten';
    }

    return {
      appliance,
      phase,
      currentW,
      sinceMs: running ? runStart : (lastCycle?.endMs ?? null),
      sittingMs,
      doorOpen: door.currentlyOpen,
      lastCycle,
      cycles,
      acknowledged,
      source,
      historyPoints,
      retrievedByDoor,
    };
  }

  private _analyzePower(
    hass: HomeAssistant,
    appliance: LaundryApplianceConfig,
    data: Map<string, HistoryStatePoint[]>,
    fetchedAt: number,
    nowMs: number,
    energyRate: number,
    params: ReturnType<typeof resolveDetectionParams>,
    seriesOut: Map<string, NumericPoint[]>
  ): {
    running: boolean;
    runStart: number | null;
    cycles: LaundryCycle[];
    currentW: number | null;
    historyPoints: number;
    source: 'power' | 'state' | 'none';
  } {
    const entityId = appliance.power_entity!;
    const raw = toNumericSeries(data.get(entityId));
    seriesOut.set(appliance.id, raw);

    const currentW = numericState(hass, entityId);
    const live = appendLiveSample(raw, currentW, nowMs);

    const runs = this._detectRunsCached(
      `${appliance.id}:${entityId}`,
      live,
      fetchedAt,
      nowMs,
      params
    );
    const runStart = openRunStart(
      live,
      params.startThreshold,
      params.stopThreshold,
      params.settleMs,
      nowMs
    );
    const running = runStart !== null;

    const completed = runs.filter(run => runStart === null || run.startMs < runStart);
    const cycles = completed.map(run => runToCycle(run, energyRate));

    return {
      running,
      runStart,
      cycles,
      currentW,
      historyPoints: raw.length,
      source: 'power',
    };
  }

  /**
   * `detectRuns` walks the whole window, and the window can hold tens of
   * thousands of samples. Memoize per entity so a slider drag or a hass tick
   * doesn't re-scan everything.
   */
  private _detectRunsCached(
    cacheKey: string,
    series: NumericPoint[],
    fetchedAt: number,
    nowMs: number,
    params: ReturnType<typeof resolveDetectionParams>
  ): RunSegment[] {
    const last = series.length > 0 ? series[series.length - 1] : undefined;
    const sig = [
      fetchedAt,
      series.length,
      last ? `${last.t}:${last.v}` : '-',
      params.startThreshold,
      params.stopThreshold,
      params.settleMs,
      params.minDurationMs,
      // Re-run at most once a minute so the settle window keeps advancing.
      Math.floor(nowMs / 60000),
    ].join('|');

    const cached = this._runCache.get(cacheKey);
    if (cached && cached.sig === sig) return cached.runs;

    const runs = detectRuns(series, {
      startThreshold: params.startThreshold,
      stopThreshold: params.stopThreshold,
      settleMs: params.settleMs,
      minDurationMs: params.minDurationMs,
      endMs: nowMs,
    });
    this._runCache.set(cacheKey, { sig, runs });
    return runs;
  }

  /**
   * Fallback for machines with no power sensor. The finish time comes from the
   * running -> not-running transition in recorder history, so "done 12 minutes
   * ago" is real rather than "whenever the card happened to load".
   */
  private _analyzeState(
    hass: HomeAssistant,
    appliance: LaundryApplianceConfig,
    data: Map<string, HistoryStatePoint[]>,
    nowMs: number,
    params: ReturnType<typeof resolveDetectionParams>
  ): {
    running: boolean;
    runStart: number | null;
    cycles: LaundryCycle[];
    currentW: number | null;
    historyPoints: number;
    source: 'power' | 'state' | 'none';
  } {
    const entityId = appliance.state_entity!;
    const points = data.get(entityId) ?? [];
    const runningStates = new Set(
      (appliance.running_states && appliance.running_states.length > 0
        ? appliance.running_states
        : DEFAULT_LAUNDRY_RUNNING_STATES
      ).map(s => String(s).trim().toLowerCase())
    );
    const isRunningState = (state: string): boolean => {
      const s = String(state).trim().toLowerCase();
      if (UNAVAILABLE.has(s)) return false;
      return runningStates.has(s);
    };

    const liveState = hass.states?.[entityId]?.state;
    const liveRunning = isRunningState(String(liveState ?? ''));
    const liveChangedAt = parseTimestamp(hass.states?.[entityId]?.last_changed) ?? nowMs;

    // Walk the transitions and collect closed running stretches. A state is
    // held until the *next* sample, so the settle window is measured against
    // that — otherwise a stop followed hours later by a start reads as one run.
    const segments: Array<{ startMs: number; endMs: number }> = [];
    let openStart: number | null = null;
    let lastBelowSince: number | null = null;

    for (let i = 0; i < points.length; i++) {
      const point = points[i]!;
      const heldUntil = points[i + 1]?.t ?? nowMs;
      if (isRunningState(point.state)) {
        if (openStart === null) openStart = point.t;
        lastBelowSince = null;
        continue;
      }
      if (openStart === null) continue;
      if (lastBelowSince === null) lastBelowSince = point.t;
      // A brief pause (e.g. "paused" mid-program) shouldn't split the cycle.
      if (heldUntil - lastBelowSince >= params.settleMs) {
        segments.push({ startMs: openStart, endMs: lastBelowSince });
        openStart = null;
        lastBelowSince = null;
      }
    }

    // Reconcile the tail with the live state, which is fresher than history.
    if (openStart !== null && !liveRunning) {
      const endMs = lastBelowSince ?? liveChangedAt;
      if (nowMs - endMs >= params.settleMs) {
        segments.push({ startMs: openStart, endMs });
        openStart = null;
      }
    }
    if (openStart === null && liveRunning) {
      openStart = liveChangedAt;
    }

    const cycles: LaundryCycle[] = segments
      .filter(seg => seg.endMs - seg.startMs >= params.minDurationMs)
      .map(seg => ({
        startMs: seg.startMs,
        endMs: seg.endMs,
        durationMs: seg.endMs - seg.startMs,
        peakW: 0,
        meanW: 0,
        energyKwh: 0,
        costEstimate: 0,
      }));

    return {
      running: liveRunning || openStart !== null,
      runStart: openStart,
      cycles,
      currentW: appliance.power_entity ? numericState(hass, appliance.power_entity) : null,
      historyPoints: points.length,
      source: 'state',
    };
  }

  private _readDoor(
    hass: HomeAssistant,
    appliance: LaundryApplianceConfig,
    data: Map<string, HistoryStatePoint[]>
  ): { currentlyOpen: boolean | null; openedAfter: (sinceMs: number) => boolean } {
    const entityId = appliance.door_entity;
    if (!entityId) {
      return { currentlyOpen: null, openedAfter: () => false };
    }
    const live = hass.states?.[entityId];
    const currentlyOpen = live ? isOpenState(live.state) : null;
    const changedAt = parseTimestamp(live?.last_changed);
    const points = data.get(entityId) ?? [];

    const openedAfter = (sinceMs: number): boolean => {
      if (currentlyOpen) return true;
      // Currently closed but it changed after the cycle ended: the previous
      // state was open, so somebody has been in there.
      if (currentlyOpen === false && changedAt !== null && changedAt > sinceMs) return true;
      return points.some(point => point.t > sinceMs && isOpenState(point.state));
    };

    return { currentlyOpen, openedAfter };
  }

  computeStats(statuses: LaundryStatus[]): LaundryStats {
    let cycleCount = 0;
    let totalKwh = 0;
    let totalCost = 0;
    let totalDurationMs = 0;
    const perDay = new Map<string, number>();

    for (const status of statuses) {
      for (const cycle of status.cycles) {
        cycleCount += 1;
        totalKwh += cycle.energyKwh;
        totalCost += cycle.costEstimate;
        totalDurationMs += cycle.durationMs;
        const key = localDateKey(cycle.startMs);
        perDay.set(key, (perDay.get(key) ?? 0) + 1);
      }
    }

    let busiestDay: string | null = null;
    let busiestCount = 0;
    for (const [day, count] of perDay) {
      if (count > busiestCount) {
        busiestCount = count;
        busiestDay = day;
      }
    }

    return {
      cycleCount,
      totalKwh,
      totalCost,
      avgDurationMs: cycleCount > 0 ? totalDurationMs / cycleCount : null,
      busiestDay,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Acknowledgement (in-memory, resets on reload)                           */
  /* ---------------------------------------------------------------------- */

  /**
   * Keyed by appliance *and* cycle end, so marking one load as unloaded never
   * silences the next one.
   */
  acknowledge(applianceId: string, cycleEndMs: number): void {
    if (!applianceId || !Number.isFinite(cycleEndMs)) return;
    this._acks.set(applianceId, cycleEndMs);
  }

  isAcknowledged(applianceId: string, cycleEndMs: number): boolean {
    const acked = this._acks.get(applianceId);
    return acked !== undefined && acked === cycleEndMs;
  }

  clearAcknowledgement(applianceId: string): void {
    this._acks.delete(applianceId);
  }

  /* ---------------------------------------------------------------------- */
  /* Notifications                                                           */
  /* ---------------------------------------------------------------------- */

  /**
   * Fires the configured notify service at most once per cycle. The guard keys
   * on the cycle's `endMs`, never on elapsed time, and is persisted so a page
   * refresh cannot replay old nags. Returns true when a call was dispatched.
   */
  maybeNotify(hass: HomeAssistant | undefined, request: LaundryNotifyRequest): boolean {
    if (!hass || !request.service) return false;
    if (!request.applianceId || !Number.isFinite(request.cycleEndMs)) return false;

    const target = this._parseNotifyService(request.service);
    if (!target) return false;

    const key = `${request.moduleId}|${request.applianceId}|${Math.round(request.cycleEndMs)}`;
    const notified = this._ensureNotified();
    if (notified.has(key) || this._notifyInFlight.has(key)) return false;

    // Claim the slot before the await so a burst of renders can't race through.
    this._notifyInFlight.add(key);
    notified.add(key);
    this._persistNotified();

    Promise.resolve(
      hass.callService(target.domain, target.service, {
        title: request.title,
        message: request.message,
      })
    )
      .catch(() => {
        // Leave the guard in place on failure: a broken notify service must not
        // turn into a retry loop on every render.
      })
      .then(() => {
        this._notifyInFlight.delete(key);
      });

    return true;
  }

  hasNotified(moduleId: string, applianceId: string, cycleEndMs: number): boolean {
    return this._ensureNotified().has(`${moduleId}|${applianceId}|${Math.round(cycleEndMs)}`);
  }

  private _parseNotifyService(raw: string): { domain: string; service: string } | null {
    const value = String(raw || '').trim();
    if (!value) return null;
    const parts = value.split('.');
    if (parts.length === 1) {
      return parts[0] ? { domain: 'notify', service: parts[0] } : null;
    }
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { domain: parts[0], service: parts[1] };
    }
    return null;
  }

  private _ensureNotified(): Set<string> {
    if (this._notified) return this._notified;
    const set = new Set<string>();
    try {
      const raw = window?.localStorage?.getItem(NOTIFY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const cutoff = Date.now() - NOTIFY_RETENTION_MS;
          for (const entry of parsed) {
            if (typeof entry !== 'string') continue;
            const endMs = Number(entry.split('|')[2]);
            if (Number.isFinite(endMs) && endMs < cutoff) continue;
            set.add(entry);
          }
        }
      }
    } catch {
      /* private mode / disabled storage — in-memory guard still applies */
    }
    this._notified = set;
    return set;
  }

  private _persistNotified(): void {
    if (!this._notified) return;
    try {
      const cutoff = Date.now() - NOTIFY_RETENTION_MS;
      const keep: string[] = [];
      for (const entry of this._notified) {
        const endMs = Number(entry.split('|')[2]);
        if (Number.isFinite(endMs) && endMs < cutoff) continue;
        keep.push(entry);
      }
      window?.localStorage?.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(keep));
    } catch {
      /* storage unavailable — the in-memory set still guards this session */
    }
  }

  /** Test hook. */
  reset(): void {
    this._acks.clear();
    this._notified = new Set();
    this._notifyInFlight.clear();
    this._runCache.clear();
  }
}

export const ucLaundryTrackerService = new UltraCardLaundryTrackerService();
