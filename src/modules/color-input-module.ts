import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ColorInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import '../components/ultra-color-picker';

export class UltraColorInputModule extends BaseUltraModule {
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  metadata: ModuleMetadata = {
    type: 'color_input',
    title: 'Color Input',
    description: 'Color picker linked to input_text or light entities',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:palette',
    category: 'input',
    tags: ['color', 'picker', 'input', 'form', 'helper', 'interactive', 'rgb', 'hex'],
  };

  createDefault(id?: string, hass?: HomeAssistant): ColorInputModule {
    return {
      id: id || this.generateId('color_input'),
      type: 'color_input',
      color_mode: 'hex',
      show_label: true,
      label: '',
      show_hex_input: true,
      show_preview: true,
      preview_size: 40,
      font_size: 14,
      text_color: 'var(--primary-text-color)',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getColorModeOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'hex', label: localize('editor.color_input.mode_options.hex', lang, 'Hex (input_text)') },
      { value: 'light_rgb', label: localize('editor.color_input.mode_options.light_rgb', lang, 'Light RGB Color') },
    ];
  }

  renderGeneralTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const colorMod = module as ColorInputModule;
    const lang = hass?.locale?.language || 'en';
    const isLightMode = colorMod.color_mode === 'light_rgb';
    const domainFilter = isLightMode ? ['light'] : ['input_text'];

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <div class="settings-section">
          <div class="section-title">${localize('editor.color_input.mode.title', lang, 'Color Mode')}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${localize('editor.color_input.mode.desc', lang, 'Choose how the color value is stored.')}
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection(
              localize('editor.color_input.color_mode', lang, 'Color Mode'),
              localize('editor.color_input.color_mode_desc', lang, 'Hex stores to input_text, Light RGB controls a light entity'),
              hass, { color_mode: colorMod.color_mode || 'hex' },
              [this.selectField('color_mode', this.getColorModeOptions(lang))],
              (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          </div>
        </div>

        ${this.renderSettingsSection(
          localize('editor.color_input.entity.title', lang, 'Entity Configuration'),
          localize('editor.color_input.entity.desc', lang, isLightMode ? 'Select a light entity to control.' : 'Select an input_text entity to store the hex color.'),
          [{ title: localize('editor.color_input.entity_field', lang, 'Entity'),
             description: localize('editor.color_input.entity_field_desc', lang, isLightMode ? 'Select a light entity.' : 'Select an input_text entity.'),
             hass, data: { entity: colorMod.entity || '' },
             schema: [this.entityField('entity', domainFilter)],
             onChange: (e: CustomEvent) => updateModule(e.detail.value) }]
        )}

        <div class="settings-section">
          <div class="section-title">${localize('editor.color_input.display.title', lang, 'Display')}</div>

          ${this.renderFieldSection(
            localize('editor.color_input.label', lang, 'Label'), localize('editor.color_input.label_desc', lang, 'Label above the color picker'),
            hass, { label: colorMod.label || '' }, [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          ${this.renderFieldSection(
            localize('editor.color_input.show_label', lang, 'Show Label'), localize('editor.color_input.show_label_desc', lang, 'Display the label'),
            hass, { show_label: colorMod.show_label !== false }, [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
          ${this.renderFieldSection(
            localize('editor.color_input.show_hex_input', lang, 'Show Hex Input'),
            localize('editor.color_input.show_hex_input_desc', lang, 'Display a text field with the hex value'),
            hass, { show_hex_input: colorMod.show_hex_input !== false }, [{ name: 'show_hex_input', selector: { boolean: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.color_input.styling.title', lang, 'Styling')}</div>
          ${this.renderSliderField(
            localize('editor.color_input.preview_size', lang, 'Preview Size'),
            localize('editor.color_input.preview_size_desc', lang, 'Size of the color preview swatch'),
            colorMod.preview_size ?? 40, 40, 24, 80, 2, (v: number) => { updateModule({ preview_size: v }); setTimeout(() => this.triggerPreviewUpdate(), 50); }, 'px'
          )}
          ${this.renderSliderField(
            localize('editor.color_input.font_size', lang, 'Font Size'), localize('editor.color_input.font_size_desc', lang, 'Font size in pixels'),
            colorMod.font_size ?? 14, 14, 10, 24, 1, (v: number) => updateModule({ font_size: v }), 'px'
          )}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.color_input.text_color', lang, 'Text Color')}
              .value=${colorMod.text_color || 'var(--primary-text-color)'}
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
    const colorMod = module as ColorInputModule;

    if (!colorMod.entity?.trim()) {
      return this.renderGradientErrorState('Configure Entity', 'Select an entity in the General tab', 'mdi:palette');
    }
    const entityState = hass?.states?.[colorMod.entity];
    if (!entityState) {
      return this.renderGradientErrorState('Entity Not Found', `Entity "${colorMod.entity}" is not available`, 'mdi:alert-circle-outline');
    }

    const isLightMode = colorMod.color_mode === 'light_rgb';
    let currentHex: string;

    if (isLightMode) {
      const rgb = entityState.attributes?.rgb_color;
      currentHex = rgb ? `#${rgb.map((c: number) => c.toString(16).padStart(2, '0')).join('')}` : '#ffffff';
    } else {
      const raw = entityState.state || '#000000';
      currentHex = raw.startsWith('#') ? raw : `#${raw}`;
    }

    const designProperties = (colorMod as any).design || {};
    const fontSize = colorMod.font_size ?? 14;
    const textColor = colorMod.text_color || 'var(--primary-text-color)';
    const showLabel = colorMod.show_label !== false && !!colorMod.label;
    const showHexInput = colorMod.show_hex_input !== false;
    const showPreview = colorMod.show_preview !== false;
    const previewSize = colorMod.preview_size ?? 40;
    const containerStyles = this._buildContainerStyles(designProperties);
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(designProperties.hover_effect);
    const mid = colorMod.id;

    const setColor = (hex: string) => {
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        if (!colorMod.entity || !hass) return;
        if (isLightMode) {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          hass.callService('light', 'turn_on', { entity_id: colorMod.entity, rgb_color: [r, g, b] });
        } else {
          hass.callService('input_text', 'set_value', { entity_id: colorMod.entity, value: hex });
        }
      }, 150);
    };

    const handlePickerChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      setColor(input.value);
    };

    const handleHexInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      let val = input.value.trim();
      if (!val.startsWith('#')) val = `#${val}`;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val);
    };

    return html`
      <style>
        .clr-row-${mid} { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .clr-swatch-${mid} {
          position:relative; width:${previewSize}px; height:${previewSize}px; flex-shrink:0;
          border-radius:10px; cursor:pointer; overflow:hidden;
          border:2px solid var(--divider-color); transition:border-color .2s, box-shadow .2s;
          background:${currentHex};
        }
        .clr-swatch-${mid}:hover { border-color:var(--primary-color); box-shadow:0 0 0 2px rgba(var(--rgb-primary-color,3,169,244),.25); }
        .clr-swatch-${mid} input {
          position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer;
          border:none; padding:0; -webkit-appearance:none;
        }
        .clr-hex-input-${mid} { flex:1; min-width:80px; padding:10px 12px; border:1px solid var(--divider-color);
          border-radius:8px; background:transparent; font-size:${fontSize}px; color:${textColor};
          font-family:monospace; outline:none; transition:border-color .2s; }
        .clr-hex-input-${mid}:focus { border-color:var(--primary-color); box-shadow:0 0 0 1px var(--primary-color); }
        .clr-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
      </style>
      <div class="${hoverEffectClass}" style=${this._css(containerStyles)}>
        ${showLabel ? html`<div class="clr-label">${colorMod.label}</div>` : ''}
        <div class="clr-row-${mid}">
          <div class="clr-swatch-${mid}">
            <input type="color" .value=${currentHex} @input=${handlePickerChange} />
          </div>
          ${showHexInput ? html`<input class="clr-hex-input-${mid}" type="text" .value=${currentHex}
            placeholder="#000000" @change=${handleHexInput} />` : ''}
        </div>
      </div>
    `;
  }

  private _buildContainerStyles(dp: any): Record<string, string> {
    return {
      width: '100%', height: 'auto',
      padding: dp.padding_top || dp.padding_bottom || dp.padding_left || dp.padding_right
        ? `${dp.padding_top || '0px'} ${dp.padding_right || '0px'} ${dp.padding_bottom || '0px'} ${dp.padding_left || '0px'}` : '0',
      margin: dp.margin_top || dp.margin_bottom || dp.margin_left || dp.margin_right
        ? `${dp.margin_top || '8px'} ${dp.margin_right || '0px'} ${dp.margin_bottom || '8px'} ${dp.margin_left || '0px'}` : '8px 0',
      background: dp.background_color || 'transparent', 'border-radius': dp.border_radius || '0',
      border: dp.border_style && dp.border_style !== 'none' ? `${dp.border_width || '1px'} ${dp.border_style} ${dp.border_color || 'var(--divider-color)'}` : 'none',
      'box-sizing': 'border-box',
    };
  }
  private _css(s: Record<string, string | number>): string {
    return Object.entries(s).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';');
  }
}
