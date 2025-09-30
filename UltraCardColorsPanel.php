<?php
/**
 * Ultra Card Colors Panel for Directories Pro
 */

namespace SabaiApps\Directories\Component\Dashboard\Panel;

use SabaiApps\Framework\User\AbstractIdentity;

class UltraCardColorsPanel extends AbstractPanel
{
    protected function _dashboardPanelInfo()
    {
        return [
            'label' => __('Ultra Card Colors', 'ultra-card-integration'),
            'weight' => 16,
            'wp' => false,
            'icon' => 'fas fa-palette',
        ];
    }

    protected function _dashboardPanelLinks(array $settings, AbstractIdentity $identity = null)
    {
        if (isset($identity)) return;

        return [
            'view' => [
                'title' => __('View Colors', 'ultra-card-integration'),
                'icon' => 'fas fa-palette',
                'weight' => 1,
            ],
        ];
    }

    public function dashboardPanelSettingsForm(array $settings, array $parents)
    {
        return [
            'show_preview' => [
                '#title' => __('Show color previews', 'ultra-card-integration'),
                '#type' => 'checkbox',
                '#default_value' => isset($settings['show_preview']) ? $settings['show_preview'] : true,
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

        $current_user = wp_get_current_user();
        if (!$current_user->ID) {
            return '<p>' . __('Please log in to view your colors.', 'ultra-card-integration') . '</p>';
        }

        $colors = $this->_getUserColors($current_user->ID);
        
        ob_start();
        ?>
        <div class="ultra-card-colors-panel">
            <div class="panel-header">
                <h3><i class="fas fa-palette"></i> <?php _e('Your Ultra Card Colors', 'ultra-card-integration'); ?></h3>
                <span class="colors-count"><?php echo count($colors); ?> <?php _e('colors', 'ultra-card-integration'); ?></span>
            </div>
            
            <?php if (empty($colors)): ?>
                <div class="no-colors">
                    <p><i class="fas fa-palette"></i> <?php _e('No custom colors found.', 'ultra-card-integration'); ?></p>
                    <p><?php _e('Create custom colors in your Ultra Card to see them here!', 'ultra-card-integration'); ?></p>
                </div>
            <?php else: ?>
                <div class="colors-grid">
                    <?php 
                    $items_per_page = isset($settings['items_per_page']) ? $settings['items_per_page'] : 10;
                    $paged_colors = array_slice($colors, 0, $items_per_page);
                    
                    foreach ($paged_colors as $color): 
                    ?>
                        <div class="color-item">
                            <?php if (isset($settings['show_preview']) && $settings['show_preview']): ?>
                                <div class="color-preview" style="background-color: <?php echo esc_attr($color['hex_value']); ?>"></div>
                            <?php endif; ?>
                            <div class="color-info">
                                <h4><?php echo esc_html($color['name']); ?></h4>
                                <p class="color-value"><?php echo esc_html($color['hex_value']); ?></p>
                                <p class="color-date"><?php echo date('M j, Y', strtotime($color['created_at'])); ?></p>
                            </div>
                            <div class="color-actions">
                                <button class="btn btn-sm btn-danger" onclick="deleteUltraColor(<?php echo $color['id']; ?>)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        
        <style>
        .ultra-card-colors-panel .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #0073aa;
        }
        .ultra-card-colors-panel .colors-count {
            background: #0073aa;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
        }
        .ultra-card-colors-panel .colors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .ultra-card-colors-panel .color-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: #f9f9f9;
            text-align: center;
        }
        .ultra-card-colors-panel .color-preview {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 10px;
            border: 3px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        </style>
        
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
        
        return ob_get_clean();
    }
    
    private function _getUserColors($user_id)
    {
        $colors = get_posts([
            'post_type' => 'ultra_color',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ]);
        
        $formatted_colors = [];
        foreach ($colors as $color) {
            $meta = get_post_meta($color->ID);
            $formatted_colors[] = [
                'id' => $color->ID,
                'name' => $color->post_title,
                'hex_value' => isset($meta['hex_value'][0]) ? $meta['hex_value'][0] : '#000000',
                'created_at' => $color->post_date,
            ];
        }
        
        return $formatted_colors;
    }
}