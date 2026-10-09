/**
 * Visual check: Drawer trigger left/center/right + Popup-style icon chrome.
 *
 *   node scripts/drawer-trigger-icon-harness.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTIFACT_DIR =
  process.env.HARNESS_ARTIFACT_DIR || path.join(ROOT, '.harness-output', 'drawer-trigger-icon');
const PORT = 8796;

const STYLES = {
  left: 'display: flex; justify-content: flex-start; width: 100%; pointer-events: auto; box-sizing: border-box;',
  center:
    'display: flex; justify-content: center; width: 100%; pointer-events: auto; box-sizing: border-box;',
  right: 'display: flex; justify-content: flex-end; width: 100%; pointer-events: auto; box-sizing: border-box;',
  circle:
    'display: inline-flex; align-items: center; justify-content: center; background: #03a9f4; padding: 8px; border-radius: 50%',
  rounded:
    'display: inline-flex; align-items: center; justify-content: center; background: #7e57c2; padding: 10px; border-radius: var(--uc-r-8, 8px)',
  glyph24: '--mdc-icon-size: 24px; color: #fff; display: flex;',
  glyph28: '--mdc-icon-size: 28px; color: #fff; display: flex;',
  circlePx: 40,
  roundedPx: 48,
};

async function drawerTriggerCss() {
  const src = await fs.readFile(path.join(ROOT, 'src/modules/drawer-module.ts'), 'utf8');
  const match = src.match(/getStyles\(\): string \{\s*return `([\s\S]*?)`;\s*\}/);
  if (!match) throw new Error('Could not extract drawer getStyles()');
  return match[1].replace(/\$\{DRAWER_ICON_TRIGGER_DEFAULT_PX\}/g, '42');
}

const MDI_MENU =
  'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z';

function pageHtml(css, styles) {
  const iconBtn = (extra = '') => `
    <button type="button" class="drawer-trigger-icon-btn" style="${extra}">
      <ha-icon icon="mdi:menu-open" style="color:#fff;"></ha-icon>
    </button>`;
  const sizedIcon = (chrome, glyph, px, extra = '') => `
    <div class="drawer-trigger-wrapper" style="width:${px}px;height:${px}px;">
      <button type="button" class="drawer-trigger-icon-btn" style="${chrome}; color:#fff; width:100%; height:100%; ${extra}">
        <ha-icon icon="mdi:menu-open" style="${glyph}"></ha-icon>
      </button>
    </div>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; background: #111; font-family: system-ui, sans-serif; color: #eee; }
    .page { width: 420px; padding: 16px; box-sizing: border-box; }
    h1 { font-size: 15px; margin: 0 0 12px; font-weight: 600; }
    .card {
      background: #2b2b2b; border-radius: 16px; padding: 12px 14px; margin-bottom: 12px;
    }
    .label { font-size: 11px; color: #9aa; margin-bottom: 8px; letter-spacing: .04em; text-transform: uppercase; }
    ${css}
    .drawer-trigger-icon-btn { background: #03a9f4; color: #fff; }
  </style>
</head>
<body>
  <div class="page">
    <h1>Drawer trigger alignment + icon chrome</h1>
    <div class="card">
      <div class="label">Icon Only · Left (default)</div>
      <div class="drawer-trigger-align" style="${styles.left}">
        <div class="drawer-trigger-wrapper" style="width:42px;height:42px;">${iconBtn()}</div>
      </div>
    </div>
    <div class="card">
      <div class="label">Icon Only · Center</div>
      <div class="drawer-trigger-align" style="${styles.center}">
        <div class="drawer-trigger-wrapper" style="width:42px;height:42px;">${iconBtn()}</div>
      </div>
    </div>
    <div class="card">
      <div class="label">Icon Only · Right</div>
      <div class="drawer-trigger-align" style="${styles.right}">
        <div class="drawer-trigger-wrapper" style="width:42px;height:42px;">${iconBtn()}</div>
      </div>
    </div>
    <div class="card">
      <div class="label">Circle well · 24px + 8px pad (${styles.circlePx}px)</div>
      <div class="drawer-trigger-align" style="${styles.center}">
        ${sizedIcon(styles.circle, styles.glyph24, styles.circlePx)}
      </div>
    </div>
    <div class="card">
      <div class="label">Rounded well · 28px + 10px pad (${styles.roundedPx}px)</div>
      <div class="drawer-trigger-align" style="${styles.right}">
        ${sizedIcon(styles.rounded, styles.glyph28, styles.roundedPx)}
      </div>
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
              fill: currentcolor;
              width: var(--mdc-icon-size, 24px);
              height: var(--mdc-icon-size, 24px);
            }
            svg { width: 100%; height: 100%; pointer-events: none; display: block; }
          </style>
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
            <path d="${MDI_MENU}"></path>
          </svg>
        \`;
      }
    }
    class HaIcon extends HTMLElement {
      static get observedAttributes() { return ['icon']; }
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = \`
          <style>
            :host { fill: currentcolor; }
          </style>
          <ha-svg-icon></ha-svg-icon>
        \`;
      }
    }
    customElements.define('ha-svg-icon', HaSvgIcon);
    customElements.define('ha-icon', HaIcon);

    window.__measure = () => {
      const right = document.querySelectorAll('.drawer-trigger-align')[2];
      const wrap = right.querySelector('.drawer-trigger-wrapper');
      const row = right.getBoundingClientRect();
      const box = wrap.getBoundingClientRect();
      return {
        rowWidth: Math.round(row.width),
        iconLeft: Math.round(box.left - row.left),
        iconRight: Math.round(row.right - box.right),
        rightAligned: box.left - row.left > row.width * 0.5,
      };
    };
  </script>
</body>
</html>`;
}

async function main() {
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  const styles = STYLES;
  const css = await drawerTriggerCss();
  const html = pageHtml(css, styles);

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  await new Promise(resolve => server.listen(PORT, resolve));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 452, height: 720 } });
  await page.goto(`http://127.0.0.1:${PORT}/`);
  const metrics = await page.evaluate(() => window.__measure());
  const shot = path.join(ARTIFACT_DIR, 'drawer-trigger-icon.png');
  await page.locator('.page').screenshot({ path: shot });
  await fs.writeFile(path.join(ARTIFACT_DIR, 'metrics.json'), JSON.stringify({ styles, metrics }, null, 2));

  await browser.close();
  server.close();

  if (!metrics.rightAligned) {
    console.error('FAIL: right-aligned icon is not on the right of the row', metrics);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, ...metrics }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
