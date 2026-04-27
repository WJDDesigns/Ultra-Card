import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BackgroundModule, UltraCardConfig } from '../types';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { uploadImage } from '../utils/image-upload';
import { ucToastService } from '../services/uc-toast-service';

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
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">

        <!-- Module Info Banner -->
        ${this.renderSettingsSection(
          localize('editor.background.info_title', lang, 'View Background'),
          localize(
            'editor.background.info_desc',
            lang,
            'Apply custom background images to your dashboard view. Only the topmost enabled module with passing logic conditions will be applied.'
          ),
          []
        )}

        <!-- Background Source -->
        ${this.renderSettingsSection(
          localize('editor.background.source_title', lang, 'Background Source'),
          localize('editor.background.source_desc', lang, 'Choose how you want to specify the background image.'),
          [
            {
              title: localize('editor.background.type', lang, 'Background Type'),
              description: localize('editor.background.type_desc', lang, 'Select the source type for your background image.'),
              hass,
              data: { background_type: backgroundModule.background_type || 'none' },
              schema: [
                this.selectField('background_type', [
                  { value: 'none', label: localize('editor.background.type_none', lang, 'None') },
                  { value: 'upload', label: localize('editor.background.type_upload', lang, 'Upload Image') },
                  { value: 'entity', label: localize('editor.background.type_entity', lang, 'Entity Image') },
                  { value: 'url', label: localize('editor.background.type_url', lang, 'Image URL') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.background_type;
                const prev = backgroundModule.background_type || 'none';
                if (next === prev) return;
                updateModule({ background_type: next });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- URL Image Source -->
        ${backgroundModule.background_type === 'url'
          ? this.renderConditionalFieldsGroup(
              localize('editor.background.url_config', lang, 'Image URL Configuration'),
              html`
                ${this.renderFieldSection(
                  localize('editor.background.image_url', lang, 'Image URL'),
                  localize('editor.background.image_url_desc', lang, 'Enter the direct URL to the background image.'),
                  hass,
                  { background_image: backgroundModule.background_image || '' },
                  [this.textField('background_image')],
                  (e: CustomEvent) => updateModule({ background_image: e.detail.value.background_image })
                )}
              `
            )
          : ''}

        <!-- Upload Image Source -->
        ${backgroundModule.background_type === 'upload'
          ? this.renderConditionalFieldsGroup(
              localize('editor.background.upload_config', lang, 'Upload Image Configuration'),
              html`
                <div class="field-title">${localize('editor.background.upload', lang, 'Upload Image')}</div>
                <div class="field-description">${localize('editor.background.upload_desc', lang, 'Click to upload a background image file from your device.')}</div>
                <input
                  type="file"
                  accept="image/*"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                  @change=${(e: Event) => this.handleFileUpload(e, updateModule, hass)}
                />
                ${backgroundModule.background_image
                  ? html`<div style="margin-top: 8px; font-size: 12px; color: var(--success-color);">✓ ${localize('editor.background.uploaded', lang, 'Image uploaded')}</div>`
                  : ''}
              `
            )
          : ''}

        <!-- Entity Image Source -->
        ${backgroundModule.background_type === 'entity'
          ? this.renderConditionalFieldsGroup(
              localize('editor.background.entity_config', lang, 'Entity Image Configuration'),
              html`
                ${this.renderEntityPickerWithVariables(
                  hass, config, 'background_image_entity', backgroundModule.background_image_entity || '',
                  (value: string) => {
                    const prev = backgroundModule.background_image_entity || '';
                    if (value === prev) return;
                    updateModule({ background_image_entity: value });
                  },
                  undefined,
                  localize('editor.background.entity', lang, 'Entity')
                )}
                <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
                  ${localize('editor.background.entity_desc', lang, 'Select an entity that provides a picture URL or image (e.g. person, camera, or media player).')}
                </div>
              `
            )
          : ''}

        <!-- Background Settings -->
        ${backgroundModule.background_type !== 'none'
          ? this.renderSettingsSection(
              localize('editor.background.settings_title', lang, 'Background Settings'),
              localize('editor.background.settings_desc', lang, 'Control how the background image is displayed.'),
              [
                {
                  title: localize('editor.background.size', lang, 'Background Size'),
                  description: localize('editor.background.size_desc', lang, 'Control how the background image is sized within the view.'),
                  hass,
                  data: { background_size: backgroundModule.background_size || 'cover' },
                  schema: [
                    this.selectField('background_size', [
                      { value: 'cover', label: localize('editor.background.size_cover', lang, 'Cover (Fill entire area)') },
                      { value: 'contain', label: localize('editor.background.size_contain', lang, 'Contain (Fit within area)') },
                      { value: 'fill', label: localize('editor.background.size_fill', lang, 'Fill (Stretch to fit)') },
                      { value: 'auto', label: localize('editor.background.size_auto', lang, 'Auto (Original size)') },
                    ]),
                  ],
                  onChange: (e: CustomEvent) => {
                    const next = e.detail.value.background_size;
                    const prev = backgroundModule.background_size || 'cover';
                    if (next === prev) return;
                    updateModule({ background_size: next });
                  },
                },
                {
                  title: localize('editor.background.position', lang, 'Background Position'),
                  description: localize('editor.background.position_desc', lang, 'Set the position (e.g., center, top left, bottom right).'),
                  hass,
                  data: { background_position: backgroundModule.background_position || 'center' },
                  schema: [this.textField('background_position')],
                  onChange: (e: CustomEvent) =>
                    updateModule({ background_position: e.detail.value.background_position }),
                },
                {
                  title: localize('editor.background.repeat', lang, 'Background Repeat'),
                  description: localize('editor.background.repeat_desc', lang, 'Control how the background image repeats.'),
                  hass,
                  data: { background_repeat: backgroundModule.background_repeat || 'no-repeat' },
                  schema: [
                    this.selectField('background_repeat', [
                      { value: 'no-repeat', label: localize('editor.background.repeat_none', lang, 'No Repeat') },
                      { value: 'repeat', label: localize('editor.background.repeat_both', lang, 'Repeat') },
                      { value: 'repeat-x', label: localize('editor.background.repeat_x', lang, 'Repeat Horizontally') },
                      { value: 'repeat-y', label: localize('editor.background.repeat_y', lang, 'Repeat Vertically') },
                    ]),
                  ],
                  onChange: (e: CustomEvent) => {
                    const next = e.detail.value.background_repeat;
                    const prev = backgroundModule.background_repeat || 'no-repeat';
                    if (next === prev) return;
                    updateModule({ background_repeat: next });
                  },
                },
              ]
            )
          : ''}

        <!-- Opacity Slider -->
        ${backgroundModule.background_type !== 'none'
          ? this.renderSliderField(
              localize('editor.background.opacity', lang, 'Opacity'),
              localize('editor.background.opacity_desc', lang, 'Control the opacity of the background image (0–100%).'),
              backgroundModule.opacity !== undefined ? backgroundModule.opacity : 100,
              100,
              0, 100, 1,
              (v: number) => updateModule({ opacity: v }),
              '%'
            )
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
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
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

      return this.wrapWithAnimation(html`
        <div
          class="${hoverClass}"
          style="${designStyles}; padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px; border: 2px dashed var(--divider-color);"
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
      `, module, hass);
    }

    // Hide completely on dashboard (no visible element at all)
    return html``;
  }

  /**
   * Validate module configuration
   */
  override validate(module: CardModule): { valid: boolean; errors: string[] } {
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
      ucToastService.error('Failed to upload image. Please try again.');
    }
  }

  /**
   * Get styles (none needed for this module)
   */
  getStyles(): string {
    return BaseUltraModule.getSliderStyles();
  }
}

