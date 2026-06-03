import type { SmartGenerateRequest } from '../../types';
import type { SmartSanitizeContext, SmartSanitizeHass } from '../uc-smart-module-sanitizer';
import {
  getSmartModuleSpec,
  matchSmartModuleTypesForPrompt,
} from './uc-smart-module-registry';
import type { SmartBuildContext } from './smart-module-types';
import type { SmartModule } from './smart-sanitize-utils';

type SmartAiPlanModule = {
  type?: unknown;
  entity?: unknown;
  weather_entity?: unknown;
  info_entities?: unknown;
  entities?: unknown;
  [key: string]: unknown;
};

type SmartAiPlan = {
  name?: unknown;
  description?: unknown;
  modules?: unknown;
  layout?: unknown;
  cardSettings?: unknown;
};

export type SmartPlanCorrectionResult = {
  plan: SmartAiPlan;
  warnings: string[];
};

function extractEntityId(module: SmartAiPlanModule): string | null {
  if (typeof module.entity === 'string' && module.entity) return module.entity;
  if (typeof module.weather_entity === 'string' && module.weather_entity) return module.weather_entity;

  if (Array.isArray(module.info_entities) && module.info_entities[0] && typeof module.info_entities[0] === 'object') {
    const entity = (module.info_entities[0] as SmartAiPlanModule).entity;
    if (typeof entity === 'string' && entity) return entity;
  }

  if (Array.isArray(module.entities)) {
    const first = module.entities[0];
    if (typeof first === 'string' && first) return first;
    if (first && typeof first === 'object' && typeof (first as SmartAiPlanModule).entity === 'string') {
      return String((first as SmartAiPlanModule).entity);
    }
  }

  return null;
}

const GENERIC_MODULE_TYPES = new Set(['info', 'icon', 'text', 'status_summary']);

function resolveUpgradeType(
  module: SmartAiPlanModule,
  prompt: string,
  tier: SmartGenerateRequest['tier']
): string | undefined {
  const currentType = String(module.type || '');
  const entityId = extractEntityId(module);
  const matches = matchSmartModuleTypesForPrompt(prompt, tier, { max: 8, composableOnly: true }).filter(
    item => item.score >= 5
  );

  for (const match of matches) {
    if (match.type === currentType) return undefined;
    if (!match.spec.defaultBuilder) continue;

    const entityDomain = entityId?.split('.')[0];
    const domainMatches =
      !entityDomain ||
      match.spec.entityDomains.includes('*') ||
      match.spec.entityDomains.includes(entityDomain);

    if (!domainMatches) continue;

    if (GENERIC_MODULE_TYPES.has(currentType)) {
      return match.type;
    }

    if (currentType === 'gauge' && match.type === 'bar' && /\bbar\b|\bprogress bar\b/.test(prompt)) {
      return 'bar';
    }

    if (currentType === 'info' && (match.type === 'bar' || match.type === 'gauge') && /\bfuel\b|\bbattery\b/.test(prompt)) {
      return match.type;
    }
  }

  return undefined;
}

function upgradeModuleType(
  module: SmartAiPlanModule,
  requestedType: string,
  prompt: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  id: string
): SmartAiPlanModule {
  const spec = getSmartModuleSpec(requestedType);
  if (!spec?.defaultBuilder) {
    return { ...module, type: requestedType };
  }

  const entityId = extractEntityId(module);
  const entity = entityId
    ? {
        entityId,
        name: String(module.name || entityId.split('.')[1] || entityId),
        domain: entityId.split('.')[0] || 'sensor',
      }
    : undefined;

  const buildCtx: SmartBuildContext = {
    id,
    entity,
    prompt,
    hass,
    context,
  };

  const built = spec.defaultBuilder(buildCtx);
  if (!built) {
    return { ...module, type: requestedType, ...(entityId ? { entity: entityId } : {}) };
  }

  const builtModule = (Array.isArray(built) ? built[0] : built) as SmartModule;
  return {
    ...module,
    ...builtModule,
    type: requestedType,
  };
}

function correctModulesInList(
  modules: unknown[],
  prompt: string,
  tier: SmartGenerateRequest['tier'],
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  warnings: string[],
  idPrefix: string
): unknown[] {
  return modules.flatMap((rawModule, index) => {
    if (!rawModule || typeof rawModule !== 'object') return [];
    const module = rawModule as SmartAiPlanModule;
    const currentType = String(module.type || '');

    if (Array.isArray(module.modules)) {
      return [
        {
          ...module,
          modules: correctModulesInList(
            module.modules,
            prompt,
            tier,
            hass,
            context,
            warnings,
            `${idPrefix}-m${index}`
          ),
        },
      ];
    }

    if (Array.isArray(module.sections)) {
      return [
        {
          ...module,
          sections: module.sections.map((section, sectionIndex) => {
            if (!section || typeof section !== 'object') return section;
            const sectionObj = section as SmartAiPlanModule;
            return {
              ...sectionObj,
              modules: Array.isArray(sectionObj.modules)
                ? correctModulesInList(
                    sectionObj.modules,
                    prompt,
                    tier,
                    hass,
                    context,
                    warnings,
                    `${idPrefix}-m${index}-s${sectionIndex}`
                  )
                : [],
            };
          }),
        },
      ];
    }

    const upgradeType = resolveUpgradeType(module, prompt, tier);
    if (!upgradeType || upgradeType === currentType) return [module];

    const upgraded = upgradeModuleType(
      module,
      upgradeType,
      prompt,
      hass,
      context,
      `${idPrefix}-m${index}`
    );
    warnings.push(`Upgraded ${currentType || 'unknown'} -> ${upgradeType} based on prompt module name.`);
    return [upgraded];
  });
}

function correctLayoutModules(
  layout: unknown,
  prompt: string,
  tier: SmartGenerateRequest['tier'],
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  warnings: string[],
  idPrefix: string
): unknown {
  if (!layout || typeof layout !== 'object') return layout;
  const layoutObj = layout as { rows?: unknown[] };
  if (!Array.isArray(layoutObj.rows)) return layout;

  return {
    ...layoutObj,
    rows: layoutObj.rows.map((row, rowIndex) => {
      if (!row || typeof row !== 'object') return row;
      const rowObj = row as { columns?: unknown[] };
      return {
        ...rowObj,
        columns: Array.isArray(rowObj.columns)
          ? rowObj.columns.map((column, columnIndex) => {
              if (!column || typeof column !== 'object') return column;
              const columnObj = column as { modules?: unknown[] };
              return {
                ...columnObj,
                modules: Array.isArray(columnObj.modules)
                  ? correctModulesInList(
                      columnObj.modules,
                      prompt,
                      tier,
                      hass,
                      context,
                      warnings,
                      `${idPrefix}-r${rowIndex}-c${columnIndex}`
                    )
                  : [],
              };
            })
          : [],
      };
    }),
  };
}

export function correctSmartAiPlan(
  rawPlan: SmartAiPlan,
  prompt: string,
  tier: SmartGenerateRequest['tier'],
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext
): SmartPlanCorrectionResult {
  const warnings: string[] = [];
  const plan: SmartAiPlan = { ...rawPlan };

  if (Array.isArray(plan.modules)) {
    plan.modules = correctModulesInList(plan.modules, prompt, tier, hass, context, warnings, 'plan');
  }

  if (plan.layout) {
    plan.layout = correctLayoutModules(plan.layout, prompt, tier, hass, context, warnings, 'plan');
  }

  return { plan, warnings };
}
