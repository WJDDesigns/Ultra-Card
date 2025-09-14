/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'translations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const enPath = path.join(dir, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(acc, flatten(v, key));
    else acc[key] = String(v);
    return acc;
  }, {});
}

const enFlat = flatten(en);
const totalKeys = Object.keys(enFlat).length;

console.log('📊 Ultra Card Translation Statistics\n');
console.log(`Total translatable strings: ${totalKeys}\n`);

const stats = [];

for (const file of files) {
  if (file === 'en.json') continue;

  const lang = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const flat = flatten(data);

  const translated = Object.keys(flat).length;
  const percentage = Math.round((translated / totalKeys) * 100);

  stats.push({
    lang: lang.toUpperCase(),
    file,
    translated,
    percentage,
    missing: totalKeys - translated,
  });
}

// Sort by completion percentage
stats.sort((a, b) => b.percentage - a.percentage);

console.log('Language    | File        | Progress | Translated | Missing');
console.log('------------|-------------|----------|------------|--------');

for (const stat of stats) {
  const progressBar =
    '█'.repeat(Math.floor(stat.percentage / 5)) + '░'.repeat(20 - Math.floor(stat.percentage / 5));
  console.log(
    `${stat.lang.padEnd(11)} | ${stat.file.padEnd(11)} | ${progressBar} ${stat.percentage.toString().padStart(3)}% | ${stat.translated.toString().padStart(10)} | ${stat.missing.toString().padStart(7)}`
  );
}

console.log('\n🎯 Help us reach 100% completion in all languages!');
console.log('📖 See CONTRIBUTING_TRANSLATIONS.md for contribution guidelines');
