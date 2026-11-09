import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UltraCameraModule } from './camera-module';
import { responsiveDesignService } from '../services/uc-responsive-design-service';

const hassAt = (state: string, lastChanged: string, userId = 'u1') =>
  ({
    states: { 'binary_sensor.ring': { state, last_changed: lastChanged, attributes: {} } },
    user: { id: userId },
  }) as any;

describe('camera Open Fullscreen When', () => {
  let mod: any;
  let opened: number;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse('2026-11-08T12:00:00Z'));
    mod = new UltraCameraModule();
    opened = 0;
    mod.createFullscreenModal = vi.fn(() => {
      opened++;
      return vi.fn();
    });
  });
  afterEach(() => vi.useRealTimers());

  const run = (m: any, hass: any) => {
    mod._checkFullscreenTrigger(m, hass);
    vi.advanceTimersByTime(1);
  };

  it('opens once per ring, not on a stale ring at load', () => {
    const m = { id: 'c1', type: 'camera', fullscreen_trigger_entity: 'binary_sensor.ring' };
    run(m, hassAt('on', '2026-11-08T10:00:00Z'));
    expect(opened).toBe(0);
    run(m, hassAt('off', '2026-11-08T11:00:00Z'));
    run(m, hassAt('on', '2026-11-08T11:59:59Z'));
    expect(opened).toBe(1);
    run(m, hassAt('on', '2026-11-08T11:59:59Z'));
    expect(opened).toBe(1);
  });

  it('skips users and devices that are excluded, and auto closes', () => {
    const m: any = {
      id: 'c2',
      type: 'camera',
      fullscreen_trigger_entity: 'binary_sensor.ring',
      fullscreen_trigger_users: { mode: 'show', users: ['u1'] },
      fullscreen_trigger_close: 5,
    };
    run(m, hassAt('off', '2026-11-08T11:00:00Z', 'u2'));
    run(m, hassAt('on', '2026-11-08T11:59:59Z', 'u2'));
    expect(opened).toBe(0);

    vi.spyOn(responsiveDesignService, 'getCurrentBreakpoint').mockReturnValue('mobile');
    m.fullscreen_trigger_skip_devices = ['mobile'];
    run(m, hassAt('off', '2026-11-08T11:59:59Z'));
    run(m, hassAt('on', '2026-11-08T12:00:00Z'));
    expect(opened).toBe(0);

    m.fullscreen_trigger_skip_devices = ['tablet'];
    run(m, hassAt('off', '2026-11-08T12:00:00Z'));
    run(m, hassAt('on', '2026-11-08T12:00:00Z'.replace('00Z', '01Z')));
    expect(opened).toBe(1);
    const close = mod.createFullscreenModal.mock.results[0].value;
    vi.advanceTimersByTime(5000);
    expect(close).toHaveBeenCalled();
  });

  it('opens again after the tile player is torn down, even when the clocks disagree', () => {
    // Home Assistant's clock is ten minutes behind this device, so its timestamps look stale.
    const m = { id: 'c3', type: 'camera', fullscreen_trigger_entity: 'binary_sensor.ring' };
    run(m, hassAt('off', '2026-11-08T11:40:00Z'));
    run(m, hassAt('on', '2026-11-08T11:50:00Z'));
    expect(opened).toBe(1);
    mod._runtime.delete('c3');
    run(m, hassAt('off', '2026-11-08T11:50:05Z'));
    run(m, hassAt('on', '2026-11-08T11:50:30Z'));
    expect(opened).toBe(2);
  });

  it('opens on every new event even when the event time looks old', () => {
    const m = { id: 'c4', type: 'camera', fullscreen_trigger_entity: 'event.ding' };
    const ev = (t: string) =>
      ({ states: { 'event.ding': { state: t } }, user: { id: 'u1' } }) as any;
    run(m, ev('2026-11-08T11:00:00.000+00:00'));
    expect(opened).toBe(0);
    run(m, ev('2026-11-08T11:01:00.000+00:00'));
    run(m, ev('2026-11-08T11:02:00.000+00:00'));
    expect(opened).toBe(2);
  });
});
