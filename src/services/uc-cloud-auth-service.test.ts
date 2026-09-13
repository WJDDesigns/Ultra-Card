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

  it('sends the HA bearer token with multipart uploads to the Connect media_upload view', async () => {
    const service = ucCloudAuthService as any;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 77, url: 'https://ultracard.io/wp-content/uploads/preview.png' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    service._currentUser = {
      id: 1,
      username: 'wayne',
      email: 'wayne@example.com',
      displayName: 'Wayne',
      token: '',
      expiresAt: 0,
    };
    service._integrationHass = {
      callApi: vi.fn(),
      auth: { data: { access_token: 'ha-access-token' } },
    };

    const fd = new FormData();
    fd.append('photo', new File(['png-bytes'], 'preview.png', { type: 'image/png' }));

    const response = await ucCloudAuthService.authenticatedFetch(
      'https://ultracard.io/wp-json/ultra-card/v1/media',
      { method: 'POST', body: fd }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [path, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/api/ultra_card_pro_cloud/media_upload');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(fd);
    expect(init.headers).toEqual({ Authorization: 'Bearer ha-access-token' });
    // The multipart body went straight to the HA view, not through the JSON proxy.
    expect(service._integrationHass.callApi).not.toHaveBeenCalled();
    expect(response.ok).toBe(true);
    vi.unstubAllGlobals();
  });
});
