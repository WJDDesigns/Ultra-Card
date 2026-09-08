/**
 * Surface recipes: the one vocabulary of named surface treatments shared by
 * every module that paints a filled shape, rendered for a role.
 *
 *   recipe  = what the surface looks like (glossy, glass, neumorphic…)
 *   role    = what the surface is (a control, a track, a fill, a pane)
 *
 * Button, Popup trigger, Spinbox, Bar and Slider Control used to keep their
 * own copies of these names; the strings were already identical, only the
 * implementations were scattered. A theme picks a recipe per role once
 * (`tokens.recipes`) and every module that defers to the theme agrees.
 *
 * The CSS below is a verbatim port of what each module rendered before the
 * consolidation; `src/utils/__tests__/surface-goldens.test.ts` holds the
 * frozen output and must not change unless a visual change is intended.
 */

export type UcSurfaceRecipe =
  | 'flat'
  | 'glossy'
  | 'embossed'
  | 'inset'
  | 'gradient-overlay'
  | 'neon-glow'
  | 'outline'
  | 'glass'
  | 'metallic'
  | 'neumorphic'
  | 'dashed'
  | 'dots'
  | 'minimal';

/** Every recipe, in menu order. Bar supports all of them; other roles a subset. */
export const UC_SURFACE_RECIPES: readonly UcSurfaceRecipe[] = [
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
  'dashed',
  'dots',
  'minimal',
];

export type UcSurfaceRole = 'control' | 'track' | 'fill' | 'pane';

export const UC_SURFACE_ROLES: readonly UcSurfaceRole[] = ['control', 'track', 'fill', 'pane'];

/** Recipes a control-shaped surface (button, chip, spinbox button) can render. */
export const UC_CONTROL_RECIPES: readonly UcSurfaceRecipe[] = [
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

/** Recipes a slider track can render (bar's set minus the percentage-shaped ones). */
export const UC_TRACK_RECIPES: readonly UcSurfaceRecipe[] = [...UC_CONTROL_RECIPES, 'minimal'];

/** Recipes each role can render. Anything else falls back to `flat` for that role. */
export const UC_ROLE_RECIPES: Readonly<Record<UcSurfaceRole, readonly UcSurfaceRecipe[]>> = {
  control: UC_CONTROL_RECIPES,
  track: UC_SURFACE_RECIPES,
  fill: UC_SURFACE_RECIPES,
  pane: UC_CONTROL_RECIPES,
};

/** Short synonyms accepted from themes and hand-written YAML. */
const RECIPE_ALIASES: Record<string, UcSurfaceRecipe> = {
  gradient: 'gradient-overlay',
  neon: 'neon-glow',
  glow: 'neon-glow',
  neumorphism: 'neumorphic',
  frosted: 'glass',
};

/** Canonical recipe for a value, or undefined when it is not a recipe at all. */
export function normalizeRecipe(value: unknown): UcSurfaceRecipe | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  if ((UC_SURFACE_RECIPES as readonly string[]).includes(v)) return v as UcSurfaceRecipe;
  return RECIPE_ALIASES[v];
}

/** `recipe` if `role` can render it, else `flat`. */
export function recipeForRole(recipe: unknown, role: UcSurfaceRole): UcSurfaceRecipe {
  const r = normalizeRecipe(recipe);
  return r && UC_ROLE_RECIPES[role].includes(r) ? r : 'flat';
}

/**
 * Which module style fields are surfaces, and which role they paint. The
 * theme engine uses this to let `tokens.recipes` answer a module that defers
 * with `'theme'`; modules not listed here have layout vocabularies a theme
 * must address through `theme.modules`.
 */
export const UC_SURFACE_FIELD_ROLES: Readonly<Record<string, Readonly<Record<string, UcSurfaceRole>>>> = {
  button: { style: 'control' },
  popup: { trigger_button_style: 'control' },
  spinbox: { button_style: 'control' },
  bar: { bar_style: 'track' },
  slider_control: { slider_style: 'track' },
  // Same control recipe cascade as Button — themes that set recipes.control
  // once restyle these without a per-module override.
  button_input: { button_style: 'control' },
  light: { button_style: 'control' },
};

export function surfaceRoleFor(moduleType: string, key: string): UcSurfaceRole | undefined {
  return UC_SURFACE_FIELD_ROLES[moduleType]?.[key];
}

/** Data attributes a module puts on the element it painted, for theme CSS to target. */
export function surfaceAttrs(recipe: UcSurfaceRecipe, role: UcSurfaceRole): { 'data-uc-surface': string; 'data-uc-role': string } {
  return { 'data-uc-surface': recipe, 'data-uc-role': role };
}

// ------------------------------------------------------------------ control

export interface UcControlSurfaceOptions {
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

const METALLIC_CONTROL_BG = 'linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7)';

/**
 * Style overrides for a control-shaped surface, as a camelCase style object
 * (spread over a base style). Unknown recipes fall back to `flat`.
 */
export function getControlSurfaceStyles(
  recipe: string | undefined,
  opts: UcControlSurfaceOptions
): Record<string, string> {
  const bg = opts.background;
  const blur = opts.blur ?? 6;
  const map: Record<UcSurfaceRecipe, Record<string, string>> = {
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
    metallic: { background: METALLIC_CONTROL_BG, border: '1px solid #bbb' },
    neumorphic: {
      background: bg,
      border: 'none',
      boxShadow: '4px 4px 10px rgba(0,0,0,0.18), -4px -4px 10px rgba(255,255,255,0.12)',
    },
    // Percentage-shaped recipes have no control form; they read as flat.
    dashed: { background: bg, border: 'none', boxShadow: 'none' },
    dots: { background: bg, border: 'none', boxShadow: 'none' },
    minimal: { background: bg, border: 'none', boxShadow: 'none' },
  };

  const key = recipeForRole(recipe, 'control');
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

/** Same as `getControlSurfaceStyles` but as a `prop: value;` CSS string. */
export function getControlSurfaceStyleString(
  recipe: string | undefined,
  opts: UcControlSurfaceOptions
): string {
  return Object.entries(getControlSurfaceStyles(recipe, opts))
    .map(([k, v]) => `${camelToKebab(k)}: ${v};`)
    .join(' ');
}

// ---------------------------------------------------------------- bar track

export interface UcBarSurfaceContext {
  /** 0..100 */
  percentage: number;
  'fill_direction'?: string | undefined;
  /** Track corner radius, px. */
  borderRadius: number;
  /** Track background colour ('transparent' when unset). */
  trackBackground: string;
  /** Fill background: a colour or a gradient list. */
  fillBackground: string;
  /** True when `fillBackground` is a gradient the user configured. */
  useGradient: boolean;
  /** The solid bar colour (`bar_color`), or its default. */
  barColor: string;
  /** Colour to glow with for `neon-glow` (gradient-aware). */
  glowColor: string;
  /** `glass_blur_amount`, px. */
  glassBlur?: number | undefined;
  /** Colour resolver the module already uses (handles `var()` and names). */
  resolveColor: (c: string) => string;
}

export interface UcBarSurfaceCss {
  /** Applied to the track element. */
  track: string;
  /** Applied to the fill element. */
  fill: string;
  /** Applied to an overlay above the fill; used when the fill is a gradient. */
  overlay: string;
}

/** Convert a colour to the same colour at `opacity`, as the bar always did. */
function toRgbaWithOpacity(color: string, opacity: number): string {
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\s*\)$/, `, ${opacity})`);
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }
  return color.includes('#') || color.startsWith('var(') || color.match(/^[a-z]+$/i)
    ? `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`
    : color;
}

/**
 * Track, fill and overlay CSS for a bar drawn with `recipe`. Whitespace and
 * declaration order match the bar module's original switch exactly.
 */
export function getBarSurfaceCss(recipe: string | undefined, ctx: UcBarSurfaceContext): UcBarSurfaceCss {
  const out: UcBarSurfaceCss = { track: '', fill: '', overlay: '' };
  const { percentage, borderRadius, trackBackground, fillBackground, useGradient } = ctx;
  const key = normalizeRecipe(recipe);

  switch (key) {
    case 'flat':
      out.track = `box-shadow: none;`;
      break;
    case 'glossy':
      if (useGradient) {
        // For gradients, use overlay approach
        out.overlay = `
            background-image: linear-gradient(to bottom, 
              rgba(255,255,255,0.3) 0%, 
              rgba(255,255,255,0.1) 50%, 
              rgba(0,0,0,0.1) 51%, 
              rgba(0,0,0,0.05) 100%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
          `;
      } else {
        out.fill = `
            background: linear-gradient(to bottom, ${fillBackground}, ${fillBackground} 50%, rgba(0,0,0,0.1) 51%, ${fillBackground});
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
          `;
      }
      break;
    case 'embossed':
      out.track = `
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);
          border: 1px solid rgba(0,0,0,0.1);
        `;
      out.fill = `
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);
        `;
      break;
    case 'inset':
      out.track = `
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
          border: 1px solid rgba(0,0,0,0.2);
        `;
      break;
    case 'gradient-overlay':
      if (useGradient) {
        // For gradients, add overlay on top
        out.overlay = `
            background-image: linear-gradient(to bottom, 
              rgba(255,255,255,0.4) 0%, 
              rgba(255,255,255,0) 100%);
          `;
      } else {
        out.fill = `
            background: linear-gradient(to bottom, 
              ${fillBackground} 0%, 
              rgba(255,255,255,0) 100%
            );
          `;
      }
      break;
    case 'neon-glow': {
      // The glow element itself is added in the bar template after the fill.
      const glowColor = ctx.glowColor;
      out.fill = `
            filter: brightness(1.2);
            box-shadow: 
              0 0 7px 2px ${toRgbaWithOpacity(glowColor, 0.7)},
              0 0 14px 6px ${toRgbaWithOpacity(glowColor, 0.5)},
              0 0 20px 10px ${toRgbaWithOpacity(glowColor, 0.3)},
              inset 0 0 10px rgba(255, 255, 255, 0.8);
          `;
      out.track = `
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
            overflow: hidden;
          `;
      break;
    }
    case 'outline': {
      const trackColor = trackBackground || 'rgba(255, 255, 255, 0.1)';
      const gapSize = 4;
      const borderWidth = 2;
      const outlineColor = ctx.resolveColor(ctx.barColor || 'var(--primary-color)');
      out.track = `
            border: ${borderWidth}px solid ${outlineColor};
            border-radius: ${borderRadius}px;
            background: ${trackColor};
            padding: ${gapSize}px;
          `;
      out.fill = `
            background: ${fillBackground};
            border: none;
            box-sizing: border-box;
            position: relative;
            margin: 0;
            width: ${percentage}%;
            transition: width 0.3s ease;
          `;
      break;
    }
    case 'glass': {
      // Frosted track with subtle depth; the fill stays solid.
      const glassOpacity = 0.15;
      const glassBorderOpacity = 0.25;
      const glassBlur = ctx.glassBlur || 8;
      out.track = `
            backdrop-filter: blur(${glassBlur}px) saturate(180%);
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, ${glassOpacity * 0.8}) 0%,
              rgba(255, 255, 255, ${glassOpacity * 0.4}) 50%,
              rgba(255, 255, 255, ${glassOpacity}) 100%
            );
            border: 1px solid rgba(255, 255, 255, ${glassBorderOpacity});
            border-radius: ${borderRadius}px;
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            position: relative;
          `;
      if (useGradient) {
        out.overlay = `
              background: ${fillBackground};
              border-radius: ${Math.max(0, borderRadius - 2)}px;
            `;
      } else {
        out.fill = `
              background: ${fillBackground};
              border-radius: ${Math.max(0, borderRadius - 2)}px;
              position: relative;
            `;
      }
      break;
    }
    case 'metallic':
      if (useGradient) {
        out.overlay = `
            background-image: linear-gradient(to bottom, 
              rgba(255,255,255,0.4) 0%, 
              rgba(255,255,255,0) 20%, 
              rgba(255,255,255,0) 80%, 
              rgba(0,0,0,0.2) 100%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);
          `;
      } else {
        out.fill = `
            background: linear-gradient(to bottom, 
              rgba(255,255,255,0.4) 0%, 
              ${fillBackground} 20%, 
              ${fillBackground} 80%, 
              rgba(0,0,0,0.2) 100%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);
          `;
      }
      break;
    case 'neumorphic':
      out.track = `
          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);
        `;
      out.fill = `
          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);
        `;
      break;
    case 'dashed': {
      // Dashed segments; the last dash is rounded only at 100%.
      const segmentWidth = 12;
      const gapWidth = 4;
      const totalWidth = segmentWidth + gapWidth;
      const isRightToLeft = ctx.fill_direction === 'right-to-left';

      if (percentage >= 99.5) {
        const borderRadiusStyle = isRightToLeft
          ? `${borderRadius}px 0 0 ${borderRadius}px`
          : `0 ${borderRadius}px ${borderRadius}px 0`;
        out.fill = `
            mask-image: repeating-linear-gradient(
              90deg,
              black 0px,
              black ${segmentWidth}px,
              transparent ${segmentWidth}px,
              transparent ${totalWidth}px
            );
            -webkit-mask-image: repeating-linear-gradient(
              90deg,
              black 0px,
              black ${segmentWidth}px,
              transparent ${segmentWidth}px,
              transparent ${totalWidth}px
            );
            border-radius: ${borderRadiusStyle};
          `;
      } else {
        const maskDirection = isRightToLeft ? '270deg' : '90deg';
        out.fill = `
            mask-image: 
              repeating-linear-gradient(
                90deg,
                black 0px,
                black ${segmentWidth}px,
                transparent ${segmentWidth}px,
                transparent ${totalWidth}px
              ),
              linear-gradient(
                ${maskDirection},
                black 0%,
                black calc(100% - ${gapWidth + 2}px),
                transparent calc(100% - ${gapWidth + 2}px),
                transparent 100%
              );
            -webkit-mask-image: 
              repeating-linear-gradient(
                90deg,
                black 0px,
                black ${segmentWidth}px,
                transparent ${segmentWidth}px,
                transparent ${totalWidth}px
              ),
              linear-gradient(
                ${maskDirection},
                black 0%,
                black calc(100% - ${gapWidth + 2}px),
                transparent calc(100% - ${gapWidth + 2}px),
                transparent 100%
              );
            mask-composite: intersect;
            -webkit-mask-composite: source-in;
            border-radius: 0;
          `;
      }
      break;
    }
    case 'dots': {
      // One circle per 10% step up to the current value.
      const dotRadius = 4;
      const gradients: string[] = [];
      for (let pos = 10; pos <= percentage && pos <= 100; pos += 10) {
        gradients.push(
          `radial-gradient(circle ${dotRadius}px at ${pos}% center, ${fillBackground} 0%, ${fillBackground} 100%, transparent 100%)`
        );
      }
      if (gradients.length > 0) {
        out.fill = `
            background-image: ${gradients.join(', ')};
            background-size: 100% 100%;
            background-repeat: no-repeat;
          `;
      } else {
        out.fill = `background: transparent;`;
      }
      break;
    }
    case 'minimal':
      // Thin line with a dot indicator; the dot is drawn by the template.
      out.track = `
          background: transparent;
          border: none;
          box-shadow: none;
        `;
      out.fill = `
          background: transparent;
          border: none;
          position: relative;
        `;
      break;
  }
  return out;
}

// ------------------------------------------------------------- slider track

export interface UcSliderSurfaceContext {
  /** Track background when the fill is drawn separately (`trackColor` in the module). */
  trackColor: string;
  /** Fill colour or gradient. */
  fill: string;
  /** Track background with the fill baked in as a hard-stop gradient. */
  baseBackground: string;
  /** CSS `border-radius` value for the track. */
  borderRadius: string;
  /** Overlay that paints the fill portion when the track itself is not the fill. */
  overlayFillSnippet: string;
  /** `glass_blur_amount`, px. */
  glassBlur: number;
}

export interface UcSliderSurfaceCss {
  /** Applied to the track container. */
  container: string;
  /** Applied to the overlay element above the track ('' for none). */
  overlay: string;
}

/**
 * Container and overlay CSS for a slider track drawn with `recipe`.
 * Whitespace and declaration order match the slider module's original switch.
 */
export function getSliderSurfaceCss(recipe: string | undefined, ctx: UcSliderSurfaceContext): UcSliderSurfaceCss {
  const { baseBackground, borderRadius, trackColor, overlayFillSnippet, fill } = ctx;
  let containerStyles: string;
  let overlayContent = '';

  switch (normalizeRecipe(recipe)) {
    case 'flat':
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
          `;
      break;
    case 'glossy':
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
            box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
          `;
      overlayContent = `
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%);
          `;
      break;
    case 'glass': {
      containerStyles = `
            background: transparent;
            border-radius: ${borderRadius};
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          `;
      overlayContent = `
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(${ctx.glassBlur}px);
          `;
      break;
    }
    case 'minimal':
      containerStyles = `
            background: ${trackColor};
            border-radius: var(--uc-r-10, 10px);
          `;
      overlayContent = overlayFillSnippet;
      break;
    case 'embossed':
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.2);
          `;
      overlayContent = `
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, transparent 40%, rgba(0, 0, 0, 0.15) 100%);
          `;
      break;
    case 'inset':
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 -1px 2px rgba(255, 255, 255, 0.05);
          `;
      break;
    case 'gradient-overlay':
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
          `;
      overlayContent = `
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(0, 0, 0, 0.15) 100%);
          `;
      break;
    case 'neon-glow': {
      // The glow is a blurred duplicate of the track drawn by the template.
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
          `;
      break;
    }
    case 'outline':
      containerStyles = `
            background: transparent;
            border-radius: ${borderRadius};
            border: 2px solid ${fill};
          `;
      overlayContent = overlayFillSnippet;
      break;
    case 'metallic':
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          `;
      overlayContent = `
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(0, 0, 0, 0.05) 55%, rgba(255, 255, 255, 0.1) 100%);
          `;
      break;
    case 'neumorphic':
      containerStyles = `
            background: ${trackColor};
            border-radius: ${borderRadius};
            box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.08);
          `;
      overlayContent = overlayFillSnippet;
      break;
    default:
      containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
          `;
  }
  return { container: containerStyles, overlay: overlayContent };
}

// ------------------------------------------------------- theme derivation

/** Recipe per role a theme's `surface` implies when `tokens.recipes` is unset. */
export function recipesFromSurface(surface: string | undefined): Record<UcSurfaceRole, UcSurfaceRecipe> {
  switch (surface) {
    case 'glass':
      return { control: 'glass', track: 'glass', fill: 'flat', pane: 'glass' };
    case 'neumorphic':
      return { control: 'neumorphic', track: 'neumorphic', fill: 'flat', pane: 'neumorphic' };
    case 'glossy':
      return { control: 'glossy', track: 'glossy', fill: 'glossy', pane: 'glossy' };
    case 'outline':
      return { control: 'outline', track: 'outline', fill: 'flat', pane: 'outline' };
    case 'minimal':
      return { control: 'flat', track: 'minimal', fill: 'flat', pane: 'flat' };
    default:
      return { control: 'flat', track: 'flat', fill: 'flat', pane: 'flat' };
  }
}
