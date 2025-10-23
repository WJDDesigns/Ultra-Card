/**
 * Ultra Card Backup Service
 *
 * Manages manual single-card backups (30 per user max, FIFO deletion).
 * Users can quickly backup individual cards and restore them later.
 *
 * @author WJD Designs
 */

import { UltraCardConfig } from '../types';
import { ucCloudAuthService } from './uc-cloud-auth-service';

// Card backup data structure
export interface CardBackup {
  id: number;
  card_name: string;
  stats: {
    row_count: number;
    column_count: number;
    module_count: number;
  };
  size_kb: number;
  created: string;
  created_timestamp: number;
}

export interface FullCardBackup extends CardBackup {
  config: UltraCardConfig;
  view_info?: {
    view_id?: string;
    view_title?: string;
    card_index?: number;
  };
}

class UcCardBackupService {
  private apiBase: string = '';

  /**
   * Initialize service
   */
  initialize(wordpressUrl: string): void {
    this.apiBase = `${wordpressUrl}/wp-json/ultra-card/v1`;
    // Card backup init log removed for cleaner console
  }

  /**
   * Create manual backup of current card (Pro only)
   */
  async createBackup(
    config: UltraCardConfig,
    name?: string,
    viewInfo?: { view_id?: string; view_title?: string; card_index?: number }
  ): Promise<CardBackup> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to create backups');
    }

    const user = ucCloudAuthService.getCurrentUser();
    if (!user || user.subscription?.tier !== 'pro') {
      throw new Error('Pro subscription required to create card backups');
    }

    // Auto-generate name if not provided
    const cardName = name || this.generateCardName(config);

    console.log(`💾 Creating card backup: "${cardName}"...`);

    try {
      const response = await this.apiCall('/card-backups', {
        method: 'POST',
        body: JSON.stringify({
          config: config,
          card_name: cardName,
          view_info: viewInfo || {},
        }),
      });

      return {
        id: response.backup_id,
        card_name: cardName,
        stats: this.calculateStats(config),
        size_kb: this.estimateSize(config),
        created: new Date().toISOString(),
        created_timestamp: Date.now(),
      };
    } catch (error) {
      console.error('❌ Failed to create card backup:', error);
      throw error;
    }
  }

  /**
   * List all card backups
   */
  async listBackups(limit: number = 30): Promise<CardBackup[]> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view backups');
    }

    try {
      const response = await this.apiCall(`/card-backups?limit=${limit}`, {
        method: 'GET',
      });

      return response as CardBackup[];
    } catch (error) {
      console.error('Failed to list card backups:', error);
      throw error;
    }
  }

  /**
   * Get single backup with full config
   */
  async getBackup(backupId: number): Promise<FullCardBackup> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view backups');
    }

    try {
      const response = await this.apiCall(`/card-backups/${backupId}`, {
        method: 'GET',
      });

      return response as FullCardBackup;
    } catch (error) {
      console.error(`Failed to get backup ${backupId}:`, error);
      throw error;
    }
  }

  /**
   * Restore card backup (returns config)
   */
  async restoreBackup(backupId: number): Promise<UltraCardConfig> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to restore backups');
    }

    console.log(`🔄 Restoring card backup ${backupId}...`);

    try {
      const response = await this.apiCall(`/card-backups/${backupId}/restore`, {
        method: 'POST',
      });

      return response.config as UltraCardConfig;
    } catch (error) {
      console.error(`Failed to restore backup ${backupId}:`, error);
      throw error;
    }
  }

  /**
   * Delete card backup
   */
  async deleteBackup(backupId: number): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to delete backups');
    }

    try {
      await this.apiCall(`/card-backups/${backupId}`, {
        method: 'DELETE',
      });

      console.log(`🗑️ Card backup ${backupId} deleted`);
    } catch (error) {
      console.error(`Failed to delete backup ${backupId}:`, error);
      throw error;
    }
  }

  /**
   * Rename card backup
   */
  async renameBackup(backupId: number, newName: string): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Must be logged in to rename backups');
    }

    if (!newName || newName.trim() === '') {
      throw new Error('Backup name cannot be empty');
    }

    try {
      await this.apiCall(`/card-backups/${backupId}`, {
        method: 'PUT',
        body: JSON.stringify({
          card_name: newName.trim(),
        }),
      });

      console.log(`✏️ Card backup ${backupId} renamed to "${newName}"`);
    } catch (error) {
      console.error(`Failed to rename backup ${backupId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user can create card backups (Pro check)
   */
  canCreateBackups(): boolean {
    const user = ucCloudAuthService.getCurrentUser();
    return user?.subscription?.tier === 'pro';
  }

  /**
   * Get backup count and limit info
   */
  async getBackupInfo(): Promise<{
    current: number;
    limit: number;
    remaining: number;
  }> {
    if (!ucCloudAuthService.isAuthenticated()) {
      return { current: 0, limit: 30, remaining: 30 };
    }

    try {
      const backups = await this.listBackups();
      const limit = 30;
      const current = backups.length;
      const remaining = Math.max(0, limit - current);

      return { current, limit, remaining };
    } catch (error) {
      console.error('Failed to get backup info:', error);
      return { current: 0, limit: 30, remaining: 30 };
    }
  }

  /**
   * Download backup as JSON file
   */
  downloadBackup(backup: FullCardBackup): void {
    const json = JSON.stringify(backup.config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.card_name.replace(/[^a-z0-9]/gi, '_')}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`⬇️ Downloaded backup: ${backup.card_name}`);
  }

  /**
   * Generate auto card name from config
   */
  private generateCardName(config: UltraCardConfig): string {
    // Try to use card_name if available
    if (config.card_name) {
      return config.card_name;
    }

    // Fallback to timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    return `Ultra Card - ${timestamp}`;
  }

  /**
   * Calculate card statistics
   */
  private calculateStats(config: UltraCardConfig): {
    row_count: number;
    column_count: number;
    module_count: number;
  } {
    const rows = config.layout?.rows || [];
    let columnCount = 0;
    let moduleCount = 0;

    rows.forEach(row => {
      const columns = row.columns || [];
      columnCount += columns.length;

      columns.forEach(column => {
        const modules = column.modules || [];
        moduleCount += modules.length;
      });
    });

    return {
      row_count: rows.length,
      column_count: columnCount,
      module_count: moduleCount,
    };
  }

  /**
   * Estimate config size in KB
   */
  private estimateSize(config: UltraCardConfig): number {
    const json = JSON.stringify(config);
    return Math.round((json.length / 1024) * 100) / 100;
  }

  /**
   * Title case helper
   */
  private titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
export const ucCardBackupService = new UcCardBackupService();
