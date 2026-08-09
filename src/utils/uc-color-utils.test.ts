import { describe, it, expect } from 'vitest';
import { isGradient, computeBackgroundStyles, sanitizeCssColor } from './uc-color-utils';

describe('uc-color-utils', () => {
  describe('isGradient', () => {
    it('returns false for empty or null', () => {
      expect(isGradient(undefined)).toBe(false);
      expect(isGradient(null)).toBe(false);
      expect(isGradient('')).toBe(false);
      expect(isGradient('   ')).toBe(false);
    });

    it('returns false for solid colors', () => {
      expect(isGradient('red')).toBe(false);
      expect(isGradient('#fff')).toBe(false);
      expect(isGradient('rgb(0,0,0)')).toBe(false);
      expect(isGradient('var(--primary-color)')).toBe(false);
    });

    it('returns true for linear-gradient', () => {
      expect(isGradient('linear-gradient(90deg, red, blue)')).toBe(true);
      expect(isGradient('  linear-gradient(to right, #f00, #00f)  ')).toBe(true);
    });

    it('returns true for radial-gradient and conic-gradient', () => {
      expect(isGradient('radial-gradient(circle, red, blue)')).toBe(true);
      expect(isGradient('conic-gradient(red, yellow, lime)')).toBe(true);
    });

    it('returns true for repeating gradients', () => {
      expect(isGradient('repeating-linear-gradient(45deg, red, blue 10px)')).toBe(true);
      expect(isGradient('repeating-radial-gradient(circle, red, blue)')).toBe(true);
    });
  });

  describe('computeBackgroundStyles', () => {
    it('returns transparent fallback when no color or image', () => {
      const result = computeBackgroundStyles({});
      expect(result.styles.background).toBe('transparent');
      expect(result.styles.backgroundColor).toBe('transparent');
      expect(result.isGradient).toBe(false);
      expect(result.hasImageLayer).toBe(false);
    });

    it('uses solid color as background when not a gradient', () => {
      const result = computeBackgroundStyles({ color: 'red' });
      expect(result.styles.background).toBe('red');
      expect(result.styles.backgroundColor).toBe('red');
      expect(result.resolvedColor).toBe('red');
      expect(result.isGradient).toBe(false);
    });

    it('builds gradient layer when color is a gradient', () => {
      const result = computeBackgroundStyles({
        color: 'linear-gradient(90deg, red, blue)',
      });
      expect(result.isGradient).toBe(true);
      expect(result.styles.background).toContain('linear-gradient');
      expect(result.styles.backgroundColor).toBeDefined();
    });

    it('uses custom fallback when provided', () => {
      const result = computeBackgroundStyles({ fallback: '#f0f0f0' });
      expect(result.styles.background).toBe('#f0f0f0');
      expect(result.styles.backgroundColor).toBe('#f0f0f0');
    });

    it('includes image layer when image is provided', () => {
      const result = computeBackgroundStyles({
        color: 'blue',
        image: 'url("https://example.com/bg.png")',
      });
      expect(result.hasImageLayer).toBe(true);
      expect(result.styles.background).toContain('url(');
    });
  });

  describe('sanitizeCssColor', () => {
    const FALLBACK = '#cdd6f4';

    it('accepts valid hex colors', () => {
      expect(sanitizeCssColor('#fff', FALLBACK)).toBe('#fff');
      expect(sanitizeCssColor('#ff0000', FALLBACK)).toBe('#ff0000');
      expect(sanitizeCssColor('#ff0000aa', FALLBACK)).toBe('#ff0000aa');
    });

    it('accepts functional notation', () => {
      expect(sanitizeCssColor('rgb(255, 0, 0)', FALLBACK)).toBe('rgb(255, 0, 0)');
      expect(sanitizeCssColor('rgba(255, 0, 0, 0.5)', FALLBACK)).toBe('rgba(255, 0, 0, 0.5)');
      expect(sanitizeCssColor('hsl(210 100% 50%)', FALLBACK)).toBe('hsl(210 100% 50%)');
    });

    it('accepts named colors and CSS variables', () => {
      expect(sanitizeCssColor('rebeccapurple', FALLBACK)).toBe('rebeccapurple');
      expect(sanitizeCssColor('transparent', FALLBACK)).toBe('transparent');
      expect(sanitizeCssColor('var(--primary-color)', FALLBACK)).toBe('var(--primary-color)');
      expect(sanitizeCssColor('var(--accent, #123456)', FALLBACK)).toBe('var(--accent, #123456)');
    });

    it('trims surrounding whitespace', () => {
      expect(sanitizeCssColor('  #abcdef  ', FALLBACK)).toBe('#abcdef');
    });

    it('rejects attribute-breakout payloads', () => {
      // These are the shapes that mattered: the value is concatenated into an
      // SVG string that is later rendered with unsafeHTML.
      expect(sanitizeCssColor('red" onload="alert(1)', FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor('#fff"/><script>alert(1)</script>', FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor("red' onmouseover='alert(1)", FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor('#fff"><animate onbegin="alert(1)"', FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor('<img src=x onerror=alert(1)>', FALLBACK)).toBe(FALLBACK);
    });

    it('rejects empty, malformed and oversized values', () => {
      expect(sanitizeCssColor('', FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor('   ', FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor(undefined, FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor(null, FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor('#zzzzzz', FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor('red blue', FALLBACK)).toBe(FALLBACK);
      expect(sanitizeCssColor('#'.padEnd(80, 'a'), FALLBACK)).toBe(FALLBACK);
    });

    it('never returns a value containing markup-breaking characters', () => {
      const payloads = [
        '#fff"',
        "#fff'",
        '#fff<',
        '#fff>',
        '#fff\\',
        '#fff`',
        '#fff\nred',
        'url(javascript:alert(1))',
      ];
      for (const payload of payloads) {
        expect(sanitizeCssColor(payload, FALLBACK)).toBe(FALLBACK);
      }
    });
  });
});
