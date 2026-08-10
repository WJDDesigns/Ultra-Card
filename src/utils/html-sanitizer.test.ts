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

  /**
   * S7: CSS from downloaded content can beacon via url(), so that is removed. The
   * cosmetic remainder is kept — every published preset using inline styles uses
   * them for colour and alignment, and dropping the attribute outright made those
   * presets render wrong to block a vector they never used.
   */
  describe('style handling by content trust (S7)', () => {
    it('keeps the style attribute for locally authored rich text', () => {
      const sanitized = sanitizeRichTextHtml('<span style="color: red">hi</span>', {
        trusted: true,
      });
      expect(sanitized).toContain('style="color: red"');
    });

    it('keeps cosmetic styles on downloaded rich text', () => {
      const sanitized = sanitizeRichTextHtml('<span style="color: indianred">S</span>', {
        trusted: false,
      });
      expect(sanitized).toContain('indianred');
    });

    it('removes a url() beacon from downloaded rich text but keeps the text', () => {
      const sanitized = sanitizeRichTextHtml(
        '<span style="background: url(https://evil.example/beacon.png)">hi</span>',
        { trusted: false }
      );
      expect(sanitized).not.toContain('evil.example');
      expect(sanitized).not.toContain('url(');
      expect(sanitized).toContain('hi');
    });

    it('keeps the cosmetic half of a mixed declaration and drops the fetching half', () => {
      const sanitized = sanitizeRichTextHtml(
        '<span style="color: red; background: url(https://evil.example/b.png); text-align: left">hi</span>',
        { trusted: false }
      );
      expect(sanitized).toContain('color: red');
      expect(sanitized).toContain('text-align: left');
      expect(sanitized).not.toContain('evil.example');
    });

    it('removes the other fetch-capable constructs too', () => {
      for (const value of [
        'background-image: image-set("https://evil.example/a.png" 1x)',
        '-moz-binding: url(https://evil.example/x.xml)',
        'behavior: url(https://evil.example/x.htc)',
      ]) {
        const sanitized = sanitizeRichTextHtml(`<span style="${value}">hi</span>`, {
          trusted: false,
        });
        expect(sanitized).not.toContain('evil.example');
      }
    });

    it('does not leave a fetch behind when a url() contains a semicolon', () => {
      // Splitting on ';' severs this declaration; neither half may survive.
      const sanitized = sanitizeRichTextHtml(
        `<span style="background: url('https://evil.example/a;b.png')">hi</span>`,
        { trusted: false }
      );
      expect(sanitized).not.toContain('evil.example');
      expect(sanitized).toContain('hi');
    });

    it('keeps other rich text attributes alongside a cleaned style', () => {
      const sanitized = sanitizeRichTextHtml(
        '<a href="https://example.com" class="x" style="color:red">go</a>',
        { trusted: false }
      );
      expect(sanitized).toContain('href="https://example.com"');
      expect(sanitized).toContain('class="x"');
      expect(sanitized).toContain('color:red');
    });

    it('defaults to trusting the content so existing callers are unchanged', () => {
      expect(sanitizeRichTextHtml('<span style="color: red">hi</span>')).toContain('style');
    });

    it('drops style blocks from downloaded markdown but keeps cosmetic attributes', () => {
      const sanitized = sanitizeMarkdownHtml(
        '<style>.x{background:url(https://evil.example/b.png)}</style><p style="color:red" class="x">ok</p>',
        true,
        { trusted: false }
      );
      // A <style> block can carry @import and selectors, which inline styles cannot,
      // so it stays forbidden for downloaded content.
      expect(sanitized).not.toContain('<style');
      expect(sanitized).not.toContain('evil.example');
      expect(sanitized).toContain('color:red');
      expect(sanitized).toContain('ok');
      expect(sanitized).toContain('class="x"');
    });

    it('still preserves style blocks for local markdown with HTML enabled', () => {
      const sanitized = sanitizeMarkdownHtml('<style>.day-box{color:red}</style><p>ok</p>', true, {
        trusted: true,
      });
      expect(sanitized).toContain('<style>');
    });

    it('does not leak trust state between calls', () => {
      sanitizeRichTextHtml('<span style="background: url(https://evil.example/a.png)">x</span>', {
        trusted: false,
      });
      // The hook is global, so a stale flag would silently strip trusted content.
      expect(sanitizeRichTextHtml('<span style="background: url(/local/a.png)">x</span>')).toContain(
        'url('
      );
    });
  });
});
