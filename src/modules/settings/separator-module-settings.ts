import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraSeparatorModule } from '../separator-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, SeparatorModule, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';

import '../../components/ultra-color-picker';

/**
 * Separator module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraSeparatorModuleSettings extends UltraSeparatorModule {
  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const separatorModule = module as SeparatorModule;
    const lang = hass.locale?.language || 'en';

    // Migration: Fix old separators that have CSS variable strings stored as color values
    if (
      separatorModule.color === 'var(--divider-color)' ||
      separatorModule.color === 'var(--divider-color, #cccccc)'
    ) {
      updateModule({ color: '#cccccc' });
    }

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Separator Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            ${localize('editor.separator.config.title', lang, 'Separator Configuration')}
          </div>

          <!-- Separator Style -->
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.separator.style.title', lang, 'Separator Style')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
          >
            ${localize(
              'editor.separator.style.desc',
              lang,
              'Choose the visual style of the separator line.'
            )}
          </div>
          ${this.renderUcForm(
            hass,
            { separator_style: separatorModule.separator_style },
            [
              this.selectField('separator_style', [
                {
                  value: 'line',
                  label: localize('editor.separator.options.solid', lang, 'Solid Line'),
                },
                {
                  value: 'double_line',
                  label: localize('editor.separator.options.double', lang, 'Double Line'),
                },
                {
                  value: 'dotted',
                  label: localize('editor.separator.options.dotted', lang, 'Dotted Line'),
                },
                {
                  value: 'double_dotted',
                  label: localize('editor.separator.options.double_dotted', lang, 'Double Dotted'),
                },
                {
                  value: 'shadow',
                  label: localize('editor.separator.options.shadow', lang, 'Shadow'),
                },
                {
                  value: 'blank',
                  label: localize('editor.separator.options.blank', lang, 'Blank Space'),
                },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.separator_style;
              const prev = separatorModule.separator_style;
              if (next === prev) return;
              updateModule(e.detail.value);
              // Trigger re-render to update dropdown UI
              setTimeout(() => {
                this.triggerPreviewUpdate();
              }, 50);
            },
            false
          )}

          <!-- Orientation -->
          <div
            class="field-title"
            style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
          >
            ${localize('editor.separator.orientation.title', lang, 'Orientation')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
          >
            ${localize(
              'editor.separator.orientation.desc',
              lang,
              'Choose whether the separator runs horizontally or vertically.'
            )}
          </div>
          ${this.renderUcForm(
            hass,
            { orientation: separatorModule.orientation },
            [
              this.selectField('orientation', [
                {
                  value: 'horizontal',
                  label: localize('editor.separator.orientation.horizontal', lang, 'Horizontal'),
                },
                {
                  value: 'vertical',
                  label: localize('editor.separator.orientation.vertical', lang, 'Vertical'),
                },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.orientation;
              const prev = separatorModule.orientation;
              if (next === prev) return;
              updateModule(e.detail.value);
              // Trigger re-render to update dropdown UI
              setTimeout(() => {
                this.triggerPreviewUpdate();
              }, 50);
            },
            false
          )}
        </div>

        <!-- Appearance Configuration -->
        ${separatorModule.separator_style !== 'blank'
          ? html`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                >
                  ${localize('editor.separator.appearance.title', lang, 'Appearance')}
                </div>

                <!-- Thickness -->
                <div class="field-container" style="margin-bottom: 24px;">
                  ${this.renderSliderField(
                    localize('editor.separator.thickness', lang, 'Thickness (px)'),
                    localize(
                      'editor.separator.thickness_desc',
                      lang,
                      'Thickness of the separator line.'
                    ),
                    separatorModule.thickness || 1,
                    1,
                    1,
                    20,
                    1,
                    (v: number) => {
                      updateModule({ thickness: v });
                    }
                  )}
                </div>

                <!-- Width/Height based on orientation -->
                ${(separatorModule as any).separator_style === 'shadow' ||
                (separatorModule as any).separator_style === 'blank'
                  ? html``
                  : separatorModule.orientation === 'vertical'
                    ? this.renderUnitAwareSliderField(
                        localize('editor.separator.height', lang, 'Height'),
                        localize(
                          'editor.separator.height_desc',
                          lang,
                          'Height of the separator. Use pixels (e.g., "300px") or percentage (e.g., "50%").'
                        ),
                        separatorModule.height_px as number | string | undefined,
                        '300px',
                        50,
                        600,
                        10,
                        'px',
                        '300px or 50%',
                        (next: number | string | undefined) =>
                          updateModule({ height_px: next as any })
                      )
                    : this.renderUnitAwareSliderField(
                        localize('editor.separator.width', lang, 'Width'),
                        localize(
                          'editor.separator.width_desc',
                          lang,
                          'Width of the separator. Use percentage (e.g., "100%") or pixels (e.g., "200px").'
                        ),
                        separatorModule.width_percent as number | string | undefined,
                        100,
                        10,
                        100,
                        5,
                        '%',
                        '100% or 200px',
                        (next: number | string | undefined) =>
                          updateModule({ width_percent: next as any })
                      )}

                <!-- Color -->
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    ${localize('editor.separator.color.title', lang, 'Color')}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    ${localize('editor.separator.color.desc', lang, 'Color of the separator line.')}
                  </div>
                  <ultra-color-picker
                    .label=${''}
                    .value=${separatorModule.color || '#cccccc'}
                    .defaultValue=${'#cccccc'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => updateModule({ color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}
        ${separatorModule.separator_style !== 'blank'
          ? html` <!-- Text in Separator -->
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
              >
                ${this.renderFieldSection(
                  localize('editor.separator.show_title', lang, 'Show Title'),
                  localize(
                    'editor.separator.show_title_desc',
                    lang,
                    'Add text in the middle of the separator line (e.g., ------ Text ------)'
                  ),
                  hass,
                  { show_title: separatorModule.show_title || false },
                  [this.booleanField('show_title')],
                  (e: CustomEvent) => updateModule({ show_title: e.detail.value.show_title })
                )}
                ${separatorModule.show_title
                  ? html`
                      <!-- Text Content -->
                      <div class="field-group" style="margin-bottom: 16px;">
                        <div
                          class="field-title"
                          style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                        >
                          ${localize('editor.separator.text_content.title', lang, 'Text Content')}
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                        >
                          ${localize(
                            'editor.separator.text_content.desc',
                            lang,
                            'Text to display in the middle of the separator.'
                          )}
                        </div>
                        <ha-form
                          .hass=${hass}
                          .data=${{ title: separatorModule.title || '' }}
                          .schema=${[
                            {
                              name: 'title',
                              selector: { text: {} },
                              label: '',
                            },
                          ]}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ title: e.detail.value.title })}
                        ></ha-form>
                      </div>

                      <!-- Font Size -->
                      <div class="field-container" style="margin-bottom: 24px;">
                        ${this.renderSliderField(
                          localize('editor.separator.font_size', lang, 'Font Size'),
                          localize(
                            'editor.separator.font_size_desc',
                            lang,
                            'Size of the text in pixels.'
                          ),
                          separatorModule.title_size || 14,
                          14,
                          8,
                          48,
                          1,
                          (v: number) => {
                            updateModule({ title_size: v });
                          }
                        )}
                      </div>

                      <!-- Text Color -->
                      <div class="field-group" style="margin-bottom: 16px;">
                        <div
                          class="field-title"
                          style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                        >
                          ${localize('editor.separator.text_color.title', lang, 'Text Color')}
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                        >
                          ${localize(
                            'editor.separator.text_color.desc',
                            lang,
                            'Color of the separator text.'
                          )}
                        </div>
                        <ultra-color-picker
                          .label=${''}
                          .value=${separatorModule.title_color || ''}
                          .defaultValue=${'var(--secondary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ title_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>

                      <!-- Text Formatting -->
                      <div class="field-group">
                        <div
                          class="field-title"
                          style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                        >
                          ${localize('editor.separator.text_format.title', lang, 'Text Formatting')}
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                        >
                          ${localize(
                            'editor.separator.text_format.desc',
                            lang,
                            'Apply formatting styles to the separator text.'
                          )}
                        </div>
                        <div
                          class="format-buttons"
                          style="display: flex; gap: 8px; flex-wrap: wrap;"
                        >
                          <button
                            class="format-btn ${separatorModule.title_bold ? 'active' : ''}"
                            @click=${() =>
                              updateModule({ title_bold: !separatorModule.title_bold })}
                            style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${separatorModule.title_bold
                              ? 'var(--primary-color)'
                              : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_bold
                              ? 'white'
                              : 'var(--primary-text-color)'};"
                            title=${localize('editor.separator.text_format.bold', lang, 'Bold')}
                          >
                            <ha-icon icon="mdi:format-bold"></ha-icon>
                          </button>
                          <button
                            class="format-btn ${separatorModule.title_italic ? 'active' : ''}"
                            @click=${() =>
                              updateModule({ title_italic: !separatorModule.title_italic })}
                            style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${separatorModule.title_italic
                              ? 'var(--primary-color)'
                              : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_italic
                              ? 'white'
                              : 'var(--primary-text-color)'};"
                            title=${localize('editor.separator.text_format.italic', lang, 'Italic')}
                          >
                            <ha-icon icon="mdi:format-italic"></ha-icon>
                          </button>
                          <button
                            class="format-btn ${separatorModule.title_underline ? 'active' : ''}"
                            @click=${() =>
                              updateModule({ title_underline: !separatorModule.title_underline })}
                            style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${separatorModule.title_underline
                              ? 'var(--primary-color)'
                              : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_underline
                              ? 'white'
                              : 'var(--primary-text-color)'};"
                            title=${localize(
                              'editor.separator.text_format.underline',
                              lang,
                              'Underline'
                            )}
                          >
                            <ha-icon icon="mdi:format-underline"></ha-icon>
                          </button>
                          <button
                            class="format-btn ${separatorModule.title_uppercase ? 'active' : ''}"
                            @click=${() =>
                              updateModule({ title_uppercase: !separatorModule.title_uppercase })}
                            style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${separatorModule.title_uppercase
                              ? 'var(--primary-color)'
                              : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_uppercase
                              ? 'white'
                              : 'var(--primary-text-color)'};"
                            title=${localize(
                              'editor.separator.text_format.uppercase',
                              lang,
                              'Uppercase'
                            )}
                          >
                            <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
                          </button>
                          <button
                            class="format-btn ${separatorModule.title_strikethrough
                              ? 'active'
                              : ''}"
                            @click=${() =>
                              updateModule({
                                title_strikethrough: !separatorModule.title_strikethrough,
                              })}
                            style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${separatorModule.title_strikethrough
                              ? 'var(--primary-color)'
                              : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_strikethrough
                              ? 'white'
                              : 'var(--primary-text-color)'};"
                            title=${localize(
                              'editor.separator.text_format.strikethrough',
                              lang,
                              'Strikethrough'
                            )}
                          >
                            <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                          </button>
                        </div>
                      </div>
                    `
                  : html`
                      <div
                        style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                      >
                        ${localize(
                          'editor.separator.show_title_toggle.enable_toggle_desc',
                          lang,
                          'Enable the toggle above to configure title settings'
                        )}
                      </div>
                    `}
              </div>`
          : html`
              <!-- Spacer (Blank) Thickness Control -->
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                >
                  ${localize('editor.separator.spacer.title', lang, 'Spacer Height')}
                </div>
                <div class="field-container" style="margin-bottom: 24px;">
                  ${this.renderSliderField(
                    localize('editor.separator.height', lang, 'Height (px)'),
                    localize(
                      'editor.separator.height_desc',
                      lang,
                      'Controls the visual gap for Blank Space.'
                    ),
                    separatorModule.thickness || 1,
                    1,
                    1,
                    300,
                    1,
                    (v: number) => {
                      updateModule({ thickness: v });
                    }
                  )}
                </div>
              </div>
            `}
      </div>
    `;
  }
}

installSettingsMethods(UltraSeparatorModule, UltraSeparatorModuleSettings);

export function renderSeparatorGeneralTab(
  host: UltraSeparatorModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraSeparatorModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraSeparatorModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}
