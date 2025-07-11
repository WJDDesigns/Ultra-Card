import './cards/ultra-card';
import './editor/ultra-card-editor';
import './components/navigation-picker';
import './components/ultra-color-picker';
import { CustomCard } from './types';
import { VERSION } from './version';

// Initialize the module registry (this registers all core modules)
import { getModuleRegistry } from './modules';
const moduleRegistry = getModuleRegistry();
console.log(
  `🚀 Ultra Card v${VERSION} loaded with ${moduleRegistry.getRegistryStats().totalModules} modules`
);

// Export the template service and module system
export { TemplateService } from './services/template-service';
export * from './modules';

// Initialize customCards array if it doesn't exist
window.customCards = window.customCards || [];

// Add our card to the list (matching Ultra Vehicle Card 2's pattern)
window.customCards.push({
  type: 'ultra-card',
  name: 'Ultra Card',
  description:
    'A modular card system for Home Assistant with dynamic layouts and powerful customization options.',
  preview: true,
  documentationURL: 'https://github.com/WJDDesigns/Ultra-Card',
  version: VERSION,
} as CustomCard);

console.log('✅ Ultra Card registered with Home Assistant card picker');
