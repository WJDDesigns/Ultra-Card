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
        add_action('init', array($this, 'create_custom_roles'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('rest_api_init', array($this, 'add_cors_support'));
        add_action('init', array($this, 'schedule_backup_pruning'));
        add_action('ultra_card_prune_backups', array($this, 'prune_old_backups'));
        
        // WooCommerce Subscriptions Integration
        add_action('woocommerce_subscription_status_active', array($this, 'grant_pro_access'));
        add_action('woocommerce_subscription_status_on-hold', array($this, 'revoke_pro_access'));
        add_action('woocommerce_subscription_status_cancelled', array($this, 'revoke_pro_access'));
        add_action('woocommerce_subscription_status_expired', array($this, 'revoke_pro_access'));
        add_action('woocommerce_subscription_status_pending-cancel', array($this, 'revoke_pro_access'));
    }
    
    /**
     * Create custom WordPress roles for Ultra Card subscriptions
     */
    public function create_custom_roles() {
        // Check if roles already exist
        if (get_role('ultra_card_free')) {
            return; // Roles already created
        }
        
        // Get subscriber capabilities as base
        $subscriber = get_role('subscriber');
        $base_caps = $subscriber ? $subscriber->capabilities : array('read' => true);
        
        // Create Ultra Card Free role
        add_role(
            'ultra_card_free',
            __('Ultra Card Free', 'ultra-card'),
            array_merge($base_caps, array(
                'use_ultra_card' => true,
                'ultra_card_auto_backups' => true,
            ))
        );
        
        // Create Ultra Card Pro role
        add_role(
            'ultra_card_pro',
            __('Ultra Card Pro', 'ultra-card'),
            array_merge($base_caps, array(
                'use_ultra_card' => true,
                'ultra_card_auto_backups' => true,
                'ultra_card_snapshots' => true,
                'ultra_card_extended_features' => true,
            ))
        );
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Custom roles created successfully');
        }
    }
    
    /**
     * Schedule daily backup pruning cron job
     */
    public function schedule_backup_pruning() {
        if (!wp_next_scheduled('ultra_card_prune_backups')) {
            wp_schedule_event(time(), 'daily', 'ultra_card_prune_backups');
        }
    }
    
    // ====================
    // WOOCOMMERCE SUBSCRIPTIONS INTEGRATION
    // ====================
    
    /**
     * Grant Pro access when subscription becomes active
     * @param WC_Subscription $subscription
     */
    public function grant_pro_access($subscription) {
        if (!$this->is_ultra_card_pro_subscription($subscription)) {
            return;
        }
        
        $user_id = $subscription->get_user_id();
        $user = get_user_by('id', $user_id);
        
        if (!$user) {
            return;
        }
        
        // NEVER change admin roles - admins already have Pro access
        if (in_array('administrator', (array) $user->roles)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Skipping role change for admin user {$user_id}");
            }
            return;
        }
        
        // Only change role for non-admin users
        $user->set_role('ultra_card_pro');
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Ultra Card: Granted Pro access to user {$user_id}");
        }
    }
    
    /**
     * Revoke Pro access when subscription is cancelled/expired/on-hold
     * @param WC_Subscription $subscription
     */
    public function revoke_pro_access($subscription) {
        if (!$this->is_ultra_card_pro_subscription($subscription)) {
            return;
        }
        
        $user_id = $subscription->get_user_id();
        $user = get_user_by('id', $user_id);
        
        if (!$user) {
            return;
        }
        
        // NEVER downgrade admins - they keep their admin role
        if (in_array('administrator', (array) $user->roles)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Skipping role change for admin user {$user_id}");
            }
            return;
        }
        
        // Only downgrade ultra_card_pro users (not admins)
        if (in_array('ultra_card_pro', $user->roles)) {
            $user->set_role('ultra_card_free');
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Revoked Pro access from user {$user_id}");
            }
        }
    }
    
    /**
     * Check if a subscription is for Ultra Card Pro product
     * @param WC_Subscription $subscription
     * @return bool
     */
    private function is_ultra_card_pro_subscription($subscription) {
        foreach ($subscription->get_items() as $item) {
            $product = $item->get_product();
            if ($product && stripos($product->get_name(), 'Ultra Card Pro') !== false) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get WooCommerce subscription data for a user
     * @param int $user_id
     * @return array|null
     */
    public function get_woocommerce_subscription_data($user_id) {
        if (!function_exists('wcs_get_users_subscriptions')) {
            return null; // WooCommerce Subscriptions not active
        }
        
        $subscriptions = wcs_get_users_subscriptions($user_id);
        
        foreach ($subscriptions as $subscription) {
            if ($this->is_ultra_card_pro_subscription($subscription)) {
                $next_payment = $subscription->get_date('next_payment');
                $last_payment = $subscription->get_date('last_order_date_created');
                
                return array(
                    'status' => $subscription->get_status(),
                    'next_payment_date' => $next_payment ? $next_payment : null,
                    'last_payment_date' => $last_payment ? $last_payment : null,
                    'start_date' => $subscription->get_date('start'),
                    'trial_end' => $subscription->get_date('trial_end'),
                    'billing_period' => $subscription->get_billing_period(),
                    'billing_interval' => $subscription->get_billing_interval(),
                    'total' => $subscription->get_total(),
                    'currency' => $subscription->get_currency(),
                    'payment_method_title' => $subscription->get_payment_method_title(),
                    'view_subscription_url' => $subscription->get_view_order_url(),
                    'subscription_id' => $subscription->get_id(),
                );
            }
        }
        
        return null;
    }
    
    /**
     * Get WooCommerce orders/invoices for a user (for billing history)
     * @param int $user_id
     * @param int $limit
     * @return array
     */
    public function get_user_invoices($user_id, $limit = 10) {
        if (!function_exists('wcs_get_users_subscriptions')) {
            // Fallback: Get all WooCommerce orders for user
            return $this->get_user_orders_fallback($user_id, $limit);
        }
        
        $subscriptions = wcs_get_users_subscriptions($user_id);
        $invoices = array();
        
        foreach ($subscriptions as $subscription) {
            if ($this->is_ultra_card_pro_subscription($subscription)) {
                // Get related orders with all types
                $related_orders = $subscription->get_related_orders('all', array('parent', 'renewal', 'switch'));
                
                foreach ($related_orders as $order_id) {
                    $order = wc_get_order($order_id);
                    if ($order) {
                        $invoices[] = array(
                            'order_id' => $order->get_id(),
                            'date' => $order->get_date_created()->format('Y-m-d H:i:s'),
                            'status' => $order->get_status(),
                            'total' => $order->get_total(),
                            'currency' => $order->get_currency(),
                            'payment_method' => $order->get_payment_method_title(),
                            'invoice_url' => $order->get_view_order_url(),
                            'download_invoice_url' => $order->get_checkout_order_received_url(),
                        );
                    }
                }
                
                break; // Only process first Ultra Card Pro subscription
            }
        }
        
        // If no subscription orders found, try fallback
        if (empty($invoices)) {
            return $this->get_user_orders_fallback($user_id, $limit);
        }
        
        // Sort by date descending
        usort($invoices, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($invoices, 0, $limit);
    }
    
    /**
     * Fallback method to get all WooCommerce orders for a user
     * Used when WooCommerce Subscriptions isn't available or no subscription orders found
     */
    private function get_user_orders_fallback($user_id, $limit = 10) {
        if (!function_exists('wc_get_orders')) {
            return array();
        }
        
        $orders = wc_get_orders(array(
            'customer_id' => $user_id,
            'limit' => $limit,
            'orderby' => 'date',
            'order' => 'DESC',
            'return' => 'objects',
        ));
        
        $invoices = array();
        foreach ($orders as $order) {
            $invoices[] = array(
                'order_id' => $order->get_id(),
                'date' => $order->get_date_created()->format('Y-m-d H:i:s'),
                'status' => $order->get_status(),
                'total' => $order->get_total(),
                'currency' => $order->get_currency(),
                'payment_method' => $order->get_payment_method_title(),
                'invoice_url' => $order->get_view_order_url(),
                'download_invoice_url' => $order->get_checkout_order_received_url(),
            );
        }
        
        return $invoices;
    }
    
    /**
     * Prune auto-backups older than 30 days
     * Snapshots are never auto-deleted
     */
    public function prune_old_backups() {
        $cutoff_date = date('Y-m-d H:i:s', strtotime('-30 days'));
        
        $old_backups = get_posts(array(
            'post_type' => 'ultra_backup',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'date_query' => array(
                array(
                    'before' => $cutoff_date,
                    'inclusive' => false
                )
            ),
            'meta_query' => array(
                array(
                    'key' => 'backup_type',
                    'value' => 'auto',
                    'compare' => '='
                )
            )
        ));
        
        $deleted_count = 0;
        foreach ($old_backups as $backup) {
            if (wp_delete_post($backup->ID, true)) {
                $deleted_count++;
            }
        }
        
        if (WP_DEBUG && $deleted_count > 0) {
            error_log("Ultra Card: Pruned {$deleted_count} old auto-backups");
        }
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
        
        // Ultra Card Backups (DEPRECATED - kept for migration)
        register_post_type('ultra_backup', array(
            'labels' => array(
                'name' => 'Ultra Card Backups (Old)',
                'singular_name' => 'Ultra Card Backup',
                'menu_name' => 'UC Backups (Old)',
            ),
            'public' => false,
            'show_ui' => false,
            'show_in_rest' => false,
            'supports' => array('title', 'author', 'custom-fields'),
            'capability_type' => 'post',
            'map_meta_cap' => true,
        ));
        
        // NEW: Dashboard Snapshots (Daily full dashboard backups)
        register_post_type('ultra_snapshot', array(
            'labels' => array(
                'name' => 'Dashboard Snapshots',
                'singular_name' => 'Dashboard Snapshot',
                'menu_name' => 'UC Snapshots',
                'add_new' => 'Add Snapshot',
                'add_new_item' => 'Add New Dashboard Snapshot',
                'edit_item' => 'Edit Dashboard Snapshot',
                'new_item' => 'New Dashboard Snapshot',
                'view_item' => 'View Dashboard Snapshot',
                'search_items' => 'Search Dashboard Snapshots',
                'not_found' => 'No snapshots found',
                'not_found_in_trash' => 'No snapshots found in trash',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'tools.php',
            'show_in_rest' => true,
            'rest_base' => 'ultra-snapshots',
            'supports' => array('title', 'author', 'custom-fields'),
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'hierarchical' => false,
            'rewrite' => false,
            'query_var' => false,
        ));
        
        // NEW: Card Backups (Manual single-card backups)
        register_post_type('ultra_card_backup', array(
            'labels' => array(
                'name' => 'Card Backups',
                'singular_name' => 'Card Backup',
                'menu_name' => 'UC Card Backups',
                'add_new' => 'Add Backup',
                'add_new_item' => 'Add New Card Backup',
                'edit_item' => 'Edit Card Backup',
                'new_item' => 'New Card Backup',
                'view_item' => 'View Card Backup',
                'search_items' => 'Search Card Backups',
                'not_found' => 'No card backups found',
                'not_found_in_trash' => 'No card backups found in trash',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'tools.php',
            'show_in_rest' => true,
            'rest_base' => 'ultra-card-backups',
            'supports' => array('title', 'author', 'custom-fields'),
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
        
        // Backup endpoints (Cloud Backup System)
        register_rest_route('ultra-card/v1', '/backups', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_backups'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/backups', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/backups/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/backups/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/backups/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/backups/(?P<id>\d+)/restore', array(
            'methods' => 'POST',
            'callback' => array($this, 'restore_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Subscription endpoint
        register_rest_route('ultra-card/v1', '/subscription', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_subscription'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // WooCommerce Subscription & Invoices
        register_rest_route('ultra-card/v1', '/subscription/woocommerce', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_woocommerce_subscription'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/subscription/invoices', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_invoices'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // ========================================
        // NEW SNAPSHOT SYSTEM ENDPOINTS
        // ========================================
        
        // Dashboard Snapshots (Daily full dashboard backups)
        register_rest_route('ultra-card/v1', '/snapshots', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_snapshots'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/snapshots', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_snapshot'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/snapshots/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_snapshot'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/snapshots/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_snapshot'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/snapshots/(?P<id>\d+)/restore', array(
            'methods' => 'POST',
            'callback' => array($this, 'restore_snapshot'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Card Backups (Manual single-card backups)
        register_rest_route('ultra-card/v1', '/card-backups', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_card_backups'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/card-backups', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_card_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/card-backups/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_card_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/card-backups/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_card_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/card-backups/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_card_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/card-backups/(?P<id>\d+)/restore', array(
            'methods' => 'POST',
            'callback' => array($this, 'restore_card_backup'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Snapshot Settings (User preferences)
        register_rest_route('ultra-card/v1', '/snapshot-settings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_snapshot_settings'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/snapshot-settings', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_snapshot_settings'),
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
    
    // ====================
    // BACKUP ENDPOINTS (Cloud Backup System)
    // ====================
    
    /**
     * Get list of backups for current user
     */
    public function get_backups($request) {
        $user_id = get_current_user_id();
        $page = intval($request->get_param('page') ?? 1);
        $per_page = intval($request->get_param('per_page') ?? 50);
        $type = $request->get_param('type'); // 'auto' or 'snapshot'
        
        $args = array(
            'post_type' => 'ultra_backup',
            'author' => $user_id,
            'posts_per_page' => $per_page,
            'paged' => $page,
            'orderby' => 'date',
            'order' => 'DESC',
        );
        
        // Filter by type if specified
        if ($type === 'auto' || $type === 'snapshot') {
            $args['meta_query'] = array(
                array(
                    'key' => 'backup_type',
                    'value' => $type,
                    'compare' => '='
                )
            );
        }
        
        $backups = get_posts($args);
        $formatted_backups = array();
        
        foreach ($backups as $backup) {
            $formatted_backups[] = $this->format_backup_list_item($backup);
        }
        
        // Get total count for pagination
        $total_args = $args;
        $total_args['posts_per_page'] = -1;
        $total_args['fields'] = 'ids';
        $total = count(get_posts($total_args));
        
        return rest_ensure_response(array(
            'backups' => $formatted_backups,
            'total' => $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        ));
    }
    
    /**
     * Create new backup (auto or snapshot)
     */
    public function create_backup($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $backup_type = $data['type'] ?? 'auto'; // 'auto' or 'snapshot'
        $config = $data['config'];
        $snapshot_name = $data['snapshot_name'] ?? '';
        $snapshot_description = $data['snapshot_description'] ?? '';
        
        // Validate config
        if (empty($config)) {
            return new WP_Error('invalid_config', 'Config is required', array('status' => 400));
        }
        
        // Check if Pro for snapshots
        if ($backup_type === 'snapshot') {
            $subscription = $this->get_user_subscription_data($user_id);
            if ($subscription['tier'] !== 'pro') {
                return new WP_Error('pro_required', 'Pro subscription required for snapshots', array('status' => 403));
            }
            
            // Check snapshot limit
            $snapshot_count = $this->count_user_snapshots($user_id);
            if ($snapshot_count >= 30) {
                return new WP_Error('snapshot_limit', 'Maximum 30 snapshots reached. Delete old snapshots or upgrade.', array('status' => 403));
            }
            
            if (empty($snapshot_name)) {
                return new WP_Error('snapshot_name_required', 'Snapshot name is required', array('status' => 400));
            }
        }
        
        // Calculate config hash for deduplication
        $config_json = json_encode($config);
        $config_hash = md5($config_json);
        
        // Check for duplicate (same hash from same user in last 5 minutes)
        $recent_backup = get_posts(array(
            'post_type' => 'ultra_backup',
            'author' => $user_id,
            'meta_query' => array(
                array('key' => 'config_hash', 'value' => $config_hash),
                array('key' => 'backup_type', 'value' => $backup_type)
            ),
            'date_query' => array(
                array('after' => '5 minutes ago')
            ),
            'posts_per_page' => 1
        ));
        
        if (!empty($recent_backup) && $backup_type === 'auto') {
            // Return existing backup to avoid duplicate
            return rest_ensure_response($this->format_backup($recent_backup[0], false));
        }
        
        // Get next version number
        $version_number = $this->get_next_version_number($user_id);
        
        // Calculate card stats
        $card_stats = $this->calculate_card_stats($config);
        
        // Create post title
        $post_title = $backup_type === 'snapshot' 
            ? $snapshot_name 
            : 'Auto-backup v' . $version_number . ' - ' . date('Y-m-d H:i:s');
        
        // Create backup post
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_backup',
            'post_title' => sanitize_text_field($post_title),
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_Error('create_failed', 'Failed to create backup', array('status' => 500));
        }
        
        // Save meta data
        update_post_meta($post_id, 'backup_type', $backup_type);
        update_post_meta($post_id, 'config_json', gzcompress($config_json)); // Compress for storage
        update_post_meta($post_id, 'config_hash', $config_hash);
        update_post_meta($post_id, 'version_number', $version_number);
        update_post_meta($post_id, 'card_stats', json_encode($card_stats));
        update_post_meta($post_id, 'device_info', sanitize_text_field($data['device_info'] ?? 'Unknown'));
        
        if ($backup_type === 'snapshot') {
            update_post_meta($post_id, 'snapshot_name', sanitize_text_field($snapshot_name));
            update_post_meta($post_id, 'snapshot_description', sanitize_textarea_field($snapshot_description));
        }
        
        $backup = get_post($post_id);
        return rest_ensure_response($this->format_backup($backup, false));
    }
    
    /**
     * Get single backup with full config
     */
    public function get_backup($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $backup = get_post($id);
        if (!$backup || $backup->post_type !== 'ultra_backup' || $backup->post_author != $user_id) {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        return rest_ensure_response($this->format_backup($backup, true));
    }
    
    /**
     * Update backup (snapshots only - name/description)
     */
    public function update_backup($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $backup = get_post($id);
        if (!$backup || $backup->post_author != $user_id) {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        $backup_type = get_post_meta($id, 'backup_type', true);
        if ($backup_type !== 'snapshot') {
            return new WP_Error('invalid_operation', 'Can only update snapshots', array('status' => 400));
        }
        
        // Update snapshot metadata
        if (isset($data['snapshot_name'])) {
            wp_update_post(array(
                'ID' => $id,
                'post_title' => sanitize_text_field($data['snapshot_name'])
            ));
            update_post_meta($id, 'snapshot_name', sanitize_text_field($data['snapshot_name']));
        }
        
        if (isset($data['snapshot_description'])) {
            update_post_meta($id, 'snapshot_description', sanitize_textarea_field($data['snapshot_description']));
        }
        
        $backup = get_post($id);
        return rest_ensure_response($this->format_backup($backup, false));
    }
    
    /**
     * Delete backup (snapshots only)
     */
    public function delete_backup($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $backup = get_post($id);
        if (!$backup || $backup->post_author != $user_id) {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        $backup_type = get_post_meta($id, 'backup_type', true);
        if ($backup_type !== 'snapshot') {
            return new WP_Error('invalid_operation', 'Can only delete snapshots', array('status' => 400));
        }
        
        $result = wp_delete_post($id, true);
        
        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete backup', array('status' => 500));
        }
        
        return rest_ensure_response(array('deleted' => true));
    }
    
    /**
     * Mark backup as restored (analytics/tracking)
     */
    public function restore_backup($request) {
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        $backup = get_post($id);
        if (!$backup || $backup->post_author != $user_id) {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        // Track restore count and last restored time
        $restore_count = intval(get_post_meta($id, 'restore_count', true)) + 1;
        update_post_meta($id, 'restore_count', $restore_count);
        update_post_meta($id, 'last_restored', current_time('mysql'));
        
        return rest_ensure_response(array(
            'restored' => true,
            'restore_count' => $restore_count
        ));
    }
    
    /**
     * Get user subscription status
     */
    public function get_subscription($request) {
        $user_id = get_current_user_id();
        return rest_ensure_response($this->get_user_subscription_data($user_id));
    }
    
    /**
     * Get WooCommerce subscription data via REST API
     */
    public function get_woocommerce_subscription($request) {
        $user_id = get_current_user_id();
        $subscription_data = $this->get_woocommerce_subscription_data($user_id);
        
        if (!$subscription_data) {
            return new WP_Error('no_subscription', 'No WooCommerce subscription found', array('status' => 404));
        }
        
        return rest_ensure_response($subscription_data);
    }
    
    /**
     * Get user invoices/orders via REST API
     */
    public function get_invoices($request) {
        $user_id = get_current_user_id();
        $limit = $request->get_param('limit') ?: 10;
        
        $invoices = $this->get_user_invoices($user_id, $limit);
        
        return rest_ensure_response(array(
            'invoices' => $invoices,
            'total' => count($invoices)
        ));
    }
    
    // ====================
    // BACKUP HELPER METHODS
    // ====================
    
    /**
     * Format backup for list view (without full config)
     */
    public function format_backup_list_item($backup) {
        $meta = get_post_meta($backup->ID);
        $config_json = gzuncompress(get_post_meta($backup->ID, 'config_json', true));
        $size_kb = $config_json ? round(strlen($config_json) / 1024, 2) : 0;
        
        $card_stats = json_decode(get_post_meta($backup->ID, 'card_stats', true), true);
        
        return array(
            'id' => $backup->ID,
            'type' => get_post_meta($backup->ID, 'backup_type', true),
            'version_number' => intval(get_post_meta($backup->ID, 'version_number', true)),
            'snapshot_name' => get_post_meta($backup->ID, 'snapshot_name', true),
            'snapshot_description' => get_post_meta($backup->ID, 'snapshot_description', true),
            'created' => $backup->post_date,
            'size_kb' => $size_kb,
            'card_stats' => $card_stats,
            'device_info' => get_post_meta($backup->ID, 'device_info', true),
            'restore_count' => intval(get_post_meta($backup->ID, 'restore_count', true))
        );
    }
    
    /**
     * Format backup with full config
     */
    private function format_backup($backup, $include_config = true) {
        $data = $this->format_backup_list_item($backup);
        
        if ($include_config) {
            $config_json = gzuncompress(get_post_meta($backup->ID, 'config_json', true));
            $data['config'] = json_decode($config_json, true);
            $data['config_hash'] = get_post_meta($backup->ID, 'config_hash', true);
        }
        
        return $data;
    }
    
    /**
     * Get next version number for user
     */
    private function get_next_version_number($user_id) {
        $latest = get_posts(array(
            'post_type' => 'ultra_backup',
            'author' => $user_id,
            'posts_per_page' => 1,
            'orderby' => 'meta_value_num',
            'meta_key' => 'version_number',
            'order' => 'DESC'
        ));
        
        if (empty($latest)) {
            return 1;
        }
        
        $last_version = intval(get_post_meta($latest[0]->ID, 'version_number', true));
        return $last_version + 1;
    }
    
    /**
     * Count user's snapshots
     */
    public function count_user_snapshots($user_id) {
        $snapshots = get_posts(array(
            'post_type' => 'ultra_backup',
            'author' => $user_id,
            'meta_query' => array(
                array(
                    'key' => 'backup_type',
                    'value' => 'snapshot'
                )
            ),
            'posts_per_page' => -1,
            'fields' => 'ids'
        ));
        
        return count($snapshots);
    }
    
    /**
     * Calculate card statistics from config
     */
    public function calculate_card_stats($config) {
        $rows = $config['layout']['rows'] ?? array();
        $row_count = count($rows);
        $column_count = 0;
        $module_count = 0;
        
        foreach ($rows as $row) {
            $columns = $row['columns'] ?? array();
            $column_count += count($columns);
            
            foreach ($columns as $column) {
                $modules = $column['modules'] ?? array();
                $module_count += count($modules);
            }
        }
        
        return array(
            'row_count' => $row_count,
            'column_count' => $column_count,
            'module_count' => $module_count
        );
    }
    
    /**
     * Get user subscription data based on WordPress role
     */
    public function get_user_subscription_data($user_id) {
        $user = get_user_by('id', $user_id);
        
        if (!$user) {
            return array(
                'tier' => 'free',
                'status' => 'inactive',
                'expires' => null,
                'features' => array(
                    'auto_backups' => false,
                    'snapshots_enabled' => false,
                    'snapshot_limit' => 0,
                    'backup_retention_days' => 30,
                ),
                'snapshot_count' => 0,
                'snapshot_limit' => 0,
                'woocommerce' => null
            );
        }
        
        // Admins automatically get Pro access
        $is_admin = in_array('administrator', (array) $user->roles);
        
        // Check if user has Ultra Card Pro role
        $is_pro = $is_admin || in_array('ultra_card_pro', (array) $user->roles);
        $has_ultra_card = in_array('ultra_card_free', (array) $user->roles) || $is_pro;
        
        $tier = $is_pro ? 'pro' : ($has_ultra_card ? 'free' : 'free');
        $status = ($is_pro || $has_ultra_card) ? 'active' : 'inactive';
        
        // Get WooCommerce subscription data
        $wc_subscription = $this->get_woocommerce_subscription_data($user_id);
        
        // Check for expiration date in user meta (optional)
        // Admins never expire
        if (!$is_admin) {
            $expires = get_user_meta($user_id, 'ultra_card_subscription_expires', true);
            
            // If expiration date is set and in the past, mark as expired
            if ($expires && $expires < time()) {
                $status = 'expired';
            }
        } else {
            $expires = null; // Admins don't have expiration
        }
        
        // Define features based on tier
        $features = array(
            'auto_backups' => true, // Both free and pro
            'snapshots_enabled' => ($tier === 'pro' && $status === 'active'),
            'snapshot_limit' => ($tier === 'pro' && $status === 'active') ? 30 : 0,
            'backup_retention_days' => 30,
        );
        
        $snapshot_count = $this->count_user_snapshots($user_id);
        
        return array(
            'tier' => $tier,
            'status' => $status,
            'expires' => $expires,
            'features' => $features,
            'snapshot_count' => $snapshot_count,
            'snapshot_limit' => $features['snapshot_limit'],
            'is_admin' => $is_admin, // Add flag for admin status
            'woocommerce' => $wc_subscription // Include WooCommerce subscription data
        );
    }
    
    // ====================
    // HELPER METHODS FOR DASHBOARD PANEL
    // ====================
    
    /**
     * Get user's backups with optional type filter
     * Used by UltraCardDashboardIntegration class
     * NEW: Now returns both snapshots and card backups based on type
     */
    public function get_user_backups($user_id, $type = null, $limit = 20) {
        // Validate user_id
        if (!$user_id || !is_numeric($user_id)) {
            return array();
        }
        
        $all_backups = array();
        
        // Determine which post types to query based on type filter
        if ($type === 'snapshots' || $type === 'dashboard_snapshots') {
            // Only Dashboard Snapshots
            $post_types = array('ultra_snapshot');
        } elseif ($type === 'card_backups' || $type === 'manual_card_backups') {
            // Only Manual Card Backups
            $post_types = array('ultra_card_backup');
        } else {
            // All backups (both types)
            $post_types = array('ultra_snapshot', 'ultra_card_backup');
        }
        
        $args = array(
            'post_type' => $post_types,
            'author' => $user_id,
            'posts_per_page' => intval($limit),
            'orderby' => 'date',
            'order' => 'DESC',
        );
        
        return get_posts($args);
    }
    
    /**
     * Enqueue dashboard assets (CSS & JS)
     * DEPRECATED - Now handled by UltraCardDashboardIntegration class
     */
    private function enqueue_dashboard_assets_old() {
        // Only enqueue on dashboard pages
        if (!is_user_logged_in() || !function_exists('drts')) {
            return;
        }
        
        // Inline CSS for dashboard panel
        wp_add_inline_style('wp-admin', '
            .ultra-card-backups-dashboard {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .uc-subscription-banner {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .uc-subscription-banner.free {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            .uc-tier-badge {
                font-size: 18px;
                font-weight: 600;
                margin-right: 15px;
            }
            
            .uc-upgrade-btn, .uc-create-snapshot-btn {
                padding: 10px 20px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 5px;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.3s;
            }
            
            .uc-upgrade-btn:hover, .uc-create-snapshot-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .uc-backups-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .uc-backup-card {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
                transition: all 0.3s;
            }
            
            .uc-backup-card:hover {
                border-color: #667eea;
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.1);
            }
            
            .uc-backup-card.snapshot {
                border-left: 4px solid #667eea;
            }
            
            .uc-backup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .uc-backup-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                font-size: 16px;
            }
            
            .uc-backup-title i {
                color: #667eea;
            }
            
            .uc-backup-badge {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .uc-backup-badge.snapshot {
                background: #667eea;
                color: white;
            }
            
            .uc-backup-badge.auto {
                background: #e0e0e0;
                color: #666;
            }
            
            .uc-backup-date {
                font-size: 13px;
                color: #999;
            }
            
            .uc-backup-description {
                padding: 10px;
                background: #f5f5f5;
                border-radius: 5px;
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
            }
            
            .uc-backup-stats {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                padding: 15px 0;
                border-top: 1px solid #e0e0e0;
                border-bottom: 1px solid #e0e0e0;
                margin-bottom: 15px;
                font-size: 13px;
                color: #666;
            }
            
            .uc-backup-stats i {
                color: #999;
                margin-right: 5px;
            }
            
            .uc-backup-actions {
                display: flex;
                gap: 10px;
            }
            
            .uc-action-btn {
                flex: 1;
                padding: 10px;
                border: 1px solid #e0e0e0;
                background: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }
            
            .uc-action-btn:hover {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            
            .uc-action-btn i {
                margin-right: 5px;
            }
            
            .uc-delete-btn:hover {
                background: #dc3545;
                border-color: #dc3545;
            }
            
            .uc-empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #999;
            }
            
            .uc-empty-state i {
                font-size: 64px;
                margin-bottom: 20px;
            }
            
            .uc-empty-state h3 {
                margin: 15px 0;
                color: #666;
            }
            
            .uc-instructions {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            
            .uc-instructions h4 {
                margin: 0 0 15px 0;
                color: #333;
            }
            
            .uc-instructions ol {
                margin: 0;
                padding-left: 20px;
            }
            
            .uc-instructions li {
                margin: 8px 0;
                color: #666;
            }
        ');
        
        // Inline JavaScript for dashboard interactions
        wp_add_inline_script('jquery', '
            function ucViewBackup(backupId) {
                // Fetch and display backup JSON in modal
                jQuery.ajax({
                    url: "' . rest_url('ultra-card/v1/backups/') . '" + backupId,
                    headers: {
                        "X-WP-Nonce": "' . wp_create_nonce('wp_rest') . '"
                    },
                    success: function(backup) {
                        const json = JSON.stringify(backup.config, null, 2);
                        const modal = jQuery("<div class=\"uc-modal\"><div class=\"uc-modal-content\"><span class=\"uc-modal-close\">&times;</span><h3>Backup Configuration</h3><p>Copy this JSON to restore in your Home Assistant card editor:</p><textarea readonly style=\"width:100%;height:400px;font-family:monospace;\">" + json + "</textarea><button onclick=\"ucCopyToClipboard(this)\" class=\"uc-copy-btn\">Copy to Clipboard</button></div></div>");
                        jQuery("body").append(modal);
                        modal.find(".uc-modal-close, .uc-modal").click(function(e) {
                            if (e.target === this) modal.remove();
                        });
                    }
                });
            }
            
            function ucDownloadBackup(backupId) {
                jQuery.ajax({
                    url: "' . rest_url('ultra-card/v1/backups/') . '" + backupId,
                    headers: {
                        "X-WP-Nonce": "' . wp_create_nonce('wp_rest') . '"
                    },
                    success: function(backup) {
                        const json = JSON.stringify(backup.config, null, 2);
                        const blob = new Blob([json], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "ultra-card-backup-v" + backup.version_number + ".json";
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                });
            }
            
            function ucDeleteBackup(backupId) {
                if (!confirm("Delete this snapshot? This cannot be undone.")) return;
                jQuery.ajax({
                    url: "' . rest_url('ultra-card/v1/backups/') . '" + backupId,
                    method: "DELETE",
                    headers: {
                        "X-WP-Nonce": "' . wp_create_nonce('wp_rest') . '"
                    },
                    success: function() {
                        location.reload();
                    },
                    error: function() {
                        alert("Failed to delete backup");
                    }
                });
            }
            
            function ucCopyToClipboard(btn) {
                const textarea = jQuery(btn).prev("textarea")[0];
                textarea.select();
                document.execCommand("copy");
                jQuery(btn).text("✓ Copied!").prop("disabled", true);
                setTimeout(() => {
                    jQuery(btn).text("Copy to Clipboard").prop("disabled", false);
                }, 2000);
            }
        ');
        
        // Modal styles
        wp_add_inline_style('wp-admin', '
            .uc-modal {
                display: block;
                position: fixed;
                z-index: 99999;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
            }
            
            .uc-modal-content {
                background-color: white;
                margin: 5% auto;
                padding: 30px;
                border-radius: 10px;
                width: 80%;
                max-width: 800px;
                position: relative;
            }
            
            .uc-modal-close {
                position: absolute;
                right: 20px;
                top: 20px;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                color: #999;
            }
            
            .uc-modal-close:hover {
                color: #333;
            }
            
            .uc-copy-btn {
                margin-top: 15px;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
            }
            
            .uc-copy-btn:hover {
                background: #5568d3;
            }
        ');
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
    
    // ========================================
    // NEW SNAPSHOT SYSTEM METHODS
    // ========================================
    
    /**
     * Get dashboard snapshots (list view)
     */
    public function get_snapshots($request) {
        $user_id = get_current_user_id();
        $limit = intval($request->get_param('limit') ?? 30);
        
        $args = array(
            'post_type' => 'ultra_snapshot',
            'author' => $user_id,
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC',
        );
        
        $snapshots = get_posts($args);
        $result = array();
        
        foreach ($snapshots as $snapshot) {
            $snapshot_data_json = get_post_meta($snapshot->ID, 'snapshot_data', true);
            $snapshot_data = json_decode($snapshot_data_json, true);
            $card_count = count($snapshot_data['cards'] ?? []);
            
            // Group by views
            $views_breakdown = array();
            foreach (($snapshot_data['cards'] ?? []) as $card) {
                $view_title = $card['view_title'] ?? 'Unknown View';
                if (!isset($views_breakdown[$view_title])) {
                    $views_breakdown[$view_title] = 0;
                }
                $views_breakdown[$view_title]++;
            }
            
            $result[] = array(
                'id' => $snapshot->ID,
                'type' => get_post_meta($snapshot->ID, 'snapshot_type', true),
                'date' => get_post_meta($snapshot->ID, 'snapshot_date', true),
                'card_count' => $card_count,
                'views_breakdown' => $views_breakdown,
                'size_kb' => round(strlen($snapshot_data_json) / 1024, 2),
                'created' => $snapshot->post_date,
                'created_timestamp' => strtotime($snapshot->post_date),
            );
        }
        
        return rest_ensure_response($result);
    }
    
    /**
     * Create dashboard snapshot (all Ultra Cards)
     */
    public function create_snapshot($request) {
        $user_id = get_current_user_id();
        $snapshot_type = $request->get_param('type') ?? 'manual';
        $snapshot_data = $request->get_param('snapshot_data');
        
        if (!$snapshot_data || !isset($snapshot_data['cards'])) {
            return new WP_Error('invalid_data', 'Snapshot data is required', array('status' => 400));
        }
        
        // Check Pro status for manual snapshots
        if ($snapshot_type === 'manual') {
            $subscription = $this->get_user_subscription_data($user_id);
            if ($subscription['tier'] !== 'pro') {
                return new WP_Error('pro_required', 'Pro subscription required for manual snapshots', array('status' => 403));
            }
        }
        
        // Create snapshot post
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_snapshot',
            'post_title' => 'Dashboard Snapshot - ' . date('Y-m-d H:i:s'),
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return $post_id;
        }
        
        // Store metadata
        update_post_meta($post_id, 'snapshot_type', $snapshot_type);
        update_post_meta($post_id, 'snapshot_date', date('Y-m-d'));
        update_post_meta($post_id, 'snapshot_data', json_encode($snapshot_data));
        update_post_meta($post_id, 'card_count', count($snapshot_data['cards']));
        
        // Prune old auto-snapshots (keep 30 days)
        if ($snapshot_type === 'auto') {
            $this->prune_old_snapshots($user_id);
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'snapshot_id' => $post_id,
            'card_count' => count($snapshot_data['cards']),
        ));
    }
    
    /**
     * Get single snapshot with full data
     */
    public function get_snapshot($request) {
        $snapshot_id = intval($request['id']);
        $user_id = get_current_user_id();
        
        $snapshot = get_post($snapshot_id);
        
        if (!$snapshot || $snapshot->post_type !== 'ultra_snapshot') {
            return new WP_Error('not_found', 'Snapshot not found', array('status' => 404));
        }
        
        if ($snapshot->post_author != $user_id) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        $snapshot_data_json = get_post_meta($snapshot_id, 'snapshot_data', true);
        $snapshot_data = json_decode($snapshot_data_json, true);
        
        return rest_ensure_response(array(
            'id' => $snapshot->ID,
            'type' => get_post_meta($snapshot_id, 'snapshot_type', true),
            'date' => get_post_meta($snapshot_id, 'snapshot_date', true),
            'created' => $snapshot->post_date,
            'snapshot_data' => $snapshot_data,
        ));
    }
    
    /**
     * Delete dashboard snapshot
     */
    public function delete_snapshot($request) {
        $snapshot_id = intval($request['id']);
        $user_id = get_current_user_id();
        
        $snapshot = get_post($snapshot_id);
        
        if (!$snapshot || $snapshot->post_type !== 'ultra_snapshot') {
            return new WP_Error('not_found', 'Snapshot not found', array('status' => 404));
        }
        
        if ($snapshot->post_author != $user_id) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        // Only allow deletion of manual snapshots
        $snapshot_type = get_post_meta($snapshot_id, 'snapshot_type', true);
        if ($snapshot_type === 'auto') {
            return new WP_Error('cannot_delete_auto', 'Cannot delete auto snapshots', array('status' => 400));
        }
        
        $deleted = wp_delete_post($snapshot_id, true);
        
        if (!$deleted) {
            return new WP_Error('delete_failed', 'Failed to delete snapshot', array('status' => 500));
        }
        
        return rest_ensure_response(array('success' => true));
    }
    
    /**
     * Restore dashboard snapshot (returns instructions)
     */
    public function restore_snapshot($request) {
        $snapshot_id = intval($request['id']);
        $user_id = get_current_user_id();
        
        $snapshot = get_post($snapshot_id);
        
        if (!$snapshot || $snapshot->post_type !== 'ultra_snapshot') {
            return new WP_Error('not_found', 'Snapshot not found', array('status' => 404));
        }
        
        if ($snapshot->post_author != $user_id) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        $snapshot_data_json = get_post_meta($snapshot_id, 'snapshot_data', true);
        $snapshot_data = json_decode($snapshot_data_json, true);
        
        // Increment restore count
        $restore_count = intval(get_post_meta($snapshot_id, 'restore_count', true));
        update_post_meta($snapshot_id, 'restore_count', $restore_count + 1);
        update_post_meta($snapshot_id, 'last_restored', current_time('mysql'));
        
        return rest_ensure_response(array(
            'success' => true,
            'snapshot_data' => $snapshot_data,
            'instructions' => 'Open each Home Assistant view and paste the card configurations in the correct positions.',
        ));
    }
    
    /**
     * Get card backups (manual single-card backups)
     */
    public function get_card_backups($request) {
        $user_id = get_current_user_id();
        $limit = intval($request->get_param('limit') ?? 30);
        
        $args = array(
            'post_type' => 'ultra_card_backup',
            'author' => $user_id,
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC',
        );
        
        $backups = get_posts($args);
        $result = array();
        
        foreach ($backups as $backup) {
            $config_json = gzuncompress(get_post_meta($backup->ID, 'config_json', true));
            $card_stats = json_decode(get_post_meta($backup->ID, 'card_stats', true), true);
            
            $result[] = array(
                'id' => $backup->ID,
                'card_name' => get_post_meta($backup->ID, 'card_name', true),
                'stats' => $card_stats,
                'size_kb' => round(strlen($config_json) / 1024, 2),
                'created' => $backup->post_date,
                'created_timestamp' => strtotime($backup->post_date),
            );
        }
        
        return rest_ensure_response($result);
    }
    
    /**
     * Create card backup (manual single-card)
     */
    public function create_card_backup($request) {
        $user_id = get_current_user_id();
        $config = $request->get_param('config');
        $card_name = $request->get_param('card_name') ?? 'Unnamed Card';
        $view_info = $request->get_param('view_info') ?? array();
        
        if (!$config) {
            return new WP_Error('invalid_data', 'Card config is required', array('status' => 400));
        }
        
        // Check Pro status
        $subscription = $this->get_user_subscription_data($user_id);
        if ($subscription['tier'] !== 'pro') {
            return new WP_Error('pro_required', 'Pro subscription required for card backups', array('status' => 403));
        }
        
        // Enforce 30 backup limit (FIFO)
        $this->enforce_card_backup_limit($user_id, 30);
        
        // Calculate stats
        $card_stats = $this->calculate_card_stats($config);
        
        // Create backup post
        $post_id = wp_insert_post(array(
            'post_type' => 'ultra_card_backup',
            'post_title' => $card_name,
            'post_status' => 'publish',
            'post_author' => $user_id,
        ));
        
        if (is_wp_error($post_id)) {
            return $post_id;
        }
        
        // Store metadata
        update_post_meta($post_id, 'card_name', $card_name);
        update_post_meta($post_id, 'config_json', gzcompress(json_encode($config)));
        update_post_meta($post_id, 'card_stats', json_encode($card_stats));
        update_post_meta($post_id, 'view_info', json_encode($view_info));
        
        return rest_ensure_response(array(
            'success' => true,
            'backup_id' => $post_id,
            'card_name' => $card_name,
        ));
    }
    
    /**
     * Get single card backup with full config
     */
    public function get_card_backup($request) {
        $backup_id = intval($request['id']);
        $user_id = get_current_user_id();
        
        $backup = get_post($backup_id);
        
        if (!$backup || $backup->post_type !== 'ultra_card_backup') {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        if ($backup->post_author != $user_id) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        $config_json = gzuncompress(get_post_meta($backup_id, 'config_json', true));
        $config = json_decode($config_json, true);
        $card_stats = json_decode(get_post_meta($backup_id, 'card_stats', true), true);
        $view_info = json_decode(get_post_meta($backup_id, 'view_info', true), true);
        
        return rest_ensure_response(array(
            'id' => $backup->ID,
            'card_name' => get_post_meta($backup_id, 'card_name', true),
            'config' => $config,
            'stats' => $card_stats,
            'view_info' => $view_info,
            'created' => $backup->post_date,
        ));
    }
    
    /**
     * Update card backup (rename)
     */
    public function update_card_backup($request) {
        $backup_id = intval($request['id']);
        $user_id = get_current_user_id();
        $new_name = $request->get_param('card_name');
        
        if (!$new_name) {
            return new WP_Error('invalid_data', 'Card name is required', array('status' => 400));
        }
        
        $backup = get_post($backup_id);
        
        if (!$backup || $backup->post_type !== 'ultra_card_backup') {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        if ($backup->post_author != $user_id) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        // Update post title and meta
        wp_update_post(array(
            'ID' => $backup_id,
            'post_title' => $new_name,
        ));
        
        update_post_meta($backup_id, 'card_name', $new_name);
        
        return rest_ensure_response(array('success' => true, 'card_name' => $new_name));
    }
    
    /**
     * Delete card backup
     */
    public function delete_card_backup($request) {
        $backup_id = intval($request['id']);
        $user_id = get_current_user_id();
        
        $backup = get_post($backup_id);
        
        if (!$backup || $backup->post_type !== 'ultra_card_backup') {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        if ($backup->post_author != $user_id) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        $deleted = wp_delete_post($backup_id, true);
        
        if (!$deleted) {
            return new WP_Error('delete_failed', 'Failed to delete backup', array('status' => 500));
        }
        
        return rest_ensure_response(array('success' => true));
    }
    
    /**
     * Restore card backup (returns config)
     */
    public function restore_card_backup($request) {
        $backup_id = intval($request['id']);
        $user_id = get_current_user_id();
        
        $backup = get_post($backup_id);
        
        if (!$backup || $backup->post_type !== 'ultra_card_backup') {
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        if ($backup->post_author != $user_id) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        $config_json = gzuncompress(get_post_meta($backup_id, 'config_json', true));
        $config = json_decode($config_json, true);
        
        // Increment restore count
        $restore_count = intval(get_post_meta($backup_id, 'restore_count', true));
        update_post_meta($backup_id, 'restore_count', $restore_count + 1);
        update_post_meta($backup_id, 'last_restored', current_time('mysql'));
        
        return rest_ensure_response(array(
            'success' => true,
            'config' => $config,
        ));
    }
    
    /**
     * Get snapshot settings
     */
    public function get_snapshot_settings($request) {
        $user_id = get_current_user_id();
        
        $enabled = get_user_meta($user_id, 'ultra_snapshot_enabled', true);
        $time = get_user_meta($user_id, 'ultra_snapshot_time', true);
        $timezone = get_user_meta($user_id, 'ultra_snapshot_timezone', true);
        
        return rest_ensure_response(array(
            'enabled' => $enabled !== '' ? (bool)$enabled : true, // Default enabled
            'time' => $time ?: '03:00',
            'timezone' => $timezone ?: 'UTC',
        ));
    }
    
    /**
     * Update snapshot settings
     */
    public function update_snapshot_settings($request) {
        $user_id = get_current_user_id();
        
        $enabled = $request->get_param('enabled');
        $time = $request->get_param('time');
        $timezone = $request->get_param('timezone');
        
        if ($enabled !== null) {
            update_user_meta($user_id, 'ultra_snapshot_enabled', (bool)$enabled);
        }
        
        if ($time) {
            update_user_meta($user_id, 'ultra_snapshot_time', $time);
        }
        
        if ($timezone) {
            update_user_meta($user_id, 'ultra_snapshot_timezone', $timezone);
        }
        
        return rest_ensure_response(array('success' => true));
    }
    
    // ========================================
    // SNAPSHOT HELPER METHODS
    // ========================================
    
    /**
     * Prune old auto-snapshots (older than 30 days)
     */
    private function prune_old_snapshots($user_id) {
        $cutoff_date = date('Y-m-d H:i:s', strtotime('-30 days'));
        
        $old_snapshots = get_posts(array(
            'post_type' => 'ultra_snapshot',
            'post_status' => 'publish',
            'author' => $user_id,
            'posts_per_page' => -1,
            'date_query' => array(
                array(
                    'before' => $cutoff_date,
                    'inclusive' => false
                )
            ),
            'meta_query' => array(
                array(
                    'key' => 'snapshot_type',
                    'value' => 'auto',
                    'compare' => '='
                )
            )
        ));
        
        foreach ($old_snapshots as $snapshot) {
            wp_delete_post($snapshot->ID, true);
        }
    }
    
    /**
     * Enforce card backup limit (FIFO - delete oldest when limit reached)
     */
    private function enforce_card_backup_limit($user_id, $limit = 30) {
        $backups = get_posts(array(
            'post_type' => 'ultra_card_backup',
            'author' => $user_id,
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'ASC', // Oldest first
        ));
        
        $count = count($backups);
        
        // If at or above limit, delete oldest
        if ($count >= $limit) {
            $to_delete = $count - $limit + 1; // +1 to make room for the new backup
            for ($i = 0; $i < $to_delete; $i++) {
                wp_delete_post($backups[$i]->ID, true);
            }
        }
    }
}

/**
 * Ultra Card Dashboard Integration Class
 * Handles Directories Pro dashboard integration
 */
class UltraCardDashboardIntegration {
    
    private $cloud_sync;
    private $is_active = false;
    
    public function __construct($cloud_sync_instance = null) {
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Dashboard Integration constructor called');
        }
        
        // Only initialize if Directories Pro is active
        if (!class_exists('SabaiApps\\Directories\\Application')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Directories Pro not found, aborting dashboard integration');
            }
            return;
        }
        
        // Validate cloud sync instance
        if (!$cloud_sync_instance) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Cloud sync instance not provided, aborting dashboard integration');
            }
            return;
        }
        
        // Store reference to main cloud sync class for accessing helper methods
        $this->cloud_sync = $cloud_sync_instance;
        $this->is_active = true;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Dashboard Integration initialized successfully, registering filters');
        }
        
        // Register custom panel with Directories Pro using the CustomPanel system
        // This follows the exact pattern from CustomPanel.php
        add_filter('drts_dashboard_panel_custom_names', array($this, 'register_panel_name'), 10, 1);
        add_filter('drts_dashboard_panel_custom_info', array($this, 'register_panel_info'), 10, 2);
        add_filter('drts_dashboard_panel_custom_links', array($this, 'register_panel_links'), 10, 2);
        add_filter('drts_dashboard_panel_custom_content', array($this, 'render_panel_content'), 10, 3);
        add_filter('drts_dashboard_panel_custom_settings', array($this, 'register_panel_settings'), 10, 3);
        
        // Add CSS/JS for panel
        add_action('wp_enqueue_scripts', array($this, 'enqueue_dashboard_assets'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: All filters registered');
        }
    }
    
    /**
     * Register panel name in Directories Pro
     * This tells Directories Pro that we have a custom panel called 'ultra_card_backups'
     */
    public function register_panel_name($names) {
        if (!is_array($names)) {
            $names = array();
        }
        $names[] = 'ultra_card_backups';
        $names[] = 'ultra_card_membership'; // NEW: Membership/billing panel
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Panel names registered - ultra_card_backups, ultra_card_membership');
        }
        
        return $names;
    }
    
    /**
     * Register panel info (label, icon, weight)
     * This is called by CustomPanel when building the panel list
     */
    public function register_panel_info($info, $name) {
        // Handle Ultra Card Backups panel
        if ($name === 'ultra_card_backups') {
                // Debug logging
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Ultra Card: Panel info requested for - ' . $name);
                }
                
                // Return panel configuration
                $panel_info = array(
                    'label' => __('Ultra Card Backups', 'ultra-card'),
                    'icon' => 'fas fa-cloud',
                    'weight' => 50,
                    'wp' => true,
                );
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Ultra Card: Returning panel info: ' . print_r($panel_info, true));
                }
                
                return $panel_info;
        }
        
        // Handle Ultra Card Membership panel
        if ($name === 'ultra_card_membership') {
            return array(
                'label' => __('Ultra Card Membership', 'ultra-card'),
                'icon' => 'fas fa-credit-card',
                'weight' => 51,
                'wp' => true,
            );
        }
        
        return $info;
    }
    
    /**
     * Register panel links (sub-tabs within the panel)
     * This is called by CustomPanel to generate navigation links
     */
    public function register_panel_links($links, $name) {
        // Handle Ultra Card Membership panel
        if ($name === 'ultra_card_membership') {
            return array(
                'subscription' => array(
                    'title' => __('Subscription', 'ultra-card'),
                    'icon' => 'fas fa-star',
                    'weight' => 1,
                ),
                'billing' => array(
                    'title' => __('Billing History', 'ultra-card'),
                    'icon' => 'fas fa-file-invoice-dollar',
                    'weight' => 2,
                ),
            );
        }
        
        // Handle Ultra Card Backups panel
        if ($name !== 'ultra_card_backups' || !$this->is_active || !$this->cloud_sync) {
            return $links;
        }
        
        try {
            $user_id = get_current_user_id();
            if (!$user_id) {
                return $links;
            }
            
            $subscription = $this->cloud_sync->get_user_subscription_data($user_id);
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Error in register_panel_links: ' . $e->getMessage());
            }
            return $links;
        }
        
        $panel_links = array(
            'all_backups' => array(
                'title' => __('All Backups', 'ultra-card'),
                'icon' => 'fas fa-list',
                'weight' => 1,
            ),
            'auto_backups' => array(
                'title' => __('Dashboard Snapshots', 'ultra-card'),
                'icon' => 'fas fa-sync-alt',
                'weight' => 2,
            ),
        );
        
        // Add manual card backups tab for Pro users only
        if ($subscription['tier'] === 'pro') {
            $panel_links['snapshots'] = array(
                'title' => __('Manual Card Backups', 'ultra-card'),
                'icon' => 'fas fa-bookmark',
                'weight' => 3,
            );
        }
        
        return $panel_links;
    }
    
    /**
     * Render panel content for each link
     * This is called by CustomPanel to display the actual content
     */
    public function render_panel_content($content, $name, $link) {
        // Handle Ultra Card Membership panel
        if ($name === 'ultra_card_membership') {
            return $this->render_membership_panel_content($link);
        }
        
        // Handle Ultra Card Backups panel
        if ($name !== 'ultra_card_backups' || !$this->is_active || !$this->cloud_sync) {
            return $content;
        }
        
        $user_id = get_current_user_id();
        
        // Determine backup type filter based on $link parameter
        $backup_type = null;
        $section_title = 'All Backups';
        $section_icon = 'fa-list';
        
        if ($link === 'auto_backups') {
            $backup_type = 'dashboard_snapshots'; // Auto snapshots
            $section_title = 'Dashboard Snapshots';
            $section_icon = 'fa-sync-alt';
        } elseif ($link === 'snapshots') {
            $backup_type = 'card_backups'; // Manual card backups
            $section_title = 'Manual Card Backups';
            $section_icon = 'fa-bookmark';
        } elseif ($link === 'all_backups' || empty($link)) {
            $backup_type = null; // Show all
            $section_title = 'All Backups';
            $section_icon = 'fa-list';
        }
        
        // Safely get subscription data with error handling
        try {
            $subscription = $this->cloud_sync->get_user_subscription_data($user_id);
            $backups = $this->cloud_sync->get_user_backups($user_id, $backup_type, 10);
        } catch (Exception $e) {
            error_log('Ultra Card dashboard render error: ' . $e->getMessage());
            return '<p>Error loading dashboard: ' . esc_html($e->getMessage()) . '</p>';
        }
        
        ob_start();
        ?>
        <style>
            /* Ultra Card Pro Dashboard Styles */
            .ucp-dashboard {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            /* Pro Banner */
            .ucp-banner {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border-radius: 16px;
                padding: 32px;
                margin-bottom: 32px;
                box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .ucp-banner::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
            }
            
            .ucp-banner-content {
                position: relative;
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 24px;
            }
            
            .ucp-banner-text h2 {
                margin: 0 0 8px 0;
                font-size: 28px;
                font-weight: 700;
            }
            
            .ucp-banner-text p {
                margin: 0;
                opacity: 0.95;
                font-size: 16px;
            }
            
            .ucp-banner-badge {
                background: rgba(255, 255, 255, 0.25);
                padding: 12px 24px;
                border-radius: 24px;
                font-weight: 700;
                font-size: 16px;
                backdrop-filter: blur(10px);
            }
            
            .ucp-banner.free {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
            }
            
            /* Stats Grid */
            .ucp-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
            }
            
            .ucp-stat-card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                transition: all 0.3s;
                border: 2px solid transparent;
            }
            
            .ucp-stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.12);
                border-color: #667eea;
            }
            
            .ucp-stat-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 16px;
                font-size: 24px;
            }
            
            .ucp-stat-icon.purple {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .ucp-stat-icon.pink {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            .ucp-stat-icon.blue {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            .ucp-stat-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .ucp-stat-value {
                font-size: 32px;
                font-weight: 700;
                color: #1a1a1a;
            }
            
            /* Backups Section */
            .ucp-backups-section {
                background: white;
                border-radius: 16px;
                padding: 28px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            
            .ucp-section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
            }
            
            .ucp-section-header h3 {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                color: #1a1a1a;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ucp-section-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
            }
            
            /* Backup List */
            .ucp-backup-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .ucp-backup-item {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                transition: all 0.3s;
                border: 2px solid transparent;
            }
            
            .ucp-backup-item:hover {
                background: white;
                border-color: #667eea;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            
            .ucp-backup-info {
                flex: 1;
            }
            
            .ucp-backup-name {
                font-weight: 600;
                font-size: 15px;
                color: #1a1a1a;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .ucp-backup-badge {
                font-size: 11px;
                padding: 3px 10px;
                border-radius: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .ucp-backup-badge.snapshot {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
            }
            
            .ucp-backup-badge.auto {
                background: #e0e0e0;
                color: #666;
            }
            
            .ucp-backup-meta {
                font-size: 13px;
                color: #666;
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }
            
            .ucp-backup-meta-item {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .ucp-backup-actions {
                display: flex;
                gap: 8px;
            }
            
            .ucp-action-btn {
                padding: 8px 16px;
                border-radius: 6px;
                border: 2px solid #e0e0e0;
                background: white;
                color: #666;
                font-weight: 500;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .ucp-action-btn:hover {
                border-color: #667eea;
                color: #667eea;
                background: #f8f9fa;
            }
            
            .ucp-action-btn.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-color: transparent;
            }
            
            .ucp-action-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .ucp-action-btn.danger {
                border-color: #f44336;
                color: #f44336;
            }
            
            .ucp-action-btn.danger:hover {
                background: #f44336;
                color: white;
            }
            
            /* Empty State */
            .ucp-empty-state {
                text-align: center;
                padding: 60px 20px;
            }
            
            .ucp-empty-icon {
                font-size: 64px;
                opacity: 0.3;
                margin-bottom: 16px;
            }
            
            .ucp-empty-text {
                color: #666;
                font-size: 16px;
                margin-bottom: 24px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .ucp-banner-content {
                    flex-direction: column;
                    text-align: center;
                }
                
                .ucp-stats-grid {
                    grid-template-columns: 1fr;
                }
                
                .ucp-backup-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .ucp-backup-actions {
                    width: 100%;
                    justify-content: stretch;
                }
                
                .ucp-action-btn {
                    flex: 1;
                }
            }
        </style>
        
        <div class="ucp-dashboard">
            <!-- Pro/Free Banner -->
            <div class="ucp-banner <?php echo $subscription['tier'] === 'pro' ? 'pro' : 'free'; ?>">
                <div class="ucp-banner-content">
                    <div class="ucp-banner-text">
                        <h2>⭐ Ultra Card Pro</h2>
                        <p>
                            <?php if ($subscription['tier'] === 'pro'): ?>
                                Thank you for being a Pro member!
                            <?php else: ?>
                                Professional card management and cloud backups
                            <?php endif; ?>
                        </p>
                    </div>
                    <div class="ucp-banner-badge">
                        <?php echo strtoupper($subscription['tier']); ?>
                    </div>
                </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="ucp-stats-grid">
                <div class="ucp-stat-card">
                    <div class="ucp-stat-icon purple">📊</div>
                    <div class="ucp-stat-label">Total Backups</div>
                    <div class="ucp-stat-value"><?php echo count($backups); ?></div>
                </div>
                <div class="ucp-stat-card">
                    <div class="ucp-stat-icon pink">⭐</div>
                    <div class="ucp-stat-label">Manual Backups</div>
                    <div class="ucp-stat-value">
                        <?php echo $subscription['snapshot_count']; ?> / <?php echo $subscription['snapshot_limit']; ?>
                    </div>
                </div>
                <div class="ucp-stat-card">
                    <div class="ucp-stat-icon blue">🏆</div>
                    <div class="ucp-stat-label">Account Status</div>
                    <div class="ucp-stat-value" style="font-size: 20px;">
                        <?php echo $subscription['tier'] === 'pro' ? 'Pro Member' : 'Free Member'; ?>
                    </div>
                </div>
            </div>
            
            <!-- Backups Section -->
            <div class="ucp-backups-section">
                <div class="ucp-section-header">
                    <h3>
                        <span class="ucp-section-icon"><i class="fas <?php echo esc_attr($section_icon); ?>"></i></span>
                        <?php echo esc_html($section_title); ?>
                    </h3>
                </div>
                
                <?php if (empty($backups)): ?>
                    <div class="ucp-empty-state">
                        <div class="ucp-empty-icon">📦</div>
                        <div class="ucp-empty-text">
                            No backups yet. Create your first backup from the card editor in Home Assistant.
                        </div>
                    </div>
                <?php else: ?>
                    <div class="ucp-backup-list">
                        <?php foreach ($backups as $backup): 
                            try {
                                $backup_data = $this->cloud_sync->format_backup_list_item($backup);
                        ?>
                            <div class="ucp-backup-item">
                                <div class="ucp-backup-info">
                                    <div class="ucp-backup-name">
                                        <?php echo esc_html($backup_data['name']); ?>
                                        <span class="ucp-backup-badge <?php echo esc_attr($backup_data['type']); ?>">
                                            <?php echo esc_html($backup_data['type']); ?>
                                        </span>
                                    </div>
                                    <div class="ucp-backup-meta">
                                        <span class="ucp-backup-meta-item">
                                            🕐 <?php echo esc_html($backup_data['created']); ?>
                                        </span>
                                        <span class="ucp-backup-meta-item">
                                            📏 <?php echo esc_html($backup_data['size']); ?>
                                        </span>
                                        <?php if (!empty($backup_data['stats'])): ?>
                                            <span class="ucp-backup-meta-item">
                                                📊 <?php echo esc_html($backup_data['stats']); ?>
                                            </span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                                <div class="ucp-backup-actions">
                                    <button class="ucp-action-btn" onclick="ucViewBackup(<?php echo $backup->ID; ?>)">
                                        👁️ View
                                    </button>
                                    <button class="ucp-action-btn primary" onclick="ucDownloadBackup(<?php echo $backup->ID; ?>)">
                                        ⬇️ Download
                                    </button>
                                    <?php if ($backup_data['type'] === 'snapshot'): ?>
                                        <button class="ucp-action-btn danger" onclick="ucDeleteBackup(<?php echo $backup->ID; ?>)">
                                            🗑️ Delete
                                        </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php 
                            } catch (Exception $e) {
                                continue;
                            }
                        endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        
        <script>
        function ucViewBackup(id) {
            alert('View backup #' + id + ' - Feature coming soon!');
        }
        
        function ucDownloadBackup(id) {
            window.location.href = '<?php echo rest_url('ultra-card/v1/backups/'); ?>' + id + '/download';
        }
        
        function ucDeleteBackup(id) {
            if (confirm('Are you sure you want to delete this backup? This cannot be undone.')) {
                fetch('<?php echo rest_url('ultra-card/v1/backups/'); ?>' + id, {
                    method: 'DELETE',
                    headers: {
                        'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
                    }
                }).then(response => {
                    if (response.ok) {
                        location.reload();
                    } else {
                        alert('Failed to delete backup');
                    }
                });
            }
        }
        </script>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Render Ultra Card Membership panel content
     * Shows WooCommerce subscription and billing info
     */
    private function render_membership_panel_content($link) {
        $user_id = get_current_user_id();
        
        // Check if cloud_sync is available
        if (!$this->cloud_sync) {
            return '<p>Cloud sync service not available.</p>';
        }
        
        $subscription_data = $this->cloud_sync->get_user_subscription_data($user_id);
        $wc_subscription = isset($subscription_data['woocommerce']) ? $subscription_data['woocommerce'] : null;
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Ultra Card Membership Panel - Link: " . var_export($link, true));
            error_log("Ultra Card Membership Panel - User ID: " . $user_id);
            error_log("Ultra Card Membership Panel - Has WC Subscription: " . ($wc_subscription ? 'yes' : 'no'));
            error_log("Ultra Card Membership Panel - Subscription Data: " . print_r($subscription_data, true));
        }
        
        ob_start();
        ?>
        <div class="ucp-membership-panel">
            <style>
                .ucp-membership-panel {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .ucp-membership-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 32px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                }
                .ucp-membership-status {
                    display: inline-block;
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 20px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 14px;
                }
                .ucp-subscription-card {
                    background: white;
                    border-radius: 12px;
                    padding: 28px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    margin-bottom: 24px;
                }
                .ucp-subscription-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                    margin-top: 20px;
                }
                .ucp-sub-item {
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .ucp-sub-item-label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .ucp-sub-item-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                }
                .ucp-invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ucp-invoice-table thead {
                    background: #f8f9fa;
                }
                .ucp-invoice-table th {
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #666;
                    font-size: 14px;
                }
                .ucp-invoice-table td {
                    padding: 16px 12px;
                    border-bottom: 1px solid #e9ecef;
                }
                .ucp-invoice-actions {
                    display: flex;
                    gap: 8px;
                }
                .ucp-btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .ucp-btn-primary {
                    background: #667eea;
                    color: white;
                }
                .ucp-btn-primary:hover {
                    background: #5568d3;
                }
                .ucp-btn-secondary {
                    background: #e9ecef;
                    color: #495057;
                }
                .ucp-btn-secondary:hover {
                    background: #dee2e6;
                }
                .ucp-status-badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .ucp-status-active { background: #d4edda; color: #155724; }
                .ucp-status-on-hold { background: #fff3cd; color: #856404; }
                .ucp-status-cancelled { background: #f8d7da; color: #721c24; }
                .ucp-status-expired { background: #f8d7da; color: #721c24; }
                .ucp-status-completed { background: #d4edda; color: #155724; }
                .ucp-status-processing { background: #d1ecf1; color: #0c5460; }
            </style>
            
            <?php if ($link === 'billing'): ?>
                <!-- Billing History -->
                <div class="ucp-subscription-card">
                    <h3><i class="fas fa-file-invoice-dollar"></i> Billing History</h3>
                    <?php
                    $invoices = $this->cloud_sync->get_user_invoices($user_id, 20);
                    
                    // Debug logging
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("Ultra Card Billing History - Found " . count($invoices) . " invoices for user " . $user_id);
                    }
                    
                    if (!empty($invoices)): ?>
                        <table class="ucp-invoice-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment Method</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($invoices as $invoice): ?>
                                    <tr>
                                        <td><?php echo esc_html($invoice['order_id']); ?></td>
                                        <td><?php echo date('M d, Y', strtotime($invoice['date'])); ?></td>
                                        <td><?php echo esc_html($invoice['currency'] . ' ' . $invoice['total']); ?></td>
                                        <td>
                                            <span class="ucp-status-badge ucp-status-<?php echo esc_attr($invoice['status']); ?>">
                                                <?php echo esc_html($invoice['status']); ?>
                                            </span>
                                        </td>
                                        <td><?php echo esc_html($invoice['payment_method']); ?></td>
                                        <td class="ucp-invoice-actions">
                                            <a href="<?php echo esc_url($invoice['invoice_url']); ?>" class="ucp-btn ucp-btn-secondary" target="_blank">
                                                <i class="fas fa-eye"></i> View
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p style="text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-receipt" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
                            No invoices found.
                        </p>
                    <?php endif; ?>
                </div>
            <?php else: ?>
                <!-- Subscription Details -->
                <div class="ucp-membership-header">
                    <span class="ucp-membership-status">
                        <?php echo esc_html(strtoupper($subscription_data['tier'])); ?> MEMBER
                    </span>
                    <h2><?php echo $subscription_data['tier'] === 'pro' ? 'Ultra Card Pro' : 'Ultra Card Free'; ?></h2>
                    <p><?php echo $subscription_data['tier'] === 'pro' ? 'Thank you for being a Pro member!' : 'Upgrade to Pro for advanced features!'; ?></p>
                </div>
                
                <?php if ($wc_subscription): ?>
                    <div class="ucp-subscription-card">
                        <h3><i class="fas fa-star"></i> Subscription Details</h3>
                        <div class="ucp-subscription-grid">
                            <div class="ucp-sub-item">
                                <div class="ucp-sub-item-label">Status</div>
                                <div class="ucp-sub-item-value">
                                    <span class="ucp-status-badge ucp-status-<?php echo esc_attr($wc_subscription['status']); ?>">
                                        <?php echo esc_html($wc_subscription['status']); ?>
                                    </span>
                                </div>
                            </div>
                            <?php if ($wc_subscription['next_payment_date']): ?>
                                <div class="ucp-sub-item">
                                    <div class="ucp-sub-item-label">Next Payment</div>
                                    <div class="ucp-sub-item-value">
                                        <?php echo date('M d, Y', strtotime($wc_subscription['next_payment_date'])); ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                            <?php if ($wc_subscription['last_payment_date']): ?>
                                <div class="ucp-sub-item">
                                    <div class="ucp-sub-item-label">Last Payment</div>
                                    <div class="ucp-sub-item-value">
                                        <?php echo date('M d, Y', strtotime($wc_subscription['last_payment_date'])); ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                            <div class="ucp-sub-item">
                                <div class="ucp-sub-item-label">Amount</div>
                                <div class="ucp-sub-item-value">
                                    <?php echo esc_html($wc_subscription['currency'] . ' ' . $wc_subscription['total']); ?>
                                    /<?php echo esc_html($wc_subscription['billing_period']); ?>
                                </div>
                            </div>
                            <div class="ucp-sub-item">
                                <div class="ucp-sub-item-label">Payment Method</div>
                                <div class="ucp-sub-item-value">
                                    <?php echo esc_html($wc_subscription['payment_method_title']); ?>
                                </div>
                            </div>
                            <div class="ucp-sub-item">
                                <div class="ucp-sub-item-label">Start Date</div>
                                <div class="ucp-sub-item-value">
                                    <?php echo date('M d, Y', strtotime($wc_subscription['start_date'])); ?>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Subscription Management Actions -->
                        <div style="margin-top: 32px;">
                            <h4 style="margin-bottom: 16px; color: #666;">Manage Your Subscription</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                                <?php if ($wc_subscription['status'] === 'active'): ?>
                                    <a href="<?php echo esc_url(wc_get_account_endpoint_url('payment-methods')); ?>" class="ucp-btn ucp-btn-primary" style="display: inline-block; text-align: center;">
                                        <i class="fas fa-credit-card"></i> Update Payment Method
                                    </a>
                                    <a href="<?php echo esc_url($wc_subscription['view_subscription_url']); ?>" class="ucp-btn ucp-btn-secondary" style="display: inline-block; text-align: center;" target="_blank">
                                        <i class="fas fa-pause"></i> Pause Subscription
                                    </a>
                                    <a href="<?php echo esc_url($wc_subscription['view_subscription_url']); ?>" class="ucp-btn ucp-btn-secondary" style="display: inline-block; text-align: center; background: #f8d7da; color: #721c24;" onclick="return confirm('Are you sure you want to cancel your subscription?');">
                                        <i class="fas fa-times-circle"></i> Cancel Subscription
                                    </a>
                                <?php elseif ($wc_subscription['status'] === 'on-hold'): ?>
                                    <a href="<?php echo esc_url($wc_subscription['view_subscription_url']); ?>" class="ucp-btn ucp-btn-primary" style="display: inline-block; text-align: center;">
                                        <i class="fas fa-play"></i> Reactivate Subscription
                                    </a>
                                    <a href="<?php echo esc_url(wc_get_account_endpoint_url('payment-methods')); ?>" class="ucp-btn ucp-btn-secondary" style="display: inline-block; text-align: center;">
                                        <i class="fas fa-credit-card"></i> Update Payment Method
                                    </a>
                                <?php elseif ($wc_subscription['status'] === 'cancelled' || $wc_subscription['status'] === 'expired'): ?>
                                    <a href="https://ultracard.io/product/ultra-card-pro/" class="ucp-btn ucp-btn-primary" style="display: inline-block; text-align: center;">
                                        <i class="fas fa-redo"></i> Resubscribe to Pro
                                    </a>
                                <?php endif; ?>
                                <a href="<?php echo esc_url(wc_get_account_endpoint_url('edit-address/billing')); ?>" class="ucp-btn ucp-btn-secondary" style="display: inline-block; text-align: center;">
                                    <i class="fas fa-map-marker-alt"></i> Update Billing Address
                                </a>
                            </div>
                        </div>
                        
                        <!-- Full WooCommerce Details Link -->
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e9ecef; text-align: center;">
                            <p style="color: #666; font-size: 14px; margin-bottom: 12px;">Need more options?</p>
                            <a href="<?php echo esc_url($wc_subscription['view_subscription_url']); ?>" class="ucp-btn ucp-btn-secondary" target="_blank" style="display: inline-block;">
                                <i class="fas fa-external-link-alt"></i> View Full Subscription Details
                            </a>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="ucp-subscription-card" style="text-align: center; padding: 40px;">
                        <h3>No Active Subscription</h3>
                        <p>Upgrade to Ultra Card Pro to unlock premium features!</p>
                        <a href="https://ultracard.io/product/ultra-card-pro/" class="ucp-btn ucp-btn-primary" target="_blank">
                            <i class="fas fa-star"></i> Subscribe to Pro - $4.99/month
                        </a>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Register panel settings (empty for our use case)
     * This tells Directories Pro we don't need any custom settings
     */
    public function register_panel_settings($settings, $name, $current_settings) {
        // Handle both Ultra Card panels
        if ($name === 'ultra_card_backups' || $name === 'ultra_card_membership') {
            // Return empty array - we don't need any custom settings
            return array();
        }
        
        return $settings;
    }
    
    /**
     * Enqueue dashboard assets (CSS & JS)
     */
    public function enqueue_dashboard_assets() {
        // Only enqueue if active and on dashboard pages
        if (!$this->is_active || !is_user_logged_in()) {
            return;
        }
        
        // For now, we'll just use inline styles since the CSS is already in the old method
        // This is a stub - assets will be loaded inline in the panel content
    }
    
    /**
     * OLD DEBUG METHOD - KEEPING FOR REFERENCE BUT NOT USED
     */
    private function debug_directories_pro_old() {
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
    // Initialize the main cloud sync service
    global $ultra_card_cloud_sync;
    if (!$ultra_card_cloud_sync) {
        $ultra_card_cloud_sync = new UltraCardCloudSync();
    }
    
    // Initialize the dashboard integration (only if Directories Pro is active)
    if (class_exists('SabaiApps\\Directories\\Application')) {
        // Use a global variable to ensure single instance
        global $ultra_card_dashboard_integration;
        if (!$ultra_card_dashboard_integration) {
            $ultra_card_dashboard_integration = new UltraCardDashboardIntegration($ultra_card_cloud_sync);
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
