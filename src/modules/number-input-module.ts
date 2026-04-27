import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, NumberInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

export class UltraNumberInputModule extends BaseUltraModule {
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _localValue: number | null = null;
  private _localValueTimer: ReturnType<typeof setTimeout> | null = null;

  metadata: ModuleMetadata = {
    type: 'number_input',
    title: 'Number Input',
    description: 'Number input field linked to input_number helpers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:numeric',
    category: 'input',
    tags: ['number', 'input', 'form', 'helper', 'interactive', 'stepper'],
  };

  createDefault(id?: string, hass?: HomeAssistant): NumberInputModule {
    return {
      id: id || this.generateId('number_input'),
      type: 'number_input',
      input_appearance: 'outlined',
      show_label: true,
      label: '',
      show_stepper: true,
      show_unit: true,
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
      { value: 'outlined', label: localize('editor.number_input.appearance_options.outlined', lang, 'Outlined') },
      { value: 'filled', label: localize('editor.number_input.appearance_options.filled', lang, 'Filled') },
      { value: 'underlined', label: localize('editor.number_input.appearance_options.underlined', lang, 'Underlined') },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const numModule = module as NumberInputModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.number_input.entity.title', lang, 'Entity Configuration'),
          localize('editor.number_input.entity.desc', lang, 'Link to a Home Assistant Input Number helper entity.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', numModule.entity || '',
            (value: string) => { updateModule({ entity: value }); this.triggerPreviewUpdate(); },
            ['input_number', 'number'],
            localize('editor.number_input.entity_field', lang, 'Entity')
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.number_input.appearance.title', lang, 'Appearance')}
          </div>
          <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;">
            ${localize('editor.number_input.appearance.desc', lang, 'Configure how the number input field looks.')}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.number_input.input_appearance', lang, 'Input Style'),
              localize('editor.number_input.input_appearance_desc', lang, 'Visual style of the input field'),
              hass,
              { input_appearance: numModule.input_appearance || 'outlined' },
              [this.selectField('input_appearance', this.getAppearanceOptions(lang))],
              (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.number_input.label', lang, 'Label'),
            localize('editor.number_input.label_desc', lang, 'Label displayed above the input field'),
            hass,
            { label: numModule.label || '' },
            [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}

          ${this.renderFieldSection(
            localize('editor.number_input.show_label', lang, 'Show Label'),
            localize('editor.number_input.show_label_desc', lang, 'Display the label above the input'),
            hass,
            { show_label: numModule.show_label !== false },
            [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.number_input.controls.title', lang, 'Controls')}
          </div>

          ${this.renderFieldSection(
            localize('editor.number_input.show_stepper', lang, 'Show +/- Buttons'),
            localize('editor.number_input.show_stepper_desc', lang, 'Display increment/decrement stepper buttons'),
            hass,
            { show_stepper: numModule.show_stepper !== false },
            [{ name: 'show_stepper', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}

          ${this.renderFieldSection(
            localize('editor.number_input.show_unit', lang, 'Show Unit'),
            localize('editor.number_input.show_unit_desc', lang, 'Display the unit of measurement'),
            hass,
            { show_unit: numModule.show_unit !== false },
            [{ name: 'show_unit', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.number_input.styling.title', lang, 'Styling')}</div>

          ${this.renderSliderField(
            localize('editor.number_input.font_size', lang, 'Font Size'),
            localize('editor.number_input.font_size_desc', lang, 'Font size of the input text in pixels'),
            numModule.font_size ?? 16, 16, 10, 32, 1,
            (value: number) => updateModule({ font_size: value }), 'px'
          )}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.number_input.text_color', lang, 'Text Color')}
              .value=${numModule.text_color || 'var(--primary-text-color)'}
              @color-changed=${(e: CustomEvent) => updateModule({ text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.number_input.focus_color', lang, 'Focus/Accent Color')}
              .value=${numModule.focus_color || 'var(--primary-color)'}
              @color-changed=${(e: CustomEvent) => updateModule({ focus_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  override renderActionsTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updates => updateModule(updates));
  }

  getStyles(): string {
    return `${BaseUltraModule.getSliderStyles()}`;
  }

  renderPreview(
    module: CardModule, hass: HomeAssistant,
    config?: UltraCardConfig, previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const numModule = module as NumberInputModule;
    const lang = hass?.locale?.language || 'en';

    if (!numModule.entity?.trim()) {
      return this.renderGradientErrorState(localize('editor.common.error_configure_entity', lang, 'Configure Entity'), localize('editor.number_input.error_configure_entity_desc', lang, 'Select an Input Number entity in the General tab'), 'mdi:numeric');
    }

    const entityState = hass?.states?.[numModule.entity];
    if (!entityState) {
      return this.renderGradientErrorState(localize('editor.common.error_entity_not_found', lang, 'Entity Not Found'), `Entity "${numModule.entity}" is not available`, 'mdi:alert-circle-outline');
    }

    const rawValue = this._localValue !== null ? this._localValue : parseFloat(entityState.state) || 0;
    const min = entityState.attributes?.min ?? 0;
    const max = entityState.attributes?.max ?? 100;
    const step = entityState.attributes?.step ?? 1;
    const unit = entityState.attributes?.unit_of_measurement || '';

    const designProperties = (numModule as any).design || {};
    const appearance = numModule.input_appearance || 'outlined';
    const fontSize = numModule.font_size ?? 16;
    const textColor = numModule.text_color || 'var(--primary-text-color)';
    const focusColor = numModule.focus_color || 'var(--primary-color)';
    const showStepper = numModule.show_stepper !== false;
    const showUnit = numModule.show_unit !== false && !!unit;
    const showLabel = numModule.show_label !== false && !!numModule.label;

    const containerStyles = this.buildContainerStyles(designProperties);
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    const setVal = (v: number) => {
      const clamped = Math.min(max, Math.max(min, parseFloat(v.toFixed(10))));
      this._localValue = clamped;
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      if (this._localValueTimer) clearTimeout(this._localValueTimer);
      this._debounceTimer = setTimeout(() => {
        this.callEntityService(numModule.entity!, clamped, hass);
        this._localValueTimer = setTimeout(() => { this._localValue = null; }, 1000);
      }, 300);
    };

    const handleInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const v = parseFloat(input.value);
      if (!isNaN(v)) setVal(v);
    };

    let borderCss = '1px solid var(--divider-color)';
    let bgCss = 'transparent';
    let extraCss = '';
    if (appearance === 'filled') {
      bgCss = 'var(--input-fill-color, rgba(var(--rgb-primary-text-color, 0,0,0), 0.05))';
      borderCss = 'none'; extraCss = 'border-bottom: 2px solid var(--divider-color);';
    } else if (appearance === 'underlined') {
      bgCss = 'transparent'; borderCss = 'none';
      extraCss = 'border-bottom: 2px solid var(--divider-color); border-radius: 0 !important;';
    }

    const mid = numModule.id;

    return this.wrapWithAnimation(html`
      <style>
        .num-wrap-${mid} {
          display: flex; align-items: center; background: ${bgCss};
          border: ${borderCss}; border-radius: 8px; ${extraCss}
          transition: border-color .2s, box-shadow .2s; overflow: hidden;
        }
        .num-wrap-${mid}:focus-within {
          border-color: ${focusColor};
          ${appearance === 'outlined' ? `box-shadow: 0 0 0 1px ${focusColor};` : ''}
          ${appearance !== 'outlined' ? `border-bottom-color: ${focusColor};` : ''}
        }
        .num-field-${mid} {
          flex: 1; border: none; outline: none; background: transparent;
          padding: 12px; font-size: ${fontSize}px; color: ${textColor};
          font-family: inherit; min-width: 0; text-align: center;
          -moz-appearance: textfield;
        }
        .num-field-${mid}::-webkit-inner-spin-button,
        .num-field-${mid}::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .num-step-btn {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 100%; min-height: 44px; cursor: pointer;
          color: var(--primary-text-color); background: transparent;
          border: none; flex-shrink: 0; transition: background .15s;
          --mdc-icon-size: 20px;
        }
        .num-step-btn:hover { background: rgba(var(--rgb-primary-text-color, 0,0,0), .06); }
        .num-step-btn:active { background: rgba(var(--rgb-primary-text-color, 0,0,0), .12); }
        .num-unit { font-size: ${Math.max(12, fontSize - 2)}px; color: var(--secondary-text-color);
          padding-right: 12px; flex-shrink: 0; }
        .num-label { font-size: 12px; font-weight: 500; color: var(--secondary-text-color);
          margin-bottom: 6px; padding-left: 2px; }
      </style>
      <div class="number-input-container ${hoverEffectClass}" style="${designStyles}">
        ${showLabel ? html`<div class="num-label">${numModule.label}</div>` : ''}
        <div class="num-wrap-${mid}">
          ${showStepper ? html`
            <button class="num-step-btn" @click=${() => setVal(rawValue - step)}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </button>` : ''}
          <input class="num-field-${mid}" type="number"
            .value=${String(rawValue)} min=${min} max=${max} step=${step}
            @input=${handleInput} />
          ${showUnit ? html`<span class="num-unit">${unit}</span>` : ''}
          ${showStepper ? html`
            <button class="num-step-btn" @click=${() => setVal(rawValue + step)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>` : ''}
        </div>
      </div>
    `, module, hass);
  }

  private async callEntityService(entity: string, value: number, hass: HomeAssistant): Promise<void> {
    if (!entity || !hass) return;
    const domain = entity.split('.')[0];
    try {
      await hass.callService(domain, 'set_value', { entity_id: entity, value });
    } catch (error) {
      console.error(`[NumberInput] Failed to set value for ${entity}:`, error);
    }
  }

  private buildContainerStyles(dp: any): Record<string, string> {
    return {
      width: '100%', height: 'auto',
      padding: dp.padding_top || dp.padding_bottom || dp.padding_left || dp.padding_right
        ? `${dp.padding_top || '0px'} ${dp.padding_right || '0px'} ${dp.padding_bottom || '0px'} ${dp.padding_left || '0px'}` : '0',
      margin: dp.margin_top || dp.margin_bottom || dp.margin_left || dp.margin_right
        ? `${dp.margin_top || '0px'} ${dp.margin_right || '0px'} ${dp.margin_bottom || '0px'} ${dp.margin_left || '0px'}` : '0',
      background: dp.background_color || 'transparent',
      'border-radius': dp.border_radius || '0',
      border: dp.border_style && dp.border_style !== 'none'
        ? `${dp.border_width || '1px'} ${dp.border_style} ${dp.border_color || 'var(--divider-color)'}` : 'none',
      'box-sizing': 'border-box',
    };
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ');
  }
}
