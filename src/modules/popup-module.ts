import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, PopupModule } from '../types';
import { getModuleRegistry } from './module-registry';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import { Z_INDEX } from '../utils/uc-z-index';
import { getImageUrl } from '../utils/image-upload';

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

        <!-- Overlay Styling Section -->
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
                    .label=${localize('editor.popup.design.close_button_color', lang, 'Close Button')}
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

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Trigger Configuration Section -->
        ${this.renderSettingsSection(
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
                  { value: 'button', label: localize('editor.popup.trigger.button', lang, 'Button') },
                  { value: 'image', label: localize('editor.popup.trigger.image', lang, 'Image') },
                  { value: 'icon', label: localize('editor.popup.trigger.icon', lang, 'Icon') },
                  {
                    value: 'page_load',
                    label: localize('editor.popup.trigger.page_load', lang, 'Page Load'),
                  },
                  { value: 'logic', label: localize('editor.popup.trigger.logic', lang, 'Logic Conditions') },
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
                    ${this.renderSettingsSection(
                      '',
                      '',
                      [
                        {
                          title: localize('editor.popup.trigger.button_full_width', lang, 'Full Width'),
                          description: localize(
                            'editor.popup.trigger.button_full_width_desc',
                            lang,
                            'Make the button span the full width of the container.'
                          ),
                          hass,
                          data: { trigger_button_full_width: popupModule.trigger_button_full_width || false },
                          schema: [this.booleanField('trigger_button_full_width')],
                          onChange: (e: CustomEvent) => {
                            updateModule(e.detail.value);
                            setTimeout(() => {
                              this.triggerPreviewUpdate();
                            }, 50);
                          },
                        },
                      ]
                    )}
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
                    ${this.renderSettingsSection(
                      '',
                      '',
                      [
                        {
                          title: localize('editor.popup.trigger.image_type', lang, 'Image Type'),
                          description: localize(
                            'editor.popup.trigger.image_type_desc',
                            lang,
                            'Choose how to provide the image for the trigger.'
                          ),
                          hass,
                          data: { trigger_image_type: popupModule.trigger_image_type || 'url' },
                          schema: [
                            this.selectField('trigger_image_type', [
                              { value: 'upload', label: localize('editor.design.bg_upload', lang, 'Upload Image') },
                              { value: 'entity', label: localize('editor.design.bg_entity', lang, 'Entity Image') },
                              { value: 'url', label: localize('editor.design.bg_url', lang, 'Image URL') },
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
                      ]
                    )}
                    ${popupModule.trigger_image_type === 'upload'
                      ? html`
                          <div style="margin-bottom: 16px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--primary-text-color);">
                              ${localize('editor.design.upload_bg_image', lang, 'Upload Image')}
                            </div>
                            <div class="upload-container">
                              <div class="file-upload-row" style="display: flex; align-items: center; gap: 12px;">
                                <label class="file-upload-button" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--primary-color); color: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                  <ha-icon icon="mdi:upload" style="--mdc-icon-size: 20px;"></ha-icon>
                                  <span>${localize('editor.design.choose_file', lang, 'Choose File')}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    @change=${async (e: Event) => {
                                      const input = e.target as HTMLInputElement;
                                      const file = input.files?.[0];
                                      if (!file || !hass) return;
                                      try {
                                        const { uploadImage } = await import('../utils/image-upload');
                                        const imagePath = await uploadImage(hass, file);
                                        updateModule({ trigger_image_url: imagePath, trigger_image_type: 'upload' });
                                        setTimeout(() => {
                                          this.triggerPreviewUpdate();
                                        }, 50);
                                      } catch (error) {
                                        console.error('Image upload failed:', error);
                                        alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                      }
                                    }}
                                    style="display: none"
                                  />
                                </label>
                                <div style="flex: 1; color: var(--secondary-text-color); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                  ${popupModule.trigger_image_url && popupModule.trigger_image_url.startsWith('/api/image/serve/')
                                    ? popupModule.trigger_image_url.split('/').pop() || 'Uploaded image'
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
                            localize('editor.design.bg_image_entity', lang, 'Image Entity'),
                            localize(
                              'editor.design.bg_image_entity_desc',
                              lang,
                              'Select an entity that has an image attribute.'
                            ),
                            hass,
                            { trigger_image_entity: popupModule.trigger_image_entity || '' },
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
                            localize('editor.popup.trigger.image_url', lang, 'Image URL'),
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
                    ${this.renderSettingsSection(
                      '',
                      '',
                      [
                        {
                          title: localize('editor.popup.trigger.image_full_width', lang, 'Full Width'),
                          description: localize(
                            'editor.popup.trigger.image_full_width_desc',
                            lang,
                            'Make the image span the full width of the container.'
                          ),
                          hass,
                          data: { trigger_image_full_width: popupModule.trigger_image_full_width || false },
                          schema: [this.booleanField('trigger_image_full_width')],
                          onChange: (e: CustomEvent) => {
                            updateModule(e.detail.value);
                            setTimeout(() => {
                              this.triggerPreviewUpdate();
                            }, 50);
                          },
                        },
                      ]
                    )}
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

        <!-- Conditional: Logic Trigger -->
        ${popupModule.trigger_type === 'logic'
          ? html`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup(
                  localize('editor.popup.trigger.logic_config', lang, 'Logic Configuration'),
                  html`
                    ${this._renderTriggerLogic(popupModule, hass, updateModule)}
                  `
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
                localize('editor.popup.trigger.alignment_section', lang, 'Trigger Alignment'),
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
                    data: { trigger_alignment: popupModule.trigger_alignment || 'center' },
                    schema: [
                      this.selectField('trigger_alignment', [
                        { value: 'left', label: localize('editor.common.left', lang, 'Left') },
                        { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                        { value: 'right', label: localize('editor.common.right', lang, 'Right') },
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
                    ${this.renderSettingsSection(
                      '',
                      '',
                      [
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
                              { value: 'custom', label: localize('editor.common.custom_text', lang, 'Custom Text') },
                              { value: 'entity', label: localize('editor.common.entity_state', lang, 'Entity State') },
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
                      ]
                    )}

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
                          ${this.renderSettingsSection(
                            '',
                            '',
                            [
                              {
                                title: localize('editor.popup.title.show_entity_name', lang, 'Show Entity Name'),
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
                            ]
                          )}
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
                  { value: 'default', label: localize('editor.popup.layout.default', lang, 'Default') },
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
                  { value: 'top_panel', label: localize('editor.popup.layout.top_panel', lang, 'Top Panel') },
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
                    label: localize('editor.popup.animation.slide_bottom', lang, 'Slide from Bottom'),
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
                  { value: 'none', label: localize('editor.popup.close_button.none', lang, 'None') },
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
              title: localize('editor.popup.auto_close_timer.enabled', lang, 'Enable Auto-Close Timer'),
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
                  localize('editor.popup.auto_close_timer.configuration', lang, 'Timer Configuration'),
                  html`
                    ${this.renderFieldSection(
                      localize('editor.popup.auto_close_timer.seconds', lang, 'Close After (Seconds)'),
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
                label: localize('editor.popup.trigger_logic.mode_any', lang, 'Open if ANY condition is met'),
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
          ? this.renderSettingsSection(
              '',
              '',
              [
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
              ]
            )
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
                          style="text-align: center; padding: 24px; color: var(--secondary-text-color); font-style: italic;"
                        >
                          ${localize(
                            'editor.popup.trigger_logic.no_conditions',
                            lang,
                            'No conditions added yet. Click "Add Condition" to get started.'
                          )}
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
                style="margin-top: 16px; padding: 16px; background: rgba(var(--rgb-secondary-text-color), 0.05); border-radius: 8px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
              >
                ${localize(
                  'editor.popup.trigger_logic.manual_note',
                  lang,
                  'Popup state is controlled manually by user interaction. Set Default State above to choose initial state.'
                )}
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
                        label: localize('editor.popup.trigger_logic.type_entity_state', lang, 'Entity State'),
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
                        label: localize('editor.popup.trigger_logic.type_template', lang, 'Template'),
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
                      <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
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

  private popupStates = new Map<string, boolean>();
  private popupTimers = new Map<string, number>();

  /**
   * Render only the trigger element (used when popups are disabled on edit page)
   */
  private _renderTriggerOnly(popupModule: PopupModule, triggerType: string, lang: string): TemplateResult {
    if (triggerType === 'page_load' || triggerType === 'logic') {
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
          disabled
          style="display: flex; align-items: center; justify-content: center; gap: ${buttonIcon ? '8px' : '0'}; padding: 12px 24px; background: var(--disabled-color, #888); color: white; border: none; border-radius: 8px; cursor: not-allowed; font-size: 16px; font-weight: 500; opacity: 0.6; ${isFullWidth
            ? 'width: 100%;'
            : ''}"
        >
          ${buttonIcon ? html`<ha-icon icon="${buttonIcon}" style="--mdc-icon-size: 24px;"></ha-icon>` : ''}
          ${buttonText}
        </button>
      `;
    } else if (triggerType === 'image') {
      const imageType = popupModule.trigger_image_type || 'url';
      const isFullWidth = popupModule.trigger_image_full_width || false;
      
      // Get image URL based on type (simplified for edit mode - just show placeholder)
      let imageUrl = '';
      if (imageType === 'upload' || imageType === 'url') {
        imageUrl = popupModule.trigger_image_url || '';
      } else if (imageType === 'entity' && popupModule.trigger_image_entity) {
        // In edit mode, we can't easily get entity image, so just show placeholder
        imageUrl = '';
      }

      if (!imageUrl) {
        triggerElement = html`
          <div style="padding: 24px; text-align: center; color: var(--secondary-text-color); border: 1px dashed var(--divider-color); border-radius: 8px; opacity: 0.6;">
            ${localize('editor.popup.trigger.no_image', lang, 'No image configured')}
          </div>
        `;
      } else {
        triggerElement = html`
          <img
            src="${imageUrl}"
            style="${isFullWidth
              ? 'width: 100%;'
              : 'max-width: 200px;'} opacity: 0.6; border-radius: 8px; display: block;"
          />
        `;
      }
    } else if (triggerType === 'icon') {
      const triggerIcon = popupModule.trigger_icon || 'mdi:information';
      triggerElement = html`
        <ha-icon
          icon="${triggerIcon}"
          style="--mdc-icon-size: 48px; color: var(--disabled-color, #888); opacity: 0.6;"
        ></ha-icon>
      `;
    }

    // Wrap trigger in alignment container
    // Use inline-flex to minimize space taken, only expand if needed
    return html`
      <div style="display: inline-flex; justify-content: ${justifyContent}; width: ${alignment === 'left' || alignment === 'right' ? 'auto' : '100%'};">
        ${triggerElement}
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

    // Check if we're in edit mode (URL contains edit=1)
    // Allow popups in all preview contexts (live, ha-preview, dashboard)
    // Only block popups when actually editing (edit=1 AND not in a preview context)
    const isEditMode = (() => {
      // If we're in any preview context, always allow popups regardless of URL
      if (previewContext === 'live' || previewContext === 'ha-preview' || previewContext === 'dashboard') {
        return false;
      }
      // Only block if edit=1 in URL AND we're not in a preview context
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('edit') === '1';
      } catch {
        return false;
      }
    })();

    // Store edit mode flag for later use in rendering
    // We'll handle edit mode display at the end, after rendering trigger and popup content

    // Evaluate trigger logic for logic-based triggers
    const triggerType = popupModule.trigger_type || 'button';
    let logicDeterminedState: boolean | null = null;

    if (triggerType === 'logic') {
      const triggerMode = popupModule.trigger_mode || 'manual';

      if (triggerMode === 'every' || triggerMode === 'any') {
        // Use logic service to evaluate trigger conditions
        logicService.setHass(hass);
        const conditionsResult = logicService.evaluateDisplayConditions(
          popupModule.trigger_conditions || [],
          triggerMode
        );
        logicDeterminedState = conditionsResult;
      }
    } else if (triggerType === 'page_load') {
      // Page load trigger: only open on initial load (when state doesn't exist yet)
      // Once closed by user, don't reopen until page reloads (which resets popupStates Map)
      if (!this.popupStates.has(popupModule.id)) {
        logicDeterminedState = true;
      }
      // If state already exists, don't set logicDeterminedState - let user's manual close persist
    }

    // Initialize popup state if not exists
    if (!this.popupStates.has(popupModule.id)) {
      // Use logic-determined state if available, otherwise use default_open
      const initialState =
        logicDeterminedState !== null ? logicDeterminedState : popupModule.default_open || false;
      this.popupStates.set(popupModule.id, initialState);
      
      // Start auto-close timer if popup opens initially and timer is enabled
      if (initialState && popupModule.auto_close_timer_enabled) {
        this._startAutoCloseTimer(popupModule);
      }
    } else if (logicDeterminedState !== null && triggerType === 'logic' && popupModule.auto_close !== false) {
      // Only update state for logic triggers with auto_close enabled
      // Page load triggers should not override user's manual close
      const wasOpen = this.popupStates.get(popupModule.id) || false;
      this.popupStates.set(popupModule.id, logicDeterminedState);
      
      // Handle timer based on state change
      if (!wasOpen && logicDeterminedState && popupModule.auto_close_timer_enabled) {
        // Popup just opened - start timer
        this._startAutoCloseTimer(popupModule);
      } else if (wasOpen && !logicDeterminedState) {
        // Popup just closed - clear timer
        this._clearAutoCloseTimer(popupModule.id);
      }
    }

    const isOpen = this.popupStates.get(popupModule.id) || false;

    // Handle trigger click
    const handleTriggerClick = (e: Event) => {
      e.stopPropagation();
      if (triggerType === 'logic' && popupModule.trigger_mode !== 'manual') {
        // For logic-controlled triggers, don't allow manual toggle unless mode is manual
        return;
      }
      this.popupStates.set(popupModule.id, true);
      
      // Start auto-close timer if enabled
      if (popupModule.auto_close_timer_enabled) {
        this._startAutoCloseTimer(popupModule);
      }
      
      this.triggerPreviewUpdate(true);
    };

    // Handle close
    const handleClose = (e: Event) => {
      e.stopPropagation();
      this.popupStates.set(popupModule.id, false);
      
      // Clear auto-close timer
      this._clearAutoCloseTimer(popupModule.id);
      
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
            @click=${handleTriggerClick}
            style="display: flex; align-items: center; justify-content: center; gap: ${buttonIcon ? '8px' : '0'}; padding: 12px 24px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.2s ease; ${isFullWidth
              ? 'width: 100%;'
              : ''}"
          >
            ${buttonIcon ? html`<ha-icon icon="${buttonIcon}" style="--mdc-icon-size: 24px;"></ha-icon>` : ''}
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
          } else if (entityState?.state && (entityState.state.startsWith('http') || entityState.state.startsWith('/') || entityState.state.startsWith('data:'))) {
            imageUrl = entityState.state;
            if (imageUrl.startsWith('/')) {
              const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
              imageUrl = `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
            }
          }
        }

        if (!imageUrl) {
          triggerElement = html`
            <div style="padding: 24px; text-align: center; color: var(--secondary-text-color); border: 1px dashed var(--divider-color); border-radius: 8px;">
              ${localize('editor.popup.trigger.no_image', lang, 'No image configured')}
            </div>
          `;
        } else {
          triggerElement = html`
            <img
              src="${imageUrl}"
              @click=${handleTriggerClick}
              style="${isFullWidth
                ? 'width: 100%;'
                : 'max-width: 200px;'} cursor: pointer; border-radius: 8px; transition: transform 0.2s ease; display: block;"
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
            icon="${triggerIcon}"
            @click=${handleTriggerClick}
            style="--mdc-icon-size: 48px; cursor: pointer; color: var(--primary-color); transition: transform 0.2s ease;"
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
      return html`
        <div style="display: inline-flex; justify-content: ${justifyContent}; width: ${alignment === 'left' || alignment === 'right' ? 'auto' : '100%'};">
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
      popupPositionStyle = 'width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; border-radius: 0;';
    } else if (layout === 'left_panel') {
      popupLayoutClass = 'ultra-popup-layout-left_panel';
      popupPositionStyle = `width: ${popupModule.popup_width || '600px'}; height: 100vh; max-height: 100vh; margin: 0; position: absolute; left: 0; top: 0; border-radius: 0;`;
    } else if (layout === 'right_panel') {
      popupLayoutClass = 'ultra-popup-layout-right_panel';
      popupPositionStyle = `width: ${popupModule.popup_width || '600px'}; height: 100vh; max-height: 100vh; margin: 0; position: absolute; right: 0; top: 0; border-radius: 0;`;
    } else if (layout === 'top_panel') {
      popupLayoutClass = 'ultra-popup-layout-top_panel';
      popupPositionStyle = 'width: 100vw; max-width: 100vw; margin: 0; position: absolute; top: 0; left: 0; border-radius: 0;';
    } else if (layout === 'bottom_panel') {
      popupLayoutClass = 'ultra-popup-layout-bottom_panel';
      popupPositionStyle = 'width: 100vw; max-width: 100vw; margin: 0; position: absolute; bottom: 0; left: 0; border-radius: 0;';
    } else {
      // Default centered
      popupPositionStyle = `width: ${popupModule.popup_width || '600px'}; max-width: 90vw;`;
    }

    // Render close button
    const renderCloseButton = () => {
      if (popupModule.close_button_position === 'none') return '';

      const closeIcon = popupModule.close_button_icon || 'mdi:close';
      const closeSize = popupModule.close_button_size || 32;
      const closeColor = popupModule.close_button_color || '#ffffff';
      const offsetX = popupModule.close_button_offset_x || '0px';
      const offsetY = popupModule.close_button_offset_y || '0px';

      const baseStyle = `
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease;
        color: ${closeColor};
        --mdc-icon-size: ${closeSize}px;
        user-select: none;
      `;

      // Always render inside the popup
      return html`
        <ha-icon
          icon="${closeIcon}"
          @click=${handleClose}
          class="ultra-popup-close-button"
          style="${baseStyle} position: absolute; top: calc(10px + ${offsetY}); right: calc(10px + ${offsetX}); z-index: 1;"
        ></ha-icon>
      `;
    };

    // Render child modules
    const hasChildren = popupModule.modules && popupModule.modules.length > 0;
    const registry = getModuleRegistry();

    const renderPopupContent = () => {
      if (!isOpen) return '';

      // Use extremely high z-index in preview contexts to appear above builder interface and HA edit outlines
      const isPreviewContext = previewContext === 'ha-preview' || previewContext === 'live';
      // Use maximum safe z-index value (2147483647 is max 32-bit integer) with !important for preview contexts
      const overlayZIndex = isPreviewContext ? '2147483647 !important' : Z_INDEX.DIALOG_OVERLAY.toString();

      return html`
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
            background: ${popupModule.overlay_background || 'rgba(0,0,0,0.85)'};
            backdrop-filter: blur(2px);
            animation: fadeIn 0.3s ease both;
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
              border-radius: ${layout === 'default' ? popupModule.popup_border_radius || '8px' : '0'};
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
              animation-duration: 0.4s;
              animation-fill-mode: both;
              animation-timing-function: ease;
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
                      padding: 16px ${popupModule.popup_padding || '5%'};
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
                ? popupModule.modules.map((childModule) => {
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

                    // Render child module
                    return html`
                      <div class="popup-child-module" style="margin-bottom: 8px;">
                        ${childModuleHandler.renderPreview(childModule, hass, config, previewContext)}
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
    };

    // Don't wrap in a container div - just return the trigger and popup overlay
    // The popup overlay is fixed positioned so it won't take up space
    // The trigger should be inline/inline-block to not take up unnecessary space
    
    // If in edit mode, show preview only notice for ALL trigger types
    if (isEditMode) {
      return html`
        <div
          style="
            padding: 24px;
            background: var(--card-background-color);
            border: 2px dashed var(--warning-color);
            border-radius: 8px;
            text-align: center;
            color: var(--primary-text-color);
            margin: 16px 0;
          "
        >
          <ha-icon
            icon="mdi:information"
            style="--mdc-icon-size: 32px; color: var(--warning-color); margin-bottom: 12px; display: block;"
          ></ha-icon>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--warning-color);">
            ${localize('editor.popup.edit_page_notice.title', lang, 'Preview Only')}
          </div>
          <div style="font-size: 14px; color: var(--secondary-text-color); line-height: 1.5;">
            ${localize(
              'editor.popup.edit_page_notice.message',
              lang,
              'This popup module preview can be seen once inside the edit area.'
            )}
          </div>
        </div>
      `;
    }
    
    return html`
      ${renderTrigger()} ${renderPopupContent()}
    `;
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
    if (popupModule.show_title && popupModule.title_mode === 'custom' && !popupModule.title_text?.trim()) {
      errors.push('Title text is required when using custom title mode');
    }

    if (popupModule.show_title && popupModule.title_mode === 'entity' && !popupModule.title_entity?.trim()) {
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

    // Validate nested modules - prevent infinite nesting (similar to accordion)
    if (popupModule.modules && popupModule.modules.length > 0) {
      for (const childModule of popupModule.modules) {
        // Prevent popups inside popups at level 1
        if (childModule.type === 'popup') {
          errors.push('Popup modules cannot contain other popup modules');
        }

        // Allow layout modules (horizontal, vertical, accordion) at level 1
        if (
          childModule.type === 'horizontal' ||
          childModule.type === 'vertical' ||
          childModule.type === 'accordion'
        ) {
          const layoutChild = childModule as any;

          // Check level 2 nesting - prevent popups at this level too
          if (layoutChild.modules && layoutChild.modules.length > 0) {
            for (const nestedModule of layoutChild.modules) {
              if (nestedModule.type === 'popup') {
                errors.push('Popup modules cannot be nested inside other layout modules within a popup');
              }

              if (
                nestedModule.type === 'horizontal' ||
                nestedModule.type === 'vertical' ||
                nestedModule.type === 'accordion'
              ) {
                const deepLayoutModule = nestedModule as any;

                // Check level 3 nesting - prevent any layout modules at this level
                if (deepLayoutModule.modules && deepLayoutModule.modules.length > 0) {
                  for (const deepNestedModule of deepLayoutModule.modules) {
                    if (
                      deepNestedModule.type === 'horizontal' ||
                      deepNestedModule.type === 'vertical' ||
                      deepNestedModule.type === 'accordion' ||
                      deepNestedModule.type === 'popup'
                    ) {
                      errors.push(
                        'Layout modules cannot be nested more than 2 levels deep. Remove layout modules from the third level.'
                      );
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Auto-close timer helper methods
  private _startAutoCloseTimer(popupModule: PopupModule): void {
    // Clear any existing timer
    this._clearAutoCloseTimer(popupModule.id);
    
    // Get timer duration in milliseconds
    const seconds = popupModule.auto_close_timer_seconds || 30;
    const milliseconds = seconds * 1000;
    
    // Set new timer
    const timerId = window.setTimeout(() => {
      this.popupStates.set(popupModule.id, false);
      this.popupTimers.delete(popupModule.id);
      this.triggerPreviewUpdate(true);
    }, milliseconds);
    
    this.popupTimers.set(popupModule.id, timerId);
  }

  private _clearAutoCloseTimer(popupId: string): void {
    const timerId = this.popupTimers.get(popupId);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      this.popupTimers.delete(popupId);
    }
  }
}

