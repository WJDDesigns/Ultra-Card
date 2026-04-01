import type {
  LayoutConfig,
  CardRow,
  CardColumn,
  CardModule,
  PresetWizardAdaptation,
  PresetWizardChange,
} from '../types';

/**
 * Deep-clone layout JSON for safe mutation.
 */
function cloneLayout(layout: LayoutConfig): LayoutConfig {
  return JSON.parse(JSON.stringify(layout)) as LayoutConfig;
}

/**
 * Collect entity-like string fields on a module for matching targetEntityIds.
 */
function getModuleEntityIds(module: CardModule): string[] {
  const ids: string[] = [];
  const m = module as Record<string, unknown>;
  const keys = [
    'entity',
    'value_entity',
    'value_attribute_entity',
    'image_entity',
    'single_entity',
  ];
  for (const k of keys) {
    const v = m[k];
    if (typeof v === 'string' && v.length > 0) {
      ids.push(v);
    }
  }
  // Icon rows
  if (module.type === 'icon' && Array.isArray((module as any).icons)) {
    for (const icon of (module as any).icons) {
      if (icon?.entity && typeof icon.entity === 'string') ids.push(icon.entity);
    }
  }
  if (module.type === 'info' && Array.isArray((module as any).info_entities)) {
    for (const ent of (module as any).info_entities) {
      if (ent?.entity && typeof ent.entity === 'string') ids.push(ent.entity);
    }
  }
  if (module.type === 'map' && Array.isArray((module as any).markers)) {
    for (const marker of (module as any).markers) {
      if (marker?.entity && typeof marker.entity === 'string') ids.push(marker.entity);
    }
  }
  return ids;
}

function moduleMatchesChange(module: CardModule, change: PresetWizardChange): boolean {
  const typeOk =
    !change.targetModuleTypes ||
    change.targetModuleTypes.length === 0 ||
    change.targetModuleTypes.includes(module.type);

  if (!typeOk) return false;

  if (!change.targetEntityIds || change.targetEntityIds.length === 0) {
    return true;
  }

  const moduleIds = getModuleEntityIds(module);
  return change.targetEntityIds.some(id => moduleIds.includes(id));
}

function applyChangeToModule(module: CardModule, change: PresetWizardChange): CardModule {
  const next = { ...module } as Record<string, unknown>;
  next[change.property] = change.value;
  return next as CardModule;
}

function mapModuleRecursive(module: CardModule, mutator: (m: CardModule) => CardModule): CardModule {
  let m = mutator(module);
  if (m.type === 'horizontal' || m.type === 'vertical') {
    const h = m as any;
    if (Array.isArray(h.modules)) {
      m = { ...h, modules: h.modules.map((child: CardModule) => mapModuleRecursive(child, mutator)) };
    }
  }
  if (m.type === 'slider') {
    const s = m as any;
    if (Array.isArray(s.modules)) {
      m = { ...s, modules: s.modules.map((child: CardModule) => mapModuleRecursive(child, mutator)) };
    }
  }
  if (m.type === 'grid' && Array.isArray((m as any).modules)) {
    const g = m as any;
    m = { ...g, modules: g.modules.map((child: CardModule) => mapModuleRecursive(child, mutator)) };
  }
  return m;
}

function mapColumn(column: CardColumn, mutator: (m: CardModule) => CardModule): CardColumn {
  return {
    ...column,
    modules: (column.modules || []).map(mod => mapModuleRecursive(mod, mutator)),
  };
}

function mapRow(row: CardRow, mutator: (m: CardModule) => CardModule): CardRow {
  return {
    ...row,
    columns: (row.columns || []).map(col => mapColumn(col, mutator)),
  };
}

/**
 * Apply wizard adaptation rules to a layout using user field values.
 * Runs after entity mapping so targetEntityIds still match preset originals if rules reference originals;
 * if presets use mapped IDs in layout, authors should target by module type only.
 */
class UcWizardAdaptationEngine {
  applyAdaptations(
    layout: LayoutConfig,
    adaptations: PresetWizardAdaptation[] | undefined,
    fieldValues: Record<string, unknown>
  ): LayoutConfig {
    if (!adaptations || adaptations.length === 0) {
      return layout;
    }

    let working = cloneLayout(layout);

    for (const rule of adaptations) {
      const raw = fieldValues[rule.when.fieldId];
      const actual = raw === undefined || raw === null ? '' : String(raw);
      if (actual !== String(rule.when.equals)) {
        continue;
      }

      for (const change of rule.apply) {
        working = {
          ...working,
          rows: working.rows.map(row =>
            mapRow(row, mod => {
              if (moduleMatchesChange(mod, change)) {
                return applyChangeToModule(mod, change);
              }
              return mod;
            })
          ),
        };
      }
    }

    return working;
  }
}

export const ucWizardAdaptationEngine = new UcWizardAdaptationEngine();
