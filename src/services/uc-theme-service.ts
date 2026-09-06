import type { UltraCardConfig } from '../types';
import type {
  UcThemeCardChrome,
  UcThemeDefinition,
  UcThemeSource,
} from '../themes/uc-theme-types';
import {
  UC_THEME_HA_NATIVE,
  UC_THEME_MODULE_STYLE_KEYS,
  UC_THEME_NONE,
  isUcThemeInherit,
} from '../themes/uc-theme-types';
import { BUILTIN_THEMES, HA_NATIVE_THEME } from '../themes/builtin-themes';
import { sanitizeThemeDefinition } from '../themes/uc-theme-validate';
import { getSurfaceTokens } from '../utils/uc-surface-styles';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/safe-storage';
import { getConnectInfo } from './uc-connect-compatibility';
import { UC_DEBUG } from '../utils/uc-debug';

/**
 * Theme engine.
 *
 * Owns the theme registry (built-in + downloaded/local library), the global
 * default, and the three things a theme does at runtime:
 *
 *  1. card chrome defaults (`card_*`) for values the card config leaves unset,
 *  2. per-module style defaults for style fields left on "inherit",
 *  3. `--uc-*` CSS variables (and optional palette) on the card host.
 *
 * Persistence: localStorage for the library and global default, with an
 * opportunistic sync of the global default through Ultra Card Connect
 * (`ultra_card_pro_cloud/theme_settings`) when the integration exposes it.
 * A 404 latches so an older Connect never gets spammed.
 */

export const UC_THEME_CHANGED_EVENT = 'ultra-card-theme-changed';

/**
 * Stylesheet injected into the card shadow root whenever a theme (anything but
 * HA Native / none) is active, ahead of the theme's own `css`.
 *
 * Design-tab surfaces: `buildDesignStyles()` flags any module that paints its
 * own background with `--uc-design-surface`. When the Design tab left the
 * radius empty, the surface takes the theme's small radius. Matching on the
 * inline `style` attribute keeps this a pure fallback: an explicit
 * border-radius in the Design tab always wins, and nothing here exists under
 * HA Native so legacy configs render byte-for-byte as before.
 */
export const UC_THEME_BASE_CSS = `
[style*="--uc-design-surface"]:not([style*="border-radius"]) {
  border-radius: var(--uc-radius-sm);
}
`.trim();

const STORAGE_LIBRARY = 'ultra-card-theme-library';
const STORAGE_GLOBAL = 'ultra-card-global-theme';
const HOST_VARS_APPLIED = new WeakMap<HTMLElement, { key: string; props: string[] }>();

const DENSITY_SCALE: Record<string, string> = {
  compact: '0.875',
  regular: '1',
  comfortable: '1.125',
};

const PALETTE_TO_VARS: Record<string, string[]> = {
  primary: ['--primary-color'],
  accent: ['--accent-color'],
  card_bg: ['--card-background-color', '--ha-card-background'],
  text: ['--primary-text-color'],
  text_secondary: ['--secondary-text-color'],
  divider: ['--divider-color'],
};

function hexToRgb(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

class UcThemeService {
  private _library = new Map<string, UcThemeDefinition>();
  private _globalDefaultId: string | null = null;
  private _listeners = new Set<() => void>();
  private _hass: any = null;
  private _connectLoaded = false;
  private _connectMissing = false;
  private _loadPromise: Promise<void> | null = null;

  constructor() {
    this._loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', e => {
        if (e.key === STORAGE_LIBRARY || e.key === STORAGE_GLOBAL) {
          this._loadFromStorage();
          this._notify();
        }
      });
    }
  }

  // ---------------------------------------------------------------- registry

  getBuiltinThemes(): readonly UcThemeDefinition[] {
    return BUILTIN_THEMES;
  }

  getLibraryThemes(): UcThemeDefinition[] {
    return [...this._library.values()];
  }

  getAllThemes(): UcThemeDefinition[] {
    return [...BUILTIN_THEMES, ...this._library.values()];
  }

  getTheme(id: string | undefined | null): UcThemeDefinition | undefined {
    if (!id) return undefined;
    return BUILTIN_THEMES.find(t => t.id === id) ?? this._library.get(id);
  }

  isBuiltin(id: string): boolean {
    return BUILTIN_THEMES.some(t => t.id === id);
  }

  /**
   * Add or replace a theme in the local library. Input is sanitised; returns
   * the stored definition or null when it could not be trusted.
   */
  saveToLibrary(
    raw: unknown,
    opts?: { source?: UcThemeSource | undefined; idPrefix?: string | undefined }
  ): UcThemeDefinition | null {
    const { theme, warnings } = sanitizeThemeDefinition(raw, opts);
    if (!theme) {
      UC_DEBUG && console.warn('[UltraCard themes] rejected theme:', warnings);
      return null;
    }
    if (this.isBuiltin(theme.id)) {
      // Never shadow a built-in; store as a local copy instead.
      theme.id = `local-${theme.id}`;
    }
    if (!theme.source) theme.source = 'local';
    this._library.set(theme.id, theme);
    this._saveLibrary();
    this._notify();
    return theme;
  }

  removeFromLibrary(id: string): boolean {
    if (!this._library.delete(id)) return false;
    this._saveLibrary();
    if (this._globalDefaultId === id) this.setGlobalDefault(null);
    else this._notify();
    return true;
  }

  /** JSON a user can share or re-import. */
  exportTheme(id: string): string | null {
    const theme = this.getTheme(id);
    if (!theme) return null;
    const { source: _source, ...rest } = theme;
    return JSON.stringify(rest, null, 2);
  }

  // ---------------------------------------------------------- global default

  getGlobalDefaultId(): string | null {
    return this._globalDefaultId;
  }

  setGlobalDefault(id: string | null): void {
    const next = id && this.getTheme(id) ? id : null;
    if (next === this._globalDefaultId) return;
    this._globalDefaultId = next;
    if (next) safeSetItem(STORAGE_GLOBAL, next);
    else safeRemoveItem(STORAGE_GLOBAL);
    this._notify();
    this._syncGlobalToConnect();
  }

  // -------------------------------------------------------------- resolution

  /** Effective theme id for a card: `none`, or a theme id (unknown ids fall back to HA Native). */
  resolveThemeId(config: UltraCardConfig | undefined | null): string {
    const explicit = config?.uc_theme;
    if (explicit === UC_THEME_NONE) return UC_THEME_NONE;
    if (explicit && this.getTheme(explicit)) return explicit;
    if (this._globalDefaultId && this.getTheme(this._globalDefaultId)) return this._globalDefaultId;
    return UC_THEME_HA_NATIVE;
  }

  /**
   * Effective theme for a card, or null when no theme applies (opted out or
   * HA Native, which is a no-op by definition).
   */
  resolveTheme(config: UltraCardConfig | undefined | null): UcThemeDefinition | null {
    const id = this.resolveThemeId(config);
    if (id === UC_THEME_NONE || id === UC_THEME_HA_NATIVE) return null;
    return this.getTheme(id) ?? null;
  }

  /** Card chrome the theme wants, for keys the card config leaves undefined. */
  getCardChrome(config: UltraCardConfig | undefined | null): UcThemeCardChrome {
    return this.resolveTheme(config)?.card ?? {};
  }

  /**
   * Default a theme provides for one module style key, or undefined.
   * Only keys listed in `UC_THEME_MODULE_STYLE_KEYS` are consulted.
   */
  getModuleDefault(
    config: UltraCardConfig | undefined | null,
    moduleType: string,
    key: string
  ): unknown {
    const theme = this.resolveTheme(config);
    if (!theme?.modules) return undefined;
    const allowed = UC_THEME_MODULE_STYLE_KEYS[moduleType];
    if (!allowed || !allowed.includes(key)) return undefined;
    return theme.modules[moduleType]?.[key];
  }

  /**
   * The value a module should render with: the explicit module value unless
   * it is on "inherit", then the theme default, then the module's own default.
   */
  resolveModuleStyle<T>(
    config: UltraCardConfig | undefined | null,
    moduleType: string,
    key: string,
    explicit: T | 'theme' | undefined | null,
    fallback: T
  ): T {
    if (!isUcThemeInherit(explicit)) return explicit as T;
    const themed = this.getModuleDefault(config, moduleType, key);
    return (themed as T | undefined) ?? fallback;
  }

  // ----------------------------------------------------------- host styling

  /** Pure: the CSS custom properties a theme sets on the card host. */
  getHostVars(theme: UcThemeDefinition | null): Record<string, string> {
    if (!theme) return {};
    const t = theme.tokens;
    const surface = getSurfaceTokens(t.surface, {
      blur: t.blur,
      borderWidth: t.border_width,
      borderColor: t.border_color,
      shadow: t.shadow,
    });
    const vars: Record<string, string> = {
      '--uc-theme-surface': t.surface,
      '--uc-radius': `${t.radius}px`,
      '--uc-radius-sm': `${t.radius_sm ?? Math.round(t.radius / 2)}px`,
      '--uc-blur': `${t.blur ?? 12}px`,
      '--uc-border-width': `${t.border_width ?? 1}px`,
      '--uc-surface-bg': surface.background,
      '--uc-surface-border': surface.border,
      '--uc-surface-backdrop': surface.backdropFilter,
      '--uc-shadow': surface.shadow,
      '--uc-density': DENSITY_SCALE[t.density ?? 'regular'] ?? '1',
    };
    if (t.border_color) vars['--uc-border-color'] = t.border_color;
    if (t.accent) vars['--uc-accent'] = t.accent;
    if (t.font_family) vars['--uc-font-family'] = t.font_family;
    if (t.palette) {
      for (const [key, value] of Object.entries(t.palette)) {
        if (!value) continue;
        for (const v of PALETTE_TO_VARS[key] ?? []) {
          vars[v] = value;
          const rgb = hexToRgb(value);
          if (rgb && v.endsWith('-color')) vars[`--rgb${v.slice(1)}`] = rgb;
        }
      }
    }
    return vars;
  }

  /**
   * Apply (or clear) a theme's host variables and `data-uc-theme` attribute.
   * Returns true when something changed.
   */
  applyThemeToHost(el: HTMLElement, theme: UcThemeDefinition | null): boolean {
    const key = theme ? `${theme.id}@${theme.version}` : '';
    const prev = HOST_VARS_APPLIED.get(el);
    if (prev?.key === key) return false;
    if (prev) for (const p of prev.props) el.style.removeProperty(p);
    if (!theme) {
      HOST_VARS_APPLIED.delete(el);
      el.removeAttribute('data-uc-theme');
      return !!prev;
    }
    const vars = this.getHostVars(theme);
    for (const [p, v] of Object.entries(vars)) el.style.setProperty(p, v);
    el.setAttribute('data-uc-theme', theme.id);
    HOST_VARS_APPLIED.set(el, { key, props: Object.keys(vars) });
    return true;
  }

  // ------------------------------------------------------------ subscription

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    for (const l of this._listeners) {
      try {
        l();
      } catch (e) {
        UC_DEBUG && console.warn('[UltraCard themes] listener failed', e);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(UC_THEME_CHANGED_EVENT, { detail: { globalDefault: this._globalDefaultId } })
      );
    }
  }

  // ------------------------------------------------------------- persistence

  private _loadFromStorage(): void {
    this._library.clear();
    const raw = safeGetItem(STORAGE_LIBRARY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const { theme } = sanitizeThemeDefinition(item);
            if (theme && !this.isBuiltin(theme.id)) this._library.set(theme.id, theme);
          }
        }
      } catch {
        /* corrupt library: start empty */
      }
    }
    const global = safeGetItem(STORAGE_GLOBAL);
    this._globalDefaultId = global && this.getTheme(global) ? global : null;
  }

  private _saveLibrary(): void {
    safeSetItem(STORAGE_LIBRARY, JSON.stringify([...this._library.values()]));
  }

  // ------------------------------------------------------------ Connect sync

  setHass(hass: any): void {
    this._hass = hass;
    if (hass && !this._connectLoaded && !this._connectMissing) {
      void this._loadGlobalFromConnect(hass);
    }
  }

  private async _loadGlobalFromConnect(hass: any): Promise<void> {
    if (!hass?.callApi) return;
    if (this._loadPromise) return this._loadPromise;
    this._loadPromise = (async () => {
      try {
        const connect = getConnectInfo(hass);
        if (!connect.installed) {
          this._connectMissing = true;
          return;
        }
        const result = await hass.callApi('GET', 'ultra_card_pro_cloud/theme_settings');
        this._connectLoaded = true;
        const id = typeof result?.global_theme === 'string' ? result.global_theme : null;
        if (id !== null && id !== this._globalDefaultId && (id === '' || this.getTheme(id))) {
          this._globalDefaultId = id || null;
          if (id) safeSetItem(STORAGE_GLOBAL, id);
          else safeRemoveItem(STORAGE_GLOBAL);
          this._notify();
        }
      } catch (err: any) {
        const status = err?.status ?? err?.status_code ?? err?.response?.status;
        if (status === 404 || status === 401 || status === 403) {
          this._connectLoaded = true;
          this._connectMissing = status === 404;
        }
        UC_DEBUG && console.debug('[UltraCard themes] Connect theme settings unavailable:', err);
      } finally {
        this._loadPromise = null;
      }
    })();
    return this._loadPromise;
  }

  private _syncGlobalToConnect(): void {
    const hass = this._hass;
    if (!hass?.callApi || this._connectMissing) return;
    hass
      .callApi('POST', 'ultra_card_pro_cloud/theme_settings', {
        global_theme: this._globalDefaultId ?? '',
      })
      .catch((err: any) => {
        const status = err?.status ?? err?.status_code ?? err?.response?.status;
        if (status === 404) this._connectMissing = true;
        UC_DEBUG && console.debug('[UltraCard themes] Connect theme sync failed:', err);
      });
  }
}

export const ucThemeService = new UcThemeService();

/** Convenience for modules: `ucThemeService.resolveModuleStyle` with the module's type baked in. */
export function resolveThemedModuleStyle<T>(
  config: UltraCardConfig | undefined | null,
  moduleType: string,
  key: string,
  explicit: T | 'theme' | undefined | null,
  fallback: T
): T {
  return ucThemeService.resolveModuleStyle(config, moduleType, key, explicit, fallback);
}

/**
 * Shallow copy of `module` with every listed style key that is on "inherit"
 * replaced by the theme's value (or the given fallback). Returns the original
 * object untouched when nothing needed resolving, so render paths that key
 * caches on module identity keep working.
 */
export function withThemedStyles<T extends object>(
  module: T,
  config: UltraCardConfig | undefined | null,
  moduleType: string,
  fallbacks: Partial<Record<keyof T & string, unknown>>
): T {
  let copy: T | null = null;
  for (const [key, fallback] of Object.entries(fallbacks)) {
    const current = (module as Record<string, unknown>)[key];
    if (!isUcThemeInherit(current)) continue;
    const resolved = ucThemeService.resolveModuleStyle(config, moduleType, key, current as any, fallback);
    if (resolved === current) continue;
    copy ??= { ...module };
    (copy as Record<string, unknown>)[key] = resolved;
  }
  return copy ?? module;
}

export { HA_NATIVE_THEME };
