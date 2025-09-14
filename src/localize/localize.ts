import * as en from '../translations/en.json';
import * as cs from '../translations/cs.json';
import * as da from '../translations/da.json';
import * as de from '../translations/de.json';
import * as enGB from '../translations/en-GB.json';
import * as es from '../translations/es.json';
import * as fr from '../translations/fr.json';
import * as it from '../translations/it.json';
import * as nb from '../translations/nb.json';
import * as nl from '../translations/nl.json';
import * as nn from '../translations/nn.json';
import * as no from '../translations/no.json';
import * as pl from '../translations/pl.json';
import * as sv from '../translations/sv.json';

const languages: Record<string, unknown> = {
  en,
  cs,
  da,
  de,
  'en-GB': enGB,
  es,
  fr,
  it,
  nb,
  nl,
  nn,
  no,
  pl,
  sv,
};

const DEFAULT_LANG = 'en';

function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    const dict = languages[lang] as Record<string, unknown> | undefined;
    if (!dict) return undefined;
    return key.split('.').reduce((obj, part) => (obj as any)?.[part], dict) as string | undefined;
  } catch {
    return undefined;
  }
}

export function localize(key: string, lang: string, fallback?: string): string {
  // Try full locale first (e.g., es-ES)
  let v = getTranslatedString(key, lang);
  if (v) return v;

  // Try base language if region is present (es-ES -> es)
  const baseLang = lang.includes('-') || lang.includes('_') ? lang.split(/[-_]/)[0] : lang;
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
