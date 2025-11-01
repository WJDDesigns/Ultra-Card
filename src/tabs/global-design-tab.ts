import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import { FormUtils } from '../utils/form-utils';
import type { CardModule } from '../types';
import '../components/ultra-color-picker';

export class GlobalDesignTab {
  static render<M extends CardModule>(
    module: M,
    hass: HomeAssistant,
    updateModule: (updates: Partial<M>) => void
  ): TemplateResult {
    const d = (module as any).design || {};

    const updateDesign = (updates: Record<string, any>) => {
      const mergedDesign: Record<string, any> = { ...d };
      // Apply updates with reset semantics: empty/undefined/null removes the key
      Object.keys(updates).forEach(key => {
        const val = (updates as any)[key];
        if (
          val === '' ||
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '')
        ) {
          delete mergedDesign[key];
        } else {
          mergedDesign[key] = val;
        }
      });
      const combined: Record<string, any> = { design: mergedDesign };
      // Keep a mirrored top-level background_color so previews that read
      // module.background_color (instead of design.background_color) update immediately.
      if (Object.prototype.hasOwnProperty.call(updates, 'background_color')) {
        combined.background_color = updates.background_color || undefined;
        if (!combined.background_color) delete combined.background_color;
      }

      // Keep a mirrored top-level font_size so modules that read module.font_size
      // (instead of design.font_size) update immediately and to clear conflicting values.
      if (Object.prototype.hasOwnProperty.call(updates, 'font_size')) {
        const fontSizeValue = updates.font_size;
        if (
          fontSizeValue === '' ||
          fontSizeValue === undefined ||
          fontSizeValue === null ||
          (typeof fontSizeValue === 'string' && fontSizeValue.trim() === '')
        ) {
          combined.font_size = undefined;
          delete combined.font_size;
        } else {
          combined.font_size = fontSizeValue;
        }
      }

      // Debug logging for font_size updates
      if (updates.hasOwnProperty('font_size')) {
        console.log('🔧 GlobalDesignTab: Font size update', {
          originalUpdates: updates,
          combinedUpdates: combined,
          fontSizeValue: updates.font_size,
          designObject: combined.design,
        });
      }

      updateModule(combined as any);

      // Dispatch design update event for preview refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ultra-card-design-update', {
            detail: { moduleId: (module as any).id, updates },
          })
        );
      }
    };

    return html`
      <div class="uc-global-design-tab">
        ${FormUtils.injectCleanFormStyles()}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <!-- Padding Section with Direct Inputs to Avoid HA Form Validation Issues -->
          <div class="form-field-container">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Padding
            </div>
            <div
              class="field-description"
              style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              Spacing inside the module container (top/right/bottom/left).
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Top</label
                >
                <input
                  type="text"
                  value="${d.padding_top || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ padding_top: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Right</label
                >
                <input
                  type="text"
                  value="${d.padding_right || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ padding_right: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Bottom</label
                >
                <input
                  type="text"
                  value="${d.padding_bottom || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ padding_bottom: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Left</label
                >
                <input
                  type="text"
                  value="${d.padding_left || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ padding_left: (e.target as HTMLInputElement).value })}
                  placeholder="0px, 1rem, 5%"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <!-- Background Color with Ultra Color Picker -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Background Color
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
            >
              Background color for the module container.
            </div>
            <ultra-color-picker
              .value=${d.background_color || ''}
              .defaultValue=${'transparent'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateDesign({ background_color: e.detail.value })}
            ></ultra-color-picker>
          </div>

          <!-- Background Image Settings -->
          ${FormUtils.renderField(
            'Background Image',
            'Background image for the module container.',
            hass,
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
            (e: CustomEvent) => updateDesign(e.detail.value)
          )}
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <!-- Sizes Section with Direct Inputs -->
          <div class="form-field-container">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Sizes
            </div>
            <div
              class="field-description"
              style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              Control the dimensions and size constraints of the module container.
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Width</label
                >
                <input
                  type="text"
                  value="${d.width || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ width: (e.target as HTMLInputElement).value })}
                  placeholder="auto, 200px, 100%, 14rem, 10vw"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Height</label
                >
                <input
                  type="text"
                  value="${d.height || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ height: (e.target as HTMLInputElement).value })}
                  placeholder="auto, 200px, 15rem, 10vh"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Max Width</label
                >
                <input
                  type="text"
                  value="${d.max_width || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ max_width: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 100%, 14rem, 10vw"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Max Height</label
                >
                <input
                  type="text"
                  value="${d.max_height || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ max_height: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 15rem, 10vh"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Min Width</label
                >
                <input
                  type="text"
                  value="${d.min_width || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ min_width: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 100%, 14rem, 10vw"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Min Height</label
                >
                <input
                  type="text"
                  value="${d.min_height || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ min_height: (e.target as HTMLInputElement).value })}
                  placeholder="200px, 15rem, 10vh"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px;"
        >
          <!-- Typography Section with Direct Inputs to Avoid HA Form Validation Issues -->
          <div class="form-field-container">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Typography
            </div>
            <div
              class="field-description"
              style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              Text color and font properties.
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Color</label
                >
                <input
                  type="text"
                  value="${d.color || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ color: (e.target as HTMLInputElement).value })}
                  placeholder="var(--primary-text-color), #fff, red"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Font Size</label
                >
                <input
                  type="text"
                  value="${d.font_size || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ font_size: (e.target as HTMLInputElement).value })}
                  placeholder="16px, 1.2rem, 1.5em"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Font Family</label
                >
                <input
                  type="text"
                  value="${d.font_family || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ font_family: (e.target as HTMLInputElement).value })}
                  placeholder="Arial, sans-serif"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
              <div>
                <label
                  style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block;"
                  >Font Weight</label
                >
                <input
                  type="text"
                  value="${d.font_weight || ''}"
                  @change=${(e: Event) =>
                    updateDesign({ font_weight: (e.target as HTMLInputElement).value })}
                  placeholder="400, 600, bold"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;"
        >
          ${FormUtils.renderField(
            'Border',
            'Container border style.',
            hass,
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
            (e: CustomEvent) => updateDesign(e.detail.value)
          )}
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;"
        >
          ${FormUtils.renderField(
            'Shadow',
            'Box shadow properties.',
            hass,
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
            (e: CustomEvent) => updateDesign(e.detail.value)
          )}
        </div>

        <!-- Smart Scaling Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
        >
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <ha-icon icon="mdi:fit-to-screen" style="color: var(--primary-color);"></ha-icon>
            <span style="font-size: 16px; font-weight: 600; color: var(--primary-text-color);">
              Smart Scaling
            </span>
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
          >
            When enabled, content automatically scales to fit within the card boundaries. Disable to
            allow overflow effects like glows and shadows to extend beyond bounds.
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; color: var(--primary-text-color);"
              >Enable Smart Scaling</span
            >
            <ha-switch
              .checked="${module.smart_scaling !== false}"
              @change="${(e: Event) => {
                const target = e.target as any;
                updateModule({ smart_scaling: target.checked } as Partial<M>);
              }}"
            ></ha-switch>
          </div>
        </div>
      </div>
      ${(() => {
        try {
          const fn = (module as any).renderDesignExtensions as
            | ((h: HomeAssistant, update: (updates: Record<string, any>) => void) => TemplateResult)
            | undefined;
          if (typeof fn === 'function') {
            return fn(hass, (updates: Record<string, any>) => updateDesign(updates));
          }
        } catch (_e) {}
        return html``;
      })()}
    `;
  }
}
