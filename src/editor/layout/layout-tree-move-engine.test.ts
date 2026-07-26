/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import {
  isValidLayoutDrop,
  reorderArray,
  isLayoutModuleType,
  resolveModuleList,
} from './layout-tree-helpers';
import { performLayoutMove } from './layout-tree-move-engine';

describe('isValidLayoutDrop', () => {
  it('allows module onto column and layout targets', () => {
    expect(isValidLayoutDrop('module', 'column')).toBe(true);
    expect(isValidLayoutDrop('module', 'layout')).toBe(true);
    expect(isValidLayoutDrop('module', 'row')).toBe(false);
  });

  it('allows column onto row', () => {
    expect(isValidLayoutDrop('column', 'row')).toBe(true);
    expect(isValidLayoutDrop('column', 'module')).toBe(false);
  });

  it('allows row onto row only', () => {
    expect(isValidLayoutDrop('row', 'row')).toBe(true);
    expect(isValidLayoutDrop('row', 'column')).toBe(false);
  });
});

describe('reorderArray', () => {
  it('moves items and adjusts indices', () => {
    expect(reorderArray(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'a', 'c']);
    expect(reorderArray(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('returns same array reference when indices match', () => {
    const arr = [1, 2];
    expect(reorderArray(arr, 1, 1)).toBe(arr);
  });
});

describe('isLayoutModuleType', () => {
  it('recognizes layout containers', () => {
    expect(isLayoutModuleType('horizontal')).toBe(true);
    expect(isLayoutModuleType('tabs')).toBe(true);
    expect(isLayoutModuleType('text')).toBe(false);
  });
});

describe('performLayoutMove', () => {
  it('reorders modules within a column', () => {
    const layout = {
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              modules: [
                { id: 'm1', type: 'text' },
                { id: 'm2', type: 'icon' },
              ],
            },
          ],
        },
      ],
    };
    // Drop later module onto earlier module index (insert-before semantics).
    const next = performLayoutMove(
      layout,
      { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 1 },
      { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 }
    );
    expect(next.rows[0].columns[0].modules.map((m: any) => m.id)).toEqual(['m2', 'm1']);
  });

  it('moves a row', () => {
    const layout = {
      rows: [
        { id: 'r1', columns: [] },
        { id: 'r2', columns: [] },
      ],
    };
    const next = performLayoutMove(
      layout,
      { type: 'row', rowIndex: 0 },
      { type: 'row', rowIndex: 1 }
    );
    expect(next.rows.map((r: any) => r.id)).toEqual(['r2', 'r1']);
  });

  it('does not mutate the original layout', () => {
    const layout = {
      rows: [
        {
          id: 'r1',
          columns: [{ id: 'c1', modules: [{ id: 'm1', type: 'text' }] }],
        },
      ],
    };
    const snapshot = JSON.stringify(layout);
    performLayoutMove(
      layout,
      { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 },
      { type: 'column', rowIndex: 0, columnIndex: 0 }
    );
    expect(JSON.stringify(layout)).toBe(snapshot);
  });
});

describe('resolveModuleList', () => {
  it('walks nested module paths', () => {
    const layout = {
      rows: [
        {
          columns: [
            {
              modules: [
                {
                  type: 'horizontal',
                  modules: [{ type: 'vertical', modules: [{ id: 'leaf', type: 'text' }] }],
                },
              ],
            },
          ],
        },
      ],
    };
    const list = resolveModuleList(layout, [0, 0, 0, 0]);
    expect(list?.[0]?.id).toBe('leaf');
  });
});
