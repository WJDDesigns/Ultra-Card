import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TextInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import '../components/ultra-color-picker';

export class UltraTextInputModule extends BaseUltraModule {
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _localValue: string | null = null;
  private _localValueTimer: ReturnType<typeof setTimeout> | null = null;

  metadata: ModuleMetadata = {
    type: 'text_input',
    title: 'Text Input',
    description: 'Text input field linked to input_text helpers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:form-textbox',
    category: 'input',
    tags: ['text', 'input', 'form', 'helper', 'interactive'],
  };

  createDefault(id?: string, hass?: HomeAssistant): TextInputModule {
    return {
      id: id || this.generateId('text_input'),
      type: 'text_input',
      placeholder: 'Enter text...',
      input_appearance: 'outlined',
      show_clear_button: true,
      show_character_count: false,
      show_label: true,
      label: '',
      font_size: 16,
      text_color: 'var(--primary-text-color)',
      focus_color: 'var(--primary-color)',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getAppearanceOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      {
        value: 'outlined',
        label: localize('editor.text_input.appearance_options.outlined', lang, 'Outlined'),
      },
      {
        value: 'filled',
        label: localize('editor.text_input.appearance_options.filled', lang, 'Filled'),
      },
      {
        value: 'underlined',
        label: localize('editor.text_input.appearance_options.underlined', lang, 'Underlined'),
      },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const textInputModule = module as TextInputModule;
    const lang = hass?.locale?.language || 'en';

    const entityState = textInputModule.entity ? hass?.states?.[textInputModule.entity] : undefined;


    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity Configuration -->
        ${this.renderSettingsSection(
          localize('editor.text_input.entity.title', lang, 'Entity Configuration'),
          localize(
            'editor.text_input.entity.desc',
            lang,
            'Link to a Home Assistant input_text helper entity.'
          ),
          [
            {
              title: localize('editor.text_input.entity_field', lang, 'Entity'),
              description: localize(
                'editor.text_input.entity_field_desc',
                lang,
                'Select an input_text entity to bind this text field to.'
              ),
              hass,
              data: { entity: textInputModule.entity || '' },
              schema: [this.entityField('entity', ['input_text'])],
              onChange: (e: CustomEvent) => {
                updateModule(e.detail.value);
              },
            },
          ]
        )}

        <!-- Appearance Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.text_input.appearance.title', lang, 'Appearance')}
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.text_input.appearance.desc',
              lang,
              'Configure how the text input field looks.'
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.text_input.input_appearance', lang, 'Input Style'),
              localize(
                'editor.text_input.input_appearance_desc',
                lang,
                'Visual style of the input field'
              ),
              hass,
              { input_appearance: textInputModule.input_appearance || 'outlined' },
              [this.selectField('input_appearance', this.getAppearanceOptions(lang))],
              (e: CustomEvent) => {
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.text_input.placeholder', lang, 'Placeholder'),
            localize(
              'editor.text_input.placeholder_desc',
              lang,
              'Placeholder text shown when the field is empty'
            ),
            hass,
            { placeholder: textInputModule.placeholder || '' },
            [{ name: 'placeholder', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}

          ${this.renderFieldSection(
            localize('editor.text_input.label', lang, 'Label'),
            localize('editor.text_input.label_desc', lang, 'Label displayed above the input field'),
            hass,
            { label: textInputModule.label || '' },
            [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}

          ${this.renderFieldSection(
            localize('editor.text_input.show_label', lang, 'Show Label'),
            localize(
              'editor.text_input.show_label_desc',
              lang,
              'Display the label above the input'
            ),
            hass,
            { show_label: textInputModule.show_label !== false },
            [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            localize('editor.text_input.multiline', lang, 'Multiline'),
            localize(
              'editor.text_input.multiline_desc',
              lang,
              'Allow multiple lines of text (textarea)'
            ),
            hass,
            { multiline: textInputModule.multiline === true },
            [{ name: 'multiline', selector: { boolean: {} } }],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${textInputModule.multiline ? this.renderSliderField(
            localize('editor.text_input.rows', lang, 'Rows'),
            localize('editor.text_input.rows_desc', lang, 'Number of visible text rows'),
            textInputModule.rows ?? 4, 4, 2, 12, 1,
            (value: number) => { updateModule({ rows: value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          ) : ''}
        </div>

        <!-- Icons & Controls -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.text_input.controls.title', lang, 'Icons & Controls')}
          </div>

          ${this.renderFieldSection(
            localize('editor.text_input.prefix_icon', lang, 'Prefix Icon'),
            localize(
              'editor.text_input.prefix_icon_desc',
              lang,
              'Icon displayed at the start of the input field'
            ),
            hass,
            { prefix_icon: textInputModule.prefix_icon || '' },
            [{ name: 'prefix_icon', selector: { icon: {} } }],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            localize('editor.text_input.suffix_icon', lang, 'Suffix Icon'),
            localize(
              'editor.text_input.suffix_icon_desc',
              lang,
              'Icon displayed at the end of the input field'
            ),
            hass,
            { suffix_icon: textInputModule.suffix_icon || '' },
            [{ name: 'suffix_icon', selector: { icon: {} } }],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            localize('editor.text_input.show_clear_button', lang, 'Show Clear Button'),
            localize(
              'editor.text_input.show_clear_button_desc',
              lang,
              'Show a button to clear the input field'
            ),
            hass,
            { show_clear_button: textInputModule.show_clear_button !== false },
            [{ name: 'show_clear_button', selector: { boolean: {} } }],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            localize('editor.text_input.show_character_count', lang, 'Show Character Count'),
            localize(
              'editor.text_input.show_character_count_desc',
              lang,
              'Display a character counter below the input'
            ),
            hass,
            { show_character_count: textInputModule.show_character_count === true },
            [{ name: 'show_character_count', selector: { boolean: {} } }],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
        </div>

        <!-- Styling -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.text_input.styling.title', lang, 'Styling')}
          </div>

          ${this.renderSliderField(
            localize('editor.text_input.font_size', lang, 'Font Size'),
            localize('editor.text_input.font_size_desc', lang, 'Font size of the input text in pixels'),
            textInputModule.font_size ?? 16,
            16,
            10,
            32,
            1,
            (value: number) => updateModule({ font_size: value }),
            'px'
          )}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.text_input.text_color', lang, 'Text Color')}
              .value=${textInputModule.text_color || 'var(--primary-text-color)'}
              @color-changed=${(e: CustomEvent) => {
                updateModule({ text_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.text_input.focus_color', lang, 'Focus/Accent Color')}
              .value=${textInputModule.focus_color || 'var(--primary-color)'}
              @color-changed=${(e: CustomEvent) => {
                updateModule({ focus_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module, hass, updates => updateModule(updates));
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updates => updateModule(updates));
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const textInputModule = module as TextInputModule;

    if (!textInputModule.entity || !textInputModule.entity.trim()) {
      return this.renderGradientErrorState(
        'Configure Entity',
        'Select an input_text entity in the General tab',
        'mdi:form-textbox'
      );
    }

    const entityState = hass?.states?.[textInputModule.entity];
    if (!entityState) {
      return this.renderGradientErrorState(
        'Entity Not Found',
        `Entity "${textInputModule.entity}" is not available`,
        'mdi:alert-circle-outline'
      );
    }

    const currentValue = this._localValue !== null ? this._localValue : (entityState.state || '');
    const entityMaxLength = entityState.attributes?.max;
    const entityMode = entityState.attributes?.mode || 'text';

    const designProperties = (textInputModule as any).design || {};
    const appearance = textInputModule.input_appearance || 'outlined';
    const fontSize = textInputModule.font_size ?? 16;
    const textColor = textInputModule.text_color || 'var(--primary-text-color)';
    const focusColor = textInputModule.focus_color || 'var(--primary-color)';
    const placeholder = textInputModule.placeholder || '';
    const showClear = textInputModule.show_clear_button !== false;
    const showCharCount = textInputModule.show_character_count === true;
    const showLabel = textInputModule.show_label !== false && !!textInputModule.label;
    const label = textInputModule.label || '';

    const containerStyles = {
      width: '100%',
      height: 'auto',
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right
          ? `${designProperties.padding_top || '0px'} ${designProperties.padding_right || '0px'} ${designProperties.padding_bottom || '0px'} ${designProperties.padding_left || '0px'}`
          : '0',
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right
          ? `${designProperties.margin_top || '8px'} ${designProperties.margin_right || '0px'} ${designProperties.margin_bottom || '8px'} ${designProperties.margin_left || '0px'}`
          : '8px 0',
      background: designProperties.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCss(
        { ...textInputModule, ...designProperties },
        hass
      ),
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
      'border-radius': designProperties.border_radius || '0',
      border:
        designProperties.border_style && designProperties.border_style !== 'none'
          ? `${designProperties.border_width || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`
          : 'none',
      'box-shadow':
        designProperties.box_shadow_h ||
        designProperties.box_shadow_v ||
        designProperties.box_shadow_blur ||
        designProperties.box_shadow_spread
          ? `${designProperties.box_shadow_h || '0px'} ${designProperties.box_shadow_v || '0px'} ${designProperties.box_shadow_blur || '0px'} ${designProperties.box_shadow_spread || '0px'} ${designProperties.box_shadow_color || 'rgba(0,0,0,.2)'}`
          : 'none',
      'box-sizing': 'border-box',
    } as Record<string, string>;

    const hoverEffect = designProperties.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    const isMultiline = textInputModule.multiline === true;
    const rows = textInputModule.rows ?? 4;
    const inputType = entityMode === 'password' ? 'password' : 'text';

    const handleInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const newValue = input.value;

      this._localValue = newValue;
      if (this._localValueTimer) clearTimeout(this._localValueTimer);
      if (this._debounceTimer) clearTimeout(this._debounceTimer);

      this._debounceTimer = setTimeout(() => {
        this.setEntityValue(textInputModule.entity!, newValue, hass);
        this._localValueTimer = setTimeout(() => { this._localValue = null; }, 1000);
      }, 300);
    };

    const handleClear = (e: Event) => {
      e.stopPropagation();
      if (this._debounceTimer) { clearTimeout(this._debounceTimer); this._debounceTimer = null; }
      if (this._localValueTimer) clearTimeout(this._localValueTimer);
      this._localValue = '';
      this.setEntityValue(textInputModule.entity!, '', hass);
      this._localValueTimer = setTimeout(() => { this._localValue = null; }, 1000);
    };

    let appearanceBorder = '';
    let appearanceBg = '';
    let appearanceExtra = '';

    switch (appearance) {
      case 'filled':
        appearanceBg = 'var(--input-fill-color, rgba(var(--rgb-primary-text-color, 0,0,0), 0.05))';
        appearanceBorder = 'none';
        appearanceExtra = `border-bottom: 2px solid var(--divider-color);`;
        break;
      case 'underlined':
        appearanceBg = 'transparent';
        appearanceBorder = 'none';
        appearanceExtra = `border-bottom: 2px solid var(--divider-color); border-radius: 0 !important;`;
        break;
      case 'outlined':
      default:
        appearanceBg = 'transparent';
        appearanceBorder = '1px solid var(--divider-color)';
        appearanceExtra = '';
        break;
    }

    const moduleId = textInputModule.id;

    return html`
      <style>
        .text-input-wrapper-${moduleId} {
          position: relative;
          display: flex;
          align-items: ${isMultiline ? 'flex-start' : 'center'};
          background: ${appearanceBg};
          border: ${appearanceBorder};
          border-radius: 8px;
          ${appearanceExtra}
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden;
        }
        .text-input-wrapper-${moduleId}:focus-within {
          border-color: ${focusColor};
          ${appearance === 'outlined' ? `box-shadow: 0 0 0 1px ${focusColor};` : ''}
          ${appearance === 'underlined' || appearance === 'filled' ? `border-bottom-color: ${focusColor};` : ''}
        }
        .text-input-field-${moduleId} {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 12px;
          font-size: ${fontSize}px;
          color: ${textColor};
          font-family: inherit;
          min-width: 0;
        }
        .text-input-field-${moduleId}::placeholder {
          color: var(--secondary-text-color);
          opacity: 0.6;
        }
        textarea.text-input-field-${moduleId} {
          resize: vertical;
          line-height: 1.5;
        }
        .text-input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          color: var(--secondary-text-color);
          flex-shrink: 0;
          --mdc-icon-size: 20px;
        }
        .text-input-clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          cursor: pointer;
          color: var(--secondary-text-color);
          opacity: 0.6;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
          background: none;
          border: none;
          --mdc-icon-size: 18px;
        }
        .text-input-clear-btn:hover {
          opacity: 1;
        }
        .text-input-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-bottom: 6px;
          padding-left: 2px;
        }
        .text-input-char-count {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 4px;
          text-align: right;
          padding-right: 4px;
          opacity: 0.7;
        }
      </style>
      <div
        class="text-input-module-container ${hoverEffectClass}"
        style=${this.styleObjectToCss(containerStyles)}
      >
        ${showLabel
          ? html`<div class="text-input-label">${label}</div>`
          : ''}
        <div class="text-input-wrapper-${moduleId}">
          ${textInputModule.prefix_icon
            ? html`<div class="text-input-icon" style="${isMultiline ? 'padding-top: 12px;' : ''}">
                <ha-icon icon="${textInputModule.prefix_icon}"></ha-icon>
              </div>`
            : ''}
          ${isMultiline
            ? html`<textarea
                class="text-input-field-${moduleId}"
                rows=${rows}
                .value=${currentValue}
                placeholder="${placeholder}"
                @input=${handleInput}
              ></textarea>`
            : html`<input
                class="text-input-field-${moduleId}"
                type="${inputType}"
                .value=${currentValue}
                placeholder="${placeholder}"
                @input=${handleInput}
              />`}
          ${showClear && currentValue
            ? html`<button class="text-input-clear-btn" style="${isMultiline ? 'padding-top: 10px; align-self: flex-start;' : ''}" @click=${handleClear}>
                <ha-icon icon="mdi:close-circle"></ha-icon>
              </button>`
            : ''}
          ${textInputModule.suffix_icon
            ? html`<div class="text-input-icon" style="${isMultiline ? 'padding-top: 12px;' : ''}">
                <ha-icon icon="${textInputModule.suffix_icon}"></ha-icon>
              </div>`
            : ''}
        </div>
        ${showCharCount
          ? html`<div class="text-input-char-count">
              ${currentValue.length}${entityMaxLength ? ` / ${entityMaxLength}` : ''}
            </div>`
          : ''}
      </div>
    `;
  }

  private async setEntityValue(
    entity: string,
    value: string,
    hass: HomeAssistant
  ): Promise<void> {
    if (!entity || !hass) return;

    try {
      await hass.callService('input_text', 'set_value', {
        entity_id: entity,
        value: value,
      });
    } catch (error) {
      console.error(`[TextInput] Failed to set value for ${entity}:`, error);
    }
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }
}
