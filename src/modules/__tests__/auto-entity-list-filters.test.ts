import { describe, it, expect } from 'vitest';
import { UltraAutoEntityListModule } from '../auto-entity-list-module';
import type { AutoEntityListModule } from '../../types';

/**
 * Tests for the Auto Entities List area filter (#97): entities match either
 * through their own entity-registry area or through their device's area.
 */

interface RowLike {
  entityId: string;
}

function makeHass() {
  return {
    locale: { language: 'en' },
    states: {
      'light.kitchen': {
        entity_id: 'light.kitchen',
        state: 'on',
        attributes: { friendly_name: 'Kitchen Light' },
        last_changed: new Date().toISOString(),
      },
      'light.living': {
        entity_id: 'light.living',
        state: 'on',
        attributes: { friendly_name: 'Living Light' },
        last_changed: new Date().toISOString(),
      },
      'sensor.garage_door': {
        entity_id: 'sensor.garage_door',
        state: 'closed',
        attributes: { friendly_name: 'Garage Door' },
        last_changed: new Date().toISOString(),
      },
      'sensor.orphan': {
        entity_id: 'sensor.orphan',
        state: '42',
        attributes: { friendly_name: 'Orphan Sensor' },
        last_changed: new Date().toISOString(),
      },
    },
    // Entity registry: kitchen light has a direct area, garage sensor only
    // has a device, orphan has no registry entry at all.
    entities: {
      'light.kitchen': { area_id: 'kitchen' },
      'light.living': { area_id: 'living_room' },
      'sensor.garage_door': { device_id: 'dev_garage' },
    },
    devices: {
      dev_garage: { area_id: 'garage' },
    },
  } as any;
}

function makeModule(overrides: Partial<AutoEntityListModule> = {}): AutoEntityListModule {
  const handler = new UltraAutoEntityListModule();
  return { ...handler.createDefault('ael_test'), ...overrides };
}

function collect(m: AutoEntityListModule, hass: any): string[] {
  const handler = new UltraAutoEntityListModule();
  return (handler as any)._collectEntities(m, hass).map((r: RowLike) => r.entityId);
}

describe('auto entities list: area filter', () => {
  it('returns all entities when no areas are selected', () => {
    const ids = collect(makeModule(), makeHass());
    expect(ids).toContain('light.kitchen');
    expect(ids).toContain('light.living');
    expect(ids).toContain('sensor.garage_door');
    expect(ids).toContain('sensor.orphan');
  });

  it('matches entities assigned directly to a selected area', () => {
    const ids = collect(makeModule({ include_areas: ['kitchen'] }), makeHass());
    expect(ids).toEqual(['light.kitchen']);
  });

  it("matches entities through their device's area", () => {
    const ids = collect(makeModule({ include_areas: ['garage'] }), makeHass());
    expect(ids).toEqual(['sensor.garage_door']);
  });

  it('excludes entities with no resolvable area when a filter is set', () => {
    const ids = collect(
      makeModule({ include_areas: ['kitchen', 'living_room', 'garage'] }),
      makeHass()
    );
    expect(ids).not.toContain('sensor.orphan');
    expect(ids).toHaveLength(3);
  });

  it('combines with domain filters', () => {
    const ids = collect(
      makeModule({ include_areas: ['kitchen', 'garage'], include_domains: ['light'] }),
      makeHass()
    );
    expect(ids).toEqual(['light.kitchen']);
  });

  it('still shows pinned entities from other areas', () => {
    const ids = collect(
      makeModule({
        include_areas: ['kitchen'],
        pinned_entities: [{ id: 'pin1', entity: 'sensor.orphan' }],
      }),
      makeHass()
    );
    expect(ids).toEqual(['sensor.orphan', 'light.kitchen']);
  });
});
