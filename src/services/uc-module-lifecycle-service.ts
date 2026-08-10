import { ucCardInstanceRegistry } from './uc-card-instance-registry';
import { getModuleRegistry } from '../modules/module-registry';
import { collectModuleTypesFromLayout } from '../utils/uc-layout-module-types';

/**
 * Releases resources held by module implementations once no live card uses them.
 *
 * Module implementations are per-type singletons shared by every Ultra Card on
 * the page, so a card cannot tear one down on its own disconnect without
 * breaking its siblings. This service reference-counts by scanning the configs
 * of all still-registered cards: a module type absent from every one of them
 * has no remaining owner and can safely release its timers and subscriptions.
 *
 * Modules opt in by exposing a `destroy()` method (or the older `cleanup()`). It
 * must be idempotent and leave the instance reusable, because the same singleton
 * is reused if a card using that module type is added back to the page.
 *
 * Template subscriptions are additionally released generically, since most
 * modules that own one never declared a teardown hook and their subscriptions
 * would otherwise accumulate for the lifetime of the browser tab — the reason
 * long-lived wall tablets get slower over hours.
 */

interface DestroyableModule {
  destroy?: () => void;
  /** Older teardown hook, predating `destroy()`. Same contract. */
  cleanup?: () => void;
  /**
   * Not part of the module contract, but 13 module implementations own one of
   * these and each render_template subscription it holds is a real backend task
   * in HA. Released generically so a module without its own teardown hook cannot
   * silently leak subscriptions for the lifetime of the browser tab.
   */
  _templateService?:
    | {
        unsubscribeAllTemplates?: () => Promise<void> | void;
      }
    | undefined;
}

/**
 * Run a module's own teardown hook, whichever convention it uses.
 * Returns true if the module had one.
 */
function runTeardownHook(module: DestroyableModule, type: string): boolean {
  const hook = typeof module.destroy === 'function' ? module.destroy : module.cleanup;
  if (typeof hook !== 'function') return false;
  try {
    hook.call(module);
  } catch (error) {
    console.warn(`[UltraCard] Failed to release module "${type}":`, error);
  }
  return true;
}

/**
 * Drop the module's template subscriptions. Safe because every implementation
 * recreates the service lazily (`if (!this._templateService)`) on its next
 * render, so the singleton stays reusable when a card comes back.
 */
function releaseTemplateSubscriptions(module: DestroyableModule, type: string): void {
  const service = module._templateService;
  if (!service || typeof service.unsubscribeAllTemplates !== 'function') return;
  try {
    const result = service.unsubscribeAllTemplates();
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {
        // Teardown is best effort; a failed unsubscribe must not surface here.
      });
    }
    module._templateService = undefined;
  } catch (error) {
    console.warn(`[UltraCard] Failed to release template subscriptions for "${type}":`, error);
  }
}

/** Module types currently present in the config of at least one live card. */
function collectTypesInUse(): Set<string> {
  const inUse = new Set<string>();
  for (const entry of ucCardInstanceRegistry.getAll()) {
    const config = entry.getConfig();
    if (!config?.layout) continue;
    for (const type of collectModuleTypesFromLayout(config.layout)) {
      inUse.add(type);
    }
  }
  return inUse;
}

/**
 * Call `destroy()` on every loaded module implementation that no live card
 * still references. Call after a card unregisters from the instance registry.
 */
export function releaseUnusedModuleInstances(): void {
  let inUse: Set<string>;
  try {
    inUse = collectTypesInUse();
  } catch {
    // A malformed config must never prevent a card from unmounting; skipping
    // teardown only leaks, whereas throwing here breaks disconnectedCallback.
    return;
  }

  for (const module of getModuleRegistry().getAllModules()) {
    const type = module?.metadata?.type;
    if (!type || inUse.has(type)) continue;

    const candidate = module as DestroyableModule;
    runTeardownHook(candidate, type);
    // Also run unconditionally: a module's own hook may not cover its template
    // service, and most modules have no hook at all.
    releaseTemplateSubscriptions(candidate, type);
  }
}
