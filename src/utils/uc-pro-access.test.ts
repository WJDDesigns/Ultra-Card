/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { connectStatusNote } from './uc-pro-access';

const S = 'sensor.ultra_card_pro_cloud_authentication_status';
const hass = (sensor?: { state: string; attributes?: Record<string, unknown> }) =>
  ({ states: sensor ? { [S]: { entity_id: S, ...sensor } } : {} }) as any;

describe('connectStatusNote', () => {
  it('explains each reason Pro is not active', () => {
    expect(connectStatusNote(hass(), 'en')).toMatch(/Install Ultra Card Connect/);
    expect(connectStatusNote(hass({ state: 'unavailable' }), 'en')).toMatch(/can't reach/);
    expect(
      connectStatusNote(hass({ state: 'disconnected', attributes: { needs_reauth: true } }), 'en')
    ).toMatch(/sign in again/);
    expect(connectStatusNote(hass({ state: 'disconnected', attributes: {} }), 'en')).toMatch(
      /Sign in to Ultra Card Connect/
    );
    expect(
      connectStatusNote(
        hass({
          state: 'connected',
          attributes: { authenticated: true, subscription_tier: 'pro', subscription_status: 'expired' },
        }),
        'en'
      )
    ).toMatch(/expired/);
  });

  it('says nothing for a connected free user', () => {
    expect(
      connectStatusNote(
        hass({ state: 'connected', attributes: { authenticated: true, subscription_tier: 'free' } }),
        'en'
      )
    ).toBeNull();
  });
});
