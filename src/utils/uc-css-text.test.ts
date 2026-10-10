import { describe, it, expect } from 'vitest';
import { addPixelUnit, styleObjectToCss } from './uc-css-text';

describe('addPixelUnit', () => {
  it('adds px to unitless numbers and number lists', () => {
    expect(addPixelUnit('8')).toBe('8px');
    expect(addPixelUnit(0)).toBe('0px');
    expect(addPixelUnit('1.5')).toBe('1.5px');
    expect(addPixelUnit('-4')).toBe('-4px');
    expect(addPixelUnit('4 8')).toBe('4px 8px');
  });
  it('leaves units, keywords and empty values alone', () => {
    expect(addPixelUnit('10pt')).toBe('10pt');
    expect(addPixelUnit('50%')).toBe('50%');
    expect(addPixelUnit('auto')).toBe('auto');
    expect(addPixelUnit('calc(1px + 2px)')).toBe('calc(1px + 2px)');
    expect(addPixelUnit('')).toBeUndefined();
    expect(addPixelUnit(undefined)).toBeUndefined();
  });
});

describe('styleObjectToCss', () => {
  it('kebab-cases keys, keeps custom properties, drops empty values', () => {
    expect(
      styleObjectToCss({
        fontSize: '12px',
        WebkitBackdropFilter: 'blur(2px)',
        '--uc-accentColor': 'red',
        color: undefined,
        margin: '',
      })
    ).toBe('font-size: 12px; -webkit-backdrop-filter: blur(2px); --uc-accentColor: red');
  });
});
