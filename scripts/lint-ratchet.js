#!/usr/bin/env node
/**
 * ESLint with a ratchet on warnings.
 *
 * Errors fail as usual. Warnings (3.9k of them are `any`) only warned, so
 * nothing stopped them growing. This compares the count per rule against
 * scripts/lint-baseline.json and fails if any rule went up. When counts go
 * down, run `npm run lint:baseline` to lock in the lower numbers.
 *
 *   node scripts/lint-ratchet.js           check against the baseline
 *   node scripts/lint-ratchet.js --update  rewrite the baseline (never raises it)
 *   node scripts/lint-ratchet.js --force   rewrite it even if counts went up
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(__dirname, 'lint-baseline.json');
const update = process.argv.includes('--update');
const force = process.argv.includes('--force');

const res = spawnSync(
  process.execPath,
  [path.join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js'), 'src/**/*.ts', '-f', 'json'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
);
let results;
try {
  results = JSON.parse(res.stdout);
} catch {
  process.stderr.write(res.stderr || res.stdout);
  process.exit(res.status || 1);
}

const counts = {};
let errors = 0;
for (const file of results) {
  for (const m of file.messages) {
    if (m.severity === 2) {
      errors++;
      console.error(`${path.relative(ROOT, file.filePath)}:${m.line}:${m.column} ${m.message} (${m.ruleId})`);
      continue;
    }
    const rule = m.ruleId || '(none)';
    counts[rule] = (counts[rule] || 0) + 1;
  }
}
if (errors) {
  console.error(`\n${errors} ESLint error(s).`);
  process.exit(1);
}

const sorted = obj => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null;
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (update || force || !baseline) {
  let next = counts;
  if (baseline && !force) {
    next = {};
    for (const rule of new Set([...Object.keys(baseline), ...Object.keys(counts)])) {
      const n = Math.min(counts[rule] || 0, baseline[rule] ?? Infinity);
      if (n > 0) next[rule] = n;
    }
  }
  fs.writeFileSync(BASELINE, JSON.stringify(sorted(next), null, 2) + '\n');
  console.log(`Lint baseline written: ${total} warnings.`);
  process.exit(0);
}

const grew = [];
for (const [rule, n] of Object.entries(counts)) {
  const allowed = baseline[rule] || 0;
  if (n > allowed) grew.push(`  ${rule}: ${allowed} -> ${n}`);
}
if (grew.length) {
  console.error('ESLint warnings went up (fix them, or run `npm run lint:baseline -- --force` if intended):');
  console.error(grew.join('\n'));
  process.exit(1);
}
const baselineTotal = Object.values(baseline).reduce((a, b) => a + b, 0);
console.log(
  `Lint OK: 0 errors, ${total} warnings (baseline ${baselineTotal}).` +
    (total < baselineTotal ? ' Run `npm run lint:baseline` to lock in the drop.' : '')
);
