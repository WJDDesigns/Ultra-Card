import { HomeAssistant } from 'custom-card-helpers';

/**
 * Resolves Home Assistant `media-source://` URIs to authenticated URLs that
 * can be used directly in <img>/CSS background-image.
 *
 * Background:
 *  - When a user copies an image path from the Home Assistant media browser
 *    (e.g. the page-background picker), the value is a `media-source://` URI
 *    such as `media-source://media_source/local/bilder/photo.png`. The
 *    `local` source ID points to the `/media` directory by default, NOT the
 *    `/config/www/` (`/local/`) folder, so it cannot just be string-rewritten
 *    to a `/local/...` URL.
 *  - The correct way to convert these URIs is the WebSocket call
 *    `media_source/resolve_media`, which returns a signed URL that the
 *    browser can fetch.
 *
 * This module wraps that call with:
 *  - a sync helper that returns the cached URL (or empty string while the
 *    resolution is in flight) so it can be used inside Lit render functions
 *  - an in-flight promise map so we never fire the same WS call twice for
 *    the same URI
 *  - a fallback to the legacy `/local/` rewrite if the WS resolution fails
 *    (so users whose files happen to live in `/config/www/` keep working
 *    when the media_source integration is unavailable)
 *  - a global `ultra-card-template-update` event dispatch on resolution so
 *    every Ultra Card on the page re-renders with the resolved URL
 */

const MEDIA_SOURCE_PREFIX = 'media-source://';

const resolvedCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();
const failedFallback = new Set<string>();

/** True if the value looks like an HA media-source URI. */
export function isMediaSourceUri(
  value: unknown
): value is `media-source://${string}` {
  return typeof value === 'string' && value.startsWith(MEDIA_SOURCE_PREFIX);
}

/**
 * Build a fully-qualified URL from a (possibly relative) URL returned by HA.
 * Resolved URLs from `media_source/resolve_media` are typically relative
 * (e.g. `/media/local/foo.png?authSig=...`).
 */
function toAbsoluteUrl(hass: HomeAssistant | undefined, url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const baseUrl =
      hass && typeof (hass as any).hassUrl === 'function' ? (hass as any).hassUrl() : '';
    if (baseUrl) {
      return `${String(baseUrl).replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
    }
  } catch {
    // ignore — fall through to returning relative path
  }
  return url;
}

/**
 * Legacy fallback: rewrite `media-source://media_source/local/...` to a
 * `/local/...` URL (i.e. `/config/www/`). Used only if the WS resolve call
 * fails so we preserve the previous behavior for setups where that file
 * actually lives in `www/`.
 */
function legacyLocalRewrite(hass: HomeAssistant | undefined, uri: string): string {
  const relativePath = uri.replace(/^media-source:\/\/media_source\/local\//, '');
  if (relativePath === uri) {
    // Not the `local` provider — nothing useful we can synthesize.
    return '';
  }
  return toAbsoluteUrl(hass, `/local/${relativePath}`);
}

/** Notify any mounted Ultra Cards that a resolved URL is ready. */
function notifyResolved(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('ultra-card-template-update', {
        detail: { source: 'media-resolver' },
      })
    );
  } catch {
    // ignore — older browsers / test envs
  }
}

/**
 * Async resolution of a media-source URI. The result is cached so subsequent
 * calls are synchronous (via {@link getResolvedMediaUrlSync}).
 *
 * If the WebSocket call fails, falls back to a legacy `/local/...` rewrite
 * so users with files in `/config/www/` continue to work.
 */
export async function resolveMediaSource(
  hass: HomeAssistant | undefined,
  uri: string
): Promise<string> {
  if (!isMediaSourceUri(uri)) return uri;

  const cached = resolvedCache.get(uri);
  if (cached) return cached;

  const existing = inFlight.get(uri);
  if (existing) return existing;

  const promise = (async () => {
    try {
      if (!hass || typeof (hass as any).callWS !== 'function') {
        throw new Error('hass.callWS unavailable');
      }
      const result = (await (hass as any).callWS({
        type: 'media_source/resolve_media',
        media_content_id: uri,
      })) as { url?: string } | undefined;

      const url = result?.url;
      if (!url) throw new Error('media_source/resolve_media returned no url');

      const absolute = toAbsoluteUrl(hass, url);
      resolvedCache.set(uri, absolute);
      return absolute;
    } catch (err) {
      // Fallback to the legacy rewrite. Mark this URI so we know the cached
      // value is a fallback (used only for diagnostics today).
      failedFallback.add(uri);
      const fallback = legacyLocalRewrite(hass, uri);
      if (fallback) {
        resolvedCache.set(uri, fallback);
      }
      return fallback;
    } finally {
      inFlight.delete(uri);
    }
  })();

  inFlight.set(uri, promise);
  // Re-render once the value lands in the cache.
  promise.then(resolved => {
    if (resolved) notifyResolved();
  });
  return promise;
}

/**
 * Synchronous lookup intended for use inside Lit `render()` methods.
 *
 * - Returns the cached resolved URL when available.
 * - Returns an empty string while resolution is in flight; kicks off the
 *   async resolve in the background and dispatches
 *   `ultra-card-template-update` once the URL is known so the card
 *   re-renders.
 * - Returns the original URI unchanged when it's not a `media-source://`
 *   string.
 */
export function getResolvedMediaUrlSync(
  hass: HomeAssistant | undefined,
  uri: string
): string {
  if (!isMediaSourceUri(uri)) return uri;

  const cached = resolvedCache.get(uri);
  if (cached) return cached;

  // Kick off resolution; ignore the returned promise — the cache + event
  // dispatch will deliver the result.
  void resolveMediaSource(hass, uri);
  return '';
}

/** Test helper — clears all internal state. Not exported from index. */
export function __resetMediaResolverForTests(): void {
  resolvedCache.clear();
  inFlight.clear();
  failedFallback.clear();
}
