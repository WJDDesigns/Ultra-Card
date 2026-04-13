import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, SliderInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

export class UltraSliderInputModule extends BaseUltraModule {
  private _localValue: number | null = null;
  private _localValueTimer: ReturnType<typeof setTimeout> | null = null;
  private _isDragging = false;

  metadata: ModuleMetadata = {
    type: 'slider_input',
    title: 'Slider Input',
    description: 'Range slider linked to input_number helpers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:tune-variant',
    category: 'input',
    tags: ['slider', 'range', 'number', 'input', 'form', 'helper', 'interactive'],
  };

  createDefault(id?: string, hass?: HomeAssistant): SliderInputModule {
    return {
      id: id || this.generateId('slider_input'),
      type: 'slider_input',
      show_label: true,
      label: '',
      show_value: true,
      show_min_max: false,
      show_unit: true,
      slider_height: 8,
      slider_color: 'var(--primary-color)',
      track_color: 'var(--divider-color)',
      thumb_size: 20,
      font_size: 14,
      text_color: 'var(--primary-text-color)',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sliderMod = module as SliderInputModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.slider_input.entity.title', lang, 'Entity Configuration'),
          localize('editor.slider_input.entity.desc', lang, 'Link to a Home Assistant Input Number helper entity.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', sliderMod.entity || '',
            (value: string) => { updateModule({ entity: value }); this.triggerPreviewUpdate(); },
            ['input_number', 'number'],
            localize('editor.slider_input.entity_field', lang, 'Entity')
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.slider_input.display.title', lang, 'Display')}</div>
          <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;">
            ${localize('editor.slider_input.display.desc', lang, 'Configure what information to show with the slider.')}
          </div>

          ${this.renderFieldSection(
            localize('editor.slider_input.label', lang, 'Label'),
            localize('editor.slider_input.label_desc', lang, 'Label displayed above the slider'),
            hass, { label: sliderMod.label || '' },
            [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}

          ${this.renderFieldSection(
            localize('editor.slider_input.show_label', lang, 'Show Label'),
            localize('editor.slider_input.show_label_desc', lang, 'Display the label'),
            hass, { show_label: sliderMod.show_label !== false },
            [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}

          ${this.renderFieldSection(
            localize('editor.slider_input.show_value', lang, 'Show Value'),
            localize('editor.slider_input.show_value_desc', lang, 'Display the current numeric value'),
            hass, { show_value: sliderMod.show_value !== false },
            [{ name: 'show_value', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}

          ${this.renderFieldSection(
            localize('editor.slider_input.show_min_max', lang, 'Show Min/Max'),
            localize('editor.slider_input.show_min_max_desc', lang, 'Display min and max values at the ends'),
            hass, { show_min_max: sliderMod.show_min_max === true },
            [{ name: 'show_min_max', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}

          ${this.renderFieldSection(
            localize('editor.slider_input.show_unit', lang, 'Show Unit'),
            localize('editor.slider_input.show_unit_desc', lang, 'Display the unit of measurement'),
            hass, { show_unit: sliderMod.show_unit !== false },
            [{ name: 'show_unit', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.slider_input.styling.title', lang, 'Styling')}</div>

          ${this.renderSliderField(
            localize('editor.slider_input.slider_height', lang, 'Track Height'),
            localize('editor.slider_input.slider_height_desc', lang, 'Height of the slider track in pixels'),
            sliderMod.slider_height ?? 8, 8, 2, 24, 1,
            (v: number) => { updateModule({ slider_height: v }); setTimeout(() => this.triggerPreviewUpdate(), 50); }, 'px'
          )}

          ${this.renderSliderField(
            localize('editor.slider_input.thumb_size', lang, 'Thumb Size'),
            localize('editor.slider_input.thumb_size_desc', lang, 'Size of the slider thumb in pixels'),
            sliderMod.thumb_size ?? 20, 20, 12, 36, 1,
            (v: number) => { updateModule({ thumb_size: v }); setTimeout(() => this.triggerPreviewUpdate(), 50); }, 'px'
          )}

          ${this.renderSliderField(
            localize('editor.slider_input.font_size', lang, 'Font Size'),
            localize('editor.slider_input.font_size_desc', lang, 'Font size of labels and value'),
            sliderMod.font_size ?? 14, 14, 10, 28, 1,
            (v: number) => updateModule({ font_size: v }), 'px'
          )}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.slider_input.slider_color', lang, 'Slider Color')}
              .value=${sliderMod.slider_color || 'var(--primary-color)'}
              @color-changed=${(e: CustomEvent) => { updateModule({ slider_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.slider_input.track_color', lang, 'Track Color')}
              .value=${sliderMod.track_color || 'var(--divider-color)'}
              @color-changed=${(e: CustomEvent) => { updateModule({ track_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.slider_input.text_color', lang, 'Text Color')}
              .value=${sliderMod.text_color || 'var(--primary-text-color)'}
              @color-changed=${(e: CustomEvent) => updateModule({ text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module, hass, updates => updateModule(updates));
  }

  renderOtherTab(
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
    const sliderMod = module as SliderInputModule;
    const lang = hass?.locale?.language || 'en';

    if (!sliderMod.entity?.trim()) {
      return this.renderGradientErrorState(localize('editor.common.error_configure_entity', lang, 'Configure Entity'), localize('editor.slider_input.error_configure_entity_desc', lang, 'Select an Input Number entity in the General tab'), 'mdi:tune-variant');
    }

    const entityState = hass?.states?.[sliderMod.entity];
    if (!entityState) {
      return this.renderGradientErrorState(localize('editor.common.error_entity_not_found', lang, 'Entity Not Found'), `Entity "${sliderMod.entity}" is not available`, 'mdi:alert-circle-outline');
    }

    const currentValue = this._localValue !== null ? this._localValue : parseFloat(entityState.state) || 0;
    const min = entityState.attributes?.min ?? 0;
    const max = entityState.attributes?.max ?? 100;
    const step = entityState.attributes?.step ?? 1;
    const unit = entityState.attributes?.unit_of_measurement || '';

    const designProperties = (sliderMod as any).design || {};
    const fontSize = sliderMod.font_size ?? 14;
    const textColor = sliderMod.text_color || 'var(--primary-text-color)';
    const sliderColor = sliderMod.slider_color || 'var(--primary-color)';
    const trackColor = sliderMod.track_color || 'var(--divider-color)';
    const sliderHeight = sliderMod.slider_height ?? 8;
    const thumbSize = sliderMod.thumb_size ?? 20;
    const showLabel = sliderMod.show_label !== false && !!sliderMod.label;
    const showValue = sliderMod.show_value !== false;
    const showMinMax = sliderMod.show_min_max === true;
    const showUnit = sliderMod.show_unit !== false && !!unit;
    const pct = max > min ? ((currentValue - min) / (max - min)) * 100 : 0;

    const containerStyles = this.buildContainerStyles(designProperties);
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    const handleSliderInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const v = parseFloat(input.value);
      if (isNaN(v)) return;
      this._localValue = v;
      this._isDragging = true;
    };

    const handleSliderChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const v = parseFloat(input.value);
      if (isNaN(v)) return;
      this._isDragging = false;
      this._localValue = v;
      if (this._localValueTimer) clearTimeout(this._localValueTimer);
      this.callEntityService(sliderMod.entity!, v, hass);
      this._localValueTimer = setTimeout(() => { this._localValue = null; }, 1000);
    };

    const displayValue = Number.isInteger(step) ? currentValue.toFixed(0) : currentValue.toFixed(1);
    const mid = sliderMod.id;

    return this.wrapWithAnimation(html`
      <style>
        .si-container-${mid} { width: 100%; }
        .si-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .si-label { font-size: ${fontSize}px; font-weight: 500; color: ${textColor}; }
        .si-value { font-size: ${fontSize}px; font-weight: 600; color: ${textColor}; }
        .si-track-wrap { position: relative; width: 100%; height: ${Math.max(thumbSize, sliderHeight + 8)}px;
          display: flex; align-items: center; }
        .si-range-${mid} {
          -webkit-appearance: none; appearance: none; width: 100%; height: ${sliderHeight}px;
          background: linear-gradient(to right, ${sliderColor} ${pct}%, ${trackColor} ${pct}%);
          border-radius: ${sliderHeight / 2}px; outline: none; cursor: pointer; margin: 0;
        }
        .si-range-${mid}::-webkit-slider-thumb {
          -webkit-appearance: none; width: ${thumbSize}px; height: ${thumbSize}px;
          border-radius: 50%; background: ${sliderColor}; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,.3); border: 2px solid white;
          transition: transform .15s ease;
        }
        .si-range-${mid}::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .si-range-${mid}::-moz-range-thumb {
          width: ${thumbSize}px; height: ${thumbSize}px; border-radius: 50%;
          background: ${sliderColor}; cursor: pointer; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,.3);
        }
        .si-range-${mid}::-moz-range-track {
          height: ${sliderHeight}px; background: ${trackColor};
          border-radius: ${sliderHeight / 2}px; border: none;
        }
        .si-range-${mid}::-moz-range-progress {
          height: ${sliderHeight}px; background: ${sliderColor};
          border-radius: ${sliderHeight / 2}px;
        }
        .si-minmax { display: flex; justify-content: space-between; margin-top: 4px;
          font-size: ${Math.max(10, fontSize - 2)}px; color: var(--secondary-text-color); opacity: .7; }
      </style>
      <div class="si-container-${mid} ${hoverEffectClass}" style="${designStyles}">
        ${showLabel || showValue ? html`
          <div class="si-header">
            ${showLabel ? html`<span class="si-label">${sliderMod.label}</span>` : html`<span></span>`}
            ${showValue ? html`<span class="si-value">${displayValue}${showUnit ? ` ${unit}` : ''}</span>` : ''}
          </div>
        ` : ''}
        <div class="si-track-wrap">
          <input class="si-range-${mid}" type="range"
            min=${min} max=${max} step=${step} .value=${String(currentValue)}
            @input=${handleSliderInput} @change=${handleSliderChange} />
        </div>
        ${showMinMax ? html`
          <div class="si-minmax">
            <span>${min}${showUnit ? ` ${unit}` : ''}</span>
            <span>${max}${showUnit ? ` ${unit}` : ''}</span>
          </div>
        ` : ''}
      </div>
    `, module, hass);
  }

  private async callEntityService(entity: string, value: number, hass: HomeAssistant): Promise<void> {
    if (!entity || !hass) return;
    const domain = entity.split('.')[0];
    try {
      await hass.callService(domain, 'set_value', { entity_id: entity, value });
    } catch (error) {
      console.error(`[SliderInput] Failed to set value for ${entity}:`, error);
    }
  }

  private buildContainerStyles(dp: any): Record<string, string> {
    return {
      width: '100%', height: 'auto',
      padding: dp.padding_top || dp.padding_bottom || dp.padding_left || dp.padding_right
        ? `${dp.padding_top || '0px'} ${dp.padding_right || '0px'} ${dp.padding_bottom || '0px'} ${dp.padding_left || '0px'}` : '4px 0',
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
