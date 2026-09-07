<?php
/**
 * Theme Builder — /theme-builder/
 *
 * A full designer for Ultra Card themes with a live preview. Simple controls
 * cover what most people want (surface, corners, colours, wallpaper); the
 * Advanced switch exposes every token, layer, card chrome field, module
 * default and custom CSS the card understands. Submits to
 * ultra-card/v1/themes (pending review); edits with ?id=, remixes a public
 * theme with ?fork=. Approved themes appear in the Hub catalog, and the
 * author's own submissions sync into Hub › Themes › My Themes.
 *
 * @package UltraCardIntegration
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!is_user_logged_in()) {
    wp_safe_redirect(wp_login_url(home_url('/theme-builder/')));
    exit;
}

$user = wp_get_current_user();
$edit_id = isset($_GET['id']) ? absint($_GET['id']) : 0;
$fork_id = isset($_GET['fork']) ? absint($_GET['fork']) : 0;
$rest_nonce = wp_create_nonce('wp_rest');
$api_base = esc_url_raw(rest_url('ultra-card/v1'));
$version = defined('ULTRA_CARD_INTEGRATION_VERSION') ? ULTRA_CARD_INTEGRATION_VERSION : '';

$ucp_page_title = $edit_id ? 'Edit theme' : 'Theme builder';
get_header();
$partial = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/partials/ucp-shared-head.php';
if (file_exists($partial)) {
    include $partial;
}
include ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/partials/uc-theme-runtime.php';
?>
<div class="ucp ucp-tb" id="ucp-tb"
  data-api="<?php echo esc_attr($api_base); ?>"
  data-nonce="<?php echo esc_attr($rest_nonce); ?>"
  data-edit-id="<?php echo (int) $edit_id; ?>"
  data-fork-id="<?php echo (int) $fork_id; ?>"
  data-author="<?php echo esc_attr($user->display_name); ?>"
  data-dashboard="<?php echo esc_url(home_url('/dashboard/#themes')); ?>"
  data-gallery="<?php echo esc_url(home_url('/themes/')); ?>">
  <header class="ucp-hero ucp-tb-hero">
    <div class="ucp-hero-glow" aria-hidden="true"></div>
    <div class="ucp-wrap">
      <div class="ucp-eyebrow"><span class="ucp-pulse"></span> <?php echo $edit_id ? 'Edit theme' : 'Theme builder'; ?><?php if ($version) : ?> · v<?php echo esc_html($version); ?><?php endif; ?></div>
      <h1 class="ucp-h1"><?php echo $edit_id ? 'Update your theme.' : 'Design a theme.'; ?> <span class="ucp-grad-text">See it live.</span></h1>
      <p class="ucp-sub">Every control here maps to what Ultra Card renders in Home Assistant. Start simple, switch to Advanced when you want every token, layer and module default. Submit for review to share it; your own themes sync into Hub › Themes › My Themes.</p>
    </div>
  </header>

  <div class="ucp-wrap ucp-tb-body">
    <aside class="ucp-tb-panel" id="tb-panel">
      <div class="tb-mode" role="tablist" aria-label="Control level">
        <button type="button" class="tb-mode-btn active" data-mode="simple" role="tab" aria-selected="true"><i class="mdi mdi-tune-variant"></i> Simple</button>
        <button type="button" class="tb-mode-btn" data-mode="advanced" role="tab" aria-selected="false"><i class="mdi mdi-cog-outline"></i> Advanced</button>
      </div>

      <div id="tb-error" class="ucp-alert ucp-alert-error" hidden></div>
      <div id="tb-notice" class="ucp-alert ucp-alert-info" hidden></div>

      <details class="tb-sec" open>
        <summary><i class="mdi mdi-card-text-outline"></i> Basics</summary>
        <div class="tb-sec-body">
          <div class="ucp-field"><label for="tb-name">Theme name<span class="req">*</span></label><input type="text" id="tb-name" maxlength="80" data-path="name" data-type="text" placeholder="Midnight Glass"></div>
          <div class="ucp-field"><label for="tb-desc">Description<span class="req">*</span></label><textarea id="tb-desc" maxlength="600" data-path="description" data-type="text" placeholder="What is the look? Where does it shine?"></textarea></div>
          <div class="ucp-field"><label for="tb-tags">Tags</label><input type="text" id="tb-tags" placeholder="dark, glass, minimal"><span class="ucp-hint">Comma-separated, up to 12</span></div>
          <div class="ucp-field">
            <label>Start from</label>
            <div class="tb-starters" id="tb-starters"></div>
            <div class="tb-starter-row">
              <span class="ucp-hint">Replaces surface, colours and layers. Your name and description stay.</span>
              <button type="button" class="ucp-btn ucp-btn-ghost tb-reset" id="tb-reset" hidden><i class="mdi mdi-restore"></i> <span>Reset</span></button>
            </div>
          </div>
        </div>
      </details>

      <details class="tb-sec" open>
        <summary><i class="mdi mdi-shape-outline"></i> Surface &amp; shape</summary>
        <div class="tb-sec-body">
          <div class="ucp-field">
            <label>Surface</label>
            <div class="tb-seg" data-path="tokens.surface" data-type="seg">
              <button type="button" data-value="flat">Flat</button><button type="button" data-value="glass">Glass</button><button type="button" data-value="neumorphic">Neumorphic</button><button type="button" data-value="glossy">Glossy</button><button type="button" data-value="outline">Outline</button><button type="button" data-value="minimal">Minimal</button>
            </div>
          </div>
          <div class="ucp-field tb-range"><label for="tb-radius">Corner radius <output id="tb-radius-out">12px</output></label><input type="range" id="tb-radius" min="0" max="48" step="1" data-path="tokens.radius" data-type="number" data-out="tb-radius-out" data-override="card.card_border_radius"></div>
          <div class="ucp-field tb-range adv"><label for="tb-radius-sm">Small control radius <output id="tb-radius-sm-out">auto</output></label><input type="range" id="tb-radius-sm" min="0" max="40" step="1" data-path="tokens.radius_sm" data-type="number" data-out="tb-radius-sm-out" data-optional="1"><span class="ucp-hint">Buttons, chips, tracks. Auto is half the card radius.</span></div>
          <div class="ucp-field tb-range"><label for="tb-bw">Border width <output id="tb-bw-out">1px</output></label><input type="range" id="tb-bw" min="0" max="8" step="1" data-path="tokens.border_width" data-type="number" data-out="tb-bw-out" data-optional="1" data-override="card.card_border_width"><span class="ucp-hint">Auto follows the surface: 1px for flat, glass and outline; none for neumorphic, glossy and minimal.</span></div>
          <div class="ucp-field"><label>Border colour</label><div class="tb-color" data-path="tokens.border_color"></div></div>
          <div class="ucp-field tb-range" id="tb-blur-field"><label for="tb-blur">Glass blur <output id="tb-blur-out">12px</output></label><input type="range" id="tb-blur" min="0" max="60" step="1" data-path="tokens.blur" data-type="number" data-out="tb-blur-out" data-optional="1"><span class="ucp-hint">Blur shows over a wallpaper or anything behind the card; on a flat page it is invisible, so the preview adds soft colour behind glass.</span></div>
          <div class="ucp-field">
            <label for="tb-shadow-preset">Shadow</label>
            <select id="tb-shadow-preset"><option value="">Surface default</option><option value="none">None</option><option value="soft">Soft</option><option value="medium">Medium</option><option value="deep">Deep</option><option value="custom">Custom…</option></select>
            <textarea class="adv code" id="tb-shadow" rows="2" data-path="tokens.shadow" data-type="text" placeholder="0 8px 24px rgba(0,0,0,.18)"></textarea>
          </div>
          <div class="ucp-field">
            <label>Density</label>
            <div class="tb-seg" data-path="tokens.density" data-type="seg" data-default="regular"><button type="button" data-value="compact">Compact</button><button type="button" data-value="regular">Regular</button><button type="button" data-value="comfortable">Comfortable</button></div>
          </div>
          <div class="ucp-field">
            <label for="tb-font">Font</label>
            <select id="tb-font-preset"><option value="">Inherit from Home Assistant</option><option value="Roboto, system-ui, sans-serif">Roboto</option><option value="Inter, system-ui, sans-serif">Inter</option><option value="&quot;Google Sans Text&quot;, &quot;Google Sans&quot;, Roboto, sans-serif">Google Sans</option><option value="-apple-system, BlinkMacSystemFont, &quot;SF Pro Text&quot;, system-ui, sans-serif">SF Pro / System</option><option value="Georgia, &quot;Times New Roman&quot;, serif">Georgia (serif)</option><option value="ui-monospace, SFMono-Regular, Menlo, monospace">Monospace</option><option value="custom">Custom…</option></select>
            <input type="text" class="adv" id="tb-font" data-path="tokens.font_family" data-type="text" placeholder="&quot;My Font&quot;, sans-serif">
          </div>
        </div>
      </details>

      <details class="tb-sec" open>
        <summary><i class="mdi mdi-texture-box"></i> Surfaces</summary>
        <div class="tb-sec-body">
          <p class="ucp-hint" style="margin-bottom:10px">How modules that follow the theme paint their parts. <b>From surface</b> derives each one from the surface above; pick a recipe to set, say, glass buttons over flat bars. Module defaults (advanced) can still override a single module.</p>
          <div class="tb-grid2" id="tb-recipes"></div>
        </div>
      </details>

      <details class="tb-sec" open>
        <summary><i class="mdi mdi-palette-outline"></i> Colours</summary>
        <div class="tb-sec-body">
          <p class="ucp-hint" style="margin-bottom:10px">Leave a colour on <b>Auto</b> to follow the user's Home Assistant theme. Pin it to make your theme look the same everywhere.</p>
          <div class="ucp-field"><label>Accent</label><div class="tb-color" data-path="tokens.accent"></div><span class="ucp-hint">Buttons, fills and highlights inside modules.</span></div>
          <div class="ucp-field"><label class="tb-check"><input type="checkbox" id="tb-tint"> Tint everything to the accent</label><span class="ucp-hint">Recolours the whole card, icons and images included, to the accent's hue: the Terminal look in any colour. Change the accent and the tint follows.</span></div>
          <div class="ucp-field"><label>Primary</label><div class="tb-color" data-path="tokens.palette.primary"></div></div>
          <div class="ucp-field"><label>Card background</label><div class="tb-color" data-path="tokens.palette.card_bg"></div></div>
          <div class="ucp-field"><label>Text</label><div class="tb-color" data-path="tokens.palette.text"></div></div>
          <div class="ucp-field adv"><label>Secondary text</label><div class="tb-color" data-path="tokens.palette.text_secondary"></div></div>
          <div class="ucp-field adv"><label>Divider</label><div class="tb-color" data-path="tokens.palette.divider"></div></div>
          <div class="ucp-field adv"><label>Text on primary</label><div class="tb-color" data-path="tokens.palette.on_primary"></div><span class="ucp-hint">Derived from Primary when left on Auto.</span></div>
          <div id="tb-contrast" class="tb-contrast" hidden></div>
          <button type="button" class="ucp-btn ucp-btn-ghost tb-fix-contrast" id="tb-fix-contrast" hidden><i class="mdi mdi-auto-fix"></i> Fix contrast</button>
        </div>
      </details>

      <details class="tb-sec" open>
        <summary><i class="mdi mdi-layers-outline"></i> Wallpaper &amp; layers</summary>
        <div class="tb-sec-body">
          <div class="ucp-field">
            <label>Dashboard background</label>
            <div class="tb-wall" id="tb-wall"></div>
            <input type="file" id="tb-wall-file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" hidden>
            <div class="tb-color" data-path="__wallColor" id="tb-wall-color" hidden></div>
            <div class="tb-wall-img" id="tb-wall-img" hidden>
              <div class="tb-wall-img-head"><span id="tb-wall-img-info" class="ucp-hint"></span><button type="button" class="tb-link" id="tb-wall-replace">Replace</button><button type="button" class="tb-link" id="tb-wall-remove">Remove</button></div>
              <div class="tb-grid2">
                <div class="ucp-field tb-range"><label for="tb-wall-dim">Darken <output id="tb-wall-dim-out">0%</output></label><input type="range" id="tb-wall-dim" min="0" max="80" step="5" value="0"><span class="ucp-hint">A dark wash over the picture so cards and text stay readable.</span></div>
                <div class="ucp-field"><label for="tb-wall-pos">Anchor</label><select id="tb-wall-pos"><option value="center">Centre</option><option value="top">Top</option><option value="bottom">Bottom</option></select></div>
              </div>
            </div>
            <div id="tb-wall-busy" class="ucp-hint" hidden><i class="mdi mdi-loading mdi-spin"></i> Preparing image…</div>
            <textarea class="adv code" id="tb-page-bg" rows="3" data-path="tokens.page_background" data-type="text" placeholder="linear-gradient(180deg, #0b1020, #1b2a4a) fixed"></textarea>
            <span class="ucp-hint">Painted behind every card on the view (users can switch this off in the Hub). Pick a gradient, a colour, or upload a picture or SVG: images are resized and compressed here to fit about <span id="tb-wall-budget">150 KB</span>, so the theme stays quick to sync. Remote images are not allowed.</span>
          </div>
          <div class="ucp-field adv"><label for="tb-pane-bg">Inner pane background</label><textarea class="code" id="tb-pane-bg" rows="2" data-path="tokens.pane_background" data-type="text" placeholder="rgba(255,255,255,0.06)"></textarea><span class="ucp-hint">Rows, tiles, chips and tracks drawn inside modules. Empty follows the surface. Colours, gradients and small inline SVG data URIs (up to 20k characters).</span></div>
          <div class="ucp-field adv"><label for="tb-pane-border">Inner pane border</label><input type="text" id="tb-pane-border" data-path="tokens.pane_border" data-type="text" placeholder="1px solid rgba(255,255,255,0.1)"></div>
          <div class="ucp-field adv"><label for="tb-pane-shadow">Inner pane shadow</label><input type="text" id="tb-pane-shadow" data-path="tokens.pane_shadow" data-type="text" placeholder="none"></div>
        </div>
      </details>

      <details class="tb-sec adv">
        <summary><i class="mdi mdi-card-outline"></i> Card chrome</summary>
        <div class="tb-sec-body">
          <p class="ucp-hint" style="margin-bottom:10px">Overrides for the card shell itself. Empty fields follow the surface tokens above.</p>
          <div class="ucp-field tb-range"><label for="tb-pad">Padding <output id="tb-pad-out">16px</output></label><input type="range" id="tb-pad" min="0" max="40" step="1" data-path="card.card_padding" data-type="number" data-out="tb-pad-out" data-optional="1"></div>
          <div class="ucp-field"><label>Card background</label><div class="tb-color" data-path="card.card_background"></div></div>
          <div class="ucp-field tb-range"><label for="tb-cbr">Card radius <output id="tb-cbr-out">token</output></label><input type="range" id="tb-cbr" min="0" max="48" step="1" data-path="card.card_border_radius" data-type="number" data-out="tb-cbr-out" data-optional="1"></div>
          <div class="ucp-field tb-range"><label for="tb-cbw">Card border width <output id="tb-cbw-out">token</output></label><input type="range" id="tb-cbw" min="0" max="8" step="1" data-path="card.card_border_width" data-type="number" data-out="tb-cbw-out" data-optional="1"></div>
          <div class="ucp-field"><label>Card border colour</label><div class="tb-color" data-path="card.card_border_color"></div></div>
          <div class="ucp-field"><label class="tb-check"><input type="checkbox" data-path="card.card_transparent" data-type="bool"> Transparent card</label></div>
          <div class="ucp-field"><label for="tb-cse">Card shadow</label><select id="tb-cse" data-path="card.card_shadow_enabled" data-type="tribool"><option value="">Follow surface</option><option value="true">Custom shadow</option><option value="false">No shadow</option></select></div>
          <div class="tb-grid2" id="tb-cshadow">
            <div class="ucp-field"><label for="tb-csh">X</label><input type="number" id="tb-csh" data-path="card.card_shadow_horizontal" data-type="number" placeholder="0"></div>
            <div class="ucp-field"><label for="tb-csv">Y</label><input type="number" id="tb-csv" data-path="card.card_shadow_vertical" data-type="number" placeholder="4"></div>
            <div class="ucp-field"><label for="tb-csb">Blur</label><input type="number" id="tb-csb" data-path="card.card_shadow_blur" data-type="number" placeholder="12"></div>
            <div class="ucp-field"><label for="tb-css">Spread</label><input type="number" id="tb-css" data-path="card.card_shadow_spread" data-type="number" placeholder="0"></div>
            <div class="ucp-field" style="grid-column:1/-1"><label>Colour</label><div class="tb-color" data-path="card.card_shadow_color"></div></div>
          </div>
        </div>
      </details>

      <details class="tb-sec adv">
        <summary><i class="mdi mdi-view-module-outline"></i> Module defaults</summary>
        <div class="tb-sec-body">
          <p class="ucp-hint" style="margin-bottom:10px">What each module uses when its own style is set to "Theme". Leave a surface field on <b>Theme surface</b> to follow the Surfaces section; other fields left blank keep the module's own default. Buttons, bars and panes are drawn in the preview; layout choices (grid, navigation, tabs) are not.</p>
          <div id="tb-modules"></div>
        </div>
      </details>

      <details class="tb-sec adv">
        <summary><i class="mdi mdi-auto-fix"></i> Effects</summary>
        <div class="tb-sec-body">
          <div class="ucp-field tb-range"><label for="tb-gray">Desaturate <output id="tb-gray-out">0%</output></label><input type="range" id="tb-gray" min="0" max="1" step="0.05" data-path="tokens.grayscale" data-type="number" data-out="tb-gray-out" data-fmt="pct" data-optional="1"><span class="ucp-hint">1 = true monochrome, including images and icons users coloured themselves.</span></div>
          <div class="ucp-field"><label for="tb-filter">Colour filter</label><input type="text" id="tb-filter" data-path="tokens.color_filter" data-type="text" placeholder="grayscale(1) sepia(1) hue-rotate(60deg) saturate(3)"><span class="ucp-hint">Full CSS filter chain: grayscale, sepia, saturate, hue-rotate, brightness, contrast, invert, opacity.</span></div>
        </div>
      </details>

      <details class="tb-sec adv">
        <summary><i class="mdi mdi-code-braces"></i> Custom CSS</summary>
        <div class="tb-sec-body">
          <div class="ucp-field"><textarea class="code" id="tb-css" rows="10" data-path="css" data-type="text" placeholder=".card-container {&#10;  background-image: linear-gradient(180deg, rgba(255,255,255,.08), transparent 40%) !important;&#10;}"></textarea>
          <span class="ucp-hint">Scoped to the card. <code>.card-container</code> is the shell; use <code>var(--uc-card-hue)</code> and <code>var(--uc-card-seed-1..3)</code> for per-card variety (the dice in the preview deal new values). Inline <code>url("data:image/…")</code> artwork is fine up to 60k characters in total; no @import, remote url() or @font-face.</span></div>
        </div>
      </details>

      <details class="tb-sec adv">
        <summary><i class="mdi mdi-identifier"></i> Identity</summary>
        <div class="tb-sec-body">
          <div class="ucp-field"><label for="tb-id">Theme id</label><input type="text" id="tb-id" data-path="id" data-type="text" placeholder="midnight-glass" pattern="[a-z0-9][a-z0-9_-]{0,63}"><span class="ucp-hint">Lowercase letters, numbers, - and _. The catalog prefixes it with <code>wp-</code>.</span></div>
          <div class="ucp-field"><label for="tb-icon">Icon</label><input type="text" id="tb-icon" data-path="icon" data-type="text" placeholder="mdi:palette"></div>
          <div class="ucp-field"><label for="tb-author">Author</label><input type="text" id="tb-author" data-path="author" data-type="text" maxlength="80"></div>
        </div>
      </details>

      <details class="tb-sec">
        <summary><i class="mdi mdi-image-outline"></i> Preview image <span class="ucp-hint" style="font-weight:500">(optional)</span></summary>
        <div class="tb-sec-body">
          <div class="ucp-drop" id="tb-drop" tabindex="0"><i class="mdi mdi-image-plus-outline"></i><strong>Click or drop a screenshot</strong><span class="ucp-hint">Shown in the gallery and Hub. Without one, a live swatch is used.</span><input type="file" id="tb-file" accept="image/*" hidden></div>
          <div class="ucp-thumbs" id="tb-thumb"></div>
        </div>
      </details>

      <details class="tb-sec">
        <summary><i class="mdi mdi-code-json"></i> Import / export</summary>
        <div class="tb-sec-body">
          <div class="tb-btnrow">
            <button type="button" class="ucp-btn ucp-btn-ghost" id="tb-import"><i class="mdi mdi-upload-outline"></i> Import JSON</button>
            <button type="button" class="ucp-btn ucp-btn-ghost" id="tb-export"><i class="mdi mdi-download-outline"></i> Download JSON</button>
            <button type="button" class="ucp-btn ucp-btn-ghost" id="tb-copy"><i class="mdi mdi-content-copy"></i> Copy JSON</button>
            <input type="file" id="tb-import-file" accept="application/json,.json" hidden>
          </div>
          <details class="tb-json"><summary>Theme JSON</summary><pre id="tb-json" class="tb-pre"></pre></details>
          <span class="ucp-hint">The same JSON the Hub's theme editor reads. Import from Hub › Themes › Export, or paste a theme someone shared.</span>
        </div>
      </details>
    </aside>

    <main class="ucp-tb-preview">
      <div class="tb-prev-card ucp-card">
        <div class="tb-prev-bar">
          <div class="tb-seg tb-seg-sm" id="tb-prev-mode"><button type="button" data-value="light" class="active"><i class="mdi mdi-white-balance-sunny"></i> Light HA</button><button type="button" data-value="dark"><i class="mdi mdi-weather-night"></i> Dark HA</button></div>
          <div class="tb-seg tb-seg-sm" id="tb-prev-width"><button type="button" data-value="phone"><i class="mdi mdi-cellphone"></i></button><button type="button" data-value="desktop" class="active"><i class="mdi mdi-monitor"></i></button></div>
          <button type="button" class="ucp-btn ucp-btn-ghost tb-reroll" id="tb-reroll" title="Deal new per-card hue and seeds"><i class="mdi mdi-dice-multiple-outline"></i> <span>Reroll</span></button>
        </div>
        <div id="tb-preview" class="tb-preview" aria-live="polite"></div>
        <p class="ucp-hint tb-prev-note">Preview mirrors the card's theme engine. Real modules add their own detail; per-card randomness (hue and seeds) is dealt afresh on each dashboard load.</p>
      </div>

      <div class="tb-actions ucp-card">
        <div class="tb-actions-main">
          <button type="button" class="ucp-btn ucp-btn-blue" id="tb-submit"><i class="mdi mdi-send"></i> <span id="tb-submit-label"><?php echo $edit_id ? 'Save changes' : 'Submit for review'; ?></span></button>
          <a class="ucp-btn ucp-btn-ghost" href="<?php echo esc_url(home_url('/dashboard/#themes')); ?>">My themes</a>
          <span class="ucp-hint tb-size" id="tb-size" title="Theme size as stored and synced"></span>
        </div>
        <p class="ucp-hint">Approved themes appear in the Hub catalog and the <a href="<?php echo esc_url(home_url('/themes/')); ?>" style="color:var(--uc-blue)">gallery</a>; your own submissions sync into <b>Hub › Themes › My Themes</b> when signed in with Ultra Card Connect.</p>
      </div>

      <div id="tb-success" class="ucp-card ucp-success" hidden>
        <h2 id="tb-success-title">Theme submitted</h2>
        <p id="tb-success-body" class="ucp-hint" style="margin-top:8px"></p>
        <div class="ucp-success-actions">
          <a class="ucp-btn ucp-btn-blue" href="<?php echo esc_url(home_url('/dashboard/#themes')); ?>"><i class="mdi mdi-view-dashboard-outline"></i> Open My Themes</a>
          <a class="ucp-btn ucp-btn-ghost" href="<?php echo esc_url(home_url('/theme-builder/')); ?>"><i class="mdi mdi-plus"></i> Build another</a>
        </div>
      </div>
    </main>
  </div>
</div>

<style>
.ucp-tb-hero{padding-bottom:28px}
.ucp-tb-body{display:grid;grid-template-columns:minmax(300px,420px) minmax(0,1fr);gap:24px;align-items:start;padding-bottom:120px}
.ucp-tb-panel{display:flex;flex-direction:column;gap:10px;min-width:0}
/* The preview column sticks under the site header and is capped to the viewport:
   the stage scrolls inside its card while the action bar stays in reach. */
.ucp-tb-preview{position:sticky;top:calc(var(--ucp-header-offset,96px) + 12px);max-height:calc(100vh - var(--ucp-header-offset,96px) - 24px);display:flex;flex-direction:column;gap:14px;min-width:0}
.ucp-tb-preview .tb-prev-card{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.ucp-tb-preview .tb-prev-card .tb-preview{flex:1 1 auto;min-height:0;overflow:auto;scrollbar-width:thin;border-radius:14px}
.ucp-tb-preview .tb-actions,.ucp-tb-preview #tb-success{flex:none}
.tb-mode{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border:1px solid var(--uc-line);border-radius:12px;background:var(--uc-card)}
.tb-mode-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border-radius:9px;font-weight:700;font-size:13.5px;color:var(--uc-dim)}
.tb-mode-btn.active{background:linear-gradient(135deg,rgba(41,182,246,.22),rgba(128,23,162,.22));color:#fff}
.ucp-tb .adv{display:none}
.ucp-tb.advanced .adv{display:block}
.ucp-tb.advanced details.adv{display:block}
.ucp-tb.advanced .ucp-field.adv{display:flex}
.ucp-tb.advanced textarea.adv,.ucp-tb.advanced input.adv{display:block;margin-top:6px}
.tb-sec{border:1px solid var(--uc-line);border-radius:var(--uc-r);background:var(--uc-card);overflow:hidden}
.tb-sec>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:13px 16px;font-weight:700;font-size:14px;color:#fff;user-select:none}
.tb-sec>summary::-webkit-details-marker{display:none}
.tb-sec>summary::after{content:"\F0140";font-family:"Material Design Icons";margin-left:auto;color:var(--uc-dim);transition:transform .2s}
.tb-sec[open]>summary::after{transform:rotate(180deg)}
.tb-sec>summary .mdi{color:var(--uc-blue);font-size:18px}
.tb-sec-body{padding:4px 16px 14px}
.tb-sec-body .ucp-field{margin-bottom:12px}
.tb-sec-body .ucp-field:last-child{margin-bottom:0}
.tb-sec-body select{width:100%;background:rgba(0,0,0,.28);border:1px solid var(--uc-line);border-radius:10px;color:#fff;padding:10px 12px;font-size:14px}
.tb-sec-body input[type=number]{width:100%;background:rgba(0,0,0,.28);border:1px solid var(--uc-line);border-radius:10px;color:#fff;padding:10px 12px;font-size:14px}
.tb-sec-body textarea.code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;min-height:0}
.tb-range label{display:flex;justify-content:space-between;gap:8px}
.tb-range output{color:var(--uc-dim);font-weight:500;font-size:12.5px;text-align:right}
.tb-range.is-overridden input[type=range]{opacity:.45}
.tb-range output .ov{color:var(--uc-warn)}
.tb-range input[type=range]{width:100%;accent-color:var(--uc-blue)}
.tb-seg{display:flex;flex-wrap:wrap;gap:4px;padding:4px;border:1px solid var(--uc-line);border-radius:10px;background:rgba(0,0,0,.2)}
.tb-seg button{flex:1 1 auto;padding:8px 10px;border-radius:7px;font-size:12.5px;font-weight:600;color:var(--uc-dim);white-space:nowrap}
.tb-seg button.active{background:rgba(41,182,246,.18);color:#fff}
.tb-seg-sm button{padding:7px 10px;display:inline-flex;align-items:center;gap:6px}
.tb-color{display:grid;grid-template-columns:40px 1fr auto;gap:8px;align-items:center}
.tb-color input[type=color]{width:40px;height:40px;padding:0;border:1px solid var(--uc-line);border-radius:10px;background:transparent;cursor:pointer}
.tb-color input[type=color]::-webkit-color-swatch-wrapper{padding:3px}
.tb-color input[type=color]::-webkit-color-swatch{border:0;border-radius:7px}
.tb-color input[type=text]{width:100%;background:rgba(0,0,0,.28);border:1px solid var(--uc-line);border-radius:10px;color:#fff;padding:10px 12px;font-size:13.5px;font-family:ui-monospace,Menlo,monospace}
.tb-color .tb-auto{padding:9px 12px;border-radius:9px;border:1px solid var(--uc-line);font-size:12px;font-weight:700;color:var(--uc-dim)}
.tb-color.is-auto .tb-auto{background:rgba(74,222,128,.12);border-color:rgba(74,222,128,.35);color:#bbf7d0}
.tb-color.is-auto input[type=color]{opacity:.35}
.tb-check{display:flex;align-items:center;gap:10px;font-weight:600;cursor:pointer}
.tb-check input{width:18px;height:18px;accent-color:var(--uc-blue)}
.tb-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tb-starters{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
.tb-starter{display:flex;flex-direction:column;gap:6px;padding:6px;border:1px solid var(--uc-line);border-radius:10px;background:rgba(0,0,0,.2);text-align:left}
.tb-starter:hover{border-color:rgba(255,255,255,.3)}
.tb-starter .uc-swatch{border-radius:7px}
.tb-starter span{font-size:11.5px;font-weight:600;color:var(--uc-dim);padding:0 2px}
.tb-starter.active{border-color:var(--uc-blue);box-shadow:0 0 0 1px var(--uc-blue)}
.tb-starter.active span{color:#fff}
.tb-starter-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px}
.tb-starter-row .ucp-hint{margin:0}
.tb-reset{padding:6px 10px;font-size:12px;white-space:nowrap}
.tb-wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:8px;border-radius:10px;transition:box-shadow .15s}
.tb-wall.drag{box-shadow:0 0 0 2px var(--uc-blue)}
.tb-wall button{height:44px;border-radius:9px;border:2px solid transparent;position:relative;overflow:hidden}
.tb-wall button.active{border-color:var(--uc-blue);box-shadow:0 0 0 2px rgba(41,182,246,.3)}
.tb-wall button span{position:absolute;inset:auto 0 0;font-size:9.5px;font-weight:700;text-align:center;padding:2px;background:rgba(0,0,0,.55);color:#fff}
.tb-wall button[data-wall=image] .mdi{position:absolute;inset:0 0 14px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;opacity:.8}
.tb-wall-img{margin-top:8px;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.2);border:1px solid var(--uc-line)}
.tb-wall-img-head{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.tb-wall-img-head .ucp-hint{flex:1;min-width:0;color:#dbe6ff}
.tb-link{font-size:12.5px;font-weight:700;color:var(--uc-blue);padding:0}
.tb-link:hover{text-decoration:underline}
.tb-wall-img .tb-grid2 .ucp-field{margin-bottom:0}
#tb-wall-busy{margin-top:8px}
.mdi-spin{display:inline-block;animation:tbSpin 1s linear infinite}
@keyframes tbSpin{to{transform:rotate(360deg)}}
.tb-contrast{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.2);font-size:12.5px}
.tb-contrast .row{display:flex;justify-content:space-between;gap:8px;align-items:center}
.tb-contrast .row .sw{display:inline-flex;align-items:center;gap:6px}
.tb-contrast .row .sw i{width:14px;height:14px;border-radius:4px;border:1px solid rgba(255,255,255,.25);display:inline-block}
.tb-contrast .row small{color:var(--uc-dim);font-size:11px}
.tb-contrast .ok{color:var(--uc-ok)}.tb-contrast .bad{color:var(--uc-bad)}
.tb-fix-contrast{margin-top:8px;padding:8px 14px;font-size:13px;border-color:rgba(251,191,36,.45);color:#fde68a}
.tb-fix-contrast:hover{border-color:var(--uc-warn)}
.tb-reroll .mdi{transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.tb-reroll.rolling .mdi{transform:rotate(360deg)}
.tb-size{margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap}
.tb-size.warn{color:var(--uc-warn)}
.tb-mod{border-top:1px solid var(--uc-line);padding:10px 0}
.tb-mod:first-child{border-top:0;padding-top:0}
.tb-mod h4{margin:0 0 8px;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--uc-dim)}
.tb-mod .tb-grid2 .ucp-field label{font-size:12.5px}
.tb-btnrow{display:flex;flex-wrap:wrap;gap:8px}
.tb-btnrow .ucp-btn{padding:9px 14px;font-size:13px}
.tb-json{margin-top:10px}
.tb-json summary{cursor:pointer;font-size:12.5px;color:var(--uc-dim)}
.tb-pre{margin:8px 0 0;max-height:260px;overflow:auto;padding:12px;border-radius:10px;background:#0b0f16;border:1px solid var(--uc-line);color:#dbe4f0;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-all;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.25) transparent}
.tb-pre::-webkit-scrollbar{width:8px}
.tb-pre::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25);border-radius:4px}
.tb-pre::-webkit-scrollbar-track{background:transparent}
.tb-json summary:hover{color:#fff}
.tb-prev-card{padding:14px}
.tb-prev-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
.tb-prev-bar .tb-reroll{margin-left:auto;padding:8px 12px;font-size:12.5px}
.tb-preview{min-height:320px}
.tb-prev-note{margin-top:10px}
.tb-actions{display:flex;flex-direction:column;gap:10px}
.tb-actions-main{display:flex;flex-wrap:wrap;gap:10px}
.ucp-alert{padding:12px 14px;border-radius:10px;font-size:13.5px;border:1px solid}
.ucp-alert-error{background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.35);color:#fecaca}
.ucp-alert-info{background:rgba(41,182,246,.1);border-color:rgba(41,182,246,.35);color:#cfeeff}
.ucp-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:22px 16px;border:1px dashed var(--uc-line);border-radius:12px;background:rgba(0,0,0,.2);cursor:pointer;text-align:center}
.ucp-drop:hover,.ucp-drop.drag{border-color:var(--uc-blue);background:rgba(41,182,246,.06)}
.ucp-drop .mdi{font-size:28px;color:var(--uc-blue)}
.ucp-thumbs{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
.ucp-thumb{position:relative;width:160px;height:110px;border-radius:10px;overflow:hidden;border:1px solid var(--uc-line);background:#111}
.ucp-thumb img{width:100%;height:100%;object-fit:cover}
.ucp-thumb button{position:absolute;top:4px;right:4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;font-size:14px}
.ucp-success{text-align:center;padding:36px 24px}
.ucp-success-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px}
@media (max-width:1000px){
  .ucp-tb-body{grid-template-columns:1fr}
  .ucp-tb-preview{position:static;order:-1;max-height:none}
  .ucp-tb-preview .tb-prev-card .tb-preview{overflow:visible}
  .tb-preview{min-height:0}
}
@media (max-width:600px){
  .tb-grid2{grid-template-columns:1fr}
  .tb-actions-main .ucp-btn{flex:1 1 auto}
}
</style>

<script>
(function () {
  var root = document.getElementById('ucp-tb');
  if (!root || !window.UcTheme) return;
  var U = window.UcTheme;
  var API = root.getAttribute('data-api');
  var NONCE = root.getAttribute('data-nonce');
  var EDIT_ID = parseInt(root.getAttribute('data-edit-id') || '0', 10) || 0;
  var FORK_ID = parseInt(root.getAttribute('data-fork-id') || '0', 10) || 0;
  var AUTHOR = root.getAttribute('data-author') || '';
  var DRAFT_KEY = 'uc_theme_builder_' + (EDIT_ID ? 'edit_' + EDIT_ID : 'new');

  var SHADOWS = { none: 'none', soft: '0 2px 8px rgba(0, 0, 0, 0.08)', medium: '0 8px 24px rgba(0, 0, 0, 0.18)', deep: '0 18px 48px rgba(0, 0, 0, 0.35)' };
  var WALLS = [
    { key: 'ha', label: 'HA', value: '' },
    { key: 'color', label: 'Colour', value: '__color' },
    { key: 'dusk', label: 'Dusk', value: 'linear-gradient(180deg, #0b1020 0%, #1b2a4a 60%, #3a2f5c 100%) fixed' },
    { key: 'dawn', label: 'Dawn', value: 'linear-gradient(160deg, #fde7ef 0%, #e8eefc 55%, #d9f3f1 100%) fixed' },
    { key: 'slate', label: 'Slate', value: 'radial-gradient(ellipse at 50% 0%, #2b3140 0%, #171a21 65%, #0f1115 100%) fixed' },
    { key: 'mist', label: 'Mist', value: 'linear-gradient(180deg, #f4f6f8 0%, #e6ebf0 100%) fixed' },
    { key: 'aurora', label: 'Aurora', value: 'radial-gradient(60% 50% at 20% 10%, rgba(64, 200, 170, 0.35), transparent 70%), radial-gradient(50% 40% at 80% 20%, rgba(120, 90, 220, 0.4), transparent 70%), #0a0f1a fixed' },
    { key: 'sand', label: 'Sand', value: 'linear-gradient(180deg, #f2ead9 0%, #e6dbc3 100%) fixed' },
    { key: 'image', label: 'Image', value: '__image' },
    { key: 'custom', label: 'Custom', value: '__custom' }
  ];
  // Tokens only: the engine derives the card shell (radius, border, surface
  // background, shadow) from them, so the Simple sliders stay in charge. Card
  // chrome is for the rare override, not a copy of the tokens.
  var STARTERS = [
    { id: 'flat', name: 'Flat', def: { tokens: { surface: 'flat', radius: 12, border_width: 1 } } },
    { id: 'glass', name: 'Glass', def: { tokens: { surface: 'glass', radius: 20, radius_sm: 12, blur: 18, border_width: 1, border_color: 'rgba(255,255,255,0.28)', shadow: '0 12px 32px rgba(0, 0, 0, 0.25)', page_background: 'linear-gradient(160deg, #1b2a4a 0%, #3a2f5c 50%, #0b1020 100%) fixed', palette: { text: '#f3f6fb', text_secondary: 'rgba(243,246,251,0.7)' } } } },
    { id: 'neu-light', name: 'Neumorphic', def: { tokens: { surface: 'neumorphic', radius: 22, radius_sm: 14, shadow: '8px 8px 18px rgba(163, 177, 198, 0.6), -8px -8px 18px rgba(255, 255, 255, 0.9)', page_background: '#e4e8ef', palette: { card_bg: '#e4e8ef', text: '#2b3140', primary: '#4f5ee6' } } } },
    { id: 'neu-dark', name: 'Neu dark', def: { tokens: { surface: 'neumorphic', radius: 22, radius_sm: 14, shadow: '8px 8px 18px rgba(0, 0, 0, 0.55), -8px -8px 18px rgba(255, 255, 255, 0.05)', page_background: '#2a2e35', palette: { card_bg: '#2a2e35', text: '#e8ecf3', primary: '#7aa2ff' } } } },
    { id: 'glossy', name: 'Glossy', def: { tokens: { surface: 'glossy', radius: 16, radius_sm: 10, shadow: '0 6px 20px rgba(0, 0, 0, 0.16)' } } },
    { id: 'outline', name: 'Outline', def: { tokens: { surface: 'outline', radius: 10, radius_sm: 6, border_width: 1, shadow: 'none' } } },
    { id: 'minimal', name: 'Minimal', def: { tokens: { surface: 'minimal', radius: 8, radius_sm: 6, shadow: 'none' } } },
    { id: 'material', name: 'Material', def: { tokens: { surface: 'flat', radius: 12, radius_sm: 20, border_width: 0, shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)', pane_background: '#ece6f0', pane_border: 'none', pane_shadow: 'none', page_background: '#fef7ff', font_family: '"Google Sans Text", "Google Sans", Roboto, sans-serif', palette: { primary: '#6750a4', on_primary: '#ffffff', accent: '#6750a4', card_bg: '#f7f2fa', text: '#1d1b20', text_secondary: '#49454f', divider: '#cac4d0' } }, modules: { spinbox: { button_shape: 'circle' }, activity_feed: { feed_card_style: 'elevated' } } } },
    { id: 'terminal', name: 'Terminal', def: { tokens: { surface: 'outline', radius: 0, radius_sm: 0, border_width: 1, border_color: 'rgba(51,255,102,0.45)', shadow: '0 0 18px rgba(51,255,102,0.18)', font_family: 'ui-monospace, SFMono-Regular, Menlo, monospace', color_filter: 'grayscale(1) sepia(1) hue-rotate(97deg) saturate(3)', page_background: '#020503', palette: { card_bg: '#061008', text: '#33ff66', text_secondary: 'rgba(51,255,102,0.6)', primary: '#33ff66', accent: '#33ff66' } }, card: { card_background: '#061008' } } }
  ];
  // Wallpaper images are written in one canonical shape so the picker can read them back.
  var WALL_IMG_RE = /^(?:linear-gradient\(rgba\(0, ?0, ?0, ?([\d.]+)\), ?rgba\(0, ?0, ?0, ?[\d.]+\)\), ?)?url\("(data:image\/[^"]+)"\) (center|top|bottom) \/ cover no-repeat fixed$/;
  // Room left for the wrapper around the data URI.
  var WALL_IMG_BUDGET = U.LIMITS.page_background - 200;

  var def = { id: '', name: '', version: 1, author: AUTHOR, description: '', tokens: { surface: 'flat', radius: 12 }, card: {}, modules: {} };
  var meta = { tags: '', previewId: 0, previewUrl: '', previewFile: null, previewDirty: false, editStatus: '', starter: '' };
  var BLANK_DEF = JSON.parse(JSON.stringify(def));
  var ui = { mode: 'simple', previewMode: 'light', previewWidth: 'desktop', wall: 'ha', submitting: false };
  var els = {
    err: document.getElementById('tb-error'), notice: document.getElementById('tb-notice'), preview: document.getElementById('tb-preview'),
    json: document.getElementById('tb-json'), tags: document.getElementById('tb-tags'), submit: document.getElementById('tb-submit'),
    submitLabel: document.getElementById('tb-submit-label'), success: document.getElementById('tb-success'),
    shadowPreset: document.getElementById('tb-shadow-preset'), fontPreset: document.getElementById('tb-font-preset'),
    pageBg: document.getElementById('tb-page-bg'), wall: document.getElementById('tb-wall'), wallColor: document.getElementById('tb-wall-color'),
    contrast: document.getElementById('tb-contrast'), fixContrast: document.getElementById('tb-fix-contrast'), thumb: document.getElementById('tb-thumb'), blurField: document.getElementById('tb-blur-field'),
    cshadow: document.getElementById('tb-cshadow'), size: document.getElementById('tb-size'),
    wallFile: document.getElementById('tb-wall-file'), wallImg: document.getElementById('tb-wall-img'), wallInfo: document.getElementById('tb-wall-img-info'),
    wallDim: document.getElementById('tb-wall-dim'), wallDimOut: document.getElementById('tb-wall-dim-out'), wallPos: document.getElementById('tb-wall-pos'), wallBusy: document.getElementById('tb-wall-busy')
  };

  // ------------------------------------------------------------ state utils
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, def); }
  function set(path, value) {
    var keys = path.split('.'), o = def;
    for (var i = 0; i < keys.length - 1; i++) { if (typeof o[keys[i]] !== 'object' || o[keys[i]] === null) o[keys[i]] = {}; o = o[keys[i]]; }
    var last = keys[keys.length - 1];
    if (value === undefined || value === '' || value === null) delete o[last]; else o[last] = value;
    // prune empty palette / card / modules holders so exports stay clean
    if (def.tokens.palette && !Object.keys(def.tokens.palette).length) delete def.tokens.palette;
    if (def.tokens.recipes && !Object.keys(def.tokens.recipes).length) delete def.tokens.recipes;
    Object.keys(def.modules || {}).forEach(function (m) { if (def.modules[m] && !Object.keys(def.modules[m]).length) delete def.modules[m]; });
  }
  function api(path, o) {
    o = o || {};
    var headers = Object.assign({ 'X-WP-Nonce': NONCE, Accept: 'application/json' }, o.headers || {});
    return fetch(API + path, Object.assign({ credentials: 'same-origin' }, o, { headers: headers })).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (!r.ok) throw new Error((body && (body.message || (body.data && body.data.message))) || ('Request failed (' + r.status + ')'));
        return body;
      });
    });
  }
  function showError(msg) { els.err.textContent = msg || ''; els.err.hidden = !msg; if (msg) els.err.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function showNotice(msg) { els.notice.textContent = msg || ''; els.notice.hidden = !msg; }
  function cleanDef() {
    var out = JSON.parse(JSON.stringify(def));
    if (!out.id) out.id = U.slugify(out.name);
    if (out.card && !Object.keys(out.card).length) delete out.card;
    if (out.modules && !Object.keys(out.modules).length) delete out.modules;
    if (!out.author) delete out.author;
    if (!out.description) delete out.description;
    if (!out.icon) delete out.icon;
    if (!out.css) delete out.css;
    return out;
  }
  function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ def: def, tags: meta.tags, wall: ui.wall, starter: meta.starter, t: Date.now() })); } catch (e) {} }
  function loadDraft() { try { var d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); if (d && d.def && d.def.tokens) { def = d.def; meta.tags = d.tags || ''; ui.wall = d.wall || ui.wall; meta.starter = d.starter || ''; return true; } } catch (e) {} return false; }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }

  // --------------------------------------------------------------- binding
  var renderTimer = null;
  function changed(opts) {
    opts = opts || {};
    if (!opts.silent) saveDraft();
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function () { renderPreview(); renderJson(); renderContrast(); syncDerived(); }, opts.now ? 0 : 60);
  }
  function fmtOut(input) {
    var out = input.getAttribute('data-out'); if (!out) return;
    var v = get(input.getAttribute('data-path'));
    var el = document.getElementById(out);
    var text;
    if (v === undefined) text = input.hasAttribute('data-optional') ? (input.id === 'tb-cbr' || input.id === 'tb-cbw' ? 'token' : 'auto') : input.value + 'px';
    else text = input.getAttribute('data-fmt') === 'pct' ? Math.round(v * 100) + '%' : v + 'px';
    // A Card chrome override shadows the token slider; say so instead of looking broken.
    var ov = input.getAttribute('data-override');
    var overridden = ov && get(ov) !== undefined;
    el.innerHTML = U.esc(text) + (overridden ? ' <span class="ov" title="Set in Advanced › Card chrome; clear it there to use this slider">· overridden (' + U.esc(get(ov)) + 'px)</span>' : '');
    input.closest('.tb-range').classList.toggle('is-overridden', !!overridden);
  }
  function bindInputs() {
    root.querySelectorAll('[data-path][data-type]').forEach(function (el) {
      var path = el.getAttribute('data-path'), type = el.getAttribute('data-type');
      if (type === 'seg') {
        el.querySelectorAll('button').forEach(function (b) {
          b.addEventListener('click', function () {
            var v = b.getAttribute('data-value');
            set(path, el.getAttribute('data-default') === v ? undefined : v);
            syncSeg(el); changed({ now: true });
          });
        });
        return;
      }
      var ev = type === 'number' || type === 'text' ? 'input' : 'change';
      el.addEventListener(ev, function () {
        if (type === 'number') set(path, el.value === '' ? undefined : Number(el.value));
        else if (type === 'bool') set(path, el.checked ? true : undefined);
        else if (type === 'tribool') set(path, el.value === '' ? undefined : el.value === 'true');
        else set(path, el.value);
        fmtOut(el); changed();
        // Card chrome overrides change what the token sliders mean; refresh their readouts.
        if (path.indexOf('card.') === 0) root.querySelectorAll('[data-override="' + path + '"]').forEach(fmtOut);
      });
      if (type === 'number' && el.type === 'range' && el.hasAttribute('data-optional')) {
        el.addEventListener('dblclick', function () { set(path, undefined); syncInputs(); changed({ now: true }); });
        el.title = 'Double-click to reset to auto';
      }
    });
    root.querySelectorAll('.tb-color[data-path]').forEach(buildColor);
  }
  function syncSeg(el) {
    var path = el.getAttribute('data-path'), v = get(path);
    if (v === undefined && el.getAttribute('data-default')) v = el.getAttribute('data-default');
    el.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-value') === v); });
  }
  function syncInputs() {
    root.querySelectorAll('[data-path][data-type]').forEach(function (el) {
      var path = el.getAttribute('data-path'), type = el.getAttribute('data-type'), v = get(path);
      if (type === 'seg') return syncSeg(el);
      if (type === 'bool') el.checked = !!v;
      else if (type === 'tribool') el.value = v === undefined ? '' : String(v);
      else if (type === 'number') el.value = v === undefined ? (el.type === 'range' ? (el.getAttribute('data-default-pos') || el.min) : '') : v;
      else el.value = v === undefined ? '' : v;
      fmtOut(el);
    });
    root.querySelectorAll('.tb-color[data-path]').forEach(syncColor);
    els.tags.value = meta.tags;
    // derived selects
    var sh = get('tokens.shadow');
    var preset = sh === undefined ? '' : Object.keys(SHADOWS).find(function (k) { return SHADOWS[k] === sh; }) || 'custom';
    els.shadowPreset.value = preset;
    document.getElementById('tb-shadow').style.display = (preset === 'custom' || ui.mode === 'advanced') ? 'block' : 'none';
    var ff = get('tokens.font_family');
    var fopt = ff === undefined ? '' : (Array.prototype.some.call(els.fontPreset.options, function (o) { return o.value === ff; }) ? ff : 'custom');
    els.fontPreset.value = fopt;
    document.getElementById('tb-font').style.display = (fopt === 'custom' || ui.mode === 'advanced') ? 'block' : 'none';
    syncWall();
    syncDerived();
  }
  function syncDerived() {
    syncRecipeLabels();
    syncStarter();
    syncTint();
    els.blurField.style.display = (get('tokens.surface') === 'glass' || ui.mode === 'advanced') ? 'flex' : 'none';
    els.cshadow.style.display = get('card.card_shadow_enabled') === true ? 'grid' : 'none';
  }

  // colour control: text is the truth; picker follows when it is a hex
  function buildColor(wrap) {
    var path = wrap.getAttribute('data-path');
    wrap.innerHTML = '<input type="color" value="#29b6f6" aria-label="Pick colour"><input type="text" placeholder="Auto (follows HA)" spellcheck="false"><button type="button" class="tb-auto">Auto</button>';
    var pick = wrap.children[0], text = wrap.children[1], auto = wrap.children[2];
    pick.addEventListener('input', function () { text.value = pick.value; commit(); });
    text.addEventListener('input', commit);
    auto.addEventListener('click', function () { text.value = ''; commit(); });
    function commit() {
      var v = text.value.trim();
      if (path === '__wallColor') { set('tokens.page_background', v || undefined); syncColor(wrap); changed(); return; }
      set(path, v || undefined); syncColor(wrap);
      if (path === 'tokens.accent' && tintOn()) {
        var tint = U.parseTint(get('tokens.color_filter')) || {};
        set('tokens.color_filter', U.tintFilter(tintSource(), tint.saturate, tint.brightness));
        document.getElementById('tb-filter').value = get('tokens.color_filter');
      }
      changed();
    }
  }
  // Monochrome tint: a colour filter in the tintFilter shape, keyed to the accent.
  function tintOn() { return !!U.parseTint(get('tokens.color_filter')); }
  function tintSource() { return get('tokens.accent') || get('tokens.palette.primary') || '#33ff66'; }
  function syncTint() {
    var box = document.getElementById('tb-tint');
    box.checked = tintOn();
    var f = get('tokens.color_filter');
    // Some other filter is set (advanced): the toggle would clobber it, so say so.
    box.disabled = !!f && !tintOn();
    box.closest('.ucp-field').title = box.disabled ? 'A custom colour filter is set in Advanced › Effects' : '';
  }
  function syncColor(wrap) {
    var path = wrap.getAttribute('data-path');
    var v = path === '__wallColor' ? get('tokens.page_background') : get(path);
    var pick = wrap.children[0], text = wrap.children[1];
    text.value = v === undefined ? '' : v;
    wrap.classList.toggle('is-auto', v === undefined);
    var c = U.parseColor(v || '');
    if (c) pick.value = '#' + [c.r, c.g, c.b].map(function (n) { return ('0' + n.toString(16)).slice(-2); }).join('');
  }

  // wallpaper chips
  function buildWall() {
    els.wall.innerHTML = WALLS.map(function (w) {
      var bg = w.value === '' ? 'repeating-conic-gradient(#2a2f3a 0 25%, #1a1e26 0 50%) 0 0/12px 12px' : w.value === '__color' ? 'conic-gradient(from 90deg, #f87171, #fbbf24, #4ade80, #29b6f6, #a78bfa, #f87171)' : (w.value === '__custom' || w.value === '__image') ? 'rgba(255,255,255,.06)' : w.value.replace(/\s+fixed\b/g, '');
      return '<button type="button" data-wall="' + w.key + '" style="background:' + bg + '">' + (w.value === '__image' ? '<i class="mdi mdi-image-plus-outline"></i>' : '') + '<span>' + w.label + '</span></button>';
    }).join('');
    els.wall.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-wall');
        var w = WALLS.find(function (x) { return x.key === key; });
        if (w.value === '__image') { els.wallFile.click(); return; } // stays on the current wallpaper until a file lands
        ui.wall = key;
        if (w.value === '') set('tokens.page_background', undefined);
        else if (w.value === '__color') { if (!U.parseColor(get('tokens.page_background') || '')) set('tokens.page_background', ui.previewMode === 'dark' ? '#111318' : '#f2f4f8'); }
        else if (w.value !== '__custom') set('tokens.page_background', w.value);
        syncWall(); syncColor(els.wallColor); els.pageBg.value = get('tokens.page_background') || ''; changed({ now: true });
      });
    });
  }
  function wallImage() { var m = WALL_IMG_RE.exec(get('tokens.page_background') || ''); return m ? { dim: m[1] ? Math.round(parseFloat(m[1]) * 100) : 0, uri: m[2], pos: m[3] } : null; }
  function setWallImage(uri, dim, pos) {
    var v = 'url("' + uri + '") ' + (pos || 'center') + ' / cover no-repeat fixed';
    if (dim > 0) v = 'linear-gradient(rgba(0,0,0,' + (dim / 100) + '), rgba(0,0,0,' + (dim / 100) + ')), ' + v;
    set('tokens.page_background', v);
    syncWall(); els.pageBg.value = v; changed({ now: true });
  }
  function fmtBytes(n) { return n >= 1024 * 100 ? Math.round(n / 1024) + ' KB' : n >= 1024 ? (Math.round(n / 102.4) / 10) + ' KB' : n + ' B'; }
  function dataUriBytes(uri) { var i = uri.indexOf(','); var body = i < 0 ? uri : uri.slice(i + 1); return /;base64,/.test(uri) ? Math.round(body.length * 3 / 4) : body.length; }
  function syncWall() {
    var v = get('tokens.page_background');
    var img = wallImage();
    var match = WALLS.find(function (w) { return w.value === (v || ''); });
    if (img) ui.wall = 'image'; else if (match) ui.wall = match.key; else if (U.parseColor(v || '')) ui.wall = 'color'; else ui.wall = 'custom';
    els.wall.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-wall') === ui.wall); });
    els.wallColor.hidden = ui.wall !== 'color';
    els.wallImg.hidden = !img;
    if (img) {
      var kind = /^data:image\/svg/.test(img.uri) ? 'SVG' : /^data:image\/webp/.test(img.uri) ? 'WebP' : /^data:image\/jpeg/.test(img.uri) ? 'JPEG' : 'Image';
      els.wallInfo.innerHTML = '<i class="mdi mdi-image-check-outline"></i> ' + kind + ' wallpaper · ' + fmtBytes(dataUriBytes(img.uri)) + ' <span style="color:var(--uc-dim)">(' + U.esc((img.uri.length).toLocaleString()) + ' of ' + U.LIMITS.page_background.toLocaleString() + ' characters)</span>';
      els.wallDim.value = img.dim; els.wallDimOut.textContent = img.dim + '%'; els.wallPos.value = img.pos;
    }
    els.pageBg.style.display = (ui.wall === 'custom' || ui.mode === 'advanced') ? 'block' : 'none';
  }

  // Wallpaper upload. Raster: drawn to a canvas, scaled down and re-encoded
  // (WebP where the browser can, else JPEG), stepping quality then size until
  // it fits the budget. SVG: scanned like any inline artwork, minified,
  // percent-encoded the way the card's own svgDataUrl() does.
  function wallFileChosen(file) {
    if (!file) return;
    showError('');
    els.wallBusy.hidden = false;
    var done = function (uri) {
      els.wallBusy.hidden = true;
      var cur = wallImage();
      setWallImage(uri, cur ? cur.dim : 0, cur ? cur.pos : 'center');
    };
    var fail = function (msg) { els.wallBusy.hidden = true; showError(msg); };
    if (/svg/i.test(file.type) || /\.svg$/i.test(file.name)) {
      var rd = new FileReader();
      rd.onload = function () {
        var svg = String(rd.result || '');
        var bad = U.svgProblems(svg);
        if (bad.length) return fail('That SVG cannot be used as a wallpaper: it contains ' + bad.join(', ') + '.');
        if (!/<svg[\s>]/i.test(svg)) return fail('That file does not look like an SVG.');
        var compact = svg.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[\s\S]*?>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
        var encoded = compact.replace(/[%<>#"'(){}\[\]\\]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'); }).replace(/[^\x20-\x7e]/g, function (c) { return encodeURIComponent(c); });
        var uri = 'data:image/svg+xml,' + encoded;
        if (uri.length > WALL_IMG_BUDGET) return fail('That SVG is ' + fmtBytes(compact.length) + ' after minifying; wallpapers must fit in about ' + fmtBytes(WALL_IMG_BUDGET * 0.75) + '. Simplify it, or export it as a picture and upload that instead.');
        done(uri);
      };
      rd.onerror = function () { fail('Could not read that file.'); };
      rd.readAsText(file);
      return;
    }
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) return fail('Use a PNG, JPEG, WebP, GIF or SVG.');
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      URL.revokeObjectURL(url);
      var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      var webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      var type = webp ? 'image/webp' : 'image/jpeg';
      var longest = Math.max(img.naturalWidth, img.naturalHeight) || 1;
      var sizes = [1920, 1600, 1280, 1024, 800, 640].filter(function (s, i, arr) { return s <= longest || i === arr.length - 1 || arr[i - 1] > longest; });
      if (longest < 640) sizes = [longest];
      var qualities = [0.84, 0.74, 0.64, 0.54, 0.45];
      for (var si = 0; si < sizes.length; si++) {
        var scale = Math.min(1, sizes[si] / longest);
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        if (!webp) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height); } // JPEG has no alpha
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for (var qi = 0; qi < qualities.length; qi++) {
          var out = canvas.toDataURL(type, qualities[qi]);
          if (out.length <= WALL_IMG_BUDGET) {
            done(out);
            showNotice('Wallpaper stored at ' + canvas.width + '×' + canvas.height + ' as ' + (webp ? 'WebP' : 'JPEG') + ' (' + fmtBytes(dataUriBytes(out)) + ').');
            setTimeout(function () { showNotice(''); }, 4500);
            return;
          }
        }
      }
      fail('Could not shrink that image enough to fit. Try a simpler picture or crop it first.');
    };
    img.onerror = function () { URL.revokeObjectURL(url); fail('Could not decode that image.'); };
    img.src = url;
  }

  // starters
  function buildStarters() {
    document.getElementById('tb-starters').innerHTML = STARTERS.map(function (s) {
      return '<button type="button" class="tb-starter" data-starter="' + s.id + '">' + U.swatchHtml(Object.assign({ id: s.id, name: s.name, version: 1 }, s.def), s.def.tokens.palette && U.parseColor(s.def.tokens.palette.card_bg || '') && !isLightHex(s.def.tokens.palette.card_bg) ? 'dark' : 'light') + '<span>' + s.name + '</span></button>';
    }).join('');
    document.querySelectorAll('.tb-starter').forEach(function (b) {
      b.addEventListener('click', function () { applyStarter(b.getAttribute('data-starter')); });
    });
    document.getElementById('tb-reset').addEventListener('click', function () {
      var s = starterOf(meta.starter);
      var what = s ? 'the ' + s.name + ' starter' : 'a blank theme';
      if (!confirm('Reset surface, colours, layers and module defaults to ' + what + '? Your name, description and tags stay.')) return;
      applyStarter(meta.starter);
    });
  }
  function starterOf(id) { return STARTERS.find(function (x) { return x.id === id; }) || null; }
  /** Replace everything but identity with a starter's definition ('' = blank). */
  function applyStarter(id) {
    var s = starterOf(id);
    var keep = { id: def.id, name: def.name, description: def.description, author: def.author, icon: def.icon, version: def.version };
    def = Object.assign({}, keep, JSON.parse(JSON.stringify(s ? s.def : { tokens: BLANK_DEF.tokens, card: {}, modules: {} })));
    def.card = def.card || {}; def.modules = def.modules || {};
    meta.starter = s ? s.id : '';
    syncInputs(); changed({ now: true });
  }
  /** JSON with sorted keys and no undefined/empty leaves, so edit order does not count as a change. */
  function stableJson(v) {
    if (Array.isArray(v)) return '[' + v.map(stableJson).join(',') + ']';
    if (v && typeof v === 'object') {
      return '{' + Object.keys(v).sort().filter(function (k) { return v[k] !== undefined && !(v[k] && typeof v[k] === 'object' && !Array.isArray(v[k]) && !Object.keys(v[k]).length); }).map(function (k) { return JSON.stringify(k) + ':' + stableJson(v[k]); }).join(',') + '}';
    }
    return JSON.stringify(v);
  }
  function syncStarter() {
    var s = starterOf(meta.starter);
    document.querySelectorAll('.tb-starter').forEach(function (b) { b.classList.toggle('active', !!s && b.getAttribute('data-starter') === s.id); });
    var btn = document.getElementById('tb-reset');
    // Show the reset once the theme has moved away from where it started.
    var origin = s ? Object.assign({}, s.def, { card: s.def.card || {}, modules: s.def.modules || {} }) : { tokens: BLANK_DEF.tokens, card: {}, modules: {} };
    var current = { tokens: def.tokens, card: def.card || {}, modules: def.modules || {}, css: def.css };
    var same = stableJson(origin) === stableJson(current);
    btn.hidden = same;
    btn.querySelector('span').textContent = s ? 'Reset to ' + s.name : 'Reset to blank';
  }
  function isLightHex(v) { var c = U.parseColor(v); return c ? (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255 > 0.5 : true; }

  // surfaces (recipe per role)
  var ROLE_LABELS = { control: 'Controls', track: 'Tracks', fill: 'Fills', pane: 'Panes' };
  var ROLE_HINTS = { control: 'Buttons, chips, spinbox and popup triggers', track: 'Bar and slider tracks', fill: 'The filled part of bars and sliders', pane: 'Rows, tiles and inner boxes' };
  function buildRecipes() {
    document.getElementById('tb-recipes').innerHTML = U.ROLES.map(function (role) {
      var id = 'tb-recipe-' + role;
      return '<div class="ucp-field"><label for="' + id + '">' + ROLE_LABELS[role] + '</label><select id="' + id + '" data-path="tokens.recipes.' + role + '" data-type="text" data-role="' + role + '"><option value="">From surface</option>' + U.ROLE_RECIPES[role].map(function (r) { return '<option value="' + r + '">' + r + '</option>'; }).join('') + '</select><span class="ucp-hint">' + ROLE_HINTS[role] + '</span></div>';
    }).join('');
  }
  /** "From surface (glass)" / "Theme surface (glass)" labels follow the current surface and recipes. */
  function syncRecipeLabels() {
    var derived = U.recipesFromSurface(get('tokens.surface'));
    var rc = U.resolveRecipes(def);
    root.querySelectorAll('#tb-recipes select[data-role]').forEach(function (sel) { sel.options[0].textContent = 'From surface (' + derived[sel.getAttribute('data-role')] + ')'; });
    Object.keys(U.SURFACE_FIELD_ROLES).forEach(function (k) {
      var sel = document.getElementById('tb-m-' + k.replace('.', '-'));
      if (sel) sel.options[0].textContent = 'Theme surface (' + rc[U.SURFACE_FIELD_ROLES[k]] + ')';
    });
  }

  // module defaults form
  function buildModules() {
    var byModule = {};
    U.MODULE_FIELDS.forEach(function (f) { (byModule[f.moduleType] = byModule[f.moduleType] || { label: f.moduleLabel, fields: [] }).fields.push(f); });
    document.getElementById('tb-modules').innerHTML = Object.keys(byModule).map(function (m) {
      var g = byModule[m];
      return '<div class="tb-mod"><h4>' + U.esc(g.label) + '</h4><div class="tb-grid2">' + g.fields.map(function (f) {
        var id = 'tb-m-' + m + '-' + f.key, path = 'modules.' + m + '.' + f.key;
        if (f.kind === 'number') return '<div class="ucp-field"><label for="' + id + '">' + U.esc(f.label) + '</label><input type="number" id="' + id + '" min="' + f.min + '" max="' + f.max + '" data-path="' + path + '" data-type="number" placeholder="default"></div>';
        return '<div class="ucp-field"><label for="' + id + '">' + U.esc(f.label) + '</label><select id="' + id + '" data-path="' + path + '" data-type="text"><option value="">Module default</option>' + f.options.map(function (o) { return '<option value="' + U.esc(o.value) + '">' + U.esc(o.label) + '</option>'; }).join('') + '</select></div>';
      }).join('') + '</div></div>';
    }).join('');
  }

  // ------------------------------------------------------------- rendering
  function renderPreview() {
    U.renderPreview(els.preview, cleanDef(), { mode: ui.previewMode, width: ui.previewWidth === 'phone' ? 400 : null });
  }
  function renderJson() {
    var json = JSON.stringify(cleanDef(), null, 2);
    // A wallpaper is thousands of characters of base64; the JSON view shows it folded.
    els.json.textContent = json.replace(/(data:image\/[a-z+]+;base64,)[A-Za-z0-9+/=]{80,}/g, function (m, head) { return head + '… (' + fmtBytes(dataUriBytes(m)) + ' inline)'; }).replace(/(data:image\/svg\+xml,)[^"]{400,}/g, function (m, head) { return head + '… (' + fmtBytes(m.length - head.length) + ' inline SVG)'; });
    var bytes = JSON.stringify(cleanDef()).length;
    els.size.textContent = fmtBytes(bytes) + ' theme';
    els.size.classList.toggle('warn', bytes > U.LIMITS.definition * 0.8);
    els.size.title = 'Stored and synced size. Limit ' + fmtBytes(U.LIMITS.definition) + '; most of it is usually the wallpaper.';
  }
  // ------------------------------------------------------------- contrast
  // Flatten a translucent colour onto what sits behind it (same maths the eye does).
  function over(fg, bg) {
    if (!fg) return null;
    if (fg.a >= 1 || !bg) return fg;
    var a = fg.a;
    return { r: Math.round(fg.r * a + bg.r * (1 - a)), g: Math.round(fg.g * a + bg.g * (1 - a)), b: Math.round(fg.b * a + bg.b * (1 - a)), a: 1 };
  }
  /**
   * The colours the preview actually shows, pinned or derived the way the
   * card engine derives them (deriveCompanionVars), each tagged with whether
   * the author chose it. Used for both the report and the fixer.
   */
  function effectiveColors() {
    var t = def.tokens || {}, p = t.palette || {}, base = U.HA_BASE[ui.previewMode];
    var page = U.parseColor(t.page_background || '') || U.parseColor(base['--primary-background-color']);
    var cardRaw = U.parseColor(p.card_bg || '') || U.parseColor((def.card && def.card.card_background) || '');
    var pinnedBg = !!cardRaw;
    var bg = over(cardRaw || U.parseColor(base['--card-background-color']), page);
    var textPinned = !!U.parseColor(p.text || '');
    var text = over(U.parseColor(p.text || '') || (pinnedBg ? U.contrastText(bg) : U.parseColor(base['--primary-text-color'])), bg);
    var secPinned = !!U.parseColor(p.text_secondary || '');
    var sec = over(U.parseColor(p.text_secondary || '') || (textPinned || pinnedBg ? { r: text.r, g: text.g, b: text.b, a: 0.7 } : U.parseColor(base['--secondary-text-color'])), bg);
    var primPinned = !!U.parseColor(p.primary || '');
    var prim = over(U.parseColor(p.primary || '') || U.parseColor(base['--primary-color']), bg);
    var onPPinned = !!U.parseColor(p.on_primary || '');
    var onP = over(U.parseColor(p.on_primary || '') || (primPinned ? U.contrastText(prim) : U.parseColor(base['--text-primary-color'])), prim);
    var accPinned = !!U.parseColor(t.accent || '');
    var acc = over(U.parseColor(t.accent || '') || prim, bg);
    var any = pinnedBg || textPinned || secPinned || primPinned || onPPinned || accPinned;
    return {
      any: any, bg: bg,
      rows: [
        { key: 'text', label: 'Text on card', fg: text, bg: bg, min: 4.5, pinned: textPinned, path: 'tokens.palette.text' },
        { key: 'sec', label: 'Secondary text on card', fg: sec, bg: bg, min: 4.5, pinned: secPinned, path: 'tokens.palette.text_secondary' },
        { key: 'onp', label: 'Text on primary', fg: onP, bg: prim, min: 4.5, pinned: onPPinned, path: 'tokens.palette.on_primary' },
        { key: 'acc', label: 'Accent on card (fills, icons)', fg: acc, bg: bg, min: 3, pinned: accPinned, path: accPinned ? 'tokens.accent' : 'tokens.palette.primary' }
      ]
    };
  }
  function hex(c) { return '#' + [c.r, c.g, c.b].map(function (n) { return ('0' + Math.max(0, Math.min(255, Math.round(n))).toString(16)).slice(-2); }).join(''); }
  /** Nudge fg toward black or white (whichever gains contrast) until it clears `min`; keeps the hue. */
  function ensureContrast(fg, bg, min) {
    if (U.contrast(fg, bg) >= min) return fg;
    var toWhite = U.lum(bg) < 0.4;
    var target = toWhite ? { r: 255, g: 255, b: 255, a: 1 } : { r: 0, g: 0, b: 0, a: 1 };
    var c = { r: fg.r, g: fg.g, b: fg.b, a: 1 };
    for (var i = 0; i < 24 && U.contrast(c, bg) < min; i++) c = U.mix(c, target, 0.12);
    return U.contrast(c, bg) >= min ? c : target;
  }
  function renderContrast() {
    var e = effectiveColors();
    els.contrast.hidden = !e.any;
    els.fixContrast.hidden = true;
    if (!e.any) return;
    var failing = 0;
    els.contrast.innerHTML = e.rows.map(function (r) {
      var ratio = U.contrast(r.fg, r.bg), ok = ratio >= r.min;
      if (!ok) failing++;
      return '<div class="row"><span class="sw"><i style="background:' + hex(r.bg) + '"></i><i style="background:' + hex(r.fg) + '"></i>' + r.label + (r.pinned ? '' : ' <small>auto</small>') + '</span><b class="' + (ok ? 'ok' : 'bad') + '">' + (Math.round(ratio * 10) / 10) + ':1 ' + (ok ? (r.min === 3 ? 'AA' : 'AA') : 'below AA') + '</b></div>';
    }).join('') + '<div class="row"><small>Checked against the ' + ui.previewMode + ' Home Assistant theme; text needs 4.5:1, UI colour 3:1.</small></div>';
    els.fixContrast.hidden = failing === 0;
  }
  /** Pin whatever fails to the nearest colour of the same hue that passes. */
  function fixContrast() {
    var changedAny = false;
    // Fixing one row can move a colour another row depends on (the accent
    // row may retint Primary, which Text-on-primary sits on), so re-derive
    // after every change and fix rows in dependency order until all pass.
    var ORDER = { text: 0, sec: 1, acc: 2, onp: 3 };
    for (var pass = 0; pass < 8; pass++) {
      var rows = effectiveColors().rows.slice().sort(function (a, b) { return ORDER[a.key] - ORDER[b.key]; });
      var r = null;
      for (var k = 0; k < rows.length; k++) if (U.contrast(rows[k].fg, rows[k].bg) < rows[k].min) { r = rows[k]; break; }
      if (!r) break;
      var fixed = ensureContrast(r.fg, r.bg, r.min);
      if (r.key === 'onp' && U.contrast(fixed, r.bg) < r.min) {
        // Neither black nor white reads on this primary (a mid-tone): keep
        // the hue and deepen or lift the primary itself until the text passes.
        var ink = U.contrastText(r.bg), prim = { r: r.bg.r, g: r.bg.g, b: r.bg.b, a: 1 };
        var toward = ink.r === 255 ? { r: 0, g: 0, b: 0, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
        for (var i = 0; i < 24 && U.contrast(ink, prim) < r.min; i++) prim = U.mix(prim, toward, 0.1);
        set('tokens.palette.primary', hex(prim));
        fixed = ink;
      }
      set(r.path, hex(fixed));
      changedAny = true;
    }
    if (changedAny) { syncInputs(); changed({ now: true }); showNotice('Pinned the failing colours to the nearest shade that meets WCAG AA. Adjust them further if you like.'); setTimeout(function () { showNotice(''); }, 4500); }
  }

  // ----------------------------------------------------------------- mode
  function setMode(mode) {
    ui.mode = mode; root.classList.toggle('advanced', mode === 'advanced');
    document.querySelectorAll('.tb-mode-btn').forEach(function (b) { var on = b.getAttribute('data-mode') === mode; b.classList.toggle('active', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    syncInputs();
    try { localStorage.setItem('uc_theme_builder_mode', mode); } catch (e) {}
  }

  // -------------------------------------------------------------- preview img
  function renderThumb() {
    els.thumb.innerHTML = meta.previewUrl ? '<div class="ucp-thumb"><img src="' + U.esc(meta.previewUrl) + '" alt=""><button type="button" aria-label="Remove">×</button></div>' : '';
    var rm = els.thumb.querySelector('button');
    if (rm) rm.addEventListener('click', function () { meta.previewId = 0; meta.previewUrl = ''; meta.previewFile = null; meta.previewDirty = true; renderThumb(); });
  }
  function pickFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    meta.previewFile = file; meta.previewId = 0; meta.previewDirty = true;
    var rd = new FileReader(); rd.onload = function () { meta.previewUrl = rd.result; renderThumb(); }; rd.readAsDataURL(file);
  }

  // ----------------------------------------------------------------- submit
  async function submit() {
    if (ui.submitting) return;
    showError('');
    var name = (def.name || '').trim(), desc = (def.description || '').trim();
    if (!name) return showError('Give the theme a name.');
    if (!desc) return showError('Add a short description so people know what the theme is for.');
    var clean = U.sanitize(cleanDef());
    if (clean.problems.length) return showError(clean.problems.join(' · '));
    ui.submitting = true; els.submit.disabled = true;
    try {
      var previewId = meta.previewId;
      if (meta.previewFile) {
        els.submitLabel.textContent = 'Uploading preview…';
        var fd = new FormData(); fd.append('photo', meta.previewFile);
        var up = await api('/media', { method: 'POST', body: fd });
        if (!up || !up.id) throw new Error('Preview upload failed');
        previewId = up.id; meta.previewId = up.id; meta.previewFile = null;
      }
      els.submitLabel.textContent = EDIT_ID ? 'Saving…' : 'Submitting…';
      var payload = { name: name, description: desc, tags: meta.tags, definition: clean.theme };
      if (meta.previewDirty || previewId) payload.preview_image_id = previewId || 0;
      var res = await api(EDIT_ID ? '/themes/' + EDIT_ID : '/themes', { method: EDIT_ID ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      clearDraft();
      document.getElementById('tb-success-title').textContent = EDIT_ID ? 'Theme saved' : 'Theme submitted';
      document.getElementById('tb-success-body').textContent = (res && res.message) || (EDIT_ID ? 'Your changes are in.' : 'It is in the review queue. Meanwhile it already shows under My Themes here and in the Hub.');
      els.success.hidden = false;
      document.querySelector('.tb-actions').hidden = true;
      els.success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      showError(e.message || 'Something went wrong.');
    } finally {
      ui.submitting = false; els.submit.disabled = false; els.submitLabel.textContent = EDIT_ID ? 'Save changes' : 'Submit for review';
    }
  }

  // ------------------------------------------------------------------ import
  function importDefinition(raw, opts) {
    opts = opts || {};
    var obj = raw;
    if (typeof raw === 'string') { try { obj = JSON.parse(raw); } catch (e) { return showError('That is not valid JSON.'); } }
    if (obj && obj.definition && obj.definition.tokens) obj = obj.definition; // catalog item
    if (!obj || !obj.tokens) return showError('No theme found in that JSON (expected a "tokens" object).');
    var clean = U.sanitize(obj);
    def = clean.theme; def.card = def.card || {}; def.modules = def.modules || {};
    if (opts.fork) { def.name = (def.name || 'Theme') + ' remix'; def.id = U.slugify(def.name); def.author = AUTHOR; delete def.preview; }
    if (!def.author) def.author = AUTHOR;
    syncInputs(); changed({ now: true });
    if (clean.problems.length) showNotice('Imported with adjustments: ' + clean.problems.join(' · ')); else showNotice('');
  }
  function download() {
    var blob = new Blob([JSON.stringify(cleanDef(), null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (U.slugify(def.name) || 'theme') + '.ultratheme.json'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  // ------------------------------------------------------------------- wire
  function wire() {
    document.querySelectorAll('.tb-mode-btn').forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
    els.tags.addEventListener('input', function () { meta.tags = els.tags.value; saveDraft(); });
    els.shadowPreset.addEventListener('change', function () {
      var v = els.shadowPreset.value;
      if (v === 'custom') { document.getElementById('tb-shadow').style.display = 'block'; document.getElementById('tb-shadow').focus(); return; }
      set('tokens.shadow', v === '' ? undefined : SHADOWS[v]); syncInputs(); changed({ now: true });
    });
    els.fontPreset.addEventListener('change', function () {
      var v = els.fontPreset.value;
      if (v === 'custom') { document.getElementById('tb-font').style.display = 'block'; document.getElementById('tb-font').focus(); return; }
      set('tokens.font_family', v || undefined); syncInputs(); changed({ now: true });
    });
    els.pageBg.addEventListener('input', function () { syncWall(); });
    document.querySelectorAll('#tb-prev-mode button').forEach(function (b) { b.addEventListener('click', function () { ui.previewMode = b.getAttribute('data-value'); document.querySelectorAll('#tb-prev-mode button').forEach(function (x) { x.classList.toggle('active', x === b); }); changed({ now: true, silent: true }); }); });
    document.querySelectorAll('#tb-prev-width button').forEach(function (b) { b.addEventListener('click', function () { ui.previewWidth = b.getAttribute('data-value'); document.querySelectorAll('#tb-prev-width button').forEach(function (x) { x.classList.toggle('active', x === b); }); changed({ now: true, silent: true }); }); });
    var reroll = document.getElementById('tb-reroll');
    reroll.addEventListener('click', function () {
      U.reroll();
      reroll.classList.remove('rolling'); void reroll.offsetWidth; reroll.classList.add('rolling');
      changed({ now: true, silent: true });
      if (!U.usesSeeds(cleanDef())) {
        showNotice('New hue and seeds dealt, but nothing in this theme reads them yet. Reference var(--uc-card-hue) or var(--uc-card-seed-1..3) in Custom CSS (Advanced) to give every card its own variation.');
        setTimeout(function () { showNotice(''); }, 6000);
      }
    });
    els.fixContrast.addEventListener('click', fixContrast);
    els.wallFile.addEventListener('change', function (e) { wallFileChosen(e.target.files && e.target.files[0]); e.target.value = ''; });
    document.getElementById('tb-wall-replace').addEventListener('click', function () { els.wallFile.click(); });
    document.getElementById('tb-wall-remove').addEventListener('click', function () { set('tokens.page_background', undefined); syncWall(); els.pageBg.value = ''; changed({ now: true }); });
    els.wallDim.addEventListener('input', function () { var img = wallImage(); if (!img) return; els.wallDimOut.textContent = els.wallDim.value + '%'; setWallImage(img.uri, Number(els.wallDim.value), img.pos); });
    els.wallPos.addEventListener('change', function () { var img = wallImage(); if (img) setWallImage(img.uri, img.dim, els.wallPos.value); });
    // Dropping a picture on the wallpaper chips uploads it.
    els.wall.addEventListener('dragover', function (e) { e.preventDefault(); els.wall.classList.add('drag'); });
    els.wall.addEventListener('dragleave', function () { els.wall.classList.remove('drag'); });
    els.wall.addEventListener('drop', function (e) { e.preventDefault(); els.wall.classList.remove('drag'); var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) { e.stopPropagation(); wallFileChosen(f); } });
    document.getElementById('tb-wall-budget').textContent = fmtBytes(WALL_IMG_BUDGET * 0.75);
    els.submit.addEventListener('click', submit);
    document.getElementById('tb-export').addEventListener('click', download);
    document.getElementById('tb-copy').addEventListener('click', function () {
      navigator.clipboard.writeText(JSON.stringify(cleanDef(), null, 2)).then(function () { showNotice('Theme JSON copied. Paste it into Hub › Themes › Import.'); setTimeout(function () { showNotice(''); }, 3500); });
    });
    document.getElementById('tb-import').addEventListener('click', function () { document.getElementById('tb-import-file').click(); });
    document.getElementById('tb-import-file').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var rd = new FileReader(); rd.onload = function () { importDefinition(String(rd.result)); }; rd.readAsText(f); e.target.value = '';
    });
    var drop = document.getElementById('tb-drop'), file = document.getElementById('tb-file');
    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    file.addEventListener('change', function (e) { pickFile(e.target.files && e.target.files[0]); e.target.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { pickFile(e.dataTransfer.files && e.dataTransfer.files[0]); });
    // dropping a .json anywhere on the panel imports it
    var panel = document.getElementById('tb-panel');
    panel.addEventListener('dragover', function (e) { if (e.dataTransfer && Array.prototype.some.call(e.dataTransfer.items || [], function (i) { return i.type === 'application/json'; })) e.preventDefault(); });
    panel.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f && /json$/i.test(f.name)) { e.preventDefault(); var rd = new FileReader(); rd.onload = function () { importDefinition(String(rd.result)); }; rd.readAsText(f); } });
  }

  async function boot() {
    buildWall(); buildStarters(); buildRecipes(); buildModules(); bindInputs(); wire();
    document.getElementById('tb-tint').addEventListener('change', function (e) {
      set('tokens.color_filter', e.target.checked ? U.tintFilter(tintSource()) : undefined);
      syncInputs(); changed({ now: true });
    });
    var savedMode = null; try { savedMode = localStorage.getItem('uc_theme_builder_mode'); } catch (e) {}
    ui.previewMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.querySelectorAll('#tb-prev-mode button').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-value') === ui.previewMode); });
    try {
      if (EDIT_ID) {
        var t = await api('/themes/' + EDIT_ID);
        var d = (t.pending_revision && t.pending_revision.definition) || t.definition || {};
        d.name = (t.pending_revision && t.pending_revision.name) || t.name; d.description = (t.pending_revision && t.pending_revision.description) || t.description;
        meta.tags = (t.pending_revision && t.pending_revision.tags) || (t.tags || []).join(', ');
        meta.previewId = 0; meta.previewUrl = t.preview || ''; meta.previewDirty = false; // existing image is kept unless changed
        meta.editStatus = t.review_status;
        if (d.id) d.id = String(d.id).replace(/^wp-/, '');
        importDefinition(d);
        if (t.has_pending_revision) showNotice('You are editing a queued update. The live version stays published until this is approved.');
        else if (t.status === 'publish') showNotice('This theme is live. Saving queues an update for review; the live version stays until it is approved.');
      } else if (FORK_ID) {
        var src = await api('/themes/' + FORK_ID);
        importDefinition(src.definition || src, { fork: true });
        showNotice('Remixing "' + (src.name || 'theme') + '" by ' + (src.author || 'unknown') + '. Change what you like and submit it as your own.');
      } else if (loadDraft()) {
        showNotice('Restored your unsaved draft.');
        setTimeout(function () { showNotice(''); }, 4000);
      }
    } catch (e) { showError(e.message || 'Could not load the theme.'); }
    if (!def.author) def.author = AUTHOR;
    setMode(savedMode === 'advanced' ? 'advanced' : 'simple');
    renderThumb();
    changed({ now: true, silent: true });
  }
  boot();
})();
</script>
<?php
get_footer();
