import { describe, it, expect } from 'vitest';
import {
  BREAKPOINT_SPECS,
  canvasWidthForBreakpoint,
  resolveBreakpoint,
} from '../uc-freespace-breakpoints';

describe('resolveBreakpoint', () => {
  it('picks desktop / laptop / tablet / phone by width', () => {
    expect(resolveBreakpoint(1920)).toBe('desktop');
    expect(resolveBreakpoint(1440)).toBe('desktop');
    expect(resolveBreakpoint(1439)).toBe('laptop');
    expect(resolveBreakpoint(1024)).toBe('laptop');
    expect(resolveBreakpoint(1023)).toBe('tablet');
    expect(resolveBreakpoint(768)).toBe('tablet');
    expect(resolveBreakpoint(767)).toBe('phone');
    expect(resolveBreakpoint(390)).toBe('phone');
  });
});

describe('canvasWidthForBreakpoint', () => {
  it('uses defaults and overrides', () => {
    expect(canvasWidthForBreakpoint('desktop')).toBe(BREAKPOINT_SPECS.desktop.canvasWidth);
    expect(canvasWidthForBreakpoint('phone')).toBe(390);
    expect(canvasWidthForBreakpoint('phone', { phone: 420 })).toBe(420);
  });
});
