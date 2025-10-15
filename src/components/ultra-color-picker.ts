import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucFavoriteColorsService } from '../services/uc-favorite-colors-service';
import { FavoriteColor } from '../types';
import { Z_INDEX } from '../utils/uc-z-index';

export interface ColorChangedEvent {
  detail: {
    value: string;
  };
}

// Predefined color palette
const COLOR_PALETTE = [
  // Transparent option
  'transparent',
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
  @state() private _favoriteColors: FavoriteColor[] = [];
  @state() private _showAddToFavorites = false;
  @state() private _transparency = 100; // 0-100, where 100 is fully opaque
  private _documentClickHandler?: (e: Event) => void;
  private _favoritesUnsubscribe?: () => void;

  protected firstUpdated(): void {
    this._currentValue = this.value;
    this._textInputValue = this.value;
    // Extract initial transparency from the value
    this._transparency = this._extractTransparency(this.value);

    // Simple click outside handler for accordion
    this._documentClickHandler = this._handleDocumentClick.bind(this);
    document.addEventListener('click', this._documentClickHandler, true);

    // Subscribe to favorite colors changes
    this._favoritesUnsubscribe = ucFavoriteColorsService.subscribe(favorites => {
      this._favoriteColors = favorites;
      this.requestUpdate(); // Force re-render when favorites change
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._documentClickHandler) {
      document.removeEventListener('click', this._documentClickHandler, true);
      this._documentClickHandler = undefined;
    }

    // Unsubscribe from favorite colors
    if (this._favoritesUnsubscribe) {
      this._favoritesUnsubscribe();
      this._favoritesUnsubscribe = undefined;
    }
  }

  private _handleDocumentClick(event: Event): void {
    if (!this._showPalette) return;

    // Don't close palette during prompt dialogs or if we're in the middle of adding favorites
    if (this._showAddToFavorites) return;

    // If click originated inside this component (including within shadow DOM), ignore
    const path = (event as any).composedPath?.() as EventTarget[] | undefined;
    if (path && path.includes(this)) return;

    const target = event.target as Node;
    if (this.shadowRoot?.contains(target)) return;

    // Don't close if it's a color input event (these can sometimes trigger outside events)
    if (target instanceof HTMLInputElement && target.type === 'color') return;

    // Don't close if it's a prompt dialog or modal
    if (target instanceof HTMLElement && target.closest('[role="dialog"], .prompt, .modal')) return;

    this._showPalette = false;
  }

  protected updated(changedProps: Map<string, any>): void {
    if (changedProps.has('value')) {
      this._currentValue = this.value;
      this._textInputValue = this.value;
      // Extract transparency from the new value
      this._transparency = this._extractTransparency(this.value);
    }
  }

  private _togglePalette(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    // When opening the palette, ensure transparency is extracted from current value
    if (!this._showPalette) {
      this._currentValue = this.value;
      this._textInputValue = this.value;
      this._transparency = this._extractTransparency(this.value);
    }

    this._showPalette = !this._showPalette;
  }

  private _selectColor(color: string, event: Event): void {
    event.stopPropagation();

    // Apply current transparency to the newly selected color
    const colorWithTransparency = this._applyTransparency(color, this._transparency);

    // Update preview and dispatch event immediately for live preview
    this._currentValue = colorWithTransparency;
    this._textInputValue = colorWithTransparency;
    this.value = colorWithTransparency;

    // Dispatch value-changed event for live preview
    const changeEvent = new CustomEvent('value-changed', {
      detail: { value: colorWithTransparency },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);

    this.requestUpdate(); // Force re-render to show the updated color
  }

  private _applyColorSelection(): void {
    // Finalize the color selection and close the palette
    this.value = this._currentValue;
    this._showPalette = false;

    const changeEvent = new CustomEvent('value-changed', {
      detail: { value: this._currentValue },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);
    this.requestUpdate();
  }

  private _handleNativeColorChange(event: Event): void {
    event.stopPropagation(); // Prevent accordion from closing
    const input = event.target as HTMLInputElement;
    const color = input.value;
    // Update preview with current transparency
    const colorWithTransparency = this._applyTransparency(color, this._transparency);
    this._currentValue = colorWithTransparency;
    this._textInputValue = colorWithTransparency;
    this.value = colorWithTransparency;

    // Dispatch value-changed event for live preview
    const changeEvent = new CustomEvent('value-changed', {
      detail: { value: colorWithTransparency },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);

    this.requestUpdate();
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
    if (this._textInputValue !== undefined && this._isValidColor(this._textInputValue)) {
      // Update the current value
      this._currentValue = this._textInputValue;
      this.value = this._textInputValue;
      // Extract transparency from the input
      this._transparency = this._extractTransparency(this._textInputValue);

      // Dispatch value-changed event
      const changeEvent = new CustomEvent('value-changed', {
        detail: { value: this._textInputValue },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(changeEvent);

      // Close the palette
      this._showPalette = false;

      this.requestUpdate();
    }
  }

  private _isValidColor(color: string): boolean {
    if (!color) return false;

    // Check for CSS gradient functions (linear-gradient, radial-gradient, etc.)
    if (color.toLowerCase().includes('gradient')) {
      // Basic validation for gradient syntax - must start with gradient type and have parentheses
      const gradientPattern =
        /^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\(.*\)$/i;
      return gradientPattern.test(color.trim());
    }

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

  private _addToFavorites(): void {
    const currentColor = this._currentValue || this.value;
    if (!currentColor || ucFavoriteColorsService.hasColor(currentColor)) {
      return;
    }

    // Prevent the palette from closing during the prompt
    const originalShowPalette = this._showPalette;

    // Use setTimeout to ensure the prompt appears after the current event cycle
    setTimeout(() => {
      // Show a simple prompt for the color name
      const colorName = prompt(
        'Enter a name for this color:',
        this._getColorDisplayName(currentColor)
      );

      if (colorName && colorName.trim()) {
        ucFavoriteColorsService.addFavorite(colorName.trim(), currentColor);

        // Keep the palette open if it was open before
        this._showPalette = originalShowPalette;
        this._showAddToFavorites = false;

        // Force a re-render to show the updated favorites
        this.requestUpdate();
      } else {
        // Restore the palette state if user cancelled
        this._showPalette = originalShowPalette;
      }
    }, 10);
  }

  private _getColorDisplayName(color: string): string {
    // Convert common colors to friendly names
    const colorNames: Record<string, string> = {
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#000000': 'Black',
      '#ffffff': 'White',
      '#808080': 'Gray',
      '#ffa500': 'Orange',
      '#800080': 'Purple',
      '#ffc0cb': 'Pink',
    };

    const lowerColor = color.toLowerCase();
    if (colorNames[lowerColor]) {
      return colorNames[lowerColor];
    }

    // For CSS variables, extract the variable name
    if (color.startsWith('var(--')) {
      const varName = color.match(/var\(--([^)]+)\)/)?.[1];
      if (varName) {
        return varName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    return color;
  }

  private _getDisplayValue(): string {
    if (!this._currentValue || this._currentValue === '') {
      return this.defaultValue || '';
    }
    return this._currentValue;
  }

  private _getColorForNativeInput(): string {
    const displayValue = this._getDisplayValue();

    // Handle transparent - native input can't display transparent, so use white
    if (displayValue === 'transparent') {
      return '#ffffff';
    }

    // Gradients can't be displayed in native color input - use a default color
    if (displayValue.toLowerCase().includes('gradient')) {
      return '#000000';
    }

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
    // Handle transparent background
    if (backgroundColor === 'transparent') {
      return 'var(--primary-text-color)';
    }

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

  /**
   * Extract transparency from a color value (0-100, where 100 is fully opaque)
   */
  private _extractTransparency(color?: string): number {
    if (!color) return 100;

    // Gradients don't have a single transparency value - default to 100%
    if (color.toLowerCase().includes('gradient')) {
      return 100;
    }

    // Check for RGBA format
    const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
    if (rgbaMatch) {
      const alpha = parseFloat(rgbaMatch[4]);
      return Math.round(alpha * 100);
    }

    // Check for 8-digit hex with alpha (#RRGGBBAA)
    const hexAlphaMatch = color.match(/^#[0-9A-Fa-f]{8}$/);
    if (hexAlphaMatch) {
      const alpha = parseInt(color.substring(7, 9), 16) / 255;
      return Math.round(alpha * 100);
    }

    // Check for HSLA format
    const hslaMatch = color.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d.]+)\s*\)/);
    if (hslaMatch) {
      const alpha = parseFloat(hslaMatch[4]);
      return Math.round(alpha * 100);
    }

    // For transparent keyword
    if (color === 'transparent') {
      return 0;
    }

    // Default to fully opaque for hex, rgb, hsl, named colors, and CSS variables
    return 100;
  }

  /**
   * Convert hex color to RGB values
   */
  private _hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Get base color without alpha/transparency
   */
  private _getBaseColor(color?: string): string {
    if (!color) return '#000000';

    // Gradients don't have a single base color - return as-is
    if (color.toLowerCase().includes('gradient')) {
      return color;
    }

    // Extract RGB from RGBA
    const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/);
    if (rgbaMatch) {
      const [_, r, g, b] = rgbaMatch;
      const toHex = (n: string) => parseInt(n).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Extract from 8-digit hex
    if (color.match(/^#[0-9A-Fa-f]{8}$/)) {
      return color.substring(0, 7);
    }

    // Extract HSL from HSLA
    const hslaMatch = color.match(
      /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+)?\s*\)/
    );
    if (hslaMatch) {
      const [_, h, s, l] = hslaMatch;
      return `hsl(${h}, ${s}%, ${l}%)`;
    }

    // For transparent, return white
    if (color === 'transparent') {
      return '#FFFFFF';
    }

    // Return as-is for hex, named colors, CSS variables
    return color;
  }

  /**
   * Apply transparency to a base color
   */
  private _applyTransparency(baseColor: string, transparency: number): string {
    // Gradients can't have transparency applied easily - return as-is
    if (baseColor.toLowerCase().includes('gradient')) {
      return baseColor;
    }

    // At 100% transparency, use hex format
    if (transparency === 100) {
      return baseColor;
    }

    // For transparent keyword at 0%
    if (transparency === 0) {
      return 'transparent';
    }

    const alpha = (transparency / 100).toFixed(2);

    // Handle CSS variables - wrap in rgba if not 100%
    if (baseColor.startsWith('var(--')) {
      return `rgba(${baseColor}, ${alpha})`;
    }

    // Handle hex colors
    if (baseColor.startsWith('#')) {
      const rgb = this._hexToRgb(baseColor);
      if (rgb) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      }
    }

    // Handle RGB format
    const rgbMatch = baseColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Handle HSL format
    const hslMatch = baseColor.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
    if (hslMatch) {
      const [_, h, s, l] = hslMatch;
      return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
    }

    // For named colors, convert to rgba (approximation - may not work for all named colors)
    return baseColor;
  }

  /**
   * Handle transparency slider change
   */
  private _handleTransparencyChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const transparency = parseInt(input.value, 10);
    this._transparency = transparency;

    // Get the base color without alpha
    const baseColor = this._getBaseColor(this._currentValue);

    // Apply the new transparency
    const newColor = this._applyTransparency(baseColor, transparency);

    // Update preview and dispatch event for live preview
    this._currentValue = newColor;
    this._textInputValue = newColor;
    this.value = newColor;

    // Dispatch value-changed event for live preview
    const changeEvent = new CustomEvent('value-changed', {
      detail: { value: newColor },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);

    this.requestUpdate();
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
                      placeholder="e.g. #ff0000, rgb(255,0,0), linear-gradient(...), var(--primary-color)"
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

                <!-- Transparency Slider Section -->
                <div class="transparency-section">
                  <div class="transparency-header">
                    <label class="transparency-label">Transparency:</label>
                    <span class="transparency-value">${this._transparency}%</span>
                  </div>
                  <div class="transparency-slider-wrapper">
                    <input
                      type="range"
                      class="transparency-slider"
                      min="0"
                      max="100"
                      step="1"
                      .value=${this._transparency.toString()}
                      @input=${this._handleTransparencyChange}
                      @click=${(e: Event) => e.stopPropagation()}
                      title="Adjust transparency (100% = fully opaque, 0% = fully transparent)"
                    />
                    <div class="transparency-track">
                      <div
                        class="transparency-preview"
                        style="background: linear-gradient(to right, 
                          transparent 0%, 
                          ${this._getBaseColor(this._currentValue)} 100%
                        );"
                      ></div>
                    </div>
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

                <!-- Favorites Section -->
                ${this._favoriteColors.length > 0 || this._showAddToFavorites
                  ? html`
                      <div class="favorites-section">
                        <div class="favorites-header">
                          <label class="favorites-label">Favorite Colors</label>
                          ${this._currentValue &&
                          !ucFavoriteColorsService.hasColor(this._currentValue)
                            ? html`
                                <button
                                  class="add-favorite-btn"
                                  @click=${this._addToFavorites}
                                  title="Add current color to favorites"
                                  type="button"
                                >
                                  <ha-icon icon="mdi:heart-plus"></ha-icon>
                                </button>
                              `
                            : ''}
                        </div>

                        ${this._favoriteColors.length > 0
                          ? html`
                              <div class="favorites-grid">
                                ${this._favoriteColors.map(
                                  favorite => html`
                                    <div
                                      class="favorite-swatch ${this._currentValue === favorite.color
                                        ? 'selected'
                                        : ''}"
                                      style="background-color: ${favorite.color}"
                                      @click=${(e: Event) => this._selectColor(favorite.color, e)}
                                      title="${favorite.name} (${favorite.color})"
                                    >
                                      <span class="favorite-tooltip">${favorite.name}</span>
                                    </div>
                                  `
                                )}
                              </div>
                            `
                          : html`
                              <div class="no-favorites">
                                <span>No favorite colors yet</span>
                                <small>Select a color and click the heart to add it</small>
                              </div>
                            `}
                      </div>
                    `
                  : ''}
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
        z-index: ${Z_INDEX.COLOR_PICKER_CONTAINER};
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
        z-index: ${Z_INDEX.MODULE_CONTENT};
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
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        animation: expandDown 0.2s ease-out;
        position: relative;
        z-index: ${Z_INDEX.COLOR_PICKER_PALETTE};
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
        width: 100%;
        box-sizing: border-box;
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
        width: 100%;
        box-sizing: border-box;
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
        box-sizing: border-box;
        min-width: 0;
        width: 100%;
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

      /* Transparency Slider Section */
      .transparency-section {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .transparency-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .transparency-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .transparency-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        font-family: var(--code-font-family, monospace);
      }

      .transparency-slider-wrapper {
        position: relative;
        width: 100%;
        height: 32px;
        margin-bottom: 8px;
      }

      .transparency-track {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 8px;
        transform: translateY(-50%);
        border-radius: 4px;
        overflow: hidden;
        pointer-events: none;
        border: 1px solid var(--divider-color);
        background:
          linear-gradient(45deg, #ccc 25%, transparent 25%),
          linear-gradient(-45deg, #ccc 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #ccc 75%),
          linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 8px 8px;
        background-position:
          0 0,
          0 4px,
          4px -4px,
          -4px 0px;
      }

      .transparency-preview {
        width: 100%;
        height: 100%;
        border-radius: inherit;
      }

      .transparency-slider {
        position: relative;
        width: 100%;
        height: 8px;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        outline: none;
        cursor: pointer;
        z-index: ${Z_INDEX.MODULE_CONTENT};
        margin: 0;
        padding: 12px 0;
      }

      /* Webkit/Chrome slider thumb */
      .transparency-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .transparency-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
      }

      .transparency-slider::-webkit-slider-thumb:active {
        transform: scale(1.1);
        background: var(--primary-color-dark, var(--primary-color));
      }

      /* Firefox slider thumb */
      .transparency-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .transparency-slider::-moz-range-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
      }

      .transparency-slider::-moz-range-thumb:active {
        transform: scale(1.1);
        background: var(--primary-color-dark, var(--primary-color));
      }

      /* Firefox track (hide default track) */
      .transparency-slider::-moz-range-track {
        background: transparent;
        border: none;
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

      /* Transparent swatch styling */
      .color-swatch[style*='transparent'] {
        background:
          linear-gradient(45deg, #ccc 25%, transparent 25%),
          linear-gradient(-45deg, #ccc 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #ccc 75%),
          linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 8px 8px;
        background-position:
          0 0,
          0 4px,
          4px -4px,
          -4px 0px;
        position: relative;
      }

      .color-swatch[style*='transparent']:after {
        content: '∅';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 14px;
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
        z-index: ${Z_INDEX.MODULE_CONTENT};
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

      /* Favorites Section */
      .favorites-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .favorites-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .favorites-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .add-favorite-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        background: none;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--primary-color);
        transition: all 0.2s ease;
      }

      .add-favorite-btn:hover {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        transform: scale(1.1);
      }

      .add-favorite-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
        gap: 8px;
        margin-bottom: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .favorite-swatch {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .favorite-swatch:hover {
        transform: scale(1.1);
        border-color: var(--primary-color);
      }

      .favorite-swatch.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.3);
      }

      .favorite-swatch .favorite-tooltip {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: ${Z_INDEX.CARD_TOOLTIP};
      }

      .favorite-swatch:hover .favorite-tooltip {
        opacity: 1;
      }

      .no-favorites {
        text-align: center;
        padding: 16px;
        color: var(--secondary-text-color);
      }

      .no-favorites span {
        display: block;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .no-favorites small {
        font-size: 12px;
        opacity: 0.7;
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
          font-size: 13px;
          padding: 8px 10px;
        }

        .apply-text-btn {
          width: 100%;
          justify-content: center;
        }
      }

      /* Extra small screens - further optimize text input */
      @media (max-width: 480px) {
        .color-text-input {
          font-size: 12px;
          padding: 6px 8px;
        }

        .color-text-input::placeholder {
          font-size: 11px;
        }
      }
    `;
  }
}
