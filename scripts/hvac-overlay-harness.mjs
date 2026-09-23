/**
 * Pixel-measure the Konijntje HVAC overlay at mobile and desktop column
 * widths. The Off label (info) and mode chevron (dropdown) must sit beside
 * each other on the gauge — not spread with column width, and not stacked
 * as "Offv".
 *
 *   npx webpack -c webpack.demo.config.js
 *   node scripts/hvac-overlay-harness.mjs
 *
 * Exit 0 only when every viewport assertion passes.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE = path.join(ROOT, 'dist-demo', 'ultra-card-demo.js');
const OUT_DIR = path.join(ROOT, '.harness-output', 'hvac-overlay');
const PORT = 8793;

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 720 },
  { name: 'desktop', width: 1100, height: 800 },
];

const MAX_OFF_CHEVRON_GAP = 16;
const MIN_OFF_CHEVRON_GAP = 0;
const MAX_VIEWPORT_GAP_DELTA = 8;
const MAX_OFF_TEMP_OVERLAP = 4;

const MDI_CSS = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';

const HOST_PAGE = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${MDI_CSS}">
<style>
  html,body{margin:0;background:#111;color:#eee;font-family:system-ui,sans-serif}
  :root{
    --primary-text-color:#eee;
    --secondary-text-color:#9aa0a6;
    --primary-color:#03a9f4;
    --card-background-color:#1c1c1c;
    --divider-color:#333;
    --ha-card-background:#1c1c1c;
  }
  #stage{margin:48px auto 24px;background:#1c1c1c;border-radius:12px;padding:16px;box-sizing:border-box;overflow:visible}
</style></head><body><div id="stage"></div>
<script src="/ultra-card-demo.js"></script></body></html>`;

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

function box(r) {
  return {
    x: round(r.x),
    y: round(r.y),
    w: round(r.width),
    h: round(r.height),
    left: round(r.left),
    right: round(r.right),
    top: round(r.top),
    bottom: round(r.bottom),
  };
}

function round(n) {
  return Math.round(n * 10) / 10;
}

async function renderOverlay(page, columnWidth) {
  await page.setViewportSize({ width: Math.max(columnWidth + 80, 420), height: 800 });
  await page.evaluate(width => {
    const stage = document.getElementById('stage');
    stage.style.width = `${width}px`;
  }, columnWidth);

  await page.evaluate(async () => {
    const { registry, hass, lit } = window.UCDemo;
    await Promise.all(
      ['vertical', 'horizontal', 'gauge', 'info', 'dropdown'].map(t =>
        registry.ensureModuleLoaded(t)
      )
    );

    const climate = hass.states['climate.hvac'] || { attributes: {} };
    hass.__setState('climate.hvac', 'off', {
      ...climate.attributes,
      friendly_name: 'AC Living Room',
      hvac_modes: ['off', 'heat', 'cool'],
      temperature: 21.5,
      current_temperature: 23,
    });
    hass.__setState('sensor.living_room_temperature', '23.0', {
      friendly_name: 'Living Room Temperature',
      unit_of_measurement: '°C',
      device_class: 'temperature',
    });

    const mk = (type, id, extra = {}) => {
      const base = registry.createDefaultModule(type, id, hass);
      return Object.assign(base, extra);
    };

    const gauge = mk('gauge', 'hvac-gauge', {
      entity: 'sensor.living_room_temperature',
      value_type: 'entity',
      gauge_style: 'modern',
      gauge_size: 160,
      gauge_thickness: 8,
      pointer_enabled: false,
      show_value: true,
      value_position: 'center',
      value_bold: true,
      show_name: false,
      name_position: 'none',
      show_min_max: false,
      smart_scaling: true,
      value_font_size: 22,
      value_color: 'var(--primary-text-color)',
      value_format: '%.1f C°',
      value_x_offset: 1,
      value_y_offset: 25,
      min_value: 0,
      max_value: 30,
      gauge_color_mode: 'solid',
      gauge_color: 'rgba(102, 102, 102, 0.95)',
      gauge_background_color: 'rgba(102, 102, 102, 0.30)',
    });

    const infoBase = mk('info', 'hvac-off');
    const infoEntity = {
      ...(infoBase.info_entities?.[0] || {}),
      id: 'hvac-off-entity',
      entity: 'climate.hvac',
      name: 'AC Living Room',
      icon: 'mdi:power',
      show_name: false,
      show_icon: true,
      icon_size: 21,
      text_size: 14,
      icon_gap: 3,
      icon_position: 'left',
      state_alignment: 'start',
      overall_alignment: 'center',
    };
    const info = Object.assign(infoBase, {
      info_entities: [infoEntity],
      margin_top: '8px',
      margin_bottom: '8px',
    });

    const dropdown = mk('dropdown', 'hvac-mode', {
      source_mode: 'manual',
      closed_title_mode: 'custom',
      closed_title_custom: '\u2800\u2800\u2800\u2800\u2800\u2800',
      control_alignment: 'center',
      control_icon_side: 'right',
      background_color: 'transparent',
      border_color: 'transparent',
      current_selection: 'off',
      options: [
        { id: 'opt-heat', label: 'heat', icon: 'mdi:heat-wave', icon_color: '#FF0000' },
        { id: 'opt-cool', label: 'cool', icon: 'mdi:snowflake' },
        { id: 'opt-dry', label: 'dry', icon: 'mdi:water-opacity', icon_color: '#FFCC99' },
        { id: 'opt-off', label: 'off', icon: 'mdi:power', icon_color: '#666666' },
      ],
      design: {
        smart_scaling: false,
        overflow: 'visible',
        background_color: 'transparent',
        border: { radius: 0, style: 'solid', width: '1px', color: 'transparent' },
        margin_top: '8px',
        margin_bottom: '13px',
      },
      margin_top: '8px',
      margin_bottom: '13px',
    });

    const overlay = mk('horizontal', 'hvac-overlay', {
      alignment: 'space-between',
      gap: -97,
      gap_unit: 'px',
      wrap: false,
      vertical_alignment: 'center',
      modules: [info, dropdown],
      margin_top: '-9rem',
      margin_bottom: '8px',
      design: {
        margin_top: '-9rem',
        margin_bottom: '8px',
      },
    });

    const column = mk('vertical', 'hvac-column', {
      alignment: 'center',
      horizontal_alignment: 'center',
      gap: 0,
      gap_unit: 'px',
      modules: [gauge, overlay],
    });

    const handler = registry.getModule('vertical');
    const tpl = handler.renderPreview(
      column,
      hass,
      { type: 'custom:ultra-card', layout: { rows: [] } },
      'live'
    );
    const stage = document.getElementById('stage');
    const holder = document.createElement('div');
    holder.id = 'hvac-holder';
    stage.replaceChildren(holder);
    lit.render(tpl, holder);
    return { ok: true };
  });

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function measure(page) {
  return page.evaluate(() => {
    const round = n => Math.round(n * 10) / 10;
    const boxOf = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: round(r.x),
        y: round(r.y),
        w: round(r.width),
        h: round(r.height),
        left: round(r.left),
        right: round(r.right),
        top: round(r.top),
        bottom: round(r.bottom),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    };

    const off =
      [...document.querySelectorAll('.entity-value')].find(el => /off/i.test(el.textContent || '')) ||
      [...document.querySelectorAll('*')].find(
        el => (el.textContent || '').trim().toLowerCase() === 'off' && el.children.length === 0
      );
    const chevron =
      document.querySelector('.dropdown-chevron') ||
      document.querySelector('.dropdown-chevron-container');
    const temp =
      document.querySelector('.uc-gauge-value-center') ||
      [...document.querySelectorAll('*')].find(el => /23\.0/.test(el.textContent || ''));
    const overlayRow = document.querySelector(
      '.horizontal-preview-content, .horizontal-module-preview'
    );
    const blankTitle = document.querySelector('.uc-blank-closed-title');
    const braille = [...document.querySelectorAll('span')].some(el =>
      /[\u2800]/.test(el.textContent || '')
    );
    const dump = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return round(r.width);
    };
    const infoRoot = document.querySelector('.info-module-container');
    const dropdownRoot = document.querySelector('.dropdown-module-container');
    const selection = document.querySelector('.dropdown-selection');

    const offBox = boxOf(off);
    const chevronBox = boxOf(chevron);
    const tempBox = boxOf(temp);
    const rowBox = boxOf(overlayRow);

    const gap = offBox && chevronBox ? round(chevronBox.left - offBox.right) : null;
    const overlap = gap !== null && gap < 0;
    const offTempGap = offBox && tempBox ? round(tempBox.top - offBox.bottom) : null;
    const clusterMid = offBox && chevronBox ? round((offBox.left + chevronBox.right) / 2) : null;
    const rowMid = rowBox ? round(rowBox.left + rowBox.w / 2) : null;

    return {
      off: offBox,
      chevron: chevronBox,
      temp: tempBox,
      row: rowBox,
      gap,
      overlap,
      offTempGap,
      clusterMid,
      rowMid,
      clusterOffset: clusterMid !== null && rowMid !== null ? round(clusterMid - rowMid) : null,
      hasBlankTitleClass: !!blankTitle,
      hasBrailleTitle: braille,
      infoWidth: dump(infoRoot),
      dropdownWidth: dump(dropdownRoot),
      selectionWidth: dump(selection),
      bodyText: (document.getElementById('stage')?.innerText || '').slice(0, 400),
    };
  });
}

async function openMenu(page) {
  const trigger = page.locator('.dropdown-selected').first();
  await trigger.click();
  await page.waitForTimeout(350);
  return page.evaluate(() => {
    const round = n => Math.round(n * 10) / 10;
    const menu = [...document.querySelectorAll('.dropdown-options')].find(
      el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0
    );
    if (!menu) return { found: false };
    const r = menu.getBoundingClientRect();
    const trig = document.querySelector('.dropdown-selected').getBoundingClientRect();
    const options = [...menu.querySelectorAll('.dropdown-option')].map(opt => {
      const label = [...opt.querySelectorAll('span')].find(s =>
        /^(heat|cool|dry|off)$/i.test((s.textContent || '').trim())
      );
      const lr = label ? label.getBoundingClientRect() : null;
      return {
        text: (opt.textContent || '').trim(),
        labelRight: lr ? round(lr.right) : null,
        labelWidth: lr ? round(lr.width) : null,
      };
    });
    return {
      found: true,
      left: round(r.left),
      right: round(r.right),
      width: round(r.width),
      top: round(r.top),
      triggerBottom: round(trig.bottom),
      triggerMid: round(trig.left + trig.width / 2),
      viewportWidth: window.innerWidth,
      options,
    };
  });
}

function assertMenu(name, m) {
  const errors = [];
  if (!m.found) return [`${name}: dropdown menu did not open`];
  if (m.options.length !== 4) errors.push(`${name}: expected 4 options, saw ${m.options.length}`);
  for (const o of m.options) {
    if (o.labelRight === null) {
      errors.push(`${name}: option "${o.text}" has no visible label`);
    } else if (o.labelRight > m.right + 0.5) {
      errors.push(`${name}: option "${o.text}" label clipped (label right ${o.labelRight} > menu right ${m.right})`);
    }
  }
  if (m.left < 0 || m.right > m.viewportWidth) {
    errors.push(`${name}: menu leaves the viewport (${m.left}–${m.right} of ${m.viewportWidth})`);
  }
  if (Math.abs(m.top - m.triggerBottom) > 4) {
    errors.push(`${name}: menu top ${m.top} is not attached to the trigger (${m.triggerBottom})`);
  }
  return errors;
}

function assertViewport(name, m) {
  const errors = [];
  if (!m.off) errors.push(`${name}: Off label not found. Body: ${m.bodyText}`);
  if (!m.chevron) errors.push(`${name}: chevron not found`);
  if (!m.temp) errors.push(`${name}: gauge temperature not found`);
  if (m.hasBrailleTitle) errors.push(`${name}: Braille spacer title is still taking layout`);
  if (!m.hasBlankTitleClass) errors.push(`${name}: dropdown did not collapse the blank closed title`);
  if (m.gap === null) {
    errors.push(`${name}: could not measure Off/chevron gap`);
  } else {
    if (m.overlap) errors.push(`${name}: Off and chevron overlap by ${Math.abs(m.gap)}px (Offv)`);
    if (m.gap < MIN_OFF_CHEVRON_GAP || m.gap > MAX_OFF_CHEVRON_GAP) {
      errors.push(
        `${name}: Off→chevron gap is ${m.gap}px (want ${MIN_OFF_CHEVRON_GAP}–${MAX_OFF_CHEVRON_GAP}px)`
      );
    }
  }
  if (m.offTempGap !== null && m.offTempGap < -MAX_OFF_TEMP_OVERLAP) {
    errors.push(`${name}: Off overlaps the temperature by ${Math.abs(m.offTempGap)}px`);
  }
  return errors;
}

async function main() {
  try {
    await fs.access(BUNDLE);
  } catch {
    console.error(`Missing ${path.relative(ROOT, BUNDLE)} — run: npx webpack -c webpack.demo.config.js`);
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch();
  const results = [];
  const errors = [];

  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.UCDemo, null, { timeout: 60000 });
    await page.evaluate(() => document.fonts.load('24px "Material Design Icons"'));
    await page.evaluate(() => document.fonts.ready);

    for (const vp of VIEWPORTS) {
      await renderOverlay(page, vp.width);
      const metrics = await measure(page);
      results.push({ viewport: vp.name, width: vp.width, ...metrics });
      errors.push(...assertViewport(vp.name, metrics));
      await page.screenshot({
        path: path.join(OUT_DIR, `${vp.name}.png`),
        fullPage: true,
      });
      console.log(
        `${vp.name} (${vp.width}px): Off→chevron gap=${metrics.gap}px overlap=${metrics.overlap} off/temp=${metrics.offTempGap}px clusterOffset=${metrics.clusterOffset}px infoW=${metrics.infoWidth} dropW=${metrics.dropdownWidth} selW=${metrics.selectionWidth}`
      );

      const menu = await openMenu(page);
      results[results.length - 1].menu = menu;
      errors.push(...assertMenu(vp.name, menu));
      await page.screenshot({
        path: path.join(OUT_DIR, `${vp.name}-open.png`),
        fullPage: true,
      });
      console.log(
        `${vp.name} menu: width=${menu.width}px left=${menu.left} right=${menu.right} options=${(menu.options || [])
          .map(o => `${o.text}:${o.labelWidth}`)
          .join(',')}`
      );
      await page.keyboard.press('Escape');
      await page.mouse.click(5, 5);
    }

    if (results.length === 2 && results[0].gap !== null && results[1].gap !== null) {
      const delta = Math.abs(results[0].gap - results[1].gap);
      if (delta > MAX_VIEWPORT_GAP_DELTA) {
        errors.push(
          `Off→chevron gap drifted ${delta}px between ${results[0].viewport} and ${results[1].viewport} (max ${MAX_VIEWPORT_GAP_DELTA}px)`
        );
      }
    }
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }

  await fs.writeFile(path.join(OUT_DIR, 'metrics.json'), JSON.stringify(results, null, 2));

  if (errors.length) {
    console.error('\nHVAC overlay harness FAILED:');
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(`\nHVAC overlay harness passed (${VIEWPORTS.length} viewports).`);
  console.log(`Screenshots: ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
