import type { HomeAssistant } from 'custom-card-helpers';
import type { UltraCardConfig, CardModule } from '../types';
import { isThirdParty } from './is-third-party';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { dbg3p } from '../utils/uc-debug';
import { ucDashboardScannerService } from '../services/uc-dashboard-scanner-service';

type ModuleKey = string; // dashboardId:cardId:moduleId

interface RegistrationEntry {
  cardId: string;
  modules: Array<{ key: ModuleKey; type: string }>;
}

class ThirdPartyLimitServiceImpl {
  private static readonly STORAGE_PREFIX = 'uc_3p_first_seen_';
  private static readonly LIMIT = 5;

  private registrations = new Map<string, RegistrationEntry>();
  private listeners = new Set<() => void>();
  // Dedup support: eliminate stale duplicate registrations after editor close/remount
  private signatureToCardId = new Map<string, string>();
  private cardIdToSignature = new Map<string, string>();
  private globalScanCache: { keys: Array<{ key: ModuleKey; type: string }>; ts: number } | null =
    null;
  private static readonly GLOBAL_SCAN_TTL = 3000;

  register(cardId: string, dashboardId: string, config: UltraCardConfig): void {
    dbg3p('register:start', { cardId, dashboardId });
    const modules = this.extractModules(dashboardId, cardId, config);
    this.ensureFirstSeen(dashboardId, modules);

    const prev = this.registrations.get(cardId);
    // Idempotent update: only notify if module set actually changed
    const same = prev && this._sameModules(prev.modules, modules);
    if (same) {
      dbg3p('register:no-change', { cardId, count: modules.length });
      return; // no-op
    }

    // Prune any previous registration with identical module signature (editor remount)
    const signature = this._computeModuleSignature(modules);
    const priorCardId = this.signatureToCardId.get(signature);
    if (priorCardId && priorCardId !== cardId) {
      this.registrations.delete(priorCardId);
      this.cardIdToSignature.delete(priorCardId);
      dbg3p('register:prune-duplicate', { priorCardId, cardId });
    }

    this.registrations.set(cardId, { cardId, modules });
    this.signatureToCardId.set(signature, cardId);
    this.cardIdToSignature.set(cardId, signature);
    dbg3p('register:updated', { cardId, count: modules.length });
    this.notify();
  }

  unregister(cardId: string): void {
    this.registrations.delete(cardId);
    const signature = this.cardIdToSignature.get(cardId);
    if (signature && this.signatureToCardId.get(signature) === cardId) {
      this.signatureToCardId.delete(signature);
    }
    this.cardIdToSignature.delete(cardId);
    dbg3p('unregister', { cardId });
    this.notify();
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Force a re-evaluation tick for listeners (use after edits) */
  public trigger(): void {
    this.notify();
  }

  evaluate(hass: HomeAssistant): {
    allowedKeys: Set<ModuleKey>;
    lockedKeys: Set<ModuleKey>;
    totalThirdParty: number;
    isPro: boolean;
  } {
    const dashboardId = this.getDashboardId();
    const isPro = this.isPro(hass);

    // Collect locally registered modules (current view)
    const allModules = Array.from(this.registrations.values()).flatMap(r => r.modules);
    const combinedMap = new Map<ModuleKey, { key: ModuleKey; type: string }>();
    const localSignatures = new Set<string>();
    const dashPrefix = `${dashboardId}:`;
    for (const m of allModules) {
      if (isThirdParty(m.type) && m.key.startsWith(dashPrefix)) {
        combinedMap.set(m.key, m);
        // Track signature type:moduleId to dedupe against global scan
        const sig = this._signatureForKey(m);
        if (sig) localSignatures.add(sig);
      }
    }

    // Merge a cached global scan (all views in current dashboard)
    try {
      const now = Date.now();
      if (
        !this.globalScanCache ||
        now - this.globalScanCache.ts > ThirdPartyLimitServiceImpl.GLOBAL_SCAN_TTL
      ) {
        // Fire and forget; cache will be used on next evaluate
        this.performGlobalScan(hass);
      }
      if (this.globalScanCache) {
        for (const m of this.globalScanCache.keys) {
          if (!m.key.startsWith(dashPrefix)) continue; // keep to current dashboard only
          const sig = this._signatureForKey(m);
          if (sig && localSignatures.has(sig)) continue; // already counted via local registration
          combinedMap.set(m.key, m);
        }
      }
    } catch {}

    const thirdParty = Array.from(combinedMap.values());
    dbg3p('evaluate', { isPro, count: thirdParty.length });

    if (isPro) {
      return {
        allowedKeys: new Set(thirdParty.map(m => m.key)),
        lockedKeys: new Set(),
        totalThirdParty: thirdParty.length,
        isPro,
      };
    }

    // Order by first-seen
    const firstSeen = this.loadFirstSeen(dashboardId);
    const sorted = [...thirdParty].sort(
      (a, b) => (firstSeen[a.key] || 0) - (firstSeen[b.key] || 0)
    );
    const allowed = new Set(sorted.slice(0, ThirdPartyLimitServiceImpl.LIMIT).map(m => m.key));
    const locked = new Set(sorted.slice(ThirdPartyLimitServiceImpl.LIMIT).map(m => m.key));
    dbg3p('evaluate:result', {
      allowed: allowed.size,
      locked: locked.size,
      exampleAllowed: Array.from(allowed).slice(0, 2),
      exampleLocked: Array.from(locked).slice(0, 2),
    });

    return {
      allowedKeys: allowed,
      lockedKeys: locked,
      totalThirdParty: thirdParty.length,
      isPro,
    };
  }

  wouldExceedLimit(hass: HomeAssistant, additionalThirdParty: number): boolean {
    if (this.isPro(hass)) return false;
    const current = this.evaluate(hass).totalThirdParty;
    return current + additionalThirdParty > ThirdPartyLimitServiceImpl.LIMIT;
  }

  // Helpers
  private notify(): void {
    this.listeners.forEach(l => l());
  }

  private _sameModules(
    a: Array<{ key: ModuleKey; type: string }>,
    b: Array<{ key: ModuleKey; type: string }>
  ): boolean {
    if (a.length !== b.length) return false;
    // Compare sorted by key for stability
    const sa = [...a].sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
    const sb = [...b].sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
    for (let i = 0; i < sa.length; i++) {
      if (sa[i].key !== sb[i].key || sa[i].type !== sb[i].type) return false;
    }
    return true;
  }

  private isPro(hass: HomeAssistant): boolean {
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    return (
      !!integrationUser &&
      integrationUser.subscription?.tier === 'pro' &&
      integrationUser.subscription?.status === 'active'
    );
  }

  private getDashboardId(): string {
    const path = window.location.pathname;
    const match = path.match(/\/lovelace\/(.+)$/);
    return match ? match[1] : 'default';
  }

  private storageKey(dashboardId: string): string {
    return `${ThirdPartyLimitServiceImpl.STORAGE_PREFIX}${dashboardId}`;
  }

  private loadFirstSeen(dashboardId: string): Record<ModuleKey, number> {
    try {
      const raw = localStorage.getItem(this.storageKey(dashboardId));
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch {
      return {};
    }
  }

  private saveFirstSeen(dashboardId: string, map: Record<ModuleKey, number>): void {
    try {
      localStorage.setItem(this.storageKey(dashboardId), JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  private ensureFirstSeen(
    dashboardId: string,
    modules: Array<{ key: ModuleKey; type: string }>
  ): void {
    const map = this.loadFirstSeen(dashboardId);
    let updated = false;
    const now = Date.now();
    for (const mod of modules) {
      if (map[mod.key] === undefined) {
        map[mod.key] = now;
        updated = true;
      }
    }
    if (updated) this.saveFirstSeen(dashboardId, map);
  }

  private extractModules(
    dashboardId: string,
    cardId: string,
    config: UltraCardConfig
  ): Array<{ key: ModuleKey; type: string }> {
    const out: Array<{ key: ModuleKey; type: string }> = [];
    try {
      const rows = config?.layout?.rows || [];
      rows.forEach(row => {
        const cols = row.columns || [];
        cols.forEach(col => {
          const mods = col.modules || [];
          mods.forEach(m => {
            // Use dashboard + stable cardId + moduleId to distinguish duplicate cards
            const key = `${dashboardId}:${cardId}:${m.id}`;
            out.push({ key, type: (m as any).type });
          });
        });
      });
    } catch {
      // ignore
    }
    return out;
  }

  // Kick off a scan of the entire dashboard (all views) and cache results
  private async performGlobalScan(hass: HomeAssistant): Promise<void> {
    try {
      ucDashboardScannerService.initialize(hass as any);
      const snapshot = await ucDashboardScannerService.scanDashboard();
      const out: Array<{ key: ModuleKey; type: string }> = [];
      const dashId = this.getDashboardId();
      if (snapshot && Array.isArray(snapshot.cards)) {
        for (const c of snapshot.cards) {
          const cfg = c.config as UltraCardConfig;
          const slotId = this.buildSlotId(c);
          const rows = cfg?.layout?.rows || [];
          rows.forEach((row: any) => {
            (row.columns || []).forEach((col: any) => {
              (col.modules || []).forEach((m: any) => {
                if ((m as any).type === 'external_card') {
                  const key: ModuleKey = `${dashId}:${slotId}:${m.id}`;
                  out.push({ key, type: 'external_card' });
                }
              });
            });
          });
        }
      }
      // Ensure first-seen exists for these
      this.ensureFirstSeen(dashId, out);
      this.globalScanCache = { keys: out, ts: Date.now() };
      dbg3p('global-scan', { total: out.length });
      // Notify listeners so visuals can update quickly
      this.notify();
    } catch (e) {
      dbg3p('global-scan:error');
    }
  }

  private buildSlotId(card: any): string {
    const vp = card?.view_path || card?.view_id || 'default';
    const si = card?.section_index ?? -1;
    const ci = card?.card_index_in_section ?? card?.card_index ?? 0;
    return `${vp}:${si}:${ci}`;
  }

  private _computeModuleSignature(mods: Array<{ key: ModuleKey; type: string }>): string {
    // Use only the module id portion (after last :), ignore card id to prevent double counting
    const ids = mods
      .map(m => {
        const idx = m.key.lastIndexOf(':');
        return `${m.type}:${idx >= 0 ? m.key.substring(idx + 1) : m.key}`;
      })
      .sort();
    return ids.join('|');
  }

  private _signatureForKey(m: { key: ModuleKey; type: string }): string | null {
    const idx = m.key.lastIndexOf(':');
    if (idx < 0) return null;
    return `${m.type}:${m.key.substring(idx + 1)}`;
  }
}

export const ThirdPartyLimitService = new ThirdPartyLimitServiceImpl();

// Helpers exposed for consistent keying across components
export function computeCardInstanceId(config: UltraCardConfig): string {
  // Prefer a stable user-provided name
  if (config.card_name && typeof config.card_name === 'string') {
    return `card:${config.card_name}`;
  }
  // Fallback: hash layout structure deterministically
  try {
    const json = JSON.stringify(config.layout || {});
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      hash = (hash * 31 + json.charCodeAt(i)) >>> 0;
    }
    return `card-hash:${hash.toString(16)}`;
  } catch {
    return `card-hash:0`;
  }
}

export function getCurrentDashboardId(): string {
  const path = window.location.pathname;
  const match = path.match(/\/lovelace\/(.+)$/);
  return match ? match[1] : 'default';
}
