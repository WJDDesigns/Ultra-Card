import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { FormUtils } from '../utils/form-utils';
import type { CardModule, DeviceBreakpoint, SharedDesignProperties, ResponsiveDesignProperties } from '../types';
import { responsiveDesignService } from '../services/uc-responsive-design-service';

// Type alias for design config - can be flat or responsive
type DesignConfig = SharedDesignProperties | ResponsiveDesignProperties;
import '../components/ultra-color-picker';
import '../components/uc-device-selector';

/**
 * Responsive Design Tab Component
 * Provides WPBakery-style responsive design controls allowing users to configure
 * different design settings per device breakpoint (desktop, laptop, tablet, mobile).
 */
@customElement('uc-responsive-design-tab')
export class UcResponsiveDesignTab extends LitElement {
  @property({ attribute: false }) public module!: CardModule;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public updateModule!: (updates: Partial<CardModule>) => void;

  @state() private _selectedDevice: DeviceBreakpoint | 'base' = 'base';

  static styles = css`
    :host {
      display: block;
    }

    .device-selector-container {
      margin-bottom: 16px;
    }

    .device-selector-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .device-selector-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .responsive-badge {
      font-size: 10px;
      padding: 2px 6px;
      background: rgba(var(--rgb-primary-color), 0.15);
      color: var(--primary-color);
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .device-info {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      padding: 8px 12px;
      background: rgba(var(--rgb-primary-color), 0.05);
      border-radius: 6px;
      border-left: 3px solid var(--primary-color);
    }

    .reset-button {
      font-size: 12px;
      color: var(--error-color, #f44336);
      background: transparent;
      border: 1px solid var(--error-color, #f44336);
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .reset-button:hover {
      background: var(--error-color, #f44336);
      color: white;
    }

    .settings-section {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .field-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .override-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-color);
      display: inline-block;
    }

    .field-description {
      font-size: 13px;
      font-weight: 400;
      margin-bottom: 12px;
      color: var(--secondary-text-color);
    }

    .input-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .input-field {
      display: flex;
      flex-direction: column;
    }

    .input-field label {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }

    .input-field input {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }

    .input-field input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .field-container {
      margin-bottom: 24px;
    }
  `;

  /**
   * Get the current device's design properties
   */
  private _getCurrentDesign(): Partial<SharedDesignProperties> {
    const design = (this.module as any).design as DesignConfig | undefined;
    return responsiveDesignService.getDeviceDesign(design, this._selectedDevice);
  }

  /**
   * Get the responsive design object
   */
  private _getResponsiveDesign(): ResponsiveDesignProperties {
    const design = (this.module as any).design as DesignConfig | undefined;
    return responsiveDesignService.normalizeDesign(design);
  }

  /**
   * Update a design property for the current device
   */
  private _updateDesign(updates: Record<string, any>): void {
    const currentDesign = (this.module as any).design as DesignConfig | undefined;
    let newDesign = responsiveDesignService.normalizeDesign(currentDesign);

    // Update each property
    Object.entries(updates).forEach(([key, value]) => {
      newDesign = responsiveDesignService.setDeviceProperty(
        newDesign,
        this._selectedDevice,
        key as keyof SharedDesignProperties,
        value
      );
    });

    // For backwards compatibility: when updating 'base', also update root-level properties
    // This ensures modules that access design.border_radius directly still work
    if (this._selectedDevice === 'base') {
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === undefined || value === null) {
          delete (newDesign as any)[key];
        } else {
          (newDesign as any)[key] = value;
        }
      });
    }

    // Build combined update object
    const combined: Record<string, any> = { design: newDesign };

    // Mirror certain top-level module properties for backwards compatibility
    // Only mirror from base device settings
    if (this._selectedDevice === 'base') {
      if (Object.prototype.hasOwnProperty.call(updates, 'background_color')) {
        combined.background_color = updates.background_color || undefined;
        if (!combined.background_color) delete combined.background_color;
      }

      if (Object.prototype.hasOwnProperty.call(updates, 'font_size')) {
        const fontSizeValue = updates.font_size;
        if (
          fontSizeValue === '' ||
          fontSizeValue === undefined ||
          fontSizeValue === null ||
          (typeof fontSizeValue === 'string' && fontSizeValue.trim() === '')
        ) {
          combined.font_size = undefined;
        } else {
          combined.font_size = fontSizeValue;
        }
      }

      // Mirror size properties
      const sizeProperties = ['width', 'height', 'max_width', 'max_height', 'min_width', 'min_height'];
      sizeProperties.forEach(prop => {
        if (Object.prototype.hasOwnProperty.call(updates, prop)) {
          const propValue = updates[prop];
          if (
            propValue === '' ||
            propValue === undefined ||
            propValue === null ||
            (typeof propValue === 'string' && propValue.trim() === '')
          ) {
            (combined as any)[prop] = undefined;
          } else {
            (combined as any)[prop] = propValue;
          }
        }
      });
    }

    this.updateModule(combined as any);

    // Dispatch design update event for preview refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ultra-card-design-update', {
          detail: { moduleId: (this.module as any).id, updates, device: this._selectedDevice },
        })
      );
    }
  }

  /**
   * Handle device selection change
   */
  private _handleDeviceChange(e: CustomEvent): void {
    this._selectedDevice = e.detail.device;
  }

  /**
   * Reset all overrides for current device
   */
  private _resetCurrentDevice(): void {
    if (this._selectedDevice === 'base') return; // Can't reset base

    const currentDesign = (this.module as any).design as DesignConfig | undefined;
    const clearedDesign = responsiveDesignService.clearDeviceOverrides(currentDesign, this._selectedDevice);
    const deviceToReset = this._selectedDevice;
    
    // Explicitly set the device key to undefined so it gets properly removed
    // during any merge operations in parent components
    const newDesign = {
      ...clearedDesign,
      [deviceToReset]: undefined
    };
    
    // Update the module with cleared design
    this.updateModule({ design: newDesign } as any);

    // Dispatch event for any listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ultra-card-design-update', {
          detail: { moduleId: (this.module as any).id, device: deviceToReset, reset: true },
        })
      );
    }
    
    // Request update to refresh UI
    this.requestUpdate();
  }

  /**
   * Check if a section has overrides for the current device
   */
  private _sectionHasOverrides(properties: string[]): boolean {
    if (this._selectedDevice === 'base') return false;
    
    const design = (this.module as any).design as DesignConfig | undefined;
    const overrideKeys = responsiveDesignService.getDeviceOverrideKeys(design, this._selectedDevice as DeviceBreakpoint);
    
    return properties.some(prop => overrideKeys.includes(prop));
  }

  /**
   * Get device info text
   */
  private _getDeviceInfo(): string {
    switch (this._selectedDevice) {
      case 'base':
        return 'Default settings applied to all devices. Override specific breakpoints by selecting a device.';
      case 'desktop':
        return 'Settings for screens ≥1381px wide. Overrides default values on desktop displays.';
      case 'laptop':
        return 'Settings for screens 1025px - 1380px wide. Overrides default values on laptop displays.';
      case 'tablet':
        return 'Settings for screens 601px - 1024px wide. Overrides default values on tablet displays.';
      case 'mobile':
        return 'Settings for screens ≤600px wide. Overrides default values on mobile displays.';
      default:
        return '';
    }
  }

  render(): TemplateResult {
    const d = this._getCurrentDesign();
    const responsiveDesign = this._getResponsiveDesign();
    const hasOverrides = this._selectedDevice !== 'base' && 
      responsiveDesignService.hasDeviceOverrides(responsiveDesign, this._selectedDevice as DeviceBreakpoint);

    return html`
      <div class="uc-responsive-design-tab">
        ${FormUtils.injectCleanFormStyles()}

        <!-- Device Selector -->
        <div class="device-selector-container">
          <div class="device-selector-header">
            <div class="device-selector-title">
              <ha-icon icon="mdi:responsive"></ha-icon>
              Responsive Design
              <span class="responsive-badge">NEW</span>
            </div>
            ${hasOverrides ? html`
              <button 
                class="reset-button" 
                @click=${this._resetCurrentDevice}
                title="Clear all overrides for this device"
              >
                Reset ${this._selectedDevice}
              </button>
            ` : ''}
          </div>
          <uc-device-selector
            .selectedDevice=${this._selectedDevice}
            .design=${responsiveDesign}
            @device-changed=${this._handleDeviceChange}
          ></uc-device-selector>
          <div class="device-info">${this._getDeviceInfo()}</div>
        </div>

        <!-- Padding Section -->
        <div class="settings-section">
          <div class="form-field-container">
            <div class="section-header">
              <div class="field-title">
                Padding
                ${this._sectionHasOverrides(['padding_top', 'padding_right', 'padding_bottom', 'padding_left'])
                  ? html`<span class="override-indicator" title="Has device-specific overrides"></span>`
                  : ''}
              </div>
            </div>
            <div class="field-description">
              Spacing inside the module container (top/right/bottom/left).
            </div>
            <div class="input-grid">
              <div class="input-field">
                <label>Top</label>
                <input
                  type="text"
                  .value=${d.padding_top || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ padding_top: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                />
              </div>
              <div class="input-field">
                <label>Right</label>
                <input
                  type="text"
                  .value=${d.padding_right || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ padding_right: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                />
              </div>
              <div class="input-field">
                <label>Bottom</label>
                <input
                  type="text"
                  .value=${d.padding_bottom || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ padding_bottom: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                />
              </div>
              <div class="input-field">
                <label>Left</label>
                <input
                  type="text"
                  .value=${d.padding_left || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ padding_left: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Background Section -->
        <div class="settings-section">
          <div class="field-container">
            <div class="section-header">
              <div class="field-title">
                Background Color
                ${this._sectionHasOverrides(['background_color'])
                  ? html`<span class="override-indicator" title="Has device-specific overrides"></span>`
                  : ''}
              </div>
            </div>
            <div class="field-description">
              Background color for the module container.
            </div>
            <ultra-color-picker
              .value=${d.background_color || ''}
              .defaultValue=${'transparent'}
              .hass=${this.hass}
              @value-changed=${(e: CustomEvent) =>
                this._updateDesign({ background_color: e.detail.value })}
            ></ultra-color-picker>
          </div>

          <!-- Background Image Settings -->
          ${FormUtils.renderField(
            'Background Image',
            'Background image for the module container.',
            this.hass,
            {
              background_image_type: d.background_image_type || 'none',
              background_image: d.background_image || '',
              background_image_entity: d.background_image_entity || '',
              background_size: d.background_size || 'cover',
              background_repeat: d.background_repeat || 'no-repeat',
              background_position: d.background_position || 'center center',
            },
            [
              FormUtils.createSchemaItem('background_image_type', {
                select: {
                  options: [
                    { value: 'none', label: 'None' },
                    { value: 'upload', label: 'Upload/Local' },
                    { value: 'url', label: 'URL' },
                    { value: 'entity', label: 'Entity' },
                  ],
                  mode: 'dropdown',
                },
              }),
              FormUtils.createSchemaItem('background_image', { text: {} }),
              FormUtils.createSchemaItem('background_image_entity', { entity: {} }),
              FormUtils.createSchemaItem('background_size', {
                select: {
                  options: [
                    { value: 'cover', label: 'Cover' },
                    { value: 'contain', label: 'Contain' },
                    { value: 'auto', label: 'Auto' },
                    { value: 'custom', label: 'Custom' },
                  ],
                  mode: 'dropdown',
                },
              }),
              FormUtils.createSchemaItem('background_repeat', {
                select: {
                  options: [
                    { value: 'no-repeat', label: 'No Repeat' },
                    { value: 'repeat', label: 'Repeat' },
                    { value: 'repeat-x', label: 'Repeat X' },
                    { value: 'repeat-y', label: 'Repeat Y' },
                  ],
                  mode: 'dropdown',
                },
              }),
              FormUtils.createSchemaItem('background_position', {
                select: {
                  options: [
                    { value: 'left top', label: 'Left Top' },
                    { value: 'left center', label: 'Left Center' },
                    { value: 'left bottom', label: 'Left Bottom' },
                    { value: 'center top', label: 'Center Top' },
                    { value: 'center center', label: 'Center' },
                    { value: 'center bottom', label: 'Center Bottom' },
                    { value: 'right top', label: 'Right Top' },
                    { value: 'right center', label: 'Right Center' },
                    { value: 'right bottom', label: 'Right Bottom' },
                  ],
                  mode: 'dropdown',
                },
              }),
            ],
            (e: CustomEvent) => this._updateDesign(e.detail.value)
          )}
        </div>

        <!-- Sizes Section -->
        <div class="settings-section">
          <div class="form-field-container">
            <div class="section-header">
              <div class="field-title">
                Sizes
                ${this._sectionHasOverrides(['width', 'height', 'max_width', 'max_height', 'min_width', 'min_height'])
                  ? html`<span class="override-indicator" title="Has device-specific overrides"></span>`
                  : ''}
              </div>
            </div>
            <div class="field-description">
              Control the dimensions and size constraints of the module container.
            </div>
            <div class="input-grid">
              <div class="input-field">
                <label>Width</label>
                <input
                  type="text"
                  .value=${d.width || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ width: (e.target as HTMLInputElement).value })}
                  placeholder="auto, 200px, 100%, 14rem, 10vw"
                />
              </div>
              <div class="input-field">
                <label>Height</label>
                <input
                  type="text"
                  .value=${d.height || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ height: (e.target as HTMLInputElement).value })}
                  placeholder="auto, 200px, 15rem, 10vh"
                />
              </div>
              <div class="input-field">
                <label>Max Width</label>
                <input
                  type="text"
                  .value=${d.max_width || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ max_width: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 100%, 14rem, 10vw"
                />
              </div>
              <div class="input-field">
                <label>Max Height</label>
                <input
                  type="text"
                  .value=${d.max_height || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ max_height: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 15rem, 10vh"
                />
              </div>
              <div class="input-field">
                <label>Min Width</label>
                <input
                  type="text"
                  .value=${d.min_width || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ min_width: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 100%, 14rem, 10vw"
                />
              </div>
              <div class="input-field">
                <label>Min Height</label>
                <input
                  type="text"
                  .value=${d.min_height || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ min_height: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 15rem, 10vh"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Typography Section -->
        <div class="settings-section">
          <div class="form-field-container">
            <div class="section-header">
              <div class="field-title">
                Typography
                ${this._sectionHasOverrides(['color', 'font_size', 'font_family', 'font_weight', 'line_height', 'letter_spacing', 'text_align', 'text_transform', 'font_style'])
                  ? html`<span class="override-indicator" title="Has device-specific overrides"></span>`
                  : ''}
              </div>
            </div>
            <div class="field-description">
              Text color and font properties.
            </div>
            <div class="input-grid">
              <div class="input-field">
                <label>Color</label>
                <input
                  type="text"
                  .value=${d.color || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ color: (e.target as HTMLInputElement).value })}
                  placeholder="var(--primary-text-color), #fff, red"
                />
              </div>
              <div class="input-field">
                <label>Font Size</label>
                <input
                  type="text"
                  .value=${d.font_size || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ font_size: (e.target as HTMLInputElement).value })}
                  placeholder="16px, 1.2rem, 1.5em"
                />
              </div>
              <div class="input-field">
                <label>Font Family</label>
                <input
                  type="text"
                  .value=${d.font_family || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ font_family: (e.target as HTMLInputElement).value })}
                  placeholder="Arial, sans-serif"
                />
              </div>
              <div class="input-field">
                <label>Font Weight</label>
                <input
                  type="text"
                  .value=${d.font_weight || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ font_weight: (e.target as HTMLInputElement).value })}
                  placeholder="400, 600, bold"
                />
              </div>
              <div class="input-field">
                <label>Line Height</label>
                <input
                  type="text"
                  .value=${d.line_height || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ line_height: (e.target as HTMLInputElement).value })}
                  placeholder="1.5, 24px, normal"
                />
              </div>
              <div class="input-field">
                <label>Letter Spacing</label>
                <input
                  type="text"
                  .value=${d.letter_spacing || ''}
                  @change=${(e: Event) =>
                    this._updateDesign({ letter_spacing: (e.target as HTMLInputElement).value })}
                  placeholder="0.5px, 0.1em"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Border Section -->
        <div class="settings-section">
          <div class="section-header">
            <div class="field-title">
              Border
              ${this._sectionHasOverrides(['border_style', 'border_width', 'border_color', 'border_radius'])
                ? html`<span class="override-indicator" title="Has device-specific overrides"></span>`
                : ''}
            </div>
          </div>
          ${FormUtils.renderField(
            '',
            'Container border style.',
            this.hass,
            {
              border_style: d.border_style || 'none',
              border_width: d.border_width || 0,
              border_color: d.border_color || 'var(--divider-color)',
              border_radius: d.border_radius || 0,
            },
            [
              FormUtils.createSchemaItem('border_style', {
                select: {
                  options: [
                    { value: 'none', label: 'None' },
                    { value: 'solid', label: 'Solid' },
                    { value: 'dashed', label: 'Dashed' },
                    { value: 'dotted', label: 'Dotted' },
                  ],
                },
              }),
              FormUtils.createSchemaItem('border_width', { number: { min: 0, max: 20 } }),
              FormUtils.createSchemaItem('border_color', { text: {} }),
              FormUtils.createSchemaItem('border_radius', { number: { min: 0, max: 64 } }),
            ],
            (e: CustomEvent) => this._updateDesign(e.detail.value)
          )}
        </div>

        <!-- Shadow Section -->
        <div class="settings-section">
          <div class="section-header">
            <div class="field-title">
              Shadow
              ${this._sectionHasOverrides(['box_shadow_h', 'box_shadow_v', 'box_shadow_blur', 'box_shadow_spread', 'box_shadow_color'])
                ? html`<span class="override-indicator" title="Has device-specific overrides"></span>`
                : ''}
            </div>
          </div>
          ${FormUtils.renderField(
            '',
            'Box shadow properties.',
            this.hass,
            {
              box_shadow_h: d.box_shadow_h || 0,
              box_shadow_v: d.box_shadow_v || 0,
              box_shadow_blur: d.box_shadow_blur || 0,
              box_shadow_spread: d.box_shadow_spread || 0,
              box_shadow_color: d.box_shadow_color || 'rgba(0,0,0,0.2)',
            },
            [
              FormUtils.createSchemaItem('box_shadow_h', { number: { min: -50, max: 50 } }),
              FormUtils.createSchemaItem('box_shadow_v', { number: { min: -50, max: 50 } }),
              FormUtils.createSchemaItem('box_shadow_blur', { number: { min: 0, max: 200 } }),
              FormUtils.createSchemaItem('box_shadow_spread', { number: { min: -50, max: 50 } }),
              FormUtils.createSchemaItem('box_shadow_color', { text: {} }),
            ],
            (e: CustomEvent) => this._updateDesign(e.detail.value)
          )}
        </div>

        <!-- Design Extensions Slot -->
        ${this._renderDesignExtensions()}
      </div>
    `;
  }

  /**
   * Render any module-specific design extensions
   */
  private _renderDesignExtensions(): TemplateResult {
    try {
      const fn = (this.module as any).renderDesignExtensions as
        | ((h: HomeAssistant, update: (updates: Record<string, any>) => void) => TemplateResult)
        | undefined;
      if (typeof fn === 'function') {
        return fn(this.hass, (updates: Record<string, any>) => this._updateDesign(updates));
      }
    } catch (_e) {}
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-responsive-design-tab': UcResponsiveDesignTab;
  }
}
