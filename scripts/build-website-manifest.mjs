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
  {
    id: 'pricing',
    file: 'pricing-page-embed.html',
    title: 'Pricing',
    needsDemoBundle: false,
    path: '/pricing/',
  },
  {
    id: 'pro',
    file: 'pro-page-embed.html',
    title: 'Ultra Card Pro (product description)',
    needsDemoBundle: false,
    path: '/product/ultra-card-pro/',
  },
  {
    id: 'terms',
    file: 'terms-page-embed.html',
    title: 'Terms of Service',
    needsDemoBundle: false,
    path: '/terms-and-conditions/',
  },
  {
    id: 'privacy',
    file: 'privacy-page-embed.html',
    title: 'Privacy Policy',
    needsDemoBundle: false,
    path: '/privacy-policy/',
  },
  {
    id: 'refunds',
    file: 'refund-page-embed.html',
    title: 'Refund Policy',
    needsDemoBundle: false,
    path: '/refund-policy/',
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
