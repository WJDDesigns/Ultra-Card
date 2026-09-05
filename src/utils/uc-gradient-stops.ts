/**
 * Gradient stop data helpers shared by the bar preview and the gradient editor.
 * Kept free of any component import so the runtime bundle does not pull in the
 * editor element just to build a default gradient.
 */
export interface GradientStop {
  id: string;
  position: number;
  color: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Smart color interpolation between two colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  return rgbToHex(r, g, b);
}

// Generate gradient CSS string from stops
export function generateGradientString(stops: GradientStop[]): string {
  if (!stops || stops.length === 0) return '';

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  return sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
}

// Create default gradient stops (red to yellow to green)
export function createDefaultGradientStops(): GradientStop[] {
  return [
    { id: '1', position: 0, color: '#ff0000' }, // Red at 0%
    { id: '2', position: 50, color: '#ffff00' }, // Yellow at 50%
    { id: '3', position: 100, color: '#00ff00' }, // Green at 100%
  ];
}

let stopIdCounter = 4; // Start from 4 since 1, 2, 3 are defaults

/** Called when the editor resets to the default stops so new ids start over. */
export function resetGradientStopIds(): void {
  stopIdCounter = 4;
}

export function createStopAtLargestGap(stops: GradientStop[]): GradientStop {
  if (!stops || stops.length < 2) {
    return { id: `stop-${stopIdCounter++}`, position: 50, color: '#808080' };
  }

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  let largestGap = 0;
  let insertPosition = 50;
  let insertColor = '#808080';

  for (let i = 0; i < sortedStops.length - 1; i++) {
    const gap = sortedStops[i + 1].position - sortedStops[i].position;
    if (gap > largestGap) {
      largestGap = gap;
      insertPosition = sortedStops[i].position + gap / 2;
      insertColor = interpolateColor(sortedStops[i].color, sortedStops[i + 1].color, 0.5);
    }
  }

  return {
    id: `stop-${stopIdCounter++}`,
    position: Math.round(insertPosition),
    color: insertColor,
  };
}
