/**
 * Auto-fill entity mappings for the free 3D Printer module from
 * OctoPrint, Moonraker/Klipper, and PrusaLink device registries.
 */

import type { HomeAssistant } from 'custom-card-helpers';
import type { Printer3dModule } from '../types';

export type PrinterAutofillSource = 'octoprint' | 'moonraker' | 'prusalink';

export interface PrinterAutofillDevice {
  deviceId: string;
  name: string;
  source: PrinterAutofillSource;
  model?: string | undefined;
}

export interface PrinterAutofillMapping {
  status_entity?: string;
  progress_entity?: string;
  nozzle_temp_entity?: string;
  nozzle_target_entity?: string;
  bed_temp_entity?: string;
  bed_target_entity?: string;
  chamber_temp_entity?: string;
  remaining_time_entity?: string;
  end_time_entity?: string;
  current_layer_entity?: string;
  total_layers_entity?: string;
  file_name_entity?: string;
  camera_entity?: string;
  thumbnail_entity?: string;
  pause_entity?: string;
  resume_entity?: string;
  stop_entity?: string;
  light_entity?: string;
  fans?: Array<{ entity: string; label: string }>;
}

interface HassEntityRow {
  entity_id?: string;
  device_id?: string | null;
  platform?: string | null;
  unique_id?: string | null;
  translation_key?: string | null;
  original_name?: string | null;
  disabled_by?: string | null;
}

interface HassDeviceRow {
  id?: string;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  identifiers?: Array<[string, string]> | undefined;
  disabled_by?: string | null;
}

interface HassRegistries {
  entities?: Record<string, HassEntityRow | undefined> | undefined;
  devices?: Record<string, HassDeviceRow | undefined> | undefined;
}

const SOURCE_DOMAINS: Record<PrinterAutofillSource, string[]> = {
  octoprint: ['octoprint'],
  moonraker: ['moonraker'],
  prusalink: ['prusalink'],
};

/** Heuristic patterns per role, matched against entity_id (and unique_id). */
const ROLE_PATTERNS: Record<keyof PrinterAutofillMapping, RegExp[]> = {
  status_entity: [
    /_current_state$/,
    /_print_status$/,
    /_printer_state$/,
    /_state$/,
    /current_print_state/,
  ],
  progress_entity: [/_progress$/, /_print_progress$/, /job_percentage/, /_completion$/],
  nozzle_temp_entity: [
    /_tool_0_temperature$/,
    /_extruder_temperature$/,
    /_nozzle_temperature$/,
    /temperature_extruder/,
    /_tool0_actual$/,
  ],
  nozzle_target_entity: [
    /_tool_0_target$/,
    /_extruder_target$/,
    /_nozzle_target/,
    /_tool0_target$/,
  ],
  bed_temp_entity: [/_bed_temperature$/, /_heater_bed_temperature$/, /temperature_bed/, /_bed_actual$/],
  bed_target_entity: [/_bed_target$/, /_heater_bed_target$/, /_bed_target_temperature$/],
  chamber_temp_entity: [/_chamber_temperature$/, /_chamber_temp$/],
  remaining_time_entity: [
    /_print_time_left$/,
    /_estimated_time_left$/,
    /_remaining_time$/,
    /_eta$/,
    /_time_left$/,
  ],
  end_time_entity: [/_end_time$/, /_finish_time$/, /_estimated_end_time$/],
  current_layer_entity: [/_current_layer$/, /_layer$/],
  total_layers_entity: [/_total_layer/, /_layer_count$/],
  file_name_entity: [/_filename$/, /_file_name$/, /_job_file$/, /_print_file$/, /_gcode_name$/],
  camera_entity: [/^camera\./],
  thumbnail_entity: [/^image\./, /_thumbnail$/, /_preview$/],
  pause_entity: [/_pause$/, /pause_print/],
  resume_entity: [/_resume$/, /resume_print/],
  stop_entity: [/_cancel$/, /_stop$/, /cancel_print/, /stop_print/],
  light_entity: [/^light\./, /_light$/],
  fans: [/^fan\./, /_fan$/],
};

function getRegistries(hass: HomeAssistant): HassRegistries {
  return hass as unknown as HassRegistries;
}

function deviceName(row: HassDeviceRow): string {
  return (row.name_by_user || row.name || row.model || 'Printer').trim();
}

function deviceSource(row: HassDeviceRow): PrinterAutofillSource | null {
  for (const [source, domains] of Object.entries(SOURCE_DOMAINS) as Array<
    [PrinterAutofillSource, string[]]
  >) {
    if ((row.identifiers || []).some(p => domains.includes(p?.[0]))) return source;
  }
  const mfg = (row.manufacturer || '').toLowerCase();
  if (mfg.includes('octoprint')) return 'octoprint';
  if (mfg.includes('prusa')) return 'prusalink';
  if (mfg.includes('klipper') || mfg.includes('moonraker')) return 'moonraker';
  return null;
}

export function listAutofillDevices(
  hass: HomeAssistant | undefined | null,
  source?: PrinterAutofillSource | 'manual' | undefined
): PrinterAutofillDevice[] {
  if (!hass) return [];
  const reg = getRegistries(hass);
  const devices = reg.devices || {};
  const out: PrinterAutofillDevice[] = [];
  for (const [id, row] of Object.entries(devices)) {
    if (!row || row.disabled_by) continue;
    const src = deviceSource(row);
    if (!src) continue;
    if (source && source !== 'manual' && src !== source) continue;
    out.push({
      deviceId: id,
      name: deviceName(row),
      source: src,
      model: row.model || undefined,
    });
  }
  // Also detect by entity platform when identifiers missing
  if (!out.length && reg.entities) {
    const byDevice = new Map<string, PrinterAutofillSource>();
    for (const row of Object.values(reg.entities)) {
      if (!row?.device_id || row.disabled_by) continue;
      const platform = row.platform || '';
      let src: PrinterAutofillSource | null = null;
      if (platform === 'octoprint') src = 'octoprint';
      else if (platform === 'moonraker') src = 'moonraker';
      else if (platform === 'prusalink') src = 'prusalink';
      if (src) byDevice.set(row.device_id, src);
    }
    for (const [id, src] of byDevice) {
      if (source && source !== 'manual' && src !== source) continue;
      const row = devices[id];
      out.push({
        deviceId: id,
        name: row ? deviceName(row) : id,
        source: src,
        model: row?.model || undefined,
      });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function matchRole(entityId: string, uniqueId: string | null | undefined, patterns: RegExp[]): boolean {
  const hay = `${entityId} ${uniqueId || ''}`.toLowerCase();
  return patterns.some(re => re.test(entityId) || (uniqueId && re.test(uniqueId)) || re.test(hay));
}

export function autofillFromDevice(
  hass: HomeAssistant,
  deviceId: string
): PrinterAutofillMapping {
  const reg = getRegistries(hass);
  const entities = reg.entities || {};
  const deviceEntities: HassEntityRow[] = [];
  for (const [eid, row] of Object.entries(entities)) {
    if (!row || row.disabled_by) continue;
    if (row.device_id !== deviceId) continue;
    deviceEntities.push({ ...row, entity_id: eid });
  }

  const mapping: PrinterAutofillMapping = {};
  const fans: Array<{ entity: string; label: string }> = [];

  const tryAssign = (role: keyof PrinterAutofillMapping, domainHint?: string) => {
    if (role === 'fans') return;
    if ((mapping as any)[role]) return;
    const patterns = ROLE_PATTERNS[role];
    if (!patterns) return;
    for (const row of deviceEntities) {
      const eid = row.entity_id!;
      if (domainHint && !eid.startsWith(`${domainHint}.`)) continue;
      if (matchRole(eid, row.unique_id, patterns)) {
        (mapping as any)[role] = eid;
        return;
      }
    }
  };

  tryAssign('status_entity', 'sensor');
  tryAssign('progress_entity', 'sensor');
  tryAssign('nozzle_temp_entity', 'sensor');
  tryAssign('nozzle_target_entity');
  tryAssign('bed_temp_entity', 'sensor');
  tryAssign('bed_target_entity');
  tryAssign('chamber_temp_entity', 'sensor');
  tryAssign('remaining_time_entity', 'sensor');
  tryAssign('end_time_entity', 'sensor');
  tryAssign('current_layer_entity', 'sensor');
  tryAssign('total_layers_entity', 'sensor');
  tryAssign('file_name_entity', 'sensor');
  tryAssign('camera_entity', 'camera');
  tryAssign('thumbnail_entity', 'image');
  tryAssign('pause_entity');
  tryAssign('resume_entity');
  tryAssign('stop_entity');
  tryAssign('light_entity', 'light');

  // Fallback: binary_sensor / sensor named "status" loosely
  if (!mapping.status_entity) {
    for (const row of deviceEntities) {
      const eid = row.entity_id!;
      if (/status|state|print/.test(eid) && eid.startsWith('sensor.')) {
        mapping.status_entity = eid;
        break;
      }
    }
  }

  for (const row of deviceEntities) {
    const eid = row.entity_id!;
    if (eid.startsWith('fan.') || matchRole(eid, row.unique_id, ROLE_PATTERNS.fans!)) {
      if (fans.length >= 3) break;
      const label =
        row.original_name ||
        eid
          .split('.')
          .pop()!
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
      fans.push({ entity: eid, label });
    }
  }
  if (fans.length) mapping.fans = fans;

  return mapping;
}

/** Apply autofill onto a module config (returns partial updates). */
export function applyAutofillToModule(
  mapping: PrinterAutofillMapping
): Partial<Printer3dModule> {
  return {
    status_entity: mapping.status_entity,
    progress_entity: mapping.progress_entity,
    nozzle_temp_entity: mapping.nozzle_temp_entity,
    nozzle_target_entity: mapping.nozzle_target_entity,
    bed_temp_entity: mapping.bed_temp_entity,
    bed_target_entity: mapping.bed_target_entity,
    chamber_temp_entity: mapping.chamber_temp_entity,
    remaining_time_entity: mapping.remaining_time_entity,
    end_time_entity: mapping.end_time_entity,
    current_layer_entity: mapping.current_layer_entity,
    total_layers_entity: mapping.total_layers_entity,
    file_name_entity: mapping.file_name_entity,
    camera_entity: mapping.camera_entity,
    thumbnail_entity: mapping.thumbnail_entity,
    pause_entity: mapping.pause_entity,
    resume_entity: mapping.resume_entity,
    stop_entity: mapping.stop_entity,
    light_entity: mapping.light_entity,
    fans: mapping.fans,
  };
}
