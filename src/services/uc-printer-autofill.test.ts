import { describe, it, expect } from 'vitest';
import type { HomeAssistant } from 'custom-card-helpers';
import {
  listAutofillDevices,
  autofillFromDevice,
  applyAutofillToModule,
} from './uc-printer-autofill';

function makeHass(opts: {
  devices?: Record<string, any>;
  entities?: Record<string, any>;
}): HomeAssistant {
  return {
    states: {},
    devices: opts.devices || {},
    entities: opts.entities || {},
  } as unknown as HomeAssistant;
}

describe('uc-printer-autofill', () => {
  it('lists OctoPrint devices', () => {
    const hass = makeHass({
      devices: {
        d1: {
          id: 'd1',
          name: 'Ender 3',
          identifiers: [['octoprint', 'ender']],
        },
      },
      entities: {
        'sensor.ender_3_current_state': {
          entity_id: 'sensor.ender_3_current_state',
          device_id: 'd1',
          platform: 'octoprint',
        },
      },
    });
    const list = listAutofillDevices(hass, 'octoprint');
    expect(list).toHaveLength(1);
    expect(list[0]!.source).toBe('octoprint');
  });

  it('autofills moonraker-style entities', () => {
    const hass = makeHass({
      devices: {
        d1: {
          id: 'd1',
          name: 'Voron',
          identifiers: [['moonraker', 'voron']],
        },
      },
      entities: {
        'sensor.voron_print_status': {
          entity_id: 'sensor.voron_print_status',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'sensor.voron_progress': {
          entity_id: 'sensor.voron_progress',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'sensor.voron_extruder_temperature': {
          entity_id: 'sensor.voron_extruder_temperature',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'sensor.voron_heater_bed_temperature': {
          entity_id: 'sensor.voron_heater_bed_temperature',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'sensor.voron_print_time_left': {
          entity_id: 'sensor.voron_print_time_left',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'button.voron_pause': {
          entity_id: 'button.voron_pause',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'button.voron_resume': {
          entity_id: 'button.voron_resume',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'button.voron_cancel': {
          entity_id: 'button.voron_cancel',
          device_id: 'd1',
          platform: 'moonraker',
        },
        'fan.voron_part_fan': {
          entity_id: 'fan.voron_part_fan',
          device_id: 'd1',
          platform: 'moonraker',
          original_name: 'Part Fan',
        },
        'camera.voron_camera': {
          entity_id: 'camera.voron_camera',
          device_id: 'd1',
          platform: 'moonraker',
        },
      },
    });
    const map = autofillFromDevice(hass, 'd1');
    expect(map.status_entity).toBe('sensor.voron_print_status');
    expect(map.progress_entity).toBe('sensor.voron_progress');
    expect(map.nozzle_temp_entity).toBe('sensor.voron_extruder_temperature');
    expect(map.bed_temp_entity).toBe('sensor.voron_heater_bed_temperature');
    expect(map.remaining_time_entity).toBe('sensor.voron_print_time_left');
    expect(map.pause_entity).toBe('button.voron_pause');
    expect(map.stop_entity).toBe('button.voron_cancel');
    expect(map.camera_entity).toBe('camera.voron_camera');
    expect(map.fans?.[0]?.entity).toBe('fan.voron_part_fan');

    const partial = applyAutofillToModule(map);
    expect(partial.progress_entity).toBe(map.progress_entity);
  });

  it('autofills PrusaLink entities', () => {
    const hass = makeHass({
      devices: {
        d1: {
          id: 'd1',
          name: 'MK4',
          identifiers: [['prusalink', 'mk4']],
        },
      },
      entities: {
        'sensor.mk4_print_progress': {
          entity_id: 'sensor.mk4_print_progress',
          device_id: 'd1',
          platform: 'prusalink',
        },
        'sensor.mk4_nozzle_temperature': {
          entity_id: 'sensor.mk4_nozzle_temperature',
          device_id: 'd1',
          platform: 'prusalink',
        },
        'sensor.mk4_bed_temperature': {
          entity_id: 'sensor.mk4_bed_temperature',
          device_id: 'd1',
          platform: 'prusalink',
        },
      },
    });
    const map = autofillFromDevice(hass, 'd1');
    expect(map.progress_entity).toContain('progress');
    expect(map.nozzle_temp_entity).toContain('nozzle');
    expect(map.bed_temp_entity).toContain('bed');
  });
});
