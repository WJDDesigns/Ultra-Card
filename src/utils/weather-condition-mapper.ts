/**
 * Weather Condition Mapper
 * Maps Home Assistant weather states to weather effect types
 */

import { WeatherEffectType } from '../types';
import { HomeAssistant } from 'custom-card-helpers';

/**
 * Map Home Assistant weather condition to effect type
 * Supports automatic detection from entity state and attributes
 */
export function mapWeatherConditionToEffect(
  hass: HomeAssistant,
  weatherEntity: string
): WeatherEffectType {
  if (!weatherEntity || !hass.states[weatherEntity]) {
    return 'none';
  }

  const entity = hass.states[weatherEntity];
  const condition = entity.state.toLowerCase();
  const attributes = entity.attributes;

  // Rain conditions
  if (condition === 'lightning-rainy' || condition === 'lightning_rainy') {
    return 'rain_storm';
  }

  if (condition === 'pouring') {
    return 'rain_storm';
  }

  if (condition === 'rainy') {
    // Check precipitation to determine intensity
    const precipitation = attributes.precipitation || 0;
    if (precipitation > 10) {
      return 'rain_storm';
    } else if (precipitation > 0 && precipitation <= 2) {
      return 'rain_drizzle';
    }
    return 'rain';
  }

  if (condition === 'hail') {
    return 'hail';
  }

  if (condition === 'lightning') {
    return 'lightning';
  }

  // Snow conditions
  if (condition === 'snowy' || condition === 'snow') {
    // Check wind speed to determine storm vs gentle
    const windSpeed = attributes.wind_speed || 0;
    if (windSpeed > 20) {
      return 'snow_storm';
    }
    return 'snow_gentle';
  }

  if (condition === 'snowy-rainy' || condition === 'snowy_rainy') {
    return 'snow_storm';
  }

  // Fog conditions
  if (condition === 'fog' || condition === 'foggy') {
    // Check visibility to determine density
    const visibility = attributes.visibility;
    if (visibility !== undefined && visibility < 1000) {
      return 'fog_dense';
    }
    return 'fog_light';
  }

  // Clear/Sunny conditions
  if (condition === 'sunny' || condition === 'clear') {
    return 'sun_beams';
  }

  if (condition === 'clear-night' || condition === 'clear_night') {
    // No effect at night
    return 'none';
  }

  // Cloudy conditions
  if (
    condition === 'cloudy' ||
    condition === 'partlycloudy' ||
    condition === 'partly-cloudy' ||
    condition === 'partly_cloudy'
  ) {
    return 'clouds';
  }

  // Windy conditions
  if (condition === 'windy-variant' || condition === 'windy_variant') {
    return 'wind';
  }

  if (condition === 'windy') {
    return 'none';
  }

  // Exceptional or unknown conditions
  return 'none';
}

/**
 * Get human-readable name for effect type
 */
export function getEffectDisplayName(effect: WeatherEffectType): string {
  const names: Record<WeatherEffectType, string> = {
    none: 'None',
    rain: 'Rain',
    rain_storm: 'Rain Storm',
    rain_drizzle: 'Drizzle',
    hail: 'Hail',
    acid_rain: 'Acid Rain',
    matrix_rain: 'Matrix Rain',
    lightning: 'Lightning',
    snow_gentle: 'Gentle Snow',
    snow_storm: 'Snow Storm',
    fog_light: 'Light Fog',
    fog_dense: 'Dense Fog',
    sun_beams: 'Sun Beams',
    clouds: 'Clouds',
    wind: 'Wind',
  };
  return names[effect] || 'Unknown';
}

/**
 * Get all available effect types for manual selection
 */
export function getAllEffectTypes(): Array<{ value: WeatherEffectType; label: string }> {
  return [
    { value: 'none', label: 'None' },
    { value: 'rain', label: 'Rain' },
    { value: 'rain_storm', label: 'Rain Storm (Lightning)' },
    { value: 'rain_drizzle', label: 'Drizzle' },
    { value: 'hail', label: 'Hail' },
    { value: 'acid_rain', label: 'Acid Rain' },
    { value: 'matrix_rain', label: 'Matrix Rain' },
    { value: 'lightning', label: 'Lightning' },
    { value: 'snow_gentle', label: 'Gentle Snow' },
    { value: 'snow_storm', label: 'Snow Storm' },
    { value: 'fog_light', label: 'Light Fog' },
    { value: 'fog_dense', label: 'Dense Fog' },
    { value: 'sun_beams', label: 'Sun Beams' },
    { value: 'clouds', label: 'Clouds' },
    { value: 'wind', label: 'Wind' },
  ];
}

