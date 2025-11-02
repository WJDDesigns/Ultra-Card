/**
 * Template Migration Utility
 * Handles auto-migration from legacy templates to unified template system
 */

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

/**
 * Detect if an icon/entity config has legacy templates
 * @param config Icon config or entity config
 * @returns Detection result with flags for each legacy template type
 */
export function detectLegacyTemplates(config: any): LegacyTemplateDetection {
  const hasTemplateMode = Boolean(config.template_mode && config.template);
  const hasDynamicIconTemplate = Boolean(
    config.dynamic_icon_template_mode && config.dynamic_icon_template
  );
  const hasDynamicColorTemplate = Boolean(
    config.dynamic_color_template_mode && config.dynamic_color_template
  );

  const templateCount =
    (hasTemplateMode ? 1 : 0) +
    (hasDynamicIconTemplate ? 1 : 0) +
    (hasDynamicColorTemplate ? 1 : 0);

  return {
    hasLegacyTemplates: templateCount > 0,
    hasTemplateMode,
    hasDynamicIconTemplate,
    hasDynamicColorTemplate,
    templateCount,
  };
}

/**
 * Migrate legacy templates to unified template system
 * @param config Icon config or entity config with legacy templates
 * @returns Migration result with unified template configuration
 */
export function migrateToUnified(config: any): MigrationResult {
  const detection = detectLegacyTemplates(config);

  if (!detection.hasLegacyTemplates) {
    return {
      unified_template_mode: false,
      unified_template: '',
      ignore_entity_state_config: false,
      migratedFrom: [],
    };
  }

  const migratedFrom: string[] = [];
  let unifiedTemplate = '';
  let ignoreEntityState = false;

  // Priority 1: template_mode (affects both display AND state)
  if (detection.hasTemplateMode) {
    migratedFrom.push('template_mode');
    unifiedTemplate = config.template;
    ignoreEntityState = true; // Preserve old behavior (template controls state)
  }
  // Priority 2: Multiple dynamic templates (display only)
  else if (detection.hasDynamicIconTemplate || detection.hasDynamicColorTemplate) {
    // Build JSON structure combining templates
    const jsonParts: string[] = [];

    if (detection.hasDynamicIconTemplate) {
      migratedFrom.push('dynamic_icon_template');
      jsonParts.push(`  "icon": ${wrapTemplateInJinja(config.dynamic_icon_template)}`);
    }

    if (detection.hasDynamicColorTemplate) {
      migratedFrom.push('dynamic_color_template');
      jsonParts.push(`  "icon_color": ${wrapTemplateInJinja(config.dynamic_color_template)}`);
    }

    unifiedTemplate = `{\n${jsonParts.join(',\n')}\n}`;
    ignoreEntityState = false; // Preserve display-only behavior
  }

  return {
    unified_template_mode: true,
    unified_template: unifiedTemplate,
    ignore_entity_state_config: ignoreEntityState,
    migratedFrom,
  };
}

/**
 * Wrap a template expression in Jinja2 if it's not already wrapped
 * @param template Template content
 * @returns Properly formatted template for JSON embedding
 */
function wrapTemplateInJinja(template: string): string {
  if (!template) return '""';

  const trimmed = template.trim();

  // If it's already a complete Jinja2 expression, return as-is
  if (trimmed.startsWith('{%') || trimmed.startsWith('{{')) {
    return trimmed;
  }

  // If it's a simple value, wrap in quotes
  return `"${trimmed.replace(/"/g, '\\"')}"`;
}

/**
 * Create a preview of the migration for user confirmation
 * @param before Original config
 * @param after Migration result
 * @returns HTML-formatted diff preview
 */
export function createMigrationPreview(before: any, after: MigrationResult): string {
  const lines: string[] = [];

  lines.push('**Before:**');

  if (before.template_mode && before.template) {
    lines.push(`- Advanced Template Mode`);
    lines.push(`  \`${truncateTemplate(before.template)}\``);
  }

  if (before.dynamic_icon_template_mode && before.dynamic_icon_template) {
    lines.push(`- Dynamic Icon Template`);
    lines.push(`  \`${truncateTemplate(before.dynamic_icon_template)}\``);
  }

  if (before.dynamic_color_template_mode && before.dynamic_color_template) {
    lines.push(`- Dynamic Color Template`);
    lines.push(`  \`${truncateTemplate(before.dynamic_color_template)}\``);
  }

  lines.push('');
  lines.push('**After:**');
  lines.push(`- Smart Display Template`);
  lines.push(`  \`${truncateTemplate(after.unified_template)}\``);

  if (after.ignore_entity_state_config) {
    lines.push(`- Ignores entity state config (template controls state logic)`);
  } else {
    lines.push(`- Entity state config still controls animations`);
  }

  return lines.join('\n');
}

/**
 * Truncate template for display
 * @param template Template string
 * @param maxLength Maximum length
 * @returns Truncated template
 */
function truncateTemplate(template: string, maxLength: number = 60): string {
  if (!template) return '';
  const trimmed = template.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.substring(0, maxLength) + '...';
}

/**
 * Check if config should have migration prompt shown
 * @param config Config object
 * @returns True if migration should be offered
 */
export function shouldShowMigrationPrompt(config: any): boolean {
  // Don't show if already using unified template
  if (config.unified_template_mode) return false;

  // Show if has legacy templates
  const detection = detectLegacyTemplates(config);
  return detection.hasLegacyTemplates;
}

/**
 * Apply migration to config object
 * @param config Original config
 * @returns Updated config with migration applied
 */
export function applyMigration(config: any): any {
  const migration = migrateToUnified(config);

  if (!migration.unified_template_mode) {
    return config; // Nothing to migrate
  }

  return {
    ...config,
    unified_template_mode: migration.unified_template_mode,
    unified_template: migration.unified_template,
    ignore_entity_state_config: migration.ignore_entity_state_config,

    // Optionally disable legacy templates (user preference)
    // Keeping them enabled for full backward compatibility
    // template_mode: false,
    // dynamic_icon_template_mode: false,
    // dynamic_color_template_mode: false,
  };
}

