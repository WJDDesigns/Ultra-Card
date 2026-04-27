import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, CounterInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

export class UltraCounterInputModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'counter_input',
    title: 'Counter Input',
    description: 'Counter with increment, decrement, and reset linked to counter helpers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:counter',
    category: 'input',
    tags: ['counter', 'increment', 'decrement', 'input', 'form', 'helper', 'interactive'],
  };

  createDefault(id?: string, hass?: HomeAssistant): CounterInputModule {
    return {
      id: id || this.generateId('counter_input'),
      type: 'counter_input',
      show_label: true,
      label: '',
      show_reset: true,
      counter_style: 'inline',
      font_size: 24,
      text_color: 'var(--primary-text-color)',
      button_color: 'var(--primary-color)',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getCounterStyleOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'inline', label: localize('editor.counter_input.style_options.inline', lang, 'Inline (- value +)') },
      { value: 'stacked', label: localize('editor.counter_input.style_options.stacked', lang, 'Stacked (buttons below)') },
      { value: 'compact', label: localize('editor.counter_input.style_options.compact', lang, 'Compact (small)') },
    ];
  }

  renderGeneralTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const cntMod = module as CounterInputModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.counter_input.entity.title', lang, 'Entity Configuration'),
          localize('editor.counter_input.entity.desc', lang, 'Link to a Home Assistant counter helper entity.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', cntMod.entity || '',
            (value: string) => { updateModule({ entity: value }); this.triggerPreviewUpdate(); },
            ['counter'],
            localize('editor.counter_input.entity_field', lang, 'Entity')
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.counter_input.appearance.title', lang, 'Appearance')}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${localize('editor.counter_input.appearance.desc', lang, 'Configure layout and display options.')}
          </div>

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection(
              localize('editor.counter_input.counter_style', lang, 'Layout Style'),
              localize('editor.counter_input.counter_style_desc', lang, 'How the counter and buttons are arranged'),
              hass, { counter_style: cntMod.counter_style || 'inline' },
              [this.selectField('counter_style', this.getCounterStyleOptions(lang))],
              (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.counter_input.label', lang, 'Label'), localize('editor.counter_input.label_desc', lang, 'Label displayed above the counter'),
            hass, { label: cntMod.label || '' }, [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          ${this.renderFieldSection(
            localize('editor.counter_input.show_label', lang, 'Show Label'), localize('editor.counter_input.show_label_desc', lang, 'Display the label'),
            hass, { show_label: cntMod.show_label !== false }, [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
          ${this.renderFieldSection(
            localize('editor.counter_input.show_reset', lang, 'Show Reset Button'),
            localize('editor.counter_input.show_reset_desc', lang, 'Display a reset button'),
            hass, { show_reset: cntMod.show_reset !== false }, [{ name: 'show_reset', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.counter_input.styling.title', lang, 'Styling')}</div>
          ${this.renderSliderField(
            localize('editor.counter_input.font_size', lang, 'Value Font Size'), localize('editor.counter_input.font_size_desc', lang, 'Font size of the counter value'),
            cntMod.font_size ?? 24, 24, 14, 48, 1, (v: number) => updateModule({ font_size: v }), 'px'
          )}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.counter_input.button_color', lang, 'Button Color')}
              .value=${cntMod.button_color || 'var(--primary-color)'}
              @color-changed=${(e: CustomEvent) => { updateModule({ button_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.counter_input.text_color', lang, 'Text Color')}
              .value=${cntMod.text_color || 'var(--primary-text-color)'}
              @color-changed=${(e: CustomEvent) => updateModule({ text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  override renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult {
    return GlobalActionsTab.render(module, hass, u => updateModule(u));
  }
  override renderOtherTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult {
    return GlobalLogicTab.render(module, hass, u => updateModule(u));
  }
  getStyles(): string { return BaseUltraModule.getSliderStyles(); }

  renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult {
    const cntMod = module as CounterInputModule;
    const lang = hass?.locale?.language || 'en';

    if (!cntMod.entity?.trim()) {
      return this.renderGradientErrorState(localize('editor.common.error_configure_entity', lang, 'Configure Entity'), localize('editor.counter_input.error_configure_entity_desc', lang, 'Select a counter entity in the General tab'), 'mdi:counter');
    }
    const entityState = hass?.states?.[cntMod.entity];
    if (!entityState) {
      return this.renderGradientErrorState(localize('editor.common.error_entity_not_found', lang, 'Entity Not Found'), `Entity "${cntMod.entity}" is not available`, 'mdi:alert-circle-outline');
    }

    const currentValue = parseInt(entityState.state, 10) || 0;
    const step = entityState.attributes?.step ?? 1;
    const designProperties = (cntMod as any).design || {};
    const fontSize = cntMod.font_size ?? 24;
    const textColor = cntMod.text_color || 'var(--primary-text-color)';
    const buttonColor = cntMod.button_color || 'var(--primary-color)';
    const layout = cntMod.counter_style || 'inline';
    const showLabel = cntMod.show_label !== false && !!cntMod.label;
    const showReset = cntMod.show_reset !== false;
    const containerStyles = this._buildContainerStyles(designProperties);
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const mid = cntMod.id;

    const increment = () => { if (cntMod.entity && hass) hass.callService('counter', 'increment', { entity_id: cntMod.entity }); };
    const decrement = () => { if (cntMod.entity && hass) hass.callService('counter', 'decrement', { entity_id: cntMod.entity }); };
    const reset = () => { if (cntMod.entity && hass) hass.callService('counter', 'reset', { entity_id: cntMod.entity }); };

    const btnSize = layout === 'compact' ? 32 : 44;
    const iconSize = layout === 'compact' ? 18 : 22;

    return this.wrapWithAnimation(html`
      <style>
        .cnt-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:8px; padding-left:2px; }
        .cnt-btn-${mid} {
          display:flex; align-items:center; justify-content:center; width:${btnSize}px; height:${btnSize}px;
          border-radius:50%; border:none; cursor:pointer; background:${buttonColor}; color:#fff;
          transition:all .15s; --mdc-icon-size:${iconSize}px; flex-shrink:0;
        }
        .cnt-btn-${mid}:hover { opacity:.85; transform:scale(1.05); }
        .cnt-btn-${mid}:active { transform:scale(.95); }
        .cnt-btn-${mid}.reset { background:transparent; color:var(--secondary-text-color); border:1px solid var(--divider-color); }
        .cnt-btn-${mid}.reset:hover { color:${buttonColor}; border-color:${buttonColor}; }
        .cnt-value-${mid} { font-size:${fontSize}px; font-weight:700; color:${textColor}; font-variant-numeric:tabular-nums;
          min-width:${fontSize * 2}px; text-align:center; line-height:1; }
        .cnt-step { font-size:11px; color:var(--secondary-text-color); opacity:.6; }
        .cnt-inline-${mid} { display:flex; align-items:center; justify-content:center; gap:${layout === 'compact' ? '12px' : '20px'}; }
        .cnt-stacked-${mid} { display:flex; flex-direction:column; align-items:center; gap:12px; }
        .cnt-stacked-btns { display:flex; align-items:center; gap:12px; }
      </style>
      <div class="${hoverEffectClass}" style="${designStyles}">
        ${showLabel ? html`<div class="cnt-label">${cntMod.label}</div>` : ''}
        ${layout === 'stacked' ? html`
          <div class="cnt-stacked-${mid}">
            <div class="cnt-value-${mid}">${currentValue}</div>
            <div class="cnt-stacked-btns">
              <button class="cnt-btn-${mid}" @click=${decrement}><ha-icon icon="mdi:minus"></ha-icon></button>
              ${showReset ? html`<button class="cnt-btn-${mid} reset" @click=${reset}><ha-icon icon="mdi:refresh"></ha-icon></button>` : ''}
              <button class="cnt-btn-${mid}" @click=${increment}><ha-icon icon="mdi:plus"></ha-icon></button>
            </div>
          </div>
        ` : html`
          <div class="cnt-inline-${mid}">
            <button class="cnt-btn-${mid}" @click=${decrement}><ha-icon icon="mdi:minus"></ha-icon></button>
            <div style="display:flex;flex-direction:column;align-items:center;">
              <span class="cnt-value-${mid}">${currentValue}</span>
              ${step !== 1 ? html`<span class="cnt-step">step: ${step}</span>` : ''}
            </div>
            <button class="cnt-btn-${mid}" @click=${increment}><ha-icon icon="mdi:plus"></ha-icon></button>
            ${showReset ? html`<button class="cnt-btn-${mid} reset" @click=${reset}><ha-icon icon="mdi:refresh"></ha-icon></button>` : ''}
          </div>
        `}
      </div>
    `, module, hass);
  }

  private _buildContainerStyles(dp: any): Record<string, string> {
    return {
      width: '100%', height: 'auto',
      padding: dp.padding_top || dp.padding_bottom || dp.padding_left || dp.padding_right
        ? `${dp.padding_top || '0px'} ${dp.padding_right || '0px'} ${dp.padding_bottom || '0px'} ${dp.padding_left || '0px'}` : '4px 0',
      margin: dp.margin_top || dp.margin_bottom || dp.margin_left || dp.margin_right
        ? `${dp.margin_top || '0px'} ${dp.margin_right || '0px'} ${dp.margin_bottom || '0px'} ${dp.margin_left || '0px'}` : '0',
      background: dp.background_color || 'transparent', 'border-radius': dp.border_radius || '0',
      border: dp.border_style && dp.border_style !== 'none' ? `${dp.border_width || '1px'} ${dp.border_style} ${dp.border_color || 'var(--divider-color)'}` : 'none',
      'box-sizing': 'border-box',
    };
  }
  private _css(s: Record<string, string | number>): string {
    return Object.entries(s).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';');
  }
}
