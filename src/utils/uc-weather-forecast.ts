import type { HomeAssistant } from '../ha/types';
import { requestPreviewUpdate } from './uc-preview-update';

export type WeatherForecastType = 'daily' | 'hourly';

export interface WeatherForecastSlot {
  datetime: string;
  condition?: string | undefined;
  temperature?: number | undefined;
  templow?: number | undefined;
  precipitation?: number | undefined;
  precipitation_probability?: number | undefined;
  uv_index?: number | undefined;
  wind_speed?: number | undefined;
  wind_bearing?: number | string | undefined;
  humidity?: number | undefined;
  [key: string]: unknown;
}

interface CacheEntry {
  slots: WeatherForecastSlot[];
  fetchedAt: number;
  fetching: boolean;
}

/** Refetch every 15 minutes. Shared by every weather module on the page. */
export const WEATHER_FORECAST_TTL = 15 * 60 * 1000;

const cache = new Map<string, CacheEntry>();

/** Attribute names some integrations (e.g. Pirate Weather) still expose. */
const LEGACY_ATTRS: Record<WeatherForecastType, string[]> = {
  daily: ['forecast', 'forecast_daily', 'daily', 'forecasts'],
  hourly: ['forecast_hourly', 'hourly'],
};

function legacyForecast(
  attributes: Record<string, unknown> | undefined,
  type: WeatherForecastType
): WeatherForecastSlot[] | undefined {
  if (!attributes) return undefined;
  for (const name of LEGACY_ATTRS[type]) {
    const value = attributes[name];
    if (Array.isArray(value) && value.length > 0) return value as WeatherForecastSlot[];
  }
  return undefined;
}

/**
 * Returns forecast slots for a weather entity, preferring legacy forecast
 * attributes and otherwise calling weather.get_forecasts (HA 2024.3+).
 * Returns cached slots right away and repaints when a fetch lands.
 */
export function getWeatherForecast(
  hass: HomeAssistant | undefined,
  entityId: string,
  type: WeatherForecastType,
  onUpdate: () => void = () => requestPreviewUpdate({ source: 'module-update', immediate: true })
): WeatherForecastSlot[] {
  if (!hass || !entityId) return [];
  const legacy = legacyForecast(hass.states?.[entityId]?.attributes, type);
  if (legacy) return legacy;

  const key = `${entityId}|${type}`;
  const cached = cache.get(key);
  const fresh = cached && Date.now() - cached.fetchedAt < WEATHER_FORECAST_TTL;

  if (!fresh && !cached?.fetching && hass.callWS && hass.states?.[entityId]) {
    const entry: CacheEntry = {
      slots: cached?.slots || [],
      fetchedAt: cached?.fetchedAt || 0,
      fetching: true,
    };
    cache.set(key, entry);

    hass
      .callWS<{ response?: Record<string, { forecast?: WeatherForecastSlot[] }> }>({
        type: 'call_service',
        domain: 'weather',
        service: 'get_forecasts',
        service_data: { type },
        target: { entity_id: entityId },
        return_response: true,
      })
      .then(resp => {
        const slots = resp?.response?.[entityId]?.forecast || [];
        cache.set(key, { slots, fetchedAt: Date.now(), fetching: false });
        onUpdate();
      })
      .catch(() => {
        // Integrations without this forecast type reject; back off for a full TTL.
        cache.set(key, { slots: entry.slots, fetchedAt: Date.now(), fetching: false });
      });
  }

  return cached?.slots || [];
}

/** Drops cached forecasts, e.g. after the editor switches forecast type. */
export function clearWeatherForecastCache(entityId?: string): void {
  if (!entityId) {
    cache.clear();
    return;
  }
  for (const key of [...cache.keys()]) {
    if (key.startsWith(`${entityId}|`)) cache.delete(key);
  }
}

/** Local calendar day key (YYYY-MM-DD) for grouping hourly slots by day. */
export function forecastDayKey(datetime: string): string {
  const d = new Date(datetime);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
