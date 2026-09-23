/**
 * Pure helpers for FreeSpace view / card config shapes (incl. breakpoints).
 */

import {
  ARTBOARD_PADDING,
  DEFAULT_CARD_H,
  DEFAULT_CARD_W,
  DEFAULT_FREESPACE_OPTIONS,
  type FreeSpaceCardLayout,
  type FreeSpaceViewOptions,
} from './types';
import {
  BREAKPOINT_FALLBACK,
  BREAKPOINT_SPECS,
  FREESPACE_BREAKPOINTS,
  hasNestedBreakpoints,
  isFlatLayout,
  isFreeSpaceBreakpoint,
  type FreeSpaceBreakpoint,
  type FreeSpaceViewLayoutStore,
} from './uc-freespace-breakpoints';
import { autoPlace, clampLayout, snapLayout } from './uc-freespace-geometry';

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseCanvasWidths(
  raw: unknown
): Partial<Record<FreeSpaceBreakpoint, number>> | undefined {
  if (!isRecord(raw)) return undefined;
  const out: Partial<Record<FreeSpaceBreakpoint, number>> = {};
  let any = false;
  for (const bp of FREESPACE_BREAKPOINTS) {
    if (raw[bp] === undefined || raw[bp] === null || raw[bp] === '') continue;
    const n = Math.round(num(raw[bp], NaN));
    if (!Number.isFinite(n)) continue;
    out[bp] = Math.max(280, n);
    any = true;
  }
  return any ? out : undefined;
}

/** Sanitise view-level `freespace:` options. */
export function normalizeFreeSpaceOptions(input: unknown): FreeSpaceViewOptions {
  const raw = isRecord(input) ? input : {};
  const narrow = raw.narrow === 'scale' ? 'scale' : 'stack';
  const canvas_width = Math.max(
    320,
    Math.round(num(raw.canvas_width, DEFAULT_FREESPACE_OPTIONS.canvas_width))
  );
  const min_height = Math.max(
    200,
    Math.round(num(raw.min_height, DEFAULT_FREESPACE_OPTIONS.min_height))
  );
  const grid = Math.max(0, Math.round(num(raw.grid, DEFAULT_FREESPACE_OPTIONS.grid)));
  const canvas_widths = parseCanvasWidths(raw.canvas_widths);
  const out: FreeSpaceViewOptions = { canvas_width, min_height, grid, narrow };
  if (canvas_widths) {
    out.canvas_widths = canvas_widths;
    // Keep legacy canvas_width aligned with desktop override when present.
    if (canvas_widths.desktop) out.canvas_width = canvas_widths.desktop;
  }
  return out;
}

/** Read FreeSpace options from a view config (missing → defaults). */
export function readFreeSpaceOptions(viewConfig: unknown): FreeSpaceViewOptions {
  if (!isRecord(viewConfig)) return { ...DEFAULT_FREESPACE_OPTIONS };
  return normalizeFreeSpaceOptions(viewConfig.freespace);
}

/** Artboard width for the active breakpoint. */
export function effectiveCanvasWidth(
  options: FreeSpaceViewOptions,
  bp: FreeSpaceBreakpoint
): number {
  const override = options.canvas_widths?.[bp];
  if (typeof override === 'number' && Number.isFinite(override)) {
    return Math.max(280, Math.round(override));
  }
  if (bp === 'desktop') return options.canvas_width;
  return BREAKPOINT_SPECS[bp].canvasWidth;
}

/** True when a layout object has usable x/y/w/h. */
export function hasValidLayout(layout: unknown): layout is FreeSpaceCardLayout {
  if (!isRecord(layout)) return false;
  return (
    Number.isFinite(Number(layout.x)) &&
    Number.isFinite(Number(layout.y)) &&
    Number.isFinite(Number(layout.w)) &&
    Number.isFinite(Number(layout.h))
  );
}

/** Sanitise a flat card layout. Returns null when incomplete. */
export function normalizeCardLayout(input: unknown): FreeSpaceCardLayout | null {
  if (!hasValidLayout(input)) return null;
  const r = num(input.r, 0);
  const z = Math.round(num(input.z, 0));
  return clampLayout({
    x: Number(input.x),
    y: Number(input.y),
    w: Number(input.w),
    h: Number(input.h),
    r,
    z,
  });
}

/**
 * Parse `view_layout` into a breakpoint map.
 * Flat legacy layouts become `{ desktop: … }`.
 */
export function parseViewLayoutStore(input: unknown): FreeSpaceViewLayoutStore {
  if (!isRecord(input)) return {};
  const store: FreeSpaceViewLayoutStore = {};

  if (hasNestedBreakpoints(input)) {
    for (const bp of FREESPACE_BREAKPOINTS) {
      const nest = normalizeCardLayout(input[bp]);
      if (nest) store[bp] = nest;
    }
  }

  // Flat fields at top level (legacy or mixed) → desktop when desktop not nested
  if (isFlatLayout(input) && !store.desktop) {
    const flat = normalizeCardLayout(input);
    if (flat) store.desktop = flat;
  }

  return store;
}

/** Serialize a store back to YAML-friendly view_layout. */
export function serializeViewLayoutStore(store: FreeSpaceViewLayoutStore): Record<string, unknown> {
  const keys = FREESPACE_BREAKPOINTS.filter(bp => store[bp]);
  if (keys.length === 0) return {};
  // Single desktop-only → keep flat shape for readability / backward style
  if (keys.length === 1 && keys[0] === 'desktop' && store.desktop) {
    return { ...store.desktop };
  }
  const out: Record<string, unknown> = {};
  for (const bp of keys) {
    out[bp] = { ...store[bp]! };
  }
  return out;
}

/**
 * Resolve the layout for a breakpoint, walking the fallback chain.
 * Returns null if nothing is stored (caller should auto-place).
 */
export function resolveLayoutForBreakpoint(
  store: FreeSpaceViewLayoutStore,
  bp: FreeSpaceBreakpoint
): { layout: FreeSpaceCardLayout; from: FreeSpaceBreakpoint } | null {
  for (const candidate of BREAKPOINT_FALLBACK[bp]) {
    const layout = store[candidate];
    if (layout) return { layout: { ...layout }, from: candidate };
  }
  return null;
}

/** True when this breakpoint has its own stored layout (not just a fallback). */
export function hasExplicitBreakpointLayout(
  store: FreeSpaceViewLayoutStore,
  bp: FreeSpaceBreakpoint
): boolean {
  return !!store[bp];
}

/**
 * Read layout for a card at a breakpoint (with fallback).
 * Defaults to desktop when `bp` omitted (legacy callers).
 */
export function readCardLayout(
  cardConfig: unknown,
  bp: FreeSpaceBreakpoint = 'desktop'
): FreeSpaceCardLayout | null {
  if (!isRecord(cardConfig)) return null;
  const store = parseViewLayoutStore(cardConfig.view_layout);
  return resolveLayoutForBreakpoint(store, bp)?.layout ?? null;
}

/**
 * Assign default layouts for one breakpoint.
 * Does not mutate; returns a parallel array of layouts (one per card).
 */
export function assignDefaultLayouts(
  cards: unknown[],
  options: FreeSpaceViewOptions,
  existing?: Array<FreeSpaceCardLayout | null>,
  bp: FreeSpaceBreakpoint = 'desktop'
): FreeSpaceCardLayout[] {
  const canvas = effectiveCanvasWidth(options, bp);
  const placed: FreeSpaceCardLayout[] = [];
  for (let i = 0; i < cards.length; i++) {
    const fromExisting = existing?.[i] ?? null;
    const fromConfig = fromExisting ?? readCardLayout(cards[i], bp);
    if (fromConfig) {
      placed.push(fromConfig);
      continue;
    }
    placed.push(autoPlace(placed, canvas, DEFAULT_CARD_W, DEFAULT_CARD_H, options.grid));
  }
  return placed;
}

/** Compute artboard height from layouts and min_height. */
export function computeArtboardHeight(
  layouts: FreeSpaceCardLayout[],
  minHeight: number
): number {
  let bottom = 0;
  for (const l of layouts) {
    bottom = Math.max(bottom, l.y + l.h);
  }
  return Math.max(minHeight, bottom + ARTBOARD_PADDING);
}

/**
 * Deep-ish clone of a Lovelace config with one card's layout updated for a breakpoint.
 */
export function setCardLayout(
  config: any,
  viewIndex: number,
  cardIndex: number,
  layout: FreeSpaceCardLayout,
  grid = 0,
  bp: FreeSpaceBreakpoint = 'desktop'
): any {
  const snapped = grid > 0 ? snapLayout(layout, grid) : clampLayout(layout);
  const views = Array.isArray(config?.views) ? [...config.views] : [];
  const view = isRecord(views[viewIndex]) ? { ...views[viewIndex] } : {};
  const cards = Array.isArray(view.cards) ? [...view.cards] : [];
  const card = isRecord(cards[cardIndex]) ? { ...cards[cardIndex] } : {};
  const store = parseViewLayoutStore(card.view_layout);
  store[bp] = { ...snapped };
  card.view_layout = serializeViewLayoutStore(store);
  cards[cardIndex] = card;
  view.cards = cards;
  views[viewIndex] = view;
  return { ...config, views };
}

/** Apply layouts to every card for one breakpoint. */
export function applyLayoutsToView(
  config: any,
  viewIndex: number,
  layouts: FreeSpaceCardLayout[],
  bp: FreeSpaceBreakpoint = 'desktop'
): any {
  const views = Array.isArray(config?.views) ? [...config.views] : [];
  const view = isRecord(views[viewIndex]) ? { ...views[viewIndex] } : {};
  const cards = Array.isArray(view.cards) ? [...view.cards] : [];
  for (let i = 0; i < cards.length && i < layouts.length; i++) {
    const card = isRecord(cards[i]) ? { ...cards[i] } : {};
    const store = parseViewLayoutStore(card.view_layout);
    store[bp] = { ...layouts[i] };
    card.view_layout = serializeViewLayoutStore(store);
    cards[i] = card;
  }
  view.cards = cards;
  views[viewIndex] = view;
  return { ...config, views };
}

/**
 * Copy layouts from one breakpoint onto another for all cards that lack an
 * explicit layout at the target (or all cards when `force`).
 */
export function copyBreakpointLayouts(
  config: any,
  viewIndex: number,
  from: FreeSpaceBreakpoint,
  to: FreeSpaceBreakpoint,
  force = false
): any {
  if (from === to || !isFreeSpaceBreakpoint(from) || !isFreeSpaceBreakpoint(to)) {
    return config;
  }
  const views = Array.isArray(config?.views) ? [...config.views] : [];
  const view = isRecord(views[viewIndex]) ? { ...views[viewIndex] } : {};
  const cards = Array.isArray(view.cards) ? [...view.cards] : [];
  for (let i = 0; i < cards.length; i++) {
    const card = isRecord(cards[i]) ? { ...cards[i] } : {};
    const store = parseViewLayoutStore(card.view_layout);
    if (!force && store[to]) continue;
    const resolved = resolveLayoutForBreakpoint(store, from);
    if (!resolved) continue;
    store[to] = { ...resolved.layout };
    card.view_layout = serializeViewLayoutStore(store);
    cards[i] = card;
  }
  view.cards = cards;
  views[viewIndex] = view;
  return { ...config, views };
}

/**
 * Flatten sections[].cards into a flat cards[] for FreeSpace import.
 * Removes `sections` and assigns default desktop layouts.
 */
export function flattenSectionsToCards(
  viewConfig: any,
  options?: FreeSpaceViewOptions
): any {
  const opts = options ?? readFreeSpaceOptions(viewConfig);
  const existingCards: any[] = Array.isArray(viewConfig?.cards) ? [...viewConfig.cards] : [];
  const sections = Array.isArray(viewConfig?.sections) ? viewConfig.sections : [];
  for (const section of sections) {
    if (!isRecord(section)) continue;
    const sectionCards = Array.isArray(section.cards) ? section.cards : [];
    for (const c of sectionCards) existingCards.push(c);
  }
  const layouts = assignDefaultLayouts(existingCards, opts, undefined, 'desktop');
  const cards = existingCards.map((c, i) => {
    const card = isRecord(c) ? { ...c } : {};
    card.view_layout = serializeViewLayoutStore({ desktop: layouts[i] });
    return card;
  });
  const next = { ...viewConfig, cards };
  delete next.sections;
  return next;
}

/** Count cards nested inside sections (for the import banner). */
export function countSectionCards(viewConfig: unknown): number {
  if (!isRecord(viewConfig) || !Array.isArray(viewConfig.sections)) return 0;
  let n = 0;
  for (const section of viewConfig.sections) {
    if (isRecord(section) && Array.isArray(section.cards)) n += section.cards.length;
  }
  return n;
}

export type ZOrderAction = 'forward' | 'backward' | 'front' | 'back';

/**
 * Recompute z values for a Z-order action on `cardIndex`.
 * Returns a new layouts array (same length).
 */
export function applyZOrder(
  layouts: FreeSpaceCardLayout[],
  cardIndex: number,
  action: ZOrderAction
): FreeSpaceCardLayout[] {
  if (cardIndex < 0 || cardIndex >= layouts.length) return layouts.map(l => ({ ...l }));
  const next = layouts.map(l => ({ ...l }));
  const zs = next.map(l => l.z);
  const maxZ = Math.max(0, ...zs);
  const minZ = Math.min(0, ...zs);
  const current = next[cardIndex].z;

  switch (action) {
    case 'front':
      next[cardIndex].z = maxZ + 1;
      break;
    case 'back':
      next[cardIndex].z = minZ - 1;
      break;
    case 'forward': {
      const higher = zs.filter(z => z > current).sort((a, b) => a - b);
      next[cardIndex].z = higher.length ? higher[0] + 0.001 : current + 1;
      renormZ(next);
      break;
    }
    case 'backward': {
      const lower = zs.filter(z => z < current).sort((a, b) => b - a);
      next[cardIndex].z = lower.length ? lower[0] - 0.001 : current - 1;
      renormZ(next);
      break;
    }
  }
  return next;
}

function renormZ(layouts: FreeSpaceCardLayout[]): void {
  const order = layouts
    .map((l, i) => ({ i, z: l.z }))
    .sort((a, b) => a.z - b.z || a.i - b.i);
  order.forEach((entry, rank) => {
    layouts[entry.i].z = rank;
  });
}

/** Next z for a newly added card. */
export function nextZ(layouts: FreeSpaceCardLayout[]): number {
  if (!layouts.length) return 0;
  return Math.max(...layouts.map(l => l.z)) + 1;
}

/**
 * Whether phone should use stacked flow: narrow=stack AND no card has an
 * explicit phone layout (so there is nothing phone-specific to show).
 */
export function shouldStackPhone(
  cards: unknown[],
  options: FreeSpaceViewOptions
): boolean {
  if (options.narrow !== 'stack') return false;
  for (const card of cards) {
    if (!isRecord(card)) continue;
    const store = parseViewLayoutStore(card.view_layout);
    if (hasExplicitBreakpointLayout(store, 'phone')) return false;
  }
  return true;
}
