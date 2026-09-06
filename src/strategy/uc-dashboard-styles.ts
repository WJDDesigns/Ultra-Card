import type { AreaSummaryStylePreset, AutoEntityListRowStyle, UltraCardConfig } from '../types';
import type { UltraDashboardStyleId } from './types';
import type { UcThemeDefinition } from '../themes/uc-theme-types';
import {
  BOLD_THEME,
  CLASSIC_THEME,
  GLASS_THEME,
  MATERIAL_THEME,
  MONOCHROME_THEME,
  SOFT_THEME,
} from '../themes/builtin-themes';

/**
 * A dashboard style is a built-in Ultra Card theme plus the generation-time
 * choices (room palette) that live outside a theme. Generated cards carry
 * `uc_theme: <id>` rather than baked chrome, so after "take control" the
 * whole dashboard still follows the theme and can be re-themed in one place.
 *
 * The flattened `card` / preset fields are kept for callers that want to know
 * what the theme will resolve to (tests, previews).
 */
export interface UltraDashboardStyle {
  id: UltraDashboardStyleId;
  name: string;
  description: string;
  icon: string;
  /** Built-in theme id written to every generated card as `uc_theme`. */
  themeId: string;
  /** Chrome the theme resolves to for content cards. */
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
  sliderStyle: 'flat' | 'glass' | 'neumorphic' | 'minimal' | 'glossy' | 'outline';
  /** Level-bar look for environment readings. */
  barStyle:
    | 'flat'
    | 'glossy'
    | 'glass'
    | 'neumorphic'
    | 'minimal'
    | 'neon-glow'
    | 'gradient-overlay'
    | 'outline';
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

function fromTheme(
  id: UltraDashboardStyleId,
  theme: UcThemeDefinition,
  opts: { roomPalette?: readonly string[] | undefined; accent?: string | undefined }
): UltraDashboardStyle {
  const m = theme.modules ?? {};
  return {
    id,
    name: theme.name,
    description: theme.description ?? '',
    icon: theme.icon ?? 'mdi:palette',
    themeId: theme.id,
    card: { ...(theme.card ?? {}) },
    areaSummaryPreset: (m.area_summary?.style_preset as AreaSummaryStylePreset) ?? 'compact_controls',
    listRowStyle: (m.auto_entity_list?.row_style as AutoEntityListRowStyle) ?? 'compact',
    sliderStyle: (m.slider_control?.slider_style as UltraDashboardStyle['sliderStyle']) ?? 'flat',
    barStyle: (m.bar?.bar_style as UltraDashboardStyle['barStyle']) ?? 'flat',
    accent: opts.accent ?? theme.tokens.accent,
    roomPalette: opts.roomPalette,
  };
}

export const ULTRA_DASHBOARD_STYLES: readonly UltraDashboardStyle[] = [
  fromTheme('classic', CLASSIC_THEME, { roomPalette: ROOM_PALETTE }),
  fromTheme('soft', SOFT_THEME, { roomPalette: ROOM_PALETTE }),
  fromTheme('glass', GLASS_THEME, { roomPalette: ROOM_PALETTE }),
  fromTheme('bold', BOLD_THEME, {}),
  fromTheme('monochrome', MONOCHROME_THEME, {}),
  fromTheme('material', MATERIAL_THEME, { roomPalette: ROOM_PALETTE }),
];

export const DEFAULT_DASHBOARD_STYLE: UltraDashboardStyleId = 'soft';

export function getDashboardStyle(id: string | undefined | null): UltraDashboardStyle {
  return (
    ULTRA_DASHBOARD_STYLES.find(s => s.id === id) ??
    ULTRA_DASHBOARD_STYLES.find(s => s.id === DEFAULT_DASHBOARD_STYLE)!
  );
}
