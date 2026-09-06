/**
 * Small colour maths for the theme engine.
 *
 * A theme that pins one HA variable (say `--primary-text-color` to navy) but
 * not its partners (`--secondary-background-color`, `--text-primary-color`)
 * produces navy-on-charcoal the moment a module paints with the partner. The
 * helpers here let the service derive readable companions from whatever the
 * palette did pin. Only literal colours can be derived; `var(...)` values are
 * left to the browser and no companions are emitted for them.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const NAMED: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0,0,0,0)',
};

/** Parse `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()` / `rgba()` with numeric channels. */
export function parseColor(input: string | undefined | null): Rgba | null {
  if (!input) return null;
  let s = input.trim().toLowerCase();
  if (NAMED[s]) s = NAMED[s];

  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a };
  }

  const fn = /^rgba?\(\s*([^)]+)\)$/.exec(s);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3 || parts.length > 4) return null;
    const chan = (v: string) => {
      if (v.endsWith('%')) return Math.round((parseFloat(v) / 100) * 255);
      const n = parseFloat(v);
      return Number.isFinite(n) ? Math.round(n) : NaN;
    };
    const r = chan(parts[0]);
    const g = chan(parts[1]);
    const b = chan(parts[2]);
    let a = 1;
    if (parts[3] !== undefined) {
      a = parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    }
    if ([r, g, b, a].some(n => !Number.isFinite(n))) return null;
    return { r: clamp255(r), g: clamp255(g), b: clamp255(b), a: Math.min(1, Math.max(0, a)) };
  }
  return null;
}

function clamp255(n: number): number {
  return Math.min(255, Math.max(0, n));
}

export function toCss(c: Rgba): string {
  if (c.a >= 1) {
    return `#${[c.r, c.g, c.b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  }
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${round(c.a, 3)})`;
}

export function withAlpha(c: Rgba, a: number): Rgba {
  return { ...c, a: Math.min(1, Math.max(0, a)) };
}

/** `r, g, b` triple for HA's `--rgb-*` companions. */
export function toRgbTriple(c: Rgba): string {
  return `${c.r}, ${c.g}, ${c.b}`;
}

function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

/** WCAG relative luminance (0 black .. 1 white), ignoring alpha. */
export function luminance(c: Rgba): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

export function isLight(c: Rgba): boolean {
  return luminance(c) > 0.35;
}

/** WCAG contrast ratio between two opaque colours. */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Linear mix of `a` toward `b` by `t` (0 = a, 1 = b). Alpha follows `a`. */
export function mix(a: Rgba, b: Rgba, t: number): Rgba {
  const k = Math.min(1, Math.max(0, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
    a: a.a,
  };
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

/** Nudge a surface toward its opposite pole so a nested surface reads as a step. */
export function step(c: Rgba, amount: number): Rgba {
  return mix(c, isLight(c) ? BLACK : WHITE, amount);
}

/**
 * The text colour to put on top of `bg`: prefer the candidate with the higher
 * WCAG contrast; defaults are HA's own on-primary white and near-black ink.
 */
export function contrastText(bg: Rgba, light: Rgba = WHITE, dark: Rgba = { r: 33, g: 33, b: 33, a: 1 }): Rgba {
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;
}
