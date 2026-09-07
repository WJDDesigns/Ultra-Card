<?php
/**
 * Theme gallery — /themes/
 *
 * Public catalog of approved Ultra Card themes. Laid out as the twin of the
 * Presets gallery (website/presets-page-embed.html): hero with search and
 * stats, source segments, surface chips, card grid and a detail modal with
 * a live preview, ratings, downloads and the theme JSON. Reads
 * ultra-card/v1/themes; rating and remixing need a signed-in account.
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

  <header class="ucp-hero tg-hero">
    <div class="ucp-hero-glow" aria-hidden="true"></div>
    <div class="ucp-wrap">
      <div class="ucp-eyebrow"><span class="ucp-pulse"></span> Theme gallery<?php if ($version) : ?> · v<?php echo esc_html($version); ?><?php endif; ?></div>
      <h1 class="ucp-h1">One theme.<br><span class="ucp-grad-text">Every card.</span></h1>
      <p class="ucp-sub">Browse Ultra Card themes from the community and the Ultra Card team. A theme restyles every card and module on a dashboard at once. Open any theme for a live preview and the JSON to install.</p>
      <div class="tg-search-hero">
        <i class="mdi mdi-magnify"></i>
        <input type="search" id="tg-search" placeholder="Search themes: glass, dark, terminal, wood&hellip;" aria-label="Search themes">
        <button type="button" class="tg-search-clear" id="tg-search-clear" aria-label="Clear search" hidden><i class="mdi mdi-close"></i></button>
      </div>
      <div class="tg-stats">
        <div class="tg-stat"><b data-stat="total">—</b><span>Themes</span></div>
        <div class="tg-stat"><b data-stat="community">—</b><span>Community</span></div>
        <div class="tg-stat tg-stat-official"><b data-stat="official">—</b><span>Default</span></div>
        <div class="tg-stat"><b data-stat="downloads">—</b><span>Downloads</span></div>
      </div>
      <div class="tg-hero-actions">
        <a class="ucp-btn ucp-btn-blue" href="<?php echo esc_url(home_url('/theme-builder/')); ?>"><i class="mdi mdi-palette-swatch-outline"></i> Build a theme</a>
        <button type="button" class="ucp-btn ucp-btn-ghost" id="tg-how"><i class="mdi mdi-help-circle-outline"></i> How to install</button>
      </div>
    </div>
  </header>

  <nav class="tg-controls" aria-label="Theme filters">
    <div class="ucp-wrap tg-controls-in">
      <div class="ucp-seg" id="tg-source" role="tablist">
        <button type="button" class="ucp-seg-btn active" data-source="all">All</button>
        <button type="button" class="ucp-seg-btn" data-source="community">Community</button>
        <button type="button" class="ucp-seg-btn" data-source="official"><i class="mdi mdi-shield-check"></i> Default</button>
      </div>
      <div class="tg-chips" id="tg-chips">
        <!-- Rebuilt from the surfaces actually present once themes load. -->
        <button type="button" class="tg-chip active" data-surface="all">All surfaces</button>
      </div>
      <div class="tg-controls-end">
        <select id="tg-sort" class="tg-sort" aria-label="Sort">
          <option value="downloads">Most downloaded</option>
          <option value="rating">Top rated</option>
          <option value="date">Newest</option>
          <option value="title">A – Z</option>
        </select>
        <div class="ucp-seg tg-mode" id="tg-mode" title="Preview on a light or dark Home Assistant theme">
          <button type="button" class="ucp-seg-btn active" data-mode="light" aria-label="Light previews"><i class="mdi mdi-white-balance-sunny"></i></button>
          <button type="button" class="ucp-seg-btn" data-mode="dark" aria-label="Dark previews"><i class="mdi mdi-weather-night"></i></button>
        </div>
        <div class="tg-result-count" id="tg-count"></div>
      </div>
    </div>
  </nav>

  <section class="tg-section">
    <div class="ucp-wrap">
      <div class="tg-grid" id="tg-grid" aria-live="polite"></div>
      <div class="tg-noresults" id="tg-noresults" hidden><i class="mdi mdi-magnify-remove-outline"></i><p id="tg-noresults-text">No themes match.</p></div>
    </div>
  </section>

  <div class="tg-modal" id="tg-modal" hidden>
    <div class="tg-modal-backdrop" data-close></div>
    <div class="tg-modal-card" role="dialog" aria-modal="true" aria-labelledby="tg-m-title">
      <button type="button" class="tg-modal-x" data-close aria-label="Close"><i class="mdi mdi-close"></i></button>
      <div class="tg-modal-pv">
        <div class="tg-modal-pv-stage" id="tg-m-preview"></div>
        <div class="ucp-seg tg-mode tg-modal-mode" id="tg-m-mode" title="Preview on a light or dark Home Assistant theme">
          <button type="button" class="ucp-seg-btn" data-mode="light" aria-label="Light preview"><i class="mdi mdi-white-balance-sunny"></i></button>
          <button type="button" class="ucp-seg-btn" data-mode="dark" aria-label="Dark preview"><i class="mdi mdi-weather-night"></i></button>
        </div>
      </div>
      <div class="tg-modal-body">
        <div class="tg-modal-head">
          <i class="tg-modal-icon mdi mdi-palette-swatch-outline" id="tg-m-icon"></i>
          <div>
            <h3 id="tg-m-title"></h3>
            <div class="tg-modal-badges" id="tg-m-badges"></div>
          </div>
        </div>
        <p class="tg-modal-desc" id="tg-m-desc"></p>
        <div class="tg-modal-meta" id="tg-m-meta"></div>
        <div class="tg-modal-tags" id="tg-m-tags"></div>
        <div class="tg-m-rate" id="tg-m-rate"></div>
        <div class="tg-modal-code-wrap" id="tg-m-code-wrap">
          <div class="tg-modal-code-head">
            <span>Theme JSON</span>
            <div class="tg-modal-code-actions">
              <button type="button" class="ucp-btn ucp-btn-ghost ucp-btn-sm" id="tg-m-copy-sm"><i class="mdi mdi-content-copy"></i> <span>Copy</span></button>
              <button type="button" class="ucp-btn ucp-btn-ghost ucp-btn-sm" id="tg-m-download-sm"><i class="mdi mdi-download"></i> <span>Download</span></button>
            </div>
          </div>
          <p class="tg-modal-code-hint">Paste into Home Assistant: Ultra Card Hub › Themes › Import. Or press Install on this theme in the Hub, it is listed there too.</p>
          <pre class="tg-modal-code" id="tg-m-code">Loading…</pre>
        </div>
        <div class="tg-modal-ctas">
          <button type="button" class="ucp-btn ucp-btn-blue" id="tg-m-copy"><i class="mdi mdi-content-copy"></i> Copy theme JSON</button>
          <button type="button" class="ucp-btn ucp-btn-ghost" id="tg-m-download"><i class="mdi mdi-download"></i> Download JSON</button>
          <button type="button" class="ucp-btn ucp-btn-ghost" id="tg-m-remix"><i class="mdi mdi-source-fork"></i> Remix in builder</button>
          <a class="ucp-btn ucp-btn-ghost" href="https://github.com/WJDDesigns/Ultra-Card" target="_blank" rel="noopener"><i class="mdi mdi-github"></i> Get Ultra Card</a>
        </div>
      </div>
    </div>
  </div>

  <div class="tg-modal" id="tg-howto" hidden>
    <div class="tg-modal-backdrop" data-close></div>
    <div class="tg-modal-card tg-modal-card-sm" role="dialog" aria-modal="true" aria-labelledby="tg-how-title">
      <button type="button" class="tg-modal-x" data-close aria-label="Close"><i class="mdi mdi-close"></i></button>
      <div class="tg-modal-body">
        <div class="tg-modal-head">
          <i class="tg-modal-icon mdi mdi-download-circle-outline"></i>
          <div><h3 id="tg-how-title">Installing a theme</h3></div>
        </div>
        <ol class="tg-steps">
          <li><b>From the Hub (easiest).</b> In Home Assistant open the Ultra Card Hub › <b>Themes</b>. Everything in this gallery is listed there under Default and Community with the same downloads and ratings. Press <b>Install</b>; it lands in <b>My Themes</b>.</li>
          <li><b>Set it as the default.</b> Pick it under <b>Global default</b> to restyle every Ultra Card, or choose it per card in Card Settings › Appearance › Theme. Modules set to "Theme" follow it; anything you styled by hand stays as you left it.</li>
          <li><b>Or paste it.</b> Copy the JSON here and use Hub › Themes › <b>Import</b>. Signed in with Ultra Card Connect, your own submissions sync into My Themes automatically.</li>
        </ol>
      </div>
    </div>
  </div>
</div>

<style>
/* Hero: centred, presets-gallery proportions. */
.tg-hero{text-align:center;padding-bottom:56px}
.tg-hero .ucp-h1{font-size:clamp(38px,6vw,68px);margin:18px 0 16px}
.ucp .tg-hero .ucp-sub{max-width:660px;margin:0 auto;font-size:17px;text-align:center!important}
.tg-search-hero{position:relative;display:flex;align-items:center;max-width:620px;margin:30px auto 0;background:var(--uc-card);border:1px solid var(--uc-line);border-radius:999px;padding:4px 8px 4px 20px;box-shadow:0 12px 40px rgba(0,0,0,.45)}
.tg-search-hero:focus-within{border-color:var(--uc-blue)}
.tg-search-hero .mdi-magnify{font-size:22px;color:var(--uc-dim)}
.tg-search-hero input{flex:1;min-width:0;background:none;border:0;outline:0;color:#fff;font-size:16px;padding:13px 12px;box-shadow:none}
.tg-search-clear{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;display:inline-flex;align-items:center;justify-content:center}
.tg-stats{position:relative;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:32px}
.tg-stat{min-width:118px;padding:14px 20px;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:rgba(255,255,255,.03)}
.tg-stat b{display:block;font-size:26px;font-weight:800;color:#fff}
.tg-stat span{font-size:12.5px;color:var(--uc-dim);text-transform:uppercase;letter-spacing:.05em}
.tg-stat-official{border-color:rgba(41,182,246,.35)}
.tg-stat-official b{color:#6fd4ff}
.tg-hero-actions{position:relative;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:26px}

/* Filters */
.tg-controls{position:relative;z-index:1;padding:12px 0 4px}
.tg-controls-in{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.ucp-seg{display:inline-flex;background:var(--uc-card);border:1px solid var(--uc-line);border-radius:999px;padding:4px}
.ucp-seg-btn{padding:8px 20px;border-radius:999px;font-weight:700;font-size:14px;color:var(--uc-dim);display:inline-flex;align-items:center;gap:6px}
.ucp-seg-btn.active{background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));color:#fff}
.tg-mode .ucp-seg-btn{padding:8px 12px}
.tg-mode .ucp-seg-btn .mdi{font-size:17px}
.tg-chips{display:flex;gap:8px;flex-wrap:wrap;flex:1}
.tg-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:999px;font-size:13.5px;font-weight:600;color:var(--uc-dim);border:1px solid var(--uc-line);background:rgba(255,255,255,.03);transition:all .15s}
.tg-chip:hover{color:#fff;border-color:rgba(255,255,255,.28)}
.tg-chip.active{color:#fff;border-color:var(--uc-blue);background:rgba(41,182,246,.14)}
.tg-chip .mdi{font-size:16px}
.tg-controls-end{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-left:auto}
.ucp .tg-sort{background:var(--uc-card);border:1px solid var(--uc-line);border-radius:999px;color:#fff;padding:10px 36px 10px 16px;font-size:13.5px;font-weight:600;outline:0;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%239aa3b2' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;cursor:pointer}
.ucp .tg-sort:focus{border-color:var(--uc-blue)}
.ucp .tg-sort option{background:#14171d;color:#fff}
.tg-result-count{font-size:13px;color:var(--uc-dim);white-space:nowrap}

/* Grid */
.tg-section{padding:40px 0 60px}
.tg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:20px}
.tg-card{display:flex;flex-direction:column;background:var(--uc-card);border:1px solid var(--uc-line);border-radius:var(--uc-r);overflow:hidden;transition:transform .18s,border-color .18s,box-shadow .18s;cursor:pointer;text-align:left;width:100%;color:inherit}
.tg-card:hover,.tg-card:focus-visible{transform:translateY(-4px);border-color:rgba(41,182,246,.55);box-shadow:0 18px 44px rgba(0,0,0,.5);color:#fff;outline:0}
.tg-pv{position:relative;height:190px;background:#101318;border-bottom:1px solid var(--uc-line);display:flex;align-items:center;justify-content:center;overflow:hidden}
.tg-pv img{width:100%;height:100%;object-fit:cover;display:block}
.tg-pv .uc-swatch{position:absolute;inset:0;border-radius:0!important;padding:22px 28px!important;display:flex;align-items:center}
.tg-pv .uc-swatch>div{width:100%}
.tg-pv-ph{display:flex;flex-direction:column;align-items:center;gap:10px;color:#5f6877}
.tg-pv-ph .mdi{font-size:42px;background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));-webkit-background-clip:text;background-clip:text;color:transparent}
.tg-card-badge{position:absolute;top:10px;right:10px;z-index:1}
.tg-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;letter-spacing:.07em;border-radius:999px;padding:4px 10px;text-transform:uppercase}
.tg-badge-community{background:rgba(41,182,246,.9);color:#04121c}
.tg-badge-official{background:linear-gradient(92deg,#ffc233,#ff9d2d);color:#231500}
.tg-badge-surface{background:rgba(255,255,255,.1);color:#aeb7c5}
.tg-card-body{display:flex;flex-direction:column;gap:8px;padding:16px 18px 18px;flex:1}
.tg-card-title{display:flex;align-items:center;gap:10px;min-width:0}
.tg-card-title .mdi{font-size:22px;color:var(--uc-blue);flex:none}
.tg-card-title .mdi.official{color:var(--uc-gold)}
.tg-card-title h3{margin:0;padding-top:0;font-size:17px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tg-card-desc{font-size:13.5px;color:var(--uc-dim);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;min-height:2.8em}
.tg-card-meta{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:#7f8a9b}
.tg-card-meta span{display:inline-flex;align-items:center;gap:4px}
.tg-card-meta .mdi{font-size:15px}
.tg-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.tg-surface-tag{font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7f8a9b}
.tg-card-try{font-size:12.5px;font-weight:700;color:var(--uc-blue);display:inline-flex;align-items:center;gap:3px}
.tg-stars{display:inline-flex;gap:1px}
.tg-stars .mdi{font-size:15px;color:rgba(255,255,255,.22)}
.tg-stars .mdi.on{color:var(--uc-gold)}
.tg-stars.interactive .mdi{cursor:pointer;transition:transform .1s}
.tg-stars.interactive .mdi:hover{transform:scale(1.2)}
.tg-stars.mine .mdi.on{color:var(--uc-blue)}
.tg-noresults{text-align:center;color:var(--uc-dim);padding:50px 0}
.tg-noresults .mdi{font-size:42px;opacity:.5;display:block;margin-bottom:10px}
.tg-skel{height:330px;border-radius:var(--uc-r);border:1px solid var(--uc-line);background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.09) 45%,rgba(255,255,255,.04) 90%);background-size:220% 100%;animation:tgShine 1.35s ease-in-out infinite}
@keyframes tgShine{0%{background-position:100% 0}100%{background-position:-100% 0}}
.ucp-btn-sm{padding:8px 14px;font-size:13px;border-radius:10px}
.ucp-btn-sm .mdi{font-size:16px}

/* Modal */
.tg-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px}
.tg-modal[hidden]{display:none!important}
.tg-modal-backdrop{position:absolute;inset:0;background:rgba(5,6,9,.78);backdrop-filter:blur(6px)}
.tg-modal-card{position:relative;width:min(880px,100%);max-height:92vh;overflow:auto;color-scheme:dark;scrollbar-color:rgba(255,255,255,.22) transparent;background:var(--uc-bg2);border:1px solid rgba(255,255,255,.14);border-radius:20px;box-shadow:0 40px 120px rgba(0,0,0,.7);animation:tgModalIn .25s cubic-bezier(.2,.9,.3,1.2)}
.tg-modal-card-sm{width:min(640px,100%)}
@keyframes tgModalIn{from{opacity:0;transform:translateY(22px) scale(.97)}}
.tg-modal-x{position:absolute;top:14px;right:14px;z-index:6;width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;font-size:20px;border:1px solid var(--uc-line);display:inline-flex;align-items:center;justify-content:center}
.tg-modal-pv{position:relative;background:#0a0c10;border-bottom:1px solid var(--uc-line)}
.tg-modal-pv-stage{padding:18px}
.tg-modal-pv-stage .uc-stage{border-radius:12px}
.tg-modal-mode{position:absolute;left:26px;bottom:26px;z-index:3;background:rgba(10,12,16,.82);backdrop-filter:blur(8px)}
.tg-modal-body{padding:26px 30px 30px}
.tg-modal-head{display:flex;align-items:center;gap:16px;margin-bottom:14px}
.tg-modal-icon{font-size:34px;color:var(--uc-blue);background:rgba(41,182,246,.12);border-radius:14px;padding:12px;line-height:1}
.tg-modal-icon.official{color:var(--uc-gold);background:rgba(255,194,51,.12)}
.tg-modal-head h3{font-size:24px;font-weight:800}
.tg-modal-badges{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap}
.tg-modal-badges .tg-badge{font-size:11px;padding:5px 11px}
.tg-modal-desc{color:var(--uc-dim);font-size:15.5px;margin-bottom:14px;white-space:pre-wrap}
.tg-modal-meta{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:#8d97a8;margin-bottom:14px}
.tg-modal-meta span{display:inline-flex;align-items:center;gap:5px}
.tg-modal-tags{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px}
.tg-modal-tags:empty{display:none}
.tg-modal-tags span{font-size:12px;color:#8d97a8;border:1px solid var(--uc-line);border-radius:999px;padding:4px 12px}
.tg-m-rate{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid var(--uc-line);font-size:13.5px;margin-bottom:18px}
.tg-m-rate .tg-stars .mdi{font-size:24px}
.tg-m-rate .ucp-btn{margin-left:auto}
.tg-modal-code-wrap{margin-bottom:18px;border:1px solid var(--uc-line);border-radius:14px;overflow:hidden;background:rgba(0,0,0,.28)}
.tg-modal-code-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--uc-line);font-size:12.5px;font-weight:700;color:var(--uc-dim);text-transform:uppercase;letter-spacing:.04em}
.tg-modal-code-actions{display:flex;gap:6px;flex-wrap:wrap}
.tg-modal-code-hint{margin:0;padding:8px 14px 0;font-size:12.5px;color:var(--uc-dim)}
.ucp .tg-modal-code{margin:0;padding:14px 16px;max-height:220px;overflow:auto;font:12.5px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#e8eef5;background:transparent;border:0;white-space:pre-wrap;word-break:break-word;scrollbar-color:rgba(255,255,255,.22) transparent}
.tg-modal-ctas{display:flex;gap:12px;flex-wrap:wrap}
.tg-steps{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:12px;font-size:14.5px;line-height:1.55;color:var(--uc-txt)}
.tg-steps b{color:#fff}

@media (max-width:900px){
  .tg-controls-end{margin-left:0;width:100%}
  .tg-result-count{margin-left:auto}
}
@media (max-width:600px){
  .tg-grid{grid-template-columns:1fr}
  .tg-stat{min-width:calc(50% - 8px);flex:1 1 calc(50% - 8px)}
  .tg-hero-actions .ucp-btn{flex:1 1 auto}
  .tg-modal{padding:10px}
  .tg-modal-card{max-height:94vh}
  .tg-modal-pv-stage{padding:10px}
  .tg-modal-mode{left:18px;bottom:18px}
  .tg-modal-body{padding:20px}
  .tg-modal-ctas .ucp-btn{flex:1 1 auto}
  .ucp .tg-sort{flex:1}
}
</style>

<script>
(function () {
  var root = document.getElementById('ucp-themes');
  if (!root || !window.UcTheme) return;
  var U = window.UcTheme;
  var API = root.getAttribute('data-api'), NONCE = root.getAttribute('data-nonce'), USER = parseInt(root.getAttribute('data-user') || '0', 10);
  var LOGIN = root.getAttribute('data-login'), BUILDER = root.getAttribute('data-builder');
  var esc = U.esc;

  // Surface vocabulary (src/themes/uc-theme-types.ts: UcThemeSurface). Chips
  // are built from what the catalog actually contains; this is label + icon.
  var SURFACE = {
    flat: ['Flat', 'mdi-square-rounded-outline'],
    glass: ['Glass', 'mdi-blur'],
    glossy: ['Glossy', 'mdi-lightbulb-on-outline'],
    neumorphic: ['Neumorphic', 'mdi-circle-slice-8'],
    outline: ['Outline', 'mdi-vector-square'],
    minimal: ['Minimal', 'mdi-minus']
  };
  var SURFACE_ORDER = Object.keys(SURFACE);
  function surfaceOf(t) { return String((t.definition && t.definition.tokens && t.definition.tokens.surface) || 'flat').toLowerCase(); }
  function surfaceLabel(s) { return SURFACE[s] ? SURFACE[s][0] : s.charAt(0).toUpperCase() + s.slice(1); }
  function surfaceIcon(s) { return SURFACE[s] ? SURFACE[s][1] : 'mdi-palette-outline'; }

  var state = { all: [], q: '', source: 'all', surface: 'all', sort: 'downloads', mode: 'light', open: null };
  var CARD_VERSION = '';
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

  function stars(value, opts) {
    opts = opts || {};
    var v = Math.round(Number(value) || 0);
    var out = '<span class="tg-stars' + (opts.interactive ? ' interactive' : '') + (opts.mine ? ' mine' : '') + '" role="' + (opts.interactive ? 'radiogroup' : 'img') + '" aria-label="' + (v ? v + ' of 5 stars' : 'Not rated') + '">';
    for (var i = 1; i <= 5; i++) out += '<i class="mdi mdi-star' + (i <= v ? ' on' : '') + '" data-star="' + i + '"' + (opts.interactive ? ' role="radio" tabindex="0" aria-checked="' + (i === v) + '"' : '') + '></i>';
    return out + '</span>';
  }
  function ratingText(t) { return t.rating_count ? Number(t.rating).toFixed(1) + ' (' + t.rating_count + ')' : ''; }
  function ratingTitle(t) { return t.rating_count ? Number(t.rating).toFixed(1) + ' from ' + t.rating_count + ' rating' + (t.rating_count === 1 ? '' : 's') : 'Not rated yet'; }
  function num(n) { n = Number(n) || 0; return n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'k' : String(n); }

  // ---------------------------------------------------------------- filters
  function isBuiltin(t) { return t.source === 'builtin'; }
  function isDefault(t) { return t.source === 'builtin' || t.source === 'official'; }
  function matches(t) {
    if (state.source === 'official' && !isDefault(t)) return false;
    if (state.source === 'community' && t.source !== 'community') return false;
    if (state.surface !== 'all' && surfaceOf(t) !== state.surface) return false;
    if (!state.q) return true;
    return [t.name, t.author, t.description, surfaceOf(t)].concat(t.tags || []).join(' ').toLowerCase().indexOf(state.q) >= 0;
  }
  function filtered() {
    var list = state.all.filter(matches);
    list.sort(function (a, b) {
      // Built-ins have no downloads or ratings; they lead like in the Hub.
      if (isBuiltin(a) !== isBuiltin(b)) return isBuiltin(a) ? -1 : 1;
      if (isBuiltin(a)) return String(a.order).localeCompare(String(b.order), undefined, { numeric: true });
      if (state.sort === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (state.sort === 'rating') return ((b.rating || 0) - (a.rating || 0)) || ((b.rating_count || 0) - (a.rating_count || 0));
      if (state.sort === 'title') return String(a.name).localeCompare(String(b.name));
      return String(b.date).localeCompare(String(a.date));
    });
    return list;
  }

  function renderChips() {
    var host = document.getElementById('tg-chips');
    var present = {};
    state.all.forEach(function (t) { present[surfaceOf(t)] = (present[surfaceOf(t)] || 0) + 1; });
    var keys = Object.keys(present).sort(function (a, b) {
      var ia = SURFACE_ORDER.indexOf(a), ib = SURFACE_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
    });
    if (state.surface !== 'all' && !present[state.surface]) state.surface = 'all';
    host.innerHTML = '<button type="button" class="tg-chip' + (state.surface === 'all' ? ' active' : '') + '" data-surface="all">All surfaces</button>' +
      keys.map(function (k) {
        return '<button type="button" class="tg-chip' + (state.surface === k ? ' active' : '') + '" data-surface="' + esc(k) + '"><i class="mdi ' + surfaceIcon(k) + '"></i> ' + esc(surfaceLabel(k)) + '</button>';
      }).join('');
  }

  function renderStats() {
    var official = 0, downloads = 0;
    state.all.forEach(function (t) { if (isDefault(t)) official++; downloads += Number(t.downloads) || 0; });
    root.querySelector('[data-stat="total"]').textContent = String(state.all.length);
    root.querySelector('[data-stat="community"]').textContent = String(state.all.length - official);
    root.querySelector('[data-stat="official"]').textContent = String(official);
    root.querySelector('[data-stat="downloads"]').textContent = num(downloads);
  }

  // ------------------------------------------------------------------- grid
  function badge(t) {
    if (isBuiltin(t)) return '<span class="tg-badge tg-badge-official"><i class="mdi mdi-package-variant-closed"></i> Built in</span>';
    return t.source === 'official'
      ? '<span class="tg-badge tg-badge-official"><i class="mdi mdi-shield-check"></i> Default</span>'
      : '<span class="tg-badge tg-badge-community">Community</span>';
  }
  function preview(t) {
    if (t.preview) return '<img src="' + esc(t.preview) + '" alt="" loading="lazy">';
    if (t.definition) return U.swatchHtml(t.definition, state.mode);
    return '<div class="tg-pv-ph"><i class="mdi ' + surfaceIcon(surfaceOf(t)) + '"></i><span>' + esc(surfaceLabel(surfaceOf(t))) + '</span></div>';
  }
  function card(t) {
    var official = isDefault(t), s = surfaceOf(t);
    var meta = '';
    if (t.author) meta += '<span><i class="mdi mdi-account-outline"></i> ' + esc(t.author) + '</span>';
    if (isBuiltin(t)) meta += '<span title="Installed with Ultra Card, no download needed"><i class="mdi mdi-check-circle-outline"></i> Ships with Ultra Card</span>';
    else {
      meta += '<span title="Downloads"><i class="mdi mdi-download-outline"></i> ' + esc(num(t.downloads)) + '</span>';
      if (t.rating_count) meta += '<span title="' + esc(ratingTitle(t)) + '">' + stars(t.rating) + ' ' + esc(ratingText(t)) + '</span>';
    }
    return '<article class="tg-card" id="theme-' + esc(t.id) + '" tabindex="0" role="button" data-id="' + esc(t.id) + '">' +
      '<div class="tg-pv">' + preview(t) + '<div class="tg-card-badge">' + badge(t) + '</div></div>' +
      '<div class="tg-card-body">' +
        '<div class="tg-card-title"><i class="mdi ' + (official ? 'mdi-shield-check official' : 'mdi-palette-swatch-outline') + '"></i><h3>' + esc(t.name) + '</h3></div>' +
        '<p class="tg-card-desc">' + esc(t.description || '') + '</p>' +
        '<div class="tg-card-meta">' + meta + '</div>' +
        '<div class="tg-card-foot"><span class="tg-surface-tag">' + esc(surfaceLabel(s)) + '</span><span class="tg-card-try">Read more <i class="mdi mdi-arrow-right"></i></span></div>' +
      '</div></article>';
  }
  function render() {
    var list = filtered();
    grid.innerHTML = list.map(card).join('');
    document.getElementById('tg-count').textContent = list.length + ' theme' + (list.length === 1 ? '' : 's');
    var none = document.getElementById('tg-noresults');
    none.hidden = list.length > 0;
    document.getElementById('tg-noresults-text').textContent = state.all.length ? 'No themes match.' : 'No themes have been published yet. Be the first: build one and submit it for review.';
  }

  function byId(id) { return state.all.find(function (t) { return String(t.id) === String(id); }); }
  function track(t) {
    if (isBuiltin(t)) return;
    api('/themes/' + t.id + '/track-download', { method: 'POST' }).then(function (r) {
      if (r && typeof r.downloads === 'number') { t.downloads = r.downloads; render(); if (state.open === t) renderMeta(t); renderStats(); }
    }).catch(function () {});
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
  function themeJson(t) { return JSON.stringify(t.definition || {}, null, 2); }
  function flash(btn, html) {
    if (!btn) return;
    var was = btn.innerHTML; btn.innerHTML = html; setTimeout(function () { btn.innerHTML = was; }, 1500);
  }
  function copyJson(t, btn) {
    full(t).then(function () {
      var json = themeJson(t);
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(json);
      var ta = document.createElement('textarea'); ta.value = json; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }).then(function () {
      flash(btn, '<i class="mdi mdi-check"></i> Copied');
      track(t);
    }).catch(function () { alert('Copy failed. Use Download instead.'); });
  }
  function downloadJson(t, btn) {
    full(t).then(function () {
      var blob = new Blob([themeJson(t)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = U.slugify(t.name) + '.ultratheme.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      flash(btn, '<i class="mdi mdi-check"></i> Downloaded');
      track(t);
    }).catch(function (e) { alert(e.message || 'Download failed'); });
  }

  // ------------------------------------------------------------------ modal
  var modal = document.getElementById('tg-modal'), howto = document.getElementById('tg-howto');
  var modalOpenedAt = 0;
  function paintPreview(t) {
    U.renderPreview(document.getElementById('tg-m-preview'), t.definition || { tokens: { surface: 'flat', radius: 12 } }, { mode: state.mode, width: null });
  }
  function renderMeta(t) {
    var meta = '';
    if (t.author) meta += '<span><i class="mdi mdi-account-outline"></i> ' + esc(t.author) + '</span>';
    if (isBuiltin(t)) meta += '<span><i class="mdi mdi-check-circle-outline"></i> Ships with Ultra Card' + (CARD_VERSION ? ' ' + esc(CARD_VERSION) : '') + '</span>';
    else {
      meta += '<span><i class="mdi mdi-download-outline"></i> ' + esc(num(t.downloads)) + ' download' + (Number(t.downloads) === 1 ? '' : 's') + '</span>';
      meta += '<span title="' + esc(ratingTitle(t)) + '">' + stars(t.rating) + (t.rating_count ? ' ' + esc(ratingText(t)) : ' Not rated yet') + '</span>';
      meta += '<span><i class="mdi mdi-tag-outline"></i> v' + esc(t.version || 1) + '</span>';
    }
    document.getElementById('tg-m-meta').innerHTML = meta;
  }
  function syncModeButtons() {
    document.querySelectorAll('#tg-mode .ucp-seg-btn, #tg-m-mode .ucp-seg-btn').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-mode') === state.mode); });
  }
  function openModal(t) {
    state.open = t; modalOpenedAt = Date.now();
    var official = isDefault(t), s = surfaceOf(t);
    document.getElementById('tg-m-title').textContent = t.name || 'Theme';
    document.getElementById('tg-m-icon').className = 'tg-modal-icon mdi ' + (official ? 'mdi-shield-check official' : 'mdi-palette-swatch-outline');
    document.getElementById('tg-m-badges').innerHTML = badge(t) + '<span class="tg-badge tg-badge-surface"><i class="mdi ' + surfaceIcon(s) + '"></i> ' + esc(surfaceLabel(s)) + '</span>';
    document.getElementById('tg-m-desc').textContent = t.description || 'No description provided.';
    document.getElementById('tg-m-remix').innerHTML = '<i class="mdi mdi-source-fork"></i> ' + (isBuiltin(t) ? 'Open in builder' : 'Remix in builder');
    document.querySelector('#tg-m-code-wrap .tg-modal-code-hint').textContent = isBuiltin(t)
      ? 'Already in Home Assistant: Ultra Card Hub › Themes › Default themes. The JSON is here if you want to study it or start your own from it.'
      : 'Paste into Home Assistant: Ultra Card Hub › Themes › Import. Or press Install on this theme in the Hub, it is listed there too.';
    renderMeta(t);
    document.getElementById('tg-m-tags').innerHTML = (t.tags || []).filter(Boolean).slice(0, 12).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    renderRate(t);
    syncModeButtons();
    paintPreview(t);
    var code = document.getElementById('tg-m-code');
    code.textContent = t.definition_partial ? 'Loading…' : themeJson(t);
    full(t).then(function () {
      if (state.open !== t) return;
      code.textContent = themeJson(t);
      if (t.definition_partial === false) paintPreview(t);
    }).catch(function () { if (state.open === t) code.textContent = themeJson(t); });
    modal.hidden = false; document.documentElement.style.overflow = 'hidden';
    if (history.replaceState) history.replaceState(null, '', '#theme-' + t.id);
  }
  function closeModals() {
    var wasOpen = !modal.hidden;
    modal.hidden = true; howto.hidden = true; document.documentElement.style.overflow = ''; state.open = null;
    if (wasOpen && history.replaceState && /^#theme-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  function renderRate(t) {
    var box = document.getElementById('tg-m-rate');
    if (isBuiltin(t)) { box.innerHTML = '<span class="ucp-hint"><i class="mdi mdi-package-variant-closed"></i> Built-in theme. It ships with every Ultra Card install and is not rated; ratings and download counts apply to community and official catalog themes.</span>'; return; }
    if (!USER) { box.innerHTML = '<span>Rate this theme</span>' + stars(0) + '<a class="ucp-btn ucp-btn-ghost ucp-btn-sm" href="' + esc(LOGIN) + '">Sign in to rate</a>'; return; }
    if (t.author_id === USER) { box.innerHTML = '<span class="ucp-hint">This is your theme. Ratings come from other members.</span>'; return; }
    var mine = t.my_rating || 0;
    box.innerHTML = '<span>' + (mine ? 'Your rating' : 'Rate this theme') + '</span>' + stars(mine, { interactive: true, mine: !!mine }) + (mine ? '<button type="button" class="ucp-btn ucp-btn-ghost ucp-btn-sm" data-unrate>Remove</button>' : '');
    box.querySelectorAll('[data-star]').forEach(function (s) {
      var go = function () { rate(t, parseInt(s.getAttribute('data-star'), 10)); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    var un = box.querySelector('[data-unrate]');
    if (un) un.addEventListener('click', function () { rate(t, 0); });
  }
  function rate(t, value) {
    var req = value
      ? api('/themes/' + t.id + '/rate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: value }) })
      : api('/themes/' + t.id + '/rate', { method: 'DELETE' });
    req.then(function (r) {
      t.rating = r.rating; t.rating_count = r.rating_count; t.my_rating = r.my_rating || 0;
      renderRate(t); render();
      if (state.open === t) renderMeta(t);
    }).catch(function (e) { alert(e.message || 'Could not save rating'); });
  }

  // ------------------------------------------------------------------- wire
  grid.addEventListener('click', function (e) {
    var el = e.target.closest('.tg-card'); if (!el) return;
    var t = byId(el.getAttribute('data-id')); if (t) openModal(t);
  });
  grid.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest('.tg-card'); if (!el) return;
    e.preventDefault();
    var t = byId(el.getAttribute('data-id')); if (t) openModal(t);
  });
  [modal, howto].forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (Date.now() - modalOpenedAt < 350) return;
      if (e.target.closest('[data-close]')) closeModals();
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModals(); });
  document.getElementById('tg-how').addEventListener('click', function () { modalOpenedAt = Date.now(); howto.hidden = false; document.documentElement.style.overflow = 'hidden'; });
  document.getElementById('tg-m-copy').addEventListener('click', function () { if (state.open) copyJson(state.open, this); });
  document.getElementById('tg-m-copy-sm').addEventListener('click', function () { if (state.open) copyJson(state.open, this); });
  document.getElementById('tg-m-download').addEventListener('click', function () { if (state.open) downloadJson(state.open, this); });
  document.getElementById('tg-m-download-sm').addEventListener('click', function () { if (state.open) downloadJson(state.open, this); });
  document.getElementById('tg-m-remix').addEventListener('click', function () {
    var t = state.open; if (!t) return;
    if (!isBuiltin(t)) { location.href = BUILDER + '?fork=' + encodeURIComponent(t.id); return; }
    // Built-ins are not posts, so there is nothing to ?fork=; hand the
    // definition over through sessionStorage and let the builder import it.
    try { sessionStorage.setItem('uc_theme_builder_import', JSON.stringify({ definition: t.definition, name: t.name, author: t.author })); } catch (e) {}
    location.href = BUILDER + '?import=session';
  });

  var search = document.getElementById('tg-search'), clear = document.getElementById('tg-search-clear');
  search.addEventListener('input', function () { state.q = (search.value || '').trim().toLowerCase(); clear.hidden = !state.q; render(); });
  clear.addEventListener('click', function () { search.value = ''; state.q = ''; clear.hidden = true; render(); search.focus(); });
  document.getElementById('tg-sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
  root.querySelectorAll('#tg-source .ucp-seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      state.source = b.getAttribute('data-source') || 'all';
      root.querySelectorAll('#tg-source .ucp-seg-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
      render();
    });
  });
  document.getElementById('tg-chips').addEventListener('click', function (e) {
    var chip = e.target.closest('.tg-chip'); if (!chip) return;
    state.surface = chip.getAttribute('data-surface') || 'all';
    root.querySelectorAll('.tg-chip').forEach(function (x) { x.classList.toggle('active', x === chip); });
    render();
  });
  root.querySelectorAll('#tg-mode .ucp-seg-btn, #tg-m-mode .ucp-seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      state.mode = b.getAttribute('data-mode') === 'dark' ? 'dark' : 'light';
      syncModeButtons(); render();
      if (state.open) paintPreview(state.open);
    });
  });

  async function boot() {
    grid.innerHTML = '<div class="tg-skel"></div><div class="tg-skel"></div><div class="tg-skel"></div>';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { state.mode = 'dark'; syncModeButtons(); }
    try {
      var builtinReq = api('/themes/builtin').catch(function () { return null; });
      var all = [], page = 1, pages = 1;
      do {
        var r = await api('/themes?per_page=100&orderby=downloads&page=' + page);
        all = all.concat(r.themes || []); pages = r.total_pages || 1; page++;
      } while (page <= pages && page <= 5);
      var b = await builtinReq;
      if (b && Array.isArray(b.themes)) {
        CARD_VERSION = b.card_version ? 'v' + b.card_version : '';
        b.themes.forEach(function (t, i) {
          t.source = 'builtin'; t.order = i; t.downloads = 0; t.rating = 0; t.rating_count = 0; t.definition_partial = false;
          t.tags = (t.tags || []).length ? t.tags : [surfaceOf(t)];
        });
        all = b.themes.concat(all);
      }
      state.all = all;
      renderStats(); renderChips(); render();
      var hash = /^#theme-([\w-]+)$/.exec(location.hash || '');
      if (hash) { var t = byId(hash[1]); if (t) openModal(t); }
    } catch (e) {
      grid.innerHTML = '';
      var none = document.getElementById('tg-noresults');
      none.hidden = false;
      document.getElementById('tg-noresults-text').textContent = e.message || 'Could not load themes.';
    }
  }
  boot();
})();
</script>
<?php
get_footer();
