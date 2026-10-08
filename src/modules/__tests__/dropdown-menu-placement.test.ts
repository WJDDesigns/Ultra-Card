/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { resolveDropdownMenuPlacement, unionMenuAnchorRects } from '../dropdown-module';

describe('unionMenuAnchorRects', () => {
  it('widens a chevron trigger to cover a blank-glyph spacer on its left', () => {
    const trigger = { left: 457, top: 165, right: 487, bottom: 207, width: 30, height: 42 };
    const reach = { left: 389, top: 166, right: 458, bottom: 206, width: 69, height: 40 };
    expect(unionMenuAnchorRects(trigger, reach)).toEqual({
      left: 389,
      top: 165,
      right: 487,
      bottom: 207,
      width: 98,
      height: 42,
    });
  });
});

describe('resolveDropdownMenuPlacement', () => {
  it('keeps full-width triggers exactly as wide as the trigger', () => {
    expect(resolveDropdownMenuPlacement(20, 300, 420, 1100)).toEqual({ left: 20, width: 300 });
  });

  it('keeps narrow triggers unchanged when the options already fit', () => {
    expect(resolveDropdownMenuPlacement(100, 120, 90, 1100)).toEqual({ left: 100, width: 120 });
  });

  it('grows a chevron-only trigger to its option labels and centres it', () => {
    // HVAC overlay: 30px chevron, options "heat / cool / dry / off" with icons.
    const { left, width } = resolveDropdownMenuPlacement(180, 30, 110, 390);
    expect(width).toBe(110);
    expect(left).toBe(140);
  });

  it('caps content width and clamps inside the viewport', () => {
    const right = resolveDropdownMenuPlacement(370, 30, 600, 390);
    expect(right.width).toBe(280);
    expect(right.left + right.width).toBeLessThanOrEqual(390 - 8);

    const leftEdge = resolveDropdownMenuPlacement(0, 30, 200, 390);
    expect(leftEdge.left).toBe(8);
  });
});
