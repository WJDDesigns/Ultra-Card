import type { CardModule, LayoutConfig } from '../../types';
import { getModuleRegistry } from '../../modules/module-registry';
import { forEachLayoutModule } from '../../utils/uc-layout-module-types';

/**
 * Smart-built modules only carry the handful of keys the planner/sanitizer
 * decided on (entity, layout style, ...). Real modules are written against the
 * full shape produced by their `createDefault()` (nested settings objects,
 * display flags, ...), and several of them throw when a nested settings object
 * is missing — which leaves the card stuck on the loading skeleton.
 *
 * Fill every key the module's default config defines but the smart module
 * left undefined. Values the smart pipeline chose are never overwritten.
 */
export async function hydrateSmartLayoutModules(
  layout: LayoutConfig | undefined | null,
  hass?: unknown
): Promise<void> {
  if (!layout?.rows) return;

  const modules: CardModule[] = [];
  forEachLayoutModule(layout, module => {
    modules.push(module);
  });
  if (!modules.length) return;

  const registry = getModuleRegistry();
  const types = Array.from(new Set(modules.map(module => module.type).filter(Boolean)));

  await Promise.all(
    types.map(type =>
      registry.canLoadModule(type) || registry.isModuleLoaded(type)
        ? registry.ensureModuleLoaded(type).catch(() => undefined)
        : Promise.resolve()
    )
  );

  for (const module of modules) {
    if (!module?.type || !registry.isModuleLoaded(module.type)) continue;
    const defaults = registry.createDefaultModule(module.type, module.id, hass);
    if (!defaults) continue;
    applyMissingDefaults(module as unknown as Record<string, unknown>, defaults as unknown as Record<string, unknown>);
  }
}

function applyMissingDefaults(
  module: Record<string, unknown>,
  defaults: Record<string, unknown>
): void {
  for (const [key, value] of Object.entries(defaults)) {
    if (key === 'id' || key === 'type') continue;
    if (module[key] === undefined) {
      module[key] = value;
      continue;
    }
    // Nested settings blocks (name_settings, avatar_settings, ...) are read
    // field-by-field by the modules; fill in any fields the planner skipped.
    if (isPlainObject(module[key]) && isPlainObject(value)) {
      applyMissingDefaults(module[key] as Record<string, unknown>, value as Record<string, unknown>);
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
