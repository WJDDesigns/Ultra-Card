import { TemplateResult, html, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { AlertCenterModule, CardModule, UltraCardConfig } from '../types';
import type { TapActionConfig } from '../components/ultra-link';
import { localize } from '../localize/localize';
import '../components/ultra-color-picker';

type AlertSeverity = 'critical' | 'warning' | 'info';

interface AlertRow {
  entity_id: string;
  name: string;
  state: string;
  icon: string;
  severity: AlertSeverity;
  changedAt: number;
}

export class UltraAlertCenterModule extends BaseUltraModule {
  handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'alert_center',
    title: 'Alert Center',
    description: 'Monitor and prioritize active Home Assistant alerts in one place',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:alert-decagram-outline',
    category: 'data',
    tags: ['alerts', 'warnings', 'security', 'monitoring', 'safety', 'status'],
  };

  private _includeEntityPickerKey = 0;
  private _hiddenEntityPickerKey = 0;

  createDefault(id?: string): AlertCenterModule {
    return {
      id: id || this.generateId('alert_center'),
      type: 'alert_center',
      title: 'Alert Center',
      show_title: true,
      max_alerts: 6,
      show_all_clear: true,
      show_state: true,
      include_alert_domain: true,
      include_binary_sensors: true,
      include_lock_alerts: true,
      include_alarm_panel_alerts: true,
      include_entities: [],
      hidden_entities: [],
      accent_color: '',
      tile_border_radius: 20,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    return { valid: base.errors.length === 0, errors: base.errors };
  }

  private domainOf(entityId: string): string {
    return entityId.includes('.') ? entityId.split('.')[0] : '';
  }

  private entityShortName(hass: HomeAssistant, entityId: string): string {
    const name = hass.states[entityId]?.attributes?.friendly_name;
    if (typeof name === 'string' && name.trim()) return name.trim();
    const short = entityId.split('.').pop() || entityId;
    return short.replace(/_/g, ' ');
  }

  private isDomainEnabled(domain: string, m: AlertCenterModule): boolean {
    if (domain === 'alert') return m.include_alert_domain !== false;
    if (domain === 'binary_sensor') return m.include_binary_sensors !== false;
    if (domain === 'lock') return m.include_lock_alerts !== false;
    if (domain === 'alarm_control_panel') return m.include_alarm_panel_alerts !== false;
    return false;
  }

  private isAlertActive(
    entityId: string,
    hass: HomeAssistant,
    m: AlertCenterModule,
    forcedInclude: boolean
  ): boolean {
    const st = hass.states[entityId];
    if (!st) return false;
    const domain = this.domainOf(entityId);
    const raw = String(st.state || '').toLowerCase();
    const attrs = (st.attributes || {}) as Record<string, unknown>;
    const deviceClass = String(attrs.device_class || '').toLowerCase();

    if (raw === 'unknown' || raw === 'unavailable' || raw === 'none') return false;

    if (domain === 'alert') {
      if (['on', 'open', 'active', 'triggered', 'detected', 'alarm'].includes(raw)) return true;
      return !['off', 'idle', 'inactive', 'normal', 'clear', 'ok'].includes(raw);
    }

    if (domain === 'alarm_control_panel') {
      return !['disarmed', 'off', 'unknown', 'unavailable'].includes(raw);
    }

    if (domain === 'lock') {
      return ['unlocked', 'jammed', 'open'].includes(raw);
    }

    if (domain === 'binary_sensor') {
      if (raw !== 'on') return false;
      if (forcedInclude) return true;
      const relevant = new Set([
        'smoke',
        'gas',
        'problem',
        'safety',
        'moisture',
        'door',
        'window',
        'opening',
        'garage_door',
        'motion',
        'occupancy',
        'lock',
        'tamper',
        'vibration',
      ]);
      return relevant.has(deviceClass);
    }

    if (forcedInclude) {
      return !['off', 'closed', 'locked', 'idle', 'standby', 'disarmed'].includes(raw);
    }

    return false;
  }

  private severityFor(entityId: string, hass: HomeAssistant): AlertSeverity {
    const st = hass.states[entityId];
    if (!st) return 'info';
    const raw = String(st.state || '').toLowerCase();
    const attrs = (st.attributes || {}) as Record<string, unknown>;
    const deviceClass = String(attrs.device_class || '').toLowerCase();
    const domain = this.domainOf(entityId);

    if (domain === 'alarm_control_panel') return 'critical';
    if (domain === 'lock' && raw === 'jammed') return 'critical';

    const criticalClasses = new Set([
      'smoke',
      'gas',
      'problem',
      'safety',
      'moisture',
      'heat',
      'fire',
      'tamper',
      'carbon_monoxide',
    ]);
    if (criticalClasses.has(deviceClass)) return 'critical';

    if (
      raw.includes('alarm') ||
      raw.includes('triggered') ||
      raw.includes('problem') ||
      raw.includes('unsafe')
    ) {
      return 'critical';
    }

    if (domain === 'lock' || domain === 'binary_sensor') return 'warning';
    return 'info';
  }

  private iconFor(entityId: string, hass: HomeAssistant, severity: AlertSeverity): string {
    const st = hass.states[entityId];
    const attrs = (st?.attributes || {}) as Record<string, unknown>;
    const icon = typeof attrs.icon === 'string' ? attrs.icon : '';
    if (icon) return icon;

    const domain = this.domainOf(entityId);
    if (domain === 'alarm_control_panel') return 'mdi:shield-alert';
    if (domain === 'lock') return 'mdi:lock-alert';
    if (domain === 'alert') return 'mdi:alert-circle';
    if (domain === 'binary_sensor') {
      const dc = String(attrs.device_class || '').toLowerCase();
      if (dc === 'smoke') return 'mdi:smoke-detector-alert';
      if (dc === 'gas' || dc === 'carbon_monoxide') return 'mdi:gas-cylinder';
      if (dc === 'moisture') return 'mdi:water-alert';
      if (dc === 'door' || dc === 'window' || dc === 'opening') return 'mdi:door-open';
      if (dc === 'motion' || dc === 'occupancy') return 'mdi:motion-sensor';
      return 'mdi:alert-circle-outline';
    }
    if (severity === 'critical') return 'mdi:alert-circle';
    if (severity === 'warning') return 'mdi:alert';
    return 'mdi:information-outline';
  }

  private collectAlerts(hass: HomeAssistant, m: AlertCenterModule): AlertRow[] {
    const hidden = new Set((m.hidden_entities || []).map(x => x.trim()).filter(Boolean));
    const manual = (m.include_entities || []).map(x => x.trim()).filter(Boolean);
    const seen = new Set<string>();
    const rows: AlertRow[] = [];

    const pushCandidate = (entityId: string, forcedInclude: boolean): void => {
      if (!entityId || seen.has(entityId) || hidden.has(entityId)) return;
      const st = hass.states[entityId];
      if (!st) return;
      if (!forcedInclude && !this.isDomainEnabled(this.domainOf(entityId), m)) return;
      if (!this.isAlertActive(entityId, hass, m, forcedInclude)) return;

      const severity = this.severityFor(entityId, hass);
      const changed = Date.parse(st.last_changed || st.last_updated || '');

      rows.push({
        entity_id: entityId,
        name: this.entityShortName(hass, entityId),
        state: String(st.state),
        icon: this.iconFor(entityId, hass, severity),
        severity,
        changedAt: Number.isFinite(changed) ? changed : 0,
      });
      seen.add(entityId);
    };

    for (const entityId of Object.keys(hass.states || {})) {
      pushCandidate(entityId, false);
    }
    for (const entityId of manual) {
      pushCandidate(entityId, true);
    }

    const severityRank = (s: AlertSeverity): number => {
      if (s === 'critical') return 0;
      if (s === 'warning') return 1;
      return 2;
    };

    rows.sort((a, b) => {
      const sa = severityRank(a.severity);
      const sb = severityRank(b.severity);
      if (sa !== sb) return sa - sb;
      if (a.changedAt !== b.changedAt) return b.changedAt - a.changedAt;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    const max = Math.max(1, Math.min(30, m.max_alerts ?? 6));
    return rows.slice(0, max);
  }

  private onAlertRowClick(
    ev: Event,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    module: AlertCenterModule,
    entityId: string
  ): void {
    ev.stopPropagation();
    void this.handleModuleAction(
      { action: 'more-info', entity: entityId } as TapActionConfig,
      hass,
      ev.currentTarget as HTMLElement,
      config,
      entityId,
      module
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as AlertCenterModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .uc-ac-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 8px 0 12px 0;
        }
        .uc-ac-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-color);
          color: var(--text-primary-color, #fff);
          border-radius: 16px;
          font-size: 13px;
          max-width: 100%;
          position: relative;
        }
        .uc-ac-chip--hidden { background: var(--error-color); }
        .uc-ac-chip:hover { opacity: 0.95; padding-right: 30px; }
        .uc-ac-chip .uc-ac-chip-remove {
          cursor: pointer;
          font-size: 16px;
          opacity: 0;
          position: absolute;
          right: 8px;
          transition: opacity 0.15s ease;
        }
        .uc-ac-chip:hover .uc-ac-chip-remove { opacity: 1; }
        .uc-ac-chip-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 220px;
        }
      </style>
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.alert_center.section_basic', lang, 'Basic'),
          localize('editor.alert_center.section_basic_desc', lang, 'Core alert center behavior and display settings.'),
          [
            {
              title: localize('editor.alert_center.title', lang, 'Title'),
              description: localize('editor.alert_center.title_desc', lang, 'Header text shown above alerts.'),
              hass,
              data: { title: m.title || '' },
              schema: [{ name: 'title', selector: { text: {} } }],
              onChange: (e: CustomEvent) => {
                updateModule({ title: e.detail.value?.title ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.alert_center.show_title', lang, 'Show title'),
              description: localize('editor.alert_center.show_title_desc', lang, 'Display the alert center header.'),
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_title: e.detail.value?.show_title !== false }),
            },
            {
              title: localize('editor.alert_center.max_alerts', lang, 'Max alerts'),
              description: localize('editor.alert_center.max_alerts_desc', lang, 'Maximum active alerts to show.'),
              hass,
              data: { max_alerts: m.max_alerts ?? 6 },
              schema: [this.numberField('max_alerts', 1, 30, 1)],
              onChange: (e: CustomEvent) =>
                updateModule({ max_alerts: Number(e.detail.value?.max_alerts ?? 6) }),
            },
            {
              title: localize('editor.alert_center.show_state', lang, 'Show state'),
              description: localize('editor.alert_center.show_state_desc', lang, 'Show current entity state on each row.'),
              hass,
              data: { show_state: m.show_state !== false },
              schema: [this.booleanField('show_state')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_state: e.detail.value?.show_state !== false }),
            },
            {
              title: localize('editor.alert_center.show_all_clear', lang, 'Show all clear state'),
              description: localize('editor.alert_center.show_all_clear_desc', lang, 'Show a friendly all-clear message when no alerts are active.'),
              hass,
              data: { show_all_clear: m.show_all_clear !== false },
              schema: [this.booleanField('show_all_clear')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_all_clear: e.detail.value?.show_all_clear !== false }),
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.alert_center.section_sources', lang, 'Auto Sources'),
          localize('editor.alert_center.section_sources_desc', lang, 'Choose domains automatically monitored for active alerts.'),
          [
            {
              title: localize('editor.alert_center.include_alert_domain', lang, 'Alert entities'),
              description: localize('editor.alert_center.include_alert_domain_desc', lang, 'Monitor entities in the alert domain.'),
              hass,
              data: { include_alert_domain: m.include_alert_domain !== false },
              schema: [this.booleanField('include_alert_domain')],
              onChange: (e: CustomEvent) =>
                updateModule({ include_alert_domain: e.detail.value?.include_alert_domain !== false }),
            },
            {
              title: localize('editor.alert_center.include_binary_sensors', lang, 'Binary sensors'),
              description: localize('editor.alert_center.include_binary_sensors_desc', lang, 'Monitor relevant binary sensors (smoke, leak, door, motion, etc).'),
              hass,
              data: { include_binary_sensors: m.include_binary_sensors !== false },
              schema: [this.booleanField('include_binary_sensors')],
              onChange: (e: CustomEvent) =>
                updateModule({ include_binary_sensors: e.detail.value?.include_binary_sensors !== false }),
            },
            {
              title: localize('editor.alert_center.include_lock_alerts', lang, 'Lock alerts'),
              description: localize('editor.alert_center.include_lock_alerts_desc', lang, 'Monitor unlocked/jammed lock states.'),
              hass,
              data: { include_lock_alerts: m.include_lock_alerts !== false },
              schema: [this.booleanField('include_lock_alerts')],
              onChange: (e: CustomEvent) =>
                updateModule({ include_lock_alerts: e.detail.value?.include_lock_alerts !== false }),
            },
            {
              title: localize('editor.alert_center.include_alarm_panel_alerts', lang, 'Alarm panels'),
              description: localize('editor.alert_center.include_alarm_panel_alerts_desc', lang, 'Monitor armed/triggered alarm panel states.'),
              hass,
              data: { include_alarm_panel_alerts: m.include_alarm_panel_alerts !== false },
              schema: [this.booleanField('include_alarm_panel_alerts')],
              onChange: (e: CustomEvent) =>
                updateModule({
                  include_alarm_panel_alerts: e.detail.value?.include_alarm_panel_alerts !== false,
                }),
            },
          ]
        )}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.alert_center.section_style', lang, 'Style')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize('editor.alert_center.section_style_desc', lang, 'Customize alert colors and card radius.')}
          </div>
          <ultra-color-picker
            style="display: block; width: 100%; margin-bottom: 24px;"
            .value=${m.accent_color || ''}
            .defaultValue=${'var(--error-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) => {
              updateModule({ accent_color: e.detail.value });
              this.triggerPreviewUpdate();
            }}
          ></ultra-color-picker>
          <div style="margin-top: 4px;">
            ${this.renderSliderField(
              localize('editor.alert_center.tile_radius', lang, 'Tile border radius'),
              localize('editor.alert_center.tile_radius_desc', lang, 'Adjust corner roundness for the alert center tile.'),
              m.tile_border_radius ?? 20,
              20,
              0,
              48,
              1,
              (v: number) => {
                updateModule({ tile_border_radius: v });
                this.triggerPreviewUpdate();
              },
              'px'
            )}
          </div>
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.alert_center.section_entities', lang, 'Entity Overrides')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize('editor.alert_center.section_entities_desc', lang, 'Manually include or exclude specific entities.')}
          </div>

          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.alert_center.include_entities', lang, 'Always include entities')}
          </div>
          <div class="field-description" style="margin-bottom: 8px;">
            ${localize('editor.alert_center.include_entities_desc', lang, 'These entities are checked for active alert states even outside auto source domains.')}
          </div>
          <div class="uc-ac-chips">
            ${(m.include_entities || []).map(
              id => html`
                <div class="uc-ac-chip" title=${id}>
                  <span class="uc-ac-chip-label">${this.entityShortName(hass, id)}</span>
                  <ha-icon
                    class="uc-ac-chip-remove"
                    icon="mdi:close"
                    @click=${() =>
                      updateModule({
                        include_entities: (m.include_entities || []).filter(x => x !== id),
                      })}
                  ></ha-icon>
                </div>
              `
            )}
          </div>
          ${keyed(
            this._includeEntityPickerKey,
            this.renderFieldSection(
              localize('editor.alert_center.include_add', lang, 'Add included entity'),
              '',
              hass,
              { uc_alert_include_entity: '' },
              [{ name: 'uc_alert_include_entity', selector: { entity: {} } }],
              (e: CustomEvent) => {
                const id = String(e.detail.value?.uc_alert_include_entity ?? '').trim();
                if (!id || (m.include_entities || []).includes(id)) return;
                this._includeEntityPickerKey += 1;
                updateModule({ include_entities: [...(m.include_entities || []), id] });
              }
            )
          )}

          <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--divider-color);">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${localize('editor.alert_center.hidden_entities', lang, 'Hidden entities')}
            </div>
            <div class="field-description" style="margin-bottom: 8px;">
              ${localize('editor.alert_center.hidden_entities_desc', lang, 'Exclude specific entities from Alert Center results.')}
            </div>
            <div class="uc-ac-chips">
              ${(m.hidden_entities || []).map(
                id => html`
                  <div class="uc-ac-chip uc-ac-chip--hidden" title=${id}>
                    <span class="uc-ac-chip-label">${this.entityShortName(hass, id)}</span>
                    <ha-icon
                      class="uc-ac-chip-remove"
                      icon="mdi:close"
                      @click=${() =>
                        updateModule({
                          hidden_entities: (m.hidden_entities || []).filter(x => x !== id),
                        })}
                    ></ha-icon>
                  </div>
                `
              )}
            </div>
            ${keyed(
              this._hiddenEntityPickerKey,
              this.renderFieldSection(
                localize('editor.alert_center.hidden_add', lang, 'Add hidden entity'),
                '',
                hass,
                { uc_alert_hidden_entity: '' },
                [{ name: 'uc_alert_hidden_entity', selector: { entity: {} } }],
                (e: CustomEvent) => {
                  const id = String(e.detail.value?.uc_alert_hidden_entity ?? '').trim();
                  if (!id || (m.hidden_entities || []).includes(id)) return;
                  this._hiddenEntityPickerKey += 1;
                  updateModule({ hidden_entities: [...(m.hidden_entities || []), id] });
                }
              )
            )}
          </div>
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as AlertCenterModule;
    const lang = hass?.locale?.language || 'en';
    const title = (m.title || '').trim() || localize('editor.alert_center.default_title', lang, 'Alert Center');
    const showTitle = m.show_title !== false;
    const showState = m.show_state !== false;
    const showAllClear = m.show_all_clear !== false;
    const accent = (m.accent_color || '').trim() || 'var(--error-color)';
    const radius = Math.max(0, Math.min(48, m.tile_border_radius ?? 20));
    const alerts = this.collectAlerts(hass, m);

    if (!alerts.length && !showAllClear) {
      return this.renderGradientErrorState(
        localize('editor.alert_center.no_alerts', lang, 'No active alerts'),
        localize('editor.alert_center.no_alerts_desc', lang, 'Enable "Show all clear state" to display a calm fallback.'),
        'mdi:check-circle-outline'
      );
    }

    return html`
      ${this.injectModuleStyles()}
      <div class="uc-ac" style="--uc-ac-accent: ${accent}; --uc-ac-radius: ${radius}px;">
        ${showTitle ? html`<div class="uc-ac-title">${title}</div>` : nothing}
        ${alerts.length
          ? html`
              <div class="uc-ac-list">
                ${alerts.map(
                  row => html`
                    <button
                      type="button"
                      class="uc-ac-row is-${row.severity}"
                      @click=${(e: Event) => this.onAlertRowClick(e, hass, config, m, row.entity_id)}
                      title=${hass.states[row.entity_id]?.attributes?.friendly_name || row.entity_id}
                    >
                      <div class="uc-ac-left">
                        <ha-icon icon=${row.icon}></ha-icon>
                        <div class="uc-ac-text">
                          <div class="uc-ac-name">${row.name}</div>
                          ${showState ? html`<div class="uc-ac-state">${row.state}</div>` : nothing}
                        </div>
                      </div>
                      <ha-icon class="uc-ac-chevron" icon="mdi:chevron-right"></ha-icon>
                    </button>
                  `
                )}
              </div>
            `
          : html`
              <div class="uc-ac-clear">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                <div>
                  <div class="uc-ac-clear-title">${localize('editor.alert_center.all_clear', lang, 'All clear')}</div>
                  <div class="uc-ac-clear-sub">
                    ${localize('editor.alert_center.all_clear_desc', lang, 'No active alerts detected.')}
                  </div>
                </div>
              </div>
            `}
      </div>
    `;
  }

  private injectModuleStyles(): TemplateResult {
    return html`<style>
      ${this.getStyles()}
    </style>`;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .uc-ac {
        border-radius: var(--uc-ac-radius, 20px);
        overflow: hidden;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--uc-ac-accent) 7%, var(--card-background-color)),
          var(--card-background-color)
        );
        border: 1px solid color-mix(in srgb, var(--uc-ac-accent) 26%, var(--divider-color));
        padding: 12px;
        box-shadow: 0 8px 22px rgba(0,0,0,0.12);
      }
      .uc-ac-title {
        font-size: 0.98rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: var(--uc-ac-accent);
        margin-bottom: 10px;
      }
      .uc-ac-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .uc-ac-row {
        border: none;
        border-radius: 12px;
        width: 100%;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
        color: var(--primary-text-color);
        text-align: left;
      }
      .uc-ac-row.is-critical {
        background: color-mix(in srgb, var(--error-color) 18%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--error-color) 45%, transparent);
      }
      .uc-ac-row.is-warning {
        background: color-mix(in srgb, #f59e0b 20%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, #f59e0b 45%, transparent);
      }
      .uc-ac-row.is-info {
        background: color-mix(in srgb, var(--primary-color) 16%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color) 35%, transparent);
      }
      .uc-ac-row:hover { transform: translateY(-1px); }
      .uc-ac-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .uc-ac-left ha-icon {
        --mdc-icon-size: 20px;
        color: var(--uc-ac-accent);
        flex-shrink: 0;
      }
      .uc-ac-text { min-width: 0; }
      .uc-ac-name {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-ac-state {
        margin-top: 2px;
        font-size: 0.76rem;
        color: var(--secondary-text-color);
      }
      .uc-ac-chevron {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }
      .uc-ac-clear {
        min-height: 84px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-radius: 12px;
        padding: 10px 12px;
        background: color-mix(in srgb, var(--success-color) 14%, transparent);
      }
      .uc-ac-clear ha-icon {
        --mdc-icon-size: 24px;
        color: var(--success-color);
      }
      .uc-ac-clear-title {
        font-size: 0.92rem;
        font-weight: 700;
      }
      .uc-ac-clear-sub {
        margin-top: 2px;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
      }
    `;
  }
}
