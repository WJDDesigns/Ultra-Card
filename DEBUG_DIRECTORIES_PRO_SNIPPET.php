<?php
/**
 * DEBUG VERSION - Directories Pro Integration for Ultra Card
 * This version outputs debug info to both error log AND browser console
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

// Add preset meta with debug output to browser console
function uc_add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            $post_id = $post['id'];
            
            // Get shortcode from _drts_field_preset_code
            $shortcode = get_post_meta($post_id, '_drts_field_preset_code', true);
            if (is_array($shortcode)) {
                $shortcode = $shortcode[0];
            }
            
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
            
            // Get tags from taxonomy
            $tags = '';
            $tag_terms = get_the_terms($post_id, 'presets_dir_tag');
            if ($tag_terms && !is_wp_error($tag_terms)) {
                $tag_names = array_map(function($term) { 
                    return strtolower($term->name); 
                }, $tag_terms);
                $tags = implode(',', $tag_names);
            }
            
            // Get ALL meta keys for debugging
            $all_meta = get_post_meta($post_id);
            $image_meta = [];
            foreach ($all_meta as $key => $value) {
                if (strpos($key, 'photo') !== false || strpos($key, 'image') !== false || strpos($key, 'drts') !== false) {
                    $image_meta[$key] = $value;
                }
            }
            
            // Get featured image from _drts_directory_photos
            $featured_image = '';
            $directory_photos = get_post_meta($post_id, '_drts_directory_photos', true);
            
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
            }
            
            // Get description from post content and excerpt
            $description = '';
            $post_content = get_post_field('post_content', $post_id);
            $post_excerpt = get_post_field('post_excerpt', $post_id);
            
            if (!empty($post_excerpt)) {
                $description = wp_strip_all_tags($post_excerpt);
            } elseif (!empty($post_content)) {
                $description = wp_strip_all_tags($post_content);
                if (strlen($description) > 150) {
                    $description = substr($description, 0, 150) . '...';
                }
            } else {
                $description = 'No description available';
            }
            
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
                'description' => $description,
                // DEBUG DATA - will show in API response
                'debug_info' => array(
                    'post_id' => $post_id,
                    'all_image_meta_keys' => array_keys($image_meta),
                    'directory_photos_raw' => $directory_photos,
                    'wp_featured_image' => get_the_post_thumbnail_url($post_id, 'large'),
                    'post_content_length' => strlen($post_content),
                    'post_excerpt_length' => strlen($post_excerpt),
                    'final_image' => $featured_image,
                    'final_description' => $description
                )
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
