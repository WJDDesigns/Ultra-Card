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

/**
 * Children of a layout module (horizontal, vertical, …) live in its `modules`
 * array. Returns that array for a parent module, or for a nested layout inside it
 * when `nestedLayoutIndex` is given. Tabs and other section-based parents return
 * null: their children are not a single ordered list.
 */
function nestedChildList(
  layout: { rows: any[] },
  rowIndex: number,
  columnIndex: number,
  parentModuleIndex: number,
  nestedLayoutIndex?: number
): any[] | null {
  const parent = layout.rows[rowIndex]?.columns?.[columnIndex]?.modules?.[parentModuleIndex];
  const owner = nestedLayoutIndex === undefined ? parent : parent?.modules?.[nestedLayoutIndex];
  return Array.isArray(owner?.modules) ? owner.modules : null;
}

export function canMoveNestedChild(
  layout: { rows: any[] },
  rowIndex: number,
  columnIndex: number,
  parentModuleIndex: number,
  childIndex: number,
  direction: SiblingMoveDirection,
  nestedLayoutIndex?: number
): boolean {
  const list = nestedChildList(layout, rowIndex, columnIndex, parentModuleIndex, nestedLayoutIndex);
  if (!list) return false;
  return direction === 'up' ? childIndex > 0 : childIndex < list.length - 1;
}

/** Swap a nested child with its neighbour. Returns a new layout, or null if it cannot move. */
export function moveNestedChildSibling(
  layout: { rows: any[] },
  rowIndex: number,
  columnIndex: number,
  parentModuleIndex: number,
  childIndex: number,
  direction: SiblingMoveDirection,
  nestedLayoutIndex?: number
): { rows: any[] } | null {
  if (
    !canMoveNestedChild(
      layout,
      rowIndex,
      columnIndex,
      parentModuleIndex,
      childIndex,
      direction,
      nestedLayoutIndex
    )
  ) {
    return null;
  }
  const next = JSON.parse(JSON.stringify(layout));
  const list = nestedChildList(next, rowIndex, columnIndex, parentModuleIndex, nestedLayoutIndex)!;
  const target = direction === 'up' ? childIndex - 1 : childIndex + 1;
  [list[childIndex], list[target]] = [list[target], list[childIndex]];
  return next;
}
