/**
 * Ports view — large per-port grid + detail popup with PoE / power-cycle.
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UnifiModule } from '../../types';
import type { UnifiDevice, UnifiPort, UnifiTopology } from '../../services/uc-unifi-service';
import {
  formatRate,
  linkSpeedColor,
  orderDevices,
  toMbps,
} from '../../services/uc-unifi-service';
import { renderFaceplate } from './faceplates';

export interface PortsViewHandlers {
  onSelectDevice: (deviceId: string) => void;
  onTogglePoe?: (entityId: string, turnOn: boolean) => void;
  onPowerCycle?: (entityId: string) => void;
  onTogglePort?: (entityId: string, turnOn: boolean) => void;
  triggerPreviewUpdate?: () => void;
}

const selectedPortByModule = new Map<string, number | null>();

export function renderPortsView(
  module: UnifiModule,
  hass: HomeAssistant,
  topology: UnifiTopology,
  handlers: PortsViewHandlers
): TemplateResult {
  const devices = orderDevices(topology.devices, module.device_order, module.hidden_device_ids).filter(
    d => d.ports.length > 0 || d.kind === 'switch' || d.kind === 'gateway'
  );

  if (!devices.length) {
    return html`
      <div class="uc-unifi-empty">
        <ha-icon icon="mdi:ethernet"></ha-icon>
        <div>No UniFi switches or gateways with ports found.</div>
      </div>
    `;
  }

  const selectedId =
    module.ports_device_id && devices.some(d => d.deviceId === module.ports_device_id)
      ? module.ports_device_id
      : devices[0].deviceId;
  const device = devices.find(d => d.deviceId === selectedId)!;
  const selectedPortIdx = selectedPortByModule.get(module.id) ?? null;
  const selectedPort =
    selectedPortIdx != null ? device.ports.find(p => p.index === selectedPortIdx) : undefined;

  return html`
    <div class="uc-unifi-ports">
      <div class="uc-unifi-ports-toolbar">
        ${devices.map(
          d => html`
            <button
              class="uc-unifi-btn ${d.deviceId === selectedId ? '' : 'secondary'}"
              type="button"
              @click=${() => {
                selectedPortByModule.set(module.id, null);
                handlers.onSelectDevice(d.deviceId);
              }}
            >
              ${d.name}
            </button>
          `
        )}
      </div>

      ${renderFaceplate(device, {
        hass,
        showLabels: true,
        animation: module.animation_intensity || 'full',
        accent: module.accent_color,
        styleVariant: module.rack_style || 'dark',
      })}

      <div class="uc-unifi-ports-grid" style="margin-top: 14px;">
        ${device.ports.map(port =>
          renderPortCard(module, hass, port, () => {
            selectedPortByModule.set(module.id, port.index);
            handlers.triggerPreviewUpdate?.();
          })
        )}
      </div>

      ${selectedPort ? renderPortDetail(module, hass, device, selectedPort, handlers) : nothing}
    </div>
  `;
}

function renderPortCard(
  module: UnifiModule,
  hass: HomeAssistant,
  port: UnifiPort,
  onSelect: () => void
): TemplateResult {
  const rxUnit = port.rxEntityId
    ? String(hass.states[port.rxEntityId]?.attributes?.unit_of_measurement || '')
    : '';
  const txUnit = port.txEntityId
    ? String(hass.states[port.txEntityId]?.attributes?.unit_of_measurement || '')
    : '';
  const rxMbps = toMbps(port.rx, rxUnit);
  const txMbps = toMbps(port.tx, txUnit);
  const color = linkSpeedColor(port.linkSpeedMbps);
  const maxRef = Math.max(port.linkSpeedMbps || 1000, 1);
  const rxPct = Math.min(100, ((rxMbps || 0) / maxRef) * 100);
  const txPct = Math.min(100, ((txMbps || 0) / maxRef) * 100);

  return html`
    <div
      class="uc-unifi-port-card ${port.up ? 'is-up' : ''}"
      style="--led: ${color};"
      @click=${onSelect}
    >
      <div class="idx">P${port.index}</div>
      <div class="name">${port.name}</div>
      <div class="meta">
        ${port.up
          ? html`${port.linkSpeedMbps != null ? `${port.linkSpeedMbps} Mbps` : 'Up'}
            ${port.poePowerW != null && port.poePowerW > 0
              ? html` · ${port.poePowerW.toFixed(1)} W`
              : nothing}`
          : 'Down'}
      </div>
      ${module.show_advanced !== false
        ? html`
            <div class="uc-unifi-bar" title="RX ${formatRate(rxMbps)}">
              <i style="width: ${rxPct}%; background: ${color};"></i>
            </div>
            <div class="uc-unifi-bar" title="TX ${formatRate(txMbps)}">
              <i style="width: ${txPct}%; background: ${color}; opacity: 0.55;"></i>
            </div>
            <div class="meta">↓ ${formatRate(rxMbps)} · ↑ ${formatRate(txMbps)}</div>
          `
        : nothing}
    </div>
  `;
}

function renderPortDetail(
  module: UnifiModule,
  hass: HomeAssistant,
  device: UnifiDevice,
  port: UnifiPort,
  handlers: PortsViewHandlers
): TemplateResult {
  const rxUnit = port.rxEntityId
    ? String(hass.states[port.rxEntityId]?.attributes?.unit_of_measurement || '')
    : '';
  const txUnit = port.txEntityId
    ? String(hass.states[port.txEntityId]?.attributes?.unit_of_measurement || '')
    : '';

  return html`
    <div class="uc-unifi-port-detail">
      <h4>${device.name} — Port ${port.index}${port.name && port.name !== `Port ${port.index}` ? ` (${port.name})` : ''}</h4>
      <div class="uc-unifi-detail-grid">
        <div>
          <div class="lbl">Link</div>
          <div>${port.up ? (port.linkSpeedMbps != null ? `${port.linkSpeedMbps} Mbps` : 'Up') : 'Down'}</div>
        </div>
        <div>
          <div class="lbl">RX</div>
          <div>${formatRate(toMbps(port.rx, rxUnit))}</div>
        </div>
        <div>
          <div class="lbl">TX</div>
          <div>${formatRate(toMbps(port.tx, txUnit))}</div>
        </div>
        <div>
          <div class="lbl">PoE</div>
          <div>
            ${port.poePowerW != null ? `${port.poePowerW.toFixed(2)} W` : '—'}
            ${port.poeOn != null ? (port.poeOn ? ' (on)' : ' (off)') : ''}
          </div>
        </div>
      </div>
      <div class="uc-unifi-detail-actions">
        ${port.poeSwitchEntityId
          ? html`
              <button
                class="uc-unifi-btn secondary"
                type="button"
                @click=${() =>
                  handlers.onTogglePoe?.(port.poeSwitchEntityId!, port.poeOn !== true)}
              >
                ${port.poeOn ? 'Disable PoE' : 'Enable PoE'}
              </button>
            `
          : nothing}
        ${port.powerCycleEntityId
          ? html`
              <button
                class="uc-unifi-btn secondary"
                type="button"
                @click=${() => handlers.onPowerCycle?.(port.powerCycleEntityId!)}
              >
                Power cycle
              </button>
            `
          : nothing}
        ${port.portEnableEntityId
          ? html`
              <button
                class="uc-unifi-btn secondary"
                type="button"
                @click=${() =>
                  handlers.onTogglePort?.(port.portEnableEntityId!, port.enabled !== true)}
              >
                ${port.enabled === false ? 'Enable port' : 'Disable port'}
              </button>
            `
          : nothing}
        <button
          class="uc-unifi-btn linkish"
          type="button"
          @click=${() => {
            selectedPortByModule.set(module.id, null);
            handlers.triggerPreviewUpdate?.();
          }}
        >
          Close
        </button>
      </div>
    </div>
  `;
}
