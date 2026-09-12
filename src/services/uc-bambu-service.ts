/**
 * Bambu Lab printer discovery for Ultra Card.
 *
 * Reads the greghesp/ha-bambulab integration via hass.states +
 * entity/device registries. Never talks to the printer or Bambu cloud.
 *
 * Entity resolution prefers translation_key on the entity registry row,
 * then unique_id / entity_id suffix matching so renamed devices still work.
 */

import type { HomeAssistant } from 'custom-card-helpers';
import { UcStatesMemo, statesMemoKey } from '../utils/uc-states-memo';
import {
  PrinterSnapshot,
  PrinterTray,
  PrinterFan,
  PrinterHmsError,
  PrinterControls,
  emptySnapshot,
  normalizeStatus,
  parseNumber,
  parseRemainingMinutes,
  parseTrayColor,
} from '../modules/printer-shared/printer-state';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type BambuModelFamily = 'enclosed_corexy' | 'bedslinger' | 'h2';

export type BambuAmsModel = 'AMS' | 'AMS Lite' | 'AMS 2 Pro' | 'AMS HT' | 'External Spool' | 'Hotend Rack';

export interface BambuCapabilities {
  chamberTemp: boolean;
  chamberTarget: boolean;
  auxFan: boolean;
  chamberFan: boolean;
  secondaryAuxFan: boolean;
  door: boolean;
  dualNozzle: boolean;
  camera: boolean;
  coverImage: boolean;
  ams: boolean;
  heatbedLight: boolean;
}

export interface BambuAmsUnit {
  deviceId: string;
  name: string;
  model: BambuAmsModel | string;
  viaDeviceId?: string | undefined;
  trays: PrinterTray[];
  humidityIndex: number | null;
  humidityPct: number | null;
  humidityEntityId?: string | undefined;
  temperatureC: number | null;
  active: boolean | null;
  entityIds: string[];
}

export interface BambuPrinter {
  deviceId: string;
  name: string;
  model: string;
  family: BambuModelFamily;
  serial?: string | undefined;
  swVersion?: string | undefined;
  /** Entity id → role key (translation_key or resolved role). */
  entities: Record<string, string>;
  capabilities: BambuCapabilities;
  amsUnits: BambuAmsUnit[];
  externalSpools: BambuAmsUnit[];
  allEntityIds: string[];
}

export interface BambuTopology {
  printers: BambuPrinter[];
  allEntityIds: string[];
  hasBambuIntegration: boolean;
}

export interface BambuSetupHint {
  id: 'no_integration' | 'no_printers' | 'camera_off' | 'offline' | 'no_ams';
  severity: 'info' | 'warning';
  message: string;
  printerDeviceId?: string | undefined;
}

interface HassEntityRow {
  entity_id?: string;
  device_id?: string | null;
  platform?: string | null;
  unique_id?: string | null;
  translation_key?: string | null;
  original_name?: string | null;
  name?: string | null;
  entity_category?: string | null;
  disabled_by?: string | null;
}

interface HassDeviceRow {
  id?: string;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  sw_version?: string | null;
  via_device_id?: string | null;
  identifiers?: Array<[string, string]> | undefined;
  disabled_by?: string | null;
}

interface HassRegistries {
  entities?: Record<string, HassEntityRow | undefined> | undefined;
  devices?: Record<string, HassDeviceRow | undefined> | undefined;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const DOMAIN = 'bambu_lab';

export const BAMBU_PRINTER_MODELS = new Set([
  'A1',
  'A1MINI',
  'A2L',
  'P1P',
  'P1S',
  'P2S',
  'H2C',
  'H2D',
  'H2DPRO',
  'H2S',
  'X2D',
  'X1E',
  'X1C',
  'X1',
]);

const AMS_MODELS = new Set(['AMS', 'AMS Lite', 'AMS 2 Pro', 'AMS HT']);

/** translation_key → role used when building the snapshot. */
const ROLE_BY_KEY: Record<string, string> = {
  nozzle_temp: 'nozzle_temp',
  target_nozzle_temp: 'nozzle_target_sensor',
  bed_temp: 'bed_temp',
  target_bed_temp: 'bed_target_sensor',
  chamber_temp: 'chamber_temp',
  target_chamber_temp: 'chamber_target_sensor',
  left_nozzle_temp: 'left_nozzle_temp',
  left_target_nozzle_temp: 'left_nozzle_target',
  right_nozzle_temp: 'right_nozzle_temp',
  right_target_nozzle_temp: 'right_nozzle_target',
  aux_fan_speed: 'aux_fan_speed',
  chamber_fan_speed: 'chamber_fan_speed',
  cooling_fan_speed: 'cooling_fan_speed',
  heatbreak_fan_speed: 'heatbreak_fan_speed',
  secondary_aux_fan_speed: 'secondary_aux_fan_speed',
  speed_profile: 'speed_profile',
  stage: 'stage',
  print_progress: 'print_progress',
  print_status: 'print_status',
  start_time: 'start_time',
  remaining_time: 'remaining_time',
  end_time: 'end_time',
  current_layer: 'current_layer',
  total_layers: 'total_layers',
  gcode_file: 'gcode_file',
  subtask_name: 'task_name',
  active_tray: 'active_tray',
  nozzle_diameter: 'nozzle_size',
  nozzle_type: 'nozzle_type',
  print_weight: 'print_weight',
  print_length: 'print_length',
  print_bed_type: 'print_bed_type',
  wifi_signal: 'wifi_signal',
  ip_address: 'ip_address',
  online: 'online',
  hms: 'hms',
  print_error: 'print_error',
  door_open: 'door',
  timelapse: 'timelapse',
  pause: 'pause',
  resume: 'resume',
  stop: 'stop',
  refresh: 'refresh',
  chamber_light: 'chamber_light',
  heatbed_light: 'heatbed_light',
  cooling_fan: 'cooling_fan',
  aux_fan: 'aux_fan',
  chamber_fan: 'chamber_fan',
  secondary_aux_fan: 'secondary_aux_fan',
  printing_speed: 'printing_speed',
  target_nozzle_temperature: 'nozzle_target',
  target_bed_temperature: 'bed_target',
  target_chamber_temperature: 'chamber_target',
  camera: 'camera',
  cover_image: 'cover_image',
  p1p_camera: 'camera_image',
  humidity_index: 'humidity_index',
  humidity: 'humidity',
  temperature: 'ams_temp',
  ams_temp: 'ams_temp',
  tray_1: 'tray_1',
  tray_2: 'tray_2',
  tray_3: 'tray_3',
  tray_4: 'tray_4',
  external_spool: 'external_spool',
  active_ams: 'active_ams',
  camera_switch: 'camera_switch',
};

/** entity_id / unique_id suffix → role (fallback when translation_key missing). */
const SUFFIX_ROLES: Array<[RegExp, string]> = [
  [/_nozzle_temperature$/, 'nozzle_temp'],
  [/_nozzle_target_temperature$/, 'nozzle_target'],
  [/_bed_temperature$/, 'bed_temp'],
  [/_bed_target_temperature$/, 'bed_target'],
  [/_chamber_temperature$/, 'chamber_temp'],
  [/_chamber_target_temperature$/, 'chamber_target'],
  [/_print_progress$/, 'print_progress'],
  [/_print_status$/, 'print_status'],
  [/_current_stage$/, 'stage'],
  [/_current_layer$/, 'current_layer'],
  [/_total_layer_count$/, 'total_layers'],
  [/_remaining_time$/, 'remaining_time'],
  [/_end_time$/, 'end_time'],
  [/_start_time$/, 'start_time'],
  [/_task_name$/, 'task_name'],
  [/_gcode_filename$/, 'gcode_file'],
  [/_speed_profile$/, 'speed_profile'],
  [/_printing_speed$/, 'printing_speed'],
  [/_active_tray$/, 'active_tray'],
  [/_cooling_fan_speed$/, 'cooling_fan_speed'],
  [/_aux_fan_speed$/, 'aux_fan_speed'],
  [/_chamber_fan_speed$/, 'chamber_fan_speed'],
  [/_cooling_fan$/, 'cooling_fan'],
  [/_aux_fan$/, 'aux_fan'],
  [/_chamber_fan$/, 'chamber_fan'],
  [/_chamber_light$/, 'chamber_light'],
  [/_heatbed_light$/, 'heatbed_light'],
  [/_hms_errors$/, 'hms'],
  [/_print_error$/, 'print_error'],
  [/_online$/, 'online'],
  [/_door$/, 'door'],
  [/_cover_image$/, 'cover_image'],
  [/_camera$/, 'camera'],
  [/_pause$/, 'pause'],
  [/_resume$/, 'resume'],
  [/_stop$/, 'stop'],
  [/_force_refresh$/, 'refresh'],
  [/_humidity_index$/, 'humidity_index'],
  [/_humidity$/, 'humidity'],
  [/_tray_1$/, 'tray_1'],
  [/_tray_2$/, 'tray_2'],
  [/_tray_3$/, 'tray_3'],
  [/_tray_4$/, 'tray_4'],
  [/_external_spool$/, 'external_spool'],
  [/_wi[_-]?fi_signal$/, 'wifi_signal'],
  [/_nozzle_size$/, 'nozzle_size'],
  [/_nozzle_type$/, 'nozzle_type'],
];

const topologyMemo = new UcStatesMemo<BambuTopology>();

/* -------------------------------------------------------------------------- */
/* Model helpers                                                               */
/* -------------------------------------------------------------------------- */

export function normalizeBambuModel(model: string | null | undefined): string {
  if (!model) return '';
  return model.replace(/\s+/g, '').toUpperCase();
}

export function modelFamily(model: string | null | undefined): BambuModelFamily {
  const m = normalizeBambuModel(model);
  if (m.startsWith('H2')) return 'h2';
  if (m === 'A1' || m === 'A1MINI' || m === 'A2L') return 'bedslinger';
  return 'enclosed_corexy';
}

export function isBambuPrinterModel(model: string | null | undefined): boolean {
  return BAMBU_PRINTER_MODELS.has(normalizeBambuModel(model));
}

function deviceHasBambuId(row: HassDeviceRow): boolean {
  return (row.identifiers || []).some(pair => pair?.[0] === DOMAIN);
}

function deviceDisplayName(row: HassDeviceRow): string {
  return (row.name_by_user || row.name || row.model || 'Bambu Printer').trim();
}

function getRegistries(hass: HomeAssistant): HassRegistries {
  return hass as unknown as HassRegistries;
}

function resolveRole(
  translationKey: string | null | undefined,
  uniqueId: string | null | undefined,
  entityId: string
): string | null {
  if (translationKey && ROLE_BY_KEY[translationKey]) return ROLE_BY_KEY[translationKey];
  // unique_id often ends with _<key>
  if (uniqueId) {
    const key = uniqueId.includes('_') ? uniqueId.split('_').slice(1).join('_') : uniqueId;
    if (ROLE_BY_KEY[key]) return ROLE_BY_KEY[key];
    // AMS trays: tray_1 etc. already covered; also serial_tray_1 style
    const trayMatch = uniqueId.match(/tray_([1-4])$/i);
    if (trayMatch) return `tray_${trayMatch[1]}`;
  }
  for (const [re, role] of SUFFIX_ROLES) {
    if (re.test(entityId) || (uniqueId && re.test(uniqueId))) return role;
  }
  // camera switch is unique_id serial_camera but domain switch
  if (entityId.startsWith('switch.') && /_camera$/.test(entityId)) return 'camera_switch';
  return null;
}

function stateOf(hass: HomeAssistant, entityId: string | undefined): string | null {
  if (!entityId) return null;
  const st = hass.states[entityId];
  if (!st) return null;
  const s = st.state;
  if (s === 'unavailable' || s === 'unknown') return null;
  return s;
}

function attrsOf(hass: HomeAssistant, entityId: string | undefined): Record<string, unknown> {
  if (!entityId) return {};
  return (hass.states[entityId]?.attributes || {}) as Record<string, unknown>;
}

function numState(hass: HomeAssistant, entityId: string | undefined): number | null {
  return parseNumber(stateOf(hass, entityId));
}

function findRole(entities: Record<string, string>, role: string): string | undefined {
  for (const [eid, r] of Object.entries(entities)) {
    if (r === role) return eid;
  }
  return undefined;
}

function findRoles(entities: Record<string, string>, role: string): string[] {
  return Object.entries(entities)
    .filter(([, r]) => r === role)
    .map(([eid]) => eid);
}

/* -------------------------------------------------------------------------- */
/* Tray parsing                                                                */
/* -------------------------------------------------------------------------- */

export function trayFromEntity(
  hass: HomeAssistant,
  entityId: string,
  slot: number,
  amsIndex?: number,
  amsName?: string
): PrinterTray {
  const st = hass.states[entityId];
  const attrs = (st?.attributes || {}) as Record<string, unknown>;
  const name = String(attrs.name || st?.state || '');
  const type = String(attrs.type || '');
  const colorRaw = attrs.color != null ? String(attrs.color) : undefined;
  const empty =
    attrs.empty === true ||
    String(st?.state || '').toLowerCase() === 'empty' ||
    colorRaw === '#00000000';
  const remain = parseNumber(attrs.remain);
  return {
    id: entityId,
    slot,
    name: empty ? 'Empty' : name,
    type: empty ? 'Empty' : type,
    color: parseTrayColor(colorRaw),
    colorRaw,
    remain: remain != null && remain >= 0 ? remain : null,
    active: attrs.active === true,
    empty,
    unknown: attrs.unknown === true,
    amsIndex,
    amsName,
    entityId,
  };
}

/* -------------------------------------------------------------------------- */
/* Discovery                                                                   */
/* -------------------------------------------------------------------------- */

function collectDeviceEntities(
  hass: HomeAssistant,
  deviceId: string
): Record<string, string> {
  const reg = getRegistries(hass);
  const out: Record<string, string> = {};
  const entities = reg.entities;
  if (!entities) {
    // Fallback: scan states for device_id via hass.entities only — if missing, empty.
    return out;
  }
  for (const [eid, row] of Object.entries(entities)) {
    if (!row || row.disabled_by) continue;
    if (row.device_id !== deviceId) continue;
    if (row.platform && row.platform !== DOMAIN) continue;
    const role = resolveRole(row.translation_key, row.unique_id, eid);
    if (role) out[eid] = role;
  }
  return out;
}

function buildAmsUnit(hass: HomeAssistant, row: HassDeviceRow, deviceId: string): BambuAmsUnit {
  const entities = collectDeviceEntities(hass, deviceId);
  const trays: PrinterTray[] = [];
  for (let i = 1; i <= 4; i++) {
    const eid = findRole(entities, `tray_${i}`);
    if (eid) trays.push(trayFromEntity(hass, eid, i, undefined, deviceDisplayName(row)));
  }
  const ext = findRole(entities, 'external_spool');
  if (ext) trays.push(trayFromEntity(hass, ext, 1, 255, deviceDisplayName(row)));

  const entityIds = Object.keys(entities);
  const activeEid = findRole(entities, 'active_ams');
  return {
    deviceId,
    name: deviceDisplayName(row),
    model: row.model || 'AMS',
    viaDeviceId: row.via_device_id || undefined,
    trays,
    humidityIndex: numState(hass, findRole(entities, 'humidity_index')),
    humidityPct: numState(hass, findRole(entities, 'humidity')),
    humidityEntityId: findRole(entities, 'humidity_index') || findRole(entities, 'humidity'),
    temperatureC: numState(hass, findRole(entities, 'ams_temp')),
    active: activeEid ? stateOf(hass, activeEid) === 'on' : null,
    entityIds,
  };
}

function inferCapabilities(entities: Record<string, string>, model: string): BambuCapabilities {
  const has = (role: string) => !!findRole(entities, role);
  return {
    chamberTemp: has('chamber_temp'),
    chamberTarget: has('chamber_target') || has('chamber_target_sensor'),
    auxFan: has('aux_fan') || has('aux_fan_speed'),
    chamberFan: has('chamber_fan') || has('chamber_fan_speed'),
    secondaryAuxFan: has('secondary_aux_fan') || has('secondary_aux_fan_speed'),
    door: has('door'),
    dualNozzle: has('left_nozzle_temp') || has('right_nozzle_temp'),
    camera: has('camera') || has('camera_image'),
    coverImage: has('cover_image'),
    ams: false, // filled after child scan
    heatbedLight: has('heatbed_light'),
  };
}

function buildTopologyFromHass(hass: HomeAssistant): BambuTopology {
  const reg = getRegistries(hass);
  const devices = reg.devices || {};
  const printers: BambuPrinter[] = [];
  let hasBambu = false;
  const allIds = new Set<string>();

  // Index children by via_device_id
  const childrenByParent = new Map<string, Array<{ id: string; row: HassDeviceRow }>>();
  const printerRows: Array<{ id: string; row: HassDeviceRow }> = [];

  for (const [id, row] of Object.entries(devices)) {
    if (!row || row.disabled_by) continue;
    if (!deviceHasBambuId(row) && !isBambuPrinterModel(row.model)) {
      // still count platform presence via entities
      continue;
    }
    hasBambu = true;
    const model = row.model || '';
    if (isBambuPrinterModel(model)) {
      printerRows.push({ id, row: { ...row, id } });
    } else if (AMS_MODELS.has(model) || model === 'External Spool' || model === 'Hotend Rack') {
      const parent = row.via_device_id;
      if (parent) {
        const list = childrenByParent.get(parent) || [];
        list.push({ id, row: { ...row, id } });
        childrenByParent.set(parent, list);
      }
    }
  }

  // Also detect integration from entity platforms if no devices matched
  if (!hasBambu && reg.entities) {
    hasBambu = Object.values(reg.entities).some(e => e?.platform === DOMAIN);
  }

  for (const { id, row } of printerRows) {
    const entities = collectDeviceEntities(hass, id);
    const caps = inferCapabilities(entities, row.model || '');
    const amsUnits: BambuAmsUnit[] = [];
    const externalSpools: BambuAmsUnit[] = [];
    const kids = childrenByParent.get(id) || [];
    for (const kid of kids) {
      const unit = buildAmsUnit(hass, kid.row, kid.id);
      unit.entityIds.forEach(e => allIds.add(e));
      if (kid.row.model === 'External Spool') externalSpools.push(unit);
      else if (kid.row.model !== 'Hotend Rack') amsUnits.push(unit);
    }
    caps.ams = amsUnits.length > 0;

    const serialPair = (row.identifiers || []).find(p => p?.[0] === DOMAIN);
    const printer: BambuPrinter = {
      deviceId: id,
      name: deviceDisplayName(row),
      model: normalizeBambuModel(row.model) || row.model || 'Unknown',
      family: modelFamily(row.model),
      serial: serialPair?.[1],
      swVersion: row.sw_version || undefined,
      entities,
      capabilities: caps,
      amsUnits,
      externalSpools,
      allEntityIds: [...Object.keys(entities), ...amsUnits.flatMap(a => a.entityIds), ...externalSpools.flatMap(a => a.entityIds)],
    };
    printer.allEntityIds.forEach(e => allIds.add(e));
    printers.push(printer);
  }

  printers.sort((a, b) => a.name.localeCompare(b.name));

  return {
    printers,
    allEntityIds: [...allIds],
    hasBambuIntegration: hasBambu || printers.length > 0,
  };
}

export function discoverBambuPrinters(
  hass: HomeAssistant | undefined | null,
  moduleId: string
): BambuTopology {
  if (!hass?.states) {
    return { printers: [], allEntityIds: [], hasBambuIntegration: false };
  }
  const reg = getRegistries(hass);
  return topologyMemo.read(
    moduleId,
    [hass.states, reg.entities, reg.devices],
    statesMemoKey('bambu'),
    () => buildTopologyFromHass(hass)
  );
}

export function forgetBambuTopology(moduleId: string): void {
  topologyMemo.forget(moduleId);
}

/** Apply a user order + hidden list to anything keyed by deviceId. */
export function orderByDeviceId<T extends { deviceId: string }>(
  items: T[],
  order?: readonly string[] | undefined,
  hiddenIds?: readonly string[] | undefined
): T[] {
  const hidden = new Set(hiddenIds || []);
  const visible = items.filter(p => !hidden.has(p.deviceId));
  if (!order?.length) return visible;
  const byId = new Map(visible.map(p => [p.deviceId, p]));
  const ordered: T[] = [];
  for (const id of order) {
    const p = byId.get(id);
    if (p) {
      ordered.push(p);
      byId.delete(id);
    }
  }
  for (const p of byId.values()) ordered.push(p);
  return ordered;
}

export function orderPrinters(
  printers: BambuPrinter[],
  order?: readonly string[] | undefined,
  hiddenIds?: readonly string[] | undefined
): BambuPrinter[] {
  return orderByDeviceId(printers, order, hiddenIds);
}

/** AMS units followed by external spool holders, in user order. */
export function spoolUnitsFor(
  printer: BambuPrinter,
  order?: readonly string[] | undefined,
  hiddenIds?: readonly string[] | undefined
): BambuAmsUnit[] {
  return orderByDeviceId([...printer.amsUnits, ...printer.externalSpools], order, hiddenIds);
}

/** True for one-slot holders (AMS HT, External Spool). */
export function isSingleSlotUnit(unit: Pick<BambuAmsUnit, 'model' | 'trays'>): boolean {
  const m = String(unit.model || '');
  return /\bHT\b/i.test(m) || /external/i.test(m) || unit.trays.length <= 1;
}

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                    */
/* -------------------------------------------------------------------------- */

function parseHms(hass: HomeAssistant, entityId: string | undefined): PrinterHmsError[] {
  if (!entityId) return [];
  const st = hass.states[entityId];
  if (!st || st.state === 'off') return [];
  const attrs = st.attributes as Record<string, unknown>;
  const out: PrinterHmsError[] = [];
  const count = parseNumber(attrs.Count) ?? 0;
  for (let i = 1; i <= Math.max(count, 8); i++) {
    const code = attrs[`${i}-Code`];
    if (!code) continue;
    out.push({
      code: String(code),
      error: String(attrs[`${i}-Error`] || ''),
      wiki: attrs[`${i}-Wiki`] != null ? String(attrs[`${i}-Wiki`]) : undefined,
      severity: attrs[`${i}-Severity`] != null ? String(attrs[`${i}-Severity`]) : undefined,
    });
  }
  return out;
}

function fanFrom(
  hass: HomeAssistant,
  entities: Record<string, string>,
  fanRole: string,
  speedRole: string,
  label: string
): PrinterFan | null {
  const fanEid = findRole(entities, fanRole);
  const speedEid = findRole(entities, speedRole);
  if (!fanEid && !speedEid) return null;
  let percent: number | null = null;
  if (fanEid) {
    const st = hass.states[fanEid];
    percent = parseNumber(st?.attributes?.percentage) ?? (st?.state === 'off' ? 0 : null);
  }
  if (percent == null && speedEid) percent = numState(hass, speedEid);
  return {
    id: fanEid || speedEid || label,
    label,
    percent,
    entityId: fanEid || speedEid,
    controllable: !!fanEid,
  };
}

export function bambuSnapshot(printer: BambuPrinter, hass: HomeAssistant): PrinterSnapshot {
  const e = printer.entities;
  const onlineEid = findRole(e, 'online');
  const online = onlineEid ? stateOf(hass, onlineEid) === 'on' : true;

  const printStatus = stateOf(hass, findRole(e, 'print_status'));
  const stage = stateOf(hass, findRole(e, 'stage'));
  let status = normalizeStatus(printStatus || stage, online);
  if (printStatus === 'running') status = 'printing';
  if (printStatus === 'pause') status = 'paused';
  if (printStatus === 'finish') status = 'finished';
  if (printStatus === 'failed') status = 'error';
  if (printStatus === 'prepare' || printStatus === 'init' || printStatus === 'slicing') {
    status = 'preparing';
  }
  if (stage === 'printing' && status === 'unknown') status = 'printing';

  const remainingEid = findRole(e, 'remaining_time');
  const remainingUnit = remainingEid
    ? String(hass.states[remainingEid]?.attributes?.unit_of_measurement || '')
    : '';

  const fans: PrinterFan[] = [];
  const cooling = fanFrom(hass, e, 'cooling_fan', 'cooling_fan_speed', 'Part Cooling');
  const aux = fanFrom(hass, e, 'aux_fan', 'aux_fan_speed', 'Aux');
  const chamber = fanFrom(hass, e, 'chamber_fan', 'chamber_fan_speed', 'Chamber');
  const secondary = fanFrom(hass, e, 'secondary_aux_fan', 'secondary_aux_fan_speed', 'Aux 2');
  if (cooling) fans.push(cooling);
  if (aux) fans.push(aux);
  if (chamber) fans.push(chamber);
  if (secondary) fans.push(secondary);

  const trays: PrinterTray[] = [];
  for (const unit of printer.amsUnits) {
    for (const t of unit.trays) trays.push({ ...t, amsName: unit.name, amsId: unit.deviceId });
  }
  const externalSpools: PrinterTray[] = [];
  for (const unit of printer.externalSpools) {
    for (const t of unit.trays) {
      externalSpools.push({ ...t, amsName: unit.name, amsId: unit.deviceId });
    }
  }

  // Refresh tray active flags from live state
  const refresh = (t: PrinterTray): PrinterTray =>
    t.entityId
      ? { ...trayFromEntity(hass, t.entityId, t.slot, t.amsIndex, t.amsName), amsId: t.amsId }
      : t;
  const liveTrays = trays.map(refresh);
  const liveExt = externalSpools.map(refresh);

  const activeTrayEid = findRole(e, 'active_tray');
  const activeAttrs = attrsOf(hass, activeTrayEid);
  const activeFilament = stateOf(hass, activeTrayEid) || undefined;
  let activeTrayId: string | undefined;
  const activeFromTrays = [...liveTrays, ...liveExt].find(t => t.active);
  if (activeFromTrays) activeTrayId = activeFromTrays.id;

  const lightEid = findRole(e, 'chamber_light') || findRole(e, 'heatbed_light');
  const printErrorEid = findRole(e, 'print_error');
  const printErrorState = stateOf(hass, printErrorEid);
  const printErrorAttrs = attrsOf(hass, printErrorEid);
  const printError =
    printErrorState === 'on'
      ? {
          code: String(printErrorAttrs.code || ''),
          error: String(printErrorAttrs.error || ''),
        }
      : null;

  const controls: PrinterControls = {
    pauseEntityId: findRole(e, 'pause'),
    resumeEntityId: findRole(e, 'resume'),
    stopEntityId: findRole(e, 'stop'),
    lightEntityId: lightEid,
    speedEntityId: findRole(e, 'printing_speed'),
    nozzleTargetEntityId: findRole(e, 'nozzle_target'),
    bedTargetEntityId: findRole(e, 'bed_target'),
    chamberTargetEntityId: findRole(e, 'chamber_target'),
  };

  const nozzleTarget =
    numState(hass, findRole(e, 'nozzle_target')) ??
    numState(hass, findRole(e, 'nozzle_target_sensor'));
  const bedTarget =
    numState(hass, findRole(e, 'bed_target')) ??
    numState(hass, findRole(e, 'bed_target_sensor'));
  const chamberTarget =
    numState(hass, findRole(e, 'chamber_target')) ??
    numState(hass, findRole(e, 'chamber_target_sensor'));

  const cameraEid =
    findRole(e, 'camera') || findRole(e, 'camera_image') || undefined;

  const snap: PrinterSnapshot = {
    id: printer.deviceId,
    name: printer.name,
    model: printer.model,
    modelFamily: printer.family,
    online,
    status,
    statusRaw: printStatus || stage || undefined,
    stage: stage || undefined,
    progress: numState(hass, findRole(e, 'print_progress')),
    currentLayer: numState(hass, findRole(e, 'current_layer')),
    totalLayers: numState(hass, findRole(e, 'total_layers')),
    remainingMinutes: parseRemainingMinutes(stateOf(hass, remainingEid), remainingUnit),
    endTime: stateOf(hass, findRole(e, 'end_time')) || undefined,
    startTime: stateOf(hass, findRole(e, 'start_time')) || undefined,
    taskName: stateOf(hass, findRole(e, 'task_name')) || undefined,
    fileName: stateOf(hass, findRole(e, 'gcode_file')) || undefined,
    nozzleTemp: numState(hass, findRole(e, 'nozzle_temp')),
    nozzleTarget,
    bedTemp: numState(hass, findRole(e, 'bed_temp')),
    bedTarget,
    chamberTemp: numState(hass, findRole(e, 'chamber_temp')),
    chamberTarget,
    fans,
    speedProfile: (stateOf(hass, findRole(e, 'speed_profile')) ||
      stateOf(hass, findRole(e, 'printing_speed')) ||
      undefined) as PrinterSnapshot['speedProfile'],
    trays: liveTrays,
    externalSpools: liveExt,
    activeTrayId,
    activeFilament: activeFilament === 'none' ? undefined : activeFilament,
    hms: parseHms(hass, findRole(e, 'hms')),
    printError,
    doorOpen: (() => {
      const d = findRole(e, 'door');
      if (!d) return null;
      return stateOf(hass, d) === 'on';
    })(),
    cameraEntityId: cameraEid,
    coverImageEntityId: findRole(e, 'cover_image'),
    lightOn: lightEid ? stateOf(hass, lightEid) === 'on' : null,
    controls,
    refs: {
      status: findRole(e, 'print_status') || findRole(e, 'stage'),
      stage: findRole(e, 'stage'),
      progress: findRole(e, 'print_progress'),
      nozzleTemp: findRole(e, 'nozzle_temp'),
      bedTemp: findRole(e, 'bed_temp'),
      chamberTemp: findRole(e, 'chamber_temp'),
      remaining: remainingEid,
      endTime: findRole(e, 'end_time'),
      startTime: findRole(e, 'start_time'),
      taskName: findRole(e, 'task_name') || findRole(e, 'gcode_file'),
      layer: findRole(e, 'current_layer'),
      speed: findRole(e, 'printing_speed') || findRole(e, 'speed_profile'),
      hms: findRole(e, 'hms'),
      printError: printErrorEid,
      activeTray: activeTrayEid,
      camera: cameraEid,
      light: lightEid,
      door: findRole(e, 'door'),
    },
    entityIds: printer.allEntityIds,
  };

  // Silence unused — activeAttrs kept for future tray_index overlay
  void activeAttrs;
  return snap;
}

export function emptyBambuSnapshot(): PrinterSnapshot {
  return emptySnapshot('bambu', 'Bambu Lab');
}

/* -------------------------------------------------------------------------- */
/* Setup hints                                                                 */
/* -------------------------------------------------------------------------- */

export function bambuSetupHints(
  topo: BambuTopology,
  hass: HomeAssistant | undefined | null,
  selected?: BambuPrinter | undefined
): BambuSetupHint[] {
  const hints: BambuSetupHint[] = [];
  if (!topo.hasBambuIntegration) {
    hints.push({
      id: 'no_integration',
      severity: 'warning',
      message:
        'Install and configure the Bambu Lab integration (greghesp/ha-bambulab) to auto-discover printers.',
    });
    return hints;
  }
  if (!topo.printers.length) {
    hints.push({
      id: 'no_printers',
      severity: 'warning',
      message: 'Bambu Lab is configured but no printers were found in the device registry.',
    });
    return hints;
  }
  const p = selected || topo.printers[0];
  if (!p || !hass) return hints;
  const onlineEid = findRole(p.entities, 'online');
  if (onlineEid && stateOf(hass, onlineEid) !== 'on') {
    hints.push({
      id: 'offline',
      severity: 'warning',
      message: `${p.name} appears offline.`,
      printerDeviceId: p.deviceId,
    });
  }
  const camSwitch = findRole(p.entities, 'camera_switch');
  if (camSwitch && stateOf(hass, camSwitch) === 'off' && !p.capabilities.camera) {
    hints.push({
      id: 'camera_off',
      severity: 'info',
      message: 'Camera is disabled — turn on the Camera switch in Home Assistant to show a live view.',
      printerDeviceId: p.deviceId,
    });
  }
  if (!p.capabilities.ams && !p.externalSpools.length) {
    hints.push({
      id: 'no_ams',
      severity: 'info',
      message: 'No AMS units discovered for this printer. External spool still works when configured.',
      printerDeviceId: p.deviceId,
    });
  }
  return hints;
}

/** Resolve a role entity id on a printer (test helper / controls). */
export function printerEntity(printer: BambuPrinter, role: string): string | undefined {
  return findRole(printer.entities, role);
}

export function printerEntities(printer: BambuPrinter, role: string): string[] {
  return findRoles(printer.entities, role);
}
