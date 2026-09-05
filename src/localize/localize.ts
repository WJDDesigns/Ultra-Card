import * as en from '../translations/en.json';

/**
 * English ships inside the core bundle. Every other locale is its own chunk,
 * fetched the first time `localize()` is asked for that language. Until the
 * chunk arrives, lookups fall back to English exactly as they always did for
 * missing keys; when it lands, `UC_LOCALE_LOADED_EVENT` fires so live cards
 * and editors can re-render with the translated strings.
 */

type Dict = Record<string, unknown>;
type LocaleModule = Dict & { default?: Dict };

const localeLoaders: Record<string, () => Promise<LocaleModule>> = {
  ca: () => import(/* webpackChunkName: "locale-ca" */ '../translations/ca.json'),
  cs: () => import(/* webpackChunkName: "locale-cs" */ '../translations/cs.json'),
  da: () => import(/* webpackChunkName: "locale-da" */ '../translations/da.json'),
  de: () => import(/* webpackChunkName: "locale-de" */ '../translations/de.json'),
  'en-GB': () => import(/* webpackChunkName: "locale-en-GB" */ '../translations/en-GB.json'),
  es: () => import(/* webpackChunkName: "locale-es" */ '../translations/es.json'),
  fr: () => import(/* webpackChunkName: "locale-fr" */ '../translations/fr.json'),
  it: () => import(/* webpackChunkName: "locale-it" */ '../translations/it.json'),
  nb: () => import(/* webpackChunkName: "locale-nb" */ '../translations/nb.json'),
  nl: () => import(/* webpackChunkName: "locale-nl" */ '../translations/nl.json'),
  nn: () => import(/* webpackChunkName: "locale-nn" */ '../translations/nn.json'),
  no: () => import(/* webpackChunkName: "locale-no" */ '../translations/no.json'),
  pl: () => import(/* webpackChunkName: "locale-pl" */ '../translations/pl.json'),
  sv: () => import(/* webpackChunkName: "locale-sv" */ '../translations/sv.json'),
};

const DEFAULT_LANG = 'en';

export const UC_LOCALE_LOADED_EVENT = 'uc-locale-loaded';

const languages: Record<string, Dict> = { en: en as unknown as Dict };
const pending = new Map<string, Promise<void>>();
const failed = new Set<string>();

/** Every language that can be served, loaded or not. */
export const SUPPORTED_LANGUAGES: readonly string[] = Object.freeze([
  DEFAULT_LANG,
  ...Object.keys(localeLoaders),
]);

function baseOf(lang: string): string {
  return lang.includes('-') || lang.includes('_') ? lang.split(/[-_]/)[0] : lang;
}

/** Resolve a hass language to the loader key we ship, or undefined if we have none. */
function resolveLoaderKey(lang: string): string | undefined {
  if (!lang || lang === DEFAULT_LANG) return undefined;
  if (localeLoaders[lang]) return lang;
  const base = baseOf(lang);
  if (base !== lang && localeLoaders[base]) return base;
  return undefined;
}

function unwrap(mod: LocaleModule): Dict {
  // JSON chunks expose the object as `default`; the static `en` import is a namespace.
  return (mod && typeof mod.default === 'object' && mod.default) || (mod as Dict);
}

/**
 * Start (or join) the fetch for a language chunk. Resolves once the dictionary
 * is available, or immediately for English / unknown / already-loaded languages.
 */
export function ensureLocaleLoaded(lang: string): Promise<void> {
  const key = resolveLoaderKey(lang);
  if (!key || languages[key] || failed.has(key)) return Promise.resolve();

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const p = localeLoaders[key]()
    .then(mod => {
      languages[key] = unwrap(mod);
      pending.delete(key);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(UC_LOCALE_LOADED_EVENT, { detail: { lang: key } }));
      }
    })
    .catch(err => {
      pending.delete(key);
      // Don't hammer the network on every render; English fallback is acceptable.
      failed.add(key);
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Ultra Card: failed to load locale "${key}"`, err);
      }
    });
  pending.set(key, p);
  return p;
}

/** True once the dictionary for `lang` (or its base language) is in memory. */
export function isLocaleLoaded(lang: string): boolean {
  const key = resolveLoaderKey(lang);
  return !key || !!languages[key];
}

/**
 * Subscribe to locale arrivals. Returns an unsubscribe function. Components
 * that render translated strings call `requestUpdate()` from the callback.
 */
export function onLocaleLoaded(callback: (lang: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => callback((e as CustomEvent<{ lang: string }>).detail?.lang ?? '');
  window.addEventListener(UC_LOCALE_LOADED_EVENT, handler);
  return () => window.removeEventListener(UC_LOCALE_LOADED_EVENT, handler);
}

function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    const dict = languages[lang];
    if (!dict) return undefined;
    const value = key.split('.').reduce<unknown>((obj, part) => {
      if (obj === null || typeof obj !== 'object') return undefined;
      return (obj as Dict)[part];
    }, dict);
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

export function localize(key: string, lang: string, fallback?: string): string {
  // Kick off the chunk fetch the first time any caller asks for this language.
  // Synchronous callers get English until it lands; the event triggers a re-render.
  if (lang && lang !== DEFAULT_LANG && !isLocaleLoaded(lang)) {
    void ensureLocaleLoaded(lang);
  }

  // Try full locale first (e.g., es-ES)
  let v = getTranslatedString(key, lang);
  if (v) return v;

  // Try base language if region is present (es-ES -> es)
  const baseLang = baseOf(lang);
  if (baseLang && baseLang !== lang) {
    v = getTranslatedString(key, baseLang);
    if (v) return v;
  }

  // Fallback to English
  if (baseLang !== DEFAULT_LANG) {
    const enV = getTranslatedString(key, DEFAULT_LANG);
    if (enV) return enV;
  }
  return fallback || key;
}

export function hasTranslation(key: string): boolean {
  return getTranslatedString(key, DEFAULT_LANG) !== undefined;
}

export function logMissingTranslation(key: string, fallback?: string): void {
  if (process.env.NODE_ENV !== 'production' && !hasTranslation(key)) {
    console.warn(`Missing translation: ${key}${fallback ? ` (fallback: ${fallback})` : ''}`);
  }
}

export function localizeWithLogging(key: string, lang: string, fallback?: string): string {
  logMissingTranslation(key, fallback);
  return localize(key, lang, fallback);
}

/** Test-only: drop every non-English dictionary and pending/failed state. */
export function __resetLocalesForTests(): void {
  for (const k of Object.keys(languages)) {
    if (k !== DEFAULT_LANG) delete languages[k];
  }
  pending.clear();
  failed.clear();
}
