import { describe, it, expect } from 'vitest';
import { UltraWasherModule } from '../appliance-module';

type Ent = { state: string; attributes?: Record<string, unknown>; tk?: string };

function makeHass(entities: Record<string, Ent>) {
  const states: Record<string, any> = {};
  const reg: Record<string, any> = {};
  for (const [id, e] of Object.entries(entities)) {
    states[id] = { entity_id: id, state: e.state, attributes: e.attributes ?? {} };
    reg[id] = { entity_id: id, device_id: 'dev1', translation_key: e.tk };
  }
  return {
    states,
    entities: reg,
    devices: { dev1: { name: 'Waschmaschine' } },
  } as any;
}

function links(hass: any, main: string) {
  const mod = new UltraWasherModule() as any;
  const m = mod.createDefault('w1');
  m.entity = main;
  return mod.resolveLinks(m, hass, undefined, {
    id: main,
    state: hass.states[main].state,
    attrs: hass.states[main].attributes,
  });
}

describe('Washer auto-detection: Home Connect (core, German entity ids)', () => {
  const hass = makeHass({
    'sensor.waschmaschine_betriebszustand': { state: 'run', tk: 'operation_state' },
    'sensor.waschmaschine_programmende': {
      state: '2030-01-01T12:00:00+00:00',
      tk: 'program_finish_time',
    },
    'sensor.waschmaschine_programmfortschritt': { state: '40', tk: 'program_progress' },
    'sensor.waschmaschine_tur': { state: 'open', tk: 'door' },
    'switch.waschmaschine_netzschalter': { state: 'on', tk: 'power' },
    'switch.waschmaschine_kindersicherung': { state: 'on', tk: 'child_lock' },
    'binary_sensor.waschmaschine_fernsteuerung': { state: 'on', tk: 'remote_control' },
    'select.waschmaschine_aktives_programm': {
      state: 'laundry_care_washer_program_cotton',
      tk: 'active_program',
    },
    'select.waschmaschine_schleuderdrehzahl': { state: 'x', tk: 'spin_speed' },
    'button.waschmaschine_programm_pausieren': { state: 'unknown', tk: 'pause_program' },
    'button.waschmaschine_programm_fortsetzen': { state: 'unknown', tk: 'resume_program' },
    'button.waschmaschine_programm_stoppen': { state: 'unknown', tk: 'stop_program' },
  });
  const l = links(hass, 'sensor.waschmaschine_betriebszustand');

  it('finds the linked entities by translation key', () => {
    expect(l.machineState?.id).toBe('sensor.waschmaschine_betriebszustand');
    expect(l.completion?.id).toBe('sensor.waschmaschine_programmende');
    expect(l.door?.id).toBe('sensor.waschmaschine_tur');
    expect(l.powerSwitch?.id).toBe('switch.waschmaschine_netzschalter');
    expect(l.childLock?.id).toBe('switch.waschmaschine_kindersicherung');
    expect(l.remoteControl?.id).toBe('binary_sensor.waschmaschine_fernsteuerung');
    expect(l.jobState?.id).toBe('select.waschmaschine_aktives_programm');
  });

  it('finds the program buttons', () => {
    expect(l.programButtons.pause?.id).toBe('button.waschmaschine_programm_pausieren');
    expect(l.programButtons.resume?.id).toBe('button.waschmaschine_programm_fortsetzen');
    expect(l.programButtons.stop?.id).toBe('button.waschmaschine_programm_stoppen');
  });
});

describe('Washer auto-detection: Home Connect Alt', () => {
  const p = 'bosch_wat28400_68a40e43d32a';
  const hass = makeHass({
    [`sensor.${p}_bsh_common_status_operationstate`]: {
      state: 'BSH.Common.EnumType.OperationState.Run',
      tk: 'statuses',
    },
    [`sensor.${p}_bsh_common_option_remainingprogramtime`]: {
      state: '2030-01-01T12:00:00+00:00',
      tk: 'options',
    },
    [`sensor.${p}_active_program`]: { state: 'LaundryCare.Washer.Program.Cotton', tk: 'programs' },
    [`binary_sensor.${p}_bsh_common_status_doorstate`]: { state: 'off' },
    [`binary_sensor.${p}_bsh_common_status_remotecontrolactive`]: { state: 'on' },
    [`switch.${p}_bsh_common_setting_powerstate`]: { state: 'on' },
    [`switch.${p}_bsh_common_setting_childlock`]: { state: 'off' },
    [`button.${p}_start_pause`]: { state: 'unknown' },
    [`button.${p}_stop`]: { state: 'unknown' },
  });
  const l = links(hass, `sensor.${p}_bsh_common_status_operationstate`);

  it('finds the linked entities from API-key entity ids', () => {
    expect(l.machineState?.id).toBe(`sensor.${p}_bsh_common_status_operationstate`);
    expect(l.completion?.id).toBe(`sensor.${p}_bsh_common_option_remainingprogramtime`);
    expect(l.jobState?.id).toBe(`sensor.${p}_active_program`);
    expect(l.door?.id).toBe(`binary_sensor.${p}_bsh_common_status_doorstate`);
    expect(l.remoteControl?.id).toBe(`binary_sensor.${p}_bsh_common_status_remotecontrolactive`);
    expect(l.powerSwitch?.id).toBe(`switch.${p}_bsh_common_setting_powerstate`);
    expect(l.childLock?.id).toBe(`switch.${p}_bsh_common_setting_childlock`);
  });

  it('finds the start/pause and stop buttons', () => {
    expect(l.programButtons.startPause?.id).toBe(`button.${p}_start_pause`);
    expect(l.programButtons.stop?.id).toBe(`button.${p}_stop`);
  });
});
