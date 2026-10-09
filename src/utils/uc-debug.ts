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
