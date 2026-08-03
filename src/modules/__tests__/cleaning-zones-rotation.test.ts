/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { CardModule, CleaningZoneRegion, CleaningZonesModule } from '../../types';

/**
 * Zone rotation is the one piece of real geometry in this module. CSS `rotate()`
 * works in pixel space while zones are stored as fractions of the image, so the
 * conversion is easy to get subtly wrong on a non-square floorplan — hence the
 * deliberately non-square canvas below.
 */
const CANVAS = { imageW: 800, imageH: 500 };

/** Access the module's private geometry helpers without widening their API. */
type RotationInternals = {
  _rectStyle(
    rect: { x: number; y: number; width: number; height: number },
    rotation?: number
  ): string;
  _resizeZone(
    m: CleaningZonesModule,
    index: number,
    zone: CleaningZoneRegion,
    point: { x: number; y: number; px: number; py: number; imageW: number; imageH: number },
    updateModule: (updates: Partial<CardModule>) => void
  ): void;
};

let mod: RotationInternals & {
  createDefault(id?: string): CleaningZonesModule;
  renderPreview(m: CardModule, hass: unknown): unknown;
};

/** Screen-pixel position of a rotated rectangle's top-left corner. */
function topLeftCornerPx(zone: CleaningZoneRegion): { x: number; y: number } {
  const w = zone.width * CANVAS.imageW;
  const h = zone.height * CANVAS.imageH;
  const cx = zone.x * CANVAS.imageW + w / 2;
  const cy = zone.y * CANVAS.imageH + h / 2;
  const rad = ((zone.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: cx + (-w / 2) * cos - (-h / 2) * sin,
    y: cy + (-w / 2) * sin + (-h / 2) * cos,
  };
}

function point(px: number, py: number) {
  return {
    x: px / CANVAS.imageW,
    y: py / CANVAS.imageH,
    px,
    py,
    ...CANVAS,
  };
}

/** Runs a resize and returns the zone as it ends up in the config. */
function resize(zone: CleaningZoneRegion, px: number, py: number): CleaningZoneRegion {
  const m = { ...mod.createDefault('cz-1'), zones: [zone] };
  let next: CleaningZoneRegion = zone;
  mod._resizeZone(m, 0, zone, point(px, py), updates => {
    next = (updates as Partial<CleaningZonesModule>).zones![0]!;
  });
  return next;
}

describe('cleaning zones: rotation', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('cleaning_zones');
    mod = getModuleRegistry().getModule('cleaning_zones') as unknown as typeof mod;
  });

  describe('_rectStyle', () => {
    const rect = { x: 0.1, y: 0.2, width: 0.3, height: 0.4 };

    it('omits the transform when the zone is not rotated', () => {
      expect(mod._rectStyle(rect)).not.toContain('transform');
      expect(mod._rectStyle(rect, 0)).not.toContain('transform');
      expect(mod._rectStyle(rect, undefined)).not.toContain('transform');
    });

    it('emits a rotation transform when the zone is angled', () => {
      expect(mod._rectStyle(rect, 35)).toContain('transform:rotate(35deg)');
      // Position and size still have to be there.
      expect(mod._rectStyle(rect, 35)).toContain('left:10%');
      expect(mod._rectStyle(rect, 35)).toContain('height:40%');
    });

    it('wraps angles outside 0-359 rather than emitting them raw', () => {
      expect(mod._rectStyle(rect, 405)).toContain('rotate(45deg)');
      expect(mod._rectStyle(rect, -90)).toContain('rotate(270deg)');
      expect(mod._rectStyle(rect, 360)).not.toContain('transform');
    });

    it('ignores a non-finite rotation instead of emitting NaN', () => {
      expect(mod._rectStyle(rect, NaN)).not.toContain('transform');
      expect(mod._rectStyle(rect, Infinity)).not.toContain('transform');
    });
  });

  describe('_resizeZone', () => {
    const base: CleaningZoneRegion = {
      id: 'z1',
      name: 'Kitchen',
      x: 0.25,
      y: 0.3,
      width: 0.3,
      height: 0.2,
    };

    it('drags the corner to the pointer when unrotated', () => {
      // Pointer at 70% / 80% of the image should become the bottom-right corner.
      const next = resize(base, 0.7 * CANVAS.imageW, 0.8 * CANVAS.imageH);
      expect(next.x).toBeCloseTo(0.25, 3);
      expect(next.y).toBeCloseTo(0.3, 3);
      expect(next.width).toBeCloseTo(0.45, 2);
      expect(next.height).toBeCloseTo(0.5, 2);
    });

    it('keeps the opposite corner pinned while resizing a rotated zone', () => {
      const rotated = { ...base, rotation: 40 };
      const anchorBefore = topLeftCornerPx(rotated);

      const next = resize(rotated, 0.8 * CANVAS.imageW, 0.75 * CANVAS.imageH);
      const anchorAfter = topLeftCornerPx(next);

      // Sub-pixel tolerance: the config stores 3 decimal places.
      expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 0);
      expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 0);
      expect(next.rotation).toBe(40);
    });

    it('grows the zone when the pointer moves out along its own diagonal', () => {
      const rotated = { ...base, rotation: 40 };
      // Chosen in the zone's local frame (200, 90) — beyond both half-extents —
      // then mapped back to screen pixels, which is how a user perceives the drag.
      const next = resize(rotated, 415.3, 397.5);
      expect(next.width).toBeGreaterThan(rotated.width);
      expect(next.height).toBeGreaterThan(rotated.height);
    });

    /**
     * Corner resize is measured along the zone's *own* axes, so a drag that looks
     * outward on screen can still be backwards in the rotated frame. Collapsing
     * that axis to the minimum is correct, not a glitch.
     */
    it('shrinks only the local axis the pointer moved back along', () => {
      const rotated = { ...base, rotation: 40 };
      // Almost pure local +x, slightly negative local y.
      const next = resize(rotated, 0.8 * CANVAS.imageW, 0.75 * CANVAS.imageH);
      expect(next.width).toBeGreaterThan(rotated.width);
      expect(next.height).toBeCloseTo(0.03, 3);
    });

    it('never collapses a rotated zone below the minimum size', () => {
      const rotated = { ...base, rotation: 125 };
      // Pointer dragged far past the anchor, which would invert the rectangle.
      const next = resize(rotated, 0, 0);
      expect(next.width).toBeGreaterThan(0);
      expect(next.height).toBeGreaterThan(0);
      expect(Number.isFinite(next.x)).toBe(true);
      expect(Number.isFinite(next.y)).toBe(true);
    });

    it('produces the same result at 0 and 360 degrees', () => {
      const a = resize({ ...base, rotation: 0 }, 500, 400);
      const b = resize({ ...base, rotation: 360 }, 500, 400);
      expect(b.width).toBeCloseTo(a.width, 3);
      expect(b.height).toBeCloseTo(a.height, 3);
    });
  });

  it('renders a preview containing rotated zones without throwing', () => {
    const m: CleaningZonesModule = {
      ...mod.createDefault('cz-2'),
      todo_entity: 'todo.cleaning',
      floorplan_image: '/local/plan.png',
      zones: [
        { id: 'a', name: 'Lounge', x: 0.1, y: 0.1, width: 0.3, height: 0.2, rotation: 37 },
        { id: 'b', name: 'Bath', x: 0.5, y: 0.5, width: 0.1, height: 0.06, rotation: 300 },
        { id: 'c', name: 'Hall', x: 0.7, y: 0.2, width: 0.2, height: 0.2 },
      ],
    };

    const host = document.createElement('div');
    document.body.appendChild(host);
    expect(() => render(html`${mod.renderPreview(m, mockHass)}`, host)).not.toThrow();

    const rendered = host.querySelectorAll('.uc-cz-zone');
    expect(rendered.length).toBe(3);
    const styles = Array.from(rendered).map(el => el.getAttribute('style') || '');
    expect(styles[0]).toContain('rotate(37deg)');
    expect(styles[1]).toContain('rotate(300deg)');
    expect(styles[2]).not.toContain('rotate');
  });
});
