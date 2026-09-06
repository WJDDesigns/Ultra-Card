/**
 * Shared Hub navigation helpers for cross-tab deep links.
 */
import type { HubTab } from './ultra-card-dashboard-types';

export interface HubNavigateDetail {
  tab: HubTab;
  /** Docs wiki page slug (when tab is docs). */
  slug?: string;
  /** Presets tab sub-view (when tab is presets). */
  presetsView?: 'browse' | 'mine';
}

export const HUB_NAVIGATE_EVENT = 'hub-navigate-tab';

export function dispatchHubNavigate(
  target: EventTarget,
  detail: HubNavigateDetail
): void {
  target.dispatchEvent(
    new CustomEvent(HUB_NAVIGATE_EVENT, {
      detail,
      bubbles: true,
      composed: true,
    })
  );
}

/** Navigate Hub from anywhere in the app (e.g. card editor). */
export function dispatchHubNavigateGlobal(detail: HubNavigateDetail): void {
  if (typeof document !== 'undefined') {
    dispatchHubNavigate(document, detail);
  }
}

export const PENDING_DOCS_SLUG_KEY = 'ultra_card_hub_pending_docs_slug';

export function moduleDocsSlug(moduleType: string): string {
  const t = String(moduleType).toLowerCase().replace(/_/g, '-');
  return t.startsWith('module-') ? t : `module-${t}`;
}

/**
 * Jump to the Hub's Themes tab from anywhere (card editor). Remembers the tab
 * so a cold Hub load lands on it, tells an already-open Hub to switch, and
 * navigates to the panel when it is installed.
 */
export function openHubThemes(hass?: { panels?: Record<string, unknown> } | null): void {
  try {
    localStorage.setItem('ultra_card_hub_tab', 'themes');
  } catch {
    /* ignore */
  }
  dispatchHubNavigateGlobal({ tab: 'themes' });
  const panelInstalled = !!hass?.panels?.['ultra-card-hub'];
  if (panelInstalled && typeof window !== 'undefined' && window.location.pathname !== '/ultra-card-hub') {
    history.pushState(null, '', '/ultra-card-hub');
    window.dispatchEvent(
      new CustomEvent('location-changed', { detail: { replace: false }, bubbles: true, composed: true })
    );
  }
}

export function openHubDocs(slug: string): void {
  try {
    localStorage.setItem(PENDING_DOCS_SLUG_KEY, slug);
    localStorage.setItem('ultra_card_hub_tab', 'docs');
  } catch {
    /* ignore */
  }
  dispatchHubNavigateGlobal({ tab: 'docs', slug });
}
