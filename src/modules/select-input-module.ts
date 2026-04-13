import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, SelectInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

export class UltraSelectInputModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'select_input',
    title: 'Select Input',
    description: 'Dropdown or chip selector linked to input_select helpers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:form-dropdown',
    category: 'input',
    tags: ['select', 'dropdown', 'input', 'form', 'helper', 'interactive', 'options'],
  };

  createDefault(id?: string, hass?: HomeAssistant): SelectInputModule {
    return {
      id: id || this.generateId('select_input'),
      type: 'select_input',
      select_style: 'dropdown',
      show_label: true,
      label: '',
      font_size: 14,
      text_color: 'var(--primary-text-color)',
      active_color: 'var(--primary-color)',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getStyleOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'dropdown', label: localize('editor.select_input.style_options.dropdown', lang, 'Dropdown') },
      { value: 'segmented', label: localize('editor.select_input.style_options.segmented', lang, 'Segmented Buttons') },
      { value: 'chips', label: localize('editor.select_input.style_options.chips', lang, 'Chips / Pills') },
    ];
  }

  renderGeneralTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const selMod = module as SelectInputModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.select_input.entity.title', lang, 'Entity Configuration'),
          localize('editor.select_input.entity.desc', lang, 'Link to a Home Assistant Input Select or select entity.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', selMod.entity || '',
            (value: string) => { updateModule({ entity: value }); this.triggerPreviewUpdate(); },
            ['input_select', 'select'],
            localize('editor.select_input.entity_field', lang, 'Entity')
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.select_input.appearance.title', lang, 'Appearance')}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${localize('editor.select_input.appearance.desc', lang, 'Choose how the options are displayed.')}
          </div>

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection(
              localize('editor.select_input.select_style', lang, 'Selection Style'),
              localize('editor.select_input.select_style_desc', lang, 'How options are presented to the user'),
              hass, { select_style: selMod.select_style || 'dropdown' },
              [this.selectField('select_style', this.getStyleOptions(lang))],
              (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.select_input.label', lang, 'Label'), localize('editor.select_input.label_desc', lang, 'Label displayed above the selector'),
            hass, { label: selMod.label || '' }, [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          ${this.renderFieldSection(
            localize('editor.select_input.show_label', lang, 'Show Label'), localize('editor.select_input.show_label_desc', lang, 'Display the label'),
            hass, { show_label: selMod.show_label !== false }, [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.select_input.styling.title', lang, 'Styling')}</div>
          ${this.renderSliderField(
            localize('editor.select_input.font_size', lang, 'Font Size'),
            localize('editor.select_input.font_size_desc', lang, 'Font size in pixels'),
            selMod.font_size ?? 14, 14, 10, 24, 1, (v: number) => updateModule({ font_size: v }), 'px'
          )}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.select_input.active_color', lang, 'Active/Selected Color')}
              .value=${selMod.active_color || 'var(--primary-color)'}
              @color-changed=${(e: CustomEvent) => { updateModule({ active_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.select_input.text_color', lang, 'Text Color')}
              .value=${selMod.text_color || 'var(--primary-text-color)'}
              @color-changed=${(e: CustomEvent) => updateModule({ text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult {
    return GlobalActionsTab.render(module, hass, u => updateModule(u));
  }
  renderOtherTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult {
    return GlobalLogicTab.render(module, hass, u => updateModule(u));
  }
  getStyles(): string { return BaseUltraModule.getSliderStyles(); }

  renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult {
    const selMod = module as SelectInputModule;
    const lang = hass?.locale?.language || 'en';

    if (!selMod.entity?.trim()) {
      return this.renderGradientErrorState(localize('editor.common.error_configure_entity', lang, 'Configure Entity'), localize('editor.select_input.error_configure_entity_desc', lang, 'Select an Input Select entity in the General tab'), 'mdi:form-dropdown');
    }
    const entityState = hass?.states?.[selMod.entity];
    if (!entityState) {
      return this.renderGradientErrorState(localize('editor.common.error_entity_not_found', lang, 'Entity Not Found'), `Entity "${selMod.entity}" is not available`, 'mdi:alert-circle-outline');
    }

    const options: string[] = entityState.attributes?.options || [];
    const current = entityState.state || '';
    const designProperties = (selMod as any).design || {};
    const fontSize = selMod.font_size ?? 14;
    const textColor = selMod.text_color || 'var(--primary-text-color)';
    const activeColor = selMod.active_color || 'var(--primary-color)';
    const style = selMod.select_style || 'dropdown';
    const showLabel = selMod.show_label !== false && !!selMod.label;
    const containerStyles = this._buildContainerStyles(designProperties);
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const mid = selMod.id;

    const selectOption = (option: string) => {
      if (!selMod.entity || !hass) return;
      const domain = selMod.entity.split('.')[0];
      hass.callService(domain, 'select_option', { entity_id: selMod.entity, option });
    };

    if (style === 'segmented') {
      return this.wrapWithAnimation(html`
        <style>
          .sel-seg-${mid} { display:flex; border-radius:8px; overflow:hidden; border:1px solid var(--divider-color); }
          .sel-seg-btn-${mid} { flex:1; padding:10px 12px; border:none; background:transparent; cursor:pointer;
            font-size:${fontSize}px; color:${textColor}; font-family:inherit; transition:all .2s;
            border-right:1px solid var(--divider-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .sel-seg-btn-${mid}:last-child { border-right:none; }
          .sel-seg-btn-${mid}.active { background:${activeColor}; color:#fff; font-weight:500; }
          .sel-seg-btn-${mid}:not(.active):hover { background:rgba(var(--rgb-primary-text-color,0,0,0),.05); }
          .sel-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${hoverEffectClass}" style="${designStyles}">
          ${showLabel ? html`<div class="sel-label">${selMod.label}</div>` : ''}
          <div class="sel-seg-${mid}">
            ${options.map(opt => html`
              <button class="sel-seg-btn-${mid} ${opt === current ? 'active' : ''}" @click=${() => selectOption(opt)}>${opt}</button>
            `)}
          </div>
        </div>
      `, module, hass);
    }

    if (style === 'chips') {
      return this.wrapWithAnimation(html`
        <style>
          .sel-chips-${mid} { display:flex; flex-wrap:wrap; gap:8px; }
          .sel-chip-${mid} { padding:8px 16px; border-radius:20px; border:1px solid var(--divider-color);
            background:transparent; cursor:pointer; font-size:${fontSize}px; color:${textColor};
            font-family:inherit; transition:all .2s; white-space:nowrap; }
          .sel-chip-${mid}.active { background:${activeColor}; color:#fff; border-color:${activeColor}; font-weight:500; }
          .sel-chip-${mid}:not(.active):hover { border-color:${activeColor}; }
          .sel-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${hoverEffectClass}" style="${designStyles}">
          ${showLabel ? html`<div class="sel-label">${selMod.label}</div>` : ''}
          <div class="sel-chips-${mid}">
            ${options.map(opt => html`
              <button class="sel-chip-${mid} ${opt === current ? 'active' : ''}" @click=${() => selectOption(opt)}>${opt}</button>
            `)}
          </div>
        </div>
      `, module, hass);
    }

    // Default: dropdown
    return this.wrapWithAnimation(html`
      <style>
        .sel-dd-wrap-${mid} { position:relative; }
        .sel-dd-${mid} { width:100%; padding:12px; font-size:${fontSize}px; color:${textColor}; font-family:inherit;
          background:transparent; border:1px solid var(--divider-color); border-radius:8px; cursor:pointer;
          appearance:none; -webkit-appearance:none; outline:none; transition:border-color .2s, box-shadow .2s; }
        .sel-dd-${mid}:focus { border-color:${activeColor}; box-shadow:0 0 0 1px ${activeColor}; }
        .sel-dd-arrow { position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none;
          color:var(--secondary-text-color); --mdc-icon-size:20px; }
        .sel-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
      </style>
      <div class="${hoverEffectClass}" style="${designStyles}">
        ${showLabel ? html`<div class="sel-label">${selMod.label}</div>` : ''}
        <div class="sel-dd-wrap-${mid}">
          <select class="sel-dd-${mid}" .value=${current} @change=${(e: Event) => selectOption((e.target as HTMLSelectElement).value)}>
            ${options.map(opt => html`<option value=${opt} ?selected=${opt === current}>${opt}</option>`)}
          </select>
          <span class="sel-dd-arrow"><ha-icon icon="mdi:chevron-down"></ha-icon></span>
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
