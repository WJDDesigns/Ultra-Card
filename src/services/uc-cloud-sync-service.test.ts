import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ucCloudSyncService, CloudFavorite } from './uc-cloud-sync-service';
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
