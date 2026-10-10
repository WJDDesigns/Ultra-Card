/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { onActivationKey } from './uc-keyboard-activation';

function press(el: HTMLElement, key: string): KeyboardEvent {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true });
  el.addEventListener('keydown', onActivationKey as EventListener, { once: true });
  el.dispatchEvent(e);
  return e;
}

describe('keyboard activation', () => {
  it('clicks marked elements on Enter and Space', () => {
    const el = document.createElement('div');
    el.setAttribute('data-uc-activate', '');
    const click = vi.fn();
    el.addEventListener('click', click);
    expect(press(el, 'Enter').defaultPrevented).toBe(true);
    press(el, ' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('ignores unmarked elements and other keys', () => {
    const el = document.createElement('div');
    const click = vi.fn();
    el.addEventListener('click', click);
    press(el, 'Enter');
    el.setAttribute('data-uc-activate', '');
    press(el, 'a');
    expect(click).not.toHaveBeenCalled();
  });
});
