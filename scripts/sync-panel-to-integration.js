#!/usr/bin/env node
/**
 * Copy the built Ultra Card panel (dist/ultra-card-panel.js) into the
 * Ultra Card Pro Cloud integration's www/ folder so the sidebar panel
 * served by the integration stays in sync with the card repo.
 *
 * Single source of truth: Ultra Card repo's dist/ultra-card-panel.js (after npm run build).
 * The integration's www/ is the deployment target; deploy.js in the Pro Cloud repo
 * also copies from this path when deploying. Run "npm run build" in Ultra Card first.
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
const DIST_PANEL = path.join(ROOT, 'dist', 'ultra-card-panel.js');

const INTEGRATION_WWW_PATH =
  process.env.INTEGRATION_WWW_PATH ||
  path.join(ROOT, '..', 'Ultra Card Pro Cloud', 'custom_components', 'ultra_card_pro_cloud', 'www');
const TARGET_FILE = path.join(INTEGRATION_WWW_PATH, 'ultra-card-panel.js');

if (!fs.existsSync(DIST_PANEL)) {
  console.error('Missing dist/ultra-card-panel.js. Run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(path.dirname(TARGET_FILE))) {
  console.error('Integration www path not found:', INTEGRATION_WWW_PATH);
  console.error('Set INTEGRATION_WWW_PATH if the integration repo is elsewhere.');
  process.exit(1);
}

fs.copyFileSync(DIST_PANEL, TARGET_FILE);
console.log('Copied dist/ultra-card-panel.js →', TARGET_FILE);
