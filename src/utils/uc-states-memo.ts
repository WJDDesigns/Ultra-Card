/**
 * Caching for values derived from a full `hass.states` scan.
 *
 * Home Assistant replaces the `states` object whenever anything in the state
 * machine changes, so object identity is a sound cache key: a hit proves no
 * state has changed since the value was computed. Renders happen far more often
 * than state changes — template ticks, config edits, sibling modules, preview
 * updates — so caching on identity collapses "one full scan per module per
 * render" down to "one full scan per hass tick".
 *
 * Callers pass a `key` covering every other input the computation reads. Build
 * it from the whole config object rather than hand-picking fields: a scan over
 * a few thousand entities dwarfs stringifying one module's config, and it can't
 * silently go stale when someone adds a new option later.
 */

interface MemoEntry<T> {
  deps: readonly unknown[];
  key: string;
  value: T;
}

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Default cap — comfortably above the module count on a realistic dashboard. */
const DEFAULT_LIMIT = 32;

export class UcStatesMemo<T> {
  private readonly _limit: number;
  private _cache = new Map<string, MemoEntry<T>>();

  constructor(limit: number = DEFAULT_LIMIT) {
    this._limit = limit;
  }

  /**
   * @param id      Stable identity for the caller, normally the module instance id.
   * @param deps    Objects compared by identity — `hass.states` plus any registry
   *                (`hass.entities`, `hass.devices`, `hass.areas`) the scan reads.
   * @param key     Signature of every other input `compute` reads.
   * @param compute Runs only on a miss.
   */
  read(id: string, deps: readonly unknown[], key: string, compute: () => T): T {
    const hit = this._cache.get(id);
    if (hit && hit.key === key && sameDeps(hit.deps, deps)) {
      return hit.value;
    }

    const value = compute();
    this._cache.set(id, { deps, key, value });

    if (this._cache.size > this._limit) {
      // Map iterates in insertion order, so this drops the least recently added.
      const oldest = this._cache.keys().next().value;
      if (oldest !== undefined) this._cache.delete(oldest);
    }

    return value;
  }

  /** Drop a single caller's entry, e.g. when its module is removed. */
  forget(id: string): void {
    this._cache.delete(id);
  }

  clear(): void {
    this._cache.clear();
  }
}

/**
 * Build a cache key from arbitrary inputs. Falls back to a random string when a
 * value will not serialise (circular refs), which forces a miss rather than
 * risking a false hit.
 */
export function statesMemoKey(...parts: unknown[]): string {
  try {
    return JSON.stringify(parts);
  } catch {
    return `__unserializable__${Math.random()}`;
  }
}
