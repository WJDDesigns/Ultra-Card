# WordPress Preset Integration

This document describes the WordPress preset integration system that allows Ultra Card to pull presets from ultracard.io.

## Overview

The WordPress integration enables Ultra Card to:

- Fetch presets dynamically from ultracard.io
- Display community presets alongside built-in presets
- Show preset metadata (downloads, ratings, author info)
- Cache presets for offline functionality
- Track preset downloads for analytics

## Architecture

### Components

1. **WordPress Presets API Service** (`wordpress-presets-api.ts`)

   - Handles API communication with WordPress site
   - Implements caching and offline fallback
   - Manages error handling and retry logic

2. **Enhanced Presets Service** (`uc-presets-service.ts`)

   - Integrates WordPress presets with existing preset system
   - Converts WordPress data to Ultra Card format
   - Provides unified interface for all preset types

3. **Updated Preset Browser UI** (`layout-tab.ts`)
   - Displays WordPress presets with enhanced metadata
   - Shows loading states and error handling
   - Provides community vs built-in preset distinction

## API Endpoints

The integration expects these WordPress REST API endpoints:

### Get Presets Library

```
GET /wp-json/presets/v1/library
```

Query Parameters:

- `page`: Page number for pagination
- `per_page`: Number of presets per page (default: 20)
- `category`: Filter by category
- `search`: Search term
- `sort`: Sort order (newest, popular, rating, trending)

Response:

```json
{
  "presets": [
    {
      "id": 1,
      "name": "User Location Badge",
      "description": "A badge showing user location and status",
      "shortcode": "{\"rows\":[...]}",
      "category": "badges",
      "tags": ["location", "user", "badge"],
      "author": "Community User",
      "author_avatar": "https://...",
      "featured_image": "https://...",
      "gallery": ["https://..."],
      "downloads": 45,
      "rating": 4.5,
      "reviews_count": 12,
      "created": "2025-01-01T00:00:00Z",
      "updated": "2025-01-01T00:00:00Z",
      "is_featured": false,
      "difficulty": "beginner",
      "compatibility": ["ultra-card-1.2"]
    }
  ],
  "total": 1,
  "pages": 1,
  "current_page": 1
}
```

### Get Single Preset

```
GET /wp-json/presets/v1/preset/{id}
```

### Track Download

```
POST /wp-json/presets/v1/preset/{id}/download
```

### Get Categories

```
GET /wp-json/presets/v1/categories
```

## WordPress Setup Requirements

1. **GeoDirectory Plugin** with preset custom post type
2. **Custom REST API endpoints** for preset data
3. **Proper CORS headers** for cross-domain requests
4. **Image optimization** for preset thumbnails

## Caching Strategy

The integration implements a multi-layer caching system:

1. **Memory Cache**: Fast access to recently fetched presets
2. **LocalStorage Cache**: Persistent cache for offline functionality
3. **Cache Invalidation**: 5-minute timeout with manual refresh option

## Error Handling

- **Network Errors**: Graceful fallback to cached data
- **API Errors**: User-friendly error messages with retry options
- **Invalid Presets**: Safe parsing with fallback layouts
- **Loading States**: Visual feedback during API calls

## Data Conversion

WordPress presets are converted to Ultra Card format:

```typescript
interface WordPressPreset {
  id: number;
  name: string;
  description: string;
  shortcode: string; // JSON layout configuration
  category: string;
  tags: string[];
  // ... other fields
}

// Converted to:
interface PresetDefinition {
  id: string; // "wp-{id}"
  name: string;
  description: string;
  category: 'badges' | 'layouts' | 'widgets' | 'custom';
  icon: string; // Auto-generated based on category/tags
  author: string;
  version: string;
  tags: string[];
  thumbnail?: string;
  layout: LayoutConfig; // Parsed from shortcode
  metadata: {
    created: string;
    updated: string;
    downloads?: number;
    rating?: number;
  };
}
```

## UI Features

### Preset Browser Enhancements

- **Community Badges**: Visual distinction between built-in and community presets
- **Status Indicator**: Shows WordPress API loading/error states
- **Preset Stats**: Displays download counts and ratings
- **Enhanced Cards**: Left border styling for community presets
- **Refresh Controls**: Manual refresh buttons for updating presets

### Visual Indicators

- **Loading State**: Spinning icon with "Loading community presets..." message
- **Error State**: Alert icon with retry button
- **Success State**: Check icon with preset count and refresh button
- **Empty State**: Helpful message when no presets are available

## Performance Considerations

- **Lazy Loading**: Presets loaded on first access to presets tab
- **Optimistic Updates**: UI updates immediately while tracking downloads in background
- **Image Optimization**: Thumbnails served at appropriate sizes
- **Request Debouncing**: Prevents excessive API calls during user interaction

## Security

- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Safe parsing of preset configurations
- **Error Boundaries**: Prevents malformed presets from breaking the UI
- **Timeout Handling**: Prevents hanging requests

## Future Enhancements

1. **User Authentication**: Allow users to submit presets directly
2. **Preset Ratings**: Enable users to rate and review presets
3. **Advanced Search**: Full-text search with filters
4. **Preset Collections**: Curated preset bundles
5. **Real-time Updates**: WebSocket integration for live preset updates

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure WordPress site has proper CORS headers
2. **Cache Issues**: Clear browser cache or use refresh button
3. **Network Timeouts**: Check internet connection and WordPress site availability
4. **Invalid Presets**: Verify shortcode format in WordPress admin

### Debug Mode

Enable debug logging by setting `localStorage.setItem('ultra-card-debug', 'true')` in browser console.

## Testing

To test the integration:

1. Open Ultra Card editor
2. Go to Layout tab → Add Module → Presets tab
3. Verify community presets load from ultracard.io
4. Test preset application and download tracking
5. Verify offline functionality by disconnecting network

## Configuration

The API base URL can be configured by modifying the `API_BASE` constant in `wordpress-presets-api.ts`:

```typescript
private static readonly API_BASE = 'https://ultracard.io/wp-json/presets/v1';
```

For development, you can point to a local WordPress installation:

```typescript
private static readonly API_BASE = 'http://localhost/wp-json/presets/v1';
```
