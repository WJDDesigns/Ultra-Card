/**
 * Fetch redacted Ultra Card Connect diagnostics from the HA integration.
 * Falls back to a client-side sensor snapshot when the endpoint is missing (old Connect).
 */
import { VERSION } from '../version';
import { redactCloudErrorTree, userFacingCloudError } from '../utils/uc-user-facing-cloud-error';
import {
  CONNECT_AUTH_SENSOR_ID,
  getConnectInfo,
  MIN_CONNECT_VERSION,
  type ConnectInfo,
} from './uc-connect-compatibility';

export interface ConnectDiagnosticsReport {
  generated_at?: string;
  integration_version?: string;
  capabilities?: Record<string, boolean | undefined>;
  panel?: Record<string, unknown>;
  entries?: Array<Record<string, unknown>>;
  error?: string;
  ultra_card_version?: string;
  connect_info?: ConnectInfo;
  source?: 'api' | 'client_fallback';
  [key: string]: unknown;
}

function apiErrorMessage(err: unknown): string {
  const e = err as {
    status?: number;
    status_code?: number;
    response?: { status?: number };
    message?: string;
    body?: { message?: string; error?: string };
  };
  const status = e?.status ?? e?.status_code ?? e?.response?.status;
  const bodyMsg =
    (typeof e?.body?.error === 'string' && e.body.error) ||
    (typeof e?.body?.message === 'string' && e.body.message) ||
    null;

  if (status === 404) {
    return `Connect diagnostics API not found (404). Update Ultra Card Connect to ${MIN_CONNECT_VERSION}+ and restart Home Assistant.`;
  }
  if (status === 403) {
    return 'Only Home Assistant administrators can run Connect diagnostics.';
  }
  if (bodyMsg) return userFacingCloudError(bodyMsg, bodyMsg);
  if (typeof e?.message === 'string' && e.message.trim()) {
    return userFacingCloudError(e.message, e.message);
  }
  if (status) return `Diagnostics request failed (${status})`;
  return 'Failed to load diagnostics';
}

/** Build a redacted report from the auth sensor when the REST endpoint is unavailable. */
export function buildClientDiagnosticsFallback(hass: any): ConnectDiagnosticsReport {
  const info = getConnectInfo(hass);
  const sensor = hass?.states?.[CONNECT_AUTH_SENSOR_ID];
  const attrs = (sensor?.attributes || {}) as Record<string, unknown>;
  const authenticated =
    sensor?.state === 'connected' && attrs.authenticated === true;

  const report: ConnectDiagnosticsReport = {
    generated_at: new Date().toISOString(),
    source: 'client_fallback',
    ultra_card_version: VERSION,
    capabilities: { ...(info.capabilities || {}) },
    connect_info: info,
    error: info.outdated
      ? `Ultra Card Connect needs updating (required ${MIN_CONNECT_VERSION}+). Sensor handshake and /diagnostics are missing on this install.`
      : 'Diagnostics API unavailable; report built from the auth sensor only.',
    entries: [
      {
        capabilities: { ...(info.capabilities || {}) },
        entry: {
          domain: 'ultra_card_pro_cloud',
          has_username: Boolean(attrs.username),
        },
        coordinator: {
          authenticated,
          username: attrs.username ?? null,
          email_redacted: typeof attrs.email === 'string' && attrs.email.includes('@')
            ? `${String(attrs.email).slice(0, 1)}***@${String(attrs.email).split('@')[1]}`
            : '',
          subscription_tier: attrs.subscription_tier ?? null,
          subscription_status: attrs.subscription_status ?? null,
          needs_reauth: Boolean(attrs.needs_reauth),
          last_poll: attrs.last_poll ?? null,
          connected_at: attrs.connected_at ?? null,
          // Token never exposed on sensor — unknown from client fallback
          token_present: authenticated ? null : false,
          sensor_state: sensor?.state ?? null,
        },
        connectivity: null,
      },
    ],
    panel: { manifest_present: false },
  };
  if (info.integrationVersion) {
    report.integration_version = info.integrationVersion;
    (report.entries![0] as Record<string, unknown>).integration_version = info.integrationVersion;
  }
  return report;
}

export async function fetchConnectDiagnostics(
  hass: any,
  options: { runConnectivity?: boolean } = {}
): Promise<ConnectDiagnosticsReport> {
  if (!hass?.callApi) {
    throw new Error('Home Assistant API unavailable');
  }
  const runConnectivity = options.runConnectivity !== false;
  try {
    const report = (await hass.callApi(
      'POST',
      'ultra_card_pro_cloud/diagnostics',
      { run_connectivity: runConnectivity }
    )) as ConnectDiagnosticsReport;

    return redactCloudErrorTree({
      ...report,
      source: 'api',
      ultra_card_version: VERSION,
      connect_info: getConnectInfo(hass),
    });
  } catch (err) {
    const fallback = buildClientDiagnosticsFallback(hass);
    const message = apiErrorMessage(err);
    const enriched = Object.assign(new Error(message), {
      code: 'connect_diagnostics_unavailable',
      fallback,
      cause: err,
    });
    throw enriched;
  }
}

export function downloadDiagnosticsJson(report: ConnectDiagnosticsReport, filename?: string): void {
  const blob = new Blob(
    [
      JSON.stringify(
        redactCloudErrorTree(report),
        (key, value) => (key === 'bot_challenge' ? undefined : value),
        2
      ),
    ],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    filename ||
    `ultra-card-connect-diagnostics-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  // Revoke on next tick so the download can start in Safari/HA webview
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}
