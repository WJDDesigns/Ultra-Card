import { describe, it, expect, vi } from 'vitest';
import {
  cameraActionIcon,
  cameraActionIsActive,
  cameraActionNeedsConfirm,
  cameraActionService,
  cameraLiveTriggerState,
  runCameraAction,
} from './uc-camera-actions';

const hassWith = (states: Record<string, any>) => ({ states, callService: vi.fn() }) as any;

describe('camera action buttons', () => {
  it('unlocks a locked lock and locks an unlocked one', () => {
    expect(cameraActionService('lock.front', { state: 'locked' })).toEqual({
      domain: 'lock',
      service: 'unlock',
    });
    expect(cameraActionService('lock.front', { state: 'unlocked' })).toEqual({
      domain: 'lock',
      service: 'lock',
    });
  });

  it('presses buttons, runs scripts and toggles everything else', () => {
    expect(cameraActionService('button.chime')).toEqual({ domain: 'button', service: 'press' });
    expect(cameraActionService('script.greet')).toEqual({ domain: 'script', service: 'turn_on' });
    expect(cameraActionService('cover.gate')).toEqual({ domain: 'cover', service: 'toggle' });
    expect(cameraActionService('light.porch')).toEqual({
      domain: 'homeassistant',
      service: 'toggle',
    });
  });

  it('asks twice for locks unless told otherwise', () => {
    expect(cameraActionNeedsConfirm({ id: 'a', entity: 'lock.front' })).toBe(true);
    expect(cameraActionNeedsConfirm({ id: 'a', entity: 'lock.front', confirm: false })).toBe(false);
    expect(cameraActionNeedsConfirm({ id: 'a', entity: 'light.porch' })).toBe(false);
    expect(cameraActionNeedsConfirm({ id: 'a', entity: 'light.porch', confirm: true })).toBe(true);
  });

  it('follows the lock state for icon and highlight', () => {
    const button = { id: 'a', entity: 'lock.front' };
    expect(cameraActionIcon(button, { state: 'locked' })).toBe('mdi:lock');
    expect(cameraActionIcon(button, { state: 'unlocked' })).toBe('mdi:lock-open-variant');
    expect(cameraActionIcon({ ...button, icon: 'mdi:door' }, { state: 'locked' })).toBe('mdi:door');
    expect(cameraActionIsActive('lock.front', { state: 'unlocked' })).toBe(true);
    expect(cameraActionIsActive('lock.front', { state: 'locked' })).toBe(false);
  });

  it('calls the service for the current state', async () => {
    const hass = hassWith({ 'lock.front': { state: 'locked' } });
    await runCameraAction(hass, { id: 'a', entity: 'lock.front' });
    expect(hass.callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.front' });
  });
});

describe('camera live trigger', () => {
  const now = Date.parse('2026-10-16T12:00:00Z');

  it('stays live while an on/off entity is on', () => {
    const hass = hassWith({ 'binary_sensor.ding': { state: 'on' } });
    expect(cameraLiveTriggerState(hass, 'binary_sensor.ding', 30, now)).toEqual({ live: true });
  });

  it('holds the stream after the entity turns off, then drops back', () => {
    const offAt = new Date(now - 10_000).toISOString();
    const hass = hassWith({ 'input_boolean.live': { state: 'off', last_changed: offAt } });
    expect(cameraLiveTriggerState(hass, 'input_boolean.live', 30, now)).toEqual({
      live: true,
      until: now + 20_000,
    });
    expect(cameraLiveTriggerState(hass, 'input_boolean.live', 5, now)).toEqual({ live: false });
  });

  it('goes live for the hold after an event entity fires', () => {
    const hass = hassWith({
      'event.front_door_ding': { state: new Date(now - 5_000).toISOString() },
    });
    expect(cameraLiveTriggerState(hass, 'event.front_door_ding', 60, now)).toEqual({
      live: true,
      until: now + 55_000,
    });
    expect(cameraLiveTriggerState(hass, 'event.front_door_ding', 2, now)).toEqual({ live: false });
  });

  it('ignores missing, unknown and unavailable triggers', () => {
    const hass = hassWith({ 'event.ding': { state: 'unknown' } });
    expect(cameraLiveTriggerState(hass, 'event.ding', 60, now)).toEqual({ live: false });
    expect(cameraLiveTriggerState(hass, 'event.missing', 60, now)).toEqual({ live: false });
    expect(cameraLiveTriggerState(hass, undefined, 60, now)).toEqual({ live: false });
  });
});
