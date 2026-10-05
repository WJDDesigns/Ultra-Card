import { afterEach, describe, expect, it, vi } from 'vitest';
import '../uc-freespace-view-impl';
import {
  ALIGN_INSET,
  FIT_PADDING,
  alignGroupToArtboard,
  applyFit,
  fitLayoutsToWidth,
} from '../uc-freespace-geometry';
import {
  copyDesktopLayoutsFitted,
  fittedDesktopLayouts,
  parseViewLayoutStore,
} from '../uc-freespace-config';
import type { FreeSpaceCardLayout } from '../types';

const card = (x: number, y: number, w = 320, h = 160): FreeSpaceCardLayout => ({ x, y, w, h, r: 0, z: 0 });

describe('fitLayoutsToWidth', () => {
  it('centres cards that already fit without scaling them', () => {
    const fit = fitLayoutsToWidth([card(600, 40), card(1000, 40)], 1100);
    expect(fit.scale).toBe(1);
    const contentW = 1320 - 600 + 2 * FIT_PADDING;
    expect(600 * fit.scale + fit.tx).toBeCloseTo((1100 - contentW) / 2 + FIT_PADDING);
  });

  it('shrinks cards wider than the target and centres them', () => {
    const layouts = [card(100, 0), card(1500, 0)];
    const fit = fitLayoutsToWidth(layouts, 768);
    const left = applyFit(layouts[0]!, fit, 768);
    const right = applyFit(layouts[1]!, fit, 768);
    expect(fit.scale).toBeLessThan(1);
    expect(left.x).toBe(Math.round(FIT_PADDING * fit.scale));
    expect(768 - (right.x + right.w)).toBeLessThanOrEqual(Math.ceil(FIT_PADDING * fit.scale) + 1);
  });

  it('is a no-op for an empty view', () => {
    expect(fitLayoutsToWidth([], 768)).toEqual({ scale: 1, tx: 0, right: 0 });
  });
});

describe('copyDesktopLayoutsFitted', () => {
  it('copies the shrunk, centred Desktop picture and keeps existing layouts', () => {
    const config = {
      views: [
        {
          freespace: { canvas_widths: { tablet: 768 } },
          cards: [
            { type: 'tile', view_layout: card(100, 0) },
            { type: 'tile', view_layout: { desktop: card(1500, 0), tablet: card(8, 8) } },
          ],
        },
      ],
    };
    const next = copyDesktopLayoutsFitted(config, 0, 'tablet');
    const [a, b] = next.views[0].cards.map((c: any) => parseViewLayoutStore(c.view_layout));
    const fit = fitLayoutsToWidth([card(100, 0), card(1500, 0)], 768);
    expect(a.tablet).toEqual(applyFit(card(100, 0), fit, 768));
    expect(a.desktop).toMatchObject({ x: 100 });
    expect(b.tablet).toMatchObject({ x: 8, y: 8 });
  });
});

describe('alignGroupToArtboard', () => {
  const layouts = [card(100, 50), card(500, 90), card(2000, 0)];

  it('centres the selection as one block and keeps its spacing', () => {
    const next = alignGroupToArtboard(layouts, [0, 1], 'center', 1200);
    const blockW = 820 - 100;
    expect(next[0]!.x).toBe((1200 - blockW) / 2);
    expect(next[1]!.x - next[0]!.x).toBe(400);
    expect(next[2]).toBe(layouts[2]);
  });

  it('moves the block to the canvas edges and top', () => {
    expect(alignGroupToArtboard(layouts, [0, 1], 'left', 1200)[0]!.x).toBe(ALIGN_INSET);
    const right = alignGroupToArtboard(layouts, [0, 1], 'right', 1200);
    expect(right[1]!.x + right[1]!.w).toBe(1200 - ALIGN_INSET);
    const top = alignGroupToArtboard(layouts, [0, 1], 'top', 1200);
    expect(top[0]!.y).toBe(ALIGN_INSET);
    expect(top[1]!.y).toBe(ALIGN_INSET + 40);
  });
});

describe('fittedDesktopLayouts', () => {
  it('matches what Use Desktop shows for the breakpoint', () => {
    const view = { cards: [{ view_layout: card(100, 0) }, { view_layout: card(1500, 0) }] };
    const fit = fitLayoutsToWidth([card(100, 0), card(1500, 0)], 768);
    expect(fittedDesktopLayouts(view, 'tablet')).toEqual([
      applyFit(card(100, 0), fit, 768),
      applyFit(card(1500, 0), fit, 768),
    ]);
  });
});

describe('FreeSpace view on Use Desktop', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(cards: unknown[]) {
    const el = document.createElement('ultra-freespace-view-impl') as any;
    el.lovelace = {
      editMode: true,
      config: { views: [{ type: 'custom:ultra-freespace-view', cards }] },
      saveConfig: vi.fn(),
    };
    el.index = 0;
    el.cards = cards.map(() => document.createElement('div'));
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('shrinks Desktop to fit Laptop and turns editing off until Custom', async () => {
    const el = await mount([
      { type: 'tile', view_layout: card(0, 0) },
      { type: 'tile', view_layout: card(1600, 0) },
    ]);
    el._discoverable = true;
    el._setEditBreakpoint('laptop');
    await el.updateComplete;

    expect(el._following).toBe(true);
    expect(el._editingAllowed()).toBe(false);
    expect(el._scale).toBeLessThan(1);
    expect(el._layouts[1]).toMatchObject({ x: 1600 });
  });

  it('keeps Phone on its own behaviour', async () => {
    const el = await mount([{ type: 'tile', view_layout: card(0, 0) }]);
    el._setEditBreakpoint('phone');
    await el.updateComplete;
    expect(el._following).toBe(false);
  });

  it('stops following once the breakpoint is Custom', async () => {
    const el = await mount([
      { type: 'tile', view_layout: { desktop: card(0, 0), laptop: card(40, 40) } },
    ]);
    el._setEditBreakpoint('laptop');
    await el.updateComplete;
    expect(el._following).toBe(false);
    expect(el._layouts[0]).toMatchObject({ x: 40, y: 40 });
  });

  it('resets only the selected cards to their fitted Desktop spot', async () => {
    const el = await mount([
      { type: 'tile', view_layout: { desktop: card(0, 0), tablet: card(40, 40) } },
      { type: 'tile', view_layout: { desktop: card(1600, 0), tablet: card(300, 300) } },
    ]);
    el._discoverable = true;
    el._setEditBreakpoint('tablet');
    await el.updateComplete;
    el._selection = [1];
    el._resetSelectionToDesktop();
    await el.updateComplete;

    const expected = fittedDesktopLayouts(el.lovelace.config.views[0], 'tablet')[1];
    expect(el._layouts[1]).toMatchObject({ x: expected.x, y: expected.y, w: expected.w });
    expect(el._layouts[0]).toMatchObject({ x: 40, y: 40 });
    expect(el.lovelace.saveConfig).toHaveBeenCalledTimes(1);
  });
});
