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
  rating_count?: number;
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
  private static readonly EXTENDED_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for CORS fallback

  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
  ];

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

      // Try multiple methods to fetch data
      const posts = await this._fetchWithCorsResilience(url);

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
                reviews_count: parseInt(meta.rating_count) || 0,
                rating_count: parseInt(meta.rating_count) || 0,
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

      // Try to return stale cache if available (extended duration for CORS failures)
      const staleCache = this._getFromLocalStorage(cacheKey, true);
      if (staleCache) {
        console.warn('Using stale cached presets due to fetch error');
        return staleCache.data;
      }

      // Try to get any cached presets from any previous successful calls
      const fallbackCache = this._getFallbackCache();
      if (fallbackCache) {
        console.warn('Using fallback cached presets due to fetch error');
        return fallbackCache;
      }

      // Return empty response as final fallback
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
      const post = await this._fetchWithCorsResilience(url);
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
        reviews_count: parseInt(meta.rating_count) || 0,
        rating_count: parseInt(meta.rating_count) || 0,
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
   * Test CORS-resilient connection (for debugging)
   */
  async testConnection(): Promise<{ method: string; success: boolean; error?: string }[]> {
    const testUrl = `${DirectoriesProPresetsAPI.API_BASE}/presets_dir_ltg?per_page=1`;
    const results: { method: string; success: boolean; error?: string }[] = [];

    // Test direct fetch
    try {
      await fetch(testUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      results.push({ method: 'Direct Fetch', success: true });
    } catch (error) {
      results.push({
        method: 'Direct Fetch',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test each CORS proxy
    for (const proxy of this.corsProxies) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(testUrl)}`;
        await fetch(proxyUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        });
        results.push({ method: `Proxy: ${proxy}`, success: true });
      } catch (error) {
        results.push({
          method: `Proxy: ${proxy}`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
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
      const cacheAge = Date.now() - parsed.timestamp;
      const maxAge = allowStale
        ? DirectoriesProPresetsAPI.EXTENDED_CACHE_DURATION
        : DirectoriesProPresetsAPI.CACHE_DURATION;

      if (cacheAge > maxAge) {
        if (!allowStale) {
          localStorage.removeItem(storageKey);
        }
        return allowStale ? parsed : null;
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

  /**
   * CORS-resilient fetch that tries multiple methods
   */
  private async _fetchWithCorsResilience(url: string): Promise<any> {
    // Method 1: Direct fetch (fastest if CORS is working)
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Direct fetch failed, trying CORS proxies silently

      // Method 2: Try CORS proxies
      for (const proxy of this.corsProxies) {
        try {
          const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout for proxies
          });

          if (!response.ok) {
            throw new Error(`Proxy HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`Successfully fetched via proxy: ${proxy}`);
          return data;
        } catch (proxyError) {
          // Proxy failed silently, try next one
          continue; // Try next proxy
        }
      }

      // Method 3: Try JSONP-style approach (if supported by server)
      try {
        return await this._fetchViaJsonp(url);
      } catch (jsonpError) {
        console.warn('JSONP fetch failed:', jsonpError);
      }

      // All methods failed
      throw new Error('All CORS-resilient fetch methods failed');
    }
  }

  /**
   * JSONP-style fetch (experimental)
   */
  private async _fetchViaJsonp(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const callbackName = `ultracard_jsonp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const script = document.createElement('script');
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('JSONP timeout'));
      }, 15000);

      const cleanup = () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        delete (window as any)[callbackName];
        clearTimeout(timeoutId);
      };

      (window as any)[callbackName] = (data: any) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('JSONP script error'));
      };

      // Try to add callback parameter (may not work with all APIs)
      const separator = url.includes('?') ? '&' : '?';
      script.src = `${url}${separator}callback=${callbackName}`;
      document.head.appendChild(script);
    });
  }

  /**
   * Get fallback cache from any previous successful calls
   */
  private _getFallbackCache(): WordPressPresetsResponse | null {
    try {
      const keys = Object.keys(localStorage);
      const presetCacheKeys = keys.filter(key => key.startsWith('wp-presets-cache-presets_'));

      // Sort by timestamp to get the most recent
      const sortedKeys = presetCacheKeys
        .map(key => {
          try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            const parsed = JSON.parse(data);
            return { key, timestamp: parsed.timestamp, data: parsed.data };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));

      if (sortedKeys.length > 0 && sortedKeys[0]) {
        return sortedKeys[0].data;
      }
    } catch (error) {
      console.warn('Failed to get fallback cache:', error);
    }

    return null;
  }
}

// Export singleton instance
export const directoriesProPresetsAPI = new DirectoriesProPresetsAPI();
