<?php
/**
 * Plugin Name: Ultra Card Integration
 * Plugin URI: https://ultracard.io
 * Description: Complete Ultra Card integration for WordPress - includes cloud sync functionality and Directories Pro dashboard panels for managing favorites, colors, and reviews.
 * Version: 1.3.21
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
define('ULTRA_CARD_INTEGRATION_VERSION', '1.3.21');
define('ULTRA_CARD_INTEGRATION_PLUGIN_FILE', __FILE__);
define('ULTRA_CARD_INTEGRATION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ULTRA_CARD_INTEGRATION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ULTRA_CARD_INTEGRATION_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Native preset authoring (absorbed WPCode snippets, author API, moderation, cutover).
$uc_preset_authoring = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'includes/uc-preset-authoring.php';
if (file_exists($uc_preset_authoring)) {
    require_once $uc_preset_authoring;
}

// Website harness: shortcode delivery of website/*.html fragments + admin diagnostics.
// Skip with: define('ULTRA_CARD_DISABLE_HARNESS', true); in wp-config.php
if (!defined('ULTRA_CARD_DISABLE_HARNESS') || !ULTRA_CARD_DISABLE_HARNESS) {
    $uc_website_harness = ULTRA_CARD_INTEGRATION_PLUGIN_DIR . 'includes/uc-website-harness.php';
    if (file_exists($uc_website_harness)) {
        require_once $uc_website_harness;
    }
}

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
        add_action('init', array($this, 'schedule_session_cleanup'));
        add_action('ultra_card_cleanup_sessions', array($this, 'prune_old_sessions'));
        
        // JWT Authentication - Ensure user_id is in response
        add_filter('jwt_auth_token_before_dispatch', array($this, 'add_user_id_to_jwt_response'), 10, 2);
        
        // Extend JWT token lifetime to 30 days so users stay signed in across sessions
        add_filter('jwt_auth_expire', array($this, 'set_jwt_token_expiry'), 10, 1);
        
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
    
    /**
     * Schedule daily session cleanup cron job
     */
    public function schedule_session_cleanup() {
        if (!wp_next_scheduled('ultra_card_cleanup_sessions')) {
            wp_schedule_event(time(), 'daily', 'ultra_card_cleanup_sessions');
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
        
        // Assign Discord role if user has Discord connected
        global $ultra_card_discord_integration;
        if ($ultra_card_discord_integration) {
            $discord_id = $ultra_card_discord_integration->get_user_discord_id($user_id);
            if ($discord_id) {
                $ultra_card_discord_integration->assign_role($discord_id);
            }
        }
        
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
            
            // Remove Discord role if user has Discord connected
            global $ultra_card_discord_integration;
            if ($ultra_card_discord_integration) {
                $discord_id = $ultra_card_discord_integration->get_user_discord_id($user_id);
                if ($discord_id) {
                    $ultra_card_discord_integration->remove_role($discord_id);
                }
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Revoked Pro access from user {$user_id}");
            }
        }
    }
    
    /**
     * Add user_id to JWT authentication response
     * Fixes authentication persistence issue where user_id was missing
     * @param array $data The response data
     * @param WP_User $user The authenticated user
     * @return array Modified response data
     */
    public function add_user_id_to_jwt_response($data, $user) {
        // Ensure user_id is always in the response (frontend needs this!)
        if (!isset($data['user_id']) && isset($user->ID)) {
            $data['user_id'] = $user->ID;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: JWT response - user_id=' . ($data['user_id'] ?? 'MISSING'));
        }
        
        return $data;
    }
    
    /**
     * Return the list of preset categories available on the site.
     * Matches ultracard.io/modules categories (Layout, Content, Data, Controls, Inputs, Media).
     */
    public function get_preset_categories($request) {
        if (function_exists('uc_ensure_preset_module_category_terms')) {
            uc_ensure_preset_module_category_terms();
        }
        if (function_exists('uc_preset_module_categories')) {
            $categories = array();
            foreach (uc_preset_module_categories() as $cat) {
                $categories[] = array(
                    'value' => $cat['value'],
                    'label' => $cat['label'],
                    'icon'  => isset($cat['icon']) ? $cat['icon'] : '',
                );
            }
            return rest_ensure_response($categories);
        }

        // Fallback if authoring helpers are unavailable.
        return rest_ensure_response(array(
            array('value' => 'layout', 'label' => 'Layout', 'icon' => 'mdi-view-dashboard-outline'),
            array('value' => 'content', 'label' => 'Content', 'icon' => 'mdi-text-box-outline'),
            array('value' => 'data', 'label' => 'Data', 'icon' => 'mdi-chart-box-outline'),
            array('value' => 'interactive', 'label' => 'Controls', 'icon' => 'mdi-gesture-tap'),
            array('value' => 'input', 'label' => 'Inputs', 'icon' => 'mdi-form-textbox'),
            array('value' => 'media', 'label' => 'Media', 'icon' => 'mdi-image-multiple-outline'),
        ));
    }

    /**
     * POST /ultra-card/v1/media
     * Uploads a single image file and returns its attachment ID and URL.
     * Called once per photo before submitting a preset so the frontend can
     * show individual upload progress to the user.
     */
    public function upload_preset_media($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }

        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';

        $files = $request->get_file_params();
        if (empty($files['photo']) || empty($files['photo']['tmp_name'])) {
            return new WP_Error('missing_file', 'No photo provided', array('status' => 400));
        }

        $file = $files['photo'];
        // Reject arrays (only one file per call)
        if (is_array($file['tmp_name'])) {
            return new WP_Error('invalid_file', 'Send one file per request', array('status' => 400));
        }

        $attachment_id = media_handle_sideload($file, 0);
        if (is_wp_error($attachment_id)) {
            return new WP_Error('upload_failed', $attachment_id->get_error_message(), array('status' => 500));
        }

        return rest_ensure_response(array(
            'id'  => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id),
        ));
    }

    /**
     * POST /ultra-card/v1/presets
     * Accepts a user-submitted preset and creates it as a pending WordPress post for review.
     */
    public function submit_preset($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }

        $name        = sanitize_text_field($request->get_param('name') ?: '');
        $description = wp_kses_post($request->get_param('description') ?: '');
        $category    = sanitize_text_field($request->get_param('category') ?: '');
        $shortcode   = sanitize_textarea_field($request->get_param('shortcode') ?: '');
        $tags        = sanitize_text_field($request->get_param('tags') ?: '');
        $source      = sanitize_text_field($request->get_param('source') ?: 'community');
        $integrations = sanitize_text_field($request->get_param('integrations') ?: '');

        if (empty($name)) {
            return new WP_Error('missing_field', 'Preset name is required', array('status' => 400));
        }
        if (empty($shortcode)) {
            return new WP_Error('missing_field', 'Preset code is required', array('status' => 400));
        }

        // Determine which post type to use (prefer native after cutover)
        if (function_exists('uc_preset_post_type')) {
            $post_type = uc_preset_post_type();
        } else {
            $post_type = 'post';
            foreach (array('ultra_preset', 'presets_dir_ltg', 'presets') as $pt) {
                if (post_type_exists($pt)) {
                    $post_type = $pt;
                    break;
                }
            }
        }

        $post_id = wp_insert_post(array(
            'post_title'   => $name,
            'post_content' => $description,
            'post_status'  => 'pending',
            'post_type'    => $post_type,
            'post_author'  => $user_id,
        ), true);

        if (is_wp_error($post_id)) {
            return new WP_Error('insert_failed', $post_id->get_error_message(), array('status' => 500));
        }

        // Save preset code — confirmed Directories Pro meta keys from runtime debug (sample preset ID 517)
        update_post_meta($post_id, '_drts_field_preset_code', $shortcode);
        update_post_meta($post_id, 'preset_code',             $shortcode);
        update_post_meta($post_id, '_ultra_card_submitted_by', $user_id);

        // Native authoring meta (Hub My Presets / moderation queue).
        update_post_meta($post_id, '_uc_preset_code', $shortcode);
        update_post_meta($post_id, '_uc_review_status', 'pending');
        update_post_meta($post_id, '_uc_submitted_at', current_time('mysql'));
        if (!empty($integrations)) {
            update_post_meta($post_id, '_uc_integrations', $integrations);
        }
        if (function_exists('uc_set_preset_shortcode')) {
            uc_set_preset_shortcode($post_id, $shortcode);
        }

        // Update Directories Pro entity meta blob so its display layer reads our values.
        // Merge our fields into any existing blob rather than overwriting Directories Pro's internal keys.
        $existing_entity_meta = get_post_meta($post_id, '_drts_entity_meta', true);
        $entity_meta = is_array($existing_entity_meta) ? $existing_entity_meta : array();
        $entity_meta['preset_code'] = array($shortcode);
        update_post_meta($post_id, '_drts_entity_meta', $entity_meta);
        update_post_meta($post_id, 'drts_entity_meta',  $entity_meta);

        // Category — confirmed taxonomy: presets_dir_cat
        if ($category && taxonomy_exists('presets_dir_cat')) {
            $cat_term = get_term_by('slug', $category, 'presets_dir_cat');
            if (!$cat_term) {
                // Try singular form (e.g. "layouts" → "layout")
                $cat_term = get_term_by('slug', rtrim($category, 's'), 'presets_dir_cat');
            }
            if (!$cat_term) {
                $cat_term = get_term_by('name', $category, 'presets_dir_cat');
            }
            if ($cat_term) {
                wp_set_post_terms($post_id, array($cat_term->term_id), 'presets_dir_cat');
            }
        }

        // Native taxonomies (module-aligned categories + tags) when available.
        if (function_exists('uc_apply_preset_taxonomies')) {
            uc_apply_preset_taxonomies($post_id, $category, $tags);
        }

        // Tags — confirmed taxonomy: presets_dir_tag
        if ($tags && taxonomy_exists('presets_dir_tag')) {
            $tag_names = array_filter(array_map('trim', explode(',', $tags)));
            if (!empty($tag_names)) {
                wp_set_post_terms($post_id, $tag_names, 'presets_dir_tag', false);
            }
        }

        // Source — confirmed taxonomy: presets_dct_source
        if ($source && taxonomy_exists('presets_dct_source')) {
            $source_term = get_term_by('slug', $source, 'presets_dct_source');
            if (!$source_term) {
                $source_term = get_term_by('name', $source, 'presets_dct_source');
            }
            if (!$source_term) {
                $new_source = wp_insert_term(ucfirst($source), 'presets_dct_source', array('slug' => $source));
                if (!is_wp_error($new_source)) {
                    $source_term = get_term($new_source['term_id'], 'presets_dct_source');
                }
            }
            if ($source_term && !is_wp_error($source_term)) {
                wp_set_post_terms($post_id, array($source_term->term_id), 'presets_dct_source');
            }
        }

        // Integrations — confirmed taxonomy: presets_dct_integration
        if ($integrations && taxonomy_exists('presets_dct_integration')) {
            $int_names   = array_filter(array_map('trim', explode(',', $integrations)));
            $int_term_ids = array();
            foreach ($int_names as $int_name) {
                $term = get_term_by('name', $int_name, 'presets_dct_integration');
                if (!$term) {
                    $term = get_term_by('slug', sanitize_title($int_name), 'presets_dct_integration');
                }
                if (!$term) {
                    $new_term = wp_insert_term($int_name, 'presets_dct_integration');
                    if (!is_wp_error($new_term)) {
                        $term = get_term($new_term['term_id'], 'presets_dct_integration');
                    }
                }
                if ($term && !is_wp_error($term)) {
                    $int_term_ids[] = $term->term_id;
                }
            }
            if (!empty($int_term_ids)) {
                wp_set_post_terms($post_id, $int_term_ids, 'presets_dct_integration');
            }
        }

        // Featured image (required) + optional gallery photos.
        $featured_id = intval($request->get_param('featured_image_id') ?: 0);
        $photo_ids   = array();

        // 1. Pre-uploaded gallery IDs from the per-photo upload endpoint
        $photo_ids_param = $request->get_param('photo_ids');
        if (!empty($photo_ids_param)) {
            $raw_ids = is_array($photo_ids_param)
                ? $photo_ids_param
                : explode(',', $photo_ids_param);
            foreach ($raw_ids as $raw_id) {
                $aid = intval($raw_id);
                if ($aid > 0) {
                    $photo_ids[] = $aid;
                }
            }
        }

        // 2. Fallback: raw file uploads (legacy path)
        $files = $request->get_file_params();
        if (!empty($files)) {
            require_once ABSPATH . 'wp-admin/includes/image.php';
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';

            foreach ($files as $key => $file) {
                if (strpos($key, 'photos') === false && strpos($key, 'featured') === false) continue;

                $file_list = array();
                if (isset($file['name']) && is_array($file['name'])) {
                    $count = count($file['name']);
                    for ($i = 0; $i < $count; $i++) {
                        $file_list[] = array(
                            'name'     => $file['name'][$i],
                            'type'     => $file['type'][$i],
                            'tmp_name' => $file['tmp_name'][$i],
                            'error'    => $file['error'][$i],
                            'size'     => $file['size'][$i],
                        );
                    }
                } elseif (isset($file['tmp_name']) && !empty($file['tmp_name'])) {
                    $file_list[] = $file;
                }

                foreach ($file_list as $single_file) {
                    if (empty($single_file['tmp_name'])) continue;
                    $attachment_id = media_handle_sideload($single_file, $post_id);
                    if (is_wp_error($attachment_id)) continue;
                    if (strpos($key, 'featured') !== false && !$featured_id) {
                        $featured_id = (int) $attachment_id;
                    } else {
                        $photo_ids[] = $attachment_id;
                    }
                }
            }
        }

        // Legacy clients: first photo_id is the featured image when none was sent.
        if (!$featured_id && !empty($photo_ids)) {
            $featured_id = (int) array_shift($photo_ids);
        }

        if (!$featured_id) {
            wp_delete_post($post_id, true);
            return new WP_Error('missing_field', 'Featured image is required', array('status' => 400));
        }

        if (function_exists('uc_set_preset_images')) {
            uc_set_preset_images($post_id, $featured_id, $photo_ids);
        } else {
            $all = array_merge(array($featured_id), $photo_ids);
            set_post_thumbnail($post_id, $featured_id);
            update_post_meta($post_id, '_drts_directory_photos', $all);
            update_post_meta($post_id, '_uc_photo_ids', $all);
            foreach ($all as $aid) {
                wp_update_post(array('ID' => $aid, 'post_parent' => $post_id));
            }
        }

        return rest_ensure_response(array(
            'id'      => $post_id,
            'status'  => 'pending',
            'review_status' => 'pending',
            'message' => 'Your preset has been submitted and is pending review. Thank you!',
        ));
    }

    /**
     * Set JWT token expiry to 30 days so users stay signed in across sessions.
     * The default JWT Auth Pro expiry is often 1 hour, which causes frequent sign-outs.
     *
     * @param int $expire Unix timestamp (seconds) of expiry
     * @return int Extended expiry timestamp
     */
    public function set_jwt_token_expiry($expire) {
        return time() + (30 * DAY_IN_SECONDS); // 30 days
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
                    'end_date' => $subscription->get_date('end'),
                    'billing_period' => $subscription->get_billing_period(),
                    'billing_interval' => $subscription->get_billing_interval(),
                    'total' => $subscription->get_total(),
                    'formatted_total' => function_exists('wc_price')
                        ? html_entity_decode(wp_strip_all_tags(wc_price($subscription->get_total(), array('currency' => $subscription->get_currency()))))
                        : ($subscription->get_currency() . ' ' . $subscription->get_total()),
                    'currency' => $subscription->get_currency(),
                    'payment_method_title' => $subscription->get_payment_method_title(),
                    'view_subscription_url' => $subscription->get_view_order_url(),
                    'subscription_id' => $subscription->get_id(),
                    'manage_subscription_url' => function_exists('wc_get_account_endpoint_url')
                        ? wc_get_account_endpoint_url('view-subscription', $subscription->get_id())
                        : $subscription->get_view_order_url(),
                    'subscriptions_url' => function_exists('wc_get_account_endpoint_url')
                        ? wc_get_account_endpoint_url('subscriptions')
                        : home_url('/my-account/subscriptions/'),
                    'payment_methods_url' => function_exists('wc_get_account_endpoint_url')
                        ? wc_get_account_endpoint_url('payment-methods')
                        : home_url('/my-account/payment-methods/'),
                    'billing_address_url' => function_exists('wc_get_endpoint_url')
                        ? wc_get_endpoint_url('edit-address', 'billing', wc_get_page_permalink('myaccount'))
                        : home_url('/my-account/edit-address/billing/'),
                    'orders_url' => function_exists('wc_get_account_endpoint_url')
                        ? wc_get_account_endpoint_url('orders')
                        : home_url('/my-account/orders/'),
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
        
        register_rest_route('ultra-card/v1', '/backups/(?P<id>\d+)/download', array(
            'methods' => 'GET',
            'callback' => array($this, 'download_backup'),
            'permission_callback' => array($this, 'check_download_permission'), // Cookie + JWT auth
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
        
        // Session Sync endpoints (for cross-device authentication)
        register_rest_route('ultra-card/v1', '/session/create', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_session'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        register_rest_route('ultra-card/v1', '/session/current', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_current_session'),
            'permission_callback' => '__return_true', // Public endpoint, validates via JWT token in header
        ));
        
        register_rest_route('ultra-card/v1', '/session/validate', array(
            'methods' => 'POST',
            'callback' => array($this, 'validate_session'),
            'permission_callback' => '__return_true', // Public endpoint, validates via JWT token in header
        ));
        
        register_rest_route('ultra-card/v1', '/session/logout', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'logout_session'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        // Public endpoint — returns the list of preset categories from the site
        register_rest_route('ultra-card/v1', '/preset-categories', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_preset_categories'),
            'permission_callback' => '__return_true',
        ));

        // Single-photo upload (called per-photo before submitting a preset)
        register_rest_route('ultra-card/v1', '/media', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'upload_preset_media'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        // Submit a user preset for review
        register_rest_route('ultra-card/v1', '/presets', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'submit_preset'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        // Public registration endpoint – creates a WP user and emails password setup instructions
        register_rest_route('ultra-card/v1', '/register', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'register_user'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'username'     => array('required' => true,  'type' => 'string', 'sanitize_callback' => 'sanitize_user'),
                'email'        => array('required' => true,  'type' => 'string', 'sanitize_callback' => 'sanitize_email'),
                'display_name' => array('required' => false, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field'),
            ),
        ));
    }
    
    /**
     * Add CORS support for REST API
     * Smart CORS handling that allows any Home Assistant instance (port 8123)
     */
    public function add_cors_support() {
        // Add CORS headers using WordPress filters
        add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
            // Read origin directly from HTTP headers (not cached)
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
            
            // Validate if this is a Home Assistant instance
            $is_home_assistant = false;
            
            if ($origin) {
                $parsed = parse_url($origin);
                
                if ($parsed && isset($parsed['port']) && $parsed['port'] == 8123) {
                    // Any IP/domain with port 8123 is a Home Assistant instance
                    $is_home_assistant = true;
                } elseif ($parsed && !isset($parsed['port'])) {
                    // Check for common HA domains without explicit port
                    $host = $parsed['host'] ?? '';
                    if (in_array($host, ['homeassistant.local', 'localhost', '127.0.0.1'])) {
                        $is_home_assistant = true;
                    }
                }
            }
            
            if ($is_home_assistant && $origin) {
                // Return the exact requesting origin for HA instances
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Credentials: true');
            } elseif ($origin) {
                // For non-HA requests with an origin, return that origin (no wildcard with credentials)
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Credentials: false');
            } else {
                // Only use wildcard when no origin provided (and no credentials)
                header('Access-Control-Allow-Origin: *');
                header('Access-Control-Allow-Credentials: false');
            }
            
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce');
            
            return $served;
        }, 10, 4);
        
        // Handle OPTIONS preflight requests
        add_action('init', function() {
            if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
                // Read origin directly for OPTIONS requests too
                $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
                
                // Always allow Home Assistant origins (port 8123) or local IPs
                if ($origin) {
                    $parsed = parse_url($origin);
                    $is_ha = $parsed && isset($parsed['port']) && $parsed['port'] == 8123;
                    $is_local_ip = $parsed && isset($parsed['host']) && 
                                   (strpos($parsed['host'], '192.168.') === 0 || 
                                    strpos($parsed['host'], '10.') === 0 || 
                                    strpos($parsed['host'], '172.') === 0 ||
                                    $parsed['host'] === 'localhost' ||
                                    strpos($parsed['host'], '127.0.') === 0);
                    
                    if ($is_ha || $is_local_ip) {
                        header('Access-Control-Allow-Origin: ' . $origin);
                        header('Access-Control-Allow-Credentials: true');
                    } else {
                        header('Access-Control-Allow-Origin: ' . $origin);
                        header('Access-Control-Allow-Credentials: false');
                    }
                } else {
                    header('Access-Control-Allow-Origin: *');
                    header('Access-Control-Allow-Credentials: false');
                }
                
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
     * Supports both cookie-based (WordPress dashboard) and JWT authentication (REST API from apps)
     */
    public function check_user_permission($request) {
        $user_id = get_current_user_id();
        
        // Allow if user is logged into WordPress (via cookies)
        if (is_user_logged_in() && current_user_can('read')) {
            // Track Ultra Card login time
            $this->track_ultra_card_login($user_id);
            return true;
        }
        
        // Also allow if authenticated via JWT (for API access from companion apps)
        if ($user_id > 0) {
            // Track Ultra Card login time
            $this->track_ultra_card_login($user_id);
            return true;
        }
        
        return false;
    }
    
    /**
     * Get user ID from JWT token in Authorization header
     * Used for session endpoints that need manual JWT validation
     */
    private function get_user_id_from_jwt_token($request) {
        // Check if JWT Auth plugin is active
        if (!function_exists('jwt_auth_validate_token')) {
            // Fallback to WordPress auth if JWT plugin not available
            return get_current_user_id();
        }
        
        // Get Authorization header
        $auth_header = $request->get_header('Authorization');
        
        if (!$auth_header || strpos($auth_header, 'Bearer ') !== 0) {
            // No JWT token, try WordPress auth
            return get_current_user_id();
        }
        
        // Extract token from "Bearer {token}"
        $token = substr($auth_header, 7);
        
        // Validate JWT token using JWT Auth plugin
        try {
            $decoded = jwt_auth_validate_token($token);
            if ($decoded && isset($decoded->data->user->id)) {
                return $decoded->data->user->id;
            }
        } catch (Exception $e) {
            // Token invalid
            return 0;
        }
        
        return 0;
    }
    
    /**
     * Track Ultra Card login time for analytics
     */
    private function track_ultra_card_login($user_id) {
        if (!$user_id || $user_id <= 0) {
            return;
        }
        
        // Only update login time if it's been more than 5 minutes since last update
        // This prevents excessive database writes on every API call
        $last_login = get_user_meta($user_id, 'ultra_card_last_login', true);
        $now = current_time('timestamp');
        
        if (!$last_login || ($now - strtotime($last_login)) > 300) { // 5 minutes = 300 seconds
            update_user_meta($user_id, 'ultra_card_last_login', current_time('mysql'));
        }
    }
    
    /**
     * Permission callback for download endpoint
     * Allows downloads for logged-in users via WordPress admin cookies
     */
    public function check_download_permission($request) {
        // Allow if user is logged into WordPress (via cookies)
        if (is_user_logged_in()) {
            return true;
        }
        
        // Also allow if authenticated via JWT (for API access)
        if (get_current_user_id() > 0) {
            return true;
        }
        
        return false;
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
        
        // Save metadata — Hub sends row_data; older clients may send data/type.
        $payload = $this->normalize_favorite_payload($data);
        update_post_meta($post_id, 'favorite_type', $payload['type']);
        update_post_meta($post_id, 'favorite_data', wp_json_encode($payload['data']));
        if (!empty($payload['tags'])) {
            update_post_meta($post_id, 'favorite_tags', wp_json_encode($payload['tags']));
        }

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
        
        $payload = $this->normalize_favorite_payload($data);
        update_post_meta($id, 'favorite_type', $payload['type']);
        update_post_meta($id, 'favorite_data', wp_json_encode($payload['data']));
        if (array_key_exists('tags', $data) || isset($payload['tags'])) {
            update_post_meta($id, 'favorite_tags', wp_json_encode($payload['tags']));
        }

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
    
    /**
     * Read a preset ID that may arrive as `wp-1234`.
     *
     * The Home Assistant card keys presets that way internally, and released
     * builds post it verbatim; a plain intval() reads that as 0 and drops the
     * vote. Accepted here so existing installs work without a card update.
     */
    private function _parse_preset_id($raw) {
        return (int) preg_replace('/^wp-/', '', (string) $raw);
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
        $user_id   = get_current_user_id();
        $data      = $request->get_json_params();
        $preset_id = $this->_parse_preset_id($data['preset_id'] ?? 0);
        $rating    = max(1, min(5, intval($data['rating'] ?? 0)));
        $comment   = sanitize_textarea_field($data['comment'] ?? '');

        if (!$preset_id || !$rating) {
            return new WP_Error('invalid_data', 'preset_id and rating are required', array('status' => 400));
        }

        // Keep junk out of the aggregate: only real presets can be rated.
        if (function_exists('uc_is_preset_post') && !uc_is_preset_post($preset_id)) {
            return new WP_Error('invalid_preset', 'Preset not found', array('status' => 404));
        }

        // Upsert: check if the user already has a review for this preset
        $existing = get_posts(array(
            'post_type'   => 'ultra_review',
            'author'      => $user_id,
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'meta_query'  => array(
                array('key' => 'preset_id', 'value' => $preset_id, 'compare' => '='),
            ),
        ));

        if (!empty($existing)) {
            // Update existing review
            $post_id = $existing[0]->ID;
            wp_update_post(array(
                'ID'           => $post_id,
                'post_content' => $comment,
            ));
        } else {
            $post_id = wp_insert_post(array(
                'post_type'    => 'ultra_review',
                'post_title'   => 'Review for preset ' . $preset_id,
                'post_content' => $comment,
                'post_status'  => 'publish',
                'post_author'  => $user_id,
            ));

            if (is_wp_error($post_id)) {
                return new WP_Error('create_failed', 'Failed to create review', array('status' => 500));
            }

            update_post_meta($post_id, 'preset_id', $preset_id);
        }

        update_post_meta($post_id, 'rating', $rating);

        // Sync aggregate back to the DRTS preset so ultracard.io reflects UC votes
        $this->_sync_reviews_to_drts_rating($preset_id);

        $review = get_post($post_id);
        return rest_ensure_response($this->_review_response_with_aggregate($review, $preset_id));
    }
    
    public function update_review($request) {
        $id      = $request['id'];
        $user_id = get_current_user_id();
        $data    = $request->get_json_params();

        $review = get_post($id);
        if (!$review || $review->post_author != $user_id) {
            return new WP_Error('not_found', 'Review not found', array('status' => 404));
        }

        wp_update_post(array(
            'ID'           => $id,
            'post_content' => sanitize_textarea_field($data['comment'] ?? $data['content'] ?? ''),
        ));

        update_post_meta($id, 'rating', max(1, min(5, intval($data['rating'] ?? 0))));

        // Sync aggregate back to DRTS preset
        $preset_id = intval(get_post_meta($id, 'preset_id', true));
        if ($preset_id) {
            $this->_sync_reviews_to_drts_rating($preset_id);
        }

        $review = get_post($id);
        return rest_ensure_response($this->_review_response_with_aggregate($review, $preset_id));
    }
    
    public function delete_review($request) {
        $id      = $request['id'];
        $user_id = get_current_user_id();

        $review = get_post($id);
        if (!$review || $review->post_author != $user_id) {
            return new WP_Error('not_found', 'Review not found', array('status' => 404));
        }

        // Capture preset_id before deletion so we can resync DRTS after
        $preset_id = intval(get_post_meta($id, 'preset_id', true));

        $result = wp_delete_post($id, true);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete review', array('status' => 500));
        }

        // Resync DRTS aggregate now that this vote is gone
        if ($preset_id) {
            $this->_sync_reviews_to_drts_rating($preset_id);
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
     * Download backup/snapshot as JSON file
     * Handles BOTH old compressed backups AND new uncompressed snapshots
     */
    public function download_backup($request) {
        $id = $request['id'];
        
        // Support both cookie-based (WordPress dashboard) and JWT auth (REST API)
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ Download failed: User not authenticated');
            }
            return new WP_Error('unauthorized', 'You must be logged in to download backups', array('status' => 401));
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('📥 Download backup request: ID=' . $id . ', User=' . $user_id);
        }
        
        $backup = get_post($id);
        if (!$backup) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ Backup not found: ID=' . $id);
            }
            return new WP_Error('not_found', 'Backup not found', array('status' => 404));
        }
        
        // Verify ownership
        if ($backup->post_author != $user_id) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ Permission denied: Backup author=' . $backup->post_author . ', Current user=' . $user_id);
            }
            return new WP_Error('forbidden', 'You do not have permission to download this backup', array('status' => 403));
        }
        
        $post_type = get_post_type($id);
        $config_data = null;
        $filename = 'ultra-card-backup-' . date('Y-m-d') . '.json';
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('📦 Backup type: ' . $post_type);
        }
        
        // Determine backup type and extract data
        if ($post_type === 'ultra_snapshot') {
            // NEW SNAPSHOT SYSTEM - Base64-encoded JSON
            $snapshot_data_encoded = get_post_meta($id, 'snapshot_data', true);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('📊 Snapshot data encoded size: ' . strlen($snapshot_data_encoded) . ' bytes');
            }
            
            // Decode base64 (new format as of fix for WordPress character escaping)
            $snapshot_data_json = base64_decode($snapshot_data_encoded, true);
            if ($snapshot_data_json === false) {
                // Not base64 encoded - try direct decode (legacy format)
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('⚠️ Base64 decode failed for snapshot download, trying legacy format');
                }
                $snapshot_data_json = $snapshot_data_encoded;
            } else {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('✅ Base64 decoded for download: ' . strlen($snapshot_data_json) . ' bytes');
                }
            }
            
            $config_data = json_decode($snapshot_data_json, true);
            $filename = 'ultra-card-snapshot-' . date('Y-m-d-His') . '.json';
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                $card_count = isset($config_data['cards']) ? count($config_data['cards']) : 0;
                error_log('📊 Cards in snapshot: ' . $card_count);
            }
        } else {
            // OLD BACKUP SYSTEM - Compressed JSON
            $config_json_compressed = get_post_meta($id, 'config_json', true);
            if ($config_json_compressed) {
                $config_json = @gzuncompress($config_json_compressed);
                if ($config_json) {
                    $config_data = json_decode($config_json, true);
                }
            }
            
            $version = get_post_meta($id, 'version_number', true);
            if ($version) {
                $filename = 'ultra-card-backup-v' . $version . '.json';
            }
        }
        
        if (!$config_data || empty($config_data)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ No config data found or data is empty');
            }
            return new WP_Error('no_data', 'Backup data not found or corrupted', array('status' => 404));
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Download successful: ' . $filename);
        }
        
        // Set headers for file download
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: 0');
        
        // Output JSON and exit
        echo json_encode($config_data, JSON_PRETTY_PRINT);
        exit;
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
     * Handles BOTH old compressed backups (ultra_backup/ultra_card_backup) 
     * AND new uncompressed snapshots (ultra_snapshot)
     */
    public function format_backup_list_item($backup) {
        $post_type = get_post_type($backup->ID);
        
        // NEW SNAPSHOT SYSTEM (ultra_snapshot) - Base64-encoded JSON
        if ($post_type === 'ultra_snapshot') {
            $snapshot_data_encoded = get_post_meta($backup->ID, 'snapshot_data', true);
            
            // Validate encoded data exists
            if (empty($snapshot_data_encoded)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("⚠️ Snapshot {$backup->ID} has no snapshot_data");
                }
                return array(
                    'id' => $backup->ID,
                    'name' => 'Dashboard Snapshot (CORRUPTED)',
                    'type' => get_post_meta($backup->ID, 'snapshot_type', true) ?: 'auto',
                    'created' => $backup->post_date,
                    'card_count' => 0,
                    'views_breakdown' => array(),
                    'size' => '0 KB',
                    'stats' => 'ERROR: No data',
                    'corrupted' => true,
                );
            }
            
            // Decode base64 (new format as of fix for WordPress character escaping)
            $snapshot_data_json = base64_decode($snapshot_data_encoded, true);
            if ($snapshot_data_json === false) {
                // Not base64 encoded - try direct decode (legacy format)
                $snapshot_data_json = $snapshot_data_encoded;
            }
            
            $snapshot_data = json_decode($snapshot_data_json, true);
            
            // Validate JSON decode succeeded
            if ($snapshot_data === null || json_last_error() !== JSON_ERROR_NONE) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("⚠️ Snapshot {$backup->ID} JSON decode failed: " . json_last_error_msg());
                    error_log("   JSON length: " . strlen($snapshot_data_json) . " bytes");
                }
                return array(
                    'id' => $backup->ID,
                    'name' => 'Dashboard Snapshot (CORRUPTED)',
                    'type' => get_post_meta($backup->ID, 'snapshot_type', true) ?: 'auto',
                    'created' => $backup->post_date,
                    'card_count' => 0,
                    'views_breakdown' => array(),
                    'size' => round(strlen($snapshot_data_json) / 1024, 2) . ' KB',
                    'stats' => 'ERROR: ' . json_last_error_msg(),
                    'corrupted' => true,
                );
            }
            
            // Validate cards array exists
            if (!isset($snapshot_data['cards']) || !is_array($snapshot_data['cards'])) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("⚠️ Snapshot {$backup->ID} has no cards array");
                    error_log("   Available keys: " . implode(', ', array_keys($snapshot_data)));
                }
                return array(
                    'id' => $backup->ID,
                    'name' => 'Dashboard Snapshot (INVALID)',
                    'type' => get_post_meta($backup->ID, 'snapshot_type', true) ?: 'auto',
                    'created' => $backup->post_date,
                    'card_count' => 0,
                    'views_breakdown' => array(),
                    'size' => round(strlen($snapshot_data_json) / 1024, 2) . ' KB',
                    'stats' => 'ERROR: No cards array',
                    'corrupted' => true,
                );
            }
            
            $card_count = count($snapshot_data['cards']);
            
            // Group by views
            $views_breakdown = array();
            foreach ($snapshot_data['cards'] as $card) {
                $view_title = $card['view_title'] ?? 'Unknown View';
                if (!isset($views_breakdown[$view_title])) {
                    $views_breakdown[$view_title] = 0;
                }
                $views_breakdown[$view_title]++;
            }
            
            return array(
                'id' => $backup->ID,
                'name' => 'Dashboard Snapshot',
                'type' => get_post_meta($backup->ID, 'snapshot_type', true) ?: 'auto',
                'created' => $backup->post_date,
                'card_count' => $card_count,
                'views_breakdown' => $views_breakdown,
                'size' => round(strlen($snapshot_data_json) / 1024, 2) . ' KB',
                'stats' => $card_count . ' cards across ' . count($views_breakdown) . ' views',
            );
        }
        
        // OLD BACKUP SYSTEM (ultra_backup, ultra_card_backup) - Compressed JSON
        $config_json_compressed = get_post_meta($backup->ID, 'config_json', true);
        $config_json = false;
        
        // Try to decompress if data exists
        if ($config_json_compressed && is_string($config_json_compressed)) {
            $config_json = @gzuncompress($config_json_compressed);
        }
        
        $size_kb = $config_json ? round(strlen($config_json) / 1024, 2) : 0;
        $card_stats = json_decode(get_post_meta($backup->ID, 'card_stats', true), true);
        
        // Format stats for display
        $stats_display = '';
        if (is_array($card_stats)) {
            $parts = array();
            if (isset($card_stats['row_count'])) $parts[] = $card_stats['row_count'] . ' rows';
            if (isset($card_stats['module_count'])) $parts[] = $card_stats['module_count'] . ' modules';
            $stats_display = !empty($parts) ? implode(', ', $parts) : 'No stats';
        }
        
        return array(
            'id' => $backup->ID,
            'name' => get_post_meta($backup->ID, 'snapshot_name', true) ?: get_post_meta($backup->ID, 'card_name', true) ?: 'Card Backup v' . intval(get_post_meta($backup->ID, 'version_number', true)),
            'type' => get_post_meta($backup->ID, 'backup_type', true) ?: 'manual',
            'version_number' => intval(get_post_meta($backup->ID, 'version_number', true)),
            'snapshot_name' => get_post_meta($backup->ID, 'snapshot_name', true),
            'snapshot_description' => get_post_meta($backup->ID, 'snapshot_description', true),
            'created' => $backup->post_date,
            'size' => $size_kb > 0 ? $size_kb . ' KB' : 'Unknown',
            'size_kb' => $size_kb,
            'card_stats' => $card_stats,
            'stats' => $stats_display,
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
    /**
     * Normalize Hub/API favorite payloads (row_data vs data, tags, type).
     *
     * @param array $data
     * @return array{type:string,data:mixed,tags:array}
     */
    private function normalize_favorite_payload($data) {
        if (!is_array($data)) {
            $data = array();
        }
        $payload_data = null;
        if (isset($data['data'])) {
            $payload_data = $data['data'];
        } elseif (isset($data['row_data'])) {
            $raw = $data['row_data'];
            if (is_string($raw)) {
                $decoded = json_decode($raw, true);
                $payload_data = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $raw;
            } else {
                $payload_data = $raw;
            }
        } elseif (isset($data['row'])) {
            $payload_data = $data['row'];
        }
        if ($payload_data === null) {
            $payload_data = new stdClass();
        }
        $tags = array();
        if (isset($data['tags']) && is_array($data['tags'])) {
            $tags = array_values(array_filter(array_map('sanitize_text_field', $data['tags'])));
        }
        return array(
            'type' => sanitize_text_field($data['type'] ?? 'general'),
            'data' => $payload_data,
            'tags' => $tags,
        );
    }

    private function format_favorite($favorite) {
        $raw = get_post_meta($favorite->ID, 'favorite_data', true);
        $decoded = array();
        if (is_string($raw) && $raw !== '') {
            $tmp = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $decoded = $tmp;
            }
        } elseif (is_array($raw)) {
            $decoded = $raw;
        }
        $tags_raw = get_post_meta($favorite->ID, 'favorite_tags', true);
        $tags = array();
        if (is_string($tags_raw) && $tags_raw !== '') {
            $tmp = json_decode($tags_raw, true);
            if (is_array($tmp)) {
                $tags = $tmp;
            }
        } elseif (is_array($tags_raw)) {
            $tags = $tags_raw;
        }
        $row_json = wp_json_encode($decoded ? $decoded : new stdClass());
        return array(
            'id'          => (string) $favorite->ID,
            'name'        => $favorite->post_title,
            'description' => $favorite->post_content,
            'type'        => (string) (get_post_meta($favorite->ID, 'favorite_type', true) ?: 'general'),
            'data'        => $decoded ? $decoded : new stdClass(),
            'row_data'    => $row_json,
            'tags'        => array_values($tags),
            'created'     => $favorite->post_date,
            'updated'     => $favorite->post_modified,
            'created_at'  => $favorite->post_date,
            'updated_at'  => $favorite->post_modified,
            'user_id'     => (int) $favorite->post_author,
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
            'id'        => (string) $review->ID,
            'preset_id' => (string) ($meta['preset_id'][0] ?? ''),
            'user_id'   => (int) $review->post_author,
            'rating'    => intval($meta['rating'][0] ?? 0),
            'comment'   => $review->post_content,
            'created'   => $review->post_date,
            'updated'   => $review->post_modified,
        );
    }

    /**
     * A review payload plus the preset's freshly recalculated aggregate, so a
     * client that just voted can update its star display without refetching
     * the whole catalog.
     */
    private function _review_response_with_aggregate($review, $preset_id) {
        $payload = $this->format_review($review);

        if ($preset_id && function_exists('uc_get_preset_rating_aggregate')) {
            $aggregate = uc_get_preset_rating_aggregate($preset_id);
            $payload['preset_rating'] = $aggregate['rating'];
            $payload['preset_rating_count'] = $aggregate['rating_count'];
        }

        return $payload;
    }

    /**
     * Recalculate and write _drts_voting_rating on the given DRTS preset post
     * from all UC reviews (ultra_review posts) for that preset.
     *
     * The DRTS meta structure expected:
     *   array( 0 => array( '' => array('count','sum','average','last_voted_at','count_init','sum_init','level') ) )
     *
     * count_init / sum_init preserve any votes that existed in DRTS before UC
     * took over — captured once on the first UC write so legacy votes aren't lost.
     */
    private function _sync_reviews_to_drts_rating($preset_post_id) {
        // Gather all UC reviews for this preset
        $reviews = get_posts(array(
            'post_type'      => 'ultra_review',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'meta_query'     => array(
                array('key' => 'preset_id', 'value' => $preset_post_id, 'compare' => '='),
            ),
        ));

        $uc_count = 0;
        $uc_sum   = 0;
        $last_voted_at = 0;

        foreach ($reviews as $r) {
            $rating = intval(get_post_meta($r->ID, 'rating', true));
            if ($rating >= 1 && $rating <= 5) {
                $uc_count++;
                $uc_sum += $rating;
                $ts = strtotime($r->post_modified ?: $r->post_date);
                if ($ts > $last_voted_at) {
                    $last_voted_at = $ts;
                }
            }
        }

        // Read existing DRTS meta to preserve the legacy baseline (count_init / sum_init)
        $existing_raw = get_post_meta($preset_post_id, '_drts_voting_rating', true);
        $existing     = is_array($existing_raw) ? $existing_raw : array();

        $baseline = isset($existing[0]['']) ? $existing[0][''] : array();
        // On the very first UC write, record legacy DRTS values as the init baseline
        $count_init = isset($baseline['count_init']) ? intval($baseline['count_init']) : intval($baseline['count'] ?? 0);
        $sum_init   = isset($baseline['sum_init'])   ? floatval($baseline['sum_init'])  : floatval($baseline['sum'] ?? 0);

        // Total = legacy baseline + UC votes
        $total_count = $count_init + $uc_count;
        $total_sum   = $sum_init   + $uc_sum;
        $average     = $total_count > 0 ? round($total_sum / $total_count, 2) : 0;
        $level        = $average > 0 ? min(5, max(1, (int) round($average))) : 0;

        if ($last_voted_at === 0) {
            $last_voted_at = isset($baseline['last_voted_at']) ? intval($baseline['last_voted_at']) : time();
        }

        $new_data = array(
            0 => array(
                '' => array(
                    'count'         => $total_count,
                    'sum'           => (string) $total_sum,
                    'average'       => (string) $average,
                    'last_voted_at' => $last_voted_at,
                    'count_init'    => $count_init,
                    'sum_init'      => (string) $sum_init,
                    'level'         => $level,
                ),
            ),
        );

        update_post_meta($preset_post_id, '_drts_voting_rating', $new_data);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                'Ultra Card: Synced ratings for preset %d — count=%d sum=%s avg=%s (UC: %d votes, baseline: %d)',
                $preset_post_id, $total_count, $total_sum, $average, $uc_count, $count_init
            ));
        }
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('========================================');
            error_log('Ultra Card: GET SNAPSHOTS DEBUG');
            error_log('========================================');
            error_log('User ID: ' . $user_id);
            error_log('Limit: ' . $limit);
        }
        
        $args = array(
            'post_type' => 'ultra_snapshot',
            'author' => $user_id,
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC',
        );
        
        $snapshots = get_posts($args);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Found ' . count($snapshots) . ' snapshot posts for user ' . $user_id);
        }
        
        $result = array();
        
        foreach ($snapshots as $snapshot) {
            $snapshot_data_encoded = get_post_meta($snapshot->ID, 'snapshot_data', true);
            
            // Decode base64 (new format as of fix for WordPress character escaping)
            $snapshot_data_json = base64_decode($snapshot_data_encoded, true);
            if ($snapshot_data_json === false) {
                // Not base64 encoded - try direct decode (legacy format)
                $snapshot_data_json = $snapshot_data_encoded;
            }
            
            $snapshot_data = json_decode($snapshot_data_json, true);
            $card_count = count($snapshot_data['cards'] ?? []);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('  Snapshot ID ' . $snapshot->ID . ':');
                error_log('    - JSON length: ' . strlen($snapshot_data_json) . ' bytes');
                error_log('    - Decoded successfully: ' . (is_array($snapshot_data) ? 'YES' : 'NO'));
                error_log('    - Has cards key: ' . (isset($snapshot_data['cards']) ? 'YES' : 'NO'));
                error_log('    - Card count: ' . $card_count);
                
                if ($card_count === 0 && strlen($snapshot_data_json) > 100) {
                    error_log('    ⚠️ WARNING: Snapshot has data but 0 cards!');
                    error_log('    - Snapshot data keys: ' . (is_array($snapshot_data) ? implode(', ', array_keys($snapshot_data)) : 'NOT AN ARRAY'));
                }
            }
            
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Returning ' . count($result) . ' snapshots to frontend');
            error_log('========================================');
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
        
        // COMPREHENSIVE DEBUGGING - ALWAYS LOG (remove WP_DEBUG check temporarily)
        error_log('========================================');
        error_log('Ultra Card: CREATE SNAPSHOT DEBUG');
        error_log('========================================');
        error_log('User ID: ' . $user_id);
        error_log('Snapshot Type: ' . $snapshot_type);
        error_log('Request Params: ' . print_r($request->get_params(), true));
        error_log('Snapshot Data Type: ' . gettype($snapshot_data));
        error_log('Is snapshot_data array? ' . (is_array($snapshot_data) ? 'YES' : 'NO'));
        
        if (is_array($snapshot_data)) {
            error_log('snapshot_data keys: ' . implode(', ', array_keys($snapshot_data)));
            error_log('Has "cards" key? ' . (isset($snapshot_data['cards']) ? 'YES' : 'NO'));
            
            if (isset($snapshot_data['cards'])) {
                error_log('Number of cards: ' . count($snapshot_data['cards']));
                if (count($snapshot_data['cards']) > 0) {
                    error_log('First card sample: ' . substr(print_r($snapshot_data['cards'][0], true), 0, 500));
                }
            } else {
                error_log('NO CARDS KEY! Available keys: ' . print_r(array_keys($snapshot_data), true));
            }
        } else {
            error_log('Snapshot data is NOT an array! Raw value: ' . print_r($snapshot_data, true));
        }
        
        if (!$snapshot_data || !isset($snapshot_data['cards'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ VALIDATION FAILED: Missing snapshot_data or cards');
            }
            return new WP_Error('invalid_data', 'Snapshot data is required', array('status' => 400));
        }
        
        // Check Pro status for manual snapshots
        if ($snapshot_type === 'manual') {
            $subscription = $this->get_user_subscription_data($user_id);
            if ($subscription['tier'] !== 'pro') {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('❌ Pro subscription required, user tier: ' . $subscription['tier']);
                }
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
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ Failed to create post: ' . $post_id->get_error_message());
            }
            return $post_id;
        }
        
        // Log snapshot post creation
        error_log('✅ Snapshot post created: ID ' . $post_id);
        
        // Store metadata with proper JSON encoding
        error_log('📝 Encoding snapshot data to JSON...');
        error_log('  - Input card count: ' . count($snapshot_data['cards']));
        error_log('  - Input has "views": ' . (isset($snapshot_data['views']) ? 'YES' : 'NO'));
        error_log('  - Input has "dashboard_path": ' . (isset($snapshot_data['dashboard_path']) ? 'YES (' . $snapshot_data['dashboard_path'] . ')' : 'NO'));
        
        // Use JSON flags to handle special characters properly
        $json_data = json_encode($snapshot_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR);
        
        if ($json_data === false || $json_data === null) {
            error_log('❌ CRITICAL: json_encode() FAILED!');
            error_log('   Error: ' . json_last_error_msg());
            error_log('   Error code: ' . json_last_error());
            wp_delete_post($post_id, true); // Clean up the empty post
            return new WP_Error('json_encode_failed', 'Failed to encode snapshot data: ' . json_last_error_msg(), array('status' => 500));
        }
        
        error_log('✅ JSON encoding successful');
        error_log('  - Encoded JSON size: ' . strlen($json_data) . ' bytes');
        error_log('  - Encoded JSON size (KB): ' . round(strlen($json_data) / 1024, 2) . ' KB');
        
        // CRITICAL FIX: Base64 encode to prevent WordPress from corrupting special characters
        // WordPress's add_slashes() corrupts JSON with templates/special chars
        error_log('🔐 Base64 encoding JSON to prevent WordPress corruption...');
        $json_data_safe = base64_encode($json_data);
        error_log('  - Base64 encoded size: ' . strlen($json_data_safe) . ' bytes');
        
        // Store the metadata
        error_log('💾 Storing snapshot data in post meta...');
        $meta_result = update_post_meta($post_id, 'snapshot_data', $json_data_safe);
        error_log('  - update_post_meta result: ' . ($meta_result ? 'SUCCESS' : 'FAILED'));
        
        update_post_meta($post_id, 'snapshot_type', $snapshot_type);
        update_post_meta($post_id, 'snapshot_date', date('Y-m-d'));
        update_post_meta($post_id, 'card_count', count($snapshot_data['cards']));
        
        error_log('✅ Metadata stored');
        error_log('  - snapshot_type: ' . $snapshot_type);
        error_log('  - card_count: ' . count($snapshot_data['cards']));
        error_log('  - JSON size: ' . strlen($json_data) . ' bytes');
        
        // ALWAYS verify the data was actually saved correctly
        error_log('🔍 VERIFYING saved data...');
        $verify_data_encoded = get_post_meta($post_id, 'snapshot_data', true);
        error_log('  - Retrieved meta value type: ' . gettype($verify_data_encoded));
        error_log('  - Retrieved base64 size: ' . strlen($verify_data_encoded) . ' bytes');
        error_log('  - Sizes match? ' . (strlen($verify_data_encoded) === strlen($json_data_safe) ? 'YES ✅' : 'NO ❌ MISMATCH!'));
        
        if (strlen($verify_data_encoded) !== strlen($json_data_safe)) {
            error_log('❌ CRITICAL: Stored data size mismatch!');
            error_log('   Original base64: ' . strlen($json_data_safe) . ' bytes');
            error_log('   Retrieved base64: ' . strlen($verify_data_encoded) . ' bytes');
            error_log('   Difference: ' . (strlen($json_data_safe) - strlen($verify_data_encoded)) . ' bytes LOST');
        }
        
        // Decode base64 and verify JSON
        error_log('🔓 Decoding base64...');
        $verify_data = base64_decode($verify_data_encoded, true);
        if ($verify_data === false) {
            error_log('❌ CRITICAL: Base64 decode failed!');
        } else {
            error_log('  - Decoded JSON size: ' . strlen($verify_data) . ' bytes');
            error_log('  - JSON size matches original? ' . (strlen($verify_data) === strlen($json_data) ? 'YES ✅' : 'NO ❌'));
            
            $verify_decoded = json_decode($verify_data, true);
            error_log('  - JSON decode successful? ' . ($verify_decoded !== null ? 'YES ✅' : 'NO ❌'));
            
            if ($verify_decoded === null) {
                error_log('❌ CRITICAL: Retrieved data cannot be decoded!');
                error_log('   JSON error: ' . json_last_error_msg());
                error_log('   First 500 chars of retrieved data: ' . substr($verify_data, 0, 500));
            } else {
                error_log('  - Has "cards" key? ' . (isset($verify_decoded['cards']) ? 'YES ✅' : 'NO ❌'));
                error_log('  - Cards in retrieved data: ' . (isset($verify_decoded['cards']) ? count($verify_decoded['cards']) : 'NO CARDS KEY'));
                
                if (!isset($verify_decoded['cards']) || count($verify_decoded['cards']) !== count($snapshot_data['cards'])) {
                    error_log('❌ CRITICAL: Card count mismatch or missing!');
                    error_log('   Expected: ' . count($snapshot_data['cards']));
                    error_log('   Retrieved: ' . (isset($verify_decoded['cards']) ? count($verify_decoded['cards']) : 'NO CARDS'));
                }
            }
        }
        
        // Prune old auto-snapshots (keep 30 days)
        if ($snapshot_type === 'auto') {
            $this->prune_old_snapshots($user_id);
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('========================================');
            error_log('Ultra Card: SNAPSHOT CREATED SUCCESSFULLY');
            error_log('========================================');
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("🔍 GET SNAPSHOT: ID {$snapshot_id}, User {$user_id}");
        }
        
        $snapshot = get_post($snapshot_id);
        
        if (!$snapshot || $snapshot->post_type !== 'ultra_snapshot') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot not found or wrong type");
            }
            return new WP_Error('not_found', 'Snapshot not found', array('status' => 404));
        }
        
        if ($snapshot->post_author != $user_id) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Access denied: author={$snapshot->post_author}, user={$user_id}");
            }
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        $snapshot_data_encoded = get_post_meta($snapshot_id, 'snapshot_data', true);
        
        if (empty($snapshot_data_encoded)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot {$snapshot_id} has no snapshot_data");
            }
            return new WP_Error('corrupted_snapshot', 'Snapshot data is missing', array('status' => 500));
        }
        
        // Decode base64 (new format as of fix for WordPress character escaping)
        $snapshot_data_json = base64_decode($snapshot_data_encoded, true);
        if ($snapshot_data_json === false) {
            // Not base64 encoded - try direct decode (legacy format)
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("⚠️ Base64 decode failed for snapshot {$snapshot_id}, trying legacy format");
            }
            $snapshot_data_json = $snapshot_data_encoded;
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("✅ Base64 decoded snapshot {$snapshot_id}: " . strlen($snapshot_data_json) . " bytes");
            }
        }
        
        $snapshot_data = json_decode($snapshot_data_json, true);
        
        if ($snapshot_data === null || json_last_error() !== JSON_ERROR_NONE) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot {$snapshot_id} JSON decode failed: " . json_last_error_msg());
                error_log("   JSON length: " . strlen($snapshot_data_json) . " bytes");
            }
            return new WP_Error('corrupted_snapshot', 'Failed to decode snapshot data: ' . json_last_error_msg(), array('status' => 500));
        }
        
        if (!isset($snapshot_data['cards']) || !is_array($snapshot_data['cards'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot {$snapshot_id} has no cards array");
                error_log("   Available keys: " . implode(', ', array_keys($snapshot_data)));
            }
            return new WP_Error('invalid_snapshot', 'Snapshot has no cards data', array('status' => 500));
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("✅ Snapshot {$snapshot_id} retrieved successfully: " . count($snapshot_data['cards']) . " cards");
        }
        
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("🔄 RESTORE SNAPSHOT: ID {$snapshot_id}, User {$user_id}");
        }
        
        $snapshot = get_post($snapshot_id);
        
        if (!$snapshot || $snapshot->post_type !== 'ultra_snapshot') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot not found or wrong type");
            }
            return new WP_Error('not_found', 'Snapshot not found', array('status' => 404));
        }
        
        if ($snapshot->post_author != $user_id) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Access denied: author={$snapshot->post_author}, user={$user_id}");
            }
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }
        
        $snapshot_data_encoded = get_post_meta($snapshot_id, 'snapshot_data', true);
        
        if (empty($snapshot_data_encoded)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot {$snapshot_id} has no snapshot_data");
            }
            return new WP_Error('corrupted_snapshot', 'Snapshot data is missing', array('status' => 500));
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("📦 Snapshot data encoded size: " . strlen($snapshot_data_encoded) . " bytes");
        }
        
        // Decode base64 (new format as of fix for WordPress character escaping)
        $snapshot_data_json = base64_decode($snapshot_data_encoded, true);
        if ($snapshot_data_json === false) {
            // Not base64 encoded - try direct decode (legacy format)
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("⚠️ Base64 decode failed for snapshot {$snapshot_id}, trying legacy format");
            }
            $snapshot_data_json = $snapshot_data_encoded;
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("✅ Base64 decoded snapshot {$snapshot_id}: " . strlen($snapshot_data_json) . " bytes");
            }
        }
        
        $snapshot_data = json_decode($snapshot_data_json, true);
        
        if ($snapshot_data === null || json_last_error() !== JSON_ERROR_NONE) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot {$snapshot_id} JSON decode failed: " . json_last_error_msg());
                error_log("   JSON length: " . strlen($snapshot_data_json) . " bytes");
                error_log("   First 200 chars: " . substr($snapshot_data_json, 0, 200));
            }
            return new WP_Error('corrupted_snapshot', 'Failed to decode snapshot data: ' . json_last_error_msg(), array('status' => 500));
        }
        
        if (!isset($snapshot_data['cards']) || !is_array($snapshot_data['cards'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("❌ Snapshot {$snapshot_id} has no cards array");
                error_log("   Snapshot data type: " . gettype($snapshot_data));
                if (is_array($snapshot_data)) {
                    error_log("   Available keys: " . implode(', ', array_keys($snapshot_data)));
                } else {
                    error_log("   Data is not an array!");
                }
            }
            return new WP_Error('invalid_snapshot', 'Snapshot has no cards data', array('status' => 500));
        }
        
        $card_count = count($snapshot_data['cards']);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("✅ Snapshot {$snapshot_id} restored: {$card_count} cards");
        }
        
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
    
    // ========================================
    // SESSION SYNC METHODS (Cross-Device Auth)
    // ========================================
    
    /**
     * Create cloud session for cross-device authentication
     */
    public function create_session($request) {
        global $wpdb;
        
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        if (!$user_id) {
            return new WP_Error('unauthorized', 'User not authenticated', array('status' => 401));
        }
        
        // Ensure database tables exist (create them if they don't)
        $table_name = $wpdb->prefix . 'ultra_card_sessions';
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table_name}'") != $table_name) {
            ultra_card_create_database_tables();
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Session table did not exist, created it');
            }
        }
        
        $device_id = sanitize_text_field($data['device_id'] ?? '');
        $device_name = sanitize_text_field($data['device_name'] ?? 'Unknown Device');
        $ha_user_id = sanitize_text_field($data['ha_user_id'] ?? '');
        
        if (!$ha_user_id) {
            return new WP_Error('invalid_data', 'Home Assistant user ID required', array('status' => 400));
        }
        
        // Get full user data including subscription
        $user = wp_get_current_user();
        $subscription = $this->get_user_subscription_data($user_id);
        
        // Build user data object (matching CloudUser interface from frontend)
        $user_data = array(
            'id' => $user_id,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'displayName' => $user->display_name,
            'subscription' => $subscription,
        );
        
        // Note: JWT tokens are managed by frontend, we just store the session reference
        
        $table_name = $wpdb->prefix . 'ultra_card_sessions';
        
        // Check if HA user already has an active session to reuse
        $existing_user_session = $wpdb->get_row($wpdb->prepare(
            "SELECT session_id FROM {$table_name} 
            WHERE user_id = %d AND ha_user_id = %s AND expires_at > NOW() 
            ORDER BY created_at DESC LIMIT 1",
            $user_id, $ha_user_id
        ));
        
        if ($existing_user_session) {
            // Reuse existing session ID for cross-device sync
            $session_id = $existing_user_session->session_id;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Reusing existing session - ID: {$session_id}, User: {$user_id}");
            }
        } else {
            // Generate new session ID
            $session_id = 'sess_' . wp_generate_password(32, false);
        }
        
        // Calculate expiry (90 days from now with sliding expiration)
        $expires_at = date('Y-m-d H:i:s', strtotime('+90 days'));
        
        // Check if this device already has a session, update it if so
        $existing_session = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} 
            WHERE user_id = %d AND device_id = %s AND expires_at > NOW()",
            $user_id, $device_id
        ));
        
        if ($existing_session) {
            // Update existing session for this device
            $result = $wpdb->update(
                $table_name,
                array(
                    'session_id' => $session_id,
                    'ha_user_id' => $ha_user_id,
                    'user_data' => wp_json_encode($user_data),
                    'device_name' => $device_name,
                    'created_at' => current_time('mysql'),
                    'last_validated' => current_time('mysql'),
                    'expires_at' => $expires_at,
                ),
                array('id' => $existing_session->id),
                array('%s', '%s', '%s', '%s', '%s', '%s', '%s'),
                array('%d')
            );
            
            if ($result === false) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Ultra Card: Failed to update session - ' . $wpdb->last_error);
                }
                return new WP_Error('session_update_failed', 'Failed to update session', array('status' => 500));
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Session updated - ID: {$session_id}, User: {$user_id}, Device: {$device_name}");
            }
            
            return rest_ensure_response(array(
                'success' => true,
                'session_id' => $session_id,
                'expires_at' => strtotime($expires_at),
            ));
        }
        
        // Insert new session
        $result = $wpdb->insert(
            $table_name,
            array(
                'session_id' => $session_id,
                'user_id' => $user_id,
                'ha_user_id' => $ha_user_id,
                'user_data' => wp_json_encode($user_data),
                'device_id' => $device_id,
                'device_name' => $device_name,
                'created_at' => current_time('mysql'),
                'last_validated' => current_time('mysql'),
                'expires_at' => $expires_at,
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Failed to create session - ' . $wpdb->last_error);
            }
            return new WP_Error('session_creation_failed', 'Failed to create session', array('status' => 500));
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Ultra Card: Session created - ID: {$session_id}, User: {$user_id}, Device: {$device_name}");
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'session_id' => $session_id,
            'expires_at' => strtotime($expires_at),
        ));
    }
    
    /**
     * Get current active session for user (cross-device sync).
     * Requires JWT authentication; no public lookup by ha_user_id to avoid leaking session data.
     */
    public function get_current_session($request) {
        global $wpdb;

        $user_id = $this->get_user_id_from_jwt_token($request);
        if (!$user_id) {
            return new WP_Error('unauthorized', 'JWT authentication required', array('status' => 401));
        }

        $table_name = $wpdb->prefix . 'ultra_card_sessions';
        $session = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name}
            WHERE user_id = %d AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1",
            $user_id
        ));

        if (!$session) {
            return new WP_Error('no_session', 'No active session found', array('status' => 404));
        }
        
        // Decode user data
        $user_data = json_decode($session->user_data, true);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Ultra Card: Retrieved session - ID: {$session->session_id}, User: {$user_id}");
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'session' => array(
                'session_id' => $session->session_id,
                'user' => $user_data,
                'created_at' => strtotime($session->created_at),
                'last_validated' => strtotime($session->last_validated),
            ),
        ));
    }
    
    /**
     * Validate session (updates last_validated timestamp)
     */
    public function validate_session($request) {
        global $wpdb;
        
        // Manually validate JWT token from Authorization header
        $user_id = $this->get_user_id_from_jwt_token($request);
        $data = $request->get_json_params();
        $session_id = sanitize_text_field($data['session_id'] ?? '');
        
        if (!$user_id || !$session_id) {
            return rest_ensure_response(array(
                'success' => false,
                'valid' => false,
            ));
        }
        
        $table_name = $wpdb->prefix . 'ultra_card_sessions';
        
        // Check if session exists and belongs to this user
        $session = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} 
            WHERE session_id = %s AND user_id = %d AND expires_at > NOW()",
            $session_id,
            $user_id
        ));
        
        if (!$session) {
            return rest_ensure_response(array(
                'success' => true,
                'valid' => false,
            ));
        }
        
        // Update last_validated timestamp and extend expiration (sliding window)
        $wpdb->update(
            $table_name,
            array(
                'last_validated' => current_time('mysql'),
                'expires_at' => date('Y-m-d H:i:s', strtotime('+90 days')),
            ),
            array('session_id' => $session_id),
            array('%s', '%s'),
            array('%s')
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'valid' => true,
            'user' => array(
                'id' => $user_id,
                'subscription' => $this->get_user_subscription_data($user_id),
            ),
        ));
    }
    
    /**
     * Logout (invalidate session for all devices)
     */
    public function logout_session($request) {
        global $wpdb;
        
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return new WP_Error('unauthorized', 'User not authenticated', array('status' => 401));
        }
        
        $table_name = $wpdb->prefix . 'ultra_card_sessions';
        
        // Delete all sessions for this user
        $deleted = $wpdb->delete($table_name, array('user_id' => $user_id), array('%d'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Ultra Card: Session logout - User: {$user_id}, Sessions deleted: {$deleted}");
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Session invalidated',
        ));
    }
    
    /**
     * Register a new Ultra Card user account.
     * Public endpoint — creates a WP user and sends the standard setup email.
     */
    public function register_user($request) {
        $username     = sanitize_user($request->get_param('username'));
        $email        = sanitize_email($request->get_param('email'));
        $display_name = sanitize_text_field($request->get_param('display_name') ?: $username);

        // ── Validate inputs ───────────────────────────────────────────────────
        if (empty($username)) {
            return new WP_Error('invalid_username', 'Please enter a valid username.', array('status' => 400));
        }
        if (!is_email($email)) {
            return new WP_Error('invalid_email', 'Please enter a valid email address.', array('status' => 400));
        }
        if (username_exists($username)) {
            return new WP_Error('username_exists', 'That username is already taken. Please choose another.', array('status' => 409));
        }
        if (email_exists($email)) {
            return new WP_Error('email_exists', 'An account with that email already exists. Try signing in instead.', array('status' => 409));
        }

        // ── Create the user ───────────────────────────────────────────────────
        $generated_password = wp_generate_password(32, true, true);
        $user_id = wp_create_user($username, $generated_password, $email);

        if (is_wp_error($user_id)) {
            return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
        }

        wp_update_user(array(
            'ID'           => $user_id,
            'display_name' => $display_name,
            'role'         => 'ultra_card_free',
        ));

        // Send the standard WP new-user email to the user
        wp_new_user_notification($user_id, null, 'user');

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: New registration — user_id=' . $user_id . ' username=' . $username . ' setup_email_sent=yes');
        }

        return rest_ensure_response(array(
            'success'   => true,
            'user_id'   => $user_id,
            'message'   => 'Account created. Check your email inbox, junk, or spam for the ultracard.io message to finish setting your password, then return to Home Assistant to sign in.',
            'next_step' => 'email_password_setup',
        ));
    }

    /**
     * Prune expired sessions (called by cron job daily)
     */
    public function prune_old_sessions() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ultra_card_sessions';
        
        $deleted = $wpdb->query(
            "DELETE FROM {$table_name} WHERE expires_at < NOW()"
        );
        
        if (defined('WP_DEBUG') && WP_DEBUG && $deleted > 0) {
            error_log("Ultra Card: Pruned {$deleted} expired session(s)");
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
        
        // Alternative registration will be handled separately
        
        // Debug logging for filter registration
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Dashboard filters registered for Directories Pro');
            error_log('Ultra Card: Current WordPress action: ' . current_action());
        }
        
        // Add CSS/JS for panel
        add_action('wp_enqueue_scripts', array($this, 'enqueue_dashboard_assets'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: All filters registered');
            error_log('Ultra Card: Dashboard integration active: ' . ($this->is_active ? 'YES' : 'NO'));
            error_log('Ultra Card: Cloud sync available: ' . ($this->cloud_sync ? 'YES' : 'NO'));
        }
    }
    
    /**
     * Register panel name in Directories Pro
     * This tells Directories Pro that we have a custom panel called 'ultra_card_backups'
     */
    public function register_panel_name($names) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: register_panel_name called with input: ' . print_r($names, true));
        }
        
        if (!is_array($names)) {
            $names = array();
        }
        $names[] = 'ultra_card_backups';
        $names[] = 'ultra_card_membership'; // NEW: Membership/billing panel
        $names[] = 'ultra_card_messages'; // NEW: Messages panel for Front End PM
        
        // Always register Discord panel - check availability later in panel info
        $names[] = 'ultra_card_discord'; // NEW: Discord connection panel
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Added ultra_card_discord to panel names (always register)');
        }
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $discord_available = $ultra_card_discord_integration ? 'YES' : 'NO';
            error_log('Ultra Card: Panel names registered - ultra_card_backups, ultra_card_membership, ultra_card_discord');
            error_log('Ultra Card: Discord integration available: ' . $discord_available);
            error_log('Ultra Card: Directories Pro class exists: ' . (class_exists('SabaiApps\\Directories\\Application') ? 'YES' : 'NO'));
            error_log('Ultra Card: register_panel_name called at ' . current_time('mysql'));
            error_log('Ultra Card: Current user logged in: ' . (is_user_logged_in() ? 'YES' : 'NO'));
            error_log('Ultra Card: Current user ID: ' . get_current_user_id());
        }
        
        // Debug logging (only if WP_DEBUG is enabled and specifically requested)
        if (defined('WP_DEBUG') && WP_DEBUG && defined('ULTRA_CARD_DEBUG_PANELS')) {
            error_log('Ultra Card: register_panel_name called with names: ' . print_r($names, true));
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
        
        // Handle Ultra Card Messages panel
        if ($name === 'ultra_card_messages') {
            // Check if Better Messages is active - check multiple possible class/function names
            $bm_active = class_exists('Better_Messages') || 
                         class_exists('BP_Better_Messages') || 
                         function_exists('bp_better_messages') ||
                         function_exists('BP_Better_Messages');
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Messages panel info requested');
                error_log('Ultra Card: Better Messages active: ' . ($bm_active ? 'YES' : 'NO'));
                // Additional debug to see what's available
                error_log('Ultra Card: Better_Messages class exists: ' . (class_exists('Better_Messages') ? 'YES' : 'NO'));
                error_log('Ultra Card: BP_Better_Messages class exists: ' . (class_exists('BP_Better_Messages') ? 'YES' : 'NO'));
            }
            
            return array(
                'label' => __('Messages', 'ultra-card'),
                'icon' => 'fas fa-envelope',
                'weight' => 53,
                'wp' => true,
                'ajax' => false, // Disable AJAX to force full page loads
            );
        }
        
        // Handle Ultra Card Discord panel
        if ($name === 'ultra_card_discord') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Discord panel info requested for name: ' . $name);
                error_log('Ultra Card: Returning Discord panel info');
            }
            
            // Ensure Discord integration is available
            global $ultra_card_discord_integration;
            if (!$ultra_card_discord_integration) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Ultra Card: Discord integration not available, initializing...');
                }
                try {
                    $ultra_card_discord_integration = new UltraCardDiscordIntegration();
                } catch (Exception $e) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Ultra Card: Failed to initialize Discord integration: ' . $e->getMessage());
                    }
                }
            }
            
                    $panel_info = array(
                        'label' => __('Discord Connection', 'ultra-card'),
                        'icon' => 'fab fa-discord',
                        'weight' => 52,
                        'wp' => true,
                    );
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Ultra Card: Returning Discord panel info: ' . print_r($panel_info, true));
                    }
                    
                    return $panel_info;
        }
        
        return $info;
    }
    
    /**
     * Register panel links (sub-tabs within the panel)
     * This is called by CustomPanel to generate navigation links
     */
    public function register_panel_links($links, $name) {
        // Handle Ultra Card Messages panel
        if ($name === 'ultra_card_messages') {
            // Single conversations tab for all users
            $panel_links = array(
                'conversations' => array(
                    'title' => __('Conversations', 'ultra-card'),
                    'icon' => 'fas fa-comments',
                    'weight' => 1,
                    'ajax' => false, // Disable AJAX for this link too
                ),
            );
            
            return $panel_links;
        }
        
        // Handle Ultra Card Discord panel
        if ($name === 'ultra_card_discord') {
            // Discord panel needs at least one link to show up in navigation
            return array(
                'discord_connection' => array(
                    'title' => __('Discord Connection', 'ultra-card'),
                    'icon' => 'fab fa-discord',
                    'weight' => 1,
                ),
            );
        }
        
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
            
            // Add settings tab for Pro users
            $panel_links['settings'] = array(
                'title' => __('Snapshot Settings', 'ultra-card'),
                'icon' => 'fas fa-cog',
                'weight' => 4,
            );
        }
        
        return $panel_links;
    }
    
    /**
     * Render panel content for each link
     * This is called by CustomPanel to display the actual content
     */
    public function render_panel_content($content, $name, $link) {
        // Handle Ultra Card Messages panel
        if ($name === 'ultra_card_messages') {
            return $this->render_messages_panel_content($link);
        }
        
        // Handle Ultra Card Discord panel
        if ($name === 'ultra_card_discord') {
            return $this->render_discord_panel_content($link);
        }
        
        // Handle Ultra Card Membership panel
        if ($name === 'ultra_card_membership') {
            return $this->render_membership_panel_content($link);
        }
        
        // Handle Ultra Card Backups panel
        if ($name !== 'ultra_card_backups' || !$this->is_active || !$this->cloud_sync) {
            return $content;
        }
        
        $user_id = get_current_user_id();
        
        // Handle settings tab for Pro users
        if ($link === 'settings') {
            return $this->render_snapshot_settings_panel($user_id);
        }
        
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
            
            /* Bulk Actions */
            .ucp-bulk-actions {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ucp-bulk-select-all {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #666;
                cursor: pointer;
            }
            
            .ucp-bulk-delete-btn {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
                display: none;
            }
            
            .ucp-bulk-delete-btn.active {
                display: block;
            }
            
            .ucp-bulk-delete-btn:hover {
                background: #c0392b;
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
            
            .ucp-backup-checkbox {
                flex-shrink: 0;
                width: 18px;
                height: 18px;
                cursor: pointer;
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
                    <?php if (!empty($backups)): ?>
                    <div class="ucp-bulk-actions">
                        <label class="ucp-bulk-select-all">
                            <input type="checkbox" id="select-all-backups" onchange="ucToggleAllBackups(this)">
                            <span>Select All</span>
                        </label>
                        <button class="ucp-bulk-delete-btn" id="bulk-delete-btn" onclick="ucBulkDeleteBackups()">
                            🗑️ Delete Selected
                        </button>
                    </div>
                    <?php endif; ?>
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
                                <input type="checkbox" 
                                       class="ucp-backup-checkbox backup-checkbox" 
                                       data-backup-id="<?php echo $backup->ID; ?>"
                                       onchange="ucUpdateBulkDeleteButton()">
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
        function ucDownloadBackup(id) {
            // Add nonce to URL for WordPress REST API authentication
            const nonce = '<?php echo wp_create_nonce('wp_rest'); ?>';
            window.location.href = '<?php echo rest_url('ultra-card/v1/backups/'); ?>' + id + '/download?_wpnonce=' + nonce;
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
        
        function ucToggleAllBackups(checkbox) {
            const checkboxes = document.querySelectorAll('.backup-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = checkbox.checked;
            });
            ucUpdateBulkDeleteButton();
        }
        
        function ucUpdateBulkDeleteButton() {
            const checkboxes = document.querySelectorAll('.backup-checkbox:checked');
            const bulkBtn = document.getElementById('bulk-delete-btn');
            const selectAllCheckbox = document.getElementById('select-all-backups');
            
            if (checkboxes.length > 0) {
                bulkBtn.classList.add('active');
                bulkBtn.textContent = `🗑️ Delete Selected (${checkboxes.length})`;
            } else {
                bulkBtn.classList.remove('active');
                bulkBtn.textContent = '🗑️ Delete Selected';
            }
            
            // Update "Select All" checkbox state
            const allCheckboxes = document.querySelectorAll('.backup-checkbox');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = checkboxes.length === allCheckboxes.length && allCheckboxes.length > 0;
            }
        }
        
        function ucBulkDeleteBackups() {
            const checkboxes = document.querySelectorAll('.backup-checkbox:checked');
            const ids = Array.from(checkboxes).map(cb => cb.getAttribute('data-backup-id'));
            
            if (ids.length === 0) {
                return;
            }
            
            if (!confirm(`Are you sure you want to delete ${ids.length} backup(s)? This cannot be undone.`)) {
                return;
            }
            
            // Delete all selected backups
            const nonce = '<?php echo wp_create_nonce('wp_rest'); ?>';
            const baseUrl = '<?php echo rest_url('ultra-card/v1/backups/'); ?>';
            
            let completed = 0;
            let failed = 0;
            
            Promise.all(ids.map(id => 
                fetch(baseUrl + id, {
                    method: 'DELETE',
                    headers: {
                        'X-WP-Nonce': nonce
                    }
                }).then(response => {
                    if (response.ok) {
                        completed++;
                    } else {
                        failed++;
                    }
                }).catch(() => {
                    failed++;
                })
            )).then(() => {
                if (failed > 0) {
                    alert(`Deleted ${completed} backup(s). Failed to delete ${failed} backup(s).`);
                }
                location.reload();
            });
        }
        </script>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Render Ultra Card Membership panel content
     * Shows WooCommerce subscription and billing info
     */
    /**
     * Render snapshot settings panel
     */
    private function render_snapshot_settings_panel($user_id) {
        // Get current settings
        $enabled = get_user_meta($user_id, 'ultra_snapshot_enabled', true);
        $time = get_user_meta($user_id, 'ultra_snapshot_time', true) ?: '03:00';
        $timezone = get_user_meta($user_id, 'ultra_snapshot_timezone', true) ?: 'UTC';
        
        // Handle form submission
        if (isset($_POST['save_snapshot_settings']) && wp_verify_nonce($_POST['_wpnonce'], 'ultra_snapshot_settings')) {
            $enabled = isset($_POST['snapshot_enabled']) ? 1 : 0;
            $time = sanitize_text_field($_POST['snapshot_time']);
            $timezone = sanitize_text_field($_POST['snapshot_timezone']);
            
            update_user_meta($user_id, 'ultra_snapshot_enabled', $enabled);
            update_user_meta($user_id, 'ultra_snapshot_time', $time);
            update_user_meta($user_id, 'ultra_snapshot_timezone', $timezone);
            
            echo '<div class="ucp-success-message">✅ Settings saved successfully!</div>';
        }
        
        // Common timezones
        $timezones = array(
            'UTC' => 'UTC',
            'America/New_York' => 'Eastern Time (ET)',
            'America/Chicago' => 'Central Time (CT)',
            'America/Denver' => 'Mountain Time (MT)',
            'America/Los_Angeles' => 'Pacific Time (PT)',
            'Europe/London' => 'London',
            'Europe/Paris' => 'Paris',
            'Europe/Berlin' => 'Berlin',
            'Asia/Tokyo' => 'Tokyo',
            'Asia/Shanghai' => 'Shanghai',
            'Australia/Sydney' => 'Sydney',
        );
        
        ob_start();
        ?>
        <style>
            .ucp-settings-panel {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .ucp-settings-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 16px;
                padding: 32px;
                margin-bottom: 32px;
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
            }
            
            .ucp-settings-header h2 {
                margin: 0 0 8px 0;
                font-size: 28px;
                font-weight: 700;
            }
            
            .ucp-settings-header p {
                margin: 0;
                opacity: 0.95;
                font-size: 16px;
            }
            
            .ucp-settings-card {
                background: white;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                margin-bottom: 24px;
            }
            
            .ucp-settings-group {
                margin-bottom: 28px;
            }
            
            .ucp-settings-group:last-child {
                margin-bottom: 0;
            }
            
            .ucp-settings-group label {
                display: block;
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 8px;
            }
            
            .ucp-settings-help {
                font-size: 14px;
                color: #666;
                margin-bottom: 12px;
            }
            
            .ucp-settings-group input[type="checkbox"] {
                width: 20px;
                height: 20px;
                margin-right: 10px;
                cursor: pointer;
            }
            
            .ucp-settings-group input[type="time"],
            .ucp-settings-group select {
                width: 100%;
                padding: 12px 16px;
                font-size: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                transition: all 0.2s;
            }
            
            .ucp-settings-group input[type="time"]:focus,
            .ucp-settings-group select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .ucp-toggle-label {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: #f5f5f5;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .ucp-toggle-label input[type="checkbox"] {
                margin-top: 2px;
                flex-shrink: 0;
            }
            
            .ucp-toggle-label:hover {
                background: #e8e8e8;
            }
            
            .ucp-info-box {
                background: #f0f4ff;
                border-left: 4px solid #667eea;
                padding: 16px 20px;
                border-radius: 8px;
                margin-top: 24px;
            }
            
            .ucp-info-box h4 {
                margin: 0 0 8px 0;
                color: #667eea;
                font-size: 16px;
            }
            
            .ucp-info-box p {
                margin: 0;
                color: #555;
                line-height: 1.6;
            }
            
            .ucp-save-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 14px 32px;
                font-size: 16px;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .ucp-save-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
            }
            
            .ucp-success-message {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 24px;
                font-weight: 500;
            }
        </style>
        
        <div class="ucp-settings-panel">
            <div class="ucp-settings-header">
                <h2>⚙️ Snapshot Settings</h2>
                <p>Configure automatic daily dashboard snapshots</p>
            </div>
            
            <form method="post" action="">
                <?php wp_nonce_field('ultra_snapshot_settings'); ?>
                
                <div class="ucp-settings-card">
                    <div class="ucp-settings-group">
                        <label class="ucp-toggle-label">
                            <input 
                                type="checkbox" 
                                name="snapshot_enabled" 
                                value="1" 
                                <?php checked($enabled, 1); ?>
                            />
                            <div>
                                <strong>Enable Daily Auto-Snapshots</strong>
                                <div class="ucp-settings-help">
                                    Automatically backup all Ultra Cards across your entire dashboard once per day
                                </div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="ucp-settings-group">
                        <label for="snapshot_time">Snapshot Time</label>
                        <div class="ucp-settings-help">
                            What time should snapshots be created? (24-hour format)
                        </div>
                        <input 
                            type="time" 
                            id="snapshot_time" 
                            name="snapshot_time" 
                            value="<?php echo esc_attr($time); ?>"
                        />
                    </div>
                    
                    <div class="ucp-settings-group">
                        <label for="snapshot_timezone">Timezone</label>
                        <div class="ucp-settings-help">
                            Snapshot time will use this timezone
                        </div>
                        <select id="snapshot_timezone" name="snapshot_timezone">
                            <?php foreach ($timezones as $value => $label): ?>
                                <option value="<?php echo esc_attr($value); ?>" <?php selected($timezone, $value); ?>>
                                    <?php echo esc_html($label); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="ucp-info-box">
                        <h4>📅 How it works</h4>
                        <p>
                            <strong>Dashboard Snapshots</strong> automatically back up <strong>all</strong> your Ultra Cards 
                            across your entire dashboard once per day. Snapshots are kept for <strong>30 days</strong> and 
                            include card positions for easy restoration.
                        </p>
                    </div>
                </div>
                
                <button type="submit" name="save_snapshot_settings" class="ucp-save-button">
                    💾 Save Settings
                </button>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }
    
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
     * Render Discord Connection panel content
     */
    private function render_discord_panel_content($link) {
        $user_id = get_current_user_id();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Rendering Discord panel content for link: ' . $link);
        }
        
        // Get Discord integration instance
        global $ultra_card_discord_integration;
        if (!$ultra_card_discord_integration) {
            return '<p>Discord integration not available.</p>';
        }
        
        $discord_status = $ultra_card_discord_integration->get_connection_status($user_id);
        $user = get_user_by('id', $user_id);
        $is_pro = $user && in_array('ultra_card_pro', $user->roles);
        
        ob_start();
        ?>
        <div class="ucp-discord-panel">
            <style>
                .ucp-discord-panel {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .ucp-discord-header {
                    background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
                    color: white;
                    padding: 32px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    text-align: center;
                }
                .ucp-discord-status {
                    display: inline-block;
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 20px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 14px;
                }
                .ucp-discord-card {
                    background: white;
                    border-radius: 12px;
                    padding: 28px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    margin-bottom: 24px;
                }
                .ucp-discord-connection {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .ucp-discord-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    border: 3px solid #5865F2;
                }
                .ucp-discord-info h3 {
                    margin: 0 0 8px 0;
                    color: #1a1a1a;
                    font-size: 20px;
                }
                .ucp-discord-info p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }
                .ucp-discord-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }
                .ucp-btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .ucp-btn-primary {
                    background: #5865F2;
                    color: white;
                }
                .ucp-btn-primary:hover {
                    background: #4752C4;
                    color: white;
                }
                .ucp-btn-danger {
                    background: #ED4245;
                    color: white;
                }
                .ucp-btn-danger:hover {
                    background: #C03C3E;
                    color: white;
                }
                .ucp-btn-secondary {
                    background: #f8f9fa;
                    color: #666;
                    border: 1px solid #e9ecef;
                }
                .ucp-btn-secondary:hover {
                    background: #e9ecef;
                    color: #333;
                }
                .ucp-discord-notice {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }
                .ucp-discord-success {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }
                .ucp-discord-benefits {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 24px;
                }
                .ucp-discord-benefits h4 {
                    margin: 0 0 16px 0;
                    color: #1a1a1a;
                    font-size: 16px;
                }
                .ucp-discord-benefits ul {
                    margin: 0;
                    padding-left: 20px;
                }
                .ucp-discord-benefits li {
                    margin-bottom: 8px;
                    color: #666;
                }
            </style>
            
            <div class="ucp-discord-header">
                <h2><i class="fab fa-discord"></i> Discord Connection</h2>
                <p>Connect your Discord account to access exclusive Pro channels and features</p>
            </div>
            
            <?php if ($discord_status['connected']): ?>
                <div class="ucp-discord-success">
                    <strong><i class="fas fa-check-circle"></i> Discord Connected!</strong>
                    <p>Your Discord account is successfully connected to your Ultra Card account.</p>
                </div>
                
                <div class="ucp-discord-card">
                    <div class="ucp-discord-connection">
                        <?php if ($discord_status['avatar']): ?>
                            <img src="https://cdn.discordapp.com/avatars/<?php echo esc_attr($discord_status['discord_id']); ?>/<?php echo esc_attr($discord_status['avatar']); ?>.png?size=64" 
                                 alt="Discord Avatar" class="ucp-discord-avatar">
                        <?php else: ?>
                            <div class="ucp-discord-avatar" style="background: #5865F2; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                                <i class="fab fa-discord"></i>
                            </div>
                        <?php endif; ?>
                        
                        <div class="ucp-discord-info">
                            <h3><?php echo esc_html($discord_status['username']); ?><?php echo esc_html($discord_status['discriminator'] ? '#' . $discord_status['discriminator'] : ''); ?></h3>
                            <p>Discord ID: <?php echo esc_html($discord_status['discord_id']); ?></p>
                            <?php if ($is_pro): ?>
                                <p><strong>✓ Pro role assigned in Discord</strong></p>
                            <?php else: ?>
                                <p>Pro role will be assigned automatically when you upgrade</p>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <div class="ucp-discord-actions">
                        <button type="button" class="ucp-btn ucp-btn-danger" onclick="disconnectDiscord()">
                            <i class="fas fa-unlink"></i> Disconnect Discord
                        </button>
                    </div>
                </div>
                
                <?php if ($is_pro): ?>
                    <div class="ucp-discord-benefits">
                        <h4><i class="fas fa-star"></i> Pro Benefits</h4>
                        <ul>
                            <li>Access to exclusive Pro-only Discord channels</li>
                            <li>Priority support in Discord</li>
                            <li>Early access to new features and beta releases</li>
                            <li>Special Discord roles and permissions</li>
                        </ul>
                    </div>
                <?php endif; ?>
                
            <?php else: ?>
                <div class="ucp-discord-notice">
                    <strong><i class="fas fa-info-circle"></i> Connect Your Discord Account</strong>
                    <p>Connect your Discord account to unlock exclusive Pro features and community access.</p>
                </div>
                
                <div class="ucp-discord-card">
                    <h3><i class="fab fa-discord"></i> Discord Integration</h3>
                    <p>By connecting your Discord account, you'll be able to:</p>
                    <ul>
                        <li>Automatically receive Pro role when you upgrade</li>
                        <li>Access exclusive Pro-only channels</li>
                        <li>Get priority support in Discord</li>
                        <li>Participate in Pro member discussions</li>
                    </ul>
                    
                    <div class="ucp-discord-actions">
                        <button type="button" class="ucp-btn ucp-btn-primary" onclick="connectDiscord()">
                            <i class="fab fa-discord"></i> Connect Discord Account
                        </button>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        
        <script>
        const ajaxurl = '<?php echo esc_url(admin_url('admin-ajax.php')); ?>';
        
        function connectDiscord(e) {
            if (e && e.target) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const button = e?.target || event.target;
            const originalText = button.innerHTML;
            
            console.log('Connect Discord button clicked, AJAX URL:', ajaxurl);
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            button.disabled = true;
            
            const nonce = '<?php echo wp_create_nonce('ultra_card_discord'); ?>';
            const body = 'action=ultra_card_discord_connect&nonce=' + nonce;
            
            console.log('Sending connect request...', body);
            
            fetch(ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body
            })
            .then(response => {
                console.log('Connect response received:', response);
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Connect data:', data);
                if (data.success && data.data.redirect_url) {
                    console.log('Redirecting to:', data.data.redirect_url);
                    window.location.href = data.data.redirect_url;
                } else {
                    const errorMsg = data.data || 'Failed to connect Discord account';
                    console.error('Connect failed:', errorMsg);
                    alert('Error: ' + errorMsg);
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            })
            .catch(error => {
                console.error('Connect error:', error);
                alert('Error: ' + error.message);
                button.innerHTML = originalText;
                button.disabled = false;
            });
        }
        
        function disconnectDiscord(e) {
            if (!confirm('Are you sure you want to disconnect your Discord account? You will lose access to Pro Discord features.')) {
                return;
            }
            
            if (e && e.target) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const button = e?.target || event.target;
            const originalText = button.innerHTML;
            
            console.log('Disconnect Discord button clicked, AJAX URL:', ajaxurl);
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Disconnecting...';
            button.disabled = true;
            
            const nonce = '<?php echo wp_create_nonce('ultra_card_discord'); ?>';
            const body = 'action=ultra_card_discord_disconnect&nonce=' + nonce;
            
            console.log('Sending disconnect request...', body);
            
            fetch(ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body
            })
            .then(response => {
                console.log('Disconnect response received:', response);
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Disconnect data:', data);
                if (data.success) {
                    console.log('Disconnect successful, reloading page...');
                    location.reload();
                } else {
                    const errorMsg = data.data || 'Failed to disconnect Discord account';
                    console.error('Disconnect failed:', errorMsg);
                    alert('Error: ' + errorMsg);
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            })
            .catch(error => {
                console.error('Disconnect error:', error);
                alert('Error: ' + error.message);
                button.innerHTML = originalText;
                button.disabled = false;
            });
        }
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Helper function to render Better Messages shortcode with fallback
     */
    private function render_better_messages_shortcode($shortcode = '') {
        // Default to main shortcode if none provided
        if (empty($shortcode)) {
            // Try bp-better-messages first (most common)
            $output = do_shortcode('[bp-better-messages]');
            
            // If shortcode wasn't processed (returns same string), try alternative
            if ($output === '[bp-better-messages]' || empty($output)) {
                $output = do_shortcode('[better_messages]');
                
                // If still not working, show helpful message
                if ($output === '[better_messages]' || empty($output)) {
                    $output = '<div class="ucp-alert" style="padding: 20px; background: #f8f9fa; border-left: 4px solid #667eea; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0;">Messages Loading...</h4>
                        <p style="margin: 0;">If messages don\'t appear, please ensure Better Messages plugin is installed and activated.</p>
                        <p style="margin: 10px 0 0 0;"><small>Debug: Tried [bp-better-messages] and [better_messages] shortcodes.</small></p>
                    </div>';
                }
            }
        } else {
            // Use provided shortcode
            $output = do_shortcode($shortcode);
        }
        
        return $output;
    }
    
    /**
     * Render Messages panel content
     */
    private function render_messages_panel_content($link) {
        $user_id = get_current_user_id();
        
        // Check if Better Messages is active - check multiple possible class/function names
        $bm_active = class_exists('Better_Messages') || 
                     class_exists('BP_Better_Messages') || 
                     function_exists('bp_better_messages') ||
                     function_exists('BP_Better_Messages');
        
        if (!$bm_active) {
            ob_start();
            ?>
            <div class="ucp-messages-panel">
                <style>
                    .ucp-messages-panel {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .ucp-alert {
                        background: #fff3cd;
                        border: 1px solid #ffc107;
                        color: #856404;
                        padding: 16px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    .ucp-alert h3 {
                        margin: 0 0 10px 0;
                    }
                </style>
                <div class="ucp-alert">
                    <h3><i class="fas fa-exclamation-triangle"></i> Better Messages Plugin Required</h3>
                    <p>The messaging system requires the Better Messages plugin to be installed and activated.</p>
                    <p>Please install and activate Better Messages to use the messaging features.</p>
                    <a href="https://www.better-messages.com/" target="_blank" class="ucp-btn" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                        Learn More About Better Messages
                    </a>
                </div>
            </div>
            <?php
            return ob_get_clean();
        }
        
        ob_start();
        ?>
        <div class="ucp-messages-panel">
            <style>
                .ucp-messages-panel {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .ucp-messages-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 32px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    text-align: center;
                }
                .ucp-messages-header h2 {
                    margin: 0 0 10px 0;
                    font-size: 28px;
                }
                .ucp-messages-header p {
                    margin: 0;
                    opacity: 0.9;
                }
                .ucp-messages-container {
                    background: white;
                    border-radius: 12px;
                    padding: 28px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    margin-bottom: 24px;
                    min-height: 500px; /* Ensure minimum height for AJAX loading */
                }
                /* Better Messages Integration Styles */
                .ucp-messages-container .bp-messages-wrap {
                    border-radius: 8px;
                    overflow: hidden;
                }
                .ucp-messages-container .bp-better-messages-list {
                    background: #f8f9fa;
                }
            </style>
            
            <!-- Single Conversations Interface for All Users -->
            <div class="ucp-messages-header">
                <h2><i class="fas fa-comments"></i> Conversations</h2>
                <p>Your messaging center</p>
            </div>
            
            <div class="ucp-messages-container" id="ucp-messages-container">
                <?php 
                // Debug: Log what we're about to render
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Ultra Card Messages: Rendering Better Messages shortcode');
                }
                
                // Render Better Messages shortcode
                $shortcode_output = $this->render_better_messages_shortcode();
                
                // Debug: Check what was rendered
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Ultra Card Messages: Shortcode output length: ' . strlen($shortcode_output) . ' bytes');
                    if (strpos($shortcode_output, '[bp-better-messages]') !== false || strpos($shortcode_output, '[better_messages]') !== false) {
                        error_log('Ultra Card Messages: WARNING - Shortcode was not processed!');
                    }
                }
                
                echo $shortcode_output;
                
                // Add visible debug info if shortcode didn't process
                if (strpos($shortcode_output, '[bp-better-messages]') !== false || strpos($shortcode_output, '[better_messages]') !== false) {
                    echo '<div style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; margin-top: 20px;">';
                    echo '<h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Better Messages Not Loading</h3>';
                    echo '<p style="margin: 0; color: #856404;">The Better Messages shortcode is not being processed. This usually means:</p>';
                    echo '<ul style="color: #856404; margin: 10px 0;">';
                    echo '<li>Better Messages plugin is not installed or activated</li>';
                    echo '<li>Shortcode execution is disabled for this page</li>';
                    echo '<li>There\'s a conflict with another plugin</li>';
                    echo '</ul>';
                    echo '<p style="margin: 10px 0 0 0;"><strong>Shortcode attempted:</strong> <code>' . esc_html($shortcode_output) . '</code></p>';
                    echo '</div>';
                }
                ?>
            </div>
            
            <script>
            // Force full page navigation for Messages panel (bypass Directories Pro AJAX)
            jQuery(document).ready(function($) {
                console.log('Ultra Card Messages: Setting up full page navigation...');
                
                // Function to force full page navigation to Messages panel
                function forceMessagesNavigation() {
                    // Find Messages panel links in the sidebar/accordion
                    const messagesLinks = $('a[href*="custom_ultra_card_messages"], a[href*="ultra_card_messages"]');
                    
                    console.log('Ultra Card Messages: Found ' + messagesLinks.length + ' messages links');
                    
                    messagesLinks.each(function() {
                        const link = $(this);
                        const href = link.attr('href');
                        
                        // Remove any existing click handlers
                        link.off('click');
                        
                        // Add new click handler that forces full page navigation
                        link.on('click', function(e) {
                            console.log('Ultra Card Messages: Messages link clicked, forcing full page load...');
                            
                            // Prevent Directories Pro AJAX
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            
                            // Force full page navigation
                            window.location.href = href;
                            
                            return false;
                        });
                        
                        console.log('Ultra Card Messages: Bound full page navigation to:', href);
                    });
                }
                
                // Run on page load
                forceMessagesNavigation();
                
                // Re-run after any DOM changes (in case accordion rebuilds)
                setTimeout(forceMessagesNavigation, 500);
                setTimeout(forceMessagesNavigation, 1000);
                
                // Listen for Directories Pro events and re-bind
                $(document).on('drts:panel:loaded drts:content:loaded', function() {
                    console.log('Ultra Card Messages: Directories Pro content loaded, re-binding navigation...');
                    setTimeout(forceMessagesNavigation, 100);
                });
                
                // Function to initialize Better Messages
                function initBetterMessages() {
                    console.log('Ultra Card Messages: Initializing Better Messages...');
                    
                    // Try to initialize Better Messages
                    if (typeof BP_Messages !== 'undefined') {
                        console.log('Ultra Card Messages: Found BP_Messages, initializing...');
                        if (BP_Messages.init) BP_Messages.init();
                    }
                    
                    if (typeof BetterMessages !== 'undefined') {
                        console.log('Ultra Card Messages: Found BetterMessages, initializing...');
                        if (BetterMessages.init) BetterMessages.init();
                    }
                    
                    // Trigger events
                    $(document).trigger('bp-better-messages-init');
                    $(document).trigger('better-messages-init');
                    $(document).trigger('bp_messages_init');
                    
                    // Force resize to ensure proper layout
                    setTimeout(function() {
                        window.dispatchEvent(new Event('resize'));
                    }, 100);
                }
                
                // Initialize Better Messages on page load
                setTimeout(initBetterMessages, 200);
                
                // Also initialize on window load
                window.addEventListener('load', function() {
                    setTimeout(initBetterMessages, 300);
                });
            });
            </script>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Register panel settings (empty for our use case)
     * This tells Directories Pro we don't need any custom settings
     */
    public function register_panel_settings($settings, $name, $current_settings) {
        // Handle Ultra Card panels
        if ($name === 'ultra_card_backups' || $name === 'ultra_card_membership' || $name === 'ultra_card_discord' || $name === 'ultra_card_messages') {
            // Return empty array - we don't need any custom settings
            return array();
        }
        
        return $settings;
    }
    

    /**
     * Prevent old alternative registration method from causing errors
     */
    public function register_panel_alternative() {
        // This method has been removed to prevent fatal errors
        // The Discord panel is now registered through the standard Directories Pro filters
        return;
    }

    /**
     * Enqueue dashboard assets (CSS & JS)
     */
    public function enqueue_dashboard_assets() {
        // Only enqueue if active and on dashboard pages
        if (!$this->is_active || !is_user_logged_in()) {
            return;
        }
        
        // Get current user info and inject into page
        $current_user = wp_get_current_user();
        $user_slug = $current_user->user_login; // This is what Directories Pro uses in URLs
        
        // Add global script to force Messages panel to use full page loads
        wp_add_inline_script('jquery', "
            // Inject current user slug for URL construction
            window.ultraCardCurrentUser = '" . esc_js($user_slug) . "';
            console.log('Ultra Card: Current user slug injected:', window.ultraCardCurrentUser);
            
            " . "
            jQuery(document).ready(function($) {
                console.log('Ultra Card: Global Messages navigation fix loaded');
                
                // SOLUTION: Intercept BUTTON clicks for Directories Pro accordion
                document.addEventListener('click', function(e) {
                    let target = e.target;
                    let attempts = 0;
                    
                    // Traverse up to find BUTTON or A tag
                    while (target && target !== document && attempts < 10) {
                        // Check for BUTTON with Messages panel class
                        if (target.tagName === 'BUTTON' && target.className.includes('drts-dashboard-panel-link')) {
                            const text = target.textContent || '';
                            const parentDiv = target.parentElement;
                            
                            // Check if this is the Messages button
                            if ((text.includes('Conversations') || text.includes('Messages')) && 
                                parentDiv && parentDiv.id && parentDiv.id.includes('ultra_card_messages')) {
                                
                                console.log('🎯 Ultra Card: CAPTURED Messages BUTTON click!');
                                console.log('   Button text:', text);
                                console.log('   Parent ID:', parentDiv.id);
                                
                                // Stop the click
                                e.preventDefault();
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                                
                                // Build the Messages URL
                                const userName = window.location.pathname.split('/dashboard/')[1].split('/')[0];
                                const messagesUrl = window.location.origin + '/dashboard/' + userName + '/custom_ultra_card_messages/?link=conversations';
                                
                                console.log('   Navigating to:', messagesUrl);
                                
                                // Force full page navigation
                                window.location.href = messagesUrl;
                                return false;
                            }
                        }
                        
                        // Also check for A tags (in case structure changes)
                        if (target.tagName === 'A') {
                            const href = target.href || target.getAttribute('href');
                            
                            if (href && (href.includes('ultra_card_messages') || href.includes('custom_ultra_card_messages'))) {
                                console.log('🎯 Ultra Card: CAPTURED Messages LINK click!');
                                
                                e.preventDefault();
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                                
                                let cleanUrl = href;
                                if (href.includes('customize.php?url=')) {
                                    const urlMatch = href.match(/url=([^&]+)/);
                                    if (urlMatch) {
                                        cleanUrl = decodeURIComponent(urlMatch[1]);
                                    }
                                }
                                
                                window.location.href = cleanUrl;
                                return false;
                            }
                        }
                        
                        target = target.parentElement;
                        attempts++;
                    }
                }, true);
                
                // BACKUP METHOD 1: jQuery button interceptor
                $(document).on('click.ultracard_button', '#drts-dashboard-panel-custom_ultra_card_messages button.drts-dashboard-panel-link', function(e) {
                    console.log('🔄 Ultra Card: BACKUP jQuery handler caught Messages BUTTON click!');
                    
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    const userName = window.location.pathname.split('/dashboard/')[1].split('/')[0];
                    const messagesUrl = window.location.origin + '/dashboard/' + userName + '/custom_ultra_card_messages/?link=conversations';
                    
                    console.log('   Navigating to:', messagesUrl);
                    window.location.href = messagesUrl;
                    return false;
                });
                
                // BACKUP METHOD 2: Also intercept using jQuery for links
                $(document).on('click.ultracard_priority', 'a[href*=\"ultra_card_messages\"], a[href*=\"custom_ultra_card_messages\"]', function(e) {
                    const href = $(this).attr('href');
                    console.log('🔄 Ultra Card: BACKUP jQuery handler caught Messages LINK click:', href);
                    
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    let cleanUrl = href;
                    if (href.includes('customize.php?url=')) {
                        const urlMatch = href.match(/url=([^&]+)/);
                        if (urlMatch) {
                            cleanUrl = decodeURIComponent(urlMatch[1]);
                        }
                    }
                    
                    window.location.href = cleanUrl;
                    return false;
                });
                
                // MOST AGGRESSIVE: Directly modify the button's onclick and remove Directories Pro handlers
                function hijackMessagesButton() {
                    const messagesButton = $('#drts-dashboard-panel-custom_ultra_card_messages button.drts-dashboard-panel-link');
                    
                    if (messagesButton.length > 0) {
                        console.log('✨ Ultra Card: Found Messages button, hijacking it completely!');
                        
                        // Remove ALL event handlers from this button
                        messagesButton.off();
                        
                        // Get all event data and remove it
                        const events = $._data(messagesButton[0], 'events');
                        if (events) {
                            $.each(events, function(type, handlers) {
                                messagesButton.off(type);
                            });
                        }
                        
                        // Set onclick directly (overrides everything)
                        messagesButton[0].onclick = function(e) {
                            console.log('🎯 Ultra Card: Messages button onclick fired!');
                            
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            
                            // Strategy 1: Use injected current user slug (most reliable)
                            let messagesUrl = '';
                            
                            if (window.ultraCardCurrentUser) {
                                messagesUrl = window.location.origin + '/dashboard/' + window.ultraCardCurrentUser + '/custom_ultra_card_messages/?link=conversations';
                                console.log('   Using injected user slug:', window.ultraCardCurrentUser);
                            }
                            
                            // Strategy 2: Try to get URL from any existing dashboard link
                            if (!messagesUrl) {
                                const anyPanelLink = $('a[href*=\"/dashboard/\"][href*=\"custom_ultra_card_\"]').first();
                            if (anyPanelLink.length > 0) {
                                const href = anyPanelLink.attr('href');
                                // Extract username from any panel URL
                                const match = href.match(/\\/dashboard\\/([^\\/]+)\\//);
                                if (match && match[1]) {
                                    const userName = match[1];
                                    messagesUrl = window.location.origin + '/dashboard/' + userName + '/custom_ultra_card_messages/?link=conversations';
                                    console.log('   Extracted username from other panel:', userName);
                                }
                            }
                            }
                            
                            // Strategy 3: Get from current URL if it has username
                            if (!messagesUrl) {
                                const pathname = window.location.pathname;
                                if (pathname.includes('/dashboard/')) {
                                    const pathParts = pathname.split('/dashboard/')[1];
                                    if (pathParts && pathParts.length > 0 && !pathParts.startsWith('?')) {
                                        const userName = pathParts.split('/')[0];
                                        if (userName) {
                                            messagesUrl = window.location.origin + '/dashboard/' + userName + '/custom_ultra_card_messages/?link=conversations';
                                            console.log('   Constructed URL from current pathname:', messagesUrl);
                                        }
                                    }
                                }
                            }
                            
                            // Strategy 4: Get current user login name from WordPress (if available in page)
                            if (!messagesUrl) {
                                const currentUserElement = $('[data-user], [data-username], .current-user').first();
                                if (currentUserElement.length > 0) {
                                    const userName = currentUserElement.data('user') || currentUserElement.data('username');
                                    if (userName) {
                                        messagesUrl = window.location.origin + '/dashboard/' + userName + '/custom_ultra_card_messages/?link=conversations';
                                        console.log('   Got username from data attribute:', userName);
                                    }
                                }
                            }
                            
                            if (messagesUrl) {
                                console.log('   ✅ Navigating to:', messagesUrl);
                                window.location.href = messagesUrl;
                            } else {
                                console.error('   ❌ ERROR: Could not construct Messages URL! This should not happen.');
                                console.error('   window.ultraCardCurrentUser:', window.ultraCardCurrentUser);
                                console.error('   window.location.pathname:', window.location.pathname);
                            }
                            
                            return false;
                        };
                        
                        // Also bind new jQuery handler with same URL logic
                        messagesButton.on('click', function(e) {
                            console.log('🎯 Ultra Card: Messages button jQuery handler fired!');
                            
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            
                            // Use same URL construction logic - start with injected user slug
                            let messagesUrl = '';
                            
                            if (window.ultraCardCurrentUser) {
                                messagesUrl = window.location.origin + '/dashboard/' + window.ultraCardCurrentUser + '/custom_ultra_card_messages/?link=conversations';
                                console.log('   Using injected user slug:', window.ultraCardCurrentUser);
                            }
                            
                            if (!messagesUrl) {
                                const anyPanelLink = $('a[href*=\"/dashboard/\"][href*=\"custom_ultra_card_\"]').first();
                                if (anyPanelLink.length > 0) {
                                    const href = anyPanelLink.attr('href');
                                    const match = href.match(/\\/dashboard\\/([^\\/]+)\\//);
                                    if (match && match[1]) {
                                        const userName = match[1];
                                        messagesUrl = window.location.origin + '/dashboard/' + userName + '/custom_ultra_card_messages/?link=conversations';
                                    }
                                }
                            }
                            
                            if (!messagesUrl) {
                                const pathname = window.location.pathname;
                                if (pathname.includes('/dashboard/')) {
                                    const pathParts = pathname.split('/dashboard/')[1];
                                    if (pathParts && pathParts.length > 0 && !pathParts.startsWith('?')) {
                                        const userName = pathParts.split('/')[0];
                                        if (userName) {
                                            messagesUrl = window.location.origin + '/dashboard/' + userName + '/custom_ultra_card_messages/?link=conversations';
                                        }
                                    }
                                }
                            }
                            
                            if (messagesUrl) {
                                console.log('   ✅ Navigating to:', messagesUrl);
                                window.location.href = messagesUrl;
                            } else {
                                console.error('   ❌ ERROR: Could not construct Messages URL!');
                                console.error('   window.ultraCardCurrentUser:', window.ultraCardCurrentUser);
                            }
                            
                            return false;
                        });
                        
                        console.log('✅ Ultra Card: Messages button completely hijacked!');
                    } else {
                        console.log('⚠️ Ultra Card: Messages button not found yet, will retry...');
                    }
                }
                
                // Run hijack immediately
                hijackMessagesButton();
                
                // Keep trying to hijack the button as it may be created dynamically
                setInterval(hijackMessagesButton, 1000);
                
                // Also hijack after any Directories Pro events
                $(document).on('drts:panel:loaded drts:content:loaded drts:ready', function() {
                    setTimeout(hijackMessagesButton, 50);
                });
                
                console.log('Ultra Card: Messages button hijacker installed');
            });
        ");
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
    ultra_card_integration_run_migrations();
    wp_cache_flush();
}

/**
 * Keep scheduled maintenance hooks in sync.
 */
function ultra_card_integration_schedule_events() {
    if (!wp_next_scheduled('ultra_card_prune_backups')) {
        wp_schedule_event(time(), 'daily', 'ultra_card_prune_backups');
    }
    if (!wp_next_scheduled('ultra_card_cleanup_sessions')) {
        wp_schedule_event(time(), 'daily', 'ultra_card_cleanup_sessions');
    }
}

/**
 * Unschedule all plugin maintenance hooks.
 */
function ultra_card_integration_clear_events() {
    wp_clear_scheduled_hook('ultra_card_prune_backups');
    wp_clear_scheduled_hook('ultra_card_cleanup_sessions');
}

/**
 * Run schema/version migrations for the plugin.
 */
function ultra_card_integration_run_migrations() {
    ultra_card_create_database_tables();
    ultra_card_fix_sessions_table_constraints();
    ultra_card_add_ha_user_id_column();
    ultra_card_integration_schedule_events();
    update_option('ultra_card_integration_version', ULTRA_CARD_INTEGRATION_VERSION);
}

/**
 * Upgrade plugin data when the stored version is behind the code version.
 */
function ultra_card_integration_maybe_upgrade() {
    $stored_version = get_option('ultra_card_integration_version');
    if ($stored_version !== ULTRA_CARD_INTEGRATION_VERSION) {
        ultra_card_integration_run_migrations();
    }
}
add_action('plugins_loaded', 'ultra_card_integration_maybe_upgrade');

/**
 * Fix sessions table constraints for multi-device support
 */
function ultra_card_fix_sessions_table_constraints() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'ultra_card_sessions';
    
    // Check if the old unique constraint exists
    $constraints = $wpdb->get_results("SHOW INDEX FROM {$table_name} WHERE Key_name = 'session_id'");
    
    if (!empty($constraints)) {
        // Remove the old unique constraint
        $wpdb->query("ALTER TABLE {$table_name} DROP INDEX session_id");
        
        // Add the new composite unique constraint
        $wpdb->query("ALTER TABLE {$table_name} ADD UNIQUE KEY session_device (session_id, device_id)");
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Fixed sessions table constraints for multi-device support');
        }
    }
}

/**
 * Add Home Assistant user ID column to sessions table
 */
function ultra_card_add_ha_user_id_column() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'ultra_card_sessions';
    
    // Check if column already exists
    $column_exists = $wpdb->get_results(
        "SHOW COLUMNS FROM {$table_name} LIKE 'ha_user_id'"
    );
    
    if (empty($column_exists)) {
        $wpdb->query(
            "ALTER TABLE {$table_name} 
            ADD COLUMN ha_user_id varchar(255) AFTER user_id,
            ADD KEY ha_user_id (ha_user_id)"
        );
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Added ha_user_id column to sessions table');
        }
    }
}

/**
 * Create database tables for admin dashboard
 */
function ultra_card_create_database_tables() {
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    
    // API Keys table
    $api_keys_table = $wpdb->prefix . 'ultra_card_api_keys';
    $api_keys_sql = "CREATE TABLE IF NOT EXISTS {$api_keys_table} (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        api_key varchar(255) NOT NULL,
        permission varchar(50) NOT NULL DEFAULT 'read',
        created_at datetime NOT NULL,
        last_used_at datetime DEFAULT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY api_key (api_key)
    ) $charset_collate;";
    
    // API Logs table
    $api_logs_table = $wpdb->prefix . 'ultra_card_api_logs';
    $api_logs_sql = "CREATE TABLE IF NOT EXISTS {$api_logs_table} (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        endpoint varchar(255) NOT NULL,
        method varchar(10) NOT NULL,
        status_code int(11) NOT NULL,
        ip_address varchar(45) DEFAULT NULL,
        user_agent text DEFAULT NULL,
        created_at datetime NOT NULL,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY created_at (created_at),
        KEY endpoint (endpoint)
    ) $charset_collate;";
    
    // Session Sync table for cross-device authentication
    $sessions_table = $wpdb->prefix . 'ultra_card_sessions';
    $sessions_sql = "CREATE TABLE IF NOT EXISTS {$sessions_table} (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        session_id varchar(64) NOT NULL,
        user_id bigint(20) UNSIGNED NOT NULL,
        ha_user_id varchar(255) NOT NULL,
        user_data longtext NOT NULL,
        device_id varchar(255),
        device_name varchar(255),
        created_at datetime NOT NULL,
        last_validated datetime NOT NULL,
        expires_at datetime NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY session_device (session_id, device_id),
        KEY user_id (user_id),
        KEY ha_user_id (ha_user_id),
        KEY expires_at (expires_at)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($api_keys_sql);
    dbDelta($api_logs_sql);
    dbDelta($sessions_sql);
    
    // Fix existing sessions table if it has the old unique constraint
    ultra_card_fix_sessions_table_constraints();
    
    // Add Home Assistant user ID column for cross-device sync
    ultra_card_add_ha_user_id_column();
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Ultra Card: Database tables created successfully');
    }
}

/**
 * Plugin deactivation hook
 */
register_deactivation_hook(__FILE__, 'ultra_card_integration_deactivate');
function ultra_card_integration_deactivate() {
    ultra_card_integration_clear_events();
    wp_cache_flush();
}

/**
 * Plugin uninstall hook
 */
register_uninstall_hook(__FILE__, 'ultra_card_integration_uninstall');
function ultra_card_integration_uninstall() {
    ultra_card_integration_clear_events();
    delete_option('ultra_card_integration_version');
    
    // Note: We don't delete Ultra Card data (favorites, colors, reviews) 
    // as users may want to keep their synced data
}

/**
 * Register REST API fields for Directories Pro presets to expose ratings
 * This extracts the _drts_review_rating meta and exposes it as clean rating/rating_count fields
 */
add_action('rest_api_init', 'ultra_card_register_preset_rating_fields', 999);
function ultra_card_register_preset_rating_fields() {
    // Register for the Directories Pro presets post type
    // Common Directories Pro post type names: presets_dir_ltg, drts_listing, etc.
    $post_types = array('presets_dir_ltg', 'drts_listing', 'presets');
    
    foreach ($post_types as $post_type) {
        // Only register if the post type exists
        if (!post_type_exists($post_type)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Post type '{$post_type}' does not exist, skipping REST field registration");
            }
            continue;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Ultra Card: Registering preset_meta REST field for post type '{$post_type}'");
        }
        
        // FORCE: Unregister any existing field first
        global $wp_rest_additional_fields;
        if (isset($wp_rest_additional_fields[$post_type]['preset_meta'])) {
            unset($wp_rest_additional_fields[$post_type]['preset_meta']);
        }
        
        // Register preset_meta field that includes rating data
        // Use the backwards-compatible wrapper to ensure it works
        register_rest_field($post_type, 'preset_meta', array(
            'get_callback' => 'ultra_card_get_preset_meta_with_ratings',
            'update_callback' => null,
            'schema' => array(
                'type' => 'object',
                'description' => 'Preset metadata including ratings from Directories Pro (v3)',
                'context' => array('view', 'edit'),
            ),
        ));
    }
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Ultra Card: Preset rating fields registration complete');
    }
}

/**
 * Get preset meta with Directories Pro ratings extracted
 * Uses multiple methods to find voting data
 * V2: Fixed to use correct meta key (_drts_voting_rating) and proper data extraction
 */
function ultra_card_get_preset_meta_with_ratings_v2($post, $field_name, $request) {
    $post_id = $post['id'];
    global $wpdb;
    
    // Get standard post meta from wp_postmeta
    $all_meta = get_post_meta($post_id);
    
    // Initialize preset meta array
    $preset_meta = array();
    
    // Extract data from _drts_field_preset_code (contains shortcode)
    // Try multiple possible field names used by Directories Pro
    $shortcode_field_names = array(
        '_drts_field_preset_code',
        '_drts_field_code',
        '_drts_field_shortcode',
        '_drts_field_preset_shortcode',
        '_drts_field_ultra_card_code',
        '_drts_field_card_code',
        'preset_code',
        'shortcode',
        'code'
    );
    
    $shortcode_found = false;
    
    foreach ($shortcode_field_names as $field_name) {
        if (isset($all_meta[$field_name][0]) && !$shortcode_found) {
            $preset_code_data = maybe_unserialize($all_meta[$field_name][0]);
            
            // Try different data structures
            if (is_string($preset_code_data) && !empty($preset_code_data)) {
                // Direct string value
                $preset_meta['shortcode'] = $preset_code_data;
                $shortcode_found = true;
            } elseif (is_array($preset_code_data)) {
                // Try [0]['value'] structure (Directories Pro standard)
                if (isset($preset_code_data[0]['value']) && !empty($preset_code_data[0]['value'])) {
                    $preset_meta['shortcode'] = $preset_code_data[0]['value'];
                    $shortcode_found = true;
                }
                // Try ['value'] structure
                elseif (isset($preset_code_data['value']) && !empty($preset_code_data['value'])) {
                    $preset_meta['shortcode'] = $preset_code_data['value'];
                    $shortcode_found = true;
                }
                // Try [0] as direct value
                elseif (isset($preset_code_data[0]) && is_string($preset_code_data[0]) && !empty($preset_code_data[0])) {
                    $preset_meta['shortcode'] = $preset_code_data[0];
                    $shortcode_found = true;
                }
            }
            
            if ($shortcode_found) {
                break;
            }
        }
    }
    
    // FALLBACK: Query Directories Pro entity field tables directly
    if (!$shortcode_found) {
        // Try wp_drts_entity_field_text table (for text/textarea fields)
        $text_field_names = array('preset_code', 'code', 'shortcode', 'preset_shortcode', 'ultra_card_code', 'card_code');
        
        foreach ($text_field_names as $field_name) {
            $text_query = $wpdb->prepare(
                "SELECT value FROM {$wpdb->prefix}drts_entity_field_text 
                 WHERE entity_id = %d AND field_name = %s 
                 LIMIT 1",
                $post_id,
                $field_name
            );
            
            $text_value = $wpdb->get_var($text_query);
            
            if ($text_value && !empty(trim($text_value))) {
                $preset_meta['shortcode'] = $text_value;
                $shortcode_found = true;
                break;
            }
        }
    }
    
    // FALLBACK 2: Try wp_drts_entity_field_longtext table (for longer text fields)
    if (!$shortcode_found) {
        $longtext_field_names = array('preset_code', 'code', 'shortcode', 'preset_shortcode', 'ultra_card_code', 'card_code');
        
        foreach ($longtext_field_names as $field_name) {
            $longtext_query = $wpdb->prepare(
                "SELECT value FROM {$wpdb->prefix}drts_entity_field_longtext 
                 WHERE entity_id = %d AND field_name = %s 
                 LIMIT 1",
                $post_id,
                $field_name
            );
            
            $longtext_value = $wpdb->get_var($longtext_query);
            
            if ($longtext_value && !empty(trim($longtext_value))) {
                $preset_meta['shortcode'] = $longtext_value;
                $shortcode_found = true;
                break;
            }
        }
    }
    
    // Debug: Log all meta keys if shortcode not found (only in debug mode)
    if (!$shortcode_found && defined('WP_DEBUG') && WP_DEBUG) {
        error_log("Ultra Card: Shortcode NOT found for preset $post_id");
        error_log("Ultra Card: Available meta keys: " . implode(', ', array_keys($all_meta)));
        
        // Log meta keys that contain 'code' or 'shortcode'
        foreach ($all_meta as $key => $value) {
            if (stripos($key, 'code') !== false || stripos($key, 'shortcode') !== false) {
                error_log("Ultra Card: Found potential field '$key' with value: " . print_r($value, true));
            }
        }
        
        // Also check what text fields exist for this entity
        $all_text_fields = $wpdb->get_results($wpdb->prepare(
            "SELECT field_name, LEFT(value, 100) as value_preview FROM {$wpdb->prefix}drts_entity_field_text WHERE entity_id = %d",
            $post_id
        ));
        if ($all_text_fields) {
            error_log("Ultra Card: Text fields for entity $post_id: " . print_r($all_text_fields, true));
        }
        
        $all_longtext_fields = $wpdb->get_results($wpdb->prepare(
            "SELECT field_name, LEFT(value, 100) as value_preview FROM {$wpdb->prefix}drts_entity_field_longtext WHERE entity_id = %d",
            $post_id
        ));
        if ($all_longtext_fields) {
            error_log("Ultra Card: Longtext fields for entity $post_id: " . print_r($all_longtext_fields, true));
        }
    }
    
    // FALLBACK 3: Search for ANY field containing Ultra Card shortcode pattern
    if (!$shortcode_found) {
        // Look in text fields for [ultra pattern
        $pattern_search = $wpdb->get_row($wpdb->prepare(
            "SELECT field_name, value FROM {$wpdb->prefix}drts_entity_field_text 
             WHERE entity_id = %d AND (value LIKE %s OR value LIKE %s OR value LIKE %s)
             LIMIT 1",
            $post_id,
            '%[ultra_card]%',
            '%[ultra-card]%',
            '%\"rows\":%'
        ));
        
        if ($pattern_search && !empty($pattern_search->value)) {
            $preset_meta['shortcode'] = $pattern_search->value;
            $shortcode_found = true;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card: Found shortcode in text field '{$pattern_search->field_name}' via pattern search");
            }
        }
        
        // Look in longtext fields for [ultra pattern
        if (!$shortcode_found) {
            $pattern_search_long = $wpdb->get_row($wpdb->prepare(
                "SELECT field_name, value FROM {$wpdb->prefix}drts_entity_field_longtext 
                 WHERE entity_id = %d AND (value LIKE %s OR value LIKE %s OR value LIKE %s)
                 LIMIT 1",
                $post_id,
                '%[ultra_card]%',
                '%[ultra-card]%',
                '%\"rows\":%'
            ));
            
            if ($pattern_search_long && !empty($pattern_search_long->value)) {
                $preset_meta['shortcode'] = $pattern_search_long->value;
                $shortcode_found = true;
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Ultra Card: Found shortcode in longtext field '{$pattern_search_long->field_name}' via pattern search");
                }
            }
        }
        
        // Look in post_meta for [ultra pattern
        if (!$shortcode_found) {
            foreach ($all_meta as $key => $value) {
                if (is_array($value) && isset($value[0])) {
                    $meta_value = maybe_unserialize($value[0]);
                    $search_value = is_string($meta_value) ? $meta_value : (is_array($meta_value) ? json_encode($meta_value) : '');
                    
                    if (strpos($search_value, '[ultra_card]') !== false || 
                        strpos($search_value, '[ultra-card]') !== false || 
                        strpos($search_value, '"rows":') !== false) {
                        
                        // Extract the actual value
                        if (is_string($meta_value)) {
                            $preset_meta['shortcode'] = $meta_value;
                        } elseif (is_array($meta_value) && isset($meta_value[0]['value'])) {
                            $preset_meta['shortcode'] = $meta_value[0]['value'];
                        } elseif (is_array($meta_value) && isset($meta_value['value'])) {
                            $preset_meta['shortcode'] = $meta_value['value'];
                        }
                        
                        if (isset($preset_meta['shortcode'])) {
                            $shortcode_found = true;
                            if (defined('WP_DEBUG') && WP_DEBUG) {
                                error_log("Ultra Card: Found shortcode in meta key '$key' via pattern search");
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // Extract category from _drts_directory_category
    if (isset($all_meta['_drts_directory_category'][0])) {
        $category_data = maybe_unserialize($all_meta['_drts_directory_category'][0]);
        if (is_array($category_data)) {
            $categories = array();
            foreach ($category_data as $cat) {
                if (isset($cat['slug'])) {
                    $categories[] = $cat['slug'];
                } elseif (isset($cat['name'])) {
                    $categories[] = $cat['name'];
                }
            }
            $preset_meta['category'] = !empty($categories) ? $categories[0] : 'widgets';
        }
    }
    
    // Extract tags from _drts_directory_tag
    if (isset($all_meta['_drts_directory_tag'][0])) {
        $tag_data = maybe_unserialize($all_meta['_drts_directory_tag'][0]);
        if (is_array($tag_data)) {
            $tags = array();
            foreach ($tag_data as $tag) {
                if (isset($tag['slug'])) {
                    $tags[] = $tag['slug'];
                } elseif (isset($tag['name'])) {
                    $tags[] = $tag['name'];
                }
            }
            $preset_meta['tags'] = implode(',', $tags);
        }
    }
    
    // Get post object for description
    // description = plain text for search/preview; description_html = safe HTML for Read More
    $post_obj = get_post($post_id);
    if ($post_obj) {
        $preset_meta['description']      = wp_strip_all_tags($post_obj->post_content);
        $preset_meta['description_html'] = wp_kses_post($post_obj->post_content);
    }
    
    // Extract gallery from wp_drts_entity_field_wp_image table (with caching)
    $preset_meta['gallery'] = array();
    
    // Check transient cache first (cached for 5 minutes)
    $cache_key = 'uc_gallery_' . $post_id;
    $cached_gallery = get_transient($cache_key);
    
    if ($cached_gallery !== false) {
        $preset_meta['gallery'] = $cached_gallery;
    } else {
        // Query the Directories Pro image field table
        $gallery_query = $wpdb->prepare(
            "SELECT attachment_id, weight 
             FROM {$wpdb->prefix}drts_entity_field_wp_image 
             WHERE entity_id = %d 
             AND field_name = 'directory_photos' 
             ORDER BY weight ASC, display_order ASC",
            $post_id
        );
        
        $gallery_rows = $wpdb->get_results($gallery_query);
        
        if ($gallery_rows) {
            foreach ($gallery_rows as $row) {
                // Get the attachment URL (try large size first, then full, then original)
                $image_url = wp_get_attachment_image_url($row->attachment_id, 'large');
                if (!$image_url) {
                    $image_url = wp_get_attachment_image_url($row->attachment_id, 'full');
                }
                if (!$image_url) {
                    $image_url = wp_get_attachment_url($row->attachment_id);
                }
                
                if ($image_url) {
                    $preset_meta['gallery'][] = $image_url;
                }
            }
        }
        
        // Cache the gallery for 5 minutes
        set_transient($cache_key, $preset_meta['gallery'], 5 * MINUTE_IN_SECONDS);
    }
    
    // Downloads are incremented by POST /presets/{id}/track-download into post meta `downloads`.
    $preset_meta['downloads'] = (int) get_post_meta($post_id, 'downloads', true);
    $preset_meta['difficulty'] = 'beginner';
    $preset_meta['compatibility'] = '';
    
    // Initialize rating defaults
    $preset_meta['rating'] = 0;
    $preset_meta['rating_count'] = 0;
    
    $rating_found = false;
    
    // METHOD 1: Direct query to wp_postmeta for _drts_voting_rating
    $direct_meta = $wpdb->get_var($wpdb->prepare(
        "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = '_drts_voting_rating'",
        $post_id
    ));
    
    if ($direct_meta) {
        $rating_data = maybe_unserialize($direct_meta);
        
        if (is_array($rating_data)) {
            if (isset($rating_data[0][''])) {
                $data = $rating_data[0][''];
                $preset_meta['rating'] = isset($data['average']) ? floatval($data['average']) : 0;
                $preset_meta['rating_count'] = isset($data['count']) ? intval($data['count']) : 0;
                $rating_found = true;
            }
            elseif (isset($rating_data[''])) {
                $data = $rating_data[''];
                $preset_meta['rating'] = isset($data['average']) ? floatval($data['average']) : 0;
                $preset_meta['rating_count'] = isset($data['count']) ? intval($data['count']) : 0;
                $rating_found = true;
            }
            elseif (isset($rating_data['average'])) {
                $preset_meta['rating'] = floatval($rating_data['average']);
                $preset_meta['rating_count'] = isset($rating_data['count']) ? intval($rating_data['count']) : 0;
                $rating_found = true;
            }
        }
    }
    
    // METHOD 2: Try Directories Pro API (fallback)
    if (!$rating_found && function_exists('drts')) {
        try {
            $app = drts();
            if ($app && method_exists($app, 'Entity_Entity')) {
                $entity = $app->Entity_Entity($post_id);
                if ($entity && method_exists($entity, 'getFieldValue')) {
                    $voting = $entity->getFieldValue('voting_rating');
                    if ($voting && is_array($voting)) {
                        if (isset($voting[0][''])) {
                            $data = $voting[0][''];
                            $preset_meta['rating'] = isset($data['average']) ? floatval($data['average']) : 0;
                            $preset_meta['rating_count'] = isset($data['count']) ? intval($data['count']) : 0;
                            $rating_found = true;
                        } elseif (isset($voting['']) && is_array($voting[''])) {
                            $data = $voting[''];
                            $preset_meta['rating'] = isset($data['average']) ? floatval($data['average']) : 0;
                            $preset_meta['rating_count'] = isset($data['count']) ? intval($data['count']) : 0;
                            $rating_found = true;
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // Silently fail - fallback to next method
        }
    }
    
    // METHOD 3: Check get_post_meta result for _drts_voting_rating
    if (!$rating_found && isset($all_meta['_drts_voting_rating'][0])) {
        $rating_data = maybe_unserialize($all_meta['_drts_voting_rating'][0]);
        
        if (is_array($rating_data)) {
            // Try nested array structure
            if (isset($rating_data[0][''])) {
                $data = $rating_data[0][''];
                $preset_meta['rating'] = isset($data['average']) ? floatval($data['average']) : 0;
                $preset_meta['rating_count'] = isset($data['count']) ? intval($data['count']) : 0;
                $rating_found = true;
            }
            // Try direct structure
            elseif (isset($rating_data['']) && is_array($rating_data[''])) {
                $data = $rating_data[''];
                $preset_meta['rating'] = isset($data['average']) ? floatval($data['average']) : 0;
                $preset_meta['rating_count'] = isset($data['count']) ? intval($data['count']) : 0;
                $rating_found = true;
            }
            // Try very direct structure
            elseif (isset($rating_data['average'])) {
                $preset_meta['rating'] = floatval($rating_data['average']);
                $preset_meta['rating_count'] = isset($rating_data['count']) ? intval($rating_data['count']) : 0;
                $rating_found = true;
            }
        }
    }
    
    // Fallback: If downloads not set, default to 0
    if (!isset($preset_meta['downloads'])) {
        $preset_meta['downloads'] = 0;
    }
    
    // Ensure preset URL is available
    if (!isset($preset_meta['preset_url'])) {
        $preset_meta['preset_url'] = get_permalink($post_id);
    }
    
    return $preset_meta;
}

/**
 * Backwards compatibility wrapper
 * In case WordPress is still calling the old function name
 */
if (!function_exists('ultra_card_get_preset_meta_with_ratings')) {
    function ultra_card_get_preset_meta_with_ratings($post, $field_name, $request) {
        return ultra_card_get_preset_meta_with_ratings_v2($post, $field_name, $request);
    }
}

/**
 * Add CORS headers to preset endpoints for cross-origin requests
 * Ensures Ultra Card can fetch ratings from ultracard.io
 */
add_filter('rest_pre_serve_request', 'ultra_card_add_preset_cors_headers', 10, 4);
function ultra_card_add_preset_cors_headers($served, $result, $request, $server) {
    // Only apply to our preset endpoints
    $route = $request->get_route();
    
    if (strpos($route, '/presets') !== false || strpos($route, '/wp/v2/presets_dir_ltg') !== false) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 3600');
    }
    
    return $served;
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
    
    // Initialize the Discord integration (only once)
    global $ultra_card_discord_integration;
    if (!isset($ultra_card_discord_integration) || !$ultra_card_discord_integration) {
        try {
            $ultra_card_discord_integration = new UltraCardDiscordIntegration();
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Discord integration initialized successfully');
            }
        } catch (Exception $e) {
            error_log('Ultra Card: Discord integration failed to initialize - ' . $e->getMessage());
            $ultra_card_discord_integration = null;
        }
    }
    
    // Initialize the dashboard integration (only if Directories Pro is active)
    if (class_exists('SabaiApps\\Directories\\Application')) {
        // Use a global variable to ensure single instance
        global $ultra_card_dashboard_integration;
        if (!$ultra_card_dashboard_integration) {
            $ultra_card_dashboard_integration = new UltraCardDashboardIntegration($ultra_card_cloud_sync);
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card: Directories Pro dashboard integration initialized');
            }
        }
    } else {
        add_action('admin_notices', 'ultra_card_integration_directories_notice');
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Directories Pro not found - Discord panel will only be available in WordPress admin');
        }
    }
    
    // Initialize the new comprehensive admin dashboard (for administrators only)
    global $ultra_card_admin_dashboard;
    if (!$ultra_card_admin_dashboard) {
        $ultra_card_admin_dashboard = new UltraCardAdminDashboard($ultra_card_cloud_sync, $ultra_card_discord_integration);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card: Admin dashboard initialized');
        }
    }
    
    // Add Discord panel to stock WordPress dashboard as fallback for regular users (not admins)
    // Uses priority 20 to load after the admin dashboard (priority 5)
    add_action('admin_menu', 'ultra_card_add_discord_admin_menu', 20);
}

/**
 * Add Discord panel to stock WordPress dashboard
 * This is now only for non-admin users, as admins use the comprehensive dashboard
 */
function ultra_card_add_discord_admin_menu() {
    // Skip if user has manage_options capability (they'll see the admin dashboard instead)
    if (current_user_can('manage_options')) {
        return;
    }
    
    // Add Discord panel to WordPress admin (works in both Directories Pro and stock WordPress)
    // Only add if not already added
    static $menu_added = false;
    if ($menu_added) {
        return;
    }
    
    add_menu_page(
        'Discord Connection',
        'Discord',
        'read',
        'ultra-card-discord-panel',
        'ultra_card_render_discord_panel',
        'dashicons-buddicons-replies', // Discord-like icon
        30
    );
    
    $menu_added = true;
}

/**
 * Render Discord panel for stock WordPress dashboard
 */
function ultra_card_render_discord_panel() {
    global $ultra_card_discord_integration;
    
    if (!$ultra_card_discord_integration) {
        echo '<div class="wrap"><h1>Discord Connection</h1><p>Discord integration not available.</p></div>';
        return;
    }
    
    $user_id = get_current_user_id();
    $discord_status = $ultra_card_discord_integration->get_connection_status($user_id);
    $user = get_user_by('id', $user_id);
    $is_pro = $user && in_array('ultra_card_pro', $user->roles);
    
    ?>
    <div class="wrap">
        <h1><span class="dashicons dashicons-buddicons-replies"></span> Discord Connection</h1>
        
        <style>
            .ucp-discord-panel {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 20px 0;
            }
            .ucp-discord-header {
                background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
                color: white;
                padding: 32px;
                border-radius: 16px;
                margin-bottom: 24px;
                text-align: center;
            }
            .ucp-discord-card {
                background: white;
                border-radius: 12px;
                padding: 28px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                margin-bottom: 24px;
                border: 1px solid #e1e5e9;
            }
            .ucp-discord-connection {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 24px;
            }
            .ucp-discord-avatar {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                border: 3px solid #5865F2;
            }
            .ucp-discord-info h3 {
                margin: 0 0 8px 0;
                color: #1a1a1a;
                font-size: 20px;
            }
            .ucp-discord-info p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            .ucp-discord-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }
            .ucp-btn {
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s ease;
                border: none;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            .ucp-btn-primary {
                background: #5865F2;
                color: white;
            }
            .ucp-btn-primary:hover {
                background: #4752C4;
                color: white;
            }
            .ucp-btn-danger {
                background: #ED4245;
                color: white;
            }
            .ucp-btn-danger:hover {
                background: #C03C3E;
                color: white;
            }
            .ucp-discord-notice {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 24px;
            }
            .ucp-discord-success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 24px;
            }
        </style>
        
        <div class="ucp-discord-panel">
            <div class="ucp-discord-header">
                <h2><span class="dashicons dashicons-buddicons-replies"></span> Discord Connection</h2>
                <p>Connect your Discord account to access exclusive Pro channels and features</p>
            </div>
            
            <?php if ($discord_status['connected']): ?>
                <div class="ucp-discord-success">
                    <strong><span class="dashicons dashicons-yes-alt"></span> Discord Connected!</strong>
                    <p>Your Discord account is successfully connected to your Ultra Card account.</p>
                </div>
                
                <div class="ucp-discord-card">
                    <div class="ucp-discord-connection">
                        <?php if ($discord_status['avatar']): ?>
                            <img src="https://cdn.discordapp.com/avatars/<?php echo esc_attr($discord_status['discord_id']); ?>/<?php echo esc_attr($discord_status['avatar']); ?>.png?size=64" 
                                 alt="Discord Avatar" class="ucp-discord-avatar">
                        <?php else: ?>
                            <div class="ucp-discord-avatar" style="background: #5865F2; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                                <span class="dashicons dashicons-buddicons-replies"></span>
                            </div>
                        <?php endif; ?>
                        
                        <div class="ucp-discord-info">
                            <h3><?php echo esc_html($discord_status['username']); ?><?php echo esc_html($discord_status['discriminator'] ? '#' . $discord_status['discriminator'] : ''); ?></h3>
                            <p>Discord ID: <?php echo esc_html($discord_status['discord_id']); ?></p>
                            <?php if ($is_pro): ?>
                                <p><strong>✓ Pro role assigned in Discord</strong></p>
                            <?php else: ?>
                                <p>Pro role will be assigned automatically when you upgrade</p>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <div class="ucp-discord-actions">
                        <button type="button" class="ucp-btn ucp-btn-danger" onclick="disconnectDiscord()">
                            <span class="dashicons dashicons-dismiss"></span> Disconnect Discord
                        </button>
                    </div>
                </div>
                
            <?php else: ?>
                <div class="ucp-discord-notice">
                    <strong><span class="dashicons dashicons-info"></span> Connect Your Discord Account</strong>
                    <p>Connect your Discord account to unlock exclusive Pro features and community access.</p>
                </div>
                
                <div class="ucp-discord-card">
                    <h3><span class="dashicons dashicons-buddicons-replies"></span> Discord Integration</h3>
                    <p>By connecting your Discord account, you'll be able to:</p>
                    <ul>
                        <li>Automatically receive Pro role when you upgrade</li>
                        <li>Access exclusive Pro-only channels</li>
                        <li>Get priority support in Discord</li>
                        <li>Participate in Pro member discussions</li>
                    </ul>
                    
                    <div class="ucp-discord-actions">
                        <button type="button" class="ucp-btn ucp-btn-primary" onclick="connectDiscord()">
                            <span class="dashicons dashicons-buddicons-replies"></span> Connect Discord Account
                        </button>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        
        <script>
        const ajaxurl = '<?php echo esc_url(admin_url('admin-ajax.php')); ?>';
        
        function connectDiscord(e) {
            if (e && e.target) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const button = e?.target || event.target;
            const originalText = button.innerHTML;
            
            console.log('Connect Discord button clicked, AJAX URL:', ajaxurl);
            
            button.innerHTML = '<span class="dashicons dashicons-update"></span> Connecting...';
            button.disabled = true;
            
            const nonce = '<?php echo wp_create_nonce('ultra_card_discord'); ?>';
            const body = 'action=ultra_card_discord_connect&nonce=' + nonce;
            
            console.log('Sending connect request...', body);
            
            fetch(ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body
            })
            .then(response => {
                console.log('Connect response received:', response);
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Connect data:', data);
                if (data.success && data.data.redirect_url) {
                    console.log('Redirecting to:', data.data.redirect_url);
                    window.location.href = data.data.redirect_url;
                } else {
                    const errorMsg = data.data || 'Failed to connect Discord account';
                    console.error('Connect failed:', errorMsg);
                    alert('Error: ' + errorMsg);
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            })
            .catch(error => {
                console.error('Connect error:', error);
                alert('Error: ' + error.message);
                button.innerHTML = originalText;
                button.disabled = false;
            });
        }
        
        function disconnectDiscord(e) {
            if (!confirm('Are you sure you want to disconnect your Discord account? You will lose access to Pro Discord features.')) {
                return;
            }
            
            if (e && e.target) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const button = e?.target || event.target;
            const originalText = button.innerHTML;
            
            console.log('Disconnect Discord button clicked, AJAX URL:', ajaxurl);
            
            button.innerHTML = '<span class="dashicons dashicons-update"></span> Disconnecting...';
            button.disabled = true;
            
            const nonce = '<?php echo wp_create_nonce('ultra_card_discord'); ?>';
            const body = 'action=ultra_card_discord_disconnect&nonce=' + nonce;
            
            console.log('Sending disconnect request...', body);
            
            fetch(ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body
            })
            .then(response => {
                console.log('Disconnect response received:', response);
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Disconnect data:', data);
                if (data.success) {
                    console.log('Disconnect successful, reloading page...');
                    location.reload();
                } else {
                    const errorMsg = data.data || 'Failed to disconnect Discord account';
                    console.error('Disconnect failed:', errorMsg);
                    alert('Error: ' + errorMsg);
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            })
            .catch(error => {
                console.error('Disconnect error:', error);
                alert('Error: ' + error.message);
                button.innerHTML = originalText;
                button.disabled = false;
            });
        }
        </script>
    </div>
    <?php
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

/**
 * Discord Integration Class for Ultra Card
 * Handles OAuth flow and role management for Discord server
 */
class UltraCardDiscordIntegration {
    
    private $bot_token;
    private $guild_id;
    private $pro_role_id;
    private $client_id;
    private $client_secret;
    private $redirect_uri;
    private static $instance = null;
    
    public function __construct() {
        // Prevent multiple instances
        if (self::$instance !== null) {
            return self::$instance;
        }
        
        self::$instance = $this;
        
        try {
            $this->load_settings();
            $this->init_hooks();
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card Discord: Constructor failed - ' . $e->getMessage());
            }
            self::$instance = null;
            throw $e;
        }
    }
    
    /**
     * Load Discord settings from WordPress options
     */
    private function load_settings() {
        $this->bot_token = get_option('ultra_card_discord_bot_token', '');
        $this->guild_id = get_option('ultra_card_discord_guild_id', '');
        $this->pro_role_id = get_option('ultra_card_discord_pro_role_id', '');
        $this->client_id = get_option('ultra_card_discord_client_id', '');
        $this->client_secret = get_option('ultra_card_discord_client_secret', '');
        // Generate redirect URI dynamically to match what's in Discord Developer Portal
        $this->redirect_uri = admin_url('admin-ajax.php?action=ultra_card_discord_callback');
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card Discord: Settings loaded - client_id: ' . $this->client_id . ', has_secret: ' . (!empty($this->client_secret) ? 'YES' : 'NO') . ', redirect_uri: ' . $this->redirect_uri);
        }
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_ajax_ultra_card_discord_connect', [$this, 'ajax_discord_connect']);
        add_action('wp_ajax_ultra_card_discord_disconnect', [$this, 'ajax_discord_disconnect']);
        
        // OAuth callback - handle both logged in and logged out states
        add_action('wp_ajax_ultra_card_discord_callback', [$this, 'ajax_discord_callback']);
        add_action('wp_ajax_nopriv_ultra_card_discord_callback', [$this, 'ajax_discord_callback']);
        
        add_action('wp_ajax_ultra_card_test_discord_connection', [$this, 'ajax_test_discord_connection']);
    }
    
    /**
     * Add admin menu for Discord settings
     */
    public function add_admin_menu() {
        // Skip if user has manage_options capability (they'll see the admin dashboard instead)
        if (current_user_can('manage_options')) {
            return;
        }
        
        add_options_page(
            'Ultra Card Discord Settings',
            'Ultra Card Discord',
            'manage_options',
            'ultra-card-discord',
            [$this, 'render_admin_page']
        );
    }
    
    /**
     * Register WordPress settings
     */
    public function register_settings() {
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_bot_token');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_guild_id');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_pro_role_id');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_client_id');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_client_secret');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_redirect_uri');
    }
    
    /**
     * Render admin settings page
     */
    public function render_admin_page() {
        // Auto-generate redirect URI if not set
        if (empty($this->redirect_uri)) {
            $this->redirect_uri = admin_url('admin-ajax.php?action=ultra_card_discord_callback');
            update_option('ultra_card_discord_redirect_uri', $this->redirect_uri);
        }
        ?>
        <div class="wrap">
            <h1>Ultra Card Discord Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('ultra_card_discord_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">Discord Bot Token</th>
                        <td>
                            <input type="password" name="ultra_card_discord_bot_token" value="<?php echo esc_attr($this->bot_token); ?>" class="regular-text" />
                            <p class="description">Get this from your Discord Application settings</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Discord Guild (Server) ID</th>
                        <td>
                            <input type="text" name="ultra_card_discord_guild_id" value="<?php echo esc_attr($this->guild_id); ?>" class="regular-text" />
                            <p class="description">Right-click your server name and select "Copy Server ID"</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Discord Pro Role ID</th>
                        <td>
                            <input type="text" name="ultra_card_discord_pro_role_id" value="<?php echo esc_attr($this->pro_role_id); ?>" class="regular-text" />
                            <p class="description">Right-click the role and select "Copy Role ID"</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">OAuth Client ID</th>
                        <td>
                            <input type="text" name="ultra_card_discord_client_id" value="<?php echo esc_attr($this->client_id); ?>" class="regular-text" />
                            <p class="description">Get this from your Discord Application settings</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">OAuth Client Secret</th>
                        <td>
                            <input type="password" name="ultra_card_discord_client_secret" value="<?php echo esc_attr($this->client_secret); ?>" class="regular-text" />
                            <p class="description">Get this from your Discord Application settings</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">OAuth Redirect URI</th>
                        <td>
                            <input type="text" name="ultra_card_discord_redirect_uri" value="<?php echo esc_attr($this->redirect_uri); ?>" class="regular-text" readonly />
                            <p class="description">Add this exact URL to your Discord Application's OAuth2 redirects</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <?php if (!empty($this->bot_token) && !empty($this->guild_id)): ?>
            <div style="margin-top: 30px; padding: 20px; background: #f1f1f1; border-radius: 5px;">
                <h3>Test Discord Connection</h3>
                <p>Use this to test if your bot token and server ID are correct:</p>
                <button type="button" id="test-discord-connection" class="button">Test Connection</button>
                <div id="test-results" style="margin-top: 10px;"></div>
            </div>
            
            <script>
            document.getElementById('test-discord-connection').addEventListener('click', function() {
                const resultsDiv = document.getElementById('test-results');
                resultsDiv.innerHTML = '<p>Testing connection...</p>';
                
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'action=ultra_card_test_discord_connection&nonce=' + '<?php echo wp_create_nonce('discord_test'); ?>'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        resultsDiv.innerHTML = '<p style="color: green;">✓ Connection successful!</p>';
                    } else {
                        resultsDiv.innerHTML = '<p style="color: red;">✗ Connection failed: ' + data.data + '</p>';
                    }
                })
                .catch(error => {
                    resultsDiv.innerHTML = '<p style="color: red;">✗ Error: ' + error.message + '</p>';
                });
            });
            </script>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /** Transient prefix and TTL for Discord OAuth state (one-time use, 10 min expiry) */
    const DISCORD_OAUTH_STATE_PREFIX = 'uc_discord_oauth_';
    const DISCORD_OAUTH_STATE_TTL = 600;

    /**
     * Generate Discord OAuth URL with secure one-time state token
     */
    public function get_oauth_url($user_id) {
        if (empty($this->client_id) || empty($this->redirect_uri)) {
            return false;
        }

        $state = bin2hex(random_bytes(32));
        set_transient(self::DISCORD_OAUTH_STATE_PREFIX . $state, (int) $user_id, self::DISCORD_OAUTH_STATE_TTL);

        $scopes = 'identify';
        $params = [
            'client_id' => $this->client_id,
            'redirect_uri' => $this->redirect_uri,
            'response_type' => 'code',
            'scope' => $scopes,
            'state' => $state
        ];

        return 'https://discord.com/api/oauth2/authorize?' . http_build_query($params);
    }
    
    /**
     * Exchange OAuth code for access token
     */
    public function exchange_code_for_token($code) {
        if (empty($this->client_id) || empty($this->client_secret) || empty($this->redirect_uri)) {
            return false;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card Discord: Token exchange - client_id: ' . $this->client_id . ', redirect_uri: ' . $this->redirect_uri);
        }
        
        $response = wp_remote_post('https://discord.com/api/oauth2/token', [
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded'
            ],
            'body' => [
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $this->redirect_uri
            ]
        ]);
        
        if (is_wp_error($response)) {
            error_log('Ultra Card Discord: OAuth token exchange failed - ' . $response->get_error_message());
            return false;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card Discord: Token exchange response - Code: ' . $response_code . ', Body: ' . $body);
        }
        
        $data = json_decode($body, true);
        
        if (isset($data['access_token'])) {
            return $data;
        }
        
        error_log('Ultra Card Discord: OAuth token exchange failed - Response code: ' . $response_code . ', Body: ' . $body);
        return false;
    }
    
    /**
     * Get Discord user info using access token
     */
    public function get_user_info($access_token) {
        $response = wp_remote_get('https://discord.com/api/users/@me', [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token
            ]
        ]);
        
        if (is_wp_error($response)) {
            error_log('Ultra Card Discord: Failed to get user info - ' . $response->get_error_message());
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['id'])) {
            return $data;
        }
        
        error_log('Ultra Card Discord: Invalid user info response - ' . $body);
        return false;
    }
    
    /**
     * Assign Discord role to user
     */
    public function assign_role($discord_id) {
        if (empty($this->bot_token) || empty($this->guild_id) || empty($this->pro_role_id)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card Discord: Missing configuration for role assignment');
            }
            return false;
        }
        
        $response = wp_remote_request("https://discord.com/api/v10/guilds/{$this->guild_id}/members/{$discord_id}/roles/{$this->pro_role_id}", [
            'method' => 'PUT',
            'headers' => [
                'Authorization' => 'Bot ' . $this->bot_token,
                'Content-Type' => 'application/json'
            ]
        ]);
        
        if (is_wp_error($response)) {
            error_log('Ultra Card Discord: Failed to assign role - ' . $response->get_error_message());
            return false;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 204) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card Discord: Successfully assigned role to Discord user {$discord_id}");
            }
            return true;
        } else {
            $body = wp_remote_retrieve_body($response);
            error_log("Ultra Card Discord: Failed to assign role (HTTP {$code}) - {$body}");
            return false;
        }
    }
    
    /**
     * Remove Discord role from user
     */
    public function remove_role($discord_id) {
        if (empty($this->bot_token) || empty($this->guild_id) || empty($this->pro_role_id)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card Discord: Missing configuration for role removal');
            }
            return false;
        }
        
        $response = wp_remote_request("https://discord.com/api/v10/guilds/{$this->guild_id}/members/{$discord_id}/roles/{$this->pro_role_id}", [
            'method' => 'DELETE',
            'headers' => [
                'Authorization' => 'Bot ' . $this->bot_token
            ]
        ]);
        
        if (is_wp_error($response)) {
            error_log('Ultra Card Discord: Failed to remove role - ' . $response->get_error_message());
            return false;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 204) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Ultra Card Discord: Successfully removed role from Discord user {$discord_id}");
            }
            return true;
        } else {
            $body = wp_remote_retrieve_body($response);
            error_log("Ultra Card Discord: Failed to remove role (HTTP {$code}) - {$body}");
            return false;
        }
    }
    
    /**
     * Check if user is member of Discord guild
     */
    public function check_member_in_guild($discord_id) {
        if (empty($this->bot_token) || empty($this->guild_id)) {
            return false;
        }
        
        $response = wp_remote_get("https://discord.com/api/v10/guilds/{$this->guild_id}/members/{$discord_id}", [
            'headers' => [
                'Authorization' => 'Bot ' . $this->bot_token
            ]
        ]);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        return $code === 200;
    }
    
    /**
     * Get user's Discord ID from WordPress user meta
     */
    public function get_user_discord_id($user_id) {
        return get_user_meta($user_id, 'ultra_card_discord_id', true);
    }
    
    /**
     * Store user's Discord ID in WordPress user meta
     */
    public function store_user_discord_id($user_id, $discord_id, $discord_data = null) {
        update_user_meta($user_id, 'ultra_card_discord_id', $discord_id);
        
        if ($discord_data) {
            update_user_meta($user_id, 'ultra_card_discord_username', $discord_data['username'] ?? '');
            update_user_meta($user_id, 'ultra_card_discord_discriminator', $discord_data['discriminator'] ?? '');
            update_user_meta($user_id, 'ultra_card_discord_avatar', $discord_data['avatar'] ?? '');
        }
    }
    
    /**
     * Remove user's Discord connection
     */
    public function remove_user_discord_connection($user_id) {
        $discord_id = $this->get_user_discord_id($user_id);
        
        if ($discord_id) {
            // Remove role from Discord
            $this->remove_role($discord_id);
            
            // Remove from WordPress user meta
            delete_user_meta($user_id, 'ultra_card_discord_id');
            delete_user_meta($user_id, 'ultra_card_discord_username');
            delete_user_meta($user_id, 'ultra_card_discord_discriminator');
            delete_user_meta($user_id, 'ultra_card_discord_avatar');
        }
    }
    
    /**
     * Handle Discord OAuth callback (AJAX handler)
     */
    public function ajax_discord_callback() {
        $this->process_oauth_callback();
    }
    
    /**
     * Process Discord OAuth callback
     */
    private function process_oauth_callback() {
        $code = sanitize_text_field($_GET['code'] ?? '');
        $state_encoded = sanitize_text_field($_GET['state'] ?? '');
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Ultra Card Discord: OAuth callback - code: ' . substr($code, 0, 10) . '..., state: ' . $state_encoded);
        }
        
        if (empty($code) || empty($state_encoded)) {
            wp_die('Invalid OAuth callback parameters - missing code or state');
        }

        $state_key = self::DISCORD_OAUTH_STATE_PREFIX . $state_encoded;
        $user_id = get_transient($state_key);
        if ($user_id === false) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Ultra Card Discord: Invalid or expired OAuth state');
            }
            wp_die('Invalid or expired OAuth state. Please try connecting again.');
        }
        delete_transient($state_key);
        $user_id = (int) $user_id;
        if (!$user_id) {
            wp_die('Invalid OAuth state parameter');
        }

        $user = get_user_by('id', $user_id);
        if (!$user) {
            wp_die('Invalid OAuth state parameter - user not found');
        }
        
        // Exchange code for token
        $token_data = $this->exchange_code_for_token($code);
        if (!$token_data) {
            wp_die('Failed to exchange OAuth code for token. Please check your Discord application settings.');
        }
        
        // Get user info
        $user_info = $this->get_user_info($token_data['access_token']);
        if (!$user_info) {
            wp_die('Failed to get Discord user information');
        }
        
        // Check if user is in Discord server
        if (!$this->check_member_in_guild($user_info['id'])) {
            wp_die('You must be a member of the Discord server to connect your account. Please join the server first.');
        }
        
        // Store Discord connection
        $this->store_user_discord_id($user_id, $user_info['id'], $user_info);
        
        // Check if user is Pro and assign role
        $user = get_user_by('id', $user_id);
        $is_pro = $user && in_array('ultra_card_pro', $user->roles);
        $is_admin = $user && in_array('administrator', $user->roles);
        
        // Assign role if user is Pro OR Admin
        if ($is_pro || $is_admin) {
            $this->assign_role($user_info['id']);
        }
        
        // Redirect: prefer frontend return URL stashed during /me/discord/connect.
        $return_url = '';
        if (!empty($state_encoded)) {
            $return_url = get_transient('uc_discord_oauth_return_' . $state_encoded);
            delete_transient('uc_discord_oauth_return_' . $state_encoded);
        }
        if ($return_url) {
            $redirect_url = $return_url;
        } elseif (current_user_can('manage_options')) {
            // Admins go to the WP admin Discord tab
            $redirect_url = admin_url('admin.php?page=ultra-card-discord&discord_connected=1');
        } else {
            // Regular users land on the native member dashboard
            $redirect_url = home_url('/dashboard/#discord');
        }
        wp_redirect($redirect_url);
        exit;
    }
    
    /**
     * AJAX handler for Discord connect
     */
    public function ajax_discord_connect() {
        check_ajax_referer('ultra_card_discord', 'nonce');
        
        $user_id = get_current_user_id();
        $oauth_url = $this->get_oauth_url($user_id);
        
        if ($oauth_url) {
            wp_send_json_success(['redirect_url' => $oauth_url]);
        } else {
            wp_send_json_error('Discord OAuth not properly configured');
        }
    }
    
    /**
     * AJAX handler for Discord disconnect
     */
    public function ajax_discord_disconnect() {
        check_ajax_referer('ultra_card_discord', 'nonce');
        
        $user_id = get_current_user_id();
        $this->remove_user_discord_connection($user_id);
        
        wp_send_json_success('Discord account disconnected successfully');
    }
    
    /**
     * Get Discord connection status for user
     */
    public function get_connection_status($user_id) {
        $discord_id = $this->get_user_discord_id($user_id);
        
        if (!$discord_id) {
            return [
                'connected' => false,
                'discord_id' => null,
                'username' => null,
                'avatar' => null
            ];
        }
        
        return [
            'connected' => true,
            'discord_id' => $discord_id,
            'username' => get_user_meta($user_id, 'ultra_card_discord_username', true),
            'discriminator' => get_user_meta($user_id, 'ultra_card_discord_discriminator', true),
            'avatar' => get_user_meta($user_id, 'ultra_card_discord_avatar', true)
        ];
    }
    
    /**
     * AJAX handler for testing Discord connection
     */
    public function ajax_test_discord_connection() {
        check_ajax_referer('discord_test', 'nonce');
        
        if (empty($this->bot_token) || empty($this->guild_id)) {
            wp_send_json_error('Bot token and Guild ID are required');
        }
        
        // Test bot connection by fetching guild info
        $response = wp_remote_get("https://discord.com/api/v10/guilds/{$this->guild_id}", [
            'headers' => [
                'Authorization' => 'Bot ' . $this->bot_token
            ]
        ]);
        
        if (is_wp_error($response)) {
            wp_send_json_error('Failed to connect to Discord API: ' . $response->get_error_message());
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            $body = wp_remote_retrieve_body($response);
            $guild_data = json_decode($body, true);
            wp_send_json_success("Connected successfully! Server: " . ($guild_data['name'] ?? 'Unknown'));
        } else {
            $body = wp_remote_retrieve_body($response);
            wp_send_json_error("Connection failed (HTTP {$code}): " . $body);
        }
    }
}

/**
 * Ultra Card Admin Dashboard
 * Comprehensive admin interface with Settings, Discord, Backups, API, and Debug tabs
 */
class UltraCardAdminDashboard {
    
    private $cloud_sync;
    private $discord_integration;
    
    public function __construct($cloud_sync, $discord_integration) {
        $this->cloud_sync = $cloud_sync;
        $this->discord_integration = $discord_integration;
        
        // Register admin menu with priority 5 to load before other menus
        add_action('admin_menu', array($this, 'add_admin_menu'), 5);
        
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
        
        // Enqueue admin assets
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // AJAX handlers
        add_action('wp_ajax_ultra_card_test_discord', array($this, 'ajax_test_discord'));
        add_action('wp_ajax_ultra_card_test_api', array($this, 'ajax_test_api'));
        add_action('wp_ajax_ultra_card_clear_cache', array($this, 'ajax_clear_cache'));
        add_action('wp_ajax_ultra_card_clear_preset_cache', array($this, 'ajax_clear_preset_cache'));
        add_action('wp_ajax_ultra_card_force_prune', array($this, 'ajax_force_prune'));
        add_action('wp_ajax_ultra_card_generate_api_key', array($this, 'ajax_generate_api_key'));
        add_action('wp_ajax_ultra_card_revoke_api_key', array($this, 'ajax_revoke_api_key'));
        add_action('wp_ajax_ultra_card_get_logs', array($this, 'ajax_get_logs'));
        add_action('wp_ajax_ultra_card_export_backups_csv', array($this, 'ajax_export_backups_csv'));
        add_action('wp_ajax_ultra_card_create_db_tables', array($this, 'ajax_create_db_tables'));
    }
    
    /**
     * Add admin menu and submenus
     */
    public function add_admin_menu() {
        // Only add menu for users with manage_options capability
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Main menu
        add_menu_page(
            'Ultra Card',
            'Ultra Card',
            'manage_options',
            'ultra-card-admin',
            array($this, 'render_dashboard'),
            'dashicons-layout',
            30
        );
        
        // Submenu items (these create the tab navigation)
        add_submenu_page(
            'ultra-card-admin',
            'Settings',
            'Settings',
            'manage_options',
            'ultra-card-admin',
            array($this, 'render_dashboard')
        );
        
        add_submenu_page(
            'ultra-card-admin',
            'Stats',
            'Stats',
            'manage_options',
            'ultra-card-stats',
            array($this, 'render_dashboard')
        );
        
        add_submenu_page(
            'ultra-card-admin',
            'Discord Integration',
            'Discord',
            'manage_options',
            'ultra-card-discord',
            array($this, 'render_dashboard')
        );
        
        add_submenu_page(
            'ultra-card-admin',
            'Backups Analytics',
            'Backups',
            'manage_options',
            'ultra-card-backups',
            array($this, 'render_dashboard')
        );
        
        add_submenu_page(
            'ultra-card-admin',
            'API Management',
            'API',
            'manage_options',
            'ultra-card-api',
            array($this, 'render_dashboard')
        );
        
        add_submenu_page(
            'ultra-card-admin',
            'Preset Moderation',
            'Presets',
            'manage_options',
            'ultra-card-presets',
            array($this, 'render_dashboard')
        );

        add_submenu_page(
            'ultra-card-admin',
            'Website Harness',
            'Website',
            'manage_options',
            'ultra-card-website',
            array($this, 'render_dashboard')
        );

        add_submenu_page(
            'ultra-card-admin',
            'Debug Tools',
            'Debug',
            'manage_options',
            'ultra-card-debug',
            array($this, 'render_dashboard')
        );
    }
    
    /**
     * Register plugin settings
     */
    public function register_settings() {
        // Discord Settings
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_client_id');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_client_secret');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_bot_token');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_guild_id');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_pro_role_id');
        register_setting('ultra_card_discord_settings', 'ultra_card_discord_free_role_id');
        
        // Backup Settings
        register_setting('ultra_card_backup_settings', 'ultra_card_backup_retention_days');
        register_setting('ultra_card_backup_settings', 'ultra_card_max_backups_free');
        register_setting('ultra_card_backup_settings', 'ultra_card_max_backups_pro');
        register_setting('ultra_card_backup_settings', 'ultra_card_auto_prune_enabled');
        
        // API Settings
        register_setting('ultra_card_api_settings', 'ultra_card_api_rate_limit');
        register_setting('ultra_card_api_settings', 'ultra_card_api_key_expiration');
        register_setting('ultra_card_api_settings', 'ultra_card_api_logging_enabled');
        
        // General Settings
        register_setting('ultra_card_general_settings', 'ultra_card_debug_mode');
        register_setting('ultra_card_general_settings', 'ultra_card_log_retention_days');
        register_setting('ultra_card_discord_settings', 'ultra_card_preset_discord_webhook');

        // Website harness settings (also registered in UltraCardWebsiteHarness).
        register_setting('ultra_card_harness_settings', 'ultra_card_harness_channel');
        register_setting('ultra_card_harness_settings', 'ultra_card_harness_ref');
        register_setting('ultra_card_harness_settings', 'ultra_card_harness_local_url');
        register_setting('ultra_card_harness_settings', 'ultra_card_harness_flush_secret');
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_assets($hook) {
        // Only load on our admin pages
        if (strpos($hook, 'ultra-card') === false) {
            return;
        }
        
        // Chart.js for statistics
        wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js', array(), '3.9.1', true);
        
        // Custom admin styles
        wp_add_inline_style('wp-admin', $this->get_admin_css());
        
        // Custom admin scripts
        wp_add_inline_script('jquery', $this->get_admin_js());
    }
    
    /**
     * Main dashboard render function
     */
    public function render_dashboard() {
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        
        // Determine active tab
        $current_page = isset($_GET['page']) ? sanitize_text_field($_GET['page']) : 'ultra-card-admin';
        
        $tab_mapping = array(
            'ultra-card-admin'  => 'settings',
            'ultra-card-stats'  => 'stats',
            'ultra-card-discord' => 'discord',
            'ultra-card-backups' => 'backups',
            'ultra-card-api'    => 'api',
            'ultra-card-presets'=> 'presets',
            'ultra-card-website'=> 'website',
            'ultra-card-debug'  => 'debug',
        );
        
        $active_tab = isset($tab_mapping[$current_page]) ? $tab_mapping[$current_page] : 'settings';
        
        ?>
        <div class="wrap ultra-card-admin-wrap">
            <h1><span class="dashicons dashicons-layout"></span> Ultra Card Administration</h1>
            
            <nav class="nav-tab-wrapper ultra-card-nav-tabs">
                <a href="?page=ultra-card-admin" class="nav-tab <?php echo $active_tab === 'settings' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-admin-settings"></span> Settings
                </a>
                <a href="?page=ultra-card-stats" class="nav-tab <?php echo $active_tab === 'stats' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-chart-bar"></span> Stats
                </a>
                <a href="?page=ultra-card-discord" class="nav-tab <?php echo $active_tab === 'discord' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-buddicons-replies"></span> Discord
                </a>
                <a href="?page=ultra-card-backups" class="nav-tab <?php echo $active_tab === 'backups' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-cloud"></span> Backups
                </a>
                <a href="?page=ultra-card-api" class="nav-tab <?php echo $active_tab === 'api' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-admin-network"></span> API
                </a>
                <a href="?page=ultra-card-presets" class="nav-tab <?php echo $active_tab === 'presets' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-layout"></span> Presets
                </a>
                <a href="?page=ultra-card-website" class="nav-tab <?php echo $active_tab === 'website' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-admin-site-alt3"></span> Website
                </a>
                <a href="?page=ultra-card-debug" class="nav-tab <?php echo $active_tab === 'debug' ? 'nav-tab-active' : ''; ?>">
                    <span class="dashicons dashicons-warning"></span> Debug
                </a>
            </nav>
            
            <div class="ultra-card-tab-content">
                <?php
                switch ($active_tab) {
                    case 'settings':
                        $this->render_settings_tab();
                        break;
                    case 'stats':
                        $this->render_stats_tab();
                        break;
                    case 'discord':
                        $this->render_discord_tab();
                        break;
                    case 'backups':
                        $this->render_backups_tab();
                        break;
                    case 'api':
                        $this->render_api_tab();
                        break;
                    case 'presets':
                        if (function_exists('ultra_card_render_presets_moderation_tab')) {
                            ultra_card_render_presets_moderation_tab();
                        } else {
                            echo '<div class="notice notice-error"><p>Preset authoring module not loaded.</p></div>';
                        }
                        break;
                    case 'website':
                        if (class_exists('UltraCardWebsiteHarness')) {
                            UltraCardWebsiteHarness::instance()->render_admin_tab();
                        } else {
                            echo '<div class="notice notice-error"><p>Website harness module not loaded.</p></div>';
                        }
                        break;
                    case 'debug':
                        $this->render_debug_tab();
                        break;
                }
                ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * SETTINGS TAB
     */
    /**
     * Render the Stats tab — aggregate platform metrics, no individual user data.
     */
    private function render_stats_tab() {
        global $wpdb;

        // ── User counts ───────────────────────────────────────────────────────
        $total_users = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->users}");

        $pro_users = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT user_id) FROM {$wpdb->usermeta}
                 WHERE meta_key = %s AND meta_value LIKE %s",
                $wpdb->get_blog_prefix() . 'capabilities',
                '%ultra_card_pro%'
            )
        );

        $free_users = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT user_id) FROM {$wpdb->usermeta}
                 WHERE meta_key = %s AND meta_value LIKE %s",
                $wpdb->get_blog_prefix() . 'capabilities',
                '%ultra_card_free%'
            )
        );

        $new_users_30d = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->users}
             WHERE user_registered >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );

        $new_users_7d = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->users}
             WHERE user_registered >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        );

        // ── Sync object counts ────────────────────────────────────────────────
        $favorites_count = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'ultra_favorite' AND post_status = 'publish'"
        );

        $colors_count = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'ultra_color' AND post_status = 'publish'"
        );

        $reviews_count = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'ultra_review' AND post_status = 'publish'"
        );

        $backups_count = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'ultra_backup' AND post_status = 'publish'"
        );

        $snapshots_count = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'ultra_snapshot' AND post_status = 'publish'"
        );

        // ── Presets ───────────────────────────────────────────────────────────
        $preset_post_types = array('presets_dir_ltg', 'ultra_preset', 'presets');
        $preset_count = 0;
        foreach ($preset_post_types as $pt) {
            $n = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s AND post_status = 'publish'",
                    $pt
                )
            );
            if ($n > 0) { $preset_count = $n; break; }
        }

        // Total preset downloads
        $total_downloads = (int) $wpdb->get_var(
            "SELECT SUM(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta}
             WHERE meta_key = 'download_count'"
        );

        // ── Active sessions ───────────────────────────────────────────────────
        $sessions_table = $wpdb->prefix . 'ultra_card_sessions';
        $active_sessions = 0;
        if ($wpdb->get_var("SHOW TABLES LIKE '{$sessions_table}'") === $sessions_table) {
            $active_sessions = (int) $wpdb->get_var(
                "SELECT COUNT(*) FROM {$sessions_table} WHERE expires_at > NOW()"
            );
        }

        // ── Sync activity: users who have at least one synced object ──────────
        $users_with_favorites = (int) $wpdb->get_var(
            "SELECT COUNT(DISTINCT post_author) FROM {$wpdb->posts}
             WHERE post_type = 'ultra_favorite' AND post_status = 'publish'"
        );
        $users_with_colors = (int) $wpdb->get_var(
            "SELECT COUNT(DISTINCT post_author) FROM {$wpdb->posts}
             WHERE post_type = 'ultra_color' AND post_status = 'publish'"
        );

        // ── Helper: format large numbers ──────────────────────────────────────
        $fmt = function($n) {
            if ($n >= 1000000) return number_format($n / 1000000, 1) . 'M';
            if ($n >= 1000)    return number_format($n / 1000, 1) . 'K';
            return number_format($n);
        };

        ?>
        <style>
        .uc-stats-wrap { max-width: 1100px; padding: 24px 0; }
        .uc-stats-section { margin-bottom: 32px; }
        .uc-stats-section h2 {
            font-size: 14px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.6px; color: #666; margin: 0 0 14px; padding: 0;
            border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;
        }
        .uc-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 14px;
        }
        .uc-stat-card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 18px 16px 14px;
            box-shadow: 0 1px 3px rgba(0,0,0,.06);
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .uc-stat-card .uc-stat-icon {
            font-size: 22px;
            margin-bottom: 4px;
            line-height: 1;
        }
        .uc-stat-card .uc-stat-num {
            font-size: 32px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1;
        }
        .uc-stat-card .uc-stat-label {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
        }
        .uc-stat-card .uc-stat-sub {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 4px;
        }
        .uc-stat-card.uc-stat-accent-blue  { border-top: 3px solid #3b82f6; }
        .uc-stat-card.uc-stat-accent-green { border-top: 3px solid #22c55e; }
        .uc-stat-card.uc-stat-accent-gold  { border-top: 3px solid #f59e0b; }
        .uc-stat-card.uc-stat-accent-purple{ border-top: 3px solid #8b5cf6; }
        .uc-stat-card.uc-stat-accent-pink  { border-top: 3px solid #ec4899; }
        .uc-stat-card.uc-stat-accent-teal  { border-top: 3px solid #14b8a6; }
        .uc-stat-card.uc-stat-accent-red   { border-top: 3px solid #ef4444; }
        .uc-stat-note {
            margin-top: 10px;
            font-size: 12px;
            color: #94a3b8;
            font-style: italic;
        }
        .uc-stats-refreshed {
            font-size: 12px;
            color: #94a3b8;
            margin-bottom: 16px;
        }
        </style>

        <div class="uc-stats-wrap">
            <p class="uc-stats-refreshed">
                <span class="dashicons dashicons-update" style="font-size:14px;vertical-align:middle;"></span>
                Stats as of <?php echo esc_html(current_time('F j, Y \a\t g:i A')); ?>
            </p>

            <!-- Users -->
            <div class="uc-stats-section">
                <h2><span class="dashicons dashicons-groups"></span> Users</h2>
                <div class="uc-stats-grid">
                    <div class="uc-stat-card uc-stat-accent-blue">
                        <div class="uc-stat-icon">👥</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($total_users)); ?></div>
                        <div class="uc-stat-label">Total Users</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-gold">
                        <div class="uc-stat-icon">⭐</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($pro_users)); ?></div>
                        <div class="uc-stat-label">Pro Users</div>
                        <div class="uc-stat-sub"><?php echo $total_users > 0 ? round(($pro_users / $total_users) * 100, 1) : 0; ?>% of all users</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-blue">
                        <div class="uc-stat-icon">🆓</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($free_users)); ?></div>
                        <div class="uc-stat-label">Free Users</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-green">
                        <div class="uc-stat-icon">📅</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($new_users_30d)); ?></div>
                        <div class="uc-stat-label">New (30 days)</div>
                        <div class="uc-stat-sub"><?php echo esc_html($fmt($new_users_7d)); ?> this week</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-teal">
                        <div class="uc-stat-icon">🔌</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($active_sessions)); ?></div>
                        <div class="uc-stat-label">Active Sessions</div>
                        <div class="uc-stat-sub">Currently connected</div>
                    </div>
                </div>
            </div>

            <!-- Cloud Sync -->
            <div class="uc-stats-section">
                <h2><span class="dashicons dashicons-cloud"></span> Cloud Sync</h2>
                <div class="uc-stats-grid">
                    <div class="uc-stat-card uc-stat-accent-pink">
                        <div class="uc-stat-icon">❤️</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($favorites_count)); ?></div>
                        <div class="uc-stat-label">Favorites Synced</div>
                        <div class="uc-stat-sub"><?php echo esc_html($fmt($users_with_favorites)); ?> users syncing</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-purple">
                        <div class="uc-stat-icon">🎨</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($colors_count)); ?></div>
                        <div class="uc-stat-label">Colors Synced</div>
                        <div class="uc-stat-sub"><?php echo esc_html($fmt($users_with_colors)); ?> users syncing</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-blue">
                        <div class="uc-stat-icon">⭐</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($reviews_count)); ?></div>
                        <div class="uc-stat-label">Reviews</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-teal">
                        <div class="uc-stat-icon">💾</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($backups_count)); ?></div>
                        <div class="uc-stat-label">Backups Stored</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-green">
                        <div class="uc-stat-icon">📸</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($snapshots_count)); ?></div>
                        <div class="uc-stat-label">Snapshots Saved</div>
                    </div>
                </div>
            </div>

            <!-- Preset Gallery -->
            <div class="uc-stats-section">
                <h2><span class="dashicons dashicons-layout"></span> Preset Gallery</h2>
                <div class="uc-stats-grid">
                    <div class="uc-stat-card uc-stat-accent-blue">
                        <div class="uc-stat-icon">🖼️</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($preset_count)); ?></div>
                        <div class="uc-stat-label">Published Presets</div>
                    </div>
                    <div class="uc-stat-card uc-stat-accent-green">
                        <div class="uc-stat-icon">⬇️</div>
                        <div class="uc-stat-num"><?php echo esc_html($fmt($total_downloads ?: 0)); ?></div>
                        <div class="uc-stat-label">Total Downloads</div>
                    </div>
                </div>
                <p class="uc-stat-note">
                    Note: these are aggregate totals. Individual user activity is not tracked or displayed here.
                </p>
            </div>
        </div>
        <?php
    }

    private function render_settings_tab() {
        // Handle form submission
        if (isset($_POST['ultra_card_save_settings']) && check_admin_referer('ultra_card_settings_nonce')) {
            $this->save_settings();
            echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
        }
        
        // Get current settings
        $discord_settings = $this->get_discord_settings();
        $backup_settings = $this->get_backup_settings();
        $api_settings = $this->get_api_settings();
        $general_settings = $this->get_general_settings();
        
        ?>
        <div class="ultra-card-settings-container">
            <form method="post" action="">
                <?php wp_nonce_field('ultra_card_settings_nonce'); ?>
                
                <!-- Discord Settings Section -->
                <div class="ultra-card-settings-section">
                    <h2><span class="dashicons dashicons-buddicons-replies"></span> Discord Integration Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="discord_client_id">Client ID</label></th>
                            <td>
                                <input type="text" id="discord_client_id" name="discord_client_id" 
                                       value="<?php echo esc_attr($discord_settings['client_id']); ?>" 
                                       class="regular-text" />
                                <p class="description">Get this from your Discord Application settings</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="discord_client_secret">Client Secret</label></th>
                            <td>
                                <input type="password" id="discord_client_secret" name="discord_client_secret" 
                                       value="<?php echo esc_attr($discord_settings['client_secret']); ?>" 
                                       class="regular-text" />
                                <p class="description">Keep this secret and secure</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="discord_bot_token">Bot Token</label></th>
                            <td>
                                <input type="password" id="discord_bot_token" name="discord_bot_token" 
                                       value="<?php echo esc_attr($discord_settings['bot_token']); ?>" 
                                       class="regular-text" />
                                <p class="description">Your Discord bot token for role management</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="discord_guild_id">Server/Guild ID</label></th>
                            <td>
                                <input type="text" id="discord_guild_id" name="discord_guild_id" 
                                       value="<?php echo esc_attr($discord_settings['guild_id']); ?>" 
                                       class="regular-text" />
                                <p class="description">Your Discord server ID</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="discord_pro_role_id">Pro Role ID</label></th>
                            <td>
                                <input type="text" id="discord_pro_role_id" name="discord_pro_role_id" 
                                       value="<?php echo esc_attr($discord_settings['pro_role_id']); ?>" 
                                       class="regular-text" />
                                <p class="description">Discord role ID for Pro subscribers</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="discord_free_role_id">Free Role ID</label></th>
                            <td>
                                <input type="text" id="discord_free_role_id" name="discord_free_role_id" 
                                       value="<?php echo esc_attr($discord_settings['free_role_id']); ?>" 
                                       class="regular-text" />
                                <p class="description">Discord role ID for Free tier users (optional)</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- Backup Settings Section -->
                <div class="ultra-card-settings-section">
                    <h2><span class="dashicons dashicons-cloud"></span> Backup Policy Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="backup_retention_days">Retention Period (Days)</label></th>
                            <td>
                                <input type="number" id="backup_retention_days" name="backup_retention_days" 
                                       value="<?php echo esc_attr($backup_settings['retention_days']); ?>" 
                                       min="1" max="365" class="small-text" />
                                <p class="description">How long to keep old backups (Pro accounts only)</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="max_backups_free">Max Backups (Free)</label></th>
                            <td>
                                <input type="number" id="max_backups_free" name="max_backups_free" 
                                       value="<?php echo esc_attr($backup_settings['max_backups_free']); ?>" 
                                       min="0" max="50" class="small-text" />
                                <p class="description">Maximum backups for free tier users (0 = disabled)</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="max_backups_pro">Max Backups (Pro)</label></th>
                            <td>
                                <input type="number" id="max_backups_pro" name="max_backups_pro" 
                                       value="<?php echo esc_attr($backup_settings['max_backups_pro']); ?>" 
                                       min="1" max="1000" class="small-text" />
                                <p class="description">Maximum backups for Pro subscribers</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="auto_prune_enabled">Auto-Prune Enabled</label></th>
                            <td>
                                <label>
                                    <input type="checkbox" id="auto_prune_enabled" name="auto_prune_enabled" 
                                           value="1" <?php checked($backup_settings['auto_prune_enabled'], true); ?> />
                                    Automatically delete old backups based on retention policy
                                </label>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- API Settings Section -->
                <div class="ultra-card-settings-section">
                    <h2><span class="dashicons dashicons-admin-network"></span> API Configuration</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="api_rate_limit">Rate Limit (requests/minute)</label></th>
                            <td>
                                <input type="number" id="api_rate_limit" name="api_rate_limit" 
                                       value="<?php echo esc_attr($api_settings['rate_limit']); ?>" 
                                       min="10" max="1000" class="small-text" />
                                <p class="description">Maximum API requests per user per minute</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="api_key_expiration">API Key Expiration (days)</label></th>
                            <td>
                                <input type="number" id="api_key_expiration" name="api_key_expiration" 
                                       value="<?php echo esc_attr($api_settings['key_expiration']); ?>" 
                                       min="0" max="3650" class="small-text" />
                                <p class="description">Days until API keys expire (0 = never expire)</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="api_logging_enabled">API Request Logging</label></th>
                            <td>
                                <label>
                                    <input type="checkbox" id="api_logging_enabled" name="api_logging_enabled" 
                                           value="1" <?php checked($api_settings['logging_enabled'], true); ?> />
                                    Log all API requests for analytics and debugging
                                </label>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- General Settings Section -->
                <div class="ultra-card-settings-section">
                    <h2><span class="dashicons dashicons-admin-settings"></span> General Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="debug_mode">Debug Mode</label></th>
                            <td>
                                <label>
                                    <input type="checkbox" id="debug_mode" name="debug_mode" 
                                           value="1" <?php checked($general_settings['debug_mode'], true); ?> />
                                    Enable verbose logging for troubleshooting
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="log_retention_days">Log Retention (days)</label></th>
                            <td>
                                <input type="number" id="log_retention_days" name="log_retention_days" 
                                       value="<?php echo esc_attr($general_settings['log_retention_days']); ?>" 
                                       min="1" max="365" class="small-text" />
                                <p class="description">How long to keep API and error logs</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <p class="submit">
                    <input type="submit" name="ultra_card_save_settings" class="button button-primary" value="Save All Settings" />
                </p>
            </form>
        </div>
        <?php
    }
    
    /**
     * DISCORD TAB
     */
    private function render_discord_tab() {
        global $wpdb;
        
        // Get Discord configuration status
        $discord_settings = $this->get_discord_settings();
        $is_configured = !empty($discord_settings['client_id']) && !empty($discord_settings['bot_token']);
        
        // Get connected users statistics
        $connected_users = $wpdb->get_results("
            SELECT u.ID, u.user_login, u.user_email, um.meta_value as discord_id,
                   DATE_FORMAT(u.user_registered, '%Y-%m-%d') as connection_date
            FROM {$wpdb->users} u
            INNER JOIN {$wpdb->usermeta} um ON u.ID = um.user_id
            WHERE um.meta_key = 'ultra_card_discord_id'
            ORDER BY u.user_registered DESC
        ");
        
        ?>
        <div class="ultra-card-discord-container">
            <!-- Configuration Panel -->
            <div class="ultra-card-card">
                <h2><span class="dashicons dashicons-admin-settings"></span> Discord Configuration</h2>
                
                <?php if ($is_configured): ?>
                    <div class="notice notice-success inline">
                        <p><strong>Discord integration is configured and active.</strong></p>
                    </div>
                    
                    <table class="widefat">
                        <tr>
                            <th>Client ID:</th>
                            <td><code><?php echo esc_html($discord_settings['client_id']); ?></code></td>
                        </tr>
                        <tr>
                            <th>Server ID:</th>
                            <td><code><?php echo esc_html($discord_settings['guild_id']); ?></code></td>
                        </tr>
                        <tr>
                            <th>Pro Role ID:</th>
                            <td><code><?php echo esc_html($discord_settings['pro_role_id'] ?: 'Not set'); ?></code></td>
                        </tr>
                        <tr>
                            <th>OAuth Redirect URL:</th>
                            <td><code><?php echo esc_url(home_url('/ultra-card/discord/callback')); ?></code></td>
                        </tr>
                    </table>
                    
                    <p>
                        <button type="button" class="button" id="test-discord-connection">
                            <span class="dashicons dashicons-update"></span> Test Connection
                        </button>
                        <a href="?page=ultra-card-admin" class="button">Edit Settings</a>
                    </p>
                    
                    <div id="discord-test-result"></div>
                <?php else: ?>
                    <div class="notice notice-warning inline">
                        <p>Discord integration is not configured. Please configure it in the <a href="?page=ultra-card-admin">Settings tab</a>.</p>
                    </div>
                <?php endif; ?>
            </div>
            
            <!-- Statistics Panel -->
            <div class="ultra-card-card" style="margin-top: 20px;">
                <h2><span class="dashicons dashicons-chart-bar"></span> User Connection Statistics</h2>
                
                <div class="ultra-card-stats-grid">
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo count($connected_users); ?></div>
                        <div class="stat-label">Total Connections</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $this->count_users_by_role('ultra_card_pro', $connected_users); ?></div>
                        <div class="stat-label">Pro Users</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $this->count_users_by_role('ultra_card_free', $connected_users); ?></div>
                        <div class="stat-label">Free Users</div>
                    </div>
                </div>
                
                <?php if (count($connected_users) > 0): ?>
                    <h3>Connected Users</h3>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Discord ID</th>
                                <th>Account Type</th>
                                <th>Connected Since</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($connected_users as $user): ?>
                                <?php
                                $wp_user = get_user_by('id', $user->ID);
                                $account_type = in_array('ultra_card_pro', $wp_user->roles) ? 'Pro' : 'Free';
                                ?>
                                <tr>
                                    <td><?php echo esc_html($user->user_login); ?></td>
                                    <td><?php echo esc_html($user->user_email); ?></td>
                                    <td><code><?php echo esc_html($user->discord_id); ?></code></td>
                                    <td><span class="badge badge-<?php echo strtolower($account_type); ?>"><?php echo $account_type; ?></span></td>
                                    <td><?php echo esc_html($user->connection_date); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p class="description">No users have connected their Discord accounts yet.</p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * BACKUPS TAB
     */
    private function render_backups_tab() {
        global $wpdb;
        
        // Get backup analytics data
        $analytics = $this->get_backup_analytics();
        
        ?>
        <div class="ultra-card-backups-container">
            <div class="ultra-card-card">
                <div class="ultra-card-card-header">
                    <h2><span class="dashicons dashicons-cloud"></span> Backup Analytics</h2>
                    <button type="button" class="button" id="export-backups-csv">
                        <span class="dashicons dashicons-download"></span> Export CSV
                    </button>
                </div>
                
                <div class="ultra-card-stats-grid" style="margin-bottom: 20px;">
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $analytics['total_users']; ?></div>
                        <div class="stat-label">Total Pro Users</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $analytics['total_backups']; ?></div>
                        <div class="stat-label">Total Backups</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $analytics['total_storage']; ?></div>
                        <div class="stat-label">Storage Used</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $analytics['avg_backups_per_user']; ?></div>
                        <div class="stat-label">Avg Backups/User</div>
                    </div>
                </div>
                
                <div class="ultra-card-table-filters">
                    <input type="text" id="search-backups" placeholder="Search by username or email..." class="regular-text" />
                    <select id="filter-account-type">
                        <option value="">All Account Types</option>
                        <option value="pro">Pro Only</option>
                        <option value="free">Free Only</option>
                    </select>
                </div>
                
                <table class="wp-list-table widefat fixed striped" id="backups-table">
                    <thead>
                        <tr>
                            <th class="sortable">Username</th>
                            <th class="sortable">Email</th>
                            <th class="sortable">Account Type</th>
                            <th class="sortable">Total Cards</th>
                            <th class="sortable">Total Backups</th>
                            <th class="sortable">Last Backup</th>
                            <th class="sortable">Last Login</th>
                            <th class="sortable">Storage Used</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (count($analytics['users']) > 0): ?>
                            <?php foreach ($analytics['users'] as $user_data): ?>
                                <tr>
                                    <td><?php echo esc_html($user_data['username']); ?></td>
                                    <td><?php echo esc_html($user_data['email']); ?></td>
                                    <td><span class="badge badge-<?php echo strtolower($user_data['account_type']); ?>"><?php echo esc_html($user_data['account_type']); ?></span></td>
                                    <td><?php echo esc_html($user_data['card_count']); ?></td>
                                    <td><?php echo esc_html($user_data['backup_count']); ?></td>
                                    <td><?php echo esc_html($user_data['last_backup']); ?></td>
                                    <td><?php echo esc_html($user_data['last_login']); ?></td>
                                    <td><?php echo esc_html($user_data['storage_used']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="8" class="text-center">No backup data available. Pro users will appear here once they create backups.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
                
                <p class="description">
                    <strong>Note:</strong> Only Pro accounts have access to backup functionality. Free tier users are not shown in this table.
                </p>
            </div>
        </div>
        <?php
    }
    
    /**
     * API TAB
     */
    private function render_api_tab() {
        global $wpdb;
        
        // Ensure database tables exist (create them if they don't)
        ultra_card_create_database_tables();
        
        // Get API keys
        $table_name = $wpdb->prefix . 'ultra_card_api_keys';
        $api_keys = $wpdb->get_results("SELECT * FROM {$table_name} ORDER BY created_at DESC");
        
        // Get API statistics
        $api_stats = $this->get_api_usage_stats();
        
        ?>
        <div class="ultra-card-api-container">
            <!-- API Keys Management -->
            <div class="ultra-card-card">
                <h2><span class="dashicons dashicons-admin-network"></span> API Key Management</h2>
                <p class="description">Generate API keys for external applications (mobile apps, desktop tools, third-party integrations). API keys allow secure access to Ultra Card data without requiring user login.</p>
                
                <div class="ultra-card-api-key-generator">
                    <h3>Generate New API Key</h3>
                    <p>
                        <input type="text" id="api-key-name" placeholder="Key name (e.g., Mobile App)" class="regular-text" />
                        <select id="api-key-permission">
                            <option value="read">Read Only</option>
                            <option value="full">Full Access</option>
                        </select>
                        <button type="button" class="button button-primary" id="generate-api-key">
                            <span class="dashicons dashicons-plus-alt"></span> Generate Key
                        </button>
                    </p>
                    <div id="api-key-result"></div>
                </div>
                
                <h3>Active API Keys</h3>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Permission</th>
                            <th>Created</th>
                            <th>Last Used</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($api_keys && count($api_keys) > 0): ?>
                            <?php foreach ($api_keys as $key): ?>
                                <tr>
                                    <td><?php echo esc_html($key->name); ?></td>
                                    <td><code><?php echo esc_html(substr($key->api_key, 0, 20) . '...' . substr($key->api_key, -5)); ?></code></td>
                                    <td><span class="badge"><?php echo esc_html(ucfirst($key->permission)); ?></span></td>
                                    <td><?php echo esc_html($key->created_at); ?></td>
                                    <td><?php echo esc_html($key->last_used_at ?: 'Never'); ?></td>
                                    <td>
                                        <button type="button" class="button button-small revoke-api-key" data-key-id="<?php echo esc_attr($key->id); ?>">
                                            Revoke
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="6" class="text-center">No API keys generated yet.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
            
            <!-- API Usage Statistics -->
            <div class="ultra-card-card" style="margin-top: 20px;">
                <h2><span class="dashicons dashicons-chart-line"></span> API Usage Statistics</h2>
                <p class="description">Monitor how your Ultra Card API endpoints are being used. Track requests, identify popular features, and monitor for errors or performance issues.</p>
                
                <div class="ultra-card-stats-grid">
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $api_stats['today']; ?></div>
                        <div class="stat-label">Requests Today</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $api_stats['week']; ?></div>
                        <div class="stat-label">Requests This Week</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $api_stats['month']; ?></div>
                        <div class="stat-label">Requests This Month</div>
                    </div>
                    <div class="ultra-card-stat-box">
                        <div class="stat-value"><?php echo $api_stats['error_rate']; ?>%</div>
                        <div class="stat-label">Error Rate</div>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>Requests by Endpoint (Last 7 Days)</h3>
                    <canvas id="api-endpoints-chart" width="400" height="200"></canvas>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>Top API Users</h3>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Requests (7 days)</th>
                                <th>Errors</th>
                                <th>Last Request</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($api_stats['top_users']) > 0): ?>
                                <?php foreach ($api_stats['top_users'] as $user_stat): ?>
                                    <tr>
                                        <td><?php echo esc_html($user_stat['username']); ?></td>
                                        <td><?php echo esc_html($user_stat['request_count']); ?></td>
                                        <td><?php echo esc_html($user_stat['error_count']); ?></td>
                                        <td><?php echo esc_html($user_stat['last_request']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="4" class="text-center">No API usage data available.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <script>
        <?php if (!empty($api_stats['endpoint_data'])): ?>
        jQuery(document).ready(function($) {
            var ctx = document.getElementById('api-endpoints-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: <?php echo json_encode($api_stats['endpoint_data']['labels']); ?>,
                    datasets: [{
                        label: 'Requests',
                        data: <?php echo json_encode($api_stats['endpoint_data']['values']); ?>,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });
        <?php endif; ?>
        </script>
        <?php
    }
    
    /**
     * DEBUG TAB
     */
    private function render_debug_tab() {
        // Get system diagnostics
        $diagnostics = $this->get_system_diagnostics();
        
        ?>
        <div class="ultra-card-debug-container">
            <!-- System Diagnostics -->
            <div class="ultra-card-card">
                <h2><span class="dashicons dashicons-admin-tools"></span> System Diagnostics</h2>
                
                <table class="widefat">
                    <tbody>
                        <tr>
                            <th>Plugin Version:</th>
                            <td><code><?php echo esc_html($diagnostics['plugin_version']); ?></code></td>
                            <td><?php echo $diagnostics['plugin_status']; ?></td>
                        </tr>
                        <tr>
                            <th>WordPress Version:</th>
                            <td><code><?php echo esc_html($diagnostics['wp_version']); ?></code></td>
                            <td><?php echo $diagnostics['wp_status']; ?></td>
                        </tr>
                        <tr>
                            <th>PHP Version:</th>
                            <td><code><?php echo esc_html($diagnostics['php_version']); ?></code></td>
                            <td><?php echo $diagnostics['php_status']; ?></td>
                        </tr>
                        <tr>
                            <th>Memory Limit:</th>
                            <td><code><?php echo esc_html($diagnostics['memory_limit']); ?></code></td>
                            <td><?php echo $diagnostics['memory_status']; ?></td>
                        </tr>
                        <tr>
                            <th>Max Upload Size:</th>
                            <td><code><?php echo esc_html($diagnostics['max_upload']); ?></code></td>
                            <td>✓</td>
                        </tr>
                        <tr>
                            <th>Database Tables:</th>
                            <td><code><?php echo esc_html($diagnostics['db_tables']); ?></code></td>
                            <td><?php echo $diagnostics['db_status']; ?></td>
                        </tr>
                        <tr>
                            <th>WooCommerce Subscriptions:</th>
                            <td><?php echo $diagnostics['woo_status']; ?></td>
                            <td><?php echo $diagnostics['woo_icon']; ?></td>
                        </tr>
                        <tr>
                            <th>Directories Pro:</th>
                            <td><?php echo $diagnostics['directories_status']; ?></td>
                            <td><?php echo $diagnostics['directories_icon']; ?></td>
                        </tr>
                        <tr>
                            <th>Total Users:</th>
                            <td><code><?php echo esc_html($diagnostics['total_users']); ?></code></td>
                            <td>ℹ️</td>
                        </tr>
                        <tr>
                            <th>Pro Users:</th>
                            <td><code><?php echo esc_html($diagnostics['pro_users']); ?></code></td>
                            <td>ℹ️</td>
                        </tr>
                        <tr>
                            <th>Free Users:</th>
                            <td><code><?php echo esc_html($diagnostics['free_users']); ?></code></td>
                            <td>ℹ️</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Test Tools -->
            <div class="ultra-card-card" style="margin-top: 20px;">
                <h2><span class="dashicons dashicons-admin-tools"></span> Test Tools</h2>
                
                <div class="ultra-card-test-tools">
                    <button type="button" class="button" id="test-discord-btn">
                        <span class="dashicons dashicons-buddicons-replies"></span> Test Discord Connection
                    </button>
                    
                    <button type="button" class="button" id="test-api-btn">
                        <span class="dashicons dashicons-admin-network"></span> Test API Endpoints
                    </button>
                    
                    <button type="button" class="button" id="create-db-tables-btn">
                        <span class="dashicons dashicons-database-add"></span> Create Database Tables
                    </button>
                    
                    <button type="button" class="button" id="clear-cache-btn">
                        <span class="dashicons dashicons-trash"></span> Clear Cache/Transients
                    </button>
                    
                    <button type="button" class="button button-primary" id="clear-preset-cache-btn" style="background: #ff6600; border-color: #ff6600;">
                        <span class="dashicons dashicons-update"></span> Clear REST API & Preset Cache
                    </button>
                    
                    <button type="button" class="button" id="force-prune-btn">
                        <span class="dashicons dashicons-cloud"></span> Force Backup Prune
                    </button>
                </div>
                
                <div id="test-results" style="margin-top: 20px;"></div>
            </div>
            
            <!-- Error Logs Viewer -->
            <div class="ultra-card-card" style="margin-top: 20px;">
                <div class="ultra-card-card-header">
                    <h2><span class="dashicons dashicons-warning"></span> Error Logs</h2>
                    <div>
                        <select id="log-filter">
                            <option value="">All Logs</option>
                            <option value="ERROR">Errors Only</option>
                            <option value="WARNING">Warnings Only</option>
                            <option value="INFO">Info Only</option>
                        </select>
                        <button type="button" class="button" id="refresh-logs">
                            <span class="dashicons dashicons-update"></span> Refresh
                        </button>
                        <button type="button" class="button" id="download-logs">
                            <span class="dashicons dashicons-download"></span> Download
                        </button>
                    </div>
                </div>
                
                <div id="log-viewer" class="ultra-card-log-viewer">
                    <pre id="log-content">Loading logs...</pre>
                </div>
            </div>
        </div>
        <?php
    }
    
    // ==========================================
    // HELPER METHODS
    // ==========================================
    
    private function get_discord_settings() {
        return array(
            'client_id' => get_option('ultra_card_discord_client_id', ''),
            'client_secret' => get_option('ultra_card_discord_client_secret', ''),
            'bot_token' => get_option('ultra_card_discord_bot_token', ''),
            'guild_id' => get_option('ultra_card_discord_guild_id', ''),
            'pro_role_id' => get_option('ultra_card_discord_pro_role_id', ''),
            'free_role_id' => get_option('ultra_card_discord_free_role_id', ''),
        );
    }
    
    private function get_backup_settings() {
        return array(
            'retention_days' => get_option('ultra_card_backup_retention_days', 90),
            'max_backups_free' => get_option('ultra_card_max_backups_free', 0),
            'max_backups_pro' => get_option('ultra_card_max_backups_pro', 100),
            'auto_prune_enabled' => get_option('ultra_card_auto_prune_enabled', true),
        );
    }
    
    private function get_api_settings() {
        return array(
            'rate_limit' => get_option('ultra_card_api_rate_limit', 60),
            'key_expiration' => get_option('ultra_card_api_key_expiration', 365),
            'logging_enabled' => get_option('ultra_card_api_logging_enabled', true),
        );
    }
    
    private function get_general_settings() {
        return array(
            'debug_mode' => get_option('ultra_card_debug_mode', false),
            'log_retention_days' => get_option('ultra_card_log_retention_days', 30),
        );
    }
    
    private function save_settings() {
        // Discord settings
        if (isset($_POST['discord_client_id'])) {
            update_option('ultra_card_discord_client_id', sanitize_text_field($_POST['discord_client_id']));
        }
        if (isset($_POST['discord_client_secret'])) {
            update_option('ultra_card_discord_client_secret', sanitize_text_field($_POST['discord_client_secret']));
        }
        if (isset($_POST['discord_bot_token'])) {
            update_option('ultra_card_discord_bot_token', sanitize_text_field($_POST['discord_bot_token']));
        }
        if (isset($_POST['discord_guild_id'])) {
            update_option('ultra_card_discord_guild_id', sanitize_text_field($_POST['discord_guild_id']));
        }
        if (isset($_POST['discord_pro_role_id'])) {
            update_option('ultra_card_discord_pro_role_id', sanitize_text_field($_POST['discord_pro_role_id']));
        }
        if (isset($_POST['discord_free_role_id'])) {
            update_option('ultra_card_discord_free_role_id', sanitize_text_field($_POST['discord_free_role_id']));
        }
        
        // Backup settings
        if (isset($_POST['backup_retention_days'])) {
            update_option('ultra_card_backup_retention_days', absint($_POST['backup_retention_days']));
        }
        if (isset($_POST['max_backups_free'])) {
            update_option('ultra_card_max_backups_free', absint($_POST['max_backups_free']));
        }
        if (isset($_POST['max_backups_pro'])) {
            update_option('ultra_card_max_backups_pro', absint($_POST['max_backups_pro']));
        }
        update_option('ultra_card_auto_prune_enabled', isset($_POST['auto_prune_enabled']));
        
        // API settings
        if (isset($_POST['api_rate_limit'])) {
            update_option('ultra_card_api_rate_limit', absint($_POST['api_rate_limit']));
        }
        if (isset($_POST['api_key_expiration'])) {
            update_option('ultra_card_api_key_expiration', absint($_POST['api_key_expiration']));
        }
        update_option('ultra_card_api_logging_enabled', isset($_POST['api_logging_enabled']));
        
        // General settings
        update_option('ultra_card_debug_mode', isset($_POST['debug_mode']));
        if (isset($_POST['log_retention_days'])) {
            update_option('ultra_card_log_retention_days', absint($_POST['log_retention_days']));
        }
    }
    
    private function count_users_by_role($role, $users) {
        $count = 0;
        foreach ($users as $user) {
            $wp_user = get_user_by('id', $user->ID);
            if ($wp_user && in_array($role, $wp_user->roles)) {
                $count++;
            }
        }
        return $count;
    }
    
    private function get_backup_analytics() {
        global $wpdb;
        
        // Get all Pro users
        $pro_users = get_users(array('role' => 'ultra_card_pro'));
        
        $users_data = array();
        $total_backups = 0;
        $total_storage = 0;
        
        foreach ($pro_users as $user) {
            // Count snapshots (using correct post type: ultra_snapshot)
            $snapshots = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->posts} 
                WHERE post_type = 'ultra_snapshot' AND post_author = %d",
                $user->ID
            ));
            
            // Count card backups
            $card_backups = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->posts} 
                WHERE post_type = 'ultra_card_backup' AND post_author = %d",
                $user->ID
            ));
            
            // Get last backup date
            $last_backup = $wpdb->get_var($wpdb->prepare(
                "SELECT post_date FROM {$wpdb->posts} 
                WHERE (post_type = 'ultra_snapshot' OR post_type = 'ultra_card_backup') 
                AND post_author = %d 
                ORDER BY post_date DESC LIMIT 1",
                $user->ID
            ));
            
            // Calculate storage used (using correct post types)
            $storage = $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(LENGTH(post_content)) FROM {$wpdb->posts} 
                WHERE (post_type = 'ultra_snapshot' OR post_type = 'ultra_card_backup') 
                AND post_author = %d",
                $user->ID
            ));
            
            // If no storage from post_content, try including other fields
            if (!$storage || $storage == 0) {
                $storage = $wpdb->get_var($wpdb->prepare(
                    "SELECT SUM(LENGTH(post_content) + LENGTH(post_excerpt) + LENGTH(post_title)) FROM {$wpdb->posts} 
                    WHERE (post_type = 'ultra_snapshot' OR post_type = 'ultra_card_backup') 
                    AND post_author = %d",
                    $user->ID
                ));
            }
            
            // Debug: Check what post types actually exist for this user
            if (defined('WP_DEBUG') && WP_DEBUG) {
                $debug_posts = $wpdb->get_results($wpdb->prepare(
                    "SELECT post_type, post_status, LENGTH(post_content) as content_length, LENGTH(post_excerpt) as excerpt_length, LENGTH(post_title) as title_length FROM {$wpdb->posts} 
                    WHERE (post_type = 'ultra_snapshot' OR post_type = 'ultra_card_backup') 
                    AND post_author = %d",
                    $user->ID
                ));
                if ($debug_posts) {
                    error_log("Ultra Card Debug - User {$user->ID} ({$user->user_login}) posts: " . print_r($debug_posts, true));
                }
            }
            
            $backup_count = $snapshots + $card_backups;
            $storage_bytes = $storage ?: 0;
            
            $total_backups += $backup_count;
            $total_storage += $storage_bytes;
            
            // Get last login from user meta
            $last_login = get_user_meta($user->ID, 'ultra_card_last_login', true);
            if (!$last_login) {
                // Fallback to WordPress last login if available
                $last_login = get_user_meta($user->ID, 'last_login', true);
                if (!$last_login) {
                    $last_login = 'Never';
                } else {
                    $last_login = date('Y-m-d H:i', strtotime($last_login));
                }
            } else {
                $last_login = date('Y-m-d H:i', strtotime($last_login));
            }
            
            $users_data[] = array(
                'username' => $user->user_login,
                'email' => $user->user_email,
                'account_type' => 'Pro',
                'card_count' => $card_backups,
                'backup_count' => $backup_count,
                'last_backup' => $last_backup ? date('Y-m-d H:i', strtotime($last_backup)) : 'Never',
                'last_login' => $last_login,
                'storage_used' => $this->format_bytes($storage_bytes),
            );
        }
        
        return array(
            'total_users' => count($pro_users),
            'total_backups' => $total_backups,
            'total_storage' => $this->format_bytes($total_storage),
            'avg_backups_per_user' => count($pro_users) > 0 ? round($total_backups / count($pro_users), 1) : 0,
            'users' => $users_data,
        );
    }
    
    private function get_api_usage_stats() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ultra_card_api_logs';
        
        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table_name}'") != $table_name) {
            return array(
                'today' => 0,
                'week' => 0,
                'month' => 0,
                'error_rate' => 0,
                'endpoint_data' => array('labels' => array(), 'values' => array()),
                'top_users' => array(),
            );
        }
        
        // Get request counts
        $today = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name} WHERE DATE(created_at) = CURDATE()");
        $week = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name} WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $month = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name} WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        
        // Calculate error rate
        $total_requests = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name} WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $error_requests = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name} WHERE status_code >= 400 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $error_rate = $total_requests > 0 ? round(($error_requests / $total_requests) * 100, 1) : 0;
        
        // Get endpoint statistics
        $endpoint_stats = $wpdb->get_results("
            SELECT endpoint, COUNT(*) as count 
            FROM {$table_name} 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY endpoint 
            ORDER BY count DESC 
            LIMIT 10
        ");
        
        $endpoint_labels = array();
        $endpoint_values = array();
        foreach ($endpoint_stats as $stat) {
            $endpoint_labels[] = $stat->endpoint;
            $endpoint_values[] = $stat->count;
        }
        
        // Get top users
        $top_users = $wpdb->get_results("
            SELECT user_id, COUNT(*) as request_count,
                   SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count,
                   MAX(created_at) as last_request
            FROM {$table_name}
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY user_id
            ORDER BY request_count DESC
            LIMIT 10
        ");
        
        $top_users_data = array();
        foreach ($top_users as $user_stat) {
            $user = get_user_by('id', $user_stat->user_id);
            $top_users_data[] = array(
                'username' => $user ? $user->user_login : 'Unknown',
                'request_count' => $user_stat->request_count,
                'error_count' => $user_stat->error_count,
                'last_request' => date('Y-m-d H:i', strtotime($user_stat->last_request)),
            );
        }
        
        return array(
            'today' => $today ?: 0,
            'week' => $week ?: 0,
            'month' => $month ?: 0,
            'error_rate' => $error_rate,
            'endpoint_data' => array(
                'labels' => $endpoint_labels,
                'values' => $endpoint_values,
            ),
            'top_users' => $top_users_data,
        );
    }
    
    private function get_system_diagnostics() {
        global $wpdb;
        
        // Check database tables
        $required_tables = array(
            $wpdb->prefix . 'ultra_card_api_keys',
            $wpdb->prefix . 'ultra_card_api_logs',
        );
        
        $tables_exist = 0;
        foreach ($required_tables as $table) {
            if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") == $table) {
                $tables_exist++;
            }
        }
        
        $db_status = $tables_exist === count($required_tables) ? '✓ All tables exist' : '⚠️ ' . $tables_exist . '/' . count($required_tables) . ' tables';
        
        // Check WooCommerce
        $woo_active = class_exists('WC_Subscriptions');
        $woo_status = $woo_active ? 'Active' : 'Not installed';
        $woo_icon = $woo_active ? '✓' : '✗';
        
        // Check Directories Pro
        $directories_active = class_exists('SabaiApps\\Directories\\Application');
        $directories_status = $directories_active ? 'Active' : 'Not installed';
        $directories_icon = $directories_active ? '✓' : '✗';
        
        // Count users
        $total_users = count_users();
        $pro_users = count(get_users(array('role' => 'ultra_card_pro')));
        $free_users = count(get_users(array('role' => 'ultra_card_free')));
        
        // PHP version check
        $php_version = PHP_VERSION;
        $php_status = version_compare($php_version, '7.4', '>=') ? '✓' : '⚠️';
        
        // Memory check
        $memory_limit = ini_get('memory_limit');
        $memory_status = '✓';
        
        return array(
            'plugin_version' => ULTRA_CARD_INTEGRATION_VERSION,
            'plugin_status' => '✓',
            'wp_version' => get_bloginfo('version'),
            'wp_status' => '✓',
            'php_version' => $php_version,
            'php_status' => $php_status,
            'memory_limit' => $memory_limit,
            'memory_status' => $memory_status,
            'max_upload' => ini_get('upload_max_filesize'),
            'db_tables' => $tables_exist . '/' . count($required_tables),
            'db_status' => $db_status,
            'woo_status' => $woo_status,
            'woo_icon' => $woo_icon,
            'directories_status' => $directories_status,
            'directories_icon' => $directories_icon,
            'total_users' => $total_users['total_users'],
            'pro_users' => $pro_users,
            'free_users' => $free_users,
        );
    }
    
    private function format_bytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
    
    // ==========================================
    // AJAX HANDLERS
    // ==========================================
    
    public function ajax_test_discord() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $discord_settings = $this->get_discord_settings();
        
        if (empty($discord_settings['bot_token']) || empty($discord_settings['guild_id'])) {
            wp_send_json_error('Bot token and Guild ID are required');
        }
        
        // Test bot connection
        $response = wp_remote_get("https://discord.com/api/v10/guilds/{$discord_settings['guild_id']}", array(
            'headers' => array(
                'Authorization' => 'Bot ' . $discord_settings['bot_token']
            )
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('Failed to connect: ' . $response->get_error_message());
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            $body = wp_remote_retrieve_body($response);
            $guild_data = json_decode($body, true);
            wp_send_json_success("Connected successfully! Server: " . ($guild_data['name'] ?? 'Unknown'));
        } else {
            $body = wp_remote_retrieve_body($response);
            wp_send_json_error("Connection failed (HTTP {$code}): " . $body);
        }
    }
    
    public function ajax_test_api() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        // Test key REST endpoints
        $endpoints = array(
            '/ultra-card/v1/backups',
            '/ultra-card/v1/snapshots',
            '/ultra-card/v1/subscription',
        );
        
        $results = array();
        foreach ($endpoints as $endpoint) {
            $url = rest_url($endpoint);
            $response = wp_remote_get($url);
            $code = wp_remote_retrieve_response_code($response);
            $results[] = array(
                'endpoint' => $endpoint,
                'status' => $code,
                'success' => $code < 400,
            );
        }
        
        wp_send_json_success($results);
    }
    
    public function ajax_clear_cache() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        // Clear all transients
        global $wpdb;
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_ultra_card_%'");
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_ultra_card_%'");
        
        wp_send_json_success('Cache cleared successfully');
    }
    
    public function ajax_clear_preset_cache() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $cleared = array();
        
        // 1. Clear WordPress object cache
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
            $cleared[] = 'Object cache flushed';
        }
        
        // 2. Clear all REST API transients
        global $wpdb;
        $count = $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%rest%'");
        $cleared[] = "REST transients cleared ($count)";
        
        // 3. Clear preset-specific transients
        $count = $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%preset%'");
        $cleared[] = "Preset transients cleared ($count)";
        
        // 4. Clear OPcache if available (PHP opcode cache)
        if (function_exists('opcache_reset')) {
            opcache_reset();
            $cleared[] = 'PHP OPcache reset';
        }
        
        // 5. Flush rewrite rules to rebuild REST API routes
        flush_rewrite_rules(false);
        $cleared[] = 'REST API routes rebuilt';
        
        // 6. Clear post meta cache for presets
        $preset_posts = get_posts(array(
            'post_type' => 'presets_dir_ltg',
            'posts_per_page' => -1,
            'fields' => 'ids'
        ));
        
        foreach ($preset_posts as $post_id) {
            clean_post_cache($post_id);
        }
        $cleared[] = count($preset_posts) . ' preset post caches cleared';
        
        wp_send_json_success(array(
            'message' => 'REST API & Preset cache cleared successfully!',
            'details' => $cleared
        ));
    }
    
    public function ajax_force_prune() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        // Call the prune method from cloud sync
        if ($this->cloud_sync) {
            $this->cloud_sync->prune_old_backups();
            wp_send_json_success('Backup pruning completed');
        } else {
            wp_send_json_error('Cloud sync not available');
        }
    }
    
    public function ajax_generate_api_key() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        $permission = isset($_POST['permission']) ? sanitize_text_field($_POST['permission']) : 'read';
        
        if (empty($name)) {
            wp_send_json_error('Key name is required');
        }
        
        // Generate random API key
        $api_key = 'uc_' . wp_generate_password(40, false);
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'ultra_card_api_keys';
        
        $wpdb->insert($table_name, array(
            'name' => $name,
            'api_key' => $api_key,
            'permission' => $permission,
            'created_at' => current_time('mysql'),
        ));
        
        wp_send_json_success(array(
            'message' => 'API key generated successfully',
            'api_key' => $api_key,
        ));
    }
    
    public function ajax_revoke_api_key() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $key_id = isset($_POST['key_id']) ? absint($_POST['key_id']) : 0;
        
        if (!$key_id) {
            wp_send_json_error('Invalid key ID');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'ultra_card_api_keys';
        
        $wpdb->delete($table_name, array('id' => $key_id));
        
        wp_send_json_success('API key revoked successfully');
    }
    
    public function ajax_get_logs() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $filter = isset($_POST['filter']) ? sanitize_text_field($_POST['filter']) : '';
        
        // Read debug.log
        $log_file = WP_CONTENT_DIR . '/debug.log';
        
        if (!file_exists($log_file)) {
            wp_send_json_success('No log file found');
        }
        
        // Get last 1000 lines
        $lines = array();
        $file = new SplFileObject($log_file);
        $file->seek(PHP_INT_MAX);
        $total_lines = $file->key();
        $start_line = max(0, $total_lines - 1000);
        
        $file->seek($start_line);
        while (!$file->eof()) {
            $line = $file->current();
            // Filter for Ultra Card logs
            if (strpos($line, 'Ultra Card:') !== false) {
                // Apply level filter if specified
                if (empty($filter) || strpos($line, $filter) !== false) {
                    $lines[] = $line;
                }
            }
            $file->next();
        }
        
        wp_send_json_success(implode('', array_slice($lines, -500)));
    }
    
    public function ajax_export_backups_csv() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $analytics = $this->get_backup_analytics();
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="ultra-card-backups-' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        // CSV headers
        fputcsv($output, array('Username', 'Email', 'Account Type', 'Total Cards', 'Total Backups', 'Last Backup', 'Last Login', 'Storage Used'));
        
        // CSV data
        foreach ($analytics['users'] as $user_data) {
            fputcsv($output, array(
                $user_data['username'],
                $user_data['email'],
                $user_data['account_type'],
                $user_data['card_count'],
                $user_data['backup_count'],
                $user_data['last_backup'],
                $user_data['last_login'],
                $user_data['storage_used'],
            ));
        }
        
        fclose($output);
        exit;
    }
    
    public function ajax_create_db_tables() {
        check_ajax_referer('ultra_card_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        // Create the database tables
        ultra_card_create_database_tables();
        
        wp_send_json_success('Database tables created successfully! Please refresh the page to see updated diagnostics.');
    }
    
    // ==========================================
    // CSS & JS
    // ==========================================
    
    private function get_admin_css() {
        return '
        .ultra-card-admin-wrap {
            margin: 20px 20px 0 0;
        }
        .ultra-card-nav-tabs {
            margin-bottom: 0;
            border-bottom: 1px solid #ccc;
        }
        .ultra-card-nav-tabs .nav-tab {
            font-size: 14px;
        }
        .ultra-card-nav-tabs .dashicons {
            font-size: 16px;
            width: 16px;
            height: 16px;
            margin-right: 5px;
            vertical-align: text-bottom;
        }
        .ultra-card-tab-content {
            background: #fff;
            padding: 20px;
            border: 1px solid #ccc;
            border-top: none;
        }
        .ultra-card-card {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .ultra-card-card h2 {
            margin-top: 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .ultra-card-card h2 .dashicons {
            font-size: 24px;
            width: 24px;
            height: 24px;
            margin-right: 8px;
            vertical-align: text-bottom;
        }
        .ultra-card-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .ultra-card-card-header h2 {
            margin: 0;
            border: none;
            padding: 0;
        }
        .ultra-card-settings-section {
            margin-bottom: 30px;
            padding-bottom: 30px;
            border-bottom: 1px solid #eee;
        }
        .ultra-card-settings-section:last-child {
            border-bottom: none;
        }
        .ultra-card-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .ultra-card-stat-box {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 20px;
            text-align: center;
        }
        .ultra-card-stat-box .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #2271b1;
            margin-bottom: 5px;
        }
        .ultra-card-stat-box .stat-label {
            font-size: 14px;
            color: #666;
        }
        .ultra-card-table-filters {
            margin: 15px 0;
        }
        .ultra-card-table-filters input,
        .ultra-card-table-filters select {
            margin-right: 10px;
        }
        .ultra-card-test-tools {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .ultra-card-log-viewer {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 4px;
            max-height: 500px;
            overflow-y: auto;
            font-family: "Courier New", monospace;
            font-size: 12px;
        }
        .ultra-card-log-viewer pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-pro {
            background: #00a32a;
            color: #fff;
        }
        .badge-free {
            background: #dba617;
            color: #fff;
        }
        .text-center {
            text-align: center;
        }
        #test-results, #discord-test-result {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
        }
        ';
    }
    
    private function get_admin_js() {
        $ajax_url = admin_url('admin-ajax.php');
        $nonce = wp_create_nonce('ultra_card_admin_nonce');
        
        return "
        jQuery(document).ready(function($) {
            // Test Discord Connection
            $('#test-discord-connection, #test-discord-btn').on('click', function() {
                var button = $(this);
                var resultDiv = $(this).closest('.ultra-card-card').find('#discord-test-result, #test-results');
                
                button.prop('disabled', true).text('Testing...');
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_test_discord',
                    nonce: '{$nonce}'
                }, function(response) {
                    button.prop('disabled', false).html('<span class=\"dashicons dashicons-update\"></span> Test Connection');
                    
                    if (response.success) {
                        resultDiv.html('<div class=\"notice notice-success inline\"><p>' + response.data + '</p></div>');
                    } else {
                        resultDiv.html('<div class=\"notice notice-error inline\"><p>' + response.data + '</p></div>');
                    }
                });
            });
            
            // Test API Endpoints
            $('#test-api-btn').on('click', function() {
                var button = $(this);
                var resultDiv = $('#test-results');
                
                button.prop('disabled', true).text('Testing...');
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_test_api',
                    nonce: '{$nonce}'
                }, function(response) {
                    button.prop('disabled', false).html('<span class=\"dashicons dashicons-admin-network\"></span> Test API Endpoints');
                    
                    if (response.success) {
                        var html = '<div class=\"notice notice-success inline\"><p><strong>API Test Results:</strong></p><ul>';
                        response.data.forEach(function(result) {
                            var status = result.success ? '✓' : '✗';
                            html += '<li>' + status + ' ' + result.endpoint + ' (HTTP ' + result.status + ')</li>';
                        });
                        html += '</ul></div>';
                        resultDiv.html(html);
                    } else {
                        resultDiv.html('<div class=\"notice notice-error inline\"><p>' + response.data + '</p></div>');
                    }
                });
            });
            
            // Clear Cache
            $('#clear-cache-btn').on('click', function() {
                if (!confirm('Are you sure you want to clear all Ultra Card cache?')) return;
                
                var button = $(this);
                button.prop('disabled', true).text('Clearing...');
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_clear_cache',
                    nonce: '{$nonce}'
                }, function(response) {
                    button.prop('disabled', false).html('<span class=\"dashicons dashicons-trash\"></span> Clear Cache/Transients');
                    $('#test-results').html('<div class=\"notice notice-success inline\"><p>' + response.data + '</p></div>');
                });
            });
            
            // Clear REST API & Preset Cache
            $('#clear-preset-cache-btn').on('click', function() {
                if (!confirm('This will clear REST API cache, preset cache, and PHP OPcache. Continue?')) return;
                
                var button = $(this);
                button.prop('disabled', true).text('Clearing caches...');
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_clear_preset_cache',
                    nonce: '{$nonce}'
                }, function(response) {
                    button.prop('disabled', false).html('<span class=\"dashicons dashicons-update\"></span> Clear REST API & Preset Cache');
                    if (response.success) {
                        var details = '<ul>';
                        response.data.details.forEach(function(detail) {
                            details += '<li>' + detail + '</li>';
                        });
                        details += '</ul>';
                        $('#test-results').html('<div class=\"notice notice-success inline\"><p><strong>' + response.data.message + '</strong>' + details + '</p></div>');
                    } else {
                        $('#test-results').html('<div class=\"notice notice-error inline\"><p>Error: ' + response.data + '</p></div>');
                    }
                });
            });
            
            // Force Backup Prune
            $('#force-prune-btn').on('click', function() {
                if (!confirm('Are you sure you want to prune old backups now?')) return;
                
                var button = $(this);
                button.prop('disabled', true).text('Pruning...');
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_force_prune',
                    nonce: '{$nonce}'
                }, function(response) {
                    button.prop('disabled', false).html('<span class=\"dashicons dashicons-cloud\"></span> Force Backup Prune');
                    $('#test-results').html('<div class=\"notice notice-success inline\"><p>' + response.data + '</p></div>');
                });
            });
            
            // Create Database Tables
            $('#create-db-tables-btn').on('click', function() {
                if (!confirm('Are you sure you want to create the missing database tables?')) return;
                
                var button = $(this);
                button.prop('disabled', true).text('Creating...');
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_create_db_tables',
                    nonce: '{$nonce}'
                }, function(response) {
                    button.prop('disabled', false).html('<span class=\"dashicons dashicons-database-add\"></span> Create Database Tables');
                    if (response.success) {
                        $('#test-results').html('<div class=\"notice notice-success inline\"><p>' + response.data + '</p></div>');
                        // Refresh the page after 2 seconds to show updated diagnostics
                        setTimeout(function() {
                            location.reload();
                        }, 2000);
                    } else {
                        $('#test-results').html('<div class=\"notice notice-error inline\"><p>' + response.data + '</p></div>');
                    }
                });
            });
            
            // Generate API Key
            $('#generate-api-key').on('click', function() {
                var name = $('#api-key-name').val();
                var permission = $('#api-key-permission').val();
                var resultDiv = $('#api-key-result');
                
                if (!name) {
                    alert('Please enter a name for the API key');
                    return;
                }
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_generate_api_key',
                    nonce: '{$nonce}',
                    name: name,
                    permission: permission
                }, function(response) {
                    if (response.success) {
                        resultDiv.html('<div class=\"notice notice-success inline\"><p><strong>API Key Generated!</strong><br><code style=\"font-size: 14px;\">' + response.data.api_key + '</code><br><small>Save this key now - you won\\'t be able to see it again!</small></p></div>');
                        $('#api-key-name').val('');
                        setTimeout(function() {
                            location.reload();
                        }, 3000);
                    } else {
                        resultDiv.html('<div class=\"notice notice-error inline\"><p>' + response.data + '</p></div>');
                    }
                });
            });
            
            // Revoke API Key
            $('.revoke-api-key').on('click', function() {
                if (!confirm('Are you sure you want to revoke this API key?')) return;
                
                var keyId = $(this).data('key-id');
                var button = $(this);
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_revoke_api_key',
                    nonce: '{$nonce}',
                    key_id: keyId
                }, function(response) {
                    if (response.success) {
                        button.closest('tr').fadeOut();
                    } else {
                        alert(response.data);
                    }
                });
            });
            
            // Refresh Logs
            function loadLogs() {
                var filter = $('#log-filter').val();
                
                $.post('{$ajax_url}', {
                    action: 'ultra_card_get_logs',
                    nonce: '{$nonce}',
                    filter: filter
                }, function(response) {
                    if (response.success) {
                        $('#log-content').text(response.data || 'No logs found');
                    }
                });
            }
            
            $('#refresh-logs').on('click', loadLogs);
            $('#log-filter').on('change', loadLogs);
            
            // Auto-load logs on debug tab
            if ($('#log-viewer').length) {
                loadLogs();
            }
            
            // Download Logs
            $('#download-logs').on('click', function() {
                var content = $('#log-content').text();
                var blob = new Blob([content], { type: 'text/plain' });
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'ultra-card-debug-' + new Date().toISOString().split('T')[0] + '.log';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            });
            
            // Export Backups CSV
            $('#export-backups-csv').on('click', function() {
                window.location.href = '{$ajax_url}?action=ultra_card_export_backups_csv&nonce={$nonce}';
            });
        });
        ";
    }
}

// Register shortcode after plugin initialization
add_action('init', function() {
    global $ultra_card_dashboard_integration;
    if ($ultra_card_dashboard_integration) {
        add_shortcode('ultra_card_dashboard', array($ultra_card_dashboard_integration, 'ultra_card_dashboard_shortcode'));
    }
}, 20);
