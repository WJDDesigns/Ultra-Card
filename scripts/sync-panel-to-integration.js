#!/usr/bin/env node
/**
 * Copy the built Ultra Card panel bundle AND all lazy-load chunk files (uc-*.js)
 * from dist/ into the Ultra Card Connect integration's www/ folder.
 *
 * Also:
 * - Prunes stale uc-* files not present in the current dist/
 * - Writes panel-assets.json with SHA-256 hashes for Connect CI/release checks
 *
 * Usage:
 *   node scripts/sync-panel-to-integration.js
 *   npm run sync:panel
 *
 * Expects the integration repo to be at a sibling path by default, or
 * set INTEGRATION_WWW_PATH to the integration's www directory.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_PANEL = path.join(DIST_DIR, 'ultra-card-panel.js');
const MANIFEST_NAME = 'panel-assets.json';

const INTEGRATION_WWW_PATH =
  process.env.INTEGRATION_WWW_PATH ||
  path.join(ROOT, '..', 'Ultra Card Pro Cloud', 'custom_components', 'ultra_card_pro_cloud', 'www');

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function readUltraCardVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    if (pkg.version) return String(pkg.version);
  } catch {
    /* ignore */
  }
  try {
    const versionTs = fs.readFileSync(path.join(ROOT, 'src', 'version.ts'), 'utf8');
    const match = versionTs.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (match) return match[1];
  } catch {
    /* ignore */
  }
  return 'unknown';
}

function readGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

if (!fs.existsSync(DIST_PANEL)) {
  console.error('Missing dist/ultra-card-panel.js. Run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(INTEGRATION_WWW_PATH)) {
  console.error('Integration www path not found:', INTEGRATION_WWW_PATH);
  console.error('Set INTEGRATION_WWW_PATH if the integration repo is elsewhere.');
  process.exit(1);
}

const distFiles = fs.readdirSync(DIST_DIR);
const chunkFiles = distFiles.filter(
  f => f.startsWith('uc-') && (f.endsWith('.js') || f.endsWith('.js.LICENSE.txt'))
);
const expectedNames = new Set(['ultra-card-panel.js', ...chunkFiles]);

// Copy panel + chunks
fs.copyFileSync(DIST_PANEL, path.join(INTEGRATION_WWW_PATH, 'ultra-card-panel.js'));
console.log('Copied dist/ultra-card-panel.js →', INTEGRATION_WWW_PATH);

let copied = 0;
for (const file of chunkFiles) {
  fs.copyFileSync(path.join(DIST_DIR, file), path.join(INTEGRATION_WWW_PATH, file));
  copied++;
}
console.log(`Copied ${copied} chunk files (uc-*.js) → ${INTEGRATION_WWW_PATH}`);

// Prune stale uc-* assets left from older webpack chunk IDs
let pruned = 0;
for (const file of fs.readdirSync(INTEGRATION_WWW_PATH)) {
  const isUcAsset =
    file.startsWith('uc-') && (file.endsWith('.js') || file.endsWith('.js.LICENSE.txt'));
  if (!isUcAsset) continue;
  if (expectedNames.has(file)) continue;
  fs.unlinkSync(path.join(INTEGRATION_WWW_PATH, file));
  pruned++;
  console.log(`Pruned stale ${file}`);
}
if (pruned) console.log(`Pruned ${pruned} stale uc-* file(s)`);

// Write hash manifest for Connect panel:check
const files = {};
for (const name of [...expectedNames].sort()) {
  files[name] = sha256File(path.join(INTEGRATION_WWW_PATH, name));
}

const manifest = {
  synced_at: new Date().toISOString(),
  ultra_card_version: readUltraCardVersion(),
  ultra_card_commit: readGitCommit(),
  files,
};

fs.writeFileSync(
  path.join(INTEGRATION_WWW_PATH, MANIFEST_NAME),
  JSON.stringify(manifest, null, 2) + '\n'
);
console.log(`Wrote ${MANIFEST_NAME} (${Object.keys(files).length} hashed files)`);
console.log(`Total files in www/: ${fs.readdirSync(INTEGRATION_WWW_PATH).length}`);
