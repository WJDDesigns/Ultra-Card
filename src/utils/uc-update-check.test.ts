import { describe, it, expect } from 'vitest';
import { compareVersions, staleBuildVersion } from './uc-update-check';

const hassWith = (installed: string) =>
  ({
    states: {
      'update.ultra_card_update': {
        entity_id: 'update.ultra_card_update',
        state: 'off',
        attributes: {
          installed_version: installed,
          release_url: 'https://github.com/WJDDesigns/Ultra-Card/releases/v' + installed,
        },
      },
    },
  }) as any;

describe('update check', () => {
  it('compares versions including pre-releases', () => {
    expect(compareVersions('v3.13.4', '3.13.3')).toBeGreaterThan(0);
    expect(compareVersions('3.13.3', '3.13.3')).toBe(0);
    expect(compareVersions('3.13.4', '3.13.4-beta2')).toBeGreaterThan(0);
    expect(compareVersions('3.13.4-beta3', '3.13.4-beta10')).toBeLessThan(0);
    expect(compareVersions('garbage', '3.13.3')).toBe(0);
  });

  it('reports a newer installed version only', () => {
    expect(staleBuildVersion(hassWith('v3.14.0'), '3.13.3')).toBe('3.14.0');
    expect(staleBuildVersion(hassWith('v3.13.0'), '3.13.3')).toBeNull();
    expect(staleBuildVersion({ states: {} } as any, '3.13.3')).toBeNull();
  });
});
