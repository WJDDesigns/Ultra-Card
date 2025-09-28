<?php
/**
 * ALLOW ALL IPs Directories Pro Integration for Ultra Card
 * Title: Directories Pro Ultra Card Integration - Allow All Home Assistant IPs
 * This version allows ANY IP address to access presets (perfect for community sharing)
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

// Add preset meta with ultra-safe array access
function add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            try {
                $post_id = $post['id'];
                
                // Get shortcode from _drts_field_preset_code (ULTRA SAFE)
                $shortcode = '';
                $shortcode_meta = get_post_meta($post_id, '_drts_field_preset_code', true);
                if (!empty($shortcode_meta)) {
                    if (is_array($shortcode_meta) && count($shortcode_meta) > 0) {
                        $shortcode = $shortcode_meta[0];
                    } elseif (is_string($shortcode_meta)) {
                        $shortcode = $shortcode_meta;
                    }
                }
                
                // Get category from taxonomy (ULTRA SAFE)
                $category = 'badges';
                $category_terms = get_the_terms($post_id, 'presets_dir_cat');
                if (!empty($category_terms) && !is_wp_error($category_terms) && is_array($category_terms)) {
                    $first_term = reset($category_terms);
                    if ($first_term && is_object($first_term) && property_exists($first_term, 'name')) {
                        $category_name = strtolower($first_term->name);
                        $category_map = [
                            'badge' => 'badges',
                            'widget' => 'widgets', 
                            'layout' => 'layouts',
                            'custom' => 'custom'
                        ];
                        $category = isset($category_map[$category_name]) ? $category_map[$category_name] : 'badges';
                    }
                }
                
                // Get tags from taxonomy (ULTRA SAFE)
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
                
                // Get featured image from _drts_directory_photos (ULTRA SAFE)
                $featured_image = '';
                $directory_photos = get_post_meta($post_id, '_drts_directory_photos', true);
                
                if (!empty($directory_photos)) {
                    // Handle different possible structures
                    if (is_array($directory_photos) && count($directory_photos) > 0) {
                        $first_photo = $directory_photos[0];
                        
                        if (is_array($first_photo) && isset($first_photo['url']) && is_array($first_photo['url'])) {
                            if (!empty($first_photo['url']['large'])) {
                                $featured_image = $first_photo['url']['large'];
                            } elseif (!empty($first_photo['url']['full'])) {
                                $featured_image = $first_photo['url']['full'];
                            } elseif (!empty($first_photo['url']['medium'])) {
                                $featured_image = $first_photo['url']['medium'];
                            }
                        }
                    } elseif (is_string($directory_photos)) {
                        // Sometimes it might be a direct URL string
                        $featured_image = $directory_photos;
                    }
                }
                
                // Fallback to WordPress featured image
                if (empty($featured_image)) {
                    $wp_featured = get_the_post_thumbnail_url($post_id, 'large');
                    if (!empty($wp_featured)) {
                        $featured_image = $wp_featured;
                    }
                }

                // Get description properly from the actual post object (ULTRA SAFE)
                $description = '';
                $post_obj = get_post($post_id);
                if ($post_obj && is_object($post_obj)) {
                    // Try excerpt first, then content
                    if (property_exists($post_obj, 'post_excerpt') && !empty($post_obj->post_excerpt)) {
                        $description = strip_tags($post_obj->post_excerpt);
                    } elseif (property_exists($post_obj, 'post_content') && !empty($post_obj->post_content)) {
                        $description = strip_tags($post_obj->post_content);
                        // Truncate long content to reasonable length
                        if (strlen($description) > 200) {
                            $description = substr($description, 0, 197) . '...';
                        }
                    }
                }

                // Get integrations from tags (ULTRA SAFE)
                $integrations = array();
                if (!empty($tag_terms) && !is_wp_error($tag_terms) && is_array($tag_terms)) {
                    foreach ($tag_terms as $tag) {
                        if (is_object($tag) && property_exists($tag, 'name') && !empty($tag->name)) {
                            $tag_name = strtolower($tag->name);
                            // Check if tag looks like an integration
                            if (preg_match('/\b(hacs|integration|addon|component|mqtt|zigbee|zwave|esphome|tasmota|shelly|philips|hue|nest|ring|ecobee|tesla|sonos|plex|spotify|netflix)\b/', $tag_name)) {
                                $integrations[] = $tag->name;
                            }
                        }
                    }
                }

                return array(
                    'shortcode' => !empty($shortcode) ? $shortcode : '{"rows":[]}',
                    'category' => $category,
                    'tags' => $tags,
                    'integrations' => $integrations,
                    'difficulty' => 'beginner',
                    'compatibility' => '',
                    'downloads' => 0,
                    'rating' => 0,
                    'featured_image' => !empty($featured_image) ? $featured_image : '',
                    'gallery' => array(),
                    'description' => !empty($description) ? $description : 'No description available',
                );
                
            } catch (Exception $e) {
                // If anything goes wrong, return safe defaults
                error_log('Ultra Card Error in preset meta: ' . $e->getMessage());
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
                    'description' => 'Error loading description',
                );
            }
        }
    ));
}
add_action('rest_api_init', 'add_directories_pro_preset_meta');

// UNIVERSAL CORS - Allow ALL IPs to access presets
function add_universal_cors_headers() {
    // Get the origin of the request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Allow ALL origins for maximum compatibility
    // This is perfect for community preset sharing
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
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

// Apply CORS headers early and everywhere
add_action('init', 'add_universal_cors_headers', 1);
add_action('rest_api_init', 'add_universal_cors_headers', 1);

// Also apply CORS headers to all REST API requests
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    add_universal_cors_headers();
    return $served;
}, 10, 4);

// Additional CORS headers for maximum compatibility
add_action('send_headers', 'add_universal_cors_headers');

?>
