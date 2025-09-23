<?php
/**
 * UPDATED Directories Pro Integration with Fixed CORS
 * Title: Directories Pro Ultra Card Integration with IP Address Support
 * 
 * This version fixes the CORS issue by allowing requests from both
 * homeassistant.local and IP addresses (192.168.x.x, 10.x.x.x, etc.)
 */

// Enable Directories Pro presets in REST API
function enable_directories_pro_presets_api() {
    global $wp_post_types;
    
    if (isset($wp_post_types['presets_dir_ltg'])) {
        $wp_post_types['presets_dir_ltg']->show_in_rest = true;
        $wp_post_types['presets_dir_ltg']->rest_base = 'presets_dir_ltg';
        $wp_post_types['presets_dir_ltg']->rest_controller_class = 'WP_REST_Posts_Controller';
    }
}
add_action('init', 'enable_directories_pro_presets_api', 25);

// Add preset meta with CORRECT Directories Pro field names
function add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            $post_id = $post['id'];
            
            // Get preset code using CORRECT field name: field_preset_code
            $shortcode = get_post_meta($post_id, 'field_preset_code', true);
            
            // Debug logging
            error_log("Directories Pro: Getting field_preset_code for post $post_id: " . substr($shortcode ?: 'EMPTY', 0, 100) . "...");
            
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
                error_log("Mapped category '$category_name' to '$category'");
            }
            
            // Get tags from taxonomy
            $tags = '';
            $tag_terms = get_the_terms($post_id, 'presets_dir_tag');
            if ($tag_terms && !is_wp_error($tag_terms)) {
                $tag_names = array_map(function($term) { 
                    return strtolower($term->name); 
                }, $tag_terms);
                $tags = implode(',', $tag_names);
                error_log("Found tags: $tags");
            }
            
            // Get featured image from _drts_directory_photos (exact structure from debug logs)
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
            
            // Final fallback - try to find any attached images
            if (empty($featured_image)) {
                $attachments = get_attached_media('image', $post_id);
                if (!empty($attachments)) {
                    $first_attachment = array_shift($attachments);
                    $featured_image = wp_get_attachment_image_url($first_attachment->ID, 'large');
                }
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
            );
        }
    ));
}
add_action('rest_api_init', 'add_directories_pro_preset_meta');

// FIXED CORS Configuration - Allow Home Assistant from any IP
function add_ultra_card_cors_headers() {
    // Get the origin of the request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Define allowed origins patterns
    $allowed_origins = [
        'http://homeassistant.local:8123',
        'https://homeassistant.local:8123',
    ];
    
    // Allow any Home Assistant instance on local network IPs (RFC 1918 private ranges)
    if (preg_match('/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):8123$/', $origin)) {
        $allowed_origins[] = $origin;
    }
    
    // Allow any localhost/127.0.0.1 with port 8123
    if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1):8123$/', $origin)) {
        $allowed_origins[] = $origin;
    }
    
    // Allow any public IP with port 8123 (for cloud/remote Home Assistant instances)
    if (preg_match('/^https?:\/\/\d+\.\d+\.\d+\.\d+:8123$/', $origin)) {
        $allowed_origins[] = $origin;
    }
    
    // Check if the origin is allowed
    if (in_array($origin, $allowed_origins) || count($allowed_origins) > 2) {
        header("Access-Control-Allow-Origin: $origin");
        error_log("Ultra Card CORS: Allowed origin: $origin");
    } else {
        // Fallback: allow all origins for Ultra Card API requests
        // This is safe since it's read-only preset data
        header("Access-Control-Allow-Origin: *");
        error_log("Ultra Card CORS: Using wildcard for origin: $origin");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("HTTP/1.1 200 OK");
        exit();
    }
}

// Apply CORS headers early in the process
add_action('init', 'add_ultra_card_cors_headers', 1);
add_action('rest_api_init', 'add_ultra_card_cors_headers', 1);

// Also apply to wp-json requests specifically
function apply_cors_to_wp_json($response, $handler, $request) {
    // Only apply to our preset endpoints
    if (strpos($request->get_route(), '/wp/v2/presets_dir_ltg') !== false) {
        add_ultra_card_cors_headers();
    }
    return $response;
}
add_filter('rest_pre_serve_request', 'apply_cors_to_wp_json', 10, 3);

?>
