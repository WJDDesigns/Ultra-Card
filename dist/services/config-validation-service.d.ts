import { UltraCardConfig, CardModule } from '../types';
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
export declare class ConfigValidationService {
    private static instance;
    static getInstance(): ConfigValidationService;
    /**
     * Validates and corrects a complete Ultra Card config
     */
    validateAndCorrectConfig(config: any): ValidationResult;
    /**
     * Validates and corrects a single row
     */
    private validateAndCorrectRow;
    /**
     * Validates and corrects a single column
     */
    private validateAndCorrectColumn;
    /**
     * Validates and corrects a single module
     */
    validateAndCorrectModule(module: any, rowIndex?: number, columnIndex?: number, moduleIndex?: number): ModuleValidationResult & {
        warnings?: string[];
    };
    /**
     * Merges a module with its defaults to ensure all properties are present
     */
    private mergeWithDefaults;
    /**
     * Counts total modules in a config (useful for logging)
     */
    private countTotalModules;
    /**
     * Validates that module IDs are unique across the entire config
     */
    validateUniqueModuleIds(config: UltraCardConfig): {
        valid: boolean;
        duplicates: string[];
    };
    /**
     * Fixes duplicate module IDs by generating new ones
     */
    fixDuplicateModuleIds(config: UltraCardConfig): UltraCardConfig;
    /**
     * Migrate flat design structures to responsive format.
     * Converts old `design: { color: '...', ... }` format to include a `base` key
     * while PRESERVING root-level properties for backwards compatibility.
     * This ensures both `design.border_radius` AND `design.base.border_radius` work.
     */
    private _migrateDesignToResponsive;
}
export declare const configValidationService: ConfigValidationService;
