// Ultra Card lightweight debug utility for 3rd-party limit flow
// Enable via window.__UC_DEBUG_3P = true in the browser console.

/**
 * Gate for verbose diagnostic logging. Off unless someone asks for it, so a
 * normal dashboard session leaves the console clean.
 *
 * Enable with `window.__UC_DEBUG = true` before the card loads, or
 * `localStorage.setItem('uc_debug', 'true')` to have it survive a reload —
 * useful when asking a user to reproduce something.
 *
 * Guard call sites with `UC_DEBUG && console.log(...)`: short-circuiting means
 * the arguments are never built when logging is off, so formatting work like
 * JSON.stringify costs nothing in the common case.
 */
export const UC_DEBUG: boolean = (() => {
  try {
    if ((window as any).__UC_DEBUG) return true;
    const v = localStorage.getItem('uc_debug');
    return v === '1' || v === 'true';
  } catch {
    return false;
  }
})();

export function is3pDebugEnabled(): boolean {
  // Debug is disabled by default - uncomment the line below to enable
  // return true;

  // Enable via window.__UC_DEBUG_3P = true in browser console
  // or localStorage.setItem('uc_debug_3p', 'true')
  try {
    if ((window as any).__UC_DEBUG_3P) return true;
    const v = localStorage.getItem('uc_debug_3p');
    return v === '1' || v === 'true';
  } catch {
    return false;
  }
}

const lastLogAt: Record<string, number> = {};

function getThrottleMs(defaultMs = 400): number {
  try {
    const override = (window as any).__UC_DEBUG_3P_T;
    if (override === 0) return 0;
    if (typeof override === 'number' && override >= 0) return override;
  } catch {}
  return defaultMs;
}

export function dbg3p(tag: string, data?: unknown, throttleMs = 400): void {
  // DEBUG DISABLED - uncomment the line below to re-enable
  // if (!is3pDebugEnabled()) return;
  return; // Force disable all debug logs

  const now = Date.now();
  throttleMs = getThrottleMs(throttleMs);
  const last = lastLogAt[tag] || 0;
  if (now - last < throttleMs) return; // throttle
  lastLogAt[tag] = now;
  try {
    if (data !== undefined) {
      console.log(`[UC-3P] ${tag}`, data);
    } else {
      console.log(`[UC-3P] ${tag}`);
    }
  } catch {
    // ignore
  }
}
