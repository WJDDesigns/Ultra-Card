/**
 * Pointer interaction engine for FreeSpace edit mode.
 *
 * Uses Pointer Events + setPointerCapture. Emits artboard-unit deltas
 * (caller divides client coords by scale before calling into geometry).
 */

import {
  type FreeSpaceCardLayout,
  type InteractionMode,
  type InteractionState,
  type ResizeHandle,
} from './types';
import {
  angleFromCentre,
  applyMove,
  applyResize,
  applyRotate,
  cardCentre,
} from './uc-freespace-geometry';

export const DRAG_THRESHOLD_PX = 4;
export const LONG_PRESS_MS = 250;

export interface InteractionCallbacks {
  onStart?: (state: InteractionState) => void;
  onMove: (state: InteractionState) => void;
  onEnd: (state: InteractionState, cancelled: boolean) => void;
  /** Click / tap without drag → select only (does not open edit). */
  onClick?: (cardIndex: number) => void;
  /** Second click within the double-click window → open edit. */
  onDoubleClick?: (cardIndex: number) => void;
}

export const DOUBLE_CLICK_MS = 350;

export class FreeSpaceInteractionEngine {
  private _state: InteractionState | null = null;
  private _longPressTimer: number | null = null;
  private _scale = 1;
  private _callbacks: InteractionCallbacks;
  private _shiftKey = false;
  private _onKeyDown: (ev: KeyboardEvent) => void;
  private _onKeyUp: (ev: KeyboardEvent) => void;
  private _lastClick: { index: number; time: number } | null = null;

  constructor(callbacks: InteractionCallbacks) {
    this._callbacks = callbacks;
    this._onKeyDown = (ev: KeyboardEvent) => {
      this._shiftKey = ev.shiftKey;
      if (ev.key === 'Escape' && this._state) {
        this.cancel();
      }
    };
    this._onKeyUp = (ev: KeyboardEvent) => {
      this._shiftKey = ev.shiftKey;
    };
  }

  get state(): InteractionState | null {
    return this._state;
  }

  setScale(scale: number): void {
    this._scale = scale > 0 ? scale : 1;
  }

  attachWindowListeners(): void {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  detachWindowListeners(): void {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this._clearLongPress();
  }

  /**
   * Begin an interaction. For touch, waits LONG_PRESS_MS before committing to
   * move/resize/rotate so a quick tap still selects (and double-tap edits).
   */
  pointerDown(
    ev: PointerEvent,
    opts: {
      cardIndex: number;
      mode: Exclude<InteractionMode, 'idle'>;
      handle?: ResizeHandle | undefined;
      origin: FreeSpaceCardLayout;
      /** Target element for setPointerCapture. */
      captureTarget: Element;
    }
  ): void {
    if (this._state) return;
    const isTouch = ev.pointerType === 'touch';
    this._shiftKey = ev.shiftKey;

    const start = (): void => {
      const centre = cardCentre(opts.origin);
      const artboard = this._clientToArtboard(ev.clientX, ev.clientY);
      const state: InteractionState = {
        mode: opts.mode,
        cardIndex: opts.cardIndex,
        startX: artboard.x,
        startY: artboard.y,
        origin: { ...opts.origin },
        current: { ...opts.origin },
        pointerId: ev.pointerId,
        moved: false,
        clientStartX: ev.clientX,
        clientStartY: ev.clientY,
      };
      if (opts.handle !== undefined) state.handle = opts.handle;
      if (opts.mode === 'rotate') {
        state.startAngle = angleFromCentre(centre.cx, centre.cy, artboard.x, artboard.y);
      }
      this._state = state;
      try {
        (opts.captureTarget as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture?.(
          ev.pointerId
        );
      } catch {
        // ignore
      }
      this._callbacks.onStart?.(state);
    };

    if (isTouch && opts.mode === 'move') {
      this._clearLongPress();
      this._longPressTimer = window.setTimeout(() => {
        this._longPressTimer = null;
        start();
      }, LONG_PRESS_MS);
      // Stash enough to finish a tap if we never start
      this._state = {
        mode: 'idle',
        cardIndex: opts.cardIndex,
        startX: 0,
        startY: 0,
        origin: { ...opts.origin },
        current: { ...opts.origin },
        pointerId: ev.pointerId,
        moved: false,
        clientStartX: ev.clientX,
        clientStartY: ev.clientY,
      } as InteractionState;
      return;
    }

    ev.preventDefault();
    start();
  }

  pointerMove(ev: PointerEvent): void {
    // Cancel pending long-press if the finger moved
    if (this._longPressTimer !== null) {
      const dx = ev.clientX - (this._state?.clientStartX ?? ev.clientX);
      const dy = ev.clientY - (this._state?.clientStartY ?? ev.clientY);
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
        this._clearLongPress();
        this._state = null;
      }
      return;
    }

    if (!this._state || this._state.mode === 'idle') return;
    if (ev.pointerId !== this._state.pointerId) return;

    const dxClient = ev.clientX - this._state.clientStartX;
    const dyClient = ev.clientY - this._state.clientStartY;
    if (!this._state.moved && Math.hypot(dxClient, dyClient) < DRAG_THRESHOLD_PX) {
      return;
    }
    this._state.moved = true;
    this._shiftKey = ev.shiftKey;

    const artboard = this._clientToArtboard(ev.clientX, ev.clientY);
    const dx = artboard.x - this._state.startX;
    const dy = artboard.y - this._state.startY;

    let next: FreeSpaceCardLayout;
    if (this._state.mode === 'move') {
      next = applyMove(this._state.origin, dx, dy);
    } else if (this._state.mode === 'resize' && this._state.handle) {
      next = applyResize(this._state.origin, this._state.handle, dx, dy);
    } else if (this._state.mode === 'rotate' && this._state.startAngle !== undefined) {
      const centre = cardCentre(this._state.origin);
      const currentAngle = angleFromCentre(centre.cx, centre.cy, artboard.x, artboard.y);
      next = applyRotate(
        this._state.origin,
        this._state.startAngle,
        currentAngle,
        this._shiftKey
      );
    } else {
      return;
    }

    this._state.current = next;
    this._callbacks.onMove(this._state);
  }

  pointerUp(ev: PointerEvent): void {
    if (this._longPressTimer !== null) {
      // Tap: never started a drag
      this._clearLongPress();
      const index = this._state?.cardIndex;
      this._state = null;
      if (index !== undefined) this._emitClick(index);
      return;
    }

    if (!this._state || this._state.mode === 'idle') {
      this._state = null;
      return;
    }
    if (ev.pointerId !== this._state.pointerId) return;

    const state = this._state;
    this._state = null;

    if (!state.moved && state.mode === 'move') {
      this._emitClick(state.cardIndex);
      return;
    }

    this._callbacks.onEnd(state, false);
  }

  private _emitClick(cardIndex: number): void {
    const now = Date.now();
    const prev = this._lastClick;
    if (prev && prev.index === cardIndex && now - prev.time <= DOUBLE_CLICK_MS) {
      this._lastClick = null;
      this._callbacks.onDoubleClick?.(cardIndex);
      return;
    }
    this._lastClick = { index: cardIndex, time: now };
    this._callbacks.onClick?.(cardIndex);
  }

  cancel(): void {
    this._clearLongPress();
    if (!this._state || this._state.mode === 'idle') {
      this._state = null;
      return;
    }
    const state = this._state;
    state.current = { ...state.origin };
    this._state = null;
    this._callbacks.onEnd(state, true);
  }

  private _clientToArtboard(clientX: number, clientY: number): { x: number; y: number } {
    // The view impl supplies absolute artboard coords via a custom path when
    // it has the artboard rect; the engine itself only knows scale. Callers
    // that need absolute coords should pass pre-converted values through
    // pointerDown's origin and use deltas from startX/startY — which are set
    // from client/scale here as a fallback when no artboard origin is known.
    // The view overrides via setArtboardOrigin.
    const origin = this._artboardOrigin;
    return {
      x: (clientX - origin.left) / this._scale,
      y: (clientY - origin.top) / this._scale,
    };
  }

  private _artboardOrigin = { left: 0, top: 0 };

  setArtboardOrigin(left: number, top: number): void {
    this._artboardOrigin = { left, top };
  }

  private _clearLongPress(): void {
    if (this._longPressTimer !== null) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }
}
