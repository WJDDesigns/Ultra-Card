import type { CardModule, LayoutConfig } from '../types';
import { forEachLayoutModule } from './uc-layout-module-types';

/**
 * Deciding when a card must re-render on *any* hass change.
 *
 * The card normally filters hass updates down to the entities its config
 * mentions. That filter is only valid when every source of change is
 * discoverable from the config. Three things break that assumption:
 *
 *  1. Modules that build their content by scanning the whole state machine —
 *     an entity they care about may appear or change without ever being named
 *     in the config.
 *  2. Third-party cards embedded via `external_card`, which receive `hass` and
 *     decide for themselves what matters.
 *  3. Time-based display conditions, which change with the clock rather than
 *     with any entity, and rely on hass ticks to be re-evaluated.
 *
 * Keep this list in step with modules that scan `hass.states` wholesale. A
 * module missing from here will appear to freeze; a module wrongly added here
 * only costs extra renders.
 */

/** Modules that always scan the full state machine, whatever their config. */
const ALWAYS_SCANS_ALL_STATES = new Set([
  'alert_center',
  'auto_entity_list',
  'update_monitor',
  'appliance',
  'area_summary',
]);

/** Modules that scan the full state machine only when auto-discovery is on. */
function scansAllStatesWhenConfigured(mod: Record<string, unknown>): boolean {
  switch (mod.type) {
    case 'activity_feed':
    case 'grid':
      return mod.enable_auto_filter === true;
    case 'battery_monitor':
    case 'battery_fleet':
    case 'vampire_power':
      return (mod.discovery_mode ?? 'auto') !== 'manual';
    case 'dynamic_list':
      // Resolves the "first available" todo entity by scanning for `todo.*`.
      return mod.source_type === 'todo' || mod.source_type === 'todo-template';
    default:
      return false;
  }
}

export function moduleRequiresBroadHassUpdates(module: CardModule | null | undefined): boolean {
  if (!module || typeof module !== 'object') return false;
  const mod = module as unknown as Record<string, unknown>;
  const type = typeof mod.type === 'string' ? mod.type : '';

  if (type === 'external_card') return true;
  if (ALWAYS_SCANS_ALL_STATES.has(type)) return true;
  return scansAllStatesWhenConfigured(mod);
}

/** A condition that changes with the clock rather than with an entity. */
function hasTimeCondition(conditions: unknown): boolean {
  if (!Array.isArray(conditions)) return false;
  return conditions.some(c => c && typeof c === 'object' && (c as { type?: unknown }).type === 'time');
}

/**
 * True when this layout contains anything whose output can change without one
 * of its configured entities changing.
 */
export function layoutRequiresBroadHassUpdates(layout: LayoutConfig | null | undefined): boolean {
  if (!layout?.rows) return false;

  for (const row of layout.rows) {
    if (hasTimeCondition(row.display_conditions)) return true;
    for (const col of row.columns || []) {
      if (hasTimeCondition(col.display_conditions)) return true;
    }
  }

  let broad = false;
  forEachLayoutModule(layout, mod => {
    if (broad) return;
    if (moduleRequiresBroadHassUpdates(mod)) {
      broad = true;
      return;
    }
    if (hasTimeCondition((mod as unknown as Record<string, unknown>).display_conditions)) {
      broad = true;
    }
  });

  return broad;
}
