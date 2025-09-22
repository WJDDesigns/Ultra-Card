import { PresetDefinition, LayoutConfig } from '../types';
import { VERSION } from '../version';
import { directoriesProPresetsAPI, WordPressPreset } from './directories-pro-presets-api';

/**
 * Service for managing built-in presets, user presets, and WordPress presets
 * Built-in presets are hardcoded, user presets can be imported/exported,
 * WordPress presets are fetched from ultracard.io using Directories Pro
 */
class UcPresetsService {
  private static readonly STORAGE_KEY = 'ultra-card-presets';
  private static readonly SYNC_EVENT = 'ultra-card-presets-changed';

  private _userPresets: PresetDefinition[] = [];
  private _wordpressPresets: PresetDefinition[] = [];
  private _wordpressLoading = false;
  private _wordpressError: string | null = null;
  private _listeners: Set<(presets: PresetDefinition[]) => void> = new Set();
  private _statusListeners: Set<(status: { loading: boolean; error: string | null }) => void> =
    new Set();

  constructor() {
    this._loadFromStorage();
    this._setupStorageListener();
    // Load WordPress presets on initialization
    this._loadWordPressPresets();
  }

  /**
   * Get all presets (built-in + user presets + WordPress presets)
   */
  getAllPresets(): PresetDefinition[] {
    return [...this._getBuiltInPresets(), ...this._userPresets, ...this._wordpressPresets];
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(category: PresetDefinition['category']): PresetDefinition[] {
    const allPresets = this.getAllPresets();
    const filtered = allPresets.filter(preset => preset.category === category);
    console.log(
      `Getting presets for category "${category}":`,
      filtered.length,
      'out of',
      allPresets.length,
      'total presets'
    );
    return filtered;
  }

  /**
   * Get a specific preset by ID
   */
  getPreset(id: string): PresetDefinition | undefined {
    return this.getAllPresets().find(preset => preset.id === id);
  }

  /**
   * Add a user preset
   */
  addUserPreset(preset: Omit<PresetDefinition, 'id' | 'metadata'>): PresetDefinition {
    const newPreset: PresetDefinition = {
      ...preset,
      id: this._generateId(),
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    };

    this._userPresets.push(newPreset);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return newPreset;
  }

  /**
   * Remove a user preset
   */
  removeUserPreset(id: string): boolean {
    const index = this._userPresets.findIndex(p => p.id === id);
    if (index === -1) return false;

    this._userPresets.splice(index, 1);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return true;
  }

  /**
   * Subscribe to preset changes
   */
  subscribe(callback: (presets: PresetDefinition[]) => void): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Subscribe to WordPress preset loading status
   */
  subscribeToStatus(
    callback: (status: { loading: boolean; error: string | null }) => void
  ): () => void {
    this._statusListeners.add(callback);
    return () => this._statusListeners.delete(callback);
  }

  /**
   * Get WordPress preset loading status
   */
  getWordPressStatus(): { loading: boolean; error: string | null } {
    return {
      loading: this._wordpressLoading,
      error: this._wordpressError,
    };
  }

  /**
   * Refresh WordPress presets
   */
  async refreshWordPressPresets(): Promise<void> {
    await this._loadWordPressPresets(true);
  }

  /**
   * Get WordPress presets count
   */
  getWordPressPresetsCount(): number {
    return this._wordpressPresets.length;
  }

  /**
   * Track preset download (for WordPress presets)
   */
  async trackPresetDownload(presetId: string): Promise<void> {
    // Check if it's a WordPress preset
    if (presetId.startsWith('wp-')) {
      const wpId = parseInt(presetId.replace('wp-', ''));
      if (!isNaN(wpId)) {
        await directoriesProPresetsAPI.trackDownload(wpId);
      }
    }
  }

  /**
   * Built-in presets - removed stock presets, only WordPress presets now
   */
  private _getBuiltInPresets(): PresetDefinition[] {
    // All presets now come from WordPress - no built-in presets
    return [];
  }

  private _generateId(): string {
    return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private _loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(UcPresetsService.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this._userPresets = parsed.filter(this._isValidPreset.bind(this));
        }
      }
    } catch (error) {
      console.warn('Failed to load user presets from storage:', error);
      this._userPresets = [];
    }
  }

  private _saveToStorage(): void {
    try {
      localStorage.setItem(UcPresetsService.STORAGE_KEY, JSON.stringify(this._userPresets));
    } catch (error) {
      console.warn('Failed to save user presets to storage:', error);
    }
  }

  private _setupStorageListener(): void {
    window.addEventListener('storage', event => {
      if (event.key === UcPresetsService.STORAGE_KEY) {
        this._loadFromStorage();
        this._notifyListeners();
      }
    });

    window.addEventListener(UcPresetsService.SYNC_EVENT, () => {
      this._loadFromStorage();
      this._notifyListeners();
    });
  }

  private _notifyListeners(): void {
    const allPresets = this.getAllPresets();
    this._listeners.forEach(callback => callback(allPresets));
  }

  private _notifyStatusListeners(): void {
    const status = this.getWordPressStatus();
    this._statusListeners.forEach(callback => callback(status));
  }

  /**
   * Load WordPress presets from Directories Pro API
   */
  private async _loadWordPressPresets(force = false): Promise<void> {
    if (this._wordpressLoading && !force) return;

    this._wordpressLoading = true;
    this._wordpressError = null;
    this._notifyStatusListeners();

    try {
      console.log('Loading WordPress presets from ultracard.io using Directories Pro...');

      const response = await directoriesProPresetsAPI.fetchPresets({
        per_page: 50, // Load up to 50 presets initially
        sort: 'popular', // Sort by most popular first
      });

      this._wordpressPresets = response.presets.map(this._convertWordPressPreset.bind(this));
      this._wordpressError = null;

      console.log(
        `Successfully loaded ${this._wordpressPresets.length} WordPress presets from Directories Pro`
      );

      // Notify listeners of new presets
      this._notifyListeners();
    } catch (error) {
      console.error('Failed to load WordPress presets from Directories Pro:', error);
      this._wordpressError = error instanceof Error ? error.message : 'Failed to load presets';
      // Keep existing presets on error
    } finally {
      this._wordpressLoading = false;
      this._notifyStatusListeners();
    }
  }

  /**
   * Convert WordPress preset to Ultra Card PresetDefinition
   */
  private _convertWordPressPreset(wpPreset: WordPressPreset): PresetDefinition {
    try {
      // Parse the shortcode as JSON layout configuration
      let layout: LayoutConfig;

      try {
        // Try to parse as direct JSON first
        layout = JSON.parse(wpPreset.shortcode);
        console.log(`Successfully parsed direct JSON for preset ${wpPreset.id}:`, layout);

        // Validate that the layout has rows
        if (!layout.rows || !Array.isArray(layout.rows) || layout.rows.length === 0) {
          console.warn(`Preset ${wpPreset.id} has empty or invalid rows array:`, layout.rows);
          throw new Error('Layout has no rows');
        }
      } catch (parseError) {
        console.warn(
          `Failed to parse layout for preset ${wpPreset.id}:`,
          parseError,
          'Shortcode:',
          wpPreset.shortcode
        );

        // Try to extract JSON from Ultra Card shortcode format [ultra_card]...content...[/ultra_card]
        try {
          const shortcodeMatch = wpPreset.shortcode.match(
            /\[ultra_card\]([\s\S]*?)\[\/ultra_card\]/
          );
          if (shortcodeMatch) {
            const encodedData = shortcodeMatch[1].trim();
            const jsonData = atob(encodedData);
            const importData = JSON.parse(jsonData);

            console.log(`Decoded shortcode for preset ${wpPreset.id}:`, importData);

            if (importData.type === 'ultra-card-row' && importData.data) {
              // This is a row export, wrap it in a layout structure
              layout = {
                rows: [importData.data],
              };
              console.log(`Converted row export to layout for preset ${wpPreset.id}:`, layout);
            } else if (importData.data && importData.data.rows) {
              layout = importData.data;
            } else if (importData.rows) {
              layout = importData;
            } else {
              throw new Error('No valid layout found in shortcode');
            }
          } else {
            throw new Error('No shortcode format found');
          }
        } catch (shortcodeError) {
          console.error(`Failed to parse shortcode for preset ${wpPreset.id}:`, shortcodeError);
          // Create a working demo layout for the User Location Badge
          layout = {
            rows: [
              {
                id: `demo-row-${wpPreset.id}`,
                columns: [
                  {
                    id: `demo-col-${wpPreset.id}`,
                    modules: [
                      {
                        id: `demo-horizontal-${wpPreset.id}`,
                        type: 'horizontal',
                        alignment: 'space-between',
                        vertical_alignment: 'center',
                        gap: 0.7,
                        wrap: false,
                        modules: [
                          {
                            id: `demo-avatar-${wpPreset.id}`,
                            type: 'image',
                            image_type: 'url',
                            height: '40px',
                            width: '40px',
                            border_radius: '50%',
                            object_fit: 'cover',
                            image_url: 'https://cdn-icons-png.freepik.com/512/3177/3177440.png',
                          } as any,
                          {
                            id: `demo-info-${wpPreset.id}`,
                            type: 'icon',
                            icons: [
                              {
                                id: `demo-icon-${wpPreset.id}`,
                                entity: 'person.demo_user',
                                icon_inactive: 'mdi:account',
                                icon_active: 'mdi:account',
                                show_name: true,
                                show_state: true,
                                icon_size: 26,
                                text_size: 14,
                              } as any,
                            ],
                          } as any,
                        ],
                      } as any,
                    ],
                  },
                ],
                column_layout: '1-col',
                background_color: '#333333',
                border_radius: 60,
                height: '50px',
                width: '140px',
                padding: {
                  left: '4px',
                  right: '16px',
                },
              } as any,
            ],
          };
        }
      }

      // Map WordPress category to Ultra Card category
      const category = this._mapWordPressCategory(wpPreset.category);

      // Determine if this is a standard preset from WJD Designs
      const isStandardPreset =
        wpPreset.author &&
        (wpPreset.author.toLowerCase().includes('wayne@wjddesigns.com') ||
          wpPreset.author.toLowerCase().includes('wjddesigns'));

      // Create appropriate tags
      const baseTags = wpPreset.tags || [];
      const additionalTags = isStandardPreset ? ['standard'] : ['community'];

      const presetDefinition = {
        id: `wp-${wpPreset.id}`,
        name: wpPreset.name,
        description: wpPreset.description || 'No description provided',
        category,
        icon: this._getPresetIcon(wpPreset.category, wpPreset.tags),
        author: wpPreset.author || 'Community',
        version: '1.0.0',
        tags: [...baseTags, ...additionalTags],
        thumbnail: wpPreset.featured_image,
        layout,
        metadata: {
          created: wpPreset.created,
          updated: wpPreset.updated || wpPreset.created,
          downloads: wpPreset.downloads,
          rating: wpPreset.rating,
        },
      } as any;

      // Add WordPress-specific data for Read More functionality
      presetDefinition.preset_url = wpPreset.preset_url;
      presetDefinition.description_full = wpPreset.description_full;

      return presetDefinition;
    } catch (error) {
      console.error(`Error converting WordPress preset ${wpPreset.id}:`, error);
      // Return a basic error preset
      return {
        id: `wp-error-${wpPreset.id}`,
        name: wpPreset.name || 'Error Preset',
        description: 'This preset could not be loaded properly',
        category: 'custom',
        icon: 'mdi:alert-circle',
        author: wpPreset.author || 'Community',
        version: '1.0.0',
        tags: ['error', 'community'],
        layout: {
          rows: [
            {
              id: `error-row-${wpPreset.id}`,
              columns: [
                {
                  id: `error-col-${wpPreset.id}`,
                  modules: [
                    {
                      id: `error-text-${wpPreset.id}`,
                      type: 'text',
                      text: 'Preset Loading Error',
                      font_size: 14,
                      alignment: 'center',
                      color: 'var(--error-color)',
                    } as any,
                  ],
                },
              ],
              column_layout: '1-col',
            },
          ],
        },
        metadata: {
          created: wpPreset.created || new Date().toISOString(),
          updated: wpPreset.updated || new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Map WordPress category to Ultra Card category
   */
  private _mapWordPressCategory(wpCategory: string): PresetDefinition['category'] {
    const categoryMap: Record<string, PresetDefinition['category']> = {
      // Exact matches for Ultra Card categories
      badges: 'badges',
      layouts: 'layouts',
      widgets: 'widgets',
      custom: 'badges', // Map WordPress 'custom' to 'badges' for now

      // Alternative names that should map to Ultra Card categories
      badge: 'badges',
      layout: 'layouts',
      widget: 'widgets',
      dashboard: 'layouts',
      dashboards: 'layouts',
      theme: 'custom',
      themes: 'custom',
    };

    const normalized = wpCategory.toLowerCase().trim();
    const mappedCategory = categoryMap[normalized];

    console.log(`Mapping WordPress category "${wpCategory}" -> "${mappedCategory || 'badges'}"`);

    return mappedCategory || 'badges'; // Default to badges instead of custom
  }

  /**
   * Get appropriate icon for preset based on category and tags
   */
  private _getPresetIcon(category: string, tags: string[]): string {
    // Check tags first for specific icons
    if (tags.includes('person') || tags.includes('user')) return 'mdi:account-circle';
    if (tags.includes('weather')) return 'mdi:weather-partly-cloudy';
    if (tags.includes('energy')) return 'mdi:lightning-bolt';
    if (tags.includes('climate')) return 'mdi:thermostat';
    if (tags.includes('security')) return 'mdi:shield-home';
    if (tags.includes('lights') || tags.includes('lighting')) return 'mdi:lightbulb';
    if (tags.includes('vehicle') || tags.includes('car')) return 'mdi:car';
    if (tags.includes('location')) return 'mdi:map-marker';

    // Fallback to category-based icons
    const categoryIcons: Record<string, string> = {
      badge: 'mdi:card-account-details',
      badges: 'mdi:card-account-details',
      layout: 'mdi:view-column',
      layouts: 'mdi:view-column',
      widget: 'mdi:widgets',
      widgets: 'mdi:widgets',
      dashboard: 'mdi:view-dashboard',
      dashboards: 'mdi:view-dashboard',
    };

    const normalized = category.toLowerCase().trim();
    return categoryIcons[normalized] || 'mdi:card';
  }

  private _broadcastChange(): void {
    window.dispatchEvent(new CustomEvent(UcPresetsService.SYNC_EVENT));
  }

  private _isValidPreset(preset: any): preset is PresetDefinition {
    return (
      preset &&
      typeof preset.id === 'string' &&
      typeof preset.name === 'string' &&
      typeof preset.description === 'string' &&
      typeof preset.category === 'string' &&
      typeof preset.icon === 'string' &&
      preset.layout &&
      Array.isArray(preset.layout.rows)
    );
  }
}

// Export singleton instance
export const ucPresetsService = new UcPresetsService();
