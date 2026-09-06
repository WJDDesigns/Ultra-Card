import type { AreaSummaryStylePreset, AutoEntityListRowStyle, UltraCardConfig } from '../types';
import type { UltraDashboardStyleId } from './types';

/**
 * A dashboard style is the card chrome every generated card starts from plus
 * the per-module presets that read best with it. Users pick one in the
 * strategy editor; after "take control" each card keeps these values and can
 * be restyled individually in the Ultra Card editor.
 */
export interface UltraDashboardStyle {
  id: UltraDashboardStyleId;
  name: string;
  description: string;
  icon: string;
  /** Chrome for content cards. */
  card: Partial<UltraCardConfig>;
  /** Room tile look for `area_summary`. */
  areaSummaryPreset: AreaSummaryStylePreset;
  /** Row look for `auto_entity_list`. */
  listRowStyle: AutoEntityListRowStyle;
  /** Accent colour handed to modules that take one (`accent_color`). */
  accent?: string | undefined;
  /**
   * Per-room accents, cycled in area order, when the style has no single
   * accent. Gives each room page its own colour so a home does not read as
   * the same page repeated.
   */
  roomPalette?: readonly string[] | undefined;
  /** Slider look for `slider_control`. */
  sliderStyle: 'flat' | 'glass' | 'neumorphic' | 'minimal' | 'glossy';
  /** Level-bar look for environment readings. */
  barStyle:
    | 'flat'
    | 'glossy'
    | 'glass'
    | 'neumorphic'
    | 'minimal'
    | 'neon-glow'
    | 'gradient-overlay';
}

/**
 * Eight accents that sit well together on light and dark themes. Chosen from
 * the HA colour palette so they never fight the theme's own primary.
 */
export const ROOM_PALETTE: readonly string[] = [
  '#4F8DF7', // blue
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#F97316', // orange
  '#06B6D4', // cyan
];

const CLASSIC_CHROME: Partial<UltraCardConfig> = {
  card_background: 'var(--card-background-color, var(--ha-card-background, white))',
  card_border_radius: 12,
  card_border_color: 'var(--divider-color)',
  card_border_width: 1,
  card_padding: 16,
};

export const ULTRA_DASHBOARD_STYLES: readonly UltraDashboardStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Matches the standard Home Assistant card look of your theme.',
    icon: 'mdi:view-dashboard-outline',
    card: CLASSIC_CHROME,
    areaSummaryPreset: 'compact_controls',
    listRowStyle: 'compact',
    roomPalette: ROOM_PALETTE,
    sliderStyle: 'flat',
    barStyle: 'flat',
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Rounded corners, no borders, a light shadow. Calm and modern.',
    icon: 'mdi:rounded-corner',
    card: {
      card_background: 'var(--card-background-color, var(--ha-card-background, white))',
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
    areaSummaryPreset: 'iconic_soft',
    listRowStyle: 'compact',
    roomPalette: ROOM_PALETTE,
    sliderStyle: 'neumorphic',
    barStyle: 'glossy',
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Translucent panels with a fine border. Made for wallpaper backgrounds.',
    icon: 'mdi:blur',
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
    areaSummaryPreset: 'graph_glow',
    listRowStyle: 'slim',
    roomPalette: ROOM_PALETTE,
    sliderStyle: 'glass',
    barStyle: 'neon-glow',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Large radius, deep shadow and your theme accent on every room.',
    icon: 'mdi:palette',
    card: {
      card_background: 'var(--card-background-color, var(--ha-card-background, white))',
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
    areaSummaryPreset: 'graph_glow',
    listRowStyle: 'card',
    accent: 'var(--primary-color)',
    sliderStyle: 'glossy',
    barStyle: 'gradient-overlay',
  },
];

export const DEFAULT_DASHBOARD_STYLE: UltraDashboardStyleId = 'soft';

export function getDashboardStyle(id: string | undefined | null): UltraDashboardStyle {
  return (
    ULTRA_DASHBOARD_STYLES.find(s => s.id === id) ??
    ULTRA_DASHBOARD_STYLES.find(s => s.id === DEFAULT_DASHBOARD_STYLE)!
  );
}
