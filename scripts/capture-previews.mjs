/**
 * Renders every Ultra Card module headlessly and captures a PNG per module,
 * plus a short animated WebP the picker plays on hover.
 *
 * Outputs (all committed, so they can be linked from anywhere):
 *   docs/previews/<type>.png     one screenshot per module
 *   docs/previews/<type>.webp    ~2s animation loop, played on hover
 *   docs/previews/manifest.json  machine-readable index (the sharing contract)
 *   docs/MODULES.md              human-readable gallery
 *
 * It doubles as a smoke test: any module that throws, renders empty, or shows a
 * "configure me" state is reported and (with --strict) fails the build.
 *
 *   node scripts/capture-previews.mjs [--strict] [--only=gauge,text] [--no-anim]
 *
 * Prereq: npx webpack -c webpack.demo.config.js   (builds dist-demo/)
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE = path.join(ROOT, 'dist-demo', 'ultra-card-demo.js');
const OUT_DIR = path.join(ROOT, 'docs', 'previews');
const PORT = 8791;

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const NO_ANIM = args.includes('--no-anim');
const ONLY = (args.find(a => a.startsWith('--only=')) || '').replace('--only=', '');

/* Hover animation. Frames are captured at whatever rate the browser can manage
 * and the playback delay is derived from the measured elapsed time, so the loop
 * runs at true speed rather than a guessed frame rate. Width is halved from the
 * still because these ship to every editor session that hovers a tile. */
const ANIM_FRAMES = 24;
const ANIM_WIDTH = 456;
const ANIM_QUALITY = 50;
/* Spacing between frames. Back-to-back screenshots cover barely a second, which
 * is too short a window for the slower modules (a clock ticking once a second
 * looked frozen). This stretches the loop to roughly three seconds. */
const ANIM_INTERVAL_MS = 70;

/**
 * The MDI webfont must be linked here, at document level. The ha-icon shim
 * adopts the same stylesheet into its shadow root, but @font-face rules are
 * ignored inside a shadow tree, so without this link every icon captures blank.
 * ultracard.io gets this from its own page CSS, which is why icons look right
 * there and were missing only in the screenshots.
 */
const MDI_CSS = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';

const HOST_PAGE = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${MDI_CSS}">
<style>
  html,body{margin:0;background:#0f1216}
  #stage{width:420px;padding:18px}
  uc-module-demo{display:block}
</style></head><body><div id="stage"></div>
<script src="/ultra-card-demo.js"></script></body></html>`;

/** Static server for the host page + demo bundle. */
async function serve() {
  const bundle = await fs.readFile(BUNDLE);
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/ultra-card-demo.js')) {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(bundle);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(HOST_PAGE);
    }
  });
  await new Promise(r => server.listen(PORT, r));
  return server;
}

async function main() {
  try {
    await fs.access(BUNDLE);
  } catch {
    console.error(`Missing ${path.relative(ROOT, BUNDLE)} — run: npx webpack -c webpack.demo.config.js`);
    process.exit(1);
  }

  const server = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 460, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.UCDemo, null, { timeout: 60000 });
  // Glyphs are drawn from the webfont; capturing before it lands yields blanks.
  await page.evaluate(() => document.fonts.load('24px "Material Design Icons"'));
  await page.evaluate(() => document.fonts.ready);

  const manifests = await page.evaluate(() => window.UCDemo.types());
  const version = await page.evaluate(() => window.UCDemo.version);
  const wanted = ONLY ? ONLY.split(',').map(s => s.trim()) : null;
  const targets = manifests.filter(m => !wanted || wanted.includes(m.type));

  await fs.mkdir(OUT_DIR, { recursive: true });

  const results = [];
  for (const meta of targets) {
    const type = meta.type;
    const outFile = path.join(OUT_DIR, `${type}.png`);

    const health = await page.evaluate(async t => {
      const stage = document.getElementById('stage');
      stage.innerHTML = '';
      const el = document.createElement('uc-module-demo');
      el.setAttribute('type', t);
      stage.appendChild(el);
      // Let lazy loading, async data (history/calendar/todo) and staging settle.
      await new Promise(r => setTimeout(r, 2600));
      const card = el.shadowRoot && el.shadowRoot.querySelector('.ucd-card');
      if (!card) return { ok: false, reason: 'no shadow content' };
      const text = (card.textContent || '')
        .replace(/\/\*[^]*?\*\//g, ' ')
        .replace(/[.#@][^{}]{0,120}\{[^{}]*\}/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const box = card.getBoundingClientRect();
      return {
        ok: true,
        height: Math.round(box.height),
        empty: box.height < 24,
        errored: !!card.querySelector('.ucd-error'),
        needsConfig: /Select an?\b|Choose a|Configure |Pick a |Add a washer/i.test(text),
        sample: text.slice(0, 80),
      };
    }, type);

    const target = page.locator('#stage');
    await target.screenshot({ path: outFile });

    if (!NO_ANIM) {
      // Every frame must share one clip box: modules whose content shifts mid
      // animation would otherwise yield frames of differing size, which cannot
      // be joined.
      const box = await target.boundingBox();
      if (box) {
        const clip = {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
        const frames = [];
        const startedAt = Date.now();
        for (let i = 0; i < ANIM_FRAMES; i++) {
          frames.push(await page.screenshot({ clip }));
          if (i < ANIM_FRAMES - 1) await page.waitForTimeout(ANIM_INTERVAL_MS);
        }
        const delay = Math.max(40, Math.round((Date.now() - startedAt) / ANIM_FRAMES));

        try {
          // Each frame is scaled before joining: resizing the joined strip
          // collapses it back to a single page.
          const scaled = await Promise.all(
            frames.map(f => sharp(f).resize({ width: ANIM_WIDTH }).png().toBuffer())
          );
          await sharp(scaled, { join: { animated: true } })
            .webp({ loop: 0, delay, quality: ANIM_QUALITY, effort: 4 })
            .toFile(path.join(OUT_DIR, `${type}.webp`));
        } catch (err) {
          // A module that resizes itself mid-loop just loses its animation; the
          // still is what the picker falls back to anyway.
          console.log(`  · ${type}: animation skipped (${err.message.split('\n')[0]})`);
        }
      }
    }

    const status = !health.ok || health.errored ? 'error' : health.empty ? 'empty' : health.needsConfig ? 'needs-config' : 'ok';
    results.push({
      type,
      title: meta.title,
      description: meta.description,
      category: meta.category,
      icon: meta.icon,
      pro: (meta.tags || []).includes('pro'),
      tags: meta.tags || [],
      preview: `previews/${type}.png`,
      status,
    });
    const mark = status === 'ok' ? '✓' : status === 'needs-config' ? '·' : '✗';
    console.log(`${mark} ${type.padEnd(24)} ${status}${health.sample ? '  ' + health.sample.slice(0, 46) : ''}`);
  }

  await browser.close();
  server.close();

  // ── manifest: the contract every consumer reads ──
  // A partial run (--only) must not drop the modules it did not capture, so
  // fold this run's results into whatever the manifest already describes.
  let entries = results;
  if (wanted) {
    let previous = [];
    try {
      const existing = JSON.parse(await fs.readFile(path.join(OUT_DIR, 'manifest.json'), 'utf8'));
      previous = Array.isArray(existing.modules) ? existing.modules : [];
    } catch {
      /* no manifest yet — this run is all we know about */
    }
    const captured = new Set(results.map(r => r.type));
    entries = [...previous.filter(p => !captured.has(p.type)), ...results];
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    ultraCardVersion: version,
    counts: {
      total: entries.length,
      free: entries.filter(r => !r.pro).length,
      pro: entries.filter(r => r.pro).length,
    },
    modules: entries.sort((a, b) => a.title.localeCompare(b.title)),
  };
  await fs.writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  // ── human-readable gallery ──
  const byCat = {};
  for (const r of manifest.modules) (byCat[r.category] ||= []).push(r);
  let md = `# Ultra Card module gallery\n\n`;
  md += `_Generated from v${version} on ${manifest.generatedAt.slice(0, 10)} — do not edit by hand._\n\n`;
  md += `**${manifest.counts.total} modules** · ${manifest.counts.free} free · ${manifest.counts.pro} PRO\n\n`;
  for (const cat of Object.keys(byCat).sort()) {
    md += `## ${cat}\n\n<table>\n`;
    for (const r of byCat[cat]) {
      md += `<tr><td width="220"><img src="${r.preview}" width="200" alt="${r.title}"></td>`;
      md += `<td><b>${r.title}</b>${r.pro ? ' · <sub>PRO</sub>' : ''}<br>${r.description}</td></tr>\n`;
    }
    md += `</table>\n\n`;
  }
  await fs.writeFile(path.join(ROOT, 'docs', 'MODULES.md'), md);

  const bad = results.filter(r => r.status === 'error' || r.status === 'empty');
  console.log(`\n${results.length} modules · ${bad.length} broken · ${results.filter(r => r.status === 'needs-config').length} need config`);
  if (bad.length) {
    console.log('Broken: ' + bad.map(b => `${b.type}(${b.status})`).join(', '));
    if (STRICT) process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
