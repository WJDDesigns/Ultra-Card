import { TemplateResult, html, nothing, svg } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import type {
  CardModule,
  EnergyPriceEvApplyMode,
  EnergyPriceLevelMode,
  EnergyPriceModule,
  EnergyPriceSource,
  UltraCardConfig,
} from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import {
  ACTION_FORMATS,
  adjustSlots,
  chartRange,
  collectAttributeSlots,
  computeEvNeed,
  computeStats,
  detectPriceFormat,
  findCheapestWindow,
  localDateKey,
  localDayBounds,
  nextTimeOfDay,
  octopusSiblingIds,
  parseDepartureState,
  parseTimeOfDay,
  planCharging,
  powerToKw,
  priceLevel,
  slotAt,
  slotsForDay,
  slotsInRange,
  toNumber,
  ucEnergyPriceService,
  type ChargePlan,
  type LevelConfig,
  type PriceFormat,
  type PriceLevel,
  type PriceSlot,
  type PriceWindow,
  type TimeRange,
} from '../services/uc-energy-price-service';

type UpdateFn = (updates: Partial<CardModule>) => void;

interface EntityLike {
  state?: string;
  attributes?: Record<string, unknown>;
}

/** Everything the preview needs, gathered once per render. */
interface PriceData {
  format: PriceFormat;
  /** Adjusted (VAT / fees applied) slots, sorted. */
  slots: PriceSlot[];
  loading: boolean;
  error: string;
  unit: string;
  currency: string;
  current: number | null;
  currentSlot: PriceSlot | null;
  nextSlot: PriceSlot | null;
}

interface EvView {
  soc: number | null;
  target: number;
  powerKw: number;
  departure: Date;
  hoursNeeded: number;
  kwhNeeded: number;
  plan: ChargePlan;
  /** Planned charging covers the current instant. */
  chargingNow: boolean;
  /** Prices end before departure. */
  pricesShort: boolean;
  chargerOn: boolean | null;
}

interface ActionFeedback {
  message: string;
  error: boolean;
  at: number;
}

const DEFAULT_WINDOW_HOURS = 3;
const DEFAULT_CHART_HEIGHT = 120;
const DEFAULT_TARGET_SOC = 80;
const DEFAULT_CAPACITY_KWH = 60;
const DEFAULT_POWER_KW = 7.4;
const DEFAULT_EFFICIENCY = 90;
const DEFAULT_DEPARTURE = '07:00';
const DEFAULT_MANUAL_HOURS = 4;
const FEEDBACK_MS = 5000;
const HOUR_MS = 3600000;

const DEFAULT_COLORS = {
  cheap: 'var(--success-color, #43a047)',
  normal: 'var(--primary-color, #03a9f4)',
  expensive: 'var(--error-color, #db4437)',
};

const SOURCE_LABELS: Record<PriceFormat, string> = {
  nordpool: 'Nord Pool',
  nordpool_core: 'Nord Pool',
  tibber: 'Tibber',
  energi_data_service: 'Energi Data Service',
  entsoe: 'ENTSO-e',
  octopus: 'Octopus Energy',
  amber: 'Amber Electric',
  generic: 'Price list',
  none: '',
};

/** Ids of the editor fields that hold entities, for runtime update tracking. */
const EV_ENTITY_KEYS = [
  'ev_charger_entity',
  'ev_soc_entity',
  'ev_target_soc_entity',
  'ev_power_entity',
  'ev_departure_entity',
] as const;

function num(value: unknown, fallback: number): number {
  const n = toNumber(value);
  return n === null ? fallback : n;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Energy Price & EV (Pro): an electricity price curve for today and tomorrow,
 * the current price level, the cheapest window to run an appliance, and a smart
 * EV charge plan. Picking just the price sensor is enough; the source format is
 * detected automatically.
 */
export class UltraEnergyPriceModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'energy_price',
    title: 'Energy Price & EV',
    description:
      'Electricity price curve with cheap and expensive hours, the cheapest time to run appliances, and a smart EV charge plan',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:ev-station',
    category: 'data',
    tags: [
      'pro',
      'premium',
      'energy',
      'electricity price',
      'nordpool',
      'tibber',
      'octopus',
      'ev',
      'charging',
      'cheapest hours',
      'tariff',
    ],
  };

  private _busy = new Set<string>();
  private _feedback = new Map<string, ActionFeedback>();

  // ── Defaults & validation ──────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): EnergyPriceModule {
    return {
      id: id || this.generateId('energy_price'),
      type: 'energy_price',

      price_entity: '',
      price_source: 'auto',
      nordpool_config_entry: '',
      source_hint: '',

      title: '',
      show_title: true,
      show_current: true,
      show_stats: true,
      show_chart: true,
      show_tomorrow: true,
      chart_hours: 0,
      chart_height: DEFAULT_CHART_HEIGHT,

      show_cheapest_window: true,
      window_hours: DEFAULT_WINDOW_HOURS,
      window_label: '',

      level_mode: 'relative',
      cheap_percent: 33,
      expensive_percent: 67,
      cheap_price: 0.1,
      expensive_price: 0.3,

      price_multiplier: 1,
      price_additive: 0,
      unit_override: '',
      decimals: 2,

      cheap_color: '',
      normal_color: '',
      expensive_color: '',

      ev_enabled: false,
      ev_charger_entity: '',
      ev_soc_entity: '',
      ev_target_soc: DEFAULT_TARGET_SOC,
      ev_target_soc_entity: '',
      ev_capacity_kwh: DEFAULT_CAPACITY_KWH,
      ev_power_kw: DEFAULT_POWER_KW,
      ev_power_entity: '',
      ev_efficiency: DEFAULT_EFFICIENCY,
      ev_departure_time: DEFAULT_DEPARTURE,
      ev_departure_entity: '',
      ev_manual_hours: DEFAULT_MANUAL_HOURS,
      ev_allow_split: true,
      ev_apply_mode: 'none',
      ev_script_entity: '',
      ev_start_entity: '',
      ev_end_entity: '',

      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  /**
   * Lenient on purpose: a validation error blanks the whole card, and a module
   * with no price sensor yet renders a friendly setup state instead.
   */
  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as EnergyPriceModule;
    const ids: string[] = [];
    if (m.price_entity) {
      ids.push(m.price_entity);
      const sib = octopusSiblingIds(m.price_entity);
      if (sib) ids.push(sib.current, sib.next);
    }
    if (m.ev_enabled) {
      for (const key of EV_ENTITY_KEYS) {
        const id = m[key];
        if (id) ids.push(id);
      }
    }
    return ids;
  }

  // ── Data gathering ─────────────────────────────────────────────────────────

  private _format(m: EnergyPriceModule, hass: HomeAssistant): PriceFormat {
    const id = m.price_entity || '';
    if (!id) return 'none';
    const src = m.price_source || 'auto';
    if (src !== 'auto') return src;
    const st = hass?.states?.[id] as EntityLike | undefined;
    const registry = (hass as unknown as { entities?: Record<string, { platform?: string }> })
      ?.entities;
    return detectPriceFormat(id, st?.attributes, registry?.[id]?.platform);
  }

  private _levelConfig(m: EnergyPriceModule): LevelConfig {
    return {
      mode: m.level_mode || 'relative',
      cheapPercent: num(m.cheap_percent, 33),
      expensivePercent: num(m.expensive_percent, 67),
      cheapPrice: num(m.cheap_price, 0.1),
      expensivePrice: num(m.expensive_price, 0.3),
    };
  }

  private _priceData(m: EnergyPriceModule, hass: HomeAssistant, now: Date): PriceData {
    const id = m.price_entity || '';
    const st = hass?.states?.[id] as EntityLike | undefined;
    const format = this._format(m, hass);
    let raw: PriceSlot[] = [];
    let loading = false;
    let error = '';
    if (ACTION_FORMATS.has(format)) {
      const entry = ucEnergyPriceService.getActionSlots(
        hass,
        {
          format,
          entityId: id,
          configEntry: m.nordpool_config_entry || undefined,
          hint: m.source_hint || undefined,
        },
        () => this.triggerPreviewUpdate(true)
      );
      raw = entry.slots;
      loading = entry.loading && entry.slots.length === 0;
      error = entry.error;
    } else if (format !== 'none') {
      raw = collectAttributeSlots(
        format,
        id,
        (hass?.states || {}) as Record<string, EntityLike | undefined>,
        now
      );
    }

    const mult = num(m.price_multiplier, 1);
    const add = num(m.price_additive, 0);
    const slots = adjustSlots(raw, mult, add);
    const currentSlot = slotAt(slots, now);
    const stateValue = toNumber(st?.state);
    const current = currentSlot
      ? currentSlot.price
      : stateValue === null
        ? null
        : stateValue * mult + add;
    const nextSlot = currentSlot ? slotAt(slots, currentSlot.end) : null;

    const attrUnit = st?.attributes?.unit_of_measurement ?? st?.attributes?.unit;
    const unit = (m.unit_override || (typeof attrUnit === 'string' ? attrUnit : '')).trim();
    const slash = unit.indexOf('/');
    const currency =
      slash > 0
        ? unit.slice(0, slash).trim()
        : typeof st?.attributes?.currency === 'string'
          ? String(st.attributes.currency)
          : '';

    return { format, slots, loading, error, unit, currency, current, currentSlot, nextSlot };
  }

  private _evView(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    slots: PriceSlot[],
    now: Date
  ): EvView {
    const state = (id: string | undefined): EntityLike | undefined =>
      id ? (hass?.states?.[id] as EntityLike | undefined) : undefined;

    const socRaw = toNumber(state(m.ev_soc_entity)?.state);
    const soc = socRaw === null ? null : clamp(socRaw, 0, 100);
    const targetFromEntity = toNumber(state(m.ev_target_soc_entity)?.state);
    const target = clamp(targetFromEntity ?? num(m.ev_target_soc, DEFAULT_TARGET_SOC), 0, 100);

    const powerState = state(m.ev_power_entity);
    const powerRaw = toNumber(powerState?.state);
    const powerKw =
      powerRaw !== null && powerRaw > 0
        ? powerToKw(powerRaw, powerState?.attributes?.unit_of_measurement)
        : Math.max(0.1, num(m.ev_power_kw, DEFAULT_POWER_KW));

    const departure =
      parseDepartureState(state(m.ev_departure_entity)?.state, now) ||
      nextTimeOfDay(m.ev_departure_time || DEFAULT_DEPARTURE, now) ||
      new Date(now.getTime() + 12 * HOUR_MS);

    let hoursNeeded: number;
    let kwhNeeded: number;
    if (soc !== null) {
      const need = computeEvNeed({
        currentSoc: soc,
        targetSoc: target,
        capacityKwh: num(m.ev_capacity_kwh, DEFAULT_CAPACITY_KWH),
        efficiencyPercent: num(m.ev_efficiency, DEFAULT_EFFICIENCY),
        powerKw,
      });
      hoursNeeded = need.hoursNeeded;
      kwhNeeded = need.kwhNeeded;
    } else {
      hoursNeeded = Math.max(0, num(m.ev_manual_hours, DEFAULT_MANUAL_HOURS));
      kwhNeeded = hoursNeeded * powerKw;
    }

    const plan = planCharging(
      slots,
      now,
      departure,
      hoursNeeded,
      powerKw,
      m.ev_allow_split !== false
    );
    const t = now.getTime();
    const chargingNow = plan.ranges.some(r => r.start.getTime() <= t && t < r.end.getTime());
    const last = slots.length ? slots[slots.length - 1] : undefined;
    const pricesShort = !last || last.end.getTime() < departure.getTime();
    const chargerState = state(m.ev_charger_entity)?.state;
    const chargerOn = chargerState === 'on' ? true : chargerState === 'off' ? false : null;

    return {
      soc,
      target,
      powerKw,
      departure,
      hoursNeeded,
      kwhNeeded,
      plan,
      chargingNow,
      pricesShort,
      chargerOn,
    };
  }

  // ── Formatting ─────────────────────────────────────────────────────────────

  private _fmtPrice(value: number, m: EnergyPriceModule, lang: string): string {
    const d = clamp(Math.round(num(m.decimals, 2)), 0, 5);
    try {
      return value.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    } catch {
      return value.toFixed(d);
    }
  }

  private _fmtTime(d: Date, lang: string, now: Date): string {
    let time: string;
    try {
      time = d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    } catch {
      time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    const key = localDateKey(d);
    if (key === localDateKey(now)) return time;
    if (key === localDateKey(localDayBounds(now, 1).start)) {
      return `${localize('editor.energy_price.tomorrow_short', lang, 'Tomorrow')} ${time}`;
    }
    let day: string;
    try {
      day = d.toLocaleDateString(lang, { weekday: 'short' });
    } catch {
      day = key;
    }
    return `${day} ${time}`;
  }

  private _fmtRange(r: TimeRange, lang: string, now: Date): string {
    return `${this._fmtTime(r.start, lang, now)}–${this._fmtTime(r.end, lang, r.start)}`;
  }

  private _fmtDuration(ms: number, lang: string): string {
    const totalMin = Math.max(0, Math.round(ms / 60000));
    const h = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    const hu = localize('editor.energy_price.unit_h', lang, 'h');
    const mu = localize('editor.energy_price.unit_min', lang, 'min');
    if (h && min) return `${h} ${hu} ${min} ${mu}`;
    if (h) return `${h} ${hu}`;
    return `${min} ${mu}`;
  }

  private _colors(m: EnergyPriceModule): Record<PriceLevel, string> {
    return {
      cheap: m.cheap_color || DEFAULT_COLORS.cheap,
      normal: m.normal_color || DEFAULT_COLORS.normal,
      expensive: m.expensive_color || DEFAULT_COLORS.expensive,
    };
  }

  private _levelLabel(level: PriceLevel, lang: string): string {
    if (level === 'cheap') return localize('editor.energy_price.level_cheap', lang, 'Cheap');
    if (level === 'expensive')
      return localize('editor.energy_price.level_expensive', lang, 'Expensive');
    return localize('editor.energy_price.level_normal', lang, 'Normal');
  }

  /** Reference prices for the local day that contains `t`. */
  private _dayRefs(slots: PriceSlot[], t: Date): number[] {
    return slotsForDay(slots, t).map(s => s.price);
  }

  // ── General tab ────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn
  ): TemplateResult {
    const m = module as EnergyPriceModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.energy_price.pro_description',
          lang,
          'Energy Price & EV is a Pro feature: your electricity price curve from Nord Pool, Tibber, Octopus and more, the cheapest time to run appliances, and a smart EV charge plan.'
        ),
        hass
      );
    }

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this._editorStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderPriceSection(m, hass, config, updateModule, lang)}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderEvSection(m, hass, config, updateModule, lang)}
        ${this._renderLevelsSection(m, hass, updateModule, lang)}
        ${this._renderAdjustSection(m, hass, updateModule, lang)}
        ${this._renderSourceSection(m, hass, updateModule, lang)}
      </div>
    `;
  }

  private _renderPriceSection(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.energy_price.price_section', lang, 'Electricity price')}
        </div>
        <div class="uc-ep-ed-desc">
          ${localize(
            'editor.energy_price.price_section_desc',
            lang,
            'Pick your price sensor. Nord Pool, Tibber, Octopus Energy, ENTSO-e, Energi Data Service and Amber are detected automatically.'
          )}
        </div>
        ${this.renderEntityPickerWithVariables(
          hass,
          config,
          'price_entity',
          m.price_entity || '',
          (value: string) => {
            updateModule({ price_entity: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ['sensor', 'event'],
          localize('editor.energy_price.price_entity', lang, 'Price sensor')
        )}
        ${
          m.price_entity
            ? this._renderDetectedNote(m, hass, lang)
            : this._renderSuggestions(hass, updateModule, lang)
        }
      </div>
    `;
  }

  private _renderDetectedNote(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    lang: string
  ): TemplateResult {
    const now = new Date();
    const data = this._priceData(m, hass, now);
    const today = slotsForDay(data.slots, now).length;
    const tomorrow = slotsForDay(data.slots, now, 1).length;
    if (data.format === 'none') {
      return html`<div class="uc-ep-ed-note warn">
        <ha-icon icon="mdi:alert-outline"></ha-icon>
        <span>
          ${localize(
            'editor.energy_price.detected_none',
            lang,
            'This sensor has no price list, so only the current price is shown. Pick the sensor your price integration creates (for core Nord Pool or Tibber, choose the source under Advanced source).'
          )}
        </span>
      </div>`;
    }
    const source = SOURCE_LABELS[data.format];
    const counts = localize(
      'editor.energy_price.detected_counts',
      lang,
      '{today} prices today, {tomorrow} tomorrow'
    )
      .replace('{today}', String(today))
      .replace('{tomorrow}', String(tomorrow));
    return html`<div class="uc-ep-ed-note">
      <ha-icon icon="mdi:check-circle-outline"></ha-icon>
      <span>
        ${localize('editor.energy_price.detected', lang, 'Detected: {source}').replace(
          '{source}',
          source
        )}
        ·
        ${data.loading ? localize('editor.energy_price.loading', lang, 'Loading prices…') : counts}
        ${data.error ? html`<br />${data.error}` : nothing}
      </span>
    </div>`;
  }

  private _suggestedPriceEntities(hass: HomeAssistant): string[] {
    const states = (hass?.states || {}) as Record<string, EntityLike | undefined>;
    const registry = (hass as unknown as { entities?: Record<string, { platform?: string }> })
      ?.entities;
    const out: string[] = [];
    for (const [id, st] of Object.entries(states)) {
      if (!id.startsWith('sensor.')) continue;
      const fmt = detectPriceFormat(id, st?.attributes, registry?.[id]?.platform);
      if (fmt === 'none' || fmt === 'generic') continue;
      out.push(id);
      if (out.length >= 6) break;
    }
    return out;
  }

  private _renderSuggestions(
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const ids = this._suggestedPriceEntities(hass);
    if (!ids.length) return html``;
    return html`
      <div class="uc-ep-ed-sub">
        ${localize('editor.energy_price.suggestions', lang, 'Found price sensors — tap to use:')}
      </div>
      <div class="uc-ep-ed-chips">
        ${ids.map(
          id =>
            html`<button
              type="button"
              class="uc-ep-ed-chip"
              @click=${() => {
                updateModule({ price_entity: id } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }}
            >
              <ha-icon icon="mdi:flash"></ha-icon>
              <span>${String(hass.states[id]?.attributes?.friendly_name || id)}</span>
            </button>`
        )}
      </div>
    `;
  }

  private _renderDisplaySection(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const toggle = (key: keyof EnergyPriceModule, title: string, desc: string, def = true) => ({
      title,
      description: desc,
      hass,
      data: { [key]: def ? m[key] !== false : m[key] === true },
      schema: [this.booleanField(String(key))],
      onChange: (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] ?? def } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
    });
    return html`
      ${this.renderSettingsSection(
        localize('editor.energy_price.display_section', lang, 'Display'),
        localize('editor.energy_price.display_section_desc', lang, 'Choose what the card shows.'),
        [
          {
            title: localize('editor.energy_price.title', lang, 'Title'),
            description: localize(
              'editor.energy_price.title_desc',
              lang,
              'Leave blank for “Electricity price”.'
            ),
            hass,
            data: { title: m.title || '' },
            schema: [this.textField('title')],
            onChange: (e: CustomEvent) => {
              updateModule({ title: e.detail.value?.title ?? '' } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          toggle(
            'show_title',
            localize('editor.energy_price.show_title', lang, 'Show title'),
            localize('editor.energy_price.show_title_desc', lang, 'Header with the source name.')
          ),
          toggle(
            'show_current',
            localize('editor.energy_price.show_current', lang, 'Current price'),
            localize(
              'editor.energy_price.show_current_desc',
              lang,
              'Big current price with its cheap / normal / expensive level.'
            )
          ),
          toggle(
            'show_stats',
            localize('editor.energy_price.show_stats', lang, 'Today’s low, average and high'),
            localize(
              'editor.energy_price.show_stats_desc',
              lang,
              'Three small figures under the price.'
            )
          ),
          toggle(
            'show_chart',
            localize('editor.energy_price.show_chart', lang, 'Price chart'),
            localize(
              'editor.energy_price.show_chart_desc',
              lang,
              'Bars colored by price level, with the current time marked.'
            )
          ),
          toggle(
            'show_tomorrow',
            localize('editor.energy_price.show_tomorrow', lang, 'Include tomorrow'),
            localize(
              'editor.energy_price.show_tomorrow_desc',
              lang,
              'Extend the chart once tomorrow’s prices are published (usually early afternoon).'
            )
          ),
          toggle(
            'show_cheapest_window',
            localize('editor.energy_price.show_window', lang, 'Cheapest time to run'),
            localize(
              'editor.energy_price.show_window_desc',
              lang,
              'The cheapest block of time ahead, e.g. when to start the dishwasher.'
            )
          ),
        ]
      )}
      ${
        m.show_cheapest_window !== false
          ? this.renderConditionalFieldsGroup(
              localize('editor.energy_price.window_group', lang, 'Cheapest time to run'),
              html`
                ${this.renderSliderField(
                  localize('editor.energy_price.window_hours', lang, 'Run length'),
                  localize(
                    'editor.energy_price.window_hours_desc',
                    lang,
                    'How long the appliance runs. The card finds the cheapest unbroken block this long.'
                  ),
                  num(m.window_hours, DEFAULT_WINDOW_HOURS),
                  DEFAULT_WINDOW_HOURS,
                  0.5,
                  12,
                  0.5,
                  (v: number) => updateModule({ window_hours: v } as Partial<CardModule>),
                  ' h'
                )}
                ${this.renderFieldSection(
                  localize('editor.energy_price.window_label', lang, 'Appliance name'),
                  localize(
                    'editor.energy_price.window_label_desc',
                    lang,
                    'Optional, e.g. “Dishwasher” → “Dishwasher: start at 02:00”.'
                  ),
                  hass,
                  { window_label: m.window_label || '' },
                  [this.textField('window_label')],
                  (e: CustomEvent) => {
                    updateModule({
                      window_label: e.detail.value?.window_label ?? '',
                    } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }
                )}
              `
            )
          : nothing
      }
    `;
  }

  private _entityField(
    hass: HomeAssistant,
    m: EnergyPriceModule,
    key: keyof EnergyPriceModule,
    title: string,
    description: string,
    domains: string[],
    updateModule: UpdateFn
  ): TemplateResult {
    const value = m[key];
    return this.renderFieldSection(
      title,
      description,
      hass,
      { [key]: typeof value === 'string' ? value : '' },
      [{ name: String(key), selector: { entity: { domain: domains } } }],
      (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] ?? '' } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      }
    );
  }

  private _numberField(
    hass: HomeAssistant,
    m: EnergyPriceModule,
    key: keyof EnergyPriceModule,
    title: string,
    description: string,
    fallback: number,
    opts: { min?: number; max?: number; step?: number; unit?: string },
    updateModule: UpdateFn
  ): TemplateResult {
    const selector: Record<string, unknown> = { mode: 'box', step: opts.step ?? 0.01 };
    if (opts.min !== undefined) selector.min = opts.min;
    if (opts.max !== undefined) selector.max = opts.max;
    if (opts.unit) selector.unit_of_measurement = opts.unit;
    return this.renderFieldSection(
      title,
      description,
      hass,
      { [key]: num(m[key], fallback) },
      [{ name: String(key), selector: { number: selector } }],
      (e: CustomEvent) => {
        const v = toNumber(e.detail.value?.[key]);
        updateModule({ [key]: v === null ? fallback : v } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      }
    );
  }

  private _renderEvSection(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const enabled = m.ev_enabled === true;
    const applyMode: EnergyPriceEvApplyMode = m.ev_apply_mode || 'none';
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.energy_price.ev_section', lang, 'EV smart charging')}
        </div>
        ${this.renderFieldSection(
          localize('editor.energy_price.ev_enabled', lang, 'Plan EV charging'),
          localize(
            'editor.energy_price.ev_enabled_desc',
            lang,
            'Plan the cheapest hours to reach your target battery level by departure.'
          ),
          hass,
          { ev_enabled: enabled },
          [this.booleanField('ev_enabled')],
          (e: CustomEvent) => {
            updateModule({
              ev_enabled: e.detail.value?.ev_enabled === true,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${
          enabled
            ? html`
                <div class="field-container">
                  <div class="field-title">
                    ${localize('editor.energy_price.ev_soc_entity', lang, 'Battery level sensor')}
                  </div>
                  <div class="field-description">
                    ${localize(
                      'editor.energy_price.ev_soc_entity_desc',
                      lang,
                      'Your car’s state of charge in %. Without it the plan uses a fixed number of hours (Advanced charging).'
                    )}
                  </div>
                  ${this.renderEntityPickerWithVariables(
                    hass,
                    config,
                    'ev_soc_entity',
                    m.ev_soc_entity || '',
                    (value: string) => {
                      updateModule({ ev_soc_entity: value } as Partial<CardModule>);
                      this.triggerPreviewUpdate();
                    },
                    ['sensor', 'input_number', 'number']
                  )}
                </div>
                ${this._entityField(
                  hass,
                  m,
                  'ev_charger_entity',
                  localize('editor.energy_price.ev_charger_entity', lang, 'Charger switch'),
                  localize(
                    'editor.energy_price.ev_charger_entity_desc',
                    lang,
                    'Optional: the switch that starts and stops charging. Shows whether the charger is on.'
                  ),
                  ['switch', 'input_boolean'],
                  updateModule
                )}
                ${this.renderSliderField(
                  localize('editor.energy_price.ev_target_soc', lang, 'Target level'),
                  localize(
                    'editor.energy_price.ev_target_soc_desc',
                    lang,
                    'Charge up to this level.'
                  ),
                  num(m.ev_target_soc, DEFAULT_TARGET_SOC),
                  DEFAULT_TARGET_SOC,
                  10,
                  100,
                  5,
                  (v: number) => updateModule({ ev_target_soc: v } as Partial<CardModule>),
                  '%'
                )}
                ${this.renderFieldSection(
                  localize('editor.energy_price.ev_departure_time', lang, 'Departure'),
                  localize(
                    'editor.energy_price.ev_departure_time_desc',
                    lang,
                    'The car should be charged by this time (next occurrence).'
                  ),
                  hass,
                  { ev_departure_time: `${m.ev_departure_time || DEFAULT_DEPARTURE}:00` },
                  [{ name: 'ev_departure_time', selector: { time: {} } }],
                  (e: CustomEvent) => {
                    const t = parseTimeOfDay(e.detail.value?.ev_departure_time);
                    if (!t) return;
                    const hhmm = `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}`;
                    updateModule({ ev_departure_time: hhmm } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }
                )}
                ${this._numberField(
                  hass,
                  m,
                  'ev_capacity_kwh',
                  localize('editor.energy_price.ev_capacity', lang, 'Battery size'),
                  localize(
                    'editor.energy_price.ev_capacity_desc',
                    lang,
                    'Usable battery capacity.'
                  ),
                  DEFAULT_CAPACITY_KWH,
                  { min: 1, max: 300, step: 1, unit: 'kWh' },
                  updateModule
                )}
                ${this._numberField(
                  hass,
                  m,
                  'ev_power_kw',
                  localize('editor.energy_price.ev_power', lang, 'Charging power'),
                  localize(
                    'editor.energy_price.ev_power_desc',
                    lang,
                    'Typical home chargers: 3.7, 7.4 or 11 kW.'
                  ),
                  DEFAULT_POWER_KW,
                  { min: 0.5, max: 350, step: 0.1, unit: 'kW' },
                  updateModule
                )}
                ${this.renderConditionalFieldsGroup(
                  localize('editor.energy_price.ev_advanced', lang, 'Advanced charging'),
                  html`
                    ${this.renderFieldSection(
                      localize(
                        'editor.energy_price.ev_allow_split',
                        lang,
                        'Split into cheapest hours'
                      ),
                      localize(
                        'editor.energy_price.ev_allow_split_desc',
                        lang,
                        'On: pick the cheapest hours anywhere before departure. Off: one unbroken session.'
                      ),
                      hass,
                      { ev_allow_split: m.ev_allow_split !== false },
                      [this.booleanField('ev_allow_split')],
                      (e: CustomEvent) => {
                        updateModule({
                          ev_allow_split: e.detail.value?.ev_allow_split !== false,
                        } as Partial<CardModule>);
                        this.triggerPreviewUpdate();
                      }
                    )}
                    ${this._numberField(
                      hass,
                      m,
                      'ev_efficiency',
                      localize('editor.energy_price.ev_efficiency', lang, 'Charging efficiency'),
                      localize(
                        'editor.energy_price.ev_efficiency_desc',
                        lang,
                        'Share of grid energy that ends up in the battery.'
                      ),
                      DEFAULT_EFFICIENCY,
                      { min: 50, max: 100, step: 1, unit: '%' },
                      updateModule
                    )}
                    ${this._numberField(
                      hass,
                      m,
                      'ev_manual_hours',
                      localize('editor.energy_price.ev_manual_hours', lang, 'Hours to charge'),
                      localize(
                        'editor.energy_price.ev_manual_hours_desc',
                        lang,
                        'Used when there is no battery level sensor.'
                      ),
                      DEFAULT_MANUAL_HOURS,
                      { min: 0, max: 48, step: 0.5, unit: 'h' },
                      updateModule
                    )}
                    ${this._entityField(
                      hass,
                      m,
                      'ev_target_soc_entity',
                      localize('editor.energy_price.ev_target_entity', lang, 'Target level entity'),
                      localize(
                        'editor.energy_price.ev_target_entity_desc',
                        lang,
                        'Optional number / input_number that overrides the target level.'
                      ),
                      ['number', 'input_number', 'sensor'],
                      updateModule
                    )}
                    ${this._entityField(
                      hass,
                      m,
                      'ev_departure_entity',
                      localize('editor.energy_price.ev_departure_entity', lang, 'Departure entity'),
                      localize(
                        'editor.energy_price.ev_departure_entity_desc',
                        lang,
                        'Optional input_datetime or timestamp sensor that overrides the departure time.'
                      ),
                      ['input_datetime', 'sensor'],
                      updateModule
                    )}
                    ${this._entityField(
                      hass,
                      m,
                      'ev_power_entity',
                      localize('editor.energy_price.ev_power_entity', lang, 'Charger power sensor'),
                      localize(
                        'editor.energy_price.ev_power_entity_desc',
                        lang,
                        'Optional. While it reports more than 0 it replaces the charging power above.'
                      ),
                      ['sensor'],
                      updateModule
                    )}
                  `
                )}
                ${this.renderConditionalFieldsGroup(
                  localize('editor.energy_price.ev_apply_group', lang, 'Apply plan button'),
                  html`
                    <div class="uc-ep-ed-desc">
                      ${localize(
                        'editor.energy_price.ev_apply_desc',
                        lang,
                        'Nothing runs on its own: the button only acts when you tap it. For fully automatic charging, send the plan to a script or set helper times that an automation uses.'
                      )}
                    </div>
                    ${this.renderSegmentedField(
                      localize('editor.energy_price.ev_apply_mode', lang, 'Button'),
                      '',
                      applyMode,
                      [
                        {
                          value: 'none',
                          label: localize('editor.energy_price.apply_none', lang, 'Off'),
                        },
                        {
                          value: 'charger',
                          label: localize(
                            'editor.energy_price.apply_charger',
                            lang,
                            'Charger on/off'
                          ),
                        },
                        {
                          value: 'script',
                          label: localize('editor.energy_price.apply_script', lang, 'Run script'),
                        },
                        {
                          value: 'datetime',
                          label: localize(
                            'editor.energy_price.apply_datetime',
                            lang,
                            'Set helper times'
                          ),
                        },
                      ],
                      (next: string) =>
                        updateModule({
                          ev_apply_mode: (next || 'none') as EnergyPriceEvApplyMode,
                        } as Partial<CardModule>)
                    )}
                    ${
                      applyMode === 'script'
                        ? this._entityField(
                            hass,
                            m,
                            'ev_script_entity',
                            localize('editor.energy_price.ev_script', lang, 'Script'),
                            localize(
                              'editor.energy_price.ev_script_desc',
                              lang,
                              'Receives charge_start, charge_end, ranges, kwh, cost, target_soc and departure as variables.'
                            ),
                            ['script'],
                            updateModule
                          )
                        : nothing
                    }
                    ${
                      applyMode === 'datetime'
                        ? html`
                            ${this._entityField(
                              hass,
                              m,
                              'ev_start_entity',
                              localize(
                                'editor.energy_price.ev_start_entity',
                                lang,
                                'Start time helper'
                              ),
                              localize(
                                'editor.energy_price.ev_start_entity_desc',
                                lang,
                                'input_datetime set to the first planned start.'
                              ),
                              ['input_datetime'],
                              updateModule
                            )}
                            ${this._entityField(
                              hass,
                              m,
                              'ev_end_entity',
                              localize(
                                'editor.energy_price.ev_end_entity',
                                lang,
                                'End time helper'
                              ),
                              localize(
                                'editor.energy_price.ev_end_entity_desc',
                                lang,
                                'Optional input_datetime set to the last planned end.'
                              ),
                              ['input_datetime'],
                              updateModule
                            )}
                          `
                        : nothing
                    }
                    ${
                      applyMode === 'charger' && !m.ev_charger_entity
                        ? html`<div class="uc-ep-ed-note warn">
                            <ha-icon icon="mdi:alert-outline"></ha-icon>
                            <span>
                              ${localize(
                                'editor.energy_price.apply_needs_charger',
                                lang,
                                'Pick the charger switch above to use this button.'
                              )}
                            </span>
                          </div>`
                        : nothing
                    }
                  `
                )}
              `
            : nothing
        }
      </div>
    `;
  }

  private _renderLevelsSection(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const mode: EnergyPriceLevelMode = m.level_mode || 'relative';
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.energy_price.levels_section', lang, 'Price levels')}
        </div>
        ${this.renderSegmentedField(
          localize('editor.energy_price.level_mode', lang, 'Cheap and expensive by'),
          localize(
            'editor.energy_price.level_mode_desc',
            lang,
            'Relative: position in the day’s low–high range. Percentile: share of the day’s prices. Fixed: your own price limits.'
          ),
          mode,
          [
            {
              value: 'relative',
              label: localize('editor.energy_price.mode_relative', lang, 'Relative'),
            },
            {
              value: 'percentile',
              label: localize('editor.energy_price.mode_percentile', lang, 'Percentile'),
            },
            {
              value: 'absolute',
              label: localize('editor.energy_price.mode_absolute', lang, 'Fixed'),
            },
          ],
          (next: string) =>
            updateModule({
              level_mode: (next || 'relative') as EnergyPriceLevelMode,
            } as Partial<CardModule>)
        )}
        ${
          mode === 'absolute'
            ? html`
                ${this._numberField(
                  hass,
                  m,
                  'cheap_price',
                  localize('editor.energy_price.cheap_price', lang, 'Cheap at or below'),
                  localize(
                    'editor.energy_price.cheap_price_desc',
                    lang,
                    'In the displayed price unit.'
                  ),
                  0.1,
                  { step: 0.001 },
                  updateModule
                )}
                ${this._numberField(
                  hass,
                  m,
                  'expensive_price',
                  localize('editor.energy_price.expensive_price', lang, 'Expensive at or above'),
                  localize(
                    'editor.energy_price.expensive_price_desc',
                    lang,
                    'In the displayed price unit.'
                  ),
                  0.3,
                  { step: 0.001 },
                  updateModule
                )}
              `
            : html`
                ${this.renderSliderField(
                  localize('editor.energy_price.cheap_percent', lang, 'Cheap up to'),
                  '',
                  num(m.cheap_percent, 33),
                  33,
                  0,
                  100,
                  1,
                  (v: number) => updateModule({ cheap_percent: v } as Partial<CardModule>),
                  '%'
                )}
                ${this.renderSliderField(
                  localize('editor.energy_price.expensive_percent', lang, 'Expensive from'),
                  '',
                  num(m.expensive_percent, 67),
                  67,
                  0,
                  100,
                  1,
                  (v: number) => updateModule({ expensive_percent: v } as Partial<CardModule>),
                  '%'
                )}
              `
        }
        ${this.renderConditionalFieldsGroup(
          localize('editor.energy_price.colors_group', lang, 'Level colors'),
          html`
            ${this.renderColorField(
              localize('editor.energy_price.cheap_color', lang, 'Cheap'),
              '',
              hass,
              m.cheap_color || '',
              DEFAULT_COLORS.cheap,
              (v: string) => updateModule({ cheap_color: v } as Partial<CardModule>)
            )}
            ${this.renderColorField(
              localize('editor.energy_price.normal_color', lang, 'Normal'),
              '',
              hass,
              m.normal_color || '',
              DEFAULT_COLORS.normal,
              (v: string) => updateModule({ normal_color: v } as Partial<CardModule>)
            )}
            ${this.renderColorField(
              localize('editor.energy_price.expensive_color', lang, 'Expensive'),
              '',
              hass,
              m.expensive_color || '',
              DEFAULT_COLORS.expensive,
              (v: string) => updateModule({ expensive_color: v } as Partial<CardModule>)
            )}
          `
        )}
      </div>
    `;
  }

  private _renderAdjustSection(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.energy_price.adjust_section', lang, 'Price adjustments')}
        </div>
        <div class="uc-ep-ed-desc">
          ${localize(
            'editor.energy_price.adjust_section_desc',
            lang,
            'Shown price = source price × multiplier + fee. Use it for VAT, grid fees or a supplier markup when your sensor shows the bare spot price.'
          )}
        </div>
        ${this._numberField(
          hass,
          m,
          'price_multiplier',
          localize('editor.energy_price.multiplier', lang, 'Multiplier'),
          localize('editor.energy_price.multiplier_desc', lang, 'e.g. 1.25 for 25% VAT.'),
          1,
          { min: 0, max: 1000, step: 0.01 },
          updateModule
        )}
        ${this._numberField(
          hass,
          m,
          'price_additive',
          localize('editor.energy_price.additive', lang, 'Fixed fee per kWh'),
          localize('editor.energy_price.additive_desc', lang, 'Added after the multiplier.'),
          0,
          { step: 0.001 },
          updateModule
        )}
        ${this.renderFieldSection(
          localize('editor.energy_price.unit_override', lang, 'Unit'),
          localize(
            'editor.energy_price.unit_override_desc',
            lang,
            'Leave blank to use the sensor’s unit, e.g. “SEK/kWh”.'
          ),
          hass,
          { unit_override: m.unit_override || '' },
          [this.textField('unit_override')],
          (e: CustomEvent) => {
            updateModule({
              unit_override: e.detail.value?.unit_override ?? '',
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSliderField(
          localize('editor.energy_price.decimals', lang, 'Decimals'),
          '',
          num(m.decimals, 2),
          2,
          0,
          4,
          1,
          (v: number) => updateModule({ decimals: v } as Partial<CardModule>),
          ''
        )}
      </div>
    `;
  }

  private _renderSourceSection(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const source: EnergyPriceSource = m.price_source || 'auto';
    const options: Array<{ value: EnergyPriceSource; label: string }> = [
      { value: 'auto', label: localize('editor.energy_price.source_auto', lang, 'Auto-detect') },
      { value: 'nordpool', label: 'Nord Pool (HACS)' },
      { value: 'nordpool_core', label: 'Nord Pool (core)' },
      { value: 'tibber', label: 'Tibber' },
      { value: 'octopus', label: 'Octopus Energy' },
      { value: 'entsoe', label: 'ENTSO-e' },
      { value: 'energi_data_service', label: 'Energi Data Service' },
      { value: 'amber', label: 'Amber Electric' },
      {
        value: 'generic',
        label: localize('editor.energy_price.source_generic', lang, 'Generic list'),
      },
    ];
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.energy_price.source_section', lang, 'Advanced source')}
        </div>
        ${this.renderFieldSection(
          localize('editor.energy_price.price_source', lang, 'Price source'),
          localize(
            'editor.energy_price.price_source_desc',
            lang,
            'Auto-detect works for almost everyone. Pick a source only if detection gets it wrong.'
          ),
          hass,
          { price_source: source },
          [this.selectField('price_source', options)],
          (e: CustomEvent) => {
            updateModule({
              price_source: (e.detail.value?.price_source || 'auto') as EnergyPriceSource,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${
          source === 'nordpool_core' || source === 'tibber' || source === 'auto'
            ? this.renderFieldSection(
                localize('editor.energy_price.source_hint', lang, 'Area or home name'),
                localize(
                  'editor.energy_price.source_hint_desc',
                  lang,
                  'Core Nord Pool area (e.g. SE3) or Tibber home name when your account has several.'
                ),
                hass,
                { source_hint: m.source_hint || '' },
                [this.textField('source_hint')],
                (e: CustomEvent) => {
                  updateModule({
                    source_hint: e.detail.value?.source_hint ?? '',
                  } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )
            : nothing
        }
        ${
          source === 'nordpool_core'
            ? this.renderFieldSection(
                localize('editor.energy_price.config_entry', lang, 'Nord Pool config entry'),
                localize(
                  'editor.energy_price.config_entry_desc',
                  lang,
                  'Usually found automatically from the sensor. Only needed if prices do not load.'
                ),
                hass,
                { nordpool_config_entry: m.nordpool_config_entry || '' },
                [
                  {
                    name: 'nordpool_config_entry',
                    selector: { config_entry: { integration: 'nordpool' } },
                  },
                ],
                (e: CustomEvent) => {
                  updateModule({
                    nordpool_config_entry: e.detail.value?.nordpool_config_entry ?? '',
                  } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )
            : nothing
        }
        ${this.renderSliderField(
          localize('editor.energy_price.chart_hours', lang, 'Chart span'),
          localize(
            'editor.energy_price.chart_hours_desc',
            lang,
            '0 shows today (and tomorrow when published). Otherwise a rolling window from the current hour.'
          ),
          num(m.chart_hours, 0),
          0,
          0,
          48,
          1,
          (v: number) => updateModule({ chart_hours: v } as Partial<CardModule>),
          ' h'
        )}
        ${this.renderSliderField(
          localize('editor.energy_price.chart_height', lang, 'Chart height'),
          '',
          num(m.chart_height, DEFAULT_CHART_HEIGHT),
          DEFAULT_CHART_HEIGHT,
          60,
          300,
          10,
          (v: number) => updateModule({ chart_height: v } as Partial<CardModule>),
          'px'
        )}
      </div>
    `;
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as EnergyPriceModule;
    const lang = hass?.locale?.language || 'en';

    if (!m.price_entity) {
      return this.renderGradientErrorState(
        localize('editor.energy_price.setup_title', lang, 'Pick your electricity price sensor'),
        localize(
          'editor.energy_price.setup_desc',
          lang,
          'Choose a Nord Pool, Tibber, Octopus or other price sensor in the General tab. The format is detected automatically.'
        ),
        'mdi:ev-station'
      );
    }
    if (!hass?.states?.[m.price_entity]) {
      return this.renderGradientErrorState(
        localize('editor.energy_price.missing_title', lang, 'Price sensor not found'),
        m.price_entity,
        'mdi:flash-off'
      );
    }

    const now = new Date();
    const data = this._priceData(m, hass, now);
    const colors = this._colors(m);
    const levelCfg = this._levelConfig(m);
    const ev = m.ev_enabled ? this._evView(m, hass, data.slots, now) : null;
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    const body = html`
      ${m.show_title !== false ? this._renderHeader(m, data, lang) : nothing}
      ${
        data.error && !data.slots.length
          ? html`<div class="uc-ep-banner">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <span>${data.error}</span>
            </div>`
          : nothing
      }
      ${m.show_current !== false ? this._renderCurrent(m, hass, data, levelCfg, colors, lang, now) : nothing}
      ${m.show_stats !== false ? this._renderStats(m, data, lang, now) : nothing}
      ${m.show_chart !== false ? this._renderChart(m, data, levelCfg, colors, ev, lang, now) : nothing}
      ${m.show_cheapest_window !== false ? this._renderWindow(m, data, lang, now) : nothing}
      ${ev ? this._renderEv(m, hass, data, ev, lang, now) : nothing}
    `;

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="uc-ep-wrapper ${hoverClass}"
        data-uc-role="pane"
        style="background: var(--uc-pane-bg, var(--card-background-color)); ${designStyles}"
      >
        ${this.wrapWithAnimation(body, module, hass)}
      </div>
    `;
  }

  private _renderHeader(m: EnergyPriceModule, data: PriceData, lang: string): TemplateResult {
    const title =
      m.title?.trim() || localize('editor.energy_price.default_title', lang, 'Electricity price');
    const source = SOURCE_LABELS[data.format];
    return html`<div class="uc-ep-header">
      <ha-icon icon="mdi:flash"></ha-icon>
      <span class="uc-ep-title">${title}</span>
      ${source ? html`<span class="uc-ep-source">${source}</span>` : nothing}
    </div>`;
  }

  private _renderCurrent(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    data: PriceData,
    levelCfg: LevelConfig,
    colors: Record<PriceLevel, string>,
    lang: string,
    now: Date
  ): TemplateResult {
    if (data.current === null) {
      return html`<div class="uc-ep-muted">
        ${
          data.loading
            ? localize('editor.energy_price.loading', lang, 'Loading prices…')
            : localize('editor.energy_price.no_current', lang, 'No current price yet.')
        }
      </div>`;
    }
    const level = priceLevel(data.current, this._dayRefs(data.slots, now), levelCfg);
    const color = colors[level];
    const next = data.nextSlot;
    const until = data.currentSlot
      ? localize('editor.energy_price.until', lang, 'until {time}').replace(
          '{time}',
          this._fmtTime(data.currentSlot.end, lang, now)
        )
      : '';
    return html`<button
      type="button"
      class="uc-ep-current"
      title=${localize('editor.energy_price.more_info', lang, 'Show details')}
      @click=${(e: Event) => this._moreInfo(e, m.price_entity)}
    >
      <div class="uc-ep-current-main">
        <span class="uc-ep-price">${this._fmtPrice(data.current, m, lang)}</span>
        ${data.unit ? html`<span class="uc-ep-unit">${data.unit}</span>` : nothing}
      </div>
      <div class="uc-ep-current-side">
        <span class="uc-ep-level" style="--uc-ep-level: ${color};"
          >${this._levelLabel(level, lang)}</span
        >
        ${until ? html`<span class="uc-ep-muted">${until}</span>` : nothing}
        ${
          next
            ? html`<span class="uc-ep-muted uc-ep-next">
                <ha-icon
                  icon=${
                    next.price > data.current
                      ? 'mdi:arrow-top-right'
                      : next.price < data.current
                        ? 'mdi:arrow-bottom-right'
                        : 'mdi:arrow-right'
                  }
                ></ha-icon>
                ${this._fmtPrice(next.price, m, lang)}
              </span>`
            : nothing
        }
      </div>
    </button>`;
  }

  private _renderStats(
    m: EnergyPriceModule,
    data: PriceData,
    lang: string,
    now: Date
  ): TemplateResult | typeof nothing {
    const stats = computeStats(slotsForDay(data.slots, now));
    if (!stats) return nothing;
    const cell = (label: string, value: number, when: Date | null) =>
      html`<div class="uc-ep-stat">
        <span class="uc-ep-stat-label">${label}</span>
        <span class="uc-ep-stat-value">${this._fmtPrice(value, m, lang)}</span>
        ${when ? html`<span class="uc-ep-stat-time">${this._fmtTime(when, lang, now)}</span>` : nothing}
      </div>`;
    return html`<div class="uc-ep-stats">
      ${cell(localize('editor.energy_price.stat_low', lang, 'Low'), stats.min, stats.minSlot.start)}
      ${cell(localize('editor.energy_price.stat_avg', lang, 'Average'), stats.avg, null)}
      ${cell(localize('editor.energy_price.stat_high', lang, 'High'), stats.max, stats.maxSlot.start)}
    </div>`;
  }

  private _renderChart(
    m: EnergyPriceModule,
    data: PriceData,
    levelCfg: LevelConfig,
    colors: Record<PriceLevel, string>,
    ev: EvView | null,
    lang: string,
    now: Date
  ): TemplateResult {
    const range = chartRange(data.slots, now, num(m.chart_hours, 0), m.show_tomorrow !== false);
    const visible = slotsInRange(data.slots, range.start, range.end);
    if (!visible.length) {
      if (data.loading) return html``;
      return html`<div class="uc-ep-muted uc-ep-nochart">
        ${
          data.format === 'none'
            ? localize(
                'editor.energy_price.no_list',
                lang,
                'This sensor has no price list to chart. Pick the sensor your price integration creates.'
              )
            : localize(
                'editor.energy_price.no_prices',
                lang,
                'No prices published for this period yet.'
              )
        }
      </div>`;
    }

    const t0 = range.start.getTime();
    const span = Math.max(1, range.end.getTime() - t0);
    const W = 1000;
    const H = 100;
    const x = (t: number): number => ((clamp(t, t0, t0 + span) - t0) / span) * W;
    let lo = Math.min(0, ...visible.map(s => s.price));
    let hi = Math.max(0, ...visible.map(s => s.price));
    if (hi - lo < 1e-9) {
      hi = lo + 1;
    }
    const pad = (hi - lo) * 0.06;
    hi += pad;
    if (lo < 0) lo -= pad;
    const y = (v: number): number => H - ((v - lo) / (hi - lo)) * H;
    const zeroY = y(0);
    const nowMs = now.getTime();

    const refsByDay = new Map<string, number[]>();
    const refsFor = (d: Date): number[] => {
      const key = localDateKey(d);
      let refs = refsByDay.get(key);
      if (!refs) {
        refs = this._dayRefs(data.slots, d);
        refsByDay.set(key, refs);
      }
      return refs;
    };

    const windowHours = num(m.window_hours, DEFAULT_WINDOW_HOURS);
    const win =
      m.show_cheapest_window !== false ? findCheapestWindow(data.slots, now, windowHours) : null;

    const bars = visible.map(s => {
      const x1 = x(s.start.getTime());
      const x2 = x(s.end.getTime());
      const w = Math.max(0.5, x2 - x1 - Math.min(2, (x2 - x1) * 0.15));
      const top = Math.min(y(s.price), zeroY);
      const h = Math.max(0.8, Math.abs(zeroY - y(s.price)));
      const level = priceLevel(s.price, refsFor(s.start), levelCfg);
      const past = s.end.getTime() <= nowMs;
      const current = s.start.getTime() <= nowMs && nowMs < s.end.getTime();
      return svg`<rect
        x=${x1.toFixed(2)}
        y=${top.toFixed(2)}
        width=${w.toFixed(2)}
        height=${h.toFixed(2)}
        rx="1.5"
        style="fill: ${colors[level]}; opacity: ${past ? 0.35 : current ? 1 : 0.8};"
      ></rect>`;
    });

    const bands: TemplateResult[] = [];
    if (win) {
      bands.push(
        svg`<rect class="uc-ep-band" x=${x(win.start.getTime()).toFixed(2)} y="0"
          width=${Math.max(1, x(win.end.getTime()) - x(win.start.getTime())).toFixed(2)}
          height=${H}></rect>`
      );
    }
    const planStrips =
      ev && ev.plan.ranges.length
        ? ev.plan.ranges.map(
            r =>
              html`<span
                class="uc-ep-plan-strip"
                style="left: ${((x(r.start.getTime()) / W) * 100).toFixed(2)}%; width: ${(
                  ((x(r.end.getTime()) - x(r.start.getTime())) / W) *
                  100
                ).toFixed(2)}%;"
              ></span>`
          )
        : [];

    const nowInRange = nowMs >= t0 && nowMs <= t0 + span;
    const ticks = this._chartTicks(range, lang);
    const height = clamp(num(m.chart_height, DEFAULT_CHART_HEIGHT), 40, 600);
    const unit = data.unit;
    const label = localize(
      'editor.energy_price.chart_label',
      lang,
      'Price chart from {start} to {end}'
    )
      .replace('{start}', this._fmtTime(range.start, lang, now))
      .replace('{end}', this._fmtTime(range.end, lang, now));

    return html`<div class="uc-ep-chart">
      <div class="uc-ep-chart-area" style="height: ${height}px;">
        <span class="uc-ep-axis uc-ep-axis-top"
          >${this._fmtPrice(hi - pad, m, lang)}${unit ? ` ${unit}` : ''}</span
        >
        <svg
          viewBox="0 0 ${W} ${H}"
          preserveAspectRatio="none"
          role="img"
          aria-label=${label}
          class="uc-ep-svg"
        >
          ${bands}
          ${
            lo < 0
              ? svg`<line class="uc-ep-zero" x1="0" x2=${W} y1=${zeroY.toFixed(2)} y2=${zeroY.toFixed(2)}></line>`
              : nothing
          }
          ${bars}
        </svg>
        ${
          nowInRange
            ? html`<span
                class="uc-ep-now"
                style="left: ${((x(nowMs) / W) * 100).toFixed(2)}%;"
              ></span>`
            : nothing
        }
      </div>
      ${planStrips.length ? html`<div class="uc-ep-plan-row">${planStrips}</div>` : nothing}
      <div class="uc-ep-ticks">
        ${ticks.map(
          t =>
            html`<span
              class="uc-ep-tick ${t.pct < 4 ? 'start' : t.pct > 96 ? 'end' : ''}"
              style="left: ${t.pct.toFixed(2)}%;"
              >${t.label}</span
            >`
        )}
      </div>
      <div class="uc-ep-legend">
        <span><i style="background: ${colors.cheap};"></i>${this._levelLabel('cheap', lang)}</span>
        <span
          ><i style="background: ${colors.normal};"></i>${this._levelLabel('normal', lang)}</span
        >
        <span
          ><i style="background: ${colors.expensive};"></i
          >${this._levelLabel('expensive', lang)}</span
        >
        ${
          win
            ? html`<span
                ><i class="band"></i
                >${localize('editor.energy_price.legend_window', lang, 'Cheapest run')}</span
              >`
            : nothing
        }
        ${
          planStrips.length
            ? html`<span
                ><i class="plan"></i
                >${localize('editor.energy_price.legend_plan', lang, 'EV charging')}</span
              >`
            : nothing
        }
      </div>
    </div>`;
  }

  private _chartTicks(range: TimeRange, lang: string): Array<{ pct: number; label: string }> {
    const t0 = range.start.getTime();
    const span = range.end.getTime() - t0;
    if (span <= 0) return [];
    const hours = span / HOUR_MS;
    const step = hours <= 8 ? 2 : hours <= 14 ? 3 : 6;
    const out: Array<{ pct: number; label: string }> = [];
    const cursor = new Date(t0);
    cursor.setMinutes(0, 0, 0);
    if (cursor.getTime() < t0) cursor.setTime(cursor.getTime() + HOUR_MS);
    for (let i = 0; i < 80 && cursor.getTime() <= range.end.getTime(); i++) {
      if (cursor.getHours() % step === 0) {
        let label: string;
        try {
          label = cursor.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
        } catch {
          label = `${String(cursor.getHours()).padStart(2, '0')}:00`;
        }
        out.push({ pct: ((cursor.getTime() - t0) / span) * 100, label });
      }
      cursor.setTime(cursor.getTime() + HOUR_MS);
    }
    return out;
  }

  private _renderWindow(
    m: EnergyPriceModule,
    data: PriceData,
    lang: string,
    now: Date
  ): TemplateResult | typeof nothing {
    if (!data.slots.length) return nothing;
    const hours = num(m.window_hours, DEFAULT_WINDOW_HOURS);
    const win: PriceWindow | null = findCheapestWindow(data.slots, now, hours);
    const lengthText = this._fmtDuration(hours * HOUR_MS, lang);
    if (!win) {
      return html`<div class="uc-ep-row">
        <ha-icon icon="mdi:clock-outline"></ha-icon>
        <div class="uc-ep-row-text">
          <span class="uc-ep-muted">
            ${localize(
              'editor.energy_price.window_none',
              lang,
              'Not enough published prices ahead for a {length} run.'
            ).replace('{length}', lengthText)}
          </span>
        </div>
      </div>`;
    }
    const startsNow = win.start.getTime() - now.getTime() < 60000;
    const startText = startsNow
      ? localize('editor.energy_price.start_now', lang, 'now')
      : this._fmtTime(win.start, lang, now);
    const label = (m.window_label || '').trim();
    const headline = label
      ? localize('editor.energy_price.window_labeled', lang, '{label}: start {time}')
          .replace('{label}', label)
          .replace('{time}', startText)
      : localize('editor.energy_price.window_headline', lang, 'Cheapest {length}: start {time}')
          .replace('{length}', lengthText)
          .replace('{time}', startText);
    const avg = `${this._fmtPrice(win.avgPrice, m, lang)}${data.unit ? ` ${data.unit}` : ''}`;
    const detail = startsNow
      ? localize('editor.energy_price.window_detail_now', lang, 'Until {end} · avg {price}')
          .replace('{end}', this._fmtTime(win.end, lang, now))
          .replace('{price}', avg)
      : localize('editor.energy_price.window_detail', lang, '{range} · avg {price} · in {wait}')
          .replace('{range}', this._fmtRange(win, lang, now))
          .replace('{price}', avg)
          .replace('{wait}', this._fmtDuration(win.start.getTime() - now.getTime(), lang));
    return html`<div class="uc-ep-row">
      <ha-icon icon=${startsNow ? 'mdi:play-circle-outline' : 'mdi:clock-check-outline'}></ha-icon>
      <div class="uc-ep-row-text">
        <span class="uc-ep-row-title">${headline}</span>
        <span class="uc-ep-muted">${detail}</span>
      </div>
    </div>`;
  }

  private _renderEv(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    data: PriceData,
    ev: EvView,
    lang: string,
    now: Date
  ): TemplateResult {
    const plan = ev.plan;
    const done = ev.hoursNeeded <= 0;
    const socPct = ev.soc === null ? null : Math.round(ev.soc);
    const statusText = done
      ? localize(
          'editor.energy_price.ev_at_target',
          lang,
          'At target ({target}%) — no charging needed'
        ).replace('{target}', String(Math.round(ev.target)))
      : ev.chargingNow
        ? localize(
            'editor.energy_price.ev_charge_now',
            lang,
            'Charge now — this is a planned cheap slot'
          )
        : plan.ranges.length
          ? localize('editor.energy_price.ev_next', lang, 'Next charging: {time}').replace(
              '{time}',
              this._fmtTime(plan.ranges[0]?.start ?? now, lang, now)
            )
          : localize(
              'editor.energy_price.ev_no_plan',
              lang,
              'No prices available to plan with yet'
            );
    const cost =
      plan.kwh > 0
        ? `${this._fmtPrice(plan.cost, { ...m, decimals: 2 }, lang)}${data.currency ? ` ${data.currency}` : ''}`
        : '';
    const summary = done
      ? ''
      : localize('editor.energy_price.ev_summary', lang, '{kwh} kWh · {hours} · by {departure}')
          .replace('{kwh}', ev.kwhNeeded.toFixed(1))
          .replace('{hours}', this._fmtDuration(ev.hoursNeeded * HOUR_MS, lang))
          .replace('{departure}', this._fmtTime(ev.departure, lang, now));

    let warning = '';
    if (!done && !plan.feasible) {
      warning = ev.pricesShort
        ? localize(
            'editor.energy_price.ev_prices_short',
            lang,
            'Prices after {time} are not published yet; the plan uses what is known.'
          ).replace(
            '{time}',
            this._fmtTime(data.slots[data.slots.length - 1]?.end ?? now, lang, now)
          )
        : localize(
            'editor.energy_price.ev_short',
            lang,
            'Not enough time before departure: {short} short.'
          ).replace('{short}', this._fmtDuration(plan.shortfallHours * HOUR_MS, lang));
    }

    const feedback = this._feedback.get(m.id);
    const showFeedback = feedback && Date.now() - feedback.at < FEEDBACK_MS;

    return html`<div class="uc-ep-ev">
      <div class="uc-ep-ev-head">
        <ha-icon icon=${ev.chargerOn ? 'mdi:ev-station' : 'mdi:car-electric-outline'}></ha-icon>
        <span class="uc-ep-row-title">
          ${localize('editor.energy_price.ev_title', lang, 'EV charge plan')}
        </span>
        ${
          ev.chargerOn !== null
            ? html`<span class="uc-ep-charger ${ev.chargerOn ? 'on' : ''}">
                ${
                  ev.chargerOn
                    ? localize('editor.energy_price.charger_on', lang, 'Charging')
                    : localize('editor.energy_price.charger_off', lang, 'Charger off')
                }
              </span>`
            : nothing
        }
      </div>
      ${
        socPct !== null
          ? html`<div
              class="uc-ep-soc"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${socPct}
            >
              <span class="uc-ep-soc-fill" style="width: ${socPct}%;"></span>
              <span class="uc-ep-soc-target" style="left: ${Math.round(ev.target)}%;"></span>
              <span class="uc-ep-soc-text">${socPct}% → ${Math.round(ev.target)}%</span>
            </div>`
          : nothing
      }
      <div class="uc-ep-ev-status ${ev.chargingNow ? 'now' : ''}">${statusText}</div>
      ${summary ? html`<div class="uc-ep-muted">${summary}</div>` : nothing}
      ${
        !done && plan.ranges.length
          ? html`<div class="uc-ep-ranges">
                ${plan.ranges.slice(0, 6).map(r => html`<span class="uc-ep-range">${this._fmtRange(r, lang, now)}</span>`)}
              </div>
              ${
                cost
                  ? html`<div class="uc-ep-muted">
                      ${localize(
                        'editor.energy_price.ev_cost',
                        lang,
                        'Estimated cost {cost} · avg {price}'
                      )
                        .replace('{cost}', cost)
                        .replace(
                          '{price}',
                          `${this._fmtPrice(plan.avgPrice, m, lang)}${data.unit ? ` ${data.unit}` : ''}`
                        )}
                    </div>`
                  : nothing
              }`
          : nothing
      }
      ${
        warning
          ? html`<div class="uc-ep-warn">
              <ha-icon icon="mdi:alert-outline"></ha-icon><span>${warning}</span>
            </div>`
          : nothing
      }
      ${this._renderApplyButton(m, hass, ev, lang, now)}
      ${
        showFeedback && feedback
          ? html`<div class="uc-ep-feedback ${feedback.error ? 'error' : ''}" role="status">
              ${feedback.message}
            </div>`
          : nothing
      }
    </div>`;
  }

  // ── Apply plan (user-tapped service calls only) ────────────────────────────

  private _renderApplyButton(
    m: EnergyPriceModule,
    hass: HomeAssistant,
    ev: EvView,
    lang: string,
    now: Date
  ): TemplateResult | typeof nothing {
    const mode = m.ev_apply_mode || 'none';
    if (mode === 'none') return nothing;
    const busy = this._busy.has(m.id);
    let label: string;
    let icon: string;
    let disabled = busy;
    if (mode === 'charger') {
      if (!m.ev_charger_entity) return nothing;
      if (ev.chargerOn) {
        label = localize('editor.energy_price.apply_stop', lang, 'Stop charging');
        icon = 'mdi:stop-circle-outline';
      } else {
        label = ev.chargingNow
          ? localize(
              'editor.energy_price.apply_start_planned',
              lang,
              'Start charging (planned slot)'
            )
          : localize('editor.energy_price.apply_start', lang, 'Start charging now');
        icon = 'mdi:play-circle-outline';
      }
    } else if (mode === 'script') {
      if (!m.ev_script_entity) return nothing;
      label = localize('editor.energy_price.apply_send', lang, 'Send plan to script');
      icon = 'mdi:script-text-play-outline';
      disabled = disabled || !ev.plan.ranges.length;
    } else {
      if (!m.ev_start_entity) return nothing;
      const first = ev.plan.ranges[0];
      label = first
        ? localize('editor.energy_price.apply_set', lang, 'Set start to {time}').replace(
            '{time}',
            this._fmtTime(first.start, lang, now)
          )
        : localize('editor.energy_price.apply_set_none', lang, 'Set start time');
      icon = 'mdi:calendar-clock';
      disabled = disabled || !first;
    }
    return html`<button
      type="button"
      class="uc-ep-apply"
      ?disabled=${disabled}
      @click=${(e: Event) => this._apply(e, m, hass, ev, lang)}
    >
      <ha-icon icon=${busy ? 'mdi:loading' : icon}></ha-icon>
      <span>${label}</span>
    </button>`;
  }

  private _apply(
    e: Event,
    m: EnergyPriceModule,
    hass: HomeAssistant,
    ev: EvView,
    lang: string
  ): void {
    e.stopPropagation();
    if (!hass?.callService || this._busy.has(m.id)) return;
    const mode = m.ev_apply_mode || 'none';
    const calls: Array<{ domain: string; service: string; data: Record<string, unknown> }> = [];
    const first = ev.plan.ranges[0];
    const last = ev.plan.ranges[ev.plan.ranges.length - 1];

    if (mode === 'charger' && m.ev_charger_entity) {
      calls.push({
        domain: 'homeassistant',
        service: ev.chargerOn ? 'turn_off' : 'turn_on',
        data: { entity_id: m.ev_charger_entity },
      });
    } else if (mode === 'script' && m.ev_script_entity && first && last) {
      calls.push({
        domain: 'script',
        service: 'turn_on',
        data: {
          entity_id: m.ev_script_entity,
          variables: {
            charge_start: first.start.toISOString(),
            charge_end: last.end.toISOString(),
            ranges: ev.plan.ranges.map(r => ({
              start: r.start.toISOString(),
              end: r.end.toISOString(),
            })),
            kwh: Math.round(ev.plan.kwh * 100) / 100,
            cost: Math.round(ev.plan.cost * 100) / 100,
            hours: Math.round(ev.plan.hoursPlanned * 100) / 100,
            target_soc: ev.target,
            departure: ev.departure.toISOString(),
          },
        },
      });
    } else if (mode === 'datetime' && m.ev_start_entity && first && last) {
      calls.push(this._datetimeCall(hass, m.ev_start_entity, first.start));
      if (m.ev_end_entity) calls.push(this._datetimeCall(hass, m.ev_end_entity, last.end));
    }
    if (!calls.length) return;

    this._busy.add(m.id);
    this.triggerPreviewUpdate(true);
    const target = (e.currentTarget || e.target) as HTMLElement | null;
    calls
      .reduce<Promise<unknown>>(
        (p, c) => p.then(() => hass.callService(c.domain, c.service, c.data)),
        Promise.resolve()
      )
      .then(() => {
        this._feedback.set(m.id, {
          message: localize('editor.energy_price.apply_done', lang, 'Done'),
          error: false,
          at: Date.now(),
        });
      })
      .catch((err: unknown) => {
        const message = `${localize('editor.energy_price.apply_failed', lang, 'Could not apply the plan')}: ${String(
          err instanceof Error ? err.message : err
        )}`;
        this._feedback.set(m.id, { message, error: true, at: Date.now() });
        (target || document.body).dispatchEvent(
          new CustomEvent('hass-notification', {
            bubbles: true,
            composed: true,
            detail: { message },
          })
        );
      })
      .then(() => {
        this._busy.delete(m.id);
        this.triggerPreviewUpdate(true);
        setTimeout(() => this.triggerPreviewUpdate(true), FEEDBACK_MS + 100);
      });
  }

  /** input_datetime.set_datetime payload that fits the helper's has_date / has_time. */
  private _datetimeCall(
    hass: HomeAssistant,
    entityId: string,
    when: Date
  ): { domain: string; service: string; data: Record<string, unknown> } {
    const attrs = (hass.states[entityId]?.attributes || {}) as Record<string, unknown>;
    const date = localDateKey(when);
    const time = `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}:00`;
    const data: Record<string, unknown> = { entity_id: entityId };
    if (attrs.has_date === false) data.time = time;
    else if (attrs.has_time === false) data.date = date;
    else data.datetime = `${date} ${time}`;
    return { domain: 'input_datetime', service: 'set_datetime', data };
  }

  private _moreInfo(e: Event, entityId: string | undefined): void {
    if (!entityId) return;
    e.stopPropagation();
    const target = (e.currentTarget || e.target) as HTMLElement | null;
    (target || document.body).dispatchEvent(
      new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId },
      })
    );
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  private _editorStyles(): string {
    return `
      .uc-ep-ed-desc { font-size: 13px; color: var(--secondary-text-color); margin: 0 0 12px; line-height: 1.4; }
      .uc-ep-ed-sub { font-size: 13px; color: var(--secondary-text-color); margin: 8px 0 6px; }
      .uc-ep-ed-note { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; line-height: 1.4; color: var(--primary-text-color); padding: 10px 12px; border-radius: 8px; background: color-mix(in srgb, var(--success-color, #43a047) 12%, transparent); margin-top: 8px; }
      .uc-ep-ed-note.warn { background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent); }
      .uc-ep-ed-note ha-icon { --mdc-icon-size: 18px; flex: none; }
      .uc-ep-ed-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .uc-ep-ed-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 22px; border: 1px solid var(--divider-color); background: var(--secondary-background-color); color: var(--primary-text-color); font: inherit; font-size: 13px; cursor: pointer; max-width: 100%; }
      .uc-ep-ed-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .uc-ep-ed-chip ha-icon { --mdc-icon-size: 18px; color: var(--primary-color); flex: none; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }

  getStyles(): string {
    return `
      .uc-ep-wrapper { box-sizing: border-box; padding: 14px; border-radius: var(--uc-r-12, 12px); color: var(--primary-text-color); display: flex; flex-direction: column; gap: 12px; min-width: 0; }
      .uc-ep-wrapper > * { min-width: 0; }
      .uc-ep-header { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; }
      .uc-ep-header ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); }
      .uc-ep-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .uc-ep-source { font-size: 12px; font-weight: 500; color: var(--secondary-text-color); white-space: nowrap; }
      .uc-ep-muted { font-size: 12px; color: var(--secondary-text-color); line-height: 1.4; }
      .uc-ep-banner, .uc-ep-warn { display: flex; gap: 8px; align-items: flex-start; font-size: 12px; line-height: 1.4; padding: 8px 10px; border-radius: 8px; background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent); color: var(--primary-text-color); }
      .uc-ep-banner ha-icon, .uc-ep-warn ha-icon { --mdc-icon-size: 16px; flex: none; }
      .uc-ep-current { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; width: 100%; min-height: 44px; padding: 0; margin: 0; border: none; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
      .uc-ep-current-main { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
      .uc-ep-price { font-size: 34px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
      .uc-ep-unit { font-size: 14px; color: var(--secondary-text-color); }
      .uc-ep-current-side { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
      .uc-ep-level { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; color: var(--primary-text-color); background: color-mix(in srgb, var(--uc-ep-level) 18%, transparent); border: 1px solid color-mix(in srgb, var(--uc-ep-level) 50%, transparent); }
      .uc-ep-level::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--uc-ep-level); }
      .uc-ep-next { display: inline-flex; align-items: center; gap: 2px; }
      .uc-ep-next ha-icon { --mdc-icon-size: 14px; }
      .uc-ep-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
      .uc-ep-stat { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 8px; background: var(--secondary-background-color); min-width: 0; }
      .uc-ep-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--secondary-text-color); }
      .uc-ep-stat-value { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; }
      .uc-ep-stat-time { font-size: 11px; color: var(--secondary-text-color); }
      .uc-ep-chart { display: flex; flex-direction: column; gap: 4px; }
      .uc-ep-chart-area { position: relative; width: 100%; }
      .uc-ep-svg { display: block; width: 100%; height: 100%; overflow: visible; }
      .uc-ep-band { fill: var(--primary-color); opacity: 0.12; }
      .uc-ep-zero { stroke: var(--divider-color); stroke-width: 1; vector-effect: non-scaling-stroke; }
      .uc-ep-now { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--primary-text-color); opacity: 0.7; border-radius: 1px; pointer-events: none; }
      .uc-ep-axis { position: absolute; font-size: 10px; color: var(--secondary-text-color); pointer-events: none; z-index: 1; }
      .uc-ep-axis-top { top: -2px; left: 0; }
      .uc-ep-plan-row { position: relative; height: 6px; border-radius: 3px; background: var(--secondary-background-color); }
      .uc-ep-plan-strip { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: var(--primary-color); min-width: 2px; }
      .uc-ep-ticks { position: relative; height: 14px; font-size: 10px; color: var(--secondary-text-color); }
      .uc-ep-tick { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
      .uc-ep-tick.start { transform: none; }
      .uc-ep-tick.end { transform: translateX(-100%); }
      .uc-ep-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: var(--secondary-text-color); }
      .uc-ep-legend span { display: inline-flex; align-items: center; gap: 4px; }
      .uc-ep-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
      .uc-ep-legend i.band { background: var(--primary-color); opacity: 0.25; }
      .uc-ep-legend i.plan { background: var(--primary-color); height: 4px; }
      .uc-ep-nochart { padding: 8px 0; }
      .uc-ep-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--secondary-background-color); }
      .uc-ep-row > ha-icon { --mdc-icon-size: 22px; color: var(--primary-color); flex: none; }
      .uc-ep-row-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .uc-ep-row-title { font-size: 14px; font-weight: 600; }
      .uc-ep-ev { display: flex; flex-direction: column; gap: 8px; padding: 12px; border-radius: 10px; border: 1px solid var(--divider-color); }
      .uc-ep-ev-head { display: flex; align-items: center; gap: 8px; }
      .uc-ep-ev-head > ha-icon { --mdc-icon-size: 22px; color: var(--primary-color); }
      .uc-ep-ev-head .uc-ep-row-title { flex: 1; min-width: 0; }
      .uc-ep-charger { font-size: 12px; padding: 2px 8px; border-radius: 10px; background: var(--secondary-background-color); color: var(--secondary-text-color); white-space: nowrap; }
      .uc-ep-charger.on { color: var(--primary-text-color); background: color-mix(in srgb, var(--success-color, #43a047) 20%, transparent); }
      .uc-ep-soc { position: relative; height: 20px; border-radius: 10px; background: var(--secondary-background-color); overflow: hidden; }
      .uc-ep-soc-fill { position: absolute; left: 0; top: 0; bottom: 0; background: color-mix(in srgb, var(--success-color, #43a047) 55%, transparent); }
      .uc-ep-soc-target { position: absolute; top: 2px; bottom: 2px; width: 2px; margin-left: -1px; background: var(--primary-text-color); opacity: 0.6; }
      .uc-ep-soc-text { position: relative; display: block; text-align: center; font-size: 12px; line-height: 20px; font-weight: 600; color: var(--primary-text-color); }
      .uc-ep-ev-status { font-size: 14px; font-weight: 500; }
      .uc-ep-ev-status.now { color: var(--success-color, #43a047); }
      .uc-ep-ranges { display: flex; flex-wrap: wrap; gap: 6px; }
      .uc-ep-range { font-size: 12px; padding: 3px 8px; border-radius: 6px; background: color-mix(in srgb, var(--primary-color) 14%, transparent); color: var(--primary-text-color); font-variant-numeric: tabular-nums; }
      .uc-ep-apply { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: 22px; border: none; background: var(--primary-color); color: var(--text-primary-color, #fff); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
      .uc-ep-apply[disabled] { opacity: 0.5; cursor: default; }
      .uc-ep-apply ha-icon { --mdc-icon-size: 20px; }
      .uc-ep-feedback { font-size: 12px; color: var(--success-color, #43a047); }
      .uc-ep-feedback.error { color: var(--error-color, #db4437); }
      @media (max-width: 420px) {
        .uc-ep-price { font-size: 28px; }
        .uc-ep-current-side { align-items: flex-start; }
      }
    `;
  }
}
