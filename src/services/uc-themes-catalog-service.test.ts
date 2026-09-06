import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ucThemesCatalogService } from './uc-themes-catalog-service';
import { ucThemeService } from './uc-theme-service';

const entry = (overrides: Record<string, unknown> = {}) => ({
  id: 42,
  catalog_id: 'wp-frosted',
  slug: 'frosted',
  name: 'Frosted',
  description: 'Glass everywhere',
  tags: ['glass', 'dark'],
  author: 'WJD Designs',
  source: 'official',
  downloads: 7,
  version: 2,
  date: '2026-01-01 00:00:00',
  modified: '2026-02-01 00:00:00',
  preview: 'https://ultracard.io/p.png',
  definition: {
    id: 'wp-frosted',
    name: 'Frosted',
    version: 2,
    tokens: { surface: 'glass', radius: 18 },
    css: '.card-container { padding: 2px; } .x { background: url(http://evil) }',
  },
  ...overrides,
});

function mockFetch(body: unknown, ok = true) {
  const fn = vi.fn(async () => ({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Server Error',
    json: async () => body,
  }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  localStorage.clear();
  ucThemesCatalogService.clearCache();
  for (const t of ucThemeService.getLibraryThemes()) ucThemeService.removeFromLibrary(t.id);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ucThemesCatalogService', () => {
  it('normalises the REST payload and sanitises definitions', async () => {
    mockFetch({ themes: [entry()], total: 1, total_pages: 1, page: 1 });
    const page = await ucThemesCatalogService.fetchThemes();
    expect(page.total).toBe(1);
    const t = page.themes[0];
    expect(t.catalogId).toBe('wp-frosted');
    expect(t.source).toBe('official');
    expect(t.version).toBe(2);
    expect(t.definition.id).toBe('wp-frosted');
    expect(t.definition.source).toBe('official');
    // url() in css is refused by the sanitiser and surfaced as a warning
    expect(t.definition.css).toBeUndefined();
    expect(t.warnings.some(w => w.includes('css dropped'))).toBe(true);
  });

  it('drops entries whose definition cannot be trusted', async () => {
    mockFetch({ themes: [entry({ definition: { name: 'no tokens' } }), entry({ id: 43, catalog_id: 'wp-ok', definition: { id: 'wp-ok', name: 'Ok', tokens: { surface: 'flat', radius: 4 } } })] });
    const page = await ucThemesCatalogService.fetchThemes();
    expect(page.themes.map(t => t.catalogId)).toEqual(['wp-ok']);
  });

  it('serves the second call from cache', async () => {
    const fn = mockFetch({ themes: [entry()] });
    await ucThemesCatalogService.fetchThemes({ orderby: 'downloads' });
    await ucThemesCatalogService.fetchThemes({ orderby: 'downloads' });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('falls back to stale cache when the network fails', async () => {
    mockFetch({ themes: [entry()] });
    await ucThemesCatalogService.fetchThemes();
    // Expire the fresh window but stay inside the stale one.
    const key = Object.keys(localStorage).find(k => k.startsWith('ultra-card-themes-v1:'))!;
    const stored = JSON.parse(localStorage.getItem(key)!);
    stored.timestamp = Date.now() - 10 * 60 * 1000;
    localStorage.setItem(key, JSON.stringify(stored));
    (ucThemesCatalogService as any)._memory.clear();

    mockFetch({ error: true }, false);
    const page = await ucThemesCatalogService.fetchThemes();
    expect(page.themes[0]?.catalogId).toBe('wp-frosted');
  });

  it('install copies into the library, reports state, and counts a download once', async () => {
    const fn = mockFetch({ themes: [entry()] });
    const [t] = (await ucThemesCatalogService.fetchThemes()).themes;
    expect(ucThemesCatalogService.installState(t)).toBe('not_installed');

    const saved = ucThemesCatalogService.install(t);
    expect(saved?.id).toBe('wp-frosted');
    expect(ucThemeService.getTheme('wp-frosted')?.source).toBe('official');
    expect(ucThemesCatalogService.installState(t)).toBe('installed');
    // One catalog GET + one track-download POST
    expect(fn).toHaveBeenCalledTimes(2);
    expect(String((fn.mock.calls[1] as unknown[])[0])).toContain('/themes/42/track-download');

    ucThemesCatalogService.install(t);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('flags an update when the catalog version is newer than the installed one', async () => {
    mockFetch({ themes: [entry()] });
    const [t] = (await ucThemesCatalogService.fetchThemes()).themes;
    ucThemeService.saveToLibrary({ ...t.definition, version: 1 }, { source: 'official' });
    expect(ucThemesCatalogService.installState(t)).toBe('update_available');
  });
});
