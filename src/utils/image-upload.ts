import { HomeAssistant } from 'custom-card-helpers';

export interface ImageUploadResponse {
  path: string;
  file_id: string;
  success: boolean;
  error?: string;
  warning?: string;
}

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
    path.includes('/local/') ||
    path.startsWith('media-source://')
  ) {
    const relativePath = path
      .replace(/^\/media\/local\//, '')
      .replace(/^media\/local\//, '')
      .replace(/^\/?local\//, '')
      .replace(/^media-source:\/\/media_source\/local\//, '');

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
