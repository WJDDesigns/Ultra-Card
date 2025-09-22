import { FavoriteRow, CardRow } from '../types';

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
    return newFavorite;
  }

  /**
   * Remove a favorite
   */
  removeFavorite(id: string): boolean {
    const index = this._favorites.findIndex(f => f.id === id);
    if (index === -1) return false;

    this._favorites.splice(index, 1);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
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
      const stored = localStorage.getItem(UcFavoritesService.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this._favorites = parsed.filter(this._isValidFavorite.bind(this));
        }
      }
    } catch (error) {
      console.warn('Failed to load favorites from storage:', error);
      this._favorites = [];
    }
  }

  private _saveToStorage(): void {
    try {
      localStorage.setItem(UcFavoritesService.STORAGE_KEY, JSON.stringify(this._favorites));
    } catch (error) {
      console.warn('Failed to save favorites to storage:', error);
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
}

// Export singleton instance
export const ucFavoritesService = new UcFavoritesService();
