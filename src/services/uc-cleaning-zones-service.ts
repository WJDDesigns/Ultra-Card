import { HomeAssistant } from 'custom-card-helpers';
import { ucRecordStore, type UcStoredRecord } from './uc-record-store';
import type { CleaningZoneRegion } from '../types';

/**
 * Cleaning Zones (Pro) — persistence and staleness math.
 *
 * Every "this room was cleaned" event is a record in a to-do list (see
 * `uc-record-store.ts`), stored as a *completed* item so it never clutters the
 * user's active to-do view. The module reads those events back and turns them
 * into per-zone staleness: how long since the last clean, measured against the
 * zone's cleaning interval.
 *
 * All time math is done in whole milliseconds and exposed as fractional days so
 * the UI can render both "3 days ago" and a smooth progress bar.
 */

/** Namespace tag for records owned by this module. */
export const CLEANING_ZONES_NS = 'cleaning_zones';

const MS_PER_DAY = 86_400_000;

/** A zone is "due soon" once this much of its interval has elapsed. */
const DUE_SOON_RATIO = 0.75;

/**
 * Minimum gap between two automatic cleans for the same zone. Auto-clean is
 * evaluated during render, so this is the main defence against a flapping
 * entity writing a burst of duplicate events.
 */
export const AUTO_CLEAN_MIN_GAP_MS = 5 * 60 * 1000;

/** States that mean "we don't know yet" — never treated as a real transition. */
const UNKNOWN_STATES = new Set(['', 'unknown', 'unavailable', 'none']);

/** Payload stored on each cleaning event record. */
export interface CleaningEventPayload {
  zone_id: string;
  /** ISO timestamp of the clean. */
  cleaned_at: string;
  /** Person friendly name, when `log_cleaner` is enabled. */
  by?: string | undefined;
  source: 'manual' | 'auto';
  note?: string | undefined;
}

/** A parsed cleaning event plus the to-do item backing it. */
export interface CleaningEvent {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
  payload: CleaningEventPayload;
  /** `cleaned_at` parsed to epoch ms. */
  cleanedAtMs: number;
}

export type ZoneStalenessState = 'never' | 'fresh' | 'due_soon' | 'due' | 'overdue';

export interface ZoneStatus {
  zone: CleaningZoneRegion;
  lastCleanedMs: number | null;
  /** Fractional days since the last clean. */
  daysSince: number | null;
  intervalDays: number;
  /** 0 = just cleaned, 1 = exactly due, >1 = overdue. null when never cleaned. */
  ratio: number | null;
  state: ZoneStalenessState;
  /** Days until due; negative means days overdue. null when never cleaned. */
  dueInDays: number | null;
  lastBy?: string | undefined;
  /** How many stored events exist for this zone. */
  historyCount: number;
}

export interface ComputeStatusesOptions {
  defaultIntervalDays: number;
  /** Extra days past the interval before a zone counts as overdue. */
  graceDays?: number | undefined;
  /** Override "now", mainly for tests. */
  nowMs?: number | undefined;
}

export interface RecordCleanOptions {
  source: 'manual' | 'auto';
  by?: string | undefined;
  note?: string | undefined;
  /** Item title written into the to-do list. Defaults to `<zone name> cleaned`. */
  summary?: string | undefined;
  /** Prune the zone's history down to this many events after writing. */
  historyLimit?: number | undefined;
  /** Override the clean timestamp. */
  atMs?: number | undefined;
}

export interface ZoneSummary {
  never: number;
  fresh: number;
  dueSoon: number;
  due: number;
  overdue: number;
  /** due + overdue + never — the "needs attention" count. */
  needsAttention: number;
  /** Highest-ratio zone that is at least due, or the first never-cleaned zone. */
  worst: ZoneStatus | null;
}

/** Effective interval for a zone, falling back to the module default. */
export function zoneIntervalDays(
  zone: Pick<CleaningZoneRegion, 'interval_days'>,
  defaultIntervalDays: number
): number {
  const fallback =
    Number.isFinite(defaultIntervalDays) && defaultIntervalDays > 0
      ? Math.round(defaultIntervalDays)
      : 7;
  const own = zone.interval_days;
  if (typeof own === 'number' && Number.isFinite(own) && own > 0) return Math.round(own);
  return fallback;
}

function parseIsoMs(value: unknown): number {
  if (typeof value !== 'string' || !value) return NaN;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : NaN;
}

/** Narrows an arbitrary stored payload to a usable cleaning event payload. */
function toEventPayload(raw: unknown): CleaningEventPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const zoneId = typeof obj.zone_id === 'string' ? obj.zone_id : '';
  if (!zoneId) return null;
  const cleanedAt = typeof obj.cleaned_at === 'string' ? obj.cleaned_at : '';
  if (!Number.isFinite(parseIsoMs(cleanedAt))) return null;
  const payload: CleaningEventPayload = {
    zone_id: zoneId,
    cleaned_at: cleanedAt,
    source: obj.source === 'auto' ? 'auto' : 'manual',
  };
  if (typeof obj.by === 'string' && obj.by) payload.by = obj.by;
  if (typeof obj.note === 'string' && obj.note) payload.note = obj.note;
  return payload;
}

function toEvent(record: UcStoredRecord<unknown>): CleaningEvent | null {
  const payload = toEventPayload(record.payload);
  if (!payload) return null;
  return {
    uid: record.uid,
    summary: record.summary,
    status: record.status,
    payload,
    cleanedAtMs: parseIsoMs(payload.cleaned_at),
  };
}

class UltraCardCleaningZonesService {
  /** Last seen state of each zone's auto-clean entity, keyed `todoEntity|zoneId`. */
  private _autoLastState = new Map<string, string>();
  /** Epoch ms of the last auto-clean write per key, to rate limit writes. */
  private _autoLastWrite = new Map<string, number>();
  /** Keys with a write in flight, so a re-render can't double-fire. */
  private _autoWriting = new Set<string>();

  /**
   * All cleaning events in `todoEntity`, newest first.
   *
   * `onUpdate` is forwarded to the to-do service and fires whenever the list
   * changes in Home Assistant, so the caller can refresh without polling.
   */
  async getEvents(
    hass: HomeAssistant,
    todoEntity: string,
    onUpdate?: () => void
  ): Promise<CleaningEvent[]> {
    if (!hass || !todoEntity) return [];
    const records = await ucRecordStore.getRecords<unknown>(
      hass,
      todoEntity,
      CLEANING_ZONES_NS,
      onUpdate
    );
    const events: CleaningEvent[] = [];
    for (const record of records) {
      const event = toEvent(record);
      if (event) events.push(event);
    }
    events.sort((a, b) => b.cleanedAtMs - a.cleanedAtMs);
    return events;
  }

  /** Events for one zone, newest first. */
  eventsForZone(events: CleaningEvent[], zoneId: string, limit?: number): CleaningEvent[] {
    const list = events
      .filter(e => e.payload.zone_id === zoneId)
      .sort((a, b) => b.cleanedAtMs - a.cleanedAtMs);
    return typeof limit === 'number' && limit > 0 ? list.slice(0, limit) : list;
  }

  /** Staleness for every zone, in the order the zones were given. */
  computeStatuses(
    zones: CleaningZoneRegion[],
    events: CleaningEvent[],
    opts: ComputeStatusesOptions
  ): ZoneStatus[] {
    const now = typeof opts.nowMs === 'number' ? opts.nowMs : Date.now();
    const grace =
      typeof opts.graceDays === 'number' && Number.isFinite(opts.graceDays) && opts.graceDays > 0
        ? opts.graceDays
        : 0;

    // Index the newest event per zone in one pass so N zones don't cost N scans.
    const newest = new Map<string, CleaningEvent>();
    const counts = new Map<string, number>();
    for (const event of events) {
      const id = event.payload.zone_id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
      const current = newest.get(id);
      if (!current || event.cleanedAtMs > current.cleanedAtMs) newest.set(id, event);
    }

    return (zones || []).map(zone => {
      const intervalDays = zoneIntervalDays(zone, opts.defaultIntervalDays);
      const last = newest.get(zone.id) ?? null;
      const historyCount = counts.get(zone.id) ?? 0;

      if (!last) {
        return {
          zone,
          lastCleanedMs: null,
          daysSince: null,
          intervalDays,
          ratio: null,
          state: 'never' as ZoneStalenessState,
          dueInDays: null,
          lastBy: undefined,
          historyCount,
        };
      }

      const daysSince = Math.max(0, (now - last.cleanedAtMs) / MS_PER_DAY);
      const ratio = daysSince / intervalDays;
      const dueInDays = intervalDays - daysSince;

      let state: ZoneStalenessState;
      if (daysSince > intervalDays + grace) state = 'overdue';
      else if (daysSince >= intervalDays) state = 'due';
      else if (ratio >= DUE_SOON_RATIO) state = 'due_soon';
      else state = 'fresh';

      return {
        zone,
        lastCleanedMs: last.cleanedAtMs,
        daysSince,
        intervalDays,
        ratio,
        state,
        dueInDays,
        lastBy: last.payload.by,
        historyCount,
      };
    });
  }

  /** Counts per state plus the single most urgent zone, for the summary bar. */
  summarize(statuses: ZoneStatus[]): ZoneSummary {
    const summary: ZoneSummary = {
      never: 0,
      fresh: 0,
      dueSoon: 0,
      due: 0,
      overdue: 0,
      needsAttention: 0,
      worst: null,
    };

    let worstRatio = -Infinity;
    for (const status of statuses) {
      switch (status.state) {
        case 'never':
          summary.never++;
          break;
        case 'fresh':
          summary.fresh++;
          break;
        case 'due_soon':
          summary.dueSoon++;
          break;
        case 'due':
          summary.due++;
          break;
        case 'overdue':
          summary.overdue++;
          break;
      }

      if (status.state === 'due' || status.state === 'overdue') {
        const ratio = status.ratio ?? 1;
        if (ratio > worstRatio) {
          worstRatio = ratio;
          summary.worst = status;
        }
      }
    }

    summary.needsAttention = summary.due + summary.overdue + summary.never;
    // A never-cleaned zone is only "worst" when nothing is actually overdue.
    if (!summary.worst) {
      summary.worst = statuses.find(s => s.state === 'never') ?? null;
    }
    return summary;
  }

  /** Friendly name of the person recording the clean, when logging is enabled. */
  resolveCleaner(
    hass: HomeAssistant | undefined,
    personEntity: string | undefined
  ): string | undefined {
    if (!hass || !personEntity) return undefined;
    const state = hass.states?.[personEntity];
    if (!state) return undefined;
    const name = state.attributes?.friendly_name;
    if (typeof name === 'string' && name.trim()) return name.trim();
    return personEntity.split('.').pop() || undefined;
  }

  /**
   * Writes a clean event and marks it completed so it stays out of the user's
   * active to-do view. Returns the uid of the new record, or null when the
   * write could not be confirmed.
   */
  async recordClean(
    hass: HomeAssistant,
    todoEntity: string,
    zone: CleaningZoneRegion,
    opts: RecordCleanOptions
  ): Promise<string | null> {
    if (!hass || !todoEntity || !zone?.id) return null;

    const cleanedAt = new Date(
      typeof opts.atMs === 'number' && Number.isFinite(opts.atMs) ? opts.atMs : Date.now()
    ).toISOString();

    const payload: CleaningEventPayload = {
      zone_id: zone.id,
      cleaned_at: cleanedAt,
      source: opts.source,
    };
    if (opts.by) payload.by = opts.by;
    if (opts.note) payload.note = opts.note;

    const summary = (opts.summary || '').trim() || `${zone.name || zone.id} cleaned`;
    await ucRecordStore.addRecord<CleaningEventPayload>(
      hass,
      todoEntity,
      CLEANING_ZONES_NS,
      summary,
      payload
    );

    // `todo.add_item` always creates a needs_action item, so flip it afterwards.
    const records = await ucRecordStore.getRecords<unknown>(hass, todoEntity, CLEANING_ZONES_NS);
    const events: CleaningEvent[] = [];
    for (const record of records) {
      const event = toEvent(record);
      if (event) events.push(event);
    }
    const written =
      events.find(e => e.payload.zone_id === zone.id && e.payload.cleaned_at === cleanedAt) ?? null;

    if (written && written.status !== 'completed') {
      await ucRecordStore.setStatus(hass, todoEntity, written.uid, 'completed');
      written.status = 'completed';
    }

    if (typeof opts.historyLimit === 'number' && opts.historyLimit > 0) {
      await this.pruneHistory(hass, todoEntity, zone.id, opts.historyLimit, events);
    }

    return written?.uid ?? null;
  }

  /** Removes the most recent event for a zone. Returns true when one was removed. */
  async undoLastClean(hass: HomeAssistant, todoEntity: string, zoneId: string): Promise<boolean> {
    if (!hass || !todoEntity || !zoneId) return false;
    const events = await this.getEvents(hass, todoEntity);
    const newest = this.eventsForZone(events, zoneId)[0];
    if (!newest) return false;
    await ucRecordStore.removeRecord(hass, todoEntity, newest.uid);
    return true;
  }

  /**
   * Keeps at most `limit` events for a zone, deleting the oldest extras.
   * Pass `known` to reuse an event list you already fetched.
   */
  async pruneHistory(
    hass: HomeAssistant,
    todoEntity: string,
    zoneId: string,
    limit: number,
    known?: CleaningEvent[]
  ): Promise<number> {
    if (!hass || !todoEntity || !zoneId) return 0;
    if (!Number.isFinite(limit) || limit <= 0) return 0;

    const events = known ?? (await this.getEvents(hass, todoEntity));
    const forZone = this.eventsForZone(events, zoneId);
    const extra = forZone.slice(Math.round(limit));
    for (const event of extra) {
      await ucRecordStore.removeRecord(hass, todoEntity, event.uid);
    }
    return extra.length;
  }

  /** Deletes every stored event for a zone (used when a zone is removed). */
  async clearZoneHistory(hass: HomeAssistant, todoEntity: string, zoneId: string): Promise<number> {
    if (!hass || !todoEntity || !zoneId) return 0;
    const events = await this.getEvents(hass, todoEntity);
    const forZone = this.eventsForZone(events, zoneId);
    for (const event of forZone) {
      await ucRecordStore.removeRecord(hass, todoEntity, event.uid);
    }
    return forZone.length;
  }

  /**
   * Records a clean for any zone whose `auto_clean_entity` just transitioned
   * into `auto_clean_state`.
   *
   * Modules render synchronously and have no lifecycle hooks, so this is called
   * during render and must be aggressively idempotent. Four guards, in order:
   *
   *  1. The first time a zone's entity is seen the state is only remembered —
   *     a dashboard load can't be mistaken for a transition.
   *  2. Transitions out of unknown/unavailable are ignored (restart artifacts).
   *  3. A write is skipped when one is already in flight for the same zone.
   *  4. A write is skipped when this service wrote, or the list already holds,
   *     an event for the zone within {@link AUTO_CLEAN_MIN_GAP_MS}.
   *
   * Fires and forgets; `onWritten` is called once after any successful write.
   */
  checkAutoCleans(
    hass: HomeAssistant,
    todoEntity: string,
    zones: CleaningZoneRegion[],
    events: CleaningEvent[],
    opts: {
      by?: string | undefined;
      historyLimit?: number | undefined;
      summaryFor?: ((zone: CleaningZoneRegion) => string) | undefined;
      onWritten?: (() => void) | undefined;
    } = {}
  ): void {
    if (!hass || !todoEntity || !Array.isArray(zones) || zones.length === 0) return;

    const now = Date.now();
    const newestByZone = new Map<string, number>();
    for (const event of events || []) {
      const current = newestByZone.get(event.payload.zone_id);
      if (current === undefined || event.cleanedAtMs > current) {
        newestByZone.set(event.payload.zone_id, event.cleanedAtMs);
      }
    }

    for (const zone of zones) {
      const entityId = (zone.auto_clean_entity || '').trim();
      const target = (zone.auto_clean_state || '').trim();
      if (!entityId || !target || !zone.id) continue;

      const key = `${todoEntity}|${zone.id}`;
      const raw = hass.states?.[entityId]?.state;
      const current = typeof raw === 'string' ? raw.trim() : '';
      const previous = this._autoLastState.get(key);

      // Guard 1: seed on first sight, never fire.
      if (previous === undefined) {
        this._autoLastState.set(key, current);
        continue;
      }
      if (previous === current) continue;
      this._autoLastState.set(key, current);

      const matches = current.toLowerCase() === target.toLowerCase();
      if (!matches) continue;

      // Guard 2: unknown → target is a restart, not a clean.
      if (UNKNOWN_STATES.has(previous.toLowerCase())) continue;

      // Guard 3: a write for this zone is already running.
      if (this._autoWriting.has(key)) continue;

      // Guard 4: rate limit against our own writes and events already stored.
      const lastWrite = this._autoLastWrite.get(key) ?? 0;
      if (now - lastWrite < AUTO_CLEAN_MIN_GAP_MS) continue;
      const lastEvent = newestByZone.get(zone.id);
      if (lastEvent !== undefined && now - lastEvent < AUTO_CLEAN_MIN_GAP_MS) continue;

      this._autoWriting.add(key);
      this._autoLastWrite.set(key, now);

      const recordOpts: RecordCleanOptions = { source: 'auto', atMs: now };
      if (opts.by) recordOpts.by = opts.by;
      if (opts.historyLimit !== undefined) recordOpts.historyLimit = opts.historyLimit;
      const summary = opts.summaryFor?.(zone);
      if (summary) recordOpts.summary = summary;

      this.recordClean(hass, todoEntity, zone, recordOpts)
        .then(() => {
          this._autoWriting.delete(key);
          opts.onWritten?.();
        })
        .catch(() => {
          this._autoWriting.delete(key);
          // Keep the rate-limit stamp so a broken service call can't hot-loop.
        });
    }
  }

  /** Forgets auto-clean bookkeeping for a to-do list (used when config changes). */
  resetAutoCleanState(todoEntity?: string): void {
    if (!todoEntity) {
      this._autoLastState.clear();
      this._autoLastWrite.clear();
      this._autoWriting.clear();
      return;
    }
    const prefix = `${todoEntity}|`;
    for (const key of Array.from(this._autoLastState.keys())) {
      if (key.startsWith(prefix)) this._autoLastState.delete(key);
    }
    for (const key of Array.from(this._autoLastWrite.keys())) {
      if (key.startsWith(prefix)) this._autoLastWrite.delete(key);
    }
  }
}

export const ucCleaningZonesService = new UltraCardCleaningZonesService();
