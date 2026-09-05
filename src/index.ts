import './public-path';
import './cards/ultra-card';
import './components/navigation-picker';
import './components/ultra-color-picker';
import { CustomCard } from './types';
import { VERSION } from './version';

// Initialize the module registry (manifest-first; no module implementations loaded yet)
import { getModuleRegistry } from './modules';
import { scheduleBackgroundModulePreloads } from './utils/uc-module-preload-scheduler';
import { isLazyEditorEnabled } from './utils/uc-lazy-load-flags';
import { loadUltraCardEditor } from './editor/load-ultra-card-editor';
import {
  UC_ULTRA_CARD_HASS_READY,
  runUltraCardVersionBanner,
} from './utils/uc-pro-banner';

// Editor is lazy-loaded via getConfigElement() unless rollback flag is set.
if (!isLazyEditorEnabled()) {
  void loadUltraCardEditor();
}

const moduleRegistry = getModuleRegistry();
// Default preload is `minimal` so lazy chunks are not burst-loaded at startup.
scheduleBackgroundModulePreloads(moduleRegistry);

const __ucModuleCount = moduleRegistry.getAllModuleMetadata().length;

// One-shot Pro/Free console banner: prefer first hass (event) so we do not print "Free" before integration resolves.
window.addEventListener(UC_ULTRA_CARD_HASS_READY, () =>
  runUltraCardVersionBanner(__ucModuleCount, { requireHass: false })
);
queueMicrotask(() => runUltraCardVersionBanner(__ucModuleCount, { requireHass: true }));
setTimeout(() => runUltraCardVersionBanner(__ucModuleCount, { requireHass: false }), 8000);

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
