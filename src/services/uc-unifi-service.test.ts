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
  inferUplinkDeviceId,
  findDevicePortOnParent,
  portLabel,
  portsThroughputMbps,
  isUbiquitiManufacturer,
  isUnifiInfrastructureDevice,
  parseTemperatureLabel,
  sortTemperatures,
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

  it('classifies UniFi Protect cameras and doorbells', () => {
    expect(classifyDevice('G5 Bullet')).toBe('camera');
    expect(classifyDevice('G4 Doorbell Pro')).toBe('camera');
    expect(classifyDevice('UVC G3 Instant')).toBe('camera');
    expect(classifyDevice('AI 360')).toBe('camera');
    expect(classifyDevice('G4 Dome')).toBe('camera');
    // Camera entity fingerprint is definitive even with an unknown model
    expect(classifyDevice('Mystery Cam', { hasCamera: true })).toBe('camera');
  });

  it('never classifies phones like "Moto G4" as cameras', () => {
    expect(classifyDevice('Moto G4')).not.toBe('camera');
    expect(classifyDevice('LG G5')).not.toBe('camera');
  });

  it('classifies NVRs', () => {
    expect(classifyDevice('UNVR')).toBe('nvr');
    expect(classifyDevice('UNVR-Pro')).toBe('nvr');
    expect(classifyDevice('Network Video Recorder')).toBe('nvr');
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
    expect(kindFromDbType('camera')).toBe('camera');
    expect(kindFromDbType('doorbell')).toBe('camera');
    expect(kindFromDbType('nvr')).toBe('nvr');
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
      temperatures: [],
      clients: null,
      motionOn: null,
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
      temperatures: [],
      clients: null,
      motionOn: null,
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

describe('parseTemperatureLabel', () => {
  it('names the general device temperature', () => {
    expect(parseTemperatureLabel('device_temperature-aa:bb:cc:dd:ee:ff')).toBe('General');
  });

  it('names per-probe temperatures from the unique id', () => {
    expect(parseTemperatureLabel('temperature-cpu-aa:bb:cc:dd:ee:ff')).toBe('CPU');
    expect(parseTemperatureLabel('temperature-local-aa:bb:cc:dd:ee:ff')).toBe('Local');
    expect(parseTemperatureLabel('temperature-phy-aa:bb:cc:dd:ee:ff')).toBe('PHY');
  });

  it('falls back to the translation key and name', () => {
    expect(parseTemperatureLabel('x', 'device_sub_temperature', 'CPU temperature')).toBe('CPU');
    expect(parseTemperatureLabel('x', 'device_sub_temperature', 'Local temperature')).toBe('Local');
    expect(parseTemperatureLabel('x', 'device_temperature')).toBe('General');
  });

  it('ignores unrelated sensors', () => {
    expect(parseTemperatureLabel('cpu-aa:bb:cc:dd:ee:ff', 'device_cpu_utilization')).toBeNull();
    expect(parseTemperatureLabel('port_rx-aa:bb:cc:dd:ee:ff_1')).toBeNull();
    expect(parseTemperatureLabel('')).toBeNull();
  });

  it('orders whole-device readings ahead of silicon probes', () => {
    const mk = (label: string) => ({ label, celsius: 1, entityId: `sensor.${label}` });
    expect(
      sortTemperatures([mk('PHY'), mk('CPU'), mk('Local'), mk('General')]).map(t => t.label)
    ).toEqual(['General', 'Local', 'CPU', 'PHY']);
  });
});

describe('inferUplinkDeviceId', () => {
  const mk = (
    id: string,
    kind: UnifiDevice['kind'],
    ports: Array<{ poeW?: number | null; poeOn?: boolean | null }> = []
  ): UnifiDevice =>
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
      temperatures: [],
      clients: null,
      motionOn: null,
      acPowerBudgetW: null,
      acPowerConsumptionW: null,
      ports: ports.map((p, i) => ({
        index: i + 1,
        name: `P${i + 1}`,
        linkSpeedMbps: 1000,
        rx: null,
        tx: null,
        poePowerW: p.poeW ?? null,
        poeOn: p.poeOn ?? null,
        ...(p.poeW != null || p.poeOn != null ? { poeSwitchEntityId: `switch.${id}_poe_${i}` } : {}),
        enabled: null,
        up: true,
      })),
      outlets: [],
      entityIds: [],
    }) as UnifiDevice;

  it('hangs cameras off the PoE switch, not the gateway', () => {
    const gw = mk('gw', 'gateway');
    const sw = mk('sw', 'switch', [{ poeW: 6.5 }, { poeW: 11.2 }]);
    const cam = mk('cam', 'camera');
    expect(inferUplinkDeviceId(cam, [gw, sw, cam])).toBe('sw');
  });

  it('hangs APs off the PoE switch too', () => {
    const gw = mk('gw', 'gateway');
    const sw = mk('sw', 'switch', [{ poeW: 4.2 }]);
    const ap = mk('ap', 'ap');
    expect(inferUplinkDeviceId(ap, [gw, sw, ap])).toBe('sw');
  });

  it('prefers the switch actually delivering PoE when several exist', () => {
    const gw = mk('gw', 'gateway');
    const core = mk('core', 'switch', [{ poeW: 12 }, { poeW: 9 }, { poeW: 4 }]);
    const agg = mk('agg', 'switch', [{ poeW: 0, poeOn: false }, { poeW: 0, poeOn: false }]);
    const cam = mk('cam', 'camera');
    expect(inferUplinkDeviceId(cam, [gw, core, agg, cam])).toBe('core');
  });

  it('falls back to the gateway when no switch can supply PoE', () => {
    const gw = mk('gw', 'gateway');
    const sw = mk('sw', 'switch', [{}, {}]);
    const cam = mk('cam', 'camera');
    expect(inferUplinkDeviceId(cam, [gw, sw, cam])).toBe('gw');
  });

  it('falls back to the gateway when there is no switch at all', () => {
    const gw = mk('gw', 'gateway');
    const cam = mk('cam', 'camera');
    expect(inferUplinkDeviceId(cam, [gw, cam])).toBe('gw');
  });

  it('keeps switches on the gateway', () => {
    const gw = mk('gw', 'gateway');
    const core = mk('core', 'switch', [{ poeW: 12 }]);
    const edge = mk('edge', 'switch', [{ poeW: 3 }]);
    expect(inferUplinkDeviceId(edge, [gw, core, edge])).toBe('gw');
  });

  it('never returns the device itself and tolerates a lone device', () => {
    const cam = mk('cam', 'camera');
    expect(inferUplinkDeviceId(cam, [cam])).toBeNull();
  });

  it('puts NVRs on a switch even without PoE', () => {
    const gw = mk('gw', 'gateway');
    const sw = mk('sw', 'switch', [{}, {}]);
    const nvr = mk('nvr', 'nvr');
    expect(inferUplinkDeviceId(nvr, [gw, sw, nvr])).toBe('sw');
  });
});

describe('link rate sources', () => {
  const mkPort = (
    index: number,
    name: string,
    over: Partial<UnifiDevice['ports'][number]> = {}
  ): UnifiDevice['ports'][number] => ({
    index,
    name,
    linkSpeedMbps: 1000,
    rx: null,
    tx: null,
    poePowerW: null,
    poeOn: null,
    enabled: null,
    up: true,
    ...over,
  });

  const mkDevice = (name: string, ports: UnifiDevice['ports']): UnifiDevice =>
    ({
      deviceId: name,
      mac: name,
      name,
      model: '',
      manufacturer: 'Ubiquiti Networks',
      kind: 'switch',
      heightU: 1,
      cpuPct: null,
      memoryPct: null,
      temperatureC: null,
      temperatures: [],
      clients: null,
      motionOn: null,
      acPowerBudgetW: null,
      acPowerConsumptionW: null,
      ports,
      outlets: [],
      entityIds: [],
    }) as UnifiDevice;

  const hassWith = (units: Record<string, string>) =>
    ({
      states: Object.fromEntries(
        Object.entries(units).map(([id, unit]) => [id, { attributes: { unit_of_measurement: unit } }])
      ),
    }) as never;

  it('strips the entity role suffix from a port label', () => {
    expect(portLabel(mkPort(1, 'Back Left Cam RX'))).toBe('Back Left Cam');
    expect(portLabel(mkPort(1, 'Port 5 Link speed'))).toBe('Port 5');
    expect(portLabel(mkPort(1, 'Garage PoE power'))).toBe('Garage');
  });

  it('sums RX and TX in Mbps across ports', () => {
    const hass = hassWith({ 'sensor.rx': 'B/s', 'sensor.tx': 'B/s' });
    const ports = [
      mkPort(1, 'Port 1', { rx: 1_250_000, tx: 125_000, rxEntityId: 'sensor.rx', txEntityId: 'sensor.tx' }),
    ];
    expect(portsThroughputMbps(hass, ports)).toBeCloseTo(11, 5);
  });

  it('reports null when no port has a bandwidth reading', () => {
    expect(portsThroughputMbps(hassWith({}), [mkPort(1, 'Port 1')])).toBeNull();
    expect(portsThroughputMbps(hassWith({}), [])).toBeNull();
  });

  it('matches a leaf device to the parent port named after it', () => {
    const parent = mkDevice('Switch', [
      mkPort(1, 'Port 1 RX'),
      mkPort(2, 'Back Left RX'),
      mkPort(3, 'SFP+ 9 RX'),
    ]);
    const cam = mkDevice('Back Left', []);
    expect(findDevicePortOnParent(cam, parent)?.index).toBe(2);
  });

  it('matches when the port label wraps the device name', () => {
    const parent = mkDevice('Switch', [mkPort(4, 'Back Left Camera RX')]);
    expect(findDevicePortOnParent(mkDevice('Back Left', []), parent)?.index).toBe(4);
  });

  it('ignores factory port labels', () => {
    const parent = mkDevice('Switch', [mkPort(1, 'Port 1 RX'), mkPort(25, 'SFP+ 25 RX')]);
    expect(findDevicePortOnParent(mkDevice('Port 1', []), parent)).toBeNull();
  });

  it('refuses ambiguous label matches', () => {
    const parent = mkDevice('Switch', [
      mkPort(1, 'Back Left Camera RX'),
      mkPort(2, 'Back Left Sensor RX'),
    ]);
    expect(findDevicePortOnParent(mkDevice('Back Left', []), parent)).toBeNull();
  });

  it('breaks a tie in favour of the only live port', () => {
    const parent = mkDevice('Switch', [
      mkPort(1, 'Back Left Camera RX', { up: false }),
      mkPort(2, 'Back Left Camera 2 RX'),
    ]);
    expect(findDevicePortOnParent(mkDevice('Back Left', []), parent)?.index).toBe(2);
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

  it('admits UniFi Protect cameras and NVRs as devices', () => {
    const hass = {
      states: {
        'sensor.gw_state': { state: 'connected', attributes: {} },
        'camera.driveway_high': {
          state: 'recording',
          attributes: { entity_picture: '/api/camera_proxy/camera.driveway_high?token=x' },
        },
        'binary_sensor.driveway_motion': {
          state: 'on',
          attributes: { device_class: 'motion' },
        },
        'sensor.nvr_storage': { state: '38', attributes: { unit_of_measurement: '%' } },
      },
      entities: {
        'sensor.gw_state': {
          entity_id: 'sensor.gw_state',
          device_id: 'gw',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:01',
          translation_key: 'device_state',
        },
        'camera.driveway_high': {
          entity_id: 'camera.driveway_high',
          device_id: 'cam1',
          platform: 'unifiprotect',
          unique_id: 'aabbccddee10_high',
        },
        'binary_sensor.driveway_motion': {
          entity_id: 'binary_sensor.driveway_motion',
          device_id: 'cam1',
          platform: 'unifiprotect',
          unique_id: 'aabbccddee10_motion',
        },
        'sensor.nvr_storage': {
          entity_id: 'sensor.nvr_storage',
          device_id: 'nvr1',
          platform: 'unifiprotect',
          unique_id: 'aabbccddee11_storage',
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
        cam1: {
          id: 'cam1',
          name: 'Driveway',
          manufacturer: 'Ubiquiti',
          model: 'G5 Bullet',
          connections: [['mac', 'aa:bb:cc:dd:ee:10']],
        },
        nvr1: {
          id: 'nvr1',
          name: 'Network Video Recorder',
          manufacturer: 'Ubiquiti',
          model: 'UNVR',
          connections: [['mac', 'aa:bb:cc:dd:ee:11']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-protect-hw', {});
    expect(topo.devices.map(d => d.deviceId).sort()).toEqual(['cam1', 'gw', 'nvr1']);
    const cam = topo.devices.find(d => d.deviceId === 'cam1')!;
    expect(cam.kind).toBe('camera');
    expect(cam.cameraEntityId).toBe('camera.driveway_high');
    expect(cam.motionEntityId).toBe('binary_sensor.driveway_motion');
    expect(cam.motionOn).toBe(true);
    expect(topo.devices.find(d => d.deviceId === 'nvr1')?.kind).toBe('nvr');
  });

  it('drops Protect duplicates whose MAC the Network integration already owns', () => {
    const hass = {
      states: {
        'sensor.sw_state': { state: 'connected', attributes: {} },
        'sensor.dup_storage': { state: '10', attributes: {} },
      },
      entities: {
        'sensor.sw_state': {
          entity_id: 'sensor.sw_state',
          device_id: 'sw',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:20',
          translation_key: 'device_state',
        },
        'sensor.dup_storage': {
          entity_id: 'sensor.dup_storage',
          device_id: 'dup',
          platform: 'unifiprotect',
          unique_id: 'aabbccddee20_storage',
        },
      },
      devices: {
        sw: {
          id: 'sw',
          name: 'Switch',
          manufacturer: 'Ubiquiti Networks',
          model: 'USW-24-PoE',
          connections: [['mac', 'aa:bb:cc:dd:ee:20']],
        },
        dup: {
          id: 'dup',
          name: 'Switch (Protect)',
          manufacturer: 'Ubiquiti',
          model: 'UNVR',
          connections: [['mac', 'aa:bb:cc:dd:ee:20']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-protect-macdupe', {});
    expect(topo.devices.map(d => d.deviceId)).toEqual(['sw']);
  });

  it('reads AP per-probe temperatures without mistaking CPU temp for CPU load', () => {
    const hass = {
      states: {
        'sensor.ap_state': { state: 'connected', attributes: {} },
        'sensor.ap_cpu': { state: '8', attributes: { unit_of_measurement: '%' } },
        'sensor.ap_cpu_temperature': {
          state: '64',
          attributes: { unit_of_measurement: '°C', device_class: 'temperature' },
        },
        'sensor.ap_local_temperature': {
          state: '46',
          attributes: { unit_of_measurement: '°C', device_class: 'temperature' },
        },
      },
      entities: {
        'sensor.ap_state': {
          entity_id: 'sensor.ap_state',
          device_id: 'ap',
          platform: 'unifi',
          unique_id: 'device_state-aa:bb:cc:dd:ee:30',
          translation_key: 'device_state',
        },
        'sensor.ap_cpu': {
          entity_id: 'sensor.ap_cpu',
          device_id: 'ap',
          platform: 'unifi',
          unique_id: 'cpu_utilization-aa:bb:cc:dd:ee:30',
          translation_key: 'device_cpu_utilization',
        },
        'sensor.ap_cpu_temperature': {
          entity_id: 'sensor.ap_cpu_temperature',
          device_id: 'ap',
          platform: 'unifi',
          unique_id: 'temperature-cpu-aa:bb:cc:dd:ee:30',
          translation_key: 'device_sub_temperature',
          original_name: 'CPU temperature',
        },
        'sensor.ap_local_temperature': {
          entity_id: 'sensor.ap_local_temperature',
          device_id: 'ap',
          platform: 'unifi',
          unique_id: 'temperature-local-aa:bb:cc:dd:ee:30',
          translation_key: 'device_sub_temperature',
          original_name: 'Local temperature',
        },
      },
      devices: {
        ap: {
          id: 'ap',
          name: 'Office AP',
          manufacturer: 'Ubiquiti Networks',
          model: 'U7PROMAX',
          connections: [['mac', 'aa:bb:cc:dd:ee:30']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-ap-temps', {});
    const ap = topo.devices[0];
    // CPU load must still come from the utilization sensor, not 64 °C
    expect(ap.cpuPct).toBe(8);
    expect(ap.cpuEntityId).toBe('sensor.ap_cpu');
    expect(ap.temperatures.map(t => t.label)).toEqual(['Local', 'CPU']);
    // Board temp is the headline, matching what the UniFi console shows
    expect(ap.temperatureC).toBe(46);
    expect(ap.temperatureEntityId).toBe('sensor.ap_local_temperature');
  });

  it('prefers the general device temperature when present', () => {
    const hass = {
      states: {
        'sensor.sw_temperature': {
          state: '52',
          attributes: { unit_of_measurement: '°C', device_class: 'temperature' },
        },
        'sensor.sw_cpu_temperature': {
          state: '70',
          attributes: { unit_of_measurement: '°C', device_class: 'temperature' },
        },
      },
      entities: {
        'sensor.sw_temperature': {
          entity_id: 'sensor.sw_temperature',
          device_id: 'sw',
          platform: 'unifi',
          unique_id: 'device_temperature-aa:bb:cc:dd:ee:31',
        },
        'sensor.sw_cpu_temperature': {
          entity_id: 'sensor.sw_cpu_temperature',
          device_id: 'sw',
          platform: 'unifi',
          unique_id: 'temperature-cpu-aa:bb:cc:dd:ee:31',
          translation_key: 'device_sub_temperature',
          original_name: 'CPU temperature',
        },
      },
      devices: {
        sw: {
          id: 'sw',
          name: 'Core Switch',
          manufacturer: 'Ubiquiti Networks',
          model: 'USW-24-PoE',
          connections: [['mac', 'aa:bb:cc:dd:ee:31']],
        },
      },
      areas: {},
    } as any;

    const topo = discoverUnifiTopology(hass, 'fixture-general-temp', {});
    expect(topo.devices[0].temperatureC).toBe(52);
    expect(topo.devices[0].temperatures.map(t => t.label)).toEqual(['General', 'CPU']);
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
