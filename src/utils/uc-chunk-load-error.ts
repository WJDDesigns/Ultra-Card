/**
 * Version-skew handling for the multi-file build.
 *
 * Chunks are content-hashed (`uc-<name>.<hash>.js`) and HACS serves them with
 * a 31-day cache. Right after an update a tab can still be running the old
 * `ultra-card.js` (or an old chunk that imports siblings by hash) while the
 * files on disk carry new hashes, so the next lazy `import()` 404s. Without
 * help the user sees a skeleton or "Module failed to load" with no hint that a
 * plain reload fixes it. This module classifies such failures and surfaces one
 * "Ultra Card was updated, reload" toast per page.
 */

import { ucToastService } from '../services/uc-toast-service';

declare let __webpack_public_path__: string;

/** Messages the engines produce when a dynamic `import()` cannot be fetched or parsed. */
const CHUNK_LOAD_PATTERNS: RegExp[] = [
  /Failed to fetch dynamically imported module/i, // Chromium
  /error loading dynamically imported module/i, // Firefox
  /Importing a module script failed/i, // Safari
  /Failed to load module script/i, // MIME / 404 fallthrough
  /Loading (?:CSS )?chunk [\w.-]+ failed/i, // webpack ChunkLoadError text
  /ChunkLoadError/i,
  /^Load failed$/i, // Safari TypeError from a failed fetch
  /NetworkError when attempting to fetch resource/i, // Firefox
];

export type ChunkLoadFailureKind = 'version-skew' | 'offline' | 'unknown';

let notified = false;

export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: unknown; message?: unknown; code?: unknown };
  if (e.name === 'ChunkLoadError' || e.code === 'CSS_CHUNK_LOAD_FAILED') return true;
  const message = typeof e.message === 'string' ? e.message : typeof err === 'string' ? err : '';
  if (!message) return false;
  return CHUNK_LOAD_PATTERNS.some(re => re.test(message));
}

/** Extract the module URL from the engine message when it includes one (Chromium, Firefox). */
function extractUrl(err: unknown): string | undefined {
  const message = (err as { message?: unknown })?.message;
  if (typeof message !== 'string') return undefined;
  const match = message.match(/(https?:\/\/\S+|\/\S+\.js\S*)/);
  return match?.[1]?.replace(/[).,]+$/, '');
}

/**
 * Decide whether the failure is an update (server reachable, chunk gone) or a
 * connectivity problem. A 404 on the failed URL is the strongest signal; when
 * the message carries no URL, a reachable entry file is treated as skew because
 * a served chunk cannot otherwise disappear.
 */
async function classifyFailure(err: unknown): Promise<ChunkLoadFailureKind> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  if (typeof fetch !== 'function') return 'unknown';

  const probe = async (url: string): Promise<number | undefined> => {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
      const timer = controller ? setTimeout(() => controller.abort(), 4000) : undefined;
      const res = await fetch(url, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller?.signal ?? null,
      });
      if (timer) clearTimeout(timer);
      return res.status;
    } catch {
      return undefined;
    }
  };

  const failedUrl = extractUrl(err);
  if (failedUrl) {
    const status = await probe(failedUrl);
    if (status === 404 || status === 410) return 'version-skew';
    if (status === undefined) return 'offline';
    return 'unknown';
  }

  const entryUrl = (() => {
    try {
      // src/public-path.ts pins this to the directory ultra-card.js was loaded
      // from. (A bare import.meta.url here would be baked in at build time.)
      return new URL('ultra-card.js', __webpack_public_path__).toString();
    } catch {
      return undefined;
    }
  })();
  if (!entryUrl) return 'unknown';
  const status = await probe(entryUrl);
  if (status === undefined) return 'offline';
  return status >= 200 && status < 400 ? 'version-skew' : 'unknown';
}

function messageFor(kind: ChunkLoadFailureKind): string {
  switch (kind) {
    case 'version-skew':
      return 'Ultra Card was updated. Reload the page to finish.';
    case 'offline':
      return 'Ultra Card could not load part of this card. Check your connection and reload.';
    default:
      return 'Ultra Card could not load part of this card. Reload the page to try again.';
  }
}

function reload(): void {
  try {
    window.location.reload();
  } catch {
    /* ignore */
  }
}

/** Prefer Home Assistant's own toast (reload action, dismissable); fall back to ours. */
function showToast(message: string): void {
  const haRoot = document.querySelector('home-assistant');
  if (haRoot) {
    try {
      haRoot.dispatchEvent(
        new CustomEvent('hass-notification', {
          bubbles: true,
          composed: true,
          detail: {
            id: 'ultra-card-chunk-load',
            message,
            duration: -1,
            dismissable: true,
            action: { text: 'Reload', action: reload },
          },
        })
      );
      return;
    } catch {
      /* fall through */
    }
  }
  ucToastService.show({
    message,
    type: 'warning',
    duration: 0,
    action: { label: 'Reload', onClick: reload },
  });
}

/**
 * Report a failed lazy import. Returns `true` when the error was a chunk-load
 * failure (so callers can adjust their own UI), `false` for anything else.
 * Only the first failure per page shows a toast; later ones are logged.
 */
export function reportChunkLoadFailure(err: unknown, context: string): boolean {
  if (!isChunkLoadError(err)) return false;
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;

  if (notified) {
    console.warn(`[UltraCard] Chunk load failed (${context}); reload pending.`, err);
    return true;
  }
  notified = true;

  void classifyFailure(err).then(kind => {
    console.warn(`[UltraCard] Chunk load failed (${context}): ${kind}.`, err);
    showToast(messageFor(kind));
  });
  return true;
}

/** Test-only: forget that a toast was shown. */
export function __resetChunkLoadReporterForTests(): void {
  notified = false;
}
