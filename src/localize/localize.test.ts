/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  localize,
  ensureLocaleLoaded,
  isLocaleLoaded,
  onLocaleLoaded,
  UC_LOCALE_LOADED_EVENT,
  __resetLocalesForTests,
} from './localize';

const KEY = 'editor.tabs.settings'; // en: "Settings", de: "Einstellungen"

describe('localize lazy locales', () => {
  beforeEach(() => {
    __resetLocalesForTests();
  });

  it('serves English synchronously without any chunk', () => {
    expect(isLocaleLoaded('en')).toBe(true);
    expect(localize(KEY, 'en')).not.toBe(KEY);
  });

  it('falls back to English until the locale chunk arrives, then translates', async () => {
    expect(isLocaleLoaded('de')).toBe(false);
    const english = localize(KEY, 'en');
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
    await expect(ensureLocaleLoaded('xx')).resolves.toBeUndefined();
    expect(isLocaleLoaded('xx')).toBe(true);
    expect(localize(KEY, 'xx')).toBe(localize(KEY, 'en'));
  });
});
