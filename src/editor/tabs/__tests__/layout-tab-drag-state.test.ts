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
 * HTML5 drag lifecycle guarantees for the tree view:
 *  - the source node is dimmed one frame after dragstart (keeps the drag ghost crisp)
 *  - dragleave from a node that does not own the current target never clears it
 *  - the source (and anything inside it) can never become the drop target
 *  - a pending, frame-coalesced dragover is flushed before the drop is resolved
 *  - dragend/drop leave no state, classes or host attributes behind
 */

function fakeDragEvent(
  target: Element,
  currentTarget: Element,
  extra: Partial<{ clientX: number; clientY: number; relatedTarget: Element | null }> = {}
): DragEvent {
  return {
    preventDefault() {},
    stopPropagation() {},
    target,
    currentTarget,
    clientX: 0,
    clientY: 0,
    relatedTarget: null,
    dataTransfer: { dropEffect: 'move', effectAllowed: 'move', setData() {} },
    ...extra,
  } as unknown as DragEvent;
}

const frame = () => new Promise<void>(r => requestAnimationFrame(() => r()));

async function mountTwoModules() {
  const reg = getModuleRegistry();
  const text = reg.createDefaultModule('text', 't1', mockHass)!;
  const icon = reg.createDefaultModule('icon', 'i1', mockHass)!;
  const config = baseUltraCardConfig({
    rows: [makeRow('r1', [makeColumn('c1', [text, icon])])],
  });
  const el = await mountLayoutTab(config);
  const modules = Array.from(
    el.shadowRoot!.querySelectorAll<HTMLElement>('.tree-node.tree-module')
  );
  expect(modules).toHaveLength(2);
  const column = el.shadowRoot!.querySelector<HTMLElement>('.tree-node.tree-column')!;
  expect(column).toBeTruthy();
  return { el, anyEl: el as any, modules, column };
}

describe('layout-tab: drag lifecycle state', () => {
  beforeAll(loadAllCoreModules);

  it('marks the source one frame after dragstart and fully cleans up on dragend', async () => {
    const { el, anyEl, modules } = await mountTwoModules();
    const [m1] = modules;

    anyEl._onDragStart(fakeDragEvent(m1, m1), 'module', 0, 0, 0);
    expect(anyEl._draggedItem).toMatchObject({ type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0 });
    expect(el.hasAttribute('dragging')).toBe(true);
    // Not yet: the browser captures the drag image right after dragstart.
    expect(m1.classList.contains('being-dragged')).toBe(false);
    await frame();
    expect(m1.classList.contains('being-dragged')).toBe(true);

    anyEl._onDragEnd(fakeDragEvent(m1, m1));
    expect(anyEl._draggedItem).toBeNull();
    expect(anyEl._dropTarget).toBeNull();
    expect(anyEl._dropTargetOwner).toBeNull();
    expect(anyEl._dragSourceElement).toBeNull();
    expect(el.hasAttribute('dragging')).toBe(false);
    expect(el.shadowRoot!.querySelector('.being-dragged')).toBeNull();
    expect(el.shadowRoot!.querySelector('.drag-over')).toBeNull();

    // A frame scheduled before dragend must not re-apply the class afterwards.
    await frame();
    expect(el.shadowRoot!.querySelector('.being-dragged')).toBeNull();
  });

  it('only the node that owns the drop target may clear it on dragleave', async () => {
    const { anyEl, modules, column } = await mountTwoModules();
    const [m1, m2] = modules;

    anyEl._onDragStart(fakeDragEvent(m1, m1), 'module', 0, 0, 0);
    anyEl._onDragEnter(fakeDragEvent(m2, m2), 'module', 0, 0, 1);
    expect(anyEl._dropTarget).toBeTruthy();
    const owner = anyEl._dropTargetOwner as HTMLElement;
    expect(owner).toBeTruthy();

    // The old node's / an ancestor's dragleave arrives after the new node's dragenter.
    anyEl._onDragLeave(fakeDragEvent(column, column));
    expect(anyEl._dropTarget).toBeTruthy();
    expect(anyEl._dropTargetOwner).toBe(owner);

    // Moving between children of the owner is not a leave either.
    const inner = owner.querySelector<HTMLElement>('.tree-node-header')!;
    anyEl._onDragLeave(fakeDragEvent(owner, owner, { relatedTarget: inner }));
    expect(anyEl._dropTarget).toBeTruthy();

    // The owner itself, with the pointer gone elsewhere, clears it.
    anyEl._onDragLeave(fakeDragEvent(owner, owner, { relatedTarget: null, clientX: -50, clientY: -50 }));
    expect(anyEl._dropTarget).toBeNull();
    expect(anyEl._dropTargetOwner).toBeNull();

    anyEl._onDragEnd(fakeDragEvent(m1, m1));
  });

  it('never resolves the dragged node or its descendants as the drop target', async () => {
    const { anyEl, modules } = await mountTwoModules();
    const [m1] = modules;

    anyEl._onDragStart(fakeDragEvent(m1, m1), 'module', 0, 0, 0);
    const header = m1.querySelector<HTMLElement>('.tree-node-header')!;
    anyEl._onDragEnter(fakeDragEvent(header, m1), 'module', 0, 0, 0);

    // The resolver may fall through to the column, but never to the source subtree.
    const resolved = anyEl._dropTargetElement as HTMLElement | null;
    expect(resolved).not.toBe(m1);
    expect(resolved && m1.contains(resolved)).toBeFalsy();
    expect(m1.classList.contains('drag-over')).toBe(false);
    const t = anyEl._dropTarget;
    if (t) {
      expect(t.type === 'module' && t.moduleIndex === 0).toBe(false);
    }

    anyEl._onDragEnd(fakeDragEvent(m1, m1));
  });

  it('flushes a pending frame-coalesced dragover before resolving the drop', async () => {
    const { el, anyEl, modules, column } = await mountTwoModules();
    const [m1, m2] = modules;

    // jsdom has no hit-testing; point the resolver at m2's header.
    const m2Header = m2.querySelector<HTMLElement>('.tree-node-header')!;
    (el.shadowRoot as any).elementFromPoint = () => m2Header;

    anyEl._onDragStart(fakeDragEvent(m1, m1), 'module', 0, 0, 0);
    // dragover only queues work; nothing is resolved synchronously.
    anyEl._onDragOver(fakeDragEvent(m2Header, column, { clientX: 10, clientY: 10 }));
    expect(anyEl._dragOverFrame).not.toBeNull();
    expect(anyEl._dropTarget).toBeNull();

    // Dropping straight away (before the frame fires) must still use that pointer position.
    const wait = nextConfigChanged(el);
    anyEl._onDrop(fakeDragEvent(m2Header, column), 'module', 0, 0, 1);
    const { config: next } = await wait;

    expect(anyEl._dragOverFrame).toBeNull();
    expect(anyEl._draggedItem).toBeNull();
    const ids = next.layout.rows[0].columns[0].modules.map((m: any) => m.id);
    expect(ids).toEqual(['i1', 't1']);
  });

  it('the list boundary follows the pointer in both directions (hysteresis is two-sided)', async () => {
    const reg = getModuleRegistry();
    const config = baseUltraCardConfig({
      rows: [
        makeRow('r1', [
          makeColumn('c1', [
            reg.createDefaultModule('text', 't1', mockHass)!,
            reg.createDefaultModule('icon', 'i1', mockHass)!,
            reg.createDefaultModule('text', 't2', mockHass)!,
          ]),
        ]),
      ],
    });
    const el = await mountLayoutTab(config);
    const anyEl = el as any;
    const [m1, m2, m3] = Array.from(
      el.shadowRoot!.querySelectorAll<HTMLElement>('.tree-node.tree-module')
    );
    const column = el.shadowRoot!.querySelector<HTMLElement>('.tree-node.tree-column')!;
    const list = Array.from(column.children).find(c =>
      c.classList.contains('tree-node-children')
    ) as HTMLElement;
    expect(list).toBeTruthy();

    // jsdom has no layout: stack m1 (0–40) and m2 (40–80); m3 is the source and is ignored.
    const rect = (top: number, bottom: number) =>
      () => ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top, x: 0, y: top, toJSON() {} });
    m1.getBoundingClientRect = rect(0, 40) as any;
    m2.getBoundingClientRect = rect(40, 80) as any;

    anyEl._onDragStart(fakeDragEvent(m3, m3), 'module', 0, 0, 2);
    const at = (y: number) => {
      const r = anyEl._resolveBoundaryInContainer(list, y);
      return `${r.edge}:${r.element === m1 ? 'm1' : r.element === m2 ? 'm2' : '?'}`;
    };

    // Dragging up from below the list
    expect(at(78)).toBe('after:m2');
    expect(at(50)).toBe('before:m2'); // crossed m2's midpoint (60)
    expect(at(15)).toBe('before:m2'); // inside the 6px band around m1's midpoint (20): hold
    expect(at(10)).toBe('before:m1'); // clearly above it: must move up
    // ...and back down again
    expect(at(30)).toBe('before:m2');
    expect(at(70)).toBe('after:m2');

    anyEl._onDragEnd(fakeDragEvent(m3, m3));
  });

  it('a drop that lands the item back where it started emits no config change', async () => {
    const { el, anyEl, modules } = await mountTwoModules();
    const [m1, m2] = modules;

    anyEl._onDragStart(fakeDragEvent(m2, m2), 'module', 0, 0, 1);
    // "after m1" is m2's current position.
    anyEl._dropTarget = { type: 'module', rowIndex: 0, columnIndex: 0, moduleIndex: 0, insertEdge: 'after' };
    anyEl._dropTargetOwner = m1;

    let fired = false;
    const onEv = () => (fired = true);
    el.addEventListener('config-changed', onEv);
    anyEl._onDrop(fakeDragEvent(m1, m1), 'module', 0, 0, 0);
    await el.updateComplete;
    el.removeEventListener('config-changed', onEv);

    expect(fired).toBe(false);
    expect(anyEl._draggedItem).toBeNull();
  });
});
