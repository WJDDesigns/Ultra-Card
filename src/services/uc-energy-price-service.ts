/**
 * Energy Price & EV Charging — parsing and planning.
 *
 * Everything above the `UcEnergyPriceService` class is pure: it takes plain
 * attribute objects, service responses, slots and instants, and returns new
 * values. The module only gathers inputs (hass states, config) and renders.
 *
 * Price sources normalize to `PriceSlot { start, end, price }` with absolute
 * instants, so 15-minute and hourly data, DST days (23 or 25 hours) and mixed
 * offsets all go through the same window/plan math.
 */
import type { HomeAssistant } from '../ha/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PriceSlot {
  start: Date;
  end: Date;
  /** Price per kWh in the source's unit (or adjusted, once `adjustSlots` ran). */
  price: number;
}

export type PriceFormat =
  | 'nordpool'
  | 'nordpool_core'
  | 'tibber'
  | 'energi_data_service'
  | 'entsoe'
  | 'octopus'
  | 'amber'
  | 'generic'
  | 'none';

/** Formats whose slots come from a service call rather than from attributes. */
export const ACTION_FORMATS: ReadonlySet<PriceFormat> = new Set(['nordpool_core', 'tibber']);

export type PriceLevel = 'cheap' | 'normal' | 'expensive';

export type ThresholdMode = 'relative' | 'percentile' | 'absolute';

export interface LevelConfig {
  mode: ThresholdMode;
  /** relative: % of the day's min→max range; percentile: % of the day's slots. */
  cheapPercent: number;
  expensivePercent: number;
  /** absolute mode, in the adjusted price unit. */
  cheapPrice: number;
  expensivePrice: number;
}

export interface DayStats {
  min: number;
  max: number;
  /** Time-weighted average, so mixed 15-min/hourly data is not skewed. */
  avg: number;
  minSlot: PriceSlot;
  maxSlot: PriceSlot;
  count: number;
}

export interface PriceWindow {
  start: Date;
  end: Date;
  avgPrice: number;
  /** The pieces of each slot the window uses (clipped to the window). */
  parts: PriceSlot[];
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ChargeSegment extends PriceSlot {
  kwh: number;
}

export interface ChargePlan {
  /** Chosen slot pieces, in time order. */
  segments: ChargeSegment[];
  /** `segments` merged into contiguous ranges, for display. */
  ranges: TimeRange[];
  hoursPlanned: number;
  kwh: number;
  cost: number;
  avgPrice: number;
  /** False when the time before departure (or the published prices) is too short. */
  feasible: boolean;
  shortfallHours: number;
}

export interface EvNeedInput {
  currentSoc: number;
  targetSoc: number;
  capacityKwh: number;
  /** Charging efficiency, 0–100. Grid energy = battery energy / efficiency. */
  efficiencyPercent: number;
  powerKw: number;
}

export interface EvNeed {
  /** Energy drawn from the grid. */
  kwhNeeded: number;
  hoursNeeded: number;
}

type Attrs = Record<string, unknown>;
type StateMap = Record<string, { state?: string; attributes?: Attrs } | undefined>;

const HOUR_MS = 3600000;
/** Gaps up to this are treated as contiguous (rounding in source timestamps). */
const CONTIGUOUS_TOLERANCE_MS = 1000;

// ─── Primitive coercion ──────────────────────────────────────────────────────

/** Number from a number or numeric string; null for anything else (NaN, '', null). */
export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Date from an ISO string, epoch milliseconds or a Date; null when invalid. */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string' && value.trim()) {
    // "2024-05-10 13:00:00+02:00" (space separator) is not ISO; Safari rejects it.
    const s = value.trim().replace(/^(\d{4}-\d{2}-\d{2}) (\d)/, '$1T$2');
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function isRecord(value: unknown): value is Attrs {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

// ─── Local time helpers (DST-safe) ───────────────────────────────────────────

/**
 * Local midnight-to-midnight bounds of the day containing `ref`, shifted by
 * `offsetDays`. Built with setDate/setHours, so a DST day is 23 or 25 hours.
 */
export function localDayBounds(ref: Date, offsetDays = 0): TimeRange {
  const start = new Date(ref.getTime());
  start.setHours(0, 0, 0, 0);
  if (offsetDays) start.setDate(start.getDate() + offsetDays);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

/** Local calendar date as YYYY-MM-DD. */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses "HH:MM" or "HH:MM:SS" into minutes after midnight; null when invalid. */
export function parseTimeOfDay(value: unknown): { hours: number; minutes: number } | null {
  if (typeof value !== 'string') return null;
  const m = /^\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*$/.exec(value);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/**
 * Next local occurrence of a time of day strictly after `after`. DST-safe:
 * the day is advanced with setDate before the clock time is applied again.
 */
export function nextTimeOfDay(hhmm: string, after: Date): Date | null {
  const t = parseTimeOfDay(hhmm);
  if (!t) return null;
  const candidate = new Date(after.getTime());
  candidate.setHours(t.hours, t.minutes, 0, 0);
  if (candidate.getTime() <= after.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(t.hours, t.minutes, 0, 0);
  }
  return candidate;
}

/**
 * Departure from an entity state: a time of day ("07:30:00", input_datetime with
 * has_date: false) or a full timestamp. Past timestamps return null so the caller
 * can fall back to the configured time.
 */
export function parseDepartureState(state: unknown, now: Date): Date | null {
  if (typeof state !== 'string') return null;
  if (parseTimeOfDay(state)) return nextTimeOfDay(state, now);
  const d = toDate(state);
  if (!d || d.getTime() <= now.getTime()) return null;
  return d;
}

// ─── Slot normalization ──────────────────────────────────────────────────────

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Sorted, de-duplicated slots with every `end` filled in. Missing ends come
 * from the next slot's start, or the typical spacing for the last slot (1 h
 * when there is nothing to infer from). Later duplicates of a start win.
 */
export function normalizeSlots(
  raw: Array<{ start: Date; end?: Date | null | undefined; price: number }>
): PriceSlot[] {
  const byStart = new Map<number, { start: Date; end?: Date | null | undefined; price: number }>();
  for (const s of raw) {
    if (!s || !(s.start instanceof Date) || Number.isNaN(s.start.getTime())) continue;
    if (!Number.isFinite(s.price)) continue;
    byStart.set(s.start.getTime(), s);
  }
  const sorted = [...byStart.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
  const diffs: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    diffs.push(sorted[i].start.getTime() - sorted[i - 1].start.getTime());
  }
  const typical = median(diffs.filter(d => d > 0 && d <= 3 * HOUR_MS)) || HOUR_MS;

  const out: PriceSlot[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    const next = sorted[i + 1];
    let end = s.end && s.end.getTime() > s.start.getTime() ? s.end : null;
    if (!end) {
      const gap = next ? next.start.getTime() - s.start.getTime() : 0;
      end = new Date(s.start.getTime() + (gap > 0 && gap <= 3 * HOUR_MS ? gap : typical));
    }
    // Overlap guard: a slot never runs past the next one's start.
    if (next && end.getTime() > next.start.getTime()) end = new Date(next.start.getTime());
    out.push({ start: s.start, end, price: s.price });
  }
  return out;
}

const START_KEYS = [
  'start',
  'start_time',
  'startsAt',
  'starts_at',
  'from',
  'valid_from',
  'period_start',
  'time',
  'hour',
  'datetime',
  'date',
];
const END_KEYS = ['end', 'end_time', 'endsAt', 'ends_at', 'till', 'to', 'until', 'valid_to', 'period_end'];
const PRICE_KEYS = [
  'value_inc_vat',
  'per_kwh',
  'price_per_kwh',
  'price',
  'value',
  'total',
  'cost',
];

function pick(obj: Attrs, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

/**
 * Slots from a list of objects with any of the common start/end/price keys
 * (Nord Pool raw_*, Energi Data Service, ENTSO-e, Octopus rates, Amber
 * forecasts, Tibber responses and most custom integrations). Entries with a
 * null price (Nord Pool before tomorrow is published) are dropped.
 */
export function parseGenericSlots(list: unknown, priceScale = 1): PriceSlot[] {
  if (!Array.isArray(list)) return [];
  const raw: Array<{ start: Date; end?: Date | null; price: number }> = [];
  for (const item of list) {
    if (!isRecord(item)) continue;
    const start = toDate(pick(item, START_KEYS));
    const price = toNumber(pick(item, PRICE_KEYS));
    if (!start || price === null) continue;
    raw.push({ start, end: toDate(pick(item, END_KEYS)), price: price * priceScale });
  }
  return normalizeSlots(raw);
}

/**
 * Slots from a bare value array spread evenly across [dayStart, dayEnd). The
 * spacing comes from the real length of the day, so 23 hourly values on a
 * spring-forward day (or 92 quarter-hours) line up with the wall clock.
 */
export function slotsFromValueArray(values: unknown, dayStart: Date, dayEnd: Date): PriceSlot[] {
  if (!Array.isArray(values) || values.length === 0) return [];
  const span = dayEnd.getTime() - dayStart.getTime();
  if (span <= 0) return [];
  const step = span / values.length;
  const out: PriceSlot[] = [];
  values.forEach((v, i) => {
    const price = toNumber(v);
    if (price === null) return;
    const start = new Date(Math.round(dayStart.getTime() + i * step));
    const end = new Date(Math.round(dayStart.getTime() + (i + 1) * step));
    out.push({ start, end, price });
  });
  return out;
}

// ─── Per-source parsers ──────────────────────────────────────────────────────

/** custom-components/nordpool: raw_today/raw_tomorrow, else the today/tomorrow arrays. */
export function parseNordpoolAttributes(attrs: Attrs | undefined, now: Date): PriceSlot[] {
  if (!attrs) return [];
  const rawToday = parseGenericSlots(attrs.raw_today);
  const tomorrowValid = attrs.tomorrow_valid !== false;
  const rawTomorrow = tomorrowValid ? parseGenericSlots(attrs.raw_tomorrow) : [];
  if (rawToday.length || rawTomorrow.length) return normalizeSlots([...rawToday, ...rawTomorrow]);

  const today = localDayBounds(now);
  const tomorrow = localDayBounds(now, 1);
  return normalizeSlots([
    ...slotsFromValueArray(attrs.today, today.start, today.end),
    ...(tomorrowValid ? slotsFromValueArray(attrs.tomorrow, tomorrow.start, tomorrow.end) : []),
  ]);
}

/** Energi Data Service: raw_today/raw_tomorrow entries of {hour, price}. */
export function parseEnergiDataService(attrs: Attrs | undefined): PriceSlot[] {
  if (!attrs) return [];
  const tomorrowValid = attrs.tomorrow_valid !== false;
  return normalizeSlots([
    ...parseGenericSlots(attrs.raw_today),
    ...(tomorrowValid ? parseGenericSlots(attrs.raw_tomorrow) : []),
  ]);
}

/** ENTSO-e (JaccoR/hass-entso-e): `prices` (both days) or prices_today/prices_tomorrow. */
export function parseEntsoe(attrs: Attrs | undefined): PriceSlot[] {
  if (!attrs) return [];
  const all = parseGenericSlots(attrs.prices);
  if (all.length) return all;
  return normalizeSlots([
    ...parseGenericSlots(attrs.prices_today),
    ...parseGenericSlots(attrs.prices_tomorrow),
  ]);
}

/** Octopus Energy (BottlecapDave) day-rate events: `rates` of {start, end, value_inc_vat}. */
export function parseOctopusRates(...attrList: Array<Attrs | undefined>): PriceSlot[] {
  const raw: PriceSlot[] = [];
  for (const attrs of attrList) {
    if (attrs) raw.push(...parseGenericSlots(attrs.rates));
  }
  return normalizeSlots(raw);
}

/** Amber Electric: `forecasts` of {start_time, end_time, per_kwh}. */
export function parseAmberForecasts(attrs: Attrs | undefined): PriceSlot[] {
  if (!attrs) return [];
  return parseGenericSlots(attrs.forecasts);
}

/** Unwraps `{ context, response }` from a frontend call_service with return_response. */
export function unwrapServiceResponse(value: unknown): unknown {
  if (isRecord(value) && 'response' in value && isRecord(value.response)) return value.response;
  return value;
}

function firstValue(map: Attrs): unknown {
  const keys = Object.keys(map);
  return keys.length ? map[keys[0] as string] : undefined;
}

/**
 * Core HA Nord Pool `nordpool.get_prices_for_date`: `{ SE3: [{start, end, price}] }`.
 * Prices come per MWh; `perMwh` converts them to per kWh like the sensors show.
 * `areaHint` (usually the entity id) picks the area when several are returned.
 */
export function parseNordpoolCoreResponse(
  response: unknown,
  areaHint?: string,
  perMwh = true
): PriceSlot[] {
  const body = unwrapServiceResponse(response);
  if (!isRecord(body)) return [];
  let list: unknown;
  if (areaHint) {
    const hint = areaHint.toLowerCase();
    const key = Object.keys(body).find(k =>
      new RegExp(`(^|[^a-z0-9])${k.toLowerCase()}([^a-z0-9]|$)`).test(hint)
    );
    list = key ? body[key] : undefined;
  }
  if (list === undefined) list = firstValue(body);
  return parseGenericSlots(list, perMwh ? 1 / 1000 : 1);
}

/**
 * Core HA Tibber `tibber.get_prices`: `{ prices: { "Home": [{start_time, price}] } }`.
 * `homeHint` (e.g. the sensor's friendly name) picks the home when there are several.
 */
export function parseTibberResponse(response: unknown, homeHint?: string): PriceSlot[] {
  const body = unwrapServiceResponse(response);
  if (!isRecord(body)) return [];
  const prices = isRecord(body.prices) ? body.prices : body;
  if (!isRecord(prices)) return [];
  const keys = Object.keys(prices);
  let list: unknown;
  if (homeHint) {
    const h = homeHint.toLowerCase();
    const key = keys.find(k => h.includes(k.toLowerCase()));
    if (key) list = prices[key];
  }
  if (list === undefined) list = firstValue(prices);
  return parseGenericSlots(list);
}

// ─── Format detection ────────────────────────────────────────────────────────

const OCTOPUS_RE =
  /^(?:sensor|event)\.(octopus_energy_electricity_.+?)_(current_rate|previous_rate|next_rate|current_day_rates|previous_day_rates|next_day_rates)$/;

/** Sibling day-rate event ids for any Octopus electricity rate entity. */
export function octopusSiblingIds(entityId: string): { current: string; next: string } | null {
  const m = OCTOPUS_RE.exec(entityId || '');
  if (!m) return null;
  return {
    current: `event.${m[1]}_current_day_rates`,
    next: `event.${m[1]}_next_day_rates`,
  };
}

function firstItem(value: unknown): Attrs | null {
  if (!Array.isArray(value)) return null;
  const found = value.find(isRecord);
  return found ?? null;
}

/**
 * Which integration a price entity comes from. Attribute shapes are checked
 * first (they are unambiguous); the entity registry `platform` covers the core
 * Nord Pool and Tibber integrations, whose sensors carry no price list.
 */
export function detectPriceFormat(
  entityId: string,
  attributes: Attrs | undefined,
  platform?: string
): PriceFormat {
  const attrs = attributes || {};
  const id = entityId || '';

  if (Array.isArray(attrs.rates) || OCTOPUS_RE.test(id)) return 'octopus';
  if (Array.isArray(attrs.forecasts)) return 'amber';

  const rawToday = firstItem(attrs.raw_today) || firstItem(attrs.raw_tomorrow);
  if (rawToday) {
    if ('hour' in rawToday) return 'energi_data_service';
    if ('value' in rawToday) return 'nordpool';
    return 'energi_data_service';
  }
  if (Array.isArray(attrs.today) && ('tomorrow_valid' in attrs || Array.isArray(attrs.tomorrow))) {
    return 'nordpool';
  }
  if (Array.isArray(attrs.prices_today) || Array.isArray(attrs.prices)) {
    const sample = firstItem(attrs.prices) || firstItem(attrs.prices_today);
    if (sample && ('time' in sample || 'price' in sample)) return 'entsoe';
  }

  const p = (platform || '').toLowerCase();
  if (p === 'nordpool' || /^sensor\.nord_pool_/.test(id)) return 'nordpool_core';
  if (p === 'tibber') return 'tibber';

  for (const value of Object.values(attrs)) {
    if (Array.isArray(value) && parseGenericSlots(value).length >= 2) return 'generic';
  }
  return 'none';
}

/**
 * Slots for an attribute-based format, read straight from the state machine.
 * Octopus reads both day-rate events next to the chosen entity.
 */
export function collectAttributeSlots(
  format: PriceFormat,
  entityId: string,
  states: StateMap,
  now: Date
): PriceSlot[] {
  const attrs = states[entityId]?.attributes;
  switch (format) {
    case 'nordpool':
      return parseNordpoolAttributes(attrs, now);
    case 'energi_data_service':
      return parseEnergiDataService(attrs);
    case 'entsoe':
      return parseEntsoe(attrs);
    case 'amber':
      return parseAmberForecasts(attrs);
    case 'octopus': {
      const sib = octopusSiblingIds(entityId);
      const list: Array<Attrs | undefined> = [attrs];
      if (sib) list.push(states[sib.current]?.attributes, states[sib.next]?.attributes);
      return parseOctopusRates(...list);
    }
    case 'generic': {
      if (!attrs) return [];
      let best: PriceSlot[] = [];
      for (const value of Object.values(attrs)) {
        const slots = Array.isArray(value) ? parseGenericSlots(value) : [];
        if (slots.length > best.length) best = slots;
      }
      return best;
    }
    default:
      return [];
  }
}

// ─── Prices, stats and levels ────────────────────────────────────────────────

/** Price after fees/VAT: `price × multiplier + additive`. */
export function adjustPrice(price: number, multiplier = 1, additive = 0): number {
  const m = Number.isFinite(multiplier) ? multiplier : 1;
  const a = Number.isFinite(additive) ? additive : 0;
  return price * m + a;
}

export function adjustSlots(slots: PriceSlot[], multiplier = 1, additive = 0): PriceSlot[] {
  if (multiplier === 1 && additive === 0) return slots;
  return slots.map(s => ({ start: s.start, end: s.end, price: adjustPrice(s.price, multiplier, additive) }));
}

/** Slot covering instant `t` (start inclusive, end exclusive). */
export function slotAt(slots: PriceSlot[], t: Date): PriceSlot | null {
  const ms = t.getTime();
  return slots.find(s => s.start.getTime() <= ms && ms < s.end.getTime()) || null;
}

/** Slots overlapping [start, end). */
export function slotsInRange(slots: PriceSlot[], start: Date, end: Date): PriceSlot[] {
  const a = start.getTime();
  const b = end.getTime();
  return slots.filter(s => s.end.getTime() > a && s.start.getTime() < b);
}

/** Slots that start inside the local day of `ref` (+ offset). */
export function slotsForDay(slots: PriceSlot[], ref: Date, offsetDays = 0): PriceSlot[] {
  const { start, end } = localDayBounds(ref, offsetDays);
  const a = start.getTime();
  const b = end.getTime();
  return slots.filter(s => s.start.getTime() >= a && s.start.getTime() < b);
}

export function computeStats(slots: PriceSlot[]): DayStats | null {
  if (!slots.length) return null;
  let minSlot = slots[0];
  let maxSlot = slots[0];
  let weighted = 0;
  let total = 0;
  for (const s of slots) {
    if (s.price < minSlot.price) minSlot = s;
    if (s.price > maxSlot.price) maxSlot = s;
    const dur = Math.max(0, s.end.getTime() - s.start.getTime());
    weighted += s.price * dur;
    total += dur;
  }
  const avg = total > 0 ? weighted / total : slots.reduce((a, s) => a + s.price, 0) / slots.length;
  return { min: minSlot.price, max: maxSlot.price, avg, minSlot, maxSlot, count: slots.length };
}

/** Cheap / normal / expensive for `price` against the reference prices of its day. */
export function priceLevel(price: number, refs: number[], cfg: LevelConfig): PriceLevel {
  if (cfg.mode === 'absolute') {
    if (price <= cfg.cheapPrice) return 'cheap';
    if (price >= cfg.expensivePrice) return 'expensive';
    return 'normal';
  }
  if (!refs.length) return 'normal';
  if (cfg.mode === 'percentile') {
    const atOrBelow = refs.filter(r => r <= price + 1e-12).length;
    const pct = (atOrBelow / refs.length) * 100;
    if (pct <= cfg.cheapPercent) return 'cheap';
    if (pct > cfg.expensivePercent) return 'expensive';
    return 'normal';
  }
  const min = Math.min(...refs);
  const max = Math.max(...refs);
  if (max - min < 1e-9) return 'normal';
  const pos = ((price - min) / (max - min)) * 100;
  if (pos <= cfg.cheapPercent) return 'cheap';
  if (pos >= cfg.expensivePercent) return 'expensive';
  return 'normal';
}

// ─── Windows and plans ───────────────────────────────────────────────────────

/** Remaining slots from `now`, the current one clipped to start at `now`. */
export function upcomingSegments(slots: PriceSlot[], now: Date): PriceSlot[] {
  const t = now.getTime();
  const out: PriceSlot[] = [];
  for (const s of slots) {
    if (s.end.getTime() <= t) continue;
    out.push(s.start.getTime() < t ? { start: new Date(t), end: s.end, price: s.price } : s);
  }
  return out;
}

/**
 * Cheapest contiguous run of `durationHours` starting at or after `now` (the
 * first candidate is "start now"). With a deadline the run must also end by it.
 * Ties go to the earliest start. Null when no published run fits.
 */
export function findCheapestWindow(
  slots: PriceSlot[],
  now: Date,
  durationHours: number,
  deadline?: Date | null
): PriceWindow | null {
  const durationMs = Math.round(durationHours * HOUR_MS);
  if (!(durationMs > 0)) return null;
  const segs = upcomingSegments(slots, now);
  const limit = deadline ? deadline.getTime() : Infinity;
  let best: PriceWindow | null = null;

  for (let i = 0; i < segs.length; i++) {
    const startMs = segs[i].start.getTime();
    if (startMs + durationMs > limit) break;
    let remaining = durationMs;
    let cost = 0;
    const parts: PriceSlot[] = [];
    let ok = false;
    for (let j = i; j < segs.length; j++) {
      const seg = segs[j];
      if (j > i && seg.start.getTime() - segs[j - 1].end.getTime() > CONTIGUOUS_TOLERANCE_MS) break;
      const segMs = seg.end.getTime() - seg.start.getTime();
      const take = Math.min(remaining, segMs);
      cost += seg.price * take;
      parts.push({ start: seg.start, end: new Date(seg.start.getTime() + take), price: seg.price });
      remaining -= take;
      if (remaining <= 0) {
        ok = true;
        break;
      }
    }
    if (!ok) continue;
    const endMs = startMs + durationMs;
    if (endMs > limit) continue;
    const avgPrice = cost / durationMs;
    if (!best || avgPrice < best.avgPrice - 1e-12) {
      best = { start: new Date(startMs), end: new Date(endMs), avgPrice, parts };
    }
  }
  return best;
}

/** Battery energy needed from the grid and the time it takes at `powerKw`. */
export function computeEvNeed(input: EvNeedInput): EvNeed {
  const current = Math.min(100, Math.max(0, input.currentSoc));
  const target = Math.min(100, Math.max(0, input.targetSoc));
  const capacity = Math.max(0, input.capacityKwh);
  const eff = Math.min(100, Math.max(1, input.efficiencyPercent || 100)) / 100;
  const batteryKwh = Math.max(0, ((target - current) / 100) * capacity);
  const kwhNeeded = batteryKwh / eff;
  const hoursNeeded = input.powerKw > 0 ? kwhNeeded / input.powerKw : 0;
  return { kwhNeeded, hoursNeeded };
}

/** Merges touching time ranges (pieces within a second of each other). */
export function mergeRanges(pieces: Array<{ start: Date; end: Date }>): TimeRange[] {
  const sorted = [...pieces].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: TimeRange[] = [];
  for (const p of sorted) {
    const last = out[out.length - 1];
    if (last && p.start.getTime() - last.end.getTime() <= CONTIGUOUS_TOLERANCE_MS) {
      if (p.end.getTime() > last.end.getTime()) last.end = new Date(p.end.getTime());
    } else {
      out.push({ start: new Date(p.start.getTime()), end: new Date(p.end.getTime()) });
    }
  }
  return out;
}

function finishPlan(
  pieces: PriceSlot[],
  powerKw: number,
  hoursNeeded: number,
  feasible: boolean
): ChargePlan {
  const segments: ChargeSegment[] = pieces
    .map(p => ({ ...p, kwh: ((p.end.getTime() - p.start.getTime()) / HOUR_MS) * powerKw }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const hoursPlanned = segments.reduce((a, s) => a + (s.end.getTime() - s.start.getTime()) / HOUR_MS, 0);
  const kwh = segments.reduce((a, s) => a + s.kwh, 0);
  const cost = segments.reduce((a, s) => a + s.kwh * s.price, 0);
  return {
    segments,
    ranges: mergeRanges(segments),
    hoursPlanned,
    kwh,
    cost,
    avgPrice: kwh > 0 ? cost / kwh : 0,
    feasible,
    shortfallHours: Math.max(0, hoursNeeded - hoursPlanned),
  };
}

/**
 * Cheapest charging slots between `now` and `deadline` covering `hoursNeeded`.
 *
 * Split mode picks the cheapest slots anywhere in the window (the last one only
 * partly). Contiguous mode uses the cheapest unbroken run. When there is not
 * enough published time before departure the plan charges in every remaining
 * slot and reports `feasible: false` with the shortfall.
 */
export function planCharging(
  slots: PriceSlot[],
  now: Date,
  deadline: Date,
  hoursNeeded: number,
  powerKw: number,
  allowSplit: boolean
): ChargePlan {
  if (!(hoursNeeded > 0) || !(powerKw > 0)) return finishPlan([], powerKw, 0, true);
  const limit = deadline.getTime();
  const available: PriceSlot[] = [];
  for (const s of upcomingSegments(slots, now)) {
    if (s.start.getTime() >= limit) continue;
    available.push(s.end.getTime() > limit ? { start: s.start, end: new Date(limit), price: s.price } : s);
  }
  const neededMs = Math.round(hoursNeeded * HOUR_MS);
  const availableMs = available.reduce((a, s) => a + (s.end.getTime() - s.start.getTime()), 0);
  if (availableMs < neededMs) return finishPlan(available, powerKw, hoursNeeded, false);

  if (!allowSplit) {
    const win = findCheapestWindow(available, now, hoursNeeded, deadline);
    if (!win) return finishPlan(available, powerKw, hoursNeeded, false);
    return finishPlan(win.parts, powerKw, hoursNeeded, true);
  }

  const byPrice = [...available].sort(
    (a, b) => a.price - b.price || a.start.getTime() - b.start.getTime()
  );
  const chosen: PriceSlot[] = [];
  let remaining = neededMs;
  for (const s of byPrice) {
    if (remaining <= 0) break;
    const segMs = s.end.getTime() - s.start.getTime();
    const take = Math.min(segMs, remaining);
    chosen.push({ start: s.start, end: new Date(s.start.getTime() + take), price: s.price });
    remaining -= take;
  }
  return finishPlan(chosen, powerKw, hoursNeeded, true);
}

/**
 * Slots for the chart: today (and tomorrow when published and wanted), or
 * `chartHours` from the start of the current hour.
 */
export function chartRange(
  slots: PriceSlot[],
  now: Date,
  chartHours: number,
  showTomorrow: boolean
): TimeRange {
  if (chartHours > 0) {
    const start = new Date(now.getTime());
    start.setMinutes(0, 0, 0);
    return { start, end: new Date(start.getTime() + chartHours * HOUR_MS) };
  }
  const today = localDayBounds(now);
  const tomorrow = localDayBounds(now, 1);
  const hasTomorrow = showTomorrow && slotsForDay(slots, now, 1).length > 0;
  return { start: today.start, end: hasTomorrow ? tomorrow.end : today.end };
}

/** Power in kW from a sensor value and its unit (W unless the unit says kW/MW). */
export function powerToKw(value: number, unit: unknown): number {
  const u = typeof unit === 'string' ? unit.trim().toLowerCase() : '';
  if (u === 'kw') return value;
  if (u === 'mw') return value * 1000;
  if (u === 'w') return value / 1000;
  // Unitless: anything above 100 is almost certainly watts.
  return value > 100 ? value / 1000 : value;
}

// ─── Service-backed sources (core Nord Pool, Tibber) ─────────────────────────

interface FetchEntry {
  slots: PriceSlot[];
  fetchedAt: number;
  loading: boolean;
  error: string;
  dayKey: string;
}

export interface ActionFetchOptions {
  format: PriceFormat;
  entityId: string;
  /** Core Nord Pool config entry id; looked up from the entity registry when blank. */
  configEntry?: string | undefined;
  /** Area or home name override. */
  hint?: string | undefined;
}

type HassWs = Pick<HomeAssistant, 'states'> & { callWS?: HomeAssistant['callWS'] | undefined };

const REFRESH_MS = 30 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;

function formatLocalDateTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${localDateKey(d)} ${hh}:${mm}:00`;
}

/**
 * Fetches price lists for integrations that expose them only through an
 * action with `return_response` (core Nord Pool, core Tibber). Cached per
 * entity and calendar day; the module renders whatever is cached and repaints
 * from `onUpdate` once a fetch lands.
 */
export class UcEnergyPriceService {
  private _cache = new Map<string, FetchEntry>();
  private _configEntries = new Map<string, string>();

  getActionSlots(hass: HassWs, opts: ActionFetchOptions, onUpdate: () => void): FetchEntry {
    const now = new Date();
    const dayKey = localDateKey(now);
    const key = `${opts.format}|${opts.entityId}|${opts.configEntry || ''}|${opts.hint || ''}`;
    let entry = this._cache.get(key);
    if (!entry) {
      entry = { slots: [], fetchedAt: 0, loading: false, error: '', dayKey };
      this._cache.set(key, entry);
    }
    const age = Date.now() - entry.fetchedAt;
    const hasTomorrow = slotsForDay(entry.slots, now, 1).length > 0;
    const stale =
      entry.fetchedAt === 0 ||
      entry.dayKey !== dayKey ||
      (entry.error ? age > RETRY_MS : age > REFRESH_MS && !hasTomorrow);
    if (stale && !entry.loading && typeof hass?.callWS === 'function') {
      entry.loading = true;
      const target = entry;
      void this._fetch(hass, opts, now)
        .then(slots => {
          target.slots = slots;
          target.error = '';
        })
        .catch((err: unknown) => {
          target.error = err instanceof Error ? err.message : String(err ?? 'error');
        })
        .then(() => {
          target.loading = false;
          target.fetchedAt = Date.now();
          target.dayKey = dayKey;
          onUpdate();
        });
    }
    return entry;
  }

  private async _callService(
    hass: HassWs,
    domain: string,
    service: string,
    serviceData: Record<string, unknown>
  ): Promise<unknown> {
    if (typeof hass.callWS !== 'function') throw new Error('No websocket connection');
    return hass.callWS({
      type: 'call_service',
      domain,
      service,
      service_data: serviceData,
      return_response: true,
    });
  }

  private async _resolveConfigEntry(hass: HassWs, entityId: string): Promise<string> {
    const cached = this._configEntries.get(entityId);
    if (cached) return cached;
    if (typeof hass.callWS !== 'function') return '';
    const entry = (await hass.callWS({ type: 'config/entity_registry/get', entity_id: entityId })) as
      | { config_entry_id?: string | null }
      | null
      | undefined;
    const id = entry?.config_entry_id || '';
    if (id) this._configEntries.set(entityId, id);
    return id;
  }

  private async _fetch(hass: HassWs, opts: ActionFetchOptions, now: Date): Promise<PriceSlot[]> {
    if (opts.format === 'nordpool_core') {
      const configEntry = opts.configEntry || (await this._resolveConfigEntry(hass, opts.entityId));
      if (!configEntry) throw new Error('Nord Pool config entry not found');
      const hint = opts.hint || opts.entityId;
      const days = [localDateKey(now), localDateKey(localDayBounds(now, 1).start)];
      const results = await Promise.all(
        days.map(date =>
          this._callService(hass, 'nordpool', 'get_prices_for_date', {
            config_entry: configEntry,
            date,
          }).catch(() => null)
        )
      );
      const slots: PriceSlot[] = [];
      for (const r of results) {
        if (r) slots.push(...parseNordpoolCoreResponse(r, hint));
      }
      if (!slots.length && results.every(r => r === null)) {
        throw new Error('nordpool.get_prices_for_date failed');
      }
      return normalizeSlots(slots);
    }
    if (opts.format === 'tibber') {
      const start = localDayBounds(now).start;
      const end = localDayBounds(now, 2).start;
      const res = await this._callService(hass, 'tibber', 'get_prices', {
        start: formatLocalDateTime(start),
        end: formatLocalDateTime(end),
      });
      const friendly = String(hass.states?.[opts.entityId]?.attributes?.friendly_name || '');
      return parseTibberResponse(res, opts.hint || friendly);
    }
    return [];
  }
}

export const ucEnergyPriceService = new UcEnergyPriceService();
