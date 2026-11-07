import type { UltraCardConfig } from '../types';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';
import { collectStateColorEntities } from './uc-state-color';

/**
 * What a navbar has to watch in hass to stay current on its own.
 *
 * The navbar is drawn by the navigation service, outside the card that holds
 * it, and an 'all_views' navbar keeps showing after that card leaves the
 * screen. The card then gets no more hass updates, so anything in the navbar
 * that depends on an entity (colour by entity state, badges, item visibility,
 * the media player) would freeze until the app is restarted. The service polls
 * the entities listed here and redraws when one of them changes.
 */
export interface NavLiveEntities {
  entities: Set<string>;
  /** The navbar has JS templates, which can read any entity: redraw on every hass change. */
  anyChange: boolean;
}

const cache = new WeakMap<object, { config: unknown; result: NavLiveEntities }>();

export function collectNavLiveEntities(module: unknown, config?: UltraCardConfig): NavLiveEntities {
  if (!module || typeof module !== 'object') return { entities: new Set(), anyChange: false };
  const cached = cache.get(module);
  if (cached && cached.config === config) return cached.result;

  const entities = new Set<string>();
  let anyChange = false;

  const add = (value: string): void => {
    const v = value.trim();
    if (!v) return;
    if (v.startsWith('$')) {
      const resolved = ucCustomVariablesService.resolveEntityField(v, config);
      if (resolved && resolved.includes('.')) entities.add(resolved);
      else anyChange = true; // unresolved variable: can't know which entity it is
      return;
    }
    if (/^[a-z0-9_]+\.[a-z0-9_]+$/i.test(v)) entities.add(v);
  };

  collectStateColorEntities(module, add);

  const seen = new Set<unknown>();
  const walk = (node: unknown, depth: number): void => {
    if (!node || typeof node !== 'object' || depth > 10 || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach(item => {
        if (typeof item === 'string') checkTemplate(item);
        else walk(item, depth + 1);
      });
      return;
    }
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      if (typeof val === 'string') {
        checkTemplate(val);
        const k = key.toLowerCase();
        if (k.includes('entity')) add(val);
        continue;
      }
      if (Array.isArray(val) && key.toLowerCase().includes('entit')) {
        val.forEach(e => {
          if (typeof e === 'string') add(e);
        });
      }
      if (val && typeof val === 'object') walk(val, depth + 1);
    }
  };
  const checkTemplate = (s: string): void => {
    if (s.includes('[[[')) anyChange = true;
  };
  walk(module, 0);

  const result = { entities, anyChange };
  cache.set(module, { config, result });
  return result;
}
