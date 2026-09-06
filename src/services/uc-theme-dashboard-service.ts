import type { HomeAssistant } from 'custom-card-helpers';
import { UC_DEBUG } from '../utils/uc-debug';

/**
 * Write a theme onto every Ultra Card of a dashboard.
 *
 * Walks the Lovelace config (views, sections, nested stacks, conditional
 * cards...) and sets `uc_theme` on each `custom:ultra-card`, then saves the
 * config back with `lovelace/config/save`. The previous config is kept in
 * memory so the last apply can be undone from the Hub without a cloud
 * snapshot. YAML-mode dashboards are read-only and reported as such.
 */

export interface UcDashboardRef {
  /** `null` for the default dashboard. */
  urlPath: string | null;
  title: string;
  mode?: 'storage' | 'yaml' | undefined;
}

export interface UcApplyThemeResult {
  cardsUpdated: number;
  cardsSeen: number;
  dashboard: UcDashboardRef;
}

const ULTRA_CARD_TYPES = new Set(['custom:ultra-card']);

class UcThemeDashboardService {
  private _undo: { ref: UcDashboardRef; config: unknown } | null = null;

  async listDashboards(hass: HomeAssistant): Promise<UcDashboardRef[]> {
    const out: UcDashboardRef[] = [{ urlPath: null, title: 'Overview (default)', mode: 'storage' }];
    try {
      const list: any = await hass.callWS({ type: 'lovelace/dashboards/list' });
      if (Array.isArray(list)) {
        for (const d of list) {
          if (!d?.url_path) continue;
          out.push({ urlPath: d.url_path, title: d.title || d.url_path, mode: d.mode });
        }
      }
    } catch (err) {
      UC_DEBUG && console.debug('[UltraCard themes] dashboards/list failed', err);
    }
    return out;
  }

  /** Dashboard the user is currently looking at, if it can be told from the URL. */
  currentDashboard(): string | null {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const m = /^\/([^/]+)/.exec(path);
    if (!m) return null;
    const first = m[1];
    if (first === 'lovelace') return null;
    const reserved = ['ultra-card-hub', 'config', 'developer-tools', 'hacs', 'logbook', 'history', 'map', 'energy', 'todo', 'profile'];
    return reserved.includes(first) ? null : first;
  }

  /**
   * Count Ultra Cards without changing anything.
   */
  async countUltraCards(hass: HomeAssistant, ref: UcDashboardRef): Promise<number> {
    const config = await this._load(hass, ref);
    let n = 0;
    this._walk(config, () => {
      n++;
    });
    return n;
  }

  /**
   * Set `uc_theme` on every Ultra Card. `themeId` of `''`/undefined clears the
   * key (follow global default); `'none'` opts the cards out.
   */
  async applyTheme(
    hass: HomeAssistant,
    ref: UcDashboardRef,
    themeId: string | undefined
  ): Promise<UcApplyThemeResult> {
    if (ref.mode === 'yaml') {
      throw new Error('This dashboard is managed in YAML and cannot be edited from the Hub.');
    }
    const original = await this._load(hass, ref);
    const config = JSON.parse(JSON.stringify(original));
    let seen = 0;
    let updated = 0;
    this._walk(config, card => {
      seen++;
      const current = card.uc_theme ?? '';
      const next = themeId ?? '';
      if (current === next) return;
      if (next) card.uc_theme = next;
      else delete card.uc_theme;
      updated++;
    });
    if (updated > 0) {
      await this._save(hass, ref, config);
      this._undo = { ref, config: original };
    }
    return { cardsUpdated: updated, cardsSeen: seen, dashboard: ref };
  }

  canUndo(): UcDashboardRef | null {
    return this._undo?.ref ?? null;
  }

  async undo(hass: HomeAssistant): Promise<UcDashboardRef | null> {
    if (!this._undo) return null;
    const { ref, config } = this._undo;
    await this._save(hass, ref, config);
    this._undo = null;
    return ref;
  }

  // ------------------------------------------------------------------ internals

  private async _load(hass: HomeAssistant, ref: UcDashboardRef): Promise<any> {
    const config = await hass.callWS<any>({
      type: 'lovelace/config',
      url_path: ref.urlPath,
    } as any);
    if (!config || typeof config !== 'object') {
      throw new Error('Dashboard configuration could not be loaded.');
    }
    return config;
  }

  private async _save(hass: HomeAssistant, ref: UcDashboardRef, config: unknown): Promise<void> {
    await hass.callWS({
      type: 'lovelace/config/save',
      url_path: ref.urlPath,
      config,
    } as any);
  }

  /** Depth-first visit of every Ultra Card config object in a Lovelace config. */
  private _walk(node: unknown, visit: (card: Record<string, any>) => void, depth = 0): void {
    if (!node || typeof node !== 'object' || depth > 40) return;
    if (Array.isArray(node)) {
      for (const item of node) this._walk(item, visit, depth + 1);
      return;
    }
    const obj = node as Record<string, any>;
    if (typeof obj.type === 'string' && ULTRA_CARD_TYPES.has(obj.type)) {
      visit(obj);
      // Ultra Cards can nest other cards (external card module); keep walking.
    }
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'type') continue;
      if (value && typeof value === 'object') this._walk(value, visit, depth + 1);
    }
  }
}

export const ucThemeDashboardService = new UcThemeDashboardService();
