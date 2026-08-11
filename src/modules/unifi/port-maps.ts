/**
 * Physical port positions within Ubiquiti "nopadding" front-panel photos,
 * measured from the actual catalog images (fractions of image width/height).
 * Lets the card overlay live link/activity/PoE lights on the real ports —
 * Etherlighting style — instead of a generic LED strip.
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

/** Column of RJ45 cells: odd index top row, even index bottom (UniFi layout). */
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
 * Keyed by catalog `sku` (from uc-unifi-device-db). Coordinates measured by
 * scanning the actual product images for the dark port openings.
 */
const PORT_MAPS: Record<string, PortMap> = {
  // 828x110 — 8 RJ45 in 2 rows of 4, WAN RJ45, 2 stacked SFP+ (ports 10/11)
  'UDM-SE': {
    cells: [
      ...twoRowColumns(1, [0.7145, 0.7505, 0.7861, 0.8213], 0.032, 0.42, 0.19, 0.63, 0.19),
      { index: 9, cx: 0.892, y: 0.6, w: 0.026, h: 0.22, kind: 'rj45' },
      { index: 10, cx: 0.9335, y: 0.405, w: 0.034, h: 0.17, kind: 'sfp' },
      { index: 11, cx: 0.9335, y: 0.67, w: 0.034, h: 0.17, kind: 'sfp' },
    ],
  },

  // 828x121 — 24 RJ45 in one row (3 groups of 8), 4 SFP+ in a 2x2 block (25-28)
  'USW-Pro-HD-24-PoE': {
    cells: [
      ...singleRow(1, spread(0.1002, 0.3261, 8), 0.029, 0.42, 0.42),
      ...singleRow(9, spread(0.3647, 0.5906, 8), 0.029, 0.42, 0.42),
      ...singleRow(17, spread(0.6292, 0.8551, 8), 0.029, 0.42, 0.42),
      { index: 25, cx: 0.8961, y: 0.45, w: 0.033, h: 0.18, kind: 'sfp' },
      { index: 26, cx: 0.8961, y: 0.665, w: 0.033, h: 0.18, kind: 'sfp' },
      { index: 27, cx: 0.933, y: 0.45, w: 0.033, h: 0.18, kind: 'sfp' },
      { index: 28, cx: 0.933, y: 0.665, w: 0.033, h: 0.18, kind: 'sfp' },
    ],
  },

  // 828x184 — 8 RJ45 in one row, 2 SFP+ (ports 9/10)
  'USW-Enterprise-8-PoE': {
    cells: [
      ...singleRow(1, spread(0.2772, 0.6836, 8), 0.033, 0.44, 0.23),
      { index: 9, cx: 0.7899, y: 0.52, w: 0.056, h: 0.19, kind: 'sfp' },
      { index: 10, cx: 0.8623, y: 0.52, w: 0.056, h: 0.19, kind: 'sfp' },
    ],
  },
};

export function portMapForSku(sku: string | null | undefined): PortMap | null {
  if (!sku) return null;
  return PORT_MAPS[sku] || null;
}
