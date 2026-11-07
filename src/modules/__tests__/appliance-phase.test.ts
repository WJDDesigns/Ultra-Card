import { describe, it, expect } from 'vitest';
import { resolveAppliancePhase, resolvePhase, stripStatePrefix } from '../appliance-phase';

describe('resolvePhase', () => {
  it.each([
    ['run', 'running'],
    ['pause', 'paused'],
    ['stop', 'idle'],
    ['running', 'running'],
    ['end', 'done'],
    ['in_use', 'running'],
    ['program_ended', 'done'],
    ['on', 'running'],
    ['off', 'idle'],
    ['error', 'error'],
    ['unavailable', 'unavailable'],
    ['', 'unavailable'],
    ['Running', 'running'],
  ])('keeps existing vocabulary: %s -> %s', (state, phase) => {
    expect(resolvePhase(state)).toBe(phase);
  });

  it.each([
    ['device_state_running', 'running'],
    ['device_state_paused', 'paused'],
    ['device_state_off', 'idle'],
    ['device_state_on', 'idle'],
    ['device_state_time_delay_active', 'paused'],
    ['device_state_time_delay_paused', 'paused'],
    ['washer_substate_remove_laundry', 'done'],
    ['washer_substate_spin', 'running'],
    ['washer_water_intake', 'running'],
  ])('understands HomeWhiz namespaced states: %s -> %s', (state, phase) => {
    expect(resolvePhase(state)).toBe(phase);
  });

  it('matches whole words only', () => {
    expect(resolvePhase('weekend_mode')).toBe('idle');
    expect(resolvePhase('drying_complete')).toBe('done');
  });
});

describe('resolveAppliancePhase', () => {
  it('reports done when a powered-on machine has a finished sub state', () => {
    expect(resolveAppliancePhase('device_state_on', 'washer_substate_remove_laundry')).toBe('done');
  });

  it('keeps running while the sub state is mid-cycle', () => {
    expect(resolveAppliancePhase('device_state_running', 'washer_substate_rinsing')).toBe(
      'running'
    );
  });

  it('lets a finished job override a generic "on" machine state', () => {
    expect(resolveAppliancePhase('on', 'finished')).toBe('done');
  });

  it('does not override an explicit stop', () => {
    expect(resolveAppliancePhase('stop', 'finish')).toBe('idle');
    expect(resolveAppliancePhase('off', 'done')).toBe('idle');
  });

  it('ignores a missing job state', () => {
    expect(resolveAppliancePhase('device_state_running')).toBe('running');
    expect(resolveAppliancePhase('device_state_running', null)).toBe('running');
  });
});

describe('stripStatePrefix', () => {
  it('drops integration namespaces from labels', () => {
    expect(stripStatePrefix('washer_substate_remove_laundry')).toBe('remove_laundry');
    expect(stripStatePrefix('device_state_running')).toBe('running');
  });

  it('leaves ordinary labels alone', () => {
    expect(stripStatePrefix('Dryer Refresh')).toBe('Dryer Refresh');
    expect(stripStatePrefix('rinse')).toBe('rinse');
  });
});

describe('Home Connect (Bosch / Siemens / Neff)', () => {
  it.each([
    ['inactive', 'idle'],
    ['ready', 'idle'],
    ['delayedstart', 'paused'],
    ['run', 'running'],
    ['pause', 'paused'],
    ['actionrequired', 'paused'],
    ['finished', 'done'],
    ['error', 'error'],
    ['aborting', 'idle'],
  ])('reads core operation_state options: %s -> %s', (state, phase) => {
    expect(resolvePhase(state)).toBe(phase);
  });

  it.each([
    ['BSH.Common.EnumType.OperationState.Run', 'running'],
    ['BSH.Common.EnumType.OperationState.DelayedStart', 'paused'],
    ['BSH.Common.EnumType.OperationState.ActionRequired', 'paused'],
    ['BSH.Common.EnumType.OperationState.Finished', 'done'],
    ['BSH.Common.EnumType.OperationState.Ready', 'idle'],
    ['BSH.Common.EnumType.OperationState.Inactive', 'idle'],
    ['BSH.Common.EnumType.OperationState.Error', 'error'],
  ])('reads Home Connect Alt raw API values: %s -> %s', (state, phase) => {
    expect(resolvePhase(state)).toBe(phase);
  });

  it.each([
    ['Läuft', 'running'],
    ['Fertig', 'done'],
    ['Bereit', 'idle'],
    ['Startverzögerung', 'paused'],
    ['Aktion erforderlich', 'paused'],
  ])('reads Home Connect Alt German display values: %s -> %s', (state, phase) => {
    expect(resolvePhase(state)).toBe(phase);
  });

  it('labels programs without their API namespace', () => {
    expect(stripStatePrefix('LaundryCare.Washer.Program.Cotton')).toBe('Cotton');
    expect(stripStatePrefix('laundry_care_washer_program_cotton')).toBe('cotton');
    expect(stripStatePrefix('laundry_care_dryer_program_synthetic')).toBe('synthetic');
    expect(stripStatePrefix('dishcare_dishwasher_program_eco_50')).toBe('eco_50');
  });
});
