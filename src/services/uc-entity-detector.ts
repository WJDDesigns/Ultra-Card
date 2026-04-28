import {
  LayoutConfig,
  CardRow,
  CardColumn,
  CardModule,
  EntityReference,
  IconModule,
  InfoModule,
  BarModule,
  CameraModule,
  LightModule,
  HorizontalModule,
  VerticalModule,
  MapModule,
  MapMarker,
  TextModule,
  SliderModule,
  ImageModule,
  PresetWizardConfig,
} from '../types';

const _UC_DEBUG = !!(window as any).__UC_DEBUG;

/**
 * Service for detecting all entity references within Ultra Card layouts and rows
 * Recursively scans all module types and nested structures
 */
class UcEntityDetectorService {
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
   * If preset wizard maps an entity id to a field, use that label + description as mapper context.
   */
  private _wizardContextForEntity(
    entityId: string,
    wizard?: PresetWizardConfig
  ): string | undefined {
    if (!wizard?.steps?.length) return undefined;
    for (const step of wizard.steps) {
      for (const f of step.fields) {
        if (
          f.type === 'entity' &&
          Array.isArray(f.targetEntityIds) &&
          f.targetEntityIds.includes(entityId)
        ) {
          return `${f.label}: ${f.description}`;
        }
      }
    }
    return undefined;
  }

  /**
   * Scan an entire layout for entity references
   * @param wizard Optional preset wizard — enriches entity mapper context for targetEntityIds
   */
  scanLayout(layout: LayoutConfig, wizard?: PresetWizardConfig): EntityReference[] {
    const references: EntityReference[] = [];

    _UC_DEBUG && console.log('🔍 Entity Detector: Scanning layout:', layout);

    if (!layout || !layout.rows || !Array.isArray(layout.rows)) {
      console.warn('⚠️ Entity Detector: No layout or rows found');
      return [];
    }

    layout.rows.forEach((row, rowIndex) => {
      const rowRefs = this.scanRow(row, `rows[${rowIndex}]`);
      _UC_DEBUG && console.log(`🔍 Entity Detector: Row ${rowIndex} found ${rowRefs.length} entity references`);
      references.push(...rowRefs);
    });

    _UC_DEBUG && console.log(`🔍 Entity Detector: Total entity references found: ${references.length}`);

    if (!wizard?.steps?.length) {
      return references;
    }

    return references.map(ref => {
      if (ref.context) return ref;
      const ctx = this._wizardContextForEntity(ref.entityId, wizard);
      return ctx ? { ...ref, context: ctx } : ref;
    });
  }

  /**
   * Scan a single row for entity references
   */
  scanRow(row: CardRow, basePath = 'row'): EntityReference[] {
    const references: EntityReference[] = [];

    if (!row || !row.columns || !Array.isArray(row.columns)) {
      console.warn('⚠️ Entity Detector: No row or columns found');
      return [];
    }

    row.columns.forEach((column, colIndex) => {
      const colRefs = this._scanColumn(column, `${basePath}.columns[${colIndex}]`);
      if (colRefs.length > 0) {
        _UC_DEBUG && console.log(`🔍 Entity Detector: Column ${colIndex} has ${colRefs.length} entity references`);
      }
      references.push(...colRefs);
    });

    return references;
  }

  /**
   * Scan a column for entity references
   */
  private _scanColumn(column: CardColumn, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (!column || !column.modules || !Array.isArray(column.modules)) {
      return [];
    }

    column.modules.forEach((module, moduleIndex) => {
      const moduleRefs = this._scanModule(module, `${basePath}.modules[${moduleIndex}]`);
      references.push(...moduleRefs);
    });

    return references;
  }

  /**
   * Scan a module for entity references (handles all module types)
   */
  private _scanModule(module: CardModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (!module || !module.type) {
      console.warn('⚠️ Entity Detector: Invalid module:', module);
      return references;
    }
    
    _UC_DEBUG && console.log(`🔍 Entity Detector: Scanning ${module.type} module at ${basePath}`);

    switch (module.type) {
      case 'icon':
        references.push(...this._scanIconModule(module as IconModule, basePath));
        break;
      case 'info':
        references.push(...this._scanInfoModule(module as InfoModule, basePath));
        break;
      case 'bar':
        references.push(...this._scanBarModule(module as BarModule, basePath));
        break;
      case 'camera':
        references.push(...this._scanCameraModule(module as CameraModule, basePath));
        break;
      case 'light':
        references.push(...this._scanLightModule(module as LightModule, basePath));
        break;
      case 'horizontal':
        references.push(...this._scanHorizontalModule(module as HorizontalModule, basePath));
        break;
      case 'vertical':
        references.push(...this._scanVerticalModule(module as VerticalModule, basePath));
        break;
      case 'map':
        references.push(...this._scanMapModule(module as MapModule, basePath));
        break;
      case 'slider':
        references.push(...this._scanSliderModule(module as SliderModule, basePath));
        break;
      case 'text':
        // Text modules don't have entities directly
        break;
      case 'image':
        references.push(...this._scanImageModule(module as ImageModule, basePath));
        break;
      default:
        // Check for generic entity field
        if ('entity' in module && typeof (module as any).entity === 'string') {
          references.push(
            this._createReference((module as any).entity, basePath, module.type, undefined)
          );
        }
    }

    // Include entities nested inside action configs (tap/hold/double/etc).
    references.push(...this._scanActionEntities(module, basePath, module.type));

    return references;
  }

  /**
   * Scan Icon Module for entity references
   */
  private _scanIconModule(module: IconModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.icons && Array.isArray(module.icons)) {
      module.icons.forEach((icon, index) => {
        if (icon.entity) {
          references.push(
            this._createReference(
              icon.entity,
              `${basePath}.icons[${index}].entity`,
              'icon',
              icon.name || undefined
            )
          );
        }
      });
    }

    return references;
  }

  /**
   * Scan Info Module for entity references
   */
  private _scanInfoModule(module: InfoModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.info_entities && Array.isArray(module.info_entities)) {
      module.info_entities.forEach((entity, index) => {
        if (entity.entity) {
          references.push(
            this._createReference(
              entity.entity,
              `${basePath}.info_entities[${index}].entity`,
              'info',
              entity.name || undefined
            )
          );
        }
      });
    }

    return references;
  }

  /**
   * Scan Bar Module for entity references
   */
  private _scanBarModule(module: BarModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.entity) {
      references.push(
        this._createReference(
          module.entity,
          `${basePath}.entity`,
          'bar',
          module.name || undefined
        )
      );
    }

    return references;
  }

  /**
   * Scan Camera Module for entity references
   */
  private _scanCameraModule(module: CameraModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.entity) {
      references.push(
        this._createReference(
          module.entity,
          `${basePath}.entity`,
          'camera',
          module.camera_name || undefined
        )
      );
    }

    return references;
  }

  /**
   * Scan Image Module for entity references
   */
  private _scanImageModule(module: ImageModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    // Check for entity field (new format)
    if (module.entity) {
      references.push(
        this._createReference(
          module.entity,
          `${basePath}.entity`,
          'image',
          module.name || 'Image Entity'
        )
      );
    }

    // Check for image_entity field (legacy format)
    if (module.image_entity) {
      references.push(
        this._createReference(
          module.image_entity,
          `${basePath}.image_entity`,
          'image',
          module.name || 'Image Entity'
        )
      );
    }

    // Check for single_entity (action entity)
    if (module.single_entity) {
      references.push(
        this._createReference(
          module.single_entity,
          `${basePath}.single_entity`,
          'image',
          'Image Action Entity'
        )
      );
    }

    return references;
  }

  /**
   * Scan Light Module for entity references
   */
  private _scanLightModule(module: LightModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.presets && Array.isArray(module.presets)) {
      module.presets.forEach((preset, presetIndex) => {
        if (preset.entities && Array.isArray(preset.entities)) {
          preset.entities.forEach((entity, entityIndex) => {
            references.push(
              this._createReference(
                entity,
                `${basePath}.presets[${presetIndex}].entities[${entityIndex}]`,
                'light',
                `Light Preset: ${preset.name}`
              )
            );
          });
        }
      });
    }

    return references;
  }

  /**
   * Scan Horizontal Module for nested entity references
   */
  private _scanHorizontalModule(module: HorizontalModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.modules && Array.isArray(module.modules)) {
      module.modules.forEach((nestedModule, index) => {
        const nestedRefs = this._scanModule(nestedModule, `${basePath}.modules[${index}]`);
        references.push(...nestedRefs);
      });
    }

    return references;
  }

  /**
   * Scan Vertical Module for nested entity references
   */
  private _scanVerticalModule(module: VerticalModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.modules && Array.isArray(module.modules)) {
      module.modules.forEach((nestedModule, index) => {
        const nestedRefs = this._scanModule(nestedModule, `${basePath}.modules[${index}]`);
        references.push(...nestedRefs);
      });
    }

    return references;
  }

  /**
   * Scan Map Module for entity references
   */
  private _scanMapModule(module: MapModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.markers && Array.isArray(module.markers)) {
      module.markers.forEach((marker, index) => {
        if (marker.entity) {
          references.push(
            this._createReference(
              marker.entity,
              `${basePath}.markers[${index}].entity`,
              'map',
              marker.name || undefined
            )
          );
        }
      });
    }

    return references;
  }

  /**
   * Scan Slider Module for entity references (slider is a carousel, scan nested modules)
   */
  private _scanSliderModule(module: SliderModule, basePath: string): EntityReference[] {
    const references: EntityReference[] = [];

    if (module.modules && Array.isArray(module.modules)) {
      module.modules.forEach((nestedModule, index) => {
        const nestedRefs = this._scanModule(nestedModule, `${basePath}.modules[${index}]`);
        references.push(...nestedRefs);
      });
    }

    return references;
  }

  private _scanActionEntities(
    module: CardModule,
    basePath: string,
    moduleType: string
  ): EntityReference[] {
    const references: EntityReference[] = [];
    const primaryEntity = this._getPrimaryEntity(module);
    this._scanActionEntitiesRecursive(module as unknown, basePath, moduleType, references, primaryEntity);
    return references;
  }

  private _scanActionEntitiesRecursive(
    value: unknown,
    currentPath: string,
    moduleType: string,
    references: EntityReference[],
    primaryEntity?: string
  ): void {
    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        this._scanActionEntitiesRecursive(
          item,
          `${currentPath}[${index}]`,
          moduleType,
          references,
          primaryEntity
        )
      );
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    const record = value as Record<string, unknown>;

    for (const [key, fieldValue] of Object.entries(record)) {
      const fieldPath = `${currentPath}.${key}`;

      // Nested modules are scanned separately by module-specific scanners.
      if (key === 'modules' && Array.isArray(fieldValue)) {
        continue;
      }

      if (this._actionKeys.has(key) && fieldValue && typeof fieldValue === 'object') {
        references.push(
          ...this._extractActionEntityReferences(
            fieldValue as Record<string, unknown>,
            fieldPath,
            moduleType,
            primaryEntity
          )
        );
      }

      this._scanActionEntitiesRecursive(fieldValue, fieldPath, moduleType, references, primaryEntity);
    }
  }

  private _extractActionEntityReferences(
    action: Record<string, unknown>,
    actionPath: string,
    moduleType: string,
    primaryEntity?: string
  ): EntityReference[] {
    const references: EntityReference[] = [];
    const isDefaultAction = action.action === 'default';
    const shouldInheritPrimaryEntity = isDefaultAction && !!primaryEntity;

    if (shouldInheritPrimaryEntity) {
      return references;
    }

    if (typeof action.entity === 'string') {
      references.push(
        this._createReference(action.entity, `${actionPath}.entity`, moduleType, 'Action Entity')
      );
    }

    const target = action.target;
    if (target && typeof target === 'object' && !Array.isArray(target)) {
      const entityId = (target as Record<string, unknown>).entity_id;

      if (typeof entityId === 'string') {
        references.push(
          this._createReference(
            entityId,
            `${actionPath}.target.entity_id`,
            moduleType,
            'Action Target Entity'
          )
        );
      } else if (Array.isArray(entityId)) {
        entityId.forEach((id, index) => {
          if (typeof id === 'string') {
            references.push(
              this._createReference(
                id,
                `${actionPath}.target.entity_id[${index}]`,
                moduleType,
                'Action Target Entity'
              )
            );
          }
        });
      }
    }

    return references;
  }

  private _getPrimaryEntity(module: CardModule): string | undefined {
    if ((module as InfoModule).type === 'info') {
      return (module as InfoModule).info_entities?.find(item => !!item.entity)?.entity;
    }

    const moduleEntity = (module as { entity?: unknown }).entity;
    if (typeof moduleEntity === 'string') {
      return moduleEntity;
    }

    if ((module as ImageModule).type === 'image') {
      const imageModule = module as ImageModule;
      return imageModule.entity || imageModule.image_entity || imageModule.single_entity;
    }

    if ((module as IconModule).type === 'icon') {
      return (module as IconModule).icons?.find(icon => !!icon.entity)?.entity;
    }

    return undefined;
  }

  /**
   * Create an EntityReference object
   */
  private _createReference(
    entityId: string,
    location: string,
    moduleType: string,
    context?: string
  ): EntityReference {
    return {
      entityId,
      locations: [location],
      moduleType,
      context,
    };
  }


  /**
   * Extract domain from entity ID
   */
  getDomain(entityId: string): string {
    const parts = entityId.split('.');
    return parts.length > 1 ? parts[0] : '';
  }

  /**
   * Get entity name (without domain)
   */
  getEntityName(entityId: string): string {
    const parts = entityId.split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : entityId;
  }
}

// Export singleton instance
export const entityDetector = new UcEntityDetectorService();

