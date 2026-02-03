import { HomeAssistant } from 'custom-card-helpers';
import { UltraLinkComponent, TapActionConfig } from '../components/ultra-link';
import { CardModule, UltraCardConfig } from '../types';

/**
 * Configuration for gesture handler
 */
export interface GestureConfig {
  tap_action?: TapActionConfig;
  hold_action?: TapActionConfig;
  double_tap_action?: TapActionConfig;
  entity?: string;
  module?: CardModule;
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
 * Gesture state for tracking multi-touch interactions
 */
interface GestureState {
  holdTimeout: NodeJS.Timeout | null;
  clickTimeout: NodeJS.Timeout | null;
  isHolding: boolean;
  clickCount: number;
  lastClickTime: number;
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
 *     @pointerup=${handlers.onPointerUp}
 *     @pointerleave=${handlers.onPointerLeave}
 *   >
 *     Content here
 *   </div>
 * `;
 * ```
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
      onPointerDown: (e: PointerEvent) => {
        const target = e.target as HTMLElement;

        // Don't handle events on excluded elements (editor controls)
        if (shouldExcludeTarget(target)) {
          return;
        }

        // CRITICAL: Prevent default and stop propagation to avoid double-firing
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        state.isHolding = false;

        // Start hold timer if hold action is configured and not "nothing"
        // Skip hold timer entirely if hold action is explicitly nothing/none
        if (isExplicitNothingAction(hold_action)) {
          // Explicitly set to "nothing" or "none", don't start timer
          return;
        }

        // Start hold timer for configured actions or Default (undefined)
        state.holdTimeout = setTimeout(() => {
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

      onPointerUp: (e: PointerEvent) => {
        const target = e.target as HTMLElement;

        // Don't handle events on excluded elements (editor controls)
        if (shouldExcludeTarget(target)) {
          return;
        }

        // CRITICAL: Prevent default and stop propagation to avoid double-firing
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Clear hold timer
        if (state.holdTimeout) {
          clearTimeout(state.holdTimeout);
          state.holdTimeout = null;
        }

        // If this was a hold gesture, don't process as click
        if (state.isHolding) {
          state.isHolding = false;
          return;
        }

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

      onPointerLeave: () => {
        // Cancel hold if pointer leaves the element
        if (state.holdTimeout) {
          clearTimeout(state.holdTimeout);
          state.holdTimeout = null;
        }
        state.isHolding = false;
      },

      onPointerCancel: () => {
        // Handle pointer cancel (e.g., system gesture interruption)
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
