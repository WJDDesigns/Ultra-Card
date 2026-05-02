import { TemplateResult, html, nothing } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { AlarmPanelModule as AlarmPanelModuleConfig, CardModule, UltraCardConfig } from '../types';

// ─── HA alarm_control_panel feature flags ────────────────────────────────────
const FEATURE_ARM_HOME          = 1;
const FEATURE_ARM_AWAY          = 2;
const FEATURE_ARM_NIGHT         = 4;
const FEATURE_ARM_VACATION      = 8;
const FEATURE_ARM_CUSTOM_BYPASS = 16;

// ─── Alarm state sets ─────────────────────────────────────────────────────────
const DISARMED_STATES  = new Set(['disarmed']);
const TRIGGERED_STATES = new Set(['triggered']);
const BUSY_STATES      = new Set(['arming', 'disarming', 'pending']);
const ARMED_STATES     = new Set(['armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass']);

type ArmMode = 'arm_home' | 'arm_away' | 'arm_night' | 'arm_vacation' | 'arm_custom_bypass';

function supportedFeatures(attrs: Record<string, unknown>): number {
  const v = attrs['supported_features'];
  return typeof v === 'number' ? v : 0;
}

/**
 * Alarm Panel Pro Module
 *
 * Arm, disarm, and monitor a Home Assistant alarm_control_panel entity
 * with three layouts: hero (full PIN pad + status ring), standard (row),
 * and compact (chip).
 */
export class UltraAlarmPanelModule extends BaseUltraModule {
  /** Per-entity optimistic pending state while HA catches up */
  private _pending = new Map<string, string>();
  /** Per-entity pending code buffer (digits typed in the keypad) */
  private _codeBuffer = new Map<string, string>();
  /** Which arm mode the user tapped (awaiting code entry) */
  private _pendingArmMode = new Map<string, ArmMode>();

  override handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'alarm_panel',
    title: 'Alarm Panel',
    description: 'Arm, disarm, and monitor your security alarm with a PIN pad and status ring',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:shield-home',
    category: 'interactive',
    tags: ['alarm', 'security', 'panel', 'keypad', 'pro', 'premium', 'arm', 'disarm'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): AlarmPanelModuleConfig {
    return {
      id: id || this.generateId('alarm_panel'),
      type: 'alarm_panel',
      entity: '',
      name: '',
      icon: '',
      layout: 'hero',
      show_title: true,
      show_icon: true,
      show_state: true,
      show_keypad: true,
      show_arm_home: undefined,
      show_arm_away: undefined,
      show_arm_night: undefined,
      show_arm_vacation: undefined,
      show_arm_custom: undefined,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as AlarmPanelModuleConfig;
    if (!module.id) errors.push('Module ID is required');
    if (!m.entity?.trim()) errors.push(localize('editor.alarm_panel.error_entity', 'en', 'Select an alarm_control_panel entity'));
    return { valid: errors.length === 0, errors };
  }

  // ── Editor ────────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as AlarmPanelModuleConfig;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">

        ${this.renderSettingsSection(
          localize('editor.alarm_panel.entity_section', lang, 'Alarm Entity'),
          localize('editor.alarm_panel.entity_section_desc', lang, 'Select the alarm_control_panel entity to control.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', m.entity || '',
            (value: string) => {
              updateModule({ entity: value });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            ['alarm_control_panel'],
            localize('editor.alarm_panel.entity', lang, 'Alarm entity')
          )}
        </div>

        ${this.renderSettingsSection(
          localize('editor.alarm_panel.display_section', lang, 'Display'),
          localize('editor.alarm_panel.display_desc', lang, 'Choose what to show.'),
          [
            {
              title: localize('editor.alarm_panel.show_title', lang, 'Show title'),
              description: localize('editor.alarm_panel.show_title_desc', lang, 'Display the alarm name'),
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => updateModule({ show_title: e.detail.value?.show_title ?? true }),
            },
            {
              title: localize('editor.alarm_panel.show_icon', lang, 'Show icon'),
              description: localize('editor.alarm_panel.show_icon_desc', lang, 'Show shield icon in the status ring'),
              hass,
              data: { show_icon: m.show_icon !== false },
              schema: [this.booleanField('show_icon')],
              onChange: (e: CustomEvent) => updateModule({ show_icon: e.detail.value?.show_icon ?? true }),
            },
            {
              title: localize('editor.alarm_panel.show_state', lang, 'Show state text'),
              description: localize('editor.alarm_panel.show_state_desc', lang, 'Display the alarm state badge'),
              hass,
              data: { show_state: m.show_state !== false },
              schema: [this.booleanField('show_state')],
              onChange: (e: CustomEvent) => updateModule({ show_state: e.detail.value?.show_state ?? true }),
            },
            {
              title: localize('editor.alarm_panel.show_keypad', lang, 'Show keypad'),
              description: localize('editor.alarm_panel.show_keypad_desc', lang, 'Always show the PIN keypad'),
              hass,
              data: { show_keypad: m.show_keypad !== false },
              schema: [this.booleanField('show_keypad')],
              onChange: (e: CustomEvent) => updateModule({ show_keypad: e.detail.value?.show_keypad ?? true }),
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.alarm_panel.layout_section', lang, 'Layout'),
          localize('editor.alarm_panel.layout_desc', lang, 'Visual style of the alarm panel.'),
          [
            {
              title: localize('editor.alarm_panel.layout', lang, 'Layout'),
              description: localize('editor.alarm_panel.layout_style_desc', lang, 'Hero shows full PIN pad, standard is a single row, compact is a chip'),
              hass,
              data: { layout: m.layout || 'hero' },
              schema: [this.selectField('layout', [
                { value: 'hero',     label: localize('editor.alarm_panel.layout_hero',     lang, 'Hero') },
                { value: 'standard', label: localize('editor.alarm_panel.layout_standard', lang, 'Standard') },
                { value: 'compact',  label: localize('editor.alarm_panel.layout_compact',  lang, 'Compact') },
              ])],
              onChange: (e: CustomEvent) => {
                updateModule({ layout: e.detail.value?.layout || 'hero' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.alarm_panel.arm_modes_section', lang, 'Arm Modes'),
          localize('editor.alarm_panel.arm_modes_desc', lang, 'Choose which arm mode buttons to show. Leave unset to auto-detect from the entity.'),
          [
            {
              title: localize('editor.alarm_panel.show_arm_home', lang, 'Show Arm Home'),
              description: localize('editor.alarm_panel.show_arm_home_desc', lang, 'Auto-detected when not set'),
              hass,
              data: { show_arm_home: m.show_arm_home ?? true },
              schema: [this.booleanField('show_arm_home')],
              onChange: (e: CustomEvent) => updateModule({ show_arm_home: e.detail.value?.show_arm_home ?? true }),
            },
            {
              title: localize('editor.alarm_panel.show_arm_away', lang, 'Show Arm Away'),
              description: localize('editor.alarm_panel.show_arm_away_desc', lang, 'Auto-detected when not set'),
              hass,
              data: { show_arm_away: m.show_arm_away ?? true },
              schema: [this.booleanField('show_arm_away')],
              onChange: (e: CustomEvent) => updateModule({ show_arm_away: e.detail.value?.show_arm_away ?? true }),
            },
            {
              title: localize('editor.alarm_panel.show_arm_night', lang, 'Show Arm Night'),
              description: localize('editor.alarm_panel.show_arm_night_desc', lang, 'Auto-detected when not set'),
              hass,
              data: { show_arm_night: m.show_arm_night ?? true },
              schema: [this.booleanField('show_arm_night')],
              onChange: (e: CustomEvent) => updateModule({ show_arm_night: e.detail.value?.show_arm_night ?? true }),
            },
            {
              title: localize('editor.alarm_panel.show_arm_vacation', lang, 'Show Arm Vacation'),
              description: localize('editor.alarm_panel.show_arm_vacation_desc', lang, 'Auto-detected when not set'),
              hass,
              data: { show_arm_vacation: m.show_arm_vacation ?? false },
              schema: [this.booleanField('show_arm_vacation')],
              onChange: (e: CustomEvent) => updateModule({ show_arm_vacation: e.detail.value?.show_arm_vacation ?? false }),
            },
            {
              title: localize('editor.alarm_panel.show_arm_custom', lang, 'Show Arm Custom Bypass'),
              description: localize('editor.alarm_panel.show_arm_custom_desc', lang, 'Auto-detected when not set'),
              hass,
              data: { show_arm_custom: m.show_arm_custom ?? false },
              schema: [this.booleanField('show_arm_custom')],
              onChange: (e: CustomEvent) => updateModule({ show_arm_custom: e.detail.value?.show_arm_custom ?? false }),
            },
          ]
        )}

      </div>
    `;
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  private _stateColor(stateStr: string): string {
    if (TRIGGERED_STATES.has(stateStr)) return 'var(--error-color, #db4437)';
    if (stateStr === 'armed_away' || stateStr === 'armed_vacation') return '#f59e0b';
    if (ARMED_STATES.has(stateStr)) return 'var(--primary-color)';
    if (BUSY_STATES.has(stateStr)) return '#f59e0b';
    return 'var(--success-color, #43a047)';
  }

  private _stateLabel(stateStr: string, lang: string): string {
    const map: Record<string, [string, string]> = {
      disarmed:             ['editor.alarm_panel.state_disarmed',             'Disarmed'],
      armed_home:           ['editor.alarm_panel.state_armed_home',           'Armed Home'],
      armed_away:           ['editor.alarm_panel.state_armed_away',           'Armed Away'],
      armed_night:          ['editor.alarm_panel.state_armed_night',          'Armed Night'],
      armed_vacation:       ['editor.alarm_panel.state_armed_vacation',       'Armed Vacation'],
      armed_custom_bypass:  ['editor.alarm_panel.state_armed_custom_bypass',  'Custom Bypass'],
      pending:              ['editor.alarm_panel.state_pending',              'Pending…'],
      arming:               ['editor.alarm_panel.state_arming',               'Arming…'],
      disarming:            ['editor.alarm_panel.state_disarming',            'Disarming…'],
      triggered:            ['editor.alarm_panel.state_triggered',            'TRIGGERED'],
      unavailable:          ['editor.alarm_panel.state_unavailable',          'Unavailable'],
    };
    const entry = map[stateStr];
    return entry ? localize(entry[0], lang, entry[1]) : stateStr.replace(/_/g, ' ');
  }

  private _armModeLabel(mode: ArmMode, lang: string): string {
    const map: Record<ArmMode, [string, string]> = {
      arm_home:           ['editor.alarm_panel.mode_home',    'Home'],
      arm_away:           ['editor.alarm_panel.mode_away',    'Away'],
      arm_night:          ['editor.alarm_panel.mode_night',   'Night'],
      arm_vacation:       ['editor.alarm_panel.mode_vacation','Vacation'],
      arm_custom_bypass:  ['editor.alarm_panel.mode_custom',  'Custom'],
    };
    const entry = map[mode];
    return entry ? localize(entry[0], lang, entry[1]) : mode;
  }

  private _armModeIcon(mode: ArmMode): string {
    const map: Record<ArmMode, string> = {
      arm_home:           'mdi:home',
      arm_away:           'mdi:car',
      arm_night:          'mdi:moon-waning-crescent',
      arm_vacation:       'mdi:airplane',
      arm_custom_bypass:  'mdi:shield-edit',
    };
    return map[mode];
  }

  /** Returns which arm modes are supported, respecting user config overrides. */
  private _getVisibleModes(m: AlarmPanelModuleConfig, sup: number): ArmMode[] {
    const modes: Array<[ArmMode, number, boolean | undefined]> = [
      ['arm_home',          FEATURE_ARM_HOME,          m.show_arm_home],
      ['arm_away',          FEATURE_ARM_AWAY,          m.show_arm_away],
      ['arm_night',         FEATURE_ARM_NIGHT,         m.show_arm_night],
      ['arm_vacation',      FEATURE_ARM_VACATION,      m.show_arm_vacation],
      ['arm_custom_bypass', FEATURE_ARM_CUSTOM_BYPASS, m.show_arm_custom],
    ];
    return modes
      .filter(([, flag, override]) => override !== false && ((override === true) || !!(sup & flag)))
      .map(([mode]) => mode);
  }

  private _appendDigit(entityId: string, digit: string): void {
    const current = this._codeBuffer.get(entityId) || '';
    if (current.length >= 8) return;
    this._codeBuffer.set(entityId, current + digit);
    this.triggerPreviewUpdate(true);
  }

  private _clearCode(entityId: string): void {
    this._codeBuffer.set(entityId, '');
    this.triggerPreviewUpdate(true);
  }

  private _callAlarm(
    hass: HomeAssistant,
    entityId: string,
    service: string,
    code: string
  ): void {
    const data: Record<string, string> = { entity_id: entityId };
    if (code) data.code = code;
    hass.callService('alarm_control_panel', service, data);
    this._codeBuffer.set(entityId, '');
    this._pendingArmMode.delete(entityId);
    this._pending.set(entityId, service);
    this.triggerPreviewUpdate(true);
  }

  /** Render the 3×4 PIN keypad */
  private _renderKeypad(entityId: string, hass: HomeAssistant, lang: string): TemplateResult {
    const code = this._codeBuffer.get(entityId) || '';
    const dots = code.replace(/./g, '●').padEnd(0, '○');
    const keys = ['1','2','3','4','5','6','7','8','9','*','0','#'];

    return html`
      <div class="uc-alarm-keypad" role="group" aria-label="${localize('editor.alarm_panel.keypad_label', lang, 'PIN keypad')}">
        <div class="uc-alarm-code-display" aria-live="polite">
          ${dots || html`<span style="opacity:0.3">${localize('editor.alarm_panel.code_placeholder', lang, 'Enter code')}</span>`}
        </div>
        <div class="uc-alarm-keypad-grid">
          ${keys.map(k => {
            if (k === '*') {
              return html`<button type="button" class="uc-alarm-key uc-alarm-key--action"
                @click=${() => this._clearCode(entityId)} aria-label="${localize('editor.alarm_panel.clear', lang, 'Clear')}">
                <ha-icon style="--mdc-icon-size:18px" icon="mdi:backspace-outline"></ha-icon>
              </button>`;
            }
            if (k === '#') {
              return html`<button type="button" class="uc-alarm-key uc-alarm-key--confirm ${code ? '' : 'uc-alarm-key--dim'}"
                @click=${() => {
                  const armMode = this._pendingArmMode.get(entityId);
                  if (armMode) {
                    this._callAlarm(hass, entityId, armMode, code);
                  } else {
                    this._callAlarm(hass, entityId, 'alarm_disarm', code);
                  }
                }}
                aria-label="${localize('editor.alarm_panel.confirm', lang, 'Confirm')}">
                <ha-icon style="--mdc-icon-size:18px" icon="mdi:check"></ha-icon>
              </button>`;
            }
            return html`<button type="button" class="uc-alarm-key"
              @click=${() => this._appendDigit(entityId, k)}>${k}</button>`;
          })}
        </div>
      </div>
    `;
  }

  // ── renderPreview ─────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as AlarmPanelModuleConfig;
    const lang = hass?.locale?.language || 'en';
    const entityId = this.resolveEntity(m.entity, config) || m.entity;

    if (!entityId || !hass?.states?.[entityId]) {
      return html`
        <style>${this.getStyles()}</style>
        <div class="uc-alarm-wrapper">
          ${this.renderGradientErrorState(
            localize('editor.alarm_panel.config_needed', lang, 'Select an alarm panel'),
            localize('editor.alarm_panel.config_needed_desc', lang, 'Choose an alarm_control_panel entity in the General tab'),
            'mdi:shield-home'
          )}
        </div>
      `;
    }

    const stateObj = hass.states[entityId];
    const attrs    = (stateObj.attributes || {}) as Record<string, unknown>;
    const stateStr = String(stateObj.state).toLowerCase();

    // Optimistic sync
    const pending = this._pending.get(entityId);
    if (pending) {
      const done = DISARMED_STATES.has(stateStr) || ARMED_STATES.has(stateStr) || TRIGGERED_STATES.has(stateStr);
      if (done) this._pending.delete(entityId);
    }

    const isDisarmed    = DISARMED_STATES.has(stateStr);
    const isTriggered   = TRIGGERED_STATES.has(stateStr);
    const isArmed       = ARMED_STATES.has(stateStr);
    const isBusy        = BUSY_STATES.has(stateStr);
    const isUnavailable = stateStr === 'unavailable' || stateStr === 'unknown';

    const stateColor = this._stateColor(stateStr);
    const stateLabel = this._stateLabel(stateStr, lang);

    const codeFormat   = attrs['code_format'] as string | null | undefined;
    const codeArmReq   = attrs['code_arm_required'] !== false;
    const sup          = supportedFeatures(attrs);
    const needsCode    = (isArmed || isTriggered || isBusy || (isDisarmed && codeArmReq));
    const showKeypad   = (m.show_keypad !== false) && needsCode && (codeFormat != null);
    const visibleModes = isDisarmed ? this._getVisibleModes(m, sup) : [];

    const name = m.name?.trim() ||
      (typeof attrs['friendly_name'] === 'string' ? attrs['friendly_name'] : '') ||
      entityId.split('.').pop()?.replace(/_/g, ' ') || 'Alarm';

    const iconName = m.icon?.trim() ||
      (isTriggered ? 'mdi:bell-ring' : isArmed ? 'mdi:shield-check' : 'mdi:shield-home-outline');

    const layout = m.layout || 'hero';

    const styleStr = (() => {
      const styles = this.buildDesignStyles(module, hass);
      return Object.entries(styles)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
        .join('; ');
    })();

    const hoverClass = this.getHoverEffectClass(module);

    // ── Arm mode buttons ─────────────────────────────────────────────────────
    const armButtons = () => html`
      <div class="uc-alarm-arm-btns" role="group" aria-label="${localize('editor.alarm_panel.arm_modes_label', lang, 'Arm modes')}">
        ${visibleModes.map(mode => html`
          <button type="button"
            class="uc-alarm-arm-btn ${this._pendingArmMode.get(entityId) === mode ? 'uc-alarm-arm-btn--active' : ''}"
            ?disabled=${isBusy || isUnavailable}
            @click=${() => {
              if (showKeypad) {
                this._pendingArmMode.set(entityId, mode);
                this._codeBuffer.set(entityId, '');
                this.triggerPreviewUpdate(true);
              } else {
                this._callAlarm(hass, entityId, mode, '');
              }
            }}
          >
            <ha-icon style="--mdc-icon-size:16px;" icon="${this._armModeIcon(mode)}"></ha-icon>
            ${this._armModeLabel(mode, lang)}
          </button>
        `)}
      </div>
    `;

    // ── Disarm button ─────────────────────────────────────────────────────────
    const disarmButton = () => {
      if (isDisarmed) return nothing;
      const hasCodeEntry = showKeypad && (this._codeBuffer.get(entityId) || '') !== '';
      if (showKeypad) return nothing; // keypad handles disarm via '#' key
      return html`
        <button type="button" class="uc-alarm-disarm-btn"
          ?disabled=${isBusy || isUnavailable}
          @click=${() => this._callAlarm(hass, entityId, 'alarm_disarm', '')}>
          <ha-icon style="--mdc-icon-size:18px" icon="mdi:shield-off-outline"></ha-icon>
          ${localize('editor.alarm_panel.action_disarm', lang, 'Disarm')}
        </button>
      `;
    };

    // ── HERO ─────────────────────────────────────────────────────────────────
    if (layout === 'hero') {
      const pendingArmMode = this._pendingArmMode.get(entityId);
      const codeBuffer = this._codeBuffer.get(entityId) || '';

      const actionArea = () => {
        if (isDisarmed && !pendingArmMode) {
          return html`${armButtons()}`;
        }
        if (isDisarmed && pendingArmMode && showKeypad) {
          return html`
            <div class="uc-alarm-pending-mode-label">
              <ha-icon style="--mdc-icon-size:16px; margin-right:6px;" icon="${this._armModeIcon(pendingArmMode)}"></ha-icon>
              ${localize('editor.alarm_panel.code_for', lang, 'Code for')} ${this._armModeLabel(pendingArmMode, lang)}
              <button type="button" class="uc-alarm-cancel-btn"
                @click=${() => { this._pendingArmMode.delete(entityId); this._codeBuffer.set(entityId, ''); this.triggerPreviewUpdate(true); }}>
                ${localize('editor.alarm_panel.cancel', lang, 'Cancel')}
              </button>
            </div>
            ${this._renderKeypad(entityId, hass, lang)}
          `;
        }
        if ((isArmed || isTriggered) && showKeypad) {
          return html`${this._renderKeypad(entityId, hass, lang)}`;
        }
        if (isArmed || isTriggered) {
          return html`${disarmButton()}`;
        }
        return nothing;
      };

      return html`
        <style>${this.getStyles()}</style>
        <div class="uc-alarm-wrapper ${hoverClass} ${isTriggered ? 'uc-alarm-wrapper--triggered' : ''}"
          style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 20px; overflow: hidden; ${styleStr}">
          ${this.wrapWithAnimation(html`
            <div class="uc-alarm uc-alarm--hero">

              <!-- Status ring -->
              <div class="uc-alarm__visual">
                <div class="uc-alarm__glow ${!isDisarmed ? 'uc-alarm__glow--on' : ''}"
                  style="--alarm-color:${stateColor}"></div>
                <div class="uc-alarm-ring ${isTriggered ? 'uc-alarm-ring--triggered' : ''}"
                  style="--alarm-color:${stateColor}">
                  ${m.show_icon !== false ? html`
                    <ha-icon icon="${iconName}"
                      style="--mdc-icon-size:52px; color:${stateColor}; transition: color 0.3s;"></ha-icon>
                  ` : nothing}
                </div>
              </div>

              <!-- Name + state badge -->
              <div class="uc-alarm__identity">
                ${m.show_title !== false ? html`<h2 class="uc-alarm-title">${name}</h2>` : nothing}
                ${m.show_state !== false ? html`
                  <span class="uc-alarm-badge" style="--alarm-color:${stateColor}">
                    ${!isDisarmed && !isUnavailable ? html`<span class="uc-alarm-dot"></span>` : nothing}
                    ${stateLabel}
                  </span>
                ` : nothing}
              </div>

              <!-- Action area (arm buttons / keypad / disarm) -->
              <div class="uc-alarm__actions">
                ${actionArea()}
              </div>
            </div>
          `, module, hass)}
        </div>
      `;
    }

    // ── STANDARD ─────────────────────────────────────────────────────────────
    if (layout === 'standard') {
      return html`
        <style>${this.getStyles()}</style>
        <div class="uc-alarm-wrapper ${hoverClass}"
          style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 16px; overflow: hidden; ${styleStr}">
          ${this.wrapWithAnimation(html`
            <div class="uc-alarm uc-alarm--standard">
              <div class="uc-alarm-std__row">
                ${m.show_icon !== false ? html`
                  <div class="uc-alarm-icon-well" style="--alarm-color:${stateColor}">
                    <ha-icon icon="${iconName}" style="--mdc-icon-size:26px; color:${stateColor};"></ha-icon>
                  </div>
                ` : nothing}
                <div class="uc-alarm-std__meta">
                  ${m.show_title !== false ? html`<h2 class="uc-alarm-std-title">${name}</h2>` : nothing}
                  ${m.show_state !== false ? html`<p class="uc-alarm-std-subtitle" style="color:${stateColor}">${stateLabel}</p>` : nothing}
                </div>
                <div class="uc-alarm-std__actions" role="group">
                  ${isDisarmed
                    ? visibleModes.slice(0, 2).map(mode => html`
                        <button type="button" class="uc-alarm-std-btn"
                          ?disabled=${isBusy || isUnavailable}
                          @click=${() => this._callAlarm(hass, entityId, mode, '')}>
                          <ha-icon style="--mdc-icon-size:15px;" icon="${this._armModeIcon(mode)}"></ha-icon>
                          ${this._armModeLabel(mode, lang)}
                        </button>
                      `)
                    : html`
                        <button type="button" class="uc-alarm-std-btn uc-alarm-std-btn--disarm"
                          ?disabled=${isBusy || isUnavailable}
                          @click=${() => this._callAlarm(hass, entityId, 'alarm_disarm', '')}>
                          <ha-icon style="--mdc-icon-size:15px;" icon="mdi:shield-off-outline"></ha-icon>
                          ${localize('editor.alarm_panel.action_disarm', lang, 'Disarm')}
                        </button>
                      `}
                </div>
              </div>
              ${showKeypad ? this._renderKeypad(entityId, hass, lang) : nothing}
            </div>
          `, module, hass)}
        </div>
      `;
    }

    // ── COMPACT ───────────────────────────────────────────────────────────────
    return html`
      <style>${this.getStyles()}</style>
      <div class="uc-alarm-wrapper ${hoverClass}"
        style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 999px; overflow: hidden; ${styleStr}">
        ${this.wrapWithAnimation(html`
          <div class="uc-alarm uc-alarm--compact">
            <div class="uc-alarm-compact__row">
              ${m.show_icon !== false ? html`
                <div class="uc-alarm-icon-compact" style="--alarm-color:${stateColor}">
                  <ha-icon icon="${iconName}" style="--mdc-icon-size:16px; color:${stateColor};"></ha-icon>
                </div>
              ` : nothing}
              <span class="uc-alarm-compact-label" style="color:${stateColor}">
                ${m.show_title !== false ? html`${name} · ` : nothing}${stateLabel}
              </span>
              ${isDisarmed
                ? html`
                    <button type="button" class="uc-alarm-compact-btn"
                      ?disabled=${isBusy || isUnavailable}
                      @click=${() => this._callAlarm(hass, entityId, 'arm_away', '')}>
                      <ha-icon style="--mdc-icon-size:13px;" icon="mdi:shield-check"></ha-icon>
                      ${localize('editor.alarm_panel.action_arm', lang, 'Arm')}
                    </button>
                  `
                : html`
                    <button type="button" class="uc-alarm-compact-btn uc-alarm-compact-btn--disarm"
                      ?disabled=${isBusy || isUnavailable}
                      @click=${() => this._callAlarm(hass, entityId, 'alarm_disarm', '')}>
                      <ha-icon style="--mdc-icon-size:13px;" icon="mdi:shield-off-outline"></ha-icon>
                      ${localize('editor.alarm_panel.action_disarm', lang, 'Disarm')}
                    </button>
                  `}
            </div>
          </div>
        `, module, hass)}
      </div>
    `;
  }

  // ── CSS ───────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      .uc-alarm-wrapper { box-sizing: border-box; }
      .uc-alarm { box-sizing: border-box; color: var(--primary-text-color); }

      /* ═══ HERO ══════════════════════════════════════════════════════ */
      .uc-alarm--hero {
        padding: 28px 20px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
      }

      /* Status ring */
      .uc-alarm__visual {
        position: relative;
        width: 148px;
        height: 148px;
        flex-shrink: 0;
      }
      .uc-alarm__glow {
        position: absolute;
        inset: -16px;
        border-radius: 50%;
        background: radial-gradient(circle, color-mix(in srgb, var(--alarm-color) 14%, transparent) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }
      .uc-alarm__glow--on { opacity: 1; }
      .uc-alarm-ring {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(
          circle at 38% 32%,
          color-mix(in srgb, var(--alarm-color) 10%, var(--card-background-color, var(--ha-card-background))) 0%,
          color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 90%, var(--alarm-color)) 100%
        );
        border: 2px solid color-mix(in srgb, var(--alarm-color) 35%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 18px rgba(0,0,0,0.12),
                    0 0 0 6px color-mix(in srgb, var(--alarm-color) 8%, transparent);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        z-index: 1;
      }
      @keyframes uc-alarm-pulse {
        0%, 100% { box-shadow: inset 0 2px 18px rgba(0,0,0,0.12), 0 0 0 6px color-mix(in srgb, var(--error-color, #db4437) 12%, transparent); }
        50%       { box-shadow: inset 0 2px 18px rgba(0,0,0,0.12), 0 0 0 18px color-mix(in srgb, var(--error-color, #db4437) 4%, transparent); }
      }
      @media (prefers-reduced-motion: no-preference) {
        .uc-alarm-ring--triggered { animation: uc-alarm-pulse 1.2s ease-in-out infinite; }
      }

      /* Identity row */
      .uc-alarm__identity {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
      }
      .uc-alarm-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--primary-text-color);
      }
      .uc-alarm-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 5px 16px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: color-mix(in srgb, var(--alarm-color) 10%, var(--card-background-color, var(--ha-card-background)));
        color: var(--alarm-color);
        border: 1px solid color-mix(in srgb, var(--alarm-color) 28%, transparent);
      }
      .uc-alarm-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--alarm-color);
        box-shadow: 0 0 6px color-mix(in srgb, var(--alarm-color) 65%, transparent);
        flex-shrink: 0;
      }

      /* Actions area */
      .uc-alarm__actions { width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; gap: 12px; }

      /* Arm mode buttons */
      .uc-alarm-arm-btns { display: flex; flex-wrap: wrap; gap: 8px; width: 100%; justify-content: center; }
      .uc-alarm-arm-btn {
        flex: 1 1 auto;
        min-width: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        padding: 10px 14px;
        border-radius: 14px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        background: color-mix(in srgb, var(--divider-color) 6%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-text-color);
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
      }
      .uc-alarm-arm-btn:active:not(:disabled) { transform: scale(0.97); }
      .uc-alarm-arm-btn:disabled { opacity: 0.38; cursor: not-allowed; }
      .uc-alarm-arm-btn--active, .uc-alarm-arm-btn:hover:not(:disabled) {
        border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
        background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-color);
      }

      .uc-alarm-disarm-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 700;
        padding: 12px 20px;
        border-radius: 14px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--success-color, #43a047) 45%, transparent);
        background: color-mix(in srgb, var(--success-color, #43a047) 10%, var(--card-background-color, var(--ha-card-background)));
        color: var(--success-color, #43a047);
        transition: background 0.15s, transform 0.1s;
      }
      .uc-alarm-disarm-btn:active:not(:disabled) { transform: scale(0.98); }
      .uc-alarm-disarm-btn:disabled { opacity: 0.38; cursor: not-allowed; }

      /* Pending arm mode label */
      .uc-alarm-pending-mode-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--secondary-text-color);
        padding: 4px 0;
      }
      .uc-alarm-cancel-btn {
        margin-left: 8px;
        font: inherit;
        font-size: 0.75rem;
        padding: 3px 10px;
        border-radius: 999px;
        cursor: pointer;
        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
        background: transparent;
        color: var(--secondary-text-color);
        transition: background 0.1s;
      }
      .uc-alarm-cancel-btn:hover { background: color-mix(in srgb, var(--divider-color) 12%, transparent); }

      /* ═══ KEYPAD ═════════════════════════════════════════════════════ */
      .uc-alarm-keypad { width: 100%; max-width: 220px; display: flex; flex-direction: column; gap: 10px; }
      .uc-alarm-code-display {
        text-align: center;
        font-size: 1.25rem;
        letter-spacing: 0.25em;
        font-weight: 600;
        min-height: 34px;
        color: var(--primary-text-color);
        padding: 4px 0;
      }
      .uc-alarm-keypad-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .uc-alarm-key {
        aspect-ratio: 1;
        font: inherit;
        font-size: 1.125rem;
        font-weight: 600;
        border-radius: 50%;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
        background: color-mix(in srgb, var(--divider-color) 6%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s, transform 0.1s;
        min-height: 48px;
      }
      .uc-alarm-key:active:not(:disabled) { transform: scale(0.92); background: color-mix(in srgb, var(--primary-color) 14%, var(--card-background-color, var(--ha-card-background))); }
      .uc-alarm-key--action {
        background: transparent;
        border-color: transparent;
        color: var(--secondary-text-color);
      }
      .uc-alarm-key--confirm {
        background: color-mix(in srgb, var(--success-color, #43a047) 14%, var(--card-background-color, var(--ha-card-background)));
        border-color: color-mix(in srgb, var(--success-color, #43a047) 40%, transparent);
        color: var(--success-color, #43a047);
      }
      .uc-alarm-key--dim { opacity: 0.35; cursor: default; }

      /* ═══ STANDARD ═══════════════════════════════════════════════════ */
      .uc-alarm--standard { padding: 14px 16px; }
      .uc-alarm-std__row { display: flex; align-items: center; gap: 12px; }
      .uc-alarm-icon-well {
        flex-shrink: 0;
        width: 44px; height: 44px;
        border-radius: 50%;
        border: 1.5px solid color-mix(in srgb, var(--alarm-color) 35%, transparent);
        background: color-mix(in srgb, var(--alarm-color) 10%, var(--card-background-color, var(--ha-card-background)));
        display: flex; align-items: center; justify-content: center;
      }
      .uc-alarm-std__meta { flex: 1; min-width: 0; overflow: hidden; }
      .uc-alarm-std-title { margin: 0; font-size: 0.9375rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .uc-alarm-std-subtitle { margin: 3px 0 0; font-size: 0.8125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .uc-alarm-std__actions { flex-shrink: 0; display: flex; gap: 6px; flex-wrap: wrap; max-width: 220px; }
      .uc-alarm-std-btn {
        display: flex; align-items: center; gap: 5px;
        font: inherit; font-size: 0.78rem; font-weight: 700;
        padding: 7px 12px; border-radius: 999px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        background: color-mix(in srgb, var(--divider-color) 6%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-text-color);
        white-space: nowrap;
        transition: background 0.12s, transform 0.1s;
      }
      .uc-alarm-std-btn:disabled { opacity: 0.38; cursor: not-allowed; }
      .uc-alarm-std-btn--disarm {
        border-color: color-mix(in srgb, var(--success-color, #43a047) 45%, transparent);
        color: var(--success-color, #43a047);
      }

      /* ═══ COMPACT ═══════════════════════════════════════════════════ */
      .uc-alarm--compact { padding: 7px 12px; }
      .uc-alarm-compact__row { display: flex; align-items: center; gap: 8px; }
      .uc-alarm-icon-compact {
        flex-shrink: 0;
        width: 26px; height: 26px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--alarm-color) 10%, transparent);
        display: flex; align-items: center; justify-content: center;
      }
      .uc-alarm-compact-label {
        flex: 1; min-width: 0;
        font-size: 0.8125rem; font-weight: 600;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .uc-alarm-compact-btn {
        flex-shrink: 0;
        display: flex; align-items: center; gap: 4px;
        font: inherit; font-size: 0.75rem; font-weight: 700;
        padding: 5px 12px; border-radius: 999px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        background: color-mix(in srgb, var(--divider-color) 6%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-text-color);
        transition: background 0.12s;
      }
      .uc-alarm-compact-btn:disabled { opacity: 0.38; cursor: not-allowed; }
      .uc-alarm-compact-btn--disarm {
        border-color: color-mix(in srgb, var(--success-color, #43a047) 45%, transparent);
        color: var(--success-color, #43a047);
      }

      /* Triggered wrapper highlight */
      .uc-alarm-wrapper--triggered {
        outline: 2px solid color-mix(in srgb, var(--error-color, #db4437) 45%, transparent);
      }

      @media (prefers-reduced-motion: reduce) {
        .uc-alarm-ring--triggered { animation: none; }
      }
    `;
  }
}
