<?php
/**
 * Plugin Name: Ultra Card Integration
 * Plugin URI: https://ultracard.io
 * Description: Complete Ultra Card integration for WordPress - includes cloud sync functionality and Directories Pro dashboard panels for managing favorites, colors, and reviews.
 * Version: 1.2.0
 * Author: WJD Designs
 * Author URI: https://wjddesigns.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 * Text Domain: ultra-card-integration
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ULTRA_CARD_INTEGRATION_VERSION', '1.2.0');
define('ULTRA_CARD_INTEGRATION_PLUGIN_FILE', __FILE__);
define('ULTRA_CARD_INTEGRATION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ULTRA_CARD_INTEGRATION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ULTRA_CARD_INTEGRATION_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Ultra Card Cloud Sync Class
 * Handles all cloud synchronization functionality
 */
class UltraCardCloudSync {
    
    public function __construct() {
        add_action('init', array($this, 'create_post_types'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('rest_api_init', array($this, 'add_cors_support'));
    }
    
    /**
     * Create custom post types for Ultra Card data
     */
    public function create_post_types() {
        // Ultra Card Favorites
        register_post_type('ultra_favorite', array(
            'labels' => array(
                'name' => 'Ultra Card Favorites',
                'singular_name' => 'Ultra Card Favorite',
                'menu_name' => 'UC Favorites',
                'add_new' => 'Add New Favorite',
                'add_new_item' => 'Add New Ultra Card Favorite',
                'edit_item' => 'Edit Ultra Card Favorite',
                'new_item' => 'New Ultra Card Favorite',
                'view_item' => 'View Ultra Card Favorite',
                'search_items' => 'Search Ultra Card Favorites',
                'not_found' => 'No Ultra Card favorites found',
                'not_found_in_trash' => 'No Ultra Card favorites found in trash',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'tools.php',
            'show_in_rest' => true,
            'rest_base' => 'ultra-favorites',
            'supports' => array('title', 'editor', 'author', 'custom-fields'),
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'hierarchical' => false,
            'rewrite' => false,
            'query_var' => false,
        ));
        
        // Ultra Card Colors
        register_post_type('ultra_color', array(
            'labels' => array(
                'name' => 'Ultra Card Colors',
                'singular_name' => 'Ultra Card Color',
                'menu_name' => 'UC Colors',
                'add_new' => 'Add New Color',
                'add_new_item' => 'Add New Ultra Card Color',
                'edit_item' => 'Edit Ultra Card Color',
                'new_item' => 'New Ultra Card Color',
                'view_item' => 'View Ultra Card Color',
                'search_items' => 'Search Ultra Card Colors',
                'not_found' => 'No Ultra Card colors found',
                'not_found_in_trash' => 'No Ultra Card colors found in trash',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'tools.php',
            'show_in_rest' => true,
            'rest_base' => 'ultra-colors',
            'supports' => array('title', 'author', 'custom-fields'),
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'hierarchical' => false,
            'rewrite' => false,
            'query_var' => false,
        ));
        
        // Ultra Card Reviews
        register_post_type('ultra_review', array(
            'labels' => array(
                'name' => 'Ultra Card Reviews',
                'singular_name' => 'Ultra Card Review',
                'menu_name' => 'UC Reviews',
                'add_new' => 'Add New Review',
                'add_new_item' => 'Add New Ultra Card Review',
                'edit_item' => 'Edit Ultra Card Review',
                'new_item' => 'New Ultra Card Review',
                'view_item' => 'View Ultra Card Review',
                'search_items' => 'Search Ultra Card Reviews',
                'not_found' => 'No Ultra Card reviews found',
                'not_found_in_trash' => 'No Ultra Card reviews found in trash',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'tools.php',
            'show_in_rest' => true,
            'rest_base' => 'ultra-reviews',
            'supports' => array('title', 'editor', 'author', 'custom-fields'),
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'hierarchical' => false,
            'rewrite' => false,
            'query_var' => false,
        ));
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        // Favorites endpoints
        register_rest_route('ultra-card/v1', '/favorites', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_favorites'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/favorites', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_favorite'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/favorites/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_favorite'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/favorites/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_favorite'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Colors endpoints
        register_rest_route('ultra-card/v1', '/colors', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_colors'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/colors', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_color'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/colors/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_color'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/colors/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_color'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Reviews endpoints
        register_rest_route('ultra-card/v1', '/reviews', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_reviews'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/reviews', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_review'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/reviews/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_review'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/reviews/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_review'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Sync endpoints
        register_rest_route('ultra-card/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_data'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
    }
    
    /**
     * Add CORS support for REST API
     */
    public function add_cors_support() {
        // Add CORS headers using WordPress filters
        add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
            $origin = get_http_origin();
            if ($origin) {
                header('Access-Control-Allow-Origin: ' . $origin);
            } else {
                header('Access-Control-Allow-Origin: *');
            }
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce');
            header('Access-Control-Allow-Credentials: true');
            
            return $served;
        }, 10, 4);
        
        // Handle OPTIONS requests
        add_action('init', function() {
            if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
                if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
                    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
                }
                if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
                    header('Access-Control-Allow-Headers: ' . $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']);
                }
                exit(0);
            }
        });
    }
    
    /**
     * Check user permissions
     */
    public function check_user_permission($request) {
        return is_user_logged_in() && current_user_can('read');
    }
    
    // Favorites CRUD operations
    public function get_favorites($request) {
        $user_id = get_current_user_id();
        $favorites = get_posts(array(
            'post_type' => 'ultra_favorite',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ));
        
        $formatted_favorites = array();
        foreach ($favorites as $favorite) {
            $formatted_favorites[] = $this->format_favorite($favorite);
        }
        
        return rest_ensure_response($formatted_favorites);
    }
    
    public function create_favorite($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_favorite',
            'post_title' => sanitize_text_field($data['name']),
            'post_content' => sanitize_textarea_field($data['description'] ?? ''),
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_Error('create_failed', 'Failed to create favorite', array('status' => 500));
        }
        
        // Save metadata
        update_post_meta($post_id, 'favorite_type', sanitize_text_field($data['type'] ?? 'general'));
        update_post_meta($post_id, 'favorite_data', wp_json_encode($data['data'] ?? array()));
        
        $favorite = get_post($post_id);
        return rest_ensure_response($this->format_favorite($favorite));
    }
    
    public function update_favorite($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $favorite = get_post($id);
        if (!$favorite || $favorite->post_author != $user_id) {
            return new WP_Error('not_found', 'Favorite not found', array('status' => 404));
        }
        
        wp_update_post(array(
            'ID' => $id,
            'post_title' => sanitize_text_field($data['name']),
            'post_content' => sanitize_textarea_field($data['description'] ?? ''),
        ));
        
        update_post_meta($id, 'favorite_type', sanitize_text_field($data['type'] ?? 'general'));
        update_post_meta($id, 'favorite_data', wp_json_encode($data['data'] ?? array()));
        
        $favorite = get_post($id);
        return rest_ensure_response($this->format_favorite($favorite));
    }
    
    public function delete_favorite($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $favorite = get_post($id);
        if (!$favorite || $favorite->post_author != $user_id) {
            return new WP_Error('not_found', 'Favorite not found', array('status' => 404));
        }
        
        $result = wp_delete_post($id, true);
        
        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete favorite', array('status' => 500));
        }
        
        return rest_ensure_response(array('deleted' => true));
    }
    
    // Colors CRUD operations
    public function get_colors($request) {
        $user_id = get_current_user_id();
        $colors = get_posts(array(
            'post_type' => 'ultra_color',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ));
        
        $formatted_colors = array();
        foreach ($colors as $color) {
            $formatted_colors[] = $this->format_color($color);
        }
        
        return rest_ensure_response($formatted_colors);
    }
    
    public function create_color($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_color',
            'post_title' => sanitize_text_field($data['name']),
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_Error('create_failed', 'Failed to create color', array('status' => 500));
        }
        
        update_post_meta($post_id, 'hex_value', sanitize_text_field($data['hex_value']));
        
        $color = get_post($post_id);
        return rest_ensure_response($this->format_color($color));
    }
    
    public function update_color($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $color = get_post($id);
        if (!$color || $color->post_author != $user_id) {
            return new WP_Error('not_found', 'Color not found', array('status' => 404));
        }
        
        wp_update_post(array(
            'ID' => $id,
            'post_title' => sanitize_text_field($data['name']),
        ));
        
        update_post_meta($id, 'hex_value', sanitize_text_field($data['hex_value']));
        
        $color = get_post($id);
        return rest_ensure_response($this->format_color($color));
    }
    
    public function delete_color($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $color = get_post($id);
        if (!$color || $color->post_author != $user_id) {
            return new WP_Error('not_found', 'Color not found', array('status' => 404));
        }
        
        $result = wp_delete_post($id, true);
        
        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete color', array('status' => 500));
        }
        
        return rest_ensure_response(array('deleted' => true));
    }
    
    // Reviews CRUD operations
    public function get_reviews($request) {
        $user_id = get_current_user_id();
        $reviews = get_posts(array(
            'post_type' => 'ultra_review',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ));
        
        $formatted_reviews = array();
        foreach ($reviews as $review) {
            $formatted_reviews[] = $this->format_review($review);
        }
        
        return rest_ensure_response($formatted_reviews);
    }
    
    public function create_review($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_review',
            'post_title' => sanitize_text_field($data['title']),
            'post_content' => sanitize_textarea_field($data['content']),
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_Error('create_failed', 'Failed to create review', array('status' => 500));
        }
        
        update_post_meta($post_id, 'rating', intval($data['rating'] ?? 0));
        
        $review = get_post($post_id);
        return rest_ensure_response($this->format_review($review));
    }
    
    public function update_review($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $review = get_post($id);
        if (!$review || $review->post_author != $user_id) {
            return new WP_Error('not_found', 'Review not found', array('status' => 404));
        }
        
        wp_update_post(array(
            'ID' => $id,
            'post_title' => sanitize_text_field($data['title']),
            'post_content' => sanitize_textarea_field($data['content']),
        ));
        
        update_post_meta($id, 'rating', intval($data['rating'] ?? 0));
        
        $review = get_post($id);
        return rest_ensure_response($this->format_review($review));
    }
    
    public function delete_review($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $review = get_post($id);
        if (!$review || $review->post_author != $user_id) {
            return new WP_Error('not_found', 'Review not found', array('status' => 404));
        }
        
        $result = wp_delete_post($id, true);
        
        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete review', array('status' => 500));
        }
        
        return rest_ensure_response(array('deleted' => true));
    }
    
    // Sync endpoint
    public function sync_data($request) {
        $data = $request->get_json_params();
        $sync_type = $data['type'] ?? 'all';
        
        $response = array();
        
        if ($sync_type === 'all' || $sync_type === 'favorites') {
            $response['favorites'] = $this->get_favorites($request)->get_data();
        }
        
        if ($sync_type === 'all' || $sync_type === 'colors') {
            $response['colors'] = $this->get_colors($request)->get_data();
        }
        
        if ($sync_type === 'all' || $sync_type === 'reviews') {
            $response['reviews'] = $this->get_reviews($request)->get_data();
        }
        
        return rest_ensure_response($response);
    }
    
    // Helper methods to format data
    private function format_favorite($favorite) {
        $meta = get_post_meta($favorite->ID);
        return array(
            'id' => $favorite->ID,
            'name' => $favorite->post_title,
            'description' => $favorite->post_content,
            'type' => $meta['favorite_type'][0] ?? 'general',
            'data' => json_decode($meta['favorite_data'][0] ?? '{}', true),
            'created_at' => $favorite->post_date,
            'updated_at' => $favorite->post_modified,
        );
    }
    
    private function format_color($color) {
        $meta = get_post_meta($color->ID);
        return array(
            'id' => $color->ID,
            'name' => $color->post_title,
            'hex_value' => $meta['hex_value'][0] ?? '#000000',
            'created_at' => $color->post_date,
            'updated_at' => $color->post_modified,
        );
    }
    
    private function format_review($review) {
        $meta = get_post_meta($review->ID);
        return array(
            'id' => $review->ID,
            'title' => $review->post_title,
            'content' => $review->post_content,
            'rating' => intval($meta['rating'][0] ?? 0),
            'created_at' => $review->post_date,
            'updated_at' => $review->post_modified,
        );
    }
}

/**
 * Ultra Card Dashboard Integration Class
 * Handles Directories Pro dashboard integration
 */
class UltraCardDashboardIntegration {
    
    public function __construct() {
        // Only initialize if Directories Pro is active
        if (!class_exists('SabaiApps\\Directories\\Application')) {
            return;
        }
        
        // Primary Directories Pro integration using CustomPanel approach
        add_filter('dashboard_panel_custom_info', array($this, 'register_custom_panels'), 10, 2);
        add_filter('dashboard_panel_custom_content', array($this, 'render_custom_panel_content'), 10, 3);
        add_filter('dashboard_panel_custom_links', array($this, 'get_custom_panel_links'), 10, 2);
        add_filter('dashboard_panel_custom_settings', array($this, 'get_custom_panel_settings'), 10, 4);
        
        // Alternative hook patterns for different Directories Pro versions
        add_filter('drts_dashboard_panel_custom_info', array($this, 'register_custom_panels'), 10, 2);
        add_filter('drts_dashboard_panel_custom_content', array($this, 'render_custom_panel_content'), 10, 3);
        add_filter('drts_dashboard_panel_custom_links', array($this, 'get_custom_panel_links'), 10, 2);
        
        // Legacy panel registration (fallback)
        add_filter('drts_dashboard_panels', array($this, 'add_ultra_card_panels'));
        add_filter('sabai_dashboard_panels', array($this, 'add_ultra_card_panels'));
        
        // Direct panel registration with proper class names
        add_filter('drts_dashboard_panels', array($this, 'register_ultra_card_panel_classes'));
        add_filter('directories_dashboard_panels', array($this, 'register_ultra_card_panel_classes'));
        
        // Try more specific registration hooks
        add_action('drts_core_main_router_done', array($this, 'register_panels_after_router'));
        add_action('drts_platform_wordpress_init', array($this, 'register_panels_after_init'));
        
        // Try additional admin-specific hooks for panel registration
        add_action('admin_init', array($this, 'register_admin_panels'));
        add_action('drts_admin_init', array($this, 'register_admin_panels'));
        
        // Try to hook into Directories Pro initialization
        add_action('plugins_loaded', array($this, 'late_panel_registration'), 20);
        add_action('after_setup_theme', array($this, 'late_panel_registration'));
        
        // Try to hook into specific Directories Pro admin pages
        add_action('load-directories_page_directories-settings', array($this, 'register_admin_panels'));
        add_action('admin_menu', array($this, 'check_directories_admin_pages'), 20);
        
        // Direct panel render actions (for older versions)
        add_action('drts_dashboard_panel_custom_ultra_card_favorites', array($this, 'render_favorites_panel'));
        add_action('drts_dashboard_panel_custom_ultra_card_colors', array($this, 'render_colors_panel'));
        add_action('drts_dashboard_panel_custom_ultra_card_reviews', array($this, 'render_reviews_panel'));
        
        // Add CSS for Ultra Card panels
        add_action('wp_enqueue_scripts', array($this, 'enqueue_dashboard_styles'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Debug hook to see what's available
        add_action('init', array($this, 'debug_directories_pro'), 20);
        
        // Force panel registration on init (for debugging)
        add_action('init', array($this, 'force_panel_registration'), 25);
    }
    
    /**
     * Debug Directories Pro integration
     */
    public function debug_directories_pro() {
        if (current_user_can('manage_options') && isset($_GET['debug_ultra_card'])) {
            echo '<div style="background: #fff; padding: 20px; margin: 20px; border: 1px solid #ccc;">';
            echo '<h3>Ultra Card Integration Debug Info</h3>';
            
            // Check multiple ways Directories Pro might be active
            $directories_classes = array(
                'SabaiApps_Directories',
                'SabaiApps\\Directories\\Application',
                'Directories_Application',
                'DRTS_Application'
            );
            
            $directories_active = false;
            foreach ($directories_classes as $class) {
                if (class_exists($class)) {
                    echo '<p>✅ Directories Pro is active (found class: ' . $class . ')</p>';
                    $directories_active = true;
                    break;
                }
            }
            
            if (!$directories_active) {
                echo '<p>❌ Directories Pro is not active</p>';
            }
            
            // Check available hooks
            global $wp_filter;
            echo '<h4>Available Dashboard Hooks:</h4><ul>';
            $dashboard_hooks = array();
            foreach ($wp_filter as $hook => $filters) {
                if (strpos($hook, 'dashboard') !== false) {
                    $dashboard_hooks[] = $hook;
                }
            }
            
            if (empty($dashboard_hooks)) {
                echo '<li>No dashboard hooks found</li>';
            } else {
                foreach ($dashboard_hooks as $hook) {
                    echo '<li>' . $hook . '</li>';
                }
            }
            echo '</ul>';
            
            // Test our custom panel filters
            echo '<h4>Custom Panel Filter Tests:</h4>';
            $test_info = apply_filters('dashboard_panel_custom_info', array(), 'ultra_card_favorites');
            echo '<p>dashboard_panel_custom_info result: ' . (empty($test_info) ? 'Empty' : 'Has data: ' . json_encode($test_info)) . '</p>';
            
            // Check Ultra Card data
            echo '<h4>Ultra Card Data Status:</h4>';
            $user_id = get_current_user_id();
            if ($user_id) {
                $favorites_count = wp_count_posts('ultra_favorite');
                $colors_count = wp_count_posts('ultra_color');
                $reviews_count = wp_count_posts('ultra_review');
                
                echo '<p>Total Favorites: ' . ($favorites_count->publish ?? 0) . '</p>';
                echo '<p>Total Colors: ' . ($colors_count->publish ?? 0) . '</p>';
                echo '<p>Total Reviews: ' . ($reviews_count->publish ?? 0) . '</p>';
            } else {
                echo '<p>Not logged in - cannot check user data</p>';
            }
            
            // Check if panel files exist
            echo '<h4>Panel Files Status:</h4>';
            $panel_files = [
                'UltraCardFavoritesPanel.php',
                'UltraCardColorsPanel.php', 
                'UltraCardReviewsPanel.php'
            ];
            
            $directories_panel_path = WP_PLUGIN_DIR . '/directories-frontend/lib/components/Dashboard/Panel/';
            foreach ($panel_files as $file) {
                $file_path = $directories_panel_path . $file;
                $exists = file_exists($file_path);
                echo '<p>' . $file . ': ' . ($exists ? '✅ Found' : '❌ Missing') . '</p>';
                if ($exists) {
                    echo '<p style="margin-left: 20px; font-size: 11px;">Path: ' . $file_path . '</p>';
                }
            }
            
            // Try to get Directories Pro panel list
            echo '<h4>Directories Pro Panel Registry:</h4>';
            try {
                // Check if panel classes can be loaded
                $panel_classes = [
                    'UltraCardFavoritesPanel' => 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardFavoritesPanel',
                    'UltraCardColorsPanel' => 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardColorsPanel',
                    'UltraCardReviewsPanel' => 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardReviewsPanel'
                ];
                
                foreach ($panel_classes as $name => $class) {
                    if (class_exists($class)) {
                        echo '<p>✅ ' . $name . ' class loaded</p>';
                    } else {
                        echo '<p>❌ ' . $name . ' class not loaded</p>';
                    }
                }
                
                // Check if we can access Directories Pro functions
                if (function_exists('drts')) {
                    echo '<p>✅ drts() function available</p>';
                    $drts = drts();
                    if ($drts && method_exists($drts, 'getComponent')) {
                        $dashboard = $drts->getComponent('Dashboard');
                        if ($dashboard) {
                            echo '<p>✅ Dashboard component accessible via drts()</p>';
                        }
                    }
                } else {
                    echo '<p>❌ drts() function not available</p>';
                }
                
            } catch (Exception $e) {
                echo '<p>❌ Error accessing Directories Pro: ' . $e->getMessage() . '</p>';
            } catch (Error $e) {
                echo '<p>❌ Fatal error accessing Directories Pro: ' . $e->getMessage() . '</p>';
            }
            
            // Show shortcode alternative
            echo '<h4>Alternative Usage:</h4>';
            echo '<p>If panels don\'t appear in settings, you can use the shortcode:</p>';
            echo '<p><code>[ultra_card_dashboard]</code> - Shows all panels</p>';
            echo '<p><code>[ultra_card_dashboard show="favorites"]</code> - Shows only favorites</p>';
            echo '<p><code>[ultra_card_dashboard show="colors"]</code> - Shows only colors</p>';
            echo '<p><code>[ultra_card_dashboard show="reviews"]</code> - Shows only reviews</p>';
            
            echo '</div>';
        }
    }
    
    /**
     * Force panel registration for debugging
     */
    public function force_panel_registration() {
        // Force trigger our custom panel filters to see if they're working
        if (current_user_can('manage_options') && isset($_GET['debug_ultra_card'])) {
            // Test our filters
            $test_favorites = apply_filters('dashboard_panel_custom_info', array(), 'ultra_card_favorites');
            $test_colors = apply_filters('dashboard_panel_custom_info', array(), 'ultra_card_colors');
            $test_reviews = apply_filters('dashboard_panel_custom_info', array(), 'ultra_card_reviews');
            
            error_log('Ultra Card Debug - Favorites filter result: ' . print_r($test_favorites, true));
            error_log('Ultra Card Debug - Colors filter result: ' . print_r($test_colors, true));
            error_log('Ultra Card Debug - Reviews filter result: ' . print_r($test_reviews, true));
        }
    }
    
    /**
     * Register panels specifically in admin context
     */
    public function register_admin_panels() {
        if (!is_admin()) {
            return;
        }
        
        // Try to register panels using various Directories Pro admin hooks
        $panels = array(
            'custom_ultra_card_favorites' => array(
                'label' => 'Ultra Card Favorites',
                'icon' => 'fas fa-heart',
                'weight' => 15,
            ),
            'custom_ultra_card_colors' => array(
                'label' => 'Ultra Card Colors', 
                'icon' => 'fas fa-palette',
                'weight' => 16,
            ),
            'custom_ultra_card_reviews' => array(
                'label' => 'Ultra Card Reviews',
                'icon' => 'fas fa-star',
                'weight' => 17,
            ),
        );
        
        // Try to register each panel using different approaches
        foreach ($panels as $panel_name => $panel_info) {
            // Method 1: Direct filter application
            apply_filters('dashboard_panel_custom_info', $panel_info, str_replace('custom_', '', $panel_name));
            apply_filters('drts_dashboard_panel_custom_info', $panel_info, str_replace('custom_', '', $panel_name));
            
            // Method 2: Try to add to global panel registry if it exists
            if (function_exists('drts_add_dashboard_panel')) {
                drts_add_dashboard_panel($panel_name, $panel_info);
            }
        }
        
        // Debug log for admin context
        if (WP_DEBUG && current_user_can('manage_options')) {
            error_log('Ultra Card: Admin panel registration attempted for ' . count($panels) . ' panels');
        }
    }
    
    /**
     * Late panel registration after plugins are loaded
     */
    public function late_panel_registration() {
        // Only run this once
        static $registered = false;
        if ($registered) {
            return;
        }
        $registered = true;
        
        // Check if Directories Pro is fully loaded
        if (!class_exists('SabaiApps\\Directories\\Application')) {
            return;
        }
        
        // Try to register panels after Directories Pro is fully initialized
        $this->register_admin_panels();
        
        // Try to hook into any late-loading Directories Pro hooks
        add_filter('drts_dashboard_panels_alter', array($this, 'alter_dashboard_panels'));
        add_filter('directories_dashboard_panels_alter', array($this, 'alter_dashboard_panels'));
        
        if (WP_DEBUG) {
            error_log('Ultra Card: Late panel registration completed');
        }
    }
    
    /**
     * Check for Directories Pro admin pages and register panels
     */
    public function check_directories_admin_pages() {
        global $pagenow;
        
        // Check if we're on a Directories Pro admin page
        if ($pagenow === 'admin.php' && isset($_GET['page']) && strpos($_GET['page'], 'directories') !== false) {
            $this->register_admin_panels();
            
            if (WP_DEBUG) {
                error_log('Ultra Card: Detected Directories Pro admin page, registering panels');
            }
        }
    }
    
    /**
     * Alter dashboard panels (hook into panel modification)
     */
    public function alter_dashboard_panels($panels) {
        $ultra_panels = array(
            'custom_ultra_card_favorites' => array(
                'label' => 'Ultra Card Favorites',
                'icon' => 'fas fa-heart',
                'weight' => 15,
            ),
            'custom_ultra_card_colors' => array(
                'label' => 'Ultra Card Colors', 
                'icon' => 'fas fa-palette',
                'weight' => 16,
            ),
            'custom_ultra_card_reviews' => array(
                'label' => 'Ultra Card Reviews',
                'icon' => 'fas fa-star',
                'weight' => 17,
            ),
        );
        
        // Merge our panels with existing panels
        if (is_array($panels)) {
            $panels = array_merge($panels, $ultra_panels);
        } else {
            $panels = $ultra_panels;
        }
        
        if (WP_DEBUG) {
            error_log('Ultra Card: Dashboard panels altered, added ' . count($ultra_panels) . ' panels');
        }
        
        return $panels;
    }
    
    /**
     * Register Ultra Card panel classes with Directories Pro
     */
    public function register_ultra_card_panel_classes($panels) {
        // Add our panel classes to the panels array
        $panels['ultra_card_favorites'] = 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardFavoritesPanel';
        $panels['ultra_card_colors'] = 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardColorsPanel';
        $panels['ultra_card_reviews'] = 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardReviewsPanel';
        
        if (WP_DEBUG) {
            error_log('Ultra Card: Panel classes registered with Directories Pro - ' . count($panels) . ' total panels');
        }
        
        return $panels;
    }
    
    /**
     * Register panels after router is done
     */
    public function register_panels_after_router() {
        $this->force_register_panels();
    }
    
    /**
     * Register panels after WordPress init
     */
    public function register_panels_after_init() {
        $this->force_register_panels();
    }
    
    /**
     * Force register panels using direct method
     */
    private function force_register_panels() {
        // Try to register panels directly with Directories Pro using drts() function
        try {
            if (function_exists('drts')) {
                $drts = drts();
                if ($drts && method_exists($drts, 'getComponent')) {
                    $dashboard_component = $drts->getComponent('Dashboard');
                    if ($dashboard_component && method_exists($dashboard_component, 'registerPanel')) {
                        // Register each panel directly
                        $dashboard_component->registerPanel('ultra_card_favorites', 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardFavoritesPanel');
                        $dashboard_component->registerPanel('ultra_card_colors', 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardColorsPanel');
                        $dashboard_component->registerPanel('ultra_card_reviews', 'SabaiApps\\Directories\\Component\\Dashboard\\Panel\\UltraCardReviewsPanel');
                        
                        if (WP_DEBUG) {
                            error_log('Ultra Card: Panels registered directly with Dashboard component via drts()');
                        }
                    }
                }
            }
        } catch (Exception $e) {
            if (WP_DEBUG) {
                error_log('Ultra Card: Direct registration failed - ' . $e->getMessage());
            }
        } catch (Error $e) {
            if (WP_DEBUG) {
                error_log('Ultra Card: Direct registration fatal error - ' . $e->getMessage());
            }
        }
    }
    
    /**
     * Enqueue admin scripts for panel injection
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on Directories Pro settings pages
        if (strpos($hook, 'directories') === false) {
            return;
        }
        
        // Add JavaScript to inject panels into the admin interface
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Wait for the dashboard panels section to load
            function injectUltraCardPanels() {
                var panelsContainer = $('.drts-dashboard-panels, .directories-dashboard-panels, [data-form-field-name*="dashboard_panels"]');
                
                if (panelsContainer.length === 0) {
                    // Try again in 500ms
                    setTimeout(injectUltraCardPanels, 500);
                    return;
                }
                
                // Check if our panels are already there
                if (panelsContainer.find('[data-panel="ultra_card_favorites"], [value*="ultra_card"]').length > 0) {
                    return; // Already injected
                }
                
                // Define our panels
                var ultraPanels = [
                    {
                        name: 'custom_ultra_card_favorites',
                        label: 'Ultra Card Favorites',
                        icon: 'fas fa-heart'
                    },
                    {
                        name: 'custom_ultra_card_colors', 
                        label: 'Ultra Card Colors',
                        icon: 'fas fa-palette'
                    },
                    {
                        name: 'custom_ultra_card_reviews',
                        label: 'Ultra Card Reviews', 
                        icon: 'fas fa-star'
                    }
                ];
                
                // Try different injection methods
                ultraPanels.forEach(function(panel) {
                    // Method 1: Add as checkbox in existing list (multiple formats)
                    var checkboxHtml1 = '<div class="drts-form-field">' +
                        '<label><input type="checkbox" name="dashboard_panels[]" value="' + panel.name + '"> ' +
                        '<i class="' + panel.icon + '"></i> ' + panel.label + '</label></div>';
                    
                    var checkboxHtml2 = '<tr><td><input type="checkbox" name="dashboard_panels[]" value="' + panel.name + '"></td>' +
                        '<td><i class="' + panel.icon + '"></i> ' + panel.label + '</td></tr>';
                    
                    var checkboxHtml3 = '<li><label><input type="checkbox" name="dashboard_panels[]" value="' + panel.name + '"> ' +
                        '<i class="' + panel.icon + '"></i> ' + panel.label + '</label></li>';
                    
                    // Try to find the right container format
                    if (panelsContainer.find('table').length > 0) {
                        panelsContainer.find('tbody, table').append(checkboxHtml2);
                    } else if (panelsContainer.find('ul').length > 0) {
                        panelsContainer.find('ul').append(checkboxHtml3);
                    } else {
                        panelsContainer.append(checkboxHtml1);
                    }
                    
                    // Method 2: Add to select dropdown if exists
                    var selectElement = panelsContainer.find('select[name*="dashboard_panels"], select[name*="panels"]');
                    if (selectElement.length > 0) {
                        selectElement.append('<option value="' + panel.name + '">' + panel.label + '</option>');
                    }
                    
                    // Method 3: Add to any checkbox list
                    var checkboxList = $('input[type="checkbox"][name*="panel"]').closest('div, tr, li').parent();
                    if (checkboxList.length > 0 && !checkboxList.find('[value="' + panel.name + '"]').length) {
                        var existingFormat = checkboxList.children().first();
                        if (existingFormat.is('tr')) {
                            checkboxList.append(checkboxHtml2);
                        } else if (existingFormat.is('li')) {
                            checkboxList.append(checkboxHtml3);
                        } else {
                            checkboxList.append(checkboxHtml1);
                        }
                    }
                });
                
                console.log('Ultra Card: Injected ' + ultraPanels.length + ' panels into admin interface');
            }
            
            // Start injection attempts
            injectUltraCardPanels();
            
            // Also try when AJAX content loads
            $(document).ajaxComplete(function() {
                setTimeout(injectUltraCardPanels, 100);
            });
        });
        </script>
        <?php
    }
    
    /**
     * Add Ultra Card panels to dashboard
     */
    public function add_ultra_card_panels($panels) {
        $panels['custom_ultra_card_favorites'] = array(
            'label' => __('Ultra Card Favorites', 'ultra-card-integration'),
            'icon' => 'fas fa-heart',
            'weight' => 15,
        );
        
        $panels['custom_ultra_card_colors'] = array(
            'label' => __('Ultra Card Colors', 'ultra-card-integration'),
            'icon' => 'fas fa-palette',
            'weight' => 16,
        );
        
        $panels['custom_ultra_card_reviews'] = array(
            'label' => __('Ultra Card Reviews', 'ultra-card-integration'),
            'icon' => 'fas fa-star',
            'weight' => 17,
        );
        
        return $panels;
    }
    
    /**
     * Enqueue dashboard styles
     */
    public function enqueue_dashboard_styles() {
        wp_enqueue_script('jquery');
    }
    
    /**
     * Register custom panels using Directories Pro CustomPanel approach
     */
    public function register_custom_panels($info, $custom_name) {
        $ultra_panels = array(
            'ultra_card_favorites' => array(
                'label' => 'Ultra Card Favorites',
                'icon' => 'fas fa-heart',
                'weight' => 15,
            ),
            'ultra_card_colors' => array(
                'label' => 'Ultra Card Colors', 
                'icon' => 'fas fa-palette',
                'weight' => 16,
            ),
            'ultra_card_reviews' => array(
                'label' => 'Ultra Card Reviews',
                'icon' => 'fas fa-star',
                'weight' => 17,
            ),
        );
        
        if (isset($ultra_panels[$custom_name])) {
            return $ultra_panels[$custom_name];
        }
        
        return $info;
    }
    
    /**
     * Render custom panel content
     */
    public function render_custom_panel_content($content, $custom_name, $link = '', $settings = array()) {
        // Handle both 3 and 4 parameter calls
        if (is_array($link)) {
            $settings = $link;
            $link = '';
        }
        
        switch ($custom_name) {
            case 'ultra_card_favorites':
                ob_start();
                $this->render_favorites_panel();
                return ob_get_clean();
                
            case 'ultra_card_colors':
                ob_start();
                $this->render_colors_panel();
                return ob_get_clean();
                
            case 'ultra_card_reviews':
                ob_start();
                $this->render_reviews_panel();
                return ob_get_clean();
        }
        
        return $content;
    }
    
    /**
     * Get custom panel links
     */
    public function get_custom_panel_links($links, $custom_name) {
        switch ($custom_name) {
            case 'ultra_card_favorites':
                return array(
                    'view' => array(
                        'title' => __('View Favorites', 'ultra-card-integration'),
                        'icon' => 'fas fa-heart',
                        'weight' => 1,
                    ),
                    'manage' => array(
                        'title' => __('Manage Favorites', 'ultra-card-integration'),
                        'icon' => 'fas fa-cog',
                        'weight' => 2,
                    ),
                );
                
            case 'ultra_card_colors':
                return array(
                    'view' => array(
                        'title' => __('View Colors', 'ultra-card-integration'),
                        'icon' => 'fas fa-palette',
                        'weight' => 1,
                    ),
                    'manage' => array(
                        'title' => __('Manage Colors', 'ultra-card-integration'),
                        'icon' => 'fas fa-cog',
                        'weight' => 2,
                    ),
                );
                
            case 'ultra_card_reviews':
                return array(
                    'view' => array(
                        'title' => __('View Reviews', 'ultra-card-integration'),
                        'icon' => 'fas fa-star',
                        'weight' => 1,
                    ),
                    'manage' => array(
                        'title' => __('Manage Reviews', 'ultra-card-integration'),
                        'icon' => 'fas fa-cog',
                        'weight' => 2,
                    ),
                );
        }
        
        return $links;
    }
    
    /**
     * Get custom panel settings
     */
    public function get_custom_panel_settings($settings, $custom_name, $link = '', $params = array()) {
        // Return default settings for all Ultra Card panels
        return array(
            'items_per_page' => 10,
            'show_count' => true,
        );
    }
    
    /**
     * Render favorites panel
     */
    public function render_favorites_panel() {
        $current_user = wp_get_current_user();
        if (!$current_user->ID) {
            echo '<p>' . __('Please log in to view your favorites.', 'ultra-card-integration') . '</p>';
            return;
        }
        
        // Get user's favorites from Ultra Card cloud sync
        $favorites = $this->get_user_favorites($current_user->ID);
        
        ?>
        <div class="ultra-card-favorites-section">
            <h3><i class="fas fa-heart"></i> <?php _e('Your Ultra Card Favorites', 'ultra-card-integration'); ?></h3>
            
            <?php if (empty($favorites)): ?>
                <div class="no-favorites" style="text-align: center; padding: 40px 20px; color: #666;">
                    <p><i class="fas fa-heart-broken" style="font-size: 48px; margin-bottom: 20px;"></i></p>
                    <p><?php _e('No favorites found.', 'ultra-card-integration'); ?></p>
                    <p><?php _e('Start adding favorites in your Ultra Card to see them here!', 'ultra-card-integration'); ?></p>
                </div>
            <?php else: ?>
                <div class="favorites-list">
                    <?php foreach ($favorites as $favorite): ?>
                        <div class="favorite-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; background: #fff;">
                            <div class="favorite-info">
                                <h4 style="margin: 0 0 5px 0; color: #333;"><?php echo esc_html($favorite['name']); ?></h4>
                                <p style="font-size: 12px; color: #666; margin: 0;">
                                    <span style="margin-right: 15px;"><?php echo esc_html($favorite['type']); ?></span>
                                    <span><?php echo date('M j, Y', strtotime($favorite['created_at'])); ?></span>
                                </p>
                                <?php if (!empty($favorite['description'])): ?>
                                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #555;"><?php echo esc_html($favorite['description']); ?></p>
                                <?php endif; ?>
                            </div>
                            <div class="favorite-actions">
                                <button class="btn btn-sm btn-danger" onclick="deleteUltraFavorite(<?php echo $favorite['id']; ?>)" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                    <i class="fas fa-trash"></i> <?php _e('Delete', 'ultra-card-integration'); ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <p style="text-align: center; color: #666; margin-top: 20px;">
                    <?php printf(__('Showing %d favorites', 'ultra-card-integration'), count($favorites)); ?>
                </p>
            <?php endif; ?>
        </div>
        
        <script>
        function deleteUltraFavorite(favoriteId) {
            if (!confirm('<?php _e('Are you sure you want to delete this favorite?', 'ultra-card-integration'); ?>')) {
                return;
            }
            
            jQuery.post(ajaxurl, {
                action: 'delete_ultra_favorite',
                favorite_id: favoriteId,
                nonce: '<?php echo wp_create_nonce('ultra_card_nonce'); ?>'
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('<?php _e('Error deleting favorite', 'ultra-card-integration'); ?>');
                }
            });
        }
        </script>
        <?php
    }
    
    /**
     * Render colors panel
     */
    public function render_colors_panel() {
        $current_user = wp_get_current_user();
        if (!$current_user->ID) {
            echo '<p>' . __('Please log in to view your colors.', 'ultra-card-integration') . '</p>';
            return;
        }
        
        // Get user's colors from Ultra Card cloud sync
        $colors = $this->get_user_colors($current_user->ID);
        
        ?>
        <div class="ultra-card-colors-section">
            <h3><i class="fas fa-palette"></i> <?php _e('Your Ultra Card Colors', 'ultra-card-integration'); ?></h3>
            
            <?php if (empty($colors)): ?>
                <div class="no-colors" style="text-align: center; padding: 40px 20px; color: #666;">
                    <p><i class="fas fa-palette" style="font-size: 48px; margin-bottom: 20px;"></i></p>
                    <p><?php _e('No custom colors found.', 'ultra-card-integration'); ?></p>
                    <p><?php _e('Create custom colors in your Ultra Card to see them here!', 'ultra-card-integration'); ?></p>
                </div>
            <?php else: ?>
                <div class="colors-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    <?php foreach ($colors as $color): ?>
                        <div class="color-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fff; text-align: center;">
                            <div class="color-preview" style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px; border: 3px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); background-color: <?php echo esc_attr($color['hex_value']); ?>"></div>
                            <div class="color-info">
                                <h4 style="margin: 0 0 5px 0; color: #333;"><?php echo esc_html($color['name']); ?></h4>
                                <p style="font-family: monospace; font-weight: bold; color: #666; margin: 0 0 5px 0;"><?php echo esc_html($color['hex_value']); ?></p>
                                <p style="font-size: 12px; color: #999; margin: 0;"><?php echo date('M j, Y', strtotime($color['created_at'])); ?></p>
                            </div>
                            <div class="color-actions" style="margin-top: 10px;">
                                <button class="btn btn-sm btn-danger" onclick="deleteUltraColor(<?php echo $color['id']; ?>)" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <p style="text-align: center; color: #666; margin-top: 20px;">
                    <?php printf(__('Showing %d colors', 'ultra-card-integration'), count($colors)); ?>
                </p>
            <?php endif; ?>
        </div>
        
        <script>
        function deleteUltraColor(colorId) {
            if (!confirm('<?php _e('Are you sure you want to delete this color?', 'ultra-card-integration'); ?>')) {
                return;
            }
            
            jQuery.post(ajaxurl, {
                action: 'delete_ultra_color',
                color_id: colorId,
                nonce: '<?php echo wp_create_nonce('ultra_card_nonce'); ?>'
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('<?php _e('Error deleting color', 'ultra-card-integration'); ?>');
                }
            });
        }
        </script>
        <?php
    }
    
    /**
     * Render reviews panel
     */
    public function render_reviews_panel() {
        $current_user = wp_get_current_user();
        if (!$current_user->ID) {
            echo '<p>' . __('Please log in to view your reviews.', 'ultra-card-integration') . '</p>';
            return;
        }
        
        // Get user's reviews from Ultra Card cloud sync
        $reviews = $this->get_user_reviews($current_user->ID);
        
        ?>
        <div class="ultra-card-reviews-section">
            <h3><i class="fas fa-star"></i> <?php _e('Your Ultra Card Reviews', 'ultra-card-integration'); ?></h3>
            
            <?php if (empty($reviews)): ?>
                <div class="no-reviews" style="text-align: center; padding: 40px 20px; color: #666;">
                    <p><i class="fas fa-star-half-alt" style="font-size: 48px; margin-bottom: 20px;"></i></p>
                    <p><?php _e('No reviews found.', 'ultra-card-integration'); ?></p>
                    <p><?php _e('Write reviews in your Ultra Card to see them here!', 'ultra-card-integration'); ?></p>
                </div>
            <?php else: ?>
                <div class="reviews-list">
                    <?php foreach ($reviews as $review): ?>
                        <div class="review-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #fff;">
                            <div class="review-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <h4 style="margin: 0; color: #333;"><?php echo esc_html($review['title']); ?></h4>
                                <?php if ($review['rating']): ?>
                                    <div class="review-rating">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <i class="fas fa-star" style="color: <?php echo $i <= $review['rating'] ? '#ffc107' : '#ddd'; ?>;"></i>
                                        <?php endfor; ?>
                                        <span style="margin-left: 8px; font-weight: bold; color: #666;"><?php echo $review['rating']; ?>/5</span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <div class="review-content" style="margin-bottom: 15px;">
                                <p><?php echo esc_html($review['content']); ?></p>
                            </div>
                            <div class="review-meta" style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #666;">
                                <span><?php echo date('M j, Y', strtotime($review['created_at'])); ?></span>
                                <button class="btn btn-sm btn-danger" onclick="deleteUltraReview(<?php echo $review['id']; ?>)" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                    <i class="fas fa-trash"></i> <?php _e('Delete', 'ultra-card-integration'); ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <p style="text-align: center; color: #666; margin-top: 20px;">
                    <?php printf(__('Showing %d reviews', 'ultra-card-integration'), count($reviews)); ?>
                </p>
            <?php endif; ?>
        </div>
        
        <script>
        function deleteUltraReview(reviewId) {
            if (!confirm('<?php _e('Are you sure you want to delete this review?', 'ultra-card-integration'); ?>')) {
                return;
            }
            
            jQuery.post(ajaxurl, {
                action: 'delete_ultra_review',
                review_id: reviewId,
                nonce: '<?php echo wp_create_nonce('ultra_card_nonce'); ?>'
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('<?php _e('Error deleting review', 'ultra-card-integration'); ?>');
                }
            });
        }
        </script>
        <?php
    }
    
    /**
     * Get user favorites
     */
    private function get_user_favorites($user_id) {
        // Get favorites from Ultra Card cloud sync custom post type
        $favorites = get_posts(array(
            'post_type' => 'ultra_favorite',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ));
        
        $formatted_favorites = array();
        foreach ($favorites as $favorite) {
            $meta = get_post_meta($favorite->ID);
            $formatted_favorites[] = array(
                'id' => $favorite->ID,
                'name' => $favorite->post_title,
                'description' => $favorite->post_content,
                'type' => isset($meta['favorite_type'][0]) ? $meta['favorite_type'][0] : 'Unknown',
                'created_at' => $favorite->post_date,
                'data' => isset($meta['favorite_data'][0]) ? json_decode($meta['favorite_data'][0], true) : array(),
            );
        }
        
        return $formatted_favorites;
    }
    
    /**
     * Get user colors
     */
    private function get_user_colors($user_id) {
        $colors = get_posts(array(
            'post_type' => 'ultra_color',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ));
        
        $formatted_colors = array();
        foreach ($colors as $color) {
            $meta = get_post_meta($color->ID);
            $formatted_colors[] = array(
                'id' => $color->ID,
                'name' => $color->post_title,
                'hex_value' => isset($meta['hex_value'][0]) ? $meta['hex_value'][0] : '#000000',
                'created_at' => $color->post_date,
            );
        }
        
        return $formatted_colors;
    }
    
    /**
     * Get user reviews
     */
    private function get_user_reviews($user_id) {
        $reviews = get_posts(array(
            'post_type' => 'ultra_review',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ));
        
        $formatted_reviews = array();
        foreach ($reviews as $review) {
            $meta = get_post_meta($review->ID);
            $formatted_reviews[] = array(
                'id' => $review->ID,
                'title' => $review->post_title,
                'content' => $review->post_content,
                'rating' => isset($meta['rating'][0]) ? intval($meta['rating'][0]) : 0,
                'created_at' => $review->post_date,
            );
        }
        
        return $formatted_reviews;
    }
    
    /**
     * Ultra Card Dashboard shortcode
     */
    public function ultra_card_dashboard_shortcode($atts) {
        $atts = shortcode_atts(array(
            'show' => 'all', // all, favorites, colors, reviews
        ), $atts);
        
        if (!is_user_logged_in()) {
            return '<p>' . __('Please log in to view your Ultra Card dashboard.', 'ultra-card-integration') . '</p>';
        }
        
        ob_start();
        
        switch ($atts['show']) {
            case 'favorites':
                $this->render_favorites_panel();
                break;
            case 'colors':
                $this->render_colors_panel();
                break;
            case 'reviews':
                $this->render_reviews_panel();
                break;
            default:
                ?>
                <div class="ultra-card-dashboard-sections" style="margin-top: 40px;">
                    <h2 style="color: #0073aa; border-bottom: 2px solid #0073aa; padding-bottom: 10px;">
                        🎨 Ultra Card Cloud Sync
                    </h2>
                    
                    <div class="ultra-card-tabs" style="margin: 20px 0; display: flex; gap: 10px; border-bottom: 1px solid #ddd;">
                        <button class="ultra-tab-btn active" onclick="showUltraTab('favorites')" style="background: #0073aa; color: white; border: 1px solid #ddd; padding: 10px 20px; cursor: pointer; border-radius: 5px 5px 0 0;">
                            <i class="fas fa-heart"></i> Favorites
                        </button>
                        <button class="ultra-tab-btn" onclick="showUltraTab('colors')" style="background: #f1f1f1; border: 1px solid #ddd; padding: 10px 20px; cursor: pointer; border-radius: 5px 5px 0 0;">
                            <i class="fas fa-palette"></i> Colors
                        </button>
                        <button class="ultra-tab-btn" onclick="showUltraTab('reviews')" style="background: #f1f1f1; border: 1px solid #ddd; padding: 10px 20px; cursor: pointer; border-radius: 5px 5px 0 0;">
                            <i class="fas fa-star"></i> Reviews
                        </button>
                    </div>
                    
                    <div id="ultra-tab-favorites" class="ultra-tab-content active">
                        <?php $this->render_favorites_panel(); ?>
                    </div>
                    
                    <div id="ultra-tab-colors" class="ultra-tab-content" style="display: none;">
                        <?php $this->render_colors_panel(); ?>
                    </div>
                    
                    <div id="ultra-tab-reviews" class="ultra-tab-content" style="display: none;">
                        <?php $this->render_reviews_panel(); ?>
                    </div>
                </div>
                
                <script>
                function showUltraTab(tabName) {
                    // Hide all tabs
                    document.querySelectorAll('.ultra-tab-content').forEach(function(tab) {
                        tab.style.display = 'none';
                    });
                    document.querySelectorAll('.ultra-tab-btn').forEach(function(btn) {
                        btn.style.background = '#f1f1f1';
                        btn.style.color = '#000';
                    });
                    
                    // Show selected tab
                    document.getElementById('ultra-tab-' + tabName).style.display = 'block';
                    event.target.style.background = '#0073aa';
                    event.target.style.color = 'white';
                }
                </script>
                <?php
                break;
        }
        
        return ob_get_clean();
    }
}

/**
 * Plugin activation hook
 */
register_activation_hook(__FILE__, 'ultra_card_integration_activate');
function ultra_card_integration_activate() {
    // Set plugin version
    update_option('ultra_card_integration_version', ULTRA_CARD_INTEGRATION_VERSION);
    
    // Clear any cached data
    wp_cache_flush();
}

/**
 * Plugin deactivation hook
 */
register_deactivation_hook(__FILE__, 'ultra_card_integration_deactivate');
function ultra_card_integration_deactivate() {
    // Clean up any temporary data if needed
    wp_cache_flush();
}

/**
 * Plugin uninstall hook
 */
register_uninstall_hook(__FILE__, 'ultra_card_integration_uninstall');
function ultra_card_integration_uninstall() {
    // Remove plugin options
    delete_option('ultra_card_integration_version');
    
    // Note: We don't delete Ultra Card data (favorites, colors, reviews) 
    // as users may want to keep their synced data
}

/**
 * Initialize the plugin
 */
add_action('plugins_loaded', 'ultra_card_integration_init');
function ultra_card_integration_init() {
    // Initialize the cloud sync functionality
    new UltraCardCloudSync();
    
    // Initialize the dashboard integration (only if Directories Pro is active)
    if (class_exists('SabaiApps\\Directories\\Application')) {
        // Use a global variable to ensure single instance
        global $ultra_card_dashboard_integration;
        if (!$ultra_card_dashboard_integration) {
            $ultra_card_dashboard_integration = new UltraCardDashboardIntegration();
        }
    } else {
        add_action('admin_notices', 'ultra_card_integration_directories_notice');
    }
}

/**
 * Admin notice for missing Directories Pro (only for dashboard features)
 */
function ultra_card_integration_directories_notice() {
    ?>
    <div class="notice notice-warning">
        <p>
            <strong><?php _e('Ultra Card Integration', 'ultra-card-integration'); ?></strong> - 
            <?php _e('Dashboard panels require Directories Pro to be installed and activated. Cloud sync functionality is still available.', 'ultra-card-integration'); ?>
            <a href="<?php echo admin_url('plugins.php'); ?>"><?php _e('Manage Plugins', 'ultra-card-integration'); ?></a>
        </p>
    </div>
    <?php
}

/**
 * Add plugin action links
 */
add_filter('plugin_action_links_' . ULTRA_CARD_INTEGRATION_PLUGIN_BASENAME, 'ultra_card_integration_action_links');
function ultra_card_integration_action_links($links) {
    $settings_link = '<a href="' . admin_url('admin.php?page=directories-settings#dashboard') . '">' . __('Dashboard Settings', 'ultra-card-integration') . '</a>';
    array_unshift($links, $settings_link);
    
    $debug_link = '<a href="' . admin_url('admin.php?page=directories-settings&debug_ultra_card=1') . '">' . __('Debug', 'ultra-card-integration') . '</a>';
    array_unshift($links, $debug_link);
    
    $api_link = '<a href="' . home_url('/wp-json/ultra-card/v1/') . '" target="_blank">' . __('API', 'ultra-card-integration') . '</a>';
    array_unshift($links, $api_link);
    
    return $links;
}

// AJAX handlers for dashboard actions
add_action('wp_ajax_delete_ultra_favorite', 'handle_delete_ultra_favorite');
add_action('wp_ajax_delete_ultra_color', 'handle_delete_ultra_color');
add_action('wp_ajax_delete_ultra_review', 'handle_delete_ultra_review');

function handle_delete_ultra_favorite() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'ultra_card_nonce')) {
        wp_die('Security check failed');
    }
    
    // Check user permissions
    if (!current_user_can('edit_posts')) {
        wp_die('Insufficient permissions');
    }
    
    $favorite_id = intval($_POST['favorite_id']);
    
    // Verify user owns this favorite
    $favorite = get_post($favorite_id);
    if (!$favorite || $favorite->post_author != get_current_user_id()) {
        wp_send_json_error('Invalid favorite');
    }
    
    // Delete the favorite
    $result = wp_delete_post($favorite_id, true);
    
    if ($result) {
        wp_send_json_success('Favorite deleted');
    } else {
        wp_send_json_error('Failed to delete favorite');
    }
}

function handle_delete_ultra_color() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'ultra_card_nonce')) {
        wp_die('Security check failed');
    }
    
    // Check user permissions
    if (!current_user_can('edit_posts')) {
        wp_die('Insufficient permissions');
    }
    
    $color_id = intval($_POST['color_id']);
    
    // Verify user owns this color
    $color = get_post($color_id);
    if (!$color || $color->post_author != get_current_user_id()) {
        wp_send_json_error('Invalid color');
    }
    
    // Delete the color
    $result = wp_delete_post($color_id, true);
    
    if ($result) {
        wp_send_json_success('Color deleted');
    } else {
        wp_send_json_error('Failed to delete color');
    }
}

function handle_delete_ultra_review() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'ultra_card_nonce')) {
        wp_die('Security check failed');
    }
    
    // Check user permissions
    if (!current_user_can('edit_posts')) {
        wp_die('Insufficient permissions');
    }
    
    $review_id = intval($_POST['review_id']);
    
    // Verify user owns this review
    $review = get_post($review_id);
    if (!$review || $review->post_author != get_current_user_id()) {
        wp_send_json_error('Invalid review');
    }
    
    // Delete the review
    $result = wp_delete_post($review_id, true);
    
    if ($result) {
        wp_send_json_success('Review deleted');
    } else {
        wp_send_json_error('Failed to delete review');
    }
}

// Register shortcode after plugin initialization
add_action('init', function() {
    global $ultra_card_dashboard_integration;
    if ($ultra_card_dashboard_integration) {
        add_shortcode('ultra_card_dashboard', array($ultra_card_dashboard_integration, 'ultra_card_dashboard_shortcode'));
    }
}, 20);
