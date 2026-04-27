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

export function sanitizeMarkdownHtml(html: string, enableHtml: boolean): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: enableHtml ? FORBIDDEN_ACTIVE_TAGS : [...FORBIDDEN_ACTIVE_TAGS, 'style'],
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

export function sanitizeRichTextHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a', 'mark',
    ],
    ALLOWED_ATTR: [
      'style', 'href', 'target', 'rel', 'class', 'data-color',
    ],
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
