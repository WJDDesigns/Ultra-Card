import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraImageModule } from '../image-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, ImageModule, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';
import '../../components/ultra-color-picker';

/**
 * Image module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraImageModuleSettings extends UltraImageModule {
  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const imageModule = module as ImageModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Image Settings (source type + type-specific fields in one card) -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px; max-width: 100%; box-sizing: border-box;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color); letter-spacing: 0.5px;"
          >
            ${localize('editor.image.settings', lang, 'Image Settings')}
          </div>
          ${this.renderSegmentedField(
            localize('editor.image.source_type', lang, 'Image Source Type'),
            localize(
              'editor.image.source_type_desc',
              lang,
              'Choose how you want to specify the image source.'
            ),
            imageModule.image_type || 'default',
            [
              {
                value: 'default',
                label: localize('editor.image.source.default', lang, 'Default Image'),
                icon: 'mdi:image-outline',
              },
              {
                value: 'url',
                label: localize('editor.image.source.url', lang, 'Image URL'),
                icon: 'mdi:link-variant',
              },
              {
                value: 'upload',
                label: localize('editor.image.source.upload', lang, 'Upload Image'),
                icon: 'mdi:upload',
              },
              {
                value: 'entity',
                label: localize('editor.image.source.entity', lang, 'Entity Image'),
                icon: 'mdi:account-circle',
              },
              {
                value: 'attribute',
                label: localize('editor.image.source.attribute', lang, 'Entity Attribute'),
                icon: 'mdi:code-braces',
              },
            ],
            next => {
              const prev = imageModule.image_type || 'default';
              if (next === prev) return;
              updateModule({ image_type: next as ImageModule['image_type'] });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
          ${imageModule.image_type === 'url'
            ? html`
                <div style="margin-top: 8px;">
                  ${this.renderFieldSection(
                    localize('editor.image.image_url', lang, 'Image URL'),
                    localize(
                      'editor.image.image_url_desc',
                      lang,
                      'Enter the direct URL to the image you want to display.'
                    ),
                    hass,
                    { image_url: imageModule.image_url || '' },
                    [this.textField('image_url')],
                    (e: CustomEvent) => {
                      updateModule({ image_url: e.detail.value.image_url });
                      this.triggerPreviewUpdate();
                    }
                  )}
                </div>
              `
            : ''}
          ${imageModule.image_type === 'upload'
            ? html`
                <div style="margin-top: 8px;">
                  ${this.renderFileField(
                    localize('editor.image.upload', lang, 'Upload Image'),
                    localize(
                      'editor.image.upload_desc',
                      lang,
                      'Click to upload an image file from your device.'
                    ),
                    hass,
                    imageModule.image_url || '',
                    path => {
                      if (path) {
                        updateModule({
                          image_url: path,
                          image_type: 'upload',
                        });
                      } else {
                        updateModule({ image_url: '' });
                      }
                      this.triggerPreviewUpdate();
                    },
                    'image/*',
                    {
                      chooseFile: localize('editor.image.upload_choose', lang, 'Choose file'),
                      clear: localize('editor.image.upload_clear', lang, 'Remove file'),
                    }
                  )}
                </div>
              `
            : ''}
          ${imageModule.image_type === 'entity'
            ? html`
                <div style="margin-top: 8px;">
                  ${this.renderEntityPickerWithVariables(
                    hass,
                    config,
                    'image_entity',
                    imageModule.image_entity || '',
                    value => {
                      if (value === imageModule.image_entity) return;
                      updateModule({ image_entity: value });
                      this.triggerPreviewUpdate();
                    },
                    undefined,
                    localize('editor.image.entity', lang, 'Entity')
                  )}
                  <div class="field-description">
                    ${localize(
                      'editor.image.entity_desc',
                      lang,
                      'Select an entity that has an image (e.g., person, camera entities).'
                    )}
                  </div>
                </div>
              `
            : ''}
          ${imageModule.image_type === 'attribute'
            ? html`
                <div style="margin-top: 8px;">
                  ${this.renderEntityPickerWithVariables(
                    hass,
                    config,
                    'image_entity',
                    imageModule.image_entity || '',
                    value => {
                      if (value === imageModule.image_entity) return;
                      updateModule({ image_entity: value });
                      this.triggerPreviewUpdate();
                    },
                    undefined,
                    localize('editor.image.entity', lang, 'Entity')
                  )}
                  <div class="field-description">
                    ${localize(
                      'editor.image.attribute_entity_desc',
                      lang,
                      'Select an entity that contains an image URL in one of its attributes.'
                    )}
                  </div>
                  ${this.renderFieldSection(
                    localize('editor.image.attribute_name', lang, 'Attribute Name'),
                    localize(
                      'editor.image.attribute_name_desc',
                      lang,
                      'Enter the attribute path (dot notation supported, e.g., vehicle_data.vehicleDetails.generalDashboard).'
                    ),
                    hass,
                    { image_attribute: imageModule.image_attribute || '' },
                    [this.textField('image_attribute')],
                    (e: CustomEvent) => {
                      updateModule({ image_attribute: e.detail.value.image_attribute });
                      this.triggerPreviewUpdate();
                    }
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Size & Display Settings -->
        ${this.renderSettingsSection(
          localize('editor.image.size_title', lang, 'Size & Display'),
          '',
          [
            {
              title: localize('editor.image.width', lang, 'Width'),
              description: localize(
                'editor.image.width_desc',
                lang,
                'Set the width (supports px, %, em, rem, vw, vh, etc.).'
              ),
              hass,
              data: { width: imageModule.width || '100%' },
              schema: [this.textField('width')],
              onChange: (e: CustomEvent) => updateModule({ width: e.detail.value.width }),
            },
            {
              title: localize('editor.image.height', lang, 'Height'),
              description: localize(
                'editor.image.height_desc',
                lang,
                'Set the height (supports px, %, em, rem, vw, vh, etc.).'
              ),
              hass,
              data: { height: imageModule.height || '200px' },
              schema: [this.textField('height')],
              onChange: (e: CustomEvent) => updateModule({ height: e.detail.value.height }),
            },
            {
              title: localize('editor.image.aspect_ratio', lang, 'Aspect Ratio'),
              description: localize(
                'editor.image.aspect_ratio_desc',
                lang,
                'Set the aspect ratio of the image container.'
              ),
              hass,
              data: { aspect_ratio: imageModule.aspect_ratio || 'auto' },
              schema: [
                this.selectField('aspect_ratio', [
                  {
                    value: 'auto',
                    label: localize('editor.image.aspect.auto', lang, 'Auto (use height setting)'),
                  },
                  {
                    value: '1/1',
                    label: localize('editor.image.aspect.square', lang, 'Square (1:1)'),
                  },
                  {
                    value: '4/3',
                    label: localize('editor.image.aspect.standard', lang, 'Standard (4:3)'),
                  },
                  {
                    value: '3/2',
                    label: localize('editor.image.aspect.photo', lang, 'Photo (3:2)'),
                  },
                  {
                    value: '16/9',
                    label: localize('editor.image.aspect.widescreen', lang, 'Widescreen (16:9)'),
                  },
                  {
                    value: '21/9',
                    label: localize('editor.image.aspect.ultrawide', lang, 'Ultrawide (21:9)'),
                  },
                  {
                    value: '2/3',
                    label: localize('editor.image.aspect.portrait', lang, 'Portrait (2:3)'),
                  },
                  {
                    value: '9/16',
                    label: localize('editor.image.aspect.mobile', lang, 'Mobile (9:16)'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.aspect_ratio;
                if (next === (imageModule.aspect_ratio || 'auto')) return;
                updateModule({ aspect_ratio: next });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.image.crop_fit', lang, 'Crop & Fit'),
              description: localize(
                'editor.image.crop_fit_desc',
                lang,
                'Control how the image fits within its container.'
              ),
              hass,
              data: { object_fit: imageModule.object_fit || 'cover' },
              schema: [
                this.selectField('object_fit', [
                  {
                    value: 'cover',
                    label: localize('editor.image.fit.cover', lang, 'Cover (crop to fill)'),
                  },
                  {
                    value: 'contain',
                    label: localize('editor.image.fit.contain', lang, 'Contain (fit entire image)'),
                  },
                  {
                    value: 'fill',
                    label: localize('editor.image.fit.fill', lang, 'Fill (stretch to fit)'),
                  },
                  {
                    value: 'scale-down',
                    label: localize('editor.image.fit.scale_down', lang, 'Scale Down'),
                  },
                  {
                    value: 'none',
                    label: localize('editor.image.fit.none', lang, 'None (original size)'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.object_fit;
                if (next === (imageModule.object_fit || 'cover')) return;
                updateModule({ object_fit: next });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.image.border_radius', lang, 'Border Radius'),
              description: localize(
                'editor.image.border_radius_desc',
                lang,
                'Control the rounded corners of the image.'
              ),
              hass,
              data: { border_radius: imageModule.border_radius || 8 },
              schema: [this.numberField('border_radius', 0, 64, 1)],
              onChange: (e: CustomEvent) =>
                updateModule({ border_radius: e.detail.value.border_radius }),
            },
          ]
        )}

        <!-- Filters -->
        ${this.renderSettingsSection(localize('editor.image.filters', lang, 'Filters'), '', [
          {
            title: localize('editor.image.filter.blur', lang, 'Blur'),
            description: localize(
              'editor.image.filter.blur_desc',
              lang,
              'Apply a blur effect to your image.'
            ),
            hass,
            data: { filter_blur: imageModule.filter_blur || 0 },
            schema: [this.numberField('filter_blur', 0, 20, 1)],
            onChange: (e: CustomEvent) => updateModule({ filter_blur: e.detail.value.filter_blur }),
          },
          {
            title: localize('editor.image.filter.brightness', lang, 'Brightness (%)'),
            description: localize(
              'editor.image.filter.brightness_desc',
              lang,
              'Adjust the brightness of your image.'
            ),
            hass,
            data: { filter_brightness: imageModule.filter_brightness || 100 },
            schema: [this.numberField('filter_brightness', 0, 200, 1)],
            onChange: (e: CustomEvent) =>
              updateModule({ filter_brightness: e.detail.value.filter_brightness }),
          },
          {
            title: localize('editor.image.filter.contrast', lang, 'Contrast (%)'),
            description: localize(
              'editor.image.filter.contrast_desc',
              lang,
              'Modify the contrast of your image.'
            ),
            hass,
            data: { filter_contrast: imageModule.filter_contrast || 100 },
            schema: [this.numberField('filter_contrast', 0, 200, 1)],
            onChange: (e: CustomEvent) =>
              updateModule({ filter_contrast: e.detail.value.filter_contrast }),
          },
          {
            title: localize('editor.image.filter.saturation', lang, 'Saturation (%)'),
            description: localize(
              'editor.image.filter.saturation_desc',
              lang,
              'Adjust the saturation of your image.'
            ),
            hass,
            data: { filter_saturate: imageModule.filter_saturate || 100 },
            schema: [this.numberField('filter_saturate', 0, 200, 1)],
            onChange: (e: CustomEvent) =>
              updateModule({ filter_saturate: e.detail.value.filter_saturate }),
          },
          {
            title: localize('editor.image.rotation', lang, 'Rotation (°)'),
            description: localize(
              'editor.image.rotation_desc',
              lang,
              'Rotate the image clockwise (0-360 degrees).'
            ),
            hass,
            data: { rotation: imageModule.rotation || 0 },
            schema: [this.numberField('rotation', 0, 360, 1)],
            onChange: (e: CustomEvent) => updateModule({ rotation: e.detail.value.rotation }),
          },
        ])}
        ${imageModule.hover_enabled
          ? html`
              ${this.renderSettingsSection(
                localize('editor.image.hover.title', lang, 'Hover Effects'),
                '',
                [
                  {
                    title: localize('editor.image.hover.effect_type', lang, 'Effect Type'),
                    description: localize(
                      'editor.image.hover.effect_type_desc',
                      lang,
                      'Choose the type of hover effect.'
                    ),
                    hass,
                    data: { effect: imageModule.hover_effect || 'scale' },
                    schema: [
                      this.selectField('effect', [
                        {
                          value: 'scale',
                          label: localize('editor.image.hover.scale', lang, 'Scale (zoom in/out)'),
                        },
                        {
                          value: 'rotate',
                          label: localize('editor.image.hover.rotate', lang, 'Rotate'),
                        },
                        {
                          value: 'fade',
                          label: localize('editor.image.hover.fade', lang, 'Fade (opacity change)'),
                        },
                        { value: 'blur', label: localize('editor.image.hover.blur', lang, 'Blur') },
                        {
                          value: 'brightness',
                          label: localize('editor.image.hover.brightness', lang, 'Brightness'),
                        },
                        {
                          value: 'glow',
                          label: localize('editor.image.hover.glow', lang, 'Glow (box shadow)'),
                        },
                        {
                          value: 'slide',
                          label: localize('editor.image.hover.slide', lang, 'Slide (translate)'),
                        },
                      ]),
                    ],
                    onChange: (e: CustomEvent) => {
                      const next = e.detail.value.effect;
                      const prev = imageModule.hover_effect || 'scale';
                      if (next === prev) return;
                      updateModule({ hover_effect: next });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                  },
                ]
              )}
                          label: localize('editor.image.hover.glow', lang, 'Glow (box shadow)'),
                        },
                        {
                          value: 'slide',
                          label: localize('editor.image.hover.slide', lang, 'Slide (translate)'),
                        },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.effect;
                      const prev = imageModule.hover_effect || 'scale';
                      if (next === prev) return;
                      updateModule({ hover_effect: next });
                      // Trigger re-render to update dropdown UI
                      setTimeout(() => {
                        this.triggerPreviewUpdate();
                      }, 50);
                    }
                  )}
                </div>

                ${
                  imageModule.hover_effect === 'scale'
                    ? this.renderFieldSection(
                        localize('editor.image.hover.scale_amount', lang, 'Scale (%)'),
                        localize(
                          'editor.image.hover.scale_amount_desc',
                          lang,
                          'Adjust the scale of the image on hover.'
                        ),
                        hass,
                        { scale: imageModule.hover_scale || 105 },
                        [this.numberField('scale', 50, 200, 1)],
                        (e: CustomEvent) => updateModule({ hover_scale: e.detail.value.scale })
                      )
                    : ''
                }
                ${
                  imageModule.hover_effect === 'rotate'
                    ? this.renderFieldSection(
                        localize('editor.image.hover.rotate_amount', lang, 'Rotation (°)'),
                        localize(
                          'editor.image.hover.rotate_amount_desc',
                          lang,
                          'Rotate the image on hover.'
                        ),
                        hass,
                        { rotate: imageModule.hover_rotate || 5 },
                        [this.numberField('rotate', -45, 45, 1)],
                        (e: CustomEvent) => updateModule({ hover_rotate: e.detail.value.rotate })
                      )
                    : ''
                }
                ${
                  imageModule.hover_effect === 'fade'
                    ? this.renderFieldSection(
                        localize('editor.image.hover.opacity', lang, 'Opacity (%)'),
                        localize(
                          'editor.image.hover.opacity_desc',
                          lang,
                          'Change the opacity of the image on hover.'
                        ),
                        hass,
                        { opacity: imageModule.hover_opacity || 90 },
                        [this.numberField('opacity', 0, 100, 1)],
                        (e: CustomEvent) => updateModule({ hover_opacity: e.detail.value.opacity })
                      )
                    : ''
                }
                ${
                  imageModule.hover_effect === 'blur'
                    ? this.renderFieldSection(
                        localize('editor.image.hover.blur_amount', lang, 'Blur (px)'),
                        localize(
                          'editor.image.hover.blur_amount_desc',
                          lang,
                          'Apply a blur effect to the image on hover.'
                        ),
                        hass,
                        { blur: imageModule.hover_blur || 2 },
                        [this.numberField('blur', 0, 20, 1)],
                        (e: CustomEvent) => updateModule({ hover_blur: e.detail.value.blur })
                      )
                    : ''
                }
                ${
                  imageModule.hover_effect === 'brightness'
                    ? this.renderFieldSection(
                        localize('editor.image.hover.brightness_amount', lang, 'Brightness (%)'),
                        localize(
                          'editor.image.hover.brightness_amount_desc',
                          lang,
                          'Adjust the brightness of the image on hover.'
                        ),
                        hass,
                        { brightness: imageModule.hover_brightness || 110 },
                        [this.numberField('brightness', 0, 200, 1)],
                        (e: CustomEvent) =>
                          updateModule({ hover_brightness: e.detail.value.brightness })
                      )
                    : ''
                }
                ${
                  imageModule.hover_effect === 'glow'
                    ? this.renderFieldSection(
                        localize('editor.image.hover.glow_intensity', lang, 'Glow Intensity'),
                        localize(
                          'editor.image.hover.glow_intensity_desc',
                          lang,
                          'Choose the intensity of the glow effect on hover.'
                        ),
                        hass,
                        { shadow: imageModule.hover_shadow || 'medium' },
                        [
                          this.selectField('shadow', [
                            {
                              value: 'light',
                              label: localize('editor.image.hover.glow_light', lang, 'Light Glow'),
                            },
                            {
                              value: 'medium',
                              label: localize(
                                'editor.image.hover.glow_medium',
                                lang,
                                'Medium Glow'
                              ),
                            },
                            {
                              value: 'heavy',
                              label: localize('editor.image.hover.glow_heavy', lang, 'Heavy Glow'),
                            },
                            {
                              value: 'custom',
                              label: localize(
                                'editor.image.hover.glow_custom',
                                lang,
                                'Custom Shadow'
                              ),
                            },
                          ]),
                        ],
                        (e: CustomEvent) => {
                          const next = e.detail.value.shadow;
                          if (next === (imageModule.hover_shadow || 'medium')) return;
                          updateModule({ hover_shadow: next });
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }
                      )
                    : ''
                }
                ${
                  imageModule.hover_effect === 'slide'
                    ? html`
                        ${this.renderFieldSection(
                          localize('editor.image.hover.translate_x', lang, 'Horizontal (px)'),
                          localize(
                            'editor.image.hover.translate_x_desc',
                            lang,
                            'Translate the image horizontally on hover.'
                          ),
                          hass,
                          { translate_x: imageModule.hover_translate_x || 0 },
                          [this.numberField('translate_x', -100, 100, 1)],
                          (e: CustomEvent) =>
                            updateModule({ hover_translate_x: e.detail.value.translate_x })
                        )}
                        ${this.renderFieldSection(
                          localize('editor.image.hover.translate_y', lang, 'Vertical (px)'),
                          localize(
                            'editor.image.hover.translate_y_desc',
                            lang,
                            'Translate the image vertically on hover.'
                          ),
                          hass,
                          { translate_y: imageModule.hover_translate_y || 0 },
                          [this.numberField('translate_y', -100, 100, 1)],
                          (e: CustomEvent) =>
                            updateModule({ hover_translate_y: e.detail.value.translate_y })
                        )}
                      `
                    : ''
                }
            `
          : ''}
      </div>
    `;
  }
}

installSettingsMethods(UltraImageModule, UltraImageModuleSettings);

export function renderImageGeneralTab(
  host: UltraImageModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraImageModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraImageModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}
