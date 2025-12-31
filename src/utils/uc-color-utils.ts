/**
 * Gradient-aware color utilities shared across Ultra Card modules and editor components.
 */

const GRADIENT_FUNCTION_REGEX =
  /^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient)\s*\(/i;

export interface ComputeBackgroundStylesParams {
  /** Primary color or gradient string selected by the user */
  color?: string;
  /** Optional fallback when no color is provided */
  fallback?: string;
  /** Resolved background image string (e.g. url("...")) */
  image?: string;
  /** Size applied to the background image layer */
  imageSize?: string;
  /** Position applied to the background image layer */
  imagePosition?: string;
  /** Repeat behaviour applied to the background image layer */
  imageRepeat?: string;
  /** Optional overrides for the gradient layer */
  gradientSize?: string;
  gradientPosition?: string;
  gradientRepeat?: string;
  /** Whether to include the resolved base color as background-color (defaults to true) */
  includeBaseColor?: boolean;
}

export interface ComputeBackgroundStylesResult {
  styles: Record<string, string>;
  isGradient: boolean;
  hasImageLayer: boolean;
  resolvedColor?: string;
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
