import type { HomeAssistant } from '../ha/types';

/**
 * Door/lid helpers shared by the appliance modules and the Laundry Tracker.
 *
 * Door entities come in two shapes:
 * - a `binary_sensor` (on = open), from smart plugs, Zigbee contacts, SmartThings…
 * - an enum `sensor`, from Bosch/Siemens/Neff Home Connect: core reports
 *   `open` / `closed` / `locked`, Home Connect Alt reports the raw API value
 *   (`BSH.Common.EnumType.DoorState.Open`) or server-translated text.
 *
 * A washer door that is `locked` is shut, so only explicit "open" values count.
 */
const OPEN_DOOR_STATES = new Set([
  'on',
  'open',
  'opened',
  'true',
  'ajar',
  // Server-translated Home Connect Alt values
  'offen',
  'geöffnet',
  'geoeffnet',
  'ouvert',
  'ouverte',
  'aperto',
  'abierto',
  'geopend',
]);

/** Lower-cased state with any `BSH.Common.EnumType.DoorState.` style prefix removed. */
export function normalizeEnumState(state: unknown): string {
  if (state === null || state === undefined) return '';
  const s = String(state).trim().toLowerCase();
  const dot = s.lastIndexOf('.');
  return dot >= 0 && dot < s.length - 1 && /^[a-z_]+(\.[a-z_]+)+$/.test(s) ? s.slice(dot + 1) : s;
}

/** True when a door/lid entity state means the door is open. */
export function isDoorOpenState(state: unknown): boolean {
  return OPEN_DOOR_STATES.has(normalizeEnumState(state));
}

type RegistryEntry = { device_id?: string; translation_key?: string; platform?: string };

function registry(hass: HomeAssistant): Record<string, RegistryEntry> | undefined {
  return (hass as unknown as { entities?: Record<string, RegistryEntry> }).entities;
}

function siblings(hass: HomeAssistant, entityId: string): string[] {
  const entities = registry(hass);
  const deviceId = entities?.[entityId]?.device_id;
  if (!entities || !deviceId) return [];
  return Object.keys(entities).filter(
    id => entities[id]?.device_id === deviceId && !!hass.states?.[id]
  );
}

const ALT_DOOR_RE = /^(binary_)?sensor\..*bsh_common_status_doorstate(_\d+)?$/;
const ALT_OPERATION_RE = /^sensor\..*bsh_common_status_operationstate(_\d+)?$/;

/**
 * Door and operation-state entities on the same Home Connect device as
 * `entityId` (core integration by translation key, Home Connect Alt by
 * entity id). Empty when the entity isn't on a Home Connect device.
 */
export function findHomeConnectLinks(
  hass: HomeAssistant | undefined,
  entityId: string | undefined
): { door?: string; operationState?: string } {
  if (!hass || !entityId) return {};
  const entities = registry(hass);
  const ids = siblings(hass, entityId);
  if (!entities || ids.length === 0) return {};

  const byKey = (key: string) =>
    ids.find(
      id =>
        id.startsWith('sensor.') &&
        entities[id]?.translation_key === key &&
        (!entities[id]?.platform || entities[id]?.platform === 'home_connect')
    );

  const door = byKey('door') ?? ids.find(id => ALT_DOOR_RE.test(id));
  const operationState = byKey('operation_state') ?? ids.find(id => ALT_OPERATION_RE.test(id));
  const result: { door?: string; operationState?: string } = {};
  if (door) result.door = door;
  if (operationState) result.operationState = operationState;
  return result;
}
