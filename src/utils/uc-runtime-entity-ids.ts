import type { UltraCardConfig } from '../types';
import { getModuleRegistry } from '../modules';
import { forEachNestedChildModules } from './uc-layout-module-types';

/**
 * Entity IDs that modules resolve at runtime rather than declaring in config.
 *
 * Seven modules discover entities for themselves (area_summary, plant_care,
 * dog_duty, vehicle_maintenance, cleaning_zones, laundry_tracker,
 * battery_fleet). Only two of those force broad hass updates, so for the rest
 * this walk is the *only* thing that keeps their content live — a render gate
 * that ignores it will appear to freeze those modules.
 *
 * Deliberately not cached: discovery resolves asynchronously (the registry
 * lookup in area-summary-module lands a tick after the layout is first read),
 * so a cached answer would be empty exactly when it matters. Callers recompute
 * per decision.
 */
export function collectRuntimeEntityIds(config: UltraCardConfig | undefined): Set<string> {
  const ids = new Set<string>();
  if (!config?.layout?.rows) return ids;
  const registry = getModuleRegistry();

  const visit = (modules: any[] | undefined): void => {
    if (!modules) return;
    for (const mod of modules) {
      if (!mod || typeof mod !== 'object') continue;
      const handler = mod.type ? registry.getModule(mod.type) : undefined;
      const fn = handler && (handler as any).getRuntimeEntityIds;
      if (typeof fn === 'function') {
        try {
          const arr = fn.call(handler, mod);
          if (Array.isArray(arr)) {
            for (const id of arr) {
              if (typeof id === 'string' && id.includes('.')) ids.add(id);
            }
          }
        } catch {
          // Swallow — runtime collection must never break the render path.
        }
      }
      forEachNestedChildModules(mod as any, visit);
    }
  };

  for (const row of config.layout.rows) {
    for (const col of row.columns || []) {
      visit(col.modules);
    }
  }
  return ids;
}
