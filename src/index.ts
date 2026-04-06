import './cards/ultra-card';
import './components/navigation-picker';
import './components/ultra-color-picker';
import './editor/ultra-card-editor';
import { CustomCard } from './types';
import { VERSION } from './version';
import { ucCloudAuthService } from './services/uc-cloud-auth-service';

// Initialize the module registry (manifest-first; no module implementations loaded yet)
import { getModuleRegistry } from './modules';
const moduleRegistry = getModuleRegistry();

// Preload module chunks in the background so they're available by first render.
// Chunks are separate files (not inlined), so this is parallel network I/O, not blocking parse.
Promise.all(
  moduleRegistry.getAllModuleMetadata().map(m => moduleRegistry.ensureModuleLoaded(m.type))
).catch((err) => {
  console.warn('[UltraCard] Module preload failed:', err);
});

// Log version and available module count once on load
const __ucModuleCount = moduleRegistry.getAllModuleMetadata().length;

// Check if user is Pro via integration (wait for cards to initialize)
setTimeout(() => {
  try {
    // Try to find any ultra-card element instance that has hass
    const ultraCards = document.querySelectorAll('ultra-card');
    let integrationUser = null;

    for (const card of Array.from(ultraCards)) {
      const hass = (card as any).hass;
      if (hass) {
        integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);

        // Debug: Check sensor directly
        const sensor = hass.states?.['sensor.ultra_card_pro_cloud_authentication_status'];
        if (sensor) {
          // Sensor found, integration status available
        }

        if (integrationUser) {
          // Integration user found, authentication successful
          break;
        }
      }
    }

    const isPro = integrationUser?.subscription?.tier === 'pro';

    if (isPro) {
      // Pro user via integration - show 4 bubbles
      console.info(
        `%c 🚀 Ultra Card %c v${VERSION} %c ${__ucModuleCount} modules %c ⭐ Pro User `,
        'color: #fff; background:#03a9f4; font-weight:700; padding:3px 8px; border-radius:14px 0 0 14px;',
        'color: #fff; background:#555555; font-weight:700; padding:3px 8px;',
        'color: #fff; background:#2e7d32; font-weight:700; padding:3px 8px;',
        'color: #fff; background:#f59e0b; font-weight:700; padding:3px 10px; border-radius:0 14px 14px 0;'
      );
    } else {
      // Free user or card auth - show 3 bubbles
      console.info(
        `%c 🚀 Ultra Card %c v${VERSION} %c ${__ucModuleCount} modules `,
        'color: #fff; background:#03a9f4; font-weight:700; padding:3px 8px; border-radius:14px 0 0 14px;',
        'color: #fff; background:#555555; font-weight:700; padding:3px 8px;',
        'color: #fff; background:#2e7d32; font-weight:700; padding:3px 10px; border-radius:0 14px 14px 0;'
      );
    }
  } catch (error) {
    console.error('❌ Error checking Pro status:', error);
    // Fallback to basic banner if error
    console.info(
      `%c 🚀 Ultra Card %c v${VERSION} %c ${__ucModuleCount} modules `,
      'color: #fff; background:#03a9f4; font-weight:700; padding:3px 8px; border-radius:14px 0 0 14px;',
      'color: #fff; background:#555555; font-weight:700; padding:3px 8px;',
      'color: #fff; background:#2e7d32; font-weight:700; padding:3px 10px; border-radius:0 14px 14px 0;'
    );
  }
}, 3000); // Wait 3 seconds to allow cards, hass, and integration to fully initialize

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
