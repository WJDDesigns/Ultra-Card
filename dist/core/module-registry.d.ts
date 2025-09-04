import type { BaseUltraModule } from '../modules/base-module';
export interface ModuleDefinition {
    id: string;
    title: string;
    version?: string;
    minSdk?: string;
    factory: () => BaseUltraModule;
}
export declare const registerModule: (def: ModuleDefinition) => void;
export declare const getModuleDefinition: (id: string) => ModuleDefinition | undefined;
export declare const listModules: () => ModuleDefinition[];
