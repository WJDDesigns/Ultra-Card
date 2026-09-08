import { TemplateResult, html, nothing, svg } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { BoilerModule, CardModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import '../components/ultra-color-picker';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Numeric state of a sensor, or null when missing/non-numeric. */
function num(hass: HomeAssistant, entityId: string | undefined): number | null {
  if (!entityId) return null;
  const s = hass?.states?.[entityId];
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isNaN(v) ? null : v;
}

/** true/false for a binary-ish entity, or null when it isn't configured/available. */
function onState(hass: HomeAssistant, entityId: string | undefined): boolean | null {
  if (!entityId) return null;
  const s = hass?.states?.[entityId];
  if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
  return s.state === 'on';
}

/** Unit of measurement of an entity with a fallback. */
function unitOf(hass: HomeAssistant, entityId: string | undefined, fallback: string): string {
  if (!entityId) return fallback;
  const u = hass?.states?.[entityId]?.attributes?.unit_of_measurement;
  return typeof u === 'string' && u ? u : fallback;
}

const DEFAULT_COLD_COLOR = '#3b82f6';
const DEFAULT_WARM_COLOR = '#f59e0b';
const DEFAULT_HOT_COLOR = '#ef4444';

/** Water-heater states that mean the unit is switched off. */
const WH_OFF_STATES = new Set(['off', 'unavailable', 'unknown']);

const MODE_ICONS: Record<string, string> = {
  eco: 'mdi:leaf',
  electric: 'mdi:lightning-bolt',
  performance: 'mdi:rocket-launch',
  high_demand: 'mdi:fire',
  heat_pump: 'mdi:heat-pump',
  gas: 'mdi:fire-circle',
  heat: 'mdi:fire',
  auto: 'mdi:refresh-auto',
  off: 'mdi:power',
};

type BoilerStatus = 'unavailable' | 'off' | 'dhw' | 'heating' | 'idle';

/**
 * Boiler Pro Module
 *
 * Compact animated boiler card: water temperature with temperature-driven
 * colors, flame / fan / pipe-flow animations, pressure and modulation
 * readouts, and target temperature control. Works with water_heater and
 * climate entities or plain sensors (EMS-ESP, OpenTherm Gateway, ...).
 */
export class UltraBoilerModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'boiler',
    title: 'Boiler',
    description:
      'Animated boiler card with temperature-driven colors, flame and pipe animations, pressure, and target control',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:water-boiler',
    category: 'interactive',
    tags: ['boiler', 'heating', 'water-heater', 'temperature', 'pressure', 'flame', 'animated', 'pro', 'premium'],
  };

  /** Optimistic setpoints so the target doesn't snap back before HA confirms. */
  private _pendingTargets: Map<string, { value: number; ts: number }> = new Map();

  createDefault(id?: string): BoilerModule {
    return {
      id: id || this.generateId('boiler'),
      type: 'boiler',
      entity: '',
      name: '',
      icon: '',
      layout: 'standard',
      water_temp_entity: '',
      return_temp_entity: '',
      target_temp_entity: '',
      pressure_entity: '',
      modulation_entity: '',
      flame_entity: '',
      heating_entity: '',
      dhw_entity: '',
      power_switch_entity: '',
      show_name: true,
      show_status: true,
      show_boiler_graphic: true,
      show_water_temp: true,
      show_return_temp: true,
      show_pressure: true,
      show_modulation: true,
      show_target_control: true,
      show_modes: true,
      show_power_button: true,
      enable_animations: true,
      cold_temp: 30,
      hot_temp: 60,
      cold_color: '',
      warm_color: '',
      hot_color: '',
      min_pressure: 1,
      max_pressure: 2.5,
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

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as BoilerModule, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as BoilerModule, hass, updates => updateModule(updates));
  }

  // ── Editor ────────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as BoilerModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.boiler.pro_description',
          lang,
          'The Boiler module shows your boiler with temperature-driven colors, live flame, fan and pipe animations, pressure and modulation readouts, and target temperature control.'
        )
      );
    }

    const entityRow = (
      key: keyof BoilerModule,
      label: string,
      desc: string,
      domains?: string[]
    ) => html`
      <div style="margin-bottom: 12px;">
        ${this.renderEntityPickerWithVariables(
          hass,
          config,
          key as string,
          (m[key] as string) || '',
          (value: string) => {
            updateModule({ [key]: value } as Partial<CardModule>);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          },
          domains,
          label
        )}
        <div
          style="font-size:0.78rem; color:var(--secondary-text-color); margin-top:3px; padding-left:2px;"
        >
          ${desc}
        </div>
      </div>
    `;

    const toggleRow = (key: keyof BoilerModule, title: string, description = '') => ({
      title,
      description,
      hass,
      data: { [key]: m[key] !== false },
      schema: [this.booleanField(key as string)],
      onChange: (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] ?? true } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
    });

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.boiler.entity_section', lang, 'Boiler'),
          localize(
            'editor.boiler.entity_section_desc',
            lang,
            'Pick the main boiler entity. A water_heater or climate entity provides temperature, target, and modes automatically; a plain temperature sensor works too.'
          ),
          [
            {
              title: localize('editor.boiler.entity', lang, 'Entity'),
              description: localize(
                'editor.boiler.entity_desc',
                lang,
                'water_heater, climate, or temperature sensor'
              ),
              hass,
              data: { entity: m.entity || '' },
              schema: [
                {
                  name: 'entity',
                  selector: { entity: { domain: ['water_heater', 'climate', 'sensor'] } },
                },
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ entity: e.detail.value?.entity ?? '' } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.boiler.name', lang, 'Name override'),
              description: localize(
                'editor.boiler.name_desc',
                lang,
                'Leave blank to use the entity friendly name.'
              ),
              hass,
              data: { name: m.name || '' },
              schema: [this.textField('name')],
              onChange: (e: CustomEvent) => {
                updateModule({ name: e.detail.value?.name ?? '' } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderIconField(
          localize('editor.boiler.icon', lang, 'Icon override'),
          localize('editor.boiler.icon_desc', lang, 'Shown in the header. Leave blank for the boiler icon.'),
          hass,
          m.icon || '',
          (value: string) => {
            updateModule({ icon: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSegmentedField(
          localize('editor.boiler.layout', lang, 'Layout'),
          localize(
            'editor.boiler.layout_desc',
            lang,
            'Standard shows the animated boiler graphic; compact is a single row.'
          ),
          m.layout || 'standard',
          [
            {
              value: 'standard',
              label: localize('editor.boiler.layout_standard', lang, 'Standard'),
              icon: 'mdi:view-agenda-outline',
            },
            {
              value: 'compact',
              label: localize('editor.boiler.layout_compact', lang, 'Compact'),
              icon: 'mdi:view-stream-outline',
            },
          ],
          (next: string) => {
            updateModule({ layout: next as BoilerModule['layout'] } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderSettingsSection(
          localize('editor.boiler.sensors_section', lang, 'Boiler Sensors'),
          localize(
            'editor.boiler.sensors_section_desc',
            lang,
            'All optional. Link the individual boiler sensors your integration exposes (EMS-ESP, OpenTherm Gateway, SmartThings, ...).'
          ),
          []
        )}
        ${entityRow(
          'water_temp_entity',
          localize('editor.boiler.water_temp', lang, 'Water / flow temperature'),
          localize('editor.boiler.water_temp_desc', lang, 'Supply water temperature. Falls back to the main entity current temperature.'),
          ['sensor']
        )}
        ${entityRow(
          'return_temp_entity',
          localize('editor.boiler.return_temp', lang, 'Return temperature'),
          localize('editor.boiler.return_temp_desc', lang, 'Water temperature returning to the boiler'),
          ['sensor']
        )}
        ${entityRow(
          'pressure_entity',
          localize('editor.boiler.pressure', lang, 'Water pressure'),
          localize('editor.boiler.pressure_desc', lang, 'System pressure in bar or psi'),
          ['sensor']
        )}
        ${entityRow(
          'modulation_entity',
          localize('editor.boiler.modulation', lang, 'Burner modulation (%)'),
          localize('editor.boiler.modulation_desc', lang, 'Drives the flame size in the graphic'),
          ['sensor']
        )}
        ${entityRow(
          'flame_entity',
          localize('editor.boiler.flame', lang, 'Flame / burner active'),
          localize('editor.boiler.flame_desc', lang, 'Binary sensor that is on while the burner fires'),
          ['binary_sensor', 'sensor']
        )}
        ${entityRow(
          'heating_entity',
          localize('editor.boiler.heating', lang, 'Central heating active'),
          localize('editor.boiler.heating_desc', lang, 'Binary sensor that is on while heating circulates'),
          ['binary_sensor', 'sensor']
        )}
        ${entityRow(
          'dhw_entity',
          localize('editor.boiler.dhw', lang, 'Hot water (DHW) active'),
          localize('editor.boiler.dhw_desc', lang, 'Binary sensor that is on while heating tap water'),
          ['binary_sensor', 'sensor']
        )}
        ${entityRow(
          'target_temp_entity',
          localize('editor.boiler.target', lang, 'Target temperature'),
          localize('editor.boiler.target_desc', lang, 'Number helper for the setpoint. Falls back to the main entity target.'),
          ['number', 'input_number']
        )}
        ${entityRow(
          'power_switch_entity',
          localize('editor.boiler.power_switch', lang, 'Power switch'),
          localize('editor.boiler.power_switch_desc', lang, 'Switch for the power button. Falls back to turning the main entity on/off.'),
          ['switch', 'input_boolean']
        )}

        ${this.renderSettingsSection(
          localize('editor.boiler.display_section', lang, 'Display'),
          localize('editor.boiler.display_section_desc', lang, 'Choose which readouts and controls to show.'),
          [
            toggleRow('show_name', localize('editor.boiler.show_name', lang, 'Show name')),
            toggleRow('show_status', localize('editor.boiler.show_status', lang, 'Show status label')),
            toggleRow(
              'show_boiler_graphic',
              localize('editor.boiler.show_graphic', lang, 'Show boiler graphic'),
              localize('editor.boiler.show_graphic_desc', lang, 'Animated boiler drawing (standard layout)')
            ),
            toggleRow('show_water_temp', localize('editor.boiler.show_water_temp', lang, 'Show water temperature')),
            toggleRow('show_return_temp', localize('editor.boiler.show_return_temp', lang, 'Show return temperature')),
            toggleRow('show_pressure', localize('editor.boiler.show_pressure', lang, 'Show pressure')),
            toggleRow('show_modulation', localize('editor.boiler.show_modulation', lang, 'Show modulation')),
            toggleRow(
              'show_target_control',
              localize('editor.boiler.show_target', lang, 'Show target control'),
              localize('editor.boiler.show_target_desc', lang, 'Plus/minus stepper for the setpoint')
            ),
            toggleRow(
              'show_modes',
              localize('editor.boiler.show_modes', lang, 'Show modes'),
              localize('editor.boiler.show_modes_desc', lang, 'Operation mode chips when the entity supports them')
            ),
            toggleRow('show_power_button', localize('editor.boiler.show_power', lang, 'Show power button')),
            toggleRow(
              'enable_animations',
              localize('editor.boiler.animations', lang, 'Enable animations'),
              localize('editor.boiler.animations_desc', lang, 'Flame flicker, fan spin, and pipe flow')
            ),
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.boiler.temp_colors_section', lang, 'Temperature Colors'),
          localize(
            'editor.boiler.temp_colors_section_desc',
            lang,
            'The water temperature reading and boiler glow blend from cold to hot between these thresholds.'
          ),
          [
            {
              title: localize('editor.boiler.cold_temp', lang, 'Cold below'),
              description: localize('editor.boiler.cold_temp_desc', lang, 'At or below this temperature the cold color is used'),
              hass,
              data: { cold_temp: m.cold_temp ?? 30 },
              schema: [this.numberField('cold_temp', -20, 100, 1)],
              onChange: (e: CustomEvent) => {
                updateModule({ cold_temp: e.detail.value?.cold_temp ?? 30 } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.boiler.hot_temp', lang, 'Hot above'),
              description: localize('editor.boiler.hot_temp_desc', lang, 'At or above this temperature the hot color is used'),
              hass,
              data: { hot_temp: m.hot_temp ?? 60 },
              schema: [this.numberField('hot_temp', 0, 150, 1)],
              onChange: (e: CustomEvent) => {
                updateModule({ hot_temp: e.detail.value?.hot_temp ?? 60 } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderColorField(
          localize('editor.boiler.cold_color', lang, 'Cold color'),
          '',
          hass,
          m.cold_color || '',
          DEFAULT_COLD_COLOR,
          (value: string) => {
            updateModule({ cold_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.boiler.warm_color', lang, 'Warm color'),
          '',
          hass,
          m.warm_color || '',
          DEFAULT_WARM_COLOR,
          (value: string) => {
            updateModule({ warm_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.boiler.hot_color', lang, 'Hot color'),
          '',
          hass,
          m.hot_color || '',
          DEFAULT_HOT_COLOR,
          (value: string) => {
            updateModule({ hot_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderSettingsSection(
          localize('editor.boiler.pressure_section', lang, 'Pressure Range'),
          localize(
            'editor.boiler.pressure_section_desc',
            lang,
            'Outside this healthy range the pressure readout turns to the warning color.'
          ),
          [
            {
              title: localize('editor.boiler.min_pressure', lang, 'Minimum healthy pressure'),
              description: '',
              hass,
              data: { min_pressure: m.min_pressure ?? 1 },
              schema: [this.numberField('min_pressure', 0, 10, 0.1)],
              onChange: (e: CustomEvent) => {
                updateModule({ min_pressure: e.detail.value?.min_pressure ?? 1 } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.boiler.max_pressure', lang, 'Maximum healthy pressure'),
              description: '',
              hass,
              data: { max_pressure: m.max_pressure ?? 2.5 },
              schema: [this.numberField('max_pressure', 0, 10, 0.1)],
              onChange: (e: CustomEvent) => {
                updateModule({ max_pressure: e.detail.value?.max_pressure ?? 2.5 } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        ${this.renderColorField(
          localize('editor.boiler.text_color', lang, 'Text color'),
          '',
          hass,
          m.text_color || '',
          'var(--primary-text-color)',
          (value: string) => {
            updateModule({ text_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.boiler.card_bg', lang, 'Card background'),
          '',
          hass,
          m.card_background_color || '',
          'var(--card-background-color)',
          (value: string) => {
            updateModule({ card_background_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as BoilerModule;
    const lang = hass?.locale?.language || 'en';
    const entityId = this.resolveEntity(m.entity, config) || m.entity;

    if (!entityId || !hass?.states?.[entityId]) {
      return html`
        <style>${this.getStyles()}</style>
        ${this.renderGradientErrorState(
          localize('editor.boiler.config_needed', lang, 'Select a boiler'),
          localize('editor.boiler.config_needed_desc', lang, 'Choose an entity in the General tab'),
          'mdi:water-boiler'
        )}
      `;
    }

    const st = hass.states[entityId];
    const a = st.attributes || {};
    const domain = entityId.split('.')[0];
    const isThermostatLike = domain === 'water_heater' || domain === 'climate';

    // ── Linked entity resolution ──
    const resolve = (v: string | undefined) => (v ? this.resolveEntity(v, config) || v : undefined);
    const waterTempId = resolve(m.water_temp_entity);
    const returnTempId = resolve(m.return_temp_entity);
    const targetId = resolve(m.target_temp_entity);
    const pressureId = resolve(m.pressure_entity);
    const modulationId = resolve(m.modulation_entity);
    const flameId = resolve(m.flame_entity);
    const heatingId = resolve(m.heating_entity);
    const dhwId = resolve(m.dhw_entity);
    const powerSwitchId = resolve(m.power_switch_entity);

    // ── Values ──
    const waterTemp =
      num(hass, waterTempId) ??
      (typeof a.current_temperature === 'number' ? (a.current_temperature as number) : null) ??
      (!isThermostatLike ? num(hass, entityId) : null);
    const returnTemp = num(hass, returnTempId);
    const pressure = num(hass, pressureId);
    const modulation = num(hass, modulationId);
    const tempUnit =
      unitOf(hass, waterTempId, '') ||
      (typeof a.unit_of_measurement === 'string' ? (a.unit_of_measurement as string) : '') ||
      hass.config?.unit_system?.temperature ||
      '°C';
    const pressureUnit = unitOf(hass, pressureId, 'bar');

    // ── Status ──
    const unavailable = st.state === 'unavailable' || st.state === 'unknown';
    const powerSwitchOn = onState(hass, powerSwitchId);
    const flameOn =
      onState(hass, flameId) ??
      ((a.hvac_action as string) === 'heating' || (modulation !== null && modulation > 0) || null);
    const heatingOn = onState(hass, heatingId) ?? ((a.hvac_action as string) === 'heating' || null);
    const dhwOn = onState(hass, dhwId);
    const mainOff = isThermostatLike && WH_OFF_STATES.has(st.state);
    const isOff = powerSwitchOn === false || (powerSwitchOn === null && mainOff);

    const status: BoilerStatus = unavailable
      ? 'unavailable'
      : isOff
        ? 'off'
        : dhwOn
          ? 'dhw'
          : flameOn || heatingOn
            ? 'heating'
            : 'idle';

    const active = status === 'heating' || status === 'dhw';
    const animate = m.enable_animations !== false && active;

    // ── Colors ──
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--uc-pane-bg, var(--card-background-color))';
    const tempColor = this._tempColor(m, waterTemp);
    const statusColor =
      status === 'unavailable' || status === 'off' || status === 'idle' ? secondary : tempColor;
    const pressureOk =
      pressure === null || (pressure >= (m.min_pressure ?? 1) && pressure <= (m.max_pressure ?? 2.5));

    // ── Target setpoint ──
    const targetRef = targetId ? hass.states[targetId] : undefined;
    const haTarget =
      (targetRef ? num(hass, targetId) : null) ??
      (typeof a.temperature === 'number' ? (a.temperature as number) : null);
    const targetKey = targetId || entityId;
    const pending = this._pendingTargets.get(targetKey);
    let target = haTarget;
    if (pending) {
      if (Date.now() - pending.ts >= 6000 || pending.value === haTarget) {
        this._pendingTargets.delete(targetKey);
      } else {
        target = pending.value;
      }
    }
    const targetMin = targetRef
      ? typeof targetRef.attributes.min === 'number' ? (targetRef.attributes.min as number) : 0
      : typeof a.min_temp === 'number' ? (a.min_temp as number) : 0;
    const targetMax = targetRef
      ? typeof targetRef.attributes.max === 'number' ? (targetRef.attributes.max as number) : 90
      : typeof a.max_temp === 'number' ? (a.max_temp as number) : 90;
    const targetStep = targetRef
      ? typeof targetRef.attributes.step === 'number' && targetRef.attributes.step > 0
        ? (targetRef.attributes.step as number)
        : 1
      : typeof a.target_temp_step === 'number' && a.target_temp_step > 0
        ? (a.target_temp_step as number)
        : 1;
    const canSetTarget = target !== null && (targetRef !== undefined || isThermostatLike);

    const stepTarget = (dir: 1 | -1) => {
      if (target === null) return;
      const next = Math.min(targetMax, Math.max(targetMin, target + dir * targetStep));
      this._pendingTargets.set(targetKey, { value: next, ts: Date.now() });
      if (targetRef) {
        const d = targetRef.entity_id.split('.')[0];
        hass.callService(d === 'input_number' ? 'input_number' : 'number', 'set_value', {
          entity_id: targetRef.entity_id,
          value: next,
        });
      } else if (domain === 'water_heater') {
        hass.callService('water_heater', 'set_temperature', { entity_id: entityId, temperature: next });
      } else {
        hass.callService('climate', 'set_temperature', { entity_id: entityId, temperature: next });
      }
      this.triggerPreviewUpdate(true);
    };

    const togglePower = () => {
      if (powerSwitchId) {
        const d = powerSwitchId.split('.')[0];
        hass.callService(d === 'input_boolean' ? 'input_boolean' : 'switch', 'toggle', {
          entity_id: powerSwitchId,
        });
      } else if (domain === 'water_heater') {
        hass.callService('water_heater', isOff ? 'turn_on' : 'turn_off', { entity_id: entityId });
      } else if (domain === 'climate') {
        hass.callService('climate', isOff ? 'turn_on' : 'turn_off', { entity_id: entityId });
      }
      this.triggerPreviewUpdate(true);
    };
    const hasPowerControl = !!powerSwitchId || isThermostatLike;

    // ── Modes ──
    const modes: string[] =
      domain === 'water_heater' && Array.isArray(a.operation_list)
        ? (a.operation_list as string[])
        : domain === 'climate' && Array.isArray(a.hvac_modes)
          ? (a.hvac_modes as string[])
          : [];
    const activeMode = domain === 'water_heater' ? (st.state as string) : domain === 'climate' ? st.state : undefined;
    const setMode = (mode: string) => {
      if (domain === 'water_heater') {
        hass.callService('water_heater', 'set_operation_mode', { entity_id: entityId, operation_mode: mode });
      } else {
        hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode });
      }
      this.triggerPreviewUpdate(true);
    };

    // ── Labels ──
    const name = m.name?.trim() || (a.friendly_name as string) || entityId;
    const icon = m.icon || 'mdi:water-boiler';
    const statusLabel = (() => {
      switch (status) {
        case 'unavailable':
          return localize('editor.boiler.state_unavailable', lang, 'Unavailable');
        case 'off':
          return localize('editor.boiler.state_off', lang, 'Off');
        case 'dhw':
          return localize('editor.boiler.state_dhw', lang, 'Hot water');
        case 'heating':
          return localize('editor.boiler.state_heating', lang, 'Heating');
        default:
          return localize('editor.boiler.state_idle', lang, 'Standby');
      }
    })();

    const fmtTemp = (v: number | null) => (v === null ? '—' : `${Math.round(v * 10) / 10}`);

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const g = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action?.action
          ? { ...m.tap_action, entity: entityId }
          : { action: 'more-info', entity: entityId },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: entityId,
        module: m,
      },
      hass,
      config,
      ['.uc-boiler-ctl']
    );

    // ── Shared building blocks ──
    const powerButton =
      m.show_power_button !== false && hasPowerControl
        ? html`
            <button
              type="button"
              class="uc-boiler-ctl uc-boiler__power ${!isOff && !unavailable ? 'is-on' : ''}"
              style="${!isOff && !unavailable ? `background:${tempColor};` : ''}"
              ?disabled=${unavailable}
              title=${localize('editor.boiler.toggle_power', lang, 'Toggle power')}
              @click=${(ev: Event) => {
                ev.stopPropagation();
                togglePower();
              }}
            >
              <ha-icon icon="mdi:power" style="--mdc-icon-size:20px;"></ha-icon>
            </button>
          `
        : nothing;

    const targetControl =
      m.show_target_control !== false && canSetTarget
        ? html`
            <div class="uc-boiler__target uc-boiler-ctl ${(m.layout || 'standard') === 'compact' ? '' : 'uc-boiler__target--fill'}">
              <button
                type="button"
                class="uc-boiler__step"
                ?disabled=${unavailable || isOff}
                aria-label=${localize('editor.boiler.decrease', lang, 'Decrease target')}
                @click=${(ev: Event) => {
                  ev.stopPropagation();
                  stepTarget(-1);
                }}
              >
                <ha-icon icon="mdi:minus" style="--mdc-icon-size:16px;"></ha-icon>
              </button>
              <div class="uc-boiler__target-val">
                <span style="color:${secondary};font-size:10px;text-transform:uppercase;letter-spacing:0.04em;">
                  ${localize('editor.boiler.target_label', lang, 'Target')}
                </span>
                <span style="color:${text};font-weight:700;">${fmtTemp(target)}${tempUnit}</span>
              </div>
              <button
                type="button"
                class="uc-boiler__step"
                ?disabled=${unavailable || isOff}
                aria-label=${localize('editor.boiler.increase', lang, 'Increase target')}
                @click=${(ev: Event) => {
                  ev.stopPropagation();
                  stepTarget(1);
                }}
              >
                <ha-icon icon="mdi:plus" style="--mdc-icon-size:16px;"></ha-icon>
              </button>
            </div>
          `
        : nothing;

    const isCompact = (m.layout || 'standard') === 'compact';

    // Stat tile: stacked (icon + label over value) in the standard layout so a
    // grid of tiles fills the side column; inline in the compact row.
    const metricTile = (label: string, icon: string, value: string, color: string, warn = false) => html`
      <div
        class="uc-boiler__metric ${isCompact ? 'uc-boiler__metric--inline' : ''} ${warn ? 'uc-boiler__metric--warn' : ''}"
      >
        <span class="uc-boiler__metric-head" style="color:${secondary};">
          <ha-icon icon="${icon}" style="--mdc-icon-size:14px;color:${warn ? 'var(--warning-color, #FF9800)' : color};"></ha-icon>
          <span class="uc-boiler__metric-label">${label}</span>
        </span>
        <span class="uc-boiler__metric-val" style="color:${warn ? 'var(--warning-color, #FF9800)' : text};">${value}</span>
      </div>
    `;

    const metrics: TemplateResult[] = [];
    if (m.show_return_temp !== false && returnTemp !== null) {
      metrics.push(
        metricTile(
          localize('editor.boiler.return_label', lang, 'Return'),
          'mdi:arrow-u-left-bottom',
          `${fmtTemp(returnTemp)}${tempUnit}`,
          this._tempColor(m, returnTemp)
        )
      );
    }
    if (m.show_pressure !== false && pressure !== null) {
      metrics.push(
        metricTile(
          localize('editor.boiler.pressure_label', lang, 'Pressure'),
          'mdi:gauge',
          `${Math.round(pressure * 100) / 100} ${pressureUnit}`,
          secondary,
          !pressureOk
        )
      );
    }
    if (m.show_modulation !== false && modulation !== null) {
      metrics.push(
        metricTile(
          localize('editor.boiler.modulation_label', lang, 'Modulation'),
          'mdi:fire',
          `${Math.round(modulation)}%`,
          modulation > 0 ? tempColor : secondary
        )
      );
    }

    // Balance chip rows: up to 4 per row, and split evenly beyond that
    // (5 → 3 + 2, 6 → 3 + 3, 7 → 4 + 3) so no row is left with an orphan chip.
    const modeCols =
      modes.length <= 4 ? modes.length : Math.ceil(modes.length / Math.ceil(modes.length / 4));
    const modeChips =
      m.show_modes !== false && modes.length > 0
        ? html`
            <div class="uc-boiler__modes uc-boiler-ctl" style="--uc-boiler-mode-cols:${modeCols};">
              ${modes.map(mode => {
                const isActive = mode === activeMode;
                return html`
                  <button
                    type="button"
                    class="uc-boiler__mode ${isActive ? 'is-active' : ''}"
                    style="${isActive
                      ? `border-color:${tempColor};color:${tempColor};background:${this._alpha(tempColor)};`
                      : `color:${secondary};`}"
                    ?disabled=${unavailable}
                    @click=${(ev: Event) => {
                      ev.stopPropagation();
                      setMode(mode);
                    }}
                  >
                    ${MODE_ICONS[mode.toLowerCase()]
                      ? html`<ha-icon icon=${MODE_ICONS[mode.toLowerCase()]} style="--mdc-icon-size:14px;"></ha-icon>`
                      : nothing}
                    ${mode.replace(/_/g, ' ')}
                  </button>
                `;
              })}
            </div>
          `
        : nothing;

    const header = html`
      <div class="uc-boiler__header">
        <ha-icon
          icon="${icon}"
          class="${animate && m.layout === 'compact' ? 'uc-boiler--pulse' : ''}"
          style="color:${statusColor};--mdc-icon-size:26px;flex-shrink:0;"
        ></ha-icon>
        <div style="flex:1;min-width:0;">
          ${m.show_name !== false
            ? html`<div class="uc-boiler__name" style="color:${text};">${name}</div>`
            : nothing}
          ${m.show_status !== false
            ? html`<div class="uc-boiler__status" style="color:${statusColor};">
                ${statusLabel}${status === 'heating' && modulation !== null ? ` · ${Math.round(modulation)}%` : ''}
              </div>`
            : nothing}
        </div>
        ${m.show_water_temp !== false && waterTemp !== null
          ? html`
              <div class="uc-boiler__big-temp" style="flex-shrink:0;">
                <span style="color:${tempColor};font-size:26px;font-weight:800;">${fmtTemp(waterTemp)}</span>
                <span style="color:${secondary};font-size:13px;font-weight:600;">${tempUnit}</span>
              </div>
            `
          : nothing}
        ${powerButton}
      </div>
    `;

    // ── COMPACT layout ──
    if ((m.layout || 'standard') === 'compact') {
      return html`
        <style>${this.getStyles()}</style>
        <div
          class="uc-boiler-wrapper ${hoverClass}"
          data-uc-role="pane"
          style="padding:12px 16px;border-radius:var(--uc-r-12, 12px);background:${cardBg};${designStyles}"
          @pointerdown=${g.onPointerDown}
          @pointermove=${g.onPointerMove}
          @pointerup=${g.onPointerUp}
          @pointerleave=${g.onPointerLeave}
          @pointercancel=${g.onPointerCancel}
        >
          ${this.wrapWithAnimation(
            html`
              ${header}
              ${metrics.length || targetControl !== nothing
                ? html`
                    <div class="uc-boiler__compact-row">
                      ${metrics}
                      ${targetControl}
                    </div>
                  `
                : nothing}
            `,
            module,
            hass
          )}
        </div>
      `;
    }

    // ── STANDARD layout ──
    return html`
      <style>${this.getStyles()}</style>
      <div
        class="uc-boiler-wrapper ${hoverClass}"
        data-uc-role="pane"
        style="padding:16px;border-radius:var(--uc-r-12, 12px);background:${cardBg};${designStyles}"
        @pointerdown=${g.onPointerDown}
        @pointermove=${g.onPointerMove}
        @pointerup=${g.onPointerUp}
        @pointerleave=${g.onPointerLeave}
        @pointercancel=${g.onPointerCancel}
      >
        ${this.wrapWithAnimation(
          html`
            ${header}
            ${(() => {
              const showGraphic = m.show_boiler_graphic !== false;
              const hasSide = metrics.length > 0 || targetControl !== nothing;
              if (!showGraphic && !hasSide) return nothing;
              const graphic = showGraphic
                ? html`
                    <div class="uc-boiler__graphic">
                      ${this._boilerSvg(
                        m.id,
                        tempColor,
                        m.cold_color || DEFAULT_COLD_COLOR,
                        !!flameOn && !isOff && !unavailable,
                        (status === 'heating' || status === 'dhw') && !unavailable,
                        isOff || unavailable,
                        modulation,
                        m.enable_animations !== false,
                        waterTemp !== null ? `${fmtTemp(waterTemp)}°` : '—'
                      )}
                    </div>
                  `
                : nothing;
              // Graphic only: center it. Side only: the tiles span the full width.
              return html`
                <div class="uc-boiler__body ${!hasSide ? 'uc-boiler__body--graphic-only' : ''}">
                  ${graphic}
                  ${hasSide
                    ? html`
                        <div class="uc-boiler__side">
                          ${metrics.length
                            ? html`<div class="uc-boiler__metrics uc-boiler__metrics--grid">${metrics}</div>`
                            : nothing}
                          ${targetControl}
                        </div>
                      `
                    : nothing}
                </div>
              `;
            })()}
            ${modeChips}
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  // ── Boiler SVG graphic ────────────────────────────────────────────────────

  /**
   * Compact boiler drawing: wall unit with a display, fan, burner window with
   * animated flames, and supply/return pipes with animated flow.
   */
  private _boilerSvg(
    moduleId: string,
    tempColor: string,
    coldColor: string,
    flameOn: boolean,
    flowOn: boolean,
    isOff: boolean,
    modulation: number | null,
    animationsEnabled: boolean,
    tempLabel: string
  ): TemplateResult {
    const animate = animationsEnabled;
    const flameScale = flameOn ? 0.6 + 0.4 * ((modulation ?? 100) / 100) : 0;
    // Gradient ids must be unique per instance so two boilers on one view don't share defs
    const p = `ucb-${String(moduleId).replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const edge = 'color-mix(in srgb, var(--divider-color) 75%, transparent)';
    const edgeSoft = 'color-mix(in srgb, var(--divider-color) 40%, transparent)';
    const windowBg = 'color-mix(in srgb, #000 78%, var(--card-background-color))';
    const metal = 'color-mix(in srgb, var(--primary-text-color) 22%, var(--card-background-color))';
    const metalDark = 'color-mix(in srgb, var(--primary-text-color) 10%, var(--card-background-color))';
    const idle = 'color-mix(in srgb, var(--primary-text-color) 30%, transparent)';
    const fanColor = flowOn ? tempColor : idle;
    const ledColor = isOff ? idle : flameOn ? tempColor : '#4ade80';

    // Four-blade fan. The invisible r=9 circle makes the group's bounding box
    // symmetric so a CSS rotation (transform-box: fill-box) pivots on the hub.
    const fanBlades = svg`
      <g class="${flowOn && animate ? 'uc-boiler-fan--spin' : ''}">
        <circle r="9" fill="none" stroke="none" />
        ${[0, 90, 180, 270].map(
          r => svg`<path
            d="M 0 -1.4 C 1.8 -7.6, 6.4 -7.4, 6.6 -2.6 C 6.7 0.2, 3.2 1.8, 0 -1.4 Z"
            fill="${fanColor}" opacity="0.95" transform="rotate(${r})" />`
        )}
        <circle r="2.1" fill="${windowBg}" stroke="${fanColor}" stroke-width="1" />
      </g>
    `;

    const flame = (scale: number, cls: string, x: number, main: boolean) => svg`
      <g transform="translate(${x} 92) scale(${scale})">
        <g class="${animate ? cls : ''}">
          ${main
            ? svg`
                <path d="M 0 0 C -7.5 -5.5, -6 -14, 0 -20 C 6 -14, 7.5 -5.5, 0 0 Z" fill="url(#${p}-flame)" />
                <path d="M 0 0 C -4 -3.5, -3.2 -9, 0 -13 C 3.2 -9, 4 -3.5, 0 0 Z" fill="url(#${p}-flame-in)" />
                <path d="M 0 0 C -1.8 -2, -1.4 -4.8, 0 -6.5 C 1.4 -4.8, 1.8 -2, 0 0 Z" fill="#fff6d5" opacity="0.95" />
              `
            : svg`
                <path d="M 0 0 C -4.5 -3.5, -3.5 -9, 0 -12.5 C 3.5 -9, 4.5 -3.5, 0 0 Z" fill="url(#${p}-flame)" opacity="0.9" />
                <path d="M 0 0 C -2 -2, -1.6 -5, 0 -7 C 1.6 -5, 2 -2, 0 0 Z" fill="url(#${p}-flame-in)" />
              `}
        </g>
      </g>
    `;

    return svg`
      <svg viewBox="0 0 100 134" width="104" height="139" aria-hidden="true" class="uc-boiler-svg">
        <defs>
          <linearGradient id="${p}-case" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="color-mix(in srgb, var(--primary-text-color) 16%, var(--card-background-color))" />
            <stop offset="1" stop-color="color-mix(in srgb, var(--primary-text-color) 6%, var(--card-background-color))" />
          </linearGradient>
          <linearGradient id="${p}-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="color-mix(in srgb, var(--primary-text-color) 4%, var(--card-background-color))" />
            <stop offset="1" stop-color="color-mix(in srgb, #000 22%, var(--card-background-color))" />
          </linearGradient>
          <linearGradient id="${p}-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff" stop-opacity="0" />
            <stop offset="0.5" stop-color="#fff" stop-opacity="0.16" />
            <stop offset="1" stop-color="#fff" stop-opacity="0" />
          </linearGradient>
          <radialGradient id="${p}-glow" cx="0.5" cy="0.7" r="0.6">
            <stop offset="0" stop-color="#ff9a3c" stop-opacity="0.85" />
            <stop offset="0.55" stop-color="#ff6a00" stop-opacity="0.3" />
            <stop offset="1" stop-color="#ff6a00" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="${p}-flame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#ff5a1f" />
            <stop offset="0.6" stop-color="#ff8f1f" />
            <stop offset="1" stop-color="#ffc94a" />
          </linearGradient>
          <linearGradient id="${p}-flame-in" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#ffb347" />
            <stop offset="1" stop-color="#ffe9a8" />
          </linearGradient>
          <linearGradient id="${p}-pipe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="${metalDark}" />
            <stop offset="0.45" stop-color="${metal}" />
            <stop offset="1" stop-color="${metalDark}" />
          </linearGradient>
        </defs>

        <!-- Pipes (behind the casing so the fittings sit on top) -->
        <g>
          <rect x="33" y="104" width="7" height="30" rx="3.5" fill="url(#${p}-pipe)" />
          <rect x="60" y="104" width="7" height="30" rx="3.5" fill="url(#${p}-pipe)" />
          <!-- Colored cores: supply hot, return cool -->
          <line x1="36.5" y1="112" x2="36.5" y2="130" stroke="${tempColor}" stroke-width="2.6" stroke-linecap="round" opacity="${flowOn ? 0.55 : 0.28}" />
          <line x1="63.5" y1="112" x2="63.5" y2="130" stroke="${coldColor}" stroke-width="2.6" stroke-linecap="round" opacity="${flowOn ? 0.55 : 0.28}" />
          ${flowOn && animate
            ? svg`
                <line x1="36.5" y1="112" x2="36.5" y2="130" stroke="${tempColor}" stroke-width="2.6"
                  stroke-linecap="round" stroke-dasharray="3 5" class="uc-boiler-flow--down" />
                <line x1="63.5" y1="130" x2="63.5" y2="112" stroke="${coldColor}" stroke-width="2.6"
                  stroke-linecap="round" stroke-dasharray="3 5" class="uc-boiler-flow--up" />
              `
            : nothing}
          <!-- Union nuts -->
          <rect x="31.5" y="106" width="10" height="4.5" rx="1.2" fill="${metal}" stroke="${edge}" stroke-width="0.6" />
          <rect x="58.5" y="106" width="10" height="4.5" rx="1.2" fill="${metal}" stroke="${edge}" stroke-width="0.6" />
          <rect x="32" y="121" width="9" height="3.6" rx="1" fill="${metal}" stroke="${edge}" stroke-width="0.5" />
          <rect x="59" y="121" width="9" height="3.6" rx="1" fill="${metal}" stroke="${edge}" stroke-width="0.5" />
        </g>

        <!-- Casing shadow + body -->
        <rect x="22" y="9.5" width="56" height="98" rx="10" fill="#000" opacity="0.22" />
        <rect x="22" y="7" width="56" height="98" rx="10" fill="url(#${p}-case)" stroke="${edge}" stroke-width="1" />
        <rect x="22" y="7" width="56" height="98" rx="10" fill="url(#${p}-sheen)" opacity="0.6" />
        ${flameOn ? svg`<rect x="22" y="7" width="56" height="98" rx="10" fill="${tempColor}" opacity="0.06" />` : nothing}
        <!-- Top vent slots -->
        ${[13, 16.5].map(
          y => svg`<rect x="36" y="${y}" width="28" height="1.5" rx="0.75" fill="${edge}" />`
        )}

        <!-- Front panel -->
        <rect x="28" y="23" width="44" height="78" rx="7" fill="url(#${p}-panel)" stroke="${edgeSoft}" stroke-width="0.8" />

        <!-- Display -->
        <rect x="34" y="29" width="32" height="12.5" rx="3" fill="${windowBg}" stroke="${edgeSoft}" stroke-width="0.6" />
        <text
          x="48.5" y="38.3"
          text-anchor="middle"
          font-size="7.6"
          font-weight="700"
          font-family="inherit"
          letter-spacing="0.2"
          fill="${isOff ? idle : tempColor}"
        >${tempLabel}</text>
        <circle cx="62.5" cy="32" r="1.1" fill="${ledColor}" class="${flameOn && animate ? 'uc-boiler-led--blink' : ''}" />

        <!-- Fan -->
        <g transform="translate(50 56.5)">
          <circle r="10.5" fill="${windowBg}" stroke="${edge}" stroke-width="0.9" />
          <circle r="8" fill="none" stroke="${edgeSoft}" stroke-width="0.6" />
          ${fanBlades}
        </g>

        <!-- Burner viewport -->
        <g>
          ${flameOn ? svg`<circle cx="50" cy="84" r="17" fill="url(#${p}-glow)" />` : nothing}
          <circle cx="50" cy="84" r="12.5" fill="${windowBg}" stroke="${edge}" stroke-width="1" />
          <circle cx="50" cy="84" r="11" fill="none" stroke="${flameOn ? tempColor : edgeSoft}" stroke-width="0.7" opacity="${flameOn ? 0.5 : 1}" />
          ${flameOn
            ? svg`
                ${flame(flameScale * 0.5, 'uc-boiler-flame--flicker2', 43.5, false)}
                ${flame(flameScale * 0.5, 'uc-boiler-flame--flicker3', 56.5, false)}
                ${flame(flameScale, 'uc-boiler-flame--flicker', 50, true)}
              `
            : svg`
                <g opacity="0.6">
                  <rect x="43" y="89.5" width="14" height="1.8" rx="0.9" fill="${idle}" />
                  ${[45, 48.5, 52, 55.5].map(
                    x => svg`<rect x="${x - 0.5}" y="87.5" width="1" height="2" rx="0.5" fill="${idle}" />`
                  )}
                </g>
              `}
        </g>
      </svg>
    `;
  }

  // ── Color helpers ─────────────────────────────────────────────────────────

  /** Blend cold → warm → hot based on the water temperature and thresholds. */
  private _tempColor(m: BoilerModule, temp: number | null): string {
    const cold = m.cold_color || DEFAULT_COLD_COLOR;
    const warm = m.warm_color || DEFAULT_WARM_COLOR;
    const hot = m.hot_color || DEFAULT_HOT_COLOR;
    if (temp === null) return 'var(--secondary-text-color)';
    const lo = m.cold_temp ?? 30;
    const hi = m.hot_temp ?? 60;
    if (temp <= lo) return cold;
    if (temp >= hi) return hot;
    const mid = (lo + hi) / 2;
    if (temp <= mid) {
      const pct = Math.round(((temp - lo) / Math.max(1e-6, mid - lo)) * 100);
      return `color-mix(in srgb, ${warm} ${pct}%, ${cold})`;
    }
    const pct = Math.round(((temp - mid) / Math.max(1e-6, hi - mid)) * 100);
    return `color-mix(in srgb, ${hot} ${pct}%, ${warm})`;
  }

  /** Translucent fill that works with hex colors, color-mix values, and CSS vars. */
  private _alpha(color: string): string {
    return `color-mix(in srgb, ${color} 14%, transparent)`;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as BoilerModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.entity) errors.push('Select a boiler entity');
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-boiler-wrapper { box-sizing: border-box; }

      .uc-boiler__header {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .uc-boiler__name {
        font-weight: 600;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-boiler__status {
        font-size: 12px;
        font-weight: 500;
      }
      .uc-boiler__big-temp {
        display: flex;
        align-items: baseline;
        gap: 2px;
      }

      .uc-boiler__power {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(127, 127, 127, 0.15);
        color: var(--secondary-text-color);
        transition: background 0.2s ease;
      }
      .uc-boiler__power.is-on { color: var(--text-primary-color, #fff); }
      .uc-boiler__power:disabled { opacity: 0.5; cursor: not-allowed; }

      .uc-boiler__body {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 12px;
      }
      .uc-boiler__body--graphic-only { justify-content: center; }
      .uc-boiler__graphic {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .uc-boiler-svg { display: block; overflow: visible; }
      .uc-boiler__side {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }

      .uc-boiler__compact-row {
        display: flex;
        align-items: stretch;
        gap: 6px;
        margin-top: 10px;
        flex-wrap: wrap;
      }
      /* Compact: tiles and the target share one wrapping row and grow to fill it */
      .uc-boiler__compact-row .uc-boiler__metric { flex: 1 1 auto; }
      .uc-boiler__compact-row .uc-boiler__target {
        flex: 1 1 160px;
        width: auto;
        justify-content: space-between;
      }
      .uc-boiler__compact-row .uc-boiler__target .uc-boiler__target-val { flex: 1; }

      /* Standard: tiles fill whatever width they are given. 1 tile spans, 2 sit
         side by side, 3 wrap to 2 + 1 (the last one spanning) so no gaps are left. */
      .uc-boiler__metrics--grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
        gap: 8px;
      }
      .uc-boiler__metrics--grid > .uc-boiler__metric:last-child:nth-child(odd) { grid-column: 1 / -1; }
      /* A lone tile next to the graphic gets more presence so it doesn't look lost */
      .uc-boiler__metrics--grid > .uc-boiler__metric:only-child { padding: 12px 10px; gap: 5px; }
      .uc-boiler__metrics--grid > .uc-boiler__metric:only-child .uc-boiler__metric-val { font-size: 20px; }
      .uc-boiler__metric {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 8px 10px;
        border-radius: var(--uc-r-10, 10px);
        background: color-mix(in srgb, var(--divider-color) 8%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 30%, transparent);
        min-width: 0;
      }
      .uc-boiler__metric--inline {
        flex-direction: row;
        gap: 8px;
        padding: 6px 10px;
      }
      .uc-boiler__metric--warn {
        border-color: color-mix(in srgb, var(--warning-color, #FF9800) 45%, transparent);
        background: color-mix(in srgb, var(--warning-color, #FF9800) 8%, transparent);
      }
      .uc-boiler__metric-head {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }
      .uc-boiler__metric-val {
        font-size: 15px;
        font-weight: 700;
        white-space: nowrap;
        line-height: 1.1;
      }
      .uc-boiler__metric--inline .uc-boiler__metric-val { font-size: 13px; }
      .uc-boiler__metric-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }

      .uc-boiler__target {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px;
        border-radius: var(--uc-r-10, 10px);
        background: color-mix(in srgb, var(--divider-color) 8%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 30%, transparent);
        width: fit-content;
      }
      .uc-boiler__target--fill {
        width: auto;
        justify-content: space-between;
      }
      .uc-boiler__target--fill .uc-boiler__target-val { flex: 1; }
      .uc-boiler__target-val {
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 1.15;
        min-width: 52px;
      }
      .uc-boiler__step {
        width: 30px;
        height: 30px;
        border-radius: var(--uc-r-8, 8px);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--divider-color) 18%, transparent);
        color: var(--primary-text-color);
      }
      .uc-boiler__step:hover { background: color-mix(in srgb, var(--divider-color) 30%, transparent); }
      .uc-boiler__step:disabled { opacity: 0.4; cursor: not-allowed; }

      /* Mode chips share each row evenly instead of leaving a gap at the end */
      .uc-boiler__modes {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 12px;
      }
      .uc-boiler__mode {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        flex: 1 1 calc(100% / var(--uc-boiler-mode-cols, 4) - 6px);
        min-width: 72px;
        white-space: nowrap;
        padding: 6px 12px;
        border-radius: var(--uc-r-16, 16px);
        border: 1px solid var(--divider-color);
        background: transparent;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-transform: capitalize;
      }
      .uc-boiler__mode:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ── Animations ── */
      .uc-boiler--pulse { animation: uc-boiler-pulse 2s ease-in-out infinite; }
      @keyframes uc-boiler-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.55; }
      }

      .uc-boiler-fan--spin {
        animation: uc-boiler-spin 1.4s linear infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes uc-boiler-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Flames stretch from their base (bottom of their own box) and shimmer */
      .uc-boiler-flame--flicker,
      .uc-boiler-flame--flicker2,
      .uc-boiler-flame--flicker3 {
        transform-box: fill-box;
        transform-origin: 50% 100%;
      }
      .uc-boiler-flame--flicker { animation: uc-boiler-flicker 0.55s ease-in-out infinite alternate; }
      .uc-boiler-flame--flicker2 { animation: uc-boiler-flicker 0.42s ease-in-out infinite alternate-reverse; }
      .uc-boiler-flame--flicker3 { animation: uc-boiler-flicker 0.63s ease-in-out infinite alternate; }
      @keyframes uc-boiler-flicker {
        from { opacity: 0.85; transform: scaleY(0.9) scaleX(1.04); }
        to { opacity: 1; transform: scaleY(1.08) scaleX(0.96); }
      }

      .uc-boiler-led--blink { animation: uc-boiler-led 1.6s ease-in-out infinite; }
      @keyframes uc-boiler-led {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }

      .uc-boiler-flow--down { animation: uc-boiler-flow-down 1s linear infinite; }
      .uc-boiler-flow--up { animation: uc-boiler-flow-up 1s linear infinite; }
      @keyframes uc-boiler-flow-down {
        from { stroke-dashoffset: 0; }
        to { stroke-dashoffset: -9; }
      }
      @keyframes uc-boiler-flow-up {
        from { stroke-dashoffset: 0; }
        to { stroke-dashoffset: -9; }
      }

      @media (prefers-reduced-motion: reduce) {
        .uc-boiler-fan--spin,
        .uc-boiler-flame--flicker,
        .uc-boiler-flame--flicker2,
        .uc-boiler-flame--flicker3,
        .uc-boiler-flow--down,
        .uc-boiler-flow--up,
        .uc-boiler-led--blink,
        .uc-boiler--pulse { animation: none; }
      }
    `;
  }
}
