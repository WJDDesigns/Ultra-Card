import { TemplateResult, html, nothing, svg } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  ApplianceModule as ApplianceModuleConfig,
  ApplianceCardType,
  UltraCardConfig,
} from '../types';

type AppliancePhase = 'running' | 'paused' | 'done' | 'idle' | 'off' | 'error' | 'unavailable';

interface EntityRef {
  id: string;
  state: string;
  attrs: Record<string, any>;
}

// Covers SmartThings (run/pause/stop), LG ThinQ (running/wash/drying/cooling),
// Miele (in_use/program_running), and common generic integrations.
const RUN_STATES = new Set([
  'run', 'running', 'wash', 'washing', 'dry', 'drying', 'active', 'rinse', 'rinsing',
  'spin', 'spinning', 'busy', 'in_use', 'working', 'cleaning', 'heating', 'cooling',
  'cooldown', 'steam', 'prewash', 'pre_wash', 'refreshing', 'program_running', 'on',
  'preheat', 'preheating', 'cooking', 'baking', 'roasting', 'broiling', 'warming',
]);
const PAUSE_STATES = new Set(['pause', 'paused', 'hold', 'program_interrupted', 'delayed_start', 'delay_wash']);
const DONE_STATES = new Set([
  'finish', 'finished', 'done', 'complete', 'completed', 'end', 'ended',
  'program_ended', 'wrinkle_prevent', 'anticrease',
]);
const IDLE_STATES = new Set(['stop', 'stopped', 'idle', 'ready', 'standby', 'none', 'off', 'inactive', 'not_running', 'waiting_to_start']);
const ERROR_STATES = new Set(['error', 'fault', 'failure', 'problem', 'failure_mode']);

function formatLabel(raw: string): string {
  return raw
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function resolvePhase(state: string): AppliancePhase {
  const s = state.toLowerCase().trim();
  if (!s || s === 'unavailable' || s === 'unknown') return 'unavailable';
  if (ERROR_STATES.has(s)) return 'error';
  if (DONE_STATES.has(s)) return 'done';
  if (PAUSE_STATES.has(s)) return 'paused';
  if (RUN_STATES.has(s)) return 'running';
  if (IDLE_STATES.has(s)) return 'idle';
  return 'idle';
}

/**
 * Resolve a cycle-end sensor into a future Date. Brand-agnostic: accepts a
 * completion timestamp (SmartThings), a "H:MM:SS" / "H:MM" duration, or a
 * numeric remaining-time value (minutes by default, unit-aware).
 */
function resolveCompletion(ref: EntityRef | null): Date | null {
  if (!ref) return null;
  const s = ref.state?.trim();
  if (!s || s === 'unavailable' || s === 'unknown' || s === 'none') return null;

  if (/\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d.getTime() > Date.now() ? d : null;
  }

  const dur = s.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (dur) {
    const ms =
      dur[3] !== undefined
        ? (Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3])) * 1000
        : (Number(dur[1]) * 60 + Number(dur[2])) * 60000;
    return ms > 0 ? new Date(Date.now() + ms) : null;
  }

  const n = Number(s);
  if (!Number.isNaN(n)) {
    if (n <= 0) return null;
    const unit = String(ref.attrs.unit_of_measurement || '').toLowerCase();
    const ms = unit.startsWith('h') ? n * 3600000 : unit.startsWith('s') ? n * 1000 : n * 60000;
    return new Date(Date.now() + ms);
  }
  return null;
}

function formatCountdown(target: Date): string {
  const totalMin = Math.max(1, Math.round((target.getTime() - Date.now()) / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatClock(target: Date, locale?: string): string {
  try {
    return target.toLocaleTimeString(locale || undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
}

function formatNumber(state: string, decimals = 1): string {
  const n = Number(state);
  if (Number.isNaN(n)) return state;
  if (Math.abs(n) >= 100) return String(Math.round(n));
  return String(Math.round(n * 10 ** decimals) / 10 ** decimals);
}

const APPLIANCE_META: Record<
  ApplianceCardType,
  { icon: string; fallbackName: string }
> = {
  washer: { icon: 'mdi:washing-machine', fallbackName: 'Washer' },
  dryer: { icon: 'mdi:tumble-dryer', fallbackName: 'Dryer' },
  dishwasher: { icon: 'mdi:dishwasher', fallbackName: 'Dishwasher' },
  fridge: { icon: 'mdi:fridge-outline', fallbackName: 'Refrigerator' },
  range: { icon: 'mdi:stove', fallbackName: 'Range' },
};

/** Is a cooktop burner indicator entity "hot"? */
function burnerOn(ref: EntityRef): boolean {
  const s = ref.state.toLowerCase();
  if (s === 'on' || RUN_STATES.has(s)) return true;
  const n = Number(ref.state);
  return !Number.isNaN(n) && n > 0;
}

const HERO_SIZE = 150;
const STANDARD_SIZE = 104;
const COMPACT_SIZE = 40;

/** Suffixes that mark an entity as appliance telemetry (for prefix scoring) */
const LINK_SUFFIX_PATTERNS: RegExp[] = [
  /machine_state/, /run_state/, /operating_state/, /job_state/, /program_phase/,
  /completion_time/, /remain(ing)?_time/, /(^|_)door/, /temperature/,
  /(^|_)power/, /(^|_)energy/, /filter_status/, /child_lock/, /remote_control/,
];

/**
 * Appliance keyword groups used to keep the prefix fallback from mixing
 * devices: siblings mentioning a *different* appliance are ignored when
 * scoring a candidate prefix.
 */
const APPLIANCE_KEYWORD_GROUPS: string[][] = [
  ['washer', 'washing'],
  ['dryer'],
  ['dishwasher'],
  ['fridge', 'refrigerator', 'freezer'],
  ['oven', 'range', 'stove', 'cooktop'],
];

function applianceKeywordGroup(objectId: string): number {
  const tokens = objectId.split('_');
  for (let g = 0; g < APPLIANCE_KEYWORD_GROUPS.length; g++) {
    if (tokens.some(t => APPLIANCE_KEYWORD_GROUPS[g].includes(t))) return g;
  }
  return -1;
}

/**
 * Shared engine for the four free appliance modules (Washer, Dryer,
 * Dishwasher, Refrigerator). Each appliance is its own module type; this base
 * holds the editor, preview, graphics, and brand-agnostic entity discovery.
 *
 * Works with SmartThings, LG ThinQ, Miele, and any integration that exposes
 * similar entities (machine/run state, job/program phase, completion or
 * remaining time, feature switches, fridge temperatures + setpoints). Linked
 * entities are auto-discovered from the main entity's id prefix and can be
 * overridden individually.
 */
export abstract class UltraApplianceBaseModule extends BaseUltraModule {
  override handlesOwnDesignStyles = true;

  protected abstract readonly cardType: ApplianceCardType;
  abstract override metadata: ModuleMetadata;

  /** Optimistic setpoint values while HA confirms number.set_value */
  private _pendingSetpoints: Map<string, { value: number; ts: number }> = new Map();

  createDefault(id?: string, _hass?: HomeAssistant): ApplianceModuleConfig {
    return {
      id: id || this.generateId(this.cardType),
      type: this.cardType,
      entity: '',
      name: '',
      power_switch_entity: '',
      machine_state_entity: '',
      job_state_entity: '',
      completion_time_entity: '',
      power_entity: '',
      energy_entity: '',
      child_lock_entity: '',
      remote_control_entity: '',
      door_entity: '',
      fridge_door_entity: '',
      freezer_door_entity: '',
      fridge_temp_entity: '',
      freezer_temp_entity: '',
      fridge_setpoint_entity: '',
      freezer_setpoint_entity: '',
      filter_status_entity: '',
      oven_mode_entity: '',
      oven_temp_entity: '',
      oven_setpoint_entity: '',
      second_cavity_state_entity: '',
      second_cavity_temp_entity: '',
      second_cavity_setpoint_entity: '',
      second_cavity_mode_entity: '',
      light_entity: '',
      stop_button_entity: '',
      // Chip lists left undefined on purpose: undefined = auto-detect from
      // the device, an explicit array (set via the editor) = curated list.
      layout: 'standard',
      show_title: true,
      show_status: true,
      show_graphic: true,
      show_completion_time: true,
      show_controls: true,
      show_power_button: true,
      show_status_chips: true,
      show_feature_switches: true,
      show_settings: true,
      show_metrics: true,
      show_temperatures: true,
      show_setpoint_controls: true,
      show_cooktop: true,
      enable_animations: true,
      appliance_size: STANDARD_SIZE,
      active_color: '',
      done_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',
      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as ApplianceModuleConfig;
    if (!module.id) errors.push('Module ID is required');
    if (module.type !== this.cardType) errors.push(`Module type must be ${this.cardType}`);
    if (!m.entity?.trim()) errors.push('Select an appliance entity');
    return { valid: errors.length === 0, errors };
  }

  // ────────────────────────────────────────────────────────────────────────
  // Entity resolution + SmartThings-style auto-discovery
  // ────────────────────────────────────────────────────────────────────────

  private getRef(hass: HomeAssistant, entityId?: string, config?: UltraCardConfig): EntityRef | null {
    const resolved = this.resolveEntity(entityId, config) || entityId;
    if (!resolved || !hass?.states?.[resolved]) return null;
    const st = hass.states[resolved];
    return { id: resolved, state: String(st.state), attrs: (st.attributes || {}) as Record<string, any> };
  }

  /**
   * All entity ids registered to the same HA device as the main entity.
   * This is the primary discovery scope: it guarantees linked entities,
   * switches, and selects come from the same physical appliance and never
   * from other devices that happen to share an entity-id prefix (e.g.
   * `kitchen_refrigerator_*` vs `kitchen_dishwasher_*`).
   */
  private deviceEntities(hass: HomeAssistant, mainId: string): Set<string> | null {
    const h = hass as unknown as {
      entities?: Record<string, { device_id?: string }>;
    };
    const deviceId = h.entities?.[mainId]?.device_id;
    if (!deviceId || !h.entities) return null;
    const ids = Object.keys(h.entities).filter(
      id => h.entities![id]?.device_id === deviceId && !!hass.states[id]
    );
    return ids.length ? new Set(ids) : null;
  }

  /** Friendly device name from the registry, if available. */
  private deviceName(hass: HomeAssistant, mainId: string): string | undefined {
    const h = hass as unknown as {
      entities?: Record<string, { device_id?: string }>;
      devices?: Record<string, { name?: string; name_by_user?: string }>;
    };
    const deviceId = h.entities?.[mainId]?.device_id;
    const dev = deviceId ? h.devices?.[deviceId] : undefined;
    return dev?.name_by_user || dev?.name || undefined;
  }

  /**
   * Fallback device prefix when the entity registry is unavailable. Among
   * the token prefixes of the main object id, score each by how many
   * appliance-style sibling entities it covers, skipping siblings that
   * clearly belong to a different appliance (e.g. `kitchen_dishwasher_*`
   * when the main entity is `kitchen_refrigerator_power`). Longest prefix
   * wins ties, so an area prefix like `kitchen` doesn't swallow the device.
   */
  private devicePrefix(hass: HomeAssistant, mainId: string): string {
    const objectId = mainId.split('.')[1] || '';
    if (!objectId) return '';
    const tokens = objectId.split('_');
    const mainGroup = applianceKeywordGroup(objectId);
    const allObjectIds = Object.keys(hass.states).map(id => id.split('.')[1] || '');
    let best = objectId;
    let bestScore = -1;
    for (let len = tokens.length; len >= 1; len--) {
      const prefix = tokens.slice(0, len).join('_');
      let score = 0;
      for (const o of allObjectIds) {
        if (o === objectId) continue;
        if (o !== prefix && !o.startsWith(`${prefix}_`)) continue;
        const g = applianceKeywordGroup(o);
        if (g !== -1 && mainGroup !== -1 && g !== mainGroup) continue;
        if (LINK_SUFFIX_PATTERNS.some(re => re.test(o))) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = prefix;
      }
    }
    return best;
  }

  /**
   * Find the first entity in `domains` matching a pattern. Candidates come
   * from the device-registry pool when available, else from the prefix scope.
   */
  private autoFind(
    hass: HomeAssistant,
    pool: Set<string> | null,
    prefix: string,
    domains: string[],
    patterns: RegExp[]
  ): string | undefined {
    if (!pool && !prefix) return undefined;
    const candidates = (pool ? Array.from(pool) : Object.keys(hass.states))
      .filter(id => {
        const [domain, objectId] = id.split('.');
        if (!domains.includes(domain)) return false;
        if (pool) return true;
        return objectId === prefix || objectId?.startsWith(`${prefix}_`);
      })
      .sort();
    for (const re of patterns) {
      const hit = candidates.find(id => re.test(id.split('.')[1] || ''));
      if (hit) return hit;
    }
    return undefined;
  }

  /** Resolve a linked entity: explicit config wins, else auto-discover. */
  private link(
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    configured: string | undefined,
    pool: Set<string> | null,
    prefix: string,
    domains: string[],
    patterns: RegExp[]
  ): EntityRef | null {
    if (configured?.trim()) return this.getRef(hass, configured, config);
    const found = this.autoFind(hass, pool, prefix, domains, patterns);
    return found ? this.getRef(hass, found, config) : null;
  }

  /** All linked entities for the current appliance, auto-filled where blank. */
  private resolveLinks(
    m: ApplianceModuleConfig,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    main: EntityRef
  ) {
    const pool = this.deviceEntities(hass, main.id);
    const prefix = this.devicePrefix(hass, main.id);
    const deviceName = this.deviceName(hass, main.id);
    const L = (configured: string | undefined, domains: string[], patterns: RegExp[]) =>
      this.link(hass, config, configured, pool, prefix, domains, patterns);

    // Suffix patterns cover SmartThings (machine_state / job_state /
    // completion_time), LG ThinQ (run_state / remain_time), Miele
    // (status / program_phase / remaining_time), and generic integrations.
    const powerSwitch = L(m.power_switch_entity, ['switch'], [
      new RegExp(`^${prefix}(_\\d+)?$`),
      /(^|_)power(_switch)?(_\d+)?$/,
    ]);
    const machineState = L(m.machine_state_entity, ['sensor'], [
      /machine_state(_\d+)?$/,
      /run_state(_\d+)?$/,
      /operating_state(_\d+)?$/,
      new RegExp(`^${prefix}_status(_\\d+)?$`),
      new RegExp(`^${prefix}_state(_\\d+)?$`),
    ]);
    const jobState = L(m.job_state_entity, ['sensor'], [
      /job_state(_\d+)?$/,
      /program_phase(_\d+)?$/,
      /(^|_)phase(_\d+)?$/,
      /current_course(_\d+)?$/,
    ]);
    const completion = L(m.completion_time_entity, ['sensor'], [
      /completion_time(_\d+)?$/,
      /complete_time(_\d+)?$/,
      /(finish|end)_time(_\d+)?$/,
      /remain(ing)?_time(_\d+)?$/,
      /time_remaining(_\d+)?$/,
    ]);
    // Exact `<prefix>_power` first so e.g. `refrigerator_power_energy` can't win
    const power = L(m.power_entity, ['sensor'], [
      new RegExp(`^${prefix}_power(_\\d+)?$`),
      /(^|_)power(_\d+)?$/,
    ]);
    const energy = L(m.energy_entity, ['sensor'], [
      new RegExp(`^${prefix}_energy(_\\d+)?$`),
      /(^|_)energy(_\d+)?$/,
    ]);
    const childLock = L(m.child_lock_entity, ['binary_sensor'], [/child_lock(_\d+)?$/]);
    const remoteControl = L(m.remote_control_entity, ['binary_sensor'], [/remote_control(_\d+)?$/]);
    // Generic door only for non-fridge; the fridge has dedicated door sensors
    const door =
      this.cardType !== 'fridge'
        ? L(m.door_entity, ['binary_sensor'], [/(^|_)door(_state)?(_\d+)?$/])
        : null;
    const wrinklePrevent = L(undefined, ['binary_sensor'], [/wrinkle_prevent_active(_\d+)?$/]);

    // The run/pause/stop control select (often the main entity itself)
    const mainDomain = main.id.split('.')[0];
    let controlSelect: EntityRef | null = null;
    if (mainDomain === 'select' || mainDomain === 'input_select') {
      controlSelect = main;
    } else if (this.cardType !== 'fridge') {
      const found = this.autoFind(hass, pool, prefix, ['select'], [new RegExp(`^${prefix}(_\\d+)?$`)]);
      controlSelect = found ? this.getRef(hass, found, config) : null;
    }

    // Fridge-specific
    const fridgeDoor = L(m.fridge_door_entity, ['binary_sensor'], [/fridge_door(_\d+)?$/]);
    const freezerDoor = L(m.freezer_door_entity, ['binary_sensor'], [/freezer_door(_\d+)?$/]);
    const fridgeTemp = L(m.fridge_temp_entity, ['sensor'], [/fridge_temperature(_\d+)?$/]);
    const freezerTemp = L(m.freezer_temp_entity, ['sensor'], [/freezer_temperature(_\d+)?$/]);
    const fridgeSetpoint = L(m.fridge_setpoint_entity, ['number'], [/fridge_temperature(_\d+)?$/]);
    const freezerSetpoint = L(m.freezer_setpoint_entity, ['number'], [/freezer_temperature(_\d+)?$/]);
    const filterStatus = L(m.filter_status_entity, ['binary_sensor'], [/filter_status(_\d+)?$/]);
    const filterReset = L(undefined, ['button'], [/reset_water_filter(_\d+)?$/]);

    // Range/oven-specific
    const isRange = this.cardType === 'range';
    const ovenMode = isRange
      ? L(m.oven_mode_entity, ['sensor'], [/oven_mode(_\d+)?$/, /(^|_)mode(_\d+)?$/])
      : null;
    const ovenTemp = isRange
      ? L(m.oven_temp_entity, ['sensor'], [
          /temperature_measurement(_\d+)?$/,
          /oven_temperature(_\d+)?$/,
          /current_temperature(_\d+)?$/,
        ])
      : null;
    const ovenSetpoint = isRange
      ? L(m.oven_setpoint_entity, ['sensor', 'number'], [
          /oven_set_?point(_\d+)?$/,
          /set_?point(_\d+)?$/,
          /target_temperature(_\d+)?$/,
        ])
      : null;
    const cavityState = isRange
      ? L(m.second_cavity_state_entity, ['sensor'], [/second_cavity_machine_state(_\d+)?$/])
      : null;
    const cavityTemp = isRange
      ? L(m.second_cavity_temp_entity, ['sensor'], [/second_cavity_temperature(_\d+)?$/])
      : null;
    const cavitySetpoint = isRange
      ? L(m.second_cavity_setpoint_entity, ['sensor', 'number'], [/second_cavity_set_?point(_\d+)?$/])
      : null;
    const cavityMode = isRange
      ? L(m.second_cavity_mode_entity, ['sensor'], [/second_cavity_(oven_)?mode(_\d+)?$/])
      : null;
    const ovenLight = isRange
      ? L(m.light_entity, ['light'], [/(^|_)light(_\d+)?$/])
      : null;
    const stopButton = isRange
      ? L(m.stop_button_entity, ['button'], [/(^|_)stop(_\d+)?$/])
      : null;

    // Feature switches. Semantics: undefined = auto-detect the device's
    // switches (minus master power); an explicit array (even empty) means
    // the user curated the list in the editor.
    const autoScope = (domains: string[]) =>
      (pool ? Array.from(pool) : Object.keys(hass.states))
        .filter(id => {
          const [domain, objectId] = id.split('.');
          if (!domains.includes(domain)) return false;
          if (!pool && !objectId?.startsWith(`${prefix}_`)) return false;
          return !new RegExp(`^${prefix}(_\\d+)?$`).test(objectId || '');
        })
        .sort();

    let features: EntityRef[];
    if (Array.isArray(m.feature_switch_entities)) {
      features = m.feature_switch_entities
        .map(e => this.getRef(hass, e, config))
        .filter((r): r is EntityRef => !!r);
    } else {
      features = autoScope(['switch'])
        .filter(id => id !== powerSwitch?.id)
        .map(id => this.getRef(hass, id, config))
        .filter((r): r is EntityRef => !!r);
    }

    // Cooktop burner indicators: undefined = auto-detect, [] = none.
    let cooktop: EntityRef[];
    if (Array.isArray(m.cooktop_entities)) {
      cooktop = m.cooktop_entities
        .map(e => this.getRef(hass, e, config))
        .filter((r): r is EntityRef => !!r);
    } else if (isRange) {
      cooktop = autoScope(['binary_sensor', 'switch', 'sensor'])
        .filter(id => /(burner|cooktop|element|heater_zone)/.test(id.split('.')[1] || ''))
        .map(id => this.getRef(hass, id, config))
        .filter((r): r is EntityRef => !!r);
    } else {
      cooktop = [];
    }

    // Cycle-setting selects: same semantics. Never auto-detected for the
    // fridge — refrigerators have no cycle settings, so anything found would
    // be noise.
    let settingSelects: EntityRef[];
    if (Array.isArray(m.setting_select_entities)) {
      settingSelects = m.setting_select_entities
        .map(e => this.getRef(hass, e, config))
        .filter((r): r is EntityRef => !!r);
    } else if (this.cardType === 'fridge') {
      settingSelects = [];
    } else {
      settingSelects = autoScope(['select', 'input_select'])
        .filter(id => id !== controlSelect?.id)
        .map(id => this.getRef(hass, id, config))
        .filter((r): r is EntityRef => !!r);
    }

    return {
      pool,
      prefix,
      deviceName,
      powerSwitch,
      machineState,
      jobState,
      completion,
      power,
      energy,
      childLock,
      remoteControl,
      door,
      wrinklePrevent,
      controlSelect,
      fridgeDoor,
      freezerDoor,
      fridgeTemp,
      freezerTemp,
      fridgeSetpoint,
      freezerSetpoint,
      filterStatus,
      filterReset,
      ovenMode,
      ovenTemp,
      ovenSetpoint,
      cavityState,
      cavityTemp,
      cavitySetpoint,
      cavityMode,
      ovenLight,
      stopButton,
      cooktop,
      features,
      settingSelects,
    };
  }

  private featureLabel(ref: EntityRef, prefix: string, deviceName?: string): string {
    const objectId = ref.id.split('.')[1] || '';
    if (objectId.startsWith(`${prefix}_`)) {
      return formatLabel(objectId.slice(prefix.length + 1));
    }
    const friendly = String(ref.attrs.friendly_name || '');
    if (deviceName && friendly.toLowerCase().startsWith(deviceName.toLowerCase())) {
      const stripped = friendly.slice(deviceName.length).replace(/^[\s:–-]+/, '').trim();
      if (stripped) return stripped;
    }
    return friendly || formatLabel(objectId);
  }

  /**
   * Auto-detected feature switches / setting selects for the editor, so
   * automatically added chips are visible and removable.
   */
  private getAutoLists(
    m: ApplianceModuleConfig,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined
  ): { features: string[]; settings: string[]; cooktop: string[] } {
    const main = this.getRef(hass, m.entity, config);
    if (!main) return { features: [], settings: [], cooktop: [] };
    const links = this.resolveLinks(
      {
        ...m,
        feature_switch_entities: undefined,
        setting_select_entities: undefined,
        cooktop_entities: undefined,
      },
      hass,
      config,
      main
    );
    return {
      features: links.features.map(f => f.id),
      settings: links.settingSelects.map(s => s.id),
      cooktop: links.cooktop.map(c => c.id),
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // Editor
  // ────────────────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as ApplianceModuleConfig;
    const lang = hass?.locale?.language || 'en';
    const type = this.cardType;
    const isFridge = type === 'fridge';
    const isRange = type === 'range';
    const autoLists = this.getAutoLists(m, hass, config);

    const entityPicker = (
      field: keyof ApplianceModuleConfig,
      value: string | undefined,
      domains: string[],
      label: string
    ) => html`
      <div style="margin-bottom: 12px;">
        ${this.renderEntityPickerWithVariables(
          hass,
          config,
          field as string,
          value || '',
          (v: string) => {
            updateModule({ [field]: v } as Partial<CardModule>);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          },
          domains,
          label
        )}
      </div>
    `;

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.appliance.entity_section', lang, 'Main entity'),
          isFridge
            ? localize(
                'editor.appliance.entity_section_desc_fridge',
                lang,
                'Pick any entity of the refrigerator device (e.g. a temperature or door sensor). Related sensors and switches are found automatically — works with SmartThings, LG ThinQ, and similar integrations.'
              )
            : isRange
            ? localize(
                'editor.appliance.entity_section_desc_range',
                lang,
                'Pick the oven machine-state sensor (e.g. sensor.range_oven_machine_state) or any entity of the range. Oven temperature, modes, burners, and the light are found automatically.'
              )
            : localize(
                'editor.appliance.entity_section_desc',
                lang,
                'Pick the machine-state select or sensor (e.g. select.washer or a run-state sensor). Related sensors and switches are found automatically — works with SmartThings, LG ThinQ, and similar integrations.'
              ),
          []
        )}
        <div style="margin-bottom: 16px;">
          ${this.renderEntityPickerWithVariables(
            hass,
            config,
            'entity',
            m.entity || '',
            (value: string) => {
              updateModule({ entity: value });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            ['select', 'input_select', 'sensor', 'switch', 'binary_sensor', 'number'],
            localize('editor.appliance.entity', lang, 'Main entity')
          )}
        </div>
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.appliance.name', lang, 'Name'),
            description: localize('editor.appliance.name_desc', lang, 'Leave empty to use the entity name'),
            hass,
            data: { name: m.name || '' },
            schema: [this.textField('name')],
            onChange: (e: CustomEvent) => {
              updateModule({ name: e.detail.value?.name ?? '' });
              this.triggerPreviewUpdate();
            },
          },
        ])}

        ${this.renderSettingsSection(
          localize('editor.appliance.links_section', lang, 'Linked entities'),
          localize(
            'editor.appliance.links_section_desc',
            lang,
            'Everything below is auto-detected from the main entity. Only set a field when detection picks the wrong entity.'
          ),
          []
        )}
        ${this.renderConditionalFieldsGroup(
          localize('editor.appliance.links_group', lang, 'Optional overrides'),
          isFridge
            ? html`
                ${entityPicker('fridge_temp_entity', m.fridge_temp_entity, ['sensor'], localize('editor.appliance.fridge_temp', lang, 'Fridge temperature'))}
                ${entityPicker('freezer_temp_entity', m.freezer_temp_entity, ['sensor'], localize('editor.appliance.freezer_temp', lang, 'Freezer temperature'))}
                ${entityPicker('fridge_setpoint_entity', m.fridge_setpoint_entity, ['number'], localize('editor.appliance.fridge_setpoint', lang, 'Fridge setpoint'))}
                ${entityPicker('freezer_setpoint_entity', m.freezer_setpoint_entity, ['number'], localize('editor.appliance.freezer_setpoint', lang, 'Freezer setpoint'))}
                ${entityPicker('fridge_door_entity', m.fridge_door_entity, ['binary_sensor'], localize('editor.appliance.fridge_door', lang, 'Fridge door'))}
                ${entityPicker('freezer_door_entity', m.freezer_door_entity, ['binary_sensor'], localize('editor.appliance.freezer_door', lang, 'Freezer door'))}
                ${entityPicker('filter_status_entity', m.filter_status_entity, ['binary_sensor'], localize('editor.appliance.filter_status', lang, 'Water filter status'))}
                ${entityPicker('power_entity', m.power_entity, ['sensor'], localize('editor.appliance.power_sensor', lang, 'Power (W)'))}
                ${entityPicker('energy_entity', m.energy_entity, ['sensor'], localize('editor.appliance.energy_sensor', lang, 'Energy (kWh)'))}
              `
            : isRange
            ? html`
                ${entityPicker('machine_state_entity', m.machine_state_entity, ['sensor'], localize('editor.appliance.oven_state', lang, 'Oven machine state'))}
                ${entityPicker('job_state_entity', m.job_state_entity, ['sensor'], localize('editor.appliance.oven_job', lang, 'Oven job state'))}
                ${entityPicker('oven_mode_entity', m.oven_mode_entity, ['sensor'], localize('editor.appliance.oven_mode', lang, 'Oven mode (bake, roast…)'))}
                ${entityPicker('completion_time_entity', m.completion_time_entity, ['sensor'], localize('editor.appliance.completion_time', lang, 'Completion time sensor'))}
                ${entityPicker('oven_temp_entity', m.oven_temp_entity, ['sensor'], localize('editor.appliance.oven_temp', lang, 'Oven temperature'))}
                ${entityPicker('oven_setpoint_entity', m.oven_setpoint_entity, ['sensor', 'number'], localize('editor.appliance.oven_setpoint', lang, 'Oven set point'))}
                ${entityPicker('second_cavity_state_entity', m.second_cavity_state_entity, ['sensor'], localize('editor.appliance.cavity_state', lang, 'Second oven state'))}
                ${entityPicker('second_cavity_temp_entity', m.second_cavity_temp_entity, ['sensor'], localize('editor.appliance.cavity_temp', lang, 'Second oven temperature'))}
                ${entityPicker('second_cavity_setpoint_entity', m.second_cavity_setpoint_entity, ['sensor', 'number'], localize('editor.appliance.cavity_setpoint', lang, 'Second oven set point'))}
                ${entityPicker('second_cavity_mode_entity', m.second_cavity_mode_entity, ['sensor'], localize('editor.appliance.cavity_mode', lang, 'Second oven mode'))}
                ${entityPicker('light_entity', m.light_entity, ['light'], localize('editor.appliance.oven_light_entity', lang, 'Oven light'))}
                ${entityPicker('stop_button_entity', m.stop_button_entity, ['button'], localize('editor.appliance.stop_button', lang, 'Stop button'))}
                ${entityPicker('door_entity', m.door_entity, ['binary_sensor'], localize('editor.appliance.door', lang, 'Door sensor'))}
                ${entityPicker('child_lock_entity', m.child_lock_entity, ['binary_sensor'], localize('editor.appliance.child_lock', lang, 'Child lock'))}
                ${entityPicker('remote_control_entity', m.remote_control_entity, ['binary_sensor'], localize('editor.appliance.remote_control', lang, 'Remote control'))}
                ${entityPicker('power_entity', m.power_entity, ['sensor'], localize('editor.appliance.power_sensor', lang, 'Power (W)'))}
                ${entityPicker('energy_entity', m.energy_entity, ['sensor'], localize('editor.appliance.energy_sensor', lang, 'Energy (kWh)'))}
              `
            : html`
                ${entityPicker('power_switch_entity', m.power_switch_entity, ['switch'], localize('editor.appliance.power_switch', lang, 'Power switch'))}
                ${entityPicker('machine_state_entity', m.machine_state_entity, ['sensor'], localize('editor.appliance.machine_state', lang, 'Machine state sensor'))}
                ${entityPicker('job_state_entity', m.job_state_entity, ['sensor'], localize('editor.appliance.job_state', lang, 'Job state sensor'))}
                ${entityPicker('completion_time_entity', m.completion_time_entity, ['sensor'], localize('editor.appliance.completion_time', lang, 'Completion time sensor'))}
                ${entityPicker('child_lock_entity', m.child_lock_entity, ['binary_sensor'], localize('editor.appliance.child_lock', lang, 'Child lock'))}
                ${entityPicker('remote_control_entity', m.remote_control_entity, ['binary_sensor'], localize('editor.appliance.remote_control', lang, 'Remote control'))}
                ${type === 'dishwasher'
                  ? entityPicker('door_entity', m.door_entity, ['binary_sensor'], localize('editor.appliance.door', lang, 'Door sensor'))
                  : nothing}
                ${entityPicker('power_entity', m.power_entity, ['sensor'], localize('editor.appliance.power_sensor', lang, 'Power (W)'))}
                ${entityPicker('energy_entity', m.energy_entity, ['sensor'], localize('editor.appliance.energy_sensor', lang, 'Energy (kWh)'))}
              `
        )}

        ${this.renderChipListField(
          localize('editor.appliance.features', lang, 'Feature switches'),
          localize(
            'editor.appliance.features_desc',
            lang,
            'Toggle chips shown on the card (sanitize, storm wash, power cool, ice maker, wrinkle prevent…). Auto-detected switches appear below — remove any you don\u2019t want, or add your own.'
          ),
          hass,
          Array.isArray(m.feature_switch_entities)
            ? m.feature_switch_entities
            : autoLists.features,
          (next: string[]) => {
            updateModule({ feature_switch_entities: next });
            this.triggerPreviewUpdate();
          },
          {
            mode: 'entity',
            entityDomains: ['switch'],
            placeholder: localize('editor.appliance.features_placeholder', lang, 'Add a switch…'),
          }
        )}

        ${!isFridge
          ? this.renderChipListField(
              localize('editor.appliance.settings', lang, 'Cycle setting dropdowns'),
              localize(
                'editor.appliance.settings_desc',
                lang,
                'Select entities shown as dropdowns (water temperature, spin level, soil level, wash zone…). Auto-detected selects appear below — remove any you don\u2019t want, or add your own.'
              ),
              hass,
              Array.isArray(m.setting_select_entities)
                ? m.setting_select_entities
                : autoLists.settings,
              (next: string[]) => {
                updateModule({ setting_select_entities: next });
                this.triggerPreviewUpdate();
              },
              {
                mode: 'entity',
                entityDomains: ['select', 'input_select'],
                placeholder: localize('editor.appliance.settings_placeholder', lang, 'Add a select…'),
              }
            )
          : nothing}

        ${isRange
          ? this.renderChipListField(
              localize('editor.appliance.cooktop', lang, 'Cooktop burners'),
              localize(
                'editor.appliance.cooktop_desc',
                lang,
                'Entities that report each burner\u2019s state (on/off, heating, or a power number). They light the burners on the graphic and show a \u201cburners on\u201d chip. Auto-detected entities appear below.'
              ),
              hass,
              Array.isArray(m.cooktop_entities) ? m.cooktop_entities : autoLists.cooktop,
              (next: string[]) => {
                updateModule({ cooktop_entities: next });
                this.triggerPreviewUpdate();
              },
              {
                mode: 'entity',
                entityDomains: ['binary_sensor', 'switch', 'sensor'],
                placeholder: localize('editor.appliance.cooktop_placeholder', lang, 'Add a burner entity…'),
              }
            )
          : nothing}

        ${this.renderSettingsSection(
          localize('editor.appliance.display_section', lang, 'Display'),
          localize('editor.appliance.display_section_desc', lang, 'Choose what to show on the card.'),
          [
            {
              title: localize('editor.appliance.show_title', lang, 'Show title'),
              description: '',
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value?.show_title ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.appliance.show_status', lang, 'Show status'),
              description: localize('editor.appliance.show_status_desc', lang, 'Cycle phase and job state'),
              hass,
              data: { show_status: m.show_status !== false },
              schema: [this.booleanField('show_status')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_status: e.detail.value?.show_status ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.appliance.show_graphic', lang, 'Show appliance graphic'),
              description: '',
              hass,
              data: { show_graphic: m.show_graphic !== false },
              schema: [this.booleanField('show_graphic')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_graphic: e.detail.value?.show_graphic ?? true });
                this.triggerPreviewUpdate();
              },
            },
            ...(isFridge
              ? [
                  {
                    title: localize('editor.appliance.show_temps', lang, 'Show temperatures'),
                    description: localize('editor.appliance.show_temps_desc', lang, 'Fridge and freezer temperature tiles'),
                    hass,
                    data: { show_temperatures: m.show_temperatures !== false },
                    schema: [this.booleanField('show_temperatures')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_temperatures: e.detail.value?.show_temperatures ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                  {
                    title: localize('editor.appliance.show_setpoints', lang, 'Show setpoint controls'),
                    description: localize('editor.appliance.show_setpoints_desc', lang, '\u2212 / + buttons to adjust target temperatures'),
                    hass,
                    data: { show_setpoint_controls: m.show_setpoint_controls !== false },
                    schema: [this.booleanField('show_setpoint_controls')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_setpoint_controls: e.detail.value?.show_setpoint_controls ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : isRange
              ? [
                  {
                    title: localize('editor.appliance.show_completion', lang, 'Show time remaining'),
                    description: localize('editor.appliance.show_completion_desc_range', lang, 'Countdown and finish time while the oven runs'),
                    hass,
                    data: { show_completion_time: m.show_completion_time !== false },
                    schema: [this.booleanField('show_completion_time')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_completion_time: e.detail.value?.show_completion_time ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                  {
                    title: localize('editor.appliance.show_temps_range', lang, 'Show oven temperature'),
                    description: localize('editor.appliance.show_temps_range_desc', lang, 'Current temperature and set point tiles'),
                    hass,
                    data: { show_temperatures: m.show_temperatures !== false },
                    schema: [this.booleanField('show_temperatures')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_temperatures: e.detail.value?.show_temperatures ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                  {
                    title: localize('editor.appliance.show_cooktop', lang, 'Show cooktop burners'),
                    description: localize('editor.appliance.show_cooktop_desc', lang, 'Burner indicators on the graphic and a \u201cburners on\u201d chip'),
                    hass,
                    data: { show_cooktop: m.show_cooktop !== false },
                    schema: [this.booleanField('show_cooktop')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_cooktop: e.detail.value?.show_cooktop ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                  {
                    title: localize('editor.appliance.show_controls', lang, 'Show controls'),
                    description: localize('editor.appliance.show_controls_desc_range', lang, 'Oven light and Stop buttons'),
                    hass,
                    data: { show_controls: m.show_controls !== false },
                    schema: [this.booleanField('show_controls')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_controls: e.detail.value?.show_controls ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : [
                  {
                    title: localize('editor.appliance.show_completion', lang, 'Show time remaining'),
                    description: localize('editor.appliance.show_completion_desc', lang, 'Countdown and finish time while a cycle runs'),
                    hass,
                    data: { show_completion_time: m.show_completion_time !== false },
                    schema: [this.booleanField('show_completion_time')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_completion_time: e.detail.value?.show_completion_time ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                  {
                    title: localize('editor.appliance.show_controls', lang, 'Show cycle controls'),
                    description: localize('editor.appliance.show_controls_desc', lang, 'Start / Pause / Stop buttons'),
                    hass,
                    data: { show_controls: m.show_controls !== false },
                    schema: [this.booleanField('show_controls')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_controls: e.detail.value?.show_controls ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                  {
                    title: localize('editor.appliance.show_power_button', lang, 'Show power button'),
                    description: '',
                    hass,
                    data: { show_power_button: m.show_power_button !== false },
                    schema: [this.booleanField('show_power_button')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_power_button: e.detail.value?.show_power_button ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                ]),
            {
              title: localize('editor.appliance.show_chips', lang, 'Show status chips'),
              description: localize('editor.appliance.show_chips_desc', lang, 'Child lock, remote control, door open, filter alerts'),
              hass,
              data: { show_status_chips: m.show_status_chips !== false },
              schema: [this.booleanField('show_status_chips')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_status_chips: e.detail.value?.show_status_chips ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.appliance.show_features', lang, 'Show feature switches'),
              description: '',
              hass,
              data: { show_feature_switches: m.show_feature_switches !== false },
              schema: [this.booleanField('show_feature_switches')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_feature_switches: e.detail.value?.show_feature_switches ?? true });
                this.triggerPreviewUpdate();
              },
            },
            ...(!isFridge
              ? [
                  {
                    title: localize('editor.appliance.show_settings', lang, 'Show cycle settings'),
                    description: localize('editor.appliance.show_settings_desc', lang, 'Dropdowns for water temperature, spin level, and similar options'),
                    hass,
                    data: { show_settings: m.show_settings !== false },
                    schema: [this.booleanField('show_settings')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_settings: e.detail.value?.show_settings ?? true });
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : []),
            {
              title: localize('editor.appliance.show_metrics', lang, 'Show power & energy'),
              description: localize('editor.appliance.show_metrics_desc', lang, 'Live wattage and energy usage tiles'),
              hass,
              data: { show_metrics: m.show_metrics !== false },
              schema: [this.booleanField('show_metrics')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_metrics: e.detail.value?.show_metrics ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.appliance.enable_animations', lang, 'Enable animations'),
              description: localize('editor.appliance.enable_animations_desc', lang, 'Drum spin, bubbles, steam, and glow effects while running'),
              hass,
              data: { enable_animations: m.enable_animations !== false },
              schema: [this.booleanField('enable_animations')],
              onChange: (e: CustomEvent) => {
                updateModule({ enable_animations: e.detail.value?.enable_animations ?? true });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.appliance.layout_section', lang, 'Layout'),
          localize('editor.appliance.layout_section_desc', lang, 'How the card is arranged.'),
          [
            {
              title: localize('editor.appliance.layout', lang, 'Layout'),
              description: localize('editor.appliance.layout_desc', lang, 'Hero, standard, or compact'),
              hass,
              data: { layout: m.layout || 'standard' },
              schema: [
                this.selectField('layout', [
                  { value: 'hero', label: localize('editor.appliance.layout_hero', lang, 'Hero') },
                  { value: 'standard', label: localize('editor.appliance.layout_standard', lang, 'Standard') },
                  { value: 'compact', label: localize('editor.appliance.layout_compact', lang, 'Compact') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ layout: e.detail.value?.layout || 'standard' });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        ${this.renderSliderField(
          localize('editor.appliance.size', lang, 'Graphic size'),
          localize('editor.appliance.size_desc', lang, 'Size of the appliance illustration'),
          m.appliance_size ?? STANDARD_SIZE,
          STANDARD_SIZE,
          64,
          220,
          4,
          (value: number) => {
            updateModule({ appliance_size: value });
            this.triggerPreviewUpdate();
          },
          'px'
        )}

        ${this.renderColorField(
          localize('editor.appliance.active_color', lang, 'Running color'),
          localize('editor.appliance.active_color_desc', lang, 'Accent while a cycle is running'),
          hass,
          m.active_color || '',
          'var(--primary-color)',
          (value: string) => {
            updateModule({ active_color: value });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.appliance.done_color', lang, 'Done color'),
          '',
          hass,
          m.done_color || '',
          '#4CAF50',
          (value: string) => {
            updateModule({ done_color: value });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.appliance.text_color', lang, 'Text color'),
          '',
          hass,
          m.text_color || '',
          'var(--primary-text-color)',
          (value: string) => {
            updateModule({ text_color: value });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.appliance.card_bg', lang, 'Card background'),
          '',
          hass,
          m.card_background_color || '',
          'var(--card-background-color)',
          (value: string) => {
            updateModule({ card_background_color: value });
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Appliance graphics
  // ────────────────────────────────────────────────────────────────────────

  private drumSvg(gid: string, spin: boolean, paused: boolean, accent: string, bubbles: boolean, heat: boolean) {
    return svg`
      <g clip-path="url(#${gid}-clip)">
        <g class="uc-appl-drum ${spin ? 'uc-appl-drum--spin' : ''} ${paused ? 'uc-appl-drum--paused' : ''}" style="transform-origin: 50px 64px;">
          <circle cx="50" cy="64" r="23" fill="color-mix(in srgb, var(--primary-text-color) 6%, #191919)" />
          ${[30, 150, 270].map(
            a => svg`
              <line
                x1="50" y1="64"
                x2="${50 + Math.cos((a * Math.PI) / 180) * 21}"
                y2="${64 + Math.sin((a * Math.PI) / 180) * 21}"
                stroke="var(--divider-color, #4a4a4a)" stroke-width="3.4" stroke-linecap="round" opacity="0.9"
              />`
          )}
          ${[0, 60, 120, 180, 240, 300].map(
            a => svg`
              <circle
                cx="${50 + Math.cos((a * Math.PI) / 180) * 16.5}"
                cy="${64 + Math.sin((a * Math.PI) / 180) * 16.5}"
                r="1.6" fill="var(--divider-color, #555)" opacity="0.8"
              />`
          )}
          <circle cx="50" cy="64" r="4.6" fill="var(--divider-color, #4a4a4a)" />
          <circle cx="50" cy="64" r="1.9" fill="${accent}" opacity="0.95" />
        </g>
        ${bubbles && (spin || paused)
          ? svg`
              <g class="${spin ? 'uc-appl-fx--on' : ''}">
                <path d="M 30 80 Q 50 88 70 80" fill="none" stroke="${accent}" stroke-width="1.4" opacity="0.4" />
                <circle class="uc-appl-bubble uc-appl-bubble--a" cx="39" cy="78" r="2" fill="${accent}" opacity="0.5" />
                <circle class="uc-appl-bubble uc-appl-bubble--b" cx="57" cy="75" r="1.4" fill="${accent}" opacity="0.45" />
                <circle class="uc-appl-bubble uc-appl-bubble--c" cx="48" cy="81" r="1.2" fill="${accent}" opacity="0.4" />
              </g>`
          : nothing}
        ${heat && (spin || paused)
          ? svg`
              <g class="${spin ? 'uc-appl-fx--on' : ''}" opacity="0.75">
                <path class="uc-appl-heat" d="M 38 74 Q 42 64 38 54" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" />
                <path class="uc-appl-heat uc-appl-heat--b" d="M 50 76 Q 54 64 50 52" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" />
                <path class="uc-appl-heat uc-appl-heat--c" d="M 62 74 Q 66 64 62 54" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" />
              </g>`
          : nothing}
      </g>
    `;
  }

  private laundrySvg(
    uid: string,
    size: number,
    kind: 'washer' | 'dryer',
    phase: AppliancePhase,
    accent: string,
    animate: boolean
  ): TemplateResult {
    const spin = animate && phase === 'running';
    const paused = phase === 'paused';
    const gid = `uc-appl-${uid}`;
    const ledColor = phase === 'idle' || phase === 'off' || phase === 'unavailable' ? 'var(--divider-color, #666)' : accent;

    return html`
      <svg class="uc-appl-svg" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">
        <defs>
          <linearGradient id="${gid}-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="color-mix(in srgb, var(--primary-text-color) 7%, var(--card-background-color, #2e2e2e))" />
            <stop offset="100%" stop-color="var(--secondary-background-color, #232323)" />
          </linearGradient>
          <clipPath id="${gid}-clip"><circle cx="50" cy="64" r="23" /></clipPath>
          <filter id="${gid}-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-opacity="0.3" />
          </filter>
        </defs>

        <rect x="11" y="6" width="78" height="104" rx="9" fill="url(#${gid}-body)" stroke="color-mix(in srgb, var(--divider-color) 80%, transparent)" stroke-width="1.4" filter="url(#${gid}-shadow)" />

        <!-- Control panel -->
        <rect x="16" y="12" width="68" height="13" rx="3.5" fill="color-mix(in srgb, var(--primary-text-color) 4%, #1d1d1d)" stroke="color-mix(in srgb, var(--divider-color) 60%, transparent)" stroke-width="0.8" />
        ${kind === 'washer'
          ? svg`
              <rect x="21" y="15.5" width="20" height="6" rx="1.6" fill="#101418" />
              <rect x="23" y="17" width="9" height="3" rx="0.8" fill="${ledColor}" opacity="0.85" class="${spin ? 'uc-appl-led' : ''}" />
              <circle cx="72" cy="18.5" r="4.4" fill="#161a1e" stroke="color-mix(in srgb, var(--divider-color) 85%, transparent)" stroke-width="1" />
              <line x1="72" y1="18.5" x2="72" y2="15.2" stroke="${accent}" stroke-width="1.3" stroke-linecap="round" />`
          : svg`
              <circle cx="27" cy="18.5" r="4.4" fill="#161a1e" stroke="color-mix(in srgb, var(--divider-color) 85%, transparent)" stroke-width="1" />
              <line x1="27" y1="18.5" x2="29.6" y2="16" stroke="${accent}" stroke-width="1.3" stroke-linecap="round" />
              <rect x="58" y="15.5" width="20" height="6" rx="1.6" fill="#101418" />
              <rect x="60" y="17" width="9" height="3" rx="0.8" fill="${ledColor}" opacity="0.85" class="${spin ? 'uc-appl-led' : ''}" />`}
        <circle cx="50" cy="18.5" r="1.5" fill="${ledColor}" class="${spin ? 'uc-appl-led' : ''}" />

        <!-- Door -->
        <circle cx="50" cy="64" r="29" fill="color-mix(in srgb, var(--primary-text-color) 5%, #262626)" stroke="color-mix(in srgb, var(--divider-color) 90%, transparent)" stroke-width="1.6" />
        <circle cx="50" cy="64" r="25.5" fill="none" stroke="${accent}" stroke-width="1.6" opacity="${phase === 'running' || phase === 'done' ? 0.9 : 0.35}" class="${spin ? 'uc-appl-ring' : ''}" />

        ${this.drumSvg(gid, spin, paused, accent, kind === 'washer', kind === 'dryer')}

        <!-- Glass reflection -->
        <path d="M 33 50 Q 50 40 67 50" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2.4" stroke-linecap="round" />

        ${kind === 'dryer'
          ? svg`<g opacity="0.7">${[0, 1, 2, 3, 4].map(i => svg`<line x1="${30 + i * 10}" y1="101" x2="${34 + i * 10}" y2="101" stroke="var(--divider-color, #555)" stroke-width="1.6" stroke-linecap="round" />`)}</g>`
          : svg`<rect x="20" y="99" width="16" height="5" rx="1.4" fill="color-mix(in srgb, var(--primary-text-color) 4%, #1d1d1d)" stroke="color-mix(in srgb, var(--divider-color) 55%, transparent)" stroke-width="0.7" />`}

        <rect x="18" y="110" width="12" height="4" rx="1.4" fill="var(--divider-color, #4a4a4a)" />
        <rect x="70" y="110" width="12" height="4" rx="1.4" fill="var(--divider-color, #4a4a4a)" />

        ${phase === 'done'
          ? svg`
              <g>
                <circle cx="80" cy="32" r="8.5" fill="${accent}" />
                <path d="M 76 32 L 79 35 L 85 28" fill="none" stroke="var(--text-primary-color, #fff)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </g>`
          : nothing}
      </svg>
    `;
  }

  private dishwasherSvg(
    uid: string,
    size: number,
    phase: AppliancePhase,
    accent: string,
    animate: boolean,
    doorOpen: boolean
  ): TemplateResult {
    const spin = animate && phase === 'running';
    const gid = `uc-appl-${uid}`;
    const ledColor = phase === 'idle' || phase === 'off' || phase === 'unavailable' ? 'var(--divider-color, #666)' : accent;

    return html`
      <svg class="uc-appl-svg" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">
        <defs>
          <linearGradient id="${gid}-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="color-mix(in srgb, var(--primary-text-color) 7%, var(--card-background-color, #2e2e2e))" />
            <stop offset="100%" stop-color="var(--secondary-background-color, #232323)" />
          </linearGradient>
          <filter id="${gid}-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-opacity="0.3" />
          </filter>
        </defs>

        <rect x="11" y="8" width="78" height="102" rx="7" fill="url(#${gid}-body)" stroke="${doorOpen ? 'var(--warning-color, #FF9800)' : 'color-mix(in srgb, var(--divider-color) 80%, transparent)'}" stroke-width="${doorOpen ? 2 : 1.4}" filter="url(#${gid}-shadow)" />

        <!-- Control strip -->
        <rect x="11" y="8" width="78" height="14" rx="7" fill="color-mix(in srgb, var(--primary-text-color) 4%, #1d1d1d)" />
        <rect x="11" y="15" width="78" height="7" fill="color-mix(in srgb, var(--primary-text-color) 4%, #1d1d1d)" />
        ${[0, 1, 2, 3].map(
          i => svg`<circle cx="${24 + i * 9}" cy="15" r="1.7" fill="${i === 0 ? ledColor : 'var(--divider-color, #555)'}" class="${i === 0 && spin ? 'uc-appl-led' : ''}" />`
        )}
        <rect x="62" y="12" width="18" height="6" rx="1.6" fill="#101418" />
        <rect x="64" y="13.5" width="8" height="3" rx="0.8" fill="${ledColor}" opacity="0.85" class="${spin ? 'uc-appl-led' : ''}" />

        <!-- Handle -->
        <rect x="16" y="27" width="68" height="4.6" rx="2.3" fill="color-mix(in srgb, var(--primary-text-color) 16%, #3a3a3a)" />

        <!-- Panel sheen -->
        <line x1="18" y1="42" x2="82" y2="42" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        <line x1="18" y1="52" x2="82" y2="52" stroke="rgba(255,255,255,0.035)" stroke-width="1" />

        <!-- Spray motif while running -->
        <g class="uc-appl-spray ${spin ? 'uc-appl-spray--spin' : ''}" style="transform-origin: 50px 70px;" opacity="${phase === 'running' || phase === 'paused' ? 0.9 : 0.22}">
          <circle cx="50" cy="70" r="15" fill="none" stroke="${accent}" stroke-width="1.1" opacity="0.4" />
          ${[0, 120, 240].map(
            a => svg`
              <path
                d="M 50 70 L ${50 + Math.cos(((a - 12) * Math.PI) / 180) * 13} ${70 + Math.sin(((a - 12) * Math.PI) / 180) * 13} A 13 13 0 0 1 ${50 + Math.cos(((a + 12) * Math.PI) / 180) * 13} ${70 + Math.sin(((a + 12) * Math.PI) / 180) * 13} Z"
                fill="${accent}" opacity="0.6"
              />`
          )}
          <circle cx="50" cy="70" r="3" fill="${accent}" />
        </g>

        ${spin
          ? svg`
              <g class="uc-appl-fx--on" opacity="0.65">
                <path class="uc-appl-steam" d="M 30 6 Q 32 2 30 -2" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" />
                <path class="uc-appl-steam uc-appl-steam--b" d="M 50 6 Q 52 1 50 -3" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" />
                <path class="uc-appl-steam uc-appl-steam--c" d="M 70 6 Q 72 2 70 -2" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" />
              </g>`
          : nothing}

        <!-- Kick panel -->
        <rect x="16" y="100" width="68" height="6" rx="2" fill="color-mix(in srgb, var(--primary-text-color) 4%, #1d1d1d)" />
        ${[0, 1, 2, 3, 4, 5].map(i => svg`<line x1="${22 + i * 10}" y1="103" x2="${26 + i * 10}" y2="103" stroke="var(--divider-color, #555)" stroke-width="1.2" stroke-linecap="round" />`)}

        ${phase === 'done'
          ? svg`
              <g>
                <circle cx="80" cy="36" r="8.5" fill="${accent}" />
                <path d="M 76 36 L 79 39 L 85 32" fill="none" stroke="var(--text-primary-color, #fff)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </g>`
          : nothing}
      </svg>
    `;
  }

  private fridgeSvg(
    uid: string,
    size: number,
    accent: string,
    fridgeDoorOpen: boolean,
    freezerDoorOpen: boolean,
    alert: boolean
  ): TemplateResult {
    const gid = `uc-appl-${uid}`;
    const warn = 'var(--warning-color, #FF9800)';

    return html`
      <svg class="uc-appl-svg" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">
        <defs>
          <linearGradient id="${gid}-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="color-mix(in srgb, var(--primary-text-color) 8%, var(--card-background-color, #2e2e2e))" />
            <stop offset="100%" stop-color="var(--secondary-background-color, #222)" />
          </linearGradient>
          <filter id="${gid}-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-opacity="0.3" />
          </filter>
        </defs>

        <rect x="14" y="5" width="72" height="108" rx="8" fill="url(#${gid}-body)" stroke="color-mix(in srgb, var(--divider-color) 80%, transparent)" stroke-width="1.4" filter="url(#${gid}-shadow)" />

        <!-- French doors -->
        <rect x="17" y="8" width="31.5" height="64" rx="4.5" fill="color-mix(in srgb, var(--primary-text-color) 3%, transparent)" stroke="${fridgeDoorOpen ? warn : 'color-mix(in srgb, var(--divider-color) 70%, transparent)'}" stroke-width="${fridgeDoorOpen ? 2 : 1}" class="${fridgeDoorOpen ? 'uc-appl-door-open' : ''}" />
        <rect x="51.5" y="8" width="31.5" height="64" rx="4.5" fill="color-mix(in srgb, var(--primary-text-color) 3%, transparent)" stroke="${fridgeDoorOpen ? warn : 'color-mix(in srgb, var(--divider-color) 70%, transparent)'}" stroke-width="${fridgeDoorOpen ? 2 : 1}" class="${fridgeDoorOpen ? 'uc-appl-door-open' : ''}" />

        <!-- Handles -->
        <rect x="45" y="18" width="2.6" height="30" rx="1.3" fill="color-mix(in srgb, var(--primary-text-color) 20%, #3a3a3a)" />
        <rect x="52.4" y="18" width="2.6" height="30" rx="1.3" fill="color-mix(in srgb, var(--primary-text-color) 20%, #3a3a3a)" />

        <!-- Dispenser -->
        <rect x="23" y="24" width="14" height="20" rx="2.5" fill="#14181c" stroke="color-mix(in srgb, var(--divider-color) 60%, transparent)" stroke-width="0.8" />
        <rect x="26" y="27" width="8" height="3" rx="1" fill="${accent}" opacity="0.65" />
        <rect x="27.5" y="33" width="5" height="8" rx="1" fill="color-mix(in srgb, var(--primary-text-color) 10%, #26292c)" />

        <!-- Freezer drawer -->
        <rect x="17" y="76" width="66" height="33" rx="4.5" fill="color-mix(in srgb, var(--primary-text-color) 3%, transparent)" stroke="${freezerDoorOpen ? warn : 'color-mix(in srgb, var(--divider-color) 70%, transparent)'}" stroke-width="${freezerDoorOpen ? 2 : 1}" class="${freezerDoorOpen ? 'uc-appl-door-open' : ''}" />
        <rect x="30" y="82" width="40" height="3" rx="1.5" fill="color-mix(in srgb, var(--primary-text-color) 20%, #3a3a3a)" />

        <!-- Snowflake on freezer -->
        <g stroke="${accent}" stroke-width="1.4" stroke-linecap="round" opacity="0.8">
          <line x1="50" y1="92" x2="50" y2="102" />
          <line x1="45.7" y1="94.5" x2="54.3" y2="99.5" />
          <line x1="45.7" y1="99.5" x2="54.3" y2="94.5" />
        </g>

        ${alert
          ? svg`
              <g>
                <circle cx="80" cy="14" r="8" fill="${warn}" />
                <line x1="80" y1="10" x2="80" y2="15.5" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" />
                <circle cx="80" cy="18.4" r="1.2" fill="#1a1a1a" />
              </g>`
          : nothing}
      </svg>
    `;
  }

  private rangeSvg(
    uid: string,
    size: number,
    phase: AppliancePhase,
    accent: string,
    animate: boolean,
    burners: boolean[],
    lightOn: boolean,
    doorOpen: boolean
  ): TemplateResult {
    const gid = `uc-appl-${uid}`;
    const ovenOn = phase === 'running' || phase === 'paused';
    const hot = 'var(--uc-appl-burner, #ff6b35)';
    const warn = 'var(--warning-color, #FF9800)';
    // Four burners across the glass cooktop; light each one whose indicator is on
    const burnerSpots: Array<{ cx: number; r: number }> = [
      { cx: 26, r: 5.2 },
      { cx: 42.5, r: 4.2 },
      { cx: 58.5, r: 5.6 },
      { cx: 75, r: 4.4 },
    ];

    return html`
      <svg class="uc-appl-svg" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">
        <defs>
          <linearGradient id="${gid}-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="color-mix(in srgb, var(--primary-text-color) 7%, var(--card-background-color, #2e2e2e))" />
            <stop offset="100%" stop-color="var(--secondary-background-color, #232323)" />
          </linearGradient>
          <radialGradient id="${gid}-glow" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stop-color="#ffb45e" stop-opacity="${ovenOn ? 0.55 : lightOn ? 0.4 : 0}" />
            <stop offset="70%" stop-color="#ff8a3d" stop-opacity="${ovenOn ? 0.22 : lightOn ? 0.14 : 0}" />
            <stop offset="100%" stop-color="#ff8a3d" stop-opacity="0" />
          </radialGradient>
          <filter id="${gid}-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-opacity="0.3" />
          </filter>
        </defs>

        <rect x="11" y="8" width="78" height="104" rx="6" fill="url(#${gid}-body)" stroke="color-mix(in srgb, var(--divider-color) 80%, transparent)" stroke-width="1.4" filter="url(#${gid}-shadow)" />

        <!-- Glass cooktop -->
        <rect x="14" y="11" width="72" height="19" rx="4" fill="#14171b" stroke="color-mix(in srgb, var(--divider-color) 60%, transparent)" stroke-width="0.9" />
        ${burnerSpots.map((b, i) => {
          const on = !!burners[i];
          return svg`
            <g class="${on && animate ? 'uc-appl-burner--on' : ''}">
              ${on ? svg`<circle cx="${b.cx}" cy="20.5" r="${b.r + 2.5}" fill="${hot}" opacity="0.18" />` : nothing}
              <circle cx="${b.cx}" cy="20.5" r="${b.r}" fill="none"
                stroke="${on ? hot : 'color-mix(in srgb, var(--divider-color) 85%, transparent)'}"
                stroke-width="${on ? 1.8 : 1.2}" opacity="${on ? 0.95 : 0.8}" />
              <circle cx="${b.cx}" cy="20.5" r="${Math.max(b.r - 2.6, 1.4)}" fill="none"
                stroke="${on ? hot : 'color-mix(in srgb, var(--divider-color) 60%, transparent)'}"
                stroke-width="1" opacity="${on ? 0.8 : 0.55}" />
            </g>`;
        })}

        <!-- Control strip: knobs + display -->
        <rect x="14" y="33" width="72" height="10" rx="2.5" fill="color-mix(in srgb, var(--primary-text-color) 4%, #1d1d1d)" />
        ${[22, 32, 42, 52].map(
          x => svg`
            <circle cx="${x}" cy="38" r="2.6" fill="#161a1e" stroke="color-mix(in srgb, var(--divider-color) 85%, transparent)" stroke-width="0.8" />
            <line x1="${x}" y1="38" x2="${x}" y2="35.9" stroke="var(--divider-color, #666)" stroke-width="0.9" stroke-linecap="round" />`
        )}
        <rect x="62" y="35" width="20" height="6" rx="1.6" fill="#101418" />
        <rect x="64" y="36.5" width="9" height="3" rx="0.8" fill="${ovenOn ? accent : 'var(--divider-color, #666)'}" opacity="0.85" class="${ovenOn && animate ? 'uc-appl-led' : ''}" />

        <!-- Oven door -->
        <rect x="14" y="46" width="72" height="46" rx="4" fill="color-mix(in srgb, var(--primary-text-color) 3%, transparent)" stroke="${doorOpen ? warn : 'color-mix(in srgb, var(--divider-color) 70%, transparent)'}" stroke-width="${doorOpen ? 2 : 1}" class="${doorOpen ? 'uc-appl-door-open' : ''}" />
        <rect x="17" y="49" width="66" height="4" rx="2" fill="color-mix(in srgb, var(--primary-text-color) 18%, #3a3a3a)" />

        <!-- Oven window -->
        <rect x="22" y="58" width="56" height="28" rx="3" fill="#0e1114" stroke="color-mix(in srgb, var(--divider-color) 60%, transparent)" stroke-width="0.9" />
        <rect x="22" y="58" width="56" height="28" rx="3" fill="url(#${gid}-glow)" />
        ${ovenOn && animate
          ? svg`
              <g class="uc-appl-fx--on" opacity="0.7" clip-path="inset(0)">
                <path class="uc-appl-heat" d="M 36 82 Q 39 72 36 62" fill="none" stroke="#ffb45e" stroke-width="1.5" stroke-linecap="round" />
                <path class="uc-appl-heat uc-appl-heat--b" d="M 50 83 Q 53 72 50 61" fill="none" stroke="#ffb45e" stroke-width="1.5" stroke-linecap="round" />
                <path class="uc-appl-heat uc-appl-heat--c" d="M 64 82 Q 67 72 64 62" fill="none" stroke="#ffb45e" stroke-width="1.5" stroke-linecap="round" />
              </g>`
          : nothing}
        ${lightOn
          ? svg`<circle cx="74" cy="62" r="1.8" fill="#ffd27a" opacity="0.95" />`
          : nothing}
        <path d="M 26 62 Q 50 58 74 62" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.6" stroke-linecap="round" />

        <!-- Storage drawer -->
        <rect x="14" y="96" width="72" height="12" rx="3" fill="color-mix(in srgb, var(--primary-text-color) 3%, transparent)" stroke="color-mix(in srgb, var(--divider-color) 60%, transparent)" stroke-width="0.9" />
        <rect x="38" y="100.5" width="24" height="3" rx="1.5" fill="color-mix(in srgb, var(--primary-text-color) 16%, #3a3a3a)" />

        ${phase === 'done'
          ? svg`
              <g>
                <circle cx="80" cy="14" r="8" fill="${accent}" />
                <path d="M 76 14 L 79 17 L 85 10" fill="none" stroke="var(--text-primary-color, #fff)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </g>`
          : nothing}
      </svg>
    `;
  }

  private renderGraphic(
    m: ApplianceModuleConfig,
    type: ApplianceCardType,
    size: number,
    phase: AppliancePhase,
    accent: string,
    animate: boolean,
    flags: {
      fridgeDoorOpen?: boolean;
      freezerDoorOpen?: boolean;
      doorOpen?: boolean;
      alert?: boolean;
      burners?: boolean[];
      lightOn?: boolean;
    }
  ): TemplateResult {
    if (type === 'fridge') {
      return this.fridgeSvg(
        m.id,
        size,
        accent,
        !!flags.fridgeDoorOpen,
        !!flags.freezerDoorOpen,
        !!flags.alert
      );
    }
    if (type === 'range') {
      return this.rangeSvg(
        m.id,
        size,
        phase,
        accent,
        animate,
        flags.burners || [],
        !!flags.lightOn,
        !!flags.doorOpen
      );
    }
    if (type === 'dishwasher') {
      return this.dishwasherSvg(m.id, size, phase, accent, animate, !!flags.doorOpen);
    }
    return this.laundrySvg(m.id, size, type, phase, accent, animate);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Preview
  // ────────────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as ApplianceModuleConfig;
    const lang = hass?.locale?.language || 'en';
    const type = this.cardType;
    const meta = APPLIANCE_META[type];
    const main = this.getRef(hass, m.entity, config);

    if (!main) {
      return html`
        <style>${this.getStyles()}</style>
        <div class="uc-appl-wrapper">
          ${this.renderGradientErrorState(
            localize('editor.appliance.config_needed', lang, 'Select an appliance'),
            localize('editor.appliance.config_needed_desc', lang, 'Choose the main entity in the General tab'),
            meta.icon
          )}
        </div>
      `;
    }

    const links = this.resolveLinks(m, hass, config, main);
    const layout = m.layout || 'standard';
    const animate = m.enable_animations !== false;
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--card-background-color)';
    const isFridge = type === 'fridge';
    const isRange = type === 'range';

    // Title: explicit name > registry device name > cleaned friendly name
    // ("Kitchen Refrigerator Power" → "Kitchen Refrigerator") > prefix.
    const name =
      m.name?.trim() ||
      links.deviceName ||
      (typeof main.attrs.friendly_name === 'string'
        ? String(main.attrs.friendly_name)
            .replace(
              /\b(machine state|job state|completion time|run state|remain(?:ing)? time|power|energy|state|status|temperature)\s*$/i,
              ''
            )
            .trim()
        : '') ||
      formatLabel(links.prefix) ||
      meta.fallbackName;

    // ── Phase / status ──
    const machineRaw = links.machineState?.state ?? main.state;
    let phase: AppliancePhase = isFridge ? 'running' : resolvePhase(machineRaw);
    const powerBinary = !isFridge
      ? this.autoFind(hass, links.pool, links.prefix, ['binary_sensor'], [
          new RegExp(`^${links.prefix}_power(_\\d+)?$`),
          /(^|_)power(_state)?(_\d+)?$/,
        ])
      : undefined;
    const powerOnSensor = powerBinary ? hass.states[powerBinary]?.state === 'on' : undefined;
    if (!isFridge && phase === 'idle' && powerOnSensor === false) phase = 'off';

    // The range leads with the oven mode ("Bake") over the raw job state
    const jobRaw =
      (isRange ? links.ovenMode?.state || links.jobState?.state : links.jobState?.state) || '';
    const jobLabel =
      jobRaw && !['none', 'unknown', 'unavailable', 'off'].includes(jobRaw.toLowerCase())
        ? formatLabel(jobRaw)
        : null;

    const completionDate = resolveCompletion(links.completion);
    const showEta =
      m.show_completion_time !== false &&
      !isFridge &&
      (phase === 'running' || phase === 'paused') &&
      !!completionDate;

    // Fridge alerts
    const fridgeDoorOpen = links.fridgeDoor?.state === 'on';
    const freezerDoorOpen = links.freezerDoor?.state === 'on';
    const filterProblem = links.filterStatus?.state === 'on';
    const doorOpen = links.door?.state === 'on';

    // Range: cooktop burners + oven light
    const burnersOn = m.show_cooktop === false ? [] : links.cooktop.map(burnerOn);
    const burnersOnCount = burnersOn.filter(Boolean).length;
    const ovenLightOn = links.ovenLight?.state === 'on';

    const doneColor = m.done_color || '#4CAF50';
    const accent = (() => {
      if (isFridge) return m.active_color || 'var(--primary-color)';
      // A hot cooktop makes the range card "active" even with the oven idle
      if (isRange && burnersOnCount > 0 && (phase === 'idle' || phase === 'off'))
        return m.active_color || 'var(--uc-appl-burner, #ff6b35)';
      switch (phase) {
        case 'running': return m.active_color || 'var(--primary-color)';
        case 'paused': return 'var(--warning-color, #FF9800)';
        case 'done': return doneColor;
        case 'error': return 'var(--error-color, #F44336)';
        default: return secondary;
      }
    })();
    // The status badge warns on fridge alerts without recoloring the whole card
    const badgeColor =
      isFridge && (fridgeDoorOpen || freezerDoorOpen || filterProblem)
        ? 'var(--warning-color, #FF9800)'
        : accent;

    const statusLabel = (() => {
      if (isFridge) {
        if (fridgeDoorOpen && freezerDoorOpen) return localize('editor.appliance.doors_open', lang, 'Doors open');
        if (fridgeDoorOpen) return localize('editor.appliance.fridge_door_open', lang, 'Fridge door open');
        if (freezerDoorOpen) return localize('editor.appliance.freezer_door_open', lang, 'Freezer door open');
        if (filterProblem) return localize('editor.appliance.filter_alert', lang, 'Replace water filter');
        return localize('editor.appliance.cooling', lang, 'Cooling');
      }
      if (isRange && burnersOnCount > 0 && (phase === 'idle' || phase === 'off'))
        return localize('editor.appliance.cooktop_on', lang, 'Cooktop on');
      switch (phase) {
        case 'running': return localize('editor.appliance.state_running', lang, 'Running');
        case 'paused': return localize('editor.appliance.state_paused', lang, 'Paused');
        case 'done': return localize('editor.appliance.state_done', lang, 'Done');
        case 'error': return localize('editor.appliance.state_error', lang, 'Error');
        case 'off': return localize('editor.appliance.state_off', lang, 'Off');
        case 'unavailable': return localize('editor.appliance.state_unavailable', lang, 'Unavailable');
        default: return localize('editor.appliance.state_idle', lang, 'Idle');
      }
    })();

    const unavailable = phase === 'unavailable';

    // ── Service helpers ──
    const setMachine = (option: 'run' | 'pause' | 'stop') => {
      const sel = links.controlSelect;
      if (!sel) return;
      const domain = sel.id.split('.')[0];
      hass.callService(domain === 'input_select' ? 'input_select' : 'select', 'select_option', {
        entity_id: sel.id,
        option,
      });
      this.triggerPreviewUpdate(true);
    };
    const togglePower = () => {
      if (!links.powerSwitch) return;
      hass.callService('switch', 'toggle', { entity_id: links.powerSwitch.id });
      this.triggerPreviewUpdate(true);
    };
    const toggleFeature = (id: string) => {
      hass.callService('switch', 'toggle', { entity_id: id });
      this.triggerPreviewUpdate(true);
    };
    const stepSetpoint = (ref: EntityRef, dir: 1 | -1) => {
      const min = typeof ref.attrs.min === 'number' ? ref.attrs.min : -30;
      const max = typeof ref.attrs.max === 'number' ? ref.attrs.max : 90;
      const step = typeof ref.attrs.step === 'number' && ref.attrs.step > 0 ? ref.attrs.step : 1;
      const pending = this._pendingSetpoints.get(ref.id);
      const base =
        pending && Date.now() - pending.ts < 6000 ? pending.value : Number(ref.state);
      if (Number.isNaN(base)) return;
      const next = Math.min(max, Math.max(min, base + dir * step));
      this._pendingSetpoints.set(ref.id, { value: next, ts: Date.now() });
      hass.callService('number', 'set_value', { entity_id: ref.id, value: next });
      this.triggerPreviewUpdate(true);
    };
    const setpointValue = (ref: EntityRef): number | null => {
      const pending = this._pendingSetpoints.get(ref.id);
      const haVal = Number(ref.state);
      if (pending) {
        if (Date.now() - pending.ts >= 6000 || pending.value === haVal) {
          this._pendingSetpoints.delete(ref.id);
        } else {
          return pending.value;
        }
      }
      return Number.isNaN(haVal) ? null : haVal;
    };

    // ── Building blocks ──
    const options: string[] = Array.isArray(links.controlSelect?.attrs.options)
      ? links.controlSelect!.attrs.options.map((o: unknown) => String(o).toLowerCase())
      : [];
    const canRun = options.includes('run');
    const canPause = options.includes('pause');
    const canStop = options.includes('stop');
    const remoteEnabled = links.remoteControl ? links.remoteControl.state === 'on' : true;

    const controlsRow =
      !isFridge && m.show_controls !== false && links.controlSelect && (canRun || canPause || canStop)
        ? html`
            <div class="uc-appl-controls" role="group" title="${!remoteEnabled ? localize('editor.appliance.remote_disabled', lang, 'Enable remote control on the appliance to allow remote start') : ''}">
              ${canRun
                ? html`<button type="button" class="uc-appl-ctl uc-appl-btn ${phase === 'running' ? 'is-active' : ''}" ?disabled=${unavailable || !remoteEnabled} @click=${() => setMachine('run')}>
                    <ha-icon icon="mdi:play"></ha-icon>${localize('editor.appliance.start', lang, 'Start')}
                  </button>`
                : nothing}
              ${canPause
                ? html`<button type="button" class="uc-appl-ctl uc-appl-btn ${phase === 'paused' ? 'is-active' : ''}" ?disabled=${unavailable || !remoteEnabled} @click=${() => setMachine('pause')}>
                    <ha-icon icon="mdi:pause"></ha-icon>${localize('editor.appliance.pause', lang, 'Pause')}
                  </button>`
                : nothing}
              ${canStop
                ? html`<button type="button" class="uc-appl-ctl uc-appl-btn ${phase === 'idle' || phase === 'off' ? 'is-active' : ''}" ?disabled=${unavailable || !remoteEnabled} @click=${() => setMachine('stop')}>
                    <ha-icon icon="mdi:stop"></ha-icon>${localize('editor.appliance.stop', lang, 'Stop')}
                  </button>`
                : nothing}
              ${m.show_power_button !== false && links.powerSwitch
                ? html`<button type="button" class="uc-appl-ctl uc-appl-btn uc-appl-btn--power ${links.powerSwitch.state === 'on' ? 'is-active' : ''}" ?disabled=${unavailable} @click=${togglePower} aria-label="${localize('editor.appliance.power', lang, 'Power')}">
                    <ha-icon icon="mdi:power"></ha-icon>
                  </button>`
                : nothing}
            </div>
          `
        : nothing;

    // Range has no run/pause select — its controls are the oven light and stop
    const rangeControls =
      isRange && m.show_controls !== false && (links.ovenLight || links.stopButton)
        ? html`
            <div class="uc-appl-controls" role="group">
              ${links.ovenLight
                ? html`<button
                    type="button"
                    class="uc-appl-ctl uc-appl-btn ${ovenLightOn ? 'is-active' : ''}"
                    ?disabled=${links.ovenLight.state === 'unavailable'}
                    aria-pressed="${ovenLightOn ? 'true' : 'false'}"
                    @click=${() => {
                      hass.callService('light', 'toggle', { entity_id: links.ovenLight!.id });
                      this.triggerPreviewUpdate(true);
                    }}
                  >
                    <ha-icon icon="${ovenLightOn ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline'}"></ha-icon>
                    ${localize('editor.appliance.oven_light', lang, 'Light')}
                  </button>`
                : nothing}
              ${links.stopButton
                ? html`<button
                    type="button"
                    class="uc-appl-ctl uc-appl-btn"
                    ?disabled=${unavailable || (phase !== 'running' && phase !== 'paused')}
                    @click=${() => {
                      hass.callService('button', 'press', { entity_id: links.stopButton!.id });
                      this.triggerPreviewUpdate(true);
                    }}
                  >
                    <ha-icon icon="mdi:stop"></ha-icon>${localize('editor.appliance.stop', lang, 'Stop')}
                  </button>`
                : nothing}
            </div>
          `
        : nothing;

    const statusChips = (() => {
      if (m.show_status_chips === false) return nothing;
      const chips: TemplateResult[] = [];
      const chip = (icon: string, label: string, warn = false) =>
        chips.push(html`<span class="uc-appl-chip ${warn ? 'uc-appl-chip--warn' : ''}"><ha-icon icon="${icon}"></ha-icon>${label}</span>`);
      if (links.childLock?.state === 'on') chip('mdi:lock', localize('editor.appliance.chip_child_lock', lang, 'Child lock'));
      if (!isFridge && links.remoteControl && links.remoteControl.state !== 'on')
        chip('mdi:remote-off', localize('editor.appliance.chip_remote_off', lang, 'Remote off'));
      if (links.wrinklePrevent?.state === 'on') chip('mdi:tshirt-crew', localize('editor.appliance.chip_wrinkle', lang, 'Wrinkle prevent'));
      if (doorOpen) chip('mdi:door-open', localize('editor.appliance.chip_door_open', lang, 'Door open'), true);
      if (isRange && m.show_cooktop !== false && burnersOnCount > 0)
        chip(
          'mdi:fire',
          burnersOnCount === 1
            ? localize('editor.appliance.chip_burner_on', lang, '1 burner on')
            : `${burnersOnCount} ${localize('editor.appliance.chip_burners_on', lang, 'burners on')}`,
          true
        );
      // Fridge door state is already shown by the status badge and temp tiles
      if (filterProblem) chip('mdi:water-alert', localize('editor.appliance.chip_filter', lang, 'Replace filter'), true);
      if (filterProblem && links.filterReset) {
        chips.push(html`
          <button
            type="button"
            class="uc-appl-ctl uc-appl-chip uc-appl-chip--action"
            @click=${() => {
              hass.callService('button', 'press', { entity_id: links.filterReset!.id });
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon="mdi:restart"></ha-icon>${localize('editor.appliance.reset_filter', lang, 'Reset filter')}
          </button>
        `);
      }
      if (!chips.length) return nothing;
      return html`<div class="uc-appl-chips">${chips}</div>`;
    })();

    const settingsRow =
      m.show_settings !== false && links.settingSelects.length
        ? html`
            <div class="uc-appl-settings">
              ${links.settingSelects.map(s => {
                const opts: string[] = Array.isArray(s.attrs.options)
                  ? s.attrs.options.map((o: unknown) => String(o))
                  : [];
                if (!opts.length) return nothing;
                return html`
                  <label class="uc-appl-setting uc-appl-ctl">
                    <span class="uc-appl-setting__label">${this.featureLabel(s, links.prefix, links.deviceName)}</span>
                    <span class="uc-appl-setting__select-wrap">
                      <select
                        class="uc-appl-setting__select"
                        ?disabled=${s.state === 'unavailable'}
                        .value=${s.state}
                        @change=${(ev: Event) => {
                          const value = (ev.target as HTMLSelectElement).value;
                          const domain = s.id.split('.')[0];
                          hass.callService(
                            domain === 'input_select' ? 'input_select' : 'select',
                            'select_option',
                            { entity_id: s.id, option: value }
                          );
                          this.triggerPreviewUpdate(true);
                        }}
                      >
                        ${opts.map(
                          o => html`<option value="${o}" ?selected=${o === s.state}>${formatLabel(o)}</option>`
                        )}
                      </select>
                      <ha-icon icon="mdi:chevron-down"></ha-icon>
                    </span>
                  </label>
                `;
              })}
            </div>
          `
        : nothing;

    const featureChips =
      m.show_feature_switches !== false && links.features.length
        ? html`
            <div class="uc-appl-features">
              ${links.features.map(f => {
                const on = f.state === 'on';
                return html`
                  <button
                    type="button"
                    class="uc-appl-ctl uc-appl-feature ${on ? 'is-active' : ''}"
                    ?disabled=${f.state === 'unavailable'}
                    aria-pressed="${on ? 'true' : 'false'}"
                    @click=${() => toggleFeature(f.id)}
                  >
                    ${this.featureLabel(f, links.prefix, links.deviceName)}
                  </button>
                `;
              })}
            </div>
          `
        : nothing;

    const metricsRow = (() => {
      if (m.show_metrics === false) return nothing;
      const tiles: TemplateResult[] = [];
      if (links.power && !Number.isNaN(Number(links.power.state))) {
        tiles.push(html`
          <div class="uc-appl-metric">
            <span class="uc-appl-metric__label">${localize('editor.appliance.metric_power', lang, 'Power')}</span>
            <span class="uc-appl-metric__value" style="color: ${text};">${formatNumber(links.power.state)}<span class="uc-appl-metric__unit">${links.power.attrs.unit_of_measurement || 'W'}</span></span>
          </div>
        `);
      }
      if (links.energy && !Number.isNaN(Number(links.energy.state))) {
        tiles.push(html`
          <div class="uc-appl-metric">
            <span class="uc-appl-metric__label">${localize('editor.appliance.metric_energy', lang, 'Energy')}</span>
            <span class="uc-appl-metric__value" style="color: ${text};">${formatNumber(links.energy.state, 2)}<span class="uc-appl-metric__unit">${links.energy.attrs.unit_of_measurement || 'kWh'}</span></span>
          </div>
        `);
      }
      if (!tiles.length) return nothing;
      return html`<div class="uc-appl-metrics">${tiles}</div>`;
    })();

    const etaRow = showEta && completionDate
      ? html`
          <div class="uc-appl-eta">
            <ha-icon icon="mdi:clock-end" style="--mdc-icon-size: 15px; color: ${accent};"></ha-icon>
            <span class="uc-appl-eta__count" style="color: ${text};">${formatCountdown(completionDate)}</span>
            <span class="uc-appl-eta__sep" style="color: ${secondary};">·</span>
            <span style="color: ${secondary};">
              ${localize('editor.appliance.ends_at', lang, 'Ends')} ${formatClock(completionDate, hass.locale?.language)}
            </span>
          </div>
        `
      : nothing;

    const tempTile = (
      label: string,
      icon: string,
      temp: EntityRef | null,
      setpoint: EntityRef | null,
      open: boolean
    ) => {
      if (!temp && !setpoint) return nothing;
      const unit = temp?.attrs.unit_of_measurement || setpoint?.attrs.unit_of_measurement || '°';
      const spVal = setpoint ? setpointValue(setpoint) : null;
      return html`
        <div class="uc-appl-temp ${open ? 'uc-appl-temp--alert' : ''}">
          <div class="uc-appl-temp__head">
            <ha-icon icon="${icon}"></ha-icon>
            <span>${label}</span>
            ${open ? html`<span class="uc-appl-temp__open">${localize('editor.appliance.open', lang, 'Open')}</span>` : nothing}
          </div>
          ${temp && !Number.isNaN(Number(temp.state))
            ? html`<div class="uc-appl-temp__value" style="color: ${text};">${formatNumber(temp.state, 0)}<span class="uc-appl-temp__unit">${unit}</span></div>`
            : nothing}
          ${setpoint && spVal !== null && m.show_setpoint_controls !== false && setpoint.id.startsWith('number.')
            ? html`
                <div class="uc-appl-temp__set">
                  <button type="button" class="uc-appl-ctl uc-appl-step" @click=${() => stepSetpoint(setpoint, -1)} aria-label="${localize('editor.appliance.decrease', lang, 'Decrease')}">
                    <ha-icon icon="mdi:minus"></ha-icon>
                  </button>
                  <span class="uc-appl-temp__target" style="color: ${secondary};">${localize('editor.appliance.set_to', lang, 'Set')} ${spVal}${unit}</span>
                  <button type="button" class="uc-appl-ctl uc-appl-step" @click=${() => stepSetpoint(setpoint, 1)} aria-label="${localize('editor.appliance.increase', lang, 'Increase')}">
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </button>
                </div>
              `
            : setpoint && spVal !== null
              ? html`<div class="uc-appl-temp__target" style="color: ${secondary};">${localize('editor.appliance.set_to', lang, 'Set')} ${spVal}${unit}</div>`
              : nothing}
        </div>
      `;
    };

    const tempsGrid = (() => {
      if (m.show_temperatures === false) return nothing;
      if (isFridge) {
        return html`
          <div class="uc-appl-temps">
            ${tempTile(localize('editor.appliance.fridge', lang, 'Fridge'), 'mdi:fridge-top', links.fridgeTemp, links.fridgeSetpoint, fridgeDoorOpen)}
            ${tempTile(localize('editor.appliance.freezer', lang, 'Freezer'), 'mdi:snowflake', links.freezerTemp, links.freezerSetpoint, freezerDoorOpen)}
          </div>
        `;
      }
      if (isRange) {
        const modeText = (ref: EntityRef | null) =>
          ref?.state && !['none', 'off', 'unknown', 'unavailable'].includes(ref.state.toLowerCase())
            ? formatLabel(ref.state)
            : null;
        // A 0° set point means the oven isn't targeting anything — hide it
        const activeSetpoint = (ref: EntityRef | null) =>
          ref && Number(ref.state) > 0 ? ref : null;
        const ovenLabel = localize('editor.appliance.oven', lang, 'Oven');
        const ovenMode = modeText(links.ovenMode);
        const cavityMode = modeText(links.cavityMode);
        const hasCavity = !!(links.cavityTemp || links.cavitySetpoint);
        const ovenTile = tempTile(
          ovenMode ? `${ovenLabel} · ${ovenMode}` : ovenLabel,
          'mdi:toaster-oven',
          links.ovenTemp,
          activeSetpoint(links.ovenSetpoint),
          doorOpen
        );
        if (ovenTile === nothing && !hasCavity) return nothing;
        return html`
          <div class="uc-appl-temps">
            ${ovenTile}
            ${hasCavity
              ? tempTile(
                  cavityMode
                    ? `${localize('editor.appliance.lower_oven', lang, 'Lower oven')} · ${cavityMode}`
                    : localize('editor.appliance.lower_oven', lang, 'Lower oven'),
                  'mdi:toaster-oven',
                  links.cavityTemp,
                  activeSetpoint(links.cavitySetpoint),
                  false
                )
              : nothing}
          </div>
        `;
      }
      return nothing;
    })();

    const statusBadge =
      m.show_status !== false
        ? html`
            <div class="uc-appl-status">
              <span class="uc-appl-badge" style="--uc-appl-accent: ${badgeColor};">
                ${phase === 'running' && !isFridge ? html`<span class="uc-appl-dot"></span>` : nothing}
                ${statusLabel}
              </span>
              ${jobLabel && !isFridge && phase !== 'idle' && phase !== 'off'
                ? html`<span class="uc-appl-job" style="color: ${secondary};">${jobLabel}</span>`
                : nothing}
            </div>
          `
        : nothing;

    const graphicFlags = {
      fridgeDoorOpen,
      freezerDoorOpen,
      doorOpen,
      alert: filterProblem,
      burners: burnersOn,
      lightOn: ovenLightOn,
    };
    const size =
      layout === 'hero'
        ? Math.max(m.appliance_size ?? HERO_SIZE, 110)
        : layout === 'compact'
          ? COMPACT_SIZE
          : m.appliance_size ?? STANDARD_SIZE;

    const graphic = (px: number, wellClass = '') =>
      m.show_graphic !== false
        ? html`
            <div class="uc-appl-visual ${wellClass} ${phase === 'running' && !isFridge ? 'uc-appl-visual--on' : ''} ${phase === 'done' ? 'uc-appl-visual--done' : ''}" style="--uc-appl-accent: ${accent};">
              ${this.renderGraphic(m, type, px, phase, accent, animate, graphicFlags)}
            </div>
          `
        : nothing;

    // ── Layouts ──
    let content: TemplateResult;

    if (layout === 'compact') {
      content = html`
        <div class="uc-appl uc-appl--compact" style="--uc-appl-accent: ${accent};">
          <div class="uc-appl-compact__row">
            ${graphic(COMPACT_SIZE, 'uc-appl-visual--compact')}
            <div class="uc-appl-compact__meta">
              ${m.show_title !== false
                ? html`<div class="uc-appl-title uc-appl-title--compact" style="color: ${text};">${name}</div>`
                : nothing}
              ${m.show_status !== false
                ? html`<div class="uc-appl-compact__status" style="color: ${badgeColor};">
                    ${statusLabel}${jobLabel && phase === 'running' ? html`<span style="color: ${secondary};"> · ${jobLabel}</span>` : nothing}${showEta && completionDate
                      ? html`<span style="color: ${secondary};"> · ${formatCountdown(completionDate)}</span>`
                      : nothing}
                  </div>`
                : nothing}
            </div>
            ${!isFridge && m.show_controls !== false && links.controlSelect
              ? html`
                  <div class="uc-appl-compact__ctl">
                    ${phase === 'running' && canPause
                      ? html`<button type="button" class="uc-appl-ctl uc-appl-iconbtn" ?disabled=${unavailable || !remoteEnabled} @click=${() => setMachine('pause')} aria-label="${localize('editor.appliance.pause', lang, 'Pause')}"><ha-icon icon="mdi:pause"></ha-icon></button>`
                      : canRun
                        ? html`<button type="button" class="uc-appl-ctl uc-appl-iconbtn" ?disabled=${unavailable || !remoteEnabled} @click=${() => setMachine('run')} aria-label="${localize('editor.appliance.start', lang, 'Start')}"><ha-icon icon="mdi:play"></ha-icon></button>`
                        : nothing}
                  </div>
                `
              : nothing}
            ${!isFridge && m.show_power_button !== false && links.powerSwitch
              ? html`<button type="button" class="uc-appl-ctl uc-appl-iconbtn ${links.powerSwitch.state === 'on' ? 'is-active' : ''}" ?disabled=${unavailable} @click=${togglePower} aria-label="${localize('editor.appliance.power', lang, 'Power')}"><ha-icon icon="mdi:power"></ha-icon></button>`
              : nothing}
            ${isRange && m.show_controls !== false && links.ovenLight
              ? html`<button type="button" class="uc-appl-ctl uc-appl-iconbtn ${ovenLightOn ? 'is-active' : ''}" ?disabled=${links.ovenLight.state === 'unavailable'} @click=${() => {
                  hass.callService('light', 'toggle', { entity_id: links.ovenLight!.id });
                  this.triggerPreviewUpdate(true);
                }} aria-label="${localize('editor.appliance.oven_light', lang, 'Light')}"><ha-icon icon="${ovenLightOn ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline'}"></ha-icon></button>`
              : nothing}
          </div>
        </div>
      `;
    } else if (layout === 'hero') {
      content = html`
        <div class="uc-appl uc-appl--hero" style="--uc-appl-accent: ${accent};">
          ${graphic(size, 'uc-appl-visual--hero')}
          <div class="uc-appl-hero__ident">
            ${m.show_title !== false ? html`<h2 class="uc-appl-title uc-appl-title--hero" style="color: ${text};">${name}</h2>` : nothing}
            ${statusBadge}
          </div>
          ${etaRow}
          ${tempsGrid}
          ${controlsRow}
          ${rangeControls}
          ${settingsRow}
          ${statusChips}
          ${featureChips}
          ${metricsRow}
        </div>
      `;
    } else {
      content = html`
        <div class="uc-appl uc-appl--standard" style="--uc-appl-accent: ${accent};">
          <div class="uc-appl-standard__top">
            ${graphic(size)}
            <div class="uc-appl-standard__info">
              ${m.show_title !== false ? html`<div class="uc-appl-title uc-appl-title--standard" style="color: ${text};">${name}</div>` : nothing}
              ${statusBadge}
              ${etaRow}
              ${statusChips}
            </div>
          </div>
          ${tempsGrid}
          ${controlsRow}
          ${rangeControls}
          ${settingsRow}
          ${featureChips}
          ${metricsRow}
        </div>
      `;
    }

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const g = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action?.action
          ? { ...m.tap_action, entity: main.id }
          : { action: 'more-info', entity: main.id },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: main.id,
        module: m,
      },
      hass,
      config,
      ['.uc-appl-ctl']
    );

    return html`
      <style>${this.getStyles()}</style>
      <div
        class="uc-appl-wrapper ${hoverClass}"
        style="background: ${cardBg};${designStyles}"
        @pointerdown=${g.onPointerDown}
        @pointermove=${g.onPointerMove}
        @pointerup=${g.onPointerUp}
        @pointerleave=${g.onPointerLeave}
        @pointercancel=${g.onPointerCancel}
      >
        ${this.wrapWithAnimation(content, module, hass)}
      </div>
    `;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Styles
  // ────────────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      .uc-appl-wrapper {
        box-sizing: border-box;
        border-radius: 16px;
        padding: 16px;
        overflow: hidden;
      }

      .uc-appl {
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: 100%;
        min-width: 0;
      }
      .uc-appl--hero { align-items: center; text-align: center; }

      /* ── Graphic well ── */
      .uc-appl-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 18px;
        padding: 10px 12px;
        background:
          radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 9%, transparent), transparent 70%),
          color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color, var(--ha-card-background)));
        border: 1px solid color-mix(in srgb, var(--divider-color) 50%, transparent);
        transition: box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .uc-appl-visual--hero { border-radius: 22px; padding: 14px 18px; }
      .uc-appl-visual--compact { padding: 4px 6px; border-radius: 12px; }
      .uc-appl-visual--on {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 42%, transparent);
        box-shadow: 0 4px 22px color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 16%, transparent);
      }
      .uc-appl-visual--done {
        border-color: color-mix(in srgb, var(--uc-appl-accent, #4CAF50) 45%, transparent);
      }
      .uc-appl-svg { display: block; overflow: visible; }

      /* ── Standard layout ── */
      .uc-appl-standard__top {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
      }
      .uc-appl-standard__info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
        align-items: flex-start;
      }

      /* ── Compact layout ── */
      .uc-appl-compact__row { display: flex; align-items: center; gap: 12px; width: 100%; }
      .uc-appl-compact__meta { flex: 1; min-width: 0; }
      .uc-appl-compact__status {
        font-size: 0.8125rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-appl-compact__ctl { display: flex; gap: 6px; }

      /* ── Hero ── */
      .uc-appl-hero__ident { display: flex; flex-direction: column; gap: 7px; align-items: center; }

      /* ── Typography ── */
      .uc-appl-title {
        margin: 0;
        font-weight: 700;
        letter-spacing: -0.01em;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
      .uc-appl-title--hero { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
      .uc-appl-title--standard { font-size: 1.0625rem; }
      .uc-appl-title--compact { font-size: 0.9375rem; }

      .uc-appl-status { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .uc-appl-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        padding: 4px 11px;
        border-radius: 999px;
        color: var(--uc-appl-accent, var(--primary-color));
        background: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 30%, transparent);
        white-space: nowrap;
      }
      .uc-appl-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 7px color-mix(in srgb, currentColor 65%, transparent);
        animation: ucApplPulse 1.8s ease-in-out infinite;
      }
      .uc-appl-job { font-size: 0.8125rem; font-weight: 500; }

      .uc-appl-eta {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
      }
      .uc-appl-eta__count { font-weight: 800; font-variant-numeric: tabular-nums; font-size: 0.9375rem; }

      /* ── Controls ── */
      .uc-appl-controls { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; }
      .uc-appl--hero .uc-appl-controls { justify-content: center; }
      .uc-appl-btn {
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 999px;
        cursor: pointer;
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));
        color: var(--secondary-text-color);
        transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
        white-space: nowrap;
        flex: 1;
        justify-content: center;
        min-width: 0;
      }
      .uc-appl-btn ha-icon { --mdc-icon-size: 17px; }
      .uc-appl-btn.is-active {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 55%, transparent);
        background: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 14%, var(--card-background-color, var(--ha-card-background)));
        color: var(--uc-appl-accent, var(--primary-color));
        box-shadow: 0 2px 12px color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 12%, transparent);
      }
      .uc-appl-btn:hover:not(:disabled):not(.is-active) {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 30%, var(--divider-color));
        color: var(--primary-text-color);
      }
      .uc-appl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .uc-appl-btn--power { flex: 0 0 auto; padding: 8px 12px; }

      .uc-appl-iconbtn {
        font: inherit;
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));
        color: var(--secondary-text-color);
        flex-shrink: 0;
        transition: background 0.15s, border-color 0.15s, color 0.15s;
      }
      .uc-appl-iconbtn ha-icon { --mdc-icon-size: 18px; }
      .uc-appl-iconbtn.is-active,
      .uc-appl-iconbtn:hover:not(:disabled) {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 45%, transparent);
        color: var(--uc-appl-accent, var(--primary-color));
      }
      .uc-appl-iconbtn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* ── Status chips ── */
      .uc-appl-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .uc-appl--hero .uc-appl-chips { justify-content: center; }
      .uc-appl-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        padding: 3.5px 10px;
        border-radius: 999px;
        color: var(--secondary-text-color);
        background: color-mix(in srgb, var(--divider-color) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 40%, transparent);
        white-space: nowrap;
      }
      .uc-appl-chip ha-icon { --mdc-icon-size: 13px; }
      .uc-appl-chip--warn {
        color: var(--warning-color, #FF9800);
        background: color-mix(in srgb, var(--warning-color, #FF9800) 12%, transparent);
        border-color: color-mix(in srgb, var(--warning-color, #FF9800) 35%, transparent);
      }
      .uc-appl-chip--action {
        font: inherit;
        font-size: 0.6875rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--uc-appl-accent, var(--primary-color));
        background: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 12%, transparent);
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 40%, transparent);
        transition: background 0.14s;
      }
      .uc-appl-chip--action:hover {
        background: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 20%, transparent);
      }

      /* ── Cycle setting dropdowns ── */
      .uc-appl-settings {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        width: 100%;
      }
      .uc-appl-setting {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .uc-appl-setting__label {
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-appl-setting__select-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .uc-appl-setting__select-wrap ha-icon {
        --mdc-icon-size: 16px;
        position: absolute;
        right: 9px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .uc-appl-setting__select {
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        width: 100%;
        padding: 7px 28px 7px 11px;
        border-radius: 10px;
        cursor: pointer;
        color: var(--primary-text-color);
        border: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));
        appearance: none;
        -webkit-appearance: none;
        outline: none;
        transition: border-color 0.14s;
      }
      .uc-appl-setting__select:hover:not(:disabled),
      .uc-appl-setting__select:focus-visible {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 45%, transparent);
      }
      .uc-appl-setting__select:disabled { opacity: 0.4; cursor: not-allowed; }
      .uc-appl-setting__select option {
        background: var(--card-background-color, #1f1f1f);
        color: var(--primary-text-color);
      }

      /* ── Feature switches ── */
      .uc-appl-features { display: flex; flex-wrap: wrap; gap: 7px; width: 100%; }
      .uc-appl--hero .uc-appl-features { justify-content: center; }
      .uc-appl-feature {
        font: inherit;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 6px 13px;
        border-radius: 999px;
        cursor: pointer;
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
        background: color-mix(in srgb, var(--divider-color) 7%, var(--card-background-color, var(--ha-card-background)));
        color: var(--secondary-text-color);
        transition: background 0.14s, border-color 0.14s, color 0.14s, box-shadow 0.14s;
        white-space: nowrap;
      }
      .uc-appl-feature.is-active {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 55%, transparent);
        background: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 13%, var(--card-background-color, var(--ha-card-background)));
        color: var(--uc-appl-accent, var(--primary-color));
        font-weight: 700;
        box-shadow: 0 2px 10px color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 10%, transparent);
      }
      .uc-appl-feature:hover:not(:disabled):not(.is-active) {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 28%, var(--divider-color));
        color: var(--primary-text-color);
      }
      .uc-appl-feature:disabled { opacity: 0.4; cursor: not-allowed; }

      /* ── Metrics ── */
      .uc-appl-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 8px;
        width: 100%;
      }
      .uc-appl-metric {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 9px 12px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--divider-color) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 32%, transparent);
        min-width: 0;
      }
      .uc-appl--hero .uc-appl-metric { align-items: center; }
      .uc-appl-metric__label {
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        color: var(--secondary-text-color);
      }
      .uc-appl-metric__value {
        font-size: 1rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.01em;
      }
      .uc-appl-metric__unit {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--secondary-text-color);
        margin-left: 3px;
      }

      /* ── Fridge temperature tiles ── */
      .uc-appl-temps {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        width: 100%;
      }
      .uc-appl-temp {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--divider-color) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 32%, transparent);
        min-width: 0;
      }
      .uc-appl-temp--alert {
        border-color: color-mix(in srgb, var(--warning-color, #FF9800) 45%, transparent);
        background: color-mix(in srgb, var(--warning-color, #FF9800) 7%, transparent);
      }
      .uc-appl-temp__head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--secondary-text-color);
      }
      .uc-appl-temp__head ha-icon { --mdc-icon-size: 14px; color: var(--uc-appl-accent, var(--primary-color)); }
      .uc-appl-temp__open {
        margin-left: auto;
        color: var(--warning-color, #FF9800);
        font-size: 0.625rem;
      }
      .uc-appl-temp__value {
        font-size: 1.7rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.03em;
        line-height: 1;
      }
      .uc-appl-temp__unit { font-size: 0.9375rem; font-weight: 600; color: var(--secondary-text-color); margin-left: 2px; }
      .uc-appl-temp__set { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
      .uc-appl-temp__target { font-size: 0.75rem; font-weight: 600; flex: 1; text-align: center; white-space: nowrap; }
      .uc-appl-step {
        font: inherit;
        width: 26px;
        height: 26px;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid color-mix(in srgb, var(--divider-color) 72%, transparent);
        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));
        color: var(--secondary-text-color);
        flex-shrink: 0;
        transition: border-color 0.14s, color 0.14s;
      }
      .uc-appl-step ha-icon { --mdc-icon-size: 15px; }
      .uc-appl-step:hover {
        border-color: color-mix(in srgb, var(--uc-appl-accent, var(--primary-color)) 40%, transparent);
        color: var(--uc-appl-accent, var(--primary-color));
      }

      /* ── Animations ── */
      @keyframes ucApplSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes ucApplPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
      @keyframes ucApplBubble {
        0% { transform: translateY(0); opacity: 0.5; }
        100% { transform: translateY(-16px); opacity: 0; }
      }
      @keyframes ucApplHeat {
        0%, 100% { transform: translateY(0); opacity: 0.35; }
        50% { transform: translateY(-3px); opacity: 0.85; }
      }
      @keyframes ucApplSteam {
        0% { transform: translateY(0); opacity: 0; }
        30% { opacity: 0.7; }
        100% { transform: translateY(-7px); opacity: 0; }
      }
      @keyframes ucApplDoorGlow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.45; }
      }

      .uc-appl-drum--spin { animation: ucApplSpin 1.7s linear infinite; }
      .uc-appl-drum--paused { opacity: 0.85; }
      .uc-appl-led { animation: ucApplPulse 1.5s ease-in-out infinite; }
      .uc-appl-burner--on { animation: ucApplPulse 1.9s ease-in-out infinite; }
      .uc-appl-ring { animation: ucApplPulse 3s ease-in-out infinite; }
      .uc-appl-fx--on .uc-appl-bubble--a { animation: ucApplBubble 1.7s ease-in infinite; }
      .uc-appl-fx--on .uc-appl-bubble--b { animation: ucApplBubble 2s ease-in infinite 0.4s; }
      .uc-appl-fx--on .uc-appl-bubble--c { animation: ucApplBubble 1.4s ease-in infinite 0.8s; }
      .uc-appl-fx--on .uc-appl-heat { animation: ucApplHeat 1.4s ease-in-out infinite; }
      .uc-appl-fx--on .uc-appl-heat--b { animation-delay: 0.2s; }
      .uc-appl-fx--on .uc-appl-heat--c { animation-delay: 0.4s; }
      .uc-appl-fx--on .uc-appl-steam { animation: ucApplSteam 2.2s ease-out infinite; }
      .uc-appl-fx--on .uc-appl-steam--b { animation-delay: 0.6s; }
      .uc-appl-fx--on .uc-appl-steam--c { animation-delay: 1.2s; }
      .uc-appl-spray--spin { animation: ucApplSpin 2.6s linear infinite; }
      .uc-appl-door-open { animation: ucApplDoorGlow 1.6s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .uc-appl-drum--spin,
        .uc-appl-led,
        .uc-appl-ring,
        .uc-appl-dot,
        .uc-appl-spray--spin,
        .uc-appl-door-open,
        .uc-appl-burner--on,
        .uc-appl-fx--on * { animation: none !important; }
      }

      @media (max-width: 420px) {
        .uc-appl-standard__top { flex-direction: column; text-align: center; }
        .uc-appl-standard__info { align-items: center; }
        .uc-appl-temps { grid-template-columns: 1fr; }
      }
    `;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Concrete modules — each appliance is a separate free module in the picker
// ────────────────────────────────────────────────────────────────────────────

export class UltraWasherModule extends UltraApplianceBaseModule {
  protected readonly cardType = 'washer' as const;
  metadata: ModuleMetadata = {
    type: 'washer',
    title: 'Washer',
    description: 'Animated washing machine card with cycle status, remaining time, controls, and energy use',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:washing-machine',
    category: 'interactive',
    tags: ['washer', 'washing machine', 'laundry', 'appliance', 'smartthings', 'cycle', 'animated', 'interactive'],
  };
}

export class UltraDryerModule extends UltraApplianceBaseModule {
  protected readonly cardType = 'dryer' as const;
  metadata: ModuleMetadata = {
    type: 'dryer',
    title: 'Dryer',
    description: 'Animated dryer card with cycle status, remaining time, controls, and energy use',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:tumble-dryer',
    category: 'interactive',
    tags: ['dryer', 'tumble dryer', 'laundry', 'appliance', 'smartthings', 'cycle', 'animated', 'interactive'],
  };
}

export class UltraDishwasherModule extends UltraApplianceBaseModule {
  protected readonly cardType = 'dishwasher' as const;
  metadata: ModuleMetadata = {
    type: 'dishwasher',
    title: 'Dishwasher',
    description: 'Animated dishwasher card with cycle status, remaining time, controls, and wash options',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:dishwasher',
    category: 'interactive',
    tags: ['dishwasher', 'kitchen', 'appliance', 'smartthings', 'cycle', 'animated', 'interactive'],
  };
}

export class UltraFridgeModule extends UltraApplianceBaseModule {
  protected readonly cardType = 'fridge' as const;
  metadata: ModuleMetadata = {
    type: 'fridge',
    title: 'Refrigerator',
    description: 'Refrigerator card with temperatures, setpoints, door alerts, and ice/cooling controls',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:fridge-outline',
    category: 'interactive',
    tags: ['fridge', 'refrigerator', 'freezer', 'kitchen', 'appliance', 'smartthings', 'animated', 'interactive'],
  };
}

export class UltraRangeModule extends UltraApplianceBaseModule {
  protected readonly cardType = 'range' as const;
  metadata: ModuleMetadata = {
    type: 'range',
    title: 'Range & Oven',
    description: 'Range card with live cooktop burner indicators, oven status and temperature, dual-oven support, and light control',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:stove',
    category: 'interactive',
    tags: ['range', 'oven', 'stove', 'cooktop', 'kitchen', 'appliance', 'smartthings', 'animated', 'interactive'],
  };
}
