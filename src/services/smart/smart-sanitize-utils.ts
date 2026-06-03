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

export function defaultDisplayActions(): Record<string, unknown> {
  return {
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}
