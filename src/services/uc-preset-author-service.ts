/**
 * Ultra Card Preset Author Service
 * Author-scoped preset CRUD through the Connect proxy / ultracard.io API.
 */

import { ucCloudAuthService } from './uc-cloud-auth-service';

const API_BASE = 'https://ultracard.io/wp-json/ultra-card/v1';

export type AuthorPresetReviewStatus =
  | 'pending'
  | 'approved'
  | 'changes_requested'
  | 'rejected';

export interface AuthorPreset {
  id: number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  shortcode: string;
  integrations?: string;
  status: 'pending' | 'publish' | 'draft' | 'rejected' | string;
  review_status: AuthorPresetReviewStatus;
  moderator_note?: string;
  has_pending_revision: boolean;
  pending_revision?: Record<string, unknown> | null;
  gallery: string[];
  featured_image?: string;
  featured_image_id?: number;
  photo_ids?: number[];
  downloads: number;
  rating: number;
  rating_count: number;
  preset_url?: string;
  submitted_at?: string;
  reviewed_at?: string;
  author_id?: number;
}

export interface UpdateAuthorPresetPayload {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  shortcode?: string;
  integrations?: string;
  featured_image_id?: number;
  photo_ids?: number[];
}

/**
 * Proxy / WP responses sometimes nest the payload under `data` or return
 * the entity at the top level. Normalize carefully like other cloud services.
 */
function unwrapBody(raw: unknown): unknown {
  if (raw == null || typeof raw !== 'object') return raw;
  const obj = raw as Record<string, unknown>;
  // Connect proxy occasionally returns { _status, _body } if not already unwrapped
  if ('_body' in obj && obj._body !== undefined) {
    return unwrapBody(obj._body);
  }
  if ('data' in obj && obj.data != null && typeof obj.data === 'object' && !('id' in obj)) {
    return obj.data;
  }
  return raw;
}

function asErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const o = err as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message) return o.message;
  if (typeof o.error === 'string' && o.error) return o.error;
  if (o.data && typeof o.data === 'object' && o.data !== null && 'message' in o.data) {
    const m = (o.data as { message?: unknown }).message;
    if (typeof m === 'string' && m) return m;
  }
  return fallback;
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map(t => String(t)).filter(Boolean);
  }
  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

function normalizeGallery(gallery: unknown): string[] {
  if (!Array.isArray(gallery)) return [];
  return gallery.map(g => String(g)).filter(Boolean);
}

function normalizePhotoIds(ids: unknown): number[] | undefined {
  if (!Array.isArray(ids)) return undefined;
  const nums = ids
    .map(id => (typeof id === 'number' ? id : Number(id)))
    .filter(n => Number.isFinite(n) && n > 0);
  return nums.length ? nums : undefined;
}

function normalizeAuthorPreset(raw: unknown): AuthorPreset {
  const src = (unwrapBody(raw) ?? {}) as Record<string, unknown>;
  const id = Number(src.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid preset response: missing id');
  }

  const photoIds = normalizePhotoIds(src.photo_ids);
  const preset: AuthorPreset = {
    id,
    name: String(src.name ?? ''),
    description: String(src.description ?? ''),
    category: String(src.category ?? ''),
    tags: normalizeTags(src.tags),
    shortcode: String(src.shortcode ?? ''),
    status: String(src.status ?? 'pending'),
    review_status: (String(src.review_status ?? 'pending') as AuthorPresetReviewStatus) || 'pending',
    has_pending_revision: Boolean(src.has_pending_revision),
    gallery: normalizeGallery(src.gallery),
    downloads: Number(src.downloads) || 0,
    rating: Number(src.rating) || 0,
    rating_count: Number(src.rating_count) || 0,
  };

  if (typeof src.integrations === 'string') preset.integrations = src.integrations;
  if (typeof src.moderator_note === 'string') preset.moderator_note = src.moderator_note;
  if (src.pending_revision !== undefined) {
    preset.pending_revision =
      src.pending_revision && typeof src.pending_revision === 'object'
        ? (src.pending_revision as Record<string, unknown>)
        : null;
  }
  if (photoIds) preset.photo_ids = photoIds;
  if (typeof src.featured_image === 'string' && src.featured_image) {
    preset.featured_image = src.featured_image;
  }
  if (src.featured_image_id != null && Number.isFinite(Number(src.featured_image_id))) {
    const fid = Number(src.featured_image_id);
    if (fid > 0) preset.featured_image_id = fid;
  }
  if (typeof src.preset_url === 'string') preset.preset_url = src.preset_url;
  if (typeof src.submitted_at === 'string') preset.submitted_at = src.submitted_at;
  if (typeof src.reviewed_at === 'string') preset.reviewed_at = src.reviewed_at;
  if (src.author_id != null && Number.isFinite(Number(src.author_id))) {
    preset.author_id = Number(src.author_id);
  }

  return preset;
}

async function parseJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

class UcPresetAuthorService {
  async listMine(): Promise<AuthorPreset[]> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required to list your presets');
    }

    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/presets/mine`);

    if (!response.ok) {
      const err = await parseJson(response);
      const msg = asErrorMessage(err, `Failed to load your presets (HTTP ${response.status})`);
      const error = new Error(msg) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    const raw = unwrapBody(await parseJson(response));
    let list: unknown[] = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.presets)) list = obj.presets;
    }

    return list.map(item => normalizeAuthorPreset(item));
  }

  async get(id: number): Promise<AuthorPreset> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/presets/${id}`);

    if (!response.ok) {
      const err = await parseJson(response);
      throw new Error(asErrorMessage(err, `Failed to load preset (HTTP ${response.status})`));
    }

    return normalizeAuthorPreset(await parseJson(response));
  }

  async update(id: number, payload: UpdateAuthorPresetPayload): Promise<AuthorPreset> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required to update presets');
    }

    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.category !== undefined) body.category = payload.category;
    if (payload.tags !== undefined) body.tags = payload.tags;
    if (payload.shortcode !== undefined) body.shortcode = payload.shortcode;
    if (payload.integrations !== undefined) body.integrations = payload.integrations;
    if (payload.featured_image_id !== undefined) body.featured_image_id = payload.featured_image_id;
    if (payload.photo_ids !== undefined) body.photo_ids = payload.photo_ids;

    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/presets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await parseJson(response);
      throw new Error(asErrorMessage(err, `Failed to update preset (HTTP ${response.status})`));
    }

    return normalizeAuthorPreset(await parseJson(response));
  }

  async remove(id: number): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required to delete presets');
    }

    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/presets/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const err = await parseJson(response);
      throw new Error(asErrorMessage(err, `Failed to delete preset (HTTP ${response.status})`));
    }
  }

  async withdraw(id: number): Promise<AuthorPreset> {
    if (!ucCloudAuthService.isAuthenticated()) {
      throw new Error('Authentication required to withdraw presets');
    }

    const response = await ucCloudAuthService.authenticatedFetch(
      `${API_BASE}/presets/${id}/withdraw`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const err = await parseJson(response);
      throw new Error(asErrorMessage(err, `Failed to withdraw preset (HTTP ${response.status})`));
    }

    return normalizeAuthorPreset(await parseJson(response));
  }
}

export const ucPresetAuthorService = new UcPresetAuthorService();
