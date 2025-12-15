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
export * from './map-module';
export * from './animated-clock-module';
export * from './animated-weather-module';
export * from './animated-forecast-module';
export * from './external-card-module';
export * from './background-module';
export * from './status-summary-module';
export * from './toggle-module';
export * from './calendar-module';
export * from './calendar-module-views';

// Export convenience functions
export { getModuleRegistry } from './module-registry';

// Export new services
export { ucPresetsService } from '../services/uc-presets-service';
export { ucFavoritesService } from '../services/uc-favorites-service';
export { ucExportImportService } from '../services/uc-export-import-service';
