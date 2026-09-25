/**
 * FreeSpace responsive breakpoints: Desktop, Laptop, Tablet, Phone.
 *
 * Each card can store a different layout per breakpoint under `view_layout`.
 * Missing breakpoints fall back upward (phone → tablet → laptop → desktop).
 * Legacy flat `view_layout: { x, y, w, h, … }` is treated as desktop.
 */

import type { FreeSpaceCardLayout } from './types';

export type FreeSpaceBreakpoint = 'desktop' | 'laptop' | 'tablet' | 'phone';

export const FREESPACE_BREAKPOINTS: readonly FreeSpaceBreakpoint[] = [
  'desktop',
  'laptop',
  'tablet',
  'phone',
] as const;

/**
 * Fallback order when a card has no layout for a breakpoint. A breakpoint is
 * either Custom or "Use Desktop", so it falls straight back to desktop.
 */
export const BREAKPOINT_FALLBACK: Record<FreeSpaceBreakpoint, FreeSpaceBreakpoint[]> = {
  desktop: ['desktop'],
  laptop: ['laptop', 'desktop'],
  tablet: ['tablet', 'desktop'],
  phone: ['phone', 'desktop'],
};

export interface BreakpointSpec {
  id: FreeSpaceBreakpoint;
  /** Inclusive min container width (px) that selects this breakpoint. */
  minWidth: number;
  /** Default artboard width in design units for this breakpoint. */
  canvasWidth: number;
  label: string;
  icon: string;
}

/**
 * Min-width cascade (largest first when matching):
 * Desktop ≥ 1440, Laptop ≥ 1024, Tablet ≥ 768, else Phone.
 */
export const BREAKPOINT_SPECS: Record<FreeSpaceBreakpoint, BreakpointSpec> = {
  desktop: {
    id: 'desktop',
    minWidth: 1440,
    canvasWidth: 1400,
    label: 'Desktop',
    icon: 'mdi:monitor',
  },
  laptop: {
    id: 'laptop',
    minWidth: 1024,
    canvasWidth: 1100,
    label: 'Laptop',
    icon: 'mdi:laptop',
  },
  tablet: {
    id: 'tablet',
    minWidth: 768,
    canvasWidth: 768,
    label: 'Tablet',
    icon: 'mdi:tablet',
  },
  phone: {
    id: 'phone',
    minWidth: 0,
    canvasWidth: 390,
    label: 'Phone',
    icon: 'mdi:cellphone',
  },
};

/** Resolve which breakpoint a container width belongs to. */
export function resolveBreakpoint(containerWidth: number): FreeSpaceBreakpoint {
  const w = Number.isFinite(containerWidth) ? containerWidth : 0;
  if (w >= BREAKPOINT_SPECS.desktop.minWidth) return 'desktop';
  if (w >= BREAKPOINT_SPECS.laptop.minWidth) return 'laptop';
  if (w >= BREAKPOINT_SPECS.tablet.minWidth) return 'tablet';
  return 'phone';
}

export function isFreeSpaceBreakpoint(v: unknown): v is FreeSpaceBreakpoint {
  return v === 'desktop' || v === 'laptop' || v === 'tablet' || v === 'phone';
}

/** Canvas width for a breakpoint, honouring optional per-view overrides. */
export function canvasWidthForBreakpoint(
  bp: FreeSpaceBreakpoint,
  overrides?: Partial<Record<FreeSpaceBreakpoint, number>>
): number {
  const override = overrides?.[bp];
  if (typeof override === 'number' && Number.isFinite(override) && override >= 280) {
    return Math.round(override);
  }
  return BREAKPOINT_SPECS[bp].canvasWidth;
}

/**
 * Stored shape on card `view_layout` after migration.
 * Flat x/y/w/h still accepted as desktop for backward compatibility.
 */
export type FreeSpaceViewLayoutStore = Partial<Record<FreeSpaceBreakpoint, FreeSpaceCardLayout>> &
  Partial<FreeSpaceCardLayout>;

/** True when the object looks like a flat layout (has x+y+w+h at top level). */
export function isFlatLayout(input: unknown): boolean {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const o = input as Record<string, unknown>;
  return (
    Number.isFinite(Number(o.x)) &&
    Number.isFinite(Number(o.y)) &&
    Number.isFinite(Number(o.w)) &&
    Number.isFinite(Number(o.h))
  );
}

/** True when any nested breakpoint key holds a layout-like object. */
export function hasNestedBreakpoints(input: unknown): boolean {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const o = input as Record<string, unknown>;
  return FREESPACE_BREAKPOINTS.some(bp => {
    const nest = o[bp];
    return nest && typeof nest === 'object' && !Array.isArray(nest);
  });
}
