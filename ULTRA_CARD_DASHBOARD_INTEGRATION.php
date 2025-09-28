<?php
/**
 * Ultra Card Dashboard Integration for Directories Pro
 * 
 * This adds Ultra Card cloud sync panels to the existing Directories Pro dashboard
 * showing users their synced favorites, colors, and reviews.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class UltraCardDashboardIntegration {
    
    public function __construct() {
        // Multiple hooks to ensure compatibility with different Directories Pro versions
        add_filter('drts_dashboard_panels', array($this, 'add_ultra_card_panels'));
        add_filter('sabai_dashboard_panels', array($this, 'add_ultra_card_panels')); // Legacy hook
        add_filter('directories_dashboard_panels', array($this, 'add_ultra_card_panels')); // Alternative hook
        
        // Panel render actions
        add_action('drts_dashboard_panel_ultra_card_favorites', array($this, 'render_favorites_panel'));
        add_action('drts_dashboard_panel_ultra_card_colors', array($this, 'render_colors_panel'));
        add_action('drts_dashboard_panel_ultra_card_reviews', array($this, 'render_reviews_panel'));
        
        // Alternative render actions
        add_action('sabai_dashboard_panel_ultra_card_favorites', array($this, 'render_favorites_panel'));
        add_action('sabai_dashboard_panel_ultra_card_colors', array($this, 'render_colors_panel'));
        add_action('sabai_dashboard_panel_ultra_card_reviews', array($this, 'render_reviews_panel'));
        
        // Add CSS for Ultra Card panels
        add_action('wp_enqueue_scripts', array($this, 'enqueue_dashboard_styles'));
        
        // Debug hook to see what's available
        add_action('init', array($this, 'debug_directories_pro'), 20);
        
        // Manual registration as fallback
        add_action('init', array($this, 'manual_panel_registration'), 25);
        
        // Alternative approach - inject content directly into dashboard
        add_action('wp_footer', array($this, 'inject_dashboard_content'));
        
        // Hook into dashboard page content
        add_filter('the_content', array($this, 'add_dashboard_content_to_page'));
        
        // Add shortcode for manual placement
        add_shortcode('ultra_card_dashboard', array($this, 'render_dashboard_shortcode'));
    }
    
    /**
     * Debug Directories Pro integration
     */
    public function debug_directories_pro() {
        if (current_user_can('manage_options') && isset($_GET['debug_ultra_card'])) {
            echo '<div style="background: #fff; padding: 20px; margin: 20px; border: 1px solid #ccc;">';
            echo '<h3>Ultra Card Dashboard Debug Info</h3>';
            
            // Check if Directories Pro is active
            if (class_exists('SabaiApps_Directories')) {
                echo '<p>✅ Directories Pro is active</p>';
                
                // Check available hooks
                global $wp_filter;
                echo '<h4>Available Dashboard Hooks:</h4><ul>';
                foreach ($wp_filter as $hook => $filters) {
                    if (strpos($hook, 'dashboard') !== false && strpos($hook, 'panel') !== false) {
                        echo '<li>' . $hook . '</li>';
                    }
                }
                echo '</ul>';
                
                // Check if our filter is being called
                echo '<h4>Filter Test:</h4>';
                $test_panels = apply_filters('drts_dashboard_panels', array());
                echo '<p>drts_dashboard_panels result: ' . (empty($test_panels) ? 'Empty' : 'Has ' . count($test_panels) . ' panels') . '</p>';
                
            } else {
                echo '<p>❌ Directories Pro is not active</p>';
            }
            echo '</div>';
        }
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
        // Only add to dashboard pages
        if (!is_page() || !$this->is_dashboard_page()) {
            return $content;
        }
        
        // Add Ultra Card sections to the content
        $ultra_card_content = $this->render_dashboard_sections();
        
        return $content . $ultra_card_content;
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
            
            <div id="ultra-tab-colors" class="ultra-tab-content" style="display: none;">
                <?php $this->render_colors_panel(); ?>
            </div>
            
            <div id="ultra-tab-reviews" class="ultra-tab-content" style="display: none;">
                <?php $this->render_reviews_panel(); ?>
            </div>
        </div>
        
        <style>
        .ultra-card-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        
        .ultra-tab-btn {
            background: #f7f7f7;
            border: 1px solid #ddd;
            border-bottom: none;
            padding: 12px 20px;
            cursor: pointer;
            border-radius: 6px 6px 0 0;
            font-size: 14px;
            color: #666;
            transition: all 0.3s ease;
        }
        
        .ultra-tab-btn:hover {
            background: #e7e7e7;
            color: #333;
        }
        
        .ultra-tab-btn.active {
            background: #0073aa;
            color: white;
            border-color: #0073aa;
        }
        
        .ultra-tab-btn i {
            margin-right: 8px;
        }
        
        .ultra-tab-content {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 0 6px 6px 6px;
            padding: 20px;
        }
        </style>
        
        <script>
        function showUltraTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.ultra-tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.ultra-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById('ultra-tab-' + tabName).style.display = 'block';
            
            // Add active class to clicked button
            event.target.classList.add('active');
        }
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Inject dashboard content via JavaScript (fallback)
     */
    public function inject_dashboard_content() {
        if (!is_page() || !$this->is_dashboard_page() || !is_user_logged_in()) {
            return;
        }
        
        ?>
        <script>
        // Wait for jQuery to be available
        function waitForJQuery(callback) {
            if (typeof jQuery !== 'undefined') {
                callback(jQuery);
            } else {
                setTimeout(function() { waitForJQuery(callback); }, 100);
            }
        }
        
        waitForJQuery(function($) {
            $(document).ready(function() {
                // Try to find the dashboard container and add our content
                var dashboardContainer = $('.drts-dashboard, .sabai-dashboard, [class*="dashboard"], .main-content, .content, #content').first();
                
                if (dashboardContainer.length && !$('.ultra-card-dashboard-sections').length) {
                    // Load Ultra Card dashboard content via AJAX
                    $.post('<?php echo admin_url('admin-ajax.php'); ?>', {
                        action: 'load_ultra_card_dashboard',
                        nonce: '<?php echo wp_create_nonce('ultra_card_dashboard'); ?>'
                    }, function(response) {
                        if (response.success) {
                            dashboardContainer.append(response.data);
                        }
                    });
                }
            });
        });
        </script>
        <?php
    }
    
    /**
     * Shortcode to render Ultra Card dashboard
     */
    public function render_dashboard_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<div class="ultra-card-login-prompt">
                <p>Please <a href="' . wp_login_url(get_permalink()) . '">login</a> to view your Ultra Card dashboard.</p>
            </div>';
        }
        
        return $this->render_dashboard_sections();
    }
    
    /**
     * Add Ultra Card panels to Directories Pro dashboard
     */
    public function add_ultra_card_panels($panels) {
        $panels['ultra_card_favorites'] = array(
            'label' => 'Ultra Card Favorites',
            'icon' => 'fas fa-heart',
            'weight' => 15,
        );
        
        $panels['ultra_card_colors'] = array(
            'label' => 'Ultra Card Colors',
            'icon' => 'fas fa-palette',
            'weight' => 16,
        );
        
        $panels['ultra_card_reviews'] = array(
            'label' => 'Ultra Card Reviews',
            'icon' => 'fas fa-star',
            'weight' => 17,
        );
        
        return $panels;
    }
    
    /**
     * Render Ultra Card Favorites panel
     */
    public function render_favorites_panel() {
        $user_id = get_current_user_id();
        
        // Get user's favorites
        $favorites = get_posts(array(
            'post_type' => 'ultra_favorite',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'date',
            'order' => 'DESC',
        ));
        
        ?>
        <div class="ultra-card-dashboard-panel">
            <div class="panel-header">
                <h3><i class="fas fa-heart"></i> Your Ultra Card Favorites</h3>
                <p>Manage your saved Ultra Card configurations that sync across all your devices.</p>
            </div>
            
            <?php if (empty($favorites)): ?>
                <div class="no-items">
                    <i class="fas fa-heart-broken"></i>
                    <h4>No Favorites Yet</h4>
                    <p>Your Ultra Card favorites will appear here once you start saving configurations.</p>
                    <a href="https://ultracard.io/docs/favorites" target="_blank" class="learn-more-btn">
                        Learn About Favorites
                    </a>
                </div>
            <?php else: ?>
                <div class="items-grid">
                    <?php foreach ($favorites as $favorite): 
                        $tags = get_post_meta($favorite->ID, 'tags', true) ?: array();
                        $created = get_post_meta($favorite->ID, 'created', true) ?: $favorite->post_date;
                    ?>
                        <div class="favorite-item">
                            <div class="item-header">
                                <h4><?php echo esc_html($favorite->post_title); ?></h4>
                                <div class="item-actions">
                                    <button class="btn-view" onclick="viewFavorite(<?php echo $favorite->ID; ?>)">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-delete" onclick="deleteFavorite(<?php echo $favorite->ID; ?>)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <?php if ($favorite->post_content): ?>
                                <p class="item-description"><?php echo esc_html($favorite->post_content); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($tags)): ?>
                                <div class="item-tags">
                                    <?php foreach ($tags as $tag): ?>
                                        <span class="tag"><?php echo esc_html($tag); ?></span>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                            
                            <div class="item-meta">
                                <span class="created-date">
                                    <i class="fas fa-calendar"></i>
                                    <?php echo date('M j, Y', strtotime($created)); ?>
                                </span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <div class="panel-stats">
                    <div class="stat">
                        <strong><?php echo count($favorites); ?></strong>
                        <span>Total Favorites</span>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Render Ultra Card Colors panel
     */
    public function render_colors_panel() {
        $user_id = get_current_user_id();
        
        // Get user's colors
        $colors = get_posts(array(
            'post_type' => 'ultra_color',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'meta_key' => 'order',
            'orderby' => 'meta_value_num',
            'order' => 'ASC',
        ));
        
        ?>
        <div class="ultra-card-dashboard-panel">
            <div class="panel-header">
                <h3><i class="fas fa-palette"></i> Your Ultra Card Colors</h3>
                <p>Your custom color palette that syncs across all Ultra Card instances.</p>
            </div>
            
            <?php if (empty($colors)): ?>
                <div class="no-items">
                    <i class="fas fa-palette"></i>
                    <h4>No Custom Colors Yet</h4>
                    <p>Your saved Ultra Card colors will appear here once you start customizing.</p>
                    <a href="https://ultracard.io/docs/colors" target="_blank" class="learn-more-btn">
                        Learn About Color Sync
                    </a>
                </div>
            <?php else: ?>
                <div class="colors-grid">
                    <?php foreach ($colors as $color): 
                        $color_value = get_post_meta($color->ID, 'color', true);
                        $order = get_post_meta($color->ID, 'order', true);
                    ?>
                        <div class="color-item">
                            <div class="color-preview" style="background-color: <?php echo esc_attr($color_value); ?>"></div>
                            <div class="color-info">
                                <h4><?php echo esc_html($color->post_title); ?></h4>
                                <code><?php echo esc_html($color_value); ?></code>
                            </div>
                            <div class="color-actions">
                                <button class="btn-copy" onclick="copyColor('<?php echo esc_js($color_value); ?>')">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <button class="btn-delete" onclick="deleteColor(<?php echo $color->ID; ?>)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <div class="panel-stats">
                    <div class="stat">
                        <strong><?php echo count($colors); ?></strong>
                        <span>Saved Colors</span>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Render Ultra Card Reviews panel
     */
    public function render_reviews_panel() {
        $user_id = get_current_user_id();
        
        // Get user's reviews
        $reviews = get_posts(array(
            'post_type' => 'ultra_review',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'date',
            'order' => 'DESC',
        ));
        
        ?>
        <div class="ultra-card-dashboard-panel">
            <div class="panel-header">
                <h3><i class="fas fa-star"></i> Your Ultra Card Reviews</h3>
                <p>Reviews you've written for Ultra Card presets and configurations.</p>
            </div>
            
            <?php if (empty($reviews)): ?>
                <div class="no-items">
                    <i class="fas fa-star-half-alt"></i>
                    <h4>No Reviews Yet</h4>
                    <p>Your Ultra Card preset reviews will appear here once you start rating configurations.</p>
                    <a href="https://ultracard.io/presets" target="_blank" class="learn-more-btn">
                        Browse Presets to Review
                    </a>
                </div>
            <?php else: ?>
                <div class="reviews-list">
                    <?php foreach ($reviews as $review): 
                        $preset_id = get_post_meta($review->ID, 'preset_id', true);
                        $rating = get_post_meta($review->ID, 'rating', true);
                        $created = get_post_meta($review->ID, 'created', true) ?: $review->post_date;
                    ?>
                        <div class="review-item">
                            <div class="review-header">
                                <h4>Preset: <?php echo esc_html($preset_id); ?></h4>
                                <div class="rating">
                                    <?php for ($i = 1; $i <= 5; $i++): ?>
                                        <i class="fas fa-star <?php echo $i <= $rating ? 'filled' : 'empty'; ?>"></i>
                                    <?php endfor; ?>
                                    <span class="rating-text"><?php echo number_format($rating, 1); ?>/5</span>
                                </div>
                            </div>
                            
                            <?php if ($review->post_content): ?>
                                <div class="review-content">
                                    <p><?php echo esc_html($review->post_content); ?></p>
                                </div>
                            <?php endif; ?>
                            
                            <div class="review-meta">
                                <span class="review-date">
                                    <i class="fas fa-calendar"></i>
                                    <?php echo date('M j, Y', strtotime($created)); ?>
                                </span>
                                <div class="review-actions">
                                    <button class="btn-edit" onclick="editReview(<?php echo $review->ID; ?>)">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn-delete" onclick="deleteReview(<?php echo $review->ID; ?>)">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <div class="panel-stats">
                    <div class="stat">
                        <strong><?php echo count($reviews); ?></strong>
                        <span>Total Reviews</span>
                    </div>
                    <div class="stat">
                        <strong><?php echo number_format(array_sum(array_map(function($r) { 
                            return get_post_meta($r->ID, 'rating', true); 
                        }, $reviews)) / count($reviews), 1); ?></strong>
                        <span>Average Rating</span>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Enqueue dashboard styles and scripts
     */
    public function enqueue_dashboard_styles() {
        // Load on all pages since we're not using Directories Pro panels
        if (!is_page()) {
            return;
        }
        
        // Enqueue jQuery if not already loaded
        wp_enqueue_script('jquery');
        
        // Add our styles
        wp_add_inline_style('wp-block-library', $this->get_dashboard_css());
        
        // Add our JavaScript with jQuery dependency
        wp_add_inline_script('jquery', $this->get_dashboard_js());
    }
    
    /**
     * Get dashboard CSS
     */
    private function get_dashboard_css() {
        return '
        .ultra-card-dashboard-panel {
            background: #fff;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .panel-header {
            margin-bottom: 24px;
            border-bottom: 1px solid #eee;
            padding-bottom: 16px;
        }
        
        .panel-header h3 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 20px;
        }
        
        .panel-header h3 i {
            margin-right: 8px;
            color: #0073aa;
        }
        
        .panel-header p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        
        .no-items {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .no-items i {
            font-size: 48px;
            margin-bottom: 16px;
            color: #ccc;
        }
        
        .no-items h4 {
            margin: 0 0 8px 0;
            font-size: 18px;
        }
        
        .no-items p {
            margin: 0 0 20px 0;
        }
        
        .learn-more-btn {
            display: inline-block;
            padding: 10px 20px;
            background: #0073aa;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .learn-more-btn:hover {
            background: #005a87;
        }
        
        .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .favorite-item, .review-item {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 16px;
            background: #fafafa;
        }
        
        .item-header, .review-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        
        .item-header h4, .review-header h4 {
            margin: 0;
            font-size: 16px;
            color: #333;
        }
        
        .item-actions, .review-actions {
            display: flex;
            gap: 8px;
        }
        
        .btn-view, .btn-delete, .btn-edit, .btn-copy {
            background: none;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 6px 8px;
            cursor: pointer;
            font-size: 12px;
            color: #666;
        }
        
        .btn-view:hover { background: #0073aa; color: white; }
        .btn-delete:hover { background: #dc3232; color: white; }
        .btn-edit:hover { background: #00a32a; color: white; }
        .btn-copy:hover { background: #8c8f94; color: white; }
        
        .item-description, .review-content p {
            margin: 0 0 12px 0;
            color: #555;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .item-tags {
            margin-bottom: 12px;
        }
        
        .tag {
            display: inline-block;
            background: #0073aa;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            margin-right: 6px;
        }
        
        .item-meta, .review-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #eee;
        }
        
        .colors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .color-item {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            background: #fafafa;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .color-preview {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .color-info {
            flex: 1;
        }
        
        .color-info h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
        }
        
        .color-info code {
            font-size: 12px;
            color: #666;
        }
        
        .rating {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .rating .fa-star.filled {
            color: #ffb900;
        }
        
        .rating .fa-star.empty {
            color: #ddd;
        }
        
        .rating-text {
            margin-left: 8px;
            font-weight: bold;
            color: #333;
        }
        
        .reviews-list {
            margin-bottom: 24px;
        }
        
        .panel-stats {
            display: flex;
            gap: 24px;
            padding-top: 16px;
            border-top: 1px solid #eee;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat strong {
            display: block;
            font-size: 24px;
            color: #0073aa;
            margin-bottom: 4px;
        }
        
        .stat span {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        @media (max-width: 768px) {
            .items-grid, .colors-grid {
                grid-template-columns: 1fr;
            }
            
            .item-header, .review-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            
            .panel-stats {
                flex-direction: column;
                gap: 16px;
            }
        }
        ';
    }
    
    /**
     * Get dashboard JavaScript
     */
    private function get_dashboard_js() {
        return '
        function viewFavorite(id) {
            // Open favorite details in modal or new tab
            window.open("/wp-admin/post.php?post=" + id + "&action=edit", "_blank");
        }
        
        function deleteFavorite(id) {
            if (confirm("Are you sure you want to delete this favorite?")) {
                // AJAX call to delete favorite
                jQuery.post(ajaxurl, {
                    action: "delete_ultra_favorite",
                    id: id,
                    nonce: "' . wp_create_nonce('ultra_card_dashboard') . '"
                }, function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert("Error deleting favorite: " + response.data);
                    }
                });
            }
        }
        
        function copyColor(color) {
            navigator.clipboard.writeText(color).then(function() {
                alert("Color " + color + " copied to clipboard!");
            });
        }
        
        function deleteColor(id) {
            if (confirm("Are you sure you want to delete this color?")) {
                jQuery.post(ajaxurl, {
                    action: "delete_ultra_color",
                    id: id,
                    nonce: "' . wp_create_nonce('ultra_card_dashboard') . '"
                }, function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert("Error deleting color: " + response.data);
                    }
                });
            }
        }
        
        function editReview(id) {
            window.open("/wp-admin/post.php?post=" + id + "&action=edit", "_blank");
        }
        
        function deleteReview(id) {
            if (confirm("Are you sure you want to delete this review?")) {
                jQuery.post(ajaxurl, {
                    action: "delete_ultra_review",
                    id: id,
                    nonce: "' . wp_create_nonce('ultra_card_dashboard') . '"
                }, function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert("Error deleting review: " + response.data);
                    }
                });
            }
        }
        ';
    }
}

// Initialize the dashboard integration
new UltraCardDashboardIntegration();

// AJAX handlers for dashboard actions
add_action('wp_ajax_delete_ultra_favorite', 'handle_delete_ultra_favorite');
add_action('wp_ajax_delete_ultra_color', 'handle_delete_ultra_color');
add_action('wp_ajax_delete_ultra_review', 'handle_delete_ultra_review');
add_action('wp_ajax_load_ultra_card_dashboard', 'handle_load_ultra_card_dashboard');

function handle_delete_ultra_favorite() {
    check_ajax_referer('ultra_card_dashboard', 'nonce');
    
    $id = intval($_POST['id']);
    $user_id = get_current_user_id();
    
    $post = get_post($id);
    if (!$post || $post->post_type !== 'ultra_favorite' || $post->post_author != $user_id) {
        wp_die('Unauthorized');
    }
    
    $deleted = wp_delete_post($id, true);
    
    if ($deleted) {
        wp_send_json_success();
    } else {
        wp_send_json_error('Failed to delete favorite');
    }
}

function handle_delete_ultra_color() {
    check_ajax_referer('ultra_card_dashboard', 'nonce');
    
    $id = intval($_POST['id']);
    $user_id = get_current_user_id();
    
    $post = get_post($id);
    if (!$post || $post->post_type !== 'ultra_color' || $post->post_author != $user_id) {
        wp_die('Unauthorized');
    }
    
    $deleted = wp_delete_post($id, true);
    
    if ($deleted) {
        wp_send_json_success();
    } else {
        wp_send_json_error('Failed to delete color');
    }
}

function handle_delete_ultra_review() {
    check_ajax_referer('ultra_card_dashboard', 'nonce');
    
    $id = intval($_POST['id']);
    $user_id = get_current_user_id();
    
    $post = get_post($id);
    if (!$post || $post->post_type !== 'ultra_review' || $post->post_author != $user_id) {
        wp_die('Unauthorized');
    }
    
    $deleted = wp_delete_post($id, true);
    
    if ($deleted) {
        wp_send_json_success();
    } else {
        wp_send_json_error('Failed to delete review');
    }
}

function handle_load_ultra_card_dashboard() {
    check_ajax_referer('ultra_card_dashboard', 'nonce');
    
    if (!is_user_logged_in()) {
        wp_send_json_error('Not logged in');
    }
    
    // Get the dashboard integration instance
    $integration = new UltraCardDashboardIntegration();
    
    // Use reflection to call the private method
    $reflection = new ReflectionClass($integration);
    $method = $reflection->getMethod('render_dashboard_sections');
    $method->setAccessible(true);
    
    $content = $method->invoke($integration);
    
    wp_send_json_success($content);
}
?>
