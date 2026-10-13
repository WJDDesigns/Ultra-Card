/**
 * Rain Radar data helpers: RainViewer frame list, tile URLs, map styles and
 * map-center resolution. Pure functions plus one shared, de-duplicated fetch
 * cache so several radar modules on a dashboard make a single request.
 *
 * RainViewer's public API is free and keyless. Since January 2026 it serves the
 * past ~2 hours in 10-minute frames, the Universal Blue color scheme only, and
 * radar tiles up to zoom 7 (Leaflet scales them up past that). Forecast
 * ("nowcast") frames are used when the source still lists them.
 */

import type { HomeAssistant } from '../ha/types';
import type {
  RainRadarMapProvider,
  RainRadarMapStyle,
  RainRadarModule,
  RainRadarSource,
} from '../types';

export const RAINVIEWER_MAPS_URL = 'https://api.rainviewer.com/public/weather-maps.json';
export const RAINVIEWER_ATTRIBUTION =
  '<a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>';

/** RainViewer's only free color scheme (Universal Blue). */
export const RADAR_COLOR_SCHEME = 2;
/** Highest zoom RainViewer's free tiles exist at. */
export const RAINVIEWER_MAX_NATIVE_ZOOM = 7;
/** Assumed for a custom (self-hosted) source. */
export const CUSTOM_SOURCE_MAX_NATIVE_ZOOM = 12;

export const DEFAULT_ZOOM = 7;
export const MIN_ZOOM = 3;
export const MAX_ZOOM = 12;
export const DEFAULT_HEIGHT = 300;
export const DEFAULT_OPACITY = 75;
export const DEFAULT_FRAME_DELAY = 500;
export const DEFAULT_END_PAUSE = 1500;
/** Minutes of past radar in the loop. RainViewer's free API keeps about two hours. */
export const DEFAULT_TIME_SPAN = 120;
export const TIME_SPAN_OPTIONS = [30, 60, 90, 120] as const;
/** How long a fetched frame list is reused. New radar frames arrive every 10 minutes. */
export const FRAMES_TTL_MS = 5 * 60 * 1000;

/** Domains offered for the center entity and markers. */
export const LOCATION_ENTITY_DOMAINS = ['person', 'device_tracker', 'zone'];

export interface RadarFrame {
  /** Unix seconds. */
  time: number;
  /** Path segment to put after the host (opaque; use as-is). */
  path: string;
  forecast: boolean;
}

/** How a frame set's tiles are addressed. */
export type RadarProvider = 'rainviewer' | 'openweather2' | 'openweather1' | 'rainbow';

export interface RadarFrameSet {
  /** Tile host (RainViewer), or the API key for OpenWeather and Rainbow sets. */
  host: string;
  /** Missing means RainViewer. */
  provider?: RadarProvider | undefined;
  frames: RadarFrame[];
  /** When this set was fetched (ms). */
  fetchedAt: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BaseMapStyle {
  url: string;
  /** Optional place-name layer drawn above the radar. */
  labelsUrl?: string;
  attribution: string;
  maxZoom: number;
}

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const ESRI_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>';

/**
 * All base maps come from Esri's public ArcGIS tile services: keyless and they
 * accept requests from a Home Assistant page. CARTO now requires an API key and
 * the OpenStreetMap tile servers reject dashboard requests ("Access blocked"),
 * so neither is used. Light, dark and satellite get a separate labels layer
 * drawn above the radar so place names stay readable through the rain.
 */
const BASE_MAPS: Record<Exclude<RainRadarMapStyle, 'auto'>, BaseMapStyle> = {
  light: {
    url: `${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labelsUrl: `${ESRI}/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
    attribution: ESRI_ATTRIBUTION,
    maxZoom: 16,
  },
  dark: {
    url: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labelsUrl: `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
    attribution: ESRI_ATTRIBUTION,
    maxZoom: 16,
  },
  streets: {
    url: `${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`,
    attribution: ESRI_ATTRIBUTION,
    maxZoom: 18,
  },
  satellite: {
    url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    labelsUrl: `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,
    attribution: ESRI_ATTRIBUTION,
    maxZoom: 18,
  },
};

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function isDarkMode(hass: HomeAssistant | undefined): boolean {
  const themes: unknown = hass?.themes;
  return (
    !!themes && typeof themes === 'object' && (themes as Record<string, unknown>).darkMode === true
  );
}

/** The concrete base map for a style, resolving `auto` from HA's dark mode. */
export function resolveMapStyle(
  style: RainRadarMapStyle | undefined,
  dark: boolean
): Exclude<RainRadarMapStyle, 'auto'> {
  if (!style || style === 'auto') return dark ? 'dark' : 'light';
  return style in BASE_MAPS ? style : 'light';
}

export function baseMapFor(style: Exclude<RainRadarMapStyle, 'auto'>): BaseMapStyle {
  return BASE_MAPS[style];
}

// ── Keyed base map providers (opt-in, the user's own key) ───────────────────

type ConcreteStyle = Exclude<RainRadarMapStyle, 'auto'>;

const MAPBOX_STYLES: Record<ConcreteStyle, string> = {
  light: 'light-v11',
  dark: 'dark-v11',
  streets: 'streets-v12',
  satellite: 'satellite-streets-v12',
};

const MAPTILER_STYLES: Record<ConcreteStyle, { id: string; ext: string }> = {
  light: { id: 'basic-v2-light', ext: 'png' },
  dark: { id: 'basic-v2-dark', ext: 'png' },
  streets: { id: 'streets-v2', ext: 'png' },
  satellite: { id: 'hybrid', ext: 'jpg' },
};

/** A key that can safely go in a URL (provider keys and tokens are alphanumeric plus . _ -). */
export function mapApiKey(module: Pick<RainRadarModule, 'map_api_key'>): string {
  const key = (module.map_api_key || '').trim();
  return /^[A-Za-z0-9._-]{8,256}$/.test(key) ? key : '';
}

/** The provider actually used: a keyed provider only once its key is set, otherwise Esri. */
export function mapProviderFor(
  module: Pick<RainRadarModule, 'map_provider' | 'map_api_key'>
): RainRadarMapProvider {
  const p = module.map_provider;
  if ((p === 'google' || p === 'mapbox' || p === 'maptiler') && mapApiKey(module)) return p;
  return 'esri';
}

/**
 * Base map for Mapbox or MapTiler (synchronous URL templates). Google needs a
 * session first, see {@link loadGoogleBaseMap}.
 */
export function keyedBaseMap(
  provider: 'mapbox' | 'maptiler',
  style: ConcreteStyle,
  key: string
): BaseMapStyle {
  const k = encodeURIComponent(key);
  if (provider === 'mapbox') {
    return {
      url: `https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLES[style]}/tiles/256/{z}/{x}/{y}?access_token=${k}`,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 19,
    };
  }
  const s = MAPTILER_STYLES[style];
  return {
    url: `https://api.maptiler.com/maps/${s.id}/256/{z}/{x}/{y}.${s.ext}?key=${k}`,
    attribution:
      '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19,
  };
}

/** A dark look for Google's road map (Map Tiles API styles). */
const GOOGLE_DARK_STYLES = [
  { stylers: [{ hue: '#1d2c4d' }, { saturation: -60 }, { invert_lightness: true }] },
];

const googleSessions = new Map<string, { session: string; expires: number }>();

type JsonFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string }
) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

/**
 * Google Map Tiles API: create (or reuse) a session for the style, then return
 * its tile URL. Throws when Google rejects the key, so the caller can fall back
 * to Esri.
 */
export async function loadGoogleBaseMap(
  style: ConcreteStyle,
  key: string,
  language = 'en',
  now: number = Date.now(),
  fetcher: JsonFetch = (u, init) => fetch(u, init)
): Promise<BaseMapStyle> {
  const cacheKey = `${key}|${style}|${language}`;
  let entry = googleSessions.get(cacheKey);
  if (!entry || entry.expires - now < 60 * 60 * 1000) {
    const body: Record<string, unknown> = {
      mapType: style === 'satellite' ? 'satellite' : 'roadmap',
      language: language || 'en',
      region: 'US',
      scale: 'scaleFactor1x',
    };
    if (style === 'satellite') body.layerTypes = ['layerRoadmap'];
    if (style === 'dark') body.styles = GOOGLE_DARK_STYLES;
    const res = await fetcher(
      `https://tile.googleapis.com/v1/createSession?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) throw new Error('Google rejected the map key');
    const data = (await res.json()) as { session?: unknown; expiry?: unknown };
    if (typeof data.session !== 'string' || !data.session) throw new Error('No Google session');
    const expiry = Number(data.expiry);
    entry = {
      session: data.session,
      expires: Number.isFinite(expiry) ? expiry * 1000 : now + 12 * 60 * 60 * 1000,
    };
    googleSessions.set(cacheKey, entry);
  }
  return {
    url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${encodeURIComponent(entry.session)}&key=${encodeURIComponent(key)}`,
    attribution: 'Map data &copy; Google',
    maxZoom: 20,
  };
}

/** Test hook. */
export function clearGoogleSessions(): void {
  googleSessions.clear();
}

function coord(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

function validLatLng(lat: number | null, lng: number | null): LatLng | null {
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** Coordinates from an entity's latitude / longitude attributes. */
export function entityLatLng(
  hass: HomeAssistant | undefined,
  entityId: string | undefined
): LatLng | null {
  if (!hass?.states || !entityId) return null;
  const attrs = hass.states[entityId]?.attributes;
  if (!attrs) return null;
  return validLatLng(coord(attrs.latitude), coord(attrs.longitude));
}

/** Home Assistant's configured home location. */
export function homeLatLng(hass: HomeAssistant | undefined): LatLng | null {
  const config = (hass as { config?: { latitude?: unknown; longitude?: unknown } } | undefined)
    ?.config;
  if (config) {
    const fromConfig = validLatLng(coord(config.latitude), coord(config.longitude));
    if (fromConfig) return fromConfig;
  }
  return entityLatLng(hass, 'zone.home');
}

/**
 * Where the map should be centered. Falls back to the home location when the
 * chosen entity has no coordinates (yet) or the manual ones are incomplete.
 */
export function resolveCenter(
  module: Pick<RainRadarModule, 'center_mode' | 'center_entity' | 'latitude' | 'longitude'>,
  hass: HomeAssistant | undefined
): LatLng | null {
  const mode = module.center_mode || 'home';
  if (mode === 'entity') {
    const fromEntity = entityLatLng(hass, module.center_entity);
    if (fromEntity) return fromEntity;
  } else if (mode === 'manual') {
    const manual = validLatLng(coord(module.latitude), coord(module.longitude));
    if (manual) return manual;
  }
  return homeLatLng(hass);
}

/** Parse a weather-maps.json payload into an ordered frame list. */
export function parseWeatherMaps(
  payload: unknown,
  includeForecast: boolean,
  fetchedAt: number
): RadarFrameSet | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const host = typeof data.host === 'string' ? data.host.replace(/\/+$/, '') : '';
  const radar =
    data.radar && typeof data.radar === 'object' ? (data.radar as Record<string, unknown>) : null;
  if (!host || !radar) return null;

  const read = (list: unknown, forecast: boolean): RadarFrame[] =>
    (Array.isArray(list) ? list : [])
      .map(item => {
        if (!item || typeof item !== 'object') return null;
        const rec = item as Record<string, unknown>;
        const time = coord(rec.time);
        const path = typeof rec.path === 'string' ? rec.path : '';
        if (time === null || !path) return null;
        return { time, path, forecast };
      })
      .filter((f): f is RadarFrame => f !== null);

  const frames = [
    ...read(radar.past, false),
    ...(includeForecast ? read(radar.nowcast, true) : []),
  ];
  frames.sort((a, b) => a.time - b.time);
  // Drop duplicate timestamps (a nowcast frame can repeat the newest past one).
  const unique = frames.filter((f, i) => i === 0 || f.time !== frames[i - 1]?.time);
  if (!unique.length) return null;
  return { host, frames: unique, fetchedAt };
}

/** Leaflet tile URL template for one radar frame. */
export function radarTileUrl(
  host: string,
  frame: Pick<RadarFrame, 'path'>,
  options: { smooth: boolean; snow: boolean }
): string {
  const path = frame.path.startsWith('/') ? frame.path : `/${frame.path}`;
  return `${host}${path}/256/{z}/{x}/{y}/${RADAR_COLOR_SCHEME}/${options.smooth ? 1 : 0}_${options.snow ? 1 : 0}.png`;
}

/** Index of the newest observed (non-forecast) frame; the loop starts and pauses there. */
export function latestObservedIndex(frames: readonly RadarFrame[]): number {
  for (let i = frames.length - 1; i >= 0; i--) {
    if (frames[i]?.forecast === false) return i;
  }
  return Math.max(0, frames.length - 1);
}

/**
 * Keep only the past frames inside the last `minutes` (counted back from the
 * newest observed frame, so the window doesn't shrink while data is a few
 * minutes old). Forecast frames are always kept.
 */
export function filterByTimeSpan(frames: readonly RadarFrame[], minutes: unknown): RadarFrame[] {
  const span = clampNumber(minutes, 10, 24 * 60, DEFAULT_TIME_SPAN);
  const newest = frames[latestObservedIndex(frames)];
  if (!newest || newest.forecast) return [...frames];
  const cutoff = newest.time - span * 60;
  return frames.filter(f => f.forecast || f.time >= cutoff);
}

/** Signed whole minutes from now to a frame (negative = past). */
export function minutesFromNow(frameTime: number, nowMs: number): number {
  return Math.round((frameTime * 1000 - nowMs) / 60000);
}

/** The radar source URL to use for a module. Only http(s) URLs are accepted. */
export function sourceUrlFor(module: Pick<RainRadarModule, 'source_url'>): string {
  const custom = (module.source_url || '').trim();
  return /^https?:\/\//i.test(custom) ? custom : RAINVIEWER_MAPS_URL;
}

type SourceFields = Pick<
  RainRadarModule,
  'source_url' | 'radar_source' | 'openweather_api_key' | 'rainbow_api_key'
>;

export function maxNativeZoomFor(module: SourceFields): number {
  const source = radarSourceFor(module);
  if (source === 'openweather') return OPENWEATHER_MAX_NATIVE_ZOOM;
  if (source === 'rainbow') return RAINBOW_MAX_NATIVE_ZOOM;
  return sourceUrlFor(module) === RAINVIEWER_MAPS_URL
    ? RAINVIEWER_MAX_NATIVE_ZOOM
    : CUSTOM_SOURCE_MAX_NATIVE_ZOOM;
}

// ── OpenWeather (opt-in, the user's own key) ────────────────────────────────

export const OPENWEATHER_ATTRIBUTION =
  '<a href="https://openweathermap.org/" target="_blank" rel="noopener">OpenWeather</a>';
export const OPENWEATHER_MAX_NATIVE_ZOOM = 9;
/** Weather Maps 2.0 precipitation intensity layer; accepts a `date` for history and forecast. */
const OPENWEATHER_V2 = 'https://maps.openweathermap.org/maps/2.0/weather/PR0';
/** Weather Maps 1.0 precipitation layer: current conditions only, included in the free plan. */
const OPENWEATHER_V1 = 'https://tile.openweathermap.org/map/precipitation_new';
const HOUR = 3600;
/** Forecast hours added after "now" for OpenWeather. */
const OPENWEATHER_FORECAST_HOURS = 3;

export function openWeatherKey(module: Pick<RainRadarModule, 'openweather_api_key'>): string {
  const key = (module.openweather_api_key || '').trim();
  // Keys are hex; anything else can't be valid and must not be put in a URL.
  return /^[A-Za-z0-9]{8,64}$/.test(key) ? key : '';
}

/** A keyed source is used only when chosen AND its key is set; otherwise RainViewer. */
export function radarSourceFor(module: SourceFields): RainRadarSource {
  if (module.radar_source === 'openweather' && openWeatherKey(module)) return 'openweather';
  if (module.radar_source === 'rainbow' && rainbowKey(module)) return 'rainbow';
  return 'rainviewer';
}

/**
 * Hourly OpenWeather frames: the past `minutes` (at least one hour back), the
 * current hour, and a few forecast hours. Weather Maps data is hourly, so finer
 * steps would only repeat tiles.
 */
export function openWeatherFrames(
  nowMs: number,
  minutes: unknown,
  includeForecast: boolean
): RadarFrame[] {
  const span = clampNumber(minutes, 10, 24 * 60, DEFAULT_TIME_SPAN);
  const current = Math.floor(nowMs / 1000 / HOUR) * HOUR;
  const back = Math.max(1, Math.round(span / 60));
  const frames: RadarFrame[] = [];
  for (let h = -back; h <= (includeForecast ? OPENWEATHER_FORECAST_HOURS : 0); h++) {
    const time = current + h * HOUR;
    frames.push({ time, path: String(time), forecast: h > 0 });
  }
  return frames;
}

export function openWeatherTileUrl(
  key: string,
  frame: Pick<RadarFrame, 'path'>,
  provider: 'openweather2' | 'openweather1'
): string {
  const appid = encodeURIComponent(key);
  if (provider === 'openweather1') return `${OPENWEATHER_V1}/{z}/{x}/{y}.png?appid=${appid}`;
  return `${OPENWEATHER_V2}/{z}/{x}/{y}?appid=${appid}&date=${encodeURIComponent(frame.path)}&opacity=1`;
}

/** Resolves true when an image URL loads. Tiles can't be fetched (no CORS), but images can. */
export type TileProbe = (url: string) => Promise<boolean>;

const imageProbe: TileProbe = url =>
  new Promise(resolve => {
    if (typeof Image === 'undefined') return resolve(false);
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.referrerPolicy = 'strict-origin-when-cross-origin';
    img.src = url;
  });

const providerCache = new Map<string, { provider: RadarProvider; at: number }>();

/**
 * Frames for OpenWeather. Tries Weather Maps 2.0 (animated; paid plans) and
 * falls back to the free 1.0 layer (current conditions only). Throws when the
 * key works for neither.
 */
export async function loadOpenWeatherFrames(
  key: string,
  includeForecast: boolean,
  minutes: unknown,
  now: number = Date.now(),
  probe: TileProbe = imageProbe
): Promise<RadarFrameSet> {
  let provider = providerCache.get(key);
  if (!provider || now - provider.at > 6 * HOUR * 1000) {
    const frame = { path: String(Math.floor(now / 1000 / HOUR) * HOUR) };
    const tile = (p: 'openweather2' | 'openweather1') =>
      openWeatherTileUrl(key, frame, p).replace('{z}/{x}/{y}', '2/2/1');
    let found: RadarProvider | null = null;
    if (await probe(tile('openweather2'))) found = 'openweather2';
    else if (await probe(tile('openweather1'))) found = 'openweather1';
    if (!found) throw new Error('OpenWeather rejected the API key');
    provider = { provider: found, at: now };
    providerCache.set(key, provider);
  }
  const frames =
    provider.provider === 'openweather2'
      ? openWeatherFrames(now, minutes, includeForecast)
      : [{ time: Math.floor(now / 1000), path: 'now', forecast: false }];
  return { host: key, provider: provider.provider, frames, fetchedAt: now };
}

// ── Rainbow.ai (opt-in, the user's own key) ─────────────────────────────────

export const RAINBOW_ATTRIBUTION =
  '<a href="https://www.rainbow.ai/" target="_blank" rel="noopener">Rainbow.ai</a>';
/** Rainbow precipitation tiles are served up to zoom 7; Leaflet scales them beyond. */
export const RAINBOW_MAX_NATIVE_ZOOM = 7;
const RAINBOW_API = 'https://api.rainbow.ai/tiles/v1';
/**
 * Forecast offsets (seconds after the snapshot). Rainbow forecasts 4 hours in
 * 10-minute steps, but every frame costs a screenful of tiles from the free
 * monthly allowance, so only half-hour steps for two hours are shown.
 */
export const RAINBOW_FORECAST_OFFSETS = [0, 1800, 3600, 5400, 7200] as const;
/** Snapshots update every 10 minutes; checking more often only spends quota. */
export const RAINBOW_TTL_MS = 10 * 60 * 1000;

export function rainbowKey(module: Pick<RainRadarModule, 'rainbow_api_key'>): string {
  const key = (module.rainbow_api_key || '').trim();
  return /^[A-Za-z0-9_-]{8,128}$/.test(key) ? key : '';
}

/** Frames for one Rainbow snapshot: now, plus forecast steps when wanted. */
export function rainbowFrames(snapshot: number, includeForecast: boolean): RadarFrame[] {
  const offsets = includeForecast ? RAINBOW_FORECAST_OFFSETS : RAINBOW_FORECAST_OFFSETS.slice(0, 1);
  return offsets.map(offset => ({
    time: snapshot + offset,
    path: `${snapshot}/${offset}`,
    forecast: offset > 0,
  }));
}

export function rainbowTileUrl(key: string, frame: Pick<RadarFrame, 'path'>): string {
  return `${RAINBOW_API}/precip/${frame.path}/{z}/{x}/{y}?token=${encodeURIComponent(key)}`;
}

/** Read the snapshot timestamp from a Rainbow snapshot response. */
export function parseRainbowSnapshot(payload: unknown): number | null {
  const value = (payload as { snapshot?: unknown } | null)?.snapshot;
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

const rainbowCache = new Map<string, { snapshot: number; at: number }>();

/** Snapshot endpoints; Rainbow's docs show both paths. */
const RAINBOW_SNAPSHOT_URLS = [
  `${RAINBOW_API}/snapshot`,
  'https://api.rainbow.ai/v1/weather/map/snapshot',
] as const;
const RAINBOW_STEP = 600;

/** Ask the snapshot endpoints; null when none answers (refused key, or the browser blocks the request). */
async function fetchRainbowSnapshot(key: string, fetcher: FetchLike): Promise<number | null> {
  for (const url of RAINBOW_SNAPSHOT_URLS) {
    try {
      const res = await fetcher(`${url}?token=${encodeURIComponent(key)}`);
      if (!res.ok) continue;
      const snapshot = parseRainbowSnapshot(await res.json());
      if (snapshot !== null) return snapshot;
    } catch {
      // Network or CORS failure: try the next endpoint, then tile probing.
    }
  }
  return null;
}

/**
 * Find the newest snapshot by loading one tile per candidate time. Images need
 * no CORS, so this works even when the snapshot endpoint can't be read.
 */
async function probeRainbowSnapshot(
  key: string,
  now: number,
  probe: TileProbe
): Promise<number | null> {
  const newest = Math.floor(now / 1000 / RAINBOW_STEP) * RAINBOW_STEP;
  for (let k = 0; k < 6; k++) {
    const snapshot = newest - k * RAINBOW_STEP;
    const url = rainbowTileUrl(key, { path: `${snapshot}/0` }).replace('{z}/{x}/{y}', '2/1/1');
    if (await probe(url)) return snapshot;
  }
  return null;
}

/** Frames for Rainbow.ai. Throws when the key is refused or no snapshot is found. */
export async function loadRainbowFrames(
  key: string,
  includeForecast: boolean,
  now: number = Date.now(),
  fetcher: FetchLike = (u: string) => fetch(u, { cache: 'no-store' }),
  probe: TileProbe = imageProbe
): Promise<RadarFrameSet> {
  let hit = rainbowCache.get(key);
  if (!hit || now - hit.at >= RAINBOW_TTL_MS) {
    const snapshot =
      (await fetchRainbowSnapshot(key, fetcher)) ?? (await probeRainbowSnapshot(key, now, probe));
    if (snapshot === null) throw new Error('Rainbow.ai returned no radar for this key');
    hit = { snapshot, at: now };
    rainbowCache.set(key, hit);
  }
  return {
    host: key,
    provider: 'rainbow',
    frames: rainbowFrames(hit.snapshot, includeForecast),
    fetchedAt: hit.at,
  };
}

/** Attribution for the radar layer of a frame set. */
export function radarAttributionFor(provider: RadarProvider | undefined): string {
  if (provider === 'rainbow') return RAINBOW_ATTRIBUTION;
  if (provider === 'openweather2' || provider === 'openweather1') return OPENWEATHER_ATTRIBUTION;
  return RAINVIEWER_ATTRIBUTION;
}

/** Tile URL template for any frame set. */
export function frameTileUrl(
  set: Pick<RadarFrameSet, 'host' | 'provider'>,
  frame: Pick<RadarFrame, 'path'>,
  options: { smooth: boolean; snow: boolean }
): string {
  if (set.provider === 'rainbow') return rainbowTileUrl(set.host, frame);
  if (set.provider === 'openweather2' || set.provider === 'openweather1') {
    return openWeatherTileUrl(set.host, frame, set.provider);
  }
  return radarTileUrl(set.host, frame, options);
}

/** Load the frames for a module from whichever source it uses. */
export async function loadModuleFrames(
  module: SourceFields & Pick<RainRadarModule, 'show_forecast' | 'time_span'>
): Promise<RadarFrameSet> {
  const forecast = module.show_forecast !== false;
  if (radarSourceFor(module) === 'openweather') {
    return loadOpenWeatherFrames(openWeatherKey(module), forecast, module.time_span);
  }
  if (radarSourceFor(module) === 'rainbow') {
    return loadRainbowFrames(rainbowKey(module), forecast);
  }
  const set = await loadRadarFrames(sourceUrlFor(module), forecast);
  return { ...set, frames: filterByTimeSpan(set.frames, module.time_span) };
}

/** Identifies the source a module reads, to know when to reload. */
export function sourceKeyFor(
  module: SourceFields & Pick<RainRadarModule, 'show_forecast' | 'time_span'>
): string {
  const source = radarSourceFor(module);
  const src =
    source === 'openweather'
      ? `owm:${openWeatherKey(module)}`
      : source === 'rainbow'
        ? `rainbow:${rainbowKey(module)}`
        : sourceUrlFor(module);
  return `${src}|${module.show_forecast !== false}|${module.time_span ?? ''}`;
}

type FetchLike = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

interface CacheEntry {
  payload: unknown;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

/**
 * Fetch (or reuse) the frame list for a source. Concurrent callers share one
 * request; a result is reused for {@link FRAMES_TTL_MS}. Throws on failure.
 */
export async function loadRadarFrames(
  url: string,
  includeForecast: boolean,
  now: number = Date.now(),
  fetcher: FetchLike = (u: string) => fetch(u, { cache: 'no-store' })
): Promise<RadarFrameSet> {
  const hit = cache.get(url);
  let entry: CacheEntry;
  if (hit && now - hit.fetchedAt < FRAMES_TTL_MS) {
    entry = hit;
  } else {
    let pending = inflight.get(url);
    if (!pending) {
      pending = (async () => {
        const res = await fetcher(url);
        if (!res.ok) throw new Error('Radar source returned an error');
        const fresh: CacheEntry = { payload: await res.json(), fetchedAt: now };
        cache.set(url, fresh);
        return fresh;
      })();
      inflight.set(url, pending);
      pending.then(
        () => inflight.delete(url),
        () => inflight.delete(url)
      );
    }
    entry = await pending;
  }
  const set = parseWeatherMaps(entry.payload, includeForecast, entry.fetchedAt);
  if (!set) throw new Error('Radar source returned no frames');
  return set;
}

/** Test hook. */
export function clearRadarCache(): void {
  cache.clear();
  inflight.clear();
  providerCache.clear();
  rainbowCache.clear();
}
