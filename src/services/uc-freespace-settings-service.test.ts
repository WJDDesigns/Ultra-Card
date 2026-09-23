import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ucFreeSpaceSettingsService } from './uc-freespace-settings-service';
import { CONNECT_AUTH_SENSOR_ID } from './uc-connect-compatibility';

describe('ucFreeSpaceSettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
    ucFreeSpaceSettingsService.setEnabled(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to disabled', () => {
    expect(ucFreeSpaceSettingsService.isEnabled()).toBe(false);
    expect(ucFreeSpaceSettingsService.get()).toEqual({ enabled: false });
  });

  it('persists enabled and notifies subscribers', () => {
    let ticks = 0;
    const unsub = ucFreeSpaceSettingsService.subscribe(() => {
      ticks += 1;
    });
    ucFreeSpaceSettingsService.setEnabled(true);
    expect(ucFreeSpaceSettingsService.isEnabled()).toBe(true);
    expect(JSON.parse(localStorage.getItem('ultra-card-freespace') || '{}')).toEqual({
      enabled: true,
    });
    expect(ticks).toBeGreaterThanOrEqual(1);
    ucFreeSpaceSettingsService.setEnabled(false);
    expect(localStorage.getItem('ultra-card-freespace')).toBeNull();
    unsub();
  });

  it('isDiscoverable requires both toggle and Connect sensor', () => {
    ucFreeSpaceSettingsService.setEnabled(true);
    expect(ucFreeSpaceSettingsService.isDiscoverable({})).toBe(false);
    expect(ucFreeSpaceSettingsService.isDiscoverable({ states: {} })).toBe(false);
    expect(
      ucFreeSpaceSettingsService.isDiscoverable({
        states: { [CONNECT_AUTH_SENSOR_ID]: { state: 'connected', attributes: {} } },
      })
    ).toBe(true);
    ucFreeSpaceSettingsService.setEnabled(false);
    expect(
      ucFreeSpaceSettingsService.isDiscoverable({
        states: { [CONNECT_AUTH_SENSOR_ID]: { state: 'connected', attributes: {} } },
      })
    ).toBe(false);
  });
});
