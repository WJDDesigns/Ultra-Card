import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, BatteryFleetModule, BatteryFleetEntity } from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import {
  ucHistoryService,
  type HistoryStatePoint,
  type NumericPoint,
} from '../services/uc-history-service';
import {
  analyze,
  describeEta,
  discoverDevices,
  formatRatePerDay,
  groupByArea,
  historyEntityIds,
  isActionable,
  isProblem,
  listAreaOptions,
  needsAttributes,
  sortAnalyses,
  summarize,
  type BatteryAnalysis,
  type BatteryDevice,
  type EtaDescriptor,
  type FleetSummary,
} from '../services/uc-battery-fleet-service';
import '../components/ultra-chip-list';
import '../components/ultra-segmented';
import '../components/ultra-icon-field';
import '../components/ultra-color-picker';

/** Event the editor listens for so the preview can write back into the config. */
const PATCH_EVENT = 'uc-module-patch-by-id';

/** Battery history barely moves; a long TTL keeps the recorder query rare. */
const HISTORY_TTL_MS = 10 * 60 * 1000;

interface FleetColors {
  critical: string;
  low: string;
  ok: string;
  charging: string;
  text: string;
  secondary: string;
  bg: string;
}

/**
 * Battery Fleet (Pro).
 *
 * Where the free Battery Monitor module answers "what is the level right now",
 * this one answers "which battery dies next". It measures each device's real
 * discharge rate from recorder history and ranks the fleet by how soon it will
 * need attention.
 *
 * Discovery, drain analysis and ranking all live in
 * `src/services/uc-battery-fleet-service.ts`; this file is presentation only.
 */
export class UltraBatteryFleetModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'battery_fleet',
    title: 'Battery Fleet',
    description: 'Ranked battery health with drain-rate analysis and replacement predictions',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:battery-heart-variant',
    category: 'data',
    tags: [
      'pro',
      'premium',
      'battery',
      'fleet',
      'prediction',
      'maintenance',
      'devices',
      'forecast',
    ],
  };

  /** Expanded manual rows in the editor, keyed by row id (globally unique). */
  private _expandedRows = new Set<string>();

  /** Last discovered entity ids per module id, so the host card can watch them. */
  private _discovered = new Map<string, string[]>();

  // ── Defaults ────────────────────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): BatteryFleetModule {
    return {
      id: id || this.generateId('battery_fleet'),
      type: 'battery_fleet',

      discovery_mode: 'auto',
      entities: [],
      exclude_patterns: [],
      hidden_entities: [],
      include_battery_level_attribute: true,
      include_binary_sensors: false,
      area_filter: [],

      history_days: 14,
      predict_replacement: true,
      replacement_floor: 5,
      min_confidence_hours: 12,

      title: '',
      show_title: true,
      layout: 'table',
      sort_mode: 'urgency',
      max_items: 25,
      group_by_area: false,
      show_summary_bar: true,
      show_sparkline: true,
      show_drain_rate: true,
      show_eta: true,
      show_charging_indicator: true,
      show_only_problems: false,

      critical_threshold: 10,
      low_threshold: 25,
      urgent_days: 14,

      critical_color: '',
      low_color: '',
      ok_color: '',
      charging_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',

      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const errors = [...base.errors];
    const m = module as BatteryFleetModule;
    const lang = 'en';

    if (m.discovery_mode === 'manual' && (!m.entities || m.entities.length === 0)) {
      errors.push(
        localize(
          'editor.battery_fleet.error_manual_empty',
          lang,
          'Add at least one battery entity, or switch discovery to Auto or Both.'
        )
      );
    }

    if (
      typeof m.critical_threshold === 'number' &&
      typeof m.low_threshold === 'number' &&
      m.critical_threshold > m.low_threshold
    ) {
      errors.push(
        localize(
          'editor.battery_fleet.error_thresholds',
          lang,
          'The critical threshold must be lower than the low threshold.'
        )
      );
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Auto-discovered batteries never appear in the module config, so the host
   * card wouldn't otherwise re-render when their state changes. Report whatever
   * the last preview pass found.
   */
  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as BatteryFleetModule;
    const ids = new Set<string>(this._discovered.get(m.id) || []);
    for (const row of m.entities || []) {
      if (row?.entity) ids.add(row.entity);
    }
    return [...ids];
  }

  // ── General tab ─────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as BatteryFleetModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.battery_fleet.pro_description',
          lang,
          'Battery Fleet reads recorder history to measure how fast every battery in your home is draining, then ranks them by how soon they need replacing.'
        )
      );
    }

    const mode = m.discovery_mode || 'auto';
    const showAuto = mode !== 'manual';
    const showManual = mode !== 'auto';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderDevicesSection(m, hass, config, updateModule, lang, showAuto, showManual)}
        ${this._renderPredictionSection(m, hass, updateModule, lang)}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderThresholdsSection(m, hass, updateModule, lang)}
        ${this._renderColorsSection(m, hass, updateModule, lang)}
      </div>
    `;
  }

  // ── General tab: Devices ────────────────────────────────────────────────────

  private _renderDevicesSection(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    showAuto: boolean,
    showManual: boolean
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.battery_fleet.devices_section', lang, 'Devices')}
        </div>
        <div class="uc-bf-section-desc">
          ${localize(
            'editor.battery_fleet.devices_section_desc',
            lang,
            'Auto-discovery finds every battery in Home Assistant with no configuration. Switch to Manual to curate the list yourself.'
          )}
        </div>

        ${this.renderSegmentedField(
          localize('editor.battery_fleet.discovery_mode', lang, 'Discovery'),
          localize(
            'editor.battery_fleet.discovery_mode_desc',
            lang,
            'Auto scans Home Assistant, Manual uses only the list below, Both merges them.'
          ),
          m.discovery_mode || 'auto',
          [
            {
              value: 'auto',
              label: localize('editor.battery_fleet.mode_auto', lang, 'Auto'),
              icon: 'mdi:auto-fix',
            },
            {
              value: 'manual',
              label: localize('editor.battery_fleet.mode_manual', lang, 'Manual'),
              icon: 'mdi:format-list-bulleted',
            },
            {
              value: 'both',
              label: localize('editor.battery_fleet.mode_both', lang, 'Both'),
              icon: 'mdi:set-merge',
            },
          ],
          (next: string) => {
            updateModule({
              discovery_mode: (next || 'auto') as BatteryFleetModule['discovery_mode'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
        ${showAuto ? this._renderDiscoveryPreview(m, hass, lang) : nothing}
        ${showAuto ? this._renderAutoOptions(m, hass, updateModule, lang) : nothing}
        ${showManual ? this._renderManualRows(m, hass, config, updateModule, lang) : nothing}
      </div>
    `;
  }

  /** Live "Found N batteries" panel so the user can see auto-discovery working. */
  private _renderDiscoveryPreview(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    lang: string
  ): TemplateResult {
    let devices: BatteryDevice[] = [];
    try {
      devices = discoverDevices(hass, m);
    } catch {
      devices = [];
    }
    const auto = devices.filter(d => d.source !== 'manual');
    const shown = auto.slice(0, 8);
    const remaining = auto.length - shown.length;

    if (auto.length === 0) {
      return html`
        <div class="uc-bf-panel uc-bf-panel--empty">
          <div class="uc-bf-panel-head">
            <ha-icon icon="mdi:battery-off-outline"></ha-icon>
            <span
              >${localize(
                'editor.battery_fleet.found_none',
                lang,
                'No batteries discovered yet'
              )}</span
            >
          </div>
          <div class="uc-bf-panel-body">
            ${localize(
              'editor.battery_fleet.found_none_desc',
              lang,
              'Nothing matched. Try turning on battery_level attributes or battery binary sensors below, relax your exclude patterns, or add entities manually.'
            )}
          </div>
        </div>
      `;
    }

    return html`
      <div class="uc-bf-panel">
        <div class="uc-bf-panel-head">
          <ha-icon icon="mdi:battery-heart-variant"></ha-icon>
          <span
            >${localize(
              'editor.battery_fleet.found_count',
              lang,
              'Found {count} batteries'
            ).replace('{count}', String(auto.length))}</span
          >
        </div>
        <div class="uc-bf-preview-chips">
          ${shown.map(
            d => html`
              <span class="uc-bf-preview-chip" title="${d.entityId}">
                <ha-icon icon="${d.icon}"></ha-icon>
                <span class="uc-bf-preview-chip-name">${d.name}</span>
                <span class="uc-bf-preview-chip-pct"
                  >${d.level === null ? '—' : `${Math.round(d.level)}%`}</span
                >
              </span>
            `
          )}
          ${remaining > 0
            ? html`<span class="uc-bf-preview-more"
                >${localize('editor.battery_fleet.found_more', lang, '+{count} more').replace(
                  '{count}',
                  String(remaining)
                )}</span
              >`
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderAutoOptions(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const areaOptions = listAreaOptions(hass);
    const hiddenCount = (m.hidden_entities || []).length;

    return html`
      ${this.renderSettingsSection('', '', [
        {
          title: localize(
            'editor.battery_fleet.include_attribute',
            lang,
            'Include battery_level attributes'
          ),
          description: localize(
            'editor.battery_fleet.include_attribute_desc',
            lang,
            'Picks up vacuums, phones, trackers and other devices that report their battery as an attribute instead of a sensor.'
          ),
          hass,
          data: { include_battery_level_attribute: m.include_battery_level_attribute !== false },
          schema: [this.booleanField('include_battery_level_attribute')],
          onChange: (e: CustomEvent) => {
            updateModule({
              include_battery_level_attribute:
                e.detail.value?.include_battery_level_attribute !== false,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
        },
        {
          title: localize(
            'editor.battery_fleet.include_binary',
            lang,
            'Include battery binary sensors'
          ),
          description: localize(
            'editor.battery_fleet.include_binary_desc',
            lang,
            'Devices that only report "low" or "OK". They show as 0% or 100% and cannot be predicted.'
          ),
          hass,
          data: { include_binary_sensors: m.include_binary_sensors === true },
          schema: [this.booleanField('include_binary_sensors')],
          onChange: (e: CustomEvent) => {
            updateModule({
              include_binary_sensors: e.detail.value?.include_binary_sensors === true,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
        },
      ])}
      ${this.renderChipListField(
        localize('editor.battery_fleet.exclude_patterns', lang, 'Exclude patterns'),
        localize(
          'editor.battery_fleet.exclude_patterns_desc',
          lang,
          'Any battery whose entity id or name contains one of these words is skipped. Case-insensitive.'
        ),
        hass,
        m.exclude_patterns || [],
        (next: string[]) => {
          updateModule({
            exclude_patterns: next.map(v => v.trim().toLowerCase()).filter(Boolean),
          } as Partial<CardModule>);
          this.triggerPreviewUpdate();
        },
        {
          mode: 'free-text',
          variant: 'exclude',
          placeholder: localize(
            'editor.battery_fleet.exclude_placeholder',
            lang,
            'e.g. test, spare, backup'
          ),
        }
      )}
      ${areaOptions.length > 0
        ? this.renderChipListField(
            localize('editor.battery_fleet.area_filter', lang, 'Limit to areas'),
            localize(
              'editor.battery_fleet.area_filter_desc',
              lang,
              'Leave empty to include every area. Devices with no area are excluded once a filter is set.'
            ),
            hass,
            (m.area_filter || []).slice(),
            (next: string[]) => {
              updateModule({ area_filter: next } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
            {
              mode: 'select',
              selectOptions: areaOptions,
              selectAddLabel: localize('editor.battery_fleet.area_add', lang, 'Add area'),
            }
          )
        : nothing}
      ${this.renderChipListField(
        localize('editor.battery_fleet.hidden_entities', lang, 'Dismissed devices'),
        hiddenCount > 0
          ? localize(
              'editor.battery_fleet.hidden_entities_desc',
              lang,
              '{count} device(s) dismissed from the card. Remove a chip to bring one back.'
            ).replace('{count}', String(hiddenCount))
          : localize(
              'editor.battery_fleet.hidden_entities_empty',
              lang,
              'Nothing dismissed. Use the × on a row in the live preview to hide a device.'
            ),
        hass,
        m.hidden_entities || [],
        (next: string[]) => {
          updateModule({ hidden_entities: next } as Partial<CardModule>);
          this.triggerPreviewUpdate();
        },
        { mode: 'entity', variant: 'exclude' }
      )}
      ${hiddenCount > 0
        ? html`
            <div class="uc-bf-inline-action">
              <button
                type="button"
                class="uc-bf-btn uc-bf-btn--ghost"
                @click=${() => {
                  updateModule({ hidden_entities: [] } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }}
              >
                <ha-icon icon="mdi:eye-refresh-outline"></ha-icon>
                ${localize('editor.battery_fleet.restore_all', lang, 'Restore all dismissed')}
              </button>
            </div>
          `
        : nothing}
    `;
  }

  private _renderManualRows(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const rows = m.entities || [];

    return html`
      <div class="uc-bf-subhead">
        ${localize('editor.battery_fleet.manual_heading', lang, 'Manual batteries')}
      </div>
      <div class="uc-bf-subdesc">
        ${localize(
          'editor.battery_fleet.manual_heading_desc',
          lang,
          'Add any entity that reports a battery percentage. Expand a row to set a friendly label, icon and battery type.'
        )}
      </div>

      ${rows.length === 0
        ? html`
            <div class="uc-bf-panel uc-bf-panel--empty">
              <div class="uc-bf-panel-body">
                ${localize(
                  'editor.battery_fleet.manual_empty',
                  lang,
                  'No manual batteries yet. Add one below.'
                )}
              </div>
            </div>
          `
        : rows.map((row, index) =>
            this._renderManualRow(row, index, m, hass, config, updateModule, lang)
          )}

      <button
        type="button"
        class="uc-bf-btn uc-bf-btn--block"
        @click=${() => {
          const next: BatteryFleetEntity[] = [...(m.entities || [])];
          const created: BatteryFleetEntity = { id: this.generateId('bf_ent'), entity: '' };
          next.push(created);
          this._expandedRows.add(created.id);
          updateModule({ entities: next } as Partial<CardModule>);
          this.triggerPreviewUpdate();
        }}
      >
        <ha-icon icon="mdi:plus"></ha-icon>
        ${localize('editor.battery_fleet.add_entity', lang, 'Add battery')}
      </button>
    `;
  }

  private _renderManualRow(
    row: BatteryFleetEntity,
    index: number,
    m: BatteryFleetModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const expanded = this._expandedRows.has(row.id);
    const state = row.entity ? hass?.states?.[row.entity] : undefined;
    const friendly =
      row.label?.trim() ||
      (state?.attributes?.['friendly_name'] as string | undefined) ||
      row.entity ||
      '';
    const summaryParts: string[] = [];
    if (row.entity) summaryParts.push(row.entity);
    if (row.battery_type?.trim()) summaryParts.push(row.battery_type.trim());

    const patch = (updates: Partial<BatteryFleetEntity>) => {
      const next = [...(m.entities || [])];
      const current = next[index];
      if (!current) return;
      next[index] = { ...current, ...updates };
      updateModule({ entities: next } as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    return html`
      <div class="entity-row">
        <ha-icon class="uc-bf-row-icon" icon=${row.icon || 'mdi:battery-outline'}></ha-icon>
        <div class="entity-info ${row.entity ? '' : 'empty'}">
          <div class="uc-bf-row-title">
            ${friendly ||
            localize('editor.battery_fleet.row_no_entity', lang, 'No entity selected')}
          </div>
          ${summaryParts.length > 0
            ? html`<div class="uc-bf-row-sub">${summaryParts.join(' · ')}</div>`
            : nothing}
        </div>
        <ha-icon
          class="expand-icon ${expanded ? 'expanded' : ''}"
          icon="mdi:chevron-down"
          role="button"
          tabindex="0"
          title=${localize('editor.battery_fleet.row_edit', lang, 'Edit this battery')}
          @click=${() => {
            if (expanded) this._expandedRows.delete(row.id);
            else this._expandedRows.add(row.id);
            this.triggerPreviewUpdate(true);
          }}
        ></ha-icon>
        <ha-icon
          class="delete-icon"
          icon="mdi:delete-outline"
          role="button"
          tabindex="0"
          title=${localize('editor.battery_fleet.row_delete', lang, 'Remove this battery')}
          @click=${() => {
            const next = [...(m.entities || [])];
            next.splice(index, 1);
            this._expandedRows.delete(row.id);
            updateModule({ entities: next } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
      </div>

      ${expanded
        ? html`
            <div class="uc-bf-row-body">
              ${this.renderEntityPickerWithVariables(
                hass,
                config,
                `bf_entity_${row.id}`,
                row.entity || '',
                (value: string) => patch({ entity: value }),
                undefined,
                localize('editor.battery_fleet.row_entity', lang, 'Entity')
              )}
              ${this.renderFieldSection(
                localize('editor.battery_fleet.row_label', lang, 'Label'),
                localize(
                  'editor.battery_fleet.row_label_desc',
                  lang,
                  'Leave blank to use the entity name.'
                ),
                hass,
                { label: row.label || '' },
                [this.textField('label')],
                (e: CustomEvent) => patch({ label: e.detail.value?.label ?? '' })
              )}
              ${this.renderIconField(
                localize('editor.battery_fleet.row_icon', lang, 'Icon'),
                localize(
                  'editor.battery_fleet.row_icon_desc',
                  lang,
                  'Leave blank to use a battery icon that follows the level.'
                ),
                hass,
                row.icon || '',
                (value: string) => patch({ icon: value })
              )}
              ${this.renderFieldSection(
                localize('editor.battery_fleet.row_battery_type', lang, 'Battery type'),
                localize(
                  'editor.battery_fleet.row_battery_type_desc',
                  lang,
                  'A note for shopping day, e.g. "CR2032 x2" or "AA x4".'
                ),
                hass,
                { battery_type: row.battery_type || '' },
                [this.textField('battery_type')],
                (e: CustomEvent) => patch({ battery_type: e.detail.value?.battery_type ?? '' })
              )}
            </div>
          `
        : nothing}
    `;
  }

  // ── General tab: Prediction ─────────────────────────────────────────────────

  private _renderPredictionSection(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const predicting = m.predict_replacement !== false;

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.battery_fleet.prediction_section', lang, 'Prediction')}
        </div>
        <div class="uc-bf-section-desc">
          ${localize(
            'editor.battery_fleet.prediction_section_desc',
            lang,
            'Predictions are measured from recorder history, not guessed. A battery needs a day or two of recorded drain before an estimate appears — until then the card honestly says "gathering data".'
          )}
        </div>

        ${this.renderSettingsSection('', '', [
          {
            title: localize(
              'editor.battery_fleet.predict_replacement',
              lang,
              'Predict replacement dates'
            ),
            description: localize(
              'editor.battery_fleet.predict_replacement_desc',
              lang,
              'Measure each battery\u2019s drain rate and project when it will need changing.'
            ),
            hass,
            data: { predict_replacement: predicting },
            schema: [this.booleanField('predict_replacement')],
            onChange: (e: CustomEvent) => {
              updateModule({
                predict_replacement: e.detail.value?.predict_replacement !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
        ])}
        ${predicting
          ? this.renderConditionalFieldsGroup(
              localize('editor.battery_fleet.prediction_tuning', lang, 'Prediction tuning'),
              html`
                ${this.renderSliderField(
                  localize('editor.battery_fleet.history_days', lang, 'History window'),
                  localize(
                    'editor.battery_fleet.history_days_desc',
                    lang,
                    'How far back to read the recorder. Longer windows smooth out noise but cost more to load.'
                  ),
                  m.history_days ?? 14,
                  14,
                  1,
                  30,
                  1,
                  (value: number) => {
                    updateModule({ history_days: value } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                  localize('editor.battery_fleet.unit_days', lang, ' days')
                )}
                ${this.renderSliderField(
                  localize('editor.battery_fleet.replacement_floor', lang, 'Replacement floor'),
                  localize(
                    'editor.battery_fleet.replacement_floor_desc',
                    lang,
                    'The percentage you consider "dead". Predictions count down to this, not to zero.'
                  ),
                  m.replacement_floor ?? 5,
                  5,
                  0,
                  30,
                  1,
                  (value: number) => {
                    updateModule({ replacement_floor: value } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                  '%'
                )}
                ${this.renderSliderField(
                  localize('editor.battery_fleet.min_confidence_hours', lang, 'Minimum evidence'),
                  localize(
                    'editor.battery_fleet.min_confidence_hours_desc',
                    lang,
                    'How many hours of observed draining are required before any estimate is shown. Lower values give faster but shakier predictions.'
                  ),
                  m.min_confidence_hours ?? 12,
                  12,
                  1,
                  72,
                  1,
                  (value: number) => {
                    updateModule({ min_confidence_hours: value } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                  localize('editor.battery_fleet.unit_hours', lang, ' h')
                )}
                ${this.renderSliderField(
                  localize('editor.battery_fleet.urgent_days', lang, 'Urgent window'),
                  localize(
                    'editor.battery_fleet.urgent_days_desc',
                    lang,
                    'A battery projected to die within this many days is flagged urgent and sorted to the top.'
                  ),
                  m.urgent_days ?? 14,
                  14,
                  1,
                  90,
                  1,
                  (value: number) => {
                    updateModule({ urgent_days: value } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                  localize('editor.battery_fleet.unit_days', lang, ' days')
                )}
              `
            )
          : nothing}
      </div>
    `;
  }

  // ── General tab: Display ────────────────────────────────────────────────────

  private _renderDisplaySection(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.battery_fleet.display_section', lang, 'Display')}
        </div>

        ${this.renderSegmentedField(
          localize('editor.battery_fleet.layout', lang, 'Layout'),
          localize(
            'editor.battery_fleet.layout_desc',
            lang,
            'Table is the dense planning view, Cards is a tile grid, Compact is one line each.'
          ),
          m.layout || 'table',
          [
            {
              value: 'table',
              label: localize('editor.battery_fleet.layout_table', lang, 'Table'),
              icon: 'mdi:table',
            },
            {
              value: 'cards',
              label: localize('editor.battery_fleet.layout_cards', lang, 'Cards'),
              icon: 'mdi:view-grid-outline',
            },
            {
              value: 'compact',
              label: localize('editor.battery_fleet.layout_compact', lang, 'Compact'),
              icon: 'mdi:format-list-text',
            },
          ],
          (next: string) => {
            updateModule({
              layout: (next || 'table') as BatteryFleetModule['layout'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
        ${this.renderSegmentedField(
          localize('editor.battery_fleet.sort_mode', lang, 'Sort by'),
          localize(
            'editor.battery_fleet.sort_mode_desc',
            lang,
            'Urgency blends the current level with how fast it is falling.'
          ),
          m.sort_mode || 'urgency',
          [
            {
              value: 'urgency',
              label: localize('editor.battery_fleet.sort_urgency', lang, 'Urgency'),
              icon: 'mdi:alert-decagram-outline',
            },
            {
              value: 'level',
              label: localize('editor.battery_fleet.sort_level', lang, 'Level'),
              icon: 'mdi:battery-30',
            },
            {
              value: 'drain_rate',
              label: localize('editor.battery_fleet.sort_drain', lang, 'Drain rate'),
              icon: 'mdi:trending-down',
            },
            {
              value: 'name',
              label: localize('editor.battery_fleet.sort_name', lang, 'Name'),
              icon: 'mdi:sort-alphabetical-ascending',
            },
          ],
          (next: string) => {
            updateModule({
              sort_mode: (next || 'urgency') as BatteryFleetModule['sort_mode'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          2
        )}
        ${this.renderSliderField(
          localize('editor.battery_fleet.max_items', lang, 'Maximum devices'),
          localize(
            'editor.battery_fleet.max_items_desc',
            lang,
            'How many devices to list. The summary bar always counts the whole fleet.'
          ),
          m.max_items ?? 25,
          25,
          1,
          100,
          1,
          (value: number) => {
            updateModule({ max_items: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderFieldSection(
          localize('editor.battery_fleet.title', lang, 'Title'),
          localize(
            'editor.battery_fleet.title_desc',
            lang,
            'Header shown above the list. Leave blank for "Battery Fleet".'
          ),
          hass,
          { title: m.title || '' },
          [this.textField('title')],
          (e: CustomEvent) => {
            updateModule({ title: e.detail.value?.title ?? '' } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSettingsSection('', '', [
          this._toggle(
            hass,
            updateModule,
            'show_title',
            m.show_title !== false,
            localize('editor.battery_fleet.show_title', lang, 'Show title'),
            localize('editor.battery_fleet.show_title_desc', lang, 'Display the header row.')
          ),
          this._toggle(
            hass,
            updateModule,
            'show_summary_bar',
            m.show_summary_bar !== false,
            localize('editor.battery_fleet.show_summary_bar', lang, 'Show fleet summary'),
            localize(
              'editor.battery_fleet.show_summary_bar_desc',
              lang,
              'The one-line roll-up with counts and the most urgent device.'
            )
          ),
          this._toggle(
            hass,
            updateModule,
            'show_eta',
            m.show_eta !== false,
            localize('editor.battery_fleet.show_eta', lang, 'Show replacement estimate'),
            localize(
              'editor.battery_fleet.show_eta_desc',
              lang,
              'The "replace in ~12 days" column. Hidden automatically when there is not enough data.'
            )
          ),
          this._toggle(
            hass,
            updateModule,
            'show_drain_rate',
            m.show_drain_rate !== false,
            localize('editor.battery_fleet.show_drain_rate', lang, 'Show drain rate'),
            localize(
              'editor.battery_fleet.show_drain_rate_desc',
              lang,
              'Percentage lost per day, measured from history.'
            )
          ),
          this._toggle(
            hass,
            updateModule,
            'show_sparkline',
            m.show_sparkline !== false,
            localize('editor.battery_fleet.show_sparkline', lang, 'Show sparkline'),
            localize(
              'editor.battery_fleet.show_sparkline_desc',
              lang,
              'A tiny history graph per device. Skipped when there are too few samples.'
            )
          ),
          this._toggle(
            hass,
            updateModule,
            'show_charging_indicator',
            m.show_charging_indicator !== false,
            localize(
              'editor.battery_fleet.show_charging_indicator',
              lang,
              'Show charging indicator'
            ),
            localize(
              'editor.battery_fleet.show_charging_indicator_desc',
              lang,
              'Flag rechargeable devices that are charging right now and exclude them from urgency.'
            )
          ),
          this._toggle(
            hass,
            updateModule,
            'group_by_area',
            m.group_by_area === true,
            localize('editor.battery_fleet.group_by_area', lang, 'Group by area'),
            localize(
              'editor.battery_fleet.group_by_area_desc',
              lang,
              'Split the list into area headings. Devices with no area are listed last.'
            )
          ),
          this._toggle(
            hass,
            updateModule,
            'show_only_problems',
            m.show_only_problems === true,
            localize('editor.battery_fleet.show_only_problems', lang, 'Only show problems'),
            localize(
              'editor.battery_fleet.show_only_problems_desc',
              lang,
              'Hide healthy batteries so the card is empty when there is nothing to do.'
            )
          ),
        ])}
      </div>
    `;
  }

  /** Small helper so the long list of display toggles stays readable. */
  private _toggle(
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    key: keyof BatteryFleetModule,
    value: boolean,
    title: string,
    description: string
  ): {
    title: string;
    description: string;
    hass: HomeAssistant;
    data: Record<string, any>;
    schema: any[];
    onChange: (e: CustomEvent) => void;
  } {
    const name = String(key);
    return {
      title,
      description,
      hass,
      data: { [name]: value },
      schema: [this.booleanField(name)],
      onChange: (e: CustomEvent) => {
        updateModule({ [name]: e.detail.value?.[name] === true } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
    };
  }

  // ── General tab: Thresholds ─────────────────────────────────────────────────

  private _renderThresholdsSection(
    m: BatteryFleetModule,
    _hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.battery_fleet.thresholds_section', lang, 'Thresholds')}
        </div>
        <div class="uc-bf-section-desc">
          ${localize(
            'editor.battery_fleet.thresholds_section_desc',
            lang,
            'Levels at or below these values are coloured and counted as problems.'
          )}
        </div>
        ${this.renderSliderField(
          localize('editor.battery_fleet.critical_threshold', lang, 'Critical'),
          localize(
            'editor.battery_fleet.critical_threshold_desc',
            lang,
            'At or below this percentage a battery is critical.'
          ),
          m.critical_threshold ?? 10,
          10,
          0,
          50,
          1,
          (value: number) => {
            updateModule({ critical_threshold: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          '%'
        )}
        ${this.renderSliderField(
          localize('editor.battery_fleet.low_threshold', lang, 'Low'),
          localize(
            'editor.battery_fleet.low_threshold_desc',
            lang,
            'At or below this percentage a battery is low. Must be above the critical threshold.'
          ),
          m.low_threshold ?? 25,
          25,
          0,
          75,
          1,
          (value: number) => {
            updateModule({ low_threshold: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          '%'
        )}
      </div>
    `;
  }

  // ── General tab: Colors ─────────────────────────────────────────────────────

  private _renderColorsSection(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const fields: Array<[keyof BatteryFleetModule, string, string, string]> = [
      [
        'critical_color',
        localize('editor.battery_fleet.color_critical', lang, 'Critical'),
        localize(
          'editor.battery_fleet.color_critical_desc',
          lang,
          'Batteries at or below the critical threshold.'
        ),
        'var(--error-color)',
      ],
      [
        'low_color',
        localize('editor.battery_fleet.color_low', lang, 'Low'),
        localize(
          'editor.battery_fleet.color_low_desc',
          lang,
          'Batteries at or below the low threshold.'
        ),
        'var(--warning-color)',
      ],
      [
        'ok_color',
        localize('editor.battery_fleet.color_ok', lang, 'Healthy'),
        localize(
          'editor.battery_fleet.color_ok_desc',
          lang,
          'Batteries with nothing to worry about.'
        ),
        'var(--success-color)',
      ],
      [
        'charging_color',
        localize('editor.battery_fleet.color_charging', lang, 'Charging'),
        localize(
          'editor.battery_fleet.color_charging_desc',
          lang,
          'Rechargeable devices currently charging.'
        ),
        'var(--info-color)',
      ],
      [
        'text_color',
        localize('editor.battery_fleet.color_text', lang, 'Text'),
        localize('editor.battery_fleet.color_text_desc', lang, 'Device names and percentages.'),
        'var(--primary-text-color)',
      ],
      [
        'secondary_text_color',
        localize('editor.battery_fleet.color_secondary', lang, 'Secondary text'),
        localize(
          'editor.battery_fleet.color_secondary_desc',
          lang,
          'Drain rates, estimates and captions.'
        ),
        'var(--secondary-text-color)',
      ],
      [
        'card_background_color',
        localize('editor.battery_fleet.color_card_bg', lang, 'Row background'),
        localize(
          'editor.battery_fleet.color_card_bg_desc',
          lang,
          'Background behind each device row or tile.'
        ),
        'var(--card-background-color)',
      ],
    ];

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.battery_fleet.colors_section', lang, 'Colors')}
        </div>
        ${fields.map(([key, title, description, fallback]) =>
          this.renderColorField(
            title,
            description,
            hass,
            String((m as unknown as Record<string, unknown>)[String(key)] || ''),
            fallback,
            (value: string) => {
              updateModule({ [String(key)]: value } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )
        )}
      </div>
    `;
  }

  // ── Preview ─────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as BatteryFleetModule;
    const lang = hass?.locale?.language || 'en';

    try {
      return this._renderPreviewBody(m, hass, config, previewContext, lang);
    } catch (err) {
      return this.renderGradientErrorState(
        localize('editor.battery_fleet.err_render', lang, 'Battery Fleet could not render'),
        String((err as Error)?.message || err),
        'mdi:battery-alert-variant-outline'
      );
    }
  }

  private _renderPreviewBody(
    m: BatteryFleetModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    previewContext: 'live' | 'ha-preview' | 'dashboard' | undefined,
    lang: string
  ): TemplateResult {
    if (!hass?.states) {
      return this.renderGradientErrorState(
        localize('editor.battery_fleet.err_ha', lang, 'Waiting for Home Assistant'),
        localize('editor.battery_fleet.err_ha_desc', lang, 'Connecting to entity states…'),
        'mdi:battery-heart-variant'
      );
    }

    const devices = discoverDevices(hass, m);
    this._discovered.set(
      m.id,
      devices.map(d => d.entityId)
    );

    if (devices.length === 0) {
      return this._renderNoDevicesState(m, lang);
    }

    // Current levels come straight from hass.states, so paint them immediately
    // and let history fill in the prediction columns when it lands.
    const wantsHistory = m.predict_replacement !== false || m.show_sparkline !== false;
    const days = Math.max(1, Math.min(30, m.history_days ?? 14));
    let history: Map<string, HistoryStatePoint[]> | undefined;
    let loading = false;
    let historyError: string | null = null;

    if (wantsHistory) {
      const ids = historyEntityIds(devices);
      const withAttributes = needsAttributes(devices);
      const now = Date.now();
      const result = ucHistoryService.query(
        hass,
        {
          // The key deliberately omits the timestamps: it must stay stable
          // across renders, and freshness is already handled by the TTL.
          key: `battery_fleet:${m.id}:${days}:${withAttributes ? 'attr' : 'state'}:${ids.join(',')}`,
          entityIds: ids,
          startMs: now - days * 86400000,
          endMs: now,
          ttlMs: HISTORY_TTL_MS,
          withAttributes,
        },
        () => this.triggerPreviewUpdate()
      );
      history = result.data;
      loading = result.loading && result.fetchedAt === 0;
      historyError = result.error;
    }

    const analyses = analyze(devices, history, m);
    const summary = summarize(analyses, m);

    const filtered =
      m.show_only_problems === true ? analyses.filter(a => isProblem(a, m)) : analyses;
    const sorted = sortAnalyses(filtered, m.sort_mode || 'urgency');
    const limited = sorted.slice(0, Math.max(1, m.max_items ?? 25));

    const colors = this._colors(m);
    const designStyles = this.buildStyleString(this.buildDesignStyles(m, hass));
    const hoverClass = this.getHoverEffectClass(m);
    const allowDismiss = previewContext === 'live';

    const body =
      filtered.length === 0
        ? this._renderAllClearState(m, summary, lang, colors)
        : m.layout === 'cards'
          ? this._renderCards(m, limited, hass, config, colors, lang, loading, allowDismiss)
          : m.layout === 'compact'
            ? this._renderCompact(m, limited, hass, config, colors, lang, loading, allowDismiss)
            : this._renderTable(m, limited, hass, config, colors, lang, loading, allowDismiss);

    const grouped =
      m.group_by_area === true && filtered.length > 0
        ? this._renderGrouped(m, limited, hass, config, colors, lang, loading, allowDismiss)
        : null;

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="uc-bf-root ${hoverClass}" style="${designStyles}">
        ${this.wrapWithAnimation(
          html`
            ${m.show_title !== false
              ? html`
                  <div class="uc-bf-title" style="color:${colors.text};">
                    <ha-icon icon="mdi:battery-heart-variant"></ha-icon>
                    <span
                      >${m.title?.trim() ||
                      localize('editor.battery_fleet.default_title', lang, 'Battery Fleet')}</span
                    >
                  </div>
                `
              : nothing}
            ${m.show_summary_bar !== false
              ? this._renderSummaryBar(m, summary, colors, lang, loading)
              : nothing}
            ${historyError
              ? html`
                  <div class="uc-bf-notice uc-bf-notice--warn">
                    <ha-icon icon="mdi:database-alert-outline"></ha-icon>
                    <span
                      >${localize(
                        'editor.battery_fleet.err_history',
                        lang,
                        'Recorder history is unavailable, so levels are shown without predictions.'
                      )}</span
                    >
                  </div>
                `
              : nothing}
            ${grouped ?? body} ${this._renderFooter(m, summary, colors, lang, days, loading)}
          `,
          m,
          hass
        )}
      </div>
    `;
  }

  // ── Preview: empty / all-clear states ───────────────────────────────────────

  private _renderNoDevicesState(m: BatteryFleetModule, lang: string): TemplateResult {
    if ((m.discovery_mode || 'auto') === 'manual') {
      return this.renderGradientErrorState(
        localize('editor.battery_fleet.empty_manual', lang, 'Add your batteries'),
        localize(
          'editor.battery_fleet.empty_manual_desc',
          lang,
          'Manual discovery is on but the list is empty. Add entities in the General tab, or switch discovery to Auto.'
        ),
        'mdi:battery-heart-variant'
      );
    }
    return this.renderGradientErrorState(
      localize('editor.battery_fleet.empty_auto', lang, 'No batteries found'),
      localize(
        'editor.battery_fleet.empty_auto_desc',
        lang,
        'Nothing in Home Assistant reports a battery level. Try enabling battery_level attributes or binary sensors, or relax the exclude patterns.'
      ),
      'mdi:battery-off-outline'
    );
  }

  /** `show_only_problems` with a healthy fleet should feel like good news. */
  private _renderAllClearState(
    _m: BatteryFleetModule,
    summary: FleetSummary,
    lang: string,
    colors: FleetColors
  ): TemplateResult {
    return html`
      <div class="uc-bf-allclear" style="--uc-bf-accent:${colors.ok};">
        <ha-icon icon="mdi:check-decagram-outline" style="color:${colors.ok};"></ha-icon>
        <div class="uc-bf-allclear-text">
          <div class="uc-bf-allclear-title" style="color:${colors.text};">
            ${localize('editor.battery_fleet.all_clear', lang, 'Every battery is healthy')}
          </div>
          <div class="uc-bf-allclear-sub" style="color:${colors.secondary};">
            ${localize(
              'editor.battery_fleet.all_clear_desc',
              lang,
              '{count} device(s) checked, nothing needs attention.'
            ).replace('{count}', String(summary.total))}
          </div>
        </div>
      </div>
    `;
  }

  // ── Preview: summary bar + footer ───────────────────────────────────────────

  private _renderSummaryBar(
    m: BatteryFleetModule,
    summary: FleetSummary,
    colors: FleetColors,
    lang: string,
    loading: boolean
  ): TemplateResult {
    const parts: TemplateResult[] = [];

    parts.push(
      html`<span class="uc-bf-sum-part" style="color:${colors.text};font-weight:700;"
        >${localize('editor.battery_fleet.sum_total', lang, '{count} batteries').replace(
          '{count}',
          String(summary.total)
        )}</span
      >`
    );

    if (summary.critical > 0) {
      parts.push(
        html`<span class="uc-bf-sum-part" style="color:${colors.critical};font-weight:700;"
          >${localize('editor.battery_fleet.sum_critical', lang, '{count} critical').replace(
            '{count}',
            String(summary.critical)
          )}</span
        >`
      );
    }
    if (summary.low > 0) {
      parts.push(
        html`<span class="uc-bf-sum-part" style="color:${colors.low};font-weight:600;"
          >${localize('editor.battery_fleet.sum_low', lang, '{count} low').replace(
            '{count}',
            String(summary.low)
          )}</span
        >`
      );
    }
    if (m.predict_replacement !== false && summary.replacingThisMonth > 0) {
      parts.push(
        html`<span class="uc-bf-sum-part" style="color:${colors.secondary};"
          >${localize(
            'editor.battery_fleet.sum_month',
            lang,
            '{count} need replacing this month'
          ).replace('{count}', String(summary.replacingThisMonth))}</span
        >`
      );
    }
    if (summary.critical === 0 && summary.low === 0) {
      parts.push(
        html`<span class="uc-bf-sum-part" style="color:${colors.ok};font-weight:600;"
          >${localize('editor.battery_fleet.sum_all_ok', lang, 'all healthy')}</span
        >`
      );
    }

    const urgent = summary.mostUrgent;
    const urgentLine =
      urgent && isActionable(urgent, m)
        ? html`
            <div class="uc-bf-sum-urgent" style="color:${colors.secondary};">
              <ha-icon
                icon="mdi:alert-decagram-outline"
                style="color:${this._statusColor(urgent.status, colors)};"
              ></ha-icon>
              <span class="uc-bf-sum-urgent-text">
                ${localize(
                  'editor.battery_fleet.sum_most_urgent',
                  lang,
                  'Most urgent: {name}'
                ).replace('{name}', urgent.name)}
                ${urgent.level !== null
                  ? html`<span
                      style="color:${this._statusColor(urgent.status, colors)};font-weight:700;"
                      >${Math.round(urgent.level)}%</span
                    >`
                  : nothing}
                ${m.show_eta !== false
                  ? html`<span
                      >·
                      ${this._etaText(
                        describeEta(urgent, { predict: m.predict_replacement !== false }),
                        lang,
                        false
                      )}</span
                    >`
                  : nothing}
              </span>
            </div>
          `
        : nothing;

    return html`
      <div class="uc-bf-summary" style="background:${colors.bg};border-color:var(--divider-color);">
        <div class="uc-bf-sum-line">
          ${parts.map((part, index) =>
            index === 0 ? part : html`<span class="uc-bf-sum-dot">·</span>${part}`
          )}
          ${loading
            ? html`<span class="uc-bf-sum-dot">·</span
                ><span class="uc-bf-sum-part uc-bf-loading-text" style="color:${colors.secondary};"
                  >${localize(
                    'editor.battery_fleet.loading_history',
                    lang,
                    'reading history…'
                  )}</span
                >`
            : nothing}
        </div>
        ${urgentLine}
      </div>
    `;
  }

  private _renderFooter(
    m: BatteryFleetModule,
    summary: FleetSummary,
    colors: FleetColors,
    lang: string,
    days: number,
    loading: boolean
  ): TemplateResult | typeof nothing {
    if (m.predict_replacement === false) return nothing;
    if (loading) {
      return html`<div class="uc-bf-footer" style="color:${colors.secondary};">
        ${localize(
          'editor.battery_fleet.footer_loading',
          lang,
          'Reading {days} days of recorder history…'
        ).replace('{days}', String(days))}
      </div>`;
    }
    if (summary.total === 0) return nothing;
    return html`
      <div class="uc-bf-footer" style="color:${colors.secondary};">
        ${localize(
          'editor.battery_fleet.footer_basis',
          lang,
          'Predictions from {days} days of history · {ready} of {total} devices have enough data'
        )
          .replace('{days}', String(days))
          .replace('{ready}', String(summary.predicted))
          .replace('{total}', String(summary.total))}
      </div>
    `;
  }

  // ── Preview: grouped by area ────────────────────────────────────────────────

  private _renderGrouped(
    m: BatteryFleetModule,
    items: BatteryAnalysis[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    colors: FleetColors,
    lang: string,
    loading: boolean,
    allowDismiss: boolean
  ): TemplateResult {
    const groups = groupByArea(items);
    return html`
      <div class="uc-bf-groups">
        ${groups.map(
          group => html`
            <div class="uc-bf-group">
              <div class="uc-bf-group-head" style="color:${colors.secondary};">
                <ha-icon
                  icon=${group.areaId ? 'mdi:texture-box' : 'mdi:help-rhombus-outline'}
                ></ha-icon>
                <span
                  >${group.areaName ||
                  localize('editor.battery_fleet.no_area', lang, 'No area')}</span
                >
                <span class="uc-bf-group-count">${group.items.length}</span>
              </div>
              ${m.layout === 'cards'
                ? this._renderCards(
                    m,
                    group.items,
                    hass,
                    config,
                    colors,
                    lang,
                    loading,
                    allowDismiss
                  )
                : m.layout === 'compact'
                  ? this._renderCompact(
                      m,
                      group.items,
                      hass,
                      config,
                      colors,
                      lang,
                      loading,
                      allowDismiss
                    )
                  : this._renderTable(
                      m,
                      group.items,
                      hass,
                      config,
                      colors,
                      lang,
                      loading,
                      allowDismiss
                    )}
            </div>
          `
        )}
      </div>
    `;
  }

  // ── Preview: table layout ───────────────────────────────────────────────────

  private _renderTable(
    m: BatteryFleetModule,
    items: BatteryAnalysis[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    colors: FleetColors,
    lang: string,
    loading: boolean,
    allowDismiss: boolean
  ): TemplateResult {
    return html`
      <div class="uc-bf-table">
        ${items.map(item => {
          const color = this._statusColor(item.status, colors);
          const gestures = this._rowGestures(m, item, hass, config, 'table');
          const rate = formatRatePerDay(item);
          const eta = describeEta(item, { predict: m.predict_replacement !== false });
          return html`
            <div
              class="uc-bf-row"
              style="background:${colors.bg};"
              @pointerdown=${gestures.onPointerDown}
              @pointermove=${gestures.onPointerMove}
              @pointerup=${gestures.onPointerUp}
              @pointerleave=${gestures.onPointerLeave}
              @pointercancel=${gestures.onPointerCancel}
            >
              <ha-icon class="uc-bf-row-lead" icon=${item.icon} style="color:${color};"></ha-icon>

              <div class="uc-bf-row-main">
                <div class="uc-bf-row-name" style="color:${colors.text};" title="${item.entityId}">
                  ${item.name} ${this._chargingBadge(m, item, colors)}
                  ${item.batteryType
                    ? html`<span class="uc-bf-battery-type" style="color:${colors.secondary};"
                        >${item.batteryType}</span
                      >`
                    : nothing}
                </div>
                ${this._levelBar(item, color)}
              </div>

              <div class="uc-bf-cell uc-bf-pct" style="color:${colors.text};">
                ${item.level === null ? '—' : `${Math.round(item.level)}%`}
              </div>

              ${m.show_drain_rate !== false
                ? html`
                    <div class="uc-bf-cell uc-bf-col-drain" style="color:${colors.secondary};">
                      ${loading
                        ? html`<span class="uc-bf-skel uc-bf-skel--sm"></span>`
                        : rate === null
                          ? html`<span class="uc-bf-muted">—</span>`
                          : localize(
                              'editor.battery_fleet.rate_per_day',
                              lang,
                              '{rate}%/day'
                            ).replace('{rate}', String(rate))}
                    </div>
                  `
                : nothing}
              ${m.show_eta !== false
                ? html`
                    <div
                      class="uc-bf-cell uc-bf-col-eta"
                      style="color:${this._etaColor(eta, item, colors)};"
                      title=${this._confidenceTitle(item, lang)}
                    >
                      ${loading
                        ? html`<span class="uc-bf-skel uc-bf-skel--md"></span>`
                        : this._etaText(eta, lang, true)}
                    </div>
                  `
                : nothing}
              ${m.show_sparkline !== false
                ? html`
                    <div class="uc-bf-col-spark">
                      ${loading
                        ? html`<span class="uc-bf-skel uc-bf-skel--md"></span>`
                        : this._sparkline(item.series, color)}
                    </div>
                  `
                : nothing}
              ${this._dismissButton(m, item, allowDismiss, lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  // ── Preview: cards layout ───────────────────────────────────────────────────

  private _renderCards(
    m: BatteryFleetModule,
    items: BatteryAnalysis[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    colors: FleetColors,
    lang: string,
    loading: boolean,
    allowDismiss: boolean
  ): TemplateResult {
    return html`
      <div class="uc-bf-cards">
        ${items.map(item => {
          const color = this._statusColor(item.status, colors);
          const gestures = this._rowGestures(m, item, hass, config, 'card');
          const eta = describeEta(item, { predict: m.predict_replacement !== false });
          const rate = formatRatePerDay(item);
          return html`
            <div
              class="uc-bf-card"
              style="background:${colors.bg};--uc-bf-accent:${color};"
              @pointerdown=${gestures.onPointerDown}
              @pointermove=${gestures.onPointerMove}
              @pointerup=${gestures.onPointerUp}
              @pointerleave=${gestures.onPointerLeave}
              @pointercancel=${gestures.onPointerCancel}
            >
              <div class="uc-bf-card-top">
                ${this._levelRing(item, color, colors)}
                ${this._dismissButton(m, item, allowDismiss, lang)}
              </div>
              <div class="uc-bf-card-name" style="color:${colors.text};" title="${item.entityId}">
                ${item.name}${this._chargingBadge(m, item, colors)}
              </div>
              ${m.show_eta !== false
                ? html`
                    <div
                      class="uc-bf-card-eta"
                      style="color:${this._etaColor(eta, item, colors)};"
                      title=${this._confidenceTitle(item, lang)}
                    >
                      ${loading
                        ? html`<span class="uc-bf-skel uc-bf-skel--md"></span>`
                        : this._etaText(eta, lang, false)}
                    </div>
                  `
                : nothing}
              ${m.show_drain_rate !== false && !loading && rate !== null
                ? html`
                    <div class="uc-bf-card-rate" style="color:${colors.secondary};">
                      ${localize('editor.battery_fleet.rate_per_day', lang, '{rate}%/day').replace(
                        '{rate}',
                        String(rate)
                      )}
                    </div>
                  `
                : nothing}
              ${m.show_sparkline !== false && !loading
                ? html`<div class="uc-bf-card-spark">${this._sparkline(item.series, color)}</div>`
                : nothing}
              ${item.batteryType
                ? html`<div class="uc-bf-card-type" style="color:${colors.secondary};">
                    ${item.batteryType}
                  </div>`
                : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  // ── Preview: compact layout ─────────────────────────────────────────────────

  private _renderCompact(
    m: BatteryFleetModule,
    items: BatteryAnalysis[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    colors: FleetColors,
    lang: string,
    loading: boolean,
    allowDismiss: boolean
  ): TemplateResult {
    return html`
      <div class="uc-bf-compact">
        ${items.map(item => {
          const color = this._statusColor(item.status, colors);
          const gestures = this._rowGestures(m, item, hass, config, 'compact');
          const eta = describeEta(item, { predict: m.predict_replacement !== false });
          return html`
            <div
              class="uc-bf-compact-row"
              @pointerdown=${gestures.onPointerDown}
              @pointermove=${gestures.onPointerMove}
              @pointerup=${gestures.onPointerUp}
              @pointerleave=${gestures.onPointerLeave}
              @pointercancel=${gestures.onPointerCancel}
            >
              <span class="uc-bf-compact-pct" style="color:${color};--uc-bf-accent:${color};">
                ${item.level === null ? '—' : `${Math.round(item.level)}%`}
              </span>
              <span
                class="uc-bf-compact-name"
                style="color:${colors.text};"
                title="${item.entityId}"
              >
                ${item.name}${this._chargingBadge(m, item, colors)}
              </span>
              ${m.show_eta !== false
                ? html`
                    <span
                      class="uc-bf-compact-eta"
                      style="color:${this._etaColor(eta, item, colors)};"
                      title=${this._confidenceTitle(item, lang)}
                    >
                      ${loading
                        ? html`<span class="uc-bf-skel uc-bf-skel--sm"></span>`
                        : this._etaText(eta, lang, true)}
                    </span>
                  `
                : nothing}
              ${this._dismissButton(m, item, allowDismiss, lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  // ── Preview: small pieces ───────────────────────────────────────────────────

  private _levelBar(item: BatteryAnalysis, color: string): TemplateResult {
    const pct = item.level === null ? 0 : Math.max(0, Math.min(100, item.level));
    return html`
      <div
        class="uc-bf-bar"
        role="progressbar"
        aria-valuenow=${Math.round(pct)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="uc-bf-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
    `;
  }

  private _levelRing(item: BatteryAnalysis, color: string, colors: FleetColors): TemplateResult {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const pct = item.level === null ? 0 : Math.max(0, Math.min(100, item.level));
    const dash = (pct / 100) * circumference;
    return html`
      <div class="uc-bf-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r=${radius}
            fill="none"
            stroke="rgba(127,127,127,0.22)"
            stroke-width="9"
          ></circle>
          <circle
            cx="50"
            cy="50"
            r=${radius}
            fill="none"
            stroke=${color}
            stroke-width="9"
            stroke-linecap="round"
            stroke-dasharray="${dash} ${circumference}"
            transform="rotate(-90 50 50)"
          ></circle>
        </svg>
        <div class="uc-bf-ring-value" style="color:${colors.text};">
          ${item.level === null ? '—' : Math.round(item.level)}<span
            class="uc-bf-ring-unit"
            style="color:${colors.secondary};"
            >${item.level === null ? '' : '%'}</span
          >
        </div>
      </div>
    `;
  }

  /** Inline sparkline; silently skipped when there is nothing meaningful to draw. */
  private _sparkline(series: NumericPoint[], color: string): TemplateResult | typeof nothing {
    if (!series || series.length < 3) return nothing;

    const width = 60;
    const height = 20;
    const pad = 2;

    let tMin = Infinity;
    let tMax = -Infinity;
    let vMin = Infinity;
    let vMax = -Infinity;
    for (const point of series) {
      if (point.t < tMin) tMin = point.t;
      if (point.t > tMax) tMax = point.t;
      if (point.v < vMin) vMin = point.v;
      if (point.v > vMax) vMax = point.v;
    }
    const tSpan = tMax - tMin;
    if (!Number.isFinite(tSpan) || tSpan <= 0) return nothing;
    // A flat battery history is still worth drawing, so give it a minimum range
    // rather than dividing by zero.
    const vSpan = Math.max(vMax - vMin, 5);

    const points = series
      .map(point => {
        const x = pad + ((point.t - tMin) / tSpan) * (width - pad * 2);
        const y = height - pad - ((point.v - vMin) / vSpan) * (height - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return html`
      <svg
        class="uc-bf-spark"
        viewBox="0 0 ${width} ${height}"
        width=${width}
        height=${height}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points=${points}
          fill="none"
          stroke=${color}
          stroke-width="1.6"
          stroke-linejoin="round"
          stroke-linecap="round"
          opacity="0.9"
        ></polyline>
      </svg>
    `;
  }

  private _chargingBadge(
    m: BatteryFleetModule,
    item: BatteryAnalysis,
    colors: FleetColors
  ): TemplateResult | typeof nothing {
    if (m.show_charging_indicator === false || !item.charging) return nothing;
    return html`<ha-icon
      class="uc-bf-charging"
      icon="mdi:lightning-bolt"
      style="color:${colors.charging};"
    ></ha-icon>`;
  }

  private _dismissButton(
    m: BatteryFleetModule,
    item: BatteryAnalysis,
    allow: boolean,
    lang: string
  ): TemplateResult | typeof nothing {
    if (!allow) return nothing;
    const isManual = item.source === 'manual';

    return html`
      <button
        type="button"
        class="uc-bf-dismiss"
        title=${isManual
          ? localize('editor.battery_fleet.dismiss_manual', lang, 'Remove from the manual list')
          : localize('editor.battery_fleet.dismiss_auto', lang, 'Hide this device from the card')}
        aria-label=${isManual
          ? localize('editor.battery_fleet.dismiss_manual', lang, 'Remove from the manual list')
          : localize('editor.battery_fleet.dismiss_auto', lang, 'Hide this device from the card')}
        @click=${(ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          this._dismiss(m, item);
        }}
        @pointerdown=${(ev: Event) => ev.stopPropagation()}
        @pointerup=${(ev: Event) => ev.stopPropagation()}
      >
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    `;
  }

  /**
   * Writes back through the editor's patch event (same mechanism battery-monitor
   * uses) so a dismissal made in the live preview persists in the config.
   */
  private _dismiss(m: BatteryFleetModule, item: BatteryAnalysis): void {
    const updates =
      item.source === 'manual'
        ? { entities: (m.entities || []).filter(row => row.entity !== item.entityId) }
        : {
            hidden_entities: (m.hidden_entities || []).includes(item.entityId)
              ? [...(m.hidden_entities || [])]
              : [...(m.hidden_entities || []), item.entityId],
          };

    window.dispatchEvent(
      new CustomEvent(PATCH_EVENT, {
        bubbles: true,
        composed: true,
        detail: { moduleId: m.id, updates },
      })
    );
    this.triggerPreviewUpdate(true);
  }

  private _rowGestures(
    m: BatteryFleetModule,
    item: BatteryAnalysis,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    suffix: string
  ) {
    return this.createGestureHandlers(
      `${m.id}-${item.entityId}-${suffix}`,
      {
        tap_action:
          m.tap_action?.action && m.tap_action.action !== 'nothing'
            ? { ...m.tap_action, entity: item.entityId }
            : { action: 'more-info', entity: item.entityId },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: item.entityId,
        module: m,
      },
      hass,
      config,
      ['.uc-bf-dismiss']
    );
  }

  // ── Preview: text + color helpers ───────────────────────────────────────────

  private _colors(m: BatteryFleetModule): FleetColors {
    return {
      critical: m.critical_color?.trim() || 'var(--error-color)',
      low: m.low_color?.trim() || 'var(--warning-color)',
      ok: m.ok_color?.trim() || 'var(--success-color)',
      charging: m.charging_color?.trim() || 'var(--info-color, var(--primary-color))',
      text: m.text_color?.trim() || 'var(--primary-text-color)',
      secondary: m.secondary_text_color?.trim() || 'var(--secondary-text-color)',
      bg: m.card_background_color?.trim() || 'var(--card-background-color)',
    };
  }

  private _statusColor(status: BatteryAnalysis['status'], colors: FleetColors): string {
    switch (status) {
      case 'critical':
        return colors.critical;
      case 'low':
        return colors.low;
      case 'charging':
        return colors.charging;
      case 'unknown':
        return colors.secondary;
      default:
        return colors.ok;
    }
  }

  private _etaColor(eta: EtaDescriptor, item: BatteryAnalysis, colors: FleetColors): string {
    if (eta.kind === 'charging') return colors.charging;
    if (eta.kind === 'now') return colors.critical;
    if (eta.kind === 'days')
      return item.daysRemaining !== null && item.daysRemaining <= 7 ? colors.critical : colors.low;
    if (eta.kind === 'gathering') return colors.secondary;
    return colors.secondary;
  }

  /**
   * Long form ("replace in ~12 days") for cards and the summary line, short form
   * ("~12d") for the narrow table and compact columns.
   */
  private _etaText(eta: EtaDescriptor, lang: string, short: boolean): string {
    switch (eta.kind) {
      case 'charging':
        return localize('editor.battery_fleet.eta_charging', lang, 'charging');
      case 'gathering':
        return short
          ? localize('editor.battery_fleet.eta_gathering_short', lang, 'gathering…')
          : localize('editor.battery_fleet.eta_gathering', lang, 'gathering data');
      case 'now':
        return short
          ? localize('editor.battery_fleet.eta_now_short', lang, 'now')
          : localize('editor.battery_fleet.eta_now', lang, 'replace now');
      case 'days':
        if (short) {
          return localize('editor.battery_fleet.eta_days_short', lang, '~{n}d').replace(
            '{n}',
            String(eta.value)
          );
        }
        return eta.value === 1
          ? localize('editor.battery_fleet.eta_day_one', lang, 'replace in about a day')
          : localize('editor.battery_fleet.eta_days', lang, 'replace in ~{n} days').replace(
              '{n}',
              String(eta.value)
            );
      case 'weeks':
        return short
          ? localize('editor.battery_fleet.eta_weeks_short', lang, '~{n}w').replace(
              '{n}',
              String(eta.value)
            )
          : localize('editor.battery_fleet.eta_weeks', lang, '~{n} weeks').replace(
              '{n}',
              String(eta.value)
            );
      case 'months':
        return short
          ? localize('editor.battery_fleet.eta_months_short', lang, '~{n}mo').replace(
              '{n}',
              String(eta.value)
            )
          : localize('editor.battery_fleet.eta_months', lang, '~{n} months').replace(
              '{n}',
              String(eta.value)
            );
      case 'beyond':
        return short
          ? localize('editor.battery_fleet.eta_beyond_short', lang, '6mo+')
          : localize('editor.battery_fleet.eta_beyond', lang, 'over 6 months');
      case 'off':
      default:
        return '';
    }
  }

  /** Tooltip explaining exactly what a prediction is based on. */
  private _confidenceTitle(item: BatteryAnalysis, lang: string): string {
    if (item.confidence === 'none') {
      return localize(
        'editor.battery_fleet.conf_none',
        lang,
        'Not enough recorded drain yet to make an honest estimate.'
      );
    }
    const hours = Math.round(item.observedHours);
    const label =
      item.confidence === 'high'
        ? localize('editor.battery_fleet.conf_high', lang, 'High confidence')
        : item.confidence === 'medium'
          ? localize('editor.battery_fleet.conf_medium', lang, 'Medium confidence')
          : localize('editor.battery_fleet.conf_low', lang, 'Low confidence');
    return localize(
      'editor.battery_fleet.conf_basis',
      lang,
      '{label} — measured from {hours} h of observed discharge.'
    )
      .replace('{label}', label)
      .replace('{hours}', String(hours));
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      /* ── Editor ─────────────────────────────────────────────────────────── */
      .uc-bf-section-desc {
        font-size: 13px;
        line-height: 1.5;
        color: var(--secondary-text-color);
        margin: -8px 0 16px;
      }
      .uc-bf-subhead {
        font-size: 14px;
        font-weight: 700;
        color: var(--primary-text-color);
        margin: 20px 0 4px;
      }
      .uc-bf-subdesc {
        font-size: 12px;
        line-height: 1.5;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }
      .uc-bf-panel {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 16px;
        background: var(--card-background-color);
      }
      .uc-bf-panel--empty {
        border-style: dashed;
      }
      .uc-bf-panel-head {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
        color: var(--primary-text-color);
      }
      .uc-bf-panel-head ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 20px;
      }
      .uc-bf-panel-body {
        font-size: 12px;
        line-height: 1.5;
        color: var(--secondary-text-color);
        margin-top: 6px;
      }
      .uc-bf-preview-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }
      .uc-bf-preview-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        max-width: 190px;
        padding: 4px 9px;
        border-radius: 14px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        font-size: 12px;
        color: var(--primary-text-color);
      }
      .uc-bf-preview-chip ha-icon {
        --mdc-icon-size: 15px;
        color: var(--primary-color);
        flex-shrink: 0;
      }
      .uc-bf-preview-chip-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-bf-preview-chip-pct {
        font-weight: 700;
        flex-shrink: 0;
        opacity: 0.75;
      }
      .uc-bf-preview-more {
        display: inline-flex;
        align-items: center;
        padding: 4px 9px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .uc-bf-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: filter 0.15s ease;
      }
      .uc-bf-btn:hover {
        filter: brightness(1.1);
      }
      .uc-bf-btn:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .uc-bf-btn--block {
        width: 100%;
        margin-top: 8px;
      }
      .uc-bf-btn--ghost {
        background: transparent;
        color: var(--primary-color);
        border: 1px solid var(--divider-color);
      }
      .uc-bf-inline-action {
        margin: -4px 0 16px;
      }
      .entity-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 8px;
      }
      .entity-row .uc-bf-row-icon {
        color: var(--primary-color);
        --mdc-icon-size: 22px;
        flex-shrink: 0;
      }
      .entity-info {
        flex: 1;
        min-width: 0;
      }
      .entity-info.empty .uc-bf-row-title {
        color: var(--secondary-text-color);
        font-style: italic;
      }
      .uc-bf-row-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-bf-row-sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 2px;
      }
      .expand-icon {
        cursor: pointer;
        color: var(--primary-color);
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .expand-icon.expanded {
        transform: rotate(180deg);
      }
      .delete-icon {
        cursor: pointer;
        color: var(--error-color);
        flex-shrink: 0;
      }
      .expand-icon:focus-visible,
      .delete-icon:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
        border-radius: 4px;
      }
      .uc-bf-row-body {
        padding: 14px;
        margin: -4px 0 12px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-left: 3px solid var(--primary-color);
        border-radius: 0 8px 8px 0;
      }

      /* ── Preview ────────────────────────────────────────────────────────── */
      .uc-bf-root {
        box-sizing: border-box;
        width: 100%;
      }
      .uc-bf-root * {
        box-sizing: border-box;
      }
      .uc-bf-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      .uc-bf-title ha-icon {
        --mdc-icon-size: 20px;
        opacity: 0.85;
      }
      .uc-bf-summary {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 10px;
      }
      .uc-bf-sum-line {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 6px;
        font-size: 13px;
        line-height: 1.4;
      }
      .uc-bf-sum-dot {
        opacity: 0.45;
      }
      .uc-bf-sum-urgent {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        font-size: 12px;
        min-width: 0;
      }
      .uc-bf-sum-urgent ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }
      .uc-bf-sum-urgent-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-bf-notice {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .uc-bf-notice--warn {
        background: rgba(var(--rgb-warning-color, 255, 165, 0), 0.12);
        color: var(--warning-color);
      }
      .uc-bf-notice ha-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }
      .uc-bf-footer {
        font-size: 11px;
        line-height: 1.4;
        margin-top: 8px;
        opacity: 0.85;
      }
      .uc-bf-groups {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .uc-bf-group-head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .uc-bf-group-head ha-icon {
        --mdc-icon-size: 15px;
      }
      .uc-bf-group-count {
        margin-left: auto;
        opacity: 0.7;
        font-weight: 600;
        letter-spacing: 0;
      }

      /* Table */
      .uc-bf-table {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .uc-bf-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 10px;
        border-radius: 9px;
        cursor: pointer;
        transition: filter 0.15s ease;
      }
      .uc-bf-row:hover {
        filter: brightness(1.06);
      }
      .uc-bf-row-lead {
        flex: 0 0 auto;
        --mdc-icon-size: 22px;
      }
      .uc-bf-row-main {
        flex: 1 1 auto;
        min-width: 0;
      }
      .uc-bf-row-name {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13.5px;
        font-weight: 600;
        line-height: 1.3;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-bf-battery-type {
        font-size: 10.5px;
        font-weight: 500;
        opacity: 0.85;
        flex-shrink: 0;
      }
      .uc-bf-charging {
        --mdc-icon-size: 14px;
        flex-shrink: 0;
      }
      .uc-bf-bar {
        height: 5px;
        border-radius: 3px;
        background: rgba(127, 127, 127, 0.22);
        overflow: hidden;
        margin-top: 5px;
      }
      .uc-bf-bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .uc-bf-cell {
        flex: 0 0 auto;
        text-align: right;
        font-size: 12px;
        line-height: 1.2;
        white-space: nowrap;
      }
      .uc-bf-pct {
        flex-basis: 40px;
        font-size: 13px;
        font-weight: 700;
      }
      .uc-bf-col-drain {
        flex-basis: 58px;
      }
      .uc-bf-col-eta {
        flex-basis: 74px;
        font-weight: 600;
      }
      .uc-bf-col-spark {
        flex: 0 0 60px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      .uc-bf-spark {
        display: block;
        overflow: visible;
      }
      .uc-bf-muted {
        opacity: 0.5;
      }

      /* Cards */
      .uc-bf-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
        gap: 10px;
      }
      .uc-bf-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: filter 0.15s ease;
      }
      /* Status tint drawn as a translucent overlay. Appending an alpha suffix to
         the colour string would break the moment it is a CSS variable. */
      .uc-bf-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: 1px solid var(--uc-bf-accent, transparent);
        opacity: 0.45;
        pointer-events: none;
      }
      .uc-bf-card:hover {
        filter: brightness(1.06);
      }
      .uc-bf-card-top {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .uc-bf-ring {
        position: relative;
        width: 64px;
        height: 64px;
      }
      .uc-bf-ring svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .uc-bf-ring-value {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .uc-bf-ring-unit {
        font-size: 10px;
        font-weight: 600;
        margin-left: 1px;
      }
      .uc-bf-card-name {
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.25;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 4px;
      }
      .uc-bf-card-eta {
        font-size: 11.5px;
        font-weight: 600;
        line-height: 1.3;
      }
      .uc-bf-card-rate,
      .uc-bf-card-type {
        font-size: 10.5px;
        line-height: 1.3;
      }
      .uc-bf-card-spark {
        margin-top: 4px;
        height: 20px;
      }

      /* Compact */
      .uc-bf-compact {
        display: flex;
        flex-direction: column;
      }
      .uc-bf-compact-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 2px;
        border-bottom: 1px solid var(--divider-color);
        cursor: pointer;
      }
      .uc-bf-compact-row:last-child {
        border-bottom: none;
      }
      .uc-bf-compact-pct {
        position: relative;
        isolation: isolate;
        flex: 0 0 auto;
        min-width: 40px;
        text-align: center;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11.5px;
        font-weight: 700;
      }
      .uc-bf-compact-pct::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background: var(--uc-bf-accent, transparent);
        opacity: 0.15;
      }
      .uc-bf-compact-name {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-bf-compact-eta {
        flex: 0 0 auto;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }

      /* All-clear */
      .uc-bf-allclear {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 12px;
      }
      .uc-bf-allclear::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: 1px solid var(--uc-bf-accent, transparent);
        opacity: 0.4;
        pointer-events: none;
      }
      .uc-bf-allclear ha-icon {
        --mdc-icon-size: 28px;
        flex-shrink: 0;
      }
      .uc-bf-allclear-title {
        font-size: 14px;
        font-weight: 700;
      }
      .uc-bf-allclear-sub {
        font-size: 12px;
        margin-top: 2px;
      }

      /* Dismiss control */
      .uc-bf-dismiss {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 22px;
        height: 22px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 50%;
        background: var(--card-background-color);
        color: var(--error-color);
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .uc-bf-dismiss ha-icon {
        --mdc-icon-size: 15px;
      }
      .uc-bf-row:hover .uc-bf-dismiss,
      .uc-bf-card:hover .uc-bf-dismiss,
      .uc-bf-compact-row:hover .uc-bf-dismiss,
      .uc-bf-dismiss:focus-visible {
        opacity: 1;
      }
      .uc-bf-dismiss:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }

      /* Loading placeholders */
      .uc-bf-skel {
        display: inline-block;
        height: 9px;
        border-radius: 4px;
        background: linear-gradient(
          90deg,
          rgba(127, 127, 127, 0.14) 25%,
          rgba(127, 127, 127, 0.28) 50%,
          rgba(127, 127, 127, 0.14) 75%
        );
        background-size: 200% 100%;
        animation: uc-bf-shimmer 1.4s ease-in-out infinite;
        vertical-align: middle;
      }
      .uc-bf-skel--sm {
        width: 34px;
      }
      .uc-bf-skel--md {
        width: 52px;
      }
      .uc-bf-loading-text {
        font-style: italic;
        opacity: 0.8;
      }
      @keyframes uc-bf-shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* Narrow screens: drop the two widest optional columns rather than
         squeezing the device name into nothing. */
      @media (max-width: 480px) {
        .uc-bf-root .uc-bf-col-drain,
        .uc-bf-root .uc-bf-col-spark {
          display: none !important;
        }
        .uc-bf-root .uc-bf-col-eta {
          flex-basis: 62px;
          font-size: 11px;
        }
        .uc-bf-root .uc-bf-cards {
          grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
        }
        .uc-bf-root .uc-bf-dismiss {
          opacity: 1;
        }
      }
    `;
  }
}
