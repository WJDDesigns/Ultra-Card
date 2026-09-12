/**
 * Shared Lit widgets for Bambu Lab + generic 3D Printer modules.
 * Every widget that shows an entity value is clickable → HA more-info.
 */

import { TemplateResult, html, nothing, svg } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import {
  PrinterSnapshot,
  PrinterTray,
  PrinterFan,
  PrinterStatus,
  formatEta,
  formatTimestamp,
  statusColor,
  statusLabel,
  isHeating,
  fireMoreInfo,
} from './printer-state';

export interface ControlHandlers {
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onLight?: () => void;
  onSpeed?: (profile: string) => void;
  onFan?: (fan: PrinterFan, percent: number) => void;
  onNozzleTarget?: (temp: number) => void;
  onBedTarget?: (temp: number) => void;
  onMoreInfo?: (entityId: string) => void;
}

function clampPct(n: number | null | undefined): number {
  if (n == null || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/** Returns click handler + class when an entity is available. */
function clickable(entityId: string | undefined): {
  cls: string;
  handler: ((e: Event) => void) | undefined;
  role: string | typeof nothing;
  tabindex: string | typeof nothing;
} {
  if (!entityId) return { cls: '', handler: undefined, role: nothing, tabindex: nothing };
  return {
    cls: 'is-clickable',
    handler: (e: Event) => fireMoreInfo(e, entityId),
    role: 'button',
    tabindex: '0',
  };
}

function onKeyActivate(handler: ((e: Event) => void) | undefined) {
  if (!handler) return undefined;
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler(e);
    }
  };
}

export function renderStatusPill(
  status: PrinterStatus,
  raw?: string,
  entityId?: string
): TemplateResult {
  const color = statusColor(status);
  const label = raw && status === 'unknown' ? raw : statusLabel(status);
  const c = clickable(entityId);
  return html`
    <span
      class="uc-printer-status-pill ${c.cls}"
      style="--uc-status-color: ${color}"
      role=${c.role}
      tabindex=${c.tabindex}
      @click=${c.handler}
      @keydown=${onKeyActivate(c.handler)}
    >
      <span class="dot"></span>${label}
    </span>
  `;
}

export function renderProgressBar(
  progress: number | null,
  opts: { showLabel?: boolean; compact?: boolean; entityId?: string | undefined } = {}
): TemplateResult {
  const pct = clampPct(progress);
  const c = clickable(opts.entityId);
  return html`
    <div
      class="uc-printer-progress-bar ${opts.compact ? 'compact' : ''} ${c.cls}"
      role=${c.role}
      tabindex=${c.tabindex}
      @click=${c.handler}
      @keydown=${onKeyActivate(c.handler)}
    >
      <div class="track">
        <div class="fill" style="width: ${pct}%"></div>
      </div>
      ${opts.showLabel !== false
        ? html`<span class="pct">${progress == null ? '—' : `${Math.round(pct)}%`}</span>`
        : nothing}
    </div>
  `;
}

export function renderProgressRing(
  progress: number | null,
  size = 56,
  stroke = 5,
  entityId?: string
): TemplateResult {
  const pct = clampPct(progress);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const ck = clickable(entityId);
  return html`
    <div
      class="uc-printer-progress-ring ${ck.cls}"
      style="width:${size}px;height:${size}px;"
      role=${ck.role}
      tabindex=${ck.tabindex}
      @click=${ck.handler}
      @keydown=${onKeyActivate(ck.handler)}
    >
      ${svg`
        <svg viewBox="0 0 ${size} ${size}" width=${size} height=${size}>
          <circle
            cx=${size / 2}
            cy=${size / 2}
            r=${r}
            fill="none"
            stroke="rgba(127,127,127,0.22)"
            stroke-width=${stroke}
          />
          <circle
            class="ring-fill"
            cx=${size / 2}
            cy=${size / 2}
            r=${r}
            fill="none"
            stroke="var(--primary-color, #03a9f4)"
            stroke-width=${stroke}
            stroke-linecap="round"
            stroke-dasharray=${c}
            stroke-dashoffset=${offset}
            transform="rotate(-90 ${size / 2} ${size / 2})"
          />
        </svg>
      `}
      <span class="ring-label">${progress == null ? '—' : `${Math.round(pct)}%`}</span>
    </div>
  `;
}

export function renderTempChip(
  label: string,
  current: number | null,
  target: number | null,
  opts: { icon?: string; accent?: string; entityId?: string | undefined } = {}
): TemplateResult {
  const heating = isHeating(current, target);
  const cur = current == null ? '—' : `${Math.round(current)}°`;
  const tgt = target != null && target > 0 ? ` / ${Math.round(target)}°` : '';
  const c = clickable(opts.entityId);
  return html`
    <div
      class="uc-printer-temp-chip ${heating ? 'heating' : ''} ${c.cls}"
      style=${opts.accent ? `--uc-temp-accent: ${opts.accent}` : nothing}
      role=${c.role}
      tabindex=${c.tabindex}
      @click=${c.handler}
      @keydown=${onKeyActivate(c.handler)}
    >
      ${opts.icon
        ? html`<ha-icon .icon=${opts.icon}></ha-icon>`
        : html`<span class="temp-label">${label}</span>`}
      <span class="temp-value">${cur}<span class="temp-target">${tgt}</span></span>
      ${opts.icon ? html`<span class="temp-sub">${label}</span>` : nothing}
    </div>
  `;
}

export function renderStatTile(
  label: string,
  value: string,
  opts: { icon?: string; accent?: string; entityId?: string | undefined } = {}
): TemplateResult {
  const c = clickable(opts.entityId);
  return html`
    <div
      class="uc-printer-stat ${c.cls}"
      style=${opts.accent ? `--uc-stat-accent: ${opts.accent}` : nothing}
      role=${c.role}
      tabindex=${c.tabindex}
      @click=${c.handler}
      @keydown=${onKeyActivate(c.handler)}
    >
      ${opts.icon ? html`<ha-icon .icon=${opts.icon}></ha-icon>` : nothing}
      <div class="stat-body">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>
  `;
}

/** Spool ring: colored disc + remain arc + material label. */
export function renderSpoolRing(
  tray: PrinterTray,
  opts: { size?: number; showLabel?: boolean } = {}
): TemplateResult {
  const size = opts.size ?? 44;
  const remain = tray.remain != null && tray.remain >= 0 ? clampPct(tray.remain) : null;
  const color = tray.empty ? 'rgba(127,127,127,0.25)' : tray.color || '#888888';
  const r = size * 0.38;
  const c = 2 * Math.PI * r;
  const offset = remain == null ? 0 : c - (remain / 100) * c;
  const ck = clickable(tray.entityId);
  return html`
    <div
      class="uc-printer-spool ${tray.active ? 'active' : ''} ${tray.empty ? 'empty' : ''} ${ck.cls}"
      title=${tray.name || tray.type || `Slot ${tray.slot}`}
      style="--spool-color: ${color}; width:${size}px;"
      role=${ck.role}
      tabindex=${ck.tabindex}
      @click=${ck.handler}
      @keydown=${onKeyActivate(ck.handler)}
    >
      ${svg`
        <svg viewBox="0 0 ${size} ${size}" width=${size} height=${size}>
          <circle cx=${size / 2} cy=${size / 2} r=${r} fill=${color} opacity="0.9" />
          <circle
            cx=${size / 2}
            cy=${size / 2}
            r=${r * 0.35}
            fill="var(--uc-printer-surface, var(--card-background-color, #1a1a1a))"
          />
          ${remain != null
            ? svg`
                <circle
                  cx=${size / 2}
                  cy=${size / 2}
                  r=${r + 3}
                  fill="none"
                  stroke="rgba(127,127,127,0.2)"
                  stroke-width="3"
                />
                <circle
                  cx=${size / 2}
                  cy=${size / 2}
                  r=${r + 3}
                  fill="none"
                  stroke=${color}
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-dasharray=${c}
                  stroke-dashoffset=${offset}
                  transform="rotate(-90 ${size / 2} ${size / 2})"
                />
              `
            : nothing}
        </svg>
      `}
      ${opts.showLabel !== false
        ? html`<span class="spool-label">${tray.empty ? 'Empty' : tray.type || tray.name || '—'}</span>`
        : nothing}
      ${tray.active ? html`<span class="spool-active-dot"></span>` : nothing}
    </div>
  `;
}

export function renderAmsStrip(
  trays: PrinterTray[],
  opts: { size?: number; humidity?: number | null } = {}
): TemplateResult {
  if (!trays.length) return html``;
  return html`
    <div class="uc-printer-ams-strip">
      ${trays.map(t => renderSpoolRing(t, { size: opts.size ?? 40 }))}
      ${opts.humidity != null
        ? html`<span class="ams-humidity" title="Humidity index">
            <ha-icon icon="mdi:water-percent"></ha-icon>${opts.humidity}
          </span>`
        : nothing}
    </div>
  `;
}

export function renderPrintJob(
  snap: PrinterSnapshot,
  hass?: HomeAssistant | null,
  opts: { showThumbnail?: boolean } = {}
): TemplateResult {
  const layer =
    snap.currentLayer != null && snap.totalLayers != null
      ? `${snap.currentLayer} / ${snap.totalLayers}`
      : snap.currentLayer != null
        ? String(snap.currentLayer)
        : '—';
  let thumb: string | undefined;
  if (opts.showThumbnail !== false && snap.coverImageEntityId && hass) {
    const st = hass.states[snap.coverImageEntityId];
    thumb = st?.attributes?.entity_picture as string | undefined;
  }
  const nameClick = clickable(snap.refs.taskName);
  const layerClick = clickable(snap.refs.layer);
  const etaClick = clickable(snap.refs.remaining);
  const endClick = clickable(snap.refs.endTime);
  const thumbClick = clickable(snap.coverImageEntityId);
  return html`
    <div class="uc-printer-job">
      ${thumb
        ? html`<img
            class="job-thumb ${thumbClick.cls}"
            src=${thumb}
            alt=""
            loading="lazy"
            @click=${thumbClick.handler}
          />`
        : nothing}
      <div class="job-meta">
        <div class="job-name ${nameClick.cls}" @click=${nameClick.handler}>
          ${snap.taskName || snap.fileName || '—'}
        </div>
        <div class="job-row">
          <span class=${layerClick.cls} @click=${layerClick.handler}>Layer ${layer}</span>
          <span class=${etaClick.cls} @click=${etaClick.handler}>
            ${formatEta(snap.remainingMinutes)} left
          </span>
          ${snap.endTime
            ? html`<span class=${endClick.cls} @click=${endClick.handler}>
                ETA ${formatTimestamp(snap.endTime)}
              </span>`
            : nothing}
        </div>
      </div>
    </div>
  `;
}

export function renderControlsRow(
  snap: PrinterSnapshot,
  handlers: ControlHandlers,
  opts: { confirmStop?: boolean; showSpeed?: boolean; showLight?: boolean } = {}
): TemplateResult {
  const printing = snap.status === 'printing' || snap.status === 'preparing';
  const paused = snap.status === 'paused';
  const canStop = printing || paused;
  const speeds = ['silent', 'standard', 'sport', 'ludicrous'];

  const stop = () => {
    if (opts.confirmStop !== false) {
      if (!window.confirm('Stop the current print?')) return;
    }
    handlers.onStop?.();
  };

  return html`
    <div class="uc-printer-controls">
      ${snap.controls.pauseEntityId
        ? html`<button
            class="ctrl"
            ?disabled=${!printing}
            title="Pause"
            @click=${() => handlers.onPause?.()}
          >
            <ha-icon icon="mdi:pause"></ha-icon>
          </button>`
        : nothing}
      ${snap.controls.resumeEntityId
        ? html`<button
            class="ctrl"
            ?disabled=${!paused}
            title="Resume"
            @click=${() => handlers.onResume?.()}
          >
            <ha-icon icon="mdi:play"></ha-icon>
          </button>`
        : nothing}
      ${snap.controls.stopEntityId
        ? html`<button
            class="ctrl danger"
            ?disabled=${!canStop}
            title="Stop"
            @click=${stop}
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </button>`
        : nothing}
      ${opts.showLight !== false && snap.controls.lightEntityId
        ? html`<button
            class="ctrl ${snap.lightOn ? 'on' : ''}"
            title="Chamber light"
            @click=${() => handlers.onLight?.()}
            @contextmenu=${(e: Event) => {
              e.preventDefault();
              fireMoreInfo(e, snap.controls.lightEntityId);
            }}
          >
            <ha-icon icon="mdi:lightbulb"></ha-icon>
          </button>`
        : nothing}
      ${opts.showSpeed !== false && snap.controls.speedEntityId
        ? html`<div class="speed-group">
            ${speeds.map(
              s => html`<button
                class="ctrl speed ${snap.speedProfile === s ? 'active' : ''}"
                title=${s}
                @click=${() => handlers.onSpeed?.(s)}
              >
                ${s === 'silent'
                  ? html`<ha-icon icon="mdi:turtle"></ha-icon>`
                  : s === 'standard'
                    ? html`<ha-icon icon="mdi:speedometer-medium"></ha-icon>`
                    : s === 'sport'
                      ? html`<ha-icon icon="mdi:speedometer"></ha-icon>`
                      : html`<ha-icon icon="mdi:rocket-launch"></ha-icon>`}
              </button>`
            )}
          </div>`
        : nothing}
    </div>
  `;
}

export function renderFanRow(
  fans: PrinterFan[],
  handlers: ControlHandlers,
  opts: { editable?: boolean } = {}
): TemplateResult {
  if (!fans.length) return html``;
  return html`
    <div class="uc-printer-fans">
      ${fans.map(f => {
        const pct = clampPct(f.percent);
        const c = clickable(f.entityId);
        return html`
          <div
            class="fan-row ${c.cls}"
            role=${c.role}
            tabindex=${c.tabindex}
            @click=${c.handler}
            @keydown=${onKeyActivate(c.handler)}
          >
            <span
              class="fan-icon-wrap ${pct > 0 ? 'spinning' : ''}"
              style=${pct > 0 ? `--fan-duration: ${Math.max(0.4, 2.6 - pct / 45)}s` : nothing}
            >
              <ha-icon icon="mdi:fan"></ha-icon>
            </span>
            <span class="fan-label">${f.label}</span>
            <div class="fan-bar"><div class="fill" style="width:${pct}%"></div></div>
            <span class="fan-pct">${f.percent == null ? '—' : `${Math.round(pct)}%`}</span>
            ${opts.editable && f.controllable
              ? html`<input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  .value=${String(pct)}
                  @click=${(e: Event) => e.stopPropagation()}
                  @change=${(e: Event) => {
                    e.stopPropagation();
                    const v = parseInt((e.target as HTMLInputElement).value, 10);
                    handlers.onFan?.(f, v);
                  }}
                />`
              : nothing}
          </div>
        `;
      })}
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* Camera snapshot element (self-refreshing)                                   */
/* -------------------------------------------------------------------------- */

/**
 * `<uc-printer-snapshot>` — an <img> that refreshes itself on an interval.
 * HA signs camera snapshot URLs into `entity_picture`
 * (`/api/camera_proxy/<id>?token=…`); we append a cache-buster.
 */
class UcPrinterSnapshot extends HTMLElement {
  private _img: HTMLImageElement;
  private _timer: number | undefined;
  private _base = '';
  private _refresh = 10;

  constructor() {
    super();
    this._img = document.createElement('img');
    this._img.alt = '';
    this._img.loading = 'lazy';
    this._img.decoding = 'async';
    this._img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    this._img.addEventListener('error', () => this.classList.add('is-error'));
    this._img.addEventListener('load', () => this.classList.remove('is-error'));
  }

  set base(v: string) {
    if (v === this._base) return;
    this._base = v;
    this._paint();
  }

  set refresh(v: number) {
    const next = Math.max(1, Number(v) || 10);
    if (next === this._refresh) return;
    this._refresh = next;
    this._arm();
  }

  connectedCallback() {
    if (!this._img.isConnected) this.appendChild(this._img);
    this._paint();
    this._arm();
  }

  disconnectedCallback() {
    if (this._timer) window.clearInterval(this._timer);
    this._timer = undefined;
  }

  private _arm() {
    if (this._timer) window.clearInterval(this._timer);
    if (!this.isConnected) return;
    this._timer = window.setInterval(() => this._paint(), this._refresh * 1000);
  }

  private _paint() {
    if (!this._base) return;
    const sep = this._base.includes('?') ? '&' : '?';
    this._img.src = `${this._base}${sep}_uc=${Date.now()}`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('uc-printer-snapshot')) {
  customElements.define('uc-printer-snapshot', UcPrinterSnapshot);
}

/** Resolve a signed snapshot URL for a camera/image entity. */
export function cameraSnapshotUrl(
  hass: HomeAssistant | undefined | null,
  entityId: string | undefined
): string | undefined {
  if (!hass || !entityId) return undefined;
  const st = hass.states[entityId];
  if (!st) return undefined;
  const pic = st.attributes?.entity_picture as string | undefined;
  if (pic) return pic;
  const domain = entityId.split('.')[0];
  if (domain === 'camera') {
    const token = st.attributes?.access_token as string | undefined;
    return token
      ? `/api/camera_proxy/${entityId}?token=${encodeURIComponent(token)}`
      : `/api/camera_proxy/${entityId}`;
  }
  return undefined;
}

export function renderCameraFeed(
  hass: HomeAssistant | undefined | null,
  entityId: string | undefined,
  opts: {
    refreshSeconds?: number | undefined;
    alt?: string | undefined;
    fill?: boolean;
    /** 'live' uses HA's ha-camera-stream (WebRTC/HLS/MJPEG); default polls snapshots. */
    mode?: 'snapshot' | 'live' | undefined;
  } = {}
): TemplateResult {
  const fillCls = opts.fill ? 'fill' : '';
  if (!hass || !entityId) {
    return html`<div class="uc-printer-camera empty ${fillCls}">
      <ha-icon icon="mdi:cctv-off"></ha-icon><span>No camera</span>
    </div>`;
  }
  const st = hass.states[entityId];
  const src = cameraSnapshotUrl(hass, entityId);
  const c = clickable(entityId);
  if (!st || !src) {
    return html`<div
      class="uc-printer-camera empty ${fillCls} ${c.cls}"
      role=${c.role}
      tabindex=${c.tabindex}
      @click=${c.handler}
      @keydown=${onKeyActivate(c.handler)}
    >
      <ha-icon icon="mdi:cctv-off"></ha-icon><span>Camera unavailable</span>
    </div>`;
  }
  // Live streaming only applies to camera.* entities; image.* has no stream.
  const live = opts.mode === 'live' && entityId.startsWith('camera.');
  return html`
    <div
      class="uc-printer-camera ${fillCls} ${live ? 'live' : ''} ${c.cls}"
      title=${opts.alt || 'Open camera'}
      role=${c.role}
      tabindex=${c.tabindex}
      @click=${c.handler}
      @keydown=${onKeyActivate(c.handler)}
    >
      ${live
        ? html`<ha-camera-stream
            .hass=${hass}
            .stateObj=${st}
            .fitMode=${'cover'}
            .muted=${true}
            .controls=${false}
          ></ha-camera-stream>
            <span class="cam-live"><span class="dot"></span>LIVE</span>`
        : html`<uc-printer-snapshot
            .base=${src}
            .refresh=${opts.refreshSeconds ?? 10}
          ></uc-printer-snapshot>`}
      <span class="cam-expand"><ha-icon icon="mdi:arrow-expand"></ha-icon></span>
    </div>
  `;
}

export function renderDetailsList(
  rows: Array<{ label: string; value: string; accent?: boolean; entityId?: string | undefined }>
): TemplateResult {
  return html`
    <div class="uc-printer-details">
      ${rows.map(r => {
        const c = clickable(r.entityId);
        return html`
          <div
            class="detail-row ${r.accent ? 'accent' : ''} ${c.cls}"
            role=${c.role}
            tabindex=${c.tabindex}
            @click=${c.handler}
            @keydown=${onKeyActivate(c.handler)}
          >
            <span class="detail-label">${r.label}</span>
            <span class="detail-value">${r.value}</span>
          </div>
        `;
      })}
    </div>
  `;
}
