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

describe('layout-tab: row settings tabs', () => {
  beforeAll(loadAllCoreModules);

  async function openRow() {
    const reg = getModuleRegistry();
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [text])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    anyEl._selectedRowForSettings = 0;
    anyEl._showRowSettings = true;
    anyEl._activeRowTab = 'general';
    await flushUpdates(el);
    return el;
  }

  it('general tab updates row_name', async () => {
    const el = await openRow();
    const wait = nextConfigChanged(el);
    const inp = deepQuerySelector(
      el.shadowRoot!,
      '.row-general-settings input[type="text"]'
    ) as HTMLInputElement;
    expect(inp).toBeTruthy();
    inp.value = 'My test row';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    const { config } = await wait;
    expect((config.layout.rows[0] as any).row_name).toBe('My test row');
  });

  it('design tab updates row.design via ultra-global-design-tab', async () => {
    const el = await openRow();
    const anyEl = el as any;
    anyEl._activeRowTab = 'design';
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
    expect(config.layout.rows[0].design?.text_align).toBe('left');
  });

  it('logic tab updates row.hidden_on_devices', async () => {
    const el = await openRow();
    clickTabByLabel(el, 'Logic');
    await flushUpdates(el);
    const wait = nextConfigChanged(el);
    // The Hide-on-Devices toggles are now <ha-checkbox> (HA-native), not <input type="checkbox">.
    const cb = deepQuerySelector(
      el.shadowRoot!,
      '.uc-global-logic-tab ha-checkbox'
    ) as HTMLElement & { checked?: boolean };
    expect(cb).toBeTruthy();
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    const { config } = await wait;
    expect(config.layout.rows[0].hidden_on_devices).toContain('desktop');
  });
});
