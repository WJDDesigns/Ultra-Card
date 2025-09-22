<?php
/**
 * FIXED Directories Pro Integration for Ultra Card
 * Title: Directories Pro Ultra Card Integration - FIXED IMAGE PARSING
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

// Add preset meta with FIXED image parsing
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
            
            // FIXED: Get featured image from _drts_directory_photos (handles both array and single object)
            $featured_image = '';
            $directory_photos = get_post_meta($post_id, '_drts_directory_photos', true);
            
            if (!empty($directory_photos)) {
                // Handle both single object and array formats
                $photo_data = null;
                if (is_array($directory_photos)) {
                    // If it's an array, take the first element
                    $photo_data = $directory_photos[0] ?? $directory_photos;
                } else {
                    // If it's a single object, use it directly
                    $photo_data = $directory_photos;
                }
                
                // Extract URL from the photo data
                if (isset($photo_data['url'])) {
                    if (isset($photo_data['url']['large'])) {
                        $featured_image = $photo_data['url']['large'];
                    } elseif (isset($photo_data['url']['full'])) {
                        $featured_image = $photo_data['url']['full'];
                    } elseif (isset($photo_data['url']['medium'])) {
                        $featured_image = $photo_data['url']['medium'];
                    } elseif (is_string($photo_data['url'])) {
                        $featured_image = $photo_data['url'];
                    }
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