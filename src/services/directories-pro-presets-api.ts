/**
 * Directories Pro Presets API Service
 * Fetches presets from ultracard.io WordPress site using Directories Pro
 */

export interface WordPressPreset {
  id: number;
  name: string;
  description: string;
  description_full: string; // Full description for Read More
  shortcode: string;
  category: string;
  tags: string[];
  integrations?: string[];
  author: string;
  author_avatar?: string;
  featured_image?: string;
  gallery?: string[];
  downloads: number;
  rating: number;
  reviews_count: number;
  created: string;
  updated?: string;
  is_featured: boolean;
  difficulty?: string;
  compatibility?: string[];
  preset_url?: string; // Link to preset page on ultracard.io
}

export interface WordPressPresetsResponse {
  presets: WordPressPreset[];
  total: number;
  pages: number;
  current_page: number;
}

export class DirectoriesProPresetsAPI {
  private static readonly API_BASE = 'https://ultracard.io/wp-json/wp/v2';
  private static readonly CACHE_KEY = 'ultra-card-directories-pro-presets';
  private static readonly CACHE_TIMESTAMP_KEY = 'ultra-card-directories-pro-presets-timestamp';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Fetch all presets from Directories Pro
   */
  async fetchPresets(
    params: {
      page?: number;
      per_page?: number;
      category?: string;
      search?: string;
      sort?: 'newest' | 'popular' | 'rating' | 'trending';
    } = {}
  ): Promise<WordPressPresetsResponse> {
    const cacheKey = `presets_${JSON.stringify(params)}`;

    // Check memory cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DirectoriesProPresetsAPI.CACHE_DURATION) {
      return cached.data;
    }

    // Check localStorage cache
    const localCached = this._getFromLocalStorage(cacheKey);
    if (localCached) {
      this.cache.set(cacheKey, localCached);
      return localCached.data;
    }

    try {
      const queryParams = new URLSearchParams();

      // Add pagination
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.per_page) queryParams.set('per_page', params.per_page.toString());

      // Add filtering
      if (params.category) queryParams.set('category', params.category);
      if (params.search) queryParams.set('search', params.search);
      if (params.sort) queryParams.set('sort', params.sort);

      // Embed author and media information
      queryParams.set('_embed', 'true');

      // Use Directories Pro post type
      const url = `${DirectoriesProPresetsAPI.API_BASE}/presets_dir_ltg?${queryParams.toString()}`;

      // Fetching WordPress presets (silent)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const posts = await response.json();

      // Convert Directories Pro presets to our preset format
      const data: WordPressPresetsResponse = {
        presets: Array.isArray(posts)
          ? posts.map((post: any) => {
              const meta = post.preset_meta || {};
              const tags = meta.tags ? meta.tags.split(',').map((tag: string) => tag.trim()) : [];
              const integrations = meta.integrations
                ? String(meta.integrations)
                    .split(',')
                    .map((t: string) => t.trim())
                    .filter(Boolean)
                : [];

              // Post data received (silent)

              const fullDescription = this._stripHtml(
                meta.description ||
                  post.excerpt?.rendered ||
                  post.content?.rendered ||
                  'No description available'
              );

              return {
                id: post.id,
                name: post.title?.rendered || 'Untitled Preset',
                description: this._truncateDescription(fullDescription, 15), // Truncated for cards
                description_full: fullDescription, // Full description for Read More
                shortcode: meta.shortcode || '{"rows":[]}',
                category: meta.category || 'badges', // Default to badges instead of custom
                tags: tags,
                integrations,
                author:
                  post._embedded?.author?.[0]?.display_name ||
                  post._embedded?.author?.[0]?.name ||
                  post._embedded?.author?.[0]?.slug ||
                  'Community',
                author_avatar: post._embedded?.author?.[0]?.avatar_urls?.['48'] || '',
                downloads: parseInt(meta.downloads) || 0,
                rating: parseFloat(meta.rating) || 0,
                reviews_count: 0,
                created: post.date,
                updated: post.modified,
                is_featured: false,
                difficulty: meta.difficulty || 'beginner',
                compatibility: meta.compatibility ? meta.compatibility.split(',') : [],
                featured_image: meta.featured_image || post.featured_media_src_url || '',
                gallery: Array.isArray(meta.gallery) ? meta.gallery : [],
                preset_url: post.link || `https://ultracard.io/presets/${post.slug}/`,
              };
            })
          : [],
        total: posts.length || 0,
        pages: 1,
        current_page: 1,
      };

      // Validate response structure
      if (!Array.isArray(posts)) {
        throw new Error('Invalid response format: expected array of posts');
      }

      // Cache the successful response
      const cacheData = { data, timestamp: Date.now() };
      this.cache.set(cacheKey, cacheData);
      this._saveToLocalStorage(cacheKey, cacheData);

      // Successfully fetched presets (silent)
      return data;
    } catch (error) {
      console.error('Failed to fetch Directories Pro presets:', error);

      // Try to return stale cache if available
      const staleCache = this._getFromLocalStorage(cacheKey, true);
      if (staleCache) {
        // Using stale cached presets due to fetch error (silent)
        return staleCache.data;
      }

      // Return empty response as fallback
      return {
        presets: [],
        total: 0,
        pages: 0,
        current_page: 1,
      };
    }
  }

  /**
   * Fetch a single preset by ID from Directories Pro
   */
  async fetchPreset(id: number): Promise<WordPressPreset | null> {
    const cacheKey = `preset_${id}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DirectoriesProPresetsAPI.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `${DirectoriesProPresetsAPI.API_BASE}/presets_dir_ltg/${id}?_embed=true`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const post = await response.json();
      const meta = post.preset_meta || {};
      const tags = meta.tags ? meta.tags.split(',').map((tag: string) => tag.trim()) : [];
      const integrations = meta.integrations
        ? String(meta.integrations)
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      const fullDescription = this._stripHtml(
        post.excerpt?.rendered || post.content?.rendered || 'No description available'
      );

      const preset: WordPressPreset = {
        id: post.id,
        name: post.title?.rendered || 'Untitled Preset',
        description: this._truncateDescription(fullDescription, 15),
        description_full: fullDescription,
        shortcode: meta.shortcode || '{"rows":[]}',
        category: meta.category || 'badges',
        tags: tags,
        integrations,
        author:
          post._embedded?.author?.[0]?.display_name ||
          post._embedded?.author?.[0]?.name ||
          post._embedded?.author?.[0]?.slug ||
          'Community',
        author_avatar: post._embedded?.author?.[0]?.avatar_urls?.['48'] || '',
        downloads: parseInt(meta.downloads) || 0,
        rating: parseFloat(meta.rating) || 0,
        reviews_count: 0,
        created: post.date,
        updated: post.modified,
        is_featured: false,
        difficulty: meta.difficulty || 'beginner',
        compatibility: meta.compatibility ? meta.compatibility.split(',') : [],
        featured_image: meta.featured_image || post.featured_media_src_url || '',
        gallery: Array.isArray(meta.gallery) ? meta.gallery : [],
        preset_url: post.link || `https://ultracard.io/presets/${post.slug}/`,
      };

      // Cache the result
      const cacheData = { data: preset, timestamp: Date.now() };
      this.cache.set(cacheKey, cacheData);

      return preset;
    } catch (error) {
      console.error(`Failed to fetch preset ${id}:`, error);
      return null;
    }
  }

  /**
   * Track preset download
   */
  async trackDownload(presetId: number): Promise<void> {
    try {
      // For now, pretend to track download silently (endpoint TBD)
    } catch (error) {
      // Silently fail download tracking
      console.warn(`Failed to track download for preset ${presetId}:`, error);
    }
  }

  /**
   * Get available categories from Directories Pro
   */
  async getCategories(): Promise<string[]> {
    const cacheKey = 'categories';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < DirectoriesProPresetsAPI.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`${DirectoriesProPresetsAPI.API_BASE}/categories`, {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const categories: string[] = await response.json();
        const cacheData = { data: categories, timestamp: Date.now() };
        this.cache.set(cacheKey, cacheData);
        return categories;
      }
    } catch (error) {
      console.warn('Failed to fetch categories:', error);
    }

    // Fallback categories
    return ['badges', 'layouts', 'widgets', 'dashboards', 'themes'];
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();

    // Clear localStorage cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('wp-presets-cache-')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { memoryEntries: number; localStorageEntries: number } {
    const memoryEntries = this.cache.size;

    const keys = Object.keys(localStorage);
    const localStorageEntries = keys.filter(key => key.startsWith('wp-presets-cache-')).length;

    return { memoryEntries, localStorageEntries };
  }

  /**
   * Save data to localStorage with timestamp
   */
  private _saveToLocalStorage(key: string, data: { data: any; timestamp: number }): void {
    try {
      const storageKey = `wp-presets-cache-${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Get data from localStorage
   */
  private _getFromLocalStorage(
    key: string,
    allowStale = false
  ): { data: any; timestamp: number } | null {
    try {
      const storageKey = `wp-presets-cache-${key}`;
      const stored = localStorage.getItem(storageKey);

      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Check if cache is still valid (unless allowing stale)
      if (!allowStale && Date.now() - parsed.timestamp > DirectoriesProPresetsAPI.CACHE_DURATION) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * Strip HTML tags from text content
   */
  private _stripHtml(html: string): string {
    if (!html) return '';

    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get text content and clean up whitespace
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    return textContent.trim().replace(/\s+/g, ' ');
  }

  /**
   * Truncate description to word limit for preset cards
   */
  private _truncateDescription(description: string, wordLimit: number = 15): string {
    if (!description) return '';

    const words = description.split(' ');
    if (words.length <= wordLimit) {
      return description;
    }

    return words.slice(0, wordLimit).join(' ') + '...';
  }
}

// Export singleton instance
export const directoriesProPresetsAPI = new DirectoriesProPresetsAPI();
