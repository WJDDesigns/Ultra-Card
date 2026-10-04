/**
 * Pixel-measure the Discord drawer Icon Only centering report:
 * a large circular trigger with the glyph sitting above the visual midline.
 *
 * Uses Home Assistant's real ha-icon / ha-svg-icon layout rules:
 *   ha-icon :host { fill: currentcolor }  (no size, no flex)
 *   ha-svg-icon :host { width/height: var(--mdc-icon-size, 24px); inline-flex }
 *
 *   node scripts/drawer-icon-center-harness.mjs
 *
 * Exit 0 when the SVG centre is within TOL_PX of the button centre.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, '.harness-output', 'drawer-icon-center');
const ARTIFACT_DIR = '/opt/cursor/artifacts/drawer-icon-center';
const PORT = 8795;
const BUTTON_PX = 160;
const TOL_PX = 2;

const MDI_EXCLAMATION =
  'M 11,4L 13,4L 13,15L 11,15L 11,4 Z M 13,18L 13,20L 11,20L 11,18L 13,18 Z';

async function drawerTriggerCss() {
  const src = await fs.readFile(path.join(ROOT, 'src/modules/drawer-module.ts'), 'utf8');
  const match = src.match(/getStyles\(\): string \{\s*return `([\s\S]*?)`;\s*\}/);
  if (!match) throw new Error('Could not extract drawer getStyles()');
  return match[1].replace(/\$\{DRAWER_ICON_TRIGGER_DEFAULT_PX\}/g, '42');
}

function pageHtml(css) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; background: #1c1c1c; font-family: system-ui, sans-serif; }
    .card {
      width: 360px; margin: 24px; padding: 16px 16px 16px 20px;
      background: #2b2b2b; border-radius: 16px; color: #eee;
      display: flex; align-items: center; justify-content: space-between;
    }
    .meta .title { font-size: 22px; font-weight: 600; }
    .meta .sub { color: #888; margin-top: 8px; }
    ${css}
    .drawer-trigger-wrapper { width: ${BUTTON_PX}px; height: ${BUTTON_PX}px; }
    .overlay {
      position: absolute; left: 0; top: 0; right: 0; bottom: 0; pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="meta">
      <div class="title">Living Room</div>
      <div class="sub">N/A</div>
    </div>
    <div class="drawer-trigger-wrapper" style="position: relative;">
      <button type="button" class="drawer-trigger-icon-btn" id="btn"
        style="background: #03a9f4; color: #fff;">
        <ha-icon icon="mdi:exclamation" style="color: #fff;"></ha-icon>
      </button>
      <svg class="overlay" id="overlay"></svg>
    </div>
  </div>
  <script>
    class HaSvgIcon extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = \`
          <style>
            :host {
              display: var(--ha-icon-display, inline-flex);
              align-items: center;
              justify-content: center;
              position: relative;
              vertical-align: middle;
              fill: var(--icon-primary-color, currentcolor);
              width: var(--mdc-icon-size, 24px);
              height: var(--mdc-icon-size, 24px);
            }
            svg { width: 100%; height: 100%; pointer-events: none; display: block; }
          </style>
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
            <path d="${MDI_EXCLAMATION}"></path>
          </svg>
        \`;
      }
    }
    class HaIcon extends HTMLElement {
      connectedCallback() {
        this.style.fill = 'currentColor';
        if (!this.querySelector('ha-svg-icon')) {
          this.appendChild(document.createElement('ha-svg-icon'));
        }
      }
    }
    customElements.define('ha-svg-icon', HaSvgIcon);
    customElements.define('ha-icon', HaIcon);

    window.__measure = () => {
      const btn = document.getElementById('btn');
      const icon = btn.querySelector('ha-icon');
      const svgHost = icon.querySelector('ha-svg-icon');
      const svg = svgHost.shadowRoot.querySelector('svg');
      const path = svg.querySelector('path');
      const br = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
      };
      const button = br(btn);
      const iconBox = br(icon);
      const svgBox = br(svg);
      const glyph = br(path);
      const overlay = document.getElementById('overlay');
      const wrap = btn.getBoundingClientRect();
      overlay.setAttribute('width', String(wrap.width));
      overlay.setAttribute('height', String(wrap.height));
      overlay.innerHTML = '';
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('x2', String(wrap.width));
      line.setAttribute('y1', String(wrap.height / 2));
      line.setAttribute('y2', String(wrap.height / 2));
      line.setAttribute('stroke', '#e53935');
      line.setAttribute('stroke-width', '3');
      overlay.appendChild(line);
      return {
        button, iconBox, svgBox, glyph,
        svgDy: +(svgBox.cy - button.cy).toFixed(2),
        glyphDy: +(glyph.cy - button.cy).toFixed(2),
        mdc: getComputedStyle(svgHost).getPropertyValue('--mdc-icon-size').trim(),
        iconDisplay: getComputedStyle(icon).display,
        svgHostSize: { w: svgBox.w, h: svgBox.h },
      };
    };
  </script>
</body>
</html>`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  const css = await drawerTriggerCss();
  const html = pageHtml(css);

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  await new Promise(resolve => server.listen(PORT, resolve));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 280 } });
  await page.goto(`http://127.0.0.1:${PORT}/`);
  const metrics = await page.evaluate(() => window.__measure());
  const shot = path.join(OUT_DIR, 'drawer-icon-center.png');
  const art = path.join(ARTIFACT_DIR, 'drawer-icon-center.png');
  await page.locator('.card').screenshot({ path: shot });
  await fs.copyFile(shot, art);
  await fs.writeFile(path.join(ARTIFACT_DIR, 'metrics.json'), JSON.stringify(metrics, null, 2));
  await fs.writeFile(path.join(OUT_DIR, 'metrics.json'), JSON.stringify(metrics, null, 2));

  await browser.close();
  server.close();

  const dy = Math.abs(metrics.glyphDy);
  const ok = dy <= TOL_PX;
  console.log(JSON.stringify({ ok, tolPx: TOL_PX, ...metrics }, null, 2));
  if (!ok) {
    console.error(
      `FAIL: glyph is ${metrics.glyphDy}px from the button centre (tolerance ${TOL_PX}px)`
    );
    process.exit(1);
  }
  console.log(`PASS: glyph within ${TOL_PX}px of the button centre`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
