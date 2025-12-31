import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BackgroundModule, UltraCardConfig } from '../types';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { uploadImage } from '../utils/image-upload';
import { FormUtils } from '../utils/form-utils';

export class UltraBackgroundModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'background',
    title: 'Background',
    description: 'Add custom background images to your dashboard view',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:image-outline',
    category: 'media',
    tags: ['background', 'image', 'view'],
  };

  createDefault(id?: string): BackgroundModule {
    return {
      id: id || this.generateId('background'),
      type: 'background',

      // Background source
      background_type: 'none',
      background_image: '',
      background_image_entity: '',

      // Background display settings
      background_size: 'cover',
      background_position: 'center',
      background_repeat: 'no-repeat',

      // Opacity
      opacity: 100,

      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const backgroundModule = module as BackgroundModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${FormUtils.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Module Info Banner -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <ha-icon
              icon="mdi:image-outline"
              style="color: var(--primary-color); --mdi-icon-size: 32px;"
            ></ha-icon>
            <div>
              <div style="font-size: 18px; font-weight: 700;">View Background</div>
              <div style="font-size: 12px; color: var(--secondary-text-color);">
                Apply custom background images to your dashboard view
              </div>
            </div>
          </div>

          <div
            style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color);"
          >
            <div style="font-size: 13px; line-height: 1.5;">
              <strong>Note:</strong> This module controls the background for the current view only.
              Add additional background modules per view if you need different artwork. Only the
              topmost enabled module with passing logic conditions will be applied.
            </div>
          </div>
        </div>

        <!-- Background Source -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            BACKGROUND SOURCE
          </div>

          <!-- Background Type -->
          ${this.renderFieldSection(
            'Background Type',
            'Choose how you want to specify the background image.',
            hass,
            { background_type: backgroundModule.background_type || 'none' },
            [
              this.selectField('background_type', [
                { value: 'none', label: 'None' },
                { value: 'upload', label: 'Upload Image' },
                { value: 'entity', label: 'Entity Image' },
                { value: 'url', label: 'Image URL' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.background_type;
              const prev = backgroundModule.background_type || 'none';
              if (next === prev) return;
              updateModule({ background_type: next });
              setTimeout(() => {
                this.triggerPreviewUpdate();
              }, 50);
            }
          )}

          <!-- URL Image Source -->
          ${backgroundModule.background_type === 'url'
            ? this.renderConditionalFieldsGroup(
                'Image URL Configuration',
                html`
                  ${FormUtils.renderField(
                    'Image URL',
                    'Enter the direct URL to the background image.',
                    hass,
                    { background_image: backgroundModule.background_image || '' },
                    [FormUtils.createSchemaItem('background_image', { text: {} })],
                    (e: CustomEvent) =>
                      updateModule({ background_image: e.detail.value.background_image })
                  )}
                `
              )
            : ''}

          <!-- Upload Image Source -->
          ${backgroundModule.background_type === 'upload'
            ? this.renderConditionalFieldsGroup(
                'Upload Image Configuration',
                html`
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Upload Image
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Click to upload a background image file from your device.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                    @change=${(e: Event) => this.handleFileUpload(e, updateModule, hass)}
                  />
                  ${backgroundModule.background_image
                    ? html`
                        <div style="margin-top: 8px; font-size: 12px; color: var(--success-color);">
                          ✓ Image uploaded
                        </div>
                      `
                    : ''}
                `
              )
            : ''}

          <!-- Entity Image Source -->
          ${backgroundModule.background_type === 'entity'
            ? this.renderConditionalFieldsGroup(
                'Entity Image Configuration',
                html`
                  ${FormUtils.renderField(
                    'Entity',
                    'Select an entity that has an image (e.g., person, camera entities).',
                    hass,
                    { background_image_entity: backgroundModule.background_image_entity || '' },
                    [FormUtils.createSchemaItem('background_image_entity', { entity: {} })],
                    (e: CustomEvent) => {
                      const next = e.detail.value.background_image_entity;
                      const prev = backgroundModule.background_image_entity || '';
                      if (next === prev) return;
                      updateModule({ background_image_entity: next });
                    }
                  )}
                `
              )
            : ''}
        </div>

        <!-- Background Settings -->
        ${backgroundModule.background_type !== 'none'
          ? html`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                >
                  BACKGROUND SETTINGS
                </div>

                <!-- Background Size -->
                ${this.renderFieldSection(
                  'Background Size',
                  'Control how the background image is sized within the view.',
                  hass,
                  { background_size: backgroundModule.background_size || 'cover' },
                  [
                    this.selectField('background_size', [
                      { value: 'cover', label: 'Cover (Fill entire area)' },
                      { value: 'contain', label: 'Contain (Fit within area)' },
                      { value: 'fill', label: 'Fill (Stretch to fit)' },
                      { value: 'auto', label: 'Auto (Original size)' },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const next = e.detail.value.background_size;
                    const prev = backgroundModule.background_size || 'cover';
                    if (next === prev) return;
                    updateModule({ background_size: next });
                  }
                )}

                <!-- Background Position -->
                ${FormUtils.renderField(
                  'Background Position',
                  'Set the position of the background image (e.g., center, top left, bottom right).',
                  hass,
                  { background_position: backgroundModule.background_position || 'center' },
                  [FormUtils.createSchemaItem('background_position', { text: {} })],
                  (e: CustomEvent) =>
                    updateModule({ background_position: e.detail.value.background_position })
                )}

                <!-- Background Repeat -->
                ${this.renderFieldSection(
                  'Background Repeat',
                  'Control how the background image repeats.',
                  hass,
                  { background_repeat: backgroundModule.background_repeat || 'no-repeat' },
                  [
                    this.selectField('background_repeat', [
                      { value: 'no-repeat', label: 'No Repeat' },
                      { value: 'repeat', label: 'Repeat' },
                      { value: 'repeat-x', label: 'Repeat Horizontally' },
                      { value: 'repeat-y', label: 'Repeat Vertically' },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const next = e.detail.value.background_repeat;
                    const prev = backgroundModule.background_repeat || 'no-repeat';
                    if (next === prev) return;
                    updateModule({ background_repeat: next });
                  }
                )}

                <!-- Opacity Slider -->
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Opacity</div>
                  <div class="field-description">
                    Control the opacity of the background image (0-100%).
                  </div>
                  <style>
                    .number-range-control {
                      display: flex;
                      gap: 8px;
                      align-items: center;
                    }
                    .range-slider {
                      flex: 0 0 65%;
                      height: 6px;
                      background: var(--divider-color);
                      border-radius: 3px;
                      outline: none;
                      appearance: none;
                      -webkit-appearance: none;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      min-width: 0;
                    }
                    .range-slider::-webkit-slider-thumb {
                      appearance: none;
                      -webkit-appearance: none;
                      width: 18px;
                      height: 18px;
                      background: var(--primary-color);
                      border-radius: 50%;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                    .range-slider::-moz-range-thumb {
                      width: 18px;
                      height: 18px;
                      background: var(--primary-color);
                      border-radius: 50%;
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                    .range-slider:hover {
                      background: var(--primary-color);
                      opacity: 0.7;
                    }
                    .range-slider:hover::-webkit-slider-thumb {
                      transform: scale(1.1);
                    }
                    .range-slider:hover::-moz-range-thumb {
                      transform: scale(1.1);
                    }
                    .range-input {
                      flex: 0 0 20%;
                      padding: 6px 8px !important;
                      border: 1px solid var(--divider-color);
                      border-radius: 4px;
                      background: var(--secondary-background-color);
                      color: var(--primary-text-color);
                      font-size: 13px;
                      text-align: center;
                      transition: all 0.2s ease;
                      box-sizing: border-box;
                    }
                    .range-input:focus {
                      outline: none;
                      border-color: var(--primary-color);
                      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
                    }
                    .range-reset-btn {
                      width: 32px;
                      height: 32px;
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
                    .range-reset-btn:hover {
                      background: var(--primary-color);
                      color: var(--text-primary-color);
                      border-color: var(--primary-color);
                    }
                    .range-reset-btn ha-icon {
                      font-size: 14px;
                    }
                  </style>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="0"
                      max="100"
                      step="1"
                      .value="${backgroundModule.opacity !== undefined ? backgroundModule.opacity.toString() : '100'}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        updateModule({ opacity: value });
                      }}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="0"
                      max="100"
                      step="1"
                      .value="${backgroundModule.opacity !== undefined ? backgroundModule.opacity.toString() : '100'}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        if (!isNaN(value)) {
                          updateModule({ opacity: Math.max(0, Math.min(100, value)) });
                        }
                      }}
                    />
                    <button
                      class="range-reset-btn"
                      @click=${() => updateModule({ opacity: 100 })}
                      title="Reset to default (100)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              </div>
            `
          : ''}

      </div>
    `;
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updateModule);
  }

  /**
   * Render preview (doesn't show anything in card view - this is a view-wide background)
   */
  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const backgroundModule = module as BackgroundModule;

    // Check if we're in edit mode
    const isDashboardEditMode = (() => {
      if (previewContext === 'live' || previewContext === 'ha-preview') {
        return false;
      }
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('edit') === '1';
      } catch {
        return false;
      }
    })();

    const showPlaceholder =
      previewContext === 'live' || previewContext === 'ha-preview' || isDashboardEditMode;

    // In editor/preview contexts, show informational placeholder
    if (showPlaceholder) {
      const backgroundSummary =
        backgroundModule.background_type !== 'none'
          ? `${
              backgroundModule.background_type === 'upload'
                ? 'Uploaded Image'
                : backgroundModule.background_type === 'entity'
                  ? 'Entity Image'
                  : backgroundModule.background_type === 'url'
                    ? 'URL Image'
                    : 'No Background'
            } • Per View`
          : 'No Background';

      return html`
        <div
          style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px; border: 2px dashed var(--divider-color);"
        >
          <ha-icon
            icon="mdi:image-outline"
            style="--mdi-icon-size: 48px; color: var(--primary-color); margin-bottom: 8px;"
          ></ha-icon>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            View Background
          </div>
          <div style="font-size: 12px;">
            ${backgroundSummary}
          </div>
          <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">
            Background is applied to the current view. Check your dashboard to see it in action.
          </div>
        </div>
      `;
    }

    // Hide completely on dashboard (no visible element at all)
    return html``;
  }

  /**
   * Validate module configuration
   */
  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const backgroundModule = module as BackgroundModule;
    const errors: string[] = [];

    // Validate based on background type
    if (backgroundModule.background_type === 'upload' || backgroundModule.background_type === 'url') {
      if (!backgroundModule.background_image || backgroundModule.background_image.trim() === '') {
        errors.push('Background image is required for upload/url type');
      }
    }

    if (backgroundModule.background_type === 'entity') {
      if (!backgroundModule.background_image_entity || backgroundModule.background_image_entity.trim() === '') {
        errors.push('Entity is required for entity type');
      }
    }

    // Validate opacity
    if (backgroundModule.opacity !== undefined && (backgroundModule.opacity < 0 || backgroundModule.opacity > 100)) {
      errors.push('Opacity must be between 0 and 100');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Handle file upload
   */
  private async handleFileUpload(
    event: Event,
    updateModule: (updates: Partial<CardModule>) => void,
    hass: HomeAssistant
  ): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const imagePath = await uploadImage(hass, file);
      updateModule({ background_image: imagePath });
    } catch (error) {
      console.error('Failed to upload background image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }

  /**
   * Get styles (none needed for this module)
   */
  getStyles(): string {
    return '';
  }
}

