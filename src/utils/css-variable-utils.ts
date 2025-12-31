import { SharedDesignProperties } from '../types';

/**
 * Generates CSS custom properties (variables) from design properties with fallbacks.
 * This allows users to override styles from outside the Shadow DOM using card-mod.
 * 
 * @param prefix - The CSS variable prefix (e.g., "my-row" creates --my-row-bg-color)
 * @param design - The design properties to convert to CSS variables
 * @returns Object with CSS properties using var() with fallbacks
 * 
 * @example
 * // In component:
 * const styles = generateCSSVariables('header-row', row.design);
 * // Generates: { backgroundColor: 'var(--header-row-bg-color, #fff)' }
 * 
 * // Users can override with card-mod:
 * // style: |
 * //   :host {
 * //     --header-row-bg-color: red;
 * //   }
 */
export function generateCSSVariables(
  prefix: string,
  design: SharedDesignProperties | undefined
): Record<string, string> {
  if (!prefix) {
    return {};
  }

  const cssVars: Record<string, string> = {};
  const d = design || {};

  // ALWAYS generate CSS variables when prefix exists, even if design property doesn't exist
  // This allows users to override ANY property via card-mod, not just ones set in design tab

  // Background properties - always generate
  cssVars.backgroundColor = `var(--${prefix}-bg-color, ${d.background_color || 'transparent'})`;

  // Text properties - always generate common ones
  cssVars.color = `var(--${prefix}-text-color, ${d.color || 'inherit'})`;
  
  // Only generate font properties if at least one is set
  if (d.font_size || d.font_weight || d.font_family || d.line_height || d.letter_spacing) {
    if (d.font_size) {
      cssVars.fontSize = `var(--${prefix}-font-size, ${d.font_size})`;
    }
    if (d.font_weight) {
      cssVars.fontWeight = `var(--${prefix}-font-weight, ${d.font_weight})`;
    }
    if (d.font_family) {
      cssVars.fontFamily = `var(--${prefix}-font-family, ${d.font_family})`;
    }
    if (d.line_height) {
      cssVars.lineHeight = `var(--${prefix}-line-height, ${d.line_height})`;
    }
    if (d.letter_spacing) {
      cssVars.letterSpacing = `var(--${prefix}-letter-spacing, ${d.letter_spacing})`;
    }
  }

  // Spacing properties - padding (ALWAYS generate composite property)
  const paddingParts = [
    `var(--${prefix}-padding-top, ${d.padding_top || '0'})`,
    `var(--${prefix}-padding-right, ${d.padding_right || '0'})`,
    `var(--${prefix}-padding-bottom, ${d.padding_bottom || '0'})`,
    `var(--${prefix}-padding-left, ${d.padding_left || '0'})`,
  ];
  cssVars.padding = paddingParts.join(' ');

  // Spacing properties - margin (ALWAYS generate composite property)
  const marginParts = [
    `var(--${prefix}-margin-top, ${d.margin_top || '0'})`,
    `var(--${prefix}-margin-right, ${d.margin_right || '0'})`,
    `var(--${prefix}-margin-bottom, ${d.margin_bottom || '0'})`,
    `var(--${prefix}-margin-left, ${d.margin_left || '0'})`,
  ];
  cssVars.margin = marginParts.join(' ');

  // Border properties - generate if any border property is set
  if (d.border_radius || d.border_color || d.border_width) {
    if (d.border_radius) {
      cssVars.borderRadius = `var(--${prefix}-border-radius, ${d.border_radius})`;
    }
    if (d.border_color) {
      cssVars.borderColor = `var(--${prefix}-border-color, ${d.border_color})`;
    }
    if (d.border_width) {
      cssVars.borderWidth = `var(--${prefix}-border-width, ${d.border_width})`;
    }
  }

  // Size properties - only if explicitly set
  if (d.width) {
    cssVars.width = `var(--${prefix}-width, ${d.width})`;
  }
  if (d.height) {
    cssVars.height = `var(--${prefix}-height, ${d.height})`;
  }
  if (d.max_width) {
    cssVars.maxWidth = `var(--${prefix}-max-width, ${d.max_width})`;
  }
  if (d.max_height) {
    cssVars.maxHeight = `var(--${prefix}-max-height, ${d.max_height})`;
  }
  if (d.min_width) {
    cssVars.minWidth = `var(--${prefix}-min-width, ${d.min_width})`;
  }
  if (d.min_height) {
    cssVars.minHeight = `var(--${prefix}-min-height, ${d.min_height})`;
  }

  // Shadow properties - only if set
  if (d.box_shadow_h && d.box_shadow_v) {
    const shadowValue = `${d.box_shadow_h} ${d.box_shadow_v} ${d.box_shadow_blur || '0'} ${d.box_shadow_spread || '0'} ${d.box_shadow_color || 'rgba(0,0,0,0.1)'}`;
    cssVars.boxShadow = `var(--${prefix}-box-shadow, ${shadowValue})`;
  }

  // Opacity - allow override even without rgba
  cssVars.opacity = `var(--${prefix}-opacity, 1)`;

  return cssVars;
}

/**
 * Helper to convert CSS variable styles to inline style string
 */
export function cssVariablesToStyleString(cssVars: Record<string, string>): string {
  return Object.entries(cssVars)
    .map(([prop, value]) => {
      // Convert camelCase to kebab-case
      const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabProp}: ${value}`;
    })
    .join('; ');
}

