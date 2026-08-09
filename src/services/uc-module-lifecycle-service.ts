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
 * Modules opt in by exposing a `destroy()` method. It must be idempotent and
 * leave the instance reusable, because the same singleton is reused if a card
 * using that module type is added back to the page.
 */

interface DestroyableModule {
  destroy?: () => void;
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
    const destroy = (module as DestroyableModule).destroy;
    if (typeof destroy !== 'function') continue;
    try {
      destroy.call(module);
    } catch (error) {
      console.warn(`[UltraCard] Failed to release module "${type}":`, error);
    }
  }
}
