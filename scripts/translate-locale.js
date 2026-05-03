/* eslint-disable no-console */
/**
 * Fill locale JSON values that still match English (en.json) using an OpenAI LLM.
 * Preserves {placeholders} and glossary terms from src/translations/_glossary.json
 * via mask/unmask and a strict per-language prompt.
 *
 * Requires OPENAI_API_KEY in the environment. Optional: OPENAI_BASE_URL,
 * OPENAI_MODEL (default gpt-4o-mini).
 *
 * Usage:
 *   node scripts/translate-locale.js --lang de [--limit 100] [--batch-size 20] [--model gpt-4o-mini]
 *   node scripts/translate-locale.js --all [--delay 0] [--dry-run]
 *
 * en-GB is skipped here; use: node scripts/translate-en-gb.js (if/when present).
 */
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { flatten, unflatten } = require('./lib/translation-flat');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'src', 'translations');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function parseArgs(argv) {
  /** @type {{ lang?: string; all?: boolean; delay: number; limit: number; dryRun: boolean; batchSize: number; model: string }} */
  const o = {
    delay: 0,
    limit: Infinity,
    dryRun: false,
    batchSize: 20,
    model: DEFAULT_MODEL,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lang') o.lang = argv[++i];
    else if (a === '--all') o.all = true;
    else if (a === '--delay') o.delay = Number(argv[++i]) || 0;
    else if (a === '--limit') o.limit = Number(argv[++i]) || Infinity;
    else if (a === '--batch-size') o.batchSize = Math.max(1, Number(argv[++i]) || 20);
    else if (a === '--model') o.model = argv[++i] || DEFAULT_MODEL;
    else if (a === '--dry-run') o.dryRun = true;
  }
  return o;
}

function loadGlossary() {
  const p = path.join(dir, '_glossary.json');
  if (!fs.existsSync(p)) return { never_translate: [], per_lang: {} };
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    never_translate: Array.isArray(j.never_translate) ? j.never_translate : [],
    per_lang: j.per_lang && typeof j.per_lang === 'object' ? j.per_lang : {},
  };
}

/**
 * Replace {placeholders} and glossary terms with stable opaque tokens
 * using Unicode private-use sentinels that LLMs reliably pass through.
 * @param {string} s
 * @param {string[]} glossaryTerms
 */
function mask(s, glossaryTerms) {
  /** @type {string[]} */
  const ph = [];
  let t = s.replace(/\{[^{}]+\}/g, m => {
    ph.push(m);
    return `\uE000PH${ph.length}\uE001`;
  });
  /** @type {string[]} */
  const gt = [];
  const sorted = [...glossaryTerms].sort((a, b) => b.length - a.length);
  for (const term of sorted) {
    if (!term || !t.includes(term)) continue;
    gt.push(term);
    const token = `\uE000GT${gt.length}\uE001`;
    t = t.split(term).join(token);
  }
  return { masked: t, ph, gt };
}

/**
 * @param {string} t
 * @param {string[]} ph
 * @param {string[]} gt
 */
function unmask(t, ph, gt) {
  let out = t;
  for (let i = 0; i < gt.length; i++) {
    out = out.split(`\uE000GT${i + 1}\uE001`).join(gt[i]);
  }
  for (let i = 0; i < ph.length; i++) {
    out = out.split(`\uE000PH${i + 1}\uE001`).join(ph[i]);
  }
  return out;
}

/**
 * @param {string} orig
 * @param {string} out
 */
function assertPlaceholdersPreserved(orig, out) {
  const want = [...orig.matchAll(/\{[^{}]+\}/g)].map(m => m[0]);
  for (const p of want) {
    if (!out.includes(p)) {
      throw new Error(
        `Placeholder lost: ${p} in "${orig.slice(0, 120)}" -> "${out.slice(0, 120)}"`
      );
    }
  }
}

/** Locale code → human-readable language name shown to the model. */
const LANG_NAMES = {
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  nl: 'Dutch',
  pl: 'Polish',
  sv: 'Swedish',
  da: 'Danish',
  nb: 'Norwegian Bokmål',
  no: 'Norwegian',
  nn: 'Norwegian Nynorsk',
  cs: 'Czech',
  ca: 'Catalan',
};

const ALL_LANGS = Object.keys(LANG_NAMES);

/**
 * @param {OpenAI} client
 * @param {string} model
 * @param {string} langName
 * @param {string} formalityHint
 * @param {string[]} maskedSources
 */
async function translateBatch(client, model, langName, formalityHint, maskedSources) {
  const system = [
    `You are a professional UI translator for a Home Assistant custom card called "Ultra Card".`,
    `Translate each English string to ${langName}.`,
    ``,
    `STRICT RULES:`,
    `1. Output ONLY a JSON object: {"translations": ["...", "..."]} with the same length and order as the input.`,
    `2. Preserve EVERY token of the form \\uE000...\\uE001 EXACTLY as-is — never translate, alter, reorder, add, or remove them. They are placeholders for variables and untranslatable technical terms.`,
    `3. Match the source's tone and length: button labels stay short labels; sentences stay sentences. Do not add explanations.`,
    `4. Match capitalization style: a Title Case English label should remain title-cased in the target language where natural; sentence case should remain sentence case.`,
    `5. Preserve trailing punctuation and ellipses (e.g. "Loading…").`,
    `6. Do not wrap output strings in extra quotes.`,
    formalityHint ? `7. ${formalityHint}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const user = JSON.stringify({ strings: maskedSources });

  const res = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'ui_translations',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['translations'],
          properties: {
            translations: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  });

  const content = res.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');
  /** @type {{ translations: string[] }} */
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.translations) || parsed.translations.length !== maskedSources.length) {
    throw new Error(
      `Bad batch response: expected ${maskedSources.length} translations, got ${parsed.translations?.length}`
    );
  }
  return parsed.translations;
}

/**
 * @param {string} lang
 * @param {{ delay: number; limit: number; dryRun: boolean; batchSize: number; model: string }} opts
 * @param {OpenAI} client
 */
async function translateLocale(lang, opts, client) {
  const langName = LANG_NAMES[lang];
  if (!langName) {
    console.error(
      `Unknown or unsupported locale for machine translate: ${lang} (use translate-en-gb.js for en-GB)`
    );
    process.exit(1);
  }

  const enPath = path.join(dir, 'en.json');
  const locPath = path.join(dir, `${lang}.json`);
  const metaPath = path.join(dir, `${lang}.meta.json`);
  const cachePath = path.join(__dirname, `.translate-cache-${lang}.json`);

  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const loc = JSON.parse(fs.readFileSync(locPath, 'utf8'));
  const enFlat = flatten(en);
  const locFlat = flatten(loc);

  /** @type {Record<string, string>} */
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

  const glossary = loadGlossary();
  const formalityHint = glossary.per_lang?.[lang]?.formality || '';
  const keysToFix = Object.keys(enFlat).filter(
    k => !(k in locFlat) || locFlat[k] === enFlat[k]
  );
  const missingCount = Object.keys(enFlat).filter(k => !(k in locFlat)).length;
  const capped = keysToFix.slice(0, opts.limit);

  console.log(
    `\n[translate-locale] ${lang} (${langName}) via ${opts.model}: ${keysToFix.length} keys need translation (${missingCount} missing entirely + ${keysToFix.length - missingCount} match en); translating ${capped.length}${opts.dryRun ? ' (dry-run)' : ''}...`
  );

  if (opts.dryRun || capped.length === 0) {
    return;
  }

  /**
   * Resolve cached entries first; only batch the misses.
   * @type {Array<{ key: string; src: string }>}
   */
  const pending = [];
  for (const key of capped) {
    const src = enFlat[key];
    if (!src || !String(src).trim()) continue;
    if (cache[src]) {
      locFlat[key] = cache[src];
      continue;
    }
    pending.push({ key, src });
  }

  console.log(
    `  ${capped.length - pending.length} from cache, ${pending.length} to send to model`
  );

  let done = 0;
  for (let i = 0; i < pending.length; i += opts.batchSize) {
    const batch = pending.slice(i, i + opts.batchSize);
    const masked = batch.map(b => mask(b.src, glossary.never_translate));
    const maskedSources = masked.map(m => m.masked);

    let attempts = 0;
    /** @type {string[]} */
    let translatedMasked = [];
    while (attempts < 4) {
      try {
        translatedMasked = await translateBatch(
          client,
          opts.model,
          langName,
          formalityHint,
          maskedSources
        );
        break;
      } catch (e) {
        attempts++;
        const msg = e && e.message ? e.message : String(e);
        console.warn(`  retry ${attempts} for batch starting at ${i}: ${msg}`);
        await new Promise(r => setTimeout(r, 1000 * attempts));
        if (attempts >= 4) throw e;
      }
    }

    for (let j = 0; j < batch.length; j++) {
      const { key, src } = batch[j];
      const { ph, gt } = masked[j];
      let translated = unmask(translatedMasked[j], ph, gt);
      try {
        assertPlaceholdersPreserved(src, translated);
      } catch (e) {
        console.warn(`  ${e.message} — falling back to source for key ${key}`);
        translated = src;
      }
      locFlat[key] = translated;
      cache[src] = translated;
      done++;
    }

    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 0));
    console.log(`  ... ${done}/${pending.length}`);

    if (opts.delay > 0) {
      await new Promise(r => setTimeout(r, opts.delay));
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 0));
  const newObj = unflatten(locFlat);
  fs.writeFileSync(locPath, JSON.stringify(newObj, null, 2) + '\n');

  /** @type {{ aiTranslatedKeys: string[]; lastRun: string; engine: string }} */
  let meta = {
    aiTranslatedKeys: [],
    lastRun: new Date().toISOString(),
    engine: `openai:${opts.model}`,
  };
  if (fs.existsSync(metaPath)) {
    try {
      meta = { ...meta, ...JSON.parse(fs.readFileSync(metaPath, 'utf8')) };
    } catch {
      /* ignore */
    }
  }
  const set = new Set(meta.aiTranslatedKeys || []);
  capped.forEach(k => set.add(k));
  meta.aiTranslatedKeys = [...set];
  meta.lastRun = new Date().toISOString();
  meta.engine = `openai:${opts.model}`;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
  console.log(`  wrote ${path.relative(root, locPath)} and ${path.relative(root, metaPath)}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const langs = args.all ? ALL_LANGS : args.lang ? [args.lang] : [];
  if (langs.length === 0) {
    console.log(
      'Usage: node scripts/translate-locale.js --lang de | --all [--limit N] [--batch-size 20] [--model gpt-4o-mini] [--delay ms] [--dry-run]'
    );
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error(
      'OPENAI_API_KEY is not set. Export it in your shell, e.g.:\n  export OPENAI_API_KEY=sk-...'
    );
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  for (const lang of langs) {
    await translateLocale(lang, args, client);
  }
  console.log('\nDone.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
