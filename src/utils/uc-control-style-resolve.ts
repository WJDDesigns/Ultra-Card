import {
  getControlSurfaceStyles,
  type UcControlSurfaceOptions,
} from './uc-surface-recipes';

/**
 * Historic fill-mode names used by Light and Button Input before the surface
 * recipe vocabulary. Map them onto recipes so theme inherit (which yields
 * `glass` / `flat` / …) and old configs (`filled` / `outlined` / `text`) share
 * one render path.
 */
const LEGACY_FILL_TO_RECIPE: Readonly<Record<string, string>> = {
  filled: 'flat',
  outlined: 'outline',
  text: 'minimal',
};

/** Resolve a module button_style (legacy or recipe) to a surface recipe id. */
export function controlRecipeFromButtonStyle(style: string | undefined | null): string {
  if (!style || style === 'theme') return 'flat';
  return LEGACY_FILL_TO_RECIPE[style] ?? style;
}

/**
 * True when the style is the old "text only" / transparent control — no fill,
 * colour comes from the accent rather than on-fill text.
 */
export function isTextLikeButtonStyle(style: string | undefined | null): boolean {
  const recipe = controlRecipeFromButtonStyle(style);
  return recipe === 'minimal' || style === 'text';
}

type ResolveOpts = {
  background: string;
  textColor?: string | undefined;
  hasCustomTextColor?: boolean | undefined;
  blur?: number | undefined;
};

/** Style object for a themed control that may still use filled/outlined/text. */
export function resolveControlButtonStyles(
  style: string | undefined | null,
  opts: ResolveOpts
): Record<string, string> {
  const recipe = controlRecipeFromButtonStyle(style);
  const surfaceOpts: UcControlSurfaceOptions = {
    background: opts.background,
    hasCustomTextColor: opts.hasCustomTextColor,
    blur: opts.blur,
  };
  const surface = getControlSurfaceStyles(recipe, surfaceOpts);

  if (isTextLikeButtonStyle(style)) {
    return {
      ...surface,
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      color: opts.textColor || opts.background,
    };
  }

  if (opts.textColor && (recipe === 'flat' || style === 'filled')) {
    return { ...surface, color: opts.textColor };
  }

  return surface;
}

/** CSS string variant of {@link resolveControlButtonStyles}. */
export function resolveControlButtonStyleString(
  style: string | undefined | null,
  opts: ResolveOpts
): string {
  return Object.entries(resolveControlButtonStyles(style, opts))
    .map(([k, v]) => `${k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}: ${v}`)
    .join('; ');
}
