import { html, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, CameraModule, UltraCardConfig } from '../types';
import { FormUtils } from '../utils/form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';

import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { localize } from '../localize/localize';

export class UltraCameraModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'camera',
    title: 'Camera Module',
    description: 'Display live camera feeds with comprehensive control options',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:camera',
    category: 'content',
    tags: ['camera', 'live', 'feed', 'security', 'surveillance'],
  };

  private clickTimeout: any = null;
  private holdTimeout: any = null;
  private isHolding = false;

  createDefault(id?: string, hass?: HomeAssistant): CameraModule {
    return {
      id: id || this.generateId('camera'),
      type: 'camera',

      // Core properties
      entity: '',
      camera_name: '',
      show_name: true,
      name_position: 'top-left',

      // Display settings
      aspect_ratio_linked: true,
      aspect_ratio_value: 1.778, // 16:9 ratio (320/180)
      image_fit: 'cover',

      // Crop settings (percentage values, 0 = no crop)
      crop_left: 0,
      crop_top: 0,
      crop_right: 0,
      crop_bottom: 0,

      // Camera controls
      show_controls: false,
      live_view: true,
      auto_refresh: true,
      refresh_interval: 30,

      // Image quality
      image_quality: 'high',

      // Error handling
      show_unavailable: true,
      fallback_image: '',

      // Global link configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Template support
      template_mode: false,
      template: '',

      // Global design defaults for camera module
      design: {
        border_radius: '20px',
      },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: any,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const cameraModule = module as CameraModule;
    const lang = hass.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="camera-module-settings">
        <!-- Camera Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.camera.config.title', lang, 'Camera Configuration'),
          localize(
            'editor.camera.config.desc',
            lang,
            'Configure the camera entity and display settings.'
          ),
          [
            {
              title: localize('editor.camera.entity', lang, 'Camera Entity'),
              description: localize(
                'editor.camera.entity_desc',
                lang,
                'Select the camera entity to display. This should be a camera or mjpeg entity from Home Assistant.'
              ),
              hass,
              data: { entity: cameraModule.entity || '' },
              schema: [this.entityField('entity', ['camera'])],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
          ]
        )}

        <!-- Camera Name Settings with toggle in header -->
        <div class="settings-section">
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              ${localize('editor.camera.show_name', lang, 'Show Camera Name')}
            </div>
            <ha-switch
              .checked=${cameraModule.show_name !== false}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ show_name: target.checked });
              }}
            ></ha-switch>
          </div>

          ${cameraModule.show_name !== false
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.camera.name', lang, 'Camera Name'),
                    localize(
                      'editor.camera.name_desc',
                      lang,
                      'Custom name for the camera. Leave empty to use entity name.'
                    ),
                    hass,
                    { camera_name: cameraModule.camera_name || '' },
                    [this.textField('camera_name')],
                    (e: CustomEvent) => updateModule(e.detail.value)
                  )}
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.camera.name_position.title', lang, 'Name Position'),
                    localize(
                      'editor.camera.name_position.desc',
                      lang,
                      'Choose where the camera name appears as an overlay on the camera image.'
                    ),
                    hass,
                    { name_position: cameraModule.name_position || 'top-left' },
                    [
                      this.selectField('name_position', [
                        {
                          value: 'top-left',
                          label: localize(
                            'editor.camera.name_position.options.top_left',
                            lang,
                            'Top Left'
                          ),
                        },
                        {
                          value: 'top-right',
                          label: localize(
                            'editor.camera.name_position.options.top_right',
                            lang,
                            'Top Right'
                          ),
                        },
                        {
                          value: 'center',
                          label: localize(
                            'editor.camera.name_position.options.center',
                            lang,
                            'Center'
                          ),
                        },
                        {
                          value: 'bottom-left',
                          label: localize(
                            'editor.camera.name_position.options.bottom_left',
                            lang,
                            'Bottom Left'
                          ),
                        },
                        {
                          value: 'bottom-right',
                          label: localize(
                            'editor.camera.name_position.options.bottom_right',
                            lang,
                            'Bottom Right'
                          ),
                        },
                      ]),
                    ],
                    (e: CustomEvent) => updateModule(e.detail.value)
                  )}
                </div>
              `
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  ${localize(
                    'editor.camera.show_name_toggle.enable_toggle_desc',
                    lang,
                    'Enable the toggle above to configure camera name display'
                  )}
                </div>
              `}
        </div>

        <!-- Display Settings Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 32px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.camera.display.title', lang, 'Display Settings')}
          </div>

          <div style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.camera.live_view.title', lang, 'Live View'),
              localize(
                'editor.camera.live_view.desc',
                lang,
                'Enable to show live camera stream (requires stream integration). When disabled, shows still image snapshots.'
              ),
              hass,
              { live_view: cameraModule.live_view !== false },
              [this.booleanField('live_view')],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
          </div>

          ${cameraModule.live_view === false
            ? html`
                <div style="margin-top: 24px;">
                  ${this.renderConditionalFieldsGroup(
                    localize(
                      'editor.camera.auto_refresh.section_title',
                      lang,
                      'Auto Refresh Settings'
                    ),
                    html`
                      <div style="margin-bottom: 16px;">
                        ${FormUtils.renderField(
                          localize('editor.camera.auto_refresh.title', lang, 'Auto Refresh'),
                          localize(
                            'editor.camera.auto_refresh.desc',
                            lang,
                            'Automatically refresh the camera image at regular intervals'
                          ),
                          hass,
                          { auto_refresh: cameraModule.auto_refresh !== false },
                          [FormUtils.createSchemaItem('auto_refresh', { boolean: {} })],
                          (e: CustomEvent) =>
                            updateModule({ auto_refresh: e.detail.value.auto_refresh })
                        )}
                      </div>

                      ${cameraModule.auto_refresh !== false
                        ? html`
                            ${FormUtils.renderField(
                              localize(
                                'editor.camera.refresh_interval.title',
                                lang,
                                'Refresh Interval (seconds)'
                              ),
                              localize(
                                'editor.camera.refresh_interval.desc',
                                lang,
                                'How often to refresh the camera image automatically.'
                              ),
                              hass,
                              { refresh_interval: cameraModule.refresh_interval || 30 },
                              [
                                FormUtils.createSchemaItem('refresh_interval', {
                                  number: { min: 5, max: 300, mode: 'box' },
                                }),
                              ],
                              (e: CustomEvent) =>
                                updateModule({
                                  refresh_interval: e.detail.value.refresh_interval,
                                })
                            )}
                          `
                        : ''}
                    `
                  )}
                </div>
              `
            : ''}

          <!-- Dimensions Section -->
          <div style="margin-bottom: 32px;">
            <div
              class="field-title"
              style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: var(--primary-color);"
            >
              ${localize('editor.camera.dimensions.title', lang, 'Dimensions')}
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

              .aspect-ratio-link-btn {
                width: 40px;
                height: 40px;
                padding: 0;
                border: 2px solid var(--divider-color);
                border-radius: 50%;
                background: var(--secondary-background-color);
                color: var(--primary-text-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
                margin: 0 auto;
                position: relative;
              }

              .aspect-ratio-link-btn.linked {
                border-color: var(--primary-color);
                background: var(--primary-color);
                color: white;
                transform: scale(1.05);
              }

              .aspect-ratio-link-btn:hover {
                transform: scale(1.1);
                border-color: var(--primary-color);
              }

              .aspect-ratio-link-btn.linked:hover {
                background: var(--primary-color);
                opacity: 0.9;
              }

              .aspect-ratio-link-btn ha-icon {
                font-size: 20px;
                transition: transform 0.2s ease;
              }

              .dimensions-container {
                display: flex;
                flex-direction: column;
                gap: 16px;
              }

              .dimension-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
            </style>

            <div class="dimensions-container">
              <div class="dimension-group">
                <div class="field-title">
                  ${localize('editor.camera.width', lang, 'Width (px)')}
                </div>
                <div class="field-description">
                  ${localize(
                    'editor.camera.width_desc',
                    lang,
                    'Set the width of the camera display. Range: 100-1000px'
                  )}
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${cameraModule.width || 320}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const newWidth = parseInt(target.value);
                      this._handleDimensionChange(cameraModule, 'width', newWidth, updateModule);
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${cameraModule.width || 320}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const newWidth = parseInt(target.value);
                      if (!isNaN(newWidth)) {
                        this._handleDimensionChange(cameraModule, 'width', newWidth, updateModule);
                      }
                    }}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        const currentValue = parseInt(target.value) || 320;
                        const increment = e.key === 'ArrowUp' ? 1 : -1;
                        const newValue = Math.max(100, Math.min(1000, currentValue + increment));
                        this._handleDimensionChange(cameraModule, 'width', newValue, updateModule);
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() =>
                      this._handleDimensionChange(cameraModule, 'width', 320, updateModule)}
                    title=${localize(
                      'editor.fields.reset_default_value',
                      lang,
                      'Reset to default ({value})'
                    ).replace('{value}', '320')}
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Link/Unlink Button -->
              <div style="display: flex; justify-content: center; margin: 8px 0;">
                <button
                  class="aspect-ratio-link-btn ${cameraModule.aspect_ratio_linked !== false
                    ? 'linked'
                    : ''}"
                  @click=${() => {
                    const newLinked = !cameraModule.aspect_ratio_linked;
                    const updates: any = { aspect_ratio_linked: newLinked };

                    // When linking, calculate and store the current aspect ratio
                    if (newLinked) {
                      const currentWidth = cameraModule.width || 320;
                      const currentHeight = cameraModule.height || 180;
                      updates.aspect_ratio_value = currentWidth / currentHeight;
                    }

                    updateModule(updates);
                  }}
                  title="${cameraModule.aspect_ratio_linked !== false
                    ? localize('editor.camera.unlink_aspect', lang, 'Unlink aspect ratio')
                    : localize('editor.camera.link_aspect', lang, 'Link aspect ratio')}"
                >
                  <ha-icon
                    icon="${cameraModule.aspect_ratio_linked !== false
                      ? 'mdi:link-variant'
                      : 'mdi:link-variant-off'}"
                  ></ha-icon>
                </button>
              </div>

              <div class="dimension-group">
                <div class="field-title">
                  ${localize('editor.camera.height', lang, 'Height (px)')}
                </div>
                <div class="field-description">
                  ${localize(
                    'editor.camera.height_desc',
                    lang,
                    'Set the height of the camera display. Range: 100-1000px'
                  )}
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${cameraModule.height || 180}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const newHeight = parseInt(target.value);
                      this._handleDimensionChange(cameraModule, 'height', newHeight, updateModule);
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${cameraModule.height || 180}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const newHeight = parseInt(target.value);
                      if (!isNaN(newHeight)) {
                        this._handleDimensionChange(
                          cameraModule,
                          'height',
                          newHeight,
                          updateModule
                        );
                      }
                    }}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        const currentValue = parseInt(target.value) || 180;
                        const increment = e.key === 'ArrowUp' ? 1 : -1;
                        const newValue = Math.max(100, Math.min(1000, currentValue + increment));
                        this._handleDimensionChange(cameraModule, 'height', newValue, updateModule);
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() =>
                      this._handleDimensionChange(cameraModule, 'height', 180, updateModule)}
                    title=${localize(
                      'editor.fields.reset_default_value',
                      lang,
                      'Reset to default ({value})'
                    ).replace('{value}', '180')}
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            </div>

            ${cameraModule.aspect_ratio_linked !== false
              ? html`
                  <div
                    style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color);"
                  >
                    <div
                      style="font-size: 13px; color: var(--primary-color); font-weight: 500; margin-bottom: 4px;"
                    >
                      <ha-icon
                        icon="mdi:link-variant"
                        style="font-size: 14px; margin-right: 6px;"
                      ></ha-icon>
                      ${localize('editor.camera.aspect_linked.title', lang, 'Aspect Ratio Linked')}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                    >
                      ${localize(
                        'editor.camera.aspect_linked.desc',
                        lang,
                        'Dimensions maintain {ratio}:1 ratio. Adjusting one dimension automatically updates the other to maintain proportions.'
                      ).replace(
                        '{ratio}',
                        `${((cameraModule.aspect_ratio_value || 1.778) * 1).toFixed(2)}`
                      )}
                    </div>
                  </div>
                `
              : html`
                  <div
                    style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-secondary-text-color), 0.1); border-radius: 8px; border-left: 4px solid var(--secondary-text-color);"
                  >
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); font-weight: 500; margin-bottom: 4px;"
                    >
                      <ha-icon
                        icon="mdi:link-variant-off"
                        style="font-size: 14px; margin-right: 6px;"
                      ></ha-icon>
                      ${localize(
                        'editor.camera.aspect_independent.title',
                        lang,
                        'Independent Dimensions'
                      )}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                    >
                      ${localize(
                        'editor.camera.aspect_independent.desc',
                        lang,
                        'Width and height can be adjusted independently. Click the link button above to maintain aspect ratio.'
                      )}
                    </div>
                  </div>
                `}
          </div>
        </div>

        <!-- Crop & Position Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.camera.crop.title', lang, 'Crop & Position')}
          </div>
          <div
            class="field-description"
            style="margin-bottom: 20px; color: var(--secondary-text-color); font-style: italic;"
          >
            ${localize(
              'editor.camera.crop.desc',
              lang,
              'Adjust the crop and position of the camera view. Useful for focusing on specific areas or removing unwanted edges.'
            )}
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Left Crop -->
            <div class="field-container">
              <div class="field-title">
                ${localize('editor.camera.crop.left_title', lang, 'Left Crop (%)')}
              </div>
              <div class="field-description">
                ${localize(
                  'editor.camera.crop.left_desc',
                  lang,
                  'Crop from the left edge. Higher values show less of the left side.'
                )}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_left || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    updateModule({ crop_left: value });
                  }}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_left || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    if (!isNaN(value)) {
                      updateModule({ crop_left: value });
                    }
                  }}
                />
                <button
                  class="range-reset-btn"
                  @click=${() => updateModule({ crop_left: 0 })}
                  title=${localize(
                    'editor.fields.reset_default_value',
                    lang,
                    'Reset to default ({value})'
                  ).replace('{value}', '0')}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Right Crop -->
            <div class="field-container">
              <div class="field-title">
                ${localize('editor.camera.crop.right_title', lang, 'Right Crop (%)')}
              </div>
              <div class="field-description">
                ${localize(
                  'editor.camera.crop.right_desc',
                  lang,
                  'Crop from the right edge. Higher values show less of the right side.'
                )}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_right || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    updateModule({ crop_right: value });
                  }}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_right || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    if (!isNaN(value)) {
                      updateModule({ crop_right: value });
                    }
                  }}
                />
                <button
                  class="range-reset-btn"
                  @click=${() => updateModule({ crop_right: 0 })}
                  title=${localize(
                    'editor.fields.reset_default_value',
                    lang,
                    'Reset to default ({value})'
                  ).replace('{value}', '0')}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Top Crop -->
            <div class="field-container">
              <div class="field-title">
                ${localize('editor.camera.crop.top_title', lang, 'Top Crop (%)')}
              </div>
              <div class="field-description">
                ${localize(
                  'editor.camera.crop.top_desc',
                  lang,
                  'Crop from the top edge. Higher values show less of the top area.'
                )}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_top || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    updateModule({ crop_top: value });
                  }}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_top || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    if (!isNaN(value)) {
                      updateModule({ crop_top: value });
                    }
                  }}
                />
                <button
                  class="range-reset-btn"
                  @click=${() => updateModule({ crop_top: 0 })}
                  title=${localize(
                    'editor.fields.reset_default_value',
                    lang,
                    'Reset to default ({value})'
                  ).replace('{value}', '0')}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Bottom Crop -->
            <div class="field-container">
              <div class="field-title">
                ${localize('editor.camera.crop.bottom_title', lang, 'Bottom Crop (%)')}
              </div>
              <div class="field-description">
                ${localize(
                  'editor.camera.crop.bottom_desc',
                  lang,
                  'Crop from the bottom edge. Higher values show less of the bottom area.'
                )}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_bottom || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    updateModule({ crop_bottom: value });
                  }}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${cameraModule.crop_bottom || 0}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    if (!isNaN(value)) {
                      updateModule({ crop_bottom: value });
                    }
                  }}
                />
                <button
                  class="range-reset-btn"
                  @click=${() => updateModule({ crop_bottom: 0 })}
                  title=${localize(
                    'editor.fields.reset_default_value',
                    lang,
                    'Reset to default ({value})'
                  ).replace('{value}', '0')}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Crop Status -->
          ${(cameraModule.crop_left || 0) +
            (cameraModule.crop_top || 0) +
            (cameraModule.crop_right || 0) +
            (cameraModule.crop_bottom || 0) >
          0
            ? html`
                <div
                  style="margin-top: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color);"
                >
                  <div
                    style="font-size: 13px; color: var(--primary-color); font-weight: 500; margin-bottom: 4px;"
                  >
                    <ha-icon icon="mdi:crop" style="font-size: 14px; margin-right: 6px;"></ha-icon>
                    ${localize('editor.camera.crop.active_applied', lang, 'Active Crops Applied')}
                  </div>
                  <div
                    style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                  >
                    L: ${cameraModule.crop_left || 0}% | T: ${cameraModule.crop_top || 0}% | R:
                    ${cameraModule.crop_right || 0}% | B: ${cameraModule.crop_bottom || 0}%
                  </div>
                </div>
              `
            : ''}

          <!-- Reset All Crops Button -->
          <div style="margin-top: 20px; text-align: center;">
            <button
              style="
                padding: 8px 16px;
                border: 1px solid var(--primary-color);
                border-radius: 6px;
                background: transparent;
                color: var(--primary-color);
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s ease;
              "
              @click=${() =>
                updateModule({
                  crop_left: 0,
                  crop_top: 0,
                  crop_right: 0,
                  crop_bottom: 0,
                })}
              @mouseover=${(e: Event) => {
                const btn = e.target as HTMLElement;
                btn.style.background = 'var(--primary-color)';
                btn.style.color = 'white';
              }}
              @mouseout=${(e: Event) => {
                const btn = e.target as HTMLElement;
                btn.style.background = 'transparent';
                btn.style.color = 'var(--primary-color)';
              }}
            >
              <ha-icon icon="mdi:crop-free" style="margin-right: 6px; font-size: 14px;"></ha-icon>
              ${localize('editor.camera.crop.reset_all', lang, 'Reset All Crops')}
            </button>
          </div>
        </div>

        <!-- Link configuration intentionally omitted for Camera module per design guidelines -->

        <!-- Template Mode Section -->
        <div
          class="settings-section template-mode-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.camera.template.title', lang, 'Template Mode')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${localize(
              'editor.camera.template.desc',
              lang,
              'Use a template to dynamically set the camera entity. Templates allow you to use Home Assistant templating syntax for conditional camera selection.'
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ template_mode: cameraModule.template_mode || false }}
              .schema=${[
                {
                  name: 'template_mode',
                  label: localize('editor.camera.template.mode_label', lang, 'Template Mode'),
                  description: localize(
                    'editor.camera.template.mode_desc',
                    lang,
                    'Use Home Assistant templating syntax to dynamically select camera entity'
                  ),
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ template_mode: e.detail.value.template_mode })}
            ></ha-form>
          </div>

          ${cameraModule.template_mode
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${hass}
                    .data=${{ template: cameraModule.template || '' }}
                    .schema=${[
                      {
                        name: 'template',
                        label: localize(
                          'editor.camera.template.camera_template_label',
                          lang,
                          'Camera Template'
                        ),
                        description: localize(
                          'editor.camera.template.camera_template_desc',
                          lang,
                          'Template to dynamically set the camera entity using Jinja2 syntax'
                        ),
                        selector: { text: { multiline: true } },
                      },
                    ]}
                    .computeLabel=${(schema: any) => schema.label || schema.name}
                    .computeDescription=${(schema: any) => schema.description || ''}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ template: e.detail.value.template })}
                  ></ha-form>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${localize('editor.camera.template.examples_title', lang, 'Common Examples:')}
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      'camera.outdoor' if is_state('weather.home', 'sunny') else ''
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${localize(
                        'editor.camera.template.example1_desc',
                        lang,
                        'Show camera when weather is sunny'
                      )}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      'camera.front_door' if is_state('input_boolean.show_front', 'on') else
                      'camera.back_yard'
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${localize(
                        'editor.camera.template.example2_desc',
                        lang,
                        'Switch between cameras based on input boolean'
                      )}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      states('input_select.active_camera')
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${localize(
                        'editor.camera.template.example3_desc',
                        lang,
                        'Use input select to choose camera entity'
                      )}
                    </div>
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as any, hass, updates => updateModule(updates));
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const cameraModule = module as CameraModule;
    const moduleWithDesign = cameraModule as any;

    // Extract design properties from global design tab
    const designProperties = moduleWithDesign.design || {};

    // Get camera entity
    let cameraEntity = cameraModule.entity;

    // Debug logging removed in production builds

    // Handle template mode
    if (cameraModule.template_mode && cameraModule.template) {
      try {
        // Simple template evaluation for common patterns
        let evaluatedTemplate = cameraModule.template;

        // Replace state() function calls
        const stateMatches = evaluatedTemplate.match(/states\(['"]([^'"]+)['"]\)/g);
        if (stateMatches) {
          stateMatches.forEach(match => {
            const entityId = match.match(/states\(['"]([^'"]+)['"]\)/)[1];
            const entity = hass?.states[entityId];
            const value = entity ? entity.state : 'unknown';
            evaluatedTemplate = evaluatedTemplate.replace(match, `'${value}'`);
          });
        }

        // Replace is_state() function calls
        const isStateMatches = evaluatedTemplate.match(
          /is_state\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/g
        );
        if (isStateMatches) {
          isStateMatches.forEach(match => {
            const [, entityId, expectedState] = match.match(
              /is_state\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/
            );
            const entity = hass?.states[entityId];
            const isMatch = entity && entity.state === expectedState;
            evaluatedTemplate = evaluatedTemplate.replace(match, isMatch ? 'True' : 'False');
          });
        }

        // Simple if-else evaluation for the format: entity_id if condition else fallback
        const ifElseMatch = evaluatedTemplate.match(
          /['"]([^'"]+)['"] if (.+?) else ['"]([^'"]+)['"]/
        );
        if (ifElseMatch) {
          const [, trueEntity, condition, falseEntity] = ifElseMatch;
          const conditionResult = condition.includes('True');
          cameraEntity = conditionResult ? trueEntity : falseEntity;
        } else {
          // If no if-else pattern, try to extract entity directly
          const entityMatch = evaluatedTemplate.match(/['"]([^'"]+)['"]/);
          if (entityMatch) {
            cameraEntity = entityMatch[1];
          }
        }
      } catch (error) {
        console.error('Template evaluation error:', error);
        cameraEntity = cameraModule.entity; // Fallback to original entity
      }
    }

    const entity = cameraEntity ? hass.states[cameraEntity] : null;
    const isUnavailable = !entity || entity.state === 'unavailable';

    // Debug logging removed in production builds

    // Get camera name
    const cameraName =
      cameraModule.camera_name ||
      (entity ? entity.attributes.friendly_name || entity.entity_id : 'Camera');

    // Outer container styles - minimal styling, design properties applied to camera image container
    const containerStyles = {
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems:
        designProperties.alignment === 'left'
          ? 'flex-start'
          : designProperties.alignment === 'right'
            ? 'flex-end'
            : 'center',
      justifyContent: 'center',
      color: designProperties.color || this.getTextColor(moduleWithDesign),
      fontFamily: designProperties.font_family || this.getTextFont(moduleWithDesign),
      fontSize: designProperties.font_size
        ? typeof designProperties.font_size === 'number'
          ? `${designProperties.font_size}px`
          : designProperties.font_size
        : this.getTextSize(moduleWithDesign),
      fontWeight: designProperties.font_weight || this.getTextWeight(moduleWithDesign),
      textTransform: designProperties.text_transform || undefined,
      letterSpacing: designProperties.letter_spacing || undefined,
      lineHeight: designProperties.line_height || undefined,
      textShadow: designProperties.text_shadow || undefined,
    };

    // Calculate crop positioning for true cropping with container resizing
    const cropLeft = cameraModule.crop_left || 0;
    const cropRight = cameraModule.crop_right || 0;
    const cropTop = cameraModule.crop_top || 0;
    const cropBottom = cameraModule.crop_bottom || 0;

    // Calculate actual container dimensions based on crop
    const originalWidth = cameraModule.width || 320;
    const originalHeight = cameraModule.height || 180;

    // Reduce container size based on crop percentages
    const croppedWidth = (originalWidth * (100 - cropLeft - cropRight)) / 100;
    const croppedHeight = (originalHeight * (100 - cropTop - cropBottom)) / 100;

    // Calculate image positioning to show the correct portion
    const imageOffsetX = -((originalWidth * cropLeft) / 100);
    const imageOffsetY = -((originalHeight * cropTop) / 100);

    // Camera image styles - positioned to show correct portion within cropped container
    const imageStyles = {
      objectFit: 'cover',
      width: `${originalWidth}px`, // Keep original size
      height: `${originalHeight}px`, // Keep original size
      display: 'block',
      position: 'absolute',
      left: `${imageOffsetX}px`, // Offset to show correct portion
      top: `${imageOffsetY}px`, // Offset to show correct portion
      transition: 'all 0.3s ease',
      borderRadius: designProperties.border_radius || '0px', // Match container border radius
    };

    // Container styling using cropped dimensions - prioritize design properties
    const containerImageStyles = {
      width: designProperties.width || `${Math.max(50, croppedWidth)}px`,
      height: designProperties.height || `${Math.max(50, croppedHeight)}px`,
      maxWidth: designProperties.max_width || undefined,
      minWidth: designProperties.min_width || undefined,
      maxHeight: designProperties.max_height || undefined,
      minHeight: designProperties.min_height || undefined,
      position: 'relative',
      overflow: designProperties.overflow || 'hidden',
      borderRadius: designProperties.border_radius || '0px',
      background: designProperties.background_color || 'transparent',
      backgroundImage:
        this.getBackgroundImageWithDesign(designProperties, moduleWithDesign, hass) || undefined,
      border: this.getBorderWithDesign(designProperties, moduleWithDesign) || undefined,
      padding: '0', // No padding on camera image container to prevent background bleeding
      margin: this.getMarginWithDesign(designProperties, moduleWithDesign),
      boxShadow: designProperties.box_shadow || undefined,
      backdropFilter: designProperties.backdrop_filter || undefined,
      clipPath: designProperties.clip_path || undefined,
    };

    // Get camera name position styles with design properties priority
    const namePosition = cameraModule.name_position || 'top-left';
    const namePositionStyles = this.getCameraNamePositionStyles(
      namePosition,
      moduleWithDesign,
      designProperties
    );

    // Camera content
    const cameraContent = html`
      <div class="camera-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="camera-image-container" style=${this.styleObjectToCss(containerImageStyles)}>
          ${!cameraEntity
            ? html`
                <div
                  class="camera-unavailable"
                  style=${this.styleObjectToCss({
                    ...imageStyles,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundColor: 'var(--warning-color, #ff9800)',
                    color: designProperties.color || this.getTextColor(moduleWithDesign),
                    position: 'static', // Don't apply crop positioning to unavailable state
                    left: 'auto',
                    top: 'auto',
                    fontFamily: designProperties.font_family || this.getTextFont(moduleWithDesign),
                  })}
                >
                  <ha-icon
                    icon="mdi:camera-plus"
                    style="font-size: 48px; margin-bottom: 8px;"
                  ></ha-icon>
                  <span
                    style="font-weight: ${designProperties.font_weight ||
                    this.getTextWeight(moduleWithDesign)}; font-size: ${designProperties.font_size
                      ? typeof designProperties.font_size === 'number'
                        ? `${designProperties.font_size}px`
                        : designProperties.font_size
                      : this.getTextSize(moduleWithDesign)};"
                    >No Camera Selected</span
                  >
                  <span
                    style="font-size: ${designProperties.font_size
                      ? typeof designProperties.font_size === 'number'
                        ? `${Math.max(10, designProperties.font_size - 2)}px`
                        : this.getSmallTextSize(moduleWithDesign)
                      : this.getSmallTextSize(moduleWithDesign)}; margin-top: 4px; opacity: 0.9;"
                    >Choose a camera entity below</span
                  >
                </div>
                ${cameraModule.show_name !== false
                  ? html`
                      <div
                        class="camera-name-overlay"
                        style=${this.styleObjectToCss(namePositionStyles)}
                      >
                        ${cameraName}
                      </div>
                    `
                  : ''}
              `
            : !isUnavailable
              ? html`
                  <!-- Use HA's native camera image component - same as picture-glance card -->
                  <hui-image
                    .hass=${hass}
                    .cameraImage=${cameraEntity}
                    .cameraView=${cameraModule.live_view ? 'live' : 'auto'}
                    style=${this.styleObjectToCss(imageStyles)}
                    class="camera-image"
                    @error=${() => {}}
                    @load=${() => {}}
                  ></hui-image>
                  ${cameraModule.show_name !== false
                    ? html`
                        <div
                          class="camera-name-overlay"
                          style=${this.styleObjectToCss(namePositionStyles)}
                        >
                          ${cameraName}
                        </div>
                      `
                    : ''}
                `
              : html`
                  <div
                    class="camera-unavailable"
                    style=${this.styleObjectToCss({
                      ...imageStyles,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      backgroundColor: 'var(--error-color, #f44336)',
                      color: designProperties.color || this.getTextColor(moduleWithDesign),
                      position: 'static', // Don't apply crop positioning to unavailable state
                      left: 'auto',
                      top: 'auto',
                      fontFamily:
                        designProperties.font_family || this.getTextFont(moduleWithDesign),
                    })}
                  >
                    ${cameraModule.fallback_image
                      ? html`
                          <img
                            src=${cameraModule.fallback_image}
                            alt="Fallback"
                            style="max-width: 100%; max-height: 100%; object-fit: cover;"
                          />
                        `
                      : html`
                          <ha-icon
                            icon="mdi:camera-off"
                            style="font-size: 48px; margin-bottom: 8px;"
                          ></ha-icon>
                          <span
                            style="font-weight: ${designProperties.font_weight ||
                            this.getTextWeight(
                              moduleWithDesign
                            )}; font-size: ${designProperties.font_size
                              ? typeof designProperties.font_size === 'number'
                                ? `${designProperties.font_size}px`
                                : designProperties.font_size
                              : this.getTextSize(moduleWithDesign)};"
                            >Camera Unavailable</span
                          >
                          <span
                            style="font-size: ${designProperties.font_size
                              ? typeof designProperties.font_size === 'number'
                                ? `${Math.max(10, designProperties.font_size - 2)}px`
                                : this.getSmallTextSize(moduleWithDesign)
                              : this.getSmallTextSize(
                                  moduleWithDesign
                                )}; margin-top: 4px; opacity: 0.9;"
                            >Entity: ${cameraEntity}</span
                          >
                        `}
                  </div>
                  ${cameraModule.show_name !== false
                    ? html`
                        <div
                          class="camera-name-overlay"
                          style=${this.styleObjectToCss(namePositionStyles)}
                        >
                          ${cameraName}
                        </div>
                      `
                    : ''}
                `}
        </div>
      </div>
    `;

    // Get hover effect configuration from module design
    const hoverEffect = (cameraModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    // Handle link actions
    return this.hasActiveLink(cameraModule)
      ? html`<div
          class="camera-module-clickable ${hoverEffectClass}"
          @click=${(e: Event) => this.handleClick(e, cameraModule, hass)}
          @dblclick=${(e: Event) => this.handleDoubleClick(e, cameraModule, hass)}
          @mousedown=${(e: Event) => this.handleMouseDown(e, cameraModule, hass)}
          @mouseup=${(e: Event) => this.handleMouseUp(e, cameraModule, hass)}
          @mouseleave=${(e: Event) => this.handleMouseLeave(e, cameraModule, hass)}
          @touchstart=${(e: Event) => this.handleTouchStart(e, cameraModule, hass)}
          @touchend=${(e: Event) => this.handleTouchEnd(e, cameraModule, hass)}
        >
          ${cameraContent}
        </div>`
      : hoverEffectClass
        ? html`<div class="camera-module-container ${hoverEffectClass}">${cameraContent}</div>`
        : cameraContent;
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

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const cameraModule = module as CameraModule;
    const errors = [...baseValidation.errors];

    // Entity validation (unless template mode)
    if (
      !cameraModule.template_mode &&
      (!cameraModule.entity || cameraModule.entity.trim() === '')
    ) {
      errors.push('Camera entity is required when not using template mode');
    }

    // Template validation
    if (
      cameraModule.template_mode &&
      (!cameraModule.template || cameraModule.template.trim() === '')
    ) {
      errors.push('Template code is required when template mode is enabled');
    }

    // Refresh interval validation
    if (cameraModule.auto_refresh !== false && cameraModule.refresh_interval) {
      if (cameraModule.refresh_interval < 5 || cameraModule.refresh_interval > 300) {
        errors.push('Refresh interval must be between 5 and 300 seconds');
      }
    }

    // Border radius validation
    if (cameraModule.border_radius && isNaN(Number(cameraModule.border_radius))) {
      errors.push('Border radius must be a number');
    }

    // Action validation
    if (cameraModule.tap_action && cameraModule.tap_action.action) {
      errors.push(...this.validateAction(cameraModule.tap_action));
    }
    if (cameraModule.hold_action && cameraModule.hold_action.action) {
      errors.push(...this.validateAction(cameraModule.hold_action));
    }
    if (cameraModule.double_tap_action && cameraModule.double_tap_action.action) {
      errors.push(...this.validateAction(cameraModule.double_tap_action));
    }

    return { valid: errors.length === 0, errors };
  }

  // Event Handling Methods
  private handleClick(event: Event, module: CameraModule, hass: HomeAssistant): void {
    event.preventDefault();
    if (this.clickTimeout) clearTimeout(this.clickTimeout);

    this.clickTimeout = setTimeout(() => {
      this.handleTapAction(event, module, hass);
    }, 300);
  }

  private handleDoubleClick(event: Event, module: CameraModule, hass: HomeAssistant): void {
    event.preventDefault();
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
    this.handleDoubleAction(event, module, hass);
  }

  private handleMouseDown(event: Event, module: CameraModule, hass: HomeAssistant): void {
    this.isHolding = false;
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.handleHoldAction(event, module, hass);
    }, 500);
  }

  private handleMouseUp(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
  }

  private handleMouseLeave(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
    this.isHolding = false;
  }

  private handleTouchStart(event: Event, module: CameraModule, hass: HomeAssistant): void {
    this.handleMouseDown(event, module, hass);
  }

  private handleTouchEnd(event: Event, module: CameraModule, hass: HomeAssistant): void {
    this.handleMouseUp(event, module, hass);
  }

  private handleTapAction(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (this.isHolding) return;

    if (module.tap_action) {
      // For camera modules, default to more-info if action is 'default'
      const action =
        module.tap_action.action === 'default'
          ? { action: 'more-info', entity: module.entity }
          : module.tap_action;
      UltraLinkComponent.handleAction(action as any, hass, event.target as HTMLElement);
    } else if (module.entity) {
      // Default action for cameras: show more-info
      UltraLinkComponent.handleAction(
        { action: 'more-info', entity: module.entity } as any,
        hass,
        event.target as HTMLElement
      );
    }
  }

  private handleHoldAction(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (module.hold_action && module.hold_action.action !== 'nothing') {
      UltraLinkComponent.handleAction(module.hold_action as any, hass, event.target as HTMLElement);
    }
  }

  private handleDoubleAction(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (module.double_tap_action && module.double_tap_action.action !== 'nothing') {
      UltraLinkComponent.handleAction(
        module.double_tap_action as any,
        hass,
        event.target as HTMLElement
      );
    }
  }

  // Dimension handling with aspect ratio linking
  private _handleDimensionChange(
    cameraModule: CameraModule,
    changedDimension: 'width' | 'height',
    newValue: number,
    updateModule: (updates: Partial<CameraModule>) => void
  ): void {
    const updates: Partial<CameraModule> = {};

    if (cameraModule.aspect_ratio_linked !== false) {
      // Aspect ratio is linked - calculate the other dimension
      const aspectRatio = cameraModule.aspect_ratio_value || 1.778; // Default 16:9

      if (changedDimension === 'width') {
        updates.width = newValue;
        updates.height = Math.round(newValue / aspectRatio);
      } else {
        updates.height = newValue;
        updates.width = Math.round(newValue * aspectRatio);
      }

      // Ensure values stay within bounds
      if (updates.width && (updates.width < 100 || updates.width > 1000)) {
        updates.width = Math.max(100, Math.min(1000, updates.width));
        updates.height = Math.round(updates.width / aspectRatio);
      }

      if (updates.height && (updates.height < 100 || updates.height > 1000)) {
        updates.height = Math.max(100, Math.min(1000, updates.height));
        updates.width = Math.round(updates.height * aspectRatio);
      }
    } else {
      // Independent mode - only update the changed dimension
      updates[changedDimension] = newValue;
    }

    updateModule(updates);
  }

  // Camera name positioning with global design integration
  private getCameraNamePositionStyles(
    position: string,
    moduleWithDesign: any,
    designProperties: any = {}
  ): Record<string, string> {
    const baseStyles = {
      position: 'absolute',
      padding: '6px 12px', // Fixed padding for camera name overlay
      background: 'rgba(0, 0, 0, 0.7)', // Fixed background for camera name overlay
      color: designProperties.color || this.getTextColor(moduleWithDesign),
      fontSize: designProperties.font_size
        ? typeof designProperties.font_size === 'number'
          ? `${designProperties.font_size}px`
          : designProperties.font_size
        : this.getTextSize(moduleWithDesign),
      fontWeight: designProperties.font_weight || this.getTextWeight(moduleWithDesign),
      fontFamily: designProperties.font_family || this.getTextFont(moduleWithDesign),
      borderRadius: '4px', // Fixed small border radius for camera name overlay
      textTransform: designProperties.text_transform || undefined,
      letterSpacing: designProperties.letter_spacing || undefined,
      lineHeight: designProperties.line_height || undefined,
      zIndex: '10',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)',
      maxWidth: 'calc(100% - 20px)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      textShadow: designProperties.text_shadow || '0 1px 2px rgba(0, 0, 0, 0.8)',
      transition: 'all 0.2s ease',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '8px', left: '8px' };
      case 'top-right':
        return { ...baseStyles, top: '8px', right: '8px' };
      case 'center':
        return {
          ...baseStyles,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        };
      case 'bottom-left':
        return { ...baseStyles, bottom: '8px', left: '8px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '8px', right: '8px' };
      default:
        return { ...baseStyles, top: '8px', left: '8px' };
    }
  }

  // Helper Methods
  private hasActiveLink(module: CameraModule): boolean {
    const hasTapAction = module.tap_action && module.tap_action.action !== 'nothing';
    const hasHoldAction = module.hold_action && module.hold_action.action !== 'nothing';
    const hasDoubleAction =
      module.double_tap_action && module.double_tap_action.action !== 'nothing';

    return hasTapAction || hasHoldAction || hasDoubleAction || !!module.entity; // Default tap for camera
  }

  private refreshCamera(entity: string, hass: HomeAssistant): void {
    // Try to refresh the hui-image component
    const huiImageElements = document.querySelectorAll(`hui-image[class*="camera-image"]`);
    huiImageElements.forEach((element: any) => {
      if (element.cameraImage === entity && element.hass === hass) {
        // Force a refresh by updating the hass object reference
        element.hass = { ...hass };
        element.requestUpdate();
      }
    });
  }

  private getCameraImageUrl(entity: string, hass: HomeAssistant, quality?: string): string {
    if (!entity || !hass) {
      return '';
    }

    // Use HA's native camera image URL generation - same method as picture-glance card
    // This is the proven approach that works with all camera types including RTSP
    let finalUrl: string;

    try {
      // Method 1: Try to use HA's internal camera URL helper (if available)
      if ((hass as any).hassUrl) {
        const hassUrl = (hass as any).hassUrl();
        finalUrl = `${hassUrl}/api/camera_proxy/${entity}`;
      } else {
        // Method 2: Use relative URL (most common case)
        finalUrl = `/api/camera_proxy/${entity}`;
      }

      // Add cache busting parameter (same as picture-glance)
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl += `${separator}token=${Date.now()}`;
    } catch (error) {
      // Fallback to basic URL
      finalUrl = `/api/camera_proxy/${entity}?token=${Date.now()}`;
    }

    return finalUrl;
  }

  private async getCameraImageBlob(
    entity: string,
    hass: HomeAssistant,
    quality?: string
  ): Promise<string> {
    try {
      // Simple approach: use the same URL structure as HA's native camera interface
      const timestamp = Date.now();
      const url = `/api/camera_proxy/${entity}?t=${timestamp}`;

      // Try to fetch with same credentials as HA interface
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include all credentials (cookies, etc.)
        headers: {
          Accept: 'image/*',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) {
        return await this.getCameraImageViaWebSocket(entity, hass);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    } catch (error) {
      return await this.getCameraImageViaWebSocket(entity, hass);
    }
  }

  private async getCameraImageViaWebSocket(entity: string, hass: HomeAssistant): Promise<string> {
    try {
      // Use Home Assistant's connection to get camera thumbnail
      const connection = (hass as any).connection;
      if (!connection) {
        throw new Error('No WebSocket connection available');
      }

      const result = await connection.sendMessagePromise({
        type: 'camera_thumbnail',
        entity_id: entity,
      });

      if (result && result.content) {
        // Convert base64 to blob URL
        const byteCharacters = atob(result.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);

        return blobUrl;
      }

      throw new Error('No image content received from WebSocket');
    } catch (error) {
      return '';
    }
  }

  private async handleImageError(event: Event, module: CameraModule): Promise<void> {
    const img = event.target as HTMLImageElement;

    // Only try blob approach once (avoid infinite loops)
    if (!img.dataset.triedBlob && module.entity) {
      img.dataset.triedBlob = 'true';

      try {
        // Get hass instance from various possible sources
        const hass =
          (document.querySelector('home-assistant') as any)?.hass ||
          (document.querySelector('ha-panel-lovelace') as any)?.hass ||
          (window as any).hassConnection?.hass;

        if (hass) {
          const blobUrl = await this.getCameraImageBlob(module.entity, hass, module.image_quality);

          if (blobUrl) {
            img.src = blobUrl;
            return;
          }
        }
      } catch (error) {}
    }

    // Fallback to provided fallback image or error display
    if (module.fallback_image) {
      img.src = module.fallback_image;
    } else {
      // Hide the image and show unavailable state
      img.style.display = 'none';

      // Try to show an error message with helpful guidance
      const container = img.closest('.camera-image-container');
      if (container) {
        const entityState = module.entity
          ? (document.querySelector('home-assistant') as any)?.hass?.states?.[module.entity]
          : null;
        const cameraType =
          entityState?.attributes?.brand || entityState?.attributes?.model || 'Unknown';

        // Get global design settings
        const hass = (document.querySelector('home-assistant') as any)?.hass;
        const moduleWithDesign = module as any;

        container.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background-color: var(--warning-color, #ff9800);
            color: ${this.getTextColor(moduleWithDesign)};
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            min-height: 150px;
            border: 1px solid rgba(255,255,255,0.2);
            font-family: ${this.getTextFont(moduleWithDesign)};
          ">
            <ha-icon icon="mdi:camera-off" style="font-size: 48px; margin-bottom: 12px; opacity: 0.9;"></ha-icon>
            <span style="font-weight: ${this.getTextWeight(moduleWithDesign)}; font-size: ${this.getTextSize(moduleWithDesign)}; margin-bottom: 8px;">Camera Load Failed</span>
            <span style="font-size: ${this.getSmallTextSize(moduleWithDesign)}; margin-bottom: 8px; opacity: 0.9;">Entity: ${module.entity}</span>
            <span style="font-size: ${this.getSmallTextSize(moduleWithDesign)}; margin-bottom: 12px; opacity: 0.8;">Camera Type: ${cameraType}</span>
            <div style="font-size: ${this.getSmallTextSize(moduleWithDesign)}; opacity: 0.8; line-height: 1.4; margin-bottom: 12px;">
              <div style="margin-bottom: 6px;">• Check camera entity is working in HA</div>
              <div style="margin-bottom: 6px;">• Verify RTSP credentials in HA config</div>
              <div>• Try refreshing the browser</div>
            </div>
            <button 
              onclick="window.retryCamera_${module.entity?.replace(/\./g, '_')}"
              style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: ${this.getSmallTextSize(moduleWithDesign)};
                font-family: ${this.getTextFont(moduleWithDesign)};
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background='rgba(255,255,255,0.3)'"
              onmouseout="this.style.background='rgba(255,255,255,0.2)'"
            >
              🔄 Retry Camera Load
            </button>
          </div>
        `;

        // Set up the retry function
        if (module.entity) {
          const retryFunctionName = `retryCamera_${module.entity.replace(/\./g, '_')}`;
          (window as any)[retryFunctionName] = async () => {
            // Get fresh hass instance
            const hass = (document.querySelector('home-assistant') as any)?.hass;
            if (hass) {
              try {
                // Force a new image load with simple URL (same as HA native)
                const newTimestamp = Date.now();
                const newUrl = `/api/camera_proxy/${module.entity}?t=${newTimestamp}`;

                // Create a new image element
                const newImg = document.createElement('img');
                newImg.className = 'camera-image';
                newImg.style.cssText = `
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  object-fit: ${module.image_fit || 'cover'};
                  border-radius: inherit;
                `;

                // Set up new error handler
                newImg.onerror = (e: Event | string) => {
                  if (typeof e !== 'string') {
                    this.handleImageError(e, module);
                  }
                };

                // On successful load, replace the container content
                newImg.onload = () => {
                  if (container) {
                    container.innerHTML = '';
                    container.appendChild(newImg);
                  }
                };

                // Start loading
                newImg.src = newUrl;

                // Show loading indicator temporarily
                if (container) {
                  container.innerHTML = `
                    <div style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-direction: column;
                      background-color: var(--primary-color);
                      color: ${this.getTextColor(moduleWithDesign)};
                      padding: 20px;
                      border-radius: 8px;
                      text-align: center;
                      min-height: 150px;
                      font-family: ${this.getTextFont(moduleWithDesign)};
                    ">
                      <div style="
                        width: 32px;
                        height: 32px;
                        border: 3px solid rgba(255,255,255,0.3);
                        border-top: 3px solid white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 12px;
                      "></div>
                      <span style="font-weight: ${this.getTextWeight(moduleWithDesign)}; font-size: ${this.getTextSize(moduleWithDesign)};">Retrying Camera Load...</span>
                      <style>
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      </style>
                    </div>
                  `;
                }
              } catch (error) {
                console.error('🎥 Retry failed:', error);
              }
            }
          };
        }
      }
    }
  }

  protected renderConditionalFieldsGroup(title: string, content: TemplateResult): TemplateResult {
    return html`
      <div
        class="conditional-fields-group"
        style="margin-top: 16px; padding: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0;"
      >
        <div
          style="font-weight: 600; color: var(--primary-color); margin-bottom: 12px; font-size: 14px;"
        >
          ${title}
        </div>
        ${content}
      </div>
    `;
  }

  // Global design text styling methods
  private getTextColor(moduleWithDesign: any): string {
    return moduleWithDesign.text_color || 'white';
  }

  private getTextSize(moduleWithDesign: any): string {
    const size = moduleWithDesign.text_size || 14;
    return typeof size === 'number' ? `${size}px` : size;
  }

  private getSmallTextSize(moduleWithDesign: any): string {
    const size = moduleWithDesign.text_size || 14;
    const smallSize = typeof size === 'number' ? Math.max(10, size - 2) : 12;
    return `${smallSize}px`;
  }

  private getTextWeight(moduleWithDesign: any): string {
    return moduleWithDesign.text_weight || '500';
  }

  private getTextFont(moduleWithDesign: any): string {
    return (
      moduleWithDesign.text_font ||
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    );
  }

  // Style utility methods
  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;
    if (/^\d+$/.test(value)) return `${value}px`;
    return value;
  }

  // Design property helper methods
  private getPaddingWithDesign(designProperties: any, moduleWithDesign: any): string {
    if (
      designProperties.padding_top ||
      designProperties.padding_bottom ||
      designProperties.padding_left ||
      designProperties.padding_right
    ) {
      return `${designProperties.padding_top || '8px'} ${designProperties.padding_right || '12px'} ${designProperties.padding_bottom || '8px'} ${designProperties.padding_left || '12px'}`;
    }
    return this.getPaddingCSS(moduleWithDesign);
  }

  private getMarginWithDesign(designProperties: any, moduleWithDesign: any): string {
    if (
      designProperties.margin_top ||
      designProperties.margin_bottom ||
      designProperties.margin_left ||
      designProperties.margin_right
    ) {
      return `${designProperties.margin_top || '0px'} ${designProperties.margin_right || '0px'} ${designProperties.margin_bottom || '0px'} ${designProperties.margin_left || '0px'}`;
    }
    return this.getMarginCSS(moduleWithDesign);
  }

  private getBorderWithDesign(designProperties: any, moduleWithDesign: any): string {
    if (
      designProperties.border_width &&
      designProperties.border_style &&
      designProperties.border_color
    ) {
      return `${designProperties.border_width} ${designProperties.border_style} ${designProperties.border_color}`;
    }
    return this.getBorderCSS(moduleWithDesign);
  }

  private getBackgroundImageWithDesign(
    designProperties: any,
    moduleWithDesign: any,
    hass: HomeAssistant
  ): string {
    if (designProperties.background_image_type === 'url' && designProperties.background_image) {
      return `url('${designProperties.background_image}')`;
    } else if (
      designProperties.background_image_type === 'entity' &&
      designProperties.background_image_entity
    ) {
      const entity = hass.states[designProperties.background_image_entity];
      if (entity) {
        return `url('/api/camera_proxy/${designProperties.background_image_entity}')`;
      }
    }
    return this.getBackgroundImageCSS(moduleWithDesign, hass);
  }

  private getPaddingCSS(moduleWithDesign: any): string {
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '12px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '12px'}`
      : '8px 12px';
  }

  private getMarginCSS(moduleWithDesign: any): string {
    if (
      moduleWithDesign.margin_top ||
      moduleWithDesign.margin_bottom ||
      moduleWithDesign.margin_left ||
      moduleWithDesign.margin_right
    ) {
      return `${this.addPixelUnit(moduleWithDesign.margin_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0px'}`;
    }
    return '0px';
  }

  private getBackgroundCSS(moduleWithDesign: any): string {
    return moduleWithDesign.background_color || 'transparent';
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (moduleWithDesign.background_image_type === 'url' && moduleWithDesign.background_image) {
      return `url('${moduleWithDesign.background_image}')`;
    } else if (
      moduleWithDesign.background_image_type === 'entity' &&
      moduleWithDesign.background_image_entity
    ) {
      const entity = hass.states[moduleWithDesign.background_image_entity];
      if (entity) {
        return `url('/api/camera_proxy/${moduleWithDesign.background_image_entity}')`;
      }
    }
    return '';
  }

  private getBorderCSS(moduleWithDesign: any): string {
    if (
      moduleWithDesign.border_width &&
      moduleWithDesign.border_style &&
      moduleWithDesign.border_color
    ) {
      return `${moduleWithDesign.border_width} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color}`;
    }
    return '';
  }

  private validateAction(action: any): string[] {
    const errors: string[] = [];
    if (action.action === 'navigate' && !action.navigation_path) {
      errors.push('Navigation path is required for navigate action');
    }
    if (action.action === 'call-service' && (!action.service || !action.service_data)) {
      errors.push('Service and service data are required for call-service action');
    }
    return errors;
  }

  getStyles(): string {
    return `
      .camera-module-container {
        width: 100%;
        box-sizing: border-box;
        transition: all 0.3s ease;
      }
      
      .camera-name-overlay {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        transition: all 0.2s ease;
      }
      
      .camera-image-container {
        position: relative;
        overflow: hidden;
        margin: 0 auto;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .camera-image {
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;
      }
      
      .camera-unavailable {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color);
        min-height: 150px;
        transition: all 0.3s ease;
      }
      
      .camera-module-clickable {
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .camera-module-clickable:hover {
        transform: scale(1.02);
      }
      
      .camera-module-clickable:active {
        transform: scale(0.98);
      }

      /* Standard field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
     
        margin-bottom: 4px !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
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

      /* Conditional fields grouping */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
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

      /* Global design responsive text */
      .camera-module-container * {
        transition: font-size 0.3s ease, color 0.3s ease, font-weight 0.3s ease;
      }

      /* Enhanced animations for global design changes */
      @keyframes textSizeChange {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }

      .camera-module-container.design-updating {
        animation: textSizeChange 0.3s ease;
      }
    `;
  }
}
