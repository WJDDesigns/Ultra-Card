/**
 * Open-Meteo weather layers for the Rain Radar module.
 *
 * Draws one Open-Meteo model field (temperature, precipitation, wind, clouds
 * or air quality) for the current hour under the radar, using Open-Meteo's
 * `@openmeteo/weather-map-layer` and its Leaflet adapter. The package renders
 * tiles in the browser straight from Open-Meteo's public `.om` files on S3,
 * so there is no key and no tile server.
 *
 * License: the package is published as GPL-2.0. Open-Meteo (Patrick
 * Zippenfenig, OpenMeteo GmbH, ticket #235009, 20 Oct 2026) granted Ultra Card
 * permission to use and bundle it under MIT. See THIRD_PARTY_NOTICES.md.
 *
 * The package ships a 2 MB WebAssembly decoder and a render worker next to
 * its module file, which a HACS install can't carry (HACS only ships the
 * uc-*.js chunks). So it is loaded on demand from jsDelivr, pinned to an
 * exact version, the first time a card turns a weather layer on. Nobody who
 * leaves the layer off downloads anything.
 */

import type { RainRadarModule, RainRadarWeatherLayer } from '../types';

export const OPEN_METEO_LAYER_VERSION = '0.3.0';
export const OPEN_METEO_LAYER_URL = `https://cdn.jsdelivr.net/npm/@openmeteo/weather-map-layer@${OPEN_METEO_LAYER_VERSION}/dist/index.mjs`;
export const OPEN_METEO_DATA_URL = 'https://openmeteo.s3.amazonaws.com/data_spatial';
export const OPEN_METEO_ATTRIBUTION =
  'Weather &copy; <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>';
export const DEFAULT_WEATHER_LAYER_OPACITY = 60;
/** Re-resolve "now" this often so the layer follows the clock. */
export const WEATHER_LAYER_REFRESH_MS = 30 * 60 * 1000;

export const WEATHER_LAYERS: readonly Exclude<RainRadarWeatherLayer, 'none'>[] = [
  'temperature',
  'precipitation',
  'wind',
  'clouds',
  'air_quality',
];

interface LayerSpec {
  variable: string;
  /** Air quality comes from CAMS, not from the weather model. */
  domain?: string;
}

const LAYER_SPECS: Record<Exclude<RainRadarWeatherLayer, 'none'>, LayerSpec> = {
  temperature: { variable: 'temperature_2m' },
  precipitation: { variable: 'precipitation' },
  wind: { variable: 'wind_speed_10m' },
  clouds: { variable: 'cloud_cover' },
  air_quality: { variable: 'pm2_5', domain: 'cams_global' },
};

/**
 * Models offered in the editor. Seamless domains blend a regional model into
 * a global one. `ncep_gfs_seamless` is left out on purpose: its global part
 * (GFS 0.25°) holds no surface fields, so everything outside the US goes blank.
 */
export const WEATHER_MODELS: readonly { value: string; label: string }[] = [
  { value: 'dwd_icon_seamless', label: 'DWD ICON (global + Europe)' },
  { value: 'ncep_gfs013', label: 'NOAA GFS (global)' },
  { value: 'ecmwf_ifs025', label: 'ECMWF IFS (global)' },
  { value: 'cmc_gem_seamless', label: 'GEM (Canada)' },
  { value: 'ukmo_seamless', label: 'UK Met Office' },
  { value: 'meteofrance_seamless', label: 'Météo-France' },
  { value: 'knmi_seamless', label: 'KNMI (Netherlands)' },
  { value: 'jma_seamless', label: 'JMA (Japan)' },
];

const MODEL_VALUES = new Set(WEATHER_MODELS.map(m => m.value));

type Box = [south: number, west: number, north: number, east: number];
const inBox = (lat: number, lng: number, [s, w, n, e]: Box): boolean =>
  lat >= s && lat <= n && lng >= w && lng <= e;

/** The best model for a place: the regional one that covers it, else a global one. */
export function autoWeatherModel(lat: number, lng: number): string {
  if (inBox(lat, lng, [49.8, -8.7, 60.9, 1.9])) return 'ukmo_seamless';
  if (inBox(lat, lng, [50.7, 3.2, 53.7, 7.3])) return 'knmi_seamless';
  if (inBox(lat, lng, [41.3, -5.2, 51.1, 9.6])) return 'meteofrance_seamless';
  if (inBox(lat, lng, [24, 122, 46, 146])) return 'jma_seamless';
  // Canada south of the Arctic, above the US border.
  if (inBox(lat, lng, [49, -141, 70, -52])) return 'cmc_gem_seamless';
  // The Americas: GFS at 0.13° covers the whole globe, hourly.
  if (lng >= -170 && lng <= -30) return 'ncep_gfs013';
  return 'dwd_icon_seamless';
}

export function weatherLayerOf(m: Partial<RainRadarModule>): RainRadarWeatherLayer {
  const layer = m.weather_layer;
  return layer && (WEATHER_LAYERS as readonly string[]).includes(layer) ? layer : 'none';
}

/** The domain a layer reads from at a place, honoring the module's model choice. */
export function weatherDomainFor(
  m: Partial<RainRadarModule>,
  center: { lat: number; lng: number }
): string | null {
  const layer = weatherLayerOf(m);
  if (layer === 'none') return null;
  const fixed = LAYER_SPECS[layer].domain;
  if (fixed) return fixed;
  const chosen = (m.weather_model || '').trim();
  return chosen && chosen !== 'auto' && MODEL_VALUES.has(chosen)
    ? chosen
    : autoWeatherModel(center.lat, center.lng);
}

export function weatherVariableFor(layer: RainRadarWeatherLayer): string | null {
  return layer === 'none' ? null : LAYER_SPECS[layer].variable;
}

/** `om://` TileJSON URL for the latest run at the current hour. */
export function weatherLayerUrl(domain: string, variable: string, dark: boolean): string {
  const params = new URLSearchParams({ time_step: 'current_time_1H', variable });
  if (dark) params.set('dark', 'true');
  return `om://${OPEN_METEO_DATA_URL}/${domain}/latest.json?${params.toString()}`;
}

/**
 * Color scales the package lacks. PM2.5 uses the European Air Quality Index
 * bands (µg/m³): good, fair, moderate, poor, very poor, extremely poor.
 */
export const EXTRA_COLOR_SCALES: Record<string, OpenMeteoColorScale> = {
  pm2_5: {
    type: 'breakpoint',
    unit: 'µg/m³',
    breakpoints: [0, 10, 20, 25, 50, 75],
    colors: [
      [80, 240, 230, 0.55],
      [80, 204, 170, 0.75],
      [240, 230, 65, 0.85],
      [255, 80, 80, 0.9],
      [150, 0, 50, 0.95],
      [125, 33, 129, 1],
    ],
  },
};

// ── Loader ────────────────────────────────────────────────────────────────────

/** The subset of the package this module uses. */
export interface OpenMeteoLib {
  omProtocol: unknown;
  defaultOmProtocolSettings: unknown;
  addLeafletProtocolSupport: (L: unknown) => {
    addProtocol: (protocol: string, handler: unknown, settings?: unknown) => void;
    createTileLayer: (url: string, options?: Record<string, unknown>) => unknown;
  };
  getColorScale?: (variable: string, dark: boolean) => OpenMeteoColorScale;
}

export type OpenMeteoColorScale =
  | { type: 'rgba'; unit: string; min: number; max: number; colors: number[][] }
  | { type: 'breakpoint'; unit: string; breakpoints: number[]; colors: number[][] };

export interface OpenMeteoAdapter {
  lib: OpenMeteoLib;
  createTileLayer: (url: string, options?: Record<string, unknown>) => unknown;
}

type Importer = (url: string) => Promise<OpenMeteoLib>;

const defaultImporter: Importer = url =>
  import(/* webpackIgnore: true */ /* @vite-ignore */ url) as Promise<OpenMeteoLib>;

let adapterPromise: Promise<OpenMeteoAdapter> | null = null;

/**
 * Load the package once and register the `om` protocol on this Leaflet. A
 * failed load is forgotten so the next attempt (or a page with the network
 * back) can try again.
 */
export function loadOpenMeteoAdapter(
  leaflet: unknown,
  importer: Importer = defaultImporter
): Promise<OpenMeteoAdapter> {
  if (!adapterPromise) {
    adapterPromise = importer(OPEN_METEO_LAYER_URL)
      .then(lib => {
        if (typeof lib?.addLeafletProtocolSupport !== 'function') {
          throw new Error('Open-Meteo layer did not load');
        }
        const adapter = lib.addLeafletProtocolSupport(leaflet);
        const defaults = (lib.defaultOmProtocolSettings || {}) as {
          colorScales?: Record<string, unknown>;
        };
        const settings = {
          ...defaults,
          colorScales: { ...(defaults.colorScales || {}), ...EXTRA_COLOR_SCALES },
        };
        adapter.addProtocol('om', lib.omProtocol, settings);
        return { lib, createTileLayer: adapter.createTileLayer };
      })
      .catch(err => {
        adapterPromise = null;
        throw err;
      });
  }
  return adapterPromise;
}

/** Test hook. */
export function resetOpenMeteoAdapter(): void {
  adapterPromise = null;
}

// ── Legend ────────────────────────────────────────────────────────────────────

const rgba = (c: number[]): string => {
  const [r = 0, g = 0, b = 0, a = 1] = c;
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a > 1 ? a / 255 : a})`;
};

export interface WeatherLegend {
  gradient: string;
  min: string;
  max: string;
  unit: string;
}

/** A CSS gradient and end labels for a package color scale. */
export function weatherLegendFrom(
  scale: OpenMeteoColorScale | undefined | null,
  fahrenheit = false
): WeatherLegend | null {
  if (!scale || !Array.isArray(scale.colors) || scale.colors.length < 2) return null;
  const n = scale.colors.length;
  const stops = scale.colors.map((c, i) => `${rgba(c)} ${((i / (n - 1)) * 100).toFixed(1)}%`);
  const fmt = (v: number) => String(Math.round(v * 10) / 10);
  let min: number;
  let max: number;
  if (scale.type === 'breakpoint') {
    if (!scale.breakpoints?.length) return null;
    min = scale.breakpoints[0];
    max = scale.breakpoints[scale.breakpoints.length - 1];
  } else {
    min = scale.min;
    max = scale.max;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  // The scale is in °C; label it in the home's own unit.
  if (fahrenheit && scale.unit === '°C') {
    const toF = (c: number) => Math.round((c * 9) / 5 + 32);
    return {
      gradient: `linear-gradient(90deg, ${stops.join(', ')})`,
      min: String(toF(min)),
      max: String(toF(max)),
      unit: '°F',
    };
  }
  return {
    gradient: `linear-gradient(90deg, ${stops.join(', ')})`,
    min: fmt(min),
    max: fmt(max),
    unit: scale.unit || '',
  };
}
