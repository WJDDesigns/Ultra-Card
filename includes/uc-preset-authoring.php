<?php
/**
 * Ultra Card — Native Preset Authoring
 *
 * Absorbed WPCode snippets, author-scoped REST API, revision model,
 * admin moderation, ultra_preset CPT + migration, and public templates.
 *
 * @package UltraCardIntegration
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Option / meta keys used by preset authoring.
 */
if (!defined('UC_PRESET_DISCORD_WEBHOOK_OPTION')) {
    define('UC_PRESET_DISCORD_WEBHOOK_OPTION', 'ultra_card_preset_discord_webhook');
}
if (!defined('UC_PRESET_MIGRATION_OPTION')) {
    define('UC_PRESET_MIGRATION_OPTION', 'ultra_card_preset_migration_state');
}

/**
 * Resolve the active preset post type (Directories Pro listing or native ultra_preset).
 *
 * @return string
 */
function uc_preset_post_type() {
    if (post_type_exists('ultra_preset')) {
        if (class_exists('UltraCardPresetAuthoring') && UltraCardPresetAuthoring::instance()->is_cutover_complete()) {
            return 'ultra_preset';
        }
        $state = get_option(UC_PRESET_MIGRATION_OPTION, array());
        if (!empty($state['cutover_complete'])) {
            return 'ultra_preset';
        }
    }
    foreach (array('presets_dir_ltg', 'ultra_preset', 'presets') as $pt) {
        if (post_type_exists($pt)) {
            return $pt;
        }
    }
    return 'presets_dir_ltg';
}

/**
 * All known preset post types (for queries that span migration).
 *
 * @return string[]
 */
function uc_preset_post_types() {
    $types = array();
    foreach (array('ultra_preset', 'presets_dir_ltg', 'presets') as $pt) {
        if (post_type_exists($pt)) {
            $types[] = $pt;
        }
    }
    return !empty($types) ? $types : array('presets_dir_ltg');
}

/**
 * Category taxonomy for the active preset type.
 */
function uc_preset_category_taxonomy() {
    return uc_preset_post_type() === 'ultra_preset' ? 'uc_preset_category' : 'presets_dir_cat';
}

/**
 * Tag taxonomy for the active preset type.
 */
function uc_preset_tag_taxonomy() {
    return uc_preset_post_type() === 'ultra_preset' ? 'uc_preset_tag' : 'presets_dir_tag';
}

/**
 * Canonical preset categories — same set as ultracard.io/modules/.
 *
 * @return array<int, array{value:string,label:string,icon?:string}>
 */
function uc_preset_module_categories() {
    return array(
        array('value' => 'layout', 'label' => 'Layout', 'icon' => 'mdi-view-dashboard-outline'),
        array('value' => 'content', 'label' => 'Content', 'icon' => 'mdi-text-box-outline'),
        array('value' => 'data', 'label' => 'Data', 'icon' => 'mdi-chart-box-outline'),
        array('value' => 'interactive', 'label' => 'Controls', 'icon' => 'mdi-gesture-tap'),
        array('value' => 'input', 'label' => 'Inputs', 'icon' => 'mdi-form-textbox'),
        array('value' => 'media', 'label' => 'Media', 'icon' => 'mdi-image-multiple-outline'),
    );
}

/**
 * Ensure module-aligned category terms exist on every preset category taxonomy.
 *
 * @return void
 */
function uc_ensure_preset_module_category_terms() {
    $cats = uc_preset_module_categories();
    foreach (array('uc_preset_category', 'presets_dir_cat') as $tax) {
        if (!taxonomy_exists($tax)) {
            continue;
        }
        foreach ($cats as $cat) {
            $existing = get_term_by('slug', $cat['value'], $tax);
            if ($existing) {
                if ($existing->name !== $cat['label']) {
                    wp_update_term((int) $existing->term_id, $tax, array('name' => $cat['label']));
                }
                continue;
            }
            wp_insert_term($cat['label'], $tax, array('slug' => $cat['value']));
        }
    }
}

/**
 * Best-effort map of existing presets → module categories (by post ID).
 *
 * @return array<int, string>
 */
function uc_preset_category_remap_by_id() {
    return array(
        6059 => 'content',      // Câmera
        6060 => 'layout',       // Area
        6150 => 'data',         // RAM
        7259 => 'data',         // Car Card
        6838 => 'layout',       // Bubble Area Card
        6837 => 'layout',       // Area Card
        6152 => 'data',         // RAM
        6108 => 'data',         // mooseVehicle
        6041 => 'data',         // UPS Battery Glance
        5900 => 'content',      // Easter Clock
        5680 => 'data',         // mooseSolarBattery
        5201 => 'data',         // EV Charging Dashboard
        4897 => 'data',         // Security Card
        4825 => 'data',         // mooseSolarGrid
        4808 => 'data',         // mooseSolar
        4723 => 'interactive',  // Mini HVAC Card
        4640 => 'content',      // Sporet.no with popup
        4574 => 'interactive',  // BYD vehicle control
        4246 => 'content',      // Weather popup
        2742 => 'layout',       // Room Card
        2516 => 'media',        // Christmas Tree Background
        2496 => 'content',      // Geartronic Clock – Americano
        2492 => 'content',      // Geartronic Clock – Nordic
        2363 => 'content',      // Retro Clock with Sun progress
        2154 => 'data',         // My car card
        2120 => 'data',         // Nordic Car Widget
        1959 => 'interactive',  // Mini HVAC Card
        1715 => 'interactive',  // EV Car Status and charger
        1711 => 'content',      // Mushroom Chips
        1646 => 'content',      // Sun and Weather Clock
        1565 => 'content',      // Informative Camera Card
        1469 => 'interactive',  // HVAC Status
        942  => 'layout',       // Top and bottom bar
        818  => 'layout',       // Area Card
        795  => 'content',      // Dynamic sun progress clock
        637  => 'layout',       // Accordion
        617  => 'data',         // Modern Vehicle Card
        595  => 'content',      // Info Module Badge
        561  => 'content',      // Camera Icon Overlay
        555  => 'content',      // Clock, date and temp
        518  => 'content',      // Simple Weather Widget
        517  => 'content',      // Person Badge
    );
}

/**
 * Guess a module category from title/description when no explicit map exists.
 *
 * @param int $post_id
 * @return string
 */
function uc_guess_preset_module_category($post_id) {
    $by_id = uc_preset_category_remap_by_id();
    if (isset($by_id[$post_id])) {
        return $by_id[$post_id];
    }

    $post = get_post($post_id);
    $desc = (string) get_post_meta($post_id, '_uc_description', true);
    if ($desc === '') {
        $desc = (string) get_post_meta($post_id, '_drts_directory_description', true);
    }
    $hay = strtolower(trim(($post ? $post->post_title : '') . ' ' . $desc . ' ' . ($post ? wp_strip_all_tags($post->post_content) : '')));

    if (preg_match('/\b(background|christmas\s*tree|video\s*bg|screensaver)\b/', $hay)) {
        return 'media';
    }
    if (preg_match('/\b(hvac|climate|thermostat|vehicle\s*control|byd|charger\s*card)\b/', $hay)) {
        return 'interactive';
    }
    if (preg_match('/\b(solar|battery|ups|grid|ev\s*charg|vehicle|car\s*card|moosevehicle|security|door|window|energy|ram\b)\b/', $hay)) {
        return 'data';
    }
    if (preg_match('/\b(clock|weather|badge|person|mushroom|chip|sporet|camera|c[aâ]mera)\b/u', $hay)) {
        return 'content';
    }
    if (preg_match('/\b(area|room|accordion|accordian|top\s+and\s+bottom|bubble|overlay)\b/', $hay)) {
        return 'layout';
    }

    // Legacy taxonomy fallback.
    foreach (array('uc_preset_category', 'presets_dir_cat') as $tax) {
        if (!taxonomy_exists($tax)) {
            continue;
        }
        $terms = get_the_terms($post_id, $tax);
        if (is_wp_error($terms) || empty($terms)) {
            continue;
        }
        $slug = strtolower($terms[0]->slug);
        if (in_array($slug, array('layout', 'content', 'data', 'interactive', 'input', 'media'), true)) {
            return $slug;
        }
        if ($slug === 'badge' || $slug === 'badges') {
            return 'content';
        }
        if ($slug === 'layout' || $slug === 'layouts' || $slug === 'dashboard' || $slug === 'dashboards') {
            return 'layout';
        }
        if ($slug === 'widget' || $slug === 'widgets') {
            return 'content';
        }
    }

    return 'content';
}

/**
 * Remap all presets onto module categories. Optionally prune legacy badge/widget terms.
 *
 * @param bool $dry_run
 * @param bool $prune_legacy
 * @return array
 */
function uc_remap_preset_categories_to_modules($dry_run = true, $prune_legacy = true) {
    uc_ensure_preset_module_category_terms();

    $report = array(
        'dry_run'   => (bool) $dry_run,
        'updated'   => array(),
        'unchanged' => array(),
        'pruned'    => array(),
    );

    $posts = get_posts(array(
        'post_type'      => uc_preset_post_types(),
        'post_status'    => array('publish', 'pending', 'draft', 'private'),
        'posts_per_page' => 500,
        'fields'         => 'ids',
    ));

    $canonical = array();
    foreach (uc_preset_module_categories() as $c) {
        $canonical[$c['value']] = true;
    }

    foreach ($posts as $post_id) {
        $target = uc_guess_preset_module_category((int) $post_id);
        if (!isset($canonical[$target])) {
            $target = 'content';
        }

        $current = '';
        $primary_tax = taxonomy_exists(uc_preset_category_taxonomy())
            ? uc_preset_category_taxonomy()
            : 'presets_dir_cat';
        if (taxonomy_exists($primary_tax)) {
            $terms = get_the_terms($post_id, $primary_tax);
            if (!is_wp_error($terms) && !empty($terms)) {
                $current = $terms[0]->slug;
            }
        }

        $entry = array(
            'id'      => (int) $post_id,
            'title'   => get_the_title($post_id),
            'from'    => $current,
            'to'      => $target,
        );

        if ($current === $target) {
            $report['unchanged'][] = $entry;
            // Still mirror onto both taxonomies when running for real.
            if (!$dry_run) {
                foreach (array('uc_preset_category', 'presets_dir_cat') as $tax) {
                    if (!taxonomy_exists($tax)) {
                        continue;
                    }
                    $term = get_term_by('slug', $target, $tax);
                    if ($term && !is_wp_error($term)) {
                        wp_set_post_terms($post_id, array((int) $term->term_id), $tax);
                    }
                }
            }
            continue;
        }

        $report['updated'][] = $entry;
        if ($dry_run) {
            continue;
        }

        foreach (array('uc_preset_category', 'presets_dir_cat') as $tax) {
            if (!taxonomy_exists($tax)) {
                continue;
            }
            $term = get_term_by('slug', $target, $tax);
            if ($term && !is_wp_error($term)) {
                wp_set_post_terms($post_id, array((int) $term->term_id), $tax);
            }
        }
    }

    if (!$dry_run && $prune_legacy) {
        foreach (array('uc_preset_category', 'presets_dir_cat') as $tax) {
            if (!taxonomy_exists($tax)) {
                continue;
            }
            foreach (array('badge', 'badges', 'widget', 'widgets', 'custom', 'scenes', 'climate', 'energy', 'security', 'lights') as $legacy_slug) {
                // Keep layout — it is canonical.
                if ($legacy_slug === 'layout' || $legacy_slug === 'layouts') {
                    continue;
                }
                $term = get_term_by('slug', $legacy_slug, $tax);
                if (!$term || is_wp_error($term)) {
                    continue;
                }
                // Only delete when unused.
                $count = (int) $term->count;
                if ($count > 0) {
                    continue;
                }
                $deleted = wp_delete_term((int) $term->term_id, $tax);
                if (!is_wp_error($deleted) && $deleted) {
                    $report['pruned'][] = array('taxonomy' => $tax, 'slug' => $legacy_slug);
                }
            }
        }
        update_option('ultra_card_preset_categories_remapped', array(
            'at'      => current_time('mysql'),
            'updated' => count($report['updated']),
        ), false);
    }

    return $report;
}

/**
 * Whether a post ID is a preset listing.
 *
 * @param int $post_id
 * @return bool
 */
function uc_is_preset_post($post_id) {
    $post = get_post($post_id);
    if (!$post) {
        return false;
    }
    return in_array($post->post_type, uc_preset_post_types(), true);
}

/**
 * Read preset shortcode from known meta keys.
 *
 * @param int $post_id
 * @return string
 */
function uc_get_preset_shortcode($post_id) {
    $uc = get_post_meta($post_id, '_uc_preset_code', true);
    if (is_string($uc) && $uc !== '') {
        return $uc;
    }
    $raw = get_post_meta($post_id, '_drts_field_preset_code', true);
    if (is_array($raw) && isset($raw[0])) {
        return is_string($raw[0]) ? $raw[0] : (isset($raw[0]['value']) ? (string) $raw[0]['value'] : '');
    }
    if (is_string($raw) && $raw !== '') {
        return $raw;
    }
    $fallback = get_post_meta($post_id, 'preset_code', true);
    return is_string($fallback) ? $fallback : '';
}

/**
 * Write preset shortcode to clean _uc_* meta and mirror into Directories Pro keys.
 *
 * @param int    $post_id
 * @param string $shortcode
 */
function uc_set_preset_shortcode($post_id, $shortcode) {
    update_post_meta($post_id, '_uc_preset_code', $shortcode);
    update_post_meta($post_id, '_drts_field_preset_code', $shortcode);
    update_post_meta($post_id, 'preset_code', $shortcode);

    $existing = get_post_meta($post_id, '_drts_entity_meta', true);
    $entity_meta = is_array($existing) ? $existing : array();
    $entity_meta['preset_code'] = array($shortcode);
    update_post_meta($post_id, '_drts_entity_meta', $entity_meta);
    update_post_meta($post_id, 'drts_entity_meta', $entity_meta);
}

/**
 * Get gallery attachment IDs for a preset.
 *
 * @param int $post_id
 * @return int[]
 */
function uc_get_preset_photo_ids($post_id) {
    $uc = get_post_meta($post_id, '_uc_photo_ids', true);
    if (is_array($uc) && !empty($uc)) {
        return array_values(array_filter(array_map('intval', $uc)));
    }
    $dp = get_post_meta($post_id, '_drts_directory_photos', true);
    if (is_array($dp) && !empty($dp)) {
        $ids = array();
        foreach ($dp as $item) {
            if (is_numeric($item)) {
                $ids[] = (int) $item;
            } elseif (is_array($item) && isset($item['attachment_id'])) {
                $ids[] = (int) $item['attachment_id'];
            } elseif (is_array($item) && isset($item['id'])) {
                $ids[] = (int) $item['id'];
            }
        }
        return array_values(array_filter($ids));
    }
    $thumb = get_post_thumbnail_id($post_id);
    return $thumb ? array((int) $thumb) : array();
}

/**
 * Set featured image + optional gallery photos.
 * Combined list (featured first) is stored for DP / API photo_ids.
 *
 * @param int   $post_id
 * @param int   $featured_id Featured attachment ID (0 to clear when gallery empty)
 * @param int[] $gallery_ids Additional gallery attachment IDs
 */
function uc_set_preset_images($post_id, $featured_id, $gallery_ids = array()) {
    $featured_id = (int) $featured_id;
    $gallery_ids = array_values(array_filter(array_map('intval', (array) $gallery_ids)));
    if ($featured_id > 0) {
        $gallery_ids = array_values(array_filter($gallery_ids, function ($id) use ($featured_id) {
            return (int) $id !== $featured_id;
        }));
    }
    $all = $featured_id > 0 ? array_merge(array($featured_id), $gallery_ids) : $gallery_ids;
    update_post_meta($post_id, '_uc_photo_ids', $all);
    update_post_meta($post_id, '_drts_directory_photos', $all);
    if ($featured_id > 0) {
        set_post_thumbnail($post_id, $featured_id);
    } elseif (!empty($all)) {
        set_post_thumbnail($post_id, $all[0]);
    } else {
        delete_post_thumbnail($post_id);
    }
    foreach ($all as $aid) {
        wp_update_post(array('ID' => $aid, 'post_parent' => $post_id));
    }
}

/**
 * Set gallery photos and mirror to DP meta + featured image.
 * Backward compatible: first ID becomes the featured image.
 *
 * @param int   $post_id
 * @param int[] $photo_ids
 */
function uc_set_preset_photo_ids($post_id, $photo_ids) {
    $photo_ids = array_values(array_filter(array_map('intval', (array) $photo_ids)));
    if (empty($photo_ids)) {
        uc_set_preset_images($post_id, 0, array());
        return;
    }
    uc_set_preset_images($post_id, $photo_ids[0], array_slice($photo_ids, 1));
}

/**
 * Gallery image URLs for API responses.
 *
 * @param int $post_id
 * @return string[]
 */
function uc_get_preset_gallery_urls($post_id) {
    $urls = array();
    foreach (uc_get_preset_photo_ids($post_id) as $aid) {
        $url = wp_get_attachment_image_url($aid, 'large');
        if ($url) {
            $urls[] = $url;
        }
    }
    return $urls;
}

/**
 * Map WP post_status + _uc_review_status into author-facing review_status.
 *
 * @param WP_Post $post
 * @return string pending|approved|changes_requested|rejected
 */
function uc_get_review_status($post) {
    $stored = get_post_meta($post->ID, '_uc_review_status', true);
    if (in_array($stored, array('pending', 'approved', 'changes_requested', 'rejected'), true)) {
        return $stored;
    }
    if ($post->post_status === 'publish') {
        return 'approved';
    }
    if ($post->post_status === 'trash') {
        return 'rejected';
    }
    return 'pending';
}

/**
 * The current user's own preset votes, keyed by preset ID.
 *
 * Read in one query and cached per request: catalog responses normalize up to
 * 200 presets, so a per-preset meta lookup would be a query storm.
 *
 * @return array<int,int> preset ID => 1-5 rating
 */
function uc_get_current_user_ratings() {
    static $cache = array();

    $user_id = get_current_user_id();
    if (!$user_id) {
        return array();
    }
    if (isset($cache[$user_id])) {
        return $cache[$user_id];
    }

    global $wpdb;
    $rows = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT preset.meta_value AS preset_id, rating.meta_value AS rating
               FROM {$wpdb->posts} p
               INNER JOIN {$wpdb->postmeta} preset ON preset.post_id = p.ID AND preset.meta_key = 'preset_id'
               INNER JOIN {$wpdb->postmeta} rating ON rating.post_id = p.ID AND rating.meta_key = 'rating'
              WHERE p.post_type = 'ultra_review'
                AND p.post_status = 'publish'
                AND p.post_author = %d",
            $user_id
        )
    );

    $ratings = array();
    foreach ((array) $rows as $row) {
        $preset_id = (int) $row->preset_id;
        $rating    = (int) $row->rating;
        if ($preset_id && $rating >= 1 && $rating <= 5) {
            $ratings[$preset_id] = $rating;
        }
    }

    $cache[$user_id] = $ratings;
    return $ratings;
}

/**
 * Read the aggregate vote stored on a preset by _sync_reviews_to_drts_rating().
 *
 * @param int $preset_id
 * @return array{rating: float, rating_count: int}
 */
function uc_get_preset_rating_aggregate($preset_id) {
    $aggregate = array('rating' => 0.0, 'rating_count' => 0);

    $raw = maybe_unserialize(get_post_meta((int) $preset_id, '_drts_voting_rating', true));
    if (!is_array($raw)) {
        return $aggregate;
    }

    // DRTS has shipped three shapes of this meta over the years.
    $bucket = null;
    if (isset($raw['average'])) {
        $bucket = $raw;
    } elseif (isset($raw[0][''])) {
        $bucket = $raw[0][''];
    } elseif (isset($raw[''])) {
        $bucket = $raw[''];
    }

    if (is_array($bucket)) {
        $aggregate['rating']       = (float) ($bucket['average'] ?? 0);
        $aggregate['rating_count'] = (int) ($bucket['count'] ?? 0);
    }

    return $aggregate;
}

/**
 * Normalize a preset post into the author/public API shape.
 *
 * @param WP_Post|int $post
 * @param bool        $include_code Include shortcode (authors / public catalog both need it)
 * @return array|null
 */
function uc_normalize_preset($post, $include_code = true) {
    $post = get_post($post);
    if (!$post || !uc_is_preset_post($post->ID)) {
        return null;
    }

    $cat_tax = taxonomy_exists(uc_preset_category_taxonomy()) ? uc_preset_category_taxonomy() : 'presets_dir_cat';
    $tag_tax = taxonomy_exists(uc_preset_tag_taxonomy()) ? uc_preset_tag_taxonomy() : 'presets_dir_tag';

    $category = '';
    $cats = get_the_terms($post->ID, $cat_tax);
    if (!is_wp_error($cats) && !empty($cats)) {
        $category = $cats[0]->slug;
    }

    $tags = array();
    $tag_terms = get_the_terms($post->ID, $tag_tax);
    if (!is_wp_error($tag_terms) && !empty($tag_terms)) {
        $tags = wp_list_pluck($tag_terms, 'name');
    }

    $pending_revision = get_post_meta($post->ID, '_uc_pending_revision', true);
    if (!is_array($pending_revision)) {
        $pending_revision = null;
    }

    $downloads = (int) get_post_meta($post->ID, 'downloads', true);
    $photo_ids = uc_get_preset_photo_ids($post->ID);

    $author_name = get_the_author_meta('display_name', $post->post_author);
    $author_user = get_userdata($post->post_author);
    $is_official = false;
    if ($author_user) {
        $is_official = user_can($author_user, 'manage_options')
            || stripos($author_name, 'WJD') !== false
            || stripos($author_name, 'Ultra Card') !== false;
    }

    $featured_id = (int) get_post_thumbnail_id($post->ID);
    if (!$featured_id && !empty($photo_ids)) {
        $featured_id = (int) $photo_ids[0];
    }
    $featured_url = $featured_id ? (string) wp_get_attachment_image_url($featured_id, 'large') : '';
    $gallery = uc_get_preset_gallery_urls($post->ID);
    if (empty($gallery) && $featured_url) {
        $gallery = array($featured_url);
    }

    $data = array(
        'id'                   => (int) $post->ID,
        'name'                 => get_the_title($post),
        'description'          => $post->post_content,
        'category'             => $category,
        'tags'                 => array_values($tags),
        'integrations'         => (string) get_post_meta($post->ID, '_uc_integrations', true),
        'status'               => $post->post_status,
        'review_status'        => uc_get_review_status($post),
        'moderator_note'       => (string) get_post_meta($post->ID, '_uc_moderator_note', true),
        'has_pending_revision' => !empty($pending_revision),
        'pending_revision'     => $pending_revision,
        'gallery'              => $gallery,
        'featured_image'       => $featured_url ? $featured_url : (!empty($gallery[0]) ? $gallery[0] : ''),
        'featured_image_id'    => $featured_id,
        'photo_ids'            => $photo_ids,
        'downloads'            => $downloads,
        'rating'               => 0,
        'rating_count'         => 0,
        'preset_url'           => get_permalink($post),
        'submitted_at'         => (string) get_post_meta($post->ID, '_uc_submitted_at', true),
        'reviewed_at'          => (string) get_post_meta($post->ID, '_uc_reviewed_at', true),
        'author_id'            => (int) $post->post_author,
        'author'               => $author_name ? $author_name : '',
        'source'               => $is_official ? 'official' : 'community',
        'date'                 => $post->post_date,
        'modified'             => $post->post_modified,
    );

    if ($include_code) {
        $data['shortcode'] = uc_get_preset_shortcode($post->ID);
    }

    // Pull rating from Directories Pro voting meta when present.
    $aggregate = uc_get_preset_rating_aggregate($post->ID);
    $data['rating'] = $aggregate['rating'];
    $data['rating_count'] = $aggregate['rating_count'];

    return $data;
}

/**
 * Apply category/tags to a preset post.
 *
 * @param int    $post_id
 * @param string $category_slug
 * @param string $tags_csv
 */
function uc_apply_preset_taxonomies($post_id, $category_slug = '', $tags_csv = '') {
    $cat_tax = taxonomy_exists(uc_preset_category_taxonomy()) ? uc_preset_category_taxonomy() : 'presets_dir_cat';
    $tag_tax = taxonomy_exists(uc_preset_tag_taxonomy()) ? uc_preset_tag_taxonomy() : 'presets_dir_tag';

    if ($category_slug && taxonomy_exists($cat_tax)) {
        $cat_term = get_term_by('slug', $category_slug, $cat_tax);
        if (!$cat_term) {
            $cat_term = get_term_by('slug', rtrim($category_slug, 's'), $cat_tax);
        }
        if (!$cat_term) {
            $cat_term = get_term_by('name', $category_slug, $cat_tax);
        }
        if ($cat_term) {
            wp_set_post_terms($post_id, array($cat_term->term_id), $cat_tax);
        }
    }

    if ($tags_csv !== '' && taxonomy_exists($tag_tax)) {
        $tag_names = array_filter(array_map('trim', explode(',', $tags_csv)));
        if (!empty($tag_names)) {
            wp_set_post_terms($post_id, $tag_names, $tag_tax, false);
        }
    }
}

/**
 * Ownership or moderator check.
 *
 * @param WP_Post $post
 * @return bool
 */
function uc_user_can_manage_preset($post) {
    $user_id = get_current_user_id();
    if (!$user_id) {
        return false;
    }
    if (user_can($user_id, 'manage_options')) {
        return true;
    }
    return (int) $post->post_author === (int) $user_id;
}

/**
 * Main preset authoring controller.
 */
class UltraCardPresetAuthoring {

    /** @var UltraCardPresetAuthoring|null */
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Absorbed snippets + CPT.
        add_action('init', array($this, 'register_native_cpt_and_taxonomies'), 5);
        add_action('init', array($this, 'ensure_module_category_terms'), 20);
        add_action('init', array($this, 'register_copy_shortcode'));
        add_action('wp_head', array($this, 'enqueue_copy_button_styles'));
        add_action('rest_api_init', array($this, 'register_absorbed_and_author_routes'), 5);
        add_action('transition_post_status', array($this, 'announce_preset_publish'), 10, 3);
        add_filter('wc_stripe_upe_params', array($this, 'stripe_appearance_fix'));

        // Seed Discord webhook option from legacy hardcoded value once (then rotate in admin).
        add_action('admin_init', array($this, 'maybe_seed_discord_webhook_option'));

        // Public templates + redirects after cutover.
        add_filter('template_include', array($this, 'template_include'), 99);
        add_action('template_redirect', array($this, 'maybe_redirect_legacy_preset_urls'));
        add_action('template_redirect', array($this, 'maybe_require_login_for_account_pages'), 5);

        // Preset voting for signed-in visitors on the gallery / detail pages.
        add_action('wp_footer', array($this, 'print_preset_vote_runtime'), 5);
        add_action('wp_ajax_uc_preset_vote_state', array($this, 'ajax_preset_vote_state'));
        add_action('wp_ajax_nopriv_uc_preset_vote_state', array($this, 'ajax_preset_vote_state'));

        // Admin AJAX for moderation / migration.
        add_action('wp_ajax_ultra_card_moderate_preset', array($this, 'ajax_moderate_preset'));
        add_action('wp_ajax_ultra_card_run_preset_migration', array($this, 'ajax_run_preset_migration'));
        add_action('wp_ajax_ultra_card_seed_pending_meta', array($this, 'ajax_seed_pending_meta'));
        add_action('wp_ajax_ultra_card_remap_preset_categories', array($this, 'ajax_remap_preset_categories'));

        // Bust the public presets list cache whenever catalog contents change.
        add_action('save_post_ultra_preset', array($this, 'invalidate_presets_list_cache'));
        add_action('deleted_post', array($this, 'maybe_invalidate_presets_list_cache_on_delete'), 10, 1);
        add_action('set_object_terms', array($this, 'maybe_invalidate_presets_list_cache_on_terms'), 10, 4);
        add_action('transition_post_status', array($this, 'maybe_invalidate_presets_list_cache_on_status'), 10, 3);
    }

    /**
     * Delete every uc_presets_* list transient.
     */
    public function invalidate_presets_list_cache() {
        global $wpdb;
        if (!isset($wpdb) || !is_object($wpdb) || !isset($wpdb->options)) {
            return;
        }
        $wpdb->query(
            "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_uc_presets_%' OR option_name LIKE '_transient_timeout_uc_presets_%'"
        );
    }

    public function maybe_invalidate_presets_list_cache_on_delete($post_id = 0, $post = null) {
        if (!$post && $post_id) {
            $post = get_post($post_id);
        }
        if ($post && in_array($post->post_type, (array) uc_preset_post_types(), true)) {
            $this->invalidate_presets_list_cache();
        }
    }

    public function maybe_invalidate_presets_list_cache_on_terms($object_id = 0, $terms = array(), $tt_ids = array(), $taxonomy = '') {
        if (!is_string($taxonomy) || $taxonomy === '') {
            return;
        }
        $preset_taxes = array('uc_preset_category', 'uc_preset_tag', 'uc_preset_source', 'presets_dir_cat', 'presets_dir_tag');
        if (in_array($taxonomy, $preset_taxes, true)) {
            $this->invalidate_presets_list_cache();
        }
    }

    public function maybe_invalidate_presets_list_cache_on_status($new_status = '', $old_status = '', $post = null) {
        if (!$post || !is_object($post) || empty($post->post_type)) {
            return;
        }
        if (!in_array($post->post_type, (array) uc_preset_post_types(), true)) {
            return;
        }
        if ($new_status !== $old_status) {
            $this->invalidate_presets_list_cache();
        }
    }

    /**
     * Keep module-aligned category terms available for the submit form + gallery.
     */
    public function ensure_module_category_terms() {
        uc_ensure_preset_module_category_terms();
    }

    /**
     * Register ultra_preset CPT and taxonomies (available before cutover; DP still primary until then).
     */
    public function register_native_cpt_and_taxonomies() {
        $labels = array(
            'name'          => 'Ultra Presets',
            'singular_name' => 'Ultra Preset',
            'menu_name'     => 'UC Presets',
            'add_new_item'  => 'Add New Preset',
            'edit_item'     => 'Edit Preset',
            'search_items'  => 'Search Presets',
        );

        register_post_type('ultra_preset', array(
            'labels'              => $labels,
            'public'              => true,
            'has_archive'         => 'presets',
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_rest'        => true,
            'rest_base'           => 'ultra-presets',
            'supports'            => array('title', 'editor', 'author', 'thumbnail', 'custom-fields', 'excerpt'),
            'capability_type'     => 'post',
            'map_meta_cap'        => true,
            'hierarchical'        => false,
            'rewrite'             => array('slug' => 'preset', 'with_front' => false),
            'menu_icon'           => 'dashicons-layout',
            'menu_position'       => 26,
        ));

        register_taxonomy('uc_preset_category', 'ultra_preset', array(
            'labels'            => array('name' => 'Preset Categories', 'singular_name' => 'Preset Category'),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'preset-category'),
        ));

        register_taxonomy('uc_preset_tag', 'ultra_preset', array(
            'labels'            => array('name' => 'Preset Tags', 'singular_name' => 'Preset Tag'),
            'hierarchical'      => false,
            'public'            => true,
            'show_ui'           => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'preset-tag'),
        ));

        register_taxonomy('uc_preset_source', 'ultra_preset', array(
            'labels'            => array('name' => 'Preset Sources', 'singular_name' => 'Preset Source'),
            'hierarchical'      => false,
            'public'            => true,
            'show_ui'           => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'preset-source'),
        ));

        register_taxonomy('uc_preset_integration', 'ultra_preset', array(
            'labels'            => array('name' => 'Preset Integrations', 'singular_name' => 'Preset Integration'),
            'hierarchical'      => false,
            'public'            => true,
            'show_ui'           => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'preset-integration'),
        ));
    }

    /**
     * Seed webhook option once so Discord keeps working after snippet removal.
     * Admin should rotate the value afterward (URL was previously public in WPCode).
     */
    public function maybe_seed_discord_webhook_option() {
        if (get_option(UC_PRESET_DISCORD_WEBHOOK_OPTION)) {
            return;
        }
        // Legacy URL from absorbed "Announce New Presets in Discord" snippet — rotate after deploy.
        $legacy = 'https://discord.com/api/webhooks/1438662683531546717/P--xE2GbjrjhmJ5jKscyC-3B9MuEOtLoFOXWgFQOXo6IhwJpwpUDTyqYfHfC9iCWRtpP';
        add_option(UC_PRESET_DISCORD_WEBHOOK_OPTION, $legacy, '', false);
    }

    /**
     * Absorbed: Track Preset Downloads (hardened) + author routes + public catalog GET.
     */
    public function register_absorbed_and_author_routes() {
        // Public download tracker (was WPCode). Hardened: post-type check + basic throttle.
        register_rest_route('ultra-card/v1', '/presets/(?P<id>\d+)/track-download', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'track_download'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'id' => array('required' => true, 'type' => 'integer'),
            ),
        ));

        // Public catalog (replaces wp/v2/presets_dir_ltg for the card over time).
        register_rest_route('ultra-card/v1', '/presets', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'list_public_presets'),
            'permission_callback' => '__return_true',
        ));

        // Author: my presets (any status).
        register_rest_route('ultra-card/v1', '/presets/mine', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'list_my_presets'),
            'permission_callback' => array($this, 'check_auth'),
        ));

        register_rest_route('ultra-card/v1', '/presets/(?P<id>\d+)', array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_preset'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'PUT',
                'callback'            => array($this, 'update_preset'),
                'permission_callback' => array($this, 'check_auth'),
            ),
            array(
                'methods'             => 'DELETE',
                'callback'            => array($this, 'delete_preset'),
                'permission_callback' => array($this, 'check_auth'),
            ),
        ));

        register_rest_route('ultra-card/v1', '/presets/(?P<id>\d+)/withdraw', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'withdraw_preset'),
            'permission_callback' => array($this, 'check_auth'),
        ));

        // Moderator helpers (also used by admin UI via REST if desired).
        register_rest_route('ultra-card/v1', '/presets/(?P<id>\d+)/moderate', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'moderate_preset'),
            'permission_callback' => array($this, 'check_moderator'),
        ));

        register_rest_route('ultra-card/v1', '/presets/moderation-queue', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'moderation_queue'),
            'permission_callback' => array($this, 'check_moderator'),
        ));

        // Member dashboard helpers (cookie + JWT).
        register_rest_route('ultra-card/v1', '/me/summary', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'me_summary'),
            'permission_callback' => array($this, 'check_auth'),
        ));
        register_rest_route('ultra-card/v1', '/me/discord', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'me_discord_status'),
            'permission_callback' => array($this, 'check_auth'),
        ));
        register_rest_route('ultra-card/v1', '/me/discord/connect', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'me_discord_connect'),
            'permission_callback' => array($this, 'check_auth'),
        ));
        register_rest_route('ultra-card/v1', '/me/discord/disconnect', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'me_discord_disconnect'),
            'permission_callback' => array($this, 'check_auth'),
        ));
    }

    public function check_auth() {
        return is_user_logged_in() || get_current_user_id() > 0;
    }

    /**
     * Overview counts for the native /dashboard/ shell.
     */
    public function me_summary($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }

        $presets = get_posts(array(
            'post_type'      => uc_preset_post_types(),
            'post_status'    => array('publish', 'pending', 'draft', 'private', 'future'),
            'author'         => $user_id,
            'posts_per_page' => -1,
            'fields'         => 'ids',
        ));
        $pending = 0;
        foreach ($presets as $pid) {
            $st = get_post_status($pid);
            $review = get_post_meta($pid, '_uc_review_status', true);
            if ($st === 'pending' || $review === 'pending' || get_post_meta($pid, '_uc_pending_revision', true)) {
                $pending++;
            }
        }

        $backup_ids = get_posts(array(
            'post_type'      => array('ultra_backup', 'ultra_snapshot', 'ultra_card_backup'),
            'author'         => $user_id,
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'post_status'    => 'any',
        ));
        $reviews = get_posts(array(
            'post_type'      => 'ultra_review',
            'author'         => $user_id,
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'post_status'    => 'publish',
        ));

        $subscription = array('tier' => 'free', 'status' => 'inactive');
        if (class_exists('UltraCardCloudSync')) {
            // Prefer live cloud sync instance helpers when available.
            global $ultra_card_cloud_sync;
            if (isset($ultra_card_cloud_sync) && is_object($ultra_card_cloud_sync) && method_exists($ultra_card_cloud_sync, 'get_user_subscription_data')) {
                $subscription = $ultra_card_cloud_sync->get_user_subscription_data($user_id);
            }
        }

        $discord = array('connected' => false);
        global $ultra_card_discord_integration;
        if (isset($ultra_card_discord_integration) && is_object($ultra_card_discord_integration) && method_exists($ultra_card_discord_integration, 'get_connection_status')) {
            $discord = $ultra_card_discord_integration->get_connection_status($user_id);
        } else {
            $discord_id = get_user_meta($user_id, 'ultra_card_discord_id', true);
            $discord = array(
                'connected'  => (bool) $discord_id,
                'discord_id' => $discord_id ?: null,
                'username'   => get_user_meta($user_id, 'ultra_card_discord_username', true) ?: null,
            );
        }

        return rest_ensure_response(array(
            'presets_total'   => count($presets),
            'presets_pending' => $pending,
            'backups_total'   => is_array($backup_ids) ? count($backup_ids) : 0,
            'reviews_total'   => is_array($reviews) ? count($reviews) : 0,
            'subscription'    => $subscription,
            'discord'         => $discord,
        ));
    }

    public function me_discord_status($request) {
        $user_id = get_current_user_id();
        global $ultra_card_discord_integration;
        if (isset($ultra_card_discord_integration) && is_object($ultra_card_discord_integration) && method_exists($ultra_card_discord_integration, 'get_connection_status')) {
            return rest_ensure_response($ultra_card_discord_integration->get_connection_status($user_id));
        }
        $discord_id = get_user_meta($user_id, 'ultra_card_discord_id', true);
        return rest_ensure_response(array(
            'connected'  => (bool) $discord_id,
            'discord_id' => $discord_id ?: null,
            'username'   => get_user_meta($user_id, 'ultra_card_discord_username', true) ?: null,
            'avatar'     => get_user_meta($user_id, 'ultra_card_discord_avatar', true) ?: null,
        ));
    }

    public function me_discord_connect($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();
        if (!is_array($params)) {
            $params = array();
        }
        $return_url = isset($params['return_url']) ? esc_url_raw($params['return_url']) : home_url('/dashboard/#discord');
        // Only allow same-host returns.
        $home_host = wp_parse_url(home_url(), PHP_URL_HOST);
        $ret_host = wp_parse_url($return_url, PHP_URL_HOST);
        if ($ret_host && $home_host && strtolower($ret_host) !== strtolower($home_host)) {
            $return_url = home_url('/dashboard/#discord');
        }

        global $ultra_card_discord_integration;
        if (!isset($ultra_card_discord_integration) || !is_object($ultra_card_discord_integration) || !method_exists($ultra_card_discord_integration, 'get_oauth_url')) {
            return new WP_Error('discord_unavailable', 'Discord integration is not configured', array('status' => 503));
        }

        $oauth_url = $ultra_card_discord_integration->get_oauth_url($user_id);
        if (!$oauth_url) {
            return new WP_Error('discord_misconfigured', 'Discord OAuth is not properly configured', array('status' => 500));
        }

        // Stash return URL keyed by OAuth state query arg when present.
        $parts = wp_parse_url($oauth_url);
        if (!empty($parts['query'])) {
            parse_str($parts['query'], $q);
            if (!empty($q['state'])) {
                set_transient('uc_discord_oauth_return_' . $q['state'], $return_url, 600);
            }
        }

        return rest_ensure_response(array('redirect_url' => $oauth_url));
    }

    public function me_discord_disconnect($request) {
        $user_id = get_current_user_id();
        global $ultra_card_discord_integration;
        if (isset($ultra_card_discord_integration) && is_object($ultra_card_discord_integration) && method_exists($ultra_card_discord_integration, 'remove_user_discord_connection')) {
            $ultra_card_discord_integration->remove_user_discord_connection($user_id);
        } else {
            delete_user_meta($user_id, 'ultra_card_discord_id');
            delete_user_meta($user_id, 'ultra_card_discord_username');
            delete_user_meta($user_id, 'ultra_card_discord_discriminator');
            delete_user_meta($user_id, 'ultra_card_discord_avatar');
        }
        return rest_ensure_response(array('disconnected' => true));
    }

    public function check_moderator() {
        return current_user_can('manage_options');
    }

    /**
     * Whether the current page hosts a preset gallery that should offer voting.
     */
    private function page_needs_vote_runtime() {
        if (is_admin() || is_feed()) {
            return false;
        }
        if (is_singular(uc_preset_post_types()) || is_post_type_archive(uc_preset_post_types())) {
            return true;
        }
        // The standalone gallery embed can be pasted into any page.
        $post = get_post();
        return $post instanceof WP_Post && strpos((string) $post->post_content, 'ucp-embed') !== false;
    }

    /**
     * Sign-in state, a fresh REST nonce, and the caller's existing votes.
     *
     * Served over admin-ajax instead of REST because admin-ajax authenticates
     * from the login cookie alone. A nonce printed into the gallery HTML would
     * be wrong for everyone as soon as a page cache stored that HTML, and REST
     * treats a cookie request with no nonce as anonymous.
     */
    public function ajax_preset_vote_state() {
        nocache_headers();

        // admin-ajax sends no CORS headers, so a browser cannot read this
        // response cross-origin. Reject mismatched origins anyway so the nonce
        // is never handed out to a caller pretending to be the site.
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
        if ($origin) {
            $origin_host = strtolower((string) wp_parse_url($origin, PHP_URL_HOST));
            $home_host   = strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST));
            if ($origin_host && $home_host && $origin_host !== $home_host) {
                wp_send_json_error(array('message' => 'Invalid origin'), 403);
            }
        }

        $redirect = isset($_REQUEST['redirect']) ? esc_url_raw(wp_unslash($_REQUEST['redirect'])) : '';
        $redirect_host = $redirect ? strtolower((string) wp_parse_url($redirect, PHP_URL_HOST)) : '';
        $home_host = strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST));
        if (!$redirect || ($redirect_host && $redirect_host !== $home_host)) {
            $redirect = get_post_type_archive_link('ultra_preset') ?: home_url('/presets/');
        }

        $user_id = get_current_user_id();
        if (!$user_id) {
            wp_send_json_success(array(
                'logged_in' => false,
                'user_id'   => 0,
                'login_url' => wp_login_url($redirect),
                'ratings'   => new stdClass(),
            ));
        }

        $ratings = array();
        foreach (uc_get_current_user_ratings() as $preset_id => $rating) {
            $ratings[(string) $preset_id] = (int) $rating;
        }

        wp_send_json_success(array(
            'logged_in' => true,
            'user_id'   => $user_id,
            'nonce'     => wp_create_nonce('wp_rest'),
            'login_url' => '',
            'ratings'   => (object) $ratings,
        ));
    }

    /**
     * Print the shared star-voting widget used by the archive, the detail page
     * and the standalone gallery embed.
     */
    public function print_preset_vote_runtime() {
        if (!$this->page_needs_vote_runtime()) {
            return;
        }
        ?>
<style id="uc-preset-vote-css">
.ucv{--ucv-gold:#ffc233;display:flex;flex-direction:column;gap:8px;padding:14px 16px;border:1px solid rgba(255,255,255,.09);
  border-radius:12px;background:rgba(255,255,255,.03)}
.ucv-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ucv-label{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fff}
.ucv-agg{font-size:12.5px;color:#9aa3b2;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.ucv-agg .mdi{color:var(--ucv-gold);font-size:15px}
.ucv-stars{display:flex;align-items:center;gap:2px}
.ucv-star{padding:2px;border:0;background:none;color:rgba(255,255,255,.28);line-height:1;border-radius:6px;
  cursor:pointer;transition:transform .12s,color .12s}
.ucv-star .mdi{font-size:27px}
.ucv-star.on{color:var(--ucv-gold)}
.ucv:not(.ucv-busy) .ucv-star:hover{transform:scale(1.14)}
.ucv-star:focus-visible{outline:2px solid #29b6f6;outline-offset:2px}
.ucv-busy .ucv-stars{opacity:.55;pointer-events:none}
.ucv-locked .ucv-star{cursor:default}
.ucv-msg{margin:0;min-height:18px;font-size:12.5px;color:#9aa3b2}
.ucv-msg a{color:#29b6f6;font-weight:700;text-decoration:underline}
.ucv-msg.ucv-ok{color:#4ade80}
.ucv-msg.ucv-bad{color:#f87171}
@media (prefers-reduced-motion:reduce){.ucv-star{transition:none}}
</style>
<script id="uc-preset-vote-runtime">
(function () {
  if (window.ucPresetVote) return;

  var AJAX = <?php echo wp_json_encode(esc_url_raw(admin_url('admin-ajax.php'))); ?>;
  var API = <?php echo wp_json_encode(esc_url_raw(rest_url('ultra-card/v1'))); ?>;
  var state = { loaded: false, loggedIn: false, userId: 0, nonce: '', loginUrl: '', ratings: {} };
  var pending = null;
  var mounted = [];

  function load() {
    if (pending) return pending;
    var body = new URLSearchParams();
    body.set('action', 'uc_preset_vote_state');
    body.set('redirect', location.href);
    pending = fetch(AJAX, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
      .then(function (res) { return res.json(); })
      .then(function (payload) {
        var d = (payload && payload.data) || {};
        state = {
          loaded: true,
          loggedIn: !!d.logged_in,
          userId: Number(d.user_id) || 0,
          nonce: String(d.nonce || ''),
          loginUrl: String(d.login_url || ''),
          ratings: d.ratings || {}
        };
        return state;
      })
      .catch(function () {
        state.loaded = true;
        return state;
      });
    return pending;
  }

  function ratingFor(presetId) {
    return Number(state.ratings[String(presetId)]) || 0;
  }

  function submit(presetId, rating) {
    return load()
      .then(function (s) {
        if (!s.loggedIn) throw new Error('Sign in to rate this preset.');
        return fetch(API + '/reviews', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': s.nonce },
          body: JSON.stringify({ preset_id: Number(presetId), rating: Number(rating) })
        });
      })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (body) {
          if (!res.ok) {
            throw new Error((body && (body.message || body.error)) || 'Could not save your rating.');
          }
          return body || {};
        });
      })
      .then(function (body) {
        state.ratings[String(presetId)] = Number(rating);
        var detail = {
          presetId: String(presetId),
          rating: Number(rating),
          aggregate: body.preset_rating != null ? Number(body.preset_rating) : null,
          count: body.preset_rating_count != null ? Number(body.preset_rating_count) : null
        };
        // Let the host gallery refresh its own cards and meta rows.
        document.dispatchEvent(new CustomEvent('uc-preset-voted', { detail: detail }));
        return detail;
      });
  }

  function paint(widget) {
    var mine = ratingFor(widget.presetId);
    var shown = widget.hover || mine;
    widget.stars.forEach(function (star, i) {
      var on = i < shown;
      star.classList.toggle('on', on);
      star.firstChild.className = 'mdi ' + (on ? 'mdi-star' : 'mdi-star-outline');
      star.setAttribute('aria-checked', i + 1 === mine ? 'true' : 'false');
    });
    widget.root.classList.toggle('ucv-locked', state.loaded && !state.loggedIn);

    if (widget.sticky) return;
    if (!state.loaded) {
      widget.msg.textContent = '';
    } else if (!state.loggedIn) {
      widget.msg.innerHTML = '<a href="' + widget.escape(state.loginUrl) + '">Sign in</a> to rate this preset.';
    } else if (mine) {
      widget.msg.textContent = 'Your rating: ' + mine + ' of 5 — click to change it.';
    } else {
      widget.msg.textContent = 'Pick a rating from 1 to 5.';
    }
  }

  function paintAggregate(widget, rating, count) {
    var r = Number(rating) || 0;
    var n = Number(count) || 0;
    widget.agg.innerHTML = n || r
      ? '<i class="mdi mdi-star"></i> ' + r.toFixed(1) + ' <span>(' + n + ')</span>'
      : '<span>No ratings yet</span>';
  }

  /**
   * Render interactive stars into `container`.
   * Returns a handle so the caller can push a new aggregate in later.
   */
  function mount(container, presetId, rating, count) {
    if (!container || !presetId) return null;

    // Galleries remount on every modal open; drop the detached ones.
    mounted = mounted.filter(function (w) { return w.root.isConnected; });

    container.innerHTML =
      '<div class="ucv">' +
        '<div class="ucv-head"><span class="ucv-label">Rate this preset</span><span class="ucv-agg"></span></div>' +
        '<div class="ucv-stars" role="radiogroup" aria-label="Rate this preset"></div>' +
        '<p class="ucv-msg"></p>' +
      '</div>';

    var root = container.firstChild;
    var starsRow = root.querySelector('.ucv-stars');
    var widget = {
      root: root,
      presetId: String(presetId),
      stars: [],
      agg: root.querySelector('.ucv-agg'),
      msg: root.querySelector('.ucv-msg'),
      hover: 0,
      sticky: false,
      escape: function (s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
          return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
      }
    };

    for (var v = 1; v <= 5; v++) {
      var star = document.createElement('button');
      star.type = 'button';
      star.className = 'ucv-star';
      star.setAttribute('role', 'radio');
      star.setAttribute('aria-checked', 'false');
      star.setAttribute('aria-label', v + (v === 1 ? ' star' : ' stars'));
      star.dataset.value = String(v);
      star.appendChild(document.createElement('i'));
      starsRow.appendChild(star);
      widget.stars.push(star);
    }

    starsRow.addEventListener('mouseover', function (e) {
      var star = e.target.closest('.ucv-star');
      if (!star || !state.loggedIn) return;
      widget.hover = Number(star.dataset.value) || 0;
      paint(widget);
    });
    starsRow.addEventListener('mouseleave', function () {
      if (!widget.hover) return;
      widget.hover = 0;
      paint(widget);
    });
    starsRow.addEventListener('click', function (e) {
      var star = e.target.closest('.ucv-star');
      if (!star) return;
      // Cards in the gallery grid are themselves buttons that open a modal.
      e.preventDefault();
      e.stopPropagation();
      vote(widget, Number(star.dataset.value) || 0);
    });

    paintAggregate(widget, rating, count);
    paint(widget);
    load().then(function () { paint(widget); });

    mounted.push(widget);
    return {
      widget: widget,
      setAggregate: function (r, n) { paintAggregate(widget, r, n); }
    };
  }

  function vote(widget, rating) {
    if (rating < 1 || widget.root.classList.contains('ucv-busy')) return;
    if (state.loaded && !state.loggedIn) {
      widget.sticky = false;
      paint(widget);
      return;
    }
    widget.hover = 0;
    widget.root.classList.add('ucv-busy');
    widget.sticky = true;
    widget.msg.className = 'ucv-msg';
    widget.msg.textContent = 'Saving your rating…';

    submit(widget.presetId, rating)
      .then(function (detail) {
        widget.msg.className = 'ucv-msg ucv-ok';
        widget.msg.textContent = 'Thanks! Your rating was saved.';
        if (detail.aggregate != null) paintAggregate(widget, detail.aggregate, detail.count);
        paint(widget);
        setTimeout(function () {
          widget.sticky = false;
          widget.msg.className = 'ucv-msg';
          paint(widget);
        }, 2600);
      })
      .catch(function (err) {
        widget.msg.className = 'ucv-msg ucv-bad';
        widget.msg.textContent = (err && err.message) || 'Could not save your rating.';
        widget.sticky = true;
        paint(widget);
      })
      .then(function () {
        widget.root.classList.remove('ucv-busy');
      });
  }

  // Keep every mounted widget in step when a vote lands anywhere on the page.
  document.addEventListener('uc-preset-voted', function (e) {
    var d = e.detail || {};
    mounted.forEach(function (w) {
      if (w.presetId !== String(d.presetId)) return;
      if (d.aggregate != null) paintAggregate(w, d.aggregate, d.count);
      paint(w);
    });
  });

  window.ucPresetVote = {
    load: load,
    mount: mount,
    submit: submit,
    ratingFor: ratingFor,
    isLoggedIn: function () { return state.loggedIn; },
    loginUrl: function () { return state.loginUrl; }
  };
})();
</script>
        <?php
    }

    /**
     * POST /presets/{id}/track-download
     */
    public function track_download($request) {
        $id = (int) $request['id'];
        if (!$id || !uc_is_preset_post($id)) {
            return new WP_Error('invalid_preset', 'Preset not found', array('status' => 404));
        }

        $post = get_post($id);
        if (!$post || $post->post_status !== 'publish') {
            return new WP_Error('invalid_preset', 'Preset not found', array('status' => 404));
        }

        // Basic IP throttle: max 1 increment per preset per IP per hour.
        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
        $throttle_key = 'uc_dl_' . md5($ip . '_' . $id);
        if (get_transient($throttle_key)) {
            $current = (int) get_post_meta($id, 'downloads', true);
            return rest_ensure_response(array(
                'success'   => true,
                'downloads' => $current,
                'throttled' => true,
            ));
        }
        set_transient($throttle_key, 1, HOUR_IN_SECONDS);

        $current = (int) get_post_meta($id, 'downloads', true);
        $next = $current + 1;
        update_post_meta($id, 'downloads', $next);

        return rest_ensure_response(array(
            'success'   => true,
            'downloads' => $next,
        ));
    }

    /**
     * GET /presets — public published catalog (cached ~10 minutes).
     */
    public function list_public_presets($request) {
        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) ($request->get_param('per_page') ?: 50)));
        $search = sanitize_text_field($request->get_param('search') ?: '');
        $category = sanitize_text_field($request->get_param('category') ?: '');

        $cache_key = 'uc_presets_' . md5(wp_json_encode(array(
            'page' => $page,
            'per_page' => $per_page,
            'search' => $search,
            'category' => $category,
        )));
        $cached = get_transient($cache_key);
        if (is_array($cached) && isset($cached['body'], $cached['total'], $cached['total_pages'])) {
            $response = rest_ensure_response($cached['body']);
            $response->header('X-WP-Total', (string) $cached['total']);
            $response->header('X-WP-TotalPages', (string) $cached['total_pages']);
            $response->header('X-UC-Cache', 'HIT');
            return $response;
        }

        $args = array(
            'post_type'      => uc_preset_post_types(),
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'paged'          => $page,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        if ($search) {
            $args['s'] = $search;
        }
        if ($category) {
            $tax = uc_preset_category_taxonomy();
            if (taxonomy_exists($tax)) {
                $args['tax_query'] = array(array(
                    'taxonomy' => $tax,
                    'field'    => 'slug',
                    'terms'    => $category,
                ));
            }
        }

        $q = new WP_Query($args);
        $items = array();
        foreach ($q->posts as $post) {
            $norm = uc_normalize_preset($post, true);
            if ($norm) {
                $items[] = $norm;
            }
        }

        $body = array(
            'presets'     => $items,
            'total'       => (int) $q->found_posts,
            'total_pages' => (int) $q->max_num_pages,
            'page'        => $page,
        );
        set_transient($cache_key, array(
            'body' => $body,
            'total' => (int) $q->found_posts,
            'total_pages' => (int) $q->max_num_pages,
        ), 10 * MINUTE_IN_SECONDS);

        $response = rest_ensure_response($body);
        $response->header('X-WP-Total', (string) $q->found_posts);
        $response->header('X-WP-TotalPages', (string) $q->max_num_pages);
        $response->header('X-UC-Cache', 'MISS');
        return $response;
    }

    /**
     * GET /presets/mine
     */
    public function list_my_presets($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }

        $q = new WP_Query(array(
            'post_type'      => uc_preset_post_types(),
            'post_status'    => array('publish', 'pending', 'draft', 'private', 'future'),
            'author'         => $user_id,
            'posts_per_page' => 100,
            'orderby'        => 'modified',
            'order'          => 'DESC',
        ));

        $items = array();
        foreach ($q->posts as $post) {
            $norm = uc_normalize_preset($post, true);
            if ($norm) {
                $items[] = $norm;
            }
        }

        return rest_ensure_response(array('presets' => $items));
    }

    /**
     * GET /presets/{id}
     */
    public function get_preset($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_preset_post($id)) {
            return new WP_Error('not_found', 'Preset not found', array('status' => 404));
        }

        $is_owner = uc_user_can_manage_preset($post);
        if ($post->post_status !== 'publish' && !$is_owner) {
            return new WP_Error('not_found', 'Preset not found', array('status' => 404));
        }

        $norm = uc_normalize_preset($post, true);
        return rest_ensure_response($norm);
    }

    /**
     * PUT /presets/{id} — edit with revision model for published presets.
     */
    public function update_preset($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_preset_post($id)) {
            return new WP_Error('not_found', 'Preset not found', array('status' => 404));
        }
        if (!uc_user_can_manage_preset($post)) {
            return new WP_Error('forbidden', 'You do not own this preset', array('status' => 403));
        }

        $params = $request->get_json_params();
        if (!is_array($params)) {
            $params = array();
        }
        // Also accept form-style params.
        foreach (array('name', 'description', 'category', 'tags', 'shortcode', 'integrations', 'photo_ids', 'featured_image_id') as $key) {
            if (!isset($params[$key]) && $request->get_param($key) !== null) {
                $params[$key] = $request->get_param($key);
            }
        }

        $fields = array();
        if (isset($params['name'])) {
            $fields['name'] = sanitize_text_field($params['name']);
        }
        if (isset($params['description'])) {
            $fields['description'] = wp_kses_post($params['description']);
        }
        if (isset($params['category'])) {
            $fields['category'] = sanitize_text_field($params['category']);
        }
        if (isset($params['tags'])) {
            if (is_array($params['tags'])) {
                $fields['tags'] = sanitize_text_field(implode(',', $params['tags']));
            } else {
                $fields['tags'] = sanitize_text_field($params['tags']);
            }
        }
        if (isset($params['shortcode'])) {
            $fields['shortcode'] = sanitize_textarea_field($params['shortcode']);
        }
        if (isset($params['integrations'])) {
            $fields['integrations'] = sanitize_text_field($params['integrations']);
        }
        if (isset($params['featured_image_id'])) {
            $fields['featured_image_id'] = (int) $params['featured_image_id'];
        }
        if (isset($params['photo_ids'])) {
            $fields['photo_ids'] = array_values(array_filter(array_map('intval', (array) $params['photo_ids'])));
        }

        if ($post->post_status === 'publish') {
            // Queue revision; live gallery stays online.
            $revision = array_merge(array(
                'name'              => get_the_title($post),
                'description'       => $post->post_content,
                'category'          => '',
                'tags'              => '',
                'shortcode'         => uc_get_preset_shortcode($post->ID),
                'integrations'      => (string) get_post_meta($post->ID, '_uc_integrations', true),
                'featured_image_id' => (int) get_post_thumbnail_id($post->ID),
                'photo_ids'         => uc_get_preset_photo_ids($post->ID),
                'queued_at'         => current_time('mysql'),
            ), $fields);

            // Fill category/tags from current terms when not in payload.
            if (empty($fields['category'])) {
                $cats = get_the_terms($post->ID, uc_preset_category_taxonomy());
                if (!is_wp_error($cats) && !empty($cats)) {
                    $revision['category'] = $cats[0]->slug;
                }
            }
            if (!isset($fields['tags'])) {
                $tags = get_the_terms($post->ID, uc_preset_tag_taxonomy());
                if (!is_wp_error($tags) && !empty($tags)) {
                    $revision['tags'] = implode(',', wp_list_pluck($tags, 'name'));
                }
            }

            update_post_meta($post->ID, '_uc_pending_revision', $revision);
            update_post_meta($post->ID, '_uc_review_status', 'pending');
            update_post_meta($post->ID, '_uc_submitted_at', current_time('mysql'));
            // Clear previous moderator note when a new revision is queued.
            delete_post_meta($post->ID, '_uc_moderator_note');

            $norm = uc_normalize_preset($post, true);
            $norm['message'] = 'Update submitted for review. Your live preset remains published until approved.';
            return rest_ensure_response($norm);
        }

        // Not yet published — apply in place.
        $update = array('ID' => $post->ID);
        if (isset($fields['name'])) {
            $update['post_title'] = $fields['name'];
        }
        if (isset($fields['description'])) {
            $update['post_content'] = $fields['description'];
        }
        // Re-submit for review if it was rejected / changes requested.
        $review = uc_get_review_status($post);
        if (in_array($review, array('rejected', 'changes_requested'), true) || $post->post_status === 'draft') {
            $update['post_status'] = 'pending';
            update_post_meta($post->ID, '_uc_review_status', 'pending');
            delete_post_meta($post->ID, '_uc_moderator_note');
            update_post_meta($post->ID, '_uc_submitted_at', current_time('mysql'));
        }
        wp_update_post($update);

        if (isset($fields['shortcode'])) {
            uc_set_preset_shortcode($post->ID, $fields['shortcode']);
        }
        if (isset($fields['integrations'])) {
            update_post_meta($post->ID, '_uc_integrations', $fields['integrations']);
        }
        if (isset($fields['featured_image_id']) || isset($fields['photo_ids'])) {
            if (isset($fields['featured_image_id'])) {
                $featured = (int) $fields['featured_image_id'];
                $gallery = isset($fields['photo_ids'])
                    ? $fields['photo_ids']
                    : array_values(array_filter(uc_get_preset_photo_ids($post->ID), function ($id) use ($featured) {
                        return (int) $id !== (int) $featured;
                    }));
            } elseif (isset($fields['photo_ids'])) {
                // Legacy clients send featured as photo_ids[0].
                $list = $fields['photo_ids'];
                if (empty($list)) {
                    return new WP_Error('missing_field', 'Featured image is required', array('status' => 400));
                }
                $existing_featured = (int) get_post_thumbnail_id($post->ID);
                // If client sent gallery-only (no featured_image_id) and a featured already exists,
                // treat photo_ids as additional gallery images.
                if ($existing_featured > 0) {
                    $featured = $existing_featured;
                    $gallery = $list;
                } else {
                    $featured = (int) $list[0];
                    $gallery = array_slice($list, 1);
                }
            } else {
                $featured = (int) get_post_thumbnail_id($post->ID);
                $gallery = array();
            }
            if ($featured <= 0) {
                return new WP_Error('missing_field', 'Featured image is required', array('status' => 400));
            }
            uc_set_preset_images($post->ID, $featured, $gallery);
        }
        uc_apply_preset_taxonomies(
            $post->ID,
            isset($fields['category']) ? $fields['category'] : '',
            isset($fields['tags']) ? $fields['tags'] : ''
        );

        $norm = uc_normalize_preset(get_post($post->ID), true);
        $norm['message'] = 'Preset saved.';
        return rest_ensure_response($norm);
    }

    /**
     * DELETE /presets/{id}
     */
    public function delete_preset($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_preset_post($id)) {
            return new WP_Error('not_found', 'Preset not found', array('status' => 404));
        }
        if (!uc_user_can_manage_preset($post)) {
            return new WP_Error('forbidden', 'You do not own this preset', array('status' => 403));
        }
        wp_trash_post($id);
        return rest_ensure_response(array('success' => true, 'id' => $id));
    }

    /**
     * POST /presets/{id}/withdraw — cancel pending submission or pending revision.
     */
    public function withdraw_preset($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_preset_post($id)) {
            return new WP_Error('not_found', 'Preset not found', array('status' => 404));
        }
        if (!uc_user_can_manage_preset($post)) {
            return new WP_Error('forbidden', 'You do not own this preset', array('status' => 403));
        }

        $pending = get_post_meta($id, '_uc_pending_revision', true);
        if (is_array($pending) && !empty($pending)) {
            delete_post_meta($id, '_uc_pending_revision');
            update_post_meta($id, '_uc_review_status', 'approved');
            delete_post_meta($id, '_uc_moderator_note');
            $norm = uc_normalize_preset(get_post($id), true);
            $norm['message'] = 'Pending update withdrawn. Live preset unchanged.';
            return rest_ensure_response($norm);
        }

        if ($post->post_status === 'pending') {
            wp_update_post(array('ID' => $id, 'post_status' => 'draft'));
            update_post_meta($id, '_uc_review_status', 'pending');
            $norm = uc_normalize_preset(get_post($id), true);
            $norm['message'] = 'Submission withdrawn (saved as draft).';
            return rest_ensure_response($norm);
        }

        return new WP_Error('nothing_to_withdraw', 'No pending submission or revision to withdraw', array('status' => 400));
    }

    /**
     * GET /presets/moderation-queue
     */
    public function moderation_queue($request) {
        $pending_posts = get_posts(array(
            'post_type'      => uc_preset_post_types(),
            'post_status'    => array('pending', 'draft'),
            'posts_per_page' => 100,
            'orderby'        => 'date',
            'order'          => 'ASC',
        ));

        // Also published posts with a pending revision.
        $revision_posts = get_posts(array(
            'post_type'      => uc_preset_post_types(),
            'post_status'    => 'publish',
            'posts_per_page' => 100,
            'meta_query'     => array(
                array(
                    'key'     => '_uc_pending_revision',
                    'compare' => 'EXISTS',
                ),
            ),
        ));

        $items = array();
        $seen = array();
        foreach (array_merge($pending_posts, $revision_posts) as $post) {
            if (isset($seen[$post->ID])) {
                continue;
            }
            $seen[$post->ID] = true;
            $norm = uc_normalize_preset($post, true);
            if ($norm) {
                $items[] = $norm;
            }
        }

        return rest_ensure_response(array('presets' => $items));
    }

    /**
     * POST /presets/{id}/moderate
     * body: { action: approve|request_changes|reject, note?: string }
     */
    public function moderate_preset($request) {
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post || !uc_is_preset_post($id)) {
            return new WP_Error('not_found', 'Preset not found', array('status' => 404));
        }

        $params = $request->get_json_params();
        if (!is_array($params)) {
            $params = array();
        }
        $action = sanitize_text_field($params['action'] ?? $request->get_param('action') ?? '');
        $note = wp_kses_post($params['note'] ?? $request->get_param('note') ?? '');

        if (!in_array($action, array('approve', 'request_changes', 'reject'), true)) {
            return new WP_Error('invalid_action', 'action must be approve, request_changes, or reject', array('status' => 400));
        }

        $result = $this->apply_moderation($post, $action, $note);
        if (is_wp_error($result)) {
            return $result;
        }
        $this->invalidate_presets_list_cache();

        return rest_ensure_response(uc_normalize_preset(get_post($id), true));
    }

    /**
     * Core moderation logic shared by REST and admin AJAX.
     *
     * @param WP_Post $post
     * @param string  $action
     * @param string  $note
     * @return true|WP_Error
     */
    public function apply_moderation($post, $action, $note = '') {
        $id = $post->ID;
        $pending = get_post_meta($id, '_uc_pending_revision', true);
        $author = get_user_by('id', $post->post_author);

        if ($action === 'approve') {
            if (is_array($pending) && !empty($pending)) {
                // Apply revision onto the live published post (status stays publish → no Discord re-fire).
                $update = array('ID' => $id);
                if (!empty($pending['name'])) {
                    $update['post_title'] = sanitize_text_field($pending['name']);
                }
                if (isset($pending['description'])) {
                    $update['post_content'] = wp_kses_post($pending['description']);
                }
                wp_update_post($update);
                if (!empty($pending['shortcode'])) {
                    uc_set_preset_shortcode($id, sanitize_textarea_field($pending['shortcode']));
                }
                if (isset($pending['integrations'])) {
                    update_post_meta($id, '_uc_integrations', sanitize_text_field($pending['integrations']));
                }
                if (isset($pending['featured_image_id']) || (isset($pending['photo_ids']) && is_array($pending['photo_ids']))) {
                    $featured = isset($pending['featured_image_id'])
                        ? (int) $pending['featured_image_id']
                        : (int) get_post_thumbnail_id($id);
                    $gallery = isset($pending['photo_ids']) && is_array($pending['photo_ids'])
                        ? array_values(array_filter(array_map('intval', $pending['photo_ids'])))
                        : array_values(array_filter(uc_get_preset_photo_ids($id), function ($pid) use ($featured) {
                            return (int) $pid !== (int) $featured;
                        }));
                    if (!isset($pending['featured_image_id']) && isset($pending['photo_ids']) && is_array($pending['photo_ids']) && !empty($pending['photo_ids'])) {
                        $featured = (int) $pending['photo_ids'][0];
                        $gallery = array_slice(array_map('intval', $pending['photo_ids']), 1);
                    }
                    if ($featured > 0) {
                        uc_set_preset_images($id, $featured, $gallery);
                    }
                }
                uc_apply_preset_taxonomies(
                    $id,
                    isset($pending['category']) ? $pending['category'] : '',
                    isset($pending['tags']) ? $pending['tags'] : ''
                );
                delete_post_meta($id, '_uc_pending_revision');
            } else {
                // First-time publish of a pending submission (fires Discord via transition_post_status).
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
            // Keep pending revision if any; keep post_status as-is.
            if ($post->post_status === 'pending') {
                // Stay pending so it remains in WP pending list, but review_status tells author.
            }
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

    /**
     * Email the author about a moderation decision.
     *
     * @param WP_User|false $author
     * @param WP_Post       $post
     * @param string        $decision
     * @param string        $note
     */
    private function email_author($author, $post, $decision, $note) {
        if (!$author || empty($author->user_email)) {
            return;
        }
        $title = get_the_title($post);
        $subjects = array(
            'approved'          => sprintf('[Ultra Card] Your preset "%s" was approved', $title),
            'changes_requested' => sprintf('[Ultra Card] Changes requested for "%s"', $title),
            'rejected'          => sprintf('[Ultra Card] Your preset "%s" was not approved', $title),
        );
        $bodies = array(
            'approved'          => "Good news! Your preset \"{$title}\" has been approved and is now live in the Ultra Card gallery.\n",
            'changes_requested' => "A moderator reviewed your preset \"{$title}\" and requested changes before it can be published.\n",
            'rejected'          => "Your preset \"{$title}\" was not approved for the Ultra Card gallery.\n",
        );
        $subject = $subjects[$decision] ?? '[Ultra Card] Preset update';
        $body = ($bodies[$decision] ?? '') . "\n";
        if ($note !== '') {
            $body .= "Moderator note:\n{$note}\n\n";
        }
        $body .= "You can manage your presets from the Ultra Card Hub → Presets → My Presets.\n";
        $body .= "https://ultracard.io/\n";
        wp_mail($author->user_email, $subject, $body);
    }

    /**
     * Absorbed: Announce New Presets in Discord (webhook from option).
     */
    public function announce_preset_publish($new_status, $old_status, $post) {
        if ($new_status !== 'publish' || $old_status === 'publish') {
            return;
        }
        if (!uc_is_preset_post($post->ID)) {
            return;
        }

        $webhook = get_option(UC_PRESET_DISCORD_WEBHOOK_OPTION, '');
        if (!$webhook) {
            return;
        }

        $permalink = get_permalink($post->ID);
        $author_name = get_the_author_meta('display_name', $post->post_author);
        $cat_tax = taxonomy_exists(uc_preset_category_taxonomy()) ? uc_preset_category_taxonomy() : 'presets_dir_cat';
        $terms = taxonomy_exists($cat_tax) ? wp_get_post_terms($post->ID, $cat_tax) : array();
        $categories = (!is_wp_error($terms) && !empty($terms)) ? implode(', ', wp_list_pluck($terms, 'name')) : '';
        $category_text = $categories ? " _(Category: {$categories})_" : '';

        $data = array(
            'username' => 'Ultra Card',
            'content'  => "🆕 New preset added by **{$author_name}**{$category_text}:\n{$permalink}",
        );

        $response = wp_remote_post($webhook, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body'    => wp_json_encode($data),
            'timeout' => 10,
        ));
        if (is_wp_error($response)) {
            error_log('Ultra Card Discord webhook error: ' . $response->get_error_message());
        }
    }

    /**
     * Absorbed: Clipboard Copy Shortcode Button.
     */
    public function register_copy_shortcode() {
        add_shortcode('copy_preset_code', array($this, 'render_copy_shortcode'));
    }

    public function render_copy_shortcode($atts) {
        $atts = shortcode_atts(array(
            'text'         => 'Copy Preset Shortcode',
            'success_text' => 'Copied Shortcode!',
            'field'        => '_drts_field_preset_code',
        ), $atts);

        global $post;
        if (!$post) {
            return '<p>Error: No post context found</p>';
        }

        $field_value = '';
        if ($atts['field'] === '_drts_field_preset_code' || $atts['field'] === '_uc_preset_code') {
            $field_value = uc_get_preset_shortcode($post->ID);
        } else {
            $field_value = get_post_meta($post->ID, $atts['field'], true);
            if (is_array($field_value)) {
                $field_value = $field_value[0] ?? '';
            }
        }
        if (empty($field_value)) {
            return '<p>No code available</p>';
        }

        $button_id = 'copy-btn-' . $post->ID . '-' . uniqid();
        $escaped_value = esc_js($field_value);

        $html  = '<div class="copy-button-container">';
        $html .= '<button id="' . esc_attr($button_id) . '" class="w-btn us-btn-style_4 uc-copy-preset-btn" type="button">';
        $html .= '<span class="copy-text">' . esc_html($atts['text']) . '</span>';
        $html .= '<span class="success-text" style="display:none;">' . esc_html($atts['success_text']) . '</span>';
        $html .= '</button></div>';
        $html .= '<script>(function(){var button=document.getElementById("' . $button_id . '");if(!button)return;var copyText=button.querySelector(".copy-text");var successText=button.querySelector(".success-text");button.addEventListener("click",function(){var textToCopy="' . $escaped_value . '";function showSuccess(){copyText.style.display="none";successText.style.display="inline";setTimeout(function(){copyText.style.display="inline";successText.style.display="none";},2000);}function fallbackCopy(text){var ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");showSuccess();}catch(e){}document.body.removeChild(ta);}if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(textToCopy).then(showSuccess).catch(function(){fallbackCopy(textToCopy);});}else{fallbackCopy(textToCopy);}});})();</script>';
        return $html;
    }

    public function enqueue_copy_button_styles() {
        echo '<style>
.copy-text{font-size:14px;}
.copy-button-container .w-btn,.copy-button-container .uc-copy-preset-btn{cursor:pointer;transition:opacity .2s ease;}
.copy-button-container .w-btn:hover,.copy-button-container .uc-copy-preset-btn:hover{opacity:.8;}
.copy-button-container .w-btn:active,.copy-button-container .uc-copy-preset-btn:active{transform:scale(.98);}
</style>';
    }

    /**
     * Absorbed: Stripe Appearance Fix.
     */
    public function stripe_appearance_fix($stripe_params) {
        $stripe_params['appearance'] = array(
            'theme'     => 'flat',
            'inputs'    => 'spaced',
            'labels'    => 'above',
            'variables' => array(
                'colorPrimary'    => '#7c3aed',
                'colorBackground' => '#ffffff',
                'colorText'       => '#111827',
                'colorDanger'     => '#dc2626',
                'fontFamily'      => 'Inter, Arial, sans-serif',
                'fontSizeBase'    => '16px',
                'spacingUnit'     => '4px',
                'borderRadius'    => '10px',
            ),
            'rules' => array(
                '.AccordionItem' => array(
                    'backgroundColor' => '#ffffff',
                    'border'          => '1px solid #e5e7eb',
                    'boxShadow'       => 'none',
                ),
                '.AccordionItem--selected' => array(
                    'backgroundColor' => '#ffffff',
                    'border'          => '1px solid #7c3aed',
                    'boxShadow'       => '0 0 0 2px rgba(124,58,237,0.12)',
                ),
                '.Tab' => array(
                    'backgroundColor' => '#ffffff',
                    'border'          => '1px solid #e5e7eb',
                    'boxShadow'       => 'none',
                    'color'           => '#111827',
                ),
                '.Tab:hover' => array('color' => '#111827'),
                '.Tab--selected' => array(
                    'backgroundColor' => '#ffffff',
                    'borderColor'     => '#7c3aed',
                    'boxShadow'       => '0 0 0 2px rgba(124,58,237,0.12)',
                    'color'           => '#111827',
                ),
                '.TabLabel' => array('color' => '#111827'),
                '.Input' => array(
                    'backgroundColor' => '#ffffff',
                    'border'          => '1px solid #d1d5db',
                    'boxShadow'       => 'none',
                    'color'           => '#111827',
                ),
                '.Input:focus' => array(
                    'borderColor' => '#7c3aed',
                    'boxShadow'   => '0 0 0 2px rgba(124,58,237,0.12)',
                ),
                '.Label' => array('color' => '#374151'),
                '.RadioIconOuter' => array('stroke' => '#9ca3af'),
                '.RadioIconInner' => array('fill' => '#7c3aed'),
            ),
        );
        return $stripe_params;
    }

    /**
     * Admin AJAX moderation.
     */
    public function ajax_moderate_preset() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Forbidden'), 403);
        }
        check_ajax_referer('ultra_card_moderate_preset', 'nonce');
        $id = isset($_POST['preset_id']) ? (int) $_POST['preset_id'] : 0;
        $action = isset($_POST['mod_action']) ? sanitize_text_field(wp_unslash($_POST['mod_action'])) : '';
        $note = isset($_POST['note']) ? wp_kses_post(wp_unslash($_POST['note'])) : '';
        $post = get_post($id);
        if (!$post || !uc_is_preset_post($id)) {
            wp_send_json_error(array('message' => 'Preset not found'), 404);
        }
        $result = $this->apply_moderation($post, $action, $note);
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()), 400);
        }
        wp_send_json_success(uc_normalize_preset(get_post($id), true));
    }

    /**
     * Seed _uc_review_status on legacy pending/draft submissions (backlog).
     */
    public function ajax_seed_pending_meta() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Forbidden'), 403);
        }
        check_ajax_referer('ultra_card_seed_pending', 'nonce');
        $updated = 0;
        $posts = get_posts(array(
            'post_type'      => uc_preset_post_types(),
            'post_status'    => array('pending', 'draft'),
            'posts_per_page' => 200,
        ));
        foreach ($posts as $post) {
            $existing = get_post_meta($post->ID, '_uc_review_status', true);
            if (!$existing) {
                update_post_meta($post->ID, '_uc_review_status', 'pending');
                update_post_meta($post->ID, '_uc_submitted_at', $post->post_date);
                $updated++;
            }
            // Ensure shortcode is mirrored into _uc_preset_code.
            $code = uc_get_preset_shortcode($post->ID);
            if ($code) {
                update_post_meta($post->ID, '_uc_preset_code', $code);
            }
        }
        wp_send_json_success(array('updated' => $updated));
    }

    /**
     * Remap legacy badge/layout/widget categories onto modules-page categories.
     */
    public function ajax_remap_preset_categories() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Forbidden'), 403);
        }
        check_ajax_referer('ultra_card_remap_cats', 'nonce');
        $dry = !empty($_POST['dry_run']);
        $report = uc_remap_preset_categories_to_modules($dry, true);
        wp_send_json_success($report);
    }

    /**
     * Migration: set_post_type presets_dir_ltg → ultra_preset, copy meta/terms, mark cutover.
     */
    public function ajax_run_preset_migration() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Forbidden'), 403);
        }
        check_ajax_referer('ultra_card_preset_migration', 'nonce');
        $dry_run = !empty($_POST['dry_run']);

        $report = $this->run_migration($dry_run);
        wp_send_json_success($report);
    }

    /**
     * @param bool $dry_run
     * @return array
     */
    public function run_migration($dry_run = true) {
        $report = array(
            'dry_run'   => $dry_run,
            'migrated'  => array(),
            'skipped'   => array(),
            'errors'    => array(),
            'cutover'   => false,
        );

        if (!post_type_exists('ultra_preset')) {
            $report['errors'][] = 'ultra_preset CPT not registered';
            return $report;
        }

        $posts = get_posts(array(
            'post_type'      => 'presets_dir_ltg',
            'post_status'    => array('publish', 'pending', 'draft', 'private', 'future'),
            'posts_per_page' => 200,
        ));

        foreach ($posts as $post) {
            $entry = array('id' => $post->ID, 'title' => $post->post_title, 'slug' => $post->post_name);
            try {
                $code = uc_get_preset_shortcode($post->ID);
                $photos = uc_get_preset_photo_ids($post->ID);
                $downloads = (int) get_post_meta($post->ID, 'downloads', true);

                $old_cats = taxonomy_exists('presets_dir_cat') ? wp_get_post_terms($post->ID, 'presets_dir_cat') : array();
                $old_tags = taxonomy_exists('presets_dir_tag') ? wp_get_post_terms($post->ID, 'presets_dir_tag') : array();

                if ($dry_run) {
                    $entry['would_migrate'] = true;
                    $entry['code_len'] = strlen($code);
                    $entry['photos'] = count($photos);
                    $entry['downloads'] = $downloads;
                    $report['migrated'][] = $entry;
                    continue;
                }

                // Preserve ID via set_post_type.
                set_post_type($post->ID, 'ultra_preset');
                if ($code) {
                    uc_set_preset_shortcode($post->ID, $code);
                }
                if (!empty($photos)) {
                    uc_set_preset_photo_ids($post->ID, $photos);
                }
                update_post_meta($post->ID, 'downloads', $downloads);
                update_post_meta($post->ID, '_uc_migrated_from', 'presets_dir_ltg');

                // Migrate categories.
                if (!is_wp_error($old_cats) && !empty($old_cats)) {
                    $new_ids = array();
                    foreach ($old_cats as $term) {
                        $existing = get_term_by('slug', $term->slug, 'uc_preset_category');
                        if (!$existing) {
                            $created = wp_insert_term($term->name, 'uc_preset_category', array('slug' => $term->slug));
                            if (!is_wp_error($created)) {
                                $new_ids[] = (int) $created['term_id'];
                            }
                        } else {
                            $new_ids[] = (int) $existing->term_id;
                        }
                    }
                    if ($new_ids) {
                        wp_set_post_terms($post->ID, $new_ids, 'uc_preset_category');
                    }
                }

                if (!is_wp_error($old_tags) && !empty($old_tags)) {
                    $names = wp_list_pluck($old_tags, 'name');
                    wp_set_post_terms($post->ID, $names, 'uc_preset_tag', false);
                }

                // Default source = community unless author is site admin / WJD.
                $author = get_userdata($post->post_author);
                $source = 'community';
                if ($author && (user_can($author, 'manage_options') || stripos($author->display_name, 'WJD') !== false)) {
                    $source = 'standard';
                }
                wp_set_object_terms($post->ID, $source, 'uc_preset_source', false);

                if (!get_post_meta($post->ID, '_uc_review_status', true)) {
                    update_post_meta(
                        $post->ID,
                        '_uc_review_status',
                        $post->post_status === 'publish' ? 'approved' : 'pending'
                    );
                }

                $report['migrated'][] = $entry;
            } catch (Exception $e) {
                $entry['error'] = $e->getMessage();
                $report['errors'][] = $entry;
            }
        }

        if (!$dry_run && empty($report['errors'])) {
            update_option(UC_PRESET_MIGRATION_OPTION, array(
                'cutover_complete' => true,
                'migrated_at'      => current_time('mysql'),
                'count'            => count($report['migrated']),
            ), false);
            $report['cutover'] = true;
            flush_rewrite_rules(false);
        }

        return $report;
    }

    /**
     * Whether cutover is active (option flag, or auto-detect after migration).
     */
    public function is_cutover_complete() {
        $state = get_option(UC_PRESET_MIGRATION_OPTION, array());
        if (!empty($state['cutover_complete'])) {
            return true;
        }
        // Auto-heal: posts already moved but option missing / redirect skipped.
        if (!post_type_exists('ultra_preset')) {
            return false;
        }
        $native = (int) wp_count_posts('ultra_preset')->publish;
        $legacy = post_type_exists('presets_dir_ltg')
            ? (int) (wp_count_posts('presets_dir_ltg')->publish ?? 0)
            : 0;
        if ($native > 0 && $legacy === 0) {
            update_option(UC_PRESET_MIGRATION_OPTION, array(
                'cutover_complete' => true,
                'migrated_at'      => current_time('mysql'),
                'count'            => $native,
                'auto_detected'    => true,
            ), false);
            return true;
        }
        return false;
    }

    /**
     * 301 legacy DP URLs after cutover.
     */
    public function maybe_redirect_legacy_preset_urls() {
        if (!$this->is_cutover_complete()) {
            return;
        }
        if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST)) {
            return;
        }

        $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH);
        $path = untrailingslashit($path ?: '') . '/';

        // Directory listing pages (DP gallery + old menu slug).
        if ($path === '/directory-presets/' || $path === '/preset-gallery/') {
            wp_redirect(home_url('/presets/'), 301);
            exit;
        }

        // Single preset: /directory-presets/preset/{slug}/ → /preset/{slug}/
        if (preg_match('#^/directory-presets/preset/([^/]+)/$#', $path, $m)) {
            $slug = sanitize_title($m[1]);
            $post = get_page_by_path($slug, OBJECT, 'ultra_preset');
            if ($post) {
                wp_redirect(get_permalink($post), 301);
                exit;
            }
            wp_redirect(home_url('/presets/'), 301);
            exit;
        }
    }

    /**
     * Require login for native account pages (templates also guard; this is early UX).
     */
    public function maybe_require_login_for_account_pages() {
        if (is_user_logged_in()) {
            return;
        }
        if ($this->is_account_page_request('add-preset')) {
            wp_safe_redirect(wp_login_url(home_url('/add-preset/')));
            exit;
        }
        if ($this->is_account_page_request('dashboard')) {
            wp_safe_redirect(wp_login_url(home_url('/dashboard/')));
            exit;
        }
    }

    /**
     * Whether the current request is a specific page slug (pretty permalink or ?pagename=).
     */
    private function is_account_page_request($slug) {
        if (is_page($slug)) {
            return true;
        }
        $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH);
        $path = untrailingslashit($path ?: '');
        return $path === '/' . $slug || $path === $slug;
    }

    /**
     * Serve plugin templates for ultra_preset archive/single and native account pages.
     */
    public function template_include($template) {
        // Account pages — always available (do not depend on preset cutover).
        if ($this->is_account_page_request('add-preset')) {
            $custom = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/page-add-preset.php';
            if (file_exists($custom)) {
                return $custom;
            }
        }
        if ($this->is_account_page_request('dashboard')) {
            $custom = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/page-dashboard.php';
            if (file_exists($custom)) {
                return $custom;
            }
        }

        if (!$this->is_cutover_complete() && !is_singular('ultra_preset') && !is_post_type_archive('ultra_preset')) {
            return $template;
        }
        if (is_post_type_archive('ultra_preset')) {
            $custom = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/archive-ultra_preset.php';
            if (file_exists($custom)) {
                return $custom;
            }
        }
        if (is_singular('ultra_preset')) {
            $custom = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'templates/single-ultra_preset.php';
            if (file_exists($custom)) {
                return $custom;
            }
        }
        return $template;
    }
}

/**
 * Admin: Presets moderation tab helpers (rendered from UltraCardAdminDashboard).
 */
function ultra_card_render_presets_moderation_tab() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $authoring = UltraCardPresetAuthoring::instance();
    $queue = $authoring->moderation_queue(null);
    $data = $queue->get_data();
    $presets = isset($data['presets']) ? $data['presets'] : array();
    $nonce = wp_create_nonce('ultra_card_moderate_preset');
    $seed_nonce = wp_create_nonce('ultra_card_seed_pending');
    $mig_nonce = wp_create_nonce('ultra_card_preset_migration');
    $remap_nonce = wp_create_nonce('ultra_card_remap_cats');
    $webhook = get_option(UC_PRESET_DISCORD_WEBHOOK_OPTION, '');
    $state = get_option(UC_PRESET_MIGRATION_OPTION, array());
    $remap_state = get_option('ultra_card_preset_categories_remapped', array());

    // Save webhook if posted.
    if (isset($_POST['ultra_card_save_discord_webhook']) && check_admin_referer('ultra_card_discord_webhook')) {
        $new = esc_url_raw(wp_unslash($_POST['ultra_card_preset_discord_webhook'] ?? ''));
        update_option(UC_PRESET_DISCORD_WEBHOOK_OPTION, $new, false);
        $webhook = $new;
        echo '<div class="notice notice-success"><p>Discord webhook saved. Rotate the Discord webhook in Discord as well if this URL was previously exposed.</p></div>';
    }

    echo '<div class="uc-presets-moderation">';
    echo '<h2>Preset Moderation Queue</h2>';
    echo '<div class="notice notice-warning inline"><p><strong>After deploying plugin 1.3.0:</strong> disable these WPCode snippets so behavior lives only in this plugin — <em>Track Preset Downloads</em>, <em>Announce New Presets in Discord</em>, <em>Clipboard Copy Shortcode Button PReset</em>, <em>Untitled Snippet</em> (copy-button CSS), and <em>Stripe Appearance Fix</em>. Leave <em>Enable Presets API 2</em> disabled (unsafe/broken). Then rotate the Discord webhook URL below.</p></div>';
    echo '<p>Pending submissions and published presets with updates awaiting review. Approving a first-time submission publishes it (and announces in Discord). Approving a revision updates the live preset without a duplicate announcement.</p>';

    echo '<p>';
    echo '<button type="button" class="button" id="uc-seed-pending-meta">Seed review meta on legacy pending/drafts</button> ';
    echo '<button type="button" class="button" id="uc-migration-dry">Migration dry-run</button> ';
    echo '<button type="button" class="button button-primary" id="uc-migration-run"' . (!empty($state['cutover_complete']) ? ' disabled' : '') . '>Run cutover migration</button>';
    if (!empty($state['cutover_complete'])) {
        echo ' <span class="description">Cutover complete on ' . esc_html($state['migrated_at'] ?? '') . ' (' . intval($state['count'] ?? 0) . ' presets).</span>';
    }
    echo '</p>';
    echo '<p>';
    echo '<button type="button" class="button" id="uc-remap-cats-dry">Category remap dry-run</button> ';
    echo '<button type="button" class="button button-primary" id="uc-remap-cats-run">Remap categories to modules</button>';
    if (!empty($remap_state['at'])) {
        echo ' <span class="description">Last remap ' . esc_html($remap_state['at']) . ' (' . intval($remap_state['updated'] ?? 0) . ' updated).</span>';
    } else {
        echo ' <span class="description">Aligns preset categories with /modules (Layout, Content, Data, Controls, Inputs, Media).</span>';
    }
    echo '</p>';
    echo '<pre id="uc-migration-report" style="background:#111;color:#0f0;padding:12px;max-height:240px;overflow:auto;display:none;"></pre>';

    echo '<h3>Discord preset announcements</h3>';
    echo '<form method="post">';
    wp_nonce_field('ultra_card_discord_webhook');
    echo '<table class="form-table"><tr><th>Webhook URL</th><td>';
    echo '<input type="url" class="large-text" name="ultra_card_preset_discord_webhook" value="' . esc_attr($webhook) . '" />';
    echo '<p class="description">Stored in the <code>ultra_card_preset_discord_webhook</code> option. Rotate this in Discord after absorbing the WPCode snippet.</p>';
    echo '</td></tr></table>';
    echo '<p><button type="submit" name="ultra_card_save_discord_webhook" class="button button-secondary">Save webhook</button></p>';
    echo '</form>';

    if (empty($presets)) {
        echo '<div class="notice notice-info inline"><p>Queue is empty. Nice.</p></div>';
    } else {
        echo '<table class="widefat striped"><thead><tr>';
        echo '<th>ID</th><th>Title</th><th>Author</th><th>Status</th><th>Review</th><th>Revision?</th><th>Actions</th>';
        echo '</tr></thead><tbody>';
        foreach ($presets as $p) {
            $author = get_userdata($p['author_id'] ?? 0);
            $author_name = $author ? $author->display_name : ('#' . ($p['author_id'] ?? '?'));
            echo '<tr data-preset-id="' . esc_attr($p['id']) . '">';
            echo '<td>' . esc_html($p['id']) . '</td>';
            echo '<td><strong>' . esc_html($p['name']) . '</strong>';
            if (!empty($p['moderator_note'])) {
                echo '<br><em style="color:#b32d2e;">Note: ' . esc_html($p['moderator_note']) . '</em>';
            }
            if (!empty($p['has_pending_revision']) && !empty($p['pending_revision'])) {
                echo '<details style="margin-top:6px;"><summary>Pending revision diff</summary><pre style="white-space:pre-wrap;max-height:200px;overflow:auto;">';
                echo esc_html(wp_json_encode($p['pending_revision'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                echo '</pre></details>';
            }
            echo '</td>';
            echo '<td>' . esc_html($author_name) . '</td>';
            echo '<td>' . esc_html($p['status']) . '</td>';
            echo '<td>' . esc_html($p['review_status']) . '</td>';
            echo '<td>' . (!empty($p['has_pending_revision']) ? 'Yes' : 'No') . '</td>';
            echo '<td class="uc-mod-actions">';
            echo '<textarea class="uc-mod-note" rows="2" placeholder="Moderator note (optional)" style="width:100%;margin-bottom:4px;"></textarea>';
            echo '<button type="button" class="button button-primary uc-mod-btn" data-action="approve">Approve</button> ';
            echo '<button type="button" class="button uc-mod-btn" data-action="request_changes">Request changes</button> ';
            echo '<button type="button" class="button uc-mod-btn" data-action="reject">Reject</button>';
            echo '</td></tr>';
        }
        echo '</tbody></table>';
    }

    $ajax = admin_url('admin-ajax.php');
    echo '<script>
    (function($){
      var ajaxUrl = ' . wp_json_encode($ajax) . ';
      var nonce = ' . wp_json_encode($nonce) . ';
      var seedNonce = ' . wp_json_encode($seed_nonce) . ';
      var migNonce = ' . wp_json_encode($mig_nonce) . ';
      var remapNonce = ' . wp_json_encode($remap_nonce) . ';
      $(document).on("click", ".uc-mod-btn", function(){
        var $tr = $(this).closest("tr");
        var id = $tr.data("preset-id");
        var action = $(this).data("action");
        var note = $tr.find(".uc-mod-note").val() || "";
        if (action === "reject" && !confirm("Reject this preset?")) return;
        $.post(ajaxUrl, { action: "ultra_card_moderate_preset", nonce: nonce, preset_id: id, mod_action: action, note: note })
          .done(function(resp){ if(resp.success){ $tr.fadeOut(200, function(){ $(this).remove(); }); } else { alert((resp.data && resp.data.message) || "Failed"); } })
          .fail(function(){ alert("Request failed"); });
      });
      $("#uc-seed-pending-meta").on("click", function(){
        $.post(ajaxUrl, { action: "ultra_card_seed_pending_meta", nonce: seedNonce })
          .done(function(resp){ alert(resp.success ? ("Updated " + resp.data.updated + " posts") : "Failed"); location.reload(); });
      });
      function runMig(dry){
        $("#uc-migration-report").show().text("Running...");
        $.post(ajaxUrl, { action: "ultra_card_run_preset_migration", nonce: migNonce, dry_run: dry ? 1 : 0 })
          .done(function(resp){ $("#uc-migration-report").text(JSON.stringify(resp.data || resp, null, 2)); if(!dry && resp.success){ location.reload(); } });
      }
      $("#uc-migration-dry").on("click", function(){ runMig(true); });
      $("#uc-migration-run").on("click", function(){
        if (!confirm("This will set_post_type all presets_dir_ltg → ultra_preset and enable cutover redirects. Continue?")) return;
        runMig(false);
      });
      function runRemap(dry){
        $("#uc-migration-report").show().text("Running category remap...");
        $.post(ajaxUrl, { action: "ultra_card_remap_preset_categories", nonce: remapNonce, dry_run: dry ? 1 : 0 })
          .done(function(resp){ $("#uc-migration-report").text(JSON.stringify(resp.data || resp, null, 2)); if(!dry && resp.success){ /* keep report visible */ } });
      }
      $("#uc-remap-cats-dry").on("click", function(){ runRemap(true); });
      $("#uc-remap-cats-run").on("click", function(){
        if (!confirm("Remap all presets onto the modules categories (Layout / Content / Data / Controls / Inputs / Media) and prune unused legacy terms?")) return;
        runRemap(false);
      });
    })(jQuery);
    </script>';
    echo '</div>';
}

// Boot.
UltraCardPresetAuthoring::instance();
