import type { PresetDefinition, SmartGenerateRequest } from '../types';
import { parseSmartCompositionPlan } from './uc-smart-composition-planner';
import { inferEntityTargetsFromPrompt, promptWantsTextContent } from './uc-smart-module-capabilities';
import {
  buildComposedEntityModules,
  buildModulesFromCompositionPlan,
  sanitizeSmartLayout,
  sanitizeSmartModule,
  type SmartSanitizeContext,
  type SmartSanitizeHass,
} from './uc-smart-module-sanitizer';
import { HOUSEHOLD_PROMPT, allPersonEntityIds, promptNamesAPerson } from './smart/smart-module-handlers';
import { stripUnrequestedSeparators } from './smart/smart-sanitize-utils';

type SmartModule = Record<string, unknown>;

/**
 * "Who is home" / "the family" / "everyone" means the whole household. When the AI (or a
 * narrowed entity pick) put only some of the people on the card, swap the first people
 * block for one that shows everyone and drop the rest. Idempotent: a layout that already
 * covers every person is returned untouched.
 */
export function ensureHouseholdPeople(
  modules: SmartModule[],
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  idPrefix: string
): SmartModule[] {
  if (!HOUSEHOLD_PROMPT.test(context.prompt)) return modules;
  const everyone = allPersonEntityIds(hass);
  if (everyone.length < 2 || promptNamesAPerson(context.prompt, hass, everyone)) return modules;

  const shown = new Set<string>();
  let hasPeople = false;
  const scan = (list: unknown[]): void => {
    for (const module of list) {
      if (!module || typeof module !== 'object') continue;
      const record = module as SmartModule;
      if (record.type === 'people') {
        hasPeople = true;
        if (typeof record.person_entity === 'string') shown.add(record.person_entity);
      }
      if (Array.isArray(record.modules)) scan(record.modules);
    }
  };
  scan(modules);
  if (!hasPeople || everyone.every(entityId => shown.has(entityId))) return modules;

  const replacement = sanitizeSmartModule(
    { type: 'people', entities: everyone },
    hass,
    context,
    `${idPrefix}-household`
  );
  if (!replacement || Array.isArray(replacement)) return modules;

  let placed = false;
  const isPeopleOnly = (record: SmartModule): boolean =>
    record.type === 'people' ||
    ((record.type === 'horizontal' || record.type === 'vertical') &&
      Array.isArray(record.modules) &&
      record.modules.length > 0 &&
      record.modules.every(child => !!child && typeof child === 'object' && isPeopleOnly(child as SmartModule)));

  const replace = (list: SmartModule[]): SmartModule[] => {
    const out: SmartModule[] = [];
    for (const module of list) {
      if (!module || typeof module !== 'object') continue;
      if (isPeopleOnly(module)) {
        if (!placed) {
          out.push(replacement);
          placed = true;
        }
        continue;
      }
      if (Array.isArray(module.modules)) {
        const children = replace(module.modules as SmartModule[]);
        if (!children.length) continue;
        out.push({ ...module, modules: children });
        continue;
      }
      out.push(module);
    }
    return out;
  };
  return replace(modules);
}

export type SmartComposeResult = {
  modules: SmartModule[];
  warnings: string[];
};

function collectModuleTypes(modules: unknown[]): Set<string> {
  const types = new Set<string>();
  const walk = (items: unknown[]): void => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const module = item as SmartModule;
      const type = String(module.type || '');
      if (type) types.add(type);
      if (Array.isArray(module.modules)) walk(module.modules);
      if (Array.isArray(module.sections)) {
        for (const section of module.sections) {
          if (section && typeof section === 'object' && Array.isArray((section as SmartModule).modules)) {
            walk((section as SmartModule).modules as unknown[]);
          }
        }
      }
    }
  };
  walk(modules);
  return types;
}

/** Single-entity keys used across Ultra Card modules. */
const ENTITY_ID_KEYS = [
  'entity',
  'weather_entity',
  'person_entity',
  'camera_entity',
  'source_entity',
  'tracking_entity',
  'image_entity',
  'content_entity',
  'solar_entity',
] as const;

/** List keys whose entries are entity ids or `{ entity }` objects. */
const ENTITY_LIST_KEYS = [
  'icons',
  'info_entities',
  'entities',
  'presets',
  'calendars',
  'markers',
  'bars',
  'nodes',
  'include_entities',
  'departure_entities',
] as const;

/** Every entity id referenced anywhere in the layout (see ENTITY_ID_KEYS / ENTITY_LIST_KEYS). */
export function collectLayoutEntityIds(modules: unknown[]): Set<string> {
  const entityIds = new Set<string>();
  const add = (value: unknown): void => {
    if (typeof value === 'string' && value.includes('.')) entityIds.add(value);
  };
  const walk = (items: unknown[]): void => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const module = item as SmartModule;
      for (const key of ENTITY_ID_KEYS) add(module[key]);
      for (const key of ENTITY_LIST_KEYS) {
        const list = module[key];
        if (!Array.isArray(list)) continue;
        for (const entry of list) {
          if (typeof entry === 'string') add(entry);
          else if (entry && typeof entry === 'object') {
            add((entry as SmartModule).entity);
            const nested = (entry as SmartModule).entities;
            if (Array.isArray(nested)) nested.forEach(add);
          }
        }
      }
      if (Array.isArray(module.modules)) walk(module.modules);
      if (Array.isArray(module.sections)) {
        for (const section of module.sections) {
          if (section && typeof section === 'object' && Array.isArray((section as SmartModule).modules)) {
            walk((section as SmartModule).modules as unknown[]);
          }
        }
      }
    }
  };
  walk(modules);
  return entityIds;
}

function countDomainEntitiesInLayout(modules: unknown[], domain: string): number {
  let count = 0;
  for (const entityId of collectLayoutEntityIds(modules)) {
    if (entityId.startsWith(`${domain}.`)) count += 1;
  }
  return count;
}

/** Modules that carry no Home Assistant data on their own. */
const CONTENT_ONLY_TYPES = new Set(['text', 'markdown', 'separator', 'horizontal', 'vertical', 'stack']);

export function shouldRecomposeSmartLayout(prompt: string, modules: unknown[]): boolean {
  const text = prompt.toLowerCase();
  const types = collectModuleTypes(modules);

  // The AI answered an entity request with prose (a text module echoing the prompt, "Not any",
  // a markdown note...). Unless the user actually asked for text, that is not a card.
  if (!promptWantsTextContent(prompt)) {
    const asksForEntities = inferEntityTargetsFromPrompt(prompt).length > 0;
    const hasEntities = collectLayoutEntityIds(modules).size > 0;
    const contentOnly = types.size > 0 && Array.from(types).every(type => CONTENT_ONLY_TYPES.has(type));
    if (!hasEntities && (asksForEntities || contentOnly)) return true;
  }

  if (/\bclock\b/.test(text) && !types.has('clock') && !types.has('animated_clock')) {
    return true;
  }

  if (/\bweather\b/.test(text)) {
    const weatherCount = countDomainEntitiesInLayout(modules, 'weather');
    if (weatherCount > 1) return true;
    if (
      !types.has('weather') &&
      !types.has('animated_weather') &&
      !types.has('clock') &&
      !types.has('animated_clock')
    ) {
      const hasWeatherHeader = modules.some(module => {
        if (!module || typeof module !== 'object') return false;
        const record = module as SmartModule;
        if (record.type !== 'horizontal' || !Array.isArray(record.modules)) return false;
        return (record.modules as SmartModule[]).some(child => child.type === 'icon');
      });
      if (!hasWeatherHeader) return true;
    }
  }

  if (/\blights?\b/.test(text) && modules.length === 1) {
    const onlyModule = modules[0];
    if (
      onlyModule &&
      typeof onlyModule === 'object' &&
      String((onlyModule as SmartModule).type || '') === 'info'
    ) {
      return true;
    }
  }

  if (
    /\bclock\b/.test(text) &&
    types.size <= 2 &&
    (types.has('info') || types.has('icon')) &&
    !types.has('clock') &&
    !types.has('animated_clock')
  ) {
    return true;
  }

  return false;
}

export function hasStructuredComposerPlan(
  prompt: string,
  hass: SmartSanitizeHass,
  tier: 'free' | 'pro'
): boolean {
  const plan = parseSmartCompositionPlan(prompt, hass, tier);
  return plan.sections.some(
    section =>
      section.recipe === 'moduleRow' ||
      section.recipe === 'singleModule' ||
      section.entities.length > 0
  );
}

export function composeSmartCardModules(
  id: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  style: string
): SmartComposeResult {
  const warnings: string[] = [];
  const plan = parseSmartCompositionPlan(context.prompt, hass, context.tier);
  const modules = buildModulesFromCompositionPlan(id, plan, style, hass, context);

  if (modules.length) {
    return { modules, warnings };
  }

  const fallbackModules = buildComposedEntityModules(id, [], style, hass, context);
  if (fallbackModules.length) {
    warnings.push('Used local Smart composer fallback.');
    return { modules: fallbackModules, warnings };
  }

  return { modules: [], warnings };
}

export function enhanceSmartPresetLayout(
  hass: SmartSanitizeHass,
  request: SmartGenerateRequest,
  layout: PresetDefinition['layout'] | null | undefined,
  idPrefix: string,
  existingWarnings: string[] = []
): { layout: PresetDefinition['layout'] | null; warnings: string[] } {
  const context: SmartSanitizeContext = {
    tier: request.tier,
    prompt: request.prompt,
    allowProModules: request.constraints?.allow_pro_modules ?? request.tier === 'pro',
  };
  const warnings = [...existingWarnings];
  const style = request.constraints?.style || 'clean';

  let sanitized = layout ? sanitizeSmartLayout(hass, layout, context, idPrefix) : null;
  let modules =
    sanitized?.rows?.[0]?.columns?.[0]?.modules &&
    Array.isArray(sanitized.rows[0].columns[0].modules)
      ? (sanitized.rows[0].columns[0].modules as unknown[])
      : [];

  if (sanitized && modules.length) {
    // Dividers look heavy in generated cards; the design pass already spaces sections.
    const withoutSeparators = stripUnrequestedSeparators(modules as SmartModule[], request.prompt);
    const household = ensureHouseholdPeople(withoutSeparators, hass, context, idPrefix);
    if (household !== modules) {
      modules = household;
      sanitized.rows[0].columns[0].modules =
        household as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'];
    }
  }

  if (sanitized && shouldRecomposeSmartLayout(request.prompt, modules)) {
    const composed = composeSmartCardModules(idPrefix, hass, context, style);
    if (composed.modules.length) {
      sanitized = {
        rows: [
          {
            id: `${idPrefix}-row`,
            column_layout: '1-col',
            columns: [{ id: `${idPrefix}-col`, modules: composed.modules as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'] }],
          },
        ],
      } as PresetDefinition['layout'];
      warnings.push('Recomposed layout with local Smart composer for better structure.');
    }
  }

  return { layout: sanitized, warnings };
}

export function sanitizeCloudSmartPreset(
  hass: SmartSanitizeHass,
  request: SmartGenerateRequest,
  preset: PresetDefinition
): { preset: PresetDefinition; warnings: string[] } {
  const context: SmartSanitizeContext = {
    tier: request.tier,
    prompt: request.prompt,
    allowProModules: request.constraints?.allow_pro_modules ?? request.tier === 'pro',
  };
  const warnings: string[] = [];
  const sanitizedLayout = sanitizeSmartLayout(hass, preset.layout, context, preset.id);
  if (!sanitizedLayout) {
    return { preset, warnings };
  }

  const enhanced = enhanceSmartPresetLayout(
    hass,
    request,
    sanitizedLayout,
    preset.id,
    warnings
  );

  return {
    preset: {
      ...preset,
      layout: enhanced.layout || sanitizedLayout,
    },
    warnings: enhanced.warnings,
  };
}
