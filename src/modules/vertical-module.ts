import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';
import { getImageUrl } from '../utils/image-upload';
import { UltraLinkComponent } from '../components/ultra-link';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { generateCSSVariables } from '../utils/css-variable-utils';

// Use the existing VerticalModule and HorizontalModule interfaces from types
import { VerticalModule, HorizontalModule } from '../types';

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

  createDefault(id?: string, hass?: HomeAssistant): VerticalModule {
    return {
      id: id || this.generateId('vertical'),
      type: 'vertical',
      // Main-axis (vertical) alignment defaults to 'center' for column layout
      alignment: 'center',
      // Cross-axis alignment for items in the single column defaults to 'stretch'
      horizontal_alignment: 'stretch',
      gap: 1.2,
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
              data: { horizontal_alignment: verticalModule.horizontal_alignment || 'center' },
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
                const prev = verticalModule.horizontal_alignment || 'center';
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
              data: { alignment: verticalModule.alignment || 'top' },
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
                const prev = verticalModule.alignment || 'top';
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

          <div style="margin-bottom: 8px;">
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              ${localize('editor.vertical.gap.between_items', lang, 'Gap Between Items')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${localize(
                'editor.vertical.gap.desc',
                lang,
                'Set the spacing between vertical items (in rem units). Use negative values to overlap items. Any value is allowed. Note: Gap is disabled when using Space Between or Space Around distribution.'
              )}
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px; ${verticalModule.alignment ===
                'space-between' || verticalModule.alignment === 'space-around'
                ? 'opacity: 0.5; pointer-events: none;'
                : ''}"
            >
              <input
                type="range"
                class="gap-slider"
                min="-50"
                max="50"
                step="0.1"
                .value="${verticalModule.gap !== undefined ? verticalModule.gap : 1.2}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseFloat(target.value);
                  updateModule({ gap: value });
                }}
              />
              <input
                type="number"
                class="gap-input"
                style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                step="0.1"
                .value="${verticalModule.gap !== undefined ? verticalModule.gap : 1.2}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseFloat(target.value);
                  if (!isNaN(value)) {
                    updateModule({ gap: value });
                  }
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const currentValue = parseFloat(target.value) || 0;
                    const increment = e.key === 'ArrowUp' ? 0.1 : -0.1;
                    const newValue = currentValue + increment;
                    const roundedValue = Math.round(newValue * 10) / 10;
                    updateModule({ gap: roundedValue });
                  }
                }}
              />
              <button
                class="reset-btn"
                @click=${() => updateModule({ gap: 1.2 })}
                title="Reset to default (1.2)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
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
    const gapValue = verticalModule.gap !== undefined ? verticalModule.gap : 1.2;
    const containerStyles = {
      padding: this.getPaddingCSS(effective),
      margin: this.getMarginCSS(effective),
      background: this.getBackgroundCSS(effective),
      backgroundImage: this.getBackgroundImageCSS(effective, hass),
      backgroundSize: effective.background_size || 'cover',
      backgroundPosition: effective.background_position || 'center',
      backgroundRepeat: effective.background_repeat || 'no-repeat',
      border: effective.border_width ? this.getBorderCSS(effective) : 'none',
      borderRadius: this.addPixelUnit(effective.border_radius) || '0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: this.getJustifyContent(verticalModule.alignment || 'center'),
      // Only use gap for positive values and when not using space distribution modes
      // space-between and space-around handle their own spacing
      gap:
        gapValue >= 0 &&
        verticalModule.alignment !== 'space-between' &&
        verticalModule.alignment !== 'space-around'
          ? `${gapValue}rem`
          : '0',
      alignItems: this.getAlignItems(verticalModule.horizontal_alignment || 'center'),
      // Only set width if user explicitly controls it, otherwise let flexbox handle sizing
      width: (effective as any).width || undefined,
      // Allow fully collapsed layouts when designers set 0 padding/margin
      minHeight: '0',
    };

    // Gesture handling variables
    let clickTimeout: any = null;
    let holdTimeout: any = null;
    let isHolding = false;
    let clickCount = 0;
    let lastClickTime = 0;

    // Handle gesture events for tap, hold, double-tap actions
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isHolding = false;

      // Start hold timer
      holdTimeout = setTimeout(() => {
        isHolding = true;
        if (verticalModule.hold_action && verticalModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            verticalModule.hold_action as any,
            hass,
            e.target as HTMLElement,
            config,
            (verticalModule as any).entity,
            verticalModule
          );
        }
      }, 500); // 500ms hold threshold
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      // Clear hold timer
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }

      // If this was a hold gesture, don't process as click
      if (isHolding) {
        isHolding = false;
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;

      // Double click detection (within 300ms)
      if (timeSinceLastClick < 300 && clickCount === 1) {
        // This is a double click
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickCount = 0;

        if (
          verticalModule.double_tap_action &&
          verticalModule.double_tap_action.action !== 'nothing'
        ) {
          UltraLinkComponent.handleAction(
            verticalModule.double_tap_action as any,
            hass,
            e.target as HTMLElement,
            config,
            (verticalModule as any).entity,
            verticalModule
          );
        }
      } else {
        // This might be a single click, but wait to see if double click follows
        clickCount = 1;
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
          // This is a single click
          clickCount = 0;

          // Execute tap action
          if (!verticalModule.tap_action || verticalModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (verticalModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config,
              (verticalModule as any).entity,
              verticalModule
            );
          }
        }, 300); // Wait 300ms to see if double click follows
      }
    };

    // Extract CSS variable prefix for Shadow DOM styling
    const cssVarPrefix = (verticalModule as any).design?.css_variable_prefix;

    // Apply CSS variables if prefix is provided (allows Shadow DOM override)
    if (cssVarPrefix) {
      const cssVars = generateCSSVariables(cssVarPrefix, (verticalModule as any).design);
      Object.assign(containerStyles, cssVars);
    }

    return html`
      <div class="vertical-module-preview">
        <div
          class="vertical-preview-content"
          style="${this.styleObjectToCss(containerStyles)}; cursor: ${(verticalModule.tap_action &&
            verticalModule.tap_action.action !== 'nothing') ||
          (verticalModule.hold_action && verticalModule.hold_action.action !== 'nothing') ||
          (verticalModule.double_tap_action &&
            verticalModule.double_tap_action.action !== 'nothing')
            ? 'pointer'
            : 'default'};"
          @pointerdown=${handlePointerDown}
          @pointerup=${handlePointerUp}
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
                return visibleChildren.map((childModule, index) => {
                  // Apply negative margin for overlapping when gap is negative and not using space distribution
                  const useNegativeMargin =
                    gapValue < 0 &&
                    index > 0 &&
                    verticalModule.alignment !== 'space-between' &&
                    verticalModule.alignment !== 'space-around';
                  const childMargin = useNegativeMargin ? `${gapValue}rem 0 0 0` : '0';
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
                });
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
    `;
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

    // Apply horizontal alignment inheritance - only for child LAYOUT modules
    // Info, Image, Bar, and Text modules have their own alignment systems and should preserve them
    if (layoutDesign.horizontal_alignment && 
        (childModule.type === 'horizontal' || childModule.type === 'vertical')) {
      mergedModule.alignment = layoutDesign.horizontal_alignment;
    }

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

    // Validate nested modules - allow 2 levels of nesting but prevent deeper nesting
    if (verticalModule.modules && verticalModule.modules.length > 0) {
      for (const childModule of verticalModule.modules) {
        // Allow horizontal, vertical, and accordion modules at level 1
        if (childModule.type === 'horizontal' || childModule.type === 'vertical' || childModule.type === 'accordion') {
          const layoutChild = childModule as HorizontalModule | VerticalModule;

          // Check level 2 nesting - allow layout modules but prevent level 3
          if (layoutChild.modules && layoutChild.modules.length > 0) {
            for (const nestedModule of layoutChild.modules) {
              if (nestedModule.type === 'horizontal' || nestedModule.type === 'vertical' || nestedModule.type === 'accordion') {
                const deepLayoutModule = nestedModule as HorizontalModule | VerticalModule;

                // Check level 3 nesting - prevent any layout modules at this level
                if (deepLayoutModule.modules && deepLayoutModule.modules.length > 0) {
                  for (const deepNestedModule of deepLayoutModule.modules) {
                    if (
                      deepNestedModule.type === 'horizontal' ||
                      deepNestedModule.type === 'vertical' ||
                      deepNestedModule.type === 'accordion'
                    ) {
                      errors.push(
                        'Layout modules cannot be nested more than 2 levels deep. Remove layout modules from the third level.'
                      );
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

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
    return moduleWithDesign.background_color || 'transparent';
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
    const width = this.addPixelUnit(moduleWithDesign.border_width) || '0';
    const style = moduleWithDesign.border_style || 'solid';
    const color = moduleWithDesign.border_color || 'transparent';
    return `${width} ${style} ${color}`;
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
        min-height: 60px;
      }

      .vertical-preview-content {
        background: transparent;
        border-radius: 6px;
        border: none;
        transition: all 0.2s ease;
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

      /* Gap control styles */
      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gap-slider {
        flex: 1;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .gap-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider:hover {
        background: var(--primary-color);
        opacity: 0.7;
      }

      .gap-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
      }

      .gap-slider:hover::-moz-range-thumb {
        transform: scale(1.1);
      }

      .gap-input {
        width: 48px !important;
        max-width: 48px !important;
        min-width: 48px !important;
        padding: 4px 6px !important;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .gap-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .reset-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      .reset-btn ha-icon {
        font-size: 16px;
      }
    `;
  }
}
