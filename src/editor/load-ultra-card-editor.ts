/**
 * Memoized dynamic import boundary for the visual editor.
 * Keeps layout-tab / CodeMirror / TipTap out of the view-only dashboard bundle.
 */

let loadPromise: Promise<typeof import('./ultra-card-editor')> | undefined;

export function loadUltraCardEditor(): Promise<typeof import('./ultra-card-editor')> {
  if (!loadPromise) {
    loadPromise = import(/* webpackChunkName: "editor" */ './ultra-card-editor');
  }
  return loadPromise;
}

/** Test-only: clear the memoized promise between tests. */
export function __resetUltraCardEditorLoaderForTests(): void {
  loadPromise = undefined;
}
