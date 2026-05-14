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

describe('layout-tab: layout module + layout child', () => {
  beforeAll(loadAllCoreModules);

  it('parent horizontal module: general tab updates gap', async () => {
    const reg = getModuleRegistry();
    const h = reg.createDefaultModule('horizontal', 'h1', mockHass)! as any;
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    h.modules = [text];
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [h])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    anyEl._selectedModule = { rowIndex: 0, columnIndex: 0, moduleIndex: 0 };
    anyEl._showModuleSettings = true;
    anyEl._activeModuleTab = 'general';
    await flushUpdates(el);
    const wait = nextConfigChanged(el);
    const range = deepQuerySelector(el.shadowRoot!, 'input[type="range"]') as HTMLInputElement;
    expect(range).toBeTruthy();
    range.value = '24';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    const { config: next } = await wait;
    const mod = next.layout.rows[0].columns[0].modules[0] as any;
    expect(mod.gap).toBe(24);
  });

  it('layout child text module: general tab updates text_size', async () => {
    const reg = getModuleRegistry();
    const h = reg.createDefaultModule('horizontal', 'h1', mockHass)! as any;
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    h.modules = [text];
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [h])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    anyEl._showModuleSettings = false;
    anyEl._selectedLayoutChild = {
      parentRowIndex: 0,
      parentColumnIndex: 0,
      parentModuleIndex: 0,
      childIndex: 0,
    };
    anyEl._selectedNestedChildIndex = -1;
    anyEl._selectedNestedNestedChildIndex = -1;
    anyEl._showLayoutChildSettings = true;
    anyEl._activeModuleTab = 'general';
    await flushUpdates(el);
    const wait = nextConfigChanged(el);
    const range = deepQuerySelector(el.shadowRoot!, 'input[type="range"]') as HTMLInputElement;
    expect(range).toBeTruthy();
    range.value = '22';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    const { config: next } = await wait;
    const child = (next.layout.rows[0].columns[0].modules[0] as any).modules[0];
    expect(child.text_size).toBe(22);
  });

  it('layout child: design tab updates design.text_align', async () => {
    const reg = getModuleRegistry();
    const h = reg.createDefaultModule('horizontal', 'h1', mockHass)! as any;
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    h.modules = [text];
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [h])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    anyEl._showModuleSettings = false;
    anyEl._selectedLayoutChild = {
      parentRowIndex: 0,
      parentColumnIndex: 0,
      parentModuleIndex: 0,
      childIndex: 0,
    };
    anyEl._selectedNestedChildIndex = -1;
    anyEl._selectedNestedNestedChildIndex = -1;
    anyEl._showLayoutChildSettings = true;
    anyEl._activeModuleTab = 'design';
    await flushUpdates(el);
    const designEl = deepQuerySelector(el.shadowRoot!, 'ultra-global-design-tab') as any;
    expect(designEl).toBeTruthy();
    await designEl.updateComplete;
    const droot = designEl.shadowRoot as ShadowRoot;
    (droot.querySelector('.accordion-toggle') as HTMLElement).click();
    await designEl.updateComplete;
    const wait = nextConfigChanged(el);
    const leftBtn = [...droot.querySelectorAll('.property-btn')].find(
      b => (b as HTMLElement).getAttribute('title') === 'left'
    ) as HTMLElement;
    expect(leftBtn).toBeTruthy();
    leftBtn.click();
    const { config: next } = await wait;
    const child = (next.layout.rows[0].columns[0].modules[0] as any).modules[0];
    expect(child.design?.text_align).toBe('left');
  });
});
