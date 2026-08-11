/**
 * Topology view — tree / radial layout from uplink graph with animated flow.
 */

import { TemplateResult, html, svg, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UnifiModule } from '../../types';
import type { UnifiDevice, UnifiTopology } from '../../services/uc-unifi-service';
import {
  linkSpeedColor,
  orderDevices,
  toMbps,
} from '../../services/uc-unifi-service';

export interface TopologyViewHandlers {
  onDeviceClick?: (device: UnifiDevice) => void;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
  device: UnifiDevice;
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
  const height = Math.max(280, 120 + devices.length * 36);

  const byDevId = new Map(devices.map(d => [d.deviceId, d]));
  const gateway = devices.find(d => d.kind === 'gateway') || null;
  /** Uplink device id, only when it resolves to a visible device. */
  const resolvedUplink = (d: UnifiDevice): string | null =>
    d.uplinkDeviceId && byDevId.has(d.uplinkDeviceId) ? d.uplinkDeviceId : null;
  /**
   * Effective parent: the resolved uplink, else the gateway. HA's uplink MAC
   * sensor is disabled by default, so devices must never float disconnected
   * while a gateway exists — we infer the edge instead.
   */
  const parentIdOf = (d: UnifiDevice): string | null => {
    const real = resolvedUplink(d);
    if (real) return real;
    if (gateway && d.deviceId !== gateway.deviceId) return gateway.deviceId;
    return null;
  };

  const childCount = new Map<string, number>();
  for (const d of devices) {
    const pid = parentIdOf(d);
    if (pid) childCount.set(pid, (childCount.get(pid) || 0) + 1);
  }

  const nodes =
    layout === 'radial'
      ? layoutRadial(devices, width, height)
      : layoutTree(devices, width, height, parentIdOf);

  const byId = new Map(nodes.map(n => [n.id, n]));
  const anim = module.animation_intensity || 'full';

  const links = devices
    .filter(d => resolvedUplink(d) && byId.has(d.deviceId))
    .map(d => {
      const from = byId.get(d.uplinkDeviceId!)!;
      const to = byId.get(d.deviceId)!;
      // Estimate throughput from sum of port rates on child, or clients
      let mbps = 0;
      for (const p of d.ports) {
        const rxU = p.rxEntityId
          ? String(hass.states[p.rxEntityId]?.attributes?.unit_of_measurement || '')
          : '';
        const txU = p.txEntityId
          ? String(hass.states[p.txEntityId]?.attributes?.unit_of_measurement || '')
          : '';
        mbps += (toMbps(p.rx, rxU) || 0) + (toMbps(p.tx, txU) || 0);
      }
      const speed = d.ports.find(p => p.up)?.linkSpeedMbps ?? 1000;
      const color = linkSpeedColor(speed);
      const flowSpeed = mbps > 100 ? '0.6s' : mbps > 10 ? '1.0s' : mbps > 0 ? '1.6s' : '2.4s';
      const thickness = speed >= 10000 ? 3.5 : speed >= 1000 ? 2.5 : 1.8;
      return { from, to, color, flowSpeed, thickness, active: mbps > 0 || d.state === 'connected' };
    });

  // Orphans without uplink connect visually to nearest gateway
  const gateways = nodes.filter(n => n.device.kind === 'gateway');
  const root = gateways[0] || nodes[0];

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
          return svg`
            <path
              d="${path}"
              stroke="${l.color}"
              stroke-width="${l.thickness}"
              fill="none"
              opacity="0.35"
            />
            ${anim !== 'off' && l.active
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

        ${devices
          .filter(d => !resolvedUplink(d) && d.deviceId !== root?.id && root)
          .map(d => {
            const to = byId.get(d.deviceId);
            if (!to || !root) return nothing;
            const midX = (root.x + to.x) / 2;
            const path = `M ${root.x} ${root.y} C ${midX} ${root.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
            // Inferred edge (uplink sensor unavailable): dashed and dimmer
            // than measured links, but clearly visible.
            return svg`
              <path d="${path}" stroke="rgba(100,155,235,0.55)" stroke-width="2" fill="none" stroke-dasharray="5 5" stroke-linecap="round" />
            `;
          })}

        ${nodes.map(n => {
          const r = n.device.kind === 'gateway' ? 22 : n.device.kind === 'ap' ? 18 : 16;
          const label = n.device.name.length > 18 ? n.device.name.slice(0, 16) + '…' : n.device.name;
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
    default:
      return '·';
  }
}

function layoutTree(
  devices: UnifiDevice[],
  width: number,
  height: number,
  parentIdOf: (d: UnifiDevice) => string | null
): NodePos[] {
  // Group by depth from gateways via (possibly inferred) uplink chain
  const byId = new Map(devices.map(d => [d.deviceId, d]));
  const depthOf = (d: UnifiDevice, seen = new Set<string>()): number => {
    const pid = parentIdOf(d);
    if (!pid || !byId.has(pid) || seen.has(d.deviceId)) return 0;
    seen.add(d.deviceId);
    return 1 + depthOf(byId.get(pid)!, seen);
  };

  const levels = new Map<number, UnifiDevice[]>();
  let maxDepth = 0;
  for (const d of devices) {
    const depth = d.kind === 'gateway' ? 0 : depthOf(d);
    maxDepth = Math.max(maxDepth, depth);
    const list = levels.get(depth) || [];
    list.push(d);
    levels.set(depth, list);
  }

  const nodes: NodePos[] = [];
  const top = 48;
  const bottom = height - 40;
  const spanY = Math.max(1, maxDepth);

  for (const [depth, list] of levels) {
    const y = top + (depth / spanY) * (bottom - top);
    const pad = 60;
    list.forEach((d, i) => {
      const x =
        list.length === 1
          ? width / 2
          : pad + (i / Math.max(1, list.length - 1)) * (width - pad * 2);
      nodes.push({ id: d.deviceId, x, y, device: d });
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
  const nodes: NodePos[] = [{ id: root.deviceId, x: cx, y: cy, device: root }];
  const radius = Math.min(width, height) * 0.36;
  others.forEach((d, i) => {
    const a = (i / Math.max(1, others.length)) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: d.deviceId,
      x: cx + Math.cos(a) * radius,
      y: cy + Math.sin(a) * radius,
      device: d,
    });
  });
  return nodes;
}
