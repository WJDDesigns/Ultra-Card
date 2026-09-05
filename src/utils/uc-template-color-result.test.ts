import { describe, it, expect, vi } from 'vitest';
import { isTemplateColorString, parseTemplateColorResult } from './uc-template-color-result';

/**
 * Follow-up to #129: the template colour parser used the same strict `var()`
 * pattern as the colour picker, so a template returning `var(--x, #000)` was
 * replaced with the default colour.
 */
describe('isTemplateColorString', () => {
  it('accepts plain colours and gradients', () => {
    expect(isTemplateColorString('#ff0000')).toBe(true);
    expect(isTemplateColorString('rgba(1, 2, 3, 0.5)')).toBe(true);
    expect(isTemplateColorString('red')).toBe(true);
    expect(isTemplateColorString('linear-gradient(90deg, red, blue)')).toBe(true);
  });

  it('accepts CSS variables with and without a fallback', () => {
    expect(isTemplateColorString('var(--primary-color)')).toBe(true);
    expect(isTemplateColorString('var(--pseudo-color, #000000)')).toBe(true);
    expect(isTemplateColorString('var(--accent,rgb(255, 0, 0))')).toBe(true);
    expect(isTemplateColorString('var(--accent, var(--primary-color))')).toBe(true);
  });

  it('rejects truncated variables and junk', () => {
    expect(isTemplateColorString('var(--pseudo-color,')).toBe(false);
    expect(isTemplateColorString('var(--pseudo-color, #000000')).toBe(false);
    expect(isTemplateColorString('not a colour')).toBe(false);
  });
});

describe('parseTemplateColorResult', () => {
  it('returns a variable with a fallback as-is instead of the default', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parseTemplateColorResult(' var(--x, #123456) ', 'blue')).toBe('var(--x, #123456)');
    expect(warn).not.toHaveBeenCalled();
    expect(parseTemplateColorResult('var(--x,', 'blue')).toBe('blue');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
