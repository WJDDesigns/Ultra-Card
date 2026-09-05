/**
 * Memoized dynamic import boundary for the visual editor.
 * The editor (layout tab, design tabs, CodeMirror, TipTap) ships as its own
 * chunk and is only fetched when Home Assistant calls getConfigElement().
 * A failed fetch clears the memo so the next attempt retries the network.
 */

import { reportChunkLoadFailure } from '../utils/uc-chunk-load-error';
import { preloadDefaultLocale } from '../localize/localize';

let loadPromise: Promise<typeof import('./ultra-card-editor')> | undefined;

export function loadUltraCardEditor(): Promise<typeof import('./ultra-card-editor')> {
  if (!loadPromise) {
    // The English dictionary is a chunk too. Fetching it alongside the (much
    // larger) editor chunk means the editor's first paint already has it, so
    // labels never flip from an inline fallback to the dictionary text.
    const english = preloadDefaultLocale();
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
