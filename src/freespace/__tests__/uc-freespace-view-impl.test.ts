import { afterEach, describe, expect, it, vi } from 'vitest';
import '../uc-freespace-view-impl';
import type { UltraFreeSpaceViewImpl } from '../uc-freespace-view-impl';
import type { UcFreeSpaceItem } from '../uc-freespace-item';
import type { FreeSpaceCardLayout } from '../types';

const at = (x: number, y: number): FreeSpaceCardLayout => ({ x, y, w: 320, h: 160, r: 0, z: 0 });

function makeLovelace(cards: unknown[]) {
  const lovelace: any = {
    editMode: true,
    config: { views: [{ type: 'custom:ultra-freespace-view', cards }] },
    saveConfig: vi.fn(async (next: any) => {
      lovelace.config = next;
    }),
  };
  return lovelace;
}

async function mount(cards: unknown[]) {
  const el = document.createElement('ultra-freespace-view-impl') as UltraFreeSpaceViewImpl;
  const lovelace = makeLovelace(cards);
  el.lovelace = lovelace;
  el.index = 0;
  el.cards = cards.map(() => document.createElement('div'));
  document.body.appendChild(el);
  await el.updateComplete;
  return { el: el as any, lovelace };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('FreeSpace view optimistic layouts', () => {
  it('forgets an optimistic layout once its save lands', async () => {
    const { el, lovelace } = await mount([
      { type: 'tile', view_layout: at(0, 0) },
      { type: 'tile', view_layout: at(400, 0) },
    ]);
    await el._updateCardLayout(0, at(48, 48));
    expect(lovelace.saveConfig).toHaveBeenCalledTimes(1);
    expect(el._optimistic.size).toBe(0);
    expect(lovelace.config.views[0].cards[0].view_layout).toMatchObject({ x: 48, y: 48 });
  });

  it('does not hand a deleted card position to the card that takes its index', async () => {
    const { el, lovelace } = await mount([
      { type: 'tile', view_layout: at(0, 0) },
      { type: 'tile', view_layout: at(400, 0) },
    ]);
    el._commitLayout(0, at(48, 48));

    const remaining = [lovelace.config.views[0].cards[1]];
    lovelace.config = { views: [{ ...lovelace.config.views[0], cards: remaining }] };
    el.lovelace = { ...lovelace };
    el.cards = [document.createElement('div')];
    await el.updateComplete;

    expect(el._layouts[0]).toMatchObject({ x: 400, y: 0 });
  });
});

describe('FreeSpace card menu', () => {
  it('opens the card editor once, with the full card path', async () => {
    const { el } = await mount([
      { type: 'tile', view_layout: at(0, 0) },
      { type: 'tile', view_layout: at(400, 0) },
    ]);
    el._discoverable = true;
    await el.updateComplete;
    const edits: unknown[] = [];
    el.addEventListener('ll-edit-card', (ev: Event) => edits.push((ev as CustomEvent).detail));

    const item = el.renderRoot.querySelectorAll('uc-freespace-item')[1] as UcFreeSpaceItem;
    (item as any)._menuAction('edit', new Event('click'));

    expect(edits).toEqual([{ path: [0, 1] }]);
  });
});
