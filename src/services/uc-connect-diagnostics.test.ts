import { describe, it, expect, vi } from 'vitest';
import {
  buildClientDiagnosticsFallback,
  downloadDiagnosticsJson,
} from './uc-connect-diagnostics';
import { CONNECT_AUTH_SENSOR_ID } from './uc-connect-compatibility';

describe('buildClientDiagnosticsFallback', () => {
  it('builds a signed-in snapshot from the auth sensor', () => {
    const hass = {
      states: {
        [CONNECT_AUTH_SENSOR_ID]: {
          state: 'connected',
          attributes: {
            authenticated: true,
            username: 'wayne',
            email: 'wayne@example.com',
            subscription_tier: 'pro',
            subscription_status: 'active',
            integration_version: '1.6.0',
            capabilities: { diagnostics: true },
          },
        },
      },
    };
    const report = buildClientDiagnosticsFallback(hass);
    expect(report.source).toBe('client_fallback');
    expect(report.entries?.[0]).toMatchObject({
      coordinator: {
        authenticated: true,
        username: 'wayne',
      },
    });
    expect(String((report.entries?.[0] as any).coordinator.email_redacted)).toContain('***@');
  });

  it('marks pre-handshake installs as needing update', () => {
    const hass = {
      states: {
        [CONNECT_AUTH_SENSOR_ID]: {
          state: 'connected',
          attributes: { authenticated: true, username: 'wayne' },
        },
      },
    };
    const report = buildClientDiagnosticsFallback(hass);
    expect(report.error).toMatch(/updating/i);
  });
});

describe('downloadDiagnosticsJson', () => {
  it('creates an object URL download without throwing', () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL as typeof URL.createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL as typeof URL.revokeObjectURL;

    const click = vi.fn();
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === 'a') {
        (el as HTMLAnchorElement).click = click;
      }
      return el;
    });

    downloadDiagnosticsJson({ ultra_card_version: 'test', source: 'client_fallback' });
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});
