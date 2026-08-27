import { describe, expect, it } from 'vitest';
import {
  CLOUD_UNAVAILABLE_MESSAGE,
  isInternalCloudError,
  redactCloudErrorTree,
  userFacingCloudError,
} from './uc-user-facing-cloud-error';

describe('userFacingCloudError', () => {
  it('keeps ordinary credential errors', () => {
    expect(userFacingCloudError('Invalid ultracard.io username or password.')).toBe(
      'Invalid ultracard.io username or password.'
    );
  });

  it('replaces host-remediation copy from Connect 1.7.1', () => {
    const leaked =
      'ultracard.io is serving a bot-protection challenge (SiteGround Anti-Bot AI) ' +
      'instead of the REST API. Ask SiteGround support to disable Anti-Bot AI for ' +
      'ultracard.io, or to exempt /wp-json/ from it.';
    expect(isInternalCloudError(leaked)).toBe(true);
    expect(userFacingCloudError(leaked)).toBe(CLOUD_UNAVAILABLE_MESSAGE);
  });

  it('replaces Hub diagnostics bot-protection labels', () => {
    expect(userFacingCloudError('Blocked by bot protection')).toBe(CLOUD_UNAVAILABLE_MESSAGE);
  });

  it('redacts nested diagnostics payloads before display or download', () => {
    const report = redactCloudErrorTree({
      entries: [
        {
          coordinator: {
            last_error:
              'ultracard.io is serving a bot-protection challenge (SiteGround Anti-Bot AI)',
          },
          connectivity: {
            errors: ['Ask SiteGround support to exempt /wp-json/ from it.'],
            bot_challenge: true,
          },
        },
      ],
    });
    expect(JSON.stringify(report).toLowerCase()).not.toContain('siteground');
    expect(JSON.stringify(report).toLowerCase()).not.toContain('wp-json');
    expect(report.entries[0].coordinator.last_error).toBe(CLOUD_UNAVAILABLE_MESSAGE);
  });
});
