<?php
/**
 * Ultra Card theme catalog: CPT, public catalog API, author API, moderation.
 *
 * Mirrors includes/uc-preset-authoring.php for the theme object. A theme is a
 * JSON document (see src/themes/uc-theme-types.ts in the card repo) stored in
 * post meta; the post title/content carry name/description so the WP admin
 * list stays readable and searchable.
 *
 * Routes (namespace ultra-card/v1):
 *   GET    /themes                      public catalog (published, cached)
 *   GET    /themes/mine                 caller's submissions
 *   GET    /themes/moderation-queue     moderators
 *   GET    /themes/{id}
 *   POST   /themes                      submit (pending review)
 *   PUT    /themes/{id}                 edit (revision model when published)
 *   DELETE /themes/{id}
 *   POST   /themes/{id}/withdraw
 *   POST   /themes/{id}/moderate        { action: approve|request_changes|reject, note? }
 *   POST   /themes/{id}/track-download
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UC_THEME_POST_TYPE', 'ultra_theme');
define('UC_THEME_TAG_TAXONOMY', 'uc_theme_tag');
define('UC_THEME_META_DEFINITION', '_uc_theme_definition');
// Size budget, kept in sync with src/themes/uc-theme-validate.ts: a wallpaper
// may be a real picture (~150 KB of WebP as base64), panes and CSS only get
// room for compact SVG props.
define('UC_THEME_MAX_DEFINITION_BYTES', 320000);
define('UC_THEME_MAX_CSS_CHARS', 60000);
define('UC_THEME_MAX_PAGE_BACKGROUND_CHARS', 200000);
define('UC_THEME_MAX_PANE_BACKGROUND_CHARS', 20000);
// Catalog listings leave out heavy fields above this many characters so a
// page of themes stays small; the card fetches the full theme on install.
define('UC_THEME_LIST_FIELD_LIMIT', 2000);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uc_is_theme_post($post_id) {
    return get_post_type($post_id) === UC_THEME_POST_TYPE;
}

function uc_user_can_manage_theme($post) {
    if (!$post instanceof WP_Post) {
        return false;
    }
    if (current_user_can('manage_options')) {
        return true;
    }
    $uid = get_current_user_id();
    return $uid > 0 && (int) $post->post_author === $uid;
}

function uc_get_theme_review_status($post) {
    $status = get_post_meta($post->ID, '_uc_review_status', true);
    if (in_array($status, array('pending', 'approved', 'changes_requested', 'rejected'), true)) {
        return $status;
    }
    return $post->post_status === 'publish' ? 'approved' : 'pending';
}

/**
 * Stable catalog id for a theme post, as the card expects it (`wp-<slug>`).
 */
function uc_theme_catalog_id($post) {
    $slug = $post->post_name ?: sanitize_title($post->post_title);
    return 'wp-' . $slug;
}

/**
 * Ratings live in one meta array (user_id => 1..5) with cached aggregates so
 * the catalog can sort by them. Returns array('rating' => float, 'rating_count' => int).
 */
function uc_theme_rating_aggregate($post_id) {
    return array(
        'rating'       => round((float) get_post_meta($post_id, '_uc_rating_avg', true), 1),
        'rating_count' => (int) get_post_meta($post_id, '_uc_rating_count', true),
    );
}

function uc_theme_set_user_rating($post_id, $user_id, $rating) {
    $all = get_post_meta($post_id, '_uc_theme_ratings', true);
    if (!is_array($all)) {
        $all = array();
    }
    $rating = (int) $rating;
    if ($rating < 1) {
        unset($all[$user_id]);
    } else {
        $all[$user_id] = min(5, $rating);
    }
    update_post_meta($post_id, '_uc_theme_ratings', $all);
    $count = count($all);
    $avg = $count ? array_sum($all) / $count : 0;
    update_post_meta($post_id, '_uc_rating_avg', round($avg, 2));
    update_post_meta($post_id, '_uc_rating_count', $count);
    return array('rating' => round($avg, 1), 'rating_count' => $count, 'my_rating' => isset($all[$user_id]) ? $all[$user_id] : 0);
}

function uc_theme_my_rating($post_id, $user_id) {
    if (!$user_id) {
        return 0;
    }
    $all = get_post_meta($post_id, '_uc_theme_ratings', true);
    return is_array($all) && isset($all[$user_id]) ? (int) $all[$user_id] : 0;
}

/**
 * Add the caller's own rating to normalised items after any cache lookup, so
 * cached catalog pages stay user-agnostic.
 */
function uc_theme_attach_my_ratings(array $items) {
    $user_id = get_current_user_id();
    foreach ($items as &$item) {
        if (isset($item['id'])) {
            $item['my_rating'] = uc_theme_my_rating((int) $item['id'], $user_id);
        }
    }
    unset($item);
    return $items;
}

/**
 * CSS constructs the card refuses. Kept in sync with
 * src/themes/uc-theme-validate.ts (scanThemeCss).
 */
function uc_theme_css_problems($css, $max = UC_THEME_MAX_CSS_CHARS) {
    $problems = array();
    if (!is_string($css) || $css === '') {
        return $problems;
    }
    if (strlen($css) > $max) {
        $problems[] = 'longer than ' . $max . ' characters';
    }
    // Inline image data URIs are allowed artwork (SVG-as-image cannot run
    // script or fetch). Lift them out, check their payload, then scan the rest.
    $inline_re = '/url\(\s*(["\']?)data:image\/(svg\+xml|png|jpeg|gif|webp)((?:;[a-z0-9=-]+)*),([^)"\']*)\1\s*\)/i';
    $css = preg_replace_callback($inline_re, function ($m) use (&$problems) {
        // Only SVG carries markup; raster payloads are opaque bytes and the
        // text patterns below would only false-positive on them.
        if (stripos($m[2], 'svg') === false) {
            return 'inline-image';
        }
        $payload = stripos($m[3], 'base64') !== false ? base64_decode($m[4], true) : rawurldecode($m[4]);
        if ($payload === false) {
            $payload = $m[4];
        }
        $bad = array(
            '/<\s*script/i'                                   => 'script',
            '/\bon[a-z]+\s*=/i'                               => 'event handler',
            '/javascript:/i'                                  => 'javascript:',
            '/<\s*foreignObject/i'                            => 'foreignObject',
            '/(?:xlink:)?href\s*=\s*["\']?\s*(?:https?:|\/\/)/i' => 'external href',
            '/url\s*\(\s*["\']?\s*(?!#)/i'                    => 'external url()', // url(#id) paint servers are fine
        );
        foreach ($bad as $re => $label) {
            if (preg_match($re, $payload)) {
                $problems[] = 'inline image contains ' . $label;
            }
        }
        return 'inline-image';
    }, $css);
    $patterns = array(
        '/@import/i'                       => '@import',
        '/url\s*\(/i'                      => 'url()',
        '/expression\s*\(/i'               => 'expression()',
        '/javascript:/i'                   => 'javascript:',
        '/behavior\s*:/i'                  => 'behavior:',
        '/-moz-binding/i'                  => '-moz-binding',
        '/<\s*\/?\s*(script|style|iframe)/i' => 'html tags',
        '/@font-face/i'                    => '@font-face',
    );
    foreach ($patterns as $re => $label) {
        if (preg_match($re, $css)) {
            $problems[] = 'css contains ' . $label;
        }
    }
    return $problems;
}

/**
 * Validate and normalise an incoming theme definition.
 *
 * Accepts an array (decoded JSON) or a JSON string. Returns the array to store
 * or WP_Error. The card re-sanitises on load, so this is a structural and
 * safety check, not the full allow-list.
 */
function uc_theme_sanitize_definition($raw) {
    if (is_string($raw)) {
        if (strlen($raw) > UC_THEME_MAX_DEFINITION_BYTES) {
            return new WP_Error('theme_too_large', 'Theme definition exceeds ' . round(UC_THEME_MAX_DEFINITION_BYTES / 1024) . ' KB', array('status' => 400));
        }
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return new WP_Error('invalid_theme', 'Theme definition must be valid JSON', array('status' => 400));
        }
        $raw = $decoded;
    }
    if (!is_array($raw)) {
        return new WP_Error('invalid_theme', 'Theme definition must be an object', array('status' => 400));
    }
    if (strlen((string) wp_json_encode($raw)) > UC_THEME_MAX_DEFINITION_BYTES) {
        return new WP_Error('theme_too_large', 'Theme definition exceeds ' . round(UC_THEME_MAX_DEFINITION_BYTES / 1024) . ' KB', array('status' => 400));
    }
    if (empty($raw['tokens']) || !is_array($raw['tokens'])) {
        return new WP_Error('invalid_theme', 'Theme definition needs a "tokens" object', array('status' => 400));
    }
    if (!empty($raw['tokens']['surface']) && !in_array($raw['tokens']['surface'], array('flat', 'glass', 'neumorphic', 'glossy', 'outline', 'minimal'), true)) {
        return new WP_Error('invalid_theme', 'Unknown surface "' . sanitize_text_field($raw['tokens']['surface']) . '"', array('status' => 400));
    }
    // tokens.recipes: recipe per role (mirrors uc-surface-recipes.ts). Unknown
    // entries are dropped rather than rejected, as the card's validator does.
    if (isset($raw['tokens']['recipes'])) {
        $recipes = array();
        $known = array('flat', 'glossy', 'embossed', 'inset', 'gradient-overlay', 'neon-glow', 'outline', 'glass', 'metallic', 'neumorphic', 'dashed', 'dots', 'minimal');
        $bar_only = array('dashed', 'dots', 'minimal');
        if (is_array($raw['tokens']['recipes'])) {
            foreach (array('control', 'track', 'fill', 'pane') as $role) {
                $v = isset($raw['tokens']['recipes'][$role]) ? $raw['tokens']['recipes'][$role] : null;
                if (!is_string($v) || !in_array($v, $known, true)) {
                    continue;
                }
                if (($role === 'control' || $role === 'pane') && in_array($v, $bar_only, true)) {
                    continue;
                }
                $recipes[$role] = $v;
            }
        }
        if ($recipes) {
            $raw['tokens']['recipes'] = $recipes;
        } else {
            unset($raw['tokens']['recipes']);
        }
    }
    if (isset($raw['css'])) {
        $problems = uc_theme_css_problems($raw['css']);
        if ($problems) {
            return new WP_Error('unsafe_css', 'Theme CSS rejected: ' . implode(', ', $problems), array('status' => 400));
        }
    }
    // Background tokens may carry inline artwork (kept in sync with
    // cssBackground in src/themes/uc-theme-validate.ts): same payload scan as
    // CSS, tighter length caps.
    foreach (array('page_background' => UC_THEME_MAX_PAGE_BACKGROUND_CHARS, 'pane_background' => UC_THEME_MAX_PANE_BACKGROUND_CHARS) as $token => $max) {
        if (!isset($raw['tokens'][$token]) || !is_string($raw['tokens'][$token])) {
            continue;
        }
        $value = $raw['tokens'][$token];
        if (strlen($value) > $max) {
            return new WP_Error('invalid_theme', 'tokens.' . $token . ' longer than ' . $max . ' characters', array('status' => 400));
        }
        $problems = uc_theme_css_problems($value, $max);
        if ($problems) {
            return new WP_Error('unsafe_css', 'tokens.' . $token . ' rejected: ' . implode(', ', $problems), array('status' => 400));
        }
    }
    if (isset($raw['preview']) && is_string($raw['preview']) && !preg_match('#^(https://|data:image/(png|jpe?g|webp);base64,)#i', $raw['preview'])) {
        unset($raw['preview']);
    }

    // Only the allow-listed top-level keys are stored.
    $allowed = array('name', 'version', 'author', 'description', 'preview', 'icon', 'tokens', 'card', 'modules', 'css');
    $clean = array();
    foreach ($allowed as $key) {
        if (array_key_exists($key, $raw)) {
            $clean[$key] = $raw[$key];
        }
    }
    foreach (array('name', 'author', 'description', 'icon') as $key) {
        if (isset($clean[$key])) {
            $clean[$key] = sanitize_text_field((string) $clean[$key]);
        }
    }
    if (isset($clean['version'])) {
        $clean['version'] = max(1, (int) $clean['version']);
    }
    return $clean;
}

function uc_get_theme_definition($post_id) {
    $json = get_post_meta($post_id, UC_THEME_META_DEFINITION, true);
    if (!is_string($json) || $json === '') {
        return null;
    }
    $decoded = json_decode($json, true);
    return is_array($decoded) ? $decoded : null;
}

function uc_set_theme_definition($post_id, array $definition) {
    update_post_meta($post_id, UC_THEME_META_DEFINITION, wp_json_encode($definition));
    update_post_meta($post_id, '_uc_theme_version', isset($definition['version']) ? (int) $definition['version'] : 1);
}

function uc_apply_theme_tags($post_id, $tags_csv) {
    if (!taxonomy_exists(UC_THEME_TAG_TAXONOMY)) {
        return;
    }
    $tags = array_values(array_filter(array_map('trim', explode(',', (string) $tags_csv))));
    $tags = array_slice(array_map('sanitize_text_field', $tags), 0, 12);
    wp_set_object_terms($post_id, $tags, UC_THEME_TAG_TAXONOMY, false);
}

/**
 * Listing copy of a definition: heavy fields (an inline wallpaper, big CSS)
 * are left out so a catalog page stays small. Returns the trimmed definition
 * and whether anything was removed; GET /themes/{id} always returns the whole thing.
 */
function uc_theme_light_definition(array $definition) {
    $partial = false;
    foreach (array('page_background', 'pane_background') as $token) {
        if (isset($definition['tokens'][$token]) && is_string($definition['tokens'][$token]) && strlen($definition['tokens'][$token]) > UC_THEME_LIST_FIELD_LIMIT) {
            unset($definition['tokens'][$token]);
            $partial = true;
        }
    }
    if (isset($definition['css']) && is_string($definition['css']) && strlen($definition['css']) > UC_THEME_LIST_FIELD_LIMIT * 4) {
        unset($definition['css']);
        $partial = true;
    }
    return array($definition, $partial);
}

/**
 * API shape for a theme post. `$light` trims heavy definition fields for
 * listings (see uc_theme_light_definition) and flags it with definition_partial.
 */
function uc_normalize_theme($post, $include_definition = true, $light = false) {
    $post = get_post($post);
    if (!$post || $post->post_type !== UC_THEME_POST_TYPE) {
        return null;
    }

    $author_user = get_user_by('id', $post->post_author);
    $author_name = $author_user ? $author_user->display_name : 'Unknown';
    $is_official = false;
    if ($author_user) {
        $is_official = user_can($author_user, 'manage_options')
            || stripos($author_name, 'WJD') !== false
            || stripos($author_name, 'Ultra Card') !== false;
    }
    $source = $is_official ? 'official' : 'community';

    $tags = array();
    if (taxonomy_exists(UC_THEME_TAG_TAXONOMY)) {
        $terms = get_the_terms($post->ID, UC_THEME_TAG_TAXONOMY);
        if (!is_wp_error($terms) && $terms) {
            $tags = wp_list_pluck($terms, 'name');
        }
    }

    $catalog_id = uc_theme_catalog_id($post);
    $preview = get_the_post_thumbnail_url($post->ID, 'large') ?: '';
    $definition = $include_definition ? uc_get_theme_definition($post->ID) : null;
    if (is_array($definition)) {
        // The card keys its library by this id; make sure the stored document agrees.
        $definition['id'] = $catalog_id;
        $definition['name'] = get_the_title($post);
        $definition['source'] = $source;
        if (!isset($definition['author']) || $definition['author'] === '') {
            $definition['author'] = $author_name;
        }
        if ($preview && empty($definition['preview'])) {
            $definition['preview'] = $preview;
        }
        if (!isset($definition['description']) || $definition['description'] === '') {
            $definition['description'] = wp_strip_all_tags($post->post_content);
        }
    }

    $pending = get_post_meta($post->ID, '_uc_pending_revision', true);
    $rating_agg = uc_theme_rating_aggregate($post->ID);

    $out = array(
        'id'                   => (int) $post->ID,
        'catalog_id'           => $catalog_id,
        'slug'                 => $post->post_name,
        'name'                 => get_the_title($post),
        'description'          => wp_strip_all_tags($post->post_content),
        'tags'                 => $tags,
        'status'               => $post->post_status,
        'review_status'        => uc_get_theme_review_status($post),
        'moderator_note'       => (string) get_post_meta($post->ID, '_uc_moderator_note', true),
        'has_pending_revision' => is_array($pending) && !empty($pending),
        'preview'              => $preview,
        'downloads'            => (int) get_post_meta($post->ID, 'downloads', true),
        'rating'               => $rating_agg['rating'],
        'rating_count'         => $rating_agg['rating_count'],
        'version'              => max(1, (int) get_post_meta($post->ID, '_uc_theme_version', true)),
        'submitted_at'         => (string) get_post_meta($post->ID, '_uc_submitted_at', true),
        'reviewed_at'          => (string) get_post_meta($post->ID, '_uc_reviewed_at', true),
        'author_id'            => (int) $post->post_author,
        'author'               => $author_name,
        'source'               => $source,
        'date'                 => $post->post_date_gmt,
        'modified'             => $post->post_modified_gmt,
    );
    if ($include_definition) {
        $partial = false;
        if ($light && is_array($definition)) {
            list($definition, $partial) = uc_theme_light_definition($definition);
        }
        $out['definition'] = $definition;
        $out['definition_partial'] = $partial;
        if (is_array($pending) && !empty($pending)) {
            $out['pending_revision'] = $pending;
        }
    }
    return $out;
}

// ---------------------------------------------------------------------------
// Plugin class
// ---------------------------------------------------------------------------

class UltraCardThemeAuthoring {
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'register_cpt_and_taxonomies'), 5);
        add_action('rest_api_init', array($this, 'register_routes'));

        add_action('save_post_' . UC_THEME_POST_TYPE, array($this, 'invalidate_list_cache'));
        add_action('deleted_post', array($this, 'invalidate_list_cache'));
        add_action('trashed_post', array($this, 'invalidate_list_cache'));
        add_action('transition_post_status', array($this, 'on_status_transition'), 10, 3);

        add_filter('template_include', array($this, 'template_include'), 98);
        add_action('template_redirect', array($this, 'maybe_require_login'), 5);

        add_filter('manage_' . UC_THEME_POST_TYPE . '_posts_columns', array($this, 'admin_columns'));
        add_action('manage_' . UC_THEME_POST_TYPE . '_posts_custom_column', array($this, 'admin_column_value'), 10, 2);
    }

    public function register_cpt_and_taxonomies() {
        register_post_type(UC_THEME_POST_TYPE, array(
            'labels' => array(
                'name'          => 'Ultra Themes',
                'singular_name' => 'Ultra Theme',
                'add_new_item'  => 'Add New Theme',
                'edit_item'     => 'Edit Theme',
                'menu_name'     => 'Ultra Themes',
            ),
            'public'              => false,
            'publicly_queryable'  => false,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'menu_icon'           => 'dashicons-art',
            'show_in_rest'        => false,
            'supports'            => array('title', 'editor', 'author', 'thumbnail', 'custom-fields'),
            'capability_type'     => 'post',
            'map_meta_cap'        => true,
            'has_archive'         => false,
            'rewrite'             => false,
            'exclude_from_search' => true,
        ));

        register_taxonomy(UC_THEME_TAG_TAXONOMY, UC_THEME_POST_TYPE, array(
            'labels'       => array('name' => 'Theme Tags', 'singular_name' => 'Theme Tag'),
            'hierarchical' => false,
            'public'       => false,
            'show_ui'      => true,
            'show_in_rest' => false,
            'rewrite'      => false,
        ));
    }

    /**
     * Whether the current request is a specific page slug (pretty permalink or ?pagename=).
     */
    private function is_page_request($slug) {
        if (is_page($slug)) {
            return true;
        }
        $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH);
        $path = untrailingslashit($path ?: '');
        return $path === '/' . $slug || $path === $slug;
    }

    /**
     * /theme-builder/ and /themes/ are ordinary WP pages whose body the plugin
     * replaces, the same way /add-preset/ and /dashboard/ work.
     */
    public function template_include($template) {
        $map = array(
            'theme-builder' => 'templates/page-theme-builder.php',
            'themes'        => 'templates/page-themes.php',
        );
        foreach ($map as $slug => $file) {
            if (!$this->is_page_request($slug)) {
                continue;
            }
            $custom = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . $file;
            if (!file_exists($custom)) {
                continue;
            }
            // Works with or without a WP page of that slug: undo the 404 WP
            // would otherwise send when the page has not been created yet.
            if (is_404()) {
                global $wp_query;
                $wp_query->is_404 = false;
                status_header(200);
            }
            return $custom;
        }
        return $template;
    }

    public function maybe_require_login() {
        if (is_user_logged_in()) {
            return;
        }
        if ($this->is_page_request('theme-builder')) {
            $back = home_url('/theme-builder/');
            if (!empty($_GET['id'])) {
                $back = add_query_arg('id', (int) $_GET['id'], $back);
            } elseif (!empty($_GET['fork'])) {
                $back = add_query_arg('fork', (int) $_GET['fork'], $back);
            } elseif (isset($_GET['import']) && $_GET['import'] === 'session') {
                $back = add_query_arg('import', 'session', $back);
            }
            wp_safe_redirect(wp_login_url($back));
            exit;
        }
    }

    public function invalidate_list_cache($post_id = 0) {
        if ($post_id && get_post_type($post_id) !== UC_THEME_POST_TYPE) {
            return;
        }
        global $wpdb;
        $like = $wpdb->esc_like('_transient_uc_themes_') . '%';
        $timeout_like = $wpdb->esc_like('_transient_timeout_uc_themes_') . '%';
        $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s", $like, $timeout_like));
    }

    public function on_status_transition($new_status, $old_status, $post) {
        if (!$post instanceof WP_Post || $post->post_type !== UC_THEME_POST_TYPE) {
            return;
        }
        if ($new_status !== $old_status) {
            $this->invalidate_list_cache($post->ID);
        }
    }

    public function admin_columns($columns) {
        $columns['uc_review'] = 'Review';
        $columns['uc_downloads'] = 'Downloads';
        $columns['uc_rating'] = 'Rating';
        return $columns;
    }

    public function admin_column_value($column, $post_id) {
        if ($column === 'uc_review') {
            $post = get_post($post_id);
            echo esc_html(uc_get_theme_review_status($post));
            if (get_post_meta($post_id, '_uc_pending_revision', true)) {
                echo ' <em>(revision queued)</em>';
            }
        } elseif ($column === 'uc_downloads') {
            echo (int) get_post_meta($post_id, 'downloads', true);
        } elseif ($column === 'uc_rating') {
            $agg = uc_theme_rating_aggregate($post_id);
            echo $agg['rating_count'] ? esc_html($agg['rating'] . ' (' . $agg['rating_count'] . ')') : '—';
        }
    }

    // ------------------------------------------------------------------ REST

    public function check_auth() {
        return is_user_logged_in() || get_current_user_id() > 0;
    }

    public function check_moderator() {
        return current_user_can('manage_options');
    }

    public function register_routes() {
        $ns = 'ultra-card/v1';

        register_rest_route($ns, '/themes', array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'list_public_themes'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'submit_theme'),
                'permission_callback' => array($this, 'check_auth'),
            ),
        ));
        register_rest_route($ns, '/themes/mine', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'list_my_themes'),
            'permission_callback' => array($this, 'check_auth'),
        ));
        register_rest_route($ns, '/themes/moderation-queue', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'moderation_queue'),
            'permission_callback' => array($this, 'check_moderator'),
        ));
        register_rest_route($ns, '/themes/builtin', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'list_builtin_themes'),
            'permission_callback' => '__return_true',
        ));
        register_rest_route($ns, '/themes/(?P<id>\d+)', array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_theme'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'PUT',
                'callback'            => array($this, 'update_theme'),
                'permission_callback' => array($this, 'check_auth'),
            ),
            array(
                'methods'             => 'DELETE',
                'callback'            => array($this, 'delete_theme'),
                'permission_callback' => array($this, 'check_auth'),
            ),
        ));
        register_rest_route($ns, '/themes/(?P<id>\d+)/withdraw', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'withdraw_theme'),
            'permission_callback' => array($this, 'check_auth'),
        ));
        register_rest_route($ns, '/themes/(?P<id>\d+)/moderate', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'moderate_theme'),
            'permission_callback' => array($this, 'check_moderator'),
        ));
        register_rest_route($ns, '/themes/(?P<id>\d+)/rate', array(
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'rate_theme'),
                'permission_callback' => array($this, 'check_auth'),
            ),
            array(
                'methods'             => 'DELETE',
                'callback'            => array($this, 'unrate_theme'),
                'permission_callback' => array($this, 'check_auth'),
            ),
        ));
        register_rest_route($ns, '/themes/(?P<id>\d+)/track-download', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'track_download'),
            'permission_callback' => '__return_true',
        ));
    }

    /**
     * GET /themes/builtin — the themes that ship inside the card, exported by
     * the card build to website/builtin-themes.json and delivered through the
     * website harness (same channel/ref as the page fragments). They are not
     * posts, so there are no ratings or download counts; the gallery lists
     * them under Default next to the official catalog entries.
     */
    public function list_builtin_themes($request) {
        $force = (bool) $request->get_param('refresh') && current_user_can('manage_options');
        $body = null;
        $origin = '';
        $sha = '';
        $error = '';

        // 1. The repo copy through the harness (follows the configured channel).
        if (class_exists('UltraCardWebsiteHarness')) {
            $asset = UltraCardWebsiteHarness::instance()->fetch_asset('builtin-themes', 'website/builtin-themes.json', $force);
            $decoded = is_array($asset) && $asset['html'] !== '' ? json_decode($asset['html'], true) : null;
            if (is_array($decoded) && isset($decoded['themes']) && is_array($decoded['themes'])) {
                $body = $decoded;
                $origin = 'harness';
                $sha = (string) $asset['sha'];
            } elseif (is_array($asset) && !empty($asset['error'])) {
                $error = (string) $asset['error'];
            }
        }

        // 2. The copy packaged with this plugin release (data/builtin-themes.json).
        if ($body === null) {
            $bundled = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'data/builtin-themes.json';
            if (file_exists($bundled)) {
                // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
                $decoded = json_decode((string) file_get_contents($bundled), true);
                if (is_array($decoded) && isset($decoded['themes']) && is_array($decoded['themes'])) {
                    $body = $decoded;
                    $origin = 'bundled';
                    $sha = defined('ULTRA_CARD_INTEGRATION_VERSION') ? 'plugin-' . ULTRA_CARD_INTEGRATION_VERSION : 'plugin';
                }
            }
        }

        if ($body === null) {
            return new WP_Error(
                'uc_builtin_unavailable',
                $error ? 'Could not load built-in themes: ' . $error : 'Built-in themes are not available.',
                array('status' => 502)
            );
        }
        $themes = array();
        foreach ($body['themes'] as $def) {
            if (!is_array($def) || empty($def['id']) || empty($def['tokens'])) {
                continue;
            }
            $def['source'] = 'builtin';
            $themes[] = array(
                'id'          => 'builtin-' . sanitize_title($def['id']),
                'catalog_id'  => (string) $def['id'],
                'name'        => isset($def['name']) ? (string) $def['name'] : (string) $def['id'],
                'description' => isset($def['description']) ? (string) $def['description'] : '',
                'tags'        => isset($def['tags']) && is_array($def['tags']) ? array_values(array_map('strval', $def['tags'])) : array(),
                'preview'     => isset($def['preview']) ? (string) $def['preview'] : '',
                'version'     => isset($def['version']) ? (int) $def['version'] : 1,
                'author'      => isset($def['author']) && $def['author'] !== '' ? (string) $def['author'] : 'Ultra Card',
                'source'      => 'builtin',
                'definition'  => $def,
            );
        }
        $response = rest_ensure_response(array(
            'themes'       => $themes,
            'total'        => count($themes),
            'card_version' => isset($body['cardVersion']) ? (string) $body['cardVersion'] : '',
            'origin'       => $origin,
            'sha'          => $sha,
        ));
        $response->header('Cache-Control', 'public, max-age=600');
        return $response;
    }

    /**
     * GET /themes — published catalog, cached 10 minutes per query.
     */
    public function list_public_themes($request) {
        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) ($request->get_param('per_page') ?: 50)));
        $search = sanitize_text_field($request->get_param('search') ?: '');
        $tag = sanitize_text_field($request->get_param('tag') ?: '');
        $orderby = sanitize_text_field($request->get_param('orderby') ?: 'date');
        if (!in_array($orderby, array('date', 'downloads', 'title', 'rating'), true)) {
            $orderby = 'date';
        }

        $cache_key = 'uc_themes_' . md5(wp_json_encode(compact('page', 'per_page', 'search', 'tag', 'orderby')));
        $cached = get_transient($cache_key);
        if (is_array($cached) && isset($cached['body'], $cached['total'], $cached['total_pages'])) {
            $body = $cached['body'];
            $body['themes'] = uc_theme_attach_my_ratings($body['themes']);
            $response = rest_ensure_response($body);
            $response->header('X-WP-Total', (string) $cached['total']);
            $response->header('X-WP-TotalPages', (string) $cached['total_pages']);
            $response->header('X-UC-Cache', 'HIT');
            return $response;
        }

        $args = array(
            'post_type'      => UC_THEME_POST_TYPE,
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'paged'          => $page,
            'order'          => 'DESC',
        );
        if ($orderby === 'downloads') {
            $args['meta_key'] = 'downloads';
            $args['orderby'] = 'meta_value_num';
        } elseif ($orderby === 'rating') {
            $args['meta_key'] = '_uc_rating_avg';
            $args['orderby'] = array('meta_value_num' => 'DESC', 'date' => 'DESC');
        } elseif ($orderby === 'title') {
            $args['orderby'] = 'title';
            $args['order'] = 'ASC';
        } else {
            $args['orderby'] = 'date';
        }
        if ($search) {
            $args['s'] = $search;
        }
        if ($tag && taxonomy_exists(UC_THEME_TAG_TAXONOMY)) {
            $args['tax_query'] = array(array(
                'taxonomy' => UC_THEME_TAG_TAXONOMY,
                'field'    => 'slug',
                'terms'    => $tag,
            ));
        }

        $q = new WP_Query($args);
        $items = array();
        foreach ($q->posts as $post) {
            $norm = uc_normalize_theme($post, true, true);
            if ($norm) {
                $items[] = $norm;
            }
        }

        $body = array(
            'themes'      => $items,
            'total'       => (int) $q->found_posts,
            'total_pages' => (int) $q->max_num_pages,
            'page'        => $page,
        );
        set_transient($cache_key, array(
            'body'        => $body,
            'total'       => (int) $q->found_posts,
            'total_pages' => (int) $q->max_num_pages,
        ), 10 * MINUTE_IN_SECONDS);

        $body['themes'] = uc_theme_attach_my_ratings($body['themes']);
        $response = rest_ensure_response($body);
        $response->header('X-WP-Total', (string) $q->found_posts);
        $response->header('X-WP-TotalPages', (string) $q->max_num_pages);
        $response->header('X-UC-Cache', 'MISS');
        return $response;
    }

    public function list_my_themes($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }
        $q = new WP_Query(array(
            'post_type'      => UC_THEME_POST_TYPE,
            'post_status'    => array('publish', 'pending', 'draft', 'private', 'future'),
            'author'         => $user_id,
            'posts_per_page' => 100,
            'orderby'        => 'modified',
            'order'          => 'DESC',
        ));
        $items = array();
        foreach ($q->posts as $post) {
            $norm = uc_normalize_theme($post, true);
            if ($norm) {
                $items[] = $norm;
            }
        }
        return rest_ensure_response(array('themes' => $items));
    }

    public function get_theme($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_theme_post($id)) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }
        if ($post->post_status !== 'publish' && !uc_user_can_manage_theme($post)) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }
        $norm = uc_normalize_theme($post, true);
        $norm['my_rating'] = uc_theme_my_rating($id, get_current_user_id());
        return rest_ensure_response($norm);
    }

    /**
     * Pull the editable fields out of a request body (JSON or form).
     */
    private function read_fields($request) {
        $params = $request->get_json_params();
        if (!is_array($params)) {
            $params = array();
        }
        foreach (array('name', 'description', 'tags', 'definition', 'preview_image_id') as $key) {
            if (!isset($params[$key]) && $request->get_param($key) !== null) {
                $params[$key] = $request->get_param($key);
            }
        }
        $fields = array();
        if (isset($params['name'])) {
            $fields['name'] = sanitize_text_field($params['name']);
        }
        if (isset($params['description'])) {
            $fields['description'] = sanitize_textarea_field($params['description']);
        }
        if (isset($params['tags'])) {
            $fields['tags'] = is_array($params['tags'])
                ? sanitize_text_field(implode(',', $params['tags']))
                : sanitize_text_field($params['tags']);
        }
        if (isset($params['preview_image_id'])) {
            $fields['preview_image_id'] = (int) $params['preview_image_id'];
        }
        if (isset($params['definition'])) {
            $definition = uc_theme_sanitize_definition($params['definition']);
            if (is_wp_error($definition)) {
                return $definition;
            }
            $fields['definition'] = $definition;
        }
        return $fields;
    }

    /**
     * POST /themes — new submission, goes to pending review.
     */
    public function submit_theme($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }
        $fields = $this->read_fields($request);
        if (is_wp_error($fields)) {
            return $fields;
        }
        if (empty($fields['name'])) {
            return new WP_Error('missing_field', 'Theme name is required', array('status' => 400));
        }
        if (empty($fields['definition'])) {
            return new WP_Error('missing_field', 'Theme definition is required', array('status' => 400));
        }

        // Light per-user throttle: 10 new submissions per day.
        $throttle_key = 'uc_theme_submit_' . $user_id;
        $count = (int) get_transient($throttle_key);
        if ($count >= 10) {
            return new WP_Error('rate_limited', 'Too many theme submissions today. Try again tomorrow.', array('status' => 429));
        }
        set_transient($throttle_key, $count + 1, DAY_IN_SECONDS);

        $post_id = wp_insert_post(array(
            'post_type'    => UC_THEME_POST_TYPE,
            'post_status'  => 'pending',
            'post_title'   => $fields['name'],
            'post_content' => isset($fields['description']) ? $fields['description'] : '',
            'post_author'  => $user_id,
        ), true);
        if (is_wp_error($post_id)) {
            return $post_id;
        }

        $definition = $fields['definition'];
        $definition['version'] = 1;
        uc_set_theme_definition($post_id, $definition);
        update_post_meta($post_id, '_uc_review_status', 'pending');
        update_post_meta($post_id, '_uc_submitted_at', current_time('mysql'));
        update_post_meta($post_id, 'downloads', 0);
        if (!empty($fields['preview_image_id'])) {
            set_post_thumbnail($post_id, $fields['preview_image_id']);
        }
        if (isset($fields['tags'])) {
            uc_apply_theme_tags($post_id, $fields['tags']);
        }

        $norm = uc_normalize_theme(get_post($post_id), true);
        $norm['message'] = 'Theme submitted for review.';
        $response = rest_ensure_response($norm);
        $response->set_status(201);
        return $response;
    }

    /**
     * PUT /themes/{id} — published themes queue a revision, others edit in place.
     */
    public function update_theme($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_theme_post($id)) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }
        if (!uc_user_can_manage_theme($post)) {
            return new WP_Error('forbidden', 'You do not own this theme', array('status' => 403));
        }
        $fields = $this->read_fields($request);
        if (is_wp_error($fields)) {
            return $fields;
        }

        if ($post->post_status === 'publish') {
            $current = uc_get_theme_definition($id) ?: array();
            $revision = array_merge(array(
                'name'             => get_the_title($post),
                'description'      => $post->post_content,
                'tags'             => '',
                'definition'       => $current,
                'preview_image_id' => (int) get_post_thumbnail_id($id),
                'queued_at'        => current_time('mysql'),
            ), $fields);
            if (!isset($fields['tags'])) {
                $terms = get_the_terms($id, UC_THEME_TAG_TAXONOMY);
                if (!is_wp_error($terms) && $terms) {
                    $revision['tags'] = implode(',', wp_list_pluck($terms, 'name'));
                }
            }
            update_post_meta($id, '_uc_pending_revision', $revision);
            update_post_meta($id, '_uc_review_status', 'pending');
            update_post_meta($id, '_uc_submitted_at', current_time('mysql'));
            delete_post_meta($id, '_uc_moderator_note');

            $norm = uc_normalize_theme($post, true);
            $norm['message'] = 'Update submitted for review. Your live theme stays published until approved.';
            return rest_ensure_response($norm);
        }

        $update = array('ID' => $id);
        if (isset($fields['name'])) {
            $update['post_title'] = $fields['name'];
        }
        if (isset($fields['description'])) {
            $update['post_content'] = $fields['description'];
        }
        $review = uc_get_theme_review_status($post);
        if (in_array($review, array('rejected', 'changes_requested'), true) || $post->post_status === 'draft') {
            $update['post_status'] = 'pending';
            update_post_meta($id, '_uc_review_status', 'pending');
            delete_post_meta($id, '_uc_moderator_note');
            update_post_meta($id, '_uc_submitted_at', current_time('mysql'));
        }
        wp_update_post($update);

        if (isset($fields['definition'])) {
            $definition = $fields['definition'];
            $definition['version'] = max(1, (int) get_post_meta($id, '_uc_theme_version', true));
            uc_set_theme_definition($id, $definition);
        }
        if (isset($fields['preview_image_id'])) {
            if ($fields['preview_image_id'] > 0) {
                set_post_thumbnail($id, $fields['preview_image_id']);
            } else {
                delete_post_thumbnail($id);
            }
        }
        if (isset($fields['tags'])) {
            uc_apply_theme_tags($id, $fields['tags']);
        }

        $norm = uc_normalize_theme(get_post($id), true);
        $norm['message'] = 'Theme saved.';
        return rest_ensure_response($norm);
    }

    public function delete_theme($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_theme_post($id)) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }
        if (!uc_user_can_manage_theme($post)) {
            return new WP_Error('forbidden', 'You do not own this theme', array('status' => 403));
        }
        wp_trash_post($id);
        return rest_ensure_response(array('success' => true, 'id' => $id));
    }

    public function withdraw_theme($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_theme_post($id)) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }
        if (!uc_user_can_manage_theme($post)) {
            return new WP_Error('forbidden', 'You do not own this theme', array('status' => 403));
        }
        $pending = get_post_meta($id, '_uc_pending_revision', true);
        if (is_array($pending) && !empty($pending)) {
            delete_post_meta($id, '_uc_pending_revision');
            update_post_meta($id, '_uc_review_status', 'approved');
            delete_post_meta($id, '_uc_moderator_note');
            $norm = uc_normalize_theme(get_post($id), true);
            $norm['message'] = 'Pending update withdrawn. Live theme unchanged.';
            return rest_ensure_response($norm);
        }
        if ($post->post_status === 'pending') {
            wp_update_post(array('ID' => $id, 'post_status' => 'draft'));
            update_post_meta($id, '_uc_review_status', 'pending');
            $norm = uc_normalize_theme(get_post($id), true);
            $norm['message'] = 'Submission withdrawn (saved as draft).';
            return rest_ensure_response($norm);
        }
        return new WP_Error('nothing_to_withdraw', 'No pending submission or revision to withdraw', array('status' => 400));
    }

    public function moderation_queue($request) {
        $pending_posts = get_posts(array(
            'post_type'      => UC_THEME_POST_TYPE,
            'post_status'    => array('pending', 'draft'),
            'posts_per_page' => 100,
            'orderby'        => 'date',
            'order'          => 'ASC',
        ));
        $revision_posts = get_posts(array(
            'post_type'      => UC_THEME_POST_TYPE,
            'post_status'    => 'publish',
            'posts_per_page' => 100,
            'meta_query'     => array(array('key' => '_uc_pending_revision', 'compare' => 'EXISTS')),
        ));
        $items = array();
        $seen = array();
        foreach (array_merge($pending_posts, $revision_posts) as $post) {
            if (isset($seen[$post->ID])) {
                continue;
            }
            $seen[$post->ID] = true;
            $norm = uc_normalize_theme($post, true);
            if ($norm) {
                $items[] = $norm;
            }
        }
        return rest_ensure_response(array('themes' => $items));
    }

    public function moderate_theme($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_theme_post($id)) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }
        $params = $request->get_json_params();
        if (!is_array($params)) {
            $params = array();
        }
        $action = sanitize_text_field($params['action'] ?? $request->get_param('action') ?? '');
        $note = sanitize_textarea_field($params['note'] ?? $request->get_param('note') ?? '');
        if (!in_array($action, array('approve', 'request_changes', 'reject'), true)) {
            return new WP_Error('invalid_action', 'action must be approve, request_changes, or reject', array('status' => 400));
        }
        $result = $this->apply_moderation($post, $action, $note);
        if (is_wp_error($result)) {
            return $result;
        }
        $this->invalidate_list_cache($id);
        return rest_ensure_response(uc_normalize_theme(get_post($id), true));
    }

    public function apply_moderation($post, $action, $note = '') {
        $id = $post->ID;
        $pending = get_post_meta($id, '_uc_pending_revision', true);
        $author = get_user_by('id', $post->post_author);

        if ($action === 'approve') {
            if (is_array($pending) && !empty($pending)) {
                $update = array('ID' => $id);
                if (!empty($pending['name'])) {
                    $update['post_title'] = sanitize_text_field($pending['name']);
                }
                if (isset($pending['description'])) {
                    $update['post_content'] = sanitize_textarea_field($pending['description']);
                }
                wp_update_post($update);
                if (isset($pending['definition']) && is_array($pending['definition'])) {
                    $definition = uc_theme_sanitize_definition($pending['definition']);
                    if (!is_wp_error($definition)) {
                        // Every approved revision bumps the version so installed copies know to refresh.
                        $definition['version'] = max(1, (int) get_post_meta($id, '_uc_theme_version', true)) + 1;
                        uc_set_theme_definition($id, $definition);
                    }
                }
                if (isset($pending['preview_image_id'])) {
                    if ((int) $pending['preview_image_id'] > 0) {
                        set_post_thumbnail($id, (int) $pending['preview_image_id']);
                    } else {
                        delete_post_thumbnail($id);
                    }
                }
                if (isset($pending['tags'])) {
                    uc_apply_theme_tags($id, $pending['tags']);
                }
                delete_post_meta($id, '_uc_pending_revision');
            } else {
                wp_update_post(array('ID' => $id, 'post_status' => 'publish'));
            }
            update_post_meta($id, '_uc_review_status', 'approved');
            update_post_meta($id, '_uc_reviewed_at', current_time('mysql'));
            if ($note !== '') {
                update_post_meta($id, '_uc_moderator_note', $note);
            } else {
                delete_post_meta($id, '_uc_moderator_note');
            }
            $this->email_author($author, $post, 'approved', $note);
            return true;
        }

        if ($action === 'request_changes') {
            update_post_meta($id, '_uc_review_status', 'changes_requested');
            update_post_meta($id, '_uc_moderator_note', $note);
            update_post_meta($id, '_uc_reviewed_at', current_time('mysql'));
            $this->email_author($author, $post, 'changes_requested', $note);
            return true;
        }

        if ($action === 'reject') {
            delete_post_meta($id, '_uc_pending_revision');
            update_post_meta($id, '_uc_review_status', 'rejected');
            update_post_meta($id, '_uc_moderator_note', $note);
            update_post_meta($id, '_uc_reviewed_at', current_time('mysql'));
            if ($post->post_status !== 'publish') {
                wp_update_post(array('ID' => $id, 'post_status' => 'draft'));
            }
            $this->email_author($author, $post, 'rejected', $note);
            return true;
        }

        return new WP_Error('invalid_action', 'Unknown action');
    }

    private function email_author($author, $post, $decision, $note) {
        if (!$author || empty($author->user_email)) {
            return;
        }
        $title = get_the_title($post);
        $subjects = array(
            'approved'          => sprintf('[Ultra Card] Your theme "%s" was approved', $title),
            'changes_requested' => sprintf('[Ultra Card] Changes requested for theme "%s"', $title),
            'rejected'          => sprintf('[Ultra Card] Your theme "%s" was not approved', $title),
        );
        $bodies = array(
            'approved'          => "Good news! Your theme \"{$title}\" has been approved and is now available in the Ultra Card Hub.\n",
            'changes_requested' => "A moderator reviewed your theme \"{$title}\" and requested changes before it can be published.\n",
            'rejected'          => "Your theme \"{$title}\" was not approved for the Ultra Card theme catalog.\n",
        );
        $subject = $subjects[$decision] ?? '[Ultra Card] Theme update';
        $body = $bodies[$decision] ?? '';
        if ($note !== '') {
            $body .= "\nModerator note:\n" . wp_strip_all_tags($note) . "\n";
        }
        $body .= "\nManage your themes: " . home_url('/dashboard/') . "\n";
        wp_mail($author->user_email, $subject, $body);
    }

    /**
     * POST /themes/{id}/rate — one rating (1..5) per user per published theme.
     * Authors cannot rate their own theme.
     */
    public function rate_theme($request) {
        $id = (int) $request['id'];
        $post = $id ? get_post($id) : null;
        if (!$post || !uc_is_theme_post($id) || $post->post_status !== 'publish') {
            return new WP_Error('invalid_theme', 'Theme not found', array('status' => 404));
        }
        $user_id = get_current_user_id();
        if ((int) $post->post_author === $user_id) {
            return new WP_Error('own_theme', 'You cannot rate your own theme', array('status' => 400));
        }
        $params = $request->get_json_params();
        $rating = (int) (is_array($params) && isset($params['rating']) ? $params['rating'] : $request->get_param('rating'));
        if ($rating < 1 || $rating > 5) {
            return new WP_Error('invalid_rating', 'rating must be 1 to 5', array('status' => 400));
        }
        $result = uc_theme_set_user_rating($id, $user_id, $rating);
        $this->invalidate_list_cache($id);
        $result['success'] = true;
        $result['id'] = $id;
        return rest_ensure_response($result);
    }

    public function unrate_theme($request) {
        $id = (int) $request['id'];
        $post = $id ? get_post($id) : null;
        if (!$post || !uc_is_theme_post($id)) {
            return new WP_Error('invalid_theme', 'Theme not found', array('status' => 404));
        }
        $result = uc_theme_set_user_rating($id, get_current_user_id(), 0);
        $this->invalidate_list_cache($id);
        $result['success'] = true;
        $result['id'] = $id;
        return rest_ensure_response($result);
    }

    /**
     * POST /themes/{id}/track-download — 1 bump per IP per theme per hour.
     */
    public function track_download($request) {
        $id = (int) $request['id'];
        $post = $id ? get_post($id) : null;
        if (!$post || !uc_is_theme_post($id) || $post->post_status !== 'publish') {
            return new WP_Error('invalid_theme', 'Theme not found', array('status' => 404));
        }
        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
        $throttle_key = 'uc_tdl_' . md5($ip . '_' . $id);
        if (get_transient($throttle_key)) {
            return rest_ensure_response(array(
                'success'   => true,
                'downloads' => (int) get_post_meta($id, 'downloads', true),
                'throttled' => true,
            ));
        }
        set_transient($throttle_key, 1, HOUR_IN_SECONDS);
        $next = (int) get_post_meta($id, 'downloads', true) + 1;
        update_post_meta($id, 'downloads', $next);
        $this->invalidate_list_cache($id);
        return rest_ensure_response(array('success' => true, 'downloads' => $next));
    }
}

UltraCardThemeAuthoring::instance();
