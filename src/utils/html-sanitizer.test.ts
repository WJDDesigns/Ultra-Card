// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { sanitizeMarkdownHtml, sanitizePresetHtml } from './html-sanitizer';

describe('html-sanitizer', () => {
  it('removes active content from markdown html', () => {
    const sanitized = sanitizeMarkdownHtml(
      '<p>Hello</p><script>alert(1)</script><iframe src="https://evil.example"></iframe>',
      true
    );

    expect(sanitized).toContain('<p>Hello</p>');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('<iframe');
  });

  it('strips unsafe event handlers from preset html', () => {
    const sanitized = sanitizePresetHtml('<p><a href="https://example.com" onclick="steal()">Open</a></p>');

    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).not.toContain('onclick=');
  });
});
