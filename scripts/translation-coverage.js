/* eslint-disable no-console */
/**
 * Emits scripts/translation-coverage-report.json and optionally fails on regression
 * vs scripts/translation-coverage-baseline.json (--check).
 */
const fs = require('fs');
const path = require('path');
const { flatten } = require('./lib/translation-flat');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'src', 'translations');
const reportPath = path.join(__dirname, 'translation-coverage-report.json');
const baselinePath = path.join(__dirname, 'translation-coverage-baseline.json');

function listLocaleFiles() {
  return fs.readdirSync(dir).filter(f => {
    if (!f.endsWith('.json')) return false;
    if (f.startsWith('_')) return false;
    if (f.endsWith('.meta.json')) return false;
    if (f === 'en.json') return false;
    return true;
  });
}

const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
const enFlat = flatten(en);
const totalEnKeys = Object.keys(enFlat).length;

/** @type {Record<string, { structuralPct: number; realPct: number; sameAsEn: number; extraKeys: number; structuralPresent: number; translated: number }>} */
const locales = {};

for (const file of listLocaleFiles()) {
  const lang = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const flat = flatten(data);
  const keysInLocale = Object.keys(flat);
  const structuralPresent = keysInLocale.filter(k => k in enFlat).length;
  const structuralPct = Math.round((structuralPresent / totalEnKeys) * 1000) / 10;
  let sameAsEn = 0;
  let translated = 0;
  for (const k of Object.keys(enFlat)) {
    if (!(k in flat)) continue;
    if (flat[k] === enFlat[k]) sameAsEn++;
    else translated++;
  }
  const realPct = Math.round((translated / totalEnKeys) * 1000) / 10;
  const extras = keysInLocale.filter(k => !(k in enFlat)).length;
  locales[lang] = {
    structuralPresent,
    structuralPct,
    translated,
    realPct,
    sameAsEn,
    extraKeys: extras,
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  totalEnKeys,
  locales,
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`Wrote ${path.relative(root, reportPath)}`);

const args = process.argv.slice(2);
const check = args.includes('--check');
const writeBaseline = args.includes('--write-baseline');

if (writeBaseline) {
  fs.writeFileSync(baselinePath, JSON.stringify({ generatedAt: report.generatedAt, locales }, null, 2) + '\n');
  console.log(`Wrote baseline ${path.relative(root, baselinePath)}`);
  process.exit(0);
}

if (check) {
  if (!fs.existsSync(baselinePath)) {
    console.warn(
      `No baseline at ${baselinePath}. Run: node scripts/translation-coverage.js --write-baseline (after translations look good), then commit the baseline file.`
    );
    process.exit(0);
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  let failed = false;
  for (const lang of Object.keys(locales)) {
    const cur = locales[lang];
    const base = baseline.locales[lang];
    if (!base) {
      console.warn(`Baseline missing locale ${lang}; skipping regression check for it.`);
      continue;
    }
    if (cur.realPct + 0.001 < base.realPct) {
      console.error(
        `Regression: ${lang} real coverage ${cur.realPct}% < baseline ${base.realPct}% (translated ${cur.translated} vs baseline translated ~${Math.round((base.realPct / 100) * totalEnKeys)})`
      );
      failed = true;
    }
    if (cur.structuralPresent < base.structuralPresent) {
      console.error(
        `Regression: ${lang} structural keys ${cur.structuralPresent} < baseline ${base.structuralPresent}`
      );
      failed = true;
    }
  }
  if (failed) process.exit(1);
  console.log('Translation coverage: no regression vs baseline.');
}

process.exit(0);
