/**
 * Setup wizard — one-click enable for disabled UniFi entities + bandwidth guidance.
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UnifiModule } from '../../types';
import type { UnifiCapabilityReport } from '../../services/uc-unifi-service';
import { ucUnifiService } from '../../services/uc-unifi-service';
import { localize } from '../../localize/localize';

export interface WizardHandlers {
  onDismiss: () => void;
  onEnabled: () => void;
  triggerPreviewUpdate: () => void;
}

const progressByModule = new Map<string, { done: number; total: number; running: boolean }>();
const capsByModule = new Map<string, UnifiCapabilityReport | null>();
const capsLoading = new Set<string>();

export function ensureCapabilityReport(
  moduleId: string,
  hass: HomeAssistant,
  onReady: () => void
): UnifiCapabilityReport | null {
  if (capsByModule.has(moduleId)) return capsByModule.get(moduleId) || null;
  if (capsLoading.has(moduleId)) return null;
  capsLoading.add(moduleId);
  ucUnifiService
    .getCapabilityReport(hass)
    .then(report => {
      capsByModule.set(moduleId, report);
      capsLoading.delete(moduleId);
      onReady();
    })
    .catch(() => {
      capsLoading.delete(moduleId);
      capsByModule.set(moduleId, null);
      onReady();
    });
  return null;
}

export function invalidateCapabilityReport(moduleId: string): void {
  capsByModule.delete(moduleId);
  capsLoading.delete(moduleId);
}

export function renderSetupWizard(
  module: UnifiModule,
  hass: HomeAssistant,
  report: UnifiCapabilityReport | null,
  handlers: WizardHandlers
): TemplateResult | typeof nothing {
  if (module.setup_dismissed) return nothing;
  const lang = hass?.locale?.language || 'en';

  if (!report) {
    return html`
      <div class="uc-unifi-wizard">
        <h3>
          <ha-icon icon="mdi:lan-check" style="--mdc-icon-size:18px;"></ha-icon>
          ${localize('editor.unifi.wizard_loading', lang, 'Checking UniFi setup…')}
        </h3>
      </div>
    `;
  }

  const needsDevices = !report.hasDevices;
  const needsEnable = report.disabledEntityIds.length > 0;
  const needsBandwidthOption = report.bandwidthOptionMissing;
  const viewTip = report.tipsByView[module.view || 'rack'];

  if (!needsDevices && !needsEnable && !needsBandwidthOption && !viewTip) {
    return nothing;
  }

  const isAdmin = ucUnifiService.isAdmin(hass);
  const progress = progressByModule.get(module.id);

  const badge = (label: string, status: string) => {
    const cls = status === 'enabled' ? 'ok' : status === 'disabled' ? 'warn' : 'bad';
    return html`<span class="uc-unifi-badge ${cls}">${label}: ${status}</span>`;
  };

  const runEnable = async () => {
    if (!isAdmin || progress?.running) return;
    const ids = report.disabledEntityIds;
    progressByModule.set(module.id, { done: 0, total: ids.length, running: true });
    handlers.triggerPreviewUpdate();
    await ucUnifiService.enableEntities(hass, ids, (done, total) => {
      progressByModule.set(module.id, { done, total, running: true });
      handlers.triggerPreviewUpdate();
    });
    progressByModule.set(module.id, { done: ids.length, total: ids.length, running: false });
    invalidateCapabilityReport(module.id);
    handlers.onEnabled();
    handlers.triggerPreviewUpdate();
  };

  return html`
    <div class="uc-unifi-wizard">
      <h3>
        <ha-icon icon="mdi:wizard-hat" style="--mdc-icon-size:18px;"></ha-icon>
        ${localize('editor.unifi.wizard_title', lang, 'UniFi setup')}
      </h3>

      <div class="uc-unifi-badges">
        ${badge('Devices', report.hasDevices ? 'enabled' : 'absent')}
        ${badge('Port bandwidth', report.portBandwidth)}
        ${badge('Link speed', report.portLinkSpeed)}
        ${badge('PoE', report.portPoe)}
        ${badge('WAN latency', report.wanLatency)}
      </div>

      ${needsDevices
        ? html`
            <p>
              ${localize(
                'editor.unifi.wizard_no_devices',
                lang,
                'No Ubiquiti UniFi devices were found. Install the official UniFi Network integration, then reload this card.'
              )}
              <a href="https://www.home-assistant.io/integrations/unifi/" target="_blank" rel="noopener"
                >home-assistant.io/integrations/unifi</a
              >
            </p>
          `
        : nothing}

      ${needsEnable
        ? html`
            <p>
              ${localize(
                'editor.unifi.wizard_disabled',
                lang,
                '{count} useful UniFi sensors are disabled (port RX/TX, link speed, PoE, etc.). Enable them for live port lights and traffic.'
              ).replace('{count}', String(report.disabledEntityIds.length))}
            </p>
            <div class="uc-unifi-wizard-actions">
              ${isAdmin
                ? html`
                    <button
                      class="uc-unifi-btn"
                      type="button"
                      ?disabled=${!!progress?.running}
                      @click=${runEnable}
                    >
                      ${progress?.running
                        ? localize('editor.unifi.wizard_enabling', lang, 'Enabling…')
                        : localize('editor.unifi.wizard_enable', lang, 'Enable sensors')}
                    </button>
                  `
                : html`
                    <p style="margin:0;font-size:12px;">
                      ${localize(
                        'editor.unifi.wizard_admin_required',
                        lang,
                        'Ask a Home Assistant admin to enable these entities, or sign in as an admin to use one-click setup.'
                      )}
                    </p>
                  `}
            </div>
            ${progress
              ? html`
                  <div class="uc-unifi-progress" style="--pct: ${(progress.total ? (progress.done / progress.total) * 100 : 0)}%;">
                    <i></i>
                  </div>
                `
              : nothing}
          `
        : nothing}

      ${needsBandwidthOption
        ? html`
            <p>
              ${localize(
                'editor.unifi.wizard_bandwidth_option',
                lang,
                'Port bandwidth sensors are missing entirely. In Settings → Devices & services → UniFi Network → Configure → More options, enable “Bandwidth usage sensors for network clients”, then come back and enable the new sensors.'
              )}
            </p>
            <div class="uc-unifi-wizard-actions">
              <a class="uc-unifi-btn secondary" href="/config/integrations/integration/unifi" style="text-decoration:none;">
                ${localize('editor.unifi.wizard_open_integration', lang, 'Open UniFi integration')}
              </a>
            </div>
          `
        : nothing}

      ${viewTip && !needsDevices
        ? html`<p style="margin-top:8px;">${viewTip}</p>`
        : nothing}

      <div class="uc-unifi-wizard-actions" style="margin-top:10px;">
        <button class="uc-unifi-btn linkish" type="button" @click=${handlers.onDismiss}>
          ${localize('editor.unifi.wizard_dismiss', lang, 'Dismiss')}
        </button>
      </div>
    </div>
  `;
}
