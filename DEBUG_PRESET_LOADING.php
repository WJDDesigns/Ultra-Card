<?php
/**
 * DEBUG VERSION - Directories Pro Integration with Extensive Logging
 * Use this temporarily to debug why presets aren't loading on new install
 */

// Enable Directories Pro presets in REST API
function enable_directories_pro_presets_api() {
    global $wp_post_types;
    
    if (isset($wp_post_types['presets_dir_ltg'])) {
        $wp_post_types['presets_dir_ltg']->show_in_rest = true;
        $wp_post_types['presets_dir_ltg']->rest_base = 'presets_dir_ltg';
        $wp_post_types['presets_dir_ltg']->rest_controller_class = 'WP_REST_Posts_Controller';
        
        // DEBUG: Log that we enabled the post type
        error_log('Ultra Card Debug: Enabled presets_dir_ltg in REST API');
    } else {
        error_log('Ultra Card Debug: presets_dir_ltg post type not found!');
    }
}
add_action('init', 'enable_directories_pro_presets_api', 25);

// Add preset meta with debugging
function add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            $post_id = $post['id'];
            
            // DEBUG: Log each preset being processed
            error_log("Ultra Card Debug: Processing preset ID {$post_id}");
            
            // Get shortcode from _drts_field_preset_code
            $shortcode = get_post_meta($post_id, '_drts_field_preset_code', true);
            if (is_array($shortcode)) {
                $shortcode = $shortcode[0];
            }
            
            // DEBUG: Log shortcode status
            if (empty($shortcode)) {
                error_log("Ultra Card Debug: Preset {$post_id} has empty shortcode");
            } else {
                error_log("Ultra Card Debug: Preset {$post_id} has shortcode: " . substr($shortcode, 0, 100) . '...');
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
                error_log("Ultra Card Debug: Preset {$post_id} category: {$category} (from {$category_name})");
            }
            
            // Get tags from taxonomy
            $tags = '';
            $tag_terms = get_the_terms($post_id, 'presets_dir_tag');
            if ($tag_terms && !is_wp_error($tag_terms)) {
                $tag_names = array_map(function($term) { 
                    return strtolower($term->name); 
                }, $tag_terms);
                $tags = implode(',', $tag_names);
                error_log("Ultra Card Debug: Preset {$post_id} tags: {$tags}");
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
                error_log("Ultra Card Debug: Preset {$post_id} featured image: {$featured_image}");
            }
            
            // Fallback to WordPress featured image
            if (empty($featured_image)) {
                $featured_image = get_the_post_thumbnail_url($post_id, 'large');
                if ($featured_image) {
                    error_log("Ultra Card Debug: Preset {$post_id} using WP featured image: {$featured_image}");
                }
            }

            // Get description properly from the actual post object
            $description = '';
            $post_obj = get_post($post_id);
            if ($post_obj) {
                // Try excerpt first, then content
                if (!empty($post_obj->post_excerpt)) {
                    $description = strip_tags($post_obj->post_excerpt);
                    error_log("Ultra Card Debug: Preset {$post_id} using excerpt for description");
                } elseif (!empty($post_obj->post_content)) {
                    $description = strip_tags($post_obj->post_content);
                    // Truncate long content to reasonable length
                    if (strlen($description) > 200) {
                        $description = substr($description, 0, 197) . '...';
                    }
                    error_log("Ultra Card Debug: Preset {$post_id} using content for description");
                } else {
                    error_log("Ultra Card Debug: Preset {$post_id} has no excerpt or content");
                }
            }

            $result = array(
                'shortcode' => $shortcode ?: '{"rows":[]}',
                'category' => $category,
                'tags' => $tags,
                'integrations' => array(),
                'difficulty' => 'beginner',
                'compatibility' => '',
                'downloads' => 0,
                'rating' => 0,
                'featured_image' => $featured_image ?: '',
                'gallery' => array(),
                'description' => $description ?: 'No description available',
            );
            
            // DEBUG: Log final result
            error_log("Ultra Card Debug: Preset {$post_id} final result: " . json_encode($result));
            
            return $result;
        }
    ));
}
add_action('rest_api_init', 'add_directories_pro_preset_meta');

// Enhanced CORS handling with debugging
function add_enhanced_cors_headers() {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // DEBUG: Log CORS requests
    error_log("Ultra Card Debug: CORS request from origin: {$origin}");
    error_log("Ultra Card Debug: Request URI: " . $_SERVER['REQUEST_URI']);
    
    // Allow all origins for debugging
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        error_log("Ultra Card Debug: Handling OPTIONS preflight request");
        http_response_code(200);
        exit();
    }
}

// Apply CORS headers early
add_action('init', 'add_enhanced_cors_headers', 1);
add_action('rest_api_init', 'add_enhanced_cors_headers', 1);

// Also apply CORS headers to all REST API requests
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    add_enhanced_cors_headers();
    return $served;
}, 10, 4);

// DEBUG: Log when presets are being requested
add_action('rest_api_init', function() {
    if (strpos($_SERVER['REQUEST_URI'], '/presets_dir_ltg') !== false) {
        error_log("Ultra Card Debug: Presets API endpoint accessed: " . $_SERVER['REQUEST_URI']);
        error_log("Ultra Card Debug: User agent: " . $_SERVER['HTTP_USER_AGENT']);
    }
});

?>
