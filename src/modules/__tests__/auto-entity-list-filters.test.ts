import { describe, it, expect } from 'vitest';
import { UltraAutoEntityListModule } from '../auto-entity-list-module';
import type { AutoEntityListModule } from '../../types';

/**
 * Tests for the Auto Entities List area filter (#97) and label filter (#114).
 * Areas match through the entity's own registry area or its device's area.
 * Labels are inherited the way HA itself treats them: entity, then device,
 * then the area the entity resolves to.
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
    // Labels: kitchen is labelled directly, garage inherits from its device,
    // living inherits from its area.
    entities: {
      'light.kitchen': { area_id: 'kitchen', labels: ['favourite'] },
      'light.living': { area_id: 'living_room' },
      'sensor.garage_door': { device_id: 'dev_garage' },
    },
    devices: {
      dev_garage: { area_id: 'garage', labels: ['security'] },
    },
    areas: {
      kitchen: { labels: [] },
      living_room: { labels: ['downstairs'] },
      garage: { labels: [] },
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

describe('auto entities list: label filter', () => {
  it('returns all entities when no labels are selected', () => {
    const ids = collect(makeModule(), makeHass());
    expect(ids).toHaveLength(4);
  });

  it('matches labels set directly on the entity', () => {
    const ids = collect(makeModule({ include_labels: ['favourite'] }), makeHass());
    expect(ids).toEqual(['light.kitchen']);
  });

  it("inherits labels from the entity's device", () => {
    const ids = collect(makeModule({ include_labels: ['security'] }), makeHass());
    expect(ids).toEqual(['sensor.garage_door']);
  });

  it("inherits labels from the entity's area", () => {
    const ids = collect(makeModule({ include_labels: ['downstairs'] }), makeHass());
    expect(ids).toEqual(['light.living']);
  });

  it('treats multiple labels as OR', () => {
    // Default sort is name A-Z, so "Garage Door" lands ahead of "Kitchen Light".
    const ids = collect(makeModule({ include_labels: ['favourite', 'security'] }), makeHass());
    expect(ids).toEqual(['sensor.garage_door', 'light.kitchen']);
  });

  it('excludes entities with no resolvable label when a filter is set', () => {
    const ids = collect(makeModule({ include_labels: ['favourite'] }), makeHass());
    expect(ids).not.toContain('sensor.orphan');
  });

  it('combines with area and domain filters', () => {
    const ids = collect(
      makeModule({
        include_labels: ['favourite', 'security'],
        include_areas: ['kitchen'],
        include_domains: ['light'],
      }),
      makeHass()
    );
    expect(ids).toEqual(['light.kitchen']);
  });

  it('still shows pinned entities that carry no matching label', () => {
    const ids = collect(
      makeModule({
        include_labels: ['favourite'],
        pinned_entities: [{ id: 'pin1', entity: 'sensor.orphan' }],
      }),
      makeHass()
    );
    expect(ids).toEqual(['sensor.orphan', 'light.kitchen']);
  });

  it('tolerates a hass with no label data at all', () => {
    const hass = makeHass();
    delete hass.areas;
    delete hass.devices;
    for (const entry of Object.values(hass.entities as Record<string, unknown>)) {
      delete (entry as { labels?: unknown }).labels;
    }
    expect(collect(makeModule({ include_labels: ['favourite'] }), hass)).toEqual([]);
    expect(collect(makeModule(), hass)).toHaveLength(4);
  });
});
