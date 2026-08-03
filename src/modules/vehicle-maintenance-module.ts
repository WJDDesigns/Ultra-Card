import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  UltraCardConfig,
  VehicleMaintenanceModule,
  VehicleServiceItem,
} from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import { todoSupportsDescription } from '../services/uc-record-store';
import { ucConfirmService } from '../services/uc-confirm-service';
import { getImageUrl } from '../utils/image-upload';
import {
  applyBaselines,
  computeStatuses,
  convertDistance,
  deleteLogEntry,
  formatIntervalSummary,
  getLog,
  invalidateLog,
  latestLogEntryFor,
  projectDaysFromDistance,
  queryUsageEstimate,
  readOdometer,
  recordService,
  roundInterval,
  sortByUrgency,
  summarizeLog,
  toIsoDate,
  VEHICLE_SERVICE_PRESETS,
  type OdometerReading,
  type ServiceStatus,
  type VehicleServiceLogEntry,
  type VehicleServicePreset,
} from '../services/uc-vehicle-maintenance-service';
import '../components/ultra-color-picker';

/** Per-card preview state. Modules are singletons, so everything is keyed by module id. */
interface PreviewState {
  log: VehicleServiceLogEntry[];
  loading: boolean;
  /** 0 forces a refetch on the next render. */
  lastFetchedAt: number;
  error: string | null;
  /** Service currently being written, so its row can show a spinner. */
  busyId: string | null;
  /** Log list expanded past the first few rows. */
  logExpanded: boolean;
  /**
   * Stable "the list changed" callback. The shared to-do service keeps
   * subscribers in a Set, so handing it a fresh closure on every render would
   * accumulate one entry per fetch.
   */
  onListChanged: (() => void) | null;
}

/** Per-card editor state: which rows are open, preset menu, pending unit decision. */
interface EditorState {
  expandedRows: Set<string>;
  presetsOpen: boolean;
  /**
   * Set when the user flips `distance_unit`. Intervals are deliberately left
   * alone; this offers a one-tap conversion instead of silently rescaling data.
   */
  unitOffer: { from: 'mi' | 'km'; to: 'mi' | 'km' } | null;
}

/** Colors resolved once per render so every sub-renderer agrees. */
interface Palette {
  ok: string;
  soon: string;
  over: string;
  text: string;
  secondary: string;
  cardBg: string;
}

const LOG_PREVIEW_ROWS = 4;

/**
 * Vehicle Maintenance (Pro) — odometer and time based service intervals with a
 * cost-tracked service log.
 *
 * Home Assistant already knows your car's odometer. This module turns that
 * number into the answer owners actually want: when is the next oil change.
 * Every service tracks two axes — distance and time — and is due on whichever
 * arrives first.
 *
 * The service log lives in a to-do list rather than the card config, because
 * a dashboard has no way to write its own config back. Marking a service done
 * therefore always writes a log entry, and the log is what
 * `applyBaselines()` reads to decide when a service last happened. The config's
 * `last_distance` / `last_date` are only the seed. That single decision is what
 * makes "Mark serviced" behave identically in the editor and on a live card.
 */
export class UltraVehicleMaintenanceModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'vehicle_maintenance',
    title: 'Vehicle Maintenance',
    description: 'Odometer and time based service intervals with a cost-tracked service log',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:car-wrench',
    category: 'data',
    tags: ['pro', 'premium', 'vehicle', 'car', 'maintenance', 'service', 'odometer', 'garage'],
  };

  private _preview = new Map<string, PreviewState>();
  private _editor = new Map<string, EditorState>();

  // ── Defaults ───────────────────────────────────────────────────────────────

  createDefault(id?: string, hass?: HomeAssistant): VehicleMaintenanceModule {
    const moduleId = id || this.generateId('vehicle_maintenance');
    const lang = hass?.locale?.language || 'en';

    return {
      id: moduleId,
      type: 'vehicle_maintenance',

      vehicle_name: localize('editor.vehicle_maintenance.default_name', lang, 'My Vehicle'),
      vehicle_image: '',
      odometer_entity: '',
      odometer_offset: 0,
      distance_unit: 'mi',
      fuel_entity: '',
      battery_entity: '',
      todo_entity: '',

      services: this._seedServices(moduleId, lang),

      layout: 'hero',
      title: '',
      show_title: true,
      show_vehicle_image: true,
      show_odometer: true,
      show_fuel: true,
      show_next_service: true,
      show_service_log: true,
      show_costs: true,
      show_progress_bars: true,

      due_soon_distance: 500,
      due_soon_days: 14,
      log_limit: 25,
      currency_symbol: '$',

      ok_color: '',
      due_soon_color: '',
      overdue_color: '',
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

  /**
   * A starter set so the module is useful the moment it is dropped on a card.
   *
   * `last_date` is seeded to today so the time axis is live immediately —
   * otherwise every row would read "No history yet" on a fresh module, which
   * looks broken. The editor labels the field as an assumption to correct.
   * Ids are derived from the module id so they are stable across renders and
   * unique across cards.
   */
  private _seedServices(moduleId: string, lang: string): VehicleServiceItem[] {
    const today = toIsoDate();
    const seed = (
      key: string,
      name: string,
      icon: string,
      distance: number,
      months: number
    ): VehicleServiceItem => ({
      id: `${moduleId}-${key}`,
      name,
      icon,
      interval_distance: distance,
      interval_months: months,
      last_distance: undefined,
      last_date: today,
      estimated_cost: undefined,
      notes: '',
    });

    return [
      seed(
        'oil',
        localize('editor.vehicle_maintenance.preset_oil', lang, 'Oil Change'),
        'mdi:oil',
        5000,
        6
      ),
      seed(
        'tires',
        localize('editor.vehicle_maintenance.preset_tires', lang, 'Tire Rotation'),
        'mdi:tire',
        6000,
        6
      ),
      seed(
        'air-filter',
        localize('editor.vehicle_maintenance.preset_air_filter', lang, 'Air Filter'),
        'mdi:air-filter',
        15000,
        12
      ),
      seed(
        'brakes',
        localize('editor.vehicle_maintenance.preset_brakes', lang, 'Brake Inspection'),
        'mdi:car-brake-alert',
        20000,
        24
      ),
      seed(
        'registration',
        localize('editor.vehicle_maintenance.preset_registration', lang, 'Registration'),
        'mdi:card-account-details',
        0,
        12
      ),
    ];
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as VehicleMaintenanceModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!Array.isArray(m.services) || m.services.length === 0) {
      errors.push('Add at least one service');
    }
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as VehicleMaintenanceModule;
    const ids: string[] = [];
    if (m.odometer_entity) ids.push(m.odometer_entity);
    if (m.fuel_entity) ids.push(m.fuel_entity);
    if (m.battery_entity) ids.push(m.battery_entity);
    if (m.todo_entity) ids.push(m.todo_entity);
    return ids;
  }

  // ── State ──────────────────────────────────────────────────────────────────

  private _ensurePreview(id: string): PreviewState {
    let st = this._preview.get(id);
    if (!st) {
      st = {
        log: [],
        loading: false,
        lastFetchedAt: 0,
        error: null,
        busyId: null,
        logExpanded: false,
        onListChanged: null,
      };
      this._preview.set(id, st);
    }
    return st;
  }

  private _ensureEditor(id: string): EditorState {
    let st = this._editor.get(id);
    if (!st) {
      st = { expandedRows: new Set<string>(), presetsOpen: false, unitOffer: null };
      this._editor.set(id, st);
    }
    return st;
  }

  /**
   * Fetches the service log at most once per change. `renderPreview` is
   * synchronous and runs constantly, so an unguarded fetch here would be an
   * infinite loop.
   */
  private _ensureLogLoaded(m: VehicleMaintenanceModule, hass: HomeAssistant | undefined): void {
    if (!hass || !m?.todo_entity) return;
    const st = this._ensurePreview(m.id);
    if (st.loading) return;
    const now = Date.now();
    if (st.lastFetchedAt > 0 && now - st.lastFetchedAt < 2000) return;

    if (!st.onListChanged) {
      st.onListChanged = () => {
        // The to-do list changed underneath us — force the next read to refetch.
        const cur = this._preview.get(m.id);
        if (cur) cur.lastFetchedAt = 0;
        this._ensureLogLoaded(m, hass);
      };
    }

    st.loading = true;
    getLog(hass, m.todo_entity, st.onListChanged)
      .then(entries => {
        const cur = this._ensurePreview(m.id);
        cur.log = entries;
        cur.loading = false;
        cur.error = null;
        cur.lastFetchedAt = Date.now();
        this.triggerPreviewUpdate(true);
      })
      .catch((err: unknown) => {
        const cur = this._ensurePreview(m.id);
        cur.loading = false;
        cur.error = err instanceof Error ? err.message : String(err);
        cur.lastFetchedAt = Date.now();
        this.triggerPreviewUpdate(true);
      });
  }

  // ── Formatting ─────────────────────────────────────────────────────────────

  private _num(value: number, lang: string, digits = 0): string {
    try {
      return new Intl.NumberFormat(lang, { maximumFractionDigits: digits }).format(value);
    } catch {
      return String(Math.round(value));
    }
  }

  private _money(value: number, m: VehicleMaintenanceModule, lang: string): string {
    const symbol = m.currency_symbol ?? '$';
    return `${symbol}${this._num(value, lang, 2)}`;
  }

  private _date(iso: string | undefined, lang: string): string {
    if (!iso) return '';
    try {
      const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
      const d = parts
        ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
        : new Date(String(iso));
      if (Number.isNaN(d.getTime())) return String(iso);
      return new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(d);
    } catch {
      return String(iso);
    }
  }

  private _unitLabel(m: VehicleMaintenanceModule, lang: string): string {
    return m.distance_unit === 'km'
      ? localize('editor.vehicle_maintenance.unit_km', lang, 'km')
      : localize('editor.vehicle_maintenance.unit_mi', lang, 'mi');
  }

  private _palette(m: VehicleMaintenanceModule): Palette {
    return {
      ok: m.ok_color || 'var(--success-color, #43a047)',
      soon: m.due_soon_color || 'var(--warning-color, #fb8c00)',
      over: m.overdue_color || 'var(--error-color, #e53935)',
      text: m.text_color || 'var(--primary-text-color)',
      secondary: m.secondary_text_color || 'var(--secondary-text-color)',
      cardBg: m.card_background_color || 'var(--card-background-color)',
    };
  }

  private _stateColor(state: ServiceStatus['state'], p: Palette): string {
    if (state === 'overdue') return p.over;
    if (state === 'due_soon') return p.soon;
    if (state === 'ok') return p.ok;
    return p.secondary;
  }

  /** Resolved statuses for a module, with log-derived baselines applied. */
  private _statuses(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant | undefined,
    config: UltraCardConfig | undefined,
    lang: string
  ): { statuses: ServiceStatus[]; odometer: OdometerReading | null } {
    const odometerEntity = this.resolveEntity(m.odometer_entity, config) || m.odometer_entity || '';
    const odometer = readOdometer(hass, m, odometerEntity);
    const log = this._preview.get(m.id)?.log;
    const services = applyBaselines(m.services || [], log);
    const statuses = computeStatuses(services, odometer?.value ?? null, Date.now(), m, lang);
    return { statuses, odometer };
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  private _setServices(
    next: VehicleServiceItem[],
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    updateModule({ services: next } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _patchService(
    m: VehicleMaintenanceModule,
    index: number,
    patch: Partial<VehicleServiceItem>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const list = Array.isArray(m.services) ? m.services : [];
    const next = list.map((s, i) => (i === index ? { ...s, ...patch } : s));
    this._setServices(next, updateModule);
  }

  private _moveService(
    m: VehicleMaintenanceModule,
    index: number,
    delta: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const list = [...(Array.isArray(m.services) ? m.services : [])];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const moved = list[index];
    const swapped = list[target];
    if (!moved || !swapped) return;
    list[index] = swapped;
    list[target] = moved;
    this._setServices(list, updateModule);
  }

  private async _deleteService(
    m: VehicleMaintenanceModule,
    index: number,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): Promise<void> {
    const list = Array.isArray(m.services) ? m.services : [];
    const item = list[index];
    if (!item) return;

    const confirmed = await ucConfirmService.confirm(
      localize('editor.vehicle_maintenance.delete_title', lang, 'Delete service?'),
      localize(
        'editor.vehicle_maintenance.delete_message',
        lang,
        'This removes the service and its interval from the card. Entries already written to the service log are kept.'
      ),
      {
        destructive: true,
        confirmText: localize('editor.vehicle_maintenance.delete_confirm', lang, 'Delete'),
        cancelText: localize('editor.vehicle_maintenance.cancel', lang, 'Cancel'),
      }
    );
    if (!confirmed) return;

    this._setServices(
      list.filter((_, i) => i !== index),
      updateModule
    );
  }

  private _addService(
    m: VehicleMaintenanceModule,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const list = Array.isArray(m.services) ? m.services : [];
    const item: VehicleServiceItem = {
      id: this.generateId('vmsvc'),
      name: localize('editor.vehicle_maintenance.new_service', lang, 'New service'),
      icon: 'mdi:wrench',
      interval_distance: 5000,
      interval_months: 6,
      last_distance: undefined,
      last_date: toIsoDate(),
      estimated_cost: undefined,
      notes: '',
    };
    const st = this._ensureEditor(m.id);
    st.expandedRows.add(item.id);
    this._setServices([...list, item], updateModule);
  }

  private _addPreset(
    m: VehicleMaintenanceModule,
    preset: VehicleServicePreset,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const list = Array.isArray(m.services) ? m.services : [];
    const distance =
      preset.intervalMiles > 0 && m.distance_unit === 'km'
        ? roundInterval(convertDistance(preset.intervalMiles, 'mi', 'km'))
        : preset.intervalMiles;

    const item: VehicleServiceItem = {
      id: this.generateId(`vmsvc-${preset.key}`),
      name: localize(`editor.vehicle_maintenance.${preset.labelKey}`, lang, preset.fallbackName),
      icon: preset.icon,
      interval_distance: distance,
      interval_months: preset.intervalMonths,
      last_distance: undefined,
      last_date: toIsoDate(),
      estimated_cost: undefined,
      notes: '',
    };
    this._setServices([...list, item], updateModule);
  }

  /**
   * Records a completed service.
   *
   * Always writes a log entry when a to-do list is configured — that is the
   * copy a read-only dashboard can read back. When an `updateModule` is
   * available (i.e. we're in the editor) the config's `last_*` fields are
   * mirrored too, so a card with no to-do list still tracks intervals.
   */
  private async _markServiced(
    m: VehicleMaintenanceModule,
    item: VehicleServiceItem,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    updateModule?: (updates: Partial<CardModule>) => void
  ): Promise<void> {
    const odometerEntity = this.resolveEntity(m.odometer_entity, config) || m.odometer_entity || '';
    const reading = readOdometer(hass, m, odometerEntity);
    const today = toIsoDate();
    const unit = this._unitLabel(m, lang);

    const detail =
      reading !== null
        ? localize(
            'editor.vehicle_maintenance.mark_message_odometer',
            lang,
            'Logs {name} as done today at {odometer} {unit}.'
          )
            .split('{name}')
            .join(item.name)
            .split('{odometer}')
            .join(this._num(reading.value, lang))
            .split('{unit}')
            .join(unit)
        : localize(
            'editor.vehicle_maintenance.mark_message_no_odometer',
            lang,
            'Logs {name} as done today. No odometer is configured, so no reading is stored.'
          )
            .split('{name}')
            .join(item.name);

    const confirmed = await ucConfirmService.confirm(
      localize('editor.vehicle_maintenance.mark_title', lang, 'Mark as serviced?'),
      detail,
      {
        confirmText: localize('editor.vehicle_maintenance.mark_confirm', lang, 'Log service'),
        cancelText: localize('editor.vehicle_maintenance.cancel', lang, 'Cancel'),
      }
    );
    if (!confirmed) return;

    const st = this._ensurePreview(m.id);
    st.busyId = item.id;
    this.triggerPreviewUpdate(true);

    try {
      if (m.todo_entity) {
        await recordService(hass, m.todo_entity, item, {
          odometer: reading?.value ?? null,
          cost: item.estimated_cost ?? null,
          at: today,
        });
        invalidateLog(hass, m.todo_entity);
        st.lastFetchedAt = 0;
        this._ensureLogLoaded(m, hass);
      }

      if (updateModule) {
        const list = Array.isArray(m.services) ? m.services : [];
        const next = list.map(s =>
          s.id === item.id
            ? {
                ...s,
                last_date: today,
                last_distance: reading?.value ?? s.last_distance,
              }
            : s
        );
        updateModule({ services: next } as Partial<CardModule>);
      }
    } catch {
      st.error = localize(
        'editor.vehicle_maintenance.log_write_failed',
        lang,
        'Could not write to the service log.'
      );
    } finally {
      st.busyId = null;
      this.triggerPreviewUpdate(true);
    }
  }

  private async _deleteLogEntry(
    m: VehicleMaintenanceModule,
    entry: VehicleServiceLogEntry,
    hass: HomeAssistant,
    lang: string
  ): Promise<void> {
    if (!m.todo_entity) return;
    const confirmed = await ucConfirmService.confirm(
      localize('editor.vehicle_maintenance.delete_log_title', lang, 'Delete log entry?'),
      localize(
        'editor.vehicle_maintenance.delete_log_message',
        lang,
        'This permanently removes the entry from your service history.'
      ),
      {
        destructive: true,
        confirmText: localize('editor.vehicle_maintenance.delete_confirm', lang, 'Delete'),
        cancelText: localize('editor.vehicle_maintenance.cancel', lang, 'Cancel'),
      }
    );
    if (!confirmed) return;

    const st = this._ensurePreview(m.id);
    st.log = st.log.filter(e => e.uid !== entry.uid);
    this.triggerPreviewUpdate(true);

    await deleteLogEntry(hass, m.todo_entity, entry.uid);
    invalidateLog(hass, m.todo_entity);
    st.lastFetchedAt = 0;
    this._ensureLogLoaded(m, hass);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // General tab
  // ══════════════════════════════════════════════════════════════════════════

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as VehicleMaintenanceModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.vehicle_maintenance.pro_description',
          lang,
          'Track oil changes, tire rotations and registration by distance or time — whichever comes first — with a cost-tracked service log built from your car\u2019s odometer.'
        )
      );
    }

    // Keep due badges in the row list honest while editing.
    this._ensureLogLoaded(m, hass);

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderVehicleSection(m, hass, config, lang, updateModule)}
        ${this._renderStorageSection(m, hass, lang, updateModule)}
        ${this._renderServicesSection(m, hass, config, lang, updateModule)}
        ${this._renderDisplaySection(m, hass, lang, updateModule)}
        ${this._renderThresholdsSection(m, hass, lang, updateModule)}
        ${this._renderColorsSection(m, hass, lang, updateModule)}
      </div>
    `;
  }

  /** Shared shell for the hand-built sections so they match `renderSettingsSection`. */
  private _sectionShell(title: string, description: string, body: TemplateResult): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${title}
        </div>
        ${description
          ? html`<div
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; line-height: 1.5;"
            >
              ${description}
            </div>`
          : nothing}
        ${body}
      </div>
    `;
  }

  private _renderNotice(
    icon: string,
    text: string | TemplateResult,
    tone: 'info' | 'warn' | 'ok' = 'info'
  ): TemplateResult {
    const color =
      tone === 'warn'
        ? 'var(--warning-color, #fb8c00)'
        : tone === 'ok'
          ? 'var(--success-color, #43a047)'
          : 'var(--primary-color)';
    return html`
      <div class="vm-notice" style="border-left-color: ${color};">
        <ha-icon icon="${icon}" style="color: ${color};"></ha-icon>
        <div class="vm-notice-text">${text}</div>
      </div>
    `;
  }

  // ── 1. Vehicle ─────────────────────────────────────────────────────────────

  private _renderVehicleSection(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const odometerEntity = this.resolveEntity(m.odometer_entity, config) || m.odometer_entity || '';
    const reading = readOdometer(hass, m, odometerEntity);
    const es = this._ensureEditor(m.id);

    return this._sectionShell(
      localize('editor.vehicle_maintenance.vehicle_section', lang, 'Vehicle'),
      localize(
        'editor.vehicle_maintenance.vehicle_section_desc',
        lang,
        'Name your vehicle and point the module at its odometer. Everything else is optional.'
      ),
      html`
        ${this.renderFieldSection(
          localize('editor.vehicle_maintenance.vehicle_name', lang, 'Vehicle name'),
          localize(
            'editor.vehicle_maintenance.vehicle_name_desc',
            lang,
            'Shown as the heading in the hero layout.'
          ),
          hass,
          { vehicle_name: m.vehicle_name || '' },
          [this.textField('vehicle_name')],
          (e: CustomEvent) => {
            updateModule({
              vehicle_name: e.detail.value?.vehicle_name ?? '',
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFileField(
          localize('editor.vehicle_maintenance.vehicle_image', lang, 'Vehicle photo'),
          localize(
            'editor.vehicle_maintenance.vehicle_image_desc',
            lang,
            'Optional. Used as the hero banner; a clean icon header is shown when empty.'
          ),
          hass,
          m.vehicle_image || '',
          (path: string) => {
            updateModule({ vehicle_image: path } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.vehicle_maintenance.odometer_entity', lang, 'Odometer'),
          localize(
            'editor.vehicle_maintenance.odometer_entity_desc',
            lang,
            'A sensor from your car integration, an OBD dongle, or an input_number you update yourself. Leave blank to track services by time only.'
          ),
          hass,
          { odometer_entity: m.odometer_entity || '' },
          [
            {
              name: 'odometer_entity',
              selector: { entity: { domain: ['sensor', 'input_number'] } },
            },
          ],
          (e: CustomEvent) => {
            updateModule({
              odometer_entity: e.detail.value?.odometer_entity ?? '',
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this._renderOdometerReadout(m, reading, lang)}
        ${this.renderSegmentedField(
          localize('editor.vehicle_maintenance.distance_unit', lang, 'Distance unit'),
          localize(
            'editor.vehicle_maintenance.distance_unit_desc',
            lang,
            'Unit used for every interval and reading. Readings from a sensor in the other unit are converted automatically.'
          ),
          m.distance_unit === 'km' ? 'km' : 'mi',
          [
            {
              value: 'mi',
              label: localize('editor.vehicle_maintenance.unit_mi_long', lang, 'Miles'),
            },
            {
              value: 'km',
              label: localize('editor.vehicle_maintenance.unit_km_long', lang, 'Kilometers'),
            },
          ],
          (value: string) => {
            const next = value === 'km' ? 'km' : 'mi';
            const prev = m.distance_unit === 'km' ? 'km' : 'mi';
            if (next === prev) return;
            // Intervals are left exactly as typed; the banner below offers a
            // conversion rather than silently rescaling the user's numbers.
            es.unitOffer = { from: prev, to: next };
            updateModule({ distance_unit: next } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          2
        )}
        ${this._renderUnitOffer(m, es, lang, updateModule)}
        ${this.renderFieldSection(
          localize('editor.vehicle_maintenance.fuel_entity', lang, 'Fuel level'),
          localize(
            'editor.vehicle_maintenance.fuel_entity_desc',
            lang,
            'Optional. A percentage sensor renders as a bar; anything else is shown as a value.'
          ),
          hass,
          { fuel_entity: m.fuel_entity || '' },
          [{ name: 'fuel_entity', selector: { entity: { domain: ['sensor', 'input_number'] } } }],
          (e: CustomEvent) => {
            updateModule({ fuel_entity: e.detail.value?.fuel_entity ?? '' } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.vehicle_maintenance.battery_entity', lang, 'Charge level'),
          localize(
            'editor.vehicle_maintenance.battery_entity_desc',
            lang,
            'Optional. For EVs and plug-in hybrids, shown alongside or instead of fuel.'
          ),
          hass,
          { battery_entity: m.battery_entity || '' },
          [
            {
              name: 'battery_entity',
              selector: { entity: { domain: ['sensor', 'input_number'] } },
            },
          ],
          (e: CustomEvent) => {
            updateModule({
              battery_entity: e.detail.value?.battery_entity ?? '',
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      `
    );
  }

  /** Live confirmation that the odometer entity parsed, and how it was read. */
  private _renderOdometerReadout(
    m: VehicleMaintenanceModule,
    reading: OdometerReading | null,
    lang: string
  ): TemplateResult {
    if (!m.odometer_entity) {
      return this._renderNotice(
        'mdi:information-outline',
        localize(
          'editor.vehicle_maintenance.odometer_none',
          lang,
          'No odometer selected. Services will be tracked by time only — distance intervals stay dormant until you pick one.'
        )
      );
    }

    if (!reading) {
      return this._renderNotice(
        'mdi:alert-circle-outline',
        localize(
          'editor.vehicle_maintenance.odometer_unreadable',
          lang,
          'That entity is not reporting a number right now. Distance tracking stays off until it does; time intervals keep working.'
        ),
        'warn'
      );
    }

    const unit = this._unitLabel(m, lang);
    const bits: string[] = [];
    if (reading.converted && reading.sourceUnit) {
      bits.push(
        localize('editor.vehicle_maintenance.odometer_converted', lang, 'converted from {unit}')
          .split('{unit}')
          .join(reading.sourceUnitRaw || reading.sourceUnit)
      );
    } else if (reading.sourceUnit) {
      bits.push(
        localize('editor.vehicle_maintenance.odometer_source_unit', lang, 'sensor reports {unit}')
          .split('{unit}')
          .join(reading.sourceUnitRaw || reading.sourceUnit)
      );
    } else {
      bits.push(
        localize(
          'editor.vehicle_maintenance.odometer_unit_assumed',
          lang,
          'no unit on the sensor, assuming {unit}'
        )
          .split('{unit}')
          .join(unit)
      );
    }
    const offset = Number(m.odometer_offset) || 0;
    if (offset !== 0) {
      bits.push(
        localize(
          'editor.vehicle_maintenance.odometer_offset_applied',
          lang,
          'offset {value} applied'
        )
          .split('{value}')
          .join(`${offset > 0 ? '+' : ''}${this._num(offset, lang)}`)
      );
    }

    return this._renderNotice(
      'mdi:counter',
      html`
        <strong>${this._num(reading.value, lang)} ${unit}</strong>
        <span style="opacity: 0.8;"> — ${bits.join(', ')}</span>
      `,
      'ok'
    );
  }

  /** One-time "you switched units" affordance. Nothing is rescaled without a tap. */
  private _renderUnitOffer(
    m: VehicleMaintenanceModule,
    es: EditorState,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const offer = es.unitOffer;
    if (!offer) return html``;

    const toLabel =
      offer.to === 'km'
        ? localize('editor.vehicle_maintenance.unit_km_long', lang, 'Kilometers')
        : localize('editor.vehicle_maintenance.unit_mi_long', lang, 'Miles');

    return html`
      <div class="vm-notice vm-notice-action" style="border-left-color: var(--primary-color);">
        <ha-icon icon="mdi:swap-horizontal" style="color: var(--primary-color);"></ha-icon>
        <div class="vm-notice-text">
          <div>
            ${localize(
              'editor.vehicle_maintenance.unit_offer',
              lang,
              'Unit changed to {unit}. Your interval numbers were left exactly as they were. Convert them?'
            )
              .split('{unit}')
              .join(toLabel)}
          </div>
          <div class="vm-notice-actions">
            <button
              type="button"
              class="vm-btn vm-btn-primary"
              @click=${() => {
                const list = Array.isArray(m.services) ? m.services : [];
                const next = list.map(s => ({
                  ...s,
                  interval_distance:
                    s.interval_distance && s.interval_distance > 0
                      ? roundInterval(convertDistance(s.interval_distance, offer.from, offer.to))
                      : s.interval_distance,
                  last_distance:
                    s.last_distance && s.last_distance > 0
                      ? Math.round(convertDistance(s.last_distance, offer.from, offer.to))
                      : s.last_distance,
                }));
                updateModule({
                  services: next,
                  due_soon_distance: roundInterval(
                    convertDistance(m.due_soon_distance || 0, offer.from, offer.to)
                  ),
                  odometer_offset: m.odometer_offset
                    ? Math.round(convertDistance(m.odometer_offset, offer.from, offer.to))
                    : m.odometer_offset,
                } as Partial<CardModule>);
                es.unitOffer = null;
                this.triggerPreviewUpdate(true);
              }}
            >
              ${localize('editor.vehicle_maintenance.unit_offer_convert', lang, 'Convert numbers')}
            </button>
            <button
              type="button"
              class="vm-btn"
              @click=${() => {
                es.unitOffer = null;
                this.triggerPreviewUpdate(true);
              }}
            >
              ${localize('editor.vehicle_maintenance.unit_offer_keep', lang, 'Keep as-is')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── 2. Service log storage ─────────────────────────────────────────────────

  private _renderStorageSection(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const missingDescriptions =
      !!m.todo_entity && !!hass && !todoSupportsDescription(hass, m.todo_entity);

    return this._sectionShell(
      localize('editor.vehicle_maintenance.storage_section', lang, 'Service log storage'),
      localize(
        'editor.vehicle_maintenance.storage_section_desc',
        lang,
        'Service history is stored in a Home Assistant to-do list so it survives restarts and syncs to every device.'
      ),
      html`
        ${this.renderFieldSection(
          localize('editor.vehicle_maintenance.todo_entity', lang, 'Storage list'),
          localize(
            'editor.vehicle_maintenance.todo_entity_desc',
            lang,
            'Create a Local To-do helper under Settings \u2192 Devices & services \u2192 Helpers \u2192 To-do list, then pick it here.'
          ),
          hass,
          { todo_entity: m.todo_entity || '' },
          [{ name: 'todo_entity', selector: { entity: { domain: 'todo' } } }],
          (e: CustomEvent) => {
            updateModule({ todo_entity: e.detail.value?.todo_entity ?? '' } as Partial<CardModule>);
            this._preview.delete(m.id);
            this.triggerPreviewUpdate();
          }
        )}
        ${!m.todo_entity
          ? this._renderNotice(
              'mdi:information-outline',
              localize(
                'editor.vehicle_maintenance.todo_missing',
                lang,
                'Without a list, service history is not retained. Interval tracking still works from the last-service values on each service below.'
              )
            )
          : nothing}
        ${missingDescriptions
          ? this._renderNotice(
              'mdi:alert-circle-outline',
              localize(
                'editor.vehicle_maintenance.todo_no_description',
                lang,
                'This list cannot store item descriptions (Shopping List behaves this way). Logging still works, but the stored data rides along in the item title and looks messy in the Home Assistant to-do UI. A Local To-do helper is recommended.'
              ),
              'warn'
            )
          : nothing}
      `
    );
  }

  // ── 3. Services ────────────────────────────────────────────────────────────

  private _renderServicesSection(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const es = this._ensureEditor(m.id);
    const list = Array.isArray(m.services) ? m.services : [];
    const { statuses } = this._statuses(m, hass, config, lang);
    const byId = new Map(statuses.map(s => [s.item.id, s]));

    return this._sectionShell(
      localize('editor.vehicle_maintenance.services_section', lang, 'Services'),
      localize(
        'editor.vehicle_maintenance.services_section_desc',
        lang,
        'Each service is due on whichever comes first: distance or time. Set an interval to 0 to switch that axis off.'
      ),
      html`
        ${list.length === 0
          ? html`<div class="vm-empty-rows">
              ${localize(
                'editor.vehicle_maintenance.services_empty',
                lang,
                'No services yet. Add one below, or start from a preset.'
              )}
            </div>`
          : html`<div class="vm-rows">
              ${list.map((item, index) =>
                this._renderServiceRowEditor(
                  m,
                  item,
                  index,
                  list.length,
                  byId.get(item.id) ?? null,
                  hass,
                  config,
                  lang,
                  es,
                  updateModule
                )
              )}
            </div>`}

        <div class="vm-row-actions">
          <button
            type="button"
            class="vm-btn vm-btn-primary"
            @click=${() => this._addService(m, lang, updateModule)}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            ${localize('editor.vehicle_maintenance.add_service', lang, 'Add service')}
          </button>
          <button
            type="button"
            class="vm-btn"
            aria-expanded=${es.presetsOpen ? 'true' : 'false'}
            @click=${() => {
              es.presetsOpen = !es.presetsOpen;
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon=${es.presetsOpen ? 'mdi:chevron-up' : 'mdi:playlist-plus'}></ha-icon>
            ${localize('editor.vehicle_maintenance.add_preset', lang, 'Add from presets')}
          </button>
        </div>

        ${es.presetsOpen
          ? html`
              <div class="vm-presets">
                <div class="vm-presets-hint">
                  ${localize(
                    'editor.vehicle_maintenance.presets_hint',
                    lang,
                    'Typical intervals you can adjust after adding. Distances are converted when your unit is kilometers.'
                  )}
                </div>
                <div class="vm-preset-grid">
                  ${VEHICLE_SERVICE_PRESETS.map(preset =>
                    this._renderPresetButton(m, preset, lang, updateModule)
                  )}
                </div>
              </div>
            `
          : nothing}
      `
    );
  }

  private _renderPresetButton(
    m: VehicleMaintenanceModule,
    preset: VehicleServicePreset,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const unit = this._unitLabel(m, lang);
    const distance =
      preset.intervalMiles > 0 && m.distance_unit === 'km'
        ? roundInterval(convertDistance(preset.intervalMiles, 'mi', 'km'))
        : preset.intervalMiles;
    const bits: string[] = [];
    if (distance > 0) bits.push(`${this._num(distance, lang)} ${unit}`);
    if (preset.intervalMonths > 0) {
      bits.push(
        `${preset.intervalMonths} ${localize('editor.vehicle_maintenance.unit_months_short', lang, 'mo')}`
      );
    }
    const name = localize(
      `editor.vehicle_maintenance.${preset.labelKey}`,
      lang,
      preset.fallbackName
    );

    return html`
      <button
        type="button"
        class="vm-preset-card"
        title=${name}
        @click=${() => this._addPreset(m, preset, lang, updateModule)}
      >
        <ha-icon icon="${preset.icon}"></ha-icon>
        <span class="vm-preset-name">${name}</span>
        <span class="vm-preset-interval">${bits.join(' / ')}</span>
      </button>
    `;
  }

  private _renderServiceRowEditor(
    m: VehicleMaintenanceModule,
    item: VehicleServiceItem,
    index: number,
    total: number,
    status: ServiceStatus | null,
    hass: HomeAssistant,
    config: UltraCardConfig,
    lang: string,
    es: EditorState,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const unit = m.distance_unit === 'km' ? 'km' : 'mi';
    const summary = formatIntervalSummary(item, unit, lang);
    const p = this._palette(m);
    const badgeColor = status ? this._stateColor(status.state, p) : p.secondary;
    const expanded = es.expandedRows.has(item.id);
    const busy = this._preview.get(m.id)?.busyId === item.id;

    return html`
      <ha-expansion-panel
        class="vm-service-panel"
        .expanded=${expanded}
        @expanded-changed=${(e: CustomEvent) => {
          if (e.detail?.expanded) es.expandedRows.add(item.id);
          else es.expandedRows.delete(item.id);
        }}
      >
        <div slot="header" class="vm-row-header">
          <div class="vm-row-icon"><ha-icon icon="${item.icon || 'mdi:wrench'}"></ha-icon></div>
          <div class="vm-row-info">
            <div class="vm-row-name">
              ${item.name ||
              localize('editor.vehicle_maintenance.unnamed_service', lang, 'Unnamed service')}
            </div>
            <div class="vm-row-summary">${summary}</div>
          </div>
          ${status && status.state !== 'unknown'
            ? html`<span
                class="vm-row-badge"
                style="color: ${badgeColor}; border-color: ${badgeColor};"
                >${status.dueLabel}</span
              >`
            : nothing}
          <button
            type="button"
            class="vm-icon-btn"
            title=${localize('editor.vehicle_maintenance.move_up', lang, 'Move up')}
            aria-label=${localize('editor.vehicle_maintenance.move_up', lang, 'Move up')}
            ?disabled=${index === 0}
            @click=${(e: Event) => {
              e.stopPropagation();
              this._moveService(m, index, -1, updateModule);
            }}
          >
            <ha-icon icon="mdi:chevron-up"></ha-icon>
          </button>
          <button
            type="button"
            class="vm-icon-btn"
            title=${localize('editor.vehicle_maintenance.move_down', lang, 'Move down')}
            aria-label=${localize('editor.vehicle_maintenance.move_down', lang, 'Move down')}
            ?disabled=${index === total - 1}
            @click=${(e: Event) => {
              e.stopPropagation();
              this._moveService(m, index, 1, updateModule);
            }}
          >
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          <button
            type="button"
            class="vm-icon-btn vm-icon-btn-danger"
            title=${localize('editor.vehicle_maintenance.delete_service', lang, 'Delete service')}
            aria-label=${localize(
              'editor.vehicle_maintenance.delete_service',
              lang,
              'Delete service'
            )}
            @click=${(e: Event) => {
              e.stopPropagation();
              void this._deleteService(m, index, lang, updateModule);
            }}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>

        <div class="vm-row-body">
          ${this.renderFieldSection(
            localize('editor.vehicle_maintenance.service_name', lang, 'Name'),
            '',
            hass,
            { name: item.name || '' },
            [this.textField('name')],
            (e: CustomEvent) =>
              this._patchService(m, index, { name: e.detail.value?.name ?? '' }, updateModule)
          )}
          ${this.renderIconField(
            localize('editor.vehicle_maintenance.service_icon', lang, 'Icon'),
            '',
            hass,
            item.icon || '',
            (value: string) => this._patchService(m, index, { icon: value }, updateModule)
          )}
          ${this.renderFieldSection(
            localize('editor.vehicle_maintenance.interval_distance', lang, 'Distance interval'),
            localize(
              'editor.vehicle_maintenance.interval_distance_desc',
              lang,
              'How far between services, in {unit}. Use 0 for time-only services like registration.'
            )
              .split('{unit}')
              .join(this._unitLabel(m, lang)),
            hass,
            { interval_distance: item.interval_distance ?? 0 },
            [this.numberField('interval_distance', 0, 500000, 100)],
            (e: CustomEvent) =>
              this._patchService(
                m,
                index,
                { interval_distance: Number(e.detail.value?.interval_distance) || 0 },
                updateModule
              )
          )}
          ${this.renderFieldSection(
            localize('editor.vehicle_maintenance.interval_months', lang, 'Time interval'),
            localize(
              'editor.vehicle_maintenance.interval_months_desc',
              lang,
              'Months between services. Use 0 for distance-only services like tire rotation.'
            ),
            hass,
            { interval_months: item.interval_months ?? 0 },
            [this.numberField('interval_months', 0, 120, 1)],
            (e: CustomEvent) =>
              this._patchService(
                m,
                index,
                { interval_months: Number(e.detail.value?.interval_months) || 0 },
                updateModule
              )
          )}
          ${this.renderFieldSection(
            localize('editor.vehicle_maintenance.last_distance', lang, 'Odometer at last service'),
            localize(
              'editor.vehicle_maintenance.last_distance_desc',
              lang,
              'Leave at 0 if you do not know it. Logging a service overwrites this with the reading at the time.'
            ),
            hass,
            { last_distance: item.last_distance ?? 0 },
            [this.numberField('last_distance', 0, 2000000, 1)],
            (e: CustomEvent) =>
              this._patchService(
                m,
                index,
                { last_distance: Number(e.detail.value?.last_distance) || 0 },
                updateModule
              )
          )}
          ${this.renderFieldSection(
            localize('editor.vehicle_maintenance.last_date', lang, 'Date of last service'),
            localize(
              'editor.vehicle_maintenance.last_date_desc',
              lang,
              'Defaults to the day this service was added, which is only a guess — set your real last service date.'
            ),
            hass,
            { last_date: item.last_date || '' },
            [{ name: 'last_date', selector: { date: {} } }],
            (e: CustomEvent) =>
              this._patchService(
                m,
                index,
                { last_date: e.detail.value?.last_date ?? '' },
                updateModule
              )
          )}
          ${this.renderFieldSection(
            localize('editor.vehicle_maintenance.estimated_cost', lang, 'Typical cost'),
            localize(
              'editor.vehicle_maintenance.estimated_cost_desc',
              lang,
              'Used as the default amount when you log this service, and to forecast upcoming spend.'
            ),
            hass,
            { estimated_cost: item.estimated_cost ?? 0 },
            [this.numberField('estimated_cost', 0, 100000, 1)],
            (e: CustomEvent) =>
              this._patchService(
                m,
                index,
                { estimated_cost: Number(e.detail.value?.estimated_cost) || 0 },
                updateModule
              )
          )}
          ${this.renderFieldSection(
            localize('editor.vehicle_maintenance.notes', lang, 'Notes'),
            localize(
              'editor.vehicle_maintenance.notes_desc',
              lang,
              'Part numbers, oil weight, the shop you use.'
            ),
            hass,
            { notes: item.notes || '' },
            [this.textField('notes', true)],
            (e: CustomEvent) =>
              this._patchService(m, index, { notes: e.detail.value?.notes ?? '' }, updateModule)
          )}
          ${this._renderRowLastService(m, item, lang)}

          <button
            type="button"
            class="vm-btn vm-btn-primary vm-btn-wide"
            ?disabled=${busy}
            @click=${() => void this._markServiced(m, item, hass, config, lang, updateModule)}
          >
            <ha-icon icon=${busy ? 'mdi:progress-clock' : 'mdi:check-decagram'}></ha-icon>
            ${busy
              ? localize('editor.vehicle_maintenance.marking', lang, 'Logging\u2026')
              : localize('editor.vehicle_maintenance.mark_serviced', lang, 'Mark serviced now')}
          </button>
        </div>
      </ha-expansion-panel>
    `;
  }

  /** Shows the log-derived baseline when it differs from the typed-in values. */
  private _renderRowLastService(
    m: VehicleMaintenanceModule,
    item: VehicleServiceItem,
    lang: string
  ): TemplateResult {
    const log = this._preview.get(m.id)?.log;
    const newest = latestLogEntryFor(item.id, log);
    if (!newest) return html``;

    const unit = this._unitLabel(m, lang);
    const odo = newest.payload?.odometer;
    const detail =
      typeof odo === 'number'
        ? `${this._date(newest.payload.at, lang)} \u00b7 ${this._num(odo, lang)} ${unit}`
        : this._date(newest.payload.at, lang);

    return this._renderNotice(
      'mdi:history',
      localize(
        'editor.vehicle_maintenance.row_from_log',
        lang,
        'Tracking from the service log: last done {detail}. This overrides the two fields above.'
      )
        .split('{detail}')
        .join(detail)
    );
  }

  // ── 4. Display ─────────────────────────────────────────────────────────────

  private _renderDisplaySection(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const toggle = (
      key: keyof VehicleMaintenanceModule,
      title: string,
      description: string,
      current: boolean
    ) =>
      this.renderFieldSection(
        title,
        description,
        hass,
        { [key]: current },
        [this.booleanField(String(key))],
        (e: CustomEvent) => {
          updateModule({ [key]: e.detail.value?.[key] ?? false } as Partial<CardModule>);
          this.triggerPreviewUpdate();
        }
      );

    return this._sectionShell(
      localize('editor.vehicle_maintenance.display_section', lang, 'Display'),
      localize(
        'editor.vehicle_maintenance.display_section_desc',
        lang,
        'Pick a layout and choose which parts of the card are visible.'
      ),
      html`
        ${this.renderSegmentedField(
          localize('editor.vehicle_maintenance.layout', lang, 'Layout'),
          localize(
            'editor.vehicle_maintenance.layout_desc',
            lang,
            'Hero leads with the vehicle and the next service. List shows every service. Compact is a single summary line.'
          ),
          m.layout || 'hero',
          [
            {
              value: 'hero',
              label: localize('editor.vehicle_maintenance.layout_hero', lang, 'Hero'),
              icon: 'mdi:car-sports',
            },
            {
              value: 'list',
              label: localize('editor.vehicle_maintenance.layout_list', lang, 'List'),
              icon: 'mdi:format-list-bulleted',
            },
            {
              value: 'compact',
              label: localize('editor.vehicle_maintenance.layout_compact', lang, 'Compact'),
              icon: 'mdi:view-agenda-outline',
            },
          ],
          (value: string) => {
            updateModule({
              layout: (value || 'hero') as VehicleMaintenanceModule['layout'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
        ${this.renderFieldSection(
          localize('editor.vehicle_maintenance.title', lang, 'Title override'),
          localize(
            'editor.vehicle_maintenance.title_desc',
            lang,
            'Leave blank to use the vehicle name.'
          ),
          hass,
          { title: m.title || '' },
          [this.textField('title')],
          (e: CustomEvent) => {
            updateModule({ title: e.detail.value?.title ?? '' } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${toggle(
          'show_title',
          localize('editor.vehicle_maintenance.show_title', lang, 'Show title'),
          '',
          m.show_title !== false
        )}
        ${toggle(
          'show_vehicle_image',
          localize('editor.vehicle_maintenance.show_vehicle_image', lang, 'Show vehicle photo'),
          '',
          m.show_vehicle_image !== false
        )}
        ${toggle(
          'show_odometer',
          localize('editor.vehicle_maintenance.show_odometer', lang, 'Show odometer'),
          '',
          m.show_odometer !== false
        )}
        ${toggle(
          'show_fuel',
          localize('editor.vehicle_maintenance.show_fuel', lang, 'Show fuel and charge'),
          '',
          m.show_fuel !== false
        )}
        ${toggle(
          'show_next_service',
          localize('editor.vehicle_maintenance.show_next_service', lang, 'Show next service due'),
          '',
          m.show_next_service !== false
        )}
        ${toggle(
          'show_progress_bars',
          localize('editor.vehicle_maintenance.show_progress_bars', lang, 'Show progress bars'),
          '',
          m.show_progress_bars !== false
        )}
        ${toggle(
          'show_service_log',
          localize('editor.vehicle_maintenance.show_service_log', lang, 'Show service log'),
          '',
          m.show_service_log !== false
        )}
        ${toggle(
          'show_costs',
          localize('editor.vehicle_maintenance.show_costs', lang, 'Show costs'),
          localize(
            'editor.vehicle_maintenance.show_costs_desc',
            lang,
            'Adds amounts to log entries plus a total spend figure.'
          ),
          m.show_costs !== false
        )}
      `
    );
  }

  // ── 5. Thresholds ──────────────────────────────────────────────────────────

  private _renderThresholdsSection(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const unit = this._unitLabel(m, lang);

    return this._sectionShell(
      localize('editor.vehicle_maintenance.thresholds_section', lang, 'Thresholds'),
      localize(
        'editor.vehicle_maintenance.thresholds_section_desc',
        lang,
        'When a service starts warning, and how much history to show. The defaults suit most vehicles.'
      ),
      html`
        ${this.renderSliderField(
          localize('editor.vehicle_maintenance.due_soon_distance', lang, 'Warn within'),
          localize(
            'editor.vehicle_maintenance.due_soon_distance_desc',
            lang,
            'Remaining distance at which a service turns amber.'
          ),
          m.due_soon_distance ?? 500,
          500,
          0,
          5000,
          50,
          (value: number) => {
            updateModule({ due_soon_distance: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ` ${unit}`
        )}
        ${this.renderSliderField(
          localize('editor.vehicle_maintenance.due_soon_days', lang, 'Warn within (time)'),
          localize(
            'editor.vehicle_maintenance.due_soon_days_desc',
            lang,
            'Remaining days at which a service turns amber.'
          ),
          m.due_soon_days ?? 14,
          14,
          0,
          180,
          1,
          (value: number) => {
            updateModule({ due_soon_days: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ` ${localize('editor.vehicle_maintenance.unit_days_short', lang, 'd')}`
        )}
        ${this.renderSliderField(
          localize('editor.vehicle_maintenance.log_limit', lang, 'Service log entries'),
          localize(
            'editor.vehicle_maintenance.log_limit_desc',
            lang,
            'How many recent entries the card displays. Older entries stay in the to-do list.'
          ),
          m.log_limit ?? 25,
          25,
          5,
          100,
          5,
          (value: number) => {
            updateModule({ log_limit: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderFieldSection(
          localize('editor.vehicle_maintenance.currency_symbol', lang, 'Currency symbol'),
          localize(
            'editor.vehicle_maintenance.currency_symbol_desc',
            lang,
            'Prefixed to every cost shown on the card.'
          ),
          hass,
          { currency_symbol: m.currency_symbol ?? '$' },
          [this.textField('currency_symbol')],
          (e: CustomEvent) => {
            updateModule({
              currency_symbol: e.detail.value?.currency_symbol ?? '',
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderConditionalFieldsGroup(
          localize('editor.vehicle_maintenance.advanced', lang, 'Advanced'),
          html`
            ${this.renderFieldSection(
              localize('editor.vehicle_maintenance.odometer_offset', lang, 'Odometer offset'),
              localize(
                'editor.vehicle_maintenance.odometer_offset_desc',
                lang,
                'Added to every reading, in {unit}. Use this when the sensor was reset or starts from zero — for example a dongle fitted at 82,000 miles.'
              )
                .split('{unit}')
                .join(unit),
              hass,
              { odometer_offset: m.odometer_offset ?? 0 },
              [this.numberField('odometer_offset', -2000000, 2000000, 1)],
              (e: CustomEvent) => {
                updateModule({
                  odometer_offset: Number(e.detail.value?.odometer_offset) || 0,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }
            )}
          `
        )}
      `
    );
  }

  // ── 6. Colors ──────────────────────────────────────────────────────────────

  private _renderColorsSection(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const color = (
      key: keyof VehicleMaintenanceModule,
      title: string,
      description: string,
      fallback: string
    ) =>
      this.renderColorField(
        title,
        description,
        hass,
        (m[key] as string) || '',
        fallback,
        (value: string) => {
          updateModule({ [key]: value } as Partial<CardModule>);
          this.triggerPreviewUpdate();
        }
      );

    return this._sectionShell(
      localize('editor.vehicle_maintenance.colors_section', lang, 'Colors'),
      localize(
        'editor.vehicle_maintenance.colors_section_desc',
        lang,
        'Leave blank to follow your Home Assistant theme.'
      ),
      html`
        ${color(
          'ok_color',
          localize('editor.vehicle_maintenance.ok_color', lang, 'On schedule'),
          '',
          'var(--success-color, #43a047)'
        )}
        ${color(
          'due_soon_color',
          localize('editor.vehicle_maintenance.due_soon_color', lang, 'Due soon'),
          '',
          'var(--warning-color, #fb8c00)'
        )}
        ${color(
          'overdue_color',
          localize('editor.vehicle_maintenance.overdue_color', lang, 'Overdue'),
          '',
          'var(--error-color, #e53935)'
        )}
        ${color(
          'text_color',
          localize('editor.vehicle_maintenance.text_color', lang, 'Text'),
          '',
          'var(--primary-text-color)'
        )}
        ${color(
          'secondary_text_color',
          localize('editor.vehicle_maintenance.secondary_text_color', lang, 'Secondary text'),
          '',
          'var(--secondary-text-color)'
        )}
        ${color(
          'card_background_color',
          localize('editor.vehicle_maintenance.card_background_color', lang, 'Card background'),
          '',
          'var(--card-background-color)'
        )}
      `
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Preview
  // ══════════════════════════════════════════════════════════════════════════

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as VehicleMaintenanceModule;
    const lang = hass?.locale?.language || 'en';

    // A vehicle with nothing to track has nothing to say.
    if (!Array.isArray(m.services) || m.services.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.vehicle_maintenance.config_needed', lang, 'Add a service'),
        localize(
          'editor.vehicle_maintenance.config_needed_desc',
          lang,
          'Add at least one service interval in the General tab'
        ),
        'mdi:car-wrench'
      );
    }

    this._ensureLogLoaded(m, hass);

    const p = this._palette(m);
    const st = this._ensurePreview(m.id);
    const { statuses, odometer } = this._statuses(m, hass, config, lang);
    const ranked = sortByUrgency(statuses);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const layout = m.layout || 'hero';

    const body =
      layout === 'compact'
        ? this._renderCompactLayout(m, hass, config, lang, p, ranked, odometer)
        : layout === 'list'
          ? this._renderListLayout(m, hass, config, lang, p, statuses, odometer, st)
          : this._renderHeroLayout(m, hass, config, lang, p, statuses, ranked, odometer, st);

    // The card's own controls must not double as tap targets for the module action.
    const gestures = hass
      ? this.createGestureHandlers(
          m.id,
          {
            tap_action: m.tap_action,
            hold_action: m.hold_action,
            double_tap_action: m.double_tap_action,
            entity: this.resolveEntity(m.odometer_entity, config) || m.odometer_entity || '',
            module: m,
          },
          hass,
          config,
          ['.uc-vm-mark', '.uc-vm-log-delete', '.uc-vm-log-more']
        )
      : null;

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="uc-vm-wrapper ${hoverClass}"
        style="box-sizing: border-box; padding: 0; border-radius: 12px; overflow: hidden; background: ${p.cardBg}; color: ${p.text}; ${designStyles}"
        @pointerdown=${gestures?.onPointerDown}
        @pointermove=${gestures?.onPointerMove}
        @pointerup=${gestures?.onPointerUp}
        @pointerleave=${gestures?.onPointerLeave}
        @pointercancel=${gestures?.onPointerCancel}
      >
        ${this.wrapWithAnimation(body, module, hass)}
      </div>
    `;
  }

  // ── Hero ───────────────────────────────────────────────────────────────────

  private _renderHeroLayout(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    p: Palette,
    statuses: ServiceStatus[],
    ranked: ServiceStatus[],
    odometer: OdometerReading | null,
    st: PreviewState
  ): TemplateResult {
    const imagePath = m.show_vehicle_image !== false ? m.vehicle_image || '' : '';
    const imageUrl = imagePath && hass ? getImageUrl(hass, imagePath) : '';
    const heading = m.title?.trim() || m.vehicle_name?.trim() || '';
    const next = ranked.find(s => s.state !== 'unknown') ?? ranked[0] ?? null;

    return html`
      ${imageUrl
        ? html`
            <div class="uc-vm-hero-banner">
              <img
                src="${imageUrl}"
                alt="${heading ||
                localize('editor.vehicle_maintenance.vehicle_photo_alt', lang, 'Vehicle photo')}"
                loading="lazy"
              />
              <div class="uc-vm-hero-scrim"></div>
              ${m.show_title !== false && heading
                ? html`<div class="uc-vm-hero-heading">${heading}</div>`
                : nothing}
            </div>
          `
        : m.show_title !== false && heading
          ? html`
              <div class="uc-vm-icon-header">
                <ha-icon icon="mdi:car-wrench" style="color: var(--primary-color);"></ha-icon>
                <span style="color: ${p.text};">${heading}</span>
              </div>
            `
          : nothing}

      <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
        ${this._renderStatsRow(m, lang, p, statuses, odometer)}
        ${m.show_fuel !== false ? this._renderLevelBars(m, hass, config, lang, p) : nothing}
        ${m.show_next_service !== false && next
          ? this._renderNextServiceCard(m, hass, config, lang, p, next)
          : nothing}
        ${this._renderOdometerHint(m, hass, config, lang, p, odometer)}
        ${m.show_service_log !== false ? this._renderLogSection(m, hass, lang, p, st) : nothing}
      </div>
    `;
  }

  /** Big odometer plus a one-glance service tally. */
  private _renderStatsRow(
    m: VehicleMaintenanceModule,
    lang: string,
    p: Palette,
    statuses: ServiceStatus[],
    odometer: OdometerReading | null
  ): TemplateResult {
    const overdue = statuses.filter(s => s.state === 'overdue').length;
    const dueSoon = statuses.filter(s => s.state === 'due_soon').length;
    const unit = this._unitLabel(m, lang);

    const tallyColor = overdue > 0 ? p.over : dueSoon > 0 ? p.soon : p.ok;
    const tallyText =
      overdue > 0
        ? localize('editor.vehicle_maintenance.tally_overdue', lang, '{count} overdue')
            .split('{count}')
            .join(String(overdue))
        : dueSoon > 0
          ? localize('editor.vehicle_maintenance.tally_due_soon', lang, '{count} due soon')
              .split('{count}')
              .join(String(dueSoon))
          : localize('editor.vehicle_maintenance.tally_ok', lang, 'All up to date');

    return html`
      <div class="uc-vm-stats">
        ${m.show_odometer !== false
          ? html`
              <div class="uc-vm-stat">
                <div class="uc-vm-stat-label" style="color: ${p.secondary};">
                  ${localize('editor.vehicle_maintenance.odometer', lang, 'Odometer')}
                </div>
                <div class="uc-vm-stat-value" style="color: ${p.text};">
                  ${odometer
                    ? html`${this._num(odometer.value, lang)}<span
                          class="uc-vm-stat-unit"
                          style="color: ${p.secondary};"
                          >${unit}</span
                        >`
                    : html`<span style="color: ${p.secondary}; font-size: 20px;"
                        >${localize(
                          'editor.vehicle_maintenance.no_reading',
                          lang,
                          'No reading'
                        )}</span
                      >`}
                </div>
              </div>
            `
          : nothing}
        <div class="uc-vm-tally" style="color: ${tallyColor}; border-color: ${tallyColor};">
          <ha-icon
            icon=${overdue > 0
              ? 'mdi:alert-octagon'
              : dueSoon > 0
                ? 'mdi:alert'
                : 'mdi:check-circle-outline'}
          ></ha-icon>
          <span>${tallyText}</span>
        </div>
      </div>
    `;
  }

  /** Fuel and charge as bars when the entity reports a percentage. */
  private _renderLevelBars(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    p: Palette
  ): TemplateResult {
    const bars: TemplateResult[] = [];

    const push = (rawEntity: string | undefined, icon: string, label: string, accent: string) => {
      const entityId = this.resolveEntity(rawEntity, config) || rawEntity || '';
      if (!entityId) return;
      const state = hass?.states?.[entityId];
      if (!state) return;
      const value = Number(state.state);
      if (!Number.isFinite(value)) return;
      const unit = String(state.attributes?.['unit_of_measurement'] ?? '');
      const isPercent = unit === '%';
      const pct = isPercent ? Math.max(0, Math.min(100, value)) : null;

      bars.push(html`
        <div class="uc-vm-level">
          <div class="uc-vm-level-head">
            <ha-icon icon="${icon}" style="color: ${accent};"></ha-icon>
            <span style="color: ${p.secondary};">${label}</span>
            <span style="color: ${p.text}; margin-left: auto; font-weight: 600;">
              ${this._num(value, lang, isPercent ? 0 : 1)}${unit ? ` ${unit}` : ''}
            </span>
          </div>
          ${pct !== null
            ? html`<div class="uc-vm-track">
                <div
                  class="uc-vm-fill"
                  style="width: ${pct}%; background: ${accent};"
                  role="progressbar"
                  aria-valuenow="${Math.round(pct)}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label="${label}"
                ></div>
              </div>`
            : nothing}
        </div>
      `);
    };

    push(
      m.fuel_entity,
      'mdi:gas-station',
      localize('editor.vehicle_maintenance.fuel', lang, 'Fuel'),
      p.ok
    );
    push(
      m.battery_entity,
      'mdi:ev-station',
      localize('editor.vehicle_maintenance.charge', lang, 'Charge'),
      'var(--primary-color)'
    );

    if (bars.length === 0) return html``;
    return html`<div class="uc-vm-levels">${bars}</div>`;
  }

  /** The headline "next service" panel used by the hero layout. */
  private _renderNextServiceCard(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    p: Palette,
    status: ServiceStatus
  ): TemplateResult {
    const color = this._stateColor(status.state, p);
    const busy = this._preview.get(m.id)?.busyId === status.item.id;
    const projection = this._projectionLabel(m, hass, config, lang, status);

    return html`
      <div class="uc-vm-next" style="border-color: ${color};">
        <div class="uc-vm-next-head">
          <div class="uc-vm-next-icon" style="color: ${color};">
            <ha-icon icon="${status.item.icon || 'mdi:wrench'}"></ha-icon>
          </div>
          <div style="min-width: 0; flex: 1;">
            <div class="uc-vm-next-label" style="color: ${p.secondary};">
              ${localize('editor.vehicle_maintenance.next_service', lang, 'Next service')}
            </div>
            <div class="uc-vm-next-name" style="color: ${p.text};">${status.item.name}</div>
          </div>
          <div class="uc-vm-next-due" style="color: ${color};">${status.dueLabel}</div>
        </div>
        ${m.show_progress_bars !== false ? this._renderProgressBar(status, p) : nothing}
        ${projection
          ? html`<div class="uc-vm-next-note" style="color: ${p.secondary};">${projection}</div>`
          : nothing}
        ${status.item.notes?.trim()
          ? html`<div class="uc-vm-next-note" style="color: ${p.secondary};">
              <ha-icon icon="mdi:note-text-outline"></ha-icon>${status.item.notes.trim()}
            </div>`
          : nothing}
        ${this._renderMarkButton(m, hass, config, lang, status, busy, true)}
      </div>
    `;
  }

  /** "about 3 weeks at your usual mileage", only when the history supports it. */
  private _projectionLabel(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    status: ServiceStatus
  ): string {
    if (status.drivenBy !== 'distance' || status.distanceRemaining === null) return '';
    if (status.distanceRemaining <= 0) return '';

    const odometerEntity = this.resolveEntity(m.odometer_entity, config) || m.odometer_entity || '';
    if (!odometerEntity) return '';

    const { estimate } = queryUsageEstimate(hass, m, odometerEntity, () =>
      this.triggerPreviewUpdate()
    );
    const days = projectDaysFromDistance(status.distanceRemaining, estimate);
    if (days === null || !estimate) return '';

    const perDay = `${this._num(estimate.perDay, lang, estimate.perDay < 10 ? 1 : 0)} ${this._unitLabel(m, lang)}`;
    return localize(
      'editor.vehicle_maintenance.projection',
      lang,
      'About {days} days away at {perDay} per day, based on {window} days of history.'
    )
      .split('{days}')
      .join(String(days))
      .split('{perDay}')
      .join(perDay)
      .split('{window}')
      .join(String(Math.round(estimate.days)));
  }

  private _renderMarkButton(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    status: ServiceStatus,
    busy: boolean,
    wide: boolean
  ): TemplateResult {
    const canPersist = !!m.todo_entity;
    const title = canPersist
      ? localize('editor.vehicle_maintenance.mark_serviced', lang, 'Mark serviced now')
      : localize(
          'editor.vehicle_maintenance.mark_needs_list',
          lang,
          'Choose a storage list in the General tab to record services from the card'
        );

    return html`
      <button
        type="button"
        class="uc-vm-mark ${wide ? 'uc-vm-mark-wide' : ''}"
        title=${title}
        aria-label=${title}
        ?disabled=${busy || !canPersist}
        @click=${(e: Event) => {
          e.stopPropagation();
          void this._markServiced(m, status.item, hass, config, lang);
        }}
      >
        <ha-icon icon=${busy ? 'mdi:progress-clock' : 'mdi:check-decagram-outline'}></ha-icon>
        ${wide
          ? html`<span
              >${busy
                ? localize('editor.vehicle_maintenance.marking', lang, 'Logging\u2026')
                : localize(
                    'editor.vehicle_maintenance.mark_serviced',
                    lang,
                    'Mark serviced now'
                  )}</span
            >`
          : nothing}
      </button>
    `;
  }

  /** Nudges the user toward distance tracking without making it feel broken. */
  private _renderOdometerHint(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    p: Palette,
    odometer: OdometerReading | null
  ): TemplateResult {
    if (odometer) return html``;
    const configured = !!(this.resolveEntity(m.odometer_entity, config) || m.odometer_entity);
    const text = configured
      ? localize(
          'editor.vehicle_maintenance.hint_odometer_unavailable',
          lang,
          'The odometer sensor is unavailable, so distance intervals are paused. Time-based tracking is still running.'
        )
      : localize(
          'editor.vehicle_maintenance.hint_no_odometer',
          lang,
          'Tracking by time only. Add an odometer entity to unlock distance intervals and mileage-stamped log entries.'
        );

    return html`
      <div class="uc-vm-hint" style="color: ${p.secondary};">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span>${text}</span>
      </div>
    `;
  }

  // ── List ───────────────────────────────────────────────────────────────────

  private _renderListLayout(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    p: Palette,
    statuses: ServiceStatus[],
    odometer: OdometerReading | null,
    st: PreviewState
  ): TemplateResult {
    const heading = m.title?.trim() || m.vehicle_name?.trim() || '';
    const unit = this._unitLabel(m, lang);

    return html`
      <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        ${m.show_title !== false && heading
          ? html`
              <div class="uc-vm-list-head">
                <ha-icon icon="mdi:car-wrench" style="color: var(--primary-color);"></ha-icon>
                <span style="color: ${p.text}; font-weight: 700;">${heading}</span>
                ${m.show_odometer !== false && odometer
                  ? html`<span style="margin-left: auto; color: ${p.secondary}; font-size: 13px;"
                      >${this._num(odometer.value, lang)} ${unit}</span
                    >`
                  : nothing}
              </div>
            `
          : nothing}
        ${m.show_fuel !== false ? this._renderLevelBars(m, hass, config, lang, p) : nothing}

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${statuses.map(status => this._renderServiceRowPreview(m, hass, config, lang, p, status))}
        </div>

        ${this._renderOdometerHint(m, hass, config, lang, p, odometer)}
        ${m.show_service_log !== false ? this._renderLogSection(m, hass, lang, p, st) : nothing}
      </div>
    `;
  }

  private _renderServiceRowPreview(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    p: Palette,
    status: ServiceStatus
  ): TemplateResult {
    const color = this._stateColor(status.state, p);
    const busy = this._preview.get(m.id)?.busyId === status.item.id;

    return html`
      <div class="uc-vm-srow">
        <div class="uc-vm-srow-icon" style="color: ${color};">
          <ha-icon icon="${status.item.icon || 'mdi:wrench'}"></ha-icon>
        </div>
        <div class="uc-vm-srow-main">
          <div class="uc-vm-srow-top">
            <span
              class="uc-vm-srow-name"
              style="color: ${p.text};"
              title=${status.item.notes?.trim() || status.item.name}
              >${status.item.name}</span
            >
            <span class="uc-vm-srow-due" style="color: ${color};">${status.dueLabel}</span>
          </div>
          ${m.show_progress_bars !== false ? this._renderProgressBar(status, p) : nothing}
        </div>
        ${this._renderMarkButton(m, hass, config, lang, status, busy, false)}
      </div>
    `;
  }

  /**
   * Progress toward due. Overdue bars clamp at 100% and switch to a hatched
   * fill so "past due" reads instantly instead of just looking full.
   */
  private _renderProgressBar(status: ServiceStatus, p: Palette): TemplateResult {
    if (status.progress === null) {
      return html`<div class="uc-vm-track">
        <div class="uc-vm-fill uc-vm-fill-unknown" style="width: 100%;"></div>
      </div>`;
    }

    const color = this._stateColor(status.state, p);
    const pct = Math.max(0, Math.min(1, status.progress)) * 100;
    const overdue = status.state === 'overdue';

    return html`
      <div class="uc-vm-track">
        <div
          class="uc-vm-fill ${overdue ? 'uc-vm-fill-overdue' : ''}"
          style="width: ${overdue ? 100 : pct}%; background: ${color}; --uc-vm-stripe: ${color};"
          role="progressbar"
          aria-valuenow="${Math.round(pct)}"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="${status.item.name}"
        ></div>
      </div>
    `;
  }

  // ── Compact ────────────────────────────────────────────────────────────────

  private _renderCompactLayout(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string,
    p: Palette,
    ranked: ServiceStatus[],
    odometer: OdometerReading | null
  ): TemplateResult {
    const heading = m.title?.trim() || m.vehicle_name?.trim() || '';
    const unit = this._unitLabel(m, lang);
    const top = ranked.slice(0, 2);
    const worst = ranked[0];
    const summaryColor = worst ? this._stateColor(worst.state, p) : p.secondary;

    return html`
      <div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;">
        <div class="uc-vm-compact-head">
          <ha-icon icon="mdi:car-wrench" style="color: ${summaryColor};"></ha-icon>
          ${m.show_title !== false && heading
            ? html`<span class="uc-vm-compact-name" style="color: ${p.text};">${heading}</span>`
            : nothing}
          ${m.show_odometer !== false
            ? html`<span class="uc-vm-compact-odo" style="color: ${p.secondary};">
                ${odometer
                  ? `${this._num(odometer.value, lang)} ${unit}`
                  : localize('editor.vehicle_maintenance.no_reading', lang, 'No reading')}
              </span>`
            : nothing}
        </div>

        ${top.length === 0
          ? html`<div style="font-size: 13px; color: ${p.secondary};">
              ${localize('editor.vehicle_maintenance.tally_ok', lang, 'All up to date')}
            </div>`
          : html`
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${top.map(status => {
                  const color = this._stateColor(status.state, p);
                  return html`
                    <div class="uc-vm-compact-row">
                      <ha-icon
                        icon="${status.item.icon || 'mdi:wrench'}"
                        style="color: ${color};"
                      ></ha-icon>
                      <span class="uc-vm-compact-label" style="color: ${p.text};"
                        >${status.item.name}</span
                      >
                      <span
                        style="color: ${color}; font-size: 12px; font-weight: 600; white-space: nowrap;"
                        >${status.dueLabel}</span
                      >
                    </div>
                    ${m.show_progress_bars !== false ? this._renderProgressBar(status, p) : nothing}
                  `;
                })}
              </div>
            `}
      </div>
    `;
  }

  // ── Service log ────────────────────────────────────────────────────────────

  private _renderLogSection(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    lang: string,
    p: Palette,
    st: PreviewState
  ): TemplateResult {
    if (!m.todo_entity) {
      return html`
        <div class="uc-vm-log">
          <div class="uc-vm-log-head" style="color: ${p.secondary};">
            <ha-icon icon="mdi:notebook-outline"></ha-icon>
            <span>${localize('editor.vehicle_maintenance.service_log', lang, 'Service log')}</span>
          </div>
          <div class="uc-vm-log-empty" style="color: ${p.secondary};">
            ${localize(
              'editor.vehicle_maintenance.log_no_storage',
              lang,
              'Pick a to-do list in the General tab to keep a permanent service history with costs.'
            )}
          </div>
        </div>
      `;
    }

    if (st.loading && st.log.length === 0) {
      return html`
        <div class="uc-vm-log">
          <div class="uc-vm-log-head" style="color: ${p.secondary};">
            <ha-icon icon="mdi:notebook-outline"></ha-icon>
            <span>${localize('editor.vehicle_maintenance.service_log', lang, 'Service log')}</span>
          </div>
          <div class="uc-vm-skeletons">
            ${[0, 1, 2].map(() => html`<div class="uc-vm-skeleton"></div>`)}
          </div>
        </div>
      `;
    }

    if (st.error) {
      return html`
        <div class="uc-vm-log">
          <div class="uc-vm-log-head" style="color: ${p.secondary};">
            <ha-icon icon="mdi:notebook-outline"></ha-icon>
            <span>${localize('editor.vehicle_maintenance.service_log', lang, 'Service log')}</span>
          </div>
          <div class="uc-vm-log-empty" style="color: var(--error-color, #e53935);">
            <ha-icon icon="mdi:alert-circle-outline" style="--mdc-icon-size: 16px;"></ha-icon>
            ${localize(
              'editor.vehicle_maintenance.log_error',
              lang,
              'Could not read the service log from that to-do list.'
            )}
          </div>
        </div>
      `;
    }

    const limit = Math.max(m.log_limit ?? 25, 1);
    const entries = st.log.slice(0, limit);
    const totals = summarizeLog(entries);
    const unit = this._unitLabel(m, lang);
    const visible = st.logExpanded ? entries : entries.slice(0, LOG_PREVIEW_ROWS);

    return html`
      <div class="uc-vm-log">
        <div class="uc-vm-log-head" style="color: ${p.secondary};">
          <ha-icon icon="mdi:notebook-outline"></ha-icon>
          <span>${localize('editor.vehicle_maintenance.service_log', lang, 'Service log')}</span>
          ${entries.length > 0
            ? html`<span style="margin-left: auto; font-size: 12px;"
                >${localize('editor.vehicle_maintenance.log_count', lang, '{count} entries')
                  .split('{count}')
                  .join(String(entries.length))}</span
              >`
            : nothing}
        </div>

        ${entries.length === 0
          ? html`<div class="uc-vm-log-empty" style="color: ${p.secondary};">
              ${localize(
                'editor.vehicle_maintenance.log_empty',
                lang,
                'No services logged yet. Use "Mark serviced" on a service to start your history.'
              )}
            </div>`
          : html`
              <div class="uc-vm-log-rows">
                ${visible.map(entry => this._renderLogRow(m, hass, lang, p, entry, unit))}
              </div>
              ${entries.length > LOG_PREVIEW_ROWS
                ? html`<button
                    type="button"
                    class="uc-vm-log-more"
                    style="color: var(--primary-color);"
                    @click=${() => {
                      st.logExpanded = !st.logExpanded;
                      this.triggerPreviewUpdate(true);
                    }}
                  >
                    ${st.logExpanded
                      ? localize('editor.vehicle_maintenance.log_show_less', lang, 'Show less')
                      : localize(
                          'editor.vehicle_maintenance.log_show_all',
                          lang,
                          'Show all {count}'
                        )
                          .split('{count}')
                          .join(String(entries.length))}
                  </button>`
                : nothing}
              ${m.show_costs !== false && totals.entriesWithCost > 0
                ? html`
                    <div class="uc-vm-log-totals" style="border-color: var(--divider-color);">
                      <span style="color: ${p.secondary};"
                        >${localize(
                          'editor.vehicle_maintenance.total_spend',
                          lang,
                          'Total spend'
                        )}</span
                      >
                      <span style="color: ${p.text}; font-weight: 700;"
                        >${this._money(totals.totalCost, m, lang)}</span
                      >
                      ${totals.costPerDistance !== null
                        ? html`<span style="color: ${p.secondary}; margin-left: auto;">
                            ${localize(
                              'editor.vehicle_maintenance.cost_per_distance',
                              lang,
                              '{amount} per {unit}'
                            )
                              .split('{amount}')
                              .join(this._money(totals.costPerDistance, m, lang))
                              .split('{unit}')
                              .join(unit)}
                          </span>`
                        : nothing}
                    </div>
                  `
                : nothing}
            `}
      </div>
    `;
  }

  private _renderLogRow(
    m: VehicleMaintenanceModule,
    hass: HomeAssistant,
    lang: string,
    p: Palette,
    entry: VehicleServiceLogEntry,
    unit: string
  ): TemplateResult {
    const payload = entry.payload;
    const odo = typeof payload.odometer === 'number' ? payload.odometer : null;
    const cost = typeof payload.cost === 'number' ? payload.cost : null;

    return html`
      <div class="uc-vm-log-row">
        <div class="uc-vm-log-date" style="color: ${p.secondary};">
          ${this._date(payload.at, lang)}
        </div>
        <div class="uc-vm-log-name" style="color: ${p.text};">${payload.service_name}</div>
        <div class="uc-vm-log-odo" style="color: ${p.secondary};">
          ${odo !== null ? `${this._num(odo, lang)} ${unit}` : '—'}
        </div>
        ${m.show_costs !== false
          ? html`<div class="uc-vm-log-cost" style="color: ${p.text};">
              ${cost !== null ? this._money(cost, m, lang) : ''}
            </div>`
          : nothing}
        <button
          type="button"
          class="uc-vm-log-delete"
          title=${localize(
            'editor.vehicle_maintenance.delete_log_title',
            lang,
            'Delete log entry?'
          )}
          aria-label=${localize(
            'editor.vehicle_maintenance.delete_log_title',
            lang,
            'Delete log entry?'
          )}
          @click=${(e: Event) => {
            e.stopPropagation();
            void this._deleteLogEntry(m, entry, hass, lang);
          }}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Styles
  // ══════════════════════════════════════════════════════════════════════════

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      .uc-vm-wrapper { box-sizing: border-box; }
      .uc-vm-wrapper * { box-sizing: border-box; }

      /* ── Editor: notices ──────────────────────────────────────────────── */
      .vm-notice {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        margin: -6px 0 16px;
        border-left: 3px solid var(--primary-color);
        border-radius: 6px;
        background: rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.06);
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }
      .vm-notice ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; margin-top: 1px; }
      .vm-notice-text { min-width: 0; }
      .vm-notice-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

      /* ── Editor: buttons ──────────────────────────────────────────────── */
      .vm-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 36px;
        padding: 0 14px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s ease, border-color 0.15s ease;
      }
      .vm-btn:hover:not(:disabled) { border-color: var(--primary-color); }
      .vm-btn:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .vm-btn:disabled { opacity: 0.5; cursor: default; }
      .vm-btn ha-icon { --mdc-icon-size: 18px; }
      .vm-btn-primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .vm-btn-wide { width: 100%; margin-top: 4px; }

      .vm-icon-btn {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .vm-icon-btn ha-icon { --mdc-icon-size: 18px; }
      .vm-icon-btn:hover:not(:disabled) {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        color: var(--primary-color);
      }
      .vm-icon-btn:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -2px; }
      .vm-icon-btn:disabled { opacity: 0.3; cursor: default; }
      .vm-icon-btn-danger:hover:not(:disabled) {
        background: rgba(var(--rgb-error-color, 229, 57, 53), 0.14);
        color: var(--error-color, #e53935);
      }

      /* ── Editor: repeatable service rows ──────────────────────────────── */
      .vm-rows { display: flex; flex-direction: column; margin-bottom: 12px; }
      .vm-empty-rows {
        padding: 20px 12px;
        margin-bottom: 12px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        text-align: center;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      ha-expansion-panel.vm-service-panel {
        --ha-card-border-radius: 8px;
        --expansion-panel-summary-padding: 0;
        /* Horizontal-only padding here, vertical via ::part(content), otherwise
           the height-animated container leaks space under collapsed rows. */
        --expansion-panel-content-padding: 0 12px;
        margin-bottom: 8px;
        background: var(--card-background-color);
        border-radius: 8px;
      }
      ha-expansion-panel.vm-service-panel::part(summary) { padding: 0; min-height: unset; }
      ha-expansion-panel.vm-service-panel::part(content) { padding: 12px 0 4px; }

      .vm-row-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 10px;
      }
      .vm-row-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        color: var(--primary-color);
      }
      .vm-row-icon ha-icon { --mdc-icon-size: 18px; }
      .vm-row-info { flex: 1; min-width: 0; }
      .vm-row-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .vm-row-summary {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .vm-row-badge {
        flex-shrink: 0;
        padding: 2px 8px;
        border: 1px solid currentColor;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .vm-row-body { padding-bottom: 8px; }

      /* ── Editor: presets ──────────────────────────────────────────────── */
      .vm-row-actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .vm-presets { margin-top: 14px; }
      .vm-presets-hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 10px;
        line-height: 1.5;
      }
      .vm-preset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 8px;
      }
      .vm-preset-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding: 10px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        text-align: left;
        transition: border-color 0.15s ease, transform 0.15s ease;
      }
      .vm-preset-card:hover { border-color: var(--primary-color); transform: translateY(-1px); }
      .vm-preset-card:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .vm-preset-card ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); }
      .vm-preset-name {
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
      .vm-preset-interval { font-size: 11px; color: var(--secondary-text-color); }

      /* ── Preview: hero ────────────────────────────────────────────────── */
      .uc-vm-hero-banner { position: relative; width: 100%; line-height: 0; }
      .uc-vm-hero-banner img {
        width: 100%;
        height: 160px;
        object-fit: cover;
        display: block;
      }
      .uc-vm-hero-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0) 60%);
        pointer-events: none;
      }
      .uc-vm-hero-heading {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 12px;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        color: #fff;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-vm-icon-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 16px 0;
        font-size: 17px;
        font-weight: 700;
        min-width: 0;
      }
      .uc-vm-icon-header span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-vm-icon-header ha-icon { --mdc-icon-size: 22px; flex-shrink: 0; }

      .uc-vm-stats {
        display: flex;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 12px;
      }
      .uc-vm-stat { min-width: 0; }
      .uc-vm-stat-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .uc-vm-stat-value {
        font-size: 30px;
        font-weight: 700;
        line-height: 1.1;
        display: flex;
        align-items: baseline;
        gap: 5px;
      }
      .uc-vm-stat-unit { font-size: 14px; font-weight: 600; }
      .uc-vm-tally {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-left: auto;
        padding: 5px 10px;
        border: 1px solid currentColor;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
      }
      .uc-vm-tally ha-icon { --mdc-icon-size: 16px; }

      /* ── Preview: levels ──────────────────────────────────────────────── */
      .uc-vm-levels { display: flex; flex-direction: column; gap: 10px; }
      .uc-vm-level-head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        margin-bottom: 4px;
        min-width: 0;
      }
      .uc-vm-level-head ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }

      /* ── Preview: progress ────────────────────────────────────────────── */
      .uc-vm-track {
        position: relative;
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: var(--divider-color);
        overflow: hidden;
      }
      .uc-vm-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.35s ease;
      }
      /* Overdue clamps at full width, so a hatch pattern carries the meaning. */
      .uc-vm-fill-overdue {
        background-image: repeating-linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.35) 0,
          rgba(255, 255, 255, 0.35) 4px,
          transparent 4px,
          transparent 8px
        );
        animation: uc-vm-hatch 1.2s linear infinite;
      }
      .uc-vm-fill-unknown {
        background: repeating-linear-gradient(
          45deg,
          var(--divider-color) 0,
          var(--divider-color) 5px,
          transparent 5px,
          transparent 10px
        );
        opacity: 0.7;
      }
      @keyframes uc-vm-hatch {
        from { background-position: 0 0; }
        to { background-position: 22px 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .uc-vm-fill { transition: none; }
        .uc-vm-fill-overdue { animation: none; }
      }

      /* ── Preview: next service ────────────────────────────────────────── */
      .uc-vm-next {
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-left-width: 3px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .uc-vm-next-head { display: flex; align-items: center; gap: 10px; }
      .uc-vm-next-icon {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.07);
      }
      .uc-vm-next-icon ha-icon { --mdc-icon-size: 20px; }
      .uc-vm-next-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .uc-vm-next-name {
        font-size: 15px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-vm-next-due { font-size: 13px; font-weight: 700; text-align: right; white-space: nowrap; }
      .uc-vm-next-note {
        display: flex;
        align-items: flex-start;
        gap: 5px;
        font-size: 11px;
        line-height: 1.45;
      }
      .uc-vm-next-note ha-icon { --mdc-icon-size: 14px; flex-shrink: 0; margin-top: 1px; }

      .uc-vm-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex-shrink: 0;
        min-height: 32px;
        min-width: 32px;
        padding: 0 10px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: transparent;
        color: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .uc-vm-mark-wide { width: 100%; }
      .uc-vm-mark ha-icon { --mdc-icon-size: 18px; }
      .uc-vm-mark:hover:not(:disabled) { border-color: var(--primary-color); color: var(--primary-color); }
      .uc-vm-mark:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .uc-vm-mark:disabled { opacity: 0.4; cursor: default; }

      /* ── Preview: list rows ───────────────────────────────────────────── */
      .uc-vm-list-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .uc-vm-list-head ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }

      .uc-vm-srow { display: flex; align-items: center; gap: 10px; }
      .uc-vm-srow-icon {
        flex-shrink: 0;
        width: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .uc-vm-srow-icon ha-icon { --mdc-icon-size: 20px; }
      .uc-vm-srow-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
      .uc-vm-srow-top { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
      .uc-vm-srow-name {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-vm-srow-due { font-size: 12px; font-weight: 600; white-space: nowrap; }

      /* ── Preview: compact ─────────────────────────────────────────────── */
      .uc-vm-compact-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .uc-vm-compact-head ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
      .uc-vm-compact-name {
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }
      .uc-vm-compact-odo { margin-left: auto; font-size: 12px; white-space: nowrap; }
      .uc-vm-compact-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .uc-vm-compact-row ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
      .uc-vm-compact-label {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── Preview: hint + log ──────────────────────────────────────────── */
      .uc-vm-hint {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 11px;
        line-height: 1.45;
      }
      .uc-vm-hint ha-icon { --mdc-icon-size: 15px; flex-shrink: 0; margin-top: 1px; }

      .uc-vm-log { border-top: 1px solid var(--divider-color); padding-top: 10px; }
      .uc-vm-log-head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 8px;
      }
      .uc-vm-log-head ha-icon { --mdc-icon-size: 16px; }
      .uc-vm-log-empty { font-size: 12px; line-height: 1.5; padding: 4px 0 2px; }
      .uc-vm-log-rows { display: flex; flex-direction: column; }
      .uc-vm-log-row {
        display: grid;
        grid-template-columns: minmax(72px, auto) minmax(0, 1fr) auto auto 24px;
        align-items: center;
        gap: 8px;
        padding: 5px 0;
        font-size: 12px;
        border-bottom: 1px solid var(--divider-color);
      }
      .uc-vm-log-row:last-child { border-bottom: none; }
      .uc-vm-log-date { white-space: nowrap; }
      .uc-vm-log-name {
        min-width: 0;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-vm-log-odo { white-space: nowrap; }
      .uc-vm-log-cost { white-space: nowrap; font-weight: 600; }
      .uc-vm-log-delete {
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        border-radius: 5px;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        opacity: 0.55;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .uc-vm-log-delete ha-icon { --mdc-icon-size: 15px; }
      .uc-vm-log-delete:hover { opacity: 1; color: var(--error-color, #e53935); }
      .uc-vm-log-delete:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -2px; opacity: 1; }
      .uc-vm-log-more {
        margin-top: 6px;
        padding: 4px 0;
        border: none;
        background: transparent;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .uc-vm-log-more:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .uc-vm-log-totals {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color);
        font-size: 12px;
      }

      .uc-vm-skeletons { display: flex; flex-direction: column; gap: 6px; }
      .uc-vm-skeleton {
        height: 14px;
        border-radius: 4px;
        background: linear-gradient(
          90deg,
          var(--divider-color) 25%,
          rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.08) 50%,
          var(--divider-color) 75%
        );
        background-size: 200% 100%;
        animation: uc-vm-shimmer 1.4s ease-in-out infinite;
      }
      @keyframes uc-vm-shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .uc-vm-skeleton { animation: none; }
      }

      /* Narrow cards: drop the odometer column before the name gets squeezed. */
      @media (max-width: 380px) {
        .uc-vm-log-row { grid-template-columns: minmax(0, 1fr) auto 24px; }
        .uc-vm-log-date { grid-column: 1 / -1; font-size: 11px; }
        .uc-vm-log-odo { display: none; }
        .uc-vm-stat-value { font-size: 24px; }
        .uc-vm-hero-banner img { height: 130px; }
      }
    `;
  }
}
