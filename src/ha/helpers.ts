/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type -- shapes copied from custom-card-helpers / HA frontend */
/**
 * The three runtime helpers Ultra Card used from custom-card-helpers.
 */

export type HapticType =
  | 'success'
  | 'warning'
  | 'failure'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection';

export interface HASSDomEvent<T> extends Event {
  detail: T;
}

declare global {
  interface HASSDomEvents {
    'value-changed': { value: unknown };
    'config-changed': { config: any };
    'hass-more-info': { entityId: string | undefined };
    'll-rebuild': {};
    'll-custom': {};
    'location-changed': { replace: boolean };
    'show-dialog': {};
    undefined: any;
    action: { action: string };
    haptic: HapticType;
  }
  interface GlobalEventHandlersEventMap {
    haptic: HASSDomEvent<HapticType>;
  }
}

/** Dispatch a bubbling, composed custom event, as HA's own fireEvent does. */
export const fireEvent = <HassEvent extends keyof HASSDomEvents>(
  node: HTMLElement | Window,
  type: HassEvent,
  detail?: HASSDomEvents[HassEvent],
  options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }
): Event => {
  const event = new Event(type, {
    bubbles: options?.bubbles ?? true,
    cancelable: Boolean(options?.cancelable),
    composed: options?.composed ?? true,
  });
  (event as any).detail = detail === null || detail === undefined ? {} : detail;
  node.dispatchEvent(event);
  return event;
};

/** Ask the HA companion app for haptic feedback. */
export const forwardHaptic = (hapticType: HapticType): void => {
  fireEvent(window, 'haptic', hapticType);
};
