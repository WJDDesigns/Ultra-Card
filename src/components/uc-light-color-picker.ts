import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import './ultra-color-picker';
import { Z_INDEX } from '../utils/uc-z-index';

export interface LightColorChangedEvent {
  detail: {
    rgb_color?: number[];
    hs_color?: number[];
    xy_color?: number[];
    color_temp?: number;
    effect?: string;
    effect_speed?: number;
    effect_intensity?: number;
    effect_reverse?: boolean;
    mode: 'rgb' | 'hs' | 'xy' | 'color_temp' | 'effect' | 'rgbww';
    rgbww_mode?: boolean;
  };
}

// Color conversion utilities for light control
class LightColorUtils {
  /**
   * Convert RGB to HS (Hue/Saturation)
   */
  static rgbToHs(r: number, g: number, b: number): number[] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const s = max === 0 ? 0 : (max - min) / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / (max - min) + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / (max - min) + 2;
          break;
        case b:
          h = (r - g) / (max - min) + 4;
          break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100)];
  }

  /**
   * Convert HS to RGB
   */
  static hsToRgb(h: number, s: number): number[] {
    h /= 360;
    s /= 100;
    const v = 1; // Full brightness for color picker

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r: number, g: number, b: number;

    switch (i % 6) {
      case 0:
        [r, g, b] = [v, t, p];
        break;
      case 1:
        [r, g, b] = [q, v, p];
        break;
      case 2:
        [r, g, b] = [p, v, t];
        break;
      case 3:
        [r, g, b] = [p, q, v];
        break;
      case 4:
        [r, g, b] = [t, p, v];
        break;
      case 5:
        [r, g, b] = [v, p, q];
        break;
      default:
        [r, g, b] = [0, 0, 0];
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Convert RGB to XY color space (CIE 1931)
   */
  static rgbToXy(r: number, g: number, b: number): number[] {
    // Normalize RGB values
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ using sRGB matrix
    const X = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const Z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Calculate xy coordinates
    const sum = X + Y + Z;
    if (sum === 0) return [0.3127, 0.329]; // White point

    return [Math.round((X / sum) * 10000) / 10000, Math.round((Y / sum) * 10000) / 10000];
  }

  /**
   * Convert XY to RGB
   */
  static xyToRgb(x: number, y: number, brightness: number = 1): number[] {
    const z = 1 - x - y;
    const Y = brightness;
    const X = (Y / y) * x;
    const Z = (Y / y) * z;

    // Convert XYZ to RGB using sRGB matrix
    let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
    let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
    let b = X * 0.0557 + Y * -0.204 + Z * 1.057;

    // Apply gamma correction
    r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;

    // Clamp values
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    b = Math.max(0, Math.min(1, b));

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Convert RGB to HEX
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  /**
   * Convert HEX to RGB
   */
  static hexToRgb(hex: string): number[] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  }

  /**
   * Convert Kelvin to Mired
   */
  static kelvinToMired(kelvin: number): number {
    return Math.round(1000000 / kelvin);
  }

  /**
   * Convert Mired to Kelvin
   */
  static miredToKelvin(mired: number): number {
    return Math.round(1000000 / mired);
  }

  /**
   * Convert Mired to RGB
   */
  static miredToRgb(mired: number): number[] {
    const kelvin = this.miredToKelvin(mired);
    return this.kelvinToRgb(kelvin);
  }

  /**
   * Convert Kelvin to RGB
   */
  static kelvinToRgb(kelvin: number): number[] {
    // Algorithm based on Tanner Helland's method
    let r, g, b;
    const temp = kelvin / 100;

    // Red calculation
    if (temp <= 66) {
      r = 255;
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // Green calculation
    if (temp <= 66) {
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
    } else {
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
    }
    g = Math.max(0, Math.min(255, g));

    // Blue calculation
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      b = Math.max(0, Math.min(255, b));
    }

    return [Math.round(r), Math.round(g), Math.round(b)];
  }
}

@customElement('uc-light-color-picker')
export class UcLightColorPicker extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public rgb_color?: number[];
  @property() public hs_color?: number[];
  @property() public xy_color?: number[];
  @property() public color_temp?: number;
  @property() public effect?: string;
  @property() public effect_speed?: number; // WLED effect speed (0-255)
  @property() public effect_intensity?: number; // WLED effect intensity (0-255)
  @property() public effect_reverse?: boolean; // WLED effect direction
  @property() public effect_list?: string[]; // Available effects for the selected entities
  @property() public mode: 'rgb' | 'hs' | 'xy' | 'color_temp' | 'effect' | 'rgbww' = 'hs';
  @property() public min_mireds = 153; // ~6500K
  @property() public max_mireds = 500; // ~2000K
  @property({ type: Boolean }) public disabled = false;
  @property({ type: Boolean }) public rgbww_mode = false; // Enable RGBWW combined mode

  @state() private _isDragging = false;
  @state() private _currentRgb: number[] = [255, 255, 255];
  @state() private _currentHs: number[] = [0, 0];
  @state() private _currentXy: number[] = [0.3127, 0.329];
  @state() private _currentColorTemp = 333; // ~3000K
  @state() private _showColorPicker = false;
  @state() private _ignoringNextEffectChange = false;
  @state() private _processingEffectChange = false;
  @state() private _effectDropdownOpen = false;
  @state() private _effectSearchTerm = '';
  @state() private _filteredEffects: string[] = [];

  protected firstUpdated(): void {
    this.updateCurrentValues();

    // Add click outside handler to close dropdown
    document.addEventListener('click', this.handleClickOutside);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleClickOutside);
  }

  private handleClickOutside = (e: Event): void => {
    const target = e.target as Node;
    const container = this.shadowRoot?.querySelector('.custom-select-container');

    if (container && !container.contains(target) && !this.contains(target)) {
      this._effectDropdownOpen = false;
      this._effectSearchTerm = '';
      this.requestUpdate();
    }
  };

  protected updated(changedProperties: Map<string, any>): void {
    if (
      changedProperties.has('rgb_color') ||
      changedProperties.has('hs_color') ||
      changedProperties.has('xy_color') ||
      changedProperties.has('color_temp')
    ) {
      this.updateCurrentValues();
    }
  }

  private updateCurrentValues(): void {
    if (this.rgb_color) {
      this._currentRgb = [...this.rgb_color];
      this._currentHs = LightColorUtils.rgbToHs(
        this.rgb_color[0],
        this.rgb_color[1],
        this.rgb_color[2]
      );
      this._currentXy = LightColorUtils.rgbToXy(
        this.rgb_color[0],
        this.rgb_color[1],
        this.rgb_color[2]
      );
    } else if (this.hs_color) {
      this._currentHs = [...this.hs_color];
      this._currentRgb = LightColorUtils.hsToRgb(this.hs_color[0], this.hs_color[1]);
      this._currentXy = LightColorUtils.rgbToXy(
        this._currentRgb[0],
        this._currentRgb[1],
        this._currentRgb[2]
      );
    } else if (this.xy_color) {
      this._currentXy = [...this.xy_color];
      this._currentRgb = LightColorUtils.xyToRgb(this.xy_color[0], this.xy_color[1]);
      this._currentHs = LightColorUtils.rgbToHs(
        this._currentRgb[0],
        this._currentRgb[1],
        this._currentRgb[2]
      );
    } else if (this.color_temp) {
      // Handle color_temp-only presets by converting to RGB/HS/XY
      this._currentRgb = LightColorUtils.miredToRgb(this.color_temp);
      this._currentHs = LightColorUtils.rgbToHs(
        this._currentRgb[0],
        this._currentRgb[1],
        this._currentRgb[2]
      );
      this._currentXy = LightColorUtils.rgbToXy(
        this._currentRgb[0],
        this._currentRgb[1],
        this._currentRgb[2]
      );
    }

    if (this.color_temp) {
      this._currentColorTemp = this.color_temp;
    }
  }

  private fireColorChanged(updates: Partial<LightColorChangedEvent['detail']>): void {
    // Determine the actual mode based on RGBWW mode and current state
    let effectiveMode = this.mode;
    if (this.rgbww_mode && (this.mode === 'hs' || this.mode === 'rgb' || this.mode === 'xy')) {
      effectiveMode = 'rgbww';
    }

    const event = new CustomEvent('color-changed', {
      detail: {
        rgb_color: this._currentRgb,
        hs_color: this._currentHs,
        xy_color: this._currentXy,
        color_temp: this._currentColorTemp,
        effect: this.effect,
        mode: effectiveMode,
        rgbww_mode: this.rgbww_mode,
        ...updates,
      },
    });
    this.dispatchEvent(event);
  }

  private openColorPicker(): void {
    if (this.disabled) return;
    this._showColorPicker = !this._showColorPicker;
  }

  private handleUltraColorPickerChange(e: CustomEvent): void {
    const newColor = e.detail.value;
    this.handleHexChange(newColor);
    this._showColorPicker = false;
  }

  private handleTestPreset() {
    // Dispatch a test preset event that the parent can listen to
    const event = new CustomEvent('test-preset', {
      detail: {
        mode: this.mode,
        rgb_color: this.rgb_color,
        hs_color: this.hs_color,
        xy_color: this.xy_color,
        color_temp: this.color_temp,
        effect: this.effect,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private handleColorWheelClick(e: MouseEvent): void {
    if (this.disabled) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    const distance = Math.sqrt(x * x + y * y);
    const maxRadius = Math.min(rect.width, rect.height) / 2 - 3; // Account for border

    // Allow clicking anywhere within the wheel, clamp to max radius
    const clampedDistance = Math.min(distance, maxRadius);

    // Calculate hue from angle - adjust to match CSS conic-gradient
    let hue = Math.atan2(y, x) * (180 / Math.PI);
    hue += 90; // Adjust for CSS gradient starting position
    if (hue < 0) hue += 360;
    if (hue >= 360) hue -= 360;

    // Calculate saturation from distance (allow full range to edge)
    const saturation = Math.min(clampedDistance / maxRadius, 1) * 100;

    this._currentHs = [Math.round(hue), Math.round(saturation)];
    this._currentRgb = LightColorUtils.hsToRgb(hue, saturation);
    this._currentXy = LightColorUtils.rgbToXy(
      this._currentRgb[0],
      this._currentRgb[1],
      this._currentRgb[2]
    );

    this.fireColorChanged({
      rgb_color: this._currentRgb,
      hs_color: this._currentHs,
      xy_color: this._currentXy,
      mode: 'hs',
    });
  }

  private handleRgbChange(component: number, value: number): void {
    if (this.disabled) return;

    const newRgb = [...this._currentRgb];
    newRgb[component] = Math.max(0, Math.min(255, value));

    this._currentRgb = newRgb;
    this._currentHs = LightColorUtils.rgbToHs(newRgb[0], newRgb[1], newRgb[2]);
    this._currentXy = LightColorUtils.rgbToXy(newRgb[0], newRgb[1], newRgb[2]);

    this.fireColorChanged({
      rgb_color: this._currentRgb,
      hs_color: this._currentHs,
      xy_color: this._currentXy,
      mode: 'rgb',
    });
  }

  private handleHexChange(hex: string): void {
    if (this.disabled) return;

    const rgb = LightColorUtils.hexToRgb(hex);
    if (rgb) {
      this._currentRgb = rgb;
      this._currentHs = LightColorUtils.rgbToHs(rgb[0], rgb[1], rgb[2]);
      this._currentXy = LightColorUtils.rgbToXy(rgb[0], rgb[1], rgb[2]);

      this.fireColorChanged({
        rgb_color: this._currentRgb,
        hs_color: this._currentHs,
        xy_color: this._currentXy,
        mode: 'rgb',
      });
    }
  }

  private handleColorTempChange(mired: number): void {
    if (this.disabled) return;

    this._currentColorTemp = Math.max(this.min_mireds, Math.min(this.max_mireds, mired));

    // In RGBWW mode, keep both color and temp values
    if (this.rgbww_mode) {
      this.fireColorChanged({
        rgb_color: this._currentRgb,
        hs_color: this._currentHs,
        xy_color: this._currentXy,
        color_temp: this._currentColorTemp,
        mode: 'rgbww',
      });
    } else {
      this.fireColorChanged({
        color_temp: this._currentColorTemp,
        mode: 'color_temp',
      });
    }
  }

  private handleEffectsTabClick(): void {
    if (this.disabled) {
      return;
    }

    this.mode = 'effect';
    this.requestUpdate();
  }

  private handleEffectSelectionSimple(effectValue: string): void {
    if (this.disabled) {
      return;
    }

    // Close dropdown and clear search
    this._effectDropdownOpen = false;
    this._effectSearchTerm = '';

    // Update local property
    this.effect = effectValue;

    // Fire the color-changed event directly
    if (!effectValue || effectValue.trim() === '') {
      this.mode = 'hs';
      this.fireColorChanged({
        effect: '',
        mode: 'hs',
      });
    } else {
      this.mode = 'effect';
      this.fireColorChanged({
        effect: effectValue,
        mode: 'effect',
      });
    }
  }

  private updateFilteredEffects(): void {
    const searchTerm = this._effectSearchTerm.toLowerCase();

    this._filteredEffects = (this.effect_list || []).filter(effect =>
      effect.toLowerCase().includes(searchTerm)
    );
  }

  private handleEffectSearch(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._effectSearchTerm = target.value;
    this.updateFilteredEffects();
  }

  private toggleEffectDropdown(): void {
    if (this.disabled) {
      return;
    }

    this._effectDropdownOpen = !this._effectDropdownOpen;

    if (this._effectDropdownOpen) {
      this.updateFilteredEffects();
      // Focus search input after dropdown opens
      setTimeout(() => {
        const searchInput = this.shadowRoot?.querySelector('.effect-search') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
        }
      }, 100);
    }

    this.requestUpdate();
  }

  private handleEffectChange(effect: string): void {
    if (this.disabled) return;

    // Ignore automatic events triggered by mode changes
    if (this._ignoringNextEffectChange) {
      this._ignoringNextEffectChange = false;
      return;
    }

    // Prevent concurrent processing that could cause loops
    if (this._processingEffectChange) {
      return;
    }

    this._processingEffectChange = true;

    try {
      // Handle undefined or null values
      const effectValue = effect || '';
      this.effect = effectValue; // Update local property

      // If effect is empty, clear effect and switch to color mode
      if (!effectValue || effectValue.trim() === '') {
        this.fireColorChanged({
          effect: '',
          mode: 'hs',
        });
      } else {
        // Fire event with effect
        this.fireColorChanged({
          effect: effectValue,
          mode: 'effect',
        });
      }
    } catch (error) {
      console.error('🎬 Error in handleEffectChange:', error);
    } finally {
      // Always clear the processing flag
      this._processingEffectChange = false;
    }
  }

  private getColorWheelPickerPosition(): { x: number; y: number } {
    const [hue, saturation] = this._currentHs;
    // Convert hue to radians and adjust for CSS conic-gradient starting position
    const angle = ((hue - 90) * Math.PI) / 180; // -90 to align with CSS gradient
    const radius = (saturation / 100) * 45; // 45% of wheel radius for positioning (allows edge access)

    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    };
  }

  render(): TemplateResult {
    const pickerPos = this.getColorWheelPickerPosition();
    const currentHex = LightColorUtils.rgbToHex(
      this._currentRgb[0],
      this._currentRgb[1],
      this._currentRgb[2]
    );
    const currentKelvin = LightColorUtils.miredToKelvin(this._currentColorTemp);

    return html`
      <div class="light-color-picker ${this.disabled ? 'disabled' : ''}">
        <!-- Debug Info -->

        <!-- Color Mode Tabs -->
        <div class="color-mode-tabs">
          <button
            class="mode-tab ${this.mode === 'hs' ? 'active' : ''}"
            @click=${() => (this.mode = 'hs')}
            .disabled=${this.disabled}
          >
            Color
          </button>
          <button
            class="mode-tab ${this.mode === 'color_temp' ? 'active' : ''}"
            @click=${() => (this.mode = 'color_temp')}
            .disabled=${this.disabled}
          >
            White
          </button>
          <button
            class="mode-tab ${this.mode === 'effect' ? 'active' : ''}"
            @click=${() => {
              this.mode = 'effect';
            }}
            .disabled=${this.disabled}
            style="position: relative; z-index: 10;"
          >
            Effects
          </button>
        </div>

        <!-- Color Controls -->
        ${this.mode === 'hs'
          ? html`
              <div class="color-controls ${this.rgbww_mode ? 'rgbww-controls' : ''}">
                <!-- Color Wheel -->
                <div class="color-wheel-section">
                  <div
                    class="color-wheel"
                    @click=${this.handleColorWheelClick}
                    @mousedown=${(e: MouseEvent) => {
                      if (!this.disabled) {
                        this._isDragging = true;
                        this.handleColorWheelClick(e);
                      }
                    }}
                    @mousemove=${(e: MouseEvent) => {
                      if (this._isDragging && !this.disabled) {
                        this.handleColorWheelClick(e);
                      }
                    }}
                    @mouseup=${() => (this._isDragging = false)}
                    @mouseleave=${() => (this._isDragging = false)}
                  >
                    <div
                      class="color-wheel-picker"
                      style="left: ${pickerPos.x}%; top: ${pickerPos.y}%;"
                    ></div>
                  </div>
                </div>

                <!-- Color Values -->
                <div class="color-values">
                  <!-- RGB Values -->
                  <div class="rgb-section">
                    <div class="section-title">RGB Values</div>
                    <div class="rgb-inputs">
                      <div class="rgb-input-group">
                        <label>Red</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          .value=${this._currentRgb[0]}
                          .disabled=${this.disabled}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            this.handleRgbChange(0, parseInt(target.value) || 0);
                          }}
                        />
                      </div>
                      <div class="rgb-input-group">
                        <label>Green</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          .value=${this._currentRgb[1]}
                          .disabled=${this.disabled}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            this.handleRgbChange(1, parseInt(target.value) || 0);
                          }}
                        />
                      </div>
                      <div class="rgb-input-group">
                        <label>Blue</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          .value=${this._currentRgb[2]}
                          .disabled=${this.disabled}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            this.handleRgbChange(2, parseInt(target.value) || 0);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <!-- HEX Value -->
                  <div class="hex-section">
                    <div class="hex-input-group">
                      <label>HEX</label>
                      <div class="hex-input-container">
                        <input
                          type="text"
                          .value=${currentHex}
                          .disabled=${this.disabled}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            this.handleHexChange(target.value);
                          }}
                          placeholder="#ffffff"
                        />
                        <div
                          class="color-preview clickable"
                          style="background-color: ${currentHex};"
                          @click=${this.openColorPicker}
                          title="Click to open color picker"
                        ></div>
                      </div>

                      <!-- Ultra Color Picker -->
                      ${this._showColorPicker
                        ? html`
                            <div class="color-picker-dropdown">
                              <ultra-color-picker
                                .hass=${this.hass}
                                .value=${currentHex}
                                @value-changed=${this.handleUltraColorPickerChange}
                              ></ultra-color-picker>
                            </div>
                          `
                        : ''}
                    </div>
                  </div>

                  <!-- HS Values -->
                  <div class="hs-section">
                    <div class="section-title">HS Values</div>
                    <div class="hs-values-display">
                      <span>H: ${this._currentHs[0]}°</span>
                      <span>S: ${this._currentHs[1]}%</span>
                    </div>
                  </div>

                  <!-- XY Values -->
                  <div class="xy-section">
                    <div class="section-title">XY Values</div>
                    <div class="xy-values-display">
                      <span>X: ${this._currentXy[0]}</span>
                      <span>Y: ${this._currentXy[1]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- RGBWW White Temperature Balance (shown when rgbww_mode is enabled) -->
              ${this.rgbww_mode
                ? html`
                    <div class="rgbww-divider">
                      <div class="divider-line"></div>
                      <span class="divider-label">White Temperature Balance</span>
                      <div class="divider-line"></div>
                    </div>
                    <div class="rgbww-temp-controls">
                      <div class="color-temp-slider-container">
                        <div class="temp-labels">
                          <span>Warm</span>
                          <span>${currentKelvin}K</span>
                          <span>Cool</span>
                        </div>
                        <input
                          type="range"
                          min=${this.min_mireds}
                          max=${this.max_mireds}
                          step="1"
                          .value=${this._currentColorTemp}
                          .disabled=${this.disabled}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            this.handleColorTempChange(parseInt(target.value));
                          }}
                          class="color-temp-slider"
                          style="direction: rtl;"
                        />
                        <div class="kelvin-markers">
                          <span>2000K</span>
                          <span>3000K</span>
                          <span>4000K</span>
                          <span>5000K</span>
                          <span>6500K</span>
                        </div>
                      </div>

                      <!-- Mired Input -->
                      <div class="mired-input-group">
                        <label>Mired</label>
                        <input
                          type="number"
                          min=${this.min_mireds}
                          max=${this.max_mireds}
                          .value=${this._currentColorTemp}
                          .disabled=${this.disabled}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            this.handleColorTempChange(
                              parseInt(target.value) || this._currentColorTemp
                            );
                          }}
                        />
                      </div>
                    </div>
                  `
                : ''}
            `
          : ''}

        <!-- Color Temperature Controls -->
        ${this.mode === 'color_temp'
          ? html`
              <div class="color-temp-controls">
                <div class="color-temp-section">
                  <div class="section-title">Color Temperature</div>
                  <div class="color-temp-slider-container">
                    <div class="temp-labels">
                      <span>Warm</span>
                      <span>${currentKelvin}K</span>
                      <span>Cool</span>
                    </div>
                    <input
                      type="range"
                      min=${this.min_mireds}
                      max=${this.max_mireds}
                      step="1"
                      .value=${this._currentColorTemp}
                      .disabled=${this.disabled}
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        this.handleColorTempChange(parseInt(target.value));
                      }}
                      class="color-temp-slider"
                      style="direction: rtl;"
                    />
                    <div class="kelvin-markers">
                      <span>2000K</span>
                      <span>3000K</span>
                      <span>4000K</span>
                      <span>5000K</span>
                      <span>6500K</span>
                    </div>
                  </div>

                  <!-- Mired Input -->
                  <div class="mired-input-group">
                    <label>Mired</label>
                    <input
                      type="number"
                      min=${this.min_mireds}
                      max=${this.max_mireds}
                      .value=${this._currentColorTemp}
                      .disabled=${this.disabled}
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        this.handleColorTempChange(
                          parseInt(target.value) || this._currentColorTemp
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            `
          : ''}

        <!-- Effects Controls -->
        ${this.mode === 'effect'
          ? this.effect_list && this.effect_list.length > 0
            ? html``
            : html` <div
                style="padding: 16px; background: rgba(var(--rgb-warning-color), 0.1); border-radius: 8px; text-align: center;"
              >
                <ha-icon
                  icon="mdi:information-outline"
                  style="--mdc-icon-size: 24px; color: var(--warning-color); margin-bottom: 8px;"
                ></ha-icon>
                <div style="font-weight: 500; color: var(--warning-color); margin-bottom: 8px;">
                  No Shared Effects Available
                </div>
                <div style="font-size: 14px; color: var(--secondary-text-color); line-height: 1.4;">
                  The selected lighting devices don't have any effects in common.<br />
                  Try selecting devices of the same type for shared effects.
                </div>
              </div>`
          : ''}
        ${this.mode === 'effect' && this.effect_list && this.effect_list.length > 0
          ? html`
              <div class="effects-controls">
                <div class="effects-section">
                  <div class="section-title">Light Effects</div>
                  <div class="effects-dropdown">
                    <div class="custom-select-container">
                      <!-- Selected Effect Display -->
                      <div
                        class="custom-select-trigger ${this._effectDropdownOpen ? 'open' : ''}"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this.toggleEffectDropdown();
                        }}
                        .disabled=${this.disabled}
                      >
                        <span class="selected-effect"> ${this.effect || 'No Effect'} </span>
                        <ha-icon
                          icon="mdi:chevron-down"
                          class="dropdown-arrow ${this._effectDropdownOpen ? 'rotated' : ''}"
                        ></ha-icon>
                      </div>

                      <!-- Searchable Dropdown -->
                      ${this._effectDropdownOpen
                        ? html`
                            <div class="custom-dropdown-menu">
                              <!-- Search Input -->
                              <div class="search-container">
                                <input
                                  type="text"
                                  class="effect-search"
                                  placeholder="Search effects..."
                                  .value=${this._effectSearchTerm}
                                  @input=${this.handleEffectSearch}
                                  @click=${(e: Event) => e.stopPropagation()}
                                />
                                <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
                              </div>

                              <!-- Effect Options -->
                              <div class="effect-options">
                                <div
                                  class="effect-option ${!this.effect ? 'selected' : ''}"
                                  @click=${() => this.handleEffectSelectionSimple('')}
                                >
                                  <span>No Effect</span>
                                </div>
                                ${(this._filteredEffects.length > 0
                                  ? this._filteredEffects
                                  : this.effect_list || []
                                ).map(
                                  effectName => html`
                                    <div
                                      class="effect-option ${this.effect === effectName
                                        ? 'selected'
                                        : ''}"
                                      @click=${() => this.handleEffectSelectionSimple(effectName)}
                                    >
                                      <span>${effectName}</span>
                                    </div>
                                  `
                                )}
                                ${(!this.effect_list || this.effect_list.length === 0) &&
                                this._effectSearchTerm === ''
                                  ? html`
                                      <div
                                        class="effect-option"
                                        @click=${() =>
                                          this.handleEffectSelectionSimple('colorloop')}
                                      >
                                        <span>Color Loop (Common)</span>
                                      </div>
                                      <div
                                        class="effect-option"
                                        @click=${() => this.handleEffectSelectionSimple('random')}
                                      >
                                        <span>Random (Common)</span>
                                      </div>
                                    `
                                  : ''}
                                ${this._effectSearchTerm && this._filteredEffects.length === 0
                                  ? html` <div class="no-results">No effects found</div> `
                                  : ''}
                              </div>
                            </div>
                          `
                        : ''}
                    </div>
                  </div>

                  <div
                    class="effect-description"
                    style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 4px; font-size: 12px; color: var(--secondary-text-color);"
                  >
                    Effects create dynamic lighting patterns and will override any color settings.
                  </div>
                </div>
              </div>
            `
          : ''}

        <!-- Test Preset Button -->
        <div class="test-preset-section" style="margin-top: 16px;">
          <button
            class="test-preset-btn"
            @click=${this.handleTestPreset}
            .disabled=${this.disabled}
            style="
            width: 100%;
            padding: 12px 16px;
            background: var(--primary-color);
            color: var(--text-primary-color);
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: ${this.disabled ? '0.5' : '1'};
          "
            onmouseover="this.style.background = 'var(--primary-color)'; this.style.opacity = '0.9';"
            onmouseout="this.style.background = 'var(--primary-color)'; this.style.opacity = '1';"
          >
            🎨 Test Preset
          </button>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      .light-color-picker {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .light-color-picker.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      .color-mode-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        background: var(--secondary-background-color);
        border-radius: 6px;
        padding: 4px;
      }

      .mode-tab {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .mode-tab.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .mode-tab:hover:not(.active):not(:disabled) {
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-text-color);
      }

      .color-controls {
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }

      .color-wheel-section {
        flex-shrink: 0;
      }

      .color-wheel {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          hsl(0, 100%, 50%),
          hsl(60, 100%, 50%),
          hsl(120, 100%, 50%),
          hsl(180, 100%, 50%),
          hsl(240, 100%, 50%),
          hsl(300, 100%, 50%),
          hsl(360, 100%, 50%)
        );
        position: relative;
        cursor: crosshair;
        border: 3px solid var(--card-background-color);
        box-shadow: 0 0 0 1px var(--divider-color);
        box-sizing: border-box;
        transition: all 0.2s ease;
      }

      .color-wheel:hover {
        box-shadow: 0 0 0 2px var(--primary-color);
        transform: scale(1.02);
      }

      .color-wheel-picker {
        width: 12px;
        height: 12px;
        background: white;
        border: 2px solid #333;
        border-radius: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }

      .color-values {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      .rgb-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }

      .rgb-input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .rgb-input-group label {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .rgb-input-group input {
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
        text-align: center;
      }

      .rgb-input-group input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .hex-input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .hex-input-group label {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .hex-input-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hex-input-container input {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-family: monospace;
        font-size: 12px;
        text-transform: uppercase;
      }

      .hex-input-container input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .color-preview {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        flex-shrink: 0;
        transition: all 0.2s ease;
      }

      .color-preview.clickable {
        cursor: pointer;
      }

      .color-preview.clickable:hover {
        transform: scale(1.1);
        border-color: var(--primary-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .color-picker-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: ${Z_INDEX.DROPDOWN_MENU};
        margin-top: 8px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px;
      }

      .hex-input-group {
        position: relative;
      }

      .hs-values-display,
      .xy-values-display {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: monospace;
      }

      .color-temp-controls {
        width: 100%;
      }

      .color-temp-slider-container {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
      }

      .temp-labels {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .color-temp-slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        outline: none;
        appearance: none;
        background: linear-gradient(to right, #ffb366, #fff2e6, #cce6ff);
        cursor: pointer;
        margin-bottom: 8px;
      }

      .color-temp-slider::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .color-temp-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .kelvin-markers {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .mired-input-group {
        margin-top: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mired-input-group label {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-weight: 500;
        min-width: 50px;
      }

      .mired-input-group input {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
        text-align: center;
      }

      .mired-input-group input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .effects-controls {
        width: 100%;
      }

      .effects-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
      }

      .effects-dropdown {
        width: 100%;
        max-width: 100%;
        overflow: visible !important;
        z-index: ${Z_INDEX.DROPDOWN_SELECT};
      }

      /* Custom Searchable Dropdown Styles */
      .custom-select-container {
        position: relative;
        width: 100%;
        z-index: ${Z_INDEX.DROPDOWN_SELECT};
      }

      .custom-select-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .custom-select-trigger:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(var(--rgb-primary-color), 0.1);
      }

      .custom-select-trigger.open {
        border-color: var(--primary-color);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        box-shadow: 0 2px 8px rgba(var(--rgb-primary-color), 0.15);
      }

      .custom-select-trigger[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .selected-effect {
        flex: 1;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dropdown-arrow {
        transition: transform 0.2s ease;
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }

      .dropdown-arrow.rotated {
        transform: rotate(180deg);
      }

      .custom-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--card-background-color);
        border: 1px solid var(--primary-color);
        border-top: none;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: ${Z_INDEX.DROPDOWN_MENU} !important;
        max-height: 300px;
        overflow: hidden;
      }

      .search-container {
        position: relative;
        padding: 12px;
        border-bottom: 1px solid var(--divider-color);
      }

      .effect-search {
        width: 100%;
        padding: 8px 12px 8px 36px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 14px;
        box-sizing: border-box;
      }

      .effect-search:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .search-icon {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--secondary-text-color);
        --mdc-icon-size: 16px;
        pointer-events: none;
      }

      .effect-options {
        max-height: 200px;
        overflow-y: auto;
      }

      .effect-option {
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.15s ease;
        border-bottom: 1px solid var(--divider-color);
      }

      .effect-option:last-child {
        border-bottom: none;
      }

      .effect-option:hover {
        background: var(--secondary-background-color);
      }

      .effect-option.selected {
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
        font-weight: 500;
      }

      .effect-option span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .no-results {
        padding: 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .effect-select {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box;
      }

      .effect-select ha-select {
        width: 100% !important;
        max-width: 100% !important;
      }

      .effect-description {
        margin-top: 12px;
        padding: 12px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      /* RGBWW Combined Mode Styles */
      .rgbww-controls {
        margin-bottom: 16px;
      }

      .rgbww-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 20px 0;
        color: var(--primary-text-color);
      }

      .rgbww-divider .divider-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, transparent, var(--divider-color), transparent);
      }

      .rgbww-divider .divider-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-color);
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .rgbww-temp-controls {
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid rgba(var(--rgb-primary-color), 0.1);
      }

      /* Responsive design */
      @media (max-width: 600px) {
        .color-controls {
          flex-direction: column;
          gap: 16px;
        }

        .color-wheel {
          width: 100px;
          height: 100px;
        }

        .rgb-inputs {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .rgbww-divider .divider-label {
          font-size: 11px;
        }
      }
    `;
  }
}
