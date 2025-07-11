import { HomeAssistant } from 'custom-card-helpers';

export interface ImageUploadResponse {
  path: string;
  file_id: string;
  success: boolean;
  error?: string;
  warning?: string;
}

/**
 * Uploads a file to the Home Assistant media source OR older image API.
 * @param hass The Home Assistant object.
 * @param file The file to upload.
 * @returns The path of the uploaded file (/api/image/serve/<id> format).
 * @throws An error if the upload fails or the response is invalid.
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

  // --- Try the older /api/image/upload endpoint ---
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
  const endpoint = '/api/image/upload';
  const uploadUrl = `${cleanBaseUrl}${endpoint}`;

  try {
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
        `[UPLOAD] Failed to upload image via ${uploadUrl}: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(`Failed to upload image via ${uploadUrl}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result || !result.id) {
      console.error(`[UPLOAD] Invalid response from ${uploadUrl}: missing id`, result);
      throw new Error(`Invalid response from ${uploadUrl}: missing id`);
    }

    const imagePath = `/api/image/serve/${result.id}`;
    return imagePath;
  } catch (error) {
    console.error(`[UPLOAD] Error during fetch to ${uploadUrl}:`, error);
    throw new Error(
      `Upload via ${uploadUrl} failed: ${error instanceof Error ? error.message : 'Unknown network error'}`
    );
  }
  // --- End of /api/image/upload attempt ---

  // Potential future improvement: Add fallback to media_source if the above fails?
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

  if (path.startsWith('http')) {
    return path;
  }

  if (path.startsWith('data:image/')) {
    return path;
  }

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

  if (path.startsWith('local/') || path.includes('/local/') || path.startsWith('media-source://')) {
    const relativePath = path
      .replace(/^\/?local\//, '')
      .replace(/^media-source:\/\/media_source\/local\//, '');
    const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
    const finalUrl = `${baseUrl.replace(/\/$/, '')}/local/${relativePath}`;
    return finalUrl;
  }

  // Handle general relative URLs that start with '/'
  if (path.startsWith('/')) {
    const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
    const finalUrl = `${baseUrl.replace(/\/$/, '')}${path}`;
    return finalUrl;
  }

  return path;
}
