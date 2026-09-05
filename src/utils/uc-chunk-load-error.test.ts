/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isChunkLoadError,
  reportChunkLoadFailure,
  __resetChunkLoadReporterForTests,
} from './uc-chunk-load-error';

const flush = () => new Promise<void>(r => setTimeout(r, 0));

describe('isChunkLoadError', () => {
  it('recognises the engines\u2019 failed dynamic import messages', () => {
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: http://ha/hacsfiles/Ultra-Card/uc-m-graphs.1a2b3c4d.js'
        )
      )
    ).toBe(true);
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Load failed'))).toBe(true);
    const webpackStyle = new Error('Loading chunk 123 failed.');
    webpackStyle.name = 'ChunkLoadError';
    expect(isChunkLoadError(webpackStyle)).toBe(true);
  });

  it('ignores ordinary runtime errors', () => {
    expect(isChunkLoadError(new Error('Select a weather entity'))).toBe(false);
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(
      false
    );
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});

describe('reportChunkLoadFailure', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetChunkLoadReporterForTests();
    document.body.innerHTML = '';
    fetchMock = vi.fn(async () => ({ status: 404 }) as Response);
    vi.stubGlobal('fetch', fetchMock);
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    warn.mockRestore();
  });

  it('returns false and does nothing for non chunk errors', async () => {
    expect(reportChunkLoadFailure(new Error('boom'), 'test')).toBe(false);
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.getElementById('uc-toast-live-region')).toBeNull();
  });

  it('probes the failed URL and shows one "updated, reload" toast with a Reload action', async () => {
    const err = new TypeError(
      'Failed to fetch dynamically imported module: http://ha/hacsfiles/Ultra-Card/uc-m-map.deadbeef.js'
    );
    expect(reportChunkLoadFailure(err, 'module map')).toBe(true);
    // Second failure on the same page is logged, not toasted again.
    expect(reportChunkLoadFailure(err, 'module graphs')).toBe(true);
    await flush();
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('uc-m-map.deadbeef.js');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'HEAD', cache: 'no-store' });

    const region = document.getElementById('uc-toast-live-region')!;
    expect(region).toBeTruthy();
    expect(region.children.length).toBe(1);
    expect(region.textContent).toContain('Ultra Card was updated');
    const button = region.querySelector('button')!;
    expect(button.textContent).toBe('Reload');
  });

  it('uses Home Assistant\u2019s toast when a <home-assistant> root is present', async () => {
    const root = document.createElement('home-assistant');
    document.body.appendChild(root);
    const seen: CustomEvent[] = [];
    root.addEventListener('hass-notification', e => seen.push(e as CustomEvent));

    reportChunkLoadFailure(new TypeError('Importing a module script failed.'), 'editor');
    await flush();
    await flush();

    expect(seen.length).toBe(1);
    expect(seen[0].detail.message).toContain('Ultra Card');
    expect(seen[0].detail.duration).toBe(-1);
    expect(typeof seen[0].detail.action.action).toBe('function');
    expect(document.getElementById('uc-toast-live-region')).toBeNull();
  });

  it('words the toast for connectivity problems when the probe cannot reach the server', async () => {
    fetchMock.mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });
    reportChunkLoadFailure(
      new TypeError('Failed to fetch dynamically imported module: http://ha/uc-m-map.deadbeef.js'),
      'module map'
    );
    await flush();
    await flush();
    const region = document.getElementById('uc-toast-live-region')!;
    expect(region.textContent).toContain('Check your connection');
  });
});
