/**
 * Smart Scaling Utility Service
 * Provides helpers for managing responsive content scaling in Ultra Card modules
 */

/**
 * Get container styles based on smart scaling setting
 * @param smartScaling - Whether smart scaling is enabled (default: true)
 * @returns Style object for container overflow and sizing
 */
export function getSmartScalingStyles(smartScaling: boolean = true): {
  overflow: string;
  maxWidth: string;
  boxSizing: string;
} {
  return smartScaling
    ? {
        overflow: 'hidden',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }
    : {
        overflow: 'visible',
        maxWidth: 'none',
        boxSizing: 'content-box',
      };
}

/**
 * Apply responsive sizing using clamp() for smart scaling
 * @param baseSize - Base size value
 * @param unit - CSS unit (default: 'px')
 * @param smartScaling - Whether smart scaling is enabled (default: true)
 * @returns CSS size string with clamp() or fixed value
 */
export function applyResponsiveSizing(
  baseSize: number,
  unit: string = 'px',
  smartScaling: boolean = true
): string {
  if (!smartScaling) {
    return `${baseSize}${unit}`;
  }

  // Use clamp with min (50% of base), preferred (base), max (150% of base)
  const minSize = Math.round(baseSize * 0.5);
  const maxSize = Math.round(baseSize * 1.5);

  return `clamp(${minSize}${unit}, ${baseSize}${unit}, ${maxSize}${unit})`;
}

/**
 * Apply responsive width constraint using min()
 * @param baseSize - Base size value
 * @param unit - CSS unit (default: 'px')
 * @param vwFallback - Viewport width fallback percentage (default: 90)
 * @param smartScaling - Whether smart scaling is enabled (default: true)
 * @returns CSS width string with min() or fixed value
 */
export function applyResponsiveWidth(
  baseSize: number,
  unit: string = 'px',
  vwFallback: number = 90,
  smartScaling: boolean = true
): string {
  if (!smartScaling) {
    return `${baseSize}${unit}`;
  }

  return `min(${baseSize}${unit}, ${vwFallback}vw)`;
}

/**
 * Get overflow style based on smart scaling
 * @param smartScaling - Whether smart scaling is enabled (default: true)
 * @returns CSS overflow value
 */
export function getOverflowStyle(smartScaling: boolean = true): string {
  return smartScaling ? 'hidden' : 'visible';
}

/**
 * Get combined container styles for modules
 * @param smartScaling - Whether smart scaling is enabled (default: true)
 * @returns Complete style object for module containers
 */
export function getModuleContainerStyles(smartScaling: boolean = true): Record<string, string> {
  const scalingStyles = getSmartScalingStyles(smartScaling);

  return {
    width: '100%',
    ...scalingStyles,
  };
}
