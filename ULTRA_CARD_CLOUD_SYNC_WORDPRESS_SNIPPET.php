<?php
/**
 * Ultra Card Cloud Sync WordPress Integration
 * 
 * This snippet adds cloud sync functionality to your WordPress site for Ultra Card users.
 * It creates custom post types and REST API endpoints for syncing favorites, colors, and reviews.
 * 
 * REQUIREMENTS:
 * - JWT Authentication for WP REST API plugin (already installed)
 * - WordPress 5.0+
 * - PHP 7.4+
 * 
 * INSTALLATION:
 * 1. Add this code to your theme's functions.php file
 * 2. OR create a custom plugin with this code
 * 3. Activate and test the endpoints
 * 
 * ENDPOINTS CREATED:
 * - GET/POST /wp-json/ultra-card/v1/favorites
 * - GET/POST /wp-json/ultra-card/v1/colors  
 * - GET/POST /wp-json/ultra-card/v1/reviews
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class UltraCardCloudSync {
    
    private $version = '1.0.0';
    private $namespace = 'ultra-card/v1';
    
    public function __construct() {
        add_action('init', array($this, 'create_post_types'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Add CORS headers for cross-origin requests
        add_action('rest_api_init', array($this, 'add_cors_headers'));
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
                'add_new' => 'Add Favorite',
                'add_new_item' => 'Add New Favorite',
                'edit_item' => 'Edit Favorite',
                'new_item' => 'New Favorite',
                'view_item' => 'View Favorite',
                'search_items' => 'Search Favorites',
                'not_found' => 'No favorites found',
                'not_found_in_trash' => 'No favorites found in trash'
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
                'add_new' => 'Add Color',
                'add_new_item' => 'Add New Color',
                'edit_item' => 'Edit Color',
                'new_item' => 'New Color',
                'view_item' => 'View Color',
                'search_items' => 'Search Colors',
                'not_found' => 'No colors found',
                'not_found_in_trash' => 'No colors found in trash'
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
                'add_new' => 'Add Review',
                'add_new_item' => 'Add New Review',
                'edit_item' => 'Edit Review',
                'new_item' => 'New Review',
                'view_item' => 'View Review',
                'search_items' => 'Search Reviews',
                'not_found' => 'No reviews found',
                'not_found_in_trash' => 'No reviews found in trash'
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
        register_rest_route($this->namespace, '/favorites', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_favorites'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_favorite'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'name' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'description' => array(
                        'required' => false,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'row_data' => array(
                        'required' => true,
                        'type' => 'string',
                        'validate_callback' => array($this, 'validate_json'),
                    ),
                    'tags' => array(
                        'required' => false,
                        'type' => 'array',
                        'items' => array('type' => 'string'),
                    ),
                ),
            ),
        ));
        
        register_rest_route($this->namespace, '/favorites/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_favorite'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_favorite'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_favorite'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
        ));
        
        // Colors endpoints
        register_rest_route($this->namespace, '/colors', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_colors'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_color'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'name' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'color' => array(
                        'required' => true,
                        'type' => 'string',
                        'validate_callback' => array($this, 'validate_color'),
                    ),
                    'order' => array(
                        'required' => false,
                        'type' => 'integer',
                        'default' => 0,
                    ),
                ),
            ),
        ));
        
        register_rest_route($this->namespace, '/colors/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_color'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_color'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_color'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
        ));
        
        // Reviews endpoints
        register_rest_route($this->namespace, '/reviews', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_reviews'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_review'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'preset_id' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'rating' => array(
                        'required' => true,
                        'type' => 'number',
                        'minimum' => 1,
                        'maximum' => 5,
                    ),
                    'comment' => array(
                        'required' => false,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                ),
            ),
        ));
        
        register_rest_route($this->namespace, '/reviews/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_review'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_review'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_review'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
        ));
        
        // Sync status endpoint
        register_rest_route($this->namespace, '/sync-status', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'get_sync_status'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
    }
    
    /**
     * Add CORS headers for cross-origin requests
     */
    public function add_cors_headers() {
        add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
            $server->send_header('Access-Control-Allow-Origin', '*');
            $server->send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $server->send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-WP-Nonce');
            $server->send_header('Access-Control-Allow-Credentials', 'true');
            
            return $served;
        }, 10, 4);
    }
    
    /**
     * Check if user has permission to access endpoints
     */
    public function check_user_permission($request) {
        // Check if user is authenticated via JWT
        $user = wp_get_current_user();
        
        if (!$user || $user->ID === 0) {
            return new WP_Error(
                'rest_forbidden',
                'You must be logged in to access Ultra Card cloud sync.',
                array('status' => 401)
            );
        }
        
        return true;
    }
    
    // FAVORITES ENDPOINTS
    
    /**
     * Get user's favorites
     */
    public function get_favorites($request) {
        $user_id = get_current_user_id();
        
        $posts = get_posts(array(
            'post_type' => 'ultra_favorite',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'date',
            'order' => 'DESC',
        ));
        
        $favorites = array();
        foreach ($posts as $post) {
            $favorites[] = $this->format_favorite($post);
        }
        
        return rest_ensure_response($favorites);
    }
    
    /**
     * Create a new favorite
     */
    public function create_favorite($request) {
        $user_id = get_current_user_id();
        $params = $request->get_params();
        
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_favorite',
            'post_title' => $params['name'],
            'post_content' => $params['description'] ?? '',
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_Error(
                'create_failed',
                'Failed to create favorite',
                array('status' => 500)
            );
        }
        
        // Save metadata
        update_post_meta($post_id, 'row_data', $params['row_data']);
        update_post_meta($post_id, 'tags', $params['tags'] ?? array());
        update_post_meta($post_id, 'created', current_time('mysql'));
        update_post_meta($post_id, 'updated', current_time('mysql'));
        
        $post = get_post($post_id);
        return rest_ensure_response($this->format_favorite($post));
    }
    
    /**
     * Get a single favorite
     */
    public function get_favorite($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_favorite' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Favorite not found',
                array('status' => 404)
            );
        }
        
        return rest_ensure_response($this->format_favorite($post));
    }
    
    /**
     * Update a favorite
     */
    public function update_favorite($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        $params = $request->get_params();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_favorite' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Favorite not found',
                array('status' => 404)
            );
        }
        
        $updated = wp_update_post(array(
            'ID' => $id,
            'post_title' => $params['name'] ?? $post->post_title,
            'post_content' => $params['description'] ?? $post->post_content,
        ));
        
        if (is_wp_error($updated)) {
            return new WP_Error(
                'update_failed',
                'Failed to update favorite',
                array('status' => 500)
            );
        }
        
        // Update metadata
        if (isset($params['row_data'])) {
            update_post_meta($id, 'row_data', $params['row_data']);
        }
        if (isset($params['tags'])) {
            update_post_meta($id, 'tags', $params['tags']);
        }
        update_post_meta($id, 'updated', current_time('mysql'));
        
        $post = get_post($id);
        return rest_ensure_response($this->format_favorite($post));
    }
    
    /**
     * Delete a favorite
     */
    public function delete_favorite($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_favorite' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Favorite not found',
                array('status' => 404)
            );
        }
        
        $deleted = wp_delete_post($id, true);
        
        if (!$deleted) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete favorite',
                array('status' => 500)
            );
        }
        
        return rest_ensure_response(array('deleted' => true));
    }
    
    // COLORS ENDPOINTS
    
    /**
     * Get user's colors
     */
    public function get_colors($request) {
        $user_id = get_current_user_id();
        
        $posts = get_posts(array(
            'post_type' => 'ultra_color',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'meta_key' => 'order',
            'orderby' => 'meta_value_num',
            'order' => 'ASC',
        ));
        
        $colors = array();
        foreach ($posts as $post) {
            $colors[] = $this->format_color($post);
        }
        
        return rest_ensure_response($colors);
    }
    
    /**
     * Create a new color
     */
    public function create_color($request) {
        $user_id = get_current_user_id();
        $params = $request->get_params();
        
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_color',
            'post_title' => $params['name'],
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_Error(
                'create_failed',
                'Failed to create color',
                array('status' => 500)
            );
        }
        
        // Save metadata
        update_post_meta($post_id, 'color', $params['color']);
        update_post_meta($post_id, 'order', $params['order'] ?? 0);
        update_post_meta($post_id, 'created', current_time('mysql'));
        update_post_meta($post_id, 'updated', current_time('mysql'));
        
        $post = get_post($post_id);
        return rest_ensure_response($this->format_color($post));
    }
    
    /**
     * Get a single color
     */
    public function get_color($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_color' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Color not found',
                array('status' => 404)
            );
        }
        
        return rest_ensure_response($this->format_color($post));
    }
    
    /**
     * Update a color
     */
    public function update_color($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        $params = $request->get_params();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_color' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Color not found',
                array('status' => 404)
            );
        }
        
        $updated = wp_update_post(array(
            'ID' => $id,
            'post_title' => $params['name'] ?? $post->post_title,
        ));
        
        if (is_wp_error($updated)) {
            return new WP_Error(
                'update_failed',
                'Failed to update color',
                array('status' => 500)
            );
        }
        
        // Update metadata
        if (isset($params['color'])) {
            update_post_meta($id, 'color', $params['color']);
        }
        if (isset($params['order'])) {
            update_post_meta($id, 'order', $params['order']);
        }
        update_post_meta($id, 'updated', current_time('mysql'));
        
        $post = get_post($id);
        return rest_ensure_response($this->format_color($post));
    }
    
    /**
     * Delete a color
     */
    public function delete_color($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_color' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Color not found',
                array('status' => 404)
            );
        }
        
        $deleted = wp_delete_post($id, true);
        
        if (!$deleted) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete color',
                array('status' => 500)
            );
        }
        
        return rest_ensure_response(array('deleted' => true));
    }
    
    // REVIEWS ENDPOINTS
    
    /**
     * Get user's reviews
     */
    public function get_reviews($request) {
        $user_id = get_current_user_id();
        
        $posts = get_posts(array(
            'post_type' => 'ultra_review',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'date',
            'order' => 'DESC',
        ));
        
        $reviews = array();
        foreach ($posts as $post) {
            $reviews[] = $this->format_review($post);
        }
        
        return rest_ensure_response($reviews);
    }
    
    /**
     * Create a new review
     */
    public function create_review($request) {
        $user_id = get_current_user_id();
        $params = $request->get_params();
        
        // Check if user already reviewed this preset
        $existing = get_posts(array(
            'post_type' => 'ultra_review',
            'author' => $user_id,
            'meta_query' => array(
                array(
                    'key' => 'preset_id',
                    'value' => $params['preset_id'],
                    'compare' => '='
                )
            ),
            'posts_per_page' => 1,
        ));
        
        if (!empty($existing)) {
            return new WP_Error(
                'already_reviewed',
                'You have already reviewed this preset',
                array('status' => 409)
            );
        }
        
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_review',
            'post_title' => 'Review for ' . $params['preset_id'],
            'post_content' => $params['comment'] ?? '',
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_Error(
                'create_failed',
                'Failed to create review',
                array('status' => 500)
            );
        }
        
        // Save metadata
        update_post_meta($post_id, 'preset_id', $params['preset_id']);
        update_post_meta($post_id, 'rating', $params['rating']);
        update_post_meta($post_id, 'created', current_time('mysql'));
        update_post_meta($post_id, 'updated', current_time('mysql'));
        
        $post = get_post($post_id);
        return rest_ensure_response($this->format_review($post));
    }
    
    /**
     * Get a single review
     */
    public function get_review($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_review' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Review not found',
                array('status' => 404)
            );
        }
        
        return rest_ensure_response($this->format_review($post));
    }
    
    /**
     * Update a review
     */
    public function update_review($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        $params = $request->get_params();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_review' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Review not found',
                array('status' => 404)
            );
        }
        
        $updated = wp_update_post(array(
            'ID' => $id,
            'post_content' => $params['comment'] ?? $post->post_content,
        ));
        
        if (is_wp_error($updated)) {
            return new WP_Error(
                'update_failed',
                'Failed to update review',
                array('status' => 500)
            );
        }
        
        // Update metadata
        if (isset($params['rating'])) {
            update_post_meta($id, 'rating', $params['rating']);
        }
        update_post_meta($id, 'updated', current_time('mysql'));
        
        $post = get_post($id);
        return rest_ensure_response($this->format_review($post));
    }
    
    /**
     * Delete a review
     */
    public function delete_review($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'ultra_review' || $post->post_author != $user_id) {
            return new WP_Error(
                'not_found',
                'Review not found',
                array('status' => 404)
            );
        }
        
        $deleted = wp_delete_post($id, true);
        
        if (!$deleted) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete review',
                array('status' => 500)
            );
        }
        
        return rest_ensure_response(array('deleted' => true));
    }
    
    /**
     * Get sync status for user
     */
    public function get_sync_status($request) {
        $user_id = get_current_user_id();
        
        $favorites_count = wp_count_posts('ultra_favorite')->publish ?? 0;
        $colors_count = wp_count_posts('ultra_color')->publish ?? 0;
        $reviews_count = wp_count_posts('ultra_review')->publish ?? 0;
        
        return rest_ensure_response(array(
            'user_id' => $user_id,
            'favorites_count' => (int) $favorites_count,
            'colors_count' => (int) $colors_count,
            'reviews_count' => (int) $reviews_count,
            'last_activity' => get_user_meta($user_id, 'ultra_card_last_sync', true) ?: null,
            'server_time' => current_time('mysql'),
        ));
    }
    
    // HELPER METHODS
    
    /**
     * Format favorite for API response
     */
    private function format_favorite($post) {
        return array(
            'id' => $post->ID,
            'name' => $post->post_title,
            'description' => $post->post_content,
            'row_data' => get_post_meta($post->ID, 'row_data', true),
            'tags' => get_post_meta($post->ID, 'tags', true) ?: array(),
            'created' => get_post_meta($post->ID, 'created', true) ?: $post->post_date,
            'updated' => get_post_meta($post->ID, 'updated', true) ?: $post->post_modified,
            'user_id' => (int) $post->post_author,
        );
    }
    
    /**
     * Format color for API response
     */
    private function format_color($post) {
        return array(
            'id' => $post->ID,
            'name' => $post->post_title,
            'color' => get_post_meta($post->ID, 'color', true),
            'order' => (int) get_post_meta($post->ID, 'order', true),
            'created' => get_post_meta($post->ID, 'created', true) ?: $post->post_date,
            'updated' => get_post_meta($post->ID, 'updated', true) ?: $post->post_modified,
            'user_id' => (int) $post->post_author,
        );
    }
    
    /**
     * Format review for API response
     */
    private function format_review($post) {
        return array(
            'id' => $post->ID,
            'preset_id' => get_post_meta($post->ID, 'preset_id', true),
            'rating' => (float) get_post_meta($post->ID, 'rating', true),
            'comment' => $post->post_content,
            'created' => get_post_meta($post->ID, 'created', true) ?: $post->post_date,
            'updated' => get_post_meta($post->ID, 'updated', true) ?: $post->post_modified,
            'user_id' => (int) $post->post_author,
        );
    }
    
    /**
     * Validate JSON data
     */
    public function validate_json($value, $request, $param) {
        $decoded = json_decode($value, true);
        return $decoded !== null && json_last_error() === JSON_ERROR_NONE;
    }
    
    /**
     * Validate color format
     */
    public function validate_color($value, $request, $param) {
        // Accept hex colors, rgb(), rgba(), hsl(), hsla(), and CSS color names
        return preg_match('/^(#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|\w+)/', strtolower($value));
    }
    
    /**
     * Enqueue scripts (if needed for frontend)
     */
    public function enqueue_scripts() {
        // Add any frontend scripts here if needed
    }
}

// Initialize the Ultra Card Cloud Sync
new UltraCardCloudSync();

/**
 * TESTING ENDPOINTS
 * 
 * You can test these endpoints using curl or a REST client:
 * 
 * 1. Get JWT token:
 * curl -X POST https://yoursite.com/wp-json/jwt-auth/v1/token \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"your_username","password":"your_password"}'
 * 
 * 2. Test favorites endpoint:
 * curl -X GET https://yoursite.com/wp-json/ultra-card/v1/favorites \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 * 
 * 3. Create a favorite:
 * curl -X POST https://yoursite.com/wp-json/ultra-card/v1/favorites \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Test Favorite","description":"Test description","row_data":"{\"modules\":[]}","tags":["test"]}'
 * 
 * Replace YOUR_JWT_TOKEN with the actual token from step 1.
 */
?>
