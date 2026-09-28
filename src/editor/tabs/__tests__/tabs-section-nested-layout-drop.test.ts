import { describe, it, expect, beforeAll } from 'vitest';
import {
  mountLayoutTab,
  nextConfigChanged,
  mockHass,
  baseUltraCardConfig,
  makeRow,
  makeColumn,
  loadAllCoreModules,
  flushUpdates,
} from './layout-tab-harness';
import { getModuleRegistry } from '../../../modules/module-registry';
import { CUSTOM_YAML_CARD_TYPE } from '../layout-tab-constants';

/**
 * Issue #148: a Grid Layout inside a Tabs section could not receive modules or cards,
 * neither by dragging nor through its "Add Module" button (Cards tab).
 */

async function mountTabsWithGrid() {
  const reg = getModuleRegistry();
  const text = reg.createDefaultModule('text', 't1', mockHass)!;
  const tabs = reg.createDefaultModule('tabs', 'tabs1', mockHass)! as any;
  const icon = reg.createDefaultModule('icon', 'i1', mockHass)!;
  const grid = reg.createDefaultModule('grid_layout', 'g1', mockHass)! as any;
  grid.modules = [];
  tabs.sections[0].modules = [icon, grid];
  const config = baseUltraCardConfig({
    rows: [makeRow('r1', [makeColumn('c1', [text, tabs])])],
  });
  const el = await mountLayoutTab(config);
  await flushUpdates(el);
  return el;
}

function childByClass(parent: Element | undefined, cls: string): HTMLElement | undefined {
  return parent
    ? (Array.from(parent.children).find(c => c.classList.contains(cls)) as HTMLElement | undefined)
    : undefined;
}

function gridNode(el: HTMLElement): HTMLElement {
  const nodes = Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.tree-layout-module'));
  const node = nodes.find(n => !n.classList.contains('tabs-layout'));
  if (!node) throw new Error('grid layout node not rendered');
  return node;
}

function gridHeader(el: HTMLElement): HTMLElement {
  return childByClass(childByClass(gridNode(el), 'tree-node-content'), 'tree-node-header')!;
}

function drop(target: Element, clientY = 0): void {
  const ev = new Event('drop', { bubbles: true, cancelable: true, composed: true });
  Object.assign(ev, { clientY, clientX: 0, dataTransfer: { dropEffect: 'move' } });
  target.dispatchEvent(ev);
}

function sectionModules(config: any): any[] {
  return config.layout.rows[0].columns[0].modules[1].sections[0].modules;
}

describe('layout-tab: drop into a layout inside a tabs section', () => {
  beforeAll(loadAllCoreModules);

  it('moves a sibling section child into the grid from its body', async () => {
    const el = await mountTabsWithGrid();
    const anyEl = el as any;
    const body = childByClass(gridNode(el), 'tree-node-children')!.querySelector<HTMLElement>(
      '.tree-add-btn'
    )!;
    expect(body).toBeTruthy();

    anyEl._draggedItem = {
      type: 'tabs-section-child',
      rowIndex: 0,
      columnIndex: 0,
      moduleIndex: 1,
      sectionIndex: 0,
      childIndex: 0,
      isNested: false,
    };
    const wait = nextConfigChanged(el);
    drop(body);
    const { config } = await wait;

    const section = sectionModules(config);
    expect(section.map((m: any) => m.id)).toEqual(['g1']);
    expect(section[0].modules.map((m: any) => m.id)).toEqual(['i1']);
  });

  it('moves a column module into the grid when dropped on the grid header', async () => {
    const el = await mountTabsWithGrid();
    const anyEl = el as any;
    const header = gridHeader(el);

    anyEl._draggedItem = { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 };
    const wait = nextConfigChanged(el);
    drop(header);
    const { config } = await wait;

    const column = config.layout.rows[0].columns[0].modules as any[];
    expect(column.map(m => m.id)).toEqual(['tabs1']);
    const grid = (column[0] as any).sections[0].modules[1];
    expect(grid.modules.map((m: any) => m.id)).toEqual(['t1']);
  });

  it('still reorders the section when dropped on the top edge of the header', async () => {
    const el = await mountTabsWithGrid();
    const anyEl = el as any;
    const header = gridHeader(el);
    header.getBoundingClientRect = () =>
      ({ top: 100, bottom: 140, height: 40, left: 0, right: 200, width: 200 }) as DOMRect;

    anyEl._draggedItem = {
      type: 'tabs-section-child',
      rowIndex: 0,
      columnIndex: 0,
      moduleIndex: 1,
      sectionIndex: 0,
      childIndex: 0,
      isNested: false,
    };
    const wait = nextConfigChanged(el);
    drop(header, 101);
    // Dropping i1 "before" the grid is a no-op move, but it must not nest it
    const result = await Promise.race([
      wait.then(({ config }) => config),
      new Promise(resolve => setTimeout(() => resolve(null), 200)),
    ]);
    if (result) {
      const grid = sectionModules(result).find((m: any) => m.id === 'g1');
      expect(grid.modules).toHaveLength(0);
    }
  });

  it('refuses to drop the tabs module into its own grid', async () => {
    const el = await mountTabsWithGrid();
    const anyEl = el as any;
    anyEl._draggedItem = { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 1 };

    let changed = false;
    el.addEventListener('config-changed', () => (changed = true));
    anyEl._onTabsSectionNestedLayoutDrop(0, 0, 1, 0, 1);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(changed).toBe(false);
  });
});

describe('layout-tab: add a card to a layout inside a tabs section', () => {
  beforeAll(loadAllCoreModules);

  it('puts a Custom YAML card into the grid instead of the column', async () => {
    const el = await mountTabsWithGrid();
    const anyEl = el as any;
    anyEl._openTabsSectionNestedLayoutModuleSelector(0, 0, 1, 0, 1, undefined, false);

    const wait = nextConfigChanged(el);
    await anyEl._addCardFromTab(CUSTOM_YAML_CARD_TYPE);
    const { config } = await wait;

    const column = config.layout.rows[0].columns[0].modules as any[];
    expect(column.map(m => m.id)).toEqual(['t1', 'tabs1']);
    const grid = sectionModules(config)[1];
    expect(grid.modules).toHaveLength(1);
    expect(grid.modules[0].type).toBe('external_card');
    expect(grid.modules[0].card_type).toBe(CUSTOM_YAML_CARD_TYPE);
  });

  it('forgets the nested target once the picker is dismissed', async () => {
    const el = await mountTabsWithGrid();
    const anyEl = el as any;
    anyEl._openTabsSectionNestedLayoutModuleSelector(0, 0, 1, 0, 1, undefined, false);
    anyEl._handleSelectorClose();
    expect(anyEl._hasNestedAddTarget()).toBe(false);

    anyEl._openModuleSelector(0, 0);
    const wait = nextConfigChanged(el);
    await anyEl._addCardFromTab(CUSTOM_YAML_CARD_TYPE);
    const { config } = await wait;

    const column = config.layout.rows[0].columns[0].modules as any[];
    expect(column.map(m => m.type)).toEqual(['text', 'tabs', 'external_card']);
    expect(sectionModules(config)[1].modules).toHaveLength(0);
  });
});
