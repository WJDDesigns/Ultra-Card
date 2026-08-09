import { HomeAssistant } from 'custom-card-helpers';
import type { VampirePowerModule } from '../types';
import {
  toNumericSeries,
  timeWeightedAverage,
  timeWeightedPercentile,
  type HistoryStatePoint,
  type NumericPoint,
} from './uc-history-service';
import { UcStatesMemo, statesMemoKey } from '../utils/uc-states-memo';

const powerSensorsMemo = new UcStatesMemo<PowerCandidate[]>();

/**
 * Vampire Power — standby ("phantom") load analysis.
 *
 * The whole module rests on one statistical idea: a plain average of a power
 * sensor is useless because it blends active and idle time. What we actually
 * want is the level the device sits at when nobody is using it, which is a low
 * time-weighted percentile of the wattage distribution. `timeWeightedPercentile`
 * in `uc-history-service` computes exactly that, weighting each reading by how
 * long it was held rather than by how many samples the recorder happened to
 * write.
 *
 * Everything else here exists to keep that number honest: normalizing kW series
 * to W before analysis, refusing to report a figure derived from a handful of
 * samples, and keeping whole-home meters out of a ranking of individual devices.
 */

/** A power sensor that survived discovery and is worth pulling history for. */
export interface PowerCandidate {
  entityId: string;
  name: string;
  icon: string;
  areaName?: string | undefined;
  /** Native unit; W and kW both occur in the wild. */
  unit: string;
}

/** How much of the analysis window the recorder actually covered. */
export type StandbyConfidence = 'none' | 'low' | 'medium' | 'high';

export interface StandbyAnalysis extends PowerCandidate {
  /** The computed floor, always in W regardless of the sensor's native unit. */
  standbyWatts: number;
  peakWatts: number;
  averageWatts: number;
  /** Fraction of the window spent at or near the standby floor, 0–1. */
  idleFraction: number;
  kwhPerYear: number;
  costPerDay: number;
  costPerMonth: number;
  costPerYear: number;
  /** How much of the device's total consumption is pure standby waste, 0–1. */
  wasteRatio: number;
  isOffender: boolean;
  sampleCount: number;
  confidence: StandbyConfidence;
  /** Fraction of the requested window the recorder had data for, 0–1. */
  coverage: number;
}

export interface VampireTotals {
  /** Devices that contributed to the totals (confidence 'none' is excluded). */
  deviceCount: number;
  totalStandbyWatts: number;
  totalKwhPerYear: number;
  totalCostPerDay: number;
  totalCostPerMonth: number;
  totalCostPerYear: number;
  offenderCount: number;
}

export interface VampireAnalysisResult {
  /** Standby loads between `min_standby_watts` and `max_standby_watts`. */
  ranked: StandbyAnalysis[];
  /**
   * Floors above `max_standby_watts`. These are real always-on appliances
   * (fridge compressor, aquarium, server) rather than standby waste, so they
   * are surfaced separately instead of being dropped silently.
   */
  alwaysOn: StandbyAnalysis[];
  /** Too few samples / too little window coverage to report a number. */
  insufficient: StandbyAnalysis[];
  /** Count of sensors whose floor fell below `min_standby_watts` (measurement noise). */
  belowNoiseFloor: number;
  /** Count of sensors the recorder returned no usable numeric history for. */
  noHistory: number;
}

/** Discovery inputs. `VampirePowerModule` satisfies this shape. */
export interface VampireDiscoveryConfig {
  discovery_mode?: 'auto' | 'manual' | 'both' | undefined;
  entities?: string[] | undefined;
  exclude_patterns?: string[] | undefined;
  hidden_entities?: string[] | undefined;
}

/** Analysis inputs. `VampirePowerModule` satisfies this shape. */
export interface VampireAnalysisConfig {
  history_days?: number | undefined;
  baseline_percentile?: number | undefined;
  min_standby_watts?: number | undefined;
  max_standby_watts?: number | undefined;
  energy_rate?: number | undefined;
  highlight_threshold_watts?: number | undefined;
}

export const VAMPIRE_DEFAULTS = {
  history_days: 7,
  baseline_percentile: 0.1,
  min_standby_watts: 0.5,
  max_standby_watts: 100,
  energy_rate: 0.15,
  highlight_threshold_watts: 5,
} as const;

/** Hours in a year; `W × 8760 ÷ 1000` gives kWh/year. */
export const HOURS_PER_YEAR = 8760;

/**
 * Hard cap on how many sensors we analyze. A large home can expose 100+ power
 * sensors and a 7-day recorder window for each is a lot of rows to pull over the
 * websocket. Candidates are sorted by name, so the cap is stable between renders.
 */
export const VAMPIRE_MAX_ANALYZED_SENSORS = 60;

/** Entities per recorder call. Chunking keeps any single query small. */
export const VAMPIRE_HISTORY_CHUNK_SIZE = 20;

/* -------------------------------------------------------------------------- */
/* Units                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Multiplier that converts a reading in `unit` into watts, or `null` when the
 * unit isn't a power unit we can normalize.
 *
 * Getting this wrong makes a device look 1000× better or worse than it is, so
 * the common units are matched case-sensitively first: in Home Assistant `mW`
 * is milliwatts and `MW` is megawatts, and only the casing tells them apart. A
 * lowercase `mw` is genuinely ambiguous and is rejected rather than guessed.
 */
export function wattScaleForUnit(unit: string | null | undefined): number | null {
  if (!unit) return null;
  const raw = String(unit).trim();
  if (!raw) return null;

  switch (raw) {
    case 'W':
      return 1;
    case 'kW':
      return 1000;
    case 'MW':
      return 1_000_000;
    case 'GW':
      return 1_000_000_000;
    case 'mW':
      return 0.001;
    default:
      break;
  }

  const lower = raw.toLowerCase();
  if (lower === 'w' || lower === 'watt' || lower === 'watts') return 1;
  if (lower === 'kw' || lower === 'kilowatt' || lower === 'kilowatts') return 1000;
  return null;
}

/* -------------------------------------------------------------------------- */
/* Whole-home / mains detection                                                */
/* -------------------------------------------------------------------------- */

/**
 * Tokens that mark a sensor as a house-total rather than a single device.
 *
 * This is a heuristic, not a fact: Home Assistant exposes no flag that says
 * "this meter measures the whole house". We filter on it because a mains sensor
 * has a standby floor in the hundreds of watts and would sit permanently at the
 * top of the ranking, drowning out every device a user can actually act on.
 */
const WHOLE_HOME_TOKENS = new Set([
  'total',
  'house',
  'home',
  'grid',
  'mains',
  'main',
  'net',
  'whole',
]);

/**
 * Words that carry no identity — they appear in nearly every power sensor name
 * and are stripped before deciding whether a name is "short".
 *
 * Note `consumption` lives here rather than in {@link WHOLE_HOME_TOKENS}. It is
 * a whole-home word in "Total Consumption" but an ordinary one in "Fridge Power
 * Consumption", so on its own it never excludes anything.
 */
const FILLER_TOKENS = new Set([
  'power',
  'energy',
  'sensor',
  'usage',
  'used',
  'use',
  'consumption',
  'consumed',
  'meter',
  'monitor',
  'watt',
  'watts',
  'w',
  'kw',
  'current',
  'load',
  'active',
  'apparent',
  'real',
  'instantaneous',
  'instant',
  'now',
  'live',
  'reading',
  'draw',
]);

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * True when a sensor looks like a whole-home / grid meter.
 *
 * Requires both a whole-home token AND a short "meaningful" name (at most two
 * tokens once filler words and digits are removed). The length test is what
 * keeps ordinary devices in the ranking: "Total Power" and "Home Energy Meter
 * Total Power" are excluded, while "Home Office Lamp Power" and "Main Bedroom
 * TV Power" are kept.
 */
export function isWholeHomeSensor(entityId: string, friendlyName?: string | undefined): boolean {
  const objectId = entityId.includes('.') ? entityId.slice(entityId.indexOf('.') + 1) : entityId;
  const haystacks = [objectId, friendlyName || ''].filter(h => h.trim().length > 0);

  for (const haystack of haystacks) {
    const tokens = tokenize(haystack);
    if (!tokens.some(t => WHOLE_HOME_TOKENS.has(t))) continue;
    const meaningful = tokens.filter(t => !FILLER_TOKENS.has(t) && !/^\d+$/.test(t));
    if (meaningful.length <= 2) return true;
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* Discovery                                                                   */
/* -------------------------------------------------------------------------- */

interface HassRegistryEntity {
  area_id?: string | null | undefined;
  device_id?: string | null | undefined;
}

/**
 * Reads the area name for an entity from the frontend's registry snapshots.
 * Every one of `hass.entities` / `hass.devices` / `hass.areas` is absent on
 * older cores and in tests, so each hop is guarded and the whole thing degrades
 * to "no area" rather than throwing inside a render.
 */
export function resolveAreaName(
  hass: HomeAssistant | undefined,
  entityId: string
): string | undefined {
  try {
    const anyHass = hass as unknown as
      | {
          entities?: Record<string, HassRegistryEntity> | undefined;
          devices?: Record<string, { area_id?: string | null | undefined }> | undefined;
          areas?: Record<string, { name?: string | undefined }> | undefined;
        }
      | undefined;
    const areas = anyHass?.areas;
    if (!areas) return undefined;

    const entry = anyHass?.entities?.[entityId];
    let areaId: string | undefined = entry?.area_id ?? undefined;
    if (!areaId && entry?.device_id) {
      areaId = anyHass?.devices?.[entry.device_id]?.area_id ?? undefined;
    }
    if (!areaId) return undefined;

    const name = areas[areaId]?.name;
    return typeof name === 'string' && name.trim() ? name.trim() : undefined;
  } catch {
    return undefined;
  }
}

function isNumericState(state: string | undefined): boolean {
  if (!state) return false;
  const s = String(state).trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  if (lower === 'unavailable' || lower === 'unknown' || lower === 'none') return false;
  return Number.isFinite(Number(s));
}

/**
 * Finds the power sensors this module should analyze.
 *
 * Auto mode accepts `device_class: power` sensors and anything reporting W/kW
 * with a numeric state, minus excluded patterns, dismissed entities, and the
 * whole-home heuristic. Manually listed entities bypass the whole-home
 * heuristic — an explicit pick is a stronger signal than a name guess, and this
 * is the escape hatch when the heuristic guesses wrong.
 */
/**
 * Walks every entity in the state machine, and is called from both the render
 * path and the editor, so results are cached per hass tick. The config
 * signature doubles as the cache identity since there is no module id here.
 */
export function discoverPowerSensors(
  hass: HomeAssistant | undefined,
  config: VampireDiscoveryConfig | undefined
): PowerCandidate[] {
  if (!hass?.states) return [];
  const signature = statesMemoKey(config);
  return powerSensorsMemo.read(signature, [hass.states], signature, () =>
    computePowerSensors(hass, config)
  );
}

function computePowerSensors(
  hass: HomeAssistant,
  config: VampireDiscoveryConfig | undefined
): PowerCandidate[] {
  const mode = config?.discovery_mode || 'auto';
  const patterns = (config?.exclude_patterns || [])
    .map(p =>
      String(p || '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
  const hidden = new Set(
    (config?.hidden_entities || []).map(id => String(id || '').trim()).filter(Boolean)
  );
  const manual = (config?.entities || []).map(id => String(id || '').trim()).filter(Boolean);

  const found = new Map<string, PowerCandidate>();

  const makeCandidate = (entityId: string): PowerCandidate | null => {
    const st = hass.states[entityId];
    if (!st) return null;
    const attrs = (st.attributes || {}) as Record<string, unknown>;
    const unit = typeof attrs.unit_of_measurement === 'string' ? attrs.unit_of_measurement : '';
    const friendlyName = typeof attrs.friendly_name === 'string' ? attrs.friendly_name : '';
    const icon = typeof attrs.icon === 'string' && attrs.icon ? attrs.icon : 'mdi:power-plug';

    return {
      entityId,
      name: friendlyName || entityId,
      icon,
      areaName: resolveAreaName(hass, entityId),
      unit,
    };
  };

  /** Shared gate: dismissed entities and exclude patterns apply in every mode. */
  const passesUserFilters = (entityId: string, friendlyName: string): boolean => {
    if (hidden.has(entityId)) return false;
    if (patterns.length === 0) return true;
    const idLower = entityId.toLowerCase();
    const nameLower = friendlyName.toLowerCase();
    return !patterns.some(p => idLower.includes(p) || nameLower.includes(p));
  };

  const measurableUnitScale = (attrs: Record<string, unknown>): { ok: boolean; unit: string } => {
    const unit = typeof attrs.unit_of_measurement === 'string' ? attrs.unit_of_measurement : '';
    const deviceClass = typeof attrs.device_class === 'string' ? attrs.device_class : '';
    const scale = wattScaleForUnit(unit);
    // A power sensor reporting BTU/h can't be normalized, so it isn't usable here.
    if (deviceClass === 'power') return { ok: scale !== null, unit };
    return { ok: scale === 1 || scale === 1000, unit };
  };

  if (mode !== 'manual') {
    for (const [entityId, st] of Object.entries(hass.states)) {
      if (!entityId.startsWith('sensor.')) continue;
      const attrs = (st?.attributes || {}) as Record<string, unknown>;
      const friendlyName = typeof attrs.friendly_name === 'string' ? attrs.friendly_name : '';
      if (!passesUserFilters(entityId, friendlyName)) continue;

      const { ok } = measurableUnitScale(attrs);
      if (!ok) continue;
      if (!isNumericState(st?.state)) continue;
      if (isWholeHomeSensor(entityId, friendlyName)) continue;

      const candidate = makeCandidate(entityId);
      if (candidate) found.set(entityId, candidate);
    }
  }

  if (mode !== 'auto') {
    for (const entityId of manual) {
      if (found.has(entityId)) continue;
      const st = hass.states[entityId];
      if (!st) continue;
      const attrs = (st.attributes || {}) as Record<string, unknown>;
      const friendlyName = typeof attrs.friendly_name === 'string' ? attrs.friendly_name : '';
      if (!passesUserFilters(entityId, friendlyName)) continue;
      const { ok } = measurableUnitScale(attrs);
      if (!ok) continue;

      const candidate = makeCandidate(entityId);
      if (candidate) found.set(entityId, candidate);
    }
  }

  return [...found.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

/* -------------------------------------------------------------------------- */
/* Analysis                                                                    */
/* -------------------------------------------------------------------------- */

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function resolvedAnalysisConfig(config: VampireAnalysisConfig | undefined) {
  return {
    historyDays: clamp(Number(config?.history_days ?? VAMPIRE_DEFAULTS.history_days), 1, 30),
    percentile: clamp(
      Number(config?.baseline_percentile ?? VAMPIRE_DEFAULTS.baseline_percentile),
      0.01,
      0.5
    ),
    minWatts: Math.max(0, Number(config?.min_standby_watts ?? VAMPIRE_DEFAULTS.min_standby_watts)),
    maxWatts: Math.max(1, Number(config?.max_standby_watts ?? VAMPIRE_DEFAULTS.max_standby_watts)),
    rate: Math.max(0, Number(config?.energy_rate ?? VAMPIRE_DEFAULTS.energy_rate)),
    highlight: Math.max(
      0,
      Number(config?.highlight_threshold_watts ?? VAMPIRE_DEFAULTS.highlight_threshold_watts)
    ),
  };
}

/** Rescales a series into watts. Returns the same array when already in watts. */
function toWattSeries(series: NumericPoint[], scale: number): NumericPoint[] {
  if (scale === 1) return series;
  return series.map(p => ({ t: p.t, v: p.v * scale }));
}

/**
 * Time-weighted fraction of the window spent at or near `floor`.
 *
 * "Near" is a 15% band (with a 0.5 W minimum so tiny floors don't get a
 * zero-width band), which is enough to absorb the jitter of a real power meter
 * without swallowing a genuinely higher active level.
 */
function computeIdleFraction(
  series: NumericPoint[],
  floor: number,
  startMs: number,
  endMs: number
): number {
  if (series.length === 0) return 0;
  const tolerance = Math.max(0.5, floor * 0.15);
  const ceiling = floor + tolerance;

  let idleMs = 0;
  let totalMs = 0;
  for (let i = 0; i < series.length; i++) {
    const point = series[i]!;
    const segStart = Math.max(point.t, startMs);
    const segEnd = Math.min(i + 1 < series.length ? series[i + 1]!.t : endMs, endMs);
    const dt = segEnd - segStart;
    if (dt <= 0) continue;
    totalMs += dt;
    if (point.v <= ceiling) idleMs += dt;
  }
  return totalMs > 0 ? clamp(idleMs / totalMs, 0, 1) : 0;
}

/**
 * How much of the requested window the recorder actually had data for.
 *
 * A state persists until the next one is written, so everything from the first
 * sample to the end of the window counts as covered. Interior recorder gaps
 * (a purge, an integration that was down for a day) are not detectable this way
 * and will read as covered — `sampleCount` is the backstop for that case.
 */
function computeCoverage(series: NumericPoint[], startMs: number, endMs: number): number {
  if (series.length === 0) return 0;
  const windowMs = endMs - startMs;
  if (windowMs <= 0) return 0;
  const firstT = Math.max(series[0]!.t, startMs);
  return clamp((endMs - firstT) / windowMs, 0, 1);
}

function gradeConfidence(sampleCount: number, coverage: number): StandbyConfidence {
  if (sampleCount < 5 || coverage < 0.1) return 'none';
  if (sampleCount < 24 || coverage < 0.35) return 'low';
  if (sampleCount < 120 || coverage < 0.7) return 'medium';
  return 'high';
}

/**
 * Analyzes one sensor. Returns `null` when the recorder gave us nothing numeric.
 *
 * Bucketing happens in {@link analyze}; this only produces the numbers.
 */
export function analyzeCandidate(
  candidate: PowerCandidate,
  points: HistoryStatePoint[] | undefined,
  config: VampireAnalysisConfig | undefined,
  startMs: number,
  endMs: number
): StandbyAnalysis | null {
  const raw = toNumericSeries(points);
  if (raw.length === 0) return null;

  const scale = wattScaleForUnit(candidate.unit);
  if (scale === null) return null;
  const series = toWattSeries(raw, scale);

  const cfg = resolvedAnalysisConfig(config);
  const sampleCount = series.length;

  const floorRaw = timeWeightedPercentile(series, cfg.percentile, startMs, endMs);
  const avgRaw = timeWeightedAverage(series, startMs, endMs);
  const standbyWatts = Math.max(0, floorRaw ?? 0);
  const averageWatts = Math.max(0, avgRaw ?? 0);

  let peakWatts = 0;
  for (const p of series) {
    if (p.v > peakWatts) peakWatts = p.v;
  }

  const coverage = computeCoverage(series, startMs, endMs);
  const confidence = gradeConfidence(sampleCount, coverage);
  const idleFraction = computeIdleFraction(series, standbyWatts, startMs, endMs);

  const kwhPerYear = (standbyWatts * HOURS_PER_YEAR) / 1000;
  const costPerYear = kwhPerYear * cfg.rate;

  return {
    ...candidate,
    standbyWatts,
    peakWatts,
    averageWatts,
    idleFraction,
    kwhPerYear,
    costPerDay: costPerYear / 365,
    costPerMonth: costPerYear / 12,
    costPerYear,
    wasteRatio: averageWatts > 0 ? clamp(standbyWatts / averageWatts, 0, 1) : 0,
    isOffender: standbyWatts >= cfg.highlight,
    sampleCount,
    confidence,
    coverage,
  };
}

/**
 * Turns candidates plus recorder history into the ranked standby list.
 *
 * Sensors are sorted into four buckets rather than filtered down to one list, so
 * the card can explain what it left out instead of silently showing fewer rows
 * than the user has smart plugs.
 */
export function analyze(
  candidates: PowerCandidate[],
  history: Map<string, HistoryStatePoint[]> | undefined,
  config: VampireAnalysisConfig | undefined,
  window?: { startMs: number; endMs: number } | undefined
): VampireAnalysisResult {
  const cfg = resolvedAnalysisConfig(config);
  const endMs = window?.endMs ?? Date.now();
  const startMs = window?.startMs ?? endMs - cfg.historyDays * 86400000;

  const ranked: StandbyAnalysis[] = [];
  const alwaysOn: StandbyAnalysis[] = [];
  const insufficient: StandbyAnalysis[] = [];
  let belowNoiseFloor = 0;
  let noHistory = 0;

  for (const candidate of candidates) {
    const points = history?.get(candidate.entityId);
    const analysis = analyzeCandidate(candidate, points, config, startMs, endMs);
    if (!analysis) {
      noHistory += 1;
      continue;
    }

    // A floor below the noise threshold isn't standby waste whatever the sample
    // count, so it's dropped before the confidence check to keep the "needs more
    // history" footnote about devices that would actually matter.
    if (analysis.standbyWatts < cfg.minWatts) {
      belowNoiseFloor += 1;
      continue;
    }
    if (analysis.confidence === 'none') {
      insufficient.push(analysis);
      continue;
    }
    if (analysis.standbyWatts > cfg.maxWatts) {
      alwaysOn.push(analysis);
      continue;
    }
    ranked.push(analysis);
  }

  return { ranked, alwaysOn, insufficient, belowNoiseFloor, noHistory };
}

/**
 * Sums a ranked list. Low-confidence-'none' entries are skipped so a sensor with
 * four samples can never inflate the headline figure.
 */
export function computeTotals(analyses: StandbyAnalysis[]): VampireTotals {
  let totalStandbyWatts = 0;
  let totalCostPerYear = 0;
  let offenderCount = 0;
  let deviceCount = 0;

  for (const a of analyses) {
    if (a.confidence === 'none') continue;
    deviceCount += 1;
    totalStandbyWatts += a.standbyWatts;
    totalCostPerYear += a.costPerYear;
    if (a.isOffender) offenderCount += 1;
  }

  return {
    deviceCount,
    totalStandbyWatts,
    totalKwhPerYear: (totalStandbyWatts * HOURS_PER_YEAR) / 1000,
    totalCostPerDay: totalCostPerYear / 365,
    totalCostPerMonth: totalCostPerYear / 12,
    totalCostPerYear,
    offenderCount,
  };
}

/**
 * Orders the ranking.
 *
 * Cost and watts produce the same sequence whenever a single energy rate is in
 * play (cost is watts times a constant), so `cost` breaks ties on `wasteRatio`:
 * between two devices idling at the same wattage, the one that is almost purely
 * standby is the better thing to unplug.
 */
export function sortAnalyses(
  analyses: StandbyAnalysis[],
  mode: 'cost' | 'watts' | 'name' | undefined
): StandbyAnalysis[] {
  const copy = [...analyses];
  if (mode === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return copy;
  }
  if (mode === 'watts') {
    copy.sort((a, b) => b.standbyWatts - a.standbyWatts || a.name.localeCompare(b.name));
    return copy;
  }
  copy.sort(
    (a, b) =>
      b.costPerYear - a.costPerYear || b.wasteRatio - a.wasteRatio || a.name.localeCompare(b.name)
  );
  return copy;
}

/* -------------------------------------------------------------------------- */
/* Formatting + query helpers                                                  */
/* -------------------------------------------------------------------------- */

/** Splits entity ids into recorder-sized batches. */
export function chunkEntityIds(entityIds: string[], size: number): string[][] {
  const chunkSize = Math.max(1, size);
  const out: string[][] = [];
  for (let i = 0; i < entityIds.length; i += chunkSize) {
    out.push(entityIds.slice(i, i + chunkSize));
  }
  return out;
}

/** One decimal below 10 W, whole numbers above — 3.4 W matters, 127.4 W doesn't. */
export function formatWatts(watts: number, locale?: string | undefined): string {
  if (!Number.isFinite(watts)) return '0';
  const decimals = Math.abs(watts) < 10 ? 1 : 0;
  try {
    return new Intl.NumberFormat(locale || undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(watts);
  } catch {
    return watts.toFixed(decimals);
  }
}

/**
 * Formats a money amount with the user's locale grouping and their chosen
 * symbol. `currency_symbol` is a free-text symbol rather than an ISO code, so we
 * format the number and prefix the symbol instead of using `style: 'currency'`.
 */
export function formatCost(
  value: number,
  symbol: string | undefined,
  locale?: string | undefined
): string {
  const safe = Number.isFinite(value) ? value : 0;
  const decimals = Math.abs(safe) < 10 ? 2 : 0;
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(locale || undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(safe);
  } catch {
    formatted = safe.toFixed(decimals);
  }
  return `${symbol ?? '$'}${formatted}`;
}

/** Picks the cost field matching the configured display period. */
export function costForPeriod(
  analysis: Pick<StandbyAnalysis, 'costPerDay' | 'costPerMonth' | 'costPerYear'>,
  period: 'day' | 'month' | 'year' | undefined
): number {
  if (period === 'day') return analysis.costPerDay;
  if (period === 'month') return analysis.costPerMonth;
  return analysis.costPerYear;
}

/** Same as {@link costForPeriod} for a totals object. */
export function totalForPeriod(
  totals: VampireTotals,
  period: 'day' | 'month' | 'year' | undefined
): number {
  if (period === 'day') return totals.totalCostPerDay;
  if (period === 'month') return totals.totalCostPerMonth;
  return totals.totalCostPerYear;
}

/** Convenience for callers holding a full module config. */
export function analyzeModule(
  hass: HomeAssistant | undefined,
  module: VampirePowerModule,
  history: Map<string, HistoryStatePoint[]> | undefined,
  window?: { startMs: number; endMs: number } | undefined
): VampireAnalysisResult {
  const candidates = discoverPowerSensors(hass, module).slice(0, VAMPIRE_MAX_ANALYZED_SENSORS);
  return analyze(candidates, history, module, window);
}
