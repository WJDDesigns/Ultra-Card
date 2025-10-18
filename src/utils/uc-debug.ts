// Ultra Card lightweight debug utility for 3rd-party limit flow
// Enable via window.__UC_DEBUG_3P = true in the browser console.

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
