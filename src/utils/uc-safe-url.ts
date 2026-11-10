/**
 * URL checks for anything Ultra Card opens or navigates to on the user's behalf.
 *
 * `window.open(url)` and `location.assign(url)` execute `javascript:` URLs in
 * the dashboard's origin, with access to the Home Assistant session. Action URLs
 * are config values, and config can come from a downloaded preset, pasted YAML or
 * a template result, so they are checked before use.
 *
 * This is a denylist on purpose. People point URL actions at app deep links
 * (`tel:`, `spotify:`, `homeassistant://`, `intent://`), and an allowlist would
 * break those. Only schemes that run script or render attacker-chosen documents
 * in our origin are refused.
 */
const BLOCKED_PROTOCOLS = new Set(['javascript:', 'data:', 'vbscript:', 'blob:', 'file:']);

/**
 * The URL to hand to the browser, or `null` when it must not be opened.
 *
 * The protocol is read from the browser's own URL parser rather than matched
 * with a regex, because the parser ignores tabs, newlines and leading control
 * characters ("java\tscript:" is `javascript:`), and a regex would not.
 * Relative paths are fine and are returned unchanged.
 */
export function safeActionUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!url) return null;
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';
    const parsed = new URL(url, base);
    if (BLOCKED_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
      console.warn(`[UltraCard] Blocked a ${parsed.protocol} link in an action.`);
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/** Open an action URL in the same tab or a new one. Returns false if it was refused. */
export function openActionUrl(value: unknown, target: '_self' | '_blank' = '_blank'): boolean {
  const url = safeActionUrl(value);
  if (!url) return false;
  if (target === '_self') {
    window.location.assign(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
  return true;
}
