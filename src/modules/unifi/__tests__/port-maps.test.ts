import { describe, expect, it } from 'vitest';
import { PORT_MAP_SKUS, inferPortCountFromModel, portCountForSku, portMapForSku } from '../port-maps';

/**
 * The maps place lights on real product photos, so bad data shows up as lights
 * on the wrong port or bleeding onto the chassis. These checks catch the
 * mistakes that are easy to make when transcribing measurements.
 */
describe('port maps', () => {
  it('exposes at least the mapped gateways and switches', () => {
    expect(PORT_MAP_SKUS.length).toBeGreaterThanOrEqual(10);
    for (const sku of PORT_MAP_SKUS) expect(portMapForSku(sku)).not.toBeNull();
  });

  it('returns null for unknown or missing skus', () => {
    expect(portMapForSku(undefined)).toBeNull();
    expect(portMapForSku('')).toBeNull();
    expect(portMapForSku('NOT-A-REAL-SKU')).toBeNull();
  });

  it('maps the Flex 2.5G 8 family as nine ports including the 10G combo', () => {
    expect(portMapForSku('USW-Flex-2.5G-8')?.cells.map(c => c.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(portMapForSku('USW-Flex-2.5G-8-POE')?.cells).toHaveLength(9);
    expect(portMapForSku('usw-flex-2.5g-8-poe')?.cells).toHaveLength(9);
    expect(portCountForSku('USW-Flex-2.5G-8')).toBe(9);
    expect(portCountForSku('USW-Flex-Mini')).toBe(5);
    expect(inferPortCountFromModel('USM25G8')).toBe(9);
    expect(inferPortCountFromModel('USW Flex')).toBe(5);
  });

  for (const sku of PORT_MAP_SKUS) {
    describe(sku, () => {
      const map = portMapForSku(sku)!;

      it('numbers ports uniquely from 1 with no gaps', () => {
        const indices = map.cells.map(c => c.index).sort((a, b) => a - b);
        expect(new Set(indices).size).toBe(indices.length);
        expect(indices[0]).toBe(1);
        expect(indices[indices.length - 1]).toBe(indices.length);
      });

      it('keeps every cell inside the image', () => {
        for (const c of map.cells) {
          expect(c.w).toBeGreaterThan(0);
          expect(c.h).toBeGreaterThan(0);
          expect(c.cx - c.w / 2).toBeGreaterThanOrEqual(0);
          expect(c.cx + c.w / 2).toBeLessThanOrEqual(1);
          expect(c.y).toBeGreaterThanOrEqual(0);
          expect(c.y + c.h).toBeLessThanOrEqual(1);
        }
      });

      it('never overlaps two cells', () => {
        const rect = (c: (typeof map.cells)[number]) => ({
          x0: c.cx - c.w / 2,
          x1: c.cx + c.w / 2,
          y0: c.y,
          y1: c.y + c.h,
        });
        for (let i = 0; i < map.cells.length; i++) {
          for (let j = i + 1; j < map.cells.length; j++) {
            const a = rect(map.cells[i]);
            const b = rect(map.cells[j]);
            const overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
            const overlapY = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
            const overlaps = overlapX > 0.0005 && overlapY > 0.0005;
            expect(
              overlaps,
              `${sku}: port ${map.cells[i].index} overlaps port ${map.cells[j].index}`
            ).toBe(false);
          }
        }
      });
    });
  }
});
