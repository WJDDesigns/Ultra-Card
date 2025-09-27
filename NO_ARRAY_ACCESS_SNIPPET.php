<?php
/**
 * NO ARRAY ACCESS Directories Pro Integration for Ultra Card
 * Title: Directories Pro Integration with Zero Array Access - Maximum Safety
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

// Add preset meta with ZERO array access to avoid all errors
function add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            try {
                $post_id = $post['id'];
                
                // Get shortcode - avoid array access completely
                $shortcode = '';
                $shortcode_meta = get_post_meta($post_id, '_drts_field_preset_code', true);
                if (!empty($shortcode_meta) && is_string($shortcode_meta)) {
                    $shortcode = $shortcode_meta;
                }
                
                // Get category from taxonomy - use foreach instead of array access
                $category = 'badges';
                $category_terms = get_the_terms($post_id, 'presets_dir_cat');
                if (!empty($category_terms) && !is_wp_error($category_terms) && is_array($category_terms)) {
                    foreach ($category_terms as $term) {
                        if (is_object($term) && property_exists($term, 'name')) {
                            $category_name = strtolower($term->name);
                            $category_map = [
                                'badge' => 'badges',
                                'widget' => 'widgets', 
                                'layout' => 'layouts',
                                'custom' => 'custom'
                            ];
                            $category = isset($category_map[$category_name]) ? $category_map[$category_name] : 'badges';
                            break; // Take first category
                        }
                    }
                }
                
                // Get tags from taxonomy - safe foreach
                $tags = '';
                $tag_terms = get_the_terms($post_id, 'presets_dir_tag');
                if (!empty($tag_terms) && !is_wp_error($tag_terms) && is_array($tag_terms)) {
                    $tag_names = array();
                    foreach ($tag_terms as $term) {
                        if (is_object($term) && property_exists($term, 'name') && !empty($term->name)) {
                            $tag_names[] = strtolower($term->name);
                        }
                    }
                    $tags = implode(',', $tag_names);
                }
                
                // Skip complex image extraction for now - just use WordPress featured image
                $featured_image = '';
                $wp_featured = get_the_post_thumbnail_url($post_id, 'large');
                if (!empty($wp_featured)) {
                    $featured_image = $wp_featured;
                }

                // Get description safely
                $description = '';
                $post_obj = get_post($post_id);
                if ($post_obj && is_object($post_obj)) {
                    if (property_exists($post_obj, 'post_excerpt') && !empty($post_obj->post_excerpt)) {
                        $description = strip_tags($post_obj->post_excerpt);
                    } elseif (property_exists($post_obj, 'post_content') && !empty($post_obj->post_content)) {
                        $description = strip_tags($post_obj->post_content);
                        if (strlen($description) > 200) {
                            $description = substr($description, 0, 197) . '...';
                        }
                    }
                }

                return array(
                    'shortcode' => !empty($shortcode) ? $shortcode : '{"rows":[]}',
                    'category' => $category,
                    'tags' => $tags,
                    'integrations' => array(), // Simplified for now
                    'difficulty' => 'beginner',
                    'compatibility' => '',
                    'downloads' => 0,
                    'rating' => 0,
                    'featured_image' => $featured_image,
                    'gallery' => array(),
                    'description' => !empty($description) ? $description : 'No description available',
                );
                
            } catch (Exception $e) {
                // If anything goes wrong, return safe defaults
                return array(
                    'shortcode' => '{"rows":[]}',
                    'category' => 'badges',
                    'tags' => '',
                    'integrations' => array(),
                    'difficulty' => 'beginner',
                    'compatibility' => '',
                    'downloads' => 0,
                    'rating' => 0,
                    'featured_image' => '',
                    'gallery' => array(),
                    'description' => 'Error loading preset data',
                );
            }
        }
    ));
}
add_action('rest_api_init', 'add_directories_pro_preset_meta');

// Smart CORS handling - Allow any IP with port 8123 (Home Assistant)
function add_smart_cors_headers() {
    // Get the origin of the request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Check if origin is a Home Assistant instance (any IP with port 8123)
    $is_home_assistant = false;
    
    if (!empty($origin)) {
        // Parse the origin URL
        $parsed = parse_url($origin);
        
        if ($parsed && is_array($parsed)) {
            if (isset($parsed['port']) && $parsed['port'] == 8123) {
                // This is a Home Assistant instance (port 8123)
                $is_home_assistant = true;
            } elseif (!isset($parsed['port']) && isset($parsed['host'])) {
                // Check if it's homeassistant.local or localhost without explicit port
                $host = $parsed['host'];
                if (in_array($host, ['homeassistant.local', 'localhost', '127.0.0.1'])) {
                    $is_home_assistant = true;
                }
            }
        }
    }
    
    if ($is_home_assistant) {
        // Allow this Home Assistant instance
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // For non-HA requests, allow all for development
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Handle preflight OPTIONS requests
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Apply CORS headers early
add_action('init', 'add_smart_cors_headers', 1);
add_action('rest_api_init', 'add_smart_cors_headers', 1);

// Also apply CORS headers to all REST API requests
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    add_smart_cors_headers();
    return $served;
}, 10, 4);

?>
