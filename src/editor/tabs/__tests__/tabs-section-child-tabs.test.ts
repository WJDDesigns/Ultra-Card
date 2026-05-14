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

describe('layout-tab: tabs section child settings', () => {
  beforeAll(loadAllCoreModules);

  async function mountTabsWithTextChild() {
    const reg = getModuleRegistry();
    const tabs = reg.createDefaultModule('tabs', 'tabs1', mockHass)! as any;
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    tabs.sections[0].modules = [text];
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [tabs])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    anyEl._showModuleSettings = false;
    anyEl._showLayoutChildSettings = false;
    anyEl._selectedTabsSectionChild = {
      rowIndex: 0,
      columnIndex: 0,
      moduleIndex: 0,
      sectionIndex: 0,
      childIndex: 0,
      parentLayoutChildIndex: undefined,
      isNested: false,
    };
    anyEl._showTabsSectionChildSettings = true;
    anyEl._activeTabsChildTab = 'general';
    await flushUpdates(el);
    return el;
  }

  it('general tab updates nested text module', async () => {
    const el = await mountTabsWithTextChild();
    const wait = nextConfigChanged(el);
    const range = deepQuerySelector(el.shadowRoot!, 'input[type="range"]') as HTMLInputElement;
    expect(range).toBeTruthy();
    range.value = '18';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    const { config } = await wait;
    const tabsMod = config.layout.rows[0].columns[0].modules[0] as any;
    const child = tabsMod.sections[0].modules[0];
    expect(child.text_size).toBe(18);
  });

  it('design tab updates nested module design (uc-responsive-design-tab)', async () => {
    const el = await mountTabsWithTextChild();
    const anyEl = el as any;
    anyEl._activeTabsChildTab = 'design';
    await flushUpdates(el);
    const rd = deepQuerySelector(el.shadowRoot!, 'uc-responsive-design-tab') as any;
    expect(rd).toBeTruthy();
    await rd.updateComplete;
    const wait = nextConfigChanged(el);
    const inp = rd.shadowRoot!.querySelector('.input-grid input[type="text"]') as HTMLInputElement;
    expect(inp).toBeTruthy();
    inp.value = '4px';
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    const { config } = await wait;
    const tabsMod = config.layout.rows[0].columns[0].modules[0] as any;
    const child = tabsMod.sections[0].modules[0] as any;
    const d = child.design || {};
    const pt = d.padding_top ?? d.base?.padding_top;
    expect(pt).toBe('4px');
  });

  it('logic tab updates nested module hidden_on_devices', async () => {
    const el = await mountTabsWithTextChild();
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
    const tabsMod = config.layout.rows[0].columns[0].modules[0] as any;
    expect(tabsMod.sections[0].modules[0].hidden_on_devices).toContain('desktop');
  });
});
