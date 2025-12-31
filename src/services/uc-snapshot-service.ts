/**
 * Ultra Card Snapshot Service
 *
 * Manages dashboard snapshots - daily full backups of all Ultra Cards
 * with position tracking for complete dashboard restoration.
 *
 * @author WJD Designs
 */

import { HomeAssistant } from 'custom-card-helpers';
import {
  ucDashboardScannerService,
  DashboardSnapshot,
  DashboardCard,
} from './uc-dashboard-scanner-service';
import { ucCloudAuthService } from './uc-cloud-auth-service';

// Snapshot data structure
export interface SnapshotListItem {
  id: number;
  type: 'auto' | 'manual';
  date: string;
  card_count: number;
  views_breakdown: { [key: string]: number };
  size_kb: number;
  created: string;
  created_timestamp: number;
}

export interface FullSnapshot {
  id: number;
  type: 'auto' | 'manual';
  date: string;
  created: string;
  snapshot_data: DashboardSnapshot;
}

export interface SnapshotSettings {
  enabled: boolean;
  time: string; // HH:MM format
  timezone: string;
}

export interface RestoreInstructions {
  snapshot_data: DashboardSnapshot;
  instructions: string;
  cards_by_view: { [viewTitle: string]: DashboardCard[] };
}

class UcSnapshotService {
  private hass: HomeAssistant | null = null;
  private apiBase: string = '';

  /**
   * Initialize service
   */
  initialize(hass: HomeAssistant, wordpressUrl: string): void {
    this.hass = hass;
    this.apiBase = `${wordpressUrl}/wp-json/ultra-card/v1`;

    // Initialize dashboard scanner
    ucDashboardScannerService.initialize(hass);

    // Snapshot service init log removed for cleaner console
  }

  /**
   * Create manual dashboard snapshot (Pro only)
   */
  async createSnapshot(): Promise<FullSnapshot> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to create snapshots');
    }

    const user = ucCloudAuthService.getCurrentUser();
    if (!user || user.subscription?.tier !== 'pro') {
      throw new Error('Pro subscription required to create manual snapshots');
    }

    try {
      // Scan dashboard for all Ultra Cards
      const dashboardSnapshot = await ucDashboardScannerService.scanDashboard();

      if (dashboardSnapshot.card_count === 0) {
        throw new Error('No Ultra Cards found in dashboard');
      }

      console.log(
        `📦 Captured ${dashboardSnapshot.card_count} Ultra Cards from ${dashboardSnapshot.views.length} views`
      );

      // Send to WordPress backend
      const response = await this.apiCall('/snapshots', {
        method: 'POST',
        body: JSON.stringify({
          type: 'manual',
          snapshot_data: dashboardSnapshot,
        }),
      });

      return {
        id: response.snapshot_id,
        type: 'manual',
        date: new Date().toISOString().split('T')[0],
        created: new Date().toISOString(),
        snapshot_data: dashboardSnapshot,
      };
    } catch (error) {
      console.error('❌ Failed to create snapshot:', error);
      throw error;
    }
  }

  /**
   * Create auto snapshot (triggered daily, Pro only)
   * This is typically called by a background service
   */
  async createAutoSnapshot(): Promise<void> {
    const user = ucCloudAuthService.getCurrentUser();
    if (!user || user.subscription?.tier !== 'pro') {
      console.log('⏭️ Skipping auto snapshot - not authenticated or not a Pro user');
      return;
    }

    try {
      console.log('🤖 Creating automatic daily snapshot...');

      const dashboardSnapshot = await ucDashboardScannerService.scanDashboard();

      if (dashboardSnapshot.card_count === 0) {
        console.log('⚠️ No Ultra Cards found, skipping auto snapshot');
        return;
      }

      await this.apiCall('/snapshots', {
        method: 'POST',
        body: JSON.stringify({
          type: 'auto',
          snapshot_data: dashboardSnapshot,
        }),
      });
    } catch (error) {
      console.error('❌ Auto snapshot failed:', error);
      // Don't throw - auto snapshots should fail silently
    }
  }

  /**
   * List all snapshots
   */
  async listSnapshots(limit: number = 30): Promise<SnapshotListItem[]> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view snapshots');
    }

    try {
      // Add cache-busting timestamp to prevent stale data
      // Note: Using timestamp in URL is sufficient; custom headers cause CORS issues
      const timestamp = Date.now();
      console.log(`📋 Fetching snapshot list with cache-busting timestamp: ${timestamp}`);

      const response = await this.apiCall(`/snapshots?limit=${limit}&_=${timestamp}`, {
        method: 'GET',
      });

      return response as SnapshotListItem[];
    } catch (error) {
      console.error('❌ Failed to list snapshots:', error);
      throw error;
    }
  }

  /**
   * Get full snapshot details with all card configs
   */
  async getSnapshot(snapshotId: number): Promise<FullSnapshot> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view snapshots');
    }

    try {
      const response = await this.apiCall(`/snapshots/${snapshotId}`, {
        method: 'GET',
      });

      return response as FullSnapshot;
    } catch (error) {
      console.error(`Failed to get snapshot ${snapshotId}:`, error);
      throw error;
    }
  }

  /**
   * Restore entire dashboard snapshot
   * Returns instructions and organized card data
   */
  async restoreSnapshot(snapshotId: number): Promise<RestoreInstructions> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to restore snapshots');
    }

    console.log(`🔄 Restoring snapshot ${snapshotId}...`);

    try {
      const response = await this.apiCall(`/snapshots/${snapshotId}/restore`, {
        method: 'POST',
      });

      const snapshot: FullSnapshot = response as any;
      const snapshotData = snapshot.snapshot_data;

      // Organize cards by view for easy restoration
      const cardsByView: { [viewTitle: string]: DashboardCard[] } = {};

      snapshotData.cards.forEach(card => {
        if (!cardsByView[card.view_title]) {
          cardsByView[card.view_title] = [];
        }
        cardsByView[card.view_title].push(card);
      });

      // Sort cards by index within each view
      Object.keys(cardsByView).forEach(viewTitle => {
        cardsByView[viewTitle].sort((a, b) => a.card_index - b.card_index);
      });

      console.log(
        `✅ Snapshot restored: ${snapshotData.card_count} cards across ${Object.keys(cardsByView).length} views`
      );

      return {
        snapshot_data: snapshotData,
        instructions: this.generateRestoreInstructions(snapshotData, cardsByView),
        cards_by_view: cardsByView,
      };
    } catch (error) {
      console.error(`Failed to restore snapshot ${snapshotId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a manual snapshot
   */
  async deleteSnapshot(snapshotId: number): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to delete snapshots');
    }

    try {
      await this.apiCall(`/snapshots/${snapshotId}`, {
        method: 'DELETE',
      });

      console.log(`🗑️ Snapshot ${snapshotId} deleted`);
    } catch (error) {
      console.error(`Failed to delete snapshot ${snapshotId}:`, error);
      throw error;
    }
  }

  /**
   * Get snapshot settings (preferences)
   */
  async getSettings(): Promise<SnapshotSettings> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view settings');
    }

    try {
      const response = await this.apiCall('/snapshot-settings', {
        method: 'GET',
      });

      return response as SnapshotSettings;
    } catch (error) {
      console.error('Failed to get snapshot settings:', error);
      throw error;
    }
  }

  /**
   * Update snapshot settings
   */
  async updateSettings(settings: Partial<SnapshotSettings>): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to update settings');
    }

    try {
      await this.apiCall('/snapshot-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Failed to update snapshot settings:', error);
      throw error;
    }
  }

  /**
   * Check if user can create snapshots (Pro check)
   */
  canCreateSnapshots(): boolean {
    const user = ucCloudAuthService.getCurrentUser();
    return user?.subscription?.tier === 'pro';
  }

  /**
   * Get dashboard preview stats (for UI display)
   */
  async getDashboardPreview(): Promise<{
    can_scan: boolean;
    ultra_card_count: number;
    view_count: number;
    estimated_size_kb: number;
  }> {
    try {
      const canScan = await ucDashboardScannerService.canScan();

      if (!canScan) {
        return {
          can_scan: false,
          ultra_card_count: 0,
          view_count: 0,
          estimated_size_kb: 0,
        };
      }

      const stats = await ucDashboardScannerService.getDashboardStats();

      // Estimate size (rough: 15KB per Ultra Card)
      const estimatedSize = stats.ultra_cards * 15;

      return {
        can_scan: true,
        ultra_card_count: stats.ultra_cards,
        view_count: stats.total_views,
        estimated_size_kb: estimatedSize,
      };
    } catch (error) {
      console.error('Failed to get dashboard preview:', error);
      return {
        can_scan: false,
        ultra_card_count: 0,
        view_count: 0,
        estimated_size_kb: 0,
      };
    }
  }

  /**
   * Generate human-readable restore instructions
   */
  private generateRestoreInstructions(
    snapshotData: DashboardSnapshot,
    cardsByView: { [viewTitle: string]: DashboardCard[] }
  ): string {
    const viewCount = Object.keys(cardsByView).length;
    const cardCount = snapshotData.card_count;

    let instructions = `This snapshot contains ${cardCount} Ultra Card${cardCount > 1 ? 's' : ''} across ${viewCount} view${viewCount > 1 ? 's' : ''}.\n\n`;
    instructions += `**Restoration Instructions:**\n\n`;

    Object.keys(cardsByView).forEach((viewTitle, index) => {
      const cards = cardsByView[viewTitle];
      instructions += `**${index + 1}. ${viewTitle}** (${cards.length} card${cards.length > 1 ? 's' : ''})\n`;

      cards.forEach((card, cardIndex) => {
        instructions += `   - Position ${card.card_index + 1}: ${card.card_name || 'Ultra Card'}\n`;
      });

      instructions += '\n';
    });

    instructions += `\n**To restore:**\n`;
    instructions += `1. Open each view in your Home Assistant dashboard\n`;
    instructions += `2. Click "Edit Dashboard" (top right)\n`;
    instructions += `3. Add or replace Ultra Cards in the positions shown above\n`;
    instructions += `4. Paste the config for each card (available in detailed view)\n`;
    instructions += `5. Save your changes\n`;

    return instructions;
  }

  /**
   * Make API call to WordPress backend
   */
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const authHeader = ucCloudAuthService.getAuthHeader();

    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    const url = `${this.apiBase}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API call failed: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const ucSnapshotService = new UcSnapshotService();
