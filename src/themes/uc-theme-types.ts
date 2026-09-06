import type { UltraCardConfig } from '../types';

/**
 * Ultra Card theme format.
 *
 * A theme owns the layer Home Assistant themes cannot express: the surface
 * treatment (glass, neumorphic, flat...), density, and the per-module style
 * presets that Ultra Card modules expose. Colours default to HA theme
 * variables so a theme layers on top of whatever HACS theme is active; a
 * theme may optionally pin its own palette.
 *
 * Resolution order (most specific wins):
 *   explicit module value → card `uc_theme` → global default → HA Native
 */

export type UcThemeSurface = 'flat' | 'glass' | 'neumorphic' | 'glossy' | 'outline' | 'minimal';

export type UcThemeDensity = 'compact' | 'regular' | 'comfortable';

export type UcThemeSource = 'builtin' | 'official' | 'community' | 'local';

export type UcThemePaletteKey = 'primary' | 'accent' | 'card_bg' | 'text' | 'text_secondary' | 'divider';

export interface UcThemeTokens {
  surface: UcThemeSurface;
  /** Card / large control radius in px. */
  radius: number;
  /** Small control radius (buttons, chips) in px. Defaults to `radius / 2`. */
  radius_sm?: number | undefined;
  /** Backdrop blur in px for glass surfaces. */
  blur?: number | undefined;
  border_width?: number | undefined;
  /** Any CSS colour; may reference HA variables. */
  border_color?: string | undefined;
  /** Full `box-shadow` value. */
  shadow?: string | undefined;
  density?: UcThemeDensity | undefined;
  /** Accent handed to modules that take one (`accent_color`). */
  accent?: string | undefined;
  font_family?: string | undefined;
  /** Optional palette overrides mapped onto HA variables on the card host. */
  palette?: Partial<Record<UcThemePaletteKey, string>> | undefined;
  /**
   * 0..1 desaturation applied to the whole card (1 = true monochrome). This
   * is the only token that reaches into module colours a user set explicitly
   * (bar colours, gauge gradients, icon colours), which is exactly what a
   * monochrome theme is for. Images and camera feeds are desaturated too.
   */
  grayscale?: number | undefined;
}

/** Card chrome keys a theme may set. Same shape as `UltraCardConfig.card_*`. */
export type UcThemeCardChromeKey =
  | 'card_transparent'
  | 'card_background'
  | 'card_border_radius'
  | 'card_border_color'
  | 'card_border_width'
  | 'card_padding'
  | 'card_shadow_enabled'
  | 'card_shadow_color'
  | 'card_shadow_horizontal'
  | 'card_shadow_vertical'
  | 'card_shadow_blur'
  | 'card_shadow_spread';

export type UcThemeCardChrome = Partial<Pick<UltraCardConfig, UcThemeCardChromeKey>>;

export const UC_THEME_CARD_CHROME_KEYS: readonly UcThemeCardChromeKey[] = [
  'card_transparent',
  'card_background',
  'card_border_radius',
  'card_border_color',
  'card_border_width',
  'card_padding',
  'card_shadow_enabled',
  'card_shadow_color',
  'card_shadow_horizontal',
  'card_shadow_vertical',
  'card_shadow_blur',
  'card_shadow_spread',
];

/**
 * Per-module defaults keyed by module `type`, e.g.
 * `{ button: { style: 'glass' }, bar: { bar_style: 'glass' } }`.
 * Only style-preset keys are honoured (see `UC_THEME_MODULE_STYLE_KEYS`).
 */
export type UcThemeModuleDefaults = Partial<Record<string, Record<string, unknown>>>;

export interface UcThemeDefinition {
  /** Stable id: `[a-z0-9_-]+`. Built-ins are unprefixed; downloads use `wp-<id>`, local `local-<id>`. */
  id: string;
  name: string;
  version: number;
  author?: string | undefined;
  description?: string | undefined;
  /** Preview image URL or data URI. */
  preview?: string | undefined;
  /** MDI icon shown in pickers when there is no preview image. */
  icon?: string | undefined;
  source?: UcThemeSource | undefined;
  tokens: UcThemeTokens;
  card?: UcThemeCardChrome | undefined;
  modules?: UcThemeModuleDefaults | undefined;
  /**
   * Extra CSS injected into the card shadow root. Scoped by authors to
   * `.card-container` and module classes. Trust-scanned before use.
   */
  css?: string | undefined;
}

/**
 * Module style keys a theme may default. Anything else in `modules` is ignored
 * so a downloaded theme cannot rewrite entities, actions or templates.
 */
export const UC_THEME_MODULE_STYLE_KEYS: Readonly<Record<string, readonly string[]>> = {
  button: ['style'],
  bar: ['bar_style', 'glass_blur_amount'],
  slider_control: ['slider_style', 'glass_blur_amount'],
  spinbox: ['button_style', 'button_shape'],
  popup: ['trigger_button_style'],
  grid: ['grid_style'],
  navigation: ['nav_style'],
  area_summary: ['style_preset', 'accent_color', 'tile_border_radius'],
  auto_entity_list: ['row_style'],
  unifi: ['rack_style'],
  tabs: ['style'],
  activity_feed: ['feed_card_style'],
  button_input: ['button_style'],
  light: ['button_style'],
};

/** Sentinel a module style field can hold to defer to the active theme. */
export const UC_THEME_INHERIT = 'theme';

/** `uc_theme` value that opts a card out of every theme, including the global default. */
export const UC_THEME_NONE = 'none';

/** Id of the built-in no-op theme that reproduces pre-theme-engine rendering. */
export const UC_THEME_HA_NATIVE = 'ha_native';

export function isUcThemeInherit(value: unknown): boolean {
  return value === undefined || value === null || value === '' || value === UC_THEME_INHERIT;
}
