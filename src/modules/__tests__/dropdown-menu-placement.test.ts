/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { resolveDropdownMenuPlacement, measureDropdownMenuContentWidth } from '../dropdown-module';

describe('resolveDropdownMenuPlacement', () => {
  it('keeps full-width triggers exactly as wide as the trigger', () => {
    expect(resolveDropdownMenuPlacement(20, 300, 420, 1100)).toEqual({ left: 20, width: 300 });
  });

  it('does not grow a 120px compact trigger when content already fits', () => {
    expect(resolveDropdownMenuPlacement(40, 120, 90, 1100)).toEqual({ left: 40, width: 120 });
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

describe('measureDropdownMenuContentWidth', () => {
  it('reads scrollWidth while unhidden, then restores the original styles', () => {
    const menu = document.createElement('div');
    menu.className = 'dropdown-options';
    menu.style.display = 'none';
    menu.style.visibility = 'hidden';
    menu.style.overflowX = 'hidden';
    menu.style.width = '30px';
    Object.defineProperty(menu, 'scrollWidth', { configurable: true, get: () => 110 });
    Object.defineProperty(menu, 'offsetWidth', { configurable: true, get: () => 110 });
    document.body.appendChild(menu);

    expect(measureDropdownMenuContentWidth(menu)).toBe(110);
    expect(menu.style.display).toBe('none');
    expect(menu.style.visibility).toBe('hidden');
    expect(menu.style.width).toBe('30px');
    expect(menu.style.overflowX).toBe('hidden');
    menu.remove();
  });

  it('adds an icon slot when ha-icon has not laid out yet', () => {
    const menu = document.createElement('div');
    menu.style.display = 'none';
    menu.style.width = '30px';
    Object.defineProperty(menu, 'scrollWidth', { configurable: true, get: () => 63 });
    Object.defineProperty(menu, 'offsetWidth', { configurable: true, get: () => 63 });
    const opt = document.createElement('div');
    opt.className = 'dropdown-option';
    opt.style.whiteSpace = 'pre-wrap';
    const icon = document.createElement('ha-icon');
    icon.getBoundingClientRect = () => ({ width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON() {} });
    opt.appendChild(icon);
    menu.appendChild(opt);
    document.body.appendChild(menu);

    expect(measureDropdownMenuContentWidth(menu, 30)).toBe(87);
    expect(measureDropdownMenuContentWidth(menu, 120)).toBe(63);
    expect(opt.style.whiteSpace).toBe('pre-wrap');
    menu.remove();
  });
});
