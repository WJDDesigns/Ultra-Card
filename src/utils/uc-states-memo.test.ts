import { describe, it, expect, vi } from 'vitest';
import { UcStatesMemo, statesMemoKey } from './uc-states-memo';

describe('UcStatesMemo', () => {
  it('recomputes only when the states object identity changes', () => {
    const memo = new UcStatesMemo<number>();
    const compute = vi.fn(() => 1);
    const states = { 'light.a': {} };

    memo.read('m1', [states], 'k', compute);
    memo.read('m1', [states], 'k', compute);
    memo.read('m1', [states], 'k', compute);

    expect(compute).toHaveBeenCalledTimes(1);

    // Home Assistant hands over a fresh states object on every change.
    memo.read('m1', [{ 'light.a': {} }], 'k', compute);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('recomputes when the config signature changes even if states did not', () => {
    const memo = new UcStatesMemo<number>();
    const compute = vi.fn(() => 1);
    const states = {};

    memo.read('m1', [states], 'a', compute);
    memo.read('m1', [states], 'b', compute);

    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('recomputes when a registry dependency changes', () => {
    const memo = new UcStatesMemo<number>();
    const compute = vi.fn(() => 1);
    const states = {};
    const entities = {};

    memo.read('m1', [states, entities], 'k', compute);
    memo.read('m1', [states, entities], 'k', compute);
    expect(compute).toHaveBeenCalledTimes(1);

    memo.read('m1', [states, {}], 'k', compute);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('keeps separate entries per caller id', () => {
    const memo = new UcStatesMemo<string>();
    const states = {};

    expect(memo.read('a', [states], 'k', () => 'first')).toBe('first');
    expect(memo.read('b', [states], 'k', () => 'second')).toBe('second');
    // Neither entry evicted the other.
    expect(memo.read('a', [states], 'k', () => 'recomputed')).toBe('first');
  });

  it('evicts the oldest entry once the limit is exceeded', () => {
    const memo = new UcStatesMemo<string>(2);
    const states = {};

    memo.read('a', [states], 'k', () => 'a');
    memo.read('b', [states], 'k', () => 'b');
    memo.read('c', [states], 'k', () => 'c');

    // 'a' was evicted, so its compute runs again; 'c' is still cached.
    expect(memo.read('a', [states], 'k', () => 'a2')).toBe('a2');
    expect(memo.read('c', [states], 'k', () => 'c2')).toBe('c');
  });

  it('forget drops a single entry', () => {
    const memo = new UcStatesMemo<string>();
    const states = {};

    memo.read('a', [states], 'k', () => 'a');
    memo.forget('a');

    expect(memo.read('a', [states], 'k', () => 'fresh')).toBe('fresh');
  });

  it('returns the cached value itself, not a copy', () => {
    const memo = new UcStatesMemo<string[]>();
    const states = {};
    const value = ['x'];

    expect(memo.read('a', [states], 'k', () => value)).toBe(value);
    expect(memo.read('a', [states], 'k', () => ['y'])).toBe(value);
  });
});

describe('statesMemoKey', () => {
  it('produces equal keys for structurally equal configs', () => {
    expect(statesMemoKey({ a: 1, b: [2, 3] })).toBe(statesMemoKey({ a: 1, b: [2, 3] }));
  });

  it('produces different keys when any field differs', () => {
    expect(statesMemoKey({ a: 1 })).not.toBe(statesMemoKey({ a: 2 }));
  });

  it('forces a cache miss rather than a false hit on circular input', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(statesMemoKey(circular)).not.toBe(statesMemoKey(circular));
  });
});
