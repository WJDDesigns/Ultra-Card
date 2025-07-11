import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TextModule, UltraCardConfig } from '../types';
import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { FormUtils } from '../utils/form-utils';

export class UltraTextModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'text',
    title: 'Text Module',
    description: 'Display custom text content',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:format-text',
    category: 'content',
    tags: ['text', 'content', 'typography', 'template'],
  };

  private clickTimeout: any = null;

  createDefault(id?: string): TextModule {
    return {
      id: id || this.generateId('text'),
      type: 'text',
      text: 'Sample Text',
      // Legacy link support (for backward compatibility)
      link: '',
      hide_if_no_link: false,
      // Global link configuration
      tap_action: { action: 'default' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },
      icon: '',
      icon_position: 'before',
      template_mode: false,
      template: '',
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const textModule = module as TextModule;

    return html`
      ${FormUtils.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Content Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Content Configuration
          </div>

          <!-- Text Content -->
          ${FormUtils.renderField(
            'Text Content',
            'Enter the text content to display in this module.',
            hass,
            { text: textModule.text || '' },
            [FormUtils.createSchemaItem('text', { text: {} })],
            (e: CustomEvent) => updateModule({ text: e.detail.value.text })
          )}
        </div>

        <!-- Link Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${UltraLinkComponent.render(
            hass,
            {
              tap_action: textModule.tap_action || { action: 'default' },
              hold_action: textModule.hold_action || { action: 'default' },
              double_tap_action: textModule.double_tap_action || { action: 'default' },
            },
            (updates: Partial<UltraLinkConfig>) => {
              const moduleUpdates: Partial<TextModule> = {};
              if (updates.tap_action) moduleUpdates.tap_action = updates.tap_action;
              if (updates.hold_action) moduleUpdates.hold_action = updates.hold_action;
              if (updates.double_tap_action)
                moduleUpdates.double_tap_action = updates.double_tap_action;
              updateModule(moduleUpdates);
            },
            'Link Configuration'
          )}
        </div>

        <!-- Icon Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Icon Configuration
          </div>

          <!-- Icon Selection -->
          ${FormUtils.renderField(
            'Icon',
            'Choose an icon to display alongside the text. Leave empty for no icon.',
            hass,
            { icon: textModule.icon || '' },
            [FormUtils.createSchemaItem('icon', { icon: {} })],
            (e: CustomEvent) => updateModule({ icon: e.detail.value.icon })
          )}
          ${textModule.icon && textModule.icon.trim() !== ''
            ? html`
                <div style="margin-top: 24px;">
                  ${this.renderConditionalFieldsGroup(
                    'Icon Position',
                    html`
                      <div
                        class="field-title"
                        style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                      >
                        Icon Position
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                      >
                        Choose where to position the icon relative to the text.
                      </div>
                      <div style="display: flex; gap: 8px; justify-content: flex-start;">
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${(textModule.icon_position ||
                            'before') === 'before'
                            ? 'var(--primary-color)'
                            : 'var(--divider-color)'}; background: ${(textModule.icon_position ||
                            'before') === 'before'
                            ? 'var(--primary-color)'
                            : 'transparent'}; color: ${(textModule.icon_position || 'before') ===
                          'before'
                            ? 'white'
                            : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                          @click=${() => updateModule({ icon_position: 'before' })}
                        >
                          <ha-icon icon="mdi:format-align-left" style="font-size: 16px;"></ha-icon>
                          Before Text
                        </button>
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${(textModule.icon_position ||
                            'before') === 'after'
                            ? 'var(--primary-color)'
                            : 'var(--divider-color)'}; background: ${(textModule.icon_position ||
                            'before') === 'after'
                            ? 'var(--primary-color)'
                            : 'transparent'}; color: ${(textModule.icon_position || 'before') ===
                          'after'
                            ? 'white'
                            : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                          @click=${() => updateModule({ icon_position: 'after' })}
                        >
                          <ha-icon icon="mdi:format-align-right" style="font-size: 16px;"></ha-icon>
                          After Text
                        </button>
                      </div>
                    `
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Template Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 0;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Template Configuration
            </div>
            ${FormUtils.renderCleanForm(
              hass,
              { template_mode: textModule.template_mode || false },
              [FormUtils.createSchemaItem('template_mode', { boolean: {} })],
              (e: CustomEvent) => updateModule({ template_mode: e.detail.value.template_mode })
            )}
          </div>

          ${textModule.template_mode
            ? this.renderConditionalFieldsGroup(
                'Template Settings',
                html`
                  ${FormUtils.renderField(
                    'Template Code',
                    "Enter the Jinja2 template code. Example: {{ states('sensor.temperature') }}°C",
                    hass,
                    { template: textModule.template || '' },
                    [FormUtils.createSchemaItem('template', { text: { multiline: true } })],
                    (e: CustomEvent) => updateModule({ template: e.detail.value.template })
                  )}
                `
              )
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable template mode to use dynamic content
                </div>
              `}
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const textModule = module as TextModule;

    // Check if element should be hidden when no link
    if (textModule.hide_if_no_link && !this.hasActiveLink(textModule)) {
      return html`<div class="text-module-hidden">Hidden (no link)</div>`;
    }

    // Apply design properties with priority - design tab overrides module-specific properties
    const moduleWithDesign = textModule as any;

    // Use design properties with fallback to default values
    const textStyles = {
      fontSize: moduleWithDesign.font_size ? `${moduleWithDesign.font_size}px` : '16px',
      fontFamily: moduleWithDesign.font_family || 'Roboto',
      color: moduleWithDesign.color || 'var(--primary-text-color)',
      textAlign: moduleWithDesign.text_align || 'center',
      fontWeight: moduleWithDesign.font_weight || 'normal',
      fontStyle: moduleWithDesign.font_style || 'normal',
      textTransform: moduleWithDesign.text_transform || 'none',
      textDecoration: 'none',
      lineHeight: moduleWithDesign.line_height || '1.4',
      letterSpacing: moduleWithDesign.letter_spacing || 'normal',
      margin: '0',

      display: 'flex',
      alignItems: 'center',
      justifyContent: moduleWithDesign.text_align || 'center',
      gap: '8px',
      // Shadow effects
      textShadow:
        moduleWithDesign.text_shadow_h && moduleWithDesign.text_shadow_v
          ? `${moduleWithDesign.text_shadow_h || '0'} ${moduleWithDesign.text_shadow_v || '0'} ${moduleWithDesign.text_shadow_blur || '0'} ${moduleWithDesign.text_shadow_color || 'rgba(0,0,0,0.5)'}`
          : 'none',
      boxShadow:
        moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
          ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      // Note: Sizing and positioning properties are handled by containerStyles for design tab functionality
    };

    const iconElement = textModule.icon ? html`<ha-icon icon="${textModule.icon}"></ha-icon>` : '';
    const textElement = html`<span>${textModule.text || 'Sample Text'}</span>`;

    let content;
    if (textModule.icon_position === 'before' || !textModule.icon_position) {
      content = html`${iconElement}${textElement}`;
    } else if (textModule.icon_position === 'after') {
      content = html`${textElement}${iconElement}`;
    } else {
      content = textElement;
    }

    // Wrap in link or add click handlers if provided
    const element = this.hasActiveLink(textModule)
      ? html`<div
          class="text-module-clickable"
          style="color: inherit; text-decoration: inherit; cursor: pointer;"
          @click=${(e: Event) => this.handleClick(e, textModule, hass)}
          @dblclick=${(e: Event) => this.handleDoubleClick(e, textModule, hass)}
          @mousedown=${(e: Event) => this.handleMouseDown(e, textModule, hass)}
          @mouseup=${(e: Event) => this.handleMouseUp(e, textModule, hass)}
          @mouseleave=${(e: Event) => this.handleMouseLeave(e, textModule, hass)}
          @touchstart=${(e: Event) => this.handleTouchStart(e, textModule, hass)}
          @touchend=${(e: Event) => this.handleTouchEnd(e, textModule, hass)}
        >
          ${content}
        </div>`
      : content;

    // Container styles for margin and positioning
    const containerStyles = {
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
          : '8px 0',
      margin:
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${this.addPixelUnit(moduleWithDesign.margin_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0px'}`
          : '0',
      // Only apply container-level design properties if specifically configured
      background:
        moduleWithDesign.background_color && moduleWithDesign.background_color !== 'transparent'
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
      position: moduleWithDesign.position || 'static',
      top: moduleWithDesign.top || 'auto',
      bottom: moduleWithDesign.bottom || 'auto',
      left: moduleWithDesign.left || 'auto',
      right: moduleWithDesign.right || 'auto',
      zIndex: moduleWithDesign.z_index || 'auto',
      // Sizing - apply to container for design tab functionality
      width: moduleWithDesign.width || '100%',
      height: moduleWithDesign.height || 'auto',
      maxWidth: moduleWithDesign.max_width || 'none',
      maxHeight: moduleWithDesign.max_height || 'none',
      minWidth: moduleWithDesign.min_width || 'none',
      minHeight: moduleWithDesign.min_height || 'auto',
      // Effects
      overflow: moduleWithDesign.overflow || 'visible',
      clipPath: moduleWithDesign.clip_path || 'none',
      backdropFilter: moduleWithDesign.backdrop_filter || 'none',
      // Shadow
      boxShadow:
        moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
          ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    return html`
      <div class="text-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="text-module-preview" style=${this.styleObjectToCss(textStyles)}>${element}</div>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const textModule = module as TextModule;
    const errors = [...baseValidation.errors];

    if (!textModule.text || textModule.text.trim() === '') {
      errors.push('Text content is required');
    }

    // Validate icon format if provided
    if (textModule.icon && textModule.icon.trim() !== '') {
      if (!textModule.icon.includes(':')) {
        errors.push('Icon must be in format "mdi:icon-name" or "hass:icon-name"');
      }
    }

    // Validate link format if provided (legacy)
    if (textModule.link && textModule.link.trim() !== '') {
      try {
        new URL(textModule.link);
      } catch {
        // If not a valid URL, check if it's a relative path
        if (!textModule.link.startsWith('/') && !textModule.link.startsWith('#')) {
          errors.push('Link must be a valid URL or start with "/" for relative paths');
        }
      }
    }

    // Validate global link actions
    if (
      textModule.tap_action &&
      textModule.tap_action.action !== 'default' &&
      textModule.tap_action.action !== 'nothing'
    ) {
      errors.push(...this.validateAction(textModule.tap_action));
    }
    if (
      textModule.hold_action &&
      textModule.hold_action.action !== 'default' &&
      textModule.hold_action.action !== 'nothing'
    ) {
      errors.push(...this.validateAction(textModule.hold_action));
    }
    if (
      textModule.double_tap_action &&
      textModule.double_tap_action.action !== 'default' &&
      textModule.double_tap_action.action !== 'nothing'
    ) {
      errors.push(...this.validateAction(textModule.double_tap_action));
    }

    // Validate template if template mode is enabled
    if (textModule.template_mode && (!textModule.template || textModule.template.trim() === '')) {
      errors.push('Template code is required when template mode is enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private hasActiveLink(textModule: TextModule): boolean {
    const hasLegacyLink = textModule.link && textModule.link.trim() !== '';
    const hasTapAction =
      textModule.tap_action &&
      textModule.tap_action.action !== 'default' &&
      textModule.tap_action.action !== 'nothing';
    const hasHoldAction =
      textModule.hold_action &&
      textModule.hold_action.action !== 'default' &&
      textModule.hold_action.action !== 'nothing';
    const hasDoubleAction =
      textModule.double_tap_action &&
      textModule.double_tap_action.action !== 'default' &&
      textModule.double_tap_action.action !== 'nothing';

    return hasLegacyLink || hasTapAction || hasHoldAction || hasDoubleAction;
  }

  private validateAction(action: any): string[] {
    const errors: string[] = [];

    switch (action.action) {
      case 'more-info':
      case 'toggle':
        if (!action.entity) {
          errors.push(`Entity is required for ${action.action} action`);
        }
        break;
      case 'navigate':
        if (!action.navigation_path) {
          errors.push('Navigation path is required for navigate action');
        }
        break;
      case 'url':
        if (!action.url_path) {
          errors.push('URL path is required for url action');
        }
        break;
      case 'perform-action':
        if (!action.service) {
          errors.push('Service is required for perform-action');
        }
        break;
    }

    return errors;
  }

  private handleClick(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    event.preventDefault();

    // Clear any existing timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    // Set a timeout to handle single click with delay
    this.clickTimeout = setTimeout(() => {
      this.handleTapAction(event, textModule, hass);
    }, 300); // 300ms delay to allow for double-click detection
  }

  private handleDoubleClick(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    event.preventDefault();

    // Clear the single click timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    // Handle double-click action
    this.handleDoubleAction(event, textModule, hass);
  }

  private holdTimeout: any = null;
  private isHolding = false;

  private handleMouseDown(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.startHold(event, textModule, hass);
  }

  private handleMouseUp(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.endHold(event, textModule, hass);
  }

  private handleMouseLeave(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.endHold(event, textModule, hass);
  }

  private handleTouchStart(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.startHold(event, textModule, hass);
  }

  private handleTouchEnd(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.endHold(event, textModule, hass);
  }

  private startHold(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.isHolding = false;
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.handleHoldAction(event, textModule, hass);
    }, 500); // 500ms hold time
  }

  private endHold(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
    this.isHolding = false;
  }

  private handleTapAction(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    // Don't trigger tap action if we're in the middle of a hold
    if (this.isHolding) return;

    // Handle legacy link first (for backward compatibility)
    if (textModule.link && textModule.link.trim() !== '') {
      if (textModule.link.startsWith('http') || textModule.link.startsWith('https')) {
        window.open(textModule.link, '_blank');
      } else {
        window.location.href = textModule.link;
      }
      return;
    }

    // Handle global link action
    if (
      textModule.tap_action &&
      textModule.tap_action.action !== 'default' &&
      textModule.tap_action.action !== 'nothing'
    ) {
      UltraLinkComponent.handleAction(textModule.tap_action, hass, event.target as HTMLElement);
    }
  }

  private handleDoubleAction(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    if (
      textModule.double_tap_action &&
      textModule.double_tap_action.action !== 'default' &&
      textModule.double_tap_action.action !== 'nothing'
    ) {
      UltraLinkComponent.handleAction(
        textModule.double_tap_action,
        hass,
        event.target as HTMLElement
      );
    }
  }

  private handleHoldAction(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    if (
      textModule.hold_action &&
      textModule.hold_action.action !== 'default' &&
      textModule.hold_action.action !== 'nothing'
    ) {
      UltraLinkComponent.handleAction(textModule.hold_action, hass, event.target as HTMLElement);
    }
  }

  getStyles(): string {
    return `
      .text-module-preview {
        min-height: 20px;
        word-wrap: break-word;
      }
      
      .text-module-hidden {
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 4px;
      }
      
      /* Field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--primary-text-color) !important;
        margin-bottom: 4px !important;
        display: block !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
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

      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Conditional Fields Grouping CSS */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
      }

      @keyframes slideInFromLeft {
        from { 
          opacity: 0; 
          transform: translateX(-10px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }

      /* Icon picker specific styling */
      ha-icon-picker {
        --ha-icon-picker-width: 100%;
        --ha-icon-picker-height: 56px;
      }

      /* Text field and select consistency */
      ha-textfield,
      ha-select {
        --mdc-shape-small: 8px;
        --mdc-theme-primary: var(--primary-color);
      }

      code {
        background: var(--secondary-background-color);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        color: var(--primary-color);
      }
    `;
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    switch (imageType) {
      case 'upload':
        if (backgroundImage) {
          // For uploaded images, wrap in url() and get the full URL
          if (backgroundImage.startsWith('/api/image/serve/')) {
            // Use image upload utility to get full URL
            return `url("${this.getImageUrl(hass, backgroundImage)}")`;
          } else if (backgroundImage.startsWith('data:image/')) {
            // Data URL, use as-is
            return `url("${backgroundImage}")`;
          } else {
            // Other upload paths
            return `url("${backgroundImage}")`;
          }
        }
        break;

      case 'entity':
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            // Try entity_picture first, then other image attributes
            const imageUrl =
              entityState.attributes.entity_picture ||
              entityState.attributes.image ||
              entityState.state;
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              return `url("${imageUrl}")`;
            }
          }
        }
        break;

      case 'url':
        if (backgroundImage) {
          // Direct URL, wrap in url()
          return `url("${backgroundImage}")`;
        }
        break;

      default:
        // No background image or 'none' type
        return 'none';
    }

    return 'none';
  }

  private getImageUrl(hass: HomeAssistant, path: string): string {
    if (!path) return '';

    if (path.startsWith('http')) return path;
    if (path.startsWith('data:image/')) return path;

    if (path.includes('/api/image/serve/')) {
      const matches = path.match(/\/api\/image\/serve\/([^\/]+)/);
      if (matches && matches[1]) {
        const imageId = matches[1];
        try {
          const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
          return `${baseUrl.replace(/\/$/, '')}/api/image/serve/${imageId}/original`;
        } catch (e) {
          return path;
        }
      }
      return path;
    }

    // Handle relative URLs
    if (path.startsWith('/')) {
      const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
      return `${baseUrl.replace(/\/$/, '')}${path}`;
    }

    return path;
  }

  // Helper method to convert style object to CSS string
  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  // Helper method to convert camelCase to kebab-case
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
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
}
