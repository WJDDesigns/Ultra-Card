import { describe, expect, it } from 'vitest';
import { moduleDocsSlug, resolveDocsSlug, MODULES_OVERVIEW_SLUG } from '../hub-navigation';

describe('moduleDocsSlug', () => {
  it('maps plain types to module-* slugs', () => {
    expect(moduleDocsSlug('slider_control')).toBe('module-slider-control');
    expect(moduleDocsSlug('drawer')).toBe('module-drawer');
  });
  it('uses aliases for types whose page is named differently', () => {
    expect(moduleDocsSlug('external_card')).toBe('module-3rd-party-card');
    expect(moduleDocsSlug('auto_entity_list')).toBe('module-auto-entities-list');
    expect(moduleDocsSlug('video_bg')).toBe('module-video-background');
    expect(moduleDocsSlug('text_input')).toBe('module-input-modules');
  });
});

describe('resolveDocsSlug', () => {
  const pages = new Set(['home', MODULES_OVERVIEW_SLUG, 'module-text']);
  it('keeps slugs that exist', () => {
    expect(resolveDocsSlug('module-text', pages)).toBe('module-text');
  });
  it('falls back to the modules overview for modules without a page', () => {
    expect(resolveDocsSlug('module-drawer', pages)).toBe(MODULES_OVERVIEW_SLUG);
  });
  it('falls back to home for other missing pages', () => {
    expect(resolveDocsSlug('nope', pages)).toBe('home');
  });
  it('keeps the slug when the index could not be loaded', () => {
    expect(resolveDocsSlug('module-drawer', null)).toBe('module-drawer');
  });
});

describe('openHubDocs', () => {
  it('opens the Hub in a new tab on the resolved page', async () => {
    const { openHubDocs, _resetDocsSlugCache, PENDING_DOCS_SLUG_KEY } = await import(
      '../hub-navigation'
    );
    _resetDocsSlugCache();
    const opened: string[] = [];
    const origOpen = window.open;
    const origFetch = globalThis.fetch;
    window.open = ((url: string) => {
      opened.push(url);
      return {} as Window;
    }) as typeof window.open;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ pages: [{ slug: 'home' }, { slug: 'modules-overview' }] }), {
        status: 200,
      })) as typeof fetch;
    try {
      await openHubDocs('module-drawer', { panels: { 'ultra-card-hub': {} } });
      expect(opened).toEqual(['/ultra-card-hub']);
      expect(localStorage.getItem(PENDING_DOCS_SLUG_KEY)).toBe('modules-overview');

      opened.length = 0;
      await openHubDocs('module-drawer', { panels: {} });
      expect(opened).toEqual(['https://github.com/WJDDesigns/Ultra-Card/wiki']);
    } finally {
      window.open = origOpen;
      globalThis.fetch = origFetch;
    }
  });
});
