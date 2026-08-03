import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  LaundryApplianceConfig,
  LaundryTrackerModule,
  UltraCardConfig,
} from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import {
  ucLaundryTrackerService,
  describeDistribution,
  suggestThresholds,
  DEFAULT_LAUNDRY_RUNNING_STATES,
  LAUNDRY_KIND_DEFAULTS,
  type LaundryAnalysis,
  type LaundryCycle,
  type LaundryStats,
  type LaundryStatus,
} from '../services/uc-laundry-tracker-service';

/** Editor-side row state. Keyed by appliance id, which is globally unique. */
interface EditorState {
  expanded: Set<string>;
  /** Appliance ids whose thresholds were just filled in by the suggest button. */
  suggested: Set<string>;
}

const MINUTE_MS = 60000;
const HOUR_MS = 3600000;
const DAY_MS = 86400000;

const DEFAULT_COLORS = {
  running: 'var(--primary-color)',
  done: 'var(--success-color, #4caf50)',
  idle: 'var(--secondary-text-color)',
  alert: 'var(--error-color)',
  text: 'var(--primary-text-color)',
  secondary: 'var(--secondary-text-color)',
  cardBg: 'var(--card-background-color)',
} as const;

interface Palette {
  running: string;
  done: string;
  idle: string;
  alert: string;
  text: string;
  secondary: string;
  cardBg: string;
}

/**
 * Laundry Tracker (Pro).
 *
 * Infers wash and dry cycles from a plain power sensor, then answers the
 * question a smart appliance never does: is the load still sitting in there?
 */
export class UltraLaundryTrackerModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'laundry_tracker',
    title: 'Laundry Tracker',
    description: 'Detects wash and dry cycles from power sensors and nags about forgotten loads',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:washing-machine',
    category: 'data',
    tags: ['pro', 'premium', 'laundry', 'washer', 'dryer', 'cycle', 'power', 'appliance'],
  };

  private _editor = new Map<string, EditorState>();

  // ── Defaults / validation ──────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): LaundryTrackerModule {
    return {
      id: id || this.generateId('laundry_tracker'),
      type: 'laundry_tracker',
      appliances: [],
      history_days: 7,
      layout: 'stack',
      title: '',
      show_title: true,
      show_status_cards: true,
      show_timeline: true,
      show_history_stats: true,
      show_energy: true,
      show_idle_alert: true,
      show_handoff_hint: true,
      acknowledge_enabled: true,
      energy_rate: 0.15,
      currency_symbol: '$',
      notify_service: '',
      running_color: '',
      done_color: '',
      idle_color: '',
      alert_color: '',
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
    const errors: string[] = [];
    const m = module as LaundryTrackerModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.appliances || m.appliances.length === 0) {
      errors.push('Add at least one washer or dryer');
    } else {
      for (const appliance of m.appliances) {
        if (!appliance.power_entity && !appliance.state_entity) {
          errors.push(`${appliance.name || appliance.kind}: choose a power or state entity`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as LaundryTrackerModule;
    const ids: string[] = [];
    for (const appliance of m.appliances || []) {
      for (const id of [appliance.power_entity, appliance.state_entity, appliance.door_entity]) {
        if (id) ids.push(id);
      }
    }
    return ids;
  }

  // ── Editor state ───────────────────────────────────────────────────────────

  private _ensureEditorState(moduleId: string): EditorState {
    let state = this._editor.get(moduleId);
    if (!state) {
      state = { expanded: new Set<string>(), suggested: new Set<string>() };
      this._editor.set(moduleId, state);
    }
    return state;
  }

  // ── General tab ────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as LaundryTrackerModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.laundry_tracker.pro_description',
          lang,
          'Turn a $15 smart plug into a laundry butler: automatic cycle detection, forgotten-load alerts, and running energy costs.'
        )
      );
    }

    const state = this._ensureEditorState(m.id);
    // Same cache key as the preview, so this reuses the fetch rather than adding one.
    const analysis = ucLaundryTrackerService.analyze(
      hass,
      {
        moduleId: m.id,
        appliances: m.appliances || [],
        historyDays: m.history_days ?? 7,
        energyRate: m.energy_rate ?? 0.15,
        acknowledgeEnabled: m.acknowledge_enabled !== false,
      },
      () => this.triggerPreviewUpdate()
    );

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderAppliancesSection(m, hass, updateModule, lang, state, analysis)}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderHistorySection(m, hass, updateModule, lang)}
        ${this._renderNotifySection(m, hass, updateModule, lang)}
        ${this._renderColorsSection(m, hass, updateModule, lang)}
      </div>
    `;
  }

  // ── General tab: appliances ────────────────────────────────────────────────

  private _renderAppliancesSection(
    m: LaundryTrackerModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    state: EditorState,
    analysis: LaundryAnalysis
  ): TemplateResult {
    const appliances = m.appliances || [];

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.laundry_tracker.appliances_section', lang, 'Appliances')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize(
            'editor.laundry_tracker.appliances_section_desc',
            lang,
            'Add each machine and point it at a power sensor. A smart plug is enough — no smart appliance required.'
          )}
        </div>

        ${appliances.length === 0
          ? html`<div class="uc-lt-editor-empty">
              <ha-icon icon="mdi:washing-machine"></ha-icon>
              <span>
                ${localize(
                  'editor.laundry_tracker.no_appliances_hint',
                  lang,
                  'No machines yet. Add a washer or a dryer to get started.'
                )}
              </span>
            </div>`
          : nothing}
        ${appliances.map((appliance, index) =>
          this._renderApplianceRow(m, appliance, index, hass, updateModule, lang, state, analysis)
        )}

        <div class="uc-lt-add-row">
          <button
            type="button"
            class="uc-lt-add-btn"
            @click=${() => this._addAppliance(m, updateModule, 'washer', lang, state)}
          >
            <ha-icon icon="mdi:washing-machine"></ha-icon>
            ${localize('editor.laundry_tracker.add_washer', lang, 'Add washer')}
          </button>
          <button
            type="button"
            class="uc-lt-add-btn"
            @click=${() => this._addAppliance(m, updateModule, 'dryer', lang, state)}
          >
            <ha-icon icon="mdi:tumble-dryer"></ha-icon>
            ${localize('editor.laundry_tracker.add_dryer', lang, 'Add dryer')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderApplianceRow(
    m: LaundryTrackerModule,
    appliance: LaundryApplianceConfig,
    index: number,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    state: EditorState,
    analysis: LaundryAnalysis
  ): TemplateResult {
    const appliances = m.appliances || [];
    const expanded = state.expanded.has(appliance.id);
    const kind = appliance.kind === 'dryer' ? 'dryer' : 'washer';
    const kindLabel =
      kind === 'dryer'
        ? localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer')
        : localize('editor.laundry_tracker.kind_washer', lang, 'Washer');
    const driver =
      appliance.power_entity ||
      appliance.state_entity ||
      localize('editor.laundry_tracker.row_no_entity', lang, 'No sensor selected');

    return html`
      <div class="uc-lt-row ${expanded ? 'expanded' : ''}">
        <div class="uc-lt-row-head">
          <ha-icon
            class="uc-lt-row-icon"
            icon=${appliance.icon || LAUNDRY_KIND_DEFAULTS[kind].icon}
          ></ha-icon>
          <div class="uc-lt-row-text">
            <div class="uc-lt-row-name">
              ${appliance.name || kindLabel}
              <span class="uc-lt-row-kind">${kindLabel}</span>
            </div>
            <div
              class="uc-lt-row-sub ${appliance.power_entity || appliance.state_entity
                ? ''
                : 'empty'}"
            >
              ${driver}
            </div>
          </div>
          <button
            type="button"
            class="uc-lt-icon-btn"
            ?disabled=${index === 0}
            title=${localize('editor.laundry_tracker.move_up', lang, 'Move up')}
            aria-label=${localize('editor.laundry_tracker.move_up', lang, 'Move up')}
            @click=${() => this._moveAppliance(m, updateModule, index, -1)}
          >
            <ha-icon icon="mdi:chevron-up"></ha-icon>
          </button>
          <button
            type="button"
            class="uc-lt-icon-btn"
            ?disabled=${index === appliances.length - 1}
            title=${localize('editor.laundry_tracker.move_down', lang, 'Move down')}
            aria-label=${localize('editor.laundry_tracker.move_down', lang, 'Move down')}
            @click=${() => this._moveAppliance(m, updateModule, index, 1)}
          >
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          <button
            type="button"
            class="uc-lt-icon-btn"
            title=${localize('editor.laundry_tracker.edit_appliance', lang, 'Edit machine')}
            aria-label=${localize('editor.laundry_tracker.edit_appliance', lang, 'Edit machine')}
            @click=${() => {
              if (state.expanded.has(appliance.id)) state.expanded.delete(appliance.id);
              else state.expanded.add(appliance.id);
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon=${expanded ? 'mdi:chevron-up-circle-outline' : 'mdi:pencil'}></ha-icon>
          </button>
          <button
            type="button"
            class="uc-lt-icon-btn danger"
            title=${localize('editor.laundry_tracker.delete_appliance', lang, 'Remove machine')}
            aria-label=${localize(
              'editor.laundry_tracker.delete_appliance',
              lang,
              'Remove machine'
            )}
            @click=${() => this._removeAppliance(m, updateModule, index, state)}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>

        ${expanded
          ? html`
              <div class="uc-lt-row-body">
                ${this.renderFieldSection(
                  localize('editor.laundry_tracker.appliance_name', lang, 'Name'),
                  localize(
                    'editor.laundry_tracker.appliance_name_desc',
                    lang,
                    'Shown on the status card.'
                  ),
                  hass,
                  { name: appliance.name || '' },
                  [this.textField('name')],
                  (e: CustomEvent) =>
                    this._patchAppliance(m, updateModule, appliance.id, {
                      name: e.detail.value?.name ?? '',
                    })
                )}
                ${this.renderSegmentedField(
                  localize('editor.laundry_tracker.appliance_kind', lang, 'Machine type'),
                  localize(
                    'editor.laundry_tracker.appliance_kind_desc',
                    lang,
                    'Sets the default icon and detection thresholds. Dryers idle higher than washers.'
                  ),
                  kind,
                  [
                    {
                      value: 'washer',
                      label: localize('editor.laundry_tracker.kind_washer', lang, 'Washer'),
                      icon: 'mdi:washing-machine',
                    },
                    {
                      value: 'dryer',
                      label: localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer'),
                      icon: 'mdi:tumble-dryer',
                    },
                  ],
                  (next: string) => this._changeKind(m, updateModule, appliance, next, lang),
                  2
                )}
                ${this.renderIconField(
                  localize('editor.laundry_tracker.appliance_icon', lang, 'Icon'),
                  localize(
                    'editor.laundry_tracker.appliance_icon_desc',
                    lang,
                    'Leave blank to use the default for this machine type.'
                  ),
                  hass,
                  appliance.icon || '',
                  (next: string) =>
                    this._patchAppliance(m, updateModule, appliance.id, { icon: next })
                )}
                ${this.renderFieldSection(
                  localize('editor.laundry_tracker.power_entity', lang, 'Power sensor'),
                  localize(
                    'editor.laundry_tracker.power_entity_desc',
                    lang,
                    'Watts reported by a smart plug. This is what cycle detection reads.'
                  ),
                  hass,
                  { power_entity: appliance.power_entity || '' },
                  [{ name: 'power_entity', selector: { entity: { domain: 'sensor' } } }],
                  (e: CustomEvent) =>
                    this._patchAppliance(m, updateModule, appliance.id, {
                      power_entity: e.detail.value?.power_entity ?? '',
                    })
                )}
                ${this._renderThresholdHelper(m, appliance, updateModule, lang, state, analysis)}
                ${this.renderFieldSection(
                  localize('editor.laundry_tracker.door_entity', lang, 'Door / lid sensor'),
                  localize(
                    'editor.laundry_tracker.door_entity_desc',
                    lang,
                    'Optional but the most reliable unload signal there is: opening the door after a cycle clears the alert.'
                  ),
                  hass,
                  { door_entity: appliance.door_entity || '' },
                  [{ name: 'door_entity', selector: { entity: { domain: 'binary_sensor' } } }],
                  (e: CustomEvent) =>
                    this._patchAppliance(m, updateModule, appliance.id, {
                      door_entity: e.detail.value?.door_entity ?? '',
                    })
                )}
                ${this.renderConditionalFieldsGroup(
                  localize('editor.laundry_tracker.advanced_detection', lang, 'Advanced detection'),
                  this._renderAdvancedDetection(m, appliance, hass, updateModule, lang)
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderAdvancedDetection(
    m: LaundryTrackerModule,
    appliance: LaundryApplianceConfig,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const kind = appliance.kind === 'dryer' ? 'dryer' : 'washer';
    const defaults = LAUNDRY_KIND_DEFAULTS[kind];

    return html`
      ${this.renderFieldSection(
        localize('editor.laundry_tracker.state_entity', lang, 'Machine state entity'),
        localize(
          'editor.laundry_tracker.state_entity_desc',
          lang,
          'Fallback for machines with no power sensor: an entity reporting run/idle from a smart-appliance integration.'
        ),
        hass,
        { state_entity: appliance.state_entity || '' },
        [{ name: 'state_entity', selector: { entity: {} } }],
        (e: CustomEvent) =>
          this._patchAppliance(m, updateModule, appliance.id, {
            state_entity: e.detail.value?.state_entity ?? '',
          })
      )}
      ${this.renderChipListField(
        localize('editor.laundry_tracker.running_states', lang, 'Running states'),
        localize(
          'editor.laundry_tracker.running_states_desc',
          lang,
          'States of the machine state entity that mean "running". Leave empty for a broad default set.'
        ),
        hass,
        appliance.running_states || [],
        (next: string[]) =>
          this._patchAppliance(m, updateModule, appliance.id, { running_states: next }),
        {
          mode: 'free-text',
          placeholder: DEFAULT_LAUNDRY_RUNNING_STATES.join(', '),
        }
      )}
      ${this.renderSliderField(
        localize('editor.laundry_tracker.start_threshold', lang, 'Start threshold'),
        localize(
          'editor.laundry_tracker.start_threshold_desc',
          lang,
          'Watts above which a cycle counts as started.'
        ),
        appliance.start_threshold_w ?? defaults.start_threshold_w,
        defaults.start_threshold_w,
        1,
        500,
        1,
        (value: number) =>
          this._patchAppliance(m, updateModule, appliance.id, { start_threshold_w: value }),
        ' W'
      )}
      ${this.renderSliderField(
        localize('editor.laundry_tracker.stop_threshold', lang, 'Stop threshold'),
        localize(
          'editor.laundry_tracker.stop_threshold_desc',
          lang,
          'Watts below which the machine looks finished. Keep it under the start threshold.'
        ),
        appliance.stop_threshold_w ?? defaults.stop_threshold_w,
        defaults.stop_threshold_w,
        0,
        200,
        1,
        (value: number) =>
          this._patchAppliance(m, updateModule, appliance.id, { stop_threshold_w: value }),
        ' W'
      )}
      ${this.renderSliderField(
        localize('editor.laundry_tracker.settle_minutes', lang, 'Settle time'),
        localize(
          'editor.laundry_tracker.settle_minutes_desc',
          lang,
          'How long the machine must stay quiet before the cycle closes. Stops a soak pause from ending the wash early.'
        ),
        appliance.settle_minutes ?? defaults.settle_minutes,
        defaults.settle_minutes,
        1,
        30,
        1,
        (value: number) =>
          this._patchAppliance(m, updateModule, appliance.id, { settle_minutes: value }),
        ' min'
      )}
      ${this.renderSliderField(
        localize('editor.laundry_tracker.min_cycle_minutes', lang, 'Minimum cycle length'),
        localize(
          'editor.laundry_tracker.min_cycle_minutes_desc',
          lang,
          'Shorter runs are treated as noise rather than a real load.'
        ),
        appliance.min_cycle_minutes ?? defaults.min_cycle_minutes,
        defaults.min_cycle_minutes,
        1,
        120,
        1,
        (value: number) =>
          this._patchAppliance(m, updateModule, appliance.id, { min_cycle_minutes: value }),
        ' min'
      )}
      ${this.renderSliderField(
        localize('editor.laundry_tracker.unload_grace', lang, 'Unload grace period'),
        localize(
          'editor.laundry_tracker.unload_grace_desc',
          lang,
          'How long after a cycle ends before the load counts as forgotten.'
        ),
        appliance.unload_grace_minutes ?? defaults.unload_grace_minutes,
        defaults.unload_grace_minutes,
        5,
        360,
        5,
        (value: number) =>
          this._patchAppliance(m, updateModule, appliance.id, { unload_grace_minutes: value }),
        ' min'
      )}
    `;
  }

  /**
   * Wattage thresholds are the single hardest thing to guess blind, so show the
   * sensor's own numbers and offer to fill them in.
   */
  private _renderThresholdHelper(
    m: LaundryTrackerModule,
    appliance: LaundryApplianceConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    state: EditorState,
    analysis: LaundryAnalysis
  ): TemplateResult | typeof nothing {
    if (!appliance.power_entity) return nothing;

    const series = analysis.series.get(appliance.id) || [];
    const distribution = describeDistribution(series, analysis.windowEndMs);

    if (!distribution || distribution.samples < 3) {
      return html`
        <div class="uc-lt-helper">
          <div class="uc-lt-helper-title">
            <ha-icon icon="mdi:tune-variant"></ha-icon>
            ${localize('editor.laundry_tracker.threshold_helper_title', lang, 'Threshold helper')}
          </div>
          <div class="uc-lt-helper-note">
            ${analysis.loading
              ? localize(
                  'editor.laundry_tracker.threshold_loading',
                  lang,
                  'Reading recent history for this sensor…'
                )
              : localize(
                  'editor.laundry_tracker.threshold_no_data',
                  lang,
                  'No recorder history for this sensor yet. Run a load and come back — the defaults will work in the meantime.'
                )}
          </div>
        </div>
      `;
    }

    const suggestion = suggestThresholds(series, analysis.windowEndMs);
    const justSuggested = state.suggested.has(appliance.id);

    return html`
      <div class="uc-lt-helper">
        <div class="uc-lt-helper-title">
          <ha-icon icon="mdi:tune-variant"></ha-icon>
          ${localize('editor.laundry_tracker.threshold_helper_title', lang, 'Threshold helper')}
        </div>
        <div class="uc-lt-helper-note">
          ${localize(
            'editor.laundry_tracker.threshold_helper_desc',
            lang,
            'What this sensor actually reported over the history window.'
          )}
        </div>
        <div class="uc-lt-helper-grid">
          ${this._renderHelperStat(
            localize('editor.laundry_tracker.threshold_min', lang, 'Min'),
            this._formatWatts(distribution.min)
          )}
          ${this._renderHelperStat(
            localize('editor.laundry_tracker.threshold_floor', lang, 'Standby'),
            this._formatWatts(distribution.floor)
          )}
          ${this._renderHelperStat(
            localize('editor.laundry_tracker.threshold_median', lang, 'Median'),
            this._formatWatts(distribution.median)
          )}
          ${this._renderHelperStat(
            localize('editor.laundry_tracker.threshold_max', lang, 'Max'),
            this._formatWatts(distribution.max)
          )}
        </div>
        ${suggestion
          ? html`
              <button
                type="button"
                class="uc-lt-suggest-btn"
                @click=${() => {
                  this._patchAppliance(m, updateModule, appliance.id, {
                    start_threshold_w: suggestion.startW,
                    stop_threshold_w: suggestion.stopW,
                  });
                  state.suggested.add(appliance.id);
                  this.triggerPreviewUpdate(true);
                }}
              >
                <ha-icon icon="mdi:auto-fix"></ha-icon>
                ${localize('editor.laundry_tracker.suggest_thresholds', lang, 'Suggest thresholds')}
              </button>
              <div class="uc-lt-helper-note">
                ${justSuggested
                  ? localize(
                      'editor.laundry_tracker.suggested_applied',
                      lang,
                      'Applied. Fine-tune them under Advanced detection if a cycle is missed.'
                    )
                  : this._formatTemplate(
                      localize(
                        'editor.laundry_tracker.suggest_preview',
                        lang,
                        'Suggestion: start {start} W, stop {stop} W.'
                      ),
                      { start: String(suggestion.startW), stop: String(suggestion.stopW) }
                    )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderHelperStat(label: string, value: string): TemplateResult {
    return html`
      <div class="uc-lt-helper-stat">
        <div class="uc-lt-helper-stat-label">${label}</div>
        <div class="uc-lt-helper-stat-value">${value}</div>
      </div>
    `;
  }

  // ── General tab: remaining sections ────────────────────────────────────────

  private _renderDisplaySection(
    m: LaundryTrackerModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.laundry_tracker.display_section', lang, 'Display')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize(
            'editor.laundry_tracker.display_section_desc',
            lang,
            'Choose which parts of the card are shown.'
          )}
        </div>

        ${this.renderSegmentedField(
          localize('editor.laundry_tracker.layout', lang, 'Layout'),
          localize(
            'editor.laundry_tracker.layout_desc',
            lang,
            'Stack the machines vertically, or sit them side by side.'
          ),
          m.layout || 'stack',
          [
            {
              value: 'stack',
              label: localize('editor.laundry_tracker.layout_stack', lang, 'Stack'),
              icon: 'mdi:view-sequential',
            },
            {
              value: 'row',
              label: localize('editor.laundry_tracker.layout_row', lang, 'Row'),
              icon: 'mdi:view-column',
            },
          ],
          (next: string) => {
            updateModule({ layout: next === 'row' ? 'row' : 'stack' } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          2
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.laundry_tracker.show_status_cards', lang, 'Show status cards'),
            description: localize(
              'editor.laundry_tracker.show_status_cards_desc',
              lang,
              'One card per machine with its current phase.'
            ),
            hass,
            data: { show_status_cards: m.show_status_cards !== false },
            schema: [this.booleanField('show_status_cards')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_status_cards: e.detail.value?.show_status_cards !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize(
              'editor.laundry_tracker.show_idle_alert',
              lang,
              'Show forgotten-load alert'
            ),
            description: localize(
              'editor.laundry_tracker.show_idle_alert_desc',
              lang,
              'The loud banner when a finished load is still sitting in the machine.'
            ),
            hass,
            data: { show_idle_alert: m.show_idle_alert !== false },
            schema: [this.booleanField('show_idle_alert')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_idle_alert: e.detail.value?.show_idle_alert !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize(
              'editor.laundry_tracker.show_handoff_hint',
              lang,
              'Show washer → dryer hint'
            ),
            description: localize(
              'editor.laundry_tracker.show_handoff_hint_desc',
              lang,
              'Suggests moving the load when a wash finishes and a dryer is free.'
            ),
            hass,
            data: { show_handoff_hint: m.show_handoff_hint !== false },
            schema: [this.booleanField('show_handoff_hint')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_handoff_hint: e.detail.value?.show_handoff_hint !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.laundry_tracker.acknowledge_enabled', lang, 'Allow "Unloaded"'),
            description: localize(
              'editor.laundry_tracker.acknowledge_enabled_desc',
              lang,
              'Adds a button to clear an alert by hand. Resets when the browser reloads.'
            ),
            hass,
            data: { acknowledge_enabled: m.acknowledge_enabled !== false },
            schema: [this.booleanField('acknowledge_enabled')],
            onChange: (e: CustomEvent) => {
              updateModule({
                acknowledge_enabled: e.detail.value?.acknowledge_enabled !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.laundry_tracker.show_timeline', lang, 'Show timeline'),
            description: localize(
              'editor.laundry_tracker.show_timeline_desc',
              lang,
              'A strip of the history window with one lane per machine.'
            ),
            hass,
            data: { show_timeline: m.show_timeline !== false },
            schema: [this.booleanField('show_timeline')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_timeline: e.detail.value?.show_timeline !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize(
              'editor.laundry_tracker.show_history_stats',
              lang,
              'Show history stats'
            ),
            description: localize(
              'editor.laundry_tracker.show_history_stats_desc',
              lang,
              'Cycle count, energy, cost and average duration for the window.'
            ),
            hass,
            data: { show_history_stats: m.show_history_stats !== false },
            schema: [this.booleanField('show_history_stats')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_history_stats: e.detail.value?.show_history_stats !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.laundry_tracker.show_energy', lang, 'Show energy and cost'),
            description: localize(
              'editor.laundry_tracker.show_energy_desc',
              lang,
              'Turn off to hide kWh and money figures everywhere on the card.'
            ),
            hass,
            data: { show_energy: m.show_energy !== false },
            schema: [this.booleanField('show_energy')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_energy: e.detail.value?.show_energy !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.laundry_tracker.show_title', lang, 'Show title'),
            description: localize(
              'editor.laundry_tracker.show_title_desc',
              lang,
              'Display a heading above the machines.'
            ),
            hass,
            data: { show_title: m.show_title !== false },
            schema: [this.booleanField('show_title')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_title: e.detail.value?.show_title !== false,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
        ])}
        ${this.renderFieldSection(
          localize('editor.laundry_tracker.title', lang, 'Title'),
          localize('editor.laundry_tracker.title_desc', lang, 'Leave blank to use "Laundry".'),
          hass,
          { title: m.title || '' },
          [this.textField('title')],
          (e: CustomEvent) => {
            updateModule({ title: e.detail.value?.title ?? '' } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  private _renderHistorySection(
    m: LaundryTrackerModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.laundry_tracker.history_section', lang, 'History & cost')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize(
            'editor.laundry_tracker.history_section_desc',
            lang,
            'How far back to read the recorder, and what a kilowatt-hour costs you.'
          )}
        </div>

        ${this.renderSliderField(
          localize('editor.laundry_tracker.history_days', lang, 'History window'),
          localize(
            'editor.laundry_tracker.history_days_desc',
            lang,
            'Longer windows give better averages but ask more of the recorder.'
          ),
          m.history_days ?? 7,
          7,
          1,
          30,
          1,
          (value: number) => {
            updateModule({ history_days: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ' d'
        )}
        ${this.renderFieldSection(
          localize('editor.laundry_tracker.energy_rate', lang, 'Energy rate'),
          localize(
            'editor.laundry_tracker.energy_rate_desc',
            lang,
            'Cost per kWh used for the cycle cost estimate.'
          ),
          hass,
          { energy_rate: m.energy_rate ?? 0.15 },
          [this.numberField('energy_rate', 0, 10, 0.01)],
          (e: CustomEvent) => {
            const raw = Number(e.detail.value?.energy_rate);
            updateModule({
              energy_rate: Number.isFinite(raw) ? raw : 0.15,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.laundry_tracker.currency_symbol', lang, 'Currency symbol'),
          localize(
            'editor.laundry_tracker.currency_symbol_desc',
            lang,
            'Prefixed to every cost figure.'
          ),
          hass,
          { currency_symbol: m.currency_symbol ?? '$' },
          [this.textField('currency_symbol')],
          (e: CustomEvent) => {
            updateModule({
              currency_symbol: e.detail.value?.currency_symbol ?? '$',
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  private _renderNotifySection(
    m: LaundryTrackerModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.laundry_tracker.notify_section', lang, 'Notifications')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize(
            'editor.laundry_tracker.notify_section_desc',
            lang,
            'Optional push when a load is left sitting past its grace period.'
          )}
        </div>

        ${this.renderFieldSection(
          localize('editor.laundry_tracker.notify_service', lang, 'Notify service'),
          localize(
            'editor.laundry_tracker.notify_service_desc',
            lang,
            'For example notify.mobile_app_pixel. Leave blank to turn notifications off.'
          ),
          hass,
          { notify_service: m.notify_service || '' },
          [this.textField('notify_service')],
          (e: CustomEvent) => {
            updateModule({
              notify_service: (e.detail.value?.notify_service ?? '').trim(),
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}

        <div class="uc-lt-note">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>
            ${localize(
              'editor.laundry_tracker.notify_once_note',
              lang,
              'Fires at most once per load. A second nag only happens after the next cycle finishes.'
            )}
          </span>
        </div>
      </div>
    `;
  }

  private _renderColorsSection(
    m: LaundryTrackerModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const fields: Array<[keyof LaundryTrackerModule, string, string, string]> = [
      [
        'running_color',
        localize('editor.laundry_tracker.color_running', lang, 'Running'),
        DEFAULT_COLORS.running,
        localize('editor.laundry_tracker.color_running_desc', lang, 'A cycle is in progress.'),
      ],
      [
        'done_color',
        localize('editor.laundry_tracker.color_done', lang, 'Finished'),
        DEFAULT_COLORS.done,
        localize('editor.laundry_tracker.color_done_desc', lang, 'A cycle just ended.'),
      ],
      [
        'idle_color',
        localize('editor.laundry_tracker.color_idle', lang, 'Idle'),
        DEFAULT_COLORS.idle,
        localize('editor.laundry_tracker.color_idle_desc', lang, 'Nothing happening.'),
      ],
      [
        'alert_color',
        localize('editor.laundry_tracker.color_alert', lang, 'Forgotten'),
        DEFAULT_COLORS.alert,
        localize('editor.laundry_tracker.color_alert_desc', lang, 'A load is still sitting there.'),
      ],
      [
        'text_color',
        localize('editor.laundry_tracker.color_text', lang, 'Text'),
        DEFAULT_COLORS.text,
        localize('editor.laundry_tracker.color_text_desc', lang, 'Primary text.'),
      ],
      [
        'secondary_text_color',
        localize('editor.laundry_tracker.color_secondary', lang, 'Secondary text'),
        DEFAULT_COLORS.secondary,
        localize('editor.laundry_tracker.color_secondary_desc', lang, 'Supporting detail text.'),
      ],
      [
        'card_background_color',
        localize('editor.laundry_tracker.color_card_bg', lang, 'Card background'),
        DEFAULT_COLORS.cardBg,
        localize('editor.laundry_tracker.color_card_bg_desc', lang, 'Behind each status card.'),
      ],
    ];

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.laundry_tracker.colors_section', lang, 'Colors')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize(
            'editor.laundry_tracker.colors_section_desc',
            lang,
            'Leave any of these blank to follow the Home Assistant theme.'
          )}
        </div>
        ${fields.map(([key, label, fallback, description]) =>
          this.renderColorField(
            label,
            description,
            hass,
            (m as unknown as Record<string, string | undefined>)[key as string] || '',
            fallback,
            (next: string) => {
              updateModule({ [key]: next } as unknown as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )
        )}
      </div>
    `;
  }

  // ── Appliance list mutations ───────────────────────────────────────────────

  private _addAppliance(
    m: LaundryTrackerModule,
    updateModule: (updates: Partial<CardModule>) => void,
    kind: 'washer' | 'dryer',
    lang: string,
    state: EditorState
  ): void {
    const defaults = LAUNDRY_KIND_DEFAULTS[kind];
    const existing = (m.appliances || []).filter(a => a.kind === kind).length;
    const baseName =
      kind === 'dryer'
        ? localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer')
        : localize('editor.laundry_tracker.kind_washer', lang, 'Washer');

    const appliance: LaundryApplianceConfig = {
      id: this.generateId(`laundry_${kind}`),
      kind,
      name: existing > 0 ? `${baseName} ${existing + 1}` : baseName,
      icon: defaults.icon,
      power_entity: '',
      state_entity: '',
      running_states: [],
      door_entity: '',
      start_threshold_w: defaults.start_threshold_w,
      stop_threshold_w: defaults.stop_threshold_w,
      settle_minutes: defaults.settle_minutes,
      min_cycle_minutes: defaults.min_cycle_minutes,
      unload_grace_minutes: defaults.unload_grace_minutes,
    };

    updateModule({ appliances: [...(m.appliances || []), appliance] } as Partial<CardModule>);
    state.expanded.add(appliance.id);
    this.triggerPreviewUpdate(true);
  }

  private _patchAppliance(
    m: LaundryTrackerModule,
    updateModule: (updates: Partial<CardModule>) => void,
    applianceId: string,
    patch: Partial<LaundryApplianceConfig>
  ): void {
    const appliances = (m.appliances || []).map(appliance =>
      appliance.id === applianceId ? { ...appliance, ...patch } : appliance
    );
    updateModule({ appliances } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _removeAppliance(
    m: LaundryTrackerModule,
    updateModule: (updates: Partial<CardModule>) => void,
    index: number,
    state: EditorState
  ): void {
    const appliances = [...(m.appliances || [])];
    const [removed] = appliances.splice(index, 1);
    if (removed) {
      state.expanded.delete(removed.id);
      state.suggested.delete(removed.id);
    }
    updateModule({ appliances } as Partial<CardModule>);
    this.triggerPreviewUpdate(true);
  }

  private _moveAppliance(
    m: LaundryTrackerModule,
    updateModule: (updates: Partial<CardModule>) => void,
    index: number,
    delta: number
  ): void {
    const appliances = [...(m.appliances || [])];
    const target = index + delta;
    if (target < 0 || target >= appliances.length) return;
    const moved = appliances[index];
    const other = appliances[target];
    if (!moved || !other) return;
    appliances[index] = other;
    appliances[target] = moved;
    updateModule({ appliances } as Partial<CardModule>);
    this.triggerPreviewUpdate(true);
  }

  /** Switching type swaps the icon only when the user hasn't picked their own. */
  private _changeKind(
    m: LaundryTrackerModule,
    updateModule: (updates: Partial<CardModule>) => void,
    appliance: LaundryApplianceConfig,
    next: string,
    lang: string
  ): void {
    const kind: 'washer' | 'dryer' = next === 'dryer' ? 'dryer' : 'washer';
    if (kind === appliance.kind) return;
    const previous = LAUNDRY_KIND_DEFAULTS[appliance.kind === 'dryer' ? 'dryer' : 'washer'];
    const defaults = LAUNDRY_KIND_DEFAULTS[kind];

    const patch: Partial<LaundryApplianceConfig> = { kind };
    if (!appliance.icon || appliance.icon === previous.icon) {
      patch.icon = defaults.icon;
    }
    const previousName =
      appliance.kind === 'dryer'
        ? localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer')
        : localize('editor.laundry_tracker.kind_washer', lang, 'Washer');
    if (!appliance.name || appliance.name === previousName) {
      patch.name =
        kind === 'dryer'
          ? localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer')
          : localize('editor.laundry_tracker.kind_washer', lang, 'Washer');
    }
    // Only carry over tuning the user never touched.
    if (appliance.start_threshold_w === previous.start_threshold_w) {
      patch.start_threshold_w = defaults.start_threshold_w;
    }
    if (appliance.stop_threshold_w === previous.stop_threshold_w) {
      patch.stop_threshold_w = defaults.stop_threshold_w;
    }
    if (appliance.unload_grace_minutes === previous.unload_grace_minutes) {
      patch.unload_grace_minutes = defaults.unload_grace_minutes;
    }

    this._patchAppliance(m, updateModule, appliance.id, patch);
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as LaundryTrackerModule;
    const lang = hass?.locale?.language || 'en';
    const appliances = (m.appliances || []).filter(a => !!a && !!a.id);

    if (appliances.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.laundry_tracker.empty_title', lang, 'Add a washer or dryer'),
        localize(
          'editor.laundry_tracker.empty_desc',
          lang,
          'Open the General tab and point a machine at its power sensor.'
        ),
        'mdi:washing-machine'
      );
    }

    const analysis = ucLaundryTrackerService.analyze(
      hass,
      {
        moduleId: m.id,
        appliances,
        historyDays: m.history_days ?? 7,
        energyRate: m.energy_rate ?? 0.15,
        acknowledgeEnabled: m.acknowledge_enabled !== false,
      },
      () => this.triggerPreviewUpdate()
    );

    // Editor previews must never be able to send a push notification, and the
    // dispatch is deferred so nothing leaves the browser during a render pass.
    const liveCard = previewContext !== 'live' && previewContext !== 'ha-preview';
    if (liveCard) {
      setTimeout(() => this._dispatchNotifications(m, hass, analysis, lang), 0);
    }

    const palette = this._palette(m);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const title =
      m.title?.trim() || localize('editor.laundry_tracker.default_title', lang, 'Laundry');

    const body = html`
      ${m.show_title !== false
        ? html`<div class="uc-lt-title" style="color:${palette.text};">
            <ha-icon icon="mdi:washing-machine"></ha-icon>
            <span>${title}</span>
          </div>`
        : nothing}
      ${m.show_status_cards !== false
        ? html`<div class="uc-lt-cards ${m.layout === 'row' ? 'row' : 'stack'}">
            ${analysis.statuses.map(status =>
              this._renderStatusCard(m, status, hass, palette, lang, analysis)
            )}
          </div>`
        : nothing}
      ${this._renderHandoffHint(m, analysis, palette, lang)}
      ${m.show_timeline !== false ? this._renderTimeline(m, analysis, palette, lang) : nothing}
      ${m.show_history_stats !== false ? this._renderStats(m, analysis, palette, lang) : nothing}
      ${analysis.error
        ? html`<div class="uc-lt-error" style="color:${palette.secondary};">
            <ha-icon icon="mdi:database-alert-outline"></ha-icon>
            <span>
              ${localize(
                'editor.laundry_tracker.history_error',
                lang,
                'Could not read recorder history. Live wattage still works.'
              )}
            </span>
          </div>`
        : nothing}
    `;

    // The "Unloaded" button is excluded so acknowledging never fires a tap action.
    const gestures = this.createGestureHandlers(
      `laundry-${m.id}`,
      {
        tap_action: m.tap_action,
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        module: m,
      },
      hass,
      config,
      ['.uc-lt-action-btn']
    );

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="uc-lt-wrapper ${hoverClass}"
        style="${designStyles}"
        @pointerdown=${gestures.onPointerDown}
        @pointermove=${gestures.onPointerMove}
        @pointerup=${gestures.onPointerUp}
        @pointerleave=${gestures.onPointerLeave}
        @pointercancel=${gestures.onPointerCancel}
      >
        ${this.wrapWithAnimation(body, module, hass)}
      </div>
    `;
  }

  // ── Preview: status card ───────────────────────────────────────────────────

  private _renderStatusCard(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    hass: HomeAssistant,
    palette: Palette,
    lang: string,
    analysis: LaundryAnalysis
  ): TemplateResult {
    const appliance = status.appliance;
    const kind = appliance.kind === 'dryer' ? 'dryer' : 'washer';
    const icon = appliance.icon || LAUNDRY_KIND_DEFAULTS[kind].icon;
    const name =
      appliance.name?.trim() ||
      (kind === 'dryer'
        ? localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer')
        : localize('editor.laundry_tracker.kind_washer', lang, 'Washer'));

    const forgotten = status.phase === 'forgotten' && m.show_idle_alert !== false;
    const accent = this._phaseColor(status.phase, palette, m.show_idle_alert !== false);
    const cardStyle = [
      `background:${palette.cardBg}`,
      `border-left:4px solid ${accent}`,
      forgotten ? `box-shadow: 0 0 0 1px ${accent}55` : '',
    ]
      .filter(Boolean)
      .join(';');

    return html`
      <div class="uc-lt-card ${forgotten ? 'alarm' : ''}" style="${cardStyle}">
        <div class="uc-lt-card-head">
          <ha-icon
            class="uc-lt-card-icon ${status.phase === 'running' ? 'spin-pulse' : ''} ${forgotten
              ? 'alert-pulse'
              : ''}"
            icon=${icon}
            style="color:${accent};"
          ></ha-icon>
          <div class="uc-lt-card-title">
            <div class="uc-lt-card-name" style="color:${palette.text};">${name}</div>
            <div class="uc-lt-card-phase" style="color:${accent};">
              ${this._phaseLabel(status, m, lang)}
            </div>
          </div>
          ${status.doorOpen
            ? html`<span
                class="uc-lt-door"
                style="color:${palette.secondary};"
                title=${localize('editor.laundry_tracker.door_open', lang, 'Door open')}
              >
                <ha-icon icon="mdi:door-open"></ha-icon>
              </span>`
            : nothing}
        </div>

        <div class="uc-lt-card-body">
          ${this._renderPhaseDetail(m, status, palette, lang, accent, analysis)}
        </div>

        ${this._renderCardActions(m, status, hass, palette, lang)}
      </div>
    `;
  }

  private _renderPhaseDetail(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    palette: Palette,
    lang: string,
    accent: string,
    analysis: LaundryAnalysis
  ): TemplateResult {
    switch (status.phase) {
      case 'running':
        return this._renderRunningDetail(m, status, palette, lang, accent);
      case 'finished':
        return this._renderFinishedDetail(m, status, palette, lang);
      case 'forgotten':
        return m.show_idle_alert !== false
          ? this._renderForgottenDetail(m, status, palette, lang, accent)
          : this._renderFinishedDetail(m, status, palette, lang);
      case 'unknown':
        return html`
          <div class="uc-lt-line" style="color:${palette.secondary};">
            ${localize(
              'editor.laundry_tracker.no_source',
              lang,
              'No power or state sensor selected for this machine.'
            )}
          </div>
        `;
      case 'idle':
      default:
        return this._renderIdleDetail(m, status, palette, lang, analysis);
    }
  }

  private _renderRunningDetail(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    palette: Palette,
    lang: string,
    accent: string
  ): TemplateResult {
    const now = Date.now();
    const elapsedMs = status.sinceMs ? Math.max(0, now - status.sinceMs) : null;
    const typical = this._typicalDurationMs(status);
    const remainingMs =
      typical && elapsedMs !== null ? Math.round(typical.medianMs - elapsedMs) : null;
    const progress =
      typical && elapsedMs !== null
        ? Math.max(0.02, Math.min(0.97, elapsedMs / Math.max(typical.medianMs, 1)))
        : null;

    return html`
      <div class="uc-lt-metrics">
        ${status.currentW !== null
          ? html`<span class="uc-lt-metric" style="color:${palette.text};">
              <strong>${this._formatWatts(status.currentW)}</strong>
            </span>`
          : nothing}
        ${elapsedMs !== null
          ? html`<span class="uc-lt-metric" style="color:${palette.secondary};">
              ${this._formatTemplate(
                localize('editor.laundry_tracker.running_for', lang, 'running for {time}'),
                { time: this._formatDuration(elapsedMs, lang) }
              )}
            </span>`
          : nothing}
      </div>
      ${progress !== null
        ? html`<div class="uc-lt-progress" style="background:${accent}22;">
            <div
              class="uc-lt-progress-fill"
              style="width:${(progress * 100).toFixed(1)}%;background:${accent};"
            ></div>
          </div>`
        : nothing}
      ${typical && remainingMs !== null && remainingMs > MINUTE_MS
        ? html`<div class="uc-lt-line" style="color:${palette.secondary};">
            ${this._formatTemplate(
              localize(
                'editor.laundry_tracker.est_finish',
                lang,
                'about {time} left, based on your last {count} cycles'
              ),
              { time: this._formatDuration(remainingMs, lang), count: String(typical.count) }
            )}
          </div>`
        : typical
          ? html`<div class="uc-lt-line" style="color:${palette.secondary};">
              ${localize(
                'editor.laundry_tracker.est_finish_soon',
                lang,
                'should finish any minute now'
              )}
            </div>`
          : html`<div class="uc-lt-line" style="color:${palette.secondary};">
              ${localize(
                'editor.laundry_tracker.est_finish_unknown',
                lang,
                'not enough past cycles to estimate a finish time yet'
              )}
            </div>`}
    `;
  }

  private _renderFinishedDetail(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    palette: Palette,
    lang: string
  ): TemplateResult {
    const sitting = status.sittingMs ?? 0;
    return html`
      <div class="uc-lt-headline" style="color:${palette.text};">
        ${this._formatTemplate(
          localize('editor.laundry_tracker.done_ago', lang, 'Done {time} ago'),
          { time: this._formatDuration(sitting, lang) }
        )}
      </div>
      ${status.lastCycle
        ? html`<div class="uc-lt-line" style="color:${palette.secondary};">
            ${this._cycleSummary(m, status.lastCycle, lang)}
          </div>`
        : nothing}
    `;
  }

  private _renderForgottenDetail(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    palette: Palette,
    lang: string,
    accent: string
  ): TemplateResult {
    const sitting = status.sittingMs ?? 0;
    return html`
      <div class="uc-lt-alarm-headline" style="color:${accent};">
        ${this._formatTemplate(
          localize('editor.laundry_tracker.sitting_for', lang, 'Sitting for {time}'),
          { time: this._formatDuration(sitting, lang) }
        )}
      </div>
      <div class="uc-lt-line strong" style="color:${palette.text};">
        ${status.appliance.kind === 'dryer'
          ? localize(
              'editor.laundry_tracker.forgotten_dryer',
              lang,
              'The dry load is still in the drum.'
            )
          : localize(
              'editor.laundry_tracker.forgotten_washer',
              lang,
              'The wet load is still in the drum.'
            )}
      </div>
      ${status.lastCycle
        ? html`<div class="uc-lt-line" style="color:${palette.secondary};">
            ${this._cycleSummary(m, status.lastCycle, lang)}
          </div>`
        : nothing}
    `;
  }

  private _renderIdleDetail(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    palette: Palette,
    lang: string,
    analysis: LaundryAnalysis
  ): TemplateResult {
    const learning =
      status.source === 'power' && status.cycles.length === 0 && status.historyPoints < 5;

    if (learning) {
      return html`
        <div class="uc-lt-line" style="color:${palette.secondary};">
          ${analysis.loading
            ? localize('editor.laundry_tracker.loading_history', lang, 'Reading cycle history…')
            : localize(
                'editor.laundry_tracker.learning',
                lang,
                'Learning your cycles — no completed loads recorded yet.'
              )}
        </div>
        ${status.currentW !== null
          ? html`<div class="uc-lt-line" style="color:${palette.secondary};">
              ${this._formatTemplate(
                localize('editor.laundry_tracker.drawing_now', lang, 'Drawing {watts} right now'),
                { watts: this._formatWatts(status.currentW) }
              )}
            </div>`
          : nothing}
      `;
    }

    if (!status.lastCycle) {
      return html`
        <div class="uc-lt-line" style="color:${palette.secondary};">
          ${this._formatTemplate(
            localize(
              'editor.laundry_tracker.no_cycles_window',
              lang,
              'No cycles in the last {days} days'
            ),
            { days: String(m.history_days ?? 7) }
          )}
        </div>
      `;
    }

    const ago = Math.max(0, Date.now() - status.lastCycle.endMs);
    return html`
      <div class="uc-lt-line" style="color:${palette.text};">
        ${this._formatTemplate(
          localize('editor.laundry_tracker.last_cycle_ago', lang, 'Last cycle {time} ago'),
          { time: this._formatDuration(ago, lang) }
        )}
        ${status.retrievedByDoor
          ? html`<span
              class="uc-lt-badge"
              style="color:${palette.done};border-color:${palette.done}55;"
            >
              ${localize('editor.laundry_tracker.emptied', lang, 'emptied')}
            </span>`
          : status.acknowledged
            ? html`<span
                class="uc-lt-badge"
                style="color:${palette.done};border-color:${palette.done}55;"
              >
                ${localize('editor.laundry_tracker.unloaded_badge', lang, 'unloaded')}
              </span>`
            : nothing}
      </div>
      <div class="uc-lt-line" style="color:${palette.secondary};">
        ${this._cycleSummary(m, status.lastCycle, lang)}
      </div>
    `;
  }

  private _renderCardActions(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    hass: HomeAssistant,
    palette: Palette,
    lang: string
  ): TemplateResult | typeof nothing {
    if (m.acknowledge_enabled === false) return nothing;
    if (status.phase !== 'finished' && status.phase !== 'forgotten') return nothing;
    const cycle = status.lastCycle;
    if (!cycle) return nothing;

    const accent = this._phaseColor(status.phase, palette, m.show_idle_alert !== false);
    return html`
      <div class="uc-lt-card-actions">
        <button
          type="button"
          class="uc-lt-action-btn"
          style="border-color:${accent}66;color:${accent};"
          @click=${(e: Event) => {
            e.stopPropagation();
            ucLaundryTrackerService.acknowledge(status.appliance.id, cycle.endMs);
            this.triggerPreviewUpdate(true);
          }}
        >
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          ${localize('editor.laundry_tracker.unloaded_button', lang, 'Unloaded')}
        </button>
      </div>
    `;
  }

  // ── Preview: handoff, timeline, stats ──────────────────────────────────────

  private _renderHandoffHint(
    m: LaundryTrackerModule,
    analysis: LaundryAnalysis,
    palette: Palette,
    lang: string
  ): TemplateResult | typeof nothing {
    if (m.show_handoff_hint === false) return nothing;

    const washer = analysis.statuses.find(
      s => s.appliance.kind === 'washer' && (s.phase === 'finished' || s.phase === 'forgotten')
    );
    if (!washer) return nothing;
    const dryer = analysis.statuses.find(
      s => s.appliance.kind === 'dryer' && s.phase === 'idle' && s.source !== 'none'
    );
    if (!dryer) return nothing;

    const washerName =
      washer.appliance.name?.trim() ||
      localize('editor.laundry_tracker.kind_washer', lang, 'Washer');
    const dryerName =
      dryer.appliance.name?.trim() || localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer');

    return html`
      <div
        class="uc-lt-handoff"
        style="border-color:${palette.done}55;background:${palette.done}14;"
      >
        <ha-icon
          icon="mdi:arrow-right-bold-circle-outline"
          style="color:${palette.done};"
        ></ha-icon>
        <div style="min-width:0;">
          <div class="uc-lt-handoff-title" style="color:${palette.text};">
            ${localize('editor.laundry_tracker.handoff_title', lang, 'Move to dryer')}
          </div>
          <div class="uc-lt-handoff-sub" style="color:${palette.secondary};">
            ${this._formatTemplate(
              localize(
                'editor.laundry_tracker.handoff_sub',
                lang,
                '{washer} is done and {dryer} is free'
              ),
              { washer: washerName, dryer: dryerName }
            )}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Compact history strip: one lane per machine, one block per cycle. Positioned
   * divs rather than SVG so it reflows at phone width without shrinking blocks
   * into invisibility.
   */
  private _renderTimeline(
    m: LaundryTrackerModule,
    analysis: LaundryAnalysis,
    palette: Palette,
    lang: string
  ): TemplateResult | typeof nothing {
    const spanMs = Math.max(1, analysis.windowEndMs - analysis.windowStartMs);
    const days = Math.max(1, Math.round(spanMs / DAY_MS));
    const hasAnyCycle = analysis.statuses.some(s => s.cycles.length > 0 || s.phase === 'running');

    const ticks = this._timelineTicks(analysis.windowStartMs, analysis.windowEndMs, days);

    return html`
      <div class="uc-lt-timeline">
        <div class="uc-lt-section-title" style="color:${palette.secondary};">
          ${this._formatTemplate(
            localize('editor.laundry_tracker.timeline_title', lang, 'Last {days} days'),
            { days: String(days) }
          )}
        </div>
        ${hasAnyCycle
          ? html`
              ${analysis.statuses.map(status =>
                this._renderTimelineLane(m, status, analysis, palette, lang, ticks)
              )}
              <div class="uc-lt-axis">
                <div class="uc-lt-axis-spacer"></div>
                <div class="uc-lt-axis-track">
                  ${ticks
                    .filter(tick => tick.label)
                    .map(
                      tick =>
                        html`<span
                          class="uc-lt-axis-label"
                          style="left:${tick.pct.toFixed(2)}%;color:${palette.secondary};"
                          >${tick.label}</span
                        >`
                    )}
                </div>
              </div>
            `
          : html`<div class="uc-lt-line" style="color:${palette.secondary};">
              ${analysis.loading
                ? localize('editor.laundry_tracker.loading_history', lang, 'Reading cycle history…')
                : localize(
                    'editor.laundry_tracker.timeline_empty',
                    lang,
                    'No cycles recorded in this window yet.'
                  )}
            </div>`}
      </div>
    `;
  }

  private _renderTimelineLane(
    m: LaundryTrackerModule,
    status: LaundryStatus,
    analysis: LaundryAnalysis,
    palette: Palette,
    lang: string,
    ticks: Array<{ pct: number; label: string }>
  ): TemplateResult {
    const spanMs = Math.max(1, analysis.windowEndMs - analysis.windowStartMs);
    const kind = status.appliance.kind === 'dryer' ? 'dryer' : 'washer';
    const name =
      status.appliance.name?.trim() ||
      (kind === 'dryer'
        ? localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer')
        : localize('editor.laundry_tracker.kind_washer', lang, 'Washer'));

    const toPct = (ms: number): number =>
      Math.max(0, Math.min(100, ((ms - analysis.windowStartMs) / spanMs) * 100));

    const blocks = status.cycles.map(cycle => ({
      left: toPct(cycle.startMs),
      right: toPct(cycle.endMs),
      color: palette.done,
      title: this._cycleTooltip(m, name, cycle, lang),
    }));

    if (status.phase === 'running' && status.sinceMs) {
      blocks.push({
        left: toPct(status.sinceMs),
        right: toPct(analysis.windowEndMs),
        color: palette.running,
        title: `${name} · ${localize('editor.laundry_tracker.phase_running', lang, 'Running')}`,
      });
    }

    return html`
      <div class="uc-lt-lane-row">
        <div class="uc-lt-lane-label" style="color:${palette.secondary};" title=${name}>
          <ha-icon icon=${status.appliance.icon || LAUNDRY_KIND_DEFAULTS[kind].icon}></ha-icon>
          <span>${name}</span>
        </div>
        <div class="uc-lt-lane">
          ${ticks.map(
            tick => html`<span class="uc-lt-gridline" style="left:${tick.pct.toFixed(2)}%;"></span>`
          )}
          ${blocks.map(
            block =>
              html`<span
                class="uc-lt-block"
                style="left:${block.left.toFixed(2)}%;width:${Math.max(
                  0.4,
                  block.right - block.left
                ).toFixed(2)}%;background:${block.color};"
                title=${block.title}
              ></span>`
          )}
        </div>
      </div>
    `;
  }

  /** At most seven labels, so the axis stays legible on a phone. */
  private _timelineTicks(
    startMs: number,
    endMs: number,
    days: number
  ): Array<{ pct: number; label: string }> {
    const spanMs = Math.max(1, endMs - startMs);
    const labelStep = Math.ceil(days / 7);
    const ticks: Array<{ pct: number; label: string }> = [];

    const firstMidnight = new Date(startMs);
    firstMidnight.setHours(24, 0, 0, 0);

    let index = 0;
    for (let t = firstMidnight.getTime(); t <= endMs; t += DAY_MS) {
      const pct = ((t - startMs) / spanMs) * 100;
      const showLabel = index % labelStep === 0;
      ticks.push({ pct, label: showLabel ? this._formatDayLabel(t) : '' });
      index += 1;
    }
    return ticks;
  }

  private _renderStats(
    m: LaundryTrackerModule,
    analysis: LaundryAnalysis,
    palette: Palette,
    lang: string
  ): TemplateResult {
    const stats: LaundryStats = analysis.stats;
    const days = m.history_days ?? 7;
    const showEnergy = m.show_energy !== false;
    const currency = m.currency_symbol ?? '$';

    if (stats.cycleCount === 0) {
      return html`
        <div class="uc-lt-stats-empty" style="color:${palette.secondary};">
          ${analysis.loading
            ? localize('editor.laundry_tracker.loading_history', lang, 'Reading cycle history…')
            : localize(
                'editor.laundry_tracker.stats_learning',
                lang,
                'No completed cycles yet — still learning what your machines look like.'
              )}
        </div>
      `;
    }

    const tiles: Array<{ label: string; value: string }> = [
      {
        label: localize('editor.laundry_tracker.stats_cycles', lang, 'Cycles'),
        value: String(stats.cycleCount),
      },
      {
        label: localize('editor.laundry_tracker.stats_avg', lang, 'Average'),
        value: stats.avgDurationMs !== null ? this._formatDuration(stats.avgDurationMs, lang) : '—',
      },
    ];
    if (showEnergy) {
      tiles.push({
        label: localize('editor.laundry_tracker.stats_energy', lang, 'Energy'),
        value: `${stats.totalKwh.toFixed(2)} kWh`,
      });
      tiles.push({
        label: localize('editor.laundry_tracker.stats_cost', lang, 'Cost'),
        value: `${currency}${stats.totalCost.toFixed(2)}`,
      });
    }
    if (stats.busiestDay) {
      tiles.push({
        label: localize('editor.laundry_tracker.stats_busiest', lang, 'Busiest'),
        value: this._formatDayName(stats.busiestDay, lang),
      });
    }

    return html`
      <div class="uc-lt-stats">
        ${tiles.map(
          tile => html`
            <div class="uc-lt-stat" style="background:${palette.cardBg};">
              <div class="uc-lt-stat-value" style="color:${palette.text};">${tile.value}</div>
              <div class="uc-lt-stat-label" style="color:${palette.secondary};">${tile.label}</div>
            </div>
          `
        )}
      </div>
      <div class="uc-lt-footnote" style="color:${palette.secondary};">
        ${this._formatTemplate(
          localize('editor.laundry_tracker.stats_footnote', lang, 'From {days} days of history'),
          { days: String(days) }
        )}
      </div>
    `;
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  private _dispatchNotifications(
    m: LaundryTrackerModule,
    hass: HomeAssistant,
    analysis: LaundryAnalysis,
    lang: string
  ): void {
    const service = (m.notify_service || '').trim();
    if (!service) return;

    for (const status of analysis.statuses) {
      if (status.phase !== 'forgotten' || !status.lastCycle) continue;
      const kind = status.appliance.kind === 'dryer' ? 'dryer' : 'washer';
      const name =
        status.appliance.name?.trim() ||
        (kind === 'dryer'
          ? localize('editor.laundry_tracker.kind_dryer', lang, 'Dryer')
          : localize('editor.laundry_tracker.kind_washer', lang, 'Washer'));

      ucLaundryTrackerService.maybeNotify(hass, {
        moduleId: m.id,
        applianceId: status.appliance.id,
        cycleEndMs: status.lastCycle.endMs,
        service,
        title: localize('editor.laundry_tracker.notify_title', lang, 'Laundry is waiting'),
        message: this._formatTemplate(
          localize(
            'editor.laundry_tracker.notify_message',
            lang,
            '{name} finished {time} ago and still has a load in it.'
          ),
          {
            name,
            time: this._formatDuration(status.sittingMs ?? 0, lang),
          }
        ),
      });
    }
  }

  // ── Formatting helpers ─────────────────────────────────────────────────────

  private _palette(m: LaundryTrackerModule): Palette {
    return {
      running: m.running_color || DEFAULT_COLORS.running,
      done: m.done_color || DEFAULT_COLORS.done,
      idle: m.idle_color || DEFAULT_COLORS.idle,
      alert: m.alert_color || DEFAULT_COLORS.alert,
      text: m.text_color || DEFAULT_COLORS.text,
      secondary: m.secondary_text_color || DEFAULT_COLORS.secondary,
      cardBg: m.card_background_color || DEFAULT_COLORS.cardBg,
    };
  }

  private _phaseColor(
    phase: LaundryStatus['phase'],
    palette: Palette,
    alertEnabled: boolean
  ): string {
    switch (phase) {
      case 'running':
        return palette.running;
      case 'finished':
        return palette.done;
      case 'forgotten':
        return alertEnabled ? palette.alert : palette.done;
      case 'unknown':
      case 'idle':
      default:
        return palette.idle;
    }
  }

  private _phaseLabel(status: LaundryStatus, m: LaundryTrackerModule, lang: string): string {
    switch (status.phase) {
      case 'running':
        return localize('editor.laundry_tracker.phase_running', lang, 'Running');
      case 'finished':
        return localize('editor.laundry_tracker.phase_finished', lang, 'Finished');
      case 'forgotten':
        return m.show_idle_alert !== false
          ? localize('editor.laundry_tracker.phase_forgotten', lang, 'Still loaded')
          : localize('editor.laundry_tracker.phase_finished', lang, 'Finished');
      case 'unknown':
        return localize('editor.laundry_tracker.phase_unknown', lang, 'Not set up');
      case 'idle':
      default:
        return localize('editor.laundry_tracker.phase_idle', lang, 'Idle');
    }
  }

  /** Median of the most recent cycles — robust to one odd heavy-duty load. */
  private _typicalDurationMs(status: LaundryStatus): { medianMs: number; count: number } | null {
    const recent = status.cycles.slice(-8).map(cycle => cycle.durationMs);
    if (recent.length < 3) return null;
    const sorted = [...recent].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianMs =
      sorted.length % 2 === 0
        ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
        : (sorted[mid] ?? 0);
    if (medianMs <= 0) return null;
    return { medianMs, count: recent.length };
  }

  private _cycleSummary(m: LaundryTrackerModule, cycle: LaundryCycle, lang: string): string {
    const parts = [this._formatDuration(cycle.durationMs, lang)];
    if (m.show_energy !== false && cycle.energyKwh > 0) {
      parts.push(`${cycle.energyKwh.toFixed(2)} kWh`);
      const currency = m.currency_symbol ?? '$';
      parts.push(`${currency}${cycle.costEstimate.toFixed(2)}`);
    }
    return parts.join(' · ');
  }

  private _cycleTooltip(
    m: LaundryTrackerModule,
    name: string,
    cycle: LaundryCycle,
    lang: string
  ): string {
    return `${name} · ${this._formatClock(cycle.startMs, lang)} · ${this._cycleSummary(m, cycle, lang)}`;
  }

  private _formatWatts(watts: number): string {
    if (!Number.isFinite(watts)) return '—';
    if (Math.abs(watts) >= 1000) return `${(watts / 1000).toFixed(2)} kW`;
    if (Math.abs(watts) >= 100) return `${Math.round(watts)} W`;
    return `${Math.round(watts * 10) / 10} W`;
  }

  /** "4h 20m" style, with translatable unit suffixes. */
  private _formatDuration(ms: number, lang: string): string {
    const safe = Math.max(0, Math.round(ms));
    const dayUnit = localize('editor.laundry_tracker.unit_day', lang, 'd');
    const hourUnit = localize('editor.laundry_tracker.unit_hour', lang, 'h');
    const minuteUnit = localize('editor.laundry_tracker.unit_minute', lang, 'm');

    if (safe < MINUTE_MS) {
      return `${Math.max(1, Math.round(safe / 1000 / 60))}${minuteUnit}`;
    }
    if (safe < HOUR_MS) {
      return `${Math.round(safe / MINUTE_MS)}${minuteUnit}`;
    }
    if (safe < DAY_MS) {
      const hours = Math.floor(safe / HOUR_MS);
      const minutes = Math.round((safe % HOUR_MS) / MINUTE_MS);
      return minutes > 0 ? `${hours}${hourUnit} ${minutes}${minuteUnit}` : `${hours}${hourUnit}`;
    }
    const days = Math.floor(safe / DAY_MS);
    const hours = Math.round((safe % DAY_MS) / HOUR_MS);
    return hours > 0 ? `${days}${dayUnit} ${hours}${hourUnit}` : `${days}${dayUnit}`;
  }

  private _formatClock(ms: number, lang: string): string {
    try {
      return new Date(ms).toLocaleString(lang || undefined, {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return new Date(ms).toLocaleString();
    }
  }

  private _formatDayLabel(ms: number): string {
    const d = new Date(ms);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  private _formatDayName(isoDate: string, lang: string): string {
    const parts = isoDate.split('-').map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    if (!year || !month || !day) return isoDate;
    try {
      return new Date(year, month - 1, day).toLocaleDateString(lang || undefined, {
        weekday: 'short',
      });
    } catch {
      return isoDate;
    }
  }

  /** `{token}` substitution so translators keep control of word order. */
  private _formatTemplate(template: string, values: Record<string, string>): string {
    let out = template;
    for (const [key, value] of Object.entries(values)) {
      out = out.split(`{${key}}`).join(value);
    }
    return out;
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      .uc-lt-wrapper {
        box-sizing: border-box;
        width: 100%;
      }

      /* ── Preview ─────────────────────────────────────────────────────── */

      .uc-lt-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      .uc-lt-title ha-icon {
        --mdc-icon-size: 20px;
      }

      .uc-lt-cards {
        display: flex;
        gap: 10px;
      }
      .uc-lt-cards.stack {
        flex-direction: column;
      }
      .uc-lt-cards.row {
        flex-direction: row;
        flex-wrap: wrap;
      }
      .uc-lt-cards.row > .uc-lt-card {
        flex: 1 1 220px;
        min-width: 0;
      }

      .uc-lt-card {
        border-radius: 12px;
        padding: 12px 14px;
        min-width: 0;
        box-sizing: border-box;
      }
      .uc-lt-card.alarm {
        animation: uc-lt-alarm-breathe 2.4s ease-in-out infinite;
      }

      .uc-lt-card-head {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .uc-lt-card-icon {
        --mdc-icon-size: 28px;
        flex-shrink: 0;
      }
      .uc-lt-card-icon.spin-pulse {
        animation: uc-lt-pulse 1.6s ease-in-out infinite;
      }
      .uc-lt-card-icon.alert-pulse {
        animation: uc-lt-shake 3s ease-in-out infinite;
      }
      .uc-lt-card-title {
        flex: 1;
        min-width: 0;
      }
      .uc-lt-card-name {
        font-size: 15px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lt-card-phase {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
      }
      .uc-lt-door ha-icon {
        --mdc-icon-size: 18px;
      }

      .uc-lt-card-body {
        margin-top: 8px;
      }
      .uc-lt-metrics {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 10px;
        font-size: 13px;
      }
      .uc-lt-metric strong {
        font-size: 18px;
        font-weight: 700;
      }
      .uc-lt-line {
        font-size: 12px;
        line-height: 1.4;
        margin-top: 4px;
        overflow-wrap: anywhere;
      }
      .uc-lt-line.strong {
        font-size: 13px;
        font-weight: 600;
      }
      .uc-lt-headline {
        font-size: 17px;
        font-weight: 700;
      }
      .uc-lt-alarm-headline {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.3px;
      }
      .uc-lt-badge {
        display: inline-block;
        margin-left: 6px;
        padding: 1px 6px;
        border: 1px solid;
        border-radius: 10px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        vertical-align: middle;
      }

      .uc-lt-progress {
        height: 6px;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 8px;
      }
      .uc-lt-progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.4s ease;
      }

      .uc-lt-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .uc-lt-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid;
        background: transparent;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
      }
      .uc-lt-action-btn ha-icon {
        --mdc-icon-size: 16px;
      }
      .uc-lt-action-btn:hover {
        filter: brightness(1.15);
      }
      .uc-lt-action-btn:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .uc-lt-handoff {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        padding: 10px 12px;
        border: 1px solid;
        border-radius: 12px;
      }
      .uc-lt-handoff ha-icon {
        --mdc-icon-size: 22px;
        flex-shrink: 0;
      }
      .uc-lt-handoff-title {
        font-size: 13px;
        font-weight: 700;
      }
      .uc-lt-handoff-sub {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── Timeline ─────────────────────────────────────────────────────── */

      .uc-lt-timeline {
        margin-top: 14px;
      }
      .uc-lt-section-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 6px;
      }
      .uc-lt-lane-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .uc-lt-lane-label {
        flex: 0 0 auto;
        width: 74px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        min-width: 0;
      }
      .uc-lt-lane-label ha-icon {
        --mdc-icon-size: 14px;
        flex-shrink: 0;
      }
      .uc-lt-lane-label span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lt-lane {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        height: 16px;
        border-radius: 5px;
        background: rgba(127, 127, 127, 0.16);
        overflow: hidden;
      }
      .uc-lt-gridline {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(127, 127, 127, 0.3);
      }
      .uc-lt-block {
        position: absolute;
        top: 2px;
        bottom: 2px;
        min-width: 3px;
        border-radius: 3px;
      }
      .uc-lt-axis {
        display: flex;
        gap: 8px;
      }
      .uc-lt-axis-spacer {
        flex: 0 0 auto;
        width: 74px;
      }
      .uc-lt-axis-track {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        height: 14px;
      }
      .uc-lt-axis-label {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        font-size: 9px;
        white-space: nowrap;
      }

      /* ── Stats ────────────────────────────────────────────────────────── */

      .uc-lt-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .uc-lt-stat {
        flex: 1 1 84px;
        min-width: 0;
        padding: 8px 10px;
        border-radius: 10px;
        text-align: center;
      }
      .uc-lt-stat-value {
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lt-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        margin-top: 2px;
      }
      .uc-lt-stats-empty,
      .uc-lt-footnote {
        font-size: 11px;
        margin-top: 8px;
      }
      .uc-lt-error {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        margin-top: 8px;
      }
      .uc-lt-error ha-icon {
        --mdc-icon-size: 16px;
      }

      /* ── Editor ───────────────────────────────────────────────────────── */

      .uc-lt-editor-empty {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px;
        border: 1px dashed var(--divider-color);
        border-radius: 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }
      .uc-lt-editor-empty ha-icon {
        --mdc-icon-size: 22px;
        color: var(--primary-color);
      }

      .uc-lt-row {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        background: var(--card-background-color);
        margin-bottom: 10px;
        overflow: hidden;
      }
      .uc-lt-row.expanded {
        border-color: var(--primary-color);
      }
      .uc-lt-row-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        min-width: 0;
      }
      .uc-lt-row-icon {
        --mdc-icon-size: 24px;
        color: var(--primary-color);
        flex-shrink: 0;
      }
      .uc-lt-row-text {
        flex: 1;
        min-width: 0;
      }
      .uc-lt-row-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lt-row-kind {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 8px;
        background: rgba(127, 127, 127, 0.18);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--secondary-text-color);
      }
      .uc-lt-row-sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lt-row-sub.empty {
        font-style: italic;
      }
      .uc-lt-icon-btn {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .uc-lt-icon-btn ha-icon {
        --mdc-icon-size: 18px;
      }
      .uc-lt-icon-btn:hover:not(:disabled) {
        background: rgba(127, 127, 127, 0.16);
        color: var(--primary-color);
      }
      .uc-lt-icon-btn.danger:hover:not(:disabled) {
        color: var(--error-color);
      }
      .uc-lt-icon-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .uc-lt-icon-btn:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .uc-lt-row-body {
        padding: 4px 12px 12px;
        border-top: 1px solid var(--divider-color);
      }

      .uc-lt-helper {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 16px;
        background: rgba(127, 127, 127, 0.06);
      }
      .uc-lt-helper-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 700;
        color: var(--primary-text-color);
      }
      .uc-lt-helper-title ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
      }
      .uc-lt-helper-note {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 4px;
        line-height: 1.4;
      }
      .uc-lt-helper-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .uc-lt-helper-stat {
        flex: 1 1 62px;
        min-width: 0;
        padding: 6px 8px;
        border-radius: 8px;
        background: var(--card-background-color);
        text-align: center;
      }
      .uc-lt-helper-stat-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--secondary-text-color);
      }
      .uc-lt-helper-stat-value {
        font-size: 13px;
        font-weight: 700;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lt-suggest-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
        padding: 7px 14px;
        border: none;
        border-radius: 8px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      }
      .uc-lt-suggest-btn ha-icon {
        --mdc-icon-size: 18px;
      }
      .uc-lt-suggest-btn:hover {
        filter: brightness(1.1);
      }
      .uc-lt-suggest-btn:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .uc-lt-add-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 4px;
      }
      .uc-lt-add-btn {
        flex: 1 1 140px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 14px;
        border: none;
        border-radius: 8px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      }
      .uc-lt-add-btn ha-icon {
        --mdc-icon-size: 20px;
      }
      .uc-lt-add-btn:hover {
        filter: brightness(1.1);
      }
      .uc-lt-add-btn:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .uc-lt-note {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(127, 127, 127, 0.1);
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }
      .uc-lt-note ha-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
        color: var(--primary-color);
      }

      @keyframes uc-lt-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.55; transform: scale(0.92); }
      }
      @keyframes uc-lt-shake {
        0%, 88%, 100% { transform: rotate(0deg); }
        91% { transform: rotate(-9deg); }
        94% { transform: rotate(9deg); }
        97% { transform: rotate(-5deg); }
      }
      @keyframes uc-lt-alarm-breathe {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.06); }
      }

      @media (prefers-reduced-motion: reduce) {
        .uc-lt-card.alarm,
        .uc-lt-card-icon.spin-pulse,
        .uc-lt-card-icon.alert-pulse {
          animation: none;
        }
      }

      @media (max-width: 360px) {
        .uc-lt-lane-label {
          width: 52px;
        }
        .uc-lt-axis-spacer {
          width: 52px;
        }
        .uc-lt-alarm-headline {
          font-size: 19px;
        }
      }
    `;
  }
}
