<?php
/**
 * Single: Ultra Preset detail — styled to match ultracard.io/modules/
 *
 * @package UltraCardIntegration
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
the_post();

$id = get_the_ID();
$norm = function_exists('uc_normalize_preset') ? uc_normalize_preset(get_post(), true) : null;
$gallery = $norm['gallery'] ?? array();
if (empty($gallery) && has_post_thumbnail()) {
    $gallery = array(get_the_post_thumbnail_url($id, 'large'));
}
$downloads = (int) ($norm['downloads'] ?? get_post_meta($id, 'downloads', true));
$rating = (float) ($norm['rating'] ?? 0);
$rating_count = (int) ($norm['rating_count'] ?? 0);
$category = $norm['category'] ?? '';
$tags = $norm['tags'] ?? array();
$author = $norm['author'] ?? get_the_author();
$source = $norm['source'] ?? 'community';
$official = $source === 'official';
$archive = get_post_type_archive_link('ultra_preset') ?: home_url('/presets/');
$cat_icons = array(
    'layout' => 'mdi-view-dashboard-outline',
    'widget' => 'mdi-widgets-outline',
    'badge'  => 'mdi-badge-account-horizontal-outline',
);
$icon = $cat_icons[strtolower($category)] ?? 'mdi-palette-outline';
?>
<style>
.l-section.wpb_row{padding-top:0!important;padding-bottom:0!important}
.l-main{background:#0e1015!important}
.l-canvas,.l-main .l-section,.l-main .l-section-h{background:transparent!important}
.post_navigation,.l-section.height_small{display:none!important}
.ucp-single{ --ucp-header-offset: 96px; }
body.admin-bar .ucp-single{ --ucp-header-offset: 128px; }
@media (max-width: 782px){
  body.admin-bar .ucp-single{ --ucp-header-offset: 142px; }
}
</style>

<div class="ucp ucp-single" id="ucp-single">
  <div class="ucp-wrap">
    <p class="ucp-back"><a href="<?php echo esc_url($archive); ?>"><i class="mdi mdi-arrow-left"></i> All presets</a></p>

    <header class="ucp-single-hero">
      <div class="ucp-single-badges">
        <?php if ($category) : ?>
          <span class="ucp-chip active"><i class="mdi <?php echo esc_attr($icon); ?>"></i> <?php echo esc_html(ucfirst($category)); ?></span>
        <?php endif; ?>
        <?php if ($official) : ?>
          <span class="ucp-badge ucp-badge-official"><i class="mdi mdi-shield-check"></i> Official</span>
        <?php else : ?>
          <span class="ucp-badge ucp-badge-community">Community</span>
        <?php endif; ?>
      </div>
      <h1 class="ucp-single-title"><?php the_title(); ?></h1>
      <div class="ucp-single-meta">
        <span><i class="mdi mdi-account-outline"></i> <?php echo esc_html($author); ?></span>
        <span><i class="mdi mdi-download-outline"></i> <?php echo esc_html((string) $downloads); ?> downloads</span>
        <?php if ($rating_count || $rating) : ?>
          <span data-rating-cell><i class="mdi mdi-star"></i> <?php echo esc_html(number_format($rating, 1)); ?><?php echo $rating_count ? ' (' . (int) $rating_count . ')' : ''; ?></span>
        <?php endif; ?>
      </div>
    </header>

    <?php if (!empty($gallery)) : ?>
      <div class="ucp-single-gallery">
        <?php foreach ($gallery as $i => $url) : ?>
          <img src="<?php echo esc_url($url); ?>" alt="" loading="<?php echo $i ? 'lazy' : 'eager'; ?>" />
        <?php endforeach; ?>
      </div>
    <?php else : ?>
      <div class="ucp-single-gallery ucp-single-gallery-empty">
        <div class="ucp-pv-ph"><i class="mdi <?php echo esc_attr($icon); ?>"></i><span><?php echo esc_html($category ?: 'preset'); ?></span></div>
      </div>
    <?php endif; ?>

    <div class="ucp-single-grid">
      <article class="ucp-single-desc">
        <h2>About this preset</h2>
        <div class="ucp-prose"><?php the_content(); ?></div>
        <?php if (!empty($tags)) : ?>
          <div class="ucp-tags">
            <?php foreach ($tags as $tag) : ?>
              <span><?php echo esc_html($tag); ?></span>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </article>

      <aside class="ucp-single-aside">
        <div class="ucp-copy-card">
          <h2>Copy into Ultra Card</h2>
          <p>Copy the preset shortcode, then paste it into Ultra Card in Home Assistant.</p>
          <?php echo do_shortcode('[copy_preset_code text="Copy preset code" success_text="Copied!"]'); ?>
          <a class="ucp-btn ucp-btn-ghost ucp-btn-block" href="https://github.com/WJDDesigns/Ultra-Card" target="_blank" rel="noopener">
            <i class="mdi mdi-github"></i> Get Ultra Card
          </a>
        </div>

        <div class="ucp-vote-card" id="ucp-vote" data-preset="<?php echo (int) $id; ?>"
             data-rating="<?php echo esc_attr((string) $rating); ?>"
             data-rating-count="<?php echo esc_attr((string) $rating_count); ?>"></div>
      </aside>
    </div>
  </div>
</div>

<style>
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css");
.ucp-single{--uc-blue:#29b6f6;--uc-purple:#8017A2;--uc-pink:#ff2d78;--uc-gold:#ffc233;
  --uc-bg:#0e1015;--uc-card:#1a1e26;--uc-line:rgba(255,255,255,.09);--uc-txt:#eef1f6;--uc-dim:#9aa3b2;--uc-r:14px;
  background:var(--uc-bg);color:var(--uc-txt);font-family:'Open Sans',system-ui,sans-serif;line-height:1.55;
  margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);
  padding:calc(var(--ucp-header-offset, 96px) + 28px) 0 80px}
.ucp-single .ucp-wrap{max-width:1100px;margin:0 auto;padding:0 24px}
.ucp-single a{color:inherit;text-decoration:none}
.ucp-single .mdi{line-height:1;vertical-align:middle}
.ucp-back{margin:0 0 28px}
.ucp-back a{display:inline-flex;align-items:center;gap:8px;color:var(--uc-dim);font-weight:600}
.ucp-back a:hover{color:#fff}
.ucp-single-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.ucp-single-title{margin:0 0 12px;font-size:clamp(32px,5vw,52px);font-weight:800;letter-spacing:-.02em;color:#fff}
.ucp-single-meta{display:flex;flex-wrap:wrap;gap:16px;color:var(--uc-dim);font-size:14px;margin-bottom:28px}
.ucp-single-meta span{display:inline-flex;align-items:center;gap:6px}
.ucp-single-gallery{display:grid;gap:14px;margin-bottom:36px}
.ucp-single-gallery img{width:100%;border-radius:16px;border:1px solid var(--uc-line);background:#101318}
.ucp-single-gallery-empty{min-height:220px;border-radius:16px;border:1px solid var(--uc-line);background:#101318;
  display:flex;align-items:center;justify-content:center}
.ucp-pv-ph{display:flex;flex-direction:column;align-items:center;gap:10px;color:#5f6877}
.ucp-pv-ph .mdi{font-size:48px;background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));-webkit-background-clip:text;background-clip:text;color:transparent}
.ucp-pv-ph span{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.ucp-single-grid{display:grid;grid-template-columns:1.4fr .8fr;gap:28px;align-items:start}
.ucp-single-desc,.ucp-copy-card{background:var(--uc-card);border:1px solid var(--uc-line);border-radius:16px;padding:24px}
.ucp-single-desc h2,.ucp-copy-card h2{margin:0 0 12px;font-size:20px;font-weight:800;color:#fff}
.ucp-prose{color:var(--uc-dim);font-size:15.5px}
.ucp-prose p{margin:0 0 12px}
.ucp-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.ucp-tags span{font-size:12px;color:#8d97a8;border:1px solid var(--uc-line);border-radius:999px;padding:4px 12px}
.ucp-vote-card:not(:empty){margin-top:18px}
.ucp-copy-card p{color:var(--uc-dim);font-size:14px;margin:0 0 16px}
.ucp-copy-card .copy-button-container{margin-bottom:14px}
.ucp-copy-card .w-btn,.ucp-copy-card .uc-copy-preset-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;
  background:linear-gradient(92deg,var(--uc-blue),var(--uc-purple));color:#fff!important;font-weight:700;
  border:0;border-radius:12px;padding:14px 18px;cursor:pointer}
.ucp-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-weight:700;font-size:15px;
  border-radius:12px;padding:13px 20px;color:#fff}
.ucp-btn-ghost{border:1.5px solid rgba(255,255,255,.28);background:rgba(255,255,255,.05)}
.ucp-btn-block{width:100%}
.ucp-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:999px;font-size:13px;font-weight:600;
  color:#fff;border:1px solid var(--uc-blue);background:rgba(41,182,246,.14)}
.ucp-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;letter-spacing:.07em;
  border-radius:999px;padding:4px 10px;text-transform:uppercase}
.ucp-badge-community{background:rgba(41,182,246,.9);color:#04121c}
.ucp-badge-official{background:linear-gradient(92deg,#ffc233,#ff9d2d);color:#231500}
@media (max-width:860px){
  .ucp-single-grid{grid-template-columns:1fr}
}
</style>
<script>
(function () {
  function syncHeaderOffset() {
    var root = document.getElementById('ucp-single');
    if (!root) return;
    var header = document.querySelector('.l-header, #page-header, header.l-header, .w-header');
    var admin = document.getElementById('wpadminbar');
    var h = 0;
    if (header) h = Math.max(header.getBoundingClientRect().height || 0, header.offsetHeight || 0);
    if (admin) h += admin.offsetHeight || 0;
    if (h > 40) root.style.setProperty('--ucp-header-offset', h + 'px');
  }
  syncHeaderOffset();
  window.addEventListener('resize', syncHeaderOffset);
  window.addEventListener('load', syncHeaderOffset);

  // The voting widget ships in the footer, so wait for it to be parsed.
  function mountVote() {
    var slot = document.getElementById('ucp-vote');
    if (!slot || !window.ucPresetVote) return;
    window.ucPresetVote.mount(
      slot,
      slot.getAttribute('data-preset'),
      slot.getAttribute('data-rating'),
      slot.getAttribute('data-rating-count')
    );
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountVote);
  } else {
    mountVote();
  }

  // Keep the header meta row in step after a vote lands.
  document.addEventListener('uc-preset-voted', function (e) {
    var d = e.detail || {};
    if (d.aggregate == null) return;
    var row = document.querySelector('.ucp-single-meta');
    if (!row) return;
    var cell = row.querySelector('[data-rating-cell]');
    if (!cell) {
      cell = document.createElement('span');
      cell.setAttribute('data-rating-cell', '');
      row.appendChild(cell);
    }
    cell.innerHTML = '<i class="mdi mdi-star"></i> ' + Number(d.aggregate).toFixed(1) +
      (d.count ? ' (' + Number(d.count) + ')' : '');
  });
})();
</script>
<?php
get_footer();
