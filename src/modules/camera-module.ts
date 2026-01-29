import { html, TemplateResult } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { createRef, ref, Ref } from 'lit/directives/ref.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, CameraModule, UltraCardConfig } from '../types';
import { FormUtils } from '../utils/form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';

import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { localize } from '../localize/localize';
import { Z_INDEX } from '../utils/uc-z-index';
import { TemplateService } from '../services/template-service';
import { buildEntityContext } from '../utils/template-context';
import { parseUnifiedTemplate, hasTemplateError } from '../utils/template-parser';
import '../components/ultra-template-editor';

const CAMERA_PLAYER_SELECTORS = new Set([
  'ha-web-rtc-player',
  'ha-hls-player',
  'ha-camera-stream',
  'ha-camera-websocket',
  'ha-camera-player',
  'ha-camera-viewer',
]);

export class UltraCameraModule extends BaseUltraModule {
  private _templateInputDebounce: any = null;
  private _templateService?: TemplateService;
  private _lastRenderedEntity: string | null = null;
  private _renderDebounce: any = null;
  private _webrtcUpdateTimer: any = null;
  private _pendingCameraProps?: { entity: string; live: boolean };
  private _lastAppliedEntity?: string;
  private _lastAppliedLive?: boolean;
  private _huiImageRef: Ref<any> = createRef();
  private _cameraStableKeys: Map<string, string> = new Map(); // Store stable keys by module ID
  private _audioOverrides: Map<string, boolean> = new Map();
  private _lastAudioStates: Map<string, boolean> = new Map();
  private _audioObservers: Map<string, { observer: MutationObserver; target: Node }> = new Map();
  private _snapshotRefreshTimers: Map<string, any> = new Map();

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

      // Fullscreen controls
      tap_opens_fullscreen: false,

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

      // Stream mode - controls camera feed behavior:
      // 'auto': HA default - lightweight snapshots with tap-to-live upgrade (low data usage)
      // 'live': Always streaming live feed (high data usage, real-time)
      // 'snapshot': Manual refresh only at specified interval (lowest data usage)
      view_mode: 'auto',
      refresh_interval: 10, // Seconds between refreshes (only used in 'snapshot' mode, range: 1-300)
      audio_enabled: false, // Only applies in 'live' mode

      // Image quality
      image_quality: 'high',

      // Rotation
      rotation: 0,

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

      // Global design defaults for camera module - responsive by default
      design: {
        width: '100%', // Responsive width by default
        max_width: '500px', // Reasonable max width to prevent oversizing
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
              data: cameraModule,
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
                        {
                          value: 'top-middle',
                          label: localize(
                            'editor.camera.name_position.options.top_middle',
                            lang,
                            'Top Middle'
                          ),
                        },
                        {
                          value: 'bottom-middle',
                          label: localize(
                            'editor.camera.name_position.options.bottom_middle',
                            lang,
                            'Bottom Middle'
                          ),
                        },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.name_position;
                      const prev = cameraModule.name_position || 'top-left';

                      if (next === prev) return;

                      updateModule(e.detail.value);
                    }
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

        <!-- Tap to Open Fullscreen Settings -->
        <div class="settings-section">
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              ${localize('editor.camera.tap_opens_fullscreen', lang, 'Tap Camera Opens Fullscreen')}
            </div>
            <ha-switch
              .checked=${cameraModule.tap_opens_fullscreen === true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ tap_opens_fullscreen: target.checked });
              }}
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="margin-bottom: 16px; color: var(--secondary-text-color); font-style: italic; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; border-left: 4px solid var(--primary-color);"
          >
            <ha-icon icon="mdi:information" style="font-size: 14px; margin-right: 6px;"></ha-icon>
            ${localize(
              'editor.camera.tap_opens_fullscreen_desc',
              lang,
              'When enabled, tapping anywhere on the camera will open it in fullscreen mode.'
            )}
          </div>
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

          <!-- Stream Mode Selector -->
          <div style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.camera.view_mode.title', lang, 'Stream Mode'),
              localize(
                'editor.camera.view_mode.desc',
                lang,
                'Control how the camera feed is displayed. Auto: snapshot with tap-to-live (like HA default). Live: always streaming. Snapshot: manual refresh only.'
              ),
              hass,
              { view_mode: cameraModule.view_mode || 'auto' },
              [
                this.selectField('view_mode', [
                  {
                    value: 'auto',
                    label: localize(
                      'editor.camera.view_mode.options.auto',
                      lang,
                      'Auto (HA Default)'
                    ),
                  },
                  {
                    value: 'live',
                    label: localize('editor.camera.view_mode.options.live', lang, 'Always Live'),
                  },
                  {
                    value: 'snapshot',
                    label: localize(
                      'editor.camera.view_mode.options.snapshot',
                      lang,
                      'Snapshot Only'
                    ),
                  },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.view_mode;
                const prev = cameraModule.view_mode || 'auto';
                if (next === prev) return;
                updateModule(e.detail.value);
              }
            )}
          </div>

          <!-- Audio Enable (only for Live mode) -->
          ${(cameraModule.view_mode || 'auto') === 'live'
            ? html`
                <div style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.camera.audio_enabled.title', lang, 'Enable Audio'),
                    localize(
                      'editor.camera.audio_enabled.desc',
                      lang,
                      'Enable audio for live camera streams. Audio is only available in Live mode.'
                    ),
                    hass,
                    { audio_enabled: cameraModule.audio_enabled === true },
                    [this.booleanField('audio_enabled')],
                    (e: CustomEvent) => updateModule(e.detail.value)
                  )}
                </div>
              `
            : ''}

          <!-- Refresh Interval (only for Snapshot mode) -->
          ${(cameraModule.view_mode || 'auto') === 'snapshot'
            ? html`
                <div style="margin-top: 24px;">
                  ${this.renderConditionalFieldsGroup(
                    localize(
                      'editor.camera.snapshot_refresh.section_title',
                      lang,
                      'Snapshot Refresh Settings'
                    ),
                    html`
                      ${FormUtils.renderField(
                        localize(
                          'editor.camera.refresh_interval.title',
                          lang,
                          'Refresh Interval (seconds)'
                        ),
                        localize(
                          'editor.camera.refresh_interval.desc',
                          lang,
                          'How often to refresh the camera snapshot automatically. Range: 1-300 seconds.'
                        ),
                        hass,
                        { refresh_interval: cameraModule.refresh_interval || 10 },
                        [
                          FormUtils.createSchemaItem('refresh_interval', {
                            number: { min: 1, max: 300, mode: 'box' },
                          }),
                        ],
                        (e: CustomEvent) =>
                          updateModule({
                            refresh_interval: e.detail.value.refresh_interval,
                          })
                      )}
                    `
                  )}
                </div>
              `
            : ''}

          <!-- Dimensions Section -->
          <div style="margin-bottom: 32px;">
            <div
              class="field-title"
              style="font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--primary-color);"
            >
              ${localize('editor.camera.dimensions.title', lang, 'Dimensions')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; border-left: 4px solid var(--primary-color);"
            >
              <ha-icon icon="mdi:information" style="font-size: 14px; margin-right: 6px;"></ha-icon>
              ${localize(
                'editor.camera.dimensions.responsive_note',
                lang,
                'Camera now uses responsive sizing by default (100% width). Use the Design tab for full control over dimensions, or adjust these fallback pixel dimensions for specific use cases.'
              )}
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
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
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
                    class="gap-input"
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
                    class="reset-btn"
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
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
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
                    class="gap-input"
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
                    class="reset-btn"
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

          <!-- Rotation Field -->
          <div class="dimension-group" style="margin-top: 16px;">
            <div class="field-title">
              ${localize('editor.camera.rotation', lang, 'Rotation (°)')}
            </div>
            <div class="field-description">
              ${localize(
                'editor.camera.rotation_desc',
                lang,
                'Rotate the camera image clockwise (0-360 degrees).'
              )}
            </div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="360"
                step="1"
                .value="${cameraModule.rotation || 0}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const newRotation = parseInt(target.value);
                  updateModule({ rotation: newRotation });
                }}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="360"
                step="1"
                .value="${cameraModule.rotation || 0}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const newRotation = parseInt(target.value);
                  if (!isNaN(newRotation)) {
                    updateModule({ rotation: newRotation });
                  }
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const currentValue = parseInt(target.value) || 0;
                    const increment = e.key === 'ArrowUp' ? 1 : -1;
                    const newValue = Math.max(0, Math.min(360, currentValue + increment));
                    updateModule({ rotation: newValue });
                  }
                }}
              />
              <button
                class="range-reset-btn"
                @click=${() => updateModule({ rotation: 0 })}
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
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${localize(
                      'editor.camera.template.camera_template_label',
                      lang,
                      'Camera Template'
                    )}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                  >
                    ${localize(
                      'editor.camera.template.camera_template_desc',
                      lang,
                      'Template to dynamically set the camera entity using Jinja2 syntax'
                    )}
                  </div>
                  <div
                    @mousedown=${(e: Event) => {
                      // Only stop propagation for drag operations, not clicks on the editor
                      const target = e.target as HTMLElement;
                      if (
                        !target.closest('ultra-template-editor') &&
                        !target.closest('.cm-editor')
                      ) {
                        e.stopPropagation();
                      }
                    }}
                    @dragstart=${(e: Event) => e.stopPropagation()}
                  >
                    <ultra-template-editor
                      .hass=${hass}
                      .value=${cameraModule.template || ''}
                      .placeholder=${"{{ 'camera.outdoor' if is_state('weather.home', 'sunny') else 'camera.indoor' }}"}
                      .minHeight=${100}
                      .maxHeight=${300}
                      @value-changed=${(e: CustomEvent) => {
                        updateModule({ template: e.detail.value });
                      }}
                    ></ultra-template-editor>
                  </div>
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

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const cameraModule = module as CameraModule;
    const moduleWithDesign = cameraModule as any;
    const lang = hass.locale?.language || 'en';

    // GRACEFUL RENDERING: Check for incomplete configuration
    if (
      !cameraModule.template_mode &&
      (!cameraModule.entity || cameraModule.entity.trim() === '')
    ) {
      return this.renderGradientErrorState(
        'Select Camera Entity',
        'Choose a camera entity in the General tab',
        'mdi:camera-outline'
      );
    }

    if (
      cameraModule.template_mode &&
      (!cameraModule.template || cameraModule.template.trim() === '')
    ) {
      return this.renderGradientErrorState(
        'Configure Template',
        'Enter template code in the General tab',
        'mdi:camera-outline'
      );
    }

    // Extract design properties from global design tab
    const designProperties = moduleWithDesign.design || {};

    // Template mode (if enabled)
    let templateEntity: string | undefined;
    let templateVisible: boolean | undefined;
    let templateOverlayText: string | undefined;
    let templateOverlayColor: string | undefined;

    if (cameraModule.template_mode && cameraModule.template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      if (hass) {
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }
        const templateHash = this._hashString(cameraModule.template);
        const templateKey = `camera_${cameraModule.id}_${templateHash}`;

        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          const context = buildEntityContext(cameraModule.entity || '', hass, {
            camera_name: cameraModule.camera_name,
            live_view: cameraModule.live_view,
          });

          this._templateService.subscribeToTemplate(
            cameraModule.template,
            templateKey,
            () => {
              if (typeof window !== 'undefined') {
                if (!window._ultraCardUpdateTimer) {
                  window._ultraCardUpdateTimer = setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent('ultra-card-template-update', {
                        bubbles: true,
                        composed: true,
                      })
                    );
                    window._ultraCardUpdateTimer = null;
                  }, 50);
                }
              }
            },
            context,
            config // Pass config for card-specific variable resolution
          );
        }

        const templateResult = hass.__uvc_template_strings?.[templateKey];
        if (templateResult && String(templateResult).trim() !== '') {
          const parsed = parseUnifiedTemplate(templateResult);
          if (!hasTemplateError(parsed)) {
            // Extract entity
            if (parsed.entity) {
              templateEntity = parsed.entity;
            }

            // Extract visibility
            if (parsed.visible !== undefined) {
              templateVisible = parsed.visible;
            }

            // Extract overlay properties
            if (parsed.overlay_text) {
              templateOverlayText = parsed.overlay_text;
            }
            if (parsed.overlay_color) {
              templateOverlayColor = parsed.overlay_color;
            }
          }
        }
      }
    }

    // Handle visibility - if template says not visible, return empty
    if (templateVisible === false) {
      return html``;
    }

    // Get camera entity - use template entity if provided, otherwise use module entity
    let cameraEntity = templateEntity || cameraModule.entity;

    // Determine camera view mode based on view_mode setting
    const viewMode = cameraModule.view_mode || 'auto';
    let desiredCameraView: 'auto' | 'live';

    if (viewMode === 'live') {
      // Always live streaming
      desiredCameraView = 'live';
    } else {
      // 'auto' or 'snapshot' both use 'auto' for hui-image (snapshot with tap-to-live capability)
      desiredCameraView = 'auto';
    }

    // When editor is open, keep live but serialize updates to avoid overlapping negotiations
    // We render using last applied props and schedule a debounced apply for desired props
    if ((this as any)._isEditorOpen()) {
      const effectiveEntity = this._lastAppliedEntity ?? cameraEntity;
      const effectiveCameraView = this._lastAppliedLive ?? desiredCameraView === 'live';
      // Schedule an atomic update to desired props (200ms debounce)
      if (cameraEntity) {
        (this as any)._scheduleCameraUpdate(
          cameraEntity,
          desiredCameraView === 'live',
          cameraModule,
          hass
        );
      }
      cameraEntity = effectiveEntity || '';
      // Note: We will pass desired camera view to hui-image below via effectiveCameraView
      // but we also record it to avoid churn
      this._lastAppliedLive = effectiveCameraView;
    } else {
      // Outside editor: apply immediately
      // Validate the entity before applying to avoid renegotiation on bad values
      const isValid = cameraEntity ? (this as any)._isValidCameraEntity(hass, cameraEntity) : false;
      this._lastAppliedEntity = isValid ? cameraEntity : this._lastAppliedEntity;
      this._lastAppliedLive = desiredCameraView === 'live';
    }

    const entity = cameraEntity ? hass.states[cameraEntity] : null;
    const isUnavailable = !entity || entity.state === 'unavailable';

    // CRITICAL FIX: Prevent WebRTC re-initialization when template is being edited
    // Only re-render camera if the evaluated entity actually changed
    // Store stable keys in instance Map to avoid "object is not extensible" errors
    // Include audio_enabled in key to ensure audio updates trigger re-render when needed
    const audioEnabled = this._isAudioActive(cameraModule);
    let stableKey: string;
    if (cameraModule.template_mode && cameraEntity === this._lastRenderedEntity && cameraEntity) {
      // Same entity - use stable key to prevent Lit from recreating hui-image
      // This prevents WebRTC SDP errors during template editing
      // But include audio state to allow audio changes to update
      stableKey = `camera_${cameraModule.id}_${cameraEntity}_audio_${audioEnabled}`;
    } else {
      // Entity changed - allow re-render and update cache
      this._lastRenderedEntity = cameraEntity;
      stableKey = `camera_${cameraModule.id}_${cameraEntity || 'none'}_audio_${audioEnabled}_${Date.now()}`;
    }
    // Store the stable key for this module
    this._cameraStableKeys.set(cameraModule.id, stableKey);

    // Get camera name - use template overlay text if provided
    const cameraName =
      templateOverlayText ||
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

    // Get dimensions - prioritize global design properties over module properties
    const hasGlobalWidth = designProperties.width && designProperties.width !== '';
    const hasGlobalHeight = designProperties.height && designProperties.height !== '';

    // Use fallback pixel dimensions only when no global design dimensions are set
    const fallbackWidth = cameraModule.width || 320;
    const fallbackHeight = cameraModule.height || 180;

    // For cropping calculations, we need pixel values - convert or use fallbacks
    const originalWidth = hasGlobalWidth ? fallbackWidth : fallbackWidth; // Use fallback for crop calculations
    const originalHeight = hasGlobalHeight ? fallbackHeight : fallbackHeight; // Use fallback for crop calculations

    // Reduce container size based on crop percentages (only affects fallback sizing)
    const croppedWidth = (originalWidth * (100 - cropLeft - cropRight)) / 100;
    const croppedHeight = (originalHeight * (100 - cropTop - cropBottom)) / 100;

    // Calculate image positioning to show the correct portion (only when cropping is applied)
    const hasCropping = cropLeft > 0 || cropRight > 0 || cropTop > 0 || cropBottom > 0;
    const imageOffsetX = hasCropping ? -((originalWidth * cropLeft) / 100) : 0;
    const imageOffsetY = hasCropping ? -((originalHeight * cropTop) / 100) : 0;

    // Build rotation transform
    const rotation = cameraModule.rotation || 0;
    const rotationCSS = rotation !== 0 ? `rotate(${rotation}deg)` : '';

    // Camera image styles - responsive when no cropping, positioned when cropping
    const imageStyles = {
      objectFit: 'cover',
      width: hasCropping ? `${originalWidth}px` : '100%', // Responsive unless cropping
      height: hasCropping ? `${originalHeight}px` : '100%', // Responsive unless cropping
      display: 'block',
      position: hasCropping ? 'absolute' : 'static', // Only absolute positioning when cropping
      left: hasCropping ? `${imageOffsetX}px` : 'auto', // Offset only when cropping
      top: hasCropping ? `${imageOffsetY}px` : 'auto', // Offset only when cropping
      transform: rotationCSS,
      transition: 'all 0.3s ease',
      borderRadius: designProperties.border_radius || '0px', // Match container border radius
    };

    // Container styling - prioritize global design properties completely
    const containerImageStyles = {
      width:
        designProperties.width || (hasGlobalWidth ? '100%' : `${Math.max(50, croppedWidth)}px`),
      height:
        designProperties.height || (hasGlobalHeight ? 'auto' : `${Math.max(50, croppedHeight)}px`),
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
      designProperties,
      templateOverlayColor
    );

    // Camera content
    const isDashboardView = previewContext === 'dashboard';
    const isLiveMode = (cameraModule.view_mode || 'auto') === 'live';

    const handleUserInteraction = (event: Event) => {
      // Only handle audio in live mode
      if (!isLiveMode) {
        return;
      }

      const isAudioActive = this._isAudioActive(cameraModule, isDashboardView);
      if (!isAudioActive) {
        return;
      }

      const container =
        (event.currentTarget as HTMLElement) ||
        (event.target as HTMLElement).closest('.camera-image-container');
      const huiImage = container?.querySelector('hui-image') as any;

      if (huiImage) {
        this._ensureAudioState(huiImage, cameraModule, isAudioActive);
      }
    };

    // Audio is active in live mode only (not auto mode in preview)
    const audioActive = isLiveMode ? this._isAudioActive(cameraModule, isDashboardView) : false;

    const cameraContent = html`
      <div
        class="camera-module-container"
        data-uc-camera-id="${cameraModule.id}"
        style=${this.styleObjectToCss(containerStyles)}
      >
        <div
          class="camera-image-container"
          style=${this.styleObjectToCss(containerImageStyles)}
          @click=${handleUserInteraction}
          @touchstart=${handleUserInteraction}
        >
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
              ? cache(html`
                  <!-- Use HA's native camera image component - same as picture-glance card -->
                  <!-- Cache directive prevents WebRTC re-initialization during template editing -->
                  <hui-image
                    ${ref(this._huiImageRef)}
                    data-camera-key=${this._cameraStableKeys.get(cameraModule.id) || cameraEntity}
                    .hass=${hass}
                    .cameraImage=${cameraEntity}
                    .cameraView=${this._lastAppliedLive ? 'live' : 'auto'}
                    .muted=${!audioActive}
                    style=${this.styleObjectToCss(imageStyles)}
                    class="camera-image"
                    @error=${() => {}}
                    @load=${(e: Event) => {
                      // Reposition overlays to video area after image loads
                      const imageElement = e.target as HTMLElement;
                      const container = imageElement.closest(
                        '.camera-image-container'
                      ) as HTMLElement;
                      if (container) {
                        const nameOverlay = container.querySelector(
                          '.camera-name-overlay'
                        ) as HTMLElement;
                        const fullscreenIcon = container.querySelector(
                          '.camera-fullscreen-icon'
                        ) as HTMLElement;

                        // Use setTimeout to ensure DOM is updated
                        setTimeout(() => {
                          this.repositionPreviewOverlays(
                            imageElement,
                            nameOverlay,
                            fullscreenIcon,
                            container
                          );
                        }, 100);
                      }

                      // Ensure audio is properly enabled/disabled on the video element (only in live mode)
                      if (isLiveMode) {
                        this._ensureAudioState(e.target as any, cameraModule, audioActive);
                      }

                      // Setup snapshot refresh timer for snapshot mode
                      if ((cameraModule.view_mode || 'auto') === 'snapshot') {
                        this._setupSnapshotRefresh(cameraModule, cameraEntity || '', hass);
                      } else {
                        // Clear any existing timer when not in snapshot mode
                        this._clearSnapshotRefresh(cameraModule.id);
                      }
                    }}
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
                `)
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

    // LENIENT VALIDATION: Allow empty entity/template - UI will show placeholder
    // Only validate for truly breaking errors

    // Refresh interval validation (only applies to 'snapshot' mode)
    // Auto and Live modes don't use manual refresh intervals
    if (cameraModule.view_mode === 'snapshot' && cameraModule.refresh_interval) {
      if (cameraModule.refresh_interval < 1 || cameraModule.refresh_interval > 300) {
        errors.push('Refresh interval must be between 1 and 300 seconds for snapshot mode');
      }
    }

    // Border radius validation (truly breaking if invalid)
    if (cameraModule.border_radius && isNaN(Number(cameraModule.border_radius))) {
      errors.push('Border radius must be a number');
    }

    // Rotation validation (truly breaking if out of range)
    if (cameraModule.rotation !== undefined && cameraModule.rotation !== null) {
      if (
        isNaN(Number(cameraModule.rotation)) ||
        cameraModule.rotation < 0 ||
        cameraModule.rotation > 360
      ) {
        errors.push('Rotation must be a number between 0 and 360 degrees');
      }
    }

    // Action validation (only if actions are configured)
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
  private handleClick(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    event.preventDefault();
    if (this.clickTimeout) clearTimeout(this.clickTimeout);

    this.clickTimeout = setTimeout(() => {
      this.handleTapAction(event, module, hass, config);
    }, 300);
  }

  private handleDoubleClick(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    event.preventDefault();
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
    this.handleDoubleAction(event, module, hass, config);
  }

  private handleMouseDown(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.isHolding = false;
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.handleHoldAction(event, module, hass, config);
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

  private handleTouchStart(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.handleMouseDown(event, module, hass, config);
  }

  private handleTouchEnd(event: Event, module: CameraModule, hass: HomeAssistant): void {
    this.handleMouseUp(event, module, hass);
  }

  private handleTapAction(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (this.isHolding) return;

    // Check if tap opens fullscreen is enabled
    if ((module as any).tap_opens_fullscreen === true) {
      this.handleFullscreenClick(event, module, config);
      return;
    }

    if (module.tap_action) {
      // For camera modules, default to more-info if action is 'default'
      const action =
        module.tap_action.action === 'default'
          ? { action: 'more-info', entity: module.entity }
          : module.tap_action;
      UltraLinkComponent.handleAction(
        action as any,
        hass,
        event.target as HTMLElement,
        config,
        module.entity,
        module
      );
    } else if (module.entity) {
      // Default action for cameras: show more-info
      UltraLinkComponent.handleAction(
        { action: 'more-info', entity: module.entity } as any,
        hass,
        event.target as HTMLElement,
        config,
        module.entity,
        module
      );
    }
  }

  private handleHoldAction(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (module.hold_action && module.hold_action.action !== 'nothing') {
      UltraLinkComponent.handleAction(
        module.hold_action as any,
        hass,
        event.target as HTMLElement,
        config,
        module.entity,
        module
      );
    }
  }

  private handleDoubleAction(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (module.double_tap_action && module.double_tap_action.action !== 'nothing') {
      UltraLinkComponent.handleAction(
        module.double_tap_action as any,
        hass,
        event.target as HTMLElement,
        config,
        module.entity,
        module
      );
    }
  }

  // Fullscreen functionality
  private handleFullscreenClick(
    event: Event,
    module: CameraModule,
    config?: UltraCardConfig
  ): void {
    event.stopPropagation();
    event.preventDefault();

    // Trigger haptic feedback for fullscreen action
    const hapticEnabled = config?.haptic_feedback !== false;
    if (hapticEnabled) {
      import('custom-card-helpers').then(({ forwardHaptic }) => {
        forwardHaptic('medium'); // Use medium haptic for fullscreen action
      });
    }

    this.createFullscreenModal(module);
  }

  // Create a bulletproof fullscreen modal
  private createFullscreenModal(module: CameraModule): void {
    // Remove any existing fullscreen modals first
    const existingModals = document.querySelectorAll('[id^="ultra-camera-fullscreen-"]');
    existingModals.forEach(modal => modal.remove());

    // Get camera entity
    let cameraEntity = module.entity;
    if (module.template_mode && module.template) {
      try {
        const hass = (document.querySelector('home-assistant') as any)?.hass;
        if (hass) {
          const template = module.template;
          const entityMatch = template.match(/['"]([^'"]+)['"]/);
          if (entityMatch) {
            cameraEntity = entityMatch[1];
          }
        }
      } catch (e) {}
    }

    if (!cameraEntity) {
      alert('No camera entity available');
      return;
    }

    // Create unique ID
    const modalId = 'ultra-camera-fullscreen-' + Date.now();

    // Create modal elements directly (avoid innerHTML inert issues)
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0,0,0,0.95) !important;
      z-index: ${Z_INDEX.CAMERA_FULLSCREEN_OVERLAY} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(10px) !important;
      touch-action: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -webkit-touch-callout: none !important;
    `;

    const cameraWrapper = document.createElement('div');
    cameraWrapper.style.cssText = `
      position: relative !important;
      width: 100vw !important;
      height: 100vh !important;
      overflow: hidden !important;
      background: black !important;
    `;

    const cameraContainer = document.createElement('div');
    cameraContainer.id = modalId + '-camera-container';
    cameraContainer.style.cssText = `
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 300px !important;
      touch-action: none !important;
      user-select: none !important;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      position: absolute !important;
      top: 20px !important;
      right: 20px !important;
      width: 50px !important;
      height: 50px !important;
      border: 3px solid rgba(255,255,255,0.7) !important;
      background: rgba(0,0,0,0.8) !important;
      color: white !important;
      font-size: 30px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
      backdrop-filter: blur(4px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
      font-family: Arial, sans-serif !important;
      line-height: 1 !important;
      transition: all 0.2s ease !important;
    `;

    // Add camera name if enabled
    if (module.show_name !== false) {
      const nameDiv = document.createElement('div');
      nameDiv.style.cssText = `
        position: absolute !important;
        top: 20px !important;
        left: 20px !important;
        padding: 10px 16px !important;
        background: rgba(0,0,0,0.8) !important;
        color: white !important;
        border-radius: 8px !important;
        font-size: 16px !important;
        font-weight: 500 !important;
        backdrop-filter: blur(4px) !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
      `;
      nameDiv.textContent = module.camera_name || cameraEntity;
      cameraWrapper.appendChild(nameDiv);
    }

    // Assemble modal
    cameraWrapper.appendChild(cameraContainer);
    cameraWrapper.appendChild(closeButton);
    modal.appendChild(cameraWrapper);
    document.body.appendChild(modal);

    // Add event handlers and prevent inert attribute
    const closeModal = () => {
      // Restore viewport settings
      const restoreViewport = (modal as any)._restoreViewport;
      if (restoreViewport) {
        restoreViewport();
      }

      modal.remove();
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };

    // Force remove inert attribute and add event handlers
    const setupInteractions = () => {
      modal.removeAttribute('inert');
      closeButton.removeAttribute('inert');

      // Force pointer events
      modal.style.pointerEvents = 'auto';
      closeButton.style.pointerEvents = 'auto';

      // Add click handlers with capture phase
      closeButton.addEventListener(
        'click',
        e => {
          e.stopPropagation();
          e.preventDefault();
          console.log('X button clicked');
          closeModal();
        },
        true
      );

      modal.addEventListener(
        'click',
        e => {
          console.log('Modal clicked', e.target === modal);
          if (e.target === modal) {
            e.stopPropagation();
            e.preventDefault();
            closeModal();
          }
        },
        true
      );
    };

    // Setup interactions immediately and also after a delay
    setupInteractions();
    setTimeout(setupInteractions, 100);

    // Monitor for inert attribute being added and remove it
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'inert') {
          const target = mutation.target as HTMLElement;
          if (target === modal || target === closeButton) {
            target.removeAttribute('inert');
            target.style.pointerEvents = 'auto';
          }
        }
      });
    });

    observer.observe(modal, { attributes: true });
    observer.observe(closeButton, { attributes: true });

    // Insert camera into the container
    setTimeout(() => {
      const modal = document.getElementById(modalId);
      const cameraContainer = document.getElementById(modalId + '-camera-container');

      if (modal && cameraContainer) {
        const hass = (document.querySelector('home-assistant') as any)?.hass;
        const isLiveMode = (module.view_mode || 'auto') === 'live';
        // In fullscreen, enable audio if audio_enabled is true (for both auto and live modes)
        const fullscreenAudioActive = module.audio_enabled === true;

        if (hass) {
          // Create hui-image element
          const huiImage = document.createElement('hui-image');
          // Add stable identifier to prevent WebRTC re-initialization
          huiImage.setAttribute('data-camera-fullscreen', cameraEntity || '');
          (huiImage as any).hass = hass;
          (huiImage as any).cameraImage = cameraEntity;
          // Fullscreen always upgrades to live for best quality
          (huiImage as any).cameraView = 'live';
          (huiImage as any).muted = !fullscreenAudioActive;

          // Ensure audio state is applied after element is added to DOM
          huiImage.addEventListener('load', () => {
            (this as any)._ensureAudioState(huiImage, module, fullscreenAudioActive);
          });

          // Also try after a delay to catch video element creation
          setTimeout(() => {
            (this as any)._ensureAudioState(huiImage, module, fullscreenAudioActive);
          }, 200);

          huiImage.style.cssText = `
            width: 100vw !important;
            height: 100vh !important;
            display: block !important;
            object-fit: contain !important;
            transition: transform 0.2s ease !important;
            cursor: grab !important;
            touch-action: none !important;
          `;

          cameraContainer.innerHTML = '';
          cameraContainer.appendChild(huiImage);

          // Add pinch-to-zoom functionality
          this.addPinchZoomToCamera(huiImage, cameraContainer);
        } else {
          // Fallback to img if no hass
          const fallbackImg = document.createElement('img');
          fallbackImg.src = `/api/camera_proxy/${cameraEntity}?t=${Date.now()}`;
          fallbackImg.style.cssText = `
            width: 100vw !important;
            height: 100vh !important;
            display: block !important;
            object-fit: contain !important;
            cursor: grab !important;
            touch-action: none !important;
          `;

          cameraContainer.innerHTML = '';
          cameraContainer.appendChild(fallbackImg);

          // Add pinch-to-zoom to fallback image too
          this.addPinchZoomToCamera(fallbackImg, cameraContainer);
        }
      }
    }, 50);

    // Add ESC key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll and browser zoom
    document.body.style.overflow = 'hidden';

    // Temporarily disable browser zoom by overriding viewport
    const originalViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    const originalContent = originalViewport?.content || '';

    if (originalViewport) {
      originalViewport.content =
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    // Restore viewport when modal is removed
    const restoreViewport = () => {
      if (originalViewport) {
        originalViewport.content = originalContent;
      }
    };

    // Store restore function for cleanup
    (modal as any)._restoreViewport = restoreViewport;
  }

  // Add pinch-to-zoom and pan functionality to camera
  private addPinchZoomToCamera(cameraElement: HTMLElement, container: HTMLElement): void {
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let lastDistance = 0;
    let isPinching = false;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;

    // Apply transform with translate and scale
    const applyTransform = () => {
      cameraElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      cameraElement.style.transformOrigin = 'center center';
      cameraElement.style.transition = isPinching || isDragging ? 'none' : 'transform 0.2s ease';
    };

    // Reset transform
    const resetTransform = () => {
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform();
      cameraElement.style.cursor = 'default';
    };

    // Get distance between two touches
    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Prevent default touch behaviors that interfere with pinch
    container.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    container.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // Calculate pan boundaries to keep image in view
    const getPanLimits = () => {
      const rect = cameraElement.getBoundingClientRect();
      const scaledWidth = rect.width * scale;
      const scaledHeight = rect.height * scale;
      const maxX = Math.max(0, (scaledWidth - window.innerWidth) / 2);
      const maxY = Math.max(0, (scaledHeight - window.innerHeight) / 2);
      return { maxX, maxY };
    };

    // Constrain pan within reasonable bounds
    const constrainPan = () => {
      if (scale > 1) {
        const { maxX, maxY } = getPanLimits();
        translateX = Math.max(-maxX, Math.min(maxX, translateX));
        translateY = Math.max(-maxY, Math.min(maxY, translateY));
      }
    };

    // Touch start handler - detect pinch or pan start
    cameraElement.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 2) {
          // Start pinch
          e.preventDefault();
          e.stopPropagation();
          isPinching = true;
          lastDistance = getDistance(e.touches[0], e.touches[1]);
        } else if (e.touches.length === 1 && scale > 1) {
          // Start pan (only when zoomed)
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        }
      },
      { passive: false }
    );

    // Touch move handler - handle both pinch zoom and pan
    cameraElement.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (isPinching && e.touches.length === 2) {
          // Handle pinch zoom - smooth and responsive
          e.preventDefault();
          e.stopPropagation();

          const currentDistance = getDistance(e.touches[0], e.touches[1]);

          if (lastDistance > 0) {
            // Direct proportional scaling - smooth continuous zoom
            const scaleChange = currentDistance / lastDistance;
            scale *= scaleChange;

            // Constrain scale between 1 and 6 (no snapping during pinch!)
            scale = Math.max(1, Math.min(6, scale));

            // Constrain pan if zoomed in
            if (scale > 1) {
              constrainPan();
            }

            applyTransform();
          }

          lastDistance = currentDistance;
        } else if (e.touches.length === 1 && scale > 1) {
          // Handle pan when zoomed in (any zoom level > 1)
          e.preventDefault();
          const deltaX = e.touches[0].clientX - lastTouchX;
          const deltaY = e.touches[0].clientY - lastTouchY;

          translateX += deltaX;
          translateY += deltaY;

          constrainPan();
          applyTransform();

          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        }
      },
      { passive: false }
    );

    // Touch end handler
    cameraElement.addEventListener('touchend', (e: TouchEvent) => {
      if (e.touches.length === 0) {
        isPinching = false;

        // Snap to 1.0 and reset pan if very close to prevent black screen
        if (scale < 1.02) {
          scale = 1;
          translateX = 0;
          translateY = 0;
        }

        applyTransform();
        cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
      } else if (e.touches.length === 1 && isPinching) {
        isPinching = false;

        // Snap to 1.0 and reset pan if very close
        if (scale < 1.02) {
          scale = 1;
          translateX = 0;
          translateY = 0;
        }

        applyTransform();
      }
    });

    // Handle touch cancel (important for mobile browsers)
    cameraElement.addEventListener('touchcancel', () => {
      isPinching = false;

      // Snap to 1.0 and reset pan if very close to prevent black screen
      if (scale < 1.02) {
        scale = 1;
        translateX = 0;
        translateY = 0;
      }

      applyTransform();
      cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
    });

    // Mouse drag handlers for desktop panning
    cameraElement.addEventListener('mousedown', (e: MouseEvent) => {
      if (scale > 1) {
        e.preventDefault();
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        cameraElement.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (isDragging && scale > 1) {
        e.preventDefault();
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;

        translateX += deltaX;
        translateY += deltaY;

        constrainPan();
        applyTransform();

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;

        // Snap to 1.0 if very close when mouse released
        if (scale < 1.02) {
          scale = 1;
          translateX = 0;
          translateY = 0;
          applyTransform();
        }

        cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
      }
    });

    // Mouse wheel zoom for desktop - improved responsiveness
    cameraElement.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();

        const zoomSpeed = 0.15; // Increased from 0.1 for faster zoom
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;

        scale = Math.max(1, Math.min(6, scale + delta));

        // Snap to 1.0 if very close (within 2%) and reset pan
        if (scale < 1.02) {
          scale = 1;
          translateX = 0;
          translateY = 0;
        } else if (scale > 1) {
          // Only constrain pan if we're actually zoomed in
          constrainPan();
        }

        applyTransform();
        cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
      },
      { passive: false }
    );

    // Double tap to zoom in/out toggle
    let lastTap = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    cameraElement.addEventListener('touchend', (e: TouchEvent) => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;

      if (tapLength < 300 && tapLength > 0 && e.touches.length === 0) {
        // Double tap detected
        if (scale > 1) {
          // Already zoomed - reset to normal
          resetTransform();
        } else {
          // Not zoomed - zoom in to 2.5x at tap location
          const touch = e.changedTouches[0];
          const rect = cameraElement.getBoundingClientRect();

          // Calculate tap position relative to image center
          const tapX = touch.clientX - rect.left - rect.width / 2;
          const tapY = touch.clientY - rect.top - rect.height / 2;

          // Zoom to 2.5x
          scale = 2.5;

          // Center the zoom on the tap location
          // The tap point should remain in the same screen position after zoom
          translateX = -tapX * (scale - 1);
          translateY = -tapY * (scale - 1);

          constrainPan();
          applyTransform();
          cameraElement.style.cursor = 'grab';
        }
      }

      // Store tap location for next time
      if (e.changedTouches.length > 0) {
        lastTapX = e.changedTouches[0].clientX;
        lastTapY = e.changedTouches[0].clientY;
      }

      lastTap = currentTime;
    });
  }

  // Legacy methods - keeping for fallback compatibility
  private trySimpleModal(container: HTMLElement, module: CameraModule): boolean {
    try {
      // Get camera entity first
      let cameraEntity = module.entity;
      if (module.template_mode && module.template) {
        try {
          const hass = (document.querySelector('home-assistant') as any)?.hass;
          if (hass) {
            const template = module.template;
            const entityMatch = template.match(/['"]([^'"]+)['"]/);
            if (entityMatch) {
              cameraEntity = entityMatch[1];
            }
          }
        } catch (e) {}
      }

      if (!cameraEntity) return false;

      // Create modal with simple innerHTML approach
      const modalId = 'camera-fullscreen-' + Date.now();
      const cameraName = module.camera_name || cameraEntity;

      const modalHTML = `
        <div id="${modalId}" style="
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0,0,0,0.95) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
          backdrop-filter: blur(10px) !important;
        " onclick="if(event.target === this) this.remove()">
          <div style="
            position: relative !important;
            max-width: 95vw !important;
            max-height: 95vh !important;
            background: black !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
          ">
            <img src="/api/camera_proxy/${cameraEntity}?t=${Date.now()}" style="
              max-width: 95vw !important;
              max-height: 95vh !important;
              width: auto !important;
              height: auto !important;
              display: block !important;
              object-fit: contain !important;
              border-radius: 12px !important;
            " />
            <button onclick="document.getElementById('${modalId}').remove()" style="
              position: absolute !important;
              top: 16px !important;
              right: 16px !important;
              width: 48px !important;
              height: 48px !important;
              border: 2px solid rgba(255,255,255,0.5) !important;
              background: rgba(0,0,0,0.8) !important;
              color: white !important;
              font-size: 28px !important;
              cursor: pointer !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
              backdrop-filter: blur(4px) !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
              font-family: monospace !important;
              line-height: 1 !important;
            " onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(0,0,0,0.8)'; this.style.transform='scale(1)'">
              ✕
            </button>
            ${
              module.show_name !== false
                ? `
              <div style="
                position: absolute !important;
                top: 16px !important;
                left: 16px !important;
                padding: 8px 16px !important;
                background: rgba(0,0,0,0.7) !important;
                color: white !important;
                border-radius: 6px !important;
                font-size: 16px !important;
                font-weight: 500 !important;
                backdrop-filter: blur(4px) !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
                z-index: 10 !important;
              ">
                ${cameraName}
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;

      // Insert modal
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // Add ESC handler
      const escHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
          }
        }
      };
      document.addEventListener('keydown', escHandler);

      return true;
    } catch (error) {
      console.warn('Simple modal failed:', error);
      return false;
    }
  }

  // Try to use native browser fullscreen API
  private tryNativeFullscreen(container: HTMLElement, module: CameraModule): boolean {
    try {
      // Create a fullscreen wrapper
      const fullscreenWrapper = document.createElement('div');
      fullscreenWrapper.style.cssText = `
        width: 100vw;
        height: 100vh;
        background: black;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      `;

      // Clone the camera content
      const cameraClone = container.cloneNode(true) as HTMLElement;
      cameraClone.style.cssText = `
        max-width: 100vw;
        max-height: 100vh;
        width: auto;
        height: auto;
        object-fit: contain;
      `;

      // Add exit button for native fullscreen
      const exitButton = document.createElement('button');
      exitButton.innerHTML = '✕';
      exitButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: ${Z_INDEX.DIALOG_CONTENT};
      `;

      exitButton.onclick = () => {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      };

      fullscreenWrapper.appendChild(cameraClone);
      fullscreenWrapper.appendChild(exitButton);
      document.body.appendChild(fullscreenWrapper);

      // Request fullscreen
      const requestFullscreen =
        fullscreenWrapper.requestFullscreen ||
        (fullscreenWrapper as any).webkitRequestFullscreen ||
        (fullscreenWrapper as any).mozRequestFullScreen ||
        (fullscreenWrapper as any).msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(fullscreenWrapper);

        // Clean up when fullscreen exits
        const cleanup = () => {
          if (fullscreenWrapper.parentNode) {
            fullscreenWrapper.parentNode.removeChild(fullscreenWrapper);
          }
          document.removeEventListener('fullscreenchange', cleanup);
          document.removeEventListener('webkitfullscreenchange', cleanup);
          document.removeEventListener('mozfullscreenchange', cleanup);
          document.removeEventListener('MSFullscreenChange', cleanup);
        };

        document.addEventListener('fullscreenchange', cleanup);
        document.addEventListener('webkitfullscreenchange', cleanup);
        document.addEventListener('mozfullscreenchange', cleanup);
        document.addEventListener('MSFullscreenChange', cleanup);

        return true;
      }
    } catch (error) {
      console.warn('Native fullscreen failed:', error);
    }
    return false;
  }

  private enterFullscreen(container: HTMLElement, module: CameraModule): void {
    // Create fullscreen overlay
    const fullscreenOverlay = document.createElement('div');
    fullscreenOverlay.className = 'camera-fullscreen-overlay';
    fullscreenOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT};
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.3s ease;
      pointer-events: auto;
    `;

    // Create a fresh camera container instead of cloning problematic elements
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'camera-fullscreen-container';
    fullscreenContainer.style.cssText = `
      max-width: 95vw;
      max-height: 95vh;
      width: auto;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      position: relative;
      animation: scaleIn 0.3s ease;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    `;

    // Get the camera entity
    let cameraEntity = module.entity;

    // Handle template mode (same logic as preview)
    if (module.template_mode && module.template) {
      try {
        const hass = (document.querySelector('home-assistant') as any)?.hass;
        if (hass) {
          let evaluatedTemplate = module.template;

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

          // Simple if-else evaluation
          const ifElseMatch = evaluatedTemplate.match(
            /['"]([^'"]+)['"] if (.+?) else ['"]([^'"]+)['"]/
          );
          if (ifElseMatch) {
            const [, trueEntity, condition, falseEntity] = ifElseMatch;
            const conditionResult = condition.includes('True');
            cameraEntity = conditionResult ? trueEntity : falseEntity;
          } else {
            const entityMatch = evaluatedTemplate.match(/['"]([^'"]+)['"]/);
            if (entityMatch) {
              cameraEntity = entityMatch[1];
            }
          }
        }
      } catch (error) {
        console.error('Template evaluation error:', error);
        cameraEntity = module.entity;
      }
    }

    // Create the camera image element directly
    if (cameraEntity) {
      const hass = (document.querySelector('home-assistant') as any)?.hass;

      if (hass) {
        const cameraImg = document.createElement('hui-image');
        (cameraImg as any).hass = hass;
        (cameraImg as any).cameraImage = cameraEntity;
        (cameraImg as any).cameraView = module.live_view ? 'live' : 'auto';
        // In fullscreen, enable audio if audio_enabled is true (for both auto and live modes)
        const fullscreenAudioActive = module.audio_enabled === true;
        (cameraImg as any).muted = !fullscreenAudioActive;

        // Ensure audio state is applied after element is added to DOM
        cameraImg.addEventListener('load', () => {
          (this as any)._ensureAudioState(cameraImg, module, fullscreenAudioActive);
        });

        // Also try after a delay to catch video element creation
        setTimeout(() => {
          (this as any)._ensureAudioState(cameraImg, module, fullscreenAudioActive);
        }, 200);

        cameraImg.style.cssText = `
          width: 100%;
          height: 100%;
          max-width: 95vw;
          max-height: 95vh;
          object-fit: contain;
          border-radius: 12px;
          pointer-events: auto;
        `;

        fullscreenContainer.appendChild(cameraImg);

        // Add camera name overlay if enabled - positioned within actual video area
        if (module.show_name !== false) {
          const cameraName =
            module.camera_name ||
            hass.states[cameraEntity]?.attributes?.friendly_name ||
            cameraEntity;
          const nameOverlay = document.createElement('div');
          nameOverlay.className = 'camera-name-overlay-fullscreen';
          nameOverlay.style.cssText = `
              position: absolute;
              top: 16px;
              left: 16px;
              padding: 8px 16px;
              background: rgba(0, 0, 0, 0.7);
              color: white;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 500;
              backdrop-filter: blur(4px);
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
              z-index: 10;
            `;
          nameOverlay.textContent = cameraName;

          // Wait for image to load to get actual dimensions and reposition
          cameraImg.addEventListener('load', () => {
            this.repositionOverlaysToVideoArea(cameraImg, nameOverlay, fullscreenContainer);
          });

          fullscreenContainer.appendChild(nameOverlay);
        }
      } else {
        // No hass available - show error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: white;
          font-size: 20px;
          text-align: center;
          padding: 40px;
        `;
        errorDiv.innerHTML = `
          <ha-icon icon="mdi:camera-off" style="font-size: 64px; margin-bottom: 16px;"></ha-icon>
          <div>Home Assistant not available</div>
        `;
        fullscreenContainer.appendChild(errorDiv);
      }
    } else {
      // No camera entity - show no camera message
      const noCameraDiv = document.createElement('div');
      noCameraDiv.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: white;
        font-size: 20px;
        text-align: center;
        padding: 40px;
      `;
      noCameraDiv.innerHTML = `
        <ha-icon icon="mdi:camera-off" style="font-size: 64px; margin-bottom: 16px;"></ha-icon>
        <div>No Camera Available</div>
      `;
      fullscreenContainer.appendChild(noCameraDiv);
    }

    // Add minimize button (X icon in top-right) - clean white icon style
    const minimizeButton = document.createElement('div');
    minimizeButton.className = 'camera-minimize-icon';
    minimizeButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 6px;
      background: transparent;
      color: white;
      font-size: 32px;
      cursor: pointer;
      z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
      pointer-events: auto;
    `;
    minimizeButton.innerHTML = '<ha-icon icon="mdi:close" style="pointer-events: none;"></ha-icon>';
    minimizeButton.title = 'Exit fullscreen';

    // Add hover effects - clean white icon style
    minimizeButton.addEventListener('mouseenter', () => {
      minimizeButton.style.transform = 'scale(1.15)';
      minimizeButton.style.textShadow = '0 1px 4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.7)';
      minimizeButton.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))';
    });

    minimizeButton.addEventListener('mouseleave', () => {
      minimizeButton.style.transform = 'scale(1)';
      minimizeButton.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)';
      minimizeButton.style.filter = 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))';
    });

    // Add click handler for minimize
    minimizeButton.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      this.exitFullscreen(fullscreenOverlay);
    });

    // Add ESC key handler
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.exitFullscreen(fullscreenOverlay);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Click outside to close - simplified approach
    fullscreenOverlay.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      // If we clicked directly on the overlay (not on the camera or buttons)
      if (target === fullscreenOverlay) {
        this.exitFullscreen(fullscreenOverlay);
        document.removeEventListener('keydown', escHandler);
      }
    });

    // Assemble and show - add overlay first, then button directly to body
    fullscreenOverlay.appendChild(fullscreenContainer);
    document.body.appendChild(fullscreenOverlay);
    document.body.appendChild(minimizeButton); // Add button directly to body for highest z-index

    // Prevent body scroll and disable HA context menus during fullscreen
    document.body.style.overflow = 'hidden';

    // Temporarily disable right-click context menus
    const disableContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    document.addEventListener('contextmenu', disableContextMenu, true);

    // Add class to body to help with CSS overrides
    document.body.classList.add('camera-fullscreen-active');

    // Store reference for cleanup
    (fullscreenOverlay as any)._escHandler = escHandler;
    (fullscreenOverlay as any)._minimizeButton = minimizeButton;
    (fullscreenOverlay as any)._contextMenuHandler = disableContextMenu;
  }

  private exitFullscreen(overlay: HTMLElement): void {
    // Restore body scroll and remove fullscreen class
    document.body.style.overflow = '';
    document.body.classList.remove('camera-fullscreen-active');

    // Clean up event listeners
    const escHandler = (overlay as any)._escHandler;
    if (escHandler) {
      document.removeEventListener('keydown', escHandler);
    }

    // Re-enable context menus
    const contextMenuHandler = (overlay as any)._contextMenuHandler;
    if (contextMenuHandler) {
      document.removeEventListener('contextmenu', contextMenuHandler, true);
    }

    // Remove minimize button immediately
    const minimizeButton = (overlay as any)._minimizeButton;
    if (minimizeButton && minimizeButton.parentNode) {
      minimizeButton.parentNode.removeChild(minimizeButton);
    }

    // Animate out
    overlay.style.animation = 'fadeOut 0.2s ease';

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 200);
  }

  // Reposition overlays in preview mode to stay within the actual video area
  private repositionPreviewOverlays(
    imageElement: HTMLElement,
    nameOverlay: HTMLElement | null,
    fullscreenIcon: HTMLElement | null,
    container: HTMLElement
  ): void {
    try {
      const containerRect = container.getBoundingClientRect();

      // Get the actual video dimensions from the image element
      const img = imageElement.querySelector('img') || imageElement;
      if (!img || !(img as HTMLImageElement).naturalWidth) return;

      const naturalWidth = (img as HTMLImageElement).naturalWidth;
      const naturalHeight = (img as HTMLImageElement).naturalHeight;
      const videoAspect = naturalWidth / naturalHeight;
      const containerAspect = containerRect.width / containerRect.height;

      let actualVideoWidth = containerRect.width;
      let actualVideoHeight = containerRect.height;
      let videoOffsetX = 0;
      let videoOffsetY = 0;

      if (videoAspect > containerAspect) {
        // Video is wider - letterboxing (black bars top/bottom)
        actualVideoHeight = containerRect.width / videoAspect;
        videoOffsetY = (containerRect.height - actualVideoHeight) / 2;
      } else if (videoAspect < containerAspect) {
        // Video is taller - pillarboxing (black bars left/right)
        actualVideoWidth = containerRect.height * videoAspect;
        videoOffsetX = (containerRect.width - actualVideoWidth) / 2;
      }

      // Only reposition if there's significant letterboxing/pillarboxing (more than 5px in preview)
      if (videoOffsetX > 5 || videoOffsetY > 5) {
        const minOffset = 8; // Minimum distance from video edge

        // Reposition name overlay
        if (nameOverlay) {
          this.repositionOverlayElement(
            nameOverlay,
            videoOffsetX,
            videoOffsetY,
            actualVideoWidth,
            actualVideoHeight,
            minOffset
          );
        }

        // Reposition fullscreen icon
        if (fullscreenIcon) {
          this.repositionOverlayElement(
            fullscreenIcon,
            videoOffsetX,
            videoOffsetY,
            actualVideoWidth,
            actualVideoHeight,
            minOffset
          );
        }
      }
    } catch (error) {
      // If calculation fails, keep default positioning
      console.warn('Failed to calculate video area for preview overlay positioning:', error);
    }
  }

  // Helper method to reposition individual overlay elements within video bounds
  private repositionOverlayElement(
    element: HTMLElement,
    videoOffsetX: number,
    videoOffsetY: number,
    videoWidth: number,
    videoHeight: number,
    minOffset: number
  ): void {
    const elementRect = element.getBoundingClientRect();
    const containerRect = element.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate maximum positions to keep element within video area
    const maxLeft = videoOffsetX + videoWidth - elementRect.width - minOffset;
    const maxTop = videoOffsetY + videoHeight - elementRect.height - minOffset;
    const maxRight = videoOffsetX + videoWidth - elementRect.width - minOffset;
    const maxBottom = videoOffsetY + videoHeight - elementRect.height - minOffset;

    // Adjust positioning based on current position, ensuring it stays within video bounds
    if (element.style.left && element.style.left !== '') {
      const currentLeft = parseInt(element.style.left);
      element.style.left = `${Math.min(Math.max(videoOffsetX + minOffset, currentLeft), maxLeft)}px`;
    }
    if (element.style.right && element.style.right !== '') {
      const currentRight = parseInt(element.style.right);
      element.style.right = `${Math.min(Math.max(videoOffsetX + minOffset, currentRight), maxRight)}px`;
    }
    if (element.style.top && element.style.top !== '') {
      const currentTop = parseInt(element.style.top);
      element.style.top = `${Math.min(Math.max(videoOffsetY + minOffset, currentTop), maxTop)}px`;
    }
    if (element.style.bottom && element.style.bottom !== '') {
      const currentBottom = parseInt(element.style.bottom);
      element.style.bottom = `${Math.min(Math.max(videoOffsetY + minOffset, currentBottom), maxBottom)}px`;
    }
  }

  // Reposition overlays to stay within the actual video area when using object-fit: contain
  private repositionOverlaysToVideoArea(
    imageElement: HTMLElement,
    nameOverlay: HTMLElement,
    container: HTMLElement
  ): void {
    try {
      const containerRect = container.getBoundingClientRect();
      const imageRect = imageElement.getBoundingClientRect();

      // Calculate if the image has letterboxing/pillarboxing due to object-fit: contain
      const containerAspect = containerRect.width / containerRect.height;

      // Get the actual video dimensions from the image element
      let actualVideoWidth = imageRect.width;
      let actualVideoHeight = imageRect.height;

      // For hui-image elements, try to get the actual video dimensions
      const img = imageElement.querySelector('img') || imageElement;
      if (img && (img as HTMLImageElement).naturalWidth) {
        const naturalWidth = (img as HTMLImageElement).naturalWidth;
        const naturalHeight = (img as HTMLImageElement).naturalHeight;
        const videoAspect = naturalWidth / naturalHeight;

        if (videoAspect > containerAspect) {
          // Video is wider - letterboxing (black bars top/bottom)
          actualVideoWidth = containerRect.width;
          actualVideoHeight = containerRect.width / videoAspect;
        } else {
          // Video is taller - pillarboxing (black bars left/right)
          actualVideoHeight = containerRect.height;
          actualVideoWidth = containerRect.height * videoAspect;
        }
      }

      // Calculate the offset to center the video within the container
      const videoOffsetX = (containerRect.width - actualVideoWidth) / 2;
      const videoOffsetY = (containerRect.height - actualVideoHeight) / 2;

      // Only reposition if there's significant letterboxing/pillarboxing (more than 20px)
      if (videoOffsetX > 20 || videoOffsetY > 20) {
        // Reposition name overlay to be within the actual video area
        nameOverlay.style.left = `${videoOffsetX + 16}px`;
        nameOverlay.style.top = `${videoOffsetY + 16}px`;

        // Also reposition any fullscreen icon if it exists in fullscreen mode
        const fullscreenIcon = container.querySelector('.camera-fullscreen-icon');
        if (fullscreenIcon) {
          const iconElement = fullscreenIcon as HTMLElement;
          // Position in top-right of actual video area
          iconElement.style.right = `${videoOffsetX + 16}px`;
          iconElement.style.top = `${videoOffsetY + 16}px`;
        }
      }
    } catch (error) {
      // If calculation fails, keep default positioning
      console.warn('Failed to calculate video area for overlay positioning:', error);
    }
  }

  // Dimension handling with aspect ratio linking (fallback dimensions only)
  private _handleDimensionChange(
    cameraModule: CameraModule,
    changedDimension: 'width' | 'height',
    newValue: number,
    updateModule: (updates: Partial<CameraModule>) => void
  ): void {
    const updates: Partial<CameraModule> = {};

    // Note: These are fallback pixel dimensions used when no global design dimensions are set
    // The camera will still be responsive by default via the global design system

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

  // Fullscreen icon positioning with global design integration
  private getFullscreenIconPositionStyles(
    position: string,
    moduleWithDesign: any,
    designProperties: any = {},
    namePosition?: string
  ): Record<string, string> {
    const baseStyles = {
      position: 'absolute',
      padding: '6px',
      background: 'transparent',
      color: 'white',
      fontSize: '22px',
      cursor: 'pointer',
      zIndex: '5', // Lower z-index to not interfere with dropdowns
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)',
      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))',
    };

    // Check for collision with camera name and adjust position if needed
    const adjustedPosition = this.getAdjustedPositionForCollision(position, namePosition);

    // Calculate offset if name and fullscreen are in same position (stack them)
    const hasNameInSamePosition = namePosition === position;
    const stackOffset = hasNameInSamePosition ? '40px' : '8px'; // Offset for stacking

    switch (adjustedPosition) {
      case 'top-left':
        return {
          ...baseStyles,
          top: hasNameInSamePosition ? stackOffset : '8px',
          left: '8px',
        };
      case 'top-middle':
        return {
          ...baseStyles,
          top: hasNameInSamePosition ? stackOffset : '8px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: hasNameInSamePosition ? stackOffset : '8px',
          right: '8px',
        };
      case 'center':
        return {
          ...baseStyles,
          top: hasNameInSamePosition ? 'calc(50% + 20px)' : '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: hasNameInSamePosition ? stackOffset : '8px',
          left: '8px',
        };
      case 'bottom-middle':
        return {
          ...baseStyles,
          bottom: hasNameInSamePosition ? stackOffset : '8px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: hasNameInSamePosition ? stackOffset : '8px',
          right: '8px',
        };
      default:
        return { ...baseStyles, top: '8px', right: '8px' };
    }
  }

  // Collision detection and adjustment - now returns original position to allow stacking
  private getAdjustedPositionForCollision(
    fullscreenPosition: string,
    namePosition?: string
  ): string {
    // Allow same position - we'll handle stacking in the positioning logic
    return fullscreenPosition;
  }

  // Camera name positioning with global design integration
  private getCameraNamePositionStyles(
    position: string,
    moduleWithDesign: any,
    designProperties: any = {},
    templateOverlayColor?: string
  ): Record<string, string> {
    // Base styles shared by all positions
    const baseStyles: Record<string, string> = {
      position: 'absolute',
      padding: '6px 12px', // Fixed padding for camera name overlay
      background: 'rgba(0, 0, 0, 0.7)', // Fixed background for camera name overlay
      color: templateOverlayColor || designProperties.color || this.getTextColor(moduleWithDesign),
      fontSize: designProperties.font_size
        ? typeof designProperties.font_size === 'number'
          ? `${designProperties.font_size}px`
          : designProperties.font_size
        : this.getTextSize(moduleWithDesign),
      fontWeight: designProperties.font_weight || this.getTextWeight(moduleWithDesign),
      fontFamily: designProperties.font_family || this.getTextFont(moduleWithDesign),
      borderRadius: '4px', // Fixed small border radius for camera name overlay
      zIndex: '0',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      textShadow: designProperties.text_shadow || '0 1px 2px rgba(0, 0, 0, 0.8)',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    };

    // Add optional style properties only if defined
    if (designProperties.text_transform) {
      baseStyles.textTransform = designProperties.text_transform;
    }
    if (designProperties.letter_spacing) {
      baseStyles.letterSpacing = designProperties.letter_spacing;
    }
    if (designProperties.line_height) {
      baseStyles.lineHeight = designProperties.line_height;
    }

    // Position-specific styles with appropriate maxWidth to prevent overflow
    switch (position) {
      case 'top-left':
        return {
          ...baseStyles,
          top: '8px',
          left: '8px',
          maxWidth: 'calc(100% - 16px)', // 8px margin on each side
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: '8px',
          right: '8px',
          maxWidth: 'calc(100% - 16px)', // 8px margin on each side
        };
      case 'top-middle':
        return {
          ...baseStyles,
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          maxWidth: 'calc(100% - 24px)', // Extra margin for centered positioning
        };
      case 'center':
        return {
          ...baseStyles,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          maxWidth: 'calc(100% - 24px)', // Extra margin for centered positioning
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: '8px',
          left: '8px',
          maxWidth: 'calc(100% - 16px)', // 8px margin on each side
        };
      case 'bottom-middle':
        return {
          ...baseStyles,
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          maxWidth: 'calc(100% - 24px)', // Extra margin for centered positioning
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: '8px',
          right: '8px',
          maxWidth: 'calc(100% - 16px)', // 8px margin on each side
        };
      default:
        return {
          ...baseStyles,
          top: '8px',
          left: '8px',
          maxWidth: 'calc(100% - 16px)',
        };
    }
  }

  // Simple string hash function for template keys
  private _hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Helper Methods
  private hasActiveLink(module: CameraModule): boolean {
    const hasTapAction = module.tap_action && module.tap_action.action !== 'nothing';
    const hasHoldAction = module.hold_action && module.hold_action.action !== 'nothing';
    const hasDoubleAction =
      module.double_tap_action && module.double_tap_action.action !== 'nothing';
    const hasFullscreenTap = (module as any).tap_opens_fullscreen === true;

    return hasTapAction || hasHoldAction || hasDoubleAction || hasFullscreenTap || !!module.entity; // Default tap for camera
  }

  private _isAudioActive(cameraModule: CameraModule, isDashboardView = false): boolean {
    if (this._audioOverrides.has(cameraModule.id)) {
      return this._audioOverrides.get(cameraModule.id)!;
    }
    if (isDashboardView) {
      return false;
    }
    return cameraModule.audio_enabled === true;
  }

  private _toggleDashboardAudio(event: Event, cameraModule: CameraModule): void {
    event.preventDefault();
    event.stopPropagation();

    // Only allow audio toggle in live mode
    if ((cameraModule.view_mode || 'auto') !== 'live') {
      return;
    }

    const current = this._isAudioActive(cameraModule, true);
    const next = !current;
    const base = cameraModule.audio_enabled === true;

    if (next === base) {
      this._audioOverrides.delete(cameraModule.id);
    } else {
      this._audioOverrides.set(cameraModule.id, next);
    }

    const container =
      (event.currentTarget as HTMLElement)?.closest('.camera-image-container') ||
      (event.target as HTMLElement).closest('.camera-image-container');
    const huiImage = container?.querySelector('hui-image') as any;

    if (huiImage) {
      this._ensureAudioState(huiImage, cameraModule, next);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ultra-card-template-update', {
          bubbles: true,
          composed: true,
          detail: {
            timestamp: Date.now(),
            source: 'camera-audio-toggle',
            moduleId: cameraModule.id,
          },
        })
      );
    }
  }

  // Ensure audio state is correctly applied to video element inside hui-image
  private _ensureAudioState(
    huiImage: any,
    cameraModule: CameraModule,
    forcedState?: boolean
  ): void {
    if (!huiImage || cameraModule.live_view === false) return;

    const audioEnabled =
      forcedState !== undefined ? forcedState : this._isAudioActive(cameraModule);

    this._lastAudioStates.set(cameraModule.id, audioEnabled);

    if (huiImage.muted !== undefined) {
      huiImage.muted = !audioEnabled;
    }

    this._applyAudioState(huiImage, audioEnabled);
    this._watchAudioTargets(huiImage, cameraModule);
  }

  private _applyAudioState(huiImage: any, audioEnabled: boolean): void {
    const players: HTMLElement[] = [];

    const findVideoElement = (): HTMLVideoElement | null => {
      players.length = 0;
      const visited = new Set<Node>();
      const stack: Array<Element | ShadowRoot> = [];

      const pushNode = (node?: Element | ShadowRoot | null) => {
        if (!node || visited.has(node)) return;
        visited.add(node);
        stack.push(node);
      };

      pushNode(huiImage.shadowRoot || null);
      pushNode(huiImage);

      while (stack.length) {
        const node = stack.pop();
        if (!node) continue;

        if (node instanceof HTMLElement) {
          const tagName = node.tagName.toLowerCase();
          if (CAMERA_PLAYER_SELECTORS.has(tagName)) {
            players.push(node);
          }
        }

        if (node instanceof HTMLVideoElement) {
          return node;
        }

        const childElements =
          node instanceof ShadowRoot
            ? Array.from(node.children)
            : node instanceof Element
              ? Array.from(node.children)
              : [];

        for (const child of childElements) {
          if (child instanceof HTMLVideoElement) {
            return child;
          }
          const childWithShadow = child as HTMLElement & { shadowRoot?: ShadowRoot };
          if (childWithShadow.shadowRoot) {
            pushNode(childWithShadow.shadowRoot);
          }
          pushNode(child);
        }
      }

      // Fallback: if component exposes internal video reference
      const fallbackVideo = (huiImage as any).video;
      if (fallbackVideo instanceof HTMLVideoElement) {
        return fallbackVideo;
      }

      return null;
    };

    const attempts = [0, 150, 400, 1000, 2000];
    attempts.forEach(delay => {
      setTimeout(() => {
        const video = findVideoElement();
        if (!video && players.length === 0) {
          return;
        }

        const applyVideoState = (targetVideo: HTMLVideoElement) => {
          targetVideo.muted = !audioEnabled;
          targetVideo.volume = audioEnabled ? 1 : 0;
          targetVideo.playsInline = true;

          if (audioEnabled && targetVideo.paused && !targetVideo.muted) {
            targetVideo.play().catch(() => {});
          }
        };

        if (video) {
          applyVideoState(video);
        }

        players.forEach(player => {
          try {
            if ('muted' in player) {
              (player as any).muted = !audioEnabled;
            }
            if ('volume' in player) {
              (player as any).volume = audioEnabled ? 1 : 0;
            }
            if ('playsInline' in player) {
              (player as any).playsInline = true;
            }
            player.toggleAttribute?.('muted', !audioEnabled);

            // Some HA players expose video element via property
            if ((player as any).video instanceof HTMLVideoElement) {
              applyVideoState((player as any).video);
            }

            if (
              audioEnabled &&
              typeof (player as any).play === 'function' &&
              typeof (player as any).paused === 'boolean'
            ) {
              const playerAny = player as any;
              if (playerAny.paused) {
                playerAny.play().catch(() => {
                  // Ignore autoplay blocks at player level; video fallback handles logging
                });
              }
            }
          } catch (playerError) {
            // Silently ignore player update issues to avoid noisy logs
          }
        });
      }, delay);
    });
  }

  private _watchAudioTargets(huiImage: any, cameraModule: CameraModule): void {
    if (!huiImage) return;

    const key = cameraModule.id;
    const targetNode = huiImage.shadowRoot || huiImage;
    if (!targetNode) {
      return;
    }

    const existing = this._audioObservers.get(key);
    if (existing?.target === targetNode) {
      return;
    }

    existing?.observer.disconnect();

    const observer = new MutationObserver(() => {
      const storedState = this._lastAudioStates.get(cameraModule.id);
      const audioEnabled =
        storedState !== undefined ? storedState : this._isAudioActive(cameraModule);
      this._applyAudioState(huiImage, audioEnabled);
    });

    observer.observe(targetNode, { childList: true, subtree: true });
    this._audioObservers.set(key, { observer, target: targetNode });
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

  private _setupSnapshotRefresh(
    cameraModule: CameraModule,
    entity: string,
    hass: HomeAssistant
  ): void {
    // Clear any existing timer first
    this._clearSnapshotRefresh(cameraModule.id);

    const interval = (cameraModule.refresh_interval || 10) * 1000; // Convert to milliseconds

    // Setup recurring refresh timer
    const timerId = setInterval(() => {
      this.refreshCamera(entity, hass);
    }, interval);

    this._snapshotRefreshTimers.set(cameraModule.id, timerId);
  }

  private _clearSnapshotRefresh(moduleId: string): void {
    const existingTimer = this._snapshotRefreshTimers.get(moduleId);
    if (existingTimer) {
      clearInterval(existingTimer);
      this._snapshotRefreshTimers.delete(moduleId);
    }
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
    // Only apply padding if explicitly set by user
    if (
      designProperties.padding_top ||
      designProperties.padding_bottom ||
      designProperties.padding_left ||
      designProperties.padding_right
    ) {
      return `${designProperties.padding_top || '0px'} ${designProperties.padding_right || '0px'} ${designProperties.padding_bottom || '0px'} ${designProperties.padding_left || '0px'}`;
    }
    return this.getPaddingCSS(moduleWithDesign);
  }

  private getMarginWithDesign(designProperties: any, moduleWithDesign: any): string {
    // Standard 8px top/bottom margin for proper web design spacing
    if (
      designProperties.margin_top ||
      designProperties.margin_bottom ||
      designProperties.margin_left ||
      designProperties.margin_right
    ) {
      return `${designProperties.margin_top || '8px'} ${designProperties.margin_right || '0px'} ${designProperties.margin_bottom || '8px'} ${designProperties.margin_left || '0px'}`;
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
    // Only apply padding if explicitly set by user
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
      : '0';
  }

  private getMarginCSS(moduleWithDesign: any): string {
    // Standard 8px top/bottom margin for proper web design spacing
    if (
      moduleWithDesign.margin_top ||
      moduleWithDesign.margin_bottom ||
      moduleWithDesign.margin_left ||
      moduleWithDesign.margin_right
    ) {
      return `${this.addPixelUnit(moduleWithDesign.margin_top) || '8px'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '8px'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0px'}`;
    }
    return '8px 0';
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
        box-sizing: border-box;
        word-break: break-word;
        hyphens: auto;
      }
      
      /* Ensure camera name doesn't overflow container boundaries */
      .camera-image-container > .camera-name-overlay {
        contain: layout style;
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

      .camera-audio-toggle {
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border: none;
        background: none;
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 12;
        padding: 0;
        transition: color 0.2s ease, transform 0.2s ease;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
      }

      .camera-audio-toggle ha-icon {
        pointer-events: none;
        font-size: 20px;
      }

      .camera-audio-toggle:hover {
        color: rgba(255, 255, 255, 0.95);
        transform: scale(1.05);
      }

      .camera-audio-toggle.active,
      .camera-audio-toggle.muted {
        color: rgba(255, 255, 255, 0.9);
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

      /* Fullscreen icon styling */
      .camera-fullscreen-icon {
        transition: all 0.2s ease;
        user-select: none;
      }

      .camera-fullscreen-icon:hover {
        transform: scale(1.15);
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.7);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
      }

      .camera-fullscreen-icon:active {
        transform: scale(1.05);
      }

      /* Fullscreen overlay animations */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Fullscreen overlay global styles */
      .camera-fullscreen-overlay {
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
        position: fixed !important;
      }

      .camera-fullscreen-overlay .camera-image-container {
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }

      /* Override HA context menus and modals */
      .camera-minimize-icon {
        z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
        position: fixed !important;
        pointer-events: auto !important;
      }

      /* Ensure fullscreen is above all HA elements */
      body .camera-fullscreen-overlay {
        z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
      }

      body .camera-minimize-icon {
        z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
      }

      /* When fullscreen is active, ensure our elements are always on top */
      body.camera-fullscreen-active .camera-fullscreen-overlay,
      body.camera-fullscreen-active .camera-minimize-icon {
        z-index: ${Z_INDEX.CAMERA_FULLSCREEN_CONTENT} !important;
        position: fixed !important;
      }

      /* Hide HA overlays during fullscreen */
      body.camera-fullscreen-active ha-dialog,
      body.camera-fullscreen-active ha-more-info-dialog,
      body.camera-fullscreen-active .mdc-dialog,
      body.camera-fullscreen-active .dialog-container {
        z-index: ${Z_INDEX.CAMERA_FULLSCREEN_OVERLAY} !important;
      }

      .camera-minimize-icon:hover {
        transform: scale(1.15) !important;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.7) !important;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9)) !important;
      }

      .camera-minimize-icon:active {
        transform: scale(1.05) !important;
      }

      /* Gap control styles - Standardized Slider Pattern */
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
    `;
  }
}

// Debounced, editor-aware camera update helpers
// Note: Do not redeclare requestIdleCallback/cancelIdleCallback typings to avoid conflicts

// Instance methods on class (placed after class to avoid reformatting large class body)
(UltraCameraModule as any).prototype._isEditorOpen = function (): boolean {
  try {
    return !!document.querySelector('hui-dialog-edit-card, hui-card-edit-mode');
  } catch {
    return false;
  }
};

(UltraCameraModule as any).prototype._isValidCameraEntity = function (
  hass: HomeAssistant,
  entityId: string
): boolean {
  if (!hass || !entityId) return false;
  const st = hass.states?.[entityId];
  if (!st) return false;
  const domain = entityId.split('.')[0];
  if (domain !== 'camera') return false;
  if (st.state === 'unavailable' || st.state === 'unknown') return false;
  return true;
};

(UltraCameraModule as any).prototype._scheduleCameraUpdate = function (
  entity: string,
  live: boolean,
  cameraModule: CameraModule,
  hass: HomeAssistant
): void {
  // Skip if no change
  if (this._lastAppliedEntity === entity && this._lastAppliedLive === live) {
    return;
  }

  this._pendingCameraProps = { entity, live };

  // Debounce 200ms to serialize offers during editor churn
  if (this._webrtcUpdateTimer) {
    clearTimeout(this._webrtcUpdateTimer);
  }
  this._webrtcUpdateTimer = setTimeout(() => {
    const pending = this._pendingCameraProps;
    if (!pending) return;

    // Validate target camera before touching the player
    if (!(this as any)._isValidCameraEntity(hass, pending.entity)) {
      // Ignore invalid entity while editing; keep current live stream
      return;
    }

    // Find current hui-image rendered for this module
    const host = (this as any).renderRoot || (this as any).shadowRoot || (this as any);
    const container: HTMLElement | null = host.querySelector(
      `.camera-module-container[data-uc-camera-id="${cameraModule.id}"] .camera-image-container`
    );
    if (container) {
      // Ensure only one hui-image child exists
      const images = Array.from(container.querySelectorAll('hui-image')) as any[];
      for (let i = 1; i < images.length; i++) {
        images[i].remove();
      }

      // Mutate existing hui-image imperatively when available
      const node = this._huiImageRef?.value || images[0];
      if (node) {
        // During editor churn and entity switch, briefly set 'auto' then to desired live in next microtask
        if ((this as any)._isEditorOpen() && this._lastAppliedEntity !== pending.entity) {
          node.cameraView = 'auto';
        }
        node.cameraImage = pending.entity;
        // Update muted property based on audio_enabled setting
        const audioEnabled = this._isAudioActive(cameraModule);
        node.muted = !audioEnabled;
        queueMicrotask(() => {
          node.cameraView = pending.live ? 'live' : 'auto';
          // Ensure muted property is set correctly after cameraView update
          node.muted = !audioEnabled;
          // Also ensure audio state on video element
          (this as any)._ensureAudioState(node, cameraModule, audioEnabled);
        });

        this._lastAppliedEntity = pending.entity;
        this._lastAppliedLive = pending.live;
        this._lastRenderedEntity = pending.entity;
      } else {
        // Fallback: request a rerender which will bind ref
        this._lastAppliedEntity = pending.entity;
        this._lastAppliedLive = pending.live;
        this.requestUpdate();
      }
    }
  }, 200);
};
