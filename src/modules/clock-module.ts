import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ClockModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

export class UltraClockModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'clock',
    title: 'Digital Clock',
    description: 'Clean digital clock with date, 12/24h formats, and timezone support',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:clock-digital',
    category: 'content',
    tags: ['clock', 'time', 'date', 'digital', 'timezone'],
  };

  private _tickTimer: ReturnType<typeof setInterval> | null = null;
  private _tickSeconds = false;

  createDefault(id?: string): ClockModule {
    return {
      id: id || this.generateId('clock'),
      type: 'clock',
      time_format: '12',
      show_seconds: false,
      show_ampm: true,
      show_date: true,
      date_style: 'long',
      timezone: '',
      alignment: 'center',
      time_size: 48,
      date_size: 16,
      time_color: '',
      date_color: '',
      time_weight: 'bold',
      tap_action: { action: 'nothing' },
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
    return GlobalActionsTab.render(module as ClockModule, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as ClockModule, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as ClockModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSegmentedField(
          localize('editor.clock.time_format', lang, 'Time format'),
          '',
          m.time_format || '12',
          [
            { value: '12', label: localize('editor.clock.format_12', lang, '12-hour') },
            { value: '24', label: localize('editor.clock.format_24', lang, '24-hour') },
          ],
          (next: string) => {
            updateModule({ time_format: next as '12' | '24' } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSettingsSection(
          localize('editor.clock.section_display', lang, 'Display'),
          localize('editor.clock.section_display_desc', lang, 'What the clock shows.'),
          [
            {
              title: localize('editor.clock.show_seconds', lang, 'Show seconds'),
              description: localize('editor.clock.show_seconds_desc', lang, 'Tick every second.'),
              hass,
              data: { show_seconds: !!m.show_seconds },
              schema: [this.booleanField('show_seconds')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_seconds: e.detail.value.show_seconds } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.clock.show_ampm', lang, 'Show AM/PM'),
              description: localize(
                'editor.clock.show_ampm_desc',
                lang,
                'Only applies to the 12-hour format.'
              ),
              hass,
              data: { show_ampm: m.show_ampm !== false },
              schema: [this.booleanField('show_ampm')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_ampm: e.detail.value.show_ampm } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.clock.show_date', lang, 'Show date'),
              description: localize('editor.clock.show_date_desc', lang, 'Date line under the time.'),
              hass,
              data: { show_date: m.show_date !== false },
              schema: [this.booleanField('show_date')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_date: e.detail.value.show_date } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${m.show_date !== false
          ? this.renderFieldSection(
              localize('editor.clock.date_style', lang, 'Date style'),
              localize('editor.clock.date_style_desc', lang, 'How the date is written.'),
              hass,
              { date_style: m.date_style || 'long' },
              [
                this.selectField('date_style', [
                  { value: 'long', label: localize('editor.clock.date_long', lang, 'Friday, June 12') },
                  { value: 'short', label: localize('editor.clock.date_short', lang, 'Fri, Jun 12') },
                  { value: 'numeric', label: localize('editor.clock.date_numeric', lang, '6/12/2026') },
                ]),
              ],
              (e: CustomEvent) => {
                updateModule({ date_style: e.detail.value.date_style } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }
            )
          : nothing}
        ${this.renderFieldSection(
          localize('editor.clock.timezone', lang, 'Timezone'),
          localize(
            'editor.clock.timezone_desc',
            lang,
            'Optional IANA timezone (e.g. Europe/London). Leave blank for local time.'
          ),
          hass,
          { timezone: m.timezone || '' },
          [this.textField('timezone')],
          (e: CustomEvent) => {
            updateModule({ timezone: e.detail.value.timezone } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSegmentedField(
          localize('editor.clock.alignment', lang, 'Alignment'),
          '',
          m.alignment || 'center',
          [
            { value: 'left', label: localize('editor.clock.align_left', lang, 'Left'), icon: 'mdi:format-align-left' },
            { value: 'center', label: localize('editor.clock.align_center', lang, 'Center'), icon: 'mdi:format-align-center' },
            { value: 'right', label: localize('editor.clock.align_right', lang, 'Right'), icon: 'mdi:format-align-right' },
          ],
          (next: string) => {
            updateModule({ alignment: next as 'left' | 'center' | 'right' } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSliderField(
          localize('editor.clock.time_size', lang, 'Time size'),
          '',
          m.time_size ?? 48,
          48,
          16,
          160,
          1,
          (value: number) => {
            updateModule({ time_size: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          'px'
        )}
        ${this.renderSliderField(
          localize('editor.clock.date_size', lang, 'Date size'),
          '',
          m.date_size ?? 16,
          16,
          10,
          60,
          1,
          (value: number) => {
            updateModule({ date_size: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          'px'
        )}
        ${this.renderFieldSection(
          localize('editor.clock.time_weight', lang, 'Time weight'),
          '',
          hass,
          { time_weight: m.time_weight || 'bold' },
          [
            this.selectField('time_weight', [
              { value: 'normal', label: localize('editor.clock.weight_normal', lang, 'Normal') },
              { value: 'medium', label: localize('editor.clock.weight_medium', lang, 'Medium') },
              { value: 'bold', label: localize('editor.clock.weight_bold', lang, 'Bold') },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ time_weight: e.detail.value.time_weight } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.clock.time_color', lang, 'Time color'),
          '',
          hass,
          m.time_color || '',
          'var(--primary-text-color)',
          (value: string) => {
            updateModule({ time_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.clock.date_color', lang, 'Date color'),
          '',
          hass,
          m.date_color || '',
          'var(--secondary-text-color)',
          (value: string) => {
            updateModule({ date_color: value } as Partial<CardModule>);
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
    const m = module as ClockModule;
    const lang = hass?.locale?.language || 'en';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    this._ensureTick(!!m.show_seconds);

    const now = new Date();
    const tz = m.timezone?.trim() || undefined;
    const is12 = (m.time_format || '12') === '12';

    let time: string;
    let ampm = '';
    try {
      const timeParts = new Intl.DateTimeFormat(lang, {
        hour: 'numeric',
        minute: '2-digit',
        ...(m.show_seconds ? { second: '2-digit' as const } : {}),
        hour12: is12,
        ...(tz ? { timeZone: tz } : {}),
      }).formatToParts(now);
      time = timeParts
        .filter(p => p.type !== 'dayPeriod')
        .map(p => p.value)
        .join('')
        .trim();
      ampm = timeParts.find(p => p.type === 'dayPeriod')?.value || '';
    } catch {
      // Invalid timezone — fall back to local time
      time = now.toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit', hour12: is12 });
    }

    let date = '';
    if (m.show_date !== false) {
      const style = m.date_style || 'long';
      const opts: Intl.DateTimeFormatOptions =
        style === 'long'
          ? { weekday: 'long', month: 'long', day: 'numeric' }
          : style === 'short'
            ? { weekday: 'short', month: 'short', day: 'numeric' }
            : { year: 'numeric', month: 'numeric', day: 'numeric' };
      try {
        date = new Intl.DateTimeFormat(lang, { ...opts, ...(tz ? { timeZone: tz } : {}) }).format(now);
      } catch {
        date = new Intl.DateTimeFormat(lang, opts).format(now);
      }
    }

    const align = m.alignment || 'center';
    const timeColor = m.time_color || 'var(--primary-text-color)';
    const dateColor = m.date_color || 'var(--secondary-text-color)';
    const weight = m.time_weight === 'normal' ? '400' : m.time_weight === 'medium' ? '600' : '700';

    const g = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action,
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        module: m,
      },
      hass,
      config
    );

    return html`
      <div
        class="uc-clock-wrapper ${hoverClass}"
        style="text-align:${align};${designStyles}"
        @pointerdown=${g.onPointerDown}
        @pointermove=${g.onPointerMove}
        @pointerup=${g.onPointerUp}
        @pointerleave=${g.onPointerLeave}
        @pointercancel=${g.onPointerCancel}
      >
        ${this.wrapWithAnimation(
          html`
            <div
              style="font-size:${m.time_size ?? 48}px;font-weight:${weight};color:${timeColor};line-height:1.1;font-variant-numeric:tabular-nums;"
            >
              ${time}${is12 && m.show_ampm !== false && ampm
                ? html`<span
                    style="font-size:${Math.round((m.time_size ?? 48) * 0.4)}px;font-weight:600;margin-left:6px;vertical-align:baseline;"
                    >${ampm}</span
                  >`
                : nothing}
            </div>
            ${date
              ? html`<div style="font-size:${m.date_size ?? 16}px;color:${dateColor};margin-top:4px;">
                  ${date}
                </div>`
              : nothing}
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  /** Re-render once per minute (or per second when seconds are shown) to keep the time fresh. */
  private _ensureTick(needSeconds: boolean): void {
    if (this._tickTimer && this._tickSeconds === needSeconds) return;
    if (this._tickTimer) clearInterval(this._tickTimer);
    this._tickSeconds = needSeconds;
    this._tickTimer = setInterval(
      () => this.triggerPreviewUpdate(),
      needSeconds ? 1000 : 15000
    );
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-clock-wrapper { box-sizing: border-box; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
