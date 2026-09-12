import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { BambuModule } from '../../types';
import type { BambuPrinter, BambuAmsUnit } from '../../services/uc-bambu-service';
import { spoolUnitsFor } from '../../services/uc-bambu-service';
import type { PrinterSnapshot, PrinterTray } from '../printer-shared/printer-state';
import { formatEta, formatTimestamp, fireMoreInfo } from '../printer-shared/printer-state';
import {
  renderStatusPill,
  renderProgressBar,
  renderProgressRing,
  renderTempChip,
  renderStatTile,
  renderControlsRow,
  renderFanRow,
  renderPrintJob,
  renderDetailsList,
  renderCameraFeed,
  renderSpoolRing,
} from '../printer-shared/widgets';
import { renderPrinterWithHotspots, renderAmsIllustration } from './illustrations';
import { buildBambuHandlers } from './controls';

export interface BambuViewContext {
  module: BambuModule;
  hass: HomeAssistant;
  printer: BambuPrinter;
  snap: PrinterSnapshot;
}

/** Every visible AMS / external spool unit with its live trays, in user order. */
function spoolUnits(ctx: BambuViewContext): Array<{ unit: BambuAmsUnit; trays: PrinterTray[] }> {
  const { module, printer, snap } = ctx;
  const allTrays = [...snap.trays, ...snap.externalSpools];
  return spoolUnitsFor(printer, module.ams_order, module.hidden_ams_ids)
    .map(unit => ({
      unit,
      trays: allTrays.filter(t => t.amsId === unit.deviceId),
    }))
    .filter(u => u.trays.length > 0);
}

function amsBlock(ctx: BambuViewContext): TemplateResult | typeof nothing {
  if (ctx.module.show_ams === false) return nothing;
  const units = spoolUnits(ctx);
  if (!units.length) return nothing;
  const layout = ctx.module.ams_layout || 'stacked';
  const showNames = units.length > 1;

  if (layout === 'strip') {
    return html`
      <div class="uc-bambu-ams-group layout-strip">
        <div class="uc-printer-ams-strip">
          ${units.map((u, i) => html`
            ${i > 0 ? html`<span class="strip-divider"></span>` : nothing}
            ${u.trays.map(t => renderSpoolRing(t, { size: 36 }))}
          `)}
        </div>
      </div>
    `;
  }

  if (units.length === 1) {
    const u = units[0]!;
    return renderAmsIllustration(u.trays, {
      model: u.unit.model,
      humidityIndex: u.unit.humidityIndex ?? null,
      humidityEntityId: u.unit.humidityEntityId,
    });
  }

  return html`
    <div class="uc-bambu-ams-group layout-${layout}">
      ${units.map(u =>
        renderAmsIllustration(u.trays, {
          model: u.unit.model,
          name: showNames ? u.unit.name : undefined,
          humidityIndex: u.unit.humidityIndex ?? null,
          humidityEntityId: u.unit.humidityEntityId,
        })
      )}
    </div>
  `;
}

function tempsBlock(snap: PrinterSnapshot): TemplateResult {
  return html`<div class="uc-printer-temps">
    ${renderTempChip('Nozzle', snap.nozzleTemp, snap.nozzleTarget, {
      icon: 'mdi:printer-3d-nozzle',
      accent: '#ff9800',
      entityId: snap.refs.nozzleTemp,
    })}
    ${renderTempChip('Bed', snap.bedTemp, snap.bedTarget, {
      icon: 'mdi:heat-wave',
      accent: '#e91e63',
      entityId: snap.refs.bedTemp,
    })}
    ${snap.chamberTemp != null
      ? renderTempChip('Chamber', snap.chamberTemp, snap.chamberTarget, {
          icon: 'mdi:thermometer',
          accent: '#2196f3',
          entityId: snap.refs.chamberTemp,
        })
      : nothing}
  </div>`;
}

export function renderPrinterView(ctx: BambuViewContext): TemplateResult {
  const { module, hass, snap } = ctx;
  const handlers = buildBambuHandlers(hass, snap);
  return html`
    <div class="uc-bambu-printer-view">
      ${amsBlock(ctx)}
      ${renderPrinterWithHotspots(snap, {
        ...(module.accent_color ? { accent: module.accent_color } : {}),
        customImage: module.custom_image,
        showTemps: module.show_temps !== false,
        animation: module.animation_intensity || 'full',
      })}
      ${module.show_controls !== false ? renderControlsRow(snap, handlers) : nothing}
      ${module.show_job !== false
        ? renderPrintJob(snap, hass, { showThumbnail: module.show_thumbnail !== false })
        : nothing}
    </div>
  `;
}

export function renderDashboardView(ctx: BambuViewContext): TemplateResult {
  const { module, hass, snap } = ctx;
  const handlers = buildBambuHandlers(hass, snap);
  const details: Array<{
    label: string;
    value: string;
    accent?: boolean;
    entityId?: string | undefined;
  }> = [
    {
      label: 'Stage',
      value: snap.stage || snap.statusRaw || snap.status,
      entityId: snap.refs.stage || snap.refs.status,
    },
    {
      label: 'HMS',
      value: snap.hms.length ? `${snap.hms.length} issue(s)` : 'OK',
      accent: snap.hms.length > 0,
      entityId: snap.refs.hms,
    },
    { label: 'Start', value: formatTimestamp(snap.startTime), entityId: snap.refs.startTime },
    {
      label: 'Remaining',
      value: formatEta(snap.remainingMinutes),
      accent: true,
      entityId: snap.refs.remaining,
    },
    { label: 'End', value: formatTimestamp(snap.endTime), entityId: snap.refs.endTime },
    {
      label: 'Filament',
      value: snap.activeFilament || '—',
      entityId: snap.refs.activeTray,
    },
  ];
  if (snap.printError) {
    details.unshift({
      label: 'Print error',
      value: snap.printError.error || snap.printError.code,
      accent: true,
      entityId: snap.refs.printError,
    });
  }

  const showSpeed = module.show_speed !== false && !!snap.speedProfile;
  const showControls = module.show_controls !== false;
  const showDetails = module.show_print_details !== false;
  const showCamera = module.show_camera !== false && !!snap.cameraEntityId;

  return html`
    <div class="uc-bambu-dashboard">
      <div class="uc-printer-header">
        <div>
          <div class="title">${snap.name}</div>
          ${renderStatusPill(snap.status, snap.statusRaw, snap.refs.status)}
        </div>
        ${renderProgressRing(snap.progress, 56, 5, snap.refs.progress)}
      </div>
      ${module.show_temps !== false ? tempsBlock(snap) : nothing}
      ${showSpeed || showControls
        ? html`<div class="uc-printer-row">
            ${showSpeed
              ? renderStatTile('Speed', String(snap.speedProfile), {
                  icon: 'mdi:speedometer',
                  entityId: snap.refs.speed,
                })
              : nothing}
            ${showControls ? renderControlsRow(snap, handlers) : nothing}
          </div>`
        : nothing}
      ${module.show_fans !== false
        ? renderFanRow(snap.fans, handlers, { editable: true })
        : nothing}
      ${renderProgressBar(snap.progress, { entityId: snap.refs.progress })}
      ${module.show_job !== false
        ? renderPrintJob(snap, hass, { showThumbnail: module.show_thumbnail !== false })
        : nothing}
      ${amsBlock(ctx)}
      ${showDetails || showCamera
        ? html`<div class="dash-grid ${showDetails && showCamera ? '' : 'single'}">
            ${showDetails ? renderDetailsList(details) : nothing}
            ${showCamera
              ? renderCameraFeed(hass, snap.cameraEntityId, {
                  refreshSeconds: module.camera_refresh_seconds ?? 10,
                  mode: module.camera_mode,
                  alt: snap.name,
                  fill: showDetails,
                })
              : nothing}
          </div>`
        : nothing}
    </div>
  `;
}

export function renderCameraView(ctx: BambuViewContext): TemplateResult {
  const { module, hass, snap } = ctx;
  const handlers = buildBambuHandlers(hass, snap);
  const etaClick = snap.refs.remaining
    ? (e: Event) => fireMoreInfo(e, snap.refs.remaining)
    : undefined;
  return html`
    <div class="uc-bambu-camera-view">
      ${renderCameraFeed(hass, snap.cameraEntityId, {
        refreshSeconds: module.camera_refresh_seconds ?? 10,
        mode: module.camera_mode,
        alt: snap.name,
      })}
      <div class="uc-printer-header" style="margin-top:10px;">
        <div>
          <div class="title">${snap.name}</div>
          ${renderStatusPill(snap.status, snap.statusRaw, snap.refs.status)}
        </div>
        <div
          class=${etaClick ? 'is-clickable' : ''}
          style="text-align:right;"
          @click=${etaClick}
        >
          <div style="font-weight:700;">${formatEta(snap.remainingMinutes)}</div>
          <div style="font-size:0.75rem;opacity:0.7;">
            ${snap.progress != null ? `${Math.round(snap.progress)}%` : '—'}
          </div>
        </div>
      </div>
      ${renderProgressBar(snap.progress, { entityId: snap.refs.progress })}
      ${module.show_controls !== false ? renderControlsRow(snap, handlers) : nothing}
    </div>
  `;
}

export function renderFarmView(
  module: BambuModule,
  hass: HomeAssistant,
  items: Array<{ printer: BambuPrinter; snap: PrinterSnapshot }>,
  onSelect?: (deviceId: string) => void
): TemplateResult {
  if (!items.length) {
    return html`<div class="uc-bambu-empty">No printers to show.</div>`;
  }
  const deg = (n: number | null) => (n == null ? '—' : `${Math.round(n)}°`);
  return html`
    <div class="uc-bambu-farm ${items.length === 1 ? 'single' : ''}">
      ${items.map(({ printer, snap }) => {
        const tempClick = (id: string | undefined) =>
          id ? (e: Event) => fireMoreInfo(e, id) : undefined;
        const etaClick = tempClick(snap.refs.remaining);
        const hmsClick = tempClick(snap.refs.hms);
        return html`
          <div
            class="uc-bambu-farm-card"
            @click=${() => onSelect?.(printer.deviceId)}
          >
            <div class="farm-head">
              <div class="farm-name" title=${snap.name}>${snap.name}</div>
              ${renderStatusPill(snap.status, snap.statusRaw, snap.refs.status)}
            </div>
            <div class="farm-stage">
              ${renderPrinterWithHotspots(snap, {
                ...(module.accent_color ? { accent: module.accent_color } : {}),
                customImage: module.custom_image,
                showTemps: module.show_temps !== false,
                showProgress: false,
                compact: true,
                animation: module.animation_intensity || 'subtle',
              })}
            </div>
            <div class="farm-temps">
              <span class=${tempClick(snap.refs.nozzleTemp) ? 'is-clickable' : ''}
                    style="color:#ff9800" @click=${tempClick(snap.refs.nozzleTemp)}>
                <ha-icon icon="mdi:printer-3d-nozzle"></ha-icon>${deg(snap.nozzleTemp)}
              </span>
              <span class=${tempClick(snap.refs.bedTemp) ? 'is-clickable' : ''}
                    style="color:#e91e63" @click=${tempClick(snap.refs.bedTemp)}>
                <ha-icon icon="mdi:heat-wave"></ha-icon>${deg(snap.bedTemp)}
              </span>
              ${snap.chamberTemp != null
                ? html`<span class=${tempClick(snap.refs.chamberTemp) ? 'is-clickable' : ''}
                        style="color:#2196f3" @click=${tempClick(snap.refs.chamberTemp)}>
                    <ha-icon icon="mdi:thermometer"></ha-icon>${deg(snap.chamberTemp)}
                  </span>`
                : nothing}
            </div>
            ${module.show_ams !== false && (snap.trays.length || snap.externalSpools.length)
              ? html`<div class="farm-spools">
                  ${spoolUnits({ module, hass, printer, snap }).map((u, i) => html`
                    ${i > 0 ? html`<span class="strip-divider"></span>` : nothing}
                    ${u.trays.map(t => renderSpoolRing(t, { size: 24, showLabel: false }))}
                  `)}
                </div>`
              : nothing}
            ${renderProgressBar(snap.progress, { compact: true, entityId: snap.refs.progress })}
            <div class="farm-foot">
              <span class=${etaClick ? 'is-clickable' : ''} @click=${etaClick}>
                ${formatEta(snap.remainingMinutes)} left
              </span>
              ${snap.hms.length
                ? html`<span class="farm-hms ${hmsClick ? 'is-clickable' : ''}" @click=${hmsClick}>
                    <ha-icon icon="mdi:alert-circle"></ha-icon>${snap.hms.length} HMS
                  </span>`
                : nothing}
            </div>
          </div>
        `;
      })}
    </div>
  `;
}

export function renderCompactView(ctx: BambuViewContext): TemplateResult {
  const { snap } = ctx;
  const active = snap.trays.find(t => t.active) || snap.externalSpools.find(t => t.active);
  const color = active?.color || 'var(--primary-color)';
  const trayClick = active?.entityId
    ? (e: Event) => fireMoreInfo(e, active.entityId)
    : undefined;
  const tempClick = snap.refs.nozzleTemp
    ? (e: Event) => fireMoreInfo(e, snap.refs.nozzleTemp)
    : undefined;
  const etaClick = snap.refs.remaining
    ? (e: Event) => fireMoreInfo(e, snap.refs.remaining)
    : undefined;
  return html`
    <div class="uc-bambu-compact">
      <span
        class=${trayClick ? 'is-clickable' : ''}
        style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};flex-shrink:0;"
        @click=${trayClick}
      ></span>
      <div class="compact-main">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
          <strong>${snap.name}</strong>
          ${renderStatusPill(snap.status, snap.statusRaw, snap.refs.status)}
        </div>
        ${renderProgressBar(snap.progress, { compact: true, entityId: snap.refs.progress })}
      </div>
      <span
        class=${tempClick ? 'is-clickable' : ''}
        style="font-size:0.8rem;white-space:nowrap;"
        @click=${tempClick}
      >
        ${snap.nozzleTemp != null ? `${Math.round(snap.nozzleTemp)}°` : '—'} /
        ${snap.bedTemp != null ? `${Math.round(snap.bedTemp)}°` : '—'}
      </span>
      <span
        class=${etaClick ? 'is-clickable' : ''}
        style="font-size:0.8rem;font-weight:600;white-space:nowrap;"
        @click=${etaClick}
      >
        ${formatEta(snap.remainingMinutes)}
      </span>
    </div>
  `;
}
