/**
 * Memoized dynamic import boundary for the visual editor.
 * The editor (layout tab, design tabs, CodeMirror, TipTap) ships as its own
 * chunk and is only fetched when Home Assistant calls getConfigElement().
 * A failed fetch clears the memo so the next attempt retries the network.
 */

import { reportChunkLoadFailure } from '../utils/uc-chunk-load-error';
import { enableEditorLocales, uiLanguage } from '../localize/localize';

let loadPromise: Promise<typeof import('./ultra-card-editor')> | undefined;

export function loadUltraCardEditor(): Promise<typeof import('./ultra-card-editor')> {
  if (!loadPromise) {
    // Editor strings are their own locale chunks (dashboards never load them).
    // Fetching them alongside the (much larger) editor chunk means the
    // editor's first paint already has them, so labels never flip from an
    // inline fallback to the dictionary text.
    const english = enableEditorLocales(uiLanguage());
    loadPromise = import(/* webpackChunkName: "editor" */ './ultra-card-editor')
      .then(async mod => {
        await english;
        return mod;
      })
      .catch(err => {
        loadPromise = undefined;
        reportChunkLoadFailure(err, 'editor');
        throw err;
      });
  }
  return loadPromise;
}

/** Test-only: clear the memoized promise between tests. */
export function __resetUltraCardEditorLoaderForTests(): void {
  loadPromise = undefined;
}
