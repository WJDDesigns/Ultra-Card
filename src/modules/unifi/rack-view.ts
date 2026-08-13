/**
 * Virtual 19" rack view. Reordering lives in the editor's "Rack order"
 * section — the live card is display-only (click opens more-info).
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UnifiModule } from '../../types';
import type { UnifiDevice, UnifiTopology } from '../../services/uc-unifi-service';
import { orderDevices } from '../../services/uc-unifi-service';
import { renderFaceplate } from './faceplates';

/** Kinds that mount in the rack stack. APs get their own shelf; plugs,
 * cameras, and unclassified gear never appear in the rack view. */
const RACK_KINDS = new Set(['gateway', 'switch', 'pdu', 'nvr']);

export interface RackViewHandlers {
  onDeviceClick?: (device: UnifiDevice) => void;
}

export function renderRackView(
  module: UnifiModule,
  hass: HomeAssistant,
  topology: UnifiTopology,
  handlers: RackViewHandlers
): TemplateResult {
  const devices = orderDevices(topology.devices, module.device_order, module.hidden_device_ids);
  const overrides = new Map((module.device_overrides || []).map(o => [o.device_id, o]));
  const rackDevices = devices.filter(d => RACK_KINDS.has(d.kind));
  const aps = devices.filter(d => d.kind === 'ap');
  const style = module.rack_style || 'dark';
  const anim = module.animation_intensity || 'full';
  const useImages = module.use_device_images !== false;

  const applyOverride = (d: UnifiDevice): UnifiDevice => {
    const o = overrides.get(d.deviceId);
    if (!o) return d;
    return {
      ...d,
      name: o.name || d.name,
      heightU: o.height_u || d.heightU,
    };
  };

  return html`
    <div class="uc-unifi-rack style-${style}">
      <div class="uc-unifi-rack-stack">
        ${rackDevices.length === 0
          ? html`<div class="uc-unifi-empty">No rack-mount UniFi devices discovered yet.</div>`
          : rackDevices.map(raw => {
              const d = applyOverride(raw);
              const o = overrides.get(d.deviceId);
              return html`
                <div
                  class="uc-unifi-rack-unit"
                  data-device-id=${d.deviceId}
                  @click=${() => handlers.onDeviceClick?.(d)}
                >
                  ${renderFaceplate(d, {
                    hass,
                    showLabels: module.show_port_labels !== false,
                    animation: anim,
                    accent: o?.accent_color || module.accent_color,
                    styleVariant: style,
                    useImages,
                  })}
                </div>
              `;
            })}
      </div>

      ${aps.length
        ? html`
            <div class="uc-unifi-rack-aps">
              ${aps.map(raw => {
                const d = applyOverride(raw);
                const o = overrides.get(d.deviceId);
                return html`
                  <div @click=${() => handlers.onDeviceClick?.(d)}>
                    ${renderFaceplate(d, {
                      hass,
                      showLabels: true,
                      animation: anim,
                      accent: o?.accent_color || module.accent_color,
                      styleVariant: style,
                      useImages,
                    })}
                  </div>
                `;
              })}
            </div>
          `
        : nothing}
    </div>
  `;
}
