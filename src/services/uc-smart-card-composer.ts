import type { PresetDefinition, SmartGenerateRequest } from '../types';
import { parseSmartCompositionPlan } from './uc-smart-composition-planner';
import {
  buildComposedEntityModules,
  buildModulesFromCompositionPlan,
  sanitizeSmartLayout,
  type SmartSanitizeContext,
  type SmartSanitizeHass,
} from './uc-smart-module-sanitizer';

type SmartModule = Record<string, unknown>;

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

function countDomainEntitiesInLayout(modules: unknown[], domain: string): number {
  const entityIds = new Set<string>();
  const walk = (items: unknown[]): void => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const module = item as SmartModule;
      const entityId = String(module.entity || module.weather_entity || '');
      if (entityId.startsWith(`${domain}.`)) entityIds.add(entityId);
      if (Array.isArray(module.icons)) {
        for (const icon of module.icons as SmartModule[]) {
          const iconEntity = String(icon.entity || '');
          if (iconEntity.startsWith(`${domain}.`)) entityIds.add(iconEntity);
        }
      }
      if (Array.isArray(module.info_entities)) {
        for (const info of module.info_entities as SmartModule[]) {
          const infoEntity = String(info.entity || '');
          if (infoEntity.startsWith(`${domain}.`)) entityIds.add(infoEntity);
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
  return entityIds.size;
}

export function shouldRecomposeSmartLayout(prompt: string, modules: unknown[]): boolean {
  const text = prompt.toLowerCase();
  const types = collectModuleTypes(modules);

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
  const modules =
    sanitized?.rows?.[0]?.columns?.[0]?.modules &&
    Array.isArray(sanitized.rows[0].columns[0].modules)
      ? (sanitized.rows[0].columns[0].modules as unknown[])
      : [];

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
