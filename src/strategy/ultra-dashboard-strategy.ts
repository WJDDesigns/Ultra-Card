import type { HomeAssistant } from 'custom-card-helpers';
import { reportChunkLoadFailure } from '../utils/uc-chunk-load-error';
import {
  ULTRA_DASHBOARD_PREVIEW_DARK,
  ULTRA_DASHBOARD_PREVIEW_LIGHT,
} from './uc-dashboard-preview-images';
import type {
  LovelaceDashboardRawConfig,
  LovelaceViewRawConfig,
  UltraDashboardAreaViewStrategyConfig,
  UltraDashboardStrategyConfig,
} from './types';

/**
 * Entry-side registration of the Ultra Dashboard strategy.
 *
 * Home Assistant looks the strategy up by custom element name as soon as a
 * dashboard using it is opened, so the elements are defined here, in the entry
 * bundle. Everything they do (registry walk, card composition, the config
 * editor) lives in the `strategy` chunk and is fetched on first use.
 */

export const ULTRA_DASHBOARD_STRATEGY_TYPE = 'ultra-dashboard';
export const ULTRA_DASHBOARD_AREA_VIEW_TYPE = 'ultra-dashboard-area';
export const ULTRA_DASHBOARD_DOCS_URL =
  'https://github.com/WJDDesigns/Ultra-Card/blob/main/docs/ultra-dashboard.md';

type StrategyImpl = typeof import('./uc-dashboard-strategy-impl');

let loadPromise: Promise<StrategyImpl> | undefined;

export function loadUltraDashboardStrategy(): Promise<StrategyImpl> {
  if (!loadPromise) {
    loadPromise = import(/* webpackChunkName: "strategy" */ './uc-dashboard-strategy-impl').catch(
      err => {
        loadPromise = undefined;
        reportChunkLoadFailure(err, 'dashboard strategy');
        throw err;
      }
    );
  }
  return loadPromise;
}

/** Test-only: clear the memoized promise between tests. */
export function __resetUltraDashboardStrategyLoaderForTests(): void {
  loadPromise = undefined;
}

export class UltraDashboardStrategy extends HTMLElement {
  /**
   * Show the config editor (style, areas, options) before the name/URL step.
   * Every option has a default, so "Next" straight away also works, but the
   * style choice is the point of the dashboard and it belongs up front.
   */
  static configRequired = true;

  static getCreateSuggestions(_hass?: HomeAssistant): { title: string; icon: string } {
    return { title: 'Ultra Dashboard', icon: 'mdi:view-dashboard-variant' };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await loadUltraDashboardStrategy();
    return document.createElement('ultra-dashboard-strategy-editor');
  }

  static async generate(
    config: UltraDashboardStrategyConfig,
    hass: HomeAssistant
  ): Promise<LovelaceDashboardRawConfig> {
    const impl = await loadUltraDashboardStrategy();
    return impl.generateUltraDashboard(config, hass);
  }
}

export class UltraDashboardAreaViewStrategy extends HTMLElement {
  static async generate(
    config: UltraDashboardAreaViewStrategyConfig,
    hass: HomeAssistant
  ): Promise<LovelaceViewRawConfig> {
    const impl = await loadUltraDashboardStrategy();
    return impl.generateUltraAreaView(config, hass);
  }
}

export function registerUltraDashboardStrategy(): void {
  const dashboardTag = `ll-strategy-dashboard-${ULTRA_DASHBOARD_STRATEGY_TYPE}`;
  const viewTag = `ll-strategy-view-${ULTRA_DASHBOARD_AREA_VIEW_TYPE}`;
  if (!customElements.get(dashboardTag))
    customElements.define(dashboardTag, UltraDashboardStrategy);
  if (!customElements.get(viewTag)) customElements.define(viewTag, UltraDashboardAreaViewStrategy);

  window.customStrategies = window.customStrategies || [];
  if (!window.customStrategies.some(s => s.type === ULTRA_DASHBOARD_STRATEGY_TYPE)) {
    window.customStrategies.push({
      type: ULTRA_DASHBOARD_STRATEGY_TYPE,
      strategyType: 'dashboard',
      name: 'Ultra Dashboard',
      description:
        'A complete dashboard built from your areas and floors with Ultra Card. Pick a style, take control, and edit every card visually.',
      documentationURL: ULTRA_DASHBOARD_DOCS_URL,
      // Not read by Home Assistant's dialog yet (proposed upstream, mirrors
      // the built-in strategies' `images` shape); lights up when it is.
      images: { light: ULTRA_DASHBOARD_PREVIEW_LIGHT, dark: ULTRA_DASHBOARD_PREVIEW_DARK },
    });
  }
}
