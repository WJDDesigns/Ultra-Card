/**
 * UniFi faceplates.
 *
 * Preferred: real product photos from Ubiquiti's public device catalog
 * (uc-unifi-device-db) with a live status footer (port LEDs, state).
 * Fallback: procedural SVG faceplates — scalable, themeable, zero assets —
 * used while the catalog loads, offline, or when photos are disabled.
 */

import { TemplateResult, html, svg, nothing } from 'lit';
import type { UnifiRackStyle } from '../../types';
import type { UnifiDevice, UnifiPort } from '../../services/uc-unifi-service';
import { linkSpeedColor, toMbps } from '../../services/uc-unifi-service';
import { ucUnifiDeviceDb } from '../../services/uc-unifi-device-db';
import { portMapForSku, type PortMap } from './port-maps';
import type { HomeAssistant } from 'custom-card-helpers';

export interface FaceplateShape {
  widthU: number;
  heightU: number;
  portRows: number;
  portsPerRow: number;
  sfpSlots: number;
  extras: Array<'display' | 'drive' | 'vents' | 'puck' | 'outlets'>;
}

export function shapeForDevice(device: UnifiDevice): FaceplateShape {
  const portCount = Math.max(device.ports.length, 0);
  const model = (device.model || '').toUpperCase();
  const heightU = device.heightU || 1;

  if (device.kind === 'ap') {
    return {
      widthU: 1,
      heightU: 1,
      portRows: 0,
      portsPerRow: 0,
      sfpSlots: 0,
      extras: ['puck'],
    };
  }

  if (device.kind === 'pdu' || device.outlets.length > 0) {
    return {
      widthU: 1,
      heightU,
      portRows: 0,
      portsPerRow: 0,
      sfpSlots: 0,
      extras: ['outlets', 'vents'],
    };
  }

  if (device.kind === 'gateway') {
    const sfp = /PRO|SE|ENTERPRISE|MAX|UDM-PRO|UXG/.test(model) ? 2 : 0;
    return {
      widthU: 1,
      heightU,
      portRows: 1,
      portsPerRow: Math.min(Math.max(portCount - sfp, 4), 8),
      sfpSlots: sfp,
      extras: ['display', 'drive', 'vents'],
    };
  }

  // Switches
  let portsPerRow = 8;
  let portRows = 1;
  let sfpSlots = 0;
  if (portCount >= 48 || /48/.test(model)) {
    portsPerRow = 24;
    portRows = 2;
    sfpSlots = /SFP|PRO|ENTERPRISE|AGG/.test(model) ? 4 : 2;
  } else if (portCount >= 24 || /24/.test(model)) {
    portsPerRow = 12;
    portRows = 2;
    sfpSlots = /SFP|PRO|ENTERPRISE/.test(model) ? 2 : 0;
  } else if (portCount >= 16 || /16/.test(model)) {
    portsPerRow = 8;
    portRows = 2;
    sfpSlots = /SFP/.test(model) ? 2 : 0;
  } else if (portCount >= 8 || /8/.test(model)) {
    portsPerRow = Math.max(portCount, 8);
    portRows = 1;
    sfpSlots = /SFP|60W|150W|PRO/.test(model) ? 2 : 0;
  } else if (portCount > 0) {
    portsPerRow = portCount;
    portRows = 1;
  }

  return {
    widthU: 1,
    heightU,
    portRows,
    portsPerRow,
    sfpSlots,
    extras: ['vents'],
  };
}

export interface FaceplateRenderOptions {
  hass?: HomeAssistant | undefined;
  showLabels?: boolean | undefined;
  animation?: 'off' | 'subtle' | 'full' | undefined;
  accent?: string | undefined;
  styleVariant?: UnifiRackStyle | undefined;
  onPortClick?: ((port: UnifiPort) => void) | undefined;
  compact?: boolean | undefined;
  /** Render real product photos when the catalog knows the model (default true). */
  useImages?: boolean | undefined;
}

/**
 * Pixel width to request from the image proxy for a given CSS render size,
 * accounting for the display's pixel ratio so photos stay sharp on retina.
 */
export function photoRequestWidth(cssWidth: number): number {
  const dpr =
    typeof window !== 'undefined' ? Math.min(3, Math.max(1, window.devicePixelRatio || 1)) : 2;
  return Math.round(Math.min(1024, cssWidth * dpr));
}

/** Product photo URL for a device, or null when unavailable / disabled. */
export function devicePhotoUrl(
  device: UnifiDevice,
  options: FaceplateRenderOptions,
  width = photoRequestWidth(700)
): string | null {
  if (options.useImages === false) return null;
  const entry = ucUnifiDeviceDb.lookup(device.model);
  if (!entry) return null;
  return ucUnifiDeviceDb.imageUrl(entry, 'nopadding', width);
}

/** Measured physical port positions for this device's product photo. */
function devicePortMap(device: UnifiDevice): PortMap | null {
  const entry = ucUnifiDeviceDb.lookup(device.model);
  return portMapForSku(entry?.sku);
}

/** Blink period (seconds) for a traffic rate — faster with more data. */
function rateBlinkMs(mbps: number): number {
  if (mbps <= 0) return 0;
  if (mbps > 500) return 0.35;
  if (mbps > 50) return 0.6;
  if (mbps > 5) return 1.0;
  return 1.8;
}

/** Live rx/tx rates for a port in Mbps. */
function portRates(port: UnifiPort, hass?: HomeAssistant): { rx: number; tx: number } {
  const rxUnit = port.rxEntityId
    ? String(hass?.states[port.rxEntityId]?.attributes?.unit_of_measurement || '')
    : '';
  const txUnit = port.txEntityId
    ? String(hass?.states[port.txEntityId]?.attributes?.unit_of_measurement || '')
    : '';
  return {
    rx: toMbps(port.rx, rxUnit) || 0,
    tx: toMbps(port.tx, txUnit) || 0,
  };
}

function portActivityMs(port: UnifiPort, hass?: HomeAssistant): number {
  const { rx, tx } = portRates(port, hass);
  return rateBlinkMs(rx + tx);
}

function chassisFill(variant: string | undefined): string {
  switch (variant) {
    case 'light':
      return '#d8dde6';
    case 'glass':
      return 'rgba(30,40,60,0.55)';
    case 'blueprint':
      return 'rgba(10,30,60,0.15)';
    default:
      return '#1a1f2a';
  }
}

function chassisStroke(variant: string | undefined): string {
  switch (variant) {
    case 'light':
      return '#9aa3b2';
    case 'glass':
      return 'rgba(120,180,255,0.35)';
    case 'blueprint':
      return '#3d8bfd';
    default:
      return '#2c3444';
  }
}

export function renderFaceplate(
  device: UnifiDevice,
  options: FaceplateRenderOptions = {}
): TemplateResult {
  if (device.kind === 'ap') {
    return renderApPuck(device, options);
  }
  if (device.kind === 'plug') {
    return renderPlugTile(device, options);
  }

  const photo = devicePhotoUrl(device, options);
  if (photo) {
    return renderPhotoUnit(device, options, photo);
  }

  const shape = shapeForDevice(device);
  if (shape.extras.includes('outlets')) {
    return renderPduFaceplate(device, shape, options);
  }
  return renderSwitchFaceplate(device, shape, options);
}

/** Live port activity LEDs shown under product photos. */
function renderMiniLedStrip(
  device: UnifiDevice,
  options: FaceplateRenderOptions
): TemplateResult | typeof nothing {
  const ports = [...device.ports].sort((a, b) => a.index - b.index);
  if (!ports.length) return nothing;
  const anim = options.animation || 'full';
  const shown = ports.slice(0, 52);
  return html`
    <span class="uc-unifi-mini-leds" aria-hidden="true">
      ${shown.map(p => {
        const color = p.up ? linkSpeedColor(p.linkSpeedMbps) : 'rgba(120,130,150,0.28)';
        const act = anim !== 'off' ? portActivityMs(p, options.hass) : 0;
        const poe = p.poeOn === true || (p.poePowerW != null && p.poePowerW > 0);
        return html`<i
          class="${act > 0 ? 'is-active' : ''} ${poe ? 'is-poe' : ''}"
          style="background:${color};${p.up ? `box-shadow:0 0 4px ${color};` : ''}${act > 0 ? `--uc-unifi-act:${act}s;` : ''}"
          title="P${p.index}${p.linkSpeedMbps ? ` · ${p.linkSpeedMbps} Mbps` : ''}"
        ></i>`;
      })}
    </span>
  `;
}

/**
 * Live lights positioned over the physical ports in the product photo,
 * matching real UniFi hardware: an Etherlighting glow emanating from the
 * port opening (colored by link speed, official console scheme), a green
 * LED blinking with receive traffic, an amber LED blinking with transmit
 * traffic, and a steady PoE bar under powered ports.
 */
function renderPortLightsOverlay(
  device: UnifiDevice,
  options: FaceplateRenderOptions,
  map: PortMap
): TemplateResult {
  const byIndex = new Map(device.ports.map(p => [p.index, p]));
  const anim = options.animation || 'full';
  return html`
    <div class="uc-unifi-port-lights" aria-hidden="true">
      ${map.cells.map(cell => {
        const port = byIndex.get(cell.index);
        if (!port) return nothing;
        const up = port.up;
        const color = linkSpeedColor(port.linkSpeedMbps);
        const { rx, tx } = up ? portRates(port, options.hass) : { rx: 0, tx: 0 };
        const rxMs = anim !== 'off' ? rateBlinkMs(rx) : 0;
        const txMs = anim !== 'off' ? rateBlinkMs(tx) : 0;
        const poe = port.poeOn === true || (port.poePowerW != null && port.poePowerW > 0);
        const pos = `left:${((cell.cx - cell.w / 2) * 100).toFixed(2)}%;top:${(cell.y * 100).toFixed(2)}%;width:${(cell.w * 100).toFixed(2)}%;height:${(cell.h * 100).toFixed(2)}%;`;
        return html`
          <span
            class="uc-unifi-port-light ${up ? 'is-up' : 'is-down'} kind-${cell.kind}"
            style="${pos}${up ? `--plc:${color};` : ''}"
            title="P${port.index}${port.linkSpeedMbps ? ` · ${port.linkSpeedMbps} Mbps` : ''}${poe && port.poePowerW != null ? ` · ${port.poePowerW} W` : ''}"
          >
            ${up
              ? html`
                  <i class="glow"></i>
                  <i
                    class="led-rx ${rxMs > 0 ? 'is-active' : ''}"
                    style="${rxMs > 0 ? `--uc-unifi-act:${rxMs}s;` : ''}"
                  ></i>
                  <i
                    class="led-tx ${txMs > 0 ? 'is-active' : ''}"
                    style="${txMs > 0 ? `--uc-unifi-act:${txMs}s;` : ''}"
                  ></i>
                `
              : nothing}
            ${poe ? html`<i class="led-poe"></i>` : nothing}
          </span>
        `;
      })}
    </div>
  `;
}

/**
 * Rack unit rendered from a real front-panel product photo. When the port
 * geometry of the model is known, live lights sit on the physical ports;
 * otherwise a small LED strip renders beneath the photo (never on top of it).
 */
function renderPhotoUnit(
  device: UnifiDevice,
  options: FaceplateRenderOptions,
  photoUrl: string
): TemplateResult {
  const up = device.state === 'connected' || device.state === undefined;
  const upPorts = device.ports.filter(p => p.up).length;
  const map = device.ports.length ? devicePortMap(device) : null;
  return html`
    <div class="uc-unifi-photo-unit" data-device="${device.deviceId}" data-kind="${device.kind}">
      <div class="uc-unifi-photo-stage">
        <div class="uc-unifi-photo-frame">
          <img
            class="uc-unifi-photo-img"
            src="${photoUrl}"
            alt="${device.model || device.name}"
            loading="lazy"
            draggable="false"
            @error=${(e: Event) => {
              // Photo failed (offline / CDN change) — hide it; footer still shows.
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          ${map ? renderPortLightsOverlay(device, options, map) : nothing}
        </div>
        ${!map && device.ports.length
          ? html`<div class="uc-unifi-photo-strip">${renderMiniLedStrip(device, options)}</div>`
          : nothing}
      </div>
      <div class="uc-unifi-photo-footer">
        <span class="nm">${device.name}</span>
        <span class="meta">
          ${device.ports.length ? html`<span class="ports">${upPorts}/${device.ports.length}</span>` : nothing}
          ${device.state
            ? html`<span class="state ${up ? 'ok' : 'bad'}">${device.state}</span>`
            : nothing}
        </span>
      </div>
    </div>
  `;
}

/** Smart plug / in-wall outlet tile (photo when available, glyph otherwise). */
function renderPlugTile(device: UnifiDevice, options: FaceplateRenderOptions): TemplateResult {
  const photo = devicePhotoUrl(device, options, photoRequestWidth(96));
  const outlet = device.outlets[0];
  const on = outlet ? outlet.on === true || ((outlet.powerW ?? 0) > 0) : device.state === 'connected';
  const watts = outlet?.powerW ?? device.acPowerConsumptionW;
  return html`
    <div class="uc-unifi-plug-tile ${on ? 'is-on' : ''}" data-device="${device.deviceId}">
      ${photo
        ? html`<img class="uc-unifi-plug-img" src="${photo}" alt="${device.model || device.name}" loading="lazy" draggable="false" />`
        : html`<ha-icon icon="mdi:power-plug-outline"></ha-icon>`}
      <div class="uc-unifi-ap-label">${device.name}</div>
      <div class="uc-unifi-ap-meta">
        ${watts != null ? `${watts.toFixed(1)} W` : on ? 'on' : 'off'}
      </div>
    </div>
  `;
}

function renderApPuck(device: UnifiDevice, options: FaceplateRenderOptions): TemplateResult {
  const util = device.cpuPct ?? (device.clients != null ? Math.min(100, device.clients * 4) : 0);
  const clients = device.clients ?? 0;
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = `${(util / 100) * circ} ${circ}`;
  const anim = options.animation || 'full';
  const accent = options.accent || '#00e5ff';
  const photo = devicePhotoUrl(device, options, photoRequestWidth(128));

  return html`
    <div class="uc-unifi-ap-puck" style="--ring-pct: ${util}; --accent: ${accent};">
      <div class="uc-unifi-ap-stage">
        ${photo
          ? html`<img
              class="uc-unifi-ap-photo"
              src="${photo}"
              alt="${device.model || device.name}"
              loading="lazy"
              draggable="false"
              @error=${(e: Event) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />`
          : nothing}
        <svg viewBox="0 0 100 100" class="uc-unifi-ap-svg" aria-hidden="true">
          ${!photo
            ? svg`
              <circle cx="50" cy="50" r="42" fill="${chassisFill(options.styleVariant)}" stroke="${chassisStroke(options.styleVariant)}" stroke-width="2" />
              <text x="50" y="46" text-anchor="middle" fill="currentColor" font-size="11" font-weight="700">UniFi</text>
              <text x="50" y="60" text-anchor="middle" fill="currentColor" font-size="9" opacity="0.7">${clients} cli</text>
            `
            : nothing}
          <circle
            class="uc-unifi-ring-track"
            cx="50"
            cy="50"
            r="${r}"
            fill="none"
            stroke="rgba(127,140,160,0.18)"
            stroke-width="4.5"
          />
          <circle
            class="uc-unifi-ring-value ${anim !== 'off' ? 'uc-unifi-ring-spin' : ''}"
            cx="50"
            cy="50"
            r="${r}"
            fill="none"
            stroke="${accent}"
            stroke-width="4.5"
            stroke-linecap="round"
            stroke-dasharray="${dash}"
            transform="rotate(-90 50 50)"
          />
        </svg>
      </div>
      <div class="uc-unifi-ap-label">${device.name}</div>
      ${options.showLabels && device.clients != null
        ? html`<div class="uc-unifi-ap-meta">${device.clients} clients${device.cpuPct != null ? ` · ${Math.round(device.cpuPct)}% CPU` : ''}</div>`
        : nothing}
    </div>
  `;
}

function renderPduFaceplate(
  device: UnifiDevice,
  shape: FaceplateShape,
  options: FaceplateRenderOptions
): TemplateResult {
  const outlets = device.outlets.length
    ? device.outlets
    : Array.from({ length: 8 }, (_, i) => ({
        index: i + 1,
        name: `Outlet ${i + 1}`,
        powerW: null,
        on: null,
      }));
  const w = 520;
  const h = 56 * shape.heightU;

  return html`
    <div class="uc-unifi-faceplate uc-unifi-pdu" data-device="${device.deviceId}">
      <svg viewBox="0 0 ${w} ${h}" class="uc-unifi-fp-svg" preserveAspectRatio="xMidYMid meet">
        <rect
          x="1"
          y="1"
          width="${w - 2}"
          height="${h - 2}"
          rx="4"
          fill="${chassisFill(options.styleVariant)}"
          stroke="${chassisStroke(options.styleVariant)}"
          stroke-width="1.5"
        />
        ${renderScrews(w, h)}
        ${outlets.map((o, i) => {
          const x = 28 + i * 58;
          const on = o.on === true || (o.powerW != null && o.powerW > 0);
          return svg`
            <g transform="translate(${x}, ${h / 2 - 10})">
              <rect width="36" height="20" rx="3" fill="${on ? '#2a3a28' : '#11151c'}" stroke="${on ? '#69f0ae' : '#3a4455'}" />
              <circle cx="10" cy="10" r="3" fill="${on ? '#69f0ae' : '#445'}" />
              <circle cx="26" cy="10" r="3" fill="${on ? '#69f0ae' : '#445'}" />
            </g>
          `;
        })}
        <text x="16" y="${h - 8}" fill="currentColor" font-size="9" opacity="0.65">${device.name}</text>
        ${device.acPowerConsumptionW != null
          ? svg`<text x="${w - 16}" y="${h - 8}" text-anchor="end" fill="#ffd740" font-size="9">${device.acPowerConsumptionW.toFixed(0)} W</text>`
          : nothing}
      </svg>
    </div>
  `;
}

function renderScrews(w: number, h: number) {
  const positions = [
    [8, 8],
    [w - 8, 8],
    [8, h - 8],
    [w - 8, h - 8],
  ];
  return positions.map(
    ([x, y]) => svg`
      <circle cx="${x}" cy="${y}" r="2.2" fill="#0d1118" stroke="#3a4458" stroke-width="0.8" />
      <line x1="${x - 1.4}" y1="${y}" x2="${x + 1.4}" y2="${y}" stroke="#556" stroke-width="0.6" />
    `
  );
}

function renderSwitchFaceplate(
  device: UnifiDevice,
  shape: FaceplateShape,
  options: FaceplateRenderOptions
): TemplateResult {
  const w = 560;
  const h = 64 * Math.max(1, shape.heightU);
  const ports = [...device.ports].sort((a, b) => a.index - b.index);
  const totalSlots = shape.portRows * shape.portsPerRow;
  const anim = options.animation || 'full';
  const hasDisplay = shape.extras.includes('display');
  const hasDrive = shape.extras.includes('drive');

  // Layout: optional display left, ports center, SFP right
  const leftPad = hasDisplay ? 88 : 28;
  const rightPad = shape.sfpSlots > 0 ? 16 + shape.sfpSlots * 22 : 20;
  const portAreaW = w - leftPad - rightPad;
  const rowH = shape.portRows > 1 ? 18 : 22;
  const startY = shape.portRows > 1 ? h / 2 - rowH - 2 : h / 2 - rowH / 2;

  const upCount = ports.filter(p => p.up).length;

  return html`
    <div
      class="uc-unifi-faceplate uc-unifi-switch ${device.kind === 'gateway' ? 'is-gateway' : ''}"
      data-device="${device.deviceId}"
      data-kind="${device.kind}"
    >
      <svg viewBox="0 0 ${w} ${h}" class="uc-unifi-fp-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fp-shine-${device.deviceId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,255,255,0.08)" />
            <stop offset="100%" stop-color="rgba(0,0,0,0.25)" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="${w - 2}"
          height="${h - 2}"
          rx="5"
          fill="${chassisFill(options.styleVariant)}"
          stroke="${chassisStroke(options.styleVariant)}"
          stroke-width="${options.styleVariant === 'blueprint' ? 1 : 1.5}"
          stroke-dasharray="${options.styleVariant === 'blueprint' ? '4 3' : 'none'}"
        />
        <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="5" fill="url(#fp-shine-${device.deviceId})" />
        ${renderScrews(w, h)}

        ${hasDisplay
          ? svg`
            <g transform="translate(14, ${h / 2 - 16})">
              <rect width="64" height="32" rx="3" fill="#0a1020" stroke="#1e90ff" stroke-width="1" />
              <text x="32" y="13" text-anchor="middle" fill="#4fc3f7" font-size="7" font-family="monospace">${upCount} PORTS</text>
              <text x="32" y="24" text-anchor="middle" fill="#4fc3f7" font-size="7" font-family="monospace">UP</text>
              <rect x="8" y="27" width="${Math.min(48, (upCount / Math.max(1, ports.length)) * 48)}" height="2" fill="#2979ff" />
            </g>
          `
          : nothing}

        ${hasDrive
          ? svg`
            <g transform="translate(${w - 70}, ${h / 2 - 10})">
              <rect width="48" height="20" rx="2" fill="#12161e" stroke="#333a48" />
              <circle cx="40" cy="10" r="2" fill="${device.state === 'connected' ? '#69f0ae' : '#f44336'}" />
            </g>
          `
          : nothing}

        ${Array.from({ length: shape.portRows }).map((_, row) => {
          const y = startY + row * (rowH + 4);
          return Array.from({ length: shape.portsPerRow }).map((__, col) => {
            const idx = row * shape.portsPerRow + col;
            const port = ports[idx];
            const x = leftPad + (col + 0.5) * (portAreaW / shape.portsPerRow) - 7;
            return renderPortLed(port, x, y, rowH, anim, options, idx + 1);
          });
        })}

        ${shape.sfpSlots > 0
          ? Array.from({ length: shape.sfpSlots }).map((_, i) => {
              const sfpPort = ports[totalSlots + i] || ports.find(p => /sfp/i.test(p.name));
              const x = w - rightPad + 4 + i * 20;
              const y = h / 2 - 8;
              const up = sfpPort?.up ?? false;
              const color = sfpPort ? linkSpeedColor(sfpPort.linkSpeedMbps) : '#334';
              return svg`
                <g transform="translate(${x}, ${y})">
                  <rect width="16" height="16" rx="2" fill="#0d1118" stroke="${up ? color : '#3a4455'}" stroke-width="1.2" />
                  <rect x="3" y="4" width="10" height="8" rx="1" fill="${up ? color : '#222'}" opacity="0.85" />
                </g>
              `;
            })
          : nothing}

        <text x="18" y="${h - 6}" fill="currentColor" font-size="8" opacity="0.55">${device.model || device.kind}</text>
        <text x="${w / 2}" y="${h - 6}" text-anchor="middle" fill="currentColor" font-size="9" font-weight="600" opacity="0.85">${device.name}</text>
        ${device.state
          ? svg`<text x="${w - 18}" y="${h - 6}" text-anchor="end" fill="${device.state === 'connected' ? '#69f0ae' : '#ff8a65'}" font-size="8">${device.state}</text>`
          : nothing}
      </svg>
    </div>
  `;
}

function renderPortLed(
  port: UnifiPort | undefined,
  x: number,
  y: number,
  h: number,
  anim: string,
  options: FaceplateRenderOptions,
  fallbackIndex: number
) {
  if (!port) {
    return svg`
      <g transform="translate(${x}, ${y})" opacity="0.25">
        <rect width="14" height="${h}" rx="2" fill="#0d1118" stroke="#2a3140" />
      </g>
    `;
  }
  const color = port.up
    ? options.accent && port.linkSpeedMbps && port.linkSpeedMbps >= 1000
      ? options.accent
      : linkSpeedColor(port.linkSpeedMbps)
    : 'rgba(80,90,110,0.4)';
  const act = portActivityMs(port, options.hass);
  const poe = port.poeOn === true || (port.poePowerW != null && port.poePowerW > 0);
  const style =
    act > 0 && anim !== 'off'
      ? `--uc-unifi-act: ${act}s; filter: drop-shadow(0 0 3px ${color})`
      : port.up
        ? `filter: drop-shadow(0 0 2px ${color})`
        : '';

  return svg`
    <g
      class="uc-unifi-port ${port.up ? 'is-up' : 'is-down'} ${act > 0 && anim !== 'off' ? 'is-active' : ''} ${poe ? 'is-poe' : ''}"
      transform="translate(${x}, ${y})"
      style="${style}"
      data-port="${port.index}"
    >
      <rect width="14" height="${h}" rx="2" fill="#0a0e14" stroke="${color}" stroke-width="${port.up ? 1.4 : 0.8}" />
      <rect class="uc-unifi-port-led" x="3" y="3" width="8" height="${h - 6}" rx="1" fill="${color}" />
      ${poe
        ? svg`<circle cx="7" cy="${h - 3}" r="1.6" fill="#ffd740" class="uc-unifi-poe-dot" />`
        : nothing}
      ${options.showLabels
        ? svg`<title>P${port.index} ${port.name}${port.linkSpeedMbps ? ` · ${port.linkSpeedMbps} Mbps` : ''}${poe && port.poePowerW != null ? ` · ${port.poePowerW} W` : ''}</title>`
        : svg`<title>P${port.index || fallbackIndex}</title>`}
    </g>
  `;
}
