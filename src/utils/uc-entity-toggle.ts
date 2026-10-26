/**
 * Domain-aware toggle, matching what Home Assistant's own frontend does for a
 * "toggle" tap action. `homeassistant.toggle` only reaches domains that have a
 * `toggle` service, so locks, buttons and scenes silently did nothing.
 */

interface EntityLike {
  state: string;
}

export interface ServiceCall {
  domain: string;
  service: string;
}

/** States HA treats as "off" when deciding which way a toggle goes. */
const OFF_STATES = new Set(['off', 'closed', 'locked']);

const domainOf = (entityId: string): string => entityId.split('.')[0] || '';

/** The service that turns an entity on (true) or off (false) for its domain. */
export function entityTurnOnOffService(entityId: string, turnOn: boolean): ServiceCall {
  const domain = domainOf(entityId);
  switch (domain) {
    case 'lock':
      return { domain, service: turnOn ? 'unlock' : 'lock' };
    case 'cover':
      return { domain, service: turnOn ? 'open_cover' : 'close_cover' };
    case 'valve':
      return { domain, service: turnOn ? 'open_valve' : 'close_valve' };
    case 'button':
    case 'input_button':
      return { domain, service: 'press' };
    case 'scene':
      return { domain, service: 'turn_on' };
    default:
      return { domain: 'homeassistant', service: turnOn ? 'turn_on' : 'turn_off' };
  }
}

/** The service a toggle should call for an entity in its current state. */
export function entityToggleService(entityId: string, stateObj?: EntityLike): ServiceCall {
  const domain = domainOf(entityId);
  switch (domain) {
    case 'lock':
    case 'button':
    case 'input_button':
    case 'scene':
      return entityTurnOnOffService(entityId, OFF_STATES.has(stateObj?.state ?? ''));
    case 'cover':
    case 'valve':
      return { domain, service: 'toggle' };
    default:
      return { domain: 'homeassistant', service: 'toggle' };
  }
}

/** Domains `homeassistant.toggle` can't reach, so each entity needs its own call. */
const NEEDS_OWN_CALL = new Set(['lock', 'button', 'input_button', 'scene']);

/**
 * Toggles one or more entities. Ordinary entities still go through one
 * `homeassistant.toggle` call; locks, buttons and scenes get their own service.
 */
export function toggleEntities(
  hass: {
    states: Record<string, EntityLike | undefined>;
    callService: (domain: string, service: string, data?: Record<string, unknown>) => unknown;
  },
  entityIds: string | string[]
): Promise<unknown> {
  const ids = (Array.isArray(entityIds) ? entityIds : [entityIds]).filter(Boolean);
  const plain: string[] = [];
  const calls: unknown[] = [];
  for (const id of ids) {
    if (NEEDS_OWN_CALL.has(domainOf(id))) {
      const { domain, service } = entityToggleService(id, hass.states[id]);
      calls.push(hass.callService(domain, service, { entity_id: id }));
    } else {
      plain.push(id);
    }
  }
  if (plain.length) {
    calls.push(
      hass.callService('homeassistant', 'toggle', {
        entity_id: plain.length === 1 ? plain[0] : plain,
      })
    );
  }
  return Promise.all(calls);
}
