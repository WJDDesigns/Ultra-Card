/* eslint-disable no-console */
/**
 * Finds text the editor shows through `localize('key', lang, 'English')` whose key
 * is missing from src/translations/en.json. Those strings can't be translated,
 * because translators only ever see what's in the JSON files.
 *
 *   node scripts/extract-translation-keys.js          list the missing keys
 *   node scripts/extract-translation-keys.js --write  add them to en.json (then run
 *                                                     `npm run sync:translations` to
 *                                                     copy them into every language)
 *   node scripts/extract-translation-keys.js --check  exit 1 if any are missing
 */
const fs = require('fs');
const path = require('path');
const { flatten } = require('./lib/translation-flat');
const { findLocalizeCalls } = require('./lib/localize-calls');

const root = path.join(__dirname, '..');
const enPath = path.join(root, 'src', 'translations', 'en.json');

/** Keys owned by Home Assistant's own frontend translations, not ours. */
const EXTERNAL_PREFIXES = ['ui.', 'component.', 'state.', 'state_attributes.'];

/**
 * @returns {{ key: string; fallback: string; uses: { file: string; line: number }[] }[]}
 */
function findMissingKeys() {
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enFlat = flatten(en);
  /** @type {Map<string, { fallbacks: Map<string, number>; uses: { file: string; line: number }[] }>} */
  const byKey = new Map();
  for (const call of findLocalizeCalls(path.join(root, 'src'))) {
    if (call.key in enFlat) continue;
    if (EXTERNAL_PREFIXES.some(p => call.key.startsWith(p))) continue;
    let entry = byKey.get(call.key);
    if (!entry) {
      entry = { fallbacks: new Map(), uses: [] };
      byKey.set(call.key, entry);
    }
    entry.uses.push({ file: call.file, line: call.line });
    if (call.fallback)
      entry.fallbacks.set(call.fallback, (entry.fallbacks.get(call.fallback) || 0) + 1);
  }
  const out = [];
  for (const [key, entry] of byKey) {
    // Without English text there's nothing to put in en.json.
    if (entry.fallbacks.size === 0) continue;
    // Most-used fallback wins; ties go to the first one seen.
    const fallback = [...entry.fallbacks.entries()].sort((a, b) => b[1] - a[1])[0][0];
    out.push({ key, fallback, uses: entry.uses });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} key dot path
 * @param {string} value
 * @returns {boolean} false when the path collides with an existing string
 */
function setPath(obj, key, value) {
  const parts = key.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (node[p] === undefined) node[p] = {};
    if (typeof node[p] !== 'object' || node[p] === null) return false;
    node = /** @type {Record<string, unknown>} */ node[p];
  }
  const last = parts[parts.length - 1];
  if (node[last] !== undefined) return false;
  node[last] = value;
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const missing = findMissingKeys();

  if (args.includes('--write')) {
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    let added = 0;
    for (const m of missing) {
      if (setPath(en, m.key, m.fallback)) added++;
      else console.warn(`Skipped ${m.key}: its path collides with an existing entry in en.json`);
    }
    fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
    console.log(`Added ${added} key(s) to src/translations/en.json.`);
    if (added)
      console.log('Next: npm run sync:translations  (copies them into every language file)');
    return;
  }

  if (missing.length === 0) {
    console.log('Every localize() key used in src/ is in en.json ✅');
    return;
  }
  for (const m of missing) {
    console.log(`${m.key}  "${m.fallback}"  (${m.uses[0].file}:${m.uses[0].line})`);
  }
  console.log(`\n${missing.length} key(s) used in code but missing from en.json.`);
  console.log('Run: node scripts/extract-translation-keys.js --write && npm run sync:translations');
  if (args.includes('--check')) process.exit(1);
}

if (require.main === module) main();

module.exports = { findMissingKeys };
