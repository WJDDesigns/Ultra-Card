/**
 * Memoized dynamic import boundary for the visual editor.
 * The editor (layout tab, design tabs, CodeMirror, TipTap) ships as its own
 * chunk and is only fetched when Home Assistant calls getConfigElement().
 * A failed fetch clears the memo so the next attempt retries the network.
 */

let loadPromise: Promise<typeof import('./ultra-card-editor')> | undefined;

export function loadUltraCardEditor(): Promise<typeof import('./ultra-card-editor')> {
  if (!loadPromise) {
    loadPromise = import(/* webpackChunkName: "editor" */ './ultra-card-editor').catch(err => {
      loadPromise = undefined;
      throw err;
    });
  }
  return loadPromise;
}

/** Test-only: clear the memoized promise between tests. */
export function __resetUltraCardEditorLoaderForTests(): void {
  loadPromise = undefined;
}
