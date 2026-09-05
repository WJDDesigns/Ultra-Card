import type { LayoutConfig } from '../types';
import type { ModuleRegistry } from '../modules/module-registry';
import { collectModuleTypesFromLayout } from './uc-layout-module-types';

type RegistryPick = Pick<
  ModuleRegistry,
  'canLoadModule' | 'isModuleLoaded' | 'isModuleLoading' | 'getModuleLoadError' | 'ensureModuleLoaded'
>;

/**
 * Start fetching every lazy module chunk a config refers to, all at once.
 *
 * Without this, a cold view of a busy card loads its chunks in a cascade:
 * config validation pulls the top-level module types, a container module then
 * renders and only at that point does each nested child start its own fetch.
 * Kicking every referenced type off from `setConfig` turns that waterfall into
 * one parallel burst, so nested children usually arrive together with their
 * parent instead of one skeleton after another.
 *
 * Failures are left to the registry's normal error path (sticky per type,
 * surfaced as a "failed to load" tile and, for stale bundles, a reload toast).
 *
 * @returns the module types whose load was started by this call.
 */
export function prefetchModuleChunksForLayout(
  registry: RegistryPick,
  layout: LayoutConfig | undefined | null
): string[] {
  const started: string[] = [];
  for (const type of collectModuleTypesFromLayout(layout)) {
    if (!registry.canLoadModule(type)) continue;
    if (registry.isModuleLoaded(type) || registry.isModuleLoading(type)) continue;
    if (registry.getModuleLoadError(type)) continue;
    started.push(type);
    void registry.ensureModuleLoaded(type).catch(() => {
      /* reported by the registry */
    });
  }
  return started;
}
