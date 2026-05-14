/**
 * Vitest setup: stub Home Assistant web components used by the layout editor
 * so Lit can upgrade and tests can dispatch events on them.
 */
import { afterEach } from 'vitest';

const STUB_TAGS = [
  'ha-icon',
  'ha-switch',
  'ha-textfield',
  'ha-textarea',
  'ha-select',
  'ha-form',
  'ha-expansion-panel',
  'ha-selector',
  'ha-entity-picker',
  'ha-card',
  'ha-svg-icon',
  'hui-card-preview',
];

function defineStub(name: string) {
  if (customElements.get(name)) return;
  class Stub extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const sr = this.attachShadow({ mode: 'open' });
      if (name === 'ha-switch') {
        const inp = document.createElement('input');
        inp.type = 'checkbox';
        sr.appendChild(inp);
      } else if (name === 'ha-textfield') {
        const inp = document.createElement('input');
        inp.type = 'text';
        sr.appendChild(inp);
      } else if (name === 'ha-textarea') {
        const ta = document.createElement('textarea');
        sr.appendChild(ta);
      } else if (name === 'ha-select') {
        const sel = document.createElement('select');
        sel.innerHTML = '<option value="a">A</option><option value="b">B</option>';
        sr.appendChild(sel);
      }
    }
  }
  customElements.define(name, Stub);
}

for (const t of STUB_TAGS) defineStub(t);

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

afterEach(() => {
  document.body.innerHTML = '';
});
