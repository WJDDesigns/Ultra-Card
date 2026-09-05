#!/usr/bin/env node
/**
 * Bundle policy gate for the multi-file ESM build (see docs/bundle-strategy.md).
 *
 * Fails when:
 *   - any uc-*.js chunk lacks a content hash (chunks have no ?hacstag and are
 *     served from /hacsfiles/ with a 31-day cache, so the hash is the cache-buster)
 *   - the editor or a locale is not emitted as its own chunk (regression to eager)
 *   - the entry contains a build-machine file:// URL (import.meta.url was
 *     rewritten at build time instead of resolved at runtime)
 *   - dist/ultra-card.js exceeds the core budget
 *
 * Usage: node scripts/check-bundle.js [--budget-bytes N]
 * SINGLE_FILE=1 skips the chunk-shape checks (emergency single-file hotfix build).
 */
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const ENTRY = path.join(DIST, 'ultra-card.js');
const DEFAULT_BUDGET = 8 * 1024 * 1024; // ratchet down as Phase 2 lands
const WARN_AT = 6 * 1024 * 1024;

const argIdx = process.argv.indexOf('--budget-bytes');
const budget = argIdx > -1 ? Number(process.argv[argIdx + 1]) : DEFAULT_BUDGET;
const singleFile = process.env.SINGLE_FILE === '1';

const errors = [];
const notes = [];

if (!fs.existsSync(ENTRY)) {
  console.error(`::error::${ENTRY} not found. Run the production build first.`);
  process.exit(1);
}

const size = fs.statSync(ENTRY).size;
notes.push(`ultra-card.js: ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MiB)`);
if (size > budget) {
  const msg = `ultra-card.js is ${size} bytes, over the ${budget}-byte core budget.`;
  // The single-file hotfix build is expected to blow the budget; warn, don't block.
  if (singleFile) console.log(`::warning::${msg}`);
  else errors.push(msg);
} else if (size > WARN_AT) {
  console.log(`::warning::ultra-card.js is ${size} bytes; over the ${WARN_AT}-byte soft target.`);
}

const entrySource = fs.readFileSync(ENTRY, 'utf8');
if (entrySource.includes('file:///')) {
  errors.push('ultra-card.js contains a file:/// URL; import.meta.url was resolved at build time.');
}

const chunks = fs.readdirSync(DIST).filter(f => f.startsWith('uc-') && f.endsWith('.js'));
notes.push(`uc-*.js chunks: ${chunks.length}`);

if (!singleFile) {
  const hashed = /^uc-.+\.[0-9a-f]{8}\.js$/;
  for (const c of chunks) {
    if (!hashed.test(c)) errors.push(`chunk ${c} has no content hash in its filename.`);
  }
  if (!chunks.some(c => c.startsWith('uc-editor.'))) {
    errors.push('editor is not emitted as its own chunk (uc-editor.<hash>.js missing).');
  }
  if (!chunks.some(c => c.startsWith('uc-locale-de.'))) {
    errors.push('locales are not emitted as chunks (uc-locale-de.<hash>.js missing).');
  }
  // Every hash referenced by the entry must exist on disk (otherwise it 404s in HA).
  const referenced = new Set(entrySource.match(/uc-[A-Za-z0-9_-]+\.[0-9a-f]{8}\.js/g) || []);
  for (const ref of referenced) {
    if (!fs.existsSync(path.join(DIST, ref)))
      errors.push(`entry references ${ref} but it was not emitted.`);
  }
} else {
  notes.push('SINGLE_FILE=1: chunk-shape checks skipped.');
}

for (const n of notes) console.log(n);
if (errors.length) {
  for (const e of errors) console.error(`::error::${e}`);
  process.exit(1);
}
console.log('Bundle policy: OK');
