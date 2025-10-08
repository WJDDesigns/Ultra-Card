import { LitElement, html, css, TemplateResult, PropertyValues } from 'lit';
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

// Import editor at top level to ensure it's available
import '../editor/ultra-card-editor';

@customElement('ultra-card')
export class UltraCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false, type: Object }) public config?: UltraCardConfig;

  @state() private _moduleVisibilityState = new Map<string, boolean>();
  @state() private _animatingModules = new Set<string>();
  @state() private _rowVisibilityState = new Map<string, boolean>();
  @state() private _columnVisibilityState = new Map<string, boolean>();
  @state() private _animatingRows = new Set<string>();
  @state() private _animatingColumns = new Set<string>();
  @state() private _cloudUser: CloudUser | null = null;
  private _lastHassChangeTime = 0;
  private _templateUpdateListener?: () => void;
  private _authListener?: (user: CloudUser | null) => void;
  /**
   * Flag to ensure module CSS is injected only once per card instance.
   */
  private _moduleStylesInjected = false;

  connectedCallback(): void {
    super.connectedCallback();

    // Inject combined CSS from all registered modules so that any module-specific
    // styles (e.g. icon animations) are available inside this card's shadow-root.
    // Without this, classes like `.icon-animation-pulse` will render but have no
    // effect because the corresponding keyframes are missing.
    this._injectModuleStyles();

    // Inject hover effect styles into this card's shadow root
    UcHoverEffectsService.injectHoverEffectStyles(this.shadowRoot!);

    // Set up clock update service to trigger re-renders for clock modules
    clockUpdateService.setUpdateCallback(() => {
      this.requestUpdate();
    });

    // Listen for template updates from modules
    this._templateUpdateListener = () => {
      this.requestUpdate();
      // Update hover styles when configuration changes
      this._updateHoverEffectStyles();
    };
    window.addEventListener('ultra-card-template-update', this._templateUpdateListener);

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
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

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

    // Clean up auth listener
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
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

  protected willUpdate(changedProps: PropertyValues): void {
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

      // Throttle updates to avoid excessive re-renders (max once every 100ms)
      if (currentTime - this._lastHassChangeTime > 100) {
        this._lastHassChangeTime = currentTime;

        // Update logic service with new hass instance
        if (this.hass) {
          logicService.setHass(this.hass);
        }

        // Request update to re-evaluate logic conditions
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

    // Check for duplicate module IDs and fix them
    const uniqueIdCheck = configValidationService.validateUniqueModuleIds(
      validationResult.correctedConfig!
    );

    let finalConfig = validationResult.correctedConfig!;
    if (!uniqueIdCheck.valid) {
      // Duplicate module IDs detected; fixing silently
      finalConfig = configValidationService.fixDuplicateModuleIds(finalConfig);
    }

    // Suppress console info; warnings are surfaced in-editor only

    this.config = { ...finalConfig };
    // Request update to ensure re-render with new config
    this.requestUpdate();
  }

  // Tell Home Assistant this card has a visual editor
  public static getConfigElement(): HTMLElement {
    return document.createElement('ultra-card-editor');
  }

  // Provide default configuration for new cards
  public static getStubConfig(): UltraCardConfig {
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
                modules: [
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
                ],
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
    // Default ON for new/unspecified configs; allow opt-out by setting to false
    return this.config?.responsive_scaling !== false;
  }

  private _checkAndScaleContent() {
    if (!this._isScalingEnabled()) {
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

    // Get the container's available width (from parent)
    const availableWidth = this.offsetWidth;

    // If lastMeasuredWidth is 0, this is a forced recalculation - always proceed
    const forcedCheck = this._lastMeasuredWidth === 0;
    const currentlyScaledDown = this._currentScale < 1;

    if (!forcedCheck && !currentlyScaledDown) {
      // Skip if width hasn't changed significantly (prevents feedback loops)
      // BUT always allow check if we need to reset scale back to 1 (when going from narrow to wide)
      const widthChanged = Math.abs(availableWidth - this._lastMeasuredWidth) >= 5;
      const needsReset = availableWidth > this._lastMeasuredWidth;

      if (!widthChanged && !needsReset) {
        this._isScalingInProgress = false;
        return;
      }
    }

    this._lastMeasuredWidth = availableWidth;

    // Temporarily disable observer to prevent feedback loop
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    // Reset to native size before measuring
    this._forceResetScale();
    container.style.transformOrigin = 'top left';

    // Force a layout recalculation
    void container.offsetHeight;

    // Wait for next frame to ensure layout is complete
    requestAnimationFrame(() => {
      // Get the actual content width (including overflow)
      const contentWidth = container.scrollWidth;

      // Calculate scale needed
      let finalScale = 1;

      // Only scale if content is actually wider than available space
      // Add a small threshold to prevent unnecessary scaling for minor differences
      if (contentWidth > availableWidth + 10 && availableWidth > 0) {
        const scale = availableWidth / contentWidth;
        // Use exact scale (no shrinking margin) and clamp
        finalScale = Math.max(0.5, Math.min(1, scale));
      }

      // Avoid tiny repeated downscales; if new target is within 0.02 of current, keep current
      if (this._currentScale < 1 && finalScale < 1) {
        if (Math.abs(finalScale - this._currentScale) < 0.02) {
          finalScale = this._currentScale;
        }
      }

      // If the available width grew relative to last measure, prefer resetting to 1.0
      if (availableWidth >= this._lastMeasuredWidth) {
        finalScale = 1;
      }

      // Always apply the calculated scale (even if it's 1.0) to ensure proper reset
      this._currentScale = finalScale;

      if (finalScale < 1) {
        container.style.transform = `scale(${finalScale})`;
        container.style.transformOrigin = 'top left';
        container.style.width = `${100 / finalScale}%`;
      } else {
        // Explicitly reset to ensure we return to normal size
        container.style.transform = '';
        container.style.width = '';
        container.style.transformOrigin = '';
      }

      // Re-enable observer after changes are applied
      if (this._resizeObserver && this._isScalingEnabled()) {
        // Re-observe on next frame to avoid immediate feedback
        requestAnimationFrame(() => {
          if (this._resizeObserver && this._isScalingEnabled()) {
            this._resizeObserver.observe(this);
          }
          this._isScalingInProgress = false;
        });
      } else {
        this._isScalingInProgress = false;
      }
    });
  }

  private _getCardStyle(): string {
    if (!this.config) return '';

    const styles = [];

    // Apply background color
    if (this.config.card_background) {
      styles.push(`background-color: ${this.config.card_background}`);
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

    // Row animation handling (state-based + intro/outro)
    const rowId = (row as any).id || `row-${Math.random()}`;
    const previouslyVisible = this._rowVisibilityState.get(rowId);
    const isVisible = true; // At this point row is visible by logic checks

    // Get animation properties
    const introAnimation = row.design?.intro_animation || 'none';
    const outroAnimation = row.design?.outro_animation || 'none';
    const animationDuration = row.design?.animation_duration || '2s';
    const animationDelay = row.design?.animation_delay || '0s';
    const animationTiming = row.design?.animation_timing || 'ease';

    // State-based animation class
    const stateAnimationClass = this._getStateBasedAnimationClass(row.design);

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

    // Get hover effect configuration from row design
    const hoverEffect = row.design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    const rowContent = html`
      <div class="card-row ${hoverEffectClass}" style=${rowStyles}>
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

    // Column animation handling (state-based + intro/outro)
    const columnId = (column as any).id || `column-${Math.random()}`;
    const previouslyVisible = this._columnVisibilityState.get(columnId);
    const isVisible = true; // Logic checks passed above

    const introAnimation = column.design?.intro_animation || 'none';
    const outroAnimation = column.design?.outro_animation || 'none';
    const animationDuration = column.design?.animation_duration || '2s';
    const animationDelay = column.design?.animation_delay || '0s';
    const animationTiming = column.design?.animation_timing || 'ease';

    const stateAnimationClass = this._getStateBasedAnimationClass(column.design);

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

    // Get hover effect configuration from column design
    const hoverEffect = column.design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    const columnContent = html`
      <div class="card-column ${hoverEffectClass}" style=${columnStyles}>
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
      }
    );

    // If this is a pro module and user doesn't have access, show overlay
    if (shouldShowProOverlay) {
      return html`
        <div
          class="pro-module-locked"
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

    return moduleContent;
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

    // Collect from rows
    this.config.layout?.rows?.forEach(row => {
      if (row.design?.hover_effect) {
        configs.push(row.design.hover_effect);
      }

      // Collect from columns
      row.columns?.forEach(column => {
        if (column.design?.hover_effect) {
          configs.push(column.design.hover_effect);
        }

        // Collect from modules
        column.modules?.forEach(module => {
          if ((module as any).design?.hover_effect) {
            configs.push((module as any).design.hover_effect);
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
   * Convert column layout ID to CSS grid template columns
   */
  private _getGridTemplateColumns(layout: string, columnCount: number): string {
    const layouts: Record<string, string> = {
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

    // Return the specific layout if it exists, otherwise fall back to equal columns
    return layouts[layout] || `repeat(${columnCount}, 1fr)`;
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
    const design = row.design || {};

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
        row.columns.length
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

    const designStyles = {
      // Padding
      padding:
        design.padding_top || design.padding_bottom || design.padding_left || design.padding_right
          ? `${design.padding_top || '0'} ${design.padding_right || '0'} ${design.padding_bottom || '0'} ${design.padding_left || '0'}`
          : row.padding
            ? `${row.padding}px`
            : undefined,
      // Margin (override default marginBottom if design margin is set)
      margin:
        design.margin_top || design.margin_bottom || design.margin_left || design.margin_right
          ? `${design.margin_top || '0'} ${design.margin_right || '0'} ${design.margin_bottom || '0'} ${design.margin_left || '0'}`
          : row.margin
            ? `${row.margin}px`
            : undefined,
      // Background
      background: design.background_color || row.background_color || 'transparent',
      backgroundImage: this._resolveBackgroundImageCSS(design),
      backgroundSize: design.background_size || (design.background_image ? 'cover' : undefined),
      backgroundPosition:
        design.background_position || (design.background_image ? 'center' : undefined),
      backgroundRepeat:
        design.background_repeat || (design.background_image ? 'no-repeat' : undefined),
      // Border
      border:
        design.border_style && design.border_style !== 'none'
          ? `${design.border_width || '1px'} ${design.border_style} ${design.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this._addPixelUnit(design.border_radius) ||
        (row.border_radius ? `${row.border_radius}px` : '0'),
      // Position
      position: design.position || 'inherit',
      top: design.top || 'auto',
      bottom: design.bottom || 'auto',
      left: design.left || 'auto',
      right: design.right || 'auto',
      zIndex: design.z_index || 'auto',
      // Size
      width: design.width || '100%',
      height: design.height || 'auto',
      maxWidth: design.max_width || 'none',
      maxHeight: design.max_height || 'none',
      minWidth: design.min_width || 'none',
      minHeight: design.min_height || 'auto',
      // Effects
      overflow: design.overflow || 'visible',
      clipPath: design.clip_path || 'none',
      backdropFilter: design.backdrop_filter || 'none',
      filter: design.background_filter || 'none',
      // Shadow
      boxShadow:
        design.box_shadow_h && design.box_shadow_v
          ? `${design.box_shadow_h || '0'} ${design.box_shadow_v || '0'} ${design.box_shadow_blur || '0'} ${design.box_shadow_spread || '0'} ${design.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

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
    const design = column.design || {};

    const baseStyles: Record<string, string> = {
      display: 'flex',
      flexDirection: 'column',
      // No gap - row controls spacing between columns, modules within column have no forced spacing
    };

    // Apply column alignment only if explicitly set
    if (column.horizontal_alignment) {
      baseStyles.alignItems =
        column.horizontal_alignment === 'left'
          ? 'flex-start'
          : column.horizontal_alignment === 'right'
            ? 'flex-end'
            : column.horizontal_alignment === 'stretch'
              ? 'stretch'
              : 'center';
    }

    if (column.vertical_alignment) {
      baseStyles.justifyContent =
        column.vertical_alignment === 'top'
          ? 'flex-start'
          : column.vertical_alignment === 'bottom'
            ? 'flex-end'
            : column.vertical_alignment === 'stretch'
              ? 'stretch'
              : 'center';
    }

    const designStyles = {
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
      // Background
      background: design.background_color || column.background_color || 'transparent',
      backgroundImage: this._resolveBackgroundImageCSS(design),
      backgroundSize: design.background_size || (design.background_image ? 'cover' : undefined),
      backgroundPosition:
        design.background_position || (design.background_image ? 'center' : undefined),
      backgroundRepeat:
        design.background_repeat || (design.background_image ? 'no-repeat' : undefined),
      // Border
      border:
        design.border_style && design.border_style !== 'none'
          ? `${design.border_width || '1px'} ${design.border_style} ${design.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this._addPixelUnit(design.border_radius) ||
        (column.border_radius ? `${column.border_radius}px` : '0'),
      // Position
      position: design.position || 'inherit',
      top: design.top || 'auto',
      bottom: design.bottom || 'auto',
      left: design.left || 'auto',
      right: design.right || 'auto',
      zIndex: design.z_index || 'auto',
      // Size
      width: design.width || '100%',
      height: design.height || 'auto',
      maxWidth: design.max_width || 'none',
      maxHeight: design.max_height || 'none',
      minWidth: design.min_width || 'none',
      minHeight: design.min_height || 'auto',
      // Effects
      overflow: design.overflow || 'visible',
      clipPath: design.clip_path || 'none',
      backdropFilter: design.backdrop_filter || 'none',
      filter: design.background_filter || 'none',
      // Shadow
      boxShadow:
        design.box_shadow_h && design.box_shadow_v
          ? `${design.box_shadow_h || '0'} ${design.box_shadow_v || '0'} ${design.box_shadow_blur || '0'} ${design.box_shadow_spread || '0'} ${design.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

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
   * Check if the current user has pro access
   * Must be authenticated AND have active pro subscription
   */
  private _hasProAccess(): boolean {
    // Must be authenticated with valid token
    if (!ucCloudAuthService.isAuthenticated()) {
      return false;
    }

    // Must have user data
    if (!this._cloudUser) {
      return false;
    }

    // Must have active pro subscription
    const hasPro =
      this._cloudUser.subscription?.tier === 'pro' &&
      this._cloudUser.subscription?.status === 'active';

    return hasPro;
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
        overflow: hidden; /* keep column from exceeding its card area */
      }

      /* Ensure media inside columns never exceed the column width */
      .card-column img,
      .card-column svg {
        max-width: 100%;
        height: auto;
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
        /* Inherit width from content */
        display: inherit;
        width: inherit;
        height: inherit;
        flex: inherit;
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

      /* Container queries for responsive behavior in sections view */
      @container (max-width: 300px) {
        .card-row {
          margin-bottom: 8px;
        }

        .card-column {
          gap: 8px;
        }
      }

      @container (min-width: 500px) {
        .card-row {
          margin-bottom: 16px;
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
        z-index: 9999 !important;
        border-radius: 8px;
        cursor: not-allowed !important;
        pointer-events: all !important;
        user-select: none !important;
      }

      .pro-module-message {
        display: flex !important;
        align-items: center;
        gap: 12px;
        padding: 20px 28px;
        background: linear-gradient(
          135deg,
          rgba(var(--rgb-primary-color, 33, 150, 243), 0.95),
          rgba(var(--rgb-accent-color, 255, 152, 0), 0.85)
        );
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        color: white !important;
        position: relative;
        z-index: 10000;
        pointer-events: none;
        user-select: none;
      }

      .pro-module-message ha-icon {
        --mdc-icon-size: 36px;
        color: white !important;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }

      .pro-module-text {
        display: flex;
        flex-direction: column;
        gap: 6px;
        user-select: none;
      }

      .pro-module-text strong {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
        color: white !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .pro-module-text span {
        font-size: 14px;
        opacity: 0.95;
        line-height: 1.3;
        color: white !important;
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
