import { describe, it, expect } from 'vitest';
import { middleDot } from './uc-pattern-pad';

describe('uc-pattern-pad middleDot', () => {
  it('finds the dot crossed on straight jumps', () => {
    expect(middleDot(1, 3)).toBe(2);
    expect(middleDot(1, 9)).toBe(5);
    expect(middleDot(7, 1)).toBe(4);
  });

  it('returns null for neighbours and knight moves', () => {
    expect(middleDot(1, 2)).toBeNull();
    expect(middleDot(1, 6)).toBeNull();
  });
});
