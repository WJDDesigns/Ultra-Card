/**
 * Topology view — tree / radial layout from uplink graph with animated flow.
 */

import { TemplateResult, html, svg, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UnifiModule } from '../../types';
import type { UnifiDevice, UnifiPort, UnifiTopology } from '../../services/uc-unifi-service';
import {
  findDevicePortOnParent,
  formatRate,
  inferUplinkDeviceId,
  linkSpeedColor,
  orderDevices,
  portLabel,
  portsThroughputMbps,
} from '../../services/uc-unifi-service';

export interface TopologyViewHandlers {
  onDeviceClick?: (device: UnifiDevice) => void;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
  device: UnifiDevice;
  /** How many nodes share this row — crowded rows get shorter labels. */
  rowCount: number;
}

/** Vertical geometry. BOTTOM_PAD must clear both label lines under a node
 *  (drawn at r+14 and r+26) or the deepest row gets cut off by the viewBox. */
const NODE_TOP = 48;
const ROW_GAP = 132;
const BOTTOM_PAD = 58;

/** Edge colour when no port reports a negotiated speed for the link. */
const UNKNOWN_LINK_COLOR = 'rgba(100,155,235,0.55)';

/** Fastest live port on a device — for a leaf or a switch that is its uplink. */
function maxUpLinkSpeed(ports: readonly UnifiPort[]): number | null {
  let best: number | null = null;
  for (const p of ports) {
    if (!p.up || p.linkSpeedMbps == null || p.linkSpeedMbps <= 0) continue;
    if (best == null || p.linkSpeedMbps > best) best = p.linkSpeedMbps;
  }
  return best;
}

export function renderTopologyView(
  module: UnifiModule,
  hass: HomeAssistant,
  topology: UnifiTopology,
  handlers: TopologyViewHandlers
): TemplateResult {
  const devices = orderDevices(topology.devices, module.device_order, module.hidden_device_ids);
  if (!devices.length) {
    return html`
      <div class="uc-unifi-empty">
        <ha-icon icon="mdi:sitemap"></ha-icon>
        <div>No UniFi devices to map.</div>
      </div>
    `;
  }

  const layout = module.topology_layout || 'tree';
  const width = 640;

  const byDevId = new Map(devices.map(d => [d.deviceId, d]));
  const pinned = new Map(
    (module.device_overrides || [])
      .filter(o => o.uplink_device_id)
      .map(o => [o.device_id, o.uplink_device_id as string])
  );

  /** A parent id only counts when it points at another visible device. */
  const usable = (d: UnifiDevice, id: string | null | undefined): string | null =>
    id && id !== d.deviceId && byDevId.has(id) ? id : null;

  /** User-pinned parent — beats the sensor, for gear HA can't report. */
  const pinnedUplink = (d: UnifiDevice): string | null => usable(d, pinned.get(d.deviceId));
  /** Parent measured by the device's `Uplink MAC` sensor. */
  const measuredUplink = (d: UnifiDevice): string | null => usable(d, d.uplinkDeviceId);
  /**
   * Effective parent. HA's uplink MAC sensor is disabled by default and never
   * exists for Protect cameras, so nothing may float disconnected — we infer
   * the most plausible parent instead of defaulting everything to the gateway.
   */
  const parentIdOf = (d: UnifiDevice): string | null =>
    pinnedUplink(d) ??
    measuredUplink(d) ??
    usable(d, inferUplinkDeviceId(d, devices));
  /** True when the edge is a guess rather than reported or pinned. */
  const isInferred = (d: UnifiDevice): boolean => !pinnedUplink(d) && !measuredUplink(d);

  const parentOf = new Map<string, string | null>();
  for (const d of devices) parentOf.set(d.deviceId, parentIdOf(d));

  const childCount = new Map<string, number>();
  for (const pid of parentOf.values()) {
    if (pid) childCount.set(pid, (childCount.get(pid) || 0) + 1);
  }

  const levels = groupByDepth(devices, parentOf);
  const maxDepth = Math.max(0, ...levels.keys());
  const height =
    layout === 'radial'
      ? Math.max(300, 160 + devices.length * 30)
      : Math.max(240, NODE_TOP + maxDepth * ROW_GAP + BOTTOM_PAD);

  const nodes =
    layout === 'radial' ? layoutRadial(devices, width, height) : layoutTree(levels, width);

  const byId = new Map(nodes.map(n => [n.id, n]));
  const anim = module.animation_intensity || 'full';

  const links = devices
    .map(d => {
      const pid = parentOf.get(d.deviceId);
      const from = pid ? byId.get(pid) : undefined;
      const to = byId.get(d.deviceId);
      if (!from || !to) return null;

      // The child's own ports come first: their combined rate is the traffic
      // crossing this link. Cameras (and most APs) expose no port sensors, so
      // fall back to the parent switch port feeding them when the controller's
      // port label identifies it.
      let mbps = portsThroughputMbps(hass, d.ports);
      let speed = maxUpLinkSpeed(d.ports);
      let via: string | undefined;
      if (mbps == null) {
        const parentPort = findDevicePortOnParent(d, from.device);
        if (parentPort) {
          mbps = portsThroughputMbps(hass, [parentPort]);
          speed ??= parentPort.linkSpeedMbps;
          via = `${from.device.name} · ${portLabel(parentPort)}`;
        }
      }

      const inferred = isInferred(d);
      // Colour tracks link speed; dashes (below) are what mark an inferred
      // parent. Unknown speed keeps the neutral blue-grey.
      const color = speed != null ? linkSpeedColor(speed) : UNKNOWN_LINK_COLOR;
      const thickness =
        speed == null ? 2 : speed >= 10000 ? 3.5 : speed >= 1000 ? 2.5 : 1.8;
      // Unmeasured but up: a slow drift reads as "alive, rate unknown".
      const flowSpeed =
        mbps == null
          ? '3.2s'
          : mbps > 100
            ? '0.6s'
            : mbps > 10
              ? '1.0s'
              : mbps > 0
                ? '1.6s'
                : '2.4s';
      // Protect gear has no device_state sensor, so an absent state means
      // unknown, not down — only an explicit non-connected state kills flow.
      const down = d.state != null && d.state !== 'connected';
      return {
        from,
        to,
        color,
        flowSpeed,
        thickness,
        inferred,
        device: d,
        rateText: mbps != null ? formatRate(mbps) : 'rate unknown',
        via,
        active: !down,
      };
    })
    .filter((l): l is NonNullable<typeof l> => !!l);

  return html`
    <div class="uc-unifi-topo">
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        ${links.map(l => {
          const midX = (l.from.x + l.to.x) / 2;
          const path = `M ${l.from.x} ${l.from.y} C ${midX} ${l.from.y}, ${midX} ${l.to.y}, ${l.to.x} ${l.to.y}`;
          const flowing = anim !== 'off' && l.active;
          const parts = [`${l.device.name} → ${l.from.device.name}`, l.rateText];
          if (l.via) parts.push(`via ${l.via}`);
          if (l.inferred) parts.push('inferred — no uplink sensor');
          // Inferred edges are dashed: the shape of the network is a guess
          // until an uplink sensor exists or the user pins the parent.
          return svg`
            <path
              d="${path}"
              stroke="${l.color}"
              stroke-width="${l.thickness}"
              fill="none"
              opacity="${flowing ? 0.5 : 1}"
              stroke-dasharray="${l.inferred ? '5 5' : 'none'}"
              stroke-linecap="${l.inferred ? 'round' : 'butt'}"
            >
              <title>${parts.join(' · ')}</title>
            </path>
            ${flowing
              ? svg`
                <path
                  class="uc-unifi-flow"
                  d="${path}"
                  stroke="${l.color}"
                  stroke-width="${l.thickness}"
                  style="--flow-speed: ${l.flowSpeed}; color: ${l.color};"
                />
              `
              : nothing}
          `;
        })}

        ${nodes.map(n => {
          const r = n.device.kind === 'gateway' ? 22 : n.device.kind === 'ap' ? 18 : 16;
          // Crowded rows need shorter labels or neighbours overlap.
          const maxChars = n.rowCount >= 6 ? 11 : n.rowCount >= 5 ? 14 : 18;
          const label =
            n.device.name.length > maxChars
              ? n.device.name.slice(0, maxChars - 2) + '…'
              : n.device.name;
          const clients = n.device.clients;
          const kids = childCount.get(n.id) || 0;
          const statParts: string[] = [];
          if (kids > 0) statParts.push(`${kids} ${kids === 1 ? 'device' : 'devices'}`);
          if (clients != null) statParts.push(`${clients} ${clients === 1 ? 'client' : 'clients'}`);
          else if (n.device.ports.length)
            statParts.push(`${n.device.ports.filter(p => p.up).length}/${n.device.ports.length} up`);
          // state is undefined when the device_state sensor is disabled — show
          // as unknown (blue), not offline.
          const online = n.device.state === 'connected';
          const offline = n.device.state != null && n.device.state !== 'connected';
          const dot = online ? '#2bd97c' : offline ? '#ff5252' : 'rgba(140,155,180,0.6)';
          return svg`
            <g
              class="uc-unifi-topo-node ${online ? 'is-online' : ''} ${offline ? 'is-offline' : ''}"
              transform="translate(${n.x}, ${n.y})"
              @click=${() => handlers.onDeviceClick?.(n.device)}
            >
              <circle class="core" r="${r}" />
              ${n.device.kind === 'ap'
                ? svg`
                  <circle r="${r + 6}" fill="none" stroke="#00e5ff" stroke-width="2"
                    stroke-dasharray="${((n.device.cpuPct ?? Math.min(100, (clients || 0) * 4)) / 100) * 2 * Math.PI * (r + 6)} ${2 * Math.PI * (r + 6)}"
                    transform="rotate(-90)"
                    opacity="0.85"
                  />
                `
                : nothing}
              <circle
                class="status"
                cx="${(r * 0.74).toFixed(1)}"
                cy="${(-r * 0.74).toFixed(1)}"
                r="3.6"
                fill="${dot}"
                stroke="#0a0e16"
                stroke-width="1.2"
                style="${online || offline ? `filter: drop-shadow(0 0 3px ${dot});` : ''}"
              />
              <text y="4" font-size="11" font-weight="700">${kindGlyph(n.device.kind)}</text>
              <text y="${r + 14}">${label}</text>
              ${n.device.state
                ? svg`<title>${n.device.name} · ${n.device.state}</title>`
                : nothing}
              ${statParts.length
                ? svg`<text y="${r + 26}" opacity="0.6" font-size="9">${statParts.join(' · ')}</text>`
                : nothing}
            </g>
          `;
        })}
      </svg>
    </div>
  `;
}

function kindGlyph(kind: UnifiDevice['kind']): string {
  switch (kind) {
    case 'gateway':
      return 'GW';
    case 'switch':
      return 'SW';
    case 'ap':
      return 'AP';
    case 'pdu':
      return 'PD';
    case 'camera':
      return 'CAM';
    case 'nvr':
      return 'NVR';
    case 'plug':
      return 'PL';
    default:
      return '·';
  }
}

/** Bucket devices by hop count from the gateway along the parent chain. */
function groupByDepth(
  devices: UnifiDevice[],
  parentOf: Map<string, string | null>
): Map<number, UnifiDevice[]> {
  const byId = new Map(devices.map(d => [d.deviceId, d]));
  const depthOf = (d: UnifiDevice, seen = new Set<string>()): number => {
    const pid = parentOf.get(d.deviceId);
    if (!pid || !byId.has(pid) || seen.has(d.deviceId)) return 0;
    seen.add(d.deviceId);
    return 1 + depthOf(byId.get(pid)!, seen);
  };

  const levels = new Map<number, UnifiDevice[]>();
  for (const d of devices) {
    const depth = d.kind === 'gateway' ? 0 : depthOf(d);
    const list = levels.get(depth) || [];
    list.push(d);
    levels.set(depth, list);
  }
  return levels;
}

function layoutTree(levels: Map<number, UnifiDevice[]>, width: number): NodePos[] {
  const nodes: NodePos[] = [];
  for (const [depth, list] of levels) {
    const y = NODE_TOP + depth * ROW_GAP;
    // Crowded rows use the full width; sparse rows stay comfortably inset.
    const pad = list.length >= 5 ? 48 : 60;
    list.forEach((d, i) => {
      const x =
        list.length === 1
          ? width / 2
          : pad + (i / Math.max(1, list.length - 1)) * (width - pad * 2);
      nodes.push({ id: d.deviceId, x, y, device: d, rowCount: list.length });
    });
  }
  return nodes;
}

function layoutRadial(devices: UnifiDevice[], width: number, height: number): NodePos[] {
  const cx = width / 2;
  const cy = height / 2;
  const gateways = devices.filter(d => d.kind === 'gateway');
  const root = gateways[0] || devices[0];
  const others = devices.filter(d => d.deviceId !== root.deviceId);
  const nodes: NodePos[] = [{ id: root.deviceId, x: cx, y: cy, device: root, rowCount: 1 }];
  const radius = Math.min(width, height) * 0.36;
  others.forEach((d, i) => {
    const a = (i / Math.max(1, others.length)) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: d.deviceId,
      x: cx + Math.cos(a) * radius,
      y: cy + Math.sin(a) * radius,
      device: d,
      rowCount: 1,
    });
  });
  return nodes;
}
