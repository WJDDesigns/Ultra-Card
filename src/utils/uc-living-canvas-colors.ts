import type { LivingCanvasPreset } from '../types';
import { isGradient } from './uc-color-utils';

/** Default CSS hex colors per preset (used when the user has not set custom colors). */
export const LIVING_CANVAS_PRESET_COLOR_DEFAULTS: Record<
  LivingCanvasPreset,
  { background: string; primary: string; secondary: string }
> = {
  aurora: { background: '#0a101a', primary: '#26e68c', secondary: '#7358f2' },
  plasma: { background: '#070b14', primary: '#66c2ff', secondary: '#ff8866' },
  particles: { background: '#050812', primary: '#eaf0ff', secondary: '#5599ff' },
  mesh: { background: '#1a3060', primary: '#e08561', secondary: '#5c8ce8' },
};

function parseHexToRgb01(hex: string): [number, number, number] | null {
  const h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16) / 255;
    const g = parseInt(h[1] + h[1], 16) / 255;
    const b = parseInt(h[2] + h[2], 16) / 255;
    if ([r, g, b].some(n => Number.isNaN(n))) return null;
    return [r, g, b];
  }
  if (h.length >= 6) {
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    if ([r, g, b].some(n => Number.isNaN(n))) return null;
    return [r, g, b];
  }
  return null;
}

/**
 * Resolve a CSS color (hex, rgb(), theme var) to linear-ish 0–1 RGB for WebGL.
 * Gradients are not supported; falls back to fallbackHex.
 */
export function resolveLivingCanvasColor(
  doc: Document | null | undefined,
  value: string | undefined,
  fallbackHex: string
): [number, number, number] {
  const fb = parseHexToRgb01(fallbackHex) || [0.04, 0.06, 0.1];
  const raw = (value || '').trim();
  if (!raw || raw === 'transparent' || isGradient(raw)) return fb;

  if (raw.startsWith('#')) {
    const parsed = parseHexToRgb01(raw);
    return parsed || fb;
  }

  if (!doc?.body) return fb;

  try {
    const probe = doc.createElement('span');
    probe.style.cssText =
      'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;color:' + raw;
    doc.body.appendChild(probe);
    const computed = doc.defaultView?.getComputedStyle(probe).color || '';
    probe.remove();
    const m = computed.match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
    );
    if (m) {
      const r = parseFloat(m[1]);
      const g = parseFloat(m[2]);
      const b = parseFloat(m[3]);
      if ([r, g, b].some(n => Number.isNaN(n))) return fb;
      // getComputedStyle returns 0–255 for rgb/rgba in browsers
      const maxc = Math.max(r, g, b);
      if (maxc > 1.001) {
        return [r / 255, g / 255, b / 255];
      }
      return [r, g, b];
    }
  } catch {
    /* ignore */
  }
  return fb;
}

export function getLivingCanvasPresetColors(
  preset: LivingCanvasPreset | undefined
): { background: string; primary: string; secondary: string } {
  const p = preset || 'aurora';
  return LIVING_CANVAS_PRESET_COLOR_DEFAULTS[p] || LIVING_CANVAS_PRESET_COLOR_DEFAULTS.aurora;
}
