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

        // Inject Lifetime into the Pro variable product Billing Cycle dropdown.
        add_action('wp_enqueue_scripts', array($this, 'enqueue_pro_billing_cycle_script'), 30);

        // One product page for all three plans: /product/ultra-card-pro-lifetime/
        // deep-links to the Pro page with Lifetime preselected.
        add_action('template_redirect', array($this, 'redirect_lifetime_product_page'));

        // Lifetime is a simple product, so WooCommerce would allow guest checkout.
        // A guest order has no user to grant, so force an account (same as WC
        // Subscriptions does for Monthly / Yearly) whenever Lifetime is in the cart.
        add_filter('pre_option_woocommerce_enable_guest_checkout', array($this, 'force_registration_option_no'));
        add_filter('pre_option_woocommerce_enable_signup_and_login_from_checkout', array($this, 'force_registration_option_yes'));
        add_filter('pre_option_woocommerce_enable_checkout_login_reminder', array($this, 'force_registration_option_yes'));
        add_action('woocommerce_check_cart_items', array($this, 'check_cart_for_existing_lifetime'));
        add_action('woocommerce_checkout_before_order_review', array($this, 'render_checkout_lifetime_note'), 5);
        add_action('woocommerce_after_checkout_validation', array($this, 'validate_checkout_lifetime'), 10, 2);

        // Post-purchase: confirmation box + email note.
        add_action('woocommerce_thankyou', array($this, 'render_thankyou_lifetime'), 4);
        add_action('woocommerce_email_before_order_table', array($this, 'email_lifetime_note'), 10, 4);

        // Storefront polish: readable checkout summary, Pricing in the header
        // menu, header "Get Ultra Card PRO" button to /pricing/.
        add_action('wp_enqueue_scripts', array($this, 'enqueue_storefront_polish'), 40);
        add_filter('wp_nav_menu_objects', array($this, 'inject_pricing_menu_item'), 10, 2);
    }

    // ------------------------------------------------------------------
    // Storefront journey
    // ------------------------------------------------------------------

    /**
     * URL of the Pro variable product page (Monthly / Yearly / Lifetime dropdown).
     */
    public function get_pro_page_url($plan = '') {
        $url = home_url('/product/ultra-card-pro/');
        $page = get_page_by_path('ultra-card-pro', OBJECT, 'product');
        if ($page) {
            $permalink = get_permalink($page->ID);
            if ($permalink) {
                $url = $permalink;
            }
        }
        if ($plan) {
            $url = add_query_arg('attribute_billing-cycle', $plan, $url);
        }
        return $url;
    }

    /**
     * One-click "buy Lifetime" URL: adds the product and lands on checkout,
     * where loyalty credit is applied and an account is created if needed.
     */
    public function get_checkout_url() {
        $id = $this->get_product_id();
        if (!$id) {
            return $this->get_pro_page_url('Lifetime');
        }
        $checkout = function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/checkout/');
        return add_query_arg('add-to-cart', $id, $checkout);
    }

    public function get_pricing_url() {
        $page = get_page_by_path('pricing', OBJECT, 'page');
        if ($page) {
            $permalink = get_permalink($page->ID);
            if ($permalink) {
                return $permalink;
            }
        }
        return home_url('/pricing/');
    }

    public function redirect_lifetime_product_page() {
        if (is_admin() || !function_exists('is_product') || !is_product()) {
            return;
        }
        $id = get_queried_object_id();
        if (!$id || !$this->is_lifetime_product($id)) {
            return;
        }
        if (!apply_filters('ultra_card_lifetime_redirect_product_page', true)) {
            return;
        }
        wp_safe_redirect($this->get_pro_page_url('Lifetime'), 302);
        exit;
    }

    public function cart_has_lifetime() {
        if (!did_action('wp_loaded') || !function_exists('WC') || !WC() || empty(WC()->cart)) {
            return false;
        }
        $cart = WC()->cart;
        if (!method_exists($cart, 'get_cart')) {
            return false;
        }
        foreach ($cart->get_cart() as $item) {
            $pid = isset($item['product_id']) ? $item['product_id'] : 0;
            if ($this->is_lifetime_product($pid)) {
                return true;
            }
        }
        return false;
    }

    public function force_registration_option_no($pre) {
        if (is_admin() && !defined('DOING_AJAX')) {
            return $pre;
        }
        return $this->cart_has_lifetime() ? 'no' : $pre;
    }

    public function force_registration_option_yes($pre) {
        if (is_admin() && !defined('DOING_AJAX')) {
            return $pre;
        }
        return $this->cart_has_lifetime() ? 'yes' : $pre;
    }

    /**
     * Runs on cart + checkout render: a guest who added Lifetime and then
     * logged into an account that already has it must not pay again.
     */
    public function check_cart_for_existing_lifetime() {
        if (!is_user_logged_in() || !$this->cart_has_lifetime()) {
            return;
        }
        if ($this->user_has_lifetime(get_current_user_id())) {
            wc_add_notice(__('You already have Ultra Card Pro Lifetime, so it was removed from your cart.', 'ultra-card-integration'), 'notice');
            foreach (WC()->cart->get_cart() as $key => $item) {
                if ($this->is_lifetime_product(isset($item['product_id']) ? $item['product_id'] : 0)) {
                    WC()->cart->remove_cart_item($key);
                }
            }
        }
    }

    public function validate_checkout_lifetime($data, $errors) {
        if (!$this->cart_has_lifetime()) {
            return;
        }
        if (is_user_logged_in() && $this->user_has_lifetime(get_current_user_id())) {
            $errors->add('ultra_card_lifetime', __('You already have Ultra Card Pro Lifetime.', 'ultra-card-integration'));
        }
    }

    /**
     * Order-received page: confirm Lifetime and explain what happened to
     * any monthly / yearly subscription.
     */
    public function render_thankyou_lifetime($order_id) {
        $order = wc_get_order($order_id);
        if (!$order || !$this->order_contains_lifetime($order)) {
            return;
        }
        $granted = (bool) $order->get_meta('_ultra_card_lifetime_granted');
        $dashboard = home_url('/dashboard/');
        $paid_statuses = array('processing', 'completed');
        $is_paid = $order->has_status($paid_statuses);

        echo '<div class="uc-lifetime-thankyou" style="margin:0 0 28px;padding:24px 26px;border-radius:16px;background:linear-gradient(135deg,#1c1f3a,#2b1f4d);color:#eef0f6;border:1px solid rgba(165,180,252,.35)">';
        echo '<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a5b4fc;font-weight:700;margin-bottom:6px">Ultra Card Pro</div>';
        if ($granted || $is_paid) {
            echo '<h2 style="margin:0 0 10px;font-size:26px;color:#fff">You&rsquo;re Lifetime.</h2>';
            echo '<p style="margin:0 0 8px;color:#d6dbea;line-height:1.55">Ultra Card Pro is yours for the life of Ultra Card. Every Pro module, cloud backups, snapshots and priority support &mdash; with no renewals to manage.</p>';
            echo '<p style="margin:0 0 16px;color:#d6dbea;line-height:1.55">If you had a monthly or yearly Pro subscription it has been cancelled automatically, so you will not be billed again. Your Home Assistant card picks up Lifetime the next time it syncs (or click <em>Refresh</em> in the Account tab).</p>';
        } else {
            echo '<h2 style="margin:0 0 10px;font-size:26px;color:#fff">Almost there.</h2>';
            echo '<p style="margin:0 0 16px;color:#d6dbea;line-height:1.55">Lifetime activates automatically the moment your payment is confirmed. Any monthly or yearly subscription is cancelled at the same time.</p>';
        }
        echo '<a href="' . esc_url($dashboard) . '" style="display:inline-block;padding:11px 18px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;text-decoration:none">Open your dashboard</a>';
        echo '</div>';
    }

    public function email_lifetime_note($order, $sent_to_admin, $plain_text, $email = null) {
        if ($sent_to_admin || !$order || !is_a($order, 'WC_Order') || !$this->order_contains_lifetime($order)) {
            return;
        }
        $text = 'Welcome to Ultra Card Pro Lifetime. Pro is yours for the life of Ultra Card with no renewals. '
            . 'If you had a monthly or yearly Pro subscription it has been cancelled so you will not be billed again. '
            . 'Manage your account at ' . home_url('/dashboard/');
        if ($plain_text) {
            echo "\n" . $text . "\n\n";
            return;
        }
        echo '<p style="margin:0 0 20px;padding:14px 16px;border-radius:10px;background:#f1f0ff;border:1px solid #d9d6fb;color:#2b2b45;line-height:1.5">' . esc_html($text) . '</p>';
    }

    /**
     * Small CSS/JS layer for the storefront. Everything here is opt-out via
     * `add_filter('ultra_card_storefront_polish', '__return_false')`.
     */
    public function enqueue_storefront_polish() {
        if (is_admin() || !apply_filters('ultra_card_storefront_polish', true)) {
            return;
        }

        $css = '';

        // Impreza paints the checkout order summary on the dark alt background
        // but leaves the text dark, so totals were unreadable.
        if (function_exists('is_checkout') && is_checkout()) {
            $css .= '
body.woocommerce-checkout .woocommerce-checkout-review-order,
body.woocommerce-checkout #order_review{background:#f5f6fa!important;color:#15161a!important;border:1px solid #e1e4ee;border-radius:14px;padding:22px 24px}
body.woocommerce-checkout #order_review table,body.woocommerce-checkout #order_review th,body.woocommerce-checkout #order_review td,
body.woocommerce-checkout #order_review .woocommerce-Price-amount,body.woocommerce-checkout #order_review .product-name,
body.woocommerce-checkout #order_review .recurring-totals th,body.woocommerce-checkout #order_review .first-payment-date,
body.woocommerce-checkout #payment,body.woocommerce-checkout #payment label,body.woocommerce-checkout #payment p,
body.woocommerce-checkout .woocommerce-privacy-policy-text,body.woocommerce-checkout .woocommerce-terms-and-conditions-wrapper{color:#15161a!important}
body.woocommerce-checkout #order_review th,body.woocommerce-checkout #order_review td{border-color:rgba(0,0,0,.08)}
body.woocommerce-checkout #order_review tr.fee th,body.woocommerce-checkout #order_review tr.fee td{color:#0f7a4f!important;font-weight:600}
body.woocommerce-checkout #order_review .uc-lifetime-checkout-note{margin:0 0 14px;padding:10px 12px;border-radius:10px;background:#eef0ff;border:1px solid #d9dcfb;font-size:.9em;line-height:1.45}
';
        }

        if ($css) {
            wp_register_style('uc-storefront-polish', false, array(), ULTRA_CARD_INTEGRATION_VERSION);
            wp_enqueue_style('uc-storefront-polish');
            wp_add_inline_style('uc-storefront-polish', $css);
        }

        // Header "Get Ultra Card PRO" button lives in the Impreza header builder;
        // point it at the pricing page (three plans) instead of the product page.
        if (apply_filters('ultra_card_header_pro_button_to_pricing', true)) {
            $pricing = esc_url($this->get_pricing_url());
            $js = '(function(){try{var p=' . wp_json_encode($pricing) . ';document.querySelectorAll(".l-header a.w-btn[href]").forEach(function(a){try{var u=new URL(a.href,location.href);if(/^\/product\/ultra-card-pro\/?$/.test(u.pathname)&&!u.search){a.href=p;}}catch(e){}});}catch(e){}})();';
            wp_register_script('uc-header-pro-button', false, array(), ULTRA_CARD_INTEGRATION_VERSION, true);
            wp_enqueue_script('uc-header-pro-button');
            wp_add_inline_script('uc-header-pro-button', $js);
        }
    }

    /**
     * Add "Pricing" to the header menu (before FAQs) unless the menu already
     * links to the pricing page. Opt out with
     * `add_filter('ultra_card_inject_pricing_menu_item', '__return_false')`.
     */
    public function inject_pricing_menu_item($items, $args) {
        if (is_admin() || !is_array($items) || empty($items)) {
            return $items;
        }
        if (!apply_filters('ultra_card_inject_pricing_menu_item', true)) {
            return $items;
        }

        // Only the primary header menu.
        $menu = isset($args->menu) ? $args->menu : null;
        $slug = '';
        if ($menu instanceof WP_Term) {
            $slug = $menu->slug;
        } elseif (is_numeric($menu)) {
            $term = get_term((int) $menu, 'nav_menu');
            $slug = ($term && !is_wp_error($term)) ? $term->slug : '';
        } elseif (is_string($menu) && $menu !== '') {
            $term = get_term_by('slug', $menu, 'nav_menu');
            if (!$term) {
                $term = get_term_by('name', $menu, 'nav_menu');
            }
            $slug = ($term && !is_wp_error($term)) ? $term->slug : '';
        }
        $target_slugs = (array) apply_filters('ultra_card_pricing_menu_slugs', array('header-menu', 'main-menu', 'primary'));
        if (!$slug || !in_array($slug, $target_slugs, true)) {
            return $items;
        }

        $pricing_page = get_page_by_path('pricing', OBJECT, 'page');
        if (!$pricing_page || $pricing_page->post_status !== 'publish') {
            return $items;
        }
        $pricing_url = get_permalink($pricing_page->ID);

        $template = null;
        $insert_at = count($items);
        foreach ($items as $i => $item) {
            if (!empty($item->url) && (untrailingslashit($item->url) === untrailingslashit($pricing_url) || (int) $item->object_id === (int) $pricing_page->ID)) {
                return $items; // already present
            }
            if ((int) $item->menu_item_parent === 0) {
                if ($template === null) {
                    $template = $item;
                }
                if (stripos((string) $item->title, 'faq') !== false) {
                    $insert_at = $i;
                }
            }
        }
        if ($template === null) {
            return $items;
        }

        $new = clone $template;
        $new->ID = 90000000 + (int) $pricing_page->ID;
        $new->db_id = $new->ID;
        $new->menu_item_parent = 0;
        $new->object_id = (int) $pricing_page->ID;
        $new->object = 'page';
        $new->type = 'post_type';
        $new->type_label = 'Page';
        $new->title = __('Pricing', 'ultra-card-integration');
        $new->url = $pricing_url;
        $new->target = '';
        $new->attr_title = '';
        $new->description = '';
        $new->xfn = '';
        $new->post_title = $new->title;
        $new->post_name = 'pricing';
        $new->menu_order = isset($template->menu_order) ? (int) $template->menu_order : 0;
        $is_current = is_page($pricing_page->ID);
        $new->current = $is_current;
        $new->current_item_ancestor = false;
        $new->current_item_parent = false;
        $classes = array('menu-item', 'menu-item-type-post_type', 'menu-item-object-page', 'menu-item-' . $new->ID);
        if ($is_current) {
            $classes[] = 'current-menu-item';
            $classes[] = 'current_page_item';
        }
        $new->classes = $classes;
        // Clear any mega-menu / column flags copied from the template item.
        foreach (array('us_mega_menu', 'us_columns', 'us_mega_menu_layout', 'us_mega_menu_width', 'us_mega_menu_columns') as $prop) {
            if (isset($new->$prop)) {
                unset($new->$prop);
            }
        }

        array_splice($items, $insert_at, 0, array($new));
        // Re-index menu_order so walkers relying on it keep the new position.
        $order = 1;
        foreach ($items as $item) {
            if ((int) $item->menu_item_parent === 0) {
                $item->menu_order = $order++;
            }
        }
        return $items;
    }

    /**
     * On /product/ultra-card-pro/, add a Lifetime option to Billing Cycle so
     * shoppers pick Monthly / Yearly / Lifetime from one page.
     *
     * Lifetime is a separate simple product, not a variation. WooCommerce's
     * variation script rebuilds every attribute <select> from the variations
     * JSON and drops options that no variation owns, so a plain appended
     * option disappears the moment it is chosen. Instead we register Lifetime
     * as a pseudo-variation in `data-product_variations` *before* WooCommerce
     * initialises (this inline script runs synchronously at the end of the
     * body, WC initialises on DOM-ready). WC then handles the option, price,
     * description and button state natively; we only intercept Add to Cart to
     * send the shopper to checkout with the real Lifetime product.
     */
    public function enqueue_pro_billing_cycle_script() {
        if (!function_exists('is_product') || !is_product()) {
            return;
        }
        $product = function_exists('wc_get_product') ? wc_get_product(get_the_ID()) : null;
        if (!$product || $product->get_slug() !== 'ultra-card-pro') {
            return;
        }

        $lifetime_id = $this->get_product_id();
        if (!$lifetime_id) {
            $lifetime_id = $this->ensure_lifetime_product();
        }
        if (!$lifetime_id) {
            return;
        }

        $user_id = is_user_logged_in() ? get_current_user_id() : 0;
        $loyalty = $user_id ? $this->get_loyalty_credit($user_id) : null;
        $list_price = $this->get_price();
        $due = $loyalty ? floatval($loyalty['due']) : $list_price;
        $credit = $loyalty ? floatval($loyalty['credit']) : 0;
        $already = $user_id ? $this->user_has_lifetime($user_id) : false;

        $once = '<span class="subscription-details"> ' . esc_html__('once', 'ultra-card-integration') . '</span>';
        if ($credit > 0 && $due < $list_price) {
            $price_html = '<span class="price"><del aria-hidden="true">' . wc_price($list_price) . '</del> <ins>' . wc_price($due) . '</ins>' . $once . '</span>';
        } else {
            $price_html = '<span class="price">' . wc_price($list_price) . $once . '</span>';
        }

        $blurb = esc_html__('Every Pro module, cloud backups, snapshots and priority support. Pay once — no renewals, ever.', 'ultra-card-integration');
        if ($already) {
            $note = esc_html__('You already have Ultra Card Pro Lifetime.', 'ultra-card-integration');
        } elseif ($credit > 0) {
            $note = sprintf(
                /* translators: 1: credit amount, 2: amount paid so far */
                esc_html__('Loyalty credit applied: %1$s off for the %2$s you have already paid toward Pro. Your current plan is cancelled automatically when this order completes.', 'ultra-card-integration'),
                wc_price($credit),
                wc_price($loyalty['paid'])
            );
        } elseif ($user_id) {
            $note = esc_html__('One payment, then nothing to renew. Every Pro payment you have made counts toward this price.', 'ultra-card-integration');
        } else {
            $note = esc_html__('Already a Pro subscriber? Log in at checkout and every payment you have made is credited automatically (minimum $29 due).', 'ultra-card-integration');
        }
        $description_html = '<p>' . $blurb . '</p><p class="uc-lifetime-note" style="margin:.5em 0 0;font-size:.92em;opacity:.85">' . $note . '</p>';

        $cfg = array(
            'attribute' => 'attribute_billing-cycle',
            'optionValue' => 'Lifetime',
            'optionLabel' => __('Lifetime', 'ultra-card-integration'),
            'productId' => (int) $lifetime_id,
            'listPrice' => $list_price,
            'due' => $due,
            'alreadyLifetime' => $already,
            'addToCartUrl' => esc_url_raw($this->get_checkout_url()),
            'priceHtml' => $price_html,
            'descriptionHtml' => $description_html,
            'buttonLabel' => __('Go Lifetime', 'ultra-card-integration'),
        );

        // Run after WC's variation script is loaded but before its DOM-ready init.
        $deps = array();
        if (wp_script_is('wc-add-to-cart-variation', 'registered')) {
            wp_enqueue_script('wc-add-to-cart-variation');
            $deps[] = 'wc-add-to-cart-variation';
        }

        $js = <<<'JS'
(function () {
  var cfg = window.ucProLifetimeOption;
  if (!cfg) return;

  function setup(form) {
    var select = form.querySelector('select[name="' + cfg.attribute + '"]');
    if (!select) return;

    // 1. The option itself.
    if (!select.querySelector('option[value="' + cfg.optionValue + '"]')) {
      var opt = document.createElement('option');
      opt.value = cfg.optionValue;
      opt.textContent = cfg.optionLabel;
      opt.className = 'attached enabled';
      select.appendChild(opt);
    }

    // 2. Register Lifetime as a pseudo-variation so WC keeps the option and
    //    shows its price / description / enabled button.
    var raw = form.getAttribute('data-product_variations');
    var list = null;
    try { list = JSON.parse(raw); } catch (e) { list = null; }
    if (Array.isArray(list)) {
      var exists = list.some(function (v) {
        return v && v.attributes && v.attributes[cfg.attribute] === cfg.optionValue;
      });
      if (!exists) {
        var tmpl = list[0] || {};
        var attrs = {};
        attrs[cfg.attribute] = cfg.optionValue;
        var pseudo = {};
        for (var k in tmpl) if (Object.prototype.hasOwnProperty.call(tmpl, k)) pseudo[k] = tmpl[k];
        pseudo.attributes = attrs;
        pseudo.variation_id = cfg.productId;
        pseudo.variation_is_active = !cfg.alreadyLifetime;
        pseudo.variation_is_visible = true;
        pseudo.is_purchasable = !cfg.alreadyLifetime;
        pseudo.is_in_stock = true;
        pseudo.backorders_allowed = false;
        pseudo.is_downloadable = false;
        pseudo.is_virtual = true;
        pseudo.is_sold_individually = 'yes';
        pseudo.min_qty = 1;
        pseudo.max_qty = 1;
        pseudo.sku = '';
        // Keep the template's weight/dimensions HTML: WC does
        // parseHTML(dimensions_html)[0].data and crashes on an empty string.
        pseudo.availability_html = '';
        pseudo.display_price = cfg.due;
        pseudo.display_regular_price = cfg.listPrice;
        pseudo.price_html = cfg.priceHtml;
        pseudo.variation_description = cfg.descriptionHtml;
        list.push(pseudo);
        form.setAttribute('data-product_variations', JSON.stringify(list));
        if (window.jQuery) window.jQuery(form).data('product_variations', list);
      }
    }

    // 3. Deep link: ?attribute_billing-cycle=Lifetime (server can't preselect
    //    an option it doesn't know about).
    try {
      var pre = new URLSearchParams(window.location.search).get(cfg.attribute);
      if (pre && pre.toLowerCase() === cfg.optionValue.toLowerCase()) {
        select.value = cfg.optionValue;
      }
    } catch (e) {}

    // 4. Intercept Add to Cart for Lifetime. Native capture-phase listeners on
    //    the button run before WC's delegated jQuery handlers on the form.
    var isLifetime = function () { return select.value === cfg.optionValue; };
    var go = function (e) {
      if (!isLifetime()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (cfg.alreadyLifetime) return;
      window.location.href = cfg.addToCartUrl;
    };
    var btn = form.querySelector('.single_add_to_cart_button');
    if (btn) btn.addEventListener('click', go, true);
    form.addEventListener('submit', go, true);

    // 5. Button label while Lifetime is the found variation.
    if (window.jQuery && btn) {
      var $form = window.jQuery(form);
      var orig = btn.textContent;
      $form.on('found_variation', function (ev, variation) {
        btn.textContent = (variation && Number(variation.variation_id) === Number(cfg.productId)) ? cfg.buttonLabel : orig;
      });
      $form.on('reset_data', function () { btn.textContent = orig; });
    }
  }

  var forms = document.querySelectorAll('form.variations_form');
  for (var i = 0; i < forms.length; i++) setup(forms[i]);
})();
JS;

        wp_register_script('uc-pro-lifetime-option', false, $deps, ULTRA_CARD_INTEGRATION_VERSION, true);
        wp_enqueue_script('uc-pro-lifetime-option');
        wp_add_inline_script('uc-pro-lifetime-option', 'window.ucProLifetimeOption = ' . wp_json_encode($cfg) . ';', 'before');
        wp_add_inline_script('uc-pro-lifetime-option', $js, 'after');
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
        // Avoid running on every front-end hit once the product exists, but
        // re-sync (price, visibility, image) once per plugin version.
        $existing = $this->get_product_id();
        $synced_for = get_option('ultra_card_lifetime_synced_version', '');
        if ($existing) {
            $product = wc_get_product($existing);
            if ($product && $product->get_status() === 'publish') {
                if ($synced_for !== ULTRA_CARD_INTEGRATION_VERSION) {
                    $this->ensure_lifetime_product();
                    update_option('ultra_card_lifetime_synced_version', ULTRA_CARD_INTEGRATION_VERSION, false);
                }
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
            $product->set_catalog_visibility('hidden');
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
            $image_id = $this->get_pro_product_image_id();
            if ($image_id) {
                $product->set_image_id($image_id);
            }
            $product_id = $product->save();
        } else {
            // Keep price in sync with the setting, and keep the product out of
            // shop / search listings: the Pro page dropdown is the storefront.
            $price = (string) $this->get_price();
            $dirty = false;
            if ($product->get_regular_price() !== $price) {
                $product->set_regular_price($price);
                $product->set_price($price);
                $dirty = true;
            }
            if ($product->get_catalog_visibility() !== 'hidden') {
                $product->set_catalog_visibility('hidden');
                $dirty = true;
            }
            if (!$product->get_image_id()) {
                $image_id = $this->get_pro_product_image_id();
                if ($image_id) {
                    $product->set_image_id($image_id);
                    $dirty = true;
                }
            }
            if ($dirty) {
                $product->save();
            }
            $product_id = $product->get_id();
        }

        if ($product_id) {
            update_option(self::OPTION_PRODUCT_ID, (int) $product_id, false);
            update_option('ultra_card_lifetime_synced_version', ULTRA_CARD_INTEGRATION_VERSION, false);
        }

        return (int) $product_id;
    }

    /**
     * Featured image of the Pro subscription product, reused for Lifetime so
     * cart / checkout / listings never show a placeholder.
     */
    private function get_pro_product_image_id() {
        $page = get_page_by_path('ultra-card-pro', OBJECT, 'product');
        if (!$page || !function_exists('wc_get_product')) {
            return 0;
        }
        $pro = wc_get_product($page->ID);
        return $pro ? (int) $pro->get_image_id() : 0;
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
            'checkout_url' => $this->get_checkout_url(),
            'pro_page_url' => $this->get_pro_page_url('Lifetime'),
            'pricing_url' => $this->get_pricing_url(),
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
        $adding_lifetime = $this->is_lifetime_product($product_id);
        $adding_pro_sub = false;
        if (!$adding_lifetime && function_exists('wc_get_product')) {
            $product = wc_get_product($product_id);
            $adding_pro_sub = $product && stripos($product->get_name(), 'Ultra Card Pro') !== false;
        }
        if (!$adding_lifetime && !$adding_pro_sub) {
            return $passed;
        }

        // Guests may buy Lifetime: an account is created at checkout and any
        // credit is applied once they log in there.
        if ($adding_lifetime && is_user_logged_in() && $this->user_has_lifetime(get_current_user_id())) {
            wc_add_notice(__('You already have Ultra Card Pro Lifetime.', 'ultra-card-integration'), 'error');
            return false;
        }

        // Lifetime and a Monthly / Yearly subscription never belong in the same
        // order: keep whichever the shopper just chose.
        if (function_exists('WC') && WC() && !empty(WC()->cart)) {
            foreach (WC()->cart->get_cart() as $key => $item) {
                $pid = isset($item['product_id']) ? $item['product_id'] : 0;
                $is_lifetime_item = $this->is_lifetime_product($pid);
                if ($adding_lifetime && !$is_lifetime_item) {
                    $existing = isset($item['data']) ? $item['data'] : null;
                    if ($existing && stripos($existing->get_name(), 'Ultra Card Pro') !== false) {
                        WC()->cart->remove_cart_item($key);
                        wc_add_notice(__('Switched your cart to Ultra Card Pro Lifetime.', 'ultra-card-integration'), 'notice');
                    }
                } elseif ($adding_pro_sub && $is_lifetime_item) {
                    WC()->cart->remove_cart_item($key);
                    wc_add_notice(__('Removed Lifetime from your cart so you can subscribe instead.', 'ultra-card-integration'), 'notice');
                }
            }
        }
        return $passed;
    }

    /**
     * Inside the checkout order summary, explain the Lifetime price the
     * shopper is looking at.
     */
    public function render_checkout_lifetime_note() {
        if (!$this->cart_has_lifetime()) {
            return;
        }
        if (is_user_logged_in()) {
            $info = $this->get_loyalty_credit(get_current_user_id());
            if ($info['credit'] > 0) {
                $text = sprintf(
                    __('Loyalty credit applied: %1$s off for the %2$s you have already paid toward Pro. Your monthly or yearly plan is cancelled automatically once this order completes.', 'ultra-card-integration'),
                    wc_price($info['credit']),
                    wc_price($info['paid'])
                );
            } else {
                $text = __('One payment for Ultra Card Pro, for the life of Ultra Card. No renewals.', 'ultra-card-integration');
            }
        } else {
            $text = __('Already a Pro subscriber? Log in above and your prior Pro payments are credited to this total automatically. New here? Your account is created from the email you enter.', 'ultra-card-integration');
        }
        echo '<div class="uc-lifetime-checkout-note">' . wp_kses_post($text) . '</div>';
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
