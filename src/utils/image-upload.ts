import { HomeAssistant } from 'custom-card-helpers';
import { getResolvedMediaUrlSync, isMediaSourceUri } from './media-resolver';

export interface ImageUploadResponse {
  path: string;
  file_id: string;
  success: boolean;
  error?: string | undefined;
  warning?: string | undefined;
}

/**
 * Canonical `accept` string for image upload inputs across Ultra Card.
 *
 * `image/*` is a wildcard that *should* cover every format the browser
 * recognises as an image — but in practice some file pickers (notably iOS
 * Safari, Android intents, certain Linux file managers, and a handful of HA
 * companion-app webviews) only show files whose MIME type they auto-detected,
 * and they sometimes fail to detect modern formats like WebP / AVIF / HEIC /
 * JPEG XL. Listing the MIME types *and* the file extensions explicitly makes
 * every modern image format selectable in every environment.
 *
 * Server-side, Home Assistant's `/api/media_source/local/upload` endpoint
 * accepts arbitrary files (it just streams them to disk under /media/local),
 * so any format the browser lets the user pick will upload successfully.
 *
 * All file pickers (`<ultra-file-picker>`, `renderFileField`, and the few
 * remaining hand-rolled `<input type="file">` elements) reference this
 * constant so they stay in sync.
 */
export const SUPPORTED_IMAGE_ACCEPT = [
  // Broad wildcard — primary filter for browsers that auto-detect MIME types.
  'image/*',
  // Explicit MIME types — belt-and-suspenders for pickers that won't show a
  // file unless its MIME is whitelisted by name.
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/heic',
  'image/heif',
  'image/jxl',
  'image/apng',
  // Extension fallbacks — some pickers filter purely on extension when the
  // file's MIME isn't reported (common with HEIC/AVIF/JXL on older OSes).
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
  '.bmp',
  '.tif',
  '.tiff',
  '.ico',
  '.heic',
  '.heif',
  '.jxl',
  '.apng',
].join(',');

/**
 * Uploads a file to Home Assistant using the best available method.
 * Tries local media source first, falls back to image API if needed.
 * @param hass The Home Assistant object.
 * @param file The file to upload.
 * @returns The path of the uploaded file.
 * @throws An error if all upload methods fail.
 */
export async function uploadImage(hass: HomeAssistant, file: File): Promise<string> {
  if (!file) {
    console.error('[UPLOAD] Missing file.');
    throw new Error('No file provided for upload.');
  }
  if (!hass || !hass.auth || !hass.auth.data || !hass.auth.data.access_token) {
    console.error('[UPLOAD] Missing Home Assistant authentication details.');
    throw new Error('Authentication details are missing.');
  }

  const formData = new FormData();
  formData.append('file', file);

  // Try local media source first (preferred method)
  try {
    console.log('[UPLOAD] Attempting upload to local media source...');
    const response = await fetch('/api/media_source/local/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${hass.auth.data.access_token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      const imagePath = result.media_content_id || `/media/local/${file.name}`;
      console.log(`[UPLOAD] Successfully uploaded to local media source: ${imagePath}`);
      return imagePath;
    } else {
      console.warn(
        `[UPLOAD] Local media source failed (${response.status}), trying fallback method...`
      );
    }
  } catch (error) {
    console.warn('[UPLOAD] Local media source not available, trying fallback method...', error);
  }

  // Fallback to image API
  try {
    console.log('[UPLOAD] Attempting upload to image API...');

    let baseUrl = '';
    if (hass.connection && typeof (hass.connection as any).options?.url === 'string') {
      const wsUrl = (hass.connection as any).options.url;
      baseUrl = wsUrl.replace(/^ws/, 'http');
    } else if (typeof (hass as any).hassUrl === 'function') {
      baseUrl = (hass as any).hassUrl();
    } else {
      baseUrl = `${window.location.protocol}//${window.location.host}`;
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const uploadUrl = `${cleanBaseUrl}/api/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hass.auth.data.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[UPLOAD] Image API upload failed: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(`Image API upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result || !result.id) {
      console.error(`[UPLOAD] Invalid response from image API: missing id`, result);
      throw new Error(`Invalid response from image API: missing id`);
    }

    const imagePath = `/api/image/serve/${result.id}`;
    console.log(`[UPLOAD] Successfully uploaded to image API: ${imagePath}`);
    return imagePath;
  } catch (error) {
    console.error(`[UPLOAD] All upload methods failed:`, error);
    throw new Error(
      `Upload failed: ${error instanceof Error ? error.message : 'Unknown network error'}`
    );
  }
}

/**
 * Gets the full URL for an uploaded image
 * @param hass - Home Assistant instance
 * @param path - Image path returned from upload
 * @returns Full URL to the image
 */
export function getImageUrl(hass: HomeAssistant, path: string): string {
  if (!path) {
    return '';
  }

  // Resolve Home Assistant media-source URIs (e.g. images picked from the
  // /media browser). These cannot be string-rewritten because the `local`
  // media source ID points to /media — not /config/www. We dispatch an
  // async WS call (`media_source/resolve_media`) and re-render the card
  // when the signed URL is ready.
  if (isMediaSourceUri(path)) {
    return getResolvedMediaUrlSync(hass, path);
  }

  // Return absolute URLs as-is
  if (path.startsWith('http')) {
    return path;
  }

  // Handle image API paths (from /api/image/upload fallback)
  if (path.includes('/api/image/serve/')) {
    const matches = path.match(/\/api\/image\/serve\/([^\/]+)/);
    if (matches && matches[1]) {
      const imageId = matches[1];
      try {
        const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
        const finalUrl = `${baseUrl.replace(/\/$/, '')}/api/image/serve/${imageId}/original`;
        return finalUrl;
      } catch (e) {
        return path;
      }
    }
    return path;
  }

  // Handle local media source paths (primary format used by this utility)
  if (
    path.startsWith('/media/local/') ||
    path.startsWith('media/local/') ||
    path.startsWith('local/') ||
    path.includes('/local/')
  ) {
    const relativePath = path
      .replace(/^\/media\/local\//, '')
      .replace(/^media\/local\//, '')
      .replace(/^\/?local\//, '');

    try {
      const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
      const finalUrl = `${baseUrl.replace(/\/$/, '')}/local/${relativePath}`;
      return finalUrl;
    } catch (e) {
      // Fallback to relative path if baseUrl extraction fails
      return `/local/${relativePath}`;
    }
  }

  // Handle general relative URLs that start with '/'
  if (path.startsWith('/')) {
    try {
      const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
      const finalUrl = `${baseUrl.replace(/\/$/, '')}${path}`;
      return finalUrl;
    } catch (e) {
      return path;
    }
  }

  return path;
}
