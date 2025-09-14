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
let exitCode = 0;

for (const file of files) {
  if (file === 'en.json') continue;
  const lang = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const flat = flatten(data);

  const missing = Object.keys(enFlat).filter(k => !(k in flat));
  const extras = Object.keys(flat).filter(k => !(k in enFlat));

  if (missing.length || extras.length) {
    console.log(`\n${lang}:`);
    if (missing.length) {
      console.log(`  Missing (${missing.length}):`);
      missing.slice(0, 20).forEach(k => console.log(`   - ${k}`));
      if (missing.length > 20) console.log(`   ...and ${missing.length - 20} more`);
      exitCode = 1;
    }
    if (extras.length) {
      console.log(`  Extra (${extras.length}):`);
      extras.slice(0, 20).forEach(k => console.log(`   - ${k}`));
    }
  }
}

if (exitCode === 0) console.log('\nAll translations in sync ✅');
process.exit(exitCode);
