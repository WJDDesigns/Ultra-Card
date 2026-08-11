/**
 * Clients + WAN views.
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UnifiModule } from '../../types';
import type { UnifiClient, UnifiTopology, UnifiWanLatency } from '../../services/uc-unifi-service';
import { formatRate, toMbps } from '../../services/uc-unifi-service';
import {
  ucHistoryService,
  type NumericPoint,
} from '../../services/uc-history-service';

export interface ClientsViewHandlers {
  onBlock?: (entityId: string, block: boolean) => void;
  onReconnect?: (deviceId: string) => void;
  triggerPreviewUpdate?: () => void;
}

export interface WanViewHandlers {
  triggerPreviewUpdate: () => void;
}

type ClientSort = 'bandwidth' | 'name' | 'rx' | 'tx';

const sortByModule = new Map<string, ClientSort>();

export function renderClientsView(
  module: UnifiModule,
  hass: HomeAssistant,
  topology: UnifiTopology,
  handlers: ClientsViewHandlers
): TemplateResult {
  // Clients are opt-in: only show what the user explicitly added.
  const allowed = new Set(module.client_ids || []);
  const clients = topology.clients.filter(c => allowed.has(c.deviceId));

  if (!topology.clients.length) {
    return html`
      <div class="uc-unifi-empty">
        <ha-icon icon="mdi:account-network"></ha-icon>
        <div>
          No UniFi client bandwidth sensors found. Enable “Bandwidth usage sensors for network
          clients” in the UniFi integration options, and select clients under “Create entities from
          network clients”.
        </div>
      </div>
    `;
  }

  if (!clients.length) {
    return html`
      <div class="uc-unifi-empty">
        <ha-icon icon="mdi:account-plus-outline"></ha-icon>
        <div>
          No clients added yet. ${topology.clients.length} available — pick the ones you want to
          watch under “Clients” in the module editor.
        </div>
      </div>
    `;
  }

  const sort = sortByModule.get(module.id) || 'bandwidth';
  const scored = clients.map(c => {
    const rxU = c.rxEntityId
      ? String(hass.states[c.rxEntityId]?.attributes?.unit_of_measurement || '')
      : '';
    const txU = c.txEntityId
      ? String(hass.states[c.txEntityId]?.attributes?.unit_of_measurement || '')
      : '';
    const rx = toMbps(c.rx, rxU) || 0;
    const tx = toMbps(c.tx, txU) || 0;
    return { c, rx, tx, total: rx + tx };
  });

  scored.sort((a, b) => {
    if (sort === 'name') return a.c.name.localeCompare(b.c.name);
    if (sort === 'rx') return b.rx - a.rx;
    if (sort === 'tx') return b.tx - a.tx;
    return b.total - a.total;
  });

  const setSort = (s: ClientSort) => {
    sortByModule.set(module.id, s);
    handlers.triggerPreviewUpdate?.();
  };

  return html`
    <table class="uc-unifi-table">
      <thead>
        <tr>
          <th @click=${() => setSort('name')}>Client</th>
          <th @click=${() => setSort('rx')}>RX</th>
          <th @click=${() => setSort('tx')}>TX</th>
          <th @click=${() => setSort('bandwidth')}>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${scored.map(({ c, rx, tx, total }) => {
          const max = Math.max(...scored.map(s => s.total), 1);
          return html`
            <tr>
              <td>
                <div style="font-weight:600;">${c.name}</div>
                <div style="font-size:10px;opacity:0.55;">
                  ${c.mac ? c.mac.match(/.{1,2}/g)?.join(':') : ''}
                  ${c.linkSpeedMbps != null ? ` · ${c.linkSpeedMbps} Mbps` : ''}
                </div>
              </td>
              <td>
                ${formatRate(rx)}
                <div class="uc-unifi-bar"><i style="width:${(rx / max) * 100}%;background:#4fc3f7;"></i></div>
              </td>
              <td>
                ${formatRate(tx)}
                <div class="uc-unifi-bar"><i style="width:${(tx / max) * 100}%;background:#81c784;"></i></div>
              </td>
              <td style="font-weight:700;">${formatRate(total)}</td>
              <td>
                ${c.blockEntityId
                  ? html`
                      <button
                        class="uc-unifi-btn secondary"
                        type="button"
                        style="padding:4px 8px;font-size:11px;"
                        @click=${() => handlers.onBlock?.(c.blockEntityId!, c.blocked !== true)}
                      >
                        ${c.blocked ? 'Unblock' : 'Block'}
                      </button>
                    `
                  : nothing}
              </td>
            </tr>
          `;
        })}
      </tbody>
    </table>
  `;
}

export function renderWanView(
  module: UnifiModule,
  hass: HomeAssistant,
  topology: UnifiTopology,
  handlers: WanViewHandlers
): TemplateResult {
  const items = topology.wanLatency;
  const gateways = topology.devices.filter(d => d.kind === 'gateway');

  if (!items.length && !gateways.length) {
    return html`
      <div class="uc-unifi-empty">
        <ha-icon icon="mdi:wan"></ha-icon>
        <div>No WAN latency sensors found. Enable them on your UniFi gateway device in Home Assistant.</div>
      </div>
    `;
  }

  const sparkByEntity = new Map<string, NumericPoint[]>();
  if (module.show_sparklines !== false && items.length) {
    const ids = items.map(i => i.entityId);
    const now = Date.now();
    const result = ucHistoryService.query(
      hass,
      {
        key: `unifi:${module.id}:wan:6h`,
        entityIds: ids,
        startMs: now - 6 * 3600_000,
        endMs: now,
        ttlMs: 5 * 60_000,
      },
      () => handlers.triggerPreviewUpdate()
    );
    if (result.data?.size) {
      for (const [eid, points] of result.data) {
        const series: NumericPoint[] = [];
        for (const p of points || []) {
          const n = Number(p.state);
          if (Number.isFinite(n)) series.push({ t: p.t, v: n });
        }
        sparkByEntity.set(eid, series);
      }
    }
  }

  // Group by target
  const byTarget = new Map<string, UnifiWanLatency[]>();
  for (const item of items) {
    const key = `${item.target} ${item.wan}`;
    const list = byTarget.get(key) || [];
    list.push(item);
    byTarget.set(key, list);
  }

  return html`
    <div class="uc-unifi-wan">
      ${gateways.length
        ? html`
            <div style="margin-bottom:12px;font-size:13px;">
              ${gateways.map(g => {
                const up = g.state === 'connected' || g.state === undefined;
                return html`
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${up ? '#69f0ae' : '#ff5252'};box-shadow:0 0 6px ${up ? '#69f0ae' : '#ff5252'};"></span>
                    <strong>${g.name}</strong>
                    <span style="opacity:0.6;font-size:12px;">${g.state || 'gateway'}${g.cpuPct != null ? ` · CPU ${Math.round(g.cpuPct)}%` : ''}</span>
                  </div>
                `;
              })}
            </div>
          `
        : nothing}

      <div class="uc-unifi-wan-grid">
        ${[...byTarget.entries()].map(([label, list]) => {
          const item = list[0];
          const ms = item.latencyMs;
          const spark = sparkByEntity.get(item.entityId);
          const color =
            ms == null ? 'var(--secondary-text-color)' : ms < 30 ? '#69f0ae' : ms < 80 ? '#ffd740' : '#ff8a80';
          return html`
            <div class="uc-unifi-wan-card">
              <div class="target">${label}</div>
              <div class="latency" style="color:${color};">
                ${ms != null ? Math.round(ms) : '—'}<span class="unit"> ms</span>
              </div>
              ${spark && spark.length > 1 ? renderMiniSpark(spark, color) : nothing}
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

function renderMiniSpark(series: NumericPoint[], color: string): TemplateResult {
  const width = 140;
  const height = 32;
  const vals = series.map(p => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(0.001, max - min);
  const t0 = series[0].t;
  const t1 = series[series.length - 1].t || t0 + 1;
  const points = series
    .map(p => {
      const x = ((p.t - t0) / Math.max(1, t1 - t0)) * width;
      const y = height - ((p.v - min) / span) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return html`
    <svg class="uc-unifi-spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <polyline points=${points} fill="none" stroke=${color} stroke-width="1.5" />
    </svg>
  `;
}
