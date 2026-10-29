import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, WeatherModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';
import {
  WEATHER_STATION_SENSORS,
  WeatherStationKey,
  bearingToCardinal,
  formatWeatherReading,
  hasStationSensor,
  readWeatherValue,
  renderWindArrow,
} from '../utils/uc-weather-station';
import {
  WeatherForecastSlot,
  clearWeatherForecastCache,
  getWeatherForecast,
} from '../utils/uc-weather-forecast';

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

type ForecastSlot = WeatherForecastSlot;

/** Opt-in detail chips under the condition label, in display order. */
const EXTRA_DETAILS: Array<{
  key: WeatherStationKey;
  show: keyof WeatherModule;
  label: string;
}> = [
  { key: 'feels_like', show: 'show_feels_like', label: 'Feels like' },
  { key: 'wind_gust', show: 'show_wind_gust', label: 'Wind gust' },
  { key: 'pressure', show: 'show_pressure', label: 'Pressure' },
  { key: 'precipitation', show: 'show_precipitation', label: 'Rain' },
  { key: 'uv_index', show: 'show_uv_index', label: 'UV index' },
  { key: 'dew_point', show: 'show_dew_point', label: 'Dew point' },
];

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
      show_wind_direction: true,
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
        ${this._renderStationSensors(m, hass, config, updateModule, lang)}
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
            {
              title: localize('editor.weather.show_wind_direction', lang, 'Show wind direction'),
              description: localize(
                'editor.weather.show_wind_direction_desc',
                lang,
                'An arrow showing which way the wind blows.'
              ),
              hass,
              data: { show_wind_direction: m.show_wind_direction !== false },
              schema: [this.booleanField('show_wind_direction')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_wind_direction: e.detail.value.show_wind_direction,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSettingsSection(
          localize('editor.weather.details_section', lang, 'Extra details'),
          localize(
            'editor.weather.details_section_desc',
            lang,
            'Small values under the condition. Each turns on by itself when you pick its station sensor.'
          ),
          EXTRA_DETAILS.map(d => ({
            title: localize(`editor.weather.detail.${d.key}`, lang, d.label),
            description: '',
            hass,
            data: { [d.show]: this._isDetailShown(m, d.key, d.show) },
            schema: [this.booleanField(d.show as string)],
            onChange: (e: CustomEvent) => {
              updateModule({ [d.show]: e.detail.value[d.show as string] } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          }))
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
                  clearWeatherForecastCache(m.weather_entity);
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

  /** Shown when set on, or when unset and its station sensor is picked. */
  private _isDetailShown(m: WeatherModule, key: WeatherStationKey, show: keyof WeatherModule): boolean {
    const value = m[show];
    if (value === true || value === false) return value;
    return hasStationSensor(m, key);
  }

  private _renderStationSensors(
    m: WeatherModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section uc-weather-station-sensors"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.weather.station_section', lang, 'Weather station sensors')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize(
            'editor.weather.station_section_desc',
            lang,
            'Optional. Use your own weather station for the current values. The icon and forecast still come from the weather entity.'
          )}
        </div>
        ${WEATHER_STATION_SENSORS.map(def =>
          this.renderEntityPickerWithVariables(
            hass,
            config,
            def.field,
            (m[def.field] as string) || '',
            (value: string) => {
              updateModule({ [def.field]: value } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
            ['sensor'],
            localize(`editor.weather.sensor.${def.key}`, lang, def.label)
          )
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
    const st = entityId ? hass?.states[entityId] : undefined;
    const resolve = (id: string) => this.resolveEntity(id, config) || id;
    const tempSensorId = m.temperature_entity ? resolve(m.temperature_entity) : '';

    // A station temperature sensor is enough on its own; the forecast needs the weather entity.
    if (!st && !(tempSensorId && hass?.states[tempSensorId])) {
      return this.renderGradientErrorState(
        localize('editor.weather.config_needed', lang, 'Select a weather entity'),
        localize('editor.weather.config_needed_desc', lang, 'Choose an entity in the General tab'),
        'mdi:weather-partly-cloudy'
      );
    }

    const a = (st?.attributes || {}) as Record<string, unknown>;
    const read = (key: WeatherStationKey) => readWeatherValue(hass, a, m, key, resolve);
    const condition = st?.state || '';
    const name =
      m.name?.trim() ||
      (a.friendly_name as string) ||
      (tempSensorId ? (hass.states[tempSensorId]?.attributes?.friendly_name as string) : '') ||
      entityId;
    const tempReading = read('temperature');
    const tempUnit = tempReading?.unit || (a.temperature_unit as string) || '°';
    const temp = tempReading?.value;
    // Forecast values are in the weather entity's unit, not the station sensor's.
    const forecastUnit = (a.temperature_unit as string) || tempUnit;
    const humidity = read('humidity');
    const wind = read('wind_speed');
    const bearing = read('wind_direction');
    const extras = EXTRA_DETAILS.filter(d => this._isDetailShown(m, d.key, d.show)).flatMap(d => {
      const def = WEATHER_STATION_SENSORS.find(x => x.key === d.key);
      const reading = read(d.key);
      return def && reading ? [{ def, reading }] : [];
    });
    const direction = m.show_wind_direction !== false ? bearing?.value : undefined;

    const iconColor = m.icon_color || 'var(--primary-color)';
    const tempColor = m.temp_color || 'var(--primary-text-color)';
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--uc-pane-bg, var(--card-background-color))';

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const actionEntity = entityId || tempSensorId;

    const g = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action?.action
          ? { ...m.tap_action, entity: actionEntity }
          : { action: 'more-info', entity: actionEntity },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: actionEntity,
        module: m,
      },
      hass,
      config
    );

    const count = Math.max(1, Math.min(8, m.forecast_count ?? 5));
    const slots =
      m.show_forecast !== false && st
        ? this._getForecast(entityId, m.forecast_type || 'daily', hass).slice(0, count)
        : [];
    const showWind = m.show_wind !== false && (wind !== undefined || direction !== undefined);
    const humidityValue = m.show_humidity !== false ? humidity?.value : undefined;
    const chip = 'display:inline-flex;align-items:center;gap:3px;white-space:nowrap;';

    return html`
      <div
        class="uc-weather-wrapper ${hoverClass}"
        data-uc-role="pane"
        style="padding:16px;border-radius:var(--uc-r-12, 12px);background:${cardBg};${designStyles}"
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
                      icon=${st
                        ? CONDITION_ICONS[condition] || 'mdi:weather-partly-cloudy'
                        : 'mdi:thermometer'}
                      style="color:${iconColor};--mdc-icon-size:52px;flex-shrink:0;"
                    ></ha-icon>
                    <div style="flex:1;min-width:0;">
                      <div
                        style="color:${text};font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
                      >
                        ${name}
                      </div>
                      ${m.show_condition_label !== false && st
                        ? html`<div style="color:${secondary};font-size:13px;">
                            ${localize(
                              `editor.weather.condition.${condition}`,
                              lang,
                              CONDITION_LABELS[condition] || condition
                            )}
                          </div>`
                        : nothing}
                      ${humidityValue !== undefined || showWind || extras.length > 0
                        ? html`
                            <div
                              style="display:flex;flex-wrap:wrap;column-gap:12px;row-gap:2px;color:${secondary};font-size:12px;margin-top:4px;"
                            >
                              ${humidityValue !== undefined
                                ? html`<span style=${chip}>
                                    <ha-icon
                                      icon="mdi:water-percent"
                                      style="--mdc-icon-size:14px;"
                                    ></ha-icon>
                                    ${Math.round(humidityValue)}%
                                  </span>`
                                : nothing}
                              ${showWind
                                ? html`<span
                                    style=${chip}
                                    title=${direction !== undefined ? bearingToCardinal(direction) : ''}
                                  >
                                    <ha-icon
                                      icon="mdi:weather-windy"
                                      style="--mdc-icon-size:14px;"
                                    ></ha-icon>
                                    ${wind !== undefined ? formatWeatherReading('wind_speed', wind) : ''}
                                    ${direction !== undefined
                                      ? html`${renderWindArrow(direction, 12)}
                                          <span>${bearingToCardinal(direction)}</span>`
                                      : nothing}
                                  </span>`
                                : nothing}
                              ${extras.map(
                                x => html`<span
                                  style=${chip}
                                  title=${localize(`editor.weather.detail.${x.def.key}`, lang, x.def.label)}
                                >
                                  <ha-icon icon=${x.def.icon} style="--mdc-icon-size:14px;"></ha-icon>
                                  ${x.def.key === 'uv_index' ? 'UV ' : ''}${formatWeatherReading(
                                    x.def.key,
                                    x.reading
                                  )}
                                </span>`
                              )}
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
                    ${slots.map(slot => this._renderSlot(slot, m, forecastUnit, lang, { iconColor, text, secondary }))}
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
    hass: HomeAssistant
  ): ForecastSlot[] {
    return getWeatherForecast(hass, entityId, type, () => this.triggerPreviewUpdate());
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as WeatherModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.weather_entity && !m.temperature_entity) errors.push('Select a weather entity');
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-weather-wrapper { box-sizing: border-box; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
