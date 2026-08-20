<?php
/**
 * Native member dashboard — replaces Directories Pro panels on /dashboard/
 *
 * @package UltraCardIntegration
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!is_user_logged_in()) {
    wp_safe_redirect(wp_login_url(home_url('/dashboard/')));
    exit;
}

$user = wp_get_current_user();
$rest_nonce = wp_create_nonce('wp_rest');
$discord_nonce = wp_create_nonce('ultra_card_discord');
$api_base = esc_url_raw(rest_url('ultra-card/v1'));
$ajax_url = esc_url_raw(admin_url('admin-ajax.php'));
$version = defined('ULTRA_CARD_INTEGRATION_VERSION') ? ULTRA_CARD_INTEGRATION_VERSION : '';
$avatar = get_avatar_url($user->ID, array('size' => 96));
$display = $user->display_name ?: $user->user_login;
$email = $user->user_email;
$account_url = function_exists('wc_get_account_endpoint_url')
    ? wc_get_account_endpoint_url('dashboard')
    : admin_url('profile.php');
$logout_url = wp_logout_url(home_url('/'));
$add_preset_url = home_url('/add-preset/');

// Better Messages embed HTML (server-rendered).
$bm_active = class_exists('Better_Messages')
    || class_exists('BP_Better_Messages')
    || function_exists('bp_better_messages');
$messages_html = '';
if ($bm_active) {
    $messages_html = do_shortcode('[bp-better-messages]');
    if ($messages_html === '[bp-better-messages]' || $messages_html === '') {
        $messages_html = do_shortcode('[better_messages]');
    }
}

$ucp_page_title = 'Dashboard';
get_header();
$partial = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/partials/ucp-shared-head.php';
if (file_exists($partial)) {
    include $partial;
}
?>
<div class="ucp ucp-dash" id="ucp-dash"
  data-api="<?php echo esc_attr($api_base); ?>"
  data-nonce="<?php echo esc_attr($rest_nonce); ?>"
  data-ajax="<?php echo esc_attr($ajax_url); ?>"
  data-discord-nonce="<?php echo esc_attr($discord_nonce); ?>"
  data-add-preset="<?php echo esc_url($add_preset_url); ?>"
  data-user-name="<?php echo esc_attr($display); ?>">
  <header class="ucp-hero ucp-dash-hero">
    <div class="ucp-hero-glow" aria-hidden="true"></div>
    <div class="ucp-wrap ucp-dash-hero-in">
      <div class="ucp-dash-user">
        <img class="ucp-dash-avatar" src="<?php echo esc_url($avatar); ?>" alt="" width="56" height="56">
        <div>
          <div class="ucp-eyebrow"><span class="ucp-pulse"></span> Account<?php if ($version) : ?> · v<?php echo esc_html($version); ?><?php endif; ?></div>
          <h1 class="ucp-h1">Hello, <span class="ucp-grad-text"><?php echo esc_html($display); ?></span></h1>
          <p class="ucp-sub" id="ucp-dash-subline">Your Ultra Card account hub.</p>
        </div>
      </div>
      <div class="ucp-dash-hero-actions">
        <a class="ucp-btn ucp-btn-blue" href="<?php echo esc_url($add_preset_url); ?>"><i class="mdi mdi-plus"></i> Add preset</a>
        <span class="ucp-badge ucp-badge-pro" id="ucp-tier-badge" hidden>PRO</span>
      </div>
    </div>
  </header>

  <div class="ucp-wrap ucp-dash-shell">
    <nav class="ucp-dash-nav" aria-label="Dashboard">
      <a href="#overview" data-sec="overview" class="active"><i class="mdi mdi-view-dashboard-outline"></i><span>Overview</span></a>
      <a href="#presets" data-sec="presets"><i class="mdi mdi-palette-outline"></i><span>My Presets</span></a>
      <a href="#subscription" data-sec="subscription"><i class="mdi mdi-credit-card-outline"></i><span>Subscription</span></a>
      <a href="#backups" data-sec="backups"><i class="mdi mdi-cloud-outline"></i><span>Backups</span></a>
      <a href="#votes" data-sec="votes"><i class="mdi mdi-star-outline"></i><span>Votes</span></a>
      <a href="#favorites" data-sec="favorites"><i class="mdi mdi-heart-outline"></i><span>Favorites</span></a>
      <a href="#messages" data-sec="messages"><i class="mdi mdi-message-outline"></i><span>Messages</span></a>
      <a href="#discord" data-sec="discord"><i class="mdi mdi-discord"></i><span>Discord</span></a>
      <a href="#account" data-sec="account"><i class="mdi mdi-account-outline"></i><span>Account</span></a>
    </nav>

    <div class="ucp-dash-content">
      <!-- Overview -->
      <section class="ucp-sec" id="sec-overview" data-sec="overview">
        <h2>Overview</h2>
        <p class="ucp-hint" style="margin:6px 0 18px">Quick status across presets, Pro, backups, and Discord.</p>
        <div class="ucp-stat-grid" id="ucp-overview-stats">
          <div class="ucp-stat-tile"><b id="ov-presets">—</b><span>My presets</span></div>
          <div class="ucp-stat-tile"><b id="ov-pending">—</b><span>Pending review</span></div>
          <div class="ucp-stat-tile"><b id="ov-backups">—</b><span>Backups</span></div>
          <div class="ucp-stat-tile"><b id="ov-votes">—</b><span>Votes</span></div>
        </div>
        <div class="ucp-overview-ctas">
          <a class="ucp-btn ucp-btn-blue" href="<?php echo esc_url($add_preset_url); ?>"><i class="mdi mdi-plus"></i> Submit a preset</a>
          <a class="ucp-btn ucp-btn-ghost" href="#subscription"><i class="mdi mdi-credit-card-outline"></i> Manage billing</a>
          <a class="ucp-btn ucp-btn-ghost" href="#discord"><i class="mdi mdi-discord"></i> Discord</a>
        </div>
      </section>

      <!-- Presets -->
      <section class="ucp-sec" id="sec-presets" data-sec="presets" hidden>
        <div class="ucp-sec-head">
          <div>
            <h2>My Presets</h2>
            <p class="ucp-hint" style="margin-top:6px">Edit, withdraw, or open live gallery pages.</p>
          </div>
          <a class="ucp-btn ucp-btn-blue" href="<?php echo esc_url($add_preset_url); ?>"><i class="mdi mdi-plus"></i> New</a>
        </div>
        <div id="ucp-presets-list" class="ucp-list"></div>
      </section>

      <!-- Subscription -->
      <section class="ucp-sec" id="sec-subscription" data-sec="subscription" hidden>
        <div class="ucp-sec-head">
          <div>
            <h2>Subscription &amp; billing</h2>
            <p class="ucp-hint" style="margin-top:6px">Plan status, payment method, renewals, and invoices — all in one place.</p>
          </div>
        </div>
        <div class="ucp-card" id="ucp-sub-card">
          <div class="ucp-skel" aria-hidden="true">
            <div class="ucp-skel-line w40"></div>
            <div class="ucp-skel-line w60" style="margin:8px 0 4px"></div>
            <div class="ucp-skel-grid2" style="margin-top:12px">
              <div class="ucp-skel-tile"></div><div class="ucp-skel-tile"></div>
              <div class="ucp-skel-tile"></div><div class="ucp-skel-tile"></div>
            </div>
          </div>
        </div>
        <div class="ucp-card" id="ucp-billing-actions" style="margin-top:14px" hidden></div>
        <div id="ucp-invoices" style="margin-top:18px"></div>
      </section>

      <!-- Backups -->
      <section class="ucp-sec" id="sec-backups" data-sec="backups" hidden>
        <h2>Backups</h2>
        <p class="ucp-hint" style="margin:6px 0 18px">Cloud backups and snapshots synced from Home Assistant.</p>
        <div class="ucp-seg" id="ucp-backup-tabs" role="tablist">
          <button type="button" class="ucp-seg-btn active" data-kind="backups">Backups</button>
          <button type="button" class="ucp-seg-btn" data-kind="snapshots">Snapshots</button>
          <button type="button" class="ucp-seg-btn" data-kind="card-backups">Card backups</button>
        </div>
        <div id="ucp-backups-list" class="ucp-list" style="margin-top:14px"></div>
      </section>

      <!-- Votes -->
      <section class="ucp-sec" id="sec-votes" data-sec="votes" hidden>
        <h2>Votes &amp; reviews</h2>
        <p class="ucp-hint" style="margin:6px 0 18px">Ratings you have left on community presets.</p>
        <div id="ucp-votes-list" class="ucp-list"></div>
      </section>

      <!-- Favorites -->
      <section class="ucp-sec" id="sec-favorites" data-sec="favorites" hidden>
        <div class="ucp-sec-head">
          <div>
            <h2>Favorites</h2>
            <p class="ucp-hint" style="margin-top:6px">Layouts synced from the Ultra Card Hub. View, copy, or download the Ultra Card shortcode.</p>
          </div>
        </div>
        <div id="ucp-favorites-list" class="ucp-list"></div>
      </section>

      <div class="ucp-modal" id="ucp-fav-modal" hidden>
        <div class="ucp-modal-backdrop" data-fav-close></div>
        <div class="ucp-modal-card" role="dialog" aria-modal="true" aria-labelledby="ucp-fav-modal-title">
          <div class="ucp-modal-head">
            <div>
              <h3 id="ucp-fav-modal-title">Favorite</h3>
              <p class="ucp-hint" id="ucp-fav-modal-meta" style="margin-top:4px"></p>
            </div>
            <button type="button" class="ucp-btn ucp-btn-ghost" data-fav-close aria-label="Close"><i class="mdi mdi-close"></i></button>
          </div>
          <p class="ucp-hint" id="ucp-fav-modal-hint" style="margin:0 0 10px">Paste into Ultra Card in Home Assistant (Import / paste shortcode).</p>
          <pre class="ucp-code-block" id="ucp-fav-modal-code"></pre>
          <div class="ucp-modal-actions">
            <button type="button" class="ucp-btn ucp-btn-ghost" id="ucp-fav-modal-copy"><i class="mdi mdi-content-copy"></i> Copy shortcode</button>
            <button type="button" class="ucp-btn ucp-btn-blue" id="ucp-fav-modal-download"><i class="mdi mdi-download"></i> Download</button>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <section class="ucp-sec" id="sec-messages" data-sec="messages" hidden>
        <h2>Messages</h2>
        <p class="ucp-hint" style="margin:6px 0 18px">Inbox powered by Better Messages.</p>
        <div class="ucp-card ucp-messages-wrap">
          <?php if ($bm_active && $messages_html && strpos($messages_html, '[') !== 0) : ?>
            <?php echo $messages_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
          <?php else : ?>
            <div class="ucp-empty">
              <i class="mdi mdi-message-off-outline"></i>
              <p>Messages require the Better Messages plugin. Once activated, your inbox appears here.</p>
            </div>
          <?php endif; ?>
        </div>
      </section>

      <!-- Discord -->
      <section class="ucp-sec" id="sec-discord" data-sec="discord" hidden>
        <h2>Discord</h2>
        <p class="ucp-hint" style="margin:6px 0 18px">Link your Discord account for Pro role sync and community access.</p>
        <div class="ucp-card" id="ucp-discord-card">
          <div class="ucp-skel" aria-hidden="true">
            <div class="ucp-skel-line w60"></div>
            <div class="ucp-skel-line w40" style="margin-top:10px"></div>
            <div class="ucp-skel-row" style="margin-top:14px;height:48px"></div>
          </div>
        </div>
      </section>

      <!-- Account -->
      <section class="ucp-sec" id="sec-account" data-sec="account" hidden>
        <h2>Account settings</h2>
        <p class="ucp-hint" style="margin:6px 0 18px">Profile details and security.</p>
        <div class="ucp-card">
          <div class="ucp-account-row">
            <img src="<?php echo esc_url($avatar); ?>" alt="" width="64" height="64" class="ucp-dash-avatar">
            <div>
              <div style="font-weight:800;font-size:18px"><?php echo esc_html($display); ?></div>
              <div class="ucp-hint"><?php echo esc_html($email); ?></div>
            </div>
          </div>
          <div class="ucp-account-actions">
            <a class="ucp-btn ucp-btn-ghost" href="<?php echo esc_url($account_url); ?>"><i class="mdi mdi-account-edit-outline"></i> Edit profile / password</a>
            <a class="ucp-btn ucp-btn-danger" href="<?php echo esc_url($logout_url); ?>"><i class="mdi mdi-logout"></i> Log out</a>
          </div>
        </div>
      </section>
    </div>
  </div>
</div>

<style>
.ucp-dash-hero-in{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap}
.ucp-dash-user{display:flex;gap:16px;align-items:center;text-align:left}
.ucp-dash-avatar{border-radius:50%;border:2px solid var(--uc-line);object-fit:cover}
.ucp-dash-hero-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.ucp-dash-shell{display:grid;grid-template-columns:220px minmax(0,1fr);gap:28px;padding:24px 0 140px;align-items:start}
.ucp-dash-nav{position:sticky;top:calc(var(--ucp-header-offset,140px) + 16px);display:flex;flex-direction:column;gap:4px;
  padding:10px;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:var(--uc-card)}
.ucp-dash-nav a{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13.5px;font-weight:600;color:var(--uc-dim)}
.ucp-dash-nav a .mdi{font-size:18px}
.ucp-dash-nav a:hover{color:#fff;background:rgba(255,255,255,.04)}
.ucp-dash-nav a.active{color:#fff;background:rgba(41,182,246,.14);border:1px solid rgba(41,182,246,.35)}
.ucp-dash-content{min-width:0;padding-bottom:24px}
.ucp-sec-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.ucp-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ucp-stat-tile{padding:16px;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:var(--uc-card)}
.ucp-stat-tile b{display:block;font-size:28px;font-weight:800}
.ucp-stat-tile span{font-size:12px;color:var(--uc-dim);text-transform:uppercase;letter-spacing:.04em}
.ucp-overview-ctas{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.ucp-list{display:flex;flex-direction:column;gap:12px}
/* withFade/skeleton wrap rows in one child — keep column gap there too */
.ucp-list>.ucp-fade-in,.ucp-list>.ucp-skel{display:flex;flex-direction:column;gap:12px;width:100%}
.ucp-row{display:flex;gap:14px;align-items:center;padding:16px 18px;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:var(--uc-card)}
.ucp-row-main{flex:1;min-width:0}
.ucp-row-main strong{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ucp-row-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;align-items:center}
.ucp-row-actions{display:flex;flex-wrap:wrap;gap:6px}
.ucp-row-actions .ucp-btn{padding:8px 12px;font-size:12.5px;border-radius:9px}
.ucp-seg{display:inline-flex;gap:4px;padding:4px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--uc-line);flex-wrap:wrap}
.ucp-seg-btn{padding:8px 14px;border-radius:9px;font-size:13px;font-weight:600;color:var(--uc-dim)}
.ucp-seg-btn.active{background:rgba(41,182,246,.16);color:#fff}
.ucp-account-row{display:flex;gap:16px;align-items:center;margin-bottom:18px}
.ucp-account-actions{display:flex;flex-wrap:wrap;gap:10px}
.ucp-messages-wrap{min-height:320px;overflow:auto}
.ucp-sub-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
.ucp-sub-item{padding:14px;border:1px solid var(--uc-line);border-radius:12px;background:rgba(0,0,0,.18)}
.ucp-sub-item-label{font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--uc-dim);margin-bottom:6px}
.ucp-sub-item-value{font-size:16px;font-weight:700;color:#fff;word-break:break-word}
.ucp-billing-actions h3,.ucp-invoice-block h3{font-size:16px;margin-bottom:12px}
.ucp-billing-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.ucp-invoice-table-wrap{overflow-x:auto;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:var(--uc-card)}
.ucp-invoice-table{width:100%;border-collapse:collapse;min-width:640px}
.ucp-invoice-table th,.ucp-invoice-table td{padding:12px 14px;text-align:left;border-bottom:1px solid var(--uc-line);font-size:13.5px}
.ucp-invoice-table th{color:var(--uc-dim);font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;font-weight:700;background:rgba(255,255,255,.03)}
.ucp-invoice-table tr:last-child td{border-bottom:0}
.ucp-invoice-table .ucp-btn{padding:7px 11px;font-size:12px}
.ucp-modal{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:24px}
.ucp-modal[hidden]{display:none!important}
.ucp-modal-backdrop{position:absolute;inset:0;z-index:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px)}
.ucp-modal-card{position:relative;z-index:1;width:min(720px,100%);max-height:min(85vh,820px);display:flex;flex-direction:column;
  border:1px solid var(--uc-line);border-radius:16px;background:var(--uc-card);box-shadow:0 24px 80px rgba(0,0,0,.45);padding:18px}
.ucp-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
.ucp-modal-head h3{margin:0;font-size:18px}
.ucp-code-block{flex:1;min-height:180px;max-height:52vh;overflow:auto;margin:0;padding:14px 16px;border-radius:12px;
  border:1px solid var(--uc-line);background:rgba(0,0,0,.35);color:#e8eef5;font:12.5px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word}
.ucp-modal-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:14px}
.ucp-modal-actions .ucp-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
/* Shimmer skeleton placeholders */
.ucp-skel{display:flex;flex-direction:column;gap:12px}
.ucp-skel-row,.ucp-skel-card,.ucp-skel-tile,.ucp-skel-line{
  position:relative;overflow:hidden;border:1px solid var(--uc-line);border-radius:var(--uc-r);
  background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.09) 45%,rgba(255,255,255,.04) 90%);
  background-size:220% 100%;animation:ucpShine 1.35s ease-in-out infinite}
.ucp-skel-row{height:72px}
.ucp-skel-card{min-height:160px}
.ucp-skel-tile{height:88px}
.ucp-skel-line{height:14px;border-radius:8px;border:0}
.ucp-skel-line.w40{width:40%}.ucp-skel-line.w60{width:60%}.ucp-skel-line.w80{width:80%}.ucp-skel-line.w100{width:100%}
.ucp-skel-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ucp-skel-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ucp-fade-in{animation:ucpFadeIn .28s ease}
@keyframes ucpShine{0%{background-position:100% 0}100%{background-position:-100% 0}}
@keyframes ucpFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  .ucp-skel-row,.ucp-skel-card,.ucp-skel-tile,.ucp-skel-line{animation:none}
  .ucp-fade-in{animation:none}
}
@media (max-width:900px){
  .ucp-dash-shell{grid-template-columns:1fr;padding:16px 0 120px}
  .ucp-dash-nav{position:static;flex-direction:row;overflow-x:auto;gap:6px;-webkit-overflow-scrolling:touch}
  .ucp-dash-nav a{flex:0 0 auto;padding:10px 12px}
  .ucp-dash-nav a span{display:none}
  .ucp-stat-grid,.ucp-sub-grid,.ucp-billing-grid,.ucp-skel-grid{grid-template-columns:1fr 1fr}
  .ucp-skel-grid2{grid-template-columns:1fr}
  .ucp-row{flex-direction:column;align-items:stretch}
  .ucp-row-actions{width:100%}
}
</style>

<script>
(function () {
  var root = document.getElementById('ucp-dash');
  if (!root) return;
  var API = root.getAttribute('data-api');
  var NONCE = root.getAttribute('data-nonce');
  var AJAX = root.getAttribute('data-ajax');
  var DISCORD_NONCE = root.getAttribute('data-discord-nonce');
  var ADD = root.getAttribute('data-add-preset');
  var loaded = {};

  function api(path, opts) {
    opts = opts || {};
    var headers = Object.assign({ 'X-WP-Nonce': NONCE, 'Accept': 'application/json' }, opts.headers || {});
    return fetch(API + path, Object.assign({ credentials: 'same-origin' }, opts, { headers: headers }))
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (body) {
          if (!r.ok) {
            var msg = (body && (body.message || body.code)) || ('HTTP ' + r.status);
            throw new Error(typeof msg === 'string' ? msg : 'Request failed');
          }
          return body;
        });
      });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showSec(name) {
    name = name || 'overview';
    document.querySelectorAll('.ucp-sec').forEach(function (s) {
      var on = s.getAttribute('data-sec') === name;
      s.hidden = !on;
      if (on) {
        s.classList.remove('ucp-fade-in');
        // reflow so animation restarts on each tab switch
        void s.offsetWidth;
        s.classList.add('ucp-fade-in');
      }
    });
    document.querySelectorAll('.ucp-dash-nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-sec') === name);
    });
    if (!loaded[name]) {
      loaded[name] = true;
      loadSection(name);
    }
  }

  function currentHash() {
    var h = (location.hash || '#overview').replace(/^#/, '');
    return h || 'overview';
  }

  window.addEventListener('hashchange', function () { showSec(currentHash()); });
  document.querySelectorAll('.ucp-dash-nav a, a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sec = (a.getAttribute('href') || '').replace('#', '') || a.getAttribute('data-sec');
      if (sec && document.getElementById('sec-' + sec)) {
        /* hashchange handles show */
      }
    });
  });

  function statusBadge(p) {
    if (p.has_pending_revision) return '<span class="ucp-badge ucp-badge-pend">Revision pending</span>';
    if (p.review_status === 'changes_requested') return '<span class="ucp-badge ucp-badge-warn">Changes requested</span>';
    if (p.review_status === 'rejected' || p.status === 'rejected') return '<span class="ucp-badge ucp-badge-bad">Rejected</span>';
    if (p.status === 'publish' && p.review_status === 'approved') return '<span class="ucp-badge ucp-badge-ok">Live</span>';
    if (p.status === 'pending' || p.review_status === 'pending') return '<span class="ucp-badge ucp-badge-pend">Pending review</span>';
    if (p.status === 'draft') return '<span class="ucp-badge ucp-badge-info">Draft</span>';
    return '<span class="ucp-badge ucp-badge-info">' + esc(p.status || 'unknown') + '</span>';
  }

  function empty(msg) {
    return '<div class="ucp-empty"><i class="mdi mdi-inbox-outline"></i><p>' + esc(msg) + '</p></div>';
  }

  function skeleton(kind) {
    if (kind === 'stats') {
      return '<div class="ucp-skel ucp-fade-in" aria-busy="true" aria-label="Loading">' +
        '<div class="ucp-skel-grid"><div class="ucp-skel-tile"></div><div class="ucp-skel-tile"></div>' +
        '<div class="ucp-skel-tile"></div><div class="ucp-skel-tile"></div></div></div>';
    }
    if (kind === 'card') {
      return '<div class="ucp-skel ucp-fade-in" aria-busy="true">' +
        '<div class="ucp-skel-line w40"></div><div class="ucp-skel-line w80" style="margin-top:10px"></div>' +
        '<div class="ucp-skel-card" style="margin-top:14px"></div></div>';
    }
    if (kind === 'subscription') {
      return '<div class="ucp-skel ucp-fade-in" aria-busy="true">' +
        '<div class="ucp-skel-line w40"></div><div class="ucp-skel-line w60" style="margin:10px 0"></div>' +
        '<div class="ucp-skel-grid2"><div class="ucp-skel-tile"></div><div class="ucp-skel-tile"></div>' +
        '<div class="ucp-skel-tile"></div><div class="ucp-skel-tile"></div></div></div>';
    }
    // list (default)
    return '<div class="ucp-skel ucp-fade-in" aria-busy="true">' +
      '<div class="ucp-skel-row"></div><div class="ucp-skel-row"></div><div class="ucp-skel-row"></div></div>';
  }

  function withFade(html) {
    return '<div class="ucp-fade-in">' + html + '</div>';
  }

  async function loadOverview() {
    try {
      var data = await api('/me/summary');
      document.getElementById('ov-presets').textContent = String(data.presets_total != null ? data.presets_total : 0);
      document.getElementById('ov-pending').textContent = String(data.presets_pending != null ? data.presets_pending : 0);
      document.getElementById('ov-backups').textContent = String(data.backups_total != null ? data.backups_total : 0);
      document.getElementById('ov-votes').textContent = String(data.reviews_total != null ? data.reviews_total : 0);
      var badge = document.getElementById('ucp-tier-badge');
      if (data.subscription && data.subscription.tier === 'pro' && data.subscription.status === 'active') {
        badge.hidden = false;
        document.getElementById('ucp-dash-subline').textContent = 'Ultra Card Pro is active.';
      } else {
        document.getElementById('ucp-dash-subline').textContent = 'Free account — upgrade anytime for Pro features.';
      }
    } catch (e) {
      document.getElementById('ucp-dash-subline').textContent = 'Could not load summary.';
    }
  }

  async function loadPresets() {
    var box = document.getElementById('ucp-presets-list');
    box.innerHTML = skeleton('list');
    try {
      var data = await api('/presets/mine');
      var list = (data && data.presets) || [];
      if (!list.length) {
        box.innerHTML = withFade(empty('No presets yet. Submit your first layout.'));
        return;
      }
      box.innerHTML = withFade(list.map(function (p) {
        var canWithdraw = p.review_status === 'pending' || p.has_pending_revision || p.status === 'pending';
        return '<div class="ucp-row" data-id="' + esc(p.id) + '">' +
          '<div class="ucp-row-main"><strong>' + esc(p.name) + '</strong>' +
          '<div class="ucp-row-meta">' + statusBadge(p) +
          (p.category ? '<span class="ucp-hint">' + esc(p.category) + '</span>' : '') +
          (p.moderator_note ? '<span class="ucp-hint">Note: ' + esc(p.moderator_note) + '</span>' : '') +
          '</div></div>' +
          '<div class="ucp-row-actions">' +
          '<a class="ucp-btn ucp-btn-ghost" href="' + esc(ADD) + '?id=' + encodeURIComponent(p.id) + '"><i class="mdi mdi-pencil"></i> Edit</a>' +
          (p.preset_url ? '<a class="ucp-btn ucp-btn-ghost" href="' + esc(p.preset_url) + '" target="_blank" rel="noopener"><i class="mdi mdi-open-in-new"></i> View</a>' : '') +
          (canWithdraw ? '<button type="button" class="ucp-btn ucp-btn-ghost" data-act="withdraw"><i class="mdi mdi-undo"></i> Withdraw</button>' : '') +
          '<button type="button" class="ucp-btn ucp-btn-danger" data-act="delete"><i class="mdi mdi-delete-outline"></i></button>' +
          '</div></div>';
      }).join(''));
      box.querySelectorAll('[data-act]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var row = btn.closest('.ucp-row');
          var id = row.getAttribute('data-id');
          var act = btn.getAttribute('data-act');
          if (act === 'delete' && !confirm('Delete this preset permanently?')) return;
          if (act === 'withdraw' && !confirm('Withdraw this submission / pending revision?')) return;
          try {
            if (act === 'delete') await api('/presets/' + id, { method: 'DELETE' });
            else await api('/presets/' + id + '/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
            loaded.presets = false;
            loadPresets();
            loaded.overview = false;
            loadOverview();
          } catch (err) {
            alert(err.message || 'Action failed');
          }
        });
      });
    } catch (err) {
      box.innerHTML = empty(err.message || 'Could not load presets.');
    }
  }

  function fmtDate(v) {
    if (!v) return '—';
    var d = new Date(v);
    if (isNaN(d.getTime())) {
      // Woo often returns "Y-m-d H:i:s"
      d = new Date(String(v).replace(' ', 'T'));
    }
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function money(total, currency) {
    if (total == null || total === '') return '—';
    var n = Number(total);
    if (!isNaN(n) && currency) {
      try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(n);
      } catch (e) {}
    }
    return (currency ? currency + ' ' : '') + String(total);
  }

  function statusClass(st) {
    st = String(st || '').toLowerCase();
    if (st === 'active' || st === 'completed' || st === 'processing') return 'ucp-badge-ok';
    if (st === 'on-hold' || st === 'pending' || st === 'pending-cancel') return 'ucp-badge-pend';
    if (st === 'cancelled' || st === 'expired' || st === 'failed' || st === 'refunded') return 'ucp-badge-bad';
    return 'ucp-badge-info';
  }

  async function loadSubscription() {
    var card = document.getElementById('ucp-sub-card');
    var actions = document.getElementById('ucp-billing-actions');
    var inv = document.getElementById('ucp-invoices');
    card.innerHTML = skeleton('subscription');
    actions.hidden = true;
    inv.innerHTML = skeleton('list');
    try {
      var sub = await api('/subscription');
      var woo = sub.woocommerce || null;
      var tier = (sub.tier || 'free').toLowerCase();
      var status = sub.status || 'inactive';
      var title = tier === 'pro' ? 'Ultra Card Pro' : 'Ultra Card Free';

      var html = '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start">' +
        '<div><div class="ucp-hint" style="margin-bottom:4px">Current plan</div>' +
        '<div style="font-size:26px;font-weight:800">' + esc(title) + '</div></div>' +
        '<span class="ucp-badge ' + statusClass(status) + '">' + esc(status) + '</span></div>';

      if (woo) {
        var interval = woo.billing_interval && Number(woo.billing_interval) > 1
          ? (woo.billing_interval + ' ' + (woo.billing_period || 'month') + 's')
          : (woo.billing_period || 'month');
        var amount = woo.formatted_total || money(woo.total, woo.currency);
        html += '<div class="ucp-sub-grid">' +
          '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Subscription status</div><div class="ucp-sub-item-value"><span class="ucp-badge ' + statusClass(woo.status) + '">' + esc(woo.status || '—') + '</span></div></div>' +
          '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Amount</div><div class="ucp-sub-item-value">' + esc(amount) + '<span class="ucp-hint"> / ' + esc(interval) + '</span></div></div>' +
          '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Next payment</div><div class="ucp-sub-item-value">' + esc(fmtDate(woo.next_payment_date || woo.next_payment)) + '</div></div>' +
          '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Last payment</div><div class="ucp-sub-item-value">' + esc(fmtDate(woo.last_payment_date)) + '</div></div>' +
          '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Payment method</div><div class="ucp-sub-item-value">' + esc(woo.payment_method_title || '—') + '</div></div>' +
          '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Started</div><div class="ucp-sub-item-value">' + esc(fmtDate(woo.start_date)) + '</div></div>' +
          (woo.subscription_id ? '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Subscription ID</div><div class="ucp-sub-item-value">#' + esc(woo.subscription_id) + '</div></div>' : '') +
          (woo.trial_end ? '<div class="ucp-sub-item"><div class="ucp-sub-item-label">Trial ends</div><div class="ucp-sub-item-value">' + esc(fmtDate(woo.trial_end)) + '</div></div>' : '') +
          '</div>';
      } else if (tier !== 'pro') {
        html += '<p class="ucp-hint" style="margin-top:14px">Upgrade to Pro for cloud backups, snapshots, Discord Pro role, and more.</p>' +
          '<div style="margin-top:14px"><a class="ucp-btn ucp-btn-pro" href="https://ultracard.io/product/ultra-card-pro/"><i class="mdi mdi-star"></i> Get Ultra Card PRO</a></div>';
      } else {
        html += '<p class="ucp-hint" style="margin-top:14px">Pro access is active via role. No WooCommerce subscription record was found for invoice history.</p>';
      }
      card.innerHTML = withFade(html);

      // Billing management actions (stay on-site via Woo account endpoints)
      var manageUrl = woo && (woo.manage_subscription_url || woo.view_subscription_url);
      var payUrl = woo && woo.payment_methods_url;
      var billUrl = woo && woo.billing_address_url;
      var subsUrl = woo && woo.subscriptions_url;
      var ordersUrl = woo && woo.orders_url;
      if (woo) {
        actions.hidden = false;
        actions.className = 'ucp-card ucp-billing-actions ucp-fade-in';
        actions.innerHTML = '<h3>Manage billing</h3><div class="ucp-billing-grid">' +
          (manageUrl ? '<a class="ucp-btn ucp-btn-blue" href="' + esc(manageUrl) + '"><i class="mdi mdi-cog-outline"></i> Manage subscription</a>' : '') +
          (payUrl ? '<a class="ucp-btn ucp-btn-ghost" href="' + esc(payUrl) + '"><i class="mdi mdi-credit-card-outline"></i> Payment methods</a>' : '') +
          (billUrl ? '<a class="ucp-btn ucp-btn-ghost" href="' + esc(billUrl) + '"><i class="mdi mdi-map-marker-outline"></i> Billing address</a>' : '') +
          (subsUrl ? '<a class="ucp-btn ucp-btn-ghost" href="' + esc(subsUrl) + '"><i class="mdi mdi-file-document-outline"></i> All subscriptions</a>' : '') +
          (ordersUrl ? '<a class="ucp-btn ucp-btn-ghost" href="' + esc(ordersUrl) + '"><i class="mdi mdi-receipt"></i> Order history</a>' : '') +
          (manageUrl ? '<a class="ucp-btn ucp-btn-danger" href="' + esc(manageUrl) + '" onclick="return confirm(\'Open subscription page to cancel or change your plan?\');"><i class="mdi mdi-cancel"></i> Cancel / change plan</a>' : '') +
          '</div><p class="ucp-hint" style="margin-top:12px">Payment changes, cancellations, and renewals are handled securely through your WooCommerce customer account.</p>';
      } else {
        actions.hidden = true;
        actions.innerHTML = '';
      }

      try {
        var invoices = await api('/subscription/invoices?limit=20');
        var rows = (invoices && invoices.invoices) || [];
        if (rows.length) {
          inv.innerHTML = withFade('<div class="ucp-invoice-block"><h3>Invoices &amp; payments</h3>' +
            '<div class="ucp-invoice-table-wrap"><table class="ucp-invoice-table"><thead><tr>' +
            '<th>Order</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th><th></th>' +
            '</tr></thead><tbody>' +
            rows.map(function (i) {
              var id = i.order_id || i.number || i.id;
              var amt = money(i.total, i.currency);
              var view = i.invoice_url || i.download_invoice_url || '';
              return '<tr>' +
                '<td><strong>#' + esc(id) + '</strong></td>' +
                '<td>' + esc(fmtDate(i.date)) + '</td>' +
                '<td>' + esc(amt) + '</td>' +
                '<td><span class="ucp-badge ' + statusClass(i.status) + '">' + esc(i.status || '') + '</span></td>' +
                '<td>' + esc(i.payment_method || '—') + '</td>' +
                '<td>' + (view ? '<a class="ucp-btn ucp-btn-ghost" href="' + esc(view) + '" target="_blank" rel="noopener"><i class="mdi mdi-eye-outline"></i> View</a>' : '') + '</td>' +
                '</tr>';
            }).join('') +
            '</tbody></table></div></div>');
        } else {
          inv.innerHTML = withFade('<div class="ucp-card"><div class="ucp-empty"><i class="mdi mdi-receipt"></i><p>No invoices yet. They appear here after Pro purchases or renewals.</p></div></div>');
        }
      } catch (e2) {
        inv.innerHTML = withFade('<div class="ucp-card"><div class="ucp-empty"><i class="mdi mdi-alert-outline"></i><p>Could not load invoices.</p></div></div>');
      }
    } catch (err) {
      card.innerHTML = empty(err.message || 'Could not load subscription.');
      actions.hidden = true;
      inv.innerHTML = '';
    }
  }

  var backupKind = 'backups';
  document.querySelectorAll('#ucp-backup-tabs .ucp-seg-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#ucp-backup-tabs .ucp-seg-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      backupKind = btn.getAttribute('data-kind');
      loadBackups();
    });
  });

  async function loadBackups() {
    var box = document.getElementById('ucp-backups-list');
    box.innerHTML = skeleton('list');
    try {
      var path = '/' + backupKind;
      var data = await api(path + '?per_page=30');
      var list = Array.isArray(data) ? data : (data.backups || data.snapshots || data.items || data.data || []);
      if (data && data.backups) list = data.backups;
      if (!list.length) {
        box.innerHTML = withFade(empty('No ' + backupKind.replace('-', ' ') + ' yet. They sync from Home Assistant when Pro backups/snapshots run.'));
        return;
      }
      box.innerHTML = withFade(list.map(function (b) {
        var name = b.name || b.snapshot_name || ('Backup #' + b.id);
        var meta = [b.type, b.created || b.date, b.size].filter(Boolean).join(' · ');
        var actions = '';
        if (b.id) {
          actions = '<a class="ucp-btn ucp-btn-ghost" href="' + esc(API + '/' + backupKind + '/' + b.id + '/download') + '"><i class="mdi mdi-download"></i> Download</a>';
        }
        return '<div class="ucp-row"><div class="ucp-row-main"><strong>' + esc(name) + '</strong>' +
          '<div class="ucp-row-meta"><span class="ucp-hint">' + esc(meta) + '</span></div></div>' +
          '<div class="ucp-row-actions">' + actions + '</div></div>';
      }).join(''));
    } catch (err) {
      box.innerHTML = withFade(empty(err.message || 'Could not load backups.'));
    }
  }

  async function loadVotes() {
    var box = document.getElementById('ucp-votes-list');
    box.innerHTML = skeleton('list');
    try {
      var list = await api('/reviews');
      if (!Array.isArray(list) || !list.length) {
        box.innerHTML = withFade(empty('You have not rated any presets yet.'));
        return;
      }
      box.innerHTML = withFade(list.map(function (r) {
        var stars = '★'.repeat(Math.max(0, Math.min(5, r.rating || 0))) + '☆'.repeat(Math.max(0, 5 - (r.rating || 0)));
        return '<div class="ucp-row"><div class="ucp-row-main"><strong>Preset #' + esc(r.preset_id) + '</strong>' +
          '<div class="ucp-row-meta"><span class="ucp-badge ucp-badge-info">' + stars + '</span>' +
          (r.comment ? '<span class="ucp-hint">' + esc(r.comment) + '</span>' : '') +
          '</div></div></div>';
      }).join(''));
    } catch (err) {
      box.innerHTML = withFade(empty(err.message || 'Could not load votes.'));
    }
  }

  async function loadFavorites() {
    var box = document.getElementById('ucp-favorites-list');
    box.innerHTML = skeleton('list');
    try {
      var list = await api('/favorites');
      if (!Array.isArray(list) || !list.length) {
        box.innerHTML = withFade(empty('No favorites synced yet. Star a layout in the Ultra Card Hub to sync it here.'));
        return;
      }
      favCache = {};
      box.innerHTML = withFade(list.map(function (f, idx) {
        var key = String(f.id != null ? f.id : idx);
        favCache[key] = f;
        var meta = [f.type || 'general', f.created || f.created_at].filter(Boolean).join(' · ');
        var tags = Array.isArray(f.tags) ? f.tags.filter(Boolean) : [];
        return '<div class="ucp-row" data-fav="' + esc(key) + '">' +
          '<div class="ucp-row-main"><strong>' + esc(f.name || 'Untitled favorite') + '</strong>' +
          '<div class="ucp-row-meta">' +
          (meta ? '<span class="ucp-hint">' + esc(meta) + '</span>' : '') +
          (f.description ? '<span class="ucp-hint">' + esc(f.description) + '</span>' : '') +
          tags.map(function (t) { return '<span class="ucp-badge ucp-badge-info">' + esc(t) + '</span>'; }).join('') +
          '</div></div>' +
          '<div class="ucp-row-actions">' +
          '<button type="button" class="ucp-btn ucp-btn-ghost" data-fav-act="view"><i class="mdi mdi-eye-outline"></i> View</button>' +
          '<button type="button" class="ucp-btn ucp-btn-ghost" data-fav-act="copy"><i class="mdi mdi-content-copy"></i> Copy</button>' +
          '<button type="button" class="ucp-btn ucp-btn-ghost" data-fav-act="download"><i class="mdi mdi-download"></i> Download</button>' +
          '</div></div>';
      }).join(''));
      box.querySelectorAll('[data-fav-act]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var row = btn.closest('[data-fav]');
          var key = row && row.getAttribute('data-fav');
          var fav = key && favCache[key];
          if (!fav) return;
          var act = btn.getAttribute('data-fav-act');
          if (act === 'view') openFavModal(fav);
          else if (act === 'copy') copyFavorite(fav, btn);
          else if (act === 'download') downloadFavorite(fav, btn);
        });
      });
    } catch (err) {
      box.innerHTML = withFade(empty(err.message || 'Could not load favorites.'));
    }
  }

  var favCache = {};
  var favModalCurrent = null;

  function isEmptyObj(v) {
    return v == null || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
  }

  function favoriteLayoutData(f) {
    var candidates = [f.data, f.row, null];
    if (typeof f.row_data === 'string' && f.row_data) {
      try { candidates.splice(1, 0, JSON.parse(f.row_data)); } catch (e) {}
    } else if (f.row_data && typeof f.row_data === 'object') {
      candidates.splice(1, 0, f.row_data);
    }
    for (var i = 0; i < candidates.length; i++) {
      var d = candidates[i];
      if (!d || isEmptyObj(d)) continue;
      return d;
    }
    return null;
  }

  function btoaUtf8(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  /** Ultra Card builder paste format for a synced favorite row/layout. */
  function favoriteShortcode(f) {
    if (f && typeof f.shortcode === 'string' && f.shortcode.indexOf('[ultra') !== -1) {
      return f.shortcode.trim();
    }
    var data = favoriteLayoutData(f);
    if (!data) return '';

    var exportData;
    if (data.type === 'ultra-card-row' || data.type === 'ultra-card-full' || data.type === 'ultra-card-layout' || data.type === 'ultra-card-module') {
      exportData = data;
    } else if (Array.isArray(data.rows)) {
      exportData = {
        type: 'ultra-card-full',
        version: '1.0.0',
        data: { layout: { rows: data.rows } },
        metadata: { name: f.name || 'Favorite', exported: new Date().toISOString() }
      };
    } else if (data.columns || data.modules || data.id) {
      // CardRow shape from Hub sync
      exportData = {
        type: 'ultra-card-row',
        version: '1.0.0',
        data: data,
        metadata: { name: f.name || 'Favorite', exported: new Date().toISOString() }
      };
    } else {
      return '';
    }
    return '[ultra_card]' + btoaUtf8(JSON.stringify(exportData)) + '[/ultra_card]';
  }

  function favoriteFilename(f) {
    var base = String(f.name || 'ultra-card-favorite').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!base) base = 'ultra-card-favorite';
    return base + '.ultracard.txt';
  }

  function openFavModal(f) {
    favModalCurrent = f;
    var modal = document.getElementById('ucp-fav-modal');
    var code = favoriteShortcode(f);
    document.getElementById('ucp-fav-modal-title').textContent = f.name || 'Favorite';
    var bits = [f.type || 'general', f.created || f.created_at, f.updated || f.updated_at].filter(Boolean);
    document.getElementById('ucp-fav-modal-meta').textContent = bits.join(' · ');
    var hint = document.getElementById('ucp-fav-modal-hint');
    var copyBtn = document.getElementById('ucp-fav-modal-copy');
    var dlBtn = document.getElementById('ucp-fav-modal-download');
    if (code) {
      document.getElementById('ucp-fav-modal-code').textContent = code;
      hint.textContent = 'Paste into Ultra Card in Home Assistant (Import / paste shortcode).';
      copyBtn.disabled = false;
      dlBtn.disabled = false;
    } else {
      document.getElementById('ucp-fav-modal-code').textContent =
        'No layout data is stored for this favorite yet.\n\nRe-sync favorites from the Ultra Card Hub in Home Assistant, then refresh this page.';
      hint.textContent = 'This favorite was synced before layout data was saved. Re-sync from the Hub to enable copy/download.';
      copyBtn.disabled = true;
      dlBtn.disabled = true;
    }
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeFavModal() {
    var modal = document.getElementById('ucp-fav-modal');
    modal.hidden = true;
    favModalCurrent = null;
    document.body.style.overflow = '';
  }

  function flashBtn(btn, label) {
    if (!btn) return;
    var prev = btn.innerHTML;
    btn.innerHTML = label;
    setTimeout(function () { btn.innerHTML = prev; }, 1600);
  }

  function copyFavorite(f, btn) {
    var text = favoriteShortcode(f);
    if (!text) {
      alert('No Ultra Card shortcode available for this favorite. Re-sync from the Hub and try again.');
      return;
    }
    var done = function () { flashBtn(btn, '<i class="mdi mdi-check"></i> Copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function triggerTextDownload(filename, text) {
    try {
      var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function') {
        window.navigator.msSaveOrOpenBlob(blob, filename);
        return true;
      }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      a.style.position = 'fixed';
      a.style.left = '-9999px';
      document.body.appendChild(a);
      // Some browsers ignore programmatic click() unless a trusted MouseEvent is used.
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      setTimeout(function () {
        a.remove();
        URL.revokeObjectURL(url);
      }, 2000);
      return true;
    } catch (e) {
      return false;
    }
  }

  function downloadFavorite(f, btn) {
    var text = favoriteShortcode(f);
    if (!text) {
      alert('No Ultra Card shortcode available for this favorite. Re-sync from the Hub and try again.');
      return;
    }
    var ok = triggerTextDownload(favoriteFilename(f), text);
    if (ok) flashBtn(btn, '<i class="mdi mdi-check"></i> Downloaded');
    else {
      // Last resort: open a tab the user can Save As
      var w = window.open('', '_blank');
      if (w) {
        w.document.write('<pre>' + text.replace(/</g, '&lt;') + '</pre>');
        w.document.title = favoriteFilename(f);
      } else {
        alert('Download was blocked by the browser. Allow popups or use Copy shortcode instead.');
      }
    }
  }

  document.querySelectorAll('[data-fav-close]').forEach(function (el) {
    el.addEventListener('click', closeFavModal);
  });
  document.getElementById('ucp-fav-modal-copy').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (favModalCurrent) copyFavorite(favModalCurrent, this);
  });
  document.getElementById('ucp-fav-modal-download').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (favModalCurrent) downloadFavorite(favModalCurrent, this);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !document.getElementById('ucp-fav-modal').hidden) closeFavModal();
  });

  async function loadDiscord() {
    var card = document.getElementById('ucp-discord-card');
    card.innerHTML = skeleton('card');
    try {
      var st = await api('/me/discord');
      if (st.connected) {
        card.innerHTML = withFade('<div class="ucp-account-row">' +
          '<div><div style="font-weight:800;font-size:18px">' + esc(st.username || 'Discord connected') + '</div>' +
          '<div class="ucp-hint">ID ' + esc(st.discord_id || '') + '</div></div>' +
          '<span class="ucp-badge ucp-badge-ok">Connected</span></div>' +
          '<button type="button" class="ucp-btn ucp-btn-danger" id="ucp-discord-off"><i class="mdi mdi-link-off"></i> Disconnect</button>');
        document.getElementById('ucp-discord-off').addEventListener('click', async function () {
          if (!confirm('Disconnect Discord?')) return;
          card.innerHTML = skeleton('card');
          await api('/me/discord/disconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
          loaded.discord = false;
          loadDiscord();
        });
      } else {
        card.innerHTML = withFade('<p class="ucp-hint" style="margin-bottom:14px">Connect Discord to receive the Pro role when your subscription is active.</p>' +
          '<button type="button" class="ucp-btn ucp-btn-blue" id="ucp-discord-on"><i class="mdi mdi-discord"></i> Connect Discord</button>');
        document.getElementById('ucp-discord-on').addEventListener('click', async function () {
          try {
            var res = await api('/me/discord/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ return_url: window.location.origin + '/dashboard/#discord' })
            });
            if (res.redirect_url) window.location.href = res.redirect_url;
            else throw new Error('No OAuth URL returned');
          } catch (err) {
            // Fallback to legacy ajax
            var body = 'action=ultra_card_discord_connect&nonce=' + encodeURIComponent(DISCORD_NONCE);
            var r = await fetch(AJAX, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body });
            var j = await r.json();
            if (j && j.success && j.data && j.data.redirect_url) window.location.href = j.data.redirect_url;
            else alert((err && err.message) || 'Could not start Discord connect');
          }
        });
      }
    } catch (err) {
      card.innerHTML = withFade(empty(err.message || 'Discord status unavailable.'));
    }
  }

  function loadSection(name) {
    if (name === 'overview') loadOverview();
    else if (name === 'presets') loadPresets();
    else if (name === 'subscription') loadSubscription();
    else if (name === 'backups') loadBackups();
    else if (name === 'votes') loadVotes();
    else if (name === 'favorites') loadFavorites();
    else if (name === 'discord') loadDiscord();
  }

  showSec(currentHash());
  // Always warm overview counts for hero badge
  if (currentHash() !== 'overview') loadOverview();
})();
</script>
<?php
get_footer();
