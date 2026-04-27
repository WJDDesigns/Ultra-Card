/* eslint-disable no-console */
/**
 * One-off / maintenance: ensure editor.graphs.entity matches en.json structure
 * (nested object), not a legacy string. Copies English strings as fallback.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'translations');
const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
const template = en.editor?.graphs?.entity;
if (!template || typeof template !== 'object') {
  console.error('en.json missing editor.graphs.entity object');
  process.exit(1);
}

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  if (file === 'en.json') continue;
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const graphs = data.editor?.graphs;
  if (!graphs) continue;

  if (typeof graphs.entity === 'string') {
    graphs.entity = JSON.parse(JSON.stringify(template));
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${file}: graphs.entity string -> object`);
  } else if (!graphs.entity || typeof graphs.entity !== 'object' || graphs.entity.label === undefined) {
    graphs.entity = JSON.parse(JSON.stringify(template));
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${file}: graphs.entity merged from en`);
  }
}
