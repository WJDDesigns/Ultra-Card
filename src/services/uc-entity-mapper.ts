import {
  LayoutConfig,
  CardRow,
  CardColumn,
  CardModule,
  EntityMapping,
  IconModule,
  InfoModule,
  BarModule,
  CameraModule,
  LightModule,
  HorizontalModule,
  VerticalModule,
  MapModule,
  SliderModule,
  ImageModule,
} from '../types';

/**
 * Service for applying entity mappings to Ultra Card layouts and fuzzy matching
 */
class UcEntityMapperService {
  private readonly _actionKeys = new Set([
    'tap_action',
    'hold_action',
    'double_tap_action',
    'left_tap_action',
    'left_hold_action',
    'left_double_tap_action',
    'right_tap_action',
    'right_hold_action',
    'right_double_tap_action',
    'inactive_tap_action',
  ]);

  /**
   * Apply entity mappings to a layout configuration
   * Returns a new layout with mapped entities
   */
  applyMappingToLayout(layout: LayoutConfig, mappings: EntityMapping[]): LayoutConfig {
    if (!layout || !layout.rows || mappings.length === 0) {
      return layout;
    }

    // Create mapping lookup for performance
    const mappingMap = new Map<string, string>();
    mappings.forEach(m => mappingMap.set(m.original, m.mapped));

    // Deep clone and map
    const newLayout: LayoutConfig = {
      ...layout,
      rows: layout.rows.map(row => this._mapRow(row, mappingMap)),
    };

    return newLayout;
  }

  /**
   * Apply entity mappings to a single row
   * Returns a new row with mapped entities
   */
  applyMappingToRow(row: CardRow, mappings: EntityMapping[]): CardRow {
    if (!row || mappings.length === 0) {
      return row;
    }

    // Create mapping lookup for performance
    const mappingMap = new Map<string, string>();
    mappings.forEach(m => mappingMap.set(m.original, m.mapped));

    return this._mapRow(row, mappingMap);
  }

  /**
   * Reverse entity mappings (for export)
   * Converts mapped → original
   */
  reverseMappings(mappings: EntityMapping[]): EntityMapping[] {
    return mappings.map(m => ({
      original: m.mapped,
      mapped: m.original,
      domain: m.domain,
    }));
  }

  /**
   * Suggest entities based on fuzzy matching
   * Returns array of entity IDs sorted by match quality
   */
  suggestEntities(originalEntity: string, availableEntities: string[]): string[] {
    if (!originalEntity || availableEntities.length === 0) {
      return [];
    }

    const originalDomain = this._getDomain(originalEntity);
    const originalName = this._getEntityName(originalEntity);

    // Score each entity
    const scored = availableEntities
      .map(entityId => ({
        entityId,
        score: this._calculateMatchScore(originalEntity, originalName, originalDomain, entityId),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Return top 10 matches
    return scored.slice(0, 10).map(item => item.entityId);
  }

  /**
   * Calculate match score between original and candidate entity
   */
  private _calculateMatchScore(
    originalEntity: string,
    originalName: string,
    originalDomain: string,
    candidateEntity: string
  ): number {
    const candidateDomain = this._getDomain(candidateEntity);
    const candidateName = this._getEntityName(candidateEntity);

    let score = 0;

    // Domain match is critical (80 points)
    if (originalDomain === candidateDomain) {
      score += 80;
    } else {
      return 0; // Different domains don't match
    }

    // Exact name match (perfect score)
    if (originalName === candidateName) {
      return 100;
    }

    // Name similarity using Levenshtein distance (up to 20 points)
    const nameDistance = this._levenshteinDistance(originalName, candidateName);
    const maxLength = Math.max(originalName.length, candidateName.length);
    const nameSimilarity = 1 - nameDistance / maxLength;
    score += nameSimilarity * 20;

    return score;
  }

  /**
   * Levenshtein distance algorithm for string similarity
   */
  private _levenshteinDistance(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }
    return costs[s2.length];
  }

  /**
   * Map a row with entity mappings
   */
  private _mapRow(row: CardRow, mappingMap: Map<string, string>): CardRow {
    return {
      ...row,
      columns: row.columns?.map(col => this._mapColumn(col, mappingMap)) || [],
    };
  }

  /**
   * Map a column with entity mappings
   */
  private _mapColumn(column: CardColumn, mappingMap: Map<string, string>): CardColumn {
    return {
      ...column,
      modules: column.modules?.map(mod => this._mapModule(mod, mappingMap)) || [],
    };
  }

  /**
   * Map a module with entity mappings (handles all module types)
   */
  private _mapModule(module: CardModule, mappingMap: Map<string, string>): CardModule {
    if (!module || !module.type) {
      return module;
    }

    let mappedModule: CardModule = module;

    switch (module.type) {
      case 'icon':
        mappedModule = this._mapIconModule(module as IconModule, mappingMap);
        break;
      case 'info':
        mappedModule = this._mapInfoModule(module as InfoModule, mappingMap);
        break;
      case 'bar':
        mappedModule = this._mapBarModule(module as BarModule, mappingMap);
        break;
      case 'camera':
        mappedModule = this._mapCameraModule(module as CameraModule, mappingMap);
        break;
      case 'light':
        mappedModule = this._mapLightModule(module as LightModule, mappingMap);
        break;
      case 'horizontal':
        mappedModule = this._mapHorizontalModule(module as HorizontalModule, mappingMap);
        break;
      case 'vertical':
        mappedModule = this._mapVerticalModule(module as VerticalModule, mappingMap);
        break;
      case 'stack': {
        const sm = module as any;
        mappedModule = {
          ...sm,
          modules: sm.modules?.map((nested: CardModule) =>
            this._mapModule(nested, mappingMap)
          ),
        } as CardModule;
        break;
      }
      case 'map':
        mappedModule = this._mapMapModule(module as MapModule, mappingMap);
        break;
      case 'slider':
        mappedModule = this._mapSliderModule(module as SliderModule, mappingMap);
        break;
      case 'image':
        mappedModule = this._mapImageModule(module as ImageModule, mappingMap);
        break;
      default:
        // Generic entity field mapping
        if ('entity' in module && typeof (module as any).entity === 'string') {
          const entity = (module as any).entity;
          if (mappingMap.has(entity)) {
            const mappedEntity = mappingMap.get(entity) ?? entity;
            mappedModule = { ...module, entity: mappedEntity } as CardModule;
          }
        }
        break;
    }

    // Action configs can carry their own entity references. Remap those too.
    return this._mapActionEntitiesInObject(mappedModule, mappingMap);
  }

  /**
   * Map Icon Module entities
   */
  private _mapIconModule(module: IconModule, mappingMap: Map<string, string>): IconModule {
    return {
      ...module,
      icons: module.icons?.map(icon => ({
        ...icon,
        entity: mappingMap.get(icon.entity) || icon.entity,
      })),
    };
  }

  /**
   * Map Info Module entities
   */
  private _mapInfoModule(module: InfoModule, mappingMap: Map<string, string>): InfoModule {
    return {
      ...module,
      info_entities: module.info_entities?.map(entity => ({
        ...entity,
        entity: mappingMap.get(entity.entity) || entity.entity,
      })),
    };
  }

  /**
   * Map Bar Module entities
   */
  private _mapBarModule(module: BarModule, mappingMap: Map<string, string>): BarModule {
    return {
      ...module,
      entity: mappingMap.get(module.entity) || module.entity,
    };
  }

  /**
   * Map Camera Module entity
   */
  private _mapCameraModule(module: CameraModule, mappingMap: Map<string, string>): CameraModule {
    return {
      ...module,
      entity: mappingMap.get(module.entity) || module.entity,
    };
  }

  /**
   * Map Image Module entities
   */
  private _mapImageModule(module: ImageModule, mappingMap: Map<string, string>): ImageModule {
    const mapped = { ...module };

    // Map entity field (new format)
    if (module.entity) {
      mapped.entity = mappingMap.get(module.entity) || module.entity;
    }

    // Map image_entity field (legacy format)
    if (module.image_entity) {
      mapped.image_entity = mappingMap.get(module.image_entity) || module.image_entity;
    }

    // Map single_entity (action entity)
    if (module.single_entity) {
      mapped.single_entity = mappingMap.get(module.single_entity) || module.single_entity;
    }

    return mapped;
  }

  /**
   * Map Light Module entities (in presets)
   */
  private _mapLightModule(module: LightModule, mappingMap: Map<string, string>): LightModule {
    return {
      ...module,
      presets: module.presets?.map(preset => ({
        ...preset,
        entities: preset.entities?.map(entity => mappingMap.get(entity) || entity) || [],
      })),
    };
  }

  /**
   * Map Horizontal Module nested entities
   */
  private _mapHorizontalModule(
    module: HorizontalModule,
    mappingMap: Map<string, string>
  ): HorizontalModule {
    return {
      ...module,
      modules: module.modules?.map(nested => this._mapModule(nested, mappingMap)),
    };
  }

  /**
   * Map Vertical Module nested entities
   */
  private _mapVerticalModule(
    module: VerticalModule,
    mappingMap: Map<string, string>
  ): VerticalModule {
    return {
      ...module,
      modules: module.modules?.map(nested => this._mapModule(nested, mappingMap)),
    };
  }

  /**
   * Map Map Module entities
   */
  private _mapMapModule(module: MapModule, mappingMap: Map<string, string>): MapModule {
    return {
      ...module,
      markers: module.markers?.map(marker => ({
        ...marker,
        entity: marker.entity ? mappingMap.get(marker.entity) || marker.entity : marker.entity,
      })),
    };
  }

  /**
   * Map Slider Module nested entities (slider is a carousel)
   */
  private _mapSliderModule(module: SliderModule, mappingMap: Map<string, string>): SliderModule {
    return {
      ...module,
      modules: module.modules?.map(nested => this._mapModule(nested, mappingMap)),
    };
  }

  private _mapActionEntitiesInObject<T>(value: T, mappingMap: Map<string, string>): T {
    if (Array.isArray(value)) {
      return value.map(item => this._mapActionEntitiesInObject(item, mappingMap)) as T;
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const record = value as Record<string, unknown>;
    const mappedRecord: Record<string, unknown> = { ...record };

    for (const [key, rawValue] of Object.entries(record)) {
      if (this._actionKeys.has(key) && rawValue && typeof rawValue === 'object') {
        mappedRecord[key] = this._mapActionConfig(rawValue as Record<string, unknown>, mappingMap);
        continue;
      }

      mappedRecord[key] = this._mapActionEntitiesInObject(rawValue as unknown, mappingMap);
    }

    return mappedRecord as T;
  }

  private _mapActionConfig(
    actionConfig: Record<string, unknown>,
    mappingMap: Map<string, string>
  ): Record<string, unknown> {
    const mappedAction: Record<string, unknown> = {
      ...actionConfig,
    };

    if (typeof mappedAction.entity === 'string') {
      mappedAction.entity = mappingMap.get(mappedAction.entity) || mappedAction.entity;
    }

    const target = mappedAction.target;
    if (target && typeof target === 'object' && !Array.isArray(target)) {
      const mappedTarget: Record<string, unknown> = { ...(target as Record<string, unknown>) };
      const entityId = mappedTarget.entity_id;

      if (typeof entityId === 'string') {
        mappedTarget.entity_id = mappingMap.get(entityId) || entityId;
      } else if (Array.isArray(entityId)) {
        mappedTarget.entity_id = entityId.map(id =>
          typeof id === 'string' ? mappingMap.get(id) || id : id
        );
      }

      mappedAction.target = mappedTarget;
    }

    return mappedAction;
  }

  /**
   * Extract domain from entity ID
   */
  private _getDomain(entityId: string): string {
    const parts = entityId.split('.');
    return parts.length > 1 ? parts[0] : '';
  }

  /**
   * Get entity name (without domain)
   */
  private _getEntityName(entityId: string): string {
    const parts = entityId.split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : entityId;
  }
}

// Export singleton instance
export const entityMapper = new UcEntityMapperService();

