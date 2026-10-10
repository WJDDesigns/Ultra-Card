import type { CardModule, LinkedRowModule } from '../types';
import { getConnectInfo } from './uc-connect-compatibility';
import { safeGetItem, safeSetItem } from '../utils/safe-storage';

/**
 * Shared "Linked Row" storage, kept by Ultra Card Connect
 * (`/api/ultra_card_pro_cloud/linked_rows`, Connect 1.10.0+).
 *
 * A Linked Row module keeps a local copy of its modules in the card config and
 * a pointer (`linked_id` + `linked_revision`) to a shared copy in Connect. This
 * service fetches shared copies (memory + localStorage cache, one request per
 * row id at a time, refreshed at most every REFRESH_MS) and writes them back
 * with the revision they were based on. Connect refuses a stale write with 409
 * and the current row, which is surfaced as a conflict instead of overwriting.
 *
 * Connect missing, too old (404 or no `linked_rows` capability) or offline is
 * never an error for rendering: the module falls back to its local copy.
 */

export const LINKED_ROWS_API = 'ultra_card_pro_cloud/linked_rows';
export const LINKED_ROWS_MIN_CONNECT_VERSION = '1.10.0';
const STORAGE_KEY = 'uc_linked_rows_cache_v1';
/** How often a dashboard re-checks a shared row for edits made elsewhere. */
export const LINKED_ROW_REFRESH_MS = 60_000;
/** Back-off after a failed (offline / 5xx) fetch. */
const RETRY_MS = 30_000;

export interface LinkedRowRecord {
  id: string;
  name: string;
  modules: CardModule[];
  revision: number;
  updated_at: string;
  updated_by?: string | null | undefined;
}

export interface LinkedRowSummary {
  id: string;
  name: string;
  revision: number;
  updated_at: string;
  module_count: number;
}

/** Whether this Home Assistant can store linked rows. */
export type LinkedRowAvailability = 'available' | 'missing' | 'outdated';

export type LinkedRowSaveResult =
  | { ok: true; row: LinkedRowRecord }
  | { ok: false; conflict: LinkedRowRecord }
  | { ok: false; error: string; status?: number | undefined };

type HassLike = {
  callApi?: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, unknown>
  ) => Promise<T>;
  config?: { components?: string[] } | undefined;
  states?: Record<string, unknown> | undefined;
  user?: { is_admin?: boolean } | undefined;
};

/** What `hass.callApi` rejects with (`{ error, status_code, body }`). */
type ApiError =
  | {
      status_code?: unknown;
      status?: unknown;
      response?: { status?: unknown };
      error?: unknown;
      body?: { current?: unknown; error?: unknown } | null;
    }
  | null
  | undefined;

type RowResponse = { row?: unknown } | null | undefined;
type ListResponse = { rows?: unknown } | null | undefined;

function errorStatus(err: ApiError): number | undefined {
  const s = err?.status_code ?? err?.status ?? err?.response?.status;
  return typeof s === 'number' ? s : undefined;
}

function isRecord(value: unknown): value is LinkedRowRecord {
  const r = value as LinkedRowRecord | null;
  return (
    !!r &&
    typeof r === 'object' &&
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    Array.isArray(r.modules) &&
    typeof r.revision === 'number'
  );
}

/** Stable JSON for comparing module lists (key order does not matter). */
export function linkedModulesKey(modules: unknown): string {
  const norm = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(norm);
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(v as Record<string, unknown>).sort()) {
        const val = (v as Record<string, unknown>)[k];
        if (val !== undefined) out[k] = norm(val);
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(norm(modules ?? []));
}

/** New library id: short, URL-safe and matching Connect's `[A-Za-z0-9_-]{1,64}`. */
export function newLinkedRowId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `lr_${Date.now().toString(36)}${rand}`;
}

export interface LinkedRowResolution {
  modules: CardModule[];
  /** Where `modules` came from. */
  source: 'shared' | 'local';
  /** Shared copy is at a later revision than the local one. */
  sharedIsNewer: boolean;
  /** Local copy was edited since its revision and the edit is not shared yet. */
  localIsAhead: boolean;
}

/**
 * Which copy to render.
 *
 * The shared copy wins only when it is at a later revision than the one the
 * local copy was synced at; at the same revision the local copy is either
 * identical or holds edits that are not shared yet, so it is the newest.
 * Editors always show the local copy, since that is what the user is editing.
 */
export function resolveLinkedRowModules(
  module: Pick<LinkedRowModule, 'modules' | 'linked_id' | 'linked_revision'>,
  shared: LinkedRowRecord | null | undefined,
  options: { editor?: boolean } = {}
): LinkedRowResolution {
  const local = Array.isArray(module.modules) ? module.modules : [];
  if (!module.linked_id || !shared || shared.id !== module.linked_id) {
    return { modules: local, source: 'local', sharedIsNewer: false, localIsAhead: false };
  }
  const localRev = typeof module.linked_revision === 'number' ? module.linked_revision : 0;
  const sharedIsNewer = shared.revision > localRev;
  const localIsAhead =
    shared.revision === localRev && linkedModulesKey(local) !== linkedModulesKey(shared.modules);
  if (sharedIsNewer && !options.editor) {
    return { modules: shared.modules, source: 'shared', sharedIsNewer, localIsAhead };
  }
  return { modules: local, source: 'local', sharedIsNewer, localIsAhead };
}

export class UcLinkedRowService {
  private _rows = new Map<string, LinkedRowRecord>();
  /** Ids known to be absent from the library (deleted elsewhere). */
  private _absent = new Set<string>();
  private _checkedAt = new Map<string, number>();
  private _inflight = new Map<string, Promise<LinkedRowRecord | null>>();
  private _conflicts = new Map<string, LinkedRowRecord>();
  private _autoPushed = new Set<string>();
  private _endpointMissing = false;
  private _hydrated = false;
  private _listeners = new Set<() => void>();

  constructor(private readonly _now: () => number = () => Date.now()) {}

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    for (const l of this._listeners) {
      try {
        l();
      } catch {
        // A listener must never break the others.
      }
    }
  }

  availability(hass: HassLike | null | undefined): LinkedRowAvailability {
    if (!hass?.callApi) return 'missing';
    const components = hass.config?.components;
    if (Array.isArray(components) && !components.includes('ultra_card_pro_cloud')) {
      return 'missing';
    }
    if (this._endpointMissing) return 'outdated';
    const info = getConnectInfo(hass);
    if (info.installed && (info.outdated || info.capabilities.linked_rows !== true)) {
      return 'outdated';
    }
    return 'available';
  }

  // ── Cache ────────────────────────────────────────────────────────────────

  private _hydrate(): void {
    if (this._hydrated) return;
    this._hydrated = true;
    try {
      const raw = safeGetItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const rows = parsed?.rows;
      if (!rows || typeof rows !== 'object') return;
      for (const value of Object.values(rows)) {
        if (isRecord(value) && !this._rows.has(value.id)) this._rows.set(value.id, value);
      }
    } catch {
      // A corrupt cache is just an empty one.
    }
  }

  private _persist(): void {
    const rows: Record<string, LinkedRowRecord> = {};
    for (const [id, row] of this._rows) rows[id] = row;
    safeSetItem(STORAGE_KEY, JSON.stringify({ rows }));
  }

  private _store(row: LinkedRowRecord): void {
    const prev = this._rows.get(row.id);
    this._absent.delete(row.id);
    this._rows.set(row.id, row);
    this._persist();
    if (!prev || prev.revision !== row.revision || prev.name !== row.name) this._notify();
  }

  /** Last known shared copy (memory, then this browser's cache). */
  getCached(id: string | undefined | null): LinkedRowRecord | undefined {
    if (!id) return undefined;
    this._hydrate();
    return this._rows.get(id);
  }

  /** True once Connect answered that this id is not in the library. */
  isAbsent(id: string | undefined | null): boolean {
    return !!id && this._absent.has(id);
  }

  getConflict(id: string | undefined | null): LinkedRowRecord | undefined {
    return id ? this._conflicts.get(id) : undefined;
  }

  clearConflict(id: string): void {
    if (this._conflicts.delete(id)) this._notify();
  }

  // ── Reads ────────────────────────────────────────────────────────────────

  /**
   * Fetch the shared copy when it has not been checked recently. Safe to call
   * on every render: requests are de-duplicated and throttled.
   */
  ensureFresh(hass: HassLike | null | undefined, id: string | undefined | null): void {
    if (!id || this.availability(hass) !== 'available') return;
    const last = this._checkedAt.get(id);
    if (last !== undefined && this._now() - last < LINKED_ROW_REFRESH_MS) return;
    void this.fetchRow(hass, id);
  }

  /** Fetch one row; resolves with the cached copy when Connect cannot answer. */
  fetchRow(hass: HassLike | null | undefined, id: string): Promise<LinkedRowRecord | null> {
    const existing = this._inflight.get(id);
    if (existing) return existing;
    if (!hass?.callApi || this.availability(hass) !== 'available') {
      return Promise.resolve(this.getCached(id) ?? null);
    }
    this._checkedAt.set(id, this._now());
    const promise = hass
      .callApi<RowResponse>('GET', `${LINKED_ROWS_API}?id=${encodeURIComponent(id)}`)
      .then(result => {
        const row = result?.row;
        if (isRecord(row)) {
          this._store(row);
          return row;
        }
        if (row === null) {
          const wasAbsent = this._absent.has(id);
          this._absent.add(id);
          if (!wasAbsent) this._notify();
        }
        return this.getCached(id) ?? null;
      })
      .catch((err: ApiError) => {
        this._handleReadError(err, id);
        return this.getCached(id) ?? null;
      })
      .finally(() => {
        this._inflight.delete(id);
      });
    this._inflight.set(id, promise);
    return promise;
  }

  /** Library summaries for the editor picker; `null` when Connect cannot answer. */
  async listRows(hass: HassLike | null | undefined): Promise<LinkedRowSummary[] | null> {
    if (!hass?.callApi || this.availability(hass) !== 'available') return null;
    try {
      const result = await hass.callApi<ListResponse>('GET', LINKED_ROWS_API);
      const rows: unknown[] = Array.isArray(result?.rows) ? result.rows : [];
      return rows.filter((r): r is LinkedRowSummary => {
        const o = r as Partial<LinkedRowSummary> | null;
        return !!o && typeof o.id === 'string' && typeof o.name === 'string';
      });
    } catch (err) {
      this._handleReadError(err as ApiError);
      return null;
    }
  }

  private _handleReadError(err: ApiError, id?: string): void {
    const status = errorStatus(err);
    if (status === 404) {
      // Connect without the endpoint: stop asking, render local copies.
      if (!this._endpointMissing) {
        this._endpointMissing = true;
        this._notify();
      }
      return;
    }
    if (id && status !== 401 && status !== 403) {
      // Offline / 5xx: retry sooner than the normal refresh.
      this._checkedAt.set(id, this._now() - LINKED_ROW_REFRESH_MS + RETRY_MS);
    }
  }

  // ── Writes ───────────────────────────────────────────────────────────────

  /**
   * Create or update a shared row. `baseRevision` is the revision the local
   * copy was synced at (0 to create). `force` overwrites a newer shared copy.
   */
  async save(
    hass: HassLike | null | undefined,
    input: {
      id: string;
      modules?: CardModule[] | undefined;
      name?: string | undefined;
      baseRevision: number;
      force?: boolean | undefined;
    }
  ): Promise<LinkedRowSaveResult> {
    if (!hass?.callApi || this.availability(hass) !== 'available') {
      return { ok: false, error: 'unavailable' };
    }
    const body: Record<string, unknown> = { id: input.id, base_revision: input.baseRevision };
    if (input.modules !== undefined) body.modules = input.modules;
    if (input.name !== undefined) body.name = input.name;
    if (input.force) body.force = true;
    try {
      const result = await hass.callApi<RowResponse>('POST', LINKED_ROWS_API, body);
      const row = result?.row;
      if (!isRecord(row)) return { ok: false, error: 'bad_response' };
      this._conflicts.delete(input.id);
      this._checkedAt.set(input.id, this._now());
      this._store(row);
      return { ok: true, row };
    } catch (caught) {
      const err = caught as ApiError;
      const status = errorStatus(err);
      const current = err?.body?.current;
      if (status === 409 && isRecord(current)) {
        this._conflicts.set(input.id, current);
        this._store(current);
        this._notify();
        return { ok: false, conflict: current };
      }
      if (status === 404) this._endpointMissing = true;
      const message =
        typeof err?.body?.error === 'string' ? err.body.error : String(err?.error || 'error');
      return { ok: false, error: message, status };
    }
  }

  /**
   * After the card is saved with edits to a linked row, share them. Called
   * from the dashboard render (not editor previews), once per local version,
   * and only for admins since Connect refuses other users' writes.
   */
  autoPush(hass: HassLike | null | undefined, module: LinkedRowModule): void {
    const id = module.linked_id;
    if (!id || !hass?.user?.is_admin) return;
    if (this.availability(hass) !== 'available') return;
    const shared = this.getCached(id);
    if (!shared) return;
    const resolution = resolveLinkedRowModules(module, shared);
    if (!resolution.localIsAhead) return;
    const key = `${id}:${shared.revision}:${linkedModulesKey(module.modules)}`;
    if (this._autoPushed.has(key)) return;
    this._autoPushed.add(key);
    void this.save(hass, {
      id,
      modules: module.modules || [],
      baseRevision: shared.revision,
    });
  }

  /** Test seam. */
  reset(): void {
    this._rows.clear();
    this._absent.clear();
    this._checkedAt.clear();
    this._inflight.clear();
    this._conflicts.clear();
    this._autoPushed.clear();
    this._endpointMissing = false;
    this._hydrated = false;
  }
}

export const ucLinkedRowService = new UcLinkedRowService();
