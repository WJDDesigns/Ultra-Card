import type { SmartSanitizeHass } from '../uc-smart-module-sanitizer';

export type SmartModule = Record<string, unknown>;

export function entityExists(hass: SmartSanitizeHass, entityId: string): boolean {
  return Boolean(entityId && hass.states && entityId in hass.states);
}

export function entityName(hass: SmartSanitizeHass, entityId: string, state?: unknown): string {
  const stateObj = state ?? hass.states?.[entityId];
  const attrs =
    stateObj && typeof stateObj === 'object' && 'attributes' in stateObj
      ? ((stateObj as { attributes?: Record<string, unknown> }).attributes || {})
      : {};
  return String(attrs.friendly_name || labelFromEntityId(entityId));
}

export function labelFromEntityId(entityId: string): string {
  const objectId = entityId.split('.')[1] || entityId;
  return objectId
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const SEPARATOR_REQUEST = /\b(separators?|dividers?|divider lines?|dividing lines?|horizontal rules?)\b/i;

/** Dividers are only added when the prompt explicitly asks for them. */
export function promptRequestsSeparators(prompt: unknown): boolean {
  return SEPARATOR_REQUEST.test(String(prompt || ''));
}

/**
 * Drops separator modules (recursively) from a module list unless the prompt asked for them.
 * Returns the same array instance when nothing changed.
 */
export function stripUnrequestedSeparators(modules: SmartModule[], prompt: unknown): SmartModule[] {
  if (promptRequestsSeparators(prompt)) return modules;
  let changed = false;
  const result: SmartModule[] = [];
  for (const module of modules) {
    if (!module || typeof module !== 'object') {
      result.push(module);
      continue;
    }
    if (module.type === 'separator') {
      changed = true;
      continue;
    }
    if (Array.isArray(module.modules)) {
      const inner = stripUnrequestedSeparators(module.modules as SmartModule[], prompt);
      if (inner !== module.modules) {
        changed = true;
        result.push({ ...module, modules: inner });
        continue;
      }
    }
    result.push(module);
  }
  return changed ? result : modules;
}

export function findFirstEntityForDomain(hass: SmartSanitizeHass, domain: string): string {
  return Object.keys(hass.states || {}).find(entityId => entityId.startsWith(`${domain}.`)) || '';
}

export function sanitizeAction(value: unknown, hass: SmartSanitizeHass): Record<string, unknown> {
  if (!value || typeof value !== 'object') return { action: 'nothing' };
  const action = value as Record<string, unknown>;
  const actionType = String(action.action || '');
  if (actionType === 'toggle' || actionType === 'more-info') {
    const entity = String(action.entity || '');
    return entityExists(hass, entity) ? { action: actionType, entity } : { action: 'nothing' };
  }
  if (actionType === 'perform-action') {
    const service = String(action.service || '');
    return service.includes('.')
      ? { action: 'perform-action', service, service_data: action.service_data || {} }
      : { action: 'nothing' };
  }
  return { action: 'nothing' };
}

export function numberInRange(value: unknown, min: number, max: number, fallback: number): number;
export function numberInRange(value: unknown, min: number, max: number, fallback: undefined): number | undefined;
export function numberInRange(
  value: unknown,
  min: number,
  max: number,
  fallback: number | undefined
): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export type SmartIconPair = {
  inactive: string;
  active: string;
  inactiveState: string;
  activeState: string;
  /** True for numeric/text entities where on/off styling makes no sense. */
  stateless: boolean;
};

/**
 * Icon pair for the icon module keyed by domain + device_class so status rows read as
 * what they are (a door, a thermometer, a plug) instead of a generic circle.
 */
export function iconPairForEntity(
  domain: string,
  deviceClass?: string | undefined,
  entityIcon?: string | undefined
): SmartIconPair {
  const dc = deviceClass || '';
  const onOff = (inactive: string, active: string): SmartIconPair => ({
    inactive,
    active,
    inactiveState: 'off',
    activeState: 'on',
    stateless: false,
  });
  const stateless = (icon: string): SmartIconPair => ({
    inactive: icon,
    active: icon,
    inactiveState: '',
    activeState: '',
    stateless: true,
  });

  if (entityIcon && domain !== 'light' && domain !== 'switch') {
    return domain === 'sensor' ? stateless(entityIcon) : onOff(entityIcon, entityIcon);
  }

  switch (domain) {
    case 'light':
      return onOff('mdi:lightbulb-outline', 'mdi:lightbulb');
    case 'switch':
      if (dc === 'outlet') return onOff('mdi:power-plug-off-outline', 'mdi:power-plug');
      return onOff('mdi:toggle-switch-off-outline', 'mdi:toggle-switch');
    case 'input_boolean':
      return onOff('mdi:toggle-switch-off-outline', 'mdi:toggle-switch');
    case 'automation':
      return onOff('mdi:robot-off-outline', 'mdi:robot');
    case 'script':
      return stateless('mdi:script-text-outline');
    case 'scene':
      return stateless('mdi:palette');
    case 'fan':
      return onOff('mdi:fan-off', 'mdi:fan');
    case 'lock':
      return { inactive: 'mdi:lock', active: 'mdi:lock-open-variant', inactiveState: 'locked', activeState: 'unlocked', stateless: false };
    case 'cover':
      if (dc === 'garage') return { inactive: 'mdi:garage', active: 'mdi:garage-open', inactiveState: 'closed', activeState: 'open', stateless: false };
      if (dc === 'blind' || dc === 'shade' || dc === 'shutter' || dc === 'curtain') {
        return { inactive: 'mdi:blinds', active: 'mdi:blinds-open', inactiveState: 'closed', activeState: 'open', stateless: false };
      }
      return { inactive: 'mdi:window-shutter', active: 'mdi:window-shutter-open', inactiveState: 'closed', activeState: 'open', stateless: false };
    case 'climate':
      return stateless('mdi:thermostat');
    case 'humidifier':
      return onOff('mdi:air-humidifier-off', 'mdi:air-humidifier');
    case 'water_heater':
      return stateless('mdi:water-boiler');
    case 'media_player':
      return { inactive: 'mdi:speaker-off', active: 'mdi:speaker-play', inactiveState: 'off', activeState: 'playing', stateless: false };
    case 'camera':
      return stateless('mdi:cctv');
    case 'vacuum':
      return { inactive: 'mdi:robot-vacuum', active: 'mdi:robot-vacuum', inactiveState: 'docked', activeState: 'cleaning', stateless: false };
    case 'person':
    case 'device_tracker':
      return { inactive: 'mdi:account-off-outline', active: 'mdi:account', inactiveState: 'not_home', activeState: 'home', stateless: false };
    case 'alarm_control_panel':
      return { inactive: 'mdi:shield-off-outline', active: 'mdi:shield-home', inactiveState: 'disarmed', activeState: 'armed_home', stateless: false };
    case 'weather':
      return stateless('mdi:weather-partly-cloudy');
    case 'calendar':
      return onOff('mdi:calendar-blank-outline', 'mdi:calendar-check');
    case 'todo':
      return stateless('mdi:format-list-checks');
    case 'binary_sensor':
      switch (dc) {
        case 'door':
          return onOff('mdi:door-closed', 'mdi:door-open');
        case 'garage_door':
          return onOff('mdi:garage', 'mdi:garage-open');
        case 'window':
          return onOff('mdi:window-closed-variant', 'mdi:window-open-variant');
        case 'opening':
          return onOff('mdi:square', 'mdi:square-outline');
        case 'motion':
          return onOff('mdi:motion-sensor-off', 'mdi:motion-sensor');
        case 'occupancy':
        case 'presence':
          return onOff('mdi:home-outline', 'mdi:home');
        case 'smoke':
          return onOff('mdi:smoke-detector-variant', 'mdi:smoke-detector-variant-alert');
        case 'carbon_monoxide':
        case 'gas':
          return onOff('mdi:molecule-co', 'mdi:molecule-co');
        case 'moisture':
          return onOff('mdi:water-off', 'mdi:water-alert');
        case 'vibration':
          return onOff('mdi:vibrate-off', 'mdi:vibrate');
        case 'connectivity':
          return onOff('mdi:lan-disconnect', 'mdi:lan-connect');
        case 'battery':
          return onOff('mdi:battery', 'mdi:battery-alert');
        case 'plug':
          return onOff('mdi:power-plug-off', 'mdi:power-plug');
        case 'lock':
          return onOff('mdi:lock', 'mdi:lock-open');
        default:
          return onOff('mdi:radiobox-blank', 'mdi:checkbox-blank-circle');
      }
    case 'sensor':
      switch (dc) {
        case 'temperature':
          return stateless('mdi:thermometer');
        case 'humidity':
        case 'moisture':
          return stateless('mdi:water-percent');
        case 'battery':
          return stateless('mdi:battery');
        case 'power':
          return stateless('mdi:flash');
        case 'energy':
          return stateless('mdi:lightning-bolt');
        case 'illuminance':
          return stateless('mdi:brightness-5');
        case 'pressure':
        case 'atmospheric_pressure':
          return stateless('mdi:gauge');
        case 'carbon_dioxide':
        case 'pm25':
        case 'pm10':
        case 'volatile_organic_compounds':
        case 'aqi':
          return stateless('mdi:air-filter');
        case 'fuel':
        case 'volume_storage':
          return stateless('mdi:gas-station');
        case 'voltage':
          return stateless('mdi:sine-wave');
        case 'current':
          return stateless('mdi:current-ac');
        case 'timestamp':
          return stateless('mdi:clock-outline');
        default:
          return stateless('mdi:eye-outline');
      }
    default:
      return onOff('mdi:circle-outline', 'mdi:circle');
  }
}

export function entityDeviceClass(hass: SmartSanitizeHass, entityId: string): string | undefined {
  const stateObj = hass.states?.[entityId];
  const attrs =
    stateObj && typeof stateObj === 'object' && 'attributes' in stateObj
      ? ((stateObj as { attributes?: Record<string, unknown> }).attributes || {})
      : {};
  return attrs.device_class ? String(attrs.device_class) : undefined;
}

export function entityIcon(hass: SmartSanitizeHass, entityId: string): string | undefined {
  const stateObj = hass.states?.[entityId];
  const attrs =
    stateObj && typeof stateObj === 'object' && 'attributes' in stateObj
      ? ((stateObj as { attributes?: Record<string, unknown> }).attributes || {})
      : {};
  return typeof attrs.icon === 'string' && attrs.icon.startsWith('mdi:') ? attrs.icon : undefined;
}

export function defaultDisplayActions(): Record<string, unknown> {
  return {
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}
