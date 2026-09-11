// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  buildSmartEntityContext,
  extractAreaHints,
  promptTokens,
  rankSmartEntities,
} from './uc-smart-entity-context';

const registryHass = {
  states: {
    'light.living_room_lamp': { attributes: { friendly_name: 'Living Room Lamp' }, state: 'on' },
    'light.living_room_ceiling': { attributes: { friendly_name: 'Ceiling' }, state: 'off' },
    'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
    'light.bedroom': { attributes: { friendly_name: 'Bedroom' }, state: 'off' },
    'light.dead_bulb': { attributes: { friendly_name: 'Dead Bulb' }, state: 'unavailable' },
    'lock.front_door': { attributes: { friendly_name: 'Front Door' }, state: 'locked' },
    'sensor.living_room_temperature': {
      attributes: { friendly_name: 'Living Room Temperature', device_class: 'temperature', unit_of_measurement: '°C' },
      state: '21',
    },
    'sensor.hub_signal_strength': {
      attributes: { friendly_name: 'Hub Signal Strength', unit_of_measurement: 'dBm' },
      state: '-60',
    },
    'binary_sensor.patio_contact': { attributes: { friendly_name: 'Patio Contact' }, state: 'off' },
    'binary_sensor.front_door': { attributes: { friendly_name: 'Front Door', device_class: 'door' }, state: 'off' },
    'conversation.home_assistant': { state: 'unknown' },
  },
  areas: {
    living_room: { area_id: 'living_room', name: 'Living Room' },
    kitchen: { area_id: 'kitchen', name: 'Kitchen' },
    master_bedroom: { area_id: 'master_bedroom', name: 'Master Bedroom' },
  },
  devices: {
    dev_lamp: { id: 'dev_lamp', area_id: 'living_room', name: 'Hue Lamp' },
    dev_kitchen: { id: 'dev_kitchen', area_id: 'kitchen', name: 'Kitchen Light' },
    dev_hub: { id: 'dev_hub', area_id: 'kitchen', name: 'Hub' },
  },
  entities: {
    'light.living_room_lamp': { entity_id: 'light.living_room_lamp', device_id: 'dev_lamp' },
    // Entity-level area override wins over the device area.
    'light.living_room_ceiling': { entity_id: 'light.living_room_ceiling', device_id: 'dev_kitchen', area_id: 'living_room' },
    'light.kitchen': { entity_id: 'light.kitchen', device_id: 'dev_kitchen' },
    'light.bedroom': { entity_id: 'light.bedroom', area_id: 'master_bedroom' },
    'sensor.hub_signal_strength': { entity_id: 'sensor.hub_signal_strength', device_id: 'dev_hub', entity_category: 'diagnostic' },
    'sensor.living_room_temperature': { entity_id: 'sensor.living_room_temperature', area_id: 'living_room' },
  },
};

describe('uc-smart-entity-context', () => {
  it('joins registries to resolve areas, device names, and diagnostic flags', () => {
    const context = buildSmartEntityContext(registryHass);
    const byId = new Map(context.entities.map(entity => [entity.entityId, entity]));

    expect(context.hasRegistry).toBe(true);
    expect(context.areas.map(area => area.name)).toEqual(['Living Room', 'Kitchen', 'Master Bedroom']);
    expect(byId.get('light.living_room_lamp')).toMatchObject({ areaName: 'Living Room', deviceName: 'Hue Lamp' });
    expect(byId.get('light.living_room_ceiling')?.areaName).toBe('Living Room');
    expect(byId.get('light.kitchen')?.areaName).toBe('Kitchen');
    expect(byId.get('sensor.hub_signal_strength')).toMatchObject({ isDiagnostic: true, areaName: 'Kitchen' });
    expect(byId.get('light.dead_bulb')?.available).toBe(false);
    expect(byId.has('conversation.home_assistant')).toBe(false);
  });

  it('degrades to a states-only view without registries', () => {
    const context = buildSmartEntityContext({ states: registryHass.states });
    expect(context.hasRegistry).toBe(false);
    expect(context.areas).toEqual([]);
    expect(context.entities.every(entity => !entity.areaId && !entity.isDiagnostic)).toBe(true);
  });

  it('extracts area hints from the prompt, longest name first', () => {
    const context = buildSmartEntityContext(registryHass);
    expect(extractAreaHints('show the living room lights', context.areas).map(area => area.name)).toEqual([
      'Living Room',
    ]);
    expect(extractAreaHints('master bedroom lamp', context.areas).map(area => area.name)).toEqual([
      'Master Bedroom',
    ]);
    expect(extractAreaHints('all lights', context.areas)).toEqual([]);
  });

  it('drops domain nouns and filler from prompt tokens', () => {
    expect(promptTokens('show the living room lights and the front door lock')).toEqual(
      expect.arrayContaining(['living', 'front'])
    );
    expect(promptTokens('show the lights')).toEqual([]);
  });

  it('narrows a domain to the mentioned area but keeps other domains intact', () => {
    const context = buildSmartEntityContext(registryHass);
    const ranked = rankSmartEntities(context, 'living room lights and the front door lock', {
      targets: [{ domain: 'light' }, { domain: 'lock' }],
    });
    const ids = ranked.map(item => item.entity.entityId);

    expect(ids).toContain('light.living_room_lamp');
    expect(ids).toContain('light.living_room_ceiling');
    expect(ids).not.toContain('light.kitchen');
    expect(ids).not.toContain('light.bedroom');
    expect(ids).toContain('lock.front_door');
  });

  it('prefers clean entities and removes diagnostic and unavailable ones when possible', () => {
    const context = buildSmartEntityContext(registryHass);
    const sensors = rankSmartEntities(context, 'kitchen sensors', { targets: [{ domain: 'sensor' }] }).map(
      item => item.entity.entityId
    );
    expect(sensors).not.toContain('sensor.hub_signal_strength');

    const lights = rankSmartEntities(context, 'lights', { targets: [{ domain: 'light' }] }).map(
      item => item.entity.entityId
    );
    expect(lights).not.toContain('light.dead_bulb');
  });

  it('matches device-class targets by attribute or by name when the class is missing', () => {
    const context = buildSmartEntityContext(registryHass);
    const doors = rankSmartEntities(context, 'door sensors', {
      targets: [{ domain: 'binary_sensor', deviceClasses: ['door', 'contact'] }],
    }).map(item => item.entity.entityId);

    expect(doors).toEqual(expect.arrayContaining(['binary_sensor.front_door', 'binary_sensor.patio_contact']));
  });

  it('narrows a domain to the entities the prompt names', () => {
    const context = buildSmartEntityContext(registryHass);
    const ids = rankSmartEntities(context, 'front door', {
      targets: [{ domain: 'binary_sensor' }, { domain: 'lock' }],
    }).map(item => item.entity.entityId);

    expect(ids).toEqual(expect.arrayContaining(['binary_sensor.front_door', 'lock.front_door']));
    expect(ids).not.toContain('binary_sensor.patio_contact');
  });

  it('matches prompt words against whole words only', () => {
    const context = buildSmartEntityContext({
      states: {
        'light.office': { attributes: { friendly_name: 'Office' }, state: 'off' },
        'light.hall': { attributes: { friendly_name: 'Hall' }, state: 'on' },
      },
    });
    // "off" must not narrow the lights to "Office".
    const ids = rankSmartEntities(context, 'lights with on and off buttons', {
      targets: [{ domain: 'light' }],
    }).map(item => item.entity.entityId);
    expect(ids).toEqual(['light.office', 'light.hall']);
  });

  it('keeps inventory order for equal scores', () => {
    const context = buildSmartEntityContext({
      states: {
        'lock.front_door': { attributes: { friendly_name: 'Front Door' }, state: 'locked' },
        'lock.back_door': { attributes: { friendly_name: 'Back Door' }, state: 'unlocked' },
      },
    });
    expect(
      rankSmartEntities(context, 'show only locks with status', { targets: [{ domain: 'lock' }] }).map(
        item => item.entity.entityId
      )
    ).toEqual(['lock.front_door', 'lock.back_door']);
  });
});
