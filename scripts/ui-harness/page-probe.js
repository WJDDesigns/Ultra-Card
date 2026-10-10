/**
 * In-page half of the UI harness. Injected into the Home Assistant tab by
 * scripts/ui-harness/run.mjs; defines window.__ucProbe.
 *
 * Everything here walks the composed tree (light DOM + every shadow root),
 * because Ultra Card and HA render almost entirely inside shadow roots.
 *
 * Plain browser JavaScript on purpose: it is read from disk and injected as a
 * script tag, never bundled.
 */
(() => {
  if (window.__ucProbe) return;

  /* ───────────────────────── tree walking ───────────────────────── */

  function* walk(root) {
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      if (node.nodeType === 1) yield node;
      const kids = [];
      if (node.shadowRoot) kids.push(...node.shadowRoot.children);
      if (node.children) kids.push(...node.children);
      // A <slot> shows its assigned nodes; those are already reached through
      // the host's light DOM, so they are not walked twice.
      for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
    }
  }

  function parentOf(el) {
    if (el.assignedSlot) return el.assignedSlot;
    if (el.parentElement) return el.parentElement;
    const root = el.getRootNode && el.getRootNode();
    return root && root.host ? root.host : null;
  }

  function composedContains(outer, inner) {
    for (let n = inner; n; n = parentOf(n)) if (n === outer) return true;
    return false;
  }

  function describe(el, stopAt) {
    const parts = [];
    for (let n = el; n && n !== stopAt && parts.length < 4; n = parentOf(n)) {
      let s = n.tagName.toLowerCase();
      if (n.id) s += '#' + n.id;
      const cls = (n.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      parts.unshift(s);
    }
    return parts.join(' › ');
  }

  function isVisible(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse')
      return false;
    if (parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0.5 && r.height > 0.5;
  }

  /** Opacity multiplied up the composed tree (an element at opacity 1 inside a 0.3 parent paints at 0.3). */
  function effectiveOpacity(el) {
    let o = 1;
    for (let n = el; n; n = parentOf(n)) {
      const v = parseFloat(getComputedStyle(n).opacity);
      if (!isNaN(v)) o *= v;
      if (o < 0.05) break;
    }
    return o;
  }

  /* ───────────────────────── colour maths ───────────────────────── */

  function parseColor(str) {
    if (!str) return null;
    let m = str.match(
      /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/
    );
    if (m) {
      let a =
        m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return [+m[1], +m[2], +m[3], a];
    }
    m = str.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/);
    if (m) {
      let a =
        m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return [m[1] * 255, m[2] * 255, m[3] * 255, a];
    }
    if (str === 'transparent') return [0, 0, 0, 0];
    return null; // oklch(), lab() …: unknown, skip rather than guess
  }

  function over(top, bottom) {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    return [0, 1, 2]
      .map(i => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a)
      .concat(a);
  }

  function luminance([r, g, b]) {
    const f = c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }

  function contrast(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /**
   * The colour actually painted behind an element, composited up the tree.
   * Returns null when an image, gradient or backdrop filter is in the way:
   * those cannot be judged from computed styles, so they are skipped rather
   * than reported as false positives.
   */
  function effectiveBackground(el) {
    const layers = [];
    for (let n = el; n; n = parentOf(n)) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      if (cs.backdropFilter && cs.backdropFilter !== 'none') return null;
      const c = parseColor(cs.backgroundColor);
      if (c === null) return null;
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 0.99) break;
    }
    let out = parseColor(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1];
    if (out[3] < 1) out = over(out, [255, 255, 255, 1]);
    for (let i = layers.length - 1; i >= 0; i--) out = over(layers[i], out);
    return out;
  }

  /* ───────────────────────── checks ───────────────────────── */

  const RAW_VALUE = /(^|[^\w])(undefined|NaN|\[object Object\])([^\w]|$)/;
  const RAW_KEY = /\b(editor|card|common|modules?|ui|pro|hub|panel)\.[a-z0-9_]+(\.[a-z0-9_]+)+\b/;
  const TEMPLATE_LEAK = /\{\{|\{%|\[\[\[/;

  /** Elements that own at least one non-blank text node, with that text. */
  function textOwners(root) {
    const out = [];
    for (const el of walk(root)) {
      if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT' || el.tagName === 'TEMPLATE') continue;
      let text = '';
      for (const n of el.childNodes) if (n.nodeType === 3) text += n.textContent;
      text = text.replace(/\s+/g, ' ').trim();
      if (!text) continue;
      if (!isVisible(el)) continue;
      out.push({ el, text });
    }
    return out;
  }

  /** Bounding box of an element's own text nodes (not its children). */
  function ownTextRect(el) {
    const range = document.createRange();
    let box = null;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      box = box
        ? {
            left: Math.min(box.left, r.left),
            top: Math.min(box.top, r.top),
            right: Math.max(box.right, r.right),
            bottom: Math.max(box.bottom, r.bottom),
          }
        : { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    }
    return box;
  }

  /** Rect of `el` after clipping by every overflow:hidden/auto/clip ancestor below `root`. */
  function clippedRect(el, root) {
    const r = el.getBoundingClientRect();
    let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (let n = parentOf(el); n && n !== root; n = parentOf(n)) {
      const cs = getComputedStyle(n);
      const clipX = cs.overflowX !== 'visible';
      const clipY = cs.overflowY !== 'visible';
      if (!clipX && !clipY) continue;
      const p = n.getBoundingClientRect();
      if (clipX)
        box = { ...box, left: Math.max(box.left, p.left), right: Math.min(box.right, p.right) };
      if (clipY)
        box = { ...box, top: Math.max(box.top, p.top), bottom: Math.min(box.bottom, p.bottom) };
      if (box.right <= box.left || box.bottom <= box.top) return null;
    }
    return box;
  }

  const INTERACTIVE_SEL = [
    'button',
    'a[href]',
    'input:not([type=hidden])',
    'select',
    'textarea',
    '[role=button]',
    '[role=switch]',
    '[role=checkbox]',
    '[role=slider]',
    '[role=tab]',
    '[role=menuitem]',
    'ha-icon-button',
    'ha-switch',
    'ha-button',
    'mwc-button',
    'ha-checkbox',
  ].join(',');

  function looksInteractive(el) {
    if (el.matches(INTERACTIVE_SEL)) return true;
    if (el.hasAttribute('tabindex') && el.getAttribute('tabindex') !== '-1') return true;
    const cs = getComputedStyle(el);
    if (cs.cursor !== 'pointer') return false;
    // cursor is inherited: only count the element that sets it, not every child
    const p = parentOf(el);
    return !p || getComputedStyle(p).cursor !== 'pointer';
  }

  function interactiveElements(root) {
    const out = [];
    for (const el of walk(root)) {
      if (el === root) continue;
      if (!looksInteractive(el)) continue;
      if (!isVisible(el)) continue;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
      out.push(el);
    }
    // Innermost targets only: a button inside a clickable row is one target.
    return out.filter(a => !out.some(b => b !== a && composedContains(a, b)));
  }

  /**
   * Run every visual check on `root` (the harness slot holding one card, or the
   * module settings panel). `mode` is 'card' or 'editor'; `mobile` tightens the
   * tap-target rule.
   */
  function check(root, { mode = 'card', mobile = false } = {}) {
    const findings = [];
    const add = (check, severity, message, el, extra = {}) =>
      findings.push({ check, severity, message, where: el ? describe(el, root) : '', ...extra });

    const rootRect = root.getBoundingClientRect();
    const texts = textOwners(root);

    // Empty or near-empty render.
    const hasMedia = [...walk(root)].some(
      el =>
        /^(IMG|SVG|CANVAS|VIDEO|HA-ICON|HA-STATE-ICON|IFRAME)$/i.test(el.tagName) && isVisible(el)
    );
    if (rootRect.height < 12 || (!texts.length && !hasMedia)) {
      add(
        'empty-render',
        'error',
        `Renders nothing visible (${Math.round(rootRect.width)}×${Math.round(rootRect.height)})`
      );
    }

    // Horizontal scroll on the container itself.
    if (root.scrollWidth > root.clientWidth + 2) {
      add(
        'horizontal-scroll',
        'error',
        `Content is ${root.scrollWidth - root.clientWidth}px wider than its container`
      );
    }

    // Anything painting outside the container.
    const spill = [];
    for (const el of walk(root)) {
      if (el === root || !isVisible(el)) continue;
      const box = clippedRect(el, root);
      if (!box) continue;
      const outL = rootRect.left - box.left;
      const outR = box.right - rootRect.right;
      if (outL > 3 || outR > 3) spill.push({ el, px: Math.round(Math.max(outL, outR)) });
    }
    const spillTop = spill.filter(s => !spill.some(o => o !== s && composedContains(o.el, s.el)));
    spillTop
      .slice(0, 4)
      .forEach(s => add('overflow', 'warn', `Sticks out of the card by ${s.px}px`, s.el));

    // Text problems.
    const seen = new Set();
    for (const { el, text } of texts) {
      const sample = text.slice(0, 60);
      if (RAW_VALUE.test(text)) add('raw-value', 'error', `Shows a raw value: “${sample}”`, el);
      if (RAW_KEY.test(text) && !/\s/.test(text.trim().slice(0, 40)))
        add('raw-translation-key', 'error', `Shows an untranslated key: “${sample}”`, el);
      if (TEMPLATE_LEAK.test(text) && mode === 'card')
        add('template-leak', 'warn', `Template source is visible: “${sample}”`, el);

      const cs = getComputedStyle(el);
      // Clipped text with no ellipsis.
      if (
        el.scrollWidth > el.clientWidth + 2 &&
        cs.overflowX !== 'visible' &&
        cs.textOverflow !== 'ellipsis' &&
        el.clientWidth > 0
      ) {
        add('clipped-text', 'warn', `Text is cut off with no ellipsis: “${sample}”`, el);
      }

      // Contrast.
      const fg = parseColor(cs.color);
      const bg = effectiveBackground(el);
      if (fg && bg) {
        const alpha = fg[3] * effectiveOpacity(el);
        const painted = over([fg[0], fg[1], fg[2], alpha], bg);
        const ratio = contrast(painted, bg);
        const size = parseFloat(cs.fontSize);
        const bold = parseInt(cs.fontWeight, 10) >= 600;
        const large = size >= 24 || (size >= 18.6 && bold);
        const key = cs.color + '|' + bg.join(',') + '|' + Math.round(size);
        if (!seen.has(key)) {
          seen.add(key);
          if (ratio < 1.6)
            add(
              'invisible-text',
              'error',
              `Text is nearly invisible (contrast ${ratio.toFixed(2)}:1): “${sample}”`,
              el,
              { ratio }
            );
          else if (ratio < (large ? 2.2 : 3))
            add('low-contrast', 'warn', `Low contrast ${ratio.toFixed(2)}:1: “${sample}”`, el, {
              ratio,
            });
        }
      }
    }

    // Overlapping text (labels drawn on top of each other).
    const boxes = texts
      .map(t => ({ ...t, box: ownTextRect(t.el) }))
      .filter(t => t.box && effectiveOpacity(t.el) > 0.2);
    let overlaps = 0;
    for (let i = 0; i < boxes.length && overlaps < 4; i++) {
      for (let j = i + 1; j < boxes.length && overlaps < 4; j++) {
        const a = boxes[i].box;
        const b = boxes[j].box;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w <= 2 || h <= 2) continue;
        const area = w * h;
        const smaller = Math.min(
          (a.right - a.left) * (a.bottom - a.top),
          (b.right - b.left) * (b.bottom - b.top)
        );
        if (area / smaller < 0.25) continue;
        overlaps++;
        add(
          'text-overlap',
          'warn',
          `“${boxes[i].text.slice(0, 30)}” overlaps “${boxes[j].text.slice(0, 30)}”`,
          boxes[i].el
        );
      }
    }

    // Tap targets.
    const targets = interactiveElements(root);
    const min = mobile ? 24 : 20;
    let small = 0;
    for (const el of targets) {
      if (el.matches('input[type=range], [role=slider]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < min || r.height < min) {
        if (small++ < 4)
          add(
            'small-target',
            mobile ? 'warn' : 'info',
            `Tap target is ${Math.round(r.width)}×${Math.round(r.height)}px`,
            el
          );
      }
    }

    // Broken images.
    for (const el of walk(root)) {
      if (el.tagName === 'IMG' && el.complete && el.naturalWidth === 0 && el.getAttribute('src')) {
        add(
          'broken-image',
          'warn',
          `Image failed to load: ${String(el.getAttribute('src')).slice(0, 80)}`,
          el
        );
      }
    }

    // A visible error / unavailable message (often legit, always worth a look).
    for (const { el, text } of texts) {
      if (
        /\b(error|failed|not found|invalid|unavailable|not available|configure|select an? )\b/i.test(
          text
        ) &&
        text.length < 140
      ) {
        add('state-message', 'info', `Shows: “${text.slice(0, 80)}”`, el);
        break;
      }
    }

    return {
      findings,
      stats: {
        width: Math.round(rootRect.width),
        height: Math.round(rootRect.height),
        texts: texts.length,
        targets: targets.length,
      },
    };
  }

  /* ───────────────────────── interaction support ───────────────────────── */

  /** Click targets in page coordinates, top-to-bottom, left-to-right. */
  function clickTargets(root, limit = 8) {
    const vw = innerWidth;
    const vh = innerHeight;
    return interactiveElements(root)
      .filter(
        el =>
          !el.matches('input[type=range], input[type=text], input[type=number], textarea, select')
      )
      .map(el => {
        const r = el.getBoundingClientRect();
        const label = (
          el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          (el.textContent || '').replace(/\s+/g, ' ').trim() ||
          el.getAttribute('icon') ||
          ''
        ).slice(0, 40);
        return {
          el,
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          label,
          where: describe(el, root),
        };
      })
      .filter(t => t.x >= 0 && t.y >= 0 && t.x < vw && t.y < vh)
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .slice(0, limit)
      .map(({ el, ...rest }) => rest);
  }

  /** Cheap structural fingerprint, to tell whether a click changed anything. */
  function signature(root) {
    let s = '';
    for (const el of walk(root)) {
      s += el.tagName + (el.getAttribute('class') || '') + (el.getAttribute('style') || '');
      for (const a of [
        'aria-pressed',
        'aria-expanded',
        'aria-checked',
        'aria-selected',
        'open',
        'checked',
        'active',
      ])
        if (el.hasAttribute(a)) s += a + el.getAttribute(a);
      for (const n of el.childNodes) if (n.nodeType === 3) s += n.textContent.trim();
    }
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h + ':' + s.length;
  }

  /* ───────────────────────── safe hass ───────────────────────── */

  const MUTATING_WS =
    /^(call_service|execute_script|fire_event)$|\/(create|update|delete|remove|move|save|clear|reorder|add|set|set_[a-z_]+|item\/[a-z_]+)$|^frontend\/set_|^lovelace\/(config\/save|config\/delete|resources\/(create|update|delete))/;

  /**
   * A copy of the live hass whose writes are recorded instead of sent, so the
   * harness can click every button on Wayne's real Home Assistant without
   * switching anything. Reads (states, history, template subscriptions) go
   * through untouched.
   */
  function safeHass(real, log) {
    const record = entry => {
      log.push({ ...entry, t: Date.now() });
    };
    const conn = real.connection;
    const guardedConn = new Proxy(conn, {
      get(target, prop) {
        if (prop === 'sendMessagePromise' || prop === 'sendMessage') {
          return msg => {
            if (msg && MUTATING_WS.test(String(msg.type || ''))) {
              record({
                kind: 'ws',
                type: msg.type,
                detail: msg.domain ? `${msg.domain}.${msg.service}` : '',
              });
              return Promise.resolve(null);
            }
            return target[prop](msg);
          };
        }
        const v = target[prop];
        return typeof v === 'function' ? v.bind(target) : v;
      },
    });
    return {
      ...real,
      connection: guardedConn,
      callService: (domain, service, data, target) => {
        const ent = (data && data.entity_id) || (target && target.entity_id) || '';
        record({
          kind: 'service',
          type: `${domain}.${service}`,
          detail: Array.isArray(ent) ? ent.join(', ') : ent,
        });
        return Promise.resolve({ context: { id: 'ui-harness' } });
      },
      callWS: msg => {
        if (msg && MUTATING_WS.test(String(msg.type || ''))) {
          record({
            kind: 'ws',
            type: msg.type,
            detail: msg.domain ? `${msg.domain}.${msg.service}` : '',
          });
          return Promise.resolve(null);
        }
        return real.callWS(msg);
      },
      callApi: (method, path, params, headers) => {
        if (String(method).toUpperCase() !== 'GET') {
          record({ kind: 'api', type: `${method} ${path}`, detail: '' });
          return Promise.resolve({});
        }
        return real.callApi(method, path, params, headers);
      },
    };
  }

  /**
   * While armed, swallow and record the events a card fires to ask HA for
   * something (more-info, actions, navigation, dialogs) so nothing opens or
   * routes on the real instance.
   */
  const SWALLOW = [
    'hass-more-info',
    'hass-action',
    'll-custom',
    'show-dialog',
    'hass-notification',
    'location-changed',
    'll-rebuild',
  ];
  function armEvents(log) {
    const handlers = SWALLOW.map(type => {
      const h = ev => {
        const d = ev.detail || {};
        const detail =
          d.entityId ||
          (d.config && (d.config.entity || d.config.tap_action?.action)) ||
          d.dialogTag ||
          d.message ||
          '';
        log.push({ kind: 'event', type, detail: String(detail).slice(0, 80), t: Date.now() });
        ev.stopImmediatePropagation();
        if (type !== 'location-changed') ev.preventDefault();
      };
      window.addEventListener(type, h, true);
      return [type, h];
    });
    // A plain link (a map attribution, an "open in app" button) would navigate
    // the whole tab away and take the harness with it: record it instead.
    const linkGuard = ev => {
      const a = ev
        .composedPath()
        .find(n => n.tagName === 'A' && n.getAttribute && n.getAttribute('href'));
      if (!a) return;
      log.push({
        kind: 'link',
        type: 'opens link',
        detail: String(a.href).slice(0, 120),
        t: Date.now(),
      });
      ev.preventDefault();
    };
    window.addEventListener('click', linkGuard, true);
    const startUrl = location.href;
    const origOpen = window.open;
    window.open = url => {
      log.push({
        kind: 'open-url',
        type: 'window.open',
        detail: String(url).slice(0, 120),
        t: Date.now(),
      });
      return null;
    };
    const origPush = history.pushState;
    history.pushState = function (state, title, url) {
      log.push({ kind: 'navigate', type: 'navigate', detail: String(url), t: Date.now() });
    };
    return () => {
      handlers.forEach(([type, h]) => window.removeEventListener(type, h, true));
      window.removeEventListener('click', linkGuard, true);
      window.open = origOpen;
      history.pushState = origPush;
      if (location.href !== startUrl) history.replaceState(null, '', startUrl);
    };
  }

  /** Deep query: first match anywhere in the composed tree under root. */
  function deepQuery(root, selector) {
    for (const el of walk(root)) if (el.matches(selector)) return el;
    return null;
  }

  function deepQueryAll(root, selector) {
    const out = [];
    for (const el of walk(root)) if (el.matches(selector)) out.push(el);
    return out;
  }

  window.__ucProbe = {
    check,
    clickTargets,
    signature,
    safeHass,
    armEvents,
    deepQuery,
    deepQueryAll,
    describe,
    walk,
  };
})();
