import { HomeAssistant } from 'custom-card-helpers';
import { UltraLinkComponent, TapActionConfig } from '../components/ultra-link';
import { CardModule, UltraCardConfig } from '../types';

/**
 * Configuration for gesture handler
 */
export interface GestureConfig {
  tap_action?: TapActionConfig | undefined;
  hold_action?: TapActionConfig | undefined;
  double_tap_action?: TapActionConfig | undefined;
  entity?: string | undefined;
  module?: CardModule | undefined;
}

/**
 * Check if an action is EXPLICITLY set to "nothing" (should not trigger any action)
 * Handles 'nothing' and 'none' action types.
 *
 * Note: undefined/null actions are NOT considered "nothing" - they should fall through
 * to use the default action behavior (more-info for the entity).
 *
 * @param action - The action configuration to check
 * @returns true if action is explicitly set to nothing/none, false otherwise
 */
function isExplicitNothingAction(action: TapActionConfig | undefined | null): boolean {
  // No action configured - NOT nothing, should use default
  if (!action) return false;

  // Check for explicit nothing/none action types
  const actionType = action.action;
  if (actionType === 'nothing' || actionType === 'none') return true;

  return false;
}

/**
 * Pixel distance (CSS px) the pointer can travel before we treat the gesture
 * as a scroll/drag instead of a tap. Matches the threshold browsers use to
 * suppress synthetic click events on touch.
 */
const SCROLL_CANCEL_THRESHOLD_PX = 10;

/** Elements that handle Enter/Space themselves, so a wrapper must not act too. */
const NATIVELY_INTERACTIVE = new Set([
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'ha-icon-button',
  'ha-switch',
  'ha-slider',
  'ha-textfield',
  'ha-select',
  'ha-control-switch',
  'ha-control-slider',
]);

/**
 * Whether a keyboard event landed on a control nested inside the gesture element
 * rather than on the element itself.
 */
function isInteractiveElement(target: HTMLElement, boundary: HTMLElement): boolean {
  let node: HTMLElement | null = target;
  while (node && node !== boundary) {
    const tag = node.tagName?.toLowerCase?.();
    if (tag && NATIVELY_INTERACTIVE.has(tag)) return true;
    if (node.getAttribute?.('role') === 'button') return true;
    if (node.hasAttribute?.('tabindex') && node.getAttribute('tabindex') !== '-1') return true;
    node = node.parentElement;
  }
  return false;
}

/**
 * Whether a gesture config would actually do something when activated.
 *
 * Use before adding role="button" and tabindex="0": announcing a button that does
 * nothing, or putting a decorative element in the tab order, is worse for
 * keyboard and screen-reader users than leaving it alone. An undefined action is
 * actionable when there is an entity, because it falls through to more-info.
 */
export function hasActionableGesture(config: GestureConfig): boolean {
  const { tap_action, hold_action, double_tap_action, entity } = config;
  const actions = [tap_action, hold_action, double_tap_action];
  if (actions.some(action => action && !isExplicitNothingAction(action))) return true;
  // All three unset falls through to the default more-info action.
  return actions.every(action => !action) && !!entity;
}

/**
 * Gesture state for tracking multi-touch interactions
 */
interface GestureState {
  holdTimeout: NodeJS.Timeout | null;
  clickTimeout: NodeJS.Timeout | null;
  isHolding: boolean;
  clickCount: number;
  lastClickTime: number;
  // Movement tracking: when the pointer travels too far between pointerdown
  // and pointerup we treat the interaction as a scroll/drag and suppress
  // the tap action. This mirrors the native browser behavior that the info
  // module benefits from by using plain @click.
  startX: number;
  startY: number;
  startPointerId: number | null;
  hasMoved: boolean;
}

/**
 * Centralized gesture service for handling tap, hold, and double-tap interactions
 *
 * This service provides consistent gesture handling across all Ultra Card modules,
 * preventing double-click bugs and ensuring proper event propagation control.
 *
 * Features:
 * - Prevents event bubbling with stopPropagation
 * - Handles touch + pointer event conflicts
 * - Supports tap, hold, and double-tap actions
 * - Smart default action resolution
 * - Consistent timing thresholds (500ms hold, 300ms double-tap)
 *
 * Usage:
 * ```typescript
 * const handlers = ucGestureService.createGestureHandlers(
 *   elementId,
 *   {
 *     tap_action: module.tap_action,
 *     hold_action: module.hold_action,
 *     double_tap_action: module.double_tap_action,
 *     entity: module.entity,
 *     module: module
 *   },
 *   hass,
 *   config
 * );
 *
 * return html`
 *   <div
 *     @pointerdown=${handlers.onPointerDown}
 *     @pointermove=${handlers.onPointerMove}
 *     @pointerup=${handlers.onPointerUp}
 *     @pointerleave=${handlers.onPointerLeave}
 *     @pointercancel=${handlers.onPointerCancel}
 *     @keydown=${handlers.onKeyDown}
 *     role=${handlers.isActionable ? 'button' : nothing}
 *     tabindex=${handlers.isActionable ? '0' : nothing}
 *   >
 *     Content here
 *   </div>
 * `;
 * ```
 *
 * Bind `@keydown` on anything a user can activate, or it is unreachable without a
 * pointer. On a plain element add `role="button"` and `tabindex="0"` as above; on a
 * native `<button>` the keydown binding alone is enough. Both are gated on
 * `isActionable` so decorative elements stay out of the tab order.
 *
 * Do not make a layout container (horizontal, vertical, stack, tabs) a button.
 * Announcing a region as a button and putting a large element in the tab order
 * ahead of the real controls inside it is worse than leaving it pointer-only.
 *
 * Bind `@pointermove` so the service can detect scroll/drag gestures and
 * suppress the tap action when the user is just trying to scroll the page
 * (a common issue on mobile where small finger movements still triggered
 * a tap before this was added).
 */
export class UcGestureService {
  private static instance: UcGestureService;
  private gestureStates: Map<string, GestureState> = new Map();

  private constructor() {}

  static getInstance(): UcGestureService {
    if (!UcGestureService.instance) {
      UcGestureService.instance = new UcGestureService();
    }
    return UcGestureService.instance;
  }

  /**
   * Get or create gesture state for a specific element
   */
  private getGestureState(elementId: string): GestureState {
    if (!this.gestureStates.has(elementId)) {
      this.gestureStates.set(elementId, {
        holdTimeout: null,
        clickTimeout: null,
        isHolding: false,
        clickCount: 0,
        lastClickTime: 0,
        startX: 0,
        startY: 0,
        startPointerId: null,
        hasMoved: false,
      });
    }
    return this.gestureStates.get(elementId)!;
  }

  /**
   * Clear gesture state for a specific element
   */
  private clearGestureState(elementId: string): void {
    const state = this.gestureStates.get(elementId);
    if (state) {
      if (state.holdTimeout) {
        clearTimeout(state.holdTimeout);
        state.holdTimeout = null;
      }
      if (state.clickTimeout) {
        clearTimeout(state.clickTimeout);
        state.clickTimeout = null;
      }
      state.isHolding = false;
      state.clickCount = 0;
      state.startPointerId = null;
      state.hasMoved = false;
    }
  }

  /**
   * Create gesture handlers for an element
   *
   * @param elementId - Unique identifier for this element (use module.id or icon.id)
   * @param config - Gesture configuration including actions
   * @param hass - Home Assistant instance
   * @param cardConfig - Ultra Card configuration
   * @param excludeSelectors - CSS selectors to exclude from gesture handling (e.g., editor controls)
   *
   * @returns Object with onPointerDown, onPointerUp, onPointerLeave, and onPointerCancel handlers
   */
  createGestureHandlers(
    elementId: string,
    gestureConfig: GestureConfig,
    hass: HomeAssistant,
    cardConfig?: UltraCardConfig,
    excludeSelectors: string[] = []
  ) {
    const state = this.getGestureState(elementId);
    const { tap_action, hold_action, double_tap_action, entity, module } = gestureConfig;

    // Default exclude selectors for editor controls and interactive elements
    const defaultExcludeSelectors = [
      '.layout-child-actions',
      '.layout-child-drag-handle',
      '.nested-layout-drag-handle',
      '.layout-module-drag-handle',
      '.layout-child-simplified-module',
      '.nested-layout-module-container',
      '.layout-module-container',
      '.layout-module-actions',
      '.module-settings-popup',
      '.module-settings-panel',
      '.popup-content',
      '.popup-trigger', // Exclude popup trigger elements to prevent parent gesture conflicts
    ];

    const allExcludeSelectors = [...defaultExcludeSelectors, ...excludeSelectors];

    /**
     * Check if event target should be excluded from gesture handling
     */
    const shouldExcludeTarget = (target: HTMLElement): boolean => {
      return allExcludeSelectors.some(selector => target.closest(selector));
    };

    return {
      /**
       * Whether these handlers would do anything if activated. Gate role="button"
       * and tabindex="0" on this, so decorative elements stay out of the tab order.
       */
      isActionable: hasActionableGesture(gestureConfig),

      onPointerDown: (e: PointerEvent) => {
        const target = e.target as HTMLElement;

        // Don't handle events on excluded elements (editor controls)
        if (shouldExcludeTarget(target)) {
          return;
        }

        // CRITICAL: Stop propagation to avoid double-firing on parent gesture
        // handlers. We deliberately do NOT call preventDefault() here for
        // touch pointers, because that can interfere with the browser's
        // native scroll detection. Letting the browser still fire native
        // scroll/cancel events keeps mobile scrolling fluid; tap actions
        // are still routed exclusively through our pointerup handler.
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Reset movement tracking for this new gesture
        state.isHolding = false;
        state.startPointerId = e.pointerId;
        state.startX = e.clientX;
        state.startY = e.clientY;
        state.hasMoved = false;

        // Start hold timer if hold action is configured and not "nothing"
        // Skip hold timer entirely if hold action is explicitly nothing/none
        if (isExplicitNothingAction(hold_action)) {
          // Explicitly set to "nothing" or "none", don't start timer
          return;
        }

        // Start hold timer for configured actions or Default (undefined)
        state.holdTimeout = setTimeout(() => {
          // Suppress hold action if the user has started scrolling/dragging
          if (state.hasMoved) return;
          state.isHolding = true;
          UltraLinkComponent.handleAction(
            hold_action || ({ action: 'default', entity } as any),
            hass,
            target,
            cardConfig,
            entity,
            module
          );
        }, 500); // 500ms hold threshold
      },

      onPointerMove: (e: PointerEvent) => {
        // Only track the original pointer for this gesture
        if (state.startPointerId === null || e.pointerId !== state.startPointerId) {
          return;
        }

        // Already flagged as scrolling, no need to recompute
        if (state.hasMoved) return;

        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;
        if (Math.hypot(dx, dy) > SCROLL_CANCEL_THRESHOLD_PX) {
          // User is scrolling/dragging — cancel the pending hold and mark
          // the gesture so the upcoming pointerup will not fire a tap.
          state.hasMoved = true;
          if (state.holdTimeout) {
            clearTimeout(state.holdTimeout);
            state.holdTimeout = null;
          }
        }
      },

      onPointerUp: (e: PointerEvent) => {
        const target = e.target as HTMLElement;

        // Don't handle events on excluded elements (editor controls)
        if (shouldExcludeTarget(target)) {
          return;
        }

        // Stop propagation to avoid double-firing on parent gesture handlers.
        // See onPointerDown for why preventDefault() is intentionally omitted.
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Clear hold timer
        if (state.holdTimeout) {
          clearTimeout(state.holdTimeout);
          state.holdTimeout = null;
        }

        // If the user moved past the scroll threshold, treat this as a
        // scroll gesture and suppress the tap entirely. This is the fix
        // for mobile scrolling accidentally triggering buttons/icons.
        if (state.hasMoved) {
          state.hasMoved = false;
          state.isHolding = false;
          state.startPointerId = null;
          return;
        }

        // If this was a hold gesture, don't process as click
        if (state.isHolding) {
          state.isHolding = false;
          state.startPointerId = null;
          return;
        }

        state.startPointerId = null;

        const now = Date.now();
        const timeSinceLastClick = now - state.lastClickTime;

        // Double click detection (within 300ms)
        if (timeSinceLastClick < 300 && state.clickCount === 1) {
          // This is a double click
          if (state.clickTimeout) {
            clearTimeout(state.clickTimeout);
            state.clickTimeout = null;
          }
          state.clickCount = 0;

          // Execute double-tap if configured and not explicitly "nothing"
          if (!isExplicitNothingAction(double_tap_action)) {
            UltraLinkComponent.handleAction(
              double_tap_action || ({ action: 'default', entity } as any),
              hass,
              target,
              cardConfig,
              entity,
              module
            );
          }
        } else {
          // This might be a single click, but wait to see if double click follows
          state.clickCount = 1;
          state.lastClickTime = now;

          // Clear any existing timeout
          if (state.clickTimeout) {
            clearTimeout(state.clickTimeout);
          }

          // Only wait for double-tap if it's configured with a real action
          // If double-tap is not configured or is explicitly "nothing", execute tap immediately
          if (!double_tap_action || isExplicitNothingAction(double_tap_action)) {
            // No double-tap configured or set to nothing, execute tap action immediately
            if (!isExplicitNothingAction(tap_action)) {
              UltraLinkComponent.handleAction(
                tap_action || ({ action: 'default', entity } as any),
                hass,
                target,
                cardConfig,
                entity,
                module
              );
            }
            state.clickCount = 0;
          } else {
            // Double-tap is configured with a real action, wait before executing single tap
            state.clickTimeout = setTimeout(() => {
              if (state.clickCount === 1 && !isExplicitNothingAction(tap_action)) {
                UltraLinkComponent.handleAction(
                  tap_action || ({ action: 'default', entity } as any),
                  hass,
                  target,
                  cardConfig,
                  entity,
                  module
                );
              }
              state.clickCount = 0;
            }, 300); // Wait 300ms to distinguish from double click
          }
        }
      },

      /**
       * Keyboard activation, so these controls are reachable without a pointer.
       *
       * Enter and Space run the tap action immediately: the double-tap wait exists
       * to disambiguate two quick pointer taps, which has no keyboard equivalent,
       * and hold has none either. Bind alongside the pointer handlers, and on a
       * non-focusable element add role="button" and tabindex="0" so it can be
       * reached at all — see hasActionableGesture before doing that.
       */
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;

        const target = e.target as HTMLElement;
        if (shouldExcludeTarget(target)) return;

        // A keypress on a nested control belongs to that control. Without this,
        // activating a button inside a gesture-wrapped element would fire both.
        const current = e.currentTarget as HTMLElement | null;
        if (current && target !== current && isInteractiveElement(target, current)) {
          return;
        }

        // Space scrolls the page and Enter can submit a form; neither is wanted
        // when the key is activating a control.
        e.preventDefault();
        e.stopPropagation();

        if (isExplicitNothingAction(tap_action)) return;

        UltraLinkComponent.handleAction(
          tap_action || ({ action: 'default', entity } as any),
          hass,
          target,
          cardConfig,
          entity,
          module
        );
      },

      onPointerLeave: () => {
        // Cancel hold if pointer leaves the element
        if (state.holdTimeout) {
          clearTimeout(state.holdTimeout);
          state.holdTimeout = null;
        }
        state.isHolding = false;
        // Treat leave as a cancellation of the in-flight gesture so a stray
        // pointerup elsewhere won't fire a tap.
        state.startPointerId = null;
        state.hasMoved = false;
      },

      onPointerCancel: () => {
        // Handle pointer cancel (e.g., system gesture interruption,
        // browser scroll takeover). Reset all in-flight gesture state.
        this.clearGestureState(elementId);
      },
    };
  }

  /**
   * Clean up gesture state for an element (call when element is removed)
   */
  cleanup(elementId: string): void {
    this.clearGestureState(elementId);
    this.gestureStates.delete(elementId);
  }
}

// Export singleton instance
export const ucGestureService = UcGestureService.getInstance();
