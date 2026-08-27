/**
 * Ultra Card Cloud Authentication Service
 * Handles user authentication with ultracard.io WordPress site using JWT
 * Supports cross-device session sync via cloud sessions
 */

import { ucSessionSyncService } from './uc-session-sync-service';
import {
  createOutdatedConnectError,
  getConnectInfo,
  hasCapability,
} from './uc-connect-compatibility';
import { userFacingCloudError } from '../utils/uc-user-facing-cloud-error';

/** HA integration endpoint that forwards multipart files to ultracard.io (JWT stays on the server). */
const UC_MEDIA_UPLOAD_PATH = '/api/ultra_card_pro_cloud/media_upload';

/**
 * Ceiling for any single cloud request. Without this a slow or dropped
 * connection leaves spinners running forever with no error to surface.
 * Uploads get a longer budget because they carry real payloads.
 */
export const UC_CLOUD_TIMEOUT_MS = 15000;
export const UC_CLOUD_UPLOAD_TIMEOUT_MS = 60000;

/** Shape returned by the `ultra_card_pro_cloud/proxy` integration endpoint. */
interface UcProxyResponse {
  _status?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _body?: any;
}

class UcCloudTimeoutError extends Error {
  constructor(ms: number) {
    super(`Ultra Card Cloud did not respond within ${Math.round(ms / 1000)}s. Please try again.`);
    this.name = 'UcCloudTimeoutError';
  }
}

/**
 * Reject if `promise` has not settled within `ms`.
 *
 * Used for `hass.callApi` proxy calls, which take no AbortSignal. The
 * underlying request may still complete on the server; this only stops the
 * caller from waiting on it indefinitely.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new UcCloudTimeoutError(ms)), ms);
    }),
  ]).finally(() => clearTimeout(timer)) as Promise<T>;
}

/** `fetch` with an abort-backed timeout, preserving any caller-supplied signal. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  ms: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const callerSignal = options.signal;
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if ((error as Error)?.name === 'AbortError' && !callerSignal?.aborted) {
      throw new UcCloudTimeoutError(ms);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function formDataContainsFile(fd: FormData): boolean {
  for (const [, value] of fd.entries()) {
    if (value instanceof File) return true;
  }
  return false;
}

/**
 * Convert FormData with only string fields to a JSON object for the integration JSON proxy.
 * Handles repeated keys like `photo_ids[]`.
 */
function formDataToJsonBody(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of fd.entries()) {
    if (value instanceof File) continue;
    const str = value as string;
    if (key.endsWith('[]')) {
      const base = key.slice(0, -2);
      const arr = (out[base] as string[] | undefined) ?? [];
      arr.push(str);
      out[base] = arr;
    } else if (out[key] !== undefined) {
      const existing = out[key];
      if (Array.isArray(existing)) {
        (existing as string[]).push(str);
      } else {
        out[key] = [existing as string, str];
      }
    } else {
      out[key] = str;
    }
  }
  if (Array.isArray(out.photo_ids)) {
    out.photo_ids = (out.photo_ids as string[]).map((id) => parseInt(id, 10));
  }
  return out;
}

function firstFileFromFormData(fd: FormData): { fieldName: string; file: File } | null {
  for (const [fieldName, value] of fd.entries()) {
    if (value instanceof File) return { fieldName, file: value };
  }
  return null;
}

function fileToBase64DataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result as string;
      const comma = s.indexOf(',');
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

/** ASCII-safe filename for multipart (avoids REST 400 on some WP setups). */
function safeUploadFilename(name: string): string {
  const base = name.replace(/[^\x20-\x7E]+/g, '_').replace(/[\\/:*?"<>|]/g, '_').trim();
  const withExt = base || 'upload.png';
  return withExt.length > 180 ? withExt.slice(0, 180) : withExt;
}

export interface SubscriptionFeatures {
  auto_backups: boolean;
  snapshots_enabled: boolean;
  snapshot_limit: number;
  backup_retention_days: number;
}

export interface UserSubscription {
  tier: 'free' | 'pro';
  status: 'active' | 'expired';
  expires?: number | undefined;
  features: SubscriptionFeatures;
  snapshot_count: number;
  snapshot_limit: number;
}

export interface CloudUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatar?: string | undefined;
  token: string;
  refreshToken?: string | undefined;
  expiresAt: number;
  subscription?: UserSubscription | undefined;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

export interface AuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  user_id: number;
  avatar_url?: string | undefined;
  refresh_token?: string | undefined;
  expires_in?: number | undefined;
}

/**
 * Pull the human-readable message out of a rejected `hass.callApi` value, which
 * carries the response payload on `body` rather than being an Error.
 */
export function extractHassApiError(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return userFacingCloudError(err, err);
  const candidate = err as { body?: unknown; error?: unknown; message?: unknown };
  const body = candidate.body;
  if (typeof body === 'string' && body.trim()) return userFacingCloudError(body);
  if (body && typeof body === 'object') {
    const { error, message } = body as { error?: unknown; message?: unknown };
    if (typeof error === 'string' && error.trim()) return userFacingCloudError(error);
    if (typeof message === 'string' && message.trim()) return userFacingCloudError(message);
  }
  if (typeof candidate.message === 'string' && candidate.message.trim()) {
    return userFacingCloudError(candidate.message);
  }
  if (typeof candidate.error === 'string' && candidate.error.trim()) {
    return userFacingCloudError(candidate.error);
  }
  return '';
}

/**
 * Cloud authentication service for Ultra Card
 * Integrates with WordPress JWT Authentication plugin
 */
class UcCloudAuthService {
  private static readonly API_BASE = 'https://ultracard.io/wp-json';
  private static readonly JWT_ENDPOINT = '/jwt-auth/v1';
  private static readonly STORAGE_KEY = 'ultra-card-cloud-auth';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  // Default token lifetime when server doesn't specify — 7 days
  private static readonly DEFAULT_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

  private _currentUser: CloudUser | null = null;
  private _listeners: Set<(user: CloudUser | null) => void> = new Set();
  private _refreshTimer: number | undefined;
  /** When using integration auth (no token in frontend), hass is used to call the integration proxy. */
  private _integrationHass: any = null;

  constructor() {
    // HA integration sensor is the single source of truth. Purge any legacy
    // browser JWT left from older Ultra Card versions.
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(UcCloudAuthService.STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * Check if Ultra Card Connect integration is installed and authenticated
   * Returns integration auth data if available, null otherwise
   *
   * SECURITY: This reads from a protected sensor entity that users cannot manipulate.
   * The sensor is created by the Ultra Card Connect integration after successful
   * authentication with ultracard.io.
   */
  checkIntegrationAuth(hass: any): CloudUser | null {
    try {
      // Check for the protected sensor entity
      const sensorEntityId = 'sensor.ultra_card_pro_cloud_authentication_status';
      const sensorState = hass?.states?.[sensorEntityId];

      if (!sensorState) {
        return null;
      }

      // Check if authenticated
      if (sensorState.state !== 'connected' || !sensorState.attributes?.authenticated) {
        return null;
      }

      const attrs = sensorState.attributes;

      // Convert sensor data to CloudUser format
      const user: CloudUser = {
        id: attrs.user_id,
        username: attrs.username || '',
        email: attrs.email || '',
        displayName: attrs.display_name || attrs.username || '',
        token: '', // Token never exposed in sensor; API calls go through integration proxy
        expiresAt: 0, // Managed by integration server-side
        subscription: {
          tier: attrs.subscription_tier || 'free',
          status: attrs.subscription_status || 'expired',
          expires: attrs.subscription_expires,
          features: attrs.features || {
            auto_backups: attrs.subscription_tier === 'pro',
            snapshots_enabled: attrs.subscription_tier === 'pro',
            snapshot_limit: attrs.subscription_tier === 'pro' ? 10 : 0,
            backup_retention_days: 90,
          },
          snapshot_count: 0,
          snapshot_limit: attrs.subscription_tier === 'pro' ? 10 : 0,
        },
      };

      return user;
    } catch (error) {
      console.debug('No Ultra Card Connect integration found:', error);
      return null;
    }
  }

  /**
   * Check if integration is installed (whether authenticated or not)
   */
  isIntegrationInstalled(hass: any): boolean {
    try {
      const sensorEntityId = 'sensor.ultra_card_pro_cloud_authentication_status';
      return !!hass?.states?.[sensorEntityId];
    } catch (error) {
      return false;
    }
  }

  /**
   * After sign-in, create or update the Ultra Card Connect config entry so the integration
   * sensor shows authenticated and Pro is recognized. Handles: (1) no entry yet -> create via flow;
   * (2) entry exists but not signed in -> reconfigure with credentials.
   * Returns a short message for the UI on failure, or undefined on success.
   */
  async autoRegisterIntegration(
    hass: any,
    username: string,
    password: string
  ): Promise<string | undefined> {
    if (!hass?.connection) return undefined;
    const callApi = (hass as any).callApi;
    const callWS = (hass as any).callWS;
    if (typeof callApi !== 'function') return undefined;

    const sensorEntityId = 'sensor.ultra_card_pro_cloud_authentication_status';
    const sensor = hass?.states?.[sensorEntityId];
    const isConnected = sensor?.state === 'connected' && sensor?.attributes?.authenticated;

    if (isConnected) return undefined;

    try {
      let flowId: string;
      const entriesRaw =
        typeof callWS === 'function'
          ? await callWS({
              type: 'config_entries/get',
              domain: 'ultra_card_pro_cloud',
            })
          : [];
      const entries = entriesRaw as Array<{ entry_id: string; data?: Record<string, unknown> }>;

      const existingEntry = Array.isArray(entries) && entries.length > 0 ? entries[0] : null;

      if (existingEntry) {
        const createRes = await callApi('POST', 'config/config_entries/flow', {
          handler: 'ultra_card_pro_cloud',
          show_advanced_options: false,
          entry_id: existingEntry.entry_id,
        });
        flowId = createRes?.flow_id;
        if (!flowId) return undefined;
        await callApi('POST', `config/config_entries/flow/${flowId}`, {
          next_step: 'sign_in',
        });
        await callApi('POST', `config/config_entries/flow/${flowId}`, {
          username,
          password,
        });
      } else {
        const createRes = await callApi('POST', 'config/config_entries/flow', {
          handler: 'ultra_card_pro_cloud',
          show_advanced_options: false,
        });
        flowId = createRes?.flow_id;
        if (!flowId) return undefined;
        await callApi('POST', `config/config_entries/flow/${flowId}`, {
          next_step: 'sign_in',
        });
        await callApi('POST', `config/config_entries/flow/${flowId}`, {
          username,
          password,
        });
      }
      return undefined;
    } catch (err) {
      console.debug('Auto-register integration failed:', err);
      return 'Could not auto-configure. You can add the integration manually in Settings → Integrations.';
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): CloudUser | null {
    return this._currentUser;
  }

  /**
   * Called whenever the integration sensor updates — keeps _currentUser in sync.
   *
   * `hass` is required: under integration auth the JWT stays server-side, so
   * authenticatedFetch can only reach the cloud through the hass proxy. Omitting
   * it leaves _integrationHass null and every cloud call fails with
   * "Not authenticated" — a silent failure that is hard to trace back here.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setIntegrationUser(user: CloudUser, hass: any): void {
    if (!hass) {
      console.warn(
        '[UltraCard] setIntegrationUser called without hass; cloud requests using integration auth will fail.'
      );
    }
    if (
      this._currentUser?.email === user.email &&
      this._currentUser?.token === user.token
    ) {
      if (!user.token && hass) this._integrationHass = hass;
      return;
    }
    this._integrationHass = user?.token ? null : (hass ?? null);
    this._setCurrentUser(user);
  }

  /**
   * Check if user is authenticated.
   * Returns true if we have a user with a token — local expiry is NOT checked here
   * because the server is the authority on token validity. Expired tokens will receive
   * a 401 which is already handled by authenticatedFetch's refresh-and-retry logic.
   */
  isAuthenticated(): boolean {
    if (!this._currentUser) return false;
    // Has a token (JWT or integration) — consider authenticated
    if (this._currentUser.token && this._currentUser.token !== '') return true;
    // No token but user exists (integration auth without token field)
    return true;
  }

  /**
   * Check if token should be refreshed proactively (before it expires)
   */
  shouldRefreshToken(): boolean {
    return this._shouldRefreshToken();
  }

  // ---------------------------------------------------------------------------
  // HA-backed auth methods — single source of truth for all auth operations.
  // Credentials are stored in HA's config entry storage (not localStorage).
  // The frontend calls these via hass.callApi(); the HA integration handles
  // the actual ultracard.io API calls and updates the sensor.
  // ---------------------------------------------------------------------------

  /**
   * Login via HA integration. Credentials are stored in HA config entries.
   * The coordinator authenticates with ultracard.io and updates the sensor.
   * Returns the CloudUser from the updated sensor.
   */
  async loginViaHass(hass: any, email: string, password: string): Promise<CloudUser> {
    let result: any;
    try {
      result = await hass.callApi('POST', 'ultra_card_pro_cloud/login', {
        username: email,
        password,
      });
    } catch (err) {
      // hass.callApi rejects on non-2xx with { status_code, body }, so the
      // integration's explanation is only reachable through the thrown value.
      const error = new Error(extractHassApiError(err) || 'Authentication failed');
      (error as Error & { cause?: unknown }).cause = err;
      throw error;
    }
    if (!result?.success || !result?.user) {
      throw new Error(userFacingCloudError(result?.error, 'Authentication failed'));
    }
    const user = this._sensorAttrsToCloudUser(result.user);
    this._integrationHass = hass;
    this._setCurrentUser(user);
    return user;
  }

  /**
   * Register a new account via HA integration.
   * Account creation finishes by email on ultracard.io; no shared HA sign-in is changed here.
   */
  async registerViaHass(
    hass: any,
    username: string,
    email: string,
    displayName?: string
  ): Promise<string> {
    try {
      const result = await hass.callApi('POST', 'ultra_card_pro_cloud/register', {
        username,
        email,
        display_name: displayName || username,
      });
      if (!result?.success) {
        throw new Error(result?.error || 'Registration failed');
      }
      return (
        result?.message ||
        'Account created. Check your email inbox, junk, or spam for the ultracard.io message to finish setting your password.'
      );
    } catch (error) {
      const message =
        (error as { body?: { message?: string; error?: string }; message?: string })?.body?.message ||
        (error as { body?: { message?: string; error?: string }; message?: string })?.body?.error ||
        (error as { message?: string })?.message ||
        'Registration failed';
      throw new Error(message);
    }
  }

  /**
   * Logout — clears credentials from HA config entry and resets sensor.
   */
  async logoutViaHass(hass: any): Promise<void> {
    try {
      await hass.callApi('POST', 'ultra_card_pro_cloud/logout', {});
    } catch {
      // Ignore network errors on logout; clear local state regardless
    }
    this._setCurrentUser(null);
    this._clearStorage();
    this._clearAutoRefresh();
    this._notifyListeners();
  }

  /**
   * Convert HA sensor attributes to a CloudUser object.
   */
  private _sensorAttrsToCloudUser(attrs: Record<string, any>): CloudUser {
    return {
      id: attrs.user_id || 0,
      username: attrs.username || '',
      email: attrs.email || '',
      displayName: attrs.display_name || attrs.username || '',
      token: '', // Token never sent from integration; API calls use proxy
      expiresAt: 0,
      subscription: {
        tier: attrs.subscription_tier || 'free',
        status: attrs.subscription_status || 'active',
        expires: attrs.subscription_expires,
        features: {
          auto_backups: attrs.subscription_tier === 'pro',
          snapshots_enabled: attrs.subscription_tier === 'pro',
          snapshot_limit: attrs.subscription_tier === 'pro' ? 10 : 0,
          backup_retention_days: 90,
        },
        snapshot_count: 0,
        snapshot_limit: attrs.subscription_tier === 'pro' ? 10 : 0,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Legacy direct-JWT login (kept for internal use by authenticatedFetch only)
  // ---------------------------------------------------------------------------

  /**
   * Login with username/email and password.
   * @deprecated Browser JWT login is removed — use loginViaHass().
   */
  async login(_credentials: LoginCredentials): Promise<CloudUser> {
    throw new Error(
      'Direct browser login is no longer supported. Install Ultra Card Connect and sign in from the Hub Account tab.'
    );
  }

  /**
   * Register a new user account.
   * @deprecated Use registerViaHass() instead.
   */
  async register(_data: RegisterData): Promise<CloudUser> {
    throw new Error(
      'Direct browser registration is no longer supported. Use the Hub Account tab (Ultra Card Connect).'
    );
  }

  /**
   * Refresh the current JWT token with retry logic.
   * @deprecated Integration auth refreshes tokens server-side.
   */
  async refreshToken(_retryCount = 0): Promise<string> {
    throw new Error(
      'Browser token refresh is no longer supported. Ultra Card Connect refreshes tokens on the server.'
    );
  }

  /**
   * Clear local auth state only. Prefer logoutViaHass() when Connect is installed
   * so HA credentials are cleared too.
   */
  async logout(): Promise<void> {
    this._setCurrentUser(null);
    this._clearStorage();
    this._clearAutoRefresh();
    try {
      ucSessionSyncService.stopPolling();
    } catch {
      /* ignore */
    }
  }

  /**
   * Get valid authorization header. Returns null when using integration auth (proxy path).
   */
  getAuthHeader(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    if (!this._currentUser!.token) {
      return null; // Integration auth: token stays server-side, use authenticatedFetch (proxy)
    }
    return `Bearer ${this._currentUser!.token}`;
  }

  /**
   * Make authenticated API request. Uses integration proxy when token is not in frontend.
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    // Integration auth: token is server-side; proxy the request through HA
    if (!this._currentUser!.token && this._integrationHass) {
      const method = (options.method || 'GET').toUpperCase();

      // Multipart uploads: the JSON proxy cannot forward file bytes. Use the integration
      // media upload endpoint (multipart → ultracard.io with server JWT).
      if (options.body instanceof FormData) {
        const fd = options.body;
        if (formDataContainsFile(fd)) {
          const isMediaUrl =
            url.includes('/ultra-card/v1/media') || url.endsWith('/ultra-card/v1/media');
          if (!isMediaUrl) {
            throw new Error(
              'This request includes files and is not supported through Home Assistant integration auth.'
            );
          }
          const r = await fetchWithTimeout(
            UC_MEDIA_UPLOAD_PATH,
            { method: 'POST', body: fd, credentials: 'same-origin' },
            UC_CLOUD_UPLOAD_TIMEOUT_MS
          );

          // Dedicated route missing on older integration builds (404) — forward via JSON proxy + base64
          // only when Connect is current and claims media_upload. Otherwise surface an update error.
          if (r.status === 404) {
            const connect = getConnectInfo(this._integrationHass);
            if (
              connect.installed &&
              (connect.outdated || !hasCapability(this._integrationHass, 'media_upload'))
            ) {
              const outdatedErr = createOutdatedConnectError(
                this._integrationHass,
                'Media upload'
              );
              throw (
                outdatedErr ||
                new Error(
                  'Media upload requires an updated Ultra Card Connect integration. Please update Connect and try again.'
                )
              );
            }
            const first = firstFileFromFormData(fd);
            if (!first) {
              throw new Error('No file in FormData');
            }
            const dataB64 = await fileToBase64DataUrl(first.file);
            const callApi = (this._integrationHass as any).callApi;
            if (typeof callApi !== 'function') {
              throw new Error('Integration proxy unavailable');
            }
            const res = await withTimeout<UcProxyResponse>(
              callApi('POST', 'ultra_card_pro_cloud/proxy', {
              method: 'POST',
              url,
              body: {
                __media_upload_b64: {
                  field: 'photo',
                  filename: safeUploadFilename(first.file.name),
                  content_type: first.file.type || 'application/octet-stream',
                  data: dataB64,
                },
              },
              }),
              UC_CLOUD_UPLOAD_TIMEOUT_MS
            );
            const status = res?._status ?? 0;
            const _body = res?._body;
            const ok = status >= 200 && status < 300;
            return {
              ok,
              status,
              json: () => Promise.resolve(_body),
              text: () => Promise.resolve(typeof _body === 'string' ? _body : JSON.stringify(_body)),
            } as Response;
          }

          return r;
        }
        // String-only FormData (e.g. preset submit with photo_ids) → JSON for the proxy
        const jsonBody = formDataToJsonBody(fd);
        const callApi = (this._integrationHass as any).callApi;
        if (typeof callApi !== 'function') {
          throw new Error('Integration proxy unavailable');
        }
        const res = await withTimeout<UcProxyResponse>(
          callApi('POST', 'ultra_card_pro_cloud/proxy', {
            method,
            url,
            body: jsonBody,
          }),
          UC_CLOUD_TIMEOUT_MS
        );
        const status = res?._status ?? 0;
        const _body = res?._body;
        const ok = status >= 200 && status < 300;
        return {
          ok,
          status,
          json: () => Promise.resolve(_body),
          text: () => Promise.resolve(typeof _body === 'string' ? _body : JSON.stringify(_body)),
        } as Response;
      }

      let body: any = undefined;
      if (options.body !== undefined && options.body !== null) {
        body = options.body;
        if (typeof body === 'string') try { body = JSON.parse(body); } catch { /* pass as string */ }
      }
      const callApi = (this._integrationHass as any).callApi;
      if (typeof callApi !== 'function') {
        throw new Error('Integration proxy unavailable');
      }
      const res = await withTimeout<UcProxyResponse>(
        callApi('POST', 'ultra_card_pro_cloud/proxy', {
          method,
          url,
          body: body !== undefined ? body : null,
        }),
        UC_CLOUD_TIMEOUT_MS
      );
      const status = res?._status ?? 0;
      const _body = res?._body;
      const ok = status >= 200 && status < 300;
      return {
        ok,
        status,
        json: () => Promise.resolve(_body),
        text: () => Promise.resolve(typeof _body === 'string' ? _body : JSON.stringify(_body)),
      } as Response;
    }

    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    const isFormData = options.body instanceof FormData;
    const baseHeaders: Record<string, string> = { Authorization: authHeader };
    if (!isFormData) baseHeaders['Content-Type'] = 'application/json';

    const timeoutMs = isFormData ? UC_CLOUD_UPLOAD_TIMEOUT_MS : UC_CLOUD_TIMEOUT_MS;

    const response = await fetchWithTimeout(
      url,
      { ...options, headers: { ...options.headers, ...baseHeaders } },
      timeoutMs
    );

    if (response.status === 401 && this._currentUser?.refreshToken) {
      try {
        await this.refreshToken();
        const newAuthHeader = this.getAuthHeader();
        if (newAuthHeader) {
          const retryHeaders: Record<string, string> = { Authorization: newAuthHeader };
          if (!isFormData) retryHeaders['Content-Type'] = 'application/json';
          return fetchWithTimeout(
            url,
            { ...options, headers: { ...options.headers, ...retryHeaders } },
            timeoutMs
          );
        }
      } catch (refreshError) {
        throw new Error('Authentication expired. Please login again.');
      }
    }

    return response;
  }

  /**
   * Add authentication state listener
   */
  addListener(listener: (user: CloudUser | null) => void): void {
    this._listeners.add(listener);
  }

  /**
   * Remove authentication state listener
   */
  removeListener(listener: (user: CloudUser | null) => void): void {
    this._listeners.delete(listener);
  }

  /**
   * Create user object from auth response
   */
  private _createUserFromAuth(authData: AuthResponse): CloudUser {
    // Use server-provided expires_in if available, otherwise default to 7 days
    const expiresAt = authData.expires_in
      ? Date.now() + authData.expires_in * 1000
      : Date.now() + UcCloudAuthService.DEFAULT_TOKEN_TTL;
    return {
      id: authData.user_id,
      username: authData.user_nicename,
      email: authData.user_email,
      displayName: authData.user_display_name,
      avatar: authData.avatar_url,
      token: authData.token,
      refreshToken: authData.refresh_token,
      expiresAt,
    };
  }

  /**
   * Set current user and notify listeners
   */
  private _setCurrentUser(user: CloudUser | null): void {
    if (!user) this._integrationHass = null;
    this._currentUser = user;
    this._notifyListeners();
  }

  private _isNotifying = false;

  /**
   * Notify all listeners of auth state change.
   * Re-entrancy guard prevents listeners from recursively triggering new notifications
   * (e.g. _authListener calling setIntegrationUser which calls back here).
   */
  private _notifyListeners(): void {
    if (this._isNotifying) return;
    this._isNotifying = true;
    try {
      this._listeners.forEach(listener => {
        try {
          listener(this._currentUser);
        } catch (error) {
          console.error('Error in auth listener:', error);
        }
      });
    } finally {
      this._isNotifying = false;
    }
  }

  /**
   * Check if we should proactively refresh the token
   * (within REFRESH_THRESHOLD of expiry)
   */
  private _shouldRefreshToken(): boolean {
    if (!this._currentUser) return false;
    return Date.now() >= this._currentUser.expiresAt - UcCloudAuthService.REFRESH_THRESHOLD;
  }

  /**
   * Clear automatic refresh timer
   */
  private _clearAutoRefresh(): void {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = undefined;
    }
  }

  /**
   * Fetch subscription data for user
   */
  private async _fetchSubscriptionData(user: CloudUser): Promise<void> {
    try {
      const response = await fetch(`${UcCloudAuthService.API_BASE}/ultra-card/v1/subscription`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const subscription: UserSubscription = await response.json();
        user.subscription = subscription;
      } else {
        console.warn('⚠️ Failed to fetch subscription, defaulting to free tier');
        // Default to free tier if fetch fails
        user.subscription = {
          tier: 'free',
          status: 'active',
          features: {
            auto_backups: true,
            snapshots_enabled: false,
            snapshot_limit: 0,
            backup_retention_days: 30,
          },
          snapshot_count: 0,
          snapshot_limit: 0,
        };
      }
    } catch (error) {
      console.error('❌ Error fetching subscription:', error);
      // Default to free tier on error
      user.subscription = {
        tier: 'free',
        status: 'active',
        features: {
          auto_backups: true,
          snapshots_enabled: false,
          snapshot_limit: 0,
          backup_retention_days: 30,
        },
        snapshot_count: 0,
        snapshot_limit: 0,
      };
    }
  }

  /**
   * Load user from localStorage
   */
  private _loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(UcCloudAuthService.STORAGE_KEY);
      if (stored) {
        const user: CloudUser = JSON.parse(stored);
        if (this._isValidStoredUser(user)) {
          this._currentUser = user;
        } else {
          this._clearStorage();
        }
      }
    } catch (error) {
      console.error('❌ Failed to load auth from storage:', error);
      this._clearStorage();
    }
  }

  /**
   * Clear user from localStorage
   */
  private _clearStorage(): void {
    try {
      localStorage.removeItem(UcCloudAuthService.STORAGE_KEY);
    } catch (error) {
      console.error('❌ Failed to clear auth storage:', error);
    }
  }

  /**
   * Validate stored user data
   * Note: Token and expiresAt are optional for integration-based auth
   */
  private _isValidStoredUser(user: any): user is CloudUser {
    // Debug log to see what's wrong
    if (!user) {
      console.warn('❌ Validation failed: user is null/undefined');
      return false;
    }

    // Basic required fields
    const requiredChecks = {
      'user exists': !!user,
      'id is number': typeof user.id === 'number',
      'username is string': typeof user.username === 'string',
      'email is string': typeof user.email === 'string',
      'displayName is string': typeof user.displayName === 'string',
    };

    const failedChecks = Object.entries(requiredChecks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);

    if (failedChecks.length > 0) {
      console.warn('❌ Validation failed. Failed checks:', failedChecks);
      console.warn('   User data:', JSON.stringify(user, null, 2));
      return false;
    }

    // Token and expiresAt are optional (managed by integration)
    // Only validate them if they exist
    if (user.token !== undefined && typeof user.token !== 'string') {
      console.warn('❌ Validation failed: token exists but is not a string');
      return false;
    }
    if (user.expiresAt !== undefined && typeof user.expiresAt !== 'number') {
      console.warn('❌ Validation failed: expiresAt exists but is not a number');
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const ucCloudAuthService = new UcCloudAuthService();
