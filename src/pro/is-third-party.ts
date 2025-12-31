// Ultra Card - Third-party module identification
// Treat any module type not in FIRST_PARTY_TYPES as third-party.

export const FIRST_PARTY_TYPES: Set<string> = new Set([
  'text',
  'separator',
  'image',
  'info',
  'bar',
  'gauge',
  'icon',
  'button',
  'spinbox',
  'markdown',
  'horizontal',
  'vertical',
  'slider',
  'pagebreak',
  'camera',
  'graphs',
  'dropdown',
  'light',
  'animated_clock',
  'animated_weather',
  'animated_forecast',
  // Do NOT include 'external_card' here; it is considered third-party
]);

// Only treat true 3rd-party embeds as third-party: the external card module.
// Pro-only first-party modules (e.g., animated_*) must NOT be counted here.
export function isThirdParty(moduleType: string | undefined | null): boolean {
  return moduleType === 'external_card';
}
