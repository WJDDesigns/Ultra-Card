import { describe, it, expect } from 'vitest';
import {
  collectModuleTypesFromLayout,
  forEachLayoutModule,
  forEachNestedChildModules,
} from './uc-layout-module-types';
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

  it('collects media_player nested under tabs.sections', () => {
    const layout: LayoutConfig = {
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              modules: [
                {
                  id: 't1',
                  type: 'tabs',
                  sections: [
                    {
                      id: 's1',
                      title: 'Music',
                      modules: [
                        {
                          id: 'mp1',
                          type: 'media_player',
                          entity: 'media_player.spotify',
                        } as any,
                      ],
                    },
                  ],
                } as any,
              ],
            },
          ],
        },
      ],
    };
    expect(collectModuleTypesFromLayout(layout)).toEqual(new Set(['tabs', 'media_player']));

    const entities: string[] = [];
    forEachLayoutModule(layout, mod => {
      const entity = (mod as any).entity;
      if (typeof entity === 'string' && entity.includes('.')) entities.push(entity);
    });
    expect(entities).toEqual(['media_player.spotify']);
  });

  it('walks accordion panels and nested panes', () => {
    const layout: LayoutConfig = {
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              modules: [
                {
                  id: 'a1',
                  type: 'accordion',
                  panels: [
                    {
                      modules: [
                        {
                          id: 'p1',
                          type: 'slider',
                          panes: [{ modules: [{ id: 'f1', type: 'fan', entity: 'fan.office' }] }],
                        },
                      ],
                    },
                  ],
                } as any,
              ],
            },
          ],
        },
      ],
    };
    expect(collectModuleTypesFromLayout(layout)).toEqual(new Set(['accordion', 'slider', 'fan']));
  });

  it('returns empty set for missing layout', () => {
    expect(collectModuleTypesFromLayout(undefined)).toEqual(new Set());
    expect(collectModuleTypesFromLayout(null)).toEqual(new Set());
    expect(collectModuleTypesFromLayout({ rows: [] })).toEqual(new Set());
  });
});

describe('forEachNestedChildModules', () => {
  it('visits tabs.sections and direct modules', () => {
    const visited: string[] = [];
    forEachNestedChildModules(
      {
        type: 'tabs',
        sections: [{ modules: [{ id: 'a', type: 'media_player' }] }],
        modules: [{ id: 'b', type: 'text' }],
      } as any,
      mods => {
        for (const m of mods) visited.push(m.type);
      }
    );
    expect(visited.sort()).toEqual(['media_player', 'text']);
  });
});
