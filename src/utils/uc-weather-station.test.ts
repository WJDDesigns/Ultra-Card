import { describe, expect, it } from 'vitest';
import {
  bearingToCardinal,
  formatWeatherReading,
  parseBearing,
  readWeatherValue,
  stationSensorIds,
} from './uc-weather-station';

const hass = (states: Record<string, { state: string; attributes?: Record<string, unknown> }>) =>
  ({ states }) as any;

describe('uc-weather-station', () => {
  it('maps bearings to 16-point labels, wrapping past 360', () => {
    expect(bearingToCardinal(0)).toBe('N');
    expect(bearingToCardinal(22.5)).toBe('NNE');
    expect(bearingToCardinal(225)).toBe('SW');
    expect(bearingToCardinal(359)).toBe('N');
    expect(bearingToCardinal(-90)).toBe('W');
  });

  it('parses degrees and compass labels', () => {
    expect(parseBearing('225')).toBe(225);
    expect(parseBearing('12,5')).toBe(12.5);
    expect(parseBearing('sw')).toBe(225);
    expect(parseBearing('unknown')).toBeUndefined();
    expect(parseBearing(undefined)).toBeUndefined();
  });

  it('prefers the station sensor over the weather attribute', () => {
    const h = hass({
      'sensor.station_temp': { state: '18.4', attributes: { unit_of_measurement: '°C' } },
    });
    const reading = readWeatherValue(
      h,
      { temperature: 21, temperature_unit: '°C' },
      { temperature_entity: 'sensor.station_temp' },
      'temperature'
    );
    expect(reading).toEqual({ value: 18.4, unit: '°C', fromSensor: true });
  });

  it('falls back to the weather attribute when the sensor is unavailable', () => {
    const h = hass({ 'sensor.station_temp': { state: 'unavailable' } });
    const reading = readWeatherValue(
      h,
      { temperature: 21, temperature_unit: '°C' },
      { temperature_entity: 'sensor.station_temp' },
      'temperature'
    );
    expect(reading).toEqual({ value: 21, unit: '°C', fromSensor: false });
  });

  it('reads wind direction from a degrees sensor or the wind_bearing attribute', () => {
    const h = hass({ 'sensor.dir': { state: '270', attributes: { unit_of_measurement: '°' } } });
    expect(readWeatherValue(h, {}, { wind_direction_entity: 'sensor.dir' }, 'wind_direction')?.value).toBe(270);
    expect(readWeatherValue(h, { wind_bearing: 90 }, {}, 'wind_direction')?.value).toBe(90);
  });

  it('resolves variables through the callback', () => {
    const h = hass({ 'sensor.real': { state: '3.2' } });
    const reading = readWeatherValue(h, {}, { uv_index_entity: '$uv' }, 'uv_index', () => 'sensor.real');
    expect(reading?.value).toBe(3.2);
  });

  it('returns undefined when neither source has a value', () => {
    expect(readWeatherValue(hass({}), {}, {}, 'uv_index')).toBeUndefined();
  });

  it('formats readings with sensible precision and spacing', () => {
    expect(formatWeatherReading('temperature', { value: 18.4, unit: '°C', fromSensor: true })).toBe('18°C');
    expect(formatWeatherReading('humidity', { value: 64.6, unit: '%', fromSensor: true })).toBe('65%');
    expect(formatWeatherReading('precipitation', { value: 2.04, unit: 'mm', fromSensor: true })).toBe('2 mm');
    expect(formatWeatherReading('precipitation', { value: 2.25, unit: 'mm', fromSensor: true })).toBe('2.3 mm');
    expect(formatWeatherReading('uv_index', { value: 3, unit: '', fromSensor: true })).toBe('3');
    expect(formatWeatherReading('uv_index', { value: 3.24, unit: 'UV index', fromSensor: true })).toBe('3.2');
    expect(formatWeatherReading('wind_gust', { value: 31.7, unit: 'km/h', fromSensor: true })).toBe('32 km/h');
  });

  it('lists configured sensor ids', () => {
    expect(stationSensorIds({ temperature_entity: 'sensor.a', uv_index_entity: '', wind_gust_entity: 'sensor.b' })).toEqual([
      'sensor.a',
      'sensor.b',
    ]);
  });
});
