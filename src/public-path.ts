/**
 * Guard webpack's chunk/asset base URL.
 *
 * Must be the first import of every entry point. Home Assistant loads Lovelace
 * resources with a dynamic import() (no <script> tag), so the only location
 * signal is import.meta.url, e.g.
 *   https://ha.local/hacsfiles/Ultra-Card/ultra-card.js?hacstag=123
 * With `output.module` and `publicPath: 'auto'`, webpack's own runtime derives
 *   https://ha.local/hacsfiles/Ultra-Card/
 * from it (query and filename stripped) before any module code runs. Chunks are
 * loaded by relative import() regardless; the public path matters for the
 * Dynamic Weather worker and other asset URLs, which are `publicPath + file`.
 *
 * Do NOT "pin" the path with `new URL('./', import.meta.url)` here: webpack
 * treats that literal as an asset reference, resolves './' to src/index.ts,
 * emits it as a hashed .ts asset and sets the public path to that *file*, so
 * every `publicPath + file` concatenation 404s (3.10.0-beta1 shipped that).
 * A bare `import.meta.url` is no better: it is replaced at build time with a
 * file:// path. `scripts/check-bundle.js` fails the build on both.
 *
 * What is left here is a defensive normalisation: if the runtime value ever
 * ends in a filename or carries a query, reduce it to its directory.
 */
declare let __webpack_public_path__: string;

try {
  const current = __webpack_public_path__;
  if (typeof current === 'string' && current.length > 0 && !current.endsWith('/')) {
    __webpack_public_path__ = current.replace(/[?#].*$/, '').replace(/\/[^/]*$/, '/');
  }
} catch {
  /* leave webpack's automatic publicPath in place */
}

export {};
