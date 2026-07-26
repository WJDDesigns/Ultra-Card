/**
 * Runtime flags for lazy-loading behavior.
 * Set via window or localStorage for emergency rollback during rollout.
 */

export function isLazyModulesEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const w = window as Window & { __ultraCardLazyModules?: boolean | string };
  if (w.__ultraCardLazyModules === false || w.__ultraCardLazyModules === 'false') {
    return false;
  }
  try {
    const ls = localStorage.getItem('ultra-card-lazy-modules');
    if (ls === 'false' || ls === '0') return false;
  } catch {
    /* private mode */
  }
  return true;
}

export function isLazyEditorEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const w = window as Window & { __ultraCardLazyEditor?: boolean | string };
  if (w.__ultraCardLazyEditor === false || w.__ultraCardLazyEditor === 'false') {
    return false;
  }
  try {
    const ls = localStorage.getItem('ultra-card-lazy-editor');
    if (ls === 'false' || ls === '0') return false;
  } catch {
    /* private mode */
  }
  return true;
}
