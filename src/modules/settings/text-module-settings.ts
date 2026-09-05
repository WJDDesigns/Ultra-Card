import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraTextModule, TEXT_TEMPLATE_KEYS } from '../text-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, TextModule, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';
import { UcFormUtils } from '../../utils/uc-form-utils';
import '../../components/ultra-color-picker';

/**
 * Text module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraTextModuleSettings extends UltraTextModule {
  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const textModule = module as TextModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Module-Wide Size Controls -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            SIZE CONTROLS
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            Control the default sizes for this module. Design tab overrides these settings.
          </div>

          <!-- Text Size Control -->
          ${this.renderSliderField(
            localize('editor.text.text_size', lang, 'Text Size'),
            'Default size for text content',
            textModule.text_size ?? 16,
            16,
            10,
            48,
            1,
            (v: number) => {
              updateModule({ text_size: v });
            },
            'px'
          )}

          <!-- Icon Size Control (only shown when icon is configured) -->
          ${textModule.icon && textModule.icon.trim() !== ''
            ? this.renderSliderField(
                localize('editor.text.icon_size', lang, 'Icon Size'),
                'Size of the icon',
                textModule.icon_size ?? 24,
                24,
                12,
                64,
                1,
                (v: number) => {
                  updateModule({ icon_size: v });
                },
                'px'
              )
            : ''}
        </div>

        <!-- Content Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.text.content_section.title', lang, 'Content Configuration')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.text.rich_text_content_section.desc',
              lang,
              'Use the toolbar to format your text with bold, italic, colors, links and more.'
            )}
          </div>

          ${!textModule.unified_template_mode
            ? (() => {
                const dp = (textModule as any).design || {};
                const mwd = textModule as any;
                const editorStyles: Record<string, string> = {};
                const fw = dp.font_weight || mwd.font_weight;
                if (fw) editorStyles.fontWeight = fw;
                const fs = dp.font_style || mwd.font_style;
                if (fs && fs !== 'inherit') editorStyles.fontStyle = fs;
                const tt = dp.text_transform || mwd.text_transform;
                if (tt && tt !== 'none') editorStyles.textTransform = tt;
                const td = dp.text_decoration || mwd.text_decoration;
                if (td && td !== 'none') editorStyles.textDecoration = td;
                const ff = dp.font_family || mwd.font_family;
                if (ff && ff !== 'inherit') editorStyles.fontFamily = ff;
                const lh = dp.line_height || mwd.line_height;
                if (lh && lh !== 'inherit') editorStyles.lineHeight = lh;
                const ls = dp.letter_spacing || mwd.letter_spacing;
                if (ls && ls !== 'inherit') editorStyles.letterSpacing = ls;
                const clr = dp.color || textModule.color;
                if (clr && clr !== 'inherit') editorStyles.color = clr;

                const fontSize = (() => {
                  if (
                    dp.font_size &&
                    typeof dp.font_size === 'string' &&
                    dp.font_size.trim() !== ''
                  ) {
                    return /[a-zA-Z%]/.test(dp.font_size) ? dp.font_size : `${dp.font_size}px`;
                  }
                  if (mwd.font_size !== undefined) return `${mwd.font_size}px`;
                  if (textModule.text_size !== undefined) return `${textModule.text_size}px`;
                  return undefined;
                })();
                if (fontSize) editorStyles.fontSize = fontSize;

                return html`
                  <div
                    @mousedown=${(e: Event) => {
                      const target = e.target as HTMLElement;
                      if (
                        !target.closest('ultra-wysiwyg-editor') &&
                        !target.closest('.ProseMirror')
                      ) {
                        e.stopPropagation();
                      }
                    }}
                    @dragstart=${(e: Event) => e.stopPropagation()}
                  >
                    <ultra-wysiwyg-editor
                      .content=${this._getEffectiveRichContent(textModule)}
                      .placeholder=${'Start typing...'}
                      .editorStyles=${editorStyles}
                      @content-changed=${(e: CustomEvent) => {
                        updateModule({ rich_text_content: e.detail.value });
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                    ></ultra-wysiwyg-editor>
                  </div>
                `;
              })()
            : html`
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; padding: 12px; background: var(--divider-color); border-radius: 8px;"
                >
                  ${localize(
                    'editor.text.unified_replaces_content',
                    lang,
                    'Rich text is hidden while Unified Template Mode is on. Turn it off to edit static content, or use the unified template JSON for dynamic text.'
                  )}
                </div>
              `}
        </div>

        <!-- Icon Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.text.icon_section.title', lang, 'Icon Configuration')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.text.icon_section.desc',
              lang,
              'Choose an icon to display alongside the text content.'
            )}
          </div>

          ${UcFormUtils.renderFieldSection(
            localize('editor.text.icon', lang, 'Icon'),
            localize(
              'editor.text.icon_desc',
              lang,
              'Choose an icon to display alongside the text. Leave empty for no icon.'
            ),
            hass,
            { icon: textModule.icon || '' },
            [this.iconField('icon')],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          ${textModule.icon && textModule.icon.trim() !== ''
            ? html`
                <div style="margin-top: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    ${localize('editor.text.icon_position', lang, 'Icon Position')}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    ${localize(
                      'editor.text.icon_position_desc',
                      lang,
                      'Choose where to position the icon relative to the text.'
                    )}
                  </div>
                  <div
                    style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                  >
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(textModule.icon_position ||
                        'before') === 'before'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(textModule.icon_position ||
                        'before') === 'before'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(textModule.icon_position || 'before') ===
                      'before'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${() => updateModule({ icon_position: 'before' })}
                    >
                      <ha-icon
                        icon="mdi:format-align-left"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >${localize('editor.text.before_text', lang, 'Before Text')}</span
                      >
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(textModule.icon_position ||
                        'before') === 'after'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(textModule.icon_position ||
                        'before') === 'after'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(textModule.icon_position || 'before') ===
                      'after'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${() => updateModule({ icon_position: 'after' })}
                    >
                      <ha-icon
                        icon="mdi:format-align-right"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >${localize('editor.text.after_text', lang, 'After Text')}</span
                      >
                    </button>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Color Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.text.color_section.title', lang, 'Color Configuration')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.text.color_section.desc',
              lang,
              'Configure the text and icon colors for this module.'
            )}
          </div>

          <!-- Text Color -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${localize('editor.text.text_color', lang, 'Text Color')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
            >
              ${localize(
                'editor.text.text_color_desc',
                lang,
                'Choose the color for the text content.'
              )}
            </div>
            <ultra-color-picker
              .value=${textModule.color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => updateModule({ color: e.detail.value })}
            ></ultra-color-picker>
          </div>

          <!-- Icon Color (only show if icon is selected) -->
          ${textModule.icon && textModule.icon.trim() !== ''
            ? html`
                <div>
                  <div class="field-container">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                    >
                      ${localize('editor.text.icon_color', lang, 'Icon Color')}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
                    >
                      ${localize(
                        'editor.text.icon_color_desc',
                        lang,
                        'Choose the color for the icon.'
                      )}
                    </div>
                    <ultra-color-picker
                      .value=${textModule.icon_color || ''}
                      .defaultValue=${'var(--primary-color)'}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ icon_color: e.detail.value })}
                    ></ultra-color-picker>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Unified Template Section -->
        <div class="template-section" style="margin-top: 24px; margin-bottom: 24px;">
          <div class="template-header">
            <div class="switch-container">
              <div class="switch-label-row">
                <label class="switch-label"
                  >${localize(
                    'editor.text.unified_template_section.toggle',
                    lang,
                    'Template Mode'
                  )}</label
                >
                <button
                  class="help-btn"
                  style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:var(--text-primary-color, #fff);cursor:pointer;border-radius:50%;line-height:0;"
                  title="${localize(
                    'editor.text.template_cheatsheet',
                    lang,
                    'Template Cheatsheet'
                  )}"
                  @click=${(e: Event) => {
                    (e.currentTarget as HTMLElement).dispatchEvent(
                      new CustomEvent('uc-open-template-cheatsheet', {
                        detail: { module: 'text' },
                        bubbles: true,
                        composed: true,
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
                { unified_template_mode: textModule.unified_template_mode || false },
                [this.booleanField('unified_template_mode')],
                (e: CustomEvent) =>
                  updateModule({
                    unified_template_mode: e.detail.value.unified_template_mode,
                  })
              )}
            </div>
            <div class="template-description">
              ${localize(
                'editor.text.unified_template_section.desc',
                lang,
                'Return JSON with content, color, and optional container_background_color. Plain Jinja strings are treated as dynamic text. HTML tags in the output are shown as text, so style it with color rather than markup.'
              )}
            </div>
          </div>

          ${textModule.unified_template_mode
            ? html`
                <div
                  class="template-content"
                  style="margin-top: 12px;"
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
                    .value=${textModule.unified_template || ''}
                    .placeholder=${'{\n  "content": "{{ states(\'sensor.example\') }}",\n  "color": "var(--primary-text-color)"\n}'}
                    .minHeight=${120}
                    .maxHeight=${360}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({ unified_template: e.detail.value });
                    }}
                  ></ultra-template-editor>
                  ${this.renderTemplateKeyWarning(
                    textModule.unified_template,
                    TEXT_TEMPLATE_KEYS,
                    lang
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Text Alignment moved to Design tab per spec -->
      </div>
    `;
  }
}

installSettingsMethods(UltraTextModule, UltraTextModuleSettings);

export function renderTextGeneralTab(
  host: UltraTextModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraTextModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraTextModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}
