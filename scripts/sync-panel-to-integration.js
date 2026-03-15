#!/usr/bin/env node
/**
 * Copy the built Ultra Card panel bundle AND all lazy-load chunk files (uc-*.js)
 * from dist/ into the Ultra Card Pro Cloud integration's www/ folder.
 *
 * The integration serves its own www/ as a static path (/ultra_card_pro_cloud_panel/).
 * Both the panel bundle AND its webpack chunks must live here for the sidebar panel
 * to load correctly — the panel fetches chunks relative to its own script URL.
 *
 * Usage:
 *   node scripts/sync-panel-to-integration.js
 *   npm run sync:panel
 *
 * Expects the integration repo to be at a sibling path by default, or
 * set INTEGRATION_WWW_PATH to the integration's www directory.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_PANEL = path.join(DIST_DIR, 'ultra-card-panel.js');

const INTEGRATION_WWW_PATH =
  process.env.INTEGRATION_WWW_PATH ||
  path.join(ROOT, '..', 'Ultra Card Pro Cloud', 'custom_components', 'ultra_card_pro_cloud', 'www');

if (!fs.existsSync(DIST_PANEL)) {
  console.error('Missing dist/ultra-card-panel.js. Run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(INTEGRATION_WWW_PATH)) {
  console.error('Integration www path not found:', INTEGRATION_WWW_PATH);
  console.error('Set INTEGRATION_WWW_PATH if the integration repo is elsewhere.');
  process.exit(1);
}

// Copy the main panel bundle
fs.copyFileSync(DIST_PANEL, path.join(INTEGRATION_WWW_PATH, 'ultra-card-panel.js'));
console.log('Copied dist/ultra-card-panel.js →', INTEGRATION_WWW_PATH);

// Copy all uc-*.js chunk files (panel lazy-loads these from the same base URL)
const distFiles = fs.readdirSync(DIST_DIR);
const chunkFiles = distFiles.filter(
  f => f.startsWith('uc-') && (f.endsWith('.js') || f.endsWith('.js.LICENSE.txt'))
);

let copied = 0;
for (const file of chunkFiles) {
  fs.copyFileSync(path.join(DIST_DIR, file), path.join(INTEGRATION_WWW_PATH, file));
  copied++;
}

console.log(`Copied ${copied} chunk files (uc-*.js) → ${INTEGRATION_WWW_PATH}`);
console.log(`Total files in www/: ${fs.readdirSync(INTEGRATION_WWW_PATH).length}`);
