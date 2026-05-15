import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BackgroundModule, UltraCardConfig } from '../types';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';

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

        <!-- Background Source (type selector + source-specific fields, one card) -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.background.source_title', lang, 'Background Source')}
          </div>
          ${this.renderSegmentedField(
            localize('editor.background.type', lang, 'Background Type'),
            localize(
              'editor.background.type_desc',
              lang,
              'Select the source type for your background image.'
            ),
            backgroundModule.background_type || 'none',
            [
              {
                value: 'none',
                label: localize('editor.background.type_none', lang, 'None'),
                icon: 'mdi:image-off-outline',
              },
              {
                value: 'upload',
                label: localize('editor.background.type_upload', lang, 'Upload Image'),
                icon: 'mdi:upload',
              },
              {
                value: 'entity',
                label: localize('editor.background.type_entity', lang, 'Entity Image'),
                icon: 'mdi:account-circle',
              },
              {
                value: 'url',
                label: localize('editor.background.type_url', lang, 'Image URL'),
                icon: 'mdi:link-variant',
              },
            ],
            next => {
              const prev = backgroundModule.background_type || 'none';
              if (next === prev) return;
              updateModule({ background_type: next as typeof backgroundModule.background_type });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
          ${backgroundModule.background_type === 'url'
            ? html`
                <div style="margin-top: 8px;">
                  ${this.renderFieldSection(
                    localize('editor.background.image_url', lang, 'Image URL'),
                    localize(
                      'editor.background.image_url_desc',
                      lang,
                      'Enter the direct URL to the background image.'
                    ),
                    hass,
                    { background_image: backgroundModule.background_image || '' },
                    [this.textField('background_image')],
                    (e: CustomEvent) =>
                      updateModule({ background_image: e.detail.value.background_image })
                  )}
                </div>
              `
            : ''}
          ${backgroundModule.background_type === 'upload'
            ? html`
                <div style="margin-top: 8px;">
                  ${this.renderFileField(
                    localize('editor.background.upload', lang, 'Upload Image'),
                    localize(
                      'editor.background.upload_desc',
                      lang,
                      'Click to upload a background image file from your device.'
                    ),
                    hass,
                    backgroundModule.background_image || '',
                    path => {
                      updateModule({ background_image: path });
                      this.triggerPreviewUpdate();
                    }
                  )}
                </div>
              `
            : ''}
          ${backgroundModule.background_type === 'entity'
            ? html`
                <div style="margin-top: 8px;">
                  ${this.renderEntityPickerWithVariables(
                    hass,
                    config,
                    'background_image_entity',
                    backgroundModule.background_image_entity || '',
                    (value: string) => {
                      const prev = backgroundModule.background_image_entity || '';
                      if (value === prev) return;
                      updateModule({ background_image_entity: value });
                    },
                    undefined,
                    localize('editor.background.entity', lang, 'Entity')
                  )}
                  <div class="field-description" style="margin-top: 4px;">
                    ${localize(
                      'editor.background.entity_desc',
                      lang,
                      'Select an entity that provides a picture URL or image (e.g. person, camera, or media player).'
                    )}
                  </div>
                </div>
              `
            : ''}
        </div>

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
   * Get styles (none needed for this module)
   */
  getStyles(): string {
    return BaseUltraModule.getSliderStyles();
  }
}

