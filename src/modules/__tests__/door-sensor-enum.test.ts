import { describe, it, expect } from 'vitest';
import { isDoorOpenState, findHomeConnectLinks } from '../../utils/uc-door-state';
import { UltraLaundryTrackerModule } from '../laundry-tracker-module';
import { UltraWasherModule } from '../appliance-module';

type Ent = { state: string; tk?: string; device?: string };

function makeHass(entities: Record<string, Ent>) {
  const states: Record<string, any> = {};
  const reg: Record<string, any> = {};
  for (const [id, e] of Object.entries(entities)) {
    states[id] = { entity_id: id, state: e.state, attributes: {} };
    reg[id] = { entity_id: id, device_id: e.device ?? 'dev1', translation_key: e.tk };
  }
  return { states, entities: reg, devices: { dev1: { name: 'Waschmaschine' } } } as any;
}

describe('isDoorOpenState', () => {
  it('treats binary sensor on and Home Connect open as open', () => {
    for (const s of ['on', 'open', 'Open', 'BSH.Common.EnumType.DoorState.Open', 'Offen', 'ajar']) {
      expect(isDoorOpenState(s)).toBe(true);
    }
  });
  it('treats closed and locked as shut', () => {
    for (const s of [
      'off',
      'closed',
      'locked',
      'BSH.Common.EnumType.DoorState.Closed',
      'BSH.Common.EnumType.DoorState.Locked',
      'unavailable',
      '',
      undefined,
      null,
    ]) {
      expect(isDoorOpenState(s)).toBe(false);
    }
  });
});

describe('findHomeConnectLinks', () => {
  it('finds core Home Connect door and operation state on the same device', () => {
    const hass = makeHass({
      'sensor.waschmaschine_leistung': { state: '5' },
      'sensor.waschmaschine_tur': { state: 'closed', tk: 'door' },
      'sensor.waschmaschine_betriebszustand': { state: 'run', tk: 'operation_state' },
      'sensor.trockner_tur': { state: 'open', tk: 'door', device: 'dev2' },
    });
    expect(findHomeConnectLinks(hass, 'sensor.waschmaschine_leistung')).toEqual({
      door: 'sensor.waschmaschine_tur',
      operationState: 'sensor.waschmaschine_betriebszustand',
    });
  });
  it('finds Home Connect Alt entities by id', () => {
    const p = '011040519583012345';
    const hass = makeHass({
      [`sensor.${p}_bsh_common_status_doorstate`]: { state: 'BSH.Common.EnumType.DoorState.Open' },
      [`sensor.${p}_bsh_common_status_operationstate`]: { state: 'x' },
    });
    expect(findHomeConnectLinks(hass, `sensor.${p}_bsh_common_status_doorstate`)).toEqual({
      door: `sensor.${p}_bsh_common_status_doorstate`,
      operationState: `sensor.${p}_bsh_common_status_operationstate`,
    });
  });
  it('returns nothing for entities without a device', () => {
    expect(findHomeConnectLinks({ states: {}, entities: {} } as any, 'sensor.plug')).toEqual({});
  });
});

describe('Laundry Tracker fills blanks from a Home Connect device', () => {
  const hass = makeHass({
    'sensor.waschmaschine_tur': { state: 'locked', tk: 'door' },
    'sensor.waschmaschine_betriebszustand': { state: 'run', tk: 'operation_state' },
    'sensor.waschmaschine_programmende': { state: 'x', tk: 'program_finish_time' },
  });
  const mod = new UltraLaundryTrackerModule() as any;

  it('fills door and state when the machine state is picked', () => {
    const out = mod._withHomeConnectLinks(
      hass,
      { id: 'a', kind: 'washer', power_entity: '', state_entity: '', door_entity: '' },
      { state_entity: 'sensor.waschmaschine_programmende' }
    );
    expect(out.door_entity).toBe('sensor.waschmaschine_tur');
    expect(out.state_entity).toBe('sensor.waschmaschine_programmende');
  });
  it('fills operation state when only the door is picked', () => {
    const out = mod._withHomeConnectLinks(
      hass,
      { id: 'a', kind: 'washer', power_entity: '', state_entity: '', door_entity: '' },
      { door_entity: 'sensor.waschmaschine_tur' }
    );
    expect(out).toEqual({
      door_entity: 'sensor.waschmaschine_tur',
      state_entity: 'sensor.waschmaschine_betriebszustand',
    });
  });
  it('never overwrites a door the user already picked', () => {
    const out = mod._withHomeConnectLinks(
      hass,
      {
        id: 'a',
        kind: 'washer',
        power_entity: 'sensor.plug',
        state_entity: '',
        door_entity: 'binary_sensor.lid',
      },
      { state_entity: 'sensor.waschmaschine_betriebszustand' }
    );
    expect(out).toEqual({ state_entity: 'sensor.waschmaschine_betriebszustand' });
  });
});

describe('Washer module reads a Home Connect enum door', () => {
  it('finds a Home Connect Alt door exposed as a sensor', () => {
    const p = '011040519583012345';
    const hass = makeHass({
      [`sensor.${p}_bsh_common_status_operationstate`]: {
        state: 'BSH.Common.EnumType.OperationState.Run',
      },
      [`sensor.${p}_bsh_common_status_doorstate`]: {
        state: 'BSH.Common.EnumType.DoorState.Locked',
      },
    });
    const mod = new UltraWasherModule() as any;
    const m = mod.createDefault('w1');
    const main = `sensor.${p}_bsh_common_status_operationstate`;
    m.entity = main;
    const l = mod.resolveLinks(m, hass, undefined, { id: main, state: 'x', attrs: {} });
    expect(l.door?.id).toBe(`sensor.${p}_bsh_common_status_doorstate`);
  });
});
