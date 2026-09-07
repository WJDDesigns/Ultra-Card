<?php
/**
 * Browser runtime shared by the theme builder, the theme gallery and the
 * dashboard "My Themes" tab. Mirrors the card's theme engine
 * (src/services/uc-theme-service.ts, src/utils/uc-surface-styles.ts,
 * src/components/uc-theme-swatch.ts) closely enough that a preview painted
 * here matches what Home Assistant renders. Exposes window.UcTheme.
 *
 * @package UltraCardIntegration
 */
if (!defined('ABSPATH')) {
    exit;
}
?>
<script id="uc-theme-runtime">
window.UcTheme = (function () {
  'use strict';

  var SURFACES = ['flat', 'glass', 'neumorphic', 'glossy', 'outline', 'minimal'];
  var DENSITIES = ['compact', 'regular', 'comfortable'];
  var DENSITY_SCALE = { compact: '0.875', regular: '1', comfortable: '1.125' };
  var PALETTE_KEYS = ['primary', 'accent', 'card_bg', 'text', 'text_secondary', 'divider', 'on_primary'];
  var PALETTE_TO_VARS = {
    primary: ['--primary-color'],
    accent: ['--accent-color'],
    card_bg: ['--card-background-color', '--ha-card-background'],
    text: ['--primary-text-color'],
    text_secondary: ['--secondary-text-color'],
    divider: ['--divider-color'],
    on_primary: ['--text-primary-color']
  };
  var BASE_CARD_RADIUS = 12;
  var RADIUS_SCALE_MAX = 1.75;
  var MODULE_RADII = [1, 1.5, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 18, 20, 22, 24];

  var SURFACE_BASE = ['flat', 'glossy', 'embossed', 'inset', 'gradient-overlay', 'neon-glow', 'outline', 'glass', 'metallic', 'neumorphic'];
  function titleCase(s) { return s.replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function opts(list) { return list.map(function (v) { return { value: v, label: titleCase(v) }; }); }
  var GRID_STYLES = {
    style_1: 'Name / icon / state', style_2: 'Icon above state', style_3: 'Icon left, text right', style_4: 'Large icon, state badge',
    style_5: 'Icon + name, state below', style_6: 'Icon only', style_7: 'Icon + state', style_8: 'Text only', style_9: 'Ring progress',
    style_10: 'Square tile', style_11: 'Card with shadow', style_12: 'Button with border', style_13: 'Horizontal list', style_14: 'Rounded badge',
    style_15: 'Panel with header', style_16: 'Glass morphism', style_17: 'Gradient', style_18: 'Split colour', style_19: 'Neumorphic', style_20: 'Flat, accent border'
  };
  // Same catalog as src/themes/uc-theme-module-options.ts.
  var MODULE_FIELDS = [
    { moduleType: 'button', moduleLabel: 'Button', key: 'style', label: 'Style', kind: 'select', options: opts(SURFACE_BASE) },
    { moduleType: 'bar', moduleLabel: 'Bar', key: 'bar_style', label: 'Bar style', kind: 'select', options: opts(SURFACE_BASE.concat(['dashed', 'dots', 'minimal'])) },
    { moduleType: 'bar', moduleLabel: 'Bar', key: 'glass_blur_amount', label: 'Glass blur (px)', kind: 'number', min: 0, max: 40 },
    { moduleType: 'slider_control', moduleLabel: 'Slider Control', key: 'slider_style', label: 'Slider style', kind: 'select', options: opts(SURFACE_BASE.concat(['minimal'])) },
    { moduleType: 'slider_control', moduleLabel: 'Slider Control', key: 'glass_blur_amount', label: 'Glass blur (px)', kind: 'number', min: 0, max: 40 },
    { moduleType: 'spinbox', moduleLabel: 'Spinbox', key: 'button_style', label: 'Button style', kind: 'select', options: opts(SURFACE_BASE) },
    { moduleType: 'spinbox', moduleLabel: 'Spinbox', key: 'button_shape', label: 'Button shape', kind: 'select', options: opts(['rounded', 'square', 'circle']) },
    { moduleType: 'popup', moduleLabel: 'Popup', key: 'trigger_button_style', label: 'Trigger button style', kind: 'select', options: opts(SURFACE_BASE) },
    { moduleType: 'grid', moduleLabel: 'Grid', key: 'grid_style', label: 'Tile style', kind: 'select', options: Object.keys(GRID_STYLES).map(function (k) { return { value: k, label: GRID_STYLES[k] }; }) },
    { moduleType: 'navigation', moduleLabel: 'Navigation', key: 'nav_style', label: 'Navbar preset', kind: 'select', options: ['uc_modern', 'uc_minimal', 'uc_ios_glass', 'uc_material', 'uc_floating', 'uc_docked', 'uc_neumorphic', 'uc_gradient', 'uc_sidebar', 'uc_compact'].map(function (v) { return { value: v, label: titleCase(v.replace(/^uc_/, '')) }; }) },
    { moduleType: 'area_summary', moduleLabel: 'Area Summary', key: 'style_preset', label: 'Preset', kind: 'select', options: opts(['iconic_soft', 'graph_glow', 'compact_controls', 'photo_overlay']) },
    { moduleType: 'area_summary', moduleLabel: 'Area Summary', key: 'tile_border_radius', label: 'Tile radius (px)', kind: 'number', min: 0, max: 60 },
    { moduleType: 'auto_entity_list', moduleLabel: 'Auto Entity List', key: 'row_style', label: 'Row style', kind: 'select', options: opts(['compact', 'detailed', 'slim', 'card']) },
    { moduleType: 'unifi', moduleLabel: 'UniFi', key: 'rack_style', label: 'Rack style', kind: 'select', options: opts(['dark', 'light', 'glass', 'blueprint', 'blank']) },
    { moduleType: 'tabs', moduleLabel: 'Tabs', key: 'style', label: 'Style', kind: 'select', options: opts(['default', 'simple', 'simple_2', 'simple_3', 'switch_1', 'switch_2', 'switch_3', 'modern', 'trendy']) },
    { moduleType: 'activity_feed', moduleLabel: 'Activity Feed', key: 'feed_card_style', label: 'Card style', kind: 'select', options: opts(['flat', 'elevated', 'outlined']) }
  ];

  // HA's default light and dark palettes: the stage the preview sits on when
  // a theme leaves colours to Home Assistant.
  var HA_BASE = {
    light: {
      '--primary-color': '#03a9f4', '--rgb-primary-color': '3, 169, 244', '--accent-color': '#ff9800',
      '--card-background-color': '#ffffff', '--ha-card-background': '#ffffff', '--rgb-card-background-color': '255, 255, 255',
      '--primary-background-color': '#fafafa', '--secondary-background-color': '#e5e5e5',
      '--primary-text-color': '#212121', '--rgb-primary-text-color': '33, 33, 33', '--secondary-text-color': '#727272',
      '--divider-color': 'rgba(0, 0, 0, 0.12)', '--text-primary-color': '#ffffff', '--disabled-text-color': '#bdbdbd',
      '--state-icon-color': '#44739e', '--lovelace-background': '#fafafa'
    },
    dark: {
      '--primary-color': '#03a9f4', '--rgb-primary-color': '3, 169, 244', '--accent-color': '#ff9800',
      '--card-background-color': '#1c1c1c', '--ha-card-background': '#1c1c1c', '--rgb-card-background-color': '28, 28, 28',
      '--primary-background-color': '#111111', '--secondary-background-color': '#202020',
      '--primary-text-color': '#e1e1e1', '--rgb-primary-text-color': '225, 225, 225', '--secondary-text-color': '#9b9b9b',
      '--divider-color': 'rgba(225, 225, 225, 0.12)', '--text-primary-color': '#ffffff', '--disabled-text-color': '#6f6f6f',
      '--state-icon-color': '#9da0a2', '--lovelace-background': '#111111'
    }
  };

  // ------------------------------------------------------------- colour math
  function parseColor(v) {
    if (typeof v !== 'string') return null;
    var s = v.trim().toLowerCase();
    var m = /^#([0-9a-f]{3,8})$/.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
      if (h.length !== 6 && h.length !== 8) return null;
      var n = parseInt(h.slice(0, 6), 16);
      var a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: a };
    }
    m = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/.exec(s);
    if (m) {
      var al = m[4] === undefined ? 1 : (m[4].slice(-1) === '%' ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      return { r: +m[1], g: +m[2], b: +m[3], a: isNaN(al) ? 1 : al };
    }
    return null;
  }
  function toCss(c) { return c.a >= 1 ? 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')' : 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + Math.round(c.a * 100) / 100 + ')'; }
  function triple(c) { return c.r + ', ' + c.g + ', ' + c.b; }
  function lum(c) {
    var f = function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function contrast(a, b) { var la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
  function mix(a, b, t) { t = Math.min(1, Math.max(0, t)); return { r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t), a: a.a }; }
  var WHITE = { r: 255, g: 255, b: 255, a: 1 }, BLACK = { r: 0, g: 0, b: 0, a: 1 }, INK = { r: 33, g: 33, b: 33, a: 1 };
  function isLight(c) { return lum(c) > 0.4; }
  function step(c, amt) { return mix(c, isLight(c) ? BLACK : WHITE, amt); }
  function withAlpha(c, a) { return { r: c.r, g: c.g, b: c.b, a: Math.min(1, Math.max(0, a)) }; }
  function contrastText(bg) { return contrast(bg, WHITE) >= contrast(bg, INK) ? WHITE : INK; }
  function hexToRgb(hex) { var c = parseColor(hex); return c && /^#/.test(hex.trim()) ? triple(c) : null; }

  // ---------------------------------------------------------------- surfaces
  function surfaceTokens(surface, o) {
    var blur = o.blur == null ? 12 : o.blur;
    var border = function (fw, fc) { return (o.borderWidth == null ? fw : o.borderWidth) + 'px solid ' + (o.borderColor || fc); };
    var sh = o.shadow;
    switch (surface) {
      case 'glass': return { background: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05)', border: border(1, 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12)'), shadow: sh || '0 8px 24px rgba(0, 0, 0, 0.18)', backdropFilter: 'blur(' + blur + 'px) saturate(160%)' };
      case 'neumorphic': return { background: 'var(--card-background-color, var(--ha-card-background, white))', border: border(0, 'transparent'), shadow: sh || '6px 6px 14px rgba(0, 0, 0, 0.14), -6px -6px 14px rgba(255, 255, 255, 0.08)', backdropFilter: 'none' };
      case 'glossy': return { background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0)), var(--card-background-color, var(--ha-card-background, white))', border: border(0, 'transparent'), shadow: sh || '0 4px 16px rgba(0, 0, 0, 0.12)', backdropFilter: 'none' };
      case 'outline': return { background: 'transparent', border: border(1, 'var(--divider-color)'), shadow: sh || 'none', backdropFilter: 'none' };
      case 'minimal': return { background: 'transparent', border: border(0, 'transparent'), shadow: sh || 'none', backdropFilter: 'none' };
      default: return { background: 'var(--card-background-color, var(--ha-card-background, white))', border: border(1, 'var(--divider-color)'), shadow: sh || 'none', backdropFilter: 'none' };
    }
  }
  function paneVars(t) {
    var by = {
      flat: ['var(--secondary-background-color)', '1px solid var(--divider-color)', 'none'],
      glass: ['rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05)', '1px solid rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.1)', 'none'],
      neumorphic: ['var(--card-background-color)', 'none', 'inset 4px 4px 9px rgba(0, 0, 0, 0.22), inset -4px -4px 9px rgba(255, 255, 255, 0.07)'],
      glossy: ['linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.02)), var(--card-background-color)', 'none', 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15)'],
      outline: ['transparent', '1px solid var(--divider-color)', 'none'],
      minimal: ['transparent', 'none', 'none']
    };
    var d = by[t.surface] || by.flat;
    return { '--uc-pane-bg': t.pane_background || d[0], '--uc-pane-border': t.pane_border || d[1], '--uc-pane-shadow': t.pane_shadow || d[2] };
  }
  function radiusScale(r) { return String(Math.round(Math.min(RADIUS_SCALE_MAX, Math.max(0, r / BASE_CARD_RADIUS)) * 100) / 100); }
  function radiusInner(r, pad) {
    if (r <= 0) return 0;
    var c = r - (pad == null ? 16 : pad), lo = r * 0.5, hi = Math.max(lo, r - 4);
    return Math.round(Math.min(hi, Math.max(lo, c)) * 10) / 10;
  }

  function deriveCompanions(p, vars) {
    var set = function (k, v) { if (vars[k] === undefined) vars[k] = v; };
    var setColor = function (k, c) { set(k, toCss(c)); if (/-color$/.test(k)) set('--rgb' + k.slice(1), triple(c)); };
    var bg = parseColor(p.card_bg), text = parseColor(p.text), primary = parseColor(p.primary), sec = parseColor(p.text_secondary);
    if (bg && bg.a >= 0.5) {
      var nested = step(bg, 0.06);
      setColor('--secondary-background-color', nested);
      setColor('--primary-background-color', step(bg, 0.03));
      set('--mdc-theme-surface', toCss(bg));
      set('--input-fill-color', toCss(nested));
      if (!text) { var ink = contrastText(bg); setColor('--primary-text-color', ink); setColor('--secondary-text-color', withAlpha(ink, 0.7)); }
    }
    if (text) {
      setColor('--disabled-text-color', withAlpha(text, 0.38));
      var muted = sec || withAlpha(text, 0.7);
      if (!sec) setColor('--secondary-text-color', muted);
      if (!p.divider) setColor('--divider-color', withAlpha(text, 0.12));
    }
    if (primary) { var on = contrastText(primary); setColor('--text-primary-color', on); set('--mdc-theme-primary', toCss(primary)); }
  }

  /** Port of ucThemeService.getHostVars. */
  function hostVars(theme) {
    if (!theme || !theme.tokens) return {};
    var t = theme.tokens;
    var s = surfaceTokens(t.surface, { blur: t.blur, borderWidth: t.border_width, borderColor: t.border_color, shadow: t.shadow });
    var radius = Number(t.radius) || 0;
    var vars = {
      '--uc-theme-surface': t.surface || 'flat',
      '--uc-radius': radius + 'px',
      '--uc-radius-sm': (t.radius_sm == null ? Math.round(radius / 2) : t.radius_sm) + 'px',
      '--uc-blur': (t.blur == null ? 12 : t.blur) + 'px',
      '--uc-border-width': (t.border_width == null ? 1 : t.border_width) + 'px',
      '--uc-surface-bg': s.background, '--uc-surface-border': s.border, '--uc-surface-backdrop': s.backdropFilter, '--uc-shadow': s.shadow,
      '--uc-density': DENSITY_SCALE[t.density || 'regular'] || '1',
      '--uc-radius-scale': radiusScale(radius),
      '--uc-radius-inner': radiusInner(radius, theme.card && theme.card.card_padding) + 'px'
    };
    var pv = paneVars(t); for (var k in pv) vars[k] = pv[k];
    if (t.border_color) vars['--uc-border-color'] = t.border_color;
    if (t.accent) vars['--uc-accent'] = t.accent;
    if (t.font_family) vars['--uc-font-family'] = t.font_family;
    if (t.color_filter) vars['--uc-color-filter'] = t.color_filter;
    else if (t.grayscale > 0) vars['--uc-color-filter'] = 'grayscale(' + Math.min(1, t.grayscale) + ')';
    if (t.palette) {
      PALETTE_KEYS.forEach(function (key) {
        var value = t.palette[key];
        if (!value) return;
        (PALETTE_TO_VARS[key] || []).forEach(function (v) {
          vars[v] = value;
          var rgb = hexToRgb(value);
          if (rgb && /-color$/.test(v)) vars['--rgb' + v.slice(1)] = rgb;
        });
      });
      deriveCompanions(t.palette, vars);
    }
    MODULE_RADII.forEach(function (n) {
      vars['--uc-r-' + String(n).replace('.', '_')] = 'min(calc(' + n + 'px * var(--uc-radius-scale, 1)), var(--uc-radius-inner, 999px))';
    });
    return vars;
  }

  // Border a surface draws when the theme sets neither width nor colour
  // (port of SURFACE_BORDER in uc-theme-service.ts).
  var SURFACE_BORDER = {
    flat: [1, 'var(--divider-color)'], glass: [1, 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12)'], outline: [1, 'var(--divider-color)'],
    neumorphic: [0, null], glossy: [0, null], minimal: [0, null]
  };
  /** Port of chromeFromTokens: the card chrome a theme's tokens imply. */
  function chromeFromTokens(t) {
    var sb = SURFACE_BORDER[t.surface] || SURFACE_BORDER.flat;
    var chrome = { card_border_radius: Number(t.radius) || 0, card_border_width: t.border_width == null ? sb[0] : t.border_width };
    var color = t.border_color || sb[1];
    if (color) chrome.card_border_color = color;
    if (t.surface === 'outline' || t.surface === 'minimal') chrome.card_background = 'transparent';
    return chrome;
  }
  /** Port of resolveThemeCardChrome: `theme.card` layered over the tokens. */
  function resolveChrome(theme) {
    if (!theme || !theme.tokens) return {};
    return Object.assign(chromeFromTokens(theme.tokens), theme.card || {});
  }

  /** Card chrome as inline style: exactly what the card shell renders in HA. */
  function cardStyle(theme, vars) {
    var chrome = resolveChrome(theme);
    var t = (theme && theme.tokens) || {};
    var radius = chrome.card_border_radius != null ? chrome.card_border_radius : 12;
    var bg = chrome.card_transparent ? 'transparent' : (chrome.card_background || (theme ? vars['--uc-surface-bg'] : null) || 'var(--card-background-color, var(--ha-card-background, white))');
    var bw = chrome.card_transparent ? 0 : (chrome.card_border_width != null ? chrome.card_border_width : 1);
    var bc = chrome.card_border_color || 'var(--divider-color)';
    var shadow;
    if (chrome.card_shadow_enabled === false || chrome.card_transparent) shadow = 'none';
    else if (chrome.card_shadow_enabled) shadow = (chrome.card_shadow_horizontal || 0) + 'px ' + (chrome.card_shadow_vertical == null ? 4 : chrome.card_shadow_vertical) + 'px ' + (chrome.card_shadow_blur == null ? 12 : chrome.card_shadow_blur) + 'px ' + (chrome.card_shadow_spread || 0) + 'px ' + (chrome.card_shadow_color || 'rgba(0,0,0,0.15)');
    else shadow = theme ? (vars['--uc-shadow'] || 'none') : 'var(--ha-card-box-shadow, none)';
    var st = {
      'border-radius': radius + 'px', background: bg, border: bw + 'px solid ' + bc, 'box-shadow': shadow,
      padding: (chrome.card_padding == null ? 16 : chrome.card_padding) + 'px',
      'backdrop-filter': vars['--uc-surface-backdrop'] || 'none',
      '-webkit-backdrop-filter': vars['--uc-surface-backdrop'] || 'none',
      filter: vars['--uc-color-filter'] || 'none',
      color: 'var(--primary-text-color)'
    };
    if (t.font_family) st['font-family'] = t.font_family;
    return st;
  }

  // Semicolons outside quotes would start another declaration; inside a
  // quoted url("data:image/webp;base64,…") they are part of the value.
  function styleString(map) {
    return Object.keys(map).map(function (k) {
      var v = String(map[k]).replace(/("[^"]*"|'[^']*')|;/g, function (m, quoted) { return quoted || ' '; });
      return k + ':' + v + ';';
    }).join('');
  }

  // Values land inside style="…" attributes; a wallpaper written as
  // url("data:…") would otherwise close the attribute early.
  function attr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /**
   * Scope a theme's CSS to a preview stage: every selector in every rule is
   * prefixed with `scope`, at-rules with blocks recurse, @keyframes are left
   * alone. Good enough for the CSS the validator lets through.
   */
  function scopeCss(css, scope) {
    css = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');
    var out = '', i = 0, n = css.length;
    function readBlock(start) { // returns index after matching }
      var depth = 0;
      for (var j = start; j < n; j++) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') { depth--; if (depth === 0) return j + 1; }
      }
      return n;
    }
    while (i < n) {
      var open = css.indexOf('{', i);
      if (open < 0) break;
      var prelude = css.slice(i, open).trim();
      var end = readBlock(open);
      var body = css.slice(open + 1, end - 1);
      if (!prelude) { i = end; continue; }
      if (prelude[0] === '@') {
        if (/^@(media|supports|container|layer)/i.test(prelude)) out += prelude + '{' + scopeCss(body, scope) + '}';
        else out += prelude + '{' + body + '}';
      } else {
        var sel = prelude.split(',').map(function (s) {
          s = s.trim();
          if (!s) return '';
          if (/^:host\b/.test(s)) return scope + s.replace(/^:host(\([^)]*\))?/, '');
          return scope + ' ' + s;
        }).filter(Boolean).join(',');
        out += sel + '{' + body + '}';
      }
      i = end;
    }
    return out;
  }

  // -------------------------------------------------------------- preview DOM
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /**
   * Per-card hue and seeds, the same deal the card engine makes (seedForSlot):
   * golden-angle hues from a page salt, xorshift32 seeds. A preview keeps its
   * salt across edits so cards do not reshuffle on every keystroke; `reroll()`
   * deals a new hand, which is what the dice button does.
   */
  var SALT = Math.floor(Math.random() * 0xffffffff) >>> 0;
  function seedForSlot(slot, salt) {
    var hue = Math.round((salt % 360) + slot * 137.50776) % 360;
    var x = (Math.imul(slot + 1, 0x9e3779b1) ^ salt) >>> 0 || 1;
    var next = function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return Math.round((x / 0x100000000) * 100) / 100; };
    return { hue: hue, seeds: [next(), next(), next()] };
  }
  function seedVars(slot, salt) {
    var s = seedForSlot(slot, salt == null ? SALT : salt);
    return '--uc-card-hue:' + s.hue + ';--uc-card-seed-1:' + s.seeds[0] + ';--uc-card-seed-2:' + s.seeds[1] + ';--uc-card-seed-3:' + s.seeds[2] + ';';
  }
  function reroll() { SALT = Math.floor(Math.random() * 0xffffffff) >>> 0; return SALT; }
  /** Does any part of the theme react to the per-card hue or seeds? */
  function usesSeeds(theme) {
    return /--uc-card-(hue|seed-[123])/.test(JSON.stringify(theme || {}));
  }

  var PANE = 'background:var(--uc-pane-bg);border:var(--uc-pane-border);box-shadow:var(--uc-pane-shadow);border-radius:var(--uc-r-10);';
  var BTN_SURFACE = {
    glass: 'background:rgba(var(--rgb-primary-color),0.18);border:1px solid rgba(var(--rgb-primary-color),0.35);color:var(--primary-text-color);backdrop-filter:blur(var(--uc-blur));',
    outline: 'background:transparent;border:1.5px solid var(--uc-accent,var(--primary-color));color:var(--uc-accent,var(--primary-color));',
    minimal: 'background:transparent;border:1px solid transparent;color:var(--uc-accent,var(--primary-color));',
    neumorphic: 'background:var(--card-background-color);border:0;color:var(--primary-text-color);box-shadow:4px 4px 9px rgba(0,0,0,.2),-4px -4px 9px rgba(255,255,255,.08);',
    glossy: 'background:linear-gradient(180deg,rgba(255,255,255,.32),rgba(255,255,255,0) 55%),var(--uc-accent,var(--primary-color));border:0;color:var(--text-primary-color);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.18);',
    flat: 'background:var(--uc-accent,var(--primary-color));border:0;color:var(--text-primary-color);'
  };

  function sampleCards(theme, vars, salt) {
    var t = (theme && theme.tokens) || { surface: 'flat' };
    var surface = t.surface || 'flat';
    var card = attr(styleString(cardStyle(theme, vars)));
    var host = attr(styleString(vars));
    var slot = 0;
    var seedVarsNext = function () { return seedVars(slot++, salt); };
    var btn = 'padding:calc(9px * var(--uc-density,1)) 16px;border-radius:var(--uc-radius-sm);font:inherit;font-size:13px;font-weight:600;cursor:default;' + (BTN_SURFACE[surface] || BTN_SURFACE.flat);
    var ghost = 'padding:calc(9px * var(--uc-density,1)) 16px;border-radius:var(--uc-radius-sm);font:inherit;font-size:13px;font-weight:600;cursor:default;' + PANE + 'color:var(--primary-text-color);';
    var gap = 'calc(10px * var(--uc-density,1))';
    var icon = function (name, color) { return '<i class="mdi ' + name + '" style="font-size:20px;color:' + (color || 'var(--state-icon-color, var(--primary-text-color))') + '"></i>'; };
    var iconWrap = function (name, on) { return '<span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:var(--uc-r-10);' + PANE + (on ? 'color:var(--uc-accent,var(--primary-color));' : '') + '">' + icon(name, on ? 'var(--uc-accent,var(--primary-color))' : null) + '</span>'; };
    var toggle = function (on) {
      return '<span style="display:inline-block;width:40px;height:22px;border-radius:var(--uc-r-14);position:relative;' + (on ? 'background:var(--uc-accent,var(--primary-color));' : PANE) + '"><span style="position:absolute;top:3px;' + (on ? 'right:3px;background:var(--text-primary-color);' : 'left:3px;background:var(--secondary-text-color);') + 'width:16px;height:16px;border-radius:50%"></span></span>';
    };
    var row = function (name, state, iconName, on) {
      return '<div style="display:flex;align-items:center;gap:12px;padding:calc(8px * var(--uc-density,1)) 10px;' + PANE + '">' + iconWrap(iconName, on) +
        '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(name) + '</div><div style="font-size:12px;color:var(--secondary-text-color)">' + esc(state) + '</div></div>' + toggle(on) + '</div>';
    };
    var tile = function (name, iconName, on) {
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:calc(12px * var(--uc-density,1)) 8px;text-align:center;' + PANE + '">' + icon(iconName, on ? 'var(--uc-accent,var(--primary-color))' : null) + '<span style="font-size:11.5px;color:var(--secondary-text-color)">' + esc(name) + '</span></div>';
    };

    var c1 = '<div class="card-container uc-prev-card" style="' + card + host + seedVarsNext() + 'display:flex;flex-direction:column;gap:' + gap + '">' +
      '<div style="display:flex;align-items:center;gap:12px"><div style="flex:1"><div style="font-size:17px;font-weight:600;letter-spacing:-.01em">Living room</div><div style="font-size:12.5px;color:var(--secondary-text-color)">21.5° · 42% · 3 lights on</div></div>' + iconWrap('mdi-sofa-outline', true) + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + tile('Lights', 'mdi-lightbulb-group-outline', true) + tile('Climate', 'mdi-thermostat', false) + '</div>' +
      '<div style="height:10px;border-radius:var(--uc-radius-sm);overflow:hidden;' + PANE + '"><div style="width:62%;height:100%;background:var(--uc-accent,var(--primary-color));border-radius:inherit"></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" style="' + btn + '">Movie night</button><button type="button" style="' + ghost + '">All off</button></div></div>';

    var c2 = '<div class="card-container uc-prev-card" style="' + card + host + seedVarsNext() + 'display:flex;flex-direction:column;gap:8px">' +
      '<div style="font-size:15px;font-weight:600;margin-bottom:2px">Devices</div>' +
      row('Ceiling light', 'On · 80%', 'mdi-ceiling-light', true) + row('Fan', 'Off', 'mdi-fan', false) + row('Blinds', 'Closed', 'mdi-blinds-horizontal', false) + '</div>';

    var c3 = '<div class="card-container uc-prev-card" style="' + card + host + seedVarsNext() + 'display:flex;flex-direction:column;gap:' + gap + '">' +
      '<div style="display:flex;align-items:center;justify-content:space-between"><div style="font-size:15px;font-weight:600">Thermostat</div><span style="font-size:12px;padding:4px 10px;border-radius:var(--uc-r-12);' + PANE + 'color:var(--secondary-text-color)">Heating</span></div>' +
      '<div style="display:flex;align-items:center;gap:12px"><button type="button" style="width:36px;height:36px;border-radius:50%;font:inherit;font-size:18px;cursor:default;' + (BTN_SURFACE[surface] || BTN_SURFACE.flat) + '">−</button><div style="flex:1;text-align:center;font-size:30px;font-weight:300;letter-spacing:-.02em">21.5<span style="font-size:14px;color:var(--secondary-text-color)"> °C</span></div><button type="button" style="width:36px;height:36px;border-radius:50%;font:inherit;font-size:18px;cursor:default;' + (BTN_SURFACE[surface] || BTN_SURFACE.flat) + '">+</button></div>' +
      '<div style="position:relative;height:28px;border-radius:var(--uc-radius-sm);overflow:hidden;' + PANE + '"><div style="position:absolute;inset:0 45% 0 0;background:var(--uc-accent,var(--primary-color));opacity:.85;border-radius:inherit"></div><span style="position:absolute;inset:0;display:flex;align-items:center;padding:0 12px;font-size:12px;font-weight:600;color:var(--primary-text-color)">Brightness 55%</span></div>' +
      '<div style="display:flex;gap:8px"><button type="button" style="flex:1;' + ghost + 'text-align:center">Eco</button><button type="button" style="flex:1;' + btn + 'text-align:center">Comfort</button><button type="button" style="flex:1;' + ghost + 'text-align:center">Away</button></div></div>';
    return [c1, c2, c3];
  }

  /**
   * Paint a full preview into `el`: the theme's page background (or the HA
   * stage), three sample cards, and the theme CSS scoped to the stage.
   * opts: { mode: 'light'|'dark', width: number|null }
   */
  function renderPreview(el, theme, o) {
    o = o || {};
    var mode = o.mode === 'dark' ? 'dark' : 'light';
    var base = HA_BASE[mode];
    var vars = hostVars(theme);
    var stageVars = Object.assign({}, base);
    var pageBg = theme && theme.tokens && theme.tokens.page_background ? String(theme.tokens.page_background).replace(/\s+fixed\b/g, '') : null;
    // Glass over a flat HA background is indistinguishable from flat; the
    // stage adds soft colour behind the cards so blur and tint are visible,
    // the way any wallpaper would make them. Only when the theme paints nothing.
    var glassStage = !pageBg && theme && theme.tokens && theme.tokens.surface === 'glass';
    var stageBg = pageBg || (glassStage
      ? 'radial-gradient(60% 55% at 18% 15%, rgba(41, 182, 246, 0.35), transparent 70%), radial-gradient(50% 45% at 85% 25%, rgba(180, 76, 224, 0.32), transparent 70%), radial-gradient(55% 50% at 60% 95%, rgba(255, 152, 0, 0.22), transparent 70%), var(--lovelace-background)'
      : 'var(--lovelace-background)');
    var stageStyle = styleString(stageVars) + 'background:' + stageBg + ';';
    if (o.width) stageStyle += 'max-width:' + o.width + 'px;margin:0 auto;';
    el.classList.add('uc-stage-host');
    var scopeId = el.id || (el.id = 'uc-stage-' + Math.random().toString(36).slice(2, 8));
    var scope = '#' + scopeId + ' .uc-stage';
    var baseCss = scope + ' .uc-prev-card{box-sizing:border-box;font-family:var(--uc-font-family,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif);line-height:1.35;min-width:0}' +
      scope + ' .uc-prev-card *{box-sizing:border-box;font-family:inherit}' +
      scope + ' .uc-prev-card button{margin:0}' +
      scope + ' .uc-prev-card i.mdi{line-height:1}';
    var themeCss = theme && theme.css ? scopeCss(theme.css, scope) : '';
    var cards = sampleCards(theme, vars, o.salt);
    var cols = o.width && o.width < 560 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))';
    el.innerHTML = '<style>' + baseCss + themeCss + '</style><div class="uc-stage" style="' + attr(stageStyle) + 'padding:20px;border-radius:14px;min-height:320px;transition:background .25s">' +
      '<div style="display:grid;grid-template-columns:' + cols + ';gap:14px;align-items:start">' + cards.join('') + '</div></div>';
  }

  /** Small tile for gallery / lists: page background + one miniature card. */
  function swatchHtml(theme, mode) {
    var base = HA_BASE[mode === 'dark' ? 'dark' : 'light'];
    var vars = hostVars(theme);
    var t = (theme && theme.tokens) || { surface: 'flat' };
    var pageBg = t.page_background ? String(t.page_background).replace(/\s+fixed\b/g, '') : 'linear-gradient(135deg, rgba(var(--rgb-primary-color, 3, 169, 244), 0.18), transparent 60%), var(--secondary-background-color)';
    var cs = cardStyle(theme, vars);
    cs['border-radius'] = Math.min(parseFloat(cs['border-radius']) || 0, 14) + 'px';
    cs.padding = '9px';
    var accent = t.accent || 'var(--primary-color)';
    var surface = t.surface || 'flat';
    var btn = 'flex:1;height:10px;border-radius:var(--uc-radius-sm,4px);' + (surface === 'outline' ? 'border:1px solid ' + accent + ';background:transparent;' : 'background:' + accent + ';');
    return '<div class="uc-swatch" style="' + attr(styleString(base) + 'background:' + pageBg + ';') + 'padding:10px;border-radius:8px;overflow:hidden">' +
      '<div style="' + attr(styleString(cs) + styleString(vars)) + 'display:flex;flex-direction:column;gap:6px;min-height:52px;color:var(--primary-text-color)">' +
      '<div style="width:55%;height:5px;border-radius:3px;background:currentColor;opacity:.65"></div>' +
      '<div style="display:flex;gap:4px"><div style="' + btn + '"></div><div style="flex:1;height:10px;border-radius:var(--uc-radius-sm,4px);background:var(--uc-pane-bg);border:var(--uc-pane-border)"></div></div>' +
      '<div style="height:5px;border-radius:var(--uc-radius-sm,3px);background:var(--uc-pane-bg);border:var(--uc-pane-border);position:relative;overflow:hidden"><div style="position:absolute;inset:0 40% 0 0;background:' + accent + '"></div></div>' +
      '</div></div>';
  }

  // ------------------------------------------------------------- validation
  // Size budget, kept in sync with src/themes/uc-theme-validate.ts.
  var LIMITS = { css: 60000, page_background: 200000, pane_background: 20000, definition: 320000 };
  var CSS_BAD = [/@import/i, /expression\s*\(/i, /javascript:/i, /behavior\s*:/i, /-moz-binding/i, /<\s*\/?\s*(script|style|iframe)/i, /@font-face/i];
  var INLINE_IMG = /url\(\s*(["']?)data:image\/(svg\+xml|png|jpeg|gif|webp)((?:;[a-z0-9=-]+)*),([^)"']*)\1\s*\)/gi;
  // Markup that only makes sense in a live document; SVG-as-image cannot run
  // it, but a theme carrying it is not one we want to publish.
  var SVG_BAD = [[/<\s*script/i, 'script'], [/\bon[a-z]+\s*=/i, 'event handler'], [/javascript:/i, 'javascript:'], [/<\s*foreignObject/i, 'foreignObject'], [/(?:xlink:)?href\s*=\s*["']?\s*(?:https?:|\/\/)/i, 'external href'], [/url\s*\(\s*["']?\s*(?!#)/i, 'external url()']];
  function svgProblems(markup) {
    var out = [];
    SVG_BAD.forEach(function (p) { if (p[0].test(markup)) out.push(p[1]); });
    return out;
  }
  function cssProblems(css, max) {
    var out = [];
    max = max || LIMITS.css;
    if (typeof css !== 'string' || !css) return out;
    if (css.length > max) out.push('longer than ' + max.toLocaleString() + ' characters');
    var stripped = css.replace(INLINE_IMG, function (m, q, mime, params, payload) {
      // Only SVG carries markup; raster payloads are opaque bytes.
      if (!/svg/i.test(mime)) return 'inline-image';
      var decoded = payload;
      try { decoded = /;base64/i.test(params) ? atob(payload) : decodeURIComponent(payload); } catch (e) { /* keep raw */ }
      svgProblems(decoded).forEach(function (p) { out.push('inline SVG contains ' + p); });
      return 'inline-image';
    });
    if (/url\s*\(/i.test(stripped)) out.push('external url() is not allowed (inline data:image/* is fine)');
    CSS_BAD.forEach(function (re) { if (re.test(stripped)) out.push('contains ' + String(re).replace(/^\/|\/i?$/g, '').replace(/\\/g, '')); });
    return out;
  }

  /**
   * Client-side sanitiser mirroring src/themes/uc-theme-validate.ts: drops
   * unknown keys and out-of-range values so what we send is what the card keeps.
   * Returns { theme, problems[] }.
   */
  function sanitize(raw) {
    var problems = [];
    var num = function (v, lo, hi) { var n = Number(v); return v === '' || v == null || isNaN(n) ? undefined : Math.min(hi, Math.max(lo, n)); };
    var str = function (v, max) { if (typeof v !== 'string') return undefined; v = v.trim(); return v ? v.slice(0, max || 400) : undefined; };
    var cssv = function (v, max) {
      var s = str(v, max || 400);
      if (s === undefined) return undefined;
      if (/[{};<>]/.test(s) || /url\s*\(/i.test(s) && !/url\(\s*["']?#/.test(s) && !/data:image\//i.test(s) || /expression|javascript:|@import/i.test(s)) { problems.push('Dropped an unsafe value: ' + s.slice(0, 40)); return undefined; }
      return s;
    };
    var r = raw || {}; var rt = r.tokens || {};
    var t = { surface: SURFACES.indexOf(rt.surface) >= 0 ? rt.surface : 'flat', radius: num(rt.radius, 0, 200) == null ? 12 : num(rt.radius, 0, 200) };
    var rsm = num(rt.radius_sm, 0, 200); if (rsm != null) t.radius_sm = rsm;
    var bl = num(rt.blur, 0, 100); if (bl != null) t.blur = bl;
    var bw = num(rt.border_width, 0, 20); if (bw != null) t.border_width = bw;
    var bc = cssv(rt.border_color); if (bc) t.border_color = bc;
    var sh = cssv(rt.shadow, 600); if (sh) t.shadow = sh;
    if (DENSITIES.indexOf(rt.density) >= 0 && rt.density !== 'regular') t.density = rt.density;
    var ac = cssv(rt.accent); if (ac) t.accent = ac;
    var ff = cssv(rt.font_family, 200); if (ff) t.font_family = ff;
    var gs = rt.grayscale === true ? 1 : num(rt.grayscale, 0, 1); if (gs) t.grayscale = gs;
    var cf = str(rt.color_filter, 200);
    if (cf) { if (/^(\s*(grayscale|sepia|saturate|hue-rotate|brightness|contrast|invert|opacity)\([^()]*\)\s*)+$/.test(cf)) t.color_filter = cf; else problems.push('Colour filter may only use grayscale/sepia/saturate/hue-rotate/brightness/contrast/invert/opacity'); }
    // Backgrounds are rejected, never cut, when over budget: a truncated data URI is garbage.
    var pb = typeof rt.pane_background === 'string' ? rt.pane_background.trim() : '';
    if (pb) { var pbp = cssProblems(pb, LIMITS.pane_background); if (pbp.length) problems.push('Inner pane background rejected: ' + pbp.join(', ')); else t.pane_background = pb; }
    var pbo = cssv(rt.pane_border); if (pbo) t.pane_border = pbo;
    var psh = cssv(rt.pane_shadow, 600); if (psh) t.pane_shadow = psh;
    var pg = typeof rt.page_background === 'string' ? rt.page_background.trim() : '';
    if (pg) { var pgp = cssProblems(pg, LIMITS.page_background); if (pgp.length) problems.push('Dashboard background rejected: ' + pgp.join(', ')); else t.page_background = pg; }
    if (rt.palette && typeof rt.palette === 'object') {
      var pal = {};
      PALETTE_KEYS.forEach(function (k) { var v = cssv(rt.palette[k]); if (v) pal[k] = v; });
      if (Object.keys(pal).length) t.palette = pal;
    }
    var out = {
      id: /^[a-z0-9][a-z0-9_-]{0,63}$/.test(String(r.id || '')) ? r.id : 'my-theme',
      name: str(r.name, 80) || 'Untitled theme',
      version: Math.max(1, parseInt(r.version, 10) || 1),
      tokens: t
    };
    var au = str(r.author, 80); if (au) out.author = au;
    var de = str(r.description, 600); if (de) out.description = de;
    var ic = str(r.icon, 80); if (ic && /^mdi:[a-z0-9-]+$/.test(ic)) out.icon = ic;
    if (typeof r.preview === 'string' && /^(https:\/\/|data:image\/(png|jpe?g|webp);base64,)/i.test(r.preview)) out.preview = r.preview;
    if (r.card && typeof r.card === 'object') {
      var card = {};
      ['card_transparent', 'card_shadow_enabled'].forEach(function (k) { if (typeof r.card[k] === 'boolean') card[k] = r.card[k]; });
      ['card_background', 'card_border_color', 'card_shadow_color'].forEach(function (k) { var v = cssv(r.card[k]); if (v) card[k] = v; });
      ['card_border_radius', 'card_border_width', 'card_padding', 'card_shadow_horizontal', 'card_shadow_vertical', 'card_shadow_blur', 'card_shadow_spread'].forEach(function (k) { var v = num(r.card[k], -200, 400); if (v != null) card[k] = v; });
      if (Object.keys(card).length) out.card = card;
    }
    if (r.modules && typeof r.modules === 'object') {
      var mods = {};
      MODULE_FIELDS.forEach(function (f) {
        var m = r.modules[f.moduleType]; if (!m || m[f.key] == null || m[f.key] === '') return;
        var v = m[f.key];
        if (f.kind === 'select' && !f.options.some(function (op) { return op.value === v; })) return;
        if (f.kind === 'number') { v = num(v, f.min, f.max); if (v == null) return; }
        mods[f.moduleType] = mods[f.moduleType] || {}; mods[f.moduleType][f.key] = v;
      });
      if (r.modules.area_summary && r.modules.area_summary.accent_color) { var acc = cssv(r.modules.area_summary.accent_color); if (acc) { mods.area_summary = mods.area_summary || {}; mods.area_summary.accent_color = acc; } }
      if (Object.keys(mods).length) out.modules = mods;
    }
    if (typeof r.css === 'string' && r.css.trim()) {
      var cp = cssProblems(r.css, LIMITS.css);
      if (cp.length) problems.push('Custom CSS: ' + cp.join(', ')); else out.css = r.css.trim();
    }
    var total = JSON.stringify(out).length;
    if (total > LIMITS.definition) problems.push('Theme is ' + Math.round(total / 1024) + ' KB; the limit is ' + Math.round(LIMITS.definition / 1024) + ' KB. Use a smaller wallpaper or less CSS.');
    return { theme: out, problems: problems, bytes: total };
  }

  function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'my-theme'; }

  return {
    SURFACES: SURFACES, DENSITIES: DENSITIES, PALETTE_KEYS: PALETTE_KEYS, MODULE_FIELDS: MODULE_FIELDS, HA_BASE: HA_BASE, LIMITS: LIMITS,
    hostVars: hostVars, cardStyle: cardStyle, resolveChrome: resolveChrome, chromeFromTokens: chromeFromTokens, scopeCss: scopeCss,
    renderPreview: renderPreview, swatchHtml: swatchHtml, reroll: reroll, usesSeeds: usesSeeds,
    sanitize: sanitize, cssProblems: cssProblems, svgProblems: svgProblems,
    parseColor: parseColor, toCss: toCss, contrast: contrast, lum: lum, mix: mix, contrastText: contrastText, slugify: slugify, esc: esc
  };
})();
</script>
<?php
