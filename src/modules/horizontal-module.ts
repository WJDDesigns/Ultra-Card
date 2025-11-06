import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { getImageUrl } from '../utils/image-upload';
import { getModuleRegistry } from './module-registry';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
// Use the existing HorizontalModule and VerticalModule interfaces from types
import { HorizontalModule, VerticalModule } from '../types';

export class UltraHorizontalModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'horizontal',
    title: 'Horizontal Layout',
    description:
      'Arrange modules in rows with flexible horizontal and vertical alignment and spacing',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:view-column',
    category: 'layout',
    tags: ['layout', 'horizontal', 'vertical', 'alignment', 'container', 'flexbox'],
  };

  createDefault(id?: string, hass?: HomeAssistant): HorizontalModule {
    return {
      id: id || this.generateId('horizontal'),
      type: 'horizontal',
      alignment: 'center', // Default horizontal alignment to center
      vertical_alignment: 'center', // Default vertical alignment to center
      gap: 0.7,
      wrap: false,
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
    const horizontalModule = module as HorizontalModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.horizontal.layout.title', lang, 'Layout Configuration'),
          localize(
            'editor.horizontal.layout.desc',
            lang,
            'Configure how items are arranged horizontally within the container.'
          ),
          [
            {
              title: localize(
                'editor.horizontal.alignment.horizontal',
                lang,
                'Horizontal Alignment'
              ),
              description: localize(
                'editor.horizontal.alignment.horizontal_desc',
                lang,
                'Choose how items are aligned horizontally within the container.'
              ),
              hass,
              data: horizontalModule,
              schema: [
                this.selectField('alignment', [
                  { value: 'left', label: localize('editor.common.left', lang, 'Left') },
                  { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                  { value: 'right', label: localize('editor.common.right', lang, 'Right') },
                  {
                    value: 'space-between',
                    label: localize('editor.common.space_between', lang, 'Space Between'),
                  },
                  {
                    value: 'space-around',
                    label: localize('editor.common.space_around', lang, 'Space Around'),
                  },
                  { value: 'justify', label: localize('editor.common.justify', lang, 'Justify') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.alignment;
                const prev = horizontalModule.alignment || 'center';
                if (next === prev) return;

                updateModule(e.detail.value);
              },
            },
          ]
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.horizontal.alignment.vertical', lang, 'Vertical Alignment'),
            description: localize(
              'editor.horizontal.alignment.vertical_desc',
              lang,
              'Choose how items are aligned vertically within the container.'
            ),
            hass,
            data: horizontalModule,
            schema: [
              this.selectField('vertical_alignment', [
                { value: 'top', label: localize('editor.common.top', lang, 'Top') },
                { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                { value: 'bottom', label: localize('editor.common.bottom', lang, 'Bottom') },
                { value: 'stretch', label: localize('editor.common.stretch', lang, 'Stretch') },
                { value: 'baseline', label: localize('editor.common.baseline', lang, 'Baseline') },
              ]),
            ],
            onChange: (e: CustomEvent) => {
              const next = e.detail.value?.vertical_alignment;
              if (next === undefined || next === horizontalModule.vertical_alignment) return;

              updateModule({ vertical_alignment: next });
            },
          },
        ])}

        <!-- Allow Wrapping Toggle -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="flex: 1;">
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
              >
                ${localize('editor.horizontal.wrapping.title', lang, 'Allow Wrapping')}
              </div>
              <div
                class="field-description"
                style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
              >
                ${localize(
                  'editor.horizontal.wrapping.desc',
                  lang,
                  'Allow items to wrap to the next line when they exceed the container width.'
                )}
              </div>
            </div>
            <div style="margin-left: 16px;">
              <ha-switch
                .checked=${horizontalModule.wrap || false}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ wrap: target.checked });
                }}
              ></ha-switch>
            </div>
          </div>
        </div>

        <!-- Gap Between Items Field with Custom Slider -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.horizontal.gap.title', lang, 'Gap Configuration')}
          </div>

          <div style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              ${localize('editor.horizontal.gap.between_items', lang, 'Gap Between Items')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${localize(
                'editor.horizontal.gap.desc',
                lang,
                'Set the spacing between horizontal items (in rem units). Use negative values to overlap items. Any value is allowed.'
              )}
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="-50"
                max="50"
                step="0.1"
                .value="${horizontalModule.gap || 0.7}"
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
                .value="${horizontalModule.gap || 0.7}"
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
                    const currentValue = parseFloat(target.value) || 0.7;
                    const increment = e.key === 'ArrowUp' ? 0.1 : -0.1;
                    const newValue = currentValue + increment;
                    const roundedValue = Math.round(newValue * 10) / 10;
                    updateModule({ gap: roundedValue });
                  }
                }}
              />
              <button
                class="reset-btn"
                @click=${() => updateModule({ gap: 0.7 })}
                title="${localize(
                  'editor.fields.reset_default_value',
                  lang,
                  'Reset to default ({value})'
                ).replace('{value}', '0.7')}"
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
    const horizontalModule = module as HorizontalModule;
    // Store config and previewContext for child rendering
    (this as any)._currentConfig = config;
    (this as any)._currentPreviewContext = previewContext;
    const lang = hass?.locale?.language || 'en';
    const moduleWithDesign = horizontalModule as any;
    // Merge global design properties over module props for container rendering
    const effective = { ...moduleWithDesign, ...(moduleWithDesign.design || {}) } as any;
    const hasChildren = horizontalModule.modules && horizontalModule.modules.length > 0;
    // Wrapping should use flexbox wrap, not force column mode

    // Container styles for positioning and effects
    const gapValue = horizontalModule.gap || 0.7;
    // Prefer centered horizontal alignment by default
    const horizontalAlign =
      horizontalModule.alignment !== undefined && horizontalModule.alignment !== null
        ? horizontalModule.alignment
        : 'center';

    // Smart default width: fit-content for content-based alignments (wraps to content), 100% for distribution-based (needs full width)
    const width = ((effective as any).width !== undefined && (effective as any).width !== null && (effective as any).width !== '') 
      ? (effective as any).width 
      : (horizontalAlign === 'justify' || horizontalAlign === 'space-between' || horizontalAlign === 'space-around' 
        ? '100%' 
        : 'fit-content');

    // Determine if height is fit-content (when height is not explicitly set or is auto)
    const height = (effective as any).height || undefined;
    const isHeightFitContent = !height || height === 'auto' || height === 'fit-content';

    // Get vertical alignment for margin calculation
    const verticalAlign = horizontalModule.vertical_alignment || 'center';

    // Calculate margins with auto-positioning based on alignment
    const baseMargin = this.getMarginCSS(effective);
    // Parse margin string: "top right bottom left" or "0" if no margins set
    let marginTop = '0';
    let marginRight = '0';
    let marginBottom = '0';
    let marginLeft = '0';
    
    if (baseMargin && baseMargin !== '0') {
      const marginParts = baseMargin.split(' ');
      marginTop = marginParts[0] || '0';
      marginRight = marginParts[1] || '0';
      marginBottom = marginParts[2] || '0';
      marginLeft = marginParts[3] || '0';
    }

    // Check if user explicitly set margins (check both margin object and individual properties)
    const hasExplicitMarginTop = (effective as any).margin?.top !== undefined || (effective as any).margin_top !== undefined;
    const hasExplicitMarginRight = (effective as any).margin?.right !== undefined || (effective as any).margin_right !== undefined;
    const hasExplicitMarginBottom = (effective as any).margin?.bottom !== undefined || (effective as any).margin_bottom !== undefined;
    const hasExplicitMarginLeft = (effective as any).margin?.left !== undefined || (effective as any).margin_left !== undefined;

    // Apply horizontal auto margins based on alignment when width is fit-content
    if (width === 'fit-content' && !hasExplicitMarginLeft && !hasExplicitMarginRight) {
      if (horizontalAlign === 'left') {
        marginLeft = '0';
        marginRight = 'auto';
      } else if (horizontalAlign === 'right') {
        marginLeft = 'auto';
        marginRight = '0';
      } else if (horizontalAlign === 'center') {
        marginLeft = 'auto';
        marginRight = 'auto';
      }
      // For justify/space-between/space-around, no auto margins (needs full width, so width won't be fit-content anyway)
    }

    // Apply vertical auto margins based on vertical_alignment when height is fit-content
    if (isHeightFitContent && !hasExplicitMarginTop && !hasExplicitMarginBottom) {
      if (verticalAlign === 'top') {
        marginTop = '0';
        marginBottom = 'auto';
      } else if (verticalAlign === 'bottom') {
        marginTop = 'auto';
        marginBottom = '0';
      } else if (verticalAlign === 'center') {
        marginTop = 'auto';
        marginBottom = 'auto';
      }
      // For stretch/baseline, no auto margins (needs full height)
    }

    // Build final margin string
    const finalMargin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;

    // When width is fit-content, apply margin to wrapper for positioning
    // When width is 100%, margin stays on inner content for spacing
    const wrapperMargin = width === 'fit-content' ? finalMargin : undefined;
    const contentMargin = width === 'fit-content' ? undefined : finalMargin;

    const containerStyles: any = {
      padding: this.getPaddingCSS(effective),
      background: this.getBackgroundCSS(effective),
      backgroundImage: this.getBackgroundImageCSS(effective, hass),
      backgroundSize: effective.background_size || 'cover',
      backgroundPosition: effective.background_position || 'center',
      backgroundRepeat: effective.background_repeat || 'no-repeat',
      border: effective.border_width ? this.getBorderCSS(effective) : 'none',
      borderRadius: this.addPixelUnit(effective.border_radius) || '0',
      // Respect explicit positioning/z-index so the entire row can overlay siblings (e.g., camera)
      // If a z-index is provided but no position, use relative so z-index takes effect
      position: (effective as any).position || ((effective as any).z_index ? 'relative' : 'static'),
      zIndex: (effective as any).z_index || 'auto',
      // Respect sizing controls from design/global design
      // Smart default: fit-content for content-based alignments (wraps to content), 100% for distribution-based (needs full width)
      width: width,
      height: (effective as any).height || undefined,
      maxWidth: (effective as any).max_width || undefined,
      minWidth: (effective as any).min_width || undefined,
      maxHeight: (effective as any).max_height || undefined,
      boxShadow: (effective as any).box_shadow || undefined,
      backdropFilter: (effective as any).backdrop_filter || undefined,
      clipPath: (effective as any).clip_path || undefined,
      display: 'flex',
      // Always use row direction for horizontal layout
      flexDirection: 'row',
      // Use horizontal alignment for main axis (justify-content)
      justifyContent: this.getJustifyContent(horizontalAlign || 'center'),
      // Only use gap for positive values, use negative margins for negative values
      gap: gapValue >= 0 ? `${gapValue}rem` : '0',
      // Enable wrapping when wrap option is true
      flexWrap: horizontalModule.wrap ? 'wrap' : 'nowrap',
      // Use vertical alignment for cross-axis (align-items)
      alignItems: this.getAlignItems(horizontalModule.vertical_alignment || 'center'),
      // width is set above via design props with sensible default
      // Allow fully collapsed layouts when designers set 0 padding/margin
      // Only set min-height if explicitly specified by user, otherwise let content determine height
      minHeight: (effective as any).min_height || 'auto',
      // Allow overlaps (e.g., negative margins) to render across siblings
      overflowX: 'visible',
      overflowY: 'visible',
      boxSizing: 'border-box',
    };

    // Only add margin to containerStyles if contentMargin is defined
    if (contentMargin !== undefined) {
      containerStyles.margin = contentMargin;
    }

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
        if (horizontalModule.hold_action && horizontalModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            horizontalModule.hold_action as any,
            hass,
            e.target as HTMLElement,
            config
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
          horizontalModule.double_tap_action &&
          horizontalModule.double_tap_action.action !== 'nothing'
        ) {
          UltraLinkComponent.handleAction(
            horizontalModule.double_tap_action as any,
            hass,
            e.target as HTMLElement,
            config
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
          if (!horizontalModule.tap_action || horizontalModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (horizontalModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config,
              (horizontalModule as any).entity
            );
          }
        }, 300); // Wait 300ms to see if double click follows
      }
    };

    // Get hover effect configuration from module design
    const hoverEffect = (horizontalModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="horizontal-module-preview" style="width: ${containerStyles.width === 'fit-content' ? 'fit-content' : '100%'}; ${wrapperMargin ? `margin: ${wrapperMargin};` : ''}">
        <div
          class="horizontal-preview-content ${hoverEffectClass}"
          style="${this.styleObjectToCss(
            containerStyles
          )}; cursor: ${(horizontalModule.tap_action &&
            horizontalModule.tap_action.action !== 'nothing') ||
          (horizontalModule.hold_action && horizontalModule.hold_action.action !== 'nothing') ||
          (horizontalModule.double_tap_action &&
            horizontalModule.double_tap_action.action !== 'nothing')
            ? 'pointer'
            : 'default'};"
          data-wrap=${horizontalModule.wrap ? 'true' : 'false'}
        >
          ${hasChildren
            ? (() => {
                logicService.setHass(hass);
                const visibleChildren = horizontalModule.modules!.filter(cm => {
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
                  // Apply negative margin for overlapping when gap is negative
                  const childMargin = gapValue < 0 && index > 0 ? `0 0 0 ${gapValue}rem` : '0';
                  const isNegativeGap = gapValue < 0;

                  // In horizontal layouts we want bars and horizontal separators to take remaining width while
                  // icons and other modules keep their natural width. If alignment is
                  // 'justify' then allow all children to grow evenly.
                  const childType = (childModule as any)?.type;
                  const isBar = childType === 'bar';
                  const isHorizontalSeparator =
                    childType === 'separator' &&
                    ((childModule as any)?.orientation === 'horizontal' ||
                      !(childModule as any)?.orientation);
                  const isExternalCard = childType === 'external_card';
                  const isLayoutChild =
                    childType === 'horizontal' ||
                    childType === 'vertical' ||
                    childType === 'slider';
                  const allowGrowForAll = horizontalModule.alignment === 'justify';
                  const shouldGrow =
                    isBar ||
                    isHorizontalSeparator ||
                    isExternalCard ||
                    allowGrowForAll ||
                    isLayoutChild;
                  const flexGrow = shouldGrow ? 1 : 0;
                  const flexShrink = shouldGrow ? 1 : 0;
                  const flexBasis = shouldGrow ? '0' : 'content';
                  // Ensure bars and separators remain visible
                  const minWidth = isBar ? '80px' : isHorizontalSeparator ? '20px' : '0';
                  const alignSelf = 'auto';

                  // Build style string - external cards don't get explicit width
                  const baseStyles = `
                    overflow: visible;
                    flex-grow: ${flexGrow};
                    flex-shrink: ${flexShrink};
                    flex-basis: ${flexBasis};
                    min-width: ${minWidth};
                    ${!isExternalCard ? `width: auto;` : ''}
                    ${isExternalCard || isLayoutChild ? `max-width: 100%;` : ''}
                    align-self: ${alignSelf};
                    box-sizing: border-box;
                    margin: ${childMargin};
                  `;
                  const negativeGapStyles = isNegativeGap
                    ? 'padding: 0; border: none; background: transparent;'
                    : '';

                  return html`
                    <div
                      class="child-module-preview ${isNegativeGap ? 'negative-gap' : ''}"
                      style="${baseStyles} ${negativeGapStyles}"
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
                      'editor.horizontal.empty.no_modules',
                      lang,
                      'No modules added yet'
                    )}</span
                  >
                  <small
                    >${localize(
                      'editor.horizontal.empty.add_modules',
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

    // Pass the horizontal layout's alignment to child modules if they don't have their own
    const horizontalModule = layoutDesign as any;
    if (horizontalModule && horizontalModule.alignment) {
      const childAsAny = moduleToRender as any;
      // Only override child alignment if it's not explicitly set
      if (!childAsAny.alignment) {
        childAsAny.alignment = horizontalModule.alignment;
      }
    }

    // Respect logic visibility for child modules (same rules as top-level)
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

    // Check if this is a pro module and if user has access (imported from ultra-card.ts logic)
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

    // Do NOT propagate container background styling to children.
    // Backgrounds belong to the container surface. If we pass them down,
    // child modules (e.g., icons) get their own backgrounds unintentionally.
    // Keeping children transparent allows the container background to show
    // through naturally without overwriting child design.
    // Intentionally skip: background_color, background_image, backdrop_filter

    // IMPORTANT: Do not propagate container sizing/spacing/positioning to children.
    // These cause double-negative margins and width constraints on child modules.
    // Intentionally skip width/height/max/min, margins, padding, absolute offsets, z-index, etc.

    // Do NOT propagate borders to children. Border radii and borders define the
    // container shape; copying them to children causes double rounding and
    // visual artifacts. Children should control their own borders.
    // Intentionally skip: border_radius, border_style, border_width, border_color

    // Allow text shadows/box shadows to pass through for consistent style
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

    // Skip propagating overflow/clip-path to avoid clipping child interactions

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

    // Apply alignment inheritance - only for child LAYOUT modules
    // Info, Image, Bar, and Text modules have their own alignment systems and should preserve them
    if (
      layoutDesign.alignment &&
      (childModule.type === 'horizontal' || childModule.type === 'vertical')
    ) {
      mergedModule.alignment = layoutDesign.alignment;
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
    const horizontalModule = module as HorizontalModule;
    const errors = [...baseValidation.errors];

    // Gap validation removed - users can set any value they want

    // Validate vertical alignment value
    if (
      horizontalModule.vertical_alignment &&
      !['top', 'center', 'bottom', 'stretch', 'baseline'].includes(
        horizontalModule.vertical_alignment
      )
    ) {
      errors.push('Vertical alignment must be one of: top, center, bottom, stretch, baseline');
    }

    // Validate nested modules - allow 2 levels of nesting but prevent deeper nesting
    if (horizontalModule.modules && horizontalModule.modules.length > 0) {
      for (const childModule of horizontalModule.modules) {
        // Allow both horizontal and vertical modules at level 1
        if (childModule.type === 'horizontal' || childModule.type === 'vertical') {
          const layoutChild = childModule as HorizontalModule | VerticalModule;

          // Check level 2 nesting - allow layout modules but prevent level 3
          if (layoutChild.modules && layoutChild.modules.length > 0) {
            for (const nestedModule of layoutChild.modules) {
              if (nestedModule.type === 'horizontal' || nestedModule.type === 'vertical') {
                const deepLayoutModule = nestedModule as HorizontalModule | VerticalModule;

                // Check level 3 nesting - prevent any layout modules at this level
                if (deepLayoutModule.modules && deepLayoutModule.modules.length > 0) {
                  for (const deepNestedModule of deepLayoutModule.modules) {
                    if (
                      deepNestedModule.type === 'horizontal' ||
                      deepNestedModule.type === 'vertical'
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
    // Layout containers should have no default padding - only apply if explicitly set
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
      : '0';
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
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      case 'space-around':
        return 'space-around';
      case 'justify':
        return 'space-between';
      default:
        return 'flex-start';
    }
  }

  private getAlignItems(verticalAlignment: string): string {
    switch (verticalAlignment) {
      case 'top':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'bottom':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      case 'baseline':
        return 'baseline';
      default:
        return 'flex-start';
    }
  }

  getStyles(): string {
    return `
      /* Horizontal Module Styles */
      .horizontal-module-preview {
        width: 100%;
        /* No forced min-height - let content and user design properties control height */
      }

      .horizontal-preview-content {
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
        transition: all 0.2s ease, transform 0.3s ease;
        /* Child modules should respect parent container bounds */
        min-height: 0;
        overflow: visible;
        box-sizing: border-box;
      }

      /* Ensure external card wrappers handle scaling properly */
      .child-module-preview:has(.external-card-container) {
        overflow: visible;
        transform-origin: center center;
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

      /* Ensure module defaults play nicely in a horizontal row */
      .child-module-preview .icon-module-preview {
        /* Icon modules should size to content in rows */
        width: auto !important;
        max-width: 100% !important;
      }

      .child-module-preview .icon-module-container {
        /* Override any inline width from icon module when inside horizontal rows */
        width: auto !important;
        max-width: 100% !important;
        flex: 0 0 auto !important;
      }

      .child-module-preview .bar-module-preview {
        /* Bars should expand to available space in rows */
        width: 100% !important;
        max-width: 100% !important;
      }

      /* When wrapping is enabled, allow items to maintain their natural size */
      .horizontal-preview-content[data-wrap="true"] .child-module-preview {
        flex-shrink: 1;
        min-width: 0;
      }

      /* When wrapping is disabled, compress items to fit in one line */
      .horizontal-preview-content:not([data-wrap="true"]) .child-module-preview {
        flex-shrink: 1;
        min-width: 0;
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
