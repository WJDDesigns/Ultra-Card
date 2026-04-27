import { VERSION } from '../version';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';

/** Dispatched once globally when the first `ultra-card` receives `hass` (see `ultra-card.ts`). */
export const UC_ULTRA_CARD_HASS_READY = 'uc-ultra-card-hass-ready';

declare global {
  interface Window {
    __UC_VERSION_BANNER_PRINTED?: boolean | undefined;
  }
}

/**
 * Prints the one-shot Ultra Card console banner (Pro vs Free) after integration auth can be resolved.
 *
 * @param moduleCount — `getAllModuleMetadata().length` from the module registry.
 * @param options.requireHass — When true, skip until at least one `ultra-card` has `hass` (avoids printing Free before hass attaches).
 */
export function runUltraCardVersionBanner(
  moduleCount: number,
  options?: { requireHass?: boolean }
): void {
  if (window.__UC_VERSION_BANNER_PRINTED) {
    return;
  }

  const requireHass = options?.requireHass ?? false;
  const ultraCards = document.querySelectorAll('ultra-card');
  let integrationUser: ReturnType<typeof ucCloudAuthService.checkIntegrationAuth> = null;
  let anyHass = false;

  for (const card of Array.from(ultraCards)) {
    const hass = (card as any).hass;
    if (hass) {
      anyHass = true;
      try {
        integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
      } catch {
        // Treat as unauthenticated; continue scanning other cards
      }
      if (integrationUser) {
        break;
      }
    }
  }

  if (requireHass && !anyHass) {
    return;
  }

  window.__UC_VERSION_BANNER_PRINTED = true;

  try {
    const isPro = integrationUser?.subscription?.tier === 'pro';

    if (isPro) {
      console.info(
        `%c 🚀 Ultra Card %c v${VERSION} %c ${moduleCount} modules %c ⭐ Pro User `,
        'color: #fff; background:#03a9f4; font-weight:700; padding:3px 8px; border-radius:14px 0 0 14px;',
        'color: #fff; background:#555555; font-weight:700; padding:3px 8px;',
        'color: #fff; background:#2e7d32; font-weight:700; padding:3px 8px;',
        'color: #fff; background:#f59e0b; font-weight:700; padding:3px 10px; border-radius:0 14px 14px 0;'
      );
    } else {
      console.info(
        `%c 🚀 Ultra Card %c v${VERSION} %c ${moduleCount} modules `,
        'color: #fff; background:#03a9f4; font-weight:700; padding:3px 8px; border-radius:14px 0 0 14px;',
        'color: #fff; background:#555555; font-weight:700; padding:3px 8px;',
        'color: #fff; background:#2e7d32; font-weight:700; padding:3px 10px; border-radius:0 14px 14px 0;'
      );
    }
  } catch (error) {
    console.error('❌ Error checking Pro status:', error);
    console.info(
      `%c 🚀 Ultra Card %c v${VERSION} %c ${moduleCount} modules `,
      'color: #fff; background:#03a9f4; font-weight:700; padding:3px 8px; border-radius:14px 0 0 14px;',
      'color: #fff; background:#555555; font-weight:700; padding:3px 8px;',
      'color: #fff; background:#2e7d32; font-weight:700; padding:3px 10px; border-radius:0 14px 14px 0;'
    );
  }
}
