import { render } from 'lit';
import type { TemplateResult } from 'lit';
import type { UltraCardConfig, CardRow, CardColumn, CardModule } from '../../../types';
import type { LayoutTab } from '../layout-tab';
import { getModuleRegistry } from '../../../modules/module-registry';
import { coreLoaders } from '../../../modules/module-loaders';

export const mockHass = {
  states: {},
  entities: {},
  devices: {},
  areas: {},
  services: {},
  callService: async () => {},
  connection: { sendMessage: async () => ({}) },
  locale: { language: 'en' },
  themes: { darkMode: false },
  selectedTheme: null,
  panels: [],
  user: { is_admin: true },
} as any;

let modulesLoaded = false;

/** Eager-load all core modules (same entry points as the HA bundle). */
export async function loadAllCoreModules(): Promise<void> {
  if (modulesLoaded) return;
  const reg = getModuleRegistry();
  await Promise.all(Object.keys(coreLoaders).map(t => reg.ensureModuleLoaded(t)));
  modulesLoaded = true;
}

export function makeRow(id: string, columns: CardColumn[]): CardRow {
  return {
    id,
    columns,
    column_layout: '1-col',
  };
}

export function makeColumn(id: string, modules: CardModule[]): CardColumn {
  return { id, modules };
}

export function baseUltraCardConfig(layout: UltraCardConfig['layout']): UltraCardConfig {
  return {
    type: 'custom:ultra-card',
    layout,
  };
}

export async function mountLayoutTab(config: UltraCardConfig): Promise<LayoutTab> {
  await loadAllCoreModules();
  const { LayoutTab } = await import('../layout-tab');
  const el = new LayoutTab();
  el.hass = mockHass;
  el.config = config;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

export function nextConfigChanged(
  el: EventTarget,
  timeoutMs = 8000
): Promise<{ config: UltraCardConfig }> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      el.removeEventListener('config-changed', onEv as any);
      reject(new Error('config-changed timeout'));
    }, timeoutMs);
    function onEv(e: Event) {
      clearTimeout(t);
      el.removeEventListener('config-changed', onEv as any);
      const ce = e as CustomEvent<{ config: UltraCardConfig }>;
      resolve({ config: ce.detail.config });
    }
    el.addEventListener('config-changed', onEv as any);
  });
}

export function deepQuerySelector(
  root: Document | ShadowRoot | Element,
  selector: string
): HTMLElement | null {
  const direct =
    root instanceof Element
      ? root.querySelector(selector)
      : (root as Document).querySelector(selector);
  if (direct) return direct as HTMLElement;
  const roots =
    root instanceof Element
      ? root.querySelectorAll('*')
      : (root as Document | ShadowRoot).querySelectorAll('*');
  for (const el of roots) {
    const sr = (el as HTMLElement).shadowRoot;
    if (sr) {
      const found = deepQuerySelector(sr, selector);
      if (found) return found;
    }
  }
  return null;
}

const INTERACTIVE_SELECTOR_ORDER = [
  // HA's native slider component used by renderSliderField / renderGapWithUnitField.
  // It doesn't expose an internal input[type=range] in tests, so we target the
  // element itself and fire a `change` event with the desired value.
  'ha-slider',
  'input[type="range"]',
  'input[type="number"]',
  'textarea',
  'select',
  'input[type="checkbox"]',
  'input[type="text"]',
  'input:not([type])',
];

/** First native form control in `root` or any descendant shadow root. */
export function findFirstInteractableDeep(root: Document | ShadowRoot | Element): HTMLElement | null {
  for (const sel of INTERACTIVE_SELECTOR_ORDER) {
    const hit = deepQuerySelector(root, sel);
    if (hit) return hit;
  }
  return null;
}

export function fireInteractFirstControl(el: HTMLElement) {
  // <ha-slider> exposes `.value` as a property; tests can bump it and dispatch
  // a synthetic change event to mimic user dragging.
  if (el.tagName.toLowerCase() === 'ha-slider') {
    const sliderEl = el as HTMLElement & { value?: number | string };
    const current = Number(sliderEl.value) || 0;
    sliderEl.value = current + 1;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (el instanceof HTMLSelectElement) {
    if (el.options.length > 1) {
      el.selectedIndex = el.selectedIndex === 0 ? 1 : 0;
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (el instanceof HTMLInputElement && el.type === 'checkbox') {
    el.checked = !el.checked;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (el instanceof HTMLInputElement && (el.type === 'range' || el.type === 'number')) {
    const n = Number(el.value) || 0;
    el.value = String(n + 1);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.value = el.value ? `${el.value}x` : '2px';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
}

/** Click first `.module-tab` or `.settings-tab` whose trimmed text includes `label`. */
export function clickTabByLabel(host: LayoutTab, label: string): void {
  const root = host.shadowRoot;
  if (!root) throw new Error('no shadowRoot');
  const tabs = [
    ...root.querySelectorAll<HTMLElement>('.module-tab'),
    ...root.querySelectorAll<HTMLElement>('.settings-tab'),
  ];
  const target = tabs.find(t => t.textContent?.replace(/\s+/g, ' ').includes(label));
  if (!target) {
    throw new Error(`Tab not found: "${label}". Found: ${tabs.map(t => t.textContent).join(' | ')}`);
  }
  target.click();
}

export async function flushUpdates(host: LayoutTab): Promise<void> {
  await host.updateComplete;
  await new Promise<void>(r => requestAnimationFrame(() => r()));
}

export function mountTemplateInDom(tr: TemplateResult): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(tr, host);
  return host;
}
