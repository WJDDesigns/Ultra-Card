/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import '../ultra-color-picker';

/**
 * Regression cover for #129: the text input rejected `var(--x, fallback)`, so a
 * CSS variable with a fallback could not be entered or applied in the editor.
 */
describe('ultra-color-picker: CSS variable validation', () => {
  const isValid = (value: string): boolean => {
    const el = document.createElement('ultra-color-picker') as any;
    return el._isValidColor(value);
  };

  it('accepts a bare CSS variable', () => {
    expect(isValid('var(--primary-color)')).toBe(true);
  });

  it('accepts a CSS variable with a fallback value', () => {
    expect(isValid('var(--pseudo-color, #000000)')).toBe(true);
    expect(isValid('var(--accent,rgb(255, 0, 0))')).toBe(true);
    expect(isValid('var(--accent, var(--primary-color))')).toBe(true);
  });

  it('still rejects a truncated variable', () => {
    expect(isValid('var(--pseudo-color,')).toBe(false);
    expect(isValid('var(--pseudo-color, #000000')).toBe(false);
  });
});
