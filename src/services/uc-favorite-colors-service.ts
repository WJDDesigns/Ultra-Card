import { FavoriteColor } from '../types';

/**
 * Service for managing favorite colors across Ultra Card instances
 * Provides cross-card synchronization using localStorage
 */
class UcFavoriteColorsService {
  private static readonly STORAGE_KEY = 'ultra-card-favorite-colors';
  private static readonly SYNC_EVENT = 'ultra-card-favorite-colors-changed';

  private _favorites: FavoriteColor[] = [];
  private _listeners: Set<(favorites: FavoriteColor[]) => void> = new Set();

  constructor() {
    this._loadFromStorage();
    this._setupStorageListener();
  }

  /**
   * Get all favorite colors, sorted by order
   */
  getFavorites(): FavoriteColor[] {
    return [...this._favorites].sort((a, b) => a.order - b.order);
  }

  /**
   * Add a new favorite color
   */
  addFavorite(name: string, color: string): FavoriteColor {
    const newFavorite: FavoriteColor = {
      id: this._generateId(),
      name: name.trim(),
      color: color,
      order: this._getNextOrder(),
    };

    this._favorites.push(newFavorite);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return newFavorite;
  }

  /**
   * Update an existing favorite color
   */
  updateFavorite(id: string, updates: Partial<Pick<FavoriteColor, 'name' | 'color'>>): boolean {
    const index = this._favorites.findIndex(f => f.id === id);
    if (index === -1) return false;

    this._favorites[index] = {
      ...this._favorites[index],
      ...updates,
      name: updates.name?.trim() || this._favorites[index].name,
    };

    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return true;
  }

  /**
   * Delete a favorite color
   */
  deleteFavorite(id: string): boolean {
    const index = this._favorites.findIndex(f => f.id === id);
    if (index === -1) return false;

    this._favorites.splice(index, 1);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return true;
  }

  /**
   * Reorder favorite colors
   */
  reorderFavorites(orderedIds: string[]): boolean {
    // Validate that all IDs exist
    const existingIds = new Set(this._favorites.map(f => f.id));
    if (
      !orderedIds.every(id => existingIds.has(id)) ||
      orderedIds.length !== this._favorites.length
    ) {
      return false;
    }

    // Update order based on new positions
    orderedIds.forEach((id, index) => {
      const favorite = this._favorites.find(f => f.id === id);
      if (favorite) {
        favorite.order = index;
      }
    });

    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return true;
  }

  /**
   * Import favorites from card config (for migration/initialization)
   */
  importFromConfig(favorites: FavoriteColor[]): void {
    if (!Array.isArray(favorites) || favorites.length === 0) {
      return;
    }

    // Merge with existing favorites, avoiding duplicates by color
    const existingColors = new Set(this._favorites.map(f => f.color.toLowerCase()));

    favorites.forEach(fav => {
      if (!existingColors.has(fav.color.toLowerCase()) && this._isValidColor(fav.color)) {
        this._favorites.push({
          id: fav.id || this._generateId(),
          name: fav.name?.trim() || 'Unnamed Color',
          color: fav.color,
          order: fav.order ?? this._getNextOrder(),
        });
      }
    });

    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
  }

  /**
   * Export favorites for card config (backward compatibility)
   */
  exportForConfig(): FavoriteColor[] {
    return this.getFavorites();
  }

  /**
   * Check if a color already exists in favorites
   */
  hasColor(color: string): boolean {
    return this._favorites.some(f => f.color.toLowerCase() === color.toLowerCase());
  }

  /**
   * Subscribe to favorite colors changes
   */
  subscribe(listener: (favorites: FavoriteColor[]) => void): () => void {
    this._listeners.add(listener);

    // Immediately notify with current state
    const currentFavorites = this.getFavorites();
    listener(currentFavorites);

    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Clear all favorite colors
   */
  clearAll(): void {
    this._favorites = [];
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
  }

  /**
   * Test method to verify service is working
   */
  testService(): void {
    console.log('UcFavoriteColorsService: Test method called');
    console.log('Current favorites:', this._favorites);
    console.log('Number of listeners:', this._listeners.size);

    // Test adding a color
    const testColor = this.addFavorite('Test Color', '#ff0000');
    console.log('Test color added:', testColor);

    // Test getting favorites
    const allFavorites = this.getFavorites();
    console.log('All favorites after test add:', allFavorites);
  }

  /**
   * Load favorites from localStorage
   */
  private _loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(UcFavoriteColorsService.STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          this._favorites = parsed.filter(this._isValidFavorite.bind(this));
        } else {
          this._favorites = [];
        }
      } else {
        this._favorites = [];
      }
    } catch (error) {
      console.warn('Failed to load favorite colors from storage:', error);
      this._favorites = [];
    }
  }

  /**
   * Save favorites to localStorage
   */
  private _saveToStorage(): void {
    try {
      localStorage.setItem(UcFavoriteColorsService.STORAGE_KEY, JSON.stringify(this._favorites));
    } catch (error) {
      console.warn('Failed to save favorite colors to storage:', error);
    }
  }

  /**
   * Setup listener for storage changes from other tabs/windows
   */
  private _setupStorageListener(): void {
    window.addEventListener('storage', e => {
      if (e.key === UcFavoriteColorsService.STORAGE_KEY) {
        this._loadFromStorage();
        this._notifyListeners();
      }
    });

    // Listen for custom events from same tab
    window.addEventListener(UcFavoriteColorsService.SYNC_EVENT, () => {
      this._loadFromStorage();
      this._notifyListeners();
    });
  }

  /**
   * Broadcast change to other Ultra Card instances in same tab
   */
  private _broadcastChange(): void {
    window.dispatchEvent(new CustomEvent(UcFavoriteColorsService.SYNC_EVENT));
  }

  /**
   * Notify all listeners of changes
   */
  private _notifyListeners(): void {
    const favorites = this.getFavorites();
    this._listeners.forEach(listener => {
      try {
        listener(favorites);
      } catch (error) {
        console.warn('Error notifying favorite colors listener:', error);
      }
    });
  }

  /**
   * Generate a unique ID for new favorites
   */
  private _generateId(): string {
    return `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get next order value for new favorites
   */
  private _getNextOrder(): number {
    if (this._favorites.length === 0) return 0;
    return Math.max(...this._favorites.map(f => f.order)) + 1;
  }

  /**
   * Validate if a favorite color object is valid
   */
  private _isValidFavorite(fav: any): fav is FavoriteColor {
    return (
      fav &&
      typeof fav.id === 'string' &&
      typeof fav.name === 'string' &&
      typeof fav.color === 'string' &&
      typeof fav.order === 'number' &&
      this._isValidColor(fav.color)
    );
  }

  /**
   * Validate if a color string is valid
   */
  private _isValidColor(color: string): boolean {
    if (!color || typeof color !== 'string') return false;

    // Check for common CSS color formats
    const colorFormats = [
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // RGBA
      /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
      /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/, // HSLA
      /^var\(--[\w-]+\)$/, // CSS variables
    ];

    // Check named colors
    const namedColors = [
      'transparent',
      'red',
      'blue',
      'green',
      'yellow',
      'orange',
      'purple',
      'pink',
      'brown',
      'black',
      'white',
      'gray',
      'grey',
      'cyan',
      'magenta',
      'lime',
      'navy',
      'teal',
      'silver',
      'maroon',
      'olive',
      'aqua',
      'fuchsia',
    ];

    return (
      colorFormats.some(format => format.test(color)) || namedColors.includes(color.toLowerCase())
    );
  }
}

// Export singleton instance
export const ucFavoriteColorsService = new UcFavoriteColorsService();

// Make service available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).ucFavoriteColorsService = ucFavoriteColorsService;
}
