import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DatetimeInputModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

export class UltraDatetimeInputModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'datetime_input',
    title: 'Date/Time Input',
    description: 'Date and time picker linked to input_datetime helpers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:calendar-clock',
    category: 'input',
    tags: ['date', 'time', 'datetime', 'input', 'form', 'helper', 'interactive', 'calendar'],
  };

  createDefault(id?: string, hass?: HomeAssistant): DatetimeInputModule {
    return {
      id: id || this.generateId('datetime_input'),
      type: 'datetime_input',
      display_mode_datetime: 'auto',
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

  private getDisplayModeOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      {
        value: 'auto',
        label: localize('editor.datetime_input.display_mode_options.auto', lang, 'Auto (from entity)'),
      },
      {
        value: 'date',
        label: localize('editor.datetime_input.display_mode_options.date', lang, 'Date Only'),
      },
      {
        value: 'time',
        label: localize('editor.datetime_input.display_mode_options.time', lang, 'Time Only'),
      },
      {
        value: 'datetime',
        label: localize('editor.datetime_input.display_mode_options.datetime', lang, 'Date & Time'),
      },
    ];
  }

  private resolveDisplayMode(
    module: DatetimeInputModule,
    entityState: any
  ): { showDate: boolean; showTime: boolean } {
    const mode = module.display_mode_datetime || 'auto';

    if (mode === 'auto' && entityState) {
      const hasDate = entityState.attributes?.has_date !== false;
      const hasTime = entityState.attributes?.has_time !== false;
      return { showDate: hasDate, showTime: hasTime };
    }

    switch (mode) {
      case 'date':
        return { showDate: true, showTime: false };
      case 'time':
        return { showDate: false, showTime: true };
      case 'datetime':
        return { showDate: true, showTime: true };
      default:
        return { showDate: true, showTime: true };
    }
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const dtModule = module as DatetimeInputModule;
    const lang = hass?.locale?.language || 'en';

    const entityState = dtModule.entity ? hass?.states?.[dtModule.entity] : undefined;


    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity Configuration -->
        ${this.renderSettingsSection(
          localize('editor.datetime_input.entity.title', lang, 'Entity Configuration'),
          localize(
            'editor.datetime_input.entity.desc',
            lang,
            'Link to a Home Assistant Input Datetime helper entity.'
          ),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', dtModule.entity || '',
            (value: string) => { updateModule({ entity: value }); this.triggerPreviewUpdate(); },
            ['input_datetime'],
            localize('editor.datetime_input.entity_field', lang, 'Entity')
          )}
        </div>

        <!-- Display Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.datetime_input.display.title', lang, 'Display Configuration')}
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.datetime_input.display.desc',
              lang,
              'Configure which pickers to show and how they appear.'
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.datetime_input.display_mode_datetime', lang, 'Display Mode'),
              localize(
                'editor.datetime_input.display_mode_datetime_desc',
                lang,
                'Which pickers to show. Auto detects from the entity.'
              ),
              hass,
              { display_mode_datetime: dtModule.display_mode_datetime || 'auto' },
              [this.selectField('display_mode_datetime', this.getDisplayModeOptions(lang))],
              (e: CustomEvent) => {
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.datetime_input.label', lang, 'Label'),
            localize(
              'editor.datetime_input.label_desc',
              lang,
              'Label displayed above the picker fields'
            ),
            hass,
            { label: dtModule.label || '' },
            [{ name: 'label', selector: { text: {} } }],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}

          ${this.renderFieldSection(
            localize('editor.datetime_input.show_label', lang, 'Show Label'),
            localize(
              'editor.datetime_input.show_label_desc',
              lang,
              'Display the label above the pickers'
            ),
            hass,
            { show_label: dtModule.show_label !== false },
            [{ name: 'show_label', selector: { boolean: {} } }],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
        </div>

        <!-- Styling -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.datetime_input.styling.title', lang, 'Styling')}
          </div>

          ${this.renderSliderField(
            localize('editor.datetime_input.font_size', lang, 'Font Size'),
            localize(
              'editor.datetime_input.font_size_desc',
              lang,
              'Font size of the date/time inputs in pixels'
            ),
            dtModule.font_size ?? 16,
            16,
            10,
            32,
            1,
            (value: number) => updateModule({ font_size: value }),
            'px'
          )}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.datetime_input.text_color', lang, 'Text Color')}
              .value=${dtModule.text_color || 'var(--primary-text-color)'}
              @color-changed=${(e: CustomEvent) => {
                updateModule({ text_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.datetime_input.focus_color', lang, 'Focus/Accent Color')}
              .value=${dtModule.focus_color || 'var(--primary-color)'}
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
    const dtModule = module as DatetimeInputModule;
    const lang = hass?.locale?.language || 'en';

    if (!dtModule.entity || !dtModule.entity.trim()) {
      return this.renderGradientErrorState(
        localize('editor.common.error_configure_entity', lang, 'Configure Entity'),
        localize('editor.datetime_input.error_configure_entity_desc', lang, 'Select an Input Datetime entity in the General tab'),
        'mdi:calendar-clock'
      );
    }

    const entityState = hass?.states?.[dtModule.entity];
    if (!entityState) {
      return this.renderGradientErrorState(
        localize('editor.common.error_entity_not_found', lang, 'Entity Not Found'),
        `Entity "${dtModule.entity}" is not available`,
        'mdi:alert-circle-outline'
      );
    }

    const { showDate, showTime } = this.resolveDisplayMode(dtModule, entityState);

    const dateValue = this.getDateValue(entityState);
    const timeValue = this.getTimeValue(entityState);

    const designProperties = (dtModule as any).design || {};
    const fontSize = dtModule.font_size ?? 16;
    const textColor = dtModule.text_color || 'var(--primary-text-color)';
    const focusColor = dtModule.focus_color || 'var(--primary-color)';
    const showLabel = dtModule.show_label !== false && !!dtModule.label;
    const label = dtModule.label || '';

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
        { ...dtModule, ...designProperties },
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
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    const handleDateChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.value) {
        this.setEntityDatetime(dtModule.entity!, input.value, undefined, entityState, hass);
      }
    };

    const handleTimeChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.value) {
        this.setEntityDatetime(dtModule.entity!, undefined, input.value, entityState, hass);
      }
    };

    const openPicker = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const input = target.querySelector('input') as HTMLInputElement | null;
      if (input && typeof input.showPicker === 'function') {
        try { input.showPicker(); } catch { /* browser may block if not user-gesture */ }
      }
    };

    const moduleId = dtModule.id;

    return this.wrapWithAnimation(html`
      <style>
        .datetime-input-wrapper-${moduleId} {
          display: flex;
          gap: 12px;
          align-items: stretch;
          flex-wrap: wrap;
        }
        .datetime-input-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-bottom: 6px;
          padding-left: 2px;
        }
        .datetime-input-sublabel {
          font-size: 11px;
          color: var(--secondary-text-color);
          opacity: 0.6;
          flex-shrink: 0;
          min-width: 35px;
          align-self: center;
        }
        .datetime-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .datetime-picker-field-${moduleId} {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden;
        }
        .datetime-picker-field-${moduleId}:focus-within {
          border-color: ${focusColor};
          box-shadow: 0 0 0 1px ${focusColor};
        }
        .datetime-picker-field-${moduleId}:hover {
          border-color: ${focusColor};
        }
        .datetime-picker-field-${moduleId} input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          padding: 10px 12px;
          font-size: ${fontSize}px;
          color: ${textColor};
          font-family: inherit;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
        }
        .datetime-picker-field-${moduleId} input::-webkit-calendar-picker-indicator {
          display: none;
        }
        .datetime-picker-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          color: var(--secondary-text-color);
          opacity: 0.7;
          flex-shrink: 0;
          --mdc-icon-size: 20px;
          pointer-events: none;
        }
      </style>
      <div
        class="datetime-input-module-container ${hoverEffectClass}"
        style="${designStyles}"
      >
        ${showLabel
          ? html`<div class="datetime-input-label">${label}</div>`
          : ''}
        <div class="datetime-input-wrapper-${moduleId}">
          ${showDate
            ? html`
                <div class="datetime-input-row">
                  ${showDate && showTime
                    ? html`<span class="datetime-input-sublabel">${localize('editor.datetime_input.date_label', hass?.locale?.language || 'en', 'Date')}</span>`
                    : ''}
                  <div class="datetime-picker-field-${moduleId}" @click=${openPicker}>
                    <span class="datetime-picker-icon">
                      <ha-icon icon="mdi:calendar"></ha-icon>
                    </span>
                    <input
                      type="date"
                      .value=${dateValue}
                      @change=${handleDateChange}
                    />
                  </div>
                </div>
              `
            : ''}
          ${showTime
            ? html`
                <div class="datetime-input-row">
                  ${showDate && showTime
                    ? html`<span class="datetime-input-sublabel">${localize('editor.datetime_input.time_label', hass?.locale?.language || 'en', 'Time')}</span>`
                    : ''}
                  <div class="datetime-picker-field-${moduleId}" @click=${openPicker}>
                    <span class="datetime-picker-icon">
                      <ha-icon icon="mdi:clock-outline"></ha-icon>
                    </span>
                    <input
                      type="time"
                      .value=${timeValue}
                      @change=${handleTimeChange}
                    />
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `, module, hass);
  }

  private getDateValue(entityState: any): string {
    if (!entityState) return '';

    const attrs = entityState.attributes;
    if (attrs?.year && attrs?.month && attrs?.day) {
      const y = String(attrs.year).padStart(4, '0');
      const m = String(attrs.month).padStart(2, '0');
      const d = String(attrs.day).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const state = entityState.state;
    if (state && state.includes('-')) {
      const datePart = state.split(' ')[0] || state.split('T')[0] || state;
      if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
        return datePart.substring(0, 10);
      }
    }

    return '';
  }

  private getTimeValue(entityState: any): string {
    if (!entityState) return '';

    const attrs = entityState.attributes;
    if (attrs?.hour !== undefined && attrs?.minute !== undefined) {
      const h = String(attrs.hour).padStart(2, '0');
      const min = String(attrs.minute).padStart(2, '0');
      const s = attrs.second !== undefined ? String(attrs.second).padStart(2, '0') : '00';
      return `${h}:${min}:${s}`;
    }

    const state = entityState.state;
    if (state) {
      const timePart = state.includes(' ')
        ? state.split(' ')[1]
        : state.includes('T')
          ? state.split('T')[1]
          : /^\d{2}:\d{2}/.test(state)
            ? state
            : '';
      if (timePart && /^\d{2}:\d{2}/.test(timePart)) {
        return timePart.substring(0, 8);
      }
    }

    return '';
  }

  private async setEntityDatetime(
    entity: string,
    date: string | undefined,
    time: string | undefined,
    entityState: any,
    hass: HomeAssistant
  ): Promise<void> {
    if (!entity || !hass) return;

    const hasDate = entityState?.attributes?.has_date !== false;
    const hasTime = entityState?.attributes?.has_time !== false;

    const serviceData: Record<string, any> = { entity_id: entity };

    if (hasDate && hasTime) {
      const currentDate = date || this.getDateValue(entityState);
      const currentTime = time || this.getTimeValue(entityState);
      if (currentDate && currentTime) {
        serviceData.datetime = `${currentDate} ${currentTime}`;
      } else if (currentDate) {
        serviceData.date = currentDate;
      } else if (currentTime) {
        serviceData.time = currentTime;
      }
    } else if (hasDate && date) {
      serviceData.date = date;
    } else if (hasTime && time) {
      serviceData.time = time;
    } else {
      return;
    }

    try {
      await hass.callService('input_datetime', 'set_datetime', serviceData);
    } catch (error) {
      console.error(`[DatetimeInput] Failed to set datetime for ${entity}:`, error);
    }
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }
}
