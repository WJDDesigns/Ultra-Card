import { svg, type SVGTemplateResult } from 'lit';
import type { HomeAssistant } from '../ha/types';

/**
 * Optional local weather station sensors that override the matching values of a
 * weather.* entity. A station measures the current conditions but can't forecast,
 * so the condition icon and forecast still come from the weather entity.
 */
export interface WeatherStationSensorFields {
  temperature_entity?: string | undefined;
  humidity_entity?: string | undefined;
  feels_like_entity?: string | undefined;
  dew_point_entity?: string | undefined;
  pressure_entity?: string | undefined;
  wind_speed_entity?: string | undefined;
  wind_gust_entity?: string | undefined;
  wind_direction_entity?: string | undefined;
  precipitation_entity?: string | undefined;
  uv_index_entity?: string | undefined;
}

export type WeatherStationKey =
  | 'temperature'
  | 'humidity'
  | 'feels_like'
  | 'dew_point'
  | 'pressure'
  | 'wind_speed'
  | 'wind_gust'
  | 'wind_direction'
  | 'precipitation'
  | 'uv_index';

export interface WeatherStationSensorDef {
  key: WeatherStationKey;
  field: keyof WeatherStationSensorFields;
  label: string;
  icon: string;
  /** weather.* attribute used when no sensor is set. */
  attribute: string;
  /** weather.* attribute holding the unit for {@link attribute}. */
  unitAttribute?: string;
  defaultUnit: string;
}

export const WEATHER_STATION_SENSORS: WeatherStationSensorDef[] = [
  { key: 'temperature', field: 'temperature_entity', label: 'Temperature', icon: 'mdi:thermometer', attribute: 'temperature', unitAttribute: 'temperature_unit', defaultUnit: '°' },
  { key: 'humidity', field: 'humidity_entity', label: 'Humidity', icon: 'mdi:water-percent', attribute: 'humidity', defaultUnit: '%' },
  { key: 'feels_like', field: 'feels_like_entity', label: 'Feels like', icon: 'mdi:thermometer-lines', attribute: 'apparent_temperature', unitAttribute: 'temperature_unit', defaultUnit: '°' },
  { key: 'dew_point', field: 'dew_point_entity', label: 'Dew point', icon: 'mdi:thermometer-water', attribute: 'dew_point', unitAttribute: 'temperature_unit', defaultUnit: '°' },
  { key: 'pressure', field: 'pressure_entity', label: 'Pressure', icon: 'mdi:gauge', attribute: 'pressure', unitAttribute: 'pressure_unit', defaultUnit: 'hPa' },
  { key: 'wind_speed', field: 'wind_speed_entity', label: 'Wind speed', icon: 'mdi:weather-windy', attribute: 'wind_speed', unitAttribute: 'wind_speed_unit', defaultUnit: 'km/h' },
  { key: 'wind_gust', field: 'wind_gust_entity', label: 'Wind gust', icon: 'mdi:weather-windy-variant', attribute: 'wind_gust_speed', unitAttribute: 'wind_speed_unit', defaultUnit: 'km/h' },
  { key: 'wind_direction', field: 'wind_direction_entity', label: 'Wind direction', icon: 'mdi:compass-outline', attribute: 'wind_bearing', defaultUnit: '°' },
  { key: 'precipitation', field: 'precipitation_entity', label: 'Rain', icon: 'mdi:weather-pouring', attribute: 'precipitation', unitAttribute: 'precipitation_unit', defaultUnit: 'mm' },
  { key: 'uv_index', field: 'uv_index_entity', label: 'UV index', icon: 'mdi:sun-wireless', attribute: 'uv_index', defaultUnit: '' },
];

export interface WeatherReading {
  value: number;
  unit: string;
  fromSensor: boolean;
}

const CARDINALS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** Degrees (0 = north, clockwise) to a 16-point compass label. */
export function bearingToCardinal(bearing: number): string {
  const normalized = ((bearing % 360) + 360) % 360;
  return CARDINALS[Math.round(normalized / 22.5) % 16];
}

/** Accepts degrees ("225", 225) or a compass label ("SW", "sw"). */
export function parseBearing(raw: unknown): number | undefined {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  if (typeof raw !== 'string') return undefined;
  const text = raw.trim();
  if (!text) return undefined;
  const n = Number(text.replace(',', '.'));
  if (Number.isFinite(n)) return n;
  const idx = CARDINALS.indexOf(text.toUpperCase());
  return idx >= 0 ? idx * 22.5 : undefined;
}

function toNumber(raw: unknown): number | undefined {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  if (typeof raw !== 'string' || raw.trim() === '') return undefined;
  const n = Number(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Reads one value, preferring the station sensor and falling back to the
 * weather entity attribute. Unavailable sensors fall back too, so a station
 * going offline doesn't blank the card.
 */
export function readWeatherValue(
  hass: HomeAssistant | undefined,
  weatherAttributes: Record<string, unknown> | undefined,
  fields: WeatherStationSensorFields,
  key: WeatherStationKey,
  resolveEntity?: (id: string) => string
): WeatherReading | undefined {
  const def = WEATHER_STATION_SENSORS.find(d => d.key === key);
  if (!def) return undefined;

  const rawId = fields[def.field];
  const sensorId = rawId ? (resolveEntity ? resolveEntity(rawId) : rawId) : '';
  const sensor = sensorId ? hass?.states?.[sensorId] : undefined;
  if (sensor) {
    const value = key === 'wind_direction' ? parseBearing(sensor.state) : toNumber(sensor.state);
    if (value !== undefined) {
      const unit = (sensor.attributes?.unit_of_measurement as string | undefined) ?? def.defaultUnit;
      return { value, unit, fromSensor: true };
    }
  }

  const attrs = weatherAttributes || {};
  const raw = attrs[def.attribute];
  const value = key === 'wind_direction' ? parseBearing(raw) : toNumber(raw);
  if (value === undefined) return undefined;
  const unit = def.unitAttribute
    ? ((attrs[def.unitAttribute] as string | undefined) ?? def.defaultUnit)
    : def.defaultUnit;
  return { value, unit, fromSensor: false };
}

/** True when the user picked a sensor for this value. */
export function hasStationSensor(fields: WeatherStationSensorFields, key: WeatherStationKey): boolean {
  const def = WEATHER_STATION_SENSORS.find(d => d.key === key);
  return !!(def && fields[def.field]);
}

/** Every configured station sensor id, for entity tracking. */
export function stationSensorIds(fields: WeatherStationSensorFields): string[] {
  return WEATHER_STATION_SENSORS.map(d => fields[d.field]).filter((id): id is string => !!id);
}

/** Formats a reading: whole numbers for most values, one decimal for rain and UV. */
export function formatWeatherReading(key: WeatherStationKey, reading: WeatherReading): string {
  const decimals = key === 'precipitation' || key === 'uv_index' ? 1 : 0;
  const factor = 10 ** decimals;
  const rounded = Math.round(reading.value * factor) / factor;
  const text = decimals ? rounded.toFixed(decimals).replace(/\.0$/, '') : String(rounded);
  // UV sensors often report "UV index" as their unit; the label already says UV.
  if (!reading.unit || key === 'uv_index') return text;
  if (reading.unit === '%' || reading.unit.startsWith('°')) return `${text}${reading.unit}`;
  return `${text} ${reading.unit}`;
}

/**
 * Small arrow pointing where the wind blows to. Weather bearings say where the
 * wind comes from, so the arrow is turned 180° from the bearing.
 */
export function renderWindArrow(bearing: number, size = 14, color = 'currentColor'): SVGTemplateResult {
  const rotation = (bearing + 180) % 360;
  return svg`
    <svg width=${size} height=${size} viewBox="0 0 24 24" aria-hidden="true"
      style="transform:rotate(${rotation}deg);flex-shrink:0;">
      <path d="M12 2 L18 20 L12 16 L6 20 Z" fill=${color}></path>
    </svg>
  `;
}

/**
 * Compass dial with N/E/S/W marks and a needle pointing at where the wind
 * comes from, with the speed in the middle.
 */
export function renderWindCompass(
  bearing: number,
  centerText: string,
  size = 96,
  colors: { ring?: string; needle?: string; text?: string } = {}
): SVGTemplateResult {
  const ring = colors.ring || 'var(--divider-color, rgba(127,127,127,0.4))';
  const needle = colors.needle || 'var(--primary-color)';
  const text = colors.text || 'var(--primary-text-color)';
  const ticks = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const label = bearingToCardinal(bearing);
  return svg`
    <svg width=${size} height=${size} viewBox="0 0 100 100" role="img"
      aria-label=${`Wind from ${label}`}>
      <circle cx="50" cy="50" r="44" fill="none" stroke=${ring} stroke-width="2"></circle>
      ${ticks.map(
        a => svg`<line x1="50" y1=${a % 90 === 0 ? 8 : 10} x2="50" y2="14" stroke=${ring}
          stroke-width=${a % 90 === 0 ? 2.5 : 1.2} transform=${`rotate(${a} 50 50)`}></line>`
      )}
      <text x="50" y="25" text-anchor="middle" font-size="9" font-weight="700" fill=${text}>N</text>
      <text x="77" y="53" text-anchor="middle" font-size="9" fill=${text} opacity="0.7">E</text>
      <text x="50" y="82" text-anchor="middle" font-size="9" fill=${text} opacity="0.7">S</text>
      <text x="23" y="53" text-anchor="middle" font-size="9" fill=${text} opacity="0.7">W</text>
      <g transform=${`rotate(${bearing} 50 50)`}>
        <path d="M50 4 L56 16 L50 13 L44 16 Z" fill=${needle}></path>
      </g>
      <text x="50" y="49" text-anchor="middle" font-size="11" font-weight="700" fill=${text}>${label}</text>
      <text x="50" y="62" text-anchor="middle" font-size="9" fill=${text} opacity="0.8">${centerText}</text>
    </svg>
  `;
}
