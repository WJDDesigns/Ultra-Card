import { describe, it, expect } from 'vitest';
import {
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  duplicateColumn,
  duplicateRow,
  MAX_COLUMNS,
} from './layout-mutations';

const layoutFor = (n: number) => `${n}-col`;
const mod = (id: string) => ({ id, type: 'text' }) as any;
const col = (id: string, mods: string[] = []) => ({ id, modules: mods.map(mod) }) as any;
const row = (id: string, cols: any[]) => ({ id, columns: cols, column_layout: `${cols.length}-col` }) as any;
const base = () => ({
  rows: [row('r1', [col('c1', ['m1']), col('c2')]), row('r2', [col('c3')])],
});

describe('layout mutations', () => {
  it('adds and deletes rows, keeping at least one', () => {
    const l = base();
    expect(addRow(l).rows).toHaveLength(3);
    expect(deleteRow(l, 1)!.rows.map(r => r.id)).toEqual(['r1']);
    expect(deleteRow({ rows: [row('only', [])] }, 0)).toBeNull();
    expect(l.rows).toHaveLength(2); // input untouched
  });

  it('duplicates a row after itself with fresh ids', () => {
    const next = duplicateRow(base(), 0)!;
    expect(next.rows).toHaveLength(3);
    const [orig, copy] = next.rows;
    expect(copy!.id).not.toBe(orig!.id);
    expect(copy!.columns[0]!.id).not.toBe(orig!.columns[0]!.id);
    expect(copy!.columns[0]!.modules[0]!.id).not.toBe('m1');
  });

  it('adds columns up to the maximum and resets the column layout', () => {
    let l: any = { rows: [{ ...row('r', [col('a')]), custom_column_sizing: '1fr 2fr' }] };
    l = addColumn(l, 0, layoutFor);
    expect(l.rows[0].columns).toHaveLength(2);
    expect(l.rows[0].column_layout).toBe('2-col');
    expect(l.rows[0].custom_column_sizing).toBeUndefined();
    for (let i = 0; i < 10; i++) l = addColumn(l, 0, layoutFor) ?? l;
    expect(l.rows[0].columns).toHaveLength(MAX_COLUMNS);
  });

  it('deletes a column and falls back to 1-col when none are left', () => {
    const l = { rows: [row('r', [col('a')])] };
    const next = deleteColumn(l, 0, 0, layoutFor)!;
    expect(next.rows[0]!.columns).toHaveLength(0);
    expect(next.rows[0]!.column_layout).toBe('1-col');
    expect(deleteColumn(l, 0, 5, layoutFor)).toBeNull();
  });

  it('duplicates a column and regenerates module ids', () => {
    const next = duplicateColumn(base(), 0, 0, layoutFor, m => {
      m.id = `${m.id}-copy`;
    })!;
    const cols = next.rows[0]!.columns;
    expect(cols.map(c => c.modules.map(m => m.id))).toEqual([['m1'], ['m1-copy'], []]);
    expect(next.rows[0]!.column_layout).toBe('3-col');
  });
});
