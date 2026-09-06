/**
 * Inline SVG artwork for theme CSS.
 *
 * Themes may paint frames, textures and edges with `url("data:image/svg+xml,…")`
 * backgrounds. SVG loaded as a CSS image cannot run script or fetch anything,
 * which is why the sanitiser allows exactly this form of `url()`. This helper
 * produces that form: whitespace collapsed, and every character that would
 * confuse a CSS string or the sanitiser's matcher percent-encoded.
 */
export function svgDataUrl(svg: string): string {
  const compact = svg.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  const encoded = compact.replace(/[%<>#"'(){}\[\]\\]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
  return `url("data:image/svg+xml,${encoded}")`;
}
