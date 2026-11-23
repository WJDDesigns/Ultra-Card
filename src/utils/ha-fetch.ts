import type { HomeAssistant } from '../ha/types';

/**
 * Authenticated requests to the user's own Home Assistant.
 *
 * The card never reads the login token itself. It hands a relative path to
 * Home Assistant's own `hass.fetchWithAuth`, which adds the token and sends
 * the request to Home Assistant's own address. A path that could point at
 * another host ("//host", "/\host", "https://…") is refused, so the login
 * can never leave Home Assistant from here.
 */

/** True for "/api/x" style paths that can only stay on the current origin. */
export function isSameOriginPath(path: string): boolean {
  return typeof path === 'string' && /^\/(?![/\\])/.test(path);
}

/**
 * If `url` points at this Home Assistant (same origin as the page or as
 * hass.hassUrl()), return it as a relative path ("/local/logo.png?v=1").
 * Otherwise return null.
 */
export function toHomeAssistantPath(url: string, hass?: HomeAssistant): string | null {
  if (!url) return null;
  if (isSameOriginPath(url)) return url;
  let parsed: URL;
  try {
    parsed = new URL(url, window.location.href);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  const origins = new Set<string>([window.location.origin]);
  try {
    const base = (hass as any)?.hassUrl?.();
    if (typeof base === 'string' && base) origins.add(new URL(base, window.location.href).origin);
  } catch {
    /* ignore */
  }
  if (!origins.has(parsed.origin)) return null;
  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  return isSameOriginPath(path) ? path : null;
}

/** Authenticated fetch to a relative Home Assistant path. */
export function fetchFromHomeAssistant(
  hass: HomeAssistant,
  path: string,
  init?: RequestInit
): Promise<Response> {
  if (!isSameOriginPath(path)) {
    return Promise.reject(new Error('Only Home Assistant paths are allowed'));
  }
  if (!hass || typeof hass.fetchWithAuth !== 'function') {
    return Promise.reject(new Error('Home Assistant connection is not available'));
  }
  return hass.fetchWithAuth(path, init as any);
}
