/**
 * Ultra Dashboard: a Lovelace dashboard strategy that builds a complete
 * sections dashboard from the user's areas, using only Ultra Cards.
 *
 * Home Assistant resolves `strategy: { type: 'custom:ultra-dashboard' }` to
 * the custom element `ll-strategy-dashboard-ultra-dashboard` and passes the
 * whole `strategy` object to its static `generate(config, hass)`.
 */

export type UltraDashboardStyleId = 'classic' | 'soft' | 'glass' | 'bold';

export type UltraDashboardGroupBy = 'area' | 'floor';

export interface UltraDashboardStrategyConfig {
  /** `custom:ultra-dashboard` */
  type: string;
  /** Dashboard title; the create dialog sets this from its title field. */
  title?: string | undefined;
  /** Visual style applied to every generated card. Default `soft`. */
  style?: UltraDashboardStyleId | undefined;
  /** One view per area (default) or one view per floor with a section group per area. */
  group_by?: UltraDashboardGroupBy | undefined;
  /** Only these area ids get a view. Empty or missing means every area. */
  areas?: string[] | undefined;
  /** Areas to leave out (applied after `areas`). */
  exclude_areas?: string[] | undefined;
  /** Generate the Home overview view. Default true. */
  home_view?: boolean | undefined;
  /** Home view blocks. All default to true; a block is skipped when it would be empty. */
  show_people?: boolean | undefined;
  show_alerts?: boolean | undefined;
  show_batteries?: boolean | undefined;
  show_updates?: boolean | undefined;
  /** Weather entity for the Home header. Default: the first `weather.*` entity. */
  weather_entity?: string | undefined;
}

/** `views: [{ strategy: { type: 'custom:ultra-dashboard-area', area: 'kitchen' } }]` */
export interface UltraDashboardAreaViewStrategyConfig {
  type: string;
  area: string;
  style?: UltraDashboardStyleId | undefined;
  title?: string | undefined;
}

/* Minimal shapes of what Home Assistant expects back. Kept local so the
 * strategy chunk does not depend on the frontend's type package. */

export interface LovelaceCardRawConfig {
  type: string;
  grid_options?: { columns?: number | 'full'; rows?: number | 'auto' } | undefined;
  [key: string]: unknown;
}

export interface LovelaceSectionRawConfig {
  type: 'grid';
  cards: LovelaceCardRawConfig[];
  column_span?: number | undefined;
}

export interface LovelaceViewRawConfig {
  title?: string | undefined;
  path?: string | undefined;
  icon?: string | undefined;
  type?: 'sections' | undefined;
  max_columns?: number | undefined;
  dense_section_placement?: boolean | undefined;
  sections?: LovelaceSectionRawConfig[] | undefined;
  strategy?: Record<string, unknown> | undefined;
}

export interface LovelaceDashboardRawConfig {
  title?: string | undefined;
  views: LovelaceViewRawConfig[];
}

/** Registration entry for `window.customStrategies` (Home Assistant 2026.5+). */
export interface CustomStrategyEntry {
  type: string;
  strategyType: 'dashboard';
  name?: string | undefined;
  description?: string | undefined;
  documentationURL?: string | undefined;
  /**
   * 160x160 preview per theme mode, like the built-in strategy tiles. Not read
   * by Home Assistant yet (proposed upstream); harmless until it is.
   */
  images?: { light: string; dark: string } | undefined;
}

declare global {
  interface Window {
    customStrategies?: CustomStrategyEntry[] | undefined;
  }
}
