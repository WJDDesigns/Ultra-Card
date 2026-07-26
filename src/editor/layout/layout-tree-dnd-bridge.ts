/**
 * Bridge between Pragmatic DnD (tree-dnd.ts) and the pure layout move engine.
 */
import {
  setupTreeMonitor,
  type TreeDropResult,
  type TreeDragState,
  type TreeNodeData,
} from '../utils/tree-dnd';
import {
  performLayoutMove,
  type LayoutMoveSource,
  type LayoutMoveTarget,
} from './layout-tree-move-engine';
import { isValidLayoutDrop } from './layout-tree-helpers';

export function mapTreeDropToLayoutMove(result: TreeDropResult): {
  source: LayoutMoveSource;
  target: LayoutMoveTarget;
} | null {
  const { sourceData, targetData, edge } = result;
  if (!sourceData || !targetData) return null;

  const sourceType = sourceData.type;
  const targetType = targetData.targetType || targetData.type;
  if (!isValidLayoutDrop(sourceType, targetType)) return null;

  const source: LayoutMoveSource = {
    type: sourceType,
    rowIndex: sourceData.rowIndex,
  };
  if (sourceData.columnIndex !== undefined) source.columnIndex = sourceData.columnIndex;
  if (sourceData.moduleIndex !== undefined) source.moduleIndex = sourceData.moduleIndex;
  if (sourceData.layoutChildIndex !== undefined)
    source.layoutChildIndex = sourceData.layoutChildIndex;
  if (sourceData.nestedChildIndex !== undefined)
    source.nestedChildIndex = sourceData.nestedChildIndex;
  if (sourceData.deepNestedChildIndex !== undefined)
    source.deepNestedChildIndex = sourceData.deepNestedChildIndex;
  if (sourceData.parentPath !== undefined) source.parentPath = sourceData.parentPath;
  if (sourceData.pathChildIndex !== undefined) source.pathChildIndex = sourceData.pathChildIndex;

  const target: LayoutMoveTarget = {
    type: targetType,
    rowIndex: targetData.rowIndex,
  };
  if (targetData.columnIndex !== undefined) target.columnIndex = targetData.columnIndex;
  if (targetData.moduleIndex !== undefined) target.moduleIndex = targetData.moduleIndex;
  if (targetData.layoutChildIndex !== undefined)
    target.layoutChildIndex = targetData.layoutChildIndex;
  if (targetData.nestedChildIndex !== undefined)
    target.nestedChildIndex = targetData.nestedChildIndex;
  if (targetData.nestedLayoutIndex !== undefined)
    target.nestedLayoutIndex = targetData.nestedLayoutIndex;
  if (targetData.parentPath !== undefined) target.parentPath = targetData.parentPath;

  // Inside layout headers → drop into the layout container
  if (targetData.isInsideTarget) {
    if (targetType === 'layout' || targetType === 'nested-layout') {
      target.type = targetType;
    }
  } else if (edge === 'top' || edge === 'bottom') {
    // Closest-edge top/bottom → insert before/after via childIndex / moduleIndex
    if (targetType === 'module' && target.moduleIndex != null) {
      if (edge === 'bottom') {
        target.moduleIndex = target.moduleIndex + 1;
      }
    } else if (
      (targetType === 'layout-child' ||
        targetType === 'nested-child-target' ||
        targetType === 'deep-nested-child-target' ||
        targetType === 'path-child-target') &&
      targetData.moduleIndex != null
    ) {
      const base =
        targetData.layoutChildIndex ??
        targetData.nestedChildIndex ??
        targetData.pathChildIndex ??
        targetData.moduleIndex ??
        0;
      target.childIndex = edge === 'bottom' ? base + 1 : base;
    } else if (targetType === 'row' && edge === 'bottom') {
      target.rowIndex = targetData.rowIndex + 1;
    } else if (targetType === 'column' && target.columnIndex != null && edge === 'bottom') {
      target.columnIndex = target.columnIndex + 1;
    }
  }

  return { source, target };
}

export function applyTreeDropToLayout(
  layout: { rows: any[] },
  result: TreeDropResult
): { rows: any[] } | null {
  const mapped = mapTreeDropToLayoutMove(result);
  if (!mapped) return null;
  return performLayoutMove(layout, mapped.source, mapped.target);
}

export function attachLayoutTreeMonitor(
  onLayoutChange: (layout: { rows: any[] }) => void,
  getLayout: () => { rows: any[] },
  onStateChange?: (state: TreeDragState) => void
): () => void {
  return setupTreeMonitor(result => {
    const next = applyTreeDropToLayout(getLayout(), result);
    if (next) onLayoutChange(next);
  }, onStateChange);
}

/** Prefer-reduced-motion: skip auto-expand-on-drag timers. */
export function shouldSkipDragAutoExpand(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPragmaticTreeDndEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ls = localStorage.getItem('ultra-card-tree-dnd');
    if (ls === 'pragmatic') return true;
    if (ls === 'html5') return false;
  } catch {
    /* private mode */
  }
  const w = window as Window & { __ultraCardTreeDnd?: string };
  return w.__ultraCardTreeDnd === 'pragmatic';
}

/** Build TreeNodeData for a top-level module (pilot wiring). */
export function moduleTreeNodeData(
  rowIndex: number,
  columnIndex: number,
  moduleIndex: number
): Omit<TreeNodeData, never> {
  return {
    type: 'module',
    targetType: 'module',
    rowIndex,
    columnIndex,
    moduleIndex,
  };
}

export function rowTreeNodeData(rowIndex: number): Omit<TreeNodeData, never> {
  return {
    type: 'row',
    targetType: 'row',
    rowIndex,
  };
}
