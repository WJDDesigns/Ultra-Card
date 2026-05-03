import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ImageModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { GlobalDesignTab } from '../tabs/global-design-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { DEFAULT_VEHICLE_IMAGE, DEFAULT_VEHICLE_IMAGE_FALLBACK } from '../utils/constants';
import { uploadImage, getImageUrl } from '../utils/image-upload';
import { ucToastService } from '../services/uc-toast-service';

export class UltraImageModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'image',
    title: 'Images',
    description: 'Display images and photos',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:image',
    category: 'media',
    tags: ['image', 'picture', 'media', 'photo'],
  };

  createDefault(id?: string): ImageModule {
    return {
      id: id || this.generateId('image'),
      type: 'image',

      // Basic Configuration

      // Image Source Configuration
      image_type: 'default',
      image_url: '',
      entity: '',
      image_entity: '',
      image_attribute: '',

      // Size Controls
      width: '100%' as any,
      height: '200px' as any,
      aspect_ratio: 'auto',
      object_fit: 'contain',

      // Alignment
      // alignment: undefined, // No default alignment to allow Global Design tab control

      // Ultra Link Configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // CSS Filters
      filter_blur: 0,
      filter_brightness: 100,
      filter_contrast: 100,
      filter_saturate: 100,
      filter_hue_rotate: 0,
      filter_opacity: 100,

      // Rotation
      rotation: 0,

      // Border & Styling (now handled by Global Design)
      border_radius: 0,
      // Removed individual border properties - now handled by Global Design system
      box_shadow: 'none',

      // Hover Effects
      hover_enabled: false,
      hover_effect: 'scale',
      hover_scale: 105,
      hover_rotate: 5,
      hover_opacity: 90,
      hover_blur: 0,
      hover_brightness: 110,
      hover_shadow: 'none',
      hover_translate_x: 0,
      hover_translate_y: 0,
      hover_transition: 300,

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
    const imageModule = module as ImageModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Image Settings -->
        ${this.renderSettingsSection(
          localize('editor.image.settings', lang, 'Image Settings'),
          '',
          [
            {
              title: localize('editor.image.source_type', lang, 'Image Source Type'),
              description: localize('editor.image.source_type_desc', lang, 'Choose how you want to specify the image source.'),
              hass,
              data: { image_type: imageModule.image_type || 'default' },
              schema: [
                this.selectField('image_type', [
                  { value: 'default', label: localize('editor.image.source.default', lang, 'Default Image') },
                  { value: 'url', label: localize('editor.image.source.url', lang, 'Image URL') },
                  { value: 'upload', label: localize('editor.image.source.upload', lang, 'Upload Image') },
                  { value: 'entity', label: localize('editor.image.source.entity', lang, 'Entity Image') },
                  { value: 'attribute', label: localize('editor.image.source.attribute', lang, 'Entity Attribute') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.image_type;
                const prev = imageModule.image_type || 'default';
                if (next === prev) return;
                updateModule({ image_type: next });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- URL Image Source -->
        ${imageModule.image_type === 'url'
          ? this.renderConditionalFieldsGroup(
              localize('editor.image.url_section.title', lang, 'Image URL Configuration'),
              html`
                ${this.renderFieldSection(
                  localize('editor.image.image_url', lang, 'Image URL'),
                  localize('editor.image.image_url_desc', lang, 'Enter the direct URL to the image you want to display.'),
                  hass,
                  { image_url: imageModule.image_url || '' },
                  [this.textField('image_url')],
                  (e: CustomEvent) => updateModule({ image_url: e.detail.value.image_url })
                )}
              `
            )
          : ''}

        <!-- Upload Image Source -->
        ${imageModule.image_type === 'upload'
          ? this.renderConditionalFieldsGroup(
              localize('editor.image.upload_section.title', lang, 'Upload Image Configuration'),
              html`
                <div class="field-title">${localize('editor.image.upload', lang, 'Upload Image')}</div>
                <div class="field-description">${localize('editor.image.upload_desc', lang, 'Click to upload an image file from your device.')}</div>
                <input
                  type="file"
                  accept="image/*"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                  @change=${(e: Event) => this.handleFileUpload(e, updateModule, hass)}
                />
              `
            )
          : ''}

        <!-- Entity Image Source -->
        ${imageModule.image_type === 'entity'
          ? this.renderConditionalFieldsGroup(
              localize('editor.image.entity_section.title', lang, 'Entity Image Configuration'),
              html`
                ${this.renderEntityPickerWithVariables(
                  hass, config, 'image_entity', imageModule.image_entity || '',
                  (value: string) => {
                    if (value === imageModule.image_entity) return;
                    updateModule({ image_entity: value });
                  },
                  undefined,
                  localize('editor.image.entity', lang, 'Entity')
                )}
                <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
                  ${localize('editor.image.entity_desc', lang, 'Select an entity that has an image (e.g., person, camera entities).')}
                </div>
              `
            )
          : ''}

        <!-- Attribute Image Source -->
        ${imageModule.image_type === 'attribute'
          ? this.renderConditionalFieldsGroup(
              localize('editor.image.attribute_section.title', lang, 'Entity Attribute Configuration'),
              html`
                ${this.renderEntityPickerWithVariables(
                  hass, config, 'image_entity', imageModule.image_entity || '',
                  (value: string) => {
                    if (value === imageModule.image_entity) return;
                    updateModule({ image_entity: value });
                  },
                  undefined,
                  localize('editor.image.entity', lang, 'Entity')
                )}
                <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
                  ${localize('editor.image.attribute_entity_desc', lang, 'Select an entity that contains an image URL in one of its attributes.')}
                </div>
                ${this.renderFieldSection(
                  localize('editor.image.attribute_name', lang, 'Attribute Name'),
                  localize('editor.image.attribute_name_desc', lang, 'Enter the attribute path (dot notation supported, e.g., vehicle_data.vehicleDetails.generalDashboard).'),
                  hass,
                  { image_attribute: imageModule.image_attribute || '' },
                  [this.textField('image_attribute')],
                  (e: CustomEvent) => updateModule({ image_attribute: e.detail.value.image_attribute })
                )}
              `
            )
          : ''}

        <!-- Size & Display Settings -->
        ${this.renderSettingsSection(
          localize('editor.image.size_title', lang, 'Size & Display'),
          '',
          [
            {
              title: localize('editor.image.width', lang, 'Width'),
              description: localize('editor.image.width_desc', lang, 'Set the width (supports px, %, em, rem, vw, vh, etc.).'),
              hass,
              data: { width: imageModule.width || '100%' },
              schema: [this.textField('width')],
              onChange: (e: CustomEvent) => updateModule({ width: e.detail.value.width }),
            },
            {
              title: localize('editor.image.height', lang, 'Height'),
              description: localize('editor.image.height_desc', lang, 'Set the height (supports px, %, em, rem, vw, vh, etc.).'),
              hass,
              data: { height: imageModule.height || '200px' },
              schema: [this.textField('height')],
              onChange: (e: CustomEvent) => updateModule({ height: e.detail.value.height }),
            },
            {
              title: localize('editor.image.aspect_ratio', lang, 'Aspect Ratio'),
              description: localize('editor.image.aspect_ratio_desc', lang, 'Set the aspect ratio of the image container.'),
              hass,
              data: { aspect_ratio: imageModule.aspect_ratio || 'auto' },
              schema: [
                this.selectField('aspect_ratio', [
                  { value: 'auto', label: localize('editor.image.aspect.auto', lang, 'Auto (use height setting)') },
                  { value: '1/1', label: localize('editor.image.aspect.square', lang, 'Square (1:1)') },
                  { value: '4/3', label: localize('editor.image.aspect.standard', lang, 'Standard (4:3)') },
                  { value: '3/2', label: localize('editor.image.aspect.photo', lang, 'Photo (3:2)') },
                  { value: '16/9', label: localize('editor.image.aspect.widescreen', lang, 'Widescreen (16:9)') },
                  { value: '21/9', label: localize('editor.image.aspect.ultrawide', lang, 'Ultrawide (21:9)') },
                  { value: '2/3', label: localize('editor.image.aspect.portrait', lang, 'Portrait (2:3)') },
                  { value: '9/16', label: localize('editor.image.aspect.mobile', lang, 'Mobile (9:16)') },
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
              description: localize('editor.image.crop_fit_desc', lang, 'Control how the image fits within its container.'),
              hass,
              data: { object_fit: imageModule.object_fit || 'cover' },
              schema: [
                this.selectField('object_fit', [
                  { value: 'cover', label: localize('editor.image.fit.cover', lang, 'Cover (crop to fill)') },
                  { value: 'contain', label: localize('editor.image.fit.contain', lang, 'Contain (fit entire image)') },
                  { value: 'fill', label: localize('editor.image.fit.fill', lang, 'Fill (stretch to fit)') },
                  { value: 'scale-down', label: localize('editor.image.fit.scale_down', lang, 'Scale Down') },
                  { value: 'none', label: localize('editor.image.fit.none', lang, 'None (original size)') },
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
              description: localize('editor.image.border_radius_desc', lang, 'Control the rounded corners of the image.'),
              hass,
              data: { border_radius: imageModule.border_radius || 8 },
              schema: [this.numberField('border_radius', 0, 64, 1)],
              onChange: (e: CustomEvent) => updateModule({ border_radius: e.detail.value.border_radius }),
            },
          ]
        )}

        <!-- Filters -->
        ${this.renderSettingsSection(
          localize('editor.image.filters', lang, 'Filters'),
          '',
          [
            {
              title: localize('editor.image.filter.blur', lang, 'Blur'),
              description: localize('editor.image.filter.blur_desc', lang, 'Apply a blur effect to your image.'),
              hass,
              data: { filter_blur: imageModule.filter_blur || 0 },
              schema: [this.numberField('filter_blur', 0, 20, 1)],
              onChange: (e: CustomEvent) => updateModule({ filter_blur: e.detail.value.filter_blur }),
            },
            {
              title: localize('editor.image.filter.brightness', lang, 'Brightness (%)'),
              description: localize('editor.image.filter.brightness_desc', lang, 'Adjust the brightness of your image.'),
              hass,
              data: { filter_brightness: imageModule.filter_brightness || 100 },
              schema: [this.numberField('filter_brightness', 0, 200, 1)],
              onChange: (e: CustomEvent) => updateModule({ filter_brightness: e.detail.value.filter_brightness }),
            },
            {
              title: localize('editor.image.filter.contrast', lang, 'Contrast (%)'),
              description: localize('editor.image.filter.contrast_desc', lang, 'Modify the contrast of your image.'),
              hass,
              data: { filter_contrast: imageModule.filter_contrast || 100 },
              schema: [this.numberField('filter_contrast', 0, 200, 1)],
              onChange: (e: CustomEvent) => updateModule({ filter_contrast: e.detail.value.filter_contrast }),
            },
            {
              title: localize('editor.image.filter.saturation', lang, 'Saturation (%)'),
              description: localize('editor.image.filter.saturation_desc', lang, 'Adjust the saturation of your image.'),
              hass,
              data: { filter_saturate: imageModule.filter_saturate || 100 },
              schema: [this.numberField('filter_saturate', 0, 200, 1)],
              onChange: (e: CustomEvent) => updateModule({ filter_saturate: e.detail.value.filter_saturate }),
            },
            {
              title: localize('editor.image.rotation', lang, 'Rotation (°)'),
              description: localize('editor.image.rotation_desc', lang, 'Rotate the image clockwise (0-360 degrees).'),
              hass,
              data: { rotation: imageModule.rotation || 0 },
              schema: [this.numberField('rotation', 0, 360, 1)],
              onChange: (e: CustomEvent) => updateModule({ rotation: e.detail.value.rotation }),
            },
          ]
        )}

        ${imageModule.hover_enabled
          ? html`
              ${this.renderSettingsSection(
                localize('editor.image.hover.title', lang, 'Hover Effects'),
                '',
                [
                  {
                    title: localize('editor.image.hover.effect_type', lang, 'Effect Type'),
                    description: localize('editor.image.hover.effect_type_desc', lang, 'Choose the type of hover effect.'),
                    hass,
                    data: { effect: imageModule.hover_effect || 'scale' },
                    schema: [
                      this.selectField('effect', [
                        { value: 'scale', label: localize('editor.image.hover.scale', lang, 'Scale (zoom in/out)') },
                        { value: 'rotate', label: localize('editor.image.hover.rotate', lang, 'Rotate') },
                        { value: 'fade', label: localize('editor.image.hover.fade', lang, 'Fade (opacity change)') },
                        { value: 'blur', label: localize('editor.image.hover.blur', lang, 'Blur') },
                        { value: 'brightness', label: localize('editor.image.hover.brightness', lang, 'Brightness') },
                        { value: 'glow', label: localize('editor.image.hover.glow', lang, 'Glow (box shadow)') },
                        { value: 'slide', label: localize('editor.image.hover.slide', lang, 'Slide (translate)') },
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

                ${imageModule.hover_effect === 'scale'
                  ? this.renderFieldSection(
                      localize('editor.image.hover.scale_amount', lang, 'Scale (%)'),
                      localize('editor.image.hover.scale_amount_desc', lang, 'Adjust the scale of the image on hover.'),
                      hass,
                      { scale: imageModule.hover_scale || 105 },
                      [this.numberField('scale', 50, 200, 1)],
                      (e: CustomEvent) => updateModule({ hover_scale: e.detail.value.scale })
                    )
                  : ''}
                ${imageModule.hover_effect === 'rotate'
                  ? this.renderFieldSection(
                      localize('editor.image.hover.rotate_amount', lang, 'Rotation (°)'),
                      localize('editor.image.hover.rotate_amount_desc', lang, 'Rotate the image on hover.'),
                      hass,
                      { rotate: imageModule.hover_rotate || 5 },
                      [this.numberField('rotate', -45, 45, 1)],
                      (e: CustomEvent) => updateModule({ hover_rotate: e.detail.value.rotate })
                    )
                  : ''}
                ${imageModule.hover_effect === 'fade'
                  ? this.renderFieldSection(
                      localize('editor.image.hover.opacity', lang, 'Opacity (%)'),
                      localize('editor.image.hover.opacity_desc', lang, 'Change the opacity of the image on hover.'),
                      hass,
                      { opacity: imageModule.hover_opacity || 90 },
                      [this.numberField('opacity', 0, 100, 1)],
                      (e: CustomEvent) => updateModule({ hover_opacity: e.detail.value.opacity })
                    )
                  : ''}
                ${imageModule.hover_effect === 'blur'
                  ? this.renderFieldSection(
                      localize('editor.image.hover.blur_amount', lang, 'Blur (px)'),
                      localize('editor.image.hover.blur_amount_desc', lang, 'Apply a blur effect to the image on hover.'),
                      hass,
                      { blur: imageModule.hover_blur || 2 },
                      [this.numberField('blur', 0, 20, 1)],
                      (e: CustomEvent) => updateModule({ hover_blur: e.detail.value.blur })
                    )
                  : ''}
                ${imageModule.hover_effect === 'brightness'
                  ? this.renderFieldSection(
                      localize('editor.image.hover.brightness_amount', lang, 'Brightness (%)'),
                      localize('editor.image.hover.brightness_amount_desc', lang, 'Adjust the brightness of the image on hover.'),
                      hass,
                      { brightness: imageModule.hover_brightness || 110 },
                      [this.numberField('brightness', 0, 200, 1)],
                      (e: CustomEvent) => updateModule({ hover_brightness: e.detail.value.brightness })
                    )
                  : ''}
                ${imageModule.hover_effect === 'glow'
                  ? this.renderFieldSection(
                      localize('editor.image.hover.glow_intensity', lang, 'Glow Intensity'),
                      localize('editor.image.hover.glow_intensity_desc', lang, 'Choose the intensity of the glow effect on hover.'),
                      hass,
                      { shadow: imageModule.hover_shadow || 'medium' },
                      [
                        this.selectField('shadow', [
                          { value: 'light', label: localize('editor.image.hover.glow_light', lang, 'Light Glow') },
                          { value: 'medium', label: localize('editor.image.hover.glow_medium', lang, 'Medium Glow') },
                          { value: 'heavy', label: localize('editor.image.hover.glow_heavy', lang, 'Heavy Glow') },
                          { value: 'custom', label: localize('editor.image.hover.glow_custom', lang, 'Custom Shadow') },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.shadow;
                        if (next === (imageModule.hover_shadow || 'medium')) return;
                        updateModule({ hover_shadow: next });
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }
                    )
                  : ''}
                ${imageModule.hover_effect === 'slide'
                  ? html`
                      ${this.renderFieldSection(
                        localize('editor.image.hover.translate_x', lang, 'Horizontal (px)'),
                        localize('editor.image.hover.translate_x_desc', lang, 'Translate the image horizontally on hover.'),
                        hass,
                        { translate_x: imageModule.hover_translate_x || 0 },
                        [this.numberField('translate_x', -100, 100, 1)],
                        (e: CustomEvent) => updateModule({ hover_translate_x: e.detail.value.translate_x })
                      )}
                      ${this.renderFieldSection(
                        localize('editor.image.hover.translate_y', lang, 'Vertical (px)'),
                        localize('editor.image.hover.translate_y_desc', lang, 'Translate the image vertically on hover.'),
                        hass,
                        { translate_y: imageModule.hover_translate_y || 0 },
                        [this.numberField('translate_y', -100, 100, 1)],
                        (e: CustomEvent) => updateModule({ hover_translate_y: e.detail.value.translate_y })
                      )}
                    `
                  : ''}
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
    const imageModule = module as ImageModule;
    const lang = hass?.locale?.language || 'en';

    // Normalize width: legacy configs saved bare numbers (e.g. 100) — treat as percentages.
    const rawWidth = (imageModule as any).width;
    if (rawWidth !== undefined && rawWidth !== null && rawWidth !== '') {
      const strW = String(rawWidth).trim();
      if (/^\d+(\.\d+)?$/.test(strW)) {
        (imageModule as any).width = `${strW}%`;
      }
    }

    // GRACEFUL RENDERING: Check for incomplete configuration
    // Only show error for non-default types that have no image configured
    const needsConfig =
      (imageModule.image_type === 'url' &&
        (!imageModule.image_url || imageModule.image_url.trim() === '')) ||
      (imageModule.image_type === 'upload' &&
        (!imageModule.image_url || imageModule.image_url.trim() === '')) ||
      (imageModule.image_type === 'entity' &&
        (!imageModule.image_entity || imageModule.image_entity.trim() === '')) ||
      (imageModule.image_type === 'attribute' &&
        (!imageModule.image_entity || imageModule.image_entity.trim() === ''));

    if (needsConfig) {
      const subtitle =
        imageModule.image_type === 'url'
          ? localize('editor.image.error_url_desc', lang, 'Enter an image URL in the General tab')
          : imageModule.image_type === 'upload'
            ? localize('editor.image.error_upload_desc', lang, 'Upload an image in the General tab')
            : imageModule.image_type === 'entity'
              ? localize('editor.image.error_entity_desc', lang, 'Select an image entity in the General tab')
              : localize('editor.image.error_attribute_desc', lang, 'Select an entity and attribute in the General tab');

      return this.renderGradientErrorState(localize('editor.image.error_no_source', lang, 'Configure Image Source'), subtitle, 'mdi:image-outline');
    }

    // Determine image source based on type
    let imageUrl = '';

    switch (imageModule.image_type) {
      case 'default':
        imageUrl = DEFAULT_VEHICLE_IMAGE;
        break;

      case 'url':
        if (imageModule.image_url) {
          imageUrl = getImageUrl(hass, imageModule.image_url);
        }
        break;

      case 'upload':
        if (imageModule.image_url) {
          imageUrl = getImageUrl(hass, imageModule.image_url);
        }
        break;

      case 'entity':
        if (imageModule.image_entity && hass?.states[imageModule.image_entity]) {
          const entityState = hass.states[imageModule.image_entity];
          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.state && entityState.state.startsWith('http')) {
            imageUrl = entityState.state;
          }
        }
        break;

      case 'attribute':
        if (
          imageModule.image_entity &&
          imageModule.image_attribute &&
          hass?.states[imageModule.image_entity]
        ) {
          const entityState = hass.states[imageModule.image_entity];
          const attributeValue = this.getAttributeByPath(
            entityState.attributes,
            imageModule.image_attribute
          );
          if (attributeValue && typeof attributeValue === 'string') {
            imageUrl = attributeValue;
          }
        }
        break;

      default:
        // Fallback to default image
        imageUrl = DEFAULT_VEHICLE_IMAGE;
        break;
    }

    // Build rotation transform
    const rotation = imageModule.rotation || 0;

    // Build CSS filters
    const filters = [];
    if (imageModule.filter_blur && imageModule.filter_blur > 0) {
      filters.push(`blur(${imageModule.filter_blur}px)`);
    }
    if (imageModule.filter_brightness && imageModule.filter_brightness !== 100) {
      filters.push(`brightness(${imageModule.filter_brightness}%)`);
    }
    if (imageModule.filter_contrast && imageModule.filter_contrast !== 100) {
      filters.push(`contrast(${imageModule.filter_contrast}%)`);
    }
    if (imageModule.filter_saturate && imageModule.filter_saturate !== 100) {
      filters.push(`saturate(${imageModule.filter_saturate}%)`);
    }
    const filterCSS = filters.length > 0 ? filters.join(' ') : 'none';

    // Build hover effects based on effect type
    let hoverEffectCSS = '';
    const hoverTransition = imageModule.hover_enabled
      ? `${imageModule.hover_transition || 300}ms`
      : 'none';

    if (imageModule.hover_enabled) {
      switch (imageModule.hover_effect || 'scale') {
        case 'scale':
          const hoverScale = (imageModule.hover_scale || 105) / 100;
          const baseRotation = rotation !== 0 ? ` rotate(${rotation}deg)` : '';
          hoverEffectCSS = `transform: scale(${hoverScale})${baseRotation};`;
          break;
        case 'rotate':
          const hoverRotation = imageModule.hover_rotate || 5;
          const combinedRotation = rotation + hoverRotation;
          hoverEffectCSS = `transform: rotate(${combinedRotation}deg);`;
          break;
        case 'fade':
          hoverEffectCSS = `opacity: ${(imageModule.hover_opacity || 90) / 100};`;
          break;
        case 'blur':
          hoverEffectCSS = `filter: blur(${imageModule.hover_blur || 2}px);`;
          break;
        case 'brightness':
          hoverEffectCSS = `filter: brightness(${imageModule.hover_brightness || 110}%);`;
          break;
        case 'glow':
          let shadowValue = '';
          switch (imageModule.hover_shadow || 'medium') {
            case 'light':
              shadowValue = '0 0 10px rgba(var(--rgb-primary-color), 0.5)';
              break;
            case 'medium':
              shadowValue = '0 0 20px rgba(var(--rgb-primary-color), 0.7)';
              break;
            case 'heavy':
              shadowValue = '0 0 30px rgba(var(--rgb-primary-color), 1)';
              break;
            case 'custom':
              shadowValue =
                imageModule.hover_shadow || '0 0 20px rgba(var(--rgb-primary-color), 0.7)';
              break;
          }
          hoverEffectCSS = `box-shadow: ${shadowValue};`;
          break;
        case 'slide':
          const translateX = imageModule.hover_translate_x || 0;
          const translateY = imageModule.hover_translate_y || 0;
          const baseSlideRotation = rotation !== 0 ? ` rotate(${rotation}deg)` : '';
          hoverEffectCSS = `transform: translate(${translateX}px, ${translateY}px)${baseSlideRotation};`;
          break;
      }
    }

    // Calculate container dimensions based on aspect ratio
    let containerHeight = imageModule.height || '200px';
    let containerAspectRatio = 'auto';

    if (imageModule.aspect_ratio && imageModule.aspect_ratio !== 'auto') {
      containerAspectRatio = imageModule.aspect_ratio;
      containerHeight = 'auto'; // Let aspect-ratio control height
    }

    // Get design properties from global design system (like other modules)
    const designProperties = (imageModule as any).design || {};

    // Build border CSS for the image itself
    const imageBorderCSS = this.getBorderWithDesign(designProperties, imageModule);
    const imageBorderRadius =
      this.addPixelUnit(designProperties.border_radius?.toString()) ||
      this.addPixelUnit(imageModule.border_radius?.toString()) ||
      '0';

    // Extract margin properties from both design object and top-level (like other modules)
    const marginLeft =
      designProperties.margin_left ||
      (imageModule as any).margin?.left?.toString() ||
      (imageModule as any).margin_left ||
      'auto';
    const marginRight =
      designProperties.margin_right ||
      (imageModule as any).margin?.right?.toString() ||
      (imageModule as any).margin_right ||
      'auto';

    // Build rotation CSS
    const rotationCSS = rotation !== 0 ? `rotate(${rotation}deg)` : '';

    const imageStyle = `
      width: ${designProperties.width || imageModule.width || '100%'};
      height: ${containerHeight};
      aspect-ratio: ${containerAspectRatio};
      object-fit: ${imageModule.object_fit || 'cover'};
      filter: ${filterCSS};
      border: ${imageBorderCSS};
      border-radius: ${imageBorderRadius};
      transform: ${rotationCSS};
      transition: ${imageModule.hover_enabled ? `transform ${hoverTransition} ease, filter ${hoverTransition} ease, opacity ${hoverTransition} ease, box-shadow ${hoverTransition} ease` : 'none'};
      cursor: pointer;
      display: block;
      max-width: 100%;
      max-height: 100%;
      margin-left: ${marginLeft};
      margin-right: ${marginRight};
    `;

    // Apply hover effects as CSS class
    const hoverEffectStyle = imageModule.hover_enabled ? hoverEffectCSS : '';

    // Calculate image container alignment
    // Check if auto margins are being used for centering
    const hasAutoMargins =
      (marginLeft === 'auto' && marginRight === 'auto') ||
      marginLeft === 'auto' ||
      marginRight === 'auto';

    let imageContainerAlignment = 'center';
    if (!hasAutoMargins) {
      // Only use flexbox alignment if not using auto margins
      switch (imageModule.alignment) {
        case 'left':
          imageContainerAlignment = 'flex-start';
          break;
        case 'center':
          imageContainerAlignment = 'center';
          break;
        case 'right':
          imageContainerAlignment = 'flex-end';
          break;
      }
    }

    const moduleWithDesign = imageModule as any;

    // Container styles for design system - properly handle global design borders
    const containerStyles = {
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left) || '0px'}`
          : '0',
      margin:
        designProperties.margin_top || designProperties.margin_bottom || marginLeft || marginRight
          ? `${designProperties.margin_top || (imageModule as any).margin?.top?.toString() || (imageModule as any).margin_top || '0px'} ${marginRight} ${designProperties.margin_bottom || (imageModule as any).margin?.bottom?.toString() || (imageModule as any).margin_bottom || '0px'} ${marginLeft}`
          : '0',
      background: designProperties.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(designProperties, hass),
      backgroundSize: designProperties.background_size || 'cover',
      backgroundPosition: designProperties.background_position || 'center',
      backgroundRepeat: designProperties.background_repeat || 'no-repeat',
      // NO border on container - borders are applied directly to the image
      position: designProperties.position || 'relative',
      top: designProperties.top || 'auto',
      bottom: designProperties.bottom || 'auto',
      left: designProperties.left || 'auto',
      right: designProperties.right || 'auto',
      zIndex: designProperties.z_index || 'auto',
      width: designProperties.width || imageModule.width || '100%',
      height: designProperties.height || imageModule.height || 'auto',
      maxWidth: designProperties.max_width || '100%',
      maxHeight: designProperties.max_height || 'none',
      minWidth: designProperties.min_width || 'none',
      minHeight: designProperties.min_height || 'auto',
      // When rendered in a layout context, force overflow hidden to prevent image blowup past card bounds
      // Otherwise use the design property or default to visible for standalone modules
      overflow:
        previewContext === 'live'
          ? designProperties.overflow || 'hidden'
          : designProperties.overflow || 'visible',
      clipPath: designProperties.clip_path || 'none',
      backdropFilter: designProperties.backdrop_filter || 'none',
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    // Create gesture handlers using centralized service
    const handlers = this.createGestureHandlers(
      imageModule.id,
      {
        tap_action: imageModule.tap_action,
        hold_action: imageModule.hold_action,
        double_tap_action: imageModule.double_tap_action,
        entity: (imageModule as any).entity,
        module: imageModule,
      },
      hass,
      config
    );

    // Get hover effect configuration from module design
    const hoverEffect = (imageModule as any).design?.hover_effect;
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    const content = html`
      <div class="image-module-container ${hoverEffectClass}" style="${designStyles}; ${this.styleObjectToCss(containerStyles)}">
        <div class="image-module-preview">
          <!-- Image Container with Alignment -->
          <div
            style="display: ${hasAutoMargins
              ? 'block'
              : 'flex'}; justify-content: ${imageContainerAlignment}; width: 100%;"
          >
            ${imageUrl
              ? html`
                  <img
                    src="${imageUrl}"
                    @error=${(e: Event) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const container = img.closest('.image-module-preview');
                      if (container) {
                        // Replace the broken image with a clean error message
                        container.innerHTML = `
                          <div style="
                            width: ${designProperties.width || imageModule.width || '100%'};
                            height: ${containerHeight};
                            aspect-ratio: ${containerAspectRatio};
                            background: var(--secondary-background-color);
                            border: 2px dashed var(--divider-color);
                            border-radius: ${imageBorderRadius};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: var(--secondary-text-color);
                            font-size: 14px;
                            margin-left: ${marginLeft};
                            margin-right: ${marginRight};
                            padding: 16px;
                            box-sizing: border-box;
                            overflow: visible;
                            min-height: 80px;
                          ">
                            <div style="
                              text-align: center;
                              max-width: 100%;
                              word-wrap: break-word;
                              overflow-wrap: break-word;
                              white-space: normal;
                              line-height: 1.4;
                            ">
                              <ha-icon
                                icon="mdi:image-off"
                                style="font-size: 32px; margin-bottom: 8px; opacity: 0.5; display: block;"
                              ></ha-icon>
                              <div style="
                                font-size: 12px;
                                font-weight: 500;
                                max-width: 100%;
                                word-break: break-word;
                                hyphens: auto;
                              ">
                                ${localize(
                                  'editor.image.load_error',
                                  hass?.locale?.language || 'en',
                                  'Image failed to load'
                                )}
                              </div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                    alt="${localize('editor.image.alt', hass?.locale?.language || 'en', 'Image')}"
                    style="${imageStyle}"
                    class="${hoverEffectClass}"
                    data-hover-style="${hoverEffectStyle}"
                    @pointerdown=${handlers.onPointerDown}
                    @pointermove=${handlers.onPointerMove}
                    @pointerup=${handlers.onPointerUp}
                    @pointerleave=${handlers.onPointerLeave}
                    @pointercancel=${handlers.onPointerCancel}
                  />
                `
              : html`
                  <div
                    class="${hoverEffectClass}"
                    style="
                      width: ${designProperties.width || imageModule.width || '100%'};
                      height: ${containerHeight};
                      aspect-ratio: ${containerAspectRatio};
                      background: var(--secondary-background-color);
                      border: 2px dashed var(--divider-color);
                      border-radius: ${imageBorderRadius};
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--secondary-text-color);
                      font-size: 14px;
                      margin-left: ${marginLeft};
                      margin-right: ${marginRight};
                      padding: 16px;
                      box-sizing: border-box;
                      overflow: visible;
                      min-height: 80px;
                    "
                  >
                    <div
                      style="
                      text-align: center;
                      max-width: 100%;
                      word-wrap: break-word;
                      overflow-wrap: break-word;
                      white-space: normal;
                      line-height: 1.4;
                    "
                    >
                      <ha-icon
                        icon="mdi:image-off"
                        style="font-size: 32px; margin-bottom: 8px; opacity: 0.5; display: block;"
                      ></ha-icon>
                      <div
                        style="
                        font-size: 12px;
                        font-weight: 500;
                        max-width: 100%;
                        word-break: break-word;
                        hyphens: auto;
                      "
                      >
                        ${localize(
                          'editor.image.no_source',
                          hass?.locale?.language || 'en',
                          'No image source configured'
                        )}
                      </div>
                    </div>
                  </div>
                `}
          </div>
        </div>
      </div>
    `;

    return this.wrapWithAnimation(content, module, hass);
  }

  private async handleFileUpload(
    event: Event,
    updateModule: (updates: Partial<ImageModule>) => void,
    hass: HomeAssistant
  ): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    try {
      // Use the centralized upload utility
      const imagePath = await uploadImage(hass, file);
      updateModule({
        image_url: imagePath,
        image_type: 'upload',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      ucToastService.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  // Explicit Design tab renderer (some editors call this directly)
  override renderDesignTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalDesignTab.render(module as any, hass, updates => updateModule(updates));
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const imageModule = module as ImageModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow incomplete configuration - UI will show placeholder
    // Only validate for truly breaking errors

    // Validate based on image_type (only if content is partially configured)
    switch (imageModule.image_type) {
      case 'url':
        // Allow empty - UI will handle
        break;

      case 'upload':
        // Allow empty - UI will handle
        break;

      case 'entity':
        // Allow empty - UI will handle
        break;

      case 'attribute':
        // If entity is set but attribute is missing, that's an error
        if (imageModule.image_entity && imageModule.image_entity.trim() !== '') {
          if (!imageModule.image_attribute || imageModule.image_attribute.trim() === '') {
            errors.push('Attribute name is required when using attribute type');
          }
        }
        break;

      case 'default':
      case 'none':
        // No additional validation needed for these types
        break;

      default:
        // If no image_type is set, default to 'default' (no validation error)
        break;
    }

    // Only validate link if link is enabled and has no URL
    if (imageModule.link_enabled && imageModule.link_url && imageModule.link_url.trim() === '') {
      errors.push('Link URL is required when link is enabled');
    }

    // Validate width - only validate if it's a number (for percentage values)
    if (
      imageModule.width &&
      typeof imageModule.width === 'number' &&
      (imageModule.width < 1 || imageModule.width > 100)
    ) {
      errors.push('Width must be between 1 and 100 percent');
    }

    // Validate height - only validate if it's a number (for pixel values)
    if (imageModule.height && typeof imageModule.height === 'number' && imageModule.height < 1) {
      errors.push('Height must be at least 1 pixel');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (
      !moduleWithDesign.background_image_type ||
      moduleWithDesign.background_image_type === 'none'
    ) {
      return 'none';
    }

    switch (moduleWithDesign.background_image_type) {
      case 'upload':
      case 'url':
        if (moduleWithDesign.background_image) {
          return `url("${moduleWithDesign.background_image}")`;
        }
        break;

      case 'entity':
        if (
          moduleWithDesign.background_image_entity &&
          hass?.states[moduleWithDesign.background_image_entity]
        ) {
          const entityState = hass.states[moduleWithDesign.background_image_entity];
          let imageUrl = '';

          // Try to get image from entity
          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            // Handle cases where state itself is an image path
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            return `url("${imageUrl}")`;
          }
        }
        break;
    }

    return 'none';
  }

  // Safely access nested attributes using dot/bracket path notation
  private getAttributeByPath(source: any, path: string): any {
    if (!source || !path) return undefined;
    const parts = path
      .replace(/\[(\w+)\]/g, '.$1') // convert a[0] to a.0
      .replace(/^\./, '')
      .split('.')
      .filter(Boolean);

    let current: any = source;
    for (const key of parts) {
      if (current == null) return undefined;
      current = current[key];
    }
    return current;
  }

  private styleObjectToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  getStyles(): string {
    return `
      .image-module-preview {
        max-width: 100%;
        overflow: hidden;
        box-sizing: border-box;
      }



      .image-module-preview img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      .image-module-preview img:hover {
        transition: all 0.3s ease;
      }

      /* Let HA handle dropdown positioning naturally */
      .module-general-settings {
        overflow: visible;
      }

      /* Conditional Fields Grouping CSS */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
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

      /* Field styling - ensure vertical stacking, no columns */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        
        margin-bottom: 4px !important;
        display: block !important;
        width: 100% !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
        width: 100% !important;
      }

      .field-group {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        margin-bottom: 16px !important;
      }

      .field-group ha-form {
        width: 100% !important;
        display: block !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }

      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
      }
    `;
  }

  // Helper method to ensure border radius values have proper units
  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return value;
  }

  // Standard border CSS generation like other modules
  private getBorderCSS(moduleWithDesign: any): string {
    if (
      moduleWithDesign.border_style &&
      moduleWithDesign.border_style !== 'none' &&
      moduleWithDesign.border_width
    ) {
      return `${this.addPixelUnit(moduleWithDesign.border_width) || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`;
    }
    return 'none';
  }

  // Border handling with design properties (like other modules)
  private getBorderWithDesign(designProperties: any, moduleWithDesign: any): string {
    if (
      designProperties.border_style &&
      designProperties.border_style !== 'none' &&
      designProperties.border_width
    ) {
      return `${this.addPixelUnit(designProperties.border_width) || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`;
    }
    return this.getBorderCSS(moduleWithDesign);
  }
}
