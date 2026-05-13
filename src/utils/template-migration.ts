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

function withStableChildId(config: any, prefix: string, parentId: string | undefined, index: number): any {
  if (!config || String(config.id || '').trim()) return config;
  const parentScope = parentId && String(parentId).trim() ? String(parentId).trim() : 'module';
  return {
    ...config,
    id: `${prefix}-${parentScope}-${index}`,
  };
}

/** Migrate a single config slice (icon, entity, bar module, etc.) */
export function autoMigrateConfigSlice(config: any, kind: LegacyMigrationKind): any {
  if (!config) return config;
  // If unified mode is enabled but the actual unified template is empty, repair it
  // from legacy fields. Some existing saved cards reached this half-migrated state;
  // duplicating the module rebuilt a clean config, but the original stayed on static
  // colors (usually primary blue).
  const hasUsableUnifiedTemplate = Boolean(
    config.unified_template_mode && String(config.unified_template || '').trim()
  );
  if (hasUsableUnifiedTemplate) return config;
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
          icons: m.icons.map((icon: any, index: number) =>
            autoMigrateConfigSlice(withStableChildId(icon, 'icon-item', m.id, index), 'icon')
          ),
        };
      }
      return m;
    case 'info':
      // Info modules use `info_entities`; older/intermediate configs may still
      // carry `entities`. Migrate both so existing saved cards self-heal without
      // requiring users to duplicate the module/card.
      if (m.info_entities?.length || m.entities?.length) {
        return {
          ...m,
          ...(m.info_entities?.length
            ? {
                info_entities: m.info_entities.map((e: any, index: number) =>
                  autoMigrateConfigSlice(withStableChildId(e, 'info-entity', m.id, index), 'infoEntity')
                ),
              }
            : {}),
          ...(m.entities?.length
            ? {
                entities: m.entities.map((e: any, index: number) =>
                  autoMigrateConfigSlice(withStableChildId(e, 'info-entity', m.id, index), 'infoEntity')
                ),
              }
            : {}),
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
          toggle_points: m.toggle_points.map((p: any, index: number) =>
            autoMigrateConfigSlice(withStableChildId(p, 'toggle-point', m.id, index), 'togglePoint')
          ),
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
          entities: m.entities.map((e: any, index: number) =>
            autoMigrateConfigSlice(withStableChildId(e, 'status-entity', m.id, index), 'statusEntity')
          ),
        };
      }
      return autoMigrateConfigSlice(next, 'statusModule') as CardModule;
    }
    default:
      return m;
  }
}

/** Auto-migrate a module and any nested child modules. */
export function autoMigrateCardModuleTree(module: CardModule): CardModule {
  const migrated = autoMigrateCardModule(module) as any;

  if (Array.isArray(migrated.modules)) {
    return {
      ...migrated,
      modules: migrated.modules.map((child: CardModule) => autoMigrateCardModuleTree(child)),
    } as CardModule;
  }

  if (Array.isArray(migrated.sections)) {
    return {
      ...migrated,
      sections: migrated.sections.map((section: any) => ({
        ...section,
        modules: Array.isArray(section.modules)
          ? section.modules.map((child: CardModule) => autoMigrateCardModuleTree(child))
          : section.modules,
      })),
    } as CardModule;
  }

  return migrated as CardModule;
}

/**
 * Apply legacy template auto-migration to an entire card config.
 * Returns a deep-cloned config so callers can safely compare and emit updates.
 */
export function autoMigrateTemplatesInConfig(config: UltraCardConfig): UltraCardConfig {
  if (!config || typeof config !== 'object') return config;

  const migratedConfig = JSON.parse(JSON.stringify(config)) as UltraCardConfig;
  migrateLayoutVisibilityTemplates(migratedConfig);

  const rows = migratedConfig.layout?.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return migratedConfig;
  }

  migratedConfig.layout.rows = rows.map(row => {
    const rowColumns = Array.isArray(row.columns) ? row.columns : [];
    return {
      ...row,
      columns: rowColumns.map(column => {
        const columnModules = Array.isArray(column.modules) ? column.modules : [];
        return {
          ...column,
          modules: columnModules.map(module => autoMigrateCardModuleTree(module as CardModule)),
        };
      }),
    };
  });

  return migratedConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module default-margin migration (v1/v2 → v3)
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_CONFIG_VERSION = 3;

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

type MarginDir = 'top' | 'bottom' | 'left' | 'right';
const MARGIN_DIRS: readonly MarginDir[] = ['top', 'bottom', 'left', 'right'] as const;

/**
 * Return the set of margin directions the user has explicitly set on a module,
 * checking every form the editor / YAML may use:
 *   1. flat:           mod.margin_top
 *   2. flat-in-design: mod.design.margin_top
 *   3. nested:         mod.margin.top                (legacy BaseModule.margin)
 *   4. nested-design:  mod.design.margin.top         (legacy nested-in-design)
 */
function getExplicitMarginDirs(mod: any): Set<MarginDir> {
  const explicit = new Set<MarginDir>();
  const design = mod?.design;
  for (const dir of MARGIN_DIRS) {
    const flatKey = `margin_${dir}` as const;
    if (
      mod?.[flatKey] !== undefined ||
      design?.[flatKey] !== undefined ||
      mod?.margin?.[dir] !== undefined ||
      design?.margin?.[dir] !== undefined
    ) {
      explicit.add(dir);
    }
  }
  return explicit;
}

/**
 * v1 default margin was `'8px 0'`, i.e. per-direction:
 *   top:    8px
 *   bottom: 8px
 *   left:   0   (matches new v2 default — nothing to do)
 *   right:  0   (matches new v2 default — nothing to do)
 *
 * Stamp `'8px'` for any top/bottom direction the user did NOT explicitly set,
 * so a partial override (e.g. only `margin_left: -10px`) keeps the v1 8px
 * top/bottom defaults the user implicitly relied on.
 *
 * Mirrors to BOTH `module.margin_top` AND `module.design.margin_top` because
 * legacy module render code is split:
 *   - dropdown / button / image / horizontal / icon (and others) read ONLY
 *     `module.margin_top` directly;
 *   - info / spinbox / bar / gauge (and others) read `designProperties.margin_top`
 *     which comes from `module.design.margin_top`.
 * The editor itself mirrors both forms on every save (see layout-tab.ts), so
 * this matches existing on-disk shape.
 */
function stampMissingV1MarginDefaults(mod: any): void {
  const explicit = getExplicitMarginDirs(mod);
  const needsTop = !explicit.has('top');
  const needsBottom = !explicit.has('bottom');
  if (!needsTop && !needsBottom) return;
  if (!mod.design) mod.design = {};
  if (needsTop) {
    mod.margin_top = '8px';
    mod.design.margin_top = '8px';
  }
  if (needsBottom) {
    mod.margin_bottom = '8px';
    mod.design.margin_bottom = '8px';
  }
}

/**
 * For column-level modules that previously relied on the implicit `margin: 8px 0`
 * default, inject explicit `margin_top/bottom = '8px'` for any direction
 * the user did not override.
 *
 * IMPORTANT: This also applies to modules nested inside vertical/horizontal
 * containers. Starting in 3.3.0-beta3, those containers zero child margins when
 * no explicit margin exists. Legacy cards (no _config_version) rendered nested
 * children with the old implicit 8px top/bottom defaults, so we must stamp them
 * explicitly before container zeroing runs.
 */
function migrateModulesInList(
  modules: any[] | undefined,
  mode: 'full' | 'partial-only' = 'full'
): void {
  if (!modules?.length) return;
  for (const mod of modules) {
    if (!mod?.type) continue;

    const isContainer =
      mod.type === 'vertical' ||
      mod.type === 'horizontal' ||
      mod.type === 'stack' ||
      mod.type === 'accordion' ||
      mod.type === 'popup' ||
      mod.type === 'slider';

    if (MODULES_WITH_LEGACY_8PX_MARGIN.has(mod.type)) {
      const explicit = getExplicitMarginDirs(mod);
      const hasAnyExplicit = explicit.size > 0;
      if (mode === 'full' || hasAnyExplicit) {
        // Full mode (legacy v1/undefined): stamp all missing legacy defaults.
        // Partial-only mode (repair saved v2): only patch modules that already
        // have at least one explicit margin, which is where the old v2 migration
        // bug left defaults missing.
        stampMissingV1MarginDefaults(mod);
      }
    }

    if (isContainer && Array.isArray(mod.modules)) {
      migrateModulesInList(mod.modules, mode);
    }
  }
}

/**
 * Migrate/repair module default margins across schema versions:
 * - v1/undefined -> v3: full migration of legacy implicit `8px 0` defaults.
 * - v2          -> v3: repair pass for the old partial-margin bug; only modules
 *                   with at least one explicit margin are patched.
 * Mutates config in place (same deep-copy object used by validation).
 */
export function migrateModuleDefaultMargins(config: UltraCardConfig): void {
  const schemaVersion = Number((config as any)._config_version || 0);
  if (schemaVersion >= CURRENT_CONFIG_VERSION) {
    return;
  }
  const rows = config.layout?.rows;
  if (!rows?.length) {
    (config as any)._config_version = CURRENT_CONFIG_VERSION;
    return;
  }
  const mode: 'full' | 'partial-only' = schemaVersion >= 2 ? 'partial-only' : 'full';
  for (const row of rows) {
    const cols = (row as any)?.columns;
    if (!cols?.length) continue;
    for (const col of cols) {
      migrateModulesInList((col as any)?.modules, mode);
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
