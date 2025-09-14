import type { CardModule } from '../types';
import type { BaseUltraModule } from '../modules/base-module';

export interface ModuleDefinition {
  id: string; // unique, e.g., "bar"
  title: string;
  version?: string;
  minSdk?: string;
  factory: () => BaseUltraModule;
}

// Simple in-memory registry (frontend runtime)
const registry: Record<string, ModuleDefinition> = {};

export const registerModule = (def: ModuleDefinition): void => {
  if (!def?.id) throw new Error('Module id is required');
  if (registry[def.id]) {
    // Allow re-register in dev HMR; prefer latest version
    // eslint-disable-next-line no-console
    console.warn(`[UltraCard] Module \"${def.id}\" already registered. Overwriting.`);
  }
  registry[def.id] = def;
};

export const getModuleDefinition = (id: string): ModuleDefinition | undefined => registry[id];

export const listModules = (): ModuleDefinition[] => Object.values(registry);
