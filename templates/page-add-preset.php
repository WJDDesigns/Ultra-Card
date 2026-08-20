<?php
/**
 * Native Add / Edit Preset form — replaces Gravity Forms on /add-preset/
 *
 * @package UltraCardIntegration
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!is_user_logged_in()) {
    wp_safe_redirect(wp_login_url(home_url('/add-preset/')));
    exit;
}

$user = wp_get_current_user();
$edit_id = isset($_GET['id']) ? absint($_GET['id']) : 0;
$rest_nonce = wp_create_nonce('wp_rest');
$api_base = esc_url_raw(rest_url('ultra-card/v1'));
$version = defined('ULTRA_CARD_INTEGRATION_VERSION') ? ULTRA_CARD_INTEGRATION_VERSION : '';
$categories = function_exists('uc_preset_module_categories') ? uc_preset_module_categories() : array(
    array('value' => 'layout', 'label' => 'Layout', 'icon' => 'mdi-view-dashboard-outline'),
    array('value' => 'content', 'label' => 'Content', 'icon' => 'mdi-text-box-outline'),
    array('value' => 'data', 'label' => 'Data', 'icon' => 'mdi-chart-box-outline'),
    array('value' => 'interactive', 'label' => 'Controls', 'icon' => 'mdi-gesture-tap'),
    array('value' => 'input', 'label' => 'Inputs', 'icon' => 'mdi-form-textbox'),
    array('value' => 'media', 'label' => 'Media', 'icon' => 'mdi-image-multiple-outline'),
);

$ucp_page_title = $edit_id ? 'Edit preset' : 'Add preset';
get_header();
$partial = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/partials/ucp-shared-head.php';
if (file_exists($partial)) {
    include $partial;
}
?>
<div class="ucp ucp-add" id="ucp-add"
  data-api="<?php echo esc_attr($api_base); ?>"
  data-nonce="<?php echo esc_attr($rest_nonce); ?>"
  data-edit-id="<?php echo (int) $edit_id; ?>"
  data-dashboard="<?php echo esc_url(home_url('/dashboard/#presets')); ?>">
  <header class="ucp-hero">
    <div class="ucp-hero-glow" aria-hidden="true"></div>
    <div class="ucp-wrap">
      <div class="ucp-eyebrow"><span class="ucp-pulse"></span> <?php echo $edit_id ? 'Edit preset' : 'Submit a preset'; ?><?php if ($version) : ?> · v<?php echo esc_html($version); ?><?php endif; ?></div>
      <h1 class="ucp-h1" id="ucp-add-title"><?php echo $edit_id ? 'Update your layout.' : 'Share a layout.'; ?><br><span class="ucp-grad-text"><?php echo $edit_id ? 'Queued for review.' : 'Ready for the gallery.'; ?></span></h1>
      <p class="ucp-sub">Same fields as the Ultra Card Hub. Prefer submitting from Home Assistant when you have the card open — code arrives prefilled and privacy-sanitized.</p>
    </div>
  </header>

  <div class="ucp-wrap ucp-add-body">
    <aside class="ucp-progress" id="ucp-progress" aria-label="Required fields">
      <div class="ucp-progress-label">Required <b id="ucp-prog-n">0</b>/5</div>
      <div class="ucp-progress-bar"><i id="ucp-prog-fill"></i></div>
      <ul class="ucp-progress-list">
        <li data-k="title"><i class="mdi mdi-circle-outline"></i> Title</li>
        <li data-k="description"><i class="mdi mdi-circle-outline"></i> Description</li>
        <li data-k="category"><i class="mdi mdi-circle-outline"></i> Category</li>
        <li data-k="code"><i class="mdi mdi-circle-outline"></i> Preset code</li>
        <li data-k="featured"><i class="mdi mdi-circle-outline"></i> Featured image</li>
      </ul>
      <a class="ucp-btn ucp-btn-ghost ucp-progress-dash" href="<?php echo esc_url(home_url('/dashboard/#presets')); ?>"><i class="mdi mdi-view-dashboard-outline"></i> My presets</a>
    </aside>

    <main class="ucp-add-main">
      <div id="ucp-form-error" class="ucp-alert ucp-alert-error" hidden></div>
      <div id="ucp-success" class="ucp-card ucp-success" hidden>
        <h2 id="ucp-success-title">Preset submitted</h2>
        <p id="ucp-success-body" class="ucp-hint" style="margin-top:8px"></p>
        <div class="ucp-success-actions">
          <a class="ucp-btn ucp-btn-blue" href="<?php echo esc_url(home_url('/dashboard/#presets')); ?>"><i class="mdi mdi-view-dashboard-outline"></i> Open My Presets</a>
          <a class="ucp-btn ucp-btn-ghost" href="<?php echo esc_url(home_url('/add-preset/')); ?>" id="ucp-another"><i class="mdi mdi-plus"></i> Submit another</a>
        </div>
      </div>

      <form id="ucp-preset-form" class="ucp-card" novalidate>
        <div class="ucp-field" data-field="title">
          <label for="ucp-title">Preset Title<span class="req">*</span></label>
          <input type="text" id="ucp-title" name="title" maxlength="120" autocomplete="off" required>
          <span class="ucp-err" hidden>Title is required.</span>
        </div>

        <div class="ucp-field" data-field="description">
          <label for="ucp-desc">Preset Description<span class="req">*</span></label>
          <textarea id="ucp-desc" name="description" required placeholder="What does this preset show? Any required integrations?"></textarea>
          <span class="ucp-err" hidden>Description is required.</span>
        </div>

        <div class="ucp-row2">
          <div class="ucp-field" data-field="category">
            <label>Preset Category<span class="req">*</span></label>
            <div class="ucp-cat-chips" id="ucp-cats" role="group" aria-label="Category">
              <?php foreach ($categories as $cat) : ?>
                <button type="button" class="ucp-cat-chip" data-value="<?php echo esc_attr($cat['value']); ?>">
                  <i class="mdi <?php echo esc_attr($cat['icon'] ?? 'mdi-tag-outline'); ?>"></i>
                  <?php echo esc_html($cat['label']); ?>
                </button>
              <?php endforeach; ?>
            </div>
            <input type="hidden" id="ucp-category" name="category" value="">
            <span class="ucp-err" hidden>Please select a category.</span>
          </div>
          <div class="ucp-field" data-field="tags">
            <label for="ucp-tags">Tags</label>
            <input type="text" id="ucp-tags" name="tags" placeholder="climate, battery, vehicle">
            <span class="ucp-hint">Comma-separated</span>
          </div>
        </div>

        <div class="ucp-field" data-field="code">
          <label for="ucp-code">Preset Code<span class="req">*</span></label>
          <div class="ucp-code-drop" id="ucp-code-drop">
            <textarea class="code" id="ucp-code" name="code" required placeholder='Paste [ultra_card]…[/ultra_card] or layout JSON'></textarea>
            <p class="ucp-hint">Drop a .json export here, or paste from the Ultra Card Hub / raw config.</p>
          </div>
          <span class="ucp-err" hidden>Preset code is required.</span>
          <p class="ucp-hint" style="margin-top:6px">Privacy: Hub exports redact secrets. Entity IDs in pasted code are still visible publicly after approval.</p>
        </div>

        <div class="ucp-field" data-field="featured">
          <label>Featured Image<span class="req">*</span></label>
          <div class="ucp-drop ucp-drop-featured" id="ucp-featured-drop" tabindex="0">
            <i class="mdi mdi-image-outline"></i>
            <strong>Click or drop featured image</strong>
            <span class="ucp-hint">Required · Used as the gallery thumbnail · PNG, JPG, WebP, GIF</span>
            <input type="file" id="ucp-featured" accept="image/*" hidden>
          </div>
          <div class="ucp-thumbs ucp-thumbs-featured" id="ucp-featured-thumb"></div>
          <span class="ucp-err" hidden>Featured image is required.</span>
        </div>

        <div class="ucp-field" data-field="photos">
          <label>Preset Photos <span class="ucp-hint" style="font-weight:500">(optional)</span></label>
          <div class="ucp-drop" id="ucp-photo-drop" tabindex="0">
            <i class="mdi mdi-image-multiple-outline"></i>
            <strong>Click or drop additional photos</strong>
            <span class="ucp-hint">Up to 5 images · PNG, JPG, WebP, GIF</span>
            <input type="file" id="ucp-photos" accept="image/*" multiple hidden>
          </div>
          <div class="ucp-thumbs" id="ucp-thumbs"></div>
        </div>

        <div class="ucp-field" data-field="integrations">
          <label for="ucp-integrations">Integrations</label>
          <input type="text" id="ucp-integrations" name="integrations" placeholder="Tesla, MQTT, Mobile App">
          <span class="ucp-hint">Comma-separated list of integrations this preset uses</span>
        </div>

        <div class="ucp-form-actions">
          <a class="ucp-btn ucp-btn-ghost" href="<?php echo esc_url(home_url('/dashboard/#presets')); ?>">Cancel</a>
          <button type="submit" class="ucp-btn ucp-btn-blue" id="ucp-submit">
            <i class="mdi mdi-send"></i>
            <span id="ucp-submit-label"><?php echo $edit_id ? 'Save changes' : 'Submit for review'; ?></span>
          </button>
        </div>
      </form>
    </main>
  </div>
</div>

<style>
.ucp-add-body{display:grid;grid-template-columns:220px minmax(0,1fr);gap:28px;padding-bottom:120px;align-items:start}
.ucp-progress{position:sticky;top:calc(var(--ucp-header-offset,96px) + 12px);padding:16px;border:1px solid var(--uc-line);border-radius:var(--uc-r);background:var(--uc-card)}
.ucp-progress-label{font-size:12.5px;color:var(--uc-dim);margin-bottom:8px}
.ucp-progress-label b{color:#fff;font-size:16px}
.ucp-progress-bar{height:6px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:12px}
.ucp-progress-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--uc-blue),var(--uc-purple));border-radius:999px;transition:width .2s}
.ucp-progress-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.ucp-progress-list li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--uc-dim)}
.ucp-progress-list li.done{color:var(--uc-ok)}
.ucp-progress-list .mdi{font-size:16px}
.ucp-progress-dash{width:100%;margin-top:16px;padding:10px 12px;font-size:13px}
.ucp-row2{display:grid;grid-template-columns:1.4fr 1fr;gap:16px}
.ucp-code-drop.drag{outline:2px dashed var(--uc-blue);outline-offset:2px;border-radius:12px}
.ucp-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:28px 16px;
  border:1px dashed var(--uc-line);border-radius:12px;background:rgba(0,0,0,.2);cursor:pointer;text-align:center}
.ucp-drop:hover,.ucp-drop.drag{border-color:var(--uc-blue);background:rgba(41,182,246,.06)}
.ucp-drop .mdi{font-size:32px;color:var(--uc-blue)}
.ucp-thumbs{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.ucp-thumbs-featured .ucp-thumb{width:160px;height:120px}
.ucp-thumb{position:relative;width:88px;height:88px;border-radius:10px;overflow:hidden;border:1px solid var(--uc-line);background:#111}
.ucp-thumb.featured{border-color:rgba(41,182,246,.55);box-shadow:0 0 0 1px rgba(41,182,246,.2)}
.ucp-thumb img{width:100%;height:100%;object-fit:cover}
.ucp-thumb button{position:absolute;top:4px;right:4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;font-size:14px}
.ucp-thumb .st{position:absolute;left:0;right:0;bottom:0;padding:3px;font-size:10px;text-align:center;background:rgba(0,0,0,.65)}
.ucp-drop-featured{min-height:120px}
.ucp-form-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:8px;padding-top:16px;border-top:1px solid var(--uc-line)}
.ucp-success{text-align:center;padding:36px 24px}
.ucp-success-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px}
@media (max-width:900px){
  .ucp-add-body{grid-template-columns:1fr}
  .ucp-progress{position:static}
  .ucp-row2{grid-template-columns:1fr}
}
</style>

<script>
(function () {
  var root = document.getElementById('ucp-add');
  if (!root) return;
  var API = root.getAttribute('data-api');
  var NONCE = root.getAttribute('data-nonce');
  var EDIT_ID = parseInt(root.getAttribute('data-edit-id') || '0', 10) || 0;
  var DRAFT_KEY = 'uc_preset_draft_v1';
  var MAX_PHOTOS = 5;
  var MAX_BYTES = 256 * 1024 * 1024;

  var state = {
    category: '',
    featuredKept: null, // {id,url} | null
    featuredFile: null,  // File | null
    keptPhotos: [], // {id,url} gallery only
    files: [],      // File[] gallery only
    submitting: false
  };

  var els = {
    form: document.getElementById('ucp-preset-form'),
    title: document.getElementById('ucp-title'),
    desc: document.getElementById('ucp-desc'),
    cat: document.getElementById('ucp-category'),
    tags: document.getElementById('ucp-tags'),
    code: document.getElementById('ucp-code'),
    integ: document.getElementById('ucp-integrations'),
    err: document.getElementById('ucp-form-error'),
    success: document.getElementById('ucp-success'),
    successTitle: document.getElementById('ucp-success-title'),
    successBody: document.getElementById('ucp-success-body'),
    featuredThumb: document.getElementById('ucp-featured-thumb'),
    thumbs: document.getElementById('ucp-thumbs'),
    submitLabel: document.getElementById('ucp-submit-label'),
    submitBtn: document.getElementById('ucp-submit'),
    progN: document.getElementById('ucp-prog-n'),
    progFill: document.getElementById('ucp-prog-fill')
  };

  function api(path, opts) {
    opts = opts || {};
    var headers = Object.assign({ 'X-WP-Nonce': NONCE, 'Accept': 'application/json' }, opts.headers || {});
    return fetch(API + path, Object.assign({ credentials: 'same-origin' }, opts, { headers: headers }))
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (body) {
          if (!r.ok) {
            var msg = (body && (body.message || (body.data && body.data.message))) || ('Request failed (' + r.status + ')');
            throw new Error(msg);
          }
          return body;
        });
      });
  }

  function saveDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        title: els.title.value,
        description: els.desc.value,
        category: state.category,
        tags: els.tags.value,
        code: els.code.value,
        integrations: els.integ.value,
        editId: EDIT_ID
      }));
    } catch (e) {}
  }

  function loadDraft() {
    try {
      var raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d.editId && d.editId !== EDIT_ID) return;
      if (d.title) els.title.value = d.title;
      if (d.description) els.desc.value = d.description;
      if (d.tags) els.tags.value = d.tags;
      if (d.code) els.code.value = d.code;
      if (d.integrations) els.integ.value = d.integrations;
      if (d.category) setCategory(d.category);
    } catch (e) {}
  }

  function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }

  function setCategory(val) {
    state.category = val || '';
    els.cat.value = state.category;
    document.querySelectorAll('#ucp-cats .ucp-cat-chip').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-value') === state.category);
    });
    updateProgress();
    saveDraft();
  }

  document.querySelectorAll('#ucp-cats .ucp-cat-chip').forEach(function (btn) {
    btn.addEventListener('click', function () { setCategory(btn.getAttribute('data-value')); });
  });

  ['title', 'desc', 'tags', 'code', 'integ'].forEach(function (k) {
    var el = els[k === 'desc' ? 'desc' : k === 'integ' ? 'integ' : k];
    if (!el) return;
    el.addEventListener('input', function () { updateProgress(); saveDraft(); });
  });

  function fieldOk(key) {
    if (key === 'title') return !!els.title.value.trim();
    if (key === 'description') return !!els.desc.value.trim();
    if (key === 'category') return !!state.category;
    if (key === 'code') return !!els.code.value.trim();
    if (key === 'featured') return !!(state.featuredKept || state.featuredFile);
    return true;
  }

  function updateProgress() {
    var keys = ['title', 'description', 'category', 'code', 'featured'];
    var n = keys.filter(fieldOk).length;
    els.progN.textContent = String(n);
    els.progFill.style.width = (n / 5 * 100) + '%';
    document.querySelectorAll('.ucp-progress-list li').forEach(function (li) {
      var ok = fieldOk(li.getAttribute('data-k'));
      li.classList.toggle('done', ok);
      var icon = li.querySelector('.mdi');
      if (icon) icon.className = 'mdi ' + (ok ? 'mdi-check-circle' : 'mdi-circle-outline');
    });
  }

  function showError(msg) {
    els.err.hidden = !msg;
    els.err.textContent = msg || '';
  }

  function markInvalid() {
    document.querySelectorAll('[data-field]').forEach(function (wrap) {
      var key = wrap.getAttribute('data-field');
      var bad = (key === 'title' || key === 'description' || key === 'category' || key === 'code' || key === 'featured') && !fieldOk(key);
      wrap.classList.toggle('invalid', bad);
      var err = wrap.querySelector('.ucp-err');
      if (err) err.hidden = !bad;
    });
  }

  // Featured image
  var featuredDrop = document.getElementById('ucp-featured-drop');
  var featuredInput = document.getElementById('ucp-featured');
  featuredDrop.addEventListener('click', function () { featuredInput.click(); });
  featuredDrop.addEventListener('dragover', function (e) { e.preventDefault(); featuredDrop.classList.add('drag'); });
  featuredDrop.addEventListener('dragleave', function () { featuredDrop.classList.remove('drag'); });
  featuredDrop.addEventListener('drop', function (e) {
    e.preventDefault(); featuredDrop.classList.remove('drag');
    var f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setFeaturedFile(f);
  });
  featuredInput.addEventListener('change', function () {
    if (featuredInput.files && featuredInput.files[0]) setFeaturedFile(featuredInput.files[0]);
    featuredInput.value = '';
  });

  function setFeaturedFile(f) {
    if (!f.type || f.type.indexOf('image/') !== 0) {
      showError('Featured image must be an image file.');
      return;
    }
    if (f.size > MAX_BYTES) {
      showError('Featured image too large (max 256 MB).');
      return;
    }
    state.featuredFile = f;
    state.featuredKept = null;
    showError('');
    renderFeatured();
    updateProgress();
  }

  function renderFeatured() {
    els.featuredThumb.innerHTML = '';
    if (state.featuredKept) {
      els.featuredThumb.appendChild(thumbNode(state.featuredKept.url, 'Featured', function () {
        state.featuredKept = null;
        renderFeatured();
        updateProgress();
      }, true));
    } else if (state.featuredFile) {
      var url = URL.createObjectURL(state.featuredFile);
      els.featuredThumb.appendChild(thumbNode(url, state.featuredFile.name, function () {
        state.featuredFile = null;
        renderFeatured();
        updateProgress();
      }, true));
    }
    featuredDrop.hidden = !!(state.featuredKept || state.featuredFile);
  }

  // Gallery photos
  var drop = document.getElementById('ucp-photo-drop');
  var fileInput = document.getElementById('ucp-photos');
  drop.addEventListener('click', function () { fileInput.click(); });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
  drop.addEventListener('drop', function (e) {
    e.preventDefault(); drop.classList.remove('drag');
    addFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });

  function addFiles(list) {
    var arr = Array.prototype.slice.call(list || []);
    for (var i = 0; i < arr.length; i++) {
      var f = arr[i];
      if (!f.type || f.type.indexOf('image/') !== 0) continue;
      if (f.size > MAX_BYTES) { showError('Photo too large (max 256 MB): ' + f.name); continue; }
      if (state.keptPhotos.length + state.files.length >= MAX_PHOTOS) {
        showError('Maximum ' + MAX_PHOTOS + ' additional photos.');
        break;
      }
      state.files.push(f);
    }
    renderThumbs();
  }

  function renderThumbs() {
    els.thumbs.innerHTML = '';
    state.keptPhotos.forEach(function (p, idx) {
      els.thumbs.appendChild(thumbNode(p.url, 'Kept', function () {
        state.keptPhotos.splice(idx, 1);
        renderThumbs();
      }));
    });
    state.files.forEach(function (f, idx) {
      var url = URL.createObjectURL(f);
      els.thumbs.appendChild(thumbNode(url, f.name, function () {
        state.files.splice(idx, 1);
        renderThumbs();
      }));
    });
  }

  function thumbNode(url, label, onRemove, featured) {
    var d = document.createElement('div');
    d.className = 'ucp-thumb' + (featured ? ' featured' : '');
    d.innerHTML = '<img src="' + url + '" alt=""><button type="button" aria-label="Remove"><i class="mdi mdi-close"></i></button><div class="st"></div>';
    d.querySelector('.st').textContent = label;
    d.querySelector('button').addEventListener('click', function (e) {
      e.stopPropagation();
      onRemove();
    });
    return d;
  }

  // Code drop
  var codeDrop = document.getElementById('ucp-code-drop');
  codeDrop.addEventListener('dragover', function (e) { e.preventDefault(); codeDrop.classList.add('drag'); });
  codeDrop.addEventListener('dragleave', function () { codeDrop.classList.remove('drag'); });
  codeDrop.addEventListener('drop', function (e) {
    e.preventDefault(); codeDrop.classList.remove('drag');
    var f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      els.code.value = String(reader.result || '');
      updateProgress(); saveDraft();
    };
    reader.readAsText(f);
  });

  async function uploadFile(file, label) {
    els.submitLabel.textContent = label;
    var fd = new FormData();
    fd.append('photo', file);
    var res = await api('/media', { method: 'POST', body: fd, headers: { 'X-WP-Nonce': NONCE } });
    if (!res || !res.id) throw new Error('Upload failed');
    return res.id;
  }

  async function uploadImages() {
    var featuredId = state.featuredKept && state.featuredKept.id ? state.featuredKept.id : 0;
    if (state.featuredFile) {
      featuredId = await uploadFile(state.featuredFile, 'Uploading featured image…');
    }
    var galleryIds = state.keptPhotos.map(function (p) { return p.id; }).filter(Boolean);
    for (var i = 0; i < state.files.length; i++) {
      var id = await uploadFile(state.files[i], 'Uploading photo ' + (i + 1) + '/' + state.files.length + '…');
      galleryIds.push(id);
    }
    return { featuredId: featuredId, galleryIds: galleryIds };
  }

  els.form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (state.submitting) return;
    markInvalid();
    if (!(fieldOk('title') && fieldOk('description') && fieldOk('category') && fieldOk('code') && fieldOk('featured'))) {
      showError('Please fill in all required fields.');
      return;
    }
    state.submitting = true;
    els.submitBtn.disabled = true;
    showError('');
    try {
      var imgs = await uploadImages();
      if (!imgs.featuredId) throw new Error('Featured image is required.');
      els.submitLabel.textContent = EDIT_ID ? 'Saving…' : 'Sending…';
      var tags = els.tags.value.trim();
      var integrations = els.integ.value.trim();

      if (EDIT_ID) {
        var payload = {
          name: els.title.value.trim(),
          description: els.desc.value.trim(),
          category: state.category,
          shortcode: els.code.value.trim(),
          featured_image_id: imgs.featuredId,
          photo_ids: imgs.galleryIds
        };
        if (tags) payload.tags = tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        if (integrations) payload.integrations = integrations;
        await api('/presets/' + EDIT_ID, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE },
          body: JSON.stringify(payload)
        });
        els.successTitle.textContent = 'Preset updated';
        els.successBody.textContent = 'If this preset is live, your update is queued for review while the published version stays online.';
      } else {
        var fd = new FormData();
        fd.append('name', els.title.value.trim());
        fd.append('description', els.desc.value.trim());
        fd.append('category', state.category);
        fd.append('shortcode', els.code.value.trim());
        fd.append('source', 'community');
        fd.append('featured_image_id', String(imgs.featuredId));
        if (tags) fd.append('tags', tags);
        if (integrations) fd.append('integrations', integrations);
        imgs.galleryIds.forEach(function (id) { fd.append('photo_ids[]', String(id)); });
        await api('/presets', { method: 'POST', body: fd, headers: { 'X-WP-Nonce': NONCE } });
        els.successTitle.textContent = 'Preset submitted';
        els.successBody.textContent = 'Thanks! Your preset is pending review. You can track it under My Presets in your dashboard.';
      }
      clearDraft();
      els.form.hidden = true;
      document.getElementById('ucp-progress').hidden = true;
      els.success.hidden = false;
    } catch (err) {
      showError(err && err.message ? err.message : 'Something went wrong. Please try again.');
    } finally {
      state.submitting = false;
      els.submitBtn.disabled = false;
      els.submitLabel.textContent = EDIT_ID ? 'Save changes' : 'Submit for review';
    }
  });

  async function loadExisting() {
    if (!EDIT_ID) return;
    try {
      var p = await api('/presets/' + EDIT_ID);
      els.title.value = p.name || '';
      els.desc.value = (p.description || '').replace(/<[^>]+>/g, '');
      setCategory(p.category || '');
      els.tags.value = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '');
      els.code.value = p.shortcode || '';
      els.integ.value = p.integrations || '';
      var gallery = p.gallery || [];
      var ids = p.photo_ids || [];
      var featuredId = p.featured_image_id || 0;
      var featuredUrl = p.featured_image || '';
      state.featuredKept = null;
      state.featuredFile = null;
      state.keptPhotos = [];
      if (featuredId || featuredUrl) {
        state.featuredKept = { id: featuredId || 0, url: featuredUrl || (gallery[0] || '') };
      }
      for (var i = 0; i < ids.length; i++) {
        if (featuredId && ids[i] === featuredId) continue;
        if (!featuredId && i === 0 && featuredUrl && gallery[0] === featuredUrl) continue;
        state.keptPhotos.push({ id: ids[i] || 0, url: gallery[i] || '' });
      }
      // If API only returned gallery URLs and featured was first entry
      if (!state.featuredKept && gallery.length) {
        state.featuredKept = { id: ids[0] || 0, url: gallery[0] };
        state.keptPhotos = [];
        for (var j = 1; j < gallery.length; j++) {
          state.keptPhotos.push({ id: ids[j] || 0, url: gallery[j] });
        }
      }
      renderFeatured();
      renderThumbs();
      updateProgress();
    } catch (err) {
      showError(err.message || 'Could not load preset for editing.');
    }
  }

  loadDraft();
  updateProgress();
  loadExisting();
})();
</script>
<?php
get_footer();
