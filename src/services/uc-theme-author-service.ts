/**
 * Author-scoped theme CRUD on ultracard.io through the Connect proxy.
 * Mirrors `uc-preset-author-service` for the `ultra-card/v1/themes` routes.
 */

import { ucCloudAuthService } from './uc-cloud-auth-service';
import type { UcThemeDefinition } from '../themes/uc-theme-types';
import { sanitizeThemeDefinition } from '../themes/uc-theme-validate';

const API_BASE = 'https://ultracard.io/wp-json/ultra-card/v1';

export type AuthorThemeReviewStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export interface AuthorTheme {
  id: number;
  catalogId: string;
  name: string;
  description: string;
  tags: string[];
  status: 'pending' | 'publish' | 'draft' | 'rejected' | string;
  review_status: AuthorThemeReviewStatus;
  moderator_note?: string | undefined;
  has_pending_revision: boolean;
  pending_revision?: Record<string, unknown> | null | undefined;
  preview?: string | undefined;
  downloads: number;
  rating: number;
  rating_count: number;
  version: number;
  submitted_at?: string | undefined;
  reviewed_at?: string | undefined;
  author_id?: number | undefined;
  /** Null when the server refused the stored definition (should not happen for our own submissions). */
  definition: UcThemeDefinition | null;
}

export interface SubmitThemePayload {
  name: string;
  description: string;
  tags?: string[] | undefined;
  definition: UcThemeDefinition;
  preview_image_id?: number | undefined;
}

export type UpdateThemePayload = Partial<SubmitThemePayload>;

export interface ThemeRatingResult {
  rating: number;
  ratingCount: number;
  myRating: number;
}

function unwrapBody(raw: unknown): unknown {
  if (raw == null || typeof raw !== 'object') return raw;
  const obj = raw as Record<string, unknown>;
  if ('_body' in obj && obj._body !== undefined) return unwrapBody(obj._body);
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
  if (o.data && typeof o.data === 'object' && 'message' in (o.data as object)) {
    const m = (o.data as { message?: unknown }).message;
    if (typeof m === 'string' && m) return m;
  }
  return fallback;
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(t => String(t)).filter(Boolean);
  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

function normalizeAuthorTheme(raw: unknown): AuthorTheme {
  const src = (unwrapBody(raw) ?? {}) as Record<string, unknown>;
  const id = Number(src.id);
  if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid theme response: missing id');

  const catalogId = typeof src.catalog_id === 'string' && src.catalog_id ? src.catalog_id : `wp-${id}`;
  const { theme } = sanitizeThemeDefinition(src.definition, { idPrefix: 'wp-' });
  if (theme) theme.id = catalogId;

  const out: AuthorTheme = {
    id,
    catalogId,
    name: String(src.name ?? ''),
    description: String(src.description ?? ''),
    tags: normalizeTags(src.tags),
    status: String(src.status ?? 'pending'),
    review_status: (String(src.review_status ?? 'pending') as AuthorThemeReviewStatus) || 'pending',
    has_pending_revision: Boolean(src.has_pending_revision),
    downloads: Number(src.downloads) || 0,
    rating: Math.max(0, Math.min(5, Number(src.rating) || 0)),
    rating_count: Math.max(0, Number(src.rating_count) || 0),
    version: Math.max(1, Number(src.version) || 1),
    definition: theme,
  };
  if (typeof src.moderator_note === 'string' && src.moderator_note) out.moderator_note = src.moderator_note;
  if (src.pending_revision !== undefined) {
    out.pending_revision =
      src.pending_revision && typeof src.pending_revision === 'object'
        ? (src.pending_revision as Record<string, unknown>)
        : null;
  }
  if (typeof src.preview === 'string' && src.preview) out.preview = src.preview;
  if (typeof src.submitted_at === 'string') out.submitted_at = src.submitted_at;
  if (typeof src.reviewed_at === 'string') out.reviewed_at = src.reviewed_at;
  if (src.author_id != null && Number.isFinite(Number(src.author_id))) out.author_id = Number(src.author_id);
  return out;
}

async function parseJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function fail(response: Response, fallback: string): Promise<never> {
  const err = await parseJson(response);
  const error = new Error(asErrorMessage(err, `${fallback} (HTTP ${response.status})`)) as Error & {
    status?: number;
  };
  error.status = response.status;
  throw error;
}

function requireAuth(action: string): void {
  if (!ucCloudAuthService.isAuthenticated()) {
    throw new Error(`Authentication required to ${action}`);
  }
}

/** Strip client-only fields before the definition travels to the server. */
function publishableDefinition(def: UcThemeDefinition): Record<string, unknown> {
  const { source: _source, ...rest } = def;
  return rest;
}

function buildBody(payload: UpdateThemePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.tags !== undefined) body.tags = payload.tags;
  if (payload.definition !== undefined) body.definition = publishableDefinition(payload.definition);
  if (payload.preview_image_id !== undefined) body.preview_image_id = payload.preview_image_id;
  return body;
}

class UcThemeAuthorService {
  async listMine(): Promise<AuthorTheme[]> {
    requireAuth('list your themes');
    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes/mine`);
    if (!response.ok) await fail(response, 'Failed to load your themes');

    const raw = unwrapBody(await parseJson(response));
    let list: unknown[] = [];
    if (Array.isArray(raw)) list = raw;
    else if (raw && typeof raw === 'object' && Array.isArray((raw as Record<string, unknown>).themes)) {
      list = (raw as Record<string, unknown>).themes as unknown[];
    }
    return list.map(normalizeAuthorTheme);
  }

  async get(id: number): Promise<AuthorTheme> {
    requireAuth('load a theme');
    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes/${id}`);
    if (!response.ok) await fail(response, 'Failed to load theme');
    return normalizeAuthorTheme(await parseJson(response));
  }

  async submit(payload: SubmitThemePayload): Promise<AuthorTheme> {
    requireAuth('submit themes');
    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(payload)),
    });
    if (!response.ok) await fail(response, 'Failed to submit theme');
    return normalizeAuthorTheme(await parseJson(response));
  }

  async update(id: number, payload: UpdateThemePayload): Promise<AuthorTheme> {
    requireAuth('update themes');
    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(payload)),
    });
    if (!response.ok) await fail(response, 'Failed to update theme');
    return normalizeAuthorTheme(await parseJson(response));
  }

  async remove(id: number): Promise<void> {
    requireAuth('delete themes');
    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) await fail(response, 'Failed to delete theme');
  }

  /**
   * Rate a published catalog theme 1..5 (or 0 to remove your rating). One
   * rating per member per theme; authors cannot rate their own theme.
   */
  async rate(id: number, rating: number): Promise<ThemeRatingResult> {
    requireAuth('rate themes');
    const value = Math.round(rating);
    const response =
      value >= 1
        ? await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes/${id}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: Math.min(5, value) }),
          })
        : await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes/${id}/rate`, { method: 'DELETE' });
    if (!response.ok) await fail(response, 'Failed to rate theme');
    const raw = (unwrapBody(await parseJson(response)) ?? {}) as Record<string, unknown>;
    return {
      rating: Math.max(0, Math.min(5, Number(raw.rating) || 0)),
      ratingCount: Math.max(0, Number(raw.rating_count) || 0),
      myRating: Math.max(0, Math.min(5, Number(raw.my_rating) || 0)),
    };
  }

  /**
   * The signed-in member's ratings for a set of catalog themes. The public
   * catalog is fetched anonymously (and cached), so "my rating" has to come
   * from an authenticated read of the same list.
   */
  async myRatings(): Promise<Map<number, number>> {
    const out = new Map<number, number>();
    if (!ucCloudAuthService.isAuthenticated()) return out;
    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes?per_page=100&orderby=downloads`);
    if (!response.ok) return out;
    const raw = unwrapBody(await parseJson(response)) as Record<string, unknown> | null;
    const list = raw && Array.isArray(raw.themes) ? (raw.themes as Record<string, unknown>[]) : [];
    for (const item of list) {
      const id = Number(item.id);
      const mine = Number(item.my_rating) || 0;
      if (id > 0 && mine > 0) out.set(id, mine);
    }
    return out;
  }

  async withdraw(id: number): Promise<AuthorTheme> {
    requireAuth('withdraw themes');
    const response = await ucCloudAuthService.authenticatedFetch(`${API_BASE}/themes/${id}/withdraw`, {
      method: 'POST',
    });
    if (!response.ok) await fail(response, 'Failed to withdraw theme');
    return normalizeAuthorTheme(await parseJson(response));
  }
}

export const ucThemeAuthorService = new UcThemeAuthorService();
