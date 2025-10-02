/**
 * Ultra Card Cloud Backup Service
 * Handles automatic backups, snapshots, version history, and smart sync
 */

import { ucCloudAuthService, CloudUser, UserSubscription } from './uc-cloud-auth-service';
import { UltraCardConfig } from '../types';

export interface CardStats {
  row_count: number;
  column_count: number;
  module_count: number;
}

export interface CloudBackup {
  id: number;
  type: 'auto' | 'snapshot';
  version_number: number;
  snapshot_name?: string;
  snapshot_description?: string;
  config: UltraCardConfig;
  config_hash: string;
  card_stats: CardStats;
  created: string;
  device_info: string;
  user_id: number;
  restore_count?: number;
}

export interface BackupListItem {
  id: number;
  type: 'auto' | 'snapshot';
  version_number: number;
  snapshot_name?: string;
  snapshot_description?: string;
  created: string;
  size_kb: number;
  card_stats: CardStats;
  device_info: string;
  restore_count?: number;
}

export interface BackupListResponse {
  backups: BackupListItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface BackupStatus {
  lastBackup: Date | null;
  isSaving: boolean;
  pendingBackup: boolean;
  error: string | null;
}

/**
 * Cloud backup service for Ultra Card
 * Manages automatic backups and manual snapshots
 */
class UcCloudBackupService {
  private static readonly API_BASE = 'https://ultracard.io/wp-json/ultra-card/v1';
  private static readonly AUTO_SAVE_DEBOUNCE = 5000; // 5 seconds
  private static readonly STORAGE_KEY_LAST_BACKUP = 'ultra-card-last-backup';
  private static readonly STORAGE_KEY_PENDING = 'ultra-card-pending-backup';

  private _status: BackupStatus = {
    lastBackup: null,
    isSaving: false,
    pendingBackup: false,
    error: null,
  };

  private _listeners: Set<(status: BackupStatus) => void> = new Set();
  private _autoSaveTimer?: number;
  private _pendingConfig?: UltraCardConfig;

  constructor() {
    this._loadLastBackupTime();
    this._loadPendingBackup();
  }

  /**
   * Get current backup status
   */
  getStatus(): BackupStatus {
    return { ...this._status };
  }

  /**
   * Auto-save configuration (debounced)
   * Queues the save and executes after debounce period
   */
  async autoSave(config: UltraCardConfig): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      console.log('Auto-save skipped: not authenticated');
      return;
    }

    // Store pending config
    this._pendingConfig = config;
    this._status.pendingBackup = true;
    this._savePendingBackup(config);
    this._notifyListeners();

    // Clear existing timer
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
    }

    // Set new debounced save
    this._autoSaveTimer = window.setTimeout(async () => {
      if (this._pendingConfig) {
        await this._executeSave(this._pendingConfig, 'auto');
        this._pendingConfig = undefined;
        this._clearPendingBackup();
      }
    }, UcCloudBackupService.AUTO_SAVE_DEBOUNCE);
  }

  /**
   * Create a named snapshot (Pro users only)
   */
  async createSnapshot(
    config: UltraCardConfig,
    name: string,
    description?: string
  ): Promise<CloudBackup> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required to create snapshots');
    }

    const user = ucCloudAuthService.getCurrentUser();
    if (!user?.subscription?.features.snapshots_enabled) {
      throw new Error('Pro subscription required to create snapshots');
    }

    if (user.subscription.snapshot_count >= user.subscription.snapshot_limit) {
      throw new Error(
        `Maximum ${user.subscription.snapshot_limit} snapshots reached. Delete old snapshots first.`
      );
    }

    this._status.isSaving = true;
    this._notifyListeners();

    try {
      const response = await ucCloudAuthService.authenticatedFetch(
        `${UcCloudBackupService.API_BASE}/backups`,
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'snapshot',
            config: config,
            snapshot_name: name,
            snapshot_description: description,
            device_info: this._getDeviceInfo(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Create snapshot failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const backup: CloudBackup = await response.json();
      console.log(`✅ Snapshot created: ${name}`);

      this._status.lastBackup = new Date();
      this._saveLastBackupTime();

      return backup;
    } catch (error) {
      console.error('❌ Create snapshot failed:', error);
      this._status.error = error instanceof Error ? error.message : 'Create snapshot failed';
      throw error;
    } finally {
      this._status.isSaving = false;
      this._notifyListeners();
    }
  }

  /**
   * List all backups with pagination
   */
  async listBackups(
    page: number = 1,
    per_page: number = 50,
    type?: 'auto' | 'snapshot'
  ): Promise<BackupListResponse> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required to list backups');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudBackupService.API_BASE}/backups?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch backups: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get single backup with full config
   */
  async getBackup(id: number): Promise<CloudBackup> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudBackupService.API_BASE}/backups/${id}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch backup: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Restore a backup (returns the config)
   */
  async restoreBackup(id: number): Promise<UltraCardConfig> {
    const backup = await this.getBackup(id);

    // Track restore on server
    try {
      await ucCloudAuthService.authenticatedFetch(
        `${UcCloudBackupService.API_BASE}/backups/${id}/restore`,
        {
          method: 'POST',
        }
      );
    } catch (error) {
      console.warn('Failed to track restore:', error);
    }

    console.log(`✅ Backup restored: ${backup.snapshot_name || `v${backup.version_number}`}`);
    return backup.config;
  }

  /**
   * Update snapshot metadata (name/description)
   */
  async updateSnapshot(id: number, name: string, description?: string): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudBackupService.API_BASE}/backups/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          snapshot_name: name,
          snapshot_description: description,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update snapshot: ${response.statusText}`);
    }

    console.log(`✅ Snapshot updated: ${name}`);
  }

  /**
   * Delete a snapshot
   */
  async deleteSnapshot(id: number): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudBackupService.API_BASE}/backups/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete snapshot: ${response.statusText}`);
    }

    console.log(`✅ Snapshot deleted`);
  }

  /**
   * Get user subscription status
   */
  async getSubscription(): Promise<UserSubscription> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudBackupService.API_BASE}/subscription`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check for newer backup on server (smart sync)
   */
  async checkForUpdates(): Promise<CloudBackup | null> {
    if (!ucCloudAuthService.isAuthenticated()) {
      return null;
    }

    try {
      const response = await this.listBackups(1, 1);

      if (response.backups.length === 0) {
        return null;
      }

      const latestRemote = response.backups[0];
      const lastLocal = this._status.lastBackup;

      if (!lastLocal) {
        // No local backup time, fetch the latest
        return this.getBackup(latestRemote.id);
      }

      const remoteTime = new Date(latestRemote.created).getTime();
      const localTime = lastLocal.getTime();

      if (remoteTime > localTime) {
        // Newer backup found
        return this.getBackup(latestRemote.id);
      }

      return null;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }

  /**
   * Add status listener
   */
  addListener(listener: (status: BackupStatus) => void): void {
    this._listeners.add(listener);
  }

  /**
   * Remove status listener
   */
  removeListener(listener: (status: BackupStatus) => void): void {
    this._listeners.delete(listener);
  }

  /**
   * Execute the actual save operation
   */
  private async _executeSave(config: UltraCardConfig, type: 'auto'): Promise<void> {
    this._status.isSaving = true;
    this._status.pendingBackup = false;
    this._status.error = null;
    this._notifyListeners();

    try {
      const response = await ucCloudAuthService.authenticatedFetch(
        `${UcCloudBackupService.API_BASE}/backups`,
        {
          method: 'POST',
          body: JSON.stringify({
            type: type,
            config: config,
            device_info: this._getDeviceInfo(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Auto-save failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const backup: CloudBackup = await response.json();
      this._status.lastBackup = new Date(backup.created);
      this._saveLastBackupTime();

      console.log(`✅ Auto-backup saved: v${backup.version_number}`);
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      this._status.error = error instanceof Error ? error.message : 'Auto-save failed';

      // Re-queue the backup on failure
      this._pendingConfig = config;
      this._status.pendingBackup = true;
      this._savePendingBackup(config);
    } finally {
      this._status.isSaving = false;
      this._notifyListeners();
    }
  }

  /**
   * Get device/browser info
   */
  private _getDeviceInfo(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    return `${browser} on ${navigator.platform}`;
  }

  /**
   * Notify all status listeners
   */
  private _notifyListeners(): void {
    this._listeners.forEach(listener => {
      try {
        listener(this._status);
      } catch (error) {
        console.error('Error in backup listener:', error);
      }
    });
  }

  /**
   * Load last backup time from storage
   */
  private _loadLastBackupTime(): void {
    try {
      const stored = localStorage.getItem(UcCloudBackupService.STORAGE_KEY_LAST_BACKUP);
      if (stored) {
        this._status.lastBackup = new Date(stored);
      }
    } catch (error) {
      console.error('Failed to load last backup time:', error);
    }
  }

  /**
   * Save last backup time to storage
   */
  private _saveLastBackupTime(): void {
    try {
      if (this._status.lastBackup) {
        localStorage.setItem(
          UcCloudBackupService.STORAGE_KEY_LAST_BACKUP,
          this._status.lastBackup.toISOString()
        );
      }
    } catch (error) {
      console.error('Failed to save last backup time:', error);
    }
  }

  /**
   * Load pending backup from storage
   */
  private _loadPendingBackup(): void {
    try {
      const stored = localStorage.getItem(UcCloudBackupService.STORAGE_KEY_PENDING);
      if (stored) {
        this._pendingConfig = JSON.parse(stored);
        this._status.pendingBackup = true;

        // Try to save pending backup if authenticated
        if (ucCloudAuthService.isAuthenticated() && this._pendingConfig) {
          console.log('Found pending backup, attempting to save...');
          this._executeSave(this._pendingConfig, 'auto').then(() => {
            this._pendingConfig = undefined;
            this._clearPendingBackup();
          });
        }
      }
    } catch (error) {
      console.error('Failed to load pending backup:', error);
    }
  }

  /**
   * Save pending backup to storage
   */
  private _savePendingBackup(config: UltraCardConfig): void {
    try {
      localStorage.setItem(UcCloudBackupService.STORAGE_KEY_PENDING, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save pending backup:', error);
    }
  }

  /**
   * Clear pending backup from storage
   */
  private _clearPendingBackup(): void {
    try {
      localStorage.removeItem(UcCloudBackupService.STORAGE_KEY_PENDING);
    } catch (error) {
      console.error('Failed to clear pending backup:', error);
    }
  }
}

// Export singleton instance
export const ucCloudBackupService = new UcCloudBackupService();
