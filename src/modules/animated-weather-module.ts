import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, AnimatedWeatherModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { renderAnimatedWeatherModuleEditor } from './animated-weather-module-editor';

export class UltraAnimatedWeatherModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'animated_weather',
    title: 'Animated Weather (PRO)',
    description: 'Current weather display with animated icons',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:weather-partly-cloudy',
    category: 'content',
    tags: ['weather', 'current', 'pro', 'premium', 'animated'],
  };

  createDefault(id?: string, hass?: HomeAssistant): AnimatedWeatherModule {
    // Auto-detect suitable weather entity
    const autoWeatherEntity = this._findWeatherEntity(hass);

    return {
      id: id || this.generateId('animated_weather'),
      type: 'animated_weather',

      // Entity Configuration
      weather_entity: autoWeatherEntity,
      temperature_entity: '',
      condition_entity: '',
      custom_entity: '',
      custom_entity_name: '',

      // Column Display Toggles
      show_left_column: true,
      show_center_column: true,
      show_right_column: true,

      // Layout Configuration
      column_gap: 12,
      left_column_gap: 8,
      right_column_gap: 8,

      // Location Configuration
      location_override_mode: 'text',
      location_name: '',
      location_entity: '',

      // Left Column Display Toggles
      show_location: true,
      show_condition: true,
      show_custom_entity: true,

      // Right Column Display Toggles
      show_date: true,
      show_temperature: true,
      show_temp_range: true,

      // Left Column - Text Sizes
      location_size: 16,
      condition_size: 24,
      custom_entity_size: 18,

      // Left Column - Colors
      location_color: 'var(--primary-text-color)',
      condition_color: 'var(--primary-text-color)',
      custom_entity_color: 'var(--primary-text-color)',

      // Center Column - Icon Styling
      main_icon_size: 120,
      icon_style: 'fill',

      // Right Column - Text Sizes
      date_size: 16,
      temperature_size: 64,
      temp_range_size: 18,

      // Right Column - Colors
      date_color: 'var(--primary-text-color)',
      temperature_color: 'var(--primary-text-color)',
      temp_range_color: 'var(--primary-text-color)',

      // Styling - Backgrounds
      module_background: 'transparent',
      module_border: 'transparent',

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
    return renderAnimatedWeatherModuleEditor(this, module, hass, config, updateModule);
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const weatherModule = module as AnimatedWeatherModule;
    const weatherData = this._getWeatherData(hass, weatherModule);
    const now = new Date();

    // Format date
    const dateStr = now.toLocaleDateString(hass.locale?.language || 'en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    // Get temperature unit from weather entity
    const tempUnit = weatherData.temperatureUnit;

    // Use temperatures directly from the weather entity (already in correct unit)
    const temp = Math.round(weatherData.temperature);

    // Styling
    const iconStyle = weatherModule.icon_style || 'fill';

    // Get high/low temps for today
    const todayForecast = weatherData.forecast[0];
    const highTemp = todayForecast ? Math.round(todayForecast.temperature) : temp;
    const lowTemp = todayForecast
      ? Math.round(todayForecast.templow ?? todayForecast.temperature - 10)
      : temp - 10;

    // Determine which columns are visible
    const showLeft = weatherModule.show_left_column !== false;
    const showCenter = weatherModule.show_center_column !== false;
    const showRight = weatherModule.show_right_column !== false;

    // Build grid template based on visible columns - more dynamic
    let gridTemplate = '';
    const columns = [];

    if (showLeft) columns.push('minmax(0, 1fr)');
    if (showCenter) columns.push('auto');
    if (showRight) columns.push('minmax(0, 1fr)');

    gridTemplate = columns.join(' ') || '1fr';

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
        if (!weatherModule.hold_action || weatherModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            (weatherModule.hold_action as any) || ({ action: 'default' } as any),
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
          !weatherModule.double_tap_action ||
          weatherModule.double_tap_action.action !== 'nothing'
        ) {
          UltraLinkComponent.handleAction(
            (weatherModule.double_tap_action as any) || ({ action: 'default' } as any),
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

          if (!weatherModule.tap_action || weatherModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (weatherModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config
            );
          }
        }, 300);
      }
    };

    const hasActions =
      (weatherModule.tap_action && weatherModule.tap_action.action !== 'nothing') ||
      (weatherModule.hold_action && weatherModule.hold_action.action !== 'nothing') ||
      (weatherModule.double_tap_action && weatherModule.double_tap_action.action !== 'nothing');

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="animated-weather-module-container"
        style="
          cursor: ${hasActions ? 'pointer' : 'default'};
          --column-gap: ${weatherModule.column_gap ?? 12}px;
          --left-column-gap: ${weatherModule.left_column_gap ?? 8}px;
          --right-column-gap: ${weatherModule.right_column_gap ?? 8}px;
          --location-size: ${weatherModule.location_size || 16}px;
          --condition-size: ${weatherModule.condition_size || 24}px;
          --custom-entity-size: ${weatherModule.custom_entity_size || 18}px;
          --date-size: ${weatherModule.date_size || 16}px;
          --temperature-size: ${weatherModule.temperature_size || 64}px;
          --temp-range-size: ${weatherModule.temp_range_size || 18}px;
          --main-icon-size: ${weatherModule.main_icon_size || 120}px;
          --location-color: ${weatherModule.location_color || 'var(--primary-text-color)'};
          --condition-color: ${weatherModule.condition_color || 'var(--primary-text-color)'};
          --custom-entity-color: ${weatherModule.custom_entity_color ||
        'var(--primary-text-color)'};
          --date-color: ${weatherModule.date_color || 'var(--primary-text-color)'};
          --temperature-color: ${weatherModule.temperature_color || 'var(--primary-text-color)'};
          --temp-range-color: ${weatherModule.temp_range_color || 'var(--primary-text-color)'};
          --module-background: ${weatherModule.module_background || 'transparent'};
          --module-border: ${weatherModule.module_border || 'transparent'};
        "
        @pointerdown=${handlePointerDown}
        @pointerup=${handlePointerUp}
      >
        <div class="weather-main-grid" style="grid-template-columns: ${gridTemplate};">
          <!-- Left Column: Location & Condition -->
          ${showLeft
            ? html`
                <div class="weather-info-left">
                  ${weatherModule.show_location !== false
                    ? html`
                        <div class="weather-location">
                          <ha-icon icon="mdi:map-marker"></ha-icon>
                          ${weatherData.location}
                        </div>
                      `
                    : ''}
                  ${weatherModule.show_condition !== false
                    ? html`
                        <div class="weather-condition">
                          ${this._formatCondition(weatherData.condition)}
                        </div>
                      `
                    : ''}
                  ${weatherModule.show_custom_entity !== false &&
                  weatherModule.custom_entity &&
                  hass.states[weatherModule.custom_entity]
                    ? html`
                        <div class="weather-custom-entity">
                          ${weatherModule.custom_entity_name ||
                          hass.states[weatherModule.custom_entity].attributes.friendly_name ||
                          weatherModule.custom_entity}:
                          ${hass.states[weatherModule.custom_entity].state}${hass.states[
                            weatherModule.custom_entity
                          ].attributes.unit_of_measurement || ''}
                        </div>
                      `
                    : ''}
                </div>
              `
            : ''}

          <!-- Center Column: Weather Icon -->
          ${showCenter
            ? html`
                <div class="weather-icon-center">
                  <img
                    src="${this._getWeatherIcon(weatherData.condition, iconStyle)}"
                    alt="${this._formatCondition(weatherData.condition)}"
                    class="meteocon-icon large"
                  />
                </div>
              `
            : ''}

          <!-- Right Column: Date & Temperature -->
          ${showRight
            ? html`
                <div class="weather-info-right">
                  ${weatherModule.show_date !== false
                    ? html` <div class="weather-date">${dateStr}</div> `
                    : ''}
                  ${weatherModule.show_temperature !== false
                    ? html` <div class="weather-temp">${temp}°</div> `
                    : ''}
                  ${weatherModule.show_temp_range !== false
                    ? html` <div class="weather-temp-range">${highTemp}° / ${lowTemp}°</div> `
                    : ''}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  /**
   * Get weather data from entities
   */
  private _getWeatherData(hass: HomeAssistant, module: AnimatedWeatherModule) {
    const weatherEntity = hass.states[module.weather_entity || ''];
    const tempEntity = hass.states[module.temperature_entity || ''];
    const conditionEntity = hass.states[module.condition_entity || ''];

    // Try to get forecast from different possible locations
    let forecast = weatherEntity?.attributes?.forecast || [];

    // PirateWeather and some integrations store it differently
    if (forecast.length === 0 && weatherEntity) {
      forecast =
        weatherEntity.attributes?.['forecast_daily'] ||
        weatherEntity.attributes?.['daily'] ||
        weatherEntity.attributes?.['forecasts'] ||
        [];
    }

    // Determine location display value
    let location = 'Unknown Location';
    if (module.location_override_mode === 'entity' && module.location_entity) {
      // Use entity state or friendly name
      const locationEntity = hass.states[module.location_entity];
      if (locationEntity) {
        location = locationEntity.state || locationEntity.attributes?.friendly_name || location;
      }
    } else if (module.location_name) {
      // Use text override
      location = module.location_name;
    } else {
      // Use weather entity friendly name as fallback
      location = weatherEntity?.attributes?.friendly_name || location;
    }

    // Get temperature unit from weather entity attributes
    const temperatureUnit = weatherEntity?.attributes?.temperature_unit || '°F';

    return {
      temperature: weatherEntity?.attributes?.temperature || parseFloat(tempEntity?.state) || 72,
      temperatureUnit: temperatureUnit,
      condition: weatherEntity?.state || conditionEntity?.state || 'sunny',
      location: location,
      forecast: forecast,
      humidity: weatherEntity?.attributes?.humidity,
      windSpeed: weatherEntity?.attributes?.wind_speed,
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

  /**
   * Format condition string for display
   */
  private _formatCondition(condition: string): string {
    return condition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStyles(): string {
    return `
      .animated-weather-module-container {
        border-radius: clamp(8px, 2%, 16px);
        padding: clamp(12px, 2.5%, 20px) clamp(12px, 2%, 16px);
        position: relative;
        overflow: hidden;
        background: var(--module-background);
        border: 2px solid var(--module-border);
        width: 100%;
        box-sizing: border-box;
      }

      /* ========== MAIN WEATHER GRID ========== */
      .weather-main-grid {
        display: grid;
        gap: var(--column-gap, 12px);
        align-items: center;
        width: 100%;
      }


      /* Left Column */
      .weather-info-left {
        display: flex;
        flex-direction: column;
        gap: var(--left-column-gap, 8px) !important;
        align-items: flex-start;
        min-width: 0;
        justify-content: center;
      }


      .weather-location {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--location-size);
        font-weight: 600;
        color: var(--location-color);
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
        line-height: 1.2;
      }

      .weather-location ha-icon {
        --mdc-icon-size: calc(var(--location-size) + 2px);
        flex-shrink: 0;
      }

      .weather-condition {
        font-size: var(--condition-size);
        font-weight: 500;
        color: var(--condition-color);
        text-transform: capitalize;
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
        line-height: 1.2;
      }

      .weather-custom-entity {
        font-size: var(--custom-entity-size);
        font-weight: 500;
        color: var(--custom-entity-color);
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
        line-height: 1.2;
      }

      /* Center Column - Weather Icon */
      .weather-icon-center {
        width: var(--main-icon-size);
        height: var(--main-icon-size);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .meteocon-icon {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .meteocon-icon.large {
        width: var(--main-icon-size);
        height: var(--main-icon-size);
      }

      /* Right Column */
      .weather-info-right {
        display: flex;
        flex-direction: column;
        gap: var(--right-column-gap, 8px) !important;
        align-items: flex-end;
        text-align: right;
        min-width: 0;
        justify-content: center;
      }


      .weather-date {
        font-size: var(--date-size);
        font-weight: 500;
        color: var(--date-color);
        text-transform: capitalize;
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
        line-height: 1.2;
      }

      .weather-temp {
        font-size: var(--temperature-size);
        font-weight: 300;
        color: var(--temperature-color);
        line-height: 1;
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
      }

      .weather-temp-range {
        font-size: var(--temp-range-size);
        font-weight: 500;
        color: var(--temp-range-color);
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
        line-height: 1.2;
      }

      /* ========== RESPONSIVE ========== */
      @media (max-width: 768px) {
        .animated-weather-module-container {
          transform: scale(min(1, calc(100vw / 500)));
          transform-origin: top center;
        }
      }
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const weatherModule = module as AnimatedWeatherModule;

    if (!weatherModule.weather_entity && !weatherModule.temperature_entity) {
      errors.push('At least one weather or temperature entity is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
