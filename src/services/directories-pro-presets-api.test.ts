import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DirectoriesProPresetsAPI, htmlToPlainText } from './directories-pro-presets-api';

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

describe('DirectoriesProPresetsAPI transport', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.head.querySelectorAll('script').forEach(s => s.remove());
  });

  it('only ever contacts ultracard.io when the network request fails', async () => {
    // A blocked or offline request rejects with TypeError, which used to
    // trigger public CORS proxies and then a JSONP <script> tag.
    fetchMock.mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });

    await new DirectoriesProPresetsAPI().fetchPresets({}).catch(() => undefined);

    expect(fetchMock).toHaveBeenCalled();
    for (const call of fetchMock.mock.calls) {
      expect(new URL(String(call[0])).hostname).toBe('ultracard.io');
    }
    expect(document.head.querySelector('script')).toBeNull();
  });
});

describe('htmlToPlainText', () => {
  it('decodes entities and drops tags', () => {
    expect(htmlToPlainText('Tom &amp; Jerry &#8211; <b>bold</b>')).toBe('Tom & Jerry – bold');
  });

  it('does not instantiate elements from the markup in the live document', () => {
    const created: string[] = [];
    const original = Document.prototype.createElement;
    const spy = vi.spyOn(document, 'createElement').mockImplementation(function (
      this: Document,
      tag: string,
      ...rest: unknown[]
    ) {
      created.push(tag);
      return (original as (...a: unknown[]) => HTMLElement).call(this, tag, ...rest);
    } as typeof document.createElement);

    expect(htmlToPlainText('<img src=x onerror="window.__ucPwned = 1">Name')).toBe('Name');

    spy.mockRestore();
    expect(created).toEqual([]);
    expect((window as unknown as { __ucPwned?: number }).__ucPwned).toBeUndefined();
  });
});
