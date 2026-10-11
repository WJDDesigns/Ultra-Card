/**
 * Pure helpers for FreeSpace view / card config shapes (incl. breakpoints).
 */

import {
  ARTBOARD_PADDING,
  DEFAULT_CARD_H,
  DEFAULT_CARD_W,
  DEFAULT_FREESPACE_OPTIONS,
  FREESPACE_LAYOUT_FLAGS,
  FREESPACE_PINS,
  type FreeSpaceBackground,
  type FreeSpaceBackgroundSize,
  type FreeSpaceCardLayout,
  type FreeSpacePin,
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
import {
  applyFit,
  autoPlace,
  clampLayout,
  fitLayoutsToWidth,
  snapLayout,
  visibleLayouts,
} from './uc-freespace-geometry';

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

const BACKGROUND_SIZES: readonly FreeSpaceBackgroundSize[] = [
  'fit_width',
  'cover',
  'contain',
  'stretch',
  'repeat',
  'original',
];

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/** Sanitise `freespace.background`. Returns undefined when nothing would be drawn. */
export function normalizeBackground(input: unknown): FreeSpaceBackground | undefined {
  if (!isRecord(input)) return undefined;
  const image = str(input.image);
  const color = str(input.color);
  const images: FreeSpaceBackground['images'] = {};
  if (isRecord(input.images)) {
    for (const bp of ['laptop', 'tablet', 'phone'] as const) {
      const v = str(input.images[bp]);
      if (v) images[bp] = v;
    }
  }
  if (!image && !color && !Object.keys(images).length) return undefined;
  const size = (BACKGROUND_SIZES as readonly unknown[]).includes(input.size)
    ? (input.size as FreeSpaceBackgroundSize)
    : 'fit_width';
  const out: FreeSpaceBackground = {
    size,
    position: str(input.position) ?? 'top center',
    opacity: Math.min(100, Math.max(0, Math.round(num(input.opacity, 100)))),
  };
  if (image) out.image = image;
  if (color) out.color = color;
  if (Object.keys(images).length) out.images = images;
  return out;
}

/** Image for a breakpoint: its own override, else the shared image. */
export function backgroundImageFor(
  bg: FreeSpaceBackground | undefined,
  bp: FreeSpaceBreakpoint
): string | undefined {
  if (!bg) return undefined;
  return (bp !== 'desktop' ? bg.images?.[bp] : undefined) ?? bg.image;
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
  if (raw.fit === 'screen') out.fit = 'screen';
  const background = normalizeBackground(raw.background);
  if (background) out.background = background;
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
  const layout: FreeSpaceCardLayout = {
    x: Number(input.x),
    y: Number(input.y),
    w: Number(input.w),
    h: Number(input.h),
    r,
    z,
  };
  if ((FREESPACE_PINS as readonly unknown[]).includes(input.pin)) {
    layout.pin = input.pin as FreeSpacePin;
    layout.ref_w = num(input.ref_w, NaN);
  }
  for (const flag of FREESPACE_LAYOUT_FLAGS) {
    if (input[flag] === true) layout[flag] = true;
  }
  if (typeof input.group === 'string' && input.group) layout.group = input.group;
  return clampLayout(layout);
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
 * A pin's `ref_w` belongs to the breakpoint it was set on. When another
 * breakpoint borrows the layout, measure the pin from that breakpoint's canvas
 * instead, so a Desktop pin does not stretch or shift by the full
 * Desktop-to-Tablet width difference.
 */
export function rebasePin(layout: FreeSpaceCardLayout, canvasWidth: number): FreeSpaceCardLayout {
  if (!layout.pin || layout.pin === 'left' || !(canvasWidth > 0)) return layout;
  return { ...layout, ref_w: Math.round(canvasWidth) };
}

/** Layout for a card at `bp`; borrowed (fallback) layouts get their pins re-based. */
export function readCardLayoutAt(
  cardConfig: unknown,
  bp: FreeSpaceBreakpoint,
  canvasWidth: number
): FreeSpaceCardLayout | null {
  if (!isRecord(cardConfig)) return null;
  const resolved = resolveLayoutForBreakpoint(parseViewLayoutStore(cardConfig.view_layout), bp);
  if (!resolved) return null;
  return resolved.from === bp ? resolved.layout : rebasePin(resolved.layout, canvasWidth);
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
    const fromConfig = fromExisting ?? readCardLayoutAt(cards[i], bp, canvas);
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
  const toCanvas = effectiveCanvasWidth(readFreeSpaceOptions(view), to);
  for (let i = 0; i < cards.length; i++) {
    const card = isRecord(cards[i]) ? { ...cards[i] } : {};
    const store = parseViewLayoutStore(card.view_layout);
    if (!force && store[to]) continue;
    const resolved = resolveLayoutForBreakpoint(store, from);
    if (!resolved) continue;
    store[to] = rebasePin(resolved.layout, toCanvas);
    card.view_layout = serializeViewLayoutStore(store);
    cards[i] = card;
  }
  view.cards = cards;
  views[viewIndex] = view;
  return { ...config, views };
}

/**
 * Every card's Desktop layout shrunk and centred to `bp`'s canvas width, in
 * `bp` canvas coordinates (what "Use Desktop" shows for that breakpoint).
 */
export function fittedDesktopLayouts(viewConfig: unknown, bp: FreeSpaceBreakpoint): FreeSpaceCardLayout[] {
  const view = isRecord(viewConfig) ? viewConfig : {};
  const cards = Array.isArray(view.cards) ? view.cards : [];
  const options = readFreeSpaceOptions(view);
  const width = effectiveCanvasWidth(options, bp);
  const desktop = assignDefaultLayouts(cards, options, undefined, 'desktop');
  const fit = fitLayoutsToWidth(visibleLayouts(desktop), width);
  return desktop.map(l => applyFit(l, fit, width));
}

/**
 * Give `to` its own layout for every card that lacks one, taken from Desktop
 * shrunk and centred to `to`'s canvas width: the same picture "Use Desktop"
 * shows, so switching to Custom does not move anything.
 */
export function copyDesktopLayoutsFitted(
  config: any,
  viewIndex: number,
  to: FreeSpaceBreakpoint
): any {
  if (to === 'desktop' || !isFreeSpaceBreakpoint(to)) return config;
  const views = Array.isArray(config?.views) ? [...config.views] : [];
  const view = isRecord(views[viewIndex]) ? { ...views[viewIndex] } : {};
  const cards = Array.isArray(view.cards) ? [...view.cards] : [];
  const fitted = fittedDesktopLayouts(view, to);
  for (let i = 0; i < cards.length; i++) {
    const card = isRecord(cards[i]) ? { ...cards[i] } : {};
    const store = parseViewLayoutStore(card.view_layout);
    if (store[to]) continue;
    store[to] = fitted[i]!;
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
 * A breakpoint is Custom when any card stores its own layout for it; otherwise
 * it uses the Desktop layout. Desktop is always its own layout.
 */
export function isBreakpointCustom(cards: unknown[], bp: FreeSpaceBreakpoint): boolean {
  if (bp === 'desktop') return true;
  return cards.some(
    card => isRecord(card) && hasExplicitBreakpointLayout(parseViewLayoutStore(card.view_layout), bp)
  );
}

/** Remove every card's layout for `bp` so the breakpoint uses Desktop again. */
export function clearBreakpointLayouts(
  config: any,
  viewIndex: number,
  bp: FreeSpaceBreakpoint
): any {
  if (bp === 'desktop') return config;
  const views = Array.isArray(config?.views) ? [...config.views] : [];
  const view = isRecord(views[viewIndex]) ? { ...views[viewIndex] } : {};
  const cards = Array.isArray(view.cards) ? [...view.cards] : [];
  for (let i = 0; i < cards.length; i++) {
    if (!isRecord(cards[i])) continue;
    const store = parseViewLayoutStore(cards[i].view_layout);
    if (!store[bp]) continue;
    delete store[bp];
    cards[i] = { ...cards[i], view_layout: serializeViewLayoutStore(store) };
  }
  view.cards = cards;
  views[viewIndex] = view;
  return { ...config, views };
}

/** Remove cards (by index) from a view in one config change. */
export function removeCards(config: any, viewIndex: number, indices: number[]): any {
  const drop = new Set(indices);
  const views = Array.isArray(config?.views) ? [...config.views] : [];
  const view = isRecord(views[viewIndex]) ? { ...views[viewIndex] } : {};
  const cards = Array.isArray(view.cards) ? view.cards : [];
  view.cards = cards.filter((_: unknown, i: number) => !drop.has(i));
  views[viewIndex] = view;
  return { ...config, views };
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

/** Indices of every card in the same group as `index` (just `index` when ungrouped). */
export function groupMembers(layouts: FreeSpaceCardLayout[], index: number): number[] {
  const group = layouts[index]?.group;
  if (!group) return [index];
  const members = layouts.flatMap((l, i) => (l.group === group && i !== index ? [i] : []));
  // The clicked card goes last so it is the primary selection.
  return [...members, index];
}

/** Expand a selection so whole groups are included. */
export function expandToGroups(layouts: FreeSpaceCardLayout[], indices: number[]): number[] {
  const out = new Set<number>();
  for (const i of indices) for (const m of groupMembers(layouts, i)) out.add(m);
  // Keep the original primary (last index) last.
  const primary = indices[indices.length - 1];
  if (primary !== undefined && out.has(primary)) {
    out.delete(primary);
    return [...out, primary];
  }
  return [...out];
}

/** Put the cards at `indices` into one new group (or ungroup them with `null`). */
export function setGroup(
  layouts: FreeSpaceCardLayout[],
  indices: number[],
  group: string | null
): FreeSpaceCardLayout[] {
  const sel = new Set(indices);
  return layouts.map((l, i) => {
    if (!sel.has(i)) return l;
    const { group: _g, ...rest } = l;
    return group ? { ...rest, group } : rest;
  });
}

/** Set or clear a boolean flag on the cards at `indices`. */
export function setFlag(
  layouts: FreeSpaceCardLayout[],
  indices: number[],
  flag: (typeof FREESPACE_LAYOUT_FLAGS)[number],
  on: boolean
): FreeSpaceCardLayout[] {
  const sel = new Set(indices);
  return layouts.map((l, i) => {
    if (!sel.has(i)) return l;
    const next = { ...l };
    if (on) next[flag] = true;
    else delete next[flag];
    return next;
  });
}

/** A short group id that is not used by any card yet. */
export function newGroupId(layouts: FreeSpaceCardLayout[]): string {
  const used = new Set(layouts.map(l => l.group).filter(Boolean));
  let n = 1;
  while (used.has(`g${n}`)) n++;
  return `g${n}`;
}
