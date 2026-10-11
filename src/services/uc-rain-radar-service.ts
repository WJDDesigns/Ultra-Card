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
import type { RainRadarMapStyle, RainRadarModule } from '../types';

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

export interface RadarFrameSet {
  host: string;
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
  attribution: string;
  subdomains?: string;
  maxZoom: number;
}

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';

const BASE_MAPS: Record<Exclude<RainRadarMapStyle, 'auto'>, BaseMapStyle> = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19,
  },
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
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

/** Signed whole minutes from now to a frame (negative = past). */
export function minutesFromNow(frameTime: number, nowMs: number): number {
  return Math.round((frameTime * 1000 - nowMs) / 60000);
}

/** The radar source URL to use for a module. Only http(s) URLs are accepted. */
export function sourceUrlFor(module: Pick<RainRadarModule, 'source_url'>): string {
  const custom = (module.source_url || '').trim();
  return /^https?:\/\//i.test(custom) ? custom : RAINVIEWER_MAPS_URL;
}

export function maxNativeZoomFor(module: Pick<RainRadarModule, 'source_url'>): number {
  return sourceUrlFor(module) === RAINVIEWER_MAPS_URL
    ? RAINVIEWER_MAX_NATIVE_ZOOM
    : CUSTOM_SOURCE_MAX_NATIVE_ZOOM;
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
}
