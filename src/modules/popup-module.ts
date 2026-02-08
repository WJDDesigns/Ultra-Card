import { TemplateResult, html, render } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, PopupModule, NavigationModule, NavRoute } from '../types';
import { getModuleRegistry } from './module-registry';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import { Z_INDEX } from '../utils/uc-z-index';
import { getImageUrl } from '../utils/image-upload';
import { registerPopupTrigger, unregisterPopupTrigger } from '../services/popup-trigger-registry';

// Global store to persist popup state across module re-instantiation/reloads
// This survives HA preview/dash re-renders because it's kept on window
type PopupStore = {
  portals: Map<string, HTMLElement>;
  states: Map<string, boolean>;
  timers: Map<string, number>;
  logicStates: Map<string, boolean>;
  manuallyOpened: Set<string>;
  timerEnabled: Map<string, boolean>;
  needsRefresh: Map<string, boolean>; // Track which popups need content refresh for templates
};

const POPUP_STORE_KEY = '__ultraPopupStore__';

const getPopupStore = (): PopupStore => {
  const w = window as any;
  if (!w[POPUP_STORE_KEY]) {
    w[POPUP_STORE_KEY] = {
      portals: new Map<string, HTMLElement>(),
      states: new Map<string, boolean>(),
      timers: new Map<string, number>(),
      logicStates: new Map<string, boolean>(),
      manuallyOpened: new Set<string>(),
      timerEnabled: new Map<string, boolean>(),
      needsRefresh: new Map<string, boolean>(),
    } as PopupStore;
  }
  return w[POPUP_STORE_KEY] as PopupStore;
};

// References to global store maps/sets
const {
  portals: popupPortals,
  states: popupStates,
  timers: popupTimers,
  logicStates: lastLogicStates,
  manuallyOpened: manuallyOpenedPopups,
  timerEnabled: popupTimerEnabled,
  needsRefresh: popupNeedsRefresh,
} = getPopupStore();

// Helper to restore HA editor overlays after popup closes
const restoreHAEditorOverlays = () => {
  document.querySelectorAll('[data-ultra-popup-original-z-index]').forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    const originalZIndex = htmlEl.dataset.ultraPopupOriginalZIndex || '';
    if (originalZIndex) {
      htmlEl.style.zIndex = originalZIndex;
    } else {
      htmlEl.style.zIndex = '';
    }
    htmlEl.style.pointerEvents = '';
    delete htmlEl.dataset.ultraPopupOriginalZIndex;
  });
};

export class UltraPopupModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'popup',
    title: 'Popup',
    description: 'Modal popup container with customizable trigger and content',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:window-maximize',
    category: 'layout',
    tags: ['layout', 'popup', 'modal', 'overlay', 'container'],
  };

  createDefault(id?: string, hass?: HomeAssistant): PopupModule {
    return {
      id: id || this.generateId('popup'),
      type: 'popup',
      modules: [],

      // Title configuration
      show_title: false,
      title_mode: 'custom',
      title_text: 'Popup Title',
      title_entity: '',
      show_entity_name: false,

      // Trigger configuration
      trigger_type: 'button',
      trigger_module_id: '', // ID of the module that triggers this popup (for 'module' trigger type)
      trigger_button_text: 'Open Popup',
      trigger_button_icon: '',
      trigger_image_type: 'url',
      trigger_image_url: '',
      trigger_image_entity: '',
      trigger_icon: 'mdi:information',

      // Trigger styling
      trigger_alignment: 'center',
      trigger_button_full_width: false,
      trigger_image_full_width: false,

      // Layout settings
      layout: 'default',
      animation: 'fade',

      // Popup styling
      popup_width: '600px',
      popup_padding: '5%',
      popup_border_radius: '8px',

      // Close button configuration
      close_button_position: 'inside',
      close_button_color: '#ffffff',
      close_button_size: 32,
      close_button_icon: 'mdi:close',
      close_button_offset_x: '0px',
      close_button_offset_y: '0px',

      // Auto-close timer
      auto_close_timer_enabled: false,
      auto_close_timer_seconds: 30,

      // Colors
      title_background_color: 'var(--primary-color)',
      title_text_color: '#ffffff',
      popup_background_color: 'var(--card-background-color)',
      popup_text_color: 'var(--primary-text-color)',
      show_overlay: true,
      overlay_background: 'rgba(0,0,0,0.85)',

      // Trigger Logic
      trigger_mode: 'manual',
      trigger_conditions: [],
      auto_close: true,

      // Default state
      default_open: false,

      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderDesignTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const popupModule = module as PopupModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .design-subsection {
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 0 8px 8px 0;
        }
        .subsection-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>

      <div class="module-design-settings">
        <!-- Trigger Styling Section -->
        ${popupModule.trigger_type === 'button'
          ? html`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${localize('editor.popup.design.trigger_button', lang, 'Trigger Button Styling')}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.popup.design.trigger_button_desc',
                    lang,
                    'Customize the appearance of the trigger button.'
                  )}
                </div>

                <!-- Button styling would go here - using global design tab for now -->
                <div style="color: var(--secondary-text-color); font-style: italic; padding: 12px;">
                  Use the General Design tab below for button styling options.
                </div>
              </div>
            `
          : ''}

        <!-- Title Styling Section -->
        ${popupModule.show_title
          ? html`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${localize('editor.popup.design.title', lang, 'Title Styling')}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.popup.design.title_desc',
                    lang,
                    'Customize the appearance of the popup title bar.'
                  )}
                </div>

                <!-- Title Background Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${localize('editor.popup.design.title_bg', lang, 'Title Background')}
                    .value=${popupModule.title_background_color || ''}
                    .defaultValue=${'var(--primary-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      const value = e.detail.value;
                      updateModule({ title_background_color: value });
                    }}
                  ></ultra-color-picker>
                </div>

                <!-- Title Text Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${localize('editor.popup.design.title_text', lang, 'Title Text')}
                    .value=${popupModule.title_text_color || ''}
                    .defaultValue=${'#ffffff'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      const value = e.detail.value;
                      updateModule({ title_text_color: value });
                    }}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}

        <!-- Popup Content Styling Section -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.popup.design.content', lang, 'Popup Content Styling')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.popup.design.content_desc',
              lang,
              'Customize the appearance of the popup content area.'
            )}
          </div>

          <!-- Popup Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.popup.design.popup_bg', lang, 'Popup Background')}
              .value=${popupModule.popup_background_color || ''}
              .defaultValue=${'var(--card-background-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                const value = e.detail.value;
                updateModule({ popup_background_color: value });
              }}
            ></ultra-color-picker>
          </div>

          <!-- Popup Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.popup.design.popup_text', lang, 'Popup Text')}
              .value=${popupModule.popup_text_color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                const value = e.detail.value;
                updateModule({ popup_text_color: value });
              }}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Overlay Styling Section (only shown when overlay is enabled) -->
        ${popupModule.show_overlay !== false
          ? html`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${localize('editor.popup.design.overlay', lang, 'Background Overlay')}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.popup.design.overlay_desc',
                    lang,
                    'Customize the backdrop behind the popup.'
                  )}
                </div>

                <!-- Overlay Background Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${localize('editor.popup.design.overlay_bg', lang, 'Background Overlay')}
                    .value=${popupModule.overlay_background || ''}
                    .defaultValue=${'rgba(0,0,0,0.85)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      const value = e.detail.value;
                      updateModule({ overlay_background: value });
                    }}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}

        <!-- Close Button Styling Section -->
        ${popupModule.close_button_position !== 'none'
          ? html`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${localize('editor.popup.design.close_button', lang, 'Close Button Styling')}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.popup.design.close_button_desc',
                    lang,
                    'Customize the appearance of the close button.'
                  )}
                </div>

                <!-- Close Button Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${localize(
                      'editor.popup.design.close_button_color',
                      lang,
                      'Close Button'
                    )}
                    .value=${popupModule.close_button_color || ''}
                    .defaultValue=${'#ffffff'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      const value = e.detail.value;
                      updateModule({ close_button_color: value });
                    }}
                  ></ultra-color-picker>
                </div>

                <!-- Close Button Size -->
                ${this.renderFieldSection(
                  localize('editor.popup.design.close_button_size', lang, 'Close Button Size'),
                  localize(
                    'editor.popup.design.close_button_size_desc',
                    lang,
                    'Size of the close button icon (in pixels).'
                  ),
                  hass,
                  { close_button_size: popupModule.close_button_size || 32 },
                  [this.numberField('close_button_size', 16, 64, 1)],
                  (e: CustomEvent) => {
                    updateModule({ close_button_size: e.detail.value.close_button_size });
                  }
                )}

                <!-- Close Button Icon -->
                ${this.renderFieldSection(
                  localize('editor.popup.design.close_button_icon', lang, 'Close Button Icon'),
                  localize(
                    'editor.popup.design.close_button_icon_desc',
                    lang,
                    'Icon to display on the close button.'
                  ),
                  hass,
                  { close_button_icon: popupModule.close_button_icon || 'mdi:close' },
                  [this.iconField('close_button_icon')],
                  (e: CustomEvent) => {
                    updateModule({ close_button_icon: e.detail.value.close_button_icon });
                    setTimeout(() => {
                      this.triggerPreviewUpdate();
                    }, 50);
                  }
                )}

                <!-- Close Button Offset X -->
                ${this.renderFieldSection(
                  localize('editor.popup.design.close_button_offset_x', lang, 'Horizontal Offset'),
                  localize(
                    'editor.popup.design.close_button_offset_x_desc',
                    lang,
                    'Horizontal position adjustment (e.g., 10px, 1rem).'
                  ),
                  hass,
                  { close_button_offset_x: popupModule.close_button_offset_x || '0px' },
                  [this.textField('close_button_offset_x')],
                  (e: CustomEvent) => {
                    updateModule({ close_button_offset_x: e.detail.value.close_button_offset_x });
                  }
                )}

                <!-- Close Button Offset Y -->
                ${this.renderFieldSection(
                  localize('editor.popup.design.close_button_offset_y', lang, 'Vertical Offset'),
                  localize(
                    'editor.popup.design.close_button_offset_y_desc',
                    lang,
                    'Vertical position adjustment (e.g., 10px, 1rem).'
                  ),
                  hass,
                  { close_button_offset_y: popupModule.close_button_offset_y || '0px' },
                  [this.textField('close_button_offset_y')],
                  (e: CustomEvent) => {
                    updateModule({ close_button_offset_y: e.detail.value.close_button_offset_y });
                  }
                )}
              </div>
            `
          : ''}

        <!-- Standard Design Tab Content (from GlobalDesignTab) -->
        <div style="margin-top: 24px;">
          <div
            style="font-size: 14px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;"
          >
            ${localize('editor.popup.design.general_title', lang, 'General Trigger Design')}
          </div>
          ${super.renderDesignTab(module, hass, config, updateModule)}
        </div>
      </div>
    `;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const popupModule = module as PopupModule;
    const lang = hass?.locale?.language || 'en';

    // Check if this popup is being opened via a navigation module
    const navSourceName = this._isOpenedViaNavigation(popupModule.id, config);

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Trigger Configuration Section -->
        ${navSourceName
          ? html`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
                >
                  ${localize('editor.popup.trigger.section_title', lang, 'Trigger Configuration')}
                </div>
                <div
                  style="display: flex; align-items: center; gap: 12px; background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1); border: 1px solid rgba(var(--rgb-primary-color, 33, 150, 243), 0.3); border-radius: 8px; padding: 16px; margin-top: 8px;"
                >
                  <ha-icon
                    icon="mdi:navigation-variant"
                    style="color: var(--primary-color); flex-shrink: 0; --mdc-icon-size: 24px;"
                  ></ha-icon>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px; color: var(--primary-text-color); margin-bottom: 4px;">
                      Opened via Navigation
                    </div>
                    <div style="font-size: 13px; color: var(--secondary-text-color); line-height: 1.4;">
                      This popup is configured to open from <strong>${navSourceName}</strong>. The trigger
                      type is managed by the navigation module and cannot be changed here.
                    </div>
                  </div>
                </div>
              </div>
            `
          : this.renderSettingsSection(
              localize('editor.popup.trigger.section_title', lang, 'Trigger Configuration'),
              localize(
                'editor.popup.trigger.section_desc',
                lang,
                'Configure how the popup is triggered to open.'
              ),
              [
                {
                  title: localize('editor.popup.trigger.type', lang, 'Trigger Type'),
                  description: localize(
                    'editor.popup.trigger.type_desc',
                    lang,
                    'Choose how the popup will be opened.'
                  ),
                  hass,
                  data: { trigger_type: popupModule.trigger_type || 'button' },
                  schema: [
                    this.selectField('trigger_type', [
                      {
                        value: 'button',
                        label: localize('editor.popup.trigger.button', lang, 'Button'),
                      },
                      {
                        value: 'image',
                        label: localize('editor.popup.trigger.image', lang, 'Image'),
                      },
                      { value: 'icon', label: localize('editor.popup.trigger.icon', lang, 'Icon') },
                      {
                        value: 'module',
                        label: localize('editor.popup.trigger.module', lang, 'Module'),
                      },
                      {
                        value: 'page_load',
                        label: localize('editor.popup.trigger.page_load', lang, 'Page Load'),
                      },
                      {
                        value: 'logic',
                        label: localize('editor.popup.trigger.logic', lang, 'Logic Conditions'),
                      },
                    ]),
                  ],
                  onChange: (e: CustomEvent) => {
                    const next = e.detail.value.trigger_type;
                    const prev = popupModule.trigger_type || 'button';
                    if (next === prev) return;
                    updateModule(e.detail.value);
                    setTimeout(() => {
                      this.triggerPreviewUpdate();
                    }, 50);
                  },
                },
              ]
            )}

        <!-- Trigger sub-options: hidden when opened via navigation -->
        ${!navSourceName
          ? html`
              <!-- Conditional: Button Trigger -->
              ${popupModule.trigger_type === 'button'
                ? html`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup(
                        localize('editor.popup.trigger.button', lang, 'Button'),
                        html`
                          ${this.renderFieldSection(
                            localize('editor.popup.trigger.button_text', lang, 'Button Text'),
                            localize(
                              'editor.popup.trigger.button_text_desc',
                              lang,
                              'Text to display on the trigger button.'
                            ),
                            hass,
                            { trigger_button_text: popupModule.trigger_button_text || '' },
                            [this.textField('trigger_button_text')],
                            (e: CustomEvent) => {
                              updateModule(e.detail.value);
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            }
                          )}
                          ${this.renderFieldSection(
                            localize('editor.popup.trigger.button_icon', lang, 'Button Icon'),
                            localize(
                              'editor.popup.trigger.button_icon_desc',
                              lang,
                              'Icon to display on the trigger button.'
                            ),
                            hass,
                            { trigger_button_icon: popupModule.trigger_button_icon || '' },
                            [this.iconField('trigger_button_icon')],
                            (e: CustomEvent) => {
                              updateModule(e.detail.value);
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            }
                          )}
                          ${this.renderSettingsSection('', '', [
                            {
                              title: localize(
                                'editor.popup.trigger.button_full_width',
                                lang,
                                'Full Width'
                              ),
                              description: localize(
                                'editor.popup.trigger.button_full_width_desc',
                                lang,
                                'Make the button span the full width of the container.'
                              ),
                              hass,
                              data: {
                                trigger_button_full_width:
                                  popupModule.trigger_button_full_width || false,
                              },
                              schema: [this.booleanField('trigger_button_full_width')],
                              onChange: (e: CustomEvent) => {
                                updateModule(e.detail.value);
                                setTimeout(() => {
                                  this.triggerPreviewUpdate();
                                }, 50);
                              },
                            },
                          ])}
                        `
                      )}
                    </div>
                  `
                : ''}

              <!-- Conditional: Image Trigger -->
              ${popupModule.trigger_type === 'image'
                ? html`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup(
                        localize('editor.popup.trigger.image', lang, 'Image'),
                        html`
                          ${this.renderSettingsSection('', '', [
                            {
                              title: localize(
                                'editor.popup.trigger.image_type',
                                lang,
                                'Image Type'
                              ),
                              description: localize(
                                'editor.popup.trigger.image_type_desc',
                                lang,
                                'Choose how to provide the image for the trigger.'
                              ),
                              hass,
                              data: {
                                trigger_image_type: popupModule.trigger_image_type || 'url',
                              },
                              schema: [
                                this.selectField('trigger_image_type', [
                                  {
                                    value: 'upload',
                                    label: localize(
                                      'editor.design.bg_upload',
                                      lang,
                                      'Upload Image'
                                    ),
                                  },
                                  {
                                    value: 'entity',
                                    label: localize(
                                      'editor.design.bg_entity',
                                      lang,
                                      'Entity Image'
                                    ),
                                  },
                                  {
                                    value: 'url',
                                    label: localize('editor.design.bg_url', lang, 'Image URL'),
                                  },
                                ]),
                              ],
                              onChange: (e: CustomEvent) => {
                                const next = e.detail.value.trigger_image_type;
                                const prev = popupModule.trigger_image_type || 'url';
                                if (next === prev) return;
                                updateModule(e.detail.value);
                                setTimeout(() => {
                                  this.triggerPreviewUpdate();
                                }, 50);
                              },
                            },
                          ])}
                          ${popupModule.trigger_image_type === 'upload'
                            ? html`
                                <div style="margin-bottom: 16px;">
                                  <div
                                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--primary-text-color);"
                                  >
                                    ${localize(
                                      'editor.design.upload_bg_image',
                                      lang,
                                      'Upload Image'
                                    )}
                                  </div>
                                  <div class="upload-container">
                                    <div
                                      class="file-upload-row"
                                      style="display: flex; align-items: center; gap: 12px;"
                                    >
                                      <label
                                        class="file-upload-button"
                                        style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--primary-color); color: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;"
                                      >
                                        <ha-icon
                                          icon="mdi:upload"
                                          style="--mdc-icon-size: 20px;"
                                        ></ha-icon>
                                        <span
                                          >${localize(
                                            'editor.design.choose_file',
                                            lang,
                                            'Choose File'
                                          )}</span
                                        >
                                        <input
                                          type="file"
                                          accept="image/*"
                                          @change=${async (e: Event) => {
                                            const input = e.target as HTMLInputElement;
                                            const file = input.files?.[0];
                                            if (!file || !hass) return;
                                            try {
                                              const { uploadImage } = await import(
                                                '../utils/image-upload'
                                              );
                                              const imagePath = await uploadImage(hass, file);
                                              updateModule({
                                                trigger_image_url: imagePath,
                                                trigger_image_type: 'upload',
                                              });
                                              setTimeout(() => {
                                                this.triggerPreviewUpdate();
                                              }, 50);
                                            } catch (error) {
                                              console.error('Image upload failed:', error);
                                              alert(
                                                `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                                              );
                                            }
                                          }}
                                          style="display: none"
                                        />
                                      </label>
                                      <div
                                        style="flex: 1; color: var(--secondary-text-color); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                                      >
                                        ${popupModule.trigger_image_url &&
                                        popupModule.trigger_image_url.startsWith(
                                          '/api/image/serve/'
                                        )
                                          ? popupModule.trigger_image_url.split('/').pop() ||
                                            'Uploaded image'
                                          : popupModule.trigger_image_url
                                            ? 'Image selected'
                                            : 'No file chosen'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              `
                            : ''}
                          ${popupModule.trigger_image_type === 'entity'
                            ? html`
                                ${this.renderFieldSection(
                                  localize(
                                    'editor.design.bg_image_entity',
                                    lang,
                                    'Image Entity'
                                  ),
                                  localize(
                                    'editor.design.bg_image_entity_desc',
                                    lang,
                                    'Select an entity that has an image attribute.'
                                  ),
                                  hass,
                                  {
                                    trigger_image_entity:
                                      popupModule.trigger_image_entity || '',
                                  },
                                  [this.entityField('trigger_image_entity')],
                                  (e: CustomEvent) => {
                                    updateModule(e.detail.value);
                                    setTimeout(() => {
                                      this.triggerPreviewUpdate();
                                    }, 50);
                                  }
                                )}
                              `
                            : ''}
                          ${popupModule.trigger_image_type === 'url'
                            ? html`
                                ${this.renderFieldSection(
                                  localize(
                                    'editor.popup.trigger.image_url',
                                    lang,
                                    'Image URL'
                                  ),
                                  localize(
                                    'editor.popup.trigger.image_url_desc',
                                    lang,
                                    'URL of the image to use as the trigger.'
                                  ),
                                  hass,
                                  { trigger_image_url: popupModule.trigger_image_url || '' },
                                  [this.textField('trigger_image_url')],
                                  (e: CustomEvent) => {
                                    updateModule(e.detail.value);
                                    setTimeout(() => {
                                      this.triggerPreviewUpdate();
                                    }, 50);
                                  }
                                )}
                              `
                            : ''}
                          ${this.renderSettingsSection('', '', [
                            {
                              title: localize(
                                'editor.popup.trigger.image_full_width',
                                lang,
                                'Full Width'
                              ),
                              description: localize(
                                'editor.popup.trigger.image_full_width_desc',
                                lang,
                                'Make the image span the full width of the container.'
                              ),
                              hass,
                              data: {
                                trigger_image_full_width:
                                  popupModule.trigger_image_full_width || false,
                              },
                              schema: [this.booleanField('trigger_image_full_width')],
                              onChange: (e: CustomEvent) => {
                                updateModule(e.detail.value);
                                setTimeout(() => {
                                  this.triggerPreviewUpdate();
                                }, 50);
                              },
                            },
                          ])}
                        `
                      )}
                    </div>
                  `
                : ''}

              <!-- Conditional: Icon Trigger -->
              ${popupModule.trigger_type === 'icon'
                ? html`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup(
                        localize('editor.popup.trigger.icon', lang, 'Icon'),
                        html`
                          ${this.renderFieldSection(
                            localize('editor.popup.trigger.icon', lang, 'Trigger Icon'),
                            localize(
                              'editor.popup.trigger.icon_desc',
                              lang,
                              'Icon to display as the trigger.'
                            ),
                            hass,
                            { trigger_icon: popupModule.trigger_icon || '' },
                            [this.iconField('trigger_icon')],
                            (e: CustomEvent) => {
                              updateModule(e.detail.value);
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            }
                          )}
                        `
                      )}
                    </div>
                  `
                : ''}

              <!-- Conditional: Module Trigger -->
              ${popupModule.trigger_type === 'module'
                ? html`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup(
                        localize('editor.popup.trigger.module_config', lang, 'Module Trigger'),
                        html`
                          ${this._renderModuleTriggerConfig(
                            popupModule,
                            hass,
                            config,
                            updateModule,
                            lang
                          )}
                        `
                      )}
                    </div>
                  `
                : ''}

              <!-- Conditional: Logic Trigger -->
              ${popupModule.trigger_type === 'logic'
                ? html`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup(
                        localize(
                          'editor.popup.trigger.logic_config',
                          lang,
                          'Logic Configuration'
                        ),
                        html` ${this._renderTriggerLogic(popupModule, hass, updateModule)} `
                      )}
                    </div>
                  `
                : ''}

              <!-- Trigger Alignment (shown for button, icon, image triggers) -->
              ${popupModule.trigger_type === 'button' ||
              popupModule.trigger_type === 'icon' ||
              popupModule.trigger_type === 'image'
                ? html`
                    ${this.renderSettingsSection(
                      localize(
                        'editor.popup.trigger.alignment_section',
                        lang,
                        'Trigger Alignment'
                      ),
                      localize(
                        'editor.popup.trigger.alignment_desc',
                        lang,
                        'Choose how the trigger element is aligned.'
                      ),
                      [
                        {
                          title: localize('editor.popup.trigger.alignment', lang, 'Alignment'),
                          description: localize(
                            'editor.popup.trigger.alignment_help',
                            lang,
                            'Align the trigger element to the left, center, or right.'
                          ),
                          hass,
                          data: {
                            trigger_alignment: popupModule.trigger_alignment || 'center',
                          },
                          schema: [
                            this.selectField('trigger_alignment', [
                              {
                                value: 'left',
                                label: localize('editor.common.left', lang, 'Left'),
                              },
                              {
                                value: 'center',
                                label: localize('editor.common.center', lang, 'Center'),
                              },
                              {
                                value: 'right',
                                label: localize('editor.common.right', lang, 'Right'),
                              },
                            ]),
                          ],
                          onChange: (e: CustomEvent) => {
                            const next = e.detail.value.trigger_alignment;
                            const prev = popupModule.trigger_alignment || 'center';
                            if (next === prev) return;
                            updateModule(e.detail.value);
                            setTimeout(() => {
                              this.triggerPreviewUpdate();
                            }, 50);
                          },
                        },
                      ]
                    )}
                  `
                : ''}
            `
          : ''}

        <!-- Title Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.popup.title.section_title', lang, 'Title Configuration'),
          localize(
            'editor.popup.title.section_desc',
            lang,
            'Configure whether to show a title bar in the popup.'
          ),
          [
            {
              title: localize('editor.popup.title.show', lang, 'Show Title'),
              description: localize(
                'editor.popup.title.show_desc',
                lang,
                'Display a title bar at the top of the popup.'
              ),
              hass,
              data: { show_title: popupModule.show_title || false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Conditional: Title Settings -->
        ${popupModule.show_title
          ? html`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup(
                  localize('editor.popup.title.configuration', lang, 'Title Configuration'),
                  html`
                    ${this.renderSettingsSection('', '', [
                      {
                        title: localize('editor.popup.title.mode', lang, 'Title Mode'),
                        description: localize(
                          'editor.popup.title.mode_desc',
                          lang,
                          'Choose whether to use custom text or entity state as title.'
                        ),
                        hass,
                        data: { title_mode: popupModule.title_mode || 'custom' },
                        schema: [
                          this.selectField('title_mode', [
                            {
                              value: 'custom',
                              label: localize('editor.common.custom_text', lang, 'Custom Text'),
                            },
                            {
                              value: 'entity',
                              label: localize('editor.common.entity_state', lang, 'Entity State'),
                            },
                          ]),
                        ],
                        onChange: (e: CustomEvent) => {
                          const next = e.detail.value.title_mode;
                          const prev = popupModule.title_mode || 'custom';
                          if (next === prev) return;
                          updateModule(e.detail.value);
                          setTimeout(() => {
                            this.triggerPreviewUpdate();
                          }, 50);
                        },
                      },
                    ])}
                    ${popupModule.title_mode === 'custom'
                      ? html`
                          ${this.renderFieldSection(
                            localize('editor.popup.title.text', lang, 'Title Text'),
                            localize(
                              'editor.popup.title.text_desc',
                              lang,
                              'Enter the custom text to display in the popup title.'
                            ),
                            hass,
                            { title_text: popupModule.title_text || '' },
                            [this.textField('title_text')],
                            (e: CustomEvent) => {
                              updateModule(e.detail.value);
                            }
                          )}
                        `
                      : html`
                          ${this.renderFieldSection(
                            localize('editor.popup.title.entity', lang, 'Title Entity'),
                            localize(
                              'editor.popup.title.entity_desc',
                              lang,
                              'Select an entity whose state will be used as the title.'
                            ),
                            hass,
                            { title_entity: popupModule.title_entity || '' },
                            [this.entityField('title_entity')],
                            (e: CustomEvent) => {
                              updateModule(e.detail.value);
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            }
                          )}
                          ${this.renderSettingsSection('', '', [
                            {
                              title: localize(
                                'editor.popup.title.show_entity_name',
                                lang,
                                'Show Entity Name'
                              ),
                              description: localize(
                                'editor.popup.title.show_entity_name_desc',
                                lang,
                                'Display the entity friendly name before the state value.'
                              ),
                              hass,
                              data: { show_entity_name: popupModule.show_entity_name || false },
                              schema: [this.booleanField('show_entity_name')],
                              onChange: (e: CustomEvent) => {
                                updateModule(e.detail.value);
                                setTimeout(() => {
                                  this.triggerPreviewUpdate();
                                }, 50);
                              },
                            },
                          ])}
                        `}
                  `
                )}
              </div>
            `
          : ''}

        <!-- Layout Settings Section -->
        ${this.renderSettingsSection(
          localize('editor.popup.layout.section_title', lang, 'Layout Settings'),
          localize(
            'editor.popup.layout.section_desc',
            lang,
            'Configure how the popup is displayed on screen.'
          ),
          [
            {
              title: localize('editor.popup.layout.type', lang, 'Layout'),
              description: localize(
                'editor.popup.layout.type_desc',
                lang,
                'Choose the layout style for the popup.'
              ),
              hass,
              data: { layout: popupModule.layout || 'default' },
              schema: [
                this.selectField('layout', [
                  {
                    value: 'default',
                    label: localize('editor.popup.layout.default', lang, 'Default'),
                  },
                  {
                    value: 'full_screen',
                    label: localize('editor.popup.layout.full_screen', lang, 'Full Screen'),
                  },
                  {
                    value: 'left_panel',
                    label: localize('editor.popup.layout.left_panel', lang, 'Left Panel'),
                  },
                  {
                    value: 'right_panel',
                    label: localize('editor.popup.layout.right_panel', lang, 'Right Panel'),
                  },
                  {
                    value: 'top_panel',
                    label: localize('editor.popup.layout.top_panel', lang, 'Top Panel'),
                  },
                  {
                    value: 'bottom_panel',
                    label: localize('editor.popup.layout.bottom_panel', lang, 'Bottom Panel'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.layout;
                const prev = popupModule.layout || 'default';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
            {
              title: localize('editor.popup.animation.type', lang, 'Animation'),
              description: localize(
                'editor.popup.animation.type_desc',
                lang,
                'Choose the animation style when the popup opens.'
              ),
              hass,
              data: { animation: popupModule.animation || 'fade' },
              schema: [
                this.selectField('animation', [
                  { value: 'fade', label: localize('editor.popup.animation.fade', lang, 'Fade') },
                  {
                    value: 'scale_up',
                    label: localize('editor.popup.animation.scale_up', lang, 'Scale Up'),
                  },
                  {
                    value: 'scale_down',
                    label: localize('editor.popup.animation.scale_down', lang, 'Scale Down'),
                  },
                  {
                    value: 'slide_top',
                    label: localize('editor.popup.animation.slide_top', lang, 'Slide from Top'),
                  },
                  {
                    value: 'slide_left',
                    label: localize('editor.popup.animation.slide_left', lang, 'Slide from Left'),
                  },
                  {
                    value: 'slide_right',
                    label: localize('editor.popup.animation.slide_right', lang, 'Slide from Right'),
                  },
                  {
                    value: 'slide_bottom',
                    label: localize(
                      'editor.popup.animation.slide_bottom',
                      lang,
                      'Slide from Bottom'
                    ),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.animation;
                const prev = popupModule.animation || 'fade';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Background Overlay Section -->
        ${this.renderSettingsSection(
          localize('editor.popup.overlay.section_title', lang, 'Background Overlay'),
          '',
          [
            {
              title: localize('editor.popup.overlay.show', lang, 'Show Background Overlay'),
              description: localize(
                'editor.popup.overlay.show_desc',
                lang,
                'Display a dimmed overlay behind the popup when open.'
              ),
              hass,
              data: { show_overlay: popupModule.show_overlay !== false },
              schema: [this.booleanField('show_overlay')],
              onChange: (e: CustomEvent) => {
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Popup Dimensions Section -->
        ${this.renderFieldSection(
          localize('editor.popup.popup_width', lang, 'Popup Width'),
          localize(
            'editor.popup.popup_width_desc',
            lang,
            'Width of the popup (e.g., 600px, 100%, 14rem, 10vw).'
          ),
          hass,
          { popup_width: popupModule.popup_width || '600px' },
          [this.textField('popup_width')],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
          }
        )}
        ${this.renderFieldSection(
          localize('editor.popup.popup_padding', lang, 'Popup Padding'),
          localize(
            'editor.popup.popup_padding_desc',
            lang,
            'Padding inside the popup (e.g., 5%, 20px, 1rem, 2vw).'
          ),
          hass,
          { popup_padding: popupModule.popup_padding || '5%' },
          [this.textField('popup_padding')],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
          }
        )}
        ${this.renderFieldSection(
          localize('editor.popup.popup_border_radius', lang, 'Popup Border Radius'),
          localize(
            'editor.popup.popup_border_radius_desc',
            lang,
            'Border radius of the popup (e.g., 5px, 50%, 0.3em, 12px 0).'
          ),
          hass,
          { popup_border_radius: popupModule.popup_border_radius || '8px' },
          [this.textField('popup_border_radius')],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
          }
        )}

        <!-- Close Button Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.popup.close_button.section_title', lang, 'Close Button'),
          localize(
            'editor.popup.close_button.section_desc',
            lang,
            'Configure the close button position and behavior.'
          ),
          [
            {
              title: localize('editor.popup.close_button.position', lang, 'Close Button Position'),
              description: localize(
                'editor.popup.close_button.position_desc',
                lang,
                'Choose where the close button appears.'
              ),
              hass,
              data: { close_button_position: popupModule.close_button_position || 'inside' },
              schema: [
                this.selectField('close_button_position', [
                  {
                    value: 'inside',
                    label: localize('editor.popup.close_button.inside', lang, 'Inside the Popup'),
                  },
                  {
                    value: 'none',
                    label: localize('editor.popup.close_button.none', lang, 'None'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.close_button_position;
                const prev = popupModule.close_button_position || 'inside';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Auto-Close Timer Section -->
        ${this.renderSettingsSection(
          localize('editor.popup.auto_close_timer.section_title', lang, 'Auto-Close Timer'),
          localize(
            'editor.popup.auto_close_timer.section_desc',
            lang,
            'Configure automatic popup closing after a specified time.'
          ),
          [
            {
              title: localize(
                'editor.popup.auto_close_timer.enabled',
                lang,
                'Enable Auto-Close Timer'
              ),
              description: localize(
                'editor.popup.auto_close_timer.enabled_desc',
                lang,
                'Automatically close the popup after a specified time.'
              ),
              hass,
              data: { auto_close_timer_enabled: popupModule.auto_close_timer_enabled || false },
              schema: [this.booleanField('auto_close_timer_enabled')],
              onChange: (e: CustomEvent) => {
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Conditional: Timer Duration -->
        ${popupModule.auto_close_timer_enabled
          ? html`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup(
                  localize(
                    'editor.popup.auto_close_timer.configuration',
                    lang,
                    'Timer Configuration'
                  ),
                  html`
                    ${this.renderFieldSection(
                      localize(
                        'editor.popup.auto_close_timer.seconds',
                        lang,
                        'Close After (Seconds)'
                      ),
                      localize(
                        'editor.popup.auto_close_timer.seconds_desc',
                        lang,
                        'Number of seconds before the popup automatically closes.'
                      ),
                      hass,
                      { auto_close_timer_seconds: popupModule.auto_close_timer_seconds || 30 },
                      [this.numberField('auto_close_timer_seconds', 1, 300, 1)],
                      (e: CustomEvent) => {
                        updateModule(e.detail.value);
                      }
                    )}
                  `
                )}
              </div>
            `
          : ''}

        <!-- Default State Section (only shown when trigger is manual or button/icon/image) -->
        ${popupModule.trigger_type !== 'page_load' && popupModule.trigger_type !== 'logic'
          ? this.renderSettingsSection(
              localize('editor.popup.state.section_title', lang, 'Default State'),
              localize(
                'editor.popup.state.section_desc',
                lang,
                'Configure whether this popup starts open or closed when the card loads.'
              ),
              [
                {
                  title: localize('editor.popup.state.default_open', lang, 'Open by Default'),
                  description: localize(
                    'editor.popup.state.default_open_desc',
                    lang,
                    'When enabled, the popup will be open when the card initially loads.'
                  ),
                  hass,
                  data: { default_open: popupModule.default_open || false },
                  schema: [this.booleanField('default_open')],
                  onChange: (e: CustomEvent) => {
                    updateModule(e.detail.value);
                    setTimeout(() => {
                      this.triggerPreviewUpdate();
                    }, 50);
                  },
                },
              ]
            )
          : ''}
      </div>
    `;
  }

  /**
   * Check if this popup is being opened via a navigation module's route or media player action.
   * Returns the name/label of the navigation module referencing this popup, or null if none.
   */
  private _isOpenedViaNavigation(
    popupId: string,
    config?: UltraCardConfig
  ): string | null {
    if (!config?.layout?.rows) return null;

    // Helper to check if a single route references this popup
    const routeReferencesPopup = (route: NavRoute): boolean => {
      if (route.tap_action?.action === 'open-popup' && route.tap_action?.popup_id === popupId) {
        return true;
      }
      if (route.hold_action?.action === 'open-popup' && route.hold_action?.popup_id === popupId) {
        return true;
      }
      if (
        route.double_tap_action?.action === 'open-popup' &&
        route.double_tap_action?.popup_id === popupId
      ) {
        return true;
      }
      return false;
    };

    // Recursively scan all items in the layout for navigation modules
    const findNavReference = (items: any[]): string | null => {
      if (!items || !Array.isArray(items)) return null;

      for (const item of items) {
        if (item.type === 'navigation') {
          const navModule = item as NavigationModule;
          const navName =
            (item as any).module_name || navModule.name || `Navigation (${navModule.id.slice(-6)})`;

          // Check routes
          if (navModule.nav_routes) {
            for (const route of navModule.nav_routes) {
              if (routeReferencesPopup(route)) return navName;
            }
          }

          // Check stack children
          if (navModule.nav_stacks) {
            for (const stack of navModule.nav_stacks) {
              if (stack.children) {
                for (const child of stack.children) {
                  if (routeReferencesPopup(child)) return navName;
                }
              }
            }
          }

          // Check media player inactive_tap_action
          if (
            navModule.nav_media_player?.inactive_tap_action?.action === 'open-popup' &&
            navModule.nav_media_player?.inactive_tap_action?.popup_id === popupId
          ) {
            return navName;
          }
        }

        // Recurse into rows (columns)
        if (item.columns && Array.isArray(item.columns)) {
          for (const column of item.columns) {
            if (column.modules) {
              const found = findNavReference(column.modules);
              if (found) return found;
            }
          }
        }

        // Recurse into nested modules (containers)
        if (item.modules && Array.isArray(item.modules)) {
          const found = findNavReference(item.modules);
          if (found) return found;
        }
      }
      return null;
    };

    return findNavReference(config.layout.rows);
  }

  /**
   * Get available modules from the config that can be used as popup triggers.
   * Excludes popup modules and the current module itself.
   */
  private _getAvailableModulesForTrigger(
    currentPopupId: string,
    config?: UltraCardConfig
  ): Array<{ value: string; label: string }> {
    const modules: Array<{ value: string; label: string }> = [];

    if (!config || !config.layout || !config.layout.rows) return modules;

    // Helper to recursively collect modules from rows/columns/containers
    const collectModules = (items: any[], depth = 0): void => {
      if (!items || !Array.isArray(items)) return;

      for (const item of items) {
        // Skip if it's the current popup module
        if (item.id === currentPopupId) continue;

        // Skip popup modules (can't trigger a popup from another popup)
        if (item.type === 'popup') continue;

        // Skip pagebreak modules
        if (item.type === 'pagebreak') continue;

        // Handle rows - recurse into columns
        if (item.columns && Array.isArray(item.columns)) {
          for (const column of item.columns) {
            if (column.modules) {
              collectModules(column.modules, depth + 1);
            }
          }
          continue;
        }

        // Check if this is a module with a type (not a row/column container)
        if (item.type) {
          // Add this module as an option
          const moduleType = item.type.charAt(0).toUpperCase() + item.type.slice(1);

          // Get the best available name for this module based on its type
          // Check name property first - ensure it's a non-empty string
          let moduleName: string | null = null;

          // Primary: Check the custom module_name field (set in Module Settings)
          if (item.module_name && typeof item.module_name === 'string' && item.module_name.trim()) {
            moduleName = item.module_name.trim();
          }
          // Secondary: Check the legacy name field (BaseModule.name)
          else if (item.name && typeof item.name === 'string' && item.name.trim()) {
            moduleName = item.name.trim();
          }

          // Tertiary: Type-specific fallbacks (entity names, labels, etc.)
          if (!moduleName) {
            switch (item.type) {
              case 'info':
                // Info modules might have entity-based names
                if (item.info_entities?.[0]?.label && item.info_entities[0].label.trim()) {
                  moduleName = item.info_entities[0].label.trim();
                } else if (item.info_entities?.[0]?.entity) {
                  // Get friendly name from entity ID
                  moduleName = item.info_entities[0].entity.split('.').pop() || null;
                }
                break;
              case 'icon':
                if (item.icons?.[0]?.label && item.icons[0].label.trim()) {
                  moduleName = item.icons[0].label.trim();
                } else if (item.icons?.[0]?.entity) {
                  moduleName = item.icons[0].entity.split('.').pop() || null;
                }
                break;
              case 'bar':
              case 'button':
              case 'text':
              case 'camera':
              case 'climate':
              case 'light':
              case 'slider':
                moduleName =
                  (item.label && item.label.trim()) ||
                  (item.title && item.title.trim()) ||
                  (item.entity ? item.entity.split('.').pop() : null);
                break;
              case 'image':
                moduleName = (item.title && item.title.trim()) || null;
                break;
              case 'graphs':
                moduleName = (item.title && item.title.trim()) || null;
                break;
              case 'horizontal':
              case 'vertical':
              case 'accordion':
                moduleName = (item.title && item.title.trim()) || null;
                break;
              default:
                moduleName =
                  (item.title && item.title.trim()) ||
                  (item.title_text && item.title_text.trim()) ||
                  (item.trigger_button_text && item.trigger_button_text.trim()) ||
                  null;
            }
          }

          // Final fallback: Show truncated ID
          if (!moduleName) {
            // Extract just the timestamp part for a shorter display
            const idMatch = item.id.match(/\d{13}/);
            if (idMatch) {
              moduleName = `ID: ...${idMatch[0].slice(-6)}`;
            } else {
              moduleName = `ID: ${item.id.slice(-12)}`;
            }
          }

          const label = `${moduleType}: ${moduleName}`;

          modules.push({
            value: item.id,
            label: label,
          });
        }

        // Recurse into nested modules for containers like horizontal, vertical, accordion, slider
        if (item.modules && Array.isArray(item.modules)) {
          collectModules(item.modules, depth + 1);
        }
      }
    };

    // Start from the card's layout.rows array
    collectModules(config.layout.rows);

    return modules;
  }

  /**
   * Render the module trigger configuration UI
   */
  private _renderModuleTriggerConfig(
    popupModule: PopupModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const availableModules = this._getAvailableModulesForTrigger(popupModule.id, config);
    const selectedModuleId = popupModule.trigger_module_id || '';

    // Find the selected module's label for display
    const selectedModule = availableModules.find(m => m.value === selectedModuleId);

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.popup.trigger.module_trigger_title', lang, 'Module Trigger')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize(
            'editor.popup.trigger.module_trigger_desc',
            lang,
            'Select a module in this card that will open the popup when tapped. The selected module will have its tap action overridden to open this popup instead.'
          )}
        </div>

        ${availableModules.length > 0
          ? html`
              ${this.renderFieldSection(
                localize('editor.popup.trigger.select_module', lang, 'Select Module'),
                localize(
                  'editor.popup.trigger.select_module_desc',
                  lang,
                  'Choose which module should trigger this popup when clicked.'
                ),
                hass,
                { trigger_module_id: selectedModuleId },
                [
                  this.selectField('trigger_module_id', [
                    {
                      value: '',
                      label: localize(
                        'editor.popup.trigger.no_module',
                        lang,
                        '-- Select a Module --'
                      ),
                    },
                    ...availableModules,
                  ]),
                ],
                (e: CustomEvent) => {
                  const next = e.detail.value.trigger_module_id;
                  const prev = selectedModuleId;
                  if (next === prev) return;
                  updateModule({ trigger_module_id: next } as any);
                  setTimeout(() => {
                    this.triggerPreviewUpdate();
                  }, 50);
                }
              )}
              ${selectedModule
                ? html`
                    <div
                      style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-success-color, 76, 175, 80), 0.1); border-left: 3px solid var(--success-color, #4caf50); border-radius: 4px; font-size: 13px; line-height: 1.5;"
                    >
                      <div
                        style="font-weight: 600; margin-bottom: 4px; color: var(--success-color, #4caf50);"
                      >
                        <ha-icon
                          icon="mdi:check-circle"
                          style="--mdc-icon-size: 16px; vertical-align: middle;"
                        ></ha-icon>
                        ${localize('editor.popup.trigger.module_linked', lang, 'Module Linked')}
                      </div>
                      <div style="color: var(--primary-text-color);">
                        ${localize(
                          'editor.popup.trigger.module_linked_desc',
                          lang,
                          'Tapping on "${module}" will now open this popup.'
                        ).replace('${module}', selectedModule.label)}
                      </div>
                    </div>
                  `
                : ''}
            `
          : html`
              <div
                style="padding: 16px; background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1); border-left: 3px solid var(--warning-color, #ff9800); border-radius: 4px; font-size: 13px; line-height: 1.5;"
              >
                <div
                  style="font-weight: 600; margin-bottom: 4px; color: var(--warning-color, #ff9800);"
                >
                  <ha-icon
                    icon="mdi:alert"
                    style="--mdc-icon-size: 16px; vertical-align: middle;"
                  ></ha-icon>
                  ${localize(
                    'editor.popup.trigger.no_modules_available',
                    lang,
                    'No Modules Available'
                  )}
                </div>
                <div style="color: var(--primary-text-color);">
                  ${localize(
                    'editor.popup.trigger.no_modules_available_desc',
                    lang,
                    'Add other modules to this card first, then you can select one to trigger this popup.'
                  )}
                </div>
              </div>
            `}
      </div>
    `;
  }

  private _renderTriggerLogic(
    popupModule: PopupModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const conditions = popupModule.trigger_conditions || [];
    const triggerMode = popupModule.trigger_mode || 'manual';
    const lang = hass?.locale?.language || 'en';

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.popup.trigger_logic.section_title', lang, 'Trigger Logic')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize(
            'editor.popup.trigger_logic.section_desc',
            lang,
            'Control when this popup automatically opens based on conditions.'
          )}
        </div>
        <div
          style="margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1); border-left: 3px solid var(--info-color, #03a9f4); border-radius: 4px; font-size: 13px; line-height: 1.5;"
        >
          <div style="font-weight: 600; margin-bottom: 4px; color: var(--info-color, #03a9f4);">
            <ha-icon
              icon="mdi:information"
              style="--mdc-icon-size: 16px; vertical-align: middle;"
            ></ha-icon>
            ${localize('editor.popup.trigger_logic.note_title', lang, 'Important Note')}
          </div>
          <div style="color: var(--primary-text-color);">
            ${unsafeHTML(
              localize(
                'editor.popup.trigger_logic.note_message',
                lang,
                'These trigger conditions control <strong>when the popup opens</strong>. This is different from the Logic tab, which controls <strong>whether this module is visible</strong> on the card.'
              )
            )}
          </div>
        </div>

        <!-- Trigger Mode Selection -->
        ${this.renderFieldSection(
          localize('editor.popup.trigger_logic.mode_title', lang, 'Popup State Control'),
          localize(
            'editor.popup.trigger_logic.mode_desc',
            lang,
            'Choose how the popup state is controlled.'
          ),
          hass,
          { trigger_mode: triggerMode },
          [
            this.selectField('trigger_mode', [
              {
                value: 'manual',
                label: localize('editor.popup.trigger_logic.mode_manual', lang, 'Manual'),
              },
              {
                value: 'every',
                label: localize(
                  'editor.popup.trigger_logic.mode_every',
                  lang,
                  'Open if EVERY condition is met'
                ),
              },
              {
                value: 'any',
                label: localize(
                  'editor.popup.trigger_logic.mode_any',
                  lang,
                  'Open if ANY condition is met'
                ),
              },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ trigger_mode: e.detail.value.trigger_mode } as any);
            setTimeout(() => {
              this.triggerPreviewUpdate();
            }, 50);
          }
        )}

        <!-- Auto Close Toggle (for logic triggers) -->
        ${triggerMode !== 'manual'
          ? this.renderSettingsSection('', '', [
              {
                title: localize('editor.popup.trigger_logic.auto_close', lang, 'Auto Close'),
                description: localize(
                  'editor.popup.trigger_logic.auto_close_desc',
                  lang,
                  'Automatically close popup when conditions become false.'
                ),
                hass,
                data: { auto_close: popupModule.auto_close !== false },
                schema: [this.booleanField('auto_close')],
                onChange: (e: CustomEvent) => {
                  updateModule(e.detail.value);
                  setTimeout(() => {
                    this.triggerPreviewUpdate();
                  }, 50);
                },
              },
            ])
          : ''}

        <!-- Conditions List -->
        ${triggerMode !== 'manual'
          ? html`
              <div style="margin-top: 24px;">
                <div
                  style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;"
                >
                  <div style="font-size: 16px; font-weight: 600;">
                    ${localize('editor.popup.trigger_logic.conditions', lang, 'Conditions')}
                  </div>
                  <button
                    @click=${() => {
                      const newCond = {
                        id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        type: 'entity_state',
                        ui_expanded: true,
                        entity: '',
                        operator: '=',
                        value: '',
                      } as any;
                      const next = [...conditions, newCond];
                      updateModule({ trigger_conditions: next } as any);
                    }}
                    style="display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px dashed var(--primary-color); background:none; color:var(--primary-color); border-radius:6px; cursor:pointer;"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    ${localize('editor.popup.trigger_logic.add_condition', lang, 'Add Condition')}
                  </button>
                </div>

                <div style="display:flex; flex-direction: column; gap: 12px;">
                  ${conditions.length === 0
                    ? html`
                        <div
                          style="padding: 20px; background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1); border: 1px dashed var(--warning-color, #ff9800); border-radius: 8px;"
                        >
                          <div
                            style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"
                          >
                            <ha-icon
                              icon="mdi:alert-circle-outline"
                              style="--mdc-icon-size: 24px; color: var(--warning-color, #ff9800);"
                            ></ha-icon>
                            <span style="font-weight: 600; color: var(--primary-text-color);">
                              ${localize(
                                'editor.popup.trigger_logic.no_conditions_title',
                                lang,
                                'No Conditions Configured'
                              )}
                            </span>
                          </div>
                          <div
                            style="color: var(--secondary-text-color); line-height: 1.5; margin-bottom: 12px;"
                          >
                            ${localize(
                              'editor.popup.trigger_logic.no_conditions',
                              lang,
                              'Click "Add Condition" below to create your first trigger condition. The popup will remain closed until you add at least one condition.'
                            )}
                          </div>
                          <div
                            style="font-size: 12px; color: var(--secondary-text-color); font-style: italic; padding: 8px; background: rgba(0, 0, 0, 0.1); border-radius: 4px;"
                          >
                            <strong>Tip:</strong> ${unsafeHTML(
                              localize(
                                'editor.popup.trigger_logic.helper_tip',
                                lang,
                                'To open a popup based on a helper, add an <strong>Entity State</strong> condition, select your helper entity, set operator to <strong>=</strong>, and enter <strong>on</strong> as the value.'
                              )
                            )}
                          </div>
                        </div>
                      `
                    : ''}
                  ${conditions.map((cond, index) =>
                    this._renderTriggerCondition(cond, index, conditions, hass, updateModule)
                  )}
                </div>
              </div>
            `
          : html`
              <div
                style="margin-top: 16px; padding: 16px; background: rgba(var(--rgb-secondary-text-color), 0.05); border-radius: 8px; color: var(--secondary-text-color);"
              >
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <ha-icon icon="mdi:hand-pointing-right" style="--mdc-icon-size: 20px;"></ha-icon>
                  <span style="font-weight: 600; color: var(--primary-text-color);">
                    ${localize('editor.popup.trigger_logic.manual_mode_title', lang, 'Manual Mode')}
                  </span>
                </div>
                <div style="line-height: 1.5;">
                  ${unsafeHTML(
                    localize(
                      'editor.popup.trigger_logic.manual_note',
                      lang,
                      'Popup state is controlled manually by user interaction. Use the <strong>Default State</strong> setting in the <strong>General</strong> tab to choose whether the popup starts open or closed when the card loads.'
                    )
                  )}
                </div>
              </div>
            `}
      </div>
    `;
  }

  private _renderTriggerCondition(
    cond: any,
    index: number,
    conditions: any[],
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';
    const onChange = (updates: Record<string, any>) => {
      const next = [...conditions];
      next[index] = { ...cond, ...updates };
      updateModule({ trigger_conditions: next } as any);
    };
    const remove = () => {
      const next = conditions.filter((_, i) => i !== index);
      updateModule({ trigger_conditions: next } as any);
    };

    const expanded = cond.ui_expanded !== false;
    const headerLabel = cond.custom_name || `Condition ${index + 1}`;

    return html`
      <div
        class="uc-condition-item"
        style="border:1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); overflow: hidden;"
      >
        <div
          class="uc-condition-header"
          style="display:flex; align-items:center; justify-content: space-between; gap:10px; padding: 12px 14px; border-bottom: ${expanded
            ? '1px solid var(--divider-color)'
            : 'none'};"
        >
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <button
              @click=${() => onChange({ ui_expanded: !expanded })}
              title=${expanded ? 'Collapse' : 'Expand'}
              style="background:none; border:none; color:var(--secondary-text-color); cursor:pointer; padding:4px;"
            >
              <ha-icon icon=${expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}></ha-icon>
            </button>
            <span
              style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
              >${headerLabel}</span
            >
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button
              @click=${() => {
                const copy = {
                  ...cond,
                  id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                };
                const next = [...conditions];
                next.splice(index + 1, 0, copy);
                updateModule({ trigger_conditions: next } as any);
              }}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--secondary-text-color);"
              title="Duplicate Condition"
            >
              <ha-icon icon="mdi:content-copy" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
            <button
              @click=${remove}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--error-color);"
              title="Remove Condition"
            >
              <ha-icon icon="mdi:trash-can-outline" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
          </div>
        </div>

        ${expanded
          ? html`
              <div style="padding: 12px 14px; display:flex; flex-direction:column; gap:12px;">
                ${this.renderFieldSection(
                  localize('editor.popup.trigger_logic.custom_name', lang, 'Custom Name'),
                  localize(
                    'editor.popup.trigger_logic.custom_name_desc',
                    lang,
                    'Optional: Give this condition a custom name'
                  ),
                  hass,
                  { custom_name: cond.custom_name || '' },
                  [this.textField('custom_name')],
                  (e: CustomEvent) => onChange(e.detail.value)
                )}
                ${this.renderFieldSection(
                  localize('editor.popup.trigger_logic.condition_type', lang, 'Condition Type'),
                  '',
                  hass,
                  { type: cond.type || 'entity_state' },
                  [
                    this.selectField('type', [
                      {
                        value: 'entity_state',
                        label: localize(
                          'editor.popup.trigger_logic.type_entity_state',
                          lang,
                          'Entity State'
                        ),
                      },
                      {
                        value: 'entity_attribute',
                        label: localize(
                          'editor.popup.trigger_logic.type_entity_attribute',
                          lang,
                          'Entity Attribute'
                        ),
                      },
                      {
                        value: 'time',
                        label: localize('editor.popup.trigger_logic.type_time', lang, 'Time Range'),
                      },
                      {
                        value: 'template',
                        label: localize(
                          'editor.popup.trigger_logic.type_template',
                          lang,
                          'Template'
                        ),
                      },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const newType = e.detail.value.type;
                    const base: any = { type: newType };
                    if (newType === 'entity_state') {
                      Object.assign(base, { entity: '', operator: '=', value: '' });
                    } else if (newType === 'entity_attribute') {
                      Object.assign(base, { entity: '', attribute: '', operator: '=', value: '' });
                    } else if (newType === 'time') {
                      Object.assign(base, { time_from: '00:00', time_to: '23:59' });
                    } else if (newType === 'template') {
                      Object.assign(base, { template: '' });
                    }
                    onChange(base);
                  }
                )}
                ${(() => {
                  if ((cond.type || 'entity_state') === 'entity_state') {
                    return html`
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.entity', lang, 'Entity'),
                        '',
                        hass,
                        { entity: cond.entity || '' },
                        [this.entityField('entity')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.operator', lang, 'Operator'),
                        '',
                        hass,
                        { operator: cond.operator || '=' },
                        [
                          this.selectField('operator', [
                            { value: '=', label: '=' },
                            { value: '!=', label: '!=' },
                            { value: '>', label: '>' },
                            { value: '>=', label: '>=' },
                            { value: '<', label: '<' },
                            { value: '<=', label: '<=' },
                            { value: 'contains', label: 'contains' },
                            { value: 'not_contains', label: 'not_contains' },
                            { value: 'has_value', label: 'has_value' },
                            { value: 'no_value', label: 'no_value' },
                          ]),
                        ],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.value', lang, 'Value'),
                        '',
                        hass,
                        { value: cond.value || '' },
                        [this.textField('value')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                    `;
                  }

                  if (cond.type === 'entity_attribute') {
                    return html`
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.entity', lang, 'Entity'),
                        '',
                        hass,
                        { entity: cond.entity || '' },
                        [this.entityField('entity')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.attribute', lang, 'Attribute'),
                        '',
                        hass,
                        { attribute: cond.attribute || '' },
                        [this.textField('attribute')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.operator', lang, 'Operator'),
                        '',
                        hass,
                        { operator: cond.operator || '=' },
                        [
                          this.selectField('operator', [
                            { value: '=', label: '=' },
                            { value: '!=', label: '!=' },
                            { value: '>', label: '>' },
                            { value: '>=', label: '>=' },
                            { value: '<', label: '<' },
                            { value: '<=', label: '<=' },
                            { value: 'contains', label: 'contains' },
                            { value: 'not_contains', label: 'not_contains' },
                          ]),
                        ],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.value', lang, 'Value'),
                        '',
                        hass,
                        { value: cond.value || '' },
                        [this.textField('value')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                    `;
                  }

                  if (cond.type === 'time') {
                    return html`
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.time_from', lang, 'From'),
                        '',
                        hass,
                        { time_from: cond.time_from || '00:00' },
                        [this.textField('time_from')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.popup.trigger_logic.time_to', lang, 'To'),
                        '',
                        hass,
                        { time_to: cond.time_to || '23:59' },
                        [this.textField('time_to')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                    `;
                  }

                  return html`
                    <div class="field-container" style="margin-bottom: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                      >
                        ${localize('editor.popup.trigger_logic.template', lang, 'Template')}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                      >
                        ${localize(
                          'editor.popup.trigger_logic.template_desc',
                          lang,
                          'Jinja2 template that should evaluate to true/false to open the popup.'
                        )}
                      </div>
                      <ultra-template-editor
                        .hass=${hass}
                        .value=${cond.template || ''}
                        .placeholder=${"{% if states('sensor.example') | int > 50 %}true{% else %}false{% endif %}"}
                        .minHeight=${100}
                        .maxHeight=${300}
                        @value-changed=${(e: CustomEvent) => onChange({ template: e.detail.value })}
                      ></ultra-template-editor>
                    </div>
                  `;
                })()}
              </div>
            `
          : ''}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const popupModule = module as PopupModule;
    const lang = hass?.locale?.language || 'en';

    // CRITICAL FIX: Create unique popup key that includes card instance ID
    // This prevents cross-card state bleeding when two cards have popups with the same module ID
    const cardInstanceId = (config as any)?.__ucInstanceId || '';
    const uniquePopupKey = cardInstanceId ? `${cardInstanceId}:${popupModule.id}` : popupModule.id;

    // CRITICAL FIX: Ensure trigger_mode is 'manual' for non-logic triggers
    // This prevents logic evaluation from interfering with button/icon/image/page_load triggers
    const triggerType = popupModule.trigger_type || 'button';
    if (triggerType !== 'logic' && popupModule.trigger_mode !== 'manual') {
      popupModule.trigger_mode = 'manual';
    }

    // Handle module trigger registration
    // When trigger_type is 'module', register this popup to be opened by the selected module
    if (triggerType === 'module' && popupModule.trigger_module_id) {
      registerPopupTrigger(popupModule.id, popupModule.trigger_module_id);
    } else {
      // Unregister if not using module trigger anymore
      unregisterPopupTrigger(popupModule.id);
    }

    // Keep timer config in sync with latest module config.
    // Critical: if the user disables the timer, any previously scheduled timer must NOT close the popup.
    const timerEnabled = popupModule.auto_close_timer_enabled === true;
    popupTimerEnabled.set(uniquePopupKey, timerEnabled);
    if (!timerEnabled) {
      this._clearAutoCloseTimer(uniquePopupKey);
    }

    // Evaluate trigger logic for logic-based triggers
    let logicDeterminedState: boolean | null = null;

    if (triggerType === 'logic') {
      const triggerMode = popupModule.trigger_mode || 'manual';

      if (triggerMode === 'every' || triggerMode === 'any') {
        // Don't auto-open if no conditions are configured yet
        // This prevents blocking the editor when user first switches to logic mode
        const conditions = popupModule.trigger_conditions || [];

        // Check if we have any CONFIGURED conditions (not just empty placeholders)
        const hasConfiguredConditions = conditions.some((cond: any) => {
          if (!cond || !cond.type) return false;

          switch (cond.type) {
            case 'entity_state':
              return cond.entity && cond.entity.trim() !== '';
            case 'entity_attribute':
              return (
                cond.entity &&
                cond.entity.trim() !== '' &&
                cond.attribute &&
                cond.attribute.trim() !== ''
              );
            case 'time':
              return cond.time_from && cond.time_to;
            case 'template':
              return cond.template && cond.template.trim() !== '';
            default:
              return false;
          }
        });

        if (hasConfiguredConditions) {
          // Use logic service to evaluate trigger conditions
          logicService.setHass(hass);
          const conditionsResult = logicService.evaluateDisplayConditions(conditions, triggerMode);
          logicDeterminedState = conditionsResult;
        } else {
          // No configured conditions yet - keep popup closed so user can configure
          logicDeterminedState = false;
        }
      }
    } else if (triggerType === 'page_load') {
      // Page load trigger: only open on initial load (when state doesn't exist yet)
      // Once closed by user, don't reopen until page reloads (which resets popupStates Map)
      if (!popupStates.has(uniquePopupKey)) {
        logicDeterminedState = true;
      }
      // If state already exists, don't set logicDeterminedState - let user's manual close persist
    }

    // Initialize popup state if not exists
    if (!popupStates.has(uniquePopupKey)) {
      // Use logic-determined state if available, otherwise use default_open
      const initialState =
        logicDeterminedState !== null ? logicDeterminedState : popupModule.default_open || false;
      popupStates.set(uniquePopupKey, initialState);

      // Track initial logic state
      if (logicDeterminedState !== null) {
        lastLogicStates.set(uniquePopupKey, logicDeterminedState);
      }

      // When auto_close is off and logic opens the popup initially, mark as manually opened
      if (initialState && triggerType === 'logic' && popupModule.auto_close === false) {
        manuallyOpenedPopups.add(uniquePopupKey);
      }

      // Start auto-close timer if popup opens initially and timer is enabled
      if (initialState && popupModule.auto_close_timer_enabled) {
        this._startAutoCloseTimer(popupModule, uniquePopupKey);
      }
    } else if (logicDeterminedState !== null && triggerType === 'logic') {
      // Key fix: Only react to logic STATE CHANGES, not constant true/false values
      const lastLogicState = lastLogicStates.get(uniquePopupKey);
      const logicStateChanged = lastLogicState !== logicDeterminedState;

      // Update tracked logic state
      lastLogicStates.set(uniquePopupKey, logicDeterminedState);

      // Only update popup state if logic condition actually changed
      // IMPORTANT: Don't overwrite manually opened popups - they should stay open until user closes them
      const isManuallyOpened = manuallyOpenedPopups.has(uniquePopupKey);
      if (logicStateChanged && !isManuallyOpened) {
        const wasOpen = popupStates.get(uniquePopupKey) || false;

        if (logicDeterminedState) {
          // Always allow opening on rising edge
          popupStates.set(uniquePopupKey, true);

          // When auto_close is off, mark as manually opened for extra protection
          // This prevents any re-render or secondary code path from closing the popup
          // The close button and auto-close timer still work because they clear manuallyOpenedPopups
          if (popupModule.auto_close === false) {
            manuallyOpenedPopups.add(uniquePopupKey);
          }

          // Start timer if enabled
          if (!wasOpen && popupModule.auto_close_timer_enabled) {
            this._startAutoCloseTimer(popupModule, uniquePopupKey);
          }
        } else if (popupModule.auto_close !== false) {
          // Only close on falling edge when auto_close is enabled
          popupStates.set(uniquePopupKey, false);
          this._clearAutoCloseTimer(uniquePopupKey);
        }
      }
    }

    // Read popup state, but if manually opened, ensure it stays true
    let isOpen = popupStates.get(uniquePopupKey) || false;
    const isManuallyOpened = manuallyOpenedPopups.has(uniquePopupKey);

    // If manually opened, force state to true (protects against re-render resets)
    if (isManuallyOpened && !isOpen) {
      popupStates.set(uniquePopupKey, true);
      isOpen = true;
    }

    // Forward declaration - will be assigned later
    // This allows handleTriggerClick to call renderPopupToPortal
    let renderPopupToPortal: (initialInvisibleRender?: boolean) => void;

    // Register external popup open listener (for module triggers)
    // BUGFIX: Use popup module ID as listener key (not uniquePopupKey) to prevent listener accumulation
    // During editing, uniquePopupKey changes because cardInstanceId changes with Date.now(),
    // causing multiple listeners to be added but never removed, resulting in multiple popups opening
    const listenerKey = `__ultraPopupOpenListener_${popupModule.id}`;
    const w = window as any;

    // Always remove existing listener before adding new one (handles cardInstanceId changes during editing)
    if (w[listenerKey]) {
      window.removeEventListener('ultra-popup-open', w[listenerKey]);
      delete w[listenerKey];
    }

    const handleExternalOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      const eventPopupId = customEvent.detail?.popupId;
      // Match against this specific popup's module ID
      if (eventPopupId === popupModule.id) {
        popupStates.set(uniquePopupKey, true);
        manuallyOpenedPopups.add(uniquePopupKey);
        if (popupModule.auto_close_timer_enabled) {
          this._startAutoCloseTimer(popupModule, uniquePopupKey);
        }
        // Render popup directly
        setTimeout(() => {
          if (renderPopupToPortal) {
            renderPopupToPortal(false);
            // TEMPLATE FIX: Schedule a card update after templates have had time to evaluate
            setTimeout(() => {
              if (popupStates.get(uniquePopupKey)) {
                // Set refresh flag so portal content will be re-rendered with evaluated templates
                popupNeedsRefresh.set(uniquePopupKey, true);
                this.triggerPreviewUpdate(true);
              }
            }, 500);
          }
        }, 0);
      }
    };
    window.addEventListener('ultra-popup-open', handleExternalOpen);
    w[listenerKey] = handleExternalOpen;

    // Register listener for child module updates (for tabs, graphs, etc. inside popup)
    // When a child module triggers an update, the popup needs to re-render its content
    const childUpdateListenerKey = `__ultraPopupChildUpdateListener_${popupModule.id}`;

    // Always remove existing listener before adding new one
    if (w[childUpdateListenerKey]) {
      window.removeEventListener('ultra-card-template-update', w[childUpdateListenerKey]);
      delete w[childUpdateListenerKey];
    }

    const handleChildUpdate = (e: Event) => {
      // Only refresh if popup is currently open
      if (popupStates.get(uniquePopupKey) && popupPortals.has(uniquePopupKey)) {
        // Mark popup for refresh so its content will be re-rendered
        popupNeedsRefresh.set(uniquePopupKey, true);
        // Re-render the portal directly (don't wait for another card render cycle)
        setTimeout(() => {
          if (renderPopupToPortal && popupStates.get(uniquePopupKey)) {
            renderPopupToPortal(false);
          }
        }, 10);
      }
    };
    window.addEventListener('ultra-card-template-update', handleChildUpdate);
    w[childUpdateListenerKey] = handleChildUpdate;

    // Handle trigger click
    const handleTriggerClick = (e: Event) => {
      e.stopPropagation();
      if (triggerType === 'logic' && popupModule.trigger_mode !== 'manual') {
        // For logic-controlled triggers, don't allow manual toggle unless mode is manual
        return;
      }
      popupStates.set(uniquePopupKey, true);
      // Mark as manually opened - popup will stay open until explicitly closed
      manuallyOpenedPopups.add(uniquePopupKey);

      // Start auto-close timer if enabled
      if (popupModule.auto_close_timer_enabled) {
        this._startAutoCloseTimer(popupModule, uniquePopupKey);
      }

      // Render popup immediately
      renderPopupToPortal(false);

      // TEMPLATE FIX: Schedule a card update after templates have had time to evaluate
      // This handles the "Template processing..." issue on first open
      // Portal-rendered popups don't get automatic re-renders from hass updates
      setTimeout(() => {
        if (popupStates.get(uniquePopupKey)) {
          // Set refresh flag so portal content will be re-rendered with evaluated templates
          popupNeedsRefresh.set(uniquePopupKey, true);
          this.triggerPreviewUpdate(true);
        }
      }, 500);
    };

    // Handle close
    const handleClose = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();

      // Close the popup
      popupStates.set(uniquePopupKey, false);
      // Remove from manually opened set so re-renders don't keep it open
      manuallyOpenedPopups.delete(uniquePopupKey);

      // Clear auto-close timer
      this._clearAutoCloseTimer(uniquePopupKey);

      // Restore HA editor overlays (works in all contexts, does nothing if none were hidden)
      restoreHAEditorOverlays();

      // Directly remove the portal element to ensure immediate close
      // This is necessary because Live Preview contexts may not re-render properly
      const portal = popupPortals.get(uniquePopupKey);
      if (portal) {
        // Disconnect mutation observer
        const observer = (portal as any)._ultraInertObserver;
        if (observer) {
          observer.disconnect();
        }
        portal.remove();
        popupPortals.delete(uniquePopupKey);
      }

      // Note: We don't update lastLogicStates here
      // This allows the popup to stay closed even if logic conditions are still true
      // Popup will only reopen when conditions change from false -> true (rising edge)

      this.triggerPreviewUpdate(true);
    };

    // Handle overlay click (closes popup)
    const handleOverlayClick = (e: Event) => {
      e.stopPropagation();
      handleClose(e);
    };

    // Determine title text
    let titleText = '';
    if (popupModule.show_title) {
      if (popupModule.title_mode === 'entity' && popupModule.title_entity) {
        const entityState = hass?.states[popupModule.title_entity];
        const entityName =
          entityState?.attributes?.friendly_name ||
          popupModule.title_entity.split('.')[1] ||
          popupModule.title_entity;
        const entityStateValue = entityState?.state || popupModule.title_entity;

        if (popupModule.show_entity_name) {
          titleText = `${entityName}: ${entityStateValue}`;
        } else {
          titleText = entityStateValue;
        }
      } else {
        titleText = popupModule.title_text || 'Popup Title';
      }
    }

    // Render trigger element
    const renderTrigger = () => {
      if (triggerType === 'page_load' || triggerType === 'logic') {
        // No visible trigger for page_load or logic
        return html``;
      }

      // Get alignment
      const alignment = popupModule.trigger_alignment || 'center';
      const justifyContent =
        alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center';

      let triggerElement = html``;

      if (triggerType === 'button') {
        const buttonText = popupModule.trigger_button_text || 'Open Popup';
        const buttonIcon = popupModule.trigger_button_icon || '';
        const isFullWidth = popupModule.trigger_button_full_width || false;

        triggerElement = html`
          <button
            class="swiper-no-swiping popup-trigger"
            @click=${handleTriggerClick}
            @touchend=${(e: Event) => {
              // Explicitly handle touch end to ensure popup opens on mobile
              e.preventDefault();
              e.stopPropagation();
              handleTriggerClick(e);
            }}
            style="display: flex; align-items: center; justify-content: center; gap: ${buttonIcon
              ? '8px'
              : '0'}; padding: 12px 24px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.2s ease; touch-action: manipulation; pointer-events: auto; ${isFullWidth
              ? 'width: 100%;'
              : ''}"
          >
            ${buttonIcon
              ? html`<ha-icon icon="${buttonIcon}" style="--mdc-icon-size: 24px;"></ha-icon>`
              : ''}
            ${buttonText}
          </button>
        `;
      } else if (triggerType === 'image') {
        const imageType = popupModule.trigger_image_type || 'url';
        const isFullWidth = popupModule.trigger_image_full_width || false;

        // Get image URL based on type
        let imageUrl = '';
        if (imageType === 'upload' || imageType === 'url') {
          imageUrl = popupModule.trigger_image_url || '';
          if (imageUrl && imageType === 'upload') {
            // Use getImageUrl utility for uploaded images
            imageUrl = getImageUrl(hass, imageUrl);
          }
        } else if (imageType === 'entity' && popupModule.trigger_image_entity) {
          const entityState = hass?.states[popupModule.trigger_image_entity];
          if (entityState?.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
            // Convert relative URL to absolute if needed
            if (imageUrl.startsWith('/')) {
              const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
              imageUrl = `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
            }
          } else if (
            entityState?.state &&
            (entityState.state.startsWith('http') ||
              entityState.state.startsWith('/') ||
              entityState.state.startsWith('data:'))
          ) {
            imageUrl = entityState.state;
            if (imageUrl.startsWith('/')) {
              const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
              imageUrl = `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
            }
          }
        }

        if (!imageUrl) {
          triggerElement = html`
            <div
              style="padding: 24px; text-align: center; color: var(--secondary-text-color); border: 1px dashed var(--divider-color); border-radius: 8px;"
            >
              ${localize('editor.popup.trigger.no_image', lang, 'No image configured')}
            </div>
          `;
        } else {
          triggerElement = html`
            <img
              class="swiper-no-swiping popup-trigger"
              src="${imageUrl}"
              @click=${handleTriggerClick}
              @touchend=${(e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                handleTriggerClick(e);
              }}
              style="${isFullWidth
                ? 'width: 100%;'
                : 'max-width: 200px;'} cursor: pointer; border-radius: 8px; transition: transform 0.2s ease; display: block; touch-action: manipulation; pointer-events: auto;"
              @mouseover=${(e: Event) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1.05)';
              }}
              @mouseout=${(e: Event) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1)';
              }}
            />
          `;
        }
      } else if (triggerType === 'icon') {
        const triggerIcon = popupModule.trigger_icon || 'mdi:information';
        triggerElement = html`
          <ha-icon
            class="swiper-no-swiping popup-trigger"
            icon="${triggerIcon}"
            @click=${handleTriggerClick}
            @touchend=${(e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              handleTriggerClick(e);
            }}
            style="--mdc-icon-size: 48px; cursor: pointer; color: var(--primary-color); transition: transform 0.2s ease; touch-action: manipulation; pointer-events: auto;"
            @mouseover=${(e: Event) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'scale(1.1)';
            }}
            @mouseout=${(e: Event) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'scale(1)';
            }}
          ></ha-icon>
        `;
      }

      // Wrap trigger in alignment container
      // Use inline-flex to minimize space taken, only expand if needed
      // CRITICAL: Add swiper-no-swiping class to container to prevent swipe interference
      // pointer-events: auto ensures clicks work in preview contexts where parent may have pointer-events: none
      return html`
        <div
          class="swiper-no-swiping"
          style="display: inline-flex; justify-content: ${justifyContent}; width: ${alignment ===
            'left' || alignment === 'right'
            ? 'auto'
            : '100%'}; pointer-events: auto;"
        >
          ${triggerElement}
        </div>
      `;
    };

    // Get animation class
    const getAnimationClass = () => {
      const animation = popupModule.animation || 'fade';
      const animationMap: Record<string, string> = {
        fade: 'animation-fadeIn',
        scale_up: 'animation-zoomIn',
        scale_down: 'animation-zoomOut',
        slide_top: 'animation-slideInDown',
        slide_left: 'animation-slideInLeft',
        slide_right: 'animation-slideInRight',
        slide_bottom: 'animation-slideInUp',
      };
      return animationMap[animation] || 'animation-fadeIn';
    };

    // Get layout class and style
    const layout = popupModule.layout || 'default';
    let popupPositionStyle = '';
    let popupLayoutClass = '';

    if (layout === 'full_screen') {
      popupLayoutClass = 'ultra-popup-layout-full_screen';
      popupPositionStyle =
        'width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; border-radius: 0;';
    } else if (layout === 'left_panel') {
      popupLayoutClass = 'ultra-popup-layout-left_panel';
      popupPositionStyle = `width: ${popupModule.popup_width || '600px'}; height: 100vh; max-height: 100vh; margin: 0; position: absolute; left: 0; top: 0; border-radius: 0;`;
    } else if (layout === 'right_panel') {
      popupLayoutClass = 'ultra-popup-layout-right_panel';
      popupPositionStyle = `width: ${popupModule.popup_width || '600px'}; height: 100vh; max-height: 100vh; margin: 0; position: absolute; right: 0; top: 0; border-radius: 0;`;
    } else if (layout === 'top_panel') {
      popupLayoutClass = 'ultra-popup-layout-top_panel';
      popupPositionStyle =
        'width: 100vw; max-width: 100vw; margin: 0; position: absolute; top: 0; left: 0; border-radius: 0;';
    } else if (layout === 'bottom_panel') {
      popupLayoutClass = 'ultra-popup-layout-bottom_panel';
      popupPositionStyle =
        'width: 100vw; max-width: 100vw; margin: 0; position: absolute; bottom: 0; left: 0; border-radius: 0;';
    } else {
      // Default centered
      popupPositionStyle = `width: ${popupModule.popup_width || '600px'}; max-width: 90vw;`;
    }

    // Calculate close button z-index (needs to be available in renderCloseButton and requestAnimationFrame)
    const isPreviewContextForClose = previewContext === 'ha-preview' || previewContext === 'live';
    const closeButtonZIndex = isPreviewContextForClose ? '2147483647' : '2147483647';

    // Render close button
    const renderCloseButton = () => {
      if (popupModule.close_button_position === 'none') return '';

      const closeIcon = popupModule.close_button_icon || 'mdi:close';
      const closeSize = popupModule.close_button_size || 32;
      const closeColor = popupModule.close_button_color || '#ffffff';
      const offsetX = popupModule.close_button_offset_x || '0px';
      const offsetY = popupModule.close_button_offset_y || '0px';

      // Always render inside the popup - wrap in button element for reliable click handling in portal
      return html`
        <button
          @click=${handleClose}
          @touchend=${(e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose(e);
          }}
          class="ultra-popup-close-button swiper-no-swiping"
          style="
            position: absolute;
            top: calc(10px + ${offsetY});
            right: calc(10px + ${offsetX});
            z-index: ${closeButtonZIndex};
            background: none;
            border: none;
            padding: 8px;
            margin: 0;
            cursor: pointer !important;
            pointer-events: auto !important;
            touch-action: manipulation;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s ease, transform 0.2s ease;
            isolation: isolate;
          "
          @mouseover=${(e: Event) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'rgba(255,255,255,0.1)';
            target.style.transform = 'scale(1.1)';
          }}
          @mouseout=${(e: Event) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'none';
            target.style.transform = 'scale(1)';
          }}
        >
          <ha-icon
            icon="${closeIcon}"
            style="
              color: ${closeColor};
              --mdc-icon-size: ${closeSize}px;
              pointer-events: none;
            "
          ></ha-icon>
        </button>
      `;
    };

    // Render child modules
    const hasChildren = popupModule.modules && popupModule.modules.length > 0;
    const registry = getModuleRegistry();

    // PORTAL APPROACH: Render popup to document.body to escape Swiper's transform containment
    // When a parent element has CSS transform, position:fixed elements become relative to that element
    // By rendering to document.body, the popup overlay properly covers the entire viewport
    renderPopupToPortal = (initialInvisibleRender = false) => {
      // Use uniquePopupKey from parent scope (includes card instance ID)
      const portalId = `ultra-popup-portal-${uniquePopupKey}`;
      let portal = popupPortals.get(uniquePopupKey);

      // CRITICAL: Check if manually opened FIRST - this takes precedence over everything
      // Manually opened popups should NEVER close from re-renders, logic triggers, or any other automatic mechanism
      // They can ONLY be closed by: 1) User clicking close, 2) Auto-close timer (if enabled)
      const isManuallyOpenedCheck = manuallyOpenedPopups.has(uniquePopupKey);

      // Read current state directly from the Map (not the closure variable)
      let currentlyOpen = popupStates.get(uniquePopupKey) || false;

      // If manually opened, FORCE state to true - this is non-negotiable
      if (isManuallyOpenedCheck) {
        // Always set state to true if manually opened, regardless of what it currently is
        // This protects against any re-render or logic trigger that might have reset it
        popupStates.set(uniquePopupKey, true);
        currentlyOpen = true;
      }

      // Only close if NOT manually opened AND state is false
      if (!currentlyOpen && !isManuallyOpenedCheck) {
        // If closing, remove the portal and restore HA overlays
        if (portal) {
          // Disconnect mutation observer
          const observer = (portal as any)._ultraInertObserver;
          if (observer) {
            observer.disconnect();
          }
          restoreHAEditorOverlays();
          portal.remove();
          popupPortals.delete(uniquePopupKey);
        }
        return;
      }

      // At this point, we know the popup should be open (either manually opened or state is true)
      // Ensure state is definitely true
      if (!currentlyOpen) {
        popupStates.set(uniquePopupKey, true);
      }

      // Track if this is a new portal creation
      const isNewPortal = !portal;

      // Create portal container if it doesn't exist
      if (!portal) {
        portal = document.createElement('div');
        portal.id = portalId;
        portal.className = 'ultra-popup-portal';
        // Set styles individually instead of cssText (prevents commenting out)
        portal.style.position = 'fixed';
        portal.style.top = '0';
        portal.style.left = '0';
        portal.style.width = '100%';
        portal.style.height = '100%';
        portal.style.pointerEvents = 'auto';
        portal.style.zIndex = '2147483647';
        // Remove inert attribute if present
        portal.removeAttribute('inert');
        document.body.appendChild(portal);
        popupPortals.set(uniquePopupKey, portal);
      }

      // Always ensure portal is not inert on every render
      // Browser extensions or HA might add inert attribute
      portal.removeAttribute('inert');

      // Re-apply critical styles every render (in case they get overwritten)
      portal.style.position = 'fixed';
      portal.style.top = '0';
      portal.style.left = '0';
      portal.style.width = '100%';
      portal.style.height = '100%';
      portal.style.pointerEvents = 'auto';
      portal.style.zIndex = '2147483647';

      // Add mutation observer to watch for inert being added by browser extensions
      // This is critical - some extensions add inert to all fixed elements
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'inert') {
            if (portal.hasAttribute('inert')) {
              portal.removeAttribute('inert');
            }
          }
        });
      });
      observer.observe(portal, { attributes: true, attributeFilter: ['inert'] });

      // Store observer for cleanup
      (portal as any)._ultraInertObserver = observer;

      // Use extremely high z-index in preview contexts to appear above builder interface and HA edit outlines
      const isPreviewContext = previewContext === 'ha-preview' || previewContext === 'live';
      // Use maximum safe z-index value (2147483647 is max 32-bit integer)
      const overlayZIndex = isPreviewContext ? '2147483647 !important' : Z_INDEX.DIALOG_OVERLAY;

      // CRITICAL FIX for HA Preview: Hide HA's editor overlays when popup is open
      // HA adds .edit-mode overlays and card edit outlines that cover our popup
      // We need to temporarily hide them while our popup is visible
      if (isPreviewContext) {
        // Find and hide HA's editor overlay elements
        document
          .querySelectorAll('.edit-mode, ha-card[edit-mode], [data-edit-mode]')
          .forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.dataset.ultraPopupOriginalZIndex) {
              htmlEl.dataset.ultraPopupOriginalZIndex = htmlEl.style.zIndex || '';
            }
            htmlEl.style.zIndex = '-1';
            htmlEl.style.pointerEvents = 'none';
          });
      }

      // Check if we need to re-render content
      // Only clear and re-render if: portal is new OR refresh is explicitly requested
      const needsRefreshFlag = popupNeedsRefresh.get(uniquePopupKey) === true;
      const needsContentRender = isNewPortal || needsRefreshFlag;

      // Clear the refresh flag after checking
      if (needsRefreshFlag) {
        popupNeedsRefresh.delete(uniquePopupKey);
      }

      // Skip re-render if portal already exists and no refresh needed
      if (!needsContentRender) {
        return;
      }

      // CRITICAL FIX: Only clear innerHTML for NEW portals, NOT for refresh renders
      // Clearing innerHTML on refresh renders causes lit's render() to fail silently
      // because the template comes from a different function scope/closure
      if (isNewPortal) {
        portal.innerHTML = '';
      }

      const popupContent = html`
        <style>
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes zoomOut {
            from {
              opacity: 0;
              transform: scale(1.1);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animation-fadeIn {
            animation-name: fadeIn;
          }
          .animation-zoomIn {
            animation-name: zoomIn;
          }
          .animation-zoomOut {
            animation-name: zoomOut;
          }
          .animation-slideInDown {
            animation-name: slideInDown;
          }
          .animation-slideInUp {
            animation-name: slideInUp;
          }
          .animation-slideInLeft {
            animation-name: slideInLeft;
          }
          .animation-slideInRight {
            animation-name: slideInRight;
          }
        </style>
        <div
          class="ultra-popup-overlay"
          @click=${handleOverlayClick}
          style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: ${overlayZIndex};
            background: ${popupModule.show_overlay !== false
            ? popupModule.overlay_background || 'rgba(0,0,0,0.85)'
            : 'transparent'};
            ${popupModule.show_overlay !== false ? 'backdrop-filter: blur(2px);' : ''}
            animation: fadeIn 0.3s ease both;
            pointer-events: auto !important;
          "
        >
          <div
            class="ultra-popup-container ${popupLayoutClass} ${getAnimationClass()}"
            @click=${(e: Event) => e.stopPropagation()}
            style="
              position: relative;
              ${popupPositionStyle}
              max-height: 90vh;
              overflow-y: auto;
              background: ${popupModule.popup_background_color || 'var(--card-background-color)'};
              color: ${popupModule.popup_text_color || 'var(--primary-text-color)'};
              border-radius: ${layout === 'default'
              ? popupModule.popup_border_radius || '8px'
              : '0'};
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
              animation-duration: 0.4s;
              animation-fill-mode: both;
              animation-timing-function: ease;
              pointer-events: auto !important;
              z-index: 2147483646;
              isolation: isolate;
            "
          >
            ${renderCloseButton()}
            ${popupModule.show_title
              ? html`
                  <div
                    class="ultra-popup-title"
                    style="
                      background: ${popupModule.title_background_color || 'var(--primary-color)'};
                      color: ${popupModule.title_text_color || '#ffffff'};
                      padding: 16px 20px;
                      font-size: 20px;
                      font-weight: 600;
                      border-bottom: 1px solid var(--divider-color);
                    "
                  >
                    ${titleText}
                  </div>
                `
              : ''}

            <div
              class="ultra-popup-content"
              style="
                padding: ${popupModule.popup_padding || '5%'};
              "
            >
              ${hasChildren
                ? popupModule.modules.map(childModule => {
                    const childModuleHandler = registry.getModule(childModule.type);
                    if (!childModuleHandler) {
                      return html`<div>Unknown module type: ${childModule.type}</div>`;
                    }

                    // Check visibility
                    logicService.setHass(hass);
                    const isVisible = logicService.evaluateModuleVisibility(childModule);
                    if (!isVisible) return '';

                    // Check Pro access for child modules
                    const isProModule =
                      childModuleHandler.metadata?.tags?.includes('pro') ||
                      childModuleHandler.metadata?.tags?.includes('premium') ||
                      false;

                    let hasProAccess = false;
                    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
                    if (
                      integrationUser?.subscription?.tier === 'pro' &&
                      integrationUser?.subscription?.status === 'active'
                    ) {
                      hasProAccess = true;
                    }

                    if (isProModule && !hasProAccess) {
                      return html`
                        <div
                          style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-warning-color), 0.1); border: 1px dashed var(--warning-color); border-radius: 8px; margin: 8px 0;"
                        >
                          🔒 ${childModuleHandler.metadata.title} - Pro Feature
                        </div>
                      `;
                    }

                    // Build design styles from child module config
                    // Use type assertion to access dynamic properties that may be present on modules
                    const childAny = childModule as any;
                    const childDesign = childAny.design || {};
                    const bgColor = childAny.background_color || childDesign.background_color || '';
                    const borderRadius = childAny.border_radius || childDesign.border_radius || '';
                    const border = childAny.border || childDesign.border || null;
                    const backdropFilter =
                      childAny.backdrop_filter || childDesign.backdrop_filter || '';

                    let childDesignStyle = 'margin-bottom: 8px;';
                    if (bgColor) childDesignStyle += ` background: ${bgColor};`;
                    if (borderRadius) childDesignStyle += ` border-radius: ${borderRadius};`;
                    if (border && border.style && border.style !== 'none') {
                      childDesignStyle += ` border: ${border.width || '1px'} ${border.style} ${border.color || 'var(--divider-color)'};`;
                      if (border.radius)
                        childDesignStyle += ` border-radius: ${typeof border.radius === 'number' ? border.radius + 'px' : border.radius};`;
                    }
                    if (backdropFilter) childDesignStyle += ` backdrop-filter: ${backdropFilter};`;

                    // Render child module
                    return html`
                      <div class="popup-child-module" style="${childDesignStyle}">
                        ${childModuleHandler.renderPreview(
                          childModule,
                          hass,
                          config,
                          previewContext
                        )}
                      </div>
                    `;
                  })
                : html`
                    <div
                      style="padding: 24px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${localize(
                        'editor.popup.preview.no_modules',
                        lang,
                        'No modules added. Add modules to this popup in the Layout tab.'
                      )}
                    </div>
                  `}
            </div>
          </div>
        </div>
      `;

      // Render the popup content into the portal
      render(popupContent, portal);

      // Add native event listeners as fallback for portal rendering
      // This ensures clicks work even if lit-html event binding has issues with portals
      // Always re-attach since portal.innerHTML='' clears everything
      requestAnimationFrame(() => {
        const overlay = portal.querySelector('.ultra-popup-overlay') as HTMLElement;
        const closeBtn = portal.querySelector('.ultra-popup-close-button') as HTMLElement;
        const container = portal.querySelector('.ultra-popup-container') as HTMLElement;

        // Remove inert from all popup elements (browser extensions may add it)
        // Also re-apply critical styles that might have been commented out
        if (overlay) {
          overlay.removeAttribute('inert');
          if (!initialInvisibleRender) {
            overlay.style.pointerEvents = 'auto';
          }
          overlay.style.zIndex = overlayZIndex.toString();
        }
        if (closeBtn) {
          closeBtn.removeAttribute('inert');
          if (!initialInvisibleRender) {
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.cursor = 'pointer';
          }
          closeBtn.style.zIndex = closeButtonZIndex.toString();
        }
        if (container) {
          container.removeAttribute('inert');
          if (!initialInvisibleRender) {
            container.style.pointerEvents = 'auto';
          }
        }

        if (overlay) {
          overlay.addEventListener('click', (e: Event) => {
            // Only close if clicking directly on overlay, not on popup content
            if (e.target === overlay) {
              handleClose(e);
            }
          });
        }

        if (closeBtn) {
          closeBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            handleClose(e);
          });
        }

        if (container) {
          container.addEventListener('click', (e: Event) => {
            e.stopPropagation();
          });
        }
      });
    };

    // Check popup state to determine if portal needs rendering
    const currentState = popupStates.get(uniquePopupKey) || false;
    const portalExists = popupPortals.has(uniquePopupKey);
    const isManuallyOpen = manuallyOpenedPopups.has(uniquePopupKey);
    const needsRefresh = popupNeedsRefresh.get(uniquePopupKey) === true;

    // Determine if popup should be open
    const shouldBeOpen = currentState || isManuallyOpen;

    // Only render portal if:
    // 1. Popup should be open AND portal doesn't exist yet (first creation)
    // 2. OR popup should be open AND refresh is needed (template update)
    // This prevents constant re-rendering on every card update
    if (shouldBeOpen && (!portalExists || needsRefresh)) {
      renderPopupToPortal(false);
    } else if (!shouldBeOpen && portalExists) {
      // Close the portal if it exists but shouldn't be open
      const portal = popupPortals.get(uniquePopupKey);
      if (portal) {
        const observer = (portal as any)._ultraInertObserver;
        if (observer) {
          observer.disconnect();
        }
        restoreHAEditorOverlays();
        portal.remove();
        popupPortals.delete(uniquePopupKey);
      }
    }

    // If there's no visible trigger (logic, page_load, module, or opened via navigation),
    // wrap in a zero-height container so it doesn't take up any space on the dashboard
    const isOpenedViaNav = this._isOpenedViaNavigation(popupModule.id, config) !== null;
    const hasVisibleTrigger =
      triggerType !== 'page_load' &&
      triggerType !== 'logic' &&
      triggerType !== 'module' &&
      !isOpenedViaNav;

    if (!hasVisibleTrigger) {
      // No visible trigger - render as completely invisible (takes no space)
      // The popup content is rendered via portal to document.body
      return html`<div style="display: contents;"></div>`;
    }

    // Has visible trigger - render normally
    // The popup content is rendered via portal to document.body
    return html`${renderTrigger()}`;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const popupModule = module as PopupModule;
    const errors = [...baseValidation.errors];

    // Validate modules array exists
    if (!popupModule.modules) {
      errors.push('Modules array is required');
    }

    // Validate title configuration
    if (
      popupModule.show_title &&
      popupModule.title_mode === 'custom' &&
      !popupModule.title_text?.trim()
    ) {
      errors.push('Title text is required when using custom title mode');
    }

    if (
      popupModule.show_title &&
      popupModule.title_mode === 'entity' &&
      !popupModule.title_entity?.trim()
    ) {
      errors.push('Title entity is required when using entity title mode');
    }

    // Validate trigger configuration
    const triggerType = popupModule.trigger_type || 'button';
    if (triggerType === 'button' && !popupModule.trigger_button_text?.trim()) {
      // Warning but not error
    }
    if (triggerType === 'image') {
      const imageType = popupModule.trigger_image_type || 'url';
      if (imageType === 'url' && !popupModule.trigger_image_url?.trim()) {
        errors.push('Image URL is required for image trigger');
      } else if (imageType === 'upload' && !popupModule.trigger_image_url?.trim()) {
        errors.push('Uploaded image is required for image trigger');
      } else if (imageType === 'entity' && !popupModule.trigger_image_entity?.trim()) {
        errors.push('Image entity is required for image trigger');
      }
    }

    // Validate nested modules - only prevent popups inside popups
    if (popupModule.modules && popupModule.modules.length > 0) {
      for (const childModule of popupModule.modules) {
        // Prevent popups inside popups at level 1
        if (childModule.type === 'popup') {
          errors.push('Popup modules cannot contain other popup modules');
        }
      }
    }
    // Note: Nesting depth validation removed - users can nest layouts as deep as they want

    return { valid: errors.length === 0, errors };
  }

  // Auto-close timer helper methods
  private _startAutoCloseTimer(popupModule: PopupModule, uniquePopupKey: string): void {
    // Clear any existing timer
    this._clearAutoCloseTimer(uniquePopupKey);

    // Get timer duration in milliseconds
    const seconds = popupModule.auto_close_timer_seconds || 30;
    const milliseconds = seconds * 1000;

    // Set new timer
    const timerId = window.setTimeout(() => {
      // If the timer has been disabled since this timeout was scheduled, do nothing.
      // This prevents "auto close" even when auto_close_timer_enabled is false.
      if (popupTimerEnabled.get(uniquePopupKey) !== true) {
        popupTimers.delete(uniquePopupKey);
        return;
      }
      popupStates.set(uniquePopupKey, false);
      // Remove from manually opened set so the popup can close
      manuallyOpenedPopups.delete(uniquePopupKey);
      popupTimers.delete(uniquePopupKey);

      // Restore HA editor overlays
      restoreHAEditorOverlays();

      // Directly remove the portal for immediate close
      const portal = popupPortals.get(uniquePopupKey);
      if (portal) {
        // Disconnect mutation observer
        const observer = (portal as any)._ultraInertObserver;
        if (observer) {
          observer.disconnect();
        }
        portal.remove();
        popupPortals.delete(uniquePopupKey);
      }

      this.triggerPreviewUpdate(true);
    }, milliseconds);

    popupTimers.set(uniquePopupKey, timerId);
  }

  private _clearAutoCloseTimer(popupKey: string): void {
    const timerId = popupTimers.get(popupKey);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      popupTimers.delete(popupKey);
    }
  }
}
