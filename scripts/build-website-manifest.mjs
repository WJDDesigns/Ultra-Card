#!/usr/bin/env node
/**
 * Build website/pages.json — the fragment index the WordPress harness reads.
 *
 * Usage: node scripts/build-website-manifest.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WEBSITE = path.join(ROOT, 'website');

const PAGES = [
  {
    id: 'modules',
    file: 'modules-page-embed.html',
    title: 'Modules',
    needsDemoBundle: true,
    path: '/modules/',
  },
  {
    id: 'template-mode',
    file: 'template-mode-page-embed.html',
    title: 'Template Mode',
    needsDemoBundle: true,
    path: '/template-mode/',
  },
  {
    id: 'presets',
    file: 'presets-page-embed.html',
    title: 'Presets',
    needsDemoBundle: false,
    path: '/presets/',
  },
];

const pages = PAGES.map(p => {
  const abs = path.join(WEBSITE, p.file);
  const body = fs.readFileSync(abs);
  return {
    id: p.id,
    file: `website/${p.file}`,
    title: p.title,
    path: p.path,
    needsDemoBundle: p.needsDemoBundle,
    bytes: body.length,
    sha256: crypto.createHash('sha256').update(body).digest('hex'),
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  repo: 'WJDDesigns/Ultra-Card',
  demoBundle: 'dist-demo/ultra-card-demo.js',
  pages,
};

const out = path.join(WEBSITE, 'pages.json');
fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${out} (${pages.length} pages)`);
