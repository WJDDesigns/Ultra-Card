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

describe('layout-tab: column settings tabs', () => {
  beforeAll(loadAllCoreModules);

  async function openColumn() {
    const reg = getModuleRegistry();
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [text])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    anyEl._selectedColumnForSettings = { rowIndex: 0, columnIndex: 0 };
    anyEl._showColumnSettings = true;
    anyEl._activeColumnTab = 'general';
    await flushUpdates(el);
    return el;
  }

  it('general tab updates column.vertical_alignment', async () => {
    const el = await openColumn();
    const wait = nextConfigChanged(el);
    const sel = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    expect(sel).toBeTruthy();
    sel.value = 'top';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    const { config } = await wait;
    expect(config.layout.rows[0].columns[0].vertical_alignment).toBe('top');
  });

  it('design tab updates column.design', async () => {
    const el = await openColumn();
    const anyEl = el as any;
    anyEl._activeColumnTab = 'design';
    await flushUpdates(el);
    const designEl = deepQuerySelector(el.shadowRoot!, 'ultra-global-design-tab') as any;
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
    const { config } = await wait;
    expect(config.layout.rows[0].columns[0].design?.text_align).toBe('left');
  });

  it('logic tab updates column.hidden_on_devices', async () => {
    const el = await openColumn();
    clickTabByLabel(el, 'Logic');
    await flushUpdates(el);
    const wait = nextConfigChanged(el);
    const cb = deepQuerySelector(
      el.shadowRoot!,
      '.uc-global-logic-tab ha-checkbox'
    ) as HTMLElement & { checked?: boolean };
    expect(cb).toBeTruthy();
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    const { config } = await wait;
    expect(config.layout.rows[0].columns[0].hidden_on_devices).toContain('desktop');
  });
});
