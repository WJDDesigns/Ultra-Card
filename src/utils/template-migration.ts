/**
 * Template Migration Utility
 * Auto-migrates legacy template fields to unified_template (single JSON-returning Jinja).
 */

import type { CardModule, UltraCardConfig } from '../types';

export type LegacyMigrationKind =
  | 'icon'
  | 'infoEntity'
  | 'text'
  | 'markdown'
  | 'bar'
  | 'gauge'
  | 'spinbox'
  | 'camera'
  | 'graphs'
  | 'togglePoint'
  | 'qr'
  | 'statusEntity'
  | 'statusModule';

export interface LegacyTemplateDetection {
  hasLegacyTemplates: boolean;
  hasTemplateMode: boolean;
  hasDynamicIconTemplate: boolean;
  hasDynamicColorTemplate: boolean;
  templateCount: number;
}

export interface MigrationResult {
  unified_template_mode: boolean;
  unified_template: string;
  ignore_entity_state_config: boolean;
  migratedFrom: string[];
}

const migratedModuleIds = new Set<string>();

export function wrapTemplateInJinja(template: string): string {
  if (!template) return '""';
  const trimmed = template.trim().replace(/\s+/g, ' ');
  if (trimmed.startsWith('{%') || trimmed.startsWith('{{')) {
    const escaped = trimmed.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return `"${trimmed.replace(/"/g, '\\"')}"`;
}

/** Icon / info-entity legacy: template_mode + dynamic icon/color */
export function detectLegacyTemplates(config: any): LegacyTemplateDetection {
  const hasTemplateMode = Boolean(config.template_mode && config.template);
  const hasDynamicIconTemplate = Boolean(
    config.dynamic_icon_template_mode && config.dynamic_icon_template
  );
  const hasDynamicColorTemplate = Boolean(
    config.dynamic_color_template_mode && config.dynamic_color_template
  );
  const templateCount =
    (hasTemplateMode ? 1 : 0) + (hasDynamicIconTemplate ? 1 : 0) + (hasDynamicColorTemplate ? 1 : 0);
  return {
    hasLegacyTemplates: templateCount > 0,
    hasTemplateMode,
    hasDynamicIconTemplate,
    hasDynamicColorTemplate,
    templateCount,
  };
}

export function hasLegacyTemplatesForKind(config: any, kind: LegacyMigrationKind): boolean {
  switch (kind) {
    case 'icon':
    case 'infoEntity':
      return detectLegacyTemplates(config).hasLegacyTemplates;
    case 'text':
    case 'markdown':
    case 'spinbox':
    case 'camera':
    case 'graphs':
      return Boolean(config.template_mode && config.template);
    case 'bar': {
      const b = config as any;
      const pctType = b.percentage_type || 'entity';
      const pctTemplateIsRelevant =
        pctType === 'entity' || pctType === 'template' || !pctType;
      return Boolean(
        (b.percentage_template && pctTemplateIsRelevant) ||
          (b.percentage_min_template_mode && b.percentage_min_template) ||
          (b.percentage_max_template_mode && b.percentage_max_template) ||
          (b.left_template_mode && b.left_template) ||
          (b.right_template_mode && b.right_template) ||
          (b.template_mode && b.template)
      );
    }
    case 'gauge':
      return Boolean(config.value_template && String(config.value_template).trim());
    case 'togglePoint':
      return Boolean(config.match_template_mode && config.match_template);
    case 'qr':
      return Boolean(config.content_mode === 'template' && config.content_template);
    case 'statusEntity':
      return Boolean(config.custom_color_template && String(config.custom_color_template).trim());
    case 'statusModule':
      return Boolean(
        (config.global_custom_color_template &&
          String(config.global_custom_color_template).trim()) ||
          (config.template_mode && config.template)
      );
    default:
      return false;
  }
}

/**
 * Migrate legacy templates to unified JSON template string.
 */
export function migrateToUnified(config: any, kind?: LegacyMigrationKind): MigrationResult {
  const migratedFrom: string[] = [];
  let ignoreEntityState = false;

  if (kind === 'icon' || kind === 'infoEntity' || (!kind && detectLegacyTemplates(config).hasLegacyTemplates)) {
    const detection = detectLegacyTemplates(config);
    if (!detection.hasLegacyTemplates) {
      if (kind === 'icon' || kind === 'infoEntity') return emptyMigration();
    } else {
    const jsonParts: string[] = [];
    if (detection.hasTemplateMode) {
      migratedFrom.push('template_mode');
      ignoreEntityState = true;
      if (!detection.hasDynamicIconTemplate) {
        jsonParts.push(`"icon": ${wrapTemplateInJinja(config.template)}`);
      } else {
        jsonParts.push(`"state_text": ${wrapTemplateInJinja(config.template)}`);
      }
    }
    if (detection.hasDynamicIconTemplate) {
      migratedFrom.push('dynamic_icon_template');
      jsonParts.push(`"icon": ${wrapTemplateInJinja(config.dynamic_icon_template)}`);
    }
    if (detection.hasDynamicColorTemplate) {
      migratedFrom.push('dynamic_color_template');
      jsonParts.push(`"icon_color": ${wrapTemplateInJinja(config.dynamic_color_template)}`);
    }
    return {
      unified_template_mode: true,
      unified_template: `{ ${jsonParts.join(', ')} }`,
      ignore_entity_state_config: ignoreEntityState,
      migratedFrom,
    };
    }
  }

  if (kind === 'text' || kind === 'markdown') {
    if (!config.template_mode || !config.template) return emptyMigration();
    migratedFrom.push('template_mode');
    return {
      unified_template_mode: true,
      unified_template: `{ "content": ${wrapTemplateInJinja(config.template)} }`,
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  if (kind === 'bar') {
    const b = config as any;
    const pctType = b.percentage_type || 'entity';
    const parts: string[] = [];
    // In difference mode, do not migrate percentage_template into unified "value" — it was
    // often a legacy % helper and would override current/total fill when unified mode is on.
    if (b.percentage_template && pctType !== 'difference') {
      migratedFrom.push('percentage_template');
      parts.push(`"value": ${wrapTemplateInJinja(String(b.percentage_template))}`);
    }
    if (b.percentage_min_template_mode && b.percentage_min_template) {
      migratedFrom.push('percentage_min_template');
      parts.push(`"value_min": ${wrapTemplateInJinja(b.percentage_min_template)}`);
    }
    if (b.percentage_max_template_mode && b.percentage_max_template) {
      migratedFrom.push('percentage_max_template');
      parts.push(`"value_max": ${wrapTemplateInJinja(b.percentage_max_template)}`);
    }
    if (b.left_template_mode && b.left_template) {
      migratedFrom.push('left_template');
      parts.push(`"left_label": ${wrapTemplateInJinja(b.left_template)}`);
    }
    if (b.right_template_mode && b.right_template) {
      migratedFrom.push('right_template');
      parts.push(`"right_label": ${wrapTemplateInJinja(b.right_template)}`);
    }
    if (b.template_mode && b.template) {
      migratedFrom.push('template_mode');
      parts.push(`"label": ${wrapTemplateInJinja(b.template)}`);
    }
    if (parts.length === 0) return emptyMigration();
    return {
      unified_template_mode: true,
      unified_template: `{ ${parts.join(', ')} }`,
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  if (kind === 'gauge') {
    if (!config.value_template || !String(config.value_template).trim()) return emptyMigration();
    migratedFrom.push('value_template');
    return {
      unified_template_mode: true,
      unified_template: `{ "value": ${wrapTemplateInJinja(config.value_template)} }`,
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  if (kind === 'spinbox' || kind === 'camera' || kind === 'graphs') {
    if (!config.template_mode || !config.template) return emptyMigration();
    migratedFrom.push('template_mode');
    return {
      unified_template_mode: true,
      unified_template: String(config.template).trim(),
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  if (kind === 'togglePoint') {
    if (!config.match_template_mode || !config.match_template) return emptyMigration();
    migratedFrom.push('match_template');
    return {
      unified_template_mode: true,
      unified_template: `{ "match": ${wrapTemplateInJinja(config.match_template)} }`,
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  if (kind === 'qr') {
    if (config.content_mode !== 'template' || !config.content_template) return emptyMigration();
    migratedFrom.push('content_template');
    return {
      unified_template_mode: true,
      unified_template: `{ "qr_content": ${wrapTemplateInJinja(config.content_template)} }`,
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  if (kind === 'statusEntity') {
    if (!config.custom_color_template || !String(config.custom_color_template).trim())
      return emptyMigration();
    migratedFrom.push('custom_color_template');
    return {
      unified_template_mode: true,
      unified_template: `{ "color": ${wrapTemplateInJinja(config.custom_color_template)} }`,
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  if (kind === 'statusModule') {
    const parts: string[] = [];
    if (config.global_custom_color_template && String(config.global_custom_color_template).trim()) {
      migratedFrom.push('global_custom_color_template');
      parts.push(`"color": ${wrapTemplateInJinja(config.global_custom_color_template)}`);
    }
    if (config.template_mode && config.template) {
      migratedFrom.push('template_mode');
      parts.push(`"content": ${wrapTemplateInJinja(config.template)}`);
    }
    if (parts.length === 0) return emptyMigration();
    return {
      unified_template_mode: true,
      unified_template: `{ ${parts.join(', ')} }`,
      ignore_entity_state_config: false,
      migratedFrom,
    };
  }

  return emptyMigration();
}

function emptyMigration(): MigrationResult {
  return {
    unified_template_mode: false,
    unified_template: '',
    ignore_entity_state_config: false,
    migratedFrom: [],
  };
}

function clearLegacyTemplateFields(config: any, kind: LegacyMigrationKind): any {
  const c = { ...config };
  switch (kind) {
    case 'icon':
    case 'infoEntity':
      c.template_mode = false;
      c.template = '';
      c.dynamic_icon_template_mode = false;
      c.dynamic_icon_template = '';
      c.dynamic_color_template_mode = false;
      c.dynamic_color_template = '';
      break;
    case 'text':
    case 'markdown':
    case 'spinbox':
    case 'camera':
    case 'graphs':
      c.template_mode = false;
      c.template = '';
      break;
    case 'bar':
      c.percentage_template = '';
      c.percentage_min_template_mode = false;
      c.percentage_min_template = '';
      c.percentage_max_template_mode = false;
      c.percentage_max_template = '';
      c.left_template_mode = false;
      c.left_template = '';
      c.right_template_mode = false;
      c.right_template = '';
      c.template_mode = false;
      c.template = '';
      break;
    case 'gauge':
      c.value_template = '';
      break;
    case 'togglePoint':
      c.match_template_mode = false;
      c.match_template = '';
      break;
    case 'qr':
      c.content_template = '';
      if (c.content_mode === 'template') c.content_mode = 'unified';
      break;
    case 'statusEntity':
      c.custom_color_template = '';
      break;
    case 'statusModule':
      c.global_custom_color_template = '';
      c.template_mode = false;
      c.template = '';
      break;
    default:
      break;
  }
  return c;
}

function applyUnifiedMigration(
  config: any,
  kind: LegacyMigrationKind,
  migration: MigrationResult
): any {
  if (!migration.unified_template_mode) return config;
  const base = clearLegacyTemplateFields(config, kind);
  return {
    ...base,
    unified_template_mode: true,
    unified_template: migration.unified_template,
    ignore_entity_state_config:
      migration.ignore_entity_state_config ?? base.ignore_entity_state_config,
  };
}

/** Migrate a single config slice (icon, entity, bar module, etc.) */
export function autoMigrateConfigSlice(config: any, kind: LegacyMigrationKind): any {
  if (!config || config.unified_template_mode) return config;
  if (!hasLegacyTemplatesForKind(config, kind)) return config;
  const migration = migrateToUnified(config, kind);
  if (!migration.unified_template_mode) return config;
  if (config.id && !migratedModuleIds.has(`${kind}:${config.id}`)) {
    console.warn(
      `[UltraCard] Auto-migrated legacy templates to unified for ${kind} "${config.id || 'unknown'}"`
    );
    migratedModuleIds.add(`${kind}:${config.id}`);
  }
  return applyUnifiedMigration(config, kind, migration);
}

/** Auto-migrate all legacy template fields on a card module before render. */
export function autoMigrateCardModule(module: CardModule): CardModule {
  const m = module as any;
  switch (module.type) {
    case 'icon':
      if (m.icons?.length) {
        return {
          ...m,
          icons: m.icons.map((icon: any) => autoMigrateConfigSlice(icon, 'icon')),
        };
      }
      return m;
    case 'info':
      if (m.entities?.length) {
        return {
          ...m,
          entities: m.entities.map((e: any) => autoMigrateConfigSlice(e, 'infoEntity')),
        };
      }
      return m;
    case 'text':
    case 'markdown':
      return autoMigrateConfigSlice(m, module.type as LegacyMigrationKind) as CardModule;
    case 'bar':
      return autoMigrateConfigSlice(m, 'bar') as CardModule;
    case 'gauge':
      return autoMigrateConfigSlice(m, 'gauge') as CardModule;
    case 'spinbox':
      return autoMigrateConfigSlice(m, 'spinbox') as CardModule;
    case 'camera':
      return autoMigrateConfigSlice(m, 'camera') as CardModule;
    case 'graphs':
      return autoMigrateConfigSlice(m, 'graphs') as CardModule;
    case 'toggle':
      if (m.toggle_points?.length) {
        return {
          ...m,
          toggle_points: m.toggle_points.map((p: any) => autoMigrateConfigSlice(p, 'togglePoint')),
        };
      }
      return m;
    case 'qr_code':
      return autoMigrateConfigSlice(m, 'qr') as CardModule;
    case 'status_summary': {
      let next = m;
      if (m.entities?.length) {
        next = {
          ...next,
          entities: m.entities.map((e: any) => autoMigrateConfigSlice(e, 'statusEntity')),
        };
      }
      return autoMigrateConfigSlice(next, 'statusModule') as CardModule;
    }
    default:
      return m;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Module default-margin migration (v1 → v2)
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_CONFIG_VERSION = 2;

const MODULES_WITH_LEGACY_8PX_MARGIN: ReadonlySet<string> = new Set([
  'animated_clock',
  'bar',
  'boolean_input',
  'button',
  'button_input',
  'camera',
  'color_input',
  'counter_input',
  'datetime_input',
  'dropdown',
  'external_card',
  'graphs',
  'horizontal',
  'icon',
  'image',
  'info',
  'number_input',
  'select_input',
  'separator',
  'slider_input',
  'spinbox',
  'text',
  'text_input',
]);

function moduleHasExplicitMargin(mod: any): boolean {
  if (
    mod.margin_top !== undefined ||
    mod.margin_bottom !== undefined ||
    mod.margin_left !== undefined ||
    mod.margin_right !== undefined
  ) {
    return true;
  }
  const d = mod.design;
  if (
    d &&
    (d.margin_top !== undefined ||
      d.margin_bottom !== undefined ||
      d.margin_left !== undefined ||
      d.margin_right !== undefined)
  ) {
    return true;
  }
  return false;
}

function stampDefaultMargin(mod: any): void {
  if (!mod.design) {
    mod.design = {};
  }
  mod.design.margin_top = '8px';
  mod.design.margin_bottom = '8px';
}

/**
 * For column-level modules that previously relied on the implicit `margin: 8px 0`
 * default, inject explicit `design.margin_top/bottom = '8px'`.
 *
 * Modules nested inside vertical / horizontal containers are skipped — those
 * parents already zeroed child margins via `applyLayoutDesignToChild`, so their
 * children never visually had the 8px default.
 */
function migrateModulesInList(modules: any[] | undefined, isInsideContainer: boolean): void {
  if (!modules?.length) return;
  for (const mod of modules) {
    if (!mod?.type) continue;

    const isContainer = mod.type === 'vertical' || mod.type === 'horizontal';

    if (!isInsideContainer && MODULES_WITH_LEGACY_8PX_MARGIN.has(mod.type)) {
      if (!moduleHasExplicitMargin(mod)) {
        stampDefaultMargin(mod);
      }
    }

    if (isContainer && Array.isArray(mod.modules)) {
      migrateModulesInList(mod.modules, true);
    }
  }
}

/**
 * Migrate configs created before the default-margin removal.
 * Walks the full layout tree and stamps explicit 8px margins on column-level
 * modules that previously relied on the `margin: '8px 0'` fallback.
 * Mutates config in place (same deep-copy object used by validation).
 */
export function migrateModuleDefaultMargins(config: UltraCardConfig): void {
  if ((config as any)._config_version && (config as any)._config_version >= CURRENT_CONFIG_VERSION) {
    return;
  }
  const rows = config.layout?.rows;
  if (!rows?.length) {
    (config as any)._config_version = CURRENT_CONFIG_VERSION;
    return;
  }
  for (const row of rows) {
    const cols = (row as any)?.columns;
    if (!cols?.length) continue;
    for (const col of cols) {
      migrateModulesInList((col as any)?.modules, false);
    }
  }
  (config as any)._config_version = CURRENT_CONFIG_VERSION;
}

/**
 * Migrate legacy row/column `template_mode` + `template` visibility into unified_template (JSON `visible` key).
 * Mutates config in place (same object as validation deep copy).
 */
export function migrateLayoutVisibilityTemplates(config: UltraCardConfig): void {
  const rows = config.layout?.rows as any[] | undefined;
  if (!rows?.length) return;
  for (const row of rows) {
    if (row?.template_mode && row.template && !row.unified_template_mode) {
      row.unified_template_mode = true;
      row.unified_template = `{ "visible": ${wrapTemplateInJinja(String(row.template))} }`;
      row.template_mode = false;
      row.template = '';
    }
    const cols = row?.columns as any[] | undefined;
    if (!cols?.length) continue;
    for (const col of cols) {
      if (col?.template_mode && col.template && !col.unified_template_mode) {
        col.unified_template_mode = true;
        col.unified_template = `{ "visible": ${wrapTemplateInJinja(String(col.template))} }`;
        col.template_mode = false;
        col.template = '';
      }
    }
  }
}
