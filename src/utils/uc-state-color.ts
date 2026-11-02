import type { DisplayCondition } from '../types';
import { logicService } from '../services/logic-service';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';

/**
 * "Colour by state": any colour field can hold a small rule list instead of a
 * plain colour string. The first rule whose conditions pass wins; otherwise the
 * fallback colour is used.
 *
 *   background_color:
 *     kind: uc-state-color
 *     fallback: var(--divider-color)
 *     rules:
 *       - color: "#ffc107"
 *         match: any
 *         conditions:
 *           - { type: entity_state, entity: light.salzlampe, operator: "=", value: "on" }
 *           - { type: entity_state, entity: light.lichterkette, operator: "=", value: "on" }
 *
 * Modules never see these objects. `resolveStateColorsInConfig` swaps each one
 * for the colour that applies right now before a module renders, so every
 * existing colour field supports it without per-module code.
 */

export const STATE_COLOR_KIND = 'uc-state-color';

export interface StateColorRule {
  id?: string;
  color: string;
  /** 'every' = all conditions must pass (default), 'any' = one is enough. */
  match?: 'every' | 'any';
  conditions: DisplayCondition[];
}

export interface StateColorValue {
  kind: typeof STATE_COLOR_KIND;
  fallback?: string;
  rules: StateColorRule[];
}

export function isStateColor(value: unknown): value is StateColorValue {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value as { kind?: unknown }).kind === STATE_COLOR_KIND
  );
}

export function newStateColorRule(color = '#ffc107'): StateColorRule {
  return {
    id: `scr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    color,
    match: 'every',
    conditions: [newStateColorCondition()],
  };
}

export function newStateColorCondition(): DisplayCondition {
  return {
    id: `cond_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'entity_state',
    entity: '',
    operator: '=',
    value: '',
  };
}

/** Turn a plain colour into a state colour that keeps it as the fallback. */
export function toStateColor(current: unknown): StateColorValue {
  const fallback = typeof current === 'string' ? current : '';
  return { kind: STATE_COLOR_KIND, fallback, rules: [newStateColorRule()] };
}

function conditionEntityId(entity: string | undefined): string {
  if (!entity) return '';
  if (!entity.startsWith('$')) return entity;
  return ucCustomVariablesService.resolveEntityField(entity, logicService.getCardConfig()) || entity;
}

/**
 * A condition counts only when it can actually be checked. The Logic tab shows
 * an element when its entity is missing; for colours that would paint every
 * half-configured rule, so an empty or unknown entity fails here instead.
 */
function conditionPasses(cond: DisplayCondition, states: Record<string, unknown> | undefined): boolean {
  if (!cond || typeof cond !== 'object') return false;
  if (cond.enabled === false) return true;
  const type = cond.type || 'entity_state';
  if (type === 'entity_state' || type === 'entity_attribute' || (type as string) === 'entity') {
    const id = conditionEntityId(cond.entity);
    const stateObj = id ? (states?.[id] as { attributes?: Record<string, unknown> } | undefined) : undefined;
    if (!stateObj) return false;
    if (type === 'entity_attribute') {
      if (!cond.attribute || stateObj.attributes?.[cond.attribute] === undefined) return false;
    }
  } else if (type === 'template') {
    if (!cond.template || !String(cond.template).trim()) return false;
  }
  return logicService.evaluateDisplayConditions([cond], 'every');
}

function rulePasses(rule: StateColorRule, states: Record<string, unknown> | undefined): boolean {
  const conditions = Array.isArray(rule?.conditions) ? rule.conditions : [];
  const active = conditions.filter(c => c && c.enabled !== false);
  if (active.length === 0) return false;
  return rule.match === 'any'
    ? active.some(c => conditionPasses(c, states))
    : active.every(c => conditionPasses(c, states));
}

/** The colour a state colour value stands for right now. Plain strings pass through. */
export function resolveStateColor(
  value: unknown,
  hass?: { states?: Record<string, unknown> } | null
): string | undefined {
  if (!isStateColor(value)) return value as string | undefined;
  const states = hass?.states;
  if (states) {
    for (const rule of value.rules || []) {
      if (rule && typeof rule.color === 'string' && rule.color !== '' && rulePasses(rule, states)) {
        return rule.color;
      }
    }
  }
  return value.fallback || undefined;
}

type Path = Array<string | number>;

/**
 * Keys never walked: nested child modules resolve themselves when they render,
 * and the rest are bulky data that never hold colours.
 */
const SKIP_KEYS = new Set(['modules', 'layout']);

const pathCache = new WeakMap<object, Path[]>();

function findStateColorPaths(root: object): Path[] {
  const cached = pathCache.get(root);
  if (cached) return cached;
  const found: Path[] = [];
  const walk = (node: unknown, path: Path, depth: number): void => {
    if (!node || typeof node !== 'object' || depth > 8) return;
    if (isStateColor(node)) {
      found.push(path);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, [...path, i], depth + 1));
      return;
    }
    for (const key of Object.keys(node)) {
      if (SKIP_KEYS.has(key)) continue;
      const child = (node as Record<string, unknown>)[key];
      if (child && typeof child === 'object') walk(child, [...path, key], depth + 1);
    }
  };
  walk(root, [], 0);
  pathCache.set(root, found);
  return found;
}

function getAt(root: unknown, path: Path): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (node === null || node === undefined) return undefined;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node;
}

function setAt<T>(root: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [key, ...rest] = path;
  const src = root as unknown as Record<string | number, unknown>;
  const copy = (Array.isArray(src) ? [...src] : { ...src }) as Record<string | number, unknown>;
  copy[key] = setAt(src?.[key], rest, value);
  return copy as unknown as T;
}

const resolvedCache = new WeakMap<object, { key: string; result: unknown }>();

/** True when a config (module, row, column…) holds at least one state colour. */
export function hasStateColors(config: unknown): boolean {
  if (!config || typeof config !== 'object') return false;
  return findStateColorPaths(config).length > 0;
}

/**
 * Copy of `config` with every state colour replaced by its current colour.
 * Returns the same object when nothing changes, and the same copy for as long
 * as the resolved colours stay the same, so object identity stays stable.
 */
export function resolveStateColorsInConfig<T>(
  config: T,
  hass?: { states?: Record<string, unknown> } | null
): T {
  if (!config || typeof config !== 'object') return config;
  const paths = findStateColorPaths(config as unknown as object);
  if (paths.length === 0) return config;

  const colors = paths.map(p => resolveStateColor(getAt(config, p), hass));
  const key = JSON.stringify(colors);
  const cached = resolvedCache.get(config as unknown as object);
  if (cached && cached.key === key) return cached.result as T;

  let result: T = config;
  paths.forEach((p, i) => {
    result = setAt(result, p, colors[i]);
  });
  resolvedCache.set(config as unknown as object, { key, result });
  return result;
}

/** Every entity a config's state colours depend on (so hass updates re-render). */
export function collectStateColorEntities(config: unknown, add: (entity: string) => void): void {
  if (!config || typeof config !== 'object') return;
  for (const path of findStateColorPaths(config)) {
    const value = getAt(config, path);
    if (!isStateColor(value)) continue;
    for (const rule of value.rules || []) {
      for (const cond of rule?.conditions || []) {
        if (cond && typeof cond.entity === 'string' && cond.entity) add(cond.entity);
      }
    }
  }
}
