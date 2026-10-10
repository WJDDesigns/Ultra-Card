/**
 * Pure helpers for the Floorplan module: what counts as "active", light glow
 * colors, polygon parsing and the percent-coordinate math shared by the card
 * and the editor's placement surface. No Lit, no DOM — easy to unit test.
 */
import type { FloorplanAspectRatio, FloorplanModule } from '../types';

/** Minimal entity shape these helpers need (a subset of HassEntity). */
export interface FloorplanStateLike {
  entity_id?: string;
  state: string;
  attributes?: Record<string, unknown> | undefined;
}

export interface FloorplanRgb {
  r: number;
  g: number;
  b: number;
}

export interface FloorplanPoint {
  x: number;
  y: number;
}

/** Domains whose "on"-style state is literally the string `on`. */
const ON_DOMAINS = new Set([
  'light',
  'switch',
  'fan',
  'input_boolean',
  'binary_sensor',
  'automation',
  'siren',
  'humidifier',
  'remote',
  'script',
]);

/** States that read as "something is happening here" across the other domains. */
const ACTIVE_STATES = new Set([
  'on',
  'open',
  'opening',
  'closing',
  'unlocked',
  'unlocking',
  'jammed',
  'home',
  'playing',
  'cleaning',
  'returning',
  'active',
  'heat',
  'cool',
  'heat_cool',
  'auto',
  'dry',
  'fan_only',
  'triggered',
  'arming',
  'pending',
  'detected',
]);

const UNAVAILABLE = new Set(['unavailable', 'unknown', '']);

/** Domains Home Assistant can toggle directly; the default tap action toggles these. */
const TOGGLE_DOMAINS = new Set([
  'light',
  'switch',
  'fan',
  'input_boolean',
  'automation',
  'lock',
  'cover',
]);

export function entityDomain(entityId: string | undefined): string {
  if (!entityId) return '';
  const dot = entityId.indexOf('.');
  return dot > 0 ? entityId.slice(0, dot) : '';
}

export function isToggleableDomain(domain: string): boolean {
  return TOGGLE_DOMAINS.has(domain);
}

/** Clamp to 0–100 and round to one decimal so YAML stays readable. */
export function clampPercent(value: unknown, fallback = 50): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
}

/**
 * Whether an entity should be drawn in its "active" style.
 *
 * `activeState` (per marker / zone) wins when set, so a sensor can light up at
 * a specific value. Otherwise: `on` for switch-like domains, `alarm` panels that
 * are anything but disarmed, climate / media / water heaters that are not off,
 * and a short list of universally "busy" states for everything else.
 */
export function isEntityActive(
  stateObj: FloorplanStateLike | undefined | null,
  activeState?: string | undefined
): boolean {
  if (!stateObj) return false;
  const state = String(stateObj.state ?? '');
  if (activeState !== undefined && activeState.trim() !== '') {
    return state === activeState.trim();
  }
  if (UNAVAILABLE.has(state)) return false;

  const domain = entityDomain(stateObj.entity_id);
  if (ON_DOMAINS.has(domain)) return state === 'on';
  switch (domain) {
    case 'alarm_control_panel':
      return state !== 'disarmed';
    case 'climate':
    case 'water_heater':
    case 'media_player':
      return state !== 'off' && state !== 'idle' && state !== 'standby';
    case 'lock':
      return state !== 'locked' && state !== 'locking';
    case 'cover':
    case 'valve':
      return state !== 'closed';
    case 'person':
    case 'device_tracker':
      return state === 'home';
    case 'timer':
      return state === 'active';
    default:
      return ACTIVE_STATES.has(state);
  }
}

/** Approximate sRGB for a color temperature (Tanner Helland's fit), 1000–40000 K. */
export function kelvinToRgb(kelvin: number): FloorplanRgb {
  const t = Math.min(40000, Math.max(1000, kelvin)) / 100;
  const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return { r: clamp(r), g: clamp(g), b: clamp(b) };
}

/** Warm white used when a light reports no color at all. */
export const DEFAULT_LIGHT_RGB: FloorplanRgb = { r: 255, g: 196, b: 120 };

function rgbFromArray(value: unknown): FloorplanRgb | null {
  if (!Array.isArray(value) || value.length < 3) return null;
  const [r, g, b] = value.map(Number);
  if (![r, g, b].every(n => typeof n === 'number' && Number.isFinite(n))) return null;
  const c = (n: number | undefined) => Math.round(Math.min(255, Math.max(0, n ?? 0)));
  return { r: c(r), g: c(g), b: c(b) };
}

/** The color a light is emitting: rgb_color, else color temperature, else warm white. */
export function lightRgb(stateObj: FloorplanStateLike | undefined | null): FloorplanRgb {
  const attrs = stateObj?.attributes || {};
  const rgb = rgbFromArray(attrs.rgb_color);
  if (rgb) return rgb;
  const kelvin = Number(attrs.color_temp_kelvin);
  if (Number.isFinite(kelvin) && kelvin > 0) return kelvinToRgb(kelvin);
  const mired = Number(attrs.color_temp);
  if (Number.isFinite(mired) && mired > 0) return kelvinToRgb(1000000 / mired);
  return DEFAULT_LIGHT_RGB;
}

/** Light brightness as 0–1 (1 when on without a brightness attribute). */
export function lightBrightness(stateObj: FloorplanStateLike | undefined | null): number {
  if (!stateObj || stateObj.state !== 'on') return 0;
  const raw = Number(stateObj.attributes?.brightness);
  if (!Number.isFinite(raw)) return 1;
  return Math.min(1, Math.max(0, raw / 255));
}

/**
 * Glow alpha for a light: scales with brightness but never drops below a
 * visible floor while the light is on, so a dimmed lamp still reads as on.
 */
export function glowAlpha(brightness: number, intensityPct: number): number {
  if (brightness <= 0) return 0;
  const intensity = Math.min(100, Math.max(0, intensityPct)) / 100;
  return Math.round(intensity * (0.35 + 0.65 * Math.min(1, brightness)) * 1000) / 1000;
}

export function rgbCss(rgb: FloorplanRgb, alpha = 1): string {
  return alpha >= 1 ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Parse "x,y x,y …" (percent) into points. Invalid pairs are skipped. */
export function parsePolygonPoints(raw: string | undefined): FloorplanPoint[] {
  if (!raw) return [];
  const out: FloorplanPoint[] = [];
  for (const pair of raw.trim().split(/\s+|;/)) {
    if (!pair) continue;
    const [xs, ys] = pair.split(',');
    const x = Number(xs);
    const y = Number(ys);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    out.push({ x: clampPercent(x), y: clampPercent(y) });
  }
  return out;
}

export function serializePolygonPoints(points: FloorplanPoint[]): string {
  return points.map(p => `${clampPercent(p.x)},${clampPercent(p.y)}`).join(' ');
}

/** CSS `aspect-ratio` value, or null for "use the picture's own shape". */
export function aspectRatioCss(ratio: FloorplanAspectRatio | undefined): string | null {
  if (!ratio || ratio === 'auto') return null;
  const [w, h] = ratio.split(':');
  return w && h ? `${w} / ${h}` : null;
}

/** Every entity the module draws (markers then zones), de-duplicated. */
export function floorplanEntityIds(module: Pick<FloorplanModule, 'markers' | 'zones'>): string[] {
  const ids = new Set<string>();
  for (const marker of module.markers || []) if (marker?.entity) ids.add(marker.entity);
  for (const zone of module.zones || []) if (zone?.entity) ids.add(zone.entity);
  return [...ids];
}

/**
 * True when at least one entity is bound and none of them is active — the
 * condition for "dim the picture when everything is off".
 */
export function allEntitiesInactive(
  states: Record<string, FloorplanStateLike | undefined> | undefined,
  module: Pick<FloorplanModule, 'markers' | 'zones'>
): boolean {
  const items = [
    ...(module.markers || []).map(m => ({ entity: m.entity, active_state: m.active_state })),
    ...(module.zones || []).map(z => ({ entity: z.entity, active_state: z.active_state })),
  ].filter(item => !!item.entity);
  if (!items.length || !states) return false;
  return items.every(item => !isEntityActive(states[item.entity], item.active_state));
}

/** Pointer position inside an element's box as percentages. */
export function pointToPercent(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): FloorplanPoint {
  const w = rect.width || 1;
  const h = rect.height || 1;
  return {
    x: clampPercent(((clientX - rect.left) / w) * 100),
    y: clampPercent(((clientY - rect.top) / h) * 100),
  };
}
