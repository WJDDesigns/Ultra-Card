/**
 * Ultra Card Z-Index Management System
 *
 * This file provides a centralized, organized z-index system for all Ultra Card components.
 * Using these constants ensures consistent layering and prevents visual conflicts.
 *
 * IMPORTANT: Always use these constants instead of hardcoded z-index values.
 *
 * @example
 * import { Z_INDEX } from '../utils/uc-z-index';
 *
 * const styles = css`
 *   .my-element {
 *     z-index: ${Z_INDEX.DROPDOWN_MENU};
 *   }
 * `;
 */

/**
 * Z-Index Layer Organization
 *
 * The z-index system is organized into clear layers with specific purposes:
 *
 * Layer 0-9: Base Card Content
 *   - Card background elements and basic module content
 *   - Use for elements that should appear behind everything else
 *
 * Layer 10-99: Card UI Elements
 *   - Interactive card controls and overlays within the card view
 *   - Use for card-level UI that should appear above content but below editor
 *
 * Layer 100-999: Editor UI & Navigation
 *   - Editor interface elements, main tabs, and navigation
 *   - Use for main editor components (General, Layout, Global Design tabs)
 *   - These sit below popups so popups can overlay the main editor
 *
 * Layer 1000-1999: Popups & Panels Base
 *   - Module settings popups, layout child popups, selector panels
 *   - Base popup content and overlays
 *   - Use for editor popups that overlay the main editor interface
 *
 * Layer 2000-2999: Popup Internal UI
 *   - Tabs, headers, and sticky elements INSIDE popups
 *   - Navigation elements within popup contexts
 *   - Must be above popup content but below dropdowns/menus
 *
 * Layer 3000-6999: Interactive Overlays (Dropdowns, Menus, Pickers)
 *   - Dropdown menus, color pickers, autocomplete suggestions
 *   - These appear ABOVE popup tabs and all other UI
 *   - Must be highest interactive layer to prevent clipping
 *
 * Layer 7000-9999: Full-Screen Modals & Dialogs
 *   - Full-screen modal dialogs, alerts, confirmations
 *   - Use for dialogs that should overlay everything in the editor
 *   - Toast notifications
 *
 * Layer 10000+: Critical System Overlays
 *   - Camera fullscreen, fullscreen editor mode
 *   - Use sparingly for truly fullscreen experiences that need maximum z-index
 */

export const Z_INDEX = {
  // ============================================================================
  // Layer 0-9: Base Card Content
  // ============================================================================

  /** Base content layer - default card content (z-index: 0) */
  BASE_CONTENT: 0,

  /** Module content layer - individual module elements (z-index: 1) */
  MODULE_CONTENT: 1,

  /** Module overlay - overlays within modules like progress indicators (z-index: 2) */
  MODULE_OVERLAY: 2,

  /** Module background effects - backgrounds and filters (z-index: 3) */
  MODULE_BACKGROUND: 3,

  /** Module decorative elements (z-index: 5) */
  MODULE_DECORATIVE: 5,

  /** Module interactive overlays (z-index: 8) */
  MODULE_INTERACTIVE: 8,

  // ============================================================================
  // Layer 10-99: Card UI Elements
  // ============================================================================

  /** Card background layer (z-index: 10) */
  CARD_BACKGROUND: 10,

  /** Card controls and buttons (z-index: 20) */
  CARD_CONTROLS: 20,

  /** Card tooltips (z-index: 30) */
  CARD_TOOLTIP: 30,

  // ============================================================================
  // Layer 100-999: Editor UI & Navigation
  // ============================================================================

  /** Base editor content (z-index: 100) */
  EDITOR_CONTENT: 100,

  /** Sticky headers within editor content (z-index: 400) */
  STICKY_HEADERS: 400,

  /** Main editor tabs (General, Layout, Global Design, etc.) (z-index: 500) */
  EDITOR_TABS: 500,

  /** Editor notifications/banners (z-index: 600) */
  EDITOR_NOTIFICATIONS: 600,

  // ============================================================================
  // Layer 1000-1999: Popups & Panels Base
  // ============================================================================

  /** Module popup overlay background (z-index: 1000) */
  MODULE_POPUP_OVERLAY: 1000,

  /** Module popup content (z-index: 1001) */
  MODULE_POPUP_CONTENT: 1001,

  /** Layout child settings popup (z-index: 1002) */
  LAYOUT_CHILD_POPUP: 1002,

  /** Module selector popup (z-index: 1003) */
  SELECTOR_POPUP: 1003,

  /** Resize handles on popups (z-index: 1004) */
  RESIZE_HANDLE: 1004,

  /** Popup sticky elements (headers, footers) (z-index: 1005) */
  POPUP_STICKY_ELEMENTS: 1005,

  // ============================================================================
  // Layer 2000-2999: Popup Internal UI
  // ============================================================================

  /** Popup tabs and navigation - INSIDE popups, below dropdowns (z-index: 2000) */
  POPUP_TABS: 2000,

  // ============================================================================
  // Layer 3000-6999: Interactive Overlays (Dropdowns, Menus, Pickers)
  // ============================================================================

  /** Dropdown select field - ABOVE all tabs and popups (z-index: 5000) */
  DROPDOWN_SELECT: 5000,

  /** Dropdown menu overlay - ABOVE all tabs and popups (z-index: 5001) */
  DROPDOWN_MENU: 5001,

  /** Color picker container - Base layer (z-index: 0) */
  COLOR_PICKER_CONTAINER: 0,

  /** Color picker palette dropdown - ABOVE all tabs and popups (z-index: 5003) */
  COLOR_PICKER_PALETTE: 5003,

  /** Autocomplete suggestions - ABOVE all tabs and popups (z-index: 5004) */
  AUTOCOMPLETE: 5004,

  /** Context menus - ABOVE all tabs and popups (z-index: 5005) */
  CONTEXT_MENU: 5005,

  // ============================================================================
  // Layer 7000-9999: Full-Screen Modals & Dialogs
  // ============================================================================

  /** Modal/dialog overlay background (z-index: 8000) */
  DIALOG_OVERLAY: 8000,

  /** Modal/dialog content (z-index: 8001) */
  DIALOG_CONTENT: 8001,

  /** Toast notifications (z-index: 8500) */
  TOAST_NOTIFICATION: 8500,

  /** Graph tooltips and data overlays (z-index: 2147483647) - maximum to appear above popups */
  GRAPH_TOOLTIP: 2147483647,

  // ============================================================================
  // Layer 10000+: Critical System Overlays
  // ============================================================================

  /** Camera fullscreen overlay background (z-index: 10000) */
  CAMERA_FULLSCREEN_OVERLAY: 10000,

  /** Camera fullscreen content (z-index: 10001) */
  CAMERA_FULLSCREEN_CONTENT: 10001,

  /** Fullscreen editor mode (z-index: 10002) */
  FULLSCREEN_EDITOR: 10002,
} as const;

/**
 * Type-safe z-index values
 */
export type ZIndexValue = (typeof Z_INDEX)[keyof typeof Z_INDEX];

/**
 * Helper function to get z-index value as string for inline styles
 * @param key - The z-index constant key
 * @returns The z-index value as a string
 */
export function getZIndex(key: keyof typeof Z_INDEX): string {
  return Z_INDEX[key].toString();
}

/**
 * Helper function to check if a z-index is valid
 * @param value - The z-index value to check
 * @returns True if the value exists in our z-index system
 */
export function isValidZIndex(value: number): boolean {
  return (Object.values(Z_INDEX) as number[]).includes(value);
}
