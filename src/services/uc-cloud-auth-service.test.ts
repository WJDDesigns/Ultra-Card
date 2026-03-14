// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ucCloudAuthService } from './uc-cloud-auth-service';

describe('uc-cloud-auth-service', () => {
  afterEach(() => {
    const service = ucCloudAuthService as any;
    service._currentUser = null;
    service._integrationHass = null;
    vi.restoreAllMocks();
  });

  it('proxies authenticated requests through Home Assistant when integration auth has no frontend token', async () => {
    const service = ucCloudAuthService as any;
    const callApi = vi.fn().mockResolvedValue({
      _status: 200,
      _body: { success: true },
    });

    service._currentUser = {
      id: 1,
      username: 'wayne',
      email: 'wayne@example.com',
      displayName: 'Wayne',
      token: '',
      expiresAt: 0,
    };
    service._integrationHass = { callApi };

    const response = await ucCloudAuthService.authenticatedFetch(
      'https://ultracard.io/wp-json/ultra-card/v1/backups',
      {
        method: 'POST',
        body: JSON.stringify({ snapshot_name: 'Test backup' }),
      }
    );

    expect(callApi).toHaveBeenCalledWith('POST', 'ultra_card_pro_cloud/proxy', {
      method: 'POST',
      url: 'https://ultracard.io/wp-json/ultra-card/v1/backups',
      body: { snapshot_name: 'Test backup' },
    });
    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toEqual({ success: true });
  });
});
