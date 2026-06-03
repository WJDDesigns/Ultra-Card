import type { PresetDefinition, SmartGenerateRequest } from '../types';
import {
  parseSmartCompositionPlan,
  type SmartCompositionPlan,
  type SmartCompositionSection,
} from './uc-smart-composition-planner';
import {
  inferEntityDomainsFromPrompt,
  isProSmartModule,
  isSmartContainerType,
  isSmartModuleType,
  promptWantsTextContent,
} from './uc-smart-module-capabilities';
import { buildBarModuleFromContext, sanitizeBarModule, supplementalSmartModuleHandlers } from './smart/smart-module-handlers';
import { defaultDisplayActions } from './smart/smart-sanitize-utils';
import type { SmartBuildContext, SmartSanitizeModuleContext } from './smart/smart-module-types';
import {
  getSmartModuleSpec,
  initSmartModuleRegistry,
  isRegistrySmartModuleType,
} from './smart/uc-smart-module-registry';

export type SmartSanitizeHass = {
  states?: Record<string, unknown>;
};

export type SmartSanitizeContext = {
  tier: SmartGenerateRequest['tier'];
  prompt: string;
  allowProModules?: boolean | undefined;
};

type SmartModule = Record<string, unknown>;

export function entityExists(hass: SmartSanitizeHass, entityId: string): boolean {
  return Boolean(entityId && hass.states && entityId in hass.states);
}

export function entityName(hass: SmartSanitizeHass, entityId: string, state?: unknown): string {
  const stateObj = state ?? hass.states?.[entityId];
  const attrs =
    stateObj && typeof stateObj === 'object' && 'attributes' in stateObj
      ? ((stateObj as { attributes?: Record<string, unknown> }).attributes || {})
      : {};
  return String(attrs.friendly_name || labelFromEntityId(entityId));
}

export function labelFromEntityId(entityId: string): string {
  const objectId = entityId.split('.')[1] || entityId;
  return objectId
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function sanitizeSmartLayout(
  hass: SmartSanitizeHass,
  layout: unknown,
  context: SmartSanitizeContext,
  idPrefix: string
): PresetDefinition['layout'] | null {
  if (!layout || typeof layout !== 'object') return null;
  const candidate = layout as PresetDefinition['layout'];
  if (!Array.isArray(candidate.rows) || candidate.rows.length === 0) return null;

  const rows = candidate.rows
    .map((row, rowIndex) => {
      if (!row || typeof row !== 'object') return null;
      const columns = Array.isArray(row.columns)
        ? row.columns
            .map((column, columnIndex) => {
              if (!column || typeof column !== 'object') return null;
              const modules = sanitizeSmartModules(
                Array.isArray(column.modules) ? column.modules : [],
                hass,
                context,
                `${idPrefix}-r${rowIndex}-c${columnIndex}`
              );
              if (!modules.length) return null;
              return {
                id: String(column.id || `${idPrefix}-r${rowIndex}-c${columnIndex}`),
                modules,
              };
            })
            .filter(Boolean)
        : [];
      if (!columns.length) return null;
      return {
        id: String(row.id || `${idPrefix}-row-${rowIndex}`),
        column_layout: row.column_layout || '1-col',
        columns,
      };
    })
    .filter(Boolean);

  if (!rows.length) return null;
  return { rows } as PresetDefinition['layout'];
}

export function sanitizeSmartModules(
  rawModules: unknown[],
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  idPrefix: string
): PresetDefinition['layout']['rows'][number]['columns'][number]['modules'] {
  return rawModules
    .flatMap((rawModule, index) => {
      const sanitized = sanitizeSmartModule(rawModule, hass, context, `${idPrefix}-m${index}`);
      if (!sanitized) return [];
      return Array.isArray(sanitized) ? sanitized : [sanitized];
    }) as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'];
}

export function sanitizeSmartModule(
  rawModule: unknown,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  id: string
): SmartModule | SmartModule[] | null {
  if (!rawModule || typeof rawModule !== 'object') return null;
  const module = rawModule as SmartModule;
  const requestedType = String(module.type || '');
  if (!requestedType) return null;

  const resolvedType = resolveModuleTypeForTier(requestedType, context);
  if (!resolvedType) return null;

  if (resolvedType !== requestedType) {
    return downgradeProModule(requestedType, resolvedType, module, hass, context, id);
  }

  if (!promptWantsTextContent(context.prompt) && resolvedType === 'markdown') {
    return null;
  }

  const spec = getSmartModuleSpec(resolvedType);
  if (!spec?.sanitize) return null;
  return spec.sanitize(module, { hass, context, id });
}

function resolveModuleTypeForTier(type: string, context: SmartSanitizeContext): string | null {
  if (!isSmartModuleType(type) && !isRegistrySmartModuleType(type)) return null;
  const spec = getSmartModuleSpec(type);
  if (!spec?.isSmartComposable) return null;
  if (spec.tier === 'pro' && context.tier !== 'pro' && !context.allowProModules) {
    return spec.proDowngradeType || null;
  }
  return type;
}

function downgradeProModule(
  requestedType: string,
  resolvedType: string,
  module: SmartModule,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  id: string
): SmartModule | SmartModule[] | null {
  if (resolvedType === 'info') {
    const entityId = String(module.entity || module.weather_entity || '');
    if (!entityExists(hass, entityId)) return null;
    return sanitizeInfoModule(
      {
        type: 'info',
        info_entities: [{ entity: entityId, name: String(module.name || entityName(hass, entityId)) }],
        columns: 1,
      },
      hass,
      id
    );
  }

  if (
    resolvedType === 'icon' &&
    (requestedType === 'animated_weather' ||
      requestedType === 'animated_forecast' ||
      requestedType === 'dynamic_weather')
  ) {
    const entityId = String(module.weather_entity || module.entity || findFirstEntityForDomain(hass, 'weather'));
    if (!entityExists(hass, entityId)) return null;
    return buildWeatherHeaderRow(id, entityId, hass);
  }

  return sanitizeSmartModule({ ...module, type: resolvedType }, hass, context, id);
}

function sanitizeContainerModule(
  type: string,
  module: SmartModule,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext,
  id: string
): SmartModule | null {
  if (type === 'tabs') {
    const rawSections = Array.isArray(module.sections) ? module.sections : [];
    const sections = rawSections
      .map((section, index) => {
        if (!section || typeof section !== 'object') return null;
        const sectionObj = section as SmartModule;
        const childModules = sanitizeSmartModules(
          Array.isArray(sectionObj.modules) ? sectionObj.modules : [],
          hass,
          context,
          `${id}-tab-${index}`
        );
        if (!childModules.length) return null;
        return {
          id: String(sectionObj.id || `${id}-tab-${index}`),
          title: String(sectionObj.title || `Tab ${index + 1}`).slice(0, 40),
          modules: childModules,
        };
      })
      .filter(Boolean);
    if (!sections.length) return null;
    return { id, type: 'tabs', sections, orientation: 'horizontal', style: 'default' };
  }

  if (type === 'accordion') {
    const childModules = sanitizeSmartModules(
      Array.isArray(module.modules) ? module.modules : [],
      hass,
      context,
      `${id}-acc`
    );
    if (!childModules.length) return null;
    return {
      id,
      type: 'accordion',
      title_mode: 'custom',
      title_text: String(module.title_text || module.title || 'Section').slice(0, 60),
      modules: childModules,
      default_open: true,
    };
  }

  if (type === 'stack') {
    const childModules = sanitizeSmartModules(
      Array.isArray(module.modules) ? module.modules : [],
      hass,
      context,
      `${id}-stack`
    );
    if (!childModules.length) return null;
    return {
      id,
      type: 'stack',
      modules: childModules,
      aspect_ratio: '16:9',
    };
  }

  if (type === 'slider') {
    const rawPages = Array.isArray(module.pages) ? module.pages : Array.isArray(module.modules) ? [{ modules: module.modules }] : [];
    const pages = rawPages
      .map((page, index) => {
        if (!page || typeof page !== 'object') return null;
        const pageObj = page as SmartModule;
        const childModules = sanitizeSmartModules(
          Array.isArray(pageObj.modules) ? pageObj.modules : [],
          hass,
          context,
          `${id}-page-${index}`
        );
        if (!childModules.length) return null;
        return { id: String(pageObj.id || `${id}-page-${index}`), modules: childModules };
      })
      .filter(Boolean);
    if (!pages.length) return null;
    return { id, type: 'slider', pages, orientation: 'horizontal', style: 'default' };
  }

  if (type === 'horizontal' || type === 'vertical') {
    const childModules = sanitizeSmartModules(
      Array.isArray(module.modules) ? module.modules : [],
      hass,
      context,
      id
    );
    if (!childModules.length) return null;
    return {
      id,
      type,
      modules: childModules,
      gap: numberInRange(module.gap, 0, 48, 8),
      gap_unit: oneOf(module.gap_unit, ['px', 'rem', 'em', '%', 'vw', 'vh'], 'px'),
      ...(type === 'horizontal'
        ? {
            alignment: oneOf(module.alignment, ['left', 'center', 'right', 'space-between'], 'space-between'),
            vertical_alignment: oneOf(module.vertical_alignment, ['top', 'center', 'bottom'], 'center'),
          }
        : {
            horizontal_alignment: oneOf(module.horizontal_alignment, ['left', 'center', 'right', 'stretch'], 'stretch'),
          }),
    };
  }

  return null;
}

function sanitizeTextModule(module: SmartModule, id: string): SmartModule | null {
  const text = String(module.text || '').trim();
  if (!text) return null;
  return {
    id,
    type: 'text',
    text: text.slice(0, 160),
    font_size: numberInRange(module.font_size, 10, 48, 18),
    font_weight: String(module.font_weight || '600'),
    alignment: oneOf(module.alignment, ['left', 'center', 'right', 'justify'], 'left'),
  };
}

function sanitizeMarkdownModule(module: SmartModule, id: string): SmartModule | null {
  const content = String(module.content || '').trim();
  if (!content) return null;
  return { id, type: 'markdown', content: content.slice(0, 2000) };
}

function sanitizeInfoModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.info_entities) ? module.info_entities : [];
  const infoEntities = rawEntities
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const entityId = String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      const entityItem = item as SmartModule;
      return {
        id: `${id}-entity-${index}`,
        entity: entityId,
        name: String(entityItem.name || entityName(hass, entityId)),
        show_icon: entityItem.show_icon !== false,
        show_name: entityItem.show_name !== false,
        show_state: entityItem.show_state !== false,
        ...(entityItem.attribute ? { attribute: String(entityItem.attribute) } : {}),
      };
    })
    .filter(Boolean);
  if (!infoEntities.length) return null;
  return {
    id,
    type: 'info',
    info_entities: infoEntities,
    columns: numberInRange(module.columns, 1, 4, 1),
    alignment: oneOf(
      module.alignment,
      ['left', 'center', 'right', 'space-between', 'space-around'],
      'space-between'
    ),
    vertical_alignment: oneOf(module.vertical_alignment, ['top', 'center', 'bottom'], 'center'),
    ...(numberInRange(module.text_size, 10, 64, undefined) !== undefined
      ? { text_size: numberInRange(module.text_size, 10, 64, undefined) }
      : {}),
    ...(numberInRange(module.icon_size, 8, 64, undefined) !== undefined
      ? { icon_size: numberInRange(module.icon_size, 8, 64, undefined) }
      : {}),
  };
}

function sanitizeIconModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawIcons = Array.isArray(module.icons) ? module.icons : [];
  const icons = rawIcons
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const icon = item as SmartModule;
      const entityId = String(icon.entity || '');
      if (!entityExists(hass, entityId)) return null;
      return {
        id: `${id}-icon-${index}`,
        icon_mode: 'entity',
        entity: entityId,
        name: String(icon.name || entityName(hass, entityId)),
        icon_inactive: String(icon.icon_inactive || 'mdi:circle-outline'),
        icon_active: String(icon.icon_active || icon.icon_inactive || 'mdi:circle'),
        inactive_state: String(icon.inactive_state || 'off'),
        active_state: String(icon.active_state || 'on'),
        use_entity_color_for_icon: Boolean(icon.use_entity_color_for_icon),
        show_name_when_inactive: true,
        show_name_when_active: true,
        show_state_when_inactive: true,
        show_state_when_active: true,
        show_icon_when_inactive: true,
        show_icon_when_active: true,
      };
    })
    .filter(Boolean);
  if (!icons.length) return null;
  return {
    id,
    type: 'icon',
    icons,
    columns: numberInRange(module.columns, 1, 6, 1),
    alignment: 'left',
    vertical_alignment: 'center',
  };
}

function sanitizeButtonModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const label = String(module.label || '').trim();
  if (!label) return null;
  return {
    id,
    type: 'button',
    label: label.slice(0, 40),
    style: oneOf(module.style, ['flat', 'glossy', 'outline', 'glass', 'neumorphic'], 'flat'),
    show_icon: Boolean(module.show_icon),
    icon: String(module.icon || ''),
    icon_position: 'before',
    tap_action: sanitizeAction(module.tap_action, hass),
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
  };
}

function sanitizeLightModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawPresets = Array.isArray(module.presets) ? module.presets : [];
  const presets = rawPresets
    .map((preset, index) => {
      if (!preset || typeof preset !== 'object') return null;
      const presetObj = preset as SmartModule;
      const entities = Array.isArray(presetObj.entities)
        ? presetObj.entities
            .map(entity => String(entity))
            .filter(entity => entityExists(hass, entity) && entity.startsWith('light.'))
        : [];
      if (!entities.length) return null;
      return {
        id: `${id}-preset-${index}`,
        name: String(presetObj.name || 'Light').slice(0, 40),
        action: oneOf(presetObj.action, ['turn_on', 'turn_off', 'toggle'], 'toggle'),
        icon: String(presetObj.icon || 'mdi:lightbulb'),
        entities,
        brightness: numberInRange(presetObj.brightness, 1, 255, undefined),
        use_light_color_for_icon: Boolean(presetObj.use_light_color_for_icon),
        use_light_color_for_button: Boolean(presetObj.use_light_color_for_button),
        smart_color: true,
        button_style: oneOf(presetObj.button_style, ['filled', 'outlined', 'text'], 'filled'),
        show_label: true,
        border_radius: 8,
      };
    })
    .filter(Boolean);
  if (!presets.length) return null;
  return {
    id,
    type: 'light',
    presets,
    layout: oneOf(module.layout, ['buttons', 'grid'], 'buttons'),
    button_alignment: 'center',
    allow_wrapping: true,
    button_gap: 0.5,
    columns: numberInRange(module.columns, 1, 4, 2),
    show_labels: true,
    button_style: 'filled',
    default_transition_time: 0.5,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
  };
}

function sanitizeLockModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (!entityExists(hass, entityId) || !entityId.startsWith('lock.')) return null;
  return buildLockModule(id, entityId, String(module.name || entityName(hass, entityId)), module);
}

function sanitizeCoverModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (!entityExists(hass, entityId) || !entityId.startsWith('cover.')) return null;
  return {
    id,
    type: 'cover',
    entity: entityId,
    name: String(module.name || entityName(hass, entityId)),
    layout: oneOf(module.layout, ['standard', 'compact', 'hero'], 'standard'),
    show_title: true,
    show_icon: true,
    show_state: true,
    show_position: true,
    show_stop: true,
    show_position_control: true,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

function sanitizeFanModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (!entityExists(hass, entityId) || !entityId.startsWith('fan.')) return null;
  return {
    id,
    type: 'fan',
    entity: entityId,
    name: String(module.name || entityName(hass, entityId)),
    layout: oneOf(module.layout, ['standard', 'compact', 'hero'], 'standard'),
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

function sanitizeClimateModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (!entityExists(hass, entityId) || !entityId.startsWith('climate.')) return null;
  return {
    id,
    type: 'climate',
    entity: entityId,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

function sanitizeMediaPlayerModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (!entityExists(hass, entityId) || !entityId.startsWith('media_player.')) return null;
  return {
    id,
    type: 'media_player',
    entity: entityId,
    name: String(module.name || entityName(hass, entityId)),
    layout: oneOf(module.layout, ['card', 'compact', 'minimal'], 'card'),
    show_name: true,
    show_album_art: true,
    show_track_info: true,
    show_progress: true,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

function sanitizeStatusSummaryModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : [];
  const entities = rawEntities
    .map((item, index) => {
      if (typeof item === 'string') {
        if (!entityExists(hass, item)) return null;
        return {
          id: `${id}-entity-${index}`,
          entity: item,
          name: entityName(hass, item),
          show_icon: true,
          show_state: true,
        };
      }
      if (!item || typeof item !== 'object') return null;
      const entityId = String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      return {
        id: `${id}-entity-${index}`,
        entity: entityId,
        name: String((item as SmartModule).name || entityName(hass, entityId)),
        show_icon: (item as SmartModule).show_icon !== false,
        show_state: (item as SmartModule).show_state !== false,
      };
    })
    .filter(Boolean);
  if (!entities.length) return null;
  return {
    id,
    type: 'status_summary',
    entities,
    title: String(module.title || 'Status Summary').slice(0, 60),
    show_title: module.show_title !== false,
    show_last_change_header: true,
    show_time_header: false,
    sort_by: 'last_change',
    sort_direction: 'desc',
    max_items_to_show: numberInRange(module.max_items_to_show, 1, 50, Math.min(entities.length, 12)),
    global_show_icon: true,
    global_show_state: true,
    row_height: 40,
    row_gap: 4,
    show_separator_lines: true,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

function sanitizeGaugeModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const entityId = String(module.entity || '');
  if (!entityExists(hass, entityId) || !entityId.startsWith('sensor.')) return null;
  const name = String(module.name || entityName(hass, entityId));
  return {
    id,
    type: 'gauge',
    entity: entityId,
    name,
    value_type: 'entity',
    min_value: numberInRange(module.min_value, 0, 1000, 0),
    max_value: numberInRange(module.max_value, 1, 1000, 100),
    gauge_style: oneOf(
      module.gauge_style,
      ['basic', 'speedometer', 'block', 'lines', 'modern', 'inset', '3d', 'neon', 'digital', 'minimal', 'arc', 'radial'],
      'speedometer'
    ),
    gauge_size: numberInRange(module.gauge_size, 80, 400, 180),
    gauge_thickness: numberInRange(module.gauge_thickness, 1, 50, 15),
    pointer_enabled: module.pointer_enabled !== false,
    pointer_style: oneOf(module.pointer_style, ['triangle', 'line', 'needle', 'arrow', 'circle', 'highlight', 'cap', 'icon', 'custom'], 'needle'),
    gauge_color_mode: 'gradient',
    use_gradient: true,
    gradient_stops: [
      { id: `${id}-stop-0`, position: 0, color: '#4CAF50' },
      { id: `${id}-stop-50`, position: 50, color: '#FFC107' },
      { id: `${id}-stop-100`, position: 100, color: '#F44336' },
    ],
    show_name: module.show_name !== false,
    show_value: true,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

export function buildGaugeModule(
  id: string,
  entityId: string,
  name: string,
  label?: string
): SmartModule {
  return {
    id,
    type: 'gauge',
    entity: entityId,
    name: label || name,
    value_type: 'entity',
    min_value: 0,
    max_value: 100,
    gauge_style: 'speedometer',
    gauge_size: 180,
    gauge_thickness: 15,
    pointer_enabled: true,
    pointer_style: 'needle',
    gauge_color_mode: 'gradient',
    use_gradient: true,
    gradient_stops: [
      { id: `${id}-stop-0`, position: 0, color: '#4CAF50' },
      { id: `${id}-stop-50`, position: 50, color: '#FFC107' },
      { id: `${id}-stop-100`, position: 100, color: '#F44336' },
    ],
    show_name: true,
    show_value: true,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

function sanitizeGridModule(module: SmartModule, hass: SmartSanitizeHass, id: string): SmartModule | null {
  const rawEntities = Array.isArray(module.entities) ? module.entities : [];
  const entities = rawEntities
    .map((item, index) => {
      if (typeof item === 'string') {
        if (!entityExists(hass, item)) return null;
        return { id: `${id}-grid-${index}`, entity: item, name: entityName(hass, item) };
      }
      if (!item || typeof item !== 'object') return null;
      const entityId = String((item as SmartModule).entity || '');
      if (!entityExists(hass, entityId)) return null;
      return {
        id: `${id}-grid-${index}`,
        entity: entityId,
        name: String((item as SmartModule).name || entityName(hass, entityId)),
      };
    })
    .filter(Boolean);
  if (!entities.length) return null;
  return {
    id,
    type: 'grid',
    entities,
    style_preset: 'style_1',
    columns: numberInRange(module.columns, 1, 6, 3),
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

export function buildLockModule(
  id: string,
  entityId: string,
  name: string,
  module: SmartModule = {}
): SmartModule {
  return {
    id,
    type: 'lock',
    entity: entityId,
    name,
    layout: oneOf(module.layout, ['standard', 'compact', 'hero'], 'standard'),
    alignment: 'center',
    show_title: true,
    show_icon: true,
    show_state: true,
    show_open_button: true,
    tap_action: { action: 'nothing' },
    hold_action: { action: 'nothing' },
    double_tap_action: { action: 'nothing' },
    display_mode: 'always',
    display_conditions: [],
  };
}

export function buildLightControlRow(
  id: string,
  entityId: string,
  name: string,
  style = 'clean'
): SmartModule {
  return {
    id,
    type: 'horizontal',
    gap: style === 'dense' ? 6 : 10,
    gap_unit: 'px',
    alignment: 'space-between',
    vertical_alignment: 'center',
    modules: [
      {
        id: `${id}-icon`,
        type: 'icon',
        icons: [
          {
            id: `${id}-icon-entity`,
            icon_mode: 'entity',
            entity: entityId,
            name,
            icon_inactive: 'mdi:lightbulb-outline',
            icon_active: 'mdi:lightbulb',
            inactive_state: 'off',
            active_state: 'on',
            use_entity_color_for_icon: true,
            show_name_when_inactive: true,
            show_name_when_active: true,
            show_state_when_inactive: true,
            show_state_when_active: true,
            show_icon_when_inactive: true,
            show_icon_when_active: true,
          },
        ],
        columns: 1,
        alignment: 'left',
        vertical_alignment: 'center',
      },
      {
        id: `${id}-buttons`,
        type: 'light',
        presets: [
          {
            id: `${id}-on`,
            name: 'On',
            action: 'turn_on',
            icon: 'mdi:lightbulb-on',
            entities: [entityId],
            brightness: 255,
            use_light_color_for_icon: true,
            use_light_color_for_button: true,
            smart_color: true,
            button_style: 'filled',
            show_label: true,
            border_radius: 8,
          },
          {
            id: `${id}-off`,
            name: 'Off',
            action: 'turn_off',
            icon: 'mdi:lightbulb-off',
            entities: [entityId],
            use_light_color_for_icon: false,
            use_light_color_for_button: false,
            smart_color: true,
            button_style: 'outlined',
            show_label: true,
            border_radius: 8,
          },
        ],
        layout: 'buttons',
        button_alignment: 'right',
        allow_wrapping: false,
        button_gap: 0.4,
        columns: 2,
        show_labels: true,
        button_style: 'filled',
        default_transition_time: 0.5,
        tap_action: { action: 'nothing' },
        hold_action: { action: 'nothing' },
        double_tap_action: { action: 'nothing' },
      },
    ],
  };
}

export function buildLightStatusRow(
  id: string,
  entityId: string,
  name: string,
  style = 'clean'
): SmartModule {
  const dense = style === 'dense';
  const bold = style === 'bold';
  return {
    id,
    type: 'horizontal',
    gap: dense ? 6 : 10,
    gap_unit: 'px',
    alignment: 'space-between',
    vertical_alignment: 'center',
    modules: [
      {
        id: `${id}-icon`,
        type: 'icon',
        icons: [
          {
            id: `${id}-icon-entity`,
            icon_mode: 'entity',
            entity: entityId,
            name,
            icon_inactive: 'mdi:lightbulb-outline',
            icon_active: 'mdi:lightbulb',
            inactive_state: 'off',
            active_state: 'on',
            use_entity_color_for_icon: true,
            show_name_when_inactive: true,
            show_name_when_active: true,
            show_state_when_inactive: true,
            show_state_when_active: true,
            show_icon_when_inactive: true,
            show_icon_when_active: true,
          },
        ],
        columns: 1,
        alignment: 'left',
        vertical_alignment: 'center',
      },
      {
        id: `${id}-details`,
        type: 'info',
        info_entities: [
          {
            id: `${id}-brightness`,
            entity: entityId,
            name: 'Brightness',
            show_icon: false,
            show_name: true,
            show_state: true,
            attribute: 'brightness',
          },
          {
            id: `${id}-color`,
            entity: entityId,
            name: 'Color',
            show_icon: false,
            show_name: true,
            show_state: true,
            attribute: 'rgb_color',
          },
        ],
        columns: bold ? 2 : 1,
        alignment: 'space-between',
        vertical_alignment: 'center',
      },
    ],
  };
}

export function buildWeatherHeaderRow(
  id: string,
  entityId: string,
  hass: SmartSanitizeHass,
  options: { largeText?: boolean } = {}
): SmartModule {
  const name = entityName(hass, entityId);
  const largeText = options.largeText === true;
  return {
    id,
    type: 'horizontal',
    gap: 12,
    gap_unit: 'px',
    alignment: 'space-between',
    vertical_alignment: 'center',
    modules: [
      {
        id: `${id}-icon`,
        type: 'icon',
        icons: [
          {
            id: `${id}-icon-entity`,
            icon_mode: 'entity',
            entity: entityId,
            name,
            icon_inactive: 'mdi:weather-partly-cloudy',
            icon_active: 'mdi:weather-partly-cloudy',
            inactive_state: '',
            active_state: '',
            show_name_when_inactive: !largeText,
            show_name_when_active: !largeText,
            show_state_when_inactive: !largeText,
            show_state_when_active: !largeText,
            show_icon_when_inactive: true,
            show_icon_when_active: true,
          },
        ],
        columns: 1,
        alignment: 'left',
        vertical_alignment: 'center',
      },
      {
        id: `${id}-temp`,
        type: 'info',
        info_entities: [
          {
            id: `${id}-temp-entity`,
            entity: entityId,
            name: 'Temperature',
            show_icon: false,
            show_name: !largeText,
            show_state: true,
            attribute: 'temperature',
          },
        ],
        columns: 1,
        alignment: 'right',
        vertical_alignment: 'center',
        ...(largeText ? { text_size: 36 } : {}),
      },
    ],
  };
}

export function buildEntityModule(
  id: string,
  entityId: string,
  domain: string,
  name: string,
  style: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext
): SmartModule {
  if (domain === 'lock') {
    return buildLockModule(id, entityId, name, { layout: style === 'minimal' || style === 'dense' ? 'compact' : 'standard' });
  }
  if (domain === 'light') {
    return promptWantsLightStatusDetails(context.prompt)
      ? buildLightStatusRow(id, entityId, name, style)
      : buildLightControlRow(id, entityId, name, style);
  }
  if (domain === 'weather') {
    return buildWeatherHeaderRow(id, entityId, hass);
  }
  if (domain === 'cover') {
    return sanitizeCoverModule({ type: 'cover', entity: entityId, name }, hass, id) || buildInfoModule(id, entityId, name, hass);
  }
  if (domain === 'fan') {
    return sanitizeFanModule({ type: 'fan', entity: entityId, name }, hass, id) || buildInfoModule(id, entityId, name, hass);
  }
  if (domain === 'climate') {
    if (context.tier === 'pro' || context.allowProModules) {
      return sanitizeClimateModule({ type: 'climate', entity: entityId }, hass, id) || buildInfoModule(id, entityId, name, hass);
    }
    return buildInfoModule(id, entityId, name, hass);
  }
  if (domain === 'media_player') {
    return sanitizeMediaPlayerModule({ type: 'media_player', entity: entityId, name }, hass, id) || buildInfoModule(id, entityId, name, hass);
  }
  return buildInfoModule(id, entityId, name, hass);
}

export function buildEntityStatusRow(
  id: string,
  entityId: string,
  name: string,
  style = 'clean',
  attributes: string[] = []
): SmartModule {
  const dense = style === 'dense';
  const infoEntities = attributes.length
    ? attributes.map((attribute, index) => ({
        id: `${id}-attr-${index}`,
        entity: entityId,
        name: attributeLabel(attribute),
        show_icon: false,
        show_name: true,
        show_state: true,
        attribute,
      }))
    : [
        {
          id: `${id}-state`,
          entity: entityId,
          name,
          show_icon: false,
          show_name: true,
          show_state: true,
        },
      ];

  return {
    id,
    type: 'horizontal',
    gap: dense ? 6 : 10,
    gap_unit: 'px',
    alignment: 'space-between',
    vertical_alignment: 'center',
    modules: [
      {
        id: `${id}-icon`,
        type: 'icon',
        icons: [
          {
            id: `${id}-icon-entity`,
            icon_mode: 'entity',
            entity: entityId,
            name,
            icon_inactive: 'mdi:circle-outline',
            icon_active: 'mdi:circle',
            inactive_state: 'off',
            active_state: 'on',
            use_entity_color_for_icon: true,
            show_name_when_inactive: true,
            show_name_when_active: true,
            show_state_when_inactive: true,
            show_state_when_active: true,
            show_icon_when_inactive: true,
            show_icon_when_active: true,
          },
        ],
        columns: 1,
        alignment: 'left',
        vertical_alignment: 'center',
      },
      {
        id: `${id}-details`,
        type: 'info',
        info_entities: infoEntities,
        columns: attributes.length > 1 ? Math.min(attributes.length, 2) : 1,
        alignment: 'space-between',
        vertical_alignment: 'center',
      },
    ],
  };
}

export function buildToggleButtonRow(
  id: string,
  entityId: string,
  name: string,
  style = 'clean',
  iconInactive = 'mdi:power',
  iconActive = 'mdi:power'
): SmartModule {
  return {
    id,
    type: 'horizontal',
    gap: style === 'dense' ? 6 : 10,
    gap_unit: 'px',
    alignment: 'space-between',
    vertical_alignment: 'center',
    modules: [
      {
        id: `${id}-icon`,
        type: 'icon',
        icons: [
          {
            id: `${id}-icon-entity`,
            icon_mode: 'entity',
            entity: entityId,
            name,
            icon_inactive: iconInactive,
            icon_active: iconActive,
            inactive_state: 'off',
            active_state: 'on',
            use_entity_color_for_icon: true,
            show_name_when_inactive: true,
            show_name_when_active: true,
            show_state_when_inactive: true,
            show_state_when_active: true,
            show_icon_when_inactive: true,
            show_icon_when_active: true,
          },
        ],
        columns: 1,
        alignment: 'left',
        vertical_alignment: 'center',
      },
      {
        id: `${id}-toggle`,
        type: 'button',
        label: 'Toggle',
        style: 'flat',
        show_icon: true,
        icon: 'mdi:toggle-switch',
        icon_position: 'before',
        tap_action: { action: 'toggle', entity: entityId },
        hold_action: { action: 'nothing' },
        double_tap_action: { action: 'nothing' },
      },
    ],
  };
}

export function buildModulesFromCompositionPlan(
  id: string,
  plan: SmartCompositionPlan,
  style: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext
): SmartModule[] {
  const sections = plan.sections.filter(section => section.entities.length > 0);
  if (!sections.length) return [];

  if (sections.length === 1) {
    return buildSectionModules(`${id}-section-0`, sections[0], style, hass, context);
  }

  return [
    {
      id: `${id}-stack`,
      type: 'vertical',
      gap: sectionGap(style),
      gap_unit: 'px',
      horizontal_alignment: 'stretch',
      modules: sections.flatMap((section, index) =>
        buildSectionModules(`${id}-section-${index}`, section, style, hass, context)
      ),
    },
  ];
}

function buildSectionModules(
  id: string,
  section: SmartCompositionSection,
  style: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext
): SmartModule[] {
  switch (section.recipe) {
    case 'header': {
      const entity = section.entities[0];
      if (!entity) return [];
      if (entity.domain === 'weather') {
        return [
          buildWeatherHeaderRow(id, entity.entityId, hass, { largeText: section.wantsLargeText }),
        ];
      }
      return [
        buildEntityStatusRow(
          id,
          entity.entityId,
          entity.name,
          style,
          section.detailAttributes
        ),
      ];
    }
    case 'entityGrid': {
      const columns =
        section.domains.includes('light') && section.entities.length <= 4
          ? Math.min(section.entities.length, 4)
          : Math.min(Math.max(section.entities.length, 2), 4);
      const grid =
        sanitizeGridModule(
          {
            type: 'grid',
            entities: section.entities.map(entity => ({
              entity: entity.entityId,
              name: entity.name,
            })),
            columns,
          },
          hass,
          id
        ) || null;
      return grid ? [grid] : [];
    }
    case 'gaugeModule': {
      const entity = section.entities[0];
      if (!entity) return [];
      const label = /\bfuel\b|\bcar\b|\bvehicle\b/.test(context.prompt) ? 'Fuel Level' : entity.name;
      return [
        sanitizeGaugeModule(
          buildGaugeModule(id, entity.entityId, entity.name, label),
          hass,
          id
        ) || buildGaugeModule(id, entity.entityId, entity.name, label),
      ];
    }
    case 'barModule': {
      const entity = section.entities[0];
      if (!entity) return [];
      const label = /\bfuel\b|\bcar\b|\bvehicle\b/.test(context.prompt) ? 'Fuel Level' : entity.name;
      const bar = buildBarModuleFromContext({
        id,
        entity,
        prompt: context.prompt,
        hass,
        context,
        style,
      });
      if (!bar) return [];
      return [sanitizeBarModule(bar, hass, id) || bar];
    }
    case 'singleModule': {
      if (!section.forcedModuleType) return [];
      const entity = section.entities[0];
      const spec = getSmartModuleSpec(section.forcedModuleType);
      if (!spec?.defaultBuilder || !entity) return [];
      const built = spec.defaultBuilder({
        id,
        entity,
        entities: section.entities,
        prompt: context.prompt,
        style,
        hass,
        context,
      });
      if (!built) return [];
      const modules = Array.isArray(built) ? built : [built];
      return modules
        .map((module, index) =>
          sanitizeSmartModule(module, hass, context, `${id}-single-${index}`)
        )
        .flatMap(item => (item ? (Array.isArray(item) ? item : [item]) : []));
    }
    case 'controlList': {
      const controlRows = section.entities.map((entity, index) =>
        buildControlRowForEntity(
          `${id}-control-${index}`,
          entity,
          section,
          style,
          hass,
          context
        )
      );
      if (section.layoutPreference === 'horizontal' && controlRows.length > 1) {
        return [
          {
            id: `${id}-controls-horizontal`,
            type: 'horizontal',
            gap: style === 'dense' ? 6 : 10,
            gap_unit: 'px',
            alignment: 'space-between',
            vertical_alignment: 'top',
            modules: controlRows.slice(0, 4),
          },
        ];
      }
      return controlRows;
    }
    case 'domainModule':
      return section.entities.map((entity, index) =>
        buildEntityModule(
          `${id}-${entity.domain}-${index}`,
          entity.entityId,
          entity.domain,
          entity.name,
          style,
          hass,
          context
        )
      );
    case 'entityList':
    default: {
      const rows = section.entities.map((entity, index) =>
        buildStatusRowForEntity(`${id}-row-${index}`, entity, section, style, hass, context)
      );
      if (section.layoutPreference === 'horizontal' && rows.length > 1) {
        return [
          {
            id: `${id}-list-horizontal`,
            type: 'horizontal',
            gap: style === 'dense' ? 6 : 10,
            gap_unit: 'px',
            alignment: 'space-between',
            vertical_alignment: 'top',
            modules: rows.slice(0, 4),
          },
        ];
      }
      return [
        {
          id: `${id}-list`,
          type: 'vertical',
          gap: style === 'dense' ? 4 : 8,
          gap_unit: 'px',
          horizontal_alignment: 'stretch',
          modules: rows,
        },
      ];
    }
  }
}

function buildControlRowForEntity(
  id: string,
  entity: { entityId: string; name: string; domain: string },
  section: SmartCompositionSection,
  style: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext
): SmartModule {
  if (entity.domain === 'light') {
    return buildLightControlRow(id, entity.entityId, entity.name, style);
  }
  if (entity.domain === 'fan' && section.wantsButtons) {
    return buildToggleButtonRow(
      id,
      entity.entityId,
      entity.name,
      style,
      'mdi:fan-off',
      'mdi:fan'
    );
  }
  if (entity.domain === 'fan') {
    return (
      sanitizeFanModule({ type: 'fan', entity: entity.entityId, name: entity.name }, hass, id) ||
      buildToggleButtonRow(id, entity.entityId, entity.name, style, 'mdi:fan-off', 'mdi:fan')
    );
  }
  if (entity.domain === 'lock') {
    return buildLockModule(id, entity.entityId, entity.name);
  }
  if (section.wantsButtons) {
    return buildToggleButtonRow(id, entity.entityId, entity.name, style);
  }
  return buildEntityModule(
    id,
    entity.entityId,
    entity.domain,
    entity.name,
    style,
    hass,
    context
  );
}

function buildStatusRowForEntity(
  id: string,
  entity: { entityId: string; name: string; domain: string },
  section: SmartCompositionSection,
  style: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext
): SmartModule {
  if (entity.domain === 'light' && (section.wantsDetails || section.detailAttributes.length)) {
    return buildLightStatusRow(id, entity.entityId, entity.name, style);
  }
  if (entity.domain === 'weather') {
    return buildWeatherHeaderRow(id, entity.entityId, hass);
  }
  if (section.detailAttributes.length) {
    return buildEntityStatusRow(id, entity.entityId, entity.name, style, section.detailAttributes);
  }
  return buildEntityStatusRow(id, entity.entityId, entity.name, style);
}

function sectionGap(style: string): number {
  if (style === 'dense') return 6;
  if (style === 'bold') return 14;
  return 10;
}

function attributeLabel(attribute: string): string {
  if (attribute === 'rgb_color') return 'Color';
  if (attribute === 'brightness') return 'Brightness';
  if (attribute === 'temperature') return 'Temperature';
  return attribute
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildComposedEntityModules(
  id: string,
  entities: Array<{ entityId: string; name: string; domain: string }>,
  style: string,
  hass: SmartSanitizeHass,
  context: SmartSanitizeContext
): SmartModule[] {
  const plan = parseSmartCompositionPlan(context.prompt, hass);
  const modules = buildModulesFromCompositionPlan(id, plan, style, hass, context);
  if (modules.length) return modules;

  return entities.map((entity, index) =>
    buildEntityModule(
      `${id}-${entity.domain}-${index}`,
      entity.entityId,
      entity.domain,
      entity.name,
      style,
      hass,
      context
    )
  );
}

export function buildStatusSummaryFallback(
  id: string,
  entityIds: string[],
  hass: SmartSanitizeHass,
  title: string
): SmartModule {
  return sanitizeStatusSummaryModule(
    {
      type: 'status_summary',
      title,
      entities: entityIds.map(entityId => ({ entity: entityId, name: entityName(hass, entityId) })),
      max_items_to_show: Math.min(entityIds.length, 12),
    },
    hass,
    id
  ) || {
    id,
    type: 'text',
    text: title,
    font_size: 18,
    font_weight: '600',
    alignment: 'left',
  };
}

function buildInfoModule(
  id: string,
  entityId: string,
  name: string,
  hass: SmartSanitizeHass
): SmartModule {
  return (
    sanitizeInfoModule(
      { type: 'info', info_entities: [{ entity: entityId, name }], columns: 1 },
      hass,
      id
    ) || {
      id,
      type: 'text',
      text: name || labelFromEntityId(entityId),
      font_size: 16,
      font_weight: '600',
      alignment: 'left',
    }
  );
}

function findFirstEntityForDomain(hass: SmartSanitizeHass, domain: string): string {
  return Object.keys(hass.states || {}).find(entityId => entityId.startsWith(`${domain}.`)) || '';
}

function sanitizeAction(value: unknown, hass: SmartSanitizeHass): Record<string, unknown> {
  if (!value || typeof value !== 'object') return { action: 'nothing' };
  const action = value as Record<string, unknown>;
  const actionType = String(action.action || '');
  if (actionType === 'toggle' || actionType === 'more-info') {
    const entity = String(action.entity || '');
    return entityExists(hass, entity) ? { action: actionType, entity } : { action: 'nothing' };
  }
  if (actionType === 'perform-action') {
    const service = String(action.service || '');
    return service.includes('.')
      ? { action: 'perform-action', service, service_data: action.service_data || {} }
      : { action: 'nothing' };
  }
  return { action: 'nothing' };
}

function numberInRange(value: unknown, min: number, max: number, fallback: number): number;
function numberInRange(value: unknown, min: number, max: number, fallback: undefined): number | undefined;
function numberInRange(
  value: unknown,
  min: number,
  max: number,
  fallback: number | undefined
): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export function selectEntitiesForPrompt(
  hass: SmartSanitizeHass,
  prompt: string
): Array<{ entityId: string; name: string; domain: string }> {
  const domains = inferEntityDomainsFromPrompt(prompt);
  if (!domains.length) return [];

  const matches = Object.entries(hass.states || {})
    .filter(([entityId]) => entityId.includes('.') && !entityId.startsWith('conversation.') && !entityId.startsWith('ai_task.'))
    .map(([entityId, state]) => ({
      entityId,
      name: entityName(hass, entityId, state),
      domain: entityId.split('.')[0],
    }))
    .filter(entity => domains.includes(entity.domain))
    .sort((a, b) => domains.indexOf(a.domain) - domains.indexOf(b.domain));

  if (domains.includes('weather') && domains.length > 1) {
    const firstWeather = matches.find(entity => entity.domain === 'weather');
    return [
      ...(firstWeather ? [firstWeather] : []),
      ...matches.filter(entity => entity.domain !== 'weather'),
    ].slice(0, 12);
  }

  return matches.slice(0, 12);
}

export function deriveTitleFromPrompt(
  prompt: string,
  entities: Array<{ domain: string }>
): string | null {
  if (entities.length && entities.every(entity => entity.domain === 'lock')) {
    return entities.length === 1 ? 'Lock Status' : 'Lock Status Overview';
  }
  if (entities.length && entities.every(entity => entity.domain === 'light')) {
    return entities.length === 1 ? 'Light Control' : 'Light Controls';
  }
  if (entities.some(entity => entity.domain === 'weather') && entities.some(entity => entity.domain === 'light')) {
    return 'Weather and Light Controls';
  }
  if (entities.length && entities.every(entity => entity.domain === 'weather')) {
    return 'Weather Overview';
  }
  if (entities.length && entities.every(entity => entity.domain === 'cover')) {
    return entities.length === 1 ? 'Cover Control' : 'Cover Controls';
  }
  if (entities.length && entities.every(entity => entity.domain === 'fan')) {
    return entities.length === 1 ? 'Fan Control' : 'Fan Controls';
  }
  if (entities.length && entities.every(entity => entity.domain === 'climate')) {
    return entities.length === 1 ? 'Climate Control' : 'Climate Controls';
  }
  if (entities.length && entities.every(entity => entity.domain === 'media_player')) {
    return 'Media Controls';
  }
  return prompt.replace(/\s+/g, ' ').trim().slice(0, 42) || null;
}

function promptWantsLightStatusDetails(prompt: string): boolean {
  const text = prompt.toLowerCase();
  return (
    /\bbrightness\b|\bbright\b|\bcolor\b|\bcolour\b/.test(text) ||
    (/\blights?\b/.test(text) && /\bstatus\b|\blist\b/.test(text) && !/\bon\/off\b|\bon and off\b|\bbuttons?\b/.test(text))
  );
}

function wrapSanitizeModuleWithoutHass(
  fn: (module: SmartModule, id: string) => SmartModule | null
): (raw: unknown, ctx: SmartSanitizeModuleContext) => SmartModule | null {
  return (raw, ctx) => {
    if (!raw || typeof raw !== 'object') return null;
    return fn(raw as SmartModule, ctx.id);
  };
}

function wrapSanitizeModule(
  fn: (module: SmartModule, hass: SmartSanitizeHass, id: string) => SmartModule | null
): (raw: unknown, ctx: SmartSanitizeModuleContext) => SmartModule | null {
  return (raw, ctx) => {
    if (!raw || typeof raw !== 'object') return null;
    return fn(raw as SmartModule, ctx.hass, ctx.id);
  };
}

function wrapContainerSanitize(type: string) {
  return (raw: unknown, ctx: SmartSanitizeModuleContext): SmartModule | null => {
    if (!raw || typeof raw !== 'object') return null;
    return sanitizeContainerModule(type, raw as SmartModule, ctx.hass, ctx.context, ctx.id);
  };
}

function buildGaugeModuleFromContext(ctx: SmartBuildContext): SmartModule | null {
  const entity = ctx.entity;
  if (!entity) return null;
  const label = /\bfuel\b|\bcar\b|\bvehicle\b/.test(ctx.prompt) ? 'Fuel Level' : entity.name;
  return buildGaugeModule(ctx.id, entity.entityId, entity.name, label);
}

initSmartModuleRegistry({
  text: { sanitize: wrapSanitizeModuleWithoutHass(sanitizeTextModule) },
  markdown: { sanitize: wrapSanitizeModuleWithoutHass(sanitizeMarkdownModule) },
  info: { sanitize: wrapSanitizeModule(sanitizeInfoModule) },
  icon: { sanitize: wrapSanitizeModule(sanitizeIconModule) },
  button: { sanitize: wrapSanitizeModule(sanitizeButtonModule) },
  light: { sanitize: wrapSanitizeModule(sanitizeLightModule) },
  lock: { sanitize: wrapSanitizeModule(sanitizeLockModule) },
  cover: { sanitize: wrapSanitizeModule(sanitizeCoverModule) },
  fan: { sanitize: wrapSanitizeModule(sanitizeFanModule) },
  climate: { sanitize: wrapSanitizeModule(sanitizeClimateModule) },
  media_player: { sanitize: wrapSanitizeModule(sanitizeMediaPlayerModule) },
  status_summary: { sanitize: wrapSanitizeModule(sanitizeStatusSummaryModule) },
  grid: { sanitize: wrapSanitizeModule(sanitizeGridModule) },
  gauge: {
    sanitize: wrapSanitizeModule(sanitizeGaugeModule),
    defaultBuilder: buildGaugeModuleFromContext,
  },
  horizontal: { sanitize: wrapContainerSanitize('horizontal') },
  vertical: { sanitize: wrapContainerSanitize('vertical') },
  stack: { sanitize: wrapContainerSanitize('stack') },
  tabs: { sanitize: wrapContainerSanitize('tabs') },
  accordion: { sanitize: wrapContainerSanitize('accordion') },
  slider: { sanitize: wrapContainerSanitize('slider') },
  activity_feed: {
    sanitize: wrapSanitizeModule((_module, _hass, id) => ({
      id,
      type: 'activity_feed',
      ...defaultDisplayActions(),
    })),
  },
  alarm_panel: {
    sanitize: wrapSanitizeModule((module, hass, id) => {
      const entityId = String(module.entity || '');
      if (entityId && entityExists(hass, entityId)) {
        return { id, type: 'alarm_panel', entity: entityId, ...defaultDisplayActions() };
      }
      return { id, type: 'alarm_panel', ...defaultDisplayActions() };
    }),
  },
  ...supplementalSmartModuleHandlers,
});
