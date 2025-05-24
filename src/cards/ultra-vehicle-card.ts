import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  UltraVehicleCardConfig,
  IconRowConfig,
  IconConfig,
  BarConfig,
  SectionStyles,
  ActionImageConfig,
  SectionCondition,
  SectionBreakConfig, // Import
  InfoRowConfig,
  InfoEntityConfig,
} from '../types';
import { DEFAULT_VEHICLE_IMAGE, truncateText, hexToRgb } from '../utils/constants';
import { getImageUrl } from '../utils/image-upload';
import {
  generateGradientString,
  createLinearGradient,
  getColorAtPosition,
} from '../components/gradient-editor';
import { VERSION } from '../version';
// Add import for the 'until' directive
import { until } from 'lit/directives/until.js';
// Import the TemplateService
import { TemplateService } from '../services/template-service';

// Keep this for backwards compatibility
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    __uvc_template_strings?: { [key: string]: string };
  }
}

@customElement('ultra-vehicle-card')
export class UltraVehicleCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private config!: UltraVehicleCardConfig;

  // Template service instance
  private _templateService?: TemplateService;

  // Add a static property for default active states
  private static readonly DEFAULT_ACTIVE_STATES = [
    // Active-like States
    'on',
    'open',
    'unlocked',
    'connected',
    'running',
    'moving',
    'charging',
    'plugged in',
    'enabled',
    'heating',
    'cooling',
    'occupied',
    'engaged',
    'active',
    'cleaning',
    'starting',
    'ready',
    'true',
    'triggered',
    'detected',
    'home',
    'present',
  ];

  // Add a static property for default inactive states
  private static readonly DEFAULT_INACTIVE_STATES = [
    // Unavailable / Fault States
    'unavailable',
    'unknown',
    'offline',
    'disconnected',
    'not responding',
    'no signal',
    'not ready',
    'fault',
    // Idle / Passive States
    'idle',
    'inactive',
    'off',
    'standby',
    'sleep',
    'sleeping',
    'paused',
    'closed',
    'locked',
    // Specific to vehicles
    'parked',
    'not charging',
    'unplugged',
    'disabled',
    'offloading',
    'stopped',
    'false',
    'not_detected',
    'away',
    'empty',
    'vacant',
  ];

  private _lastRenderTime = 0;
  private _lastImageUrl: string | null = null; // Add cache for the last used image URL

  // Add state for custom map popup
  @state() private _mapPopupData: { latitude: number; longitude: number; title: string } | null =
    null;

  // Add state property to store the last known active state for icons
  @state() private _iconActiveStates: Map<string, boolean> = new Map();
  // Add state property to track icons awaiting confirmation
  @state() private _iconsAwaitingConfirmation: Map<string, number> = new Map();

  // These template-related state properties are kept for backwards compatibility
  // but will delegate to the template service
  @state() private _templateSubscriptions: Map<string, Promise<() => Promise<void>>> = new Map();
  @state() private _templateResults: Map<string, boolean> = new Map();

  // Add a property to store document click listeners for confirmation cancellation
  private _confirmationCancelListeners: Map<string, EventListener> = new Map();

  static getConfigElement() {
    return document.createElement('ultra-vehicle-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'Vehicle Title',
      title_alignment: 'center',
      title_size: 24,
      formatted_entities: true,
      show_units: true,
      vehicle_image_type: 'default',
      sections_order: ['title', 'image', 'info', 'bar_0', 'icons'],
      // Other defaults...
    };
  }

  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        --bar-height: 10px;
        --bar-thickness: var(--bar-height, 10px);
        --bar-radius: 2px;
        --card-padding: 16px;
        --uvc-icon-size-default: 24px; /* Default icon size */
        --uvc-bar-spacing: 8px; /* Default spacing between bars in a row */
      }

      ha-card {
        overflow: hidden;
      }

      .card-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px; /* Gap between sections */
      }

      .card-title {
        color: var(--primary-text-color);
        font-family: var(--ha-card-header-font-family, inherit);
        letter-spacing: -0.012em;
        line-height: 1.2;
        display: block;
        width: 100%;
        margin-top: 8px;
        margin-bottom: 8px;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
        /* font-size is set via inline style from config */
      }

      .two-column-layout {
        display: grid;
        gap: 16px;
        height: 100%;
      }

      /* Dashboard Layout Styles */
      .dashboard-layout {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-section {
        position: relative;
        z-index: 2; /* Above vehicle image */
      }

      .dashboard-middle {
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
      }

      .dashboard-center-row {
        display: grid;
        grid-template-columns: minmax(80px, 0.8fr) minmax(auto, 2fr) minmax(80px, 0.8fr);
        gap: 16px;
        align-items: center;
        width: 100%;
      }

      .left-middle-section {
        justify-self: start;
        width: 100%;
        max-width: 160px;
        align-self: center;
      }

      .right-middle-section {
        justify-self: end;
        width: 100%;
        max-width: 160px;
        align-self: center;
      }

      /* Vertical icon stacking for side sections */
      .left-middle-section .icon-rows-container,
      .right-middle-section .icon-rows-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Force icon rows to be vertical in side sections */
      .left-middle-section .icon-row,
      .left-middle-section .icon-row-grid,
      .right-middle-section .icon-row,
      .right-middle-section .icon-row-grid {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        gap: 8px !important;
      }

      /* Make icons in side sections take full width */
      .left-middle-section .icon-outer-container,
      .right-middle-section .icon-outer-container {
        width: 100% !important;
      }

      .dashboard-center-image {
        justify-self: center;
        max-width: 75%;
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 150px;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        padding: 8px;
      }

      /* When the image is displayed, make sure it shows in the center */
      .dashboard-layout .vehicle-image-container {
        max-width: 100%;
        z-index: 1; /* Below section content */
      }

      .dashboard-layout .dashboard-center-image .vehicle-image-container {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        opacity: 1;
        margin: 0 auto;
        height: 100%;
      }

      .dashboard-layout .dashboard-center-image .vehicle-image {
        max-height: 250px;
        width: auto;
        object-fit: contain;
        filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.2));
      }

      .centered-image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      .centered-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      /* Column width variations */
      .two-column-layout.columns-50-50 {
        grid-template-columns: 1fr 1fr;
      }
      .two-column-layout.columns-30-70 {
        grid-template-columns: 3fr 7fr;
      }
      .two-column-layout.columns-70-30 {
        grid-template-columns: 7fr 3fr;
      }
      .two-column-layout.columns-40-60 {
        grid-template-columns: 4fr 6fr;
      }
      .two-column-layout.columns-60-40 {
        grid-template-columns: 6fr 4fr;
      }

      .column {
        display: flex;
        flex-direction: column;
        /* No gap needed as each section already has its own margins */
        min-width: 0; /* Prevent overflow in grid cells */
      }

      /* Vehicle Info styles */
      .vehicle-info-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 16px;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
      }

      .vehicle-info-top {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-bottom: 8px;
      }

      .info-item-with-icon {
        display: flex;
        align-items: center;
        font-size: 0.85em;
        color: var(--primary-text-color);
        cursor: pointer;
        position: relative; /* Ensure proper stacking */
      }

      .info-item-with-icon ha-icon {
        margin-right: 8px;
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }

      .info-item-status {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
      }

      .info-item.info-empty {
        justify-content: center;
        padding: 12px;
        font-style: italic;
        color: var(--secondary-text-color);
      }

      .info-label {
        font-weight: 500;
        color: var(--secondary-text-color);
        margin-right: 8px;
      }

      .info-value {
        font-weight: 400;
        color: var(--primary-text-color);
      }

      /* Vertical centering for two-column layout */
      .two-column-layout .column {
        justify-content: center;
      }

      /* Ensure images in two-column layout don't overflow their columns */
      .column .vehicle-image-container,
      .column .action-image-container {
        max-width: 100%;
      }

      /* Ensure nested elements in columns maintain their styles */
      .column .bars-container,
      .column .icon-rows {
        width: 100%;
        margin: 0 auto;
      }

      /* Center content within columns */
      .column .card-title,
      .column .vehicle-image-container,
      .column .bars-container,
      .column .icon-rows-container {
        align-self: center;
        width: 100%;
      }

      /* Vehicle image */
      .vehicle-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative; /* Create stacking context */
        z-index: 1; /* Ensure vehicle image stays below interactive elements */
        margin: 8px 0; /* Add default 8px margin on top and bottom for consistency */
      }

      /* Edge-to-edge image styling for images > 100% width */
      .vehicle-image-container.edge-to-edge {
        width: calc(100% + (var(--card-padding, 16px) * 2)); /* Extend full width plus padding */
        box-sizing: border-box;
        margin-left: calc(-1 * var(--card-padding, 16px));
        margin-right: calc(-1 * var(--card-padding, 16px));
        max-width: none; /* Override max-width limits */
      }

      .vehicle-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition:
          transform 0.2s ease,
          opacity 0.2s ease;
      }

      .vehicle-image.image-error {
        opacity: 0.2;
      }

      .vehicle-image.action-image-active {
        /* Add specific styling for action image when active */
      }

      /* Clickable image styles */
      .vehicle-image.clickable {
        cursor: pointer;
        pointer-events: auto; /* Enable clicks */
      }

      .vehicle-image.clickable:hover {
        transform: scale(1.02);
      }

      /* Icon styling */
      .icon-rows-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
      }

      /* Icon Row with alignment classes */
      .icon-row {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: 4px 0;
      }

      /* New grid layout for evenly distributed columns */
      .icon-row-grid {
        width: 100%;
        padding: 4px 0;
        /* Grid styles are applied inline */
      }

      /* Ensure icons in grid layout fill their cells */
      .icon-row-grid .icon-outer-container {
        width: 100%;
        box-sizing: border-box;
      }

      /* Alignment classes */
      .align-flex-start {
        justify-content: flex-start;
      }

      .align-center {
        justify-content: center;
      }

      .align-flex-end {
        justify-content: flex-end;
      }

      .align-space-between {
        justify-content: space-between;
      }

      .align-space-around {
        justify-content: space-around;
      }

      .align-space-evenly {
        justify-content: space-evenly;
      }

      /* Icon container */
      .icon-outer-container {
        /* Change to flex and stretch children */
        display: flex;
        align-items: stretch; /* Make children fill height */
      }

      .icon-container {
        display: flex;
        /* flex-direction and align-items set dynamically */
        /* Add width, height, padding, gap, and box-sizing */
        width: 100%;
        height: 100%;
        padding: 8px;
        gap: 0px; /* Consistent gap for both directions initially */
        box-sizing: border-box;
        cursor: pointer;
        position: relative; /* Create stacking context */
        z-index: 2; /* Ensure clickability */
        justify-content: center; /* Default centering for vertical */
      }

      /* Special styling for horizontal (left/right) layout */
      /* REMOVE specific padding here */
      .icon-container[style*='flex-direction: row'],
      .icon-container[style*='flex-direction: row-reverse'] {
        justify-content: space-between; /* Push icon and text apart */
        gap: 8px; /* Add gap for horizontal layouts */
      }

      .icon-container.draggable {
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
      }

      .icon-container:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .icon-background {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
        padding: 8px;
        box-sizing: border-box;
      }

      /* Adjust icon background margin for horizontal layouts */
      /* REMOVE these specific margin adjustments */
      /* .icon-container[style*='flex-direction: row'] .icon-background,
      .icon-container[style*='flex-direction: row-reverse'] .icon-background {
        margin-bottom: 0;
        margin-right: 0;
        margin-left: 0;
      } */

      .icon-container ha-icon {
        font-size: 24px;
      }

      .icon-label {
        font-size: 0.85em;
        margin-top: 4px;
        text-align: center;
        width: 100%;
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        word-break: break-word;
        line-height: 1.2;
      }

      /* Horizontal layout specific styles for icon labels */
      /* REMOVE these specific margin adjustments */
      /* .icon-container[style*='flex-direction: row'] .icon-label,
      .icon-container[style*='flex-direction: row-reverse'] .icon-label {
        margin-top: 0;
        text-align: left;
        align-self: center;
      } */

      .icon-state {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        text-align: center;
        white-space: normal !important;
        overflow: visible !important;
        text-overflow: clip !important;
        width: 100%;
      }

      /* Horizontal layout specific styles for icon states */
      /* REMOVE these specific margin adjustments */
      /* .icon-container[style*='flex-direction: row'] .icon-state,
      .icon-container[style*='flex-direction: row-reverse'] .icon-state {
        text-align: left;
        align-self: center;
      } */

      .card-header {
        padding: 8px 16px 16px;
        display: flex;
        width: 100%;
      }

      .card-header.left {
        justify-content: flex-start;
      }

      .card-header.center {
        justify-content: center;
      }

      .card-header.right {
        justify-content: flex-end;
      }

      .card-title.left {
        text-align: left;
      }

      .card-title.center {
        text-align: center;
      }

      .card-title.right {
        text-align: right;
      }

      /* Map Popup Styles */
      .map-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: var(--dialog-z-index, 7); /* Just below HA's dialog z-index */
        backdrop-filter: blur(2px);
      }

      .map-popup-content {
        background-color: var(--ha-card-background, var(--card-background-color, white));
        padding: 0; /* Remove padding, header/map handle spacing */
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 600px;
        overflow: hidden; /* Contain the map */
        position: relative; /* Ensure proper stacking context */
      }

      .map-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        background-color: var(--secondary-background-color);
      }

      .map-popup-title {
        display: flex;
        flex-direction: column;
      }

      .map-popup-header h3 {
        margin: 0;
        font-size: 1.2em;
        color: var(--primary-text-color);
      }

      .map-popup-address {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        margin-top: 4px;
        font-weight: normal;
      }

      .map-popup-header ha-icon-button {
        color: var(--secondary-text-color);
      }

      .map-popup-footer {
        padding: 8px 16px;
        border-top: 1px solid var(--divider-color);
        text-align: center;
      }

      .map-popup-footer a {
        color: var(--primary-color);
        text-decoration: none;
        font-size: 0.9em;
      }

      .map-popup-footer a:hover {
        text-decoration: underline;
      }

      /* Progress bar container styles */
      .bars-container {
        display: flex;
        flex-direction: row; /* Changed from column to row */
        flex-wrap: wrap; /* Allow wrapping */
        gap: 8px; /* Add spacing between bars */
        width: 100%;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
        margin-top: 8px;
        margin-bottom: 8px;
      }

      .progress-bar-wrapper {
        /* New wrapper class */
        display: flex;
        flex-direction: column;
        flex-shrink: 0; /* Prevent shrinking */
        /* width is set via inline style */
        margin-top: 8px;
        margin-bottom: 8px;
      }

      /* Bar wrapper for applying individual section styles */
      .bar-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center; /* Vertically center the bar within the wrapper */
      }

      .progress-bar-container {
        margin-bottom: 8px;
      }

      .progress-bar {
        position: relative;
        height: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        overflow: hidden;
        width: 100%;
      }

      /* Bar width classes */
      .progress-bar.width-25 {
        width: 25%;
      }

      .progress-bar.width-50 {
        width: 50%;
      }

      .progress-bar.width-75 {
        width: 75%;
      }

      .progress-bar.width-100 {
        width: 100%;
      }

      .progress-bar.bar-size-thin {
        height: 8px;
        border-radius: 4px;
      }

      .progress-bar.bar-size-regular {
        height: 16px;
        border-radius: 8px;
      }

      .progress-bar.bar-size-thick {
        height: 24px;
        border-radius: 12px;
      }

      .progress-bar.bar-size-thiccc {
        height: 32px;
        border-radius: 16px;
      }

      .progress-bar-fill {
        position: relative;
        height: 100%;
        width: 0;
        transition:
          width 1s ease,
          background-color 1s ease;
      }

      /* Ensure precise matching of border-radius for progress-bar and fill */
      .progress-bar.bar-radius-rounded-square .progress-bar-fill {
        border-radius: 2px 0 0 2px; /* Left corners always 4px by default */
      }

      /* Special case for outline style with rounded-square - use 2px radius for better appearance */
      .progress-bar.bar-style-outline.bar-radius-rounded-square .progress-bar-fill {
        border-radius: 2px 0 0 2px; /* Left corners always 2px for outline style */
      }

      /* When percentage is 100%, use full border radius */
      .progress-bar.bar-radius-rounded-square .progress-bar-fill[style*='width: 100%'] {
        border-radius: 4px; /* Full rounded corners */
      }

      /* When percentage is 100% with outline style, use full 2px radius */
      .progress-bar.bar-style-outline.bar-radius-rounded-square
        .progress-bar-fill[style*='width: 100%'] {
        border-radius: 2px; /* Full rounded corners with 2px for outline style */
      }

      /* Bar Style Presets */
      /* 1. Flat (Default) - No additional styling */

      /* 2. Glossy - Light reflection effect */
      .progress-bar-fill.bar-style-glossy {
        box-shadow:
          inset 0 2px 0 rgba(255, 255, 255, 0.4),
          inset 0 -2px 0 rgba(0, 0, 0, 0.1);
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.05) 50%,
          rgba(0, 0, 0, 0.05) 51%,
          rgba(0, 0, 0, 0.1) 100%
        );
      }

      /* 3. Embossed - Raised effect */
      .progress-bar-fill.bar-style-embossed {
        box-shadow:
          inset 0 2px 4px rgba(255, 255, 255, 0.6),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3),
          0 2px 4px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(0, 0, 0, 0.15);
        margin: -1px;
      }

      /* 7. Outline - Clean bordered design */
      .progress-bar-fill.bar-style-outline {
        height: 100%;
        border-radius: inherit;
        margin-right: 0;
        box-shadow: none;
        position: relative;
      }

      .progress-bar.bar-style-outline {
        border: 2px solid var(--primary-color, rgba(var(--rgb-primary-color, 52, 152, 219), 1));
        background-color: var(--disabled-color, rgba(var(--rgb-primary-color, 52, 152, 219), 0.05));
        overflow: hidden;
        border-radius: inherit;
        padding: 4px;
        box-sizing: border-box;
      }

      /* Special case for square bar with outline style to have a small radius matching the padding */
      .progress-bar.bar-size-thin.bar-style-outline.bar-radius-square {
        border-radius: 4px; /* Match padding for thin bars */
      }

      .progress-bar.bar-size-regular.bar-style-outline.bar-radius-square {
        border-radius: 6px; /* Match padding for regular bars */
      }

      .progress-bar.bar-size-thick.bar-style-outline.bar-radius-square {
        border-radius: 8px; /* Match padding for thick bars */
      }

      .progress-bar.bar-size-thiccc.bar-style-outline.bar-radius-square {
        border-radius: 9px; /* Match padding for extra thick bars */
      }

      /* Adjust the padding for thin bars with outline style */
      .progress-bar.bar-size-thin.bar-style-outline {
        padding: 1px;
        border-width: 1px;
      }

      /* 4. Inset - Recessed effect */
      .progress-bar-fill.bar-style-inset {
        box-shadow:
          inset 1px 1px 2px var(--divider-color, rgba(0, 0, 0, 0.2)),
          inset -1px -1px 1px rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }
      .progress-bar.bar-style-inset {
        box-shadow:
          inset 1px -1px 10px var(--divider-color, rgba(0, 0, 0, 0.1)),
          0 0 10px var(--divider-color, rgba(0, 0, 0, 0.1));
        padding: 3px;
      }

      /* 5. Gradient Overlay - Subtle gradient regardless of fill color */
      .progress-bar-fill.bar-style-gradient {
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 0.1) 40%,
          rgba(0, 0, 0, 0.08) 60%,
          rgba(0, 0, 0, 0.1) 100%
        );
      }

      /* 6. Neon Glow - Glowing effect */
      .progress-bar-fill.bar-style-neon {
        box-shadow:
          0 0 7px 2px
            rgba(
              var(--glow-color-r, var(--rgb-primary-color-r, 52)),
              var(--glow-color-g, var(--rgb-primary-color-g, 152)),
              var(--glow-color-b, var(--rgb-primary-color-b, 219)),
              0.7
            ),
          0 0 14px 6px
            rgba(
              var(--glow-color-r, var(--rgb-primary-color-r, 52)),
              var(--glow-color-g, var(--rgb-primary-color-g, 152)),
              var(--glow-color-b, var(--rgb-primary-color-b, 219)),
              0.5
            ),
          0 0 20px 10px
            rgba(
              var(--glow-color-r, var(--rgb-primary-color-r, 52)),
              var(--glow-color-g, var(--rgb-primary-color-g, 152)),
              var(--glow-color-b, var(--rgb-primary-color-b, 219)),
              0.3
            ),
          inset 0 0 10px rgba(255, 255, 255, 0.8);
        border: 1px solid
          rgba(
            var(--glow-color-r, var(--rgb-primary-color-r, 52)),
            var(--glow-color-g, var(--rgb-primary-color-g, 152)),
            var(--glow-color-b, var(--rgb-primary-color-b, 219)),
            0.8
          );
        margin: -1px;
        z-index: 2;
        filter: brightness(1.2);
      }

      /* 7. Material - Material design inspired */
      .progress-bar-fill.bar-style-material {
        transition:
          width 0.5s cubic-bezier(0.4, 0, 0.2, 1),
          background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        height: 100% !important;
        border-radius: inherit !important;
      }
      .progress-bar.bar-style-material {
        height: inherit;
        min-height: 6px;
        overflow: hidden;
        border: none;
        background-color: rgba(var(--rgb-primary-color, 52, 152, 219), 0.15);
        padding: 0;
      }

      /* 8. Glass - Transparent look with blur effect */
      .progress-bar-fill.bar-style-glass {
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.1) 100%
        );
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        box-shadow:
          inset 0 0 8px rgba(255, 255, 255, 0.8),
          inset 0 0 16px rgba(255, 255, 255, 0.1);
      }
      .progress-bar.bar-style-glass {
        background: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      /* 9. Metallic - Metallic appearance */
      .progress-bar-fill.bar-style-metallic {
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(255, 255, 255, 0.2) 35%,
          rgba(0, 0, 0, 0.1) 50%,
          rgba(0, 0, 0, 0.2) 51%,
          rgba(0, 0, 0, 0.05) 100%
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.6),
          inset 0 -1px 0 rgba(0, 0, 0, 0.25),
          0 1px 2px rgba(0, 0, 0, 0.2);
      }
      .progress-bar.bar-style-metallic {
        background-image: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.2) 0%,
          rgba(0, 0, 0, 0.1) 100%
        );
      }

      /* 10. Neumorphic - Soft UI style */
      .progress-bar-fill.bar-style-neumorphic {
        border-radius: inherit !important;
        box-shadow:
          inset 2px 2px 5px rgba(0, 0, 0, 0.15),
          inset -2px -2px 5px rgba(255, 255, 255, 0.15);
      }
      .progress-bar.bar-style-neumorphic {
        background-color: var(--card-background-color, #f0f0f0);
        border: none;
        box-shadow:
          inset 2px 2px 5px rgba(0, 0, 0, 0.1),
          inset -2px -2px 5px rgba(255, 255, 255, 0.1),
          5px 5px 10px rgba(0, 0, 0, 0.05),
          -5px -5px 10px rgba(255, 255, 255, 0.05);
        padding: 3px;
      }

      /* 11. Dashed - Dashed line effect */
      .progress-bar-fill.bar-style-dashed {
        background-image: repeating-linear-gradient(
          90deg,
          currentColor 0px,
          /* Use currentColor instead of var(--bar-color) */ currentColor 5px,
          /* Length of the dash (5px) */ transparent 5px,
          /* Start of the gap */ transparent 10px
            /* End of the gap (5px dash + 5px gap = 10px total) */
        );
        background-size: 10px 100%; /* Width of one dash + gap cycle (5px + 5px) */
        background-color: transparent; /* No solid background */
        box-shadow: none; /* Remove other shadows */
      }

      /* For full/cropped gradients with dashed style, apply a mask pattern */
      .progress-bar-fill.bar-style-dashed[data-mode='full'],
      .progress-bar-fill.bar-style-dashed[data-mode='cropped'] {
        /* Create a mask effect over the gradient background */
        mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          black 5px,
          transparent 5px,
          transparent 10px
        );
        -webkit-mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          black 5px,
          transparent 5px,
          transparent 10px
        );
        mask-size: 10px 100%;
        -webkit-mask-size: 10px 100%;
      }

      /* Optional: Styling for the container when dashed */
      .progress-bar.bar-style-dashed {
        background-color: transparent !important; /* Force transparent background for gaps */
        border: none; /* Remove border if you want only dashes */
        /* padding: 1px;  Add padding if border is removed */
      }

      /* NEW: CSS Mask for dashed gradient (full/cropped modes) */
      .progress-bar-fill[data-mask-style='dashed'] {
        mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          /* Opaque part for the dash */ black 5px,
          /* End of opaque dash */ transparent 5px,
          /* Start of transparent gap */ transparent 10px /* End of transparent gap */
        );
        mask-size: 10px 100%; /* Size of one cycle */
        mask-repeat: repeat-x; /* Repeat horizontally */
        /* Add -webkit- prefix for compatibility */
        -webkit-mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          black 5px,
          transparent 5px,
          transparent 10px
        );
        -webkit-mask-size: 10px 100%;
        -webkit-mask-repeat: repeat-x;
        /* Ensure no background color interferes with the masked gradient */
        background-color: transparent !important;
      }

      /* Animation classes fix to follow border radius */
      .progress-bar-fill.animate-charging-lines::before,
      .progress-bar-fill.animate-rainbow::before,
      .progress-bar-fill.animate-ripple::before,
      .progress-bar-fill.animate-wave::before,
      .progress-bar-fill.animate-traffic::before,
      .progress-bar-fill.animate-glow::after,
      .progress-bar-fill.animate-bubbles::before,
      .progress-bar-fill.animate-bubbles::after,
      .progress-bar-fill.animate-bubbles span::before,
      .progress-bar-fill.animate-bubbles span::after,
      .progress-bar-fill.animate-progress-spinner::before,
      .progress-bar-fill.animate-shimmer::before {
        border-radius: inherit;
        overflow: hidden;
      }

      /* Gradient styles */
      .progress-bar-fill[has-gradient='true'] {
        z-index: 2;
      }

      /* Full gradient mode */
      .progress-bar-fill[has-gradient='true'][data-mode='full'] {
        background-color: transparent !important;
        background-size: 100% 100% !important;
        background-position: 0% 0% !important;
        background-repeat: no-repeat !important;
      }

      /* Animations for progress bars */
      @keyframes charging-lines {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 50px 0;
        } /* Only move horizontally */
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes blinking {
        0% {
          opacity: 1;
        }
        49% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
        99% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes bouncing {
        0% {
          transform: scaleY(1);
        }
        50% {
          transform: scaleY(0.8);
        }
        100% {
          transform: scaleY(1);
        }
      }

      @keyframes glow {
        0% {
          box-shadow:
            0 0 10px 3px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.7
              ),
            0 0 20px 6px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.4
              );
          opacity: 0.7;
        }
        50% {
          box-shadow:
            0 0 20px 5px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.9
              ),
            0 0 40px 10px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.6
              );
          opacity: 0.9;
        }
        100% {
          box-shadow:
            0 0 10px 3px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.7
              ),
            0 0 20px 6px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.4
              );
          opacity: 0.7;
        }
      }

      @keyframes rainbow {
        0% {
          filter: hue-rotate(0deg);
        }
        100% {
          filter: hue-rotate(360deg);
        }
      }

      /* MODIFIED: Keyframes for Fill (changed from fill-pulse) */
      @keyframes fill-grow {
        0% {
          transform: scaleX(0);
        }
        50% {
          transform: scaleX(1);
        } /* Grow full */
        100% {
          transform: scaleX(0);
        } /* Shrink back to loop */
      }

      /* NEW: Keyframes for new animations */
      @keyframes ripple {
        0%,
        100% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 0%);
        }
        20% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 20%);
        }
        40% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 40%);
        }
        60% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 30%, transparent 60%);
        }
        80% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 40%, transparent 80%);
        }
      }

      @keyframes wave {
        0% {
          clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        }
        25% {
          clip-path: path('M0,50 Q25,55 50,50 Q75,45 100,50 V100 H0 Z');
        }
        50% {
          clip-path: path('M0,50 Q25,55 50,60 Q75,55 100,50 V100 H0 Z');
        }
        75% {
          clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        }
        100% {
          clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        }
      }

      @keyframes traffic {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 30px 0;
        }
      }

      @keyframes heartbeat {
        0%,
        100% {
          transform: scale(1);
        }
        15% {
          transform: scale(1.1);
        }
        30% {
          transform: scale(1);
        }
        45% {
          transform: scale(1.15);
        }
        60% {
          transform: scale(1);
        }
      }

      @keyframes slide-in {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(0);
        }
      }

      @keyframes flicker {
        0%,
        100% {
          opacity: 1;
        }
        41%,
        45% {
          opacity: 0.75;
        }
        48%,
        52% {
          opacity: 0.9;
        }
        53%,
        58% {
          opacity: 0.78;
        }
        62%,
        69% {
          opacity: 0.92;
        }
        74%,
        78% {
          opacity: 0.85;
        }
        83%,
        89% {
          opacity: 0.95;
        }
      }

      @keyframes progress-spinner {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes shimmer {
        0% {
          filter: brightness(1);
        }
        25% {
          filter: brightness(1.3);
        }
        50% {
          filter: brightness(1);
        }
        75% {
          filter: brightness(1.3);
        }
        100% {
          filter: brightness(1);
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

      /* Animation classes */
      /* MODIFIED: Added background-color and opacity (KEEPING THESE) */
      .progress-bar-fill.animate-charging-lines::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
        background-image: linear-gradient(
          -45deg,
          rgba(255, 255, 255, 0.3) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.3) 75%,
          transparent 75%,
          transparent
        );
        background-size: 50px 50px;
        animation: charging-lines 1.5s linear infinite; /* Adjusted speed slightly */
        pointer-events: none;
        z-index: 3;
        opacity: 1;
      }

      .progress-bar-fill.animate-pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }

      .progress-bar-fill.animate-blinking {
        animation: blinking 1s step-end infinite;
      }

      .progress-bar-fill.animate-bouncing {
        animation: bouncing 0.8s ease-in-out infinite;
        transform-origin: center;
      }

      .progress-bar-fill.animate-glow::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        animation: glow 2s ease-in-out infinite;
        z-index: 3;
      }

      .progress-bar-fill.animate-rainbow::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          to right,
          rgba(255, 0, 0, 0.5),
          rgba(255, 165, 0, 0.5),
          rgba(255, 255, 0, 0.5),
          rgba(0, 128, 0, 0.5),
          rgba(0, 0, 255, 0.5),
          rgba(75, 0, 130, 0.5),
          rgba(238, 130, 238, 0.5)
        );
        mix-blend-mode: overlay;
        animation: rainbow 3s linear infinite;
        pointer-events: none;
        z-index: 3;
      }

      /* MODIFIED: Use fill-grow animation for .animate-fill */
      .progress-bar-fill.animate-fill {
        animation: fill-grow 2s ease-in-out infinite; /* Use new animation */
        transform-origin: left; /* Ensure growth starts from the left */
      }

      /* NEW: Animation classes for the new types */
      .progress-bar-fill.animate-ripple::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        animation: ripple 1.5s ease-out infinite; /* Keep faster duration */
        background-size: 200% 100%; /* Restore original background size */
        background-position: center;
        pointer-events: none;
        z-index: 3;
      }

      .progress-bar-fill.animate-wave::before {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background: white; /* whatever wave color you want */
        animation: wave 3s ease-in-out infinite;
        clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        will-change: clip-path;
      }

      .progress-bar-fill.animate-traffic::before {
        content: '';
        position: absolute;
        inset: 0px;
        background-image: repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 5px,
          rgba(255, 255, 255, 0.3) 10px,
          rgba(255, 255, 255, 0.3) 15px
        );
        background-size: 30px 100%;
        animation: traffic 0.5s linear infinite;
        will-change: background-position;
        pointer-events: none;
        z-index: 3;
      }

      .progress-bar-fill.animate-heartbeat {
        animation: heartbeat 1.5s ease-in-out infinite;
        transform-origin: center;
      }

      .progress-bar-fill.animate-slide-in {
        animation: slide-in 0.8s ease-out;
        animation-fill-mode: both;
      }

      .progress-bar-fill.animate-flicker {
        animation: flicker 3s linear infinite;
      }

      .progress-bar-fill.animate-progress-spinner::before {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: progress-spinner 1s linear infinite;
        z-index: 3;
      }

      .progress-bar-fill.animate-shimmer {
        animation: shimmer 2.5s ease-in-out infinite;
        position: relative;
      }

      .progress-bar-fill.animate-shimmer::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
        transform: skewX(-25deg);
        animation: shimmer 2.5s ease-in-out infinite;
      }

      .progress-bar-fill.animate-vibrate {
        animation: vibrate 0.5s linear infinite;
      }

      /* Bubble animation */
      @keyframes bubble-float {
        0% {
          transform: translateY(100%) scale(0.8);
          opacity: 0.6;
        }
        100% {
          transform: translateY(-100%) scale(1.2);
          opacity: 0;
        }
      }

      .progress-bar-fill.animate-bubbles {
        position: relative;
        overflow: hidden;
      }

      .progress-bar-fill.animate-bubbles::before,
      .progress-bar-fill.animate-bubbles::after,
      .progress-bar-fill.animate-bubbles span::before,
      .progress-bar-fill.animate-bubbles span::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        animation: bubble-float 2.5s infinite linear;
      }

      .progress-bar-fill.animate-bubbles::before {
        width: 15px;
        height: 15px;
        left: 10%;
        animation-delay: 0s;
      }

      .progress-bar-fill.animate-bubbles::after {
        width: 12px;
        height: 12px;
        left: 40%;
        animation-delay: 0.5s;
      }

      .progress-bar-fill.animate-bubbles span {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .progress-bar-fill.animate-bubbles span::before {
        width: 8px;
        height: 8px;
        left: 60%;
        animation-delay: 1s;
      }

      .progress-bar-fill.animate-bubbles span::after {
        width: 10px;
        height: 10px;
        left: 80%;
        animation-delay: 1.5s;
      }

      /* Limit indicator */
      .limit-indicator {
        position: absolute;
        top: 0;
        height: 100%;
        width: 2px;
        background-color: #ff0000;
        z-index: 3; /* Reduced from 10 to stay below dialog-z-index (8) but above bar elements */
      }

      .bar-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        width: 100%;
      }

      .bar-label {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2px; /* Reduced from 10px to create tighter grouping */
        cursor: pointer;
        padding: 4px 0; /* Keep vertical padding */
      }

      .bar-label.left {
        justify-content: flex-start;
        padding-right: 8px;
      }

      .bar-label.right {
        justify-content: flex-end;
        padding-left: 8px;
      }

      .label-title {
        font-size: 0.85em;
        opacity: 0.9;
        color: var(--secondary-text-color);
        padding-right: 0; /* Remove padding, we'll use gap */
      }

      .label-value {
        font-size: 1em;
        font-weight: 500;
        color: var(--secondary-text-color);
        padding-left: 0; /* Remove padding, we'll use gap */
      }

      .label-separator {
        color: var(--secondary-text-color);
        opacity: 0.8;
        margin: 0; /* Remove margin, rely on parent gap */
      }

      /* Layout styles */
      .content {
        display: flex;
        flex-direction: column;
        padding: 16px 0;
        width: 100%;
      }

      .content.single {
        /* Single column layout - default */
      }

      .content.double {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .content.double > * {
        width: 50%;
        box-sizing: border-box;
        padding: 0 8px;
        padding-right: 16px;
      }

      /* Add style for pending state if needed */
      .icon-container.pending-state {
        /* Optional: slightly dim or add other visual cue while pending */
        /* opacity: 0.8; */
      }

      /* Style for icons awaiting confirmation click */
      .icon-container.awaiting-confirmation {
        animation: pulse 1.5s infinite;
        box-shadow: 0 0 0 2px var(--primary-color);
        border-radius: 8px;
      }

      /* Add style for the percentage text */
      .percentage-text {
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: 500;
        text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.8);
        padding: 0 2px;
        user-select: none;
        white-space: nowrap;
      }

      /* Dashboard-specific icon styling */
      .dashboard-icon-row {
        margin-bottom: 8px;
      }

      /* Optimize icon display in side sections */
      .left-middle-section .icon-container,
      .right-middle-section .icon-container {
        padding: 6px 8px;
        border-radius: 8px;
        align-items: center !important;
      }

      /* Optimize icon spacing for vertical layout */
      .left-middle-section .icon-container[style*='flex-direction: column'],
      .right-middle-section .icon-container[style*='flex-direction: column'] {
        gap: 4px !important;
      }

      /* Adjust icon size in side sections - make text smaller */
      .left-middle-section .icon-label,
      .right-middle-section .icon-label,
      .left-middle-section .icon-state,
      .right-middle-section .icon-state {
        font-size: 0.8em;
      }

      /* Set hover effect for dashboard icons */
      .left-middle-section .icon-container:hover,
      .right-middle-section .icon-container:hover {
        background-color: rgba(var(--rgb-primary-color), 0.15);
      }

      /* Animation classes fix to follow border radius */
      .progress-bar-fill.animate-charging-lines::before,
      .progress-bar-fill.animate-rainbow::before,
      .progress-bar-fill.animate-ripple::before,
      .progress-bar-fill.animate-wave::before,
      .progress-bar-fill.animate-traffic::before,
      .progress-bar-fill.animate-glow::after,
      .progress-bar-fill.animate-bubbles::before,
      .progress-bar-fill.animate-bubbles::after,
      .progress-bar-fill.animate-bubbles span::before,
      .progress-bar-fill.animate-bubbles span::after,
      .progress-bar-fill.animate-progress-spinner::before,
      .progress-bar-fill.animate-shimmer::before {
        border-radius: inherit;
        overflow: hidden;
      }

      /* NEW: Section Break Styles */
      .section-break {
        /* width is controlled inline by style attribute */
        /* Center the break horizontally using transform */
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        /* Add padding matching the negative margin to keep *internal* content aligned (if break has content, e.g., text later) */
        /* padding-left: var(--card-padding, 16px); */ /* Commented out for now as breaks are visual only */
        /* padding-right: var(--card-padding, 16px); */
        box-sizing: border-box;
        z-index: 2;

        border-top-style: solid;
        border-top-color: var(--break-color, var(--divider-color));
        border-top-width: var(--break-thickness, 1px); /* UPDATED variable */
      }

      .section-break.break-style-line {
        border-top-style: solid;
        border-top-color: var(--break-color, var(--divider-color));
        border-top-width: var(--break-thickness, 1px); /* UPDATED variable */
      }

      .section-break.break-style-double_line {
        border-top-style: double;
        border-top-color: var(--break-color, var(--divider-color));
        /* Double line needs more width */
        border-top-width: calc(var(--break-thickness, 1px) * 3); /* UPDATED variable */
      }

      .section-break.break-style-dotted {
        border-top-style: dotted;
        border-top-color: var(--break-color, var(--divider-color));
        border-top-width: var(--break-thickness, 1px); /* UPDATED variable */
      }

      .section-break.break-style-double_dotted {
        /* Simulate double dotted with pseudo-element */
        border-top: none;
        height: calc(var(--break-thickness, 1px) * 2 + 2px); /* UPDATED variable */
      }
      .section-break.break-style-double_dotted::before,
      .section-break.break-style-double_dotted::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: var(--break-thickness, 1px); /* UPDATED variable */
        background-image: linear-gradient(
          to right,
          var(--break-color, var(--divider-color)) 60%,
          transparent 0%
        );
        background-size: 6px var(--break-thickness, 1px); /* UPDATED variable */
        background-repeat: repeat-x;
      }
      .section-break.break-style-double_dotted::before {
        top: 0;
      }
      .section-break.break-style-double_dotted::after {
        bottom: 0;
      }

      .section-break.break-style-shadow {
        border-top: none;
        height: calc(var(--break-thickness, 1px) * 2); /* UPDATED variable */
        background: linear-gradient(to bottom, var(--break-color, rgba(0, 0, 0, 0.1)), transparent);
      }

      /* ... other cropper styles ... */

      /* NEW: Info Rows Styling */
      .info-rows-container {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Space between rows */
        width: 100%;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
        margin-top: 8px;
        margin-bottom: 8px;
      }

      /* Info row styles are handled inline */

      .info-row-item {
        /* Styles for individual rows are applied inline via _renderSingleInfoRow */
        /* This class is mostly for targeting if needed */
      }

      .info-entity-item {
        /* Styles for individual entities are applied inline via _renderSingleInfoEntity */
        /* This class is for targeting and ensuring consistent behavior if needed */
        line-height: 1.4; /* Improve readability */
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 8px;
        min-width: 0;
      }

      .info-entity-item ha-icon {
        margin-right: 8px;
      }

      .info-entity-item > div {
        min-width: 0;
        overflow: hidden;
      }

      /* NEW LAYOUT STYLES */
      .half-full-layout,
      .full-half-layout {
        display: flex;
        flex-direction: column;
      }

      .half-full-layout .half-full-row1,
      .full-half-layout .full-half-row2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .half-full-layout .half-full-row2,
      .full-half-layout .full-half-row1 {
        /* These rows will take full width by default as direct children of a flex column */
      }

      /* Ensure columns within these layouts behave correctly */
      .half-full-layout .column,
      .full-half-layout .column {
        display: flex;
        flex-direction: column;
        gap: 0; /* Explicitly remove gap for these layouts */
        min-width: 0; /* Prevent overflow */
      }

      .section-title {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .image-container {
        text-align: center;
        position: relative;
        overflow: hidden; /* Ensures image respects border radius if any */
      }

      .vehicle-image {
        max-width: 100%;
        height: auto;
        object-fit: contain;
        border-radius: var(--ha-card-border-radius, 4px);
        transition: transform 0.3s ease-in-out;
      }

      .image-placeholder {
        width: 100%;
        height: 200px; /* Default placeholder height */
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--divider-color);
        color: var(--secondary-text-color);
        border-radius: var(--ha-card-border-radius, 4px);
      }
      /* Old .bars-container, can be removed if no longer used by legacy or other parts */
      /* For now, let's assume it might be used by legacy 'bars' section, adjust if confirmed not needed */
      .bars-container {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Spacing between individual bars if not in rows */
      }

      /* New styles for row-based bar layout */
      .bars-rows-container {
        display: flex;
        flex-direction: column; /* Each .bar-row will be a new line */
        gap: var(--uvc-bar-spacing, 8px); /* Vertical spacing between rows of bars */
        width: 100%; /* Ensure it takes full available width */
      }
      .bar-row {
        display: flex;
        flex-direction: row; /* Bars within a row are horizontal */
        align-items: stretch; /* Make bars in a row same height if desired, or flex-start */
        gap: var(--uvc-bar-spacing, 8px); /* Horizontal spacing between bars in a row */
        width: 100%; /* Ensure it takes full available width */
        /* justify-content is now set dynamically */
      }
      .bar-wrapper {
        /* border: 1px dashed green; */ /* Debugging */
        box-sizing: border-box; /* Important for width + padding */
        display: flex; /* To allow the inner bar to fill this wrapper */
        flex-direction: column; /* Bar itself is a column */
        justify-content: center; /* Vertically center the bar within the wrapper */
      }
      /* Ensure the user-identified 'progress-bar-wrapper' fills the .bar-wrapper */
      .bar-wrapper > .progress-bar-wrapper {
        width: 100% !important; /* Override incorrect inline fractional widths */
        box-sizing: border-box;
      }
      /* Individual bar styling, including animations, colors, etc. */
      .bar {
        position: relative;
        height: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        overflow: hidden;
        width: 100%;
      }

      /* Icon Animation Keyframes for state-based animations */
      @keyframes pulse-icon {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes vibrate-icon {
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

      @keyframes rotate-left-icon {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotate-right-icon {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes hover-icon {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      @keyframes fade-icon {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }

      @keyframes scale-icon {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(0.8);
        }
      }

      @keyframes bounce-icon {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-8px);
        }
        60% {
          transform: translateY(-4px);
        }
      }

      @keyframes shake-icon {
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

      @keyframes tada-icon {
        0% {
          transform: scale(1) rotate(0deg);
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
          transform: scale(1) rotate(0deg);
        }
      }

      /* Animation classes for icons */
      .icon-container ha-icon.animate-pulse {
        animation: pulse-icon 2s ease infinite;
      }

      .icon-container ha-icon.animate-vibrate {
        animation: vibrate-icon 0.5s linear infinite;
      }

      .icon-container ha-icon.animate-rotate-left {
        animation: rotate-left-icon 2s linear infinite;
      }

      .icon-container ha-icon.animate-rotate-right {
        animation: rotate-right-icon 2s linear infinite;
      }

      .icon-container ha-icon.animate-hover {
        animation: hover-icon 2s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-fade {
        animation: fade-icon 2s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-scale {
        animation: scale-icon 2s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-bounce {
        animation: bounce-icon 2s ease infinite;
      }

      .icon-container ha-icon.animate-shake {
        animation: shake-icon 0.8s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-tada {
        animation: tada-icon 2s ease infinite;
      }
    `;
  }

  setConfig(config: UltraVehicleCardConfig) {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    const previousConfig = this.config;

    // Clear cached icon states when config changes significantly
    if (JSON.stringify(previousConfig?.icon_rows) !== JSON.stringify(config?.icon_rows)) {
      this._iconActiveStates.clear();
    }

    // Define default values
    const defaultConfig: Partial<UltraVehicleCardConfig> = {
      show_units: true,
      formatted_entities: true,
      show_location: true, // Keep consistent with editor defaults
      show_mileage: true, // Keep consistent with editor defaults
      show_car_state: true, // Keep consistent with editor defaults
      show_info_icons: true, // Keep consistent with editor defaults
      vehicle_image_width: 100, // Add default width here too
      // Add other necessary defaults if they are not handled elsewhere reliably
    };

    // Ensure width values are proper numbers *before* merging
    let processedConfig = { ...config };
    if (processedConfig.vehicle_image_width !== undefined) {
      processedConfig = {
        ...processedConfig,
        vehicle_image_width: Number(processedConfig.vehicle_image_width),
      };
    } else {
      // Ensure width gets the default if undefined in user config
      processedConfig.vehicle_image_width = defaultConfig.vehicle_image_width;
    }

    // Update the configuration object by merging defaults with user config
    this.config = {
      ...defaultConfig,
      ...processedConfig, // User config overrides defaults
    };

    // Migration: Convert 'bars' into individual 'bar_X' entries if needed
    this._migrateBarsToIndividual();

    // Clean up duplicate info sections
    this._cleanupInfoSections();

    // Update template service if needed
    if (this._templateService && this.hass) {
      this._templateService.updateHass(this.hass);
    }

    // Force an update timestamp to ensure animations and gradients refresh
    this._lastRenderTime = Date.now();

    // Force a full re-render after config changes
    this.requestUpdate();

    // Check if we need to force a more aggressive refresh for gradients and animations
    if (previousConfig) {
      const needsForceRefresh = this._checkForGradientOrAnimationChanges(
        previousConfig,
        this.config
      );
      if (needsForceRefresh) {
        this._forceFullRender();
      }
    }
  }

  // Migrate from 'bars' to individual 'bar_X' entries for better control
  private _migrateBarsToIndividual(): void {
    if (!this.config?.sections_order || !this.config.bars?.length) {
      return;
    }

    let sectionsOrder = [...this.config.sections_order];
    let changed = false;

    // Check if 'bars' exists in sections_order
    const barsIndex = sectionsOrder.indexOf('bars');

    // Find all existing individual bar entries
    const individualBarEntries = sectionsOrder.filter(section => section.startsWith('bar_'));

    // NEW: Check for and remove duplicate bar entries
    if (individualBarEntries.length > 0) {
      const uniqueBarIds = new Set<string>();
      const duplicatesExist = individualBarEntries.some(entry => {
        if (uniqueBarIds.has(entry)) {
          return true; // Found a duplicate
        }
        uniqueBarIds.add(entry);
        return false;
      });

      if (duplicatesExist) {
        // Remove all bar entries first
        sectionsOrder = sectionsOrder.filter(section => !section.startsWith('bar_'));
        // Will re-add them correctly below
        changed = true;
      }
    }

    // First case: 'bars' collective entry exists - replace it with individual entries
    if (barsIndex !== -1) {
      // Check if any individual bar_X entries already exist
      const hasIndividualBars = individualBarEntries.length > 0;

      // Only convert if there are no existing bar_X entries
      if (!hasIndividualBars) {
        // Create individual bar_X entries for each bar
        const individualBars = this.config.bars.map((_, index) => `bar_${index}`);

        // Replace 'bars' with the individual entries
        sectionsOrder.splice(barsIndex, 1, ...individualBars);
        changed = true;
      } else {
        // NEW: If both 'bars' and individual entries exist, remove 'bars'
        // and ensure all bars are represented
        sectionsOrder.splice(barsIndex, 1);

        // Find existing bar indices
        const existingIndices = individualBarEntries
          .map(entry => parseInt(entry.substring(4)))
          .filter(index => !isNaN(index));

        // Find position of last bar entry
        const lastBarPos = Math.max(
          ...individualBarEntries
            .map(entry => sectionsOrder.indexOf(entry))
            .filter(pos => pos !== -1),
          -1
        );

        // Check for missing bars
        const missingBars = [];
        for (let i = 0; i < this.config.bars.length; i++) {
          if (!existingIndices.includes(i)) {
            missingBars.push(`bar_${i}`);
          }
        }

        // Add missing bars after last existing bar
        if (missingBars.length > 0 && lastBarPos !== -1) {
          sectionsOrder.splice(lastBarPos + 1, 0, ...missingBars);
          changed = true;
        }
      }
    }
    // Second case: No 'bars' entry, but we have some bar_X entries and are missing others
    else if (
      individualBarEntries.length > 0 &&
      individualBarEntries.length < this.config.bars.length
    ) {
      // Find the highest bar index in existing entries
      const existingIndices = individualBarEntries
        .map(entry => parseInt(entry.substring(4)))
        .filter(index => !isNaN(index))
        .sort((a, b) => a - b);

      // Find the last bar entry position
      const lastBarIndex = sectionsOrder.findIndex(
        section => section === `bar_${existingIndices[existingIndices.length - 1]}`
      );

      // Create entries for missing bars
      const missingBars = [];
      for (let i = 0; i < this.config.bars.length; i++) {
        if (!existingIndices.includes(i)) {
          missingBars.push(`bar_${i}`);
        }
      }

      // Add missing entries after the last existing bar entry
      if (missingBars.length > 0 && lastBarIndex !== -1) {
        sectionsOrder.splice(lastBarIndex + 1, 0, ...missingBars);
        changed = true;
      }
    }
    // NEW: Third case - check for complete mismatch (number of bar_X entries doesn't match bars.length)
    else if (
      individualBarEntries.length > 0 &&
      individualBarEntries.length !== this.config.bars.length
    ) {
      // Remove all bar entries
      sectionsOrder = sectionsOrder.filter(section => !section.startsWith('bar_'));

      // Add correct entries in a logical position
      const newBarEntries = this.config.bars.map((_, idx) => `bar_${idx}`);

      // Try to position them logically
      if (sectionsOrder.includes('info')) {
        const infoIndex = sectionsOrder.indexOf('info');
        sectionsOrder.splice(infoIndex + 1, 0, ...newBarEntries);
      } else if (sectionsOrder.includes('image')) {
        const imageIndex = sectionsOrder.indexOf('image');
        sectionsOrder.splice(imageIndex + 1, 0, ...newBarEntries);
      } else {
        // Append to the end
        sectionsOrder.push(...newBarEntries);
      }

      changed = true;
    }

    // Update the config if changes were made
    if (changed) {
      this.config = {
        ...this.config,
        sections_order: sectionsOrder,
      };

      // Save the changes to YAML by dispatching a config-changed event
      this._saveConfigChanges();
    }
  }

  // Add this after the _migrateBarsToIndividual method
  private _cleanupInfoSections(): void {
    if (!this.config?.sections_order || !this.config.info_rows?.length) {
      return;
    }

    const sectionsOrder = [...this.config.sections_order];
    const infoIndex = sectionsOrder.indexOf('info');
    const hasIndividualInfoRows = sectionsOrder.some(section => section.startsWith('info_row_'));

    // If we have both the collective 'info' and individual 'info_row_X' entries,
    // remove the collective entry to avoid duplication
    if (infoIndex !== -1 && hasIndividualInfoRows) {
      sectionsOrder.splice(infoIndex, 1);

      this.config = {
        ...this.config,
        sections_order: sectionsOrder,
      };

      // Save the changes
      this._saveConfigChanges();
    }
  }

  // Helper method to save config changes to YAML
  private _saveConfigChanges() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    // Remove console.info about saving migrated config
    this.dispatchEvent(event);
  }

  // Add a method to detect changes in gradient or animation settings
  private _checkForGradientOrAnimationChanges(
    oldConfig: UltraVehicleCardConfig,
    newConfig: UltraVehicleCardConfig
  ): boolean {
    // Check if bars changed
    if (!oldConfig.bars || !newConfig.bars) return true;

    // Check each bar for animation or gradient changes
    for (let i = 0; i < Math.max(oldConfig.bars.length, newConfig.bars.length); i++) {
      const oldBar = oldConfig.bars[i];
      const newBar = newConfig.bars[i];

      if (!oldBar || !newBar) return true;

      // Check gradient settings
      if (oldBar.use_gradient !== newBar.use_gradient) return true;
      if (oldBar.gradient_display_mode !== newBar.gradient_display_mode) return true;

      // Check if limit indicator settings changed
      if (oldBar.limit_entity !== newBar.limit_entity) {
        return true;
      }
      if (oldBar.limit_indicator_color !== newBar.limit_indicator_color) {
        return true;
      }

      // Check if gradient stops changed
      if (JSON.stringify(oldBar.gradient_stops) !== JSON.stringify(newBar.gradient_stops))
        return true;

      // Check animation settings
      if (oldBar.animation_type !== newBar.animation_type) return true;
      if (oldBar.animation_entity !== newBar.animation_entity) return true;
      if (oldBar.animation_state !== newBar.animation_state) return true;
      if (oldBar.action_animation !== newBar.action_animation) return true;
      if (oldBar.action_animation_entity !== newBar.action_animation_entity) return true;
      if (oldBar.action_animation_state !== newBar.action_animation_state) return true;
    }

    return false;
  }

  // Enhanced method to force a complete re-render with multiple refresh attempts
  private _forceFullRender(): void {
    // Set a single refresh timestamp
    this._lastRenderTime = Date.now();

    // First, request an immediate update
    this.requestUpdate();

    // Then perform a single delayed update instead of multiple phases
    setTimeout(() => {
      if (this.shadowRoot) {
        // Select all progress bars
        const bars = this.shadowRoot.querySelectorAll('.progress-bar-fill');

        // Apply forced reflow to each bar element
        bars.forEach(bar => {
          if (bar instanceof HTMLElement) {
            // Force a single reflow by accessing offsetHeight
            const forceReflow = bar.offsetHeight;

            // Apply any gradient-specific styling directly
            const hasGradient = bar.getAttribute('has-gradient');
            const mode = bar.getAttribute('data-mode');

            if (hasGradient === 'true') {
              if (mode === 'full') {
                bar.style.backgroundSize = '100% 100%';
                bar.style.backgroundPosition = '0% 0%';
              } else if (mode === 'value_based') {
                // Ensure value-based mode gradient styling is correct
                const width = bar.style.width;
                bar.style.backgroundSize = `${width} 100%`;
              }
            }

            // Mark as refreshed with single timestamp
            bar.setAttribute('data-refreshed', String(this._lastRenderTime));
          }
        });
      }
    }, 50);
  }

  protected render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    // Default section order if not set - use individual bar_X entries instead of 'bars'
    const defaultSections = ['title', 'image', 'info', 'bar_0', 'icons'];
    // Add any configured bars as individual sections
    const barSections = this.config.bars?.map((_, i) => `bar_${i}`) || [];

    // Use user-configured sections_order, or our default with individual bar references
    const sections = this.config.sections_order || [...defaultSections, ...barSections];

    const layoutType = this.config.layout_type || 'single';
    const columns = this.config.sections_columns || {};
    const sectionStyles = this.config.section_styles || {}; // Get section styles

    // Filter out hidden sections
    const hiddenSections = this.config.hidden_sections || [];
    const visibleSections = sections.filter(section => !hiddenSections.includes(section));

    // NEW: Helper function to render a block of sections
    const renderSectionsBlock = (sectionsToRender: string[]) => {
      // Logging: Show the sections being processed by this block
      // REMOVED console.log(
      //   `[UVC RenderBlock] Processing sections:`,
      //   JSON.stringify(sectionsToRender)
      // );

      const renderedContent: any[] = [];
      const sectionStyles = this.config.section_styles || {}; // Get section styles
      const sectionBreaks = this.config.section_breaks || []; // Get breaks config

      // Check if we have any individual info rows in the sections array
      const hasIndividualInfoRows = sectionsToRender.some(s => s.startsWith('info_row_'));

      // *** CHANGE: Use a standard for loop for better control over index `i` ***
      for (let i = 0; i < sectionsToRender.length /* No increment here */; ) {
        const section = sectionsToRender[i];
        let advancedIndex = false; // Flag to check if inner loops advance 'i'

        // Top-level check for the current section ID.
        if (!this._shouldRenderSection(section)) {
          i++; // Move to next section if current one is hidden
          continue;
        }

        // Skip the collective 'info' section if we have individual info rows
        if (section === 'info' && hasIndividualInfoRows) {
          i++; // Move to next section
          continue;
        }

        const styles = sectionStyles[section] || {};
        let sectionStyle = '';
        if (styles.marginTop) sectionStyle += `margin-top: ${styles.marginTop}px;`;
        if (styles.marginBottom) sectionStyle += ` margin-bottom: ${styles.marginBottom}px;`;
        sectionStyle = sectionStyle.trim();

        // --- Special Handling for Bars ---
        if (section.startsWith('bar_')) {
          // Group bars into rows based on width
          const barRows: Array<Array<{ index: number; config: BarConfig }>> = [];
          let currentRow: Array<{ index: number; config: BarConfig }> = [];
          let currentRowWidth = 0;

          // Loop starting from the current 'bar_X' section
          // Collect all consecutive, renderable bar_X sections first
          const consecutiveBarIndicesToProcess: number[] = [];
          let tempIndex = i;
          while (
            tempIndex < sectionsToRender.length &&
            sectionsToRender[tempIndex].startsWith('bar_')
          ) {
            const currentBarSectionId = sectionsToRender[tempIndex];
            const barIndexFromId = parseInt(currentBarSectionId.substring(4));
            if (
              this._shouldRenderSection(currentBarSectionId) &&
              this.config.bars?.[barIndexFromId]
            ) {
              consecutiveBarIndicesToProcess.push(barIndexFromId);
            }
            tempIndex++;
          }

          // Now, iterate over the collected bars to form rows
          for (const barIndex of consecutiveBarIndicesToProcess) {
            const barConfig = this.config.bars![barIndex];
            const barWidthPercentage = parseInt(barConfig.width || '100');

            if (currentRowWidth + barWidthPercentage > 100 && currentRow.length > 0) {
              barRows.push(currentRow);
              currentRow = [];
              currentRowWidth = 0;
            }
            currentRow.push({ index: barIndex, config: barConfig });
            currentRowWidth += barWidthPercentage;
          }

          // Add the last collected row
          if (currentRow.length > 0) {
            barRows.push(currentRow);
          }

          // Advance the main loop index 'i' past all processed bar sections
          i +=
            consecutiveBarIndicesToProcess.length > 0 ? consecutiveBarIndicesToProcess.length : 1;
          if (consecutiveBarIndicesToProcess.length > 0) advancedIndex = true;

          if (barRows.length > 0) {
            renderedContent.push(
              html`<div class="bars-rows-container">
                ${barRows.map(row => {
                  // Determine justify-content for the current row
                  const rowAlignment = this.config.bar_row_alignment || 'center'; // Default to center
                  const justifyContentStyle = `justify-content: ${rowAlignment};`;

                  return html`
                    <div class="bar-row" style="${justifyContentStyle}">
                      ${row.map(barItem => {
                        const barSectionId = `bar_${barItem.index}`;
                        const barSpecificStyles = this.config.section_styles?.[barSectionId] || {};
                        let barWrapperStyle = '';
                        if (barSpecificStyles.marginTop)
                          barWrapperStyle += `margin-top: ${barSpecificStyles.marginTop}px; `;
                        if (barSpecificStyles.marginBottom)
                          barWrapperStyle += `margin-bottom: ${barSpecificStyles.marginBottom}px; `;

                        const configuredWidth = barItem.config.width || '100';
                        barWrapperStyle += `flex-basis: ${configuredWidth}%; `;
                        barWrapperStyle += `width: ${configuredWidth}%; `;
                        barWrapperStyle += `flex-shrink: 0; `;

                        return html`
                          <div class="bar-wrapper" style="${barWrapperStyle.trim()}">
                            ${this._renderBar(barItem.config)}
                          </div>
                        `;
                      })}
                    </div>
                  `;
                })}
              </div>`
            );
          }
        }
        // --- Handle Legacy 'bars' Section Separately (if it exists and migration failed/not run) ---
        else if (section === 'bars') {
          // This section should ideally not be reached if migration is working,
          // but handle it defensively.
          // console.log(`[UVC RenderLoop] Handling legacy 'bars' section.`);
          const legacyBarsIndices: number[] = [];
          let legacyContainerStyle = sectionStyle; // Use the style defined for 'bars' itself

          if (this._shouldRenderSection('bars') && this.config.bars) {
            this.config.bars.forEach((bar, index) => {
              const individualBarId = `bar_${index}`;
              const shouldShowIndividual = this._shouldRenderSection(individualBarId);
              // console.log(`[UVC RenderLoop] Legacy 'bars' check: ${individualBarId}. Should show? ${shouldShowIndividual}`);
              if (shouldShowIndividual) {
                // console.log(`[UVC RenderLoop] Legacy 'bars' loop: Pushing index ${index}`);
                legacyBarsIndices.push(index);
              }
            });
          }
          // console.log(`[UVC RenderLoop] Final indices collected for legacy 'bars' block: [${legacyBarsIndices.join(', ')}]`);
          if (legacyBarsIndices.length > 0) {
            // console.log(`[UVC RenderBlock] Rendering legacy bars-container for indices: [${legacyBarsIndices.join(', ')}]`);
            renderedContent.push(
              html`<div class="bars-container" style="${legacyContainerStyle}">
                ${legacyBarsIndices.map(index => {
                  const barSection = `bar_${index}`;
                  const barStyles = sectionStyles[barSection] || {};
                  let barStyleStr = '';
                  if (barStyles.marginTop) barStyleStr += `margin-top: ${barStyles.marginTop}px;`;
                  if (barStyles.marginBottom)
                    barStyleStr += `margin-bottom: ${barStyles.marginBottom}px;`;

                  return html`
                    <div class="bar-wrapper" style="${barStyleStr}">
                      ${this._renderBar(this.config.bars![index])}
                    </div>
                  `;
                })}
              </div>`
            );
          }
          i++; // Advance index after handling legacy 'bars'
          advancedIndex = true;
        }
        // --- NEW: Handle Section Breaks ---
        else if (section.startsWith('break_')) {
          const breakConfig = sectionBreaks.find(b => b.id === section);
          if (breakConfig) {
            const breakStyle = breakConfig.break_style || 'blank';
            if (breakStyle !== 'blank') {
              // Only render if not blank
              const breakThickness = breakConfig.break_thickness || 1;
              const breakWidthPercent = breakConfig.break_width_percent || 100;
              const breakColor = breakConfig.break_color || 'var(--divider-color)';
              renderedContent.push(html`
                <div
                  class="section-break break-style-${breakStyle}"
                  style="--break-thickness: ${breakThickness}px; --break-color: ${breakColor}; width: ${breakWidthPercent}%; ${sectionStyle}"
                ></div>
              `);
            }
          } else {
            console.warn(
              `[UltraVehicleCard] Render: Could not find config for break ID: ${section}`
            );
          }
        }
        // --- Handle Non-Bar Sections ---
        else {
          // Top-level condition check already done above
          switch (section) {
            case 'title':
              const titleSize = this.config.title_size || 24;
              renderedContent.push(
                this.config.title
                  ? html`<h1
                      class="card-title ${this.config.title_alignment || 'center'}"
                      style="font-size: ${titleSize}px !important; line-height: 1.2;
                           ${this.config.title_color ? `color: ${this.config.title_color};` : ''}
                           ${sectionStyle}"
                    >
                      ${this.config.title}
                    </h1>`
                  : html``
              );
              break;
            case 'image':
              renderedContent.push(this._renderImage(sectionStyle));
              break;
            case 'info':
              // We already checked if we have individual info rows at the top
              // and skipped the rendering if needed
              renderedContent.push(this._renderVehicleInfo(sectionStyle));
              break;
            case 'icons':
              // Keep the group check for icons unless requested otherwise
              if (this._shouldRenderSection('icons')) {
                renderedContent.push(this._renderIconRows(sectionStyle));
              }
              break;
            // Handle individual icon row sections
            default:
              if (section.startsWith('icon_row_')) {
                // Keep group check for icons
                const rowId = section.substring(9);
                // Also check individual icon_row condition (redundant if group check fails)
                if (this._shouldRenderSection(section)) {
                  const iconRow = this.config.icon_rows?.find(row => row.id === rowId);
                  if (iconRow) {
                    renderedContent.push(
                      html`<div class="icon-rows-container" style="${sectionStyle}">
                        ${this._renderIconRow(iconRow)}
                      </div>`
                    );
                  }
                }
              } else if (section.startsWith('info_row_')) {
                // Handle individual info rows
                const rowId = section.substring(9);
                // Check condition for this specific info row
                if (this._shouldRenderSection(section)) {
                  const infoRow = this.config.info_rows?.find(row => row.id === rowId);
                  if (infoRow) {
                    renderedContent.push(
                      html`<div class="info-rows-container" style="${sectionStyle}">
                        ${this._renderSingleInfoRow(infoRow)}
                      </div>`
                    );
                  }
                }
              }
              break;
          }
        }

        // *** CHANGE: Only increment 'i' if it wasn't advanced by an inner loop ***
        if (!advancedIndex) {
          i++;
        }
      }
      return renderedContent;
    };

    // For two-column layout
    if (layoutType === 'double') {
      const leftSections = visibleSections.filter(section => columns[section] !== 'right');
      const rightSections = visibleSections.filter(section => columns[section] === 'right');
      const columnWidthClass = this.config.column_width
        ? `columns-${this.config.column_width}`
        : 'columns-50-50';

      return html`
        <ha-card>
          ${this.config['global_css']
            ? html`<style>
                :host { ${this.config['global_css']} }
              </style>`
            : ''}
          <div
            class="card-content two-column-layout ${columnWidthClass}"
            style="${this.config.card_background
              ? `background-color: ${this.config.card_background};`
              : ''}"
          >
            <div class="column left-column">${renderSectionsBlock(leftSections)}</div>
            <div class="column right-column">${renderSectionsBlock(rightSections)}</div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `;
    }

    // For dashboard layout
    if (layoutType === 'dashboard') {
      // Filter sections for each position
      const topSections = visibleSections.filter(section => columns[section] === 'top');
      const topMiddleSections = visibleSections.filter(
        section => columns[section] === 'top_middle'
      );
      const leftMiddleSections = visibleSections.filter(
        section => columns[section] === 'left_middle'
      );
      const middleSections = visibleSections.filter(section => columns[section] === 'middle');
      const rightMiddleSections = visibleSections.filter(
        section => columns[section] === 'right_middle'
      );
      const bottomMiddleSections = visibleSections.filter(
        section => columns[section] === 'bottom_middle'
      );
      const bottomSections = visibleSections.filter(section => columns[section] === 'bottom');

      // Sections that aren't assigned to any position go to top
      const defaultSections = visibleSections.filter(
        section =>
          !columns[section] ||
          ![
            'top',
            'top_middle',
            'left_middle',
            'middle',
            'right_middle',
            'bottom_middle',
            'bottom',
          ].includes(columns[section])
      );

      // Combine default sections with top sections
      const allTopSections = [...defaultSections, ...topSections];

      // Check if image section is explicitly placed in middle
      const imageInMiddle = middleSections.includes('image');

      // If image is in middle sections, remove it from its original location
      let renderSections = visibleSections;
      if (imageInMiddle) {
        renderSections = visibleSections.filter(section => section !== 'image');
      }

      // Get spacing settings with defaults
      const sideMargin =
        this.config.top_view_side_margin !== undefined ? this.config.top_view_side_margin : 0;
      const middleSpacing =
        this.config.top_view_middle_spacing !== undefined
          ? this.config.top_view_middle_spacing
          : 16;
      const verticalSpacing =
        this.config.top_view_vertical_spacing !== undefined
          ? this.config.top_view_vertical_spacing
          : 16;

      // Calculate styles based on spacing settings
      const dashboardStyle =
        sideMargin > 0 ? `padding-left: ${sideMargin}px; padding-right: ${sideMargin}px;` : '';
      const middleRowStyle = `gap: ${middleSpacing}px;`;
      const verticalGapStyle = `gap: ${verticalSpacing}px;`;

      return html`
        <ha-card>
          ${this.config['global_css']
            ? html`<style>
                :host { ${this.config['global_css']} }
              </style>`
            : ''}
          <div
            class="card-content dashboard-layout"
            style="${this.config.card_background
              ? `background-color: ${this.config.card_background};`
              : ''} ${dashboardStyle}"
          >
            <!-- Top Section -->
            <div class="dashboard-section top-section">${renderSectionsBlock(allTopSections)}</div>

            <!-- Middle Sections -->
            <div class="dashboard-middle" style="${verticalGapStyle}">
              <div class="dashboard-section top-middle-section">
                ${renderSectionsBlock(topMiddleSections)}
              </div>

              <div class="dashboard-center-row" style="${middleRowStyle}">
                <div class="dashboard-section left-middle-section">
                  ${renderSectionsBlock(leftMiddleSections)}
                </div>

                <!-- Vehicle image in the middle -->
                <div class="dashboard-center-image">
                  ${imageInMiddle
                    ? this._renderImage('', true) // Special centered render for vehicle image
                    : middleSections.length > 0
                      ? renderSectionsBlock(middleSections)
                      : nothing}
                </div>

                <div class="dashboard-section right-middle-section">
                  ${renderSectionsBlock(rightMiddleSections)}
                </div>
              </div>

              <div class="dashboard-section bottom-middle-section">
                ${renderSectionsBlock(bottomMiddleSections)}
              </div>
            </div>

            <!-- Bottom Section -->
            <div class="dashboard-section bottom-section">
              ${renderSectionsBlock(bottomSections)}
            </div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `;
    }

    // For half_full layout
    if (layoutType === 'half_full') {
      const halfFullRow1LeftSections = visibleSections.filter(
        section => columns[section] === 'half_full_row1_left'
      );
      const halfFullRow1RightSections = visibleSections.filter(
        section => columns[section] === 'half_full_row1_right'
      );
      const halfFullRow2FullSections = visibleSections.filter(
        section =>
          columns[section] === 'half_full_row2_full' ||
          (!columns[section] && // Default to this column if not specified
            !halfFullRow1LeftSections.includes(section) &&
            !halfFullRow1RightSections.includes(section))
      );

      return html`
        <ha-card>
          ${this.config['global_css']
            ? html`<style>
                :host { ${this.config['global_css']} }
              </style>`
            : ''}
          <div
            class="card-content half-full-layout"
            style="${this.config.card_background
              ? `background-color: ${this.config.card_background};`
              : ''}"
          >
            <div class="half-full-row1">
              <div class="column hf-r1-left">${renderSectionsBlock(halfFullRow1LeftSections)}</div>
              <div class="column hf-r1-right">
                ${renderSectionsBlock(halfFullRow1RightSections)}
              </div>
            </div>
            <div class="half-full-row2">
              <div class="column hf-r2-full">${renderSectionsBlock(halfFullRow2FullSections)}</div>
            </div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `;
    }

    // For full_half layout
    if (layoutType === 'full_half') {
      const fullHalfRow1FullSections = visibleSections.filter(
        section =>
          columns[section] === 'full_half_row1_full' ||
          (!columns[section] && // Default to this column if not specified
            !visibleSections.filter(s => columns[s] === 'full_half_row2_left').includes(section) &&
            !visibleSections.filter(s => columns[s] === 'full_half_row2_right').includes(section))
      );
      const fullHalfRow2LeftSections = visibleSections.filter(
        section => columns[section] === 'full_half_row2_left'
      );
      const fullHalfRow2RightSections = visibleSections.filter(
        section => columns[section] === 'full_half_row2_right'
      );

      return html`
        <ha-card>
          ${this.config['global_css']
            ? html`<style>
                :host { ${this.config['global_css']} }
              </style>`
            : ''}
          <div
            class="card-content full-half-layout"
            style="${this.config.card_background
              ? `background-color: ${this.config.card_background};`
              : ''}"
          >
            <div class="full-half-row1">
              <div class="column fh-r1-full">${renderSectionsBlock(fullHalfRow1FullSections)}</div>
            </div>
            <div class="full-half-row2">
              <div class="column fh-r2-left">${renderSectionsBlock(fullHalfRow2LeftSections)}</div>
              <div class="column fh-r2-right">
                ${renderSectionsBlock(fullHalfRow2RightSections)}
              </div>
            </div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `;
    }

    // For single column layout
    return html`
      <ha-card>
        ${this.config['global_css']
          ? html`<style>
              :host { ${this.config['global_css']} }
            </style>`
          : ''}
        <div
          class="card-content"
          style="${this.config.card_background
            ? `background-color: ${this.config.card_background};`
            : ''}"
        >
          ${renderSectionsBlock(visibleSections)}
        </div>
        ${this._renderMapPopup()}
      </ha-card>
    `;
  }

  private _renderImage(sectionStyle: string = '', isCentered: boolean = false) {
    let imageUrl = '';
    let imageStyle = '';
    let containerStyle = sectionStyle;
    let useActionImage = false;
    let entityId = '';
    let selectedActionConfig: ActionImageConfig | null = null;

    const priorityMode = this.config.action_image_priority || 'newest';
    if (this.config.action_images && this.config.action_images.length > 0) {
      for (const actionConfig of this.config.action_images) {
        if (actionConfig.template_mode && actionConfig.template) {
          // Template mode: use the template service to evaluate the template
          const templateKey = `action_image_${actionConfig.id}`;
          let templateResult = false;

          // Check if we already have a result for this template
          if (this._templateService && this._templateService.hasTemplateSubscription(templateKey)) {
            templateResult = this._templateService.getTemplateResult(templateKey) ?? false;
          }
          // If no result yet, subscribe to the template
          else if (this._templateService) {
            // Initialize with false and set up subscription for future updates
            this._templateService.subscribeToTemplate(actionConfig.template, templateKey, () => {
              // This will trigger a re-render when the template result changes
              this.requestUpdate();
            });
          }

          // If template evaluates to true, use this action image
          if (templateResult) {
            selectedActionConfig = actionConfig;
            if (priorityMode === 'priority') {
              break;
            }
          }
        } else if (actionConfig.entity && actionConfig.state) {
          const entityState = this.hass.states[actionConfig.entity]?.state;
          if (
            entityState !== undefined &&
            entityState.trim().toLowerCase() === actionConfig.state.trim().toLowerCase()
          ) {
            selectedActionConfig = actionConfig;
            if (priorityMode === 'priority') {
              break;
            }
          }
        }
      }
    }

    if (selectedActionConfig) {
      const actionImageType = selectedActionConfig.image_type;
      let actionImageUrl = '';

      entityId = selectedActionConfig.entity;

      if (actionImageType === 'upload' && selectedActionConfig.image) {
        actionImageUrl = getImageUrl(this.hass, selectedActionConfig.image);
      } else if (actionImageType === 'url') {
        actionImageUrl = selectedActionConfig.image || '';
      } else if (actionImageType === 'entity' && selectedActionConfig.image_entity) {
        const actionEntityId = selectedActionConfig.image_entity;
        entityId = actionEntityId;
        const entity = this.hass.states[actionEntityId];

        if (entity?.attributes?.entity_picture) {
          if (this._entityImageUrls.has(actionEntityId)) {
            actionImageUrl = this._entityImageUrls.get(actionEntityId) || '';
          } else {
            actionImageUrl = entity.attributes.entity_picture;
            if (actionImageUrl.startsWith('/')) {
              const hassUrl = (this.hass as any).hassUrl ? (this.hass as any).hassUrl() : '';
              actionImageUrl = `${hassUrl}${actionImageUrl.startsWith('/') ? actionImageUrl.substring(1) : actionImageUrl}`;
            }
          }
        } else {
          actionImageUrl = entity?.state || '';
        }
      }

      if (actionImageUrl) {
        imageUrl = actionImageUrl;
        imageStyle = this._computeImageStyle(
          selectedActionConfig.image_width,
          selectedActionConfig.image_crop
        );
        useActionImage = true;
      }
    }

    if (!useActionImage) {
      const imageType = this.config.vehicle_image_type;
      const imagePath = this.config.vehicle_image || '';

      if (this.config.location_entity) {
        entityId = this.config.location_entity;
      } else if (this.config.mileage_entity) {
        entityId = this.config.mileage_entity;
      } else if (this.config.car_state_entity) {
        entityId = this.config.car_state_entity;
      }

      if (
        imagePath &&
        (imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('data:'))
      ) {
        // Use the path directly, ensuring it has the /original suffix if it's an API path
        if (imagePath.includes('/api/image/serve/') && !imagePath.endsWith('/original')) {
          imageUrl = `${imagePath}/original`;
        } else {
          imageUrl = imagePath;
        }
      } else if (imageType === 'entity' && this.config.vehicle_image_entity) {
        // Handle entity type image
        const vehicleEntityId = this.config.vehicle_image_entity;
        // Use the image entity for more-info
        entityId = vehicleEntityId;
        const entity = this.hass.states[vehicleEntityId];

        if (entity?.attributes?.entity_picture) {
          // Use cached timestamped URL if available
          if (this._entityImageUrls.has(vehicleEntityId)) {
            imageUrl = this._entityImageUrls.get(vehicleEntityId) || '';
          } else {
            // Use basic URL, ensuring it's absolute
            imageUrl = entity.attributes.entity_picture;
            if (imageUrl.startsWith('/')) {
              const hassUrl = (this.hass as any).hassUrl ? (this.hass as any).hassUrl() : '';
              imageUrl = `${hassUrl}${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
            }
          }
        } else {
          // Check if the state itself is a valid URL or path before assigning
          if (
            entity?.state &&
            (entity.state.startsWith('http') ||
              entity.state.startsWith('/') ||
              entity.state.startsWith('data:'))
          ) {
            imageUrl = entity.state;
          } else {
            imageUrl = ''; // Explicitly clear imageUrl if state is not a URL/path
          }
        }
      } else if (imageType === 'default') {
        // Handle default type
        imageUrl = DEFAULT_VEHICLE_IMAGE;
      }

      // Final fallback to default if no valid URL found and type isn't 'none'
      if (!imageUrl && imageType !== 'none') {
        imageUrl = DEFAULT_VEHICLE_IMAGE;
      }

      // Compute style for the vehicle image
      imageStyle = this._computeImageStyle(
        this.config.vehicle_image_width,
        this.config.vehicle_image_crop
      );
    }

    // Store the valid non-default image URL for future use
    if (imageUrl && imageUrl !== DEFAULT_VEHICLE_IMAGE) {
      this._lastImageUrl = imageUrl;
    }

    // If no image should be rendered (either type is 'none' or no URL found)
    if (!imageUrl) return '';

    // Check if width exceeds 100% to allow edge-to-edge display
    const imageWidth = useActionImage
      ? selectedActionConfig?.image_width || 100
      : this.config.vehicle_image_width || 100;

    const edgeToEdge = imageWidth > 100;

    // Calculate the needed negative margins for edge-to-edge display
    if (edgeToEdge) {
      const cardPadding = 'var(--card-padding, 16px)';
      containerStyle += ` margin-left: calc(-1 * ${cardPadding}); margin-right: calc(-1 * ${cardPadding});`;
    }

    // Add overflow: hidden to container style to ensure crops are contained properly
    containerStyle += ' overflow: hidden;';

    // Only make the image clickable if we have a valid entity
    const clickHandler = entityId ? () => this._showMoreInfo(entityId) : undefined;
    const isClickable = !!entityId;

    // Compute container class based on isCentered parameter
    const containerClass = isCentered
      ? 'vehicle-image-container centered-image'
      : 'vehicle-image-container';

    // If edge-to-edge is enabled, add a special class
    const finalContainerClass = edgeToEdge ? `${containerClass} edge-to-edge` : containerClass;

    // Render the image container with the determined URL and style
    return html`
      <div class="${finalContainerClass}" style="${containerStyle}">
        <img
          class="vehicle-image ${useActionImage ? 'action-image-active' : ''} ${isClickable
            ? 'clickable'
            : ''}"
          src="${imageUrl}"
          style="${imageStyle}"
          @error=${this._handleImageError}
          @click=${clickHandler}
          ?title=${isClickable
            ? `Click to view details for ${this._getFriendlyName(entityId)}`
            : undefined}
        />
      </div>
    `;
  }

  private _getFriendlyName(entityId: string): string {
    const entity = this.hass.states[entityId];
    if (entity) {
      return entity.attributes.friendly_name || entityId.split('.').pop() || entityId;
    }
    return entityId;
  }

  private _formatValue(value: string, entityId?: string, iconShowUnits?: boolean): string {
    if (!entityId || !this.hass.states[entityId]) {
      return value; // Return raw value if entity or state doesn't exist
    }

    const entityState = this.hass.states[entityId];
    const unit = entityState.attributes.unit_of_measurement;
    const deviceClass = entityState.attributes.device_class;
    const domain = entityId.split('.')[0];

    // First check if it's a binary sensor - leverage HA's translations
    if (domain === 'binary_sensor' && deviceClass) {
      // Try using Home Assistant's built-in formatter if available
      if ((this.hass as any).formatEntityState) {
        // This will include appropriate translations based on device class
        return (this.hass as any).formatEntityState(entityState);
      }

      // If HA formatter is not available, use the device class to select appropriate wording
      // For ON state
      if (value.toLowerCase() === 'on') {
        switch (deviceClass) {
          case 'battery':
            return 'Low';
          case 'battery_charging':
            return 'Charging';
          case 'cold':
            return 'Cold';
          case 'connectivity':
            return 'Connected';
          case 'door':
            return 'Open';
          case 'garage_door':
            return 'Open';
          case 'gas':
            return 'Detected';
          case 'heat':
            return 'Hot';
          case 'light':
            return 'Detected';
          case 'lock':
            return 'Unlocked';
          case 'moisture':
            return 'Wet';
          case 'motion':
            return 'Detected';
          case 'moving':
            return 'Moving';
          case 'occupancy':
            return 'Occupied';
          case 'opening':
            return 'Open';
          case 'plug':
            return 'Plugged In';
          case 'power':
            return 'On';
          case 'presence':
            return 'Home';
          case 'problem':
            return 'Problem';
          case 'running':
            return 'Running';
          case 'safety':
            return 'Unsafe';
          case 'smoke':
            return 'Detected';
          case 'sound':
            return 'Detected';
          case 'tamper':
            return 'Tampered';
          case 'update':
            return 'Update Available';
          case 'vibration':
            return 'Detected';
          case 'window':
            return 'Open';
          // If we don't have a specific translation, return the value as is
          default:
            return value;
        }
      }
      // For OFF state
      else if (value.toLowerCase() === 'off') {
        switch (deviceClass) {
          case 'battery':
            return 'Normal';
          case 'battery_charging':
            return 'Not Charging';
          case 'cold':
            return 'Normal';
          case 'connectivity':
            return 'Disconnected';
          case 'door':
            return 'Closed';
          case 'garage_door':
            return 'Closed';
          case 'gas':
            return 'Clear';
          case 'heat':
            return 'Normal';
          case 'light':
            return 'Clear';
          case 'lock':
            return 'Locked';
          case 'moisture':
            return 'Dry';
          case 'motion':
            return 'Clear';
          case 'moving':
            return 'Stopped';
          case 'occupancy':
            return 'Clear';
          case 'opening':
            return 'Closed';
          case 'plug':
            return 'Unplugged';
          case 'power':
            return 'Off';
          case 'presence':
            return 'Away';
          case 'problem':
            return 'OK';
          case 'running':
            return 'Stopped';
          case 'safety':
            return 'Safe';
          case 'smoke':
            return 'Clear';
          case 'sound':
            return 'Clear';
          case 'tamper':
            return 'Clear';
          case 'update':
            return 'Up to Date';
          case 'vibration':
            return 'Clear';
          case 'window':
            return 'Closed';
          // If we don't have a specific translation, return the value as is
          default:
            return value;
        }
      }
    }

    // If formatting is disabled, just return the raw value (possibly with unit)
    if (this.config.formatted_entities === false) {
      // If there's a unit and show_units is enabled, add it
      // Check icon-specific setting first, which takes precedence
      const showUnits =
        iconShowUnits !== undefined ? iconShowUnits : this.config.show_units !== false;
      if (unit && showUnits) {
        return `${value} ${unit}`;
      }
      return value;
    }

    // --- Special Overrides (only apply if formatted_entities is true) ---

    // 1. Device Class Handling for Binary Sensors - Rely on friendly_state above

    // 2. Location Override: Zone detection or formatted address
    if (entityId === this.config.location_entity) {
      const currentState = entityState.state.toLowerCase(); // Get lower-case state (e.g., 'home')
      const zoneEntities = Object.keys(this.hass.states).filter(id => id.startsWith('zone.'));

      // **PRIORITY 1: Check if entity state matches a zone name or ID**
      for (const zoneId of zoneEntities) {
        const zone = this.hass.states[zoneId];
        const zoneFriendlyName = (
          zone.attributes.friendly_name ||
          zone.attributes.name ||
          ''
        ).toLowerCase();
        const zoneIdName = zoneId.split('.')[1].toLowerCase();

        if (
          currentState === zoneFriendlyName || // e.g., 'home' === 'home'
          currentState === zoneIdName // e.g., 'home' === 'home' (from zone.home)
        ) {
          // Found a zone matching the entity's state, use its friendly name
          return zone.attributes.friendly_name || zone.attributes.name || zoneId.split('.')[1];
        }
      }

      // **PRIORITY 2: Fallback to checking proximity to zone center coordinates**
      for (const zoneId of zoneEntities) {
        const zone = this.hass.states[zoneId];
        if (
          zone?.attributes?.latitude &&
          zone?.attributes?.longitude &&
          entityState?.attributes?.latitude &&
          entityState?.attributes?.longitude &&
          Math.abs(zone.attributes.latitude - entityState.attributes.latitude) < 0.0001 &&
          Math.abs(zone.attributes.longitude - entityState.attributes.longitude) < 0.0001
        ) {
          // Found a zone whose center is very close, use its friendly name
          return zone.attributes.friendly_name || zone.attributes.name || zoneId.split('.')[1];
        }
      }

      // **PRIORITY 3: Fallback to formatted_address attribute**
      if (entityState?.attributes?.formatted_address) {
        return entityState.attributes.formatted_address;
      }
      // Fall through to default formatting if no zone match or address found
    }

    // --- Custom Formatting Logic ---
    // If we're here, we're using formatted_entities but not a special case

    let formattedValue = value;
    let usedHaFormatter = false; // Flag to track if HA formatter was used

    // Format numeric values nicely
    if (!isNaN(Number(value))) {
      const numValue = Number(value);

      // FIRST CHECK: Try to use Home Assistant's formatEntityState if available
      // This is the most accurate way to respect HA's settings
      if ((this.hass as any).formatEntityState) {
        // Get HA's formatted state (which might include units like 'h' and 'm' for duration)
        const hassFormattedState = (this.hass as any).formatEntityState(entityState);

        // If we successfully got a formatted state from HA
        if (hassFormattedState && typeof hassFormattedState === 'string') {
          // Trust HA's formatting, don't try to remove the base unit
          formattedValue = hassFormattedState;
          usedHaFormatter = true; // Mark that HA formatter was applied
        }
      }
      // FALLBACK: If HA formatter is not available, use manual precision detection
      else {
        // Check for entity's precision settings from Home Assistant
        let precision = undefined;

        // Check for suggested_display_precision first (newer HA versions)
        if (entityState.attributes.suggested_display_precision !== undefined) {
          precision = entityState.attributes.suggested_display_precision;
        }
        // Then check for display_precision (some entities or older HA versions)
        else if (entityState.attributes.display_precision !== undefined) {
          precision = entityState.attributes.display_precision;
        }

        // Check for state_class to determine default precision for energy/statistics
        const stateClass = entityState.attributes.state_class;
        const deviceClass = entityState.attributes.device_class;

        // If precision is still undefined, set based on device_class and state_class
        if (precision === undefined) {
          // Common energy measurements typically have specific precision
          if (
            deviceClass === 'energy' ||
            stateClass === 'total' ||
            stateClass === 'total_increasing'
          ) {
            precision = 3; // kWh often shown with 3 decimals
          }
          // Sensor measurements like temperature often use 1 decimal
          else if (deviceClass === 'temperature' || deviceClass === 'humidity') {
            precision = 1;
          }
          // Default precision: 0 for integers, 2 for decimals
          else {
            precision = Number.isInteger(numValue) ? 0 : 2;
          }
        }

        // Get number format preference if available
        const numberFormat = entityState.attributes.number_format || 'en-US';

        // Format the number with the determined precision
        formattedValue = numValue.toLocaleString(numberFormat, {
          maximumFractionDigits: precision,
          minimumFractionDigits: 0,
        });
      }
    } else {
      // For non-numeric values, only replace underscores with spaces
      // and capitalize only the first letter of the string to avoid issues with special characters
      formattedValue = value.replace(/_/g, ' ');
      // Only capitalize the first letter of the entire string
      if (formattedValue.length > 0) {
        formattedValue = formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1);
      }
    }

    // Add units only if show_units is enabled - Icon setting takes precedence over card setting
    const showUnits =
      iconShowUnits !== undefined ? iconShowUnits : this.config.show_units !== false;

    // Check device class to avoid adding unit if HA already formatted duration
    const skipUnitAddition = usedHaFormatter && deviceClass === 'duration';

    if (showUnits && unit && !skipUnitAddition) {
      // Check if formattedValue already includes the unit to avoid duplication
      // (Keep original check as a fallback for non-duration or manually formatted values)
      if (!formattedValue.endsWith(unit) && !formattedValue.includes(` ${unit}`)) {
        formattedValue = `${formattedValue} ${unit}`;
      }
    }
    // If show_units is FALSE, but the formatted value from HA might include unit, we might need to remove it
    // Note: This might be tricky for durations like "42h 30m" if unit is 'h'.
    // For now, we only remove the exact unit match if it's at the end.
    else if (!showUnits && unit) {
      // Remove the unit if it exists at the end of the string, possibly preceded by a space
      if (formattedValue.endsWith(` ${unit}`)) {
        formattedValue = formattedValue.substring(0, formattedValue.length - unit.length - 1);
      } else if (formattedValue.endsWith(unit)) {
        formattedValue = formattedValue.substring(0, formattedValue.length - unit.length);
      }
      // Avoid overly broad replacement: formattedValue = formattedValue.replace(` ${unit}`, '').replace(unit, '');
    }

    // Apply any prefix/suffix from the entity if they exist
    const prefix = entityState.attributes.prefix || '';
    const suffix = entityState.attributes.suffix || '';
    return `${prefix}${formattedValue}${suffix}`;
  }

  private _handleImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    // Add error class to indicate the image couldn't be loaded
    img.classList.add('image-error');

    // If we have a cached image URL, try using that instead
    if (this._lastImageUrl && img.src !== this._lastImageUrl) {
      img.src = this._lastImageUrl;
      return;
    }

    // Prevent continuous error logging by removing the src attribute
    img.src = '';
  }

  private _renderBar(bar: BarConfig) {
    if (!bar.entity) {
      return html``;
    }

    const entity = this.hass.states[bar.entity];
    if (!entity) {
      return html``;
    }

    // Get state value - handle unavailable and unknown
    const value = parseFloat(entity.state);
    const isValidState =
      !isNaN(value) && entity.state !== 'unavailable' && entity.state !== 'unknown';

    // Calculate percentage based on percentage_type
    let percentage = 0;
    const barAny = bar as any; // Type assertion to avoid TS errors with new properties

    if (
      barAny.percentage_type === 'difference' &&
      barAny.percentage_amount_entity &&
      barAny.percentage_total_entity
    ) {
      // For difference percentage type, calculate percentage based on amount/total
      const amountEntity = this.hass.states[barAny.percentage_amount_entity];
      const totalEntity = this.hass.states[barAny.percentage_total_entity];

      if (amountEntity && totalEntity) {
        const amount = parseFloat(amountEntity.state);
        const total = parseFloat(totalEntity.state);

        // Check if both values are valid numbers and total is not zero
        if (!isNaN(amount) && !isNaN(total) && total > 0) {
          percentage = Math.max(0, Math.min(100, (amount / total) * 100));
        }
      }
    } else if (
      barAny.percentage_type === 'attribute' &&
      barAny.percentage_attribute &&
      entity.attributes
    ) {
      // Use attribute value for percentage
      const attributeValue = entity.attributes[barAny.percentage_attribute];
      if (attributeValue !== undefined && !isNaN(parseFloat(attributeValue))) {
        percentage = Math.max(0, Math.min(100, parseFloat(attributeValue)));
      }
    } else if (
      barAny.percentage_type === 'template' &&
      barAny.percentage_template &&
      this._templateService
    ) {
      // Process template for percentage
      const templateResult = this._processPercentageTemplate(barAny.percentage_template);
      if (templateResult !== null) {
        percentage = Math.max(0, Math.min(100, templateResult));
      }
    } else {
      // Default to original entity percentage calculation
      percentage = isValidState ? Math.max(0, Math.min(100, value)) : 0;
    }

    // Format color values using CSS variables if needed
    const formatColor = (color: string): string => {
      if (!color) return '';
      if (color.startsWith('var(--')) return color;
      return color;
    };

    // Process limit indicator
    let limitPercentage: number | null = null;
    let formattedLimitColor = '';

    if (bar.limit_entity) {
      const limitEntity = this.hass.states[bar.limit_entity];
      if (limitEntity && !isNaN(parseFloat(limitEntity.state))) {
        limitPercentage = parseFloat(limitEntity.state);
        formattedLimitColor = formatColor(bar.limit_indicator_color || '#ff0000');
      }
    }

    // Determine bar size and width classes
    const barSizeClass = `bar-size-${bar.bar_size || 'regular'}`;
    const barWidth = bar.width || '100';

    // Get animation class using our helper method
    const animationClass = this._getBarAnimationClass(bar);

    // Gradient processing with our utility functions
    const gradientStops = bar.gradient_stops || [];
    const useGradient = bar.use_gradient === true && gradientStops.length >= 2;
    const gradientDisplayMode =
      useGradient && bar.gradient_display_mode ? bar.gradient_display_mode : 'value_based';

    // Determine border radius based on the bar_radius property
    let barRadiusStyle = '';
    let barFillRadiusStyle = '';

    switch (bar.bar_radius) {
      case 'square':
        barRadiusStyle = 'border-radius: 0;';
        barFillRadiusStyle = 'border-radius: 0;';
        break;
      case 'rounded-square':
        // Consistent 4px radius for container
        barRadiusStyle = 'border-radius: 4px;';
        // Match fill to container exactly on left side, keep right side at 0
        barFillRadiusStyle = 'border-radius: 2px 0 0 2px; margin: 0;';
        break;
      default: // 'round' is the default
        barRadiusStyle = 'border-radius: 1000px;';
        barFillRadiusStyle = 'border-radius: 1000px 0 0 1000px;';
        break;
    }

    // Add a check for percentage and apply full border radius styling
    // after the switch statement
    if (percentage >= 100) {
      // If percentage is 100, we should apply the full border radius to the fill element
      switch (bar.bar_radius) {
        case 'square':
          // No change needed for square
          break;
        case 'rounded-square':
          barFillRadiusStyle = 'border-radius: 4px; margin: 0;'; // Full rounded corners with no margin
          break;
        default: // 'round' is the default
          barFillRadiusStyle = 'border-radius: 1000px;'; // Full rounded corners
          break;
      }
    }

    // Additional CSS adjustments for specific bar styles
    if (bar.bar_style === 'flat' && bar.bar_radius === 'rounded-square') {
      // Ensure minimal gap between container and fill for flat style
      barFillRadiusStyle += ' border: none; box-shadow: none;';
    }

    // Handle the glow animation since it's an edge case
    let glowStyle = '';
    if (animationClass === 'animate-glow') {
      const glowColor = useGradient
        ? gradientDisplayMode === 'value_based'
          ? getColorAtPosition(gradientStops, percentage)
          : gradientDisplayMode === 'cropped'
            ? getColorAtPosition(gradientStops, percentage)
            : getColorAtPosition(gradientStops, 100)
        : bar.bar_color || 'var(--primary-color)';
      glowStyle = `--glow-color: ${glowColor};`;
    }

    // Create radius class for special handling of bar-style-outline with square radius
    const radiusClass =
      bar.bar_radius === 'square'
        ? 'bar-radius-square'
        : bar.bar_radius === 'rounded-square'
          ? 'bar-radius-rounded-square'
          : 'bar-radius-round';

    // Define the fill element
    let barFill;

    // Extract RGB values for neon glow if using that style
    let neonGlowStyles = '';
    if (bar.bar_style === 'neon') {
      const baseColor = bar.bar_color || 'var(--primary-color)';
      if (baseColor !== 'transparent' && !baseColor.startsWith('var(--')) {
        const rgb = this._hexToRgb(baseColor);
        if (rgb) {
          neonGlowStyles = `
            --glow-color-r: ${rgb.r};
            --glow-color-g: ${rgb.g};
            --glow-color-b: ${rgb.b};
          `;
        }
      }
    }

    if (useGradient) {
      // Handle dashed style separately when gradient is enabled
      if (bar.bar_style === 'dashed') {
        // === MODIFICATION START: Handle different modes for dashed gradient ===
        if (gradientDisplayMode === 'full' || gradientDisplayMode === 'cropped') {
          const backgroundGradient = createLinearGradient(gradientStops);
          const backgroundSize =
            gradientDisplayMode === 'full' ? '100% 100%' : `${100 * (100 / percentage)}% 100%`;

          // Simply add the bar-style-dashed class to get standard styling
          barFill = html`
            <div
              class="progress-bar-fill bar-style-dashed ${animationClass}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="${gradientDisplayMode}"
              data-percentage="${percentage}"
              style="
                width: ${percentage}%;
                background-image: ${backgroundGradient};
                background-size: ${backgroundSize};
                background-position: 0% 0%;
                background-repeat: no-repeat;
                ${barFillRadiusStyle}
                ${glowStyle}
                ${neonGlowStyles}
              "
            >
              ${animationClass === 'animate-bubbles' ? html`<span></span>` : ''}
              ${bar.show_percentage ? this._renderPercentageText(bar, percentage) : ''}
            </div>
          `;
        } else {
          // Default to value_based for dashed - KEEP THIS APPROACH AS IT WORKS
          const dashColor = getColorAtPosition(gradientStops, percentage);
          barFill = html`
            <div
              class="progress-bar-fill" /* No bar-style-dashed class here to avoid conflicts */
              data-use-gradient="true"
              has-gradient="true"
              data-mode="value_based"
              data-percentage="${percentage}"
              style="
                width: ${percentage}%;
                background-color: transparent !important;
                position: relative; /* Ensure positioning context for child */
                ${barFillRadiusStyle}
                overflow: hidden; /* Keep dashes within border radius */
              "
            >
              <!-- Add dedicated child element for dashes -->
              <div 
                class="dash-overlay" 
                style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-image: repeating-linear-gradient(
                    90deg, 
                    ${dashColor}, 
                    ${dashColor} 5px, 
                    transparent 5px, 
                    transparent 10px
                  );
                  background-size: 10px 100%;
                "
              ></div>
              ${animationClass === 'animate-bubbles' ? html`<span></span>` : ''}
              ${bar.show_percentage ? this._renderPercentageText(bar, percentage) : ''}
            </div>
          `;
        }
        // === MODIFICATION END ===
      } else {
        // Original gradient logic for non-dashed styles
        if (gradientDisplayMode === 'value_based') {
          // Value-based mode: get color at current percentage
          const currentColor = getColorAtPosition(gradientStops, percentage);

          // For neon glow with gradient, try to extract RGB from current color
          if (bar.bar_style === 'neon' && !neonGlowStyles) {
            const rgb = this._hexToRgb(currentColor);
            if (rgb) {
              neonGlowStyles = `
                --glow-color-r: ${rgb.r};
                --glow-color-g: ${rgb.g};
                --glow-color-b: ${rgb.b};
              `;
            }
          }

          barFill = html`
            <div
              class="progress-bar-fill ${bar.bar_style
                ? `bar-style-${bar.bar_style}`
                : ''} ${animationClass}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="value_based"
              data-percentage="${percentage}"
              style="
                width: ${percentage}%;
                background-color: ${currentColor};
                ${barFillRadiusStyle}
                ${glowStyle}
                ${neonGlowStyles}
              "
            >
              ${animationClass === 'animate-bubbles' ? html`<span></span>` : ''}
              ${bar.show_percentage ? this._renderPercentageText(bar, percentage) : ''}
            </div>
          `;
        } else if (gradientDisplayMode === 'full') {
          // Full gradient mode: show entire gradient across the bar
          const backgroundGradient = createLinearGradient(gradientStops);

          // === MODIFICATION START: Get last gradient color for neon glow ===
          if (bar.bar_style === 'neon') {
            const lastStop = gradientStops[gradientStops.length - 1];
            if (lastStop) {
              const rgb = this._hexToRgb(lastStop.color);
              if (rgb) {
                neonGlowStyles = `
                  --glow-color-r: ${rgb.r};
                  --glow-color-g: ${rgb.g};
                  --glow-color-b: ${rgb.b};
                `;
              }
            }
          }
          // === MODIFICATION END ===

          barFill = html`
            <div
              class="progress-bar-fill ${bar.bar_style
                ? `bar-style-${bar.bar_style}`
                : ''} ${animationClass}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="full"
              data-percentage="${percentage}"
              style="
                width: ${percentage}%;
                background-image: ${backgroundGradient};
                background-color: transparent;
                background-size: 100% 100%;
                background-position: 0% 0%;
                background-repeat: no-repeat;
                ${barFillRadiusStyle}
                ${glowStyle}
                ${neonGlowStyles}
              "
            >
              ${animationClass === 'animate-bubbles' ? html`<span></span>` : ''}
              ${bar.show_percentage ? this._renderPercentageText(bar, percentage) : ''}
            </div>
          `;
        } else if (gradientDisplayMode === 'cropped') {
          // Cropped mode: show only the portion of the gradient up to the current value
          const backgroundGradient = createLinearGradient(gradientStops);

          // === MODIFICATION START: Get last gradient color for neon glow ===
          if (bar.bar_style === 'neon') {
            // Use the color at the current percentage point for the glow effect
            const currentColor = getColorAtPosition(gradientStops, percentage);
            const rgb = this._hexToRgb(currentColor);
            if (rgb) {
              neonGlowStyles = `
                --glow-color-r: ${rgb.r};
                --glow-color-g: ${rgb.g};
                --glow-color-b: ${rgb.b};
              `;
            }
          }
          // === MODIFICATION END ===

          barFill = html`
            <div
              class="progress-bar-fill ${bar.bar_style
                ? `bar-style-${bar.bar_style}`
                : ''} ${animationClass}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="cropped"
              data-percentage="${percentage}"
              style="
                width: ${percentage}%;
                background-image: ${backgroundGradient};
                background-color: transparent;
                background-size: ${100 * (100 / percentage)}% 100%;
                background-position: 0% 0%;
                background-repeat: no-repeat;
                ${barFillRadiusStyle}
                ${glowStyle}
                ${neonGlowStyles}
              "
            >
              ${animationClass === 'animate-bubbles' ? html`<span></span>` : ''}
              ${bar.show_percentage ? this._renderPercentageText(bar, percentage) : ''}
            </div>
          `;
        }
      }
    } else {
      // Non-gradient mode: use solid color
      const barColor = formatColor(bar.bar_color || 'var(--primary-color)');

      // Handle non-gradient dashed style specifically
      if (bar.bar_style === 'dashed') {
        barFill = html`
          <div
            class="progress-bar-fill" /* No bar-style-dashed class to avoid CSS conflicts */
            data-percentage="${percentage}"
            style="
              width: ${percentage}%;
              background-color: transparent !important;
              position: relative; /* Ensure positioning context for child */
              ${barFillRadiusStyle}
              overflow: hidden; /* Keep dashes within border radius */
            "
          >
            <!-- Add dedicated child element for dashes using the bar's color -->
            <div 
              class="dash-overlay" 
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: repeating-linear-gradient(
                  90deg, 
                  ${barColor}, 
                  ${barColor} 5px, 
                  transparent 5px, 
                  transparent 10px
                );
                background-size: 10px 100%;
              "
            ></div>
            ${animationClass === 'animate-bubbles' ? html`<span></span>` : ''}
            ${bar.show_percentage ? this._renderPercentageText(bar, percentage) : ''}
          </div>
        `;
      } else {
        // Original non-dashed, non-gradient styling
        barFill = html`
          <div
            class="progress-bar-fill ${bar.bar_style
              ? `bar-style-${bar.bar_style}`
              : ''} ${animationClass}"
            data-percentage="${percentage}"
            style="
              width: ${percentage}%;
              background-color: ${barColor};
              ${barFillRadiusStyle}
              ${glowStyle}
              ${neonGlowStyles}
            "
          >
            ${animationClass === 'animate-bubbles' ? html`<span></span>` : ''}
            ${bar.show_percentage ? this._renderPercentageText(bar, percentage) : ''}
          </div>
        `;
      }
    }

    // Calculate width with appropriate gap handling
    // Default gap between bars is 8px
    const gap = 8;
    let widthStyle = '';

    if (bar.width && bar.width !== '100') {
      // Subtract half the gap for each side of the bar
      // For 50%, subtract 4px. For 25%, subtract 6px (approx 3 gaps / 4 bars).
      const widthNum = parseInt(bar.width);
      let subtractPx = 0;
      if (widthNum === 50) {
        subtractPx = gap / 2;
      } else if (widthNum === 25) {
        subtractPx = (gap * 3) / 4; // Approximation for 3 gaps among 4 items
      } else if (widthNum === 75) {
        subtractPx = gap / 4; // Approximation for 1 gap among 2 items (75 + 25)
      }
      widthStyle = `calc(${bar.width}% - ${subtractPx}px)`;
    } else {
      widthStyle = '100%';
    }

    // === MODIFICATION START ===
    // Conditionally set background for the main progress bar container
    const progressBarBackground =
      bar.bar_style === 'dashed' ? 'transparent' : bar.background_color || '#121212';
    // === MODIFICATION END ===

    // Return the complete bar with container, fill, limit indicator and labels
    // Wrap bar and labels in a new div with width applied
    return html`
      <div
        class="progress-bar-wrapper"
        style="width: ${widthStyle};" /* Apply calculated width to wrapper */
      >
        <div
          class="progress-bar ${barSizeClass} ${bar.bar_style ? `bar-style-${bar.bar_style}` : ''} ${radiusClass}"
          style="background: ${progressBarBackground}; border-color: ${
            // Use calculated background
            bar.border_color || '#686868'
          }; width: 100%; ${barRadiusStyle}" /* Bar takes full width of wrapper */
          @click=${() => this._showMoreInfo(bar.entity)}
        >
          ${barFill}
          ${
            limitPercentage !== null
              ? html`<div
                  class="limit-indicator"
                  style="left: ${limitPercentage}%;
                       background-color: ${formattedLimitColor};
                       box-shadow: 0 0 2px ${formattedLimitColor};"
                ></div>`
              : ''
          }
        </div>
        ${this._renderBarLabels(bar)}
      </div>
    `;
  }

  private _renderPercentageText(bar: BarConfig, percentage: number) {
    const percentageTextSize = bar.percentage_text_size ? `${bar.percentage_text_size}px` : '14px';
    // --- Change the fallback color to static white ---
    const percentageTextColor = bar.percentage_text_color || '#ffffff';

    // Check if units should be shown (respect the card's global setting)
    const showUnits = this.config.show_units !== false;

    return html`
      <div
        class="percentage-text"
        style="
        font-size: ${percentageTextSize};
        color: ${percentageTextColor};
      "
      >
        ${Math.round(percentage)}${showUnits ? '%' : ''}
      </div>
    `;
  }

  private _getBarAnimationClass(bar: BarConfig): string {
    let animationClass = '';

    // Add animation class if applicable
    const animationState = this._getEntityState(bar.animation_entity);
    const actionAnimationState = this._getEntityState(bar.action_animation_entity);

    // Check if animation should be shown
    if (
      bar.animation_type &&
      ((!bar.animation_entity && !bar.animation_state) ||
        (bar.animation_entity && bar.animation_state && animationState === bar.animation_state))
    ) {
      animationClass = `animate-${bar.animation_type}`;
    }

    // Check if action animation should be shown (overrides normal animation)
    if (
      bar.action_animation &&
      bar.action_animation_entity &&
      bar.action_animation_state &&
      actionAnimationState === bar.action_animation_state
    ) {
      animationClass = `animate-${bar.action_animation}`;
    }

    return animationClass;
  }

  private _getEntityState(entityId?: string): string | undefined {
    if (!entityId || !this.hass.states[entityId]) return undefined;
    return this.hass.states[entityId]?.state;
  }

  private _renderIconRows(sectionStyle: string = '') {
    // Add sectionStyle parameter
    const { icon_rows = [] } = this.config;

    if (!icon_rows || icon_rows.length === 0) return html``;

    return html`
      <div class="icon-rows-container" style="${sectionStyle}">
        ${icon_rows.map(row => this._renderIconRow(row))}
      </div>
    `;
  }

  private _renderIconRow(row: IconRowConfig) {
    if (!row.icons || !row.icons.length) return html``;

    const width = row.width || '100';
    const alignment = row.alignment || 'space-between';
    const spacing = row.spacing || 'medium';
    const columns = row.columns || 0; // Get columns value, default to 0 (disabled)
    const verticalAlignment = row.vertical_alignment || 'center'; // Get vertical alignment with default

    const spacingValue =
      {
        none: '0',
        small: '8px',
        medium: '16px',
        large: '24px',
      }[spacing] || '16px';

    // Map alignment to class
    const alignmentClass = `align-${alignment}`;

    // Check if we're in the dashboard layout
    const isDashboardLayout = this.config.layout_type === 'dashboard';

    // Create grid layout style if columns is specified and > 0
    let rowStyle = `width: ${width}%; gap: ${spacingValue};`;
    let rowClass = `icon-row ${alignmentClass}`;

    if (columns && columns > 0) {
      // Override with grid layout
      rowStyle += `display: grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr));`;
      // Replace the class to remove flexbox alignment
      rowClass = 'icon-row-grid';
    } else {
      // For flexbox layout, add the vertical alignment
      rowStyle += `align-items: ${verticalAlignment};`;
    }

    // Add dashboard-icon-row class if in dashboard layout
    if (isDashboardLayout) {
      rowClass += ' dashboard-icon-row';
    }

    return html`
      <div class="${rowClass}" style="${rowStyle}">
        ${row.icons.map(icon => this._renderCardIcon(icon))}
      </div>
    `;
  }

  private _renderCardIcon(icon: IconConfig) {
    if (!icon.entity) return html``;

    const state = this.hass.states[icon.entity];
    if (!state) return html``;

    // Generate a unique key for this icon's state
    const iconStateKey = `${icon.entity}_${icon.active_template_mode ? icon.active_template : ''}_${icon.inactive_template_mode ? icon.inactive_template : ''}_${icon.active_state || ''}_${icon.inactive_state || ''}`;

    // Find the row this icon belongs to for confirmation mode check
    let rowId: string | undefined = undefined;
    let confirmationMode = false;

    if (this.config.icon_rows) {
      for (const row of this.config.icon_rows) {
        if (row.icons?.includes(icon)) {
          rowId = row.id;
          confirmationMode = (row as any).confirmation_mode === true;
          break;
        }
      }
    }

    // Check if this icon is awaiting confirmation
    const iconKey = rowId ? `${rowId}_${icon.entity}` : icon.entity;
    const isAwaitingConfirmation = confirmationMode && this._iconsAwaitingConfirmation.has(iconKey);

    // --- Helper function to render the icon content ---
    const renderIconContent = (isActive: boolean, isPending = false) => {
      const entityIcon = state.attributes.icon || null;
      const displayIcon =
        isActive && icon.icon_active
          ? icon.icon_active
          : !isActive && icon.icon_inactive
            ? icon.icon_inactive
            : entityIcon || 'mdi:help-circle-outline';

      // Get entity color if available
      const entityColor = state.attributes.rgb_color
        ? `rgb(${state.attributes.rgb_color.join(',')})`
        : state.attributes.color || null;

      // Determine icon color based on entity color setting
      const displayColor = (() => {
        // Check if we should use entity color based on active state
        if (
          (isActive && icon.use_entity_color_for_icon_active) ||
          (!isActive && icon.use_entity_color_for_icon_inactive) ||
          (icon.use_entity_color_for_icon &&
            !(isActive && icon.use_entity_color_for_icon_active !== undefined) &&
            !(!isActive && icon.use_entity_color_for_icon_inactive !== undefined))
        ) {
          if (entityColor) {
            return entityColor;
          }
        }
        return isActive && icon.color_active ? icon.color_active : icon.color_inactive;
      })();

      const displayName = icon.name || state.attributes.friendly_name || '';
      let displayState = state.state; // Initial state from entity
      const unit = state.attributes.unit_of_measurement;

      // === Get custom state text override first ===
      const customStateText = isActive ? icon.active_state_text : icon.inactive_state_text;

      // === Automatically use template result as text if template mode is enabled ===
      if ((icon.active_template_mode && isActive) || (icon.inactive_template_mode && !isActive)) {
        // Determine which template is active
        const templateType = isActive ? 'active' : 'inactive';
        const templateKey = `${templateType}_${icon.entity}_${icon[`${templateType}_template`]}`;

        // Check if we have a rendered template string available
        if (this.hass.__uvc_template_strings && this.hass.__uvc_template_strings[templateKey]) {
          displayState = this.hass.__uvc_template_strings[templateKey];
        }
      }
      // === Otherwise use custom state text if provided ===
      else if (
        customStateText !== undefined &&
        customStateText !== null &&
        customStateText !== ''
      ) {
        displayState = customStateText; // Use custom text
      }
      // === Use default formatted state if nothing else applies ===
      else if (this.config.formatted_entities && state.state) {
        // Call the main formatting function with icon-specific show_units value that takes precedence
        displayState = this._formatValue(state.state, icon.entity, icon.show_units);
      }

      // Get sizes
      const iconSize = (() => {
        if (!icon.icon_size) return '24px';
        if (!isNaN(Number(icon.icon_size))) return `${icon.icon_size}px`;
        if (
          typeof icon.icon_size === 'string' &&
          (icon.icon_size.endsWith('px') ||
            icon.icon_size.endsWith('em') ||
            icon.icon_size.endsWith('%'))
        )
          return icon.icon_size;
        return `${icon.icon_size}px`;
      })();
      const textSize = (() => {
        if (!icon.text_size) return '14px';
        if (!isNaN(Number(icon.text_size))) return `${icon.text_size}px`;
        if (
          typeof icon.text_size === 'string' &&
          (icon.text_size.endsWith('px') ||
            icon.text_size.endsWith('em') ||
            icon.text_size.endsWith('%'))
        )
          return icon.text_size;
        return `${icon.text_size}px`;
      })();
      // Background styles
      const iconBackgroundStyle = (() => {
        if (!icon.icon_background || icon.icon_background === 'none') return '';
        let iconSizeNum = 24;
        if (typeof iconSize === 'string') {
          const match = iconSize.match(/^(\d+)/);
          if (match) iconSizeNum = parseInt(match[1], 10);
        } else if (typeof iconSize === 'number') iconSizeNum = iconSize;
        const bgSize = iconSizeNum + 16;

        // Use entity color for background if enabled and available
        const bgColor =
          icon.use_entity_color_for_icon_background && entityColor
            ? entityColor
            : icon.icon_background_color || 'var(--secondary-background-color)';

        let style = `background-color: ${bgColor}; display: flex; align-items: center; justify-content: center; width: ${bgSize}px; height: ${bgSize}px;`;
        switch (icon.icon_background) {
          case 'circle':
            style += `border-radius: 50%;`;
            break;
          case 'square':
            style += `border-radius: 0;`;
            break;
          case 'rounded-square':
            style += `border-radius: ${Math.max(4, bgSize * 0.15)}px;`;
            break;
        }
        return style;
      })();

      // Layout styles - Move these to before they're used in containerBackgroundStyle
      const textPosition = icon.text_position || 'bottom';
      const flexDirection =
        { bottom: 'column', top: 'column-reverse', left: 'row-reverse', right: 'row' }[
          textPosition
        ] || 'column';
      const verticalAlignment = icon.vertical_alignment || 'center';
      const alignItems =
        { 'flex-start': 'flex-start', center: 'center', 'flex-end': 'flex-end' }[
          verticalAlignment
        ] || 'center';
      const iconTextAlignment = icon.text_alignment || 'center';
      const parentAlignItems =
        iconTextAlignment === 'left'
          ? 'flex-start'
          : iconTextAlignment === 'right'
            ? 'flex-end'
            : 'center';

      const containerBackgroundStyle = (() => {
        if (!icon.container_background || icon.container_background === 'none') return '';

        // Use entity color for container background if enabled and available
        const bgColor =
          icon.use_entity_color_for_container_background && entityColor
            ? entityColor
            : icon.container_background_color || 'var(--secondary-background-color)';

        const isHorizontalLayout = textPosition === 'left' || textPosition === 'right';
        const padding = isHorizontalLayout ? '4px 12px' : '8px';
        let style = `background-color: ${bgColor}; padding: ${padding}; display: inline-flex; align-items: ${alignItems}; justify-content: center;`;
        switch (icon.container_background) {
          case 'circle':
            style += `border-radius: 50%;`;
            break;
          case 'square':
            style += `border-radius: 0;`;
            break;
          case 'rounded-square':
            style += `border-radius: 8px;`;
            break;
        }
        return style;
      })();
      // Visibility
      const shouldShowIcon =
        (isActive && icon.show_icon_active !== false) ||
        (!isActive && icon.show_icon_inactive !== false);
      // Determine whether to show name based on active state and config, with fallback
      const shouldShowName = isActive
        ? icon.show_name_active === undefined
          ? icon.show_name !== false
          : icon.show_name_active
        : icon.show_name_inactive === undefined
          ? icon.show_name !== false
          : icon.show_name_inactive;

      // Determine whether to show state based on active state and config, with fallback
      const shouldShowState = isActive
        ? icon.show_state_active === undefined
          ? icon.show_state !== false
          : icon.show_state_active
        : icon.show_state_inactive === undefined
          ? icon.show_state !== false
          : icon.show_state_inactive;

      // Colors
      const nameColor = isActive
        ? icon.name_color_active || 'var(--primary-text-color)'
        : icon.name_color_inactive || 'var(--primary-text-color)';
      const stateColor = isActive
        ? icon.state_color_active || 'var(--primary-text-color)'
        : icon.state_color_inactive || 'var(--secondary-text-color)';

      const isDraggable = true; // Assuming always draggable

      // The actual HTML structure
      return html`
        <div
          class="icon-outer-container"
          style="${containerBackgroundStyle}${icon.container_width
            ? `width: ${icon.container_width}%;`
            : ''}"
          @click=${() => {
            this._handleIconClick(icon);
          }}
        >
          <div
            class="icon-container ${isDraggable ? 'draggable' : ''} ${isPending
              ? 'pending-state'
              : ''} ${isAwaitingConfirmation ? 'awaiting-confirmation' : ''}"
            style="flex-direction: ${flexDirection}; align-items: ${alignItems};"
            draggable="${isDraggable}"
            @dragstart=${isDraggable ? this._handleDragStart : null}
            @dragend=${isDraggable ? this._handleDragEnd : null}
          >
            ${
              /* ... icon/background rendering logic ... */
              icon.icon_background && icon.icon_background !== 'none'
                ? html`
                    ${shouldShowIcon
                      ? html`<div class="icon-background" style="${iconBackgroundStyle}">
                          <ha-icon
                            .icon="${displayIcon}"
                            class="${isActive &&
                            icon.active_animation &&
                            icon.active_animation !== 'none'
                              ? `animate-${icon.active_animation}`
                              : !isActive &&
                                  icon.inactive_animation &&
                                  icon.inactive_animation !== 'none'
                                ? `animate-${icon.inactive_animation}`
                                : ''}"
                            style="color: ${displayColor ||
                            'var(--primary-text-color)'}; font-size: ${iconSize}; --mdc-icon-size: ${iconSize};"
                          ></ha-icon>
                        </div>`
                      : ''}
                  `
                : html`
                    ${shouldShowIcon
                      ? html`<ha-icon
                          .icon="${displayIcon}"
                          class="${isActive &&
                          icon.active_animation &&
                          icon.active_animation !== 'none'
                            ? `animate-${icon.active_animation}`
                            : !isActive &&
                                icon.inactive_animation &&
                                icon.inactive_animation !== 'none'
                              ? `animate-${icon.inactive_animation}`
                              : ''}"
                          style="color: ${displayColor ||
                          'var(--primary-text-color)'}; font-size: ${iconSize}; --mdc-icon-size: ${iconSize};"
                        ></ha-icon>`
                      : ''}
                  `
            }
            <div
              style="display: flex; flex-direction: column; align-items: ${parentAlignItems}; width: 100%; gap: 2px;"
            >
              ${shouldShowName
                ? html`<div
                    class="icon-label"
                    style="font-size: ${textSize}; text-align: ${iconTextAlignment}; color: ${nameColor};"
                  >
                    ${displayName}
                  </div>`
                : ''}
              ${shouldShowState
                ? html`<div
                    class="icon-state"
                    style="font-size: ${textSize}; text-align: ${iconTextAlignment}; color: ${stateColor};"
                  >
                    ${displayState}
                  </div>`
                : ''}
            </div>
          </div>
        </div>
      `;
    };

    // Promise for determining the *actual* current active state
    const evaluateCurrentState = async (): Promise<boolean> => {
      let isActive = false;
      let templateUsed = false; // Track if template evaluation happened

      // --- Template evaluation logic using service ---
      if (icon.active_template_mode && icon.active_template) {
        templateUsed = true;
        const templateKey = `active_${icon.entity}_${icon.active_template}`;

        // Use template service if available
        if (this._templateService) {
          const currentResult = this._templateService.getTemplateResult(templateKey);
          // Active Template: Result directly dictates isActive state
          isActive = currentResult ?? false;

          // Store the template result string for display if not already stored
          if (!this.hass.__uvc_template_strings) {
            this.hass.__uvc_template_strings = {};
          }

          // Subscribe to template if not already subscribed
          if (!this._templateService.hasTemplateSubscription(templateKey)) {
            this._templateService.subscribeToTemplate(icon.active_template, templateKey, () =>
              this.requestUpdate()
            );
          }
        }
      } else if (icon.inactive_template_mode && icon.inactive_template) {
        templateUsed = true;
        const templateKey = `inactive_${icon.entity}_${icon.inactive_template}`;

        // Use template service if available
        if (this._templateService) {
          const currentResult = this._templateService.getTemplateResult(templateKey);
          // Inactive Template: Result is INVERTED to dictate isActive state
          // If inactive_template evaluates to true, the icon becomes INACTIVE (isActive = false)
          isActive = !(currentResult ?? false);

          // Store the template result string for display if not already stored
          if (!this.hass.__uvc_template_strings) {
            this.hass.__uvc_template_strings = {};
          }

          // Subscribe to template if not already subscribed
          if (!this._templateService.hasTemplateSubscription(templateKey)) {
            this._templateService.subscribeToTemplate(icon.inactive_template, templateKey, () =>
              this.requestUpdate()
            );
          }
        }
      }

      // --- Standard state comparison (only if no template was used) ---
      if (!templateUsed) {
        const currentState = state.state; // Use a variable for clarity
        const currentStateLower = currentState?.toLowerCase().trim(); // Lowercase and trim for comparison

        // Convert configured states to lowercase for consistent comparison
        const activeStateLower = icon.active_state?.toLowerCase().trim();
        const inactiveStateLower = icon.inactive_state?.toLowerCase().trim();

        // For troubleshooting - uncomment to debug specific entities
        // /*  <-- Remove this line to enable logging
        // if (icon.entity.includes('charging')) {
        //   // You can change 'charging' to part of your entity ID
        //   console.log(`[UVC] State Debug: Entity=${icon.entity},
        //     CurrentState="${currentState}" (${currentStateLower}),
        //     ActiveState="${icon.active_state}" (${activeStateLower}),
        //     InactiveState="${icon.inactive_state}" (${inactiveStateLower})`);
        // }
        // */  <-- Remove this line to enable logging

        // ===== PRIORITY ORDER =====
        // 1. Check for unknown/unavailable states (always inactive)
        if (currentState === 'unknown' || currentState === 'unavailable') {
          // console.log(`[UVC] State Logic (${icon.entity}): Branch 1 (Unavailable/Unknown)`);
          isActive = false;
        }
        // 2. Check for explicit active_state/inactive_state matches (highest priority after templates)
        else if (activeStateLower && currentStateLower === activeStateLower) {
          // console.log(`[UVC] State Logic (${icon.entity}): Branch 2a (Active State Match)`);
          isActive = true; // Explicit active_state match has priority
        } else if (inactiveStateLower && currentStateLower === inactiveStateLower) {
          // console.log(`[UVC] State Logic (${icon.entity}): Branch 2b (Inactive State Match)`);
          isActive = false; // Explicit inactive_state match has priority
        }
        // 3. If no explicit matches, check against default active/inactive state lists
        else if (!icon.active_state && !icon.inactive_state) {
          // Check against DEFAULT_ACTIVE_STATES list first
          if (
            UltraVehicleCard.DEFAULT_ACTIVE_STATES.some(
              activeState => activeState === currentStateLower
            )
          ) {
            // console.log(`[UVC] State Logic (${icon.entity}): Branch 3a (Default Active Match)`);
            isActive = true;
          }
          // Then check against DEFAULT_INACTIVE_STATES list
          else if (
            UltraVehicleCard.DEFAULT_INACTIVE_STATES.some(
              inactiveState => inactiveState === currentStateLower
            )
          ) {
            // console.log(`[UVC] State Logic (${icon.entity}): Branch 3b (Default Inactive Match)`);
            isActive = false;
          }
          // If no matches in either default list, try numeric/boolean evaluation
          else {
            // console.log(
            //   `[UVC] State Logic (${icon.entity}): Branch 3c (Default Fallback Evaluation)`
            // );
            isActive =
              currentStateLower === 'on' ||
              currentStateLower === 'true' ||
              (Number(currentState) > 0 && !isNaN(Number(currentState)));
          }
        }
        // 4. If only an active_state is defined but there's no match, it's inactive
        else if (icon.active_state && !icon.inactive_state) {
          // console.log(`[UVC] State Logic (${icon.entity}): Branch 4 (Active Defined, No Match)`);
          isActive = false;
        }
        // 5. If only an inactive_state is defined, anything not matching is active
        else if (!icon.active_state && icon.inactive_state) {
          // console.log(`[UVC] State Logic (${icon.entity}): Branch 5 (Inactive Defined, No Match)`);
          isActive = true;
        }
        // 6. Default fallback (should rarely reach here)
        else {
          // console.log(`[UVC] State Logic (${icon.entity}): Branch 6 (Final Fallback)`);
          isActive =
            currentStateLower === 'on' || currentStateLower === 'true' || Number(currentState) > 0;
        }
      }
      return isActive;
    };

    // Get the last known state, default to false if never evaluated
    const lastKnownIsActive = this._iconActiveStates.get(iconStateKey) ?? false;

    // Use `until` to handle the promise
    return html`${until(
      evaluateCurrentState().then(currentIsActive => {
        // Check if the state actually changed
        const previousState = this._iconActiveStates.get(iconStateKey);
        if (previousState !== currentIsActive) {
          // Store the *new* actual state
          this._iconActiveStates.set(iconStateKey, currentIsActive);
          // Trigger a re-render for the *next* cycle to use the updated state
          this.requestUpdate();
        }
        // Render the icon with the *new* actual state
        return renderIconContent(currentIsActive, false); // Render with final state, not pending
      }),
      // While waiting, render the icon using the *last known* state
      renderIconContent(lastKnownIsActive, true) // Render with last known state, mark as pending
    )}`;
  }

  private _handleIconClick(icon: IconConfig) {
    if (!icon.entity || !icon.on_click_action) {
      return;
    }

    // Find the icon's row to check if confirmation mode is enabled
    let confirmationModeEnabled = false;
    let rowId: string | undefined = undefined;

    // Search through icon rows to find which row this icon belongs to
    if (this.config.icon_rows) {
      for (const row of this.config.icon_rows) {
        if (row.icons?.includes(icon)) {
          // Check if confirmation mode is enabled for this row
          confirmationModeEnabled = (row as any).confirmation_mode === true;
          rowId = row.id;
          break;
        }
      }
    }

    // Generate a unique key for this specific icon
    const iconKey = rowId ? `${rowId}_${icon.entity}` : icon.entity;

    // If confirmation mode is enabled for this row
    if (confirmationModeEnabled) {
      const now = Date.now();
      const lastClickTime = this._iconsAwaitingConfirmation.get(iconKey) || 0;

      // If this is the first click or too much time has passed since the last click (5 seconds timeout)
      if (lastClickTime === 0 || now - lastClickTime > 5000) {
        // Store the current time and wait for a second click
        this._iconsAwaitingConfirmation.set(iconKey, now);

        // Create a document click listener to cancel confirmation when clicking outside the icon
        const cancelListener = (e: Event) => {
          // Get the clicked element
          const clickedElement = e.target as HTMLElement;

          // Check if click is outside any elements with awaiting-confirmation class
          const isOutsideConfirmationIcon = !clickedElement.closest('.awaiting-confirmation');

          if (isOutsideConfirmationIcon) {
            // Cancel the confirmation
            this._cancelConfirmation(iconKey);
          }
        };

        // Store the listener so we can remove it later
        this._confirmationCancelListeners.set(iconKey, cancelListener);

        // Add the listener after a small delay to avoid the current click triggering it
        setTimeout(() => {
          document.addEventListener('click', cancelListener);
        }, 100);

        // Set up auto-timeout to clear the confirmation after 5 seconds
        setTimeout(() => {
          if (this._iconsAwaitingConfirmation.has(iconKey)) {
            this._cancelConfirmation(iconKey, false); // Silent cancel after timeout
          }
        }, 5000);

        // Optionally show a toast notification
        this._showToast(
          `Tap again to ${icon.on_click_action} ${this._getFriendlyName(icon.entity)}, or tap elsewhere to cancel`,
          'info'
        );

        // Exit early without performing the action
        return;
      } else {
        // This is a confirmation click within the time window
        // Clear the confirmation state
        this._cancelConfirmation(iconKey, false); // Silent cancel, we're proceeding with the action
      }
    }

    // Process the actual action (original code continues)
    switch (icon.on_click_action) {
      case 'toggle':
        const domain = icon.entity.split('.')[0];
        this.hass.callService(domain, 'toggle', { entity_id: icon.entity });
        break;
      case 'more-info':
        const event = new CustomEvent('hass-more-info', {
          detail: { entityId: icon.entity },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
        break;
      case 'navigate':
        if (icon.navigation_path) {
          const navigateEvent = new CustomEvent('location-changed', {
            detail: { replace: false },
            bubbles: true,
            composed: true,
          });

          // Use history.pushState to actually change the path
          window.history.pushState(null, '', icon.navigation_path);

          // Then dispatch the event to notify Home Assistant about the change
          this.dispatchEvent(navigateEvent);
        }
        break;
      case 'url':
        if (icon.url) {
          // Open URL in a new tab/window
          window.open(icon.url, '_blank', 'noopener,noreferrer');
          this._showToast(`Opening URL: ${icon.url}`, 'info');
        } else {
          this._showToast('No URL specified for url action', 'error');
          console.warn('[UltraVehicleCard] No URL specified for url action on icon:', icon);
        }
        break;
      // Remove 'show-map' and 'location-map' as they are not defined in the types
      // Use 'show-location-map' instead
      case 'show-location-map':
        this._openLocationMap(icon.entity);
        break;
      case 'location-map': // Add support for the action defined in icons-tab.ts
        this._openLocationMap(icon.entity);
        break;
      case 'call-service':
        if (icon.service) {
          try {
            // Parse the domain and service
            const [domain, service] = icon.service.split('.');

            // Parse service_data if it's a string
            let serviceData: Record<string, any> = {};
            if (typeof icon.service_data === 'string') {
              try {
                serviceData = JSON.parse(icon.service_data);
              } catch (e) {
                // If it's not valid JSON, show error toast
                this._showToast(`Error parsing service data: ${e.message}`, 'error');
                console.error(
                  `[UltraVehicleCard] Invalid service_data JSON: ${icon.service_data}`,
                  e
                );
                return;
              }
            } else if (icon.service_data && typeof icon.service_data === 'object') {
              serviceData = icon.service_data;
            }

            // Call the service
            this.hass
              .callService(domain, service, serviceData)
              .then(() => {
                this._showToast(`Service ${icon.service} called successfully`, 'success');
              })
              .catch(error => {
                this._showToast(`Error calling service ${icon.service}: ${error.message}`, 'error');
                console.error(`[UltraVehicleCard] Error calling service:`, error);
              });
          } catch (e) {
            this._showToast(`Failed to call service: ${e.message}`, 'error');
            console.error(`[UltraVehicleCard] Error in call-service action:`, e);
          }
        } else {
          this._showToast('No service specified for call-service action', 'error');
          console.warn(
            `[UltraVehicleCard] No service specified for call-service action on icon:`,
            icon
          );
        }
        break;

      case 'perform-action':
        try {
          // Handle the action based on its format
          let action = icon.action;

          // If action is a string, try to parse it as JSON first
          if (typeof action === 'string') {
            try {
              // Try to parse as JSON
              action = JSON.parse(action);
            } catch (e) {
              // If it's not valid JSON, treat as a service string (domain.service)
              const parts = action.split('.');
              if (parts.length === 2) {
                this.hass
                  .callService(parts[0], parts[1], { entity_id: icon.entity })
                  .then(() => {
                    this._showToast(`Service ${action} called successfully`, 'success');
                  })
                  .catch(error => {
                    this._showToast(`Error calling service ${action}: ${error.message}`, 'error');
                    console.error(`[UltraVehicleCard] Error calling service:`, error);
                  });
                return;
              } else {
                this._showToast(`Invalid action format: ${action}`, 'error');
                console.error(`[UltraVehicleCard] Invalid action format:`, action);
                return;
              }
            }
          }

          // If we have a JSON object with 'service' property, handle it
          if (action && typeof action === 'object' && action.service) {
            const [domain, service] = action.service.split('.');
            const serviceData = action.data || action.service_data || action.target || {};

            // If service doesn't have a domain, show error
            if (!service) {
              this._showToast(`Invalid service format in action: ${action.service}`, 'error');
              console.error(`[UltraVehicleCard] Invalid service format in action:`, action);
              return;
            }

            // Call the service
            this.hass
              .callService(domain, service, serviceData)
              .then(() => {
                this._showToast(`Action completed successfully`, 'success');
              })
              .catch(error => {
                this._showToast(`Error performing action: ${error.message}`, 'error');
                console.error(`[UltraVehicleCard] Error in perform-action:`, error);
              });
          } else {
            this._showToast('Invalid action configuration', 'error');
            console.error(`[UltraVehicleCard] Invalid action configuration:`, action);
          }
        } catch (e) {
          this._showToast(`Failed to perform action: ${e.message}`, 'error');
          console.error(`[UltraVehicleCard] Error in perform-action:`, e);
        }
        break;
      case 'trigger':
        const entityId = icon.entity;
        if (entityId) {
          const domain = entityId.split('.')[0];
          const state = this.hass.states[entityId]?.state; // Get current state
          let service: string | null = null;
          let serviceDomain = domain;

          switch (domain) {
            case 'automation':
              service = 'trigger';
              break;
            case 'script':
              service = 'turn_on';
              break;
            case 'button':
            case 'input_button': // Add input_button as well
              service = 'press';
              break;
            case 'lock':
              service = state === 'locked' ? 'unlock' : 'lock';
              break;
            // Potential future additions for other domains:
            // case 'cover':
            //   service = state === 'closed' ? 'open_cover' : 'close_cover';
            //   break;
            // case 'valve':
            //   service = state === 'closed' ? 'open_valve' : 'close_valve';
            //   break;
            default:
              // Log a warning for unsupported domains for the trigger action
              console.warn(
                `[UltraVehicleCard] Trigger action used on unsupported domain '${domain}' for entity ${entityId}. No action performed.`
              );
          }

          // Only call service if one was determined
          if (service && serviceDomain) {
            this.hass.callService(serviceDomain, service, { entity_id: entityId });
          } else if (!service) {
            // This handles the case where the domain was unsupported
            console.warn(
              `[UltraVehicleCard] No suitable service found for trigger action on ${entityId}`
            );
          }
        } else {
          console.warn(
            '[UltraVehicleCard] Trigger action called, but no entity defined for icon:',
            icon
          );
        }
        break;
      default:
        // Optional: Log an error for unhandled actions
        // console.error(`[UltraVehicleCard] Unhandled icon click action: ${icon.on_click_action}`);
        break;
    }
  }

  /**
   * Shows a toast notification
   * @param message The message to display
   * @param type The type of toast (success, error, or info)
   */
  private _showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // If this.config.show_action_toasts is not enabled, only show error messages
    if (type !== 'error' && this.config.show_action_toasts !== true) {
      return;
    }

    // Create the event
    const event = new CustomEvent('hass-notification', {
      detail: {
        message,
        dismissable: true,
        duration: type === 'error' ? 0 : 3000, // Don't auto-dismiss errors
        type,
      },
      bubbles: true,
      composed: true,
    });

    // Dispatch the event
    this.dispatchEvent(event);
  }

  /**
   * Opens a location map for the entity
   */
  private _openLocationMap(entityId: string) {
    const entityState = this.hass.states[entityId];
    if (!entityState) {
      this._showMoreInfo(entityId);
      return;
    }

    const attrs = entityState.attributes;
    let latitude: number | undefined = undefined;
    let longitude: number | undefined = undefined;

    // First check for standard latitude/longitude attributes
    if (attrs.latitude !== undefined && attrs.longitude !== undefined) {
      latitude = attrs.latitude;
      longitude = attrs.longitude;
    }
    // Then check for the "Location" attribute which may contain coordinates as "lat, lon"
    else if (attrs.Location !== undefined) {
      // Check if Location is already an array
      if (Array.isArray(attrs.Location)) {
        if (attrs.Location.length >= 2) {
          const lat = parseFloat(attrs.Location[0]);
          const lon = parseFloat(attrs.Location[1]);
          if (!isNaN(lat) && !isNaN(lon)) {
            latitude = lat;
            longitude = lon;
          }
        }
      }
      // Try to parse "lat, lon" format if it's a string
      else if (typeof attrs.Location === 'string') {
        const parts = attrs.Location.split(',').map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          latitude = parts[0];
          longitude = parts[1];
        }
      }
    }

    // If we found coordinates in any format, show the map popup
    if (latitude !== undefined && longitude !== undefined) {
      this._mapPopupData = {
        latitude: latitude,
        longitude: longitude,
        title: attrs.friendly_name || entityId,
      };
    } else {
      // If no coordinates found, fall back to the standard HA dialog
      this._showMoreInfo(entityId);
    }
  }

  private _handleDragStart(event: DragEvent) {
    // Store the id or other information of the dragged icon
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', 'dragging-icon');
      // Add visual feedback
      if (event.target instanceof HTMLElement) {
        event.target.style.opacity = '0.5';
      }
    }
  }

  private _handleDragEnd(event: DragEvent) {
    // Reset any visual changes
    if (event.target instanceof HTMLElement) {
      event.target.style.opacity = '1';
    }
  }

  private _hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Handle different hex formats
    const hexColorRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const shortHexColorRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    // Handle 3-character hex (e.g., #abc -> #aabbcc)
    if (shortHexColorRegex.test(hex)) {
      const result = shortHexColorRegex.exec(hex);
      if (result) {
        return {
          r: parseInt(result[1] + result[1], 16),
          g: parseInt(result[2] + result[2], 16),
          b: parseInt(result[3] + result[3], 16),
        };
      }
    }

    // Handle 6-character hex
    const result = hexColorRegex.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      };
    }

    // Handle rgb() or rgba() format
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d\.]+)?\)$/i;
    const rgbResult = rgbRegex.exec(hex);
    if (rgbResult) {
      return {
        r: parseInt(rgbResult[1], 10),
        g: parseInt(rgbResult[2], 10),
        b: parseInt(rgbResult[3], 10),
      };
    }

    return null;
  }

  private _getZoneInfo(
    locationEntityId: string
  ): { zoneName: string; zoneIcon: string | null } | null {
    if (!locationEntityId || !this.hass.states[locationEntityId]) {
      return null;
    }

    const entityState = this.hass.states[locationEntityId];
    if (!entityState?.attributes?.latitude || !entityState?.attributes?.longitude) {
      return null; // No location data available
    }

    // Check against zones
    const zoneEntities = Object.keys(this.hass.states).filter(id => id.startsWith('zone.'));
    for (const zoneId of zoneEntities) {
      const zone = this.hass.states[zoneId];
      if (
        zone?.attributes?.latitude &&
        zone?.attributes?.longitude &&
        Math.abs(zone.attributes.latitude - entityState.attributes.latitude) < 0.0001 &&
        Math.abs(zone.attributes.longitude - entityState.attributes.longitude) < 0.0001
      ) {
        // Get zone icon, default to map-marker if not available
        let zoneIcon = zone.attributes.icon || null;

        // Handle special case for Home zone which may not have an explicit icon
        if (!zoneIcon && zoneId === 'zone.home') {
          zoneIcon = 'mdi:home';
        }

        return {
          zoneName: zone.attributes.friendly_name || zone.attributes.name || zoneId.split('.')[1],
          zoneIcon: zoneIcon,
        };
      }
    }

    return null;
  }

  private _renderVehicleInfo(sectionStyle: string = '') {
    // Prioritize new info_rows if they exist
    if (this.config.info_rows && this.config.info_rows.length > 0) {
      return this._renderInfoRowsFromConfig(sectionStyle);
    }

    // Fallback to old rendering method if info_rows is not configured
    const showLocation =
      this.config.show_location !== false &&
      this.config.location_entity &&
      this.hass.states[this.config.location_entity] !== undefined;

    const showMileage =
      this.config.show_mileage !== false &&
      this.config.mileage_entity &&
      this.hass.states[this.config.mileage_entity] !== undefined;

    const showCarState =
      this.config.show_car_state !== false &&
      this.config.car_state_entity &&
      this.hass.states[this.config.car_state_entity] !== undefined;

    const showIcons = this.config.show_info_icons !== false;

    if (!showLocation && !showMileage && !showCarState) {
      return html``;
    }

    const locationValue = showLocation
      ? this._formatValue(
          this.hass.states[this.config.location_entity!].state,
          this.config.location_entity
        )
      : '';

    const zoneInfo = showLocation ? this._getZoneInfo(this.config.location_entity!) : null;
    const locationIcon = zoneInfo?.zoneIcon || 'mdi:map-marker';

    const mileageValue = showMileage
      ? this._formatValue(
          this.hass.states[this.config.mileage_entity!].state,
          this.config.mileage_entity
        )
      : '';

    const carStateValue = showCarState
      ? this._formatValue(
          this.hass.states[this.config.car_state_entity!].state,
          this.config.car_state_entity
        )
      : '';

    const locationTextStyle = this.config.location_text_size
      ? `font-size: ${
          typeof this.config.location_text_size === 'number'
            ? `${this.config.location_text_size}px`
            : this.config.location_text_size
        };`
      : '';

    const mileageTextStyle = this.config.mileage_text_size
      ? `font-size: ${
          typeof this.config.mileage_text_size === 'number'
            ? `${this.config.mileage_text_size}px`
            : this.config.mileage_text_size
        };`
      : '';

    const carStateTextStyle = this.config.car_state_text_size
      ? `font-size: ${
          typeof this.config.car_state_text_size === 'number'
            ? `${this.config.car_state_text_size}px`
            : this.config.car_state_text_size
        };`
      : '';

    const infoLayoutStyle = showLocation && showMileage ? '' : 'justify-content: center;';

    return html`
      <div class="vehicle-info-container" style="${sectionStyle}">
        <div class="vehicle-info-top" style="${infoLayoutStyle}">
          ${showLocation
            ? html`
                <div
                  class="info-item-with-icon"
                  @click=${() => this._showMoreInfo(this.config.location_entity!)}
                >
                  ${showIcons
                    ? html`
                        <ha-icon
                          icon="${locationIcon}"
                          style="${this.config.location_icon_color
                            ? `color: ${this.config.location_icon_color};`
                            : ''}"
                        ></ha-icon>
                      `
                    : ''}
                  <span
                    style="${this.config.location_text_color
                      ? `color: ${this.config.location_text_color};`
                      : ''}${locationTextStyle}"
                    >${locationValue}</span
                  >
                </div>
              `
            : ''}
          ${showMileage
            ? html`
                <div
                  class="info-item-with-icon"
                  @click=${() => this._showMoreInfo(this.config.mileage_entity!)}
                >
                  ${showIcons
                    ? html`
                        <ha-icon
                          icon="mdi:speedometer"
                          style="${this.config.mileage_icon_color
                            ? `color: ${this.config.mileage_icon_color};`
                            : ''}"
                        ></ha-icon>
                      `
                    : ''}
                  <span
                    style="${this.config.mileage_text_color
                      ? `color: ${this.config.mileage_text_color};`
                      : ''}${mileageTextStyle}"
                    >${mileageValue}</span
                  >
                </div>
              `
            : ''}
        </div>

        ${showCarState
          ? html`
              <div
                class="info-item-status"
                @click=${() => this._showMoreInfo(this.config.car_state_entity!)}
                style="cursor: pointer; ${this.config.car_state_text_color
                  ? `color: ${this.config.car_state_text_color};`
                  : ''}${carStateTextStyle}"
              >
                <span>${carStateValue}</span>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _computeImageStyle(
    width?: number,
    crop?: { top: number; right: number; bottom: number; left: number }
  ) {
    const styles = [];

    // Always apply width first if specified - now uses max-width: none to prevent constraints
    if (width !== undefined) {
      styles.push(`width: ${width}%;`);
      styles.push(`height: auto;`);
      styles.push(`max-width: none;`); // This is key to allow widths over 100%
      styles.push(`object-fit: contain;`); // Ensure the image maintains its aspect ratio
    }

    // Only apply crop margins if they're actually defined and at least one value is non-zero
    if (crop) {
      // We'll handle all crop values, but only add overflow: hidden to container
      if (crop.top !== 0) styles.push(`margin-top: ${crop.top}px;`);
      if (crop.right !== 0) styles.push(`margin-right: ${crop.right}px;`);
      if (crop.bottom !== 0) styles.push(`margin-bottom: ${crop.bottom}px;`);
      if (crop.left !== 0) styles.push(`margin-left: ${crop.left}px;`);
    }

    return styles.join(' ');
  }

  private _normalizeState(state: string | undefined): string {
    if (!state) return '';
    return state.toLowerCase().replace(/\s+/g, '_');
  }

  private _renderBarLabels(bar: BarConfig) {
    // First check the conditions for left and right sides
    const showLeftSide = bar.show_left !== false && this._checkBarSideCondition(bar.left_condition);
    const showRightSide =
      bar.show_right !== false && this._checkBarSideCondition(bar.right_condition);

    // If both sides are hidden, return nothing
    if (!showLeftSide && !showRightSide) {
      return html``;
    }

    // Process left value based on template mode or entity value
    let leftValue = '';
    if (showLeftSide) {
      if (bar.left_template_mode && bar.left_template) {
        // Use template mode to get value
        leftValue = this._processBarTemplate(bar, 'left');
      } else if (bar.left_entity) {
        // Use normal entity formatting
        leftValue = this._formatValue(this.hass.states[bar.left_entity]?.state, bar.left_entity);
      }
    }

    // Process right value based on template mode or entity value
    let rightValue = '';
    if (showRightSide) {
      if (bar.right_template_mode && bar.right_template) {
        // Use template mode to get value
        rightValue = this._processBarTemplate(bar, 'right');
      } else if (bar.right_entity) {
        // Use normal entity formatting
        rightValue = this._formatValue(this.hass.states[bar.right_entity]?.state, bar.right_entity);
      }
    }

    // Get friendly names for titles if not explicitly set
    const getFriendlyName = (entityId: string): string => {
      if (!entityId || !this.hass.states[entityId]) return '';
      return (
        this.hass.states[entityId]?.attributes?.friendly_name || entityId.split('.').pop() || ''
      );
    };

    // Truncate text to keep layout consistent
    const truncateText = (text: string, maxLength = 15): string => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // Use friendly name for left title if not set
    const leftTitle =
      bar.left_title || (showLeftSide && bar.left_entity ? getFriendlyName(bar.left_entity) : '');

    // Use friendly name for right title if not set
    const rightTitle =
      bar.right_title ||
      (showRightSide && bar.right_entity ? getFriendlyName(bar.right_entity) : '');

    // Determine label alignment
    const labelAlignment = bar.alignment || 'space-between';

    // Get colors
    const leftTextColor = bar.left_text_color || 'var(--secondary-text-color)';
    const rightTextColor = bar.right_text_color || 'var(--secondary-text-color)';
    const leftTitleColor = bar.left_title_color || 'var(--secondary-text-color)';
    const rightTitleColor = bar.right_title_color || 'var(--secondary-text-color)';

    // Get sizes
    const leftTitleSize = bar.left_title_size ? `${bar.left_title_size}px` : 'inherit';
    const leftTextSize = bar.left_text_size ? `${bar.left_text_size}px` : 'inherit';
    const rightTitleSize = bar.right_title_size ? `${bar.right_title_size}px` : 'inherit';
    const rightTextSize = bar.right_text_size ? `${bar.right_text_size}px` : 'inherit';

    return html`
      <div class="bar-labels" style="justify-content: ${labelAlignment};">
        ${showLeftSide
          ? html`
              <div
                class="bar-label left"
                @click=${() => bar.left_entity && this._showMoreInfo(bar.left_entity)}
              >
                ${leftTitle
                  ? html`<span
                      class="label-title"
                      style="color: ${leftTitleColor}; font-size: ${leftTitleSize};"
                      >${truncateText(leftTitle)}${leftValue ? ':' : ''}</span
                    >`
                  : ''}
                ${leftValue
                  ? html`<span
                      class="label-value"
                      style="color: ${leftTextColor}; font-size: ${leftTextSize};"
                      >${leftValue}</span
                    >`
                  : ''}
              </div>
            `
          : ''}
        ${showRightSide
          ? html`
              <div
                class="bar-label right"
                @click=${() => bar.right_entity && this._showMoreInfo(bar.right_entity)}
              >
                ${rightTitle
                  ? html`<span
                      class="label-title"
                      style="color: ${rightTitleColor}; font-size: ${rightTitleSize};"
                      >${truncateText(rightTitle)}${rightValue ? ':' : ''}</span
                    >`
                  : ''}
                ${rightValue
                  ? html`<span
                      class="label-value"
                      style="color: ${rightTextColor}; font-size: ${rightTextSize};"
                      >${rightValue}</span
                    >`
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Process bar template and return the rendered result
   * Similar to how templates are handled for icons
   */
  private _processBarTemplate(bar: BarConfig, side: 'left' | 'right'): string {
    if (!this._templateService) {
      return '';
    }

    const entity = side === 'left' ? bar.left_entity : bar.right_entity;
    const template = side === 'left' ? bar.left_template : bar.right_template;

    if (!entity || !template) return '';

    // Create a consistent template key
    const templateKey = `bar_${side}_${entity}_${template}`;

    // Check if we already have a template result string
    if (this.hass.__uvc_template_strings && this.hass.__uvc_template_strings[templateKey]) {
      return this.hass.__uvc_template_strings[templateKey];
    }

    // Subscribe to template if not already subscribed
    if (!this._templateService.hasTemplateSubscription(templateKey)) {
      this._templateService.subscribeToTemplate(template, templateKey, () => this.requestUpdate());
    }

    // Return empty string while waiting for template to render
    return this.hass.__uvc_template_strings?.[templateKey] || '';
  }

  // Add helper method for showing more-info dialog
  private _showMoreInfo(entityId: string) {
    const event = new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  // Run initial setup and migrations when the element is first rendered
  firstUpdated() {
    // Wait a short moment to ensure the card is fully initialized
    setTimeout(() => {
      // Run the migration
      this._migrateBarsToIndividual();

      // Force a render to ensure everything displays correctly
      this._forceFullRender();

      // Check if any bar is missing from sections_order but exists in bars array
      if (this.config?.bars?.length > 0 && this.config.sections_order) {
        const barCount = this.config.bars.length;
        const sectionBarCount = this.config.sections_order.filter(s => s.startsWith('bar_')).length;

        // If we have bars that aren't in sections_order, force another migration attempt
        if (barCount > sectionBarCount) {
          this._migrateBarsToIndividual();
        }
      }
    }, 100);
  }

  // Setup when the element is connected to the DOM
  connectedCallback() {
    super.connectedCallback();

    // Initialize template service
    if (this.hass && !this._templateService) {
      this._templateService = new TemplateService(this.hass);
    }

    // Set up a mutation observer to watch for style changes
    this._setupRefreshInterval();

    // Add event listener for force-gradient-refresh
    this.addEventListener(
      'force-gradient-refresh',
      this._handleForceGradientRefresh as EventListener
    );

    // Listen for config-changed events to immediately update gradients
    // REMOVED: document.addEventListener('config-changed', this._handleConfigChanged);

    // Add a small delay to ensure initial gradient rendering
    setTimeout(() => {
      if (this.config?.bars?.some(bar => bar.use_gradient)) {
        this._forceFullRender();
      }
      // Add a delayed update shortly after connection to help with formatting initialization
      this.requestUpdate();
    }, 100);

    // Add an additional refresh after a longer delay for cases when the DOM is slow to update
    setTimeout(() => {
      if (this.config?.bars?.some(bar => bar.use_gradient)) {
        this._forceFullRender();
      }
    }, 1000);
  }

  // Clean up when the element is disconnected
  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up template service
    if (this._templateService) {
      this._templateService.unsubscribeAllTemplates();
    }

    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = undefined;
    }

    // Clean up template subscriptions - kept for backward compatibility
    this._unsubscribeAllTemplates();

    // Clear confirmation tracking state
    this._iconsAwaitingConfirmation.clear();

    // Remove any pending confirmation cancel listeners
    this._confirmationCancelListeners.forEach((listener, key) => {
      document.removeEventListener('click', listener);
    });
    this._confirmationCancelListeners.clear();

    // Remove event listeners
    this.removeEventListener(
      'force-gradient-refresh',
      this._handleForceGradientRefresh as EventListener
    );
  }

  // Handle force-gradient-refresh event
  private _handleForceGradientRefresh(event: Event) {
    const customEvent = event as CustomEvent;

    // Update timestamp with the one from the event
    this._lastRenderTime = customEvent.detail?.timestamp || Date.now();

    // Force a more aggressive render with immediate and subsequent refreshes
    this._forceFullRender();

    // Add additional refresh phases with shorter intervals for more reliable updates
    const additionalRefreshes = [10, 25, 50, 100, 500];
    additionalRefreshes.forEach(delay => {
      setTimeout(() => {
        this._lastRenderTime = Date.now();
        this.requestUpdate();

        // Dispatch a custom event that the editor can listen for to know the update is complete
        this.dispatchEvent(
          new CustomEvent('gradient-update-complete', {
            bubbles: true,
            composed: true,
            detail: {
              timestamp: this._lastRenderTime,
              config: this.config,
            },
          })
        );
      }, delay);
    });
  }

  private _refreshInterval: number | undefined;

  // Set up an interval to refresh animation and gradient states
  private _setupRefreshInterval() {
    // Clear any existing interval
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }

    // Check every second but ONLY for animations
    // Image updates are now handled through the updated() lifecycle method
    this._refreshInterval = window.setInterval(() => {
      // Check if we have any bars with animations that need state checking
      const needsUpdate = this.config.bars?.some(bar => {
        const animationEntity = bar.animation_entity || bar.action_animation_entity;
        const animationState = bar.animation_state || bar.action_animation_state;
        const animationType = bar.animation_type || bar.action_animation;

        if (animationEntity && animationState && animationType && animationType !== 'none') {
          const entity = this.hass.states[animationEntity];
          // If entity exists and matches animation state, we need to update
          return entity && entity.state === animationState;
        }
        return false;
      });

      // Only update for animations, not for image entities
      if (needsUpdate) {
        this._lastRenderTime = Date.now();
        this.requestUpdate();
      }
    }, 1000);
  }

  // Map of entity IDs to their last known state for efficient change detection
  private _entityStates: Map<string, string> = new Map();
  // Map of entity IDs to their timestamp-appended image URLs
  private _entityImageUrls: Map<string, string> = new Map();

  // This method gets called when properties change
  protected updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // If hass changed, update the template service
    if (changedProperties.has('hass')) {
      // Initialize template service if needed or update existing one
      if (!this._templateService && this.hass) {
        this._templateService = new TemplateService(this.hass);
      } else if (this._templateService && this.hass) {
        this._templateService.updateHass(this.hass);
      }
    }

    // Force render when config changes
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      // Update timestamp for consistent rendering
      this._lastRenderTime = Date.now();

      // Check if image entities have changed
      if (changedProperties.has('hass')) {
        const oldHass = changedProperties.get('hass');
        let imageEntitiesChanged = false;

        // Check vehicle image entity
        if (this.config.vehicle_image_type === 'entity' && this.config.vehicle_image_entity) {
          const entityId = this.config.vehicle_image_entity;
          const oldState = oldHass?.states[entityId]?.state;
          const newState = this.hass.states[entityId]?.state;

          // Track this entity's state for efficient change detection
          if (oldState !== newState) {
            this._entityStates.set(entityId, newState || '');

            // Generate a new URL with timestamp only when state changes
            if (this.hass.states[entityId]?.attributes?.entity_picture) {
              let imageUrl = this.hass.states[entityId].attributes.entity_picture;
              if (imageUrl.startsWith('/')) {
                const hassUrl = (this.hass as any).hassUrl ? (this.hass as any).hassUrl() : '';
                imageUrl = `${hassUrl}${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
              }
              // Add timestamp to force cache invalidation, but only when state changes
              this._entityImageUrls.set(
                entityId,
                `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}state=${Date.now()}`
              );
            }

            imageEntitiesChanged = true;
          }
        }

        // Check action image entity
        if (this.config.action_entity && this.config.action_state) {
          const actionEntity = this.config.action_entity;
          const oldActionState = oldHass?.states[actionEntity]?.state;
          const newActionState = this.hass.states[actionEntity]?.state;

          // If action state changed and we're using an entity image, update tracking
          if (
            oldActionState !== newActionState &&
            this.config.action_image_type === 'entity' &&
            this.config.action_image_entity
          ) {
            const imageEntityId = this.config.action_image_entity;
            this._entityStates.set(imageEntityId, this.hass.states[imageEntityId]?.state || '');

            // Generate a new URL with timestamp only when state changes
            if (this.hass.states[imageEntityId]?.attributes?.entity_picture) {
              let imageUrl = this.hass.states[imageEntityId].attributes.entity_picture;
              if (imageUrl.startsWith('/')) {
                const hassUrl = (this.hass as any).hassUrl ? (this.hass as any).hassUrl() : '';
                imageUrl = `${hassUrl}${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
              }
              // Add timestamp to force cache invalidation, but only when state changes
              this._entityImageUrls.set(
                imageEntityId,
                `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}state=${Date.now()}`
              );
            }

            imageEntitiesChanged = true;
          }
        }

        // Only force a re-render if image entities actually changed
        if (imageEntitiesChanged) {
          this.requestUpdate();
        }
      }

      // Force immediate style recalculation for bar elements
      if (this.shadowRoot) {
        setTimeout(() => {
          const barElements = this.shadowRoot?.querySelectorAll('.progress-bar-fill');
          if (barElements && barElements.length > 0) {
            barElements.forEach(bar => {
              if (bar instanceof HTMLElement) {
                // Force reflow by accessing offsetHeight (browser will recalculate styles)
                const reflow = bar.offsetHeight;

                // Ensure gradient attributes are correctly set
                const hasGradient = bar.getAttribute('has-gradient');
                const mode = bar.getAttribute('data-mode');

                if (hasGradient === 'true') {
                  // Make sure class-based styles are applied properly
                  if (mode === 'full') {
                    bar.style.backgroundSize = '100% 100%';
                    bar.style.backgroundPosition = '0% 0%';
                    bar.style.backgroundRepeat = 'no-repeat';
                  } else if (mode === 'value_based') {
                    bar.style.backgroundImage = 'none';
                  }
                }
              }
            });
          }
        }, 0);
      }
    }
  }

  // The following methods are replaced by the template service:

  // Delegate to template service
  private async _evaluateTemplate(template: string): Promise<boolean> {
    if (this._templateService) {
      return this._templateService.evaluateTemplate(template);
    }
    return false;
  }

  // Delegate to template service
  private async _subscribeToTemplate(template: string, templateKey: string): Promise<void> {
    if (this._templateService) {
      return this._templateService.subscribeToTemplate(template, templateKey, () =>
        this.requestUpdate()
      );
    }
  }

  // Delegate to template service
  private _parseTemplateResult(result: any, templateKey?: string): boolean {
    if (this._templateService) {
      return this._templateService.parseTemplateResult(result, templateKey);
    }
    return false;
  }

  // Delegate to template service
  private async _unsubscribeAllTemplates(): Promise<void> {
    if (this._templateService) {
      return this._templateService.unsubscribeAllTemplates();
    }
  }

  // Add function to render the custom map popup
  private _renderMapPopup() {
    if (!this._mapPopupData) {
      return html``;
    }

    const { latitude, longitude, title } = this._mapPopupData;

    // Get address from entity if possible
    const entityId = this._getEntityForCoordinates(latitude, longitude);
    let address = '';
    let formattedCoordinates = '';

    // Format coordinates to a more readable format
    formattedCoordinates = this._formatCoordinates(latitude, longitude);

    if (entityId && this.hass.states[entityId]) {
      const entity = this.hass.states[entityId];
      const attrs = entity.attributes;

      // Try to get address in this priority:
      // 1. The entity state if it looks like an address
      // 2. formatted_address attribute
      // 3. Name attribute + Locality + postal code if available
      if (
        entity.state &&
        !entity.state.match(/^\d+\.\d+,\s*-?\d+\.\d+$/) && // Not coordinate format
        entity.state.length > 5 &&
        !entity.state.match(/^(unavailable|unknown|none)$/i)
      ) {
        address = entity.state;
      } else if (attrs.formatted_address) {
        address = attrs.formatted_address;
      } else {
        // Build address from available attributes
        const components: string[] = [];
        if (attrs.Name) components.push(String(attrs.Name));
        if (attrs.Thoroughfare) components.push(String(attrs.Thoroughfare));
        if (attrs.Locality) components.push(String(attrs.Locality));
        if (attrs.Administrative_Area) components.push(String(attrs.Administrative_Area));
        if (attrs.Postal_Code) components.push(String(attrs.Postal_Code));
        if (attrs.Country) components.push(String(attrs.Country));

        if (components.length > 0) {
          address = components.join(', ');
        }
      }
    }

    // If we couldn't find an address, use the formatted coordinates
    if (!address) {
      address = formattedCoordinates;
    }

    // Create a Google Maps embed URL without API key
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

    return html`
      <div class="map-popup-overlay" @click=${this._closeMapPopup}>
        <div class="map-popup-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="map-popup-header">
            <div class="map-popup-title">
              <h3>${title}</h3>
              <div class="map-popup-address">${address}</div>
            </div>
            <ha-icon-button @click=${this._closeMapPopup}>
              <ha-icon icon="mdi:close"></ha-icon>
            </ha-icon-button>
          </div>

          <div style="height: 450px; width: 100%; position: relative;">
            <iframe
              width="100%"
              height="100%"
              frameborder="0"
              style="border:0; position: relative; z-index: 1;"
              src="${googleMapsUrl}"
              allowfullscreen
            ></iframe>
          </div>
          <div class="map-popup-footer">
            <a
              href="https://www.google.com/maps?q=${latitude},${longitude}"
              target="_blank"
              rel="noopener noreferrer"
            >
              View larger map
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Helper to format coordinates into a readable string
  private _formatCoordinates(latitude: number, longitude: number): string {
    // Format to 6 decimal places
    const lat = Math.abs(latitude).toFixed(6);
    const lng = Math.abs(longitude).toFixed(6);

    // Add cardinal directions
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lngDir = longitude >= 0 ? 'E' : 'W';

    return `${lat}° ${latDir}, ${lng}° ${lngDir}`;
  }

  // Helper to find the entity that matches the coordinates
  private _getEntityForCoordinates(latitude: number, longitude: number): string | null {
    // Look through all entities to find one with matching coordinates
    for (const entityId in this.hass.states) {
      const entity = this.hass.states[entityId];
      const attrs = entity.attributes;

      // Check for exact coordinate match
      if (attrs.latitude === latitude && attrs.longitude === longitude) {
        return entityId;
      }

      // Check for Location attribute that's an array matching the coordinates
      if (
        Array.isArray(attrs.Location) &&
        attrs.Location.length >= 2 &&
        Math.abs(parseFloat(attrs.Location[0]) - latitude) < 0.0001 &&
        Math.abs(parseFloat(attrs.Location[1]) - longitude) < 0.0001
      ) {
        return entityId;
      }
    }
    return null;
  }

  // Helper to detect dark mode for the map
  private _isDarkMode(): boolean {
    if (this.shadowRoot) {
      // Check for dark mode based on Home Assistant's theme
      const backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--card-background-color')
        .trim();
      // If background is dark, we're in dark mode
      if (backgroundColor) {
        const rgb = this._hexToRgb(backgroundColor);
        if (rgb) {
          // Simple brightness formula - if less than 128, it's dark
          return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 < 128;
        }
      }
    }
    return false;
  }

  // Add method to close the popup
  private _closeMapPopup() {
    this._mapPopupData = null;
  }

  // NEW: Function to check conditional rendering
  private _shouldRenderSection(sectionId: string): boolean {
    if (!this.config || !this.hass || !this._templateService) {
      return true; // Default to true if essential parts are missing
    }

    const conditions = this.config.section_conditions;
    if (!conditions) {
      return true; // No conditions, show section
    }

    let condition: SectionCondition | undefined = undefined;
    let isFallbackCondition = false; // Flag to indicate if we used the collective fallback

    // Prioritize individual bar_X condition
    if (sectionId.startsWith('bar_')) {
      condition = conditions[sectionId]; // Check for specific bar_X condition first
    }

    // If no specific bar_X condition, or if it's not a bar_X section, check for general sectionId or collective 'bars'
    if (!condition && conditions[sectionId]) {
      condition = conditions[sectionId];
    } else if (!condition && sectionId.startsWith('bar_') && conditions.bars) {
      // Fallback to collective 'bars' condition ONLY if no individual bar_X condition was found
      condition = conditions.bars;
      isFallbackCondition = true; // Mark that we are using the fallback
    }

    // Default: Assume the section should be shown unless a condition hides it.
    let conditionMet = true;

    if (condition) {
      // *** NEW: Check for invalid fallback condition ***
      // If this is the collective 'bars' fallback condition AND it has no entity, ignore it (default to show).
      if (isFallbackCondition && !condition.entity) {
        // console.log(`[UltraVehicleCard] Ignoring invalid collective 'bars' fallback condition (no entity) for ${sectionId}. Defaulting to SHOW.`);
        conditionMet = true;
      }
      // *** END NEW Check ***
      else {
        // Proceed with normal condition evaluation only if it's not an ignored invalid fallback
        const entityId = condition.entity;
        const requiredState = condition.state;
        const conditionType = condition.type || 'show'; // Default to 'show'

        if (entityId) {
          // --- This block remains the same: Evaluate condition based on entity state ---
          const entityState = this._getEntityState(entityId);
          let isStateMatch = false;

          if (requiredState.startsWith('/') && requiredState.endsWith('/')) {
            // Regex match
            try {
              const regex = new RegExp(requiredState.slice(1, -1));
              isStateMatch = regex.test(entityState || '');
            } catch (e) {
              console.warn(
                `[UltraVehicleCard] Invalid regex in condition for ${sectionId}: ${requiredState}`,
                e
              );
              isStateMatch = false;
            }
          } else {
            // Exact string match (case-insensitive for common states)
            const commonStates = [
              'on',
              'off',
              'true',
              'false',
              'unavailable',
              'unknown',
              'charging',
              'not_charging',
              'discharging',
              'idle',
              'parked',
            ];
            if (
              entityState &&
              commonStates.includes(requiredState.toLowerCase()) &&
              commonStates.includes(entityState.toLowerCase())
            ) {
              isStateMatch = entityState.toLowerCase() === requiredState.toLowerCase();
            } else {
              isStateMatch = entityState === requiredState;
            }
          }

          if (conditionType === 'show') {
            conditionMet = isStateMatch;
          } else if (conditionType === 'hide') {
            conditionMet = !isStateMatch;
          } else {
            // type 'none' or invalid
            conditionMet = true;
          }
        } else {
          // --- This block remains the same: Handle condition with no entity (but only if it wasn't an invalid fallback) ---
          if (conditionType === 'show') {
            conditionMet = !requiredState;
          } else if (conditionType === 'hide') {
            conditionMet = !!requiredState;
          } else {
            // type 'none'
            conditionMet = true;
          }
        }
      }
    }

    // console.log(`[UltraVehicleCard] Section: ${sectionId}, Condition Source: ${condition ? (isFallbackCondition ? 'collective bars (fallback)' : 'specific') : 'none'}, Result: ${conditionMet}`);
    // *** NEW LOGGING ***
    // Remove this debugging console.log that outputs condition check results
    // console.log(
    //   `[UVC Condition Check] Section: ${sectionId}, Result: ${conditionMet}, Used Fallback: ${isFallbackCondition}, Fallback Ignored (No Entity): ${isFallbackCondition && !condition?.entity}`
    // );
    // *** END LOGGING ***
    return conditionMet;
  }

  // Helper method to cancel an icon confirmation
  private _cancelConfirmation(iconKey: string, showMessage: boolean = true): void {
    // Remove from the awaiting confirmation map
    this._iconsAwaitingConfirmation.delete(iconKey);

    // Remove the document click listener if it exists
    if (this._confirmationCancelListeners.has(iconKey)) {
      document.removeEventListener('click', this._confirmationCancelListeners.get(iconKey)!);
      this._confirmationCancelListeners.delete(iconKey);
    }

    // Force update to reflect UI changes
    this.requestUpdate();

    // Show cancellation message if requested
    if (showMessage) {
      this._showToast('Confirmation cancelled', 'info');
    }
  }

  // Add this method after the _shouldRenderSection method

  // Check if a bar side should be shown based on its condition
  private _checkBarSideCondition(condition: SectionCondition | undefined): boolean {
    if (!condition || condition.type === 'none' || !condition.entity) {
      return true; // No condition or type is 'none', show the side
    }

    const entityState = this.hass.states[condition.entity]?.state;

    if (entityState === undefined) {
      return true; // Entity not found, default to showing
    }

    const conditionState = String(condition.state).toLowerCase();
    const actualState = String(entityState).toLowerCase();
    const statesMatch = actualState === conditionState;

    // Return based on condition type (show/hide)
    if (condition.type === 'show') {
      return statesMatch;
    } else if (condition.type === 'hide') {
      return !statesMatch;
    }

    return true; // Default to showing if invalid condition type
  }

  private _processPercentageTemplate(template: string): number | null {
    if (!this._templateService || !template) {
      return null;
    }

    // Create a consistent template key for caching
    const templateKey = `percentage_${template}`;

    // Check if we have a template result already
    if (this._templateService.hasTemplateSubscription(templateKey)) {
      const result = this._templateService.getTemplateResult(templateKey);
      if (result !== undefined) {
        // Try to convert the result to a number
        const numResult = parseFloat(String(result));
        if (!isNaN(numResult)) {
          return numResult;
        }
      }
    }

    // Subscribe to the template for future updates
    this._templateService.subscribeToTemplate(template, templateKey, () => {
      this.requestUpdate();
    });

    return null;
  }

  // Method to render info rows from config
  private _renderInfoRowsFromConfig(sectionStyle: string = ''): TemplateResult {
    if (!this.config.info_rows || !this.config.info_rows.length) {
      return html``;
    }

    return html`
      <div class="info-rows-container" style="${sectionStyle}">
        ${this.config.info_rows.map(row => this._renderSingleInfoRow(row))}
      </div>
    `;
  }

  // Method to render a single info row
  private _renderSingleInfoRow(row: InfoRowConfig): TemplateResult {
    if (!row.info_entities || row.info_entities.length === 0) {
      return html``;
    }

    const width = row.width || '100';
    const alignment = row.alignment || 'center';
    const spacing = row.spacing || 'medium';
    const verticalAlignment = row.vertical_alignment || 'center';
    const allowWrap = row.allow_wrap === true;
    const columns = row.columns || 0;

    // Convert spacing string to pixel value
    const spacingValue =
      {
        none: '0',
        small: '8px',
        medium: '16px',
        large: '24px',
      }[spacing] || '16px';

    // Create row style
    let rowStyle = `width: ${width}%; gap: ${spacingValue}; justify-content: ${alignment}; align-items: ${verticalAlignment};`;

    // Set up grid if columns are specified
    if (columns > 0) {
      rowStyle += `display: grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr));`;
    } else {
      rowStyle += `display: flex; flex-wrap: ${allowWrap ? 'wrap' : 'nowrap'};`;
    }

    // Render the row header if enabled
    const showHeader = row.show_row_header !== false && row.row_header;
    const headerStyle = row.row_header_size ? `font-size: ${row.row_header_size}px;` : '';
    const headerColor = row.row_header_color ? `color: ${row.row_header_color};` : '';

    return html`
      ${showHeader
        ? html`
            <div class="section-title" style="${headerStyle} ${headerColor}">${row.row_header}</div>
          `
        : ''}
      <div class="info-row-item" style="${rowStyle}">
        ${row.info_entities.map(entity => this._renderSingleInfoEntity(entity))}
      </div>
    `;
  }

  // Method to render a single info entity
  // NOTE: This uses a horizontal layout (icon + text side by side) to match the original design
  // This matches how location/mileage info is displayed in the legacy format and in the first image
  private _renderSingleInfoEntity(entity: InfoEntityConfig): TemplateResult {
    if (!entity.entity || !this.hass.states[entity.entity]) {
      return html``;
    }

    const stateObj = this.hass.states[entity.entity];
    const showIcon = entity.show_icon !== false;
    const showName = entity.show_name !== false; // Restore original behavior: show by default unless explicitly false

    // Get formatted value
    let displayValue = '';
    if (entity.template_mode && entity.value_template) {
      // Handle template mode
      const templateKey = `info_entity_${entity.id}_${entity.entity}`;

      // Check if we already have a cached template result
      if (
        this._templateService &&
        this.hass.__uvc_template_strings &&
        this.hass.__uvc_template_strings[templateKey]
      ) {
        displayValue = this.hass.__uvc_template_strings[templateKey];
      }
      // Otherwise subscribe to the template
      else if (this._templateService) {
        this._templateService.subscribeToTemplate(entity.value_template, templateKey, () => {
          this.requestUpdate();
        });
      }
    } else {
      // Use standard formatting
      displayValue = this._formatValue(stateObj.state, entity.entity);
    }

    // Get styles
    const iconColor = entity.icon_color || 'var(--primary-color)';
    const nameColor = entity.name_color || 'var(--primary-text-color)';

    // Handle text color options
    let textColor = 'var(--primary-text-color)';
    if (entity.text_color === 'primary') {
      textColor = 'var(--primary-color)';
    } else if (entity.text_color === 'secondary') {
      textColor = 'var(--secondary-text-color)';
    } else if (entity.text_color === 'accent') {
      textColor = 'var(--accent-color)';
    } else if (entity.text_color === 'custom' && entity.custom_text_color) {
      textColor = entity.custom_text_color;
    } else if (typeof entity.text_color === 'string' && entity.text_color.startsWith('#')) {
      textColor = entity.text_color;
    }

    // Get sizes
    const iconSize = entity.icon_size ? `${entity.icon_size}px` : '24px';
    const nameSize = entity.name_size ? `${entity.name_size}px` : '14px';
    const textSize = entity.text_size ? `${entity.text_size}px` : '14px';

    // Style for the container - changed to horizontal layout
    const entityStyle = `
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 8px;
      min-width: 0;
    `;

    return html`
      <div
        class="info-entity-item"
        style="${entityStyle}"
        @click=${() => this._handleInfoEntityClick(entity)}
      >
        ${showIcon && entity.icon
          ? html`
              <ha-icon
                icon="${entity.icon}"
                style="color: ${iconColor}; --mdc-icon-size: ${iconSize}; margin-right: 8px;"
              ></ha-icon>
            `
          : ''}
        <div style="min-width: 0; overflow: hidden;">
          ${showName && entity.name
            ? html`
                <div style="font-size: ${nameSize}; color: ${nameColor}; margin-bottom: 2px;">
                  ${entity.name}
                </div>
              `
            : ''}
          <div
            style="font-size: ${textSize}; color: ${textColor}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;"
          >
            ${displayValue}
          </div>
        </div>
      </div>
    `;
  }

  // Handle click on info entity
  private _handleInfoEntityClick(entity: InfoEntityConfig) {
    if (!entity.entity) return;

    switch (entity.on_click_action) {
      case 'more-info':
        this._showMoreInfo(entity.entity);
        break;
      case 'navigate':
        if (entity.navigation_path) {
          // Navigate to the specified path
          const navigateEvent = new CustomEvent('location-changed', {
            detail: { replace: false },
            bubbles: true,
            composed: true,
          });
          window.history.pushState(null, '', entity.navigation_path);
          this.dispatchEvent(navigateEvent);
        }
        break;
      case 'url':
        if (entity.url) {
          window.open(entity.url, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'call-service':
        if (entity.service) {
          try {
            const [domain, service] = entity.service.split('.');
            let serviceData = {};

            if (typeof entity.service_data === 'string') {
              try {
                serviceData = JSON.parse(entity.service_data);
              } catch (e) {
                console.error(`Invalid service_data JSON for entity ${entity.entity}:`, e);
              }
            } else if (entity.service_data && typeof entity.service_data === 'object') {
              serviceData = entity.service_data;
            }

            this.hass.callService(domain, service, serviceData);
          } catch (e) {
            console.error(`Error calling service for entity ${entity.entity}:`, e);
          }
        }
        break;
      default:
        // Default to more-info if no action specified
        this._showMoreInfo(entity.entity);
        break;
    }
  }
}
