import { HomeAssistant } from 'custom-card-helpers';
import { ucRecordStore, type UcStoredRecord } from './uc-record-store';
import type { PlantCareEntry } from '../types';

/**
 * Plant Care (Pro) — watering / fertilizing schedules with optional moisture sensors.
 *
 * Care events are persisted in a Local To-do helper through {@link ucRecordStore},
 * so a household shares one history without any backend. Everything else in here
 * is pure computation over those events plus the plant configuration, which keeps
 * the interesting logic (seasonal intervals, sensor-vs-schedule resolution)
 * testable without Home Assistant.
 */

/** Record-store namespace; keeps our events separate from other modules' records. */
export const PLANT_CARE_NAMESPACE = 'plant_care';

/** Moisture percentage used when a plant doesn't override it. */
export const DEFAULT_MOISTURE_THRESHOLD = 30;

/** Fallback watering cadence when neither the plant nor the module sets one. */
export const DEFAULT_WATER_INTERVAL_DAYS = 7;

/** Bounds for the seasonal scaling factors, matching the editor sliders. */
export const MIN_SEASONAL_FACTOR = 0.25;
export const MAX_SEASONAL_FACTOR = 2;

const MS_PER_DAY = 86400000;

/** Peak-summer day-of-year in the northern hemisphere (≈ June 21). */
const SUMMER_SOLSTICE_DOY = 172;
const DAYS_PER_YEAR = 365.25;

export type CareKind = 'water' | 'fertilize';

/** Payload stored on each to-do record. Kept tiny — it rides inside a description. */
export interface CareEventPayload {
  plant_id: string;
  kind: CareKind;
  /** ISO timestamp of when the care happened. */
  at: string;
  note?: string | undefined;
}

/** A parsed care event plus the to-do item backing it. */
export interface CareEvent {
  uid: string;
  summary: string;
  payload: CareEventPayload;
  /** `payload.at` parsed to epoch milliseconds. */
  atMs: number;
}

export type PlantCareState = 'never' | 'happy' | 'due_soon' | 'thirsty' | 'overdue';

/** Which signal decided {@link PlantStatus.state}, so the UI can explain itself. */
export type PlantCareReason = 'sensor' | 'schedule' | 'none';

export interface PlantStatus {
  plant: PlantCareEntry;
  lastWateredMs: number | null;
  lastFertilizedMs: number | null;
  /** Watering cadence after seasonal adjustment. */
  waterIntervalDays: number;
  /** Fertilizing cadence; 0 when fertilizing is disabled for this plant. */
  fertilizeIntervalDays: number;
  daysSinceWater: number | null;
  waterDueInDays: number | null;
  fertilizeDueInDays: number | null;
  /** Live reading from the plant's moisture sensor, when one is configured. */
  moisture: number | null;
  moistureThreshold: number;
  reason: PlantCareReason;
  state: PlantCareState;
  temperature: number | null;
  illuminance: number | null;
}

/**
 * Everything {@link computeStatuses} needs, decoupled from `hass` so the maths
 * can be exercised directly. Build one with {@link buildComputeConfig}.
 */
export interface PlantCareComputeConfig {
  default_water_interval_days?: number | undefined;
  default_fertilize_interval_days?: number | undefined;
  moisture_source?: 'schedule' | 'sensor' | 'both' | undefined;
  seasonal_adjust?: boolean | undefined;
  summer_factor?: number | undefined;
  winter_factor?: number | undefined;
  /** Home latitude. Negative flips the seasonal phase for the southern hemisphere. */
  latitude?: number | null | undefined;
  /** Resolves a numeric sensor reading, or null when unavailable. */
  readSensor?: ((entityId: string) => number | null) | undefined;
}

/** A `plant.*` entity we can turn into a {@link PlantCareEntry}. */
export interface DiscoveredPlant {
  entityId: string;
  name: string;
  moistureEntity?: string | undefined;
  temperatureEntity?: string | undefined;
  illuminanceEntity?: string | undefined;
}

// ── Small numeric helpers ────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / MS_PER_DAY) + 1;
}

/** Ordering used when two signals disagree — the more urgent one wins. */
function severity(state: PlantCareState): number {
  switch (state) {
    case 'overdue':
      return 3;
    case 'thirsty':
      return 2;
    case 'due_soon':
      return 1;
    default:
      return 0;
  }
}

// ── Seasonal adjustment ──────────────────────────────────────────────────────

/**
 * Scaling factor applied to every watering interval.
 *
 * Plants drink less in winter, but they don't switch over on a single day, so
 * the factor eases between `summer_factor` and `winter_factor` as a cosine of
 * day-of-year rather than stepping at the solstices. Southern-hemisphere homes
 * (negative latitude) get the phase shifted half a year.
 *
 * Returns 1 when seasonal adjustment is off.
 */
export function seasonalWaterFactor(
  config: PlantCareComputeConfig,
  now: number | Date = Date.now()
): number {
  if (!config?.seasonal_adjust) return 1;

  const summer = clamp(
    Number(config.summer_factor ?? 0.75),
    MIN_SEASONAL_FACTOR,
    MAX_SEASONAL_FACTOR
  );
  const winter = clamp(
    Number(config.winter_factor ?? 1.5),
    MIN_SEASONAL_FACTOR,
    MAX_SEASONAL_FACTOR
  );

  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return 1;

  const mid = (summer + winter) / 2;
  const amplitude = (summer - winter) / 2;

  const southern = typeof config.latitude === 'number' && config.latitude < 0;
  const doy = dayOfYear(date) + (southern ? DAYS_PER_YEAR / 2 : 0);
  const phase = (2 * Math.PI * (doy - SUMMER_SOLSTICE_DOY)) / DAYS_PER_YEAR;

  return mid + amplitude * Math.cos(phase);
}

/** Human-facing label for the current season, used to explain the adjustment. */
export function seasonalPhaseLabel(
  config: PlantCareComputeConfig,
  now: number | Date = Date.now()
): 'summer' | 'winter' | 'shoulder' {
  const factor = seasonalWaterFactor(config, now);
  const summer = clamp(
    Number(config?.summer_factor ?? 0.75),
    MIN_SEASONAL_FACTOR,
    MAX_SEASONAL_FACTOR
  );
  const winter = clamp(
    Number(config?.winter_factor ?? 1.5),
    MIN_SEASONAL_FACTOR,
    MAX_SEASONAL_FACTOR
  );
  const mid = (summer + winter) / 2;
  const span = Math.abs(summer - winter);
  if (span < 0.05) return 'shoulder';
  if (Math.abs(factor - mid) < span * 0.25) return 'shoulder';
  return Math.abs(factor - summer) < Math.abs(factor - winter) ? 'summer' : 'winter';
}

// ── Status computation ───────────────────────────────────────────────────────

/**
 * Folds the care log and the live sensors into one status per plant.
 *
 * `moisture_source` decides who gets the final say:
 *  - `schedule` ignores sensors entirely
 *  - `sensor` trusts the reading, but plants without a sensor still fall back to
 *    the schedule — there is nothing else to go on, and pretending they're fine
 *    would be a lie. `reason` reports which one was actually used.
 *  - `both` takes whichever signal is more urgent
 */
export function computeStatuses(
  plants: PlantCareEntry[],
  events: CareEvent[],
  config: PlantCareComputeConfig,
  now: number = Date.now()
): PlantStatus[] {
  const list = Array.isArray(plants) ? plants : [];
  if (list.length === 0) return [];

  const lastWater = new Map<string, number>();
  const lastFertilize = new Map<string, number>();
  for (const event of Array.isArray(events) ? events : []) {
    const id = event?.payload?.plant_id;
    if (!id || !Number.isFinite(event.atMs)) continue;
    const target = event.payload.kind === 'fertilize' ? lastFertilize : lastWater;
    const existing = target.get(id);
    if (existing === undefined || event.atMs > existing) target.set(id, event.atMs);
  }

  const source = config?.moisture_source || 'both';
  const factor = seasonalWaterFactor(config, now);
  const readSensor = config?.readSensor;

  return list.map(plant => {
    const baseWater = clamp(
      Number(
        plant.water_interval_days ??
          config?.default_water_interval_days ??
          DEFAULT_WATER_INTERVAL_DAYS
      ),
      1,
      365
    );
    const waterIntervalDays = Math.max(0.5, round1(baseWater * factor));

    const rawFertilize = Number(
      plant.fertilize_interval_days ?? config?.default_fertilize_interval_days ?? 0
    );
    const fertilizeIntervalDays =
      Number.isFinite(rawFertilize) && rawFertilize > 0 ? clamp(rawFertilize, 1, 365) : 0;

    const lastWateredMs = lastWater.get(plant.id) ?? null;
    const lastFertilizedMs = lastFertilize.get(plant.id) ?? null;

    const daysSinceWater =
      lastWateredMs === null ? null : Math.max(0, (now - lastWateredMs) / MS_PER_DAY);
    const waterDueInDays = daysSinceWater === null ? null : waterIntervalDays - daysSinceWater;
    const fertilizeDueInDays =
      fertilizeIntervalDays > 0 && lastFertilizedMs !== null
        ? fertilizeIntervalDays - (now - lastFertilizedMs) / MS_PER_DAY
        : null;

    const moistureThreshold = clamp(
      Number(plant.moisture_threshold ?? DEFAULT_MOISTURE_THRESHOLD),
      0,
      100
    );

    let moisture: number | null = null;
    if (source !== 'schedule' && plant.moisture_entity && readSensor) {
      moisture = readSensor(plant.moisture_entity);
    }
    const temperature =
      plant.temperature_entity && readSensor ? readSensor(plant.temperature_entity) : null;
    const illuminance =
      plant.illuminance_entity && readSensor ? readSensor(plant.illuminance_entity) : null;

    const scheduleState = scheduleStateFor(waterDueInDays, waterIntervalDays);
    const sensorState = moisture === null ? null : sensorStateFor(moisture, moistureThreshold);

    let state: PlantCareState;
    let reason: PlantCareReason;

    if (sensorState === null || source === 'schedule') {
      state = scheduleState;
      reason = scheduleState === 'never' ? 'none' : 'schedule';
    } else if (source === 'sensor' || scheduleState === 'never') {
      state = sensorState;
      reason = 'sensor';
    } else if (severity(sensorState) >= severity(scheduleState)) {
      state = sensorState;
      reason = 'sensor';
    } else {
      state = scheduleState;
      reason = 'schedule';
    }

    return {
      plant,
      lastWateredMs,
      lastFertilizedMs,
      waterIntervalDays,
      fertilizeIntervalDays,
      daysSinceWater: daysSinceWater === null ? null : round1(daysSinceWater),
      waterDueInDays: waterDueInDays === null ? null : round1(waterDueInDays),
      fertilizeDueInDays: fertilizeDueInDays === null ? null : round1(fertilizeDueInDays),
      moisture,
      moistureThreshold,
      reason,
      state,
      temperature,
      illuminance,
    };
  });
}

/**
 * Schedule-only verdict. The warning and overdue windows scale with the
 * interval (a weekly plant shouldn't nag as early as a monthly one) but are
 * capped so long intervals don't sit in "due soon" for a fortnight.
 */
function scheduleStateFor(
  waterDueInDays: number | null,
  waterIntervalDays: number
): PlantCareState {
  if (waterDueInDays === null) return 'never';
  const soonWindow = Math.min(2, waterIntervalDays * 0.25);
  const overdueWindow = Math.min(7, Math.max(1, waterIntervalDays * 0.5));
  if (waterDueInDays > soonWindow) return 'happy';
  if (waterDueInDays > 0) return 'due_soon';
  if (-waterDueInDays <= overdueWindow) return 'thirsty';
  return 'overdue';
}

/** Sensor-only verdict, relative to the plant's moisture threshold. */
function sensorStateFor(moisture: number, threshold: number): PlantCareState {
  if (moisture < threshold * 0.6) return 'overdue';
  if (moisture < threshold) return 'thirsty';
  if (moisture < threshold + 10) return 'due_soon';
  return 'happy';
}

export interface PlantCareSummary {
  total: number;
  happy: number;
  dueSoon: number;
  thirsty: number;
  overdue: number;
  never: number;
  /** Plant needing attention soonest (most overdue first, then nearest due). */
  next: PlantStatus | null;
}

/** Counts for the summary bar, plus whichever plant needs attention next. */
export function summarizeStatuses(statuses: PlantStatus[]): PlantCareSummary {
  const summary: PlantCareSummary = {
    total: statuses.length,
    happy: 0,
    dueSoon: 0,
    thirsty: 0,
    overdue: 0,
    never: 0,
    next: null,
  };

  for (const status of statuses) {
    switch (status.state) {
      case 'happy':
        summary.happy++;
        break;
      case 'due_soon':
        summary.dueSoon++;
        break;
      case 'thirsty':
        summary.thirsty++;
        break;
      case 'overdue':
        summary.overdue++;
        break;
      default:
        summary.never++;
    }
  }

  const withDue = statuses.filter(s => s.waterDueInDays !== null);
  if (withDue.length > 0) {
    summary.next = withDue.reduce((best, current) =>
      (current.waterDueInDays as number) < (best.waterDueInDays as number) ? current : best
    );
  } else if (statuses.length > 0) {
    summary.next = statuses[0];
  }

  return summary;
}

/**
 * Display urgency. Unlike {@link severity} this ranks `never` above `due_soon`:
 * a plant with no watering history is an unknown, and burying it at the bottom
 * is how it stays unknown.
 */
function sortWeight(state: PlantCareState): number {
  return state === 'never' ? 1.5 : severity(state);
}

/** Sorts by urgency when `overdueFirst`, otherwise keeps the configured order. */
export function sortStatuses(statuses: PlantStatus[], overdueFirst: boolean): PlantStatus[] {
  if (!overdueFirst) return statuses;
  return [...statuses].sort((a, b) => {
    const bySeverity = sortWeight(b.state) - sortWeight(a.state);
    if (bySeverity !== 0) return bySeverity;
    const aDue = a.waterDueInDays ?? Number.POSITIVE_INFINITY;
    const bDue = b.waterDueInDays ?? Number.POSITIVE_INFINITY;
    return aDue - bDue;
  });
}

// ── Home Assistant glue ──────────────────────────────────────────────────────

/** Reads a numeric state, tolerating `unknown` / `unavailable` / units. */
export function numericSensorValue(
  hass: HomeAssistant | undefined | null,
  entityId: string
): number | null {
  if (!hass?.states || !entityId) return null;
  const stateObj = hass.states[entityId];
  if (!stateObj) return null;
  const raw = stateObj.state;
  if (raw === undefined || raw === null || raw === 'unknown' || raw === 'unavailable') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Wires a module config + `hass` into the pure {@link computeStatuses} input. */
export function buildComputeConfig(
  config: Omit<PlantCareComputeConfig, 'latitude' | 'readSensor'>,
  hass: HomeAssistant | undefined | null
): PlantCareComputeConfig {
  const latitude =
    typeof hass?.config?.latitude === 'number' && Number.isFinite(hass.config.latitude)
      ? hass.config.latitude
      : null;
  return {
    ...config,
    latitude,
    readSensor: (entityId: string) => numericSensorValue(hass, entityId),
  };
}

function parseCareEvent(record: UcStoredRecord<CareEventPayload>): CareEvent | null {
  const payload = record?.payload;
  if (!payload || typeof payload !== 'object') return null;
  if (typeof payload.plant_id !== 'string' || !payload.plant_id) return null;
  const kind: CareKind = payload.kind === 'fertilize' ? 'fertilize' : 'water';
  const atMs = payload.at ? Date.parse(payload.at) : NaN;
  if (!Number.isFinite(atMs)) return null;
  return {
    uid: record.uid,
    summary: record.summary,
    payload: {
      plant_id: payload.plant_id,
      kind,
      at: payload.at,
      note: typeof payload.note === 'string' ? payload.note : undefined,
    },
    atMs,
  };
}

/**
 * Care-log persistence and plant discovery.
 *
 * Everything here is a thin wrapper over {@link ucRecordStore}; the module owns
 * caching and re-render scheduling.
 */
export class UltraCardPlantCareService {
  /** All care events on `todoEntity`, newest first. */
  async getEvents(
    hass: HomeAssistant,
    todoEntity: string,
    onUpdate?: () => void
  ): Promise<CareEvent[]> {
    if (!hass || !todoEntity) return [];
    const records = await ucRecordStore.getRecords<CareEventPayload>(
      hass,
      todoEntity,
      PLANT_CARE_NAMESPACE,
      onUpdate
    );
    const events: CareEvent[] = [];
    for (const record of records) {
      const event = parseCareEvent(record);
      if (event) events.push(event);
    }
    events.sort((a, b) => b.atMs - a.atMs);
    return events;
  }

  /** Logs one watering / fertilizing, resetting that plant's clock. */
  async recordCare(
    hass: HomeAssistant,
    todoEntity: string,
    plant: PlantCareEntry,
    kind: CareKind,
    options?: { note?: string | undefined; summary?: string | undefined; at?: Date | undefined }
  ): Promise<void> {
    if (!hass || !todoEntity || !plant?.id) return;
    const at = options?.at ?? new Date();
    const payload: CareEventPayload = {
      plant_id: plant.id,
      kind,
      at: at.toISOString(),
    };
    if (options?.note) payload.note = options.note;

    const fallback = kind === 'fertilize' ? 'Fertilized' : 'Watered';
    const summary = options?.summary || `${fallback} ${plant.name || plant.id}`;

    await ucRecordStore.addRecord<CareEventPayload>(
      hass,
      todoEntity,
      PLANT_CARE_NAMESPACE,
      summary,
      payload
    );
  }

  /** Removes the most recent event of `kind` for a plant — the undo affordance. */
  async undoLastCare(
    hass: HomeAssistant,
    todoEntity: string,
    plantId: string,
    kind: CareKind
  ): Promise<boolean> {
    if (!hass || !todoEntity || !plantId) return false;
    const events = await this.getEvents(hass, todoEntity);
    const latest = events.find(e => e.payload.plant_id === plantId && e.payload.kind === kind);
    if (!latest) return false;
    await ucRecordStore.removeRecord(hass, todoEntity, latest.uid);
    return true;
  }

  /**
   * Trims a plant's care log to the newest `limit` events so the backing to-do
   * list doesn't grow without bound.
   */
  async pruneHistory(
    hass: HomeAssistant,
    todoEntity: string,
    plantId: string,
    limit: number
  ): Promise<number> {
    if (!hass || !todoEntity || !plantId) return 0;
    const max = Math.max(0, Math.floor(limit));
    if (max <= 0) return 0;
    const events = await this.getEvents(hass, todoEntity);
    const mine = events.filter(e => e.payload.plant_id === plantId);
    if (mine.length <= max) return 0;
    const excess = mine.slice(max);
    for (const event of excess) {
      await ucRecordStore.removeRecord(hass, todoEntity, event.uid);
    }
    return excess.length;
  }

  /** Drops any events belonging to plants that no longer exist in the config. */
  async purgeOrphans(
    hass: HomeAssistant,
    todoEntity: string,
    knownPlantIds: string[]
  ): Promise<number> {
    if (!hass || !todoEntity) return 0;
    const known = new Set(knownPlantIds);
    const events = await this.getEvents(hass, todoEntity);
    const orphans = events.filter(e => !known.has(e.payload.plant_id));
    for (const event of orphans) {
      await ucRecordStore.removeRecord(hass, todoEntity, event.uid);
    }
    return orphans.length;
  }

  /** Forces the next {@link getEvents} to hit Home Assistant again. */
  invalidate(hass: HomeAssistant | undefined | null, todoEntity: string): void {
    ucRecordStore.invalidate(hass, todoEntity);
  }

  /**
   * Finds `plant.*` entities and the sensors behind them, for the bulk-import
   * button. The `plant` integration doesn't expose its source sensors in a
   * single documented attribute, so this tries the shapes that exist in the
   * wild and then falls back to matching sensor entity ids by name. Anything it
   * can't map still imports with a name, which is the bulk of the win.
   */
  discoverPlants(hass: HomeAssistant | undefined | null): DiscoveredPlant[] {
    if (!hass?.states) return [];
    const sensorIds = Object.keys(hass.states).filter(id => id.startsWith('sensor.'));
    const out: DiscoveredPlant[] = [];

    for (const entityId of Object.keys(hass.states)) {
      if (!entityId.startsWith('plant.')) continue;
      const stateObj = hass.states[entityId];
      const attributes = (stateObj?.attributes || {}) as Record<string, unknown>;
      const objectId = entityId.slice('plant.'.length);
      const name = String(attributes.friendly_name || objectId.replace(/_/g, ' '));

      const discovered: DiscoveredPlant = { entityId, name };

      const moisture =
        pickSensorAttribute(attributes, ['moisture', 'soil_moisture'], hass) ||
        matchSensorByName(sensorIds, objectId, ['moisture']);
      if (moisture) discovered.moistureEntity = moisture;

      const temperature =
        pickSensorAttribute(attributes, ['temperature'], hass) ||
        matchSensorByName(sensorIds, objectId, ['temperature', 'temp']);
      if (temperature) discovered.temperatureEntity = temperature;

      const illuminance =
        pickSensorAttribute(attributes, ['illuminance', 'brightness', 'light'], hass) ||
        matchSensorByName(sensorIds, objectId, ['illuminance', 'brightness', 'light']);
      if (illuminance) discovered.illuminanceEntity = illuminance;

      out.push(discovered);
    }

    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }
}

/**
 * Looks for an entity id hiding in the plant entity's attributes, either under
 * a `sensors: { moisture: 'sensor.x' }` map or a `<key>_sensor` attribute.
 */
function pickSensorAttribute(
  attributes: Record<string, unknown>,
  keys: string[],
  hass: HomeAssistant
): string | undefined {
  const sensors = attributes.sensors;
  if (sensors && typeof sensors === 'object') {
    for (const key of keys) {
      const value = (sensors as Record<string, unknown>)[key];
      if (typeof value === 'string' && hass.states?.[value]) return value;
    }
  }
  for (const key of keys) {
    for (const candidate of [`${key}_sensor`, `sensor_${key}`]) {
      const value = attributes[candidate];
      if (typeof value === 'string' && hass.states?.[value]) return value;
    }
  }
  return undefined;
}

/** Fallback discovery: `sensor.<plant>_moisture` and friends. */
function matchSensorByName(
  sensorIds: string[],
  objectId: string,
  keywords: string[]
): string | undefined {
  for (const keyword of keywords) {
    const exact = `sensor.${objectId}_${keyword}`;
    if (sensorIds.includes(exact)) return exact;
  }
  const prefix = `sensor.${objectId}`;
  for (const keyword of keywords) {
    const match = sensorIds.find(id => id.startsWith(prefix) && id.includes(keyword));
    if (match) return match;
  }
  return undefined;
}

export const ucPlantCareService = new UltraCardPlantCareService();
