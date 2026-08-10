import type { UltraCardConfig } from '../types';

/**
 * Whether a card's content was authored by the user rather than downloaded.
 *
 * Phrased as an allowlist so an origin added later is treated as untrusted until
 * someone decides otherwise, rather than silently inheriting local trust. This
 * mirrors navigationJsTemplatesAllowedForConfig.
 *
 * `undefined` means the config predates origin tracking, so it was authored
 * locally by definition.
 */
export function isLocallyAuthoredConfig(config?: UltraCardConfig): boolean {
  const origin = config?._contentOrigin;
  return origin === undefined || origin === 'local';
}
