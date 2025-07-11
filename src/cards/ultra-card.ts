import { LitElement, html, css, TemplateResult, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  UltraCardConfig,
  CardModule,
  CardRow,
  CardColumn,
  TextModule,
  SeparatorModule,
  InfoModule,
  BarModule,
  IconModule,
  InfoEntityConfig,
  IconConfig,
} from '../types';
import { getModuleRegistry } from '../modules';
import { logicService } from '../services/logic-service';
import { configValidationService } from '../services/config-validation-service';

// Import editor at top level to ensure it's available
import '../editor/ultra-card-editor';

@customElement('ultra-card')
export class UltraCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false, type: Object }) public config?: UltraCardConfig;

  @state() private _moduleVisibilityState = new Map<string, boolean>();
  @state() private _animatingModules = new Set<string>();
  private _lastHassChangeTime = 0;

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
      }

      // Force re-render when config changes
      this.requestUpdate();
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
      console.error('❌ Ultra Card: Config validation failed', {
        errors: validationResult.errors,
        warnings: validationResult.warnings,
      });
      throw new Error(`Invalid configuration: ${validationResult.errors.join(', ')}`);
    }

    // Check for duplicate module IDs and fix them
    const uniqueIdCheck = configValidationService.validateUniqueModuleIds(
      validationResult.correctedConfig!
    );

    let finalConfig = validationResult.correctedConfig!;
    if (!uniqueIdCheck.valid) {
      console.warn('⚠️  Ultra Card: Duplicate module IDs detected, fixing...', {
        duplicates: uniqueIdCheck.duplicates,
      });
      finalConfig = configValidationService.fixDuplicateModuleIds(finalConfig);
    }

    // Log validation info for debugging
    if (validationResult.warnings.length > 0) {
      console.info('ℹ️  Ultra Card: Config corrected with warnings', {
        warnings: validationResult.warnings,
        totalModules: this._countTotalModules(finalConfig),
      });
    }

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
                    text: 'Welcome to Ultra Card',
                    font_size: 24,
                    color: '#2196f3',
                    alignment: 'center',
                  } as TextModule,
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

  private _getCardStyle(): string {
    if (!this.config) return '';

    const styles = [];

    // Apply background color
    if (this.config.card_background) {
      styles.push(`background: ${this.config.card_background}`);
    }

    // Apply border radius
    if (this.config.card_border_radius !== undefined) {
      styles.push(`border-radius: ${this.config.card_border_radius}px`);
    }

    // Apply padding
    if (this.config.card_padding !== undefined) {
      styles.push(`padding: ${this.config.card_padding}px`);
    }

    // Apply margin
    if (this.config.card_margin !== undefined) {
      styles.push(`margin: ${this.config.card_margin}px`);
    }

    return styles.join('; ');
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

    // Check for row-level state-based animation
    const rowAnimationClass = this._getStateBasedAnimationClass(row.design);
    const rowStyles = this._generateRowStyles(row);

    const rowContent = html`
      <div class="card-row" style=${rowStyles}>
        ${row.columns.map(column => this._renderColumn(column))}
      </div>
    `;

    // Apply row-level animation if configured
    if (rowAnimationClass) {
      const animationDuration = row.design?.animation_duration || '2s';
      const animationDelay = row.design?.animation_delay || '0s';
      const animationTiming = row.design?.animation_timing || 'ease';

      return html`
        <div
          class="row-animation-wrapper ${rowAnimationClass}"
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

    // Check for column-level state-based animation
    const columnAnimationClass = this._getStateBasedAnimationClass(column.design);
    const columnStyles = this._generateColumnStyles(column);

    const columnContent = html`
      <div class="card-column" style=${columnStyles}>
        ${column.modules.map(module => this._renderModule(module))}
      </div>
    `;

    // Apply column-level animation if configured
    if (columnAnimationClass) {
      const animationDuration = column.design?.animation_duration || '2s';
      const animationDelay = column.design?.animation_delay || '0s';
      const animationTiming = column.design?.animation_timing || 'ease';

      return html`
        <div
          class="column-animation-wrapper ${columnAnimationClass}"
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

    // Animation state tracking (debug logging removed for cleaner console)

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
      // If no entity is configured, play animation continuously
      if (!stateAnimationEntity) {
        shouldTriggerStateAnimation = true;
      }
      // If entity is configured, check the state/attribute condition
      else if (stateAnimationState && this.hass) {
        const entity = this.hass.states[stateAnimationEntity];
        if (entity) {
          if (stateAnimationTriggerType === 'attribute' && stateAnimationAttribute) {
            // Check attribute value
            const attributeValue = entity.attributes[stateAnimationAttribute];
            shouldTriggerStateAnimation = String(attributeValue) === stateAnimationState;
          } else {
            // Check entity state
            shouldTriggerStateAnimation = entity.state === stateAnimationState;
          }
        }
      }
    }

    // Animation state tracking

    // Determine animation state and class BEFORE updating visibility state
    let animationClass = '';
    let willStartAnimation = false;

    // Handle state-based animations first (priority over intro/outro)
    if (shouldTriggerStateAnimation && stateAnimationType !== 'none') {
      animationClass = `animation-${stateAnimationType}`;
      // State-based animations are continuous when condition is met
    }
    // Handle visibility changes with animations (only if no state animation active)
    else if (previouslyVisible !== undefined && previouslyVisible !== isVisible) {
      if (isVisible && introAnimation !== 'none') {
        // Prevent duplicate animations - only start if not already animating
        if (!isAnimating) {
          // Module becoming visible - apply intro animation immediately
          animationClass = `animation-${introAnimation}`;
          willStartAnimation = true;
          this._animatingModules.add(moduleId);

          // Schedule animation cleanup
          setTimeout(
            () => {
              this._animatingModules.delete(moduleId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          // Still apply the animation class if already animating
          animationClass = `animation-${introAnimation}`;
        }
      } else if (!isVisible && outroAnimation !== 'none') {
        // Prevent duplicate animations - only start if not already animating
        if (!isAnimating) {
          // Module becoming hidden - apply outro animation immediately
          animationClass = `animation-${outroAnimation}`;
          willStartAnimation = true;
          this._animatingModules.add(moduleId);

          // Schedule animation cleanup
          setTimeout(
            () => {
              this._animatingModules.delete(moduleId);
              this.requestUpdate();
            },
            this._parseAnimationDuration(animationDuration) +
              this._parseAnimationDuration(animationDelay)
          );
        } else {
          // Still apply the animation class if already animating
          animationClass = `animation-${outroAnimation}`;
        }
      }
    } else if (isAnimating) {
      // Currently animating - determine which animation class to apply
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

    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    let moduleContent: TemplateResult;
    if (moduleHandler && this.hass) {
      moduleContent = moduleHandler.renderPreview(module, this.hass);
    } else {
      // Fallback for unknown module types
      moduleContent = html`
        <div class="unknown-module">
          <span>Unknown Module: ${module.type}</span>
        </div>
      `;
    }

    // Apply animation wrapper if needed (or if module has animation properties)
    if (
      animationClass ||
      introAnimation !== 'none' ||
      outroAnimation !== 'none' ||
      shouldTriggerStateAnimation
    ) {
      return html`
        <div
          class="module-animation-wrapper ${animationClass}"
          style="
            --animation-duration: ${animationDuration};
            --animation-delay: ${animationDelay};
            --animation-timing: ${animationTiming};
          "
        >
          ${moduleContent}
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

    const baseStyles = {
      display: 'grid',
      gridTemplateColumns: this._getGridTemplateColumns(
        row.column_layout || '1-col',
        row.columns.length
      ),
      gap: `${row.gap || 16}px`,
      marginBottom: '16px',
    };

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
          ? `${design.margin_top || '0'} ${design.margin_right || '0'} ${design.margin_bottom || '16px'} ${design.margin_left || '0'}`
          : row.margin
            ? `${row.margin}px`
            : undefined,
      // Background
      background: design.background_color || row.background_color || 'transparent',
      // Border
      border:
        design.border_style && design.border_style !== 'none'
          ? `${design.border_width || '1px'} ${design.border_style} ${design.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this._addPixelUnit(design.border_radius) ||
        (row.border_radius ? `${row.border_radius}px` : '0'),
      // Position
      position: design.position || 'relative',
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

    const baseStyles = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      // Apply column alignment
      alignItems:
        column.horizontal_alignment === 'left'
          ? 'flex-start'
          : column.horizontal_alignment === 'right'
            ? 'flex-end'
            : column.horizontal_alignment === 'stretch'
              ? 'stretch'
              : 'center',
      justifyContent:
        column.vertical_alignment === 'top'
          ? 'flex-start'
          : column.vertical_alignment === 'bottom'
            ? 'flex-end'
            : column.vertical_alignment === 'stretch'
              ? 'stretch'
              : 'center',
    };

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
      // Border
      border:
        design.border_style && design.border_style !== 'none'
          ? `${design.border_width || '1px'} ${design.border_style} ${design.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this._addPixelUnit(design.border_radius) ||
        (column.border_radius ? `${column.border_radius}px` : '0'),
      // Position
      position: design.position || 'relative',
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

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .card-container {
        background: var(--card-background-color, var(--ha-card-background, white));
        border-radius: 8px;
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        padding: 16px;
        transition: all 0.3s ease;
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
        margin-bottom: 16px;
      }

      .card-row:last-child {
        margin-bottom: 0;
      }

      .card-column {
        display: flex;
        flex-direction: column;
        gap: 8px;
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
    `;
  }
}

// Immediate fallback registration to ensure element is always available
setTimeout(() => {
  if (!customElements.get('ultra-card')) {
    console.warn('🔧 Ultra Card element not found, attempting manual registration...');
    try {
      customElements.define('ultra-card', UltraCard);
      console.log('✅ Ultra Card manually registered successfully');
    } catch (error) {
      console.error('❌ Failed to manually register Ultra Card:', error);
    }
  }
}, 0);
