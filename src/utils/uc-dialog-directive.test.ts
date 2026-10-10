/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { html, render } from 'lit';
import { ucDialog } from './uc-dialog-directive';

describe('ucDialog', () => {
  it('adds dialog semantics and closes on Escape', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const close = vi.fn();
    render(html`<div class="d" ${ucDialog(close)}><button>OK</button></div>`, host);
    const d = host.querySelector('.d') as HTMLElement;
    expect(d.getAttribute('role')).toBe('dialog');
    expect(d.getAttribute('aria-modal')).toBe('true');
    d.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(close).toHaveBeenCalledTimes(1);
    host.remove();
  });

  it('keeps an existing role', () => {
    const host = document.createElement('div');
    render(html`<div class="d" role="alertdialog" ${ucDialog(() => {})}></div>`, host);
    expect((host.querySelector('.d') as HTMLElement).getAttribute('role')).toBe('alertdialog');
  });
});
