/**
 * Keyboard / menu sibling reorder helpers for the layout tree.
 */
import { performLayoutMove, type LayoutMoveSource } from './layout-tree-move-engine';

export type SiblingMoveDirection = 'up' | 'down';

export function moveModuleSibling(
  layout: { rows: any[] },
  rowIndex: number,
  columnIndex: number,
  moduleIndex: number,
  direction: SiblingMoveDirection
): { rows: any[] } | null {
  const modules = layout.rows[rowIndex]?.columns?.[columnIndex]?.modules;
  if (!Array.isArray(modules) || modules.length < 2) return null;

  const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
  if (targetIndex < 0 || targetIndex >= modules.length) return null;

  const source: LayoutMoveSource = {
    type: 'module',
    rowIndex,
    columnIndex,
    moduleIndex,
  };
  return performLayoutMove(layout, source, {
    type: 'module',
    rowIndex,
    columnIndex,
    moduleIndex: targetIndex,
  });
}

export function moveRowSibling(
  layout: { rows: any[] },
  rowIndex: number,
  direction: SiblingMoveDirection
): { rows: any[] } | null {
  if (!layout.rows || layout.rows.length < 2) return null;
  const targetIndex = direction === 'up' ? rowIndex - 1 : rowIndex + 1;
  if (targetIndex < 0 || targetIndex >= layout.rows.length) return null;
  return performLayoutMove(
    layout,
    { type: 'row', rowIndex },
    { type: 'row', rowIndex: targetIndex }
  );
}

export function moveColumnSibling(
  layout: { rows: any[] },
  rowIndex: number,
  columnIndex: number,
  direction: SiblingMoveDirection
): { rows: any[] } | null {
  const columns = layout.rows[rowIndex]?.columns;
  if (!Array.isArray(columns) || columns.length < 2) return null;
  const targetIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
  if (targetIndex < 0 || targetIndex >= columns.length) return null;
  return performLayoutMove(
    layout,
    { type: 'column', rowIndex, columnIndex },
    { type: 'column', rowIndex, columnIndex: targetIndex }
  );
}
