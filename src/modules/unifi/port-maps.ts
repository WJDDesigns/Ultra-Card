/**
 * Physical port positions within Ubiquiti "nopadding" front-panel photos.
 *
 * Coordinates are fractions of the image and describe the **port opening**
 * itself — the dark jack mouth (or the coloured plastic insert on Etherlighting
 * hardware). The card paints its own light into that rectangle, so it must
 * cover the opening exactly: too small and the photo's factory colour shows
 * around the edge, too large and the light bleeds onto the chassis.
 *
 * Measured by scanning each product photo for the openings (see
 * `docs/modules/unifi.md` → "Port maps") and verified against the silkscreen
 * port numbers so indices match what Home Assistant reports.
 */

export interface PortCell {
  /** HA port index this cell represents */
  index: number;
  /** Center X as a fraction of image width */
  cx: number;
  /** Top edge as a fraction of image height */
  y: number;
  /** Width / height as fractions of the image */
  w: number;
  h: number;
  kind: 'rj45' | 'sfp';
}

export interface PortMap {
  cells: PortCell[];
}

/**
 * Column of RJ45 cells: odd index top row, even index bottom — the numbering
 * UniFi silkscreens on stacked-row gear (UDM/UDM-SE: 1,3,5,7 over 2,4,6,8).
 */
function twoRowColumns(
  startIndex: number,
  centers: number[],
  w: number,
  topY: number,
  topH: number,
  bottomY: number,
  bottomH: number
): PortCell[] {
  const cells: PortCell[] = [];
  centers.forEach((cx, col) => {
    cells.push({ index: startIndex + col * 2, cx, y: topY, w, h: topH, kind: 'rj45' });
    cells.push({ index: startIndex + col * 2 + 1, cx, y: bottomY, w, h: bottomH, kind: 'rj45' });
  });
  return cells;
}

function singleRow(
  startIndex: number,
  centers: number[],
  w: number,
  y: number,
  h: number,
  kind: 'rj45' | 'sfp' = 'rj45'
): PortCell[] {
  return centers.map((cx, i) => ({ index: startIndex + i, cx, y, w, h, kind }));
}

/** Evenly spaced centers from first to last (inclusive). */
function spread(first: number, last: number, count: number): number[] {
  if (count === 1) return [first];
  const step = (last - first) / (count - 1);
  return Array.from({ length: count }, (_, i) => first + i * step);
}

/**
 * Keyed by catalog `sku` (from uc-unifi-device-db).
 */
const PORT_MAPS: Record<string, PortMap> = {
  // 828x110 — LAN 1-8 in two rows of four (odd top), WAN 9, SFP+ 10/11 stacked
  'UDM-SE': {
    cells: [
      ...twoRowColumns(1, spread(0.7144, 0.8219, 4), 0.0278, 0.409, 0.19, 0.6455, 0.2),
      { index: 9, cx: 0.8919, y: 0.6182, w: 0.0278, h: 0.191, kind: 'rj45' },
      { index: 10, cx: 0.9342, y: 0.4182, w: 0.0326, h: 0.1455, kind: 'sfp' },
      { index: 11, cx: 0.9336, y: 0.6727, w: 0.0314, h: 0.1545, kind: 'sfp' },
    ],
  },

  // 828x110 — same port arrangement as the SE, slightly different chassis
  'UDM-Pro': {
    cells: [
      ...twoRowColumns(1, spread(0.7144, 0.8213, 4), 0.0278, 0.4182, 0.1727, 0.6636, 0.1818),
      { index: 9, cx: 0.8919, y: 0.6273, w: 0.0278, h: 0.1727, kind: 'rj45' },
      { index: 10, cx: 0.9336, y: 0.4182, w: 0.0314, h: 0.1, kind: 'sfp' },
      { index: 11, cx: 0.9342, y: 0.7345, w: 0.0302, h: 0.1, kind: 'sfp' },
    ],
  },

  // 828x121 — 24 RJ45 in three groups of eight, 4 SFP+ in a 2x2 block
  // (silkscreen: 25/27 top, 26/28 bottom)
  'USW-Pro-HD-24-PoE': {
    cells: [
      ...singleRow(1, spread(0.1008, 0.3267, 8), 0.029, 0.6446, 0.1653),
      ...singleRow(9, spread(0.3653, 0.5912, 8), 0.0278, 0.6446, 0.1653),
      ...singleRow(17, spread(0.6304, 0.8557, 8), 0.029, 0.6446, 0.157),
      { index: 25, cx: 0.8967, y: 0.4628, w: 0.0326, h: 0.157, kind: 'sfp' },
      { index: 26, cx: 0.8967, y: 0.7025, w: 0.0326, h: 0.1322, kind: 'sfp' },
      { index: 27, cx: 0.9336, y: 0.4628, w: 0.0326, h: 0.157, kind: 'sfp' },
      { index: 28, cx: 0.9336, y: 0.7025, w: 0.0326, h: 0.1322, kind: 'sfp' },
    ],
  },

  // 828x184 — 8 RJ45 in one row, 2 SFP+ (9/10). Cells reach slightly above the
  // jack so they also cover the factory link LED baked into the photo.
  'USW-Enterprise-8-PoE': {
    cells: [
      ...singleRow(1, spread(0.2772, 0.6842, 8), 0.0487, 0.4402, 0.212),
      ...singleRow(9, spread(0.7911, 0.8629, 2), 0.0544, 0.5272, 0.1467, 'sfp'),
    ],
  },

  // 828x102 — 24 RJ45 in two rows of twelve on the right half, 2 SFP (25/26)
  'USW-24-PoE': {
    cells: [
      ...twoRowColumns(1, spread(0.4976, 0.8502, 12), 0.0278, 0.3824, 0.1765, 0.6373, 0.1863),
      { index: 25, cx: 0.9342, y: 0.3725, w: 0.0326, h: 0.12, kind: 'sfp' },
      { index: 26, cx: 0.9336, y: 0.6667, w: 0.0314, h: 0.12, kind: 'sfp' },
    ],
  },

  // 828x102 — 16 RJ45 in two rows of eight, 2 SFP (17/18)
  'USW-16-PoE': {
    cells: [
      ...twoRowColumns(1, spread(0.6027, 0.8508, 8), 0.0278, 0.3627, 0.1961, 0.6373, 0.1961),
      { index: 17, cx: 0.9342, y: 0.3725, w: 0.0326, h: 0.12, kind: 'sfp' },
      { index: 18, cx: 0.9336, y: 0.6667, w: 0.0314, h: 0.12, kind: 'sfp' },
    ],
  },

  // 828x117 — 24 RJ45 in two rows of twelve, 2 SFP+ (25/26)
  'USW-Pro-24-PoE': {
    cells: [
      ...twoRowColumns(1, spread(0.4976, 0.8499, 12), 0.029, 0.453, 0.1624, 0.6752, 0.1709),
      { index: 25, cx: 0.9342, y: 0.453, w: 0.0326, h: 0.1538, kind: 'sfp' },
      { index: 26, cx: 0.9342, y: 0.6838, w: 0.0326, h: 0.1624, kind: 'sfp' },
    ],
  },

  // 828x120 — 48 RJ45 in two rows of 24, 4 SFP+ in a 2x2 block (49-52)
  'USW-Pro-Max-48-PoE': {
    cells: [
      ...twoRowColumns(1, spread(0.1039, 0.8463, 24), 0.0284, 0.4583, 0.1667, 0.6833, 0.1667),
      { index: 49, cx: 0.8973, y: 0.4583, w: 0.0314, h: 0.1333, kind: 'sfp' },
      { index: 50, cx: 0.8973, y: 0.6833, w: 0.0314, h: 0.15, kind: 'sfp' },
      { index: 51, cx: 0.9342, y: 0.4583, w: 0.0314, h: 0.1333, kind: 'sfp' },
      { index: 52, cx: 0.9336, y: 0.6833, w: 0.0314, h: 0.15, kind: 'sfp' },
    ],
  },

  // 828x123 — 24 RJ45 in a single row, 2 SFP28 (25/26)
  'USW-Enterprise-24-PoE': {
    cells: [
      ...singleRow(1, spread(0.1027, 0.8557, 24), 0.0278, 0.6585, 0.1463),
      ...singleRow(25, [0.8979, 0.9342], 0.0326, 0.7154, 0.1626, 'sfp'),
    ],
  },

  // 828x232 — 16 RJ45 in two rows of eight (silkscreen 1,3,5… over 2,4,6…)
  'USW-Lite-16-PoE': {
    cells: [
      ...twoRowColumns(1, spread(0.2077, 0.7923, 8), 0.0658, 0.375, 0.181, 0.6336, 0.1853),
    ],
  },

  // 828x97 — 8 SFP+ in a 2x4 block
  'USW-Aggregation': {
    cells: [
      ...twoRowColumns(1, spread(0.8013, 0.9336, 4), 0.0338, 0.3505, 0.1753, 0.6289, 0.1959).map(
        c => ({ ...c, kind: 'sfp' as const })
      ),
    ],
  },
};

export function portMapForSku(sku: string | null | undefined): PortMap | null {
  if (!sku) return null;
  return PORT_MAPS[sku] || null;
}

/** Every SKU with measured port geometry (used by tests and docs). */
export const PORT_MAP_SKUS: readonly string[] = Object.keys(PORT_MAPS);
