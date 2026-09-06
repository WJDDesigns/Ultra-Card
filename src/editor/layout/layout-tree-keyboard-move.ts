/**
 * Keyboard / menu sibling reorder helpers for the layout tree.
 */
import { performLayoutMove, type LayoutMoveSource } from './layout-tree-move-engine';

export type SiblingMoveDirection = 'up' | 'down';

/**
 * The move engine treats target indices as *insertion* points into the original
 * list ("insert before item N"). To swap with the previous sibling we insert
 * before it (index - 1); to swap with the next sibling we insert *after* it,
 * i.e. before index + 2 (which may equal the list length).
 * Returns null when the item is already at the edge in that direction.
 */
function siblingInsertIndex(
  index: number,
  length: number,
  direction: SiblingMoveDirection
): number | null {
  if (direction === 'up') return index > 0 ? index - 1 : null;
  return index < length - 1 ? index + 2 : null;
}

export function moveModuleSibling(
  layout: { rows: any[] },
  rowIndex: number,
  columnIndex: number,
  moduleIndex: number,
  direction: SiblingMoveDirection
): { rows: any[] } | null {
  const modules = layout.rows[rowIndex]?.columns?.[columnIndex]?.modules;
  if (!Array.isArray(modules) || modules.length < 2) return null;

  const targetIndex = siblingInsertIndex(moduleIndex, modules.length, direction);
  if (targetIndex === null) return null;

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
  const targetIndex = siblingInsertIndex(rowIndex, layout.rows.length, direction);
  if (targetIndex === null) return null;
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
  const targetIndex = siblingInsertIndex(columnIndex, columns.length, direction);
  if (targetIndex === null) return null;
  return performLayoutMove(
    layout,
    { type: 'column', rowIndex, columnIndex },
    { type: 'column', rowIndex, columnIndex: targetIndex }
  );
}
