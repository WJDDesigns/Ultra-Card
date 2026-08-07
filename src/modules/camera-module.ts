import { html, TemplateResult } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { ref } from 'lit/directives/ref.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucToastService } from '../services/uc-toast-service';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, CameraModule, UltraCardConfig } from '../types';
import { FormUtils } from '../utils/form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';

import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { localize } from '../localize/localize';
import { Z_INDEX } from '../utils/uc-z-index';
import { TemplateService } from '../services/template-service';
import { buildEntityContext, computeEntitySignature } from '../utils/template-context';
import {
  parseUnifiedTemplate,
  hasTemplateError,
  unifiedTemplateEntityId,
} from '../utils/template-parser';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { resolveOverlayLayer } from '../utils/uc-overlay-host';
import '../components/ultra-template-editor';

/** Unified-template output keys the camera module reads (plain entity_id strings also work). */
const CAMERA_TEMPLATE_KEYS = ['entity', 'visible', 'overlay_text', 'overlay_color'] as const;

type CameraViewMode = 'auto' | 'live' | 'snapshot';

/** `object-fit` values Home Assistant's players understand. */
type CameraFitMode = 'cover' | 'contain' | 'fill';

const DEFAULT_ASPECT_RATIO = 16 / 9;

/**
 * Runtime state for a single camera instance.
 *
 * The module registry keeps one `UltraCameraModule` for every camera on every dashboard, so
 * anything that varies per placed module has to be keyed by module id rather than stored on the
 * class. Sharing these fields made two cameras fight over one stream.
 */
interface CameraRuntimeState {
  player?: Element | undefined;
  renderedEntity?: string | undefined;
  appliedEntity?: string | undefined;
  appliedLive?: boolean | undefined;
  pendingProps?: { entity: string; live: boolean } | undefined;
  updateTimer?: any;
  snapshotTimer?: any;
  snapshotIntervalMs?: number | undefined;
  snapshotSrc?: string | undefined;
  snapshotEntity?: string | undefined;
  snapshotInFlight?: boolean | undefined;
  audioOverride?: boolean | undefined;
  clickTimeout?: any;
  holdTimeout?: any;
  isHolding?: boolean | undefined;
}

export class UltraCameraModule extends BaseUltraModule {
  private _templateService: TemplateService | undefined;
  private _runtime: Map<string, CameraRuntimeState> = new Map();
  private _playerRefs: Map<string, (element: Element | undefined) => void> = new Map();
  private _visibilityListener: (() => void) | undefined;
  /** Latest `hass` seen by any render, used by timers that outlive a render pass. */
  private _hass: HomeAssistant | undefined;

  metadata: ModuleMetadata = {
    type: 'camera',
    title: 'Camera',
    description: 'Display live camera feeds with comprehensive control options',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:camera',
    category: 'content',
    tags: ['camera', 'live', 'feed', 'security', 'surveillance'],
  };

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
      show_audio_button: true,

      // Stream mode - controls camera feed behavior:
      // 'auto': HA default - still images polled every 10s by hui-image (low data usage)
      // 'live': Always streaming live feed (high data usage, real-time)
      // 'snapshot': Still images on the configured refresh interval (lowest data usage)
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

      unified_template_mode: false,
      unified_template: '',

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
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass,
            config,
            'entity',
            cameraModule.entity || '',
            (value: string) => {
              updateModule({ entity: value });
              this.triggerPreviewUpdate();
            },
            ['camera'],
            localize('editor.camera.entity', lang, 'Camera Entity')
          )}
        </div>

        <!-- Camera Name Settings with toggle in header -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${this.renderFieldSection(
            localize('editor.camera.show_name', lang, 'Show Camera Name'),
            '',
            hass,
            { show_name: cameraModule.show_name !== false },
            [this.booleanField('show_name')],
            (e: CustomEvent) => {
              updateModule({ show_name: e.detail.value.show_name });
              this.triggerPreviewUpdate();
            }
          )}
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
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${this.renderFieldSection(
            localize('editor.camera.tap_opens_fullscreen', lang, 'Tap Camera Opens Fullscreen'),
            '',
            hass,
            { tap_opens_fullscreen: cameraModule.tap_opens_fullscreen === true },
            [this.booleanField('tap_opens_fullscreen')],
            (e: CustomEvent) => {
              updateModule({ tap_opens_fullscreen: e.detail.value.tap_opens_fullscreen });
              this.triggerPreviewUpdate();
            }
          )}

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
                'Auto: still images refreshed every 10 seconds, exactly like Home Assistant picture cards. Live: a continuous stream. Snapshot: still images on your own refresh interval.'
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

          <!-- Live stream options -->
          ${(cameraModule.view_mode || 'auto') === 'live'
            ? html`
                <div style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.camera.audio_enabled.title', lang, 'Enable Audio'),
                    localize(
                      'editor.camera.audio_enabled.desc',
                      lang,
                      'Start the stream unmuted where the browser allows it. Browsers block unmuted autoplay until you interact with the page, so the stream may start muted until you use the sound button.'
                    ),
                    hass,
                    { audio_enabled: cameraModule.audio_enabled === true },
                    [this.booleanField('audio_enabled')],
                    (e: CustomEvent) => {
                      updateModule(e.detail.value);
                      this.triggerPreviewUpdate();
                    }
                  )}
                </div>

                <div style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.camera.show_audio_button.title', lang, 'Sound Button'),
                    localize(
                      'editor.camera.show_audio_button.desc',
                      lang,
                      'Show a mute/unmute button over the stream.'
                    ),
                    hass,
                    { show_audio_button: cameraModule.show_audio_button !== false },
                    [this.booleanField('show_audio_button')],
                    (e: CustomEvent) => {
                      updateModule(e.detail.value);
                      this.triggerPreviewUpdate();
                    }
                  )}
                </div>

                <div style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.camera.show_controls.title', lang, 'Player Controls'),
                    localize(
                      'editor.camera.show_controls.desc',
                      lang,
                      "Show the browser's native video controls on the stream."
                    ),
                    hass,
                    { show_controls: cameraModule.show_controls === true },
                    [this.booleanField('show_controls')],
                    (e: CustomEvent) => {
                      updateModule(e.detail.value);
                      this.triggerPreviewUpdate();
                    }
                  )}
                </div>
              `
            : ''}

          <!-- Image Fit -->
          <div style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.camera.image_fit.title', lang, 'Image Fit'),
              localize(
                'editor.camera.image_fit.desc',
                lang,
                'How the feed fills the frame. Cover crops to fill, Contain shows the whole frame with bars, Fill stretches to the frame.'
              ),
              hass,
              { image_fit: cameraModule.image_fit || 'cover' },
              [
                this.selectField('image_fit', [
                  {
                    value: 'cover',
                    label: localize('editor.camera.image_fit.options.cover', lang, 'Cover'),
                  },
                  {
                    value: 'contain',
                    label: localize('editor.camera.image_fit.options.contain', lang, 'Contain'),
                  },
                  {
                    value: 'fill',
                    label: localize('editor.camera.image_fit.options.fill', lang, 'Fill'),
                  },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.image_fit;
                if (next === (cameraModule.image_fit || 'cover')) return;
                updateModule(e.detail.value);
                this.triggerPreviewUpdate();
              }
            )}
          </div>

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
                color: var(--text-primary-color, #fff);
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
                ${this.renderSliderField(
                  localize('editor.camera.width', lang, 'Width'),
                  localize(
                    'editor.camera.width_desc',
                    lang,
                    'Set the width of the camera display. Range: 100–1000px'
                  ),
                  cameraModule.width || 320,
                  320,
                  100,
                  1000,
                  1,
                  (v: number) =>
                    this._handleDimensionChange(cameraModule, 'width', v, updateModule),
                  'px'
                )}
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
                ${this.renderSliderField(
                  localize('editor.camera.height', lang, 'Height'),
                  localize(
                    'editor.camera.height_desc',
                    lang,
                    'Set the height of the camera display. Range: 100–1000px'
                  ),
                  cameraModule.height || 180,
                  180,
                  100,
                  1000,
                  1,
                  (v: number) =>
                    this._handleDimensionChange(cameraModule, 'height', v, updateModule),
                  'px'
                )}
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
            ${this.renderSliderField(
              localize('editor.camera.rotation', lang, 'Rotation'),
              localize(
                'editor.camera.rotation_desc',
                lang,
                'Rotate the camera image clockwise (0–360 degrees).'
              ),
              cameraModule.rotation || 0,
              0,
              0,
              360,
              1,
              (v: number) => {
                updateModule({ rotation: v });
              },
              '°'
            )}
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
            ${this.renderSliderField(
              localize('editor.camera.crop.left_title', lang, 'Left Crop'),
              localize(
                'editor.camera.crop.left_desc',
                lang,
                'Crop from the left edge. Higher values show less of the left side.'
              ),
              cameraModule.crop_left || 0,
              0,
              0,
              50,
              1,
              (v: number) => {
                updateModule({ crop_left: v });
              },
              '%'
            )}

            <!-- Right Crop -->
            ${this.renderSliderField(
              localize('editor.camera.crop.right_title', lang, 'Right Crop'),
              localize(
                'editor.camera.crop.right_desc',
                lang,
                'Crop from the right edge. Higher values show less of the right side.'
              ),
              cameraModule.crop_right || 0,
              0,
              0,
              50,
              1,
              (v: number) => {
                updateModule({ crop_right: v });
              },
              '%'
            )}

            <!-- Top Crop -->
            ${this.renderSliderField(
              localize('editor.camera.crop.top_title', lang, 'Top Crop'),
              localize(
                'editor.camera.crop.top_desc',
                lang,
                'Crop from the top edge. Higher values show less of the top area.'
              ),
              cameraModule.crop_top || 0,
              0,
              0,
              50,
              1,
              (v: number) => {
                updateModule({ crop_top: v });
              },
              '%'
            )}

            <!-- Bottom Crop -->
            ${this.renderSliderField(
              localize('editor.camera.crop.bottom_title', lang, 'Bottom Crop'),
              localize(
                'editor.camera.crop.bottom_desc',
                lang,
                'Crop from the bottom edge. Higher values show less of the bottom area.'
              ),
              cameraModule.crop_bottom || 0,
              0,
              0,
              50,
              1,
              (v: number) => {
                updateModule({ crop_bottom: v });
              },
              '%'
            )}
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

        <!-- Unified Template Section -->
        <div class="template-section">
          <div class="template-header">
            <div class="switch-container">
              <div class="switch-label-row">
                <label class="switch-label"
                  >${localize(
                    'editor.camera.unified_template.toggle',
                    lang,
                    'Template Mode'
                  )}</label
                >
                <button
                  class="help-btn"
                  style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:var(--text-primary-color, #fff);cursor:pointer;border-radius:50%;line-height:0;"
                  title="${localize(
                    'editor.camera.unified_template.cheatsheet',
                    lang,
                    'Template cheatsheet'
                  )}"
                  @click=${(e: Event) => {
                    (e.currentTarget as HTMLElement).dispatchEvent(
                      new CustomEvent('uc-open-template-cheatsheet', {
                        bubbles: true,
                        composed: true,
                        detail: { module: 'camera' },
                      })
                    );
                  }}
                >
                  <ha-icon
                    icon="mdi:help-circle"
                    style="--mdc-icon-size:18px;width:18px;height:18px;color:var(--text-primary-color, #fff);"
                  ></ha-icon>
                </button>
              </div>
              ${this.renderUcForm(
                hass,
                { unified_template_mode: cameraModule.unified_template_mode || false },
                [this.booleanField('unified_template_mode')],
                (e: CustomEvent) =>
                  updateModule({ unified_template_mode: e.detail.value.unified_template_mode })
              )}
            </div>
            <div class="template-description">
              ${localize(
                'editor.camera.unified_template.desc',
                lang,
                'Return JSON: entity, visible, overlay_text, overlay_color — or a plain entity_id string.'
              )}
            </div>
          </div>

          ${cameraModule.unified_template_mode
            ? html`
                <div
                  class="template-content"
                  @mousedown=${(e: Event) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('ultra-template-editor') && !target.closest('.cm-editor')) {
                      e.stopPropagation();
                    }
                  }}
                  @dragstart=${(e: Event) => e.stopPropagation()}
                  @insert-snippet=${(e: CustomEvent) => {
                    const editor = (e.currentTarget as HTMLElement).querySelector(
                      'ultra-template-editor'
                    );
                    (editor as any)?.insertAtCursor?.(e.detail?.value ?? '');
                  }}
                >
                  <ultra-template-editor
                    .hass=${hass}
                    .value=${cameraModule.unified_template || ''}
                    .placeholder=${"{\n  \"entity\": \"{{ 'camera.outdoor' if is_state('weather.home', 'sunny') else 'camera.indoor' }}\"\n}"}
                    .minHeight=${100}
                    .maxHeight=${300}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({ unified_template: e.detail.value });
                    }}
                  ></ultra-template-editor>
                  ${this.renderTemplateKeyWarning(
                    cameraModule.unified_template,
                    CAMERA_TEMPLATE_KEYS,
                    lang
                  )}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  override renderActionsTab(
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
    // Timers outlive a render pass, so keep the newest connection handy for them.
    this._hass = hass;

    // GRACEFUL RENDERING: Check for incomplete configuration
    const unifiedOn =
      !!cameraModule.unified_template_mode &&
      !!(cameraModule.unified_template && String(cameraModule.unified_template).trim());

    if (!unifiedOn && (!cameraModule.entity || cameraModule.entity.trim() === '')) {
      return this.renderGradientErrorState(
        localize('editor.camera.error_no_entity', lang, 'Select Camera Entity'),
        localize(
          'editor.camera.error_no_entity_desc',
          lang,
          'Choose a camera entity in the General tab'
        ),
        'mdi:camera-outline'
      );
    }

    if (unifiedOn && !String(cameraModule.unified_template).trim()) {
      return this.renderGradientErrorState(
        localize('editor.camera.error_no_template', lang, 'Configure Template'),
        localize(
          'editor.camera.error_no_template_desc',
          lang,
          'Enter unified template in the General tab'
        ),
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

    if (cameraModule.unified_template_mode && cameraModule.unified_template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      } else if (this._templateService && hass) {
        this._templateService.updateHass(hass);
      }

      if (hass) {
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }
        const processed = preprocessTemplateVariables(cameraModule.unified_template, hass, config);
        const templateHash = this._hashString(processed);
        const templateKey = `unified_camera_${cameraModule.id}_${templateHash}`;

        if (this._templateService) {
          const context = buildEntityContext(cameraModule.entity || '', hass, {
            camera_name: cameraModule.camera_name,
            live_view: cameraModule.live_view,
          });
          const entitySig = computeEntitySignature(cameraModule.entity || '', hass);

          this._templateService.subscribeToTemplate(
            processed,
            templateKey,
            () => {
              if (typeof window !== 'undefined') {
                this.triggerPreviewUpdate();
              }
            },
            context,
            config,
            entitySig
          );
        }

        const templateResult = hass.__uvc_template_strings?.[templateKey];
        if (templateResult && String(templateResult).trim() !== '') {
          const parsed = parseUnifiedTemplate(templateResult);
          if (!hasTemplateError(parsed)) {
            const ent = unifiedTemplateEntityId(parsed) || parsed.entity;
            if (ent) {
              templateEntity = ent;
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

    const state = this._runtimeFor(cameraModule.id);
    const viewMode: CameraViewMode = (cameraModule.view_mode as CameraViewMode) || 'auto';
    const isLiveMode = viewMode === 'live';

    // While the editor is open the entity changes on every keystroke, so swaps are serialised to
    // avoid starting a second stream negotiation before the first one settles.
    if (this._isEditorOpen()) {
      if (cameraEntity) {
        this._scheduleCameraUpdate(cameraEntity, isLiveMode, cameraModule, hass);
      }
      cameraEntity = state.appliedEntity ?? cameraEntity;
    } else if (cameraEntity && this._isValidCameraEntity(hass, cameraEntity)) {
      state.appliedEntity = cameraEntity;
      state.appliedLive = isLiveMode;
    }

    const entity = cameraEntity ? hass.states[cameraEntity] : null;
    const isUnavailable = !entity || entity.state === 'unavailable';
    state.renderedEntity = cameraEntity;

    // The player is only rebuilt when something it genuinely depends on changes. Re-keying it on
    // unrelated state updates tears the stream down and restarts the handshake.
    const playerKey = `${cameraModule.id}|${cameraEntity || 'none'}|${viewMode}`;

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

    // Crop is a percentage of each edge, so both the visible window and the scale-up needed to
    // fill it stay percentages. That keeps cropping responsive instead of pinning the media to
    // the fallback pixel dimensions.
    const cropLeft = this._clampCrop(cameraModule.crop_left);
    const cropRight = this._clampCrop(cameraModule.crop_right);
    const cropTop = this._clampCrop(cameraModule.crop_top);
    const cropBottom = this._clampCrop(cameraModule.crop_bottom);
    const visibleWidth = Math.max(1, 100 - cropLeft - cropRight);
    const visibleHeight = Math.max(1, 100 - cropTop - cropBottom);
    const hasCropping = cropLeft > 0 || cropRight > 0 || cropTop > 0 || cropBottom > 0;

    // Get dimensions - prioritize global design properties over module properties
    const hasGlobalHeight =
      designProperties.height &&
      designProperties.height !== '' &&
      designProperties.height !== 'auto';

    // Use fallback pixel dimensions only when no global design dimensions are set
    const fallbackWidth = cameraModule.width || 320;
    const fallbackHeight = cameraModule.height || 180;
    const sourceRatio =
      (cameraModule.aspect_ratio_linked !== false && (cameraModule.aspect_ratio_value || 0) > 0
        ? (cameraModule.aspect_ratio_value as number)
        : fallbackWidth / fallbackHeight) || DEFAULT_ASPECT_RATIO;
    // Reserving the frame's shape up front is what stops the dashboard from jumping while a
    // stream negotiates, and it gives the video a definite height to fill.
    const stageRatio = (sourceRatio * visibleWidth) / visibleHeight;

    const fitMode = this._resolveFitMode(cameraModule.image_fit);
    const rotation = cameraModule.rotation || 0;

    // Media fills the stage; when cropping it is scaled up and offset so the kept region lands
    // exactly on the stage bounds.
    const mediaStyles: Record<string, string | undefined> = {
      display: 'block',
      position: 'absolute',
      top: hasCropping ? `${(-(cropTop / visibleHeight) * 100).toFixed(4)}%` : '0',
      left: hasCropping ? `${(-(cropLeft / visibleWidth) * 100).toFixed(4)}%` : '0',
      width: hasCropping ? `${(10000 / visibleWidth).toFixed(4)}%` : '100%',
      height: hasCropping ? `${(10000 / visibleHeight).toFixed(4)}%` : '100%',
      transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
      objectFit: fitMode,
    };

    // Container styling - prioritize global design properties completely
    const containerImageStyles = {
      width:
        designProperties.width ||
        `${Math.max(50, (fallbackWidth * visibleWidth) / 100).toFixed(0)}px`,
      height: hasGlobalHeight ? designProperties.height : undefined,
      aspectRatio: hasGlobalHeight ? undefined : stageRatio.toFixed(4),
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
      // ha-hls-player caps the video at `calc(100vh - 97px)` by default, which shrinks the frame
      // inside a card-sized container.
      '--video-max-height': '100%',
    };

    // Get camera name position styles with design properties priority
    const namePosition = cameraModule.name_position || 'top-left';
    const namePositionStyles = this.getCameraNamePositionStyles(
      namePosition,
      moduleWithDesign,
      designProperties,
      templateOverlayColor
    );

    // Audio only exists on a live stream
    const audioActive = isLiveMode && this._isAudioActive(cameraModule);
    const showAudioToggle = isLiveMode && cameraModule.show_audio_button !== false;

    const nameOverlay =
      cameraModule.show_name !== false
        ? html`<div
            class="camera-name-overlay"
            style="${this.buildStyleString(namePositionStyles)}"
          >
            ${cameraName}
          </div>`
        : '';

    const primaryTextStyle = `font-weight: ${designProperties.font_weight || this.getTextWeight(moduleWithDesign)}; font-size: ${
      designProperties.font_size
        ? typeof designProperties.font_size === 'number'
          ? `${designProperties.font_size}px`
          : designProperties.font_size
        : this.getTextSize(moduleWithDesign)
    };`;
    const secondaryTextStyle = `font-size: ${
      typeof designProperties.font_size === 'number'
        ? `${Math.max(10, designProperties.font_size - 2)}px`
        : this.getSmallTextSize(moduleWithDesign)
    }; margin-top: 4px; opacity: 0.9;`;
    const placeholderStyle = (background: string) =>
      this.buildStyleString({
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: background,
        color: designProperties.color || this.getTextColor(moduleWithDesign),
        fontFamily: designProperties.font_family || this.getTextFont(moduleWithDesign),
      });

    const cameraContent = html`
      <div
        class="camera-module-container"
        data-uc-camera-id="${cameraModule.id}"
        style="${this.buildStyleString(containerStyles)}"
      >
        <div class="camera-image-container" style="${this.buildStyleString(containerImageStyles)}">
          ${!cameraEntity
            ? html`
                <div
                  class="camera-unavailable"
                  style="${placeholderStyle('var(--warning-color, #ff9800)')}"
                >
                  <ha-icon
                    icon="mdi:camera-plus"
                    style="font-size: 48px; margin-bottom: 8px;"
                  ></ha-icon>
                  <span style="${primaryTextStyle}"
                    >${localize(
                      'editor.camera.error_no_entity',
                      lang,
                      'Select Camera Entity'
                    )}</span
                  >
                  <span style="${secondaryTextStyle}"
                    >${localize(
                      'editor.camera.error_no_entity_desc',
                      lang,
                      'Choose a camera entity in the General tab'
                    )}</span
                  >
                </div>
                ${nameOverlay}
              `
            : isUnavailable
              ? html`
                  <div
                    class="camera-unavailable"
                    style="${placeholderStyle('var(--error-color, #f44336)')}"
                  >
                    ${cameraModule.fallback_image
                      ? html`
                          <img
                            src=${cameraModule.fallback_image}
                            alt="Fallback"
                            style="width: 100%; height: 100%; object-fit: ${fitMode};"
                          />
                        `
                      : html`
                          <ha-icon
                            icon="mdi:camera-off"
                            style="font-size: 48px; margin-bottom: 8px;"
                          ></ha-icon>
                          <span style="${primaryTextStyle}"
                            >${localize(
                              'editor.camera.unavailable',
                              lang,
                              'Camera Unavailable'
                            )}</span
                          >
                          <span style="${secondaryTextStyle}">${cameraEntity}</span>
                        `}
                  </div>
                  ${nameOverlay}
                `
              : html`
                  ${keyed(
                    playerKey,
                    this._renderPlayer(cameraModule, hass, {
                      cameraEntity: cameraEntity as string,
                      stateObj: entity,
                      viewMode,
                      mediaStyles,
                      fitMode,
                      sourceRatio,
                      audioActive,
                      state,
                    })
                  )}
                  ${nameOverlay}
                  ${showAudioToggle
                    ? html`
                        <button
                          type="button"
                          class="camera-audio-toggle ${audioActive ? 'active' : 'muted'}"
                          title="${audioActive
                            ? localize('editor.camera.audio.mute', lang, 'Mute')
                            : localize('editor.camera.audio.unmute', lang, 'Unmute')}"
                          aria-label="${audioActive
                            ? localize('editor.camera.audio.mute', lang, 'Mute')
                            : localize('editor.camera.audio.unmute', lang, 'Unmute')}"
                          @mousedown=${(e: Event) => e.stopPropagation()}
                          @touchstart=${(e: Event) => e.stopPropagation()}
                          @click=${(e: Event) => this._toggleAudio(e, cameraModule)}
                        >
                          <ha-icon
                            icon="${audioActive ? 'mdi:volume-high' : 'mdi:volume-off'}"
                          ></ha-icon>
                        </button>
                      `
                    : ''}
                `}
        </div>
      </div>
    `;

    // Get hover effect configuration from module design
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    const cameraWrapper = this.hasActiveLink(cameraModule)
      ? html`<div
          class="camera-module-clickable ${hoverEffectClass}"
          style="${designStyles}"
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
      : html`<div class="camera-module-container ${hoverEffectClass}" style="${designStyles}">
          ${cameraContent}
        </div>`;

    return this.wrapWithAnimation(cameraWrapper, module, hass);
  }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------

  /**
   * Renders the media element for the configured stream mode.
   *
   * `live` hands off to `ha-camera-stream`, which is the same component Home Assistant's own
   * picture cards use and which negotiates WebRTC/HLS/MJPEG with fallbacks. `auto` uses
   * `hui-image` for HA's polled-snapshot behaviour. `snapshot` drives its own still image so the
   * configured refresh interval is actually honoured.
   */
  private _renderPlayer(
    cameraModule: CameraModule,
    hass: HomeAssistant,
    options: {
      cameraEntity: string;
      stateObj: any;
      viewMode: CameraViewMode;
      mediaStyles: Record<string, string | undefined>;
      fitMode: CameraFitMode;
      sourceRatio: number;
      audioActive: boolean;
      state: CameraRuntimeState;
    }
  ): TemplateResult {
    const { cameraEntity, stateObj, viewMode, mediaStyles, fitMode, sourceRatio, audioActive } =
      options;
    const mediaStyle = this.buildStyleString(mediaStyles);
    const playerRef = this._playerRef(cameraModule.id);

    if (viewMode === 'live') {
      return html`
        <ha-camera-stream
          ${ref(playerRef)}
          class="camera-image"
          style="${mediaStyle}"
          .hass=${hass}
          .stateObj=${stateObj}
          .fitMode=${fitMode}
          .muted=${!audioActive}
          .controls=${cameraModule.show_controls === true}
          @load=${() => this._syncAudio(cameraModule)}
        ></ha-camera-stream>
      `;
    }

    if (viewMode === 'snapshot') {
      this._ensureSnapshot(cameraModule, cameraEntity);
      return html`
        <img
          ${ref(playerRef)}
          class="camera-image"
          style="${mediaStyle}"
          alt=${cameraEntity}
          src=${options.state.snapshotSrc || ''}
          @error=${() => this._onSnapshotError(cameraModule, cameraEntity)}
        />
      `;
    }

    return html`
      <hui-image
        ${ref(playerRef)}
        class="camera-image"
        style="${mediaStyle}"
        .hass=${hass}
        .cameraImage=${cameraEntity}
        .cameraView=${'auto'}
        .fitMode=${fitMode}
        .aspectRatio=${`${sourceRatio.toFixed(4)}:1`}
      ></hui-image>
    `;
  }

  private _runtimeFor(moduleId: string): CameraRuntimeState {
    let state = this._runtime.get(moduleId);
    if (!state) {
      state = {};
      this._runtime.set(moduleId, state);
    }
    return state;
  }

  /**
   * Stable `ref` callback per module. Lit treats a new callback identity as a detach/attach cycle,
   * so these must be cached or the player would be torn down on every render.
   */
  private _playerRef(moduleId: string): (element: Element | undefined) => void {
    let callback = this._playerRefs.get(moduleId);
    if (!callback) {
      callback = (element?: Element) => {
        const state = this._runtimeFor(moduleId);
        state.player = element;
        if (element) return;
        // A mode switch detaches the old element before attaching the new one, so only tear the
        // timers down once we know nothing took its place.
        setTimeout(() => {
          if (this._runtime.get(moduleId)?.player) return;
          this._clearTimers(moduleId);
          this._runtime.delete(moduleId);
          this._playerRefs.delete(moduleId);
        }, 0);
      };
      this._playerRefs.set(moduleId, callback);
    }
    return callback;
  }

  private _clearTimers(moduleId: string): void {
    const state = this._runtime.get(moduleId);
    if (!state) return;
    if (state.snapshotTimer) {
      clearInterval(state.snapshotTimer);
      state.snapshotTimer = undefined;
    }
    if (state.updateTimer) {
      clearTimeout(state.updateTimer);
      state.updateTimer = undefined;
    }
    if (state.clickTimeout) {
      clearTimeout(state.clickTimeout);
      state.clickTimeout = undefined;
    }
    if (state.holdTimeout) {
      clearTimeout(state.holdTimeout);
      state.holdTimeout = undefined;
    }
  }

  private _clampCrop(value: number | undefined): number {
    if (typeof value !== 'number' || !isFinite(value)) return 0;
    return Math.min(49, Math.max(0, value));
  }

  /** Home Assistant's players only accept these three `object-fit` values. */
  private _resolveFitMode(fit: CameraModule['image_fit']): CameraFitMode {
    switch (fit) {
      case 'contain':
      case 'scale-down':
        return 'contain';
      case 'fill':
        return 'fill';
      default:
        return 'cover';
    }
  }

  private _isEditorOpen(): boolean {
    try {
      return !!document.querySelector('hui-dialog-edit-card, hui-card-edit-mode');
    } catch {
      return false;
    }
  }

  private _isValidCameraEntity(hass: HomeAssistant, entityId: string): boolean {
    if (!hass || !entityId) return false;
    const stateObj = hass.states?.[entityId];
    if (!stateObj) return false;
    if (entityId.split('.')[0] !== 'camera') return false;
    return stateObj.state !== 'unavailable' && stateObj.state !== 'unknown';
  }

  /**
   * Debounces entity swaps while the editor is open so a burst of keystrokes results in a single
   * stream negotiation instead of one per character.
   */
  private _scheduleCameraUpdate(
    entity: string,
    live: boolean,
    cameraModule: CameraModule,
    hass: HomeAssistant
  ): void {
    const state = this._runtimeFor(cameraModule.id);
    if (state.appliedEntity === entity && state.appliedLive === live) {
      return;
    }

    state.pendingProps = { entity, live };
    if (state.updateTimer) {
      clearTimeout(state.updateTimer);
    }
    state.updateTimer = setTimeout(() => {
      state.updateTimer = undefined;
      const pending = state.pendingProps;
      if (!pending || !this._isValidCameraEntity(hass, pending.entity)) {
        return;
      }
      state.appliedEntity = pending.entity;
      state.appliedLive = pending.live;
      state.pendingProps = undefined;
      this.triggerPreviewUpdate();
    }, 200);
  }

  // ---------------------------------------------------------------------------
  // Snapshot mode
  // ---------------------------------------------------------------------------

  /**
   * Snapshot mode owns its refresh cycle. `hui-image` polls on a hard-coded 10s timer, so routing
   * this mode through it silently ignored the configured interval.
   */
  private _ensureSnapshot(cameraModule: CameraModule, entityId: string): void {
    const state = this._runtimeFor(cameraModule.id);
    const intervalMs = Math.min(300, Math.max(1, cameraModule.refresh_interval || 10)) * 1000;

    if (state.snapshotEntity !== entityId) {
      state.snapshotEntity = entityId;
      state.snapshotSrc = undefined;
      if (state.snapshotTimer) {
        clearInterval(state.snapshotTimer);
        state.snapshotTimer = undefined;
      }
    }

    if (!state.snapshotSrc) {
      this._refreshSnapshot(cameraModule.id, entityId, false);
    }

    if (state.snapshotTimer && state.snapshotIntervalMs !== intervalMs) {
      clearInterval(state.snapshotTimer);
      state.snapshotTimer = undefined;
    }

    if (!state.snapshotTimer) {
      state.snapshotIntervalMs = intervalMs;
      state.snapshotTimer = setInterval(
        () => this._refreshSnapshot(cameraModule.id, entityId, true),
        intervalMs
      );
    }

    this._ensureVisibilityListener();
  }

  /**
   * Points the snapshot at a fresh frame.
   *
   * `entity_picture` already carries the camera's signed access token, so this needs no round trip;
   * `applyToElement` writes straight to the `<img>` to avoid re-rendering every card on the
   * dashboard on each tick.
   */
  private _refreshSnapshot(moduleId: string, entityId: string, applyToElement: boolean): void {
    const state = this._runtime.get(moduleId);
    const hass = this._hass;
    if (!state || !hass) return;
    if (applyToElement && typeof document !== 'undefined' && document.hidden) return;

    const stateObj = hass.states?.[entityId] as any;
    const picture: string | undefined = stateObj?.attributes?.entity_picture;
    if (!picture) {
      void this._resolveSignedSnapshot(moduleId, entityId);
      return;
    }

    const base =
      typeof (hass as any).hassUrl === 'function' ? (hass as any).hassUrl(picture) : picture;
    const src = `${base}${base.includes('?') ? '&' : '?'}_uc=${Date.now()}`;
    state.snapshotSrc = src;

    const element = state.player as HTMLImageElement | undefined;
    if (applyToElement) {
      if (element instanceof HTMLImageElement) {
        element.src = src;
      } else {
        this.triggerPreviewUpdate();
      }
    }
  }

  /** Cameras without an `entity_picture` (no access token yet) need a signed proxy path. */
  private async _resolveSignedSnapshot(moduleId: string, entityId: string): Promise<void> {
    const state = this._runtime.get(moduleId);
    const hass = this._hass;
    if (!state || !hass || state.snapshotInFlight) return;

    state.snapshotInFlight = true;
    try {
      const signed = await (hass as any).callWS({
        type: 'auth/sign_path',
        path: `/api/camera_proxy/${entityId}`,
      });
      if (!signed?.path) return;
      const base =
        typeof (hass as any).hassUrl === 'function'
          ? (hass as any).hassUrl(signed.path)
          : signed.path;
      state.snapshotSrc = `${base}${base.includes('?') ? '&' : '?'}_uc=${Date.now()}`;
      const element = state.player as HTMLImageElement | undefined;
      if (element instanceof HTMLImageElement) {
        element.src = state.snapshotSrc;
      } else {
        this.triggerPreviewUpdate();
      }
    } catch {
      // Leave the previous frame in place; the next tick retries.
    } finally {
      state.snapshotInFlight = false;
    }
  }

  private _onSnapshotError(cameraModule: CameraModule, entityId: string): void {
    const state = this._runtimeFor(cameraModule.id);
    if (cameraModule.fallback_image) {
      const element = state.player as HTMLImageElement | undefined;
      if (element instanceof HTMLImageElement && element.src !== cameraModule.fallback_image) {
        element.src = cameraModule.fallback_image;
      }
      return;
    }
    void this._resolveSignedSnapshot(cameraModule.id, entityId);
  }

  /** Background tabs skip refreshes; this catches them up the moment the tab is shown again. */
  private _ensureVisibilityListener(): void {
    if (this._visibilityListener || typeof document === 'undefined') return;
    this._visibilityListener = () => {
      if (document.hidden) return;
      this._runtime.forEach((state, moduleId) => {
        if (state.snapshotTimer && state.snapshotEntity) {
          this._refreshSnapshot(moduleId, state.snapshotEntity, true);
        }
      });
    };
    document.addEventListener('visibilitychange', this._visibilityListener);
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

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
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
    const state = this._runtimeFor(module.id);
    if (state.clickTimeout) clearTimeout(state.clickTimeout);

    // Only pay the double-tap wait when a double-tap action exists; otherwise a tap that opens
    // fullscreen or more-info feels sluggish for no reason.
    const hasDoubleTap =
      !!module.double_tap_action && module.double_tap_action.action !== 'nothing';
    if (!hasDoubleTap) {
      this.handleTapAction(event, module, hass, config);
      return;
    }

    state.clickTimeout = setTimeout(() => {
      state.clickTimeout = undefined;
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
    const state = this._runtimeFor(module.id);
    if (state.clickTimeout) {
      clearTimeout(state.clickTimeout);
      state.clickTimeout = undefined;
    }
    this.handleDoubleAction(event, module, hass, config);
  }

  private handleMouseDown(
    event: Event,
    module: CameraModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    const state = this._runtimeFor(module.id);
    state.isHolding = false;
    state.holdTimeout = setTimeout(() => {
      state.isHolding = true;
      this.handleHoldAction(event, module, hass, config);
    }, 500);
  }

  private handleMouseUp(event: Event, module: CameraModule, hass: HomeAssistant): void {
    const state = this._runtimeFor(module.id);
    if (state.holdTimeout) {
      clearTimeout(state.holdTimeout);
      state.holdTimeout = undefined;
    }
  }

  private handleMouseLeave(event: Event, module: CameraModule, hass: HomeAssistant): void {
    const state = this._runtimeFor(module.id);
    if (state.holdTimeout) {
      clearTimeout(state.holdTimeout);
      state.holdTimeout = undefined;
    }
    state.isHolding = false;
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
    if (this._runtimeFor(module.id).isHolding) return;

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

    const anchor = (event.currentTarget as HTMLElement) || (event.target as HTMLElement);
    this.createFullscreenModal(module, anchor);
  }

  /**
   * Picks where the fullscreen overlay is mounted.
   *
   * `ha-camera-stream` reads its API and connection from Lit contexts provided by the
   * `<home-assistant>` element, so an overlay parked on `document.body` would never resolve them
   * and the player would stay blank. Mounting inside that element's shadow root keeps the context
   * chain intact while `position: fixed` still covers the viewport.
   */
  private _resolveFullscreenHost(anchor?: HTMLElement): {
    host: HTMLElement | ShadowRoot;
    zIndex: number;
  } {
    const insidePortal = !!anchor?.closest?.('.ultra-popup-portal');
    const zIndex = insidePortal ? Z_INDEX.GRAPH_TOOLTIP : Z_INDEX.CAMERA_FULLSCREEN_OVERLAY;
    const appRoot = document.querySelector('home-assistant');
    if (appRoot?.shadowRoot) {
      return { host: appRoot.shadowRoot, zIndex };
    }
    return { host: resolveOverlayLayer(anchor, zIndex).host, zIndex };
  }

  // Create a bulletproof fullscreen modal
  private createFullscreenModal(module: CameraModule, anchor?: HTMLElement): void {
    // Remove any existing fullscreen modals first
    document
      .querySelectorAll('[id^="ultra-camera-fullscreen-"]')
      .forEach(existing => (existing as any)._ultraClose?.() ?? existing.remove());
    const appRoot = document.querySelector('home-assistant');
    appRoot?.shadowRoot
      ?.querySelectorAll('[id^="ultra-camera-fullscreen-"]')
      .forEach(existing => (existing as any)._ultraClose?.() ?? existing.remove());

    const { host: overlayHost, zIndex: overlayZIndex } = this._resolveFullscreenHost(anchor);
    const closeButtonZIndex =
      overlayZIndex >= Z_INDEX.GRAPH_TOOLTIP ? overlayZIndex : overlayZIndex + 1;

    // Prefer the entity the module is actually rendering; a template can resolve to something the
    // raw template text does not contain.
    const cameraEntity = this._runtime.get(module.id)?.renderedEntity || module.entity;

    if (!cameraEntity) {
      ucToastService.error('No camera entity available');
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
      z-index: ${overlayZIndex} !important;
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
      z-index: ${closeButtonZIndex} !important;
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
    overlayHost.appendChild(modal);

    // Add event handlers and prevent inert attribute
    const closeModal = () => {
      // Restore viewport settings
      const restoreViewport = (modal as any)._restoreViewport;
      if (restoreViewport) {
        restoreViewport();
      }

      // Emptying the container first disconnects the player, which is what actually stops the
      // stream; removing the modal alone can leave the connection alive long enough to matter.
      observer.disconnect();
      cameraContainer.replaceChildren();
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
    (modal as any)._ultraClose = closeModal;

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
          closeModal();
        },
        true
      );

      modal.addEventListener(
        'click',
        e => {
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
    const hass = this._hass || (document.querySelector('home-assistant') as any)?.hass;
    // Fullscreen is always a live stream regardless of the tile's mode - that is the point of
    // opening it - and it always starts muted so autoplay is never blocked.
    let fullscreenAudio = false;

    if (hass) {
      const streamEl = document.createElement('ha-camera-stream') as any;
      streamEl.setAttribute('data-camera-fullscreen', cameraEntity);
      streamEl.hass = hass;
      streamEl.stateObj = hass.states?.[cameraEntity];
      streamEl.fitMode = 'contain';
      streamEl.muted = true;
      streamEl.controls = module.show_controls === true;
      streamEl.style.cssText = `
        width: 100vw !important;
        height: 100vh !important;
        display: block !important;
        --video-max-height: 100vh !important;
        transition: transform 0.2s ease !important;
        cursor: grab !important;
        touch-action: none !important;
      `;

      cameraContainer.replaceChildren(streamEl);
      this.addPinchZoomToCamera(streamEl, cameraContainer);

      const audioButton = document.createElement('button');
      audioButton.type = 'button';
      audioButton.className = 'camera-fullscreen-audio';
      audioButton.textContent = '🔇';
      audioButton.setAttribute('aria-label', 'Toggle audio');
      audioButton.style.cssText = `
        position: absolute !important;
        top: 20px !important;
        right: 84px !important;
        width: 50px !important;
        height: 50px !important;
        border: 3px solid rgba(255,255,255,0.7) !important;
        background: rgba(0,0,0,0.8) !important;
        color: white !important;
        font-size: 22px !important;
        cursor: pointer !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: ${closeButtonZIndex} !important;
        backdrop-filter: blur(4px) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
        line-height: 1 !important;
      `;
      audioButton.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();
        fullscreenAudio = !fullscreenAudio;
        streamEl.muted = !fullscreenAudio;
        audioButton.textContent = fullscreenAudio ? '🔊' : '🔇';
        const video = this._findVideoElement(streamEl);
        if (video) {
          video.muted = !fullscreenAudio;
          video.volume = fullscreenAudio ? 1 : 0;
          if (video.paused) void video.play().catch(() => {});
        }
      });
      cameraWrapper.appendChild(audioButton);
    } else {
      const stateObj = this._hass?.states?.[cameraEntity] as any;
      const fallbackImg = document.createElement('img');
      fallbackImg.src = stateObj?.attributes?.entity_picture || '';
      fallbackImg.style.cssText = `
        width: 100vw !important;
        height: 100vh !important;
        display: block !important;
        object-fit: contain !important;
        cursor: grab !important;
        touch-action: none !important;
      `;

      cameraContainer.replaceChildren(fallbackImg);
      this.addPinchZoomToCamera(fallbackImg, cameraContainer);
    }

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

  // ---------------------------------------------------------------------------
  // Audio
  // ---------------------------------------------------------------------------

  /**
   * Whether the stream should currently play with sound.
   *
   * Browsers refuse to autoplay unmuted media until the page has been interacted with, and a
   * blocked play() leaves the viewer staring at a frozen first frame. So `audio_enabled` only
   * takes effect once the page has user activation; before that the toggle is the way in.
   */
  private _isAudioActive(cameraModule: CameraModule): boolean {
    const state = this._runtimeFor(cameraModule.id);
    if (state.audioOverride !== undefined) {
      return state.audioOverride;
    }
    if (cameraModule.audio_enabled !== true) {
      return false;
    }
    const activation = (navigator as any)?.userActivation;
    return activation ? activation.hasBeenActive === true : false;
  }

  private _toggleAudio(event: Event, cameraModule: CameraModule): void {
    event.preventDefault();
    event.stopPropagation();

    if ((cameraModule.view_mode || 'auto') !== 'live') return;

    const state = this._runtimeFor(cameraModule.id);
    state.audioOverride = !this._isAudioActive(cameraModule);
    this._syncAudio(cameraModule);
    this.triggerPreviewUpdate(true);
  }

  /**
   * Pushes the desired mute state onto the player.
   *
   * `ha-camera-stream` forwards `muted` down to the `<video>`, so the property is enough for the
   * common case; the direct video write is only there to resume playback after an unmute, which
   * some browsers require an explicit `play()` for.
   */
  private _syncAudio(cameraModule: CameraModule): void {
    if ((cameraModule.view_mode || 'auto') !== 'live') return;

    const state = this._runtime.get(cameraModule.id);
    const player = state?.player as any;
    if (!player) return;

    const audioActive = this._isAudioActive(cameraModule);
    player.muted = !audioActive;

    const video = this._findVideoElement(player);
    if (!video) return;

    video.muted = !audioActive;
    video.volume = audioActive ? 1 : 0;
    video.playsInline = true;
    if (video.paused) {
      void video.play().catch(() => {
        // Autoplay policy rejected the unmuted stream; the toggle remains available.
      });
    }
  }

  /** Walks the player's shadow trees to reach the `<video>` HA renders internally. */
  private _findVideoElement(root: Element): HTMLVideoElement | null {
    const queue: Array<Element | ShadowRoot> = [root];
    const seen = new Set<Element | ShadowRoot>();

    while (queue.length) {
      const node = queue.shift();
      if (!node || seen.has(node)) continue;
      seen.add(node);

      if (node instanceof HTMLVideoElement) return node;

      const shadow = (node as Element).shadowRoot;
      if (shadow) queue.push(shadow);
      queue.push(...Array.from(node.children));
    }

    return null;
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
    // Only apply padding if explicitly set by user
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
      : '0';
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
    return '0';
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
        display: block;
        transition: width 0.3s ease, height 0.3s ease;
      }

      /*
       * The stage owns the frame; the player fills it absolutely. Home Assistant's players size
       * their internal <video>/<img> against these, so both need a definite box.
       */
      .camera-image {
        position: absolute;
        inset: 0;
        transition: opacity 0.3s ease;
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
        text-align: center;
        padding: 8px;
        box-sizing: border-box;
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

      /* Gap control styles - Standardized Slider Pattern */
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
