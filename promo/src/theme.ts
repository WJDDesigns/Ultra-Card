export const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';

export const COLORS = {
  black: '#000000',
  white: '#ffffff',
  secondary: 'rgba(255,255,255,0.55)',
  kicker: 'rgba(255,255,255,0.82)',
  cyan: '#22d3ee',
  violet: '#a21caf',
};

export const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);
