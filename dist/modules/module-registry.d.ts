import { UltraModule } from './base-module';
import { CardModule } from '../types';
/** Sync metadata-only view for selector/editor; supports future async implementation loading. */
export type ModuleManifest = import('./module-manifest-data').ModuleManifest;
export declare class ModuleRegistry {
    private static instance;
    /** Loaded module implementations only. */
    private modules;
    /** In-flight lazy loads keyed by module type so concurrent callers share one import. */
    private pendingLoads;
    /** Manifest: type -> metadata. Populated from static manifest; kept in sync when modules are loaded or third-party registered. */
    private manifest;
    /** Category -> type[]. Built from manifest for sync category APIs. */
    private categoryToTypes;
    /** Combined styles cache for loaded modules; invalidated when a module is registered. */
    private _stylesCache;
    /** Core types from static manifest; cannot be unregistered from manifest. */
    private _coreTypes;
    private constructor();
    static getInstance(): ModuleRegistry;
    private _addToCategoryMap;
    private _rebuildCategoryMap;
    registerModule(module: UltraModule): void;
    unregisterModule(type: string): boolean;
    getModule(type: string): UltraModule | undefined;
    /**
     * Sync metadata-only lookup (manifest). Use for selector/editor lists and icons
     * without requiring the full implementation to be loaded.
     */
    getModuleMetadata(type: string): ModuleManifest | undefined;
    /**
     * Ensure the module implementation for type is loaded. Resolves when the module is registered.
     * Real implementation boundary: triggers dynamic import and register.
     */
    ensureModuleLoaded(type: string): Promise<void>;
    getAllModules(): UltraModule[];
    getModulesByCategory(category: string): UltraModule[];
    getCategories(): string[];
    /** Manifest-only: all metadata for selector/editor without loading implementations. */
    getAllModuleMetadata(): ModuleManifest[];
    /** Manifest-only: metadata for a category. */
    getManifestByCategory(category: string): ModuleManifest[];
    /** Manifest-only: search by title, description, tags, type. */
    searchModuleMetadata(query: string): ModuleManifest[];
    searchModules(query: string): UltraModule[];
    createDefaultModule(type: string, id?: string, hass?: any): CardModule | null;
    validateModule(moduleConfig: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getAllModuleStyles(): string;
    isModuleRegistered(type: string): boolean;
    getRegistryStats(): {
        totalModules: number;
        modulesByCategory: Record<string, number>;
        authors: string[];
    };
    private getCommonFormStyles;
}
export declare const getModuleRegistry: () => ModuleRegistry;
export type { UltraModule, ModuleMetadata } from './base-module';
export { BaseUltraModule } from './base-module';
