import { FavoriteRow, CardRow } from '../types';
import { ucCloudSyncService } from './uc-cloud-sync-service';

/**
 * Service for managing favorite rows that users can save and reuse
 */
class UcFavoritesService {
  private static readonly STORAGE_KEY = 'ultra-card-favorites';
  private static readonly SYNC_EVENT = 'ultra-card-favorites-changed';

  private _favorites: FavoriteRow[] = [];
  private _listeners: Set<(favorites: FavoriteRow[]) => void> = new Set();

  constructor() {
    this._loadFromStorage();
    this._setupStorageListener();
  }

  /**
   * Get all favorite rows
   */
  getFavorites(): FavoriteRow[] {
    return [...this._favorites].sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  }

  /**
   * Add a row to favorites
   */
  addFavorite(row: CardRow, name: string, description?: string, tags: string[] = []): FavoriteRow {
    // Deep clone the row and regenerate IDs to avoid conflicts
    const clonedRow = this._cloneRowWithNewIds(row);

    const newFavorite: FavoriteRow = {
      id: this._generateId(),
      name: name.trim(),
      description: description?.trim(),
      row: clonedRow,
      created: new Date().toISOString(),
      tags: tags.map(tag => tag.trim().toLowerCase()).filter(Boolean),
    };

    this._favorites.push(newFavorite);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();

    // Queue for cloud sync
    ucCloudSyncService.queueChange('favorite', 'create', newFavorite);

    return newFavorite;
  }

  /**
   * Remove a favorite
   */
  removeFavorite(id: string): boolean {
    const index = this._favorites.findIndex(f => f.id === id);
    if (index === -1) return false;

    const removedFavorite = this._favorites[index];
    this._favorites.splice(index, 1);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();

    // Queue for cloud sync
    ucCloudSyncService.queueChange('favorite', 'delete', { id });

    return true;
  }

  /**
   * Update a favorite
   */
  updateFavorite(
    id: string,
    updates: Partial<Pick<FavoriteRow, 'name' | 'description' | 'tags'>>
  ): boolean {
    const index = this._favorites.findIndex(f => f.id === id);
    if (index === -1) return false;

    this._favorites[index] = {
      ...this._favorites[index],
      ...updates,
    };

    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return true;
  }

  /**
   * Get a favorite by ID
   */
  getFavorite(id: string): FavoriteRow | undefined {
    return this._favorites.find(f => f.id === id);
  }

  /**
   * Search favorites by name or tags
   */
  searchFavorites(query: string): FavoriteRow[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.getFavorites();

    return this._favorites.filter(
      favorite =>
        favorite.name.toLowerCase().includes(searchTerm) ||
        favorite.description?.toLowerCase().includes(searchTerm) ||
        favorite.tags.some(tag => tag.includes(searchTerm))
    );
  }

  /**
   * Subscribe to favorites changes
   */
  subscribe(callback: (favorites: FavoriteRow[]) => void): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Debug method to help diagnose favorites issues
   */
  debugFavorites(): void {
    console.log('=== Ultra Card Favorites Debug Info ===');
    console.log('Storage Key:', UcFavoritesService.STORAGE_KEY);
    console.log('Current Favorites Count:', this._favorites.length);
    console.log('Listeners Count:', this._listeners.size);
    console.log('LocalStorage Available:', this._isLocalStorageAvailable());

    try {
      const stored = localStorage.getItem(UcFavoritesService.STORAGE_KEY);
      console.log('Raw Storage Data:', stored ? `${stored.length} characters` : 'null');
      console.log('Storage Data Valid:', stored ? 'Valid JSON' : 'No data');

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed Data Type:', Array.isArray(parsed) ? 'Array' : typeof parsed);
        console.log('Parsed Data Length:', Array.isArray(parsed) ? parsed.length : 'N/A');
      }
    } catch (error) {
      console.error('Storage Data Error:', error);
    }

    console.log(
      'Favorites List:',
      this._favorites.map(f => ({
        id: f.id,
        name: f.name,
        created: f.created,
        tags: f.tags.length,
      }))
    );
    console.log('=====================================');
  }

  /**
   * Clone a row with new IDs to avoid conflicts when adding to layout
   */
  private _cloneRowWithNewIds(row: CardRow): CardRow {
    const cloned = JSON.parse(JSON.stringify(row));

    // Generate new row ID
    cloned.id = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate new column IDs
    cloned.columns = cloned.columns.map((column: any, colIndex: number) => ({
      ...column,
      id: `col-${Date.now()}-${colIndex}-${Math.random().toString(36).substr(2, 9)}`,
      modules: column.modules.map((module: any, moduleIndex: number) => ({
        ...module,
        id: `${module.type}-${Date.now()}-${moduleIndex}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }));

    return cloned;
  }

  private _generateId(): string {
    return `favorite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private _loadFromStorage(): void {
    try {
      // Check if localStorage is available
      if (!this._isLocalStorageAvailable()) {
        console.warn('localStorage is not available, favorites will not persist');
        this._favorites = [];
        return;
      }

      const stored = localStorage.getItem(UcFavoritesService.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this._favorites = parsed.filter(this._isValidFavorite.bind(this));
          console.log(`Loaded ${this._favorites.length} favorites from storage`);
        } else {
          console.warn('Invalid favorites data format in storage, resetting');
          this._favorites = [];
        }
      } else {
        console.log('No favorites found in storage');
        this._favorites = [];
      }
    } catch (error) {
      console.error('Failed to load favorites from storage:', error);
      this._favorites = [];
    }
  }

  private _saveToStorage(): void {
    try {
      // Check if localStorage is available
      if (!this._isLocalStorageAvailable()) {
        console.warn('localStorage is not available, favorites will not be saved');
        return;
      }

      const dataToSave = JSON.stringify(this._favorites);
      localStorage.setItem(UcFavoritesService.STORAGE_KEY, dataToSave);
      console.log(`Saved ${this._favorites.length} favorites to storage`);
    } catch (error) {
      console.error('Failed to save favorites to storage:', error);

      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.code === DOMException.QUOTA_EXCEEDED_ERR) {
        console.error(
          'localStorage quota exceeded! Consider clearing old data or using fewer favorites.'
        );
        this._handleStorageQuotaExceeded();
      } else {
        console.error('Unknown storage error:', error);
      }
    }
  }

  private _setupStorageListener(): void {
    window.addEventListener('storage', event => {
      if (event.key === UcFavoritesService.STORAGE_KEY) {
        this._loadFromStorage();
        this._notifyListeners();
      }
    });

    window.addEventListener(UcFavoritesService.SYNC_EVENT, () => {
      this._loadFromStorage();
      this._notifyListeners();
    });
  }

  private _notifyListeners(): void {
    this._listeners.forEach(callback => callback(this.getFavorites()));
  }

  private _broadcastChange(): void {
    window.dispatchEvent(new CustomEvent(UcFavoritesService.SYNC_EVENT));
  }

  private _isValidFavorite(favorite: any): favorite is FavoriteRow {
    return (
      favorite &&
      typeof favorite.id === 'string' &&
      typeof favorite.name === 'string' &&
      typeof favorite.created === 'string' &&
      favorite.row &&
      typeof favorite.row.id === 'string' &&
      Array.isArray(favorite.row.columns)
    );
  }

  /**
   * Check if localStorage is available and working
   */
  private _isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__ultra_card_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle storage quota exceeded by cleaning up old favorites
   */
  private _handleStorageQuotaExceeded(): void {
    console.log('Attempting to free up storage space by removing oldest favorites...');

    if (this._favorites.length <= 1) {
      console.error('Cannot free up space - only one or no favorites exist');
      return;
    }

    // Remove oldest 25% of favorites to free up space
    const favoritesToRemove = Math.max(1, Math.floor(this._favorites.length * 0.25));
    const sortedFavorites = [...this._favorites].sort(
      (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
    );

    // Remove oldest favorites
    const favoritesToKeep = sortedFavorites.slice(favoritesToRemove);
    this._favorites = favoritesToKeep;

    console.log(`Removed ${favoritesToRemove} oldest favorites to free up storage space`);

    // Try to save again
    try {
      const dataToSave = JSON.stringify(this._favorites);
      localStorage.setItem(UcFavoritesService.STORAGE_KEY, dataToSave);
      console.log('Successfully saved favorites after cleanup');
      this._notifyListeners();
      this._broadcastChange();
    } catch (error) {
      console.error('Still cannot save after cleanup:', error);
    }
  }
}

// Export singleton instance
export const ucFavoritesService = new UcFavoritesService();

// Make debug method available globally for troubleshooting
if (typeof window !== 'undefined') {
  (window as any).debugUltraCardFavorites = () => ucFavoritesService.debugFavorites();
}
