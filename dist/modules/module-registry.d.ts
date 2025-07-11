import { UltraModule, ModuleMetadata } from './base-module';
import { CardModule } from '../types';
export declare class ModuleRegistry {
    private static instance;
    private modules;
    private modulesByCategory;
    private constructor();
    static getInstance(): ModuleRegistry;
    private registerCoreModules;
    registerModule(module: UltraModule): void;
    unregisterModule(type: string): boolean;
    getModule(type: string): UltraModule | undefined;
    getAllModules(): UltraModule[];
    getModulesByCategory(category: string): UltraModule[];
    getCategories(): string[];
    getAllModuleMetadata(): ModuleMetadata[];
    searchModules(query: string): UltraModule[];
    createDefaultModule(type: string, id?: string): CardModule | null;
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
    private updateCategoryMap;
    private updateCategoryMaps;
    private getCommonFormStyles;
}
export declare const getModuleRegistry: () => ModuleRegistry;
export type { UltraModule, ModuleMetadata } from './base-module';
export { BaseUltraModule } from './base-module';
