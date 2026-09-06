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

export const BUILTIN_THEMES: readonly UcThemeDefinition[] = [
  HA_NATIVE_THEME,
  CLASSIC_THEME,
  SOFT_THEME,
  GLASS_THEME,
  BOLD_THEME,
  MONOCHROME_THEME,
  MATERIAL_THEME,
];
