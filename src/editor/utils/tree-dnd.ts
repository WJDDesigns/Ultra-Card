/**
 * Pragmatic Drag and Drop integration for the tree view editor.
 *
 * Provides a Lit directive (`treeDndNode`) that attaches Pragmatic DnD
 * `draggable` / `dropTargetForElements` to any tree-node element, plus a
 * centralised monitor helper that translates Pragmatic DnD events into
 * the existing `_performMove(source, target)` calls.
 */

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { Directive, directive, type ElementPart, type PartInfo, PartType } from 'lit/directive.js';
import { noChange } from 'lit';

// ────────────────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────────────────

/** Marker key so the monitor can filter our drags from 3rd-party ones. */
const TREE_DRAG_KEY = '__treeDrag';

/** Source types that can be dragged. */
export type DragSourceType =
  | 'module'
  | 'column'
  | 'row'
  | 'layout-child'
  | 'nested-child'
  | 'deep-nested-child'
  | 'path-child'
  | 'tabs-section-child';

/** Target types that can receive a drop. */
export type DropTargetType =
  | 'module'
  | 'column'
  | 'row'
  | 'layout'
  | 'nested-layout'
  | 'layout-child'
  | 'nested-child-target'
  | 'deep-nested-child-target'
  | 'path-child-target';

/** Data carried by every drag source and drop target. */
export interface TreeNodeData {
  /** Drag-source type (modules, columns, rows, nested variants). */
  type: DragSourceType;
  /** The *target* type used for drop-validation and _performMove. */
  targetType: DropTargetType;
  rowIndex: number;
  columnIndex?: number;
  moduleIndex?: number;
  layoutChildIndex?: number;
  nestedChildIndex?: number;
  deepNestedChildIndex?: number;
  parentPath?: number[];
  pathChildIndex?: number;
  /** Serialised module data carried along for the move. */
  data?: unknown;
  /** When true this target represents "insert inside this layout". */
  isInsideTarget?: boolean;
  /** Nested layout index (used for nested-layout inside targets). */
  nestedLayoutIndex?: number;
}

export interface TreeDndNodeOptions {
  /** Make the element draggable (default true). */
  isDraggable?: boolean;
  /** Make the element a drop target (default true). */
  isDropTarget?: boolean;
  /** For layout headers – the target represents "insert inside". */
  isInsideTarget?: boolean;
  /** Allowed closest-edge sides (default ['top','bottom']). */
  allowedEdges?: Edge[];
}

/** Resolved result the monitor passes back to the host. */
export interface TreeDropResult {
  sourceData: TreeNodeData;
  targetData: TreeNodeData;
  edge: Edge | null;
}

// ────────────────────────────────────────────────────────────
//  Internal tracking
// ────────────────────────────────────────────────────────────

interface AttachedEntry {
  cleanup: () => void;
  dataRef: { current: TreeNodeData };
  optionsRef: { current: TreeDndNodeOptions };
}

/**
 * WeakMap keyed by DOM element.
 * Pragmatic DnD auto-cleans when the element leaves the document,
 * so we don't need explicit teardown per-element.
 */
const _attached = new WeakMap<HTMLElement, AttachedEntry>();

// ────────────────────────────────────────────────────────────
//  Directive – treeDndNode
// ────────────────────────────────────────────────────────────

class TreeDndNodeDirective extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('treeDndNode can only be used as an element directive');
    }
  }

  /* Lit calls render() first; we return noChange because this is side-effect-only. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(_data: Omit<TreeNodeData, typeof TREE_DRAG_KEY>, _opts?: TreeDndNodeOptions) {
    return noChange;
  }

  override update(
    part: ElementPart,
    [data, opts]: [Omit<TreeNodeData, typeof TREE_DRAG_KEY>, TreeDndNodeOptions?]
  ) {
    const el = part.element as HTMLElement;
    const options: TreeDndNodeOptions = opts ?? {};
    const fullData: TreeNodeData = { ...data };

    const existing = _attached.get(el);
    if (existing) {
      // Element already has DnD attached – just update the data reference
      // so that lazy getInitialData / getData calls return the latest indices.
      existing.dataRef.current = fullData;
      existing.optionsRef.current = options;
    } else {
      // First render for this element – attach Pragmatic DnD.
      const dataRef = { current: fullData };
      const optionsRef = { current: options };
      const cleanup = this._attach(el, dataRef, optionsRef);
      _attached.set(el, { cleanup, dataRef, optionsRef });
    }

    return noChange;
  }

  // ── helpers ──────────────────────────────────────────────

  private _attach(
    el: HTMLElement,
    dataRef: { current: TreeNodeData },
    optionsRef: { current: TreeDndNodeOptions }
  ): () => void {
    const parts: (() => void)[] = [];

    // ─── Draggable ───────────────────────────────────────
    if (optionsRef.current.isDraggable !== false) {
      parts.push(
        draggable({
          element: el,
          getInitialData: () => ({
            ...dataRef.current,
            [TREE_DRAG_KEY]: true,
          }),
          onDragStart() {
            el.classList.add('pdnd-dragging');
          },
          onDrop() {
            el.classList.remove('pdnd-dragging');
          },
        })
      );
    }

    // ─── Drop target ─────────────────────────────────────
    if (optionsRef.current.isDropTarget !== false) {
      parts.push(
        dropTargetForElements({
          element: el,
          canDrop: ({ source }) => !!(source.data as Record<string, unknown>)[TREE_DRAG_KEY],
          getData: ({ input, element: targetEl }) => {
            const d: Record<string, unknown> = {
              ...dataRef.current,
              [TREE_DRAG_KEY]: true,
            };
            if (optionsRef.current.isInsideTarget) {
              d.isInsideTarget = true;
              return d;
            }
            return attachClosestEdge(d, {
              input,
              element: targetEl,
              allowedEdges: optionsRef.current.allowedEdges ?? ['top', 'bottom'],
            });
          },
          getIsSticky: () => true,
          onDragEnter() {
            el.classList.add('pdnd-over');
          },
          onDragLeave() {
            el.classList.remove('pdnd-over');
          },
          onDrop() {
            el.classList.remove('pdnd-over');
          },
        })
      );
    }

    if (parts.length === 0) return () => {};
    return parts.length === 1 ? parts[0] : combine(...parts);
  }
}

/**
 * Lit element directive that makes a tree node both draggable and a drop target.
 *
 * Usage inside a Lit `html` template:
 *
 * ```ts
 * html`<div class="tree-node" ${treeDndNode(
 *   { type: 'module', targetType: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 1 }
 * )}>…</div>`
 * ```
 *
 * For layout headers (insert-inside zone):
 *
 * ```ts
 * html`<div class="tree-node-header" ${treeDndNode(
 *   { type: 'module', targetType: 'layout', rowIndex: 0, columnIndex: 0, moduleIndex: 1 },
 *   { isDraggable: false, isInsideTarget: true }
 * )}>…</div>`
 * ```
 */
export const treeDndNode = directive(TreeDndNodeDirective);

// ────────────────────────────────────────────────────────────
//  Monitor – translates Pragmatic DnD events to TreeDropResult
// ────────────────────────────────────────────────────────────

export type OnTreeDrop = (result: TreeDropResult) => void;

export interface TreeDragState {
  isDragging: boolean;
  sourceData: TreeNodeData | null;
  targetData: TreeNodeData | null;
  targetElement: Element | null;
  edge: Edge | null;
  isInside: boolean;
}

export type OnTreeDragStateChange = (state: TreeDragState) => void;

/**
 * Set up a global monitor that converts Pragmatic DnD drop events into
 * `TreeDropResult` objects.  Returns a cleanup function.
 */
export function setupTreeMonitor(
  onDrop: OnTreeDrop,
  onStateChange?: OnTreeDragStateChange
): () => void {
  return monitorForElements({
    canMonitor: ({ source }) => !!(source.data as Record<string, unknown>)[TREE_DRAG_KEY],

    onDragStart({ source }) {
      onStateChange?.({
        isDragging: true,
        sourceData: source.data as unknown as TreeNodeData,
        targetData: null,
        targetElement: null,
        edge: null,
        isInside: false,
      });
    },

    onDrag({ location }) {
      const target = location.current.dropTargets[0];
      if (!target) {
        onStateChange?.({
          isDragging: true,
          sourceData: null,
          targetData: null,
          targetElement: null,
          edge: null,
          isInside: false,
        });
        return;
      }
      const tData = target.data as unknown as TreeNodeData;
      const edge = extractClosestEdge(target.data) as Edge | null;
      const isInside = !!(target.data as Record<string, unknown>).isInsideTarget;
      onStateChange?.({
        isDragging: true,
        sourceData: null,
        targetData: tData,
        targetElement: target.element,
        edge,
        isInside,
      });
    },

    onDrop({ source, location }) {
      onStateChange?.({
        isDragging: false,
        sourceData: null,
        targetData: null,
        targetElement: null,
        edge: null,
        isInside: false,
      });

      const target = location.current.dropTargets[0];
      if (!target) return;

      const sourceData = source.data as unknown as TreeNodeData;
      const targetData = target.data as unknown as TreeNodeData;
      const edge = extractClosestEdge(target.data) as Edge | null;

      onDrop({ sourceData, targetData, edge });
    },
  });
}

// ────────────────────────────────────────────────────────────
//  Utility – extract closest edge (re-export for convenience)
// ────────────────────────────────────────────────────────────
export { extractClosestEdge, type Edge };
