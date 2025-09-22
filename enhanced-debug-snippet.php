/**
 * Enhanced Debug Version - Directories Pro Integration
 * This version adds extensive logging to debug the shortcode issue
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

// Add preset meta with extensive debugging
function add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            $post_id = $post['id'];
            
            // Get preset code
            $shortcode = get_post_meta($post_id, 'preset_code', true);
            
            // EXTENSIVE DEBUG LOGGING
            error_log("=== PRESET DEBUG FOR POST $post_id ===");
            error_log("Raw shortcode length: " . strlen($shortcode ?: ''));
            error_log("Shortcode starts with: " . substr($shortcode ?: '', 0, 50));
            
            // Test if shortcode can be decoded
            if (!empty($shortcode) && strpos($shortcode, '[ultra_card]') === 0) {
                $encoded_part = str_replace(['[ultra_card]', '[/ultra_card]'], '', $shortcode);
                error_log("Encoded part length: " . strlen($encoded_part));
                
                try {
                    $decoded = base64_decode($encoded_part);
                    error_log("Decoded JSON length: " . strlen($decoded));
                    error_log("Decoded JSON starts with: " . substr($decoded, 0, 100));
                    
                    $parsed = json_decode($decoded, true);
                    if ($parsed) {
                        error_log("Parsed successfully. Type: " . ($parsed['type'] ?? 'unknown'));
                        error_log("Has data: " . (isset($parsed['data']) ? 'yes' : 'no'));
                        if (isset($parsed['data']['columns'])) {
                            error_log("Columns count: " . count($parsed['data']['columns']));
                        }
                    }
                } catch (Exception $e) {
                    error_log("Decode error: " . $e->getMessage());
                }
            }
            
            // Get category from taxonomy
            $category = 'badges';
            $category_terms = get_the_terms($post_id, 'presets_dir_cat');
            if ($category_terms && !is_wp_error($category_terms)) {
                $category_name = strtolower($category_terms[0]->name);
                error_log("Found category term: " . $category_name);
                
                $category_map = [
                    'badge' => 'badges',
                    'badges' => 'badges',
                    'layout' => 'layouts',
                    'layouts' => 'layouts', 
                    'widget' => 'widgets',
                    'widgets' => 'widgets',
                    'dashboard' => 'layouts',
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
                error_log("Found tags: " . $tags);
            }
            
            // Get featured image
            $featured_image = '';
            $directory_photos = get_post_meta($post_id, 'directory_photos', true);
            if (!empty($directory_photos)) {
                if (is_array($directory_photos)) {
                    $featured_image = wp_get_attachment_image_url($directory_photos[0], 'large');
                } elseif (is_numeric($directory_photos)) {
                    $featured_image = wp_get_attachment_image_url($directory_photos, 'large');
                }
            }
            
            if (empty($featured_image)) {
                $featured_image = get_the_post_thumbnail_url($post_id, 'large');
            }
            
            error_log("Final preset data - category: $category, tags: $tags, image: " . ($featured_image ?: 'none'));
            error_log("=== END PRESET DEBUG ===");
            
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

// Enable CORS
function add_cors_http_header() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('rest_api_init', 'add_cors_http_header');
