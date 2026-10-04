/**
 * Pixel-measure the Konijntje HVAC overlay — the 3.10 layout bug with two
 * AC cards side by side, Off/chevron drifting, and a clipped heat/cool menu.
 *
 * The Off label (info) and mode chevron (dropdown) must sit beside each other
 * on the gauge — not spread with column width, and not stacked as "Offv".
 * Opening the chevron must show full option labels, not a clipped "he / co"
 * strip overlapping the neighbouring card.
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

const SCENARIOS = [
  { name: 'mobile', width: 390, height: 720, cards: 1, context: 'live' },
  { name: 'desktop', width: 1100, height: 800, cards: 1, context: 'live' },
  // Discord screenshot: two overlay HVAC cards on a phone, clipped menu between them.
  {
    name: 'pair-phone',
    width: 390,
    height: 720,
    cards: 2,
    context: 'dashboard',
    haCardChrome: true,
  },
  {
    name: 'pair-tablet',
    width: 768,
    height: 800,
    cards: 2,
    context: 'dashboard',
    haCardChrome: true,
  },
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
  #stage{margin:48px auto 24px;background:transparent;border-radius:12px;padding:8px;box-sizing:border-box;overflow:visible}
  .ha-card{
    background:var(--ha-card-background);
    border-radius:12px;
    overflow:hidden;
    padding:12px 8px;
    box-sizing:border-box;
    /* Typical HA card stacking trap: a transform containing-block + clipped radius. */
    transform: translateZ(0);
  }
  .card-row{display:flex;gap:8px;align-items:stretch}
  .card-row .ha-card{flex:1 1 0;min-width:0}
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

async function renderOverlay(page, scenario) {
  const viewportWidth =
    scenario.cards === 2 ? Math.max(scenario.width, 390) : Math.max(scenario.width + 80, 420);
  await page.setViewportSize({ width: viewportWidth, height: scenario.height || 800 });
  await page.evaluate(width => {
    const stage = document.getElementById('stage');
    stage.style.width = `${width}px`;
  }, scenario.width);

  await page.evaluate(async opts => {
    const { registry, hass, lit } = window.UCDemo;
    await Promise.all(
      ['vertical', 'horizontal', 'gauge', 'info', 'dropdown'].map(t =>
        registry.ensureModuleLoaded(t)
      )
    );

    const rooms = [
      {
        id: 'living',
        climate: 'climate.hvac',
        sensor: 'sensor.living_room_temperature',
        name: 'AC Living Room',
        temp: '20.0',
      },
      {
        id: 'bedroom',
        climate: 'climate.bedroom',
        sensor: 'sensor.bedroom_temperature',
        name: 'AC Bedroom',
        temp: '18.2',
      },
    ].slice(0, opts.cards);

    const ensureState = (id, fromId, state, attrs) => {
      const src = hass.states[fromId] || hass.states[id];
      if (!src) return;
      hass.states[id] = {
        ...src,
        entity_id: id,
        state,
        attributes: { ...(src.attributes || {}), ...attrs },
      };
    };

    for (const room of rooms) {
      ensureState(room.climate, 'climate.hvac', 'off', {
        friendly_name: room.name,
        hvac_modes: ['off', 'heat', 'cool'],
        temperature: 21.5,
        current_temperature: Number(room.temp),
        humidity: room.id === 'bedroom' ? 67.3 : 55,
      });
      ensureState(room.sensor, 'sensor.living_room_temperature', room.temp, {
        friendly_name: `${room.name} Temperature`,
        unit_of_measurement: '°C',
        device_class: 'temperature',
      });
    }

    const mk = (type, id, extra = {}) => {
      const base = registry.createDefaultModule(type, id, hass);
      return Object.assign(base, extra);
    };

    const buildColumn = room => {
      const gauge = mk('gauge', `hvac-gauge-${room.id}`, {
        entity: room.sensor,
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

      const infoBase = mk('info', `hvac-off-${room.id}`);
      const infoEntity = {
        ...(infoBase.info_entities?.[0] || {}),
        id: `hvac-off-entity-${room.id}`,
        entity: room.climate,
        name: room.name,
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

      const dropdown = mk('dropdown', `hvac-mode-${room.id}`, {
        source_mode: 'manual',
        closed_title_mode: 'custom',
        closed_title_custom: '\u2800\u2800\u2800\u2800\u2800\u2800',
        control_alignment: 'center',
        control_icon_side: 'right',
        background_color: 'transparent',
        border_color: 'transparent',
        current_selection: 'off',
        options: [
          { id: `opt-heat-${room.id}`, label: 'heat', icon: 'mdi:heat-wave', icon_color: '#FF0000' },
          { id: `opt-cool-${room.id}`, label: 'cool', icon: 'mdi:snowflake' },
          { id: `opt-dry-${room.id}`, label: 'dry', icon: 'mdi:water-opacity', icon_color: '#FFCC99' },
          { id: `opt-off-${room.id}`, label: 'off', icon: 'mdi:power', icon_color: '#666666' },
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

      const overlay = mk('horizontal', `hvac-overlay-${room.id}`, {
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

      return mk('vertical', `hvac-column-${room.id}`, {
        alignment: 'center',
        horizontal_alignment: 'center',
        gap: 0,
        gap_unit: 'px',
        modules: [gauge, overlay],
      });
    };

    const handler = registry.getModule('vertical');
    const stage = document.getElementById('stage');
    stage.replaceChildren();

    const wrapCard = (node, room) => {
      if (!opts.haCardChrome) return node;
      const card = document.createElement('div');
      card.className = 'ha-card';
      card.dataset.room = room.id;
      card.appendChild(node);
      return card;
    };

    if (rooms.length === 1) {
      const holder = document.createElement('div');
      holder.id = 'hvac-holder';
      holder.dataset.room = rooms[0].id;
      const wrapped = wrapCard(holder, rooms[0]);
      if (wrapped !== holder) wrapped.id = 'hvac-holder-wrap';
      stage.appendChild(wrapped === holder ? holder : wrapped);
      const tpl = handler.renderPreview(
        buildColumn(rooms[0]),
        hass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        opts.context
      );
      lit.render(tpl, holder);
    } else {
      const row = document.createElement('div');
      row.className = 'card-row';
      row.id = 'hvac-row';
      stage.appendChild(row);
      for (const room of rooms) {
        const holder = document.createElement('div');
        holder.id = `hvac-holder-${room.id}`;
        holder.dataset.room = room.id;
        row.appendChild(wrapCard(holder, room));
        const tpl = handler.renderPreview(
          buildColumn(room),
          hass,
          { type: 'custom:ultra-card', layout: { rows: [] } },
          opts.context
        );
        lit.render(tpl, holder);
      }
    }
    return { ok: true };
  }, scenario);

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
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      };
    };

    const clippingAncestor = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      let p = el.parentElement;
      while (p && p !== document.documentElement) {
        const cs = getComputedStyle(p);
        const clipX = ['hidden', 'clip', 'scroll', 'auto'].includes(cs.overflowX);
        const clipY = ['hidden', 'clip', 'scroll', 'auto'].includes(cs.overflowY);
        if (clipX || clipY) {
          const pr = p.getBoundingClientRect();
          const clippedX = clipX && (r.left < pr.left - 1 || r.right > pr.right + 1);
          const clippedY = clipY && (r.top < pr.top - 1 || r.bottom > pr.bottom + 1);
          if (clippedX || clippedY) {
            return `${p.tagName}.${(p.className || '').toString().slice(0, 80)} ${cs.overflowX}/${cs.overflowY}`;
          }
        }
        p = p.parentElement;
      }
      return null;
    };

    const holders = [...document.querySelectorAll('[id^="hvac-holder"]')];
    const roots = holders.length ? holders : [document.getElementById('stage')];

    const cards = roots.map(root => {
      const off =
        [...root.querySelectorAll('.entity-value')].find(el =>
          /^(off|n\/a)$/i.test((el.textContent || '').trim())
        ) ||
        [...root.querySelectorAll('.entity-content .entity-value, .info-entity-item .entity-value')].find(
          Boolean
        );
      const chevron =
        root.querySelector('.dropdown-chevron') || root.querySelector('.dropdown-chevron-container');
      const temp =
        root.querySelector('.uc-gauge-value-center') ||
        [...root.querySelectorAll('*')].find(el => /\d+\.\d/.test(el.textContent || ''));
      const overlayRow = root.querySelector(
        '.horizontal-preview-content, .horizontal-module-preview'
      );
      const blankTitle = root.querySelector('.uc-blank-closed-title');
      const braille = [...root.querySelectorAll('span')].some(el =>
        /[\u2800]/.test(el.textContent || '')
      );
      const dump = el => {
        if (!el) return null;
        return round(el.getBoundingClientRect().width);
      };
      const infoRoot = root.querySelector('.info-module-container');
      const dropdownRoot = root.querySelector('.dropdown-module-container');
      const selection = root.querySelector('.dropdown-selection');

      const offBox = boxOf(off);
      const chevronBox = boxOf(chevron);
      const tempBox = boxOf(temp);
      const rowBox = boxOf(overlayRow);

      const gap = offBox && chevronBox ? round(chevronBox.left - offBox.right) : null;
      const overlap = gap !== null && gap < 0;
      const offTempGap = offBox && tempBox ? round(tempBox.top - offBox.bottom) : null;
      const clusterMid = offBox && chevronBox ? round((offBox.left + chevronBox.right) / 2) : null;
      const rowMid = rowBox ? round(rowBox.left + rowBox.w / 2) : null;
      const tempTruncated = !!(
        temp &&
        temp.scrollWidth > temp.clientWidth + 1 &&
        !/^\d+(\.\d+)?/.test((temp.textContent || '').trim()) === false &&
        (temp.textContent || '').trim().endsWith('.')
      );
      const tempLooksCut =
        !!tempBox &&
        /^\d+\.$/.test((tempBox.text || '').replace(/[^\d.]/g, '')) === false
          ? false
          : !!tempBox && /^\d+\.$/.test((tempBox.text || '').replace(/C°.*/g, '').trim());

      return {
        room: root.dataset?.room || root.id,
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
        tempLooksCut,
        tempClip: clippingAncestor(temp),
        offClip: clippingAncestor(off),
        chevronClip: clippingAncestor(chevron),
      };
    });

    return {
      cards,
      bodyText: (document.getElementById('stage')?.innerText || '').slice(0, 400),
    };
  });
}

async function openMenu(page, cardIndex = 0) {
  const trigger = page.locator('.dropdown-selected').nth(cardIndex);
  await trigger.click({ force: true });
  await page.waitForTimeout(400);
  const appeared = await page.locator('.dropdown-options').evaluateAll(els =>
    els.some(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0)
  );
  if (!appeared) {
    await trigger.click({ force: true });
    await page.waitForTimeout(400);
  }
  return page.evaluate(index => {
    const round = n => Math.round(n * 10) / 10;
    const menus = [...document.querySelectorAll('.dropdown-options')].filter(
      el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0
    );
    const menu = menus[menus.length - 1];
    if (!menu) return { found: false };
    const r = menu.getBoundingClientRect();
    const trig = document.querySelectorAll('.dropdown-selected')[index].getBoundingClientRect();
    const options = [...menu.querySelectorAll('.dropdown-option')].map(opt => {
      const label = [...opt.querySelectorAll('span')].find(s =>
        /^(heat|cool|dry|off)$/i.test((s.textContent || '').trim())
      );
      const lr = label ? label.getBoundingClientRect() : null;
      const sample = label
        ? document.elementFromPoint(lr.left + Math.min(8, lr.width / 2), lr.top + lr.height / 2)
        : null;
      return {
        text: (opt.textContent || '').trim(),
        labelRight: lr ? round(lr.right) : null,
        labelWidth: lr ? round(lr.width) : null,
        labelVisible: !!(sample && (menu.contains(sample) || sample === menu || opt.contains(sample))),
      };
    });

    let clip = null;
    const csWalk = (() => {
      const rect = r;
      let p = menu.parentElement;
      while (p && p !== document.documentElement) {
        const cs = getComputedStyle(p);
        const clipX = ['hidden', 'clip', 'scroll', 'auto'].includes(cs.overflowX);
        const clipY = ['hidden', 'clip', 'scroll', 'auto'].includes(cs.overflowY);
        if (clipX || clipY) {
          const pr = p.getBoundingClientRect();
          const clippedX = clipX && (rect.left < pr.left - 1 || rect.right > pr.right + 1);
          const clippedY = clipY && (rect.top < pr.top - 1 || rect.bottom > pr.bottom + 1);
          if (clippedX || clippedY) {
            return `${p.tagName}.${String(p.className || '').slice(0, 60)} ${cs.overflowX}/${cs.overflowY}`;
          }
        }
        p = p.parentElement;
      }
      return null;
    })();
    clip = csWalk;

    const neighborCard = document.querySelector('.ha-card[data-room="bedroom"]');
    const neighborRect = neighborCard ? neighborCard.getBoundingClientRect() : null;
    const overlappingNeighbor =
      neighborRect &&
      r.right > neighborRect.left + 4 &&
      r.left < neighborRect.right - 4 &&
      r.bottom > neighborRect.top + 4 &&
      r.top < neighborRect.bottom - 4;

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
      clippedBy: clip,
      portaled: menu.parentElement === document.body,
      overlappingNeighbor: !!overlappingNeighbor,
      neighborStillReadable: neighborCard
        ? /18\.2/.test(neighborCard.innerText || '')
        : true,
    };
  }, cardIndex);
}

function assertMenu(name, m) {
  const errors = [];
  if (!m.found) return [`${name}: dropdown menu did not open`];
  if (m.options.length !== 4) errors.push(`${name}: expected 4 options, saw ${m.options.length}`);
  for (const o of m.options) {
    if (o.labelRight === null) {
      errors.push(`${name}: option "${o.text}" has no visible label`);
    } else if (o.labelRight > m.right + 0.5) {
      errors.push(
        `${name}: option "${o.text}" label clipped (label right ${o.labelRight} > menu right ${m.right})`
      );
    }
    if (o.labelWidth !== null && o.labelWidth < 10) {
      errors.push(`${name}: option "${o.text}" label is truncated (${o.labelWidth}px)`);
    }
    if (o.labelVisible === false) {
      errors.push(`${name}: option "${o.text}" is covered/clipped (elementFromPoint missed the menu)`);
    }
  }
  if (m.left < 0 || m.right > m.viewportWidth) {
    errors.push(`${name}: menu leaves the viewport (${m.left}–${m.right} of ${m.viewportWidth})`);
  }
  if (Math.abs(m.top - m.triggerBottom) > 4) {
    errors.push(`${name}: menu top ${m.top} is not attached to the trigger (${m.triggerBottom})`);
  }
  if (m.clippedBy) {
    errors.push(`${name}: menu is clipped by ancestor ${m.clippedBy}`);
  }
  return errors;
}

function assertCard(name, m, bodyText) {
  const errors = [];
  if (!m.off) errors.push(`${name}: Off label not found. Body: ${bodyText}`);
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
  if (m.tempLooksCut) {
    errors.push(`${name}: temperature text looks truncated (${m.temp?.text})`);
  }
  if (m.tempClip) errors.push(`${name}: temperature is clipped by ${m.tempClip}`);
  return errors;
}

async function main() {
  try {
    await fs.access(BUNDLE);
  } catch {
    console.error(
      `Missing ${path.relative(ROOT, BUNDLE)} — run: npx webpack -c webpack.demo.config.js`
    );
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

    const singleGaps = [];

    for (const scenario of SCENARIOS) {
      await renderOverlay(page, scenario);
      const metrics = await measure(page);
      results.push({ scenario: scenario.name, width: scenario.width, ...metrics });
      for (const [i, card] of metrics.cards.entries()) {
        const label = `${scenario.name}${metrics.cards.length > 1 ? `#${card.room}` : ''}`;
        errors.push(...assertCard(label, card, metrics.bodyText));
        console.log(
          `${label} (${scenario.width}px ${scenario.context}): Off→chevron gap=${card.gap}px overlap=${card.overlap} off/temp=${card.offTempGap}px clusterOffset=${card.clusterOffset}px infoW=${card.infoWidth} dropW=${card.dropdownWidth} selW=${card.selectionWidth} temp="${card.temp?.text}"`
        );
        if (scenario.cards === 1) singleGaps.push(card.gap);
      }

      const menu = await openMenu(page, 0);
      results[results.length - 1].menu = menu;
      errors.push(...assertMenu(scenario.name, menu));
      await page.screenshot({
        path: path.join(OUT_DIR, `${scenario.name}-open.png`),
        fullPage: true,
      });
      console.log(
        `${scenario.name} menu: width=${menu.width}px left=${menu.left} right=${menu.right} clippedBy=${menu.clippedBy || 'none'} portaled=${menu.portaled} options=${(menu.options || [])
          .map(o => `${o.text}:${o.labelWidth}`)
          .join(',')}`
      );
      await page.keyboard.press('Escape');
      await page.mouse.click(5, 5);
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(OUT_DIR, `${scenario.name}.png`),
        fullPage: true,
      });
    }

    if (singleGaps.length >= 2 && singleGaps[0] !== null && singleGaps[1] !== null) {
      const delta = Math.abs(singleGaps[0] - singleGaps[1]);
      if (delta > MAX_VIEWPORT_GAP_DELTA) {
        errors.push(
          `Off→chevron gap drifted ${delta}px between mobile and desktop (max ${MAX_VIEWPORT_GAP_DELTA}px)`
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

  console.log(`\nHVAC overlay harness passed (${SCENARIOS.length} scenarios).`);
  console.log(`Screenshots: ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
