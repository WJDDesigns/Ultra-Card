<?php
/**
 * Ultra Card Website Harness
 *
 * Server-side delivery of website/*.html fragments for ultracard.io, plus
 * admin diagnostics and a secret-guarded flush endpoint for CI.
 *
 * Shortcode: [ultra_card_page id="modules|template-mode|presets"]
 * Paste into a WPBakery Text Block (not Raw HTML — Raw HTML base64-encodes
 * content and does not expand shortcodes).
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('UltraCardWebsiteHarness')) :

class UltraCardWebsiteHarness {
    const OPTION_CHANNEL = 'ultra_card_harness_channel';
    const OPTION_REF = 'ultra_card_harness_ref';
    const OPTION_LOCAL_URL = 'ultra_card_harness_local_url';
    const OPTION_SECRET = 'ultra_card_harness_flush_secret';
    const OPTION_LAST_ERROR = 'ultra_card_harness_last_error';
    const OPTION_LAST_FLUSH = 'ultra_card_harness_last_flush';

    const TRANSIENT_SHA = 'uc_harness_sha';
    const SHA_TTL = 900; // 15 minutes
    const FRAG_TTL = 86400; // 24 hours (file also keyed by sha)

    const REPO = 'WJDDesigns/Ultra-Card';
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/WJDDesigns/Ultra-Card';

    /** @var UltraCardWebsiteHarness|null */
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('ultra_card_page', array($this, 'render_shortcode'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_ajax_ultra_card_harness_flush', array($this, 'ajax_flush'));
        add_action('wp_ajax_ultra_card_harness_test', array($this, 'ajax_test'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_init', array($this, 'maybe_seed_options'));
        add_action('update_option_' . self::OPTION_CHANNEL, array($this, 'on_channel_change'), 10, 0);
        add_action('update_option_' . self::OPTION_REF, array($this, 'on_channel_change'), 10, 0);
        add_action('update_option_' . self::OPTION_LOCAL_URL, array($this, 'on_channel_change'), 10, 0);
    }

    /**
     * Seed defaults after WP is fully loaded — never during plugin file include.
     */
    public function maybe_seed_options() {
        if (!get_option(self::OPTION_SECRET)) {
            update_option(self::OPTION_SECRET, wp_generate_password(32, false, false), false);
        }
        if (!get_option(self::OPTION_CHANNEL)) {
            // Use add_option so we don't fire update_option_* hooks on first create.
            add_option(self::OPTION_CHANNEL, 'main', '', false);
        }
    }

    public function register_settings() {
        register_setting('ultra_card_harness_settings', self::OPTION_CHANNEL);
        register_setting('ultra_card_harness_settings', self::OPTION_REF);
        register_setting('ultra_card_harness_settings', self::OPTION_LOCAL_URL);
        register_setting('ultra_card_harness_settings', self::OPTION_SECRET);
    }

    public function on_channel_change() {
        $this->flush_caches(false);
    }

    public function register_rest_routes() {
        register_rest_route('ultra-card/v1', '/harness/flush', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_flush'),
            'permission_callback' => array($this, 'check_flush_secret'),
        ));
        register_rest_route('ultra-card/v1', '/harness/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_status'),
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ));
    }

    public function check_flush_secret($request) {
        $secret = (string) get_option(self::OPTION_SECRET, '');
        if ($secret === '') {
            return false;
        }
        $header = $request->get_header('x-uc-harness-secret');
        if (!$header) {
            $header = $request->get_param('secret');
        }
        return is_string($header) && hash_equals($secret, $header);
    }

    public function rest_flush($request) {
        $result = $this->flush_caches(true);
        update_option(self::OPTION_LAST_FLUSH, array(
            'at' => current_time('mysql'),
            'reason' => sanitize_text_field((string) $request->get_param('reason')),
            'via' => 'rest',
        ), false);
        return rest_ensure_response(array(
            'ok' => true,
            'cleared' => $result,
            'sha' => $this->resolve_ref(true),
        ));
    }

    public function rest_status() {
        return rest_ensure_response($this->build_status());
    }

    public function ajax_flush() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        $scope = isset($_POST['scope']) ? sanitize_text_field(wp_unslash($_POST['scope'])) : 'all';
        $cleared = $this->flush_caches(true, $scope);
        update_option(self::OPTION_LAST_FLUSH, array(
            'at' => current_time('mysql'),
            'reason' => 'admin:' . $scope,
            'via' => 'ajax',
        ), false);
        wp_send_json_success(array('cleared' => $cleared, 'status' => $this->build_status()));
    }

    public function ajax_test() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        $id = isset($_POST['page_id']) ? sanitize_key(wp_unslash($_POST['page_id'])) : '';
        $pages = $this->known_pages();
        if (!isset($pages[$id])) {
            wp_send_json_error('Unknown page id');
        }
        $result = $this->fetch_fragment($id, true);
        wp_send_json_success(array(
            'page' => $id,
            'ok' => !empty($result['html']),
            'bytes' => isset($result['html']) ? strlen($result['html']) : 0,
            'sha' => $result['sha'],
            'url' => $result['url'],
            'error' => $result['error'],
            'cached' => $result['cached'],
        ));
    }

    /**
     * @param bool $refresh_sha Also drop the SHA transient and re-resolve.
     * @param string $scope all|sha|fragments|presets
     */
    public function flush_caches($refresh_sha = true, $scope = 'all') {
        $cleared = array();
        global $wpdb;
        $can_db = isset($wpdb) && is_object($wpdb) && isset($wpdb->options);

        if ($scope === 'all' || $scope === 'sha') {
            delete_transient(self::TRANSIENT_SHA);
            $cleared[] = 'sha';
        }
        if ($can_db && ($scope === 'all' || $scope === 'fragments')) {
            $count = $wpdb->query(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_uc_harness_frag_%' OR option_name LIKE '_transient_timeout_uc_harness_frag_%'"
            );
            $cleared[] = 'fragments:' . (int) $count;
        }
        if ($can_db && ($scope === 'all' || $scope === 'presets')) {
            $count = $wpdb->query(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_uc_presets_%' OR option_name LIKE '_transient_timeout_uc_presets_%'"
            );
            $cleared[] = 'presets:' . (int) $count;
        }
        if ($refresh_sha && ($scope === 'all' || $scope === 'sha')) {
            $this->resolve_ref(true);
        }
        return $cleared;
    }

    public function known_pages() {
        return array(
            'modules' => array(
                'file' => 'website/modules-page-embed.html',
                'title' => 'Modules',
                'needs_bundle' => true,
                'path' => '/modules/',
            ),
            'template-mode' => array(
                'file' => 'website/template-mode-page-embed.html',
                'title' => 'Template Mode',
                'needs_bundle' => true,
                'path' => '/template-mode/',
            ),
            'presets' => array(
                'file' => 'website/presets-page-embed.html',
                'title' => 'Presets',
                'needs_bundle' => false,
                'path' => '/presets/',
            ),
        );
    }

    /**
     * Resolve the git ref / SHA / local base URL currently configured.
     *
     * @return array{channel:string,ref:string,sha:string,base:string,bundle:string,error:?string}
     */
    public function resolve_channel($force = false) {
        $channel = get_option(self::OPTION_CHANNEL, 'main');
        $ref = trim((string) get_option(self::OPTION_REF, ''));
        $local = trim((string) get_option(self::OPTION_LOCAL_URL, ''));
        $error = null;
        $sha = '';
        $base = '';
        $bundle = '';

        if ($channel === 'local' && $local !== '') {
            $base = untrailingslashit($local);
            $bundle = $base . '/dist-demo/ultra-card-demo.js';
            $sha = 'local';
            return compact('channel', 'ref', 'sha', 'base', 'bundle', 'error');
        }

        if ($channel === 'tag' && $ref !== '') {
            $sha = ltrim($ref, 'v');
            // Prefer the literal tag string for jsDelivr (e.g. v3.8.0).
            $tag = (strpos($ref, 'v') === 0) ? $ref : ('v' . $ref);
            $base = self::CDN_BASE . '@' . $tag;
            $bundle = $base . '/dist-demo/ultra-card-demo.js';
            return compact('channel', 'ref', 'sha', 'base', 'bundle', 'error') + array('sha' => $tag);
        }

        if ($channel === 'sha' && preg_match('/^[a-f0-9]{7,40}$/i', $ref)) {
            $sha = strtolower($ref);
            $base = self::CDN_BASE . '@' . $sha;
            $bundle = $base . '/dist-demo/ultra-card-demo.js';
            return compact('channel', 'ref', 'sha', 'base', 'bundle', 'error');
        }

        // Default: latest main, resolved once server-side.
        $sha = $this->resolve_ref($force);
        if (!$sha) {
            $error = 'Could not resolve latest main SHA from GitHub.';
            $base = self::CDN_BASE . '@main';
            $bundle = $base . '/dist-demo/ultra-card-demo.js';
            $sha = 'main';
        } else {
            $base = self::CDN_BASE . '@' . $sha;
            $bundle = $base . '/dist-demo/ultra-card-demo.js';
        }
        $channel = 'main';
        return compact('channel', 'ref', 'sha', 'base', 'bundle', 'error');
    }

    public function resolve_ref($force = false) {
        if (!$force) {
            $cached = get_transient(self::TRANSIENT_SHA);
            if (is_string($cached) && preg_match('/^[a-f0-9]{7,40}$/i', $cached)) {
                return $cached;
            }
        }
        $response = wp_remote_get(
            'https://api.github.com/repos/' . self::REPO . '/commits/main',
            array(
                'timeout' => 12,
                'headers' => array(
                    'Accept' => 'application/vnd.github+json',
                    'User-Agent' => 'UltraCardWebsiteHarness/' . (defined('ULTRA_CARD_INTEGRATION_VERSION') ? ULTRA_CARD_INTEGRATION_VERSION : '1.0'),
                ),
            )
        );
        if (is_wp_error($response)) {
            update_option(self::OPTION_LAST_ERROR, $response->get_error_message(), false);
            return '';
        }
        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($code !== 200 || empty($body['sha'])) {
            update_option(self::OPTION_LAST_ERROR, 'GitHub commits/main HTTP ' . $code, false);
            return '';
        }
        $sha = (string) $body['sha'];
        set_transient(self::TRANSIENT_SHA, $sha, self::SHA_TTL);
        delete_option(self::OPTION_LAST_ERROR);
        return $sha;
    }

    /**
     * Fetch (or serve cached) fragment HTML for a page id.
     *
     * @return array{html:string,sha:string,url:string,error:?string,cached:bool,path:?string}
     */
    public function fetch_fragment($id, $force = false) {
        $pages = $this->known_pages();
        if (!isset($pages[$id])) {
            return array('html' => '', 'sha' => '', 'url' => '', 'error' => 'Unknown page', 'cached' => false, 'path' => null);
        }
        $meta = $pages[$id];
        $channel = $this->resolve_channel($force);
        $sha = $channel['sha'];
        $url = $channel['base'] . '/' . $meta['file'];

        $cache_key = 'uc_harness_frag_' . $id;
        if (!$force) {
            $cached = get_transient($cache_key);
            if (is_array($cached) && !empty($cached['html']) && isset($cached['sha']) && $cached['sha'] === $sha) {
                return array(
                    'html' => $cached['html'],
                    'sha' => $sha,
                    'url' => $url,
                    'error' => null,
                    'cached' => true,
                    'path' => isset($cached['path']) ? $cached['path'] : null,
                );
            }
        }

        // Prefer on-disk file for this sha.
        $disk = $this->disk_path($id, $sha);
        if (!$force && file_exists($disk)) {
            $html = file_get_contents($disk);
            if ($html !== false && $html !== '') {
                set_transient($cache_key, array('html' => $html, 'sha' => $sha, 'path' => $disk, 'at' => time()), self::FRAG_TTL);
                return array('html' => $html, 'sha' => $sha, 'url' => $url, 'error' => null, 'cached' => true, 'path' => $disk);
            }
        }

        $response = wp_remote_get($url, array(
            'timeout' => 20,
            'headers' => array('User-Agent' => 'UltraCardWebsiteHarness'),
        ));
        if (is_wp_error($response)) {
            $fallback = $this->last_good_disk($id);
            return array(
                'html' => $fallback['html'],
                'sha' => $fallback['sha'] ?: $sha,
                'url' => $url,
                'error' => $response->get_error_message(),
                'cached' => (bool) $fallback['html'],
                'path' => $fallback['path'],
            );
        }
        $code = wp_remote_retrieve_response_code($response);
        $html = (string) wp_remote_retrieve_body($response);
        if ($code !== 200 || $html === '') {
            $fallback = $this->last_good_disk($id);
            $err = 'HTTP ' . $code . ' fetching ' . $url;
            update_option(self::OPTION_LAST_ERROR, $err, false);
            return array(
                'html' => $fallback['html'],
                'sha' => $fallback['sha'] ?: $sha,
                'url' => $url,
                'error' => $err,
                'cached' => (bool) $fallback['html'],
                'path' => $fallback['path'],
            );
        }

        $this->write_disk($disk, $html);
        set_transient($cache_key, array('html' => $html, 'sha' => $sha, 'path' => $disk, 'at' => time()), self::FRAG_TTL);
        delete_option(self::OPTION_LAST_ERROR);
        return array('html' => $html, 'sha' => $sha, 'url' => $url, 'error' => null, 'cached' => false, 'path' => $disk);
    }

    private function uploads_dir() {
        $upload = wp_upload_dir();
        $dir = trailingslashit($upload['basedir']) . 'ultra-card-harness';
        if (!file_exists($dir)) {
            wp_mkdir_p($dir);
        }
        return $dir;
    }

    private function disk_path($id, $sha) {
        $safe_sha = preg_replace('/[^a-zA-Z0-9._-]/', '', (string) $sha);
        return trailingslashit($this->uploads_dir()) . $id . '-' . $safe_sha . '.html';
    }

    private function write_disk($path, $html) {
        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
        @file_put_contents($path, $html);
    }

    private function last_good_disk($id) {
        $dir = $this->uploads_dir();
        $matches = glob(trailingslashit($dir) . $id . '-*.html');
        if (!$matches) {
            return array('html' => '', 'sha' => '', 'path' => null);
        }
        usort($matches, function ($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        $path = $matches[0];
        $html = file_get_contents($path);
        $base = basename($path, '.html');
        $sha = substr($base, strlen($id) + 1);
        return array('html' => $html !== false ? $html : '', 'sha' => $sha, 'path' => $path);
    }

    /**
     * Strip the fragment's own demo-bundle loader so the harness owns the
     * script tag (channel selection has one owner).
     */
    public function strip_inline_bundle_loader($html) {
        // Leading async IIFE that loads the demo bundle from GitHub/jsDelivr.
        $html = preg_replace(
            '#<script>\s*\(async\s+function\s*\(\)\s*\{.*?load\(0\);\s*\}\)\(\);\s*</script>#s',
            '',
            $html,
            1
        );
        // Modules page uses a non-IIFE top script in some revisions; also strip
        // any script whose only job is setting UCM_BUNDLE_SRC / loading demo.
        $html = preg_replace(
            '#<script>\s*(?:/\*!?\s*[^*]*\*/\s*)?var\s+urls\s*=\s*\[.*?</script>#s',
            '',
            $html,
            1
        );
        return $html;
    }

    public function inject_bundle_script($html, $bundle_url, $needs_bundle) {
        if (!$needs_bundle || !$bundle_url) {
            return $html;
        }
        $tag = '<script>window.UCM_BUNDLE_SRC=' . wp_json_encode($bundle_url) . ';</script>' .
            '<script src="' . esc_url($bundle_url) . '" defer></script>';
        return $tag . "\n" . $html;
    }

    public function render_shortcode($atts = array()) {
        try {
            $atts = shortcode_atts(array('id' => ''), $atts, 'ultra_card_page');
            $id = sanitize_key($atts['id']);
            $pages = $this->known_pages();
            if (!isset($pages[$id])) {
                return '<!-- ultra_card_page: unknown id -->';
            }
            $channel = $this->resolve_channel();
            $frag = $this->fetch_fragment($id);
            if (empty($frag['html'])) {
                $msg = $frag['error'] ? esc_html($frag['error']) : 'Fragment unavailable';
                return '<!-- ultra_card_page error: ' . $msg . ' -->';
            }
            $html = $this->strip_inline_bundle_loader($frag['html']);
            $html = $this->inject_bundle_script($html, $channel['bundle'], !empty($pages[$id]['needs_bundle']));
            $comment = sprintf(
                '<!-- ultra_card_page id=%s sha=%s cached=%s -->',
                esc_attr($id),
                esc_attr($frag['sha']),
                $frag['cached'] ? '1' : '0'
            );
            return $comment . "\n" . $html;
        } catch (Throwable $e) {
            return '<!-- ultra_card_page exception: ' . esc_html($e->getMessage()) . ' -->';
        }
    }

    public function find_shortcode_posts() {
        global $wpdb;
        $rows = $wpdb->get_results(
            "SELECT ID, post_title, post_name, post_status, post_content
             FROM {$wpdb->posts}
             WHERE post_type IN ('page','post')
               AND post_status IN ('publish','draft','private')
               AND post_content LIKE '%[ultra_card_page%'",
            ARRAY_A
        );
        $by_id = array();
        if (!$rows) {
            return $by_id;
        }
        foreach ($rows as $row) {
            if (preg_match_all('/\[ultra_card_page([^\]]*)\]/', $row['post_content'], $matches, PREG_SET_ORDER)) {
                foreach ($matches as $m) {
                    $attrs = shortcode_parse_atts($m[1]);
                    $pid = isset($attrs['id']) ? sanitize_key($attrs['id']) : '';
                    if ($pid) {
                        $by_id[$pid] = array(
                            'ID' => (int) $row['ID'],
                            'title' => $row['post_title'],
                            'name' => $row['post_name'],
                            'status' => $row['post_status'],
                            'edit' => get_edit_post_link((int) $row['ID'], ''),
                            'permalink' => get_permalink((int) $row['ID']),
                        );
                    }
                }
            }
        }
        return $by_id;
    }

    public function build_status() {
        $channel = $this->resolve_channel();
        $posts = $this->find_shortcode_posts();
        $pages_out = array();
        foreach ($this->known_pages() as $id => $meta) {
            $cache_key = 'uc_harness_frag_' . $id;
            $cached = get_transient($cache_key);
            $pages_out[$id] = array(
                'title' => $meta['title'],
                'path' => $meta['path'],
                'file' => $meta['file'],
                'needs_bundle' => $meta['needs_bundle'],
                'post' => isset($posts[$id]) ? $posts[$id] : null,
                'cache' => is_array($cached) ? array(
                    'sha' => isset($cached['sha']) ? $cached['sha'] : '',
                    'bytes' => isset($cached['html']) ? strlen($cached['html']) : 0,
                    'at' => isset($cached['at']) ? $cached['at'] : null,
                ) : null,
                'url' => $channel['base'] . '/' . $meta['file'],
            );
        }

        $preset_counts = array();
        if (post_type_exists('ultra_preset')) {
            $counts = wp_count_posts('ultra_preset');
            if ($counts) {
                $preset_counts = array(
                    'publish' => (int) $counts->publish,
                    'pending' => (int) $counts->pending,
                    'draft' => (int) $counts->draft,
                );
            }
        }

        return array(
            'channel' => $channel,
            'pages' => $pages_out,
            'presets' => $preset_counts,
            'last_error' => get_option(self::OPTION_LAST_ERROR, ''),
            'last_flush' => get_option(self::OPTION_LAST_FLUSH, null),
            'flush_url' => rest_url('ultra-card/v1/harness/flush'),
            'secret_set' => (bool) get_option(self::OPTION_SECRET),
            'version' => defined('ULTRA_CARD_INTEGRATION_VERSION') ? ULTRA_CARD_INTEGRATION_VERSION : '',
        );
    }

    /**
     * Admin tab UI — called from UltraCardAdminDashboard.
     */
    public function render_admin_tab() {
        if (!current_user_can('manage_options')) {
            return;
        }
        $status = $this->build_status();
        $channel = get_option(self::OPTION_CHANNEL, 'main');
        $ref = get_option(self::OPTION_REF, '');
        $local = get_option(self::OPTION_LOCAL_URL, '');
        $secret = get_option(self::OPTION_SECRET, '');
        ?>
        <div class="uc-harness-admin">
            <h2><span class="dashicons dashicons-admin-site-alt3"></span> Website Harness</h2>
            <p>Serves the modules, template-mode and presets page fragments from the Ultra Card repo.
               Paste <code>[ultra_card_page id="modules"]</code> into a <strong>WPBakery Text Block</strong>
               (not Raw HTML). After the first paste, CI keeps the live page current.</p>

            <?php if (!empty($status['last_error'])) : ?>
                <div class="notice notice-warning"><p><strong>Last error:</strong> <?php echo esc_html($status['last_error']); ?></p></div>
            <?php endif; ?>

            <h3>Channel</h3>
            <form method="post" action="options.php">
                <?php settings_fields('ultra_card_harness_settings'); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">Release channel</th>
                        <td>
                            <select name="<?php echo esc_attr(self::OPTION_CHANNEL); ?>" id="uc-harness-channel">
                                <option value="main" <?php selected($channel, 'main'); ?>>main (auto-latest SHA)</option>
                                <option value="tag" <?php selected($channel, 'tag'); ?>>Pinned tag</option>
                                <option value="sha" <?php selected($channel, 'sha'); ?>>Pinned SHA</option>
                                <option value="local" <?php selected($channel, 'local'); ?>>Local / staging URL</option>
                            </select>
                            <p class="description">Default is <code>main</code>. Pin a tag or SHA to freeze the live site on a known good build.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Tag / SHA</th>
                        <td>
                            <input type="text" class="regular-text" name="<?php echo esc_attr(self::OPTION_REF); ?>"
                                   value="<?php echo esc_attr($ref); ?>" placeholder="v3.8.0 or abcdef1">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Local base URL</th>
                        <td>
                            <input type="url" class="regular-text" name="<?php echo esc_attr(self::OPTION_LOCAL_URL); ?>"
                                   value="<?php echo esc_attr($local); ?>" placeholder="https://staging.example/ultra-card">
                            <p class="description">Used when channel is Local. Fragments load from <code>{base}/website/…</code>.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Flush secret</th>
                        <td>
                            <input type="text" class="regular-text code" name="<?php echo esc_attr(self::OPTION_SECRET); ?>"
                                   value="<?php echo esc_attr($secret); ?>">
                            <p class="description">Send as <code>X-UC-Harness-Secret</code> to
                               <code><?php echo esc_html($status['flush_url']); ?></code>.
                               Store the same value as the <code>UC_HARNESS_SECRET</code> GitHub Actions secret.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save harness settings'); ?>
            </form>

            <h3>Resolved channel</h3>
            <table class="widefat striped" style="max-width:900px">
                <tbody>
                    <tr><th>Channel</th><td><code><?php echo esc_html($status['channel']['channel']); ?></code></td></tr>
                    <tr><th>SHA / ref</th><td><code><?php echo esc_html($status['channel']['sha']); ?></code></td></tr>
                    <tr><th>Fragment base</th><td><code><?php echo esc_html($status['channel']['base']); ?></code></td></tr>
                    <tr><th>Demo bundle</th><td><code><?php echo esc_html($status['channel']['bundle']); ?></code></td></tr>
                    <?php if (!empty($status['last_flush'])) : ?>
                        <tr><th>Last flush</th><td><?php echo esc_html(wp_json_encode($status['last_flush'])); ?></td></tr>
                    <?php endif; ?>
                </tbody>
            </table>

            <h3 style="margin-top:24px">Connections</h3>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>WP post</th>
                        <th>Fragment</th>
                        <th>Cache</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($status['pages'] as $id => $page) : ?>
                    <tr data-page="<?php echo esc_attr($id); ?>">
                        <td>
                            <strong><?php echo esc_html($page['title']); ?></strong><br>
                            <code>[ultra_card_page id="<?php echo esc_attr($id); ?>"]</code>
                            <?php if (!empty($page['path'])) : ?>
                                <br><a href="<?php echo esc_url(home_url($page['path'])); ?>" target="_blank" rel="noopener"><?php echo esc_html($page['path']); ?></a>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php if ($page['post']) : ?>
                                <a href="<?php echo esc_url($page['post']['edit']); ?>"><?php echo esc_html($page['post']['title']); ?></a>
                                <br><span class="description"><?php echo esc_html($page['post']['status']); ?> · #<?php echo (int) $page['post']['ID']; ?></span>
                            <?php else : ?>
                                <span style="color:#b32d2e">Shortcode not found — paste into a Text Block</span>
                            <?php endif; ?>
                        </td>
                        <td><code style="word-break:break-all"><?php echo esc_html($page['url']); ?></code></td>
                        <td>
                            <?php if ($page['cache']) : ?>
                                <?php echo (int) $page['cache']['bytes']; ?> B<br>
                                <code><?php echo esc_html(substr((string) $page['cache']['sha'], 0, 12)); ?></code>
                            <?php else : ?>
                                <em>empty</em>
                            <?php endif; ?>
                        </td>
                        <td>
                            <button type="button" class="button uc-harness-test" data-page="<?php echo esc_attr($id); ?>">Test</button>
                            <span class="uc-harness-test-result" style="margin-left:6px"></span>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>

            <h3 style="margin-top:24px">Presets API</h3>
            <p>
                Published: <strong><?php echo isset($status['presets']['publish']) ? (int) $status['presets']['publish'] : 0; ?></strong> ·
                Pending: <strong><?php echo isset($status['presets']['pending']) ? (int) $status['presets']['pending'] : 0; ?></strong> ·
                Draft: <strong><?php echo isset($status['presets']['draft']) ? (int) $status['presets']['draft'] : 0; ?></strong>
            </p>
            <p>
                <a href="<?php echo esc_url(rest_url('ultra-card/v1/presets?per_page=1')); ?>" target="_blank" rel="noopener">/presets</a> ·
                <a href="<?php echo esc_url(rest_url('ultra-card/v1/preset-categories')); ?>" target="_blank" rel="noopener">/preset-categories</a>
            </p>

            <h3 style="margin-top:24px">Caches</h3>
            <p>
                <button type="button" class="button button-primary uc-harness-flush" data-scope="all">Flush everything</button>
                <button type="button" class="button uc-harness-flush" data-scope="sha">Flush SHA</button>
                <button type="button" class="button uc-harness-flush" data-scope="fragments">Flush fragments</button>
                <button type="button" class="button uc-harness-flush" data-scope="presets">Flush presets</button>
                <span id="uc-harness-flush-result" style="margin-left:10px"></span>
            </p>

            <h3 style="margin-top:24px">CI webhook</h3>
            <pre style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:6px;overflow:auto">curl -fsS -X POST <?php echo esc_html($status['flush_url']); ?> \
  -H "X-UC-Harness-Secret: <?php echo esc_html($secret); ?>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"manual"}'</pre>
        </div>
        <script>
        (function($){
            var nonce = <?php echo wp_json_encode(wp_create_nonce('ultra_card_admin_nonce')); ?>;
            $('.uc-harness-flush').on('click', function(){
                var scope = $(this).data('scope');
                var $out = $('#uc-harness-flush-result').text('Flushing…');
                $.post(ajaxurl, { action:'ultra_card_harness_flush', nonce:nonce, scope:scope })
                    .done(function(res){ $out.text(res.success ? ('Cleared: ' + (res.data.cleared||[]).join(', ')) : (res.data||'Failed')); })
                    .fail(function(){ $out.text('Request failed'); });
            });
            $('.uc-harness-test').on('click', function(){
                var id = $(this).data('page');
                var $out = $(this).siblings('.uc-harness-test-result').text('…');
                $.post(ajaxurl, { action:'ultra_card_harness_test', nonce:nonce, page_id:id })
                    .done(function(res){
                        if(!res.success){ $out.text(res.data||'Failed'); return; }
                        var d = res.data;
                        $out.text((d.ok?'OK ':'FAIL ') + d.bytes + 'B' + (d.error ? ' — ' + d.error : ''));
                    })
                    .fail(function(){ $out.text('Request failed'); });
            });
        })(jQuery);
        </script>
        <?php
    }
}

endif; // class_exists UltraCardWebsiteHarness

// Boot after plugins are loaded so $wpdb and option APIs are fully ready.
if (!function_exists('ultra_card_boot_website_harness')) {
    function ultra_card_boot_website_harness() {
        if (defined('ULTRA_CARD_DISABLE_HARNESS') && ULTRA_CARD_DISABLE_HARNESS) {
            return;
        }
        if (class_exists('UltraCardWebsiteHarness')) {
            UltraCardWebsiteHarness::instance();
        }
    }
    add_action('plugins_loaded', 'ultra_card_boot_website_harness', 20);
}
