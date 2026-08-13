/**
 * Devices tile grid with utilization rings + optional sparklines.
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UnifiModule } from '../../types';
import type { UnifiDevice, UnifiTopology } from '../../services/uc-unifi-service';
import {
  formatUptime,
  kindIcon,
  orderDevices,
} from '../../services/uc-unifi-service';
import {
  ucHistoryService,
  type NumericPoint,
} from '../../services/uc-history-service';
import { devicePhotoUrl, photoRequestWidth } from './faceplates';

export interface DevicesViewHandlers {
  onDeviceClick?: (device: UnifiDevice) => void;
  triggerPreviewUpdate: () => void;
}

export function renderDevicesView(
  module: UnifiModule,
  hass: HomeAssistant,
  topology: UnifiTopology,
  handlers: DevicesViewHandlers
): TemplateResult {
  const devices = orderDevices(topology.devices, module.device_order, module.hidden_device_ids);
  if (!devices.length) {
    return html`
      <div class="uc-unifi-empty">
        <ha-icon icon="mdi:lan-disconnect"></ha-icon>
        <div>No UniFi devices discovered.</div>
      </div>
    `;
  }

  const wantsHistory = module.show_sparklines !== false;
  const sparkByEntity = new Map<string, NumericPoint[]>();

  if (wantsHistory) {
    const ids = devices
      .map(d => d.cpuEntityId)
      .filter((id): id is string => !!id);
    if (ids.length) {
      const now = Date.now();
      const result = ucHistoryService.query(
        hass,
        {
          key: `unifi:${module.id}:cpu:6h`,
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
  }

  return html`
    <div class="uc-unifi-devices">
      ${devices.map(d => renderTile(module, hass, d, sparkByEntity, handlers))}
    </div>
  `;
}

function renderTile(
  module: UnifiModule,
  hass: HomeAssistant,
  d: UnifiDevice,
  sparks: Map<string, NumericPoint[]>,
  handlers: DevicesViewHandlers
): TemplateResult {
  const util = d.cpuPct ?? d.memoryPct ?? (d.clients != null ? Math.min(100, d.clients * 5) : 0);
  const accent = module.accent_color || 'var(--primary-color)';
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = `${(Math.max(0, Math.min(100, util || 0)) / 100) * circ} ${circ}`;
  const spark = d.cpuEntityId ? sparks.get(d.cpuEntityId) : undefined;
  const uptime = d.uptimeEntityId
    ? formatUptime(hass.states[d.uptimeEntityId]?.state)
    : '—';
  // Tiles render up to ~260px wide; request at DPR-corrected width so photos
  // stay sharp instead of upscaling a tiny thumbnail.
  const photo = devicePhotoUrl(
    d,
    { useImages: module.use_device_images !== false },
    photoRequestWidth(260)
  );

  // UniFi Protect cameras: live snapshot beats a product photo. HA signs the
  // snapshot URL into entity_picture; it refreshes as the token rotates.
  const snapshot =
    d.kind === 'camera' && module.show_camera_previews !== false && d.cameraEntityId
      ? (hass.states[d.cameraEntityId]?.attributes?.entity_picture as string | undefined)
      : undefined;
  const motion = d.motionOn === true;

  // APs typically report several probes (CPU / Local / PHY); name the one the
  // headline number comes from and put the rest in a tooltip.
  const readings = d.temperatures.filter(t => t.celsius != null);
  const tempDetail = readings.map(t => `${t.label} ${t.celsius!.toFixed(0)}°C`).join(' · ');
  const headlineProbe =
    readings.length > 1 && d.temperatureEntityId
      ? readings.find(t => t.entityId === d.temperatureEntityId)?.label || ''
      : '';

  return html`
    <div class="uc-unifi-device-tile" @click=${() => handlers.onDeviceClick?.(d)}>
      ${snapshot
        ? html`<div class="uc-unifi-tile-snapbox ${motion ? 'is-motion' : ''}">
            <img
              class="uc-unifi-tile-snap"
              src="${snapshot}"
              alt="${d.name}"
              loading="lazy"
              draggable="false"
              @error=${(e: Event) => {
                const box = (e.currentTarget as HTMLElement).parentElement;
                if (box) box.style.display = 'none';
              }}
            />
            ${motion
              ? html`<span class="uc-unifi-motion-badge">
                  <ha-icon icon="mdi:motion-sensor" style="--mdc-icon-size:12px;"></ha-icon>
                  Motion
                </span>`
              : nothing}
            ${d.doorbellEntityId && hass.states[d.doorbellEntityId]?.state === 'on'
              ? html`<span class="uc-unifi-motion-badge is-ring">
                  <ha-icon icon="mdi:bell-ring" style="--mdc-icon-size:12px;"></ha-icon>
                  Ring
                </span>`
              : nothing}
          </div>`
        : photo
        ? html`<div class="uc-unifi-tile-photobox">
            <img
              class="uc-unifi-tile-photo"
              src="${photo}"
              alt="${d.model || d.name}"
              loading="lazy"
              draggable="false"
              @error=${(e: Event) => {
                // Hide the whole box so a broken photo doesn't leave a gap.
                const box = (e.currentTarget as HTMLElement).parentElement;
                if (box) box.style.display = 'none';
              }}
            />
          </div>`
        : nothing}
      <div class="uc-unifi-device-head">
        <svg class="uc-unifi-mini-ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="${r}" fill="none" stroke="rgba(127,127,127,0.2)" stroke-width="4" />
          <circle
            cx="24"
            cy="24"
            r="${r}"
            fill="none"
            stroke="${accent}"
            stroke-width="4"
            stroke-linecap="round"
            stroke-dasharray="${dash}"
            transform="rotate(-90 24 24)"
            style="filter: drop-shadow(0 0 3px ${accent});"
          />
          <text x="24" y="27" text-anchor="middle" fill="currentColor" font-size="9" font-weight="700">
            ${util != null ? Math.round(util) : '—'}
          </text>
        </svg>
        <div style="min-width:0;">
          <div class="name">${d.name}</div>
          <div class="model">
            <ha-icon icon="${kindIcon(d.kind)}" style="--mdc-icon-size:12px;"></ha-icon>
            ${d.model || d.kind}${d.state ? ` · ${d.state}` : ''}
          </div>
        </div>
      </div>

      ${d.kind === 'camera'
        ? html`<div class="uc-unifi-stats">
            <div><div class="lbl" style="opacity:0.55;font-size:10px;">Motion</div><div class="v">${d.motionOn == null ? '—' : d.motionOn ? 'Detected' : 'Clear'}</div></div>
            ${d.doorbellEntityId
              ? html`<div><div class="lbl" style="opacity:0.55;font-size:10px;">Doorbell</div><div class="v">${hass.states[d.doorbellEntityId]?.state === 'on' ? 'Ringing' : 'Idle'}</div></div>`
              : nothing}
            <div><div class="lbl" style="opacity:0.55;font-size:10px;">Status</div><div class="v">${d.cameraEntityId ? hass.states[d.cameraEntityId]?.state || '—' : '—'}</div></div>
            ${d.temperatureC != null
              ? html`<div><div class="lbl" style="opacity:0.55;font-size:10px;">Temp</div><div class="v">${d.temperatureC.toFixed(0)}°</div></div>`
              : nothing}
          </div>`
        : html`<div class="uc-unifi-stats">
            <div><div class="lbl" style="opacity:0.55;font-size:10px;">CPU</div><div class="v">${d.cpuPct != null ? `${Math.round(d.cpuPct)}%` : '—'}</div></div>
            <div><div class="lbl" style="opacity:0.55;font-size:10px;">Memory</div><div class="v">${d.memoryPct != null ? `${Math.round(d.memoryPct)}%` : '—'}</div></div>
            <div><div class="lbl" style="opacity:0.55;font-size:10px;">Clients</div><div class="v">${d.clients != null ? d.clients : '—'}</div></div>
            <div title=${tempDetail}>
              <div class="lbl" style="opacity:0.55;font-size:10px;">
                Temp${headlineProbe ? ` · ${headlineProbe}` : ''}
              </div>
              <div class="v">${d.temperatureC != null ? `${d.temperatureC.toFixed(0)}°` : '—'}</div>
            </div>
          </div>`}

      ${module.show_advanced !== false
        ? html`<div style="font-size:11px;opacity:0.65;">
            Uptime ${uptime}${d.ports.length
              ? ` · ${d.ports.filter(p => p.up).length}/${d.ports.length} ports up`
              : ''}${readings.length > 1 ? ` · ${tempDetail}` : ''}
          </div>`
        : nothing}

      ${spark && spark.length > 1 ? renderSparkline(spark, accent) : nothing}
    </div>
  `;
}

function renderSparkline(series: NumericPoint[], color: string): TemplateResult {
  const width = 160;
  const height = 28;
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
