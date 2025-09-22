<?php
/**
 * FINAL COMPLETE Directories Pro Integration for Ultra Card
 * Title: Directories Pro Ultra Card Integration Final
 * 
 * This snippet enables the Directories Pro presets_dir_ltg post type in the REST API
 * and properly maps all custom fields for Ultra Card integration.
 */

// Enable Directories Pro presets in REST API
function uc_enable_directories_pro_presets_api() {
    global $wp_post_types;
    
    if (isset($wp_post_types['presets_dir_ltg'])) {
        $wp_post_types['presets_dir_ltg']->show_in_rest = true;
        $wp_post_types['presets_dir_ltg']->rest_base = 'presets_dir_ltg';
        $wp_post_types['presets_dir_ltg']->rest_controller_class = 'WP_REST_Posts_Controller';
    }
}
add_action('init', 'uc_enable_directories_pro_presets_api', 25);

// Add preset meta with correct field names from debug logs
function uc_add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            $post_id = $post['id'];
            
            // Debug logging
            error_log("UC Debug: Processing preset ID $post_id");
            
            // Get shortcode from _drts_field_preset_code (confirmed from debug logs)
            $shortcode = get_post_meta($post_id, '_drts_field_preset_code', true);
            if (is_array($shortcode)) {
                $shortcode = $shortcode[0]; // Take first element if array
            }
            error_log("UC Debug: Shortcode for $post_id: " . substr($shortcode, 0, 100) . "...");
            
            // Get category from taxonomy
            $category = 'badges';
            $category_terms = get_the_terms($post_id, 'presets_dir_cat');
            if ($category_terms && !is_wp_error($category_terms)) {
                $category_name = strtolower($category_terms[0]->name);
                $category_map = [
                    'badge' => 'badges',
                    'widget' => 'widgets', 
                    'layout' => 'layouts',
                    'custom' => 'custom'
                ];
                $category = $category_map[$category_name] ?? 'badges';
            }
            error_log("UC Debug: Category for $post_id: $category");
            
            // Get tags from taxonomy
            $tags = '';
            $tag_terms = get_the_terms($post_id, 'presets_dir_tag');
            if ($tag_terms && !is_wp_error($tag_terms)) {
                $tag_names = array_map(function($term) { 
                    return strtolower($term->name); 
                }, $tag_terms);
                $tags = implode(',', $tag_names);
            }
            error_log("UC Debug: Tags for $post_id: $tags");
            
            // Get featured image from _drts_directory_photos (exact structure from debug logs)
            $featured_image = '';
            $directory_photos = get_post_meta($post_id, '_drts_directory_photos', true);
            error_log("UC Debug: Directory photos meta for $post_id: " . print_r($directory_photos, true));
            
            if (!empty($directory_photos) && is_array($directory_photos)) {
                $first_photo = $directory_photos[0];
                if (isset($first_photo['url']['large'])) {
                    $featured_image = $first_photo['url']['large'];
                } elseif (isset($first_photo['url']['full'])) {
                    $featured_image = $first_photo['url']['full'];
                } elseif (isset($first_photo['url']['medium'])) {
                    $featured_image = $first_photo['url']['medium'];
                } elseif (isset($first_photo['url'])) {
                    $featured_image = $first_photo['url'];
                }
            }
            
            // Fallback to WordPress featured image
            if (empty($featured_image)) {
                $featured_image = get_the_post_thumbnail_url($post_id, 'large');
                if ($featured_image) {
                    error_log("UC Debug: Using WP featured image for $post_id: $featured_image");
                }
            }
            
            // Try alternative Directories Pro image fields
            if (empty($featured_image)) {
                $alt_images = get_post_meta($post_id, '_drts_entity_field_directory_photos', true);
                error_log("UC Debug: Alt images for $post_id: " . print_r($alt_images, true));
                
                if (!empty($alt_images) && is_array($alt_images)) {
                    $first_alt = $alt_images[0];
                    if (isset($first_alt['url'])) {
                        $featured_image = $first_alt['url'];
                    }
                }
            }
            
            error_log("UC Debug: Final image for $post_id: $featured_image");
            
            return array(
                'shortcode' => $shortcode ?: '{"rows":[]}',
                'category' => $category,
                'tags' => $tags,
                'difficulty' => 'beginner',
                'compatibility' => '',
                'downloads' => 0,
                'rating' => 0,
                'featured_image' => $featured_image ?: '',
                'gallery' => array(),
            );
        }
    ));
}
add_action('rest_api_init', 'uc_add_directories_pro_preset_meta');

// Enable CORS for Ultra Card
function uc_add_cors_http_header() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('rest_api_init', 'uc_add_cors_http_header');

// Debug function to list all meta keys for troubleshooting
function uc_debug_preset_meta($post_id) {
    $all_meta = get_post_meta($post_id);
    error_log("UC Debug: All meta keys for post $post_id:");
    foreach ($all_meta as $key => $value) {
        if (strpos($key, 'drts') !== false || strpos($key, 'photo') !== false || strpos($key, 'image') !== false) {
            error_log("  $key: " . print_r($value, true));
        }
    }
}

// Uncomment this line temporarily to debug a specific preset
// add_action('init', function() { uc_debug_preset_meta(518); });