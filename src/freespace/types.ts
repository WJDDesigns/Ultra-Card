/** FreeSpace view options stored on the Lovelace view config. */
export interface FreeSpaceViewOptions {
  /**
   * Legacy single artboard width (desktop). Prefer `canvas_widths` when set.
   * Kept so existing YAML keeps working.
   */
  canvas_width: number;
  /** Optional per-breakpoint artboard widths in design units. */
  canvas_widths?: Partial<Record<'desktop' | 'laptop' | 'tablet' | 'phone', number>>;
  /** Minimum artboard height; grows to fit content. */
  min_height: number;
  /** Snap step in units; 0 disables snapping. */
  grid: number;
  /**
   * When phone has no explicit layout: `stack` stacks cards in reading order;
   * `scale` keeps the scaled artboard (fallback layout from larger breakpoints).
   */
  narrow: 'stack' | 'scale';
}

/** Per-card layout stored under `view_layout`. */
export interface FreeSpaceCardLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Rotation in degrees. */
  r: number;
  /** Layer order (higher = on top). */
  z: number;
  /** Horizontal pin when the artboard width changes. Omitted = left. */
  pin?: FreeSpacePin;
  /** Artboard width the x/w were saved at; required for non-left pins. */
  ref_w?: number;
}

export type FreeSpacePin = 'left' | 'right' | 'center' | 'stretch';

export const FREESPACE_PINS: readonly FreeSpacePin[] = ['left', 'center', 'right', 'stretch'];

export type FreeSpaceAlign = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export const FREESPACE_VIEW_TYPE = 'custom:ultra-freespace-view';
export const FREESPACE_ELEMENT_TAG = 'ultra-freespace-view';
export const FREESPACE_IMPL_TAG = 'ultra-freespace-view-impl';
export const FREESPACE_ITEM_TAG = 'uc-freespace-item';

export const DEFAULT_CANVAS_WIDTH = 1200;
export const DEFAULT_MIN_HEIGHT = 800;
export const DEFAULT_GRID = 8;
export const DEFAULT_CARD_W = 320;
export const DEFAULT_CARD_H = 160;
export const MIN_CARD_W = 80;
export const MIN_CARD_H = 60;
export const ARTBOARD_PADDING = 24;

export const DEFAULT_FREESPACE_OPTIONS: FreeSpaceViewOptions = {
  canvas_width: DEFAULT_CANVAS_WIDTH,
  min_height: DEFAULT_MIN_HEIGHT,
  grid: DEFAULT_GRID,
  narrow: 'stack',
};

export type ResizeHandle =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

export type InteractionMode = 'idle' | 'move' | 'resize' | 'rotate';

export interface InteractionState {
  mode: InteractionMode;
  cardIndex: number;
  handle?: ResizeHandle | undefined;
  /** Pointer start in artboard units. */
  startX: number;
  startY: number;
  /** Layout at pointer-down. */
  origin: FreeSpaceCardLayout;
  /** Current live layout (optimistic). */
  current: FreeSpaceCardLayout;
  /** Pointer id for setPointerCapture. */
  pointerId: number;
  /** Whether we have moved past the drag threshold. */
  moved: boolean;
  /** Viewport client coords at start (for threshold). */
  clientStartX: number;
  clientStartY: number;
  /** Angle at rotate start (degrees), relative to card centre. */
  startAngle?: number | undefined;
}
