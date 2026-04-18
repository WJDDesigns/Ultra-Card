import { describe, it, expect } from 'vitest';
import { parseLocaleNumber, parseCustomTickValues } from './parse-locale-number';

describe('parseLocaleNumber', () => {
  it('parses plain decimals', () => {
    expect(parseLocaleNumber('30.96')).toBeCloseTo(30.96);
    expect(parseLocaleNumber(42)).toBe(42);
  });

  it('parses European comma decimals', () => {
    expect(parseLocaleNumber('30,96')).toBeCloseTo(30.96);
    expect(parseLocaleNumber('6,95')).toBeCloseTo(6.95);
  });

  it('parses thousands with comma decimal (European)', () => {
    expect(parseLocaleNumber('1.234,56')).toBeCloseTo(1234.56);
  });

  it('parses thousands with dot decimal (US)', () => {
    expect(parseLocaleNumber('1,234.56')).toBeCloseTo(1234.56);
  });

  it('returns NaN for empty or unknown', () => {
    expect(Number.isNaN(parseLocaleNumber(''))).toBe(true);
    expect(Number.isNaN(parseLocaleNumber('unknown'))).toBe(true);
  });
});

describe('parseCustomTickValues', () => {
  it('splits on semicolon for locale-safe lists', () => {
    expect(parseCustomTickValues('30,5; 40; 50')).toEqual([30.5, 40, 50]);
  });

  it('falls back to comma-separated integers', () => {
    expect(parseCustomTickValues('0, 25, 50, 75, 100')).toEqual([0, 25, 50, 75, 100]);
  });
});
