<?php
/**
 * Archive: Ultra Presets gallery — styled to match ultracard.io/modules/
 *
 * @package UltraCardIntegration
 */

if (!defined('ABSPATH')) {
    exit;
}

// Show a large set on one page (client-side filter handles the rest).
global $wp_query;
$presets_query = new WP_Query(array(
    'post_type'      => 'ultra_preset',
    'post_status'    => 'publish',
    'posts_per_page' => 200,
    'orderby'        => 'date',
    'order'          => 'DESC',
));

$items = array();
$module_cats = function_exists('uc_preset_module_categories') ? uc_preset_module_categories() : array(
    array('value' => 'layout', 'label' => 'Layout', 'icon' => 'mdi-view-dashboard-outline'),
    array('value' => 'content', 'label' => 'Content', 'icon' => 'mdi-text-box-outline'),
    array('value' => 'data', 'label' => 'Data', 'icon' => 'mdi-chart-box-outline'),
    array('value' => 'interactive', 'label' => 'Controls', 'icon' => 'mdi-gesture-tap'),
    array('value' => 'input', 'label' => 'Inputs', 'icon' => 'mdi-form-textbox'),
    array('value' => 'media', 'label' => 'Media', 'icon' => 'mdi-image-multiple-outline'),
);
$cat_counts = array();
foreach ($module_cats as $mc) {
    $cat_counts[$mc['value']] = 0;
}
$official_count = 0;
$community_count = 0;

while ($presets_query->have_posts()) {
    $presets_query->the_post();
    $norm = function_exists('uc_normalize_preset') ? uc_normalize_preset(get_post(), false) : null;
    if (!$norm) {
        continue;
    }
    // Don't ship shortcode into the public HTML dump — detail page / copy handles that.
    unset($norm['shortcode'], $norm['pending_revision']);
    $items[] = $norm;
    $cat = strtolower($norm['category'] ?? '');
    if (isset($cat_counts[$cat])) {
        $cat_counts[$cat]++;
    }
    if (($norm['source'] ?? '') === 'official') {
        $official_count++;
    } else {
        $community_count++;
    }
}
wp_reset_postdata();

$total = count($items);
$cat_total = count(array_filter($cat_counts));

get_header();
?>
<style>
/* Neutralize Impreza chrome on the presets archive */
.l-section.wpb_row{padding-top:0!important;padding-bottom:0!important}
.l-main{background:#0e1015!important}
.l-canvas,.l-main .l-section,.l-main .l-section-h{background:transparent!important}
.post_navigation,.l-section.height_small{display:none!important}
/* Clear fixed/sticky site header (+ WP admin bar when present) */
.ucp{
  --ucp-header-offset: 96px;
}
body.admin-bar .ucp{ --ucp-header-offset: 128px; }
@media (max-width: 782px){
  body.admin-bar .ucp{ --ucp-header-offset: 142px; }
}
</style>

<div class="ucp" id="ucp">
  <header class="ucp-hero">
    <div class="ucp-hero-glow" aria-hidden="true"></div>
    <div class="ucp-wrap">
      <h1 class="ucp-h1">Community layouts.<br><span class="ucp-grad-text">Ready to copy.</span></h1>
      <p class="ucp-sub">Browse <b><?php echo (int) $total; ?></b> Ultra Card presets from the community and the Ultra Card team.
        Open any card to preview details, then copy it straight into Home Assistant.</p>

      <div class="ucp-search-hero">
        <i class="mdi mdi-magnify" aria-hidden="true"></i>
        <input type="search" id="ucp-search" placeholder="Search presets: climate, battery, camera&hellip;" aria-label="Search presets" autocomplete="off">
        <button type="button" class="ucp-search-clear" id="ucp-search-clear" aria-label="Clear search" hidden><i class="mdi mdi-close"></i></button>
      </div>

      <div class="ucp-stats">
        <div class="ucp-stat"><b id="ucp-stat-total"><?php echo (int) $total; ?></b><span>Presets</span></div>
        <div class="ucp-stat"><b><?php echo (int) $community_count; ?></b><span>Community</span></div>
        <div class="ucp-stat ucp-stat-official"><b><?php echo (int) $official_count; ?></b><span>Official</span></div>
        <div class="ucp-stat"><b><?php echo (int) $cat_total; ?></b><span>Categories</span></div>
      </div>

      <div class="ucp-hero-ctas">
        <a class="ucp-btn ucp-btn-ghost" href="https://github.com/WJDDesigns/Ultra-Card" target="_blank" rel="noopener"><i class="mdi mdi-github"></i> Get Ultra Card free</a>
        <a class="ucp-btn ucp-btn-pro" href="https://ultracard.io/product/ultra-card-pro/"><i class="mdi mdi-star"></i> Get Ultra Card PRO</a>
      </div>
    </div>
  </header>

  <nav class="ucp-controls" id="ucp-controls" aria-label="Preset filters">
    <div class="ucp-wrap ucp-controls-in">
      <div class="ucp-seg" role="tablist" aria-label="Source">
        <button type="button" class="ucp-seg-btn active" data-source="all" role="tab">All</button>
        <button type="button" class="ucp-seg-btn" data-source="community" role="tab">Community</button>
        <button type="button" class="ucp-seg-btn" data-source="official" role="tab"><i class="mdi mdi-shield-check"></i> Official</button>
      </div>
      <div class="ucp-chips" id="ucp-chips">
        <button type="button" class="ucp-chip active" data-cat="all">All categories</button>
        <?php foreach ($module_cats as $mc) :
            $slug = $mc['value'];
            $icon = isset($mc['icon']) ? $mc['icon'] : 'mdi-palette-outline';
            if (strpos($icon, 'mdi:') === 0) {
                $icon = 'mdi-' . substr($icon, 4);
            }
            ?>
        <button type="button" class="ucp-chip" data-cat="<?php echo esc_attr($slug); ?>"><i class="mdi <?php echo esc_attr($icon); ?>"></i> <?php echo esc_html($mc['label']); ?> <span class="ucp-chip-n"><?php echo (int) ($cat_counts[$slug] ?? 0); ?></span></button>
        <?php endforeach; ?>
      </div>
      <div class="ucp-result-count" id="ucp-count"><?php echo (int) $total; ?> presets</div>
    </div>
  </nav>

  <section class="ucp-section">
    <div class="ucp-wrap">
      <div class="ucp-grid" id="ucp-grid"></div>
      <div class="ucp-noresults" id="ucp-noresults" hidden>
        <i class="mdi mdi-magnify-remove-outline"></i>
        <p>No presets match. Try another search, or share your own from the Ultra Card Hub.</p>
      </div>
    </div>
  </section>

  <div class="ucp-modal" id="ucp-modal" hidden>
    <div class="ucp-modal-backdrop" data-close></div>
    <div class="ucp-modal-card" role="dialog" aria-modal="true" aria-labelledby="ucp-modal-title">
      <button type="button" class="ucp-modal-x" data-close aria-label="Close"><i class="mdi mdi-close"></i></button>
      <div class="ucp-modal-pv" id="ucp-modal-pv"></div>
      <div class="ucp-modal-body">
        <div class="ucp-modal-head">
          <i class="ucp-modal-icon mdi" id="ucp-modal-icon"></i>
          <div>
            <h3 id="ucp-modal-title"></h3>
            <div class="ucp-modal-badges" id="ucp-modal-badges"></div>
          </div>
        </div>
        <p class="ucp-modal-desc" id="ucp-modal-desc"></p>
        <div class="ucp-modal-meta" id="ucp-modal-meta"></div>
        <div class="ucp-modal-tags" id="ucp-modal-tags"></div>
        <div class="ucp-modal-vote" id="ucp-modal-vote"></div>
        <div class="ucp-modal-code-wrap" id="ucp-modal-code-wrap" hidden>
          <div class="ucp-modal-code-head">
            <span>Ultra Card shortcode</span>
            <div class="ucp-modal-code-actions">
              <button type="button" class="ucp-btn ucp-btn-ghost ucp-btn-sm" id="ucp-modal-copy"><i class="mdi mdi-content-copy"></i> <span>Copy</span></button>
              <button type="button" class="ucp-btn ucp-btn-ghost ucp-btn-sm" id="ucp-modal-download"><i class="mdi mdi-download"></i> <span>Download</span></button>
            </div>
          </div>
          <p class="ucp-modal-code-hint">Paste into Ultra Card in Home Assistant (Import / paste shortcode).</p>
          <pre class="ucp-modal-code" id="ucp-modal-code"></pre>
        </div>
        <div class="ucp-modal-ctas" id="ucp-modal-ctas"></div>
      </div>
    </div>
  </div>

  <section class="ucp-bottom-cta">
    <div class="ucp-wrap">
      <h2>Share a layout with the community.</h2>
      <p>Build in Home Assistant, then submit from the Ultra Card Hub. Approved presets land here for everyone.</p>
      <div class="ucp-hero-ctas">
        <a class="ucp-btn ucp-btn-ghost" href="https://github.com/WJDDesigns/Ultra-Card" target="_blank" rel="noopener"><i class="mdi mdi-github"></i> Install free via HACS</a>
        <a class="ucp-btn ucp-btn-blue" href="https://ultracard.io/docs/"><i class="mdi mdi-book-open-page-variant"></i> Read the docs</a>
      </div>
    </div>
  </section>
</div>

<script type="application/json" id="ucp-data"><?php echo wp_json_encode(array_values($items), JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS); ?></script>

<style id="ucp-css">
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css");

.ucp{--uc-blue:#29b6f6;--uc-purple:#8017A2;--uc-pink:#ff2d78;--uc-gold:#ffc233;
  --uc-bg:#0e1015;--uc-bg2:#14171d;--uc-card:#1a1e26;--uc-line:rgba(255,255,255,.09);
  --uc-txt:#eef1f6;--uc-dim:#9aa3b2;--uc-r:14px;
  background:var(--uc-bg);color:var(--uc-txt);font-family:'Open Sans',system-ui,sans-serif;
  line-height:1.55;overflow-x:clip;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)}
.ucp *,.ucp *::before,.ucp *::after{box-sizing:border-box}
.ucp .ucp-wrap{max-width:1240px;margin:0 auto;padding:0 24px}
.ucp h1,.ucp h2,.ucp h3{margin:0;color:#fff;line-height:1.15}
.ucp p{margin:0}
.ucp a{text-decoration:none;color:inherit}
.ucp button{font-family:inherit;cursor:pointer;border:0;background:none;color:inherit}
.ucp input{font-family:inherit}
.ucp b{color:#fff}
.ucp .mdi{line-height:1;vertical-align:middle}

.ucp-hero{position:relative;padding:calc(var(--ucp-header-offset, 96px) + 48px) 0 56px;text-align:center;overflow:hidden}
.ucp-hero-glow{position:absolute;inset:-40% -20% auto;height:130%;pointer-events:none;
  background:radial-gradient(45% 60% at 30% 20%,rgba(41,182,246,.28),transparent 70%),
             radial-gradient(45% 60% at 72% 15%,rgba(128,23,162,.38),transparent 70%),
             radial-gradient(30% 40% at 55% 45%,rgba(255,45,120,.12),transparent 70%)}
.ucp-h1{position:relative;font-size:clamp(38px,6vw,68px);font-weight:800;margin:0 0 16px;letter-spacing:-.02em}
.ucp-grad-text{background:linear-gradient(92deg,var(--uc-blue),#b44ce0 55%,var(--uc-pink));-webkit-background-clip:text;background-clip:text;color:transparent}
/* Scoped like .ucp-wrap: the .ucp p reset above is more specific than a bare
   .ucp-sub, so unscoped auto margins lose and the block hugs the left edge. */
.ucp .ucp-sub{position:relative;max-width:660px;margin:0 auto;color:var(--uc-dim);font-size:17px;text-align:center!important}
.ucp-search-hero{position:relative;display:flex;align-items:center;max-width:620px;margin:30px auto 0;
  background:var(--uc-card);border:1px solid var(--uc-line);border-radius:999px;padding:4px 8px 4px 20px;
  box-shadow:0 12px 40px rgba(0,0,0,.45);transition:border-color .2s}
.ucp-search-hero:focus-within{border-color:var(--uc-blue)}
.ucp-search-hero .mdi-magnify{font-size:22px;color:var(--uc-dim)}
.ucp-search-hero input{flex:1;background:none;border:0;outline:0;color:#fff;font-size:16px;padding:13px 12px}
.ucp-search-hero input::placeholder{color:#5f6877}
.ucp-search-clear{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;font-size:17px}
.ucp-stats{position:relative;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:32px}
.ucp-stat{min-width:118px;padding:14px 20px;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:rgba(255,255,255,.03)}
.ucp-stat b{display:block;font-size:26px;font-weight:800}
.ucp-stat span{font-size:12.5px;color:var(--uc-dim);text-transform:uppercase;letter-spacing:.05em}
.ucp-stat-official{border-color:rgba(41,182,246,.35);background:linear-gradient(180deg,rgba(41,182,246,.08),rgba(41,182,246,.02))}
.ucp-stat-official b{color:#6fd4ff}
.ucp-hero-ctas{position:relative;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:30px}

.ucp-btn{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15.5px;border-radius:12px;
  padding:13px 26px;transition:transform .15s,box-shadow .15s,background .15s;color:#fff}
.ucp-btn:hover{transform:translateY(-2px);color:#fff}
.ucp-btn .mdi{font-size:19px}
.ucp-btn-ghost{border:1.5px solid rgba(255,255,255,.28);background:rgba(255,255,255,.05)}
.ucp-btn-ghost:hover{background:rgba(255,255,255,.1)}
.ucp-btn-pro{background:linear-gradient(92deg,#ff2d78,#c2258f);box-shadow:0 8px 26px rgba(255,45,120,.35)}
.ucp-btn-pro:hover{box-shadow:0 12px 34px rgba(255,45,120,.5)}
.ucp-btn-blue{background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));box-shadow:0 8px 26px rgba(41,182,246,.3)}

.ucp-controls{position:relative;z-index:1;background:transparent;backdrop-filter:none;
  border-block:0;padding:12px 0 4px}
.ucp-controls-in{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.ucp-seg{display:flex;background:var(--uc-card);border:1px solid var(--uc-line);border-radius:999px;padding:4px}
.ucp-seg-btn{padding:8px 20px;border-radius:999px;font-weight:700;font-size:14px;color:var(--uc-dim);display:flex;align-items:center;gap:6px}
.ucp-seg-btn.active{background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));color:#fff}
.ucp-chips{display:flex;gap:8px;flex-wrap:wrap;flex:1}
.ucp-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:999px;font-size:13.5px;font-weight:600;
  color:var(--uc-dim);border:1px solid var(--uc-line);background:rgba(255,255,255,.03);transition:all .15s}
.ucp-chip:hover{color:#fff;border-color:rgba(255,255,255,.3)}
.ucp-chip.active{color:#fff;border-color:var(--uc-blue);background:rgba(41,182,246,.14)}
.ucp-chip .mdi{font-size:16px}
.ucp-chip-n{opacity:.65;font-size:12px}
.ucp-result-count{font-size:13px;color:var(--uc-dim);white-space:nowrap}

.ucp-section{padding:48px 0 30px}
.ucp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:20px}
.ucp-card{position:relative;display:flex;flex-direction:column;background:var(--uc-card);border:1px solid var(--uc-line);
  border-radius:var(--uc-r);overflow:hidden;transition:transform .18s,border-color .18s,box-shadow .18s;color:inherit}
.ucp-card:hover{transform:translateY(-4px);border-color:rgba(41,182,246,.55);box-shadow:0 18px 44px rgba(0,0,0,.5);color:#fff}
.ucp-card-official:hover{border-color:rgba(255,194,51,.55)}
.ucp-pv{position:relative;height:190px;background:#101318;border-bottom:1px solid var(--uc-line);overflow:hidden;
  display:flex;align-items:center;justify-content:center}
.ucp-pv img{width:100%;height:100%;object-fit:cover;display:block}
.ucp-pv-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#5f6877;padding:20px;text-align:center}
.ucp-pv-ph .mdi{font-size:42px;background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));-webkit-background-clip:text;background-clip:text;color:transparent}
.ucp-pv-ph span{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.ucp-card-badge{position:absolute;top:10px;right:10px;z-index:5}
.ucp-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;letter-spacing:.07em;
  border-radius:999px;padding:4px 10px;text-transform:uppercase}
.ucp-badge-community{background:rgba(41,182,246,.9);color:#04121c}
.ucp-badge-official{background:linear-gradient(92deg,#ffc233,#ff9d2d);color:#231500}
.ucp-card-body{display:flex;flex-direction:column;gap:8px;padding:16px 18px 18px;flex:1}
.ucp-card-title{display:flex;align-items:center;gap:10px}
.ucp-card-title .mdi{font-size:22px;color:var(--uc-blue);flex-shrink:0;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center}
.ucp-card-official .ucp-card-title .mdi{color:var(--uc-gold)}
.ucp-card-title h3{margin:0;font-size:17px;font-weight:700;line-height:1.25}
.ucp-card-desc{font-size:13.5px;color:var(--uc-dim);flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ucp-card-meta{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:#7f8a9b}
.ucp-card-meta span{display:inline-flex;align-items:center;gap:4px}
.ucp-card-meta .mdi{font-size:14px}
.ucp-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.ucp-cat-tag{font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7f8a9b}
.ucp-card-try{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:var(--uc-blue)}
.ucp-card-official .ucp-card-try{color:var(--uc-gold)}
.ucp-card{cursor:pointer;text-align:left;width:100%}

/* Detail modal — matches /modules/ popup pattern */
.ucp-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px}
.ucp-modal[hidden]{display:none!important}
.ucp-modal-backdrop{position:absolute;inset:0;background:rgba(5,6,9,.78);backdrop-filter:blur(6px)}
.ucp-modal-card{position:relative;width:min(880px,100%);max-height:92vh;overflow:auto;background:var(--uc-bg2);
  border:1px solid rgba(255,255,255,.14);border-radius:20px;box-shadow:0 40px 120px rgba(0,0,0,.7);
  animation:ucpModalIn .25s cubic-bezier(.2,.9,.3,1.2)}
@keyframes ucpModalIn{from{opacity:0;transform:translateY(22px) scale(.97)}}
.ucp-modal-x{position:absolute;top:14px;right:14px;z-index:6;width:40px;height:40px;border-radius:50%;
  background:rgba(0,0,0,.5);color:#fff;font-size:20px;border:1px solid var(--uc-line)}
.ucp-modal-pv{position:relative;min-height:180px;height:auto;max-height:min(62vh,640px);background:#0a0c10;border-bottom:1px solid var(--uc-line);
  display:flex;align-items:center;justify-content:center;overflow:hidden}
.ucp-modal-pv img{width:auto;height:auto;max-width:100%;max-height:min(62vh,640px);object-fit:contain;object-position:center;display:block}
.ucp-modal-pv-ph{display:flex;flex-direction:column;align-items:center;gap:12px;color:#5f6877}
.ucp-modal-pv-ph .mdi{font-size:64px;background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));-webkit-background-clip:text;background-clip:text;color:transparent}
.ucp-modal-gallery{position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:6px;z-index:2;padding:0 16px;flex-wrap:wrap}
.ucp-modal-gallery button{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.35);border:0;padding:0}
.ucp-modal-gallery button.active{background:#fff;transform:scale(1.15)}
.ucp-modal-body{padding:26px 30px 30px}
.ucp-modal-head{display:flex;align-items:center;gap:16px;margin-bottom:14px}
.ucp-modal-icon{font-size:34px;color:var(--uc-blue);background:rgba(41,182,246,.12);border-radius:14px;padding:12px;line-height:1}
.ucp-modal-icon.official{color:var(--uc-gold);background:rgba(255,194,51,.12)}
.ucp-modal-head h3{font-size:24px;font-weight:800}
.ucp-modal-badges{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap}
.ucp-modal-badges .ucp-badge{font-size:11px;padding:5px 11px}
.ucp-modal-badges .ucp-badge-cat{background:rgba(255,255,255,.1);color:#aeb7c5}
.ucp-modal-desc{color:var(--uc-dim);font-size:15.5px;margin-bottom:14px;white-space:pre-wrap}
.ucp-modal-meta{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:#8d97a8;margin-bottom:14px}
.ucp-modal-meta span{display:inline-flex;align-items:center;gap:5px}
.ucp-modal-tags{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px}
.ucp-modal-tags span{font-size:12px;color:#8d97a8;border:1px solid var(--uc-line);border-radius:999px;padding:4px 12px}
.ucp-modal-vote:not(:empty){margin-bottom:18px}
.ucp-modal-code-wrap{margin-bottom:18px;border:1px solid var(--uc-line);border-radius:14px;overflow:hidden;background:rgba(0,0,0,.28)}
.ucp-modal-code-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--uc-line);font-size:12.5px;font-weight:700;color:var(--uc-dim);text-transform:uppercase;letter-spacing:.04em}
.ucp-modal-code-actions{display:flex;gap:6px;flex-wrap:wrap}
.ucp-modal-code-hint{margin:0;padding:8px 14px 0;font-size:12.5px;color:var(--uc-dim);font-weight:500;text-transform:none;letter-spacing:0}
.ucp-btn-sm{padding:8px 14px;font-size:13px;border-radius:10px}
.ucp-modal-code{margin:0;padding:14px 16px;max-height:220px;overflow:auto;font:12.5px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#e8eef5;white-space:pre-wrap;word-break:break-word}
.ucp-modal-ctas{display:flex;gap:12px;flex-wrap:wrap}

.ucp-bottom-cta{text-align:center;padding:80px 0 90px;border-top:1px solid var(--uc-line);margin-top:50px;
  background:radial-gradient(50% 90% at 50% 100%,rgba(128,23,162,.22),transparent 70%)}
.ucp-bottom-cta h2{font-size:clamp(26px,3.4vw,40px);font-weight:800;margin-bottom:12px}
.ucp-bottom-cta p{color:var(--uc-dim);font-size:16.5px;margin-bottom:26px}

.ucp-noresults{text-align:center;color:var(--uc-dim);padding:50px 0}
.ucp-noresults .mdi{font-size:52px;opacity:.5}

@media (max-width:900px){
  .ucp-result-count{display:none}
}
@media (max-width:600px){
  .ucp{ --ucp-header-offset: 80px; }
  body.admin-bar .ucp{ --ucp-header-offset: 126px; }
  .ucp-hero{padding-bottom:40px}
  .ucp-grid{grid-template-columns:1fr}
  .ucp-stat{min-width:calc(50% - 8px)}
  .ucp-modal-pv{max-height:min(48vh,420px)}
  .ucp-modal-pv img{max-height:min(48vh,420px)}
  .ucp-modal-body{padding:20px}
  .ucp-modal-head h3{font-size:20px}
}
@media (prefers-reduced-motion:reduce){
  .ucp *,.ucp *::before,.ucp *::after{animation-duration:.01s!important;transition-duration:.01s!important}
}
</style>

<script>
(function () {
  var CAT_ICON = {
    layout: 'mdi-view-dashboard-outline',
    content: 'mdi-text-box-outline',
    data: 'mdi-chart-box-outline',
    interactive: 'mdi-gesture-tap',
    input: 'mdi-form-textbox',
    media: 'mdi-image-multiple-outline'
  };
  var CAT_LABEL = {
    layout: 'Layout',
    content: 'Content',
    data: 'Data',
    interactive: 'Controls',
    input: 'Inputs',
    media: 'Media'
  };
  var dataEl = document.getElementById('ucp-data');
  var presets = [];
  try { presets = JSON.parse(dataEl.textContent || '[]'); } catch (e) { presets = []; }

  var state = { q: '', cat: 'all', source: 'all' };
  var grid = document.getElementById('ucp-grid');
  var countEl = document.getElementById('ucp-count');
  var emptyEl = document.getElementById('ucp-noresults');
  var search = document.getElementById('ucp-search');
  var clearBtn = document.getElementById('ucp-search-clear');

  function strip(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || d.innerText || '').trim().replace(/\s+/g, ' ');
  }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function matches(p) {
    if (state.cat !== 'all' && String(p.category || '').toLowerCase() !== state.cat) return false;
    if (state.source !== 'all' && String(p.source || 'community') !== state.source) return false;
    if (!state.q) return true;
    var hay = [p.name, p.description, p.author, p.category, (p.tags || []).join(' '), p.integrations]
      .join(' ').toLowerCase();
    return hay.indexOf(state.q) !== -1;
  }
  function stars(rating, count) {
    var r = Number(rating) || 0;
    var n = Number(count) || 0;
    if (!n && !r) return '';
    return '<span title="' + esc(r.toFixed(1) + ' / 5') + '"><i class="mdi mdi-star"></i> ' + esc(r.toFixed(1)) + (n ? ' (' + n + ')' : '') + '</span>';
  }
  function card(p) {
    var official = p.source === 'official';
    var cat = String(p.category || 'content').toLowerCase();
    var icon = CAT_ICON[cat] || 'mdi-palette-outline';
    var catLabel = CAT_LABEL[cat] || cat;
    var img = p.featured_image || (p.gallery && p.gallery[0]) || '';
    var desc = strip(p.description).slice(0, 120);
    var badge = official
      ? '<span class="ucp-badge ucp-badge-official"><i class="mdi mdi-shield-check"></i> Official</span>'
      : '<span class="ucp-badge ucp-badge-community">Community</span>';
    var pv = img
      ? '<img src="' + esc(img) + '" alt="" loading="lazy">'
      : '<div class="ucp-pv-ph"><i class="mdi ' + icon + '"></i><span>' + esc(cat || 'preset') + '</span></div>';
    var meta = '';
    if (p.author) meta += '<span><i class="mdi mdi-account-outline"></i> ' + esc(p.author) + '</span>';
    meta += '<span><i class="mdi mdi-download-outline"></i> ' + esc(String(p.downloads || 0)) + '</span>';
    meta += stars(p.rating, p.rating_count);
    return (
      '<article class="ucp-card' + (official ? ' ucp-card-official' : '') + '" tabindex="0" role="button" data-id="' + esc(String(p.id)) + '" aria-label="Open ' + esc(p.name || 'preset') + '">' +
        '<div class="ucp-pv">' + pv + '<div class="ucp-card-badge">' + badge + '</div></div>' +
        '<div class="ucp-card-body">' +
          '<div class="ucp-card-title"><i class="mdi ' + icon + '"></i><h3>' + esc(p.name) + '</h3></div>' +
          (desc ? '<p class="ucp-card-desc">' + esc(desc) + '</p>' : '') +
          '<div class="ucp-card-meta">' + meta + '</div>' +
          '<div class="ucp-card-foot"><span class="ucp-cat-tag">' + esc(catLabel) + '</span>' +
            '<span class="ucp-card-try">Read more <i class="mdi mdi-arrow-right"></i></span></div>' +
        '</div>' +
      '</article>'
    );
  }
  function render() {
    var list = presets.filter(matches);
    grid.innerHTML = list.map(card).join('');
    countEl.textContent = list.length + ' preset' + (list.length === 1 ? '' : 's');
    emptyEl.hidden = list.length > 0;
  }

  var modal = document.getElementById('ucp-modal');
  var modalPv = document.getElementById('ucp-modal-pv');
  var modalCodeWrap = document.getElementById('ucp-modal-code-wrap');
  var modalCode = document.getElementById('ucp-modal-code');
  var modalCopyBtn = document.getElementById('ucp-modal-copy');
  var modalDownloadBtn = document.getElementById('ucp-modal-download');
  var modalOpenedAt = 0;
  var modalCurrent = null;
  var modalGallery = [];
  var modalGalleryIdx = 0;
  var API_BASE = <?php echo wp_json_encode(esc_url_raw(rest_url('ultra-card/v1'))); ?>;

  /** Normalize stored code into the builder paste format: [ultra_card]…[/ultra_card] */
  function toBuilderShortcode(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    if (/^\[ultra[_-]card\]/i.test(s) && /\[\/ultra[_-]card\]\s*$/i.test(s)) {
      return s.replace(/^\[ultra-card\]/i, '[ultra_card]').replace(/\[\/ultra-card\]\s*$/i, '[/ultra_card]');
    }
    // Raw JSON layout / export blob → wrap as builder shortcode (UTF-8 safe base64)
    try {
      JSON.parse(s);
      var bytes = new TextEncoder().encode(s);
      var bin = '';
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return '[ultra_card]' + btoa(bin) + '[/ultra_card]';
    } catch (e) {
      return '[ultra_card]' + s + '[/ultra_card]';
    }
  }

  function getModalShortcode() {
    return toBuilderShortcode(
      (modalCode && modalCode.textContent) ||
      (modalCurrent && modalCurrent.shortcode) ||
      ''
    );
  }

  function slugify(name) {
    var base = String(name || 'ultra-card-preset').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return base || 'ultra-card-preset';
  }

  function trackDownload(p) {
    if (!p || !p.id) return;
    fetch(API_BASE + '/presets/' + encodeURIComponent(p.id) + '/track-download', { method: 'POST' })
      .then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (body) {
        if (!body || body.downloads == null) return;
        p.downloads = body.downloads;
        var meta = document.getElementById('ucp-modal-meta');
        if (meta && modalCurrent && String(modalCurrent.id) === String(p.id)) {
          // refresh download count in open modal
          openModalMetaOnly(p);
        }
      })
      .catch(function () {});
  }

  /** Star voting for signed-in visitors; the widget itself ships with the plugin. */
  function mountVote(p) {
    var slot = document.getElementById('ucp-modal-vote');
    if (!slot) return;
    if (!window.ucPresetVote) {
      slot.innerHTML = '';
      return;
    }
    window.ucPresetVote.mount(slot, p.id, p.rating, p.rating_count);
  }

  document.addEventListener('uc-preset-voted', function (e) {
    var d = e.detail || {};
    if (d.aggregate == null) return;
    var p = presets.find(function (x) { return String(x.id) === String(d.presetId); });
    if (!p) return;
    p.rating = d.aggregate;
    p.rating_count = d.count;
    render();
    if (modalCurrent && String(modalCurrent.id) === String(p.id)) openModalMetaOnly(p);
  });

  function openModalMetaOnly(p) {
    var meta = '';
    if (p.author) meta += '<span><i class="mdi mdi-account-outline"></i> ' + esc(p.author) + '</span>';
    meta += '<span><i class="mdi mdi-download-outline"></i> ' + esc(String(p.downloads || 0)) + ' downloads</span>';
    if (p.rating || p.rating_count) {
      meta += '<span><i class="mdi mdi-star"></i> ' + esc(Number(p.rating || 0).toFixed(1)) +
        (p.rating_count ? ' (' + esc(String(p.rating_count)) + ')' : '') + '</span>';
    }
    if (p.integrations) meta += '<span><i class="mdi mdi-puzzle-outline"></i> ' + esc(p.integrations) + '</span>';
    document.getElementById('ucp-modal-meta').innerHTML = meta;
  }

  function galleryUrls(p) {
    var urls = [];
    if (p.featured_image) urls.push(p.featured_image);
    (p.gallery || []).forEach(function (u) {
      if (u && urls.indexOf(u) === -1) urls.push(u);
    });
    return urls;
  }

  function renderModalPv() {
    var p = modalCurrent;
    if (!p) return;
    var cat = String(p.category || 'content').toLowerCase();
    var icon = CAT_ICON[cat] || 'mdi-palette-outline';
    var html = '';
    if (modalGallery.length) {
      html += '<img src="' + esc(modalGallery[modalGalleryIdx]) + '" alt="">';
      if (modalGallery.length > 1) {
        html += '<div class="ucp-modal-gallery" role="tablist" aria-label="Gallery">';
        modalGallery.forEach(function (_, i) {
          html += '<button type="button" data-g="' + i + '" class="' + (i === modalGalleryIdx ? 'active' : '') + '" aria-label="Image ' + (i + 1) + '"></button>';
        });
        html += '</div>';
      }
    } else {
      html = '<div class="ucp-modal-pv-ph"><i class="mdi ' + icon + '"></i><span>' + esc(CAT_LABEL[cat] || cat) + '</span></div>';
    }
    modalPv.innerHTML = html;
  }

  function openModal(p) {
    modalOpenedAt = Date.now();
    modalCurrent = p;
    modalGallery = galleryUrls(p);
    modalGalleryIdx = 0;
    var official = p.source === 'official';
    var cat = String(p.category || 'content').toLowerCase();
    var icon = CAT_ICON[cat] || 'mdi-palette-outline';
    document.getElementById('ucp-modal-title').textContent = p.name || 'Preset';
    var ic = document.getElementById('ucp-modal-icon');
    ic.className = 'ucp-modal-icon mdi ' + icon + (official ? ' official' : '');
    document.getElementById('ucp-modal-badges').innerHTML =
      (official
        ? '<span class="ucp-badge ucp-badge-official"><i class="mdi mdi-shield-check"></i> Official</span>'
        : '<span class="ucp-badge ucp-badge-community">Community</span>') +
      '<span class="ucp-badge ucp-badge-cat">' + esc(CAT_LABEL[cat] || cat) + '</span>';
    document.getElementById('ucp-modal-desc').textContent = strip(p.description) || 'No description provided.';
    var meta = '';
    if (p.author) meta += '<span><i class="mdi mdi-account-outline"></i> ' + esc(p.author) + '</span>';
    meta += '<span><i class="mdi mdi-download-outline"></i> ' + esc(String(p.downloads || 0)) + ' downloads</span>';
    if (p.rating || p.rating_count) {
      meta += '<span><i class="mdi mdi-star"></i> ' + esc(Number(p.rating || 0).toFixed(1)) +
        (p.rating_count ? ' (' + esc(String(p.rating_count)) + ')' : '') + '</span>';
    }
    if (p.integrations) meta += '<span><i class="mdi mdi-puzzle-outline"></i> ' + esc(p.integrations) + '</span>';
    document.getElementById('ucp-modal-meta').innerHTML = meta;
    var tags = Array.isArray(p.tags) ? p.tags.filter(Boolean).slice(0, 10) : [];
    document.getElementById('ucp-modal-tags').innerHTML = tags.map(function (t) {
      return '<span>' + esc(t) + '</span>';
    }).join('');
    renderModalPv();
    mountVote(p);
    modalCodeWrap.hidden = true;
    modalCode.textContent = '';
    document.getElementById('ucp-modal-ctas').innerHTML =
      '<button type="button" class="ucp-btn ucp-btn-blue" id="ucp-modal-cta-copy"><i class="mdi mdi-content-copy"></i> Copy shortcode</button>' +
      '<button type="button" class="ucp-btn ucp-btn-ghost" id="ucp-modal-cta-download"><i class="mdi mdi-download"></i> Download shortcode</button>' +
      '<a class="ucp-btn ucp-btn-ghost" href="https://github.com/WJDDesigns/Ultra-Card" target="_blank" rel="noopener"><i class="mdi mdi-github"></i> Get Ultra Card</a>';
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    loadModalCode(p);
  }

  function closeModal() {
    modal.hidden = true;
    document.documentElement.style.overflow = '';
    modalCurrent = null;
  }

  async function loadModalCode(p) {
    var code = p.shortcode || '';
    if (!code && p.id) {
      try {
        var res = await fetch(API_BASE + '/presets/' + encodeURIComponent(p.id));
        var body = await res.json();
        if (body && body.shortcode) {
          code = body.shortcode;
          p.shortcode = code;
        }
      } catch (e) {}
    }
    if (!code) return;
    var shortcode = toBuilderShortcode(code);
    p.shortcode = shortcode;
    modalCode.textContent = shortcode;
    modalCodeWrap.hidden = false;
    wireCodeButtons();
  }

  function wireCodeButtons() {
    var ctaCopy = document.getElementById('ucp-modal-cta-copy');
    var ctaDl = document.getElementById('ucp-modal-cta-download');
    if (ctaCopy) ctaCopy.onclick = function () { copyModalCode(ctaCopy); };
    if (ctaDl) ctaDl.onclick = function () { downloadModalCode(ctaDl); };
  }

  function copyModalCode(btn) {
    var text = getModalShortcode();
    if (!text) return;
    var done = function () {
      trackDownload(modalCurrent);
      if (!btn) return;
      var prev = btn.innerHTML;
      btn.innerHTML = '<i class="mdi mdi-check"></i> Copied';
      setTimeout(function () { btn.innerHTML = prev; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  }

  function downloadModalCode(btn) {
    var text = getModalShortcode();
    if (!text || !modalCurrent) return;
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = slugify(modalCurrent.name) + '.ultracard.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
    trackDownload(modalCurrent);
    if (btn) {
      var prev = btn.innerHTML;
      btn.innerHTML = '<i class="mdi mdi-check"></i> Downloaded';
      setTimeout(function () { btn.innerHTML = prev; }, 1400);
    }
  }

  modalCopyBtn.addEventListener('click', function () { copyModalCode(modalCopyBtn); });
  modalDownloadBtn.addEventListener('click', function () { downloadModalCode(modalDownloadBtn); });
  modal.addEventListener('click', function (e) {
    if (Date.now() - modalOpenedAt < 350) return;
    if (e.target.closest('[data-close]')) closeModal();
    var g = e.target.closest('[data-g]');
    if (g) {
      modalGalleryIdx = parseInt(g.getAttribute('data-g'), 10) || 0;
      renderModalPv();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
  grid.addEventListener('click', function (e) {
    var cardEl = e.target.closest('.ucp-card');
    if (!cardEl) return;
    var id = cardEl.getAttribute('data-id');
    var p = presets.find(function (x) { return String(x.id) === String(id); });
    if (p) openModal(p);
  });
  grid.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var cardEl = e.target.closest('.ucp-card');
    if (!cardEl) return;
    e.preventDefault();
    var id = cardEl.getAttribute('data-id');
    var p = presets.find(function (x) { return String(x.id) === String(id); });
    if (p) openModal(p);
  });

  document.querySelectorAll('.ucp-seg-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.ucp-seg-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.source = btn.getAttribute('data-source') || 'all';
      render();
    });
  });
  document.querySelectorAll('.ucp-chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.ucp-chip').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.cat = btn.getAttribute('data-cat') || 'all';
      render();
    });
  });
  search.addEventListener('input', function () {
    state.q = (search.value || '').trim().toLowerCase();
    clearBtn.hidden = !state.q;
    render();
  });
  clearBtn.addEventListener('click', function () {
    search.value = '';
    state.q = '';
    clearBtn.hidden = true;
    search.focus();
    render();
  });

  render();

  // Measure sticky site header so content never sits under it.
  function syncHeaderOffset() {
    var header = document.querySelector('.l-header, #page-header, header.l-header, .w-header');
    var admin = document.getElementById('wpadminbar');
    var h = 0;
    if (header) {
      var r = header.getBoundingClientRect();
      // Prefer sticky/fixed header height when visible at top
      h = Math.max(r.height || 0, header.offsetHeight || 0);
    }
    if (admin) h += admin.offsetHeight || 0;
    if (h > 40) {
      document.querySelector('.ucp').style.setProperty('--ucp-header-offset', h + 'px');
    }
  }
  syncHeaderOffset();
  window.addEventListener('resize', syncHeaderOffset);
  window.addEventListener('load', syncHeaderOffset);
})();
</script>

<?php
get_footer();
