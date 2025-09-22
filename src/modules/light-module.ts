import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, LightModule, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import '../components/ultra-color-picker';
import '../components/uc-light-color-picker';

// Light color mode types based on Home Assistant's supported modes
export type LightColorMode =
  | 'onoff'
  | 'brightness'
  | 'color_temp'
  | 'hs'
  | 'xy'
  | 'rgb'
  | 'rgbw'
  | 'rgbww'
  | 'white';

// Light preset interface for saving/loading color configurations
export interface LightPreset {
  id: string;
  name: string; // Display name/label for the preset
  icon?: string; // Optional icon for button/icon display
  entities: string[]; // Entities this preset applies to
  brightness?: number; // 0-255
  color_temp?: number; // Mired value
  rgb_color?: number[]; // [r, g, b]
  hs_color?: number[]; // [hue, saturation]
  xy_color?: number[]; // [x, y]
  rgbw_color?: number[]; // [r, g, b, w]
  rgbww_color?: number[]; // [r, g, b, ww, cw]
  white?: number; // White value 0-255
  effect?: string; // Effect name
  effect_speed?: number; // Effect speed (WLED: 0-255)
  effect_intensity?: number; // Effect intensity (WLED: 0-255)
  effect_reverse?: boolean; // Reverse effect direction (WLED)
  transition_time?: number; // Override transition time for this preset
  // Visual customization
  text_color?: string; // Custom text color
  icon_color?: string; // Custom icon color
  button_color?: string; // Custom button background color
  use_light_color_for_icon?: boolean; // Use current light color for icon
  use_light_color_for_button?: boolean; // Use current light color for button
  use_icon_color_for_text?: boolean; // Use icon color for text
  smart_color?: boolean; // Auto-contrast text based on button background
  // Per-preset styling
  button_style?: 'filled' | 'outlined' | 'text'; // Button visual style for this preset
  show_label?: boolean; // Show preset name for this preset
  border_radius?: number; // Button border radius (0-50)
}

// Color conversion utilities
export class ColorUtils {
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
   * Convert RGB to HSV
   */
  static rgbToHsv(r: number, g: number, b: number): number[] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  }

  /**
   * Convert HSV to RGB
   */
  static hsvToRgb(h: number, s: number, v: number): number[] {
    h /= 360;
    s /= 100;
    v /= 100;

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

    return [X / sum, Y / sum];
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
   * Calculate warm/cool white mix for RGBWW lights
   */
  static calculateWwCwMix(
    colorTemp: number,
    minMired: number,
    maxMired: number
  ): { ww: number; cw: number } {
    const clampedTemp = Math.max(minMired, Math.min(maxMired, colorTemp));
    const ratio = (clampedTemp - minMired) / (maxMired - minMired);

    return {
      ww: Math.round((1 - ratio) * 255),
      cw: Math.round(ratio * 255),
    };
  }
}

export class UltraLightModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'light',
    title: 'Light Control',
    description: 'Advanced light control with color, brightness, and effects',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:lightbulb',
    category: 'interactive',
    tags: ['light', 'color', 'brightness', 'control', 'smart'],
  };

  createDefault(id?: string, hass?: HomeAssistant): LightModule {
    return {
      id: id || this.generateId('light'),
      type: 'light',
      presets: [
        {
          id: this.generateId('preset'),
          name: 'My Preset',
          entities: [],
          brightness: 255,
          rgb_color: [255, 255, 255],
          effect: '', // Initialize effect property
          effect_speed: 128, // Default WLED speed (middle value)
          effect_intensity: 128, // Default WLED intensity (middle value)
          effect_reverse: false, // Default direction
          // Visual defaults
          text_color: 'var(--text-primary-color)',
          icon_color: 'var(--primary-color)',
          button_color: 'var(--primary-color)',
          use_light_color_for_icon: false,
          use_light_color_for_button: true,
          use_icon_color_for_text: false,
          smart_color: true, // Enable smart contrast by default
          button_style: 'filled',
          show_label: true,
          border_radius: 8,
        },
      ],
      layout: 'buttons', // buttons, grid
      button_alignment: 'center', // center, left, right, space-between, space-around, space-evenly
      allow_wrapping: true, // Allow buttons to wrap by default
      button_gap: 0.8, // Gap between buttons in rem
      columns: 3, // For grid layout
      show_labels: true,
      button_style: 'filled', // filled, outlined, text
      default_transition_time: 0.5,
      // Standard action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getSupportedColorModes(entityId: string, hass: HomeAssistant): LightColorMode[] {
    const entity = hass.states[entityId];
    if (!entity || !entity.attributes.supported_color_modes) {
      return ['onoff'];
    }
    return entity.attributes.supported_color_modes as LightColorMode[];
  }

  private getCurrentColorMode(entityId: string, hass: HomeAssistant): LightColorMode {
    const entity = hass.states[entityId];
    return (entity?.attributes.color_mode as LightColorMode) || 'onoff';
  }

  private getEffectList(entityId: string, hass: HomeAssistant): string[] {
    const entity = hass.states[entityId];
    const effectList = entity?.attributes.effect_list || [];
    return effectList;
  }

  private findSimilarEffect(targetEffect: string, availableEffects: string[]): string | null {
    const target = targetEffect.toLowerCase();

    // Direct match first
    const directMatch = availableEffects.find(effect => effect.toLowerCase() === target);
    if (directMatch) return directMatch;

    // Partial match - look for similar effects
    const partialMatch = availableEffects.find(effect => {
      const effectLower = effect.toLowerCase();
      return effectLower.includes(target) || target.includes(effectLower);
    });
    if (partialMatch) return partialMatch;

    // Semantic matching for common effect types
    const semanticMappings: Record<string, string[]> = {
      colorloop: ['rainbow', 'color_loop', 'colorloop'],
      rainbow: ['colorloop', 'rainbow', 'color_loop'],
      strobe: ['blink', 'flash', 'strobe'],
      blink: ['strobe', 'flash', 'blink'],
      breathe: ['fade', 'breathing', 'breathe'],
      fade: ['breathe', 'breathing', 'fade'],
      solid: ['static', 'solid', 'none'],
    };

    const mappings = semanticMappings[target] || [];
    for (const mapping of mappings) {
      const semanticMatch = availableEffects.find(effect => effect.toLowerCase().includes(mapping));
      if (semanticMatch) return semanticMatch;
    }

    return null;
  }

  private getCommonSupportedEffects(entities: string[], hass: HomeAssistant): string[] {
    if (entities.length === 0) {
      return ['colorloop', 'random']; // Fallback common effects
    }

    // Get effect lists from all entities
    const allEffectLists = entities.map(entityId => this.getEffectList(entityId, hass));

    // Find effects supported by all entities
    if (allEffectLists.length === 1) {
      return allEffectLists[0];
    }

    // Find intersection of all effect lists (case-insensitive)
    const commonEffects = allEffectLists.reduce((common, current) => {
      return common.filter(effect =>
        current.some(currentEffect => effect.toLowerCase() === currentEffect.toLowerCase())
      );
    });

    // If no common effects, return a curated list of universal effects that most devices support
    if (commonEffects.length === 0) {
      // Try to find effects with similar names across devices (case-insensitive partial matching)
      const universalEffects: string[] = [];
      const searchTerms = [
        'colorloop',
        'color_loop',
        'rainbow',
        'strobe',
        'flash',
        'blink',
        'fade',
        'breathe',
        'breathing',
        'solid',
        'static',
      ];

      for (const term of searchTerms) {
        for (const effectList of allEffectLists) {
          const matchingEffect = effectList.find(effect =>
            effect.toLowerCase().includes(term.toLowerCase())
          );
          if (matchingEffect && !universalEffects.includes(matchingEffect)) {
            // Check if this effect (or similar) exists in ALL device lists
            const existsInAll = allEffectLists.every(list =>
              list.some(
                effect =>
                  effect.toLowerCase().includes(term.toLowerCase()) ||
                  effect.toLowerCase() === matchingEffect.toLowerCase()
              )
            );
            if (existsInAll) {
              universalEffects.push(matchingEffect);
            }
          }
        }
      }

      // If still no universal effects, return basic fallback
      if (universalEffects.length === 0) {
        return ['colorloop', 'strobe', 'fade']; // Basic effects most devices should support
      }

      return universalEffects;
    }

    return commonEffects;
  }

  private getColorTempRange(entityId: string, hass: HomeAssistant): { min: number; max: number } {
    const entity = hass.states[entityId];
    return {
      min: entity?.attributes.min_mireds || 153, // ~6500K
      max: entity?.attributes.max_mireds || 500, // ~2000K
    };
  }

  private async callLightService(
    action: string,
    entityId: string,
    serviceData: any,
    hass: HomeAssistant
  ): Promise<void> {
    try {
      await hass.callService('light', action, {
        entity_id: entityId,
        ...serviceData,
      });
    } catch (error) {
      console.error(`Failed to call light.${action} for ${entityId}:`, error);
      console.error('Service data was:', serviceData);

      // Show toast notification for errors
      const event = new CustomEvent('hass-notification', {
        detail: { message: `Failed to control light ${entityId}: ${error}` },
      });
      document.dispatchEvent(event);
    }
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lightModule = module as LightModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Layout Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Layout Configuration
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            Configure how preset buttons are arranged and displayed
          </div>

          <!-- Layout Style -->
          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Layout Style</div>
            <div class="field-description">Choose the overall arrangement style for preset buttons</div>
            ${this.renderUcForm(
              hass,
              { layout: lightModule.layout || 'buttons' },
              [
                this.selectField('layout', [
                  { value: 'buttons', label: 'Flexible Buttons' },
                  { value: 'grid', label: 'Grid Layout' },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.layout;
                if (next === lightModule.layout) return;
                updateModule({ layout: next });
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
              false
            )}
          </div>

            <!-- Button Alignment -->
            <div class="field-container" style="margin-bottom: 16px;">
              <div class="field-title">Button Alignment</div>
              <div class="field-description">Choose how buttons are aligned within the container</div>
              ${this.renderUcForm(
                hass,
                { button_alignment: lightModule.button_alignment || 'center' },
                [
                  this.selectField('button_alignment', [
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                    { value: 'space-between', label: 'Space Between' },
                    { value: 'space-around', label: 'Space Around' },
                    { value: 'space-evenly', label: 'Space Evenly' },
                  ]),
                ],
                (e: CustomEvent) => {
                  const next = e.detail.value.button_alignment;
                  if (next === lightModule.button_alignment) return;
                  updateModule({ button_alignment: next });
                  // Trigger re-render to update dropdown UI
                  setTimeout(() => {
                    this.triggerPreviewUpdate();
                  }, 50);
                },
                false
              )}
            </div>
          </div>
        </div>

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
                Allow Button Wrapping
              </div>
              <div
                class="field-description"
                style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
              >
                Allow buttons to wrap to the next line when they exceed the container width
              </div>
            </div>
            <div style="margin-left: 16px;">
              <ha-switch
                .checked=${lightModule.allow_wrapping || false}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ allow_wrapping: target.checked });
                }}
              ></ha-switch>
            </div>
          </div>
        </div>

        <!-- Gap Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Gap Configuration
          </div>

          <div style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              Gap Between Buttons
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              Set the spacing between preset buttons (in rem units)
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="0"
                max="5"
                step="0.1"
                .value="${lightModule.button_gap || 0.8}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseFloat(target.value);
                  updateModule({ button_gap: value });
                }}
              />
              <input
                type="number"
                class="gap-input"
                style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                min="0"
                max="5"
                step="0.1"
                .value="${lightModule.button_gap || 0.8}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseFloat(target.value);
                  if (!isNaN(value)) {
                    updateModule({ button_gap: value });
                  }
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const currentValue = parseFloat(target.value) || 0.8;
                    const increment = e.key === 'ArrowUp' ? 0.1 : -0.1;
                    const newValue = Math.max(0, Math.min(5, currentValue + increment));
                    const roundedValue = Math.round(newValue * 10) / 10;
                    updateModule({ button_gap: roundedValue });
                  }
                }}
              />
              <button
                class="reset-btn"
                @click=${() => updateModule({ button_gap: 0.8 })}
                title="Reset to default (0.8)"
                style="width: 36px; height: 36px; padding: 0; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>
        ${
          lightModule.layout === 'grid'
            ? html`
                <div
                  class="settings-section"
                  style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
                >
                  <div
                    class="section-title"
                    style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                  >
                    Grid Settings
                  </div>
                  <div
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                  >
                    Configure grid layout options
                  </div>

                  <div style="margin-bottom: 20px;">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                    >
                      Columns
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px; opacity: 0.8; line-height: 1.4;"
                    >
                      Number of columns in grid layout
                    </div>
                    <div class="field-container" style="margin-bottom: 16px;">
                      <div class="field-title">Columns</div>
                      <div class="field-description">Number of columns in grid layout</div>
                      ${this.renderUcForm(
                        hass,
                        { columns: lightModule.columns || 3 },
                        [
                          this.selectField('columns', [
                            { value: '1', label: '1 Column' },
                            { value: '2', label: '2 Columns' },
                            { value: '3', label: '3 Columns' },
                            { value: '4', label: '4 Columns' },
                            { value: '5', label: '5 Columns' },
                            { value: '6', label: '6 Columns' },
                          ]),
                        ],
                        (e: CustomEvent) => {
                          const next = Number(e.detail.value.columns);
                          if (isNaN(next) || next === lightModule.columns) return;
                          updateModule({ columns: next });
                          // Trigger re-render to update dropdown UI
                          setTimeout(() => {
                            this.triggerPreviewUpdate();
                          }, 50);
                        },
                        false
                      )}
                    </div>
                  </div>
                </div>
              `
            : ''
        }

        <!-- Global Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Global Settings
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            Settings that apply to all presets
          </div>

          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Default Transition Time</div>
            <div class="field-description">Default transition time for all presets (can be overridden per preset)</div>
            ${this.renderUcForm(
              hass,
              { default_transition_time: lightModule.default_transition_time ?? 0.5 },
              [this.numberField('default_transition_time', 0, 10, 0.1)],
              (e: CustomEvent) => {
                const next = Number(e.detail.value.default_transition_time);
                if (isNaN(next) || next === lightModule.default_transition_time) return;
                updateModule({ default_transition_time: next });
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
              false
            )}
          </div>
          </div>
        </div>

        <!-- Preset Configuration -->
        <div class="presets-configuration">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Light Presets
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            Configure light presets with specific colors, brightness, and effects. Each preset can
            control different entities.
          </div>

          ${(lightModule.presets || []).map((preset, index) =>
            this.renderPresetEditor(preset, index, lightModule, hass, updateModule)
          )}

          <button
            class="add-preset-btn"
            @click=${() => this.addPreset(lightModule, updateModule)}
            style="width: 100%; padding: 12px; border: 2px dashed var(--primary-color); background: transparent; color: var(--primary-color); border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-top: 16px;"
          >
            + Add New Preset
          </button>
        </div>
      </div>
    `;
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lightModule = module as LightModule;

    return html`
      <div class="other-tab">
        <!-- Import/Export Presets -->
        ${this.renderSettingsSection('Import/Export', 'Save and share your preset configurations', [
          {
            title: 'Export Presets',
            description: 'Export all presets as JSON for backup or sharing',
            hass,
            data: { export_ready: (lightModule.presets || []).length > 0 },
            schema: [
              {
                name: 'export_ready',
                label: 'Export Configuration',
                selector: {
                  action: {
                    text: 'Export JSON',
                  },
                },
              },
            ],
            onChange: () => this.exportPresets(lightModule),
          },
          {
            title: 'Import Presets',
            description: 'Import presets from JSON configuration',
            hass,
            data: { import_data: '' },
            schema: [
              {
                name: 'import_data',
                label: 'Paste JSON Configuration',
                selector: {
                  text: {
                    multiline: true,
                    placeholder: 'Paste exported JSON here...',
                  },
                },
              },
            ],
            onChange: (e: CustomEvent) =>
              this.importPresets(e.detail.value.import_data, lightModule, updateModule),
          },
        ])}

        <!-- Advanced Options -->
        ${this.renderSettingsSection('Advanced Options', 'Fine-tune module behavior', [
          {
            title: 'Confirm Actions',
            description: 'Show confirmation dialog before applying presets',
            hass,
            data: { confirm_actions: lightModule.confirm_actions ?? false },
            schema: [this.booleanField('confirm_actions')],
            onChange: (e: CustomEvent) =>
              updateModule({ confirm_actions: e.detail.value.confirm_actions }),
          },
          {
            title: 'Show Status Feedback',
            description: 'Show visual feedback when presets are applied',
            hass,
            data: { show_feedback: lightModule.show_feedback ?? true },
            schema: [this.booleanField('show_feedback')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_feedback: e.detail.value.show_feedback }),
          },
        ])}
      </div>
    `;
  }

  // Track expanded presets (similar to dropdown module)
  private expandedPresets: Set<string> = new Set();
  private draggedPresetIndex: number | null = null;

  // Preset editor for individual presets (mimicking dropdown module structure)
  private renderPresetEditor(
    preset: LightPreset,
    index: number,
    lightModule: LightModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const updatePreset = (updates: Partial<LightPreset>) => {
      const newPresets = [...(lightModule.presets || [])];
      newPresets[index] = { ...preset, ...updates };
      updateModule({ presets: newPresets });
    };

    const deletePreset = () => {
      const newPresets = [...(lightModule.presets || [])];
      newPresets.splice(index, 1);
      updateModule({ presets: newPresets });
    };

    const duplicatePreset = () => {
      const newPreset = {
        ...preset,
        id: this.generateId('preset'),
        name: `${preset.name} Copy`,
      };
      const newPresets = [...(lightModule.presets || []), newPreset];
      updateModule({ presets: newPresets });
    };

    const movePreset = (fromIndex: number, toIndex: number) => {
      const newPresets = [...(lightModule.presets || [])];
      const [movedPreset] = newPresets.splice(fromIndex, 1);
      newPresets.splice(toIndex, 0, movedPreset);
      updateModule({ presets: newPresets });
    };

    return html`
      <div
        class="preset-item"
        style="margin-bottom: 24px; background: var(--secondary-background-color); border-radius: 8px; border: 1px solid var(--divider-color); overflow: hidden;"
        data-preset-id="${preset.id}"
        data-preset-index="${index}"
        @dragover=${(e: DragEvent) => this.handlePresetDragOver(e)}
        @dragenter=${(e: DragEvent) => this.handlePresetDragEnter(e)}
        @dragleave=${(e: DragEvent) => this.handlePresetDragLeave(e)}
        @drop=${(e: DragEvent) => this.handlePresetDrop(e, index, movePreset)}
      >
        <div
          class="preset-header"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(var(--rgb-primary-color), 0.05); border-bottom: 1px solid var(--divider-color); cursor: pointer;"
          @click=${(e: Event) => this.togglePresetHeader(e)}
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <div
              class="drag-handle"
              style="padding: 8px; margin: -8px; cursor: grab; border-radius: 4px; transition: background-color 0.2s ease;"
              draggable="true"
              @dragstart=${(e: DragEvent) => this.handlePresetDragStart(e, index)}
              @dragend=${(e: DragEvent) => this.handlePresetDragEnd(e)}
              @click=${(e: Event) => e.stopPropagation()}
              @mousedown=${(e: Event) => e.stopPropagation()}
              .title=${'Drag to reorder'}
              @mouseenter=${(e: Event) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
              }}
              @mouseleave=${(e: Event) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = 'transparent';
              }}
            >
              <ha-icon
                icon="mdi:drag"
                style="color: var(--secondary-text-color); pointer-events: none;"
              ></ha-icon>
            </div>
            <div style="font-weight: 600; color: var(--primary-text-color);">
              ${preset.name || `Preset ${index + 1}`}
            </div>
            ${preset.icon
              ? html`<ha-icon icon="${preset.icon}" style="color: var(--primary-color);"></ha-icon>`
              : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <ha-icon-button
              @click=${(e: Event) => {
                e.stopPropagation();
                duplicatePreset();
              }}
              .title=${'Duplicate preset'}
            >
              <ha-icon icon="mdi:content-duplicate"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${(e: Event) => {
                e.stopPropagation();
                deletePreset();
              }}
              .title=${'Delete preset'}
              .disabled=${(lightModule.presets || []).length <= 1}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
            <ha-icon
              class="expand-caret"
              icon="mdi:chevron-down"
              style="color: var(--secondary-text-color); transition: transform 0.2s ease; transform: ${this.expandedPresets.has(
                preset.id
              )
                ? 'rotate(180deg)'
                : 'rotate(0deg)'}; cursor: pointer; padding: 8px; margin: -8px;"
              @click=${(e: Event) => {
                e.stopPropagation();

                // Find elements directly from the event
                const caret = e.target as HTMLElement;
                const card = caret.closest('.preset-item') as HTMLElement;
                const content = card?.querySelector('.preset-content') as HTMLElement;

                if (card && content && caret) {
                  const id = card.getAttribute('data-preset-id') || '';

                  // Toggle state
                  if (this.expandedPresets.has(id)) {
                    this.expandedPresets.delete(id);
                    content.style.display = 'none';
                    caret.style.transform = 'rotate(0deg)';
                  } else {
                    this.expandedPresets.add(id);
                    content.style.display = 'block';
                    caret.style.transform = 'rotate(180deg)';
                  }
                }
              }}
            ></ha-icon>
          </div>
        </div>

        <div
          class="preset-content"
          style="padding: 16px; display: ${this.expandedPresets.has(preset.id) ? 'block' : 'none'};"
        >
          ${this.renderPresetConfiguration(preset, hass, updatePreset, lightModule)}
        </div>
      </div>
    `;
  }

  // Preset configuration content (the rich light controls)
  private renderPresetConfiguration(
    preset: LightPreset,
    hass: HomeAssistant,
    updatePreset: (updates: Partial<LightPreset>) => void,
    lightModule: LightModule
  ): TemplateResult {
    return html`
      <!-- Basic Settings -->
      <div class="field-group" style="margin-bottom: 16px;">
        ${this.renderFieldSection(
          'Basic Settings',
          'Configure preset name and icon',
          hass,
          {
            name: preset.name || '',
            icon: preset.icon || '',
          },
          [this.textField('name'), this.iconField('icon')],
          (e: CustomEvent) => updatePreset(e.detail.value)
        )}
      </div>

      <!-- Entity Selection -->
      <div class="field-group" style="margin-bottom: 16px;">
        ${this.renderFieldSection(
          'Target Entities',
          'Select which lights this preset will control',
          hass,
          { entities: preset.entities || [] },
          [
            {
              name: 'entities',
              selector: {
                entity: {
                  domain: ['light', 'group'],
                  multiple: true,
                },
              },
            },
          ],
          (e: CustomEvent) => updatePreset({ entities: e.detail.value.entities })
        )}

        <!-- Light Controls: Color, White, Effects & Test -->
        <div class="light-controls-section" style="margin-top: 20px; margin-bottom: 20px;">
          <div
            style="font-weight: 600; margin-bottom: 16px; color: var(--primary-text-color); font-size: 16px;"
          >
            Light Controls
          </div>

          <uc-light-color-picker
            .hass=${hass}
            .rgb_color=${preset.rgb_color}
            .hs_color=${preset.hs_color}
            .xy_color=${preset.xy_color}
            .color_temp=${preset.color_temp}
            .effect=${preset.effect}
            .effect_speed=${preset.effect_speed}
            .effect_intensity=${preset.effect_intensity}
            .effect_reverse=${preset.effect_reverse}
            .effect_list=${this.getCommonSupportedEffects(preset.entities || [], hass)}
            .mode=${this.getPresetLightMode(preset) === 'effect'
              ? 'effect'
              : this.getPresetColorMode(preset)}
            .min_mireds=${153}
            .max_mireds=${500}
            @color-changed=${(e: CustomEvent) => {
              const detail = e.detail;
              const updates: Partial<LightPreset> = {};

              if (detail.mode === 'effect') {
                updates.effect = detail.effect || '';
                // Clear ALL color parameters when effect is set
                updates.color_temp = undefined;
                updates.rgb_color = undefined;
                updates.hs_color = undefined;
                updates.xy_color = undefined;
                updates.rgbw_color = undefined;
                updates.rgbww_color = undefined;
                updates.white = undefined;
              } else if (detail.mode === 'color_temp') {
                updates.color_temp = detail.color_temp;
                updates.rgb_color = undefined;
                updates.hs_color = undefined;
                updates.xy_color = undefined;
                updates.rgbw_color = undefined;
                updates.rgbww_color = undefined;
                updates.white = undefined;
                updates.effect = ''; // Clear effect when setting color
              } else {
                updates.rgb_color = detail.rgb_color;
                updates.hs_color = detail.hs_color;
                updates.xy_color = detail.xy_color;
                updates.color_temp = undefined;
                updates.rgbw_color = undefined;
                updates.rgbww_color = undefined;
                updates.white = undefined;
                updates.effect = ''; // Clear effect when setting color
              }

              updatePreset(updates);
              // Trigger immediate preview update
              this.triggerPreviewUpdate();
            }}
            @test-preset=${() => {
              this.applyPreset(preset, lightModule, hass);
            }}
          ></uc-light-color-picker>
        </div>

        <!-- Button Style (moved here from global settings) -->
        <div
          style="margin-top: 16px; background: rgba(var(--rgb-accent-color), 0.05); border-radius: 6px; padding: 12px;"
        >
          <div style="font-weight: 500; margin-bottom: 12px; color: var(--primary-text-color);">
            Button Appearance
          </div>

          ${this.renderFieldSection(
            'Button Style',
            'Visual style for this preset button',
            hass,
            { button_style: preset.button_style || 'filled' },
            [
              this.selectField('button_style', [
                { value: 'filled', label: 'Filled (solid background)' },
                { value: 'outlined', label: 'Outlined (border only)' },
                { value: 'text', label: 'Text (minimal style)' },
              ]),
            ],
            (e: CustomEvent) => updatePreset({ button_style: e.detail.value.button_style })
          )}

          <!-- Border Radius (for filled and outlined styles) -->
          ${(preset.button_style || 'filled') !== 'text'
            ? html`
                <div style="margin-top: 12px;">
                  ${this.renderFieldSection(
                    'Border Radius',
                    'Adjust button roundness (0 = square, 50 = circle)',
                    hass,
                    { border_radius: preset.border_radius || 8 },
                    [this.numberField('border_radius', 0, 50, 1)],
                    (e: CustomEvent) =>
                      updatePreset({ border_radius: e.detail.value.border_radius })
                  )}
                </div>
              `
            : ''}

          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;"
          >
            <div>
              <div style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);">
                Show Label
              </div>
              <div style="font-size: 12px; color: var(--secondary-text-color);">
                Display preset name on this button
              </div>
            </div>
            <ha-switch
              .checked=${preset.show_label ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updatePreset({ show_label: target.checked });
              }}
            ></ha-switch>
          </div>
        </div>
      </div>

      <!-- Light Controls Section -->
      <div class="light-controls-section" style="margin-top: 20px;">
        <div
          style="font-weight: 600; margin-bottom: 16px; color: var(--primary-text-color); font-size: 16px;"
        >
          Light Controls
        </div>

        <!-- Brightness Control -->
        <div class="brightness-control" style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <ha-icon icon="mdi:brightness-6" style="color: var(--primary-color);"></ha-icon>
            <span style="font-weight: 500; color: var(--primary-text-color);">Brightness</span>
            <span style="margin-left: auto; font-size: 14px; color: var(--secondary-text-color);">
              ${preset.brightness ? Math.round((preset.brightness / 255) * 100) : 100}%
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 12px; color: var(--secondary-text-color);">0%</span>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              .value=${preset.brightness ? Math.round((preset.brightness / 255) * 100) : 100}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const brightness = Math.round((parseInt(target.value) / 100) * 255);
                updatePreset({ brightness });
                this.triggerPreviewUpdate();
              }}
              class="brightness-slider"
            />
            <span style="font-size: 12px; color: var(--secondary-text-color);">100%</span>
          </div>
        </div>

        <!-- Visual Customization -->
        <div
          class="visual-customization"
          style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
        >
          <div
            style="font-weight: 600; margin-bottom: 16px; color: var(--primary-text-color); font-size: 16px;"
          >
            Visual Customization
          </div>

          <!-- Smart Color Toggles -->
          <div
            class="smart-color-toggles"
            style="margin-bottom: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 6px; padding: 12px;"
          >
            <div style="font-weight: 500; margin-bottom: 12px; color: var(--primary-text-color);">
              Smart Color Options
            </div>

            <!-- Smart Contrast Mode (Top Priority) -->
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
            >
              <div>
                <div style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);">
                  Smart Contrast Mode
                </div>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Auto-contrast text & icon (white/black) based on button background
                </div>
              </div>
              <ha-switch
                .checked=${preset.smart_color ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updatePreset({ smart_color: target.checked });
                }}
              ></ha-switch>
            </div>

            <!-- Use Light Color for Icon (disabled if smart contrast is on) -->
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; ${preset.smart_color
                ? 'opacity: 0.5;'
                : ''}"
            >
              <div>
                <div style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);">
                  Use Light Color for Icon
                </div>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Icon color matches the preset's light color
                </div>
              </div>
              <ha-switch
                .checked=${preset.use_light_color_for_icon || false}
                .disabled=${preset.smart_color ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updatePreset({ use_light_color_for_icon: target.checked });
                }}
              ></ha-switch>
            </div>

            <!-- Use Light Color for Button (disabled if smart contrast is on) -->
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; ${preset.smart_color
                ? 'opacity: 0.5;'
                : ''}"
            >
              <div>
                <div style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);">
                  Use Light Color for Button
                </div>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Button background matches the preset's light color
                </div>
              </div>
              <ha-switch
                .checked=${preset.use_light_color_for_button || false}
                .disabled=${preset.smart_color ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updatePreset({ use_light_color_for_button: target.checked });
                }}
              ></ha-switch>
            </div>

            <!-- Use Icon Color for Text (disabled if smart contrast is on) -->
            <div
              style="display: flex; align-items: center; justify-content: space-between; ${preset.smart_color
                ? 'opacity: 0.5;'
                : ''}"
            >
              <div>
                <div style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);">
                  Use Icon Color for Text
                </div>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Text color matches the icon color
                </div>
              </div>
              <ha-switch
                .checked=${preset.use_icon_color_for_text || false}
                .disabled=${preset.smart_color ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updatePreset({ use_icon_color_for_text: target.checked });
                }}
              ></ha-switch>
            </div>
          </div>

          <!-- Per-Preset Styling -->
          <div
            style="margin-bottom: 16px; background: rgba(var(--rgb-accent-color), 0.05); border-radius: 6px; padding: 12px;"
          >
            <div style="font-weight: 500; margin-bottom: 12px; color: var(--primary-text-color);">
              Button Style
            </div>

            ${this.renderFieldSection(
              'Button Style',
              'Visual style for this preset button',
              hass,
              { button_style: preset.button_style || 'filled' },
              [
                this.selectField('button_style', [
                  { value: 'filled', label: 'Filled (solid background)' },
                  { value: 'outlined', label: 'Outlined (border only)' },
                  { value: 'text', label: 'Text (minimal style)' },
                ]),
              ],
              (e: CustomEvent) => updatePreset({ button_style: e.detail.value.button_style })
            )}

            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;"
            >
              <div>
                <div style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);">
                  Show Label
                </div>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Display preset name on this button
                </div>
              </div>
              <ha-switch
                .checked=${preset.show_label ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updatePreset({ show_label: target.checked });
                }}
              ></ha-switch>
            </div>
          </div>

          <!-- Custom Colors (only show when smart contrast is disabled) -->
          ${!preset.smart_color
            ? html`
                <div
                  class="custom-colors"
                  style="display: flex; flex-direction: column; gap: 16px;"
                >
                  <!-- Text Color -->
                  ${!preset.use_icon_color_for_text
                    ? html`
                        <div class="color-field">
                          <div
                            style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--primary-text-color);"
                          >
                            Text Color
                          </div>
                          <ultra-color-picker
                            .hass=${hass}
                            .value=${preset.text_color || 'var(--primary-text-color)'}
                            @value-changed=${(e: CustomEvent) =>
                              updatePreset({ text_color: e.detail.value })}
                          ></ultra-color-picker>
                        </div>
                      `
                    : html`
                        <div class="color-field disabled">
                          <div
                            style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--secondary-text-color);"
                          >
                            Text Color
                          </div>
                          <div
                            style="padding: 20px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: var(--secondary-background-color); border-radius: 4px;"
                          >
                            Using icon color
                          </div>
                        </div>
                      `}

                  <!-- Icon Color -->
                  ${!preset.use_light_color_for_icon
                    ? html`
                        <div class="color-field">
                          <div
                            style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--primary-text-color);"
                          >
                            Icon Color
                          </div>
                          <ultra-color-picker
                            .hass=${hass}
                            .value=${preset.icon_color || 'var(--primary-color)'}
                            @value-changed=${(e: CustomEvent) =>
                              updatePreset({ icon_color: e.detail.value })}
                          ></ultra-color-picker>
                        </div>
                      `
                    : html`
                        <div class="color-field disabled">
                          <div
                            style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--secondary-text-color);"
                          >
                            Icon Color
                          </div>
                          <div
                            style="padding: 20px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: var(--secondary-background-color); border-radius: 4px;"
                          >
                            Using light color
                          </div>
                        </div>
                      `}

                  <!-- Button Color -->
                  ${!preset.use_light_color_for_button
                    ? html`
                        <div class="color-field">
                          <div
                            style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--primary-text-color);"
                          >
                            Button Color
                          </div>
                          <ultra-color-picker
                            .hass=${hass}
                            .value=${preset.button_color || 'var(--primary-color)'}
                            @value-changed=${(e: CustomEvent) =>
                              updatePreset({ button_color: e.detail.value })}
                          ></ultra-color-picker>
                        </div>
                      `
                    : html`
                        <div class="color-field disabled">
                          <div
                            style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--secondary-text-color);"
                          >
                            Button Color
                          </div>
                          <div
                            style="padding: 20px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: var(--secondary-background-color); border-radius: 4px;"
                          >
                            Using light color
                          </div>
                        </div>
                      `}
                </div>
              `
            : html`
                <div
                  style="text-align: center; padding: 24px; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 6px;"
                >
                  Smart Contrast Mode is enabled - colors are automatically optimized
                </div>
              `}
        </div>

        <!-- Advanced Settings -->
        <div
          class="advanced-settings"
          style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
        >
          <div style="font-weight: 500; margin-bottom: 12px; color: var(--primary-text-color);">
            Advanced Settings
          </div>
          ${this.renderFieldSection(
            'Transition Time (seconds)',
            'Override default transition time for this preset',
            hass,
            {
              transition_time: preset.transition_time || lightModule.default_transition_time || 0.5,
            },
            [this.numberField('transition_time', 0, 10, 0.1)],
            (e: CustomEvent) => updatePreset({ transition_time: e.detail.value.transition_time })
          )}
        </div>

        <!-- Test Preset -->
        <div
          style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
        >
          <button
            @click=${() => this.applyPreset(preset, lightModule, hass)}
            style="width: 100%; padding: 12px; background: var(--primary-color); color: var(--text-primary-color); border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;"
            .disabled=${!preset.entities || preset.entities.length === 0}
          >
            <ha-icon icon="mdi:play" style="margin-right: 8px;"></ha-icon>
            Test Preset
          </button>
        </div>
      </div>
    `;
  }

  // Preset drag and drop handlers (copied from dropdown module)
  private handlePresetDragStart(e: DragEvent, index: number): void {
    this.draggedPresetIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
    const dragHandle = e.target as HTMLElement;
    const presetItem = dragHandle.closest('.preset-item') as HTMLElement;
    if (presetItem) {
      presetItem.classList.add('dragging');
    }
  }

  private handlePresetDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private handlePresetDragEnter(e: DragEvent): void {
    e.preventDefault();
    const presetItem = e.currentTarget as HTMLElement;
    if (presetItem && !presetItem.classList.contains('dragging')) {
      presetItem.style.borderTop = '3px solid var(--primary-color)';
      presetItem.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
    }
  }

  private handlePresetDragLeave(e: DragEvent): void {
    const presetItem = e.currentTarget as HTMLElement;
    if (presetItem) {
      presetItem.style.borderTop = '';
      presetItem.style.backgroundColor = '';
    }
  }

  private handlePresetDrop(
    e: DragEvent,
    dropIndex: number,
    movePreset: (from: number, to: number) => void
  ): void {
    e.preventDefault();
    const presetItem = e.currentTarget as HTMLElement;
    presetItem.style.borderTop = '';
    presetItem.style.backgroundColor = '';

    if (this.draggedPresetIndex !== null && this.draggedPresetIndex !== dropIndex) {
      movePreset(this.draggedPresetIndex, dropIndex);
    }

    document.querySelectorAll('.preset-item').forEach(item => {
      (item as HTMLElement).style.borderTop = '';
      (item as HTMLElement).style.backgroundColor = '';
      (item as HTMLElement).classList.remove('dragging');
    });

    this.draggedPresetIndex = null;
  }

  private handlePresetDragEnd(e: DragEvent): void {
    const target = (e.target as HTMLElement)?.closest('.preset-item') as HTMLElement;
    if (target) {
      target.classList.remove('dragging');
    }
    document.querySelectorAll('.preset-item').forEach(item => {
      (item as HTMLElement).style.borderTop = '';
    });
    this.draggedPresetIndex = null;
  }

  private togglePresetHeader(e: Event): void {
    const header = e.currentTarget as HTMLElement;
    const card = header.closest('.preset-item') as HTMLElement;
    if (!card) return;

    const id = card.getAttribute('data-preset-id') || '';
    if (!id) return;

    const content = card.querySelector('.preset-content') as HTMLElement;
    const caret = card.querySelector('.expand-caret') as HTMLElement;

    if (this.expandedPresets.has(id)) {
      this.expandedPresets.delete(id);
    } else {
      this.expandedPresets.add(id);
    }

    if (content && caret) {
      const isExpanded = this.expandedPresets.has(id);
      if (isExpanded) {
        content.style.display = 'block';
        caret.style.transform = 'rotate(180deg)';
      } else {
        content.style.display = 'none';
        caret.style.transform = 'rotate(0deg)';
      }
    }
  }

  private togglePresetExpanded(presetId: string): void {
    const presetElement = document.querySelector(`[data-preset-id="${presetId}"]`);
    if (presetElement) {
      const content = presetElement.querySelector('.preset-content') as HTMLElement;
      const caret = presetElement.querySelector('.expand-caret') as HTMLElement;

      if (content && caret) {
        if (this.expandedPresets.has(presetId)) {
          this.expandedPresets.delete(presetId);
          content.style.display = 'none';
          caret.style.transform = 'rotate(0deg)';
        } else {
          this.expandedPresets.add(presetId);
          content.style.display = 'block';
          caret.style.transform = 'rotate(180deg)';
        }
      }
    }
  }

  // Helper methods for preset management
  private addPreset(
    lightModule: LightModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const newPresetId = this.generateId('preset');
    const newPreset: LightPreset = {
      id: newPresetId,
      name: `Preset ${(lightModule.presets || []).length + 1}`,
      entities: [],
      brightness: 255,
      hs_color: [0, 0], // Default to white in HS mode
      // Visual defaults
      text_color: 'var(--text-primary-color)',
      icon_color: 'var(--primary-color)',
      button_color: 'var(--primary-color)',
      use_light_color_for_icon: false,
      use_light_color_for_button: true, // Default to using light color for button
      use_icon_color_for_text: false,
      smart_color: true, // Enable smart contrast by default
      button_style: 'filled',
      show_label: true,
      border_radius: 8,
    };

    // Add to expanded presets so new presets start expanded
    this.expandedPresets.add(newPresetId);
    const newPresets = [...(lightModule.presets || []), newPreset];
    updateModule({ presets: newPresets });
  }

  private getPresetColorMode(preset: LightPreset): 'rgb' | 'hs' | 'xy' | 'color_temp' {
    if (preset.color_temp) return 'color_temp';
    if (preset.hs_color) return 'hs';
    if (preset.xy_color) return 'xy';
    if (preset.rgb_color) return 'rgb';
    return 'hs'; // Default to HS mode
  }

  private getPresetLightMode(preset: LightPreset): 'color' | 'white' | 'effect' {
    if (preset.effect && preset.effect.trim() !== '') return 'effect';
    if (preset.color_temp) return 'white';
    if (preset.rgb_color || preset.hs_color || preset.xy_color) return 'color';
    return 'color'; // Default to color mode
  }

  // Trigger preview update for immediate visual feedback
  private triggerPreviewUpdate(): void {
    // Dispatch custom event to update any live previews
    const event = new CustomEvent('ultra-card-template-update', {
      bubbles: true,
      composed: true,
    });
    window.dispatchEvent(event);
  }

  private exportPresets(lightModule: LightModule): void {
    const data = {
      presets: lightModule.presets || [],
      exported_at: new Date().toISOString(),
      version: '1.0',
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ultra-card-light-presets.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  private importPresets(
    jsonData: string,
    lightModule: LightModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    try {
      if (!jsonData.trim()) return;

      const data = JSON.parse(jsonData);
      if (data.presets && Array.isArray(data.presets)) {
        // Regenerate IDs to avoid conflicts
        const importedPresets = data.presets.map((preset: any) => ({
          ...preset,
          id: this.generateId('preset'),
        }));

        const newPresets = [...(lightModule.presets || []), ...importedPresets];
        updateModule({ presets: newPresets });

        // Show success message
        const event = new CustomEvent('hass-notification', {
          detail: { message: `Successfully imported ${importedPresets.length} presets` },
        });
        document.dispatchEvent(event);
      }
    } catch (error) {
      // Show error message
      const event = new CustomEvent('hass-notification', {
        detail: { message: 'Failed to import presets: Invalid JSON format' },
      });
      document.dispatchEvent(event);
    }
  }

  private async applyPreset(
    preset: LightPreset,
    lightModule: LightModule,
    hass: HomeAssistant
  ): Promise<void> {
    const entities = preset.entities || [];

    if (entities.length === 0) {
      const event = new CustomEvent('hass-notification', {
        detail: { message: 'No entities configured for this preset' },
      });
      document.dispatchEvent(event);
      return;
    }

    for (const entityId of entities) {
      const serviceData: any = {};

      // Check if this is a WLED device early for special handling
      const entity = hass.states[entityId];
      const isWLED =
        entity?.attributes.integration === 'wled' ||
        entity?.attributes.device_class === 'wled' ||
        (entity?.attributes.effect_list && entity.attributes.effect_list.length > 50) ||
        (entity?.entity_id && entity.entity_id.toLowerCase().includes('wled')) ||
        (entity?.attributes.friendly_name &&
          entity.attributes.friendly_name.toLowerCase().includes('wled')) ||
        (entity?.attributes.friendly_name &&
          entity.attributes.friendly_name.toLowerCase().includes('glorb'));

      // Add transition time if specified (but not for WLED effects)
      const transitionTime = preset.transition_time || lightModule.default_transition_time;
      if (
        transitionTime &&
        transitionTime > 0 &&
        !(isWLED && preset.effect && preset.effect.trim() !== '')
      ) {
        serviceData.transition = transitionTime;
      }

      // Add brightness
      if (preset.brightness !== undefined) {
        serviceData.brightness = preset.brightness;
      }

      // Add color - only ONE color mode at a time to avoid conflicts
      if (preset.effect && preset.effect.trim() !== '') {
        // Check if this entity supports the selected effect
        const entityEffectList = this.getEffectList(entityId, hass);
        const effectSupported = entityEffectList.includes(preset.effect);

        if (effectSupported) {
          // Effect mode - ONLY effect, no color parameters
          serviceData.effect = preset.effect;

          // Ensure no color parameters interfere with effects
          delete serviceData.rgb_color;
          delete serviceData.hs_color;
          delete serviceData.xy_color;
          delete serviceData.color_temp;
          delete serviceData.rgbw_color;
          delete serviceData.rgbww_color;
          delete serviceData.white;

          if (isWLED) {
            // Remove transition for WLED effects
            delete serviceData.transition;

            // Add WLED-specific effect parameters (only those supported by HA)
            // Note: effect_speed, effect_intensity, effect_reverse are not supported by HA's light service
            // These parameters would need to be sent via WLED's native API, not through HA
          }
        } else {
          // Try to find a similar effect on this device
          const entityEffectList = this.getEffectList(entityId, hass);
          const fallbackEffect = this.findSimilarEffect(preset.effect, entityEffectList);

          if (fallbackEffect) {
            serviceData.effect = fallbackEffect;
            // Clear all color parameters when effect is set
            delete serviceData.rgb_color;
            delete serviceData.hs_color;
            delete serviceData.xy_color;
            delete serviceData.color_temp;
            delete serviceData.rgbw_color;
            delete serviceData.rgbww_color;
            delete serviceData.white;
          } else {
            // Skip effect for this device, but continue with other settings like brightness
          }
        }
      } else if (preset.color_temp !== undefined) {
        // Color temperature mode
        serviceData.color_temp = preset.color_temp;
      } else if (isWLED && preset.rgb_color !== undefined) {
        // For WLED devices, prioritize RGB color mode and clear effects
        serviceData.rgb_color = preset.rgb_color;
        serviceData.effect = 'Solid'; // Explicitly set to Solid effect to clear any active effects
      } else if (preset.hs_color !== undefined) {
        // HS color mode (preferred for Home Assistant)
        serviceData.hs_color = preset.hs_color;
        if (isWLED) {
          serviceData.effect = 'Solid'; // Clear effects for WLED devices
        }
      } else if (preset.xy_color !== undefined) {
        // XY color mode
        serviceData.xy_color = preset.xy_color;
        if (isWLED) {
          serviceData.effect = 'Solid'; // Clear effects for WLED devices
        }
      } else if (preset.rgb_color !== undefined) {
        // RGB color mode - fallback for non-WLED devices
        serviceData.rgb_color = preset.rgb_color;
        if (isWLED) {
          serviceData.effect = 'Solid'; // Clear effects for WLED devices
        }
      } else if (preset.rgbw_color !== undefined) {
        // RGBW color mode
        serviceData.rgbw_color = preset.rgbw_color;
      } else if (preset.rgbww_color !== undefined) {
        // RGBWW color mode
        serviceData.rgbww_color = preset.rgbww_color;
      } else if (preset.white !== undefined) {
        // White value mode
        serviceData.white = preset.white;
      }

      await this.callLightService('turn_on', entityId, serviceData, hass);
    }

    // Show feedback if enabled
    if (lightModule.show_feedback !== false) {
      const event = new CustomEvent('hass-notification', {
        detail: {
          message: `Applied preset "${preset.name}" to ${entities.length} ${entities.length === 1 ? 'entity' : 'entities'}`,
        },
      });
      document.dispatchEvent(event);
    }
  }

  private deletePreset(
    index: number,
    lightModule: LightModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const presets = [...(lightModule.presets || [])];
    presets.splice(index, 1);
    updateModule({ presets });
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const lightModule = module as LightModule;
    const presets = lightModule.presets || [];

    // Apply design properties with fallbacks (same as other modules)
    const moduleWithDesign = lightModule as any;

    // Container styles for positioning and effects
    const containerStyles = {
      padding: this.getPaddingCSS(moduleWithDesign),
      margin: this.getMarginCSS(moduleWithDesign),
      background: this.getBackgroundCSS(moduleWithDesign),
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      border: this.getBorderCSS(moduleWithDesign),
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '8px',
      boxSizing: 'border-box',
      width: '100%',
    };

    if (presets.length === 0) {
      return html`
        <div class="light-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div class="no-presets-preview">
            <ha-icon icon="mdi:lightbulb-group"></ha-icon>
            <div>No presets configured</div>
            <div class="config-hint">Add presets in the General tab</div>
          </div>
        </div>
      `;
    }

    const layout = lightModule.layout || 'buttons';
    const showLabels = lightModule.show_labels ?? true;
    const buttonStyle = lightModule.button_style || 'filled';
    const columns = lightModule.columns || 3;
    const buttonAlignment = lightModule.button_alignment || 'center';
    const allowWrapping = lightModule.allow_wrapping ?? true;
    const buttonGap = lightModule.button_gap || 0.8;

    // Build container styles based on layout type
    let containerLayoutStyles = '';
    if (layout === 'grid') {
      containerLayoutStyles = `
        display: grid;
        grid-template-columns: repeat(${columns}, 1fr);
        gap: ${buttonGap}rem;
      `;
    } else {
      // Flexible buttons layout
      containerLayoutStyles = `
        display: flex;
        flex-wrap: ${allowWrapping ? 'wrap' : 'nowrap'};
        justify-content: ${this.getJustifyContent(buttonAlignment)};
        align-items: center;
        gap: ${buttonGap}rem;
      `;
    }

    return html`
      <div class="light-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="presets-container ${layout}" style="${containerLayoutStyles}">
          ${presets.map(preset =>
            this.renderPresetButton(preset, lightModule, hass, showLabels, buttonStyle)
          )}
        </div>
      </div>
    `;
  }

  // Helper methods for design properties (consistent with other modules)
  private getPaddingCSS(moduleWithDesign: any): string {
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '8px'}`
      : '16px';
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
    return moduleWithDesign.background_color || 'var(--card-background-color)';
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (moduleWithDesign.background_image_type === 'url' && moduleWithDesign.background_image) {
      return `url(${moduleWithDesign.background_image})`;
    }
    if (
      moduleWithDesign.background_image_type === 'entity' &&
      moduleWithDesign.background_image_entity
    ) {
      const entity = hass.states[moduleWithDesign.background_image_entity];
      if (entity && entity.attributes.entity_picture) {
        return `url(${entity.attributes.entity_picture})`;
      }
    }
    return 'none';
  }

  private getBorderCSS(moduleWithDesign: any): string {
    if (moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none') {
      return `${this.addPixelUnit(moduleWithDesign.border_width) || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`;
    }
    return 'none';
  }

  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;
    if (value === 'auto' || value === 'none' || value === 'inherit') return value;
    if (/^\d+$/.test(value)) return `${value}px`;
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }
    return value;
  }

  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
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
      case 'space-evenly':
        return 'space-evenly';
      default:
        return 'center';
    }
  }

  private renderPresetButton(
    preset: LightPreset,
    lightModule: LightModule,
    hass: HomeAssistant,
    globalShowLabels: boolean,
    globalButtonStyle: string
  ): TemplateResult {
    const hasEntities = preset.entities && preset.entities.length > 0;

    // Use per-preset styling if available, otherwise fall back to global
    const buttonStyle = preset.button_style || globalButtonStyle;
    const showLabels = preset.show_label ?? globalShowLabels;

    // Get colors based on toggles and settings
    const colors = this.getPresetColors(preset, hass);

    // Build button style with proper color application and all critical styles inline
    const borderRadius = preset.border_radius ?? 8;
    let buttonStyles = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: ${borderRadius}px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      min-height: 48px;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    `;

    if (buttonStyle === 'filled') {
      if (colors.buttonColor.startsWith('linear-gradient')) {
        buttonStyles += `background: ${colors.buttonColor}; color: ${colors.textColor}; border: none;`;
      } else {
        buttonStyles += `background-color: ${colors.buttonColor}; color: ${colors.textColor}; border: none;`;
      }
    } else if (buttonStyle === 'outlined') {
      buttonStyles += `border: 2px solid ${colors.buttonColor}; color: ${colors.textColor}; background: transparent;`;
    } else if (buttonStyle === 'text') {
      buttonStyles += `color: ${colors.textColor}; background: transparent; border: none;`;
    }

    return html`
      <div class="preset-button-container">
        <button
          class="preset-button ${buttonStyle} ${!hasEntities ? 'disabled' : ''}"
          @click=${hasEntities ? () => this.applyPreset(preset, lightModule, hass) : undefined}
          style="
            ${buttonStyles}
            ${!hasEntities ? 'opacity: 0.5; cursor: not-allowed;' : ''}
          "
          title="${hasEntities ? `Apply preset: ${preset.name}` : 'No entities configured'}"
        >
          <ha-icon
            icon="${preset.icon || 'mdi:lightbulb'}"
            style="color: ${colors.iconColor};"
          ></ha-icon>
          ${showLabels ? html`<span class="preset-label">${preset.name}</span>` : ''}
        </button>
      </div>
    `;
  }

  // Get the effective colors for a preset based on toggles and light state
  private getPresetColors(
    preset: LightPreset,
    hass: HomeAssistant
  ): {
    textColor: string;
    iconColor: string;
    buttonColor: string;
  } {
    // Get the light color from the preset configuration (not live state)
    let lightColor = this.getPresetColorPreview(preset);

    // Note: We use the preset's configured color, not the live entity state,
    // so buttons show the colors they will set, not the current light color

    // Determine icon color
    let iconColor: string;
    if (preset.use_light_color_for_icon && lightColor) {
      iconColor = lightColor;
    } else {
      iconColor = preset.icon_color || 'var(--primary-color)';
    }

    // Determine button color
    let buttonColor: string;
    const buttonStyle = preset.button_style || 'filled';

    if (buttonStyle === 'filled') {
      // Filled: Use light color for background unless overridden
      if (preset.use_light_color_for_button && lightColor) {
        buttonColor = lightColor;
      } else {
        buttonColor = preset.button_color || lightColor || 'var(--primary-color)';
      }
    } else {
      // Outlined and Text: Always use light color unless custom color is set
      buttonColor = preset.button_color || lightColor || 'var(--primary-color)';
    }

    // Determine text color and icon color with smart logic
    let textColor: string;

    if (preset.smart_color) {
      // Smart contrast mode: both text and icon use contrasting color
      const contrastColor = this.getContrastColor(buttonColor);
      textColor = contrastColor;
      iconColor = contrastColor; // Icon also uses contrast color
    } else if (buttonStyle === 'text') {
      // For text style, use the light color by default
      if (preset.use_icon_color_for_text) {
        textColor = iconColor;
      } else {
        textColor = preset.text_color || lightColor || iconColor;
      }
    } else if (buttonStyle === 'outlined') {
      // For outlined style, use the light color for text by default
      if (preset.use_icon_color_for_text) {
        textColor = iconColor;
      } else {
        textColor = preset.text_color || lightColor || buttonColor;
      }
    } else if (preset.use_icon_color_for_text) {
      textColor = iconColor;
    } else {
      textColor = preset.text_color || 'var(--text-primary-color)';
    }

    return { textColor, iconColor, buttonColor };
  }

  // Calculate contrasting text color (white or black) based on background
  private getContrastColor(backgroundColor: string): string {
    // Handle CSS variables and gradients
    if (backgroundColor.startsWith('var(') || backgroundColor.includes('gradient')) {
      return 'white'; // Default to white for CSS variables and gradients
    }

    // Parse RGB color
    let r = 0,
      g = 0,
      b = 0;

    if (backgroundColor.startsWith('#')) {
      // Hex color
      const rgb = ColorUtils.hexToRgb(backgroundColor);
      if (rgb) [r, g, b] = rgb;
    } else if (backgroundColor.startsWith('rgb(')) {
      // RGB color
      const match = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      }
    }

    // Calculate luminance using relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? 'black' : 'white';
  }

  // Get current light color from entity state
  private getCurrentLightColor(entity: any): string | null {
    if (!entity || !entity.attributes) return null;

    // Check for RGB color attributes (most common for lights)
    if (entity.attributes.rgb_color && Array.isArray(entity.attributes.rgb_color)) {
      return `rgb(${entity.attributes.rgb_color.join(',')})`;
    }

    // Check for HS color attributes and convert to RGB
    if (entity.attributes.hs_color && Array.isArray(entity.attributes.hs_color)) {
      const [h, s] = entity.attributes.hs_color;
      const rgb = ColorUtils.hsvToRgb(h, s, 100);
      return `rgb(${rgb.join(',')})`;
    }

    // Check for XY color and convert to RGB
    if (entity.attributes.xy_color && Array.isArray(entity.attributes.xy_color)) {
      const [x, y] = entity.attributes.xy_color;
      const rgb = ColorUtils.xyToRgb(x, y);
      return `rgb(${rgb.join(',')})`;
    }

    // Check for color temperature
    if (entity.attributes.color_temp) {
      const kelvin = ColorUtils.miredToKelvin(entity.attributes.color_temp);
      if (kelvin < 3000) {
        return '#ffb366'; // Warm white
      } else if (kelvin > 5000) {
        return '#cce6ff'; // Cool white
      } else {
        return '#fff2e6'; // Neutral white
      }
    }

    return null;
  }

  private getPresetColorPreview(preset: LightPreset): string | null {
    // Priority: RGB > HS > XY > Color Temp > Effect
    if (preset.rgb_color) {
      return `rgb(${preset.rgb_color.join(',')})`;
    }
    if (preset.hs_color) {
      const rgb = ColorUtils.hsvToRgb(preset.hs_color[0], preset.hs_color[1], 100);
      return `rgb(${rgb.join(',')})`;
    }
    if (preset.xy_color) {
      const rgb = ColorUtils.xyToRgb(preset.xy_color[0], preset.xy_color[1]);
      return `rgb(${rgb.join(',')})`;
    }
    if (preset.color_temp) {
      // Convert color temperature to approximate RGB for preview
      const kelvin = ColorUtils.miredToKelvin(preset.color_temp);
      if (kelvin < 3000) {
        return '#ffb366'; // Warm white
      } else if (kelvin > 5000) {
        return '#cce6ff'; // Cool white
      } else {
        return '#fff2e6'; // Neutral white
      }
    }
    if (preset.effect) {
      return 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000)'; // Rainbow gradient for effects
    }
    return null;
  }

  // Simplified validation for preset-based system
  private validatePreset(preset: LightPreset): string[] {
    const errors: string[] = [];

    if (!preset.name || preset.name.trim() === '') {
      errors.push('Preset name is required');
    }

    if (!preset.entities || preset.entities.length === 0) {
      errors.push('At least one entity must be selected for each preset');
    }

    if (!preset.brightness && !preset.rgb_color && !preset.color_temp && !preset.effect) {
      errors.push('At least one light setting (brightness, color, or effect) must be configured');
    }

    return errors;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const lightModule = module as LightModule;
    const errors = [...baseValidation.errors];

    // Check if at least one preset is configured
    if (!lightModule.presets || lightModule.presets.length === 0) {
      errors.push('At least one preset must be configured');
    }

    // Validate each preset
    (lightModule.presets || []).forEach((preset, index) => {
      const presetErrors = this.validatePreset(preset);
      presetErrors.forEach(error => {
        errors.push(`Preset ${index + 1}: ${error}`);
      });
    });

    // Validate transition time
    if (
      lightModule.default_transition_time &&
      (lightModule.default_transition_time < 0 || lightModule.default_transition_time > 10)
    ) {
      errors.push('Default transition time must be between 0 and 10 seconds');
    }

    // Validate grid columns
    if (
      lightModule.layout === 'grid' &&
      lightModule.columns &&
      (lightModule.columns < 1 || lightModule.columns > 6)
    ) {
      errors.push('Grid columns must be between 1 and 6');
    }

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .light-module-container {
        padding: 16px;
        background: var(--card-background-color);
        border-radius: 8px;
      }

      .no-presets-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        color: var(--secondary-text-color);
        text-align: center;
      }

      .no-presets-preview ha-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .config-hint {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 8px;
      }

      .presets-container {
        /* Base container - specific layout styles applied inline */
      }

      .presets-container.buttons {
        /* Flexible button layout - styles applied inline */
      }

      .presets-container.grid {
        /* Grid layout - styles applied inline */
      }


      .preset-button-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      /* Preset button styles - work in both card and editor contexts */
      .preset-button,
      .module-preview .preset-button,
      .light-module-container .preset-button {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        padding: 12px 16px !important;
        border-radius: 8px !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
        min-height: 48px !important;
        position: relative !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      .preset-button ha-icon,
      .module-preview .preset-button ha-icon,
      .light-module-container .preset-button ha-icon {
        font-size: 20px !important;
      }

      .preset-button.filled,
      .module-preview .preset-button.filled,
      .light-module-container .preset-button.filled {
        border: 2px solid transparent !important;
      }

      .preset-button.filled:hover:not(.disabled),
      .module-preview .preset-button.filled:hover:not(.disabled),
      .light-module-container .preset-button.filled:hover:not(.disabled) {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        filter: brightness(1.1) !important;
      }

      .preset-button.outlined,
      .module-preview .preset-button.outlined,
      .light-module-container .preset-button.outlined {
        background: transparent !important;
        border: 2px solid !important;
      }

      .preset-button.outlined:hover:not(.disabled),
      .module-preview .preset-button.outlined:hover:not(.disabled),
      .light-module-container .preset-button.outlined:hover:not(.disabled) {
        filter: brightness(1.1) !important;
      }

      .preset-button.text,
      .module-preview .preset-button.text,
      .light-module-container .preset-button.text {
        background: transparent !important;
        border: 2px solid transparent !important;
      }

      .preset-button.text:hover:not(.disabled),
      .module-preview .preset-button.text:hover:not(.disabled),
      .light-module-container .preset-button.text:hover:not(.disabled) {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      .preset-button.disabled,
      .module-preview .preset-button.disabled,
      .light-module-container .preset-button.disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }

      .preset-label {
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
      }

      .preset-name {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-align: center;
        max-width: 80px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Layout-specific styles */
      .presets-container.icons .preset-button {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        padding: 0;
      }

      .presets-container.icons .preset-button ha-icon {
        font-size: 24px;
      }

      .presets-container.list .preset-button-container {
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        gap: 12px;
      }

      .presets-container.list .preset-button {
        flex: 1;
        justify-content: flex-start;
        text-align: left;
        min-height: 56px;
      }

      .presets-container.list .preset-name {
        flex: 1;
        text-align: left;
        max-width: none;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      /* Preset editor styles (mimicking dropdown module) */
      .preset-item {
        transition: all 0.2s ease;
        position: relative;
        cursor: default;
      }

      .preset-item:hover {
        background: rgba(var(--rgb-primary-color), 0.05);
      }

      .preset-item.dragging {
        opacity: 0.7;
        transform: rotate(2deg) scale(0.95);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        z-index: 1000;
        position: relative;
      }

      .preset-header {
        user-select: none;
        transition: background-color 0.2s ease;
      }

      .preset-header:hover {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      .drag-handle {
        transition: all 0.2s ease;
      }

      .drag-handle:hover {
        background: rgba(var(--rgb-primary-color), 0.15) !important;
        transform: scale(1.1);
      }

      .drag-handle:active {
        cursor: grabbing !important;
        transform: scale(0.95);
      }

      .expand-caret {
        transition: transform 0.2s ease !important;
      }

      .preset-content {
        transition: all 0.3s ease;
        overflow: hidden;
      }

      /* Light control styles */
      .light-controls-section {
        background: rgba(var(--rgb-primary-color), 0.02);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid rgba(var(--rgb-primary-color), 0.1);
      }

      .brightness-control,
      .color-picker-section,
      .effects-control {
        background: var(--card-background-color);
        border-radius: 6px;
        padding: 12px;
        border: 1px solid var(--divider-color);
      }

      /* Brightness slider styling */
      .brightness-slider {
        flex: 1;
        height: 6px;
        background: linear-gradient(to right, #333, #fff);
        border-radius: 3px;
        outline: none;
        appearance: none;
        cursor: pointer;
      }

      .brightness-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }

      .brightness-slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }

      .color-preview {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .color-preview div {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
      }

      /* Responsive design */
      @media (max-width: 600px) {
        .presets-container.buttons,
        .presets-container.icons {
          justify-content: center;
        }

        .presets-container.grid {
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        }

        .preset-button {
          min-width: 80px;
        }

        .preset-label {
          max-width: 70px;
        }
      }

      /* Animation for smooth transitions */
      .preset-button {
        transition: all 0.2s ease;
      }

      .preset-button:active:not(.disabled) {
        transform: scale(0.95);
      }

      .presets-container {
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Visual customization styles */
      .visual-customization {
        background: rgba(var(--rgb-primary-color), 0.02);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid rgba(var(--rgb-primary-color), 0.1);
      }

      .smart-color-toggles {
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
      }

      .custom-colors {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .color-field {
        background: var(--card-background-color);
        border-radius: 6px;
        padding: 12px;
        border: 1px solid var(--divider-color);
      }

      .color-field.disabled {
        background: var(--secondary-background-color);
        opacity: 0.7;
      }

      /* Gap control styles (from horizontal module) */
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

      /* Responsive design for color fields */
      @media (max-width: 600px) {
        .custom-colors {
          gap: 12px;
        }

        .presets-container.buttons {
          justify-content: center;
        }

        .gap-control-container {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .gap-input {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
        }
      }
    `;
  }
}
