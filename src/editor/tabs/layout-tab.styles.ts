import { css } from 'lit';
import { Z_INDEX } from '../../utils/uc-z-index';

/** Close animation length for popups and panels; the layout tab waits this long before unmounting. */
export const POPUP_CLOSE_ANIMATION_MS = 180;

/**
 * Styles for <ultra-layout-tab>. Moved out of layout-tab.ts (audit K9, step 1)
 * so the component file holds behaviour only.
 */
export const layoutTabStyles = css`
      /* Keyboard focus must be visible. Many controls set outline: none; this
         restores a ring for keyboard users only (not on mouse clicks). */
      :focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4) !important;
        outline-offset: 2px;
      }

      :host {
        display: block;
        /*
         * Fill the parent .tab-content when the editor is in settings-open
         * mode. Without height: 100% the host sizes to content, which breaks
         * the flex chain that lets .module-tab-content be the single scroller.
         * In normal (non-settings-open) mode .tab-content gives us natural
         * height via min-height: 400px, so this height: 100% resolves to
         * that minimum.
         */
        height: 100%;
        min-height: 0;
        box-sizing: border-box;
        --accent-color: var(--orange-color, #ff9800);
        --orange-color: #ff9800;
        --secondary-color: var(--orange-color, #ff9800);
        --tree-line-color: var(--divider-color, rgba(127, 127, 127, 0.3));
        --tree-dot-color: var(--primary-color, #03a9f4);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .pdnd-dragging {
        opacity: 0.55;
      }

      .pdnd-over {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: -2px;
      }
        --tree-dot-size: 8px;
        --tree-indent: 16px;
        --tree-line-width: 1px;
      }

      /* Module selector body (slotted into uc-module-selector-shell) */
      .module-category-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 12px;
      }
      .category-tab {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid transparent;
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
        transition: all 0.3s;
        font-family: inherit;
      }
      .category-tab.active {
        border-color: var(--primary-color);
        background: linear-gradient(135deg, rgba(3, 169, 244, 0.1) 0%, rgba(3, 169, 244, 0.05) 100%);
      }
      .category-tab.pro-tab {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
      }
      .category-tab.pro-tab.active {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
      }
      .pro-badge-mini { font-size: 12px; }
      .pro-upgrade-prompt {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 32px;
        border-radius: 16px;
        text-align: center;
      }
      .pro-upgrade-prompt .pro-icon { font-size: 64px; margin-bottom: 16px; }
      .pro-upgrade-prompt .pro-icon ha-icon { --mdc-icon-size: 64px; }
      .pro-upgrade-prompt h3 { font-size: 24px; margin: 0 0 12px 0; font-weight: 700; }
      .pro-upgrade-prompt p { opacity: 0.95; margin: 0 0 20px 0; font-size: 16px; }
      .pro-features {
        list-style: none;
        padding: 0;
        margin: 24px auto;
        display: grid;
        gap: 12px;
        text-align: left;
        max-width: 300px;
      }
      .pro-features li { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; }
      .pro-features li ha-icon { --mdc-icon-size: 20px; }
      .upgrade-btn {
        padding: 14px 32px;
        background: rgba(255, 255, 255, 0.25);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: all 0.3s;
        font-family: inherit;
      }
      .upgrade-btn:hover {
        background: rgba(255, 255, 255, 0.35);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      /* ========================================
         BREADCRUMB NAVIGATION STYLES
         ======================================== */
      .tree-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        margin-bottom: 12px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        border-radius: 6px;
        flex-wrap: wrap;
        overflow-x: auto;
      }

      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: none;
        border: none;
        border-radius: 4px;
        color: var(--primary-text-color);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .breadcrumb-item:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        color: var(--primary-color);
      }

      .breadcrumb-item.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: default;
      }

      .breadcrumb-item.active:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .breadcrumb-root {
        padding: 4px 6px;
      }

      .breadcrumb-root ha-icon {
        --mdc-icon-size: 18px;
      }

      .breadcrumb-separator {
        color: var(--secondary-text-color);
        opacity: 0.5;
      }

      .breadcrumb-separator ha-icon {
        --mdc-icon-size: 14px;
      }

      /* ========================================
         TREE VIEW CONTAINER STYLES
         ======================================== */
      .tree-view-container {
        position: relative;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px 4px 8px 12px;
      }

      /* Insertion line: shows the space where the item will be dropped (list-style, section width only) */
      .tree-drop-indicator {
        position: absolute;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--primary-color);
        border-radius: 1px;
        pointer-events: none;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.1s ease;
        box-sizing: border-box;
      }
      /* Small end-cap so the line reads as "insert here" even on narrow nodes */
      .tree-drop-indicator::before {
        content: '';
        position: absolute;
        left: -4px;
        top: -3px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--primary-color);
      }
      .tree-drop-indicator.visible {
        opacity: 1;
      }

      .tree-add-row-container {
        padding: 8px 0 0 0;
      }

      .tree-add-row-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        color: var(--secondary-text-color);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tree-add-row-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      }

      .tree-add-row-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* ========================================
         TREE NODE STYLES
         ======================================== */
      .tree-node {
        position: relative;
        padding-left: 0;
        margin-bottom: 6px;
        --tree-level-color: var(--divider-color);
        --tree-drop-gap: 24px;
        transition: padding 160ms cubic-bezier(0.2, 0, 0, 1);
        padding-top: 0;
        padding-bottom: 0;
      }

      /* Insertion space: the gap is padding on the neighbour so list geometry stays intact */
      .tree-node.drop-gap-before {
        padding-top: var(--tree-drop-gap);
      }

      .tree-node.drop-gap-after {
        padding-bottom: var(--tree-drop-gap);
      }

      .layout-module-empty {
        --tree-drop-gap: 24px;
        transition: padding 160ms cubic-bezier(0.2, 0, 0, 1);
        padding-top: 0;
        padding-bottom: 0;
      }

      .layout-module-empty.drop-gap-before {
        padding-top: var(--tree-drop-gap);
      }

      .layout-module-empty.drop-gap-after {
        padding-bottom: var(--tree-drop-gap);
      }

      /* While a drag is in flight: freeze hover chrome so nothing competes with the drop cues */
      :host([dragging]) .tree-node-content,
      :host([dragging]) .tree-node-drag-handle {
        transition: none;
      }
      :host([dragging]) .tree-node-content:hover,
      :host([dragging]) .tree-row > .tree-node-content:hover,
      :host([dragging]) .tree-column > .tree-node-content:hover,
      :host([dragging]) .tree-layout-module > .tree-node-content:hover {
        box-shadow: none;
      }
      :host([dragging]) .tree-module > .tree-node-content:hover,
      :host([dragging]) .tree-layout-child > .tree-node-content:hover,
      :host([dragging]) .tree-deep-child > .tree-node-content:hover {
        border-color: var(--divider-color);
      }
      /* Buttons must not steal the drop from the header they sit in */
      :host([dragging]) .tree-action-buttons,
      :host([dragging]) .tree-overflow-btn,
      :host([dragging]) .tree-collapse-btn {
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .tree-node,
        .layout-module-empty,
        .tree-drop-indicator {
          transition: none;
        }
      }

      /* Each level gets a unique color variable */
      .tree-row {
        --tree-level-color: var(--primary-color, #03a9f4);
      }

      .tree-column {
        --tree-level-color: #ff9800;
      }

      .tree-layout-module,
      .tree-nested-layout {
        --tree-level-color: #4caf50;
      }

      /* Tree node line - no longer used, lines drawn with pseudo-elements */
      .tree-node-line {
        display: none;
      }

      /* Tree dot indicator - hidden */
      .tree-node-dot {
        display: none;
      }

      /* Track collapse button - sits at the bottom end of the vertical track line when expanded */
      .tree-track-collapse {
        position: absolute;
        left: 12px; /* Center of track line */
        top: auto;
        bottom: 4px; /* Sits at the bottom end of the vertical line */
        transform: translateX(-50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--tree-level-color);
        border: 2px solid var(--card-background-color);
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: top 0.2s ease, bottom 0.2s ease;
      }

      .tree-track-collapse:hover {
        transform: translateX(-50%) scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .tree-track-collapse .track-chevron {
        color: white;
        --mdc-icon-size: 14px;
        transition: transform 0.2s ease;
      }

      .tree-node.collapsed .tree-track-collapse .track-chevron {
        transform: rotate(-90deg);
      }

      /* Row's track collapse (blue) - on the blue line going to columns */
      .tree-row > .tree-node-children > .tree-track-collapse {
        background: var(--primary-color, #03a9f4);
      }

      .tree-row > .tree-node-children > .tree-track-collapse .track-chevron {
        color: var(--text-primary-color, #fff);
      }

      /* Column's track collapse (orange) - on the orange line going to modules */
      .tree-column > .tree-node-children > .tree-track-collapse {
        background: #ff9800;
      }

      /* Layout module's track collapse (green) */
      .tree-layout-module > .tree-node-children > .tree-track-collapse,
      .tree-nested-layout > .tree-node-children > .tree-track-collapse {
        background: #4caf50;
      }

      /* Tree node content - full width for rows, indented for nested */
      .tree-node-content {
        margin-left: 0;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: visible;
        transition: all 0.2s ease;
      }

      /* Nested items (columns, modules) need left margin for track line */
      .tree-node-children > .tree-node > .tree-node-content {
        margin-left: 0;
      }

      .tree-node-content:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      /* Row has no border so only show shadow on hover */
      .tree-row > .tree-node-content:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      /* Column has no border so only show shadow on hover */
      .tree-column > .tree-node-content:hover {
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
      }

      /* Layout module has no border so only show shadow on hover */
      .tree-layout-module > .tree-node-content:hover {
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
      }

      .tree-node.drop-target .tree-node-content {
        border-color: var(--primary-color);
        border-style: dashed;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      }

      /* Tree node header */
      .tree-node-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        min-height: 40px;
      }

      /* Row header - primary color with no border on content */
      .tree-row > .tree-node-content {
        border: none;
      }

      .tree-row > .tree-node-content > .tree-node-header {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-radius: 8px;
      }

      /* Column header - orange background */
      .tree-column > .tree-node-content > .tree-node-header {
        /* Darker than the #ff9800 track so white text meets WCAG AA (5.0:1, was 2.2:1) */
        background: #a85c00;
        color: white;
      }

      .tree-column > .tree-node-content > .tree-node-header .tree-node-drag-handle,
      .tree-column > .tree-node-content > .tree-node-header .tree-collapse-btn,
      .tree-column > .tree-node-content > .tree-node-header .tree-overflow-btn {
        color: white;
      }

      .tree-column > .tree-node-content > .tree-node-header .tree-collapse-btn:hover,
      .tree-column > .tree-node-content > .tree-node-header .tree-overflow-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* Layout module header - solid green to match nested layouts */
      .tree-layout-module > .tree-node-content > .tree-node-header {
        /* Darker than the #4caf50 track so white text meets WCAG AA (5.1:1, was 2.8:1) */
        background: #2e7d32;
        color: white;
        border-radius: 8px;
      }

      .tree-node-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        color: inherit;
        opacity: 0.5;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 18px;
      }

      .tree-node-drag-handle:hover {
        opacity: 1;
      }

      .tree-node-drag-handle:active {
        cursor: grabbing;
      }

      .tree-row > .tree-node-content > .tree-node-header .tree-node-drag-handle {
        color: var(--text-primary-color, #fff);
      }

      /* Collapse button */
      .tree-collapse-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background: none;
        border: none;
        border-radius: 4px;
        color: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
        --mdc-icon-size: 18px;
      }

      .tree-collapse-btn:hover {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1);
      }

      .tree-row > .tree-node-content > .tree-node-header .tree-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* Column collapse - white tint on hover (orange header) */
      .tree-column > .tree-node-content > .tree-node-header .tree-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* Layout module collapse - green tint on hover */
      .tree-layout-module > .tree-node-content > .tree-node-header .tree-collapse-btn:hover {
        background: rgba(76, 175, 80, 0.15);
      }

      .tree-collapse-spacer {
        width: 24px;
        height: 24px;
      }

      /* Tree node icon */
      .tree-node-icon {
        --mdc-icon-size: 20px;
        opacity: 0.8;
      }

      .tree-row > .tree-node-content > .tree-node-header .tree-node-icon {
        color: var(--text-primary-color, #fff);
      }

      /* Tree node title and info */
      .tree-node-title {
        font-weight: 500;
        font-size: 14px;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tree-node-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }

      .tree-node-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tree-node-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
      }

      .tree-row > .tree-node-content > .tree-node-header .tree-node-badge {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary-color, #fff);
      }

      .layout-hover-badge {
        position: absolute;
        right: 0;
        bottom: calc(100% + 8px);
        max-width: 200px;
        padding: 4px 10px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
        opacity: 0;
        transform: translateY(4px);
        transition:
          opacity 0.15s ease,
          transform 0.15s ease;
        z-index: 2;
      }

      .tree-action-btn.layout-btn:hover .layout-hover-badge {
        opacity: 1;
        transform: translateY(0);
      }

      .layout-hover-badge.has-responsive::after {
        content: '';
        width: 6px;
        height: 6px;
        margin-left: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
      }

      /* Column badge - white on orange header */
      .tree-column > .tree-node-content > .tree-node-header .tree-node-badge {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      /* Layout module badge - green tint */
      .tree-layout-module > .tree-node-content > .tree-node-header .tree-node-badge {
        background: rgba(76, 175, 80, 0.2);
        color: var(--primary-text-color);
      }

      /* Action buttons container */
      .tree-action-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }

      /* Action button base styles */
      .tree-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        padding: 0;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        border-radius: 4px;
        color: inherit;
        cursor: pointer;
        transition: all 0.15s ease;
        --mdc-icon-size: 15px;
      }

      /* Touch screens: 26px is too small to hit reliably next to Delete. */
      @media (pointer: coarse) {
        .tree-action-btn,
        .tree-overflow-btn {
          min-width: 36px;
          min-height: 36px;
        }
      }

      .tree-action-btn.layout-btn {
        width: 28px;
        position: relative;
      }

      .tree-action-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }

      /* Add button - green tint */
      .tree-action-btn.add-btn:hover {
        background: rgba(76, 175, 80, 0.3);
      }

      /* Edit button - blue tint */
      .tree-action-btn.edit-btn:hover {
        background: rgba(3, 169, 244, 0.3);
      }

      /* Copy button - purple tint */
      .tree-action-btn.copy-btn:hover {
        background: rgba(156, 39, 176, 0.3);
      }

      /* Paste button - teal tint */
      .tree-action-btn.paste-btn:hover {
        background: rgba(0, 150, 136, 0.3);
      }

      /* Delete button - red tint */
      .tree-action-btn.delete-btn:hover {
        background: rgba(244, 67, 54, 0.3);
        color: #ff5252;
      }

      /* For dark backgrounds (modules, layout children) */
      .tree-module .tree-action-btn,
      .tree-layout-child .tree-action-btn,
      .tree-deep-child .tree-action-btn {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1);
        color: var(--primary-text-color);
      }

      .tree-module .tree-action-btn:hover,
      .tree-layout-child .tree-action-btn:hover,
      .tree-deep-child .tree-action-btn:hover {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.2);
      }

      .tree-module .tree-action-btn.add-btn:hover,
      .tree-layout-child .tree-action-btn.add-btn:hover,
      .tree-deep-child .tree-action-btn.add-btn:hover {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }

      .tree-module .tree-action-btn.edit-btn:hover,
      .tree-layout-child .tree-action-btn.edit-btn:hover,
      .tree-deep-child .tree-action-btn.edit-btn:hover {
        background: rgba(3, 169, 244, 0.2);
        color: var(--primary-color);
      }

      .tree-module .tree-action-btn.delete-btn:hover,
      .tree-layout-child .tree-action-btn.delete-btn:hover,
      .tree-deep-child .tree-action-btn.delete-btn:hover {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
      }

      /* Legacy edit button (for backwards compatibility) */
      .tree-edit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        background: var(--primary-color);
        border: none;
        border-radius: 4px;
        color: var(--text-primary-color, #fff);
        cursor: pointer;
        transition: all 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .tree-edit-btn:hover {
        background: var(--primary-color);
        filter: brightness(1.1);
        transform: scale(1.05);
      }

      /* ========================================
         OVERFLOW MENU STYLES
         ======================================== */
      .tree-overflow-container {
        position: relative;
      }

      .tree-overflow-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        background: none;
        border: none;
        border-radius: 4px;
        color: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
        --mdc-icon-size: 18px;
      }

      .tree-overflow-btn:hover {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1);
      }

      .tree-row > .tree-node-content > .tree-node-header .tree-overflow-btn {
        color: var(--text-primary-color, #fff);
      }

      .tree-row > .tree-node-content > .tree-node-header .tree-overflow-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .tree-overflow-menu {
        position: absolute;
        top: 100%;
        right: 0;
        min-width: 180px;
        background: var(--card-background-color, var(--ha-card-background, #1c1c1c));
        /* Ensure solid background - no transparency */
        background-color: var(--card-background-color, var(--ha-card-background, #1c1c1c));
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        /* Below DIALOG_OVERLAY (8000) but above all editor popups (1002) */
        z-index: ${Z_INDEX.CONTEXT_MENU};
        overflow: visible;
        animation: menuSlideIn 0.15s ease;
        isolation: isolate;
      }

      /* Ensure overflow container creates stacking context */
      .tree-overflow-container {
        position: relative;
        z-index: 10;
      }

      /* When menu is open, boost z-index to match context menu level */
      .tree-overflow-container:has(.tree-overflow-menu) {
        z-index: ${Z_INDEX.CONTEXT_MENU};
      }

      /* When menu is open, lift the entire tree-node above siblings */
      .tree-node:has(.tree-overflow-menu) {
        z-index: 100;
        position: relative;
      }

      @keyframes menuSlideIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .tree-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        background: transparent;
        background-color: transparent;
        border: none;
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
        pointer-events: auto;
        position: relative;
        z-index: 1;
      }

      .tree-menu-item:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        color: var(--primary-color);
      }

      .tree-menu-item ha-icon {
        --mdc-icon-size: 18px;
        opacity: 0.7;
      }

      .tree-menu-item:hover ha-icon {
        opacity: 1;
      }

      .tree-menu-item.destructive {
        color: var(--error-color, #f44336);
      }

      .tree-menu-item.destructive:hover {
        background: rgba(244, 67, 54, 0.1);
        color: var(--error-color, #f44336);
      }

      .menu-divider {
        margin: 4px 0;
        border: none;
        border-top: 1px solid var(--divider-color);
      }

      /* ========================================
         TREE NODE CHILDREN STYLES
         ======================================== */
      .tree-node-children {
        position: relative;
        padding: 8px 0 4px 32px; /* Padding-left for indentation */
        margin-left: 0;
        min-height: 48px; /* Minimum height for collapse button */
      }

      /* Vertical line (The Track) - matches parent header color */
      .tree-node-children::before {
        content: '';
        position: absolute;
        left: 12px; /* Aligned with track collapse button center */
        top: 0;
        bottom: 16px; /* Stop at center of collapse button (button: bottom 4px, height 24px → center at 16px) */
        width: 2px;
        background: var(--tree-level-color); /* Inherits parent's level color */
        border-radius: 1px;
        z-index: 1;
      }

      /* When collapsed, hide the vertical track line */
      .tree-node.collapsed > .tree-node-children::before {
        display: none;
      }

      /* When collapsed, move the caret button up to sit at the corner of the header */
      .tree-node.collapsed > .tree-node-children > .tree-track-collapse {
        top: -11px;
        bottom: auto;
      }

      /* Row's track line (blue) */
      .tree-row > .tree-node-children::before {
        background: var(--primary-color, #03a9f4);
      }

      /* Column's track line (orange) */
      .tree-column > .tree-node-children::before {
        background: #ff9800;
      }

      /* Layout's track line (green) */
      .tree-layout-module > .tree-node-children::before,
      .tree-nested-layout > .tree-node-children::before {
        background: #4caf50;
      }

      /* Horizontal station connector - hidden for cleaner look */
      .tree-node-children > .tree-node::after {
        display: none;
      }

      /* Remove extra overlapping lines */
      .tree-node-children > .tree-node:first-child::before {
        display: none;
      }

      /* Hide Row horizontal connectors (Rows are top-level) */
      .tree-row::after {
        display: none;
      }

      .tree-node-children > .tree-node {
        margin-bottom: 6px;
        /* Expand animation - slide in from left */
        animation: slideInFromLeft 0.25s ease-out forwards;
        opacity: 0;
      }

      /* Staggered animation delays for children */
      .tree-node-children > .tree-node:nth-child(1) {
        animation-delay: 0.02s;
      }
      .tree-node-children > .tree-node:nth-child(2) {
        animation-delay: 0.06s;
      }
      .tree-node-children > .tree-node:nth-child(3) {
        animation-delay: 0.1s;
      }
      .tree-node-children > .tree-node:nth-child(4) {
        animation-delay: 0.14s;
      }
      .tree-node-children > .tree-node:nth-child(5) {
        animation-delay: 0.18s;
      }
      .tree-node-children > .tree-node:nth-child(6) {
        animation-delay: 0.22s;
      }
      .tree-node-children > .tree-node:nth-child(7) {
        animation-delay: 0.26s;
      }
      .tree-node-children > .tree-node:nth-child(8) {
        animation-delay: 0.3s;
      }
      .tree-node-children > .tree-node:nth-child(n + 9) {
        animation-delay: 0.34s;
      }

      /* Add button also animates in */
      .tree-node-children > .tree-add-button-container {
        animation: slideInFromLeft 0.2s ease-out forwards;
        opacity: 0;
        animation-delay: 0.15s;
      }

      /* Fullscreen: row columns side-by-side to use horizontal space */
      .tree-row > .tree-node-children.columns-horizontal {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 12px;
        padding-left: 32px;
      }

      .tree-row > .tree-node-children.columns-horizontal::before {
        display: none;
      }

      .tree-row > .tree-node-children.columns-horizontal > .tree-track-collapse {
        flex: 0 0 auto;
      }

      .tree-row > .tree-node-children.columns-horizontal > .tree-node {
        flex: 1 1 200px;
        min-width: 200px;
        max-width: 100%;
        margin-bottom: 0;
      }

      .tree-row > .tree-node-children.columns-horizontal > .tree-add-button-container {
        flex: 0 0 100%;
        width: 100%;
        margin-top: 4px;
      }

      /* ========== DISABLE ANIMATIONS FOR TABS LAYOUT AND ALL ITS CONTENTS ========== */
      /* This prevents the flash/animation when collapsing sections or interacting with tabs */

      /* Tabs sections themselves should never animate */
      .tree-tabs-section {
        animation: none !important;
        opacity: 1 !important;
      }

      /* All content inside tabs sections should never animate */
      .tree-tabs-section-children,
      .tree-tabs-section-children > .tree-node,
      .tree-tabs-section-children > .tree-add-button-container,
      .tree-tabs-section-children * {
        animation: none !important;
        opacity: 1 !important;
      }

      /* The entire tabs layout module children container - no animations */
      .tree-layout-module:has(.tree-tabs-section) .tree-node-children,
      .tree-layout-module:has(.tree-tabs-section) .tree-node-children > *,
      .tree-layout-module:has(.tree-tabs-section) .tree-node {
        animation: none !important;
        opacity: 1 !important;
      }

      /* Fallback for browsers without :has() - use a specific class we can add */
      .tree-layout-module.tabs-layout .tree-node-children,
      .tree-layout-module.tabs-layout .tree-node-children > *,
      .tree-layout-module.tabs-layout .tree-node {
        animation: none !important;
        opacity: 1 !important;
      }

      /* ========== NESTED TABS LAYOUT (tabs inside popup or other layout) ========== */
      /* Nested tabs layouts and all their contents should never animate */
      .tree-nested-layout.tabs-layout,
      .tree-nested-layout.tabs-layout .tree-node-children,
      .tree-nested-layout.tabs-layout .tree-node-children > *,
      .tree-nested-layout.tabs-layout .tree-node,
      .tree-nested-layout.tabs-layout .tree-tabs-section,
      .tree-nested-layout.tabs-layout .tree-tabs-section-children,
      .tree-nested-layout.tabs-layout .tree-tabs-section-children > *,
      .tree-nested-layout.tabs-layout .tree-tabs-section-children * {
        animation: none !important;
        opacity: 1 !important;
      }

      /* Disable pulsing for nested tabs when dragged over */
      .tree-nested-layout.tabs-layout.drag-over,
      .tree-nested-layout.tabs-layout.drag-over > .tree-node-content > .tree-node-header,
      .tree-nested-layout.tabs-layout.drag-over > .tree-node-content > .tree-node-header::after {
        animation: none !important;
        box-shadow: none !important;
      }

      /* Tabs section drop zone styling */
      .tree-tabs-section-children {
        transition: background 0.15s ease;
        border-radius: 4px;
      }

      /* Drag over highlight for section content - simple highlight, no pulse */
      .tree-tabs-section-children.drag-over {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      /* Disable pulsing animation for tabs sections when dragged over */
      .tree-tabs-section.drag-over > .tree-node-content > .tree-node-header,
      .tree-tabs-section.drag-over > .tree-node-content > .tree-node-header::after {
        animation: none !important;
        box-shadow: none !important;
      }

      /* Track collapse chevron inside tabs should still rotate but not animate */
      .tree-tabs-section .tree-track-collapse .track-chevron,
      .tree-tabs-section-children .tree-track-collapse .track-chevron {
        transition: transform 0.2s ease;
      }

      @keyframes slideInFromLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Collapse animation - animate entire container for smooth transition */
      .tree-node-children.collapsing {
        animation: collapseContainer 0.2s ease-in forwards;
        overflow: hidden;
      }

      /* Override child animations during collapse - no individual animations */
      .tree-node-children.collapsing > .tree-node,
      .tree-node-children.collapsing > .tree-add-button-container {
        animation: none;
        opacity: 1;
      }

      @keyframes collapseContainer {
        from {
          opacity: 1;
          transform: translateX(0);
          max-height: 2000px;
        }
        to {
          opacity: 0;
          transform: translateX(-15px);
          max-height: 0;
        }
      }

      /* ========== Drag & Drop Visual Feedback ========== */

      /* "Drop inside" cue: a steady two-tone ring that reads on any header colour.
         No transform (it would shift hit-testing under the pointer) and no looping
         animation (it competes with the insertion line). */
      .tree-node.drag-over > .tree-node-content > .tree-node-header,
      .tree-nested-layout.drag-over > .tree-node-content > .tree-node-header,
      .tree-layout-child.drag-over > .tree-node-content > .tree-node-header,
      .tree-deep-child.drag-over > .tree-node-content > .tree-node-header {
        box-shadow:
          0 0 0 2px var(--card-background-color, #fff),
          0 0 0 4px var(--primary-color);
        position: relative;
        z-index: 50;
        border-radius: 8px;
      }

      .tree-node.drag-over > .tree-node-content > .tree-node-header::after,
      .tree-nested-layout.drag-over > .tree-node-content > .tree-node-header::after,
      .tree-layout-child.drag-over > .tree-node-content > .tree-node-header::after,
      .tree-deep-child.drag-over > .tree-node-content > .tree-node-header::after {
        content: '';
        position: absolute;
        right: 12px;
        top: 50%;
        width: 18px;
        height: 18px;
        transform: translateY(-50%);
        background: currentColor;
        /* "goes in here" glyph, drawn in the header's text colour */
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 5v5h3l-4 4-4-4h3V7z'/%3E%3C/svg%3E")
          center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 5v5h3l-4 4-4-4h3V7z'/%3E%3C/svg%3E")
          center / contain no-repeat;
        z-index: 51;
        pointer-events: none;
      }

      /* Make room for the glyph: the header's buttons are inert during a drag anyway */
      .tree-node.drag-over > .tree-node-content > .tree-node-header .tree-action-buttons,
      .tree-nested-layout.drag-over > .tree-node-content > .tree-node-header .tree-action-buttons {
        visibility: hidden;
      }

      /* Being dragged: dim in place, keep size so the list doesn't reflow under the pointer */
      .tree-node.being-dragged,
      .tree-nested-layout.being-dragged,
      .tree-layout-child.being-dragged,
      .tree-deep-child.being-dragged {
        opacity: 0.45;
      }
      .tree-node.being-dragged > .tree-node-content {
        outline: 2px dashed var(--primary-color);
        outline-offset: -1px;
      }

      .tree-node-children > .tree-node:last-child {
        margin-bottom: 0;
      }

      .tree-add-button-container {
        padding: 4px 0 4px var(--tree-indent);
        position: relative;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      /* Hide the vertical line next to add buttons by masking it */
      .tree-add-button-container::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 24px;
        background: var(--card-background-color, var(--ha-card-background, #1c1c1c));
        z-index: 2;
      }

      .tree-add-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: transparent;
        border: 1px dashed var(--divider-color);
        border-radius: 6px;
        color: var(--secondary-text-color);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        z-index: 3;
      }

      .tree-paste-column-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: transparent;
        border: 1px dashed var(--divider-color);
        border-radius: 6px;
        color: var(--disabled-text-color, rgba(255, 255, 255, 0.35));
        font-size: 12px;
        cursor: not-allowed;
        transition: all 0.2s ease;
        position: relative;
        z-index: 3;
      }

      .tree-paste-column-btn.active,
      .tree-paste-column-btn:not(:disabled) {
        border-color: var(--success-color, #4caf50);
        color: var(--success-color, #4caf50);
        cursor: pointer;
      }

      .tree-paste-column-btn.active:hover,
      .tree-paste-column-btn:not(:disabled):hover {
        background: rgba(76, 175, 80, 0.1);
      }

      .tree-paste-column-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .tree-add-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      }

      /* Empty container being dropped into: light up its own add-module slot too */
      .tree-node.drag-over > .tree-node-children > .tree-add-button-container > .tree-add-btn {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      }

      .tree-add-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* ========================================
         MODULE-SPECIFIC TREE STYLES
         ======================================== */
      /* Regular modules - transparent background */
      .tree-module .tree-node-header.module-header {
        background: transparent;
      }

      /* Layout child modules - transparent background */
      .tree-layout-child .tree-node-header.child-header {
        background: transparent;
        padding: 8px 10px;
      }

      /* Nested layout modules inside other layouts - green header */
      .tree-nested-layout > .tree-node-content {
        border: none;
      }

      .tree-nested-layout > .tree-node-content > .tree-node-header {
        background: #2e7d32;
        color: white;
        border-radius: 8px;
      }

      /* Layout header class - same green as nested layouts */
      .tree-node-header.layout-header {
        background: #2e7d32 !important;
        color: white;
        border-radius: 8px;
      }

      .tree-node-header.layout-header .tree-node-drag-handle,
      .tree-node-header.layout-header .tree-collapse-btn,
      .tree-node-header.layout-header .tree-overflow-btn,
      .tree-node-header.layout-header .tree-action-btn {
        color: white;
      }

      /* Pagebreak module - green dashed border */
      .tree-pagebreak .tree-node-header.pagebreak-header,
      .tree-pagebreak .tree-node-content > .tree-node-header {
        border: 2px dashed #4caf50 !important;
        border-radius: 8px !important;
        background: rgba(76, 175, 80, 0.1) !important;
      }

      .tree-pagebreak .tree-node-icon {
        color: #4caf50 !important;
      }

      .tree-nested-layout > .tree-node-content > .tree-node-header .tree-node-drag-handle,
      .tree-nested-layout > .tree-node-content > .tree-node-header .tree-collapse-btn,
      .tree-nested-layout > .tree-node-content > .tree-node-header .tree-overflow-btn {
        color: white;
      }

      .tree-nested-layout > .tree-node-content > .tree-node-header .tree-collapse-btn:hover,
      .tree-nested-layout > .tree-node-content > .tree-node-header .tree-overflow-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .tree-nested-layout > .tree-node-content > .tree-node-header .tree-node-badge {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .tree-nested-layout > .tree-node-content:hover {
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      /* Deep nested children - transparent background */
      .tree-deep-child .tree-node-header.child-header {
        background: transparent;
        padding: 8px 10px;
      }

      /* ========================================
         DEEP NESTED LAYOUT RESPONSIVE OVERFLOW
         Show overflow menu and hide individual buttons when space is limited
         ======================================== */

      /* By default, show individual buttons and hide overflow on first few levels */
      .tree-deep-nested .deep-nested-overflow {
        display: none;
      }

      .tree-deep-nested .deep-nested-actions {
        display: flex;
      }

      /* At nesting depth 3+, show overflow and hide individual buttons */
      .tree-deep-nested[data-nesting-depth='3'] .deep-nested-actions,
      .tree-deep-nested[data-nesting-depth='4'] .deep-nested-actions,
      .tree-deep-nested[data-nesting-depth='5'] .deep-nested-actions,
      .tree-deep-nested[data-nesting-depth='6'] .deep-nested-actions,
      .tree-deep-nested[data-nesting-depth='7'] .deep-nested-actions,
      .tree-deep-nested[data-nesting-depth='8'] .deep-nested-actions,
      .tree-deep-nested[data-nesting-depth='9'] .deep-nested-actions,
      .tree-deep-nested[data-nesting-depth='10'] .deep-nested-actions {
        display: none !important;
      }

      .tree-deep-nested[data-nesting-depth='3'] .deep-nested-overflow,
      .tree-deep-nested[data-nesting-depth='4'] .deep-nested-overflow,
      .tree-deep-nested[data-nesting-depth='5'] .deep-nested-overflow,
      .tree-deep-nested[data-nesting-depth='6'] .deep-nested-overflow,
      .tree-deep-nested[data-nesting-depth='7'] .deep-nested-overflow,
      .tree-deep-nested[data-nesting-depth='8'] .deep-nested-overflow,
      .tree-deep-nested[data-nesting-depth='9'] .deep-nested-overflow,
      .tree-deep-nested[data-nesting-depth='10'] .deep-nested-overflow {
        display: flex !important;
      }

      /* Style the deep nested overflow button */
      .deep-nested-overflow .tree-overflow-btn {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
        color: white;
      }

      .deep-nested-overflow .tree-overflow-btn:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      .deep-nested-overflow .tree-overflow-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Overflow menu positioning */
      .deep-nested-overflow {
        position: relative;
      }

      .deep-nested-overflow .tree-overflow-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 160px;
        overflow: hidden;
      }

      /* Also apply to deeply nested regular modules that can't show title */
      .tree-deep-nested .tree-node-title {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Layout module content area - no border */
      .tree-layout-module > .tree-node-content {
        border: none;
      }

      .tree-layout-module > .tree-node-content > .tree-node-header {
        border-radius: 8px;
      }

      /* Column content area - no border */
      .tree-column > .tree-node-content {
        border: none;
      }

      .tree-column > .tree-node-content > .tree-node-header {
        border-radius: 8px;
      }

      /* ========================================
         COLLAPSE/EXPAND ANIMATION STYLES
         ======================================== */
      .tree-node-children {
        animation: expandIn 0.2s ease;
      }

      @keyframes expandIn {
        from {
          opacity: 0;
          max-height: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          max-height: 2000px;
          transform: translateY(0);
        }
      }

      /* Visual indicator for collapsed state - show count badge more prominently */
      .tree-node.collapsed .tree-node-badge {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      /* Keep line solid even when collapsed - line still connects to siblings */
      .tree-node.collapsed::before {
        /* Line continues to connect siblings even when node is collapsed */
      }

      /* Collapsed node has subtle visual difference */
      .tree-node.collapsed > .tree-node-content {
        opacity: 0.9;
      }

      /* Collapsed row maintains solid header but shows dotted border */
      .tree-row.collapsed > .tree-node-content {
        border-style: dashed;
      }

      /* Pulse animation for newly expanded items */
      .tree-node-children .tree-node:first-child .tree-node-content {
        animation: pulseHighlight 0.3s ease;
      }

      @keyframes pulseHighlight {
        0% {
          box-shadow: 0 0 0 2px transparent;
        }
        50% {
          box-shadow: 0 0 0 2px var(--primary-color);
        }
        100% {
          box-shadow: 0 0 0 2px transparent;
        }
      }

      /* Chevron rotation transition (already inline but adding fallback) */
      .tree-collapse-btn ha-icon {
        transition: transform 0.2s ease;
      }

      /* ========================================
         MOBILE RESPONSIVE STYLES
         ======================================== */
      @media (max-width: 600px) {
        .tree-breadcrumbs {
          padding: 6px 8px;
        }

        .breadcrumb-item {
          padding: 3px 6px;
          font-size: 12px;
        }

        .tree-node-header {
          padding: 8px 10px;
          gap: 6px;
        }

        .tree-node-title {
          font-size: 13px;
        }

        .tree-node-badge {
          font-size: 10px;
          padding: 1px 6px;
        }

        .tree-overflow-menu {
          min-width: 160px;
        }

        .tree-menu-item {
          padding: 8px 12px;
          font-size: 12px;
        }

        /* Hide action buttons on mobile - they're in overflow menu */
        .tree-action-buttons {
          display: none;
        }

        /* Hide tabs section child actions on mobile - use overflow menu instead */
        .tabs-section-child-actions {
          display: none !important;
        }

        /* Show tabs section child overflow menu on mobile */
        .tabs-section-child-overflow {
          display: flex !important;
        }

        /* Make overflow button more prominent on mobile */
        .tree-overflow-btn {
          width: 32px;
          height: 32px;
          background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1);
        }

        /* Ensure overflow button is visible on modules and layout modules */
        .tree-module .tree-overflow-btn,
        .tree-layout-module .tree-overflow-btn,
        .tree-layout-child .tree-overflow-btn,
        .tree-deep-child .tree-overflow-btn,
        .tree-nested-layout .tree-overflow-btn,
        .tabs-section-child-overflow .tree-overflow-btn {
          background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.15);
          color: var(--primary-text-color);
        }

        .tree-module .tree-overflow-btn:hover,
        .tree-layout-module .tree-overflow-btn:hover,
        .tree-layout-child .tree-overflow-btn:hover,
        .tree-deep-child .tree-overflow-btn:hover,
        .tree-nested-layout .tree-overflow-btn:hover,
        .tabs-section-child-overflow .tree-overflow-btn:hover {
          background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.25);
        }

        /* Reduce indent on mobile */
        :host {
          --tree-indent: 12px;
        }

        /* Smaller track collapse on mobile */
        .tree-track-collapse {
          width: 20px;
          height: 20px;
        }

        .tree-track-collapse .track-chevron {
          --mdc-icon-size: 12px;
        }

        /* Reduce children padding on mobile */
        .tree-node-children {
          padding-left: 24px;
        }
      }

      .layout-builder {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Fullscreen: card preview at top (height controlled by inline style + resize handle) */
      .layout-builder.fullscreen .fullscreen-preview {
        flex-shrink: 0;
        margin-bottom: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--card-background-color);
        position: relative;
      }

      .layout-builder.fullscreen .fullscreen-preview-label {
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--secondary-text-color);
        border-bottom: 1px solid var(--divider-color);
      }

      .layout-builder.fullscreen .fullscreen-preview-card {
        min-height: 120px;
        overflow: auto;
        padding: 12px;
      }

      .layout-builder.fullscreen .fullscreen-preview-card ultra-card {
        display: block;
      }

      .layout-builder.fullscreen .fullscreen-preview-resize-handle {
        touch-action: none;
        position: absolute;
        bottom: 0;
        right: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: ns-resize;
        border-radius: 8px 0 0 0;
        z-index: 2;
        --mdc-icon-size: 18px;
        transition: background 0.15s ease;
      }

      .layout-builder.fullscreen .fullscreen-preview-resize-handle:hover {
        background: var(--primary-color);
        opacity: 0.9;
      }

      /* ── Builder toolbar ───────────────────────────────── */
      .builder-toolbar {
        margin-bottom: 12px;
        padding: 4px 6px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
        border-radius: 10px;
        flex-shrink: 0;
      }

      .toolbar-row {
        display: flex;
        align-items: center;
        gap: 0;
      }

      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 0 6px;
      }

      .toolbar-group + .toolbar-group {
        border-left: 1px solid var(--divider-color, rgba(128, 128, 128, 0.25));
      }

      .toolbar-group:first-child {
        padding-left: 2px;
      }

      .toolbar-group-end {
        margin-left: auto;
        border-left: none !important;
        padding-right: 2px;
      }

      .tb-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        min-width: 32px;
        padding: 0 6px;
        gap: 5px;
        background: transparent;
        color: var(--primary-text-color, #000);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
      }

      .tb-btn ha-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }

      .tb-btn:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        color: var(--primary-color);
      }

      .tb-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .tb-btn:disabled:hover {
        background: transparent;
        color: var(--primary-text-color, #000);
      }

      .tb-btn.has-clipboard {
        color: var(--success-color, #4caf50);
      }

      .tb-btn.active {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
        color: var(--primary-color);
      }

      .tb-btn.has-clipboard:hover {
        background: rgba(76, 175, 80, 0.15);
      }

      @keyframes pulse-glow {
        0%,
        100% {
          box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
        }
        50% {
          box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
        }
      }

      /* Hide the fullscreen toggle on phone-sized viewports (iPhones, small
         Android phones). The smallest tablet (iPad mini) is ~744px wide so
         600px is a safe cutoff — iPads in any orientation still see it. */
      @media (max-width: 600px) {
        .tb-btn-fullscreen {
          display: none !important;
        }
      }

      @media (max-width: 480px) {
        .tb-btn span {
          display: none;
        }

        /* Tighten the builder toolbar so all icons fit on small phones */
        .builder-toolbar {
          padding: 4px 4px;
        }

        .toolbar-row {
          flex-wrap: nowrap;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .toolbar-row::-webkit-scrollbar {
          display: none;
          height: 0;
          width: 0;
        }

        .toolbar-group {
          padding: 0 4px;
          flex-shrink: 0;
        }

        .toolbar-group:first-child {
          padding-left: 2px;
        }

        .toolbar-group-end {
          padding-right: 2px;
        }

        .tb-btn {
          height: 30px;
          min-width: 30px;
          padding: 0 4px;
        }

        .tb-btn ha-icon {
          --mdc-icon-size: 17px;
        }
      }

      /* Extra-small phones (e.g. iPhone SE width) — squeeze a little more */
      @media (max-width: 380px) {
        .toolbar-group {
          padding: 0 3px;
        }

        .tb-btn {
          min-width: 28px;
          padding: 0 3px;
        }

        .tb-btn ha-icon {
          --mdc-icon-size: 16px;
        }
      }

      .row-builder {
        margin-bottom: 16px;
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        position: static;
        transition: all 0.2s ease;
        overflow: visible;
      }

      .row-builder:last-child {
        margin-bottom: 0;
      }

      .row-header {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px 12px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-weight: 500;
        border-bottom: 2px solid var(--primary-color);
        position: relative;
        z-index: 0;
        /* Inner radius = outer radius (8px) - border width (2px) = 6px */
        border-radius: 6px 6px 0 0;
      }

      .row-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .row-title-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .row-title-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .column-layout-text {
        color: color-mix(in srgb, var(--text-primary-color, #fff) 90%, transparent);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }

      .row-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .row-actions-left {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .row-actions-right {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      /* Icon sizes for both action groups */
      .row-actions-left button ha-icon,
      .row-actions-right button ha-icon {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .row-name-top {
        color: color-mix(in srgb, var(--text-primary-color, #fff) 90%, transparent);
        font-size: 14px;
        font-weight: 500;
        max-width: 20ch;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .row-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 70%, transparent);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .row-drag-handle:hover {
        opacity: 1;
      }

      .row-drag-handle:active {
        cursor: grabbing;
      }

      .column-layout-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        color: var(--text-primary-color, #fff);
        font-size: 14px;
        transition: all 0.2s ease;
        min-width: 32px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .column-layout-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .layout-icon {
        font-family: monospace;
        font-weight: bold;
        letter-spacing: 1px;
      }

      .row-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: flex-end;
      }

      /* Reduce icon sizes in row actions for better spacing */
      .row-actions button ha-icon {
        width: 18px;
        height: 18px;
      }

      /* Collapse button styles for rows */
      .row-collapse-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 90%, transparent);
        cursor: pointer;
        padding: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border-radius: 4px;
        width: 24px;
        height: 24px;
      }

      .row-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .row-collapse-btn ha-icon {
        transition: transform 0.2s ease;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .row-duplicate-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-duplicate-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary-color, #fff);
      }

      .row-add-column-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-add-column-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary-color, #fff);
      }

      .row-settings-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-settings-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary-color, #fff);
      }

      .row-col-sizing-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-col-sizing-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary-color, #fff);
      }

      .delete-row-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .delete-row-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      .rows-container {
        flex: 1;
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .columns-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        padding: 12px;
        box-sizing: border-box;
        background: var(--card-background-color);
        border-top: 1px solid var(--primary-color);
      }

      /* Editor view: Force single column layout for better usability */
      .columns-container[data-layout='1-col'],
      .columns-container[data-layout='1-2-1-2'],
      .columns-container[data-layout='1-3-2-3'],
      .columns-container[data-layout='2-3-1-3'],
      .columns-container[data-layout='2-5-3-5'],
      .columns-container[data-layout='3-5-2-5'],
      .columns-container[data-layout='1-3-1-3-1-3'],
      .columns-container[data-layout='1-4-1-2-1-4'],
      .columns-container[data-layout='1-5-3-5-1-5'],
      .columns-container[data-layout='1-6-2-3-1-6'],
      .columns-container[data-layout='1-4-1-4-1-4-1-4'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-8'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-3-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-4-1-8'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6-1-6-1-6'],
      /* Legacy support */
      .columns-container[data-layout='50-50'],
      .columns-container[data-layout='30-70'],
      .columns-container[data-layout='70-30'],
      .columns-container[data-layout='33-33-33'],
      .columns-container[data-layout='25-50-25'],
      .columns-container[data-layout='20-60-20'],
      .columns-container[data-layout='25-25-25-25'] {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        border-radius: 0px 0px 8px 8px;
      }

      .column-builder {
        border: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        border-radius: 0px 0px 6px 6px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;

        position: static;
      }

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        z-index: 0;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--accent-color, var(--orange-color, #ff9800));
        color: white;
        border-bottom: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        position: relative;
        z-index: ${Z_INDEX.MODULE_DECORATIVE};
        border-radius: 6px 6px 0px 0px;
      }

      .column-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      /* Reduce icon sizes in column actions for better spacing */
      .column-actions button ha-icon {
        width: 20px;
        height: 20px;
      }

      /* Collapse button styles for columns */
      .column-collapse-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        transition: all 0.2s ease;
        border-radius: 4px;
      }

      .column-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .column-collapse-btn ha-icon {
        transition: transform 0.2s ease;
        width: 20px;
        height: 20px;
      }

      .column-add-module-btn,
      .column-duplicate-btn,
      .column-settings-btn,
      .column-delete-btn,
      .column-copy-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 12px;
        min-width: 28px;
        min-height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .column-add-module-btn:hover,
      .column-duplicate-btn:hover,
      .column-settings-btn:hover,
      .column-copy-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn:hover:not([disabled]) {
        background: rgba(255, 100, 100, 0.9);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      .column-delete-btn[disabled]:hover {
        background: none;
        transform: none;
      }

      .column-actions ha-icon {
        --mdc-icon-size: 16px;
      }

      .column-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .column-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .column-drag-handle:hover {
        opacity: 1;
      }

      .column-drag-handle:active {
        cursor: grabbing;
      }

      .modules-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--secondary-color, var(--accent-color, #ff9800));
        border-top: none;
        border-radius: 0px 0px 6px 6px;
        margin-top: 0;

        position: static;
        overflow: visible;
      }

      .module-item {
        position: relative;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        margin-bottom: 8px;
        width: 100%;
        min-height: 60px;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
        overflow: visible;
      }

      .module-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 12px rgba(var(--rgb-primary-color), 0.2);
        transform: translateY(-1px);
      }

      .module-content {
        padding: 8px;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        word-wrap: break-word;
        word-break: break-word;
        pointer-events: auto;
        position: relative;
        z-index: 0;

        /* Ensure content doesn't interfere with hover actions positioning */
        contain: layout style;
      }

      /* Simplified Module Styles */
      .simplified-module {
        padding: 12px;
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        width: 100%;
        box-sizing: border-box;
      }

      .simplified-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .simplified-module-drag-handle {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color, #757575);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .simplified-module:hover .simplified-module-drag-handle {
        opacity: 1;
      }

      .simplified-module-drag-handle:active {
        cursor: grabbing;
      }

      .simplified-module-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color, #2196f3);
        color: var(--text-primary-color, #fff);
        border-radius: 6px;
        --mdc-icon-size: 20px;
      }

      .simplified-module-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .simplified-module-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        line-height: 1.3;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-info {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        line-height: 1.2;
        margin: 0;
        opacity: 0.8;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-shrink: 0;
      }

      .simplified-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }

      .simplified-action-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .simplified-action-btn.edit-btn {
        color: var(--primary-color, #2196f3);
        border-color: var(--primary-color, #2196f3);
      }

      .simplified-action-btn.edit-btn:hover {
        background: var(--primary-color, #2196f3);
        color: var(--text-primary-color, #fff);
      }

      .simplified-action-btn.duplicate-btn {
        color: var(--info-color, #2196f3);
        border-color: var(--info-color, #2196f3);
      }

      .simplified-action-btn.duplicate-btn:hover {
        background: var(--info-color, #2196f3);
        color: white;
      }

      .simplified-action-btn.delete-btn {
        color: var(--error-color, #f44336);
        border-color: var(--error-color, #f44336);
      }

      .simplified-action-btn.delete-btn:hover {
        background: var(--error-color, #f44336);
        color: white;
      }

      .simplified-action-btn.copy-btn {
        color: var(--success-color, #4caf50);
        border-color: var(--success-color, #4caf50);
      }

      .simplified-action-btn.copy-btn:hover {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .simplified-action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Disable animations within layout builder modules */
      .module-content * {
        max-width: 100%;
        box-sizing: border-box;
        animation: none !important;
        transition: none !important;
      }

      .module-content *:hover {
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }

      .module-content img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      .add-module-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        box-sizing: border-box;
        font-size: 13px;
        min-height: 36px;
      }

      .add-module-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      /* Add module area - container for add and paste buttons */
      .add-module-area {
        display: flex;
        gap: 8px;
        width: 100%;
        box-sizing: border-box;
      }

      .add-module-area .add-module-btn,
      .add-module-area .paste-module-btn {
        flex: 1;
      }

      .paste-module-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: 2px dashed var(--success-color, #4caf50);
        border-radius: 4px;
        background: none;
        color: var(--success-color, #4caf50);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        min-height: 36px;
      }

      .paste-module-btn:hover {
        background: var(--success-color, #4caf50);
        color: white;
        border-color: var(--success-color, #4caf50);
      }

      .paste-module-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .add-column-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px 12px 12px;
        width: 100%;
        box-sizing: border-box;
        gap: 8px;
      }

      .add-column-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        border: 2px dashed var(--secondary-text-color);
        border-radius: 6px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        flex: 1;
        min-height: 40px;
        box-sizing: border-box;
      }

      .add-column-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.05));
      }

      .add-column-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      .paste-column-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        border-radius: 6px;
        transition: all 0.2s ease;
        font-size: 13px;
        font-weight: 500;
        flex: 1;
        min-height: 40px;
        box-sizing: border-box;
      }

      /* Active state — column is in clipboard, ready to paste */
      .paste-column-btn--active {
        border: 2px dashed var(--success-color, #4caf50);
        background: rgba(76, 175, 80, 0.08);
        color: var(--success-color, #4caf50);
        cursor: pointer;
        animation: paste-column-appear 0.3s ease-out;
      }

      /* Empty state — nothing copied yet, shown as inactive */
      .paste-column-btn--empty {
        border: 2px dashed var(--divider-color, rgba(255, 255, 255, 0.15));
        background: none;
        color: var(--disabled-text-color, rgba(255, 255, 255, 0.3));
        cursor: not-allowed;
        opacity: 0.5;
      }

      @keyframes paste-column-appear {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .paste-column-btn--active:hover {
        background: var(--success-color, #4caf50);
        color: white;
        border-color: var(--success-color, #4caf50);
      }

      .paste-column-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Empty Row Message */
      .empty-row-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        text-align: center;
        min-height: 120px;
      }

      .empty-row-message p {
        margin: 0 0 8px 0;
        font-size: 14px;
        opacity: 0.8;
      }

      /* Module Selector Popup */
      .module-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        /* Use DIALOG_OVERLAY (8000) so we escape editor stacking contexts */
        z-index: ${Z_INDEX.DIALOG_OVERLAY};
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }

      /* Image Popup Styles */
      .image-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        /* Neutralize UA [popover] styles (overlay is promoted to the top layer) */
        margin: 0;
        border: 0;
        width: auto;
        height: auto;
        max-width: none;
        max-height: none;
        overflow: visible;
        color: inherit;
      }

      .image-popup-content {
        background: var(--card-background-color);
        border-radius: 12px;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .image-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
      }

      .image-popup-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .image-popup-body {
        padding: 20px;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .image-popup-body img {
        max-width: 100%;
        max-height: calc(90vh - 100px);
        object-fit: contain;
        border-radius: 8px;
      }

      /* Shortcode fallback dialog when clipboard write fails (e.g. Android) */
      .shortcode-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: ${Z_INDEX.DIALOG_OVERLAY};
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .shortcode-dialog {
        background: var(--card-background-color);
        border-radius: 12px;
        width: 100%;
        max-width: 560px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .shortcode-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
      }
      .shortcode-dialog-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .shortcode-dialog-close {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        color: var(--secondary-text-color);
        border-radius: 6px;
      }
      .shortcode-dialog-close:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }
      .shortcode-dialog-close ha-icon {
        --mdc-icon-size: 20px;
      }
      .shortcode-dialog-hint {
        margin: 0;
        padding: 12px 20px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }
      .shortcode-dialog-textarea {
        margin: 0 20px;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-family: ui-monospace, monospace;
        font-size: 12px;
        resize: vertical;
        flex: 1 1 auto;
        min-height: 120px;
        box-sizing: border-box;
      }
      .shortcode-dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 16px 20px;
        border-top: 1px solid var(--divider-color);
      }
      .shortcode-dialog-copy,
      .shortcode-dialog-close-btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: none;
      }
      .shortcode-dialog-copy {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .shortcode-dialog-copy:hover {
        opacity: 0.9;
      }
      .shortcode-dialog-copy ha-icon {
        --mdc-icon-size: 18px;
      }
      .shortcode-dialog-close-btn {
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color);
      }
      .shortcode-dialog-close-btn:hover {
        background: var(--divider-color);
        color: var(--primary-text-color);
      }

      .selector-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: visible; /* allow resize handle to be positioned relative to this container */
        display: flex;
        flex-direction: column;
      }

      .selector-body {
        overflow-x: hidden; /* prevent bleed */
        overflow-y: auto; /* allow vertical scrolling when content exceeds height */
        max-height: inherit;
        padding: 0 24px 28px 24px; /* consistent horizontal padding, leave room for resize handle */
        flex: 1 1 0; /* take up remaining space, allow shrinking, base size 0 */
        min-height: 0; /* Critical for Safari: allow flex child to shrink below content size */
        border-radius: 0 0 8px 8px; /* maintain bottom border radius */
        /* Ensure content doesn't hide under header */
        position: relative;
        z-index: ${Z_INDEX.MODULE_CONTENT};
      }

      /* Improve mobile scrolling behavior */
      @media (max-width: 768px) {
        .selector-body {
          padding: 0 16px 20px 16px; /* Reduce padding on mobile */
          /* Ensure proper scrolling on mobile */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      }

      .selector-content.draggable-popup {
        position: fixed; /* Use fixed positioning for better control */
        width: min(700px, 95vw);
        height: min(750px, 90vh);
        /* Use transform for better centering on all devices */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        /* Use DIALOG_CONTENT (8001) so it sits above the popup wrapper overlay */
        z-index: ${Z_INDEX.DIALOG_CONTENT};
        max-width: calc(100vw - 40px); /* Ensure 20px padding on each side */
        max-height: calc(100vh - 40px); /* Ensure 20px padding on top/bottom */
      }

      /* Mobile optimization for selector popup */
      @media (max-width: 768px), (max-height: 768px) {
        .selector-content.draggable-popup {
          width: calc(100vw - 20px) !important; /* Full width with 10px padding each side */
          height: calc(100vh - 40px) !important; /* Full height with 20px padding top/bottom */
          max-width: none !important; /* Remove max-width constraint on mobile */
          max-height: none !important; /* Remove max-height constraint on mobile */
          /* Ensure proper centering on mobile */
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          margin: 0 !important;
        }

        /* Ensure header content stays properly aligned on mobile */
        .selector-header-top {
          flex-wrap: nowrap;
          align-items: center;
          justify-content: space-between;
        }

        .selector-header h3 {
          flex: 1;
          min-width: 0; /* Allow text to truncate if needed */
          margin-right: 12px;
        }

        .selector-header .close-button {
          flex-shrink: 0; /* Prevent close button from shrinking */
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 0; /* Remove auto margin on mobile */
        }
      }

      /* Safari-specific fix: disable sticky positioning since it causes issues */
      :host(.is-safari) .selector-content.draggable-popup {
        /* Ensure flex container properly calculates available space */
        min-height: 0;
      }

      :host(.is-safari) .selector-body {
        /* Force Safari to respect flex constraints */
        min-height: 0;
        max-height: 100%;
      }

      :host(.is-safari) .selector-header-wrapper {
        /* Disable sticky on Safari - use static positioning instead */
        position: static !important; /* Override sticky to prevent Safari expansion issues */
        height: auto;
        max-height: 200px;
        overflow-x: visible;
        overflow-y: hidden;
      }

      :host(.is-safari) .selector-header {
        height: auto;
        max-height: fit-content;
      }

      :host(.is-safari) .module-selector-tabs {
        height: auto;
        max-height: 48px;
      }

      .selector-header-wrapper {
        position: sticky; /* keep header and tabs visible while scrolling */
        top: 0;
        z-index: ${Z_INDEX.POPUP_STICKY_ELEMENTS};
        background: var(--card-background-color);
        border-radius: 8px 8px 0 0; /* maintain top border radius */
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        margin-bottom: 16px; /* Space between sticky header/tabs and content */
        flex-shrink: 0; /* Prevent header from shrinking in flex layout */
        height: auto; /* Use natural height */
        max-height: 200px; /* Reasonable max height to prevent expansion (header ~60px + tabs ~48px + margin) */
        overflow-x: visible; /* Allow tabs to scroll horizontally */
        overflow-y: hidden; /* Prevent vertical expansion */
      }

      .selector-header {
        padding: 20px 24px 16px;
        cursor: move;
        user-select: none;
        background: var(--card-background-color);
        flex-shrink: 0; /* Prevent header from expanding */
        min-height: fit-content; /* Use content height */
        max-height: fit-content; /* Prevent expansion */
      }

      .selector-header-top {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        white-space: nowrap;
      }

      .selector-header h3 {
        margin: 0; /* align vertically with X */
        flex: 1; /* push the X to the far right */
      }

      .selector-subtitle {
        margin: 8px 0 0 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .selector-header .close-button {
        margin-left: auto; /* ensure it sits on the same row to the right */
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      .selector-header .close-button:hover {
        color: var(--primary-color);
      }

      .module-stats {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .category-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .module-types {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .module-type-btn {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        width: 100%;
        min-height: 60px;
      }

      .module-type-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      /* Ensure text elements are white on hover */
      .module-type-btn:hover .module-title,
      .module-type-btn:hover .module-description {
        color: var(--text-primary-color, #fff) !important;
      }

      .module-type-btn ha-icon {
        font-size: 32px;
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-radius: 8px;
      }

      .module-type-btn:hover ha-icon {
        background: var(--text-primary-color, #fff);
        color: var(--primary-color);
      }

      .module-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }

      .module-title {
        font-weight: 500;
        font-size: 16px;
        color: var(--primary-text-color);
      }

      .module-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      .module-author,
      .module-version {
        display: none; /* Hide for cleaner look */
      }

      /* Module Category Styles */
      .module-category {
        margin-bottom: 24px;
      }

      .category-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .category-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      /* Layout Module Specific Styles */
      .layout-modules .module-type-btn.layout-module {
        position: relative;
        border: 2px solid var(--success-color, #4caf50);
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.1));
      }

      .layout-modules .module-type-btn.horizontal-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.vertical-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      /* Ensure layout module text is white on hover */
      .layout-modules .module-type-btn.layout-module:hover .module-title,
      .layout-modules .module-type-btn.layout-module:hover .module-description,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-title,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-description,
      .layout-modules .module-type-btn.vertical-layout:hover .module-title,
      .layout-modules .module-type-btn.vertical-layout:hover .module-description {
        color: white !important;
      }

      .layout-modules .module-type-btn.layout-module ha-icon {
        background: var(--success-color, #4caf50);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .layout-modules .module-type-btn.horizontal-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover ha-icon {
        background: white;
        color: var(--success-color, #4caf50);
        border-color: rgba(0, 0, 0, 0.1);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--success-color, #4caf50);
        color: white;
        font-size: 9px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
      }

      .layout-modules .module-type-btn.horizontal-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover .layout-badge {
        background: rgba(255, 255, 255, 0.2);
        opacity: 1;
      }

      /* Content Module Styles */
      .content-modules .module-type-btn.content-module {
        border: 1px solid var(--divider-color);
      }

      .content-modules .module-type-btn.content-module:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      /* Ensure content module text is white on hover */
      .content-modules .module-type-btn.content-module:hover .module-title,
      .content-modules .module-type-btn.content-module:hover .module-description {
        color: var(--text-primary-color, #fff) !important;
      }

      /* Column Layout Selector Popup */
      .column-layout-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: ${Z_INDEX.MODULE_POPUP_CONTENT};
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Responsive Breakpoint Tabs */
      .breakpoint-tabs {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.1));
        border-bottom: 1px solid var(--divider-color);
      }

      .breakpoint-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--secondary-text-color);
        font-size: 13px;
        font-weight: 500;
        position: relative;
      }

      .breakpoint-tab:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        color: var(--primary-text-color);
      }

      .breakpoint-tab.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .breakpoint-tab.active ha-icon {
        color: var(--text-primary-color, #fff);
      }

      .breakpoint-tab ha-icon {
        --mdc-icon-size: 18px;
        color: inherit;
      }

      .breakpoint-tab .tab-label {
        display: none;
      }

      @media (min-width: 500px) {
        .breakpoint-tab .tab-label {
          display: inline;
        }
      }

      .breakpoint-tab .override-dot {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--warning-color, #ff9800);
      }

      .breakpoint-tab.active .override-dot {
        background: var(--text-primary-color, #fff);
      }

      /* Breakpoint Info Bar */
      .breakpoint-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .breakpoint-info ha-icon {
        --mdc-icon-size: 24px;
        color: var(--primary-color);
      }

      .breakpoint-details {
        flex: 1;
      }

      .breakpoint-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .breakpoint-description {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .clear-override-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: 1px solid var(--divider-color);
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        color: var(--secondary-text-color);
        transition: all 0.2s ease;
      }

      .clear-override-btn:hover {
        background: var(--error-color, #f44336);
        border-color: var(--error-color, #f44336);
        color: white;
      }

      .clear-override-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Desktop Note */
      .desktop-note {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px;
        background: rgba(var(--rgb-info-color, 33, 150, 243), 0.1);
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .desktop-note ha-icon {
        --mdc-icon-size: 18px;
        color: var(--info-color, #2196f3);
        flex-shrink: 0;
        margin-top: 1px;
      }

      /* Inherit Note */
      .inherit-note {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 13px;
        color: var(--secondary-text-color);
        border-left: 3px solid var(--divider-color);
      }

      .inherit-note.active {
        border-left-color: var(--success-color, #4caf50);
        background: rgba(var(--rgb-success-color, 76, 175, 80), 0.1);
      }

      .inherit-note ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }

      .inherit-note.active ha-icon {
        color: var(--success-color, #4caf50);
      }

      /* Layout Columns Badge */
      .layout-columns {
        font-size: 10px;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 2px;
      }

      .layout-option-btn.current .layout-columns {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        color: var(--primary-color);
      }

      /* Selector Footer */
      .selector-footer {
        display: flex;
        justify-content: flex-end;
        padding: 16px;
        border-top: 1px solid var(--divider-color);
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
      }

      .close-selector-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .close-selector-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .close-selector-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 16px;
      }

      .layout-option-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 12px;
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        min-height: 80px;
        gap: 8px;
      }

      .layout-option-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .layout-option-btn.current {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        position: relative;
      }

      .layout-option-btn.current .layout-icon-large {
        color: var(--primary-color);
      }

      .current-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 8px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .layout-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 32px;
      }

      .layout-icon-large {
        font-family: monospace;
        font-weight: bold;
        font-size: 20px;
        letter-spacing: 2px;
        color: var(--primary-color);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-name {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
        line-height: 1.2;
      }

      /* Custom Sizing Section Styles */
      .custom-sizing-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 2px solid var(--divider-color);
      }

      .custom-sizing-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      .custom-sizing-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
        line-height: 1.4;
      }

      .custom-sizing-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: monospace;
        margin-bottom: 8px;
        box-sizing: border-box;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      .custom-sizing-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .custom-sizing-input.has-error {
        border-color: var(--error-color, #f44336);
      }

      .custom-sizing-input.has-error:focus {
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
      }

      .validation-error {
        color: var(--error-color, #f44336);
        font-size: 12px;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: rgba(244, 67, 54, 0.1);
        border-radius: 4px;
        border-left: 3px solid var(--error-color, #f44336);
      }

      .apply-custom-btn {
        width: 100%;
        padding: 12px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .apply-custom-btn:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .apply-custom-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--disabled-color, #9e9e9e);
      }

      .current-custom-badge {
        margin-top: 12px;
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color);
        padding: 8px;
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        border-radius: 4px;
      }

      .module-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        border: 1px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        font-size: 14px;
      }

      .uc-module-settings-loading {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 12px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .uc-module-settings-retry {
        margin-left: auto;
        padding: 4px 12px;
        border: 1px solid rgba(255, 255, 255, 0.7);
        border-radius: 4px;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      /* General Settings Popup Styles */
      .settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        /* Use DIALOG_OVERLAY (8000) so we escape editor stacking contexts */
        z-index: ${Z_INDEX.DIALOG_OVERLAY};
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: hidden; /* scrolling handled inside content to support sticky header */
        overflow-x: visible;
      }

      .settings-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        position: sticky;
        top: 0;
        z-index: ${Z_INDEX.POPUP_TABS};
        background: var(--card-background-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        flex-shrink: 0;
        /* Don't use isolation: isolate - it prevents fixed dropdowns from escaping */
      }

      .settings-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .settings-tab:hover {
        color: var(--primary-color);
      }

      .settings-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .settings-tab-content {
        padding: 0 24px 24px;
        flex: 1 1 auto;
        min-height: 0; /* allow parent to control height */
        /*
         * IMPORTANT: do NOT set overflow-y: auto here.
         * The parent .module-tab-content already provides the single scroll
         * context for tab content. If this wrapper also scrolls, the user
         * gets nested scrollbars — when they scroll to the bottom of the
         * inner scroller, the bottom is still hidden because the outer
         * (.module-tab-content or HA dialog .content) also has to scroll.
         */
        overflow-x: visible; /* allow dropdowns to render outside */
        position: relative;
        z-index: 1;
      }

      /* Module Settings Popup */
      .module-settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        /* Use DIALOG_OVERLAY (8000) so we escape editor stacking contexts */
        z-index: ${Z_INDEX.DIALOG_OVERLAY};
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: hidden; /* scrolling handled inside popup-content for sticky header */
        overflow-x: visible;
      }

      /* Module Settings Inline Panel — replaces the builder tree when editing a module */
      @keyframes ucPanelSlideIn {
        from {
          opacity: 0;
          transform: translateX(-16px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes ucPanelSlideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-16px);
        }
      }

      .module-settings-panel {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        background: var(--card-background-color);
        animation: ucPanelSlideIn 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .module-settings-panel.is-closing {
        animation: ucPanelSlideOut ${POPUP_CLOSE_ANIMATION_MS}ms ease-in both;
      }

      @media (prefers-reduced-motion: reduce) {
        .module-settings-panel,
        .module-settings-panel.is-closing {
          animation: none !important;
        }
      }

      .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px 10px 8px;
        border-bottom: 1px solid var(--divider-color);
        background: var(--card-background-color);
        flex-shrink: 0;
      }

      .panel-back-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: var(--primary-color);
        flex-shrink: 0;
        transition: background 0.2s ease, color 0.2s ease;
      }

      .panel-back-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .panel-back-btn ha-icon {
        --mdc-icon-size: 22px;
      }

      .panel-title {
        flex: 1;
        margin: 0;
        font-size: 15px;
        font-weight: 500;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Hide builder chrome when the inline settings panel is active */
      .layout-builder.module-settings-open .builder-toolbar,
      .layout-builder.module-settings-open .tree-breadcrumbs,
      .layout-builder.module-settings-open .tree-view-container,
      .layout-builder.module-settings-open .rows-container {
        display: none !important;
      }

      /* Non-fullscreen: hide card preview when settings open */
      .layout-builder:not(.fullscreen).module-settings-open .fullscreen-preview {
        display: none !important;
      }

      /* Fullscreen + settings open: top row (module left / card right) + settings full width below */
      .layout-builder.fullscreen.module-settings-open {
        flex-direction: column !important;
        padding: 12px;
        gap: 12px;
        overflow: hidden;
      }

      .fullscreen-top-row {
        display: flex;
        flex-direction: row;
        gap: 12px;
        flex-shrink: 0;
        width: 100%;
        max-height: 45vh;
      }

      .fullscreen-module-col,
      .fullscreen-card-col {
        flex: 1;
        min-width: 0;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--card-background-color);
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .fullscreen-section-label {
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--secondary-text-color);
        border-bottom: 1px solid var(--divider-color);
        flex-shrink: 0;
      }

      .fullscreen-module-col-content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }

      /* Module preview inside the fullscreen top row: no extra margins, no pin/collapse */
      .fullscreen-module-col .module-preview {
        margin: 0;
        border: none;
        border-radius: 0;
      }

      .fullscreen-module-col .preview-header {
        background: var(--secondary-background-color, rgba(0,0,0,0.05));
      }

      /* Hide pin and collapse controls in fullscreen top-row (preview is always visible) */
      .fullscreen-module-col .preview-pin-icon,
      .fullscreen-module-col .preview-caret {
        display: none;
      }

      /* Settings panel full width at bottom */
      .layout-builder.fullscreen.module-settings-open .module-settings-panel {
        flex: 1;
        max-width: none !important;
        max-height: calc(55vh - 80px);
        /*
         * Leave overflow: hidden from the base rule. The inner
         * .module-tab-content is the single scroll surface — adding
         * overflow-y: auto here creates a second nested scrollbar that
         * makes the panel "feel" stuck at the bottom (the inner scroller
         * is exhausted but the outer still has to scroll to reveal the
         * last rows of the form).
         */
        order: unset;
        min-height: 0;
      }

      /* Non-fullscreen: Module Preview full width in the settings panel */
      .module-settings-panel > .module-preview {
        margin: 0 0 0 0;
      }
      .module-tab-content > .module-preview {
        margin: 0 0 16px 0;
      }

      /* Non-fullscreen card preview inside settings layout */
      .layout-builder:not(.fullscreen).module-settings-open .fullscreen-preview-label {
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--secondary-text-color);
        border-bottom: 1px solid var(--divider-color);
      }

      .layout-builder:not(.fullscreen).module-settings-open .fullscreen-preview-card {
        min-height: 80px;
        overflow: auto;
        padding: 12px;
      }

      .layout-builder:not(.fullscreen).module-settings-open .fullscreen-preview-card ultra-card {
        display: block;
      }

      .layout-builder.module-settings-open {
        padding: 0;
      }

      /* Bound the editor height when settings panel is open so module-tab-content can scroll.
         Accounts for the HA dialog title bar, footer buttons, and dialog padding. */
      .layout-builder:not(.fullscreen).module-settings-open {
        max-height: calc(100vh - 160px);
        overflow: hidden;
      }

      /* Smooth open animation for row/column/module settings dialogs */
      @keyframes ucDialogOverlayIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes ucDialogContentIn {
        from {
          opacity: 0;
          transform: translateY(14px) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes ucDialogOverlayOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes ucDialogContentOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(10px) scale(0.99);
        }
      }

      .settings-popup .popup-overlay,
      .module-settings-popup .popup-overlay {
        animation: ucDialogOverlayIn 180ms ease-out both;
        backdrop-filter: blur(2px);
      }

      .settings-popup .popup-content,
      .module-settings-popup .popup-content {
        animation: ucDialogContentIn 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
        transform-origin: top center;
        will-change: transform, opacity;
      }

      .settings-popup.is-closing .popup-overlay,
      .module-settings-popup.is-closing .popup-overlay {
        animation: ucDialogOverlayOut ${POPUP_CLOSE_ANIMATION_MS}ms ease-in both;
      }

      .settings-popup.is-closing .popup-content,
      .module-settings-popup.is-closing .popup-content {
        animation: ucDialogContentOut ${POPUP_CLOSE_ANIMATION_MS}ms ease-in both;
      }

      .popup-content.popup-dragging,
      .popup-content.popup-resizing {
        animation: none !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .settings-popup .popup-overlay,
        .module-settings-popup .popup-overlay,
        .settings-popup .popup-content,
        .module-settings-popup .popup-content {
          animation: none !important;
          backdrop-filter: none;
        }
      }

      .popup-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 720px;
        /* min() so a landscape phone (~360px tall) does not overflow */
        min-height: min(480px, 90vh);
        max-width: 98vw;
        max-height: 98vh;
        overflow: visible; /* allow resize handle to be positioned relative to this container */
        display: flex;
        flex-direction: column;
      }

      .popup-body {
        overflow-y: auto; /* scrolling handled by popup body, not the main container */
        overflow-x: visible; /* allow dropdowns to render outside horizontally */
        flex: 1;
        padding-bottom: 28px; /* leave room so content doesn't sit under the resize handle */
      }

      /* Dropdown positioning fixes for popup context -
         ensure menus anchor to fields inside transformed draggable popups */
      .popup-content ha-select,
      .selector-content ha-select,
      .popup-content mwc-select,
      .popup-content ha-combo-box {
        position: relative !important;
        overflow: visible !important;
        z-index: ${Z_INDEX.DROPDOWN_SELECT} !important;
      }

      .popup-content ha-select .mdc-select__menu,
      .popup-content ha-select mwc-menu,
      .popup-content ha-select .mdc-menu,
      .popup-content ha-select ha-menu,
      .popup-content mwc-menu,
      .popup-content ha-menu,
      .popup-content .mdc-menu-surface,
      .selector-content ha-select .mdc-select__menu,
      .selector-content ha-select mwc-menu,
      .selector-content ha-select .mdc-menu,
      .selector-content ha-select ha-menu {
        /* Let HA position menus; we only ensure visibility */
        z-index: ${Z_INDEX.DROPDOWN_MENU} !important;
        max-height: 300px !important;
        overflow-y: auto !important;
        max-width: min(360px, 95vw) !important;
      }

      /* Ensure native editor dropdowns appear above module popup tabs */
      /* CRITICAL: Use fixed menu positioning like HA does in tile-card */
      .module-tab-content ha-select,
      .settings-tab-content ha-select,
      .module-tab-content mwc-select,
      .module-tab-content ha-combo-box,
      .module-tab-content mwc-menu-surface {
        position: relative !important;
        z-index: ${Z_INDEX.DROPDOWN_SELECT} !important;
      }

      /* Add fixed menu positioning attribute behavior */
      .module-tab-content ha-select[fixedmenuposition],
      .settings-tab-content ha-select[fixedmenuposition] {
        --mdc-menu-max-height: 400px;
      }

      /* Force ALL dropdown menus to appear above everything - ultra aggressive targeting */
      .module-tab-content ha-select::part(menu),
      .module-tab-content mwc-select::part(menu),
      .module-tab-content ha-select .mdc-menu-surface,
      .module-tab-content mwc-menu-surface,
      .module-tab-content ha-select mwc-menu,
      .module-tab-content ha-select ha-menu,
      .module-tab-content ha-list-item,
      .settings-tab-content ha-select::part(menu),
      .settings-tab-content mwc-select::part(menu),
      .settings-tab-content ha-select .mdc-menu-surface,
      .settings-tab-content mwc-menu-surface,
      .settings-tab-content ha-select mwc-menu,
      .settings-tab-content ha-select ha-menu,
      .settings-tab-content ha-list-item {
        z-index: 99999 !important;
        position: fixed !important;
      }

      /* Target the actual menu that renders in shadow DOM */
      .module-tab-content ha-select,
      .settings-tab-content ha-select {
        --mdc-menu-z-index: 99999 !important;
        --ha-select-menu-z-index: 99999 !important;
      }

      /* Global dropdown override - ensures any HA dropdown appears above popup tabs */
      ha-menu,
      mwc-menu,
      mwc-menu-surface,
      .mdc-menu-surface {
        z-index: 99999 !important;
      }

      /* Allow dropdown overflow; keep inner content scrollable */
      .popup-content {
        /* Allow dropdowns to overflow the scrolling container */
        overflow: visible !important;
      }

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--divider-color);
        position: sticky; /* keep header visible while scrolling */
        top: 0;
        z-index: 0;
        background: var(--card-background-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        border-radius: 8px 8px 0 0;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 32px;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .close-button:hover {
        color: var(--primary-color);
      }
      .action-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .action-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .duplicate-button {
        color: var(--primary-color);
      }

      .duplicate-button:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .delete-button {
        color: var(--error-color);
      }

      .delete-button:hover {
        background: var(--error-color);
        color: white;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Drag and Resize Functionality */
      .draggable-popup {
        /* Absolute inside the fixed full-viewport wrapper — effectively viewport-centered */
        position: absolute;
        /* Avoid transforms so fixed-position menus anchor to viewport correctly */
        transform: none !important;
        width: min(700px, 95vw);
        height: min(750px, 90vh);
        max-width: none;
        max-height: none;
        /* Center via negative margins (no transform = no new containing block for fixed children) */
        top: 50%;
        left: 50%;
        margin-left: -350px;
        margin-top: -375px;
        /* Sits above the DIALOG_OVERLAY (8000) wrapper background */
        z-index: ${Z_INDEX.DIALOG_CONTENT};
      }

      /* During drag/resize, remove centering transform — left/top set by JS */
      .draggable-popup.popup-dragging,
      .draggable-popup.popup-resizing {
        position: absolute;
        transform: none;
      }

      /* Selector popup drag positioning */
      .selector-content.popup-dragging {
        position: fixed;
        transform: none;
        /* left and top will be set by JavaScript during drag */
      }

      /* Mobile optimization for module popups */
      @media (max-width: 768px), (max-height: 768px) {
        .draggable-popup {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: calc(100vw - 20px) !important;
          height: calc(100vh - 40px) !important;
          margin: 0 !important;
          max-width: none !important;
          max-height: none !important;
        }
        /* Remove move affordance on mobile */
        .popup-header {
          cursor: default;
        }
        /* Hide resize handle on mobile */
        .draggable-popup .resize-handle {
          display: none;
        }
      }

      .popup-header {
        cursor: move;
        user-select: none;
      }

      .resize-handle {
        touch-action: none;
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 20px;
        height: 20px;
        cursor: se-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        border-radius: 8px 0 8px 0;
        transition: all 0.2s ease;
        z-index: ${Z_INDEX.RESIZE_HANDLE}; /* ensure it stays above all content including scrollable areas */
        pointer-events: auto; /* ensure it's always clickable */
      }

      /* Keep sticky behavior even during drag/resize */
      .draggable-popup .resize-handle {
        transform: none !important;
      }

      .resize-handle:hover {
        color: var(--primary-color);
        background: var(--divider-color);
      }

      .resize-handle ha-icon {
        --mdc-icon-size: 16px;
      }

      .popup-dragging {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        z-index: ${Z_INDEX.POPUP_TABS} !important;
      }

      .popup-resizing {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        transition: none !important;
      }

      .popup-resizing * {
        transition: none !important;
      }

      /* Override any conflicting styles for resizable elements */
      .draggable-popup.popup-resizing {
        max-width: none !important;
        max-height: none !important;
        width: auto !important;
        height: auto !important;
      }

      .popup-dragging .popup-header,
      .popup-resizing .popup-header {
        cursor: move;
      }

      .popup-dragging .resize-handle,
      .popup-resizing .resize-handle {
        pointer-events: none;
      }

      /* Selector popup drag behavior - above popup tabs when dragging */
      .selector-content.popup-dragging {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        z-index: ${Z_INDEX.POPUP_TABS + 10} !important;
      }

      .selector-content.popup-dragging .selector-header {
        cursor: move;
      }

      .selector-content.popup-dragging .resize-handle {
        pointer-events: none;
      }

      /* Prevent header expansion during drag/resize */
      .selector-content.popup-dragging .selector-header-wrapper,
      .selector-content.popup-resizing .selector-header-wrapper {
        height: auto !important;
        max-height: 200px !important;
        flex-shrink: 0 !important;
        overflow-y: hidden !important;
        min-height: 0 !important;
        /* Lock header size during drag to prevent Safari expansion */
        position: relative !important; /* Override sticky during drag to prevent expansion */
      }

      .selector-content.popup-dragging .selector-header,
      .selector-content.popup-resizing .selector-header {
        height: auto !important;
        max-height: fit-content !important;
        flex-shrink: 0 !important;
        min-height: 0 !important;
      }

      .selector-content.popup-dragging .module-selector-tabs,
      .selector-content.popup-resizing .module-selector-tabs {
        height: auto !important;
        max-height: 48px !important;
        flex-shrink: 0 !important;
        min-height: 0 !important;
      }

      /* Ensure body doesn't cause header expansion during drag */
      .selector-content.popup-dragging .selector-body,
      .selector-content.popup-resizing .selector-body {
        min-height: 0 !important;
        flex: 1 1 0 !important;
        overflow-y: auto !important;
      }

      /* Module Preview */
      .module-preview {
        margin: 16px 24px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden; /* prevent content from overflowing the preview container */
        max-width: 100%;
        transition: all 0.3s ease;
        flex-shrink: 0; /* never shrink when inside a flex column settings panel */
      }

      /* Pinned preview - visually highlighted; placement (outside scroll) keeps it in view */
      .module-preview.pinned {
        position: relative;
        z-index: 1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: var(--primary-color);
        background: var(--card-background-color);
      }

      /* Ensure pinned preview header also has solid background */
      .module-preview.pinned .preview-header {
        background: var(--secondary-background-color);
      }

      /* Ensure pinned preview content has solid background */
      .module-preview.pinned .preview-content {
        background: var(
          --view-background,
          var(--lovelace-background, var(--primary-background-color))
        );
      }

      .preview-header {
        padding: 12px 16px;
        background: var(--secondary-background-color);
        font-weight: 500;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .preview-pin-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .preview-pin-icon:hover {
        color: var(--primary-color);
        transform: scale(1.15);
      }

      .preview-pin-icon.pinned {
        color: var(--primary-color);
        transform: rotate(45deg);
      }

      .preview-pin-icon.pinned:hover {
        transform: rotate(45deg) scale(1.15);
      }

      .preview-caret {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .preview-caret:hover {
        color: var(--primary-color);
      }

      .preview-content {
        padding: 16px;
        min-height: 60px;
        display: block;
        max-width: 100%;
        overflow: visible; /* allow module content to extend beyond bounds (e.g., gauges, negative gap) */
        background: var(
          --view-background,
          var(--lovelace-background, var(--primary-background-color))
        );
      }

      /* Breakpoint preview container - constrains width to simulate device sizes */
      .preview-breakpoint-container {
        transition: max-width 0.3s ease;
        margin: 0 auto;
        width: 100%;
      }

      .preview-breakpoint-container.desktop {
        max-width: none;
      }

      .preview-breakpoint-container.laptop {
        max-width: 1280px;
      }

      .preview-breakpoint-container.tablet {
        max-width: 900px;
      }

      .preview-breakpoint-container.mobile {
        max-width: 375px;
      }

      /* Module Tabs - sticky at top, above scrolling content */
      .module-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        z-index: ${Z_INDEX.BASE_CONTENT};
        background: var(--card-background-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        flex-shrink: 0;
        /* Don't use isolation: isolate - it prevents fixed dropdowns from escaping */
      }

      .module-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .module-tab:hover {
        color: var(--primary-color);
      }

      .module-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .module-tab-content {
        padding: 16px 0 0;
        flex: 1;
        overflow-y: auto;
        overflow-x: visible;
        width: 100%;
        box-sizing: border-box;
        min-height: 0;
        position: relative;
        z-index: 0;
      }

      /* Design Subtabs */
      .design-subtabs {
        display: flex;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
      }

      .design-subtab {
        flex: 1;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .design-subtab:hover {
        color: var(--primary-color);
      }

      .design-subtab.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      /* Settings Sections */
      .settings-section {
        margin-bottom: 20px;
        width: 100%;
        box-sizing: border-box;
      }

      .settings-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        width: 100%;
        box-sizing: border-box;
      }

      /* Color Section Styling */
      .color-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-picker-wrapper {
        display: flex;
        align-items: center;
      }

      .color-picker-wrapper ultra-color-picker {
        width: 100%;
        max-width: 300px;
      }

      /* Font Dropdown Styling */
      .font-dropdown {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
      }

      .font-dropdown:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .font-dropdown optgroup {
        font-weight: 600;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        padding: 4px 0;
      }

      .font-dropdown option {
        padding: 4px 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      /* Font Size Input Styling */
      .font-size-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .font-size-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      /* Enhanced Alignment Buttons */
      .alignment-buttons {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }

      .alignment-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .alignment-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }

      .alignment-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .settings-section input,
      .settings-section select,
      .settings-section textarea {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .settings-section textarea {
        min-height: 60px;
        resize: vertical;
      }

      /* Gap control container styles */
      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .gap-slider {
        flex: 1;
        min-width: 0;
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        outline: none;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .gap-slider:hover {
        opacity: 1;
      }

      .gap-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      .gap-slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      .gap-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      .gap-slider::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      .gap-slider::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        border: none;
      }

      .gap-input {
        flex: 0 0 60px;
        min-width: 60px;
        max-width: 60px;
        text-align: center;
        padding: 6px 8px !important;
      }

      /* Ensure form elements fit properly */
      .settings-section ha-form {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Ensure color pickers fit properly */
      .settings-section ultra-color-picker {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Consistent styling for all module settings */
      .module-tab-content .settings-section,
      .settings-tab-content .settings-section {
        border-radius: 8px;
        padding: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .module-tab-content .settings-section:last-child,
      .settings-tab-content .settings-section:last-child {
        margin-bottom: 0;
      }

      /* Enhanced input field styling for consistency */
      .module-tab-content input[type='number'],
      .module-tab-content input[type='text'],
      .module-tab-content input[type='color'],
      .module-tab-content select,
      .module-tab-content textarea,
      .settings-tab-content input[type='number'],
      .settings-tab-content input[type='text'],
      .settings-tab-content input[type='color'],
      .settings-tab-content select,
      .settings-tab-content textarea {
        width: 100%;
        max-width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
      }

      .module-tab-content input:focus,
      .module-tab-content select:focus,
      .module-tab-content textarea:focus,
      .settings-tab-content input:focus,
      .settings-tab-content select:focus,
      .settings-tab-content textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      /* Range sliders consistent styling */
      .module-tab-content input[type='range'],
      .settings-tab-content input[type='range'] {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        outline: none;
        -webkit-appearance: none;
      }

      .module-tab-content input[type='range']::-webkit-slider-thumb,
      .settings-tab-content input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
      }

      /* Checkbox and radio button styling */
      .module-tab-content input[type='checkbox'],
      .module-tab-content input[type='radio'],
      .settings-tab-content input[type='checkbox'],
      .settings-tab-content input[type='radio'] {
        width: auto;
        margin-right: 8px;
        accent-color: var(--primary-color);
      }

      /* Label styling for form elements */
      .module-tab-content label,
      .settings-tab-content label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        line-height: 1.4;
      }

      /* Field groups */
      .module-tab-content .field-group,
      .settings-tab-content .field-group {
        gap: 12px;
        align-items: flex-end;
      }

      .module-tab-content .field-group > div,
      .settings-tab-content .field-group > div {
        flex: 1;
      }

      /* Button Groups */
      .alignment-buttons,
      .format-buttons {
        display: flex;
        gap: 4px;
      }

      .alignment-btn,
      .format-btn {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover,
      .format-btn:hover {
        border-color: var(--primary-color);
      }

      .alignment-btn.active,
      .format-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }

      /* Value Position Buttons for Bar Module */
      .value-position-buttons {
        display: flex;
        gap: 8px;
      }

      .position-btn {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .position-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }

      .position-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }

      /* Spacing Grid */
      .spacing-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .spacing-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
      }

      .spacing-cross {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: center;
        max-width: 120px;
        margin: 0 auto;
      }

      .spacing-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .spacing-center {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px;
      }

      .spacing-cross input {
        width: 60px;
        text-align: center;
        padding: 4px 8px;
        font-size: 12px;
      }

      /* Module Rendering */
      .text-module {
        word-wrap: break-word;
      }

      .separator-module {
        width: 100%;
      }

      .image-module {
        text-align: center;
      }
      .image-placeholder {
        padding: 20px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }
      .module-placeholder {
        padding: 20px;
        text-align: center;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Logic Tab Styles */
      .logic-tab-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
      }

      .logic-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .section-header h3 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 600;
      }

      .display-mode-dropdown {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        min-height: 48px;
      }

      /* Conditions Section */
      .conditions-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .conditions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .conditions-header h4 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 600;
      }

      .add-condition-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-condition-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .add-condition-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .conditions-list {
        display: flex;
        flex-direction: column;
        gap: 14px; /* slightly larger separation between condition cards */
      }

      .no-conditions {
        text-align: center;
        padding: 32px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Individual Condition Item */
      .condition-item {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 0;
        transition: all 0.2s ease;
      }

      .condition-item.disabled {
        opacity: 0.6;
      }

      .condition-item:hover {
        border-color: var(--primary-color);
      }

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--card-background-color);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .condition-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .condition-toggle {
        background: none;
        border: none;
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
      }

      .condition-toggle:hover {
        background: var(--secondary-background-color);
      }

      .condition-toggle ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.2s ease;
      }

      .condition-toggle.expanded ha-icon {
        transform: rotate(0deg);
      }

      .condition-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .condition-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .condition-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .condition-action-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-action-btn.delete:hover {
        background: var(--error-color);
        color: white;
      }

      .condition-action-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .condition-drag-handle {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: grab;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .condition-drag-handle:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-drag-handle:active {
        cursor: grabbing;
      }

      /* Condition Content */
      .condition-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .condition-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 8px; /* add breathing room between stacked fields */
      }

      .condition-field label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        display: block;
        margin: 0 0 8px 0;
        text-transform: capitalize;
      }

      .condition-field select,
      .condition-field input,
      .condition-field textarea {
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: border-color 0.2s ease;
      }

      .condition-field select:focus,
      .condition-field input:focus,
      .condition-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .condition-enable-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: normal !important;
        cursor: pointer;
      }

      /* Condition Type Specific Styles */
      .entity-condition-fields,
      .time-condition-fields,
      .custom-field-condition,
      .template-condition {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .time-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .condition-info {
        margin: 0;
        padding: 8px 12px;
        background: var(--info-color, #2196f3);
        color: white;
        border-radius: 6px;
        font-size: 12px;
        text-align: center;
      }

      .template-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      /* Template Section */
      .template-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .template-header {
        margin-bottom: 16px;
      }

      .template-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .template-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-editor {
        min-height: 120px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
      }

      @media (max-width: 768px) {
        .columns-container {
          flex-direction: column;
        }

        .column-builder {
          border-right: none;
          border-bottom: 1px solid var(--divider-color);
        }

        .column-builder:last-child {
          border-bottom: none;
        }

        /* Single column module grid on mobile */
        .module-types {
          grid-template-columns: 1fr;
        }

        /* Hide green layout badge on mobile to avoid conflict with title */
        .layout-badge {
          display: none !important;
        }

        .spacing-grid {
          grid-template-columns: 1fr;
        }

        .time-inputs {
          grid-template-columns: 1fr;
        }
      }

      /* Logic Module Dimming */
      .module-with-logic {
        position: relative;
      }

      .module-with-logic.logic-hidden {
        opacity: 0.4;
        filter: grayscale(50%);
      }

      .logic-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 500;
        border-radius: 4px;
        pointer-events: none;
        z-index: ${Z_INDEX.CARD_BACKGROUND};
      }

      .logic-overlay ha-icon {
        --mdc-icon-size: 20px;
        margin-bottom: 4px;
      }

      .logic-overlay span {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }

      /* Toggle Switch Styles */
      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .switch-label {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--switch-unchecked-color, #ccc);
        transition: 0.3s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: '';
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:focus + .slider {
        box-shadow: 0 0 1px var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .slider.round {
        border-radius: 24px;
      }

      .slider.round:before {
        border-radius: 50%;
      }

      /* Disabled state for conditions */
      .disabled-note {
        font-size: 12px;
        color: var(--warning-color, #ff9800);
        font-style: italic;
        font-weight: normal;
      }

      .template-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin: 4px 0 12px 0;
      }

      /* Animation keyframes and classes for preview windows */
      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes vibrate {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-2px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(2px);
        }
      }

      @keyframes rotate-left {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotate-right {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes hover {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes fade {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes scale {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-10px);
        }
        60% {
          transform: translateY(-5px);
        }
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-5px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(5px);
        }
      }

      @keyframes tada {
        0% {
          transform: scale(1);
        }
        10%,
        20% {
          transform: scale(0.9) rotate(-3deg);
        }
        30%,
        50%,
        70%,
        90% {
          transform: scale(1.1) rotate(3deg);
        }
        40%,
        60%,
        80% {
          transform: scale(1.1) rotate(-3deg);
        }
        100% {
          transform: scale(1) rotate(0);
        }
      }

      .animation-pulse {
        animation-name: pulse;
        animation-iteration-count: infinite;
      }

      .animation-vibrate {
        animation-name: vibrate;
        animation-iteration-count: infinite;
      }

      .animation-rotate-left {
        animation-name: rotate-left;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-rotate-right {
        animation-name: rotate-right;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-hover {
        animation-name: hover;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-fade {
        animation-name: fade;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-scale {
        animation-name: scale;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-bounce {
        animation-name: bounce;
        animation-iteration-count: infinite;
      }

      .animation-shake {
        animation-name: shake;
        animation-timing-function: cubic-bezier(0.36, 0.07, 0.19, 0.97);
        animation-iteration-count: infinite;
      }

      .animation-tada {
        animation-name: tada;
        animation-iteration-count: infinite;
      }

      /* Row and Column Preview Styles */
      .row-preview-content {
        display: flex;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        min-height: 60px;
        align-items: center;
        justify-content: space-around;
      }

      .column-preview {
        flex: 1;
        padding: 12px;
        margin: 0 4px;
        background: var(--accent-color);
        color: white;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
      }

      .column-preview-content {
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        text-align: center;
        background: var(--secondary-background-color);
        min-height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .column-preview-content p {
        margin: 0 0 8px 0;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      /* Background filter support for previews - use pseudo-element to avoid blurring content */
      .row-preview-content.has-background-filter,
      .column-preview-content.has-background-filter {
        position: relative;
        isolation: isolate;
      }

      .row-preview-content.has-background-filter::before,
      .column-preview-content.has-background-filter::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        background-image: var(--bg-image);
        background-size: var(--bg-size);
        background-position: var(--bg-position);
        background-repeat: var(--bg-repeat);
        filter: var(--bg-filter);
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
      }

      .module-count {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      /* Drag and Drop Styles */
      .row-builder[draggable='true'],
      .column-builder[draggable='true'],
      .module-item[draggable='true'] {
        cursor: grab;
      }

      .row-builder[draggable='true']:hover,
      .column-builder[draggable='true']:hover,
      .module-item[draggable='true']:hover {
        cursor: grab;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .row-builder[draggable='true']:active,
      .column-builder[draggable='true']:active,
      .module-item[draggable='true']:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      /* Invalid drop target indication */
      :host([dragging-column]) .module-item,
      :host([dragging-row]) .module-item,
      :host([dragging-row]) .column-builder {
        cursor: not-allowed !important;
        opacity: 0.5;
        pointer-events: auto;
      }
      .drop-target {
        box-shadow: 0 0 20px rgba(var(--rgb-primary-color), 0.6) !important;
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        transform: scale(1.02) !important;
        transition: all 0.2s ease !important;
      }
      .drop-target.row-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }
      .drop-target.column-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }

      .drop-target.module-item {
        border-color: var(--primary-color) !important;
        border-width: 2px !important;
        border-style: dashed !important;
      }

      /* Drag handle indicators (disabled) */
      /* We now render explicit drag handles inside headers. The legacy
         pseudo-element indicators caused duplicate icons on mobile. */
      .row-header::before,
      .column-header::before,
      .module-content::before {
        content: none !important; /* hide legacy indicators */
      }

      /* Module item hover effect - consolidated with action display */
      .module-item:hover {
        border-color: var(--primary-color) !important;
      }

      .row-header {
        position: relative;
        z-index: 0;
      }

      .column-header {
        position: relative;
        z-index: 0;
      }

      .module-content {
        position: relative;
        z-index: 0;
      }

      /* Visual feedback during drag */
      .row-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .column-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .module-item[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      /* Enhanced modules container styling */
      .modules-container {
        min-height: 80px;
        position: relative;
        transition: all 0.2s ease;
      }

      .module-name-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }

      .module-name-row label {
        margin: 0;
      }

      /* Module Name Field Styling */
      .module-name-input {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
      }

      .module-name-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .field-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-top: 4px;
        font-style: italic;
      }

      /* Note: Image module still shows "Image Name" field from the registry.
         This will need to be addressed in the image module itself to remove
         the duplicate field since we now have universal "Module Name" above. */

      .modules-container:empty {
        border: 2px dashed var(--divider-color);
        background: var(--secondary-background-color);
      }

      .modules-container:empty::before {
        content: 'Drop modules here or click Add Module';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 13px;
        pointer-events: none;
        text-align: center;
      }

      .modules-container::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px dashed transparent;
        border-radius: 6px;
        pointer-events: none;
        transition: all 0.2s ease;
        z-index: 1;
      }

      .column-builder.drop-target .modules-container::after {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      /* Layout Module Styles - No borders, full-width headers */
      .layout-module-container {
        border: none;
        border-radius: 0;
        background: transparent;
        width: 100%;
        box-sizing: border-box;
        overflow: visible;
        margin-bottom: 8px;
        margin-left: 0;
      }

      .layout-module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--success-color, #4caf50);
        color: white;
        border-radius: 6px 6px 0 0;
        position: relative;
        z-index: 1;
      }

      .layout-module-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .layout-module-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-module-drag-handle:hover {
        opacity: 1;
      }

      .layout-module-drag-handle:active {
        cursor: grabbing;
      }

      .layout-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .layout-module-add-btn,
      .layout-module-settings-btn,
      .layout-module-duplicate-btn,
      .layout-module-delete-btn,
      .layout-module-copy-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .layout-module-add-btn:hover,
      .layout-module-settings-btn:hover,
      .layout-module-duplicate-btn:hover,
      .layout-module-copy-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .layout-module-delete-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      /* Level 2: Nested layout module - blue header for depth */
      .nested-layout-module-container.layout-module-container {
        margin-left: 0;
      }

      .nested-layout-module-container .nested-layout-module-header {
        background: #2196f3;
        border-radius: 6px 6px 0 0;
      }

      /* Level 3: Deep nested layout module - purple header for depth */
      .deep-nested-layout-module.layout-module-container {
        margin-left: 0;
      }

      .deep-nested-layout-module .nested-layout-module-header {
        background: #9c27b0;
        border-radius: 6px 6px 0 0;
      }

      /* Level 1: Base container - green semi-transparent background */
      .layout-modules-container {
        background: rgba(76, 175, 80, 0.5);
        border: none;
        border-radius: 0 0 6px 6px;
        margin: 0;
        padding: 8px;
        transition: all 0.2s ease;
        position: relative;
      }

      .layout-modules-container:hover {
        background: rgba(76, 175, 80, 0.6);
      }

      .layout-modules-container.layout-drop-target {
        background: rgba(var(--rgb-primary-color), 0.5) !important;
        box-shadow: inset 0 0 0 2px var(--primary-color) !important;
      }

      /* Level 2: Nested layout container - blue semi-transparent background */
      .nested-layout-modules-container {
        background: rgba(33, 150, 243, 0.5);
        border: none;
        border-radius: 0 0 6px 6px;
        margin: 0;
        padding: 8px;
      }

      .nested-layout-modules-container:hover {
        background: rgba(33, 150, 243, 0.6);
      }

      /* Level 3: Deep nested container - purple semi-transparent background */
      .deep-nested-drop-zone {
        background: rgba(156, 39, 176, 0.5);
        border: none;
        border-radius: 0 0 6px 6px;
        margin: 0;
        padding: 8px;
      }

      .deep-nested-drop-zone:hover {
        background: rgba(156, 39, 176, 0.6);
      }

      .layout-module-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 24px;
        width: 100%;
        cursor: pointer;
        user-select: none;
        transition:
          color 0.2s ease,
          opacity 0.2s ease;
      }

      .layout-module-empty ha-icon {
        --mdc-icon-size: 32px;
        opacity: 0.7;
      }

      .layout-module-empty:hover ha-icon {
        opacity: 1;
      }

      .layout-child-module-wrapper {
        width: 100%;
        box-sizing: border-box;
        cursor: grab;
      }

      .layout-child-module-wrapper:active {
        cursor: grabbing;
      }

      /* Simplified layout child module styling - clean rounded borders */
      .layout-child-simplified-module {
        width: 100%;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        transition: all 0.2s ease;
        cursor: pointer;
        box-sizing: border-box;
        margin-bottom: 8px;
        min-height: 60px;
        padding: 8px;
      }

      .layout-child-simplified-module:hover {
        background: var(--card-background-color);
        filter: brightness(1.1);
        border-color: var(--primary-color);
      }

      .layout-child-simplified-module:hover .layout-child-content {
        color: var(--primary-text-color);
      }

      .layout-child-simplified-module:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      /* Pagebreak module specific styling - visible separator */
      .layout-child-simplified-module.pagebreak-module {
        background: var(--secondary-background-color, #f5f5f5);
        border: 1px dashed var(--primary-color, #03a9f4);
        border-left: 4px solid var(--primary-color, #03a9f4);
      }

      .layout-child-simplified-module.pagebreak-module:hover {
        background: var(--secondary-background-color, #f5f5f5);
        filter: brightness(1.05);
        border-color: var(--primary-color, #03a9f4);
      }

      .layout-child-simplified-module.pagebreak-module .layout-child-icon {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border-radius: 4px;
        padding: 4px;
      }

      /* Compact 2-row layout for deeply nested modules */
      .layout-child-simplified-module.layout-child-compact {
        padding: 0;
        overflow: hidden;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
      }

      .layout-child-simplified-module.layout-child-compact:hover {
        background: var(--card-background-color);
        filter: brightness(1.1);
        border-color: var(--primary-color);
      }

      .layout-child-compact-wrapper {
        display: flex;
        align-items: stretch;
        min-height: 100%;
        overflow: hidden;
        width: 100%;
      }

      .layout-child-compact .layout-child-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        flex-shrink: 0;
        align-self: center;
        width: 28px;
        height: 28px;
        --mdc-icon-size: 20px;
        opacity: 0.7;
      }

      .layout-child-compact-content {
        flex: 1;
        display: grid;
        grid-template-rows: auto auto;
        min-width: 0;
        padding: 10px 12px 10px 4px;
        gap: 6px;
        overflow: hidden;
        width: 100%;
        box-sizing: border-box;
      }

      .layout-child-compact-row1 {
        display: flex;
        align-items: center;
        padding: 2px 0;
        position: relative;
        z-index: 1;
        pointer-events: none;
        overflow: hidden;
        width: 100%;
        min-width: 0;
      }

      .layout-child-compact-row1-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        border-radius: 4px;
        transition: background 0.2s ease;
        pointer-events: none;
        position: relative;
        z-index: 1;
        overflow: hidden;
        width: 100%;
        min-width: 0;
        flex: 1;
      }

      .layout-child-compact-row1-content:hover {
        background: none;
      }

      .layout-child-compact-row1 .layout-child-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .layout-child-compact-row1 .layout-child-content {
        flex: 1;
        min-width: 0;
      }

      .layout-child-compact-row1 .layout-child-title {
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .layout-child-compact-row1 .layout-child-info {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Compact action buttons - row 2 */
      .layout-child-compact-actions {
        display: flex;
        gap: 0;
        margin: 0;
        padding: 6px 0 4px;
        width: 100%;
        isolation: isolate;
        position: relative;
        z-index: 3;
        pointer-events: auto;
        margin-top: 2px;
        align-self: stretch;
        overflow: hidden;
        box-sizing: border-box;
      }

      .layout-child-compact-actions .layout-child-action-btn {
        padding: 8px;
        min-width: 40px;
        min-height: 36px;
        flex: 1;
        border-radius: 4px;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        transition: all 0.2s ease;
        --mdc-icon-size: 18px;
      }

      .layout-child-compact-actions .layout-child-action-btn:first-child {
        padding-left: 8px;
      }

      .layout-child-compact-actions .layout-child-action-btn:last-child {
        padding-right: 8px;
      }

      .layout-child-compact-actions .layout-child-action-btn ha-icon {
        pointer-events: none;
      }

      .layout-child-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        min-height: 40px;
        box-sizing: border-box;
      }

      .layout-child-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .layout-child-content {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        position: relative;
        z-index: 1;
      }

      .layout-child-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }

      .layout-child-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .layout-child-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--secondary-text-color);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-child-drag-handle:hover {
        opacity: 1;
        color: var(--primary-color);
      }

      .layout-child-drag-handle:active {
        cursor: grabbing;
      }

      .layout-child-actions {
        display: flex;
        gap: 0;
        align-items: stretch;
        position: relative;
        z-index: 10;
        pointer-events: auto;
        flex-shrink: 0;
        /* Extend to fill header height and capture all clicks in this area */
        margin: -8px -12px -8px 0;
        padding: 0;
        align-self: stretch;
      }

      .layout-child-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px 8px;
        border-radius: 0;
        transition: all 0.2s ease;
        --mdc-icon-size: 16px;
        min-width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 11;
        pointer-events: auto;
        box-sizing: border-box;
        flex: 1;
      }

      .layout-child-action-btn:first-child {
        padding-left: 12px;
      }

      .layout-child-action-btn:last-child {
        padding-right: 12px;
        border-radius: 0 4px 4px 0;
      }

      /* Make ha-icon inside action buttons pass-through for clicks */
      .layout-child-action-btn ha-icon {
        pointer-events: none;
      }

      .layout-child-action-btn.edit-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .layout-child-action-btn.duplicate-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .layout-child-action-btn.delete-btn:hover {
        background: var(--error-color);
        color: white;
      }

      .layout-child-action-btn.copy-btn {
        color: var(--success-color, #4caf50);
      }

      .layout-child-action-btn.copy-btn:hover {
        background: var(--success-color, #4caf50);
        color: white;
      }

      /* Tabs section child overflow menu - hidden on desktop by default */
      .tabs-section-child-overflow {
        display: none;
        position: relative;
        flex-shrink: 0;
      }

      .tabs-section-child-overflow .tree-overflow-btn {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        margin: -4px -8px -4px 0;
      }

      .tabs-section-child-overflow .tree-overflow-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        z-index: 1000;
      }

      /* Drag handle for touch devices */
      @media (hover: none) {
        /* On touch devices, show action buttons on tap/focus */
        .module-item:active .module-hover-overlay,
        .module-item:focus-within .module-hover-overlay {
          opacity: 1;
          visibility: visible;
        }

        .module-action-btn {
          width: 36px;
          height: 36px;
        }

        .module-action-btn ha-icon {
          --mdc-icon-size: 20px;
        }
      }

      /* Module Selector Tabs */
      .module-selector-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        /* Tabs are inside sticky wrapper, no separate positioning needed */
        /* Ensure tabs don't overflow on mobile */
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
        flex-shrink: 0; /* Prevent tabs from expanding */
        min-height: fit-content; /* Use content height */
        max-height: fit-content; /* Prevent expansion */
      }

      .module-selector-tabs::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }

      .tab-button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 2px solid transparent;
      }

      .tab-button:hover {
        color: var(--primary-color);
        background: var(--primary-color-10);
      }

      .tab-button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        background: var(--primary-color-10);
      }

      .tab-button ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Layout Containers spacing */
      .module-category.layout-containers {
        margin-top: 20px;
      }

      /* Presets Tab */
      .presets-container {
        padding: 16px;
      }

      .preset-categories {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .category-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
      }

      .category-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .category-btn.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .category-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      .presets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }

      .preset-card {
        display: flex;
        flex-direction: column;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .preset-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .preset-card.default-preset:hover,
      .preset-card.builtin-preset:hover {
        border-color: var(--primary-color);
      }

      .preset-card.community-preset:hover {
        border-color: rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
      }

      /* WordPress preset specific styles */
      .presets-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
        align-items: center;
      }

      .preset-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px 0;
        border-top: 1px solid var(--divider-color);
        margin-top: 16px;
      }

      .reload-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 500;
      }

      .reload-btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--card-background-color);
      }

      .reload-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .reload-btn ha-icon {
        --mdc-icon-size: 14px;
        transition: transform 0.6s ease;
      }

      .reload-btn ha-icon.spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .wordpress-status {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .status-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
      }

      .status-item.loading {
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
      }

      .status-item.error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
        color: var(--error-color, #f44336);
      }

      .status-item.success {
        background: rgba(var(--rgb-success-color, 76, 175, 80), 0.1);
        color: var(--success-color, #4caf50);
      }

      .status-item ha-icon {
        --mdc-icon-size: 16px;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .retry-btn,
      .refresh-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin-left: 8px;
      }

      .retry-btn:hover,
      .refresh-btn:hover {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1);
        transform: scale(1.1);
      }

      .retry-btn ha-icon,
      .refresh-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Preset header with badge, title, and stats */
      .preset-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: rgba(var(--rgb-primary-color), 0.02);
        border-bottom: 1px solid var(--divider-color);
        gap: 12px;
      }

      .preset-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .preset-title-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }

      .preset-header-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .preset-header-author {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-style: italic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Origin badge styles */
      .preset-header .origin-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }

      /* Different styles for different badge types */
      .preset-header .origin-badge.community {
        background: rgba(var(--rgb-secondary-color, 255, 152, 0), 0.9);
        color: white;
        border: 1px solid rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
      }

      .preset-header .origin-badge.default {
        background: rgba(var(--rgb-primary-color), 0.9);
        color: var(--text-primary-color, #fff);
        border: 1px solid rgba(var(--rgb-primary-color), 1);
      }

      .preset-header .origin-badge.builtin {
        background: rgba(var(--rgb-secondary-text-color), 0.8);
        color: var(--card-background-color, #fff);
        border: 1px solid rgba(var(--rgb-secondary-text-color), 0.9);
      }

      .preset-header .new-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
        background: rgba(76, 175, 80, 0.9);
        color: white;
      }

      /* Large preview section */
      .preset-preview {
        position: relative;
        width: 100%;
        height: 200px;
        background: var(--secondary-background-color);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 8px;
        box-sizing: border-box;
      }

      .preset-thumbnail {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
      }

      .preset-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
      }

      .preset-card:hover .preset-thumbnail img {
        transform: scale(1.05);
      }

      /* Image slider styles */
      .preset-image-slider {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        border-radius: 8px;
      }
      .preset-slider-container {
        display: flex;
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
        cursor: grab;
      }
      .preset-slider-container:active {
        cursor: grabbing;
      }
      .preset-slider-image {
        flex: 0 0 100%;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preset-slider-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
      }

      .preset-card:hover .preset-slider-image img {
        transform: scale(1.05);
      }

      /* Slider navigation dots */
      .preset-slider-dots {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 6px;
        z-index: 2;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .preset-image-slider:hover .preset-slider-dots {
        opacity: 1;
      }

      .preset-slider-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(0, 0, 0, 0.2);
      }

      .preset-slider-dot.active {
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1.2);
      }

      .preset-slider-dot:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      /* Slider navigation arrows */
      .preset-slider-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
        z-index: 2;
      }

      .preset-image-slider:hover .preset-slider-nav {
        opacity: 1;
      }

      .preset-slider-nav:hover {
        background: rgba(0, 0, 0, 0.7);
        transform: translateY(-50%) scale(1.1);
      }

      .preset-slider-nav.prev {
        left: 8px;
      }

      .preset-slider-nav.next {
        right: 8px;
      }

      .preset-slider-nav ha-icon {
        font-size: 16px;
      }

      .preset-icon-large {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 50%;
        color: var(--primary-color);
      }

      .preset-icon-large ha-icon {
        font-size: 40px;
      }

      /* Content section */
      .preset-content {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .preset-description {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Action buttons at bottom */
      .preset-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }

      .preset-actions button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        justify-content: center;
        min-height: 40px;
      }

      .preset-actions button ha-icon {
        font-size: 16px;
      }

      /* Primary button (Add) */
      .add-preset-btn.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
      }

      .add-preset-btn.primary:hover {
        background: var(--primary-color);
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.3);
      }

      /* Secondary button (Read More) */
      .read-more-btn.secondary {
        background: transparent;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
      }

      .read-more-btn.secondary:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        transform: translateY(-1px);
      }

      /* Enhanced preset cards for community presets */
      .preset-card.community-preset {
        border-left: 3px solid rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
      }

      .preset-card.community-preset:hover {
        border-left-color: rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
        box-shadow: 0 4px 16px rgba(var(--rgb-secondary-color, 255, 152, 0), 0.2);
      }

      /* Enhanced preset cards for default presets */
      .preset-card.default-preset {
        border-left: 3px solid var(--primary-color);
      }

      .preset-card.default-preset:hover {
        border-left-color: var(--primary-color);
        box-shadow: 0 4px 16px rgba(var(--rgb-primary-color), 0.2);
      }

      .preset-card.builtin-preset {
        border-left: 3px solid var(--divider-color);
      }

      /* Preset stats (downloads, ratings) */
      .preset-stats {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .preset-stats .stat {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--secondary-text-color);
        background: rgba(var(--rgb-secondary-text-color), 0.1);
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 500;
      }

      .preset-stats .stat ha-icon {
        --mdc-icon-size: 12px;
      }

      /* Preset rating stars (clickable) */
      .preset-rating-stars {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(255, 193, 7, 0.1);
        transition: all 0.2s ease;
      }

      .preset-rating-stars:hover {
        background: rgba(255, 193, 7, 0.2);
        transform: scale(1.05);
      }

      .preset-rating-stars ha-icon {
        --mdc-icon-size: 16px;
        transition: transform 0.2s ease;
      }

      .preset-rating-stars:hover ha-icon {
        transform: scale(1.1);
      }

      .preset-rating-stars .rating-count {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-left: 2px;
        font-weight: 500;
      }

      /* Error hint for empty states */
      .error-hint {
        font-size: 12px;
        color: var(--error-color, #f44336);
        text-align: center;
        margin-top: 8px;
        font-style: italic;
      }

      /* Preset description and actions */
      .preset-description {
        margin: 8px 0;
        line-height: 1.4;
        color: var(--secondary-text-color);
        font-size: 13px;
        overflow: hidden;
        max-height: 4.2em; /* ~3 lines */
      }

      .read-more-link {
        background: none;
        border: none;
        padding: 2px 0;
        font-size: 12px;
        color: var(--primary-color);
        cursor: pointer;
        font-weight: 500;
        display: block;
        margin-bottom: 4px;
      }

      /* Details expansion panel */
      .preset-details {
        padding: 12px 16px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
        animation: fadeSlideIn 0.2s ease-out;
      }

      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .detail-info {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 12px;
        font-size: 12px;
        margin-bottom: 10px;
      }

      .detail-info dt {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .detail-info dd {
        margin: 0;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .detail-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }

      .detail-tag {
        display: inline-block;
        padding: 2px 8px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-radius: 4px;
        font-size: 11px;
        color: var(--primary-color);
        font-weight: 500;
      }

      /* Scoped styles for WordPress HTML in description / read-more panels */
      .preset-full-desc,
      .preset-description {
        font-size: 13px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }

      .preset-full-desc p,
      .preset-full-desc li {
        margin: 0 0 6px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }

      .preset-full-desc a {
        color: var(--primary-color);
        text-decoration: underline;
      }

      .preset-full-desc h1,
      .preset-full-desc h2,
      .preset-full-desc h3 {
        font-size: 13px;
        font-weight: 600;
        margin: 8px 0 4px;
        color: var(--primary-text-color);
      }

      .preset-full-desc ul,
      .preset-full-desc ol {
        padding-left: 16px;
        margin: 4px 0;
      }

      .preset-full-desc img {
        max-width: 100%;
        border-radius: 6px;
      }

      .preset-author {
        font-size: 11px;
        color: var(--secondary-text-color);
      }

      .preset-tags {
        display: flex;
        gap: 4px;
      }

      .tag {
        padding: 2px 6px;
        background: var(--secondary-background-color);
        border-radius: 10px;
        font-size: 10px;
        color: var(--secondary-text-color);
      }

      /* Integrations chips */
      .preset-integrations {
        margin-top: 6px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .integration-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 6px;
        font-size: 10px;
        border-radius: 12px;
        background: var(--primary-color-10);
        color: var(--primary-color);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      .error-details {
        margin-top: 16px;
        padding: 16px;
        background: var(--error-color);
        color: white;
        border-radius: 8px;
        text-align: left;
        max-width: 500px;
      }

      .error-hint {
        margin: 0 !important;
        font-size: 13px !important;
        line-height: 1.4;
      }

      .error-hint code {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
      }

      .error-hint strong {
        font-weight: 600;
      }

      /* Row Action Buttons */
      .row-paste-btn,
      .row-remap-entities-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-paste-btn:hover,
      .row-remap-entities-btn:hover {
        background: rgba(100, 150, 255, 0.8);
        color: white;
      }

      .row-favorite-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-favorite-btn:hover {
        background: rgba(255, 100, 150, 0.8);
        color: white;
      }

      .row-export-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-export-btn:hover {
        background: rgba(100, 150, 255, 0.8);
        color: white;
      }

      /* More actions button - hidden on desktop, shown on mobile */
      .row-more-container {
        position: relative;
        display: none; /* Hidden on desktop */
        z-index: 100;
      }

      .row-more-btn {
        background: none;
        border: none;
        color: color-mix(in srgb, var(--text-primary-color, #fff) 80%, transparent);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .row-more-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary-color, #fff);
      }

      /* Ensure menu appears above everything */
      .row-more-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: ${Z_INDEX.CONTEXT_MENU};
        min-width: 180px;
        overflow: hidden;
        margin-top: 4px;
      }

      .more-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        color: var(--primary-text-color);
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-size: 14px;
        font-weight: 500;
        min-height: 48px;
        box-sizing: border-box;
      }

      .more-menu-item:hover {
        background: var(--secondary-background-color);
      }

      .more-menu-item:active {
        background: var(--divider-color);
      }

      .more-menu-item.favorite {
        color: var(--pink-color, #e91e63);
      }

      .more-menu-item.export {
        color: var(--blue-color, #2196f3);
      }

      .more-menu-item ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }

      .more-menu-item span {
        flex: 1;
        white-space: nowrap;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .presets-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* Improve tab visibility on mobile */
        .module-selector-tabs {
          /* Tabs are now inside sticky header, no need for separate sticky positioning */
          background: var(--secondary-background-color);
          border-bottom: 2px solid var(--divider-color);
          gap: 0; /* Remove gap on mobile for better fit */
        }

        .tab-button {
          flex-direction: row;
          gap: 6px;
          min-width: 0; /* Allow buttons to shrink */
          white-space: nowrap;
          padding: 14px 8px;
          min-height: 48px;
          font-size: 13px;
          font-weight: 500;
        }

        .tab-button ha-icon {
          --mdc-icon-size: 20px;
        }

        .tab-button span {
          font-size: 13px;
          font-weight: 500;
        }

        .preset-categories {
          justify-content: center;
          gap: 6px;
        }

        .category-btn {
          padding: 10px 12px;
          font-size: 13px;
        }

        .reload-btn {
          padding: 10px 12px;
          font-size: 13px;
        }

        /* Make module selector popup larger on mobile */
        .selector-content {
          width: 95vw !important;
          max-width: 95vw !important;
          height: 85vh !important;
          max-height: 85vh !important;
        }

        .selector-body {
          padding: 12px;
          overflow-y: auto;
        }

        /* Improve module cards on mobile */
        .module-types {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .module-type-btn {
          padding: 16px;
          text-align: left;
        }

        .preset-preview {
          height: 160px;
          padding: 6px;
        }

        .preset-header {
          padding: 10px 12px;
        }

        .preset-header-title {
          font-size: 14px;
        }

        .preset-content {
          padding: 12px;
        }

        .preset-actions {
          padding: 10px 12px;
        }

        .preset-actions button {
          padding: 8px 12px;
          font-size: 12px;
        }

        /* Mobile slider improvements */
        .preset-slider-nav {
          width: 28px;
          height: 28px;
        }

        .preset-slider-nav ha-icon {
          font-size: 14px;
        }

        .preset-slider-dots {
          bottom: 6px;
        }

        .preset-slider-dot {
          width: 6px;
          height: 6px;
        }

        /* Hide column layout text on mobile to save space */
        .column-layout-text {
          display: none;
        }

        /* Show all action icons on mobile (no more overflow menu needed) */
        .row-paste-btn,
        .row-remap-entities-btn,
        .row-favorite-btn,
        .row-export-btn {
          display: flex;
        }

        /* Keep overflow menu hidden on mobile */
        .row-more-container {
          display: none;
        }

        /* Increase gap between action icons on mobile for better spacing */
        .row-actions-left,
        .row-actions-right {
          gap: 10px;
        }

        /* Adjust button and icon sizes on mobile */
        .row-actions-left button,
        .row-actions-right button {
          width: 36px;
          height: 36px;
        }

        .row-actions-left button ha-icon,
        .row-actions-right button ha-icon {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      /* Search Bar Styles */
      .search-bar-container {
        padding: 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .search-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--card-background-color);
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        transition: all 0.2s;
      }

      .search-bar:focus-within {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .search-bar ha-icon {
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }

      .search-bar input {
        flex: 1;
        border: none;
        background: none;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        color: var(--primary-text-color);
      }

      .search-bar input::placeholder {
        color: var(--secondary-text-color);
        opacity: 0.7;
      }

      .clear-search-btn {
        padding: 4px;
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
      }

      .clear-search-btn:hover {
        background: var(--divider-color);
      }

      .clear-search-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Search Results Styles */
      .search-results-container {
        padding: 16px;
      }

      .search-results-header {
        margin-bottom: 16px;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .search-category-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        margin: 16px 0 8px 0;
        background: var(--secondary-background-color);
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .search-category-header ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
      }

      .search-results-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .search-result-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: var(--card-background-color);
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .search-result-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .search-result-item.locked {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .search-result-item.locked:hover {
        border-color: var(--divider-color);
        transform: none;
      }

      .search-result-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-radius: 8px;
        flex-shrink: 0;
      }

      .search-result-icon ha-icon {
        --mdc-icon-size: 28px;
      }

      .search-result-content {
        flex: 1;
        min-width: 0;
      }

      .search-result-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        gap: 12px;
      }

      .search-result-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .search-result-tier {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }

      .search-result-tier.standard {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .search-result-tier.pro {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .search-result-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .search-result-version {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin: 4px 0 0 0;
        opacity: 0.7;
      }

      .add-icon,
      .lock-icon {
        --mdc-icon-size: 24px;
        flex-shrink: 0;
        color: var(--primary-color);
      }

      .lock-icon {
        color: var(--secondary-text-color);
      }

      .search-results-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
      }

      .search-results-empty ha-icon {
        --mdc-icon-size: 64px;
        color: var(--secondary-text-color);
        opacity: 0.5;
        margin-bottom: 16px;
      }

      .search-results-empty p {
        font-size: 15px;
        color: var(--secondary-text-color);
        margin: 0 0 20px 0;
      }

      .clear-search-btn-large {
        padding: 12px 24px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }

      .clear-search-btn-large:hover {
        background: var(--primary-color-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
`;
