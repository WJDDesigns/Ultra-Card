import type { UcThemeDefinition, UcThemePaletteKey, UcThemeTokens } from './uc-theme-types';

/**
 * Turn an installed Home Assistant theme (`hass.themes.themes[name]`) into a
 * local Ultra Card theme the user can extend with a surface and module
 * presets. Only the variables that map onto Ultra theme tokens are read;
 * everything else in the HA theme keeps applying through HA itself.
 */

export interface HaThemeRecord {
  [variable: string]: unknown;
  modes?: { light?: Record<string, string>; dark?: Record<string, string> } | undefined;
}

export interface HaThemesState {
  default_theme?: string;
  default_dark_theme?: string | null;
  themes?: Record<string, HaThemeRecord>;
  darkMode?: boolean;
  theme?: string;
}

export interface HaThemeListEntry {
  name: string;
  hasModes: boolean;
}

export type HaThemeMode = 'auto' | 'light' | 'dark';

export interface HaThemeImportOptions {
  mode?: HaThemeMode | undefined;
  /** Id for the resulting theme; defaults to `local-ha-<slug>`. */
  id?: string | undefined;
  name?: string | undefined;
}

const PALETTE_SOURCES: Record<UcThemePaletteKey, string[]> = {
  primary: ['primary-color'],
  accent: ['accent-color'],
  card_bg: ['ha-card-background', 'card-background-color'],
  text: ['primary-text-color'],
  text_secondary: ['secondary-text-color'],
  divider: ['divider-color'],
  on_primary: ['text-primary-color'],
};

const FONT_SOURCES = ['primary-font-family', 'paper-font-common-base_-_font-family', 'ha-font-family-body'];

export function listHaThemes(hass: { themes?: HaThemesState } | null | undefined): HaThemeListEntry[] {
  const themes = hass?.themes?.themes ?? {};
  return Object.keys(themes)
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({ name, hasModes: !!themes[name]?.modes }));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

/** Flatten `modes` onto the base record for the chosen mode. */
export function flattenHaTheme(record: HaThemeRecord, mode: HaThemeMode, darkMode: boolean): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(record)) {
    if (k === 'modes') continue;
    if (typeof v === 'string' || typeof v === 'number') out[k] = String(v);
  }
  const modes = record.modes;
  if (modes) {
    const pick = mode === 'auto' ? (darkMode ? 'dark' : 'light') : mode;
    const overlay = modes[pick] ?? modes.light ?? modes.dark;
    if (overlay) for (const [k, v] of Object.entries(overlay)) out[k] = String(v);
  }
  return out;
}

/**
 * Resolve `var(--x)` references against the theme itself so the exported
 * theme carries concrete values where the HA theme defined them. References to
 * variables the theme does not define are left as-is and keep resolving at
 * render time against whatever HA theme is active.
 */
export function resolveHaVar(value: string, vars: Record<string, string>, depth = 0): string {
  if (depth > 6 || !value.includes('var(')) return value;
  const next = value.replace(/var\(\s*--([a-zA-Z0-9_-]+)\s*(?:,\s*([^)]*))?\)/g, (whole, name: string, fallback?: string) => {
    if (name in vars) return vars[name];
    if (fallback !== undefined) return fallback.trim();
    return whole;
  });
  return next === value ? value : resolveHaVar(next, vars, depth + 1);
}

function px(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*px\s*$/i.exec(value);
  if (m) return Math.round(parseFloat(m[1]));
  const n = /^\s*(-?\d+(?:\.\d+)?)\s*$/.exec(value);
  return n ? Math.round(parseFloat(n[1])) : undefined;
}

function blurPx(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const m = /blur\(\s*(\d+(?:\.\d+)?)\s*px\s*\)/i.exec(value);
  return m ? Math.round(parseFloat(m[1])) : undefined;
}

function first(vars: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = vars[k];
    if (v !== undefined && v !== '') return resolveHaVar(v, vars);
  }
  return undefined;
}

export interface HaThemeImportResult {
  theme: UcThemeDefinition;
  /** Which token each value came from, for the UI summary. */
  mapped: string[];
}

export function haThemeToUcTheme(
  name: string,
  record: HaThemeRecord,
  opts: HaThemeImportOptions & { darkMode?: boolean | undefined } = {}
): HaThemeImportResult {
  const vars = flattenHaTheme(record, opts.mode ?? 'auto', !!opts.darkMode);
  const mapped: string[] = [];

  const palette: Partial<Record<UcThemePaletteKey, string>> = {};
  for (const [key, sources] of Object.entries(PALETTE_SOURCES) as [UcThemePaletteKey, string[]][]) {
    const v = first(vars, sources);
    if (v) {
      palette[key] = v;
      mapped.push(`palette.${key}`);
    }
  }

  const radius = px(first(vars, ['ha-card-border-radius']));
  const borderWidth = px(first(vars, ['ha-card-border-width']));
  const borderColor = first(vars, ['ha-card-border-color']);
  const shadow = first(vars, ['ha-card-box-shadow']);
  const blur = blurPx(first(vars, ['ha-card-backdrop-filter']));
  const font = first(vars, FONT_SOURCES);

  const tokens: UcThemeTokens = {
    surface: blur !== undefined ? 'glass' : 'flat',
    radius: radius ?? 12,
  };
  if (radius !== undefined) mapped.push('radius');
  if (blur !== undefined) {
    tokens.blur = blur;
    mapped.push('blur');
  }
  if (borderWidth !== undefined) {
    tokens.border_width = borderWidth;
    mapped.push('border_width');
  }
  if (borderColor) {
    tokens.border_color = borderColor;
    mapped.push('border_color');
  }
  if (shadow && shadow !== 'none') {
    tokens.shadow = shadow;
    mapped.push('shadow');
  }
  if (font) {
    tokens.font_family = font;
    mapped.push('font_family');
  }
  if (Object.keys(palette).length) tokens.palette = palette;

  const theme: UcThemeDefinition = {
    id: opts.id ?? `local-ha-${slugify(name) || 'theme'}`,
    name: opts.name ?? name,
    version: 1,
    source: 'local',
    description: `Imported from the Home Assistant theme "${name}"${
      record.modes ? ` (${opts.mode === 'auto' || !opts.mode ? (opts.darkMode ? 'dark' : 'light') : opts.mode} mode)` : ''
    }.`,
    icon: 'mdi:home-assistant',
    tokens,
  };
  const card: NonNullable<UcThemeDefinition['card']> = {};
  if (radius !== undefined) card.card_border_radius = radius;
  if (borderWidth !== undefined) card.card_border_width = borderWidth;
  if (borderColor) card.card_border_color = borderColor;
  if (palette.card_bg) card.card_background = palette.card_bg;
  if (shadow === 'none') card.card_shadow_enabled = false;
  if (Object.keys(card).length) theme.card = card;

  return { theme, mapped };
}
