/**
 * Shared Hub navigation helpers for cross-tab deep links.
 */
import type { HubTab } from './ultra-card-dashboard-types';

export interface HubNavigateDetail {
  tab: HubTab;
  /** Docs wiki page slug (when tab is docs). */
  slug?: string;
  /** Account group sub-tab: account | pro */
  accountView?: 'account' | 'pro';
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

export function openHubDocs(slug: string): void {
  try {
    localStorage.setItem(PENDING_DOCS_SLUG_KEY, slug);
    localStorage.setItem('ultra_card_hub_tab', 'docs');
  } catch {
    /* ignore */
  }
  dispatchHubNavigateGlobal({ tab: 'docs', slug });
}

export function tabToGroup(tab: HubTab): 'home' | 'library' | 'account' | 'help' {
  if (tab === 'dashboard') return 'home';
  if (tab === 'account' || tab === 'pro') return 'account';
  if (tab === 'docs' || tab === 'about') return 'help';
  return 'library';
}
