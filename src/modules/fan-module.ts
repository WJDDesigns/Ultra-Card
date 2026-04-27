import { TemplateResult, html, svg, nothing } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, FanModule as FanModuleConfig, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';

/** Home Assistant FanEntityFeature (bitmask) */
const FAN_SET_SPEED = 1;
const FAN_OSCILLATE = 2;
const FAN_DIRECTION = 4;
const FAN_PRESET_MODE = 8;
const FAN_TURN_OFF = 16;
const FAN_TURN_ON = 32;

function fanSupportedFeatures(attrs: Record<string, unknown>): number {
  const v = attrs.supported_features;
  return typeof v === 'number' ? v : 0;
}

function fanIsOn(state: string, attrs: Record<string, unknown>): boolean {
  if (state === 'on') return true;
  if (state === 'off' || state === 'unavailable' || state === 'unknown') return false;
  const pct = attrs.percentage;
  if (typeof pct === 'number' && pct > 0) return true;
  const pm = attrs.preset_mode;
  if (typeof pm === 'string' && pm.length > 0) return true;
  return false;
}

function spinDurationSec(percentage: number | undefined, isOn: boolean): string {
  if (!isOn) return '0s';
  const p = percentage === undefined ? 100 : Math.max(1, Math.min(100, percentage));
  // Faster spin at higher percentage: ~2.4s at 1% down to ~0.38s at 100%
  const sec = Math.max(0.38, 2.35 - (p / 100) * 1.97);
  return `${sec.toFixed(2)}s`;
}

/** Preset / mode labels for display only (service calls still use raw HA strings). */
/** Hero stage circle (px) — keep aligned with `.uc-fan-circle` width/height in getStyles */
const FAN_HERO_CIRCLE_PX = 148;
/**
 * Hero fan graphic size (px): same fill ratio as standard layout (46px SVG in a 46px well),
 * i.e. the blades span the circle diameter like the header icon fills its disc.
 */
const FAN_HERO_GRAPHIC_PX = FAN_HERO_CIRCLE_PX;

function formatPresetDisplay(pm: string): string {
  const s = pm.trim();
  if (!s) return s;
  return s
    .replace(/_/g, ' ')
    .split(/\s+/)
    .map(part => {
      if (!part) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Fan Module — control Home Assistant fan entities with animated visuals.
 */
export class UltraFanModule extends BaseUltraModule {
  /**
   * Optimistic fan speed (0–100) keyed by entity id. Home Assistant applies
   * `set_percentage` asynchronously; this keeps the slider, gauge, chip %, and
   * spin animation in sync until state catches up.
   */
  private _fanSpeedOverride = new Map<string, number>();

  override handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'fan',
    title: 'Fan Control',
    description: 'Modern fan control with speed, presets, oscillation, and direction',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:fan',
    category: 'interactive',
    tags: ['fan', 'speed', 'hvac', 'air', 'interactive'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): FanModuleConfig {
    return {
      id: id || this.generateId('fan'),
      type: 'fan',
      entity: '',
      name: '',
      icon: '',
      layout: 'standard',
      alignment: 'center',
      show_title: true,
      show_icon: true,
      show_state: true,
      show_percentage: true,
      show_percentage_control: true,
      show_preset_modes: true,
      show_oscillate: true,
      show_direction: true,
      show_speed_steppers: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const fan = module as FanModuleConfig;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type || module.type !== 'fan') errors.push('Module type must be fan');
    if (!fan.entity?.trim()) errors.push(localize('editor.fan.error_entity', 'en', 'Select a fan entity'));
    return { valid: errors.length === 0, errors };
  }

  private getLayoutOptions(
    lang: string
  ): Array<{ value: NonNullable<FanModuleConfig['layout']>; label: string }> {
    return [
      { value: 'hero', label: localize('editor.fan.layout_hero', lang, 'Hero') },
      { value: 'standard', label: localize('editor.fan.layout_standard', lang, 'Standard') },
      { value: 'compact', label: localize('editor.fan.layout_compact', lang, 'Compact') },
    ];
  }

  private getAlignmentOptions(lang: string): Array<{ value: 'left' | 'center' | 'right'; label: string }> {
    return [
      { value: 'left', label: localize('editor.fan.alignment_left', lang, 'Left') },
      { value: 'center', label: localize('editor.fan.alignment_center', lang, 'Center') },
      { value: 'right', label: localize('editor.fan.alignment_right', lang, 'Right') },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const fan = module as FanModuleConfig;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.fan.entity_section', lang, 'Entity'),
          localize('editor.fan.entity_desc', lang, 'Select the fan to control.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', fan.entity || '',
            (value: string) => {
              updateModule({ entity: value });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            ['fan'],
            localize('editor.fan.entity', lang, 'Fan entity')
          )}
        </div>
        ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.fan.icon_override', lang, 'Icon override'),
              description: localize(
                'editor.fan.icon_override_desc',
                lang,
                'Optional mdi: icon; leave empty for the animated fan graphic'
              ),
              hass,
              data: { icon: fan.icon || '' },
              schema: [this.textField('icon')],
              onChange: (e: CustomEvent) =>
                updateModule({ icon: (e.detail.value?.icon as string) ?? '' }),
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.fan.display_section', lang, 'Display'),
          localize('editor.fan.display_desc', lang, 'Choose what to show on the card.'),
          [
            {
              title: localize('editor.fan.show_title', lang, 'Show title'),
              description: localize('editor.fan.show_title_desc', lang, 'Display the fan name'),
              hass,
              data: { show_title: fan.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_title: e.detail.value?.show_title ?? true }),
            },
            {
              title: localize('editor.fan.show_icon', lang, 'Show icon'),
              description: localize('editor.fan.show_icon_desc', lang, 'Show header icon (layout standard/compact)'),
              hass,
              data: { show_icon: fan.show_icon !== false },
              schema: [this.booleanField('show_icon')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_icon: e.detail.value?.show_icon ?? true }),
            },
            {
              title: localize('editor.fan.show_state', lang, 'Show state'),
              description: localize('editor.fan.show_state_desc', lang, 'Display on/off and mode text'),
              hass,
              data: { show_state: fan.show_state !== false },
              schema: [this.booleanField('show_state')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_state: e.detail.value?.show_state ?? true }),
            },
            {
              title: localize('editor.fan.show_percentage', lang, 'Show percentage'),
              description: localize('editor.fan.show_percentage_desc', lang, 'Show speed bar and value when supported'),
              hass,
              data: { show_percentage: fan.show_percentage !== false },
              schema: [this.booleanField('show_percentage')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_percentage: e.detail.value?.show_percentage ?? true }),
            },
            {
              title: localize('editor.fan.show_percentage_control', lang, 'Show speed slider'),
              description: localize('editor.fan.show_percentage_control_desc', lang, 'Allow 0–100% when supported'),
              hass,
              data: { show_percentage_control: fan.show_percentage_control !== false },
              schema: [this.booleanField('show_percentage_control')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_percentage_control: e.detail.value?.show_percentage_control ?? true }),
            },
            {
              title: localize('editor.fan.show_preset_modes', lang, 'Show preset modes'),
              description: localize('editor.fan.show_preset_modes_desc', lang, 'Preset chips when supported'),
              hass,
              data: { show_preset_modes: fan.show_preset_modes !== false },
              schema: [this.booleanField('show_preset_modes')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_preset_modes: e.detail.value?.show_preset_modes ?? true }),
            },
            {
              title: localize('editor.fan.show_oscillate', lang, 'Show oscillate'),
              description: localize('editor.fan.show_oscillate_desc', lang, 'Oscillation toggle when supported'),
              hass,
              data: { show_oscillate: fan.show_oscillate !== false },
              schema: [this.booleanField('show_oscillate')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_oscillate: e.detail.value?.show_oscillate ?? true }),
            },
            {
              title: localize('editor.fan.show_direction', lang, 'Show direction'),
              description: localize('editor.fan.show_direction_desc', lang, 'Forward / reverse when supported'),
              hass,
              data: { show_direction: fan.show_direction !== false },
              schema: [this.booleanField('show_direction')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_direction: e.detail.value?.show_direction ?? true }),
            },
            {
              title: localize('editor.fan.show_speed_steppers', lang, 'Show speed steppers'),
              description: localize('editor.fan.show_speed_steppers_desc', lang, 'Increase / decrease speed buttons'),
              hass,
              data: { show_speed_steppers: fan.show_speed_steppers !== false },
              schema: [this.booleanField('show_speed_steppers')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_speed_steppers: e.detail.value?.show_speed_steppers ?? true }),
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.fan.layout_section', lang, 'Layout'),
          localize('editor.fan.layout_desc', lang, 'Visual style and alignment.'),
          [
            {
              title: localize('editor.fan.layout', lang, 'Layout'),
              description: localize('editor.fan.layout_style_desc', lang, 'Hero, standard, or compact'),
              hass,
              data: { layout: fan.layout || 'standard' },
              schema: [this.selectField('layout', this.getLayoutOptions(lang))],
              onChange: (e: CustomEvent) => {
                updateModule({ layout: e.detail.value?.layout || 'standard' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.fan.alignment', lang, 'Alignment'),
              description: localize('editor.fan.alignment_desc', lang, 'Align content'),
              hass,
              data: { alignment: fan.alignment || 'center' },
              schema: [this.selectField('alignment', this.getAlignmentOptions(lang))],
              onChange: (e: CustomEvent) => {
                updateModule({ alignment: e.detail.value?.alignment || 'center' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}
      </div>
    `;
  }

  // ─────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────

  /** Inject module CSS directly into the preview output so the editor preview matches the dashboard. */
  private injectFanStyles(): TemplateResult {
    return html`<style>
      ${this.getStyles()}
    </style>`;
  }

  /** SVG fan blades; `size` is viewBox 100 units displayed at px */
  private renderFanBladesSvg(
    moduleId: string,
    size: number,
    spinDuration: string,
    spinning: boolean
  ): TemplateResult {
    const _gradId = `uc-fan-grad-${String(moduleId || 'fan').replace(/[^a-zA-Z0-9_-]/g, '')}`;
    return html`
      <svg
        class="uc-fan-svg"
        viewBox="0 0 100 100"
        width="${size}"
        height="${size}"
        style="display: block; color: var(--primary-color);"
        aria-hidden="true"
      >
        <g
          class="uc-fan-blades ${spinning ? 'uc-fan-blades--spin' : ''}"
          style="transform-origin: 50px 50px; --uc-fan-dur: ${spinDuration};"
        >
          ${[0, 90, 180, 270].map(
            rot => svg`
              <g transform="rotate(${rot} 50 50)">
                <path
                  d="M 50,42 C 46,36 43,22 46,12 C 48,6 54,8 56,16 C 58,24 54,36 50,42 Z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </g>
            `
          )}
        </g>
        <circle cx="50" cy="50" r="9" fill="var(--card-background-color, var(--ha-card-background, #111))" />
        <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.95" />
        <circle cx="50" cy="50" r="2.5" fill="var(--card-background-color, var(--ha-card-background, #111))" opacity="0.65" />
      </svg>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const fan = module as FanModuleConfig;
    const entityId = this.resolveEntity(fan.entity, config) || fan.entity;
    const lang = hass?.locale?.language || 'en';

    if (!entityId || !hass?.states?.[entityId]) {
      return html`
        ${this.injectFanStyles()}
        <div class="uc-fan-wrapper" style="border-radius: 16px; overflow: hidden;">
          ${this.renderGradientErrorState(
            localize('editor.fan.config_needed', lang, 'Select a fan'),
            localize('editor.fan.config_needed_desc', lang, 'Choose a fan entity in the General tab'),
            'mdi:fan'
          )}
        </div>
      `;
    }

    const state = hass.states[entityId];
    const attrs = (state.attributes || {}) as Record<string, unknown>;
    const sup = fanSupportedFeatures(attrs);
    const hasSetSpeed  = (sup & FAN_SET_SPEED) !== 0;
    const hasOscillate = (sup & FAN_OSCILLATE) !== 0;
    const hasDirection = (sup & FAN_DIRECTION) !== 0;
    const hasPresetMode = (sup & FAN_PRESET_MODE) !== 0;
    const hasTurnOn  = (sup & FAN_TURN_ON) !== 0;
    const hasTurnOff = (sup & FAN_TURN_OFF) !== 0;

    const stateStr = String(state.state);
    const isUnavailable = stateStr === 'unavailable' || stateStr === 'unknown';
    const isOn = !isUnavailable && fanIsOn(stateStr, attrs);

    const percentageRaw = attrs.percentage;
    const percentage =
      typeof percentageRaw === 'number' ? Math.max(0, Math.min(100, percentageRaw)) : undefined;
    const presetMode = typeof attrs.preset_mode === 'string' ? attrs.preset_mode : undefined;
    const presetModes = Array.isArray(attrs.preset_modes)
      ? (attrs.preset_modes as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];
    const oscillating = attrs.oscillating === true;
    const direction = typeof attrs.direction === 'string' ? attrs.direction : undefined;

    let speedOverride = this._fanSpeedOverride.get(entityId);
    if (speedOverride !== undefined && percentage !== undefined) {
      if (Math.abs(percentage - speedOverride) <= 1) {
        this._fanSpeedOverride.delete(entityId);
        speedOverride = undefined;
      }
    }
    const displaySpeedPct = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          speedOverride !== undefined
            ? speedOverride
            : percentage !== undefined
              ? percentage
              : isOn
                ? 100
                : 0
        )
      )
    );
    const pctForBar = displaySpeedPct;
    const spinDur = spinDurationSec(isOn ? displaySpeedPct : undefined, isOn);

    const showTitle   = fan.show_title !== false;
    const showIcon    = fan.show_icon !== false;
    const showState   = fan.show_state !== false;
    const showPct     = fan.show_percentage !== false && hasSetSpeed;
    const showPctCtrl = fan.show_percentage_control !== false && hasSetSpeed;
    const showPresets = fan.show_preset_modes !== false && hasPresetMode && presetModes.length > 0;
    const showOsc     = fan.show_oscillate !== false && hasOscillate;
    const showDir     = fan.show_direction !== false && hasDirection;
    const showSteppers = fan.show_speed_steppers !== false && hasSetSpeed;

    const layout    = fan.layout || 'standard';
    const alignment = fan.alignment || 'center';
    const iconOverride = fan.icon?.trim();

    const name =
      fan.name?.trim() ||
      (typeof attrs.friendly_name === 'string' ? attrs.friendly_name : '') ||
      entityId.split('.').pop()?.replace(/_/g, ' ') ||
      'Fan';

    const stateLabel = (() => {
      if (isUnavailable) return localize('editor.fan.unavailable', lang, 'Unavailable');
      if (isOn) {
        if (presetMode) return formatPresetDisplay(presetMode);
        if (hasSetSpeed) return `${displaySpeedPct}% Speed`;
        return localize('editor.fan.state_on', lang, 'On');
      }
      return localize('editor.fan.state_off', lang, 'Off');
    })();

    const call = (service: string, data: Record<string, unknown> = {}) => {
      hass.callService('fan', service, { entity_id: entityId, ...data });
    };
    const toggleFan = () => {
      this._fanSpeedOverride.delete(entityId);
      if (hasTurnOn && hasTurnOff) hass.callService('fan', 'toggle', { entity_id: entityId });
      else if (isOn && hasTurnOff) call('turn_off');
      else if (!isOn && hasTurnOn) call('turn_on');
      this.triggerPreviewUpdate(true);
    };
    const setPercentage = (pct: number) => {
      const v = Math.max(0, Math.min(100, Math.round(pct)));
      if (v === 0 && hasTurnOff) call('turn_off');
      else call('set_percentage', { percentage: v });
    };
    /** Slider input: optimistic UI + service call + force card re-render */
    const onSpeedInput = (e: Event) => {
      const v = Math.max(0, Math.min(100, Math.round(Number((e.target as HTMLInputElement).value))));
      this._fanSpeedOverride.set(entityId, v);
      setPercentage(v);
      this.triggerPreviewUpdate(true);
    };

    /** Fan graphic — SVG or MDI icon */
    const fanGraphic = (sz: number) =>
      iconOverride
        ? html`<ha-icon
            class="${isOn && !isUnavailable ? 'uc-fan-mdi-spin' : ''}"
            style="font-size: ${sz}px; color: var(--primary-color); --uc-fan-dur: ${spinDur};"
            icon="${iconOverride}"
          ></ha-icon>`
        : this.renderFanBladesSvg(module.id, sz, spinDur, isOn && !isUnavailable);

    /** Small icon well (standard/compact) */
    const iconWell = (sz: number, wellClass: string) => html`
      <div class="uc-fan-icon-well ${wellClass} ${isOn ? 'uc-fan-icon-well--on' : ''}">
        ${fanGraphic(sz)}
      </div>
    `;

    /** Speed section — label + value on top, then a combined fill-under-slider */
    const speedSection = (big: boolean) =>
      hasSetSpeed && (showPct || showPctCtrl)
        ? html`
            <div class="uc-fan-speed-section">
              <div class="uc-fan-speed__row">
                <span class="uc-fan-section-label">
                  ${localize('editor.fan.speed', lang, 'Speed')}
                </span>
                ${showPct && hasSetSpeed
                  ? big
                    ? html`<span class="uc-fan-speed__big">${displaySpeedPct}<span class="uc-fan-speed__unit">%</span></span>`
                    : html`<span class="uc-fan-speed__sm">${displaySpeedPct}%</span>`
                  : nothing}
              </div>
              ${showPctCtrl
                ? html`
                    <div
                      class="uc-fan-slider-combo"
                      style="--uc-fan-pct: ${displaySpeedPct};"
                    >
                      <div class="uc-fan-slider-fill"></div>
                      <input
                        type="range"
                        class="uc-fan-range"
                        min="0"
                        max="100"
                        .value=${String(displaySpeedPct)}
                        @input=${onSpeedInput}
                        ?disabled=${isUnavailable}
                      />
                    </div>
                  `
                : showPct
                  ? html`<div class="uc-fan-track">
                      <div class="uc-fan-track__fill" style="width: ${pctForBar}%;"></div>
                    </div>`
                  : nothing}
            </div>
          `
        : nothing;

    /**
     * Presets + Direction — two-column block.
     * Oscillate sits below as its own standalone chip row.
     */
    const modesBlock =
      showPresets || showDir
        ? html`
            <div class="uc-fan-two-col">
              ${showPresets
                ? html`
                    <div class="uc-fan-col">
                      <p class="uc-fan-section-label">
                        ${localize('editor.fan.presets_label', lang, 'Airflow Mode')}
                      </p>
                      <div class="uc-fan-chips">
                        ${presetModes.map(
                          pm => html`
                            <button
                              type="button"
                              class="uc-fan-chip ${presetMode === pm ? 'is-active' : ''}"
                              @click=${() => call('set_preset_mode', { preset_mode: pm })}
                              ?disabled=${isUnavailable}
                            >
                              ${formatPresetDisplay(pm)}
                            </button>
                          `
                        )}
                      </div>
                    </div>
                  `
                : nothing}
              ${showDir
                ? html`
                    <div class="uc-fan-col">
                      <p class="uc-fan-section-label">
                        ${localize('editor.fan.direction', lang, 'Direction')}
                      </p>
                      <div class="uc-fan-chips">
                        <button
                          type="button"
                          class="uc-fan-chip ${direction === 'forward' ? 'is-active' : ''}"
                          @click=${() => call('set_direction', { direction: 'forward' })}
                          ?disabled=${isUnavailable}
                        >
                          ${localize('editor.fan.forward', lang, 'Forward')}
                        </button>
                        <button
                          type="button"
                          class="uc-fan-chip ${direction === 'reverse' ? 'is-active' : ''}"
                          @click=${() => call('set_direction', { direction: 'reverse' })}
                          ?disabled=${isUnavailable}
                        >
                          ${localize('editor.fan.reverse', lang, 'Reverse')}
                        </button>
                      </div>
                    </div>
                  `
                : nothing}
            </div>
          `
        : nothing;

    const oscillateBlock = showOsc
      ? html`
          <div class="uc-fan-chips">
            <button
              type="button"
              class="uc-fan-chip ${oscillating ? 'is-active' : ''}"
              @click=${() => call('oscillate', { oscillating: !oscillating })}
              ?disabled=${isUnavailable}
            >
              ${localize('editor.fan.oscillate', lang, 'Oscillate')}
            </button>
          </div>
        `
      : nothing;

    /** Power button — compact: small pill; standard: small pill; hero: full-width */
    const powerBtn = (size: 'compact' | 'standard' | 'hero') =>
      hasTurnOn || hasTurnOff
        ? html`<button
            type="button"
            class="uc-fan-power-btn ${isOn ? '' : 'uc-fan-power-btn--off'} ${size === 'compact' || size === 'standard' ? 'uc-fan-power-btn--sm' : 'uc-fan-power-btn--full'}"
            @click=${toggleFan}
            ?disabled=${isUnavailable}
          >
            ${isOn
              ? localize('editor.fan.turn_off', lang, 'Turn off')
              : localize('editor.fan.turn_on', lang, 'Turn on')}
          </button>`
        : nothing;

    // ─── LAYOUTS ───────────────────────────────────────────────────────────

    let content: TemplateResult;

    if (layout === 'hero') {
      content = html`
        <div class="uc-fan uc-fan-hero uc-fan-align-${alignment}">
          <div class="uc-fan-hero__grid">
            <!-- Circle stage -->
            <div class="uc-fan-hero__stage">
              <div class="uc-fan-circle ${isOn ? 'uc-fan-circle--on' : ''}">
                ${fanGraphic(FAN_HERO_GRAPHIC_PX)}
              </div>
              ${showTitle || showState
                ? html`
                    <div class="uc-fan-hero__ident">
                      ${showTitle
                        ? html`<h2 class="uc-fan-title uc-fan-title--hero">${name}</h2>`
                        : nothing}
                      ${showState
                        ? html`
                            <p class="uc-fan-subtitle">
                              ${isOn ? html`<span class="uc-fan-status-dot" aria-hidden="true"></span>` : nothing}
                              ${stateLabel}
                            </p>
                          `
                        : nothing}
                    </div>
                  `
                : nothing}
            </div>

            <!-- Controls -->
            <div class="uc-fan-hero__controls">
              ${speedSection(true)}
              ${modesBlock}
              ${oscillateBlock}
              ${powerBtn('hero')}
            </div>
          </div>
        </div>
      `;
    } else if (layout === 'compact') {
      // Single-row: icon + meta + speed chip (same visual as power btn) + power btn
      // Slider spans the full width below the row
      content = html`
        <div class="uc-fan uc-fan-compact uc-fan-align-${alignment}">
          <div class="uc-fan-compact__row">
            ${showIcon ? iconWell(34, 'uc-fan-icon-well--compact') : nothing}
            <div class="uc-fan-compact__meta">
              ${showTitle ? html`<h2 class="uc-fan-title uc-fan-title--compact">${name}</h2>` : nothing}
              ${showState ? html`<p class="uc-fan-subtitle">${stateLabel}</p>` : nothing}
            </div>
            ${showPct && hasSetSpeed
              ? html`<span class="uc-fan-chip uc-fan-chip--speed">${displaySpeedPct}%</span>`
              : nothing}
            ${powerBtn('compact')}
          </div>
          ${hasSetSpeed && showPctCtrl
            ? html`
                <div
                  class="uc-fan-slider-combo"
                  style="--uc-fan-pct: ${displaySpeedPct};"
                >
                  <div class="uc-fan-slider-fill"></div>
                  <input
                    type="range"
                    class="uc-fan-range"
                    min="0"
                    max="100"
                    .value=${String(displaySpeedPct)}
                    @input=${onSpeedInput}
                    ?disabled=${isUnavailable}
                  />
                </div>
              `
            : hasSetSpeed && showPct && !showPctCtrl
              ? html`<div class="uc-fan-track">
                  <div class="uc-fan-track__fill" style="width: ${pctForBar}%;"></div>
                </div>`
              : nothing}
        </div>
      `;
    } else {
      // Standard: header (icon + title + power button) + speed + modes
      content = html`
        <div class="uc-fan uc-fan-standard uc-fan-align-${alignment}">
          <div class="uc-fan-header">
            ${showIcon ? iconWell(46, 'uc-fan-icon-well--standard') : nothing}
            <div class="uc-fan-header__text">
              ${showTitle ? html`<h2 class="uc-fan-title uc-fan-title--standard">${name}</h2>` : nothing}
              ${showState ? html`<p class="uc-fan-subtitle">${stateLabel}</p>` : nothing}
            </div>
            <div class="uc-fan-header__actions">
              ${powerBtn('standard')}
            </div>
          </div>
          ${speedSection(false)}
          ${modesBlock}
          ${oscillateBlock}
        </div>
      `;
    }

    const styles = this.buildDesignStyles(module, hass);
    const styleStr = Object.entries(styles)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
      .join('; ');
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      ${this.injectFanStyles()}
      <div
        class="uc-fan-wrapper ${hoverClass}"
        style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 18px; overflow: hidden; ${styleStr}"
      >
        ${this.wrapWithAnimation(content, module, hass)}
      </div>
    `;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      /* ── Base ───────────────────────────────────── */
      .uc-fan-wrapper { box-sizing: border-box; }
      .uc-fan { box-sizing: border-box; color: var(--primary-text-color); }

      /* ── Hero layout ────────────────────────────── */
      .uc-fan-hero { padding: 22px 20px 20px; }
      .uc-fan-hero__grid {
        display: flex;
        flex-wrap: wrap;
        gap: 22px;
        align-items: flex-start;
        justify-content: center;
      }
      .uc-fan-hero__stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        flex-shrink: 0;
      }
      .uc-fan-circle {
        position: relative;
        width: 148px;
        height: 148px;
        border-radius: 50%;
        background: radial-gradient(
          circle at 38% 32%,
          color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color, var(--ha-card-background))) 0%,
          color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 95%, var(--primary-color)) 100%
        );
        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 12px rgba(0,0,0,0.15);
        transition: box-shadow 0.3s ease, border-color 0.3s ease;
      }
      .uc-fan-circle--on {
        border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
        /* Soft glow only — avoid a second ring (no duplicate outline vs. border) */
        box-shadow:
          inset 0 2px 12px rgba(0,0,0,0.18),
          0 10px 36px color-mix(in srgb, var(--primary-color) 14%, transparent);
      }
      .uc-fan-hero__ident { text-align: center; }
      .uc-fan-hero__controls {
        flex: 1;
        min-width: 220px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        justify-content: center;
      }

      /* ── Standard layout ────────────────────────── */
      .uc-fan-standard {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .uc-fan-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .uc-fan-header__text { flex: 1; min-width: 0; }
      .uc-fan-header__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        flex-wrap: wrap;
      }

      /* ── Compact layout ─────────────────────────── */
      .uc-fan-compact { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
      .uc-fan-compact__row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: nowrap;
        overflow: hidden;
      }
      .uc-fan-compact__meta { flex: 1; min-width: 0; overflow: hidden; }

      /* ── Icon well ──────────────────────────────── */
      .uc-fan-icon-well {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background)));
        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .uc-fan-icon-well--standard { width: 46px; height: 46px; }
      .uc-fan-icon-well--compact  { width: 40px; height: 40px; }
      .uc-fan-icon-well--on {
        border-color: color-mix(in srgb, var(--primary-color) 38%, transparent);
        box-shadow: 0 2px 14px color-mix(in srgb, var(--primary-color) 12%, transparent);
      }
      .uc-fan-icon-well .uc-fan-svg { display: block; }
      .uc-fan-icon-well--on .uc-fan-svg {
        filter: drop-shadow(0 1px 5px color-mix(in srgb, var(--primary-color) 38%, transparent));
      }

      /* ── Typography ─────────────────────────────── */
      .uc-fan-title {
        margin: 0;
        font-weight: 700;
        letter-spacing: -0.01em;
        line-height: 1.25;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-fan-title--hero    { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.025em; }
      .uc-fan-title--standard { font-size: 1rem; }
      .uc-fan-title--compact  { font-size: 0.9375rem; }
      .uc-fan-subtitle {
        margin: 3px 0 0;
        font-size: 0.8125rem;
        line-height: 1.35;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-fan-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--primary-color);
        box-shadow: 0 0 6px color-mix(in srgb, var(--primary-color) 60%, transparent);
        flex-shrink: 0;
        display: inline-block;
      }

      /* ── Speed section ──────────────────────────── */
      .uc-fan-speed-section { display: flex; flex-direction: column; gap: 8px; }
      .uc-fan-speed__row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }
      .uc-fan-section-label {
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--secondary-text-color);
        margin: 0 0 6px;
        display: block;
      }
      .uc-fan-speed__row .uc-fan-section-label { margin: 0; }
      .uc-fan-speed__big {
        font-size: 2.2rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--primary-color);
        letter-spacing: -0.03em;
        line-height: 1;
        text-shadow: 0 0 20px color-mix(in srgb, var(--primary-color) 28%, transparent);
      }
      .uc-fan-speed__unit { font-size: 1.1rem; font-weight: 600; letter-spacing: 0; }
      .uc-fan-speed__sm {
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--primary-color);
        font-variant-numeric: tabular-nums;
      }

      /* ── Track ──────────────────────────────────── */
      .uc-fan-track {
        height: 7px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--divider-color) 38%, var(--card-background-color, var(--ha-card-background)));
        overflow: hidden;
      }
      .uc-fan-track--hero { height: 11px; }
      .uc-fan-track__fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          color-mix(in srgb, var(--primary-color) 55%, transparent),
          var(--primary-color)
        );
        box-shadow: 0 0 12px color-mix(in srgb, var(--primary-color) 28%, transparent);
        transition: width 0.32s cubic-bezier(0.25, 0.8, 0.25, 1);
      }

      /* ── Combined slider (fill layer under range) ── */
      .uc-fan-slider-combo {
        position: relative;
        height: 26px;
        display: flex;
        align-items: center;
        /* Thumb width must match ::-webkit-slider-thumb / ::-moz-range-thumb for alignment */
        --uc-fan-thumb: 20px;
        --uc-fan-pct: 0;
      }
      .uc-fan-slider-fill {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 6px;
        border-radius: 999px;
        /* Fill to the range thumb *center* (inset by half-thumb at each end) */
        width: calc(
          (var(--uc-fan-thumb) / 2) + (100% - var(--uc-fan-thumb)) * var(--uc-fan-pct) / 100
        );
        max-width: 100%;
        background: linear-gradient(
          90deg,
          color-mix(in srgb, var(--primary-color) 55%, transparent),
          var(--primary-color)
        );
        box-shadow: 0 0 10px color-mix(in srgb, var(--primary-color) 25%, transparent);
        pointer-events: none;
      }

      /* ── Range slider ───────────────────────────── */
      .uc-fan-range {
        width: 100%;
        margin: 0;
        height: 26px;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        position: relative;
        z-index: 1;
      }
      .uc-fan-range:focus { outline: none; }
      .uc-fan-range:focus-visible::-webkit-slider-thumb {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 35%, transparent);
      }
      .uc-fan-range::-webkit-slider-runnable-track {
        height: 6px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--divider-color) 45%, transparent);
      }
      .uc-fan-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        margin-top: -7px;
        border-radius: 50%;
        background: var(--card-background-color, var(--ha-card-background));
        border: 2.5px solid var(--primary-color);
        box-shadow: 0 2px 8px rgba(0,0,0,0.14);
        cursor: pointer;
        transition: transform 0.12s ease;
      }
      .uc-fan-range::-webkit-slider-thumb:hover { transform: scale(1.15); }
      .uc-fan-range::-moz-range-track {
        height: 6px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--divider-color) 45%, transparent);
      }
      .uc-fan-range::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--card-background-color, var(--ha-card-background));
        border: 2.5px solid var(--primary-color);
        cursor: pointer;
      }

      /* ── Preset mode section ────────────────────── */
      .uc-fan-mode-section { display: flex; flex-direction: column; }

      /* ── Two-column presets + direction ─────────── */
      .uc-fan-two-col {
        display: flex;
        gap: 18px;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      .uc-fan-col {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
        min-width: 80px;
      }
      .uc-fan-col .uc-fan-section-label { margin: 0 0 4px; }

      /* ── Chips ──────────────────────────────────── */
      .uc-fan-chips { display: flex; flex-wrap: wrap; gap: 7px; }
      .uc-fan-chip {
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
        padding: 7px 15px;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--divider-color) 72%, transparent);
        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: background 0.14s, border-color 0.14s, color 0.14s, box-shadow 0.14s;
        white-space: nowrap;
        letter-spacing: 0.01em;
      }
      .uc-fan-chip.is-active {
        border-color: color-mix(in srgb, var(--primary-color) 55%, transparent);
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--primary-color) 15%, var(--card-background-color, var(--ha-card-background))),
          color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background)))
        );
        color: var(--primary-color);
        font-weight: 600;
        box-shadow: 0 2px 10px color-mix(in srgb, var(--primary-color) 12%, transparent);
      }
      .uc-fan-chip:disabled { opacity: 0.4; cursor: not-allowed; }
      .uc-fan-chip:hover:not(:disabled):not(.is-active) {
        border-color: color-mix(in srgb, var(--primary-color) 28%, var(--divider-color));
        color: var(--primary-text-color);
      }
      /* Speed display in compact — same size/shape as power button */
      .uc-fan-chip--speed {
        pointer-events: none;
        color: var(--primary-color);
        border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
        background: color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color, var(--ha-card-background)));
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      /* ── Power button ───────────────────────────── */
      .uc-fan-power-btn {
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        padding: 9px 20px;
        border-radius: 999px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--primary-color) 50%, transparent);
        background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-color);
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        flex-shrink: 0;
      }
      .uc-fan-power-btn:hover:not(:disabled) {
        background: color-mix(in srgb, var(--primary-color) 20%, var(--card-background-color, var(--ha-card-background)));
        box-shadow: 0 4px 14px color-mix(in srgb, var(--primary-color) 14%, transparent);
      }
      .uc-fan-power-btn--off {
        border-color: color-mix(in srgb, var(--divider-color) 80%, transparent);
        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));
        color: var(--secondary-text-color);
      }
      .uc-fan-power-btn--sm { font-size: 0.75rem; padding: 7px 14px; }
      /* Full-width power button for hero layout */
      .uc-fan-power-btn--full {
        width: 100%;
        text-align: center;
        flex-shrink: unset;
      }
      .uc-fan-power-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* ── Power row (hero bottom) ─────────────────── */
      .uc-fan-power-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      /* ── Alignment ──────────────────────────────── */
      .uc-fan-align-left   .uc-fan-hero__ident,
      .uc-fan-align-left   .uc-fan-header__text  { text-align: left; }
      .uc-fan-align-center .uc-fan-hero__ident   { text-align: center; }
      .uc-fan-align-right  .uc-fan-hero__ident,
      .uc-fan-align-right  .uc-fan-header__text  { text-align: right; }

      /* ── Animations ─────────────────────────────── */
      @keyframes ucFanSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .uc-fan-blades--spin {
        animation: ucFanSpin var(--uc-fan-dur, 1.2s) linear infinite;
      }
      .uc-fan-mdi-spin {
        display: inline-block;
        animation: ucFanSpin var(--uc-fan-dur, 1.2s) linear infinite;
        transform-origin: center center;
      }
      @media (prefers-reduced-motion: reduce) {
        .uc-fan-blades--spin,
        .uc-fan-mdi-spin { animation: none !important; }
      }
    `;
  }
}
