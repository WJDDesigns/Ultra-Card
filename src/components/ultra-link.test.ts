import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UltraLinkComponent, TapActionConfig } from './ultra-link';

function makeHass() {
  return {
    callService: vi.fn(),
    states: {},
    locale: { language: 'en' },
  } as any;
}

const POPUP_KEY = 'uc-1234:popup-5678';

/** Mimic a popup portal on document.body with a button rendered inside it. */
function mountPopupPortal(): HTMLElement {
  const portal = document.createElement('div');
  portal.id = `ultra-popup-portal-${POPUP_KEY}`;
  portal.className = 'ultra-popup-portal';
  const button = document.createElement('button');
  portal.appendChild(button);
  document.body.appendChild(portal);

  (window as any).__ultraPopupStore__ = {
    states: new Map([[POPUP_KEY, true]]),
    manuallyOpened: new Set([POPUP_KEY]),
    timers: new Map(),
  };

  return button;
}

describe('UltraLinkComponent entity-bound action normalization', () => {
  it('uses the current icon entity for stale copied more-info actions', async () => {
    const hass = makeHass();
    const dispatchEvent = vi.fn();
    const element = { dispatchEvent } as any as HTMLElement;

    const action: TapActionConfig = {
      action: 'more-info',
      entity: 'sensor.source_card_entity',
    };

    await UltraLinkComponent.handleAction(
      action,
      hass,
      element,
      { haptic_feedback: false } as any,
      'sensor.duplicated_card_entity',
      {
        type: 'icon',
        icons: [{ entity: 'sensor.duplicated_card_entity' }],
      } as any
    );

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    const event = dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('hass-more-info');
    expect(event.detail.entityId).toBe('sensor.duplicated_card_entity');
  });

  it('heals stale info-module action entities from duplicated modules', async () => {
    const hass = makeHass();
    const dispatchEvent = vi.fn();
    const element = { dispatchEvent } as any as HTMLElement;

    const action: TapActionConfig = {
      action: 'more-info',
      entity: 'sensor.old_info_entity',
    };

    await UltraLinkComponent.handleAction(
      action,
      hass,
      element,
      { haptic_feedback: false } as any,
      undefined,
      {
        type: 'info',
        info_entities: [{ entity: 'sensor.new_info_entity' }],
      } as any
    );

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    const event = dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('hass-more-info');
    expect(event.detail.entityId).toBe('sensor.new_info_entity');
  });
});

describe('UltraLinkComponent legacy call-service action', () => {
  it('executes a call-service action the same as perform-action', async () => {
    const hass = makeHass();
    const element = document.createElement('button');

    await UltraLinkComponent.handleAction(
      { action: 'call-service', service: 'light.turn_on', data: { brightness: 128 } },
      hass,
      element,
      { haptic_feedback: false } as any
    );

    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', { brightness: 128 });
  });

  it('auto-injects entity_id for call-service when no explicit data is given', async () => {
    const hass = makeHass();
    const element = document.createElement('button');

    await UltraLinkComponent.handleAction(
      { action: 'call-service', service: 'light.toggle', entity: 'light.kitchen' },
      hass,
      element,
      { haptic_feedback: false } as any
    );

    expect(hass.callService).toHaveBeenCalledWith('light', 'toggle', {
      entity_id: 'light.kitchen',
    });
  });
});

describe('UltraLinkComponent close popup after action', () => {
  let closeEvents: CustomEvent[];
  let listener: (e: Event) => void;

  beforeEach(() => {
    closeEvents = [];
    listener = (e: Event) => closeEvents.push(e as CustomEvent);
    window.addEventListener('ultra-popup-close', listener);
  });

  afterEach(() => {
    window.removeEventListener('ultra-popup-close', listener);
    document.querySelectorAll('.ultra-popup-portal').forEach(el => el.remove());
    delete (window as any).__ultraPopupStore__;
  });

  it('closes the containing popup after running the action', async () => {
    const hass = makeHass();
    const button = mountPopupPortal();

    await UltraLinkComponent.handleAction(
      { action: 'perform-action', perform_action: 'script.create_reminder' },
      hass,
      button,
      { haptic_feedback: false } as any,
      undefined,
      { type: 'button', id: 'button-1', close_popup_after_action: true } as any
    );

    expect(hass.callService).toHaveBeenCalledWith('script', 'create_reminder', {});
    expect(closeEvents).toHaveLength(1);
    expect(closeEvents[0].detail.popupKey).toBe(POPUP_KEY);

    const store = (window as any).__ultraPopupStore__;
    expect(store.states.get(POPUP_KEY)).toBe(false);
    // Manual-open is sticky and would force the popup back open on next render
    expect(store.manuallyOpened.has(POPUP_KEY)).toBe(false);
  });

  it('closes the popup for a button with no action of its own', async () => {
    const hass = makeHass();
    const button = mountPopupPortal();

    await UltraLinkComponent.handleAction(
      { action: 'nothing' },
      hass,
      button,
      { haptic_feedback: false } as any,
      undefined,
      { type: 'button', id: 'button-1', close_popup_after_action: true } as any
    );

    expect(closeEvents).toHaveLength(1);
  });

  it('leaves the popup open when the toggle is off', async () => {
    const hass = makeHass();
    const button = mountPopupPortal();

    await UltraLinkComponent.handleAction(
      { action: 'perform-action', perform_action: 'script.create_reminder' },
      hass,
      button,
      { haptic_feedback: false } as any,
      undefined,
      { type: 'button', id: 'button-1' } as any
    );

    expect(hass.callService).toHaveBeenCalled();
    expect(closeEvents).toHaveLength(0);
  });

  it('is a no-op for a module that is not inside a popup', async () => {
    const hass = makeHass();
    const button = document.createElement('button');
    document.body.appendChild(button);

    await UltraLinkComponent.handleAction(
      { action: 'perform-action', perform_action: 'script.create_reminder' },
      hass,
      button,
      { haptic_feedback: false } as any,
      undefined,
      { type: 'button', id: 'button-1', close_popup_after_action: true } as any
    );

    expect(hass.callService).toHaveBeenCalled();
    expect(closeEvents).toHaveLength(0);
    button.remove();
  });
});
