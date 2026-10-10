import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LINKED_ROW_REFRESH_MS,
  UcLinkedRowService,
  linkedModulesKey,
  newLinkedRowId,
  resolveLinkedRowModules,
  type LinkedRowRecord,
} from './uc-linked-row-service';

const SENSOR = 'sensor.ultra_card_pro_cloud_authentication_status';

function row(revision: number, text = 'Hi', id = 'lr_a'): LinkedRowRecord {
  return {
    id,
    name: 'Kitchen',
    modules: [{ id: 't1', type: 'text', text } as any],
    revision,
    updated_at: '2026-10-10T12:00:00+00:00',
  };
}

function makeHass(callApi: any, opts: { version?: string; caps?: Record<string, boolean>; admin?: boolean } = {}) {
  return {
    callApi,
    config: { components: ['ultra_card_pro_cloud'] },
    user: { is_admin: opts.admin ?? true },
    states: {
      [SENSOR]: {
        state: 'connected',
        attributes: {
          integration_version: opts.version ?? '1.10.0',
          capabilities: opts.caps ?? { linked_rows: true },
        },
      },
    },
  } as any;
}

function local(revision: number | undefined, text = 'Hi', id = 'lr_a') {
  return { id: 'm1', type: 'linked_row', linked_id: id, linked_revision: revision, modules: row(1, text).modules } as any;
}

describe('resolveLinkedRowModules', () => {
  it('uses the local copy when unlinked or nothing is cached', () => {
    expect(resolveLinkedRowModules({ modules: [] }, row(3)).source).toBe('local');
    expect(resolveLinkedRowModules(local(1), undefined).source).toBe('local');
  });

  it('uses the shared copy only when it is at a later revision', () => {
    const newer = resolveLinkedRowModules(local(1), row(2, 'New'));
    expect(newer.source).toBe('shared');
    expect(newer.sharedIsNewer).toBe(true);
    expect((newer.modules[0] as any).text).toBe('New');

    const same = resolveLinkedRowModules(local(2, 'Edited'), row(2, 'Old'));
    expect(same.source).toBe('local');
    expect(same.localIsAhead).toBe(true);
  });

  it('always shows the local copy in the editor', () => {
    const r = resolveLinkedRowModules(local(1), row(5, 'New'), { editor: true });
    expect(r.source).toBe('local');
    expect(r.sharedIsNewer).toBe(true);
  });

  it('compares module lists independent of key order', () => {
    expect(linkedModulesKey([{ a: 1, b: 2 }])).toBe(linkedModulesKey([{ b: 2, a: 1 }]));
    expect(newLinkedRowId()).toMatch(/^lr_[A-Za-z0-9_-]{1,61}$/);
  });
});

describe('UcLinkedRowService', () => {
  let now = 1_000_000;
  let svc: UcLinkedRowService;

  beforeEach(() => {
    localStorage.clear();
    now = 1_000_000;
    svc = new UcLinkedRowService(() => now);
  });

  it('never calls Connect when it is not installed or too old', async () => {
    const callApi = vi.fn();
    const missing = { ...makeHass(callApi), config: { components: ['light'] } };
    expect(svc.availability(missing)).toBe('missing');
    const old = makeHass(callApi, { version: '1.9.0', caps: { favorite_colors: true } });
    expect(svc.availability(old)).toBe('outdated');
    svc.ensureFresh(missing, 'lr_a');
    svc.ensureFresh(old, 'lr_a');
    expect(await svc.save(old, { id: 'lr_a', modules: [], baseRevision: 0 })).toEqual({
      ok: false,
      error: 'unavailable',
    });
    expect(callApi).not.toHaveBeenCalled();
  });

  it('fetches once per id, caches in memory and localStorage, and throttles refreshes', async () => {
    const callApi = vi.fn().mockResolvedValue({ row: row(2) });
    const hass = makeHass(callApi);
    const [a, b] = await Promise.all([svc.fetchRow(hass, 'lr_a'), svc.fetchRow(hass, 'lr_a')]);
    expect(callApi).toHaveBeenCalledTimes(1);
    expect(callApi).toHaveBeenCalledWith('GET', 'ultra_card_pro_cloud/linked_rows?id=lr_a');
    expect(a?.revision).toBe(2);
    expect(b).toBe(a);

    svc.ensureFresh(hass, 'lr_a');
    expect(callApi).toHaveBeenCalledTimes(1);
    now += LINKED_ROW_REFRESH_MS + 1;
    svc.ensureFresh(hass, 'lr_a');
    expect(callApi).toHaveBeenCalledTimes(2);

    // A new instance (page reload) starts from this browser's cache.
    const reloaded = new UcLinkedRowService(() => now);
    expect(reloaded.getCached('lr_a')?.revision).toBe(2);
  });

  it('falls back to the cached copy when offline, and latches a 404', async () => {
    const hass = makeHass(vi.fn().mockResolvedValue({ row: row(4) }));
    await svc.fetchRow(hass, 'lr_a');

    const offline = makeHass(vi.fn().mockRejectedValue({ error: 'Request error' }));
    now += LINKED_ROW_REFRESH_MS + 1;
    expect((await svc.fetchRow(offline, 'lr_a'))?.revision).toBe(4);

    const oldConnect = vi.fn().mockRejectedValue({ status_code: 404 });
    const hass404 = makeHass(oldConnect, { caps: {} as any });
    // No sensor capability info at all: probe once, then stop.
    delete hass404.states[SENSOR];
    now += LINKED_ROW_REFRESH_MS + 1;
    expect((await svc.fetchRow(hass404, 'lr_a'))?.revision).toBe(4);
    expect(svc.availability(hass404)).toBe('outdated');
    now += LINKED_ROW_REFRESH_MS + 1;
    svc.ensureFresh(hass404, 'lr_a');
    expect(oldConnect).toHaveBeenCalledTimes(1);
  });

  it('marks ids missing from the library', async () => {
    const hass = makeHass(vi.fn().mockResolvedValue({ row: null }));
    await svc.fetchRow(hass, 'lr_gone');
    expect(svc.isAbsent('lr_gone')).toBe(true);
  });

  it('saves with base_revision and caches the new revision', async () => {
    const callApi = vi.fn().mockResolvedValue({ success: true, row: row(3, 'Mine') });
    const hass = makeHass(callApi);
    const result = await svc.save(hass, { id: 'lr_a', modules: row(1, 'Mine').modules, baseRevision: 2 });
    expect(result.ok).toBe(true);
    expect(callApi).toHaveBeenCalledWith('POST', 'ultra_card_pro_cloud/linked_rows', {
      id: 'lr_a',
      base_revision: 2,
      modules: row(1, 'Mine').modules,
    });
    expect(svc.getCached('lr_a')?.revision).toBe(3);
  });

  it('turns a 409 into a conflict carrying the newer shared copy', async () => {
    const callApi = vi.fn().mockRejectedValue({
      status_code: 409,
      body: { error: 'changed', current: row(7, 'Theirs') },
    });
    const listener = vi.fn();
    svc.subscribe(listener);
    const result = await svc.save(makeHass(callApi), { id: 'lr_a', modules: [], baseRevision: 5 });
    expect(result).toEqual({ ok: false, conflict: row(7, 'Theirs') });
    expect(svc.getConflict('lr_a')?.revision).toBe(7);
    expect(svc.getCached('lr_a')?.revision).toBe(7);
    expect(listener).toHaveBeenCalled();
    svc.clearConflict('lr_a');
    expect(svc.getConflict('lr_a')).toBeUndefined();
  });

  it('auto-shares saved local edits once, for admins only', async () => {
    const callApi = vi.fn().mockResolvedValueOnce({ row: row(2, 'Old') });
    const hass = makeHass(callApi);
    await svc.fetchRow(hass, 'lr_a');
    callApi.mockResolvedValue({ row: row(3, 'Edited') });

    svc.autoPush({ ...hass, user: { is_admin: false } }, local(2, 'Edited'));
    expect(callApi).toHaveBeenCalledTimes(1);

    svc.autoPush(hass, local(2, 'Old')); // unchanged: nothing to share
    expect(callApi).toHaveBeenCalledTimes(1);

    svc.autoPush(hass, local(2, 'Edited'));
    svc.autoPush(hass, local(2, 'Edited'));
    expect(callApi).toHaveBeenCalledTimes(2);
    expect(callApi).toHaveBeenLastCalledWith('POST', 'ultra_card_pro_cloud/linked_rows', {
      id: 'lr_a',
      base_revision: 2,
      modules: local(2, 'Edited').modules,
    });
  });
});
