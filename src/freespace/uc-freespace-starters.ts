/**
 * Starter layouts offered on an empty FreeSpace view. Each slot picks a
 * matching entity from the user's Home Assistant when one exists, otherwise
 * it becomes a Markdown placeholder that says what to put there.
 */

import type { FreeSpaceCardLayout, FreeSpaceFit } from './types';
import type { FreeSpaceBreakpoint } from './uc-freespace-breakpoints';
import { serializeViewLayoutStore } from './uc-freespace-config';

export type StarterId = 'wall' | 'phone' | 'desktop';

type SlotKind = 'clock' | 'weather' | 'camera' | 'climate' | 'light' | 'media' | 'sensor';

type Box = [x: number, y: number, w: number, h: number];

interface StarterSlot {
  kind: SlotKind;
  desktop: Box;
  phone?: Box;
}

interface StarterDef {
  id: StarterId;
  fit?: FreeSpaceFit;
  slots: StarterSlot[];
}

const STARTERS: Record<StarterId, StarterDef> = {
  wall: {
    id: 'wall',
    fit: 'screen',
    slots: [
      { kind: 'clock', desktop: [16, 16, 760, 168] },
      { kind: 'weather', desktop: [792, 16, 392, 168] },
      { kind: 'light', desktop: [16, 200, 280, 96] },
      { kind: 'light', desktop: [312, 200, 280, 96] },
      { kind: 'light', desktop: [608, 200, 280, 96] },
      { kind: 'light', desktop: [904, 200, 280, 96] },
      { kind: 'camera', desktop: [16, 312, 576, 328] },
      { kind: 'climate', desktop: [608, 312, 576, 328] },
    ],
  },
  phone: {
    id: 'phone',
    slots: [
      { kind: 'clock', desktop: [16, 16, 568, 136], phone: [16, 16, 358, 120] },
      { kind: 'weather', desktop: [600, 16, 584, 136], phone: [16, 152, 358, 136] },
      { kind: 'light', desktop: [16, 168, 280, 96], phone: [16, 304, 171, 96] },
      { kind: 'light', desktop: [312, 168, 280, 96], phone: [203, 304, 171, 96] },
      { kind: 'light', desktop: [608, 168, 280, 96], phone: [16, 416, 171, 96] },
      { kind: 'light', desktop: [904, 168, 280, 96], phone: [203, 416, 171, 96] },
      { kind: 'media', desktop: [16, 280, 584, 200], phone: [16, 528, 358, 200] },
      { kind: 'climate', desktop: [616, 280, 568, 320], phone: [16, 744, 358, 320] },
    ],
  },
  desktop: {
    id: 'desktop',
    slots: [
      { kind: 'clock', desktop: [16, 16, 376, 160] },
      { kind: 'weather', desktop: [408, 16, 376, 160] },
      { kind: 'sensor', desktop: [800, 16, 384, 160] },
      { kind: 'camera', desktop: [16, 192, 768, 432] },
      { kind: 'light', desktop: [800, 192, 384, 96] },
      { kind: 'light', desktop: [800, 304, 384, 96] },
      { kind: 'light', desktop: [800, 416, 384, 96] },
      { kind: 'light', desktop: [800, 528, 384, 96] },
      { kind: 'climate', desktop: [16, 640, 568, 320] },
      { kind: 'media', desktop: [600, 640, 584, 320] },
    ],
  },
};

export const STARTER_IDS: readonly StarterId[] = ['wall', 'phone', 'desktop'];

const DOMAIN: Record<Exclude<SlotKind, 'clock'>, string> = {
  weather: 'weather',
  camera: 'camera',
  climate: 'climate',
  light: 'light',
  media: 'media_player',
  sensor: 'sensor',
};

const PLACEHOLDER: Record<SlotKind, string> = {
  clock: '',
  weather: 'Weather',
  camera: 'Camera',
  climate: 'Thermostat',
  light: 'Light',
  media: 'Media player',
  sensor: 'Sensor',
};

function placeholder(kind: SlotKind): Record<string, unknown> {
  return {
    type: 'markdown',
    content: `### ${PLACEHOLDER[kind]}\nEdit this card to choose what it shows.`,
  };
}

function cardFor(kind: SlotKind, entity: string | undefined): Record<string, unknown> {
  if (kind === 'clock') {
    return {
      type: 'markdown',
      content: "# {{ now().strftime('%H:%M') }}\n{{ now().strftime('%A %d %B') }}",
    };
  }
  if (!entity) return placeholder(kind);
  switch (kind) {
    case 'weather':
      return { type: 'weather-forecast', entity, forecast_type: 'daily' };
    case 'camera':
      return { type: 'picture-entity', entity, camera_view: 'auto', show_state: false };
    case 'climate':
      return { type: 'thermostat', entity };
    case 'media':
      return { type: 'media-control', entity };
    default:
      return { type: 'tile', entity };
  }
}

function layoutOf([x, y, w, h]: Box, z: number): FreeSpaceCardLayout {
  return { x, y, w, h, r: 0, z };
}

/**
 * Cards (with `view_layout`) and view options for a starter. `states` is
 * `hass.states`; entities are used in order, each at most once.
 */
export function buildStarter(
  id: StarterId,
  states: Record<string, unknown> | undefined
): { cards: Record<string, unknown>[]; fit?: FreeSpaceFit } {
  const def = STARTERS[id];
  const ids = Object.keys(states ?? {}).sort();
  const used = new Set<string>();
  const take = (kind: SlotKind): string | undefined => {
    if (kind === 'clock') return undefined;
    const prefix = `${DOMAIN[kind]}.`;
    const found = ids.find(e => e.startsWith(prefix) && !used.has(e));
    if (found) used.add(found);
    return found;
  };
  const cards = def.slots.map((slot, z) => {
    const store: Partial<Record<FreeSpaceBreakpoint, FreeSpaceCardLayout>> = {
      desktop: layoutOf(slot.desktop, z),
    };
    if (slot.phone) store.phone = layoutOf(slot.phone, z);
    return { ...cardFor(slot.kind, take(slot.kind)), view_layout: serializeViewLayoutStore(store) };
  });
  return def.fit ? { cards, fit: def.fit } : { cards };
}
