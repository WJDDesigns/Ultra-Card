import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

export interface ColorChangedEvent {
  detail: {
    value: string;
  };
}

// Predefined color palette
const COLOR_PALETTE = [
  // Basic colors
  '#000000',
  '#333333',
  '#666666',
  '#999999',
  '#CCCCCC',
  '#FFFFFF',
  // Red shades
  '#FF0000',
  '#FF3333',
  '#FF6666',
  '#FF9999',
  '#FFCCCC',
  // Orange shades
  '#FF6600',
  '#FF8833',
  '#FFAA66',
  '#FFCC99',
  '#FFE6CC',
  // Yellow shades
  '#FFFF00',
  '#FFFF33',
  '#FFFF66',
  '#FFFF99',
  '#FFFFCC',
  // Green shades
  '#00FF00',
  '#33FF33',
  '#66FF66',
  '#99FF99',
  '#CCFFCC',
  // Blue shades
  '#0000FF',
  '#3333FF',
  '#6666FF',
  '#9999FF',
  '#CCCCFF',
  // Purple shades
  '#9900FF',
  '#AA33FF',
  '#BB66FF',
  '#CC99FF',
  '#DDCCFF',
  // Home Assistant theme colors
  'var(--primary-color)',
  'var(--accent-color)',
  'var(--error-color)',
  'var(--warning-color)',
  'var(--success-color)',
  'var(--info-color)',
  'var(--primary-text-color)',
  'var(--secondary-text-color)',
  'var(--disabled-text-color)',
  'var(--divider-color)',
];

@customElement('ultra-color-picker')
export class UltraColorPicker extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public value?: string;
  @property() public label?: string;
  @property() public defaultValue?: string;
  @property({ type: Boolean }) public disabled = false;

  @state() private _currentValue?: string;
  @state() private _showPalette = false;
  @state() private _textInputValue?: string;
  private _documentClickHandler?: (e: Event) => void;

  protected firstUpdated(): void {
    this._currentValue = this.value;
    this._textInputValue = this.value;
    // Simple click outside handler for accordion
    this._documentClickHandler = this._handleDocumentClick.bind(this);
    document.addEventListener('click', this._documentClickHandler, true);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._documentClickHandler) {
      document.removeEventListener('click', this._documentClickHandler, true);
      this._documentClickHandler = undefined;
    }
  }

  private _handleDocumentClick(event: Event): void {
    if (!this._showPalette) return;
    // If click originated inside this component (including within shadow DOM), ignore
    const path = (event as any).composedPath?.() as EventTarget[] | undefined;
    if (path && path.includes(this)) return;

    const target = event.target as Node;
    if (this.shadowRoot?.contains(target)) return;
    // Don't close if it's a color input event (these can sometimes trigger outside events)
    if (target instanceof HTMLInputElement && target.type === 'color') return;

    this._showPalette = false;
  }

  protected updated(changedProps: Map<string, any>): void {
    if (changedProps.has('value')) {
      this._currentValue = this.value;
      this._textInputValue = this.value;
    }
  }

  private _togglePalette(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this._showPalette = !this._showPalette;
  }

  private _selectColor(color: string, event: Event): void {
    event.stopPropagation();
    this._currentValue = color;
    this.value = color; // Update the property
    this._showPalette = false;
    this.requestUpdate(); // Force re-render

    const changeEvent = new CustomEvent('value-changed', {
      detail: { value: color },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);
  }

  private _handleNativeColorChange(event: Event): void {
    event.stopPropagation(); // Prevent accordion from closing
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this._selectColor(color, event);
  }

  private _handleTextInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this._textInputValue = input.value;
  }

  private _handleTextInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this._applyTextInputValue();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this._textInputValue = this._currentValue;
      this._showPalette = false;
    }
  }

  private _applyTextInputValue(): void {
    if (this._textInputValue !== undefined) {
      this._selectColor(this._textInputValue, new Event('change'));
    }
  }

  private _isValidColor(color: string): boolean {
    if (!color) return false;
    // Check for common CSS color formats
    const colorFormats = [
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // RGBA
      /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
      /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/, // HSLA
      /^var\(--[\w-]+\)$/, // CSS variables
    ];

    // Check named colors
    const namedColors = [
      'transparent',
      'red',
      'blue',
      'green',
      'yellow',
      'orange',
      'purple',
      'pink',
      'brown',
      'black',
      'white',
      'gray',
      'grey',
    ];

    return (
      colorFormats.some(format => format.test(color)) || namedColors.includes(color.toLowerCase())
    );
  }

  private _resetToDefault(): void {
    const defaultVal = this.defaultValue || '';
    this._currentValue = defaultVal;

    const event = new CustomEvent('value-changed', {
      detail: { value: defaultVal },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _getDisplayValue(): string {
    if (!this._currentValue || this._currentValue === '') {
      return this.defaultValue || '';
    }
    return this._currentValue;
  }

  private _getColorForNativeInput(): string {
    const displayValue = this._getDisplayValue();
    // Convert CSS variables and other formats to hex for native input
    if (displayValue.startsWith('var(--')) {
      // Try to resolve CSS variable to actual color
      const tempElement = document.createElement('div');
      tempElement.style.color = displayValue;
      document.body.appendChild(tempElement);
      const computedColor = getComputedStyle(tempElement).color;
      document.body.removeChild(tempElement);

      // Convert rgb to hex if needed
      if (computedColor && computedColor.startsWith('rgb')) {
        const rgbMatch = computedColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (rgbMatch) {
          const [_, r, g, b] = rgbMatch;
          const toHex = (n: number) => n.toString(16).padStart(2, '0');
          return `#${toHex(parseInt(r))}${toHex(parseInt(g))}${toHex(parseInt(b))}`;
        }
      }

      // Fallbacks for common variables
      if (displayValue.includes('--primary-color')) return '#03a9f4';
      if (displayValue.includes('--primary-text-color')) return '#ffffff';
      return '#000000';
    }

    return displayValue.startsWith('#') ? displayValue : '#000000';
  }

  private _isDefaultValue(): boolean {
    return (
      !this._currentValue || this._currentValue === '' || this._currentValue === this.defaultValue
    );
  }

  private _getContrastColor(backgroundColor: string): string {
    // For CSS variables and complex colors, use white text
    if (
      !backgroundColor ||
      backgroundColor.startsWith('var(') ||
      backgroundColor.includes('gradient')
    ) {
      return 'var(--primary-text-color)';
    }

    // Simple hex color contrast calculation
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    // Default to theme text color
    return 'var(--primary-text-color)';
  }

  protected render(): TemplateResult {
    const displayValue = this._getDisplayValue();
    const nativeInputColor = this._getColorForNativeInput();

    return html`
      <div class="ultra-color-picker-container">
        ${this.label ? html`<label class="color-label">${this.label}</label>` : ''}

        <div class="color-picker-wrapper">
          <!-- Main trigger input field -->
          <div
            class="color-input-field ${this.disabled ? 'disabled' : ''}"
            style="background-color: ${displayValue}; color: ${this._getContrastColor(
              displayValue
            )};"
            @click=${this._togglePalette}
            tabindex="0"
            role="button"
            aria-label="Open color palette"
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this._togglePalette(e);
              }
            }}
          >
            <span class="color-value">${displayValue}</span>
            <ha-icon
              icon="mdi:chevron-${this._showPalette ? 'up' : 'down'}"
              class="dropdown-icon"
            ></ha-icon>
          </div>

          <!-- Reset button -->
          <ha-icon-button
            class="reset-button ${this._isDefaultValue() ? 'disabled' : ''}"
            .disabled=${this._isDefaultValue()}
            @click=${this._resetToDefault}
            .title=${'Reset to default'}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </ha-icon-button>
        </div>

        <!-- Accordion-style palette -->
        ${this._showPalette
          ? html`
              <div class="color-palette-accordion">
                <!-- Text Input Section -->
                <div class="text-input-section">
                  <div class="input-header">
                    <label class="input-label">Type color value:</label>
                    <div class="native-picker-wrapper">
                      <button
                        class="native-picker-btn"
                        type="button"
                        title="Open native color picker"
                      >
                        <ha-icon icon="mdi:eyedropper"></ha-icon>
                      </button>
                      <input
                        id="native-color-input"
                        type="color"
                        .value=${nativeInputColor}
                        @change=${this._handleNativeColorChange}
                        @click=${(e: Event) => e.stopPropagation()}
                        @focus=${(e: Event) => e.stopPropagation()}
                        @blur=${(e: Event) => e.stopPropagation()}
                        class="native-color-overlay"
                        title="Open native color picker"
                      />
                    </div>
                  </div>

                  <div class="text-input-wrapper">
                    <input
                      type="text"
                      class="color-text-input ${this._isValidColor(this._textInputValue || '')
                        ? 'valid'
                        : 'invalid'}"
                      .value=${this._textInputValue || ''}
                      @input=${this._handleTextInputChange}
                      @keydown=${this._handleTextInputKeyDown}
                      @click=${(e: Event) => e.stopPropagation()}
                      @focus=${(e: Event) => e.stopPropagation()}
                      placeholder="e.g. #ff0000, rgb(255,0,0), var(--primary-color)"
                      spellcheck="false"
                    />
                    <button
                      class="apply-text-btn ${this._isValidColor(this._textInputValue || '')
                        ? ''
                        : 'disabled'}"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._applyTextInputValue();
                      }}
                      .disabled=${!this._isValidColor(this._textInputValue || '')}
                      type="button"
                      title="Apply color"
                    >
                      <ha-icon icon="mdi:check"></ha-icon>
                    </button>
                  </div>
                </div>

                <!-- Color Palette Grid -->
                <div class="palette-grid">
                  ${COLOR_PALETTE.map(
                    color => html`
                      <div
                        class="color-swatch ${this._currentValue === color ? 'selected' : ''}"
                        style="background-color: ${color}"
                        @click=${(e: Event) => this._selectColor(color, e)}
                        title="${color}"
                      ></div>
                    `
                  )}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  static get styles() {
    return css`
      .ultra-color-picker-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        position: relative;
        box-sizing: border-box;
      }

      .color-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .color-picker-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        /* Ensure palette can overflow this container */
        overflow: visible;
        z-index: 1;
      }

      .color-input-field {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: var(--code-font-family, monospace);
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }

      .color-input-field:hover:not(.disabled) {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
      }

      .color-input-field:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.2);
      }

      .color-input-field.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--disabled-color, #f5f5f5);
        color: var(--disabled-text-color);
      }

      .color-value {
        flex: 1;
        color: var(--primary-text-color);
        font-family: var(--code-font-family, monospace);
        font-size: 14px;
      }

      .dropdown-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        transition: transform 0.2s ease;
        margin-left: 8px;
      }

      .reset-button {
        --mdc-icon-button-size: 40px;
        --mdc-icon-size: 20px;
        --mdc-theme-primary: var(--primary-color);
        border-radius: 6px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .reset-button:not(.disabled):hover {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        transform: rotate(180deg);
        transform-origin: center center;
      }

      .reset-button ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transform-origin: center center;
      }

      .reset-button.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .reset-button.disabled ha-icon {
        color: var(--disabled-text-color);
      }

      .color-palette-accordion {
        margin-top: 12px;
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        animation: expandDown 0.2s ease-out;
      }

      @keyframes expandDown {
        from {
          opacity: 0;
          transform: scaleY(0.8);
          transform-origin: top;
        }
        to {
          opacity: 1;
          transform: scaleY(1);
          transform-origin: top;
        }
      }

      .text-input-section {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .input-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .input-label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .text-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: stretch;
      }

      .color-text-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-family: var(--code-font-family, 'Courier New', monospace);
        font-size: 14px;
        transition: all 0.2s ease;
        outline: none;
      }

      .color-text-input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.2);
      }

      .color-text-input.valid {
        border-color: var(--success-color, #4caf50);
      }

      .color-text-input.invalid {
        border-color: var(--error-color, #f44336);
      }

      .apply-text-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 44px;
      }

      .apply-text-btn:hover:not(.disabled) {
        background: var(--primary-color-dark, var(--primary-color));
        transform: scale(1.05);
      }

      .apply-text-btn.disabled {
        background: var(--disabled-color, #cccccc);
        color: var(--disabled-text-color);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .apply-text-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .palette-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
        gap: 8px;
        margin-bottom: 0;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        position: relative;
      }

      .color-swatch:hover {
        transform: scale(1.1);
        border-color: var(--primary-color);
      }

      .color-swatch.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.3);
      }

      .color-swatch[style*='var(--'] {
        position: relative;
      }

      .color-swatch[style*='var(--']:after {
        content: 'T';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: bold;
        color: var(--primary-text-color);
        text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
      }

      .native-picker-wrapper {
        position: relative;
        display: inline-block;
      }

      .native-picker-btn {
        background: none;
        border: none;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--primary-color);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 36px;
        pointer-events: none; /* Let clicks pass through to the overlay */
      }

      .native-picker-btn:hover {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        transform: scale(1.1);
      }

      .native-picker-btn ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.2s ease;
      }

      .native-color-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        border: none;
        background: transparent;
        z-index: 1;
        border-radius: 6px;
      }

      .native-color-overlay::-webkit-color-swatch-wrapper {
        padding: 0;
        border: none;
        border-radius: 6px;
      }

      .native-color-overlay::-webkit-color-swatch {
        border: none;
        border-radius: 6px;
      }

      .native-picker-wrapper:hover .native-picker-btn {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        .color-picker-wrapper {
          gap: 8px;
        }

        .color-input-field {
          font-size: 13px;
          padding: 6px 10px;
        }

        .color-palette-accordion {
          padding: 12px;
        }

        .palette-grid {
          grid-template-columns: repeat(auto-fit, minmax(28px, 1fr));
          gap: 6px;
        }

        .color-swatch {
          width: 28px;
          height: 28px;
        }

        .input-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .text-input-wrapper {
          flex-direction: column;
          gap: 8px;
        }

        .color-text-input {
          width: 100%;
        }
      }
    `;
  }
}
