import { describe, expect, it } from 'vitest';
import {
  alignGroup,
  cardsInRect,
  distributeGroup,
  resolvePinnedLayout,
} from '../uc-freespace-geometry';
import {
  assignDefaultLayouts,
  clearBreakpointLayouts,
  copyBreakpointLayouts,
  isBreakpointCustom,
  parseViewLayoutStore,
  removeCards,
} from '../uc-freespace-config';
import { DEFAULT_FREESPACE_OPTIONS, type FreeSpaceCardLayout } from '../types';

const L = (x: number, y: number, w = 100, h = 60): FreeSpaceCardLayout => ({ x, y, w, h, r: 0, z: 0 });

describe('group align / distribute', () => {
  const layouts = [L(10, 10), L(200, 80, 90), L(400, 40, 120, 90), L(5, 500)];

  it('aligns only the selected cards to their shared bounds', () => {
    const left = alignGroup(layouts, [0, 1, 2], 'left');
    expect(left.slice(0, 3).map(l => l.x)).toEqual([10, 10, 10]);
    expect(left[3]).toBe(layouts[3]);

    const right = alignGroup(layouts, [0, 1, 2], 'right');
    expect(right.slice(0, 3).map(l => l.x + l.w)).toEqual([520, 520, 520]);

    const middle = alignGroup(layouts, [0, 1, 2], 'middle');
    expect(middle.slice(0, 3).map(l => l.y + l.h / 2)).toEqual([75, 75, 75]);
  });

  it('needs two cards to align and three to distribute', () => {
    expect(alignGroup(layouts, [0], 'left')).toBe(layouts);
    expect(distributeGroup(layouts, [0, 1], 'horizontal')).toBe(layouts);
  });

  it('spaces cards evenly between the outermost ones', () => {
    const d = distributeGroup(layouts, [0, 1, 2], 'horizontal');
    const gap1 = d[1].x - (d[0].x + d[0].w);
    const gap2 = d[2].x - (d[1].x + d[1].w);
    expect(Math.abs(gap1 - gap2)).toBeLessThanOrEqual(1);
    expect(d[0].x).toBe(10);
    expect(d[2].x).toBe(400);
  });

  it('finds cards touched by a marquee', () => {
    expect(cardsInRect(layouts, { left: 0, top: 0, right: 250, bottom: 100 })).toEqual([0, 1]);
  });
});

describe('Use Desktop / Custom breakpoints', () => {
  const config = {
    views: [
      {
        cards: [
          { type: 'a', view_layout: { x: 10, y: 10, w: 100, h: 50, r: 0, z: 0 } },
          { type: 'b', view_layout: { x: 300, y: 10, w: 100, h: 50, r: 0, z: 0 } },
        ],
      },
    ],
  };

  it('treats a breakpoint with no stored layouts as Use Desktop', () => {
    expect(isBreakpointCustom(config.views[0].cards, 'tablet')).toBe(false);
    expect(isBreakpointCustom(config.views[0].cards, 'desktop')).toBe(true);
  });

  it('becomes Custom by copying Desktop, and resets back to Desktop', () => {
    const custom = copyBreakpointLayouts(config, 0, 'desktop', 'tablet');
    expect(isBreakpointCustom(custom.views[0].cards, 'tablet')).toBe(true);
    expect(parseViewLayoutStore(custom.views[0].cards[1].view_layout).tablet?.x).toBe(300);

    const reset = clearBreakpointLayouts(custom, 0, 'tablet');
    expect(isBreakpointCustom(reset.views[0].cards, 'tablet')).toBe(false);
    expect(parseViewLayoutStore(reset.views[0].cards[1].view_layout).desktop?.x).toBe(300);
  });

  it('keeps Desktop sizes on a borrowed layout instead of applying the Desktop pin width', () => {
    const pinned = {
      views: [
        {
          cards: [
            {
              type: 'a',
              view_layout: { x: 40, y: 10, w: 1800, h: 200, r: 0, z: 0, pin: 'stretch', ref_w: 1900 },
            },
          ],
        },
      ],
    };
    const [shown] = assignDefaultLayouts(pinned.views[0].cards, DEFAULT_FREESPACE_OPTIONS, undefined, 'tablet');
    expect(shown.ref_w).toBe(768);
    expect(resolvePinnedLayout(shown, 768).w).toBe(1800);
    expect(resolvePinnedLayout(shown, 868).w).toBe(1900);

    const custom = copyBreakpointLayouts(pinned, 0, 'desktop', 'tablet');
    expect(parseViewLayoutStore(custom.views[0].cards[0].view_layout).tablet?.ref_w).toBe(768);
    expect(parseViewLayoutStore(custom.views[0].cards[0].view_layout).desktop?.ref_w).toBe(1900);
  });

  it('removes several cards in one change', () => {
    const next = removeCards(config, 0, [0]);
    expect(next.views[0].cards.map((c: { type: string }) => c.type)).toEqual(['b']);
  });
});
