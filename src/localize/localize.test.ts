/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  enableEditorLocales,
  localize,
  ensureLocaleLoaded,
  isLocaleLoaded,
  onLocaleLoaded,
  preloadDefaultLocale,
  UC_LOCALE_LOADED_EVENT,
  __resetLocalesForTests,
  __setLocaleLoaderForTests,
} from './localize';

// A key dashboards draw: it ships in the runtime chunk.
const KEY = 'editor.theme.none'; // en: "None", de: "Keine"
// An editor-only key: it ships in the editor chunk (issue #281).
const EDITOR_KEY = 'editor.tabs.settings'; // en: "Settings", de: "Einstellungen"

describe('localize lazy locales', () => {
  beforeEach(() => {
    __resetLocalesForTests();
  });

  it('serves the inline fallback until the English chunk lands, then the dictionary', async () => {
    // English is a chunk like every other locale; a call site's fallback is what
    // renders in the meantime, and the raw key only when there is no fallback.
    const before = localize(KEY, 'en', 'Fallback');
    expect(['Fallback', 'None']).toContain(before);
    await preloadDefaultLocale();
    expect(isLocaleLoaded('en')).toBe(true);
    expect(localize(KEY, 'en')).toBe('None');
    expect(localize(KEY, 'en', 'Fallback')).toBe('None');
  });

  it('falls back to English until the locale chunk arrives, then translates', async () => {
    await preloadDefaultLocale();
    expect(isLocaleLoaded('de')).toBe(false);
    const english = localize(KEY, 'en');
    expect(english).toBe('None');
    // First call kicks off the fetch and returns the English string.
    expect(localize(KEY, 'de')).toBe(english);

    await ensureLocaleLoaded('de');
    expect(isLocaleLoaded('de')).toBe(true);
    const german = localize(KEY, 'de');
    expect(german).not.toBe(english);
    expect(german).toBe('Keine');
  });

  it('keeps editor strings out of the runtime chunk until the editor asks for them', async () => {
    await preloadDefaultLocale();
    await ensureLocaleLoaded('de');
    // Dashboards: the editor key is not in the runtime chunk, so the call
    // site's fallback (or the key) is used.
    expect(localize(EDITOR_KEY, 'de', 'Fallback')).toBe('Fallback');

    await enableEditorLocales('de');
    expect(localize(EDITOR_KEY, 'en')).toBe('Settings');
    expect(localize(EDITOR_KEY, 'de')).toBe('Einstellungen');
    // Runtime strings still resolve after the merge.
    expect(localize(KEY, 'de')).toBe('Keine');
  });

  it('loads editor strings for languages requested after the editor opened', async () => {
    await enableEditorLocales();
    await ensureLocaleLoaded('fr');
    // ensureLocaleLoaded starts the editor part too; wait for it.
    await enableEditorLocales('fr');
    expect(localize(EDITOR_KEY, 'fr')).not.toBe('Settings');
  });

  it('resolves regional codes to the shipped base locale', async () => {
    await ensureLocaleLoaded('de-AT');
    expect(isLocaleLoaded('de-AT')).toBe(true);
    expect(isLocaleLoaded('de')).toBe(true);
  });

  it('dispatches a window event and notifies subscribers once loaded', async () => {
    const seen: string[] = [];
    const unsub = onLocaleLoaded(lang => seen.push(lang));
    const spy = vi.fn();
    window.addEventListener(UC_LOCALE_LOADED_EVENT, spy);

    await ensureLocaleLoaded('fr');

    expect(seen).toEqual(['fr']);
    expect(spy).toHaveBeenCalledTimes(1);
    unsub();
    window.removeEventListener(UC_LOCALE_LOADED_EVENT, spy);
  });

  it('shares one in-flight promise per locale', () => {
    const a = ensureLocaleLoaded('es');
    const b = ensureLocaleLoaded('es');
    expect(a).toBe(b);
    return a;
  });

  it('is a no-op for unknown languages', async () => {
    await preloadDefaultLocale();
    await expect(ensureLocaleLoaded('xx')).resolves.toBeUndefined();
    expect(isLocaleLoaded('xx')).toBe(true);
    expect(localize(KEY, 'xx')).toBe(localize(KEY, 'en'));
  });

  describe('when a locale chunk fails to load', () => {
    const chunkError = () =>
      new TypeError(
        'Failed to fetch dynamically imported module: http://ha/hacsfiles/Ultra-Card/uc-locale-pl.12345678.js'
      );

    it('retries and recovers from a dropped request without a reload', async () => {
      let calls = 0;
      const restore = __setLocaleLoaderForTests(
        'pl',
        async () => {
          calls++;
          if (calls === 1) throw chunkError();
          return { default: { editor: { theme: { none: 'Brak' } } } };
        },
        { retryDelaysMs: [1, 1] }
      );
      try {
        await ensureLocaleLoaded('pl');
        expect(calls).toBe(2);
        expect(isLocaleLoaded('pl')).toBe(true);
        expect(localize(KEY, 'pl')).toBe('Brak');
      } finally {
        restore();
      }
    });

    it('keeps the inline text, logs without a toast, and tries again after the cooldown', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubGlobal('fetch', vi.fn(async () => ({ status: 200 }) as Response));
      let calls = 0;
      const restore = __setLocaleLoaderForTests(
        'pl',
        async () => {
          calls++;
          throw chunkError();
        },
        { retryDelaysMs: [1, 1], failureCooldownMs: 30 }
      );
      try {
        await expect(ensureLocaleLoaded('pl')).resolves.toBeUndefined();
        expect(calls).toBe(3);
        expect(isLocaleLoaded('pl')).toBe(false);
        expect(localize('some.key', 'pl', 'Inline text')).toBe('Inline text');
        // Within the cooldown nothing is refetched.
        await ensureLocaleLoaded('pl');
        expect(calls).toBe(3);
        await new Promise(r => setTimeout(r, 10));
        expect(document.getElementById('uc-toast-live-region')).toBeNull();
        expect(warn.mock.calls.some(c => String(c[0]).includes('locale pl'))).toBe(true);

        await new Promise(r => setTimeout(r, 40));
        await ensureLocaleLoaded('pl');
        expect(calls).toBe(6);
      } finally {
        restore();
        vi.unstubAllGlobals();
        warn.mockRestore();
      }
    });
  });
});
