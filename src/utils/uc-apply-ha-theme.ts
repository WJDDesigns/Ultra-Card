/**
 * Apply a Home Assistant theme to a single element, the way HA core cards honour
 * their `theme:` option.
 *
 * `custom-card-helpers` ships an `applyThemesOnElement` that still goes through
 * Polymer's `updateStyles` / ShadyCSS, neither of which exist in today's Lit
 * based frontend, so it silently does nothing. This mirrors what
 * `home-assistant-frontend/src/common/dom/apply_themes_on_element.ts` does now:
 * set each theme key as a `--var` on the element, honour `modes.light/dark`,
 * derive `--rgb-*` for hex colours, and remove everything again when the theme
 * is cleared or switched.
 */

export interface HaThemeVars {
  [key: string]: string | HaThemeModes | undefined;
  modes?: HaThemeModes | undefined;
}

export interface HaThemeModes {
  light?: Record<string, string> | undefined;
  dark?: Record<string, string> | undefined;
}

export interface HaThemes {
  default_theme?: string;
  default_dark_theme?: string | null;
  themes: Record<string, HaThemeVars>;
  darkMode?: boolean;
  theme?: string;
}

interface AppliedRecord {
  cacheKey: string;
  keys: string[];
}

const APPLIED = new WeakMap<HTMLElement, AppliedRecord>();

/** Theme names that mean "do not override anything on this element". */
export function isPassthroughHaTheme(name: string | undefined | null): boolean {
  return !name || name === 'default' || name === 'auto';
}

function hexToRgb(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * Flatten a theme definition into the variables that apply for the current
 * light/dark mode. Mode-specific values win over the shared ones.
 */
export function resolveHaThemeVars(
  theme: HaThemeVars | undefined,
  darkMode: boolean
): Record<string, string> {
  if (!theme) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) {
    if (key === 'modes' || typeof value !== 'string') continue;
    out[key] = value;
  }
  const modeVars = darkMode ? theme.modes?.dark : theme.modes?.light;
  if (modeVars) {
    for (const [key, value] of Object.entries(modeVars)) {
      if (typeof value === 'string') out[key] = value;
    }
  }
  return out;
}

/**
 * Apply `themeName` from `themes` to `element`. Passing a passthrough name
 * (undefined / 'default') removes any variables this helper set earlier so the
 * element falls back to the dashboard theme.
 *
 * Returns true when the element's inline variables changed.
 */
export function applyHaThemeToElement(
  element: HTMLElement,
  themes: HaThemes | undefined | null,
  themeName: string | undefined | null
): boolean {
  const previous = APPLIED.get(element);
  const passthrough = isPassthroughHaTheme(themeName) || !themes?.themes?.[themeName as string];
  const darkMode = !!themes?.darkMode;
  const cacheKey = passthrough ? '' : `${themeName}|${darkMode ? 'dark' : 'light'}`;

  if (previous?.cacheKey === cacheKey && (passthrough || previous.keys.length > 0)) {
    return false;
  }

  if (previous) {
    for (const key of previous.keys) element.style.removeProperty(key);
    APPLIED.delete(element);
  }

  if (passthrough) return !!previous;

  const vars = resolveHaThemeVars(themes!.themes[themeName as string], darkMode);
  const keys: string[] = [];
  for (const [key, value] of Object.entries(vars)) {
    const prop = `--${key}`;
    element.style.setProperty(prop, value);
    keys.push(prop);
    // HA derives `--rgb-<name>` for its colour tokens so `rgba(var(--rgb-primary-color), .1)`
    // style usages keep working under a per-card theme.
    if (key.endsWith('-color')) {
      const rgb = hexToRgb(value);
      if (rgb) {
        const rgbProp = `--rgb-${key}`;
        element.style.setProperty(rgbProp, rgb);
        keys.push(rgbProp);
      }
    }
  }
  APPLIED.set(element, { cacheKey, keys });
  return true;
}

/** Sorted list of theme names the user can pick from, excluding the implicit default. */
export function listHaThemeNames(themes: HaThemes | undefined | null): string[] {
  if (!themes?.themes) return [];
  return Object.keys(themes.themes).sort((a, b) => a.localeCompare(b));
}
