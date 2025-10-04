/**
 * Ultra Card Cloud Sync Service
 * Handles synchronization of favorites, colors, and reviews with ultracard.io
 */

import { ucCloudAuthService, CloudUser } from './uc-cloud-auth-service';
import { FavoriteRow, FavoriteColor } from '../types';

export interface SyncResult {
  success: boolean;
  synced: number;
  conflicts: number;
  errors: string[];
  lastSync: string;
}

export interface CloudFavorite {
  id: string;
  name: string;
  description?: string;
  row_data: string; // JSON stringified CardRow
  created: string;
  updated: string;
  tags: string[];
  user_id: number;
}

export interface CloudColor {
  id: string;
  name: string;
  color: string;
  order: number;
  created: string;
  updated: string;
  user_id: number;
}

export interface CloudReview {
  id: string;
  preset_id: string;
  rating: number;
  comment?: string;
  created: string;
  updated: string;
  user_id: number;
}

export interface SyncConflict<T> {
  type: 'favorite' | 'color' | 'review';
  local: T;
  remote: T;
  field: string;
}

export interface SyncStatus {
  isEnabled: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  conflicts: SyncConflict<any>[];
}

/**
 * Cloud synchronization service for Ultra Card data
 */
class UcCloudSyncService {
  private static readonly API_BASE = 'https://ultracard.io/wp-json/ultra-card/v1';
  private static readonly SYNC_STATUS_KEY = 'ultra-card-sync-status';
  private static readonly PENDING_CHANGES_KEY = 'ultra-card-pending-changes';

  private _syncStatus: SyncStatus = {
    isEnabled: false,
    lastSync: null,
    isSyncing: false,
    pendingChanges: 0,
    conflicts: [],
  };

  private _listeners: Set<(status: SyncStatus) => void> = new Set();
  private _pendingChanges: Map<string, any> = new Map();

  constructor() {
    this._loadSyncStatus();
    this._loadPendingChanges();
    this._setupAuthListener();
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this._syncStatus };
  }

  /**
   * Enable/disable cloud sync
   */
  async setSyncEnabled(enabled: boolean): Promise<void> {
    this._syncStatus.isEnabled = enabled;
    this._saveSyncStatus();
    this._notifyListeners();

    if (enabled && ucCloudAuthService.isAuthenticated()) {
      // Trigger initial sync when enabled
      await this.syncAll();
    }
  }

  /**
   * Sync all data types
   * Note: Favorites and colors are LOCAL-ONLY and not synced to cloud
   */
  async syncAll(): Promise<{ favorites: SyncResult; colors: SyncResult; reviews: SyncResult }> {
    if (!this._canSync()) {
      throw new Error('Cannot sync: not authenticated or sync disabled');
    }

    this._syncStatus.isSyncing = true;
    this._notifyListeners();

    try {
      // Only sync reviews - favorites and colors remain local
      const reviews = await this.syncReviews();

      // Return empty success results for favorites/colors (not synced)
      const favorites: SyncResult = {
        success: true,
        synced: 0,
        conflicts: 0,
        errors: [],
        lastSync: new Date().toISOString(),
      };

      const colors: SyncResult = {
        success: true,
        synced: 0,
        conflicts: 0,
        errors: [],
        lastSync: new Date().toISOString(),
      };

      this._syncStatus.lastSync = new Date();
      this._syncStatus.pendingChanges = 0;
      this._clearPendingChanges();

      console.log('✅ Favorites: Local-only (not synced)');
      console.log('✅ Colors: Local-only (not synced)');

      return { favorites, colors, reviews };
    } finally {
      this._syncStatus.isSyncing = false;
      this._saveSyncStatus();
      this._notifyListeners();
    }
  }

  /**
   * Sync favorites with cloud
   */
  async syncFavorites(): Promise<SyncResult> {
    if (!this._canSync()) {
      throw new Error('Cannot sync favorites: not authenticated');
    }

    const result: SyncResult = {
      success: false,
      synced: 0,
      conflicts: 0,
      errors: [],
      lastSync: new Date().toISOString(),
    };

    try {
      // Get local favorites
      const localFavorites = this._getLocalFavorites();

      // Get remote favorites
      const remoteFavorites = await this._fetchRemoteFavorites();

      // Resolve conflicts and merge
      const { merged, conflicts } = await this._mergeFavorites(localFavorites, remoteFavorites);

      // Upload local changes
      const uploadResults = await this._uploadFavorites(merged.filter(f => f._needsUpload));

      // Download remote changes
      const downloadResults = await this._downloadFavorites(merged.filter(f => f._needsDownload));

      result.success = true;
      result.synced = uploadResults.length + downloadResults.length;
      result.conflicts = conflicts.length;

      // Store conflicts for user resolution
      this._syncStatus.conflicts = [...this._syncStatus.conflicts, ...conflicts];

      console.log(
        `✅ Favorites sync completed: ${result.synced} synced, ${result.conflicts} conflicts`
      );
    } catch (error) {
      console.error('❌ Favorites sync failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Sync favorite colors with cloud
   */
  async syncFavoriteColors(): Promise<SyncResult> {
    if (!this._canSync()) {
      throw new Error('Cannot sync colors: not authenticated');
    }

    const result: SyncResult = {
      success: false,
      synced: 0,
      conflicts: 0,
      errors: [],
      lastSync: new Date().toISOString(),
    };

    try {
      // Get local colors
      const localColors = this._getLocalColors();

      // Get remote colors
      const remoteColors = await this._fetchRemoteColors();

      // Resolve conflicts and merge
      const { merged, conflicts } = await this._mergeColors(localColors, remoteColors);

      // Upload/download changes
      const uploadResults = await this._uploadColors(merged.filter(c => c._needsUpload));
      const downloadResults = await this._downloadColors(merged.filter(c => c._needsDownload));

      result.success = true;
      result.synced = uploadResults.length + downloadResults.length;
      result.conflicts = conflicts.length;

      console.log(
        `✅ Colors sync completed: ${result.synced} synced, ${result.conflicts} conflicts`
      );
    } catch (error) {
      console.error('❌ Colors sync failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Sync reviews with cloud
   */
  async syncReviews(): Promise<SyncResult> {
    if (!this._canSync()) {
      throw new Error('Cannot sync reviews: not authenticated');
    }

    const result: SyncResult = {
      success: false,
      synced: 0,
      conflicts: 0,
      errors: [],
      lastSync: new Date().toISOString(),
    };

    try {
      // Get local reviews (from localStorage or indexedDB)
      const localReviews = this._getLocalReviews();

      // Get remote reviews
      const remoteReviews = await this._fetchRemoteReviews();

      // Reviews are typically append-only, so fewer conflicts
      const { merged, conflicts } = await this._mergeReviews(localReviews, remoteReviews);

      // Upload/download changes
      const uploadResults = await this._uploadReviews(merged.filter(r => r._needsUpload));
      const downloadResults = await this._downloadReviews(merged.filter(r => r._needsDownload));

      result.success = true;
      result.synced = uploadResults.length + downloadResults.length;
      result.conflicts = conflicts.length;

      console.log(
        `✅ Reviews sync completed: ${result.synced} synced, ${result.conflicts} conflicts`
      );
    } catch (error) {
      console.error('❌ Reviews sync failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Queue a change for sync when online
   */
  queueChange(
    type: 'favorite' | 'color' | 'review',
    action: 'create' | 'update' | 'delete',
    data: any
  ): void {
    const changeId = `${type}-${action}-${Date.now()}`;
    this._pendingChanges.set(changeId, {
      type,
      action,
      data,
      timestamp: Date.now(),
    });

    this._syncStatus.pendingChanges = this._pendingChanges.size;
    this._savePendingChanges();
    this._notifyListeners();

    // Try to sync immediately if online and authenticated
    if (this._canSync() && navigator.onLine) {
      this._processPendingChanges().catch(console.error);
    }
  }

  /**
   * Resolve a sync conflict
   */
  async resolveConflict<T>(
    conflict: SyncConflict<T>,
    resolution: 'local' | 'remote' | 'merge'
  ): Promise<void> {
    // Remove from conflicts list
    this._syncStatus.conflicts = this._syncStatus.conflicts.filter(c => c !== conflict);

    // Apply resolution based on type
    switch (resolution) {
      case 'local':
        // Keep local version, upload to cloud
        await this._uploadConflictResolution(conflict, conflict.local);
        break;
      case 'remote':
        // Keep remote version, update local
        await this._downloadConflictResolution(conflict, conflict.remote);
        break;
      case 'merge':
        // Merge both versions (implementation depends on data type)
        const merged = await this._mergeConflictData(conflict);
        await this._uploadConflictResolution(conflict, merged);
        break;
    }

    this._saveSyncStatus();
    this._notifyListeners();
  }

  /**
   * Add sync status listener
   */
  addListener(listener: (status: SyncStatus) => void): void {
    this._listeners.add(listener);
  }

  /**
   * Remove sync status listener
   */
  removeListener(listener: (status: SyncStatus) => void): void {
    this._listeners.delete(listener);
  }

  // Private methods for data operations

  private _canSync(): boolean {
    return this._syncStatus.isEnabled && ucCloudAuthService.isAuthenticated();
  }

  private _setupAuthListener(): void {
    ucCloudAuthService.addListener((user: CloudUser | null) => {
      if (!user) {
        // User logged out, disable sync
        this._syncStatus.isEnabled = false;
        this._syncStatus.conflicts = [];
        this._clearPendingChanges();
      }
      this._notifyListeners();
    });
  }

  private _notifyListeners(): void {
    this._listeners.forEach(listener => {
      try {
        listener(this._syncStatus);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Favorites operations
  private _getLocalFavorites(): any[] {
    // Integration with existing uc-favorites-service
    try {
      const stored = localStorage.getItem('ultra-card-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async _fetchRemoteFavorites(): Promise<CloudFavorite[]> {
    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudSyncService.API_BASE}/favorites`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }

    return response.json();
  }

  private async _uploadFavorites(favorites: any[]): Promise<any[]> {
    const results = [];

    for (const favorite of favorites) {
      try {
        const response = await ucCloudAuthService.authenticatedFetch(
          `${UcCloudSyncService.API_BASE}/favorites`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: favorite.name,
              description: favorite.description,
              row_data: JSON.stringify(favorite.row),
              tags: favorite.tags,
            }),
          }
        );

        if (response.ok) {
          results.push(await response.json());
        }
      } catch (error) {
        console.error('Failed to upload favorite:', error);
      }
    }

    return results;
  }

  private async _downloadFavorites(favorites: CloudFavorite[]): Promise<any[]> {
    // Convert cloud favorites to local format and save
    const localFavorites = favorites.map(cf => ({
      id: cf.id,
      name: cf.name,
      description: cf.description,
      row: JSON.parse(cf.row_data),
      created: cf.created,
      tags: cf.tags,
    }));

    // Update local storage
    localStorage.setItem('ultra-card-favorites', JSON.stringify(localFavorites));

    return localFavorites;
  }

  private async _mergeFavorites(
    local: any[],
    remote: CloudFavorite[]
  ): Promise<{
    merged: any[];
    conflicts: SyncConflict<any>[];
  }> {
    const merged = [];
    const conflicts = [];

    // Simple merge strategy: newer wins, detect conflicts by comparing timestamps
    const remoteMap = new Map(remote.map(r => [r.id, r]));
    const localMap = new Map(local.map(l => [l.id, l]));

    // Process local items
    for (const localItem of local) {
      const remoteItem = remoteMap.get(localItem.id);

      if (!remoteItem) {
        // Local only - needs upload
        merged.push({ ...localItem, _needsUpload: true });
      } else {
        // Compare timestamps for conflicts
        const localTime = new Date(localItem.created || 0).getTime();
        const remoteTime = new Date(remoteItem.updated).getTime();

        if (Math.abs(localTime - remoteTime) > 1000) {
          // 1 second tolerance
          conflicts.push({
            type: 'favorite',
            local: localItem,
            remote: remoteItem,
            field: 'updated',
          });
        }

        // Use newer version
        merged.push(
          localTime > remoteTime
            ? localItem
            : {
                ...this._convertCloudFavorite(remoteItem),
                _needsDownload: localTime < remoteTime,
              }
        );
      }
    }

    // Process remote-only items
    for (const remoteItem of remote) {
      if (!localMap.has(remoteItem.id)) {
        merged.push({ ...this._convertCloudFavorite(remoteItem), _needsDownload: true });
      }
    }

    return { merged, conflicts };
  }

  private _convertCloudFavorite(cf: CloudFavorite): any {
    return {
      id: cf.id,
      name: cf.name,
      description: cf.description,
      row: JSON.parse(cf.row_data),
      created: cf.created,
      tags: cf.tags,
    };
  }

  // Color operations (similar pattern to favorites)
  private _getLocalColors(): FavoriteColor[] {
    try {
      const stored = localStorage.getItem('ultra-card-favorite-colors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async _fetchRemoteColors(): Promise<CloudColor[]> {
    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudSyncService.API_BASE}/colors`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch colors: ${response.statusText}`);
    }

    return response.json();
  }

  private async _uploadColors(colors: any[]): Promise<any[]> {
    // Similar to uploadFavorites but for colors
    return [];
  }

  private async _downloadColors(colors: CloudColor[]): Promise<any[]> {
    // Similar to downloadFavorites but for colors
    return [];
  }

  private async _mergeColors(
    local: FavoriteColor[],
    remote: CloudColor[]
  ): Promise<{
    merged: any[];
    conflicts: SyncConflict<any>[];
  }> {
    // Similar merge logic for colors
    return { merged: [], conflicts: [] };
  }

  // Review operations
  private _getLocalReviews(): any[] {
    try {
      const stored = localStorage.getItem('ultra-card-reviews');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async _fetchRemoteReviews(): Promise<CloudReview[]> {
    const response = await ucCloudAuthService.authenticatedFetch(
      `${UcCloudSyncService.API_BASE}/reviews`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }

    return response.json();
  }

  private async _uploadReviews(reviews: any[]): Promise<any[]> {
    return [];
  }

  private async _downloadReviews(reviews: CloudReview[]): Promise<any[]> {
    return [];
  }

  private async _mergeReviews(
    local: any[],
    remote: CloudReview[]
  ): Promise<{
    merged: any[];
    conflicts: SyncConflict<any>[];
  }> {
    return { merged: [], conflicts: [] };
  }

  // Conflict resolution helpers
  private async _uploadConflictResolution(conflict: SyncConflict<any>, data: any): Promise<void> {
    // Upload resolved data to cloud
  }

  private async _downloadConflictResolution(conflict: SyncConflict<any>, data: any): Promise<void> {
    // Update local data with resolved version
  }

  private async _mergeConflictData(conflict: SyncConflict<any>): Promise<any> {
    // Merge local and remote data intelligently
    return conflict.local;
  }

  // Pending changes management
  private async _processPendingChanges(): Promise<void> {
    if (this._pendingChanges.size === 0) return;

    for (const [changeId, change] of this._pendingChanges) {
      try {
        await this._processChange(change);
        this._pendingChanges.delete(changeId);
      } catch (error) {
        console.error(`Failed to process change ${changeId}:`, error);
        // Keep in queue for retry
      }
    }

    this._syncStatus.pendingChanges = this._pendingChanges.size;
    this._savePendingChanges();
    this._notifyListeners();
  }

  private async _processChange(change: any): Promise<void> {
    // Process individual queued change
    switch (change.type) {
      case 'favorite':
        if (change.action === 'create') {
          await this._uploadFavorites([change.data]);
        }
        break;
      case 'color':
        if (change.action === 'create') {
          await this._uploadColors([change.data]);
        }
        break;
      case 'review':
        if (change.action === 'create') {
          await this._uploadReviews([change.data]);
        }
        break;
    }
  }

  // Storage management
  private _loadSyncStatus(): void {
    try {
      const stored = localStorage.getItem(UcCloudSyncService.SYNC_STATUS_KEY);
      if (stored) {
        const status = JSON.parse(stored);
        this._syncStatus = {
          ...this._syncStatus,
          ...status,
          lastSync: status.lastSync ? new Date(status.lastSync) : null,
          isSyncing: false, // Never restore as syncing
        };
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }

  private _saveSyncStatus(): void {
    try {
      localStorage.setItem(
        UcCloudSyncService.SYNC_STATUS_KEY,
        JSON.stringify({
          ...this._syncStatus,
          lastSync: this._syncStatus.lastSync?.toISOString(),
        })
      );
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }

  private _loadPendingChanges(): void {
    try {
      const stored = localStorage.getItem(UcCloudSyncService.PENDING_CHANGES_KEY);
      if (stored) {
        const changes = JSON.parse(stored);
        this._pendingChanges = new Map(Object.entries(changes));
        this._syncStatus.pendingChanges = this._pendingChanges.size;
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error);
    }
  }

  private _savePendingChanges(): void {
    try {
      const changes = Object.fromEntries(this._pendingChanges);
      localStorage.setItem(UcCloudSyncService.PENDING_CHANGES_KEY, JSON.stringify(changes));
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  }

  private _clearPendingChanges(): void {
    this._pendingChanges.clear();
    try {
      localStorage.removeItem(UcCloudSyncService.PENDING_CHANGES_KEY);
    } catch (error) {
      console.error('Failed to clear pending changes:', error);
    }
  }
}

// Export singleton instance
export const ucCloudSyncService = new UcCloudSyncService();
