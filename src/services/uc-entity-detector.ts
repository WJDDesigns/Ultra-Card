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
} from '../types';

/**
 * Service for detecting all entity references within Ultra Card layouts and rows
 * Recursively scans all module types and nested structures
 */
class UcEntityDetectorService {
  /**
   * Scan an entire layout for entity references
   */
  scanLayout(layout: LayoutConfig): EntityReference[] {
    const references: EntityReference[] = [];
    
    console.log('🔍 Entity Detector: Scanning layout:', layout);

    if (!layout || !layout.rows || !Array.isArray(layout.rows)) {
      console.warn('⚠️ Entity Detector: No layout or rows found');
      return [];
    }

    layout.rows.forEach((row, rowIndex) => {
      const rowRefs = this.scanRow(row, `rows[${rowIndex}]`);
      console.log(`🔍 Entity Detector: Row ${rowIndex} found ${rowRefs.length} entity references`);
      references.push(...rowRefs);
    });

    console.log(`🔍 Entity Detector: Total entity references found: ${references.length}`);
    return references;
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
        console.log(`🔍 Entity Detector: Column ${colIndex} has ${colRefs.length} entity references`);
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
    
    console.log(`🔍 Entity Detector: Scanning ${module.type} module at ${basePath}`);

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

