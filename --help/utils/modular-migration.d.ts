import { UltraVehicleCardConfig, LayoutConfig } from '../types';
/**
 * Migrates old tab-based configuration to new modular layout system
 */
export declare function migrateToModularLayout(config: UltraVehicleCardConfig): LayoutConfig;
/**
 * Migrates new modular layout back to old tab-based configuration for backwards compatibility
 */
export declare function migrateFromModularLayout(layout: LayoutConfig): Partial<UltraVehicleCardConfig>;
/**
 * Utility function to generate unique IDs
 */
export declare function generateUniqueId(): string;
/**
 * Check if config uses the old system and should be migrated
 */
export declare function shouldMigrateToModular(config: UltraVehicleCardConfig): boolean;
/**
 * Auto-migrate configuration if needed
 */
export declare function autoMigrateConfig(config: UltraVehicleCardConfig): UltraVehicleCardConfig;
