import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, VampirePowerModule } from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import { ucHistoryService, type HistoryStatePoint } from '../services/uc-history-service';
import {
  analyze,
  chunkEntityIds,
  computeTotals,
  costForPeriod,
  discoverPowerSensors,
  formatCost,
  formatWatts,
  sortAnalyses,
  totalForPeriod,
  VAMPIRE_HISTORY_CHUNK_SIZE,
  VAMPIRE_MAX_ANALYZED_SENSORS,
  type PowerCandidate,
  type StandbyAnalysis,
  type VampireAnalysisResult,
  type VampireTotals,
} from '../services/uc-vampire-power-service';
import '../components/ultra-color-picker';

/** Editor-side patch channel used by the in-preview dismiss control. */
const PATCH_EVENT = 'uc-module-patch-by-id';

/**
 * Recorder windows are quantized to this bucket so the history cache key is
 * stable between renders. Without it, `Date.now()` would produce a new key on
 * every paint and the module would refetch forever.
 */
const WINDOW_BUCKET_MS = 5 * 60 * 1000;

const HISTORY_TTL_MS = 5 * 60 * 1000;

interface HistorySnapshot {
  data: Map<string, HistoryStatePoint[]>;
  loading: boolean;
  /** 0 until the first chunk resolves. */
  fetchedAt: number;
  error: string | null;
  keys: string[];
}

/**
 * Per-card preview state. Modules are singletons shared by every card on the
 * dashboard, so anything stateful has to be keyed by `module.id`.
 */
interface VampirePreviewState {
  /** Identity of the last analysis; recomputing is only worth it when this changes. */
  analysisKey: string;
  /**
   * Sensor set + window the cached result describes. A cached result is only
   * safe to keep on screen during a refetch while this still matches.
   */
  dataKey: string;
  result: VampireAnalysisResult | null;
  totals: VampireTotals | null;
  ranked: StandbyAnalysis[];
  /** History cache keys currently in use, so superseded windows can be released. */
  historyKeys: string[];
}

interface PreviewPalette {
  bar: string;
  offender: string;
  text: string;
  secondary: string;
  cardBg: string;
}

export class UltraVampirePowerModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'vampire_power',
    title: 'Vampire Power',
    description: 'Finds always-on standby loads and ranks them by what they cost you',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:power-plug-off',
    category: 'data',
    tags: ['pro', 'premium', 'energy', 'standby', 'phantom', 'power', 'cost', 'savings'],
  };

  private _state = new Map<string, VampirePreviewState>();

  private _ensureState(id: string): VampirePreviewState {
    let s = this._state.get(id);
    if (!s) {
      s = {
        analysisKey: '',
        dataKey: '',
        result: null,
        totals: null,
        ranked: [],
        historyKeys: [],
      };
      this._state.set(id, s);
    }
    return s;
  }

  // ── createDefault ──────────────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): VampirePowerModule {
    return {
      id: id || this.generateId('vampire_power'),
      type: 'vampire_power',

      discovery_mode: 'auto',
      entities: [],
      exclude_patterns: [],
      hidden_entities: [],

      history_days: 7,
      baseline_percentile: 0.1,
      min_standby_watts: 0.5,
      max_standby_watts: 100,

      energy_rate: 0.15,
      currency_symbol: '$',
      cost_period: 'year',

      layout: 'ranked',
      sort_mode: 'cost',
      max_items: 15,

      title: '',
      show_title: true,
      show_total_bar: true,
      show_bars: true,
      show_cost: true,
      show_savings_hint: true,
      highlight_threshold_watts: 5,

      bar_color: '',
      offender_color: '',
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

  // ── validate ───────────────────────────────────────────────────────────────

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const m = module as VampirePowerModule;
    const errors = [...base.errors];
    const lang = 'en';

    if (m.discovery_mode === 'manual' && (!m.entities || m.entities.length === 0)) {
      errors.push(
        localize(
          'editor.vampire_power.error_manual_empty',
          lang,
          'Add at least one power sensor, or switch discovery to Auto or Both.'
        )
      );
    }
    if (typeof m.energy_rate === 'number' && m.energy_rate < 0) {
      errors.push(
        localize(
          'editor.vampire_power.error_rate_negative',
          lang,
          'Energy rate cannot be negative.'
        )
      );
    }
    if (
      typeof m.min_standby_watts === 'number' &&
      typeof m.max_standby_watts === 'number' &&
      m.min_standby_watts >= m.max_standby_watts
    ) {
      errors.push(
        localize(
          'editor.vampire_power.error_range',
          lang,
          'The standby noise floor must be lower than the always-on cutoff.'
        )
      );
    }

    return { valid: errors.length === 0, errors };
  }

  // ── General tab ────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as VampirePowerModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.vampire_power.pro_description',
          lang,
          'Vampire Power reads your recorder history to find the standby loads that never switch off, and tells you what each one costs per year.'
        )
      );
    }

    const discovered = discoverPowerSensors(hass, m);
    const hiddenCount = (m.hidden_entities || []).length;

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this._renderSensorsSection(m, hass, lang, discovered, hiddenCount, updateModule)}
        ${this._renderAnalysisSection(m, hass, lang, updateModule)}
        ${this._renderCostSection(m, hass, lang, updateModule)}
        ${this._renderDisplaySection(m, hass, lang, updateModule)}
        ${this._renderColorsSection(m, hass, lang, updateModule)}
      </div>
    `;
  }

  private _renderSensorsSection(
    m: VampirePowerModule,
    hass: HomeAssistant,
    lang: string,
    discovered: PowerCandidate[],
    hiddenCount: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const mode = m.discovery_mode || 'auto';
    const capped = discovered.length > VAMPIRE_MAX_ANALYZED_SENSORS;

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.vampire_power.sensors_section', lang, 'Sensors')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; line-height: 1.5;"
        >
          ${localize(
            'editor.vampire_power.sensors_section_desc',
            lang,
            'Choose which power sensors are analyzed. Auto finds every sensor reporting watts, so most homes need nothing here.'
          )}
        </div>

        ${this.renderSegmentedField(
          localize('editor.vampire_power.discovery_mode', lang, 'Discovery'),
          localize(
            'editor.vampire_power.discovery_mode_desc',
            lang,
            'Auto scans Home Assistant for power sensors, Manual uses only the list below, Both merges them.'
          ),
          mode,
          [
            {
              value: 'auto',
              label: localize('editor.vampire_power.mode_auto', lang, 'Auto'),
              icon: 'mdi:auto-fix',
            },
            {
              value: 'manual',
              label: localize('editor.vampire_power.mode_manual', lang, 'Manual'),
              icon: 'mdi:format-list-bulleted',
            },
            {
              value: 'both',
              label: localize('editor.vampire_power.mode_both', lang, 'Both'),
              icon: 'mdi:set-merge',
            },
          ],
          next => {
            updateModule({
              discovery_mode: next as VampirePowerModule['discovery_mode'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}

        <div
          style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 8px; background: rgba(var(--rgb-primary-color), 0.08); margin-bottom: 16px;"
        >
          <ha-icon
            icon=${discovered.length > 0 ? 'mdi:magnify-scan' : 'mdi:alert-circle-outline'}
            style="color: var(--primary-color); --mdc-icon-size: 22px; flex-shrink: 0;"
          ></ha-icon>
          <div style="min-width: 0;">
            <div style="font-size: 14px; font-weight: 600; color: var(--primary-text-color);">
              ${this._fill(
                localize('editor.vampire_power.found_sensors', lang, 'Found {count} power sensors'),
                { count: discovered.length }
              )}
            </div>
            <div style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;">
              ${discovered.length === 0
                ? localize(
                    'editor.vampire_power.found_none_hint',
                    lang,
                    'Smart plugs and energy monitors expose these. Switch to Manual to add one by hand.'
                  )
                : capped
                  ? this._fill(
                      localize(
                        'editor.vampire_power.found_capped',
                        lang,
                        'Only the first {max} are analyzed to keep the recorder query fast.'
                      ),
                      { max: VAMPIRE_MAX_ANALYZED_SENSORS }
                    )
                  : localize(
                      'editor.vampire_power.found_ok_hint',
                      lang,
                      'Whole-home and grid meters are skipped so they cannot swamp the ranking.'
                    )}
            </div>
          </div>
        </div>

        ${this.renderChipListField(
          localize('editor.vampire_power.exclude_patterns', lang, 'Exclude patterns'),
          localize(
            'editor.vampire_power.exclude_patterns_desc',
            lang,
            'Sensors whose entity id or name contains any of these words are skipped. Auto discovery already skips whole-home meters (names like total, house, grid or mains); add your own words here for anything else you never want ranked.'
          ),
          hass,
          m.exclude_patterns || [],
          next => {
            updateModule({ exclude_patterns: next } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          {
            mode: 'free-text',
            variant: 'exclude',
            placeholder: localize(
              'editor.vampire_power.exclude_patterns_ph',
              lang,
              'e.g. solar, inverter'
            ),
          }
        )}
        ${mode !== 'auto'
          ? this.renderChipListField(
              localize('editor.vampire_power.entities', lang, 'Power sensors'),
              localize(
                'editor.vampire_power.entities_desc',
                lang,
                'Sensors added here are always analyzed, even when the whole-home filter would have skipped them.'
              ),
              hass,
              m.entities || [],
              next => {
                updateModule({ entities: next } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              {
                mode: 'entity',
                entityDomains: ['sensor'],
                placeholder: localize(
                  'editor.vampire_power.entities_ph',
                  lang,
                  'Add a power sensor'
                ),
              }
            )
          : nothing}

        <div class="field-container" style="margin-bottom: 0;">
          <div class="field-title">
            ${localize('editor.vampire_power.dismissed', lang, 'Dismissed devices')}
          </div>
          <div class="field-description">
            ${hiddenCount > 0
              ? this._fill(
                  localize(
                    'editor.vampire_power.dismissed_desc',
                    lang,
                    '{count} devices were dismissed from the card and are excluded from the ranking and the totals.'
                  ),
                  { count: hiddenCount }
                )
              : localize(
                  'editor.vampire_power.dismissed_empty',
                  lang,
                  'Nothing dismissed. Use the × on a row in the card preview to hide a device you do not want ranked.'
                )}
          </div>
          <button
            type="button"
            class="uc-vp-restore"
            ?disabled=${hiddenCount === 0}
            style="display: inline-flex; align-items: center; gap: 8px; margin-top: 8px; padding: 10px 16px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: ${hiddenCount ===
            0
              ? 'var(--disabled-text-color)'
              : 'var(--primary-text-color)'}; font-size: 14px; font-weight: 600; cursor: ${hiddenCount ===
            0
              ? 'default'
              : 'pointer'};"
            @click=${() => {
              if (hiddenCount === 0) return;
              updateModule({ hidden_entities: [] } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }}
          >
            <ha-icon icon="mdi:backup-restore" style="--mdc-icon-size: 18px;"></ha-icon>
            ${localize('editor.vampire_power.restore_dismissed', lang, 'Restore dismissed')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderAnalysisSection(
    m: VampirePowerModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.vampire_power.analysis_section', lang, 'Analysis')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; line-height: 1.5;"
        >
          ${localize(
            'editor.vampire_power.analysis_section_desc',
            lang,
            'A device is measured by the wattage it never drops below. A longer window gives a steadier estimate but takes longer to load.'
          )}
        </div>

        ${this.renderSliderField(
          localize('editor.vampire_power.history_days', lang, 'History window'),
          localize(
            'editor.vampire_power.history_days_desc',
            lang,
            'How far back to read the recorder. Seven days covers a full weekly routine; longer windows need recorder history to match.'
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
          localize('editor.vampire_power.unit_days', lang, ' days')
        )}
        ${this.renderSliderField(
          localize('editor.vampire_power.baseline_percentile', lang, 'Standby percentile'),
          localize(
            'editor.vampire_power.baseline_percentile_desc',
            lang,
            'Which point of the wattage distribution counts as idle. 0.10 means the level the device stayed at or below for 10% of the window. Lower is stricter and reports a lower floor; higher includes light activity.'
          ),
          m.baseline_percentile ?? 0.1,
          0.1,
          0.01,
          0.5,
          0.01,
          (value: number) => {
            updateModule({ baseline_percentile: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderConditionalFieldsGroup(
          localize('editor.vampire_power.advanced_thresholds', lang, 'Advanced thresholds'),
          html`
            ${this.renderSliderField(
              localize('editor.vampire_power.min_standby_watts', lang, 'Noise floor'),
              localize(
                'editor.vampire_power.min_standby_watts_desc',
                lang,
                'Standby loads under this are treated as measurement noise and left out entirely.'
              ),
              m.min_standby_watts ?? 0.5,
              0.5,
              0,
              20,
              0.1,
              (value: number) => {
                updateModule({ min_standby_watts: value } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              localize('editor.vampire_power.unit_watts', lang, ' W')
            )}
            ${this.renderSliderField(
              localize('editor.vampire_power.max_standby_watts', lang, 'Always-on cutoff'),
              localize(
                'editor.vampire_power.max_standby_watts_desc',
                lang,
                'Floors above this belong to genuinely always-on appliances such as a fridge or a server. They are listed separately instead of being ranked as standby waste.'
              ),
              m.max_standby_watts ?? 100,
              100,
              10,
              500,
              1,
              (value: number) => {
                updateModule({ max_standby_watts: value } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              localize('editor.vampire_power.unit_watts', lang, ' W')
            )}
          `
        )}
      </div>
    `;
  }

  private _renderCostSection(
    m: VampirePowerModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.vampire_power.cost_section', lang, 'Cost')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; line-height: 1.5;"
        >
          ${localize(
            'editor.vampire_power.cost_section_desc',
            lang,
            'What the wasted energy is worth. Costs are estimates based on a flat rate.'
          )}
        </div>

        ${this.renderFieldSection(
          localize('editor.vampire_power.energy_rate', lang, 'Energy rate'),
          localize(
            'editor.vampire_power.energy_rate_desc',
            lang,
            'Cost of one kilowatt-hour, taken from your electricity bill.'
          ),
          hass,
          { energy_rate: m.energy_rate ?? 0.15 },
          [
            {
              name: 'energy_rate',
              selector: { number: { min: 0, max: 10, step: 0.001, mode: 'box' } },
            },
          ],
          (e: CustomEvent) => {
            const next = Number(e.detail.value?.energy_rate);
            updateModule({
              energy_rate: Number.isFinite(next) ? next : 0.15,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.vampire_power.currency_symbol', lang, 'Currency symbol'),
          localize(
            'editor.vampire_power.currency_symbol_desc',
            lang,
            'Shown in front of every cost figure.'
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
        ${this.renderSegmentedField(
          localize('editor.vampire_power.cost_period', lang, 'Cost period'),
          localize(
            'editor.vampire_power.cost_period_desc',
            lang,
            'Annual figures are the ones large enough to act on; daily figures are easier to sanity-check.'
          ),
          m.cost_period || 'year',
          [
            { value: 'day', label: localize('editor.vampire_power.period_day', lang, 'Day') },
            { value: 'month', label: localize('editor.vampire_power.period_month', lang, 'Month') },
            { value: 'year', label: localize('editor.vampire_power.period_year', lang, 'Year') },
          ],
          next => {
            updateModule({
              cost_period: next as VampirePowerModule['cost_period'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
      </div>
    `;
  }

  private _renderDisplaySection(
    m: VampirePowerModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.vampire_power.display_section', lang, 'Display')}
        </div>

        ${this.renderSegmentedField(
          localize('editor.vampire_power.layout', lang, 'Layout'),
          localize(
            'editor.vampire_power.layout_desc',
            lang,
            'Ranked shows a bar per device, Cards is a tile grid, Compact is a dense list.'
          ),
          m.layout || 'ranked',
          [
            {
              value: 'ranked',
              label: localize('editor.vampire_power.layout_ranked', lang, 'Ranked'),
              icon: 'mdi:format-list-numbered',
            },
            {
              value: 'cards',
              label: localize('editor.vampire_power.layout_cards', lang, 'Cards'),
              icon: 'mdi:view-grid',
            },
            {
              value: 'compact',
              label: localize('editor.vampire_power.layout_compact', lang, 'Compact'),
              icon: 'mdi:view-sequential',
            },
          ],
          next => {
            updateModule({ layout: next as VampirePowerModule['layout'] } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
        ${this.renderSegmentedField(
          localize('editor.vampire_power.sort_mode', lang, 'Sort by'),
          localize(
            'editor.vampire_power.sort_mode_desc',
            lang,
            'Cost ranks by annual waste and breaks ties in favour of devices that are almost purely idle.'
          ),
          m.sort_mode || 'cost',
          [
            { value: 'cost', label: localize('editor.vampire_power.sort_cost', lang, 'Cost') },
            { value: 'watts', label: localize('editor.vampire_power.sort_watts', lang, 'Watts') },
            { value: 'name', label: localize('editor.vampire_power.sort_name', lang, 'Name') },
          ],
          next => {
            updateModule({
              sort_mode: next as VampirePowerModule['sort_mode'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
        ${this.renderSliderField(
          localize('editor.vampire_power.max_items', lang, 'Devices shown'),
          localize(
            'editor.vampire_power.max_items_desc',
            lang,
            'The total bar always covers every analyzed device, even when the list is trimmed.'
          ),
          m.max_items ?? 15,
          15,
          1,
          50,
          1,
          (value: number) => {
            updateModule({ max_items: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderSliderField(
          localize('editor.vampire_power.highlight_threshold', lang, 'Offender threshold'),
          localize(
            'editor.vampire_power.highlight_threshold_desc',
            lang,
            'Devices idling at or above this wattage are drawn in the offender colour.'
          ),
          m.highlight_threshold_watts ?? 5,
          5,
          0,
          50,
          0.5,
          (value: number) => {
            updateModule({ highlight_threshold_watts: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          localize('editor.vampire_power.unit_watts', lang, ' W')
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.vampire_power.show_total_bar', lang, 'Show total'),
            description: localize(
              'editor.vampire_power.show_total_bar_desc',
              lang,
              'The headline figure for the whole home.'
            ),
            hass,
            data: { show_total_bar: m.show_total_bar !== false },
            schema: [this.booleanField('show_total_bar')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_total_bar: e.detail.value?.show_total_bar,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.vampire_power.show_bars', lang, 'Show bars'),
            description: localize(
              'editor.vampire_power.show_bars_desc',
              lang,
              'Each row gets a bar sized against the worst offender.'
            ),
            hass,
            data: { show_bars: m.show_bars !== false },
            schema: [this.booleanField('show_bars')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_bars: e.detail.value?.show_bars } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.vampire_power.show_cost', lang, 'Show cost'),
            description: localize(
              'editor.vampire_power.show_cost_desc',
              lang,
              'Turn off to show wattage only.'
            ),
            hass,
            data: { show_cost: m.show_cost !== false },
            schema: [this.booleanField('show_cost')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_cost: e.detail.value?.show_cost } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.vampire_power.show_savings_hint', lang, 'Show takeaway'),
            description: localize(
              'editor.vampire_power.show_savings_hint_desc',
              lang,
              'A one-line summary of what the worst offenders add up to.'
            ),
            hass,
            data: { show_savings_hint: m.show_savings_hint !== false },
            schema: [this.booleanField('show_savings_hint')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_savings_hint: e.detail.value?.show_savings_hint,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.vampire_power.show_title', lang, 'Show title'),
            description: localize(
              'editor.vampire_power.show_title_desc',
              lang,
              'Display a header above the card.'
            ),
            hass,
            data: { show_title: m.show_title !== false },
            schema: [this.booleanField('show_title')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_title: e.detail.value?.show_title } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
        ])}
        ${this.renderFieldSection(
          localize('editor.vampire_power.title', lang, 'Title'),
          localize('editor.vampire_power.title_desc', lang, 'Leave blank to use the module name.'),
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

  private _renderColorsSection(
    m: VampirePowerModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const fields: Array<{ key: keyof VampirePowerModule; label: string; def: string }> = [
      {
        key: 'bar_color',
        label: localize('editor.vampire_power.color_bar', lang, 'Bar'),
        def: 'var(--primary-color)',
      },
      {
        key: 'offender_color',
        label: localize('editor.vampire_power.color_offender', lang, 'Offender'),
        def: 'var(--error-color)',
      },
      {
        key: 'text_color',
        label: localize('editor.vampire_power.color_text', lang, 'Text'),
        def: 'var(--primary-text-color)',
      },
      {
        key: 'secondary_text_color',
        label: localize('editor.vampire_power.color_secondary', lang, 'Secondary text'),
        def: 'var(--secondary-text-color)',
      },
      {
        key: 'card_background_color',
        label: localize('editor.vampire_power.color_card_bg', lang, 'Row background'),
        def: 'var(--card-background-color)',
      },
    ];

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.vampire_power.colors_section', lang, 'Colors')}
        </div>
        ${fields.map(f =>
          this.renderColorField(
            f.label,
            '',
            hass,
            (m as unknown as Record<string, string | undefined>)[f.key as string] || '',
            f.def,
            next => {
              updateModule({ [f.key]: next } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )
        )}
      </div>
    `;
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as VampirePowerModule;
    const lang = hass?.locale?.language || 'en';
    const locale = hass?.locale?.language;

    if (!hass?.states) {
      return this.renderGradientErrorState(
        localize('editor.vampire_power.err_ha', lang, 'Waiting for Home Assistant'),
        localize('editor.vampire_power.err_ha_desc', lang, 'Connecting to entity states…'),
        'mdi:power-plug-off'
      );
    }

    const discovered = discoverPowerSensors(hass, m);
    const candidates = discovered.slice(0, VAMPIRE_MAX_ANALYZED_SENSORS);
    if (candidates.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.vampire_power.err_empty', lang, 'No power sensors found'),
        localize(
          'editor.vampire_power.err_empty_desc',
          lang,
          'This module needs sensors that report watts — smart plugs or an energy monitor. Add one under Sensors in the General tab.'
        ),
        'mdi:power-plug-off'
      );
    }

    const days = Math.min(Math.max(Math.round(m.history_days ?? 7), 1), 30);
    const endMs = Math.floor(Date.now() / WINDOW_BUCKET_MS) * WINDOW_BUCKET_MS;
    const startMs = endMs - days * 86400000;
    const palette = this._palette(m);
    const totalDiscovered = discovered.length;

    const state = this._ensureState(m.id);
    const history = this._queryHistory(hass, m, candidates, startMs, endMs);
    const dataKey = `${candidates.map(c => c.entityId).join(',')}|${days}`;

    // The analysis is O(n log n) per sensor, so it only reruns when an input
    // that actually changes the numbers moves — not on every repaint.
    if (history.fetchedAt > 0) {
      const analysisKey = [
        dataKey,
        m.baseline_percentile ?? 0.1,
        m.min_standby_watts ?? 0.5,
        m.max_standby_watts ?? 100,
        m.energy_rate ?? 0.15,
        m.highlight_threshold_watts ?? 5,
        history.fetchedAt,
      ].join('|');

      if (state.analysisKey !== analysisKey || !state.result) {
        const fresh = analyze(candidates, history.data, m, { startMs, endMs });
        state.analysisKey = analysisKey;
        state.dataKey = dataKey;
        state.result = fresh;
        state.ranked = fresh.ranked;
        state.totals = computeTotals(fresh.ranked);
      }
    }

    // The recorder window advances every few minutes, and refetching should not
    // blank the card. Keep the last analysis on screen while the next one loads,
    // but only while it still describes the same sensors over the same window —
    // showing yesterday's devices after a discovery change would be a lie.
    if (!state.result || state.dataKey !== dataKey) {
      if (history.fetchedAt > 0 && history.error && history.data.size === 0) {
        return this.renderGradientErrorState(
          localize('editor.vampire_power.err_history', lang, 'Could not read history'),
          localize(
            'editor.vampire_power.err_history_desc',
            lang,
            'The recorder did not return data for these sensors. Check that the recorder integration is keeping history for them.'
          ),
          'mdi:database-alert-outline'
        );
      }
      return this._wrap(
        module,
        hass,
        this._renderSkeleton(m, lang, candidates.length, days, palette)
      );
    }

    const result = state.result;
    const totals = state.totals ?? computeTotals(result.ranked);
    const sorted = sortAnalyses(result.ranked, m.sort_mode || 'cost');
    const visible = sorted.slice(0, Math.max(1, m.max_items ?? 15));
    const worstWatts = visible.reduce((max, a) => Math.max(max, a.standbyWatts), 0);

    const body = html`
      ${m.show_title !== false ? this._renderTitle(m, lang, palette) : nothing}
      ${m.show_total_bar !== false
        ? this._renderTotalBar(m, totals, sorted, palette, lang, locale, days)
        : nothing}
      ${visible.length === 0
        ? this._renderNoWaste(m, lang, locale, palette, days)
        : m.layout === 'cards'
          ? this._renderCardsLayout(m, visible, hass, config, palette, lang, locale, previewContext)
          : m.layout === 'compact'
            ? this._renderCompactLayout(
                m,
                visible,
                hass,
                config,
                palette,
                lang,
                locale,
                previewContext
              )
            : this._renderRankedLayout(
                m,
                visible,
                worstWatts,
                hass,
                config,
                palette,
                lang,
                locale,
                previewContext
              )}
      ${m.show_savings_hint !== false && sorted.length > 0
        ? this._renderSavingsHint(m, sorted, palette, lang, locale)
        : nothing}
      ${this._renderFootnotes(m, result, palette, lang, locale, candidates.length, totalDiscovered)}
    `;

    return this._wrap(module, hass, body);
  }

  /** Shared outer shell: design styles, hover class, animation wrapper. */
  private _wrap(module: CardModule, hass: HomeAssistant, body: TemplateResult): TemplateResult {
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="uc-vp-wrapper ${hoverClass}" style="${designStyles}">
        ${this.wrapWithAnimation(body, module, hass)}
      </div>
    `;
  }

  private _palette(m: VampirePowerModule): PreviewPalette {
    return {
      bar: m.bar_color || 'var(--primary-color)',
      offender: m.offender_color || 'var(--error-color)',
      text: m.text_color || 'var(--primary-text-color)',
      secondary: m.secondary_text_color || 'var(--secondary-text-color)',
      cardBg: m.card_background_color || 'var(--card-background-color)',
    };
  }

  private _renderTitle(m: VampirePowerModule, lang: string, palette: PreviewPalette) {
    const title =
      (m.title || '').trim() ||
      localize('editor.vampire_power.default_title', lang, 'Vampire Power');
    return html`
      <div
        class="uc-vp-title"
        style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: ${palette.text};"
      >
        <ha-icon
          icon="mdi:power-plug-off"
          style="--mdc-icon-size: 20px; color: ${palette.offender}; flex-shrink: 0;"
        ></ha-icon>
        <span style="font-size: 16px; font-weight: 700; min-width: 0;" class="uc-vp-ellipsis">
          ${title}
        </span>
      </div>
    `;
  }

  // ── Preview: loading ───────────────────────────────────────────────────────

  /**
   * This module has nothing to show until the recorder answers, so the first
   * paint is a real skeleton of the finished layout rather than a spinner.
   */
  private _renderSkeleton(
    m: VampirePowerModule,
    lang: string,
    sensorCount: number,
    days: number,
    palette: PreviewPalette
  ): TemplateResult {
    const rows = [0, 1, 2, 3];
    return html`
      ${m.show_title !== false ? this._renderTitle(m, lang, palette) : nothing}
      <div
        style="border-radius: 14px; padding: 16px; background: ${palette.cardBg}; border: 1px solid var(--divider-color); margin-bottom: 12px;"
      >
        <div
          style="font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: ${palette.secondary}; margin-bottom: 10px;"
        >
          ${localize('editor.vampire_power.total_label', lang, 'Standby waste')}
        </div>
        <div class="uc-vp-shimmer" style="height: 30px; width: 62%; border-radius: 8px;"></div>
        <div
          class="uc-vp-shimmer"
          style="height: 12px; margin-top: 12px; border-radius: 6px;"
        ></div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${rows.map(
          i => html`
            <div
              style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; background: ${palette.cardBg}; border: 1px solid var(--divider-color);"
            >
              <div
                class="uc-vp-shimmer"
                style="width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;"
              ></div>
              <div style="flex: 1; min-width: 0;">
                <div
                  class="uc-vp-shimmer"
                  style="height: 12px; width: ${70 - i * 12}%; border-radius: 6px;"
                ></div>
                <div
                  class="uc-vp-shimmer"
                  style="height: 8px; margin-top: 8px; width: ${55 - i * 10}%; border-radius: 5px;"
                ></div>
              </div>
              <div
                class="uc-vp-shimmer"
                style="width: 52px; height: 16px; border-radius: 6px; flex-shrink: 0;"
              ></div>
            </div>
          `
        )}
      </div>
      <div
        style="display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 12px; color: ${palette.secondary};"
      >
        <ha-icon
          icon="mdi:chart-timeline-variant"
          style="--mdc-icon-size: 16px; flex-shrink: 0;"
        ></ha-icon>
        <span style="min-width: 0;">
          ${this._fill(
            localize(
              'editor.vampire_power.loading_note',
              lang,
              'Analyzing {count} power sensors over {days} days of history…'
            ),
            { count: sensorCount, days }
          )}
        </span>
      </div>
    `;
  }

  // ── Preview: total bar ─────────────────────────────────────────────────────

  /**
   * The headline. A stacked bar shows how the total splits across devices, so
   * "127 W" reads as a handful of big offenders rather than an abstract number.
   */
  private _renderTotalBar(
    m: VampirePowerModule,
    totals: VampireTotals,
    sorted: StandbyAnalysis[],
    palette: PreviewPalette,
    lang: string,
    locale: string | undefined,
    days: number
  ): TemplateResult {
    const cost = totalForPeriod(totals, m.cost_period || 'year');
    const segments = sorted.slice(0, 12);
    const segmentTotal = segments.reduce((sum, a) => sum + a.standbyWatts, 0);
    const remainder = Math.max(0, totals.totalStandbyWatts - segmentTotal);

    return html`
      <div
        class="uc-vp-total"
        style="border-radius: 14px; padding: 16px; margin-bottom: 12px; background: ${palette.cardBg}; border: 1px solid var(--divider-color);"
      >
        <div
          style="font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: ${palette.secondary}; margin-bottom: 8px;"
        >
          ${localize('editor.vampire_power.total_label', lang, 'Standby waste')}
        </div>
        <div
          style="display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 14px; margin-bottom: 12px;"
        >
          <div style="font-size: 30px; font-weight: 800; line-height: 1.1; color: ${palette.text};">
            ${formatWatts(totals.totalStandbyWatts, locale)}<span
              style="font-size: 16px; font-weight: 700; margin-left: 3px;"
              >${localize('editor.vampire_power.watt_symbol', lang, 'W')}</span
            >
          </div>
          ${m.show_cost !== false
            ? html`
                <div
                  style="font-size: 22px; font-weight: 700; color: ${palette.offender}; line-height: 1.1;"
                >
                  ${formatCost(cost, m.currency_symbol, locale)}${this._periodSuffix(
                    m.cost_period,
                    lang
                  )}
                </div>
              `
            : nothing}
        </div>
        ${totals.totalStandbyWatts > 0
          ? html`
              <div
                style="display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: rgba(127,127,127,0.18);"
                role="img"
                aria-label=${this._fill(
                  localize(
                    'editor.vampire_power.total_bar_aria',
                    lang,
                    'Standby load split across {count} devices'
                  ),
                  { count: totals.deviceCount }
                )}
              >
                ${segments.map((a, index) => {
                  const width = (a.standbyWatts / totals.totalStandbyWatts) * 100;
                  const color = a.isOffender ? palette.offender : palette.bar;
                  return html`<div
                    style="width: ${width}%; background: ${color}; opacity: ${1 -
                    Math.min(index, 8) * 0.07}; min-width: 1px;"
                    title="${a.name} — ${formatWatts(a.standbyWatts, locale)} ${localize(
                      'editor.vampire_power.watt_symbol',
                      lang,
                      'W'
                    )}"
                  ></div>`;
                })}
                ${remainder > 0
                  ? html`<div
                      style="flex: 1; background: ${palette.bar}; opacity: 0.25;"
                      title=${localize(
                        'editor.vampire_power.total_bar_rest',
                        lang,
                        'Other devices'
                      )}
                    ></div>`
                  : nothing}
              </div>
            `
          : nothing}
        <div style="font-size: 12px; color: ${palette.secondary}; margin-top: 10px;">
          ${this._fill(
            localize(
              'editor.vampire_power.total_footer',
              lang,
              'Across {devices} devices, measured over {days} days of history'
            ),
            { devices: totals.deviceCount, days }
          )}
        </div>
      </div>
    `;
  }

  private _periodSuffix(
    period: VampirePowerModule['cost_period'] | undefined,
    lang: string
  ): string {
    if (period === 'day') return localize('editor.vampire_power.per_day', lang, '/day');
    if (period === 'month') return localize('editor.vampire_power.per_month', lang, '/mo');
    return localize('editor.vampire_power.per_year', lang, '/yr');
  }

  // ── Preview: layouts ───────────────────────────────────────────────────────

  private _renderRankedLayout(
    m: VampirePowerModule,
    items: StandbyAnalysis[],
    worstWatts: number,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    palette: PreviewPalette,
    lang: string,
    locale: string | undefined,
    previewContext: 'live' | 'ha-preview' | 'dashboard' | undefined
  ): TemplateResult {
    return html`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items.map((a, index) => {
          const color = a.isOffender ? palette.offender : palette.bar;
          const width = worstWatts > 0 ? Math.max(2, (a.standbyWatts / worstWatts) * 100) : 0;
          const gestures = this._rowGestures(m, a, hass, config, 'ranked');
          return html`
            <div
              class="uc-vp-row"
              style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; background: ${palette.cardBg}; border: 1px solid var(--divider-color);"
              @pointerdown=${gestures.onPointerDown}
              @pointermove=${gestures.onPointerMove}
              @pointerup=${gestures.onPointerUp}
              @pointerleave=${gestures.onPointerLeave}
              @pointercancel=${gestures.onPointerCancel}
            >
              <div
                style="display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: ${color}22; color: ${color}; font-size: 12px; font-weight: 700; flex-shrink: 0;"
              >
                ${index + 1}
              </div>
              <ha-icon
                icon=${a.icon}
                style="--mdc-icon-size: 24px; color: ${color}; flex-shrink: 0;"
              ></ha-icon>
              <div style="flex: 1; min-width: 0;">
                <div
                  class="uc-vp-ellipsis"
                  style="font-size: 14px; font-weight: 600; color: ${palette.text};"
                >
                  ${a.name}
                </div>
                <div
                  class="uc-vp-ellipsis"
                  style="font-size: 11px; color: ${palette.secondary}; margin-top: 1px;"
                >
                  ${this._rowSubtitle(a, lang, locale)}
                </div>
                ${m.show_bars !== false
                  ? html`
                      <div
                        style="height: 6px; border-radius: 4px; background: rgba(127,127,127,0.18); margin-top: 7px; overflow: hidden;"
                      >
                        <div style="width: ${width}%; height: 100%; background: ${color};"></div>
                      </div>
                    `
                  : nothing}
              </div>
              <div style="text-align: right; flex-shrink: 0;">
                <div style="font-size: 15px; font-weight: 700; color: ${palette.text};">
                  ${formatWatts(a.standbyWatts, locale)}
                  <span style="font-size: 11px; font-weight: 600;"
                    >${localize('editor.vampire_power.watt_symbol', lang, 'W')}</span
                  >
                </div>
                ${m.show_cost !== false
                  ? html`
                      <div style="font-size: 12px; color: ${palette.secondary}; margin-top: 2px;">
                        ${formatCost(
                          costForPeriod(a, m.cost_period || 'year'),
                          m.currency_symbol,
                          locale
                        )}${this._periodSuffix(m.cost_period, lang)}
                      </div>
                    `
                  : nothing}
              </div>
              ${this._renderConfidenceMark(a, palette, lang)}
              ${this._renderDismiss(m, a, previewContext, lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderCardsLayout(
    m: VampirePowerModule,
    items: StandbyAnalysis[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    palette: PreviewPalette,
    lang: string,
    locale: string | undefined,
    previewContext: 'live' | 'ha-preview' | 'dashboard' | undefined
  ): TemplateResult {
    return html`
      <div class="uc-vp-grid">
        ${items.map(a => {
          const color = a.isOffender ? palette.offender : palette.bar;
          const gestures = this._rowGestures(m, a, hass, config, 'cards');
          return html`
            <div
              class="uc-vp-tile"
              style="position: relative; padding: 14px 12px; border-radius: 12px; text-align: center; background: ${color}18; border: 1px solid ${color}44;"
              @pointerdown=${gestures.onPointerDown}
              @pointermove=${gestures.onPointerMove}
              @pointerup=${gestures.onPointerUp}
              @pointerleave=${gestures.onPointerLeave}
              @pointercancel=${gestures.onPointerCancel}
            >
              <div style="position: absolute; top: 4px; right: 4px; display: flex; gap: 2px;">
                ${this._renderConfidenceMark(a, palette, lang)}
                ${this._renderDismiss(m, a, previewContext, lang)}
              </div>
              <ha-icon
                icon=${a.icon}
                style="--mdc-icon-size: 28px; color: ${color}; margin-bottom: 6px;"
              ></ha-icon>
              <div
                style="font-size: 24px; font-weight: 800; color: ${palette.text}; line-height: 1;"
              >
                ${formatWatts(a.standbyWatts, locale)}<span
                  style="font-size: 13px; font-weight: 700; margin-left: 2px;"
                  >${localize('editor.vampire_power.watt_symbol', lang, 'W')}</span
                >
              </div>
              ${m.show_cost !== false
                ? html`
                    <div
                      style="font-size: 13px; font-weight: 600; color: ${color}; margin-top: 4px;"
                    >
                      ${formatCost(
                        costForPeriod(a, m.cost_period || 'year'),
                        m.currency_symbol,
                        locale
                      )}${this._periodSuffix(m.cost_period, lang)}
                    </div>
                  `
                : nothing}
              <div
                class="uc-vp-clamp"
                style="font-size: 12px; color: ${palette.secondary}; margin-top: 6px; line-height: 1.25;"
              >
                ${a.name}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderCompactLayout(
    m: VampirePowerModule,
    items: StandbyAnalysis[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    palette: PreviewPalette,
    lang: string,
    locale: string | undefined,
    previewContext: 'live' | 'ha-preview' | 'dashboard' | undefined
  ): TemplateResult {
    return html`
      <div
        style="border-radius: 12px; overflow: hidden; border: 1px solid var(--divider-color); background: ${palette.cardBg};"
      >
        ${items.map((a, index) => {
          const color = a.isOffender ? palette.offender : palette.bar;
          const gestures = this._rowGestures(m, a, hass, config, 'compact');
          return html`
            <div
              class="uc-vp-row"
              style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; ${index > 0
                ? 'border-top: 1px solid var(--divider-color);'
                : ''}"
              @pointerdown=${gestures.onPointerDown}
              @pointermove=${gestures.onPointerMove}
              @pointerup=${gestures.onPointerUp}
              @pointerleave=${gestures.onPointerLeave}
              @pointercancel=${gestures.onPointerCancel}
            >
              <ha-icon
                icon=${a.icon}
                style="--mdc-icon-size: 18px; color: ${color}; flex-shrink: 0;"
              ></ha-icon>
              <div
                class="uc-vp-ellipsis"
                style="flex: 1; min-width: 0; font-size: 13px; color: ${palette.text};"
              >
                ${a.name}
              </div>
              <div
                style="font-size: 13px; font-weight: 700; color: ${color}; flex-shrink: 0; font-variant-numeric: tabular-nums;"
              >
                ${formatWatts(a.standbyWatts, locale)}${localize(
                  'editor.vampire_power.watt_symbol',
                  lang,
                  'W'
                )}
              </div>
              ${m.show_cost !== false
                ? html`
                    <div
                      style="font-size: 12px; color: ${palette.secondary}; flex-shrink: 0; min-width: 54px; text-align: right; font-variant-numeric: tabular-nums;"
                    >
                      ${formatCost(
                        costForPeriod(a, m.cost_period || 'year'),
                        m.currency_symbol,
                        locale
                      )}
                    </div>
                  `
                : nothing}
              ${this._renderDismiss(m, a, previewContext, lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  // ── Preview: supporting pieces ─────────────────────────────────────────────

  private _rowSubtitle(a: StandbyAnalysis, lang: string, locale: string | undefined): string {
    const parts: string[] = [];
    if (a.areaName) parts.push(a.areaName);
    if (a.wasteRatio >= 0.5) {
      parts.push(
        this._fill(
          localize('editor.vampire_power.row_waste_ratio', lang, '{pct}% of its usage is idle'),
          { pct: Math.round(a.wasteRatio * 100) }
        )
      );
    } else if (a.idleFraction >= 0.5) {
      parts.push(
        this._fill(
          localize('editor.vampire_power.row_idle_fraction', lang, 'idle {pct}% of the time'),
          { pct: Math.round(a.idleFraction * 100) }
        )
      );
    }
    if (parts.length === 0) {
      parts.push(
        this._fill(localize('editor.vampire_power.row_peak', lang, 'peaks at {watts} W'), {
          watts: formatWatts(a.peakWatts, locale),
        })
      );
    }
    return parts.join(' · ');
  }

  /** A quiet marker on rows whose estimate rests on thin recorder coverage. */
  private _renderConfidenceMark(
    a: StandbyAnalysis,
    palette: PreviewPalette,
    lang: string
  ): TemplateResult | typeof nothing {
    if (a.confidence !== 'low') return nothing;
    const label = this._fill(
      localize(
        'editor.vampire_power.confidence_low',
        lang,
        'Estimated from limited history ({samples} samples)'
      ),
      { samples: a.sampleCount }
    );
    return html`
      <ha-icon
        icon="mdi:help-circle-outline"
        title=${label}
        aria-label=${label}
        style="--mdc-icon-size: 15px; color: ${palette.secondary}; opacity: 0.7; flex-shrink: 0;"
      ></ha-icon>
    `;
  }

  /**
   * In-card dismiss. Only offered inside the editor preview, where the patch
   * event has a listener — on a live dashboard there is nothing to write to.
   */
  private _renderDismiss(
    m: VampirePowerModule,
    a: StandbyAnalysis,
    previewContext: 'live' | 'ha-preview' | 'dashboard' | undefined,
    lang: string
  ): TemplateResult | typeof nothing {
    if (previewContext !== 'live') return nothing;
    const label = localize('editor.vampire_power.dismiss_row', lang, 'Hide this device');
    return html`
      <button
        type="button"
        class="uc-vp-dismiss"
        title=${label}
        aria-label=${label}
        @click=${(ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          const hidden = [...(m.hidden_entities || [])];
          if (!hidden.includes(a.entityId)) hidden.push(a.entityId);
          window.dispatchEvent(
            new CustomEvent(PATCH_EVENT, {
              bubbles: true,
              composed: true,
              detail: { moduleId: m.id, updates: { hidden_entities: hidden } },
            })
          );
          this.triggerPreviewUpdate(true);
        }}
      >
        <ha-icon icon="mdi:close" style="--mdc-icon-size: 14px;"></ha-icon>
      </button>
    `;
  }

  /**
   * Plain-language takeaway. Deliberately just arithmetic on the top offenders —
   * a specific number people can check beats an encouraging slogan.
   */
  private _renderSavingsHint(
    m: VampirePowerModule,
    sorted: StandbyAnalysis[],
    palette: PreviewPalette,
    lang: string,
    locale: string | undefined
  ): TemplateResult | typeof nothing {
    const byCost = sortAnalyses(sorted, 'cost');
    const top = byCost.slice(0, 3);
    if (top.length === 0) return nothing;

    const topCost = top.reduce((sum, a) => sum + a.costPerYear, 0);
    if (topCost <= 0) return nothing;

    const text =
      top.length === 1
        ? this._fill(
            localize(
              'editor.vampire_power.hint_one',
              lang,
              '{name} alone costs {cost} a year doing nothing. A scheduled smart plug would recover most of that.'
            ),
            {
              name: top[0]!.name,
              cost: formatCost(topCost, m.currency_symbol, locale),
            }
          )
        : this._fill(
            localize(
              'editor.vampire_power.hint_many',
              lang,
              'The top {count} devices cost {cost} a year while idle. Switching them off on a schedule would recover most of that.'
            ),
            { count: top.length, cost: formatCost(topCost, m.currency_symbol, locale) }
          );

    return html`
      <div
        style="display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 12px; background: rgba(127,127,127,0.1);"
      >
        <ha-icon
          icon="mdi:lightbulb-on-outline"
          style="--mdc-icon-size: 18px; color: ${palette.bar}; flex-shrink: 0; margin-top: 1px;"
        ></ha-icon>
        <div style="font-size: 13px; line-height: 1.45; color: ${palette.text}; min-width: 0;">
          ${text}
        </div>
      </div>
    `;
  }

  /**
   * Everything the ranking left out, stated plainly. Silently showing five rows
   * when a user has twenty smart plugs is exactly how a card loses trust.
   */
  private _renderFootnotes(
    m: VampirePowerModule,
    result: VampireAnalysisResult,
    palette: PreviewPalette,
    lang: string,
    locale: string | undefined,
    analyzedCount: number,
    totalDiscovered: number
  ): TemplateResult | typeof nothing {
    const notes: string[] = [];

    if (result.insufficient.length > 0) {
      notes.push(
        this._fill(
          localize(
            'editor.vampire_power.note_insufficient',
            lang,
            '{count} sensors need more history before they can be ranked.'
          ),
          { count: result.insufficient.length }
        )
      );
    }
    if (result.alwaysOn.length > 0) {
      const names = result.alwaysOn
        .slice(0, 3)
        .map(a => a.name)
        .join(', ');
      notes.push(
        this._fill(
          localize(
            'editor.vampire_power.note_always_on',
            lang,
            '{count} always-on devices draw more than {watts} W even at rest ({names}). They are running, not idling.'
          ),
          {
            count: result.alwaysOn.length,
            watts: formatWatts(m.max_standby_watts ?? 100, locale),
            names,
          }
        )
      );
    }
    if (totalDiscovered > analyzedCount) {
      notes.push(
        this._fill(
          localize(
            'editor.vampire_power.note_capped',
            lang,
            'Analyzing the first {analyzed} of {total} power sensors.'
          ),
          { analyzed: analyzedCount, total: totalDiscovered }
        )
      );
    }

    if (notes.length === 0) return nothing;

    return html`
      <div
        style="margin-top: 10px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; line-height: 1.45; color: ${palette.secondary};"
      >
        ${notes.map(
          note => html`
            <div style="display: flex; align-items: flex-start; gap: 6px;">
              <ha-icon
                icon="mdi:information-outline"
                style="--mdc-icon-size: 13px; flex-shrink: 0; margin-top: 2px;"
              ></ha-icon>
              <span style="min-width: 0;">${note}</span>
            </div>
          `
        )}
      </div>
    `;
  }

  /** Not an error: the analysis ran and found nothing worth reporting. */
  private _renderNoWaste(
    m: VampirePowerModule,
    lang: string,
    locale: string | undefined,
    palette: PreviewPalette,
    days: number
  ): TemplateResult {
    return html`
      <div
        style="display: flex; align-items: center; gap: 12px; padding: 18px 16px; border-radius: 12px; background: ${palette.cardBg}; border: 1px dashed var(--divider-color);"
      >
        <ha-icon
          icon="mdi:leaf"
          style="--mdc-icon-size: 26px; color: var(--success-color); flex-shrink: 0;"
        ></ha-icon>
        <div style="min-width: 0;">
          <div style="font-size: 14px; font-weight: 600; color: ${palette.text};">
            ${localize('editor.vampire_power.no_waste', lang, 'No standby waste found')}
          </div>
          <div style="font-size: 12px; color: ${palette.secondary}; line-height: 1.4;">
            ${this._fill(
              localize(
                'editor.vampire_power.no_waste_desc',
                lang,
                'Every sensor idled below {watts} W across the last {days} days. Lower the noise floor under Analysis to see smaller loads.'
              ),
              { watts: formatWatts(m.min_standby_watts ?? 0.5, locale), days }
            )}
          </div>
        </div>
      </div>
    `;
  }

  // ── History ────────────────────────────────────────────────────────────────

  /**
   * Pulls recorder history for every candidate, in chunks.
   *
   * A large home can put 60 sensors × 7 days into one websocket call, so the
   * entity list is split into batches with their own cache keys. Each batch
   * fetches independently and the results are merged.
   *
   * The key deliberately omits `baseline_percentile`: it changes the analysis,
   * not the data, and folding it in would make every step of that slider refire
   * the whole recorder query. It is part of the analysis cache key instead.
   */
  private _queryHistory(
    hass: HomeAssistant,
    m: VampirePowerModule,
    candidates: PowerCandidate[],
    startMs: number,
    endMs: number
  ): HistorySnapshot {
    const entityIds = candidates.map(c => c.entityId);
    const chunks = chunkEntityIds(entityIds, VAMPIRE_HISTORY_CHUNK_SIZE);
    const merged = new Map<string, HistoryStatePoint[]>();
    const keys: string[] = [];

    let loading = false;
    let error: string | null = null;
    let fetchedAt = Number.POSITIVE_INFINITY;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;
      const key = `vampire_power:${m.id}:${startMs}:${endMs}:${i}:${chunk.join(',')}`;
      keys.push(key);

      const result = ucHistoryService.query(
        hass,
        {
          key,
          entityIds: chunk,
          startMs,
          endMs,
          ttlMs: HISTORY_TTL_MS,
          withAttributes: false,
        },
        () => this.triggerPreviewUpdate()
      );

      for (const [entityId, points] of result.data) merged.set(entityId, points);
      if (result.loading) loading = true;
      if (result.error && !error) error = result.error;
      fetchedAt = Math.min(fetchedAt, result.fetchedAt);
    }

    this._releaseStaleHistory(m.id, keys);

    return {
      data: merged,
      loading,
      fetchedAt: Number.isFinite(fetchedAt) ? fetchedAt : 0,
      error,
      keys,
    };
  }

  /**
   * Drops cache entries for windows we no longer read. The window end advances
   * every five minutes, which would otherwise leave a new set of entries behind
   * on each rollover for as long as the dashboard stays open.
   */
  private _releaseStaleHistory(moduleId: string, currentKeys: string[]): void {
    const state = this._ensureState(moduleId);
    if (state.historyKeys.length > 0) {
      const keep = new Set(currentKeys);
      for (const key of state.historyKeys) {
        if (!keep.has(key)) ucHistoryService.invalidate(key);
      }
    }
    state.historyKeys = currentKeys;
  }

  // ── Interaction ────────────────────────────────────────────────────────────

  /**
   * Rows target their own entity. The module-level default is `nothing`, but a
   * row that does nothing when tapped is a dead end, so an unset action falls
   * back to more-info on that device; an explicit action still wins.
   */
  private _rowGestures(
    m: VampirePowerModule,
    a: StandbyAnalysis,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    suffix: string
  ) {
    const configuredAction = m.tap_action?.action;
    return this.createGestureHandlers(
      `${m.id}-${a.entityId}-${suffix}`,
      {
        tap_action:
          configuredAction && configuredAction !== 'nothing'
            ? { ...m.tap_action, action: configuredAction, entity: a.entityId }
            : { action: 'more-info', entity: a.entityId },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: a.entityId,
        module: m,
      },
      hass,
      config,
      ['.uc-vp-dismiss']
    );
  }

  /** Substitutes `{placeholders}` in a localized string. */
  private _fill(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
      Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
    );
  }

  // ── CSS ────────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      .uc-vp-wrapper {
        box-sizing: border-box;
        width: 100%;
      }

      .uc-vp-ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .uc-vp-clamp {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .uc-vp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 8px;
      }

      .uc-vp-row {
        box-sizing: border-box;
      }

      .uc-vp-dismiss {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--error-color);
        cursor: pointer;
        opacity: 0.55;
        transition: opacity 0.15s ease, background 0.15s ease;
      }

      .uc-vp-row:hover .uc-vp-dismiss,
      .uc-vp-tile:hover .uc-vp-dismiss,
      .uc-vp-dismiss:focus-visible {
        opacity: 1;
        background: rgba(127, 127, 127, 0.16);
      }

      .uc-vp-dismiss:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }

      /* Loading placeholders. The sweep is disabled for users who ask for less motion. */
      .uc-vp-shimmer {
        background: linear-gradient(
          90deg,
          rgba(127, 127, 127, 0.14) 25%,
          rgba(127, 127, 127, 0.26) 37%,
          rgba(127, 127, 127, 0.14) 63%
        );
        background-size: 400% 100%;
        animation: uc-vp-shimmer 1.4s ease-in-out infinite;
      }

      @keyframes uc-vp-shimmer {
        0% { background-position: 100% 50%; }
        100% { background-position: 0 50%; }
      }

      @media (prefers-reduced-motion: reduce) {
        .uc-vp-shimmer { animation: none; }
      }

      @media (max-width: 340px) {
        .uc-vp-grid {
          grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        }
      }
    `;
  }
}
