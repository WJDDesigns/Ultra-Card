import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ButtonModule, UltraCardConfig } from '../types';
import { LinkAction, linkService } from '../services/link-service';
import '../components/ultra-color-picker';
import { FormUtils } from '../utils/form-utils';

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

  createDefault(id?: string): ButtonModule {
    return {
      id: id || this.generateId('button'),
      type: 'button',
      label: 'Click Me',
      action: {
        action_type: 'none',
      },
      style: 'flat',
      alignment: 'center',
      icon: '',
      icon_position: 'before',
      show_icon: false,
      background_color: 'var(--primary-color)',
      text_color: 'white',
    };
  }

  private getButtonStyles(): Array<{ value: string; label: string }> {
    return [
      { value: 'flat', label: 'Flat (Default)' },
      { value: 'glossy', label: 'Glossy' },
      { value: 'embossed', label: 'Embossed' },
      { value: 'inset', label: 'Inset' },
      { value: 'gradient-overlay', label: 'Gradient Overlay' },
      { value: 'neon-glow', label: 'Neon Glow' },
      { value: 'outline', label: 'Outline' },
      { value: 'glass', label: 'Glass' },
      { value: 'metallic', label: 'Metallic' },
      { value: 'neumorphic', label: 'Neumorphic' },
      { value: 'dashed', label: 'Dashed' },
    ];
  }

  private getAlignmentOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
      { value: 'justify', label: 'Full Width' },
    ];
  }

  private getIconPositionOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'before', label: 'Before Text' },
      { value: 'after', label: 'After Text' },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const buttonModule = module as ButtonModule;

    return html`
      ${FormUtils.injectCleanFormStyles()}
      <div class="button-module-settings">
        <!-- Button Label Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Button Label
          </div>

          ${FormUtils.renderField(
            'Button Text',
            'The text displayed on the button',
            hass,
            { label: buttonModule.label || 'Click Me' },
            [FormUtils.createSchemaItem('label', { text: {} })],
            (e: CustomEvent) => updateModule({ label: e.detail.value.label })
          )}
        </div>

        <!-- Link Action Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Link Action
          </div>

          ${this.renderLinkActionForm(
            buttonModule.action || { action_type: 'none' },
            hass,
            action => updateModule({ action })
          )}
        </div>

        <!-- Button Style Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Style
          </div>

          ${FormUtils.renderField(
            'Button Style',
            'Choose the visual style of the button',
            hass,
            { style: buttonModule.style || 'flat' },
            [
              FormUtils.createSchemaItem('style', {
                select: {
                  options: this.getButtonStyles(),
                  mode: 'dropdown',
                },
              }),
            ],
            (e: CustomEvent) => updateModule({ style: e.detail.value.style })
          )}
        </div>

        <!-- Background Color Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Colors
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <ultra-color-picker
              .label=${'Background Color'}
              .value=${buttonModule.background_color || 'var(--primary-color)'}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ background_color: e.detail.value })}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${'Text Color'}
              .value=${buttonModule.text_color || 'white'}
              .defaultValue=${'white'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => updateModule({ text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>

          <div style="margin-top: 8px;">
            <small style="color: var(--secondary-text-color); font-style: italic;">
              Note: Global design properties will override these colors if set in the Design tab
            </small>
          </div>
        </div>

        <!-- Alignment Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Alignment
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-start;">
            ${this.getAlignmentOptions().map(
              option => html`
                <button
                  type="button"
                  style="padding: 8px 12px; border: 2px solid ${(buttonModule.alignment ||
                    'center') === option.value
                    ? 'var(--primary-color)'
                    : 'var(--divider-color)'}; background: ${(buttonModule.alignment ||
                    'center') === option.value
                    ? 'var(--primary-color)'
                    : 'transparent'}; color: ${(buttonModule.alignment || 'center') === option.value
                    ? 'white'
                    : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                  @click=${() =>
                    updateModule({
                      alignment: option.value as 'left' | 'center' | 'right' | 'justify',
                    })}
                >
                  <ha-icon
                    icon="mdi:format-align-${option.value === 'justify' ? 'center' : option.value}"
                    style="font-size: 16px;"
                  ></ha-icon>
                  ${option.label}
                </button>
              `
            )}
          </div>
        </div>

        <!-- Icon Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; color: var(--primary-color);"
            >
              Icon
            </div>
            ${FormUtils.renderCleanForm(
              hass,
              { show_icon: buttonModule.show_icon || false },
              [FormUtils.createSchemaItem('show_icon', { boolean: {} })],
              (e: CustomEvent) => updateModule({ show_icon: e.detail.value.show_icon })
            )}
          </div>

          ${buttonModule.show_icon
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${FormUtils.renderField(
                    'Icon',
                    'Choose an icon for the button',
                    hass,
                    { icon: buttonModule.icon || '' },
                    [FormUtils.createSchemaItem('icon', { icon: {} })],
                    (e: CustomEvent) => updateModule({ icon: e.detail.value.icon })
                  )}
                </div>

                <div class="field-group">
                  <div class="field-title" style="margin-bottom: 8px;">Icon Position</div>
                  <div style="display: flex; gap: 8px;">
                    ${this.getIconPositionOptions().map(
                      option => html`
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${(buttonModule.icon_position ||
                            'before') === option.value
                            ? 'var(--primary-color)'
                            : 'var(--divider-color)'}; background: ${(buttonModule.icon_position ||
                            'before') === option.value
                            ? 'var(--primary-color)'
                            : 'transparent'}; color: ${(buttonModule.icon_position || 'before') ===
                          option.value
                            ? 'white'
                            : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer;"
                          @click=${() =>
                            updateModule({ icon_position: option.value as 'before' | 'after' })}
                        >
                          ${option.label}
                        </button>
                      `
                    )}
                  </div>
                </div>
              `
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure icon settings
                </div>
              `}
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
          ${FormUtils.renderField(
            'Action Type',
            'Choose what happens when the button is clicked',
            hass,
            { action_type: action.action_type || 'none' },
            [
              FormUtils.createSchemaItem('action_type', {
                select: {
                  options: actionTypes,
                  mode: 'dropdown',
                },
              }),
            ],
            (e: CustomEvent) => onUpdate({ ...action, action_type: e.detail.value.action_type })
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
        return FormUtils.renderField(
          'Entity',
          'Select the entity to interact with',
          hass,
          { entity: action.entity || '' },
          [FormUtils.createSchemaItem('entity', { entity: {} })],
          (e: CustomEvent) => onUpdate({ ...action, entity: e.detail.value.entity })
        );

      case 'navigate':
        return FormUtils.renderField(
          'Navigation Path',
          'Path to navigate to (e.g., /dashboard/energy)',
          hass,
          { navigation_path: action.navigation_path || '' },
          [FormUtils.createSchemaItem('navigation_path', { text: {} })],
          (e: CustomEvent) =>
            onUpdate({ ...action, navigation_path: e.detail.value.navigation_path })
        );

      case 'url':
        return FormUtils.renderField(
          'URL',
          'URL to open (e.g., https://example.com)',
          hass,
          { url: action.url || '' },
          [FormUtils.createSchemaItem('url', { text: {} })],
          (e: CustomEvent) => onUpdate({ ...action, url: e.detail.value.url })
        );

      case 'call_service':
        return html`
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Service',
              'Service to call (e.g., light.turn_on)',
              hass,
              { service: action.service || '' },
              [FormUtils.createSchemaItem('service', { text: {} })],
              (e: CustomEvent) => onUpdate({ ...action, service: e.detail.value.service })
            )}
          </div>

          <div class="field-group">
            ${FormUtils.renderField(
              'Service Data (JSON)',
              'Additional data for the service call in JSON format',
              hass,
              { service_data: JSON.stringify(action.service_data || {}, null, 2) },
              [FormUtils.createSchemaItem('service_data', { text: { multiline: true } })],
              (e: CustomEvent) => {
                try {
                  const serviceData = JSON.parse(e.detail.value.service_data || '{}');
                  onUpdate({ ...action, service_data: serviceData });
                } catch (error) {
                  console.warn('Invalid JSON in service data');
                }
              }
            )}
          </div>
        `;

      case 'show_map':
        return html`
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Latitude',
              'Latitude coordinate for the map location',
              hass,
              { latitude: action.latitude || 0 },
              [
                FormUtils.createSchemaItem('latitude', {
                  number: { min: -90, max: 90, step: 0.000001 },
                }),
              ],
              (e: CustomEvent) => onUpdate({ ...action, latitude: e.detail.value.latitude })
            )}
          </div>

          <div class="field-group">
            ${FormUtils.renderField(
              'Longitude',
              'Longitude coordinate for the map location',
              hass,
              { longitude: action.longitude || 0 },
              [
                FormUtils.createSchemaItem('longitude', {
                  number: { min: -180, max: 180, step: 0.000001 },
                }),
              ],
              (e: CustomEvent) => onUpdate({ ...action, longitude: e.detail.value.longitude })
            )}
          </div>
        `;

      case 'none':
      case 'voice_assistant':
      default:
        return html``;
    }
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const buttonModule = module as ButtonModule;

    // Apply design properties with priority - design tab overrides module-specific properties
    const moduleWithDesign = buttonModule as any;

    // Design properties take priority over module-specific properties
    const effectiveStyles = {
      backgroundColor:
        moduleWithDesign.background_color ||
        buttonModule.background_color ||
        'var(--primary-color)',
      textColor: moduleWithDesign.color || buttonModule.text_color || 'white',
      fontSize: moduleWithDesign.font_size ? `${moduleWithDesign.font_size}px` : '14px',
      fontFamily: moduleWithDesign.font_family || 'inherit',
      fontWeight: moduleWithDesign.font_weight || '500',
      fontStyle: moduleWithDesign.font_style || 'normal',
      textTransform: moduleWithDesign.text_transform || 'none',
      textShadow: this.getTextShadowCSS(moduleWithDesign),
    };

    const buttonStyle = this.getButtonStyleCSS(
      buttonModule.style || 'flat',
      effectiveStyles.backgroundColor,
      effectiveStyles.textColor,
      effectiveStyles.fontSize,
      effectiveStyles.fontFamily,
      effectiveStyles.fontWeight,
      effectiveStyles.textTransform,
      effectiveStyles.fontStyle,
      effectiveStyles.textShadow
    );

    const alignment = this.getAlignmentCSS(buttonModule.alignment || 'center');

    // Container styles for design system
    const containerStyles = {
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${moduleWithDesign.padding_top || '0'}px ${moduleWithDesign.padding_right || '0'}px ${moduleWithDesign.padding_bottom || '0'}px ${moduleWithDesign.padding_left || '0'}px`
          : '0',
      margin:
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${moduleWithDesign.margin_top || '0'}px ${moduleWithDesign.margin_right || '0'}px ${moduleWithDesign.margin_bottom || '0'}px ${moduleWithDesign.margin_left || '0'}px`
          : '0',
      // Note: background color for button container is separate from button background
      background:
        moduleWithDesign.background_color &&
        moduleWithDesign.background_color !== effectiveStyles.backgroundColor
          ? moduleWithDesign.background_color
          : 'transparent',
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border:
        moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none'
          ? `${moduleWithDesign.border_width || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0',
      position: moduleWithDesign.position || 'relative',
      top: moduleWithDesign.top || 'auto',
      bottom: moduleWithDesign.bottom || 'auto',
      left: moduleWithDesign.left || 'auto',
      right: moduleWithDesign.right || 'auto',
      zIndex: moduleWithDesign.z_index || 'auto',
      width: moduleWithDesign.width || '100%',
      height: moduleWithDesign.height || 'auto',
      maxWidth: moduleWithDesign.max_width || '100%',
      maxHeight: moduleWithDesign.max_height || 'none',
      minWidth: moduleWithDesign.min_width || 'none',
      minHeight: moduleWithDesign.min_height || 'auto',
      overflow: moduleWithDesign.overflow || 'visible',
      clipPath: moduleWithDesign.clip_path || 'none',
      backdropFilter: moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
          ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    const handleClick = () => {
      if (buttonModule.action) {
        linkService.setHass(hass);
        linkService.executeAction(buttonModule.action);
      }
    };

    return html`
      <div class="button-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="button-module-preview" style="${alignment}">
          <button
            class="ultra-button ${buttonModule.style || 'flat'} ${buttonModule.alignment ===
            'justify'
              ? 'justify'
              : ''}"
            style="${buttonStyle} ${buttonModule.alignment === 'justify' ? 'width: 100%;' : ''}"
            @click=${handleClick}
          >
            ${buttonModule.show_icon && buttonModule.icon && buttonModule.icon_position === 'before'
              ? html`<ha-icon
                  icon="${buttonModule.icon}"
                  style="margin-right: 8px; color: inherit;"
                ></ha-icon>`
              : ''}
            ${buttonModule.label || 'Click Me'}
            ${buttonModule.show_icon && buttonModule.icon && buttonModule.icon_position === 'after'
              ? html`<ha-icon
                  icon="${buttonModule.icon}"
                  style="margin-left: 8px; color: inherit;"
                ></ha-icon>`
              : ''}
          </button>
        </div>
      </div>
    `;
  }

  private getButtonStyleCSS(
    style: string,
    backgroundColor: string = 'var(--primary-color)',
    textColor: string = 'white',
    fontSize: string = '14px',
    fontFamily: string = 'inherit',
    fontWeight: string = '500',
    textTransform: string = 'none',
    fontStyle: string = 'normal',
    textShadow: string = 'none'
  ): string {
    const baseStyles = `
      padding: 12px 24px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: ${fontSize};
      font-family: ${fontFamily};
      font-weight: ${fontWeight};
      font-style: ${fontStyle};
      text-transform: ${textTransform};
      text-shadow: ${textShadow};
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      text-decoration: none;
      background: ${backgroundColor};
      color: ${textColor};
    `;

    let buttonStyleCSS = '';
    let fillStyleCSS = '';

    switch (style) {
      case 'flat':
        buttonStyleCSS = `box-shadow: none;`;
        break;
      case 'glossy':
        fillStyleCSS = `
          background: linear-gradient(to bottom, ${backgroundColor}, ${backgroundColor} 50%, rgba(0,0,0,0.1) 51%, ${backgroundColor}) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        `;
        break;
      case 'embossed':
        buttonStyleCSS = `
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);
          border: 1px solid rgba(0,0,0,0.1);
        `;
        fillStyleCSS = `
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);
        `;
        break;
      case 'inset':
        buttonStyleCSS = `
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
          border: 1px solid rgba(0,0,0,0.2);
        `;
        break;
      case 'gradient-overlay':
        fillStyleCSS = `
          background: linear-gradient(to bottom, 
            ${backgroundColor} 0%, 
            rgba(255,255,255,0) 100%
          ) !important;
        `;
        break;
      case 'neon-glow':
        fillStyleCSS = `
          box-shadow: 0 0 10px ${backgroundColor}, 0 0 20px ${backgroundColor}, 0 0 30px ${backgroundColor};
          filter: brightness(1.2);
        `;
        buttonStyleCSS = `
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        `;
        break;
      case 'outline':
        buttonStyleCSS = `
          border: 2px solid ${backgroundColor};
          background-color: transparent !important;
          color: ${backgroundColor} !important;
        `;
        break;
      case 'glass':
        buttonStyleCSS = `
          backdrop-filter: blur(10px);
          background-color: rgba(255,255,255,0.1) !important;
          border: 1px solid rgba(255,255,255,0.2);
        `;
        fillStyleCSS = `
          backdrop-filter: blur(5px);
          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) !important;
        `;
        break;
      case 'metallic':
        fillStyleCSS = `
          background: linear-gradient(to bottom, 
            rgba(255,255,255,0.4) 0%, 
            ${backgroundColor} 20%, 
            ${backgroundColor} 80%, 
            rgba(0,0,0,0.2) 100%) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);
        `;
        break;
      case 'neumorphic':
        buttonStyleCSS = `
          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);
        `;
        fillStyleCSS = `
          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);
        `;
        break;
      case 'dashed':
        buttonStyleCSS = `
          border: 2px dashed ${backgroundColor};
          background-color: transparent !important;
          color: ${backgroundColor} !important;
        `;
        break;
    }

    return `${baseStyles} ${buttonStyleCSS} ${fillStyleCSS}`;
  }

  private getAlignmentCSS(alignment: string): string {
    switch (alignment) {
      case 'left':
        return 'display: flex; justify-content: flex-start;';
      case 'center':
        return 'display: flex; justify-content: center;';
      case 'right':
        return 'display: flex; justify-content: flex-end;';
      case 'justify':
        return 'display: flex; width: 100%;';
      default:
        return 'display: flex; justify-content: center;';
    }
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const buttonModule = module as ButtonModule;
    const errors = [...baseValidation.errors];

    if (!buttonModule.label || buttonModule.label.trim() === '') {
      errors.push('Button label is required');
    }

    if (buttonModule.action) {
      const actionValidation = linkService.validateAction(buttonModule.action);
      errors.push(...actionValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private getTextShadowCSS(moduleWithDesign: any): string {
    if (
      moduleWithDesign.text_shadow_h ||
      moduleWithDesign.text_shadow_v ||
      moduleWithDesign.text_shadow_blur ||
      moduleWithDesign.text_shadow_color
    ) {
      const h = moduleWithDesign.text_shadow_h || '0px';
      const v = moduleWithDesign.text_shadow_v || '0px';
      const blur = moduleWithDesign.text_shadow_blur || '0px';
      const color = moduleWithDesign.text_shadow_color || 'rgba(0,0,0,0.5)';
      return `${h} ${v} ${blur} ${color}`;
    }
    return 'none';
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (
      !moduleWithDesign.background_image_type ||
      moduleWithDesign.background_image_type === 'none'
    ) {
      return 'none';
    }

    switch (moduleWithDesign.background_image_type) {
      case 'upload':
      case 'url':
        if (moduleWithDesign.background_image) {
          return `url("${moduleWithDesign.background_image}")`;
        }
        break;

      case 'entity':
        if (
          moduleWithDesign.background_image_entity &&
          hass?.states[moduleWithDesign.background_image_entity]
        ) {
          const entityState = hass.states[moduleWithDesign.background_image_entity];
          let imageUrl = '';

          // Try to get image from entity
          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            // Handle cases where state itself is an image path
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            // Handle Home Assistant local paths
            if (imageUrl.startsWith('/local/') || imageUrl.startsWith('/media/')) {
              imageUrl = imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = imageUrl;
            }
            return `url("${imageUrl}")`;
          }
        }
        break;
    }

    return 'none';
  }

  // Helper method to ensure border radius values have proper units
  private addPixelUnit(value: string | undefined): string | undefined {
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

  getStyles(): string {
    return `
      .button-module-preview {
        width: 100%;
        box-sizing: border-box;
      }
      
      .ultra-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .ultra-button:active {
        transform: translateY(0);
      }
      
      .ultra-button.justify {
        width: 100%;
      }
    `;
  }
}
