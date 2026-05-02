import { TemplateResult, html, nothing, svg } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { SolarAnalyticsModule as SolarAnalyticsModuleConfig, CardModule, UltraCardConfig } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseWatts(hass: HomeAssistant, entityId: string | undefined): number | null {
  if (!entityId) return null;
  const s = hass?.states?.[entityId];
  if (!s) return null;
  const v = parseFloat(s.state);
  if (isNaN(v)) return null;
  const unit = (s.attributes?.unit_of_measurement as string | undefined) ?? '';
  return unit.toUpperCase().includes('KW') ? v * 1000 : v;
}

function parseKwh(hass: HomeAssistant, entityId: string | undefined): number | null {
  if (!entityId) return null;
  const s = hass?.states?.[entityId];
  if (!s) return null;
  const v = parseFloat(s.state);
  if (isNaN(v)) return null;
  const unit = (s.attributes?.unit_of_measurement as string | undefined) ?? '';
  return unit.toUpperCase().includes('WH') && !unit.toUpperCase().includes('KWH')
    ? v / 1000
    : v;
}

function parsePercent(hass: HomeAssistant, entityId: string | undefined): number | null {
  if (!entityId) return null;
  const s = hass?.states?.[entityId];
  if (!s) return null;
  const v = parseFloat(s.state);
  return isNaN(v) ? null : Math.min(100, Math.max(0, v));
}

function fmtPower(w: number | null): string {
  if (w === null) return '—';
  const abs = Math.abs(w);
  if (abs >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${Math.round(w)} W`;
}

function fmtKwh(kwh: number | null): string {
  if (kwh === null) return '—';
  return `${kwh.toFixed(2)} kWh`;
}

/** SVG ring gauge — radius 40, strokeWidth 8 */
function ringGauge(percent: number, color: string, trackColor: string): TemplateResult {
  const r = 40;
  const sw = 8;
  const circ = 2 * Math.PI * r;
  const fill = (percent / 100) * circ;
  return svg`
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="${r}" stroke="${trackColor}" stroke-width="${sw}" fill="none"/>
      <circle cx="50" cy="50" r="${r}"
        stroke="${color}"
        stroke-width="${sw}"
        stroke-linecap="round"
        fill="none"
        stroke-dasharray="${circ}"
        stroke-dashoffset="${circ - fill}"
        transform="rotate(-90 50 50)"
        style="transition: stroke-dashoffset 0.6s ease;"
      />
    </svg>
  `;
}

/**
 * Solar Analytics Pro Module
 *
 * Glanceable live solar power, grid balance, battery state of charge,
 * and daily energy totals in full and compact layouts.
 */
export class UltraSolarAnalyticsModule extends BaseUltraModule {
  override handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'solar_analytics',
    title: 'Solar Analytics',
    description: 'Live solar power, grid balance, battery state, and daily energy totals in one glanceable widget',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:solar-power-variant',
    category: 'data',
    tags: ['solar', 'energy', 'analytics', 'grid', 'battery', 'power', 'pro', 'premium'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): SolarAnalyticsModuleConfig {
    return {
      id: id || this.generateId('solar_analytics'),
      type: 'solar_analytics',
      solar_entity: '',
      grid_entity: '',
      battery_entity: '',
      home_entity: '',
      solar_energy_entity: '',
      grid_import_entity: '',
      grid_export_entity: '',
      layout: 'full',
      show_battery: true,
      show_grid: true,
      show_self_sufficiency: true,
      show_today_totals: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as SolarAnalyticsModuleConfig;
    if (!module.id) errors.push('Module ID is required');
    if (!m.solar_entity?.trim()) errors.push(localize('editor.solar_analytics.error_solar', 'en', 'Select a solar power sensor'));
    return { valid: errors.length === 0, errors };
  }

  // ── Editor ────────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as SolarAnalyticsModuleConfig;
    const lang = hass?.locale?.language || 'en';

    const entityRow = (
      key: keyof SolarAnalyticsModuleConfig,
      label: string,
      desc: string,
      domains?: string[]
    ) => html`
      <div style="margin-bottom: 12px;">
        ${this.renderEntityPickerWithVariables(
          hass, config, key as string, (m[key] as string) || '',
          (value: string) => {
            updateModule({ [key]: value } as Partial<CardModule>);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          },
          domains,
          label
        )}
        <div style="font-size:0.78rem; color:var(--secondary-text-color); margin-top:3px; padding-left:2px;">${desc}</div>
      </div>
    `;

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">

        ${this.renderSettingsSection(
          localize('editor.solar_analytics.live_section', lang, 'Live Power Sensors'),
          localize('editor.solar_analytics.live_desc', lang, 'Sensors reporting current power in W or kW.'),
          []
        )}
        ${entityRow('solar_entity', localize('editor.solar_analytics.solar_entity', lang, 'Solar power (W/kW)'), localize('editor.solar_analytics.solar_entity_desc', lang, 'Current solar panel output'), ['sensor'])}
        ${entityRow('grid_entity',  localize('editor.solar_analytics.grid_entity',  lang, 'Grid power (W/kW)'),  localize('editor.solar_analytics.grid_entity_desc',  lang, 'Positive = importing, negative = exporting'), ['sensor'])}
        ${entityRow('home_entity',  localize('editor.solar_analytics.home_entity',  lang, 'Home consumption (W/kW)'), localize('editor.solar_analytics.home_entity_desc', lang, 'Total home load'), ['sensor'])}
        ${entityRow('battery_entity', localize('editor.solar_analytics.battery_entity', lang, 'Battery SoC (%)'), localize('editor.solar_analytics.battery_entity_desc', lang, 'State of charge percentage'), ['sensor'])}

        ${this.renderSettingsSection(
          localize('editor.solar_analytics.energy_section', lang, "Today's Energy Sensors"),
          localize('editor.solar_analytics.energy_desc', lang, 'Sensors accumulating today\'s totals in kWh (optional).'),
          []
        )}
        ${entityRow('solar_energy_entity',  localize('editor.solar_analytics.solar_energy_entity',  lang, 'Solar today (kWh)'), localize('editor.solar_analytics.solar_energy_entity_desc', lang, 'Daily solar production'), ['sensor'])}
        ${entityRow('grid_import_entity',   localize('editor.solar_analytics.grid_import_entity',   lang, 'Grid import today (kWh)'), localize('editor.solar_analytics.grid_import_entity_desc', lang, 'Energy pulled from grid today'), ['sensor'])}
        ${entityRow('grid_export_entity',   localize('editor.solar_analytics.grid_export_entity',   lang, 'Grid export today (kWh)'), localize('editor.solar_analytics.grid_export_entity_desc', lang, 'Energy sent to grid today'), ['sensor'])}

        ${this.renderSettingsSection(
          localize('editor.solar_analytics.display_section', lang, 'Display'),
          localize('editor.solar_analytics.display_desc', lang, 'Choose what to show.'),
          [
            {
              title: localize('editor.solar_analytics.show_battery', lang, 'Show battery'),
              description: localize('editor.solar_analytics.show_battery_desc', lang, 'Battery SoC ring and value'),
              hass,
              data: { show_battery: m.show_battery !== false },
              schema: [this.booleanField('show_battery')],
              onChange: (e: CustomEvent) => updateModule({ show_battery: e.detail.value?.show_battery ?? true }),
            },
            {
              title: localize('editor.solar_analytics.show_grid', lang, 'Show grid'),
              description: localize('editor.solar_analytics.show_grid_desc', lang, 'Grid import/export power'),
              hass,
              data: { show_grid: m.show_grid !== false },
              schema: [this.booleanField('show_grid')],
              onChange: (e: CustomEvent) => updateModule({ show_grid: e.detail.value?.show_grid ?? true }),
            },
            {
              title: localize('editor.solar_analytics.show_self_sufficiency', lang, 'Show self-sufficiency'),
              description: localize('editor.solar_analytics.show_self_sufficiency_desc', lang, 'Percentage of home load met by solar'),
              hass,
              data: { show_self_sufficiency: m.show_self_sufficiency !== false },
              schema: [this.booleanField('show_self_sufficiency')],
              onChange: (e: CustomEvent) => updateModule({ show_self_sufficiency: e.detail.value?.show_self_sufficiency ?? true }),
            },
            {
              title: localize('editor.solar_analytics.show_today_totals', lang, "Show today's totals"),
              description: localize('editor.solar_analytics.show_today_totals_desc', lang, 'Daily kWh summary row'),
              hass,
              data: { show_today_totals: m.show_today_totals !== false },
              schema: [this.booleanField('show_today_totals')],
              onChange: (e: CustomEvent) => updateModule({ show_today_totals: e.detail.value?.show_today_totals ?? true }),
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.solar_analytics.layout_section', lang, 'Layout'),
          '',
          [
            {
              title: localize('editor.solar_analytics.layout', lang, 'Layout'),
              description: localize('editor.solar_analytics.layout_desc', lang, 'Full includes all gauges; compact shows a single row'),
              hass,
              data: { layout: m.layout || 'full' },
              schema: [this.selectField('layout', [
                { value: 'full',    label: localize('editor.solar_analytics.layout_full',    lang, 'Full') },
                { value: 'compact', label: localize('editor.solar_analytics.layout_compact', lang, 'Compact') },
              ])],
              onChange: (e: CustomEvent) => {
                updateModule({ layout: e.detail.value?.layout || 'full' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

      </div>
    `;
  }

  // ── renderPreview ─────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _ctx?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as SolarAnalyticsModuleConfig;
    const lang = hass?.locale?.language || 'en';

    const solarEntityId = this.resolveEntity(m.solar_entity, config) || m.solar_entity;

    if (!solarEntityId || !hass?.states?.[solarEntityId]) {
      return html`
        <style>${this.getStyles()}</style>
        <div class="uc-solar-wrapper">
          ${this.renderGradientErrorState(
            localize('editor.solar_analytics.config_needed', lang, 'Select a solar sensor'),
            localize('editor.solar_analytics.config_needed_desc', lang, 'Choose a solar power sensor in the General tab'),
            'mdi:solar-power-variant'
          )}
        </div>
      `;
    }

    const gridEntityId    = this.resolveEntity(m.grid_entity,    config) || m.grid_entity;
    const battEntityId    = this.resolveEntity(m.battery_entity, config) || m.battery_entity;
    const homeEntityId    = this.resolveEntity(m.home_entity,    config) || m.home_entity;
    const solarKwhId      = this.resolveEntity(m.solar_energy_entity, config) || m.solar_energy_entity;
    const gridImportId    = this.resolveEntity(m.grid_import_entity,  config) || m.grid_import_entity;
    const gridExportId    = this.resolveEntity(m.grid_export_entity,  config) || m.grid_export_entity;

    // ── Live values ──────────────────────────────────────────────────────────
    const solarW  = parseWatts(hass, solarEntityId)  ?? 0;
    const gridW   = parseWatts(hass, gridEntityId);
    const homeW   = parseWatts(hass, homeEntityId);
    const battPct = parsePercent(hass, battEntityId);

    // ── Today's totals ───────────────────────────────────────────────────────
    const solarKwh     = parseKwh(hass, solarKwhId);
    const gridImportKwh = parseKwh(hass, gridImportId);
    const gridExportKwh = parseKwh(hass, gridExportId);

    // ── Self-sufficiency ─────────────────────────────────────────────────────
    // = (solar - grid_export) / home_consumption × 100
    // Fallback: solar / (solar + grid_import) × 100
    let selfSuffPct: number | null = null;
    if (solarKwh !== null && gridExportKwh !== null && gridImportKwh !== null) {
      const solarUsed = solarKwh - gridExportKwh;
      const total     = solarUsed + gridImportKwh;
      selfSuffPct = total > 0 ? Math.min(100, Math.round((solarUsed / total) * 100)) : 0;
    } else if (solarW > 0 && gridW !== null) {
      const importing = Math.max(0, gridW);
      const total     = solarW + importing;
      selfSuffPct = total > 0 ? Math.min(100, Math.round((solarW / total) * 100)) : 0;
    }

    const isExporting = gridW !== null && gridW < 0;
    const gridLabel   = gridW === null
      ? '—'
      : gridW < 0
        ? `${localize('editor.solar_analytics.exporting', lang, 'Exporting')} ${fmtPower(-gridW)}`
        : `${localize('editor.solar_analytics.importing', lang, 'Importing')} ${fmtPower(gridW)}`;

    const gridColor = isExporting ? '#22c55e' : '#f59e0b';

    const styleStr = (() => {
      const styles = this.buildDesignStyles(module, hass);
      return Object.entries(styles)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
        .join('; ');
    })();
    const hoverClass = this.getHoverEffectClass(module);
    const layout = m.layout || 'full';

    // ── COMPACT layout ───────────────────────────────────────────────────────
    if (layout === 'compact') {
      return html`
        <style>${this.getStyles()}</style>
        <div class="uc-solar-wrapper ${hoverClass}"
          style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 16px; overflow: hidden; ${styleStr}">
          ${this.wrapWithAnimation(html`
            <div class="uc-solar uc-solar--compact">
              <div class="uc-solar-compact__kpi">
                <ha-icon icon="mdi:solar-power-variant" style="--mdc-icon-size:22px; color:#f59e0b;"></ha-icon>
                <span class="uc-solar-compact__val">${fmtPower(solarW)}</span>
                <span class="uc-solar-compact__label">${localize('editor.solar_analytics.solar', lang, 'Solar')}</span>
              </div>
              ${m.show_grid !== false && gridW !== null ? html`
                <div class="uc-solar-compact__sep"></div>
                <div class="uc-solar-compact__kpi">
                  <ha-icon icon="${isExporting ? 'mdi:transmission-tower-export' : 'mdi:transmission-tower-import'}"
                    style="--mdc-icon-size:22px; color:${gridColor};"></ha-icon>
                  <span class="uc-solar-compact__val" style="color:${gridColor}">${fmtPower(Math.abs(gridW))}</span>
                  <span class="uc-solar-compact__label">${isExporting ? localize('editor.solar_analytics.exporting', lang, 'Export') : localize('editor.solar_analytics.importing', lang, 'Import')}</span>
                </div>
              ` : nothing}
              ${m.show_battery !== false && battPct !== null ? html`
                <div class="uc-solar-compact__sep"></div>
                <div class="uc-solar-compact__kpi">
                  <ha-icon icon="${battPct > 70 ? 'mdi:battery-high' : battPct > 30 ? 'mdi:battery-medium' : 'mdi:battery-low'}"
                    style="--mdc-icon-size:22px; color:#22c55e;"></ha-icon>
                  <span class="uc-solar-compact__val">${battPct}%</span>
                  <span class="uc-solar-compact__label">${localize('editor.solar_analytics.battery', lang, 'Battery')}</span>
                </div>
              ` : nothing}
            </div>
          `, module, hass)}
        </div>
      `;
    }

    // ── FULL layout ──────────────────────────────────────────────────────────
    return html`
      <style>${this.getStyles()}</style>
      <div class="uc-solar-wrapper ${hoverClass}"
        style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 20px; overflow: hidden; ${styleStr}">
        ${this.wrapWithAnimation(html`
          <div class="uc-solar uc-solar--full">

            <!-- Header -->
            <div class="uc-solar__header">
              <ha-icon icon="mdi:solar-power-variant" style="--mdc-icon-size:20px; color:#f59e0b;"></ha-icon>
              <span class="uc-solar__header-title">
                ${localize('editor.solar_analytics.header', lang, 'Solar Overview')}
              </span>
            </div>

            <!-- Live KPI gauges row -->
            <div class="uc-solar__gauges">

              <!-- Solar gauge -->
              <div class="uc-solar-gauge">
                <div class="uc-solar-gauge__ring">
                  ${ringGauge(
                    homeW ? Math.min(100, Math.round((solarW / Math.max(solarW, homeW)) * 100)) : 100,
                    '#f59e0b',
                    'color-mix(in srgb, #f59e0b 12%, var(--card-background-color, var(--ha-card-background)))'
                  )}
                  <div class="uc-solar-gauge__center">
                    <ha-icon icon="mdi:white-balance-sunny" style="--mdc-icon-size:20px; color:#f59e0b;"></ha-icon>
                  </div>
                </div>
                <div class="uc-solar-gauge__val">${fmtPower(solarW)}</div>
                <div class="uc-solar-gauge__label">${localize('editor.solar_analytics.solar', lang, 'Solar')}</div>
              </div>

              <!-- Self-sufficiency ring (centre) -->
              ${m.show_self_sufficiency !== false && selfSuffPct !== null ? html`
                <div class="uc-solar-gauge uc-solar-gauge--center">
                  <div class="uc-solar-gauge__ring uc-solar-gauge__ring--lg">
                    ${ringGauge(
                      selfSuffPct,
                      '#8b5cf6',
                      'color-mix(in srgb, #8b5cf6 12%, var(--card-background-color, var(--ha-card-background)))'
                    )}
                    <div class="uc-solar-gauge__center">
                      <span class="uc-solar-gauge__center-pct">${selfSuffPct}%</span>
                      <span class="uc-solar-gauge__center-sub">${localize('editor.solar_analytics.self', lang, 'Self')}</span>
                    </div>
                  </div>
                  <div class="uc-solar-gauge__label">${localize('editor.solar_analytics.self_sufficiency', lang, 'Self-Sufficiency')}</div>
                </div>
              ` : nothing}

              <!-- Battery gauge -->
              ${m.show_battery !== false && battPct !== null ? html`
                <div class="uc-solar-gauge">
                  <div class="uc-solar-gauge__ring">
                    ${ringGauge(
                      battPct,
                      '#22c55e',
                      'color-mix(in srgb, #22c55e 12%, var(--card-background-color, var(--ha-card-background)))'
                    )}
                    <div class="uc-solar-gauge__center">
                      <ha-icon icon="mdi:battery" style="--mdc-icon-size:20px; color:#22c55e;"></ha-icon>
                    </div>
                  </div>
                  <div class="uc-solar-gauge__val">${battPct}%</div>
                  <div class="uc-solar-gauge__label">${localize('editor.solar_analytics.battery', lang, 'Battery')}</div>
                </div>
              ` : nothing}
            </div>

            <!-- Grid status bar -->
            ${m.show_grid !== false && gridW !== null ? html`
              <div class="uc-solar__grid-bar" style="--grid-color:${gridColor}">
                <ha-icon icon="${isExporting ? 'mdi:transmission-tower-export' : 'mdi:transmission-tower-import'}"
                  style="--mdc-icon-size:18px; color:${gridColor};"></ha-icon>
                <span class="uc-solar__grid-label">${gridLabel}</span>
                ${homeW ? html`
                  <span class="uc-solar__grid-home">
                    <ha-icon icon="mdi:home-lightning-bolt-outline" style="--mdc-icon-size:15px; color:var(--secondary-text-color);"></ha-icon>
                    ${fmtPower(homeW)}
                  </span>
                ` : nothing}
              </div>
            ` : nothing}

            <!-- Today's energy totals -->
            ${m.show_today_totals !== false && (solarKwh !== null || gridImportKwh !== null || gridExportKwh !== null) ? html`
              <div class="uc-solar__divider"></div>
              <div class="uc-solar__totals">
                <div class="uc-solar__totals-title">
                  ${localize('editor.solar_analytics.today', lang, "Today")}
                </div>
                <div class="uc-solar__totals-row">
                  ${solarKwh !== null ? html`
                    <div class="uc-solar__total-item">
                      <ha-icon icon="mdi:solar-power" style="--mdc-icon-size:16px; color:#f59e0b;"></ha-icon>
                      <span>${fmtKwh(solarKwh)}</span>
                      <span class="uc-solar__total-sub">${localize('editor.solar_analytics.produced', lang, 'Produced')}</span>
                    </div>
                  ` : nothing}
                  ${gridImportKwh !== null ? html`
                    <div class="uc-solar__total-item">
                      <ha-icon icon="mdi:transmission-tower-import" style="--mdc-icon-size:16px; color:#f59e0b;"></ha-icon>
                      <span>${fmtKwh(gridImportKwh)}</span>
                      <span class="uc-solar__total-sub">${localize('editor.solar_analytics.imported', lang, 'Imported')}</span>
                    </div>
                  ` : nothing}
                  ${gridExportKwh !== null ? html`
                    <div class="uc-solar__total-item">
                      <ha-icon icon="mdi:transmission-tower-export" style="--mdc-icon-size:16px; color:#22c55e;"></ha-icon>
                      <span style="color:#22c55e">${fmtKwh(gridExportKwh)}</span>
                      <span class="uc-solar__total-sub">${localize('editor.solar_analytics.exported', lang, 'Exported')}</span>
                    </div>
                  ` : nothing}
                </div>
              </div>
            ` : nothing}

          </div>
        `, module, hass)}
      </div>
    `;
  }

  // ── CSS ───────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      .uc-solar-wrapper { box-sizing: border-box; }
      .uc-solar { box-sizing: border-box; color: var(--primary-text-color); }

      /* ═══ FULL ═══════════════════════════════════════════════════════ */
      .uc-solar--full {
        padding: 18px 18px 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      /* Header */
      .uc-solar__header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .uc-solar__header-title {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }

      /* Gauge row */
      .uc-solar__gauges {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 8px;
      }
      .uc-solar-gauge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex: 1;
      }
      .uc-solar-gauge--center { flex: 1.5; }
      .uc-solar-gauge__ring {
        position: relative;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .uc-solar-gauge__ring--lg {
        width: 100px;
        height: 100px;
      }
      .uc-solar-gauge__ring svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .uc-solar-gauge__center {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
      }
      .uc-solar-gauge__center-pct {
        font-size: 1.25rem;
        font-weight: 800;
        color: #8b5cf6;
        line-height: 1;
      }
      .uc-solar-gauge__center-sub {
        font-size: 0.6rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--secondary-text-color);
      }
      .uc-solar-gauge__val {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .uc-solar-gauge__label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      /* Grid status bar */
      .uc-solar__grid-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--grid-color) 8%, var(--card-background-color, var(--ha-card-background)));
        border: 1px solid color-mix(in srgb, var(--grid-color) 25%, transparent);
      }
      .uc-solar__grid-label {
        flex: 1;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .uc-solar__grid-home {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        font-weight: 600;
      }

      /* Divider */
      .uc-solar__divider {
        height: 1px;
        background: color-mix(in srgb, var(--divider-color) 50%, transparent);
        margin: 0 -2px;
      }

      /* Today's totals */
      .uc-solar__totals { display: flex; flex-direction: column; gap: 8px; }
      .uc-solar__totals-title {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .uc-solar__totals-row { display: flex; gap: 6px; flex-wrap: wrap; }
      .uc-solar__total-item {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 10px 6px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--divider-color) 6%, var(--card-background-color, var(--ha-card-background)));
        border: 1px solid color-mix(in srgb, var(--divider-color) 30%, transparent);
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--primary-text-color);
        min-width: 80px;
      }
      .uc-solar__total-sub {
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
      }

      /* ═══ COMPACT ════════════════════════════════════════════════════ */
      .uc-solar--compact { padding: 14px 16px; }
      .uc-solar-compact__kpi {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        flex: 1;
      }
      /* Override: compact is a row of KPIs */
      .uc-solar--compact {
        display: flex;
        align-items: stretch;
        justify-content: space-around;
        gap: 4px;
      }
      .uc-solar-compact__val {
        font-size: 1rem;
        font-weight: 800;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .uc-solar-compact__label {
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .uc-solar-compact__sep {
        width: 1px;
        background: color-mix(in srgb, var(--divider-color) 50%, transparent);
        align-self: stretch;
        margin: 4px 0;
      }
    `;
  }
}
