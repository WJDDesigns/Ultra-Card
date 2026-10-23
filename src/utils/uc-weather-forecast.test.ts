import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearWeatherForecastCache, forecastDayKey, getWeatherForecast } from './uc-weather-forecast';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('uc-weather-forecast', () => {
  beforeEach(() => clearWeatherForecastCache());

  it('uses legacy daily attributes without calling the service', () => {
    const callWS = vi.fn();
    const hass = {
      states: { 'weather.home': { state: 'sunny', attributes: { forecast_daily: [{ datetime: 'x' }] } } },
      callWS,
    } as any;
    expect(getWeatherForecast(hass, 'weather.home', 'daily')).toEqual([{ datetime: 'x' }]);
    expect(callWS).not.toHaveBeenCalled();
  });

  it('does not treat the daily attribute as hourly data', async () => {
    const callWS = vi.fn().mockResolvedValue({
      response: { 'weather.home': { forecast: [{ datetime: 'h1' }] } },
    });
    const hass = {
      states: { 'weather.home': { state: 'sunny', attributes: { forecast: [{ datetime: 'd1' }] } } },
      callWS,
    } as any;
    const onUpdate = vi.fn();
    expect(getWeatherForecast(hass, 'weather.home', 'hourly', onUpdate)).toEqual([]);
    expect(callWS).toHaveBeenCalledWith(
      expect.objectContaining({ service: 'get_forecasts', service_data: { type: 'hourly' } })
    );
    await flush();
    expect(onUpdate).toHaveBeenCalled();
    expect(getWeatherForecast(hass, 'weather.home', 'hourly', onUpdate)).toEqual([{ datetime: 'h1' }]);
    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it('fetches only once while a request is in flight', () => {
    const callWS = vi.fn().mockReturnValue(new Promise(() => {}));
    const hass = { states: { 'weather.home': { state: 'sunny', attributes: {} } }, callWS } as any;
    getWeatherForecast(hass, 'weather.home', 'daily', () => {});
    getWeatherForecast(hass, 'weather.home', 'daily', () => {});
    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it('keys hourly slots by local calendar day', () => {
    const d = new Date(2026, 9, 23, 14, 0, 0);
    expect(forecastDayKey(d.toISOString())).toBe('2026-10-23');
    expect(forecastDayKey('not a date')).toBe('');
  });
});
