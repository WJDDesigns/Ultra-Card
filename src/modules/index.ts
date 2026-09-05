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
// Note: no module implementation or editor-side service is re-exported here.
// `src/index.ts` does `export * from './modules'`, so anything listed in this
// file lands in ultra-card.js for every dashboard load. Import services
// (presets, favorites, export/import) directly from `../services/...` instead.
