/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';
import { renderTopologyView } from '../topology-view';
import type { UnifiDevice, UnifiPort, UnifiTopology } from '../../../services/uc-unifi-service';
import type { UnifiModule } from '../../../types';

const port = (index: number, over: Partial<UnifiPort> = {}): UnifiPort => ({
  index,
  name: `Port ${index}`,
  linkSpeedMbps: 1000,
  rx: null,
  tx: null,
  poePowerW: null,
  poeOn: null,
  enabled: null,
  up: true,
  ...over,
});

const device = (over: Partial<UnifiDevice> & Pick<UnifiDevice, 'deviceId' | 'name' | 'kind'>) =>
  ({
    mac: over.deviceId,
    model: '',
    manufacturer: 'Ubiquiti Networks',
    heightU: 1,
    cpuPct: null,
    memoryPct: null,
    temperatureC: null,
    temperatures: [],
    clients: null,
    motionOn: null,
    acPowerBudgetW: null,
    acPowerConsumptionW: null,
    ports: [],
    outlets: [],
    entityIds: [],
    ...over,
  }) as UnifiDevice;

const hass = {
  states: {
    'sensor.sw_rx': { attributes: { unit_of_measurement: 'B/s' } },
    'sensor.sw_tx': { attributes: { unit_of_measurement: 'B/s' } },
    'sensor.cam_rx': { attributes: { unit_of_measurement: 'B/s' } },
  },
} as never;

const gateway = device({ deviceId: 'gw', name: 'Dream Machine SE', kind: 'gateway', state: 'connected' });

const switchDev = device({
  deviceId: 'sw',
  name: 'Switch Pro HD 24',
  kind: 'switch',
  state: 'connected',
  uplinkDeviceId: 'gw',
  ports: [
    port(1, {
      linkSpeedMbps: 10000,
      rx: 12_500_000,
      tx: 1_250_000,
      rxEntityId: 'sensor.sw_rx',
      txEntityId: 'sensor.sw_tx',
    }),
    port(2, { name: 'Back Left RX', rx: 250_000, rxEntityId: 'sensor.cam_rx', poePowerW: 5.4 }),
  ],
});

/** Protect camera: no ports, no device_state sensor, no uplink sensor. */
const camera = device({ deviceId: 'cam', name: 'Back Left', kind: 'camera' });

const offline = device({
  deviceId: 'ap',
  name: 'Attic AP',
  kind: 'ap',
  state: 'disconnected',
});

const topology = (devices: UnifiDevice[]): UnifiTopology => ({
  devices,
  clients: [],
  wanLatency: [],
  allEntityIds: [],
  hasUnifiIntegration: true,
});

function paint(devices: UnifiDevice[], over: Partial<UnifiModule> = {}): HTMLDivElement {
  const module = {
    id: 'topo',
    type: 'unifi',
    view: 'topology',
    device_order: [],
    hidden_device_ids: [],
    topology_layout: 'tree',
    animation_intensity: 'full',
    ...over,
  } as unknown as UnifiModule;
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${renderTopologyView(module, hass, topology(devices), {})}`, host);
  return host;
}

const titles = (host: HTMLElement) => [...host.querySelectorAll('svg > path > title')].map(t => t.textContent);

describe('topology traffic flow', () => {
  it('animates inferred edges — a guessed parent is not a dead link', () => {
    const host = paint([gateway, switchDev, camera]);
    // Every device below the root gets an edge, and every edge flows.
    expect(host.querySelectorAll('svg > path:not(.uc-unifi-flow)').length).toBe(2);
    expect(host.querySelectorAll('.uc-unifi-flow').length).toBe(2);
    // The camera edge is still dashed: the parent remains a guess.
    const dashed = [...host.querySelectorAll('svg > path:not(.uc-unifi-flow)')].filter(
      p => p.getAttribute('stroke-dasharray') === '5 5'
    );
    expect(dashed.length).toBe(1);
    host.remove();
  });

  it('takes a leaf rate from the parent port named after it', () => {
    const host = paint([gateway, switchDev, camera]);
    const camTitle = titles(host).find(t => t?.startsWith('Back Left'));
    expect(camTitle).toContain('2.0 Mbps');
    expect(camTitle).toContain('via Switch Pro HD 24 · Back Left');
    expect(camTitle).toContain('inferred — no uplink sensor');
    host.remove();
  });

  it('reports an unmeasured link honestly and drifts slowly', () => {
    const bare = device({ deviceId: 'cam2', name: 'Side Yard', kind: 'camera' });
    const host = paint([gateway, switchDev, bare]);
    expect(titles(host).find(t => t?.startsWith('Side Yard'))).toContain('rate unknown');
    const slow = [...host.querySelectorAll('.uc-unifi-flow')].filter(p =>
      (p.getAttribute('style') || '').includes('--flow-speed: 3.2s')
    );
    expect(slow.length).toBe(1);
    host.remove();
  });

  it('leaves a disconnected device without flow', () => {
    const host = paint([gateway, switchDev, offline]);
    expect(host.querySelectorAll('svg > path:not(.uc-unifi-flow)').length).toBe(2);
    expect(host.querySelectorAll('.uc-unifi-flow').length).toBe(1);
    host.remove();
  });

  it('drops all flow when animation is off', () => {
    const host = paint([gateway, switchDev, camera], { animation_intensity: 'off' });
    expect(host.querySelectorAll('.uc-unifi-flow').length).toBe(0);
    host.remove();
  });

  it('colours edges by negotiated link speed', () => {
    const host = paint([gateway, switchDev, camera]);
    const strokes = [...host.querySelectorAll('svg > path:not(.uc-unifi-flow)')].map(p =>
      p.getAttribute('stroke')
    );
    // Switch uplink negotiated at 10G; the camera port reports 1G.
    expect(strokes).toContain('#00e5ff');
    expect(strokes).toContain('#69f0ae');
    host.remove();
  });
});
