import { reportChunkLoadFailure } from '../utils/uc-chunk-load-error';
import { loadWithCacheBust } from '../utils/uc-chunk-retry';

/**
 * Every locale, English included, is its own chunk fetched the first time
 * `localize()` is asked for that language (`preloadDefaultLocale()` starts the
 * English fetch at card bootstrap). Until a chunk arrives, lookups return the
 * inline fallback each call site carries, which for English is the same text
 * the dictionary holds; when it lands, `UC_LOCALE_LOADED_EVENT` fires so live
 * cards and editors re-render with the dictionary strings.
 *
 * English used to ship inside the core bundle. Moving it out saves ~210 KB of
 * `ultra-card.js` (60 KB gzipped) for every dashboard.
 */

type Dict = Record<string, unknown>;
type LocaleModule = Dict & { default?: Dict };

/**
 * Each language ships as two chunks (issue #281). The runtime part holds the
 * strings dashboards draw; the editor part (about 85% of the file) is fetched
 * only once the visual editor or the Hub panel calls `enableEditorLocales()`.
 * scripts/lib/locale-split.js decides which key goes where.
 */
const localeLoaders: Record<string, () => Promise<LocaleModule>> = {
  en: () => import(/* webpackChunkName: "locale-en" */ '../translations/en.json?part=runtime'),
  ca: () => import(/* webpackChunkName: "locale-ca" */ '../translations/ca.json?part=runtime'),
  cs: () => import(/* webpackChunkName: "locale-cs" */ '../translations/cs.json?part=runtime'),
  da: () => import(/* webpackChunkName: "locale-da" */ '../translations/da.json?part=runtime'),
  de: () => import(/* webpackChunkName: "locale-de" */ '../translations/de.json?part=runtime'),
  'en-GB': () => import(/* webpackChunkName: "locale-en-GB" */ '../translations/en-GB.json?part=runtime'),
  es: () => import(/* webpackChunkName: "locale-es" */ '../translations/es.json?part=runtime'),
  fr: () => import(/* webpackChunkName: "locale-fr" */ '../translations/fr.json?part=runtime'),
  it: () => import(/* webpackChunkName: "locale-it" */ '../translations/it.json?part=runtime'),
  nb: () => import(/* webpackChunkName: "locale-nb" */ '../translations/nb.json?part=runtime'),
  nl: () => import(/* webpackChunkName: "locale-nl" */ '../translations/nl.json?part=runtime'),
  nn: () => import(/* webpackChunkName: "locale-nn" */ '../translations/nn.json?part=runtime'),
  no: () => import(/* webpackChunkName: "locale-no" */ '../translations/no.json?part=runtime'),
  pl: () => import(/* webpackChunkName: "locale-pl" */ '../translations/pl.json?part=runtime'),
  sv: () => import(/* webpackChunkName: "locale-sv" */ '../translations/sv.json?part=runtime'),
  // Home Assistant reports Simplified Chinese as `zh-Hans`; the resolver strips
  // the region so both `zh` and `zh-Hans` land here.
  zh: () => import(/* webpackChunkName: "locale-zh" */ '../translations/zh.json?part=runtime'),
};

const editorLocaleLoaders: Record<string, () => Promise<LocaleModule>> = {
  en: () => import(/* webpackChunkName: "locale-en-editor" */ '../translations/en.json?part=editor'),
  ca: () => import(/* webpackChunkName: "locale-ca-editor" */ '../translations/ca.json?part=editor'),
  cs: () => import(/* webpackChunkName: "locale-cs-editor" */ '../translations/cs.json?part=editor'),
  da: () => import(/* webpackChunkName: "locale-da-editor" */ '../translations/da.json?part=editor'),
  de: () => import(/* webpackChunkName: "locale-de-editor" */ '../translations/de.json?part=editor'),
  'en-GB': () => import(/* webpackChunkName: "locale-en-GB-editor" */ '../translations/en-GB.json?part=editor'),
  es: () => import(/* webpackChunkName: "locale-es-editor" */ '../translations/es.json?part=editor'),
  fr: () => import(/* webpackChunkName: "locale-fr-editor" */ '../translations/fr.json?part=editor'),
  it: () => import(/* webpackChunkName: "locale-it-editor" */ '../translations/it.json?part=editor'),
  nb: () => import(/* webpackChunkName: "locale-nb-editor" */ '../translations/nb.json?part=editor'),
  nl: () => import(/* webpackChunkName: "locale-nl-editor" */ '../translations/nl.json?part=editor'),
  nn: () => import(/* webpackChunkName: "locale-nn-editor" */ '../translations/nn.json?part=editor'),
  no: () => import(/* webpackChunkName: "locale-no-editor" */ '../translations/no.json?part=editor'),
  pl: () => import(/* webpackChunkName: "locale-pl-editor" */ '../translations/pl.json?part=editor'),
  sv: () => import(/* webpackChunkName: "locale-sv-editor" */ '../translations/sv.json?part=editor'),
  zh: () => import(/* webpackChunkName: "locale-zh-editor" */ '../translations/zh.json?part=editor'),
};

const DEFAULT_LANG = 'en';

export const UC_LOCALE_LOADED_EVENT = 'uc-locale-loaded';

const languages: Record<string, Dict> = {};
const pending = new Map<string, Promise<void>>();
/** Language -> time of the last failed load, so a later call can try again. */
const failedAt = new Map<string, number>();

/**
 * Waits between attempts at one locale chunk. A single dropped request (phone
 * waking up, HA restarting, flaky Wi-Fi) used to leave the dictionary missing
 * until a page reload and showed a reload toast for a failure nobody could see.
 */
let retryDelaysMs: readonly number[] = [1500, 5000];
/** After every attempt failed, wait this long before a render may try again. */
let failureCooldownMs = 60_000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function isCoolingDown(key: string): boolean {
  const at = failedAt.get(key);
  return at !== undefined && Date.now() - at < failureCooldownMs;
}

async function loadWithRetry(
  key: string,
  loaders: Record<string, () => Promise<LocaleModule>> = localeLoaders
): Promise<LocaleModule> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
    if (attempt > 0) await sleep(retryDelaysMs[attempt - 1]);
    try {
      // A retry must use a new URL: the browser remembers the failed one.
      return await (attempt === 0 ? loaders[key]() : loadWithCacheBust(attempt, loaders[key]));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/** Every language that can be served, loaded or not. */
export const SUPPORTED_LANGUAGES: readonly string[] = Object.freeze(Object.keys(localeLoaders));

function baseOf(lang: string): string {
  return lang.includes('-') || lang.includes('_') ? lang.split(/[-_]/)[0] : lang;
}

/** Resolve a hass language to the loader key we ship, or undefined if we have none. */
function resolveLoaderKey(lang: string): string | undefined {
  if (!lang) return undefined;
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
 * is available, or immediately for unknown / already-loaded languages. Never
 * rejects: on failure the inline fallbacks (English) stay in use.
 */
export function ensureLocaleLoaded(lang: string): Promise<void> {
  const key = resolveLoaderKey(lang);
  if (key && editorWanted) void ensureEditorPartLoaded(key);
  if (!key || languages[key] || isCoolingDown(key)) return Promise.resolve();

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const p = loadWithRetry(key)
    .then(mod => {
      languages[key] = unwrap(mod);
      pending.delete(key);
      failedAt.delete(key);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(UC_LOCALE_LOADED_EVENT, { detail: { lang: key } }));
      }
    })
    .catch(err => {
      pending.delete(key);
      // Don't hammer the network on every render; try again after the cooldown.
      failedAt.set(key, Date.now());
      // Every call site carries its English text, so a missing dictionary changes
      // nothing on screen for English and leaves other languages in English.
      // Log it, but keep the reload toast for failures the user can see.
      reportChunkLoadFailure(err, `locale ${key}`, { notify: false });
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Ultra Card: failed to load locale "${key}"`, err);
      }
    });
  pending.set(key, p);
  return p;
}

/** Editor dictionaries, kept apart so the runtime ones stay small and testable. */
const editorLanguages: Record<string, Dict> = {};
const editorPending = new Map<string, Promise<void>>();
let editorWanted = false;

function ensureEditorPartLoaded(key: string): Promise<void> {
  const cooldownKey = `${key}:editor`;
  if (editorLanguages[key] || !editorLocaleLoaders[key] || isCoolingDown(cooldownKey)) {
    return Promise.resolve();
  }
  const inflight = editorPending.get(key);
  if (inflight) return inflight;
  const p = loadWithRetry(key, editorLocaleLoaders)
    .then(mod => {
      editorLanguages[key] = unwrap(mod);
      editorPending.delete(key);
      failedAt.delete(cooldownKey);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(UC_LOCALE_LOADED_EVENT, { detail: { lang: key } }));
      }
    })
    .catch(err => {
      editorPending.delete(key);
      failedAt.set(cooldownKey, Date.now());
      reportChunkLoadFailure(err, `locale ${key} (editor)`, { notify: false });
    });
  editorPending.set(key, p);
  return p;
}

/**
 * Call when the visual editor or the Hub panel opens. From then on every
 * language that gets loaded also fetches its editor strings, starting with
 * English and any language already in use. Resolves when those have landed
 * (never rejects; failures fall back to the inline English text).
 */
export function enableEditorLocales(lang?: string): Promise<void> {
  editorWanted = true;
  const keys = new Set<string>([DEFAULT_LANG, ...Object.keys(languages), ...pending.keys()]);
  const extra = lang ? resolveLoaderKey(lang) : undefined;
  if (extra) keys.add(extra);
  return Promise.all([...keys].map(k => ensureEditorPartLoaded(k))).then(() => undefined);
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

function lookup(dict: Dict | undefined, key: string): string | undefined {
  if (!dict) return undefined;
  const value = key.split('.').reduce<unknown>((obj, part) => {
    if (obj === null || typeof obj !== 'object') return undefined;
    return (obj as Dict)[part];
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    return lookup(languages[lang], key) ?? lookup(editorLanguages[lang], key);
  } catch {
    return undefined;
  }
}

/** Start fetching the English dictionary; called once at card / panel bootstrap. */
export function preloadDefaultLocale(): Promise<void> {
  return ensureLocaleLoaded(DEFAULT_LANG);
}

export function localize(key: string, lang: string, fallback?: string): string {
  // Kick off the chunk fetch the first time any caller asks for this language.
  // Synchronous callers get the inline fallback until it lands; the event
  // triggers a re-render. English is always wanted as the last resort.
  if (lang && !isLocaleLoaded(lang)) {
    void ensureLocaleLoaded(lang);
  }
  if (!languages[DEFAULT_LANG] && !pending.has(DEFAULT_LANG) && !isCoolingDown(DEFAULT_LANG)) {
    void ensureLocaleLoaded(DEFAULT_LANG);
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
  for (const k of [...pending.keys()]) {
    if (k !== DEFAULT_LANG) pending.delete(k);
  }
  for (const k of Object.keys(editorLanguages)) delete editorLanguages[k];
  editorPending.clear();
  editorWanted = false;
  failedAt.clear();
  retryDelaysMs = [1500, 5000];
  failureCooldownMs = 60_000;
}

/** Test-only: swap a locale loader and the retry timings. Returns a restore function. */
export function __setLocaleLoaderForTests(
  key: string,
  loader: () => Promise<LocaleModule>,
  timings: { retryDelaysMs?: number[]; failureCooldownMs?: number } = {}
): () => void {
  const original = localeLoaders[key];
  localeLoaders[key] = loader;
  if (timings.retryDelaysMs) retryDelaysMs = timings.retryDelaysMs;
  if (timings.failureCooldownMs !== undefined) failureCooldownMs = timings.failureCooldownMs;
  return () => {
    localeLoaders[key] = original;
  };
}

/**
 * Language of the current HA user, for elements that are not handed `hass`
 * (dialogs and pickers appended to the page). Falls back to English.
 */
export function uiLanguage(): string {
  try {
    const ha = document.querySelector('home-assistant') as
      | (HTMLElement & { hass?: { locale?: { language?: string }; language?: string } })
      | null;
    return ha?.hass?.locale?.language || ha?.hass?.language || 'en';
  } catch {
    return 'en';
  }
}
