/* eslint-disable */
declare let __webpack_public_path__: string;

// Determine the base URL for lazy-loaded chunks.
// HA loads custom cards via dynamic <script> tags or import(), so
// document.currentScript is often null by the time webpack's auto-detection runs.
// We explicitly find our script tag and extract the directory portion.
try {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[src*="ultra-card"]'
  );
  if (scripts.length > 0) {
    const src = scripts[scripts.length - 1].src;
    __webpack_public_path__ = src.substring(0, src.lastIndexOf('/') + 1);
  }
} catch (_) {
  // Fall back to webpack's auto-detection
}
