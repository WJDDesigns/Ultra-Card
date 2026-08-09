import { describe, it, expect } from 'vitest';
import type { UltraCardConfig } from '../types';
import { collectConfigEntityIds, anyEntityChanged } from './uc-config-entity-ids';

function configOf(modules: unknown[]): UltraCardConfig {
  return {
    type: 'custom:ultra-card',
    layout: { rows: [{ id: 'r1', columns: [{ id: 'c1', modules: modules as never }] }] },
  } as unknown as UltraCardConfig;
}

describe('collectConfigEntityIds', () => {
  it('returns an empty set for a decorative card', () => {
    const { ids, incomplete } = collectConfigEntityIds(
      configOf([{ id: 'm', type: 'text', text: 'hello' }])
    );
    expect(ids.size).toBe(0);
    expect(incomplete).toBe(false);
  });

  it('picks up plain and prefixed entity fields', () => {
    const { ids } = collectConfigEntityIds(
      configOf([{ id: 'm', type: 'info', entity: 'light.a', weather_entity: 'weather.b' }])
    );
    expect([...ids].sort()).toEqual(['light.a', 'weather.b']);
  });

  it('handles entities arrays in both shapes', () => {
    const { ids } = collectConfigEntityIds(
      configOf([{ id: 'm', type: 'grid', entities: ['light.a', { entity: 'switch.b' }] }])
    );
    expect([...ids].sort()).toEqual(['light.a', 'switch.b']);
  });

  it('finds entities inside nested container modules', () => {
    const { ids } = collectConfigEntityIds(
      configOf([
        { id: 'h', type: 'horizontal', modules: [{ id: 'i', type: 'info', entity: 'sensor.deep' }] },
      ])
    );
    expect(ids.has('sensor.deep')).toBe(true);
  });

  it('finds entities in tap action targets', () => {
    const { ids } = collectConfigEntityIds(
      configOf([
        {
          id: 'm',
          type: 'button',
          tap_action: { action: 'call-service', target: { entity_id: 'light.target' } },
        },
      ])
    );
    expect(ids.has('light.target')).toBe(true);
  });

  it('collects entities from row and column display conditions', () => {
    const config = {
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'r1',
            display_conditions: [{ type: 'entity_state', entity: 'binary_sensor.row' }],
            columns: [
              {
                id: 'c1',
                display_conditions: [{ type: 'entity_state', entity: 'binary_sensor.col' }],
                modules: [],
              },
            ],
          },
        ],
      },
    } as unknown as UltraCardConfig;

    const { ids } = collectConfigEntityIds(config);
    expect([...ids].sort()).toEqual(['binary_sensor.col', 'binary_sensor.row']);
  });

  it('ignores id and type keys that would otherwise look like entities', () => {
    const { ids } = collectConfigEntityIds(configOf([{ id: 'a.b', type: 'c.d' }]));
    expect(ids.size).toBe(0);
  });

  it('reports incomplete when a $variable reference cannot be resolved', () => {
    const { ids, incomplete } = collectConfigEntityIds(
      configOf([{ id: 'm', type: 'info', entity: '$undefined_variable' }])
    );
    expect(ids.size).toBe(0);
    expect(incomplete).toBe(true);
  });

  it('handles a missing or empty config', () => {
    expect(collectConfigEntityIds(undefined).ids.size).toBe(0);
    expect(collectConfigEntityIds({ type: 'custom:ultra-card' } as UltraCardConfig).ids.size).toBe(0);
  });
});

describe('anyEntityChanged', () => {
  const a = { state: 'on' };
  const b = { state: 'on' };

  it('detects a replaced state object even when the value looks the same', () => {
    expect(anyEntityChanged(['light.a'], { 'light.a': a }, { 'light.a': b })).toBe(true);
  });

  it('returns false when every tracked entity kept its identity', () => {
    expect(anyEntityChanged(['light.a'], { 'light.a': a }, { 'light.a': a })).toBe(false);
  });

  it('ignores entities outside the tracked set', () => {
    expect(
      anyEntityChanged(['light.a'], { 'light.a': a, 'light.b': a }, { 'light.a': a, 'light.b': b })
    ).toBe(false);
  });

  it('treats an appearing or disappearing entity as a change', () => {
    expect(anyEntityChanged(['light.a'], {}, { 'light.a': a })).toBe(true);
    expect(anyEntityChanged(['light.a'], { 'light.a': a }, {})).toBe(true);
  });

  it('returns false for an empty tracked set', () => {
    expect(anyEntityChanged([], { 'light.a': a }, { 'light.a': b })).toBe(false);
  });
});
