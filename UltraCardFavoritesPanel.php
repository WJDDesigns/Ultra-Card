<?php
/**
 * Ultra Card Favorites Panel for Directories Pro
 */

namespace SabaiApps\Directories\Component\Dashboard\Panel;

use SabaiApps\Framework\User\AbstractIdentity;

class UltraCardFavoritesPanel extends AbstractPanel
{
    protected function _dashboardPanelInfo()
    {
        return [
            'label' => __('Ultra Card Favorites', 'ultra-card-integration'),
            'weight' => 15,
            'wp' => false,
            'icon' => 'fas fa-heart',
        ];
    }

    protected function _dashboardPanelLinks(array $settings, AbstractIdentity $identity = null)
    {
        if (isset($identity)) return; // Do not show if public dashboard

        return [
            'view' => [
                'title' => __('View Favorites', 'ultra-card-integration'),
                'icon' => 'fas fa-heart',
                'weight' => 1,
            ],
        ];
    }

    public function dashboardPanelSettingsForm(array $settings, array $parents)
    {
        return [
            'show_count' => [
                '#title' => __('Show favorites count', 'ultra-card-integration'),
                '#type' => 'checkbox',
                '#default_value' => isset($settings['show_count']) ? $settings['show_count'] : true,
            ],
            'items_per_page' => [
                '#title' => __('Items per page', 'ultra-card-integration'),
                '#type' => 'number',
                '#default_value' => isset($settings['items_per_page']) ? $settings['items_per_page'] : 10,
                '#min_value' => 1,
                '#max_value' => 50,
            ],
        ];
    }

    public function dashboardPanelContent($link, array $settings, array $params, AbstractIdentity $identity = null)
    {
        if (isset($identity)) return;

        // Get current user
        $current_user = wp_get_current_user();
        if (!$current_user->ID) {
            return '<p>' . __('Please log in to view your favorites.', 'ultra-card-integration') . '</p>';
        }

        // Get user's favorites from Ultra Card cloud sync
        $favorites = $this->_getUserFavorites($current_user->ID);
        
        ob_start();
        ?>
        <div class="ultra-card-favorites-panel">
            <div class="panel-header">
                <h3><i class="fas fa-heart"></i> <?php _e('Your Ultra Card Favorites', 'ultra-card-integration'); ?></h3>
                <?php if (isset($settings['show_count']) && $settings['show_count']): ?>
                    <span class="favorites-count"><?php echo count($favorites); ?> <?php _e('favorites', 'ultra-card-integration'); ?></span>
                <?php endif; ?>
            </div>
            
            <?php if (empty($favorites)): ?>
                <div class="no-favorites">
                    <p><i class="fas fa-heart-broken"></i> <?php _e('No favorites found.', 'ultra-card-integration'); ?></p>
                    <p><?php _e('Start adding favorites in your Ultra Card to see them here!', 'ultra-card-integration'); ?></p>
                </div>
            <?php else: ?>
                <div class="favorites-list">
                    <?php 
                    $items_per_page = isset($settings['items_per_page']) ? $settings['items_per_page'] : 10;
                    $paged_favorites = array_slice($favorites, 0, $items_per_page);
                    
                    foreach ($paged_favorites as $favorite): 
                    ?>
                        <div class="favorite-item">
                            <div class="favorite-info">
                                <h4><?php echo esc_html($favorite['name']); ?></h4>
                                <p class="favorite-meta">
                                    <span class="favorite-type"><?php echo esc_html($favorite['type']); ?></span>
                                    <span class="favorite-date"><?php echo date('M j, Y', strtotime($favorite['created_at'])); ?></span>
                                </p>
                                <?php if (!empty($favorite['description'])): ?>
                                    <p class="favorite-description"><?php echo esc_html($favorite['description']); ?></p>
                                <?php endif; ?>
                            </div>
                            <div class="favorite-actions">
                                <button class="btn btn-sm btn-danger" onclick="deleteUltraFavorite(<?php echo $favorite['id']; ?>)">
                                    <i class="fas fa-trash"></i> <?php _e('Delete', 'ultra-card-integration'); ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        
        <style>
        .ultra-card-favorites-panel .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #0073aa;
        }
        .ultra-card-favorites-panel .favorites-count {
            background: #0073aa;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
        }
        .ultra-card-favorites-panel .no-favorites {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        .ultra-card-favorites-panel .favorite-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 10px;
            background: #f9f9f9;
        }
        </style>
        
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
        
        return ob_get_clean();
    }
    
    private function _getUserFavorites($user_id)
    {
        // Get favorites from Ultra Card cloud sync custom post type
        $favorites = get_posts([
            'post_type' => 'ultra_favorite',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ]);
        
        $formatted_favorites = [];
        foreach ($favorites as $favorite) {
            $meta = get_post_meta($favorite->ID);
            $formatted_favorites[] = [
                'id' => $favorite->ID,
                'name' => $favorite->post_title,
                'description' => $favorite->post_content,
                'type' => isset($meta['favorite_type'][0]) ? $meta['favorite_type'][0] : 'Unknown',
                'created_at' => $favorite->post_date,
                'data' => isset($meta['favorite_data'][0]) ? json_decode($meta['favorite_data'][0], true) : [],
            ];
        }
        
        return $formatted_favorites;
    }
}