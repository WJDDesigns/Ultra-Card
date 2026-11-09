/**
 * Retry a lazy chunk under a fresh URL.
 *
 * Browsers remember a failed module fetch for the life of the page: a second
 * `import()` of the same URL rejects straight away without touching the
 * network. webpack does clear its own record of the failed chunk, so retrying
 * the same `import()` looked like a retry but never sent a request (a locale
 * chunk dropped once stayed missing until a reload).
 *
 * webpack builds each chunk URL through `__webpack_get_script_filename__`, which
 * may be reassigned. While `loadWithCacheBust()` runs its loader, that hook adds
 * `?uc_retry=<n>` so the browser sees a new URL. The import URL is computed
 * synchronously inside the `import()` call, so the suffix only touches the
 * chunks this loader asks for.
 */

declare let __webpack_get_script_filename__: ((chunkId: string | number) => string) | undefined;

let suffix = '';
let installed = false;

function install(): boolean {
  if (installed) return true;
  try {
    if (typeof __webpack_get_script_filename__ !== 'function') return false;
    const original = __webpack_get_script_filename__;
    __webpack_get_script_filename__ = (chunkId: string | number) => {
      const file = original(chunkId);
      return suffix ? `${file}${file.includes('?') ? '&' : '?'}${suffix}` : file;
    };
    installed = true;
    return true;
  } catch {
    // Not running under webpack (tests); a plain call is all we can do.
    return false;
  }
}

/** Run `load` so that any chunk it imports is requested under a new URL. */
export function loadWithCacheBust<T>(attempt: number, load: () => Promise<T>): Promise<T> {
  if (!install()) return load();
  suffix = `uc_retry=${attempt}-${Date.now().toString(36)}`;
  try {
    return load();
  } finally {
    suffix = '';
  }
}
