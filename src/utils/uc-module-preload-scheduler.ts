import type { ModuleRegistry } from '../modules/module-registry';

/**
 * Controls background eager module chunk preloading after the card bundle loads.
 * - `batched` (default): bounded concurrency; gaps between batches via `requestIdleCallback` when available.
 * - `full`: start every load together (legacy burst; still uses `allSettled` so one failure does not cancel others).
 * - `minimal`: skip background preload; implementations load on first `ensureModuleLoaded` from UI.
 */
export type UltraCardModulePreloadMode = 'batched' | 'full' | 'minimal';

const LOCAL_STORAGE_KEY = 'ultra-card-module-preload';

const DEFAULT_CONCURRENCY = 3;

type RegistryPick = Pick<
  ModuleRegistry,
  'getAllModuleMetadata' | 'canLoadModule' | 'ensureModuleLoaded'
>;

function normalizeMode(raw: string | null | undefined): UltraCardModulePreloadMode | null {
  if (raw == null || raw === '') return null;
  const v = raw.trim().toLowerCase();
  if (v === 'off' || v === 'none' || v === 'minimal') return 'minimal';
  if (v === 'full' || v === 'parallel') return 'full';
  if (v === 'batched' || v === 'default') return 'batched';
  return null;
}

/**
 * Resolve preload mode: `window.__ultraCardModulePreload`, then `localStorage['ultra-card-module-preload']`, else `batched`.
 */
export function resolveUltraCardModulePreloadMode(): UltraCardModulePreloadMode {
  if (typeof window === 'undefined') return 'batched';
  const w = window as Window & { __ultraCardModulePreload?: string };
  const fromWindow = normalizeMode(w.__ultraCardModulePreload);
  if (fromWindow) return fromWindow;
  try {
    const fromLs = normalizeMode(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (fromLs) return fromLs;
  } catch {
    /* private mode / blocked storage */
  }
  return 'batched';
}

function collectPreloadTypes(registry: RegistryPick): string[] {
  return registry
    .getAllModuleMetadata()
    .map(m => m.type)
    .filter(t => registry.canLoadModule(t));
}

function logPreloadFailures(types: string[], results: PromiseSettledResult<void>[]): void {
  const failed = types.filter((_, i) => results[i].status === 'rejected');
  if (failed.length) {
    console.warn('[UltraCard] Module preload had failures:', failed.join(', '));
  }
}

function waitBetweenBatches(batchIndex: number): Promise<void> {
  return new Promise(resolve => {
    if (batchIndex === 0) {
      queueMicrotask(() => resolve());
      return;
    }
    const done = () => resolve();
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(done, { timeout: 2500 });
    } else {
      setTimeout(done, 32 * batchIndex);
    }
  });
}

async function runBatchedPreload(
  registry: RegistryPick,
  types: string[],
  concurrency: number
): Promise<void> {
  for (let i = 0; i < types.length; i += concurrency) {
    const slice = types.slice(i, i + concurrency);
    const batchIndex = i / concurrency;
    await waitBetweenBatches(batchIndex);
    const results = await Promise.allSettled(slice.map(t => registry.ensureModuleLoaded(t)));
    logPreloadFailures(slice, results);
  }
}

/**
 * Fire-and-forget background preload of all core module implementations that have loaders.
 * Honors `resolveUltraCardModulePreloadMode()` and never throws to the caller.
 */
export function scheduleBackgroundModulePreloads(registry: RegistryPick): void {
  const mode = resolveUltraCardModulePreloadMode();
  if (mode === 'minimal') return;

  const types = collectPreloadTypes(registry);
  if (types.length === 0) return;

  if (mode === 'full') {
    void Promise.allSettled(types.map(t => registry.ensureModuleLoaded(t))).then(results => {
      logPreloadFailures(types, results);
    });
    return;
  }

  void runBatchedPreload(registry, types, DEFAULT_CONCURRENCY).catch(err => {
    console.warn('[UltraCard] Module preload failed:', err);
  });
}
