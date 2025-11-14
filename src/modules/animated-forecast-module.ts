import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, AnimatedForecastModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { renderAnimatedForecastModuleEditor } from './animated-forecast-module-editor';

export class UltraAnimatedForecastModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'animated_forecast',
    title: 'Animated Forecast (PRO)',
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
            config
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
            config
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
              config
            );
          }
        }, 300);
      }
    };

    const hasActions =
      (forecastModule.tap_action && forecastModule.tap_action.action !== 'nothing') ||
      (forecastModule.hold_action && forecastModule.hold_action.action !== 'nothing') ||
      (forecastModule.double_tap_action && forecastModule.double_tap_action.action !== 'nothing');

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
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '8px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '8px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '8px 0',
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

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        style=${this.objectToStyleString(containerStyles)}
        @pointerdown=${handlePointerDown}
        @pointerup=${handlePointerUp}
      >
        <div
          class="animated-forecast-module-container"
          style="
            --forecast-days: ${forecastModule.forecast_days || 5};
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
        <div class="weather-forecast">
          ${weatherData.forecast && weatherData.forecast.length > 0
            ? weatherData.forecast.slice(0, forecastModule.forecast_days || 5).map((day: any) => {
                const dayDate = new Date(day.datetime);
                const dayName = dayDate.toLocaleDateString(hass.locale?.language || 'en', {
                  weekday: 'short',
                });
                // Use temperatures directly from forecast (already in correct unit)
                const fHighTemp = Math.round(day.temperature);
                const fLowTemp = Math.round(day.templow ?? day.temperature - 10);

                return html`
                  <div class="forecast-day">
                    <div class="forecast-day-name">${dayName}</div>
                    <img
                      src="${this._getWeatherIcon(day.condition, iconStyle)}"
                      alt="${day.condition}"
                      class="forecast-icon meteocon-icon"
                    />
                    <div class="forecast-temps">
                      <span class="forecast-high">${fHighTemp}°</span>
                      <span class="forecast-low">${fLowTemp}°</span>
                    </div>
                  </div>
                `;
              })
            : html`<div style="text-align: center; opacity: 0.6; padding: 16px;">
                No forecast data available
              </div>`}
        </div>
      </div>
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
   * Helper method to add pixel unit if needed
   */
  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (
      typeof value === 'string' &&
      (value.includes('px') ||
        value.includes('%') ||
        value.includes('em') ||
        value.includes('rem') ||
        value.includes('vh') ||
        value.includes('vw'))
    ) {
      return value;
    }
    return `${value}px`;
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
   * Get weather data from entities
   */
  private _getWeatherData(hass: HomeAssistant, module: AnimatedForecastModule) {
    const weatherEntity = hass.states[module.weather_entity || ''];

    // Try to get forecast from different possible locations
    let forecast = weatherEntity?.attributes?.forecast || [];

    // Some integrations use a separate forecast entity
    if (forecast.length === 0 && module.forecast_entity) {
      const forecastEntity = hass.states[module.forecast_entity];
      forecast = forecastEntity?.attributes?.forecast || [];
    }

    // PirateWeather and some integrations store it differently
    if (forecast.length === 0 && weatherEntity) {
      // Try alternative attribute names
      forecast =
        weatherEntity.attributes?.['forecast_daily'] ||
        weatherEntity.attributes?.['daily'] ||
        weatherEntity.attributes?.['forecasts'] ||
        [];
    }

    // If still no forecast, try fetching via service (HA 2024.3+)
    if (forecast.length === 0 && module.weather_entity && hass?.callWS) {
      this._fetchForecastData(hass, module);
    }

    // Get temperature unit from weather entity attributes
    const temperatureUnit = weatherEntity?.attributes?.temperature_unit || '°F';

    return {
      forecast: forecast,
      temperatureUnit: temperatureUnit,
    };
  }

  /**
   * Fetch forecast data via weather service (for HA 2024.3+)
   */
  private async _fetchForecastData(
    hass: HomeAssistant,
    module: AnimatedForecastModule
  ): Promise<void> {
    if (!module.weather_entity || !hass?.callWS) return;

    try {
      const response = (await hass.callWS({
        type: 'call_service',
        domain: 'weather',
        service: 'get_forecasts',
        service_data: {
          type: 'daily',
        },
        target: {
          entity_id: module.weather_entity,
        },
        return_response: true,
      })) as any;

      const forecastData = response?.response?.[module.weather_entity]?.forecast;

      if (forecastData && Array.isArray(forecastData) && forecastData.length > 0) {
        // Store forecast in the entity's attributes temporarily for next render
        const weatherEntity = hass.states[module.weather_entity];
        if (weatherEntity && weatherEntity.attributes) {
          weatherEntity.attributes.forecast = forecastData;
        }
        // Trigger a re-render
        setTimeout(() => this.triggerPreviewUpdate(), 100);
      }
    } catch (error) {
      console.debug('Ultra Card Forecast: Could not fetch forecast via service:', error);
    }
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
      .animated-forecast-module-container {
        padding: clamp(12px, 2.5%, 20px) clamp(12px, 2%, 16px);
        width: 100%;
        box-sizing: border-box;
      }

      /* ========== FORECAST ========== */
      .weather-forecast {
        display: grid;
        grid-template-columns: repeat(var(--forecast-days, 5), 1fr);
        grid-auto-flow: var(--forecast-allow-wrap, row);
        gap: 16px;
        padding: 20px 16px 16px 16px;
        background: var(--forecast-background);
        border-radius: 12px;
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

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const forecastModule = module as AnimatedForecastModule;

    if (!forecastModule.weather_entity) {
      errors.push('Weather entity is required for forecast data');
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
