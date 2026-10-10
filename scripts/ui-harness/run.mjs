#!/usr/bin/env node
/**
 * Ultra Card UI harness: renders every module on a real Home Assistant, in light
 * and dark, at desktop and phone widths, opens each module's editor tabs, clicks
 * every control, and writes a browsable report.
 *
 *   HA_TOKEN_FILE=~/.ha55-token node scripts/ui-harness/run.mjs [options]
 *
 * Options
 *   --url=http://192.168.4.55:8123   HA base URL (env HA_URL)
 *   --dashboard=/lovelace/tests       any dashboard path; the harness draws over it and never edits it
 *   --only=gauge,text                 limit to these module types
 *   --skip-editor                     card checks only
 *   --skip-interactions               no clicking
 *   --skip-mobile                     desktop only
 *   --themes=light,dark               which HA themes to run
 *   --headed [--slowmo=150]           watch it run
 *   --out=DIR                         output folder (default .harness-output/ui-harness/<timestamp>)
 *
 * Auth: a long-lived access token from env HA_TOKEN or the file in HA_TOKEN_FILE
 * (default ~/.ha55-token). It is handed to the browser only, never printed.
 *
 * Safety: cards get a copy of hass whose service calls and other writes are
 * recorded instead of sent (see safeHass in page-probe.js), and the events a
 * card fires to open dialogs or navigate are swallowed. Clicking every button
 * changes nothing on the instance.
 *
 * Needs a deployed build that includes the harness hook in src/index.ts
 * (window.__UC_HARNESS__ when localStorage `uc-ui-harness` is set).
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeReport } from './report.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');

/* ───────────────────────── options ───────────────────────── */

const argv = process.argv.slice(2);
const flag = name => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const hit = argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const HA_URL = (opt('url', process.env.HA_URL || 'http://192.168.4.55:8123') || '').replace(
  /\/+$/,
  ''
);
const DASHBOARD = opt('dashboard', process.env.HA_DASHBOARD || '/lovelace/tests');
const ONLY = (opt('only', '') || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const THEMES = (opt('themes', 'light,dark') || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const SKIP_EDITOR = flag('skip-editor');
const SKIP_INTERACTIONS = flag('skip-interactions');
const SKIP_MOBILE = flag('skip-mobile');
const HEADED = flag('headed');
const SLOWMO = Number(opt('slowmo', HEADED ? '0' : '0'));
const STAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUT = path.resolve(opt('out', path.join(ROOT, '.harness-output', 'ui-harness', STAMP)));

/** Recycle the tab every N modules: some modules leave WebGL contexts and media behind. */
const RECYCLE_EVERY = 30;
const RENDER_SETTLE_MS = 2200;
const CLICK_SETTLE_MS = 650;
/** Modules that paint outside their card (view backgrounds, nav bars, screensavers). */
const OVERLAY_TYPES = new Set([
  'background',
  'video_bg',
  'dynamic_weather',
  'living_canvas',
  'navigation',
  'screensaver',
]);
const MAX_CLICKS = Number(opt('clicks', '6'));

const VIEWPORTS = {
  desktop: {
    viewport: { width: 1280, height: 1600 },
    deviceScaleFactor: 1,
    slot: 460,
    mobile: false,
  },
  mobile: {
    viewport: { width: 390, height: 1400 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    slot: 374,
    mobile: true,
  },
  editor: {
    viewport: { width: 1280, height: 2400 },
    deviceScaleFactor: 1,
    slot: 560,
    mobile: false,
  },
};

async function readToken() {
  if (process.env.HA_TOKEN) return process.env.HA_TOKEN.trim();
  const file = (process.env.HA_TOKEN_FILE || '~/.ha55-token').replace(/^~/, os.homedir());
  try {
    return (await fs.readFile(file, 'utf8')).trim();
  } catch {
    throw new Error(`No HA token: set HA_TOKEN or put a long-lived token in ${file}`);
  }
}

/* ───────────────────────── page setup ───────────────────────── */

const PROBE_JS = await fs.readFile(path.join(HERE, 'page-probe.js'), 'utf8');
const FIXTURES_JS = await fs.readFile(path.join(HERE, 'page-fixtures.js'), 'utf8');

/** Console errors and page errors, attributed to whichever module is on screen. */
const errorSink = { current: null, list: [] };

async function newContext(browser, kind, token) {
  const { slot, mobile, ...ctxOpts } = VIEWPORTS[kind];
  const context = await browser.newContext({ ...ctxOpts, ignoreHTTPSErrors: true });
  await context.addInitScript(
    ({ url, token }) => {
      try {
        localStorage.setItem(
          'hassTokens',
          JSON.stringify({
            hassUrl: url,
            clientId: `${url}/`,
            expires: Date.now() + 3650 * 864e5,
            refresh_token: '',
            access_token: token,
            token_type: 'Bearer',
            expires_in: 315360000,
          })
        );
        localStorage.setItem('uc-ui-harness', '1');
        // Skip the editor's first-run tour so it does not cover the settings panel.
        localStorage.setItem('ultra-card-editor-seen', '1');
      } catch {
        /* storage blocked */
      }
    },
    { url: HA_URL, token }
  );
  return { context, slot, mobile };
}

async function openHa(context) {
  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() !== 'error' || !errorSink.current) return;
    errorSink.list.push({ module: errorSink.current, text: msg.text().slice(0, 300) });
  });
  page.on('pageerror', err => {
    if (!errorSink.current) return;
    errorSink.list.push({
      module: errorSink.current,
      text: String(err.message || err).slice(0, 300),
    });
  });
  await page.goto(HA_URL + DASHBOARD, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => {
      const ha = document.querySelector('home-assistant');
      return !!(ha && ha.hass && ha.hass.states && customElements.get('ultra-card'));
    },
    null,
    { timeout: 90000 }
  );
  const hooked = await page
    .waitForFunction(() => !!window.__UC_HARNESS__, null, { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  if (!hooked) {
    throw new Error(
      'The Ultra Card build on this Home Assistant has no harness hook (window.__UC_HARNESS__). ' +
        'Deploy a build that includes src/index.ts from this branch, then hard-refresh.'
    );
  }
  await page.addScriptTag({ content: PROBE_JS });
  await page.addScriptTag({ content: FIXTURES_JS });
  await page.evaluate(async () => {
    const host = document.createElement('div');
    host.id = 'uc-harness';
    host.style.cssText =
      'position:fixed;inset:0;z-index:2147483000;overflow:auto;padding:16px 8px;box-sizing:border-box;' +
      'background:var(--primary-background-color);color:var(--primary-text-color);' +
      'font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif)';
    // Inside home-assistant's shadow root, not on <body>: newer HA elements read
    // localize, entities and devices from Lit context providers on that root, and
    // a picker mounted outside it renders blank ("reading 'localize'").
    const ha = document.querySelector('home-assistant');
    (ha && ha.shadowRoot ? ha.shadowRoot : document.body).appendChild(host);
    window.__uchHost = () => (host.isConnected ? host : null);

    // HA lazy-loads its form and picker elements; the module editors need them.
    // Opening two core card editors pulls them in, the same way HA's own editor does.
    try {
      const helpers = await window.loadCardHelpers();
      for (const cfg of [
        { type: 'entities', entities: [] },
        { type: 'tile', entity: 'sun.sun' },
      ]) {
        const card = await helpers.createCardElement(cfg);
        if (card.constructor.getConfigElement) await card.constructor.getConfigElement();
      }
    } catch {
      /* older HA: editors may show unstyled pickers */
    }
    // Load every module implementation up front so containers render real children.
    const { registry } = window.__UC_HARNESS__;
    await Promise.all(
      registry.getAllModuleMetadata().map(m => registry.ensureModuleLoaded(m.type).catch(() => {}))
    );
  });
  return page;
}

async function setTheme(page, theme) {
  const dark = theme === 'dark';
  const applied = await page.evaluate(async dark => {
    const ha = document.querySelector('home-assistant');
    ha.dispatchEvent(
      new CustomEvent('settheme', {
        detail: { theme: 'default', dark },
        bubbles: true,
        composed: true,
      })
    );
    await new Promise(r => setTimeout(r, 400));
    return !!(ha.hass.themes && ha.hass.themes.darkMode);
  }, dark);
  if (applied !== dark) console.warn(`  ! asked HA for ${theme} theme but darkMode=${applied}`);
}

/* ───────────────────────── in-page actions ───────────────────────── */

async function listModules(page) {
  return page.evaluate(() =>
    window.__UC_HARNESS__.registry.getAllModuleMetadata().map(m => ({
      type: m.type,
      title: m.title,
      category: m.category,
      pro: (m.tags || []).includes('pro'),
    }))
  );
}

async function buildConfig(page, type) {
  return page.evaluate(type => {
    const { registry } = window.__UC_HARNESS__;
    const hass = document.querySelector('home-assistant').hass;
    const pick = (domain, test) => {
      const hit = Object.values(hass.states).find(
        s => s.entity_id.startsWith(domain + '.') && s.state !== 'unavailable' && (!test || test(s))
      );
      return hit ? hit.entity_id : undefined;
    };
    let n = 0;
    const ctx = { hass, pick, mk: null };
    ctx.mk = (t, extra = {}) => {
      const h = registry.getModule(t);
      if (!h) return { type: t, id: `uch_${t}_${n++}` };
      const m = h.createDefault(`uch_${t}_${n++}`, hass);
      const fx = window.__ucFixtures[t];
      if (fx) fx(m, ctx);
      return Object.assign(m, extra);
    };
    const module = ctx.mk(type);
    return {
      type: 'custom:ultra-card',
      _config_version: 3,
      card_padding: 16,
      layout: { rows: [{ id: 'uch_row', columns: [{ id: 'uch_col', modules: [module] }] }] },
    };
  }, type);
}

async function renderCard(page, cfg, slotWidth) {
  await page.evaluate(
    ({ cfg, slotWidth }) => {
      const host = window.__uchHost();
      host.innerHTML = '';
      const slot = document.createElement('div');
      slot.className = 'uch-slot';
      slot.style.cssText = `width:${slotWidth}px;margin:0 auto`;
      host.appendChild(slot);
      window.__uchLog = [];
      const ha = document.querySelector('home-assistant');
      const card = document.createElement('ultra-card');
      card.setConfig(JSON.parse(JSON.stringify(cfg)));
      card.hass = window.__ucProbe.safeHass(ha.hass, window.__uchLog);
      slot.appendChild(card);
      window.__uchCard = card;
      window.__uchSlot = slot;
    },
    { cfg, slotWidth }
  );
  await page.waitForTimeout(RENDER_SETTLE_MS);
}

/**
 * Screenshot an element by its box. Locator screenshots wait for the element to
 * stop moving, which an animated module (gauges, weather, boilers) never does,
 * so each of those burned a 30s timeout.
 */
async function shoot(page, selector, file) {
  const box = await page.locator(selector).first().boundingBox({ timeout: 5000 });
  // A module that renders at zero size is reported by the empty-render check;
  // there is simply nothing to capture.
  if (!box || box.width < 1 || box.height < 1) return false;
  const vp = page.viewportSize();
  const clip = {
    x: Math.max(0, Math.floor(box.x)),
    y: Math.max(0, Math.floor(box.y)),
    width: Math.ceil(Math.min(box.width, vp.width - Math.max(0, box.x))),
    height: Math.ceil(Math.min(box.height, vp.height - Math.max(0, box.y))),
  };
  await page.screenshot({ path: file, clip, timeout: 10000 });
  return true;
}

/** True while the harness overlay and probe are still in the tab (a stray navigation wipes both). */
async function harnessAlive(page) {
  return page
    .evaluate(
      () =>
        !!window.__uchHost && !!window.__uchHost() && !!window.__ucProbe && !!window.__UC_HARNESS__
    )
    .catch(() => false);
}

async function checkSlot(page, selector, opts) {
  return page.evaluate(
    ({ selector, opts }) => {
      const root =
        selector === 'slot'
          ? window.__uchSlot
          : window.__ucProbe.deepQuery(window.__uchHost(), selector);
      if (!root)
        return {
          findings: [
            { check: 'missing', severity: 'error', message: `${selector} not found`, where: '' },
          ],
          stats: {},
        };
      const res = window.__ucProbe.check(root, opts);
      // An empty card says why: hidden by the card itself, or rendered nothing.
      const card = selector === 'slot' && window.__uchCard;
      if (card && res.findings.some(f => f.check === 'empty-render')) {
        const sr = card.shadowRoot;
        res.diagnostics = {
          display: card.style.display || getComputedStyle(card).display,
          invisibleAttr: card.getAttribute('data-invisible'),
          shadowChildren: sr ? sr.childElementCount : -1,
          html: sr
            ? sr.innerHTML
                .replace(/<style[^]*?<\/style>/g, '')
                .replace(/\s+/g, ' ')
                .slice(0, 600)
            : '',
        };
      }
      return res;
    },
    { selector, opts }
  );
}

/* ───────────────────────── passes ───────────────────────── */

const results = new Map(); // type -> result

function resultFor(meta) {
  if (!results.has(meta.type)) {
    results.set(meta.type, {
      ...meta,
      config: null,
      card: {},
      editor: {},
      interactions: [],
      errors: [],
      notes: [],
    });
  }
  return results.get(meta.type);
}

const rel = p => path.relative(OUT, p).split(path.sep).join('/');

async function cardPass(browser, token, kind, modules, configs) {
  const { context, slot, mobile } = await newContext(browser, kind, token);
  let page = await openHa(context);
  try {
    for (const theme of THEMES) {
      await setTheme(page, theme);
      let i = 0;
      for (const meta of modules) {
        if (i && i % RECYCLE_EVERY === 0) {
          await page.close();
          page = await openHa(context);
          await setTheme(page, theme);
        }
        i++;
        const r = resultFor(meta);
        const cfg = configs[meta.type];
        errorSink.current = `${meta.type} (card ${kind} ${theme})`;
        if (!(await harnessAlive(page))) {
          console.log('  ! tab lost the harness (navigated away); reopening');
          await page.close().catch(() => {});
          page = await openHa(context);
          await setTheme(page, theme);
        }
        try {
          await renderCard(page, cfg, slot);
          const res = await checkSlot(page, 'slot', { mode: 'card', mobile });
          if (OVERLAY_TYPES.has(meta.type)) {
            for (const f of res.findings.filter(f => f.check === 'empty-render')) {
              f.severity = 'info';
              f.message = 'Overlay module: draws behind or over the view, not inside the card';
            }
          }
          const file = path.join(OUT, 'shots', `${meta.type}.card.${kind}.${theme}.png`);
          const captured = await shoot(page, '#uc-harness .uch-slot', file);
          (r.card[kind] ||= {})[theme] = { shot: captured ? rel(file) : null, ...res };
          if (!SKIP_INTERACTIONS && kind === 'desktop' && theme === THEMES[THEMES.length - 1]) {
            r.interactions = await interact(page, cfg, slot, meta.type);
          }
          const bad = res.findings.filter(f => f.severity !== 'info').length;
          console.log(
            `  ${bad ? '·' : '✓'} ${meta.type.padEnd(22)} card ${kind}/${theme}${bad ? `  ${bad} finding(s)` : ''}`
          );
        } catch (err) {
          (r.card[kind] ||= {})[theme] = {
            shot: null,
            findings: [
              {
                check: 'harness-error',
                severity: 'error',
                message: String(err.message || err).split('\n')[0],
                where: '',
              },
            ],
            stats: {},
          };
          console.log(
            `  ✗ ${meta.type.padEnd(22)} card ${kind}/${theme}  ${String(err.message || err).split('\n')[0]}`
          );
        }
      }
    }
  } finally {
    errorSink.current = null;
    await context.close();
  }
}

/** Click each control once and record what it did. */
async function interact(page, cfg, slotWidth, type) {
  const targets = await page.evaluate(
    max => window.__ucProbe.clickTargets(window.__uchSlot, max),
    MAX_CLICKS
  );
  const out = [];
  let dirty = false;
  for (const t of targets) {
    if (dirty) {
      await renderCard(page, cfg, slotWidth);
      dirty = false;
    }
    const before = await page.evaluate(() => {
      window.__uchLog.length = 0;
      window.__uchDisarm = window.__ucProbe.armEvents(window.__uchLog);
      window.__uchBodyKids = new Set(document.body.children);
      return window.__ucProbe.signature(window.__uchSlot);
    });
    errorSink.current = `${type} (click “${t.label}”)`;
    await page.mouse.click(t.x, t.y);
    await page.waitForTimeout(CLICK_SETTLE_MS);
    const after = await page.evaluate(() => {
      const opened = [...document.body.children].filter(
        el => !window.__uchBodyKids.has(el) && el.id !== 'uc-harness' && el.tagName !== 'SCRIPT'
      );
      const res = {
        effects: window.__uchLog.map(e => ({ kind: e.kind, type: e.type, detail: e.detail })),
        sig: window.__ucProbe.signature(window.__uchSlot),
        opened: opened.map(el => el.tagName.toLowerCase()),
      };
      opened.forEach(el => el.remove());
      window.__uchDisarm();
      return res;
    });
    await page.keyboard.press('Escape').catch(() => {});
    const changed = after.sig !== before;
    if (changed || after.opened.length) dirty = true;
    const what = [
      ...after.effects.map(
        e =>
          `${e.kind === 'service' ? 'calls' : e.kind === 'event' ? 'fires' : e.kind} ${e.type}${e.detail ? ` (${e.detail})` : ''}`
      ),
      ...(after.opened.length ? [`opens ${after.opened.join(', ')}`] : []),
      ...(changed && !after.effects.length && !after.opened.length ? ['changes the card'] : []),
    ];
    out.push({
      label: t.label,
      where: t.where,
      result: what.length ? what.join('; ') : 'nothing happened',
      dead: !what.length,
    });
  }
  return out;
}

async function editorPass(browser, token, modules, configs) {
  const { context, slot } = await newContext(browser, 'editor', token);
  let page = await openHa(context);
  try {
    for (const theme of THEMES) {
      await setTheme(page, theme);
      let i = 0;
      for (const meta of modules) {
        if (i && i % RECYCLE_EVERY === 0) {
          await page.close();
          page = await openHa(context);
          await setTheme(page, theme);
        }
        i++;
        const r = resultFor(meta);
        errorSink.current = `${meta.type} (editor ${theme})`;
        if (!(await harnessAlive(page))) {
          console.log('  ! tab lost the harness (navigated away); reopening');
          await page.close().catch(() => {});
          page = await openHa(context);
          await setTheme(page, theme);
        }
        const tabs = [];
        try {
          const opened = await page.evaluate(
            async ({ cfg, slotWidth }) => {
              const host = window.__uchHost();
              host.innerHTML = '';
              const slot = document.createElement('div');
              slot.className = 'uch-editor';
              slot.style.cssText = `width:${slotWidth}px;margin:0 auto;background:var(--card-background-color);border-radius:12px`;
              host.appendChild(slot);
              window.__uchLog = [];
              window.__uchCfgChanges = 0;
              const ha = document.querySelector('home-assistant');
              const ed = await customElements.get('ultra-card').getConfigElement();
              ed.hass = window.__ucProbe.safeHass(ha.hass, window.__uchLog);
              ed.setConfig(JSON.parse(JSON.stringify(cfg)));
              ed.addEventListener('config-changed', () => window.__uchCfgChanges++);
              slot.appendChild(ed);
              await new Promise(r => setTimeout(r, 1200));
              const layout = window.__ucProbe.deepQuery(ed, 'ultra-layout-tab');
              if (!layout) return { error: 'editor has no layout tab' };
              const changesOnOpen = window.__uchCfgChanges;
              layout._openModuleSettings(0, 0, 0);
              await layout.updateComplete;
              await new Promise(r => setTimeout(r, 900));
              const panel = window.__ucProbe.deepQuery(layout, '.module-settings-panel');
              if (!panel) return { error: 'module settings panel did not open' };
              const tabs = window.__ucProbe
                .deepQueryAll(panel, '.module-tabs > .module-tab')
                .map(b => b.textContent.replace(/\s+/g, ' ').trim());
              window.__uchLayout = layout;
              return { tabs, changesOnOpen };
            },
            { cfg: configs[meta.type], slotWidth: slot }
          );
          if (opened.error) throw new Error(opened.error);
          if (theme === THEMES[0] && opened.changesOnOpen > 0) {
            r.notes.push(
              `Opening the editor fired config-changed ${opened.changesOnOpen}× before any edit.`
            );
          }
          for (let ti = 0; ti < opened.tabs.length; ti++) {
            const name = opened.tabs[ti] || `tab ${ti + 1}`;
            await page.evaluate(async ti => {
              const panel = window.__ucProbe.deepQuery(
                window.__uchLayout,
                '.module-settings-panel'
              );
              const btn = window.__ucProbe.deepQueryAll(panel, '.module-tabs > .module-tab')[ti];
              btn.click();
              await window.__uchLayout.updateComplete;
            }, ti);
            await page.waitForTimeout(900);
            const res = await checkSlot(page, '.module-settings-panel', {
              mode: 'editor',
              mobile: false,
            });
            const file = path.join(
              OUT,
              'shots',
              `${meta.type}.editor.${theme}.${ti}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
            );
            const captured = await shoot(page, '#uc-harness .module-settings-panel', file);
            tabs.push({ name, shot: captured ? rel(file) : null, ...res });
          }
          r.editor[theme] = { tabs };
          const bad = tabs.reduce(
            (n, t) => n + t.findings.filter(f => f.severity !== 'info').length,
            0
          );
          console.log(
            `  ${bad ? '·' : '✓'} ${meta.type.padEnd(22)} editor ${theme} (${tabs.map(t => t.name).join(', ')})${bad ? `  ${bad} finding(s)` : ''}`
          );
        } catch (err) {
          r.editor[theme] = {
            tabs,
            error: String(err.message || err).split('\n')[0],
          };
          console.log(
            `  ✗ ${meta.type.padEnd(22)} editor ${theme}  ${String(err.message || err).split('\n')[0]}`
          );
        }
      }
    }
  } finally {
    errorSink.current = null;
    await context.close();
  }
}

/* ───────────────────────── main ───────────────────────── */

async function main() {
  const token = await readToken();
  await fs.mkdir(path.join(OUT, 'shots'), { recursive: true });
  console.log(`UI harness → ${HA_URL}${DASHBOARD}\nOutput: ${path.relative(ROOT, OUT)}\n`);

  const browser = await chromium.launch({ headless: !HEADED, slowMo: SLOWMO || undefined });
  const started = Date.now();
  let version = '?';
  try {
    // Configs are built once and reused everywhere, so every screenshot of a
    // module shows the same configuration.
    const { context } = await newContext(browser, 'desktop', token);
    const page = await openHa(context);
    version = await page.evaluate(() => window.__UC_HARNESS__.version);
    const haVersion = await page.evaluate(
      () => document.querySelector('home-assistant').hass.config.version
    );
    let modules = await listModules(page);
    if (ONLY.length) modules = modules.filter(m => ONLY.includes(m.type));
    modules.sort((a, b) => a.title.localeCompare(b.title));
    const configs = {};
    for (const meta of modules) {
      try {
        configs[meta.type] = await buildConfig(page, meta.type);
        resultFor(meta).config = configs[meta.type].layout.rows[0].columns[0].modules[0];
      } catch (err) {
        resultFor(meta).notes.push(`Could not build a default config: ${err.message}`);
      }
    }
    await context.close();
    modules = modules.filter(m => configs[m.type]);
    console.log(`Ultra Card ${version} on HA ${haVersion}: ${modules.length} modules\n`);

    console.log('Cards, desktop');
    await cardPass(browser, token, 'desktop', modules, configs);
    if (!SKIP_MOBILE) {
      console.log('\nCards, phone');
      await cardPass(browser, token, 'mobile', modules, configs);
    }
    if (!SKIP_EDITOR) {
      console.log('\nEditors');
      await editorPass(browser, token, modules, configs);
    }

    for (const e of errorSink.list) {
      const type = e.module.split(' ')[0];
      results.get(type)?.errors.push(e);
    }

    const run = {
      ultraCardVersion: version,
      haVersion,
      haUrl: HA_URL,
      themes: THEMES,
      startedAt: new Date(started).toISOString(),
      minutes: Math.round((Date.now() - started) / 600) / 100,
    };
    const all = [...results.values()];
    await fs.writeFile(
      path.join(OUT, 'results.json'),
      JSON.stringify({ run, modules: all }, null, 2)
    );
    const summary = await writeReport(OUT);
    console.log(
      `\nDone in ${run.minutes} min. ${summary}\nReport: ${path.join(OUT, 'index.html')}`
    );
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
