import { describe, it, expect } from 'vitest';
import type { UltraCardConfig } from '../types';
import { collectRuntimeEntityIds } from './uc-runtime-entity-ids';

function configOf(modules: unknown[]): UltraCardConfig {
  return {
    type: 'custom:ultra-card',
    layout: { rows: [{ id: 'r1', columns: [{ id: 'c1', modules: modules as never }] }] },
  } as unknown as UltraCardConfig;
}

describe('collectRuntimeEntityIds', () => {
  it('returns an empty set when there is no layout', () => {
    expect(collectRuntimeEntityIds(undefined).size).toBe(0);
    expect(collectRuntimeEntityIds({} as UltraCardConfig).size).toBe(0);
    expect(
      collectRuntimeEntityIds({ layout: { rows: [] } } as unknown as UltraCardConfig).size
    ).toBe(0);
  });

  it('ignores modules that do not resolve entities at runtime', () => {
    expect(collectRuntimeEntityIds(configOf([{ id: 'm', type: 'text', text: 'hi' }])).size).toBe(0);
  });

  // This walk runs on the card's render path, so a throw here would stop the card
  // rendering rather than merely lose an id.
  it('survives malformed modules and unknown types', () => {
    expect(() =>
      collectRuntimeEntityIds(
        configOf([null, undefined, 'nonsense', 42, {}, { type: 'no-such-module-type' }])
      )
    ).not.toThrow();
  });

  it('tolerates a column with no modules', () => {
    const config = {
      type: 'custom:ultra-card',
      layout: { rows: [{ id: 'r1', columns: [{ id: 'c1' }] }] },
    } as unknown as UltraCardConfig;
    expect(() => collectRuntimeEntityIds(config)).not.toThrow();
    expect(collectRuntimeEntityIds(config).size).toBe(0);
  });
});
