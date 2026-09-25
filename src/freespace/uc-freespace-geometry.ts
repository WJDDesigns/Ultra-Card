/**
 * Pure geometry helpers for FreeSpace (snap, resize, rotate, auto-place).
 */

import {
  DEFAULT_CARD_H,
  DEFAULT_CARD_W,
  MIN_CARD_H,
  MIN_CARD_W,
  type FreeSpaceAlign,
  type FreeSpaceCardLayout,
  type FreeSpacePin,
  type ResizeHandle,
} from './types';

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function snap(value: number, grid: number): number {
  if (!grid || grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

export function snapLayout(layout: FreeSpaceCardLayout, grid: number): FreeSpaceCardLayout {
  if (!grid || grid <= 0) return clampLayout(layout);
  return clampLayout({
    ...layout,
    x: snap(layout.x, grid),
    y: snap(layout.y, grid),
    w: Math.max(MIN_CARD_W, snap(layout.w, grid)),
    h: Math.max(MIN_CARD_H, snap(layout.h, grid)),
  });
}

export function clampLayout(layout: FreeSpaceCardLayout): FreeSpaceCardLayout {
  const out: FreeSpaceCardLayout = {
    x: Number.isFinite(layout.x) ? layout.x : 0,
    y: Number.isFinite(layout.y) ? Math.max(0, layout.y) : 0,
    w: Number.isFinite(layout.w) ? Math.max(MIN_CARD_W, layout.w) : DEFAULT_CARD_W,
    h: Number.isFinite(layout.h) ? Math.max(MIN_CARD_H, layout.h) : DEFAULT_CARD_H,
    r: Number.isFinite(layout.r) ? normalizeAngle(layout.r) : 0,
    z: Number.isFinite(layout.z) ? Math.round(layout.z) : 0,
  };
  if (layout.pin && layout.pin !== 'left' && Number.isFinite(layout.ref_w) && layout.ref_w! > 0) {
    out.pin = layout.pin;
    out.ref_w = Math.round(layout.ref_w!);
  }
  return out;
}

/**
 * Position a pinned card for the current artboard width. Returns layout in
 * current-width coordinates with `ref_w` set to `width`, so it can be saved
 * as-is after the user edits it.
 */
export function resolvePinnedLayout(
  layout: FreeSpaceCardLayout,
  width: number
): FreeSpaceCardLayout {
  if (!layout.pin || layout.pin === 'left' || !layout.ref_w || !(width > 0)) return layout;
  const delta = width - layout.ref_w;
  if (delta === 0) return layout;
  const next: FreeSpaceCardLayout = { ...layout, ref_w: Math.round(width) };
  if (layout.pin === 'right') next.x = layout.x + delta;
  else if (layout.pin === 'center') next.x = layout.x + delta / 2;
  else if (layout.pin === 'stretch') next.w = Math.max(MIN_CARD_W, layout.w + delta);
  return next;
}

export function resolvePinnedLayouts(
  layouts: FreeSpaceCardLayout[],
  width: number
): FreeSpaceCardLayout[] {
  return layouts.map(l => resolvePinnedLayout(l, width));
}

/** Set (or clear, for `left`) a card's pin at the current artboard width. */
export function withPin(
  layout: FreeSpaceCardLayout,
  pin: FreeSpacePin,
  width: number
): FreeSpaceCardLayout {
  const { pin: _p, ref_w: _r, ...rest } = layout;
  if (pin === 'left' || !(width > 0)) return rest;
  return { ...rest, pin, ref_w: Math.round(width) };
}

/** Inset used when aligning a card to the artboard edges. */
export const ALIGN_INSET = 16;

/** Align a card within the artboard (ignores rotation; uses the unrotated box). */
export function alignInArtboard(
  layout: FreeSpaceCardLayout,
  align: FreeSpaceAlign,
  width: number
): FreeSpaceCardLayout {
  let { x, y } = layout;
  if (align === 'left') x = ALIGN_INSET;
  else if (align === 'right') x = width - layout.w - ALIGN_INSET;
  else if (align === 'center') x = (width - layout.w) / 2;
  else if (align === 'top') y = ALIGN_INSET;
  return clampLayout({ ...layout, x: Math.round(x), y: Math.round(y) });
}

/** Bounding box of several layouts (unrotated boxes). */
export function selectionBounds(layouts: FreeSpaceCardLayout[]): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  return {
    left: Math.min(...layouts.map(l => l.x)),
    top: Math.min(...layouts.map(l => l.y)),
    right: Math.max(...layouts.map(l => l.x + l.w)),
    bottom: Math.max(...layouts.map(l => l.y + l.h)),
  };
}

/** Align the cards at `indices` to their shared bounding box. */
export function alignGroup(
  layouts: FreeSpaceCardLayout[],
  indices: number[],
  align: FreeSpaceAlign
): FreeSpaceCardLayout[] {
  const picked = indices.map(i => layouts[i]).filter(Boolean) as FreeSpaceCardLayout[];
  if (picked.length < 2) return layouts;
  const b = selectionBounds(picked);
  const set = new Set(indices);
  return layouts.map((l, i) => {
    if (!set.has(i)) return l;
    let { x, y } = l;
    if (align === 'left') x = b.left;
    else if (align === 'right') x = b.right - l.w;
    else if (align === 'center') x = (b.left + b.right) / 2 - l.w / 2;
    else if (align === 'top') y = b.top;
    else if (align === 'bottom') y = b.bottom - l.h;
    else if (align === 'middle') y = (b.top + b.bottom) / 2 - l.h / 2;
    return clampLayout({ ...l, x: Math.round(x), y: Math.round(y) });
  });
}

/** Space the cards at `indices` evenly between the outermost two (needs 3+). */
export function distributeGroup(
  layouts: FreeSpaceCardLayout[],
  indices: number[],
  axis: 'horizontal' | 'vertical'
): FreeSpaceCardLayout[] {
  if (indices.length < 3) return layouts;
  const pos = axis === 'horizontal' ? 'x' : 'y';
  const size = axis === 'horizontal' ? 'w' : 'h';
  const order = [...indices]
    .filter(i => layouts[i])
    .sort((a, b) => layouts[a][pos] - layouts[b][pos]);
  const first = layouts[order[0]];
  const last = layouts[order[order.length - 1]];
  const span = last[pos] + last[size] - first[pos];
  const total = order.reduce((sum, i) => sum + layouts[i][size], 0);
  const gap = (span - total) / (order.length - 1);
  const next = [...layouts];
  let cursor = first[pos];
  for (const i of order) {
    next[i] = clampLayout({ ...layouts[i], [pos]: Math.round(cursor) });
    cursor += layouts[i][size] + gap;
  }
  return next;
}

/** Indices of cards whose box intersects a rectangle (marquee selection). */
export function cardsInRect(
  layouts: FreeSpaceCardLayout[],
  rect: { left: number; top: number; right: number; bottom: number }
): number[] {
  const out: number[] = [];
  layouts.forEach((l, i) => {
    const a = layoutAabb(l);
    if (a.left < rect.right && a.right > rect.left && a.top < rect.bottom && a.bottom > rect.top) {
      out.push(i);
    }
  });
  return out;
}

/** Normalise degrees into (-180, 180]. */
export function normalizeAngle(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

export function snapAngle(deg: number, step = 15): number {
  return snap(deg, step);
}

/** Angle in degrees from centre to a point (artboard units). */
export function angleFromCentre(
  centreX: number,
  centreY: number,
  pointX: number,
  pointY: number
): number {
  return (Math.atan2(pointY - centreY, pointX - centreX) * 180) / Math.PI;
}

export function cardCentre(layout: FreeSpaceCardLayout): { cx: number; cy: number } {
  return { cx: layout.x + layout.w / 2, cy: layout.y + layout.h / 2 };
}

/**
 * Apply a pointer delta (artboard units) for a move.
 */
export function applyMove(
  origin: FreeSpaceCardLayout,
  dx: number,
  dy: number
): FreeSpaceCardLayout {
  return clampLayout({
    ...origin,
    x: origin.x + dx,
    y: Math.max(0, origin.y + dy),
  });
}

/**
 * Apply a resize from a handle. Rotation is kept; resize is axis-aligned in
 * the card's local box (sufficient for v1; corners stay rectangular).
 */
export function applyResize(
  origin: FreeSpaceCardLayout,
  handle: ResizeHandle,
  dx: number,
  dy: number
): FreeSpaceCardLayout {
  let { x, y, w, h } = origin;

  if (handle.includes('e')) w = origin.w + dx;
  if (handle.includes('w')) {
    w = origin.w - dx;
    x = origin.x + dx;
  }
  if (handle.includes('s')) h = origin.h + dy;
  if (handle.includes('n')) {
    h = origin.h - dy;
    y = origin.y + dy;
  }

  // Prevent flipping through min size: lock the opposite edge.
  if (w < MIN_CARD_W) {
    if (handle.includes('w')) x = origin.x + origin.w - MIN_CARD_W;
    w = MIN_CARD_W;
  }
  if (h < MIN_CARD_H) {
    if (handle.includes('n')) y = origin.y + origin.h - MIN_CARD_H;
    h = MIN_CARD_H;
  }

  return clampLayout({ ...origin, x, y, w, h });
}

/**
 * Apply rotation: startAngle is the pointer angle at pointer-down relative to
 * card centre; currentAngle is the live pointer angle. Shift snaps to 15°.
 */
export function applyRotate(
  origin: FreeSpaceCardLayout,
  startAngle: number,
  currentAngle: number,
  shiftKey: boolean
): FreeSpaceCardLayout {
  let r = origin.r + (currentAngle - startAngle);
  if (shiftKey) r = snapAngle(r, 15);
  return clampLayout({ ...origin, r });
}

/** Axis-aligned bounding box of a (possibly rotated) card for collision / height. */
export function layoutAabb(layout: FreeSpaceCardLayout): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  if (!layout.r) {
    return {
      left: layout.x,
      top: layout.y,
      right: layout.x + layout.w,
      bottom: layout.y + layout.h,
    };
  }
  const { cx, cy } = cardCentre(layout);
  const rad = (layout.r * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const hw = (layout.w * cos + layout.h * sin) / 2;
  const hh = (layout.w * sin + layout.h * cos) / 2;
  return { left: cx - hw, top: cy - hh, right: cx + hw, bottom: cy + hh };
}

function overlaps(
  a: FreeSpaceCardLayout,
  b: FreeSpaceCardLayout,
  gap = 8
): boolean {
  const aa = layoutAabb(a);
  const bb = layoutAabb(b);
  return !(
    aa.right + gap <= bb.left ||
    bb.right + gap <= aa.left ||
    aa.bottom + gap <= bb.top ||
    bb.bottom + gap <= aa.top
  );
}

/**
 * Place a new card at the first free grid slot (row-major).
 */
export function autoPlace(
  existing: FreeSpaceCardLayout[],
  canvasWidth: number,
  w = DEFAULT_CARD_W,
  h = DEFAULT_CARD_H,
  grid = 8
): FreeSpaceCardLayout {
  const stepX = Math.max(grid || 8, w);
  const stepY = Math.max(grid || 8, h);
  const maxCols = Math.max(1, Math.floor((canvasWidth - w) / stepX) + 1);
  const z = existing.length ? Math.max(...existing.map(l => l.z)) + 1 : 0;

  for (let row = 0; row < 200; row++) {
    for (let col = 0; col < maxCols; col++) {
      const candidate = clampLayout({
        x: col * stepX,
        y: row * stepY,
        w,
        h,
        r: 0,
        z,
      });
      if (!existing.some(e => overlaps(candidate, e))) {
        return grid > 0 ? snapLayout(candidate, grid) : candidate;
      }
    }
  }
  // Fallback: below everything
  const bottom = existing.reduce((m, l) => Math.max(m, layoutAabb(l).bottom), 0);
  return clampLayout({ x: 0, y: bottom + 16, w, h, r: 0, z });
}

/** Reading order for narrow stacked mode: y then x. */
export function stackOrder(layouts: FreeSpaceCardLayout[]): number[] {
  return layouts
    .map((l, i) => ({ i, y: l.y, x: l.x }))
    .sort((a, b) => a.y - b.y || a.x - b.x || a.i - b.i)
    .map(e => e.i);
}

/** Alignment guide candidates: edges and centres of other cards. */
export function alignmentGuides(
  layouts: FreeSpaceCardLayout[],
  excludeIndex: number
): { vertical: number[]; horizontal: number[] } {
  const vertical: number[] = [];
  const horizontal: number[] = [];
  layouts.forEach((l, i) => {
    if (i === excludeIndex) return;
    const box = layoutAabb(l);
    vertical.push(box.left, (box.left + box.right) / 2, box.right);
    horizontal.push(box.top, (box.top + box.bottom) / 2, box.bottom);
  });
  return { vertical, horizontal };
}

const GUIDE_THRESHOLD = 6;

/**
 * Nudge a layout toward nearby alignment guides. Returns the nudged layout
 * and which guide lines are active (for drawing).
 */
export function snapToGuides(
  layout: FreeSpaceCardLayout,
  guides: { vertical: number[]; horizontal: number[] },
  threshold = GUIDE_THRESHOLD
): { layout: FreeSpaceCardLayout; activeV: number[]; activeH: number[] } {
  const box = layoutAabb(layout);
  const edgesV = [box.left, (box.left + box.right) / 2, box.right];
  const edgesH = [box.top, (box.top + box.bottom) / 2, box.bottom];
  let dx = 0;
  let dy = 0;
  const activeV: number[] = [];
  const activeH: number[] = [];

  let bestV = threshold + 1;
  for (const g of guides.vertical) {
    for (const e of edgesV) {
      const d = g - e;
      if (Math.abs(d) < bestV) {
        bestV = Math.abs(d);
        dx = d;
        activeV.length = 0;
        activeV.push(g);
      } else if (Math.abs(d) === bestV && Math.abs(d) <= threshold) {
        activeV.push(g);
      }
    }
  }
  if (bestV > threshold) {
    dx = 0;
    activeV.length = 0;
  }

  let bestH = threshold + 1;
  for (const g of guides.horizontal) {
    for (const e of edgesH) {
      const d = g - e;
      if (Math.abs(d) < bestH) {
        bestH = Math.abs(d);
        dy = d;
        activeH.length = 0;
        activeH.push(g);
      } else if (Math.abs(d) === bestH && Math.abs(d) <= threshold) {
        activeH.push(g);
      }
    }
  }
  if (bestH > threshold) {
    dy = 0;
    activeH.length = 0;
  }

  return {
    layout: clampLayout({ ...layout, x: layout.x + dx, y: layout.y + dy }),
    activeV,
    activeH,
  };
}
