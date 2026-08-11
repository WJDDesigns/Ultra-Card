import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ucCloudSyncService,
  CloudFavorite,
  COLOR_SYNC_UNAVAILABLE,
} from './uc-cloud-sync-service';
import { ucCloudAuthService } from './uc-cloud-auth-service';
import { safeGetItem, safeSetItem } from '../utils/safe-storage';

const STORAGE_KEY = 'ultra-card-favorites';

/** Reach the private downloader without exercising the network path. */
const downloadFavorites = (favorites: CloudFavorite[]): Promise<any[]> =>
  (ucCloudSyncService as any)._downloadFavorites(favorites);

function makeCloudFavorite(id: string, name: string): CloudFavorite {
  return {
    id,
    name,
    description: '',
    row_data: JSON.stringify({ id: `row-${id}`, columns: [] }),
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    tags: [],
    user_id: 1,
  };
}

function seedLocal(names: string[]): void {
  safeSetItem(
    STORAGE_KEY,
    JSON.stringify(
      names.map(n => ({
        id: n,
        name: n,
        row: { id: `row-${n}`, columns: [] },
        created: '2026-01-01T00:00:00.000Z',
        tags: [],
      }))
    )
  );
}

function readLocal(): any[] {
  return JSON.parse(safeGetItem(STORAGE_KEY) || '[]');
}

describe('UcCloudSyncService._downloadFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('preserves local favorites that were not part of the download batch', async () => {
    // The regression: _downloadFavorites receives only the subset needing a
    // download, so writing it directly used to delete everything else.
    seedLocal(['keep-a', 'keep-b', 'keep-c']);

    await downloadFavorites([makeCloudFavorite('remote-1', 'Remote One')]);

    const names = readLocal().map(f => f.id).sort();
    expect(names).toEqual(['keep-a', 'keep-b', 'keep-c', 'remote-1']);
  });

  it('updates an existing favorite in place rather than duplicating it', async () => {
    seedLocal(['shared']);

    await downloadFavorites([makeCloudFavorite('shared', 'Renamed From Cloud')]);

    const local = readLocal();
    expect(local).toHaveLength(1);
    expect(local[0].name).toBe('Renamed From Cloud');
  });

  it('leaves local storage untouched for an empty batch', async () => {
    seedLocal(['keep-a', 'keep-b']);

    const result = await downloadFavorites([]);

    expect(result).toEqual([]);
    expect(readLocal()).toHaveLength(2);
  });

  it('notifies ucFavoritesService so its in-memory cache reloads', async () => {
    seedLocal(['keep-a']);
    const listener = vi.fn();
    window.addEventListener('ultra-card-favorites-changed', listener);

    await downloadFavorites([makeCloudFavorite('remote-1', 'Remote One')]);

    expect(listener).toHaveBeenCalled();
    window.removeEventListener('ultra-card-favorites-changed', listener);
  });

  it('returns only the downloaded entries so sync counts stay accurate', async () => {
    seedLocal(['keep-a', 'keep-b', 'keep-c']);

    const result = await downloadFavorites([
      makeCloudFavorite('remote-1', 'Remote One'),
      makeCloudFavorite('remote-2', 'Remote Two'),
    ]);

    expect(result).toHaveLength(2);
  });
});

/**
 * Presets are keyed `wp-<id>` in the card but the reviews API reads preset_id
 * with intval(), so a prefixed id arrived as 0 and every rating was rejected
 * with a 400 — silently, leaving the whole catalogue on zero votes.
 */
describe('preset rating submits a WordPress preset ID', () => {
  const authFetch = () =>
    vi.spyOn(ucCloudAuthService, 'authenticatedFetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        preset_id: '7259',
        rating: 5,
        user_id: 1,
        created: '2026-01-01T00:00:00.000Z',
        updated: '2026-01-01T00:00:00.000Z',
        preset_rating: 4.5,
        preset_rating_count: 12,
      }),
    } as Response);

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(ucCloudAuthService, 'isAuthenticated').mockReturnValue(true);
  });

  it('strips the wp- prefix so the server does not read preset_id as 0', async () => {
    const fetchSpy = authFetch();

    await ucCloudSyncService.submitReview('wp-7259', 5);

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({ preset_id: '7259', rating: 5 });
  });

  it('passes an already-bare id through untouched', async () => {
    const fetchSpy = authFetch();

    await ucCloudSyncService.submitReview('7259', 4);

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.preset_id).toBe('7259');
  });

  it('refuses ids that are not a WordPress preset instead of posting a 0', async () => {
    const fetchSpy = authFetch();

    await expect(ucCloudSyncService.submitReview('wp-error-6152', 5)).rejects.toThrow(
      /cannot be rated/i
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns the recalculated aggregate so the stars can refresh', async () => {
    authFetch();

    const review = await ucCloudSyncService.submitReview('wp-7259', 5);

    expect(review.preset_rating).toBe(4.5);
    expect(review.preset_rating_count).toBe(12);
  });

  it('finds the stored vote when looked up by the prefixed card id', async () => {
    authFetch();
    vi.spyOn(ucCloudAuthService, 'getCurrentUser').mockReturnValue({ id: 1 } as any);

    await ucCloudSyncService.submitReview('wp-7259', 5);

    // The server stores a bare id; the Hub asks with `wp-7259`.
    expect(ucCloudSyncService.getUserReview('wp-7259')?.rating).toBe(5);
  });
});

/**
 * C5: colour sync had no merge, upload or download, yet reported success and
 * stamped a last-synced time — so the Hub showed a recent backup for data that
 * had never left the device.
 */
describe('colour sync honesty', () => {
  beforeEach(() => {
    vi.spyOn(ucCloudAuthService, 'isAuthenticated').mockReturnValue(true);
  });

  it('reports colour sync as unavailable', () => {
    expect(ucCloudSyncService.isColorSyncAvailable()).toBe(false);
  });

  it('does not report success for a sync it cannot perform', async () => {
    const result = await ucCloudSyncService.syncFavoriteColors();

    expect(result.success).toBe(false);
    expect(result.synced).toBe(0);
    expect(result.errors[0]).toBe(COLOR_SYNC_UNAVAILABLE);
  });

  it('does not stamp a last-synced time', async () => {
    const before = ucCloudSyncService.getSyncStatus().lastColorsSync ?? null;

    await ucCloudSyncService.syncFavoriteColors();

    expect(ucCloudSyncService.getSyncStatus().lastColorsSync ?? null).toEqual(before);
  });

  it('still refuses when not authenticated', async () => {
    vi.spyOn(ucCloudAuthService, 'isAuthenticated').mockReturnValue(false);

    await expect(ucCloudSyncService.syncFavoriteColors()).rejects.toThrow(/not authenticated/i);
  });

  it('does not queue colour changes that can never be sent', () => {
    const before = ucCloudSyncService.getSyncStatus().pendingChanges;

    ucCloudSyncService.queueChange('color', 'create', { id: 'c1', color: '#fff' });

    expect(ucCloudSyncService.getSyncStatus().pendingChanges).toBe(before);
  });
});
