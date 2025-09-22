/**
 * CORRECTED Directories Pro Integration with Exact Field Names
 * Title: Directories Pro Ultra Card Integration Corrected
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
            
            // Get featured image from directory_photos field
            $featured_image = '';
            $directory_photos = get_post_meta($post_id, 'directory_photos', true);
            
            error_log("directory_photos raw data: " . print_r($directory_photos, true));
            
            if (!empty($directory_photos)) {
                if (is_array($directory_photos) && !empty($directory_photos[0])) {
                    // Array of image IDs - take first one
                    $image_id = $directory_photos[0];
                    $featured_image = wp_get_attachment_image_url($image_id, 'large');
                    error_log("Using first image from array, ID: $image_id, URL: $featured_image");
                } elseif (is_numeric($directory_photos)) {
                    // Single image ID
                    $featured_image = wp_get_attachment_image_url($directory_photos, 'large');
                    error_log("Using single image ID: $directory_photos, URL: $featured_image");
                } elseif (is_string($directory_photos) && !empty($directory_photos)) {
                    // Might be comma-separated IDs or JSON
                    if (strpos($directory_photos, ',') !== false) {
                        $image_ids = explode(',', $directory_photos);
                        $first_id = trim($image_ids[0]);
                        if (is_numeric($first_id)) {
                            $featured_image = wp_get_attachment_image_url($first_id, 'large');
                            error_log("Using first ID from comma list: $first_id, URL: $featured_image");
                        }
                    } elseif (is_numeric($directory_photos)) {
                        $featured_image = wp_get_attachment_image_url($directory_photos, 'large');
                    }
                }
            }
            
            // Fallback to WordPress featured image
            if (empty($featured_image)) {
                $featured_image = get_the_post_thumbnail_url($post_id, 'large');
                if ($featured_image) {
                    error_log("Using WordPress featured image: $featured_image");
                }
            }
            
            // Final fallback - try to find any attached images
            if (empty($featured_image)) {
                $attachments = get_attached_media('image', $post_id);
                if (!empty($attachments)) {
                    $first_attachment = array_shift($attachments);
                    $featured_image = wp_get_attachment_image_url($first_attachment->ID, 'large');
                    error_log("Using first attachment: $featured_image");
                }
            }
            
            error_log("Final result for post $post_id: category='$category', tags='$tags', image='" . ($featured_image ?: 'NONE') . "'");
            
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

// Force save weather widget shortcode (uncomment to run once)
// add_action('init', 'force_save_weather_widget_shortcode');

function force_save_weather_widget_shortcode() {
    $post_id = 518; // Weather widget ID
    // Add your weather widget shortcode here
    $weather_shortcode = '[ultra_card]YOUR_WEATHER_WIDGET_SHORTCODE_HERE[/ultra_card]';
    
    update_post_meta($post_id, 'field_preset_code', $weather_shortcode);
    error_log("Force saved weather widget shortcode for post $post_id");
}
