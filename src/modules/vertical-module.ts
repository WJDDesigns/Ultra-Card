import { TemplateResult, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';
import { getImageUrl } from '../utils/image-upload';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { generateCSSVariables } from '../utils/css-variable-utils';
import { computeBackgroundStyles } from '../utils/uc-color-utils';

// Use the existing VerticalModule interface from types
import { VerticalModule } from '../types';

export class UltraVerticalModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'vertical',
    title: 'Vertical Layout',
    description: 'Arrange modules in columns with flexible alignment and spacing',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:view-agenda',
    category: 'layout',
    tags: ['layout', 'vertical', 'alignment', 'container', 'flexbox'],
  };

  /**
   * The vertical module applies all design-tab styles (background, padding, margin,
   * border, shadow, backdrop-filter, etc.) directly on its own .vertical-preview-content
   * container via containerStyles in renderPreview.  Letting uc-module-preview-service
   * also wrap it with the same styles causes double application of margin/padding which
   * shifts the vertical position of the content within the column and breaks
   * column vertical-alignment centering.
   */
  handlesOwnDesignStyles = true;

  createDefault(id?: string, hass?: HomeAssistant): VerticalModule {
    return {
      id: id || this.generateId('vertical'),
      type: 'vertical',
      // Main-axis (vertical) alignment defaults to 'center' for column layout
      alignment: 'center',
      // Cross-axis alignment for items in the single column defaults to 'stretch'
      horizontal_alignment: 'stretch',
      gap: 8,
      gap_unit: 'px',
      modules: [],
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const verticalModule = module as VerticalModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.vertical.layout.title', lang, 'Layout Configuration'),
          localize(
            'editor.vertical.layout.desc',
            lang,
            'Configure alignment and spacing for items in a single column.'
          ),
          [
            {
              title: localize('editor.vertical.alignment.horizontal', lang, 'Horizontal Alignment'),
              description: localize(
                'editor.vertical.alignment.horizontal_desc',
                lang,
                'Choose how items are aligned horizontally within the column.'
              ),
              hass,
              data: { horizontal_alignment: verticalModule.horizontal_alignment || 'stretch' },
              schema: [
                this.selectField('horizontal_alignment', [
                  { value: 'left', label: localize('editor.common.left', lang, 'Left') },
                  { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                  { value: 'right', label: localize('editor.common.right', lang, 'Right') },
                  { value: 'stretch', label: localize('editor.common.stretch', lang, 'Stretch') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.horizontal_alignment;
                const prev = verticalModule.horizontal_alignment || 'stretch';
                if (next === prev) return;
                updateModule(e.detail.value);
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
            {
              title: localize('editor.vertical.alignment.vertical', lang, 'Vertical Distribution'),
              description: localize(
                'editor.vertical.alignment.vertical_desc',
                lang,
                'How items are distributed along the vertical axis.'
              ),
              hass,
              data: { alignment: verticalModule.alignment || 'center' },
              schema: [
                this.selectField('alignment', [
                  { value: 'top', label: localize('editor.common.top', lang, 'Top') },
                  { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                  { value: 'bottom', label: localize('editor.common.bottom', lang, 'Bottom') },
                  {
                    value: 'space-between',
                    label: localize('editor.common.space_between', lang, 'Space Between'),
                  },
                  {
                    value: 'space-around',
                    label: localize('editor.common.space_around', lang, 'Space Around'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.alignment;
                const prev = verticalModule.alignment || 'center';
                if (next === prev) return;
                updateModule(e.detail.value);
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Gap Between Items Field with Custom Slider -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.vertical.gap.title', lang, 'Gap Configuration')}
          </div>

          ${(() => {
            // Backward compat: if gap_unit is not stored, the value was rem (old behavior)
            const unit: string = (verticalModule as any).gap_unit || 'rem';
            const isPx = unit === 'px';
            const isRem = unit === 'rem' || unit === 'em';
            const defaultVal = isPx ? 8 : 1.2;
            const gapNum = verticalModule.gap !== undefined && verticalModule.gap !== null
              ? Number(verticalModule.gap)
              : defaultVal;
            const sliderMin = isPx ? -100 : -10;
            const sliderMax = isPx ? 100 : 10;
            const sliderStep = isPx ? 1 : 0.1;
            const disabled = verticalModule.alignment === 'space-between' || verticalModule.alignment === 'space-around';

            const convertGap = (fromUnit: string, toUnit: string, val: number): number => {
              if (fromUnit === toUnit) return val;
              const toPx = (v: number, u: string) => u === 'px' ? v : u === '%' ? v : u === 'vw' ? v : u === 'vh' ? v : v * 16;
              const fromPx = (v: number, u: string) => u === 'px' ? v : u === '%' ? v : u === 'vw' ? v : u === 'vh' ? v : Math.round((v / 16) * 10) / 10;
              return fromPx(toPx(val, fromUnit), toUnit);
            };

            const unitOptions = [
              { value: 'px', label: 'px' },
              { value: 'rem', label: 'rem' },
              { value: 'em', label: 'em' },
              { value: '%', label: '%' },
              { value: 'vw', label: 'vw' },
              { value: 'vh', label: 'vh' },
            ];

            return html`
              <div style="margin-bottom: 8px; ${disabled ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <div class="field-title">${localize('editor.vertical.gap.between_items', lang, 'Gap Between Items')} (${gapNum}${unit})</div>
                <div class="field-description" style="margin-bottom: 10px;">
                  ${localize('editor.vertical.gap.desc', lang, 'Set the spacing between vertical items. Use negative values to overlap items. Note: Gap is disabled when using Space Between or Space Around distribution.')}
                </div>
                <div class="gap-control-container" style="display: flex; align-items: center; gap: 8px;">
                  <select
                    style="flex-shrink: 0; width: 56px; height: 32px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color, var(--primary-background-color)); color: var(--primary-text-color); font-size: 13px; font-weight: 600; text-align: center; cursor: pointer; outline: none; padding: 0 4px;"
                    @change=${(e: Event) => {
                      const newUnit = (e.target as HTMLSelectElement).value;
                      const converted = convertGap(unit, newUnit, gapNum);
                      updateModule({ gap: converted, gap_unit: newUnit } as any);
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  >
                    ${unitOptions.map(opt => html`
                      <option value="${opt.value}" ?selected=${unit === opt.value}>${opt.label}</option>
                    `)}
                  </select>
                  <input
                    type="range"
                    class="gap-slider"
                    min="${sliderMin}"
                    max="${sliderMax}"
                    step="${sliderStep}"
                    .value="${String(gapNum)}"
                    @input=${(e: Event) => {
                      updateModule({ gap: Number((e.target as HTMLInputElement).value) });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="${sliderMin}"
                    max="${sliderMax}"
                    step="${sliderStep}"
                    .value="${String(gapNum)}"
                    @input=${(e: Event) => {
                      const val = Number((e.target as HTMLInputElement).value);
                      if (!isNaN(val)) {
                        updateModule({ gap: val });
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }
                    }}
                  />
                  <button
                    class="reset-btn"
                    @click=${() => {
                      updateModule({ gap: defaultVal });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                    title="Reset to default (${defaultVal}${unit})"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            `;
          })()}
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const verticalModule = module as VerticalModule;
    // Store config and previewContext for child rendering
    (this as any)._currentConfig = config;
    (this as any)._currentPreviewContext = previewContext;
    const lang = hass?.locale?.language || 'en';
    const moduleWithDesign = verticalModule as any;
    const effective = { ...moduleWithDesign, ...(moduleWithDesign.design || {}) } as any;
    const hasChildren = verticalModule.modules && verticalModule.modules.length > 0;

    // Container styles for positioning and effects
    const gapUnit: string = (verticalModule as any).gap_unit || 'rem';
    const isPxUnit = gapUnit === 'px';
    const gapValue = verticalModule.gap !== undefined && verticalModule.gap !== null
      ? Number(verticalModule.gap)
      : (isPxUnit ? 8 : 1.2);

    // When design.background_filter is set the background must be rendered via a ::before
    // pseudo-element so the filter (e.g. opacity(0.2)) only affects the background image
    // without blurring the content.  In that case we set CSS variables on the container
    // and rely on getStyles() ::before rule instead of inlining the background directly.
    const hasBackgroundFilter =
      (effective as any).background_filter &&
      (effective as any).background_filter !== 'none';

    const bgResult = hasBackgroundFilter
      ? { styles: {} as Record<string, string> }
      : computeBackgroundStyles({
          color: effective.background_color,
          fallback: 'transparent',
          image: this.getBackgroundImageCSS(effective, hass),
          imageSize: effective.background_size || 'cover',
          imagePosition: effective.background_position || 'center',
          imageRepeat: effective.background_repeat || 'no-repeat',
        });

    // Get border radius from multiple possible sources:
    // 1. design.border_radius (via effective spread)
    // 2. module root border_radius
    // 3. border.radius nested object (from module or design)
    const borderRadiusValue =
      effective.border_radius ||
      moduleWithDesign.border_radius ||
      (effective.border?.radius !== undefined ? effective.border.radius : undefined) ||
      (moduleWithDesign.border?.radius !== undefined ? moduleWithDesign.border.radius : undefined);

    const containerStyles: any = {
      padding: this.getPaddingCSS(effective),
      margin: this.getMarginCSS(effective),
      ...bgResult.styles,
      border:
        effective.border_width ||
        effective.border?.width ||
        effective.border_color ||
        effective.border?.color ||
        (effective.border_style && effective.border_style !== 'none') ||
        (effective.border?.style && effective.border.style !== 'none')
          ? this.getBorderCSS(effective)
          : 'none',
      borderRadius: this.addPixelUnit(borderRadiusValue) || '0',
      // Respect explicit positioning/z-index so the entire column can overlay siblings
      // If a z-index is provided but no position, use relative so z-index takes effect
      position: (effective as any).position || ((effective as any).z_index ? 'relative' : 'static'),
      zIndex: (effective as any).z_index || 'auto',
      // background_filter requires isolation so the ::before pseudo-element stays clipped
      ...(hasBackgroundFilter ? { isolation: 'isolate' } : {}),
      // Respect sizing controls from design/global design
      width: (effective as any).width || undefined,
      height: (effective as any).height || undefined,
      maxWidth: (effective as any).max_width || undefined,
      minWidth: (effective as any).min_width || undefined,
      maxHeight: (effective as any).max_height || undefined,
      boxShadow: (effective as any).box_shadow || undefined,
      backdropFilter: (effective as any).backdrop_filter || undefined,
      clipPath: (effective as any).clip_path || undefined,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: this.getJustifyContent(verticalModule.alignment || 'center'),
      // Only use gap for positive values and when not using space distribution modes
      // space-between and space-around handle their own spacing
      gap:
        gapValue >= 0 &&
        verticalModule.alignment !== 'space-between' &&
        verticalModule.alignment !== 'space-around'
          ? `${gapValue}${gapUnit}`
          : '0',
      alignItems: this.getAlignItems(verticalModule.horizontal_alignment || 'stretch'),
      // Allow fully collapsed layouts when designers set 0 padding/margin
      // Only set min-height if explicitly specified by user, otherwise let content determine height
      minHeight: (effective as any).min_height || 'auto',
      // Respect overflow settings from design properties
      // Default to 'hidden' when border-radius is set to clip children to rounded corners
      // Otherwise default to 'visible' for negative margin overlaps
      overflow: (() => {
        const explicitOverflow = (effective as any).overflow;
        // Respect explicit non-visible overflow settings
        if (explicitOverflow && explicitOverflow !== 'visible') {
          return explicitOverflow;
        }
        // If there's a border-radius, use hidden to clip corners
        if (
          borderRadiusValue &&
          String(borderRadiusValue) !== '0' &&
          String(borderRadiusValue) !== '0px'
        ) {
          return 'hidden';
        }
        // Default to visible for negative margin overlaps
        return explicitOverflow || 'visible';
      })(),
      boxSizing: 'border-box',
    };

    // Create gesture handlers using centralized service
    // Service automatically handles nested module editor control exclusion
    const handlers = this.createGestureHandlers(
      verticalModule.id,
      {
        tap_action: verticalModule.tap_action,
        hold_action: verticalModule.hold_action,
        double_tap_action: verticalModule.double_tap_action,
        entity: (verticalModule as any).entity,
        module: verticalModule,
      },
      hass,
      config
    );

    // Extract CSS variable prefix for Shadow DOM styling
    const cssVarPrefix = (verticalModule as any).design?.css_variable_prefix;

    // Apply CSS variables if prefix is provided (allows Shadow DOM override)
    if (cssVarPrefix) {
      const cssVars = generateCSSVariables(cssVarPrefix, (verticalModule as any).design);
      Object.assign(containerStyles, cssVars);
    }

    // When background_filter is set, inject the CSS variables for the ::before pseudo-element
    // (see getStyles() .vertical-preview-content[style*="--bg-filter"]::before rule)
    if (hasBackgroundFilter) {
      const bgImageCSS = this.getBackgroundImageCSS(effective, hass);
      if (bgImageCSS && bgImageCSS !== 'none') {
        containerStyles['--bg-image'] = bgImageCSS;
      }
      if (effective.background_color) {
        containerStyles['--bg-color'] = effective.background_color;
      }
      containerStyles['--bg-size'] = effective.background_size || 'cover';
      containerStyles['--bg-position'] = effective.background_position || 'center';
      containerStyles['--bg-repeat'] = effective.background_repeat || 'no-repeat';
      containerStyles['--bg-filter'] = (effective as any).background_filter;
      // Ensure position:relative so the pseudo-element can anchor
      if (!containerStyles.position || containerStyles.position === 'static') {
        containerStyles.position = 'relative';
      }
    }

    // Check if actions are configured
    const hasActions =
      (verticalModule.tap_action && verticalModule.tap_action.action !== 'nothing') ||
      (verticalModule.hold_action && verticalModule.hold_action.action !== 'nothing') ||
      (verticalModule.double_tap_action && verticalModule.double_tap_action.action !== 'nothing');

    const hoverClass = this.getHoverEffectClass(module);

    // Build design styles but strip all visual-surface properties from the outer wrapper.
    // border, borderRadius, background*, padding, boxShadow, backdropFilter, clipPath and
    // overflow are already applied on the inner .vertical-preview-content div via
    // containerStyles.  Keeping them on the outer wrapper too causes a visible double border
    // and double background.  Margin is also stripped — it is handled in containerStyles.
    const _allDesignStyles = this.buildDesignStyles(module, hass);
    const VISUAL_SURFACE_PROPS = new Set([
      'border', 'borderRadius',
      'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
      'background', 'backgroundColor', 'backgroundImage',
      'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
      'boxShadow', 'backdropFilter', 'webkitBackdropFilter',
      'clipPath', 'overflow', 'isolation', 'filter',
      'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    ]);
    const _wrapperOnlyStyles = Object.fromEntries(
      Object.entries(_allDesignStyles).filter(([k]) => !VISUAL_SURFACE_PROPS.has(k))
    ) as Record<string, string | undefined>;
    const designStyles = this.buildStyleString(_wrapperOnlyStyles);

    return this.wrapWithAnimation(html`
      <div class="vertical-module-preview ${hoverClass}" style="${designStyles}">
        <div
          class="vertical-preview-content"
          style="${this.styleObjectToCss(containerStyles)}; cursor: ${hasActions
            ? 'pointer'
            : 'default'}; ${hasActions ? 'pointer-events: auto;' : ''}"
          @pointerdown=${hasActions ? handlers.onPointerDown : null}
          @pointerup=${hasActions ? handlers.onPointerUp : null}
          @pointercancel=${hasActions ? handlers.onPointerCancel : null}
          @pointerleave=${hasActions ? handlers.onPointerLeave : null}
        >
          ${hasChildren
            ? (() => {
                // Filter hidden children so no empty space remains
                logicService.setHass(hass);
                const visibleChildren = verticalModule.modules!.filter(cm => {
                  const m: any = cm as any;
                  const visibleByModule = logicService.evaluateModuleVisibility(m);
                  const visibleByGlobal = logicService.evaluateLogicProperties({
                    logic_entity: m?.design?.logic_entity,
                    logic_attribute: m?.design?.logic_attribute,
                    logic_operator: m?.design?.logic_operator,
                    logic_value: m?.design?.logic_value,
                  });
                  return visibleByModule && visibleByGlobal;
                });
                return repeat(
                  visibleChildren,
                  (cm) => cm.id || cm.type,
                  (childModule, index) => {
                    const useNegativeMargin =
                      gapValue < 0 &&
                      index > 0 &&
                      verticalModule.alignment !== 'space-between' &&
                      verticalModule.alignment !== 'space-around';
                    const childMargin = useNegativeMargin ? `${gapValue}${gapUnit} 0 0 0` : '0';
                    const isNegativeGap = useNegativeMargin;
                    return html`
                      <div
                        class="child-module-preview ${isNegativeGap ? 'negative-gap' : ''}"
                        style="max-width: 100%; box-sizing: border-box; margin: ${childMargin}; ${isNegativeGap
                          ? 'padding: 0; border: none; background: transparent;'
                          : ''}"
                      >
                        ${this._renderChildModulePreview(
                          childModule,
                          hass,
                          moduleWithDesign,
                          (this as any)._currentConfig,
                          (this as any)._currentPreviewContext
                        )}
                      </div>
                    `;
                  }
                );
              })()
            : html`
                <div class="empty-layout-message">
                  <span
                    >${localize(
                      'editor.vertical.empty.no_modules',
                      lang,
                      'No modules added yet'
                    )}</span
                  >
                  <small
                    >${localize(
                      'editor.vertical.empty.add_modules',
                      lang,
                      'Add modules in the layout builder to see them here'
                    )}</small
                  >
                </div>
              `}
        </div>
      </div>
    `, module, hass);
  }

  private _renderChildModulePreview(
    childModule: CardModule,
    hass: HomeAssistant,
    layoutDesign?: any,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    // Apply layout design properties to child modules by creating a merged module
    let moduleToRender = childModule;

    if (layoutDesign) {
      moduleToRender = this.applyLayoutDesignToChild(childModule, layoutDesign);
    }

    // Horizontal alignment is now handled in applyLayoutDesignToChild method

    // Respect logic visibility for child modules
    logicService.setHass(hass);
    const childWithDesign: any = moduleToRender as any;
    const shouldShow = logicService.evaluateModuleVisibility(childWithDesign);
    const globalLogicVisible = logicService.evaluateLogicProperties({
      logic_entity: childWithDesign?.design?.logic_entity,
      logic_attribute: childWithDesign?.design?.logic_attribute,
      logic_operator: childWithDesign?.design?.logic_operator,
      logic_value: childWithDesign?.design?.logic_value,
    });

    if (!shouldShow || !globalLogicVisible) {
      return html``;
    }

    // Check if this is a pro module and if user has access (same logic as horizontal module)
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(moduleToRender.type);

    if (!moduleHandler) {
      return html``;
    }

    // Check Pro access for child modules
    const isProModule =
      moduleHandler.metadata?.tags?.includes('pro') ||
      moduleHandler.metadata?.tags?.includes('premium') ||
      false;

    // Check for Pro access using the same logic as ultra-card.ts
    let hasProAccess = false;
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    if (
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active'
    ) {
      hasProAccess = true;
    } else if (ucCloudAuthService.isAuthenticated()) {
      const cloudUser = ucCloudAuthService.getCurrentUser();
      if (cloudUser?.subscription?.tier === 'pro' && cloudUser?.subscription?.status === 'active') {
        hasProAccess = true;
      }
    }

    const shouldShowProOverlay = isProModule && !hasProAccess;

    if (moduleHandler) {
      const moduleContent = moduleHandler.renderPreview(
        moduleToRender,
        hass,
        config,
        previewContext
      );

      // If this is a pro module and user doesn't have access, show overlay
      if (shouldShowProOverlay) {
        return html`
          <div class="pro-module-locked" style="position: relative;">
            ${moduleContent}
            <div
              class="pro-module-overlay"
              style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.8);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 12px;
              z-index: 10;
            "
            >
              <div
                class="pro-module-message"
                style="
                text-align: center;
                color: white;
                padding: 6px;
                max-width: 95%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
              "
              >
                <ha-icon icon="mdi:lock" style="font-size: 20px; flex-shrink: 0;"></ha-icon>
                <div
                  style="font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;"
                >
                  Pro Module
                </div>
                <div style="font-size: 9px; opacity: 0.8; line-height: 1.2; display: none;">
                  Login to view
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Apply state-based animation wrapper for child modules when configured
      const m: any = moduleToRender as any;
      const animationType = m.animation_type || m.design?.animation_type;

      if (animationType && animationType !== 'none') {
        const animationDuration = m.animation_duration || m.design?.animation_duration || '2s';
        const animationDelay = m.animation_delay || m.design?.animation_delay || '0s';
        const animationTiming = m.animation_timing || m.design?.animation_timing || 'ease';

        // Evaluate entity condition if provided; otherwise always animate
        const entityId = m.animation_entity || m.design?.animation_entity;
        const triggerType = m.animation_trigger_type || m.design?.animation_trigger_type || 'state';
        const attribute = m.animation_attribute || m.design?.animation_attribute;
        const targetState = m.animation_state || m.design?.animation_state;

        let shouldAnimate = false;
        if (!entityId) {
          shouldAnimate = true;
        } else if (targetState && hass && hass.states[entityId]) {
          const entity = hass.states[entityId];
          if (triggerType === 'attribute' && attribute) {
            shouldAnimate = String(entity.attributes[attribute]) === targetState;
          } else {
            shouldAnimate = entity.state === targetState;
          }
        }

        if (shouldAnimate) {
          return html`
            <div
              class="module-animation-wrapper animation-${animationType}"
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
      }

      return moduleContent;
    }

    // Fallback for unknown module types
    return html`
      <div class="unknown-child-module">
        <ha-icon icon="mdi:help-circle"></ha-icon>
        <span>Unknown Module: ${moduleToRender.type}</span>
      </div>
    `;
  }

  /**
   * Apply layout module design properties to child modules
   * Layout properties override child module properties
   */
  private applyLayoutDesignToChild(childModule: CardModule, layoutDesign: any): CardModule {
    const mergedModule = { ...childModule } as any;

    // ── Margin zeroing ──────────────────────────────────────────────────────
    // When a module lives inside a vertical layout, the parent's gap property
    // is the sole source of spacing between children.  Modules that have NOT
    // been explicitly configured with a margin via the Design tab should render
    // with margin:0 so they don't double-stack space on top of the gap.
    // Modules that DO have an explicit Design-tab margin keep their value.
    const childDesign = (childModule as any).design || {};
    const hasExplicitMargin =
      childDesign.margin_top !== undefined ||
      childDesign.margin_bottom !== undefined ||
      childDesign.margin_left !== undefined ||
      childDesign.margin_right !== undefined ||
      (childModule as any).margin_top !== undefined ||
      (childModule as any).margin_bottom !== undefined ||
      (childModule as any).margin_left !== undefined ||
      (childModule as any).margin_right !== undefined;

    if (!hasExplicitMargin) {
      // Use '0' (truthy string) so the child's renderPreview enters the
      // explicit branch and outputs margin:0 instead of the '8px 0' fallback.
      mergedModule.margin_top = '0';
      mergedModule.margin_bottom = '0';
      mergedModule.margin_left = '0';
      mergedModule.margin_right = '0';
    }
    // ── End margin zeroing ──────────────────────────────────────────────────

    // Apply text properties if they exist in layout design
    if (layoutDesign.color) mergedModule.color = layoutDesign.color;
    if (layoutDesign.font_size) mergedModule.font_size = layoutDesign.font_size;
    if (layoutDesign.font_family) mergedModule.font_family = layoutDesign.font_family;
    if (layoutDesign.font_weight) mergedModule.font_weight = layoutDesign.font_weight;
    if (layoutDesign.text_align) mergedModule.text_align = layoutDesign.text_align;
    if (layoutDesign.line_height) mergedModule.line_height = layoutDesign.line_height;
    if (layoutDesign.letter_spacing) mergedModule.letter_spacing = layoutDesign.letter_spacing;
    if (layoutDesign.text_transform) mergedModule.text_transform = layoutDesign.text_transform;
    if (layoutDesign.font_style) mergedModule.font_style = layoutDesign.font_style;
    if (layoutDesign.white_space) mergedModule.white_space = layoutDesign.white_space;

    // Do NOT propagate container background styling to children.
    // Backgrounds belong to the container surface; passing them down causes
    // child modules to render their own filled backgrounds. Children should
    // remain transparent so the container background shows through.
    // Intentionally skip: background_color, background_image, backdrop_filter

    // Avoid pushing container sizing into children to prevent conflicting
    // constraints inside the column. Children manage their own size.
    // Intentionally skip: width/height/max/min

    // Do not propagate container spacing; it leads to double padding/margins
    // around children. Intentionally skip padding and margin props here.

    // Do NOT propagate borders to child modules. Borders define the container
    // shape; copying them down causes double rounding/lines.
    // Intentionally skip: border_radius/border_* properties

    // Apply shadow properties
    if (layoutDesign.text_shadow_h) mergedModule.text_shadow_h = layoutDesign.text_shadow_h;
    if (layoutDesign.text_shadow_v) mergedModule.text_shadow_v = layoutDesign.text_shadow_v;
    if (layoutDesign.text_shadow_blur)
      mergedModule.text_shadow_blur = layoutDesign.text_shadow_blur;
    if (layoutDesign.text_shadow_color)
      mergedModule.text_shadow_color = layoutDesign.text_shadow_color;
    if (layoutDesign.box_shadow_h) mergedModule.box_shadow_h = layoutDesign.box_shadow_h;
    if (layoutDesign.box_shadow_v) mergedModule.box_shadow_v = layoutDesign.box_shadow_v;
    if (layoutDesign.box_shadow_blur) mergedModule.box_shadow_blur = layoutDesign.box_shadow_blur;
    if (layoutDesign.box_shadow_spread)
      mergedModule.box_shadow_spread = layoutDesign.box_shadow_spread;
    if (layoutDesign.box_shadow_color)
      mergedModule.box_shadow_color = layoutDesign.box_shadow_color;

    // Skip container absolute positioning/z-index for children to avoid stacking issues.

    // Skip overflow/clip-path to prevent clipping child interactions.

    // Apply animation properties
    if (layoutDesign.animation_type) mergedModule.animation_type = layoutDesign.animation_type;
    if (layoutDesign.animation_entity)
      mergedModule.animation_entity = layoutDesign.animation_entity;
    if (layoutDesign.animation_trigger_type)
      mergedModule.animation_trigger_type = layoutDesign.animation_trigger_type;
    if (layoutDesign.animation_attribute)
      mergedModule.animation_attribute = layoutDesign.animation_attribute;
    if (layoutDesign.animation_state) mergedModule.animation_state = layoutDesign.animation_state;
    if (layoutDesign.intro_animation) mergedModule.intro_animation = layoutDesign.intro_animation;
    if (layoutDesign.outro_animation) mergedModule.outro_animation = layoutDesign.outro_animation;
    if (layoutDesign.animation_duration)
      mergedModule.animation_duration = layoutDesign.animation_duration;
    if (layoutDesign.animation_delay) mergedModule.animation_delay = layoutDesign.animation_delay;
    if (layoutDesign.animation_timing)
      mergedModule.animation_timing = layoutDesign.animation_timing;

    // NOTE: We intentionally do NOT inherit alignment from parent to child layout modules.
    // The child module's alignment controls its own internal content distribution (e.g., top/center/bottom/space-between).
    // The parent's horizontal_alignment controls cross-axis positioning, which is a different concept.
    // Inheriting these would incorrectly override the child's own alignment settings and break features like negative gap.

    return mergedModule;
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const verticalModule = module as VerticalModule;
    const errors = [...baseValidation.errors];

    // Gap validation removed - users can set any value they want

    // Note: Nesting depth validation removed - users can nest layouts as deep as they want

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Helper methods for style conversion and design properties
  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;
    if (/^\d+$/.test(value)) return `${value}px`;
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }
    return value;
  }

  private getPaddingCSS(moduleWithDesign: any): string {
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
      : '0px';
  }

  private getMarginCSS(moduleWithDesign: any): string {
    return moduleWithDesign.margin_top ||
      moduleWithDesign.margin_bottom ||
      moduleWithDesign.margin_left ||
      moduleWithDesign.margin_right
      ? `${this.addPixelUnit(moduleWithDesign.margin_top) || '0'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '0'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0'}`
      : '0';
  }

  private getBackgroundCSS(moduleWithDesign: any): string {
    const bgColor = moduleWithDesign.background_color || '';
    // If it's a gradient, return transparent so backgroundImage can be used instead
    if (
      bgColor &&
      (bgColor.includes('gradient') || bgColor.includes('linear-') || bgColor.includes('radial-'))
    ) {
      return 'transparent';
    }
    return bgColor || 'transparent';
  }

  private getBackgroundImageOrGradient(moduleWithDesign: any, hass: HomeAssistant): string {
    // Check if background_color is actually a gradient
    const bgColor = moduleWithDesign.background_color || '';
    if (
      bgColor &&
      (bgColor.includes('gradient') || bgColor.includes('linear-') || bgColor.includes('radial-'))
    ) {
      return bgColor;
    }
    // Otherwise use the regular background image logic
    return this.getBackgroundImageCSS(moduleWithDesign, hass);
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (
      !moduleWithDesign.background_image_type ||
      moduleWithDesign.background_image_type === 'none'
    ) {
      // Fallback to legacy background_image if present
      if (moduleWithDesign.background_image) {
        return `url("${moduleWithDesign.background_image}")`;
      }
      return 'none';
    }

    switch (moduleWithDesign.background_image_type) {
      case 'upload': {
        if (moduleWithDesign.background_image) {
          const resolved = getImageUrl(hass, moduleWithDesign.background_image);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        if (moduleWithDesign.background_image) {
          return `url("${moduleWithDesign.background_image}")`;
        }
        break;
      }

      case 'entity':
        if (
          moduleWithDesign.background_image_entity &&
          hass?.states[moduleWithDesign.background_image_entity]
        ) {
          const entityState = hass.states[moduleWithDesign.background_image_entity];
          let imageUrl = '';

          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            const resolved = getImageUrl(hass, imageUrl);
            return `url("${resolved}")`;
          }
        }
        break;
    }

    return 'none';
  }

  private getBorderCSS(moduleWithDesign: any): string {
    // Support both flat properties (legacy) and nested border object (current editor format)
    const width = moduleWithDesign.border_width ?? moduleWithDesign.border?.width;
    const style = moduleWithDesign.border_style ?? moduleWithDesign.border?.style ?? 'solid';
    const color = moduleWithDesign.border_color ?? moduleWithDesign.border?.color ?? 'var(--divider-color)';
    const hasStyle = style && style !== 'none';
    const resolvedWidth = this.addPixelUnit(String(width ?? '')) || (hasStyle ? '1px' : '0');
    return `${resolvedWidth} ${style} ${color}`;
  }

  private getJustifyContent(alignment: string): string {
    switch (alignment) {
      case 'top':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'bottom':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      case 'space-around':
        return 'space-around';
      default:
        return 'flex-start';
    }
  }

  private getAlignItems(horizontal: string): string {
    switch (horizontal) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  }

  getStyles(): string {
    return `
      /* Vertical Module Styles */
      .vertical-module-preview {
        /* Let flexbox handle width naturally - no forced width */
        /* Removed min-height: 60px to prevent background color showing in empty space */
      }

      .vertical-preview-content {
        background: transparent;
        border-radius: 6px;
        border: none;
        transition: all 0.2s ease;
        position: relative;
      }

      /* Background-filter pseudo-element — filters only the background, not the content */
      .vertical-preview-content[style*="--bg-filter"]::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: var(--bg-color, transparent);
        background-image: var(--bg-image, none);
        background-size: var(--bg-size, cover);
        background-position: var(--bg-position, center);
        background-repeat: var(--bg-repeat, no-repeat);
        filter: var(--bg-filter);
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
      }

      /* When vertical layout has actions, disable pointer events on children so container action takes precedence */
      .vertical-preview-content[style*="cursor: pointer"] .child-module-preview {
        pointer-events: none;
      }

      /* But allow specific interactive elements within children to still work if no parent action */
      .vertical-preview-content:not([style*="cursor: pointer"]) .child-module-preview {
        pointer-events: auto;
      }

      .child-module-preview {
        background: transparent;
        border: none;
        border-radius: 4px;
        padding: 0;
        transition: all 0.2s ease;
        /* Let flexbox handle width naturally - only constrain to prevent overflow */
        max-width: 100%;
        box-sizing: border-box;
      }

      .child-module-preview.negative-gap {
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
      }

      /* Legacy hover effects removed - now handled by new hover effects system */

      .empty-layout-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        width: 100%;
        padding: 20px;
      }

      .empty-layout-message span {
        font-size: 14px;
        font-weight: 500;
      }

      .empty-layout-message small {
        font-size: 12px;
        opacity: 0.8;
      }

      .unknown-child-module {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Scoped list-style reset to avoid stray bullet markers in preview */
      .vertical-module-preview ul,
      .vertical-module-preview ol {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .vertical-module-preview li::marker {
        content: '';
      }

      /* Standard field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
      
        margin-bottom: 4px !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }

      /* Custom Range Slider Styling */
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 3px;
        background: var(--disabled-color);
        outline: none;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      input[type="range"]:hover {
        opacity: 1;
      }

      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      input[type="range"]::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--disabled-color);
        border: none;
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
