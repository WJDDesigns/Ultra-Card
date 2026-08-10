// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  sanitizeMarkdownHtml,
  sanitizePresetHtml,
  sanitizeRichTextHtml,
} from './html-sanitizer';

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

  // S7: CSS from downloaded content can beacon via url() and exfiltrate via
  // attribute selectors, so style is withheld from it while local text keeps it.
  describe('style handling by content trust (S7)', () => {
    it('keeps the style attribute for locally authored rich text', () => {
      const sanitized = sanitizeRichTextHtml('<span style="color: red">hi</span>', {
        allowStyle: true,
      });
      expect(sanitized).toContain('style="color: red"');
    });

    it('strips the style attribute for downloaded rich text but keeps the text', () => {
      const sanitized = sanitizeRichTextHtml(
        '<span style="background: url(https://evil.example/beacon.png)">hi</span>',
        { allowStyle: false }
      );
      expect(sanitized).not.toContain('style');
      expect(sanitized).not.toContain('evil.example');
      expect(sanitized).toContain('hi');
    });

    it('keeps other rich text attributes when style is withheld', () => {
      const sanitized = sanitizeRichTextHtml(
        '<a href="https://example.com" class="x" style="color:red">go</a>',
        { allowStyle: false }
      );
      expect(sanitized).toContain('href="https://example.com"');
      expect(sanitized).toContain('class="x"');
      expect(sanitized).not.toContain('color:red');
    });

    it('defaults to allowing style so existing callers are unchanged', () => {
      expect(sanitizeRichTextHtml('<span style="color: red">hi</span>')).toContain('style');
    });

    it('drops style blocks and attributes from downloaded markdown even with HTML enabled', () => {
      const sanitized = sanitizeMarkdownHtml(
        '<style>.x{background:url(https://evil.example/b.png)}</style><p style="color:red" class="x">ok</p>',
        true,
        { allowStyle: false }
      );
      expect(sanitized).not.toContain('<style');
      expect(sanitized).not.toContain('evil.example');
      expect(sanitized).not.toContain('color:red');
      expect(sanitized).toContain('ok');
      expect(sanitized).toContain('class="x"');
    });

    it('still preserves style blocks for local markdown with HTML enabled', () => {
      const sanitized = sanitizeMarkdownHtml('<style>.day-box{color:red}</style><p>ok</p>', true, {
        allowStyle: true,
      });
      expect(sanitized).toContain('<style>');
    });
  });
});
