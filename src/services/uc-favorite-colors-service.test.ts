import { describe, it, expect, vi, beforeEach } from 'vitest';

// The service is a module-level singleton with latched state; reset modules so
// each test gets a fresh instance.
async function freshService() {
  vi.resetModules();
  const mod = await import('./uc-favorite-colors-service');
  return mod.ucFavoriteColorsService;
}

function makeHass(options: { components?: string[]; callApi?: any } = {}) {
  return {
    callApi: options.callApi ?? vi.fn().mockResolvedValue({ colors: [] }),
    config: options.components ? { components: options.components } : undefined,
    states: {},
  } as any;
}

describe('ucFavoriteColorsService integration gating (issue #96)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('skips all API calls when the integration is not in hass.config.components', async () => {
    const service = await freshService();
    const hass = makeHass({ components: ['light', 'sensor'] });

    service.setHass(hass);
    await Promise.resolve();
    expect(hass.callApi).not.toHaveBeenCalled();

    // Mutations must not POST either
    service.addFavorite('Test', '#ff0000');
    await Promise.resolve();
    expect(hass.callApi).not.toHaveBeenCalled();
  });

  it('loads from HA when the integration is installed', async () => {
    const service = await freshService();
    const hass = makeHass({ components: ['ultra_card_pro_cloud'] });

    service.setHass(hass);
    await Promise.resolve();
    expect(hass.callApi).toHaveBeenCalledWith('GET', 'ultra_card_pro_cloud/favorite_colors');
  });

  it('fires only one GET when setHass is called concurrently (in-flight guard)', async () => {
    const service = await freshService();
    let resolveGet: (v: any) => void = () => {};
    const callApi = vi.fn().mockImplementation(
      () => new Promise(resolve => (resolveGet = resolve))
    );
    const hass = makeHass({ components: ['ultra_card_pro_cloud'], callApi });

    service.setHass(hass);
    service.setHass(hass);
    service.setHass(hass);
    expect(callApi).toHaveBeenCalledTimes(1);

    resolveGet({ colors: [] });
    await Promise.resolve();
  });

  it('latches on 404 and stops mutation POSTs', async () => {
    const service = await freshService();
    const callApi = vi.fn().mockRejectedValue({ status_code: 404 });
    // No components list -> falls back to probing the API (legacy behavior)
    const hass = makeHass({ callApi });

    service.setHass(hass);
    // Let the GET rejection propagate through the async chain
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(callApi).toHaveBeenCalledTimes(1);

    // After the 404 latch, mutations must not POST
    service.addFavorite('Test', '#00ff00');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(callApi).toHaveBeenCalledTimes(1);

    // And further setHass calls must not re-probe
    service.setHass(hass);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(callApi).toHaveBeenCalledTimes(1);
  });
});
