<?php
/**
 * Ultra Card Reviews Panel for Directories Pro
 */

namespace SabaiApps\Directories\Component\Dashboard\Panel;

use SabaiApps\Framework\User\AbstractIdentity;

class UltraCardReviewsPanel extends AbstractPanel
{
    protected function _dashboardPanelInfo()
    {
        return [
            'label' => __('Ultra Card Reviews', 'ultra-card-integration'),
            'weight' => 17,
            'wp' => false,
            'icon' => 'fas fa-star',
        ];
    }

    protected function _dashboardPanelLinks(array $settings, AbstractIdentity $identity = null)
    {
        if (isset($identity)) return;

        return [
            'view' => [
                'title' => __('View Reviews', 'ultra-card-integration'),
                'icon' => 'fas fa-star',
                'weight' => 1,
            ],
        ];
    }

    public function dashboardPanelSettingsForm(array $settings, array $parents)
    {
        return [
            'show_ratings' => [
                '#title' => __('Show star ratings', 'ultra-card-integration'),
                '#type' => 'checkbox',
                '#default_value' => isset($settings['show_ratings']) ? $settings['show_ratings'] : true,
            ],
            'items_per_page' => [
                '#title' => __('Items per page', 'ultra-card-integration'),
                '#type' => 'number',
                '#default_value' => isset($settings['items_per_page']) ? $settings['items_per_page'] : 5,
                '#min_value' => 1,
                '#max_value' => 20,
            ],
        ];
    }

    public function dashboardPanelContent($link, array $settings, array $params, AbstractIdentity $identity = null)
    {
        if (isset($identity)) return;

        $current_user = wp_get_current_user();
        if (!$current_user->ID) {
            return '<p>' . __('Please log in to view your reviews.', 'ultra-card-integration') . '</p>';
        }

        $reviews = $this->_getUserReviews($current_user->ID);
        
        ob_start();
        ?>
        <div class="ultra-card-reviews-panel">
            <div class="panel-header">
                <h3><i class="fas fa-star"></i> <?php _e('Your Ultra Card Reviews', 'ultra-card-integration'); ?></h3>
                <span class="reviews-count"><?php echo count($reviews); ?> <?php _e('reviews', 'ultra-card-integration'); ?></span>
            </div>
            
            <?php if (empty($reviews)): ?>
                <div class="no-reviews">
                    <p><i class="fas fa-star-half-alt"></i> <?php _e('No reviews found.', 'ultra-card-integration'); ?></p>
                    <p><?php _e('Write reviews in your Ultra Card to see them here!', 'ultra-card-integration'); ?></p>
                </div>
            <?php else: ?>
                <div class="reviews-list">
                    <?php 
                    $items_per_page = isset($settings['items_per_page']) ? $settings['items_per_page'] : 5;
                    $paged_reviews = array_slice($reviews, 0, $items_per_page);
                    
                    foreach ($paged_reviews as $review): 
                    ?>
                        <div class="review-item">
                            <div class="review-header">
                                <h4><?php echo esc_html($review['title']); ?></h4>
                                <?php if (isset($settings['show_ratings']) && $settings['show_ratings'] && $review['rating']): ?>
                                    <div class="review-rating">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <i class="fas fa-star <?php echo $i <= $review['rating'] ? 'filled' : 'empty'; ?>"></i>
                                        <?php endfor; ?>
                                        <span class="rating-text"><?php echo $review['rating']; ?>/5</span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <div class="review-content">
                                <p><?php echo esc_html($review['content']); ?></p>
                            </div>
                            <div class="review-meta">
                                <span class="review-date"><?php echo date('M j, Y', strtotime($review['created_at'])); ?></span>
                                <button class="btn btn-sm btn-danger" onclick="deleteUltraReview(<?php echo $review['id']; ?>)">
                                    <i class="fas fa-trash"></i> <?php _e('Delete', 'ultra-card-integration'); ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        
        <style>
        .ultra-card-reviews-panel .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #0073aa;
        }
        .ultra-card-reviews-panel .reviews-count {
            background: #0073aa;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
        }
        .ultra-card-reviews-panel .review-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            background: #f9f9f9;
        }
        .ultra-card-reviews-panel .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .ultra-card-reviews-panel .review-rating .fa-star.filled {
            color: #ffc107;
        }
        .ultra-card-reviews-panel .review-rating .fa-star.empty {
            color: #ddd;
        }
        .ultra-card-reviews-panel .rating-text {
            margin-left: 8px;
            font-weight: bold;
            color: #666;
        }
        .ultra-card-reviews-panel .review-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
        }
        </style>
        
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
        
        return ob_get_clean();
    }
    
    private function _getUserReviews($user_id)
    {
        $reviews = get_posts([
            'post_type' => 'ultra_review',
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ]);
        
        $formatted_reviews = [];
        foreach ($reviews as $review) {
            $meta = get_post_meta($review->ID);
            $formatted_reviews[] = [
                'id' => $review->ID,
                'title' => $review->post_title,
                'content' => $review->post_content,
                'rating' => isset($meta['rating'][0]) ? intval($meta['rating'][0]) : 0,
                'created_at' => $review->post_date,
            ];
        }
        
        return $formatted_reviews;
    }
}