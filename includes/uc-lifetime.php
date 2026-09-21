<?php
/**
 * Ultra Card Pro Lifetime
 *
 * One-time "for the life of Ultra Card" purchase, loyalty credit toward the
 * price based on prior Pro payments, auto-flip when cumulative paid reaches
 * the threshold, and a one-time grandfather tool for early supporters.
 *
 * Settings (wp_options):
 *   ultra_card_lifetime_product_id      int    WooCommerce product ID (auto-created)
 *   ultra_card_lifetime_price           float  List price / auto-flip threshold (default 99)
 *   ultra_card_lifetime_grandfather_min float  One-time free flip threshold (default 60)
 *   ultra_card_lifetime_credit_floor    float  Minimum remaining after loyalty credit (default 29)
 *
 * User meta:
 *   ultra_card_lifetime                 array  {granted_at, source, order_id?, note?}
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('UltraCardLifetime')) :

class UltraCardLifetime {
    const OPTION_PRODUCT_ID = 'ultra_card_lifetime_product_id';
    const OPTION_PRICE = 'ultra_card_lifetime_price';
    const OPTION_GRANDFATHER_MIN = 'ultra_card_lifetime_grandfather_min';
    const OPTION_CREDIT_FLOOR = 'ultra_card_lifetime_credit_floor';
    const META_KEY = 'ultra_card_lifetime';
    const PRODUCT_SLUG = 'ultra-card-pro-lifetime';
    const PRODUCT_NAME = 'Ultra Card Pro – Lifetime';

    /** @var UltraCardLifetime|null */
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'maybe_ensure_product'), 30);
        add_action('admin_menu', array($this, 'register_admin_page'), 25);
        add_action('admin_init', array($this, 'register_settings'));

        add_action('woocommerce_order_status_processing', array($this, 'on_order_paid'), 20, 1);
        add_action('woocommerce_order_status_completed', array($this, 'on_order_paid'), 20, 1);
        add_action('woocommerce_order_status_refunded', array($this, 'on_order_refunded'), 20, 1);
        add_action('woocommerce_order_status_cancelled', array($this, 'on_order_cancelled'), 20, 1);

        add_action('woocommerce_subscription_renewal_payment_complete', array($this, 'on_renewal_complete'), 20, 2);

        add_action('woocommerce_cart_calculate_fees', array($this, 'apply_loyalty_credit'));
        add_action('woocommerce_before_calculate_totals', array($this, 'maybe_note_loyalty_credit'), 20);

        add_filter('woocommerce_add_to_cart_validation', array($this, 'validate_lifetime_cart'), 10, 2);
    }

    // ------------------------------------------------------------------
    // Settings
    // ------------------------------------------------------------------

    public function register_settings() {
        register_setting('ultra_card_lifetime_settings', self::OPTION_PRODUCT_ID, array(
            'type' => 'integer',
            'sanitize_callback' => 'absint',
            'default' => 0,
        ));
        register_setting('ultra_card_lifetime_settings', self::OPTION_PRICE, array(
            'type' => 'number',
            'sanitize_callback' => array($this, 'sanitize_money'),
            'default' => 99,
        ));
        register_setting('ultra_card_lifetime_settings', self::OPTION_GRANDFATHER_MIN, array(
            'type' => 'number',
            'sanitize_callback' => array($this, 'sanitize_money'),
            'default' => 60,
        ));
        register_setting('ultra_card_lifetime_settings', self::OPTION_CREDIT_FLOOR, array(
            'type' => 'number',
            'sanitize_callback' => array($this, 'sanitize_money'),
            'default' => 29,
        ));
    }

    public function sanitize_money($value) {
        $n = floatval($value);
        return $n < 0 ? 0 : round($n, 2);
    }

    public function get_price() {
        $v = get_option(self::OPTION_PRICE, 99);
        return floatval($v) > 0 ? floatval($v) : 99.0;
    }

    public function get_grandfather_min() {
        $v = get_option(self::OPTION_GRANDFATHER_MIN, 60);
        return floatval($v) > 0 ? floatval($v) : 60.0;
    }

    public function get_credit_floor() {
        $v = get_option(self::OPTION_CREDIT_FLOOR, 29);
        return floatval($v) >= 0 ? floatval($v) : 29.0;
    }

    public function get_product_id() {
        return absint(get_option(self::OPTION_PRODUCT_ID, 0));
    }

    public function get_product_url() {
        $id = $this->get_product_id();
        if ($id && function_exists('get_permalink')) {
            $url = get_permalink($id);
            if ($url) {
                return $url;
            }
        }
        return home_url('/product/' . self::PRODUCT_SLUG . '/');
    }

    // ------------------------------------------------------------------
    // Product bootstrap
    // ------------------------------------------------------------------

    public function maybe_ensure_product() {
        if (!class_exists('WooCommerce') || !function_exists('wc_get_product')) {
            return;
        }
        // Avoid running on every front-end hit once the product exists.
        $existing = $this->get_product_id();
        if ($existing) {
            $product = wc_get_product($existing);
            if ($product && $product->get_status() === 'publish') {
                return;
            }
        }
        // Only admins / cron / REST with manage_woocommerce create it.
        if (!is_admin() && !(defined('WP_CLI') && WP_CLI)) {
            // Still try once if option empty (first load after deploy).
            if ($existing) {
                return;
            }
        }
        $this->ensure_lifetime_product();
    }

    /**
     * Create or repair the Lifetime simple product. Returns product ID.
     */
    public function ensure_lifetime_product() {
        if (!class_exists('WC_Product_Simple')) {
            return 0;
        }

        $product_id = $this->get_product_id();
        $product = $product_id ? wc_get_product($product_id) : null;

        if (!$product) {
            // Look up by slug.
            $page = get_page_by_path(self::PRODUCT_SLUG, OBJECT, 'product');
            if ($page) {
                $product = wc_get_product($page->ID);
            }
        }

        if (!$product) {
            $product = new WC_Product_Simple();
            $product->set_name(self::PRODUCT_NAME);
            $product->set_slug(self::PRODUCT_SLUG);
            $product->set_status('publish');
            $product->set_catalog_visibility('visible');
            $product->set_description(
                'Unlock Ultra Card Pro permanently — for the life of Ultra Card. '
                . 'Includes every Pro module, cloud backups, snapshots, and priority support. '
                . 'Prior Pro subscription payments are credited toward this price (minimum $'
                . number_format($this->get_credit_floor(), 2) . '). '
                . 'When your cumulative Pro payments reach $'
                . number_format($this->get_price(), 2)
                . ', your account converts to Lifetime automatically.'
            );
            $product->set_short_description(
                'One payment. Pro forever (for the life of Ultra Card). Prior payments count toward the price.'
            );
            $product->set_regular_price((string) $this->get_price());
            $product->set_price((string) $this->get_price());
            $product->set_virtual(true);
            $product->set_sold_individually(true);
            $product->set_reviews_allowed(false);
            $product_id = $product->save();
        } else {
            // Keep price in sync with the setting.
            $price = (string) $this->get_price();
            if ($product->get_regular_price() !== $price) {
                $product->set_regular_price($price);
                $product->set_price($price);
                $product->save();
            }
            $product_id = $product->get_id();
        }

        if ($product_id) {
            update_option(self::OPTION_PRODUCT_ID, (int) $product_id, false);
        }

        return (int) $product_id;
    }

    public function is_lifetime_product($product_id) {
        $product_id = absint($product_id);
        if (!$product_id) {
            return false;
        }
        $configured = $this->get_product_id();
        if ($configured && $product_id === $configured) {
            return true;
        }
        $product = function_exists('wc_get_product') ? wc_get_product($product_id) : null;
        if (!$product) {
            return false;
        }
        $slug = $product->get_slug();
        return $slug === self::PRODUCT_SLUG;
    }

    public function order_contains_lifetime($order) {
        if (!$order || !is_a($order, 'WC_Order')) {
            return false;
        }
        foreach ($order->get_items() as $item) {
            $pid = $item->get_product_id();
            $vid = $item->get_variation_id();
            if ($this->is_lifetime_product($pid) || $this->is_lifetime_product($vid)) {
                return true;
            }
        }
        return false;
    }

    // ------------------------------------------------------------------
    // Access checks
    // ------------------------------------------------------------------

    public function user_has_lifetime($user_id) {
        $user_id = absint($user_id);
        if (!$user_id) {
            return false;
        }
        $meta = get_user_meta($user_id, self::META_KEY, true);
        return !empty($meta) && is_array($meta);
    }

    public function get_lifetime_meta($user_id) {
        $meta = get_user_meta($user_id, self::META_KEY, true);
        return is_array($meta) ? $meta : null;
    }

    /**
     * Sum of completed/processing order totals for the customer, excluding
     * Lifetime product purchases and full refunds.
     */
    public function get_customer_lifetime_paid($user_id) {
        $user_id = absint($user_id);
        if (!$user_id || !function_exists('wc_get_orders')) {
            return 0.0;
        }

        $orders = wc_get_orders(array(
            'customer_id' => $user_id,
            'status' => array('wc-completed', 'wc-processing'),
            'limit' => -1,
            'return' => 'objects',
            'type' => 'shop_order',
        ));

        $lifetime_product_id = $this->get_product_id();
        $total = 0.0;

        foreach ($orders as $order) {
            if (!$order || !is_a($order, 'WC_Order')) {
                continue;
            }
            // Skip pure lifetime purchases from the "prior paid" pool.
            if ($this->order_contains_lifetime($order)) {
                // Still count any non-lifetime line items on mixed carts (unlikely).
                foreach ($order->get_items() as $item) {
                    $pid = $item->get_product_id();
                    if ($lifetime_product_id && $pid === $lifetime_product_id) {
                        continue;
                    }
                    if ($this->is_lifetime_product($pid) || $this->is_lifetime_product($item->get_variation_id())) {
                        continue;
                    }
                    $total += floatval($item->get_total());
                }
                continue;
            }
            $total += floatval($order->get_total());
        }

        return round(max(0, $total), 2);
    }

    /**
     * Loyalty credit available toward Lifetime purchase.
     * credit = min(paid, price - floor); due = price - credit.
     */
    public function get_loyalty_credit($user_id) {
        $price = $this->get_price();
        $floor = $this->get_credit_floor();
        $paid = $this->get_customer_lifetime_paid($user_id);
        $max_credit = max(0, $price - $floor);
        $credit = min($paid, $max_credit);
        $due = max($floor, $price - $credit);
        // If somehow paid >= price, due is still floor unless they auto-flip.
        return array(
            'paid' => $paid,
            'price' => $price,
            'floor' => $floor,
            'credit' => round($credit, 2),
            'due' => round($due, 2),
            'qualifies_auto' => $paid >= $price,
            'qualifies_grandfather' => $paid >= $this->get_grandfather_min(),
            'product_url' => $this->get_product_url(),
            'product_id' => $this->get_product_id(),
        );
    }

    // ------------------------------------------------------------------
    // Grant / revoke
    // ------------------------------------------------------------------

    /**
     * @param int    $user_id
     * @param string $source  order|auto_threshold|grandfather|manual
     * @param array  $extra   order_id, note, ...
     */
    public function grant_lifetime_access($user_id, $source = 'manual', $extra = array()) {
        $user_id = absint($user_id);
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return new WP_Error('invalid_user', 'User not found');
        }

        if ($this->user_has_lifetime($user_id)) {
            return true; // already lifetime
        }

        $meta = array_merge(array(
            'granted_at' => time(),
            'source' => sanitize_key($source),
            'paid_at_grant' => $this->get_customer_lifetime_paid($user_id),
        ), $extra);

        update_user_meta($user_id, self::META_KEY, $meta);

        // Keep Pro role (admins untouched).
        if (!in_array('administrator', (array) $user->roles, true)) {
            $user->set_role('ultra_card_pro');
        }

        // Discord Pro role.
        global $ultra_card_discord_integration;
        if ($ultra_card_discord_integration) {
            $discord_id = $ultra_card_discord_integration->get_user_discord_id($user_id);
            if ($discord_id) {
                $ultra_card_discord_integration->assign_role($discord_id);
            }
        }

        $this->cancel_active_pro_subscriptions($user_id, 'Upgraded to Ultra Card Pro Lifetime');

        /**
         * Fires after Lifetime is granted.
         */
        do_action('ultra_card_lifetime_granted', $user_id, $meta);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Ultra Card: Granted Lifetime to user {$user_id} via {$source}");
        }

        return true;
    }

    public function revoke_lifetime_access($user_id, $reason = '') {
        $user_id = absint($user_id);
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return false;
        }

        delete_user_meta($user_id, self::META_KEY);

        // Only downgrade if they no longer have an active Pro subscription.
        if (in_array('administrator', (array) $user->roles, true)) {
            return true;
        }

        $still_pro = false;
        if (function_exists('wcs_get_users_subscriptions')) {
            foreach (wcs_get_users_subscriptions($user_id) as $subscription) {
                if ($this->is_pro_subscription($subscription) && $subscription->has_status(array('active', 'pending-cancel'))) {
                    $still_pro = true;
                    break;
                }
            }
        }

        if (!$still_pro && in_array('ultra_card_pro', (array) $user->roles, true)) {
            $user->set_role('ultra_card_free');
            global $ultra_card_discord_integration;
            if ($ultra_card_discord_integration) {
                $discord_id = $ultra_card_discord_integration->get_user_discord_id($user_id);
                if ($discord_id) {
                    $ultra_card_discord_integration->remove_role($discord_id);
                }
            }
        }

        do_action('ultra_card_lifetime_revoked', $user_id, $reason);
        return true;
    }

    private function is_pro_subscription($subscription) {
        if (!$subscription) {
            return false;
        }
        foreach ($subscription->get_items() as $item) {
            $product = $item->get_product();
            if ($product && stripos($product->get_name(), 'Ultra Card Pro') !== false) {
                // Exclude the Lifetime product itself if it ever appears.
                if ($this->is_lifetime_product($product->get_id())) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }

    public function cancel_active_pro_subscriptions($user_id, $note = '') {
        if (!function_exists('wcs_get_users_subscriptions')) {
            return 0;
        }
        $cancelled = 0;
        foreach (wcs_get_users_subscriptions($user_id) as $subscription) {
            if (!$this->is_pro_subscription($subscription)) {
                continue;
            }
            if ($subscription->has_status(array('cancelled', 'expired', 'trash'))) {
                continue;
            }
            $subscription->update_status('cancelled', $note ? $note : 'Cancelled due to Lifetime upgrade');
            $cancelled++;
        }
        return $cancelled;
    }

    // ------------------------------------------------------------------
    // Order / renewal hooks
    // ------------------------------------------------------------------

    public function on_order_paid($order_id) {
        $order = wc_get_order($order_id);
        if (!$order || !$this->order_contains_lifetime($order)) {
            // Also check standing threshold after any Pro payment.
            $user_id = $order ? $order->get_user_id() : 0;
            if ($user_id && !$this->user_has_lifetime($user_id)) {
                $this->maybe_auto_flip($user_id, 'order_paid', $order_id);
            }
            return;
        }

        $user_id = $order->get_user_id();
        if (!$user_id) {
            return;
        }

        // Avoid double-processing.
        if ($order->get_meta('_ultra_card_lifetime_granted')) {
            return;
        }

        $result = $this->grant_lifetime_access($user_id, 'order', array(
            'order_id' => $order->get_id(),
        ));

        if (!is_wp_error($result)) {
            $order->update_meta_data('_ultra_card_lifetime_granted', time());
            $order->add_order_note('Ultra Card Pro Lifetime granted.');
            $order->save();
        }
    }

    public function on_order_refunded($order_id) {
        $order = wc_get_order($order_id);
        if (!$order || !$this->order_contains_lifetime($order)) {
            return;
        }
        $user_id = $order->get_user_id();
        if (!$user_id) {
            return;
        }
        $meta = $this->get_lifetime_meta($user_id);
        if ($meta && isset($meta['order_id']) && (int) $meta['order_id'] === (int) $order_id) {
            $this->revoke_lifetime_access($user_id, 'lifetime_order_refunded');
            $order->add_order_note('Ultra Card Pro Lifetime revoked due to refund.');
        }
    }

    public function on_order_cancelled($order_id) {
        // Only revoke if Lifetime was granted from this unpaid/cancelled order
        // and it never completed — rare edge case.
        $order = wc_get_order($order_id);
        if (!$order || !$this->order_contains_lifetime($order)) {
            return;
        }
        if ($order->get_meta('_ultra_card_lifetime_granted')) {
            $user_id = $order->get_user_id();
            $meta = $this->get_lifetime_meta($user_id);
            if ($meta && isset($meta['order_id']) && (int) $meta['order_id'] === (int) $order_id) {
                $this->revoke_lifetime_access($user_id, 'lifetime_order_cancelled');
            }
        }
    }

    /**
     * Standing rule: after a renewal payment, flip to Lifetime when paid >= price.
     *
     * @param WC_Subscription $subscription
     * @param WC_Order        $last_order
     */
    public function on_renewal_complete($subscription, $last_order = null) {
        if (!$subscription || !$this->is_pro_subscription($subscription)) {
            return;
        }
        $user_id = $subscription->get_user_id();
        if (!$user_id || $this->user_has_lifetime($user_id)) {
            return;
        }
        $order_id = $last_order ? $last_order->get_id() : 0;
        $this->maybe_auto_flip($user_id, 'auto_threshold', $order_id);
    }

    public function maybe_auto_flip($user_id, $source = 'auto_threshold', $order_id = 0) {
        if ($this->user_has_lifetime($user_id)) {
            return false;
        }
        $paid = $this->get_customer_lifetime_paid($user_id);
        if ($paid < $this->get_price()) {
            return false;
        }
        $extra = array('note' => 'Auto-converted: cumulative Pro payments reached Lifetime price.');
        if ($order_id) {
            $extra['order_id'] = $order_id;
        }
        $this->grant_lifetime_access($user_id, $source, $extra);
        return true;
    }

    // ------------------------------------------------------------------
    // Cart loyalty credit
    // ------------------------------------------------------------------

    public function validate_lifetime_cart($passed, $product_id) {
        if (!$this->is_lifetime_product($product_id)) {
            return $passed;
        }
        if (!is_user_logged_in()) {
            wc_add_notice(__('Please log in to purchase Ultra Card Pro Lifetime so we can apply your loyalty credit.', 'ultra-card-integration'), 'error');
            return false;
        }
        $user_id = get_current_user_id();
        if ($this->user_has_lifetime($user_id)) {
            wc_add_notice(__('You already have Ultra Card Pro Lifetime.', 'ultra-card-integration'), 'error');
            return false;
        }
        return $passed;
    }

    public function apply_loyalty_credit($cart) {
        if (is_admin() && !defined('DOING_AJAX')) {
            return;
        }
        if (!$cart || !is_user_logged_in()) {
            return;
        }

        $has_lifetime = false;
        foreach ($cart->get_cart() as $item) {
            $pid = isset($item['product_id']) ? $item['product_id'] : 0;
            if ($this->is_lifetime_product($pid)) {
                $has_lifetime = true;
                break;
            }
        }
        if (!$has_lifetime) {
            return;
        }

        $info = $this->get_loyalty_credit(get_current_user_id());
        if ($info['credit'] <= 0) {
            return;
        }

        $cart->add_fee(
            sprintf(__('Loyalty credit ($%s prior Pro payments)', 'ultra-card-integration'), number_format($info['paid'], 2)),
            -1 * $info['credit'],
            false
        );
    }

    public function maybe_note_loyalty_credit($cart) {
        // Intentionally empty — fee is applied in cart_calculate_fees.
    }

    // ------------------------------------------------------------------
    // API helpers for subscription payloads
    // ------------------------------------------------------------------

    /**
     * Pseudo WooCommerce subscription record for lifetime members.
     */
    public function get_lifetime_subscription_payload($user_id) {
        $meta = $this->get_lifetime_meta($user_id);
        if (!$meta) {
            return null;
        }
        $granted = isset($meta['granted_at']) ? (int) $meta['granted_at'] : time();
        $start = gmdate('Y-m-d H:i:s', $granted);
        return array(
            'status' => 'lifetime',
            'next_payment_date' => null,
            'last_payment_date' => $start,
            'start_date' => $start,
            'trial_end' => null,
            'end_date' => null,
            'billing_period' => 'lifetime',
            'billing_interval' => '1',
            'total' => '0',
            'formatted_total' => 'Lifetime',
            'currency' => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'USD',
            'payment_method_title' => 'Lifetime',
            'view_subscription_url' => home_url('/dashboard/'),
            'subscription_id' => null,
            'manage_subscription_url' => null,
            'subscriptions_url' => function_exists('wc_get_account_endpoint_url')
                ? wc_get_account_endpoint_url('orders')
                : home_url('/my-account/orders/'),
            'payment_methods_url' => function_exists('wc_get_account_endpoint_url')
                ? wc_get_account_endpoint_url('payment-methods')
                : home_url('/my-account/payment-methods/'),
            'billing_address_url' => function_exists('wc_get_endpoint_url')
                ? wc_get_endpoint_url('edit-address', 'billing', wc_get_page_permalink('myaccount'))
                : home_url('/my-account/edit-address/billing/'),
            'orders_url' => function_exists('wc_get_account_endpoint_url')
                ? wc_get_account_endpoint_url('orders')
                : home_url('/my-account/orders/'),
            'lifetime' => true,
            'lifetime_source' => isset($meta['source']) ? $meta['source'] : '',
            'lifetime_order_id' => isset($meta['order_id']) ? (int) $meta['order_id'] : null,
        );
    }

    /**
     * Enrich get_user_subscription_data result.
     */
    public function enrich_subscription_data($user_id, $data) {
        if (!is_array($data)) {
            $data = array();
        }
        $has = $this->user_has_lifetime($user_id);
        $data['lifetime'] = $has;
        $data['plan'] = $has ? 'lifetime' : (isset($data['tier']) && $data['tier'] === 'pro' ? 'pro' : 'free');
        $data['loyalty'] = $this->get_loyalty_credit($user_id);

        if ($has) {
            $data['tier'] = 'pro';
            $data['status'] = 'active';
            $data['expires'] = null;
            $lifetime_woo = $this->get_lifetime_subscription_payload($user_id);
            // Prefer lifetime payload over a cancelled subscription remnant.
            if ($lifetime_woo) {
                $data['woocommerce'] = $lifetime_woo;
            }
        }

        return $data;
    }

    // ------------------------------------------------------------------
    // Grandfather candidates
    // ------------------------------------------------------------------

    /**
     * @return array<int, array{user_id:int,email:string,display_name:string,paid:float,has_lifetime:bool}>
     */
    public function find_grandfather_candidates($threshold = null) {
        if ($threshold === null) {
            $threshold = $this->get_grandfather_min();
        }
        $threshold = floatval($threshold);
        $candidates = array();

        if (!function_exists('wc_get_orders')) {
            return $candidates;
        }

        // Walk paying customers via roles first (Pro + Free who may have paid).
        $users = get_users(array(
            'role__in' => array('ultra_card_pro', 'ultra_card_free', 'customer', 'subscriber'),
            'fields' => array('ID', 'user_email', 'display_name'),
            'number' => -1,
        ));

        foreach ($users as $user) {
            $paid = $this->get_customer_lifetime_paid($user->ID);
            if ($paid < $threshold) {
                continue;
            }
            $candidates[] = array(
                'user_id' => (int) $user->ID,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'paid' => $paid,
                'has_lifetime' => $this->user_has_lifetime($user->ID),
            );
        }

        usort($candidates, function ($a, $b) {
            return $b['paid'] <=> $a['paid'];
        });

        return $candidates;
    }

    public function apply_grandfathering($dry_run = true) {
        $threshold = $this->get_grandfather_min();
        $candidates = $this->find_grandfather_candidates($threshold);
        $applied = array();
        $skipped = array();

        foreach ($candidates as $c) {
            if ($c['has_lifetime']) {
                $skipped[] = $c;
                continue;
            }
            if ($dry_run) {
                $applied[] = $c;
                continue;
            }
            $this->grant_lifetime_access($c['user_id'], 'grandfather', array(
                'note' => sprintf('Launch grandfather: paid $%s >= $%s', number_format($c['paid'], 2), number_format($threshold, 2)),
            ));
            $c['has_lifetime'] = true;
            $applied[] = $c;
        }

        return array(
            'dry_run' => $dry_run,
            'threshold' => $threshold,
            'applied' => $applied,
            'skipped' => $skipped,
        );
    }

    // ------------------------------------------------------------------
    // Admin UI
    // ------------------------------------------------------------------

    public function register_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        add_submenu_page(
            'ultra-card-admin',
            'Lifetime',
            'Lifetime',
            'manage_options',
            'ultra-card-lifetime',
            array($this, 'render_admin_page')
        );
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }

        $notice = '';

        if (isset($_POST['ultra_card_lifetime_ensure_product']) && check_admin_referer('ultra_card_lifetime_admin')) {
            $id = $this->ensure_lifetime_product();
            $notice = $id
                ? '<div class="notice notice-success"><p>Lifetime product ready (ID ' . intval($id) . '). <a href="' . esc_url(get_edit_post_link($id)) . '">Edit product</a></p></div>'
                : '<div class="notice notice-error"><p>Could not create Lifetime product. Is WooCommerce active?</p></div>';
        }

        if (isset($_POST['ultra_card_lifetime_save']) && check_admin_referer('ultra_card_lifetime_admin')) {
            update_option(self::OPTION_PRODUCT_ID, absint($_POST['product_id'] ?? 0), false);
            update_option(self::OPTION_PRICE, $this->sanitize_money($_POST['price'] ?? 99), false);
            update_option(self::OPTION_GRANDFATHER_MIN, $this->sanitize_money($_POST['grandfather_min'] ?? 60), false);
            update_option(self::OPTION_CREDIT_FLOOR, $this->sanitize_money($_POST['credit_floor'] ?? 29), false);
            // Sync product price.
            $this->ensure_lifetime_product();
            $notice = '<div class="notice notice-success"><p>Lifetime settings saved.</p></div>';
        }

        $dry_result = null;
        $apply_result = null;
        if (isset($_POST['ultra_card_lifetime_dry_run']) && check_admin_referer('ultra_card_lifetime_admin')) {
            $dry_result = $this->apply_grandfathering(true);
        }
        if (isset($_POST['ultra_card_lifetime_apply']) && check_admin_referer('ultra_card_lifetime_admin')) {
            $apply_result = $this->apply_grandfathering(false);
            $notice = '<div class="notice notice-success"><p>Grandfather applied to '
                . count($apply_result['applied']) . ' user(s).</p></div>';
        }

        if (isset($_POST['ultra_card_lifetime_manual_grant']) && check_admin_referer('ultra_card_lifetime_admin')) {
            $uid = absint($_POST['manual_user_id'] ?? 0);
            if ($uid) {
                $this->grant_lifetime_access($uid, 'manual', array('note' => 'Admin manual grant'));
                $notice = '<div class="notice notice-success"><p>Lifetime granted to user #' . $uid . '.</p></div>';
            }
        }

        $product_id = $this->get_product_id();
        $candidates = $this->find_grandfather_candidates();

        echo '<div class="wrap">';
        echo '<h1>Ultra Card Pro Lifetime</h1>';
        echo $notice;

        echo '<form method="post">';
        wp_nonce_field('ultra_card_lifetime_admin');

        echo '<h2>Settings</h2>';
        echo '<table class="form-table"><tbody>';
        echo '<tr><th>Product ID</th><td><input type="number" name="product_id" value="' . esc_attr($product_id) . '" class="small-text" /> ';
        if ($product_id) {
            echo '<a href="' . esc_url(get_edit_post_link($product_id)) . '">Edit</a> · <a href="' . esc_url($this->get_product_url()) . '" target="_blank" rel="noopener">View</a>';
        }
        echo '<p class="description">Auto-created as “' . esc_html(self::PRODUCT_NAME) . '” if empty.</p></td></tr>';
        echo '<tr><th>Lifetime price / auto-flip threshold</th><td><input type="number" step="0.01" name="price" value="' . esc_attr($this->get_price()) . '" class="small-text" /> USD</td></tr>';
        echo '<tr><th>Grandfather threshold</th><td><input type="number" step="0.01" name="grandfather_min" value="' . esc_attr($this->get_grandfather_min()) . '" class="small-text" /> USD <span class="description">(one-time free flip at launch)</span></td></tr>';
        echo '<tr><th>Loyalty credit floor</th><td><input type="number" step="0.01" name="credit_floor" value="' . esc_attr($this->get_credit_floor()) . '" class="small-text" /> USD <span class="description">(minimum remaining after credit)</span></td></tr>';
        echo '</tbody></table>';

        echo '<p>';
        echo '<button type="submit" name="ultra_card_lifetime_save" class="button button-primary">Save settings</button> ';
        echo '<button type="submit" name="ultra_card_lifetime_ensure_product" class="button">Create / repair Lifetime product</button>';
        echo '</p>';

        echo '<hr><h2>Launch grandfathering</h2>';
        echo '<p>Users with cumulative Pro payments ≥ <strong>$' . esc_html(number_format($this->get_grandfather_min(), 2)) . '</strong> who do not already have Lifetime.</p>';

        if (empty($candidates)) {
            echo '<p><em>No candidates right now.</em></p>';
        } else {
            echo '<table class="widefat striped"><thead><tr><th>User</th><th>Email</th><th>Paid</th><th>Lifetime?</th></tr></thead><tbody>';
            foreach ($candidates as $c) {
                echo '<tr>';
                echo '<td>#' . intval($c['user_id']) . ' ' . esc_html($c['display_name']) . '</td>';
                echo '<td>' . esc_html($c['email']) . '</td>';
                echo '<td>$' . esc_html(number_format($c['paid'], 2)) . '</td>';
                echo '<td>' . ($c['has_lifetime'] ? 'Yes' : 'No') . '</td>';
                echo '</tr>';
            }
            echo '</tbody></table>';
        }

        echo '<p style="margin-top:12px">';
        echo '<button type="submit" name="ultra_card_lifetime_dry_run" class="button">Dry-run</button> ';
        echo '<button type="submit" name="ultra_card_lifetime_apply" class="button button-primary" onclick="return confirm(\'Grant Lifetime to all eligible users?\');">Apply grandfathering</button>';
        echo '</p>';

        if ($dry_result) {
            echo '<div class="notice notice-info"><p>Dry-run would grant Lifetime to <strong>'
                . count($dry_result['applied']) . '</strong> user(s); '
                . count($dry_result['skipped']) . ' already Lifetime.</p></div>';
        }
        if ($apply_result) {
            echo '<div class="notice notice-success"><p>Applied to <strong>'
                . count($apply_result['applied']) . '</strong> user(s).</p></div>';
        }

        echo '<hr><h2>Manual grant</h2>';
        echo '<p>User ID: <input type="number" name="manual_user_id" class="small-text" /> ';
        echo '<button type="submit" name="ultra_card_lifetime_manual_grant" class="button">Grant Lifetime</button></p>';

        echo '</form></div>';
    }
}

/**
 * Bootstrap singleton.
 */
function ultra_card_lifetime() {
    return UltraCardLifetime::instance();
}

add_action('plugins_loaded', function () {
    ultra_card_lifetime();
}, 20);

/**
 * Guard used by UltraCardCloudSync::revoke_pro_access.
 */
function ultra_card_user_has_lifetime($user_id) {
    return ultra_card_lifetime()->user_has_lifetime($user_id);
}

endif;
