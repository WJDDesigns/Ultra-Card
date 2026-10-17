import type { HomeAssistant } from '../ha/types';
import type { CameraActionButton } from '../types';

/** How long a confirm-first button waits for the second tap. */
export const CAMERA_ACTION_CONFIRM_MS = 4000;

/** Seconds a triggered stream stays live once the trigger ends, unless configured. */
export const DEFAULT_LIVE_TRIGGER_HOLD = 60;

const ON_STATES = new Set(['on', 'open', 'opening', 'detected', 'home', 'playing', 'true']);

interface EntityLike {
  entity_id?: string;
  state: string;
  last_changed?: string;
  attributes?: Record<string, unknown>;
}

const domainOf = (entityId: string): string => entityId.split('.')[0] || '';

const stringAttr = (stateObj: EntityLike | undefined, key: string): string | undefined => {
  const value = stateObj?.attributes?.[key];
  return typeof value === 'string' && value ? value : undefined;
};

/** Locks unlock on a single tap otherwise, so they ask twice unless told not to. */
export function cameraActionNeedsConfirm(button: CameraActionButton): boolean {
  if (typeof button.confirm === 'boolean') return button.confirm;
  return domainOf(button.entity) === 'lock';
}

/** The service a button calls for the entity's current state. */
export function cameraActionService(
  entityId: string,
  stateObj?: EntityLike
): { domain: string; service: string } {
  const domain = domainOf(entityId);
  switch (domain) {
    case 'lock':
      return { domain: 'lock', service: stateObj?.state === 'locked' ? 'unlock' : 'lock' };
    case 'cover':
      return { domain: 'cover', service: 'toggle' };
    case 'button':
    case 'input_button':
      return { domain, service: 'press' };
    case 'scene':
    case 'script':
      return { domain, service: 'turn_on' };
    case 'automation':
      return { domain, service: 'trigger' };
    default:
      return { domain: 'homeassistant', service: 'toggle' };
  }
}

/** Unlocked, open or on reads as "active" and gets the highlight color. */
export function cameraActionIsActive(entityId: string, stateObj?: EntityLike): boolean {
  if (!stateObj) return false;
  if (domainOf(entityId) === 'lock') {
    return (
      stateObj.state === 'unlocked' || stateObj.state === 'open' || stateObj.state === 'opening'
    );
  }
  return ON_STATES.has(stateObj.state);
}

export function cameraActionIcon(button: CameraActionButton, stateObj?: EntityLike): string {
  if (button.icon) return button.icon;
  const state = stateObj?.state;
  switch (domainOf(button.entity)) {
    case 'lock':
      if (state === 'jammed') return 'mdi:lock-alert';
      if (state === 'locking' || state === 'unlocking') return 'mdi:lock-clock';
      return state === 'locked' ? 'mdi:lock' : 'mdi:lock-open-variant';
    case 'cover':
      if (stateObj?.attributes?.device_class === 'garage') {
        return state === 'closed' ? 'mdi:garage' : 'mdi:garage-open';
      }
      if (stateObj?.attributes?.device_class === 'gate') {
        return state === 'closed' ? 'mdi:gate' : 'mdi:gate-open';
      }
      return state === 'closed' ? 'mdi:window-shutter' : 'mdi:window-shutter-open';
    case 'light':
      return 'mdi:lightbulb';
    case 'siren':
      return 'mdi:bullhorn';
    case 'button':
    case 'input_button':
      return stringAttr(stateObj, 'icon') || 'mdi:gesture-tap-button';
    default:
      return stringAttr(stateObj, 'icon') || 'mdi:gesture-tap';
  }
}

export function cameraActionLabel(button: CameraActionButton, stateObj?: EntityLike): string {
  return button.label || stringAttr(stateObj, 'friendly_name') || button.entity;
}

export async function runCameraAction(
  hass: HomeAssistant,
  button: CameraActionButton
): Promise<void> {
  const stateObj = hass.states?.[button.entity] as EntityLike | undefined;
  const { domain, service } = cameraActionService(button.entity, stateObj);
  await hass.callService(domain, service, { entity_id: button.entity });
}

/**
 * Whether a camera with a live trigger should be streaming right now.
 *
 * Event entities (a doorbell's `event.front_door_ding`) hold the time they last fired as their
 * state, so the stream stays live for `holdSeconds` after that. On/off entities stay live while
 * on and for `holdSeconds` after they turn off. `until` is when a held stream drops back, so the
 * caller can schedule a repaint for it.
 */
export function cameraLiveTriggerState(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
  holdSeconds: number | undefined,
  now: number = Date.now()
): { live: boolean; until?: number } {
  if (!entityId || !hass?.states) return { live: false };
  const stateObj = hass.states[entityId] as EntityLike | undefined;
  if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
    return { live: false };
  }
  const holdMs =
    Math.max(
      0,
      Number.isFinite(holdSeconds) ? (holdSeconds as number) : DEFAULT_LIVE_TRIGGER_HOLD
    ) * 1000;

  if (domainOf(entityId) === 'event') {
    const fired = Date.parse(stateObj.state);
    if (!Number.isFinite(fired)) return { live: false };
    const until = fired + holdMs;
    return until > now ? { live: true, until } : { live: false };
  }

  if (ON_STATES.has(stateObj.state)) return { live: true };

  const changed = stateObj.last_changed ? Date.parse(stateObj.last_changed) : NaN;
  if (!Number.isFinite(changed)) return { live: false };
  const until = changed + holdMs;
  return until > now ? { live: true, until } : { live: false };
}
