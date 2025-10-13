import './cards/ultra-card';
import './editor/ultra-card-editor';
import './components/navigation-picker';
import './components/ultra-color-picker';
import { CustomCard } from './types';
import { VERSION } from './version';
import { ucCloudAuthService } from './services/uc-cloud-auth-service';

// Initialize the module registry (this registers all core modules)
import { getModuleRegistry } from './modules';
const moduleRegistry = getModuleRegistry();

// Log version and module count once on load with styled banner (Bubble Card style)
const __ucModuleCount = moduleRegistry.getRegistryStats().totalModules;

// Check if user is Pro via integration (wait for cards to initialize)
setTimeout(() => {
  try {
    // Try to find any ultra-card element instance that has hass
    const ultraCards = document.querySelectorAll('ultra-card');
    let integrationUser = null;
    let hassFound = false;

    for (const card of Array.from(ultraCards)) {
      const hass = (card as any).hass;
      if (hass) {
        hassFound = true;
        integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);

        // Debug: Check sensor directly
        const sensor = hass.states?.['sensor.ultra_card_pro_cloud_authentication_status'];
        if (sensor) {
          console.log('🔍 Integration sensor found:', {
            state: sensor.state,
            tier: sensor.attributes?.subscription_tier,
            authenticated: sensor.attributes?.authenticated,
          });
        }

        if (integrationUser) {
          console.log('🔍 Integration user detected:', {
            tier: integrationUser.subscription?.tier,
            status: integrationUser.subscription?.status,
          });
          break;
        }
      }
    }

    if (!hassFound) {
      console.log('⚠️ No hass found on ultra-card elements yet');
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
