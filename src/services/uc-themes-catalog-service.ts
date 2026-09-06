/**
 * Public theme catalog on ultracard.io (`GET /ultra-card/v1/themes`).
 *
 * Read-only and anonymous: browsing and installing a theme never needs an
 * account. Installing copies the sanitised definition into the local theme
 * library under its catalog id (`wp-<slug>`) so a card can reference it by
 * `uc_theme` even while offline. Authoring lives in `uc-theme-author-service`.
 */

import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/safe-storage';
import type { UcThemeDefinition, UcThemeSource } from '../themes/uc-theme-types';
import { sanitizeThemeDefinition } from '../themes/uc-theme-validate';
import { ucThemeService } from './uc-theme-service';
import { UC_DEBUG } from '../utils/uc-debug';

export type UcThemeCatalogSort = 'date' | 'downloads' | 'title';

export interface UcCatalogTheme {
  /** WordPress post id. */
  id: number;
  /** Id the theme carries in the local library: `wp-<slug>`. */
  catalogId: string;
  name: string;
  description: string;
  author: string;
  source: Extract<UcThemeSource, 'official' | 'community'>;
  tags: string[];
  preview?: string | undefined;
  downloads: number;
  version: number;
  created: string;
  updated: string;
  /** Sanitised definition ready for `ucThemeService.saveToLibrary`. */
  definition: UcThemeDefinition;
  /** Things the sanitiser dropped from the published definition. */
  warnings: string[];
}

export interface UcCatalogPage {
  themes: UcCatalogTheme[];
  total: number;
  pages: number;
  page: number;
}

export interface UcCatalogQuery {
  page?: number | undefined;
  per_page?: number | undefined;
  search?: string | undefined;
  tag?: string | undefined;
  orderby?: UcThemeCatalogSort | undefined;
}

export type UcThemeInstallState = 'not_installed' | 'installed' | 'update_available';

const API_BASE = 'https://ultracard.io/wp-json/ultra-card/v1';
const CACHE_PREFIX = 'ultra-card-themes-v1:';
const CACHE_TTL = 5 * 60 * 1000;
/** Stale data is still better than an empty catalog when ultracard.io is unreachable. */
const STALE_TTL = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT = 8000;

interface CacheEntry {
  data: UcCatalogPage;
  timestamp: number;
}

function normalizeEntry(raw: unknown): UcCatalogTheme | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = Number(r.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const source: UcCatalogTheme['source'] = r.source === 'official' ? 'official' : 'community';
  const { theme, warnings } = sanitizeThemeDefinition(r.definition, { source, idPrefix: 'wp-' });
  if (!theme) return null;
  const catalogId = typeof r.catalog_id === 'string' && r.catalog_id ? r.catalog_id : theme.id;
  theme.id = catalogId;
  const version = Math.max(1, Number(r.version) || theme.version || 1);
  theme.version = version;
  const tags = Array.isArray(r.tags) ? r.tags.map(t => String(t).trim()).filter(Boolean) : [];
  const preview = typeof r.preview === 'string' && r.preview ? r.preview : theme.preview;
  return {
    id,
    catalogId,
    name: String(r.name || theme.name),
    description: String(r.description || theme.description || ''),
    author: String(r.author || theme.author || 'Community'),
    source,
    tags,
    preview,
    downloads: Number(r.downloads) || 0,
    version,
    created: String(r.date || ''),
    updated: String(r.modified || ''),
    definition: theme,
    warnings,
  };
}

class UcThemesCatalogService {
  private _memory = new Map<string, CacheEntry>();
  private _inflight = new Map<string, Promise<UcCatalogPage>>();

  async fetchThemes(query: UcCatalogQuery = {}): Promise<UcCatalogPage> {
    const key = JSON.stringify({
      page: query.page ?? 1,
      per_page: query.per_page ?? 50,
      search: query.search ?? '',
      tag: query.tag ?? '',
      orderby: query.orderby ?? 'date',
    });

    const fresh = this._read(key, CACHE_TTL);
    if (fresh) return fresh;

    const running = this._inflight.get(key);
    if (running) return running;

    const promise = this._fetch(query)
      .then(page => {
        this._write(key, page);
        return page;
      })
      .catch(err => {
        UC_DEBUG && console.warn('[UltraCard themes] catalog fetch failed:', err);
        const stale = this._read(key, STALE_TTL);
        if (stale) return stale;
        throw err instanceof Error ? err : new Error(String(err));
      })
      .finally(() => this._inflight.delete(key));
    this._inflight.set(key, promise);
    return promise;
  }

  async fetchTheme(id: number): Promise<UcCatalogTheme | null> {
    const response = await fetch(`${API_BASE}/themes/${id}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!response.ok) return null;
    return normalizeEntry(await response.json());
  }

  /** Fire-and-forget download counter. */
  trackDownload(id: number): void {
    fetch(`${API_BASE}/themes/${id}/track-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    }).catch(err => UC_DEBUG && console.debug('[UltraCard themes] track-download failed:', err));
  }

  installState(entry: UcCatalogTheme): UcThemeInstallState {
    const local = ucThemeService.getTheme(entry.catalogId);
    if (!local) return 'not_installed';
    return local.version < entry.version ? 'update_available' : 'installed';
  }

  /**
   * Copy a catalog theme into the local library. Returns the stored definition
   * or null when the sanitiser refused it. Counts as a download only for a
   * fresh install or an update, not for re-saving the same version.
   */
  install(entry: UcCatalogTheme): UcThemeDefinition | null {
    const before = this.installState(entry);
    const saved = ucThemeService.saveToLibrary(entry.definition, { source: entry.source });
    if (saved && before !== 'installed') this.trackDownload(entry.id);
    return saved;
  }

  clearCache(): void {
    this._memory.clear();
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(CACHE_PREFIX)) safeRemoveItem(key);
      }
    } catch {
      /* storage unavailable */
    }
  }

  // ------------------------------------------------------------------ internals

  private async _fetch(query: UcCatalogQuery): Promise<UcCatalogPage> {
    const params = new URLSearchParams();
    params.set('page', String(query.page ?? 1));
    params.set('per_page', String(query.per_page ?? 50));
    if (query.search) params.set('search', query.search);
    if (query.tag) params.set('tag', query.tag);
    params.set('orderby', query.orderby ?? 'date');

    const response = await fetch(`${API_BASE}/themes?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const payload = (await response.json()) as Record<string, unknown>;
    const list = Array.isArray(payload?.themes) ? payload.themes : [];
    const themes = list.map(normalizeEntry).filter((t): t is UcCatalogTheme => !!t);
    return {
      themes,
      total: Number(payload.total ?? themes.length),
      pages: Number(payload.total_pages ?? 1),
      page: Number(payload.page ?? query.page ?? 1),
    };
  }

  private _read(key: string, maxAge: number): UcCatalogPage | null {
    const now = Date.now();
    const mem = this._memory.get(key);
    if (mem && now - mem.timestamp < maxAge) return mem.data;
    const raw = safeGetItem(CACHE_PREFIX + key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as CacheEntry;
      if (!parsed?.data || typeof parsed.timestamp !== 'number') return null;
      if (now - parsed.timestamp >= maxAge) return null;
      // Re-run the sanitiser: the allow-lists may have tightened since this was cached.
      const themes = parsed.data.themes
        .map(t => {
          const { theme } = sanitizeThemeDefinition(t.definition, { source: t.source });
          return theme ? { ...t, definition: theme } : null;
        })
        .filter((t): t is UcCatalogTheme => !!t);
      const data = { ...parsed.data, themes };
      this._memory.set(key, { data, timestamp: parsed.timestamp });
      return data;
    } catch {
      safeRemoveItem(CACHE_PREFIX + key);
      return null;
    }
  }

  private _write(key: string, data: UcCatalogPage): void {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    this._memory.set(key, entry);
    safeSetItem(CACHE_PREFIX + key, JSON.stringify(entry));
  }
}

export const ucThemesCatalogService = new UcThemesCatalogService();
