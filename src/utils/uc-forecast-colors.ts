import type { AnimatedForecastChartMetric } from '../types';

/** Units the weather entity reports, used to put values on a common scale. */
export interface ForecastUnits {
  temperature?: string | undefined;
  wind_speed?: string | undefined;
  precipitation?: string | undefined;
}

type Stop = [number, string];

// Temperature in °C: freezing blue through mild green to hot red.
const TEMPERATURE_STOPS: Stop[] = [
  [-10, '#7c3aed'],
  [0, '#3b82f6'],
  [10, '#06b6d4'],
  [18, '#22c55e'],
  [25, '#eab308'],
  [30, '#f97316'],
  [38, '#dc2626'],
];

// Chance of rain in %: pale to deep blue.
const RAIN_CHANCE_STOPS: Stop[] = [
  [0, '#bfdbfe'],
  [50, '#3b82f6'],
  [100, '#1e3a8a'],
];

// Rain amount in mm.
const RAIN_AMOUNT_STOPS: Stop[] = [
  [0, '#bfdbfe'],
  [2.5, '#60a5fa'],
  [10, '#2563eb'],
  [25, '#1e3a8a'],
];

// Wind speed in km/h: calm green to storm red.
const WIND_STOPS: Stop[] = [
  [0, '#86efac'],
  [20, '#22c55e'],
  [40, '#eab308'],
  [60, '#f97316'],
  [90, '#dc2626'],
];

/** WHO UV index bands; these are categories, so the colour steps instead of blending. */
function uvColor(uv: number): string {
  if (uv < 3) return '#4caf50';
  if (uv < 6) return '#fdd835';
  if (uv < 8) return '#fb8c00';
  if (uv < 11) return '#e53935';
  return '#8e24aa';
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function interpolate(stops: Stop[], value: number): string {
  if (value <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (value >= last[0]) return last[1];
  for (let i = 1; i < stops.length; i++) {
    const [v1, c1] = stops[i];
    if (value <= v1) {
      const [v0, c0] = stops[i - 1];
      const t = (value - v0) / (v1 - v0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      const mix = a.map((x, k) => Math.round(x + (b[k] - x) * t));
      return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
    }
  }
  return last[1];
}

function toCelsius(v: number, unit?: string): number {
  return unit && unit.includes('F') ? ((v - 32) * 5) / 9 : v;
}

function toKmh(v: number, unit?: string): number {
  switch ((unit || 'km/h').toLowerCase()) {
    case 'mph':
      return v * 1.609344;
    case 'm/s':
      return v * 3.6;
    case 'kn':
    case 'kt':
    case 'knots':
      return v * 1.852;
    case 'ft/s':
      return v * 1.09728;
    default:
      return v;
  }
}

function toMm(v: number, unit?: string): number {
  return unit && unit.toLowerCase().startsWith('in') ? v * 25.4 : v;
}

/** Colour for one forecast value, on a fixed scale per metric. */
export function forecastValueColor(
  metric: AnimatedForecastChartMetric,
  value: number,
  units: ForecastUnits = {}
): string {
  switch (metric) {
    case 'uv_index':
      return uvColor(value);
    case 'temperature':
      return interpolate(TEMPERATURE_STOPS, toCelsius(value, units.temperature));
    case 'precipitation_probability':
      return interpolate(RAIN_CHANCE_STOPS, value);
    case 'precipitation':
      return interpolate(RAIN_AMOUNT_STOPS, toMm(value, units.precipitation));
    case 'wind_speed':
      return interpolate(WIND_STOPS, toKmh(value, units.wind_speed));
    default:
      return 'var(--primary-color)';
  }
}
