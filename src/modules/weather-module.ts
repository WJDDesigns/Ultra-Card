import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, WeatherModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

const CONDITION_ICONS: Record<string, string> = {
  'clear-night': 'mdi:weather-night',
  cloudy: 'mdi:weather-cloudy',
  exceptional: 'mdi:alert-circle-outline',
  fog: 'mdi:weather-fog',
  hail: 'mdi:weather-hail',
  lightning: 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  partlycloudy: 'mdi:weather-partly-cloudy',
  pouring: 'mdi:weather-pouring',
  rainy: 'mdi:weather-rainy',
  snowy: 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  sunny: 'mdi:weather-sunny',
  windy: 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant',
};

const CONDITION_LABELS: Record<string, string> = {
  'clear-night': 'Clear night',
  cloudy: 'Cloudy',
  exceptional: 'Exceptional',
  fog: 'Fog',
  hail: 'Hail',
  lightning: 'Lightning',
  'lightning-rainy': 'Thunderstorms',
  partlycloudy: 'Partly cloudy',
  pouring: 'Pouring',
  rainy: 'Rainy',
  snowy: 'Snowy',
  'snowy-rainy': 'Snow and rain',
  sunny: 'Sunny',
  windy: 'Windy',
  'windy-variant': 'Windy',
};

interface ForecastSlot {
  datetime: string;
  condition?: string | undefined;
  temperature?: number | undefined;
  templow?: number | undefined;
}

interface ForecastCacheEntry {
  slots: ForecastSlot[];
  fetchedAt: number;
  fetching: boolean;
}

const FORECAST_TTL = 15 * 60 * 1000; // refetch every 15 minutes

export class UltraWeatherModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'weather',
    title: 'Weather',
    description: 'Current conditions and a simple forecast with clean static icons',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:weather-partly-cloudy',
    category: 'data',
    tags: ['weather', 'forecast', 'temperature', 'conditions'],
  };

  private _forecastCache: Map<string, ForecastCacheEntry> = new Map();

  createDefault(id?: string): WeatherModule {
    return {
      id: id || this.generateId('weather'),
      type: 'weather',
      weather_entity: '',
      name: '',
      show_current: true,
      show_condition_label: true,
      show_humidity: true,
      show_wind: true,
      show_forecast: true,
      forecast_type: 'daily',
      forecast_count: 5,
      icon_color: '',
      temp_color: '',
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
    return GlobalActionsTab.render(module as WeatherModule, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as WeatherModule, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as WeatherModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.weather.entity_section', lang, 'Entity'),
          localize('editor.weather.entity_section_desc', lang, 'Choose the weather source.'),
          [
            {
              title: localize('editor.weather.entity', lang, 'Weather entity'),
              description: '',
              hass,
              data: { weather_entity: m.weather_entity || '' },
              schema: [{ name: 'weather_entity', selector: { entity: { domain: 'weather' } } }],
              onChange: (e: CustomEvent) => {
                updateModule({
                  weather_entity: e.detail.value?.weather_entity ?? '',
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.weather.name', lang, 'Location name'),
              description: localize(
                'editor.weather.name_desc',
                lang,
                'Leave blank to use the entity name.'
              ),
              hass,
              data: { name: m.name || '' },
              schema: [this.textField('name')],
              onChange: (e: CustomEvent) => {
                updateModule({ name: e.detail.value.name } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSettingsSection(
          localize('editor.weather.current_section', lang, 'Current conditions'),
          localize('editor.weather.current_section_desc', lang, 'The large current weather block.'),
          [
            {
              title: localize('editor.weather.show_current', lang, 'Show current conditions'),
              description: '',
              hass,
              data: { show_current: m.show_current !== false },
              schema: [this.booleanField('show_current')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_current: e.detail.value.show_current } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.weather.show_label', lang, 'Show condition label'),
              description: '',
              hass,
              data: { show_condition_label: m.show_condition_label !== false },
              schema: [this.booleanField('show_condition_label')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_condition_label: e.detail.value.show_condition_label,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.weather.show_humidity', lang, 'Show humidity'),
              description: '',
              hass,
              data: { show_humidity: m.show_humidity !== false },
              schema: [this.booleanField('show_humidity')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_humidity: e.detail.value.show_humidity } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.weather.show_wind', lang, 'Show wind'),
              description: '',
              hass,
              data: { show_wind: m.show_wind !== false },
              schema: [this.booleanField('show_wind')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_wind: e.detail.value.show_wind } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSettingsSection(
          localize('editor.weather.forecast_section', lang, 'Forecast'),
          localize('editor.weather.forecast_section_desc', lang, 'The forecast strip below.'),
          [
            {
              title: localize('editor.weather.show_forecast', lang, 'Show forecast'),
              description: '',
              hass,
              data: { show_forecast: m.show_forecast !== false },
              schema: [this.booleanField('show_forecast')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_forecast: e.detail.value.show_forecast } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${m.show_forecast !== false
          ? html`
              ${this.renderSegmentedField(
                localize('editor.weather.forecast_type', lang, 'Forecast type'),
                '',
                m.forecast_type || 'daily',
                [
                  { value: 'daily', label: localize('editor.weather.daily', lang, 'Daily') },
                  { value: 'hourly', label: localize('editor.weather.hourly', lang, 'Hourly') },
                ],
                (next: string) => {
                  updateModule({ forecast_type: next as 'daily' | 'hourly' } as Partial<CardModule>);
                  this._forecastCache.clear();
                  this.triggerPreviewUpdate();
                }
              )}
              ${this.renderSliderField(
                localize('editor.weather.forecast_count', lang, 'Forecast items'),
                localize('editor.weather.forecast_count_desc', lang, 'Days or hours to show.'),
                m.forecast_count ?? 5,
                5,
                1,
                8,
                1,
                (value: number) => {
                  updateModule({ forecast_count: value } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                },
                ''
              )}
            `
          : nothing}
        ${this.renderColorField(
          localize('editor.weather.icon_color', lang, 'Icon color'),
          '',
          hass,
          m.icon_color || '',
          'var(--primary-color)',
          (value: string) => {
            updateModule({ icon_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.weather.temp_color', lang, 'Temperature color'),
          '',
          hass,
          m.temp_color || '',
          'var(--primary-text-color)',
          (value: string) => {
            updateModule({ temp_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.weather.card_bg', lang, 'Card background'),
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
    const m = module as WeatherModule;
    const lang = hass?.locale?.language || 'en';
    const entityId = this.resolveEntity(m.weather_entity, config) || m.weather_entity;

    if (!entityId || !hass?.states[entityId]) {
      return this.renderGradientErrorState(
        localize('editor.weather.config_needed', lang, 'Select a weather entity'),
        localize('editor.weather.config_needed_desc', lang, 'Choose an entity in the General tab'),
        'mdi:weather-partly-cloudy'
      );
    }

    const st = hass.states[entityId];
    const a = st.attributes || {};
    const condition = st.state;
    const name = m.name?.trim() || (a.friendly_name as string) || entityId;
    const tempUnit = (a.temperature_unit as string) || '°';
    const temp = typeof a.temperature === 'number' ? (a.temperature as number) : undefined;
    const humidity = typeof a.humidity === 'number' ? (a.humidity as number) : undefined;
    const wind = typeof a.wind_speed === 'number' ? (a.wind_speed as number) : undefined;
    const windUnit = (a.wind_speed_unit as string) || '';

    const iconColor = m.icon_color || 'var(--primary-color)';
    const tempColor = m.temp_color || 'var(--primary-text-color)';
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--card-background-color)';

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
      config
    );

    const count = Math.max(1, Math.min(8, m.forecast_count ?? 5));
    const slots =
      m.show_forecast !== false
        ? this._getForecast(entityId, m.forecast_type || 'daily', hass, a).slice(0, count)
        : [];

    return html`
      <div
        class="uc-weather-wrapper ${hoverClass}"
        style="padding:16px;border-radius:12px;background:${cardBg};${designStyles}"
        @pointerdown=${g.onPointerDown}
        @pointermove=${g.onPointerMove}
        @pointerup=${g.onPointerUp}
        @pointerleave=${g.onPointerLeave}
        @pointercancel=${g.onPointerCancel}
      >
        ${this.wrapWithAnimation(
          html`
            ${m.show_current !== false
              ? html`
                  <div style="display:flex;align-items:center;gap:14px;">
                    <ha-icon
                      icon=${CONDITION_ICONS[condition] || 'mdi:weather-partly-cloudy'}
                      style="color:${iconColor};--mdc-icon-size:52px;flex-shrink:0;"
                    ></ha-icon>
                    <div style="flex:1;min-width:0;">
                      <div
                        style="color:${text};font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
                      >
                        ${name}
                      </div>
                      ${m.show_condition_label !== false
                        ? html`<div style="color:${secondary};font-size:13px;">
                            ${localize(
                              `editor.weather.condition.${condition}`,
                              lang,
                              CONDITION_LABELS[condition] || condition
                            )}
                          </div>`
                        : nothing}
                      ${(m.show_humidity !== false && humidity !== undefined) ||
                      (m.show_wind !== false && wind !== undefined)
                        ? html`
                            <div
                              style="display:flex;gap:12px;color:${secondary};font-size:12px;margin-top:4px;"
                            >
                              ${m.show_humidity !== false && humidity !== undefined
                                ? html`<span style="display:inline-flex;align-items:center;gap:3px;">
                                    <ha-icon
                                      icon="mdi:water-percent"
                                      style="--mdc-icon-size:14px;"
                                    ></ha-icon>
                                    ${Math.round(humidity)}%
                                  </span>`
                                : nothing}
                              ${m.show_wind !== false && wind !== undefined
                                ? html`<span style="display:inline-flex;align-items:center;gap:3px;">
                                    <ha-icon
                                      icon="mdi:weather-windy"
                                      style="--mdc-icon-size:14px;"
                                    ></ha-icon>
                                    ${Math.round(wind)} ${windUnit}
                                  </span>`
                                : nothing}
                            </div>
                          `
                        : nothing}
                    </div>
                    ${temp !== undefined
                      ? html`<div style="flex-shrink:0;color:${tempColor};font-size:40px;font-weight:700;line-height:1;">
                          ${Math.round(temp)}<span style="font-size:20px;font-weight:500;">${tempUnit}</span>
                        </div>`
                      : nothing}
                  </div>
                `
              : nothing}
            ${slots.length > 0
              ? html`
                  <div
                    style="display:grid;grid-template-columns:repeat(${slots.length},1fr);gap:8px;margin-top:${m.show_current !== false ? '16px' : '0'};"
                  >
                    ${slots.map(slot => this._renderSlot(slot, m, tempUnit, lang, { iconColor, text, secondary }))}
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

  private _renderSlot(
    slot: ForecastSlot,
    m: WeatherModule,
    tempUnit: string,
    lang: string,
    o: { iconColor: string; text: string; secondary: string }
  ): TemplateResult {
    const isHourly = (m.forecast_type || 'daily') === 'hourly';
    let label: string;
    try {
      const d = new Date(slot.datetime);
      label = isHourly
        ? new Intl.DateTimeFormat(lang, { hour: 'numeric' }).format(d)
        : new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(d);
    } catch {
      label = '—';
    }

    return html`
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;">
        <div style="color:${o.secondary};font-size:11px;font-weight:600;text-transform:uppercase;">
          ${label}
        </div>
        <ha-icon
          icon=${CONDITION_ICONS[slot.condition || ''] || 'mdi:weather-partly-cloudy'}
          style="color:${o.iconColor};--mdc-icon-size:26px;"
        ></ha-icon>
        <div style="color:${o.text};font-size:13px;font-weight:600;">
          ${slot.temperature !== undefined ? `${Math.round(slot.temperature)}${tempUnit}` : '—'}
        </div>
        ${!isHourly && slot.templow !== undefined
          ? html`<div style="color:${o.secondary};font-size:11px;">
              ${Math.round(slot.templow)}${tempUnit}
            </div>`
          : nothing}
      </div>
    `;
  }

  /**
   * Returns forecast slots, preferring legacy forecast attributes and falling back to
   * the weather.get_forecasts service (HA 2024.3+), cached for 15 minutes.
   */
  private _getForecast(
    entityId: string,
    type: 'daily' | 'hourly',
    hass: HomeAssistant,
    attributes: Record<string, unknown>
  ): ForecastSlot[] {
    const legacy = attributes.forecast;
    if (Array.isArray(legacy) && legacy.length > 0) {
      return legacy as ForecastSlot[];
    }

    const key = `${entityId}|${type}`;
    const cached = this._forecastCache.get(key);
    const fresh = cached && Date.now() - cached.fetchedAt < FORECAST_TTL;

    if (!fresh && !cached?.fetching && hass.callWS) {
      const entry: ForecastCacheEntry = {
        slots: cached?.slots || [],
        fetchedAt: cached?.fetchedAt || 0,
        fetching: true,
      };
      this._forecastCache.set(key, entry);

      hass
        .callWS<{ response?: Record<string, { forecast?: ForecastSlot[] }> }>({
          type: 'call_service',
          domain: 'weather',
          service: 'get_forecasts',
          service_data: { type },
          target: { entity_id: entityId },
          return_response: true,
        })
        .then(resp => {
          const slots = resp?.response?.[entityId]?.forecast || [];
          this._forecastCache.set(key, { slots, fetchedAt: Date.now(), fetching: false });
          this.triggerPreviewUpdate();
        })
        .catch(() => {
          this._forecastCache.set(key, {
            slots: entry.slots,
            fetchedAt: Date.now(),
            fetching: false,
          });
        });
    }

    return cached?.slots || [];
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as WeatherModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.weather_entity) errors.push('Select a weather entity');
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-weather-wrapper { box-sizing: border-box; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
