import './cards/ultra-card';
import './editor/ultra-card-editor';
import './components/navigation-picker';
import './components/ultra-color-picker';
import { CustomCard } from './types';
import { VERSION } from './version';

// Initialize the module registry (this registers all core modules)
import { getModuleRegistry } from './modules';
const moduleRegistry = getModuleRegistry();

// Log version and module count once on load with styled banner (Bubble Card style)
const __ucModuleCount = moduleRegistry.getRegistryStats().totalModules;
console.info(
  `%c 🚀 Ultra Card %c v${VERSION} %c ${__ucModuleCount} modules `,
  'color: #fff; background:#03a9f4; font-weight:700; padding:3px 8px; border-radius:14px 0 0 14px;',
  'color: #fff; background:#555555; font-weight:700; padding:3px 8px; border-radius:0 14px 14px 0; margin-right:6px;',
  'color: #fff; background:#2e7d32; font-weight:700; padding:3px 10px; border-radius:14px;'
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
