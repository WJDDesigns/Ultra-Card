import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ImageModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { FormUtils } from '../utils/form-utils';

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
      width: 100,
      height: 200,
      aspect_ratio: 'auto',
      object_fit: 'cover',

      // Alignment
      alignment: 'center',

      // Ultra Link Configuration
      tap_action: { action: 'default' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },

      // CSS Filters
      filter_blur: 0,
      filter_brightness: 100,
      filter_contrast: 100,
      filter_saturate: 100,
      filter_hue_rotate: 0,
      filter_opacity: 100,

      // Border & Styling
      border_radius: 8,
      border_width: 0,
      border_color: 'var(--divider-color)',
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
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const imageModule = module as ImageModule;

    return html`
      ${FormUtils.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Image Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Image Settings
          </div>

          <!-- Image Source Type -->
          ${FormUtils.renderField(
            'Image Source Type',
            'Choose how you want to specify the image source.',
            hass,
            { image_type: imageModule.image_type || 'default' },
            [
              FormUtils.createSchemaItem('image_type', {
                select: {
                  options: [
                    { value: 'default', label: 'Default Image' },
                    { value: 'url', label: 'Image URL' },
                    { value: 'upload', label: 'Upload Image' },
                    { value: 'entity', label: 'Entity Image' },
                    { value: 'attribute', label: 'Entity Attribute' },
                  ],
                  mode: 'dropdown',
                },
              }),
            ],
            (e: CustomEvent) => updateModule({ image_type: e.detail.value.image_type })
          )}

          <!-- URL Image Source -->
          ${imageModule.image_type === 'url'
            ? this.renderConditionalFieldsGroup(
                'Image URL Configuration',
                html`
                  ${FormUtils.renderField(
                    'Image URL',
                    'Enter the direct URL to the image you want to display.',
                    hass,
                    { image_url: imageModule.image_url || '' },
                    [FormUtils.createSchemaItem('image_url', { text: {} })],
                    (e: CustomEvent) => updateModule({ image_url: e.detail.value.image_url })
                  )}
                `
              )
            : ''}

          <!-- Upload Image Source -->
          ${imageModule.image_type === 'upload'
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
                    Click to upload an image file from your device.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                    @change=${(e: Event) => this.handleFileUpload(e, updateModule)}
                  />
                `
              )
            : ''}

          <!-- Entity Image Source -->
          ${imageModule.image_type === 'entity'
            ? this.renderConditionalFieldsGroup(
                'Entity Image Configuration',
                html`
                  ${FormUtils.renderField(
                    'Entity',
                    'Select an entity that has an image (e.g., person, camera entities).',
                    hass,
                    { image_entity: imageModule.image_entity || '' },
                    [FormUtils.createSchemaItem('image_entity', { entity: {} })],
                    (e: CustomEvent) => updateModule({ image_entity: e.detail.value.image_entity })
                  )}
                `
              )
            : ''}

          <!-- Attribute Image Source -->
          ${imageModule.image_type === 'attribute'
            ? this.renderConditionalFieldsGroup(
                'Entity Attribute Configuration',
                html`
                  ${FormUtils.renderField(
                    'Entity',
                    'Select the entity that contains the image URL in one of its attributes.',
                    hass,
                    { image_entity: imageModule.image_entity || '' },
                    [FormUtils.createSchemaItem('image_entity', { entity: {} })],
                    (e: CustomEvent) => updateModule({ image_entity: e.detail.value.image_entity })
                  )}

                  <div style="margin-top: 16px;">
                    ${FormUtils.renderField(
                      'Attribute Name',
                      'Enter the name of the attribute that contains the image URL.',
                      hass,
                      { image_attribute: imageModule.image_attribute || '' },
                      [FormUtils.createSchemaItem('image_attribute', { text: {} })],
                      (e: CustomEvent) =>
                        updateModule({ image_attribute: e.detail.value.image_attribute })
                    )}
                  </div>
                `
              )
            : ''}
        </div>

        <!-- Size & Appearance -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Size & Appearance
          </div>

          <!-- Width -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Width (%)',
              'Set the width as a percentage of the container.',
              hass,
              { width: imageModule.width || 100 },
              [
                FormUtils.createSchemaItem('width', {
                  number: { min: 10, max: 100, step: 5, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ width: e.detail.value.width })
            )}
          </div>

          <!-- Image Alignment (when width < 100%) -->
          ${(imageModule.width || 100) < 100
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Image Alignment
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Choose how to align the image when it's less than 100% width.
                  </div>
                  <div
                    style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                  >
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(imageModule.alignment ||
                        'center') === 'left'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(imageModule.alignment ||
                        'center') === 'left'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(imageModule.alignment || 'center') === 'left'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${() => updateModule({ alignment: 'left' })}
                    >
                      <ha-icon icon="mdi:format-align-left" style="font-size: 16px;"></ha-icon>
                      Left
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(imageModule.alignment ||
                        'center') === 'center'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(imageModule.alignment ||
                        'center') === 'center'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(imageModule.alignment || 'center') === 'center'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${() => updateModule({ alignment: 'center' })}
                    >
                      <ha-icon icon="mdi:format-align-center" style="font-size: 16px;"></ha-icon>
                      Center
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(imageModule.alignment ||
                        'center') === 'right'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(imageModule.alignment ||
                        'center') === 'right'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(imageModule.alignment || 'center') === 'right'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${() => updateModule({ alignment: 'right' })}
                    >
                      <ha-icon icon="mdi:format-align-right" style="font-size: 16px;"></ha-icon>
                      Right
                    </button>
                  </div>
                </div>
              `
            : ''}

          <!-- Height -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Height (px)',
              'Set the height in pixels.',
              hass,
              { height: imageModule.height || 200 },
              [
                FormUtils.createSchemaItem('height', {
                  number: { min: 50, max: 800, step: 10, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ height: e.detail.value.height })
            )}
          </div>

          <!-- Object Fit -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Crop & Fit',
              'Control how the image fits within its container.',
              hass,
              { object_fit: imageModule.object_fit || 'cover' },
              [
                FormUtils.createSchemaItem('object_fit', {
                  select: {
                    options: [
                      { value: 'cover', label: 'Cover (crop to fill)' },
                      { value: 'contain', label: 'Contain (fit entire image)' },
                      { value: 'fill', label: 'Fill (stretch to fit)' },
                      { value: 'scale-down', label: 'Scale Down' },
                      { value: 'none', label: 'None (original size)' },
                    ],
                    mode: 'dropdown',
                  },
                }),
              ],
              (e: CustomEvent) => updateModule({ object_fit: e.detail.value.object_fit })
            )}
          </div>

          <!-- Border Radius -->
          <div class="field-group">
            ${FormUtils.renderField(
              'Border Radius',
              'Control the rounded corners of the image.',
              hass,
              { border_radius: imageModule.border_radius || 8 },
              [
                FormUtils.createSchemaItem('border_radius', {
                  number: { min: 0, max: 50, step: 1, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ border_radius: e.detail.value.border_radius })
            )}
          </div>
        </div>

        <!-- Tap Actions Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${UltraLinkComponent.render(
            hass,
            {
              tap_action: imageModule.tap_action || { action: 'default' },
              hold_action: imageModule.hold_action || { action: 'default' },
              double_tap_action: imageModule.double_tap_action || { action: 'default' },
            },
            (linkConfig: Partial<UltraLinkConfig>) => {
              updateModule(linkConfig);
            },
            'Tap Actions'
          )}
        </div>

        <!-- CSS Filters -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            CSS Filters
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            Apply visual effects to your image using CSS filters.
          </div>

          <!-- Blur -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Blur',
              'Apply a blur effect to your image.',
              hass,
              { filter_blur: imageModule.filter_blur || 0 },
              [
                FormUtils.createSchemaItem('filter_blur', {
                  number: { min: 0, max: 10, step: 0.1, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ filter_blur: e.detail.value.filter_blur })
            )}
          </div>

          <!-- Brightness -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Brightness (%)',
              'Adjust the brightness of your image.',
              hass,
              { filter_brightness: imageModule.filter_brightness || 100 },
              [
                FormUtils.createSchemaItem('filter_brightness', {
                  number: { min: 0, max: 200, step: 5, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) =>
                updateModule({ filter_brightness: e.detail.value.filter_brightness })
            )}
          </div>

          <!-- Contrast -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Contrast (%)',
              'Modify the contrast of your image.',
              hass,
              { filter_contrast: imageModule.filter_contrast || 100 },
              [
                FormUtils.createSchemaItem('filter_contrast', {
                  number: { min: 0, max: 200, step: 5, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ filter_contrast: e.detail.value.filter_contrast })
            )}
          </div>

          <!-- Saturation -->
          <div class="field-group">
            ${FormUtils.renderField(
              'Saturation (%)',
              'Adjust the saturation of your image.',
              hass,
              { filter_saturate: imageModule.filter_saturate || 100 },
              [
                FormUtils.createSchemaItem('filter_saturate', {
                  number: { min: 0, max: 200, step: 5, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ filter_saturate: e.detail.value.filter_saturate })
            )}
          </div>
        </div>

        <!-- Hover Effects -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 0;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Hover Effects
            </div>
            ${FormUtils.renderField(
              'Hover Effects Enabled',
              'Enable hover effects for this image.',
              hass,
              { enabled: imageModule.hover_enabled || false },
              [FormUtils.createSchemaItem('enabled', { boolean: {} })],
              (e: CustomEvent) => updateModule({ hover_enabled: e.detail.value.enabled })
            )}
          </div>

          ${imageModule.hover_enabled
            ? this.renderConditionalFieldsGroup(
                'Hover Effects Configuration',
                html`
                  <!-- Effect Type -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                    >
                      Effect Type
                    </div>
                    ${FormUtils.renderField(
                      'Effect Type',
                      'Choose the type of hover effect.',
                      hass,
                      { effect: imageModule.hover_effect || 'scale' },
                      [
                        FormUtils.createSchemaItem('effect', {
                          select: {
                            options: [
                              { value: 'scale', label: 'Scale (zoom in/out)' },
                              { value: 'rotate', label: 'Rotate' },
                              { value: 'fade', label: 'Fade (opacity change)' },
                              { value: 'blur', label: 'Blur' },
                              { value: 'brightness', label: 'Brightness' },
                              { value: 'glow', label: 'Glow (box shadow)' },
                              { value: 'slide', label: 'Slide (translate)' },
                            ],
                            mode: 'dropdown',
                          },
                        }),
                      ],
                      (e: CustomEvent) => updateModule({ hover_effect: e.detail.value.effect })
                    )}
                  </div>

                  <!-- Scale Effect Settings -->
                  ${imageModule.hover_effect === 'scale' || !imageModule.hover_effect
                    ? html`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Scale (%)
                          </div>
                          ${FormUtils.renderField(
                            'Scale (%)',
                            'Adjust the scale of the image on hover.',
                            hass,
                            { scale: imageModule.hover_scale || 105 },
                            [
                              FormUtils.createSchemaItem('scale', {
                                number: { min: 50, max: 150, step: 5, mode: 'slider' },
                              }),
                            ],
                            (e: CustomEvent) => updateModule({ hover_scale: e.detail.value.scale })
                          )}
                        </div>
                      `
                    : ''}

                  <!-- Rotate Effect Settings -->
                  ${imageModule.hover_effect === 'rotate'
                    ? html`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Rotation (°)
                          </div>
                          ${FormUtils.renderField(
                            'Rotation (°)',
                            'Rotate the image on hover.',
                            hass,
                            { rotate: imageModule.hover_rotate || 5 },
                            [
                              FormUtils.createSchemaItem('rotate', {
                                number: { min: -180, max: 180, step: 5, mode: 'slider' },
                              }),
                            ],
                            (e: CustomEvent) =>
                              updateModule({ hover_rotate: e.detail.value.rotate })
                          )}
                        </div>
                      `
                    : ''}

                  <!-- Fade Effect Settings -->
                  ${imageModule.hover_effect === 'fade'
                    ? html`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Opacity (%)
                          </div>
                          ${FormUtils.renderField(
                            'Opacity (%)',
                            'Change the opacity of the image on hover.',
                            hass,
                            { opacity: imageModule.hover_opacity || 90 },
                            [
                              FormUtils.createSchemaItem('opacity', {
                                number: { min: 0, max: 100, step: 5, mode: 'slider' },
                              }),
                            ],
                            (e: CustomEvent) =>
                              updateModule({ hover_opacity: e.detail.value.opacity })
                          )}
                        </div>
                      `
                    : ''}

                  <!-- Blur Effect Settings -->
                  ${imageModule.hover_effect === 'blur'
                    ? html`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Blur (px)
                          </div>
                          ${FormUtils.renderField(
                            'Blur (px)',
                            'Apply a blur effect to the image on hover.',
                            hass,
                            { blur: imageModule.hover_blur || 2 },
                            [
                              FormUtils.createSchemaItem('blur', {
                                number: { min: 0, max: 10, step: 0.5, mode: 'slider' },
                              }),
                            ],
                            (e: CustomEvent) => updateModule({ hover_blur: e.detail.value.blur })
                          )}
                        </div>
                      `
                    : ''}

                  <!-- Brightness Effect Settings -->
                  ${imageModule.hover_effect === 'brightness'
                    ? html`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Brightness (%)
                          </div>
                          ${FormUtils.renderField(
                            'Brightness (%)',
                            'Adjust the brightness of the image on hover.',
                            hass,
                            { brightness: imageModule.hover_brightness || 110 },
                            [
                              FormUtils.createSchemaItem('brightness', {
                                number: { min: 50, max: 200, step: 5, mode: 'slider' },
                              }),
                            ],
                            (e: CustomEvent) =>
                              updateModule({ hover_brightness: e.detail.value.brightness })
                          )}
                        </div>
                      `
                    : ''}

                  <!-- Glow Effect Settings -->
                  ${imageModule.hover_effect === 'glow'
                    ? html`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Glow Intensity
                          </div>
                          ${FormUtils.renderField(
                            'Glow Intensity',
                            'Choose the intensity of the glow effect on hover.',
                            hass,
                            { shadow: imageModule.hover_shadow || 'medium' },
                            [
                              FormUtils.createSchemaItem('shadow', {
                                select: {
                                  options: [
                                    { value: 'light', label: 'Light Glow' },
                                    { value: 'medium', label: 'Medium Glow' },
                                    { value: 'heavy', label: 'Heavy Glow' },
                                    { value: 'custom', label: 'Custom Shadow' },
                                  ],
                                  mode: 'dropdown',
                                },
                              }),
                            ],
                            (e: CustomEvent) =>
                              updateModule({ hover_shadow: e.detail.value.shadow })
                          )}
                        </div>
                      `
                    : ''}

                  <!-- Slide Effect Settings -->
                  ${imageModule.hover_effect === 'slide'
                    ? html`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Horizontal (px)
                          </div>
                          ${FormUtils.renderField(
                            'Horizontal (px)',
                            'Translate the image horizontally on hover.',
                            hass,
                            { translate_x: imageModule.hover_translate_x || 0 },
                            [
                              FormUtils.createSchemaItem('translate_x', {
                                number: { min: -50, max: 50, step: 2, mode: 'slider' },
                              }),
                            ],
                            (e: CustomEvent) =>
                              updateModule({ hover_translate_x: e.detail.value.translate_x })
                          )}
                        </div>

                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Vertical (px)
                          </div>
                          ${FormUtils.renderField(
                            'Vertical (px)',
                            'Translate the image vertically on hover.',
                            hass,
                            { translate_y: imageModule.hover_translate_y || 0 },
                            [
                              FormUtils.createSchemaItem('translate_y', {
                                number: { min: -50, max: 50, step: 2, mode: 'slider' },
                              }),
                            ],
                            (e: CustomEvent) =>
                              updateModule({ hover_translate_y: e.detail.value.translate_y })
                          )}
                        </div>
                      `
                    : ''}

                  <!-- Transition Duration (common for all effects) -->
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                    >
                      Duration (ms)
                    </div>
                    ${FormUtils.renderField(
                      'Duration (ms)',
                      'Set the duration for hover effects.',
                      hass,
                      { transition: imageModule.hover_transition || 300 },
                      [
                        FormUtils.createSchemaItem('transition', {
                          number: { min: 100, max: 1000, step: 50, mode: 'slider' },
                        }),
                      ],
                      (e: CustomEvent) =>
                        updateModule({ hover_transition: e.detail.value.transition })
                    )}
                  </div>
                `
              )
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure hover effects
                </div>
              `}
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const imageModule = module as ImageModule;

    // Determine image source based on type
    let imageUrl = '';

    switch (imageModule.image_type) {
      case 'default':
        imageUrl = '/hacsfiles/Ultra-Card/assets/Ultra.jpg';
        break;

      case 'url':
        imageUrl = imageModule.image_url || '';
        break;

      case 'upload':
        imageUrl = imageModule.image_url || '';
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
          const attributeValue = entityState.attributes?.[imageModule.image_attribute];
          if (attributeValue && typeof attributeValue === 'string') {
            imageUrl = attributeValue;
          }
        }
        break;

      default:
        // Fallback to default image
        imageUrl = '/hacsfiles/Ultra-Card/assets/Ultra.jpg';
        break;
    }

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
          hoverEffectCSS = `transform: scale(${hoverScale});`;
          break;
        case 'rotate':
          hoverEffectCSS = `transform: rotate(${imageModule.hover_rotate || 5}deg);`;
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
          hoverEffectCSS = `transform: translate(${translateX}px, ${translateY}px);`;
          break;
      }
    }

    const imageStyle = `
      width: ${imageModule.width || 100}%;
      height: ${imageModule.height || 200}px;
      object-fit: ${imageModule.object_fit || 'cover'};
      border-radius: ${imageModule.border_radius || 8}px;
      filter: ${filterCSS};
      transition: ${imageModule.hover_enabled ? `transform ${hoverTransition} ease, filter ${hoverTransition} ease, opacity ${hoverTransition} ease, box-shadow ${hoverTransition} ease` : 'none'};
      cursor: pointer;
      display: block;
      border: ${imageModule.border_width ? `${imageModule.border_width}px solid ${imageModule.border_color}` : 'none'};
    `;

    // Calculate image container alignment
    let imageContainerAlignment = 'center';
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

    // Apply design properties
    const moduleWithDesign = imageModule as any;

    // Container styles for design system
    const containerStyles = {
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
          : '0',
      margin:
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${this.addPixelUnit(moduleWithDesign.margin_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0px'}`
          : '0',
      background: moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border:
        moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none'
          ? `${moduleWithDesign.border_width || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0',
      position: moduleWithDesign.position || 'relative',
      top: moduleWithDesign.top || 'auto',
      bottom: moduleWithDesign.bottom || 'auto',
      left: moduleWithDesign.left || 'auto',
      right: moduleWithDesign.right || 'auto',
      zIndex: moduleWithDesign.z_index || 'auto',
      width: moduleWithDesign.width || '100%',
      height: moduleWithDesign.height || 'auto',
      maxWidth: moduleWithDesign.max_width || '100%',
      maxHeight: moduleWithDesign.max_height || 'none',
      minWidth: moduleWithDesign.min_width || 'none',
      minHeight: moduleWithDesign.min_height || 'auto',
      overflow: moduleWithDesign.overflow || 'visible',
      clipPath: moduleWithDesign.clip_path || 'none',
      backdropFilter: moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
          ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    const content = html`
      <div class="image-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="image-module-preview">
          <!-- Image Container with Alignment -->
          <div style="display: flex; justify-content: ${imageContainerAlignment}; width: 100%;">
            ${imageUrl
              ? html`
                  <img
                    src="${imageUrl}"
                    alt="Image"
                    style="${imageStyle}"
                    @mouseover=${(e: Event) => {
                      if (imageModule.hover_enabled && hoverEffectCSS) {
                        const target = e.target as HTMLElement;
                        const originalTransition = target.style.transition;
                        target.style.cssText += hoverEffectCSS;
                      }
                    }}
                    @mouseout=${(e: Event) => {
                      if (imageModule.hover_enabled) {
                        const target = e.target as HTMLElement;
                        target.style.transform = '';
                        target.style.opacity = '';
                        target.style.filter = filterCSS; // Keep original filters
                        target.style.boxShadow = '';
                      }
                    }}
                    @click=${(e: Event) => {
                      const tapAction = imageModule.tap_action || { action: 'default' };
                      UltraLinkComponent.handleAction(tapAction, hass, e.target as HTMLElement);
                    }}
                    @contextmenu=${(e: Event) => {
                      e.preventDefault(); // Prevent default context menu
                      const holdAction = imageModule.hold_action || { action: 'default' };
                      UltraLinkComponent.handleAction(holdAction, hass, e.target as HTMLElement);
                    }}
                    @dblclick=${(e: Event) => {
                      const doubleAction = imageModule.double_tap_action || { action: 'default' };
                      UltraLinkComponent.handleAction(doubleAction, hass, e.target as HTMLElement);
                    }}
                  />
                `
              : html`
                  <div
                    style="
                      width: ${imageModule.width || 100}%;
                      height: ${imageModule.height || 200}px;
                      background: var(--secondary-background-color);
                      border: 2px dashed var(--divider-color);
                      border-radius: ${imageModule.border_radius || 8}px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--secondary-text-color);
                      font-size: 14px;
                    "
                  >
                    <div style="text-align: center;">
                      <ha-icon
                        icon="mdi:image-off"
                        style="font-size: 48px; margin-bottom: 8px; opacity: 0.5;"
                      ></ha-icon>
                      <div>No image source configured</div>
                    </div>
                  </div>
                `}
          </div>
        </div>
      </div>
    `;

    return content;
  }

  private async handleFileUpload(
    event: Event,
    updateModule: (updates: Partial<ImageModule>) => void
  ): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    try {
      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Home Assistant's media browser API
      const response = await fetch('/api/media_source/local/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${(window as any).hassTokens?.access_token || ''}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // The uploaded file path will be something like '/media/local/filename.jpg'
        const imagePath = result.media_content_id || `/media/local/${file.name}`;
        updateModule({
          image_url: imagePath,
          image_type: 'upload',
        });
      } else {
        console.error('Upload failed:', response.statusText);
        // Fallback: try to use a data URL (though this isn't recommended for large images)
        const reader = new FileReader();
        reader.onload = e => {
          const dataUrl = e.target?.result as string;
          updateModule({
            image_url: dataUrl,
            image_type: 'upload',
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Fallback to data URL
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        updateModule({
          image_url: dataUrl,
          image_type: 'upload',
        });
      };
      reader.readAsDataURL(file);
    }
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const imageModule = module as ImageModule;
    const errors = [...baseValidation.errors];

    // Validate based on image_type
    switch (imageModule.image_type) {
      case 'url':
        if (!imageModule.image_url || imageModule.image_url.trim() === '') {
          errors.push('Image URL is required when using URL type');
        }
        break;

      case 'upload':
        if (!imageModule.image_url || imageModule.image_url.trim() === '') {
          errors.push('Uploaded image is required when using upload type');
        }
        break;

      case 'entity':
        if (!imageModule.image_entity || imageModule.image_entity.trim() === '') {
          errors.push('Image entity is required when using entity type');
        }
        break;

      case 'attribute':
        if (!imageModule.image_entity || imageModule.image_entity.trim() === '') {
          errors.push('Entity is required when using attribute type');
        }
        if (!imageModule.image_attribute || imageModule.image_attribute.trim() === '') {
          errors.push('Attribute name is required when using attribute type');
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

    if (imageModule.link_enabled && !imageModule.link_url) {
      errors.push('Link URL is required when link is enabled');
    }

    if (imageModule.width && (imageModule.width < 1 || imageModule.width > 100)) {
      errors.push('Width must be between 1 and 100 percent');
    }

    if (imageModule.height && (imageModule.height < 50 || imageModule.height > 800)) {
      errors.push('Height must be between 50 and 800 pixels');
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
            // Handle Home Assistant local paths
            if (imageUrl.startsWith('/local/') || imageUrl.startsWith('/media/')) {
              imageUrl = imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = imageUrl;
            }
            return `url("${imageUrl}")`;
          }
        }
        break;
    }

    return 'none';
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
        color: var(--primary-text-color) !important;
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
}
