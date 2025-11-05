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

        <!-- Actions Setup Guide -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.button.actions.title', lang, 'Button Actions')}
          </div>
          <div
            class="section-description"
            style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 14px;"
          >
            ${localize(
              'editor.button.actions.desc',
              lang,
              'Configure what happens when users tap, hold, or double-tap this button.'
            )}
          </div>
          <ha-button
            raised
            style="width: 100%; --mdc-theme-primary: var(--primary-color);"
            @click=${() => {
              // Dispatch a custom event to switch to actions tab
              const event = new CustomEvent('switch-to-actions-tab', {
                bubbles: true,
                composed: true,
                detail: { tab: 'actions' },
              });
              document.dispatchEvent(event);
            }}
          >
            <ha-icon icon="mdi:gesture-tap" slot="icon"></ha-icon>
            ${localize('editor.button.actions.setup', lang, 'Set up button actions')}
          </ha-button>
        </div>
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

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const buttonModule = module as ButtonModule;

    const moduleWithDesign = buttonModule as any;
    const designProperties = (buttonModule as any).design || {};

    const mirroredFontSize =
      typeof moduleWithDesign.font_size === 'string' ? moduleWithDesign.font_size : undefined;
    const rawFontSize =
      (typeof designProperties.font_size === 'string' && designProperties.font_size.trim() !== ''
        ? designProperties.font_size
        : mirroredFontSize) || '14px';
    const fontSize = this.addPixelUnit(rawFontSize) || '14px';

    const backgroundColor =
      designProperties.background_color || buttonModule.background_color || 'var(--primary-color)';

    const hasCustomTextColor =
      !!designProperties.color ||
      !!moduleWithDesign.color ||
      !!buttonModule.text_color ||
      !!moduleWithDesign.text_color;

    const textColor =
      designProperties.color ||
      moduleWithDesign.color ||
      buttonModule.text_color ||
      moduleWithDesign.text_color ||
      'white';

    const fontWeight = designProperties.font_weight || moduleWithDesign.font_weight || '500';
    const fontFamily = designProperties.font_family || moduleWithDesign.font_family || 'inherit';
    const fontStyle = designProperties.font_style || moduleWithDesign.font_style || 'normal';
    const textTransform =
      designProperties.text_transform || moduleWithDesign.text_transform || 'none';
    const letterSpacingRaw =
      designProperties.letter_spacing || moduleWithDesign.letter_spacing || undefined;
    const letterSpacing =
      letterSpacingRaw !== undefined &&
      letterSpacingRaw !== null &&
      `${letterSpacingRaw}`.trim() !== ''
        ? `${letterSpacingRaw}`
        : undefined;
    const lineHeightRaw = designProperties.line_height || moduleWithDesign.line_height;
    const lineHeight =
      lineHeightRaw !== undefined && lineHeightRaw !== null && `${lineHeightRaw}`.trim() !== ''
        ? `${lineHeightRaw}`
        : undefined;

    const moduleAlignment = buttonModule.alignment || 'center';
    const containerJustify = this.getFlexJustify(moduleAlignment);

    const textAlignValue =
      designProperties.text_align || moduleWithDesign.text_align || moduleAlignment;
    const contentJustify = this.getFlexJustify(textAlignValue, true);

    const textShadow = this.resolveTextShadow(designProperties, moduleWithDesign);

    const styleClass = buttonModule.style || 'flat';

    const baseButtonStyle: Record<string, string> = {
      color: textColor,
      padding: '12px 24px',
      fontSize,
      fontWeight: String(fontWeight),
      fontFamily,
      fontStyle,
      textTransform,
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) ||
        '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: contentJustify,
      gap: '8px',
      minHeight: '40px',
      textShadow,
    };

    if (letterSpacing) {
      baseButtonStyle.letterSpacing = letterSpacing;
    }

    if (lineHeight) {
      baseButtonStyle.lineHeight = lineHeight;
    }

    const styleOverrides: Record<string, Record<string, string>> = {
      flat: {
        background: backgroundColor,
        border: 'none',
        boxShadow: 'none',
      },
      glossy: {
        background: `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${backgroundColor}`,
        border: 'none',
      },
      embossed: {
        background: backgroundColor,
        border: '1px solid rgba(0,0,0,0.15)',
        boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.15)',
      },
      inset: {
        background: backgroundColor,
        border: 'none',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
      },
      'gradient-overlay': {
        background: `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,0,0,0.15)), ${backgroundColor}`,
        border: 'none',
      },
      'neon-glow': {
        background: backgroundColor,
        border: 'none',
        boxShadow: `0 0 10px ${backgroundColor}, 0 0 20px ${backgroundColor}`,
      },
      outline: {
        background: 'transparent',
        border: `2px solid ${backgroundColor}`,
      },
      glass: {
        background: backgroundColor,
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.25)',
      },
      metallic: {
        background: 'linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7)',
        border: '1px solid #bbb',
      },
    };

    if (!hasCustomTextColor) {
      styleOverrides.outline.color = backgroundColor;
      styleOverrides.metallic.color = '#333';
    }

    const mergedButtonStyle: Record<string, string> = {
      ...baseButtonStyle,
      ...(styleOverrides[styleClass] || styleOverrides.flat),
    };

    const dimensions = [
      ['width', designProperties.width ?? moduleWithDesign.width],
      ['height', designProperties.height ?? moduleWithDesign.height],
      ['maxWidth', designProperties.max_width ?? moduleWithDesign.max_width],
      ['maxHeight', designProperties.max_height ?? moduleWithDesign.max_height],
      ['minWidth', designProperties.min_width ?? moduleWithDesign.min_width],
      ['minHeight', designProperties.min_height ?? moduleWithDesign.min_height],
    ] as Array<[string, unknown]>;

    dimensions.forEach(([key, value]) => {
      const normalized = this.addPixelUnit(value as string | number | undefined | null);
      if (normalized) {
        mergedButtonStyle[key] = normalized;
      }
    });

    if (!mergedButtonStyle.width && moduleAlignment === 'justify') {
      mergedButtonStyle.width = '100%';
    }

    const alignmentStyles: Record<string, string> = {
      display: 'flex',
      justifyContent: containerJustify,
      alignItems: 'center',
      width: '100%',
    };

    const paddingTop = this.addPixelUnit(
      designProperties.padding_top || moduleWithDesign.padding_top
    );
    const paddingRight = this.addPixelUnit(
      designProperties.padding_right || moduleWithDesign.padding_right
    );
    const paddingBottom = this.addPixelUnit(
      designProperties.padding_bottom || moduleWithDesign.padding_bottom
    );
    const paddingLeft = this.addPixelUnit(
      designProperties.padding_left || moduleWithDesign.padding_left
    );
    const hasPadding = paddingTop || paddingRight || paddingBottom || paddingLeft;

    const marginTop = this.addPixelUnit(designProperties.margin_top || moduleWithDesign.margin_top);
    const marginRight = this.addPixelUnit(
      designProperties.margin_right || moduleWithDesign.margin_right
    );
    const marginBottom = this.addPixelUnit(
      designProperties.margin_bottom || moduleWithDesign.margin_bottom
    );
    const marginLeft = this.addPixelUnit(
      designProperties.margin_left || moduleWithDesign.margin_left
    );
    const hasMargin = marginTop || marginRight || marginBottom || marginLeft;

    const containerStyles = {
      width: '100%',
      height: 'auto',
      maxWidth: 'none',
      maxHeight: 'none',
      minWidth: 'auto',
      minHeight: 'auto',
      padding: hasPadding
        ? `${paddingTop || '0'} ${paddingRight || '0'} ${paddingBottom || '0'} ${paddingLeft || '0'}`
        : '0',
      margin: hasMargin
        ? `${marginTop || '8px'} ${marginRight || '0'} ${marginBottom || '8px'} ${marginLeft || '0'}`
        : '8px 0',
      background: designProperties.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) ||
        '8px',
      border:
        designProperties.border_style && designProperties.border_style !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width) || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`
          : 'none',
      boxShadow:
        designProperties.box_shadow_h ||
        designProperties.box_shadow_v ||
        designProperties.box_shadow_blur ||
        designProperties.box_shadow_spread
          ? `${this.addPixelUnit(designProperties.box_shadow_h) || '0px'} ${this.addPixelUnit(designProperties.box_shadow_v) || '0px'} ${this.addPixelUnit(designProperties.box_shadow_blur) || '0px'} ${this.addPixelUnit(designProperties.box_shadow_spread) || '0px'} ${designProperties.box_shadow_color || 'rgba(0,0,0,.2)'}`
          : 'none',
      boxSizing: 'border-box',
    } as Record<string, string>;

    let clickTimeout: any = null;
    let holdTimeout: any = null;
    let isHolding = false;
    let clickCount = 0;
    let lastClickTime = 0;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isHolding = false;

      holdTimeout = setTimeout(() => {
        isHolding = true;
        if (buttonModule.hold_action && buttonModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            buttonModule.hold_action as any,
            hass,
            e.target as HTMLElement,
            config
          );
        }
      }, 500);
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }

      if (isHolding) {
        isHolding = false;
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;

      if (timeSinceLastClick < 300 && clickCount === 1) {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickCount = 0;

        if (
          !buttonModule.double_tap_action ||
          buttonModule.double_tap_action.action !== 'nothing'
        ) {
          UltraLinkComponent.handleAction(
            (buttonModule.double_tap_action as any) || ({ action: 'default' } as any),
            hass,
            e.target as HTMLElement,
            config,
            (buttonModule as any).entity
          );
        }
      } else {
        clickCount = 1;
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
          clickCount = 0;

          if (!buttonModule.tap_action || buttonModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (buttonModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config,
              (buttonModule as any).entity
            );
          } else if (buttonModule.action) {
            linkService.setHass(hass);
            linkService.executeAction(buttonModule.action);
          }
        }, 300);
      }
    };

    const hoverEffect = (buttonModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <div class="button-module-container" style="${this.styleObjectToCss(containerStyles)}">
        <div class="button-module-preview" style="${this.styleObjectToCss(alignmentStyles)}">
          <button
            class="ultra-button ${styleClass} ${moduleAlignment === 'justify'
              ? 'justify'
              : ''} ${hoverEffectClass}"
            style="${this.styleObjectToCss(mergedButtonStyle)}"
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

  private getFlexJustify(
    alignment: string | undefined,
    allowSpaceBetween: boolean = false
  ): string {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'justify':
        return allowSpaceBetween ? 'space-between' : 'center';
      default:
        return 'center';
    }
  }

  private resolveTextShadow(
    design: Record<string, any>,
    moduleWithDesign: Record<string, any>
  ): string {
    const designHasShadow = [
      'text_shadow_h',
      'text_shadow_v',
      'text_shadow_blur',
      'text_shadow_color',
    ].some(key => {
      const value = design[key];
      return value !== undefined && value !== null && `${value}`.trim() !== '';
    });

    if (designHasShadow) {
      return `${this.addPixelUnit(design.text_shadow_h) || '0px'} ${this.addPixelUnit(design.text_shadow_v) || '0px'} ${this.addPixelUnit(design.text_shadow_blur) || '0px'} ${design.text_shadow_color || 'rgba(0,0,0,.2)'}`;
    }

    const moduleHasShadow = [
      'text_shadow_h',
      'text_shadow_v',
      'text_shadow_blur',
      'text_shadow_color',
    ].some(key => {
      const value = moduleWithDesign[key];
      return value !== undefined && value !== null && `${value}`.trim() !== '';
    });

    if (moduleHasShadow) {
      return `${this.addPixelUnit(moduleWithDesign.text_shadow_h) || '0px'} ${this.addPixelUnit(moduleWithDesign.text_shadow_v) || '0px'} ${this.addPixelUnit(moduleWithDesign.text_shadow_blur) || '0px'} ${moduleWithDesign.text_shadow_color || 'rgba(0,0,0,.2)'}`;
    }

    return 'none';
  }

  private addPixelUnit(value: string | number | undefined | null): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const str = String(value).trim();
    if (!str) {
      return undefined;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(str)) {
      return `${str}px`;
    }

    if (/^(?:-?\d+(?:\.\d+)?\s+)+-?\d+(?:\.\d+)?$/.test(str)) {
      return str
        .split(/\s+/)
        .map(part => (/^-?\d+(?:\.\d+)?$/.test(part) ? `${part}px` : part))
        .join(' ');
    }

    return str;
  }

  // Trigger preview update for reactive UI

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
