// Public SDK surface for third-party modules
export { BaseUltraModule } from '../modules/base-module';
export type { ModuleMetadata } from '../modules/base-module';

export { UcPreviewContainer } from '../components/uc-preview-container';
export type { UcAlignment } from '../utils/uc-alignment';
export { ucAlignmentToJustify } from '../utils/uc-alignment';
export { registerModule, getModuleDefinition, listModules } from '../core/module-registry';

// Form and editor helpers can be added here as they’re consolidated
// export { FormUtils } from '../utils/form-utils';
