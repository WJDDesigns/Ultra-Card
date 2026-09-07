<?php
/**
 * Theme gallery — /themes/
 *
 * Public catalog of approved Ultra Card themes with live swatches, downloads
 * and star ratings. Reads ultra-card/v1/themes; rating and remixing require
 * a signed-in account.
 *
 * @package UltraCardIntegration
 */

if (!defined('ABSPATH')) {
    exit;
}

$logged_in = is_user_logged_in();
$rest_nonce = $logged_in ? wp_create_nonce('wp_rest') : '';
$api_base = esc_url_raw(rest_url('ultra-card/v1'));
$version = defined('ULTRA_CARD_INTEGRATION_VERSION') ? ULTRA_CARD_INTEGRATION_VERSION : '';
$user_id = get_current_user_id();
$login_url = wp_login_url(home_url('/themes/'));

$ucp_page_title = 'Themes';
get_header();
$partial = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/partials/ucp-shared-head.php';
if (file_exists($partial)) {
    include $partial;
}
include ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/partials/uc-theme-runtime.php';
?>
<div class="ucp ucp-themes" id="ucp-themes"
  data-api="<?php echo esc_attr($api_base); ?>"
  data-nonce="<?php echo esc_attr($rest_nonce); ?>"
  data-user="<?php echo (int) $user_id; ?>"
  data-login="<?php echo esc_url($login_url); ?>"
  data-builder="<?php echo esc_url(home_url('/theme-builder/')); ?>">
  <header class="ucp-hero ucp-themes-hero">
    <div class="ucp-hero-glow" aria-hidden="true"></div>
    <div class="ucp-wrap ucp-themes-hero-in">
      <div>
        <div class="ucp-eyebrow"><span class="ucp-pulse"></span> Theme gallery<?php if ($version) : ?> · v<?php echo esc_html($version); ?><?php endif; ?></div>
        <h1 class="ucp-h1">One theme, <span class="ucp-grad-text">every card.</span></h1>
        <p class="ucp-sub">Ultra Card themes restyle every card and module on a dashboard at once: surface, corners, colours, wallpaper and the way modules draw themselves. Built-in themes ship with the card; these are the ones the community and the Ultra Card team have shared.</p>
      </div>
      <div class="ucp-themes-hero-actions">
        <a class="ucp-btn ucp-btn-blue" href="<?php echo esc_url(home_url('/theme-builder/')); ?>"><i class="mdi mdi-palette-swatch-outline"></i> Build a theme</a>
        <button type="button" class="ucp-btn ucp-btn-ghost" id="tg-how"><i class="mdi mdi-help-circle-outline"></i> How to install</button>
      </div>
    </div>
  </header>

  <div class="ucp-wrap">
    <div class="tg-toolbar">
      <div class="tg-search"><i class="mdi mdi-magnify"></i><input type="search" id="tg-search" placeholder="Search themes, authors, tags"></div>
      <div class="ucp-seg" id="tg-source" role="tablist">
        <button type="button" class="ucp-seg-btn active" data-value="all">All</button>
        <button type="button" class="ucp-seg-btn" data-value="official"><i class="mdi mdi-check-decagram"></i> Default</button>
        <button type="button" class="ucp-seg-btn" data-value="community"><i class="mdi mdi-account-group-outline"></i> Community</button>
      </div>
      <select id="tg-sort" aria-label="Sort">
        <option value="downloads">Most downloaded</option>
        <option value="rating">Top rated</option>
        <option value="date">Newest</option>
        <option value="title">A – Z</option>
      </select>
      <div class="ucp-seg" id="tg-mode" title="Preview on a light or dark Home Assistant theme">
        <button type="button" class="ucp-seg-btn active" data-value="light"><i class="mdi mdi-white-balance-sunny"></i></button>
        <button type="button" class="ucp-seg-btn" data-value="dark"><i class="mdi mdi-weather-night"></i></button>
      </div>
    </div>
    <p class="ucp-hint" id="tg-count" style="margin:-6px 0 14px"></p>
    <div id="tg-grid" class="tg-grid" aria-live="polite"></div>
  </div>

  <div class="ucp-modal" id="tg-modal" hidden>
    <div class="ucp-modal-backdrop" data-close></div>
    <div class="ucp-modal-card tg-modal-card" role="dialog" aria-modal="true" aria-labelledby="tg-m-title">
      <div class="ucp-modal-head">
        <div>
          <h3 id="tg-m-title"></h3>
          <div class="tg-m-sub" id="tg-m-sub"></div>
        </div>
        <button type="button" class="ucp-btn ucp-btn-ghost" data-close aria-label="Close" style="padding:8px 10px"><i class="mdi mdi-close"></i></button>
      </div>
      <div class="tg-m-body">
        <div id="tg-m-preview" class="tg-m-preview"></div>
        <p id="tg-m-desc" class="tg-m-desc"></p>
        <div id="tg-m-tags" class="tg-tags"></div>
        <div class="tg-m-rate" id="tg-m-rate"></div>
      </div>
      <div class="ucp-modal-actions">
        <button type="button" class="ucp-btn ucp-btn-ghost" id="tg-m-remix"><i class="mdi mdi-source-fork"></i> Remix in builder</button>
        <button type="button" class="ucp-btn ucp-btn-ghost" id="tg-m-download"><i class="mdi mdi-download-outline"></i> Download JSON</button>
        <button type="button" class="ucp-btn ucp-btn-blue" id="tg-m-copy"><i class="mdi mdi-content-copy"></i> Copy JSON</button>
      </div>
    </div>
  </div>

  <div class="ucp-modal" id="tg-howto" hidden>
    <div class="ucp-modal-backdrop" data-close></div>
    <div class="ucp-modal-card" role="dialog" aria-modal="true" aria-labelledby="tg-how-title">
      <div class="ucp-modal-head"><h3 id="tg-how-title">Installing a theme</h3><button type="button" class="ucp-btn ucp-btn-ghost" data-close aria-label="Close" style="padding:8px 10px"><i class="mdi mdi-close"></i></button></div>
      <ol class="tg-steps">
        <li><b>From the Hub (easiest).</b> In Home Assistant open the Ultra Card Hub › <b>Themes</b>. Everything in this gallery is listed there under Default and Community with the same downloads and ratings. Press <b>Install</b>; it lands in <b>My Themes</b>.</li>
        <li><b>Set it as the default.</b> Pick it under <b>Global default</b> to restyle every Ultra Card, or choose it per card in Card Settings › Appearance › Theme. Modules set to "Theme" follow it; anything you styled by hand stays as you left it.</li>
        <li><b>Or paste it.</b> Copy the JSON here and use Hub › Themes › <b>Import</b>. Signed-in with Ultra Card Connect, your own submissions sync into My Themes automatically.</li>
      </ol>
    </div>
  </div>
</div>

<style>
.ucp-themes-hero-in{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.ucp-themes-hero-actions{display:flex;gap:10px;flex-wrap:wrap}
.tg-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}
.tg-search{flex:1 1 240px;display:flex;align-items:center;gap:8px;padding:0 14px;border:1px solid var(--uc-line);border-radius:12px;background:rgba(0,0,0,.28)}
.tg-search .mdi{color:var(--uc-dim);font-size:20px}
.tg-search input{flex:1;background:none;border:0;color:#fff;padding:12px 0;font-size:14.5px;outline:0}
.tg-toolbar select{background:rgba(0,0,0,.28);border:1px solid var(--uc-line);border-radius:12px;color:#fff;padding:11px 12px;font-size:13.5px}
.ucp-seg{display:inline-flex;gap:4px;padding:4px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--uc-line);flex-wrap:wrap}
.ucp-seg-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;font-size:13px;font-weight:600;color:var(--uc-dim)}
.ucp-seg-btn.active{background:rgba(41,182,246,.16);color:#fff}
.tg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding-bottom:40px}
.tg-card{display:flex;flex-direction:column;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:var(--uc-card);overflow:hidden;transition:transform .15s,border-color .15s;text-align:left}
.tg-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.22)}
.tg-card-preview{position:relative;aspect-ratio:16/9;background:#111;overflow:hidden;cursor:pointer}
.tg-card-preview img{width:100%;height:100%;object-fit:cover;display:block}
.tg-card-preview .uc-swatch{position:absolute;inset:0;border-radius:0!important;padding:18px 24px!important;display:flex;align-items:center}
.tg-card-preview .uc-swatch>div{width:100%}
.tg-badge{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.03em;background:rgba(0,0,0,.6);color:#fff;backdrop-filter:blur(6px)}
.tg-badge.official{background:rgba(41,182,246,.85)}
.tg-badge.community{background:rgba(128,23,162,.85)}
.tg-card-body{display:flex;flex-direction:column;gap:8px;padding:14px 16px 16px}
.tg-card-title{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.tg-card-title h3{font-size:16px;font-weight:800;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tg-card-title span{font-size:12px;color:var(--uc-dim);white-space:nowrap}
.tg-card-desc{font-size:13px;color:var(--uc-dim);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.9em}
.tg-stats{display:flex;align-items:center;gap:14px;font-size:12.5px;color:var(--uc-dim)}
.tg-stat{display:inline-flex;align-items:center;gap:5px}
.tg-stat .mdi{font-size:16px}
.tg-stars{display:inline-flex;gap:1px}
.tg-stars .mdi{font-size:16px;color:rgba(255,255,255,.22)}
.tg-stars .mdi.on{color:var(--uc-gold)}
.tg-stars.interactive .mdi{cursor:pointer;transition:transform .1s}
.tg-stars.interactive .mdi:hover{transform:scale(1.2)}
.tg-stars.mine .mdi.on{color:var(--uc-blue)}
.tg-tags{display:flex;flex-wrap:wrap;gap:6px}
.tg-tag{font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid var(--uc-line);color:var(--uc-dim)}
.tg-card-actions{display:flex;gap:6px;margin-top:4px}
.tg-card-actions .ucp-btn{flex:1;padding:9px 10px;font-size:12.5px;border-radius:10px}
.tg-modal-card{width:min(860px,100%)}
.tg-m-sub{font-size:13px;color:var(--uc-dim);margin-top:4px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.tg-m-body{overflow:auto;display:flex;flex-direction:column;gap:14px;min-height:0}
.tg-m-preview{border-radius:12px;overflow:hidden}
.tg-m-desc{font-size:14px;color:var(--uc-txt);line-height:1.55}
.tg-m-rate{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:12px;background:rgba(0,0,0,.22);font-size:13.5px}
.tg-m-rate .tg-stars .mdi{font-size:24px}
.tg-steps{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:12px;font-size:14px;line-height:1.55;color:var(--uc-txt)}
.ucp-empty{padding:40px 20px;text-align:center;color:var(--uc-dim);border:1px dashed var(--uc-line);border-radius:var(--uc-r)}
.ucp-empty .mdi{font-size:36px;display:block;margin-bottom:8px}
.ucp-modal{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:24px}
.ucp-modal[hidden]{display:none!important}
.ucp-modal-backdrop{position:absolute;inset:0;z-index:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px)}
.ucp-modal-card{position:relative;z-index:1;width:min(720px,100%);max-height:min(88vh,900px);display:flex;flex-direction:column;border:1px solid var(--uc-line);border-radius:16px;background:var(--uc-card);box-shadow:0 24px 80px rgba(0,0,0,.45);padding:18px}
.ucp-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
.ucp-modal-head h3{margin:0;font-size:20px}
.ucp-modal-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:14px}
.tg-skel{aspect-ratio:16/11;border-radius:var(--uc-r);border:1px solid var(--uc-line);background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.09) 45%,rgba(255,255,255,.04) 90%);background-size:220% 100%;animation:tgShine 1.35s ease-in-out infinite}
@keyframes tgShine{0%{background-position:100% 0}100%{background-position:-100% 0}}
@media (max-width:700px){
  .tg-toolbar{gap:8px}
  .tg-search{flex-basis:100%}
  .tg-toolbar select{flex:1}
  .tg-grid{grid-template-columns:1fr}
  .ucp-modal{padding:10px}
  .ucp-modal-card{max-height:94vh;padding:14px}
  .ucp-modal-actions .ucp-btn{flex:1 1 auto}
  .ucp-themes-hero-actions{width:100%}
  .ucp-themes-hero-actions .ucp-btn{flex:1 1 auto}
}
</style>

<script>
(function () {
  var root = document.getElementById('ucp-themes');
  if (!root || !window.UcTheme) return;
  var U = window.UcTheme;
  var API = root.getAttribute('data-api'), NONCE = root.getAttribute('data-nonce'), USER = parseInt(root.getAttribute('data-user') || '0', 10);
  var LOGIN = root.getAttribute('data-login'), BUILDER = root.getAttribute('data-builder');
  var state = { all: [], q: '', source: 'all', sort: 'downloads', mode: 'light', open: null };
  var grid = document.getElementById('tg-grid');

  function api(path, o) {
    o = o || {};
    var headers = Object.assign({ Accept: 'application/json' }, NONCE ? { 'X-WP-Nonce': NONCE } : {}, o.headers || {});
    return fetch(API + path, Object.assign({ credentials: 'same-origin' }, o, { headers: headers })).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (!r.ok) throw new Error((b && (b.message || (b.data && b.data.message))) || ('Request failed (' + r.status + ')'));
        return b;
      });
    });
  }
  var esc = U.esc;

  function stars(value, opts) {
    opts = opts || {};
    var v = Math.round(Number(value) || 0);
    var out = '<span class="tg-stars' + (opts.interactive ? ' interactive' : '') + (opts.mine ? ' mine' : '') + '" role="' + (opts.interactive ? 'radiogroup' : 'img') + '" aria-label="' + (v ? v + ' of 5 stars' : 'Not rated') + '">';
    for (var i = 1; i <= 5; i++) out += '<i class="mdi mdi-star' + (i <= v ? ' on' : '') + '" data-star="' + i + '"' + (opts.interactive ? ' role="radio" tabindex="0" aria-checked="' + (i === v) + '"' : '') + '></i>';
    return out + '</span>';
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = state.all.filter(function (t) {
      if (state.source !== 'all' && t.source !== state.source) return false;
      if (!q) return true;
      return [t.name, t.author, t.description].concat(t.tags || []).join(' ').toLowerCase().indexOf(q) >= 0;
    });
    list.sort(function (a, b) {
      if (state.sort === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (state.sort === 'rating') return ((b.rating || 0) - (a.rating || 0)) || ((b.rating_count || 0) - (a.rating_count || 0));
      if (state.sort === 'title') return String(a.name).localeCompare(String(b.name));
      return String(b.date).localeCompare(String(a.date));
    });
    return list;
  }

  function render() {
    var list = filtered();
    document.getElementById('tg-count').textContent = list.length ? list.length + ' theme' + (list.length === 1 ? '' : 's') : '';
    if (!list.length) {
      grid.innerHTML = '<div class="ucp-empty" style="grid-column:1/-1"><i class="mdi mdi-palette-swatch-outline"></i>' + (state.all.length ? 'Nothing matches that filter.' : 'No themes have been published yet. Be the first: build one and submit it for review.') + '</div>';
      return;
    }
    grid.innerHTML = list.map(function (t) {
      var preview = t.preview ? '<img src="' + esc(t.preview) + '" alt="" loading="lazy">' : (t.definition ? U.swatchHtml(t.definition, state.mode) : '');
      return '<article class="tg-card" id="theme-' + esc(t.id) + '" data-id="' + esc(t.id) + '">' +
        '<div class="tg-card-preview" data-open>' + preview + '<span class="tg-badge ' + esc(t.source) + '"><i class="mdi ' + (t.source === 'official' ? 'mdi-check-decagram' : 'mdi-account-group-outline') + '"></i> ' + (t.source === 'official' ? 'Default' : 'Community') + '</span></div>' +
        '<div class="tg-card-body">' +
        '<div class="tg-card-title"><h3>' + esc(t.name) + '</h3><span>by ' + esc(t.author || 'Unknown') + '</span></div>' +
        '<p class="tg-card-desc">' + esc(t.description || '') + '</p>' +
        '<div class="tg-stats"><span class="tg-stat" title="Downloads"><i class="mdi mdi-download-outline"></i>' + esc(t.downloads || 0) + '</span>' +
        '<span class="tg-stat" title="' + (t.rating_count ? esc(Number(t.rating).toFixed(1)) + ' from ' + esc(t.rating_count) + ' rating' + (t.rating_count === 1 ? '' : 's') : 'Not rated yet') + '">' + stars(t.rating) + '<span>' + (t.rating_count ? esc(Number(t.rating).toFixed(1)) + ' (' + esc(t.rating_count) + ')' : '—') + '</span></span></div>' +
        '<div class="tg-card-actions"><button type="button" class="ucp-btn ucp-btn-ghost" data-open><i class="mdi mdi-eye-outline"></i> Preview</button><button type="button" class="ucp-btn ucp-btn-blue" data-copy><i class="mdi mdi-content-copy"></i> Copy JSON</button></div>' +
        '</div></article>';
    }).join('');
  }

  function byId(id) { return state.all.find(function (t) { return String(t.id) === String(id); }); }
  function track(t) {
    api('/themes/' + t.id + '/track-download', { method: 'POST' }).then(function (r) { if (r && typeof r.downloads === 'number') { t.downloads = r.downloads; } }).catch(function () {});
  }
  // Listings leave out heavy fields (inline wallpapers, big CSS); fetch the
  // whole theme once before anything that needs it exact.
  function full(t) {
    if (!t.definition_partial) return Promise.resolve(t);
    return api('/themes/' + t.id).then(function (r) {
      if (r && r.definition) { t.definition = r.definition; t.definition_partial = false; }
      return t;
    });
  }
  function copyJson(t, btn) {
    full(t).then(function () {
      var json = JSON.stringify(t.definition || {}, null, 2);
      return navigator.clipboard.writeText(json);
    }).then(function () {
      if (btn) { var was = btn.innerHTML; btn.innerHTML = '<i class="mdi mdi-check"></i> Copied'; setTimeout(function () { btn.innerHTML = was; }, 1600); }
      track(t);
    }).catch(function () { alert('Copy failed. Use Download instead.'); });
  }
  function downloadJson(t) {
    full(t).then(function () {
      var blob = new Blob([JSON.stringify(t.definition || {}, null, 2)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = U.slugify(t.name) + '.ultratheme.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      track(t);
    }).catch(function (e) { alert(e.message || 'Download failed'); });
  }

  // ------------------------------------------------------------------ modal
  var modal = document.getElementById('tg-modal');
  function openModal(t) {
    state.open = t;
    document.getElementById('tg-m-title').textContent = t.name;
    document.getElementById('tg-m-sub').innerHTML = '<span>by ' + esc(t.author || 'Unknown') + '</span><span class="tg-stat"><i class="mdi mdi-download-outline"></i>' + esc(t.downloads || 0) + '</span><span class="tg-stat">' + stars(t.rating) + (t.rating_count ? '<span>' + esc(Number(t.rating).toFixed(1)) + ' (' + esc(t.rating_count) + ')</span>' : '') + '</span><span class="ucp-hint">v' + esc(t.version || 1) + '</span>';
    document.getElementById('tg-m-desc').textContent = t.description || '';
    document.getElementById('tg-m-tags').innerHTML = (t.tags || []).map(function (x) { return '<span class="tg-tag">' + esc(x) + '</span>'; }).join('');
    U.renderPreview(document.getElementById('tg-m-preview'), t.definition || { tokens: { surface: 'flat', radius: 12 } }, { mode: state.mode, width: null });
    if (t.definition_partial) full(t).then(function () { if (state.open === t) U.renderPreview(document.getElementById('tg-m-preview'), t.definition, { mode: state.mode, width: null }); }).catch(function () {});
    renderRate(t);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModals() { modal.hidden = true; document.getElementById('tg-howto').hidden = true; document.body.style.overflow = ''; state.open = null; }
  function renderRate(t) {
    var box = document.getElementById('tg-m-rate');
    if (!USER) { box.innerHTML = '<span>Rate this theme</span>' + stars(0) + '<a class="ucp-btn ucp-btn-ghost" style="padding:7px 12px;font-size:12.5px;margin-left:auto" href="' + esc(LOGIN) + '">Sign in to rate</a>'; return; }
    if (t.author_id === USER) { box.innerHTML = '<span class="ucp-hint">This is your theme. Ratings come from other members.</span>'; return; }
    var mine = t.my_rating || 0;
    box.innerHTML = '<span>' + (mine ? 'Your rating' : 'Rate this theme') + '</span>' + stars(mine, { interactive: true, mine: !!mine }) + (mine ? '<button type="button" class="ucp-btn ucp-btn-ghost" data-unrate style="padding:7px 12px;font-size:12.5px;margin-left:auto">Remove</button>' : '');
    box.querySelectorAll('[data-star]').forEach(function (s) {
      var go = function () { rate(t, parseInt(s.getAttribute('data-star'), 10)); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    var un = box.querySelector('[data-unrate]');
    if (un) un.addEventListener('click', function () { rate(t, 0); });
  }
  function rate(t, value) {
    var req = value ? api('/themes/' + t.id + '/rate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: value }) }) : api('/themes/' + t.id + '/rate', { method: 'DELETE' });
    req.then(function (r) {
      t.rating = r.rating; t.rating_count = r.rating_count; t.my_rating = r.my_rating || 0;
      renderRate(t); render();
      if (state.open === t) document.getElementById('tg-m-sub').innerHTML = '<span>by ' + esc(t.author || 'Unknown') + '</span><span class="tg-stat"><i class="mdi mdi-download-outline"></i>' + esc(t.downloads || 0) + '</span><span class="tg-stat">' + stars(t.rating) + (t.rating_count ? '<span>' + esc(Number(t.rating).toFixed(1)) + ' (' + esc(t.rating_count) + ')</span>' : '') + '</span>';
    }).catch(function (e) { alert(e.message || 'Could not save rating'); });
  }

  // ------------------------------------------------------------------- wire
  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.tg-card'); if (!card) return;
    var t = byId(card.getAttribute('data-id')); if (!t) return;
    if (e.target.closest('[data-copy]')) return copyJson(t, e.target.closest('[data-copy]'));
    if (e.target.closest('[data-open]')) return openModal(t);
  });
  document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', closeModals); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModals(); });
  document.getElementById('tg-how').addEventListener('click', function () { document.getElementById('tg-howto').hidden = false; document.body.style.overflow = 'hidden'; });
  document.getElementById('tg-m-copy').addEventListener('click', function () { if (state.open) copyJson(state.open, this); });
  document.getElementById('tg-m-download').addEventListener('click', function () { if (state.open) downloadJson(state.open); });
  document.getElementById('tg-m-remix').addEventListener('click', function () { if (state.open) location.href = BUILDER + '?fork=' + encodeURIComponent(state.open.id); });
  document.getElementById('tg-search').addEventListener('input', function (e) { state.q = e.target.value; render(); });
  document.getElementById('tg-sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
  document.querySelectorAll('#tg-source .ucp-seg-btn').forEach(function (b) { b.addEventListener('click', function () { state.source = b.getAttribute('data-value'); document.querySelectorAll('#tg-source .ucp-seg-btn').forEach(function (x) { x.classList.toggle('active', x === b); }); render(); }); });
  document.querySelectorAll('#tg-mode .ucp-seg-btn').forEach(function (b) { b.addEventListener('click', function () { state.mode = b.getAttribute('data-value'); document.querySelectorAll('#tg-mode .ucp-seg-btn').forEach(function (x) { x.classList.toggle('active', x === b); }); render(); if (state.open) U.renderPreview(document.getElementById('tg-m-preview'), state.open.definition, { mode: state.mode }); }); });

  async function boot() {
    grid.innerHTML = '<div class="tg-skel"></div><div class="tg-skel"></div><div class="tg-skel"></div>';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { state.mode = 'dark'; document.querySelectorAll('#tg-mode .ucp-seg-btn').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-value') === 'dark'); }); }
    try {
      var all = [], page = 1, pages = 1;
      do {
        var r = await api('/themes?per_page=100&orderby=downloads&page=' + page);
        all = all.concat(r.themes || []); pages = r.total_pages || 1; page++;
      } while (page <= pages && page <= 5);
      state.all = all;
      render();
      var hash = /^#theme-(\d+)$/.exec(location.hash || '');
      if (hash) { var t = byId(hash[1]); if (t) openModal(t); }
    } catch (e) {
      grid.innerHTML = '<div class="ucp-empty" style="grid-column:1/-1"><i class="mdi mdi-alert-circle-outline"></i>' + esc(e.message || 'Could not load themes.') + '</div>';
    }
  }
  boot();
})();
</script>
<?php
get_footer();
