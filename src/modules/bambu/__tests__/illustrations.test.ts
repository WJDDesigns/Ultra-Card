import { describe, it, expect } from 'vitest';
import { HOTSPOTS, hotspotBoundsOk, anchorsForFamily } from '../illustrations';

describe('bambu illustrations hotspots', () => {
  it('keeps every family anchor within 0..1', () => {
    for (const family of Object.keys(HOTSPOTS) as Array<keyof typeof HOTSPOTS>) {
      expect(hotspotBoundsOk(family)).toBe(true);
    }
  });

  it('returns enclosed anchors by default', () => {
    const a = anchorsForFamily(undefined);
    expect(a.nozzle.x).toBeGreaterThan(0);
    expect(a.bed.y).toBeGreaterThan(a.nozzle.y);
  });
});
