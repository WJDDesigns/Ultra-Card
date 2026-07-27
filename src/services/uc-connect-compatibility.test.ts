import { describe, it, expect } from 'vitest';
import {
  compareConnectVersions,
  getConnectInfo,
  getOutdatedConnectError,
  hasCapability,
  isConnectOutdated,
  MIN_CONNECT_VERSION,
  parseConnectVersion,
} from './uc-connect-compatibility';

const SENSOR = 'sensor.ultra_card_pro_cloud_authentication_status';

function hassWithSensor(attributes: Record<string, unknown>, state = 'disconnected') {
  return {
    states: {
      [SENSOR]: { state, attributes, entity_id: SENSOR },
    },
  };
}

describe('parseConnectVersion / compareConnectVersions', () => {
  it('parses dotted versions', () => {
    expect(parseConnectVersion('1.6.0')).toEqual([1, 6, 0]);
    expect(parseConnectVersion('1.6.0-beta1')).toEqual([1, 6, 0]);
    expect(parseConnectVersion('2')).toEqual([2, 0, 0]);
  });

  it('compares versions', () => {
    expect(compareConnectVersions('1.5.0', '1.6.0')).toBeLessThan(0);
    expect(compareConnectVersions('1.6.0', MIN_CONNECT_VERSION)).toBe(0);
    expect(compareConnectVersions('1.7.0', '1.6.0')).toBeGreaterThan(0);
  });
});

describe('getConnectInfo', () => {
  it('reports not installed when sensor missing', () => {
    const info = getConnectInfo({ states: {} });
    expect(info.installed).toBe(false);
    expect(info.outdated).toBe(false);
  });

  it('treats missing integration_version as outdated', () => {
    const info = getConnectInfo(hassWithSensor({ authenticated: false }));
    expect(info.installed).toBe(true);
    expect(info.outdated).toBe(true);
    expect(info.reason).toBe('missing_version');
  });

  it('treats version below minimum as outdated', () => {
    const info = getConnectInfo(
      hassWithSensor({
        integration_version: '1.5.0',
        capabilities: { smart: true },
      })
    );
    expect(info.outdated).toBe(true);
    expect(info.reason).toBe('below_minimum');
  });

  it('accepts current version with capabilities', () => {
    const info = getConnectInfo(
      hassWithSensor({
        integration_version: '1.6.0',
        capabilities: {
          favorite_colors: true,
          proxy: true,
          media_upload: true,
          smart: true,
        },
        authenticated: true,
      })
    );
    expect(info.outdated).toBe(false);
    expect(info.integrationVersion).toBe('1.6.0');
    expect(info.capabilities.smart).toBe(true);
  });
});

describe('hasCapability / isConnectOutdated / getOutdatedConnectError', () => {
  it('returns false for capabilities when outdated', () => {
    const hass = hassWithSensor({ integration_version: '1.5.0', capabilities: { smart: true } });
    expect(isConnectOutdated(hass)).toBe(true);
    expect(hasCapability(hass, 'smart')).toBe(false);
  });

  it('returns true for capability when current', () => {
    const hass = hassWithSensor({
      integration_version: '1.6.0',
      capabilities: { media_upload: true },
    });
    expect(hasCapability(hass, 'media_upload')).toBe(true);
    expect(hasCapability(hass, 'smart')).toBe(false);
  });

  it('returns error only when installed and outdated', () => {
    expect(getOutdatedConnectError({ states: {} })).toBeNull();
    expect(
      getOutdatedConnectError(
        hassWithSensor({
          integration_version: '1.6.0',
          capabilities: { smart: true },
        })
      )
    ).toBeNull();
    const msg = getOutdatedConnectError(
      hassWithSensor({ authenticated: false }),
      'Smart Cards'
    );
    expect(msg).toMatch(/Smart Cards/);
    expect(msg).toMatch(/1\.6\.0/);
  });
});
