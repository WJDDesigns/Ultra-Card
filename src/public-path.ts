/**
 * Pin webpack's chunk base URL to the directory this module was loaded from.
 *
 * Must be the first import of every entry point. Home Assistant loads Lovelace
 * resources with a dynamic import() (no <script> tag), so the only reliable
 * location signal is import.meta.url, e.g.
 *   https://ha.local/hacsfiles/Ultra-Card/ultra-card.js?hacstag=123
 * `new URL('./', ...)` drops the filename and the ?hacstag query, leaving
 *   https://ha.local/hacsfiles/Ultra-Card/
 * which is where HACS placed every sibling uc-*.js chunk.
 */
declare let __webpack_public_path__: string;

try {
  if (typeof import.meta.url === 'string' && import.meta.url.length > 0) {
    __webpack_public_path__ = new URL('./', import.meta.url).href;
  }
} catch {
  /* leave webpack's automatic publicPath in place */
}

export {};
