<?php
/**
 * MODERN WORDPRESS DASHBOARD FOR ULTRA CARD PRO
 * 
 * Replace the render_panel_content() method in UltraCardDashboardIntegration class
 * with this beautifully styled, professional implementation.
 * 
 * Features:
 * - Modern card-based layout
 * - Professional color scheme
 * - Responsive design
 * - Clean typography
 * - Smooth interactions
 */

/**
 * Render panel content with modern styling
 */
public function render_panel_content($panel_name, $link, $settings) {
    if (!$this->cloud_sync) {
        return '<p>Ultra Card Integration service not available.</p>';
    }
    
    $user_id = get_current_user_id();
    
    try {
        $subscription = $this->cloud_sync->get_user_subscription_data($user_id);
        $backups = $this->cloud_sync->get_user_backups($user_id, 10);
        
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
            
            .ucp-create-backup-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .ucp-create-backup-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
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
                        <span class="ucp-section-icon">💾</span>
                        Your Backups
                    </h3>
                    <?php if ($subscription['tier'] === 'pro' && $subscription['snapshot_count'] < $subscription['snapshot_limit']): ?>
                        <button class="ucp-create-backup-btn" onclick="alert('Create backup from Home Assistant card editor')">
                            ➕ Create Backup
                        </button>
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
                        <?php foreach ($backups as $backup): ?>
                            <div class="ucp-backup-item">
                                <div class="ucp-backup-info">
                                    <div class="ucp-backup-name">
                                        <?php echo esc_html($backup['name']); ?>
                                        <span class="ucp-backup-badge <?php echo esc_attr($backup['type']); ?>">
                                            <?php echo esc_html($backup['type']); ?>
                                        </span>
                                    </div>
                                    <div class="ucp-backup-meta">
                                        <span class="ucp-backup-meta-item">
                                            🕐 <?php echo esc_html($backup['created']); ?>
                                        </span>
                                        <span class="ucp-backup-meta-item">
                                            📏 <?php echo esc_html($backup['size']); ?>
                                        </span>
                                        <?php if (!empty($backup['stats'])): ?>
                                            <span class="ucp-backup-meta-item">
                                                📊 <?php echo esc_html($backup['stats']); ?>
                                            </span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                                <div class="ucp-backup-actions">
                                    <button class="ucp-action-btn" onclick="viewBackup(<?php echo $backup['id']; ?>)">
                                        👁️ View
                                    </button>
                                    <button class="ucp-action-btn primary" onclick="downloadBackup(<?php echo $backup['id']; ?>)">
                                        ⬇️ Download
                                    </button>
                                    <?php if ($backup['type'] === 'snapshot'): ?>
                                        <button class="ucp-action-btn danger" onclick="deleteBackup(<?php echo $backup['id']; ?>)">
                                            🗑️ Delete
                                        </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        
        <script>
        function viewBackup(id) {
            // Implement view backup functionality
            alert('View backup #' + id);
        }
        
        function downloadBackup(id) {
            // Implement download backup functionality
            window.location.href = '<?php echo rest_url('ultra-card/v1/backups/'); ?>' + id + '/download';
        }
        
        function deleteBackup(id) {
            if (confirm('Are you sure you want to delete this backup? This cannot be undone.')) {
                // Implement delete backup functionality
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
        
    } catch (Exception $e) {
        error_log('Ultra Card dashboard render error: ' . $e->getMessage());
        return '<p>Error loading dashboard: ' . esc_html($e->getMessage()) . '</p>';
    }
}

