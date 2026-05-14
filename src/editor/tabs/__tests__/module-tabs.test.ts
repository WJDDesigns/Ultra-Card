import { describe, it, expect, beforeAll } from 'vitest';
import {
  mountLayoutTab,
  nextConfigChanged,
  mockHass,
  baseUltraCardConfig,
  makeRow,
  makeColumn,
  loadAllCoreModules,
  clickTabByLabel,
  flushUpdates,
  deepQuerySelector,
} from './layout-tab-harness';
import { getModuleRegistry } from '../../../modules/module-registry';

describe('layout-tab: module settings tabs (text module)', () => {
  beforeAll(loadAllCoreModules);

  async function openTextModule() {
    const reg = getModuleRegistry();
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [text])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    anyEl._selectedModule = { rowIndex: 0, columnIndex: 0, moduleIndex: 0 };
    anyEl._showModuleSettings = true;
    anyEl._activeModuleTab = 'general';
    await flushUpdates(el);
    return el;
  }

  it('general tab: text size slider triggers config-changed', async () => {
    const el = await openTextModule();
    const wait = nextConfigChanged(el);
    const range = deepQuerySelector(el.shadowRoot!, 'input[type="range"]') as HTMLInputElement;
    expect(range).toBeTruthy();
    range.value = '20';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    const { config } = await wait;
    const mod = config.layout.rows[0].columns[0].modules[0] as any;
    expect(mod.text_size).toBe(20);
  });

  it('logic tab: hide-on-device checkbox triggers config-changed', async () => {
    const el = await openTextModule();
    clickTabByLabel(el, 'Logic');
    await flushUpdates(el);
    const wait = nextConfigChanged(el);
    const cb = deepQuerySelector(
      el.shadowRoot!,
      '.uc-global-logic-tab input[type="checkbox"]'
    ) as HTMLInputElement;
    expect(cb).toBeTruthy();
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    const { config } = await wait;
    const mod = config.layout.rows[0].columns[0].modules[0] as any;
    expect(mod.hidden_on_devices).toContain('desktop');
  });

  it('design tab: text alignment button triggers config-changed', async () => {
    const el = await openTextModule();
    clickTabByLabel(el, 'Design');
    await flushUpdates(el);
    const designEl = deepQuerySelector(el.shadowRoot!, 'ultra-global-design-tab') as any;
    expect(designEl).toBeTruthy();
    await designEl.updateComplete;
    const droot = designEl.shadowRoot as ShadowRoot;
    const toggle = droot.querySelector('.accordion-toggle') as HTMLElement;
    expect(toggle).toBeTruthy();
    toggle.click();
    await designEl.updateComplete;
    const wait = nextConfigChanged(el);
    const leftBtn = [...droot.querySelectorAll('.property-btn')].find(
      b => (b as HTMLElement).getAttribute('title') === 'left'
    ) as HTMLElement;
    expect(leftBtn).toBeTruthy();
    leftBtn.click();
    const { config } = await wait;
    const mod = config.layout.rows[0].columns[0].modules[0] as any;
    expect(mod.design?.text_align).toBe('left');
  });

  it('actions tab: ultra-global-actions-tab is mounted (smoke)', async () => {
    const el = await openTextModule();
    clickTabByLabel(el, 'Actions');
    await flushUpdates(el);
    const actions = deepQuerySelector(el.shadowRoot!, 'ultra-global-actions-tab');
    expect(actions).toBeTruthy();
  });
});
