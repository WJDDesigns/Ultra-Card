/**
 * Gradient-aware color utilities shared across Ultra Card modules and editor components.
 */

const GRADIENT_FUNCTION_REGEX =
  /^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient)\s*\(/i;

export interface ComputeBackgroundStylesParams {
  /** Primary color or gradient string selected by the user */
  color?: string | undefined;
  /** Optional fallback when no color is provided */
  fallback?: string | undefined;
  /** Resolved background image string (e.g. url("...")) */
  image?: string | undefined;
  /** Size applied to the background image layer */
  imageSize?: string | undefined;
  /** Position applied to the background image layer */
  imagePosition?: string | undefined;
  /** Repeat behaviour applied to the background image layer */
  imageRepeat?: string | undefined;
  /** Optional overrides for the gradient layer */
  gradientSize?: string | undefined;
  gradientPosition?: string | undefined;
  gradientRepeat?: string | undefined;
  /** Whether to include the resolved base color as background-color (defaults to true) */
  includeBaseColor?: boolean | undefined;
}

export interface ComputeBackgroundStylesResult {
  styles: Record<string, string>;
  isGradient: boolean;
  hasImageLayer: boolean;
  resolvedColor?: string | undefined;
}

const DEFAULT_FALLBACK_COLOR = 'transparent';

/**
 * Determine if a color string represents a CSS gradient.
 */
export const isGradient = (value?: string | null): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Quick include check before running the regex for performance
  if (!trimmed.toLowerCase().includes('gradient')) return false;
  return GRADIENT_FUNCTION_REGEX.test(trimmed);
};

/**
 * Build a background style object that supports gradient + image layering with sensible defaults.
 */
export const computeBackgroundStyles = (
  params: ComputeBackgroundStylesParams
): ComputeBackgroundStylesResult => {
  const {
    color,
    fallback = DEFAULT_FALLBACK_COLOR,
    image,
    imageSize,
    imagePosition,
    imageRepeat,
    gradientSize,
    gradientPosition,
    gradientRepeat,
    includeBaseColor = true,
  } = params;

  const trimmedColor = color?.trim();
  const gradient = trimmedColor && isGradient(trimmedColor) ? trimmedColor : undefined;
  const solidColor = gradient ? undefined : trimmedColor;
  const hasImage = !!image && image !== 'none';

  const styles: Record<string, string> = {};

  const backgroundLayers: string[] = [];
  const backgroundSizes: string[] = [];
  const backgroundPositions: string[] = [];
  const backgroundRepeats: string[] = [];

  if (gradient) {
    backgroundLayers.push(gradient);
    backgroundSizes.push(gradientSize || '100% 100%');
    backgroundPositions.push(gradientPosition || 'center center');
    backgroundRepeats.push(gradientRepeat || 'no-repeat');
  }

  if (hasImage) {
    backgroundLayers.push(image!);
    backgroundSizes.push(imageSize || 'cover');
    backgroundPositions.push(imagePosition || 'center center');
    backgroundRepeats.push(imageRepeat || 'no-repeat');
  }

  if (backgroundLayers.length > 0) {
    styles.background = backgroundLayers.join(', ');

    if (backgroundSizes.some(size => !!size)) {
      styles.backgroundSize = backgroundSizes.join(', ');
    }

    if (backgroundPositions.some(position => !!position)) {
      styles.backgroundPosition = backgroundPositions.join(', ');
    }

    if (backgroundRepeats.some(repeat => !!repeat)) {
      styles.backgroundRepeat = backgroundRepeats.join(', ');
    }
  } else if (solidColor) {
    styles.background = solidColor;
  } else if (fallback) {
    styles.background = fallback;
  }

  const resolvedBaseColor = solidColor || (includeBaseColor ? fallback : undefined);
  if (includeBaseColor && resolvedBaseColor) {
    styles.backgroundColor = resolvedBaseColor;
  }

  return {
    styles,
    isGradient: !!gradient,
    hasImageLayer: hasImage,
    resolvedColor: solidColor,
  };
};

/**
 * Lightweight validation to determine if a value could be parsed as a gradient. Useful for editor hints.
 */
export const looksLikeGradient = (value?: string | null): boolean => isGradient(value);

/**
 * Allowlist of CSS color shapes that are safe to interpolate into generated
 * markup (SVG/HTML strings that later go through `unsafeHTML` or `innerHTML`).
 *
 * Deliberately strict: anything not matching one of these is rejected outright
 * rather than escaped, because a color field has no legitimate reason to
 * contain quotes, angle brackets or whitespace-separated tokens.
 */
const SAFE_CSS_COLOR_PATTERNS: readonly RegExp[] = [
  /^#[0-9a-f]{3,8}$/i, // #rgb, #rgba, #rrggbb, #rrggbbaa
  /^(?:rgb|rgba|hsl|hsla)\(\s*[0-9a-z%.,\s/+-]*\)$/i, // functional notation
  /^[a-z]+$/i, // named colors, plus transparent / currentColor / inherit
  /^var\(\s*--[a-z0-9_-]+\s*(?:,\s*[#a-z0-9%.,()\s/+-]+)?\)$/i, // theme variables
];

/** Characters that could terminate an attribute or open a tag in generated markup. */
const MARKUP_BREAKOUT_CHARS = /["'<>\\`]|\s{2,}|[\r\n\t]/;

/**
 * Return `value` when it is a CSS color safe to embed in generated markup,
 * otherwise return `fallback`.
 *
 * Use this anywhere a user- or preset-supplied color is concatenated into an
 * SVG/HTML string. Lit's `html` templates escape attribute values for you, so
 * this is only needed on the `unsafeHTML` / `innerHTML` paths.
 */
export const sanitizeCssColor = (value: string | undefined | null, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 64) return fallback;
  if (MARKUP_BREAKOUT_CHARS.test(trimmed)) return fallback;
  return SAFE_CSS_COLOR_PATTERNS.some(pattern => pattern.test(trimmed)) ? trimmed : fallback;
};
