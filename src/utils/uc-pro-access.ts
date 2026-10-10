import { TemplateResult, html } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';

/**
 * Shared Pro-tier helpers for modules.
 *
 * Historically every Pro module re-implemented the same subscription check and
 * the same lock card markup. Centralizing both keeps the gate consistent and
 * means the upgrade UI only has to be restyled in one place.
 */

/** True when the Ultra Card Connect integration reports an active Pro subscription. */
export function hasProAccess(hass: HomeAssistant | undefined | null): boolean {
  if (!hass) return false;
  try {
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    if (
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active'
    ) {
      return true;
    }
    if (ucCloudAuthService.isAuthenticated()) {
      const cloudUser = ucCloudAuthService.getCurrentUser();
      if (cloudUser?.subscription?.tier === 'pro' && cloudUser?.subscription?.status === 'active') {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

const CONNECT_SENSOR = 'sensor.ultra_card_pro_cloud_authentication_status';

/** The page's hass, for helpers whose callers do not pass one. */
function pageHass(): HomeAssistant | undefined {
  try {
    return (document.querySelector('home-assistant') as (Element & { hass?: HomeAssistant }) | null)
      ?.hass;
  } catch {
    return undefined;
  }
}

/**
 * Why Pro is not active, in the user's words, or null when they are simply on
 * the free tier. "Pro shows as not Pro" was the second most common Discord
 * theme, and people blamed card or HA updates when the real cause was Connect
 * being signed out, needing a new sign-in, or unable to reach ultracard.io.
 */
export function connectStatusNote(
  hass: HomeAssistant | undefined | null,
  lang: string
): string | null {
  const h = hass || pageHass();
  if (!h?.states) return null;
  const sensor = h.states[CONNECT_SENSOR];
  if (!sensor) {
    return localize(
      'editor.pro.status_not_installed',
      lang,
      'Already have Pro? Install Ultra Card Connect and sign in to unlock it here.'
    );
  }
  const a = (sensor.attributes || {}) as Record<string, unknown>;
  if (sensor.state === 'unavailable' || sensor.state === 'unknown') {
    return localize(
      'editor.pro.status_unreachable',
      lang,
      "Ultra Card Connect can't reach ultracard.io right now. If you have Pro, it unlocks again when the connection is back."
    );
  }
  if (sensor.state !== 'connected' || !a.authenticated) {
    return a.needs_reauth
      ? localize(
          'editor.pro.status_reauth',
          lang,
          'Ultra Card Connect needs you to sign in again (Settings → Devices & services → Ultra Card Connect).'
        )
      : localize(
          'editor.pro.status_signed_out',
          lang,
          'Already have Pro? Sign in to Ultra Card Connect from the Ultra Card Hub in the sidebar.'
        );
  }
  if (a.subscription_tier === 'pro' && a.subscription_status && a.subscription_status !== 'active') {
    return localize(
      'editor.pro.status_inactive',
      lang,
      'Your Pro subscription is {status}. Renew it on ultracard.io to unlock this.'
    ).replace('{status}', String(a.subscription_status));
  }
  return null;
}

/** Full-width lock card shown instead of a Pro module's General tab. */
export function renderProLockUI(
  lang: string,
  description: string,
  hass?: HomeAssistant | null
): TemplateResult {
  const note = connectStatusNote(hass, lang);
  return html`
    <div
      class="pro-lock-container"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        text-align: center;
        background: var(--secondary-background-color);
        border-radius: 12px;
        margin: 16px;
      "
    >
      <ha-icon
        icon="mdi:lock"
        style="color: var(--primary-color); --mdc-icon-size: 48px; margin-bottom: 16px;"
      ></ha-icon>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
        ${localize('editor.pro.feature_locked', lang, 'Pro Feature')}
      </div>
      <div
        style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 340px; line-height: 1.5;"
      >
        ${description}
      </div>
      ${note
        ? html`<div
            role="status"
            style="font-size: 13px; color: var(--primary-text-color); margin-bottom: 16px; max-width: 340px; line-height: 1.5; padding: 8px 12px; border-radius: 8px; background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);"
          >
            ${note}
          </div>`
        : ''}
      <a
        href="https://ultracard.io/pro"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--primary-color);
          color: var(--text-primary-color, white);
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        "
      >
        <ha-icon icon="mdi:crown" style="--mdc-icon-size: 20px;"></ha-icon>
        ${localize('editor.pro.upgrade_button', lang, 'Upgrade to Pro')}
      </a>
    </div>
  `;
}

/** Compact locked-state placeholder shown in place of a Pro module's preview. */
export function renderProLockedPreview(lang: string, title: string): TemplateResult {
  return html`
    <div
      style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px;
        border-radius: 12px;
        background: var(--secondary-background-color);
        border: 1px dashed var(--divider-color);
      "
    >
      <ha-icon
        icon="mdi:lock"
        style="color: var(--primary-color); --mdc-icon-size: 28px;"
      ></ha-icon>
      <div style="min-width: 0;">
        <div style="font-weight: 700; color: var(--primary-text-color);">${title}</div>
        <div style="font-size: 12px; color: var(--secondary-text-color);">
          ${localize('editor.pro.feature_locked', lang, 'Pro Feature')}
        </div>
      </div>
    </div>
  `;
}
