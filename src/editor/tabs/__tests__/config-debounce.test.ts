/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  mountLayoutTab,
  mockHass,
  baseUltraCardConfig,
  makeRow,
  makeColumn,
  loadAllCoreModules,
} from './layout-tab-harness';
import { getModuleRegistry } from '../../../modules/module-registry';

describe('layout-tab: config-changed debounce (audit E1)', () => {
  beforeAll(loadAllCoreModules);

  it('sends one config-changed for a burst of module edits', async () => {
    const reg = getModuleRegistry();
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    const el = await mountLayoutTab(
      baseUltraCardConfig({ rows: [makeRow('r1', [makeColumn('c1', [text])])] })
    );
    const anyEl = el as any;
    anyEl._selectedModule = { rowIndex: 0, columnIndex: 0, moduleIndex: 0 };
    let events = 0;
    el.addEventListener('config-changed', () => events++);
    for (let i = 0; i < 10; i++) {
      anyEl._updateModule({ text: `hello ${i}` });
      await new Promise(r => setTimeout(r, 20));
    }
    expect(events).toBe(0);
    await new Promise(r => setTimeout(r, 300));
    expect(events).toBe(1);
    expect(anyEl.config.layout.rows[0].columns[0].modules[0].text).toBe('hello 9');
  });
});
