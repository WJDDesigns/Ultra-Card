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
  /** Themes tab sub-view (when tab is themes). */
  themesView?: 'browse' | 'mine';
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

/**
 * Module types whose wiki page is named differently from the type, or that
 * share one page (all the input modules are documented together).
 */
const MODULE_DOCS_ALIASES: Record<string, string> = {
  auto_entity_list: 'module-auto-entities-list',
  external_card: 'module-3rd-party-card',
  video_bg: 'module-video-background',
  boolean_input: 'module-input-modules',
  button_input: 'module-input-modules',
  color_input: 'module-input-modules',
  counter_input: 'module-input-modules',
  datetime_input: 'module-input-modules',
  number_input: 'module-input-modules',
  select_input: 'module-input-modules',
  slider_input: 'module-input-modules',
  text_input: 'module-input-modules',
};

/** Wiki page listing every module; used when a module has no page of its own. */
export const MODULES_OVERVIEW_SLUG = 'modules-overview';

export function moduleDocsSlug(moduleType: string): string {
  const raw = String(moduleType).toLowerCase();
  if (MODULE_DOCS_ALIASES[raw]) return MODULE_DOCS_ALIASES[raw];
  const t = raw.replace(/_/g, '-');
  return t.startsWith('module-') ? t : `module-${t}`;
}

/** Docs served by Ultra Card Connect next to the Hub panel. */
export const HUB_DOCS_BASE = '/ultra_card_pro_cloud_panel/docs';
export const HUB_PANEL_PATH = '/ultra-card-hub';
/** Public wiki, for installs without the Hub (no Ultra Card Connect). */
export const PUBLIC_DOCS_URL = 'https://github.com/WJDDesigns/Ultra-Card/wiki';

let docsSlugsPromise: Promise<Set<string> | null> | null = null;

function loadDocsSlugs(): Promise<Set<string> | null> {
  if (!docsSlugsPromise) {
    docsSlugsPromise = fetch(`${HUB_DOCS_BASE}/index.json?v=1`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: { pages?: { slug?: string }[] } | null) => {
        if (!data?.pages) return null;
        return new Set(data.pages.map(p => String(p.slug || '')).filter(Boolean));
      })
      .catch(() => null)
      .then(set => {
        if (!set) docsSlugsPromise = null; // try again next click
        return set;
      });
  }
  return docsSlugsPromise;
}

/** Test hook. */
export function _resetDocsSlugCache(): void {
  docsSlugsPromise = null;
}

/**
 * Pick the docs page to open: the slug itself when the wiki has it, the
 * modules overview for a module without its own page, otherwise home.
 * Unknown (index unreachable) keeps the slug; the Hub copes with it.
 */
export function resolveDocsSlug(slug: string, available: Set<string> | null): string {
  if (!available || available.has(slug)) return slug;
  if (slug.startsWith('module-') && available.has(MODULES_OVERVIEW_SLUG)) {
    return MODULES_OVERVIEW_SLUG;
  }
  return available.has('home') ? 'home' : slug;
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(fallback), ms);
    p.then(
      v => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

/** True inside the Home Assistant Companion app (new windows leave the app). */
function isCompanionApp(): boolean {
  const w = window as unknown as {
    externalApp?: unknown;
    webkit?: { messageHandlers?: { getExternalAuth?: unknown } };
  };
  return !!(w.externalApp || w.webkit?.messageHandlers?.getExternalAuth);
}

function navigateSameTab(path: string): void {
  if (window.location.pathname === path) return;
  history.pushState(null, '', path);
  window.dispatchEvent(
    new CustomEvent('location-changed', { detail: { replace: false }, bubbles: true, composed: true })
  );
}

/**
 * Jump to the Hub's Themes tab from anywhere (card editor). Remembers the tab
 * so a cold Hub load lands on it, tells an already-open Hub to switch, and
 * navigates to the panel when it is installed.
 */
export function openHubThemes(
  hass?: { panels?: Record<string, unknown> } | null,
  view: 'browse' | 'mine' = 'browse'
): void {
  try {
    localStorage.setItem('ultra_card_hub_tab', 'themes');
  } catch {
    /* ignore */
  }
  dispatchHubNavigateGlobal({ tab: 'themes', themesView: view });
  const panelInstalled = !!hass?.panels?.['ultra-card-hub'];
  if (panelInstalled && typeof window !== 'undefined' && window.location.pathname !== '/ultra-card-hub') {
    history.pushState(null, '', '/ultra-card-hub');
    window.dispatchEvent(
      new CustomEvent('location-changed', { detail: { replace: false }, bubbles: true, composed: true })
    );
  }
}

/**
 * Open a Hub docs page from anywhere (card editor, About tab).
 *
 * The card editor lives in a dialog on a dashboard, where no Hub panel is
 * listening, so only firing the navigate event did nothing. Now:
 * - Hub already open in this tab: switch it to the page.
 * - Hub installed: open it in a new browser tab so unsaved card edits stay
 *   put (same tab inside the Companion app, or if the popup is blocked).
 * - No Hub (Connect not installed): open the public wiki.
 */
export async function openHubDocs(
  slug: string,
  hass?: { panels?: Record<string, unknown> } | null
): Promise<void> {
  const panelInstalled = hass ? !!hass.panels?.['ultra-card-hub'] : true;
  if (!panelInstalled) {
    window.open(PUBLIC_DOCS_URL, '_blank', 'noopener');
    return;
  }

  const target = resolveDocsSlug(slug, await withTimeout(loadDocsSlugs(), 1500, null));
  try {
    localStorage.setItem(PENDING_DOCS_SLUG_KEY, target);
    localStorage.setItem('ultra_card_hub_tab', 'docs');
  } catch {
    /* ignore */
  }
  dispatchHubNavigateGlobal({ tab: 'docs', slug: target });

  if (typeof window === 'undefined' || window.location.pathname === HUB_PANEL_PATH) return;

  if (isCompanionApp()) {
    navigateSameTab(HUB_PANEL_PATH);
    return;
  }
  const win = window.open(HUB_PANEL_PATH, '_blank');
  if (win) {
    try {
      win.opener = null;
    } catch {
      /* ignore */
    }
  } else {
    navigateSameTab(HUB_PANEL_PATH);
  }
}
