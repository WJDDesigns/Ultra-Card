/**
 * Lets the user widen Home Assistant's Sections views.
 *
 * A Sections view caps each column at 500px and centres the wrapper, so a
 * two-column view on a wide screen leaves a lot of empty space either side.
 * Home Assistant exposes the cap as theme variables
 * (`--ha-view-sections-column-max-width`, `--ha-view-sections-column-gap`),
 * which normally means editing a theme YAML file. This service sets those
 * variables on the nearest `hui-root` instead, from a switch in Hub > Themes.
 *
 * Precedence is HA's: a `theme:` on the view sets the same variables on
 * `hui-view`, which is closer to the content and therefore wins. Masonry and
 * Panel views ignore these variables, so they are untouched.
 *
 * The setting lives in this browser (localStorage) like the page painting
 * switch. It is applied without needing an Ultra Card on the view: the
 * service watches for `hui-root` on every dashboard, and each Ultra Card also
 * nudges it from its own subtree as a belt-and-braces path.
 */

import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/safe-storage';
import { findHuiRoot } from './uc-theme-page-service';

export type UcSectionsWidthMode = 'default' | 'full' | 'custom';

export interface UcSectionsLayout {
  mode: UcSectionsWidthMode;
  /** Max width of one section column in px (custom mode). HA's default is 500. */
  column_max_width: number;
  /** Gap between columns in px; also the wrapper's side padding. Unset keeps HA's 32px. */
  column_gap?: number;
}

const STORAGE_KEY = 'ultra-card-sections-layout';
/**
 * Same-document sync. The Hub panel and the card are separate bundles, so each
 * has its own instance of this service; `storage` events only fire in *other*
 * documents, so a change made in the Hub is announced on `window` as well.
 */
const CHANGE_EVENT = 'uc-sections-layout-changed';
const VAR_MAX_WIDTH = '--ha-view-sections-column-max-width';
const VAR_GAP = '--ha-view-sections-column-gap';
const MARK = 'data-uc-sections-layout';

export const UC_SECTIONS_COLUMN_WIDTH_DEFAULT = 500;
export const UC_SECTIONS_COLUMN_WIDTH_MIN = 200;
export const UC_SECTIONS_COLUMN_WIDTH_MAX = 4000;
export const UC_SECTIONS_GAP_MIN = 0;
export const UC_SECTIONS_GAP_MAX = 200;

const DEFAULTS: UcSectionsLayout = { mode: 'default', column_max_width: UC_SECTIONS_COLUMN_WIDTH_DEFAULT };

/** Retry schedule (ms) after navigation; the observers do the heavy lifting. */
const SYNC_DELAYS = [0, 250, 1000];
/** ~20 × 250ms then 1s apart: about 2 minutes of waiting for the HA shell. */
const BOOTSTRAP_MAX_ATTEMPTS = 140;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Pure: sanitise anything read from storage or a form. */
export function normalizeSectionsLayout(input: unknown): UcSectionsLayout {
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<Record<keyof UcSectionsLayout, unknown>>;
  const mode: UcSectionsWidthMode =
    raw.mode === 'full' || raw.mode === 'custom' ? raw.mode : 'default';
  const width = Number(raw.column_max_width);
  const gap = raw.column_gap === undefined || raw.column_gap === null || raw.column_gap === '' ? NaN : Number(raw.column_gap);
  const out: UcSectionsLayout = {
    mode,
    column_max_width: Number.isFinite(width)
      ? Math.round(clamp(width, UC_SECTIONS_COLUMN_WIDTH_MIN, UC_SECTIONS_COLUMN_WIDTH_MAX))
      : UC_SECTIONS_COLUMN_WIDTH_DEFAULT,
  };
  if (Number.isFinite(gap)) out.column_gap = Math.round(clamp(gap, UC_SECTIONS_GAP_MIN, UC_SECTIONS_GAP_MAX));
  return out;
}

/** Pure: the inline custom properties a layout asks for (none when default). */
export function sectionsLayoutVars(layout: UcSectionsLayout): Record<string, string> {
  if (layout.mode === 'default') return {};
  const vars: Record<string, string> = {
    [VAR_MAX_WIDTH]: layout.mode === 'full' ? '100vw' : `${layout.column_max_width}px`,
  };
  if (layout.column_gap !== undefined) vars[VAR_GAP] = `${layout.column_gap}px`;
  return vars;
}

function isDefault(layout: UcSectionsLayout): boolean {
  return layout.mode === 'default' && layout.column_gap === undefined;
}

/** The `ha-panel-lovelace` currently on screen, if any (null on the Hub, Settings, etc.). */
export function findActiveLovelacePanel(): Element | null {
  if (typeof document === 'undefined') return null;
  const ha = document.querySelector('home-assistant');
  const main = ha?.shadowRoot?.querySelector('home-assistant-main');
  return main?.shadowRoot?.querySelector('ha-panel-lovelace') ?? null;
}

/** `hui-root` of the Lovelace panel currently on screen, if any. */
export function findActiveHuiRoot(): HTMLElement | null {
  const root = findActiveLovelacePanel()?.shadowRoot?.querySelector('hui-root');
  return root instanceof HTMLElement ? root : null;
}

class UcSectionsLayoutService {
  private _layout: UcSectionsLayout = { ...DEFAULTS };
  private _listeners = new Set<() => void>();
  private _roots = new Set<HTMLElement>();
  private _syncTimers: number[] = [];
  private _resolverObserver: MutationObserver | null = null;
  private _panelObserver: MutationObserver | null = null;
  private _observedPanel: Element | null = null;
  private _started = false;

  constructor() {
    this._loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', e => {
        if (e.key === STORAGE_KEY) this._reloadExternal();
      });
      window.addEventListener(CHANGE_EVENT, e => {
        if ((e as CustomEvent<{ source?: unknown }>).detail?.source !== this) this._reloadExternal();
      });
    }
  }

  /** Another instance (other bundle or other tab) changed the setting. */
  private _reloadExternal(): void {
    this._loadFromStorage();
    this._repaintAll();
    this._notify();
  }

  // ---------------------------------------------------------------- settings

  get(): UcSectionsLayout {
    return { ...this._layout };
  }

  set(next: Partial<Omit<UcSectionsLayout, 'column_gap'>> & { column_gap?: number | undefined }): void {
    const merged = normalizeSectionsLayout({ ...this._layout, ...next });
    if (
      merged.mode === this._layout.mode &&
      merged.column_max_width === this._layout.column_max_width &&
      merged.column_gap === this._layout.column_gap
    ) {
      return;
    }
    this._layout = merged;
    if (isDefault(merged)) safeRemoveItem(STORAGE_KEY);
    else safeSetItem(STORAGE_KEY, JSON.stringify(merged));
    this._repaintAll();
    this._notify();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { source: this } }));
    }
  }

  reset(): void {
    this.set({ ...DEFAULTS, column_gap: undefined });
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  // ---------------------------------------------------------------- applying

  /**
   * Watch the page for `hui-root` and keep it painted. Idempotent; called once
   * from the bundle entry so the setting works on views without an Ultra Card.
   */
  start(): void {
    if (this._started || typeof window === 'undefined') return;
    this._started = true;
    const resync = () => this._scheduleSync();
    window.addEventListener('location-changed', resync);
    window.addEventListener('popstate', resync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resync();
    });
    this._bootstrap(0);
  }

  /**
   * On first load HA may take seconds to render its shell, so wait for
   * `partial-panel-resolver` and then watch it: every panel swap (dashboard
   * to dashboard, Hub to dashboard) shows up as a childList mutation there.
   */
  private _bootstrap(attempt: number): void {
    const ha = document.querySelector('home-assistant');
    const main = ha?.shadowRoot?.querySelector('home-assistant-main');
    const resolver = main?.shadowRoot?.querySelector('partial-panel-resolver');
    if (!resolver) {
      if (attempt < BOOTSTRAP_MAX_ATTEMPTS) {
        window.setTimeout(() => this._bootstrap(attempt + 1), attempt < 20 ? 250 : 1000);
      }
      return;
    }
    this._resolverObserver?.disconnect();
    this._resolverObserver = new MutationObserver(() => this._sync());
    this._resolverObserver.observe(resolver, { childList: true, subtree: true });
    this._sync();
  }

  /** Apply from inside a card's subtree (works in the editor preview too: no root, no-op). */
  touch(el: Element): void {
    const root = findHuiRoot(el);
    if (root) this._paint(root);
  }

  /** Inline vars currently on a root, for tests and tooling. */
  current(root: HTMLElement): Record<string, string> {
    const out: Record<string, string> = {};
    for (const name of [VAR_MAX_WIDTH, VAR_GAP]) {
      const v = root.style.getPropertyValue(name);
      if (v) out[name] = v;
    }
    return out;
  }

  private _scheduleSync(): void {
    for (const t of this._syncTimers) clearTimeout(t);
    this._syncTimers = SYNC_DELAYS.map(ms => window.setTimeout(() => this._sync(), ms));
  }

  private _sync(): void {
    this._observePanel(findActiveLovelacePanel());
    const root = findActiveHuiRoot();
    if (root) this._paint(root);
  }

  /**
   * `hui-root` is rendered by `ha-panel-lovelace` once its config has loaded,
   * and re-created on dashboard reload, so watch the panel's shadow root.
   */
  private _observePanel(panel: Element | null): void {
    if (!panel || panel === this._observedPanel) return;
    const panelShadow = panel.shadowRoot;
    if (!panelShadow) return;
    this._panelObserver?.disconnect();
    this._observedPanel = panel;
    this._panelObserver = new MutationObserver(() => {
      const next = findActiveHuiRoot();
      if (next) this._paint(next);
    });
    this._panelObserver.observe(panelShadow, { childList: true });
  }

  private _paint(root: HTMLElement): void {
    const vars = sectionsLayoutVars(this._layout);
    const names = Object.keys(vars);
    if (names.length === 0) {
      root.style.removeProperty(VAR_MAX_WIDTH);
      root.style.removeProperty(VAR_GAP);
      root.removeAttribute(MARK);
      this._roots.delete(root);
      return;
    }
    for (const name of [VAR_MAX_WIDTH, VAR_GAP]) {
      if (vars[name]) root.style.setProperty(name, vars[name]);
      else root.style.removeProperty(name);
    }
    root.setAttribute(MARK, this._layout.mode);
    this._roots.add(root);
  }

  private _repaintAll(): void {
    for (const root of Array.from(this._roots)) {
      if (!root.isConnected) {
        this._roots.delete(root);
        continue;
      }
      this._paint(root);
    }
    const active = findActiveHuiRoot();
    if (active) this._paint(active);
  }

  private _loadFromStorage(): void {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      this._layout = { ...DEFAULTS };
      return;
    }
    try {
      this._layout = normalizeSectionsLayout(JSON.parse(raw));
    } catch {
      this._layout = { ...DEFAULTS };
    }
  }

  private _notify(): void {
    for (const l of this._listeners) {
      try {
        l();
      } catch {
        // listeners must not break each other
      }
    }
  }
}

export const ucSectionsLayoutService = new UcSectionsLayoutService();
