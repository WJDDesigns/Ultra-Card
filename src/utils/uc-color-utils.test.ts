import { describe, it, expect } from 'vitest';
import { isGradient, computeBackgroundStyles } from './uc-color-utils';

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
});
