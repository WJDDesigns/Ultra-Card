/**
 * OLD WordPress Presets API Service - DISABLED
 * This file has been renamed to force Ultra Card to use directories-pro-presets-api.ts
 * Fetches presets from ultracard.io WordPress site using GeoDirectory API
 */

export interface WordPressPreset {
  id: number;
  name: string;
  description: string;
  description_full: string; // Full description for Read More
  shortcode: string;
  category: string;
  tags: string[];
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

export class WordPressPresetsAPI {
  // This class is disabled - use DirectoriesProPresetsAPI instead
}

// Export disabled instance
export const wordpressPresetsAPI = new WordPressPresetsAPI();
