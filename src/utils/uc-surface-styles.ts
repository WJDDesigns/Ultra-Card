/**
 * Shared "surface" treatments for button-like controls.
 *
 * Button, Popup trigger and Spinbox each carried an identical copy of this map.
 * Keeping one copy means a theme can say "buttons are glass" once and every
 * button-shaped control agrees on what glass looks like.
 *
 * Bar and Slider Control keep their own track/fill logic: the same style names
 * mean something geometrically different on a progress track, so they are not
 * forced through this helper.
 */

export type UcButtonSurfaceStyle =
  | 'flat'
  | 'glossy'
  | 'embossed'
  | 'inset'
  | 'gradient-overlay'
  | 'neon-glow'
  | 'outline'
  | 'glass'
  | 'metallic'
  | 'neumorphic';

export const UC_BUTTON_SURFACE_STYLES: readonly UcButtonSurfaceStyle[] = [
  'flat',
  'glossy',
  'embossed',
  'inset',
  'gradient-overlay',
  'neon-glow',
  'outline',
  'glass',
  'metallic',
  'neumorphic',
];

export interface UcButtonSurfaceOptions {
  /** Resolved background colour of the control (any CSS colour). */
  background: string;
  /**
   * When false, `outline` and `metallic` also set `color` so the label stays
   * readable on their non-default backgrounds.
   */
  hasCustomTextColor?: boolean | undefined;
  /** Backdrop blur for `glass`, px. Default 6. */
  blur?: number | undefined;
}

/**
 * Style overrides for a button-like control, as a camelCase style object
 * (spread over a base style). Unknown styles fall back to `flat`.
 */
export function getButtonSurfaceStyles(
  style: string | undefined,
  opts: UcButtonSurfaceOptions
): Record<string, string> {
  const bg = opts.background;
  const blur = opts.blur ?? 6;
  const map: Record<UcButtonSurfaceStyle, Record<string, string>> = {
    flat: { background: bg, border: 'none', boxShadow: 'none' },
    glossy: {
      background: `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${bg}`,
      border: 'none',
    },
    embossed: {
      background: bg,
      border: '1px solid rgba(0,0,0,0.15)',
      boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.15)',
    },
    inset: { background: bg, border: 'none', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)' },
    'gradient-overlay': {
      background: `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,0,0,0.15)), ${bg}`,
      border: 'none',
    },
    'neon-glow': { background: bg, border: 'none', boxShadow: `0 0 10px ${bg}, 0 0 20px ${bg}` },
    outline: { background: 'transparent', border: `2px solid ${bg}` },
    glass: { background: bg, backdropFilter: `blur(${blur}px)`, border: '1px solid rgba(255,255,255,0.25)' },
    metallic: { background: 'linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7)', border: '1px solid #bbb' },
    neumorphic: {
      background: bg,
      border: 'none',
      boxShadow: '4px 4px 10px rgba(0,0,0,0.18), -4px -4px 10px rgba(255,255,255,0.12)',
    },
  };

  const key = (style && style in map ? style : 'flat') as UcButtonSurfaceStyle;
  const result = { ...map[key] };
  if (!opts.hasCustomTextColor) {
    if (key === 'outline') result.color = bg;
    if (key === 'metallic') result.color = '#333';
  }
  return result;
}

function camelToKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Same as `getButtonSurfaceStyles` but as a `prop: value;` CSS string. */
export function getButtonSurfaceStyleString(
  style: string | undefined,
  opts: UcButtonSurfaceOptions
): string {
  return Object.entries(getButtonSurfaceStyles(style, opts))
    .map(([k, v]) => `${camelToKebab(k)}: ${v};`)
    .join(' ');
}

/**
 * Surface-level CSS tokens a theme exposes on the card host as `--uc-*`
 * variables. Modules and the card chrome read these as defaults.
 */
export interface UcSurfaceTokens {
  background: string;
  border: string;
  shadow: string;
  backdropFilter: string;
}

export function getSurfaceTokens(
  surface: string | undefined,
  opts: { blur?: number | undefined; borderWidth?: number | undefined; borderColor?: string | undefined; shadow?: string | undefined }
): UcSurfaceTokens {
  const blur = opts.blur ?? 12;
  const bw = opts.borderWidth;
  const bc = opts.borderColor;
  const border = (fallbackWidth: number, fallbackColor: string) =>
    `${bw ?? fallbackWidth}px solid ${bc ?? fallbackColor}`;

  switch (surface) {
    case 'glass':
      return {
        background: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05)',
        border: border(1, 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12)'),
        shadow: opts.shadow ?? '0 8px 24px rgba(0, 0, 0, 0.18)',
        backdropFilter: `blur(${blur}px) saturate(160%)`,
      };
    case 'neumorphic':
      return {
        background: 'var(--card-background-color, var(--ha-card-background, white))',
        border: border(0, 'transparent'),
        shadow:
          opts.shadow ??
          '6px 6px 14px rgba(0, 0, 0, 0.14), -6px -6px 14px rgba(255, 255, 255, 0.08)',
        backdropFilter: 'none',
      };
    case 'glossy':
      return {
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0)), var(--card-background-color, var(--ha-card-background, white))',
        border: border(0, 'transparent'),
        shadow: opts.shadow ?? '0 4px 16px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'none',
      };
    case 'outline':
      return {
        background: 'transparent',
        border: border(1, 'var(--divider-color)'),
        shadow: opts.shadow ?? 'none',
        backdropFilter: 'none',
      };
    case 'minimal':
      return {
        background: 'transparent',
        border: border(0, 'transparent'),
        shadow: opts.shadow ?? 'none',
        backdropFilter: 'none',
      };
    case 'flat':
    default:
      return {
        background: 'var(--card-background-color, var(--ha-card-background, white))',
        border: border(1, 'var(--divider-color)'),
        shadow: opts.shadow ?? 'none',
        backdropFilter: 'none',
      };
  }
}
