import { describe, it, expect } from 'vitest';
import { canMoveNestedChild, moveNestedChildSibling } from './layout-tree-keyboard-move';

const layout = () => ({
  rows: [
    {
      id: 'r',
      columns: [
        {
          id: 'c',
          modules: [
            {
              id: 'h',
              type: 'horizontal',
              modules: [
                { id: 'a', type: 'text' },
                { id: 'b', type: 'text' },
                { id: 'v', type: 'vertical', modules: [{ id: 'x' }, { id: 'y' }] },
              ],
            },
          ],
        },
      ],
    },
  ],
});

describe('moveNestedChildSibling', () => {
  it('swaps a child of a layout module with its neighbour', () => {
    const before = layout();
    const next = moveNestedChildSibling(before, 0, 0, 0, 0, 'down')!;
    expect(next.rows[0].columns[0].modules[0].modules.map((m: any) => m.id)).toEqual(['b', 'a', 'v']);
    // The input is not mutated.
    expect(before.rows[0].columns[0].modules[0].modules[0].id).toBe('a');
  });

  it('moves children of a nested layout', () => {
    const next = moveNestedChildSibling(layout(), 0, 0, 0, 1, 'up', 2)!;
    expect(next.rows[0].columns[0].modules[0].modules[2].modules.map((m: any) => m.id)).toEqual([
      'y',
      'x',
    ]);
  });

  it('refuses moves past either end', () => {
    expect(canMoveNestedChild(layout(), 0, 0, 0, 0, 'up')).toBe(false);
    expect(canMoveNestedChild(layout(), 0, 0, 0, 2, 'down')).toBe(false);
    expect(moveNestedChildSibling(layout(), 0, 0, 0, 0, 'up')).toBeNull();
  });

  it('ignores parents without a modules list (tabs)', () => {
    const l: any = layout();
    l.rows[0].columns[0].modules[0] = { id: 't', type: 'tabs', sections: [] };
    expect(canMoveNestedChild(l, 0, 0, 0, 0, 'down')).toBe(false);
  });
});
