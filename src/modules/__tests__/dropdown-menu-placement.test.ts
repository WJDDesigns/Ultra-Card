/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { resolveDropdownMenuPlacement } from '../dropdown-module';

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
