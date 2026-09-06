import type { UcThemeDefinition } from './uc-theme-types';
import { UC_THEME_HA_NATIVE } from './uc-theme-types';

/**
 * Built-in themes. These are the Ultra Dashboard styles (Classic / Soft /
 * Glass / Bold) made live, plus two "full" themes that also pin a palette.
 *
 * Colours reference HA variables wherever possible so a built-in theme layers
 * on any HACS theme instead of fighting it.
 */

const HA_CARD_BG = 'var(--card-background-color, var(--ha-card-background, white))';

/**
 * No-op theme. Reproduces exactly what Ultra Card rendered before the theme
 * engine existed: HA variables for chrome, every module on its own default.
 */
export const HA_NATIVE_THEME: UcThemeDefinition = {
  id: UC_THEME_HA_NATIVE,
  name: 'HA Native',
  version: 1,
  author: 'Ultra Card',
  description: 'Follows your Home Assistant theme exactly. Modules use their own defaults.',
  icon: 'mdi:home-assistant',
  source: 'builtin',
  tokens: { surface: 'flat', radius: 12, border_width: 1, border_color: 'var(--divider-color)' },
};

export const CLASSIC_THEME: UcThemeDefinition = {
  id: 'classic',
  name: 'Classic',
  version: 1,
  author: 'Ultra Card',
  description: 'The standard Home Assistant card look of your theme, with matching flat controls.',
  icon: 'mdi:view-dashboard-outline',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 12,
    radius_sm: 8,
    border_width: 1,
    border_color: 'var(--divider-color)',
    density: 'regular',
  },
  card: {
    card_background: HA_CARD_BG,
    card_border_radius: 12,
    card_border_color: 'var(--divider-color)',
    card_border_width: 1,
    card_padding: 16,
  },
  modules: {
    button: { style: 'flat' },
    bar: { bar_style: 'flat' },
    slider_control: { slider_style: 'flat' },
    spinbox: { button_style: 'flat' },
    popup: { trigger_button_style: 'flat' },
    grid: { grid_style: 'style_12' },
    navigation: { nav_style: 'uc_docked' },
    area_summary: { style_preset: 'compact_controls' },
    auto_entity_list: { row_style: 'compact' },
    unifi: { rack_style: 'dark' },
    activity_feed: { feed_card_style: 'outlined' },
  },
};

export const SOFT_THEME: UcThemeDefinition = {
  id: 'soft',
  name: 'Soft',
  version: 1,
  author: 'Ultra Card',
  description: 'Rounded corners, no borders, a light shadow. Calm and modern.',
  icon: 'mdi:rounded-corner',
  source: 'builtin',
  tokens: {
    surface: 'neumorphic',
    radius: 20,
    radius_sm: 12,
    border_width: 0,
    shadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    density: 'comfortable',
  },
  card: {
    card_background: HA_CARD_BG,
    card_border_radius: 20,
    card_border_width: 0,
    card_padding: 16,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(0, 0, 0, 0.08)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 4,
    card_shadow_blur: 16,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'neumorphic' },
    bar: { bar_style: 'glossy' },
    slider_control: { slider_style: 'neumorphic' },
    spinbox: { button_style: 'neumorphic', button_shape: 'circle' },
    popup: { trigger_button_style: 'neumorphic' },
    grid: { grid_style: 'style_19' },
    navigation: { nav_style: 'uc_neumorphic' },
    area_summary: { style_preset: 'iconic_soft' },
    auto_entity_list: { row_style: 'compact' },
    unifi: { rack_style: 'light' },
    activity_feed: { feed_card_style: 'elevated' },
  },
};

export const GLASS_THEME: UcThemeDefinition = {
  id: 'glass',
  name: 'Glass',
  version: 1,
  author: 'Ultra Card',
  description: 'Translucent panels with a fine border and backdrop blur. Made for wallpaper backgrounds.',
  icon: 'mdi:blur',
  source: 'builtin',
  tokens: {
    surface: 'glass',
    radius: 18,
    radius_sm: 12,
    blur: 12,
    border_width: 1,
    border_color: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12)',
    shadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
    density: 'regular',
  },
  card: {
    // `--rgb-primary-text-color` flips with the theme, so the tint reads on
    // light and dark backgrounds alike.
    card_background: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05)',
    card_border_radius: 18,
    card_border_color: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12)',
    card_border_width: 1,
    card_padding: 16,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(0, 0, 0, 0.18)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 8,
    card_shadow_blur: 24,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'glass' },
    bar: { bar_style: 'glass', glass_blur_amount: 8 },
    slider_control: { slider_style: 'glass', glass_blur_amount: 8 },
    spinbox: { button_style: 'glass' },
    popup: { trigger_button_style: 'glass' },
    grid: { grid_style: 'style_16' },
    navigation: { nav_style: 'uc_ios_glass' },
    area_summary: { style_preset: 'graph_glow' },
    auto_entity_list: { row_style: 'slim' },
    unifi: { rack_style: 'glass' },
    activity_feed: { feed_card_style: 'flat' },
  },
  css: `.card-container { backdrop-filter: blur(var(--uc-blur, 12px)) saturate(160%); -webkit-backdrop-filter: blur(var(--uc-blur, 12px)) saturate(160%); }`,
};

export const BOLD_THEME: UcThemeDefinition = {
  id: 'bold',
  name: 'Bold',
  version: 1,
  author: 'Ultra Card',
  description: 'Large radius, deep shadow and your theme accent on every control.',
  icon: 'mdi:palette',
  source: 'builtin',
  tokens: {
    surface: 'glossy',
    radius: 24,
    radius_sm: 14,
    border_width: 0,
    shadow: '0 10px 30px rgba(0, 0, 0, 0.16)',
    accent: 'var(--primary-color)',
    density: 'comfortable',
  },
  card: {
    card_background: HA_CARD_BG,
    card_border_radius: 24,
    card_border_width: 0,
    card_padding: 20,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(0, 0, 0, 0.16)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 10,
    card_shadow_blur: 30,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'glossy' },
    bar: { bar_style: 'gradient-overlay' },
    slider_control: { slider_style: 'glossy' },
    spinbox: { button_style: 'glossy' },
    popup: { trigger_button_style: 'glossy' },
    grid: { grid_style: 'style_17' },
    navigation: { nav_style: 'uc_gradient' },
    area_summary: { style_preset: 'graph_glow', accent_color: 'var(--primary-color)' },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'dark' },
    activity_feed: { feed_card_style: 'elevated' },
  },
};

export const MONOCHROME_THEME: UcThemeDefinition = {
  id: 'monochrome',
  name: 'Monochrome',
  version: 1,
  author: 'Ultra Card',
  description:
    'Black, white and grey only. Every module is desaturated, including ones with their own colours. Thin outlines, no shadows, text does the talking.',
  icon: 'mdi:contrast-box',
  source: 'builtin',
  tokens: {
    surface: 'outline',
    radius: 6,
    radius_sm: 4,
    border_width: 1,
    border_color: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.35)',
    shadow: 'none',
    accent: 'var(--primary-text-color)',
    density: 'compact',
    grayscale: 1,
    palette: {
      primary: 'var(--primary-text-color)',
      accent: 'var(--primary-text-color)',
      divider: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.35)',
    },
  },
  card: {
    card_background: HA_CARD_BG,
    card_border_radius: 6,
    card_border_color: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.35)',
    card_border_width: 1,
    card_padding: 14,
    card_shadow_enabled: false,
  },
  modules: {
    button: { style: 'outline' },
    bar: { bar_style: 'outline' },
    slider_control: { slider_style: 'outline' },
    spinbox: { button_style: 'outline', button_shape: 'square' },
    popup: { trigger_button_style: 'outline' },
    grid: { grid_style: 'style_8' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'compact_controls', accent_color: 'var(--primary-text-color)' },
    auto_entity_list: { row_style: 'slim' },
    unifi: { rack_style: 'blueprint' },
    activity_feed: { feed_card_style: 'outlined' },
    tabs: { style: 'simple' },
  },
};

export const MATERIAL_THEME: UcThemeDefinition = {
  id: 'material',
  name: 'Material',
  version: 1,
  author: 'Ultra Card',
  description: 'Tonal surfaces, pill controls and generous radii in the Material You spirit.',
  icon: 'mdi:material-design',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 28,
    radius_sm: 20,
    border_width: 0,
    shadow: 'none',
    density: 'comfortable',
    font_family: 'Roboto, "Google Sans", system-ui, sans-serif',
    palette: {
      card_bg: 'rgba(var(--rgb-primary-color, 3, 169, 244), 0.08)',
    },
  },
  card: {
    card_background: 'rgba(var(--rgb-primary-color, 3, 169, 244), 0.08)',
    card_border_radius: 28,
    card_border_width: 0,
    card_padding: 20,
    card_shadow_enabled: false,
  },
  modules: {
    button: { style: 'flat' },
    bar: { bar_style: 'flat' },
    slider_control: { slider_style: 'flat' },
    spinbox: { button_style: 'flat', button_shape: 'circle' },
    popup: { trigger_button_style: 'flat' },
    grid: { grid_style: 'style_14' },
    navigation: { nav_style: 'uc_material' },
    area_summary: { style_preset: 'iconic_soft', tile_border_radius: 20 },
    auto_entity_list: { row_style: 'detailed' },
    unifi: { rack_style: 'light' },
    activity_feed: { feed_card_style: 'flat' },
    tabs: { style: 'modern' },
  },
};

const PHOSPHOR = '#33ff66';
const PHOSPHOR_DIM = 'rgba(51, 255, 102, 0.6)';
const PHOSPHOR_LINE = 'rgba(51, 255, 102, 0.35)';

/**
 * Green phosphor CRT. Square corners, hairline borders, monospace type, a
 * soft glow, and a colour filter that tints everything on the card green,
 * so icons, images and modules with their own colours all read as one
 * terminal. Popups portal out of the card and stay in colour.
 */
export const GREEN_TERMINAL_THEME: UcThemeDefinition = {
  id: 'green_terminal',
  name: 'Green Terminal',
  version: 1,
  author: 'Ultra Card',
  description:
    'Green phosphor on black. Monospace type, square corners, hairline borders and a glow. Everything on the card is tinted green.',
  icon: 'mdi:console',
  source: 'builtin',
  tokens: {
    surface: 'outline',
    radius: 0,
    radius_sm: 0,
    border_width: 1,
    border_color: PHOSPHOR_LINE,
    shadow: `0 0 14px rgba(51, 255, 102, 0.18)`,
    accent: PHOSPHOR,
    density: 'compact',
    font_family: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, 'Courier New', monospace",
    palette: {
      primary: PHOSPHOR,
      accent: PHOSPHOR,
      card_bg: '#050a06',
      text: PHOSPHOR,
      text_secondary: PHOSPHOR_DIM,
      divider: PHOSPHOR_LINE,
    },
    // grey → sepia → rotate the warm tone onto green → boost. Black stays black.
    color_filter: 'grayscale(1) sepia(1) hue-rotate(80deg) saturate(2.5) brightness(1.05)',
  },
  card: {
    card_background: '#050a06',
    card_border_radius: 0,
    card_border_color: PHOSPHOR_LINE,
    card_border_width: 1,
    card_padding: 14,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(51, 255, 102, 0.18)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 0,
    card_shadow_blur: 14,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'outline' },
    bar: { bar_style: 'outline' },
    slider_control: { slider_style: 'outline' },
    spinbox: { button_style: 'outline', button_shape: 'square' },
    popup: { trigger_button_style: 'outline' },
    grid: { grid_style: 'style_8' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'compact_controls', accent_color: PHOSPHOR, tile_border_radius: 0 },
    auto_entity_list: { row_style: 'slim' },
    unifi: { rack_style: 'blueprint' },
    activity_feed: { feed_card_style: 'outlined' },
    tabs: { style: 'simple' },
  },
  css: `
.card-container {
  text-shadow: 0 0 6px rgba(51, 255, 102, 0.45);
  letter-spacing: 0.02em;
}
`.trim(),
};

/**
 * Apple's Liquid Glass (iOS 26): a thick, refractive pane rather than a
 * frosted sheet. Deep blur with lifted saturation, big concentric corners,
 * a bright specular rim along the top edge, a faint inner glow and a soft,
 * wide shadow. Tint is a translucent version of the HA card colour, so it
 * adapts to light and dark themes; the rim stays white in both.
 */
export const LIQUID_GLASS_THEME: UcThemeDefinition = {
  id: 'liquid_glass',
  name: 'Liquid Glass',
  version: 1,
  author: 'Ultra Card',
  description:
    'Apple-style refractive glass. Deep blur, big continuous corners, a specular highlight along the edge and a soft floating shadow. Best over a wallpaper.',
  icon: 'mdi:water-opacity',
  source: 'builtin',
  tokens: {
    surface: 'glass',
    radius: 28,
    radius_sm: 18,
    blur: 24,
    border_width: 1,
    border_color: 'rgba(255, 255, 255, 0.28)',
    shadow: '0 12px 40px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.55), inset 0 -1px 0 rgba(255, 255, 255, 0.08)',
    density: 'comfortable',
    font_family:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif",
  },
  card: {
    card_background: 'rgba(var(--rgb-card-background-color, 255, 255, 255), 0.42)',
    card_border_radius: 28,
    card_border_color: 'rgba(255, 255, 255, 0.28)',
    card_border_width: 1,
    card_padding: 18,
    // Shadow is left to the css below (drop + specular rim in one box-shadow);
    // the swatch previews it through the `shadow` token.
  },
  modules: {
    button: { style: 'glass' },
    bar: { bar_style: 'glass', glass_blur_amount: 14 },
    slider_control: { slider_style: 'glass', glass_blur_amount: 14 },
    spinbox: { button_style: 'glass', button_shape: 'circle' },
    popup: { trigger_button_style: 'glass' },
    grid: { grid_style: 'style_16' },
    navigation: { nav_style: 'uc_ios_glass' },
    area_summary: { style_preset: 'graph_glow', tile_border_radius: 18 },
    auto_entity_list: { row_style: 'slim' },
    unifi: { rack_style: 'glass' },
    activity_feed: { feed_card_style: 'flat' },
    tabs: { style: 'switch_2' },
  },
  css: `
.card-container {
  backdrop-filter: blur(var(--uc-blur, 24px)) saturate(180%) brightness(1.04);
  -webkit-backdrop-filter: blur(var(--uc-blur, 24px)) saturate(180%) brightness(1.04);
  /* Specular rim on the top edge, faint inner glow, soft floating shadow. */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 1px 0 0 rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 24px rgba(255, 255, 255, 0.05),
    0 12px 40px rgba(0, 0, 0, 0.22),
    0 2px 6px rgba(0, 0, 0, 0.08) !important;
  /* Gloss: a diagonal sheen over the tint, the way light sits on curved glass. */
  background-image: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0.06) 38%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0.08) 100%
  ) !important;
}
`.trim(),
};

const HILLARY_INK = '#1f2d3d'; // navy ink
const HILLARY_BRASS = '#b08d57'; // brass / cognac accent
const HILLARY_LINEN = '#f7f2e8'; // linen card
const HILLARY_TAUPE = '#7d7166'; // warm secondary text
const HILLARY_SAND = 'rgba(31, 45, 61, 0.12)'; // hairline

/**
 * "Hillary": a Nancy Meyers kitchen in Ralph Lauren tailoring. Linen and
 * cream surfaces, navy ink for text, brass for the accent, a warm shadow
 * and an editorial serif. Cards carry a fine brass piping along the top
 * edge. The palette is pinned, so it reads the same over light and dark HA
 * themes: this one is the room, not a filter on it.
 */
export const HILLARY_THEME: UcThemeDefinition = {
  id: 'hillary',
  name: 'Hillary',
  version: 1,
  author: 'Ultra Card',
  description:
    'Linen, cream and navy ink with brass accents. A Nancy Meyers palette in Ralph Lauren tailoring: warm, elevated, unhurried.',
  icon: 'mdi:flower-tulip-outline',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 14,
    radius_sm: 10,
    border_width: 1,
    border_color: HILLARY_SAND,
    shadow: '0 8px 24px rgba(66, 50, 30, 0.12), 0 1px 2px rgba(66, 50, 30, 0.06)',
    density: 'comfortable',
    accent: HILLARY_BRASS,
    font_family:
      "'Playfair Display', 'Didot', 'Bodoni 72', 'Cormorant Garamond', 'Libre Baskerville', Georgia, 'Times New Roman', serif",
    palette: {
      primary: HILLARY_INK,
      accent: HILLARY_BRASS,
      card_bg: HILLARY_LINEN,
      text: HILLARY_INK,
      text_secondary: HILLARY_TAUPE,
      divider: HILLARY_SAND,
    },
  },
  card: {
    card_background: HILLARY_LINEN,
    card_border_radius: 14,
    card_border_color: HILLARY_SAND,
    card_border_width: 1,
    card_padding: 20,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(66, 50, 30, 0.12)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 8,
    card_shadow_blur: 24,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'outline' },
    bar: { bar_style: 'flat' },
    slider_control: { slider_style: 'flat' },
    spinbox: { button_style: 'outline', button_shape: 'rounded' },
    popup: { trigger_button_style: 'outline' },
    grid: { grid_style: 'style_20' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'iconic_soft', accent_color: HILLARY_BRASS, tile_border_radius: 12 },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'light' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'simple_2' },
  },
  css: `
.card-container {
  /* Brass piping along the top edge, then the warm shadow. */
  box-shadow:
    inset 0 2px 0 ${HILLARY_BRASS},
    0 8px 24px rgba(66, 50, 30, 0.12),
    0 1px 2px rgba(66, 50, 30, 0.06) !important;
  letter-spacing: 0.01em;
}
`.trim(),
};

export const BUILTIN_THEMES: readonly UcThemeDefinition[] = [
  HA_NATIVE_THEME,
  CLASSIC_THEME,
  SOFT_THEME,
  GLASS_THEME,
  BOLD_THEME,
  MONOCHROME_THEME,
  MATERIAL_THEME,
  LIQUID_GLASS_THEME,
  HILLARY_THEME,
  GREEN_TERMINAL_THEME,
];
