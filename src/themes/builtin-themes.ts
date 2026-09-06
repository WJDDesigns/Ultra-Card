import type { UcThemeDefinition } from './uc-theme-types';
import { UC_THEME_HA_NATIVE } from './uc-theme-types';
import { svgDataUrl } from './uc-theme-artwork';

/**
 * Built-in themes. The first group (Glass / Bold / Monochrome / Material)
 * layers on the active HA theme by referencing its variables; the rest pin a
 * full palette and are "the room" regardless of HA light or dark mode.
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
      // Primary is the ink colour, so anything drawn on primary must be paper.
      on_primary: 'var(--card-background-color, var(--ha-card-background, white))',
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

// Material Design 3 elevation level 1 (elevated card): key + ambient shadow.
const MD3_ELEVATION_1 = '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)';
// Surface tint at level 1 is the primary colour at 5% over the surface.
const MD3_SURFACE_TINT = 'rgba(var(--rgb-primary-color, 103, 80, 164), 0.05)';
const MD3_SURFACE_TINT_HIGH = 'rgba(var(--rgb-primary-color, 103, 80, 164), 0.11)';

/**
 * "Material": Material Design 3 as specified, not a vibe. The card is an MD3
 * elevated card: the HA surface colour with a 5% primary surface tint (tonal
 * elevation level 1) and the level-1 key + ambient shadow, no outline, 12dp
 * medium corner. Controls are full pills (40dp / radius 20), icon buttons are
 * circles, dividers use the outline-variant, type is Roboto with the MD3
 * body tracking. Because everything is expressed in HA variables it follows
 * the active HA theme's colour scheme in both light and dark.
 */
export const MATERIAL_THEME: UcThemeDefinition = {
  id: 'material',
  name: 'Material',
  version: 1,
  author: 'Ultra Card',
  description:
    'Material Design 3: elevated cards with a tonal surface tint and level-1 shadow, 12dp corners, pill controls, circular icon buttons, Roboto.',
  icon: 'mdi:material-design',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 12,
    radius_sm: 20,
    border_width: 0,
    shadow: MD3_ELEVATION_1,
    density: 'regular',
    font_family: 'Roboto, "Roboto Flex", "Google Sans", system-ui, sans-serif',
  },
  card: {
    card_background: HA_CARD_BG,
    card_border_radius: 12,
    card_border_width: 0,
    card_padding: 16,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(0, 0, 0, 0.3)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 1,
    card_shadow_blur: 2,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'flat' },
    bar: { bar_style: 'flat' },
    slider_control: { slider_style: 'flat' },
    spinbox: { button_style: 'flat', button_shape: 'circle' },
    popup: { trigger_button_style: 'flat' },
    grid: { grid_style: 'style_14' },
    navigation: { nav_style: 'uc_material' },
    area_summary: { style_preset: 'iconic_soft', tile_border_radius: 12 },
    auto_entity_list: { row_style: 'detailed' },
    unifi: { rack_style: 'light' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'simple' },
  },
  css: `
.card-container {
  /* Tonal elevation: surface colour under a 5% primary tint. */
  background-image: linear-gradient(${MD3_SURFACE_TINT}, ${MD3_SURFACE_TINT}) !important;
  box-shadow: ${MD3_ELEVATION_1} !important;
  /* MD3 body-medium tracking. */
  letter-spacing: 0.25px;
}
/* Nested surfaces read as surface-container-high: the tint at level 3 (11%). */
[style*="--uc-design-surface"] {
  background-image: linear-gradient(${MD3_SURFACE_TINT_HIGH}, ${MD3_SURFACE_TINT_HIGH});
}
`.trim(),
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

// Michiana Mahjong Club brand palette.
const HILLARY_PINE = '#1f3b2e'; // pine: primary + ink (9.5:1 on linen)
const HILLARY_NAVY = '#1e2f4b'; // navy: shadow tint
const HILLARY_GOLD = '#d4af6c'; // gold: accent + piping
const HILLARY_LINEN = '#eae2d6'; // linen card
const HILLARY_TAUPE = '#8b7355'; // taupe: hairlines (3.5:1, too light for body text)
const HILLARY_TAUPE_INK = '#6f5a40'; // taupe deepened for secondary text (5.1:1 on linen)
const HILLARY_HAIRLINE = 'rgba(139, 115, 85, 0.35)'; // taupe hairline
const HILLARY_SHADOW = 'rgba(30, 47, 75, 0.14)'; // navy-tinted shadow

/**
 * "Hillary": a Nancy Meyers kitchen in Ralph Lauren tailoring. Linen
 * surfaces, pine ink for text, gold for the accent, a navy-tinted shadow and
 * an editorial serif. Cards carry a fine gold piping along the top edge. The
 * palette is pinned, so it reads the same over light and dark HA themes: this
 * one is the room, not a filter on it.
 */
export const HILLARY_THEME: UcThemeDefinition = {
  id: 'hillary',
  name: 'Hillary',
  version: 1,
  author: 'Ultra Card',
  description:
    'Linen, pine ink and taupe with gold accents. A Nancy Meyers palette in Ralph Lauren tailoring: warm, elevated, unhurried.',
  icon: 'mdi:flower-tulip-outline',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 14,
    radius_sm: 10,
    border_width: 1,
    border_color: HILLARY_HAIRLINE,
    shadow: `0 8px 24px ${HILLARY_SHADOW}, 0 1px 2px rgba(30, 47, 75, 0.06)`,
    density: 'comfortable',
    accent: HILLARY_GOLD,
    font_family:
      "'Playfair Display', 'Didot', 'Bodoni 72', 'Cormorant Garamond', 'Libre Baskerville', Georgia, 'Times New Roman', serif",
    palette: {
      primary: HILLARY_PINE,
      accent: HILLARY_GOLD,
      card_bg: HILLARY_LINEN,
      text: HILLARY_PINE,
      text_secondary: HILLARY_TAUPE_INK,
      divider: HILLARY_HAIRLINE,
    },
  },
  card: {
    card_background: HILLARY_LINEN,
    card_border_radius: 14,
    card_border_color: HILLARY_HAIRLINE,
    card_border_width: 1,
    card_padding: 20,
    card_shadow_enabled: true,
    card_shadow_color: HILLARY_SHADOW,
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
    area_summary: { style_preset: 'iconic_soft', accent_color: HILLARY_GOLD, tile_border_radius: 12 },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'light' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'simple_2' },
  },
  css: `
.card-container {
  /* Gold piping along the top edge, then the navy-tinted shadow. */
  box-shadow:
    inset 0 2px 0 ${HILLARY_GOLD},
    0 8px 24px ${HILLARY_SHADOW},
    0 1px 2px rgba(30, 47, 75, 0.06) !important;
  letter-spacing: 0.01em;
}
`.trim(),
};

// Moose: hide, antler and mud. Every colour is a brown.
const MOOSE_HIDE = '#2b1d14'; // dark cocoa card
const MOOSE_ANTLER = '#e8d9c3'; // pale antler: text (11.8:1 on hide)
const MOOSE_TAN = '#b89a74'; // sun-bleached tan: secondary text (6.1:1 on hide)
const MOOSE_SADDLE = '#8b5a2b'; // saddle brown: primary (white on it 5.8:1)
const MOOSE_VELVET = '#c2a37c'; // antler velvet: accent
const MOOSE_HAIRLINE = 'rgba(194, 163, 124, 0.22)';
const MOOSE_SHADOW = 'rgba(12, 7, 3, 0.45)';

/**
 * "Moose": a dark cocoa hide with antler-cream text, saddle-brown controls
 * and a warm tan accent. Nothing in the palette leaves the brown family, so
 * it holds together on any HA theme. Rounded, a touch heavier than Soft,
 * with a low-slung shadow like something big standing in the shade.
 */
export const MOOSE_THEME: UcThemeDefinition = {
  id: 'moose',
  name: 'Moose',
  version: 1,
  author: 'Ultra Card',
  description:
    'All browns, like a moose: dark cocoa hide, antler-cream text, saddle-brown controls and a warm tan accent.',
  icon: 'mdi:pine-tree',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 18,
    radius_sm: 12,
    border_width: 1,
    border_color: MOOSE_HAIRLINE,
    shadow: `0 10px 28px ${MOOSE_SHADOW}, 0 1px 2px rgba(12, 7, 3, 0.3)`,
    density: 'regular',
    accent: MOOSE_VELVET,
    font_family: "'Bitter', 'Merriweather', 'Source Serif 4', 'Roboto Slab', Georgia, serif",
    palette: {
      primary: MOOSE_SADDLE,
      accent: MOOSE_VELVET,
      card_bg: MOOSE_HIDE,
      text: MOOSE_ANTLER,
      text_secondary: MOOSE_TAN,
      divider: MOOSE_HAIRLINE,
    },
  },
  card: {
    card_background: MOOSE_HIDE,
    card_border_radius: 18,
    card_border_color: MOOSE_HAIRLINE,
    card_border_width: 1,
    card_padding: 18,
    card_shadow_enabled: true,
    card_shadow_color: MOOSE_SHADOW,
    card_shadow_horizontal: 0,
    card_shadow_vertical: 10,
    card_shadow_blur: 28,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'flat' },
    bar: { bar_style: 'flat' },
    slider_control: { slider_style: 'flat' },
    spinbox: { button_style: 'flat', button_shape: 'rounded' },
    popup: { trigger_button_style: 'flat' },
    grid: { grid_style: 'style_20' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'iconic_soft', accent_color: MOOSE_VELVET, tile_border_radius: 14 },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'dark' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'simple_2' },
  },
  css: `
.card-container {
  /* A faint antler highlight on the top edge over a warm hide gradient. */
  background-image: linear-gradient(180deg, rgba(232, 217, 195, 0.05) 0%, rgba(232, 217, 195, 0) 40%) !important;
  box-shadow:
    inset 0 1px 0 rgba(232, 217, 195, 0.1),
    0 10px 28px ${MOOSE_SHADOW},
    0 1px 2px rgba(12, 7, 3, 0.3) !important;
}
`.trim(),
};

// Metallic: a brushed steel plate, screwed to the wall.
const METAL_PLATE = '#c0c6cd'; // mid steel (palette base; the sheen runs #8f98a2..#f4f6f8)
const METAL_INK = '#161a20'; // etched graphite text (7.3:1 on the darkest stop)
const METAL_INK_SOFT = '#3a414a'; // secondary (4.6:1 on the darkest stop)
const METAL_GUNMETAL = '#3a434f'; // primary (white on it 10:1)
const METAL_BLUED = '#35516f'; // blued-steel accent
const METAL_EDGE = '#5f6870'; // machined edge
/**
 * Anisotropic brushing: three layers of fractal noise stretched hard along
 * X (very low X frequency, high Y frequency) give long fine streaks: bright
 * scratches, dark scratches, and a few broad soft score marks. Tiles seamlessly.
 */
const METAL_BRUSH = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='480' height='160'>
  <defs>
    <filter id='hi' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.004 0.9' numOctaves='3' seed='3' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.7'/>
    </filter>
    <filter id='lo' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.006 0.8' numOctaves='3' seed='9' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0.02  1.5 0 0 0 -0.76'/>
    </filter>
    <filter id='scr' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.002 0.35' numOctaves='2' seed='21' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 -0.72'/>
    </filter>
  </defs>
  <rect width='480' height='160' filter='url(#hi)'/>
  <rect width='480' height='160' filter='url(#lo)'/>
  <rect width='480' height='160' filter='url(#scr)'/>
</svg>`);
/** A countersunk slotted screw head: domed radial shading, dark well, slot with a light catch. */
const METAL_SCREW = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
  <defs>
    <radialGradient id='h' cx='38%' cy='34%' r='70%'>
      <stop offset='0' stop-color='#f6f8fa'/><stop offset='.45' stop-color='#b9c0c8'/><stop offset='.8' stop-color='#6f777f'/><stop offset='1' stop-color='#3b424a'/>
    </radialGradient>
    <radialGradient id='w' cx='50%' cy='50%' r='50%'>
      <stop offset='.82' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.45'/>
    </radialGradient>
  </defs>
  <circle cx='10' cy='10' r='9.5' fill='url(#w)'/>
  <circle cx='10' cy='10' r='8' fill='url(#h)' stroke='#2b3138' stroke-width='.6'/>
  <g stroke-linecap='round' fill='none'>
    <path d='M5.6 5.6 L14.4 14.4' stroke='#e9edf1' stroke-width='2' transform='translate(.5 .5)'/>
    <path d='M5.6 5.6 L14.4 14.4' stroke='#2a3038' stroke-width='2'/>
  </g>
</svg>`);
/** The reflection: alternating hot and dark bands, as a curved sheet of steel shows under a strip light. */
const METAL_SHEEN =
  'linear-gradient(118deg, #f3f5f7 0%, #d5dae0 9%, #a5adb6 22%, #8f98a2 29%, #d9dee3 41%, #f4f6f8 47%, #c3cad1 58%, #98a1ab 70%, #cdd3d9 83%, #edf0f3 91%, #a7afb8 100%)';
/** Bright catch top-left, shadow bottom-right, then a 1px chamfer ring 3px in. */
const METAL_BEVEL =
  'inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(0, 0, 0, 0.5), inset 1px 0 0 rgba(255, 255, 255, 0.55), inset -1px 0 0 rgba(0, 0, 0, 0.32), inset 0 0 0 3px rgba(255, 255, 255, 0.16), inset 0 0 0 4px rgba(0, 0, 0, 0.14)';
const METAL_DROP = '0 1px 0 rgba(255, 255, 255, 0.25), 0 10px 22px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.5)';

/**
 * "Metallic": a brushed steel plate screwed to the wall. Real anisotropic
 * brushing (procedural noise stretched along the plate), a banded specular
 * sheen across it, a chamfered edge with a light catch top-left and shadow
 * bottom-right, and a slotted screw in each corner. Text is etched (dark
 * with a light catch below), controls are gunmetal, the accent blued steel.
 * Nested surfaces are recesses milled into the plate.
 */
export const METALLIC_THEME: UcThemeDefinition = {
  id: 'metallic',
  name: 'Metallic',
  version: 2,
  author: 'Ultra Card',
  description:
    'A brushed steel plate screwed to the wall: real brushing, banded sheen, chamfered edge and corner screws. Etched text, gunmetal controls, blued-steel accents.',
  icon: 'mdi:anvil',
  source: 'builtin',
  tokens: {
    surface: 'glossy',
    radius: 8,
    radius_sm: 6,
    border_width: 1,
    border_color: METAL_EDGE,
    shadow: `${METAL_BEVEL}, ${METAL_DROP}`,
    density: 'regular',
    accent: METAL_BLUED,
    font_family: "'Rajdhani', 'Barlow Semi Condensed', 'Roboto Condensed', 'Oswald', system-ui, sans-serif",
    palette: {
      primary: METAL_GUNMETAL,
      accent: METAL_BLUED,
      card_bg: METAL_PLATE,
      text: METAL_INK,
      text_secondary: METAL_INK_SOFT,
      divider: 'rgba(22, 26, 32, 0.25)',
    },
  },
  card: {
    card_background: METAL_PLATE,
    card_border_radius: 8,
    card_border_color: METAL_EDGE,
    card_border_width: 1,
    card_padding: 18,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(0, 0, 0, 0.45)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 10,
    card_shadow_blur: 22,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'metallic' },
    bar: { bar_style: 'metallic' },
    slider_control: { slider_style: 'metallic' },
    spinbox: { button_style: 'metallic', button_shape: 'square' },
    popup: { trigger_button_style: 'metallic' },
    grid: { grid_style: 'style_12' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'compact_controls', accent_color: METAL_BLUED, tile_border_radius: 6 },
    auto_entity_list: { row_style: 'detailed' },
    unifi: { rack_style: 'dark' },
    activity_feed: { feed_card_style: 'outlined' },
    tabs: { style: 'switch_1' },
  },
  css: `
.card-container {
  background-color: ${METAL_PLATE} !important;
  /* Layers, top to bottom: four corner screws, the brushing, the banded sheen. */
  background-image:
    ${METAL_SCREW}, ${METAL_SCREW}, ${METAL_SCREW}, ${METAL_SCREW},
    ${METAL_BRUSH},
    ${METAL_SHEEN} !important;
  background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, repeat, no-repeat !important;
  background-size: 14px 14px, 14px 14px, 14px 14px, 14px 14px, 480px 160px, 100% 100% !important;
  background-position: left 7px top 7px, right 7px top 7px, left 7px bottom 7px, right 7px bottom 7px, 0 0, 0 0 !important;
  border: 1px solid ${METAL_EDGE} !important;
  box-shadow: ${METAL_BEVEL}, ${METAL_DROP} !important;
  /* Etched: dark ink with the light catching the lower edge of each stroke. */
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  letter-spacing: 0.02em;
}
/* Nested surfaces read as recesses milled into the plate. */
[style*="--uc-design-surface"] {
  background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.04));
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.35), inset 0 -1px 0 rgba(255, 255, 255, 0.7), 0 1px 0 rgba(255, 255, 255, 0.5);
}
`.trim(),
};

// Beach: sand, sea, driftwood and a lick of coral.
const BEACH_SAND = '#f3e9d2';
const BEACH_SEA = '#1f3a4d'; // deep water: text (9.8:1 on sand)
const BEACH_DRIFTWOOD = '#6b5d4a'; // secondary text (5.3:1 on sand)
const BEACH_OCEAN = '#186a7a'; // primary (white on it 6.2:1)
const BEACH_CORAL = '#c9543a'; // accent
const BEACH_WAVES = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 24' preserveAspectRatio='none'>
  <path d='M0 11 C30 3 50 19 80 11 S130 3 160 11 S210 19 240 11 V24 H0Z' fill='${BEACH_OCEAN}' fill-opacity='.18'/>
  <path d='M0 16 C30 8 50 24 80 16 S130 8 160 16 S210 24 240 16 V24 H0Z' fill='${BEACH_OCEAN}' fill-opacity='.3'/>
  <path d='M0 11 C30 3 50 19 80 11 S130 3 160 11 S210 19 240 11' fill='none' stroke='#ffffff' stroke-opacity='.75' stroke-width='1.5'/>
</svg>`);
const BEACH_GRAIN = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'>
  <g fill='${BEACH_DRIFTWOOD}' fill-opacity='.14'>
    <circle cx='6' cy='9' r='1'/><circle cx='23' cy='4' r='.8'/><circle cx='41' cy='12' r='1'/>
    <circle cx='14' cy='26' r='.8'/><circle cx='33' cy='30' r='1.1'/><circle cx='50' cy='27' r='.7'/>
    <circle cx='8' cy='45' r='1'/><circle cx='27' cy='49' r='.8'/><circle cx='45' cy='44' r='1'/><circle cx='52' cy='52' r='.7'/>
  </g>
</svg>`);
const BEACH_ROPE = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='12' height='6'>
  <path d='M0 3 Q3 0 6 3 T12 3' fill='none' stroke='${BEACH_DRIFTWOOD}' stroke-opacity='.45' stroke-width='1.4'/>
</svg>`);

/**
 * "Beach": a sand card with water lapping along the bottom edge, a sun glow
 * in the top-right corner, fine sand grain across the surface and a rope
 * hairline under the top edge. All artwork is inline SVG, so nothing is
 * fetched. Deep-water text on sand, an ocean primary, a coral accent, and a
 * soft rounded sans.
 */
export const BEACH_THEME: UcThemeDefinition = {
  id: 'beach',
  name: 'Beach',
  version: 1,
  author: 'Ultra Card',
  description:
    'Sand cards with waves lapping the bottom edge, a sun glow, sand grain and a rope hairline. Deep-water text, ocean controls, coral accents.',
  icon: 'mdi:beach',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 22,
    radius_sm: 14,
    border_width: 1,
    border_color: 'rgba(107, 93, 74, 0.28)',
    shadow: '0 10px 26px rgba(31, 58, 77, 0.14), 0 1px 2px rgba(31, 58, 77, 0.08)',
    density: 'comfortable',
    accent: BEACH_CORAL,
    font_family: "'Nunito', 'Quicksand', 'Varela Round', 'Avenir Next Rounded', system-ui, sans-serif",
    palette: {
      primary: BEACH_OCEAN,
      accent: BEACH_CORAL,
      card_bg: BEACH_SAND,
      text: BEACH_SEA,
      text_secondary: BEACH_DRIFTWOOD,
      divider: 'rgba(107, 93, 74, 0.28)',
    },
  },
  card: {
    card_background: BEACH_SAND,
    card_border_radius: 22,
    card_border_color: 'rgba(107, 93, 74, 0.28)',
    card_border_width: 1,
    card_padding: 22,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(31, 58, 77, 0.14)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 10,
    card_shadow_blur: 26,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'flat' },
    bar: { bar_style: 'flat' },
    slider_control: { slider_style: 'flat' },
    spinbox: { button_style: 'flat', button_shape: 'circle' },
    popup: { trigger_button_style: 'flat' },
    grid: { grid_style: 'style_14' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'iconic_soft', accent_color: BEACH_CORAL, tile_border_radius: 16 },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'light' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'simple' },
  },
  css: `
.card-container {
  background-color: ${BEACH_SAND} !important;
  /* Layers, top to bottom: waves at the foot, rope under the top edge, sun glow, sand grain, sky wash. */
  background-image:
    ${BEACH_WAVES},
    ${BEACH_ROPE},
    radial-gradient(circle at 92% -8%, rgba(255, 196, 110, 0.55) 0%, rgba(255, 196, 110, 0.18) 18%, rgba(255, 196, 110, 0) 42%),
    ${BEACH_GRAIN},
    linear-gradient(180deg, rgba(24, 106, 122, 0.06) 0%, rgba(24, 106, 122, 0) 45%) !important;
  background-repeat: no-repeat, repeat-x, no-repeat, repeat, no-repeat !important;
  background-size: 100% 20px, 12px 6px, auto, 56px 56px, auto !important;
  background-position: bottom center, left 9px, 0 0, 0 0, 0 0 !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 10px 26px rgba(31, 58, 77, 0.14),
    0 1px 2px rgba(31, 58, 77, 0.08) !important;
}
`.trim(),
};

// Vapor: a e s t h e t i c. Midnight purple, hot pink, cyan, a striped sun and a perspective grid.
const VAPOR_NIGHT = '#160b2b';
const VAPOR_TEXT = '#f3e8ff'; // 15.9:1 on night
const VAPOR_TEXT_SOFT = '#b8a3dc'; // 8.3:1 on night
const VAPOR_PINK = '#ff4fd8'; // primary (dark text on it 5.6:1)
const VAPOR_CYAN = '#4ff0ff'; // accent
const VAPOR_GLOW =
  '0 0 0 1px rgba(255, 79, 216, 0.55), 0 0 22px rgba(255, 79, 216, 0.28), 0 0 44px rgba(79, 240, 255, 0.14), 0 12px 30px rgba(0, 0, 0, 0.5)';
const VAPOR_SUN = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='${VAPOR_PINK}'/><stop offset='.55' stop-color='#ff7ac8'/><stop offset='1' stop-color='#ffb347'/>
    </linearGradient>
    <clipPath id='c'>
      <rect x='0' y='0' width='120' height='62'/><rect x='0' y='66' width='120' height='10'/><rect x='0' y='80' width='120' height='8'/>
      <rect x='0' y='92' width='120' height='6'/><rect x='0' y='102' width='120' height='4'/><rect x='0' y='110' width='120' height='3'/>
    </clipPath>
  </defs>
  <circle cx='60' cy='60' r='54' fill='url(#g)' clip-path='url(#c)' opacity='.6'/>
</svg>`);
const VAPOR_GRID = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 90' preserveAspectRatio='none'>
  <defs>
    <linearGradient id='f' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='${VAPOR_CYAN}' stop-opacity='0'/><stop offset='1' stop-color='${VAPOR_CYAN}' stop-opacity='.5'/>
    </linearGradient>
  </defs>
  <path fill='none' stroke='url(#f)' stroke-width='1'
    d='M-160 90 L200 -70 M-80 90 L200 -70 M0 90 L200 -70 M60 90 L200 -70 M120 90 L200 -70 M160 90 L200 -70 M200 90 L200 -70 M240 90 L200 -70 M280 90 L200 -70 M340 90 L200 -70 M400 90 L200 -70 M480 90 L200 -70 M560 90 L200 -70 M0 6 H400 M0 14 H400 M0 24 H400 M0 36 H400 M0 50 H400 M0 67 H400 M0 88 H400'/>
</svg>`);

/**
 * "Vapor": vaporwave. A midnight-purple card with a striped sunset sun in the
 * top-right corner, a cyan perspective grid running off the bottom edge, a
 * faint VHS scanline and a pink neon rim. Hot-pink primary with dark text on
 * it, cyan accent, neon-glow controls, a wide techno sans.
 */
export const VAPOR_THEME: UcThemeDefinition = {
  id: 'vapor',
  name: 'Vapor',
  version: 1,
  author: 'Ultra Card',
  description:
    'Vaporwave: midnight purple, a striped sunset sun, a cyan perspective grid, VHS scanlines and a hot-pink neon rim.',
  icon: 'mdi:weather-sunset',
  source: 'builtin',
  tokens: {
    surface: 'glass',
    radius: 14,
    radius_sm: 10,
    blur: 10,
    border_width: 1,
    border_color: 'rgba(255, 79, 216, 0.55)',
    shadow: VAPOR_GLOW,
    density: 'regular',
    accent: VAPOR_CYAN,
    font_family: "'Orbitron', 'Exo 2', 'Michroma', 'Audiowide', 'Trebuchet MS', system-ui, sans-serif",
    palette: {
      primary: VAPOR_PINK,
      accent: VAPOR_CYAN,
      card_bg: VAPOR_NIGHT,
      text: VAPOR_TEXT,
      text_secondary: VAPOR_TEXT_SOFT,
      divider: 'rgba(255, 79, 216, 0.3)',
    },
  },
  card: {
    card_background: VAPOR_NIGHT,
    card_border_radius: 14,
    card_border_color: 'rgba(255, 79, 216, 0.55)',
    card_border_width: 1,
    card_padding: 18,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(255, 79, 216, 0.28)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 0,
    card_shadow_blur: 22,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'neon-glow' },
    bar: { bar_style: 'neon-glow' },
    slider_control: { slider_style: 'neon-glow' },
    spinbox: { button_style: 'neon-glow', button_shape: 'rounded' },
    popup: { trigger_button_style: 'neon-glow' },
    grid: { grid_style: 'style_17' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'graph_glow', accent_color: VAPOR_CYAN, tile_border_radius: 12 },
    auto_entity_list: { row_style: 'slim' },
    unifi: { rack_style: 'blueprint' },
    activity_feed: { feed_card_style: 'flat' },
    tabs: { style: 'modern' },
  },
  css: `
.card-container {
  background-color: ${VAPOR_NIGHT} !important;
  /* Layers, top to bottom: grid at the foot, sun in the corner, pink haze, scanlines, night gradient. */
  background-image:
    ${VAPOR_GRID},
    ${VAPOR_SUN},
    radial-gradient(ellipse at 15% 110%, rgba(255, 79, 216, 0.28) 0%, rgba(255, 79, 216, 0) 55%),
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.07) 0 1px, rgba(0, 0, 0, 0) 1px 3px),
    linear-gradient(180deg, #1d0d3d 0%, ${VAPOR_NIGHT} 55%, #0e0821 100%) !important;
  background-repeat: no-repeat, no-repeat, no-repeat, repeat, no-repeat !important;
  background-size: 100% 70px, 120px 120px, auto, auto, auto !important;
  background-position: bottom center, right -14px top -18px, 0 0, 0 0, 0 0 !important;
  box-shadow: ${VAPOR_GLOW} !important;
  text-shadow: 0 0 8px rgba(255, 79, 216, 0.25);
  letter-spacing: 0.03em;
}
`.trim(),
};

// Gummy: every card is a different flavour. The card sets --uc-card-hue and
// three --uc-card-seed-N values per instance (see ucThemeService.cardSeed);
// the ink is one dark plum that clears AA on every hue at this lightness
// (worst case 5.2:1 on blue).
const GUMMY_H = 'var(--uc-card-hue, 340)';
const GUMMY_INK = '#2a1838';
const GUMMY_INK_SOFT = '#35243f'; // 4.6:1 worst case
const GUMMY_PRIMARY = '#3a2350'; // liquorice: white on it 13.7:1
const gummy = (s: number, l: number, a?: number) =>
  a === undefined ? `hsl(${GUMMY_H} ${s}% ${l}%)` : `hsl(${GUMMY_H} ${s}% ${l}% / ${a})`;
/**
 * Subsurface: light travels further through the edges of a gummy than the
 * middle, so the rim is deeper and more saturated and the centre glows. An
 * inner ring, a wide inner glow, a heavier pool at the bottom, a bright
 * refraction line along the bottom edge, and a coloured drop shadow. No
 * border: a hard outline reads as a sticker, so the edge is defined only by
 * a soft light catch along the top and the rim glow.
 */
const GUMMY_BODY_SHADOW = `inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(255, 255, 255, 0.55), inset 0 0 0 3px ${gummy(92, 56, 0.42)}, inset 0 0 36px ${gummy(96, 46, 0.62)}, inset 0 -16px 22px ${gummy(96, 44, 0.5)}, 0 12px 26px ${gummy(80, 40, 0.42)}, 0 2px 6px ${gummy(80, 35, 0.35)}`;

/**
 * "Gummy": gummy-bear cards. Each card gets its own candy hue (dealt so that
 * neighbours never match) rendered as translucent jelly. The gloss is not a
 * stamp: a soft specular bloom with a hot core, a diagonal sheen band, a
 * floor reflection and the position of the light pool are all driven by the
 * card's random seeds, so every card catches the light differently.
 * Subsurface glow deepens toward the rim, a refraction line runs along the
 * bottom edge and the drop shadow is the card's own colour. No border: the
 * edge is only the light catching it. Nested surfaces
 * are smaller gummies with their own gloss. Dark-plum ink and liquorice
 * controls read on every flavour. Big soft radii, rounded type.
 */
export const GUMMY_THEME: UcThemeDefinition = {
  id: 'gummy',
  name: 'Gummy',
  version: 4,
  author: 'Ultra Card',
  description:
    'Gummy-bear cards: every card its own candy colour, rendered as translucent jelly that catches the light differently on each card. Dark-plum ink, liquorice controls.',
  icon: 'mdi:candy',
  source: 'builtin',
  tokens: {
    surface: 'glossy',
    radius: 26,
    radius_sm: 18,
    border_width: 0,
    border_color: 'transparent',
    shadow: GUMMY_BODY_SHADOW,
    density: 'comfortable',
    accent: `hsl(calc(${GUMMY_H} + 40) 90% 52%)`,
    font_family: "'Baloo 2', 'Fredoka', 'Nunito', 'Varela Round', 'Quicksand', system-ui, sans-serif",
    palette: {
      primary: GUMMY_PRIMARY,
      on_primary: '#ffffff',
      accent: `hsl(calc(${GUMMY_H} + 40) 90% 52%)`,
      card_bg: gummy(88, 72),
      text: GUMMY_INK,
      text_secondary: GUMMY_INK_SOFT,
      divider: 'rgba(42, 24, 56, 0.18)',
    },
  },
  card: {
    card_background: gummy(88, 72),
    card_border_radius: 26,
    card_border_color: 'transparent',
    card_border_width: 0,
    card_padding: 20,
    card_shadow_enabled: true,
    card_shadow_color: gummy(80, 40, 0.42),
    card_shadow_horizontal: 0,
    card_shadow_vertical: 12,
    card_shadow_blur: 26,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'glossy' },
    bar: { bar_style: 'glossy' },
    slider_control: { slider_style: 'glossy' },
    spinbox: { button_style: 'glossy', button_shape: 'circle' },
    popup: { trigger_button_style: 'glossy' },
    grid: { grid_style: 'style_14' },
    navigation: { nav_style: 'uc_ios_glass' },
    area_summary: { style_preset: 'iconic_soft', tile_border_radius: 20 },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'light' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'switch_2' },
  },
  css: `
.card-container {
  /* Companions that must follow the per-card hue rather than a fixed palette. */
  --secondary-background-color: ${gummy(90, 86)};
  --primary-background-color: ${gummy(90, 82)};
  --input-fill-color: ${gummy(90, 86)};
  --mdc-select-fill-color: ${gummy(90, 86)};
  --mdc-text-field-fill-color: ${gummy(90, 86)};
  --mdc-theme-surface: ${gummy(88, 72)};
  /* Where this card catches the light, from its own seeds. */
  --g-s1: var(--uc-card-seed-1, 0.5);
  --g-s2: var(--uc-card-seed-2, 0.5);
  --g-s3: var(--uc-card-seed-3, 0.5);
  --g-x: calc(14% + var(--g-s1) * 56%);
  --g-y: calc(3% + var(--g-s2) * 14%);
  --g-w: calc(22% + var(--g-s3) * 26%);
  --g-h: calc(9% + var(--g-s2) * 10%);
  --g-a: calc(96deg + var(--g-s3) * 48deg);
  --g-p: calc(28% + var(--g-s1) * 30%);
  background-color: ${gummy(88, 72)} !important;
  /* Layers, top to bottom: hot core, specular bloom, sheen band, floor reflection, saturated pool, jelly body. */
  background-image:
    radial-gradient(ellipse calc(var(--g-w) * 0.32) calc(var(--g-h) * 0.42) at calc(var(--g-x) - var(--g-w) * 0.14) calc(var(--g-y) + 1%), rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 45%, rgba(255, 255, 255, 0) 100%),
    radial-gradient(ellipse var(--g-w) var(--g-h) at var(--g-x) var(--g-y), rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 45%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(var(--g-a), rgba(255, 255, 255, 0) calc(var(--g-p) - 14%), rgba(255, 255, 255, 0.2) var(--g-p), rgba(255, 255, 255, 0) calc(var(--g-p) + 12%)),
    radial-gradient(ellipse calc(18% + var(--g-s2) * 16%) 8% at calc(56% + var(--g-s3) * 34%) 95%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0) 100%),
    radial-gradient(ellipse 70% 45% at calc(30% + var(--g-s1) * 40%) 108%, ${gummy(95, 58, 0.9)} 0%, ${gummy(95, 58, 0)} 70%),
    radial-gradient(ellipse 110% 75% at calc(35% + var(--g-s2) * 30%) 45%, ${gummy(86, 80)} 0%, ${gummy(90, 72)} 60%, ${gummy(94, 62)} 100%) !important;
  border: none !important;
  box-shadow: ${GUMMY_BODY_SHADOW} !important;
}
/* Nested surfaces are smaller gummies: lighter body, their own bloom and sheen, the same glowing rim. */
[style*="--uc-design-surface"] {
  background-color: ${gummy(90, 84)};
  background-image:
    radial-gradient(ellipse calc(14% + var(--g-s3) * 14%) 45% at calc(10% + var(--g-s2) * 30%) 0%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(calc(100deg + var(--g-s1) * 40deg), rgba(255, 255, 255, 0) 35%, rgba(255, 255, 255, 0.18) 50%, rgba(255, 255, 255, 0) 62%),
    linear-gradient(180deg, ${gummy(90, 88)}, ${gummy(92, 78)});
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.6), inset 0 0 0 2px ${gummy(90, 66, 0.3)}, inset 0 0 12px ${gummy(95, 55, 0.45)}, inset 0 -6px 10px ${gummy(95, 50, 0.4)}, 0 3px 8px ${gummy(80, 40, 0.25)};
}
`.trim(),
};

// Wood: a walnut plank. The grain is procedural: an SVG fractal-noise filter
// stretched along the plank, mapped to dark and pale streaks over the base.
const WOOD_BASE = '#6f4423'; // walnut
const WOOD_INK = '#f7ecd9'; // cream (7.1:1 on walnut)
const WOOD_INK_SOFT = '#ead8bd'; // sand (6:1 on walnut)
const WOOD_DARK = '#3e2412'; // primary: dark walnut (cream on it 12:1)
const WOOD_BRASS = '#c9a25a'; // accent: brass hardware
const WOOD_EDGE = '#3a2210'; // routed edge
const WOOD_GRAIN = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='240'>
  <defs>
    <filter id='d' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.003 0.11' numOctaves='4' seed='11'/>
      <feColorMatrix values='0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0 0.03  1.6 0 0 0 -0.75'/>
    </filter>
    <filter id='l' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.004 0.07' numOctaves='3' seed='4'/>
      <feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.62  0 0 0 0 0.38  1.3 0 0 0 -0.85'/>
    </filter>
    <filter id='f' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9 0.9' numOctaves='1' seed='2'/>
      <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.35 0 0 0 -0.1'/>
    </filter>
  </defs>
  <rect width='600' height='240' fill='${WOOD_BASE}'/>
  <rect width='600' height='240' filter='url(#l)'/>
  <rect width='600' height='240' filter='url(#d)'/>
  <rect width='600' height='240' filter='url(#f)'/>
</svg>`);

/**
 * "Wood": a walnut plank. The grain is real procedural grain (SVG fractal
 * noise stretched along the board: long dark figure, paler early-wood
 * streaks, a fine pore texture) over a walnut base, with a routed edge,
 * a soft top-light and a warm shadow. Cream ink, dark-walnut controls and
 * brass hardware for the accent. Controls are embossed like carved wood.
 */
export const WOOD_THEME: UcThemeDefinition = {
  id: 'wood',
  name: 'Wood',
  version: 1,
  author: 'Ultra Card',
  description:
    'A walnut plank with real procedural grain, routed edges and brass hardware. Cream ink, carved controls.',
  icon: 'mdi:tree',
  source: 'builtin',
  tokens: {
    surface: 'neumorphic',
    radius: 10,
    radius_sm: 8,
    border_width: 1,
    border_color: WOOD_EDGE,
    shadow: 'inset 0 1px 0 rgba(255, 220, 180, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.35), 0 8px 20px rgba(30, 15, 5, 0.45)',
    density: 'regular',
    accent: WOOD_BRASS,
    font_family: "'Lora', 'Merriweather', 'Source Serif 4', Georgia, 'Times New Roman', serif",
    palette: {
      primary: WOOD_DARK,
      accent: WOOD_BRASS,
      card_bg: WOOD_BASE,
      text: WOOD_INK,
      text_secondary: WOOD_INK_SOFT,
      divider: 'rgba(247, 236, 217, 0.18)',
    },
  },
  card: {
    card_background: WOOD_BASE,
    card_border_radius: 10,
    card_border_color: WOOD_EDGE,
    card_border_width: 1,
    card_padding: 18,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(30, 15, 5, 0.45)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 8,
    card_shadow_blur: 20,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'embossed' },
    bar: { bar_style: 'embossed' },
    slider_control: { slider_style: 'embossed' },
    spinbox: { button_style: 'embossed', button_shape: 'rounded' },
    popup: { trigger_button_style: 'embossed' },
    grid: { grid_style: 'style_12' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'iconic_soft', accent_color: WOOD_BRASS, tile_border_radius: 8 },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'dark' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'simple_3' },
  },
  css: `
.card-container {
  background-color: ${WOOD_BASE} !important;
  /* Top light over the grain plank; the plank stretches with the card so the figure runs its length. */
  background-image:
    linear-gradient(180deg, rgba(255, 225, 190, 0.10) 0%, rgba(255, 225, 190, 0) 35%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.14) 100%),
    ${WOOD_GRAIN} !important;
  background-repeat: no-repeat, no-repeat !important;
  background-size: auto, 100% 100% !important;
  border: 1px solid ${WOOD_EDGE} !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 220, 180, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35),
    inset 1px 0 0 rgba(255, 220, 180, 0.08),
    inset -1px 0 0 rgba(0, 0, 0, 0.2),
    0 8px 20px rgba(30, 15, 5, 0.45) !important;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
}
/* Nested surfaces are recesses carved into the board. */
[style*="--uc-design-surface"] {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45), inset 0 -1px 0 rgba(255, 220, 180, 0.12);
}
`.trim(),
};

export const BUILTIN_THEMES: readonly UcThemeDefinition[] = [
  HA_NATIVE_THEME,
  GLASS_THEME,
  BOLD_THEME,
  MONOCHROME_THEME,
  MATERIAL_THEME,
  LIQUID_GLASS_THEME,
  HILLARY_THEME,
  MOOSE_THEME,
  METALLIC_THEME,
  BEACH_THEME,
  VAPOR_THEME,
  GUMMY_THEME,
  WOOD_THEME,
  GREEN_TERMINAL_THEME,
];
