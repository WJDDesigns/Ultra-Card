#!/usr/bin/env node
/**
 * Export the card's built-in themes to website/builtin-themes.json.
 *
 * The WordPress plugin serves this file through the website harness
 * (GET /ultra-card/v1/themes/builtin) so ultracard.io/themes/ can list the
 * Default themes next to the community catalog without duplicating them
 * as posts. src/themes/builtin-themes.ts stays the single source of truth.
 *
 * Output is deterministic (no timestamps) so the file only changes when a
 * theme does. Runs as part of `npm run prebuild`.
 *
 * Usage: node scripts/export-builtin-themes.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'website', 'builtin-themes.json');

const versionTs = fs.readFileSync(path.join(ROOT, 'src/version.ts'), 'utf8');
const cardVersion = (versionTs.match(/VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1] || '';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uc-builtin-themes-'));
const bundle = path.join(tmp, 'builtin-themes.mjs');
await build({
  entryPoints: [path.join(ROOT, 'src/themes/builtin-themes.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: bundle,
  logLevel: 'silent',
});
const { BUILTIN_THEMES } = await import(pathToFileURL(bundle).href);
fs.rmSync(tmp, { recursive: true, force: true });

// HA Native is the "no theme" option; it has nothing to show in a gallery.
const themes = BUILTIN_THEMES.filter(t => t.id !== 'ha_native').map(t =>
  JSON.parse(JSON.stringify({ ...t, source: 'builtin' }))
);

const manifest = { cardVersion, count: themes.length, themes };
const json = JSON.stringify(manifest, null, 2) + '\n';
// Two copies: the repo file the harness fetches from GitHub, and a copy that
// ships inside the plugin zip so the gallery has the Default themes even when
// the harness channel points at a ref without the file.
const targets = [OUT, path.join(ROOT, 'ultra-card-integration', 'data', 'builtin-themes.json')];
for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const rel = path.relative(ROOT, target);
  const prev = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (prev !== json) {
    fs.writeFileSync(target, json);
    console.log(`✅ ${rel}: ${themes.length} themes, ${(json.length / 1024).toFixed(0)} KB`);
  } else {
    console.log(`✅ ${rel} unchanged (${themes.length} themes)`);
  }
}
