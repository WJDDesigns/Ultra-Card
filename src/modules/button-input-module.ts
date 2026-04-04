import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ButtonInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import '../components/ultra-color-picker';

export class UltraButtonInputModule extends BaseUltraModule {
  private _rippleTimers = new Map<string, ReturnType<typeof setTimeout>>();

  metadata: ModuleMetadata = {
    type: 'button_input',
    title: 'Button Input',
    description: 'Press button linked to input_button helpers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:gesture-tap-button',
    category: 'input',
    tags: ['button', 'press', 'input', 'form', 'helper', 'interactive', 'trigger'],
  };

  createDefault(id?: string, hass?: HomeAssistant): ButtonInputModule {
    return {
      id: id || this.generateId('button_input'),
      type: 'button_input',
      button_label: '',
      button_icon: '',
      button_style: 'filled',
      font_size: 14,
      text_color: '#ffffff',
      button_color: 'var(--primary-color)',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getButtonStyleOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'filled', label: localize('editor.button_input.style_options.filled', lang, 'Filled') },
      { value: 'outlined', label: localize('editor.button_input.style_options.outlined', lang, 'Outlined') },
      { value: 'text', label: localize('editor.button_input.style_options.text', lang, 'Text Only') },
    ];
  }

  renderGeneralTab(
    module: CardModule, hass: HomeAssistant, config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const btnMod = module as ButtonInputModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.button_input.entity.title', lang, 'Entity Configuration'),
          localize('editor.button_input.entity.desc', lang, 'Link to a Home Assistant input_button helper entity.'),
          [{ title: localize('editor.button_input.entity_field', lang, 'Entity'),
             description: localize('editor.button_input.entity_field_desc', lang, 'Select an input_button entity to trigger on press.'),
             hass, data: { entity: btnMod.entity || '' },
             schema: [this.entityField('entity', ['input_button'])],
             onChange: (e: CustomEvent) => updateModule(e.detail.value) }]
        )}

        <div class="settings-section">
          <div class="section-title">${localize('editor.button_input.appearance.title', lang, 'Appearance')}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${localize('editor.button_input.appearance.desc', lang, 'Configure the button label, icon, and style.')}
          </div>

          ${this.renderFieldSection(
            localize('editor.button_input.button_label', lang, 'Button Label'),
            localize('editor.button_input.button_label_desc', lang, 'Text displayed on the button (uses entity name if empty)'),
            hass, { button_label: btnMod.button_label || '' }, [{ name: 'button_label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          ${this.renderFieldSection(
            localize('editor.button_input.button_icon', lang, 'Icon'),
            localize('editor.button_input.button_icon_desc', lang, 'Icon displayed on the button'),
            hass, { button_icon: btnMod.button_icon || '' }, [{ name: 'button_icon', selector: { icon: {} } }],
            (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection(
              localize('editor.button_input.button_style', lang, 'Button Style'),
              localize('editor.button_input.button_style_desc', lang, 'Visual style of the button'),
              hass, { button_style: btnMod.button_style || 'filled' },
              [this.selectField('button_style', this.getButtonStyleOptions(lang))],
              (e: CustomEvent) => { updateModule(e.detail.value); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          </div>
        </div>

        <div class="settings-section">
          <div class="section-title">${localize('editor.button_input.styling.title', lang, 'Styling')}</div>
          ${this.renderSliderField(
            localize('editor.button_input.font_size', lang, 'Font Size'), localize('editor.button_input.font_size_desc', lang, 'Font size in pixels'),
            btnMod.font_size ?? 14, 14, 10, 24, 1, (v: number) => updateModule({ font_size: v }), 'px'
          )}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.button_input.button_color', lang, 'Button Color')}
              .value=${btnMod.button_color || 'var(--primary-color)'}
              @color-changed=${(e: CustomEvent) => { updateModule({ button_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${localize('editor.button_input.text_color', lang, 'Text Color')}
              .value=${btnMod.text_color || '#ffffff'}
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
    const btnMod = module as ButtonInputModule;

    if (!btnMod.entity?.trim()) {
      return this.renderGradientErrorState('Configure Entity', 'Select an input_button entity in the General tab', 'mdi:gesture-tap-button');
    }
    const entityState = hass?.states?.[btnMod.entity];
    if (!entityState) {
      return this.renderGradientErrorState('Entity Not Found', `Entity "${btnMod.entity}" is not available`, 'mdi:alert-circle-outline');
    }

    const designProperties = (btnMod as any).design || {};
    const fontSize = btnMod.font_size ?? 14;
    const textColor = btnMod.text_color || '#ffffff';
    const buttonColor = btnMod.button_color || 'var(--primary-color)';
    const style = btnMod.button_style || 'filled';
    const label = btnMod.button_label || entityState.attributes?.friendly_name || 'Press';
    const icon = btnMod.button_icon || '';
    const containerStyles = this._buildContainerStyles(designProperties);
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(designProperties.hover_effect);
    const mid = btnMod.id;

    const handlePress = () => {
      if (!btnMod.entity || !hass) return;
      hass.callService('input_button', 'press', { entity_id: btnMod.entity });
    };

    let bg: string, border: string, color: string;
    if (style === 'outlined') {
      bg = 'transparent'; border = `2px solid ${buttonColor}`; color = buttonColor;
    } else if (style === 'text') {
      bg = 'transparent'; border = 'none'; color = buttonColor;
    } else {
      bg = buttonColor; border = 'none'; color = textColor;
    }

    return html`
      <style>
        .btn-input-${mid} {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:12px 24px; border-radius:8px; cursor:pointer; font-size:${fontSize}px;
          font-family:inherit; font-weight:500; transition:all .2s; position:relative;
          overflow:hidden; background:${bg}; border:${border}; color:${color};
          width:100%; box-sizing:border-box; --mdc-icon-size:${Math.min(24, fontSize + 4)}px;
        }
        .btn-input-${mid}:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.15); }
        .btn-input-${mid}:active { transform:translateY(0); opacity:.8; }
        .btn-input-${mid} .ripple {
          position:absolute; border-radius:50%; background:rgba(255,255,255,.4);
          transform:scale(0); animation:btn-ripple-${mid} .5s ease-out; pointer-events:none;
        }
        @keyframes btn-ripple-${mid} { to { transform:scale(4); opacity:0; } }
      </style>
      <div class="${hoverEffectClass}" style=${this._css(containerStyles)}>
        <button class="btn-input-${mid}" @click=${(e: Event) => {
          handlePress();
          const btn = e.currentTarget as HTMLElement;
          const rect = btn.getBoundingClientRect();
          const me = e as MouseEvent;
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          const size = Math.max(rect.width, rect.height);
          ripple.style.cssText = `width:${size}px;height:${size}px;left:${me.clientX - rect.left - size / 2}px;top:${me.clientY - rect.top - size / 2}px;`;
          btn.appendChild(ripple);
          const t = setTimeout(() => ripple.remove(), 500);
          this._rippleTimers.set(mid, t);
        }}>
          ${icon ? html`<ha-icon icon="${icon}"></ha-icon>` : ''}
          <span>${label}</span>
        </button>
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
