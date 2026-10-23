import { TemplateResult, html, nothing, svg } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, AnimatedForecastModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { renderAnimatedForecastModuleEditor } from './animated-forecast-module-editor';
import { localize } from '../localize/localize';
import {
  WeatherForecastSlot,
  forecastDayKey,
  getWeatherForecast,
} from '../utils/uc-weather-forecast';
import type { AnimatedForecastChartMetric } from '../types';

/** Which day each module is showing hours for (null = daily view). */
const openDays = new Map<string, string | null>();

const CHART_METRIC_LABELS: Record<AnimatedForecastChartMetric, string> = {
  precipitation_probability: 'Chance of rain',
  precipitation: 'Rain amount',
  uv_index: 'UV index',
  temperature: 'Temperature',
  wind_speed: 'Wind speed',
};

export class UltraAnimatedForecastModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'animated_forecast',
    title: 'Animated Forecast',
    description: 'Multi-day weather forecast with animated icons',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:weather-cloudy',
    category: 'content',
    tags: ['weather', 'forecast', 'pro', 'premium', 'animated'],
  };

  createDefault(id?: string, hass?: HomeAssistant): AnimatedForecastModule {
    // Auto-detect suitable weather entity
    const autoWeatherEntity = this._findWeatherEntity(hass);

    return {
      id: id || this.generateId('animated_forecast'),
      type: 'animated_forecast',

      // Entity Configuration
      weather_entity: autoWeatherEntity,
      forecast_entity: '',

      // Configuration
      forecast_days: 5,
      allow_wrap: true, // Allow forecast days to wrap to new rows

      // Styling - Text Sizes
      forecast_day_size: 14,
      forecast_temp_size: 14,

      // Styling - Icon
      forecast_icon_size: 48,
      icon_style: 'fill',

      // Styling - Colors
      text_color: 'var(--primary-text-color)',
      accent_color: 'var(--primary-color)',
      forecast_day_color: 'var(--primary-text-color)',
      forecast_temp_color: 'var(--primary-text-color)',

      // Styling - Background
      forecast_background: 'rgba(var(--rgb-primary-text-color), 0.05)',

      // Standard Ultra Card properties
      tap_action: undefined,
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  /**
   * Find a suitable weather entity from Home Assistant
   */
  private _findWeatherEntity(hass?: HomeAssistant): string {
    if (!hass) return '';

    // Look for weather.* entities
    const weatherEntities = Object.keys(hass.states).filter(id => id.startsWith('weather.'));

    return weatherEntities.length > 0 ? weatherEntities[0] : '';
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return renderAnimatedForecastModuleEditor(this, module, hass, config, updateModule);
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const forecastModule = module as AnimatedForecastModule;
    const moduleWithDesign = forecastModule as any;
    const designFromDesignObject = (forecastModule as any).design || {};
    const lang = hass?.locale?.language || 'en';

    // Create merged design properties object that prioritizes top-level properties (where Global Design saves)
    // over design object properties, and includes all properties needed by the container styles
    const designProperties = {
      // Text properties - prioritize top-level (where Global Design saves them)
      color: (forecastModule as any).color || designFromDesignObject.color,
      // Container properties - also check both locations
      background_color:
        (forecastModule as any).background_color || designFromDesignObject.background_color,
      background_image:
        (forecastModule as any).background_image || designFromDesignObject.background_image,
      background_image_type:
        (forecastModule as any).background_image_type ||
        designFromDesignObject.background_image_type,
      background_image_entity:
        (forecastModule as any).background_image_entity ||
        designFromDesignObject.background_image_entity,
      background_image_upload:
        (forecastModule as any).background_image_upload ||
        designFromDesignObject.background_image_upload,
      background_image_url:
        (forecastModule as any).background_image_url || designFromDesignObject.background_image_url,
      background_size:
        (forecastModule as any).background_size || designFromDesignObject.background_size,
      background_position:
        (forecastModule as any).background_position || designFromDesignObject.background_position,
      background_repeat:
        (forecastModule as any).background_repeat || designFromDesignObject.background_repeat,
      padding_top:
        designFromDesignObject.padding_top !== undefined
          ? designFromDesignObject.padding_top
          : (forecastModule as any).padding_top,
      padding_bottom:
        designFromDesignObject.padding_bottom !== undefined
          ? designFromDesignObject.padding_bottom
          : (forecastModule as any).padding_bottom,
      padding_left:
        designFromDesignObject.padding_left !== undefined
          ? designFromDesignObject.padding_left
          : (forecastModule as any).padding_left,
      padding_right:
        designFromDesignObject.padding_right !== undefined
          ? designFromDesignObject.padding_right
          : (forecastModule as any).padding_right,
      margin_top:
        designFromDesignObject.margin_top !== undefined
          ? designFromDesignObject.margin_top
          : (forecastModule as any).margin_top,
      margin_bottom:
        designFromDesignObject.margin_bottom !== undefined
          ? designFromDesignObject.margin_bottom
          : (forecastModule as any).margin_bottom,
      margin_left:
        designFromDesignObject.margin_left !== undefined
          ? designFromDesignObject.margin_left
          : (forecastModule as any).margin_left,
      margin_right:
        designFromDesignObject.margin_right !== undefined
          ? designFromDesignObject.margin_right
          : (forecastModule as any).margin_right,
      border_radius:
        (forecastModule as any).border_radius || designFromDesignObject.border_radius,
      border_style:
        (forecastModule as any).border_style || designFromDesignObject.border_style,
      border_width:
        (forecastModule as any).border_width || designFromDesignObject.border_width,
      border_color:
        (forecastModule as any).border_color || designFromDesignObject.border_color,
    };

    const weatherData = this._getWeatherData(hass, forecastModule);
    const iconStyle = forecastModule.icon_style || 'fill';

    // Get temperature unit from weather entity (no conversion needed)
    const tempUnit = weatherData.temperatureUnit;

    // Action handlers for tap, hold, and double-tap
    let holdTimeout: any = null;
    let clickTimeout: any = null;
    let isHolding = false;
    let clickCount = 0;
    let lastClickTime = 0;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isHolding = false;
      holdTimeout = setTimeout(() => {
        isHolding = true;
        if (!forecastModule.hold_action || forecastModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            (forecastModule.hold_action as any) || ({ action: 'default' } as any),
            hass,
            e.target as HTMLElement,
            config,
            (forecastModule as any).entity,
            forecastModule
          );
        }
      }, 500);
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }

      if (isHolding) {
        isHolding = false;
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;

      if (timeSinceLastClick < 300 && clickCount === 1) {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickCount = 0;

        if (
          !forecastModule.double_tap_action ||
          forecastModule.double_tap_action.action !== 'nothing'
        ) {
          UltraLinkComponent.handleAction(
            (forecastModule.double_tap_action as any) || ({ action: 'default' } as any),
            hass,
            e.target as HTMLElement,
            config,
            (forecastModule as any).entity,
            forecastModule
          );
        }
      } else {
        clickCount = 1;
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
          clickCount = 0;

          if (!forecastModule.tap_action || forecastModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (forecastModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config,
              (forecastModule as any).entity,
              forecastModule
            );
          }
        }, 300);
      }
    };

    const hasActions =
      (forecastModule.tap_action && forecastModule.tap_action.action !== 'nothing') ||
      (forecastModule.hold_action && forecastModule.hold_action.action !== 'nothing') ||
      (forecastModule.double_tap_action && forecastModule.double_tap_action.action !== 'nothing');

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const forecastLayoutStyles = `box-sizing: border-box; cursor: ${hasActions ? 'pointer' : 'default'};`;

    // Apply text color override from global design - if set, override all text colors
    const globalTextColor = designProperties.color;
    const forecastDayColor = globalTextColor || forecastModule.forecast_day_color || 'var(--primary-text-color)';
    const forecastTempColor = globalTextColor || forecastModule.forecast_temp_color || 'var(--primary-text-color)';

    // Container styles for design system integration - properly handle global design properties
    const containerStyles = {
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : undefined,
      // Margin - fully controllable via Design tab, no forced defaults
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '0px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '0px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '0px',
      background:
        designProperties.background_color || moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position ||
        moduleWithDesign.background_position ||
        'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width || moduleWithDesign.border_width) || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : undefined,
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || undefined,
      boxSizing: 'border-box',
      // Add cursor pointer when actions are configured
      cursor: hasActions ? 'pointer' : 'default',
    };

    return this.wrapWithAnimation(html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="${hoverClass}"
        style="${designStyles}; ${forecastLayoutStyles}"
        @pointerdown=${handlePointerDown}
        @pointerup=${handlePointerUp}
      >
        <div
          class="animated-forecast-module-container"
          style="
            --forecast-days: ${weatherData.columns};
            --forecast-day-size: ${forecastModule.forecast_day_size || 14}px;
            --forecast-temp-size: ${forecastModule.forecast_temp_size || 14}px;
            --forecast-icon-size: ${forecastModule.forecast_icon_size || 48}px;
            --forecast-day-color: ${forecastDayColor};
            --forecast-temp-color: ${forecastTempColor};
            --forecast-background: ${forecastModule.forecast_background ||
        'rgba(var(--rgb-primary-text-color), 0.05)'};
            --forecast-allow-wrap: ${forecastModule.allow_wrap === false ? 'column' : 'row'};
            overflow: visible;
            max-width: 100%;
            box-sizing: border-box;
          "
        >
        ${this._renderForecastBody(forecastModule, hass, weatherData, iconStyle, lang)}
      </div>
    `, module, hass);
  }

  private _renderForecastBody(
    module: AnimatedForecastModule,
    hass: HomeAssistant,
    data: ReturnType<UltraAnimatedForecastModule['_getWeatherData']>,
    iconStyle: string,
    lang: string
  ): TemplateResult {
    if (data.slots.length === 0 && !data.openDay) {
      return html`<div class="weather-forecast">
        <div style="text-align: center; opacity: 0.6; padding: 16px; grid-column: 1 / -1;">
          ${localize('editor.animated_forecast.preview.no_data', lang, 'No forecast data available')}
        </div>
      </div>`;
    }

    const isHourly = data.view === 'hourly';
    const canOpenDay = !isHourly && module.day_tap_hourly === true;
    const stop = (e: Event) => e.stopPropagation();
    const openDay = (e: Event, day: string) => {
      e.stopPropagation();
      openDays.set(module.id, day);
      this.triggerPreviewUpdate(true);
    };
    const closeDay = (e: Event) => {
      e.stopPropagation();
      openDays.set(module.id, null);
      this.triggerPreviewUpdate(true);
    };

    return html`
      <div class="weather-forecast">
        ${data.openDay
          ? html`
              <div class="forecast-hourly-header" @pointerdown=${stop}>
                <button class="forecast-back" type="button" @pointerup=${closeDay} @click=${stop}>
                  <ha-icon icon="mdi:chevron-left"></ha-icon>
                  ${localize('editor.animated_forecast.back', lang, 'Back')}
                </button>
                <span class="forecast-hourly-title">
                  ${new Date(`${data.openDay}T12:00:00`).toLocaleDateString(lang, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            `
          : nothing}
        ${data.slots.length === 0
          ? html`<div style="text-align: center; opacity: 0.6; padding: 16px; grid-column: 1 / -1;">
              ${localize('editor.animated_forecast.preview.no_hourly', lang, 'No hourly forecast for this day')}
            </div>`
          : nothing}
        ${data.slots.map((slot: WeatherForecastSlot) => {
          const date = new Date(slot.datetime);
          const label = isHourly
            ? date.toLocaleTimeString(lang, { hour: 'numeric' })
            : date.toLocaleDateString(lang, { weekday: 'short' });
          const high = typeof slot.temperature === 'number' ? Math.round(slot.temperature) : undefined;
          const low =
            high !== undefined ? Math.round(slot.templow ?? (slot.temperature as number) - 10) : undefined;
          const dayKey = forecastDayKey(slot.datetime);
          return html`
            <div
              class="forecast-day ${canOpenDay ? 'tappable' : ''}"
              role=${canOpenDay ? 'button' : nothing}
              tabindex=${canOpenDay ? '0' : nothing}
              @pointerdown=${canOpenDay ? stop : nothing}
              @pointerup=${canOpenDay ? (e: Event) => openDay(e, dayKey) : nothing}
              @keydown=${canOpenDay
                ? (e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openDay(e, dayKey);
                    }
                  }
                : nothing}
            >
              <div class="forecast-day-name">${label}</div>
              <img
                src="${this._getWeatherIcon(slot.condition || '', iconStyle)}"
                alt="${slot.condition || ''}"
                class="forecast-icon meteocon-icon"
              />
              <div class="forecast-temps">
                <span class="forecast-high">${high !== undefined ? `${high}°` : '—'}</span>
                ${!isHourly && low !== undefined
                  ? html`<span class="forecast-low">${low}°</span>`
                  : nothing}
              </div>
            </div>
          `;
        })}
        ${module.show_chart === true ? this._renderChartRows(module, data.slots, lang) : nothing}
      </div>
    `;
  }

  /** One small bar or line row per metric, lined up with the forecast columns. */
  private _renderChartRows(
    module: AnimatedForecastModule,
    slots: WeatherForecastSlot[],
    lang: string
  ): TemplateResult | typeof nothing {
    const metrics = (module.chart_metrics?.length
      ? module.chart_metrics
      : ['precipitation_probability']) as AnimatedForecastChartMetric[];
    const height = module.chart_height || 48;
    const color = module.chart_color || module.accent_color || 'var(--primary-color)';
    const style = module.chart_style || 'bar';

    const rows = metrics
      .map(metric => {
        const values = slots.map(slot => {
          const v = slot[metric];
          const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
          return Number.isFinite(n) ? n : undefined;
        });
        return { metric, values };
      })
      .filter(row => row.values.some(v => v !== undefined));
    if (rows.length === 0) return nothing;

    return html`
      ${rows.map(({ metric, values }) => {
        const present = values.filter((v): v is number => v !== undefined);
        let min = 0;
        let max: number;
        if (metric === 'precipitation_probability') max = 100;
        else if (metric === 'uv_index') max = Math.max(11, ...present);
        else if (metric === 'temperature') {
          min = Math.min(...present);
          max = Math.max(...present);
        } else max = Math.max(...present);
        if (max <= min) max = min + 1;
        const ratio = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));
        const fmt = (v: number) =>
          metric === 'precipitation_probability'
            ? `${Math.round(v)}%`
            : metric === 'temperature'
              ? `${Math.round(v)}°`
              : metric === 'precipitation' || metric === 'uv_index'
                ? `${Math.round(v * 10) / 10}`
                : `${Math.round(v)}`;
        const label = localize(
          `editor.animated_forecast.metric.${metric}`,
          lang,
          CHART_METRIC_LABELS[metric]
        );

        if (style === 'line') {
          const n = values.length;
          const points = values
            .map((v, i) =>
              v === undefined ? null : `${((i + 0.5) / n) * 100},${(1 - ratio(v)) * 90 + 5}`
            )
            .filter(Boolean)
            .join(' ');
          return html`
            <div class="forecast-chart-row" aria-label=${label}>
              <div class="forecast-chart-label">${label}</div>
              <div class="forecast-chart-line" style="height:${height}px;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  ${svg`<polyline points=${points} fill="none" stroke=${color} stroke-width="2"
                    vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></polyline>`}
                </svg>
              </div>
              ${values.map(
                v => html`<div class="forecast-chart-value">${v !== undefined ? fmt(v) : ''}</div>`
              )}
            </div>
          `;
        }

        return html`
          <div class="forecast-chart-row" aria-label=${label}>
            <div class="forecast-chart-label">${label}</div>
            ${values.map(
              v => html`
                <div class="forecast-chart-cell">
                  <div class="forecast-chart-track" style="height:${height}px;">
                    ${v !== undefined
                      ? html`<div
                          class="forecast-chart-bar"
                          style="height:${Math.max(2, ratio(v) * 100)}%;background:${color};"
                        ></div>`
                      : nothing}
                  </div>
                  <div class="forecast-chart-value">${v !== undefined ? fmt(v) : ''}</div>
                </div>
              `
            )}
          </div>
        `;
      })}
    `;
  }

  /**
   * Helper method to convert style object to CSS string
   */
  private objectToStyleString(styles: Record<string, any>): string {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }

  /**
   * Helper method to get background image CSS
   */
  private getBackgroundImageCSS(moduleWithDesign: any, hass?: HomeAssistant): string {
    const backgroundType = moduleWithDesign.background_image_type || 'none';

    if (backgroundType === 'entity' && moduleWithDesign.background_image_entity && hass) {
      const entity = hass.states[moduleWithDesign.background_image_entity];
      if (entity && entity.attributes.entity_picture) {
        return `url('${entity.attributes.entity_picture}')`;
      }
    } else if (backgroundType === 'upload' && moduleWithDesign.background_image_upload) {
      return `url('${moduleWithDesign.background_image_upload}')`;
    } else if (backgroundType === 'url' && moduleWithDesign.background_image_url) {
      return `url('${moduleWithDesign.background_image_url}')`;
    }

    return '';
  }

  /**
   * Forecast slots for the current view: days, the next hours, or the hours
   * of the day the user tapped.
   */
  private _getWeatherData(hass: HomeAssistant, module: AnimatedForecastModule) {
    const weatherEntity = hass.states[module.weather_entity || ''];
    const days = Math.max(3, Math.min(7, module.forecast_days || 5));
    const hours = Math.max(3, Math.min(12, module.forecast_hours || 8));
    const repaint = () => this.triggerPreviewUpdate();

    let daily: WeatherForecastSlot[] = [];
    // Some integrations use a separate forecast entity
    const separate = module.forecast_entity
      ? hass.states[module.forecast_entity]?.attributes?.forecast
      : undefined;
    if (!weatherEntity?.attributes?.forecast?.length && Array.isArray(separate) && separate.length) {
      daily = separate as WeatherForecastSlot[];
    } else if (module.weather_entity) {
      daily = getWeatherForecast(hass, module.weather_entity, 'daily', repaint);
    }

    const openDay = module.forecast_type !== 'hourly' && module.day_tap_hourly === true
      ? openDays.get(module.id) || null
      : null;
    const view: 'daily' | 'hourly' = module.forecast_type === 'hourly' || openDay ? 'hourly' : 'daily';

    let slots: WeatherForecastSlot[];
    if (view === 'hourly' && module.weather_entity) {
      const hourly = getWeatherForecast(hass, module.weather_entity, 'hourly', repaint);
      const now = Date.now() - 60 * 60 * 1000;
      const upcoming = hourly.filter(s => new Date(s.datetime).getTime() >= now);
      slots = (openDay ? upcoming.filter(s => forecastDayKey(s.datetime) === openDay) : upcoming).slice(
        0,
        hours
      );
    } else {
      slots = daily.slice(0, days);
    }

    // Get temperature unit from weather entity attributes
    const temperatureUnit = weatherEntity?.attributes?.temperature_unit || '°F';

    return {
      slots,
      view,
      openDay,
      columns: Math.max(1, slots.length || days),
      temperatureUnit: temperatureUnit,
    };
  }

  /**
   * Get Meteocons icon name for weather condition
   * Icons from https://github.com/basmilius/weather-icons
   */
  private _getWeatherIcon(condition: string, iconStyle: string = 'fill'): string {
    const iconMap: Record<string, string> = {
      'clear-night': 'clear-night',
      'clear-day': 'clear-day',
      cloudy: 'cloudy',
      exceptional: 'not-available',
      fog: 'fog',
      hail: 'hail',
      lightning: 'thunderstorms',
      'lightning-rainy': 'thunderstorms-rain',
      partlycloudy: 'partly-cloudy-day',
      'partly-cloudy-night': 'partly-cloudy-night',
      pouring: 'extreme-rain',
      rainy: 'rain',
      snowy: 'snow',
      'snowy-rainy': 'sleet',
      sunny: 'clear-day',
      windy: 'wind',
      'windy-variant': 'extreme-wind',
    };

    // Map Home Assistant conditions to Meteocons
    const iconName = iconMap[condition] || 'partly-cloudy-day';

    // Return CDN URL for Meteocons animated SVG from dev branch
    return `https://cdn.jsdelivr.net/gh/basmilius/weather-icons@dev/production/${iconStyle}/svg/${iconName}.svg`;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .animated-forecast-module-container {
        padding: 0;
        width: 100%;
        box-sizing: border-box;
      }

      /* ========== FORECAST ========== */
      .weather-forecast {
        display: grid;
        grid-template-columns: repeat(var(--forecast-days, 5), minmax(0, 1fr));
        grid-auto-flow: var(--forecast-allow-wrap, row);
        gap: 16px;
        padding: 20px 16px 16px 16px;
        background: var(--forecast-background);
        border-radius: var(--uc-r-12, 12px);
      }

      .forecast-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .forecast-day-name {
        font-size: var(--forecast-day-size);
        font-weight: 600;
        color: var(--forecast-day-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .forecast-icon {
        width: var(--forecast-icon-size);
        height: var(--forecast-icon-size);
      }

      .meteocon-icon {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .forecast-temps {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        font-size: var(--forecast-temp-size);
        color: var(--forecast-temp-color);
      }

      .forecast-high {
        font-weight: 600;
      }

      .forecast-day.tappable {
        cursor: pointer;
        border-radius: var(--uc-r-8, 8px);
        transition: background 0.15s;
      }

      .forecast-day.tappable:hover,
      .forecast-day.tappable:focus-visible {
        background: rgba(var(--rgb-primary-text-color, 127, 127, 127), 0.08);
        outline: none;
      }

      .forecast-hourly-header {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--forecast-day-color);
        font-size: var(--forecast-day-size);
      }

      .forecast-back {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 4px 10px 4px 4px;
        border: none;
        border-radius: var(--uc-r-16, 16px);
        background: rgba(var(--rgb-primary-text-color, 127, 127, 127), 0.1);
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .forecast-back ha-icon {
        --mdc-icon-size: 18px;
      }

      .forecast-hourly-title {
        font-weight: 600;
      }

      /* Chart rows: a sub-grid so cells line up with the forecast columns */
      .forecast-chart-row {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(var(--forecast-days, 5), minmax(0, 1fr));
        grid-template-columns: subgrid;
        column-gap: 16px;
        position: relative;
        row-gap: 2px;
      }

      .forecast-chart-label {
        grid-column: 1 / -1;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--forecast-day-color);
        opacity: 0.7;
      }

      .forecast-chart-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .forecast-chart-track {
        width: 100%;
        max-width: 28px;
        display: flex;
        align-items: flex-end;
        border-radius: var(--uc-r-4, 4px);
        background: rgba(var(--rgb-primary-text-color, 127, 127, 127), 0.06);
        overflow: hidden;
      }

      .forecast-chart-bar {
        width: 100%;
        border-radius: var(--uc-r-4, 4px) var(--uc-r-4, 4px) 0 0;
      }

      .forecast-chart-line {
        grid-column: 1 / -1;
      }

      .forecast-chart-line svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }

      .forecast-chart-value {
        font-size: 11px;
        text-align: center;
        color: var(--forecast-temp-color);
        opacity: 0.85;
      }

      .forecast-low {
        opacity: 0.7;
      }

      /* ========== RESPONSIVE ========== */
      @media (max-width: 768px) {
        .animated-forecast-module-container {
          transform: scale(min(1, calc(100vw / 600)));
          transform-origin: top center;
        }
      }
    `;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const forecastModule = module as AnimatedForecastModule;

    if (!forecastModule.weather_entity) {
      errors.push('Weather entity is required for forecast data');
    }

    if (
      forecastModule.forecast_hours &&
      (forecastModule.forecast_hours < 3 || forecastModule.forecast_hours > 12)
    ) {
      errors.push('Forecast hours must be between 3 and 12');
    }

    if (
      forecastModule.forecast_days &&
      (forecastModule.forecast_days < 3 || forecastModule.forecast_days > 7)
    ) {
      errors.push('Forecast days must be between 3 and 7');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
