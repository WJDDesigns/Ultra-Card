/**
 * Pure row/column mutations for the layout tree (audit K9, step 2).
 *
 * Each function takes the current layout and returns a new one, or null when
 * nothing changes, without touching the input. LayoutTab handles undo, events
 * and UI around them; keeping the mutations here makes them testable on their own.
 */
import type { CardColumn, CardModule, CardRow } from '../../types';

export interface Layout {
  rows: CardRow[];
}

export const MAX_COLUMNS = 6;

/** Default `column_layout` id for a given column count. */
export type ColumnLayoutFor = (columnCount: number) => string;

const randomSuffix = (): string => Math.random().toString(36).slice(2, 11);
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export function newRow(): CardRow {
  return {
    id: `row-${Date.now()}`,
    columns: [],
    column_layout: '1-col',
    design: { margin_top: '8px', margin_bottom: '8px' },
  };
}

export function newColumn(): CardColumn {
  return {
    id: `col-${Date.now()}-${randomSuffix()}`,
    modules: [],
    vertical_alignment: 'stretch',
    horizontal_alignment: 'stretch',
  };
}

export function addRow(layout: Layout, row: CardRow = newRow()): Layout {
  return { rows: [...layout.rows, row] };
}

/** The last row cannot be deleted (a card always keeps one). */
export function deleteRow(layout: Layout, rowIndex: number): Layout | null {
  if (layout.rows.length <= 1 || !layout.rows[rowIndex]) return null;
  return { rows: layout.rows.filter((_, i) => i !== rowIndex) };
}

/** Insert a copy of a row right after it, with fresh row/column/module ids. */
export function duplicateRow(layout: Layout, rowIndex: number): Layout | null {
  const source = layout.rows[rowIndex];
  if (!source) return null;
  const stamp = Date.now();
  const copy: CardRow = {
    ...clone(source),
    id: `row-${stamp}`,
    columns: source.columns.map((column, ci) => ({
      ...clone(column),
      id: `col-${stamp}-${ci}-${randomSuffix()}`,
      modules: column.modules.map((module, mi) => ({
        ...clone(module),
        id: `${module.type}-${stamp}-${mi}-${randomSuffix()}`,
      })),
    })),
  };
  const next = clone(layout);
  next.rows.splice(rowIndex + 1, 0, copy);
  return next;
}

function withColumns(row: CardRow, columns: CardColumn[], layoutFor: ColumnLayoutFor): CardRow {
  // Custom sizing describes the old column count, so it goes when the count changes.
  const rest: CardRow = { ...row };
  delete rest.custom_column_sizing;
  return {
    ...rest,
    columns,
    column_layout: (columns.length > 0 ? layoutFor(columns.length) : '1-col') as CardRow['column_layout'],
  };
}

export function addColumn(
  layout: Layout,
  rowIndex: number,
  layoutFor: ColumnLayoutFor,
  column: CardColumn = newColumn()
): Layout | null {
  const row = layout.rows[rowIndex];
  if (!row || row.columns.length >= MAX_COLUMNS) return null;
  return {
    rows: layout.rows.map((r, i) =>
      i === rowIndex ? withColumns(r, [...r.columns, column], layoutFor) : r
    ),
  };
}

export function deleteColumn(
  layout: Layout,
  rowIndex: number,
  columnIndex: number,
  layoutFor: ColumnLayoutFor
): Layout | null {
  const row = layout.rows[rowIndex];
  if (!row || !row.columns[columnIndex]) return null;
  return {
    rows: layout.rows.map((r, i) =>
      i === rowIndex
        ? withColumns(r, r.columns.filter((_, ci) => ci !== columnIndex), layoutFor)
        : r
    ),
  };
}

/** Insert a copy of a column after it; `regenerateIds` gives modules and their children new ids. */
export function duplicateColumn(
  layout: Layout,
  rowIndex: number,
  columnIndex: number,
  layoutFor: ColumnLayoutFor,
  regenerateIds: (module: CardModule) => void
): Layout | null {
  const row = layout.rows[rowIndex];
  const source = row?.columns[columnIndex];
  if (!row || !source || row.columns.length >= MAX_COLUMNS) return null;
  const copy: CardColumn = {
    ...clone(source),
    id: `col-${Date.now()}-${randomSuffix()}`,
    modules: source.modules.map(module => {
      const m = clone(module);
      regenerateIds(m);
      return m;
    }),
  };
  const columns = [...row.columns];
  columns.splice(columnIndex + 1, 0, copy);
  return {
    rows: layout.rows.map((r, i) => (i === rowIndex ? withColumns(clone(r), columns, layoutFor) : r)),
  };
}
