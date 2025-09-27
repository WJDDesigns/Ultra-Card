<?php
/**
 * SMART CORS Directories Pro Integration for Ultra Card
 * Title: Directories Pro Ultra Card Integration with Smart CORS (Any IP:8123)
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

// Add preset meta with correct field names and FIXED description extraction
function add_directories_pro_preset_meta() {
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
                }
            }
            
            // Fallback to WordPress featured image
            if (empty($featured_image)) {
                $featured_image = get_the_post_thumbnail_url($post_id, 'large');
            }

            // FIXED: Get description properly from the actual post object
            $description = '';
            $post_obj = get_post($post_id);
            if ($post_obj) {
                // Try excerpt first, then content
                if (!empty($post_obj->post_excerpt)) {
                    $description = strip_tags($post_obj->post_excerpt);
                } elseif (!empty($post_obj->post_content)) {
                    $description = strip_tags($post_obj->post_content);
                    // Truncate long content to reasonable length
                    if (strlen($description) > 200) {
                        $description = substr($description, 0, 197) . '...';
                    }
                }
            }

            // Get integrations from tags (if any contain integration info)
            $integrations = array();
            if ($tag_terms && !is_wp_error($tag_terms)) {
                foreach ($tag_terms as $tag) {
                    $tag_name = strtolower($tag->name);
                    // Check if tag looks like an integration (contains common integration terms)
                    if (preg_match('/\b(hacs|integration|addon|component|mqtt|zigbee|zwave|esphome|tasmota|shelly|philips|hue|nest|ring|ecobee|tesla|sonos|plex|spotify|netflix)\b/', $tag_name)) {
                        $integrations[] = $tag->name;
                    }
                }
            }

            return array(
                'shortcode' => $shortcode ?: '{"rows":[]}',
                'category' => $category,
                'tags' => $tags,
                'integrations' => $integrations,
                'difficulty' => 'beginner',
                'compatibility' => '',
                'downloads' => 0,
                'rating' => 0,
                'featured_image' => $featured_image ?: '',
                'gallery' => array(),
                'description' => $description ?: 'No description available',
            );
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
    
    if ($origin) {
        // Parse the origin URL
        $parsed = parse_url($origin);
        
        if ($parsed && isset($parsed['port']) && $parsed['port'] == 8123) {
            // This is a Home Assistant instance (port 8123)
            $is_home_assistant = true;
        } elseif ($parsed && !isset($parsed['port'])) {
            // Check if it's homeassistant.local or localhost without explicit port
            $host = $parsed['host'] ?? '';
            if (in_array($host, ['homeassistant.local', 'localhost', '127.0.0.1'])) {
                $is_home_assistant = true;
            }
        }
    }
    
    if ($is_home_assistant) {
        // Allow this Home Assistant instance
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // For non-HA requests, you can either block or allow all
        // For development/testing, allow all - remove this line for production
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
