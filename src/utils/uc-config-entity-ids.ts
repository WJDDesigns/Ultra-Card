import type { UltraCardConfig } from '../types';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';
import { forEachNestedChildModules } from './uc-layout-module-types';

/**
 * Collecting every entity a card config refers to, so hass updates can be
 * filtered down to the ones that can actually change what is rendered.
 *
 * The scan is deliberately broad because module schemas vary: it picks up any
 * string property whose name contains "entity", `entities` arrays in either
 * shape, entity fields inside arrays of objects, one level of nested objects,
 * and the targets of tap/hold/double-tap actions.
 *
 * `incomplete` reports that a `$variable` reference could not be resolved. The
 * returned set is then known to be missing entities, and callers must fall back
 * to re-rendering on every hass change rather than silently dropping updates.
 */
export interface ConfigEntityIds {
  ids: Set<string>;
  incomplete: boolean;
}

export function collectConfigEntityIds(config: UltraCardConfig | undefined): ConfigEntityIds {
  const ids = new Set<string>();
  let incomplete = false;

  if (!config?.layout?.rows) return { ids, incomplete };

  const addEntityValue = (val: string): void => {
    if (val.startsWith('$')) {
      const resolved = ucCustomVariablesService.resolveEntityField(val, config);
      if (resolved && resolved.includes('.')) ids.add(resolved);
      else incomplete = true;
    } else if (val.includes('.')) {
      ids.add(val);
    }
  };

  const collectFromAction = (action: any): void => {
    if (!action || typeof action !== 'object') return;
    const stack: any[] = [action];
    const seen = new Set<any>();
    while (stack.length) {
      const obj = stack.pop();
      if (!obj || typeof obj !== 'object' || seen.has(obj)) continue;
      seen.add(obj);
      if (typeof obj.entity === 'string') addEntityValue(obj.entity);
      if (typeof obj.entity_id === 'string') addEntityValue(obj.entity_id);
      if (Array.isArray(obj.entity_id)) {
        for (const e of obj.entity_id) {
          if (typeof e === 'string') addEntityValue(e);
        }
      }
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v && typeof v === 'object') {
          if (Array.isArray(v)) {
            for (const item of v) {
              if (item && typeof item === 'object') stack.push(item);
            }
          } else {
            stack.push(v);
          }
        }
      }
    }
  };

  const collectFromModule = (mod: any): void => {
    if (!mod || typeof mod !== 'object') return;

    for (const key of Object.keys(mod)) {
      const val = mod[key];

      if (key === 'display_conditions' && Array.isArray(val)) {
        val.forEach((c: any) => {
          if (c?.entity && typeof c.entity === 'string') addEntityValue(c.entity);
        });
        continue;
      }

      // Skip non-entity config keys to avoid false positives
      if (key === 'type' || key === 'id' || key.startsWith('_')) continue;

      // String property whose name contains "entity" → likely an entity ID
      if (typeof val === 'string' && key.toLowerCase().includes('entity')) {
        addEntityValue(val);
        continue;
      }

      // `entities` array: string[] or { entity: string }[]
      if (key === 'entities' && Array.isArray(val)) {
        val.forEach((e: any) => {
          if (typeof e === 'string') addEntityValue(e);
          else if (e?.entity && typeof e.entity === 'string') addEntityValue(e.entity);
        });
        continue;
      }

      // Any array-of-objects: scan each item for `entity` and `*_entity` fields
      // (covers icons, bars, nodes, markers, calendars, presets, toggle_points, rules, etc.)
      if (Array.isArray(val)) {
        for (const item of val) {
          if (!item || typeof item !== 'object') {
            if (typeof item === 'string') addEntityValue(item);
            continue;
          }
          for (const itemKey of Object.keys(item)) {
            const itemVal = item[itemKey];
            if (typeof itemVal === 'string' && itemKey.toLowerCase().includes('entity')) {
              addEntityValue(itemVal);
            }
            // Handle nested entities arrays inside items (e.g. presets[].entities)
            if (itemKey === 'entities' && Array.isArray(itemVal)) {
              itemVal.forEach((e: any) => {
                if (typeof e === 'string') addEntityValue(e);
                else if (e?.entity && typeof e.entity === 'string') addEntityValue(e.entity);
              });
            }
          }
        }
        continue;
      }

      // Shallow object scan (e.g. nav_media_player.entity, banner_settings.background_entity)
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        for (const subKey of Object.keys(val)) {
          const subVal = val[subKey];
          if (typeof subVal === 'string' && subKey.toLowerCase().includes('entity')) {
            addEntityValue(subVal);
          }
        }
      }
    }

    collectFromAction(mod.tap_action);
    collectFromAction(mod.hold_action);
    collectFromAction(mod.double_tap_action);
  };

  const processModules = (modules: any[]): void => {
    for (const mod of modules) {
      collectFromModule(mod);
      // Recurse into container modules (horizontal, vertical, accordion, tabs.sections, panes, …)
      forEachNestedChildModules(mod, processModules);
    }
  };

  for (const row of config.layout.rows) {
    row.display_conditions?.forEach(c => {
      if (c.entity && typeof c.entity === 'string') addEntityValue(c.entity);
    });
    for (const col of row.columns || []) {
      col.display_conditions?.forEach(c => {
        if (c.entity && typeof c.entity === 'string') addEntityValue(c.entity);
      });
      processModules(col.modules || []);
    }
  }

  return { ids, incomplete };
}

/**
 * True when any of `ids` points at a different state object between two hass
 * instances. HA creates a new state object for every state *or attribute*
 * change, so identity comparison catches both.
 */
export function anyEntityChanged(
  ids: Iterable<string>,
  oldStates: Record<string, unknown> | undefined,
  newStates: Record<string, unknown> | undefined
): boolean {
  for (const id of ids) {
    if (oldStates?.[id] !== newStates?.[id]) return true;
  }
  return false;
}
