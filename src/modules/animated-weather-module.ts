import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, AnimatedWeatherModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { renderAnimatedWeatherModuleEditor } from './animated-weather-module-editor';
import { formatEntityState } from '../utils/number-format';

export class UltraAnimatedWeatherModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'animated_weather',
    title: 'Animated Weather',
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
      layout_spread: 100, // 0-100% (0=compact centered, 100=full-width spread)
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
      show_precipitation: false,
      show_precipitation_probability: false,
      show_wind: false,
      show_pressure: false,
      show_visibility: false,

      // Right Column Display Toggles
      show_date: true,
      show_temperature: true,
      show_temp_range: true,

      // Left Column - Text Sizes
      location_size: 16,
      condition_size: 24,
      custom_entity_size: 18,
      precipitation_size: 14,
      wind_size: 14,
      pressure_size: 14,
      visibility_size: 14,

      // Left Column - Colors
      location_color: 'var(--primary-text-color)',
      condition_color: 'var(--primary-text-color)',
      custom_entity_color: 'var(--primary-text-color)',
      precipitation_color: 'var(--primary-text-color)',
      wind_color: 'var(--primary-text-color)',
      pressure_color: 'var(--primary-text-color)',
      visibility_color: 'var(--primary-text-color)',

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

  /**
   * Get default column order for backwards compatibility
   * Returns order arrays based on current visibility toggles and entity availability
   */
  private _getDefaultColumnOrder(
    module: AnimatedWeatherModule,
    hass?: HomeAssistant
  ): { left: string[]; right: string[] } {
    // Check entity availability
    const weatherEntity = module.weather_entity ? hass?.states[module.weather_entity] : null;
    const hasPrecipitation =
      weatherEntity?.attributes?.precipitation !== undefined &&
      weatherEntity?.attributes?.precipitation !== null;
    const hasPrecipitationProbability =
      weatherEntity?.attributes?.precipitation_probability !== undefined &&
      weatherEntity?.attributes?.precipitation_probability !== null;
    const hasWind =
      weatherEntity?.attributes?.wind_speed !== undefined ||
      weatherEntity?.attributes?.wind_bearing !== undefined;
    const hasPressure =
      weatherEntity?.attributes?.pressure !== undefined &&
      weatherEntity?.attributes?.pressure !== null;
    const hasVisibility =
      weatherEntity?.attributes?.visibility !== undefined &&
      weatherEntity?.attributes?.visibility !== null;

    // Left column default order (only include items that exist in entity)
    const leftItems: string[] = [];
    leftItems.push('location');
    leftItems.push('condition');
    if (module.custom_entity) leftItems.push('custom_entity');
    if (hasPrecipitation) leftItems.push('precipitation');
    if (hasPrecipitationProbability) leftItems.push('precipitation_probability');
    if (hasWind) leftItems.push('wind');
    if (hasPressure) leftItems.push('pressure');
    if (hasVisibility) leftItems.push('visibility');

    // Right column default order
    const rightItems: string[] = ['date', 'temperature', 'temp_range'];

    return { left: leftItems, right: rightItems };
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
    const moduleWithDesign = weatherModule as any;
    const designFromDesignObject = (weatherModule as any).design || {};

    // Create merged design properties object that prioritizes top-level properties (where Global Design saves)
    // over design object properties, and includes all properties needed by the container styles
    const designProperties = {
      // Text properties - prioritize top-level (where Global Design saves them)
      color: (weatherModule as any).color || designFromDesignObject.color,
      // Container properties - also check both locations
      background_color:
        (weatherModule as any).background_color || designFromDesignObject.background_color,
      background_image:
        (weatherModule as any).background_image || designFromDesignObject.background_image,
      background_image_type:
        (weatherModule as any).background_image_type ||
        designFromDesignObject.background_image_type,
      background_image_entity:
        (weatherModule as any).background_image_entity ||
        designFromDesignObject.background_image_entity,
      background_image_upload:
        (weatherModule as any).background_image_upload ||
        designFromDesignObject.background_image_upload,
      background_image_url:
        (weatherModule as any).background_image_url || designFromDesignObject.background_image_url,
      background_size:
        (weatherModule as any).background_size || designFromDesignObject.background_size,
      background_position:
        (weatherModule as any).background_position || designFromDesignObject.background_position,
      background_repeat:
        (weatherModule as any).background_repeat || designFromDesignObject.background_repeat,
      padding_top:
        designFromDesignObject.padding_top !== undefined
          ? designFromDesignObject.padding_top
          : (weatherModule as any).padding_top,
      padding_bottom:
        designFromDesignObject.padding_bottom !== undefined
          ? designFromDesignObject.padding_bottom
          : (weatherModule as any).padding_bottom,
      padding_left:
        designFromDesignObject.padding_left !== undefined
          ? designFromDesignObject.padding_left
          : (weatherModule as any).padding_left,
      padding_right:
        designFromDesignObject.padding_right !== undefined
          ? designFromDesignObject.padding_right
          : (weatherModule as any).padding_right,
      margin_top:
        designFromDesignObject.margin_top !== undefined
          ? designFromDesignObject.margin_top
          : (weatherModule as any).margin_top,
      margin_bottom:
        designFromDesignObject.margin_bottom !== undefined
          ? designFromDesignObject.margin_bottom
          : (weatherModule as any).margin_bottom,
      margin_left:
        designFromDesignObject.margin_left !== undefined
          ? designFromDesignObject.margin_left
          : (weatherModule as any).margin_left,
      margin_right:
        designFromDesignObject.margin_right !== undefined
          ? designFromDesignObject.margin_right
          : (weatherModule as any).margin_right,
      border_radius:
        (weatherModule as any).border_radius || designFromDesignObject.border_radius,
      border_style:
        (weatherModule as any).border_style || designFromDesignObject.border_style,
      border_width:
        (weatherModule as any).border_width || designFromDesignObject.border_width,
      border_color:
        (weatherModule as any).border_color || designFromDesignObject.border_color,
    };

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

    // Build grid template based on visible columns and layout spread percentage
    // 0% = compact centered (auto columns), 100% = full-width spread (1fr columns)
    const spreadPercentage = weatherModule.layout_spread ?? 100;
    const useCompactLayout = spreadPercentage < 50;
    
    let gridTemplate = '';
    const columns = [];

    if (useCompactLayout) {
      // Compact centered layout (0-49%)
      if (showLeft) columns.push('auto');
      if (showCenter) columns.push('auto');
      if (showRight) columns.push('auto');
    } else {
      // Full-width spread layout (50-100%)
      if (showLeft) columns.push('minmax(0, 1fr)');
      if (showCenter) columns.push('auto');
      if (showRight) columns.push('minmax(0, 1fr)');
    }

    gridTemplate = columns.join(' ') || 'auto';

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
            config,
            (weatherModule as any).entity,
            weatherModule
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
            config,
            (weatherModule as any).entity,
            weatherModule
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
              config,
              (weatherModule as any).entity,
              weatherModule
            );
          }
        }, 300);
      }
    };

    const hasActions =
      (weatherModule.tap_action && weatherModule.tap_action.action !== 'nothing') ||
      (weatherModule.hold_action && weatherModule.hold_action.action !== 'nothing') ||
      (weatherModule.double_tap_action && weatherModule.double_tap_action.action !== 'nothing');

    // Apply text color override from global design - if set, override all text colors
    const globalTextColor = designProperties.color;
    const locationColor = globalTextColor || weatherModule.location_color || 'var(--primary-text-color)';
    const conditionColor = globalTextColor || weatherModule.condition_color || 'var(--primary-text-color)';
    const customEntityColor = globalTextColor || weatherModule.custom_entity_color || 'var(--primary-text-color)';
    const dateColor = globalTextColor || weatherModule.date_color || 'var(--primary-text-color)';
    const temperatureColor = globalTextColor || weatherModule.temperature_color || 'var(--primary-text-color)';
    const tempRangeColor = globalTextColor || weatherModule.temp_range_color || 'var(--primary-text-color)';

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
        designProperties.background_color || moduleWithDesign.background_color || weatherModule.module_background || 'transparent',
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
          ? `${this.addPixelUnit(designProperties.border_width || moduleWithDesign.border_width) || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || weatherModule.module_border || 'var(--divider-color)'}`
          : weatherModule.module_border && weatherModule.module_border !== 'transparent'
            ? `2px solid ${weatherModule.module_border}`
            : undefined,
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || undefined,
      boxSizing: 'border-box',
      // Add cursor pointer when actions are configured
      cursor: hasActions ? 'pointer' : 'default',
    };

    // Calculate gap based on spread percentage (0% = 0px, 100% = 12px)
    const calculatedGap = Math.round((spreadPercentage / 100) * 12);
    const justifyContent = useCompactLayout ? 'center' : 'normal';

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
          class="animated-weather-module-container"
          style="
            --column-gap: ${calculatedGap}px;
            --justify-content: ${justifyContent};
            --left-column-gap: ${weatherModule.left_column_gap ?? 8}px;
            --right-column-gap: ${weatherModule.right_column_gap ?? 8}px;
            --location-size: ${weatherModule.location_size || 16}px;
            --condition-size: ${weatherModule.condition_size || 24}px;
            --custom-entity-size: ${weatherModule.custom_entity_size || 18}px;
            --precipitation-size: ${weatherModule.precipitation_size || 14}px;
            --wind-size: ${weatherModule.wind_size || 14}px;
            --pressure-size: ${weatherModule.pressure_size || 14}px;
            --visibility-size: ${weatherModule.visibility_size || 14}px;
            --date-size: ${weatherModule.date_size || 16}px;
            --temperature-size: ${weatherModule.temperature_size || 64}px;
            --temp-range-size: ${weatherModule.temp_range_size || 18}px;
            --main-icon-size: ${weatherModule.main_icon_size || 120}px;
            --location-color: ${locationColor};
            --condition-color: ${conditionColor};
            --custom-entity-color: ${customEntityColor};
            --precipitation-color: ${globalTextColor || weatherModule.precipitation_color || 'var(--primary-text-color)'};
            --wind-color: ${globalTextColor || weatherModule.wind_color || 'var(--primary-text-color)'};
            --pressure-color: ${globalTextColor || weatherModule.pressure_color || 'var(--primary-text-color)'};
            --visibility-color: ${globalTextColor || weatherModule.visibility_color || 'var(--primary-text-color)'};
            --date-color: ${dateColor};
            --temperature-color: ${temperatureColor};
            --temp-range-color: ${tempRangeColor};
            --module-background: ${weatherModule.module_background || 'transparent'};
            --module-border: ${weatherModule.module_border || 'transparent'};
          "
        >
        <div class="weather-main-grid" style="grid-template-columns: ${gridTemplate};">
          <!-- Left Column: Location & Condition -->
          ${showLeft
            ? html`
                <div class="weather-info-left">
                  ${this._renderColumnItems(
                    'left',
                    weatherModule,
                    hass,
                    weatherData,
                    dateStr,
                    temp,
                    highTemp,
                    lowTemp
                  )}
                </div>
              `
            : ''}

          <!-- Center Column: Weather Icon -->
          ${showCenter
            ? html`
                <div class="weather-icon-center">
                  <img
                    src="${this._getWeatherIcon(weatherData.condition, iconStyle)}"
                    alt="${weatherModule.weather_entity && weatherData.weatherEntity
                      ? formatEntityState(hass, weatherModule.weather_entity)
                      : this._formatCondition(weatherData.condition)}"
                    class="meteocon-icon large"
                  />
                </div>
              `
            : ''}

          <!-- Right Column: Date & Temperature -->
          ${showRight
            ? html`
                <div class="weather-info-right">
                  ${this._renderColumnItems(
                    'right',
                    weatherModule,
                    hass,
                    weatherData,
                    dateStr,
                    temp,
                    highTemp,
                    lowTemp
                  )}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render column items based on order array
   */
  private _renderColumnItems(
    column: 'left' | 'right',
    weatherModule: AnimatedWeatherModule,
    hass: HomeAssistant,
    weatherData: any,
    dateStr: string,
    temp: number,
    highTemp: number,
    lowTemp: number
  ): TemplateResult[] {
    // Get order for this column
    const defaultOrder = this._getDefaultColumnOrder(weatherModule, hass);
    const order =
      column === 'left'
        ? weatherModule.left_column_order || defaultOrder.left
        : weatherModule.right_column_order || defaultOrder.right;

    // Map item IDs to their render functions
    const itemRenderers: Record<string, () => TemplateResult | typeof nothing> = {
      location: () =>
        weatherModule.show_location !== false
          ? html`
              <div class="weather-location">
                <ha-icon icon="mdi:map-marker"></ha-icon>
                ${weatherData.location}
              </div>
            `
          : nothing,
      condition: () =>
        weatherModule.show_condition !== false
          ? html`
              <div class="weather-condition">
                ${weatherModule.weather_entity && weatherData.weatherEntity
                  ? formatEntityState(hass, weatherModule.weather_entity)
                  : this._formatCondition(weatherData.condition)}
              </div>
            `
          : nothing,
      custom_entity: () =>
        weatherModule.show_custom_entity !== false &&
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
          : nothing,
      precipitation: () =>
        weatherModule.show_precipitation !== false &&
        weatherData.precipitation !== undefined &&
        weatherData.precipitation !== null
          ? html`
              <div class="weather-precipitation">
                <ha-icon icon="mdi:weather-pouring"></ha-icon>
                ${this._formatPrecipitation(weatherData.precipitation, weatherData.weatherEntity)}
              </div>
            `
          : nothing,
      precipitation_probability: () =>
        weatherModule.show_precipitation_probability !== false &&
        weatherData.precipitationProbability !== undefined &&
        weatherData.precipitationProbability !== null
          ? html`
              <div class="weather-precipitation-probability">
                <ha-icon icon="mdi:weather-rainy"></ha-icon>
                ${this._formatPrecipitationProbability(weatherData.precipitationProbability)}
              </div>
            `
          : nothing,
      wind: () =>
        weatherModule.show_wind !== false &&
        (weatherData.windSpeed !== undefined || weatherData.windBearing !== undefined)
          ? html`
              <div class="weather-wind">
                <ha-icon icon="mdi:weather-windy"></ha-icon>
                ${this._formatWind(
                  weatherData.windSpeed,
                  weatherData.windBearing,
                  weatherData.weatherEntity
                )}
              </div>
            `
          : nothing,
      pressure: () =>
        weatherModule.show_pressure !== false &&
        weatherData.pressure !== undefined &&
        weatherData.pressure !== null
          ? html`
              <div class="weather-pressure">
                <ha-icon icon="mdi:gauge"></ha-icon>
                ${this._formatPressure(weatherData.pressure, weatherData.weatherEntity)}
              </div>
            `
          : nothing,
      visibility: () =>
        weatherModule.show_visibility !== false &&
        weatherData.visibility !== undefined &&
        weatherData.visibility !== null
          ? html`
              <div class="weather-visibility">
                <ha-icon icon="mdi:eye"></ha-icon>
                ${this._formatVisibility(weatherData.visibility, weatherData.weatherEntity)}
              </div>
            `
          : nothing,
      date: () =>
        weatherModule.show_date !== false ? html` <div class="weather-date">${dateStr}</div> ` : nothing,
      temperature: () =>
        weatherModule.show_temperature !== false
          ? html` <div class="weather-temp">${temp}°</div> `
          : nothing,
      temp_range: () =>
        weatherModule.show_temp_range !== false
          ? html` <div class="weather-temp-range">${highTemp}° / ${lowTemp}°</div> `
          : nothing,
    };

    // Render items in order
    return order
      .filter(itemId => itemRenderers[itemId]) // Only render items that exist
      .map(itemId => itemRenderers[itemId]())
      .filter(result => result !== nothing); // Filter out 'nothing' results
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
      windBearing: weatherEntity?.attributes?.wind_bearing,
      precipitation: weatherEntity?.attributes?.precipitation,
      precipitationProbability: weatherEntity?.attributes?.precipitation_probability,
      pressure: weatherEntity?.attributes?.pressure,
      visibility: weatherEntity?.attributes?.visibility,
      weatherEntity: weatherEntity, // Keep reference for formatting
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
   * Format condition string for display (fallback when entity not available)
   */
  private _formatCondition(condition: string): string {
    return condition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format precipitation amount with unit
   */
  private _formatPrecipitation(
    precipitation: number | undefined,
    weatherEntity: any
  ): string {
    if (precipitation === undefined || precipitation === null) return '';
    const unit = weatherEntity?.attributes?.precipitation_unit || 'mm';
    return `${precipitation.toFixed(1)} ${unit}`;
  }

  /**
   * Format precipitation probability as percentage
   */
  private _formatPrecipitationProbability(probability: number | undefined): string {
    if (probability === undefined || probability === null) return '';
    return `${Math.round(probability)}%`;
  }

  /**
   * Format wind speed and direction
   */
  private _formatWind(
    windSpeed: number | undefined,
    windBearing: number | undefined,
    weatherEntity: any
  ): string {
    const parts: string[] = [];
    if (windSpeed !== undefined && windSpeed !== null) {
      const unit = weatherEntity?.attributes?.wind_speed_unit || 'km/h';
      parts.push(`${windSpeed.toFixed(1)} ${unit}`);
    }
    if (windBearing !== undefined && windBearing !== null) {
      parts.push(this._formatWindBearing(windBearing));
    }
    return parts.join(' ');
  }

  /**
   * Convert wind bearing degrees to cardinal direction
   */
  private _formatWindBearing(bearing: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  }

  /**
   * Format pressure with unit
   */
  private _formatPressure(pressure: number | undefined, weatherEntity: any): string {
    if (pressure === undefined || pressure === null) return '';
    const unit = weatherEntity?.attributes?.pressure_unit || 'hPa';
    return `${Math.round(pressure)} ${unit}`;
  }

  /**
   * Format visibility with unit
   */
  private _formatVisibility(visibility: number | undefined, weatherEntity: any): string {
    if (visibility === undefined || visibility === null) return '';
    const unit = weatherEntity?.attributes?.visibility_unit || 'km';
    return `${visibility.toFixed(1)} ${unit}`;
  }

  getStyles(): string {
    return `
      .animated-weather-module-container {
        padding: 0;
        position: relative;
        overflow: hidden;
        background: var(--module-background);
        border: none;
        width: 100%;
        box-sizing: border-box;
      }

      /* ========== MAIN WEATHER GRID ========== */
      .weather-main-grid {
        display: grid;
        gap: var(--column-gap, 12px);
        align-items: center;
        justify-content: var(--justify-content, normal);
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

      .weather-precipitation,
      .weather-precipitation-probability,
      .weather-wind,
      .weather-pressure,
      .weather-visibility {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--precipitation-size);
        font-weight: 500;
        color: var(--precipitation-color);
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin: 0;
        padding: 0;
        line-height: 1.2;
      }

      .weather-precipitation ha-icon,
      .weather-precipitation-probability ha-icon,
      .weather-wind ha-icon,
      .weather-pressure ha-icon,
      .weather-visibility ha-icon {
        --mdc-icon-size: calc(var(--precipitation-size) + 2px);
        flex-shrink: 0;
      }

      .weather-wind {
        font-size: var(--wind-size);
        color: var(--wind-color);
      }

      .weather-wind ha-icon {
        --mdc-icon-size: calc(var(--wind-size) + 2px);
      }

      .weather-pressure {
        font-size: var(--pressure-size);
        color: var(--pressure-color);
      }

      .weather-pressure ha-icon {
        --mdc-icon-size: calc(var(--pressure-size) + 2px);
      }

      .weather-visibility {
        font-size: var(--visibility-size);
        color: var(--visibility-color);
      }

      .weather-visibility ha-icon {
        --mdc-icon-size: calc(var(--visibility-size) + 2px);
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
