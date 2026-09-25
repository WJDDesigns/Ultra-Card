import { describe, expect, it } from 'vitest';
import {
  ALIGN_INSET,
  alignInArtboard,
  applyMove,
  resolvePinnedLayout,
  snapLayout,
  withPin,
} from '../uc-freespace-geometry';
import { normalizeCardLayout, parseViewLayoutStore, setCardLayout } from '../uc-freespace-config';
import type { FreeSpaceCardLayout } from '../types';

const base: FreeSpaceCardLayout = { x: 1500, y: 40, w: 300, h: 200, r: 0, z: 1 };

describe('FreeSpace pins', () => {
  it('leaves left-pinned and legacy cards where they are', () => {
    expect(resolvePinnedLayout(base, 2400)).toBe(base);
    expect(resolvePinnedLayout({ ...base, pin: 'right' }, 2400)).toEqual({ ...base, pin: 'right' });
  });

  it('keeps the distance to the right edge for right pins', () => {
    const pinned = withPin(base, 'right', 1900);
    const wide = resolvePinnedLayout(pinned, 2400);
    expect(wide.x).toBe(2000);
    expect(2400 - (wide.x + wide.w)).toBe(1900 - (base.x + base.w));
    expect(wide.ref_w).toBe(2400);
  });

  it('keeps the offset from the middle for center pins', () => {
    const wide = resolvePinnedLayout(withPin(base, 'center', 1900), 2100);
    expect(wide.x).toBe(1600);
  });

  it('stretches with the screen for left & right pins, never below the minimum', () => {
    const pinned = withPin(base, 'stretch', 1900);
    expect(resolvePinnedLayout(pinned, 2100).w).toBe(500);
    expect(resolvePinnedLayout(pinned, 1000).w).toBe(80);
  });

  it('clears pin fields when pinned left', () => {
    const cleared = withPin(withPin(base, 'right', 1900), 'left', 1900);
    expect(cleared).toEqual(base);
  });

  it('keeps the pin through moves, snapping and save/parse', () => {
    const pinned = withPin(base, 'right', 1900);
    const moved = snapLayout(applyMove(pinned, 13, 7), 8);
    expect(moved.pin).toBe('right');
    expect(moved.ref_w).toBe(1900);

    const config = { views: [{ cards: [{ type: 'tile' }] }] };
    const saved = setCardLayout(config, 0, 0, moved, 8, 'desktop');
    const store = parseViewLayoutStore(saved.views[0].cards[0].view_layout);
    expect(store.desktop?.pin).toBe('right');
    expect(store.desktop?.ref_w).toBe(1900);
  });

  it('drops a pin with no usable reference width', () => {
    expect(normalizeCardLayout({ ...base, pin: 'right' })?.pin).toBeUndefined();
    expect(normalizeCardLayout({ ...base, pin: 'sideways', ref_w: 1900 })?.pin).toBeUndefined();
  });

  it('aligns inside the artboard with an inset', () => {
    expect(alignInArtboard(base, 'left', 1900).x).toBe(ALIGN_INSET);
    expect(alignInArtboard(base, 'right', 1900).x).toBe(1900 - 300 - ALIGN_INSET);
    expect(alignInArtboard(base, 'center', 1900).x).toBe(800);
    expect(alignInArtboard(base, 'top', 1900).y).toBe(ALIGN_INSET);
  });
});
