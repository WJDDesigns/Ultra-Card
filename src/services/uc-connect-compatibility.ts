/**
 * Ultra Card Connect version / capability handshake.
 *
 * Reads `integration_version` and `capabilities` from
 * sensor.ultra_card_pro_cloud_authentication_status (added in Connect 1.6.0).
 * Missing version attributes on an installed sensor mean a pre-handshake build.
 */

export const CONNECT_AUTH_SENSOR_ID = 'sensor.ultra_card_pro_cloud_authentication_status';

/** Minimum Connect version that exposes the handshake attributes. */
export const MIN_CONNECT_VERSION = '1.6.0';

export type ConnectCapabilityName =
  | 'favorite_colors'
  | 'proxy'
  | 'media_upload'
  | 'smart'
  | 'diagnostics';

export interface ConnectCapabilities {
  favorite_colors?: boolean;
  proxy?: boolean;
  media_upload?: boolean;
  smart?: boolean;
  diagnostics?: boolean;
  [key: string]: boolean | undefined;
}

export interface ConnectInfo {
  installed: boolean;
  integrationVersion: string | null;
  capabilities: ConnectCapabilities;
  outdated: boolean;
  reason?: 'missing_version' | 'below_minimum' | null;
}

const OUTDATED_MESSAGE =
  'Update Ultra Card Connect to continue. This feature needs Connect 1.6.0 or newer.';

/** Parse "1.6.0", "1.6.0-beta1", etc. into [major, minor, patch]. */
export function parseConnectVersion(version: string | null | undefined): number[] | null {
  if (!version || typeof version !== 'string') return null;
  const core = version.trim().split(/[-+]/)[0];
  const parts = core.split('.').map(p => Number.parseInt(p, 10));
  if (parts.length < 1 || parts.some(n => Number.isNaN(n))) return null;
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

/** Compare two semver-like strings. Returns negative if a < b, 0 if equal, positive if a > b. */
export function compareConnectVersions(a: string, b: string): number {
  const pa = parseConnectVersion(a);
  const pb = parseConnectVersion(b);
  if (!pa && !pb) return 0;
  if (!pa) return -1;
  if (!pb) return 1;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function readSensor(hass: any): { state?: string; attributes?: Record<string, unknown> } | null {
  const sensor = hass?.states?.[CONNECT_AUTH_SENSOR_ID];
  if (!sensor) return null;
  return sensor;
}

/**
 * Snapshot of Connect install + handshake metadata.
 * `outdated` is true when installed but version is missing or below MIN_CONNECT_VERSION.
 */
export function getConnectInfo(hass: any): ConnectInfo {
  const sensor = readSensor(hass);
  if (!sensor) {
    return {
      installed: false,
      integrationVersion: null,
      capabilities: {},
      outdated: false,
      reason: null,
    };
  }

  const attrs = (sensor.attributes || {}) as Record<string, unknown>;
  const rawVersion = attrs.integration_version;
  const integrationVersion =
    typeof rawVersion === 'string' && rawVersion.trim() ? rawVersion.trim() : null;

  let capabilities: ConnectCapabilities = {};
  const rawCaps = attrs.capabilities;
  if (rawCaps && typeof rawCaps === 'object' && !Array.isArray(rawCaps)) {
    capabilities = { ...(rawCaps as ConnectCapabilities) };
  }

  if (!integrationVersion) {
    return {
      installed: true,
      integrationVersion: null,
      capabilities,
      outdated: true,
      reason: 'missing_version',
    };
  }

  const outdated = compareConnectVersions(integrationVersion, MIN_CONNECT_VERSION) < 0;
  return {
    installed: true,
    integrationVersion,
    capabilities,
    outdated,
    reason: outdated ? 'below_minimum' : null,
  };
}

export function isConnectInstalled(hass: any): boolean {
  return getConnectInfo(hass).installed;
}

export function isConnectOutdated(hass: any): boolean {
  return getConnectInfo(hass).outdated;
}

/**
 * True when Connect is installed and exposes the named capability as true.
 * Missing capability map (pre-handshake) → false when outdated; when version is
 * current but key absent, treat as false.
 */
export function hasCapability(hass: any, name: ConnectCapabilityName): boolean {
  const info = getConnectInfo(hass);
  if (!info.installed || info.outdated) return false;
  return info.capabilities[name] === true;
}

/**
 * When Connect is installed but too old (or missing handshake), return a user-facing
 * error message. When Connect is absent, return null so callers keep existing fallbacks.
 */
export function getOutdatedConnectError(hass: any, featureLabel?: string): string | null {
  const info = getConnectInfo(hass);
  if (!info.installed || !info.outdated) return null;
  if (featureLabel) {
    return `${featureLabel} requires Ultra Card Connect ${MIN_CONNECT_VERSION} or newer. Please update the Ultra Card Connect integration.`;
  }
  return OUTDATED_MESSAGE;
}

export function createOutdatedConnectError(hass: any, featureLabel?: string): Error | null {
  const message = getOutdatedConnectError(hass, featureLabel);
  if (!message) return null;
  const err = new Error(message);
  (err as Error & { code?: string }).code = 'connect_outdated';
  return err;
}
