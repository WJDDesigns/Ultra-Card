import { describe, it, expect, vi } from 'vitest';
import { prefetchModuleChunksForLayout } from './uc-module-chunk-prefetch';
import type { LayoutConfig } from '../types';

function fakeRegistry(opts: {
  loadable?: string[];
  loaded?: string[];
  loading?: string[];
  errored?: string[];
}) {
  const loadable = new Set(opts.loadable ?? []);
  const loaded = new Set(opts.loaded ?? []);
  const loading = new Set(opts.loading ?? []);
  const errored = new Set(opts.errored ?? []);
  return {
    canLoadModule: (t: string) => loadable.has(t),
    isModuleLoaded: (t: string) => loaded.has(t),
    isModuleLoading: (t: string) => loading.has(t),
    getModuleLoadError: (t: string) => (errored.has(t) ? new Error('x') : undefined),
    ensureModuleLoaded: vi.fn((_t: string) => Promise.resolve()),
  };
}

const layout = {
  rows: [
    {
      id: 'r',
      column_layout: '1-col',
      columns: [
        {
          id: 'c',
          modules: [
            { id: 't', type: 'text' },
            {
              id: 'h',
              type: 'horizontal',
              modules: [
                { id: 'g', type: 'graphs' },
                { id: 'tabs', type: 'tabs', tabs: [{ modules: [{ id: 'm', type: 'map' }] }] },
              ],
            },
            { id: 'g2', type: 'graphs' },
            { id: 'w', type: 'weather' },
            { id: 'x', type: 'not_a_module' },
          ],
        },
      ],
    },
  ],
} as unknown as LayoutConfig;

describe('prefetchModuleChunksForLayout', () => {
  it('starts one load per lazy type in the config, nested containers included', () => {
    const reg = fakeRegistry({
      loadable: ['text', 'horizontal', 'graphs', 'tabs', 'map', 'weather'],
      loaded: ['text', 'horizontal'],
    });
    const started = prefetchModuleChunksForLayout(reg, layout);
    expect(started.sort()).toEqual(['graphs', 'map', 'tabs', 'weather']);
    expect(reg.ensureModuleLoaded).toHaveBeenCalledTimes(4);
  });

  it('skips types that are loading, already failed, or have no loader', () => {
    const reg = fakeRegistry({
      loadable: ['graphs', 'map', 'weather', 'tabs', 'horizontal', 'text'],
      loaded: ['text', 'horizontal', 'tabs'],
      loading: ['graphs'],
      errored: ['map'],
    });
    const started = prefetchModuleChunksForLayout(reg, layout);
    expect(started).toEqual(['weather']);
  });

  it('is a no-op for an empty or missing layout', () => {
    const reg = fakeRegistry({ loadable: ['graphs'] });
    expect(prefetchModuleChunksForLayout(reg, undefined)).toEqual([]);
    expect(prefetchModuleChunksForLayout(reg, { rows: [] } as unknown as LayoutConfig)).toEqual([]);
    expect(reg.ensureModuleLoaded).not.toHaveBeenCalled();
  });

  it('swallows load rejections (the registry reports them)', async () => {
    const reg = fakeRegistry({ loadable: ['graphs'] });
    reg.ensureModuleLoaded.mockImplementation(() => Promise.reject(new Error('404')));
    const simple = {
      rows: [{ id: 'r', column_layout: '1-col', columns: [{ id: 'c', modules: [{ id: 'g', type: 'graphs' }] }] }],
    } as unknown as LayoutConfig;
    expect(() => prefetchModuleChunksForLayout(reg, simple)).not.toThrow();
    await new Promise(r => setTimeout(r, 0));
  });
});
