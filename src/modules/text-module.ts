import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TextModule, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { UcFormUtils } from '../utils/uc-form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { TemplateService } from '../services/template-service';
import { computeBackgroundStyles } from '../utils/uc-color-utils';
import { localize } from '../localize/localize';
import { buildEntityContext, computeEntitySignature } from '../utils/template-context';
import { parseUnifiedTemplate, hasTemplateError } from '../utils/template-parser';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { sanitizeRichTextHtml } from '../utils/html-sanitizer';
import '../components/ultra-color-picker';
import '../components/ultra-template-editor';
import '../components/ultra-wysiwyg-editor';


export class UltraTextModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'text',
    title: 'Text',
    description: 'Display custom text content',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:format-text',
    category: 'content',
    tags: ['text', 'content', 'typography', 'template'],
  };

  private clickTimeout: any = null;
  private _templateService: TemplateService | undefined;
  private _templateInputDebounce: any = null;

  createDefault(id?: string, hass?: HomeAssistant): TextModule {
    return {
      id: id || this.generateId('text'),
      type: 'text',
      text: 'Sample Text',
      // Legacy link support (for backward compatibility)
      link: '',
      hide_if_no_link: false,
      // Global link configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      icon: '',
      icon_color: '',
      icon_position: 'before',
      unified_template_mode: false,
      unified_template: '',
      // Rich text (WYSIWYG) content — empty by default so that
      // _getEffectiveRichContent() falls through to the legacy `text` field.
      // This prevents overwriting user text when mergeWithDefaults adds the key
      // to configs that predate the WYSIWYG feature (pre-3.2.0).
      rich_text_content: '',
      // Hover configuration
      enable_hover_effect: true,
      hover_background_color: 'var(--divider-color)',
      // Size configuration - default in General tab (not Design tab)
      text_size: 16,
      // No default design overrides; allow layout containers and design tab to control
      design: {},
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
          <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;">
            Control the default sizes for this module. Design tab overrides these settings.
          </div>
          
        <!-- Text Size Control -->
          ${this.renderSliderField(
            localize('editor.text.text_size', lang, 'Text Size'),
            'Default size for text content',
            textModule.text_size ?? 16,
            16,
            10, 48, 1,
            (v: number) => { updateModule({ text_size: v }); },
            'px'
          )}

          <!-- Icon Size Control (only shown when icon is configured) -->
          ${textModule.icon && textModule.icon.trim() !== ''
            ? this.renderSliderField(
                localize('editor.text.icon_size', lang, 'Icon Size'),
                'Size of the icon',
                textModule.icon_size ?? 24,
                24,
                12, 64, 1,
                (v: number) => { updateModule({ icon_size: v }); },
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
                  if (dp.font_size && typeof dp.font_size === 'string' && dp.font_size.trim() !== '') {
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
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
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
                    'Template mode'
                  )}</label
                >
                <button
                  class="help-btn"
                  style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:#fff;cursor:pointer;border-radius:50%;line-height:0;"
                  title="${localize('editor.text.template_cheatsheet', lang, 'Template Cheatsheet')}"
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
                  <ha-icon icon="mdi:help-circle" style="--mdc-icon-size:18px;width:18px;height:18px;color:#fff;"></ha-icon>
                </button>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  .checked=${textModule.unified_template_mode || false}
                  @change=${(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    updateModule({ unified_template_mode: checked });
                  }}
                />
                <span class="slider round"></span>
              </label>
            </div>
            <div class="template-description">
              ${localize(
                'editor.text.unified_template_section.desc',
                lang,
                'Return JSON with content, color, and optional container_background_color. Plain Jinja strings are treated as dynamic text.'
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
                    const editor = (e.currentTarget as HTMLElement).querySelector('ultra-template-editor');
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
                </div>
              `
            : ''}
        </div>

        <!-- Text Alignment moved to Design tab per spec -->
      </div>
    `;
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as TextModule, hass, updates => updateModule(updates));
  }
  // Removed bespoke action editor helpers to rely on GlobalActionsTab

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const textModule = module as TextModule;
    const lang = hass?.locale?.language || 'en';

    // GRACEFUL RENDERING: Check for incomplete configuration
    const effectiveContent = this._getEffectiveRichContent(textModule);
    const unifiedOn =
      !!textModule.unified_template_mode &&
      !!(textModule.unified_template && String(textModule.unified_template).trim());
    if (!unifiedOn && !effectiveContent) {
      return this.renderGradientErrorState(
        localize('editor.text.error_no_content', lang, 'Enter Text Content'),
        localize('editor.text.error_no_content_desc', lang, 'Add text in the General tab'),
        'mdi:format-text'
      );
    }

    // Check if element should be hidden when no link
    if (textModule.hide_if_no_link && !this.hasActiveLink(textModule)) {
      return html`<div class="text-module-hidden">
        ${localize('editor.text.hidden_no_link', lang, 'Hidden (no link)')}
      </div>`;
    }

    // Apply design properties with priority - design properties override module properties
    const moduleWithDesign = textModule as any;
    const designProperties = (textModule as any).design || {};

    // Design properties are now properly merged

    // Use design properties with inheritance-friendly defaults - prioritize design properties
    const chosenAlign = (() => {
      const dp = designProperties.text_align;
      if (dp && dp !== 'inherit') return dp;
      const topLevelTextAlign = (moduleWithDesign as any).text_align; // from layout inheritance
      if (topLevelTextAlign && topLevelTextAlign !== 'inherit') return topLevelTextAlign;
      if (moduleWithDesign.alignment && moduleWithDesign.alignment !== 'inherit')
        return moduleWithDesign.alignment;
      return 'center'; // Default to center alignment for text modules
    })();
    const justifyMap: Record<string, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
      justify: 'flex-start', // text-align does the justify; container keeps content at start
    };

    let displayText: string = textModule.text || 'Sample Text';
    let displayColor: string | undefined;

    // Unified template (must run before textStyles so color applies)
    if (textModule.unified_template_mode && textModule.unified_template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      } else if (this._templateService && hass) {
        this._templateService.updateHass(hass);
      }

      if (hass) {
        const processedUnifiedTemplate = preprocessTemplateVariables(
          textModule.unified_template,
          hass,
          config
        );

        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }
        const templateHash = this._hashString(processedUnifiedTemplate);
        const templateKey = `unified_text_${textModule.id}_${templateHash}`;

        if (this._templateService) {
          const context = buildEntityContext('', hass, {
            text: textModule.text,
          });
          this._templateService.subscribeToTemplate(
            processedUnifiedTemplate,
            templateKey,
            () => {
              this.triggerPreviewUpdate();
            },
            context,
            config,
            computeEntitySignature('', hass)
          );
        }

        const unifiedResult = hass.__uvc_template_strings?.[templateKey];
        if (unifiedResult && String(unifiedResult).trim() !== '') {
          const parsed = parseUnifiedTemplate(unifiedResult);
          if (!hasTemplateError(parsed)) {
            if (parsed.state_text !== undefined && String(parsed.state_text).trim() !== '') {
              displayText = String(parsed.state_text);
            } else if (parsed.content !== undefined && String(parsed.content).trim() !== '') {
              displayText = String(parsed.content);
            } else if (parsed._isString && parsed.content !== undefined) {
              displayText = String(parsed.content).trim();
            }
            if (parsed.color) displayColor = parsed.color;
          }
        }
      }
    }

    const textStyles = {
      fontSize: (() => {
        // Priority 1: Design tab font_size (overrides everything for backwards compatibility)
        if (
          designProperties.font_size &&
          typeof designProperties.font_size === 'string' &&
          designProperties.font_size.trim() !== ''
        ) {
          // If it already has units, use as-is; otherwise add px
          if (/[a-zA-Z%]/.test(designProperties.font_size)) {
            return designProperties.font_size;
          }
          return this.addPixelUnit(designProperties.font_size) || designProperties.font_size;
        }
        // Priority 2: Legacy module font_size
        if (moduleWithDesign.font_size !== undefined) return `${moduleWithDesign.font_size}px`;
        // Priority 3: General tab text_size (new feature)
        if (textModule.text_size !== undefined) return `${textModule.text_size}px`;
        // Priority 4: Default font size for text modules - use clamp for responsive scaling
        return 'clamp(18px, 4vw, 26px)';
      })(),
      fontFamily: designProperties.font_family || moduleWithDesign.font_family || 'inherit',
      // Color: prioritize design properties, then template color, then module color, then inherit (to allow parent CSS variables)
      // Use 'inherit' when no explicit color is set, allowing parent row/column CSS variables to work
      color: designProperties.color || displayColor || textModule.color || 'inherit',
      textAlign: chosenAlign,
      fontWeight: designProperties.font_weight || moduleWithDesign.font_weight || 'inherit',
      fontStyle: designProperties.font_style || moduleWithDesign.font_style || 'inherit',
      textTransform: designProperties.text_transform || moduleWithDesign.text_transform || 'none',
      textDecoration: 'none',
      lineHeight: designProperties.line_height || moduleWithDesign.line_height || 'inherit',
      letterSpacing:
        designProperties.letter_spacing || moduleWithDesign.letter_spacing || 'inherit',
      ...(designProperties.white_space !== undefined || moduleWithDesign.white_space !== undefined
        ? { whiteSpace: designProperties.white_space || moduleWithDesign.white_space || 'normal' }
        : {}),
      margin: '0',

      display: 'flex',
      alignItems: 'center',
      justifyContent: justifyMap[chosenAlign] || 'center',
      gap: '8px',
      width: '100%',
      // Shadow effects
      textShadow:
        designProperties.text_shadow_h && designProperties.text_shadow_v
          ? `${designProperties.text_shadow_h || '0'} ${designProperties.text_shadow_v || '0'} ${designProperties.text_shadow_blur || '0'} ${designProperties.text_shadow_color || 'rgba(0,0,0,0.5)'}`
          : moduleWithDesign.text_shadow_h && moduleWithDesign.text_shadow_v
            ? `${moduleWithDesign.text_shadow_h || '0'} ${moduleWithDesign.text_shadow_v || '0'} ${moduleWithDesign.text_shadow_blur || '0'} ${moduleWithDesign.text_shadow_color || 'rgba(0,0,0,0.5)'}`
            : 'none',
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
            ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
            : 'none',
      // Note: Sizing and positioning properties are handled by containerStyles for design tab functionality
    } as Record<string, string>;

    const iconElement = textModule.icon
      ? html`<ha-icon
          icon="${textModule.icon}"
          style="color: ${textModule.icon_color || 'var(--primary-color)'}; --mdc-icon-size: ${textModule.icon_size || 24}px;"
        ></ha-icon>`
      : '';

    const textElement = !textModule.unified_template_mode && effectiveContent
      ? html`<span class="rich-text-content">${unsafeHTML(sanitizeRichTextHtml(effectiveContent))}</span>`
      : html`<span>${displayText}</span>`;

    let content;
    if (textModule.icon_position === 'before' || !textModule.icon_position) {
      content = html`${iconElement}${textElement}`;
    } else if (textModule.icon_position === 'after') {
      content = html`${textElement}${iconElement}`;
    } else {
      content = textElement;
    }

    // Wrap in link or add click handlers if provided
    const element = this.hasActiveLink(textModule)
      ? html`<div
          class="${GlobalActionsTab.getClickableClass(textModule)}"
          style="${GlobalActionsTab.getClickableStyle(textModule)}"
          @click=${(e: Event) => this.handleClick(e, textModule, hass, config)}
          @dblclick=${(e: Event) => this.handleDoubleClick(e, textModule, hass)}
          @mousedown=${(e: Event) => this.handleMouseDown(e, textModule, hass)}
          @mouseup=${(e: Event) => this.handleMouseUp(e, textModule, hass)}
          @mouseleave=${(e: Event) => this.handleMouseLeave(e, textModule, hass)}
          @touchstart=${(e: Event) => this.handleTouchStart(e, textModule, hass)}
          @touchend=${(e: Event) => this.handleTouchEnd(e, textModule, hass)}
        >
          ${content}
        </div>`
      : content;

    // Check if module has a template-based container background color (needs to be parsed from template strings)
    // This needs to happen BEFORE containerStyles are built
    let templateContainerBg = '';
    if (textModule.unified_template_mode && textModule.unified_template) {
      // Initialize template service if needed
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      } else if (this._templateService && hass) {
        this._templateService.updateHass(hass);
      }

      if (hass) {
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }
        const processedUnifiedTemplate = preprocessTemplateVariables(
          textModule.unified_template, hass, config
        );
        const templateHash = this._hashString(processedUnifiedTemplate);
        const templateKey = `unified_text_${textModule.id}_${templateHash}`;

        // Subscribe to template if not already subscribed (needed for template evaluation)
        if (this._templateService) {
          const context = buildEntityContext('', hass, {
            text: textModule.text,
          });
          this._templateService.subscribeToTemplate(
            processedUnifiedTemplate,
            templateKey,
            () => {
              if (typeof window !== 'undefined') {
                this.triggerPreviewUpdate();
              }
            },
            context,
            config,
            computeEntitySignature('', hass)
          );
        }

        // Check if we already have the rendered template result
        const unifiedResult = hass.__uvc_template_strings?.[templateKey];
        if (unifiedResult && String(unifiedResult).trim() !== '') {
          const parsed = parseUnifiedTemplate(unifiedResult);
          if (!hasTemplateError(parsed) && parsed.container_background_color) {
            templateContainerBg = parsed.container_background_color;
          }
        }
      }
    }

    // Container styles for positioning - prioritize design properties, no hardcoded spacing
    const containerStyles = {
      // Only apply padding if explicitly set by user
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : '0',
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '0px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '0px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '0',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${designProperties.border_width || moduleWithDesign.border_width || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) ||
        'inherit',
      position: designProperties.position || moduleWithDesign.position || 'static',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      // Sizing - apply to container for design tab functionality (use auto for proper alignment)
      width: designProperties.width || moduleWithDesign.width || 'auto',
      height: designProperties.height || moduleWithDesign.height || 'auto',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || 'none',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || 'auto',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || 'auto',
      // Effects
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'visible',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || 'none',
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || 'none',
      // Shadow
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
            ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
            : 'none',
      boxSizing: 'border-box',
    };

    const { styles: backgroundStyles } = computeBackgroundStyles({
      color: templateContainerBg || designProperties.background_color || moduleWithDesign.background_color,
      fallback: moduleWithDesign.background_color || 'inherit',
      image: this.getBackgroundImageCSS({ ...moduleWithDesign, ...designProperties }, hass),
      imageSize: designProperties.background_size || moduleWithDesign.background_size || 'cover',
      imagePosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      imageRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
    });
    Object.assign(containerStyles, backgroundStyles);

    // Get hover effect configuration from module design
    const hoverEffect = (moduleWithDesign as any).design?.hover_effect;
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    return this.wrapWithAnimation(html`
      <div
        class="text-module-container ${hoverEffectClass}"
        style="${designStyles}"
      >
        <div class="text-module-preview" style=${this.styleObjectToCss(textStyles)}>${element}</div>
      </div>
    `, module, hass);
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
    const textModule = module as TextModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow empty text - UI will show placeholder
    // Only validate for truly breaking errors

    // Validate icon format if provided (only if it has content)
    if (textModule.icon && textModule.icon.trim() !== '') {
      if (!textModule.icon.includes(':')) {
        errors.push('Icon must be in format "mdi:icon-name" or "hass:icon-name"');
      }
    }

    // Validate link format if provided (only if it has content)
    if (textModule.link && textModule.link.trim() !== '') {
      try {
        new URL(textModule.link);
      } catch {
        // If not a valid URL, check if it's a relative path
        if (!textModule.link.startsWith('/') && !textModule.link.startsWith('#')) {
          errors.push('Link must be a valid URL or start with "/" for relative paths');
        }
      }
    }

    // Validate global link actions (only truly critical action validation errors)
    if (
      textModule.tap_action &&
      textModule.tap_action.action !== 'default' &&
      textModule.tap_action.action !== 'nothing'
    ) {
      errors.push(...this.validateAction(textModule.tap_action));
    }
    if (
      textModule.hold_action &&
      textModule.hold_action.action !== 'default' &&
      textModule.hold_action.action !== 'nothing'
    ) {
      errors.push(...this.validateAction(textModule.hold_action));
    }
    if (
      textModule.double_tap_action &&
      textModule.double_tap_action.action !== 'default' &&
      textModule.double_tap_action.action !== 'nothing'
    ) {
      errors.push(...this.validateAction(textModule.double_tap_action));
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private hasActiveLink(textModule: TextModule): boolean {
    const hasLegacyLink = textModule.link && textModule.link.trim() !== '';
    const hasTapAction =
      textModule.tap_action &&
      textModule.tap_action.action !== 'default' &&
      textModule.tap_action.action !== 'nothing';
    const hasHoldAction =
      textModule.hold_action &&
      textModule.hold_action.action !== 'default' &&
      textModule.hold_action.action !== 'nothing';
    const hasDoubleAction =
      textModule.double_tap_action &&
      textModule.double_tap_action.action !== 'default' &&
      textModule.double_tap_action.action !== 'nothing';

    return !!(hasLegacyLink || hasTapAction || hasHoldAction || hasDoubleAction);
  }

  private validateAction(action: any): string[] {
    const errors: string[] = [];

    switch (action.action) {
      case 'more-info':
      case 'toggle':
        if (!action.entity) {
          errors.push(`Entity is required for ${action.action} action`);
        }
        break;
      case 'navigate':
        if (!action.navigation_path) {
          errors.push('Navigation path is required for navigate action');
        }
        break;
      case 'url':
        if (!action.url_path) {
          errors.push('URL path is required for url action');
        }
        break;
      case 'perform-action':
        if (!action.perform_action && !action.service) {
          errors.push('Action is required for perform-action');
        }
        break;
    }

    return errors;
  }

  private handleClick(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    event.preventDefault();

    // Clear any existing timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    // Set a timeout to handle single click with delay
    this.clickTimeout = setTimeout(() => {
      this.handleTapAction(event, textModule, hass, config);
    }, 300); // 300ms delay to allow for double-click detection
  }

  private handleDoubleClick(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    event.preventDefault();

    // Clear the single click timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    // Handle double-click action
    this.handleDoubleAction(event, textModule, hass, config);
  }

  private holdTimeout: any = null;
  private isHolding = false;

  private handleMouseDown(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.startHold(event, textModule, hass, config);
  }

  private handleMouseUp(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.endHold(event, textModule, hass);
  }

  private handleMouseLeave(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.endHold(event, textModule, hass);
  }

  private handleTouchStart(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.startHold(event, textModule, hass, config);
  }

  private handleTouchEnd(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    this.endHold(event, textModule, hass);
  }

  private startHold(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.isHolding = false;
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.handleHoldAction(event, textModule, hass, config);
    }, 500); // 500ms hold time
  }

  private endHold(event: Event, textModule: TextModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
    this.isHolding = false;
  }

  private handleTapAction(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    // Don't trigger tap action if we're in the middle of a hold
    if (this.isHolding) return;

    // Handle legacy link first (for backward compatibility)
    if (textModule.link && textModule.link.trim() !== '') {
      if (textModule.link.startsWith('http') || textModule.link.startsWith('https')) {
        window.open(textModule.link, '_blank');
      } else {
        window.location.href = textModule.link;
      }
      return;
    }

    // Handle global link action
    if (
      textModule.tap_action &&
      textModule.tap_action.action !== 'default' &&
      textModule.tap_action.action !== 'nothing'
    ) {
      UltraLinkComponent.handleAction(
        textModule.tap_action as any,
        hass,
        event.target as HTMLElement,
        config,
        (textModule as any).entity,
        textModule
      );
    }
  }

  private handleDoubleAction(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (
      textModule.double_tap_action &&
      textModule.double_tap_action.action !== 'default' &&
      textModule.double_tap_action.action !== 'nothing'
    ) {
      UltraLinkComponent.handleAction(
        textModule.double_tap_action as any,
        hass,
        event.target as HTMLElement,
        config,
        (textModule as any).entity,
        textModule
      );
    }
  }

  private handleHoldAction(
    event: Event,
    textModule: TextModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (
      textModule.hold_action &&
      textModule.hold_action.action !== 'default' &&
      textModule.hold_action.action !== 'nothing'
    ) {
      UltraLinkComponent.handleAction(
        textModule.hold_action as any,
        hass,
        event.target as HTMLElement,
        config,
        (textModule as any).entity,
        textModule
      );
    }
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .text-module-preview {
        min-height: 20px;
        word-wrap: break-word;
      }

      .rich-text-content p {
        margin: 0 0 0.4em 0;
      }

      .rich-text-content p:last-child {
        margin-bottom: 0;
      }

      .rich-text-content a {
        color: var(--primary-color);
        text-decoration: underline;
      }

      .rich-text-content mark {
        border-radius: 2px;
        padding: 0 2px;
      }
      
      .text-module-hidden {
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 4px;
      }
      
      /* Field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
 
        margin-bottom: 4px !important;
        display: block !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
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

      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
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

      /* Icon picker specific styling */
      ha-icon-picker {
        --ha-icon-picker-width: 100%;
        --ha-icon-picker-height: 56px;
      }

      /* Text field and select consistency */
      ha-textfield,
      ha-select {
        --mdc-shape-small: 8px;
        --mdc-theme-primary: var(--primary-color);
      }

      code {
        background: var(--secondary-background-color);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        color: var(--primary-color);
      }

      /* Unified template toggle */
      .template-header .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0;
      }
      .template-header .switch-label-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .template-header .switch-label {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .template-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-top: 8px;
        line-height: 1.5;
      }
      .template-header .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      .template-header .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .template-header .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--disabled-color);
        transition: 0.3s;
        border-radius: 24px;
      }
      .template-header .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }
      .template-header input:checked + .slider {
        background-color: var(--primary-color);
      }
      .template-header input:checked + .slider:before {
        transform: translateX(20px);
      }

      /* Clickable text hover styles */
      ${GlobalActionsTab.getHoverStyles()}
    `;
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    switch (imageType) {
      case 'upload':
        if (backgroundImage) {
          // For uploaded images, wrap in url() and get the full URL
          if (backgroundImage.startsWith('/api/image/serve/')) {
            // Use image upload utility to get full URL
            return `url("${this.getImageUrl(hass, backgroundImage)}")`;
          } else if (backgroundImage.startsWith('data:image/')) {
            // Data URL, use as-is
            return `url("${backgroundImage}")`;
          } else {
            // Other upload paths
            return `url("${backgroundImage}")`;
          }
        }
        break;

      case 'entity':
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            // Try entity_picture first, then other image attributes
            const imageUrl =
              entityState.attributes.entity_picture ||
              entityState.attributes.image ||
              entityState.state;
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              return `url("${imageUrl}")`;
            }
          }
        }
        break;

      case 'url':
        if (backgroundImage) {
          // Direct URL, wrap in url()
          return `url("${backgroundImage}")`;
        }
        break;

      default:
        // No background image or 'none' type
        return 'none';
    }

    return 'none';
  }

  private getImageUrl(hass: HomeAssistant, path: string): string {
    if (!path) return '';

    if (path.startsWith('http')) return path;
    if (path.startsWith('data:image/')) return path;

    if (path.includes('/api/image/serve/')) {
      const matches = path.match(/\/api\/image\/serve\/([^\/]+)/);
      if (matches && matches[1]) {
        const imageId = matches[1];
        try {
          const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
          return `${baseUrl.replace(/\/$/, '')}/api/image/serve/${imageId}/original`;
        } catch (e) {
          return path;
        }
      }
      return path;
    }

    // Handle relative URLs
    if (path.startsWith('/')) {
      const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
      return `${baseUrl.replace(/\/$/, '')}${path}`;
    }

    return path;
  }

  // Helper method to convert style object to CSS string
  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  // Helper method to convert camelCase to kebab-case
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
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

  /**
   * Returns the effective rich text HTML content for this module.
   * Handles backward-compatibility migration from the legacy plain `text` field:
   * if `rich_text_content` is empty but `text` exists, wraps it in a `<p>` tag.
   */
  private _getEffectiveRichContent(textModule: TextModule): string {
    if (textModule.rich_text_content && textModule.rich_text_content.trim() !== '') {
      return textModule.rich_text_content;
    }
    if (textModule.text && textModule.text.trim() !== '') {
      const escaped = textModule.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<p>${escaped}</p>`;
    }
    return '';
  }

  // Simple, stable string hash for template keys
  private _hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
