import { UltraCardConfig, CardModule, CardRow, CardColumn } from '../types';
import { getModuleRegistry } from '../modules/module-registry';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  correctedConfig?: UltraCardConfig;
}

export interface ModuleValidationResult {
  valid: boolean;
  errors: string[];
  correctedModule?: CardModule;
}

export class ConfigValidationService {
  private static instance: ConfigValidationService;

  static getInstance(): ConfigValidationService {
    if (!ConfigValidationService.instance) {
      ConfigValidationService.instance = new ConfigValidationService();
    }
    return ConfigValidationService.instance;
  }

  /**
   * Validates and corrects a complete Ultra Card config
   */
  validateAndCorrectConfig(config: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Create a working copy
    let correctedConfig: UltraCardConfig;

    try {
      correctedConfig = JSON.parse(JSON.stringify(config));
    } catch (e) {
      return {
        valid: false,
        errors: ['Invalid JSON structure'],
        warnings: [],
      };
    }

    // Validate basic structure
    if (!correctedConfig.type) {
      correctedConfig.type = 'custom:ultra-card';
      warnings.push('Added missing card type');
    }

    if (correctedConfig.type !== 'custom:ultra-card') {
      errors.push(`Invalid card type: ${correctedConfig.type}`);
    }

    // Ensure layout exists
    if (!correctedConfig.layout) {
      correctedConfig.layout = { rows: [] };
      warnings.push('Added missing layout structure');
    }

    if (!correctedConfig.layout.rows) {
      correctedConfig.layout.rows = [];
      warnings.push('Added missing rows array');
    }

    // Validate and correct each row
    correctedConfig.layout.rows = correctedConfig.layout.rows.map((row, rowIndex) => {
      const rowResult = this.validateAndCorrectRow(row, rowIndex);
      errors.push(...rowResult.errors);
      warnings.push(...rowResult.warnings);
      return rowResult.correctedRow;
    });

    // Remove any rows that couldn't be corrected
    correctedConfig.layout.rows = correctedConfig.layout.rows.filter(row => row !== null);

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      correctedConfig,
    };

    // Suppress console logs in production; return results to caller UI only

    return result;
  }

  /**
   * Validates and corrects a single row
   */
  private validateAndCorrectRow(
    row: any,
    rowIndex: number
  ): {
    correctedRow: CardRow;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Ensure row has required properties
    if (!row.id) {
      row.id = `row-${Date.now()}-${rowIndex}`;
      warnings.push(`Row ${rowIndex}: Added missing ID`);
    }

    if (!row.columns || !Array.isArray(row.columns)) {
      row.columns = [
        {
          id: `col-${Date.now()}-0`,
          modules: [],
        },
      ];
      warnings.push(`Row ${rowIndex}: Added missing columns array`);
    }

    // Validate and correct each column
    row.columns = row.columns
      .map((column: any, columnIndex: number) => {
        const columnResult = this.validateAndCorrectColumn(column, rowIndex, columnIndex);
        errors.push(...columnResult.errors);
        warnings.push(...columnResult.warnings);
        return columnResult.correctedColumn;
      })
      .filter((column: any) => column !== null);

    // Ensure at least one column exists
    if (row.columns.length === 0) {
      row.columns = [
        {
          id: `col-${Date.now()}-fallback`,
          modules: [],
        },
      ];
      warnings.push(`Row ${rowIndex}: Added fallback column`);
    }

    return {
      correctedRow: row as CardRow,
      errors,
      warnings,
    };
  }

  /**
   * Validates and corrects a single column
   */
  private validateAndCorrectColumn(
    column: any,
    rowIndex: number,
    columnIndex: number
  ): {
    correctedColumn: CardColumn;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Ensure column has required properties
    if (!column.id) {
      column.id = `col-${Date.now()}-${rowIndex}-${columnIndex}`;
      warnings.push(`Row ${rowIndex}, Column ${columnIndex}: Added missing ID`);
    }

    if (!column.modules || !Array.isArray(column.modules)) {
      column.modules = [];
      warnings.push(`Row ${rowIndex}, Column ${columnIndex}: Added missing modules array`);
    }

    // Validate and correct each module
    column.modules = column.modules
      .map((module: any, moduleIndex: number) => {
        const moduleResult = this.validateAndCorrectModule(
          module,
          rowIndex,
          columnIndex,
          moduleIndex
        );
        if (moduleResult.valid) {
          if (moduleResult.correctedModule) {
            warnings.push(...(moduleResult.warnings || []));
            return moduleResult.correctedModule;
          }
          return module;
        } else {
          errors.push(...moduleResult.errors);
          return null; // Mark for removal
        }
      })
      .filter((module: any) => module !== null);

    return {
      correctedColumn: column as CardColumn,
      errors,
      warnings,
    };
  }

  /**
   * Validates and corrects a single module
   */
  validateAndCorrectModule(
    module: any,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): ModuleValidationResult & { warnings?: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const registry = getModuleRegistry();

    // Ensure module has required properties
    if (!module.id) {
      module.id = `${module.type || 'unknown'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      warnings.push(`Module: Added missing ID`);
    }

    if (!module.type) {
      errors.push(`Module ${module.id}: Missing type`);
      return { valid: false, errors, warnings };
    }

    // Check if module type is registered
    if (!registry.isModuleRegistered(module.type)) {
      errors.push(`Module ${module.id}: Unknown module type "${module.type}"`);
      return { valid: false, errors, warnings };
    }

    // Get the module handler and validate
    const moduleHandler = registry.getModule(module.type);
    if (moduleHandler) {
      const validationResult = moduleHandler.validate(module);
      if (!validationResult.valid) {
        errors.push(...validationResult.errors.map(err => `Module ${module.id}: ${err}`));
        return { valid: false, errors, warnings };
      }

      // If module is valid, ensure it has all required default properties
      const defaultModule = moduleHandler.createDefault(module.id);

      const correctedModule = this.mergeWithDefaults(module, defaultModule);

      return {
        valid: true,
        errors: [],
        warnings,
        correctedModule,
      };
    }

    return {
      valid: false,
      errors: [`Module ${module.id}: No handler found for type "${module.type}"`],
      warnings,
    };
  }

  /**
   * Merges a module with its defaults to ensure all properties are present
   */
  private mergeWithDefaults(module: any, defaultModule: CardModule): CardModule {
    // Deep merge while preserving existing values
    const merged = { ...defaultModule } as any;

    Object.keys(module).forEach(key => {
      if (module[key] !== undefined && module[key] !== null) {
        if (
          typeof module[key] === 'object' &&
          !Array.isArray(module[key]) &&
          typeof (defaultModule as any)[key] === 'object'
        ) {
          // Deep merge objects
          merged[key] = {
            ...(defaultModule as any)[key],
            ...module[key],
          };
        } else {
          // Direct assignment for primitives, arrays, etc.
          merged[key] = module[key];
        }
      }
    });

    return merged as CardModule;
  }

  /**
   * Counts total modules in a config (useful for logging)
   */
  private countTotalModules(config: UltraCardConfig): number {
    return config.layout.rows.reduce((total, row) => {
      return (
        total +
        row.columns.reduce((rowTotal, column) => {
          return rowTotal + column.modules.length;
        }, 0)
      );
    }, 0);
  }

  /**
   * Validates that module IDs are unique across the entire config
   */
  validateUniqueModuleIds(config: UltraCardConfig): { valid: boolean; duplicates: string[] } {
    const moduleIds = new Set<string>();
    const duplicates: string[] = [];

    for (const row of config.layout.rows) {
      for (const column of row.columns) {
        for (const module of column.modules) {
          if (moduleIds.has(module.id)) {
            duplicates.push(module.id);
          } else {
            moduleIds.add(module.id);
          }
        }
      }
    }

    return {
      valid: duplicates.length === 0,
      duplicates,
    };
  }

  /**
   * Fixes duplicate module IDs by generating new ones
   */
  fixDuplicateModuleIds(config: UltraCardConfig): UltraCardConfig {
    const usedIds = new Set<string>();
    const correctedConfig = JSON.parse(JSON.stringify(config));

    for (const row of correctedConfig.layout.rows) {
      for (const column of row.columns) {
        for (const module of column.modules) {
          if (usedIds.has(module.id)) {
            // Generate new unique ID
            let newId = `${module.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            while (usedIds.has(newId)) {
              newId = `${module.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            // silent correction
            module.id = newId;
          }
          usedIds.add(module.id);
        }
      }
    }

    return correctedConfig;
  }
}

// Export singleton instance
export const configValidationService = ConfigValidationService.getInstance();
