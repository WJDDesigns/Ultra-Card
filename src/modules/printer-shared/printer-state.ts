/**
 * Normalized 3D-printer snapshot shared by the Bambu Lab (Pro) and
 * generic 3D Printer (free) modules. Views never read raw entity ids —
 * they always render from a PrinterSnapshot.
 */

export type PrinterStatus =
  | 'printing'
  | 'paused'
  | 'idle'
  | 'finished'
  | 'error'
  | 'offline'
  | 'preparing'
  | 'unknown';

export type SpeedProfile = 'silent' | 'standard' | 'sport' | 'ludicrous' | string;

export interface PrinterFan {
  id: string;
  label: string;
  percent: number | null;
  entityId?: string | undefined;
  /** True when this is a controllable fan.* entity. */
  controllable?: boolean | undefined;
}

export interface PrinterTray {
  id: string;
  /** 1-based slot within its AMS / external device. */
  slot: number;
  name: string;
  type: string;
  /** Parsed CSS color (#RRGGBB). */
  color: string | null;
  /** Raw RGBA hex from Bambu (#RRGGBBAA) when available. */
  colorRaw?: string | undefined;
  remain: number | null;
  active: boolean;
  empty: boolean;
  unknown?: boolean | undefined;
  amsIndex?: number | undefined;
  amsName?: string | undefined;
  /** Device id of the AMS / external spool holder this tray belongs to. */
  amsId?: string | undefined;
  entityId?: string | undefined;
}

export interface PrinterHmsError {
  code: string;
  error: string;
  wiki?: string | undefined;
  severity?: string | undefined;
}

export interface PrinterControls {
  pauseEntityId?: string | undefined;
  resumeEntityId?: string | undefined;
  stopEntityId?: string | undefined;
  lightEntityId?: string | undefined;
  speedEntityId?: string | undefined;
  nozzleTargetEntityId?: string | undefined;
  bedTargetEntityId?: string | undefined;
  chamberTargetEntityId?: string | undefined;
}

/** Entity ids behind each displayed value, so every widget can open more-info. */
export interface PrinterEntityRefs {
  status?: string | undefined;
  stage?: string | undefined;
  progress?: string | undefined;
  nozzleTemp?: string | undefined;
  bedTemp?: string | undefined;
  chamberTemp?: string | undefined;
  remaining?: string | undefined;
  endTime?: string | undefined;
  startTime?: string | undefined;
  taskName?: string | undefined;
  layer?: string | undefined;
  speed?: string | undefined;
  hms?: string | undefined;
  printError?: string | undefined;
  activeTray?: string | undefined;
  camera?: string | undefined;
  light?: string | undefined;
  door?: string | undefined;
}

/** Dispatch HA's more-info dialog from a click target. */
export function fireMoreInfo(e: Event, entityId: string | undefined): void {
  if (!entityId) return;
  e.stopPropagation();
  const target = (e.currentTarget || e.target) as HTMLElement | null;
  const ev = new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId },
  });
  (target || document.body).dispatchEvent(ev);
}

export interface PrinterSnapshot {
  id: string;
  name: string;
  model?: string | undefined;
  modelFamily?: 'enclosed_corexy' | 'bedslinger' | 'h2' | 'generic' | undefined;
  online: boolean;
  status: PrinterStatus;
  statusRaw?: string | undefined;
  stage?: string | undefined;
  progress: number | null;
  currentLayer: number | null;
  totalLayers: number | null;
  remainingMinutes: number | null;
  endTime?: string | undefined;
  startTime?: string | undefined;
  taskName?: string | undefined;
  fileName?: string | undefined;
  nozzleTemp: number | null;
  nozzleTarget: number | null;
  bedTemp: number | null;
  bedTarget: number | null;
  chamberTemp: number | null;
  chamberTarget: number | null;
  fans: PrinterFan[];
  speedProfile?: SpeedProfile | undefined;
  trays: PrinterTray[];
  externalSpools: PrinterTray[];
  activeTrayId?: string | undefined;
  activeFilament?: string | undefined;
  hms: PrinterHmsError[];
  printError?: { code: string; error: string } | null | undefined;
  doorOpen?: boolean | null | undefined;
  cameraEntityId?: string | undefined;
  coverImageEntityId?: string | undefined;
  lightOn?: boolean | null | undefined;
  controls: PrinterControls;
  /** Entity behind each value (for click-through). */
  refs: PrinterEntityRefs;
  /** Every entity id this snapshot depends on (for getRuntimeEntityIds). */
  entityIds: string[];
  /** Extra free-form stats (free card). */
  extraStats?: Array<{ label: string; value: string; icon?: string; entityId?: string }> | undefined;
}

const PRINTING = new Set([
  'printing',
  'running',
  'print',
  'busy',
  'operational_printing',
]);
const PAUSED = new Set(['paused', 'pause', 'pausing']);
const IDLE = new Set([
  'idle',
  'operational',
  'standby',
  'ready',
  'off',
  'none',
  'unknown',
  'init',
]);
const FINISHED = new Set(['finished', 'finish', 'complete', 'completed', 'done', 'success']);
const ERROR = new Set(['error', 'failed', 'failure', 'fault', 'cancelled', 'canceled']);
const OFFLINE = new Set(['offline', 'unavailable', 'unknown', 'disconnected']);
const PREPARING = new Set([
  'preparing',
  'prepare',
  'slicing',
  'heating',
  'calibrating',
  'homing',
  'loading',
]);

/** Map free-form printer states (Bambu, OctoPrint, Moonraker, Prusa) to a status. */
export function normalizeStatus(raw: string | null | undefined, online = true): PrinterStatus {
  if (!online) return 'offline';
  if (raw == null || raw === '') return 'unknown';
  const s = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (OFFLINE.has(s) && (s === 'offline' || s === 'unavailable' || s === 'disconnected')) {
    return 'offline';
  }
  if (PRINTING.has(s)) return 'printing';
  if (PAUSED.has(s)) return 'paused';
  if (FINISHED.has(s)) return 'finished';
  if (ERROR.has(s)) return 'error';
  if (PREPARING.has(s)) return 'preparing';
  if (IDLE.has(s)) return 'idle';
  // Bambu current_stage values
  if (s.includes('pause')) return 'paused';
  if (s.includes('print') || s === 'auto_bed_leveling' || s.includes('heat')) return 'preparing';
  if (s === 'idle') return 'idle';
  return 'unknown';
}

/** Theme-friendly accent for a status. */
export function statusColor(status: PrinterStatus): string {
  switch (status) {
    case 'printing':
      return 'var(--success-color, #4caf50)';
    case 'paused':
      return 'var(--warning-color, #ff9800)';
    case 'error':
      return 'var(--error-color, #f44336)';
    case 'finished':
      return 'var(--primary-color, #03a9f4)';
    case 'preparing':
      return 'var(--info-color, #2196f3)';
    case 'offline':
      return 'var(--disabled-text-color, #9e9e9e)';
    case 'idle':
    default:
      return 'var(--secondary-text-color, #9e9e9e)';
  }
}

export function statusLabel(status: PrinterStatus): string {
  switch (status) {
    case 'printing':
      return 'Printing';
    case 'paused':
      return 'Paused';
    case 'idle':
      return 'Idle';
    case 'finished':
      return 'Finished';
    case 'error':
      return 'Error';
    case 'offline':
      return 'Offline';
    case 'preparing':
      return 'Preparing';
    default:
      return 'Unknown';
  }
}

/**
 * Parse Bambu `#RRGGBBAA` (or `#RRGGBB`) into a CSS `#RRGGBB`.
 * Returns null for empty / fully transparent / invalid.
 */
export function parseTrayColor(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const hex = raw.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) return null;
  const rgb = hex.slice(0, 6);
  if (hex.length === 8) {
    const alpha = parseInt(hex.slice(6, 8), 16);
    if (alpha === 0) return null;
  }
  if (rgb === '000000' && hex.length === 8 && hex.slice(6, 8) === '00') return null;
  return `#${rgb.toUpperCase()}`;
}

/** Format remaining minutes as "1h 24m" / "36m" / "—" . */
export function formatEta(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return '—';
  const m = Math.round(minutes);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

/** Format a HA timestamp / ISO string for display. */
export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function parseNumber(raw: unknown): number | null {
  if (raw == null || raw === '' || raw === 'unavailable' || raw === 'unknown') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  return Number.isFinite(n) ? n : null;
}

/** Coerce remaining_time which may be minutes, hours, or an HH:MM:SS string. */
export function parseRemainingMinutes(raw: unknown, unitHint?: string): number | null {
  if (raw == null || raw === '' || raw === 'unavailable' || raw === 'unknown') return null;
  if (typeof raw === 'string' && raw.includes(':')) {
    const parts = raw.split(':').map(p => parseInt(p, 10));
    if (parts.some(p => !Number.isFinite(p))) return null;
    if (parts.length === 3) return parts[0]! * 60 + parts[1]! + parts[2]! / 60;
    if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  }
  const n = parseNumber(raw);
  if (n == null) return null;
  const unit = (unitHint || '').toLowerCase();
  if (unit.includes('hour') || unit === 'h') return n * 60;
  if (unit.includes('sec')) return n / 60;
  return n;
}

export function emptySnapshot(id = 'printer', name = '3D Printer'): PrinterSnapshot {
  return {
    id,
    name,
    online: false,
    status: 'offline',
    progress: null,
    currentLayer: null,
    totalLayers: null,
    remainingMinutes: null,
    nozzleTemp: null,
    nozzleTarget: null,
    bedTemp: null,
    bedTarget: null,
    chamberTemp: null,
    chamberTarget: null,
    fans: [],
    trays: [],
    externalSpools: [],
    hms: [],
    controls: {},
    refs: {},
    entityIds: [],
  };
}

/** Prefer nozzle heating indicator when current is meaningfully below target. */
export function isHeating(current: number | null, target: number | null): boolean {
  if (current == null || target == null) return false;
  return target > 30 && current < target - 2;
}
