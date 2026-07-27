import { describe, it, expect, beforeEach } from 'vitest';
import { ucCardHealthService } from './uc-card-health-service';
import { getModuleRegistry } from '../modules/module-registry';
import type { UltraCardConfig } from '../types';

function baseConfig(overrides?: Partial<UltraCardConfig>): UltraCardConfig {
  return {
    type: 'custom:ultra-card',
    layout: {
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'col-1',
              modules: [{ id: 'text-1', type: 'text', text: 'Hello' } as any],
            },
          ],
        },
      ],
    },
    ...overrides,
  } as UltraCardConfig;
}

describe('ucCardHealthService', () => {
  beforeEach(() => {
    const r = getModuleRegistry() as unknown as { loadErrors: Map<string, Error> };
    r.loadErrors.delete('__health_fake__');
  });

  it('reports healthy empty-ish config with known modules', async () => {
    const report = await ucCardHealthService.analyze(baseConfig(), {
      states: {},
    } as any);
    expect(report.errorCount).toBe(0);
  });

  it('flags unknown module types', async () => {
    const config = baseConfig({
      layout: {
        rows: [
          {
            id: 'r',
            columns: [
              {
                id: 'c',
                modules: [{ id: 'x', type: 'totally_fake_module_xyz' } as any],
              },
            ],
          },
        ],
      },
    });
    const report = await ucCardHealthService.analyze(config, { states: {} } as any);
    expect(report.issues.some(i => i.category === 'module' && i.message.includes('totally_fake'))).toBe(
      true
    );
    expect(report.errorCount).toBeGreaterThan(0);
  });

  it('flags missing entities', async () => {
    const config = baseConfig({
      layout: {
        rows: [
          {
            id: 'r',
            columns: [
              {
                id: 'c',
                modules: [
                  {
                    id: 'icon-1',
                    type: 'icon',
                    icons: [{ entity: 'sensor.missing_thing' }],
                  } as any,
                ],
              },
            ],
          },
        ],
      },
    });
    const report = await ucCardHealthService.analyze(config, { states: {} } as any);
    expect(report.issues.some(i => i.category === 'entity' && i.message.includes('sensor.missing_thing'))).toBe(
      true
    );
  });

  it('flags unavailable entities as warnings', async () => {
    const config = baseConfig({
      layout: {
        rows: [
          {
            id: 'r',
            columns: [
              {
                id: 'c',
                modules: [
                  {
                    id: 'icon-1',
                    type: 'icon',
                    icons: [{ entity: 'sensor.down' }],
                  } as any,
                ],
              },
            ],
          },
        ],
      },
    });
    const report = await ucCardHealthService.analyze(config, {
      states: { 'sensor.down': { state: 'unavailable', entity_id: 'sensor.down' } },
    } as any);
    const issue = report.issues.find(i => i.id === 'unavailable-entity-sensor.down');
    expect(issue?.severity).toBe('warning');
  });

  it('includes module load errors', async () => {
    const registry = getModuleRegistry() as unknown as { loadErrors: Map<string, Error> };
    registry.loadErrors.set('text', new Error('chunk failed'));
    const report = await ucCardHealthService.analyze(baseConfig(), { states: {} } as any);
    registry.loadErrors.delete('text');
    expect(report.issues.some(i => i.category === 'load' && i.message.includes('chunk failed'))).toBe(
      true
    );
  });

  it('reports Connect not installed as info', async () => {
    const report = await ucCardHealthService.analyze(baseConfig(), { states: {} } as any);
    const issue = report.issues.find(i => i.id === 'connect-not-installed');
    expect(issue?.severity).toBe('info');
    expect(issue?.category).toBe('connect');
    expect(issue?.fixAction).toBe('open_connect');
  });

  it('reports Connect installed but unsigned as warning', async () => {
    const report = await ucCardHealthService.analyze(baseConfig(), {
      states: {
        'sensor.ultra_card_pro_cloud_authentication_status': {
          state: 'disconnected',
          attributes: {
            authenticated: false,
            integration_version: '1.6.0',
            capabilities: { smart: true, proxy: true, media_upload: true, favorite_colors: true },
          },
        },
      },
    } as any);
    const issue = report.issues.find(i => i.id === 'connect-not-authenticated');
    expect(issue?.severity).toBe('warning');
    expect(issue?.category).toBe('connect');
    expect(report.issues.some(i => i.id === 'connect-needs-update')).toBe(false);
  });

  it('reports Connect needs update when handshake attrs missing', async () => {
    const report = await ucCardHealthService.analyze(baseConfig(), {
      states: {
        'sensor.ultra_card_pro_cloud_authentication_status': {
          state: 'connected',
          attributes: {
            authenticated: true,
            user_id: '1',
            username: 'demo',
            subscription_tier: 'pro',
            subscription_status: 'active',
          },
        },
      },
    } as any);
    const issue = report.issues.find(i => i.id === 'connect-needs-update');
    expect(issue?.severity).toBe('warning');
    expect(issue?.fixAction).toBe('open_connect');
    expect(issue?.message).toMatch(/1\.6\.0/);
  });

  it('does not flag Connect when authenticated on current version', async () => {
    const report = await ucCardHealthService.analyze(baseConfig(), {
      states: {
        'sensor.ultra_card_pro_cloud_authentication_status': {
          state: 'connected',
          attributes: {
            authenticated: true,
            user_id: '1',
            username: 'demo',
            subscription_tier: 'pro',
            subscription_status: 'active',
            integration_version: '1.6.0',
            capabilities: {
              favorite_colors: true,
              proxy: true,
              media_upload: true,
              smart: true,
            },
          },
        },
      },
    } as any);
    expect(report.issues.some(i => i.category === 'connect')).toBe(false);
  });
});
