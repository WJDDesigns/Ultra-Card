/**
 * Ultra Card Time Machine Service (PRO)
 *
 * Card-wide history scrubbing. Fetches recorder history for the entities a
 * card references and builds a "historical hass" whose `states` map reflects
 * a chosen moment in the past. The card swaps this object into its render
 * pipeline so every module rewinds without knowing about the feature.
 *
 * One context per time_machine module instance (keyed by module id). The
 * owning ultra-card syncs the context on every render via `syncCardContext`,
 * and subscribes for change notifications so scrubbing re-renders the card.
 */
import { HomeAssistant } from 'custom-card-helpers';

const MS_PER_HOUR = 3_600_000;
/** Cap entity history fetches to keep payloads reasonable. */
const MAX_HISTORY_ENTITIES = 60;
/** Refetch history if the cached window end is older than this. */
const HISTORY_STALE_MS = 5 * 60_000;
/** A full replay of the span takes this long at playback speed. */
const PLAYBACK_SPAN_SECONDS = 30;
const PLAYBACK_TICK_MS = 100;
/** Scrubbing within this fraction of "now" snaps back to live. */
const LIVE_SNAP_FRACTION = 0.005;

interface HistoryPoint {
  /** Epoch ms */
  t: number;
  state: string;
  attributes: Record<string, unknown> | null;
}

export interface UcTimeMachineSnapshot {
  /** Epoch ms of the scrub position, or null when live. */
  scrubMs: number | null;
  spanHours: number;
  playing: boolean;
  loading: boolean;
  /** True once the owning card has synced entity context at least once. */
  registered: boolean;
  hasHistory: boolean;
  /** Number of entities in scope (card-discovered + extra). */
  entityCount: number;
}

export interface UcTimeMachineEventMarker {
  /** Epoch ms of the state change. */
  t: number;
  entityId: string;
  state: string;
}

export interface UcTimeMachineSeries {
  entityId: string;
  /** Attribute the values came from, when the state itself isn't numeric. */
  attribute: string | null;
  points: Array<{ t: number; v: number }>;
  min: number;
  max: number;
}

export interface UcTimeMachineLaneSegment {
  state: string;
  startMs: number;
  endMs: number;
}

export interface UcTimeMachineLane {
  entityId: string;
  segments: UcTimeMachineLaneSegment[];
}

/**
 * Numeric attributes worth graphing when an entity's state isn't a number
 * (e.g. a thermostat reports "cool" but carries the temperature reading).
 */
const NUMERIC_ATTRIBUTE_FALLBACKS = [
  'current_temperature',
  'temperature',
  'current_humidity',
  'humidity',
  'current_power_w',
  'power',
  'battery_level',
  'brightness',
  'percentage',
  'position',
];

export type TmScope = 'card' | 'view' | 'independent';

interface TmModuleConfigLike {
  scope?: TmScope | undefined;
  default_span_hours?: number | undefined;
  auto_return_seconds?: number | undefined;
  extra_entities?: string[] | undefined;
}

interface TmContext {
  liveHass: HomeAssistant | null;
  scope: TmScope;
  entityIds: string[];
  /** Joined entity id list, used to detect scope changes that need a refetch. */
  entityKey: string;
  spanHours: number;
  lastDefaultSpan: number;
  autoReturnSeconds: number;
  scrubMs: number | null;
  playing: boolean;
  loading: boolean;
  history: Map<string, HistoryPoint[]>;
  fetchedStartMs: number;
  fetchedEndMs: number;
  fetchSeq: number;
  playTimer: number | null;
  autoReturnTimer: number | null;
  /** True while a history refresh is queued out of the render cycle. */
  ensureQueued: boolean;
  buildCache: {
    liveHass: HomeAssistant;
    scrubMs: number;
    historyRef: Map<string, HistoryPoint[]>;
    out: HomeAssistant;
  } | null;
}

/** Context key prefix for cards following a view-scope scrubber. */
const FOLLOWER_PREFIX = 'follower:';

class UcTimeMachineService {
  private _contexts = new Map<string, TmContext>();
  private _listeners = new Set<() => void>();

  // ── Subscription ────────────────────────────────────────────────────────────

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    this._listeners.forEach(l => {
      try {
        l();
      } catch {
        /* listener errors must not break scrubbing */
      }
    });
  }

  // ── Context lifecycle ───────────────────────────────────────────────────────

  private _ctx(moduleId: string): TmContext {
    let ctx = this._contexts.get(moduleId);
    if (!ctx) {
      ctx = {
        liveHass: null,
        scope: 'card',
        entityIds: [],
        entityKey: '',
        spanHours: 24,
        lastDefaultSpan: 24,
        autoReturnSeconds: 120,
        scrubMs: null,
        playing: false,
        loading: false,
        history: new Map(),
        fetchedStartMs: Number.POSITIVE_INFINITY,
        fetchedEndMs: 0,
        fetchSeq: 0,
        playTimer: null,
        autoReturnTimer: null,
        ensureQueued: false,
        buildCache: null,
      };
      this._contexts.set(moduleId, ctx);
    }
    return ctx;
  }

  /**
   * Called by ultra-card on every render for each time_machine module in its
   * layout. Keeps the live hass reference, entity scope, and module settings
   * current without requiring an explicit register/unregister lifecycle.
   */
  syncCardContext(
    moduleId: string,
    hass: HomeAssistant,
    entityIds: Iterable<string>,
    moduleConfig: TmModuleConfigLike
  ): void {
    const ctx = this._ctx(moduleId);
    ctx.liveHass = hass;
    ctx.scope = moduleConfig.scope || 'card';

    // Explicitly configured entities first so they survive the fetch cap.
    const merged = new Set<string>(moduleConfig.extra_entities || []);
    for (const id of entityIds) merged.add(id);
    this._setEntities(ctx, Array.from(merged));

    ctx.autoReturnSeconds = moduleConfig.auto_return_seconds ?? 120;
    const defaultSpan = moduleConfig.default_span_hours ?? 24;
    if (defaultSpan !== ctx.lastDefaultSpan) {
      ctx.lastDefaultSpan = defaultSpan;
      ctx.spanHours = defaultSpan;
    }

    // Prefetch so event markers appear on the track while still live,
    // instead of only after the first drag. Guarded by the covered/stale
    // checks inside, so this is a no-op on most renders.
    this._ensureHistory(ctx);
  }

  /**
   * Register a standalone (Card Timeline) scrubber. Called by the module itself
   * on every render, so it works regardless of the host card's wiring. The
   * history refresh is queued out of the render cycle to avoid re-entrant
   * update notifications.
   */
  syncStandalone(moduleId: string, hass: HomeAssistant, moduleConfig: TmModuleConfigLike): void {
    const ctx = this._ctx(moduleId);
    ctx.liveHass = hass;
    ctx.scope = 'independent';
    this._setEntities(ctx, moduleConfig.extra_entities || []);
    ctx.autoReturnSeconds = moduleConfig.auto_return_seconds ?? 120;
    const defaultSpan = moduleConfig.default_span_hours ?? 24;
    if (defaultSpan !== ctx.lastDefaultSpan) {
      ctx.lastDefaultSpan = defaultSpan;
      ctx.spanHours = defaultSpan;
    }
    if (!ctx.ensureQueued) {
      ctx.ensureQueued = true;
      setTimeout(() => {
        ctx.ensureQueued = false;
        this._ensureHistory(ctx);
      }, 0);
    }
  }

  private _setEntities(ctx: TmContext, ids: string[]): void {
    ctx.entityIds = ids.slice(0, MAX_HISTORY_ENTITIES);
    const entityKey = ctx.entityIds.join('|');
    if (entityKey !== ctx.entityKey) {
      ctx.entityKey = entityKey;
      // Entity scope changed → force a refetch on the next ensure.
      ctx.fetchedStartMs = Number.POSITIVE_INFINITY;
      ctx.fetchedEndMs = 0;
    }
  }

  // ── View-wide scrubbing ─────────────────────────────────────────────────────

  /** The registered view-scope scrubber module context, if any. */
  private _viewScrubber(): { id: string; ctx: TmContext } | null {
    for (const [id, ctx] of this._contexts) {
      if (!id.startsWith(FOLLOWER_PREFIX) && ctx.scope === 'view' && ctx.liveHass !== null) {
        return { id, ctx };
      }
    }
    return null;
  }

  /**
   * Follow the active view-scope scrubber (if any). Called by every ultra-card
   * on render with its own entity scope. Maintains a follower context so this
   * card's history is prefetched (feeding view-wide event markers) and returns
   * a historical hass mirroring the scrubber position — or the live hass when
   * nothing is scrubbing view-wide.
   */
  followView(
    cardKey: string,
    liveHass: HomeAssistant,
    entityIds: Iterable<string>,
    ownModuleIds: string[]
  ): HomeAssistant {
    const owner = this._viewScrubber();
    const key = FOLLOWER_PREFIX + cardKey;

    // No view scrubber anywhere (or this card hosts it): drop any mirror.
    if (!owner || ownModuleIds.includes(owner.id)) {
      const stale = this._contexts.get(key);
      if (stale) this.releaseModule(key);
      return liveHass;
    }

    const ctx = this._ctx(key);
    ctx.liveHass = liveHass;
    this._setEntities(ctx, Array.from(entityIds));
    ctx.spanHours = owner.ctx.spanHours;
    ctx.scrubMs = owner.ctx.scrubMs;
    this._ensureHistory(ctx);

    if (ctx.scrubMs == null) return liveHass;
    return this._buildForContext(ctx, liveHass);
  }

  releaseFollower(cardKey: string): void {
    this.releaseModule(FOLLOWER_PREFIX + cardKey);
  }

  releaseModule(moduleId: string): void {
    const ctx = this._contexts.get(moduleId);
    if (!ctx) return;
    this._stopPlayback(ctx);
    this._clearAutoReturn(ctx);
    this._contexts.delete(moduleId);
  }

  // ── State access ────────────────────────────────────────────────────────────

  getSnapshot(moduleId: string): UcTimeMachineSnapshot {
    const ctx = this._contexts.get(moduleId);
    if (!ctx) {
      return {
        scrubMs: null,
        spanHours: 24,
        playing: false,
        loading: false,
        registered: false,
        hasHistory: false,
        entityCount: 0,
      };
    }
    // View scope: the scrubber represents every follower card too, so surface
    // the combined entity scope and history availability.
    let entityCount = ctx.entityIds.length;
    let hasHistory = ctx.history.size > 0;
    if (ctx.scope === 'view') {
      const unique = new Set(ctx.entityIds);
      for (const [key, fctx] of this._contexts) {
        if (!key.startsWith(FOLLOWER_PREFIX)) continue;
        for (const id of fctx.entityIds) unique.add(id);
        if (fctx.history.size > 0) hasHistory = true;
      }
      entityCount = unique.size;
    }
    return {
      scrubMs: ctx.scrubMs,
      spanHours: ctx.spanHours,
      playing: ctx.playing,
      loading: ctx.loading,
      registered: ctx.liveHass !== null,
      hasHistory,
      entityCount,
    };
  }

  isTimeTravelActive(moduleIds: string[]): boolean {
    return moduleIds.some(id => this._contexts.get(id)?.scrubMs != null);
  }

  /**
   * State-change markers derived from the fetched history, for rendering event
   * ticks on the scrubber track. Sorted oldest → newest.
   */
  getEventMarkers(moduleId: string, maxCount = 300): UcTimeMachineEventMarker[] {
    const ctx = this._contexts.get(moduleId);
    if (!ctx) return [];

    // View scope: merge markers from every follower card's history so the
    // track reflects activity across the whole view (deduped per entity+time).
    const histories: Array<Map<string, HistoryPoint[]>> = [ctx.history];
    if (ctx.scope === 'view') {
      for (const [key, fctx] of this._contexts) {
        if (key.startsWith(FOLLOWER_PREFIX) && fctx.history.size > 0) {
          histories.push(fctx.history);
        }
      }
    }

    const markers: UcTimeMachineEventMarker[] = [];
    const seen = new Set<string>();
    for (const history of histories) {
      for (const [entityId, points] of history) {
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const cur = points[i];
          if (cur.state === prev.state) continue;
          if (
            cur.state === 'unavailable' ||
            cur.state === 'unknown' ||
            prev.state === 'unavailable' ||
            prev.state === 'unknown'
          ) {
            continue;
          }
          const dedupeKey = `${entityId}@${cur.t}`;
          if (seen.has(dedupeKey)) continue;
          seen.add(dedupeKey);
          markers.push({ t: cur.t, entityId, state: cur.state });
        }
      }
    }
    markers.sort((a, b) => a.t - b.t);
    return markers.length > maxCount ? markers.slice(markers.length - maxCount) : markers;
  }

  /** Entity ids currently tracked by a module's context. */
  getTrackedEntityIds(moduleId: string): string[] {
    return this._contexts.get(moduleId)?.entityIds || [];
  }

  /** History point at or before `t` for one tracked entity, or null. */
  stateAt(moduleId: string, entityId: string, t: number): HistoryPoint | null {
    const points = this._contexts.get(moduleId)?.history.get(entityId);
    if (!points) return null;
    const p = this._stateAt(points, t);
    if (!p) return null;
    // HA often only stores attributes on the points where they change —
    // reconstruct the full attribute set as of `t`.
    let attrs: Record<string, unknown> | null = null;
    for (const pt of points) {
      if (pt.t > t) break;
      if (pt.attributes) attrs = { ...(attrs || {}), ...pt.attributes };
    }
    return attrs ? { ...p, attributes: attrs } : p;
  }

  /**
   * Numeric history series (for chart rendering) within [startMs, endMs].
   * Entities whose states don't parse as numbers are skipped. Each series
   * includes one lead-in point clamped to startMs so lines span the window.
   */
  getNumericSeries(
    moduleId: string,
    startMs: number,
    endMs: number,
    maxEntities = 4
  ): UcTimeMachineSeries[] {
    const ctx = this._contexts.get(moduleId);
    if (!ctx || ctx.history.size === 0) return [];

    const series: UcTimeMachineSeries[] = [];
    for (const entityId of ctx.entityIds) {
      if (series.length >= maxEntities) break;
      const points = ctx.history.get(entityId);
      if (!points || points.length === 0) continue;

      // Graph the state when numeric, otherwise fall back to a numeric
      // attribute (a thermostat's temperature, a light's brightness, …).
      const attribute = this._numericSource(points);
      if (attribute === undefined) continue;

      const out: Array<{ t: number; v: number }> = [];
      let lead: { t: number; v: number } | null = null;
      // HA history often omits attributes on points where only the state
      // changed — carry the last known numeric value forward so the line
      // stays continuous across the window.
      let lastV: number | null = null;
      for (const p of points) {
        const raw = this._numericValue(p, attribute);
        if (raw !== null) lastV = raw;
        if (lastV === null) continue;
        if (p.t < startMs) {
          lead = { t: startMs, v: lastV };
        } else if (p.t <= endMs) {
          out.push({ t: p.t, v: lastV });
        }
      }
      if (lead) out.unshift(lead);
      // Extend the line to "now" / window end so a sparse series still draws.
      if (out.length === 1 && lastV !== null) {
        out.push({ t: endMs, v: lastV });
      }
      if (out.length < 2) continue;

      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      for (const p of out) {
        if (p.v < min) min = p.v;
        if (p.v > max) max = p.v;
      }
      series.push({ entityId, attribute, points: out, min, max });
    }
    return series;
  }

  /**
   * Which field of an entity's history carries graphable numbers:
   * `null` for the state itself, an attribute name, or `undefined` when
   * nothing numeric is available.
   */
  private _numericSource(points: HistoryPoint[]): string | null | undefined {
    let numericStates = 0;
    for (const p of points) {
      if (Number.isFinite(Number.parseFloat(p.state))) numericStates++;
      if (numericStates >= 2) return null;
    }
    for (const attr of NUMERIC_ATTRIBUTE_FALLBACKS) {
      let hits = 0;
      for (const p of points) {
        const raw = p.attributes?.[attr];
        if (raw != null && Number.isFinite(Number.parseFloat(String(raw)))) hits++;
        if (hits >= 2) return attr;
      }
    }
    return undefined;
  }

  private _numericValue(p: HistoryPoint, attribute: string | null): number | null {
    const raw = attribute === null ? p.state : p.attributes?.[attribute];
    if (raw == null) return null;
    const v = Number.parseFloat(String(raw));
    return Number.isFinite(v) ? v : null;
  }

  /**
   * State ribbons for entities that can't be graphed as numbers (lights,
   * locks, doors): contiguous runs of the same state across the window.
   */
  getStateLanes(
    moduleId: string,
    startMs: number,
    endMs: number,
    maxEntities = 6
  ): UcTimeMachineLane[] {
    const ctx = this._contexts.get(moduleId);
    if (!ctx || ctx.history.size === 0) return [];

    const graphed = new Set(
      this.getNumericSeries(moduleId, startMs, endMs).map(s => s.entityId)
    );
    const lanes: UcTimeMachineLane[] = [];

    for (const entityId of ctx.entityIds) {
      if (lanes.length >= maxEntities) break;
      if (graphed.has(entityId)) continue;
      const points = ctx.history.get(entityId);
      if (!points || points.length === 0) continue;

      const segments: UcTimeMachineLaneSegment[] = [];
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const segStart = Math.max(startMs, p.t);
        const segEnd = i + 1 < points.length ? Math.min(endMs, points[i + 1].t) : endMs;
        if (segEnd <= startMs || segStart >= endMs) continue;
        const prev = segments[segments.length - 1];
        if (prev && prev.state === p.state) {
          prev.endMs = segEnd;
        } else {
          segments.push({ state: p.state, startMs: segStart, endMs: segEnd });
        }
      }
      if (segments.length > 0) lanes.push({ entityId, segments });
    }
    return lanes;
  }

  // ── Scrubbing ───────────────────────────────────────────────────────────────

  /**
   * Move the scrub position. Pass null (or a time close enough to now) to
   * return to live. Triggers a history fetch on first use.
   */
  scrubTo(moduleId: string, epochMs: number | null): void {
    const ctx = this._ctx(moduleId);
    const now = Date.now();
    const spanMs = ctx.spanHours * MS_PER_HOUR;

    if (epochMs === null || epochMs >= now - spanMs * LIVE_SNAP_FRACTION) {
      this._returnToLive(ctx);
      this._notify();
      return;
    }

    ctx.scrubMs = Math.max(now - spanMs, Math.min(now, epochMs));
    this._ensureHistory(ctx);
    this._touchAutoReturn(ctx, moduleId);
    this._notify();
  }

  returnToLive(moduleId: string): void {
    const ctx = this._contexts.get(moduleId);
    if (!ctx) return;
    this._returnToLive(ctx);
    this._notify();
  }

  setSpan(moduleId: string, hours: number): void {
    const ctx = this._ctx(moduleId);
    if (ctx.spanHours === hours) return;
    ctx.spanHours = hours;
    const now = Date.now();
    if (ctx.scrubMs != null && ctx.scrubMs < now - hours * MS_PER_HOUR) {
      ctx.scrubMs = now - hours * MS_PER_HOUR;
    }
    this._ensureHistory(ctx);
    this._touchAutoReturn(ctx, moduleId);
    this._notify();
  }

  stepBy(moduleId: string, deltaMs: number): void {
    const ctx = this._contexts.get(moduleId);
    if (!ctx || ctx.scrubMs == null) return;
    this._stopPlayback(ctx);
    this.scrubTo(moduleId, ctx.scrubMs + deltaMs);
  }

  togglePlayback(moduleId: string): void {
    const ctx = this._contexts.get(moduleId);
    if (!ctx || ctx.scrubMs == null) return;
    if (ctx.playing) {
      this._stopPlayback(ctx);
      this._touchAutoReturn(ctx, moduleId);
      this._notify();
      return;
    }
    ctx.playing = true;
    this._clearAutoReturn(ctx);
    const stepMs = (ctx.spanHours * MS_PER_HOUR) / ((PLAYBACK_SPAN_SECONDS * 1000) / PLAYBACK_TICK_MS);
    ctx.playTimer = window.setInterval(() => {
      if (ctx.scrubMs == null) {
        this._stopPlayback(ctx);
        return;
      }
      const next = ctx.scrubMs + stepMs;
      if (next >= Date.now()) {
        this._returnToLive(ctx);
      } else {
        ctx.scrubMs = next;
      }
      this._notify();
    }, PLAYBACK_TICK_MS);
    this._notify();
  }

  private _returnToLive(ctx: TmContext): void {
    ctx.scrubMs = null;
    this._stopPlayback(ctx);
    this._clearAutoReturn(ctx);
  }

  private _stopPlayback(ctx: TmContext): void {
    ctx.playing = false;
    if (ctx.playTimer != null) {
      window.clearInterval(ctx.playTimer);
      ctx.playTimer = null;
    }
  }

  private _touchAutoReturn(ctx: TmContext, moduleId: string): void {
    this._clearAutoReturn(ctx);
    if (ctx.autoReturnSeconds > 0 && ctx.scrubMs != null && !ctx.playing) {
      ctx.autoReturnTimer = window.setTimeout(() => {
        ctx.autoReturnTimer = null;
        this.returnToLive(moduleId);
      }, ctx.autoReturnSeconds * 1000);
    }
  }

  private _clearAutoReturn(ctx: TmContext): void {
    if (ctx.autoReturnTimer != null) {
      window.clearTimeout(ctx.autoReturnTimer);
      ctx.autoReturnTimer = null;
    }
  }

  // ── Historical hass ─────────────────────────────────────────────────────────

  /**
   * Build a hass whose `states` reflect the active scrub position. Returns the
   * live hass unchanged when no module is time-traveling. The first active
   * module wins (one scrubber per card is the expected setup).
   */
  buildHass(liveHass: HomeAssistant, moduleIds: string[]): HomeAssistant {
    const activeId = moduleIds.find(id => this._contexts.get(id)?.scrubMs != null);
    if (!activeId) return liveHass;
    return this._buildForContext(this._contexts.get(activeId)!, liveHass);
  }

  private _buildForContext(ctx: TmContext, liveHass: HomeAssistant): HomeAssistant {
    const scrubMs = ctx.scrubMs!;

    if (
      ctx.buildCache &&
      ctx.buildCache.liveHass === liveHass &&
      ctx.buildCache.scrubMs === scrubMs &&
      ctx.buildCache.historyRef === ctx.history
    ) {
      return ctx.buildCache.out;
    }

    const states: Record<string, any> = { ...liveHass.states };
    const iso = new Date(scrubMs).toISOString();
    for (const [entityId, points] of ctx.history) {
      const p = this._stateAt(points, scrubMs);
      if (!p) continue;
      // Reconstruct attributes as of the scrub time (HA omits unchanged attrs).
      let histAttrs: Record<string, unknown> = {};
      for (const pt of points) {
        if (pt.t > scrubMs) break;
        if (pt.attributes) histAttrs = { ...histAttrs, ...pt.attributes };
      }
      const live = liveHass.states[entityId];
      states[entityId] = {
        entity_id: entityId,
        state: p.state,
        attributes: {
          ...(live?.attributes || {}),
          ...histAttrs,
        },
        last_changed: new Date(p.t).toISOString(),
        last_updated: iso,
        context: (live as any)?.context || { id: 'uc-time-machine', parent_id: null, user_id: null },
      };
    }

    const out = { ...liveHass, states } as HomeAssistant;
    // Marker for modules that fetch their own history (e.g. graphs): anchor
    // your time window on this timestamp instead of Date.now().
    (out as any).__uc_tm_scrub_ms = scrubMs;
    ctx.buildCache = { liveHass, scrubMs, historyRef: ctx.history, out };
    return out;
  }

  /** Latest history point at or before `t`, via binary search. */
  private _stateAt(points: HistoryPoint[], t: number): HistoryPoint | null {
    if (points.length === 0 || points[0].t > t) return null;
    let lo = 0;
    let hi = points.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (points[mid].t <= t) lo = mid;
      else hi = mid - 1;
    }
    return points[lo];
  }

  // ── History fetching ────────────────────────────────────────────────────────

  private _ensureHistory(ctx: TmContext): void {
    if (ctx.loading || !ctx.liveHass || ctx.entityIds.length === 0) return;
    const now = Date.now();
    const neededStart = now - ctx.spanHours * MS_PER_HOUR;
    const covered =
      ctx.fetchedStartMs <= neededStart && now - ctx.fetchedEndMs < HISTORY_STALE_MS;
    if (covered) return;
    void this._fetchHistory(ctx, neededStart, now);
  }

  private async _fetchHistory(ctx: TmContext, startMs: number, endMs: number): Promise<void> {
    const hass = ctx.liveHass!;
    const entityIds = ctx.entityIds.filter(id => !!hass.states[id]);
    if (entityIds.length === 0) {
      // Nothing resolvable right now; mark the window as fetched so we only
      // retry after the stale interval instead of on every render.
      ctx.fetchedStartMs = startMs;
      ctx.fetchedEndMs = endMs;
      return;
    }

    const seq = ++ctx.fetchSeq;
    ctx.loading = true;
    this._notify();

    const startISO = new Date(startMs).toISOString();
    const endISO = new Date(endMs).toISOString();
    let raw: Record<string, unknown[]> = {};

    try {
      // WebSocket API first (same pattern as the graphs module)
      raw = (await hass.callWS({
        type: 'history/history_during_period',
        start_time: startISO,
        end_time: endISO,
        entity_ids: entityIds,
        include_start_time_state: true,
        significant_changes_only: false,
        minimal_response: false,
        no_attributes: false,
      })) as Record<string, unknown[]>;
    } catch {
      try {
        // REST fallback: array of per-entity arrays
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
      } catch {
        raw = {};
      }
    }

    if (seq !== ctx.fetchSeq) return; // superseded by a newer fetch

    const history = new Map<string, HistoryPoint[]>();
    for (const [entityId, items] of Object.entries(raw)) {
      if (!Array.isArray(items) || items.length === 0) continue;
      const points: HistoryPoint[] = [];
      for (const item of items) {
        const p = this._parseHistoryItem(item);
        if (p) points.push(p);
      }
      if (points.length > 0) {
        points.sort((a, b) => a.t - b.t);
        history.set(entityId, points);
      }
    }

    ctx.history = history;
    ctx.fetchedStartMs = startMs;
    ctx.fetchedEndMs = endMs;
    ctx.loading = false;
    this._notify();
  }

  /** Accepts both WS compressed ({s, a, lu}) and REST ({state, last_changed}) formats. */
  private _parseHistoryItem(item: any): HistoryPoint | null {
    if (item == null || typeof item !== 'object') return null;
    if (item.s !== undefined && item.lu !== undefined) {
      return { t: item.lu * 1000, state: String(item.s), attributes: item.a || null };
    }
    if (item.state !== undefined && (item.last_updated || item.last_changed)) {
      return {
        t: new Date(item.last_updated || item.last_changed).getTime(),
        state: String(item.state),
        attributes: item.attributes || null,
      };
    }
    return null;
  }
}

export const ucTimeMachineService = new UcTimeMachineService();
