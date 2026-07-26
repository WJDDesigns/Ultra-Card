/**
 * Pure layout tree move engine — extracted from layout-tab.ts.
 * Mutates a cloned layout; callers should deep-clone before calling performLayoutMove.
 */
import {
  isLayoutModuleType,
  resolveModuleList,
  getLayoutsForColumnCount,
} from './layout-tree-helpers';

export interface LayoutMoveSource {
  type: string;
  rowIndex: number;
  columnIndex?: number;
  moduleIndex?: number;
  layoutChildIndex?: number;
  nestedChildIndex?: number;
  deepNestedChildIndex?: number;
  parentPath?: number[];
  pathChildIndex?: number;
  sectionIndex?: number;
  childIndex?: number;
  isNested?: boolean;
  parentLayoutChildIndex?: number;
}

export interface LayoutMoveTarget {
  type: string;
  rowIndex: number;
  columnIndex?: number;
  moduleIndex?: number;
  childIndex?: number;
  layoutChildIndex?: number;
  nestedChildIndex?: number;
  nestedLayoutIndex?: number;
  parentPath?: number[];
}

export function performLayoutMove(
  layout: { rows: any[] },
  source: LayoutMoveSource,
  target: LayoutMoveTarget
): { rows: any[] } {
  const newLayout = JSON.parse(JSON.stringify(layout));
  switch (source.type) {
    case 'module':
    case 'layout-child':
      moveModule(newLayout, source, target);
      break;
    case 'nested-child':
      moveNestedChild(newLayout, source, target);
      break;
    case 'deep-nested-child':
      moveDeepNestedChild(newLayout, source, target);
      break;
    case 'path-child':
      movePathChild(newLayout, source, target);
      break;
    case 'tabs-section-child':
      moveTabsSectionChild(newLayout, source, target);
      break;
    case 'column':
      moveColumn(newLayout, source, target);
      break;
    case 'row':
      moveRow(newLayout, source, target);
      break;
  }
  return newLayout;
}

  function moveModule(layout: any, source: any, target: any): void {
    let sourceModule: any;
    let sourceRemoved = false;

    // Handle layout-child reordering within the same layout module FIRST
    if (source.layoutChildIndex !== undefined && target.type === 'layout-child') {
      const sourceParentRow = source.rowIndex;
      const sourceParentColumn = source.columnIndex;
      const sourceParentModule = source.moduleIndex;
      const sourceChildIndex = source.layoutChildIndex;

      const targetParentRow = target.rowIndex;
      const targetParentColumn = target.columnIndex;
      const targetParentModule = target.moduleIndex;
      const targetChildIndex = target.childIndex;

      // Check if this is reordering within the same layout module
      if (
        sourceParentRow === targetParentRow &&
        sourceParentColumn === targetParentColumn &&
        sourceParentModule === targetParentModule
      ) {
        if (sourceChildIndex === targetChildIndex) {
          // Dropping on self, do nothing
          return;
        }

        const layoutModule = layout.rows[sourceParentRow].columns[sourceParentColumn].modules[
          sourceParentModule
        ] as any;

        if (layoutModule && isLayoutModuleType(layoutModule.type) && layoutModule.modules) {
          // Remove from source position
          const movedModule = layoutModule.modules.splice(sourceChildIndex, 1)[0];

          // Calculate new insertion index - INSERT BEFORE the target module
          let newIndex = targetChildIndex;

          // If we removed an item from before the target position, adjust the target index
          if (sourceChildIndex < targetChildIndex) {
            newIndex = targetChildIndex - 1;
          }

          // Insert at new position (before the target module)
          layoutModule.modules.splice(newIndex, 0, movedModule);
        }
        return;
      }
    }

    // Get source module and handle removal
    if (source.layoutChildIndex !== undefined) {
      // Get source module from layout child
      const parentLayoutModule = layout.rows[source.rowIndex].columns[source.columnIndex].modules[
        source.moduleIndex
      ] as any;
      sourceModule = parentLayoutModule.modules[source.layoutChildIndex];
      // Remove from layout child
      parentLayoutModule.modules.splice(source.layoutChildIndex, 1);
      sourceRemoved = true;
    } else {
      // Get source module from regular column
      sourceModule =
        layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
      // Don't remove from source first for layout targets!
    }

    // After removing a layout-child from its parent, adjust any target indices
    // that reference the same parent layout's modules array to account for the shift.
    if (sourceRemoved && source.layoutChildIndex !== undefined) {
      const sameParent =
        target.rowIndex === source.rowIndex &&
        target.columnIndex === source.columnIndex &&
        target.moduleIndex === source.moduleIndex;
      if (sameParent) {
        const removedIdx = source.layoutChildIndex;
        // nested-child-target / deep-nested-child-target use layoutChildIndex into the same array
        if (target.layoutChildIndex != null && target.layoutChildIndex > removedIdx) {
          target.layoutChildIndex--;
        }
        // nested-layout target uses nestedLayoutIndex into the same array
        if (
          (target as any).nestedLayoutIndex != null &&
          (target as any).nestedLayoutIndex > removedIdx
        ) {
          (target as any).nestedLayoutIndex--;
        }
        // layout-child target uses childIndex as an insertion position in the same array
        if (
          target.type === 'layout-child' &&
          target.childIndex != null &&
          target.childIndex > removedIdx
        ) {
          target.childIndex--;
        }
      }
    }

    if (target.type === 'nested-layout') {
      // Drop ON a nested layout (e.g. horizontal inside slider) -> insert inside that nested layout
      const targetParentLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetParentLayout?.modules?.[(target as any).nestedLayoutIndex];
      if (targetNestedLayout && isLayoutModuleType(targetNestedLayout.type)) {
        const sourceIsLayoutModule = isLayoutModuleType(sourceModule?.type);
        if (sourceIsLayoutModule) {
          const sourceColumn = layout.rows[source.rowIndex].columns[source.columnIndex];
          const sourceParentLayout =
            source.layoutChildIndex !== undefined
              ? sourceColumn.modules[source.moduleIndex]
              : undefined;
          const sourceList =
            source.layoutChildIndex !== undefined && isLayoutModuleType(sourceParentLayout?.type)
              ? sourceParentLayout.modules
              : sourceColumn.modules;
          const targetList = targetNestedLayout.modules ?? (targetNestedLayout.modules = []);
          if (!Array.isArray(sourceList)) return;
          const sourceIndex =
            source.layoutChildIndex !== undefined
              ? source.layoutChildIndex
              : (source.moduleIndex ?? -1);
          if (!sourceRemoved && sourceIndex >= 0 && sourceIndex < sourceList.length) {
            sourceList.splice(sourceIndex, 1);
          }
          targetList.push(sourceModule);
          return;
        }
        if (!targetNestedLayout.modules) {
          targetNestedLayout.modules = [];
        }
        targetNestedLayout.modules.push(sourceModule);
        if (source.layoutChildIndex === undefined) {
          layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
            source.moduleIndex,
            1
          );
        }
      } else if (sourceRemoved && sourceModule) {
        // Safety: target nested layout validation failed but source was already removed.
        // Restore the source module to prevent it from disappearing.
        const parentLayoutModule = layout.rows[source.rowIndex]?.columns[source.columnIndex]
          ?.modules[source.moduleIndex] as any;
        if (parentLayoutModule?.modules) {
          parentLayoutModule.modules.splice(source.layoutChildIndex, 0, sourceModule);
        }
      }
      return;
    }

    if (target.type === 'layout') {
      // Move to layout module - validate target first, then move
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];

      if (targetLayoutModule && isLayoutModuleType(targetLayoutModule.type)) {
        const sourceIsLayoutModule = isLayoutModuleType(sourceModule?.type);

        if (sourceIsLayoutModule) {
          relocateLayoutModule(layout, source, target, sourceModule, sourceRemoved, 'after');
          return;
        }

        if (!targetLayoutModule.modules) {
          targetLayoutModule.modules = [];
        }
        // Add the module to the layout module FIRST
        targetLayoutModule.modules.push(sourceModule);

        // Only remove from source AFTER successfully adding to target (if not from layout child)
        if (source.layoutChildIndex === undefined) {
          layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
            source.moduleIndex,
            1
          );
        }
      } else if (sourceRemoved && sourceModule) {
        // Safety: target layout validation failed but source was already removed.
        // Restore the source module to prevent it from disappearing.
        const parentLayoutModule = layout.rows[source.rowIndex]?.columns[source.columnIndex]
          ?.modules[source.moduleIndex] as any;
        if (parentLayoutModule?.modules) {
          parentLayoutModule.modules.splice(source.layoutChildIndex, 0, sourceModule);
        }
      }
      return;
    }

    if (target.type === 'layout-child') {
      // Move to specific position within layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];

      if (targetLayoutModule && isLayoutModuleType(targetLayoutModule.type)) {
        const sourceIsLayoutModule = isLayoutModuleType(sourceModule?.type);

        if (sourceIsLayoutModule) {
          relocateLayoutModule(layout, source, target, sourceModule, sourceRemoved, 'before');
          return;
        }

        if (!targetLayoutModule.modules) {
          targetLayoutModule.modules = [];
        }

        // Insert at specific position
        const insertIndex = (target as any).childIndex ?? 0;
        targetLayoutModule.modules.splice(insertIndex, 0, sourceModule);

        // Only remove from source AFTER successfully adding to target (if not from layout child)
        if (source.layoutChildIndex === undefined) {
          layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
            source.moduleIndex,
            1
          );
        }
      }
      return;
    }

    // For non-layout targets, remove from source first (traditional move behavior)
    if (source.layoutChildIndex === undefined) {
      layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
        source.moduleIndex,
        1
      );
    }

    // Add to target
    if (target.type === 'path-child-target' && target.parentPath) {
      // Insert into level 5+ container (generic path)
      const targetList = resolveModuleList(layout, target.parentPath);
      if (targetList) {
        const insertIdx = target.childIndex !== undefined ? target.childIndex : targetList.length;
        targetList.splice(insertIdx, 0, sourceModule);
      }
    } else if (target.type === 'deep-nested-child-target') {
      // Insert into the deep nested layout's modules array (e.g. vertical inside horizontal inside popup)
      const targetTopLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetTopLayout?.modules?.[target.layoutChildIndex];
      const targetDeepLayout = targetNestedLayout?.modules?.[target.nestedChildIndex];
      if (targetDeepLayout && Array.isArray(targetDeepLayout.modules)) {
        const insertIdx =
          target.childIndex !== undefined ? target.childIndex : targetDeepLayout.modules.length;
        targetDeepLayout.modules.splice(insertIdx, 0, sourceModule);
      }
    } else if (target.type === 'nested-child-target') {
      // Insert into the nested layout's modules array (e.g. horizontal inside slider)
      const targetParentLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetParentLayout?.modules?.[target.layoutChildIndex];
      if (targetNestedLayout && Array.isArray(targetNestedLayout.modules)) {
        const insertIdx =
          target.childIndex !== undefined ? target.childIndex : targetNestedLayout.modules.length;
        targetNestedLayout.modules.splice(insertIdx, 0, sourceModule);
      }
    } else if (target.type === 'module') {
      // Insert at specific position
      let targetIndex = target.moduleIndex ?? 0;

      // If moving within the same column and target is after source, adjust index
      if (
        source.layoutChildIndex === undefined &&
        source.rowIndex === target.rowIndex &&
        source.columnIndex === target.columnIndex &&
        (target.moduleIndex ?? 0) > (source.moduleIndex ?? 0)
      ) {
        targetIndex--;
      }

      layout.rows[target.rowIndex].columns[target.columnIndex].modules.splice(
        targetIndex,
        0,
        sourceModule
      );
    } else if (target.type === 'column') {
      // Add to end of column
      layout.rows[target.rowIndex].columns[target.columnIndex].modules.push(sourceModule);
    }
  }

export function relocateLayoutModule(
    layout: any,
    source: any,
    target: {
      rowIndex: number;
      columnIndex: number;
      moduleIndex?: number | undefined;
      childIndex?: number | undefined;
      type?: string | undefined;
    },
    moduleToMove: any,
    sourceRemoved: boolean,
    position: 'before' | 'after'
  ): void {
    if (!moduleToMove) {
      return;
    }

    const sourceRow = layout.rows[source.rowIndex];
    const sourceColumn = sourceRow?.columns?.[source.columnIndex];
    const targetRow = layout.rows[target.rowIndex];
    const targetColumn = targetRow?.columns?.[target.columnIndex];

    if (!sourceColumn || !targetColumn) {
      return;
    }

    const sourceParentLayout =
      source.layoutChildIndex !== undefined && Array.isArray(sourceColumn.modules)
        ? sourceColumn.modules[source.moduleIndex]
        : undefined;

    const targetParentLayout =
      target.moduleIndex !== undefined && Array.isArray(targetColumn.modules)
        ? targetColumn.modules[target.moduleIndex]
        : undefined;

    const sourceList =
      source.layoutChildIndex !== undefined && isLayoutModuleType(sourceParentLayout?.type)
        ? sourceParentLayout.modules
        : sourceColumn.modules;

    const targetList =
      (target.type === 'layout' || target.type === 'layout-child') &&
      isLayoutModuleType(targetParentLayout?.type)
        ? targetParentLayout.modules
        : targetColumn.modules;

    if (!Array.isArray(targetList) || !Array.isArray(sourceList)) {
      return;
    }

    // Allow all layout types to contain other layout types (e.g. horizontal inside vertical)

    const sourceIndex =
      source.layoutChildIndex !== undefined ? source.layoutChildIndex : (source.moduleIndex ?? -1);

    if (!sourceRemoved && sourceIndex >= 0 && sourceIndex < sourceList.length) {
      sourceList.splice(sourceIndex, 1);
      sourceRemoved = true;
    }

    let insertIndex: number;
    if (target.type === 'layout-child' && target.childIndex !== undefined) {
      insertIndex = target.childIndex;
      if (position === 'after') {
        insertIndex += 1;
      }
    } else {
      insertIndex = position === 'before' ? 0 : targetList.length;
    }

    if (
      sourceRemoved &&
      sourceList === targetList &&
      sourceIndex >= 0 &&
      sourceIndex < insertIndex
    ) {
      insertIndex -= 1;
    }

    insertIndex = Math.max(0, Math.min(targetList.length, insertIndex));
    targetList.splice(insertIndex, 0, moduleToMove);
  }

  function moveColumn(layout: any, source: any, target: any): void {
    // Remove column from source row
    const sourceColumn = layout.rows[source.rowIndex].columns[source.columnIndex];
    layout.rows[source.rowIndex].columns.splice(source.columnIndex, 1);

    // Update source row's column layout after removal and clear custom sizing
    const sourceRowNewColumnCount = layout.rows[source.rowIndex].columns.length;
    delete layout.rows[source.rowIndex].custom_column_sizing;
    if (sourceRowNewColumnCount > 0) {
      const sourceDefaultLayout = getLayoutsForColumnCount(sourceRowNewColumnCount)[0];
      layout.rows[source.rowIndex].column_layout = sourceDefaultLayout
        ? sourceDefaultLayout.id
        : `repeat(${sourceRowNewColumnCount}, 1fr)`;
    }

    if (target.type === 'column') {
      // Reorder: insert at specific position within row
      let insertIdx = target.columnIndex ?? 0;
      // If same row and source was before target, adjust for the removal
      if (source.rowIndex === target.rowIndex && source.columnIndex < insertIdx) {
        insertIdx--;
      }
      layout.rows[target.rowIndex].columns.splice(insertIdx, 0, sourceColumn);
    } else if (target.type === 'row-inside') {
      // Drop on row header — insert at the TOP of the row's columns
      layout.rows[target.rowIndex].columns.splice(0, 0, sourceColumn);
    } else if (target.type === 'row') {
      // Add to end of target row
      layout.rows[target.rowIndex].columns.push(sourceColumn);
    }

    // Update target row's column layout after addition and clear custom sizing
    const targetRowNewColumnCount = layout.rows[target.rowIndex].columns.length;
    delete layout.rows[target.rowIndex].custom_column_sizing;
    const targetDefaultLayout = getLayoutsForColumnCount(targetRowNewColumnCount)[0];
    layout.rows[target.rowIndex].column_layout = targetDefaultLayout
      ? targetDefaultLayout.id
      : `repeat(${targetRowNewColumnCount}, 1fr)`;
  }

  function moveRow(layout: any, source: any, target: any): void {
    // Remove row from source
    const sourceRow = layout.rows[source.rowIndex];
    layout.rows.splice(source.rowIndex, 1);

    // Insert at target position
    const targetIndex = target.rowIndex;
    layout.rows.splice(targetIndex, 0, sourceRow);
  }

  function moveNestedChild(layout: any, source: any, target: any): void {
    // Handle moving nested child modules (modules inside nested layout modules)
    // Structure: Row -> Column -> Parent Layout (e.g., Slider) -> Nested Layout (e.g., Horizontal) -> Module
    const sourceParentLayout =
      layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
    const sourceNestedLayout = sourceParentLayout.modules[source.layoutChildIndex];
    const sourceModule = sourceNestedLayout.modules[source.nestedChildIndex];

    // Handle reordering within the same nested layout
    if (
      target.type === 'nested-child-target' &&
      source.rowIndex === target.rowIndex &&
      source.columnIndex === target.columnIndex &&
      source.moduleIndex === target.moduleIndex &&
      source.layoutChildIndex === target.layoutChildIndex
    ) {
      // Reordering within the same nested layout
      const sourceIdx = source.nestedChildIndex;
      let targetIdx = target.childIndex;

      if (sourceIdx === targetIdx) {
        return; // No change needed
      }

      // Remove from source position
      sourceNestedLayout.modules.splice(sourceIdx, 1);

      // Adjust target index if source was before target
      if (sourceIdx < targetIdx) {
        targetIdx--;
      }

      // Insert at target position
      sourceNestedLayout.modules.splice(targetIdx, 0, sourceModule);
      return;
    }

    // Remove from source
    sourceNestedLayout.modules.splice(source.nestedChildIndex, 1);

    // After removing a nested-child, adjust target indices that reference
    // the same nested layout's modules array to account for the shift.
    const sameNestedParent =
      target.rowIndex === source.rowIndex &&
      target.columnIndex === source.columnIndex &&
      target.moduleIndex === source.moduleIndex &&
      target.layoutChildIndex === source.layoutChildIndex;
    if (sameNestedParent) {
      // deep-nested-child-target uses nestedChildIndex into the same array
      if (target.nestedChildIndex != null && target.nestedChildIndex > source.nestedChildIndex) {
        target.nestedChildIndex--;
      }
      // nested-child-target uses childIndex as insertion position in the same array
      if (
        target.type === 'nested-child-target' &&
        target.childIndex != null &&
        target.childIndex > source.nestedChildIndex
      ) {
        target.childIndex--;
      }
    }

    // Add to target based on target type
    if (target.type === 'module' || target.type === 'column') {
      // Moving to a regular column
      const targetColumn = layout.rows[target.rowIndex].columns[target.columnIndex];
      const targetIndex =
        target.moduleIndex !== undefined ? target.moduleIndex : targetColumn.modules.length;
      targetColumn.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'layout') {
      // Moving to a layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      if (!targetLayoutModule.modules) {
        targetLayoutModule.modules = [];
      }
      targetLayoutModule.modules.push(sourceModule);
    } else if (target.type === 'layout-child') {
      // Moving to another position within a layout module (1st level nesting)
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      if (!targetLayoutModule.modules) {
        targetLayoutModule.modules = [];
      }
      const targetIndex =
        target.childIndex !== undefined ? target.childIndex : targetLayoutModule.modules.length;
      targetLayoutModule.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'nested-child-target') {
      // Moving to a different nested layout (different parent or different nested layout)
      const targetParentLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetParentLayout.modules[target.layoutChildIndex];
      if (!targetNestedLayout.modules) {
        targetNestedLayout.modules = [];
      }
      const targetIndex =
        target.childIndex !== undefined ? target.childIndex : targetNestedLayout.modules.length;
      targetNestedLayout.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'nested-layout') {
      // Moving into a nested layout (e.g. dropping on a nested layout header with 'inside')
      const targetParentLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetParentLayout?.modules?.[(target as any).nestedLayoutIndex];
      if (targetNestedLayout) {
        if (!targetNestedLayout.modules) {
          targetNestedLayout.modules = [];
        }
        targetNestedLayout.modules.push(sourceModule);
      } else {
        // Safety: target nested layout not found, restore source to prevent disappearance
        sourceNestedLayout.modules.splice(source.nestedChildIndex, 0, sourceModule);
      }
    } else if (target.type === 'deep-nested-child-target') {
      // Moving to a deep nested layout (level 3)
      const targetTopLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetTopLayout.modules[target.layoutChildIndex];
      const targetDeepLayout = targetNestedLayout.modules[target.nestedChildIndex];
      if (!targetDeepLayout.modules) {
        targetDeepLayout.modules = [];
      }
      const insertIdx =
        target.childIndex !== undefined ? target.childIndex : targetDeepLayout.modules.length;
      targetDeepLayout.modules.splice(insertIdx, 0, sourceModule);
    } else if (target.type === 'path-child-target' && target.parentPath) {
      const targetList = resolveModuleList(layout, target.parentPath);
      if (targetList) {
        const insertIdx = target.childIndex !== undefined ? target.childIndex : targetList.length;
        targetList.splice(insertIdx, 0, sourceModule);
      }
    }
  }

  function moveDeepNestedChild(layout: any, source: any, target: any): void {
    // Handle moving deep nested child modules (e.g. module inside Popup -> Horizontal -> Vertical)
    const sourceTopLayout =
      layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
    const sourceNestedLayout = sourceTopLayout.modules[source.layoutChildIndex];
    const sourceDeepNestedLayout = sourceNestedLayout.modules[source.nestedChildIndex];
    const sourceModule = sourceDeepNestedLayout.modules[source.deepNestedChildIndex];

    // Handle reordering within the same deep nested layout
    if (
      target.type === 'deep-nested-child-target' &&
      source.rowIndex === target.rowIndex &&
      source.columnIndex === target.columnIndex &&
      source.moduleIndex === target.moduleIndex &&
      source.layoutChildIndex === target.layoutChildIndex &&
      source.nestedChildIndex === target.nestedChildIndex
    ) {
      const sourceIdx = source.deepNestedChildIndex;
      let targetIdx = target.childIndex;

      if (sourceIdx === targetIdx) return;

      sourceDeepNestedLayout.modules.splice(sourceIdx, 1);
      if (sourceIdx < targetIdx) targetIdx--;
      sourceDeepNestedLayout.modules.splice(targetIdx, 0, sourceModule);
      return;
    }

    // Remove from source
    sourceDeepNestedLayout.modules.splice(source.deepNestedChildIndex, 1);

    // After removing a deep-nested-child, adjust target indices that reference
    // the same deep nested layout's modules array to account for the shift.
    const sameDeepParent =
      target.rowIndex === source.rowIndex &&
      target.columnIndex === source.columnIndex &&
      target.moduleIndex === source.moduleIndex &&
      target.layoutChildIndex === source.layoutChildIndex &&
      target.nestedChildIndex === source.nestedChildIndex;
    if (sameDeepParent) {
      if (
        target.type === 'deep-nested-child-target' &&
        target.childIndex != null &&
        target.childIndex > source.deepNestedChildIndex
      ) {
        target.childIndex--;
      }
    }

    // Add to target based on target type
    if (target.type === 'deep-nested-child-target') {
      // Moving to a different deep nested layout
      const targetTopLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetTopLayout.modules[target.layoutChildIndex];
      const targetDeepLayout = targetNestedLayout.modules[target.nestedChildIndex];
      if (!targetDeepLayout.modules) targetDeepLayout.modules = [];
      const insertIdx =
        target.childIndex !== undefined ? target.childIndex : targetDeepLayout.modules.length;
      targetDeepLayout.modules.splice(insertIdx, 0, sourceModule);
    } else if (target.type === 'nested-child-target') {
      // Moving to a nested layout (level 2)
      const targetTopLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetTopLayout.modules[target.layoutChildIndex];
      if (!targetNestedLayout.modules) targetNestedLayout.modules = [];
      const insertIdx =
        target.childIndex !== undefined ? target.childIndex : targetNestedLayout.modules.length;
      targetNestedLayout.modules.splice(insertIdx, 0, sourceModule);
    } else if (target.type === 'module' || target.type === 'column') {
      // Moving to a regular column
      const targetColumn = layout.rows[target.rowIndex].columns[target.columnIndex];
      const targetIndex =
        target.moduleIndex !== undefined ? target.moduleIndex : targetColumn.modules.length;
      targetColumn.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'layout' || target.type === 'nested-layout') {
      // Moving to a layout module
      let targetLayoutModule: any;
      if (target.type === 'nested-layout') {
        const parentLayout =
          layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
        targetLayoutModule = parentLayout?.modules?.[(target as any).nestedLayoutIndex];
      } else {
        targetLayoutModule =
          layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      }
      if (!targetLayoutModule) return;
      if (!targetLayoutModule.modules) targetLayoutModule.modules = [];
      targetLayoutModule.modules.push(sourceModule);
    } else if (target.type === 'layout-child') {
      // Moving to a specific position within a layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      if (!targetLayoutModule.modules) targetLayoutModule.modules = [];
      const targetIndex =
        target.childIndex !== undefined ? target.childIndex : targetLayoutModule.modules.length;
      targetLayoutModule.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'path-child-target' && target.parentPath) {
      const targetList = resolveModuleList(layout, target.parentPath);
      if (targetList) {
        const insertIdx = target.childIndex !== undefined ? target.childIndex : targetList.length;
        targetList.splice(insertIdx, 0, sourceModule);
      }
    }
  }

  /** Move a path-child (level 5+ generic nesting) to a target. */
  function movePathChild(layout: any, source: any, target: any): void {
    const path = source.parentPath;
    if (!path || source.pathChildIndex === undefined) return;

    const sourceList = resolveModuleList(layout, path);
    if (!sourceList || source.pathChildIndex >= sourceList.length) return;

    const sourceModule = sourceList[source.pathChildIndex];

    // Same-container reorder: path-child-target with same path
    if (target.type === 'path-child-target' && target.parentPath) {
      const samePath =
        path.length === target.parentPath.length &&
        path.every((v: string, i: number) => v === target.parentPath![i]);
      if (samePath) {
        const sourceIdx = source.pathChildIndex;
        let targetIdx = target.childIndex ?? sourceIdx;
        if (sourceIdx === targetIdx) return;
        sourceList.splice(sourceIdx, 1);
        if (sourceIdx < targetIdx) targetIdx--;
        sourceList.splice(targetIdx, 0, sourceModule);
        return;
      }
    }

    // Remove from source
    sourceList.splice(source.pathChildIndex, 1);

    // Insert at target
    if (target.type === 'path-child-target' && target.parentPath) {
      const targetList = resolveModuleList(layout, target.parentPath);
      if (targetList) {
        const insertIdx = target.childIndex !== undefined ? target.childIndex : targetList.length;
        targetList.splice(insertIdx, 0, sourceModule);
      }
      return;
    }

    if (target.type === 'module' || target.type === 'column') {
      const targetColumn = layout.rows[target.rowIndex].columns[target.columnIndex];
      const targetIndex =
        target.moduleIndex !== undefined ? target.moduleIndex : targetColumn.modules.length;
      targetColumn.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'layout' || target.type === 'nested-layout') {
      let targetLayoutModule: any;
      if (target.type === 'nested-layout') {
        const parentLayout =
          layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
        targetLayoutModule = parentLayout?.modules?.[(target as any).nestedLayoutIndex];
      } else {
        targetLayoutModule =
          layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      }
      if (!targetLayoutModule) return;
      if (!targetLayoutModule.modules) targetLayoutModule.modules = [];
      targetLayoutModule.modules.push(sourceModule);
    } else if (target.type === 'layout-child') {
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      if (!targetLayoutModule.modules) targetLayoutModule.modules = [];
      const insertIdx =
        target.childIndex !== undefined ? target.childIndex : targetLayoutModule.modules.length;
      targetLayoutModule.modules.splice(insertIdx, 0, sourceModule);
    } else if (target.type === 'nested-child-target') {
      const targetTopLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetTopLayout.modules[target.layoutChildIndex];
      if (!targetNestedLayout.modules) targetNestedLayout.modules = [];
      const insertIdx =
        target.childIndex !== undefined ? target.childIndex : targetNestedLayout.modules.length;
      targetNestedLayout.modules.splice(insertIdx, 0, sourceModule);
    } else if (target.type === 'deep-nested-child-target') {
      const targetTopLayout =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetNestedLayout = targetTopLayout.modules[target.layoutChildIndex];
      const targetDeepLayout = targetNestedLayout.modules[target.nestedChildIndex];
      if (!targetDeepLayout.modules) targetDeepLayout.modules = [];
      const insertIdx =
        target.childIndex !== undefined ? target.childIndex : targetDeepLayout.modules.length;
      targetDeepLayout.modules.splice(insertIdx, 0, sourceModule);
    }
  }

  /**
   * Move a module from inside a tabs section to another location in the layout
   */
  function moveTabsSectionChild(layout: any, source: any, target: any): void {
    // Get the source tabs module
    let sourceTabsModule: any;
    if (source.isNested && source.parentLayoutChildIndex !== undefined) {
      const parentLayout =
        layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
      sourceTabsModule = parentLayout.modules[source.parentLayoutChildIndex];
    } else {
      sourceTabsModule =
        layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
    }

    // Get the module from the tabs section
    if (!sourceTabsModule?.sections?.[source.sectionIndex]?.modules?.[source.childIndex]) {
      return;
    }

    // Extract the module
    const sourceModule = sourceTabsModule.sections[source.sectionIndex].modules.splice(
      source.childIndex,
      1
    )[0];

    // Add to target based on target type
    if (target.type === 'module' || target.type === 'column') {
      // Moving to a regular column
      const targetColumn = layout.rows[target.rowIndex].columns[target.columnIndex];
      const targetIndex =
        target.moduleIndex !== undefined ? target.moduleIndex : targetColumn.modules.length;
      targetColumn.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'layout') {
      // Moving to a layout module (horizontal, vertical, etc.)
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      if (!targetLayoutModule.modules) {
        targetLayoutModule.modules = [];
      }
      targetLayoutModule.modules.push(sourceModule);
    } else if (target.type === 'layout-child') {
      // Moving to a specific position within a layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      if (!targetLayoutModule.modules) {
        targetLayoutModule.modules = [];
      }
      const targetIndex =
        target.childIndex !== undefined ? target.childIndex : targetLayoutModule.modules.length;
      targetLayoutModule.modules.splice(targetIndex, 0, sourceModule);
    }
  }
