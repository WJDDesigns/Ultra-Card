/**
 * Memoized dynamic import boundary for the visual editor.
 * Eager-bundled: HACS only distributes ultra-card.js, so the editor cannot
 * live in a separate network-loaded chunk. Keeps the async API surface.
 */

let loadPromise: Promise<typeof import('./ultra-card-editor')> | undefined;

export function loadUltraCardEditor(): Promise<typeof import('./ultra-card-editor')> {
  if (!loadPromise) {
    loadPromise = import(/* webpackMode: "eager" */ './ultra-card-editor');
  }
  return loadPromise;
}

/** Test-only: clear the memoized promise between tests. */
export function __resetUltraCardEditorLoaderForTests(): void {
  loadPromise = undefined;
}
