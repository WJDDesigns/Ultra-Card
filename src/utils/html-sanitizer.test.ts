// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { escapeHtml, sanitizeMarkdownHtml, sanitizePresetHtml } from './html-sanitizer';

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

  it('preserves style blocks when HTML is enabled (DOMParser body fragment quirk)', () => {
    const sanitized = sanitizeMarkdownHtml(
      '<style>.day-box { color: var(--primary-color); }</style><p><span class="day-box">X</span></p>',
      true
    );

    expect(sanitized).toContain('<style>');
    expect(sanitized).toContain('.day-box');
    expect(sanitized).toContain('class="day-box"');
  });

  it('forbids style tags when HTML is disabled', () => {
    const sanitized = sanitizeMarkdownHtml(
      '<style>.x{display:none}</style><p class="x">ok</p>',
      false
    );

    expect(sanitized).not.toContain('<style');
    expect(sanitized).toContain('<p');
  });

  it('strips unsafe event handlers from preset html', () => {
    const sanitized = sanitizePresetHtml('<p><a href="https://example.com" onclick="steal()">Open</a></p>');

    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).not.toContain('onclick=');
  });

  it('escapeHtml neutralizes angle brackets and quotes', () => {
    expect(escapeHtml(`a"b'c<d>e&f`)).toBe('a&quot;b&#39;c&lt;d&gt;e&amp;f');
  });
});
