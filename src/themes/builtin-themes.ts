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
    // MD3 groups content with tonal surfaces, not outlines.
    pane_border: 'none',
    pane_shadow: 'none',
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
    page_background: '#020503',
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
    // A soft wallpaper for the glass to refract; flat pages make glass read as paper.
    page_background:
      'radial-gradient(at 18% 12%, rgba(125, 211, 252, 0.75) 0, transparent 50%), radial-gradient(at 82% 28%, rgba(196, 181, 253, 0.7) 0, transparent 55%), radial-gradient(at 55% 92%, rgba(251, 207, 232, 0.7) 0, transparent 50%), #e9eef9',
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

// Hydrangea heads for Hillary: a mophead of four-petal florets over two sage
// leaves, in a dusty blue and a blush. Florets are laid out by hand so the
// cluster reads as one bloom, with a darker shade toward the shadow side.
type HydrangeaShades = { light: string; mid: string; deep: string; eye: string };
const HYDRANGEA_FLORETS: ReadonlyArray<readonly [number, number, number, 0 | 1 | 2]> = [
  [60, 34, 9, 0], [44, 40, 9, 0], [76, 40, 9, 1], [30, 52, 9, 1], [58, 50, 10, 0], [88, 54, 9, 1],
  [40, 64, 10, 1], [70, 64, 10, 0], [26, 74, 8, 2], [52, 76, 9, 1], [82, 76, 9, 2], [38, 86, 8, 2],
  [64, 88, 9, 2], [92, 66, 7, 2], [48, 28, 6, 0], [74, 28, 6, 0], [20, 62, 6, 2],
];
function hydrangeaSvg(c: HydrangeaShades): string {
  const shade = [c.light, c.mid, c.deep];
  const florets = HYDRANGEA_FLORETS.map(([x, y, r, k]) => {
    const p = r * 0.62;
    return `<g transform='translate(${x} ${y})' fill='${shade[k]}' fill-opacity='.92'><circle cx='${-p}' cy='0' r='${p}'/><circle cx='${p}' cy='0' r='${p}'/><circle cx='0' cy='${-p}' r='${p}'/><circle cx='0' cy='${p}' r='${p}'/><circle r='${(p * 0.4).toFixed(1)}' fill='${c.eye}'/></g>`;
  }).join('');
  return svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
  <g fill='#8a9a7b'>
    <path d='M14 98 C30 70 62 78 78 100 C56 116 28 116 14 98Z'/>
    <path d='M70 104 C80 84 106 84 114 100 C102 112 82 114 70 104Z' fill='#7c8d6e'/>
  </g>
  <g stroke='#6c7c5f' stroke-width='1' fill='none' stroke-linecap='round'>
    <path d='M18 99 C40 92 58 92 76 100 M74 104 C86 96 100 96 112 100'/>
  </g>
  ${florets}
</svg>`);
}
const HILLARY_HYDRANGEA_BLUE = hydrangeaSvg({ light: '#a7bad6', mid: '#8fa5c4', deep: '#7489a8', eye: '#e4ebf5' });
const HILLARY_HYDRANGEA_BLUSH = hydrangeaSvg({ light: '#e6c9cc', mid: '#d9b3b8', deep: '#c497a0', eye: '#f7ecec' });

/**
 * "Hillary": a Nancy Meyers kitchen in Ralph Lauren tailoring. Linen
 * surfaces, pine ink for text, gold for the accent, a navy-tinted shadow and
 * an editorial serif. Cards carry a fine gold piping along the top edge, and
 * here and there a hydrangea head (dusty blue or blush over sage leaves)
 * tucks into a corner, placed by the card's seeds so no two cards match and
 * some carry none. The palette is pinned, so it reads the same over light and
 * dark HA themes: this one is the room, not a filter on it.
 */
export const HILLARY_THEME: UcThemeDefinition = {
  id: 'hillary',
  name: 'Hillary',
  version: 2,
  author: 'Ultra Card',
  description:
    'Linen, pine ink and taupe with gold accents, a hydrangea tucked into the odd corner. A Nancy Meyers palette in Ralph Lauren tailoring: warm, elevated, unhurried.',
  icon: 'mdi:flower-tulip-outline',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 14,
    radius_sm: 10,
    border_width: 1,
    border_color: HILLARY_HAIRLINE,
    shadow: `0 8px 24px ${HILLARY_SHADOW}, 0 1px 2px rgba(30, 47, 75, 0.06)`,
    page_background: '#f5f0e8',
    pane_background: '#e1d8c9',
    pane_border: `1px solid ${HILLARY_HAIRLINE}`,
    pane_shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
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
  /* Which corners get a bloom, from the card's seeds. */
  --h-s1: var(--uc-card-seed-1, 0.5);
  --h-s2: var(--uc-card-seed-2, 0.5);
  --h-s3: var(--uc-card-seed-3, 0.5);
  --h-size: calc(96px + var(--h-s3) * 40px);
  /* 0 or 1: the blue head sits top-right or bottom-right; the blush head keeps to the bottom-left, clear of titles. */
  --h-side: clamp(0, (var(--h-s2) - 0.5) * 100, 1);
  /* Each head shows only when its seed clears the bar; otherwise its size collapses to 0. */
  --h-blue: calc(clamp(0, (var(--h-s1) - 0.35) * 20, 1) * var(--h-size));
  --h-blush: calc(clamp(0, (var(--h-s3) - 0.55) * 20, 1) * var(--h-size) * 0.85);
  background-color: ${HILLARY_LINEN} !important;
  /* Blue head off the right edge, blush head off the bottom-left, each cropped by the corner. */
  background-image: ${HILLARY_HYDRANGEA_BLUE}, ${HILLARY_HYDRANGEA_BLUSH} !important;
  background-repeat: no-repeat !important;
  background-size: var(--h-blue) var(--h-blue), var(--h-blush) var(--h-blush) !important;
  background-position:
    calc(100% + var(--h-size) * 0.3 - var(--h-s2) * 12px) calc(var(--h-size) * -0.3 + var(--h-side) * (100% + var(--h-size) * 0.55)),
    calc(var(--h-size) * -0.3 + var(--h-s1) * 10px) calc(100% + var(--h-size) * 0.22) !important;
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
    page_background: '#1a110b',
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

// Metallic: a polished chrome bezel around a deep black recessed panel, the
// way a skeuomorphic switch plate is built. Content sits in the recess.
const METAL_PANEL = '#1e2226'; // the recess: palette base (content sits here)
const METAL_INK = '#eef1f4'; // 14:1 on the panel
const METAL_INK_SOFT = '#aeb6bf'; // 7.6:1 on the panel
const METAL_CHROME = '#cfd4da'; // primary: chrome knobs and buttons
const METAL_ON_CHROME = '#14171a'; // 12:1 on chrome
const METAL_STEEL_BLUE = '#8fb3d9'; // accent: cool steel, 7.4:1 on the panel
const METAL_BEZEL = '#c9ced4'; // bezel base
const METAL_EDGE = '#7f8790'; // bezel edge
/** Polished bezel: a vertical light-to-dark-to-light sweep with two soft horizontal reflections. */
const METAL_BEZEL_SHEEN =
  'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.35) 18%, rgba(255, 255, 255, 0) 40%, rgba(0, 0, 0, 0.06) 62%, rgba(255, 255, 255, 0.28) 86%, rgba(255, 255, 255, 0) 100%), linear-gradient(180deg, #f7f9fb 0%, #cfd5db 14%, #a9b1b9 50%, #bfc6cd 80%, #eef1f4 100%)';
const METAL_BEZEL_SHADOW =
  'inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 2px rgba(255, 255, 255, 0.35), 0 1px 0 rgba(255, 255, 255, 0.35), 0 12px 28px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.45)';
const METAL_BEZEL_WIDTH = 12;

/**
 * "Metallic": a polished chrome bezel around a deep black recessed panel,
 * like a skeuomorphic switch plate. The card itself is the bezel (vertical
 * polish sweep, bright top lip, dark bottom lip); a pseudo-element paints
 * the recess inset by the bezel width, with a heavy inner shadow at its top
 * edge and a light lip below it. Content lives in the recess on light text.
 * Controls are chrome with dark type, nested surfaces are deeper wells in
 * the panel, the accent is cool steel. Pill radii throughout.
 */
export const METALLIC_THEME: UcThemeDefinition = {
  id: 'metallic',
  name: 'Metallic',
  version: 3,
  author: 'Ultra Card',
  description:
    'A polished chrome bezel around a deep black recessed panel, like a real switch plate. Chrome controls with dark type, cool steel accents.',
  icon: 'mdi:anvil',
  source: 'builtin',
  tokens: {
    surface: 'glossy',
    radius: 28,
    radius_sm: 16,
    border_width: 1,
    border_color: METAL_EDGE,
    shadow: METAL_BEZEL_SHADOW,
    page_background: 'radial-gradient(ellipse at 50% 0%, #3a4047 0%, #191c20 65%, #111316 100%)',
    pane_background: 'linear-gradient(180deg, #14171a, #1c2024)',
    pane_border: 'none',
    pane_shadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.06), 0 1px 0 rgba(255, 255, 255, 0.08)',
    density: 'regular',
    accent: METAL_STEEL_BLUE,
    font_family: "'Rajdhani', 'Barlow Semi Condensed', 'Roboto Condensed', 'Oswald', system-ui, sans-serif",
    palette: {
      primary: METAL_CHROME,
      on_primary: METAL_ON_CHROME,
      accent: METAL_STEEL_BLUE,
      card_bg: METAL_PANEL,
      text: METAL_INK,
      text_secondary: METAL_INK_SOFT,
      divider: 'rgba(255, 255, 255, 0.12)',
    },
  },
  card: {
    card_background: METAL_PANEL,
    card_border_radius: 28,
    card_border_color: METAL_EDGE,
    card_border_width: 1,
    card_padding: METAL_BEZEL_WIDTH + 14,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(0, 0, 0, 0.4)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 12,
    card_shadow_blur: 28,
    card_shadow_spread: 0,
  },
  modules: {
    button: { style: 'metallic' },
    bar: { bar_style: 'metallic' },
    slider_control: { slider_style: 'metallic' },
    spinbox: { button_style: 'metallic', button_shape: 'circle' },
    popup: { trigger_button_style: 'metallic' },
    grid: { grid_style: 'style_12' },
    navigation: { nav_style: 'uc_minimal' },
    area_summary: { style_preset: 'compact_controls', accent_color: METAL_STEEL_BLUE, tile_border_radius: 14 },
    auto_entity_list: { row_style: 'detailed' },
    unifi: { rack_style: 'dark' },
    activity_feed: { feed_card_style: 'outlined' },
    tabs: { style: 'switch_1' },
  },
  css: `
.card-container {
  position: relative;
  isolation: isolate;
  /* The bezel. */
  background-color: ${METAL_BEZEL} !important;
  background-image: ${METAL_BEZEL_SHEEN} !important;
  border: 1px solid ${METAL_EDGE} !important;
  box-shadow: ${METAL_BEZEL_SHADOW} !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.7);
  letter-spacing: 0.02em;
}
/* The recess: inset by the bezel width, concentric with the bezel's corner. */
.card-container::before {
  content: '';
  position: absolute;
  inset: ${METAL_BEZEL_WIDTH}px;
  z-index: -1;
  border-radius: calc(var(--uc-radius, 28px) - ${METAL_BEZEL_WIDTH}px);
  pointer-events: none;
  background-color: ${METAL_PANEL};
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 30%),
    linear-gradient(180deg, #15181b 0%, #21252a 45%, #2a2f35 100%);
  box-shadow:
    inset 0 3px 8px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(0, 0, 0, 0.9),
    inset 0 -1px 0 rgba(255, 255, 255, 0.07),
    0 1px 0 rgba(255, 255, 255, 0.75),
    0 0 0 1px rgba(0, 0, 0, 0.35);
}
/* Nested surfaces are deeper wells sunk into the panel. */
[style*="--uc-design-surface"] {
  background-image: linear-gradient(180deg, #14171a, #1c2024);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.06), 0 1px 0 rgba(255, 255, 255, 0.08);
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

// Beach props. Each card scatters a few of these along the sand from its seeds:
// a prop shows only when its seed clears a threshold (size collapses to 0
// otherwise), so every card gets a different handful in different places.
const BEACH_CRAB = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 28'>
  <g stroke='${BEACH_CORAL}' stroke-width='2' stroke-linecap='round' fill='none'>
    <path d='M11 20 L5 25 M14 22 L10 27 M26 22 L30 27 M29 20 L35 25 M14 11 L12 4 M26 11 L28 4'/>
  </g>
  <g fill='${BEACH_CORAL}'>
    <ellipse cx='20' cy='16' rx='11' ry='7'/>
    <circle cx='8' cy='9' r='4.5'/><circle cx='32' cy='9' r='4.5'/>
  </g>
  <g fill='${BEACH_SAND}'>
    <path d='M8 4.5 L10.5 9 L5.5 9 Z'/><path d='M32 4.5 L34.5 9 L29.5 9 Z'/>
  </g>
  <circle cx='12' cy='4' r='1.8' fill='${BEACH_SEA}'/><circle cx='28' cy='4' r='1.8' fill='${BEACH_SEA}'/>
  <circle cx='12.5' cy='3.5' r='.6' fill='#fff'/><circle cx='28.5' cy='3.5' r='.6' fill='#fff'/>
  <path d='M16 18 Q20 21 24 18' stroke='${BEACH_SEA}' stroke-width='1.2' fill='none' stroke-linecap='round'/>
</svg>`);
const BEACH_SHELL = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 32'>
  <path d='M18 30 L3 13 A15 15 0 0 1 33 13 Z' fill='#ead1b8' stroke='#b98c72' stroke-width='1.2' stroke-linejoin='round'/>
  <path d='M18 30 L7 8.5 M18 30 L12.5 3.5 M18 30 L18 2.5 M18 30 L23.5 3.5 M18 30 L29 8.5' stroke='#b98c72' stroke-width='1' stroke-linecap='round'/>
  <path d='M3 13 Q7 9 9 12 Q13 5 15 10 Q18 3 21 10 Q23 5 27 12 Q29 9 33 13' fill='none' stroke='#b98c72' stroke-width='1'/>
  <path d='M13 30 L23 30 L21 26.5 L15 26.5 Z' fill='#b98c72'/>
</svg>`);
const BEACH_STARFISH = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
  <path d='M16 2 L19.6 12 L30 12.5 L21.8 19 L24.7 29.5 L16 23.6 L7.3 29.5 L10.2 19 L2 12.5 L12.4 12 Z' fill='#e9a25b' stroke='#c77f3a' stroke-width='1.2' stroke-linejoin='round'/>
  <g fill='#c77f3a'>
    <circle cx='16' cy='8' r='1'/><circle cx='16' cy='13' r='1'/><circle cx='24' cy='14.5' r='1'/><circle cx='8' cy='14.5' r='1'/>
    <circle cx='20.5' cy='22.5' r='1'/><circle cx='11.5' cy='22.5' r='1'/><circle cx='16' cy='17.5' r='1.2'/>
  </g>
</svg>`);
const BEACH_SAND_DOLLAR = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
  <circle cx='12' cy='12' r='11' fill='#efe3cc' stroke='#c8b797' stroke-width='1'/>
  <g fill='none' stroke='#c8b797' stroke-width='1'>
    <ellipse cx='12' cy='7' rx='2' ry='4.5'/>
    <ellipse cx='12' cy='7' rx='2' ry='4.5' transform='rotate(72 12 12)'/>
    <ellipse cx='12' cy='7' rx='2' ry='4.5' transform='rotate(144 12 12)'/>
    <ellipse cx='12' cy='7' rx='2' ry='4.5' transform='rotate(216 12 12)'/>
    <ellipse cx='12' cy='7' rx='2' ry='4.5' transform='rotate(288 12 12)'/>
  </g>
  <circle cx='12' cy='12' r='1.2' fill='#c8b797'/>
</svg>`);

/**
 * "Beach": a sand card with water lapping along the bottom edge, a sun glow
 * near the top-right, fine sand grain across the surface and a rope hairline
 * under the top edge. Each card scatters its own handful of beach finds along
 * the sand from its random seeds (a crab, a scallop shell, a starfish, a sand
 * dollar, each present or not and placed differently per card), and the tide
 * line and sun sit at different heights. All artwork is inline SVG, so nothing
 * is fetched. Deep-water text on sand, an ocean primary, a coral accent, and a
 * soft rounded sans.
 */
export const BEACH_THEME: UcThemeDefinition = {
  id: 'beach',
  name: 'Beach',
  version: 2,
  author: 'Ultra Card',
  description:
    'Sand cards with waves lapping the bottom edge, a sun glow, sand grain and a rope hairline. Every card scatters its own shells, crabs and starfish. Deep-water text, ocean controls, coral accents.',
  icon: 'mdi:beach',
  source: 'builtin',
  tokens: {
    surface: 'flat',
    radius: 22,
    radius_sm: 14,
    border_width: 1,
    border_color: 'rgba(107, 93, 74, 0.28)',
    shadow: '0 10px 26px rgba(31, 58, 77, 0.14), 0 1px 2px rgba(31, 58, 77, 0.08)',
    page_background: 'linear-gradient(180deg, #c8e1ee 0%, #eaf2f4 55%, #e6dbc3 100%)',
    pane_background: 'rgba(255, 255, 255, 0.42)',
    pane_border: '1px solid rgba(107, 93, 74, 0.22)',
    pane_shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
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
  /* This card's stretch of beach, from its seeds. */
  --b-s1: var(--uc-card-seed-1, 0.5);
  --b-s2: var(--uc-card-seed-2, 0.5);
  --b-s3: var(--uc-card-seed-3, 0.5);
  --b-tide: calc(16px + var(--b-s3) * 12px);
  --b-sun-x: calc(60% + var(--b-s1) * 40%);
  /* Each find is on the sand only when its seed clears the bar; otherwise its size collapses to 0. */
  --b-crab: calc(clamp(0, (var(--b-s1) - 0.45) * 20, 1) * 44px);
  --b-shell: calc(clamp(0, (var(--b-s2) - 0.4) * 20, 1) * 34px);
  --b-star: calc(clamp(0, (var(--b-s3) - 0.5) * 20, 1) * 32px);
  --b-dollar: calc(clamp(0, (0.5 - (var(--b-s1) + var(--b-s2)) / 2) * 20, 1) * 22px);
  --b-sand-line: calc(100% - var(--b-tide) - 4px);
  background-color: ${BEACH_SAND} !important;
  /* Layers, top to bottom: the finds on the sand, waves at the foot, rope under the top edge, sun glow, sand grain, sky wash. */
  background-image:
    ${BEACH_CRAB},
    ${BEACH_SHELL},
    ${BEACH_STARFISH},
    ${BEACH_SAND_DOLLAR},
    ${BEACH_WAVES},
    ${BEACH_ROPE},
    radial-gradient(circle at var(--b-sun-x) -8%, rgba(255, 196, 110, 0.55) 0%, rgba(255, 196, 110, 0.18) 18%, rgba(255, 196, 110, 0) 42%),
    ${BEACH_GRAIN},
    linear-gradient(180deg, rgba(24, 106, 122, 0.06) 0%, rgba(24, 106, 122, 0) 45%) !important;
  background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat-x, no-repeat, repeat, no-repeat !important;
  background-size:
    var(--b-crab) calc(var(--b-crab) * 0.7),
    var(--b-shell) calc(var(--b-shell) * 0.9),
    var(--b-star) var(--b-star),
    var(--b-dollar) var(--b-dollar),
    100% var(--b-tide), 12px 6px, auto, 56px 56px, auto !important;
  background-position:
    calc(64% + var(--b-s2) * 34%) var(--b-sand-line),
    calc(3% + var(--b-s3) * 24%) var(--b-sand-line),
    calc(30% + var(--b-s1) * 22%) calc(var(--b-sand-line) - 4px),
    calc(50% + var(--b-s3) * 18%) var(--b-sand-line),
    bottom center, left 9px, 0 0, 0 0, 0 0 !important;
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
 * "Vapor": vaporwave. A midnight-purple card with a striped sunset sun, a
 * cyan perspective grid running off the bottom edge, a faint VHS scanline, a
 * few stars and a pink neon rim. No two cards are the same frame: the card's
 * random seeds place and size the sun, tint and place the haze, set the
 * grid's horizon and scatter the stars. Hot-pink primary with dark text on
 * it, cyan accent, neon-glow controls, a wide techno sans.
 */
export const VAPOR_THEME: UcThemeDefinition = {
  id: 'vapor',
  name: 'Vapor',
  version: 2,
  author: 'Ultra Card',
  description:
    'Vaporwave: midnight purple, a striped sunset sun, a cyan perspective grid, VHS scanlines and a hot-pink neon rim. Every card is a different frame.',
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
    page_background: 'linear-gradient(180deg, #08041a 0%, #180b3a 55%, #2d1058 100%)',
    pane_background: 'rgba(255, 79, 216, 0.08)',
    pane_border: '1px solid rgba(255, 79, 216, 0.35)',
    pane_shadow: '0 0 10px rgba(255, 79, 216, 0.15), inset 0 0 12px rgba(79, 240, 255, 0.06)',
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
  /* This card's frame, from its seeds. */
  --v-s1: var(--uc-card-seed-1, 0.5);
  --v-s2: var(--uc-card-seed-2, 0.5);
  --v-s3: var(--uc-card-seed-3, 0.5);
  --v-sun: calc(88px + var(--v-s3) * 64px);
  --v-sun-x: calc(30% + var(--v-s1) * 70%);
  --v-sun-y: calc(-24px + var(--v-s2) * 18px);
  --v-haze: calc(190 + var(--v-s2) * 130); /* cyan .. violet .. pink */
  --v-haze-x: calc(10% + var(--v-s3) * 80%);
  --v-horizon: calc(48px + var(--v-s2) * 40px);
  --v-sky: hsl(calc(250 + var(--v-s1) * 40) 62% 15%);
  background-color: ${VAPOR_NIGHT} !important;
  /* Layers, top to bottom: grid at the foot, sun, three stars, haze, scanlines, night gradient. */
  background-image:
    ${VAPOR_GRID},
    ${VAPOR_SUN},
    radial-gradient(circle 1.2px at calc(var(--v-s2) * 100%) calc(6% + var(--v-s1) * 30%), rgba(255, 255, 255, 0.9) 0, rgba(255, 255, 255, 0) 100%),
    radial-gradient(circle 1px at calc(var(--v-s3) * 100%) calc(4% + var(--v-s2) * 34%), rgba(255, 255, 255, 0.8) 0, rgba(255, 255, 255, 0) 100%),
    radial-gradient(circle 1.5px at calc(100% - var(--v-s1) * 100%) calc(8% + var(--v-s3) * 26%), rgba(79, 240, 255, 0.9) 0, rgba(79, 240, 255, 0) 100%),
    radial-gradient(ellipse at var(--v-haze-x) 110%, hsl(var(--v-haze) 100% 65% / 0.3) 0%, hsl(var(--v-haze) 100% 65% / 0) 55%),
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.07) 0 1px, rgba(0, 0, 0, 0) 1px 3px),
    linear-gradient(180deg, var(--v-sky) 0%, ${VAPOR_NIGHT} 55%, #0e0821 100%) !important;
  background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat, no-repeat !important;
  background-size: 100% var(--v-horizon), var(--v-sun) var(--v-sun), auto, auto, auto, auto, auto, auto !important;
  background-position: bottom center, var(--v-sun-x) var(--v-sun-y), 0 0, 0 0, 0 0, 0 0, 0 0, 0 0 !important;
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
    page_background: '#f7f3ec',
    pane_background: `linear-gradient(180deg, ${gummy(90, 88)}, ${gummy(92, 78)})`,
    pane_border: 'none',
    pane_shadow: `inset 0 -1px 0 rgba(255, 255, 255, 0.6), inset 0 0 0 2px ${gummy(90, 66, 0.3)}, inset 0 0 12px ${gummy(95, 55, 0.45)}, inset 0 -6px 10px ${gummy(95, 50, 0.4)}, 0 3px 8px ${gummy(80, 40, 0.25)}`,
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

// Wood: a wall of varnished mahogany planks with pale maple controls.
const WOOD_BASE = '#5a3218'; // mahogany (palette base)
const WOOD_INK = '#f3e4c8'; // cream (8.4:1 on mahogany)
const WOOD_INK_SOFT = '#d9bd97'; // sand (5.8:1 on mahogany)
const WOOD_MAPLE = '#e6c08f'; // primary: pale maple controls
const WOOD_ON_MAPLE = '#3a2210'; // 8.7:1 on maple
const WOOD_AMBER = '#e0953f'; // accent: amber indicator (5.2:1 on mahogany)
const WOOD_EDGE = '#2a160a'; // routed edge
const WOOD_PLANK_W = 52;
/**
 * Four planks, tiling both ways. Vertical grain is fractal noise stretched
 * along Y (high X frequency, very low Y frequency): dark figure, paler
 * streaks and a fine pore. Each seam is a dark gap with a lit edge; two
 * knots sit in the field so a sweep of cards shows them in different places.
 */
const WOOD_PLANKS = svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='${WOOD_PLANK_W * 4}' height='600'>
  <defs>
    <filter id='d' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.16 0.0035' numOctaves='4' seed='5' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0.12  0 0 0 0 0.05  0 0 0 0 0.01  1.7 0 0 0 -0.7'/>
    </filter>
    <filter id='l' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.09 0.005' numOctaves='3' seed='13' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.55  0 0 0 0 0.3  1.4 0 0 0 -0.9'/>
    </filter>
    <filter id='p' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9 0.9' numOctaves='1' seed='2' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.3 0 0 0 -0.08'/>
    </filter>
  </defs>
  <rect width='100%' height='100%' fill='${WOOD_BASE}'/>
  <rect width='100%' height='100%' filter='url(#l)'/>
  <rect width='100%' height='100%' filter='url(#d)'/>
  <rect width='100%' height='100%' filter='url(#p)'/>
  <g fill='none' stroke-width='1'>
    <ellipse cx='78' cy='140' rx='5' ry='11' stroke='#2a160a' stroke-opacity='.7'/>
    <ellipse cx='78' cy='140' rx='9' ry='19' stroke='#2a160a' stroke-opacity='.35'/>
    <ellipse cx='78' cy='140' rx='2' ry='5' fill='#2a160a' fill-opacity='.6'/>
    <ellipse cx='182' cy='420' rx='4' ry='9' stroke='#2a160a' stroke-opacity='.7'/>
    <ellipse cx='182' cy='420' rx='8' ry='16' stroke='#2a160a' stroke-opacity='.35'/>
    <ellipse cx='182' cy='420' rx='1.6' ry='4' fill='#2a160a' fill-opacity='.6'/>
  </g>
  <g>
    <rect x='0' y='0' width='2' height='100%' fill='#1a0d05' fill-opacity='.85'/><rect x='2' y='0' width='1' height='100%' fill='#c48a55' fill-opacity='.3'/>
    <rect x='52' y='0' width='2' height='100%' fill='#1a0d05' fill-opacity='.85'/><rect x='54' y='0' width='1' height='100%' fill='#c48a55' fill-opacity='.3'/>
    <rect x='104' y='0' width='2' height='100%' fill='#1a0d05' fill-opacity='.85'/><rect x='106' y='0' width='1' height='100%' fill='#c48a55' fill-opacity='.3'/>
    <rect x='156' y='0' width='2' height='100%' fill='#1a0d05' fill-opacity='.85'/><rect x='158' y='0' width='1' height='100%' fill='#c48a55' fill-opacity='.3'/>
    <rect x='51' y='0' width='1' height='100%' fill='#1a0d05' fill-opacity='.35'/><rect x='103' y='0' width='1' height='100%' fill='#1a0d05' fill-opacity='.35'/>
    <rect x='155' y='0' width='1' height='100%' fill='#1a0d05' fill-opacity='.35'/><rect x='207' y='0' width='1' height='100%' fill='#1a0d05' fill-opacity='.35'/>
  </g>
</svg>`);

/**
 * "Wood": a wall of varnished mahogany planks. Real procedural grain runs
 * down each board, seams are dark gaps with a lit edge, knots sit in the
 * field, and a varnish sheen and vignette sit over the whole card. The
 * planks are offset per card from its seeds, so a column of cards reads as
 * different stretches of the same wall. Controls are pale maple with dark
 * type, the accent an amber indicator, nested surfaces are dark routed
 * recesses. Cream ink, an editorial serif.
 */
export const WOOD_THEME: UcThemeDefinition = {
  id: 'wood',
  name: 'Wood',
  version: 2,
  author: 'Ultra Card',
  description:
    'Varnished mahogany planks with real grain, seams and knots, offset per card. Pale maple controls, amber indicators, routed recesses.',
  icon: 'mdi:tree',
  source: 'builtin',
  tokens: {
    surface: 'neumorphic',
    radius: 12,
    radius_sm: 10,
    border_width: 1,
    border_color: WOOD_EDGE,
    shadow: 'inset 0 1px 0 rgba(255, 200, 140, 0.18), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 10px 24px rgba(20, 8, 2, 0.55)',
    page_background: '#1f120a',
    pane_background: 'linear-gradient(180deg, #24120a 0%, #3b2010 100%)',
    pane_border: `1px solid ${WOOD_EDGE}`,
    pane_shadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.75), inset 0 -1px 0 rgba(255, 200, 140, 0.12), 0 1px 0 rgba(255, 200, 140, 0.16)',
    density: 'regular',
    accent: WOOD_AMBER,
    font_family: "'Lora', 'Merriweather', 'Source Serif 4', Georgia, 'Times New Roman', serif",
    palette: {
      primary: WOOD_MAPLE,
      on_primary: WOOD_ON_MAPLE,
      accent: WOOD_AMBER,
      card_bg: WOOD_BASE,
      text: WOOD_INK,
      text_secondary: WOOD_INK_SOFT,
      divider: 'rgba(243, 228, 200, 0.16)',
    },
  },
  card: {
    card_background: WOOD_BASE,
    card_border_radius: 12,
    card_border_color: WOOD_EDGE,
    card_border_width: 1,
    card_padding: 18,
    card_shadow_enabled: true,
    card_shadow_color: 'rgba(20, 8, 2, 0.55)',
    card_shadow_horizontal: 0,
    card_shadow_vertical: 10,
    card_shadow_blur: 24,
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
    area_summary: { style_preset: 'iconic_soft', accent_color: WOOD_AMBER, tile_border_radius: 10 },
    auto_entity_list: { row_style: 'card' },
    unifi: { rack_style: 'dark' },
    activity_feed: { feed_card_style: 'elevated' },
    tabs: { style: 'simple_3' },
  },
  css: `
.card-container {
  /* Which stretch of the wall this card shows. */
  --w-s1: var(--uc-card-seed-1, 0.5);
  --w-s2: var(--uc-card-seed-2, 0.5);
  background-color: ${WOOD_BASE} !important;
  /* Layers, top to bottom: vignette, varnish sheen, planks. */
  background-image:
    radial-gradient(ellipse 120% 95% at 50% 40%, rgba(0, 0, 0, 0) 55%, rgba(20, 8, 2, 0.5) 100%),
    linear-gradient(180deg, rgba(255, 210, 150, 0.14) 0%, rgba(255, 210, 150, 0) 40%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.16) 100%),
    ${WOOD_PLANKS} !important;
  background-repeat: no-repeat, no-repeat, repeat !important;
  background-size: auto, auto, ${WOOD_PLANK_W * 4}px 600px !important;
  background-position: 0 0, 0 0, calc(var(--w-s1) * ${WOOD_PLANK_W * 4}px) calc(var(--w-s2) * 600px) !important;
  border: 1px solid ${WOOD_EDGE} !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 200, 140, 0.18),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5),
    inset 1px 0 0 rgba(255, 200, 140, 0.06),
    inset -1px 0 0 rgba(0, 0, 0, 0.3),
    0 10px 24px rgba(20, 8, 2, 0.55) !important;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.45);
}
/* Nested surfaces are routed recesses: dark, with a lit lower lip like the slider tracks. */
[style*="--uc-design-surface"] {
  background-image: linear-gradient(180deg, #24120a 0%, #3b2010 100%);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.75), inset 0 -1px 0 rgba(255, 200, 140, 0.12), 0 1px 0 rgba(255, 200, 140, 0.16);
}
`.trim(),
};

// Neumorphism: one material, lit from the top-left. Everything is the same
// colour as the surface it sits on and reads only through two shadows, a
// light one toward the light and a dark one away from it. Raised elements
// extrude, panels recess.
interface NeuPalette {
  surface: string;
  light: string;
  dark: string;
  text: string;
  textSoft: string;
  primary: string;
  onPrimary: string;
  accent: string;
}
const NEU_LIGHT: NeuPalette = {
  surface: '#e4e8ef',
  light: '#ffffff',
  dark: '#b8c2d3',
  text: '#3b4656', // 7.7:1
  textSoft: '#56637a', // 4.9:1
  primary: '#4f63d2', // white on it 5.5:1
  onPrimary: '#ffffff',
  accent: '#4f63d2',
};
const NEU_DARK: NeuPalette = {
  surface: '#2a2e35',
  light: '#3c424c',
  dark: '#131519',
  text: '#e8ecf2', // 11.5:1
  textSoft: '#aab3c2', // 6.5:1
  primary: '#8b9cff', // dark on it 7.5:1
  onPrimary: '#10142a',
  accent: '#8b9cff',
};

function neumorphicTheme(id: string, name: string, icon: string, mode: 'light' | 'dark', c: NeuPalette): UcThemeDefinition {
  // Neumorphism is one material: the theme paints the page in the card
  // colour (page_background) so the card's shadows fall on the same surface
  // they are cut from. A faint 1px rim keeps the edge legible if someone
  // sets a different view background on purpose.
  const rim =
    mode === 'light'
      ? 'inset 1px 1px 0 rgba(255, 255, 255, 0.9), inset -1px -1px 0 rgba(0, 0, 0, 0.08)'
      : 'inset 1px 1px 0 rgba(255, 255, 255, 0.06), inset -1px -1px 0 rgba(0, 0, 0, 0.3)';
  const raised = `${rim}, 10px 10px 22px ${c.dark}, -10px -10px 22px ${c.light}`;
  const raisedSm = `5px 5px 12px ${c.dark}, -5px -5px 12px ${c.light}`;
  const recessed = `inset 5px 5px 10px ${c.dark}, inset -5px -5px 10px ${c.light}`;
  return {
    id,
    name,
    version: 1,
    author: 'Ultra Card',
    description:
      mode === 'light'
        ? 'Soft UI in a pale grey: one material lit from the top-left, raised cards and controls, recessed panels, no lines anywhere.'
        : 'Soft UI in charcoal: one material lit from the top-left, raised cards and controls, recessed panels, no lines anywhere.',
    icon,
    source: 'builtin',
    tokens: {
      surface: 'neumorphic',
      radius: 22,
      radius_sm: 16,
      border_width: 0,
      border_color: 'transparent',
      shadow: raised,
      page_background: c.surface,
      pane_background: c.surface,
      pane_border: 'none',
      pane_shadow: recessed,
      density: 'comfortable',
      accent: c.accent,
      font_family: "'Nunito', 'Poppins', 'Quicksand', 'Varela Round', system-ui, sans-serif",
      palette: {
        primary: c.primary,
        on_primary: c.onPrimary,
        accent: c.accent,
        card_bg: c.surface,
        text: c.text,
        text_secondary: c.textSoft,
        divider: 'transparent',
      },
    },
    card: {
      card_background: c.surface,
      card_border_radius: 22,
      card_border_color: 'transparent',
      card_border_width: 0,
      card_padding: 22,
      card_shadow_enabled: true,
      card_shadow_color: c.dark,
      card_shadow_horizontal: 10,
      card_shadow_vertical: 10,
      card_shadow_blur: 22,
      card_shadow_spread: 0,
    },
    modules: {
      button: { style: 'neumorphic' },
      bar: { bar_style: 'neumorphic' },
      slider_control: { slider_style: 'neumorphic' },
      spinbox: { button_style: 'neumorphic', button_shape: 'circle' },
      popup: { trigger_button_style: 'neumorphic' },
      grid: { grid_style: 'style_19' },
      navigation: { nav_style: 'uc_neumorphic' },
      area_summary: { style_preset: 'iconic_soft', accent_color: c.accent, tile_border_radius: 18 },
      auto_entity_list: { row_style: 'card' },
      unifi: { rack_style: mode === 'light' ? 'light' : 'dark' },
      activity_feed: { feed_card_style: 'flat' },
      tabs: { style: 'switch_2' },
    },
    css: `
.card-container {
  --secondary-background-color: ${c.surface};
  --primary-background-color: ${c.surface};
  --input-fill-color: ${c.surface};
  --mdc-select-fill-color: ${c.surface};
  --mdc-text-field-fill-color: ${c.surface};
  --divider-color: transparent;
  background-color: ${c.surface} !important;
  /* A barely-there sheen toward the light so the slab reads as a solid, not a flat fill. */
  background-image: linear-gradient(145deg, ${c.light}22 0%, ${c.surface}00 45%, ${c.dark}1f 100%) !important;
  border: none !important;
  box-shadow: ${raised} !important;
}
/* Nested surfaces are the same material, recessed into the slab. */
[style*="--uc-design-surface"] {
  background-image: linear-gradient(${c.surface}, ${c.surface});
  border: none;
  box-shadow: ${recessed};
}
/* Hairlines vanish: neumorphism draws edges with light, not lines. */
.card-container hr,
.card-container [class*="divider"],
.card-container [class*="separator"] {
  border-color: transparent;
  background: transparent;
  box-shadow: ${raisedSm};
}
`.trim(),
  };
}

export const NEUMORPHIC_LIGHT_THEME = neumorphicTheme('neumorphic-light', 'Neumorphic Light', 'mdi:white-balance-sunny', 'light', NEU_LIGHT);
export const NEUMORPHIC_DARK_THEME = neumorphicTheme('neumorphic-dark', 'Neumorphic Dark', 'mdi:weather-night', 'dark', NEU_DARK);

export const BUILTIN_THEMES: readonly UcThemeDefinition[] = [
  HA_NATIVE_THEME,
  GLASS_THEME,
  BOLD_THEME,
  MONOCHROME_THEME,
  MATERIAL_THEME,
  NEUMORPHIC_LIGHT_THEME,
  NEUMORPHIC_DARK_THEME,
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
