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
 *   - hacs.json has content_in_root=true: HACS then keeps ONLY `filename` from
 *     the release assets and silently drops every chunk (this is what broke
 *     3.6.0). content_in_root=false puts HACS in release mode, which downloads
 *     every asset flat into www/community/Ultra-Card/.
 *
 * Usage: node scripts/check-bundle.js [--budget-bytes N]
 * SINGLE_FILE=1 skips the chunk-shape checks (emergency single-file hotfix build).
 */
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const ENTRY = path.join(DIST, 'ultra-card.js');
// Phase 2 (lazy modules) landed the entry at ~1.65 MiB. The fail line sits
// below "entry + three.js" (~+0.5 MiB) so re-inlining any heavy vendor or a
// large module group fails CI instead of silently regressing.
const DEFAULT_BUDGET = 2.25 * 1024 * 1024;
const WARN_AT = 1.9 * 1024 * 1024;

const argIdx = process.argv.indexOf('--budget-bytes');
const budget = argIdx > -1 ? Number(process.argv[argIdx + 1]) : DEFAULT_BUDGET;
const singleFile = process.env.SINGLE_FILE === '1';

const errors = [];
const notes = [];

function parseIdMap(src) {
  // {8:"editor",150:"locale-nn"} -> Map(id -> value); ids may also be quoted.
  const map = new Map();
  for (const m of src.matchAll(/"?([A-Za-z0-9_-]+)"?:"([^"]+)"/g)) map.set(m[1], m[2]);
  return map;
}

function resolveRuntimeChunkNames(source) {
  const re = /"uc-"\+\((\{[^}]*\})\[\w\]\|\|\w\)\+"\."\+(\{[^}]*\})\[\w\]\+"\.js"/;
  const m = source.match(re);
  if (!m) return [];
  const names = parseIdMap(m[1]);
  const hashes = parseIdMap(m[2]);
  return [...hashes].map(([id, hash]) => `uc-${names.get(id) || id}.${hash}.js`);
}

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

const hacsManifest = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'hacs.json'), 'utf8')
);
if (hacsManifest.content_in_root !== false) {
  errors.push(
    'hacs.json content_in_root must be false. With content_in_root=true HACS downloads only ' +
      '`filename` from the release and drops every uc-*.js chunk.'
  );
}
if (hacsManifest.filename !== 'ultra-card.js') {
  errors.push('hacs.json filename must be ultra-card.js (HACS release-mode detection keys on it).');
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
  // Phase 2 shape: non-essential modules, heavy vendors and heavy services are chunks.
  for (const prefix of [
    'uc-m-graphs.',
    'uc-m-map.',
    'uc-m-inputs.',
    'uc-vendor-three.',
    'uc-vendor-codemirror.',
    'uc-vendor-tiptap.',
    'uc-vendor-leaflet.',
    'uc-svc-dynamic-weather.',
    'uc-default-image.',
  ]) {
    if (!chunks.some(c => c.startsWith(prefix))) {
      errors.push(
        `expected chunk ${prefix}<hash>.js was not emitted (folded back into the entry?).`
      );
    }
  }
  const moduleChunks = chunks.filter(c => c.startsWith('uc-m-')).length;
  notes.push(`module chunks (uc-m-*): ${moduleChunks}`);
  if (moduleChunks < 60) {
    errors.push(`only ${moduleChunks} module chunks emitted; expected most modules to be lazy.`);
  }
  // Every chunk the entry can request must exist on disk (otherwise it 404s in HA).
  // Webpack does not embed full filenames; it builds them from two maps in the
  // runtime's `__webpack_require__.u`:  "uc-"+({id:"name"}[e]||e)+"."+{id:"hash"}[e]+".js"
  const referenced = resolveRuntimeChunkNames(entrySource);
  if (referenced.length === 0) {
    errors.push(
      'could not locate the webpack chunk filename map in ultra-card.js (runtime shape changed?).'
    );
  }
  for (const ref of referenced) {
    if (!fs.existsSync(path.join(DIST, ref)))
      errors.push(`entry references ${ref} but it was not emitted.`);
  }
  notes.push(`chunks reachable from entry: ${referenced.length}`);
} else {
  notes.push('SINGLE_FILE=1: chunk-shape checks skipped.');
}

for (const n of notes) console.log(n);
if (errors.length) {
  for (const e of errors) console.error(`::error::${e}`);
  process.exit(1);
}
console.log('Bundle policy: OK');
