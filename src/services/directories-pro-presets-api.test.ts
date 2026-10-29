import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DirectoriesProPresetsAPI } from './directories-pro-presets-api';

const okCatalog = () =>
  new Response(JSON.stringify({ presets: [], total: 0, pages: 1 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('DirectoriesProPresetsAPI load on ultracard.io', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shares one request between concurrent callers and then serves the cache', async () => {
    fetchMock.mockImplementation(async () => okCatalog());
    const api = new DirectoriesProPresetsAPI();

    await Promise.all([api.fetchPresets({ per_page: 50 }), api.fetchPresets({ per_page: 50 })]);
    await api.fetchPresets({ per_page: 50 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not send a Content-Type header on GET (avoids CORS preflight)', async () => {
    fetchMock.mockImplementation(async () => okCatalog());
    await new DirectoriesProPresetsAPI().fetchPresets({});

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined();
  });

  it('on a 503 makes one request, skips proxies and the legacy route, then backs off', async () => {
    fetchMock.mockImplementation(async () => new Response('busy', { status: 503 }));
    const api = new DirectoriesProPresetsAPI();

    const first = await api.fetchPresets({});
    expect(first.presets).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await api.fetchPresets({});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
