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
  });
}

export function sanitizePresetHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [...FORBIDDEN_ACTIVE_TAGS, 'style'],
  });
}
