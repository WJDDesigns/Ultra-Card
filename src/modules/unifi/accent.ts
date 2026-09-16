/**
 * Accent resolution for UniFi views.
 *
 * `--uc-unifi-accent` is the CSS token (HA primary unless the user overrides it).
 * A module/device `accent_color` is an explicit override: rings always follow it,
 * and gigabit+ / unknown-speed highlights pick it up so the editor's
 * "rings, highlights, and flow accents" control actually paints.
 */

import type { UnifiModule } from '../../types';
import { linkSpeedColor } from '../../services/uc-unifi-service';

export const UNIFI_ACCENT_VAR = 'var(--uc-unifi-accent)';

export type UnifiAccentSource = Pick<UnifiModule, 'accent_color' | 'device_overrides'>;

/** Explicit user/device colour, or undefined when the CSS token should apply. */
export function unifiAccentOverride(module: UnifiAccentSource, deviceId?: string): string | undefined {
  if (deviceId) {
    const over = module.device_overrides?.find(o => o.device_id === deviceId)?.accent_color;
    if (over) return over;
  }
  return module.accent_color || undefined;
}

/** Decorative paint: per-device override, then module accent, then the CSS token. */
export function unifiAccent(module: UnifiAccentSource, deviceId?: string): string {
  return unifiAccentOverride(module, deviceId) || UNIFI_ACCENT_VAR;
}

/**
 * Port / edge fill. Sub-gigabit keeps the UniFi speed palette (100M yellow).
 * Gigabit+ and unknown speed use a user accent when one is set.
 */
export function unifiLinkPaint(
  speedMbps: number | null | undefined,
  accent?: string,
  unknownColor?: string
): string {
  const noSpeed = speedMbps === null || speedMbps === undefined || speedMbps <= 0;
  if (noSpeed) return accent || unknownColor || linkSpeedColor(speedMbps);
  if (accent && speedMbps >= 1000) return accent;
  return linkSpeedColor(speedMbps);
}
