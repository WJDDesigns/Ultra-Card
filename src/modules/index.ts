// Export the module system components
export * from './base-module';
export * from './module-registry';

// Export individual modules
export * from './text-module';
export * from './separator-module';
export * from './image-module';
export * from './info-module';
export * from './bar-module';
export * from './gauge-module';
export * from './icon-module';
export * from './button-module';
export * from './spinbox-module';
export * from './markdown-module';
export * from './horizontal-module';
export * from './vertical-module';
export * from './camera-module';
export * from './graphs-module';
export * from './dropdown-module';
export * from './light-module';

// Export convenience functions
export { getModuleRegistry } from './module-registry';

// Export new services
export { ucPresetsService } from '../services/uc-presets-service';
export { ucFavoritesService } from '../services/uc-favorites-service';
export { ucExportImportService } from '../services/uc-export-import-service';
