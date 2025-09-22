import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ButtonModule, UltraCardConfig } from '../types';
import { LinkAction, linkService } from '../services/link-service';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import '../components/ultra-color-picker';
import { getImageUrl } from '../utils/image-upload';

export class UltraButtonModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'button',
    title: 'Button',
    description: 'Interactive buttons with actions',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:gesture-tap-button',
    category: 'interactive',
    tags: ['button', 'action', 'click', 'interactive'],
  };

  createDefault(id?: string, hass?: HomeAssistant): ButtonModule {
    return {
      id: id || this.generateId('button'),
      type: 'button',
      label: '',
      action: {
        action_type: 'none',
      },
      style: 'flat',
      // alignment: undefined, // No default alignment to allow Global Design tab control
      icon: '',
      icon_position: 'before',
      show_icon: false,
      background_color: 'var(--primary-color)',
      text_color: 'white',
      // Additional action configuration for future upgrade
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getButtonStyles(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'flat', label: localize('editor.button.styles.flat', lang, 'Flat (Default)') },
      { value: 'glossy', label: localize('editor.button.styles.glossy', lang, 'Glossy') },
      { value: 'embossed', label: localize('editor.button.styles.embossed', lang, 'Embossed') },
      { value: 'inset', label: localize('editor.button.styles.inset', lang, 'Inset') },
      {
        value: 'gradient-overlay',
        label: localize('editor.button.styles.gradient_overlay', lang, 'Gradient Overlay'),
      },
      { value: 'neon-glow', label: localize('editor.button.styles.neon_glow', lang, 'Neon Glow') },
      { value: 'outline', label: localize('editor.button.styles.outline', lang, 'Outline') },
      { value: 'glass', label: localize('editor.button.styles.glass', lang, 'Glass') },
      { value: 'metallic', label: localize('editor.button.styles.metallic', lang, 'Metallic') },
    ];
  }

  private getAlignmentOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'left', label: localize('editor.button.align.left', lang, 'Left') },
      { value: 'center', label: localize('editor.button.align.center', lang, 'Center') },
      { value: 'right', label: localize('editor.button.align.right', lang, 'Right') },
      {
        value: 'justify',
        label: localize('editor.button.align.justify', lang, 'Justify (Full Width)'),
      },
    ];
  }

  private getIconPositionOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'before', label: localize('editor.button.icon.before', lang, 'Before Text') },
      { value: 'after', label: localize('editor.button.icon.after', lang, 'After Text') },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const buttonModule = module as ButtonModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Basic Settings -->
        ${this.renderSettingsSection(
          localize('editor.button.basic.title', lang, 'Basic Settings'),
          localize(
            'editor.button.basic.desc',
            lang,
            'Configure the button appearance and text content.'
          ),
          [
            {
              title: localize('editor.button.text.title', lang, 'Button Text'),
              description: localize(
                'editor.button.text.desc',
                lang,
                'Text to display on the button (leave blank for icon-only).'
              ),
              hass,
              data: buttonModule,
              schema: [this.textField('label')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
            {
              title: localize('editor.button.style.title', lang, 'Button Style'),
              description: localize('editor.button.style.desc', lang, 'Visual style of the button'),
              hass,
              data: { style: buttonModule.style || 'flat' },
              schema: [this.selectField('style', this.getButtonStyles(lang))],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.style;
                const prev = buttonModule.style || 'flat';
                if (next === prev) return;
                updateModule(e.detail.value);
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
            {
              title: localize('editor.button.alignment.title', lang, 'Alignment'),
              description: localize(
                'editor.button.alignment.desc',
                lang,
                'How the button is aligned within its container'
              ),
              hass,
              data: { alignment: buttonModule.alignment || 'center' },
              schema: [this.selectField('alignment', this.getAlignmentOptions(lang))],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.alignment;
                const prev = buttonModule.alignment || 'center';
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

        <!-- Icon Settings -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.button.icon.title', lang, 'Icon Settings')}
          </div>

          <!-- Icon Field - Always visible -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.button.icon_field', lang, 'Icon'),
              localize(
                'editor.button.icon_desc',
                lang,
                'Icon to display (e.g., mdi:home). Selecting an icon will automatically enable icon display.'
              ),
              hass,
              { icon: buttonModule.icon || '' },
              [this.iconField('icon')],
              (e: CustomEvent) => {
                const updates = e.detail.value;
                // Auto-enable icon display when an icon is selected
                if (updates.icon && updates.icon.trim()) {
                  updates.show_icon = true;
                  // Set default icon position if not already set
                  if (!buttonModule.icon_position) {
                    updates.icon_position = 'before';
                  }
                } else if (!updates.icon || !updates.icon.trim()) {
                  // Auto-disable icon display when icon is cleared
                  updates.show_icon = false;
                }
                updateModule(updates);
              }
            )}
          </div>

          ${buttonModule.show_icon && buttonModule.icon
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.button.icon_position', lang, 'Icon Position'),
                    localize(
                      'editor.button.icon_position_desc',
                      lang,
                      'Position of the icon relative to text'
                    ),
                    hass,
                    { icon_position: buttonModule.icon_position || 'before' },
                    [this.selectField('icon_position', this.getIconPositionOptions(lang))],
                    (e: CustomEvent) => {
                      const next = e.detail.value.icon_position;
                      const prev = buttonModule.icon_position || 'before';
                      if (next === prev) return;
                      updateModule(e.detail.value);
                      // Trigger re-render to update dropdown UI
                      setTimeout(() => {
                        this.triggerPreviewUpdate();
                      }, 50);
                    }
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Colors -->
        <div class="settings-section">
          <div class="section-title">${localize('editor.button.colors.title', lang, 'Colors')}</div>

          <div class="color-controls">
            <ultra-color-picker
              .label=${localize('editor.button.colors.background', lang, 'Background Color')}
              .value=${buttonModule.background_color || 'var(--primary-color)'}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ background_color: e.detail.value })}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${localize('editor.button.colors.text', lang, 'Text Color')}
              .value=${buttonModule.text_color || 'white'}
              .defaultValue=${'white'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => updateModule({ text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Link Action removed: use global Tap/Hold/Double-Tap actions instead -->
      </div>
    `;
  }

  private renderLinkActionForm(
    action: LinkAction,
    hass: HomeAssistant,
    onUpdate: (action: LinkAction) => void
  ): TemplateResult {
    const actionTypes = linkService.getActionTypeOptions();

    return html`
      <div class="link-action-form">
        <!-- Action Type -->
        <div class="field-group" style="margin-bottom: 16px;">
          ${this.renderFieldSection(
            'Action Type',
            'Choose what happens when the button is clicked',
            hass,
            { action_type: action.action_type || 'none' },
            [this.selectField('action_type', actionTypes)],
            (e: CustomEvent) => {
              const next = e.detail.value.action_type;
              const prev = action.action_type || 'none';
              if (next === prev) return;
              onUpdate({ ...action, action_type: next });
              // Trigger re-render to update dropdown UI
              setTimeout(() => {
                this.triggerPreviewUpdate();
              }, 50);
            }
          )}
        </div>

        ${this.renderActionTypeSpecificFields(action, hass, onUpdate)}
      </div>
    `;
  }

  private renderActionTypeSpecificFields(
    action: LinkAction,
    hass: HomeAssistant,
    onUpdate: (action: LinkAction) => void
  ): TemplateResult {
    switch (action.action_type) {
      case 'toggle':
      case 'show_more_info':
      case 'trigger':
        return this.renderFieldSection(
          'Entity',
          'Select the entity to interact with',
          hass,
          { entity: action.entity || '' },
          [this.entityField('entity')],
          (e: CustomEvent) => onUpdate({ ...action, entity: e.detail.value.entity })
        );

      case 'navigate':
        return this.renderFieldSection(
          'Navigation Path',
          'Path to navigate to (e.g., /dashboard/energy)',
          hass,
          { navigation_path: action.navigation_path || '' },
          [this.textField('navigation_path')],
          (e: CustomEvent) =>
            onUpdate({ ...action, navigation_path: e.detail.value.navigation_path })
        );

      case 'url':
        return this.renderFieldSection(
          'URL',
          'URL to open (e.g., https://example.com)',
          hass,
          { url: action.url || '' },
          [this.textField('url')],
          (e: CustomEvent) => onUpdate({ ...action, url: e.detail.value.url })
        );

      case 'call_service':
        return html`
          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              'Service',
              'Service to call (e.g., light.turn_on)',
              hass,
              { service: action.service || '' },
              [this.textField('service')],
              (e: CustomEvent) => onUpdate({ ...action, service: e.detail.value.service })
            )}
          </div>

          <div class="field-group">
            ${this.renderFieldSection(
              'Service Data (JSON)',
              'Optional data to pass to the service (JSON format)',
              hass,
              { service_data: JSON.stringify(action.service_data || {}) },
              [this.textField('service_data')],
              (e: CustomEvent) => {
                try {
                  const parsed = JSON.parse(e.detail.value.service_data || '{}');
                  onUpdate({ ...action, service_data: parsed });
                } catch (error) {
                  console.warn('Invalid JSON in service data');
                }
              }
            )}
          </div>
        `;

      case 'none':
      default:
        return html``;
    }
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const buttonModule = module as ButtonModule;

    return GlobalActionsTab.render(buttonModule as any, hass, updates => updateModule(updates));
  }

  private renderButtonActionConfig(
    buttonModule: ButtonModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<ButtonModule>) => void
  ): TemplateResult {
    return html`
      <div style="margin-bottom: 16px;">
        ${this.renderSingleActionConfig(
          'Tap Action',
          'Action to perform when button is tapped',
          buttonModule.tap_action || { action: 'nothing' },
          hass,
          action => updateModule({ tap_action: action })
        )}
      </div>

      <div style="margin-bottom: 16px;">
        ${this.renderSingleActionConfig(
          'Hold Action',
          'Action to perform when button is held down',
          buttonModule.hold_action || { action: 'nothing' },
          hass,
          action => updateModule({ hold_action: action })
        )}
      </div>

      <div style="margin-bottom: 16px;">
        ${this.renderSingleActionConfig(
          'Double Tap Action',
          'Action to perform when button is double-tapped',
          buttonModule.double_tap_action || { action: 'nothing' },
          hass,
          action => updateModule({ double_tap_action: action })
        )}
      </div>
    `;
  }

  private renderSingleActionConfig(
    label: string,
    description: string,
    action: any,
    hass: HomeAssistant,
    updateAction: (action: any) => void
  ): TemplateResult {
    return html`
      <div style="margin-bottom: 16px;">
        <div
          class="field-title"
          style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
        >
          ${label}
        </div>
        <div style="margin-bottom: 12px;">
          <ha-form
            .hass=${hass}
            .data=${{
              action_config:
                action?.action === 'nothing' ? { ...action, action: 'default' } : action,
            }}
            .schema=${[
              {
                name: 'action_config',
                label: '',
                selector: {
                  ui_action: {
                    actions: [
                      'default',
                      'more-info',
                      'toggle',
                      'navigate',
                      'url',
                      'perform-action',
                      'assist',
                    ],
                  },
                },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label || ''}
            .computeDescription=${(schema: any) => schema.description || ''}
            @value-changed=${(e: CustomEvent) => {
              const newAction = e.detail.value?.action_config;
              if (newAction) {
                updateAction(newAction);
              }
            }}
          ></ha-form>
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const buttonModule = module as ButtonModule;

    // Apply design properties with priority - global design overrides module-specific props
    const moduleWithDesign = buttonModule as any;
    const designProperties = (buttonModule as any).design || {};

    // Resolve text and background styles
    const textColor = designProperties.color || buttonModule.text_color || 'white';
    const fontSize = designProperties.font_size || '14px';
    const backgroundColor =
      designProperties.background_color || buttonModule.background_color || 'var(--primary-color)';

    // Map style to visual treatment
    const styleClass = buttonModule.style || 'flat';
    const buttonBaseStyle = `
      color: ${textColor};
      padding: 12px 24px;
      font-size: ${fontSize};
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 40px;
    `;

    const styleOverrides: Record<string, string> = {
      flat: `background: ${backgroundColor}; border: none; box-shadow: none;`,
      glossy: `background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)) , ${backgroundColor}; border: none;`,
      embossed: `background: ${backgroundColor}; border: 1px solid rgba(0,0,0,0.15); box-shadow: inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.15);`,
      inset: `background: ${backgroundColor}; border: none; box-shadow: inset 0 2px 6px rgba(0,0,0,0.35);`,
      'gradient-overlay': `background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,0,0,0.15)), ${backgroundColor}; border: none;`,
      'neon-glow': `background: ${backgroundColor}; border: none; box-shadow: 0 0 10px ${backgroundColor}, 0 0 20px ${backgroundColor};`,
      outline: `background: transparent; border: 2px solid ${backgroundColor}; color: ${backgroundColor};`,
      glass: `background: ${backgroundColor}; backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.25);`,
      metallic: `background: linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7); color: #333; border: 1px solid #bbb;`,
    };

    const buttonStyle = `${buttonBaseStyle} ${styleOverrides[styleClass] || styleOverrides.flat}`;

    const alignment = `
      display: flex;
      justify-content: ${
        buttonModule.alignment === 'left'
          ? 'flex-start'
          : buttonModule.alignment === 'right'
            ? 'flex-end'
            : 'center'
      };
    `;

    // Container honors global design (padding/margin/background/border, etc.)
    const containerStyles = {
      // Keep container fluid so module sizing doesn't affect layout siblings
      width: '100%',
      height: 'auto',
      maxWidth: 'none',
      maxHeight: 'none',
      minWidth: 'auto',
      minHeight: 'auto',
      // Only apply padding if explicitly set by user
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right
          ? `${designProperties.padding_top || '0px'} ${designProperties.padding_right || '0px'} ${designProperties.padding_bottom || '0px'} ${designProperties.padding_left || '0px'}`
          : '0',
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right
          ? `${designProperties.margin_top || '8px'} ${designProperties.margin_right || '0'} ${designProperties.margin_bottom || '8px'} ${designProperties.margin_left || '0'}`
          : '8px 0',
      background: designProperties.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
      'border-radius': designProperties.border_radius || '8px',
      border:
        designProperties.border_style && designProperties.border_style !== 'none'
          ? `${designProperties.border_width || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`
          : 'none',
      'box-shadow':
        designProperties.box_shadow_h ||
        designProperties.box_shadow_v ||
        designProperties.box_shadow_blur ||
        designProperties.box_shadow_spread
          ? `${designProperties.box_shadow_h || '0px'} ${designProperties.box_shadow_v || '0px'} ${designProperties.box_shadow_blur || '0px'} ${designProperties.box_shadow_spread || '0px'} ${designProperties.box_shadow_color || 'rgba(0,0,0,.2)'}`
          : 'none',
      'box-sizing': 'border-box',
    } as Record<string, string>;

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
        if (buttonModule.hold_action && buttonModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            buttonModule.hold_action as any,
            hass,
            e.target as HTMLElement
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

        if (buttonModule.double_tap_action && buttonModule.double_tap_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            buttonModule.double_tap_action as any,
            hass,
            e.target as HTMLElement
          );
        }
      } else {
        // This might be a single click, but wait to see if double click follows
        clickCount = 1;
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
          // This is a single click
          clickCount = 0;

          // Execute tap action or fall back to legacy action
          if (buttonModule.tap_action && buttonModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              buttonModule.tap_action as any,
              hass,
              e.target as HTMLElement
            );
          } else if (buttonModule.action) {
            // Legacy support
            linkService.setHass(hass);
            linkService.executeAction(buttonModule.action);
          }
        }, 300); // Wait 300ms to see if double click follows
      }
    };

    // Get hover effect configuration from module design
    const hoverEffect = (buttonModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <div class="button-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="button-module-preview" style="${alignment}">
          <button
            class="ultra-button ${styleClass} ${buttonModule.alignment === 'justify'
              ? 'justify'
              : ''} ${hoverEffectClass}"
            style="${buttonStyle} ${buttonModule.alignment === 'justify'
              ? 'width: 100%;'
              : designProperties.width || (moduleWithDesign as any).width
                ? `width: ${designProperties.width || (moduleWithDesign as any).width};`
                : ''} ${designProperties.height || (moduleWithDesign as any).height
              ? `height: ${designProperties.height || (moduleWithDesign as any).height};`
              : ''} ${designProperties.max_width || (moduleWithDesign as any).max_width
              ? `max-width: ${designProperties.max_width || (moduleWithDesign as any).max_width};`
              : ''} ${designProperties.max_height || (moduleWithDesign as any).max_height
              ? `max-height: ${designProperties.max_height || (moduleWithDesign as any).max_height};`
              : ''} ${designProperties.min_width || (moduleWithDesign as any).min_width
              ? `min-width: ${designProperties.min_width || (moduleWithDesign as any).min_width};`
              : ''} ${designProperties.min_height || (moduleWithDesign as any).min_height
              ? `min-height: ${designProperties.min_height || (moduleWithDesign as any).min_height};`
              : ''} ${designProperties.text_align
              ? `text-align:${designProperties.text_align};`
              : ''} ${designProperties.text_shadow_h ||
            designProperties.text_shadow_v ||
            designProperties.text_shadow_blur ||
            designProperties.text_shadow_color
              ? `text-shadow:${designProperties.text_shadow_h || '0px'} ${designProperties.text_shadow_v || '0px'} ${designProperties.text_shadow_blur || '0px'} ${designProperties.text_shadow_color || 'rgba(0,0,0,.2)'};`
              : ''}"
            @pointerdown=${handlePointerDown}
            @pointerup=${handlePointerUp}
          >
            ${buttonModule.show_icon && buttonModule.icon && buttonModule.icon_position === 'before'
              ? html`<ha-icon icon="${buttonModule.icon}"></ha-icon>`
              : ''}
            ${buttonModule.label ?? ''}
            ${buttonModule.show_icon && buttonModule.icon && buttonModule.icon_position === 'after'
              ? html`<ha-icon icon="${buttonModule.icon}"></ha-icon>`
              : ''}
          </button>
        </div>
      </div>
    `;
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }

  // Trigger preview update for reactive UI
  private triggerPreviewUpdate(): void {
    // Dispatch custom event to update any live previews
    const event = new CustomEvent('ultra-card-template-update', {
      bubbles: true,
      composed: true,
    });
    window.dispatchEvent(event);
  }

  // Resolve background images from global design (upload/url/entity)
  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    if (!imageType || imageType === 'none') return 'none';

    switch (imageType) {
      case 'upload': {
        if (backgroundImage) {
          const resolved = getImageUrl(hass, backgroundImage);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        if (backgroundImage) {
          return `url("${backgroundImage}")`;
        }
        break;
      }
      case 'entity': {
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            const imageUrl =
              (entityState.attributes as any)?.entity_picture ||
              (entityState.attributes as any)?.image ||
              (typeof entityState.state === 'string' ? entityState.state : '');
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              const resolved = getImageUrl(hass, imageUrl);
              return `url("${resolved}")`;
            }
          }
        }
        break;
      }
    }

    return 'none';
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
}
