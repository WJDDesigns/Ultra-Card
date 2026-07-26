/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { mapTreeDropToLayoutMove, applyTreeDropToLayout } from './layout-tree-dnd-bridge';
import { moveModuleSibling, moveRowSibling, moveColumnSibling } from './layout-tree-keyboard-move';
import type { TreeDropResult } from '../utils/tree-dnd';

describe('mapTreeDropToLayoutMove', () => {
  it('maps module → column drop', () => {
    const result: TreeDropResult = {
      sourceData: {
        type: 'module',
        targetType: 'module',
        rowIndex: 0,
        columnIndex: 0,
        moduleIndex: 0,
      },
      targetData: {
        type: 'module',
        targetType: 'column',
        rowIndex: 0,
        columnIndex: 1,
      },
      edge: null,
    };
    const mapped = mapTreeDropToLayoutMove(result);
    expect(mapped?.source.type).toBe('module');
    expect(mapped?.target.type).toBe('column');
    expect(mapped?.target.columnIndex).toBe(1);
  });

  it('adjusts module index for bottom edge', () => {
    const result: TreeDropResult = {
      sourceData: {
        type: 'module',
        targetType: 'module',
        rowIndex: 0,
        columnIndex: 0,
        moduleIndex: 0,
      },
      targetData: {
        type: 'module',
        targetType: 'module',
        rowIndex: 0,
        columnIndex: 0,
        moduleIndex: 1,
      },
      edge: 'bottom',
    };
    const mapped = mapTreeDropToLayoutMove(result);
    expect(mapped?.target.moduleIndex).toBe(2);
  });

  it('rejects invalid combinations', () => {
    const result: TreeDropResult = {
      sourceData: { type: 'row', targetType: 'row', rowIndex: 0 },
      targetData: { type: 'module', targetType: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 },
      edge: null,
    };
    expect(mapTreeDropToLayoutMove(result)).toBeNull();
  });
});

describe('applyTreeDropToLayout', () => {
  it('applies a valid drop', () => {
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
    const next = applyTreeDropToLayout(layout, {
      sourceData: {
        type: 'module',
        targetType: 'module',
        rowIndex: 0,
        columnIndex: 0,
        moduleIndex: 1,
      },
      targetData: {
        type: 'module',
        targetType: 'module',
        rowIndex: 0,
        columnIndex: 0,
        moduleIndex: 0,
      },
      edge: 'top',
    });
    expect(next?.rows[0].columns[0].modules.map((m: any) => m.id)).toEqual(['m2', 'm1']);
  });
});

describe('keyboard sibling moves', () => {
  it('moves a module up', () => {
    const layout = {
      rows: [
        {
          columns: [
            {
              modules: [
                { id: 'm1', type: 'text' },
                { id: 'm2', type: 'icon' },
              ],
            },
          ],
        },
      ],
    };
    const next = moveModuleSibling(layout, 0, 0, 1, 'up');
    expect(next?.rows[0].columns[0].modules.map((m: any) => m.id)).toEqual(['m2', 'm1']);
  });

  it('moves a row down', () => {
    const layout = {
      rows: [
        { id: 'r1', columns: [] },
        { id: 'r2', columns: [] },
      ],
    };
    const next = moveRowSibling(layout, 0, 'down');
    expect(next?.rows.map((r: any) => r.id)).toEqual(['r2', 'r1']);
  });

  it('moves a column sibling', () => {
    const layout = {
      rows: [
        {
          columns: [
            { id: 'c1', modules: [] },
            { id: 'c2', modules: [] },
          ],
        },
      ],
    };
    const next = moveColumnSibling(layout, 0, 1, 'up');
    expect(next?.rows[0].columns.map((c: any) => c.id)).toEqual(['c2', 'c1']);
  });

  it('returns null at boundaries', () => {
    const layout = {
      rows: [{ columns: [{ modules: [{ id: 'm1', type: 'text' }] }] }],
    };
    expect(moveModuleSibling(layout, 0, 0, 0, 'up')).toBeNull();
    expect(moveRowSibling({ rows: [{ id: 'r1', columns: [] }] }, 0, 'down')).toBeNull();
  });
});
