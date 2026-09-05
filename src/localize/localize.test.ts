/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  localize,
  ensureLocaleLoaded,
  isLocaleLoaded,
  onLocaleLoaded,
  preloadDefaultLocale,
  UC_LOCALE_LOADED_EVENT,
  __resetLocalesForTests,
} from './localize';

const KEY = 'editor.tabs.settings'; // en: "Settings", de: "Einstellungen"

describe('localize lazy locales', () => {
  beforeEach(() => {
    __resetLocalesForTests();
  });

  it('serves the inline fallback until the English chunk lands, then the dictionary', async () => {
    // English is a chunk like every other locale; a call site's fallback is what
    // renders in the meantime, and the raw key only when there is no fallback.
    const before = localize(KEY, 'en', 'Fallback');
    expect(['Fallback', 'Settings']).toContain(before);
    await preloadDefaultLocale();
    expect(isLocaleLoaded('en')).toBe(true);
    expect(localize(KEY, 'en')).toBe('Settings');
    expect(localize(KEY, 'en', 'Fallback')).toBe('Settings');
  });

  it('falls back to English until the locale chunk arrives, then translates', async () => {
    await preloadDefaultLocale();
    expect(isLocaleLoaded('de')).toBe(false);
    const english = localize(KEY, 'en');
    expect(english).toBe('Settings');
    // First call kicks off the fetch and returns the English string.
    expect(localize(KEY, 'de')).toBe(english);

    await ensureLocaleLoaded('de');
    expect(isLocaleLoaded('de')).toBe(true);
    const german = localize(KEY, 'de');
    expect(german).not.toBe(english);
    expect(german).toBe('Einstellungen');
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
});
