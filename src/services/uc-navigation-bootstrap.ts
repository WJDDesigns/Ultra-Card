/**
 * Brings back "All views" and "Current dashboard only" navbars after a page reload.
 *
 * A navbar is registered by the Ultra Card that holds it. Home Assistant only
 * builds the cards of the view on screen, so reloading the browser on any other
 * view left the dashboard without its navbar until the user visited the card's
 * view again (larrysansan, Oct 31 2026).
 *
 * The card remembers, per browser, which dashboards hold such a navbar. On page
 * load this reads those dashboards' saved config, finds their navigation
 * modules and registers them as if the card had rendered. Reading the config
 * (rather than caching the module) keeps it in step with edits and deletions.
 */
import type { HomeAssistant } from '../ha/types';
import type { CardModule, UltraCardConfig } from '../types';
import { lazyNavigationService } from './uc-heavy-services';

const STORAGE_KEY = 'uc-nav-dashboards-v1';
/** cardId used for navbars restored from the dashboard config. */
export const RESTORED_NAV_CARD_ID = 'uc-restored';

type NavScope = 'all_views' | 'current_dashboard' | 'current_view';

/** Dashboard part of an HA path: "/lovelace-home/2" → "lovelace-home". */
function dashboardKeyOf(pathname: string): string {
  return (pathname || '').split('/').filter(Boolean)[0] || '';
}

function readDashboards(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeDashboards(list: string[]): void {
  try {
    if (list.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked: the navbar just shows once its card renders, as before */
  }
}

/** Called when a card registers a navbar that should outlive its own view. */
export function rememberNavigationDashboard(scope: NavScope | undefined): void {
  if (typeof window === 'undefined') return;
  if ((scope || 'all_views') === 'current_view') return;
  const key = dashboardKeyOf(window.location.pathname);
  if (!key || key === 'config' || key === 'developer-tools') return;
  const list = readDashboards();
  if (!list.includes(key)) writeDashboards([...list, key]);
}

/** Ultra Card configs anywhere in a dashboard config (views, sections, stacks, grids). */
function collectUltraCards(node: unknown, out: UltraCardConfig[], depth = 0): void {
  if (!node || typeof node !== 'object' || depth > 40) return;
  if (Array.isArray(node)) {
    for (const item of node) collectUltraCards(item, out, depth + 1);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (obj.type === 'custom:ultra-card' && obj.layout) {
    out.push(obj as unknown as UltraCardConfig);
    return;
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') collectUltraCards(value, out, depth + 1);
  }
}

/** Navigation modules anywhere in a card layout, nested layouts included. */
function collectNavigationModules(node: unknown, out: CardModule[], depth = 0): void {
  if (!node || typeof node !== 'object' || depth > 40) return;
  if (Array.isArray(node)) {
    for (const item of node) collectNavigationModules(item, out, depth + 1);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (obj.type === 'navigation' && typeof obj.id === 'string') {
    out.push(obj as unknown as CardModule);
    return;
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') collectNavigationModules(value, out, depth + 1);
  }
}

async function waitForHass(timeoutMs = 20000): Promise<HomeAssistant | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const hass = (document.querySelector('home-assistant') as { hass?: HomeAssistant } | null)?.hass;
    if (hass?.connection && hass.user) return hass;
    await new Promise(r => setTimeout(r, 300));
  }
  return null;
}

let started = false;

/** Restore remembered navbars once per page load. Safe to call more than once. */
export function restoreRememberedNavigation(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  const dashboards = readDashboards();
  if (!dashboards.length) return;
  void (async () => {
    const hass = await waitForHass();
    if (!hass) return;
    const current = dashboardKeyOf(window.location.pathname);
    const stillUsed: string[] = [];
    const found: Array<{ module: CardModule; config: UltraCardConfig; dashboard: string }> = [];

    for (const dashboard of dashboards) {
      let lovelace: unknown;
      try {
        lovelace = await (hass as any).callWS({
          type: 'lovelace/config',
          url_path: dashboard === 'lovelace' ? null : dashboard,
        });
      } catch {
        // Dashboard gone, or not readable for this user: keep it unless it's clearly gone.
        stillUsed.push(dashboard);
        continue;
      }
      const cards: UltraCardConfig[] = [];
      collectUltraCards(lovelace, cards);
      let any = false;
      for (const config of cards) {
        const modules: CardModule[] = [];
        collectNavigationModules(config.layout, modules);
        for (const module of modules) {
          const scope = ((module as any).nav_scope || 'all_views') as NavScope;
          if (scope === 'current_view') continue;
          any = true;
          // "Current dashboard only" navbars just matter on their own dashboard.
          if (scope === 'current_dashboard' && dashboard !== current) continue;
          found.push({ module, config, dashboard });
        }
      }
      if (any) stillUsed.push(dashboard);
    }

    if (stillUsed.length !== dashboards.length) writeDashboards(stillUsed);
    if (!found.length) return;

    const svc = await lazyNavigationService.load();
    for (const { module, config, dashboard } of found) {
      svc.registerRestoredModule(RESTORED_NAV_CARD_ID, module.id, module as any, hass, config, dashboard);
    }
  })().catch(err => console.warn('Ultra Card: could not restore the navigation bar', err));
}
