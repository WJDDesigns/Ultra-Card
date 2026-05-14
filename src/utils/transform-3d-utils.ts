/**
 * Shared utilities for the Design tab → 3D Transform feature.
 *
 * Composes a CSS `transform` string from optional `transform_perspective`,
 * `transform_rotate_x/y/z` design properties. Tolerant of trailing units the
 * user might type in the editor (e.g. "30deg", "30px", "30°", " 30 ", or "30")
 * — only the leading numeric portion is kept and "deg" is appended.
 *
 * Used by:
 * - BaseUltraModule.buildDesignStyles() (most modules)
 * - bar-module.ts containerStyles
 * - ultra-card.ts _generateRowStyles / _generateColumnStyles
 */

export interface Transform3dDesign {
  transform_perspective?: string | undefined;
  transform_rotate_x?: string | undefined;
  transform_rotate_y?: string | undefined;
  transform_rotate_z?: string | undefined;
}

/**
 * Parse a user-entered rotation value into a plain degrees number string.
 * Returns null for blank/unparseable values so the caller can skip emitting them.
 */
export function parseDegrees(value: string | number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : null;
  }
  const s = String(value).trim();
  if (s === '') return null;
  const match = s.match(/^(-?\d*\.?\d+)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return Number.isFinite(num) ? String(num) : null;
}

/**
 * Parse a perspective value. Numeric input gets "px" appended; everything else
 * passes through (allows "1000px", "20em", "var(--p)", etc.). Empty → null.
 */
export function parsePerspective(value: string | number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}px` : null;
  }
  const s = String(value).trim();
  if (s === '') return null;
  if (!isNaN(Number(s))) return `${s}px`;
  return s;
}

/**
 * Build the `transform` and `transformStyle` CSS values from design properties.
 * Returns an empty object when no 3D properties are set so callers can spread
 * it without producing dangling style attributes.
 */
export function build3dTransformStyles(
  design: Transform3dDesign | undefined | null
): { transform?: string; transformStyle?: string } {
  if (!design) return {};

  const persp = parsePerspective(design.transform_perspective);
  const rx = parseDegrees(design.transform_rotate_x);
  const ry = parseDegrees(design.transform_rotate_y);
  const rz = parseDegrees(design.transform_rotate_z);

  if (!persp && rx === null && ry === null && rz === null) {
    return {};
  }

  const parts: string[] = [];
  if (persp) parts.push(`perspective(${persp})`);
  if (rx !== null) parts.push(`rotateX(${rx}deg)`);
  if (ry !== null) parts.push(`rotateY(${ry}deg)`);
  if (rz !== null) parts.push(`rotateZ(${rz}deg)`);

  if (!parts.length) return {};

  return {
    transform: parts.join(' '),
    transformStyle: 'preserve-3d',
  };
}
