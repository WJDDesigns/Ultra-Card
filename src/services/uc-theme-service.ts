import type { UltraCardConfig } from '../types';
import type {
  UcThemeCardChrome,
  UcThemeDefinition,
  UcThemePaletteKey,
  UcThemeSource,
  UcThemeTokens,
} from '../themes/uc-theme-types';
import {
  contrastText,
  parseColor,
  step,
  toCss,
  toRgbTriple,
  withAlpha,
  type Rgba,
} from '../themes/uc-theme-color';
import {
  UC_THEME_HA_NATIVE,
  UC_THEME_MODULE_STYLE_KEYS,
  UC_THEME_NONE,
  isUcThemeInherit,
} from '../themes/uc-theme-types';
import { BUILTIN_THEMES, HA_NATIVE_THEME } from '../themes/builtin-themes';
import { sanitizeThemeDefinition } from '../themes/uc-theme-validate';
import { getSurfaceTokens } from '../utils/uc-surface-styles';
import {
  recipeForRole,
  recipesFromSurface,
  surfaceRoleFor,
  type UcSurfaceRecipe,
  type UcSurfaceRole,
} from '../utils/uc-surface-recipes';
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
 *
 * Colour filter: `tokens.grayscale` becomes `--uc-color-filter` on the host
 * and is applied to the card container so every module, including ones with
 * explicit colours, is desaturated. `filter: none` (the default) creates no
 * containing block, so themes without the token change nothing. Popups and
 * drawers portal to `document.body` and are deliberately left in colour.
 */
/**
 * Radii modules were authored with (px). Each becomes a `--uc-r-N` variable
 * inside a themed card: scaled by `--uc-radius-scale` and capped at
 * `--uc-radius-inner` so nested corners always step down from the card's.
 * Outside a themed card the variables are unset and modules use their own
 * `Npx` fallback, so HA Native renders exactly as before.
 */
export const UC_MODULE_RADII = [1, 1.5, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 18, 20, 22, 24] as const;

const MODULE_RADIUS_VARS = UC_MODULE_RADII.map(
  n => `  --uc-r-${String(n).replace('.', '_')}: min(calc(${n}px * var(--uc-radius-scale, 1)), var(--uc-radius-inner, 999px));`
).join('\n');

/**
 * Card shell: the surface's background, shadow and backdrop come from the
 * host variables so a theme made of tokens alone (what the theme builder and
 * the Hub editor produce) styles the shell without also spelling out
 * `card.*`. These are stylesheet rules, so any explicit chrome the card
 * config or `theme.card` puts inline still wins.
 */
export const UC_THEME_BASE_CSS = `
[style*="--uc-design-surface"]:not([style*="border-radius"]) {
  border-radius: var(--uc-radius-inner, var(--uc-radius-sm));
}
[style*="--uc-design-surface"] {
  box-shadow: var(--uc-pane-shadow, none);
}
.card-container {
  background: var(--uc-surface-bg, var(--card-background-color, var(--ha-card-background, white)));
  box-shadow: var(--uc-shadow, var(--ha-card-box-shadow, none));
  backdrop-filter: var(--uc-surface-backdrop, none);
  -webkit-backdrop-filter: var(--uc-surface-backdrop, none);
  filter: var(--uc-color-filter, none);
${MODULE_RADIUS_VARS}
}
`.trim();

/** Border the surface draws when the theme sets neither width nor colour. */
const SURFACE_BORDER: Record<string, { width: number; color: string | undefined }> = {
  flat: { width: 1, color: 'var(--divider-color)' },
  glass: { width: 1, color: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12)' },
  outline: { width: 1, color: 'var(--divider-color)' },
  neumorphic: { width: 0, color: undefined },
  glossy: { width: 0, color: undefined },
  minimal: { width: 0, color: undefined },
};

/**
 * The card chrome a theme's tokens imply. `theme.card` is layered on top, so
 * a theme only has to spell out chrome that differs from its tokens: radius
 * follows `tokens.radius`, border follows `border_width` / `border_color`
 * (falling back to the surface's own border), and see-through surfaces get a
 * transparent shell. Background and shadow are not returned here: they are
 * `--uc-surface-bg` / `--uc-shadow` in the base stylesheet so gradients,
 * multi-layer shadows and `var()` values work.
 */
export function chromeFromTokens(t: UcThemeTokens): UcThemeCardChrome {
  const surface = SURFACE_BORDER[t.surface] ?? SURFACE_BORDER.flat;
  const chrome: UcThemeCardChrome = {
    card_border_radius: t.radius,
    card_border_width: t.border_width ?? surface.width,
  };
  const color = t.border_color ?? surface.color;
  if (color) chrome.card_border_color = color;
  if (t.surface === 'outline' || t.surface === 'minimal') chrome.card_background = 'transparent';
  return chrome;
}

/** `theme.card` layered over what its tokens imply; `{}` for no theme. */
export function resolveThemeCardChrome(theme: UcThemeDefinition | null | undefined): UcThemeCardChrome {
  if (!theme) return {};
  return { ...chromeFromTokens(theme.tokens), ...theme.card };
}

/**
 * Surface recipe per role: `tokens.recipes` over what `tokens.surface`
 * implies. No theme means flat everywhere, which is every module's own
 * default, so HA Native stays a no-op.
 */
export function resolveThemeRecipes(
  theme: UcThemeDefinition | null | undefined
): Record<UcSurfaceRole, UcSurfaceRecipe> {
  const derived = recipesFromSurface(theme?.tokens?.surface);
  if (!theme?.tokens?.recipes) return derived;
  return { ...derived, ...theme.tokens.recipes };
}

const STORAGE_LIBRARY = 'ultra-card-theme-library';
const STORAGE_GLOBAL = 'ultra-card-global-theme';
const STORAGE_PAINT_PAGE = 'ultra-card-theme-paint-page';
const HOST_VARS_APPLIED = new WeakMap<HTMLElement, { key: string; props: string[] }>();

export interface UcCardSeed {
  /** 0..359 */
  hue: number;
  /** Three values in [0, 1), two decimals. */
  seeds: [number, number, number];
}

const CARD_SLOT = new WeakMap<HTMLElement, number>();
let cardSlotCounter = 0;
const PAGE_SALT = Math.floor(Math.random() * 0xffffffff) >>> 0;
const GOLDEN_ANGLE = 137.50776;

/** Pure: the hue and seeds dealt to the n-th card on a page for a given salt. */
export function seedForSlot(slot: number, salt: number): UcCardSeed {
  const hue = Math.round((salt % 360) + slot * GOLDEN_ANGLE) % 360;
  // xorshift32 from a slot/salt mix; three draws
  let x = (Math.imul(slot + 1, 0x9e3779b1) ^ salt) >>> 0 || 1;
  const next = () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return Math.round((x / 0x100000000) * 100) / 100;
  };
  return { hue, seeds: [next(), next(), next()] };
}

const DENSITY_SCALE: Record<string, string> = {
  compact: '0.875',
  regular: '1',
  comfortable: '1.125',
};

/** Default card radius the modules' internal radii were designed against. */
const BASE_CARD_RADIUS = 12;
export const UC_RADIUS_SCALE_MAX = 1.75;

export function radiusScale(cardRadius: number): string {
  const s = Math.min(UC_RADIUS_SCALE_MAX, Math.max(0, cardRadius / BASE_CARD_RADIUS));
  return String(Math.round(s * 100) / 100);
}

/**
 * Inner-pane tokens. Modules paint their rows, tiles, chips and tracks with
 * `var(--uc-pane-bg, <own>)` etc., so under a theme every nested layer takes
 * the theme's material; outside a theme the variables are unset and modules
 * look as they always did. Explicit `pane_*` tokens win; otherwise the look
 * follows the theme's surface.
 */
export function paneVars(t: UcThemeTokens): Record<string, string> {
  const bySurface: Record<string, [string, string, string]> = {
    flat: ['var(--secondary-background-color)', '1px solid var(--divider-color)', 'none'],
    glass: [
      'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05)',
      '1px solid rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1)',
      'none',
    ],
    neumorphic: [
      'var(--card-background-color)',
      'none',
      'inset 4px 4px 9px rgba(0, 0, 0, 0.22), inset -4px -4px 9px rgba(255, 255, 255, 0.07)',
    ],
    glossy: [
      'linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.02)), var(--card-background-color)',
      'none',
      'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15)',
    ],
    outline: ['transparent', '1px solid var(--divider-color)', 'none'],
    minimal: ['transparent', 'none', 'none'],
  };
  const [bg, border, shadow] = bySurface[t.surface] ?? bySurface.flat;
  return {
    '--uc-pane-bg': t.pane_background ?? bg,
    '--uc-pane-border': t.pane_border ?? border,
    '--uc-pane-shadow': t.pane_shadow ?? shadow,
  };
}

/**
 * Largest radius a first-level nested surface may have so its corner reads
 * concentric with the card's. Ideally `radius - padding`; that collapses to
 * zero on most themes (padding is usually larger than the radius), so it is
 * held between half the card radius and four px inside it. Square stays square.
 */
export function radiusInner(cardRadius: number, cardPadding: number | undefined): number {
  if (cardRadius <= 0) return 0;
  const concentric = cardRadius - (cardPadding ?? 16);
  const lo = cardRadius * 0.5;
  const hi = Math.max(lo, cardRadius - 4);
  return Math.round(Math.min(hi, Math.max(lo, concentric)) * 10) / 10;
}

const PALETTE_TO_VARS: Record<string, string[]> = {
  primary: ['--primary-color'],
  accent: ['--accent-color'],
  card_bg: ['--card-background-color', '--ha-card-background'],
  text: ['--primary-text-color'],
  text_secondary: ['--secondary-text-color'],
  divider: ['--divider-color'],
  on_primary: ['--text-primary-color'],
};

function hexToRgb(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * Fill in the HA variables modules paint *with* a pinned colour, so a palette
 * never leaves a mismatched pair (navy text on a still-dark
 * `--secondary-background-color`, white on a bright phosphor primary, ...).
 * Only literal colours are derived; anything the palette already set wins.
 */
function deriveCompanionVars(
  palette: Partial<Record<UcThemePaletteKey, string>>,
  vars: Record<string, string>
): void {
  const set = (name: string, value: string) => {
    if (vars[name] === undefined) vars[name] = value;
  };
  const setColor = (name: string, c: Rgba) => {
    set(name, toCss(c));
    if (name.endsWith('-color')) set(`--rgb${name.slice(1)}`, toRgbTriple(c));
  };

  const bg = parseColor(palette.card_bg);
  const text = parseColor(palette.text);
  const primary = parseColor(palette.primary);
  const secondaryText = parseColor(palette.text_secondary);

  if (bg && bg.a >= 0.5) {
    // Nested surfaces step away from the card, page sits just behind it.
    const nested = step(bg, 0.06);
    setColor('--secondary-background-color', nested);
    setColor('--primary-background-color', step(bg, 0.03));
    set('--mdc-theme-surface', toCss(bg));
    set('--input-fill-color', toCss(nested));
    set('--mdc-select-fill-color', toCss(nested));
    set('--mdc-text-field-fill-color', toCss(nested));
    if (!text) {
      // A pinned background with unpinned text is the other half of the same
      // hazard: HA's text may be the wrong pole for it.
      const ink = contrastText(bg);
      setColor('--primary-text-color', ink);
      setColor('--secondary-text-color', withAlpha(ink, 0.7));
    }
  }

  if (text) {
    set('--mdc-theme-on-surface', toCss(text));
    set('--input-ink-color', toCss(text));
    set('--mdc-select-ink-color', toCss(text));
    set('--mdc-text-field-ink-color', toCss(text));
    setColor('--disabled-text-color', withAlpha(text, 0.38));
    const muted = secondaryText ?? withAlpha(text, 0.7);
    set('--input-label-ink-color', toCss(muted));
    set('--input-dropdown-icon-color', toCss(muted));
    if (!secondaryText) setColor('--secondary-text-color', muted);
    if (!palette.divider) setColor('--divider-color', withAlpha(text, 0.12));
  }

  if (primary) {
    const onPrimary = contrastText(primary);
    setColor('--text-primary-color', onPrimary);
    set('--mdc-theme-primary', toCss(primary));
    set('--mdc-theme-on-primary', toCss(onPrimary));
  }
}

class UcThemeService {
  private _library = new Map<string, UcThemeDefinition>();
  private _globalDefaultId: string | null = null;
  private _paintPage = true;
  private _listeners = new Set<() => void>();
  private _hass: any = null;
  private _connectLoaded = false;
  private _connectMissing = false;
  private _loadPromise: Promise<void> | null = null;

  constructor() {
    this._loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', e => {
        if (e.key === STORAGE_LIBRARY || e.key === STORAGE_GLOBAL || e.key === STORAGE_PAINT_PAGE) {
          this._loadFromStorage();
          this._notify();
        }
      });
    }
  }

  // ----------------------------------------------------- page background

  /** Whether themes may paint the Lovelace view behind their cards (default on). */
  getPaintPage(): boolean {
    return this._paintPage;
  }

  setPaintPage(on: boolean): void {
    if (on === this._paintPage) return;
    this._paintPage = on;
    if (on) safeRemoveItem(STORAGE_PAINT_PAGE);
    else safeSetItem(STORAGE_PAINT_PAGE, '0');
    this._notify();
  }

  /** The page background a resolved theme asks for, honouring the global switch. */
  pageBackgroundFor(theme: UcThemeDefinition | null): string | undefined {
    if (!this._paintPage) return undefined;
    return theme?.tokens.page_background || undefined;
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

  /**
   * Card chrome the theme wants, for keys the card config leaves undefined:
   * what the tokens imply, with the theme's explicit `card` on top.
   */
  getCardChrome(config: UltraCardConfig | undefined | null): UcThemeCardChrome {
    return resolveThemeCardChrome(this.resolveTheme(config));
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
    if (!theme) return undefined;
    const allowed = UC_THEME_MODULE_STYLE_KEYS[moduleType];
    if (!allowed || !allowed.includes(key)) return undefined;
    const explicit = theme.modules?.[moduleType]?.[key];
    if (explicit !== undefined) return explicit;
    // Surface fields fall back to the theme's recipe for their role, so a
    // theme that says "controls are glass" once reaches every button.
    const role = surfaceRoleFor(moduleType, key);
    if (!role) return undefined;
    return recipeForRole(resolveThemeRecipes(theme)[role], role);
  }

  /** Recipe per role the theme paints with: explicit `tokens.recipes` over what `surface` implies. */
  getRecipes(config: UltraCardConfig | undefined | null): Record<UcSurfaceRole, UcSurfaceRecipe> {
    return resolveThemeRecipes(this.resolveTheme(config));
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

  /**
   * Per-card randomness for themes that vary card to card (Gummy). Hues are
   * dispensed in page order along the golden angle from a per-load offset, so
   * consecutive cards are always distinct flavours and a page never shows the
   * same colour twice in a row; the offset means a reload deals a new hand.
   * Three seeds in [0, 1) let CSS vary highlight position, size and angle.
   */
  cardSeed(el: HTMLElement): UcCardSeed {
    let slot = CARD_SLOT.get(el);
    if (slot === undefined) {
      slot = cardSlotCounter++;
      CARD_SLOT.set(el, slot);
    }
    return seedForSlot(slot, PAGE_SALT);
  }

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
      // Module-internal radii (rows, tiles, chips, tracks) are authored against
      // the 12px default card and scale with the theme's card radius, so a
      // square theme squares everything and a round one rounds everything.
      '--uc-radius-scale': radiusScale(t.radius),
      '--uc-radius-inner': `${radiusInner(t.radius, theme.card?.card_padding)}px`,
      ...paneVars(t),
    };
    for (const [role, recipe] of Object.entries(resolveThemeRecipes(theme))) {
      vars[`--uc-recipe-${role}`] = recipe;
    }
    if (t.border_color) vars['--uc-border-color'] = t.border_color;
    if (t.accent) vars['--uc-accent'] = t.accent;
    if (t.font_family) vars['--uc-font-family'] = t.font_family;
    if (t.color_filter) {
      vars['--uc-color-filter'] = t.color_filter;
    } else if (t.grayscale && t.grayscale > 0) {
      vars['--uc-color-filter'] = `grayscale(${Math.min(1, t.grayscale)})`;
    }
    if (t.palette) {
      for (const [key, value] of Object.entries(t.palette)) {
        if (!value) continue;
        for (const v of PALETTE_TO_VARS[key] ?? []) {
          vars[v] = value;
          const rgb = hexToRgb(value);
          if (rgb && v.endsWith('-color')) vars[`--rgb${v.slice(1)}`] = rgb;
        }
      }
      deriveCompanionVars(t.palette, vars);
    }
    return vars;
  }

  /**
   * Apply (or clear) a theme's host variables and `data-uc-theme` attribute.
   * Returns true when something changed.
   */
  applyThemeToHost(el: HTMLElement, theme: UcThemeDefinition | null, seed?: UcCardSeed): boolean {
    const prev = HOST_VARS_APPLIED.get(el);
    const key = theme ? `${theme.id}@${theme.version}#${seed ? `${seed.hue}/${seed.seeds.join(',')}` : ''}` : '';
    if (prev?.key === key) return false;
    if (prev) for (const p of prev.props) el.style.removeProperty(p);
    if (!theme) {
      HOST_VARS_APPLIED.delete(el);
      el.removeAttribute('data-uc-theme');
      return !!prev;
    }
    const vars = this.getHostVars(theme);
    if (seed) {
      vars['--uc-card-hue'] = String(seed.hue);
      seed.seeds.forEach((v, i) => (vars[`--uc-card-seed-${i + 1}`] = String(v)));
    }
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
    this._paintPage = safeGetItem(STORAGE_PAINT_PAGE) !== '0';
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
