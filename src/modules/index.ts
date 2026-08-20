// Lightweight module system exports: registry and manifest-only APIs.
// Importing from here does not pull in individual module implementations; they load on demand via ensureModuleLoaded().
export * from './base-module';
export * from './module-registry';
export { getModuleRegistry } from './module-registry';
export {
  CORE_MANIFESTS,
  MODULE_CATEGORIES,
  isProModule,
} from './module-manifest-data';
export type { ModuleManifest, ModuleCategoryMeta } from './module-manifest-data';
export { UltraStackModule } from './stack-module';

// Export new services (used by editor/card)
export { ucPresetsService } from '../services/uc-presets-service';
export { ucFavoritesService } from '../services/uc-favorites-service';
export { ucExportImportService } from '../services/uc-export-import-service';
