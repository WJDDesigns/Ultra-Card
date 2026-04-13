/**
 * Parse a Home Assistant template render result into a safe CSS color string.
 * Used by status summary unified color templates and DynamicColorService.
 */
export function isTemplateColorString(color: string): boolean {
  if (color.toLowerCase().includes('gradient')) {
    const gradientPattern =
      /^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\(.*\)$/i;
    return gradientPattern.test(color.trim());
  }
  const colorPatterns = [
    /^#[0-9A-Fa-f]{3,8}$/,
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i,
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i,
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i,
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/i,
    /^var\(--[\w-]+\)$/i,
    /^(red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey|transparent)$/i,
  ];
  return colorPatterns.some(pattern => pattern.test(color));
}

export function parseTemplateColorResult(result: unknown, defaultColor = 'var(--primary-color)'): string {
  if (result === undefined || result === null) {
    return defaultColor;
  }
  if (typeof result === 'string') {
    const trimmed = result.trim();
    if (isTemplateColorString(trimmed)) {
      return trimmed;
    }
    console.warn(
      `[Ultra Card] Color template evaluated to invalid color '${trimmed}', using default.`
    );
    return defaultColor;
  }
  console.warn(
    `[Ultra Card] Color template evaluated to non-string type '${typeof result}', using default.`
  );
  return defaultColor;
}
