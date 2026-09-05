import { describe, it, expect, beforeAll } from 'vitest';
import {
  mountLayoutTab,
  nextConfigChanged,
  mockHass,
  baseUltraCardConfig,
  makeRow,
  makeColumn,
  loadAllCoreModules,
} from './layout-tab-harness';
import { getModuleRegistry } from '../../../modules/module-registry';

/**
 * Issue #127: dragging a module onto the body of an empty layout module or empty
 * column resolved to "before/after the container in its parent list", so the only
 * way to drop *into* a new container was to add a placeholder module first.
 */

function ownAddButton(node: HTMLElement): HTMLElement {
  const body = Array.from(node.children).find(c =>
    c.classList.contains('tree-node-children')
  ) as HTMLElement;
  return body.querySelector<HTMLElement>('.tree-add-button-container .tree-add-btn')!;
}

function fakeDragEvent(target: Element, currentTarget: Element): DragEvent {
  return {
    preventDefault() {},
    stopPropagation() {},
    target,
    currentTarget,
    clientX: 0,
    clientY: 0,
    relatedTarget: null,
    dataTransfer: { dropEffect: 'move' },
  } as unknown as DragEvent;
}

describe('layout-tab: drop into an empty container', () => {
  beforeAll(loadAllCoreModules);

  it('drops a module into an empty horizontal layout from its body', async () => {
    const reg = getModuleRegistry();
    const icon = reg.createDefaultModule('icon', 'i1', mockHass)!;
    const h = reg.createDefaultModule('horizontal', 'h1', mockHass)! as any;
    h.modules = [];
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [icon, h])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;

    const layoutNode = el.shadowRoot!.querySelector<HTMLElement>('.tree-layout-module')!;
    expect(layoutNode).toBeTruthy();
    const addBtn = ownAddButton(layoutNode);
    expect(addBtn).toBeTruthy();

    anyEl._draggedItem = { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 };
    anyEl._onDragEnter(fakeDragEvent(addBtn, layoutNode), 'layout', 0, 0, 1);
    expect(anyEl._dropTarget?.insertEdge).toBe('inside');

    const wait = nextConfigChanged(el);
    anyEl._onDrop(fakeDragEvent(addBtn, layoutNode), 'layout', 0, 0, 1);
    const { config: next } = await wait;

    const modules = next.layout.rows[0].columns[0].modules as any[];
    expect(modules).toHaveLength(1);
    expect(modules[0].type).toBe('horizontal');
    expect(modules[0].modules.map((m: any) => m.id)).toEqual(['i1']);
  });

  it('drops a module into an empty column from its body', async () => {
    const reg = getModuleRegistry();
    const icon = reg.createDefaultModule('icon', 'i1', mockHass)!;
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [icon]), makeColumn('c2', [])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;

    const columns = el.shadowRoot!.querySelectorAll<HTMLElement>('.tree-column');
    expect(columns).toHaveLength(2);
    const emptyColumn = columns[1];
    const addBtn = ownAddButton(emptyColumn);
    expect(addBtn).toBeTruthy();

    anyEl._draggedItem = { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 };
    anyEl._onDragEnter(fakeDragEvent(addBtn, emptyColumn), 'column', 0, 1);
    expect(anyEl._dropTarget?.insertEdge).toBe('inside');

    const wait = nextConfigChanged(el);
    anyEl._onDrop(fakeDragEvent(addBtn, emptyColumn), 'column', 0, 1);
    const { config: next } = await wait;

    const [c1, c2] = next.layout.rows[0].columns;
    expect(c1.modules).toHaveLength(0);
    expect(c2.modules.map(m => m.id)).toEqual(['i1']);
  });

  it('still treats a non-empty container body as a list boundary', async () => {
    const reg = getModuleRegistry();
    const icon = reg.createDefaultModule('icon', 'i1', mockHass)!;
    const text = reg.createDefaultModule('text', 't1', mockHass)!;
    const h = reg.createDefaultModule('horizontal', 'h1', mockHass)! as any;
    h.modules = [text];
    const config = baseUltraCardConfig({
      rows: [makeRow('r1', [makeColumn('c1', [icon, h])])],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;

    const layoutNode = el.shadowRoot!.querySelector<HTMLElement>('.tree-layout-module')!;
    const addBtn = ownAddButton(layoutNode);
    expect(addBtn).toBeTruthy();

    anyEl._draggedItem = { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 };
    anyEl._onDragEnter(fakeDragEvent(addBtn, layoutNode), 'layout', 0, 0, 1);
    expect(anyEl._dropTarget?.insertEdge).not.toBe('inside');
  });
});
