import { describe, it, expect } from 'vitest';
import { collectModuleTypesFromLayout } from './uc-layout-module-types';
import type { LayoutConfig } from '../types';

describe('collectModuleTypesFromLayout', () => {
  it('collects top-level column modules', () => {
    const layout: LayoutConfig = {
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              modules: [{ id: '1', type: 'text' } as any, { id: '2', type: 'icon' } as any],
            },
          ],
        },
      ],
    };
    expect(collectModuleTypesFromLayout(layout)).toEqual(new Set(['text', 'icon']));
  });

  it('collects nested modules inside horizontal', () => {
    const layout: LayoutConfig = {
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              modules: [
                {
                  id: 'h1',
                  type: 'horizontal',
                  modules: [{ id: 'g1', type: 'graphs' } as any],
                } as any,
              ],
            },
          ],
        },
      ],
    };
    expect(collectModuleTypesFromLayout(layout)).toEqual(new Set(['horizontal', 'graphs']));
  });

  it('returns empty set for missing layout', () => {
    expect(collectModuleTypesFromLayout(undefined)).toEqual(new Set());
    expect(collectModuleTypesFromLayout(null)).toEqual(new Set());
    expect(collectModuleTypesFromLayout({ rows: [] })).toEqual(new Set());
  });
});
