/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { html, render } from 'lit';

vi.mock('../../../utils/uc-pro-access', async () => {
  const actual = await vi.importActual<typeof import('../../../utils/uc-pro-access')>(
    '../../../utils/uc-pro-access'
  );
  return { ...actual, hasProAccess: () => true };
});

import { renderSetupWizard } from '../wizard';
import { UltraUnifiModule } from '../../unifi-module';
import type { UnifiModule } from '../../../types';
import type { UnifiCapabilityReport } from '../../../services/uc-unifi-service';

const hass = {
  locale: { language: 'en' },
  user: { is_admin: true },
  states: {},
  devices: {},
  entities: {},
} as never;

const module = {
  id: 'unifi_test',
  type: 'unifi',
  view: 'rack',
  setup_dismissed: false,
} as UnifiModule;

const report = {
  hasDevices: true,
  disabledEntityIds: ['sensor.sw_rx'],
  bandwidthOptionMissing: false,
  portBandwidth: 'disabled',
  portLinkSpeed: 'enabled',
  portPoe: 'enabled',
  deviceTemperature: 'enabled',
  wanLatency: 'enabled',
  tipsByView: {},
} as UnifiCapabilityReport;

function paintPreview(context?: 'live' | 'ha-preview' | 'dashboard'): HTMLDivElement {
  const handler = new UltraUnifiModule();
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(
    html`${handler.renderPreview(handler.createDefault('unifi_test'), hass, undefined, context)}`,
    host
  );
  return host;
}

describe('UniFi setup wizard', () => {
  it('fires dismiss and does not let the click bubble', () => {
    const onDismiss = vi.fn();
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(
      html`${renderSetupWizard(module, hass, report, {
        onDismiss,
        onEnabled: () => undefined,
        triggerPreviewUpdate: () => undefined,
      })}`,
      host
    );

    const button = [...host.querySelectorAll('button')].find(b => b.textContent?.includes('Dismiss'));
    expect(button).toBeTruthy();

    const bubble = vi.fn();
    host.addEventListener('click', bubble);
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(bubble).not.toHaveBeenCalled();
    host.remove();
  });

  it('stays in the editor preview and never paints on the live dashboard', () => {
    const live = paintPreview('live');
    const haPreview = paintPreview('ha-preview');
    const dashboard = paintPreview('dashboard');
    const liveDashboard = paintPreview(undefined);

    expect(live.querySelector('.uc-unifi-wizard')).toBeTruthy();
    expect(haPreview.querySelector('.uc-unifi-wizard')).toBeTruthy();
    expect(dashboard.querySelector('.uc-unifi-wizard')).toBeNull();
    expect(liveDashboard.querySelector('.uc-unifi-wizard')).toBeNull();

    live.remove();
    haPreview.remove();
    dashboard.remove();
    liveDashboard.remove();
  });
});
