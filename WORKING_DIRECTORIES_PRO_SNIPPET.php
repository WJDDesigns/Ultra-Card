/**
 * WORKING Directories Pro Integration - Comprehensive Field Detection
 * This version tries ALL possible field names and logs everything
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

// Add preset meta with comprehensive field detection
function add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            $post_id = $post['id'];
            
            // === SHORTCODE DETECTION ===
            $shortcode = '';
            $shortcode_fields = [
                'field_preset_code',    // Your exact field name
                'preset_code',          // Fallback
                'drts_field_preset_code',
                'entity_form_text-1',   // Your element ID
            ];
            
            foreach ($shortcode_fields as $field) {
                $value = get_post_meta($post_id, $field, true);
                if (!empty($value) && $value !== '{"rows":[]}') {
                    $shortcode = $value;
                    error_log("FOUND shortcode in field '$field' for post $post_id: " . substr($shortcode, 0, 50) . "...");
                    break;
                }
            }
            
            // === IMAGE DETECTION ===
            $featured_image = '';
            $image_fields = [
                'directory_photos',     // Your exact field name
                'field_directory_photos',
                'drts_directory_photos',
                'entity_form_wp_image-1', // Your element ID
            ];
            
            foreach ($image_fields as $field) {
                $images = get_post_meta($post_id, $field, true);
                if (!empty($images)) {
                    error_log("Found images in field '$field': " . print_r($images, true));
                    
                    if (is_array($images) && !empty($images[0])) {
                        $featured_image = wp_get_attachment_image_url($images[0], 'large');
                        if ($featured_image) break;
                    } elseif (is_numeric($images)) {
                        $featured_image = wp_get_attachment_image_url($images, 'large');
                        if ($featured_image) break;
                    }
                }
            }
            
            // Fallback to WordPress featured image
            if (empty($featured_image)) {
                $featured_image = get_the_post_thumbnail_url($post_id, 'large');
            }
            
            // === CATEGORY DETECTION ===
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
            
            // === TAGS DETECTION ===
            $tags = '';
            $tag_terms = get_the_terms($post_id, 'presets_dir_tag');
            if ($tag_terms && !is_wp_error($tag_terms)) {
                $tag_names = array_map(function($term) { 
                    return strtolower($term->name); 
                }, $tag_terms);
                $tags = implode(',', $tag_names);
            }
            
            // === DEBUG ALL META FIELDS ===
            $all_meta = get_post_meta($post_id);
            error_log("=== ALL META FIELDS FOR POST $post_id ===");
            foreach ($all_meta as $key => $value) {
                if (strpos($key, 'preset') !== false || strpos($key, 'code') !== false || 
                    strpos($key, 'photo') !== false || strpos($key, 'image') !== false ||
                    strpos($key, 'field_') === 0 || strpos($key, 'entity_') === 0) {
                    error_log("Field '$key': " . print_r($value, true));
                }
            }
            error_log("=== END META FIELDS ===");
            
            error_log("FINAL RESULT for post $post_id:");
            error_log("- Shortcode: " . ($shortcode ? 'FOUND (' . strlen($shortcode) . ' chars)' : 'EMPTY'));
            error_log("- Category: $category");
            error_log("- Tags: $tags");
            error_log("- Image: " . ($featured_image ?: 'NONE'));
            
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
