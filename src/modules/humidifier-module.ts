import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, HumidifierModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

const MODE_ICONS: Record<string, string> = {
  normal: 'mdi:water-percent',
  eco: 'mdi:leaf',
  away: 'mdi:account-arrow-right',
  boost: 'mdi:rocket-launch',
  comfort: 'mdi:sofa',
  home: 'mdi:home',
  sleep: 'mdi:sleep',
  auto: 'mdi:refresh-auto',
  baby: 'mdi:baby-carriage',
};

export class UltraHumidifierModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'humidifier',
    title: 'Humidifier Control',
    description: 'Control humidifiers and dehumidifiers with target humidity, power, and modes',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:air-humidifier',
    category: 'interactive',
    tags: ['humidifier', 'dehumidifier', 'humidity', 'control', 'interactive'],
  };

  /** Local target while dragging so the slider doesn't snap back before HA confirms. */
  private _pendingTargets: Map<string, { value: number; ts: number }> = new Map();

  createDefault(id?: string): HumidifierModule {
    return {
      id: id || this.generateId('humidifier'),
      type: 'humidifier',
      entity: '',
      name: '',
      icon: '',
      show_name: true,
      show_current_humidity: true,
      show_target_slider: true,
      show_modes: true,
      show_power_button: true,
      active_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',
      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as HumidifierModule, hass, updates =>
      updateModule(updates)
    );
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as HumidifierModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as HumidifierModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.humidifier.entity_section', lang, 'Entity'),
          localize('editor.humidifier.entity_section_desc', lang, 'Choose the humidifier to control.'),
          [
            {
              title: localize('editor.humidifier.entity', lang, 'Entity'),
              description: localize(
                'editor.humidifier.entity_desc',
                lang,
                'A humidifier or dehumidifier entity.'
              ),
              hass,
              data: { entity: m.entity || '' },
              schema: [{ name: 'entity', selector: { entity: { domain: 'humidifier' } } }],
              onChange: (e: CustomEvent) => {
                updateModule({ entity: e.detail.value?.entity ?? '' } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.humidifier.name', lang, 'Name override'),
              description: localize(
                'editor.humidifier.name_desc',
                lang,
                'Leave blank to use the entity friendly name.'
              ),
              hass,
              data: { name: m.name || '' },
              schema: [this.textField('name')],
              onChange: (e: CustomEvent) => {
                updateModule({ name: e.detail.value?.name ?? '' } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderIconField(
          localize('editor.humidifier.icon', lang, 'Icon override'),
          localize('editor.humidifier.icon_desc', lang, 'Leave blank to use the entity icon.'),
          hass,
          m.icon || '',
          (value: string) => {
            updateModule({ icon: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSettingsSection(
          localize('editor.humidifier.display_section', lang, 'Display'),
          localize('editor.humidifier.display_section_desc', lang, 'Choose which controls to show.'),
          [
            {
              title: localize('editor.humidifier.show_name', lang, 'Show name'),
              description: '',
              hass,
              data: { show_name: m.show_name !== false },
              schema: [this.booleanField('show_name')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_name: e.detail.value.show_name } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.humidifier.show_current', lang, 'Show current humidity'),
              description: localize(
                'editor.humidifier.show_current_desc',
                lang,
                'Large reading when the device reports it.'
              ),
              hass,
              data: { show_current_humidity: m.show_current_humidity !== false },
              schema: [this.booleanField('show_current_humidity')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_current_humidity: e.detail.value.show_current_humidity,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.humidifier.show_slider', lang, 'Show target slider'),
              description: '',
              hass,
              data: { show_target_slider: m.show_target_slider !== false },
              schema: [this.booleanField('show_target_slider')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_target_slider: e.detail.value.show_target_slider,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.humidifier.show_modes', lang, 'Show modes'),
              description: localize(
                'editor.humidifier.show_modes_desc',
                lang,
                'Mode buttons when the device supports them.'
              ),
              hass,
              data: { show_modes: m.show_modes !== false },
              schema: [this.booleanField('show_modes')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_modes: e.detail.value.show_modes } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.humidifier.show_power', lang, 'Show power button'),
              description: '',
              hass,
              data: { show_power_button: m.show_power_button !== false },
              schema: [this.booleanField('show_power_button')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_power_button: e.detail.value.show_power_button,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderColorField(
          localize('editor.humidifier.active_color', lang, 'Active color'),
          localize('editor.humidifier.active_color_desc', lang, 'Accent used when the device is on.'),
          hass,
          m.active_color || '',
          'var(--primary-color)',
          (value: string) => {
            updateModule({ active_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.humidifier.text_color', lang, 'Text color'),
          '',
          hass,
          m.text_color || '',
          'var(--primary-text-color)',
          (value: string) => {
            updateModule({ text_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.humidifier.card_bg', lang, 'Card background'),
          '',
          hass,
          m.card_background_color || '',
          'var(--card-background-color)',
          (value: string) => {
            updateModule({ card_background_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as HumidifierModule;
    const lang = hass?.locale?.language || 'en';
    const entityId = this.resolveEntity(m.entity, config) || m.entity;

    if (!entityId || !hass?.states[entityId]) {
      return this.renderGradientErrorState(
        localize('editor.humidifier.config_needed', lang, 'Select a humidifier'),
        localize('editor.humidifier.config_needed_desc', lang, 'Choose an entity in the General tab'),
        'mdi:air-humidifier'
      );
    }

    const st = hass.states[entityId];
    const a = st.attributes || {};
    const isOn = st.state === 'on';
    const unavailable = st.state === 'unavailable' || st.state === 'unknown';

    const name = m.name?.trim() || (a.friendly_name as string) || entityId;
    const icon = m.icon || (a.icon as string) || 'mdi:air-humidifier';
    const accent = m.active_color || 'var(--primary-color)';
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--card-background-color)';
    const stateColor = isOn ? accent : secondary;

    const minH = typeof a.min_humidity === 'number' ? (a.min_humidity as number) : 0;
    const maxH = typeof a.max_humidity === 'number' ? (a.max_humidity as number) : 100;
    const haTarget = typeof a.humidity === 'number' ? (a.humidity as number) : undefined;
    const pending = this._pendingTargets.get(entityId);
    // Drop the optimistic value once HA confirms or after 5s
    const target =
      pending && Date.now() - pending.ts < 5000 && pending.value !== haTarget
        ? pending.value
        : haTarget;
    if (pending && (pending.value === haTarget || Date.now() - pending.ts >= 5000)) {
      this._pendingTargets.delete(entityId);
    }
    const current =
      typeof a.current_humidity === 'number' ? (a.current_humidity as number) : undefined;
    const modes = Array.isArray(a.available_modes) ? (a.available_modes as string[]) : [];
    const activeMode = a.mode as string | undefined;
    const action = a.action as string | undefined; // humidifying | drying | idle | off

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    const g = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action?.action
          ? { ...m.tap_action, entity: entityId }
          : { action: 'more-info', entity: entityId },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: entityId,
        module: m,
      },
      hass,
      config,
      ['.uc-hum-ctl']
    );

    const statusLabel = unavailable
      ? localize('editor.humidifier.unavailable', lang, 'Unavailable')
      : action === 'humidifying'
        ? localize('editor.humidifier.humidifying', lang, 'Humidifying')
        : action === 'drying'
          ? localize('editor.humidifier.drying', lang, 'Drying')
          : isOn
            ? localize('editor.humidifier.on', lang, 'On')
            : localize('editor.humidifier.off', lang, 'Off');

    return html`
      <div
        class="uc-humidifier-wrapper ${hoverClass}"
        style="padding:16px;border-radius:12px;background:${cardBg};${designStyles}"
        @pointerdown=${g.onPointerDown}
        @pointermove=${g.onPointerMove}
        @pointerup=${g.onPointerUp}
        @pointerleave=${g.onPointerLeave}
        @pointercancel=${g.onPointerCancel}
      >
        ${this.wrapWithAnimation(
          html`
            <div style="display:flex;align-items:center;gap:10px;">
              <ha-icon
                icon="${icon}"
                style="color:${stateColor};--mdc-icon-size:28px;flex-shrink:0;${action === 'humidifying' || action === 'drying' ? 'animation:uc-hum-pulse 2s ease-in-out infinite;' : ''}"
              ></ha-icon>
              <div style="flex:1;min-width:0;">
                ${m.show_name !== false
                  ? html`<div
                      style="color:${text};font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
                    >
                      ${name}
                    </div>`
                  : nothing}
                <div style="color:${stateColor};font-size:12px;font-weight:500;">
                  ${statusLabel}${activeMode && isOn ? ` · ${activeMode}` : ''}
                </div>
              </div>
              ${m.show_current_humidity !== false && current !== undefined
                ? html`<div style="text-align:right;flex-shrink:0;">
                    <span style="color:${text};font-size:24px;font-weight:700;">${Math.round(current)}</span>
                    <span style="color:${secondary};font-size:13px;">%</span>
                  </div>`
                : nothing}
              ${m.show_power_button !== false
                ? html`
                    <button
                      class="uc-hum-ctl"
                      style="flex-shrink:0;width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:${isOn ? accent : 'rgba(127,127,127,0.15)'};color:${isOn ? 'var(--text-primary-color,#fff)' : secondary};"
                      ?disabled=${unavailable}
                      title=${localize('editor.humidifier.toggle_power', lang, 'Toggle power')}
                      @click=${(ev: Event) => {
                        ev.stopPropagation();
                        hass.callService('humidifier', isOn ? 'turn_off' : 'turn_on', {
                          entity_id: entityId,
                        });
                      }}
                    >
                      <ha-icon icon="mdi:power" style="--mdc-icon-size:20px;"></ha-icon>
                    </button>
                  `
                : nothing}
            </div>

            ${m.show_target_slider !== false && target !== undefined
              ? html`
                  <div class="uc-hum-ctl" style="margin-top:14px;">
                    <div
                      style="display:flex;justify-content:space-between;font-size:12px;color:${secondary};margin-bottom:4px;"
                    >
                      <span>${localize('editor.humidifier.target', lang, 'Target humidity')}</span>
                      <span style="color:${text};font-weight:600;">${Math.round(target)}%</span>
                    </div>
                    <input
                      type="range"
                      class="uc-hum-slider"
                      style="--uc-hum-accent:${isOn ? accent : 'rgba(127,127,127,0.5)'};"
                      min=${String(minH)}
                      max=${String(maxH)}
                      step="1"
                      .value=${String(Math.round(target))}
                      ?disabled=${unavailable || !isOn}
                      @click=${(ev: Event) => ev.stopPropagation()}
                      @change=${(ev: Event) => {
                        ev.stopPropagation();
                        const value = Number((ev.target as HTMLInputElement).value);
                        this._pendingTargets.set(entityId, { value, ts: Date.now() });
                        hass.callService('humidifier', 'set_humidity', {
                          entity_id: entityId,
                          humidity: value,
                        });
                      }}
                    />
                  </div>
                `
              : nothing}

            ${m.show_modes !== false && modes.length > 0
              ? html`
                  <div class="uc-hum-ctl" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">
                    ${modes.map(mode => {
                      const isActive = mode === activeMode && isOn;
                      return html`
                        <button
                          style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:16px;border:1px solid ${isActive ? accent : 'var(--divider-color)'};background:${isActive ? `${this._cssColorWithAlpha(accent)}` : 'transparent'};color:${isActive ? accent : secondary};font-size:12px;font-weight:600;cursor:pointer;text-transform:capitalize;"
                          ?disabled=${unavailable}
                          @click=${(ev: Event) => {
                            ev.stopPropagation();
                            hass.callService('humidifier', 'set_mode', {
                              entity_id: entityId,
                              mode,
                            });
                          }}
                        >
                          ${MODE_ICONS[mode.toLowerCase()]
                            ? html`<ha-icon
                                icon=${MODE_ICONS[mode.toLowerCase()]}
                                style="--mdc-icon-size:14px;"
                              ></ha-icon>`
                            : nothing}
                          ${mode}
                        </button>
                      `;
                    })}
                  </div>
                `
              : nothing}
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  /** A translucent fill for chips that works with both hex colors and CSS variables. */
  private _cssColorWithAlpha(color: string): string {
    if (color.startsWith('var(')) {
      return `color-mix(in srgb, ${color} 14%, transparent)`;
    }
    return `${color}24`;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as HumidifierModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.entity) errors.push('Select a humidifier entity');
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-humidifier-wrapper { box-sizing: border-box; }
      @keyframes uc-hum-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .uc-hum-slider {
        width: 100%;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        border-radius: 4px;
        background: rgba(127, 127, 127, 0.25);
        outline: none;
        cursor: pointer;
      }
      .uc-hum-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--uc-hum-accent, var(--primary-color));
        border: 2px solid var(--card-background-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
      }
      .uc-hum-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--uc-hum-accent, var(--primary-color));
        border: 2px solid var(--card-background-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
      }
      .uc-hum-slider:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
