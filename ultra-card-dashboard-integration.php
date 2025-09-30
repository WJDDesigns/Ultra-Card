<?php
/**
 * Plugin Name: Ultra Card Dashboard Integration
 * Plugin URI: https://ultracard.io
 * Description: Integrates Ultra Card cloud sync data into Directories Pro dashboard panels, allowing users to view and manage their synced favorites, colors, and reviews.
 * Version: 1.0.0
 * Author: WJD Designs
 * Author URI: https://wjddesigns.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 * Text Domain: ultra-card-dashboard
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ULTRA_CARD_DASHBOARD_VERSION', '1.0.0');
define('ULTRA_CARD_DASHBOARD_PLUGIN_FILE', __FILE__);
define('ULTRA_CARD_DASHBOARD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ULTRA_CARD_DASHBOARD_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ULTRA_CARD_DASHBOARD_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Panel classes are now in the Directories Pro Panel directory and should be auto-loaded

class UltraCardDashboardIntegration {
    
    public function __construct() {
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
            echo '<h3>Ultra Card Dashboard Debug Info</h3>';
            
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
                
                // Check if plugin files exist
                $plugin_paths = array(
                    WP_PLUGIN_DIR . '/directories/directories.php',
                    WP_PLUGIN_DIR . '/directories-pro/directories.php',
                    WP_PLUGIN_DIR . '/sabai-directories/directories.php'
                );
                
                echo '<h4>Plugin File Check:</h4><ul>';
                foreach ($plugin_paths as $path) {
                    $exists = file_exists($path);
                    echo '<li>' . $path . ': ' . ($exists ? '✅ Found' : '❌ Not found') . '</li>';
                }
                echo '</ul>';
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
            
            // Check current page info
            global $post;
            echo '<h4>Current Page Info:</h4>';
            if ($post) {
                echo '<p>Page slug: ' . $post->post_name . '</p>';
                echo '<p>Page title: ' . $post->post_title . '</p>';
                echo '<p>Is dashboard page: ' . ($this->is_dashboard_page() ? 'Yes' : 'No') . '</p>';
            } else {
                echo '<p>No post object found</p>';
            }
            
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
                    // Method 1: Add as checkbox in existing list
                    var checkboxHtml = '<div class="drts-form-field">' +
                        '<label><input type="checkbox" name="dashboard_panels[]" value="' + panel.name + '"> ' +
                        '<i class="' + panel.icon + '"></i> ' + panel.label + '</label></div>';
                    
                    panelsContainer.append(checkboxHtml);
                    
                    // Method 2: Add to select dropdown if exists
                    var selectElement = panelsContainer.find('select[name*="dashboard_panels"], select[name*="panels"]');
                    if (selectElement.length > 0) {
                        selectElement.append('<option value="' + panel.name + '">' + panel.label + '</option>');
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
     * Manual panel registration as fallback
     */
    public function manual_panel_registration() {
        // Try to register panels directly if the filter approach doesn't work
        if (class_exists('SabaiApps_Directories')) {
            // This is a fallback approach - we'll add panels via direct method if available
            $this->try_direct_registration();
        }
    }
    
    /**
     * Try direct registration with Directories Pro
     */
    private function try_direct_registration() {
        // This method attempts to register panels directly with Directories Pro
        // Implementation depends on the specific version and API available
        
        // For debugging - log that we're trying direct registration
        if (WP_DEBUG) {
            error_log('Ultra Card: Attempting direct panel registration with Directories Pro');
        }
    }
    
    /**
     * Add Ultra Card content directly to dashboard page
     */
    public function add_dashboard_content_to_page($content) {
        // Only add to dashboard pages and only in the main content area
        if (!is_page() || !$this->is_dashboard_page() || !in_the_loop() || !is_main_query()) {
            return $content;
        }
        
        // Don't add if we're in admin or if shortcode already exists
        if (is_admin() || has_shortcode($content, 'ultra_card_dashboard')) {
            return $content;
        }
        
        // Add Ultra Card sections to the content (before, not after)
        $ultra_card_content = $this->render_dashboard_sections();
        
        return $ultra_card_content . $content;
    }
    
    /**
     * Check if current page is a dashboard page
     */
    private function is_dashboard_page() {
        global $post;
        
        if (!$post) return false;
        
        // Check if page contains dashboard shortcode (Directories Pro)
        if (has_shortcode($post->post_content, 'drts-dashboard')) {
            return true;
        }
        
        // Check if page slug suggests it's a dashboard
        $dashboard_slugs = array('dashboard', 'my-dashboard', 'my-account', 'profile', 'user-dashboard', 'account');
        if (in_array($post->post_name, $dashboard_slugs)) {
            return true;
        }
        
        // Check if page title contains dashboard-related words
        $dashboard_titles = array('dashboard', 'my account', 'profile', 'user panel');
        $page_title = strtolower($post->post_title);
        foreach ($dashboard_titles as $title) {
            if (strpos($page_title, $title) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Render all Ultra Card dashboard sections
     */
    private function render_dashboard_sections() {
        if (!is_user_logged_in()) {
            return '';
        }
        
        ob_start();
        ?>
        <div class="ultra-card-dashboard-sections" style="margin-top: 40px;">
            <h2 style="color: #0073aa; border-bottom: 2px solid #0073aa; padding-bottom: 10px;">
                🎨 Ultra Card Cloud Sync
            </h2>
            
            <div class="ultra-card-tabs" style="margin: 20px 0;">
                <button class="ultra-tab-btn active" onclick="showUltraTab('favorites')">
                    <i class="fas fa-heart"></i> Favorites
                </button>
                <button class="ultra-tab-btn" onclick="showUltraTab('colors')">
                    <i class="fas fa-palette"></i> Colors
                </button>
                <button class="ultra-tab-btn" onclick="showUltraTab('reviews')">
                    <i class="fas fa-star"></i> Reviews
                </button>
            </div>
            
            <div id="ultra-tab-favorites" class="ultra-tab-content active">
                <?php $this->render_favorites_panel(); ?>
            </div>
            
            <div id="ultra-tab-colors" class="ultra-tab-content">
                <?php $this->render_colors_panel(); ?>
            </div>
            
            <div id="ultra-tab-reviews" class="ultra-tab-content">
                <?php $this->render_reviews_panel(); ?>
            </div>
        </div>
        
        <style>
        .ultra-card-tabs {
            display: flex;
            gap: 10px;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        .ultra-tab-btn {
            background: #f1f1f1;
            border: 1px solid #ddd;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 5px 5px 0 0;
            transition: all 0.3s ease;
        }
        .ultra-tab-btn:hover {
            background: #e1e1e1;
        }
        .ultra-tab-btn.active {
            background: #0073aa;
            color: white;
            border-bottom-color: #0073aa;
        }
        .ultra-tab-content {
            display: none;
        }
        .ultra-tab-content.active {
            display: block;
        }
        </style>
        
        <script>
        function showUltraTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.ultra-tab-content').forEach(function(tab) {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.ultra-tab-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById('ultra-tab-' + tabName).classList.add('active');
            event.target.classList.add('active');
        }
        </script>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Add Ultra Card panels to dashboard
     */
    public function add_ultra_card_panels($panels) {
        $panels['custom_ultra_card_favorites'] = array(
            'label' => __('Ultra Card Favorites', 'ultra-card-dashboard'),
            'icon' => 'fas fa-heart',
            'weight' => 15,
        );
        
        $panels['custom_ultra_card_colors'] = array(
            'label' => __('Ultra Card Colors', 'ultra-card-dashboard'),
            'icon' => 'fas fa-palette',
            'weight' => 16,
        );
        
        $panels['custom_ultra_card_reviews'] = array(
            'label' => __('Ultra Card Reviews', 'ultra-card-dashboard'),
            'icon' => 'fas fa-star',
            'weight' => 17,
        );
        
        return $panels;
    }
    
    /**
     * Enqueue dashboard styles
     */
    public function enqueue_dashboard_styles() {
        if (!$this->is_dashboard_page()) {
            return;
        }
        
        wp_enqueue_script('jquery');
        
        // Add custom CSS for Ultra Card dashboard sections
        wp_add_inline_style('wp-admin', '
        .ultra-card-dashboard-sections {
            margin: 40px 0;
            padding: 30px;
            background: #f9f9f9;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .ultra-card-tabs {
            display: flex;
            gap: 10px;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        
        .ultra-tab-btn {
            background: #f1f1f1;
            border: 1px solid #ddd;
            padding: 12px 24px;
            cursor: pointer;
            border-radius: 8px 8px 0 0;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .ultra-tab-btn:hover {
            background: #e1e1e1;
            transform: translateY(-2px);
        }
        
        .ultra-tab-btn.active {
            background: #0073aa;
            color: white;
            border-bottom-color: #0073aa;
        }
        
        .ultra-tab-content {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        
        .ultra-tab-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        ');
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
                        'title' => __('View Favorites', 'ultra-card-dashboard'),
                        'icon' => 'fas fa-heart',
                        'weight' => 1,
                    ),
                    'manage' => array(
                        'title' => __('Manage Favorites', 'ultra-card-dashboard'),
                        'icon' => 'fas fa-cog',
                        'weight' => 2,
                    ),
                );
                
            case 'ultra_card_colors':
                return array(
                    'view' => array(
                        'title' => __('View Colors', 'ultra-card-dashboard'),
                        'icon' => 'fas fa-palette',
                        'weight' => 1,
                    ),
                    'manage' => array(
                        'title' => __('Manage Colors', 'ultra-card-dashboard'),
                        'icon' => 'fas fa-cog',
                        'weight' => 2,
                    ),
                );
                
            case 'ultra_card_reviews':
                return array(
                    'view' => array(
                        'title' => __('View Reviews', 'ultra-card-dashboard'),
                        'icon' => 'fas fa-star',
                        'weight' => 1,
                    ),
                    'manage' => array(
                        'title' => __('Manage Reviews', 'ultra-card-dashboard'),
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
            echo '<p>' . __('Please log in to view your favorites.', 'ultra-card-dashboard') . '</p>';
            return;
        }
        
        // Get user's favorites from Ultra Card cloud sync
        $favorites = $this->get_user_favorites($current_user->ID);
        
        ?>
        <div class="ultra-card-favorites-section">
            <h3><i class="fas fa-heart"></i> <?php _e('Your Ultra Card Favorites', 'ultra-card-dashboard'); ?></h3>
            
            <?php if (empty($favorites)): ?>
                <div class="no-favorites" style="text-align: center; padding: 40px 20px; color: #666;">
                    <p><i class="fas fa-heart-broken" style="font-size: 48px; margin-bottom: 20px;"></i></p>
                    <p><?php _e('No favorites found.', 'ultra-card-dashboard'); ?></p>
                    <p><?php _e('Start adding favorites in your Ultra Card to see them here!', 'ultra-card-dashboard'); ?></p>
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
                                    <i class="fas fa-trash"></i> <?php _e('Delete', 'ultra-card-dashboard'); ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <p style="text-align: center; color: #666; margin-top: 20px;">
                    <?php printf(__('Showing %d favorites', 'ultra-card-dashboard'), count($favorites)); ?>
                </p>
            <?php endif; ?>
        </div>
        
        <script>
        function deleteUltraFavorite(favoriteId) {
            if (!confirm('<?php _e('Are you sure you want to delete this favorite?', 'ultra-card-dashboard'); ?>')) {
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
                    alert('<?php _e('Error deleting favorite', 'ultra-card-dashboard'); ?>');
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
            echo '<p>' . __('Please log in to view your colors.', 'ultra-card-dashboard') . '</p>';
            return;
        }
        
        // Get user's colors from Ultra Card cloud sync
        $colors = $this->get_user_colors($current_user->ID);
        
        ?>
        <div class="ultra-card-colors-section">
            <h3><i class="fas fa-palette"></i> <?php _e('Your Ultra Card Colors', 'ultra-card-dashboard'); ?></h3>
            
            <?php if (empty($colors)): ?>
                <div class="no-colors" style="text-align: center; padding: 40px 20px; color: #666;">
                    <p><i class="fas fa-palette" style="font-size: 48px; margin-bottom: 20px;"></i></p>
                    <p><?php _e('No custom colors found.', 'ultra-card-dashboard'); ?></p>
                    <p><?php _e('Create custom colors in your Ultra Card to see them here!', 'ultra-card-dashboard'); ?></p>
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
                    <?php printf(__('Showing %d colors', 'ultra-card-dashboard'), count($colors)); ?>
                </p>
            <?php endif; ?>
        </div>
        
        <script>
        function deleteUltraColor(colorId) {
            if (!confirm('<?php _e('Are you sure you want to delete this color?', 'ultra-card-dashboard'); ?>')) {
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
                    alert('<?php _e('Error deleting color', 'ultra-card-dashboard'); ?>');
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
            echo '<p>' . __('Please log in to view your reviews.', 'ultra-card-dashboard') . '</p>';
            return;
        }
        
        // Get user's reviews from Ultra Card cloud sync
        $reviews = $this->get_user_reviews($current_user->ID);
        
        ?>
        <div class="ultra-card-reviews-section">
            <h3><i class="fas fa-star"></i> <?php _e('Your Ultra Card Reviews', 'ultra-card-dashboard'); ?></h3>
            
            <?php if (empty($reviews)): ?>
                <div class="no-reviews" style="text-align: center; padding: 40px 20px; color: #666;">
                    <p><i class="fas fa-star-half-alt" style="font-size: 48px; margin-bottom: 20px;"></i></p>
                    <p><?php _e('No reviews found.', 'ultra-card-dashboard'); ?></p>
                    <p><?php _e('Write reviews in your Ultra Card to see them here!', 'ultra-card-dashboard'); ?></p>
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
                                    <i class="fas fa-trash"></i> <?php _e('Delete', 'ultra-card-dashboard'); ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <p style="text-align: center; color: #666; margin-top: 20px;">
                    <?php printf(__('Showing %d reviews', 'ultra-card-dashboard'), count($reviews)); ?>
                </p>
            <?php endif; ?>
        </div>
        
        <script>
        function deleteUltraReview(reviewId) {
            if (!confirm('<?php _e('Are you sure you want to delete this review?', 'ultra-card-dashboard'); ?>')) {
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
                    alert('<?php _e('Error deleting review', 'ultra-card-dashboard'); ?>');
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
            return '<p>' . __('Please log in to view your Ultra Card dashboard.', 'ultra-card-dashboard') . '</p>';
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
                $this->render_dashboard_sections();
                break;
        }
        
        return ob_get_clean();
    }
}

/**
 * Plugin activation hook
 */
register_activation_hook(__FILE__, 'ultra_card_dashboard_activate');
function ultra_card_dashboard_activate() {
    // Check if Directories Pro is active
    if (!class_exists('SabaiApps\\Directories\\Application')) {
        wp_die(
            __('Ultra Card Dashboard Integration requires Directories Pro to be installed and activated.', 'ultra-card-dashboard'),
            __('Plugin Activation Error', 'ultra-card-dashboard'),
            array('back_link' => true)
        );
    }
    
    // Set plugin version
    update_option('ultra_card_dashboard_version', ULTRA_CARD_DASHBOARD_VERSION);
    
    // Clear any cached data
    wp_cache_flush();
}

/**
 * Plugin deactivation hook
 */
register_deactivation_hook(__FILE__, 'ultra_card_dashboard_deactivate');
function ultra_card_dashboard_deactivate() {
    // Clean up any temporary data if needed
    wp_cache_flush();
}

/**
 * Plugin uninstall hook
 */
register_uninstall_hook(__FILE__, 'ultra_card_dashboard_uninstall');
function ultra_card_dashboard_uninstall() {
    // Remove plugin options
    delete_option('ultra_card_dashboard_version');
    
    // Note: We don't delete Ultra Card data (favorites, colors, reviews) 
    // as users may want to keep their synced data
}

/**
 * Initialize the plugin
 */
add_action('plugins_loaded', 'ultra_card_dashboard_init');
function ultra_card_dashboard_init() {
    // Check if Directories Pro is active
    if (!class_exists('SabaiApps\\Directories\\Application')) {
        add_action('admin_notices', 'ultra_card_dashboard_missing_directories_notice');
        return;
    }
    
    // Initialize the integration
    new UltraCardDashboardIntegration();
}

/**
 * Admin notice for missing Directories Pro
 */
function ultra_card_dashboard_missing_directories_notice() {
    ?>
    <div class="notice notice-error">
        <p>
            <strong><?php _e('Ultra Card Dashboard Integration', 'ultra-card-dashboard'); ?></strong>
            <?php _e('requires Directories Pro to be installed and activated.', 'ultra-card-dashboard'); ?>
            <a href="<?php echo admin_url('plugins.php'); ?>"><?php _e('Manage Plugins', 'ultra-card-dashboard'); ?></a>
        </p>
    </div>
    <?php
}

/**
 * Add plugin action links
 */
add_filter('plugin_action_links_' . ULTRA_CARD_DASHBOARD_PLUGIN_BASENAME, 'ultra_card_dashboard_action_links');
function ultra_card_dashboard_action_links($links) {
    $settings_link = '<a href="' . admin_url('admin.php?page=directories-settings#dashboard') . '">' . __('Settings', 'ultra-card-dashboard') . '</a>';
    array_unshift($links, $settings_link);
    
    $debug_link = '<a href="' . admin_url('admin.php?page=directories-settings&debug_ultra_card=1') . '">' . __('Debug', 'ultra-card-dashboard') . '</a>';
    array_unshift($links, $debug_link);
    
    return $links;
}

// AJAX handlers for dashboard actions
add_action('wp_ajax_delete_ultra_favorite', 'handle_delete_ultra_favorite');
add_action('wp_ajax_delete_ultra_color', 'handle_delete_ultra_color');
add_action('wp_ajax_delete_ultra_review', 'handle_delete_ultra_review');
add_action('wp_ajax_load_ultra_card_dashboard', 'handle_load_ultra_card_dashboard');

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

function handle_load_ultra_card_dashboard() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'ultra_card_nonce')) {
        wp_die('Security check failed');
    }
    
    if (!is_user_logged_in()) {
        wp_send_json_error('Please log in');
    }
    
    // Get the dashboard integration instance
    $integration = new UltraCardDashboardIntegration();
    
    // Use reflection to call the private method
    $method = new ReflectionMethod($integration, 'render_dashboard_sections');
    $method->setAccessible(true);
    $content = $method->invoke($integration);
    
    wp_send_json_success($content);
}

// Register shortcode
add_shortcode('ultra_card_dashboard', array(new UltraCardDashboardIntegration(), 'ultra_card_dashboard_shortcode'));
