import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ucGestureService,
  hasActionableGesture,
  lastInputModalityWasKeyboard,
  POINTER_FOCUS_ATTR,
} from './uc-gesture-service';
import { UltraLinkComponent } from '../components/ultra-link';
import type { HomeAssistant } from 'custom-card-helpers';

/**
 * H7: the service bound only pointer events, so keyboard and screen-reader users
 * could not activate most Ultra Card controls at all.
 */

const hass = { states: {} } as unknown as HomeAssistant;

let handleAction: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  handleAction = vi.spyOn(UltraLinkComponent, 'handleAction').mockImplementation(async () => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** A gesture element with a nested child, mirroring real module markup. */
function makeElements(): { host: HTMLElement; child: HTMLElement } {
  const host = document.createElement('div');
  const child = document.createElement('span');
  host.appendChild(child);
  document.body.appendChild(host);
  return { host, child };
}

function keyEvent(key: string, target: HTMLElement, currentTarget: HTMLElement): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  Object.defineProperty(event, 'target', { value: target });
  Object.defineProperty(event, 'currentTarget', { value: currentTarget });
  return event;
}

describe('keyboard activation', () => {
  it('runs the tap action on Enter', () => {
    const { host } = makeElements();
    const handlers = ucGestureService.createGestureHandlers(
      'k-enter',
      { tap_action: { action: 'toggle' }, entity: 'light.x' },
      hass
    );

    handlers.onKeyDown(keyEvent('Enter', host, host));

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleAction.mock.calls[0]?.[0]).toEqual({ action: 'toggle' });
  });

  it('runs the tap action on Space', () => {
    const { host } = makeElements();
    const handlers = ucGestureService.createGestureHandlers(
      'k-space',
      { tap_action: { action: 'toggle' } },
      hass
    );

    handlers.onKeyDown(keyEvent(' ', host, host));

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('prevents default so Space does not scroll the page', () => {
    const { host } = makeElements();
    const handlers = ucGestureService.createGestureHandlers(
      'k-prevent',
      { tap_action: { action: 'toggle' } },
      hass
    );
    const event = keyEvent(' ', host, host);

    handlers.onKeyDown(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores other keys', () => {
    const { host } = makeElements();
    const handlers = ucGestureService.createGestureHandlers(
      'k-other',
      { tap_action: { action: 'toggle' } },
      hass
    );

    handlers.onKeyDown(keyEvent('a', host, host));
    handlers.onKeyDown(keyEvent('Tab', host, host));

    expect(handleAction).not.toHaveBeenCalled();
  });

  it('falls back to the default action when no tap action is configured', () => {
    const { host } = makeElements();
    const handlers = ucGestureService.createGestureHandlers('k-default', { entity: 'light.x' }, hass);

    handlers.onKeyDown(keyEvent('Enter', host, host));

    expect(handleAction.mock.calls[0]?.[0]).toMatchObject({ action: 'default' });
  });

  it('does nothing when the tap action is explicitly nothing', () => {
    const { host } = makeElements();
    const handlers = ucGestureService.createGestureHandlers(
      'k-nothing',
      { tap_action: { action: 'nothing' } },
      hass
    );

    handlers.onKeyDown(keyEvent('Enter', host, host));

    expect(handleAction).not.toHaveBeenCalled();
  });

  it('leaves a keypress on a nested control to that control', () => {
    // Otherwise activating a button inside the element fires both its own action
    // and the wrapper's.
    const host = document.createElement('div');
    const button = document.createElement('button');
    host.appendChild(button);
    document.body.appendChild(host);
    const handlers = ucGestureService.createGestureHandlers(
      'k-nested',
      { tap_action: { action: 'toggle' } },
      hass
    );

    handlers.onKeyDown(keyEvent('Enter', button, host));

    expect(handleAction).not.toHaveBeenCalled();
  });

  it('still acts on a keypress from a non-interactive child', () => {
    const { host, child } = makeElements();
    const handlers = ucGestureService.createGestureHandlers(
      'k-plain-child',
      { tap_action: { action: 'toggle' } },
      hass
    );

    handlers.onKeyDown(keyEvent('Enter', child, host));

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('ignores keypresses on excluded editor controls', () => {
    const host = document.createElement('div');
    const control = document.createElement('div');
    control.className = 'layout-child-drag-handle';
    host.appendChild(control);
    document.body.appendChild(host);
    const handlers = ucGestureService.createGestureHandlers(
      'k-excluded',
      { tap_action: { action: 'toggle' } },
      hass
    );

    handlers.onKeyDown(keyEvent('Enter', control, host));

    expect(handleAction).not.toHaveBeenCalled();
  });
});

describe('hasActionableGesture', () => {
  it('is true for a configured action', () => {
    expect(hasActionableGesture({ tap_action: { action: 'toggle' } })).toBe(true);
    expect(hasActionableGesture({ hold_action: { action: 'more-info' } })).toBe(true);
    expect(hasActionableGesture({ double_tap_action: { action: 'navigate' } })).toBe(true);
  });

  it('is true with no actions but an entity, which falls through to more-info', () => {
    expect(hasActionableGesture({ entity: 'light.x' })).toBe(true);
  });

  it('is false for a decorative element with nothing to do', () => {
    expect(hasActionableGesture({})).toBe(false);
  });

  it('is false when every action is explicitly nothing', () => {
    expect(
      hasActionableGesture({
        tap_action: { action: 'nothing' },
        hold_action: { action: 'none' },
        double_tap_action: { action: 'nothing' },
        entity: 'light.x',
      })
    ).toBe(false);
  });

  it('is exposed on the handlers so call sites cannot drift from the config', () => {
    const actionable = ucGestureService.createGestureHandlers(
      'k-flag',
      { tap_action: { action: 'toggle' } },
      hass
    );
    const decorative = ucGestureService.createGestureHandlers('k-flag-2', {}, hass);

    expect(actionable.isActionable).toBe(true);
    expect(decorative.isActionable).toBe(false);
  });
});

/**
 * Issue #138: on iOS a tapped icon kept a blue focus ring after its more-info
 * dialog closed, because WebKit marks restored focus as :focus-visible and the
 * gesture element has tabindex="0" with no focus styling.
 */
describe('pointer focus ring suppression', () => {
  function pointerDown(target: HTMLElement, currentTarget: HTMLElement): PointerEvent {
    const event = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      composed: true,
    }) as PointerEvent;
    Object.defineProperty(event, 'pointerId', { value: 1 });
    Object.defineProperty(event, 'target', { value: target });
    Object.defineProperty(event, 'currentTarget', { value: currentTarget });
    return event;
  }

  /** A gesture element inside a shadow root, the way cards render modules. */
  function makeShadowHost(): { root: ShadowRoot; el: HTMLElement } {
    const outer = document.createElement('div');
    document.body.appendChild(outer);
    const root = outer.attachShadow({ mode: 'open' });
    const el = document.createElement('div');
    el.tabIndex = 0;
    root.appendChild(el);
    return { root, el };
  }

  it('marks the element on pointerdown and injects the suppression stylesheet', () => {
    const { root, el } = makeShadowHost();
    const handlers = ucGestureService.createGestureHandlers(
      'pf-mark',
      { tap_action: { action: 'toggle' }, entity: 'light.x' },
      hass
    );

    handlers.onPointerDown(pointerDown(el, el));

    expect(el.hasAttribute(POINTER_FOCUS_ATTR)).toBe(true);
    const style = root.querySelector('#uc-pointer-focus-styles');
    expect(style?.textContent).toContain(`[${POINTER_FOCUS_ATTR}]:focus-visible`);
    expect(style?.textContent).toContain('outline: none');
  });

  it('keeps the marker when focus returns after a pointer interaction (dialog close)', () => {
    const { el } = makeShadowHost();
    const handlers = ucGestureService.createGestureHandlers(
      'pf-restore',
      { tap_action: { action: 'more-info' }, entity: 'sensor.x' },
      hass
    );

    // Tap the icon, the dialog opens and the user taps its close button...
    handlers.onPointerDown(pointerDown(el, el));
    window.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    el.removeAttribute(POINTER_FOCUS_ATTR);

    // ...then the dialog hands focus back to the icon.
    el.dispatchEvent(new FocusEvent('focus'));

    expect(lastInputModalityWasKeyboard()).toBe(false);
    expect(el.hasAttribute(POINTER_FOCUS_ATTR)).toBe(true);
  });

  it('clears the marker when the element is focused after keyboard input', () => {
    const { el } = makeShadowHost();
    const handlers = ucGestureService.createGestureHandlers(
      'pf-keyboard',
      { tap_action: { action: 'toggle' }, entity: 'light.x' },
      hass
    );

    handlers.onPointerDown(pointerDown(el, el));
    expect(el.hasAttribute(POINTER_FOCUS_ATTR)).toBe(true);

    // Tab arrives from elsewhere on the page, then focus lands on the element.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    el.dispatchEvent(new FocusEvent('focus'));

    expect(lastInputModalityWasKeyboard()).toBe(true);
    expect(el.hasAttribute(POINTER_FOCUS_ATTR)).toBe(false);
  });

  it('clears the marker on any key pressed while focused', () => {
    const { el } = makeShadowHost();
    const handlers = ucGestureService.createGestureHandlers(
      'pf-keydown',
      { tap_action: { action: 'toggle' }, entity: 'light.x' },
      hass
    );

    handlers.onPointerDown(pointerDown(el, el));
    handlers.onKeyDown(keyEvent('ArrowDown', el, el));

    expect(el.hasAttribute(POINTER_FOCUS_ATTR)).toBe(false);
    expect(handleAction).not.toHaveBeenCalled();
  });

  it('injects the stylesheet once per root', () => {
    const { root, el } = makeShadowHost();
    const sibling = document.createElement('div');
    root.appendChild(sibling);
    const handlers = ucGestureService.createGestureHandlers(
      'pf-once',
      { tap_action: { action: 'toggle' }, entity: 'light.x' },
      hass
    );

    handlers.onPointerDown(pointerDown(el, el));
    handlers.onPointerDown(pointerDown(sibling, sibling));

    expect(root.querySelectorAll('#uc-pointer-focus-styles')).toHaveLength(1);
  });
});
