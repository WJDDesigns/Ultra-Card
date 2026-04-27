import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BooleanInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

export class UltraBooleanInputModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'boolean_input',
    title: 'Boolean Input',
    description: 'Toggle switch linked to input_boolean and switch entities',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:toggle-switch-outline',
    category: 'input',
    tags: ['boolean', 'toggle', 'switch', 'input', 'form', 'helper', 'interactive'],
  };

  createDefault(id?: string, hass?: HomeAssistant): BooleanInputModule {
    return {
      id: id || this.generateId('boolean_input'),
      type: 'boolean_input',
      toggle_style: 'switch',
      show_label: true,
      label: '',
      show_state_text: true,
      on_text: '',
      off_text: '',
      font_size: 14,
      text_color: 'var(--primary-text-color)',
      on_color: 'var(--primary-color)',
      off_color: 'var(--disabled-color, #bdbdbd)',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getToggleStyleOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'switch', label: localize('editor.boolean_input.style_options.switch', lang, 'Switch') },
      { value: 'checkbox', label: localize('editor.boolean_input.style_options.checkbox', lang, 'Checkbox') },
      { value: 'pill', label: localize('editor.boolean_input.style_options.pill', lang, 'Pill Toggle') },
    ];
  }

  renderGeneralTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const boolMod = module as BooleanInputModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.boolean_input.entity.title', lang, 'Entity Configuration'),
          localize('editor.boolean_input.entity.desc', lang, 'Link to a Home Assistant Input Boolean or switch entity.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', boolMod.entity || '',
            (value: string) => { updateModule({ entity: value }); this.triggerPreviewUpdate(); },
            ['input_boolean', 'switch'],
            localize('editor.boolean_input.entity_field', lang, 'Entity')
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.boolean_input.appearance.title', lang, 'Appearance')}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${localize('editor.boolean_input.appearance.desc', lang, 'Configure the toggle style and labels.')}
          </div>

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection(
              localize('editor.boolean_input.toggle_style', lang, 'Toggle Style'),
              localize('editor.boolean_input.toggle_style_desc', lang, 'Visual style of the toggle'),
              hass, { toggle_style: boolMod.toggle_style || 'switch' },
              [this.selectField('toggle_style', this.getToggleStyleOptions(lang))],
              (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.boolean_input.label', lang, 'Label'), localize('editor.boolean_input.label_desc', lang, 'Label displayed beside the toggle'),
            hass, { label: boolMod.label || '' }, [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          ${this.renderFieldSection(
            localize('editor.boolean_input.show_label', lang, 'Show Label'), localize('editor.boolean_input.show_label_desc', lang, 'Display the label'),
            hass, { show_label: boolMod.show_label !== false }, [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
          ${this.renderFieldSection(
            localize('editor.boolean_input.show_state_text', lang, 'Show State Text'),
            localize('editor.boolean_input.show_state_text_desc', lang, 'Display On/Off text beside the toggle'),
            hass, { show_state_text: boolMod.show_state_text !== false }, [{ name: 'show_state_text', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
          ${boolMod.show_state_text !== false ? html`
            ${this.renderFieldSection(
              localize('editor.boolean_input.on_text', lang, 'On Text'), localize('editor.boolean_input.on_text_desc', lang, 'Custom text for the On state (default: On)'),
              hass, { on_text: boolMod.on_text || '' }, [{ name: 'on_text', selector: { text: {} } }],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
            ${this.renderFieldSection(
              localize('editor.boolean_input.off_text', lang, 'Off Text'), localize('editor.boolean_input.off_text_desc', lang, 'Custom text for the Off state (default: Off)'),
              hass, { off_text: boolMod.off_text || '' }, [{ name: 'off_text', selector: { text: {} } }],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
          ` : ''}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.boolean_input.styling.title', lang, 'Styling')}</div>
          ${this.renderSliderField(
            localize('editor.boolean_input.font_size', lang, 'Font Size'), localize('editor.boolean_input.font_size_desc', lang, 'Font size in pixels'),
            boolMod.font_size ?? 14, 14, 10, 24, 1, (v: number) => updateModule({ font_size: v }), 'px'
          )}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.boolean_input.on_color', lang, 'On Color')}
              .value=${boolMod.on_color || 'var(--primary-color)'}
              @color-changed=${(e: CustomEvent) => { updateModule({ on_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.boolean_input.off_color', lang, 'Off Color')}
              .value=${boolMod.off_color || 'var(--disabled-color, #bdbdbd)'}
              @color-changed=${(e: CustomEvent) => { updateModule({ off_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.boolean_input.text_color', lang, 'Text Color')}
              .value=${boolMod.text_color || 'var(--primary-text-color)'}
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
    const boolMod = module as BooleanInputModule;
    const lang = hass?.locale?.language || 'en';

    if (!boolMod.entity?.trim()) {
      return this.renderGradientErrorState(localize('editor.common.error_configure_entity', lang, 'Configure Entity'), localize('editor.boolean_input.error_configure_entity_desc', lang, 'Select an Input Boolean entity in the General tab'), 'mdi:toggle-switch-outline');
    }
    const entityState = hass?.states?.[boolMod.entity];
    if (!entityState) {
      return this.renderGradientErrorState(localize('editor.common.error_entity_not_found', lang, 'Entity Not Found'), `Entity "${boolMod.entity}" is not available`, 'mdi:alert-circle-outline');
    }

    const isOn = entityState.state === 'on';
    const designProperties = (boolMod as any).design || {};
    const fontSize = boolMod.font_size ?? 14;
    const textColor = boolMod.text_color || 'var(--primary-text-color)';
    const onColor = boolMod.on_color || 'var(--primary-color)';
    const offColor = boolMod.off_color || 'var(--disabled-color, #bdbdbd)';
    const style = boolMod.toggle_style || 'switch';
    const showLabel = boolMod.show_label !== false && !!boolMod.label;
    const showStateText = boolMod.show_state_text !== false;
    const onText = boolMod.on_text || 'On';
    const offText = boolMod.off_text || 'Off';
    const containerStyles = this._buildContainerStyles(designProperties);
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const mid = boolMod.id;

    const toggle = () => {
      if (!boolMod.entity || !hass) return;
      const domain = boolMod.entity.split('.')[0];
      hass.callService(domain, 'toggle', { entity_id: boolMod.entity });
    };

    const currentColor = isOn ? onColor : offColor;

    if (style === 'checkbox') {
      return this.wrapWithAnimation(html`
        <style>
          .bool-cb-row-${mid} { display:flex; align-items:center; gap:12px; cursor:pointer; }
          .bool-cb-box-${mid} { width:22px; height:22px; border-radius:4px; border:2px solid ${currentColor};
            display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0;
            background:${isOn ? currentColor : 'transparent'}; }
          .bool-cb-box-${mid} ha-icon { --mdc-icon-size:16px; color:#fff; opacity:${isOn ? '1' : '0'}; transition:opacity .2s; }
          .bool-cb-label { font-size:${fontSize}px; color:${textColor}; }
          .bool-state-text { font-size:${Math.max(11, fontSize - 2)}px; color:var(--secondary-text-color); margin-left:auto; }
          .bool-top-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${hoverEffectClass}" style="${designStyles}">
          ${showLabel ? html`<div class="bool-top-label">${boolMod.label}</div>` : ''}
          <div class="bool-cb-row-${mid}" @click=${toggle}>
            <div class="bool-cb-box-${mid}"><ha-icon icon="mdi:check"></ha-icon></div>
            ${showLabel ? html`<span class="bool-cb-label">${entityState.attributes?.friendly_name || boolMod.entity}</span>` : ''}
            ${showStateText ? html`<span class="bool-state-text">${isOn ? onText : offText}</span>` : ''}
          </div>
        </div>
      `, module, hass);
    }

    if (style === 'pill') {
      return this.wrapWithAnimation(html`
        <style>
          .bool-pill-row-${mid} { display:flex; align-items:center; gap:12px; }
          .bool-pill-${mid} { display:flex; border-radius:20px; overflow:hidden; border:1px solid var(--divider-color); }
          .bool-pill-btn-${mid} { padding:8px 20px; border:none; cursor:pointer; font-size:${fontSize}px;
            font-family:inherit; transition:all .2s; background:transparent; color:${textColor}; }
          .bool-pill-btn-${mid}.active { background:${currentColor}; color:#fff; font-weight:500; }
          .bool-pill-btn-${mid}:not(.active):hover { background:rgba(var(--rgb-primary-text-color,0,0,0),.05); }
          .bool-pill-label { font-size:${fontSize}px; color:${textColor}; flex:1; }
          .bool-top-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${hoverEffectClass}" style="${designStyles}">
          ${showLabel ? html`<div class="bool-top-label">${boolMod.label}</div>` : ''}
          <div class="bool-pill-row-${mid}">
            <div class="bool-pill-${mid}">
              <button class="bool-pill-btn-${mid} ${!isOn ? 'active' : ''}" @click=${() => { if (isOn) toggle(); }}>${offText}</button>
              <button class="bool-pill-btn-${mid} ${isOn ? 'active' : ''}" @click=${() => { if (!isOn) toggle(); }}>${onText}</button>
            </div>
          </div>
        </div>
      `, module, hass);
    }

    // Default: switch
    return this.wrapWithAnimation(html`
      <style>
        .bool-sw-row-${mid} { display:flex; align-items:center; gap:12px; cursor:pointer; }
        .bool-sw-track-${mid} { width:48px; height:26px; border-radius:13px; position:relative;
          background:${currentColor}; transition:background .3s; flex-shrink:0; }
        .bool-sw-thumb-${mid} { width:22px; height:22px; border-radius:50%; background:#fff;
          position:absolute; top:2px; left:${isOn ? '24px' : '2px'}; transition:left .3s;
          box-shadow:0 1px 3px rgba(0,0,0,.3); }
        .bool-sw-label { font-size:${fontSize}px; color:${textColor}; flex:1; }
        .bool-state-text { font-size:${Math.max(11, fontSize - 2)}px; color:var(--secondary-text-color); }
        .bool-top-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
      </style>
      <div class="${hoverEffectClass}" style="${designStyles}">
        ${showLabel ? html`<div class="bool-top-label">${boolMod.label}</div>` : ''}
        <div class="bool-sw-row-${mid}" @click=${toggle}>
          <div class="bool-sw-track-${mid}"><div class="bool-sw-thumb-${mid}"></div></div>
          ${showLabel ? html`<span class="bool-sw-label">${entityState.attributes?.friendly_name || boolMod.entity}</span>` : ''}
          ${showStateText ? html`<span class="bool-state-text">${isOn ? onText : offText}</span>` : ''}
        </div>
      </div>
    `, module, hass);
  }

  private _buildContainerStyles(dp: any): Record<string, string> {
    return {
      width: '100%', height: 'auto',
      padding: dp.padding_top || dp.padding_bottom || dp.padding_left || dp.padding_right
        ? `${dp.padding_top || '0px'} ${dp.padding_right || '0px'} ${dp.padding_bottom || '0px'} ${dp.padding_left || '0px'}` : '0',
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
