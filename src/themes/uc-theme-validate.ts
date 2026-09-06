import type {
  UcThemeCardChrome,
  UcThemeDefinition,
  UcThemeDensity,
  UcThemeModuleDefaults,
  UcThemeSource,
  UcThemeSurface,
  UcThemeTokens,
} from './uc-theme-types';
import { UC_THEME_CARD_CHROME_KEYS, UC_THEME_MODULE_STYLE_KEYS } from './uc-theme-types';

/**
 * Turn untrusted JSON (a download, an import, a hand-edited file) into a
 * theme definition Ultra Card is willing to apply, or null when it cannot be
 * trusted at all. Everything not on an allow-list is dropped rather than
 * rejected, so a slightly-off theme still loads with the parts that are fine.
 */

const SURFACES: readonly UcThemeSurface[] = ['flat', 'glass', 'neumorphic', 'glossy', 'outline', 'minimal'];
const DENSITIES: readonly UcThemeDensity[] = ['compact', 'regular', 'comfortable'];
const SOURCES: readonly UcThemeSource[] = ['builtin', 'official', 'community', 'local'];
const PALETTE_KEYS = ['primary', 'accent', 'card_bg', 'text', 'text_secondary', 'divider'] as const;

export const UC_THEME_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
export const UC_THEME_MAX_CSS_LENGTH = 20_000;

/** CSS constructs that can reach outside the card or the browser. */
const CSS_FORBIDDEN = [
  /@import/i,
  /url\s*\(/i,
  /expression\s*\(/i,
  /javascript:/i,
  /behavior\s*:/i,
  /-moz-binding/i,
  /<\s*\/?\s*(script|style|iframe)/i,
  /@font-face/i,
];

export interface UcThemeCssScan {
  ok: boolean;
  reasons: string[];
}

export function scanThemeCss(css: string | undefined): UcThemeCssScan {
  if (!css) return { ok: true, reasons: [] };
  const reasons: string[] = [];
  if (css.length > UC_THEME_MAX_CSS_LENGTH) reasons.push(`css longer than ${UC_THEME_MAX_CSS_LENGTH} chars`);
  for (const re of CSS_FORBIDDEN) {
    if (re.test(css)) reasons.push(`css contains forbidden pattern ${re.source}`);
  }
  return { ok: reasons.length === 0, reasons };
}

function str(v: unknown, max = 500): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.length > max ? t.slice(0, max) : t;
}

/** A CSS colour/length-ish value: no braces, no semicolons, no url(). */
function cssValue(v: unknown, max = 300): string | undefined {
  const s = str(v, max);
  if (!s) return undefined;
  if (/[{};<>]/.test(s) || /url\s*\(/i.test(s) || /expression\s*\(/i.test(s)) return undefined;
  return s;
}

/**
 * A `filter` chain made only of colour functions. `url()`, `drop-shadow()` and
 * `blur()` are rejected: the first can reach the network, the others change
 * layout/legibility rather than colour.
 */
const COLOR_FILTER_FN = /^(grayscale|sepia|saturate|hue-rotate|brightness|contrast|invert|opacity)\(\s*-?\d*\.?\d+\s*(deg|turn|rad|%)?\s*\)$/;

export function colorFilter(v: unknown): string | undefined {
  const s = str(v, 200);
  if (!s || s === 'none') return undefined;
  const parts = s.split(/\)\s+(?=[a-z])/i).map((p, i, arr) => (i < arr.length - 1 ? `${p})` : p));
  if (!parts.every(p => COLOR_FILTER_FN.test(p.trim()))) return undefined;
  return parts.map(p => p.trim()).join(' ');
}

function num(v: unknown, min: number, max: number): number | undefined {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (typeof n !== 'number' || !isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

function bool(v: unknown): boolean | undefined {
  return typeof v === 'boolean' ? v : undefined;
}

function sanitizeTokens(raw: unknown): UcThemeTokens | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const surface = SURFACES.includes(r.surface as UcThemeSurface) ? (r.surface as UcThemeSurface) : 'flat';
  const radius = num(r.radius, 0, 200) ?? 12;
  const tokens: UcThemeTokens = { surface, radius };
  const radiusSm = num(r.radius_sm, 0, 200);
  if (radiusSm !== undefined) tokens.radius_sm = radiusSm;
  const blur = num(r.blur, 0, 100);
  if (blur !== undefined) tokens.blur = blur;
  const bw = num(r.border_width, 0, 20);
  if (bw !== undefined) tokens.border_width = bw;
  const bc = cssValue(r.border_color);
  if (bc) tokens.border_color = bc;
  const shadow = cssValue(r.shadow);
  if (shadow) tokens.shadow = shadow;
  if (DENSITIES.includes(r.density as UcThemeDensity)) tokens.density = r.density as UcThemeDensity;
  const accent = cssValue(r.accent);
  if (accent) tokens.accent = accent;
  const font = cssValue(r.font_family, 200);
  if (font) tokens.font_family = font;
  const grayscale = typeof r.grayscale === 'boolean' ? (r.grayscale ? 1 : undefined) : num(r.grayscale, 0, 1);
  if (grayscale !== undefined && grayscale > 0) tokens.grayscale = grayscale;
  const filter = colorFilter(r.color_filter);
  if (filter) tokens.color_filter = filter;
  if (r.palette && typeof r.palette === 'object') {
    const palette: Record<string, string> = {};
    for (const key of PALETTE_KEYS) {
      const v = cssValue((r.palette as Record<string, unknown>)[key]);
      if (v) palette[key] = v;
    }
    if (Object.keys(palette).length) tokens.palette = palette as UcThemeTokens['palette'];
  }
  return tokens;
}

function sanitizeCard(raw: unknown): UcThemeCardChrome | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of UC_THEME_CARD_CHROME_KEYS) {
    if (!(key in r)) continue;
    const v = r[key];
    switch (key) {
      case 'card_transparent':
      case 'card_shadow_enabled': {
        const b = bool(v);
        if (b !== undefined) out[key] = b;
        break;
      }
      case 'card_background':
      case 'card_border_color':
      case 'card_shadow_color': {
        const s = cssValue(v);
        if (s) out[key] = s;
        break;
      }
      default: {
        const n = num(v, -200, 400);
        if (n !== undefined) out[key] = n;
      }
    }
  }
  return Object.keys(out).length ? (out as UcThemeCardChrome) : undefined;
}

function sanitizeModules(raw: unknown): UcThemeModuleDefaults | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: UcThemeModuleDefaults = {};
  for (const [moduleType, allowed] of Object.entries(UC_THEME_MODULE_STYLE_KEYS)) {
    const entry = (raw as Record<string, unknown>)[moduleType];
    if (!entry || typeof entry !== 'object') continue;
    const clean: Record<string, unknown> = {};
    for (const key of allowed) {
      const v = (entry as Record<string, unknown>)[key];
      if (typeof v === 'number' && isFinite(v)) clean[key] = v;
      else {
        const s = cssValue(v, 100);
        if (s) clean[key] = s;
      }
    }
    if (Object.keys(clean).length) out[moduleType] = clean;
  }
  return Object.keys(out).length ? out : undefined;
}

export interface UcThemeSanitizeResult {
  theme: UcThemeDefinition | null;
  /** Non-fatal things that were dropped. */
  warnings: string[];
}

export function sanitizeThemeDefinition(
  raw: unknown,
  opts?: { source?: UcThemeSource | undefined; idPrefix?: string | undefined }
): UcThemeSanitizeResult {
  const warnings: string[] = [];
  if (!raw || typeof raw !== 'object') return { theme: null, warnings: ['not an object'] };
  const r = raw as Record<string, unknown>;

  let id = str(r.id, 80)?.toLowerCase().replace(/[^a-z0-9_-]/g, '-') ?? '';
  if (opts?.idPrefix && !id.startsWith(opts.idPrefix)) id = `${opts.idPrefix}${id}`;
  if (!UC_THEME_ID_PATTERN.test(id)) return { theme: null, warnings: ['invalid id'] };

  const name = str(r.name, 80);
  if (!name) return { theme: null, warnings: ['missing name'] };

  const tokens = sanitizeTokens(r.tokens);
  if (!tokens) return { theme: null, warnings: ['missing tokens'] };

  const theme: UcThemeDefinition = {
    id,
    name,
    version: num(r.version, 1, 1_000_000) ?? 1,
    tokens,
  };
  const author = str(r.author, 80);
  if (author) theme.author = author;
  const description = str(r.description, 600);
  if (description) theme.description = description;
  const preview = str(r.preview, 4000);
  if (preview && /^(https:\/\/|data:image\/(png|jpe?g|webp);base64,)/i.test(preview)) theme.preview = preview;
  else if (preview) warnings.push('preview dropped (must be https or data:image)');
  const icon = str(r.icon, 60);
  if (icon && /^mdi:[a-z0-9-]+$/.test(icon)) theme.icon = icon;
  const source = opts?.source ?? (SOURCES.includes(r.source as UcThemeSource) ? (r.source as UcThemeSource) : undefined);
  if (source) theme.source = source;

  const card = sanitizeCard(r.card);
  if (card) theme.card = card;
  const modules = sanitizeModules(r.modules);
  if (modules) theme.modules = modules;

  const css = str(r.css, UC_THEME_MAX_CSS_LENGTH + 1);
  if (css) {
    const scan = scanThemeCss(css);
    if (scan.ok) theme.css = css;
    else warnings.push(...scan.reasons.map(x => `css dropped: ${x}`));
  }

  return { theme, warnings };
}
