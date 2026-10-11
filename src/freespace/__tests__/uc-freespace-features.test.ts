import { afterEach, describe, expect, it, vi } from 'vitest';
import '../uc-freespace-view-impl';
import type { UltraFreeSpaceViewImpl } from '../uc-freespace-view-impl';
import { FreeSpaceHistory } from '../uc-freespace-history';
import {
  applyResize,
  clampLayout,
  fitToScreenScale,
  neighbourGaps,
  visibleLayouts,
} from '../uc-freespace-geometry';
import {
  backgroundImageFor,
  expandToGroups,
  fittedDesktopLayouts,
  groupMembers,
  newGroupId,
  normalizeCardLayout,
  normalizeFreeSpaceOptions,
  setFlag,
  setGroup,
} from '../uc-freespace-config';
import { buildStarter } from '../uc-freespace-starters';
import type { FreeSpaceCardLayout } from '../types';

const at = (x: number, y: number, extra: Partial<FreeSpaceCardLayout> = {}): FreeSpaceCardLayout => ({
  x,
  y,
  w: 320,
  h: 160,
  r: 0,
  z: 0,
  ...extra,
});

describe('FreeSpaceHistory', () => {
  it('undoes and redoes in order, and a new change clears redo', () => {
    let now = 0;
    const h = new FreeSpaceHistory<string>(50, 600, () => now);
    h.record('a');
    now += 1000;
    h.record('b');
    expect(h.undo('c')).toBe('b');
    expect(h.undo('b')).toBe('a');
    expect(h.canUndo).toBe(false);
    expect(h.redo('a')).toBe('b');
    now += 1000;
    h.record('b');
    expect(h.canRedo).toBe(false);
  });

  it('merges changes made in quick succession into one step', () => {
    let now = 0;
    const h = new FreeSpaceHistory<string>(50, 600, () => now);
    h.record('a');
    now += 100;
    h.record('b');
    now += 100;
    h.record('c');
    expect(h.undo('d')).toBe('a');
    expect(h.canUndo).toBe(false);
  });

  it('keeps at most the limit', () => {
    let now = 0;
    const h = new FreeSpaceHistory<number>(3, 0, () => (now += 10));
    for (let i = 0; i < 6; i++) h.record(i);
    expect(h.undo(99)).toBe(5);
    expect(h.undo(5)).toBe(4);
    expect(h.undo(4)).toBe(3);
    expect(h.undo(3)).toBeUndefined();
  });
});

describe('layout flags', () => {
  it('survive normalising and clamping', () => {
    const l = normalizeCardLayout({
      ...at(0, 0),
      auto_h: true,
      locked: true,
      hidden: true,
      keep_ratio: true,
      group: 'g1',
    })!;
    expect(l).toMatchObject({ auto_h: true, locked: true, hidden: true, keep_ratio: true, group: 'g1' });
    expect(clampLayout(l)).toMatchObject({ locked: true, group: 'g1' });
  });

  it('drop false or junk values', () => {
    const l = normalizeCardLayout({ ...at(0, 0), locked: false, hidden: 'yes', group: 3 })!;
    expect(l.locked).toBeUndefined();
    expect(l.hidden).toBeUndefined();
    expect(l.group).toBeUndefined();
  });

  it('setFlag turns a flag on and off for the given cards only', () => {
    const on = setFlag([at(0, 0), at(400, 0)], [1], 'locked', true);
    expect(on[0]!.locked).toBeUndefined();
    expect(on[1]!.locked).toBe(true);
    expect(setFlag(on, [1], 'locked', false)[1]!.locked).toBeUndefined();
  });
});

describe('groups', () => {
  const layouts = [at(0, 0, { group: 'g1' }), at(400, 0), at(0, 200, { group: 'g1' })];

  it('selects the whole group with the clicked card last', () => {
    expect(groupMembers(layouts, 2)).toEqual([0, 2]);
    expect(groupMembers(layouts, 1)).toEqual([1]);
  });

  it('expands a selection to whole groups', () => {
    expect(expandToGroups(layouts, [1, 0]).sort()).toEqual([0, 1, 2]);
    const expanded = expandToGroups(layouts, [1, 0]);
    expect(expanded[expanded.length - 1]).toBe(0);
  });

  it('creates unused ids and ungroups', () => {
    expect(newGroupId(layouts)).toBe('g2');
    const grouped = setGroup(layouts, [1], 'g2');
    expect(grouped[1]!.group).toBe('g2');
    expect(setGroup(grouped, [0, 2], null).map(l => l.group)).toEqual([undefined, 'g2', undefined]);
  });
});

describe('keep ratio resize', () => {
  it('keeps the ratio from a corner, anchored at the opposite corner', () => {
    const next = applyResize(at(100, 100, { w: 400, h: 200 }), 'nw', -100, 0, true);
    expect(next.w).toBe(500);
    expect(next.h).toBe(250);
    expect(next.x + next.w).toBe(500);
    expect(next.y + next.h).toBe(300);
  });

  it('keeps the ratio from an edge', () => {
    const next = applyResize(at(0, 0, { w: 400, h: 200 }), 's', 0, 100, true);
    expect(next.h).toBe(300);
    expect(next.w).toBe(600);
  });
});

describe('spacing readout', () => {
  it('measures to the nearest card on each side that overlaps it', () => {
    const layouts = [at(400, 300), at(0, 300), at(800, 300), at(400, 0), at(1500, 1500)];
    const gaps = neighbourGaps(layouts, 0);
    expect(gaps).toHaveLength(3);
    expect(gaps).toContainEqual(expect.objectContaining({ axis: 'x', from: 320, to: 400 }));
    expect(gaps).toContainEqual(expect.objectContaining({ axis: 'x', from: 720, to: 800 }));
    expect(gaps).toContainEqual(expect.objectContaining({ axis: 'y', from: 160, to: 300 }));
  });
});

describe('fit to screen', () => {
  it('scales by whichever side is tighter, up or down', () => {
    expect(fitToScreenScale(1200, 800, 2400, 800)).toBe(1);
    expect(fitToScreenScale(1200, 600, 1800, 1200)).toBe(1.5);
    expect(fitToScreenScale(1200, 800, 600, 1000)).toBe(0.5);
  });

  it('reads fit and background options', () => {
    const o = normalizeFreeSpaceOptions({
      fit: 'screen',
      background: { image: '/local/plan.png', images: { phone: '/local/p.png' }, size: 'bogus', opacity: 140 },
    });
    expect(o.fit).toBe('screen');
    expect(o.background).toEqual({
      image: '/local/plan.png',
      images: { phone: '/local/p.png' },
      size: 'fit_width',
      position: 'top center',
      opacity: 100,
    });
    expect(backgroundImageFor(o.background, 'phone')).toBe('/local/p.png');
    expect(backgroundImageFor(o.background, 'tablet')).toBe('/local/plan.png');
    expect(normalizeFreeSpaceOptions({ background: { size: 'cover' } }).background).toBeUndefined();
  });
});

describe('hidden cards', () => {
  it('do not count when shrinking Desktop to fit a smaller screen', () => {
    const view = {
      cards: [
        { type: 'tile', view_layout: at(0, 0) },
        { type: 'tile', view_layout: at(2000, 0, { hidden: true }) },
      ],
    };
    const fitted = fittedDesktopLayouts(view, 'tablet');
    expect(fitted[0]!.w).toBe(320);
    expect(visibleLayouts([at(0, 0, { hidden: true })])).toHaveLength(1);
  });
});

describe('starter layouts', () => {
  it('uses matching entities once each and placeholders for the rest', () => {
    const { cards, fit } = buildStarter('wall', {
      'light.a': {},
      'light.b': {},
      'weather.home': {},
    });
    expect(fit).toBe('screen');
    const types = cards.map(c => c.type);
    expect(types.filter(t => t === 'tile')).toHaveLength(2);
    expect(cards.find(c => c.type === 'weather-forecast')?.entity).toBe('weather.home');
    expect(new Set(cards.filter(c => c.entity).map(c => c.entity)).size).toBe(3);
    expect(cards.every(c => c.view_layout)).toBe(true);
  });

  it('gives the phone starter its own Phone layout', () => {
    const { cards } = buildStarter('phone', {});
    expect((cards[0]!.view_layout as any).phone).toBeTruthy();
    expect((cards[0]!.view_layout as any).desktop).toBeTruthy();
  });
});

// ------------------------------------------------------------- view element

function makeLovelace(el: { lovelace: any }, cards: unknown[]) {
  const lovelace: any = {
    editMode: true,
    config: { views: [{ type: 'custom:ultra-freespace-view', cards }] },
  };
  // Like Home Assistant: every save hands the view a new lovelace object.
  lovelace.saveConfig = vi.fn(async (next: any) => {
    el.lovelace = { ...el.lovelace, config: next };
  });
  return lovelace;
}

async function mount(cards: unknown[]) {
  const el = document.createElement('ultra-freespace-view-impl') as UltraFreeSpaceViewImpl;
  el.lovelace = makeLovelace(el as any, cards);
  el.index = 0;
  el.cards = cards.map(() => document.createElement('div'));
  document.body.appendChild(el);
  await el.updateComplete;
  const any = el as any;
  any._discoverable = true;
  // Spread out saves so each one is its own undo step.
  any._history = new FreeSpaceHistory<any>(50, 0);
  await el.updateComplete;
  return any;
}

const viewCards = (el: any) => el.lovelace.config.views[0].cards;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('FreeSpace view: undo / redo', () => {
  it('undoes a move and redoes it', async () => {
    const el = await mount([{ type: 'tile', view_layout: at(0, 0) }]);
    await el._updateCardLayout(0, at(48, 48));
    await el.updateComplete;
    expect(viewCards(el)[0].view_layout).toMatchObject({ x: 48 });

    await el._undoRedo('undo');
    await el.updateComplete;
    expect(viewCards(el)[0].view_layout).toMatchObject({ x: 0, y: 0 });

    await el._undoRedo('redo');
    await el.updateComplete;
    expect(viewCards(el)[0].view_layout).toMatchObject({ x: 48, y: 48 });
  });

  it('records changes made outside FreeSpace, like a delete from the card menu', async () => {
    const el = await mount([
      { type: 'tile', view_layout: at(0, 0) },
      { type: 'tile', view_layout: at(400, 0) },
    ]);
    const before = el.lovelace.config;
    el.lovelace = {
      ...el.lovelace,
      config: { views: [{ ...before.views[0], cards: [before.views[0].cards[0]] }] },
    };
    await el.updateComplete;
    await el._undoRedo('undo');
    expect(viewCards(el)).toHaveLength(2);
  });

  it('forgets history when leaving edit mode', async () => {
    const el = await mount([{ type: 'tile', view_layout: at(0, 0) }]);
    await el._updateCardLayout(0, at(48, 48));
    await el.updateComplete;
    expect(el._history.canUndo).toBe(true);
    el.lovelace = { ...el.lovelace, editMode: false };
    await el.updateComplete;
    expect(el._history.canUndo).toBe(false);
  });
});

describe('FreeSpace view: lock, hide, group', () => {
  it('a locked card does not move', async () => {
    const el = await mount([{ type: 'tile', view_layout: at(0, 0, { locked: true }) }]);
    const state = { mode: 'move', cardIndex: 0, origin: at(0, 0), current: at(80, 80) };
    el._onInteractionMove(state);
    await el._onInteractionEnd(state, false);
    expect(el._layouts[0]).toMatchObject({ x: 0, y: 0 });
    expect(el.lovelace.saveConfig).not.toHaveBeenCalled();
  });

  it('toggles hide for the selected cards and saves it', async () => {
    const el = await mount([
      { type: 'tile', view_layout: at(0, 0) },
      { type: 'tile', view_layout: at(400, 0) },
    ]);
    el._toggleFlag([1], 'hidden');
    await el.updateComplete;
    expect(viewCards(el)[1].view_layout.hidden).toBe(true);
    expect(viewCards(el)[0].view_layout.hidden).toBeUndefined();
  });

  it('does not draw hidden cards outside edit mode', async () => {
    const el = await mount([
      { type: 'tile', view_layout: at(0, 0) },
      { type: 'tile', view_layout: at(400, 0, { hidden: true }) },
    ]);
    expect(el.renderRoot.querySelectorAll('uc-freespace-item')).toHaveLength(2);
    el.lovelace = { ...el.lovelace, editMode: false };
    await el.updateComplete;
    expect(el.renderRoot.querySelectorAll('uc-freespace-item')).toHaveLength(1);
  });

  it('clicking a grouped card selects its group', async () => {
    const el = await mount([
      { type: 'tile', view_layout: at(0, 0, { group: 'g1' }) },
      { type: 'tile', view_layout: at(400, 0) },
      { type: 'tile', view_layout: at(0, 200, { group: 'g1' }) },
    ]);
    el._engine._callbacks.onClick(0, false);
    expect(el._selection).toEqual([2, 0]);
  });
});

describe('FreeSpace view: auto height', () => {
  it('uses the measured height and keeps it across rebuilds', async () => {
    const el = await mount([{ type: 'tile', view_layout: at(0, 0, { auto_h: true }) }]);
    el.dispatchEvent(new CustomEvent('fs-measured', { detail: { cardIndex: 0, h: 420 } }));
    expect(el._layouts[0].h).toBe(420);
    el._rebuildLayouts();
    expect(el._layouts[0].h).toBe(420);
  });

  it('typing a height switches auto height off', async () => {
    const el = await mount([{ type: 'tile', view_layout: at(0, 0, { auto_h: true }) }]);
    el._setField(0, 'h', '400');
    await el.updateComplete;
    expect(viewCards(el)[0].view_layout).toMatchObject({ h: 400 });
    expect(viewCards(el)[0].view_layout.auto_h).toBeUndefined();
  });
});

describe('FreeSpace view: starters', () => {
  it('fills an empty view from a starter', async () => {
    const el = await mount([]);
    el.hass = { states: { 'light.kitchen': {} } };
    await el._applyStarter('desktop');
    expect(viewCards(el).length).toBeGreaterThan(5);
    expect(viewCards(el).find((c: any) => c.entity === 'light.kitchen')).toBeTruthy();
  });
});
