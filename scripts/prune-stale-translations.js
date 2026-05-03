/* eslint-disable no-console */
/**
 * Remove translation keys that no longer exist in en.json (orphan / stale keys).
 */
const fs = require('fs');
const path = require('path');
const { flatten, unflatten, filterFlatKeys } = require('./lib/translation-flat');

const dir = path.join(__dirname, '..', 'src', 'translations');

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
const allowed = new Set(Object.keys(enFlat));
let totalPruned = 0;

for (const file of listLocaleFiles()) {
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const flat = flatten(data);
  const before = Object.keys(flat).length;
  const filtered = filterFlatKeys(flat, allowed);
  const after = Object.keys(filtered).length;
  const pruned = before - after;
  if (pruned > 0) {
    const newObj = unflatten(filtered);
    fs.writeFileSync(p, JSON.stringify(newObj, null, 2) + '\n');
    console.log(`${file}: pruned ${pruned} stale keys (${before} -> ${after})`);
    totalPruned += pruned;
  } else {
    console.log(`${file}: no stale keys`);
  }
}

console.log(`\nDone. Total pruned: ${totalPruned}`);
