import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  OPEN_METEO_LAYER_URL,
  autoWeatherModel,
  loadOpenMeteoAdapter,
  resetOpenMeteoAdapter,
  weatherDomainFor,
  weatherLayerOf,
  weatherLayerUrl,
  weatherLegendFrom,
  weatherVariableFor,
} from './uc-open-meteo-layer';

describe('Open-Meteo weather layer', () => {
  beforeEach(() => resetOpenMeteoAdapter());

  it('treats a missing or unknown layer as none', () => {
    expect(weatherLayerOf({})).toBe('none');
    expect(weatherLayerOf({ weather_layer: 'bogus' as never })).toBe('none');
    expect(weatherLayerOf({ weather_layer: 'wind' })).toBe('wind');
    expect(weatherVariableFor('none')).toBeNull();
    expect(weatherVariableFor('wind')).toBe('wind_speed_10m');
  });

  it('picks a regional model for the map center', () => {
    expect(autoWeatherModel(51.5, -0.1)).toBe('ukmo_seamless');
    expect(autoWeatherModel(48.85, 2.35)).toBe('meteofrance_seamless');
    expect(autoWeatherModel(52.37, 4.9)).toBe('knmi_seamless');
    expect(autoWeatherModel(35.7, 139.7)).toBe('jma_seamless');
    expect(autoWeatherModel(53.5, -113.5)).toBe('cmc_gem_seamless');
    expect(autoWeatherModel(39.1, -94.6)).toBe('ncep_gfs013');
    expect(autoWeatherModel(52.5, 13.4)).toBe('dwd_icon_seamless');
    expect(autoWeatherModel(-33.9, 151.2)).toBe('dwd_icon_seamless');
  });

  it('honors a chosen model, but air quality always reads CAMS', () => {
    const c = { lat: 39.1, lng: -94.6 };
    expect(weatherDomainFor({ weather_layer: 'none' }, c)).toBeNull();
    expect(weatherDomainFor({ weather_layer: 'temperature' }, c)).toBe('ncep_gfs013');
    expect(
      weatherDomainFor({ weather_layer: 'temperature', weather_model: 'ecmwf_ifs025' }, c)
    ).toBe('ecmwf_ifs025');
    expect(weatherDomainFor({ weather_layer: 'temperature', weather_model: 'nope' }, c)).toBe(
      'ncep_gfs013'
    );
    expect(
      weatherDomainFor({ weather_layer: 'air_quality', weather_model: 'ecmwf_ifs025' }, c)
    ).toBe('cams_global');
  });

  it('builds an om:// URL for the current hour', () => {
    const url = weatherLayerUrl('dwd_icon_seamless', 'temperature_2m', true);
    expect(url).toBe(
      'om://https://openmeteo.s3.amazonaws.com/data_spatial/dwd_icon_seamless/latest.json?time_step=current_time_1H&variable=temperature_2m&dark=true'
    );
    expect(weatherLayerUrl('cams_global', 'pm2_5', false)).not.toContain('dark');
  });

  it('loads the pinned package once and registers the om protocol', async () => {
    const addProtocol = vi.fn();
    const createTileLayer = vi.fn();
    const lib = {
      omProtocol: () => undefined,
      defaultOmProtocolSettings: {},
      addLeafletProtocolSupport: vi.fn(() => ({ addProtocol, createTileLayer })),
    };
    const importer = vi.fn(async () => lib);
    const L = {};
    const a = await loadOpenMeteoAdapter(L, importer);
    const b = await loadOpenMeteoAdapter(L, importer);
    expect(a).toBe(b);
    expect(importer).toHaveBeenCalledTimes(1);
    expect(importer).toHaveBeenCalledWith(OPEN_METEO_LAYER_URL);
    expect(OPEN_METEO_LAYER_URL).toMatch(/weather-map-layer@\d+\.\d+\.\d+\//);
    expect(lib.addLeafletProtocolSupport).toHaveBeenCalledWith(L);
    expect(addProtocol).toHaveBeenCalledWith(
      'om',
      lib.omProtocol,
      expect.objectContaining({
        colorScales: expect.objectContaining({ pm2_5: expect.anything() }),
      })
    );
  });

  it('forgets a failed load so it can try again', async () => {
    const importer = vi.fn().mockRejectedValueOnce(new Error('offline'));
    await expect(loadOpenMeteoAdapter({}, importer)).rejects.toThrow('offline');
    importer.mockResolvedValueOnce({
      omProtocol: null,
      defaultOmProtocolSettings: null,
      addLeafletProtocolSupport: () => ({
        addProtocol: () => undefined,
        createTileLayer: () => null,
      }),
    });
    await expect(loadOpenMeteoAdapter({}, importer)).resolves.toBeTruthy();
    expect(importer).toHaveBeenCalledTimes(2);
  });

  it('turns a color scale into a legend', () => {
    expect(weatherLegendFrom(null)).toBeNull();
    const rgbaScale = weatherLegendFrom({
      type: 'rgba',
      unit: '°C',
      min: -40,
      max: 50,
      colors: [
        [0, 0, 255, 1],
        [255, 0, 0, 1],
      ],
    });
    expect(rgbaScale).toEqual({
      gradient: 'linear-gradient(90deg, rgba(0, 0, 255, 1) 0.0%, rgba(255, 0, 0, 1) 100.0%)',
      min: '-40',
      max: '50',
      unit: '°C',
    });
    expect(
      weatherLegendFrom(
        {
          type: 'rgba',
          unit: '°C',
          min: -40,
          max: 50,
          colors: [
            [0, 0, 0, 1],
            [1, 1, 1, 1],
          ],
        },
        true
      )
    ).toMatchObject({ min: '-40', max: '122', unit: '°F' });
    const bp = weatherLegendFrom({
      type: 'breakpoint',
      unit: 'mm',
      breakpoints: [0.1, 2, 10],
      colors: [
        [1, 2, 3, 255],
        [4, 5, 6, 255],
        [7, 8, 9, 255],
      ],
    });
    expect(bp?.min).toBe('0.1');
    expect(bp?.max).toBe('10');
    expect(bp?.gradient).toContain('rgba(1, 2, 3, 1)');
  });
});
