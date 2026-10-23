import { describe, it, expect, vi } from 'vitest';
import { entityToggleService, entityTurnOnOffService, toggleEntities } from './uc-entity-toggle';

const hassWith = (states: Record<string, any>) => ({ states, callService: vi.fn() }) as any;

describe('entity toggle', () => {
  it('unlocks a locked lock and locks anything else', () => {
    expect(entityToggleService('lock.front', { state: 'locked' })).toEqual({
      domain: 'lock',
      service: 'unlock',
    });
    expect(entityToggleService('lock.front', { state: 'unlocked' })).toEqual({
      domain: 'lock',
      service: 'lock',
    });
    expect(entityToggleService('lock.front', { state: 'jammed' })).toEqual({
      domain: 'lock',
      service: 'lock',
    });
  });

  it('presses buttons, activates scenes and toggles the rest', () => {
    expect(entityToggleService('button.chime')).toEqual({ domain: 'button', service: 'press' });
    expect(entityToggleService('input_button.bell')).toEqual({
      domain: 'input_button',
      service: 'press',
    });
    expect(entityToggleService('scene.movie')).toEqual({ domain: 'scene', service: 'turn_on' });
    expect(entityToggleService('valve.garden')).toEqual({ domain: 'valve', service: 'toggle' });
    expect(entityToggleService('switch.kettle')).toEqual({
      domain: 'homeassistant',
      service: 'toggle',
    });
  });

  it('maps on and off to each domain', () => {
    expect(entityTurnOnOffService('lock.front', true)).toEqual({ domain: 'lock', service: 'unlock' });
    expect(entityTurnOnOffService('cover.gate', false)).toEqual({
      domain: 'cover',
      service: 'close_cover',
    });
    expect(entityTurnOnOffService('light.porch', true)).toEqual({
      domain: 'homeassistant',
      service: 'turn_on',
    });
  });

  it('gives locks their own call and keeps the rest in one homeassistant.toggle', async () => {
    const hass = hassWith({ 'lock.front': { state: 'locked' } });
    await toggleEntities(hass, ['lock.front', 'light.a', 'switch.b']);
    expect(hass.callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.front' });
    expect(hass.callService).toHaveBeenCalledWith('homeassistant', 'toggle', {
      entity_id: ['light.a', 'switch.b'],
    });
    expect(hass.callService).toHaveBeenCalledTimes(2);
  });

  it('keeps a single plain entity as a string', async () => {
    const hass = hassWith({});
    await toggleEntities(hass, 'light.a');
    expect(hass.callService).toHaveBeenCalledWith('homeassistant', 'toggle', { entity_id: 'light.a' });
  });
});
