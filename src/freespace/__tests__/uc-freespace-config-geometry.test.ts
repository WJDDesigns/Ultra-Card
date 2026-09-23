import { describe, it, expect } from 'vitest';
import {
  applyZOrder,
  assignDefaultLayouts,
  computeArtboardHeight,
  countSectionCards,
  flattenSectionsToCards,
  normalizeCardLayout,
  normalizeFreeSpaceOptions,
  readCardLayout,
  setCardLayout,
} from '../uc-freespace-config';
import {
  applyMove,
  applyResize,
  applyRotate,
  autoPlace,
  normalizeAngle,
  snap,
  snapLayout,
  stackOrder,
} from '../uc-freespace-geometry';
import { DEFAULT_FREESPACE_OPTIONS, type FreeSpaceCardLayout } from '../types';

describe('normalizeFreeSpaceOptions', () => {
  it('returns defaults for garbage', () => {
    expect(normalizeFreeSpaceOptions(null)).toEqual(DEFAULT_FREESPACE_OPTIONS);
    expect(normalizeFreeSpaceOptions({ canvas_width: 'x' }).canvas_width).toBe(1200);
  });

  it('accepts scale narrow mode and clamps sizes', () => {
    const o = normalizeFreeSpaceOptions({
      canvas_width: 100,
      min_height: 50,
      grid: -4,
      narrow: 'scale',
    });
    expect(o.canvas_width).toBe(320);
    expect(o.min_height).toBe(200);
    expect(o.grid).toBe(0);
    expect(o.narrow).toBe('scale');
  });
});

describe('normalizeCardLayout / readCardLayout', () => {
  it('rejects incomplete layouts', () => {
    expect(normalizeCardLayout({ x: 1 })).toBeNull();
    expect(readCardLayout({ type: 'tile' })).toBeNull();
  });

  it('reads a full view_layout', () => {
    const card = { type: 'tile', view_layout: { x: 10, y: 20, w: 100, h: 80, r: 15, z: 2 } };
    expect(readCardLayout(card)).toEqual({ x: 10, y: 20, w: 100, h: 80, r: 15, z: 2 });
  });
});

describe('assignDefaultLayouts', () => {
  it('keeps existing layouts and fills gaps', () => {
    const cards = [
      { type: 'a', view_layout: { x: 0, y: 0, w: 320, h: 160, r: 0, z: 0 } },
      { type: 'b' },
    ];
    const layouts = assignDefaultLayouts(cards, DEFAULT_FREESPACE_OPTIONS);
    expect(layouts).toHaveLength(2);
    expect(layouts[0]).toMatchObject({ x: 0, y: 0 });
    expect(layouts[1].w).toBe(320);
    // Second card should not overlap the first
    expect(layouts[1].x !== 0 || layouts[1].y !== 0).toBe(true);
  });
});

describe('setCardLayout / applyLayoutsToView', () => {
  it('writes view_layout without mutating the original', () => {
    const config = {
      views: [{ title: 'Home', cards: [{ type: 'tile', entity: 'light.a' } as Record<string, unknown>] }],
    };
    const next = setCardLayout(config, 0, 0, { x: 8, y: 16, w: 320, h: 160, r: 0, z: 1 }, 8);
    expect((config.views[0].cards[0] as Record<string, unknown>).view_layout).toBeUndefined();
    // Desktop-only stays flat for backward compatibility
    expect((next.views[0].cards[0] as Record<string, unknown>).view_layout).toEqual({
      x: 8,
      y: 16,
      w: 320,
      h: 160,
      r: 0,
      z: 1,
    });
  });

  it('stores nested layouts per breakpoint', () => {
    const config = {
      views: [
        {
          cards: [
            {
              type: 'tile',
              view_layout: { x: 0, y: 0, w: 320, h: 160, r: 0, z: 0 },
            },
          ],
        },
      ],
    };
    const next = setCardLayout(
      config,
      0,
      0,
      { x: 10, y: 20, w: 200, h: 100, r: 0, z: 0 },
      0,
      'phone'
    );
    const vl = (next.views[0].cards[0] as Record<string, unknown>).view_layout as Record<
      string,
      unknown
    >;
    expect(vl.desktop).toMatchObject({ x: 0, y: 0 });
    expect(vl.phone).toMatchObject({ x: 10, y: 20, w: 200 });
  });
});

describe('breakpoint fallback', () => {
  it('falls back phone → tablet → laptop → desktop', () => {
    const card = {
      type: 'tile',
      view_layout: { desktop: { x: 1, y: 2, w: 100, h: 80, r: 0, z: 0 } },
    };
    expect(readCardLayout(card, 'phone')).toMatchObject({ x: 1, y: 2 });
    expect(readCardLayout(card, 'laptop')).toMatchObject({ x: 1, y: 2 });
  });

  it('treats flat legacy layout as desktop', () => {
    const card = { type: 'tile', view_layout: { x: 5, y: 6, w: 100, h: 80, r: 0, z: 1 } };
    expect(readCardLayout(card, 'desktop')).toMatchObject({ x: 5, y: 6 });
    expect(readCardLayout(card, 'tablet')).toMatchObject({ x: 5, y: 6 });
  });
});

describe('flattenSectionsToCards', () => {
  it('merges section cards and drops sections', () => {
    const view = {
      type: 'sections',
      cards: [{ type: 'existing' }],
      sections: [{ type: 'grid', cards: [{ type: 'from-section' }] }],
    };
    const next = flattenSectionsToCards(view, DEFAULT_FREESPACE_OPTIONS);
    expect(next.sections).toBeUndefined();
    expect(next.cards).toHaveLength(2);
    expect(next.cards[0].view_layout).toBeDefined();
    expect(next.cards[1].type).toBe('from-section');
  });

  it('countSectionCards counts nested cards', () => {
    expect(
      countSectionCards({
        sections: [{ cards: [1, 2] }, { cards: [3] }, {}],
      })
    ).toBe(3);
  });
});

describe('applyZOrder', () => {
  const base: FreeSpaceCardLayout[] = [
    { x: 0, y: 0, w: 100, h: 80, r: 0, z: 0 },
    { x: 0, y: 0, w: 100, h: 80, r: 0, z: 1 },
    { x: 0, y: 0, w: 100, h: 80, r: 0, z: 2 },
  ];

  it('brings to front and sends to back', () => {
    expect(applyZOrder(base, 0, 'front')[0].z).toBeGreaterThan(2);
    expect(applyZOrder(base, 2, 'back')[2].z).toBeLessThan(0);
  });
});

describe('computeArtboardHeight', () => {
  it('respects min height and content', () => {
    expect(computeArtboardHeight([], 800)).toBe(800);
    expect(
      computeArtboardHeight([{ x: 0, y: 900, w: 100, h: 100, r: 0, z: 0 }], 800)
    ).toBeGreaterThan(1000);
  });
});

describe('geometry', () => {
  it('snaps values and layouts', () => {
    expect(snap(13, 8)).toBe(16);
    expect(snapLayout({ x: 13, y: 3, w: 100, h: 80, r: 0, z: 0 }, 8)).toMatchObject({
      x: 16,
      y: 0,
    });
  });

  it('moves, resizes, rotates', () => {
    const origin = { x: 100, y: 100, w: 200, h: 100, r: 0, z: 0 };
    expect(applyMove(origin, 10, -20)).toMatchObject({ x: 110, y: 80 });
    expect(applyResize(origin, 'se', 40, 20)).toMatchObject({ w: 240, h: 120 });
    expect(applyResize(origin, 'nw', -20, -10)).toMatchObject({
      x: 80,
      y: 90,
      w: 220,
      h: 110,
    });
    const rotated = applyRotate(origin, 0, 45, false);
    expect(rotated.r).toBeCloseTo(45);
    expect(applyRotate(origin, 0, 7, true).r).toBe(0);
    expect(applyRotate(origin, 0, 10, true).r).toBe(15);
  });

  it('normalises angles', () => {
    expect(normalizeAngle(370)).toBe(10);
    expect(normalizeAngle(-190)).toBe(170);
  });

  it('auto-places without overlap and stack-orders by y then x', () => {
    const a = autoPlace([], 1200);
    const b = autoPlace([a], 1200);
    expect(a.x === b.x && a.y === b.y).toBe(false);
    const layouts = [
      { x: 100, y: 200, w: 10, h: 10, r: 0, z: 0 },
      { x: 0, y: 0, w: 10, h: 10, r: 0, z: 0 },
      { x: 50, y: 0, w: 10, h: 10, r: 0, z: 0 },
    ];
    expect(stackOrder(layouts)).toEqual([1, 2, 0]);
  });
});
