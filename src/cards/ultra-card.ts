import { LitElement, html, css, TemplateResult, PropertyValues, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  UltraCardConfig,
  CardModule,
  CardRow,
  CardColumn,
  TextModule,
  ImageModule,
  HoverEffectConfig,
} from '../types';
import { getModuleRegistry } from '../modules';
import { getImageUrl } from '../utils/image-upload';
import { logicService } from '../services/logic-service';
import { configValidationService } from '../services/config-validation-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { ucModulePreviewService } from '../services/uc-module-preview-service';
import { clockUpdateService } from '../services/clock-update-service';
import { ucCloudAuthService, CloudUser } from '../services/uc-cloud-auth-service';
import { ucVideoBgService } from '../services/uc-video-bg-service';
import { ucDynamicWeatherService } from '../services/uc-dynamic-weather-service';
import { ucBackgroundService } from '../services/uc-background-service';
import { ucNavigationService } from '../services/uc-navigation-service';
import { responsiveDesignService } from '../services/uc-responsive-design-service';
import { UcGestureService } from '../services/uc-gesture-service';
import { Z_INDEX } from '../utils/uc-z-index';
import { dbg3p } from '../utils/uc-debug';
import { computeBackgroundStyles } from '../utils/uc-color-utils';
import { generateCSSVariables } from '../utils/css-variable-utils';
import {
  ThirdPartyLimitService,
  computeCardInstanceId,
  getCurrentDashboardId,
} from '../pro/third-party-limit-service';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';
import { ucFavoriteColorsService } from '../services/uc-favorite-colors-service';

// Import editor at top level to ensure it's available
import '../editor/ultra-card-editor';
import { externalCardContainerService } from '../services/external-card-container-service';

@customElement('ultra-card')
export class UltraCard extends LitElement {
  private _hass?: HomeAssistant;

  @property({ attribute: false })
  public get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  public set hass(value: HomeAssistant | undefined) {
    const oldHass = this._hass;
    this._hass = value;

    // Only update external card containers if hass object reference changed
    // (HA creates new objects when state changes, so reference check is sufficient)
    if (value && value !== oldHass) {
      externalCardContainerService.setHass(value);
    }

    // Let Lit handle the property change for other updates
    this.requestUpdate('hass', oldHass);
  }
  @property({ attribute: false, type: Object }) public config?: UltraCardConfig;

  @state() private _moduleVisibilityState = new Map<string, boolean>();
  @state() private _animatingModules = new Set<string>();
  @state() private _rowVisibilityState = new Map<string, boolean>();
  @state() private _columnVisibilityState = new Map<string, boolean>();
  @state() private _animatingRows = new Set<string>();
  @state() private _animatingColumns = new Set<string>();
  @state() private _cloudUser: CloudUser | null = null;
  private _lastHassChangeTime = 0;
  private _templateUpdateListener?: (event: Event) => void;
  private _authListener?: (user: CloudUser | null) => void;
  /**
   * Flag to ensure module CSS is injected only once per card instance.
   */
  private _moduleStylesInjected = false;
  private _instanceId: string = '';
  private _limitUnsub?: () => void;
  private _isEditorPreviewCard = false;
  private _globalTransparencyListener?: () => void;
  private _globalTransparencyApplied = false;
  private _variablesBackupUnsub?: () => void;
  private _variablesBackupVersion = 0;

  connectedCallback(): void {
    super.connectedCallback();

    // Listen for global transparency changes
    this._globalTransparencyListener = () => {
      this._applyGlobalTransparency();
    };
    window.addEventListener(
      'ultra-card-global-transparency-changed',
      this._globalTransparencyListener
    );

    // Apply global transparency if already set
    this._applyGlobalTransparency();

    // Refresh preview detection once we're in the DOM
    const previewContext = this._detectEditorPreviewContext();
    if (previewContext !== this._isEditorPreviewCard) {
      this._isEditorPreviewCard = previewContext;
    }

    // Ensure a stable per-card instance id across remounts
    if (this._isEditorPreviewCard) {
      if (!this._instanceId || !this._instanceId.startsWith('uc-preview-')) {
        this._instanceId = this._generatePreviewInstanceId();
      }
    } else if (!this._instanceId || this._instanceId.startsWith('uc-preview-')) {
      const dashboardId = getCurrentDashboardId();
      const cards = Array.from(document.querySelectorAll('ultra-card')) as Element[];
      const index = Math.max(0, cards.indexOf(this));
      const persistKey = `uc_card_id_${dashboardId}:${index}`;
      let id = '';
      try {
        id = localStorage.getItem(persistKey) || '';
      } catch {}
      if (!id) {
        id = `uc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        try {
          localStorage.setItem(persistKey, id);
        } catch {}
      }
      this._instanceId = id;
    }

    this._applyInstanceIdToDataset();
    this._syncConfigMetadata();

    // Subscribe to third-party limit service changes to re-render immediately
    try {
      this._limitUnsub = ThirdPartyLimitService.onChange(() => {
        // Only update if we actually have 3rd party cards that might need lock status change
        const has3rdPartyCards = this.config?.layout?.rows?.some(row =>
          row.columns?.some(col => col.modules?.some(mod => mod.type === 'external_card'))
        );
        if (has3rdPartyCards) {
          this.requestUpdate();
        }
      });
    } catch {}

    // Inject combined CSS from all registered modules so that any module-specific
    // styles (e.g. icon animations) are available inside this card's shadow-root.
    // Without this, classes like `.icon-animation-pulse` will render but have no
    // effect because the corresponding keyframes are missing.
    this._injectModuleStyles();

    // Inject hover effect styles into this card's shadow root
    UcHoverEffectsService.injectHoverEffectStyles(this.shadowRoot!);

    // Check for integration auth and load cloud user
    this._loadCloudUser();

    // Set up clock update service to trigger re-renders for clock modules
    clockUpdateService.setUpdateCallback(() => {
      // Only update if we have animated clock modules
      const hasClockModules = this.config?.layout?.rows?.some(row =>
        row.columns?.some(col => col.modules?.some(mod => mod.type === 'animated_clock'))
      );

      if (hasClockModules) {
        this.requestUpdate();
      }
    });

    // === Custom Variables Backup/Restore System ===
    // Restores global variables from card config backup if localStorage was cleared
    this._setupVariablesBackup();

    // Listen for template updates from modules
    this._templateUpdateListener = (event: Event) => {
      // Check if we have any non-3rd party modules
      const hasNonExternalModules = this.config?.layout?.rows?.some(row =>
        row.columns?.some(col => col.modules?.some(mod => mod.type !== 'external_card'))
      );

      // If we only have 3rd party cards, skip all template updates
      if (!hasNonExternalModules) {
        return;
      }

      // Only update if the event is from a non-external module
      const detail = (event as CustomEvent).detail;
      if (detail?.moduleType === 'external_card') {
        return; // Skip updates from external cards
      }

      this.requestUpdate();
      // Update hover styles when configuration changes
      this._updateHoverEffectStyles();
    };
    window.addEventListener('ultra-card-template-update', this._templateUpdateListener);

    // React to preview flag toggles so open editor Save/Done updates unlocks immediately
    const previewListener = (e?: any) => {
      // Do not change registration on preview open/close, just re-render.
      // Registration is idempotent and deduped; keys are card-agnostic now.
      dbg3p('card:preview-flag', e?.detail);
      this.requestUpdate();
    };
    window.addEventListener('uc-preview-suppress-locks-changed', previewListener);
    // Store to remove later
    (this as any)._ucPreviewFlagListener = previewListener;

    // Listen for slider state changes (both on element and window for reliability)
    const sliderStateHandler = (e: Event) => {
      e.stopPropagation?.();
      this.requestUpdate();
    };
    this.addEventListener('slider-state-changed', sliderStateHandler);
    window.addEventListener('slider-state-changed', sliderStateHandler);

    // Set up auth listener to track pro status changes
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._authListener = (user: CloudUser | null) => {
      this._cloudUser = user;
      dbg3p('card:auth-changed');
      this.requestUpdate(); // Re-render when auth status changes
    };
    ucCloudAuthService.addListener(this._authListener);

    // Set up responsive scaling
    this._setupResponsiveScaling();

    // Only set up event listeners if feature is enabled
    if (this._isScalingEnabled()) {
      // Listen for visibility changes (edit mode exit/enter)
      this._visibilityChangeHandler = () => {
        // Hard reset first to native size, then schedule measurement
        this._forceResetScale();
        setTimeout(() => {
          this._lastMeasuredWidth = 0; // Reset to force recalculation
          this._scheduleScaleCheck();
        }, 150);
      };
      document.addEventListener('visibilitychange', this._visibilityChangeHandler);

      // Also check on window resize
      this._windowResizeHandler = () => {
        this._forceResetScale();
        this._lastMeasuredWidth = 0; // Reset to force recalculation
        this._scheduleScaleCheck();
      };
      window.addEventListener('resize', this._windowResizeHandler);
    }

    // Register video background modules with the service
    this._registerVideoBgModules();

    // Register dynamic weather modules with the service
    this._registerDynamicWeatherModules();
    this._registerBackgroundModules();
    this._registerNavigationModules();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._limitUnsub) {
      this._limitUnsub();
      this._limitUnsub = undefined;
    }

    // Clean up hover effect styles
    UcHoverEffectsService.removeHoverEffectStyles(this.shadowRoot!);

    // Clean up clock timers
    clockUpdateService.clearAll();

    // Clean up logic service and all template WebSocket subscriptions
    // This prevents subscription leaks that cause "Connection lost" errors
    logicService.cleanup();

    // Clean up event listener
    if (this._templateUpdateListener) {
      window.removeEventListener('ultra-card-template-update', this._templateUpdateListener);
    }

    // Clean up global transparency listener
    if (this._globalTransparencyListener) {
      window.removeEventListener(
        'ultra-card-global-transparency-changed',
        this._globalTransparencyListener
      );
    }

    // Remove preview flag listener
    try {
      const l = (this as any)._ucPreviewFlagListener;
      if (l) window.removeEventListener('uc-preview-suppress-locks-changed', l);
      (this as any)._ucPreviewFlagListener = undefined;
    } catch {}

    // Clean up auth listener
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
    }

    // Clean up variables backup listener
    if (this._variablesBackupUnsub) {
      this._variablesBackupUnsub();
      this._variablesBackupUnsub = undefined;
    }

    // Clean up responsive scaling observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    // Clean up visibility and resize handlers
    if (this._visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this._visibilityChangeHandler);
    }
    if (this._windowResizeHandler) {
      window.removeEventListener('resize', this._windowResizeHandler);
    }

    // Clear any pending timers
    if (this._scaleDebounceTimer) {
      clearTimeout(this._scaleDebounceTimer);
    }

    // Don't destroy containers on disconnect - they will be reused when reconnected
    // This prevents the flashing when switching views
    // Containers will be properly cleaned up when modules are actually removed

    // Unregister from 3rd party limit service immediately when card is removed
    try {
      if (this._instanceId) {
        ThirdPartyLimitService.unregister(this._instanceId);
      }
    } catch {}

    // Unregister video background modules
    this._unregisterVideoBgModules();

    // Unregister dynamic weather modules
    this._unregisterDynamicWeatherModules();

    // Unregister background modules so per-view backgrounds are cleaned up
    this._unregisterBackgroundModules();
    this._unregisterNavigationModules();
  }

  /**
   * Returns grid options for Home Assistant sections view resizing.
   * Ultra Card uses full width by default and lets content determine height naturally.
   */
  public getGridOptions() {
    // Ultra Card should take full width and size naturally by content
    // This maintains the card's original behavior while supporting HA resizing
    return {
      columns: 'full', // Take full width of section
      // Don't define rows - let the card size naturally based on content
      min_columns: 6, // Minimum 6 columns (half width) when resized
    };
  }

  /**
   * Setup custom variables backup/restore system
   * This ensures global variables survive browser cache clears by backing up to card config
   * NOTE: Backup is only saved when user explicitly saves through the editor
   * to avoid interfering with HA's card picker (automatic config-changed events were causing issues)
   */
  private _setupVariablesBackup(): void {
    // Skip for editor preview cards - they shouldn't manage backup
    if (this._isEditorPreviewCard) return;

    // 1. Check if we need to restore from backup (localStorage was cleared)
    if (ucCustomVariablesService.needsRestoreFromBackup() && this.config?._globalVariablesBackup) {
      ucCustomVariablesService.restoreFromBackup(this.config._globalVariablesBackup);
    }

    // 2. Initialize backup version from config (for tracking)
    if (this.config?._globalVariablesBackup?.version) {
      this._variablesBackupVersion = this.config._globalVariablesBackup.version;
    }

    // NOTE: We no longer dispatch config-changed events automatically for backup
    // This was causing HA's card picker to pre-select UC card when adding new cards
    // Backup is now only saved when user explicitly saves through the editor
  }

  protected willUpdate(changedProps: PropertyValues): void {
    // Check for integration auth when hass updates
    if (changedProps.has('hass') && this.hass) {
      this._loadCloudUser();
    }

    if (changedProps.has('config')) {
      // Only clear states if this is a substantial config change (not just internal updates)
      const oldConfig = changedProps.get('config') as UltraCardConfig;
      const newConfig = this.config;

      // Clear states only if layout structure actually changed
      if (!oldConfig || JSON.stringify(oldConfig.layout) !== JSON.stringify(newConfig?.layout)) {
        // Clear animation states when layout changes
        this._moduleVisibilityState.clear();
        this._animatingModules.clear();
        this._rowVisibilityState.clear();
        this._columnVisibilityState.clear();
        this._animatingRows.clear();
        this._animatingColumns.clear();
      }

      // Force re-render when config changes
      this.requestUpdate();

      // Reflect card-level styles to host CSS variables so HA wrappers honor them
      const radius = newConfig?.card_border_radius;
      if (radius !== undefined && radius !== null) {
        this.style.setProperty('--ha-card-border-radius', `${radius}px`);
      } else {
        this.style.removeProperty('--ha-card-border-radius');
      }
    }

    // Handle Home Assistant state changes for logic condition evaluation
    if (changedProps.has('hass')) {
      const currentTime = Date.now();

      // Update logic service with new hass instance
      if (this.hass) {
        logicService.setHass(this.hass);
      }

      // Check what types of modules we have
      const moduleTypes = new Set<string>();
      this.config?.layout?.rows?.forEach(row => {
        row.columns?.forEach(col => {
          col.modules?.forEach(mod => {
            if (mod.type) moduleTypes.add(mod.type);
          });
        });
      });

      const has3rdPartyCards = moduleTypes.has('external_card');
      const hasNonExternalModules = Array.from(moduleTypes).some(type => type !== 'external_card');

      // Only request update if we have logic conditions or non-3rd party modules that need updates
      const hasLogicConditions = this.config?.layout?.rows?.some(
        row =>
          row.display_conditions?.length > 0 ||
          row.columns?.some(
            col =>
              col.display_conditions?.length > 0 ||
              col.modules?.some(mod => mod.display_conditions?.length > 0)
          )
      );

      // If we ONLY have 3rd party cards and no logic conditions, skip Ultra Card re-render
      if (has3rdPartyCards && !hasNonExternalModules && !hasLogicConditions) {
        return; // 3rd party cards update via direct hass passthrough
      }

      // Throttle Ultra Card re-renders only when needed for logic or other modules
      const throttleDelay = has3rdPartyCards ? 500 : 100;
      const shouldUpdate = currentTime - this._lastHassChangeTime > throttleDelay;

      // Only update if we have a reason to (logic conditions or non-external modules)
      if (shouldUpdate && (hasLogicConditions || hasNonExternalModules)) {
        this._lastHassChangeTime = currentTime;
        // Request update to re-evaluate logic conditions or update non-3rd party modules
        this.requestUpdate();
      }
    }
  }

  public setConfig(config: UltraCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    // Validate and correct config
    const validationResult = configValidationService.validateAndCorrectConfig(config);

    if (!validationResult.valid) {
      // Config validation failed (silent)
      throw new Error(`Invalid configuration: ${validationResult.errors.join(', ')}`);
    }

    // Detect preview context EARLY so we can keep IDs stable in previews
    const isPreviewContext = this._detectEditorPreviewContext();

    // Check for duplicate module IDs and fix them (skip in previews to avoid ID churn)
    const uniqueIdCheck = configValidationService.validateUniqueModuleIds(
      validationResult.correctedConfig!
    );

    let finalConfig = validationResult.correctedConfig!;
    if (!isPreviewContext && !uniqueIdCheck.valid) {
      // Duplicate module IDs detected; fixing silently (only outside previews)
      finalConfig = configValidationService.fixDuplicateModuleIds(finalConfig);
    }

    // Suppress console info; warnings are surfaced in-editor only

    this.config = { ...finalConfig };

    // Register modules with ThirdPartyLimitService for global evaluation (non-breaking)
    try {
      const dashboardId = getCurrentDashboardId();
      const cardInstanceId =
        this._instanceId || `uc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      // Use the earlier-detected preview flag to keep behavior consistent
      this._isEditorPreviewCard = isPreviewContext;
      // Attach a non-enumerable flags for downstream resolution
      try {
        Object.defineProperty(this.config, '__ucInstanceId', {
          value: cardInstanceId,
          enumerable: false,
          configurable: true,
          writable: true,
        });
        Object.defineProperty(this.config, '__ucIsEditorPreview', {
          value: this._isEditorPreviewCard,
          enumerable: false,
          configurable: true,
          writable: true,
        });
      } catch {}

      // Skip registration entirely for editor preview cards so they never affect limits
      if (!this._isEditorPreviewCard && !(window as any).__UC_PREVIEW_SUPPRESS_LOCKS) {
        ThirdPartyLimitService.register(cardInstanceId, dashboardId, this.config);
      }
    } catch {}

    // Restore favorite colors from card config if localStorage is empty
    // This handles cases where localStorage was cleared but config has a backup
    try {
      if (
        this.config.favorite_colors &&
        Array.isArray(this.config.favorite_colors) &&
        this.config.favorite_colors.length > 0
      ) {
        const currentFavorites = ucFavoriteColorsService.getFavorites();
        if (currentFavorites.length === 0) {
          // localStorage is empty but config has favorites - restore them
          ucFavoriteColorsService.importFromConfig(this.config.favorite_colors);
        }
      }
    } catch {}

    // Request update to ensure re-render with new config
    this.requestUpdate();
  }

  /**
   * True if this Ultra Card is hosted inside HA's preview dialog (not the dashboard).
   * This traverses up the DOM to detect if we're inside hui-card-preview or hui-dialog-edit-card.
   * NOTE: We do NOT check hass.editMode because that's true for the entire dashboard when editing.
   */
  private _detectEditorPreviewContext(): boolean {
    try {
      const isTarget = (el: Element | null | undefined): boolean => {
        if (!el) return false;
        const tag = el.tagName?.toLowerCase?.();
        return tag === 'hui-card-preview' || tag === 'hui-dialog-edit-card';
      };

      let node: any = this as any;
      let depth = 0;
      while (node && depth < 30) {
        if (isTarget(node)) return true;
        const root = node.getRootNode?.();
        if (root && root.host) {
          node = root.host;
        } else {
          node = node.parentElement;
        }
        depth++;
      }
    } catch {}
    return false;
  }

  /**
   * Detect if the dashboard is in edit mode (not the card editor dialog).
   * Used to show visible placeholders for invisible modules (video_bg, etc.).
   */
  private _detectDashboardEditMode(): boolean {
    try {
      // Method 1: Check URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('edit') === '1') return true;

      // Method 2: Check HA's lovelace editMode property
      const root = document.querySelector('home-assistant') as any;
      const lovelace = root?.shadowRoot
        ?.querySelector('home-assistant-main')
        ?.shadowRoot?.querySelector('ha-drawer')
        ?.querySelector('partial-panel-resolver')
        ?.querySelector('ha-panel-lovelace')?.lovelace;
      if (lovelace?.editMode) return true;

      // Method 3: Check for edit mode UI elements
      if (document.querySelector('hui-editor-mode')) return true;

      // Method 4: Check if card has edit mode overlay
      if (document.querySelector('hui-card-edit-mode')) return true;

      return false;
    } catch {
      return false;
    }
  }

  private _syncConfigMetadata(): void {
    if (!this.config) return;
    try {
      Object.defineProperty(this.config, '__ucInstanceId', {
        value: this._instanceId,
        enumerable: false,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(this.config, '__ucIsEditorPreview', {
        value: this._isEditorPreviewCard,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    } catch {
      try {
        (this.config as any).__ucInstanceId = this._instanceId;
        (this.config as any).__ucIsEditorPreview = this._isEditorPreviewCard;
      } catch {}
    }
  }

  private _applyInstanceIdToDataset(): void {
    if (!this._instanceId) return;
    try {
      (this as any).dataset = (this as any).dataset || {};
      (this as any).dataset.ucInstanceId = this._instanceId;
    } catch {}
  }

  private _generatePreviewInstanceId(): string {
    return `uc-preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  // Tell Home Assistant this card has a visual editor
  public static getConfigElement(): HTMLElement {
    return document.createElement('ultra-card-editor');
  }

  // localStorage key for Pro setting to skip default modules
  private static readonly SKIP_DEFAULT_MODULES_KEY = 'ultra-card-pro-skip-default-modules';
  // Window-level fallback key when localStorage is full
  private static readonly SKIP_DEFAULT_MODULES_WINDOW_KEY = '__ultraCardSkipDefaultModules';

  /**
   * Check if user wants to skip default modules when creating new cards
   * Note: This setting is only accessible in the Pro tab, so only Pro users can enable it.
   * Checks window fallback, sessionStorage, and localStorage.
   */
  private static _shouldSkipDefaultModules(): boolean {
    // First check window fallback (takes priority - most recent in session)
    if ((window as any)[UltraCard.SKIP_DEFAULT_MODULES_WINDOW_KEY] === true) {
      return true;
    }
    // Check sessionStorage (separate quota, persists during browser session)
    try {
      if (sessionStorage.getItem(UltraCard.SKIP_DEFAULT_MODULES_KEY) === 'true') {
        return true;
      }
    } catch {
      /* ignore */
    }
    // Finally check localStorage
    try {
      return localStorage.getItem(UltraCard.SKIP_DEFAULT_MODULES_KEY) === 'true';
    } catch {
      return false;
    }
  }

  // Provide default configuration for new cards
  public static getStubConfig(): UltraCardConfig {
    // Check if Pro user wants empty card (no default modules)
    const skipDefaultModules = UltraCard._shouldSkipDefaultModules();

    const defaultModules: CardModule[] = skipDefaultModules
      ? []
      : [
          {
            type: 'text',
            text: 'Ultra Card',
            font_size: 24,
            color: '#2196f3',
            alignment: 'center',
          } as TextModule,
          {
            type: 'image',
            image_type: 'default',
            width: 100,
            height: 200,
            alignment: 'center',
            border_radius: 8,
            object_fit: 'cover',
          } as ImageModule,
        ];

    return {
      type: 'custom:ultra-card',
      card_background: 'var(--card-background-color, var(--ha-card-background, white))',
      card_border_radius: 12,
      card_border_color: 'var(--divider-color)',
      card_border_width: 1,
      card_padding: 16,
      layout: {
        rows: [
          {
            id: 'row1',
            columns: [
              {
                id: 'col1',
                modules: defaultModules,
              },
            ],
          },
        ],
      },
    };
  }

  protected render(): TemplateResult {
    if (!this.config || !this.hass) {
      return html`<div>Loading...</div>`;
    }

    const cardStyle = this._getCardStyle();

    // If no layout configured, show welcome message
    if (!this.config.layout || !this.config.layout.rows || this.config.layout.rows.length === 0) {
      return html`
        <div class="card-container" style="${cardStyle}">
          <div class="welcome-text">
            <h2>Ultra Card</h2>
            <p>Modular card builder for Home Assistant</p>
            <p>Configure using the visual editor</p>
          </div>
        </div>
      `;
    }

    // Check if card only contains video_bg, dynamic_weather or popup modules
    const allModules: CardModule[] = [];
    this.config.layout.rows.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          allModules.push(module);
        });
      });
    });

    // Modules that render view-wide effects or are invisible on the dashboard
    const invisibleTypes = ['video_bg', 'dynamic_weather', 'background', 'navigation'];
    const onlyInvisibleModules =
      allModules.length > 0 && allModules.every(m => invisibleTypes.includes(m.type));

    const onlyPopupModules = allModules.length > 0 && allModules.every(m => m.type === 'popup');

    // Check if all popups have invisible triggers (logic or page_load)
    const allPopupsInvisible =
      onlyPopupModules &&
      allModules.every(m => {
        const popup = m as any;
        const triggerType = popup.trigger_type || 'button';
        return triggerType === 'logic' || triggerType === 'page_load';
      });

    // Check if we're in the card editor (not just dashboard edit mode)
    const isInCardEditor = !!document.querySelector('hui-dialog-edit-card');

    // Check if the dashboard itself is in edit mode using multiple methods
    const isDashboardEditMode = (() => {
      try {
        // Method 1: Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('edit') === '1') return true;

        // Method 2: Check HA's lovelace editMode property
        const root = document.querySelector('home-assistant') as any;
        const lovelace = root?.shadowRoot
          ?.querySelector('home-assistant-main')
          ?.shadowRoot?.querySelector('ha-drawer')
          ?.querySelector('partial-panel-resolver')
          ?.querySelector('ha-panel-lovelace')?.lovelace;
        if (lovelace?.editMode) return true;

        // Method 3: Check for edit mode UI elements
        if (document.querySelector('hui-editor-mode')) return true;

        // Method 4: Check if card has edit mode overlay
        const hasEditOverlay = !!document.querySelector('hui-card-edit-mode');
        if (hasEditOverlay) return true;

        return false;
      } catch {
        return false;
      }
    })();

    // If only invisible modules (video_bg, dynamic_weather) and NOT in card editor AND NOT in dashboard edit mode, hide completely
    if (onlyInvisibleModules && !isInCardEditor && !isDashboardEditMode) {
      // Set attribute for CSS to hide the host element
      this.setAttribute('data-invisible', 'true');
      // Also set inline style to ensure it's hidden (backup for shadow DOM scenarios)
      this.style.display = 'none';
      this.style.height = '0';
      this.style.overflow = 'hidden';
      this.style.margin = '0';
      this.style.padding = '0';

      // Also try to hide parent hui-card element in sections view
      requestAnimationFrame(() => {
        try {
          let parent: HTMLElement | null = this.parentElement;
          let depth = 0;
          while (parent && depth < 10) {
            const tagName = parent.tagName?.toLowerCase();
            if (tagName === 'hui-card' || tagName === 'hui-section-card') {
              parent.style.display = 'none';
              parent.style.height = '0';
              parent.style.margin = '0';
              parent.style.padding = '0';
              break;
            }
            parent = parent.parentElement;
            depth++;
          }
        } catch (e) {
          // Ignore errors from DOM traversal
        }
      });

      return html``;
    } else {
      this.removeAttribute('data-invisible');
      // Remove inline styles if we're not invisible
      this.style.removeProperty('display');
      this.style.removeProperty('height');
      this.style.removeProperty('overflow');
      this.style.removeProperty('margin');
      this.style.removeProperty('padding');

      // Restore parent hui-card visibility if previously hidden
      requestAnimationFrame(() => {
        try {
          let parent: HTMLElement | null = this.parentElement;
          let depth = 0;
          while (parent && depth < 10) {
            const tagName = parent.tagName?.toLowerCase();
            if (tagName === 'hui-card' || tagName === 'hui-section-card') {
              parent.style.removeProperty('display');
              parent.style.removeProperty('height');
              parent.style.removeProperty('margin');
              parent.style.removeProperty('padding');
              break;
            }
            parent = parent.parentElement;
            depth++;
          }
        } catch (e) {
          // Ignore errors from DOM traversal
        }
      });
    }

    // If only popup modules with invisible triggers (logic/page_load) and NOT in card editor, render with display: contents (no visible container)
    if (allPopupsInvisible && !isInCardEditor) {
      return html`
        <div style="display: contents;">
          ${this.config.layout.rows.map(row => this._renderRow(row))}
        </div>
      `;
    }

    // If only popup modules with visible triggers and NOT in card editor, render without card-container wrapper
    // Popups need to render their triggers, but still need the card background styling
    if (onlyPopupModules && !isInCardEditor) {
      return html`
        <div style="${cardStyle}">${this.config.layout.rows.map(row => this._renderRow(row))}</div>
      `;
    }

    // Register weather modules after render to catch immediate changes
    // Use requestAnimationFrame to avoid performance issues
    if (this.config && this.hass && this._instanceId) {
      requestAnimationFrame(() => {
        this._registerDynamicWeatherModules();
      });
    }

    return html`
      <div class="card-container" style="${cardStyle}">
        ${this.config.layout.rows.map(row => this._renderRow(row))}
      </div>
    `;
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('config')) {
      // Hard reset before re-initializing scaling logic
      this._forceResetScale();
      this._setupResponsiveScaling();

      // Re-register video background modules when config changes
      this._registerVideoBgModules();

      // Re-register dynamic weather modules when config changes
      this._registerDynamicWeatherModules();

      // Re-register background modules when config changes
      this._registerBackgroundModules();

      // Re-register navigation modules when config changes
      this._registerNavigationModules();
    }

    // Also re-register service-based modules when hass changes (for automatic mode updates and entity state changes)
    if (changedProperties.has('hass')) {
      this._registerDynamicWeatherModules();
      this._registerBackgroundModules();
      this._registerNavigationModules();
    }

    // Only check scaling when config or hass changes (not on every render) and feature is enabled
    if (
      (changedProperties.has('config') || changedProperties.has('hass')) &&
      this._isScalingEnabled()
    ) {
      // Ensure native size before new measurement
      this._forceResetScale();
      this._scheduleScaleCheck();
    }
  }

  private _setupResponsiveScaling() {
    // Remove existing observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    // Clear any pending timers
    if (this._scaleDebounceTimer) {
      clearTimeout(this._scaleDebounceTimer);
      this._scaleDebounceTimer = undefined;
    }

    // Only setup if responsive scaling is explicitly enabled
    if (!this._isScalingEnabled()) {
      // Reset any existing scaling
      const container = this.shadowRoot?.querySelector('.card-container') as HTMLElement;
      if (container) {
        container.style.transform = '';
        container.style.transformOrigin = '';
        container.style.width = '';
      }
      this._currentScale = 1;
      return;
    }

    // Setup resize observer to watch for size changes
    this._resizeObserver = new ResizeObserver(entries => {
      // Only react to host element size changes, not container
      for (const entry of entries) {
        if (entry.target === this) {
          this._scheduleScaleCheck();
        }
      }
    });

    // Observe only the host element for size changes
    this._resizeObserver.observe(this);

    // Run initial check after a short delay to ensure DOM is ready
    this._scheduleScaleCheck();
  }

  private _resizeObserver?: ResizeObserver;
  private _scaleDebounceTimer?: number;
  private _currentScale: number = 1;
  private _lastMeasuredWidth: number = 0;
  private _lastContentWidth: number = 0;
  private _lastContentWidthCheck: number = 0;
  private _lastScaleTime: number = 0;
  private _visibilityChangeHandler?: () => void;
  private _windowResizeHandler?: () => void;
  private _isScalingInProgress: boolean = false;

  private _scheduleScaleCheck() {
    // Clear any existing timer
    if (this._scaleDebounceTimer) {
      clearTimeout(this._scaleDebounceTimer);
    }

    // Debounce the scale check to prevent rapid recalculations
    this._scaleDebounceTimer = window.setTimeout(() => {
      this._checkAndScaleContent();
    }, 100);
  }

  // Immediately clear any transforms/width overrides so layout returns to native size.
  // Used before scheduling a fresh measurement on layout transitions.
  private _forceResetScale(): void {
    const container = this.shadowRoot?.querySelector('.card-container') as HTMLElement | null;
    if (!container) return;
    container.style.transform = '';
    container.style.transformOrigin = '';
    container.style.width = '';
    this._currentScale = 1;
  }

  private _isScalingEnabled(): boolean {
    // Responsive scaling is now opt-in; only run when explicitly enabled
    return this.config?.responsive_scaling === true;
  }

  private _checkAndScaleContent() {
    if (!this._isScalingEnabled()) {
      return;
    }

    // Cooldown check: prevent immediate re-triggering after scaling is applied
    if (
      this._lastScaleTime > 0 &&
      Date.now() - this._lastScaleTime < 300 &&
      this._currentScale < 1
    ) {
      return;
    }

    if (this._isScalingInProgress) {
      // Avoid overlapping scale calculations that can compound the scale
      return;
    }
    this._isScalingInProgress = true;

    const container = this.shadowRoot?.querySelector('.card-container') as HTMLElement;
    if (!container) {
      this._isScalingInProgress = false;
      return;
    }

    const availableWidth = this.offsetWidth;
    const previousMeasuredWidth = this._lastMeasuredWidth;
    const previousContentWidth = this._lastContentWidth;
    const forcedCheck = previousMeasuredWidth === 0;
    const wasScaledDown = this._currentScale < 1;

    // Temporarily disable observer to prevent feedback loop while we measure
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    // Reset to native size before measuring
    this._forceResetScale();
    container.style.transformOrigin = 'top left';

    // Force a layout recalculation
    void container.offsetHeight;

    requestAnimationFrame(() => {
      const measuredAvailableWidth = this.offsetWidth || availableWidth;
      const contentWidth = container.scrollWidth;

      // Increased threshold from 4px to 8px for content width changes
      // Add stability check: compare with previous check to avoid fluctuations
      const contentChanged =
        forcedCheck ||
        (Math.abs(contentWidth - previousContentWidth) >= 8 &&
          Math.abs(contentWidth - this._lastContentWidthCheck) >= 8);
      const widthChanged =
        forcedCheck || Math.abs(measuredAvailableWidth - previousMeasuredWidth) >= 4;
      const shouldRecalculate = widthChanged || contentChanged || wasScaledDown;

      this._lastMeasuredWidth = measuredAvailableWidth;
      this._lastContentWidth = contentWidth;
      this._lastContentWidthCheck = contentWidth;

      if (!shouldRecalculate) {
        // Reconnect observer after a delay to prevent immediate re-triggering
        if (this._resizeObserver && this._isScalingEnabled()) {
          setTimeout(() => {
            if (this._resizeObserver && this._isScalingEnabled()) {
              this._resizeObserver.observe(this);
            }
            this._isScalingInProgress = false;
          }, 100);
        } else {
          this._isScalingInProgress = false;
        }
        return;
      }

      let finalScale = 1;

      if (contentWidth > measuredAvailableWidth + 8 && measuredAvailableWidth > 0) {
        const scale = measuredAvailableWidth / contentWidth;
        finalScale = Math.max(0.5, Math.min(1, scale));
      }

      // Avoid micro adjustments when already scaled
      if (this._currentScale < 1 && finalScale < 1) {
        if (Math.abs(finalScale - this._currentScale) < 0.01) {
          finalScale = this._currentScale;
        }
      }

      this._currentScale = finalScale;

      if (finalScale < 1) {
        container.style.transform = `scale(${finalScale})`;
        container.style.transformOrigin = 'top left';
        container.style.width = `${100 / finalScale}%`;
        // Update scale time when scaling is actually applied
        this._lastScaleTime = Date.now();
      } else {
        container.style.transform = '';
        container.style.width = '';
        container.style.transformOrigin = '';
        // Reset scale time when scale returns to 1
        this._lastScaleTime = 0;
      }

      // Extend observer disconnect: reconnect after delay to prevent immediate re-triggering
      if (this._resizeObserver && this._isScalingEnabled()) {
        setTimeout(() => {
          if (this._resizeObserver && this._isScalingEnabled()) {
            this._resizeObserver.observe(this);
          }
          this._isScalingInProgress = false;
        }, 100);
      } else {
        this._isScalingInProgress = false;
      }
    });
  }

  /**
   * Apply global transparency directly to the card-container element
   */
  private _applyGlobalTransparency(): void {
    const globalTransparency = (window as any).ultraCardGlobalTransparency;

    // Wait for card-container to be rendered
    requestAnimationFrame(() => {
      const cardContainer = this.shadowRoot?.querySelector('.card-container') as HTMLElement;

      if (!cardContainer) {
        return;
      }

      if (globalTransparency && globalTransparency.enabled) {
        // Apply opacity
        const opacity = globalTransparency.opacity / 100;
        cardContainer.style.setProperty('opacity', String(opacity), 'important');

        // Apply blur and make background semi-transparent so blur is visible
        if (globalTransparency.blur_px > 0) {
          const blur = `blur(${globalTransparency.blur_px}px)`;
          cardContainer.style.setProperty('backdrop-filter', blur, 'important');

          // Make background semi-transparent if it's not already
          // This is necessary for backdrop-filter to be visible
          if (globalTransparency.color && globalTransparency.color !== 'transparent') {
            // User specified a color overlay - layer it over existing background
            const computedBg = getComputedStyle(cardContainer).background || 'transparent';
            const newBg = `linear-gradient(${globalTransparency.color}, ${globalTransparency.color}), ${computedBg}`;
            cardContainer.style.setProperty('background', newBg, 'important');
          } else {
            // No color specified - make current background semi-transparent
            const computedBg = getComputedStyle(cardContainer).backgroundColor;
            if (computedBg && computedBg !== 'transparent') {
              // Convert to rgba with opacity
              if (computedBg.startsWith('rgb(')) {
                const rgba = computedBg.replace('rgb(', 'rgba(').replace(')', ', 0.7)');
                cardContainer.style.setProperty('background-color', rgba, 'important');
              } else if (computedBg.startsWith('rgba(')) {
                // Already rgba, ensure alpha is not 1
                const match = computedBg.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
                if (match) {
                  const rgba = `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.7)`;
                  cardContainer.style.setProperty('background-color', rgba, 'important');
                }
              }
            }
          }
        }

        // Apply background color overlay (if specified and no blur)
        if (globalTransparency.color && globalTransparency.blur_px === 0) {
          cardContainer.style.setProperty('background', globalTransparency.color, 'important');
        }

        this._globalTransparencyApplied = true;
      } else if (this._globalTransparencyApplied) {
        // Only remove styles if we previously applied them
        cardContainer.style.removeProperty('opacity');
        cardContainer.style.removeProperty('backdrop-filter');
        cardContainer.style.removeProperty('background');
        cardContainer.style.removeProperty('background-color');
        this._globalTransparencyApplied = false;

        // Trigger a re-render to restore user's original styles
        this.requestUpdate();
      }
    });
  }

  private _getCardStyle(): string {
    if (!this.config) return '';

    const styles = [];

    // Apply background color (supports gradients and solid colors)
    if (this.config.card_background) {
      styles.push(`background: ${this.config.card_background}`);
    }

    // Apply background image
    if (
      this.config.card_background_image_type &&
      this.config.card_background_image_type !== 'none'
    ) {
      const backgroundImageUrl = this._getCardBackgroundImageUrl();
      if (backgroundImageUrl) {
        styles.push(`background-image: url('${backgroundImageUrl}')`);

        // Apply background size
        const backgroundSize = this.config.card_background_size || 'cover';
        styles.push(`background-size: ${backgroundSize}`);

        // Apply background repeat
        const backgroundRepeat = this.config.card_background_repeat || 'no-repeat';
        styles.push(`background-repeat: ${backgroundRepeat}`);

        // Apply background position
        const backgroundPosition = this.config.card_background_position || 'center center';
        styles.push(`background-position: ${backgroundPosition}`);
      }
    }

    // Apply border radius
    if (this.config.card_border_radius !== undefined) {
      styles.push(`border-radius: ${this.config.card_border_radius}px`);
    }

    // Apply border color and width
    if (this.config.card_border_color || this.config.card_border_width !== undefined) {
      const borderWidth =
        this.config.card_border_width !== undefined ? this.config.card_border_width : 1;
      const borderColor = this.config.card_border_color || 'var(--divider-color)';
      styles.push(`border: ${borderWidth}px solid ${borderColor}`);
    }

    // Apply padding
    if (this.config.card_padding !== undefined) {
      styles.push(`padding: ${this.config.card_padding}px`);
    }

    // Apply margin
    if (this.config.card_margin !== undefined) {
      styles.push(`margin: ${this.config.card_margin}px`);
    }

    // Apply overflow (clips content that extends beyond card boundaries)
    if (this.config.card_overflow) {
      styles.push(`overflow: ${this.config.card_overflow}`);
    }

    // Apply custom shadow
    if (this.config.card_shadow_enabled) {
      const shadowColor = this.config.card_shadow_color || 'rgba(0, 0, 0, 0.15)';
      const horizontal = this.config.card_shadow_horizontal ?? 0;
      const vertical = this.config.card_shadow_vertical ?? 2;
      const blur = this.config.card_shadow_blur ?? 8;
      const spread = this.config.card_shadow_spread ?? 0;
      styles.push(`box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${shadowColor}`);
    }

    return styles.join('; ');
  }

  /**
   * Get the card background image URL based on the configured type
   */
  private _getCardBackgroundImageUrl(): string {
    if (!this.config || !this.hass) return '';

    const imageType = this.config.card_background_image_type;

    switch (imageType) {
      case 'upload':
        // For uploads, use getImageUrl to properly resolve the path
        if (this.config.card_background_image) {
          return getImageUrl(this.hass, this.config.card_background_image);
        }
        return '';

      case 'url':
        // For direct URLs, use as-is
        return this.config.card_background_image || '';

      case 'entity':
        // For entity type, get the entity picture from the entity state
        const entityId = this.config.card_background_image_entity;
        if (entityId && this.hass.states[entityId]) {
          const entity = this.hass.states[entityId];
          // Try entity_picture first, then entity_picture_local
          const imageUrl =
            entity.attributes.entity_picture ||
            entity.attributes.entity_picture_local ||
            entity.attributes.picture ||
            '';
          if (imageUrl) {
            return getImageUrl(this.hass, imageUrl);
          }
        }
        return '';

      default:
        return '';
    }
  }

  private _renderRow(row: CardRow): TemplateResult {
    // Initialize logic service
    if (this.hass) {
      logicService.setHass(this.hass);
    }

    // Check row display conditions (handles both template_mode and regular conditions)
    const shouldShow = logicService.evaluateRowVisibility(row);

    // Also check global design logic properties if they exist
    const rowWithDesign = row as any;
    const globalLogicVisible = logicService.evaluateLogicProperties({
      logic_entity: rowWithDesign.design?.logic_entity,
      logic_attribute: rowWithDesign.design?.logic_attribute,
      logic_operator: rowWithDesign.design?.logic_operator,
      logic_value: rowWithDesign.design?.logic_value,
    });

    // Hide row if conditions not met
    if (!shouldShow || !globalLogicVisible) {
      return html``;
    }

    // Generate responsive visibility CSS for hidden_on_devices
    const rowId = row.id || `row-${Math.random().toString(36).slice(2, 9)}`;
    const hiddenOnDevices = (row as any).hidden_on_devices;
    const hideOnDevicesCSS = responsiveDesignService.generateHideOnDevicesCSS(
      `.responsive-row-${rowId}`,
      hiddenOnDevices
    );

    // Generate responsive design CSS if device-specific overrides exist
    const responsiveCSS = responsiveDesignService.generateResponsiveCSS(
      `.responsive-row-${rowId}`,
      row.design
    );

    // Get effective design for current breakpoint (for animation properties)
    const effectiveRowDesign = responsiveDesignService.getEffectiveDesign(
      row.design,
      responsiveDesignService.getCurrentBreakpoint()
    );

    // Row animation handling (state-based + intro/outro)
    const previouslyVisible = this._rowVisibilityState.get(rowId);
    const isVisible = true; // At this point row is visible by logic checks

    // Get animation properties from effective design
    const introAnimation = effectiveRowDesign.intro_animation || 'none';
    const outroAnimation = effectiveRowDesign.outro_animation || 'none';
    const animationDuration = effectiveRowDesign.animation_duration || '2s';
    const animationDelay = effectiveRowDesign.animation_delay || '0s';
    const animationTiming = effectiveRowDesign.animation_timing || 'ease';

    // State-based animation class
    const stateAnimationClass = this._getStateBasedAnimationClass(effectiveRowDesign as any);

    // Determine animation class
    let animationClass = '';
    let willStartAnimation = false;
    const isAnimating = this._animatingRows.has(rowId);

    if (stateAnimationClass) {
      animationClass = stateAnimationClass; // continuous while condition is met
    } else if (previouslyVisible !== undefined && previouslyVisible !== isVisible) {
      if (isVisible && introAnimation !== 'none') {
        if (!isAnimating) {
          animationClass = `animation-${introAnimation}`;
          willStartAnimation = true;
          this._animatingRows.add(rowId);
          setTimeout(
            () => {
              this._animatingRows.delete(rowId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          animationClass = `animation-${introAnimation}`;
        }
      } else if (!isVisible && outroAnimation !== 'none') {
        if (!isAnimating) {
          animationClass = `animation-${outroAnimation}`;
          willStartAnimation = true;
          this._animatingRows.add(rowId);
          setTimeout(
            () => {
              this._animatingRows.delete(rowId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          animationClass = `animation-${outroAnimation}`;
        }
      }
    } else if (previouslyVisible === undefined && isVisible && introAnimation !== 'none') {
      // Initial mount: play intro once
      animationClass = `animation-${introAnimation}`;
      willStartAnimation = true;
      this._animatingRows.add(rowId);
      setTimeout(
        () => {
          this._animatingRows.delete(rowId);
          this.requestUpdate();
        },
        this._parseAnimationDuration(animationDuration) +
          this._parseAnimationDuration(animationDelay)
      );
    } else if (isAnimating) {
      if (isVisible && introAnimation !== 'none') animationClass = `animation-${introAnimation}`;
      else if (!isVisible && outroAnimation !== 'none')
        animationClass = `animation-${outroAnimation}`;
    }

    // Update visibility state
    this._rowVisibilityState.set(rowId, isVisible);

    const rowStyles = this._generateRowStyles(row);

    // Get hover effect configuration from effective row design
    const hoverEffect = effectiveRowDesign.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    // Add class for background filter support
    const hasBackgroundFilter =
      effectiveRowDesign.background_filter && effectiveRowDesign.background_filter !== 'none';
    const filterClass = hasBackgroundFilter ? 'has-background-filter' : '';

    // Generate responsive column layout CSS
    const responsiveColumnLayoutCSS = this._generateResponsiveColumnLayoutCSS(
      row,
      `.responsive-row-${rowId}`
    );

    // Include responsive CSS if any device-specific settings or hide rules exist
    const allResponsiveCSS = [hideOnDevicesCSS, responsiveCSS, responsiveColumnLayoutCSS]
      .filter(Boolean)
      .join('\n');
    const responsiveStyleTag = allResponsiveCSS
      ? html`<style>
          ${allResponsiveCSS}
        </style>`
      : '';

    // Check if row has actions configured
    const rowWithActions = row as any;
    const hasRowActions =
      (rowWithActions.tap_action && rowWithActions.tap_action.action !== 'nothing') ||
      (rowWithActions.hold_action && rowWithActions.hold_action.action !== 'nothing') ||
      (rowWithActions.double_tap_action && rowWithActions.double_tap_action.action !== 'nothing');

    // Create gesture handlers for row-level actions if configured
    let rowHandlers: any = {};
    if (hasRowActions && this.hass) {
      const gestureService = UcGestureService.getInstance();
      rowHandlers = gestureService.createGestureHandlers(
        `row-${rowId}`,
        {
          tap_action: rowWithActions.tap_action,
          hold_action: rowWithActions.hold_action,
          double_tap_action: rowWithActions.double_tap_action,
          entity: (rowWithActions as any).entity,
          module: undefined,
        },
        this.hass,
        this.config
      );
    }

    const rowContent = html`
      ${responsiveStyleTag}
      <div
        class="card-row responsive-row-${rowId} ${hoverEffectClass} ${filterClass} ${hasRowActions
          ? 'has-row-actions'
          : ''}"
        style="${rowStyles}${hasRowActions ? '; cursor: pointer; pointer-events: auto;' : ''}"
        @pointerdown=${hasRowActions ? rowHandlers.onPointerDown : null}
        @pointerup=${hasRowActions ? rowHandlers.onPointerUp : null}
        @pointercancel=${hasRowActions ? rowHandlers.onPointerCancel : null}
        @pointerleave=${hasRowActions ? rowHandlers.onPointerLeave : null}
      >
        ${row.columns.map(column => this._renderColumn(column))}
      </div>
    `;

    if (
      animationClass ||
      introAnimation !== 'none' ||
      outroAnimation !== 'none' ||
      stateAnimationClass
    ) {
      return html`
        <div
          class="row-animation-wrapper ${animationClass}"
          style="
            --animation-duration: ${animationDuration};
            --animation-delay: ${animationDelay};
            --animation-timing: ${animationTiming};
          "
        >
          ${rowContent}
        </div>
      `;
    }

    return rowContent;
  }

  private _renderColumn(column: CardColumn): TemplateResult {
    // Check column display conditions (handles both template_mode and regular conditions)
    const shouldShow = logicService.evaluateColumnVisibility(column);

    // Also check global design logic properties if they exist
    const columnWithDesign = column as any;
    const globalLogicVisible = logicService.evaluateLogicProperties({
      logic_entity: columnWithDesign.design?.logic_entity,
      logic_attribute: columnWithDesign.design?.logic_attribute,
      logic_operator: columnWithDesign.design?.logic_operator,
      logic_value: columnWithDesign.design?.logic_value,
    });

    // Hide column if conditions not met
    if (!shouldShow || !globalLogicVisible) {
      return html``;
    }

    // Generate responsive visibility CSS for hidden_on_devices
    const colId = column.id || `col-${Math.random().toString(36).slice(2, 9)}`;
    const hiddenOnDevices = (column as any).hidden_on_devices;
    const hideOnDevicesCSS = responsiveDesignService.generateHideOnDevicesCSS(
      `.responsive-col-${colId}`,
      hiddenOnDevices
    );

    // Generate responsive design CSS if device-specific overrides exist
    const responsiveCSS = responsiveDesignService.generateResponsiveCSS(
      `.responsive-col-${colId}`,
      column.design
    );

    // Get effective design for current breakpoint (for animation properties)
    const effectiveColDesign = responsiveDesignService.getEffectiveDesign(
      column.design,
      responsiveDesignService.getCurrentBreakpoint()
    );

    // Column animation handling (state-based + intro/outro)
    const columnId = (column as any).id || `column-${Math.random()}`;
    const previouslyVisible = this._columnVisibilityState.get(columnId);
    const isVisible = true; // Logic checks passed above

    const introAnimation = effectiveColDesign.intro_animation || 'none';
    const outroAnimation = effectiveColDesign.outro_animation || 'none';
    const animationDuration = effectiveColDesign.animation_duration || '2s';
    const animationDelay = effectiveColDesign.animation_delay || '0s';
    const animationTiming = effectiveColDesign.animation_timing || 'ease';

    const stateAnimationClass = this._getStateBasedAnimationClass(effectiveColDesign as any);

    let animationClass = '';
    let willStartAnimation = false;
    const isAnimating = this._animatingColumns.has(columnId);

    if (stateAnimationClass) {
      animationClass = stateAnimationClass;
    } else if (previouslyVisible !== undefined && previouslyVisible !== isVisible) {
      if (isVisible && introAnimation !== 'none') {
        if (!isAnimating) {
          animationClass = `animation-${introAnimation}`;
          willStartAnimation = true;
          this._animatingColumns.add(columnId);
          setTimeout(
            () => {
              this._animatingColumns.delete(columnId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          animationClass = `animation-${introAnimation}`;
        }
      } else if (!isVisible && outroAnimation !== 'none') {
        if (!isAnimating) {
          animationClass = `animation-${outroAnimation}`;
          willStartAnimation = true;
          this._animatingColumns.add(columnId);
          setTimeout(
            () => {
              this._animatingColumns.delete(columnId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          animationClass = `animation-${outroAnimation}`;
        }
      }
    } else if (previouslyVisible === undefined && isVisible && introAnimation !== 'none') {
      animationClass = `animation-${introAnimation}`;
      willStartAnimation = true;
      this._animatingColumns.add(columnId);
      setTimeout(
        () => {
          this._animatingColumns.delete(columnId);
          this.requestUpdate();
        },
        this._parseAnimationDuration(animationDuration) +
          this._parseAnimationDuration(animationDelay)
      );
    } else if (isAnimating) {
      if (isVisible && introAnimation !== 'none') animationClass = `animation-${introAnimation}`;
      else if (!isVisible && outroAnimation !== 'none')
        animationClass = `animation-${outroAnimation}`;
    }

    this._columnVisibilityState.set(columnId, isVisible);

    const columnStyles = this._generateColumnStyles(column);

    // Get hover effect configuration from effective column design
    const hoverEffect = effectiveColDesign.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    // Add class for background filter support
    const hasBackgroundFilter =
      effectiveColDesign.background_filter && effectiveColDesign.background_filter !== 'none';
    const filterClass = hasBackgroundFilter ? 'has-background-filter' : '';

    // Include responsive CSS if any device-specific settings or hide rules exist
    const colResponsiveStyleTag =
      hideOnDevicesCSS || responsiveCSS
        ? html`<style>
            ${hideOnDevicesCSS}${responsiveCSS}
          </style>`
        : '';

    // Check if column has actions configured
    const columnWithActions = column as any;
    const hasColumnActions =
      (columnWithActions.tap_action && columnWithActions.tap_action.action !== 'nothing') ||
      (columnWithActions.hold_action && columnWithActions.hold_action.action !== 'nothing') ||
      (columnWithActions.double_tap_action &&
        columnWithActions.double_tap_action.action !== 'nothing');

    // Create gesture handlers for column-level actions if configured
    let columnHandlers: any = {};
    if (hasColumnActions && this.hass) {
      const gestureService = UcGestureService.getInstance();
      columnHandlers = gestureService.createGestureHandlers(
        `column-${colId}`,
        {
          tap_action: columnWithActions.tap_action,
          hold_action: columnWithActions.hold_action,
          double_tap_action: columnWithActions.double_tap_action,
          entity: (columnWithActions as any).entity,
          module: undefined,
        },
        this.hass,
        this.config
      );
    }

    const columnContent = html`
      ${colResponsiveStyleTag}
      <div
        class="card-column responsive-col-${colId} ${hoverEffectClass} ${filterClass} ${hasColumnActions
          ? 'has-column-actions'
          : ''}"
        style="${columnStyles}${hasColumnActions ? '; cursor: pointer; pointer-events: auto;' : ''}"
        @pointerdown=${hasColumnActions ? columnHandlers.onPointerDown : null}
        @pointerup=${hasColumnActions ? columnHandlers.onPointerUp : null}
        @pointercancel=${hasColumnActions ? columnHandlers.onPointerCancel : null}
        @pointerleave=${hasColumnActions ? columnHandlers.onPointerLeave : null}
      >
        ${column.modules.map(module => this._renderModule(module))}
      </div>
    `;

    if (
      animationClass ||
      introAnimation !== 'none' ||
      outroAnimation !== 'none' ||
      stateAnimationClass
    ) {
      return html`
        <div
          class="column-animation-wrapper ${animationClass}"
          style="
            --animation-duration: ${animationDuration};
            --animation-delay: ${animationDelay};
            --animation-timing: ${animationTiming};
          "
        >
          ${columnContent}
        </div>
      `;
    }

    return columnContent;
  }

  private _renderModule(module: CardModule): TemplateResult {
    // Check if this is a pro module and if user has access
    const isProModule = this._isProModule(module);
    const hasProAccess = this._hasProAccess();
    const shouldShowProOverlay = isProModule && !hasProAccess;

    // Debug logging for pro module detection removed

    // Check module display conditions (handles both template_mode and regular conditions)
    const shouldShow = logicService.evaluateModuleVisibility(module);

    // Also check global design logic properties if they exist
    const moduleWithDesign = module as any;
    const globalLogicVisible = logicService.evaluateLogicProperties({
      logic_entity: moduleWithDesign.design?.logic_entity,
      logic_attribute: moduleWithDesign.design?.logic_attribute,
      logic_operator: moduleWithDesign.design?.logic_operator,
      logic_value: moduleWithDesign.design?.logic_value,
    });

    const isVisible = shouldShow && globalLogicVisible;
    const moduleId = module.id || `${module.type}-${Math.random()}`;
    const previouslyVisible = this._moduleVisibilityState.get(moduleId);

    // Generate responsive visibility CSS for hidden_on_devices
    const hiddenOnDevices = (module as any).hidden_on_devices;
    const moduleHideOnDevicesCSS = responsiveDesignService.generateHideOnDevicesCSS(
      `.responsive-mod-${moduleId}`,
      hiddenOnDevices
    );

    // Generate responsive design CSS if device-specific overrides exist
    // IMPORTANT: Only include border_radius and overflow on the wrapper for clipping purposes.
    // Do NOT include background_color on the wrapper - it should only be on the content div.
    // Otherwise, when the content has margin, the wrapper's background shows through.
    const effectiveBorderRadius =
      (module as any).design?.border_radius ||
      (module as any).border_radius ||
      (module as any).border?.radius;

    // Create a design object for the wrapper that excludes background properties
    // The wrapper only needs border-radius and overflow for proper corner clipping
    const {
      background_color: _bgColor,
      background_image: _bgImage,
      background_size: _bgSize,
      background_position: _bgPos,
      background_repeat: _bgRepeat,
      backdrop_filter: _backdrop,
      base: originalBase,
      ...wrapperDesignWithoutBackground
    } = (module as any).design || {};

    // Also remove background properties from the base object if it exists
    const cleanedBase = originalBase
      ? (() => {
          const {
            background_color: _baseBgColor,
            background_image: _baseBgImage,
            background_size: _baseBgSize,
            background_position: _baseBgPos,
            background_repeat: _baseBgRepeat,
            backdrop_filter: _baseBackdrop,
            ...baseWithoutBackground
          } = originalBase;
          return baseWithoutBackground;
        })()
      : undefined;

    const mergedDesignForCSS = {
      ...wrapperDesignWithoutBackground,
      // Include cleaned base without background properties
      ...(cleanedBase && Object.keys(cleanedBase).length > 0 ? { base: cleanedBase } : {}),
      // Include root-level styling properties if not already in design
      border_radius: effectiveBorderRadius,
      // Add overflow:hidden when border-radius is set to clip content to rounded corners
      overflow:
        (module as any).design?.overflow ||
        (effectiveBorderRadius &&
        effectiveBorderRadius !== '0' &&
        effectiveBorderRadius !== '0px' &&
        effectiveBorderRadius !== 0
          ? 'hidden'
          : undefined),
    };

    const moduleResponsiveCSS = responsiveDesignService.generateResponsiveCSS(
      `.responsive-mod-${moduleId}`,
      mergedDesignForCSS
    );
    const isAnimating = this._animatingModules.has(moduleId);

    // Get animation properties from module design
    const introAnimation =
      moduleWithDesign.intro_animation || moduleWithDesign.design?.intro_animation || 'none';
    const outroAnimation =
      moduleWithDesign.outro_animation || moduleWithDesign.design?.outro_animation || 'none';
    const animationDuration =
      moduleWithDesign.animation_duration || moduleWithDesign.design?.animation_duration || '2s';
    const animationDelay =
      moduleWithDesign.animation_delay || moduleWithDesign.design?.animation_delay || '0s';
    const animationTiming =
      moduleWithDesign.animation_timing || moduleWithDesign.design?.animation_timing || 'ease';

    // Check for state-based animation configuration
    const stateAnimationType =
      moduleWithDesign.animation_type || moduleWithDesign.design?.animation_type;
    const stateAnimationEntity =
      moduleWithDesign.animation_entity || moduleWithDesign.design?.animation_entity;
    const stateAnimationTriggerType =
      moduleWithDesign.animation_trigger_type ||
      moduleWithDesign.design?.animation_trigger_type ||
      'state';
    const stateAnimationAttribute =
      moduleWithDesign.animation_attribute || moduleWithDesign.design?.animation_attribute;
    const stateAnimationState =
      moduleWithDesign.animation_state || moduleWithDesign.design?.animation_state;

    // Evaluate state-based animation condition
    let shouldTriggerStateAnimation = false;
    if (stateAnimationType && stateAnimationType !== 'none') {
      if (!stateAnimationEntity) {
        shouldTriggerStateAnimation = true;
      } else if (stateAnimationState && this.hass) {
        const entity = this.hass.states[stateAnimationEntity];
        if (entity) {
          if (stateAnimationTriggerType === 'attribute' && stateAnimationAttribute) {
            const attributeValue = entity.attributes[stateAnimationAttribute];
            shouldTriggerStateAnimation = String(attributeValue) === stateAnimationState;
          } else {
            shouldTriggerStateAnimation = entity.state === stateAnimationState;
          }
        }
      }
    }

    // Determine animation state and class BEFORE updating visibility state
    let animationClass = '';
    let willStartAnimation = false;

    // Handle state-based animations first (priority over intro/outro)
    if (shouldTriggerStateAnimation && stateAnimationType !== 'none') {
      animationClass = `animation-${stateAnimationType}`;
    }
    // Handle visibility changes with animations (only if no state animation active)
    else if (previouslyVisible !== undefined && previouslyVisible !== isVisible) {
      if (isVisible && introAnimation !== 'none') {
        if (!isAnimating) {
          animationClass = `animation-${introAnimation}`;
          willStartAnimation = true;
          this._animatingModules.add(moduleId);
          setTimeout(
            () => {
              this._animatingModules.delete(moduleId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          animationClass = `animation-${introAnimation}`;
        }
      } else if (!isVisible && outroAnimation !== 'none') {
        if (!isAnimating) {
          animationClass = `animation-${outroAnimation}`;
          willStartAnimation = true;
          this._animatingModules.add(moduleId);
          setTimeout(
            () => {
              this._animatingModules.delete(moduleId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          animationClass = `animation-${outroAnimation}`;
        }
      }
    }
    // Initial mount: if module is visible and intro_animation is configured, play it once
    else if (previouslyVisible === undefined && isVisible && introAnimation !== 'none') {
      animationClass = `animation-${introAnimation}`;
      willStartAnimation = true;
      this._animatingModules.add(moduleId);
      setTimeout(
        () => {
          this._animatingModules.delete(moduleId);
          this.requestUpdate();
        },
        this._parseAnimationDuration(animationDuration) +
          this._parseAnimationDuration(animationDelay)
      );
    } else if (isAnimating) {
      if (isVisible && introAnimation !== 'none') {
        animationClass = `animation-${introAnimation}`;
      } else if (!isVisible && outroAnimation !== 'none') {
        animationClass = `animation-${outroAnimation}`;
      }
    }

    // Update visibility state AFTER determining animation
    this._moduleVisibilityState.set(moduleId, isVisible);

    // Don't render if not visible and not animating out
    if (!isVisible && !isAnimating && !willStartAnimation) {
      return html``;
    }

    // Use centralized preview service for consistent rendering
    if (!this.hass || !this.config) {
      return html``;
    }

    // Detect if we're inside an HA Preview dialog (not the dashboard)
    const isHaPreview = this._detectEditorPreviewContext();

    // Detect if the dashboard itself is in edit mode (for modules like video_bg
    // that need to show a visible placeholder when the user is editing the dashboard)
    const isDashboardEditMode = !isHaPreview && this._detectDashboardEditMode();

    const moduleContent = ucModulePreviewService.renderModuleContent(
      module,
      this.hass,
      this.config,
      {
        animationClass,
        animationDuration,
        animationDelay,
        animationTiming,
        introAnimation,
        outroAnimation,
        shouldTriggerStateAnimation,
        isHaPreview, // Pass the detection result
        isDashboardEditMode, // Pass dashboard edit mode detection
      }
    );

    // Extract CSS variable prefix for Shadow DOM styling
    const cssVarPrefix = (module as any).design?.css_variable_prefix;

    // Generate CSS variables for Shadow DOM styling
    const cssVarStyles = cssVarPrefix
      ? this._styleObjectToCss(generateCSSVariables(cssVarPrefix, (module as any).design))
      : '';

    const normalizedBorderRadius = this._addPixelUnit(
      effectiveBorderRadius !== undefined ? String(effectiveBorderRadius) : undefined
    );
    const explicitOverflow =
      (module as any).design?.overflow !== undefined
        ? (module as any).design?.overflow
        : (module as any).overflow;
    const shouldClip =
      normalizedBorderRadius &&
      normalizedBorderRadius !== '0' &&
      normalizedBorderRadius !== '0px' &&
      (!explicitOverflow || explicitOverflow === 'visible');
    const overflowStyle =
      explicitOverflow && explicitOverflow !== 'visible'
        ? explicitOverflow
        : shouldClip
          ? 'hidden'
          : undefined;

    const moduleWrapStyleParts = [
      cssVarStyles,
      'border: none',
      normalizedBorderRadius ? `border-radius: ${normalizedBorderRadius}` : '',
      overflowStyle ? `overflow: ${overflowStyle}` : '',
    ].filter(Boolean);
    const moduleWrapStyles = moduleWrapStyleParts.join('; ');

    // If this is a pro module and user doesn't have access, show overlay
    if (shouldShowProOverlay) {
      return html`
        <div
          class="pro-module-locked"
          style=${moduleWrapStyles}
          @contextmenu=${(e: Event) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          @click=${(e: Event) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          ${moduleContent}
          <div
            class="pro-module-overlay"
            @contextmenu=${(e: Event) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            @click=${(e: Event) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div class="pro-module-message">
              <ha-icon icon="mdi:lock"></ha-icon>
              <div class="pro-module-text">
                <strong>Pro Module</strong>
                <span>Please login to view this module</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Include responsive CSS if any device-specific settings or hide rules exist
    const moduleResponsiveStyleTag =
      moduleHideOnDevicesCSS || moduleResponsiveCSS
        ? html`<style>
            ${moduleHideOnDevicesCSS}${moduleResponsiveCSS}
          </style>`
        : '';

    // Return module content without forcing DOM replacement
    return html`
      ${moduleResponsiveStyleTag}
      <div class="uc-module-wrap responsive-mod-${moduleId}" style=${moduleWrapStyles}>
        ${moduleContent}
      </div>
    `;
  }

  private _parseAnimationDuration(duration: string): number {
    const match = duration.match(/^(\d*\.?\d+)(s|ms)?$/);
    if (!match) return 300; // default 300ms

    const value = parseFloat(match[1]);
    const unit = match[2];

    // If no unit specified, treat as seconds (CSS default for animation properties)
    if (!unit) {
      return value * 1000; // convert to milliseconds
    }

    return unit === 's' ? value * 1000 : value;
  }

  /**
   * Collect all hover effect configurations from the current card config
   */
  private _collectHoverEffectConfigs(): HoverEffectConfig[] {
    const configs: HoverEffectConfig[] = [];

    if (!this.config) return configs;

    const currentBreakpoint = responsiveDesignService.getCurrentBreakpoint();

    // Collect from rows
    this.config.layout?.rows?.forEach(row => {
      const effectiveDesign = responsiveDesignService.getEffectiveDesign(
        row.design,
        currentBreakpoint
      );
      if (effectiveDesign.hover_effect) {
        configs.push(effectiveDesign.hover_effect);
      }

      // Collect from columns
      row.columns?.forEach(column => {
        const colEffectiveDesign = responsiveDesignService.getEffectiveDesign(
          column.design,
          currentBreakpoint
        );
        if (colEffectiveDesign.hover_effect) {
          configs.push(colEffectiveDesign.hover_effect);
        }

        // Collect from modules
        column.modules?.forEach(module => {
          const modEffectiveDesign = responsiveDesignService.getEffectiveDesign(
            (module as any).design,
            currentBreakpoint
          );
          if (modEffectiveDesign.hover_effect) {
            configs.push(modEffectiveDesign.hover_effect);
          }
        });
      });
    });

    return configs;
  }

  /**
   * Update hover effect styles based on current configuration
   */
  private _updateHoverEffectStyles(): void {
    if (!this.shadowRoot) return;

    const configs = this._collectHoverEffectConfigs();
    if (configs.length > 0) {
      UcHoverEffectsService.updateHoverEffectStyles(this.shadowRoot, configs);
    }
  }

  /**
   * Helper method to evaluate state-based animation conditions
   */
  private _getStateBasedAnimationClass(design: any): string {
    if (!design) return '';

    const stateAnimationType = design.animation_type;
    const stateAnimationEntity = design.animation_entity;
    const stateAnimationTriggerType = design.animation_trigger_type || 'state';
    const stateAnimationAttribute = design.animation_attribute;
    const stateAnimationState = design.animation_state;

    // Check if animation is configured
    if (!stateAnimationType || stateAnimationType === 'none') {
      return '';
    }

    // If no entity is configured, play animation continuously
    if (!stateAnimationEntity) {
      return `animation-${stateAnimationType}`;
    }

    // If entity is configured, check the state/attribute condition
    if (!stateAnimationState || !this.hass) {
      return '';
    }

    const entity = this.hass.states[stateAnimationEntity];
    if (!entity) return '';

    let shouldTriggerStateAnimation = false;

    if (stateAnimationTriggerType === 'attribute' && stateAnimationAttribute) {
      // Check attribute value
      const attributeValue = entity.attributes[stateAnimationAttribute];
      shouldTriggerStateAnimation = String(attributeValue) === stateAnimationState;
    } else {
      // Check entity state
      shouldTriggerStateAnimation = entity.state === stateAnimationState;
    }

    return shouldTriggerStateAnimation ? `animation-${stateAnimationType}` : '';
  }

  /**
   * Counts total modules in a config (useful for logging)
   */
  private _countTotalModules(config: UltraCardConfig): number {
    if (!config.layout || !config.layout.rows) {
      return 0;
    }

    return config.layout.rows.reduce((total, row) => {
      return (
        total +
        row.columns.reduce((rowTotal, column) => {
          return rowTotal + column.modules.length;
        }, 0)
      );
    }, 0);
  }

  /**
   * Layout ID to CSS grid-template-columns mapping
   */
  private static readonly LAYOUT_CSS_MAP: Record<string, string> = {
    // 1 Column
    '1-col': '1fr',

    // 2 Columns
    '1-2-1-2': '1fr 1fr',
    '1-3-2-3': '1fr 2fr',
    '2-3-1-3': '2fr 1fr',
    '2-5-3-5': '2fr 3fr',
    '3-5-2-5': '3fr 2fr',

    // 3 Columns
    '1-3-1-3-1-3': '1fr 1fr 1fr',
    '1-4-1-2-1-4': '1fr 2fr 1fr',
    '1-5-3-5-1-5': '1fr 3fr 1fr',
    '1-6-2-3-1-6': '1fr 4fr 1fr',

    // 4 Columns
    '1-4-1-4-1-4-1-4': '1fr 1fr 1fr 1fr',
    '1-5-1-5-1-5-1-5': '1fr 1fr 1fr 1fr',
    '1-6-1-6-1-6-1-6': '1fr 1fr 1fr 1fr',
    '1-8-1-4-1-4-1-8': '1fr 2fr 2fr 1fr',

    // 5 Columns
    '1-5-1-5-1-5-1-5-1-5': '1fr 1fr 1fr 1fr 1fr',
    '1-6-1-6-1-3-1-6-1-6': '1fr 1fr 2fr 1fr 1fr',
    '1-8-1-4-1-4-1-4-1-8': '1fr 2fr 2fr 2fr 1fr',

    // 6 Columns
    '1-6-1-6-1-6-1-6-1-6-1-6': '1fr 1fr 1fr 1fr 1fr 1fr',

    // Legacy support
    '50-50': '1fr 1fr',
    '30-70': '3fr 7fr',
    '70-30': '7fr 3fr',
    '40-60': '4fr 6fr',
    '60-40': '6fr 4fr',
    '33-33-33': '1fr 1fr 1fr',
    '25-50-25': '1fr 2fr 1fr',
    '20-60-20': '1fr 3fr 1fr',
    '25-25-25-25': '1fr 1fr 1fr 1fr',
  };

  /**
   * Convert column layout ID to CSS grid template columns
   */
  private _getGridTemplateColumns(
    layout: string,
    columnCount: number,
    customSizing?: string
  ): string {
    // Handle custom layout - return the custom CSS value directly
    if (layout === 'custom' && customSizing) {
      return customSizing;
    }

    // Return the specific layout if it exists, otherwise fall back to equal columns
    return UltraCard.LAYOUT_CSS_MAP[layout] || `repeat(${columnCount}, 1fr)`;
  }

  /**
   * Generate responsive CSS media queries for column layouts
   * Returns CSS that overrides grid-template-columns at different breakpoints
   */
  private _generateResponsiveColumnLayoutCSS(row: CardRow, selector: string): string {
    const responsiveLayouts = row.responsive_column_layouts;
    if (!responsiveLayouts) return '';

    const cssRules: string[] = [];
    const columnCount = row.columns.length;

    // Import DEVICE_BREAKPOINTS from types
    const breakpoints = {
      laptop: { minWidth: 1025, maxWidth: 1380 },
      tablet: { minWidth: 601, maxWidth: 1024 },
      mobile: { maxWidth: 600 },
    };

    // Laptop (1025px - 1380px)
    if (responsiveLayouts.laptop) {
      const laptopLayout = responsiveLayouts.laptop.layout;
      const laptopCustom = responsiveLayouts.laptop.custom_sizing;
      const gridCols = this._getGridTemplateColumns(laptopLayout, columnCount, laptopCustom);
      cssRules.push(`
        @media (min-width: ${breakpoints.laptop.minWidth}px) and (max-width: ${breakpoints.laptop.maxWidth}px) {
          ${selector} { grid-template-columns: ${gridCols} !important; }
        }
      `);
    }

    // Tablet (601px - 1024px)
    if (responsiveLayouts.tablet) {
      const tabletLayout = responsiveLayouts.tablet.layout;
      const tabletCustom = responsiveLayouts.tablet.custom_sizing;
      const gridCols = this._getGridTemplateColumns(tabletLayout, columnCount, tabletCustom);
      cssRules.push(`
        @media (min-width: ${breakpoints.tablet.minWidth}px) and (max-width: ${breakpoints.tablet.maxWidth}px) {
          ${selector} { grid-template-columns: ${gridCols} !important; }
        }
      `);
    }

    // Mobile (≤600px)
    if (responsiveLayouts.mobile) {
      const mobileLayout = responsiveLayouts.mobile.layout;
      const mobileCustom = responsiveLayouts.mobile.custom_sizing;
      const gridCols = this._getGridTemplateColumns(mobileLayout, columnCount, mobileCustom);
      cssRules.push(`
        @media (max-width: ${breakpoints.mobile.maxWidth}px) {
          ${selector} { grid-template-columns: ${gridCols} !important; }
        }
      `);
    }

    return cssRules.join('\n');
  }

  /**
   * Helper method to ensure border radius values have proper units
   */
  private _addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return value;
  }

  /**
   * Generate CSS styles for a row based on design properties
   */
  private _generateRowStyles(row: CardRow): string {
    // Get effective design for current breakpoint
    const design = responsiveDesignService.getEffectiveDesign(
      row.design,
      responsiveDesignService.getCurrentBreakpoint()
    );

    // Map column alignment values to CSS align-items values
    const getAlignItems = (alignment?: string): string | undefined => {
      switch (alignment) {
        case 'top':
          return 'start';
        case 'bottom':
          return 'end';
        case 'middle':
          return 'center';
        default:
          return undefined; // No default alignment to allow Global Design tab control
      }
    };

    // Map content alignment values to CSS justify-items values
    const getJustifyItems = (alignment?: string): string | undefined => {
      switch (alignment) {
        case 'start':
          return 'start';
        case 'end':
          return 'end';
        case 'center':
          return 'center';
        case 'stretch':
          return 'stretch';
        default:
          return undefined; // No default alignment to allow Global Design tab control
      }
    };

    const alignItemsValue = getAlignItems((row as any).column_alignment);
    const justifyItemsValue = getJustifyItems((row as any).content_alignment);

    const baseStyles: Record<string, string> = {
      display: 'grid',
      gridTemplateColumns: this._getGridTemplateColumns(
        row.column_layout || '1-col',
        row.columns.length,
        row.custom_column_sizing
      ),
      gap: `${row.gap ?? 16}px`,
      // Standard 8px top/bottom padding for proper web design spacing
      padding: '8px 0',
    };

    // Only add alignment properties if they are explicitly set (not undefined)
    if (alignItemsValue !== undefined) {
      baseStyles.alignItems = alignItemsValue;
    }
    if (justifyItemsValue !== undefined) {
      baseStyles.justifyItems = justifyItemsValue;
    }

    // Check if background filter is applied - if so, use CSS variables for ::before pseudo-element
    const hasBackgroundFilter = design.background_filter && design.background_filter !== 'none';

    const designStyles: Record<string, string> = {
      // Padding
      padding:
        design.padding_top || design.padding_bottom || design.padding_left || design.padding_right
          ? `${design.padding_top || '0'} ${design.padding_right || '0'} ${design.padding_bottom || '0'} ${design.padding_left || '0'}`
          : row.padding
            ? `${row.padding}px`
            : undefined,
      // Margin (override default marginBottom if design margin is set)
      // If full_width is false and no explicit margins are set, center the row with auto margins
      margin:
        row.full_width === false &&
        !design.margin_top &&
        !design.margin_bottom &&
        !design.margin_left &&
        !design.margin_right &&
        !row.margin
          ? '0 auto' // Center horizontally when not full width
          : design.margin_top || design.margin_bottom || design.margin_left || design.margin_right
            ? `${design.margin_top || '0'} ${design.margin_right || '0'} ${design.margin_bottom || '0'} ${design.margin_left || '0'}`
            : row.margin
              ? `${row.margin}px`
              : undefined,
      // Border
      border:
        design.border_style && design.border_style !== 'none'
          ? `${design.border_width || '1px'} ${design.border_style} ${design.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this._addPixelUnit(design.border_radius) ||
        (row.border_radius ? `${row.border_radius}px` : '0'),
      // Position - force relative when filter is present to create positioning context
      position: hasBackgroundFilter ? 'relative' : design.position || 'inherit',
      top: design.top || 'auto',
      bottom: design.bottom || 'auto',
      left: design.left || 'auto',
      right: design.right || 'auto',
      zIndex: design.z_index || 'auto',
      // Size - respect row width settings only if user explicitly controls it
      // If design.width is set, use it. Otherwise, only set width if full_width is false (user control)
      width:
        design.width ||
        (row.full_width === false && row.width_percent !== undefined
          ? `${row.width_percent}%`
          : undefined),
      height: design.height || 'auto',
      maxWidth: design.max_width || 'none',
      maxHeight: design.max_height || 'none',
      minWidth: design.min_width || 'none',
      minHeight: design.min_height || 'auto',
      // Effects
      overflow: design.overflow || 'visible',
      clipPath: design.clip_path || 'none',
      backdropFilter: design.backdrop_filter || 'none',
      // NO direct filter - moved to ::before pseudo-element via CSS variables
      // Shadow
      boxShadow:
        design.box_shadow_h && design.box_shadow_v
          ? `${design.box_shadow_h || '0'} ${design.box_shadow_v || '0'} ${design.box_shadow_blur || '0'} ${design.box_shadow_spread || '0'} ${design.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    if (hasBackgroundFilter) {
      // Add CSS variables for background filter support (used by ::before pseudo-element)
      designStyles['--bg-image'] = this._resolveBackgroundImageCSS(design);
      designStyles['--bg-size'] =
        design.background_size || (design.background_image ? 'cover' : 'auto');
      designStyles['--bg-position'] =
        design.background_position || (design.background_image ? 'center' : 'center');
      designStyles['--bg-repeat'] =
        design.background_repeat || (design.background_image ? 'no-repeat' : 'repeat');
      designStyles['--bg-filter'] = design.background_filter;
      // Set actual background color on main element (not on ::before)
      designStyles.background = design.background_color || row.background_color || 'transparent';
      designStyles.backgroundColor =
        design.background_color || row.background_color || 'transparent';
    } else {
      const { styles: backgroundStyles } = computeBackgroundStyles({
        color: design.background_color ?? row.background_color,
        fallback: row.background_color || 'transparent',
        image: this._resolveBackgroundImageCSS(design),
        imageSize: design.background_size || (design.background_image ? 'cover' : undefined),
        imagePosition:
          design.background_position || (design.background_image ? 'center' : undefined),
        imageRepeat:
          design.background_repeat || (design.background_image ? 'no-repeat' : undefined),
      });
      Object.assign(designStyles, backgroundStyles);
    }

    // Apply CSS variables if prefix is provided (allows Shadow DOM override)
    if (design.css_variable_prefix) {
      const cssVars = generateCSSVariables(design.css_variable_prefix, design);
      Object.assign(designStyles, cssVars);
    }

    // Filter out undefined values and combine styles
    const allStyles = { ...baseStyles, ...designStyles };
    const filteredStyles = Object.fromEntries(
      Object.entries(allStyles).filter(([_, value]) => value !== undefined)
    );

    return this._styleObjectToCss(filteredStyles);
  }

  /**
   * Generate CSS styles for a column based on design properties
   */
  private _generateColumnStyles(column: CardColumn): string {
    // Get effective design for current breakpoint
    const design = responsiveDesignService.getEffectiveDesign(
      column.design,
      responsiveDesignService.getCurrentBreakpoint()
    );

    // When using space-between, space-around, or justify, switch to horizontal layout
    const useHorizontalLayout =
      column.horizontal_alignment === 'space-between' ||
      column.horizontal_alignment === 'space-around' ||
      column.horizontal_alignment === 'justify';

    const baseStyles: Record<string, string> = {
      display: 'flex',
      flexDirection: useHorizontalLayout ? 'row' : 'column',
      // No gap - row controls spacing between columns, modules within column have no forced spacing
    };

    // Apply column alignment only if explicitly set
    if (column.horizontal_alignment) {
      if (useHorizontalLayout) {
        // For horizontal layout (space-between, space-around, justify)
        baseStyles.justifyContent =
          column.horizontal_alignment === 'space-between'
            ? 'space-between'
            : column.horizontal_alignment === 'space-around'
              ? 'space-around'
              : column.horizontal_alignment === 'justify'
                ? 'space-between' // justify behaves like space-between for horizontal
                : 'center';
      } else {
        // For vertical layout (left, center, right, stretch)
        baseStyles.alignItems =
          column.horizontal_alignment === 'left'
            ? 'flex-start'
            : column.horizontal_alignment === 'right'
              ? 'flex-end'
              : column.horizontal_alignment === 'stretch'
                ? 'stretch'
                : 'center';
      }
    }

    if (column.vertical_alignment) {
      if (useHorizontalLayout) {
        // In horizontal mode, vertical alignment becomes alignItems (cross-axis)
        baseStyles.alignItems =
          column.vertical_alignment === 'top'
            ? 'flex-start'
            : column.vertical_alignment === 'bottom'
              ? 'flex-end'
              : column.vertical_alignment === 'stretch'
                ? 'stretch'
                : 'center';
      } else {
        // In vertical mode, vertical alignment is justifyContent (main axis)
        baseStyles.justifyContent =
          column.vertical_alignment === 'top'
            ? 'flex-start'
            : column.vertical_alignment === 'bottom'
              ? 'flex-end'
              : column.vertical_alignment === 'stretch'
                ? 'stretch'
                : 'center';
      }
    }

    // Check if background filter is applied - if so, use CSS variables for ::before pseudo-element
    const hasBackgroundFilter = design.background_filter && design.background_filter !== 'none';

    const designStyles: Record<string, string> = {
      // Padding
      padding:
        design.padding_top || design.padding_bottom || design.padding_left || design.padding_right
          ? `${design.padding_top || '0'} ${design.padding_right || '0'} ${design.padding_bottom || '0'} ${design.padding_left || '0'}`
          : column.padding
            ? `${column.padding}px`
            : undefined,
      // Margin
      margin:
        design.margin_top || design.margin_bottom || design.margin_left || design.margin_right
          ? `${design.margin_top || '0'} ${design.margin_right || '0'} ${design.margin_bottom || '0'} ${design.margin_left || '0'}`
          : column.margin
            ? `${column.margin}px`
            : undefined,
      // Border
      border:
        design.border_style && design.border_style !== 'none'
          ? `${design.border_width || '1px'} ${design.border_style} ${design.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this._addPixelUnit(design.border_radius) ||
        (column.border_radius ? `${column.border_radius}px` : '0'),
      // Position - force relative when filter is present to create positioning context
      position: hasBackgroundFilter ? 'relative' : design.position || 'inherit',
      top: design.top || 'auto',
      bottom: design.bottom || 'auto',
      left: design.left || 'auto',
      right: design.right || 'auto',
      zIndex: design.z_index || 'auto',
      // Size - only set width if user explicitly controls it, otherwise let grid handle sizing
      width: design.width || undefined,
      height: design.height || 'auto',
      maxWidth: design.max_width || 'none',
      maxHeight: design.max_height || 'none',
      minWidth: design.min_width || 'none',
      minHeight: design.min_height || 'auto',
      // Effects
      overflow: design.overflow || 'visible',
      clipPath: design.clip_path || 'none',
      backdropFilter: design.backdrop_filter || 'none',
      // NO direct filter - moved to ::before pseudo-element via CSS variables
      // Shadow
      boxShadow:
        design.box_shadow_h && design.box_shadow_v
          ? `${design.box_shadow_h || '0'} ${design.box_shadow_v || '0'} ${design.box_shadow_blur || '0'} ${design.box_shadow_spread || '0'} ${design.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    if (hasBackgroundFilter) {
      // Add CSS variables for background filter support (used by ::before pseudo-element)
      designStyles['--bg-image'] = this._resolveBackgroundImageCSS(design);
      designStyles['--bg-size'] =
        design.background_size || (design.background_image ? 'cover' : 'auto');
      designStyles['--bg-position'] =
        design.background_position || (design.background_image ? 'center' : 'center');
      designStyles['--bg-repeat'] =
        design.background_repeat || (design.background_image ? 'no-repeat' : 'repeat');
      designStyles['--bg-filter'] = design.background_filter;
      // Set actual background color on main element (not on ::before)
      designStyles.background = design.background_color || column.background_color || 'transparent';
      designStyles.backgroundColor =
        design.background_color || column.background_color || 'transparent';
    } else {
      const { styles: backgroundStyles } = computeBackgroundStyles({
        color: design.background_color ?? column.background_color,
        fallback: column.background_color || 'transparent',
        image: this._resolveBackgroundImageCSS(design),
        imageSize: design.background_size || (design.background_image ? 'cover' : undefined),
        imagePosition:
          design.background_position || (design.background_image ? 'center' : undefined),
        imageRepeat:
          design.background_repeat || (design.background_image ? 'no-repeat' : undefined),
      });
      Object.assign(designStyles, backgroundStyles);
    }

    // Apply CSS variables if prefix is provided (allows Shadow DOM override)
    if (design.css_variable_prefix) {
      const cssVars = generateCSSVariables(design.css_variable_prefix, design);
      Object.assign(designStyles, cssVars);
    }

    // Filter out undefined values and combine styles
    const allStyles = { ...baseStyles, ...designStyles };
    const filteredStyles = Object.fromEntries(
      Object.entries(allStyles).filter(([_, value]) => value !== undefined)
    );

    return this._styleObjectToCss(filteredStyles);
  }

  /**
   * Build a CSS background-image value from design properties for rows/columns.
   * Mirrors module background image behavior (upload/url/entity/legacy path).
   */
  private _resolveBackgroundImageCSS(design: any): string {
    const hass = this.hass;
    const type = design?.background_image_type;
    const backgroundImage = design?.background_image;

    // If explicitly set to none, return none regardless of stored path
    if (type === 'none') {
      return 'none';
    }
    // Support legacy direct path when no explicit type is set
    if (!type && backgroundImage) {
      const resolved = hass ? getImageUrl(hass, backgroundImage) : backgroundImage;
      return `url("${resolved}")`;
    }

    if (type === 'upload' || type === 'url') {
      if (backgroundImage) {
        const resolved = hass ? getImageUrl(hass, backgroundImage) : backgroundImage;
        return `url("${resolved}")`;
      }
      return 'none';
    }

    if (type === 'entity') {
      const entityId = design?.background_image_entity;
      if (entityId && hass && hass.states[entityId]) {
        const stateObj: any = hass.states[entityId];
        let src = '';
        if (stateObj.attributes?.entity_picture) src = stateObj.attributes.entity_picture;
        else if (stateObj.attributes?.image) src = stateObj.attributes.image;
        else if (typeof stateObj.state === 'string') src = stateObj.state;
        if (src) {
          const resolved = getImageUrl(hass, src);
          return `url("${resolved}")`;
        }
      }
      return 'none';
    }

    return 'none';
  }

  /**
   * Convert style object to CSS string
   */
  private _styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  /**
   * Check if a module is a pro module by checking its metadata tags
   */
  private _isProModule(module: CardModule): boolean {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);
    if (!moduleHandler || !moduleHandler.metadata) {
      return false;
    }
    const tags = moduleHandler.metadata.tags || [];
    return tags.includes('pro') || tags.includes('premium');
  }

  /**
   * Load cloud user from integration or card auth
   */
  private _loadCloudUser(): void {
    if (!this.hass) return;

    // Check if integration sensor exists and is disconnected
    const sensorEntityId = 'sensor.ultra_card_pro_cloud_authentication_status';
    const sensorState = this.hass?.states?.[sensorEntityId];

    // If sensor exists and is explicitly disconnected, sign out everywhere
    if (sensorState && (sensorState.state === 'disconnected' || sensorState.state === 'error')) {
      // Sign out both integration and card auth
      ucCloudAuthService.logout();
      this._cloudUser = null;
      return;
    }

    // Priority 1: Check for integration auth
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    if (integrationUser) {
      this._cloudUser = integrationUser;
      // Set the user in the auth service so isAuthenticated() works properly
      ucCloudAuthService.setIntegrationUser(integrationUser);
      return;
    }

    // Priority 2: Check card-based auth
    const cardUser = ucCloudAuthService.getCurrentUser();
    if (cardUser) {
      this._cloudUser = cardUser;
    }
  }

  /**
   * Check if the current user has pro access
   * ONLY checks integration auth (no card-based auth)
   */
  private _hasProAccess(): boolean {
    // Check for integration auth only (cross-device, server-side)
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    return (
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active'
    );
  }

  /**
   * Register all video background modules with the video background service
   */
  private _registerVideoBgModules(): void {
    if (!this.config || !this.hass || !this._instanceId) return;

    // Find all video_bg modules in the configuration
    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'video_bg') {
            ucVideoBgService.registerModule(
              this._instanceId!,
              module.id,
              module as any,
              this.hass!,
              this.config!,
              this as any
            );
          }
        });
      });
    });
  }

  /**
   * Unregister all video background modules from the video background service
   */
  private _unregisterVideoBgModules(): void {
    if (!this.config || !this._instanceId) return;

    // Find all video_bg modules and unregister them
    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'video_bg') {
            ucVideoBgService.unregisterModule(this._instanceId!, module.id);
          }
        });
      });
    });
  }

  /**
   * Register all dynamic weather modules with the dynamic weather service
   */
  private _registerDynamicWeatherModules(): void {
    if (!this.config || !this.hass || !this._instanceId) return;

    // Find all dynamic_weather modules in the configuration
    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'dynamic_weather') {
            ucDynamicWeatherService.registerModule(
              this._instanceId!,
              module.id,
              module as any,
              this.hass!,
              this.config!,
              this as any,
              this._isEditorPreviewCard
            );
          }
        });
      });
    });
  }

  /**
   * Unregister all dynamic weather modules from the dynamic weather service
   */
  private _unregisterDynamicWeatherModules(): void {
    if (!this.config || !this._instanceId) return;

    // Find all dynamic_weather modules and unregister them
    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'dynamic_weather') {
            ucDynamicWeatherService.unregisterModule(
              this._instanceId!,
              module.id,
              this._isEditorPreviewCard
            );
          }
        });
      });
    });
  }

  /**
   * Register all background modules with the background service
   */
  private _registerBackgroundModules(): void {
    if (!this.config || !this.hass || !this._instanceId) return;

    // Find all background modules in the configuration
    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'background') {
            ucBackgroundService.registerModule(
              this._instanceId!,
              module.id,
              module as any,
              this.hass!,
              this.config!,
              this as any
            );
          }
        });
      });
    });
  }

  /**
   * Unregister all background modules from the background service
   */
  private _unregisterBackgroundModules(): void {
    if (!this.config || !this._instanceId) return;

    // Find all background modules and unregister them
    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'background') {
            ucBackgroundService.unregisterModule(this._instanceId!, module.id);
          }
        });
      });
    });
  }

  /**
   * Register all navigation modules with the navigation service
   */
  private _registerNavigationModules(): void {
    if (!this.config || !this.hass || !this._instanceId) return;

    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'navigation') {
            ucNavigationService.registerModule(
              this._instanceId!,
              module.id,
              module as any,
              this.hass!,
              this.config!,
              this as any
            );
          }
        });
      });
    });
  }

  /**
   * Unregister all navigation modules from the navigation service
   * @param force If true, unregister all modules regardless of scope. If false, only unregister 'current_view' scope modules.
   */
  private _unregisterNavigationModules(force: boolean = false): void {
    if (!this.config || !this._instanceId) return;

    this.config.layout?.rows?.forEach(row => {
      row.columns?.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'navigation') {
            const navModule = module as any;
            const scope = navModule.nav_scope || 'all_views';

            // For 'all_views' scope, only unregister if forced (card truly removed)
            // For 'current_view' scope, always unregister on disconnect
            if (force || scope === 'current_view') {
              ucNavigationService.unregisterModule(this._instanceId!, module.id);
            }
          }
        });
      });
    });
  }

  /**
   * Inject a <style> block containing the combined styles from every registered
   * module into the card's shadow-root. This is required for features such as
   * the icon animation classes (e.g. `.icon-animation-pulse`) defined within
   * individual modules to take effect when the card is rendered in Lovelace.
   */
  private _injectModuleStyles(): void {
    if (this._moduleStylesInjected || !this.shadowRoot) {
      return;
    }

    const moduleCss = getModuleRegistry().getAllModuleStyles();

    if (moduleCss.trim().length > 0) {
      const styleEl = document.createElement('style');
      styleEl.textContent = moduleCss;
      this.shadowRoot.appendChild(styleEl);
      this._moduleStylesInjected = true;
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        /* Ensure card adapts to container size in sections view */
        container-type: inline-size;
        width: 100%;
        min-width: 0;
        overflow-anchor: none; /* Prevent scroll anchoring on mobile when 3rd party cards update */
      }

      /* Hide the entire card when it only contains invisible modules (navigation, video_bg, etc.) */
      :host([data-invisible]) {
        display: none !important;
        height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }

      .card-container {
        background: var(--card-background-color, var(--ha-card-background, white));
        border-radius: var(--ha-card-border-radius, 8px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        padding: 16px;
        transition: all 0.3s ease;
        /* Responsive sizing for sections view */
        width: 100%;
        box-sizing: border-box;
        overflow-anchor: none; /* Prevent scroll anchoring on mobile when 3rd party cards update */
      }

      .welcome-text {
        text-align: center;
        padding: 24px;
      }

      .welcome-text h2 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
      }

      .welcome-text p {
        margin: 8px 0;
        color: var(--secondary-text-color);
      }

      .card-row {
        /* No default margins - spacing controlled by individual modules */
        min-width: 0; /* allow columns to shrink inside row */
        width: 100%;
        overflow-anchor: none; /* Prevent scroll anchoring on mobile when 3rd party cards update */
      }

      /* Background blur support - use pseudo-element to avoid blurring content */
      .card-row.has-background-filter,
      .card-column.has-background-filter {
        position: relative;
        isolation: isolate; /* Create new stacking context */
      }

      .card-row.has-background-filter::before,
      .card-column.has-background-filter::before {
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
        z-index: -1; /* Place behind content */
        pointer-events: none;
      }

      .card-row:last-child {
        /* No default margins - spacing controlled by individual modules */
      }

      .card-column {
        display: flex;
        flex-direction: column;
        /* Gap is now controlled via inline styles from column.gap property */
        box-sizing: border-box;
        min-width: 0; /* critical: prevent overflow from long content */
        width: 100%;
        max-width: 100%;
        /* overflow: visible allows child modules to extend beyond bounds (e.g., for negative gap, gauges) */
        /* Inline styles from _generateColumnStyles can override this when design.overflow is set */
        overflow: visible;
        overflow-anchor: none; /* Prevent scroll anchoring on mobile when 3rd party cards update */
      }

      /* Ensure media inside columns never exceed the column width */
      .card-column img,
      .card-column svg {
        max-width: 100%;
        height: auto;
      }

      /* Row/Column Action Override System - When containers have actions, they override children */
      .card-row.has-row-actions {
        position: relative;
      }

      /* When row has actions, disable pointer events on all child columns so row action takes precedence */
      .card-row.has-row-actions > .card-column {
        pointer-events: none;
      }

      /* When column has actions, disable pointer events on child modules so column action takes precedence */
      .card-column.has-column-actions {
        position: relative;
      }

      .card-column.has-column-actions > * {
        pointer-events: none;
      }

      .unknown-module {
        padding: 16px;
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
      }

      /* Animation Wrappers */
      .module-animation-wrapper,
      .row-animation-wrapper,
      .column-animation-wrapper {
        animation-duration: var(--animation-duration, 2s);
        animation-delay: var(--animation-delay, 0s);
        animation-timing-function: var(--animation-timing, ease);
        animation-fill-mode: both;
        /* Inherit alignment from content */
        display: inherit;
        height: inherit;
        flex: inherit;
        align-self: inherit;
        justify-self: inherit;
      }

      /* Intro Animations */
      .animation-fadeIn {
        animation-name: fadeIn;
      }

      .animation-slideInUp {
        animation-name: slideInUp;
      }

      .animation-slideInDown {
        animation-name: slideInDown;
      }

      .animation-slideInLeft {
        animation-name: slideInLeft;
      }

      .animation-slideInRight {
        animation-name: slideInRight;
      }

      .animation-zoomIn {
        animation-name: zoomIn;
      }

      .animation-bounceIn {
        animation-name: bounceIn;
      }

      .animation-flipInX {
        animation-name: flipInX;
      }

      .animation-flipInY {
        animation-name: flipInY;
      }

      .animation-rotateIn {
        animation-name: rotateIn;
      }

      /* Outro Animations */
      .animation-fadeOut {
        animation-name: fadeOut;
      }

      .animation-slideOutUp {
        animation-name: slideOutUp;
      }

      .animation-slideOutDown {
        animation-name: slideOutDown;
      }

      .animation-slideOutLeft {
        animation-name: slideOutLeft;
      }

      .animation-slideOutRight {
        animation-name: slideOutRight;
      }

      .animation-zoomOut {
        animation-name: zoomOut;
      }

      .animation-bounceOut {
        animation-name: bounceOut;
      }

      .animation-flipOutX {
        animation-name: flipOutX;
      }

      .animation-flipOutY {
        animation-name: flipOutY;
      }

      .animation-rotateOut {
        animation-name: rotateOut;
      }

      /* State-based Animations */
      .animation-pulse {
        animation-name: pulse;
        animation-iteration-count: infinite;
      }

      .animation-vibrate {
        animation-name: vibrate;
        animation-iteration-count: infinite;
      }

      .animation-rotate-left {
        animation-name: rotateLeft;
        animation-iteration-count: infinite;
      }

      .animation-rotate-right {
        animation-name: rotateRight;
        animation-iteration-count: infinite;
      }

      .animation-hover {
        animation-name: hover;
        animation-iteration-count: infinite;
      }

      .animation-fade {
        animation-name: fadeInOut;
        animation-iteration-count: infinite;
      }

      .animation-scale {
        animation-name: scale;
        animation-iteration-count: infinite;
      }

      .animation-bounce {
        animation-name: bounce;
        animation-iteration-count: infinite;
      }

      .animation-shake {
        animation-name: shake;
        animation-iteration-count: infinite;
      }

      .animation-tada {
        animation-name: tada;
        animation-iteration-count: infinite;
      }

      /* Animation Keyframes */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes zoomIn {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes flipInX {
        from {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
        to {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes flipInY {
        from {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
        to {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
      }

      @keyframes rotateIn {
        from {
          transform: rotate(-200deg);
          opacity: 0;
        }
        to {
          transform: rotate(0deg);
          opacity: 1;
        }
      }

      @keyframes slideOutUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      @keyframes slideOutLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes zoomOut {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0);
          opacity: 0;
        }
      }

      @keyframes bounceOut {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        25% {
          transform: scale(0.95);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(0);
          opacity: 0;
        }
      }

      @keyframes flipOutX {
        from {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
      }

      @keyframes flipOutY {
        from {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
      }

      @keyframes rotateOut {
        from {
          transform: rotate(0deg);
          opacity: 1;
        }
        to {
          transform: rotate(200deg);
          opacity: 0;
        }
      }

      /* State-based Animation Keyframes */
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

      @keyframes rotateLeft {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotateRight {
        from {
          transform: rotate(0deg);
        }
        to {
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

      @keyframes fadeInOut {
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
        53%,
        80%,
        100% {
          transform: translateY(0);
        }
        40%,
        43% {
          transform: translateY(-15px);
        }
        70% {
          transform: translateY(-7px);
        }
        90% {
          transform: translateY(-3px);
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

      @keyframes slideOutUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes zoomIn {
        from {
          transform: scale(0.3);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes zoomOut {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounceOut {
        20% {
          transform: scale(0.9);
        }
        50%,
        55% {
          transform: scale(1.05);
          opacity: 1;
        }
        100% {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes flipInX {
        from {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateX(-20deg);
        }
        60% {
          transform: perspective(400px) rotateX(10deg);
        }
        80% {
          transform: perspective(400px) rotateX(-5deg);
        }
        to {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutX {
        from {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
      }

      @keyframes flipInY {
        from {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateY(-20deg);
        }
        60% {
          transform: perspective(400px) rotateY(10deg);
        }
        80% {
          transform: perspective(400px) rotateY(-5deg);
        }
        to {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutY {
        from {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
      }

      @keyframes rotateIn {
        from {
          transform: rotate(-200deg);
          opacity: 0;
        }
        to {
          transform: rotate(0);
          opacity: 1;
        }
      }

      @keyframes rotateOut {
        from {
          transform: rotate(0);
          opacity: 1;
        }
        to {
          transform: rotate(200deg);
          opacity: 0;
        }
      }

      /* Popup Module Styles */
      .ultra-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 8000;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }

      /* Ensure popup appears above HA edit outlines in preview contexts */
      ha-preview .ultra-popup-overlay,
      .live-preview .ultra-popup-overlay,
      [data-preview-context='ha-preview'] .ultra-popup-overlay,
      [data-preview-context='live'] .ultra-popup-overlay {
        z-index: 2147483647 !important;
      }

      .ultra-popup-container {
        position: relative;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }

      .ultra-popup-close-button {
        cursor: pointer;
        transition:
          transform 0.2s ease,
          opacity 0.2s ease;
        user-select: none;
      }

      .ultra-popup-close-button:hover {
        transform: scale(1.1);
        opacity: 0.8;
      }

      /* Popup Layout Variations */
      .ultra-popup-layout-full_screen {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
      }

      .ultra-popup-layout-left_panel {
        position: absolute;
        left: 0;
        top: 0;
        height: 100vh;
        max-height: 100vh;
      }

      .ultra-popup-layout-right_panel {
        position: absolute;
        right: 0;
        top: 0;
        height: 100vh;
        max-height: 100vh;
      }

      .ultra-popup-layout-top_panel {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        max-width: 100vw;
      }

      .ultra-popup-layout-bottom_panel {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100vw;
        max-width: 100vw;
      }

      /* Container queries for responsive behavior in sections view */
      @container (max-width: 300px) {
        .card-row {
          margin-bottom: 8px;
        }

        .card-column {
          gap: 8px;
        }
      }

      /* Pro Module Locked Overlay */
      .pro-module-locked {
        position: relative;
        width: 100%;
        min-height: 200px;
        isolation: isolate;
        display: block !important;
      }

      .pro-module-locked > *:first-child {
        position: relative;
        z-index: 1;
        filter: blur(3px);
        opacity: 0.4;
        pointer-events: none;
        user-select: none;
      }

      .pro-module-overlay {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(20, 20, 20, 0.85) !important;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: ${Z_INDEX.DIALOG_OVERLAY} !important;
        border-radius: 8px;
        cursor: not-allowed !important;
        pointer-events: all !important;
        user-select: none !important;
      }

      .pro-module-message {
        display: flex !important;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: linear-gradient(
          135deg,
          rgba(var(--rgb-primary-color, 33, 150, 243), 0.95),
          rgba(var(--rgb-accent-color, 255, 152, 0), 0.85)
        );
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        color: white !important;
        position: relative;
        z-index: ${Z_INDEX.DIALOG_CONTENT};
        pointer-events: none;
        user-select: none;
        max-width: 95%;
      }

      .pro-module-message ha-icon {
        --mdc-icon-size: 24px;
        color: white !important;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }

      .pro-module-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        user-select: none;
        min-width: 0;
        flex: 1;
      }

      .pro-module-text strong {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        color: white !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pro-module-text span {
        font-size: 11px;
        opacity: 0.95;
        line-height: 1.3;
        color: white !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Compact view for smaller containers */
      @container (max-width: 250px) {
        .pro-module-message {
          padding: 8px 10px;
          gap: 6px;
          border-radius: 8px;
        }

        .pro-module-message ha-icon {
          --mdc-icon-size: 18px;
        }

        .pro-module-text strong {
          font-size: 11px;
        }

        .pro-module-text span {
          font-size: 9px;
        }
      }

      /* Extra compact for very small containers */
      @container (max-width: 180px) {
        .pro-module-message {
          flex-direction: column;
          padding: 6px;
          gap: 4px;
        }

        .pro-module-message ha-icon {
          --mdc-icon-size: 16px;
        }

        .pro-module-text {
          align-items: center;
          text-align: center;
          gap: 2px;
        }

        .pro-module-text strong {
          font-size: 10px;
        }

        .pro-module-text span {
          display: none;
        }
      }
    `;
  }
}

// Immediate fallback registration to ensure element is always available
setTimeout(() => {
  if (!customElements.get('ultra-card')) {
    try {
      customElements.define('ultra-card', UltraCard);
    } catch (error) {
      // Silent fallback
    }
  }
}, 0);
