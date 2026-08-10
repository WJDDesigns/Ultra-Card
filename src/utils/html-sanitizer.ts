import DOMPurify from 'dompurify';

const FORBIDDEN_ACTIVE_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
];

/**
 * `style` is withheld from downloaded content because CSS alone is enough to leak
 * information: a `url()` in a stylesheet or inline rule fires a request to a
 * remote server the moment the card renders, which confirms the viewer saw it,
 * and attribute-selector tricks can smuggle values out the same way. It is not
 * code execution, so locally authored content keeps it.
 */
export function sanitizeMarkdownHtml(
  html: string,
  enableHtml: boolean,
  options?: { allowStyle?: boolean }
): string {
  const allowStyle = options?.allowStyle !== false;
  const styleAllowed = enableHtml && allowStyle;

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: styleAllowed ? FORBIDDEN_ACTIVE_TAGS : [...FORBIDDEN_ACTIVE_TAGS, 'style'],
    ...(allowStyle ? {} : { FORBID_ATTR: ['style'] }),
    // DOMParser moves raw <style> (and similar) out of implicit body fragments; DOMPurify then
    // serializes only body.innerHTML, so stylesheet blocks vanish. FORCE_BODY keeps markup in the
    // body subtree so sanitized output still contains <style> when HTML is enabled.
    FORCE_BODY: enableHtml,
  });
}

export function sanitizePresetHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [...FORBIDDEN_ACTIVE_TAGS, 'style'],
  });
}

/** @see sanitizeMarkdownHtml for why `style` is withheld from downloaded content. */
export function sanitizeRichTextHtml(html: string, options?: { allowStyle?: boolean }): string {
  const allowStyle = options?.allowStyle !== false;
  const baseAttrs = ['href', 'target', 'rel', 'class', 'data-color'];

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a', 'mark',
    ],
    ALLOWED_ATTR: allowStyle ? ['style', ...baseAttrs] : baseAttrs,
  });
}

/** Escape dynamic strings for HTML text nodes and double-quoted attribute values. */
export function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
