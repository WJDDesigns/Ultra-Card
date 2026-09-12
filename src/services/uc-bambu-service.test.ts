import { describe, it, expect } from 'vitest';
import type { HomeAssistant } from 'custom-card-helpers';
import {
  discoverBambuPrinters,
  forgetBambuTopology,
  bambuSnapshot,
  modelFamily,
  normalizeBambuModel,
  isBambuPrinterModel,
  trayFromEntity,
  orderPrinters,
  bambuSetupHints,
  printerEntity,
} from './uc-bambu-service';

function makeHass(opts: {
  devices?: Record<string, any>;
  entities?: Record<string, any>;
  states?: Record<string, any>;
}): HomeAssistant {
  return {
    states: opts.states || {},
    devices: opts.devices || {},
    entities: opts.entities || {},
    localize: (k: string) => k,
  } as unknown as HomeAssistant;
}

function x1cFixture() {
  const printerId = 'dev_x1c';
  const ams1 = 'dev_ams1';
  const ams2 = 'dev_ams2';
  const devices = {
    [printerId]: {
      id: printerId,
      name: 'X1C_01P00A123',
      name_by_user: 'Studio X1C',
      model: 'X1C',
      manufacturer: 'Bambu Lab',
      sw_version: '01.08.00',
      identifiers: [['bambu_lab', '01P00A123']],
    },
    [ams1]: {
      id: ams1,
      name: 'X1C_01P00A123_AMS_1',
      name_by_user: 'AMS 1',
      model: 'AMS',
      identifiers: [['bambu_lab', 'ams1serial']],
      via_device_id: printerId,
    },
    [ams2]: {
      id: ams2,
      name: 'X1C_01P00A123_AMS_2',
      model: 'AMS',
      identifiers: [['bambu_lab', 'ams2serial']],
      via_device_id: printerId,
    },
  };

  const entity = (
    id: string,
    device_id: string,
    translation_key: string,
    unique_id: string
  ) => ({
    entity_id: id,
    device_id,
    platform: 'bambu_lab',
    translation_key,
    unique_id,
  });

  const entities: Record<string, any> = {
    'sensor.studio_x1c_nozzle_temperature': entity(
      'sensor.studio_x1c_nozzle_temperature',
      printerId,
      'nozzle_temp',
      '01P00A123_nozzle_temp'
    ),
    'sensor.studio_x1c_bed_temperature': entity(
      'sensor.studio_x1c_bed_temperature',
      printerId,
      'bed_temp',
      '01P00A123_bed_temp'
    ),
    'sensor.studio_x1c_chamber_temperature': entity(
      'sensor.studio_x1c_chamber_temperature',
      printerId,
      'chamber_temp',
      '01P00A123_chamber_temp'
    ),
    'sensor.studio_x1c_print_progress': entity(
      'sensor.studio_x1c_print_progress',
      printerId,
      'print_progress',
      '01P00A123_print_progress'
    ),
    'sensor.studio_x1c_print_status': entity(
      'sensor.studio_x1c_print_status',
      printerId,
      'print_status',
      '01P00A123_print_status'
    ),
    'sensor.studio_x1c_current_stage': entity(
      'sensor.studio_x1c_current_stage',
      printerId,
      'stage',
      '01P00A123_stage'
    ),
    'sensor.studio_x1c_current_layer': entity(
      'sensor.studio_x1c_current_layer',
      printerId,
      'current_layer',
      '01P00A123_current_layer'
    ),
    'sensor.studio_x1c_total_layer_count': entity(
      'sensor.studio_x1c_total_layer_count',
      printerId,
      'total_layers',
      '01P00A123_total_layers'
    ),
    'sensor.studio_x1c_remaining_time': entity(
      'sensor.studio_x1c_remaining_time',
      printerId,
      'remaining_time',
      '01P00A123_remaining_time'
    ),
    'sensor.studio_x1c_task_name': entity(
      'sensor.studio_x1c_task_name',
      printerId,
      'subtask_name',
      '01P00A123_subtask_name'
    ),
    'sensor.studio_x1c_active_tray': entity(
      'sensor.studio_x1c_active_tray',
      printerId,
      'active_tray',
      '01P00A123_active_tray'
    ),
    'sensor.studio_x1c_speed_profile': entity(
      'sensor.studio_x1c_speed_profile',
      printerId,
      'speed_profile',
      '01P00A123_speed_profile'
    ),
    'binary_sensor.studio_x1c_online': entity(
      'binary_sensor.studio_x1c_online',
      printerId,
      'online',
      '01P00A123_online'
    ),
    'binary_sensor.studio_x1c_hms_errors': entity(
      'binary_sensor.studio_x1c_hms_errors',
      printerId,
      'hms',
      '01P00A123_hms'
    ),
    'button.studio_x1c_pause': entity(
      'button.studio_x1c_pause',
      printerId,
      'pause',
      '01P00A123_pause'
    ),
    'button.studio_x1c_resume': entity(
      'button.studio_x1c_resume',
      printerId,
      'resume',
      '01P00A123_resume'
    ),
    'button.studio_x1c_stop': entity(
      'button.studio_x1c_stop',
      printerId,
      'stop',
      '01P00A123_stop'
    ),
    'light.studio_x1c_chamber_light': entity(
      'light.studio_x1c_chamber_light',
      printerId,
      'chamber_light',
      '01P00A123_chamber_light'
    ),
    'fan.studio_x1c_cooling_fan': entity(
      'fan.studio_x1c_cooling_fan',
      printerId,
      'cooling_fan',
      '01P00A123_cooling_fan'
    ),
    'fan.studio_x1c_aux_fan': entity(
      'fan.studio_x1c_aux_fan',
      printerId,
      'aux_fan',
      '01P00A123_aux_fan'
    ),
    'fan.studio_x1c_chamber_fan': entity(
      'fan.studio_x1c_chamber_fan',
      printerId,
      'chamber_fan',
      '01P00A123_chamber_fan'
    ),
    'select.studio_x1c_printing_speed': entity(
      'select.studio_x1c_printing_speed',
      printerId,
      'printing_speed',
      '01P00A123_Speed'
    ),
    'number.studio_x1c_nozzle_target_temperature': entity(
      'number.studio_x1c_nozzle_target_temperature',
      printerId,
      'target_nozzle_temperature',
      '01P00A123_target_nozzle_temperature'
    ),
    'number.studio_x1c_bed_target_temperature': entity(
      'number.studio_x1c_bed_target_temperature',
      printerId,
      'target_bed_temperature',
      '01P00A123_target_bed_temperature'
    ),
    'camera.studio_x1c_camera': entity(
      'camera.studio_x1c_camera',
      printerId,
      'camera',
      '01P00A123_camera'
    ),
    'image.studio_x1c_cover_image': entity(
      'image.studio_x1c_cover_image',
      printerId,
      'cover_image',
      '01P00A123_cover_image'
    ),
    'sensor.ams_1_tray_1': entity('sensor.ams_1_tray_1', ams1, 'tray_1', 'ams1_tray_1'),
    'sensor.ams_1_tray_2': entity('sensor.ams_1_tray_2', ams1, 'tray_2', 'ams1_tray_2'),
    'sensor.ams_1_tray_3': entity('sensor.ams_1_tray_3', ams1, 'tray_3', 'ams1_tray_3'),
    'sensor.ams_1_tray_4': entity('sensor.ams_1_tray_4', ams1, 'tray_4', 'ams1_tray_4'),
    'sensor.ams_1_humidity_index': entity(
      'sensor.ams_1_humidity_index',
      ams1,
      'humidity_index',
      'ams1_humidity_index'
    ),
    'sensor.ams_2_tray_1': entity('sensor.ams_2_tray_1', ams2, 'tray_1', 'ams2_tray_1'),
  };

  const states: Record<string, any> = {
    'sensor.studio_x1c_nozzle_temperature': { state: '220', attributes: { unit_of_measurement: '°C' } },
    'sensor.studio_x1c_bed_temperature': { state: '55', attributes: {} },
    'sensor.studio_x1c_chamber_temperature': { state: '32', attributes: {} },
    'sensor.studio_x1c_print_progress': { state: '64', attributes: { unit_of_measurement: '%' } },
    'sensor.studio_x1c_print_status': { state: 'running', attributes: {} },
    'sensor.studio_x1c_current_stage': { state: 'printing', attributes: {} },
    'sensor.studio_x1c_current_layer': { state: '142', attributes: {} },
    'sensor.studio_x1c_total_layer_count': { state: '380', attributes: {} },
    'sensor.studio_x1c_remaining_time': { state: '84', attributes: { unit_of_measurement: 'min' } },
    'sensor.studio_x1c_task_name': { state: 'benchy', attributes: {} },
    'sensor.studio_x1c_active_tray': {
      state: 'Bambu PLA Basic',
      attributes: { type: 'PLA', color: '#FF0000FF', remain: 85, active: true },
    },
    'sensor.studio_x1c_speed_profile': { state: 'standard', attributes: { modifier: 100 } },
    'binary_sensor.studio_x1c_online': { state: 'on', attributes: {} },
    'binary_sensor.studio_x1c_hms_errors': { state: 'off', attributes: { Count: 0 } },
    'light.studio_x1c_chamber_light': { state: 'on', attributes: {} },
    'fan.studio_x1c_cooling_fan': { state: 'on', attributes: { percentage: 80 } },
    'fan.studio_x1c_aux_fan': { state: 'off', attributes: { percentage: 0 } },
    'fan.studio_x1c_chamber_fan': { state: 'on', attributes: { percentage: 60 } },
    'select.studio_x1c_printing_speed': { state: 'standard', attributes: {} },
    'number.studio_x1c_nozzle_target_temperature': { state: '220', attributes: {} },
    'number.studio_x1c_bed_target_temperature': { state: '55', attributes: {} },
    'camera.studio_x1c_camera': { state: 'idle', attributes: {} },
    'image.studio_x1c_cover_image': {
      state: 'idle',
      attributes: { entity_picture: '/api/image_proxy/image.studio_x1c_cover_image' },
    },
    'sensor.ams_1_tray_1': {
      state: 'Bambu PLA Basic',
      attributes: {
        type: 'PLA',
        color: '#FF0000FF',
        remain: 85,
        active: false,
        empty: false,
        slot: 1,
      },
    },
    'sensor.ams_1_tray_2': {
      state: 'Bambu PETG',
      attributes: {
        type: 'PETG',
        color: '#4488FFFF',
        remain: 42,
        active: true,
        empty: false,
        slot: 2,
      },
    },
    'sensor.ams_1_tray_3': {
      state: 'Empty',
      attributes: { type: 'Empty', color: '#00000000', empty: true, remain: -1, active: false },
    },
    'sensor.ams_1_tray_4': {
      state: 'ABS',
      attributes: { type: 'ABS', color: '#111111FF', remain: 12, empty: false, active: false },
    },
    'sensor.ams_1_humidity_index': { state: '2', attributes: {} },
    'sensor.ams_2_tray_1': {
      state: 'PLA',
      attributes: { type: 'PLA', color: '#00FF00FF', remain: 100, empty: false, active: false },
    },
  };

  return { devices, entities, states, printerId };
}

describe('model helpers', () => {
  it('normalizes and classifies models', () => {
    expect(normalizeBambuModel('X1 Carbon')).toBe('X1CARBON');
    expect(normalizeBambuModel('A1 mini')).toBe('A1MINI');
    expect(isBambuPrinterModel('X1C')).toBe(true);
    expect(isBambuPrinterModel('A1MINI')).toBe(true);
    expect(isBambuPrinterModel('AMS')).toBe(false);
    expect(modelFamily('X1C')).toBe('enclosed_corexy');
    expect(modelFamily('P1S')).toBe('enclosed_corexy');
    expect(modelFamily('A1')).toBe('bedslinger');
    expect(modelFamily('A1MINI')).toBe('bedslinger');
    expect(modelFamily('H2D')).toBe('h2');
  });
});

describe('discoverBambuPrinters', () => {
  it('discovers X1C with two AMS units', () => {
    const fx = x1cFixture();
    const hass = makeHass(fx);
    forgetBambuTopology('t1');
    const topo = discoverBambuPrinters(hass, 't1');
    expect(topo.hasBambuIntegration).toBe(true);
    expect(topo.printers).toHaveLength(1);
    const p = topo.printers[0]!;
    expect(p.name).toBe('Studio X1C');
    expect(p.model).toBe('X1C');
    expect(p.family).toBe('enclosed_corexy');
    expect(p.amsUnits).toHaveLength(2);
    expect(p.capabilities.chamberTemp).toBe(true);
    expect(p.capabilities.auxFan).toBe(true);
    expect(p.capabilities.camera).toBe(true);
    expect(printerEntity(p, 'nozzle_temp')).toBe('sensor.studio_x1c_nozzle_temperature');
    expect(printerEntity(p, 'pause')).toBe('button.studio_x1c_pause');
  });

  it('builds a live snapshot', () => {
    const fx = x1cFixture();
    const hass = makeHass(fx);
    forgetBambuTopology('t2');
    const topo = discoverBambuPrinters(hass, 't2');
    const snap = bambuSnapshot(topo.printers[0]!, hass);
    expect(snap.status).toBe('printing');
    expect(snap.progress).toBe(64);
    expect(snap.nozzleTemp).toBe(220);
    expect(snap.bedTemp).toBe(55);
    expect(snap.chamberTemp).toBe(32);
    expect(snap.currentLayer).toBe(142);
    expect(snap.totalLayers).toBe(380);
    expect(snap.remainingMinutes).toBe(84);
    expect(snap.taskName).toBe('benchy');
    expect(snap.speedProfile).toBe('standard');
    expect(snap.lightOn).toBe(true);
    expect(snap.fans.length).toBeGreaterThanOrEqual(3);
    expect(snap.trays.length).toBeGreaterThanOrEqual(4);
    expect(snap.trays.find(t => t.active)?.type).toBe('PETG');
    expect(snap.controls.pauseEntityId).toBeTruthy();
    expect(snap.cameraEntityId).toBe('camera.studio_x1c_camera');
  });

  it('handles renamed entity ids via translation_key', () => {
    const fx = x1cFixture();
    // Rename entity_id but keep translation_key
    const old = 'sensor.studio_x1c_nozzle_temperature';
    const neu = 'sensor.garage_hotend';
    fx.entities[neu] = { ...fx.entities[old], entity_id: neu };
    delete fx.entities[old];
    fx.states[neu] = fx.states[old];
    delete fx.states[old];
    const hass = makeHass(fx);
    forgetBambuTopology('t3');
    const topo = discoverBambuPrinters(hass, 't3');
    expect(printerEntity(topo.printers[0]!, 'nozzle_temp')).toBe(neu);
    expect(bambuSnapshot(topo.printers[0]!, hass).nozzleTemp).toBe(220);
  });

  it('discovers A1 mini as bedslinger without chamber fan', () => {
    const printerId = 'dev_a1';
    const amsId = 'dev_ams_lite';
    const hass = makeHass({
      devices: {
        [printerId]: {
          id: printerId,
          name: 'A1MINI_ABC',
          model: 'A1MINI',
          identifiers: [['bambu_lab', 'ABC']],
        },
        [amsId]: {
          id: amsId,
          name: 'AMS Lite',
          model: 'AMS Lite',
          identifiers: [['bambu_lab', 'lite1']],
          via_device_id: printerId,
        },
      },
      entities: {
        'sensor.a1_print_progress': {
          entity_id: 'sensor.a1_print_progress',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'print_progress',
          unique_id: 'ABC_print_progress',
        },
        'sensor.a1_nozzle_temperature': {
          entity_id: 'sensor.a1_nozzle_temperature',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'nozzle_temp',
          unique_id: 'ABC_nozzle_temp',
        },
        'fan.a1_cooling_fan': {
          entity_id: 'fan.a1_cooling_fan',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'cooling_fan',
          unique_id: 'ABC_cooling_fan',
        },
        'binary_sensor.a1_online': {
          entity_id: 'binary_sensor.a1_online',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'online',
          unique_id: 'ABC_online',
        },
        'sensor.ams_lite_tray_1': {
          entity_id: 'sensor.ams_lite_tray_1',
          device_id: amsId,
          platform: 'bambu_lab',
          translation_key: 'tray_1',
          unique_id: 'lite1_tray_1',
        },
      },
      states: {
        'sensor.a1_print_progress': { state: '10', attributes: {} },
        'sensor.a1_nozzle_temperature': { state: '210', attributes: {} },
        'fan.a1_cooling_fan': { state: 'on', attributes: { percentage: 100 } },
        'binary_sensor.a1_online': { state: 'on', attributes: {} },
        'sensor.ams_lite_tray_1': {
          state: 'PLA',
          attributes: { type: 'PLA', color: '#FFFFFFFF', remain: 50, empty: false },
        },
      },
    });
    forgetBambuTopology('t4');
    const topo = discoverBambuPrinters(hass, 't4');
    expect(topo.printers[0]!.family).toBe('bedslinger');
    expect(topo.printers[0]!.capabilities.chamberTemp).toBe(false);
    expect(topo.printers[0]!.capabilities.auxFan).toBe(false);
    expect(topo.printers[0]!.amsUnits[0]!.model).toBe('AMS Lite');
  });

  it('discovers H2D dual nozzle + external spools', () => {
    const printerId = 'dev_h2d';
    const ext1 = 'dev_ext1';
    const ext2 = 'dev_ext2';
    const hass = makeHass({
      devices: {
        [printerId]: {
          id: printerId,
          name: 'H2D',
          model: 'H2D',
          identifiers: [['bambu_lab', 'H2D1']],
        },
        [ext1]: {
          id: ext1,
          name: 'External Spool',
          model: 'External Spool',
          identifiers: [['bambu_lab', 'H2D1_ExternalSpool']],
          via_device_id: printerId,
        },
        [ext2]: {
          id: ext2,
          name: 'External Spool 2',
          model: 'External Spool',
          identifiers: [['bambu_lab', 'H2D1_ExternalSpool2']],
          via_device_id: printerId,
        },
      },
      entities: {
        'sensor.h2d_left_nozzle_temperature': {
          entity_id: 'sensor.h2d_left_nozzle_temperature',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'left_nozzle_temp',
          unique_id: 'H2D1_left_nozzle_temp',
        },
        'sensor.h2d_right_nozzle_temperature': {
          entity_id: 'sensor.h2d_right_nozzle_temperature',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'right_nozzle_temp',
          unique_id: 'H2D1_right_nozzle_temp',
        },
        'sensor.h2d_print_status': {
          entity_id: 'sensor.h2d_print_status',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'print_status',
          unique_id: 'H2D1_print_status',
        },
        'binary_sensor.h2d_online': {
          entity_id: 'binary_sensor.h2d_online',
          device_id: printerId,
          platform: 'bambu_lab',
          translation_key: 'online',
          unique_id: 'H2D1_online',
        },
        'sensor.ext_external_spool': {
          entity_id: 'sensor.ext_external_spool',
          device_id: ext1,
          platform: 'bambu_lab',
          translation_key: 'external_spool',
          unique_id: 'ext1_external_spool',
        },
        'sensor.ext2_external_spool': {
          entity_id: 'sensor.ext2_external_spool',
          device_id: ext2,
          platform: 'bambu_lab',
          translation_key: 'external_spool',
          unique_id: 'ext2_external_spool',
        },
      },
      states: {
        'sensor.h2d_left_nozzle_temperature': { state: '220', attributes: {} },
        'sensor.h2d_right_nozzle_temperature': { state: '0', attributes: {} },
        'sensor.h2d_print_status': { state: 'idle', attributes: {} },
        'binary_sensor.h2d_online': { state: 'on', attributes: {} },
        'sensor.ext_external_spool': {
          state: 'PLA',
          attributes: { type: 'PLA', color: '#FFAA00FF', empty: false, active: true },
        },
        'sensor.ext2_external_spool': {
          state: 'Empty',
          attributes: { empty: true, color: '#00000000' },
        },
      },
    });
    forgetBambuTopology('t5');
    const topo = discoverBambuPrinters(hass, 't5');
    expect(topo.printers[0]!.family).toBe('h2');
    expect(topo.printers[0]!.capabilities.dualNozzle).toBe(true);
    expect(topo.printers[0]!.externalSpools).toHaveLength(2);
  });
});

describe('trayFromEntity / order / hints', () => {
  it('parses tray color and empty', () => {
    const hass = makeHass({
      states: {
        'sensor.t': {
          state: 'PLA',
          attributes: { type: 'PLA', color: '#00FF00FF', remain: 50, empty: false, active: true },
        },
      },
    });
    const tray = trayFromEntity(hass, 'sensor.t', 1);
    expect(tray.color).toBe('#00FF00');
    expect(tray.remain).toBe(50);
    expect(tray.active).toBe(true);
  });

  it('orders and hides printers', () => {
    const printers = [
      { deviceId: 'a', name: 'A' },
      { deviceId: 'b', name: 'B' },
      { deviceId: 'c', name: 'C' },
    ] as any;
    expect(orderPrinters(printers, ['c', 'a'], ['b']).map((p: any) => p.deviceId)).toEqual([
      'c',
      'a',
    ]);
  });

  it('emits no_integration hint', () => {
    const hints = bambuSetupHints(
      { printers: [], allEntityIds: [], hasBambuIntegration: false },
      makeHass({})
    );
    expect(hints.some(h => h.id === 'no_integration')).toBe(true);
  });
});
