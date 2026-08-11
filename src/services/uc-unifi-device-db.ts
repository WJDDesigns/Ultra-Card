/**
 * Ubiquiti public device database.
 *
 * Fetches https://static.ui.com/fingerprint/ui/public.json (the same catalog
 * the UniFi controller UI uses) and builds a model-shortname → product map so
 * the card can show real device photos and classify hardware authoritatively.
 *
 * - Cached in localStorage for 7 days; in-memory for the session.
 * - Lookups are synchronous (null until loaded); callers register a listener
 *   to re-render once the catalog arrives.
 * - Images are served resized through Ubiquiti's own image proxy, so nothing
 *   is bundled and full-resolution photos are never downloaded.
 */

const DB_URL = 'https://static.ui.com/fingerprint/ui/public.json';
const IMAGE_BASE = 'https://static.ui.com/fingerprint/ui/images';
const IMAGE_PROXY = 'https://images.svc.ui.com/';
const CACHE_KEY = 'uc-unifi-device-db-v2';
const CACHE_TTL_MS = 7 * 24 * 3600_000;

export type UnifiDbDeviceType =
  | 'access-point'
  | 'switch'
  | 'console'
  | 'gateway'
  | 'router'
  | 'power-supply'
  | 'camera'
  | 'mesh-point'
  | string;

export interface UnifiDbEntry {
  /** Catalog guid, used in image paths. */
  id: string;
  /** Marketing name, e.g. "Access Point U7 Pro Max". */
  name: string;
  deviceType: UnifiDbDeviceType;
  sku: string;
  /** Image content hashes by type. */
  images: { default?: string; nopadding?: string; topology?: string };
}

export interface RawDbDevice {
  id?: string;
  deviceType?: string;
  sku?: string;
  shortnames?: string[];
  sysids?: string[];
  triplets?: Array<{ k1?: string }>;
  product?: { name?: string; abbrev?: string };
  images?: { default?: string; nopadding?: string; topology?: string };
}

interface CachePayload {
  at: number;
  entries: Array<UnifiDbEntry & { keys: string[]; sysids?: string[] }>;
}

/** Normalize a model string for lookup: uppercase alphanumerics only. */
export function normalizeModelKey(model: string | null | undefined): string {
  if (!model) return '';
  return model.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

type LoadState = 'idle' | 'loading' | 'ready' | 'failed';

class UcUnifiDeviceDb {
  private byKey = new Map<string, UnifiDbEntry>();
  private bySysid = new Map<string, UnifiDbEntry>();
  private state: LoadState = 'idle';
  private listeners = new Set<() => void>();

  /** Synchronous lookup by HA device model (e.g. "U7PIW", "USW-Pro-24-PoE"). */
  lookup(model: string | null | undefined): UnifiDbEntry | null {
    const key = normalizeModelKey(model);
    if (!key) return null;
    const direct = this.byKey.get(key);
    if (direct) return direct;
    // Newer gear often reports "<family><sysid>" (e.g. "USWED72" = USW + sysid
    // ed72 = Switch Pro HD 24 PoE). Try the trailing 4 hex chars as a sysid.
    if (key.length >= 5) {
      const tail = key.slice(-4);
      if (/^[0-9A-F]{4}$/.test(tail)) {
        const bySys = this.bySysid.get(tail.toLowerCase());
        if (bySys) return bySys;
      }
    }
    return null;
  }

  isReady(): boolean {
    return this.state === 'ready';
  }

  /** Index a raw catalog directly (tests / preloaded data), skipping fetch. */
  prime(devices: RawDbDevice[]): void {
    this.index(this.compact(devices));
    this.state = 'ready';
    this.notify();
  }

  /**
   * Kick off (or reuse) the catalog load. The callback fires once when the
   * catalog becomes available; safe to call every render.
   */
  ensureLoaded(onReady?: () => void): void {
    if (this.state === 'ready' || this.state === 'failed') return;
    if (onReady) this.listeners.add(onReady);
    if (this.state === 'loading') return;
    this.state = 'loading';

    const cached = this.readCache();
    if (cached) {
      this.index(cached.entries);
      this.state = 'ready';
      this.notify();
      return;
    }

    fetch(DB_URL, { mode: 'cors' })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: { devices?: RawDbDevice[] }) => {
        const entries = this.compact(json?.devices || []);
        this.index(entries);
        this.writeCache(entries);
        this.state = 'ready';
        this.notify();
      })
      .catch(() => {
        // Offline / blocked — procedural faceplates keep working.
        this.state = 'failed';
        this.listeners.clear();
      });
  }

  /** Resized product image URL, or null when the entry has no such image. */
  imageUrl(
    entry: UnifiDbEntry,
    type: 'default' | 'nopadding' | 'topology',
    width: number
  ): string | null {
    // Fall back to another image type, keeping path type and hash in sync.
    const actualType = entry.images[type] ? type : entry.images.nopadding ? 'nopadding' : 'default';
    const hash = entry.images[actualType];
    if (!hash) return null;
    const path = `${IMAGE_BASE}/${entry.id}/${actualType}/${hash}.png`;
    return `${IMAGE_PROXY}?u=${encodeURIComponent(path)}&w=${Math.round(width)}`;
  }

  private compact(
    devices: RawDbDevice[]
  ): Array<UnifiDbEntry & { keys: string[]; sysids?: string[] }> {
    const out: Array<UnifiDbEntry & { keys: string[]; sysids?: string[] }> = [];
    for (const dev of devices) {
      if (!dev?.id) continue;
      const keys = new Set<string>();
      for (const sn of dev.shortnames || []) {
        const k = normalizeModelKey(sn);
        if (k) keys.add(k);
      }
      const skuKey = normalizeModelKey(dev.sku);
      if (skuKey) keys.add(skuKey);
      if (!keys.size) continue;
      const sysids = (dev.sysids || [])
        .map(s => String(s).toLowerCase())
        .filter(s => /^[0-9a-f]{4}$/.test(s));
      out.push({
        id: dev.id,
        name: dev.product?.name || dev.sku || '',
        deviceType: dev.deviceType || '',
        sku: dev.sku || '',
        images: {
          ...(dev.images?.default ? { default: dev.images.default } : {}),
          ...(dev.images?.nopadding ? { nopadding: dev.images.nopadding } : {}),
          ...(dev.images?.topology ? { topology: dev.images.topology } : {}),
        },
        keys: [...keys],
        ...(sysids.length ? { sysids } : {}),
      });
    }
    return out;
  }

  private index(entries: Array<UnifiDbEntry & { keys: string[]; sysids?: string[] }>): void {
    this.byKey.clear();
    this.bySysid.clear();
    for (const e of entries) {
      const { keys, sysids, ...entry } = e;
      for (const k of keys) {
        if (!this.byKey.has(k)) this.byKey.set(k, entry);
      }
      for (const s of sysids || []) {
        if (!this.bySysid.has(s)) this.bySysid.set(s, entry);
      }
    }
  }

  private readCache(): CachePayload | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CachePayload;
      if (!parsed?.at || !Array.isArray(parsed.entries)) return null;
      if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private writeCache(entries: Array<UnifiDbEntry & { keys: string[] }>): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), entries }));
    } catch {
      // Storage full — session cache still works.
    }
  }

  private notify(): void {
    const ls = [...this.listeners];
    this.listeners.clear();
    for (const cb of ls) {
      try {
        cb();
      } catch {
        /* ignore */
      }
    }
  }
}

export const ucUnifiDeviceDb = new UcUnifiDeviceDb();
