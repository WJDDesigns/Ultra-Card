import { describe, it, expect } from 'vitest';
import { ucFreeSpaceSettingsService } from './uc-freespace-settings-service';
import { CONNECT_AUTH_SENSOR_ID } from './uc-connect-compatibility';

describe('ucFreeSpaceSettingsService', () => {
  it('is available whenever Ultra Card Connect is installed', () => {
    expect(ucFreeSpaceSettingsService.isDiscoverable({})).toBe(false);
    expect(ucFreeSpaceSettingsService.isDiscoverable({ states: {} })).toBe(false);
    expect(
      ucFreeSpaceSettingsService.isDiscoverable({
        states: { [CONNECT_AUTH_SENSOR_ID]: { state: 'connected', attributes: {} } },
      })
    ).toBe(true);
  });
});
