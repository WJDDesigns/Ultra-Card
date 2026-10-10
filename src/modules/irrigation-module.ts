/**
 * Free Irrigation module — one sprinkler / valve control card for any
 * integration: plain switch or valve entities, OpenSprinkler, Rachio,
 * Irrigation Unlimited, B-hyve, ESPHome sprinkler controllers and more.
 *
 * Simple: pick zone entities and each row gets name, state, Run/Stop, a run
 * duration and the remaining time. Advanced: master / pump, rain delay, rain
 * sensor, next run, flow and water used, per-zone soil moisture, run-all via a
 * script or service, per-zone icon / color, compact layout and ordering.
 *
 * Timed runs are always delegated to Home Assistant (integration service or a
 * custom action), so they never depend on this browser staying open. When the
 * integration exposes no remaining-time attribute the countdown is an estimate
 * from the requested duration, which lives in memory only and is labelled.
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  IrrigationLayout,
  IrrigationModule,
  IrrigationRunAllMode,
  IrrigationRunMode,
  IrrigationServicePreset,
  IrrigationZone,
  UltraCardConfig,
} from '../types';
import { localize } from '../localize/localize';
import {
  DEFAULT_DURATION_MINUTES,
  DEFAULT_MOISTURE_DRY,
  DEFAULT_MOISTURE_WET,
  RAIN_DELAY_HOURS,
  ZONE_ENTITY_DOMAINS,
  buildRainDelayCall,
  buildRunAllCall,
  buildSelectOptionCall,
  buildStartCall,
  buildStopCall,
  defaultCustomData,
  elapsedSince,
  entityDomain,
  estimateRemaining,
  formatCountdown,
  isRainDelayActive,
  isRainSensorActive,
  moistureBand,
  rainDelayKind,
  reconcileZones,
  remainingFromAttributes,
  remainingFromSensor,
  resolveRunPlan,
  stepDuration,
  suggestZoneEntities,
  zoneStatus,
  type IrrigationConcretePreset,
  type IrrigationRunPlan,
  type IrrigationServiceCall,
  type IrrigationZoneStatus,
  type RunRequest,
} from '../services/uc-irrigation-service';

type UpdateFn = (updates: Partial<CardModule>) => void;

interface ZoneView {
  zone: IrrigationZone;
  entityId: string;
  name: string;
  icon: string;
  color: string;
  status: IrrigationZoneStatus;
  plan: IrrigationRunPlan;
  minutes: number;
  /** Seconds left, when known. */
  remaining: number | null;
  /** True when `remaining` is our own estimate rather than integration data. */
  estimated: boolean;
  /** Seconds since the zone turned on (fallback when remaining is unknown). */
  elapsed: number | null;
  /** 0..1 progress, when both remaining and the requested duration are known. */
  progress: number | null;
  moisture: number | null;
}

const PRESET_LABEL_KEYS: Record<IrrigationConcretePreset, [string, string]> = {
  opensprinkler: ['editor.irrigation.preset_opensprinkler', 'OpenSprinkler'],
  rachio: ['editor.irrigation.preset_rachio', 'Rachio'],
  irrigation_unlimited: ['editor.irrigation.preset_irrigation_unlimited', 'Irrigation Unlimited'],
  bhyve: ['editor.irrigation.preset_bhyve', 'B-hyve'],
  valve: ['editor.irrigation.preset_valve', 'Valve'],
  switch: ['editor.irrigation.preset_switch', 'Switch (on/off)'],
};

function numState(hass: HomeAssistant, entityId: string | undefined): number | null {
  if (!entityId) return null;
  const st = hass.states[entityId];
  if (!st) return null;
  const n = Number(st.state);
  return Number.isFinite(n) ? n : null;
}

function unitOf(hass: HomeAssistant, entityId: string | undefined): string {
  if (!entityId) return '';
  const u = hass.states[entityId]?.attributes?.unit_of_measurement;
  return typeof u === 'string' ? u : '';
}

function fireMoreInfo(e: Event, entityId: string | undefined): void {
  if (!entityId) return;
  e.stopPropagation();
  const target = (e.currentTarget || e.target) as HTMLElement | null;
  (target || document.body).dispatchEvent(
    new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId } })
  );
}

export class UltraIrrigationModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'irrigation',
    title: 'Irrigation',
    description:
      'Sprinkler and valve zones for any integration with timed runs, rain delay, and moisture',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:sprinkler-variant',
    category: 'interactive',
    tags: [
      'irrigation',
      'sprinkler',
      'garden',
      'lawn',
      'valve',
      'watering',
      'opensprinkler',
      'rachio',
      'interactive',
    ],
  };

  /** In-card run duration chosen with the stepper, keyed `${moduleId}:${zoneId}` (memory only). */
  private _durations = new Map<string, number>();
  /** Runs this browser started, keyed by entity id — only used to estimate countdowns. */
  private _requests = new Map<string, RunRequest>();
  /** Editor: expanded zone rows per module id. */
  private _expanded = new Map<string, Set<string>>();
  private _tick: ReturnType<typeof setInterval> | null = null;
  private _lastRunningAt = 0;

  createDefault(id?: string, _hass?: HomeAssistant): IrrigationModule {
    return {
      id: id || this.generateId('irrigation'),
      type: 'irrigation',
      title: '',
      show_title: true,
      zones: [],
      default_duration_minutes: DEFAULT_DURATION_MINUTES,
      layout: 'full',
      show_remaining: true,
      show_duration_control: true,
      run_all_mode: 'none',
      moisture_dry_threshold: DEFAULT_MOISTURE_DRY,
      moisture_wet_threshold: DEFAULT_MOISTURE_WET,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  /** Lenient: an empty zone list renders the empty state instead of an error. */
  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as IrrigationModule;
    const ids: string[] = [];
    for (const z of m.zones || []) {
      if (z.entity) ids.push(z.entity);
      if (z.moisture_entity) ids.push(z.moisture_entity);
      if (z.remaining_entity) ids.push(z.remaining_entity);
    }
    for (const eid of [
      m.master_entity,
      m.rain_delay_entity,
      m.rain_sensor_entity,
      m.next_run_entity,
      m.flow_entity,
      m.water_used_entity,
      m.run_all_entity,
    ]) {
      if (eid) ids.push(eid);
    }
    return ids;
  }

  destroy(): void {
    if (this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }

  // ── General tab ──────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as IrrigationModule;
    const lang = hass?.locale?.language || 'en';
    const zones = m.zones || [];
    const defaultMinutes = m.default_duration_minutes ?? DEFAULT_DURATION_MINUTES;

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this._editorStyles()}
      </style>
      <div class="module-general-settings">
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.irrigation.zones_section', lang, 'Zones')}
          </div>
          <div class="uc-irr-ed-desc">
            ${localize(
              'editor.irrigation.zones_section_desc',
              lang,
              'Pick the switch or valve entities for each sprinkler zone. Integration zones (OpenSprinkler, Rachio, Irrigation Unlimited, B-hyve) are detected automatically.'
            )}
          </div>

          ${this.renderChipListField(
            localize('editor.irrigation.zone_entities', lang, 'Zone entities'),
            localize(
              'editor.irrigation.zone_entities_desc',
              lang,
              'One entity per zone, shown in this order.'
            ),
            hass,
            zones.map(z => z.entity),
            (values: string[]) => {
              updateModule({ zones: reconcileZones(zones, values) });
              this.triggerPreviewUpdate();
            },
            { mode: 'entity', entityDomains: ZONE_ENTITY_DOMAINS, variant: 'primary' }
          )}
          ${zones.length === 0 ? this._renderSuggestions(m, hass, updateModule, lang) : nothing}

          ${this.renderSliderField(
            localize('editor.irrigation.default_duration', lang, 'Default run time'),
            localize(
              'editor.irrigation.default_duration_desc',
              lang,
              'Minutes per run for zones without their own run time. Home Assistant ends timed runs, so they finish even if this dashboard is closed.'
            ),
            defaultMinutes,
            DEFAULT_DURATION_MINUTES,
            1,
            240,
            1,
            (v: number) => {
              updateModule({ default_duration_minutes: v });
              this.triggerPreviewUpdate();
            },
            localize('editor.irrigation.unit_min', lang, ' min')
          )}

          ${zones.map((zone, index) =>
            this._renderZoneRow(m, zone, index, hass, config, updateModule, lang)
          )}
        </div>

        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderAdvancedSection(m, hass, config, updateModule, lang)}
      </div>
    `;
  }

  private _renderSuggestions(
    m: IrrigationModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const suggestions = suggestZoneEntities(hass);
    if (!suggestions.length) {
      return html`<div class="uc-irr-ed-empty">
        ${localize(
          'editor.irrigation.no_suggestions',
          lang,
          'No zone-like entities found. Add any switch or valve above.'
        )}
      </div>`;
    }
    return html`
      <div class="uc-irr-ed-suggest">
        <div class="uc-irr-ed-suggest-title">
          ${localize('editor.irrigation.suggestions', lang, 'Suggested zones')}
        </div>
        <div class="uc-irr-ed-suggest-list">
          ${suggestions.map(
            eid => html`<button
              type="button"
              class="uc-irr-ed-suggest-item"
              title=${eid}
              @click=${() => {
                updateModule({ zones: reconcileZones(m.zones || [], [...(m.zones || []).map(z => z.entity), eid]) });
                this.triggerPreviewUpdate();
              }}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              ${String(hass.states[eid]?.attributes?.friendly_name || eid)}
            </button>`
          )}
        </div>
        <button
          type="button"
          class="uc-irr-ed-btn"
          @click=${() => {
            updateModule({ zones: reconcileZones(m.zones || [], suggestions) });
            this.triggerPreviewUpdate();
          }}
        >
          <ha-icon icon="mdi:playlist-plus"></ha-icon>
          ${localize('editor.irrigation.add_all_suggested', lang, 'Add all suggested')}
        </button>
      </div>
    `;
  }

  private _patchZone(
    m: IrrigationModule,
    index: number,
    patch: Partial<IrrigationZone>,
    updateModule: UpdateFn
  ): void {
    const zones = (m.zones || []).map((z, i) => (i === index ? { ...z, ...patch } : z));
    updateModule({ zones });
    this.triggerPreviewUpdate();
  }

  private _moveZone(m: IrrigationModule, index: number, dir: -1 | 1, updateModule: UpdateFn): void {
    const zones = [...(m.zones || [])];
    const target = index + dir;
    const a = zones[index];
    const b = zones[target];
    if (!a || !b) return;
    zones[index] = b;
    zones[target] = a;
    updateModule({ zones });
    this.triggerPreviewUpdate();
  }

  private _removeZone(m: IrrigationModule, index: number, updateModule: UpdateFn): void {
    updateModule({ zones: (m.zones || []).filter((_, i) => i !== index) });
    this.triggerPreviewUpdate();
  }

  private _presetLabel(preset: IrrigationConcretePreset, lang: string): string {
    const [key, fallback] = PRESET_LABEL_KEYS[preset];
    return localize(key, lang, fallback);
  }

  private _planDescription(plan: IrrigationRunPlan, lang: string): string {
    const name = this._presetLabel(plan.preset, lang);
    if (plan.kind === 'custom') {
      return localize(
        'editor.irrigation.plan_custom',
        lang,
        'Runs your custom action with the chosen run time.'
      );
    }
    if (plan.kind === 'service') {
      return localize(
        'editor.irrigation.plan_service',
        lang,
        '{name}: runs for the chosen time and is stopped by Home Assistant.'
      ).replace('{name}', name);
    }
    if (plan.kind === 'toggle') {
      return localize(
        'editor.irrigation.plan_toggle',
        lang,
        '{name}: on/off only. For timed runs use Custom action (for example a script with a delay).'
      ).replace('{name}', name);
    }
    return localize(
      'editor.irrigation.plan_none',
      lang,
      'This entity cannot be switched directly. Choose Integration service or Custom action.'
    );
  }

  private _renderZoneRow(
    m: IrrigationModule,
    zone: IrrigationZone,
    index: number,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const zones = m.zones || [];
    let expandedSet = this._expanded.get(m.id);
    if (!expandedSet) {
      expandedSet = new Set<string>();
      this._expanded.set(m.id, expandedSet);
    }
    const expanded = expandedSet.has(zone.id);
    const set = expandedSet;
    const plan = resolveRunPlan(zone, hass);
    const runMode: IrrigationRunMode = zone.run_mode || 'auto';
    const defaultMinutes = m.default_duration_minutes ?? DEFAULT_DURATION_MINUTES;
    const friendly = String(hass?.states?.[zone.entity]?.attributes?.friendly_name || zone.entity);
    const label = zone.name || friendly;

    return html`
      <div class="uc-irr-ed-row ${expanded ? 'expanded' : ''}">
        <div class="uc-irr-ed-row-head">
          <ha-icon
            class="uc-irr-ed-row-icon"
            icon=${zone.icon || 'mdi:sprinkler-variant'}
            style=${zone.color ? `color:${zone.color}` : ''}
          ></ha-icon>
          <div class="uc-irr-ed-row-text">
            <div class="uc-irr-ed-row-name">${label}</div>
            <div class="uc-irr-ed-row-sub">${this._presetLabel(plan.preset, lang)}</div>
          </div>
          <button
            class="uc-irr-ed-icon-btn"
            type="button"
            ?disabled=${index === 0}
            title=${localize('editor.irrigation.move_up', lang, 'Move up')}
            aria-label=${localize('editor.irrigation.move_up', lang, 'Move up')}
            @click=${() => this._moveZone(m, index, -1, updateModule)}
          >
            <ha-icon icon="mdi:chevron-up"></ha-icon>
          </button>
          <button
            class="uc-irr-ed-icon-btn"
            type="button"
            ?disabled=${index === zones.length - 1}
            title=${localize('editor.irrigation.move_down', lang, 'Move down')}
            aria-label=${localize('editor.irrigation.move_down', lang, 'Move down')}
            @click=${() => this._moveZone(m, index, 1, updateModule)}
          >
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          <button
            class="uc-irr-ed-icon-btn ${expanded ? 'on' : ''}"
            type="button"
            title=${localize('editor.irrigation.edit_zone', lang, 'Edit zone')}
            aria-label=${localize('editor.irrigation.edit_zone', lang, 'Edit zone')}
            @click=${() => {
              if (expanded) set.delete(zone.id);
              else set.add(zone.id);
              this.triggerPreviewUpdate();
            }}
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button
            class="uc-irr-ed-icon-btn danger"
            type="button"
            title=${localize('editor.irrigation.remove_zone', lang, 'Remove zone')}
            aria-label=${localize('editor.irrigation.remove_zone', lang, 'Remove zone')}
            @click=${() => this._removeZone(m, index, updateModule)}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>

        ${expanded
          ? html`<div class="uc-irr-ed-row-body">
              ${this.renderFieldSection(
                localize('editor.irrigation.zone_name', lang, 'Name'),
                localize(
                  'editor.irrigation.zone_name_desc',
                  lang,
                  'Leave blank to use the entity name.'
                ),
                hass,
                { name: zone.name || '' },
                [this.textField('name')],
                (e: CustomEvent) =>
                  this._patchZone(m, index, { name: e.detail.value?.name || undefined }, updateModule)
              )}
              ${this.renderIconField(
                localize('editor.irrigation.zone_icon', lang, 'Icon'),
                '',
                hass,
                zone.icon || '',
                (v: string) => this._patchZone(m, index, { icon: v || undefined }, updateModule)
              )}
              ${this.renderColorField(
                localize('editor.irrigation.zone_color', lang, 'Color'),
                localize(
                  'editor.irrigation.zone_color_desc',
                  lang,
                  'Accent for this zone while it runs.'
                ),
                hass,
                zone.color || '',
                '',
                (v: string) => this._patchZone(m, index, { color: v || undefined }, updateModule)
              )}
              ${this.renderSliderField(
                localize('editor.irrigation.zone_duration', lang, 'Run time'),
                localize(
                  'editor.irrigation.zone_duration_desc',
                  lang,
                  'Minutes for this zone. Reset uses the default run time.'
                ),
                zone.duration_minutes ?? defaultMinutes,
                defaultMinutes,
                1,
                240,
                1,
                (v: number) =>
                  this._patchZone(
                    m,
                    index,
                    { duration_minutes: v === defaultMinutes ? undefined : v },
                    updateModule
                  ),
                localize('editor.irrigation.unit_min', lang, ' min')
              )}
              ${this.renderSegmentedField(
                localize('editor.irrigation.run_mode', lang, 'Run mode'),
                localize(
                  'editor.irrigation.run_mode_desc',
                  lang,
                  'How the Run button starts this zone.'
                ),
                runMode,
                [
                  { value: 'auto', label: localize('editor.irrigation.run_mode_auto', lang, 'Auto') },
                  {
                    value: 'toggle',
                    label: localize('editor.irrigation.run_mode_toggle', lang, 'On/off'),
                  },
                  {
                    value: 'service',
                    label: localize('editor.irrigation.run_mode_service', lang, 'Integration'),
                  },
                  {
                    value: 'custom',
                    label: localize('editor.irrigation.run_mode_custom', lang, 'Custom action'),
                  },
                ],
                next => {
                  const patch: Partial<IrrigationZone> = { run_mode: next as IrrigationRunMode };
                  if (next === 'custom' && !zone.custom_data) patch.custom_data = defaultCustomData();
                  this._patchZone(m, index, patch, updateModule);
                }
              )}
              <div class="uc-irr-ed-hint">${this._planDescription(plan, lang)}</div>
              ${runMode === 'service'
                ? this.renderSegmentedField(
                    localize('editor.irrigation.preset', lang, 'Integration'),
                    localize(
                      'editor.irrigation.preset_desc',
                      lang,
                      'Which integration service starts the timed run.'
                    ),
                    zone.preset || 'auto',
                    [
                      {
                        value: 'auto',
                        label: localize('editor.irrigation.preset_auto', lang, 'Auto-detect'),
                      },
                      { value: 'opensprinkler', label: this._presetLabel('opensprinkler', lang) },
                      { value: 'rachio', label: this._presetLabel('rachio', lang) },
                      {
                        value: 'irrigation_unlimited',
                        label: this._presetLabel('irrigation_unlimited', lang),
                      },
                      { value: 'bhyve', label: this._presetLabel('bhyve', lang) },
                      { value: 'valve', label: this._presetLabel('valve', lang) },
                    ],
                    next =>
                      this._patchZone(
                        m,
                        index,
                        { preset: next as IrrigationServicePreset },
                        updateModule
                      ),
                    3
                  )
                : nothing}
              ${runMode === 'custom' ? this._renderCustomAction(m, zone, index, hass, updateModule, lang) : nothing}
              ${this.renderConditionalFieldsGroup(
                localize('editor.irrigation.zone_sensors', lang, 'Zone sensors'),
                html`
                  ${this.renderEntityPickerWithVariables(
                    hass,
                    config,
                    'moisture_entity',
                    zone.moisture_entity || '',
                    (v: string) =>
                      this._patchZone(m, index, { moisture_entity: v || undefined }, updateModule),
                    ['sensor', 'number', 'input_number'],
                    localize('editor.irrigation.moisture_entity', lang, 'Soil moisture sensor')
                  )}
                  ${this.renderEntityPickerWithVariables(
                    hass,
                    config,
                    'remaining_entity',
                    zone.remaining_entity || '',
                    (v: string) =>
                      this._patchZone(m, index, { remaining_entity: v || undefined }, updateModule),
                    ['sensor'],
                    localize('editor.irrigation.remaining_entity', lang, 'Remaining time sensor')
                  )}
                  <div class="uc-irr-ed-hint">
                    ${localize(
                      'editor.irrigation.remaining_entity_desc',
                      lang,
                      'Optional. Most integrations expose remaining time on the zone itself; otherwise the card shows an estimate.'
                    )}
                  </div>
                `
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderCustomAction(
    m: IrrigationModule,
    zone: IrrigationZone,
    index: number,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    return this.renderConditionalFieldsGroup(
      localize('editor.irrigation.custom_action', lang, 'Custom action'),
      html`
        ${this.renderFieldSection(
          localize('editor.irrigation.custom_service', lang, 'Start service'),
          localize(
            'editor.irrigation.custom_service_desc',
            lang,
            'domain.service, for example script.water_zone or esphome.sprinkler_start_single_valve.'
          ),
          hass,
          { custom_service: zone.custom_service || '' },
          [this.textField('custom_service')],
          (e: CustomEvent) =>
            this._patchZone(
              m,
              index,
              { custom_service: e.detail.value?.custom_service || undefined },
              updateModule
            )
        )}
        ${this.renderFieldSection(
          localize('editor.irrigation.custom_data', lang, 'Start data'),
          localize(
            'editor.irrigation.custom_data_desc',
            lang,
            'Placeholders: {{ entity_id }}, {{ duration }} (minutes), {{ duration_seconds }}, {{ duration_hms }}.'
          ),
          hass,
          { custom_data: zone.custom_data || {} },
          [{ name: 'custom_data', selector: { object: {} } }],
          (e: CustomEvent) => {
            const v = e.detail.value?.custom_data;
            this._patchZone(
              m,
              index,
              { custom_data: v && typeof v === 'object' && !Array.isArray(v) ? v : undefined },
              updateModule
            );
          }
        )}
        ${this.renderFieldSection(
          localize('editor.irrigation.custom_stop_service', lang, 'Stop service'),
          localize(
            'editor.irrigation.custom_stop_service_desc',
            lang,
            'Optional. Leave blank to turn the zone entity off.'
          ),
          hass,
          { custom_stop_service: zone.custom_stop_service || '' },
          [this.textField('custom_stop_service')],
          (e: CustomEvent) =>
            this._patchZone(
              m,
              index,
              { custom_stop_service: e.detail.value?.custom_stop_service || undefined },
              updateModule
            )
        )}
      `
    );
  }

  private _renderDisplaySection(
    m: IrrigationModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    return html`
      ${this.renderSettingsSection(
        localize('editor.irrigation.display_section', lang, 'Display'),
        localize('editor.irrigation.display_section_desc', lang, 'Title and what each row shows.'),
        [
          {
            title: localize('editor.irrigation.show_title', lang, 'Show title'),
            description: '',
            hass,
            data: { show_title: m.show_title !== false },
            schema: [this.booleanField('show_title')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_title: e.detail.value?.show_title !== false });
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.irrigation.title', lang, 'Title'),
            description: localize(
              'editor.irrigation.title_desc',
              lang,
              'Leave blank for "Irrigation".'
            ),
            hass,
            data: { title: m.title || '' },
            schema: [this.textField('title')],
            onChange: (e: CustomEvent) => {
              updateModule({ title: e.detail.value?.title || '' });
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.irrigation.show_remaining', lang, 'Show remaining time'),
            description: '',
            hass,
            data: { show_remaining: m.show_remaining !== false },
            schema: [this.booleanField('show_remaining')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_remaining: e.detail.value?.show_remaining !== false });
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.irrigation.show_duration_control', lang, 'Run time stepper'),
            description: localize(
              'editor.irrigation.show_duration_control_desc',
              lang,
              'Lets you change the run time on the card before starting a timed zone.'
            ),
            hass,
            data: { show_duration_control: m.show_duration_control !== false },
            schema: [this.booleanField('show_duration_control')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_duration_control: e.detail.value?.show_duration_control !== false,
              });
              this.triggerPreviewUpdate();
            },
          },
        ]
      )}
      ${this.renderSegmentedField(
        localize('editor.irrigation.layout', lang, 'Layout'),
        localize('editor.irrigation.layout_desc', lang, 'Full rows or a compact list.'),
        m.layout || 'full',
        [
          {
            value: 'full',
            label: localize('editor.irrigation.layout_full', lang, 'Full'),
            icon: 'mdi:view-agenda-outline',
          },
          {
            value: 'compact',
            label: localize('editor.irrigation.layout_compact', lang, 'Compact'),
            icon: 'mdi:view-list-outline',
          },
        ],
        next => {
          updateModule({ layout: next as IrrigationLayout });
          this.triggerPreviewUpdate();
        },
        2
      )}
      ${this.renderColorField(
        localize('editor.irrigation.accent_color', lang, 'Accent color'),
        localize(
          'editor.irrigation.accent_color_desc',
          lang,
          'Used for running zones and buttons. Defaults to the theme primary color.'
        ),
        hass,
        m.accent_color || '',
        '',
        (v: string) => {
          updateModule({ accent_color: v || undefined });
          this.triggerPreviewUpdate();
        }
      )}
    `;
  }

  private _picker(
    hass: HomeAssistant,
    config: UltraCardConfig,
    key: keyof IrrigationModule,
    value: string | undefined,
    label: string,
    updateModule: UpdateFn,
    domains: string[]
  ): TemplateResult {
    return this.renderEntityPickerWithVariables(
      hass,
      config,
      key as string,
      value || '',
      (v: string) => {
        updateModule({ [key]: v || undefined } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
      domains,
      label
    );
  }

  private _renderAdvancedSection(
    m: IrrigationModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const runAllMode: IrrigationRunAllMode = m.run_all_mode || 'none';
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.irrigation.advanced_section', lang, 'Advanced')}
        </div>
        <div class="uc-irr-ed-desc">
          ${localize(
            'editor.irrigation.advanced_section_desc',
            lang,
            'All optional. Anything you leave empty is simply not shown.'
          )}
        </div>

        ${this.renderConditionalFieldsGroup(
          localize('editor.irrigation.system_group', lang, 'System'),
          html`
            ${this._picker(
              hass,
              config,
              'master_entity',
              m.master_entity,
              localize('editor.irrigation.master_entity', lang, 'Master valve / pump'),
              updateModule,
              ['switch', 'valve', 'input_boolean']
            )}
            ${this._picker(
              hass,
              config,
              'rain_delay_entity',
              m.rain_delay_entity,
              localize('editor.irrigation.rain_delay_entity', lang, 'Rain delay'),
              updateModule,
              ['switch', 'input_boolean', 'number', 'input_number', 'select', 'input_select', 'sensor', 'binary_sensor']
            )}
            <div class="uc-irr-ed-hint">
              ${localize(
                'editor.irrigation.rain_delay_desc',
                lang,
                'A switch toggles the delay, a number is set in hours (Off / 24 / 48 / 72 h), a select shows its options.'
              )}
            </div>
            ${this._picker(
              hass,
              config,
              'rain_sensor_entity',
              m.rain_sensor_entity,
              localize('editor.irrigation.rain_sensor_entity', lang, 'Rain sensor / skip indicator'),
              updateModule,
              ['binary_sensor', 'sensor', 'input_boolean', 'switch']
            )}
            ${this._picker(
              hass,
              config,
              'next_run_entity',
              m.next_run_entity,
              localize('editor.irrigation.next_run_entity', lang, 'Next scheduled run'),
              updateModule,
              ['sensor', 'input_datetime', 'calendar']
            )}
          `
        )}

        ${this.renderConditionalFieldsGroup(
          localize('editor.irrigation.water_group', lang, 'Water use'),
          html`
            ${this._picker(
              hass,
              config,
              'flow_entity',
              m.flow_entity,
              localize('editor.irrigation.flow_entity', lang, 'Flow rate sensor'),
              updateModule,
              ['sensor']
            )}
            ${this._picker(
              hass,
              config,
              'water_used_entity',
              m.water_used_entity,
              localize('editor.irrigation.water_used_entity', lang, 'Water used today'),
              updateModule,
              ['sensor']
            )}
            <div class="uc-irr-ed-hint">
              ${localize(
                'editor.irrigation.water_used_desc',
                lang,
                'Tip: point this at a daily utility meter on your water meter.'
              )}
            </div>
          `
        )}

        ${this.renderConditionalFieldsGroup(
          localize('editor.irrigation.moisture_group', lang, 'Soil moisture'),
          html`
            ${this.renderSliderField(
              localize('editor.irrigation.moisture_dry', lang, 'Dry below'),
              '',
              m.moisture_dry_threshold ?? DEFAULT_MOISTURE_DRY,
              DEFAULT_MOISTURE_DRY,
              0,
              100,
              1,
              (v: number) => {
                updateModule({ moisture_dry_threshold: v });
                this.triggerPreviewUpdate();
              },
              '%'
            )}
            ${this.renderSliderField(
              localize('editor.irrigation.moisture_wet', lang, 'Wet above'),
              '',
              m.moisture_wet_threshold ?? DEFAULT_MOISTURE_WET,
              DEFAULT_MOISTURE_WET,
              0,
              100,
              1,
              (v: number) => {
                updateModule({ moisture_wet_threshold: v });
                this.triggerPreviewUpdate();
              },
              '%'
            )}
          `
        )}

        ${this.renderConditionalFieldsGroup(
          localize('editor.irrigation.run_all_group', lang, 'Run all zones'),
          html`
            ${this.renderSegmentedField(
              localize('editor.irrigation.run_all_mode', lang, 'Run all'),
              localize(
                'editor.irrigation.run_all_mode_desc',
                lang,
                'Runs through a script or an integration service so the sequence keeps going in Home Assistant.'
              ),
              runAllMode,
              [
                { value: 'none', label: localize('editor.irrigation.run_all_none', lang, 'Off') },
                {
                  value: 'script',
                  label: localize('editor.irrigation.run_all_script', lang, 'Script'),
                },
                {
                  value: 'service',
                  label: localize('editor.irrigation.run_all_service', lang, 'Service'),
                },
              ],
              next => {
                updateModule({ run_all_mode: next as IrrigationRunAllMode });
                this.triggerPreviewUpdate();
              },
              3
            )}
            ${runAllMode === 'script'
              ? this._picker(
                  hass,
                  config,
                  'run_all_entity',
                  m.run_all_entity,
                  localize('editor.irrigation.run_all_entity', lang, 'Script'),
                  updateModule,
                  ['script']
                )
              : nothing}
            ${runAllMode === 'service'
              ? html`
                  ${this.renderFieldSection(
                    localize('editor.irrigation.run_all_service_field', lang, 'Service'),
                    localize(
                      'editor.irrigation.run_all_service_desc',
                      lang,
                      'domain.service, for example rachio.start_multiple_zone_schedule or opensprinkler.run_program.'
                    ),
                    hass,
                    { run_all_service: m.run_all_service || '' },
                    [this.textField('run_all_service')],
                    (e: CustomEvent) => {
                      updateModule({ run_all_service: e.detail.value?.run_all_service || undefined });
                      this.triggerPreviewUpdate();
                    }
                  )}
                  ${this.renderFieldSection(
                    localize('editor.irrigation.run_all_data', lang, 'Service data'),
                    localize(
                      'editor.irrigation.run_all_data_desc',
                      lang,
                      'Placeholders: {{ duration }} (default minutes), {{ duration_seconds }}, {{ duration_hms }}.'
                    ),
                    hass,
                    { run_all_data: m.run_all_data || {} },
                    [{ name: 'run_all_data', selector: { object: {} } }],
                    (e: CustomEvent) => {
                      const v = e.detail.value?.run_all_data;
                      updateModule({
                        run_all_data: v && typeof v === 'object' && !Array.isArray(v) ? v : undefined,
                      });
                      this.triggerPreviewUpdate();
                    }
                  )}
                `
              : nothing}
            ${runAllMode === 'script'
              ? html`<div class="uc-irr-ed-hint">
                  ${localize(
                    'editor.irrigation.run_all_script_desc',
                    lang,
                    'The script receives duration (minutes) and duration_seconds as variables.'
                  )}
                </div>`
              : nothing}
          `
        )}
      </div>
    `;
  }

  // ── Preview ──────────────────────────────────────────────────────────────

  private _call(e: Event, hass: HomeAssistant, call: IrrigationServiceCall | null): void {
    e.stopPropagation();
    if (!call || !hass?.callService) return;
    const target = (e.currentTarget || e.target) as HTMLElement | null;
    Promise.resolve(hass.callService(call.domain, call.service, call.data))
      .catch((error: unknown) => {
        (target || document.body).dispatchEvent(
          new CustomEvent('hass-notification', {
            bubbles: true,
            composed: true,
            detail: { message: `${call.domain}.${call.service}: ${String(error)}` },
          })
        );
      })
      .then(() => this.triggerPreviewUpdate(true));
  }

  private _durationKey(m: IrrigationModule, zone: IrrigationZone): string {
    return `${m.id}:${zone.id}`;
  }

  private _zoneMinutes(m: IrrigationModule, zone: IrrigationZone): number {
    return (
      this._durations.get(this._durationKey(m, zone)) ??
      zone.duration_minutes ??
      m.default_duration_minutes ??
      DEFAULT_DURATION_MINUTES
    );
  }

  private _buildZoneView(
    m: IrrigationModule,
    zone: IrrigationZone,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    now: number
  ): ZoneView {
    const entityId = this.resolveEntity(zone.entity, config) || zone.entity || '';
    const st = entityId ? hass.states[entityId] : undefined;
    const resolvedZone = entityId === zone.entity ? zone : { ...zone, entity: entityId };
    const plan = resolveRunPlan(resolvedZone, hass);
    const status = zoneStatus(st);
    const minutes = this._zoneMinutes(m, zone);

    const request = this._requests.get(entityId);
    if (request && status !== 'running' && status !== 'queued') {
      // Forget a finished run once the entity has settled after our request.
      const changed = st?.last_changed ? Date.parse(st.last_changed) : NaN;
      if (Number.isFinite(changed) && changed > request.requestedAt + 5000) {
        this._requests.delete(entityId);
      }
    }

    let remaining: number | null = null;
    let estimated = false;
    let progress: number | null = null;
    if (status === 'running') {
      const sensorId = this.resolveEntity(zone.remaining_entity, config);
      remaining =
        remainingFromSensor(sensorId ? hass.states[sensorId] : undefined, now) ??
        remainingFromAttributes(st?.attributes, now);
      const live = this._requests.get(entityId);
      if (remaining === null) {
        remaining = estimateRemaining(live, st?.last_changed, now);
        estimated = remaining !== null;
      }
      if (remaining !== null && live && live.durationSeconds > 0) {
        progress = Math.min(1, Math.max(0, 1 - remaining / live.durationSeconds));
      }
    }

    const moistureId = this.resolveEntity(zone.moisture_entity, config);
    const moisture = numState(hass, moistureId);

    return {
      zone: resolvedZone,
      entityId,
      name:
        zone.name ||
        String(st?.attributes?.friendly_name || '') ||
        (entityId.split('.')[1] || '').replace(/_/g, ' ') ||
        'Zone',
      icon: zone.icon || String(st?.attributes?.icon || '') || 'mdi:sprinkler-variant',
      color: zone.color || '',
      status,
      plan,
      minutes,
      remaining,
      estimated,
      elapsed: status === 'running' ? elapsedSince(st?.last_changed, now) : null,
      progress,
      moisture,
    };
  }

  private _syncTick(anyRunning: boolean): void {
    if (!anyRunning) return;
    this._lastRunningAt = Date.now();
    if (this._tick) return;
    this._tick = setInterval(() => {
      // Stop ticking a few seconds after the last render that saw a running zone.
      if (Date.now() - this._lastRunningAt > 5000) {
        this.destroy();
        return;
      }
      this.triggerPreviewUpdate(false, true);
    }, 1000);
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as IrrigationModule;
    const lang = hass?.locale?.language || 'en';
    const zones = (m.zones || []).filter(z => z && z.entity);

    if (!zones.length) {
      const found = hass?.states ? suggestZoneEntities(hass).length : 0;
      return html`
        <div class="uc-irr-empty">
          ${this.renderGradientErrorState(
            localize('editor.irrigation.empty_title', lang, 'Add your irrigation zones'),
            found > 0
              ? localize(
                  'editor.irrigation.empty_desc_found',
                  lang,
                  '{count} likely zones found. Add them in the General tab.'
                ).replace('{count}', String(found))
              : localize(
                  'editor.irrigation.empty_desc',
                  lang,
                  'Pick switch or valve entities for your sprinkler zones in the General tab.'
                ),
            'mdi:sprinkler-variant'
          )}
        </div>
      `;
    }

    const now = Date.now();
    const views = hass?.states
      ? zones.map(z => this._buildZoneView(m, z, hass, config, now))
      : [];
    this._syncTick(views.some(v => v.status === 'running'));

    const compact = (m.layout || 'full') === 'compact';
    const accent = m.accent_color ? `--uc-irr-accent:${m.accent_color};` : '';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const title = m.title?.trim() || localize('editor.irrigation.default_title', lang, 'Irrigation');
    const runAll = buildRunAllCall(m, m.default_duration_minutes ?? DEFAULT_DURATION_MINUTES);

    return html`
      <div
        class="uc-irr ${compact ? 'compact' : 'full'} ${hoverClass}"
        data-uc-role="pane"
        style="${accent}${designStyles}"
      >
        ${this.wrapWithAnimation(
          html`
            ${m.show_title !== false || runAll
              ? html`<div class="uc-irr-head">
                  ${m.show_title !== false
                    ? html`<div class="uc-irr-title">
                        <ha-icon icon="mdi:sprinkler-variant"></ha-icon>
                        <span>${title}</span>
                      </div>`
                    : html`<span></span>`}
                  ${runAll
                    ? html`<button
                        type="button"
                        class="uc-irr-btn uc-irr-runall"
                        @click=${(e: Event) => this._call(e, hass, runAll)}
                      >
                        <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                        ${localize('editor.irrigation.run_all', lang, 'Run all')}
                      </button>`
                    : nothing}
                </div>`
              : nothing}
            ${this._renderStatusStrip(m, hass, config, lang)}
            <div class="uc-irr-zones">
              ${views.map(v => this._renderZone(m, v, hass, lang, compact))}
            </div>
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  private _renderStatusStrip(
    m: IrrigationModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string
  ): TemplateResult | typeof nothing {
    if (!hass?.states) return nothing;
    const chips: TemplateResult[] = [];

    const master = this.resolveEntity(m.master_entity, config);
    if (master && hass.states[master]) {
      const st = hass.states[master];
      const on = zoneStatus(st) === 'running';
      const domain = entityDomain(master);
      const call: IrrigationServiceCall =
        domain === 'valve'
          ? { domain: 'valve', service: on ? 'close_valve' : 'open_valve', data: { entity_id: master } }
          : { domain: 'homeassistant', service: on ? 'turn_off' : 'turn_on', data: { entity_id: master } };
      chips.push(html`<button
        type="button"
        class="uc-irr-chip ${on ? 'active' : ''}"
        aria-pressed=${on ? 'true' : 'false'}
        @click=${(e: Event) => this._call(e, hass, call)}
      >
        <ha-icon icon=${on ? 'mdi:pump' : 'mdi:pump-off'}></ha-icon>
        <span
          >${localize('editor.irrigation.master', lang, 'Master')}:
          ${on
            ? localize('editor.irrigation.state_on', lang, 'On')
            : localize('editor.irrigation.state_off', lang, 'Off')}</span
        >
      </button>`);
    }

    const rainSensor = this.resolveEntity(m.rain_sensor_entity, config);
    if (rainSensor && hass.states[rainSensor]) {
      const active = isRainSensorActive(hass.states[rainSensor]);
      chips.push(html`<button
        type="button"
        class="uc-irr-chip ${active ? 'warn' : ''}"
        @click=${(e: Event) => fireMoreInfo(e, rainSensor)}
      >
        <ha-icon icon=${active ? 'mdi:weather-pouring' : 'mdi:weather-partly-cloudy'}></ha-icon>
        <span
          >${active
            ? localize('editor.irrigation.rain_active', lang, 'Rain: skipping')
            : localize('editor.irrigation.rain_clear', lang, 'No rain')}</span
        >
      </button>`);
    }

    const nextRun = this.resolveEntity(m.next_run_entity, config);
    if (nextRun && hass.states[nextRun]) {
      chips.push(html`<button
        type="button"
        class="uc-irr-chip"
        @click=${(e: Event) => fireMoreInfo(e, nextRun)}
      >
        <ha-icon icon="mdi:calendar-clock"></ha-icon>
        <span
          >${localize('editor.irrigation.next_run', lang, 'Next')}:
          ${this._formatNextRun(hass, nextRun, lang)}</span
        >
      </button>`);
    }

    const flow = this.resolveEntity(m.flow_entity, config);
    if (flow && hass.states[flow]) {
      chips.push(html`<button
        type="button"
        class="uc-irr-chip"
        @click=${(e: Event) => fireMoreInfo(e, flow)}
      >
        <ha-icon icon="mdi:waves-arrow-right"></ha-icon>
        <span>${this._formatValue(hass, flow)}</span>
      </button>`);
    }

    const used = this.resolveEntity(m.water_used_entity, config);
    if (used && hass.states[used]) {
      chips.push(html`<button
        type="button"
        class="uc-irr-chip"
        @click=${(e: Event) => fireMoreInfo(e, used)}
      >
        <ha-icon icon="mdi:water"></ha-icon>
        <span
          >${localize('editor.irrigation.water_today', lang, 'Today')}:
          ${this._formatValue(hass, used)}</span
        >
      </button>`);
    }

    const rainDelay = this._renderRainDelay(m, hass, config, lang);
    if (!chips.length && rainDelay === nothing) return nothing;
    return html`
      <div class="uc-irr-strip">${chips}</div>
      ${rainDelay}
    `;
  }

  private _renderRainDelay(
    m: IrrigationModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string
  ): TemplateResult | typeof nothing {
    const eid = this.resolveEntity(m.rain_delay_entity, config);
    const st = eid ? hass.states[eid] : undefined;
    if (!eid || !st) return nothing;
    const kind = rainDelayKind(eid);
    const active = isRainDelayActive(eid, st);
    const label = localize('editor.irrigation.rain_delay', lang, 'Rain delay');

    let controls: TemplateResult;
    if (kind === 'toggle') {
      controls = html`<button
        type="button"
        class="uc-irr-seg ${active ? 'on' : ''}"
        aria-pressed=${active ? 'true' : 'false'}
        @click=${(e: Event) => this._call(e, hass, buildRainDelayCall(eid, st, active ? 0 : 24))}
      >
        ${active
          ? localize('editor.irrigation.state_on', lang, 'On')
          : localize('editor.irrigation.state_off', lang, 'Off')}
      </button>`;
    } else if (kind === 'number') {
      const current = Number(st.state);
      controls = html`${[0, ...RAIN_DELAY_HOURS].map(
        h => html`<button
          type="button"
          class="uc-irr-seg ${current === h ? 'on' : ''}"
          aria-pressed=${current === h ? 'true' : 'false'}
          @click=${(e: Event) => this._call(e, hass, buildRainDelayCall(eid, st, h))}
        >
          ${h === 0 ? localize('editor.irrigation.state_off', lang, 'Off') : `${h}h`}
        </button>`
      )}`;
    } else if (kind === 'select') {
      const options = Array.isArray(st.attributes?.options)
        ? (st.attributes.options as unknown[]).map(o => String(o)).slice(0, 6)
        : [];
      controls = html`${options.map(
        opt => html`<button
          type="button"
          class="uc-irr-seg ${st.state === opt ? 'on' : ''}"
          aria-pressed=${st.state === opt ? 'true' : 'false'}
          @click=${(e: Event) => this._call(e, hass, buildSelectOptionCall(eid, opt))}
        >
          ${opt}
        </button>`
      )}`;
    } else {
      controls = html`<span class="uc-irr-delay-state">${this._formatValue(hass, eid)}</span>`;
    }

    return html`<div class="uc-irr-delay ${active ? 'active' : ''}">
      <button
        type="button"
        class="uc-irr-delay-label"
        @click=${(e: Event) => fireMoreInfo(e, eid)}
      >
        <ha-icon icon=${active ? 'mdi:weather-rainy' : 'mdi:umbrella-closed-outline'}></ha-icon>
        <span>${label}</span>
      </button>
      <div class="uc-irr-delay-controls">${controls}</div>
    </div>`;
  }

  private _formatValue(hass: HomeAssistant, entityId: string): string {
    const st = hass.states[entityId];
    if (!st) return '—';
    const unit = unitOf(hass, entityId);
    const n = Number(st.state);
    const value = Number.isFinite(n) ? String(Math.round(n * 10) / 10) : st.state;
    return unit ? `${value} ${unit}` : value;
  }

  private _formatNextRun(hass: HomeAssistant, entityId: string, lang: string): string {
    const st = hass.states[entityId];
    if (!st) return '—';
    const raw = String(st.state || '');
    const attrStart = st.attributes?.start_time;
    const candidate =
      /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw : typeof attrStart === 'string' ? attrStart : '';
    const t = candidate ? Date.parse(candidate) : NaN;
    if (!Number.isFinite(t)) return this._formatValue(hass, entityId);
    try {
      return new Date(t).toLocaleString(lang, {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return new Date(t).toLocaleString();
    }
  }

  private _statusText(v: ZoneView, m: IrrigationModule, lang: string): string {
    if (v.status === 'unavailable') {
      return localize('editor.irrigation.status_unavailable', lang, 'Unavailable');
    }
    if (v.status === 'queued') return localize('editor.irrigation.status_queued', lang, 'Queued');
    if (v.status === 'running') {
      const running = localize('editor.irrigation.status_running', lang, 'Running');
      if (m.show_remaining === false) return running;
      if (v.remaining !== null) {
        const left = localize('editor.irrigation.time_left', lang, '{time} left').replace(
          '{time}',
          formatCountdown(v.remaining)
        );
        return v.estimated
          ? `${running} · ${left} (${localize('editor.irrigation.estimate', lang, 'est.')})`
          : `${running} · ${left}`;
      }
      if (v.elapsed !== null) {
        return `${running} · ${localize('editor.irrigation.time_elapsed', lang, 'for {time}').replace(
          '{time}',
          formatCountdown(v.elapsed)
        )}`;
      }
      return running;
    }
    const idle = localize('editor.irrigation.status_idle', lang, 'Idle');
    return v.plan.timed
      ? `${idle} · ${v.minutes} ${localize('editor.irrigation.unit_min_short', lang, 'min')}`
      : idle;
  }

  private _renderZone(
    m: IrrigationModule,
    v: ZoneView,
    hass: HomeAssistant,
    lang: string,
    compact: boolean
  ): TemplateResult {
    const running = v.status === 'running' || v.status === 'queued';
    const canControl = v.plan.kind !== 'none' && v.status !== 'unavailable';
    const startCall = buildStartCall(v.zone, v.plan, v.minutes);
    const stopCall = buildStopCall(v.zone, v.plan);
    const showStepper =
      !compact && m.show_duration_control !== false && v.plan.timed && !running && canControl;
    const dry = m.moisture_dry_threshold ?? DEFAULT_MOISTURE_DRY;
    const wet = m.moisture_wet_threshold ?? DEFAULT_MOISTURE_WET;
    const zoneStyle = v.color ? `--uc-irr-zone:${v.color};` : '';
    const runLabel = running
      ? localize('editor.irrigation.stop', lang, 'Stop')
      : localize('editor.irrigation.run', lang, 'Run');

    const onRun = (e: Event) => {
      if (running) {
        this._call(e, hass, stopCall);
        return;
      }
      if (v.plan.timed) {
        this._requests.set(v.entityId, {
          durationSeconds: Math.round(v.minutes * 60),
          requestedAt: Date.now(),
        });
      }
      this._call(e, hass, startCall);
    };

    const stepTo = (e: Event, dir: 1 | -1) => {
      e.stopPropagation();
      this._durations.set(this._durationKey(m, v.zone), stepDuration(v.minutes, dir));
      this.triggerPreviewUpdate(true, true);
    };

    const moisture =
      v.moisture !== null
        ? (() => {
            const band = moistureBand(v.moisture, dry, wet);
            const pct = Math.max(0, Math.min(100, v.moisture));
            const bandLabel =
              band === 'dry'
                ? localize('editor.irrigation.moisture_dry_label', lang, 'Dry')
                : band === 'wet'
                  ? localize('editor.irrigation.moisture_wet_label', lang, 'Wet')
                  : localize('editor.irrigation.moisture_ok_label', lang, 'OK');
            if (compact) {
              return html`<span class="uc-irr-moist-text ${band}">${Math.round(pct)}%</span>`;
            }
            return html`<div
              class="uc-irr-moist ${band}"
              role="meter"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${String(Math.round(pct))}
              aria-label=${localize('editor.irrigation.moisture', lang, 'Soil moisture')}
              @click=${(e: Event) => fireMoreInfo(e, this.resolveEntity(v.zone.moisture_entity))}
            >
              <div class="uc-irr-moist-track">
                <div class="uc-irr-moist-mark" style="left:${Math.min(dry, wet)}%"></div>
                <div class="uc-irr-moist-mark" style="left:${Math.max(dry, wet)}%"></div>
                <div class="uc-irr-moist-fill" style="width:${pct}%"></div>
              </div>
              <span class="uc-irr-moist-text">${Math.round(pct)}% · ${bandLabel}</span>
            </div>`;
          })()
        : nothing;

    return html`
      <div
        class="uc-irr-zone status-${v.status} ${compact ? 'compact' : ''}"
        style=${zoneStyle}
      >
        <button
          type="button"
          class="uc-irr-zone-icon"
          aria-label=${v.name}
          @click=${(e: Event) => fireMoreInfo(e, v.entityId)}
        >
          <ha-icon icon=${v.icon}></ha-icon>
        </button>
        <div class="uc-irr-zone-main">
          <div class="uc-irr-zone-name">${v.name}</div>
          <div class="uc-irr-zone-sub">${this._statusText(v, m, lang)}</div>
          ${v.progress !== null && !compact
            ? html`<div class="uc-irr-progress">
                <div class="uc-irr-progress-fill" style="width:${Math.round(v.progress * 100)}%"></div>
              </div>`
            : nothing}
          ${compact ? nothing : moisture}
        </div>
        ${compact ? moisture : nothing}
        ${showStepper
          ? html`<div class="uc-irr-stepper">
              <button
                type="button"
                class="uc-irr-step"
                aria-label=${localize('editor.irrigation.less_time', lang, 'Less time')}
                @click=${(e: Event) => stepTo(e, -1)}
              >
                <ha-icon icon="mdi:minus"></ha-icon>
              </button>
              <span class="uc-irr-step-value"
                >${v.minutes}<small
                  >${localize('editor.irrigation.unit_min_short', lang, 'min')}</small
                ></span
              >
              <button
                type="button"
                class="uc-irr-step"
                aria-label=${localize('editor.irrigation.more_time', lang, 'More time')}
                @click=${(e: Event) => stepTo(e, 1)}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>`
          : nothing}
        <button
          type="button"
          class="uc-irr-run ${running ? 'stop' : ''}"
          ?disabled=${!canControl || !(running ? stopCall : startCall)}
          aria-label="${runLabel} ${v.name}"
          title=${runLabel}
          @click=${onRun}
        >
          <ha-icon icon=${running ? 'mdi:stop' : 'mdi:play'}></ha-icon>
        </button>
      </div>
    `;
  }

  // ── Styles ───────────────────────────────────────────────────────────────

  private _editorStyles(): string {
    return `
      .uc-irr-ed-desc { font-size: 13px; opacity: 0.8; margin-bottom: 12px; }
      .uc-irr-ed-hint { font-size: 12px; opacity: 0.75; margin: -8px 0 16px; line-height: 1.4; }
      .uc-irr-ed-empty { font-size: 13px; opacity: 0.75; margin: 0 0 16px; }
      .uc-irr-ed-suggest {
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
      }
      .uc-irr-ed-suggest-title { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
      .uc-irr-ed-suggest-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
      .uc-irr-ed-suggest-item, .uc-irr-ed-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        min-height: 36px;
        padding: 4px 12px;
        border-radius: 18px;
        border: 1px solid var(--divider-color);
        background: var(--uc-pane-bg, var(--card-background-color));
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .uc-irr-ed-btn {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 14%, transparent);
        font-weight: 600;
      }
      .uc-irr-ed-suggest-item ha-icon, .uc-irr-ed-btn ha-icon { --mdc-icon-size: 16px; }
      .uc-irr-ed-row {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 8px;
        background: var(--uc-pane-bg, var(--card-background-color));
      }
      .uc-irr-ed-row.expanded { border-color: var(--primary-color); }
      .uc-irr-ed-row-head { display: flex; align-items: center; gap: 6px; padding: 6px 8px; }
      .uc-irr-ed-row-icon { --mdc-icon-size: 22px; color: var(--primary-color); flex-shrink: 0; }
      .uc-irr-ed-row-text { flex: 1; min-width: 0; }
      .uc-irr-ed-row-name {
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-irr-ed-row-sub { font-size: 12px; opacity: 0.7; }
      .uc-irr-ed-icon-btn {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--primary-text-color);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .uc-irr-ed-icon-btn:hover { background: var(--secondary-background-color); }
      .uc-irr-ed-icon-btn:disabled { opacity: 0.3; cursor: default; }
      .uc-irr-ed-icon-btn.on { color: var(--primary-color); }
      .uc-irr-ed-icon-btn.danger { color: var(--error-color, #db4437); }
      .uc-irr-ed-icon-btn ha-icon { --mdc-icon-size: 20px; }
      .uc-irr-ed-row-body { padding: 8px 12px 4px; border-top: 1px solid var(--divider-color); }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }

  getStyles(): string {
    return `
      .uc-irr {
        --uc-irr-accent-resolved: var(--uc-irr-accent, var(--primary-color));
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: var(--uc-r-12, 12px);
        background: var(--uc-pane-bg, var(--card-background-color));
        color: var(--primary-text-color);
      }
      .uc-irr.compact { gap: 6px; padding: 10px; }
      .uc-irr button { font: inherit; }
      .uc-irr-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .uc-irr-title { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 16px; min-width: 0; }
      .uc-irr-title ha-icon { color: var(--uc-irr-accent-resolved); --mdc-icon-size: 22px; flex-shrink: 0; }
      .uc-irr-title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .uc-irr-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 14px;
        border-radius: 22px;
        border: 1px solid var(--uc-irr-accent-resolved);
        background: color-mix(in srgb, var(--uc-irr-accent-resolved) 14%, transparent);
        color: var(--primary-text-color);
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
      }
      .uc-irr-btn ha-icon { --mdc-icon-size: 20px; color: var(--uc-irr-accent-resolved); }
      .uc-irr-strip { display: flex; flex-wrap: wrap; gap: 6px; }
      .uc-irr-strip:empty { display: none; }
      .uc-irr-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 36px;
        padding: 4px 12px;
        border-radius: 18px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color, transparent);
        color: var(--primary-text-color);
        font-size: 13px;
        cursor: pointer;
        max-width: 100%;
      }
      .uc-irr-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .uc-irr-chip ha-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color); flex-shrink: 0; }
      .uc-irr-chip.active { border-color: var(--uc-irr-accent-resolved); }
      .uc-irr-chip.active ha-icon { color: var(--uc-irr-accent-resolved); }
      .uc-irr-chip.warn { border-color: var(--warning-color, #ffa600); }
      .uc-irr-chip.warn ha-icon { color: var(--warning-color, #ffa600); }
      .uc-irr-delay {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
      }
      .uc-irr-delay.active { border-color: var(--warning-color, #ffa600); }
      .uc-irr-delay-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: none;
        background: none;
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        min-height: 44px;
        padding: 0 4px;
      }
      .uc-irr-delay-label ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
      .uc-irr-delay.active .uc-irr-delay-label ha-icon { color: var(--warning-color, #ffa600); }
      .uc-irr-delay-controls { display: flex; flex-wrap: wrap; gap: 4px; }
      .uc-irr-delay-state { font-size: 13px; color: var(--secondary-text-color); }
      .uc-irr-seg {
        min-width: 44px;
        min-height: 44px;
        padding: 0 10px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--primary-text-color);
        font-size: 13px;
        cursor: pointer;
      }
      .uc-irr-seg.on {
        border-color: var(--uc-irr-accent-resolved);
        background: color-mix(in srgb, var(--uc-irr-accent-resolved) 18%, transparent);
        font-weight: 600;
      }
      .uc-irr-zones { display: flex; flex-direction: column; gap: 8px; }
      .uc-irr.compact .uc-irr-zones { gap: 2px; }
      .uc-irr-zone {
        --uc-irr-zone-resolved: var(--uc-irr-zone, var(--uc-irr-accent-resolved));
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid var(--divider-color);
        min-width: 0;
      }
      .uc-irr-zone.compact { border: none; padding: 2px 4px; gap: 8px; }
      .uc-irr-zone.status-running {
        border-color: var(--uc-irr-zone-resolved);
        background: color-mix(in srgb, var(--uc-irr-zone-resolved) 10%, transparent);
      }
      .uc-irr-zone.status-unavailable { opacity: 0.55; }
      .uc-irr-zone-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--uc-irr-zone-resolved) 14%, transparent);
        color: var(--uc-irr-zone-resolved);
        cursor: pointer;
        padding: 0;
      }
      .uc-irr-zone.compact .uc-irr-zone-icon { width: 36px; height: 36px; background: transparent; }
      .uc-irr-zone-icon ha-icon { --mdc-icon-size: 24px; }
      .uc-irr-zone.status-idle .uc-irr-zone-icon,
      .uc-irr-zone.status-unavailable .uc-irr-zone-icon { color: var(--secondary-text-color); }
      .uc-irr-zone.status-running .uc-irr-zone-icon ha-icon { animation: uc-irr-pulse 1.6s ease-in-out infinite; }
      @keyframes uc-irr-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
      @media (prefers-reduced-motion: reduce) {
        .uc-irr-zone.status-running .uc-irr-zone-icon ha-icon { animation: none; }
      }
      .uc-irr-zone-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
      .uc-irr-zone-name {
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-irr-zone-sub {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-variant-numeric: tabular-nums;
      }
      .uc-irr-zone.status-running .uc-irr-zone-sub { color: var(--primary-text-color); }
      .uc-irr-progress { height: 4px; border-radius: 2px; background: var(--divider-color); overflow: hidden; }
      .uc-irr-progress-fill { height: 100%; background: var(--uc-irr-zone-resolved); transition: width 1s linear; }
      .uc-irr-moist { display: flex; align-items: center; gap: 8px; cursor: pointer; }
      .uc-irr-moist-track {
        position: relative;
        flex: 1;
        max-width: 160px;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        overflow: hidden;
      }
      .uc-irr-moist-fill { height: 100%; border-radius: 3px; background: var(--success-color, #43a047); }
      .uc-irr-moist.dry .uc-irr-moist-fill { background: var(--warning-color, #ffa600); }
      .uc-irr-moist.wet .uc-irr-moist-fill { background: var(--info-color, #039be5); }
      .uc-irr-moist-mark {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--secondary-text-color);
        opacity: 0.5;
        z-index: 1;
      }
      .uc-irr-moist-text { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; }
      .uc-irr-moist-text.dry { color: var(--warning-color, #ffa600); }
      .uc-irr-moist-text.wet { color: var(--info-color, #039be5); }
      .uc-irr-stepper { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
      .uc-irr-step {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--primary-text-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
      }
      .uc-irr-step:hover { background: var(--secondary-background-color); }
      .uc-irr-step ha-icon { --mdc-icon-size: 18px; }
      .uc-irr-step-value { min-width: 34px; text-align: center; font-weight: 600; font-variant-numeric: tabular-nums; }
      .uc-irr-step-value small { font-size: 10px; font-weight: 400; margin-left: 1px; color: var(--secondary-text-color); }
      .uc-irr-run {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--uc-irr-zone-resolved);
        color: var(--text-primary-color, #fff);
        cursor: pointer;
        padding: 0;
      }
      .uc-irr-run.stop { background: var(--error-color, #db4437); }
      .uc-irr-run:disabled { opacity: 0.35; cursor: default; background: var(--disabled-text-color, #9e9e9e); }
      .uc-irr-run ha-icon { --mdc-icon-size: 22px; }
      .uc-irr button:focus-visible { outline: 2px solid var(--uc-irr-accent-resolved); outline-offset: 2px; }
      @media (max-width: 420px) {
        .uc-irr-moist-track { max-width: none; }
        .uc-irr-step { width: 36px; }
      }
    `;
  }
}
