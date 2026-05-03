/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { flatten } = require('./lib/translation-flat');

const dir = path.join(__dirname, '..', 'src', 'translations');

/** @returns {string[]} */
function listLocaleFiles() {
  return fs.readdirSync(dir).filter(f => {
    if (!f.endsWith('.json')) return false;
    if (f.startsWith('_')) return false;
    if (f.endsWith('.meta.json')) return false;
    if (f === 'en.json') return false;
    return true;
  });
}

const enPath = path.join(dir, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enFlat = flatten(en);
const totalEnKeys = Object.keys(enFlat).length;

console.log('Ultra Card Translation Statistics\n');
console.log(`Source keys (en.json): ${totalEnKeys}\n`);
console.log(
  'Locale | File        | Structural | Real trans. | Same-as-en | Extra keys'
);
console.log(
  '-------|-------------|------------|-------------|------------|-----------'
);

const stats = [];

for (const file of listLocaleFiles()) {
  const lang = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const flat = flatten(data);

  const keysInLocale = Object.keys(flat);
  const structuralPresent = keysInLocale.filter(k => k in enFlat).length;
  const structuralPct = Math.round((structuralPresent / totalEnKeys) * 100);

  let sameAsEn = 0;
  let translated = 0;
  for (const k of Object.keys(enFlat)) {
    if (!(k in flat)) continue;
    if (flat[k] === enFlat[k]) sameAsEn++;
    else translated++;
  }

  const realPct = Math.round((translated / totalEnKeys) * 100);
  const extras = keysInLocale.filter(k => !(k in enFlat)).length;

  stats.push({
    lang: lang.toUpperCase(),
    file,
    structuralPresent,
    structuralPct,
    translated,
    realPct,
    sameAsEn,
    extras,
  });
}

stats.sort((a, b) => b.realPct - a.realPct);

for (const s of stats) {
  const bar = '█'.repeat(Math.floor(s.realPct / 5)) + '░'.repeat(20 - Math.floor(s.realPct / 5));
  console.log(
    `${s.lang.padEnd(6)} | ${s.file.padEnd(11)} | ${String(s.structuralPct).padStart(3)}% (${String(s.structuralPresent).padStart(4)}/${totalEnKeys}) | ${bar} ${String(s.realPct).padStart(3)}% | ${String(s.sameAsEn).padStart(10)} | ${String(s.extras).padStart(9)}`
  );
}

console.log('\nStructural: keys present in locale that also exist in en.json.');
console.log('Real: keys whose value differs from en (actual translation).');
console.log('Same-as-en: keys still using English fallback text.');
console.log('Extra: keys in locale file not in en.json (stale; run prune script).');
console.log('\nSee CONTRIBUTING_TRANSLATIONS.md for contribution guidelines.');
