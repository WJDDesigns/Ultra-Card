import { describe, it, expect } from 'vitest';
import {
  parsePortUniqueId,
  classifyDevice,
  kindFromDbType,
  normalizeMac,
  formatMac,
  toMbps,
  linkSpeedColor,
  estimateHeightU,
  PORT_UID_PREFIXES,
  discoverUnifiTopology,
  orderDevices,
  isUbiquitiManufacturer,
  isUnifiInfrastructureDevice,
  suggestVisibleDeviceIds,
  seedCuration,
  type UnifiDevice,
} from './uc-unifi-service';

describe('parsePortUniqueId', () => {
  it('parses port_rx unique ids', () => {
    const r = parsePortUniqueId('port_rx-aa:bb:cc:dd:ee:ff_4');
    expect(r).toEqual({ role: 'rx', mac: 'aabbccddeeff', index: 4 });
  });

  it('parses compact mac without colons', () => {
    const r = parsePortUniqueId('port_tx-aabbccddeeff_12');
    expect(r).toEqual({ role: 'tx', mac: 'aabbccddeeff', index: 12 });
  });

  it('parses all known prefixes', () => {
    for (const [prefix, role] of Object.entries(PORT_UID_PREFIXES)) {
      const r = parsePortUniqueId(`${prefix}11:22:33:44:55:66_1`);
      expect(r?.role).toBe(role);
      expect(r?.index).toBe(1);
      expect(r?.mac).toBe('112233445566');
    }
  });

  it('returns null for unrelated unique ids', () => {
    expect(parsePortUniqueId('device_state-aa:bb:cc:dd:ee:ff')).toBeNull();
    expect(parsePortUniqueId('rx-aa:bb:cc:dd:ee:ff')).toBeNull();
    expect(parsePortUniqueId('')).toBeNull();
    expect(parsePortUniqueId(null)).toBeNull();
  });
});

describe('isUbiquitiManufacturer', () => {
  it('matches exact Ubiquiti names', () => {
    expect(isUbiquitiManufacturer('Ubiquiti Networks')).toBe(true);
    expect(isUbiquitiManufacturer('ubiquiti')).toBe(true);
    expect(isUbiquitiManufacturer('UBNT')).toBe(true);
    expect(isUbiquitiManufacturer('UI')).toBe(true);
  });

  it('does not match substrings like Audio / Build that contain "ui"', () => {
    expect(isUbiquitiManufacturer('Audio-Technica')).toBe(false);
    expect(isUbiquitiManufacturer('Build.com')).toBe(false);
    expect(isUbiquitiManufacturer('Samsung')).toBe(false);
    expect(isUbiquitiManufacturer('Apple')).toBe(false);
    expect(isUbiquitiManufacturer('')).toBe(false);
  });
});

describe('isUnifiInfrastructureDevice', () => {
  it('accepts Ubiquiti manufacturer devices', () => {
    expect(
      isUnifiInfrastructureDevice({
        manufacturer: 'Ubiquiti Networks',
        model: 'UDM-SE',
      })
    ).toBe(true);
  });

  it('rejects service entries and WLAN shells', () => {
    expect(
      isUnifiInfrastructureDevice({
        manufacturer: 'Ubiquiti Networks',
        model: 'UniFi WLAN',
        entry_type: 'service',
      })
    ).toBe(false);
    expect(
      isUnifiInfrastructureDevice({
        manufacturer: 'Ubiquiti Networks',
        model: 'UniFi Network',
        entry_type: 'service',
      })
    ).toBe(false);
  });

  it('rejects client devices with random OUIs', () => {
    expect(
      isUnifiInfrastructureDevice({
        manufacturer: 'Apple',
        model: undefined,
        connections: [['mac', 'aa:bb:cc:dd:ee:ff']],
      })
    ).toBe(false);
  });

  it('rejects Ubiquiti-OUI clients that have no model (tracked plugs, cameras)', () => {
    expect(
      isUnifiInfrastructureDevice({
        manufacturer: 'Ubiquiti Networks Inc.',
        model: undefined,
        connections: [['mac', 'aa:bb:cc:dd:ee:ff']],
      })
    ).toBe(false);
  });
});

describe('classifyDevice', () => {
  it('classifies gateways by model', () => {
    expect(classifyDevice('UDM-Pro')).toBe('gateway');
    expect(classifyDevice('UXG-Lite')).toBe('gateway');
    expect(classifyDevice('UCG-Ultra')).toBe('gateway');
  });

  it('classifies switches by model and ports', () => {
    expect(classifyDevice('USW-24-PoE')).toBe('switch');
    expect(classifyDevice('Mystery Box', { hasPorts: true })).toBe('switch');
  });

  it('classifies APs', () => {
    expect(classifyDevice('U6-LR')).toBe('ap');
    expect(classifyDevice('U7-Pro')).toBe('ap');
  });

  it('classifies raw AP model codes without separators (registry style)', () => {
    // The HA registry reports raw codes like U7PIW / U7PROMAX
    expect(classifyDevice('U7PIW')).toBe('ap');
    expect(classifyDevice('U7PROMAX')).toBe('ap');
    expect(classifyDevice('U6M')).toBe('ap');
    expect(classifyDevice('UALR6')).toBe('ap');
  });

  it('classifies raw switch / gateway codes', () => {
    expect(classifyDevice('US68P')).toBe('switch');
    expect(classifyDevice('USWED72')).toBe('switch');
    expect(classifyDevice('UDMPROSE')).toBe('gateway');
  });

  it('classifies PDUs via outlets fingerprint', () => {
    expect(classifyDevice('USP-PDU-Pro', { hasOutlets: true })).toBe('pdu');
    expect(classifyDevice('Something', { hasAcPower: true })).toBe('pdu');
  });

  it('classifies smart plugs and power strips as plug, never rack gear', () => {
    expect(classifyDevice('UP1')).toBe('plug');
    expect(classifyDevice('USP-Plug')).toBe('plug');
    expect(classifyDevice('USP Plug HD')).toBe('plug');
    expect(classifyDevice('UP6')).toBe('plug');
    expect(classifyDevice('USP-Strip')).toBe('plug');
    // Unknown model with a single outlet entity → plug, many outlets → pdu
    expect(classifyDevice('', { hasOutlets: true, outletCount: 1 })).toBe('plug');
    expect(classifyDevice('', { hasOutlets: true, outletCount: 8 })).toBe('pdu');
  });

  it('never classifies third-party wifi plugs/outlets as APs', () => {
    expect(classifyDevice('Wifi Smart Plug')).toBe('plug');
    expect(classifyDevice('Smart Outlet V2')).toBe('plug');
    expect(classifyDevice('WiFi Range Extender')).not.toBe('ap');
  });

  it('prefers gateway when WAN latency present', () => {
    expect(classifyDevice('Custom GW', { hasWanLatency: true })).toBe('gateway');
  });
});

describe('kindFromDbType', () => {
  it('maps Ubiquiti catalog device types to card kinds', () => {
    expect(kindFromDbType('access-point')).toBe('ap');
    expect(kindFromDbType('mesh-point')).toBe('ap');
    expect(kindFromDbType('switch')).toBe('switch');
    expect(kindFromDbType('console')).toBe('gateway');
    expect(kindFromDbType('gateway')).toBe('gateway');
    expect(kindFromDbType('router')).toBe('gateway');
    expect(kindFromDbType('power-supply', 'USP-Plug')).toBe('plug');
    expect(kindFromDbType('power-supply', 'USP-PDU-Pro')).toBe('pdu');
    expect(kindFromDbType('power-supply', 'USP-RPS')).toBe('pdu');
    expect(kindFromDbType('camera')).toBeNull();
    expect(kindFromDbType(undefined)).toBeNull();
  });
});

describe('mac helpers', () => {
  it('normalizes and formats macs', () => {
    expect(normalizeMac('AA:BB:CC:DD:EE:FF')).toBe('aabbccddeeff');
    expect(formatMac('aabbccddeeff')).toBe('aa:bb:cc:dd:ee:ff');
  });
});

describe('toMbps / linkSpeedColor', () => {
  it('converts byte rates', () => {
    expect(toMbps(125_000, 'B/s')).toBeCloseTo(1, 5);
  });

  it('passes through mbit values', () => {
    expect(toMbps(100, 'Mbit/s')).toBe(100);
  });

  it('colors by link speed tiers (UniFi Etherlighting scheme)', () => {
    expect(linkSpeedColor(10000)).toBe('#00e5ff');
    expect(linkSpeedColor(2500)).toBe('#4a9eff');
    expect(linkSpeedColor(1000)).toBe('#69f0ae');
    expect(linkSpeedColor(100)).toBe('#ffd740');
    expect(linkSpeedColor(0)).toContain('rgba');
  });
});

describe('estimateHeightU', () => {
  it('returns at least 1U', () => {
    expect(estimateHeightU('switch', 48, 'USW-Pro-48')).toBeGreaterThanOrEqual(1);
    expect(estimateHeightU('ap', 0, 'U6+')).toBe(1);
  });
});

describe('orderDevices', () => {
  const mk = (id: string, name: string): UnifiDevice =>
    ({
      deviceId: id,
      mac: id,
      name,
      model: 'USW-8',
      manufacturer: 'Ubiquiti Networks',
      kind: 'switch',
      heightU: 1,
      cpuPct: null,
      memoryPct: null,
      temperatureC: null,
      clients: null,
      acPowerBudgetW: null,
      acPowerConsumptionW: null,
      ports: [],
      outlets: [],
      entityIds: [],
    }) as UnifiDevice;

  it('applies order and hidden filters', () => {
    const devices = [mk('a', 'A'), mk('b', 'B'), mk('c', 'C')];
    const ordered = orderDevices(devices, ['c', 'a'], ['b']);
    expect(ordered.map(d => d.deviceId)).toEqual(['c', 'a']);
  });

  it('appends unordered devices', () => {
    const devices = [mk('a', 'A'), mk('b', 'B'), mk('c', 'C')];
    const ordered = orderDevices(devices, ['b']);
    expect(ordered.map(d => d.deviceId)).toEqual(['b', 'a', 'c']);
  });
});

describe('suggestVisibleDeviceIds / seedCuration', () => {
  const mk = (id: string, kind: UnifiDevice['kind'], ports = 0): UnifiDevice =>
    ({
      deviceId: id,
      mac: id,
      name: id,
      model: kind,
      manufacturer: 'Ubiquiti Networks',
      kind,
      heightU: 1,
      cpuPct: null,
      memoryPct: null,
      temperatureC: null,
      clients: null,
      acPowerBudgetW: null,
      acPowerConsumptionW: null,
      ports: Array.from({ length: ports }, (_, i) => ({
        index: i + 1,
        name: `P${i + 1}`,
        linkSpeedMbps: null,
        rx: null,
        tx: null,
        poePowerW: null,
        poeOn: null,
        enabled: null,
        up: false,
      })),
      outlets: [],
      entityIds: [],
    }) as UnifiDevice;

  it('prioritizes gateways and switches over a sea of APs', () => {
    const devices = [
      mk('ap1', 'ap'),
      mk('ap2', 'ap'),
      mk('ap3', 'ap'),
      mk('ap4', 'ap'),
      mk('ap5', 'ap'),
      mk('ap6', 'ap'),
      mk('ap7', 'ap'),
      mk('ap8', 'ap'),
      mk('ap9', 'ap'),
      mk('gw', 'gateway'),
      mk('sw', 'switch', 24),
    ];
    const ids = suggestVisibleDeviceIds(devices, { max: 4, includeAps: false });
    expect(ids[0]).toBe('gw');
    expect(ids).toContain('sw');
    expect(ids.every(id => !id.startsWith('ap'))).toBe(true);
  });

  it('never auto-shows smart plugs', () => {
    const devices = [
      mk('gw', 'gateway'),
      mk('plug1', 'plug'),
      mk('plug2', 'plug'),
      mk('sw', 'switch', 8),
    ];
    const ids = suggestVisibleDeviceIds(devices, { max: 10 });
    expect(ids).toContain('gw');
    expect(ids).toContain('sw');
    expect(ids).not.toContain('plug1');
    expect(ids).not.toContain('plug2');
  });

  it('seeds hidden list on first run', () => {
    const devices = [
      mk('gw', 'gateway'),
      mk('sw', 'switch', 8),
      ...Array.from({ length: 20 }, (_, i) => mk(`ap${i}`, 'ap')),
    ];
    const seeded = seedCuration(devices, { curation_seeded: false, rack_max_devices: 4 });
    expect(seeded).not.toBeNull();
    expect(seeded!.curation_seeded).toBe(true);
    expect(seeded!.device_order.length).toBeLessThanOrEqual(4);
    expect(seeded!.hidden_device_ids.length).toBeGreaterThan(10);
  });

  it('does not re-seed after curation_seeded', () => {
    const devices = [mk('gw', 'gateway')];
    expect(seedCuration(devices, { curation_seeded: true, hidden_device_ids: [] })).toBeNull();
  });
});

describe('discoverUnifiTopology', () => {
  it('returns empty topology without hass', () => {
    const topo = discoverUnifiTopology(null, 'test');
    expect(topo.devices).toEqual([]);
    expect(topo.hasUnifiIntegration).toBe(false);
  });

  it('discovers Ubiquiti devices from registries + states', () => {
    const hass = {
      states: {
        'sensor.udm_state': {
          state: 'connected',
          attributes: { friendly_name: 'UDM State' },
        },
        'sensor.udm_cpu': {
          state: '12',
          attributes: { friendly_name: 'UDM CPU', unit_of_measurement: '%' },
        },
        'sensor.port_1_rx': {
          state: '1000000',
          attributes: { unit_of_measurement: 'B/s' },
        },
        'sensor.port_1_tx': {
          state: '500000',
          attributes: { unit_of_measurement: 'B/s' },
        },
        'sensor.port_1_link': {
          state: '1000',
          attributes: { unit_of_measurement: 'Mbit/s' },
        },
      },
      entities: {
        'sensor.udm_state': {
          entity_id: 'sensor.udm_state',
          device_id: 'dev1',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:ff',
          translation_key: 'device_state',
        },
        'sensor.udm_cpu': {
          entity_id: 'sensor.udm_cpu',
          device_id: 'dev1',
          platform: 'unifi',
          unique_id: 'cpu-aa:bb:cc:dd:ee:ff',
          translation_key: 'device_cpu_utilization',
        },
        'sensor.port_1_rx': {
          entity_id: 'sensor.port_1_rx',
          device_id: 'dev1',
          platform: 'unifi',
          unique_id: 'port_rx-aa:bb:cc:dd:ee:ff_1',
          translation_key: 'port_bandwidth_rx',
          original_name: 'Port 1 RX',
        },
        'sensor.port_1_tx': {
          entity_id: 'sensor.port_1_tx',
          device_id: 'dev1',
          platform: 'unifi',
          unique_id: 'port_tx-aa:bb:cc:dd:ee:ff_1',
          translation_key: 'port_bandwidth_tx',
          original_name: 'Port 1 TX',
        },
        'sensor.port_1_link': {
          entity_id: 'sensor.port_1_link',
          device_id: 'dev1',
          platform: 'unifi',
          unique_id: 'port_link_speed-aa:bb:cc:dd:ee:ff_1',
          translation_key: 'port_link_speed',
          original_name: 'Port 1',
        },
      },
      devices: {
        dev1: {
          id: 'dev1',
          name: 'Dream Machine Pro',
          manufacturer: 'Ubiquiti Networks',
          model: 'UDM-Pro',
          connections: [['mac', 'aa:bb:cc:dd:ee:ff']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-1', {});
    expect(topo.hasUnifiIntegration).toBe(true);
    expect(topo.devices.length).toBe(1);
    expect(topo.devices[0].kind).toBe('gateway');
    expect(topo.devices[0].name).toBe('Dream Machine Pro');
    expect(topo.devices[0].cpuPct).toBe(12);
    expect(topo.devices[0].state).toBe('connected');
    expect(topo.devices[0].ports.length).toBe(1);
    expect(topo.devices[0].ports[0].index).toBe(1);
    expect(topo.devices[0].ports[0].linkSpeedMbps).toBe(1000);
    expect(topo.devices[0].ports[0].up).toBe(true);
    expect(topo.allEntityIds.length).toBeGreaterThanOrEqual(5);
  });

  it('does not promote UniFi clients into the device rack list', () => {
    const hass = {
      states: {
        'sensor.gw_state': { state: 'connected', attributes: {} },
        'device_tracker.iphone': { state: 'home', attributes: {} },
        'sensor.iphone_rx': { state: '1.2', attributes: { unit_of_measurement: 'MB/s' } },
        'sensor.iphone_tx': { state: '0.4', attributes: { unit_of_measurement: 'MB/s' } },
        'switch.iphone_block': { state: 'on', attributes: {} },
      },
      entities: {
        'sensor.gw_state': {
          entity_id: 'sensor.gw_state',
          device_id: 'gw',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:01',
          translation_key: 'device_state',
        },
        'device_tracker.iphone': {
          entity_id: 'device_tracker.iphone',
          device_id: 'client1',
          platform: 'unifi',
          unique_id: 'aa:bb:cc:dd:ee:99',
        },
        'sensor.iphone_rx': {
          entity_id: 'sensor.iphone_rx',
          device_id: 'client1',
          platform: 'unifi',
          unique_id: 'rx-aa:bb:cc:dd:ee:99',
          translation_key: 'client_bandwidth_rx',
        },
        'sensor.iphone_tx': {
          entity_id: 'sensor.iphone_tx',
          device_id: 'client1',
          platform: 'unifi',
          unique_id: 'tx-aa:bb:cc:dd:ee:99',
          translation_key: 'client_bandwidth_tx',
        },
        'switch.iphone_block': {
          entity_id: 'switch.iphone_block',
          device_id: 'client1',
          platform: 'unifi',
          unique_id: 'block-aa:bb:cc:dd:ee:99',
          translation_key: 'block_client',
        },
      },
      devices: {
        gw: {
          id: 'gw',
          name: 'Gateway',
          manufacturer: 'Ubiquiti Networks',
          model: 'UDM-SE',
          connections: [['mac', 'aa:bb:cc:dd:ee:01']],
        },
        client1: {
          id: 'client1',
          name: 'iPhone',
          manufacturer: 'Apple',
          connections: [['mac', 'aa:bb:cc:dd:ee:99']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-clients', {});
    expect(topo.devices.map(d => d.deviceId)).toEqual(['gw']);
    expect(topo.clients.length).toBe(1);
    expect(topo.clients[0].name).toBe('iPhone');
    expect(topo.clients[0].rxEntityId).toBe('sensor.iphone_rx');
  });

  it('drops device shells owned by other integrations (no duplicate UDM from Protect)', () => {
    const hass = {
      states: {
        'sensor.gw_state': { state: 'connected', attributes: {} },
        'sensor.nvr_uptime': { state: '2026-01-01T00:00:00Z', attributes: {} },
      },
      entities: {
        'sensor.gw_state': {
          entity_id: 'sensor.gw_state',
          device_id: 'gw',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:01',
          translation_key: 'device_state',
        },
        // Same physical UDM registered again by UniFi Protect
        'sensor.nvr_uptime': {
          entity_id: 'sensor.nvr_uptime',
          device_id: 'nvr',
          platform: 'unifiprotect',
          unique_id: 'nvr_uptime',
        },
      },
      devices: {
        gw: {
          id: 'gw',
          name: 'Dream Machine Special Edition',
          manufacturer: 'Ubiquiti Networks',
          model: 'UDMPROSE',
          connections: [['mac', 'aa:bb:cc:dd:ee:01']],
        },
        nvr: {
          id: 'nvr',
          name: 'Dream Machine Special Edition',
          manufacturer: 'Ubiquiti Inc.',
          model: 'UDM SE',
          connections: [['mac', 'aa:bb:cc:dd:ee:02']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-protect-shell', {});
    expect(topo.devices.map(d => d.deviceId)).toEqual(['gw']);
  });

  it('resolves uplink topology via uplink mac sensor', () => {
    const hass = {
      states: {
        'sensor.gw_state': { state: 'connected', attributes: {} },
        'sensor.sw_state': { state: 'connected', attributes: {} },
        'sensor.sw_uplink': { state: 'aa:bb:cc:dd:ee:01', attributes: {} },
      },
      entities: {
        'sensor.gw_state': {
          entity_id: 'sensor.gw_state',
          device_id: 'gw',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:01',
          translation_key: 'device_state',
        },
        'sensor.sw_state': {
          entity_id: 'sensor.sw_state',
          device_id: 'sw',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:02',
          translation_key: 'device_state',
        },
        'sensor.sw_uplink': {
          entity_id: 'sensor.sw_uplink',
          device_id: 'sw',
          platform: 'unifi',
          unique_id: 'uplink-aa:bb:cc:dd:ee:02',
          translation_key: 'device_uplink_mac',
        },
      },
      devices: {
        gw: {
          id: 'gw',
          name: 'Gateway',
          manufacturer: 'Ubiquiti Networks',
          model: 'UDM-SE',
          connections: [['mac', 'aa:bb:cc:dd:ee:01']],
        },
        sw: {
          id: 'sw',
          name: 'Core Switch',
          manufacturer: 'Ubiquiti Networks',
          model: 'USW-24-PoE',
          connections: [['mac', 'aa:bb:cc:dd:ee:02']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-uplink', {});
    expect(topo.devices.length).toBe(2);
    const sw = topo.devices.find(d => d.deviceId === 'sw');
    expect(sw?.uplinkMac).toBe('aabbccddee01');
    expect(sw?.uplinkDeviceId).toBe('gw');
    expect(sw?.kind).toBe('switch');
    expect(topo.devices.find(d => d.deviceId === 'gw')?.kind).toBe('gateway');
  });
});
