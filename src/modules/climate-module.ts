import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ClimateModule, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import '../components/ultra-color-picker';

/**
 * Climate Module - Pro Feature
 *
 * Provides a beautiful circular thermostat interface for Home Assistant climate entities.
 * Features include:
 * - Interactive circular dial with draggable temperature control
 * - Full temperature range display with tick marks
 * - Support for both Fahrenheit and Celsius
 * - Range indicator for heat_cool mode
 * - Mode switching (heat, cool, heat_cool, off, etc.)
 * - Humidity display
 * - Fan and preset controls
 * - Animations based on HVAC action (heating/cooling)
 * - Configurable show/hide options for all elements
 */
export class UltraClimateModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'climate',
    title: 'Climate Control',
    description: 'Interactive circular thermostat control for climate entities',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:thermostat',
    category: 'interactive',
    tags: ['climate', 'thermostat', 'temperature', 'hvac', 'heating', 'cooling', 'pro'],
  };

  private _liveTargetValue?: number;
  private _liveTargetLow?: number;
  private _liveTargetHigh?: number;
  private _lastRenderedEntity?: string;

  createDefault(id?: string, hass?: HomeAssistant): CardModule {
    return {
      id: id || this.generateId('climate'),
      type: 'climate',
      entity: '',
      name: '',

      // Display toggles (all enabled by default)
      show_current_temp: true,
      show_target_temp: true,
      show_humidity: true,
      show_mode_switcher: true,
      show_power_button: true,
      show_fan_controls: false,
      show_preset_modes: false,
      show_temp_controls: true,
      show_dial: true,
      enable_dial_interaction: true,

      // Dial configuration
      dial_size: 280,

      // Dynamic colors
      dynamic_colors: true,

      // Temperature
      temperature_unit: 'auto',
      temp_control_size: 26,

      // Control layout
      fan_layout: 'chips',
      preset_layout: 'chips',

      // Colors
      humidity_icon: 'mdi:water-percent',
      current_temp_color: 'var(--primary-text-color)',
      target_temp_color: 'var(--secondary-text-color)',
      mode_text_color: 'var(--secondary-text-color)',
      humidity_color: 'var(--secondary-text-color)',

      // Actions
      tap_action: { action: 'default' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },
    } as ClimateModule;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const climateModule = module as ClimateModule;

    return html`
      <style>
        ${this.injectUcFormStyles()}
      </style>

      <!-- Entity Configuration -->
      ${this.renderSettingsSection('Entity Configuration', 'Select the climate entity to control', [
        {
          title: 'Climate Entity',
          description: 'Select a climate entity (thermostat, HVAC system)',
          hass,
          data: { entity: climateModule.entity || '' },
          schema: [
            {
              name: 'entity',
              selector: { entity: { domain: 'climate' } },
            },
          ],
          onChange: (e: CustomEvent) => updateModule({ entity: e.detail.value.entity }),
        },
      ])}

      <!-- Dial & Temperature -->
      ${this.renderSettingsSection(
        'Dial & Temperature',
        'Control the primary dial and temperature stack',
        [
          {
            title: 'Show Dial',
            description: 'Display the circular dial and arc',
            hass,
            data: { show_dial: climateModule.show_dial !== false },
            schema: [this.booleanField('show_dial')],
            onChange: (e: CustomEvent) => updateModule({ show_dial: e.detail.value.show_dial }),
          },
          {
            title: 'Show Current Temperature',
            description: 'Display the current temperature in the dial center',
            hass,
            data: { show_current_temp: climateModule.show_current_temp !== false },
            schema: [this.booleanField('show_current_temp')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_current_temp: e.detail.value.show_current_temp }),
          },
          {
            title: 'Show Target Temperature',
            description: 'Display the target/set temperature',
            hass,
            data: { show_target_temp: climateModule.show_target_temp !== false },
            schema: [this.booleanField('show_target_temp')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_target_temp: e.detail.value.show_target_temp }),
          },
          {
            title: 'Show Temperature Controls',
            description: 'Display +/- buttons for temperature adjustment',
            hass,
            data: { show_temp_controls: climateModule.show_temp_controls !== false },
            schema: [this.booleanField('show_temp_controls')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_temp_controls: e.detail.value.show_temp_controls }),
          },
          {
            title: 'Show Humidity',
            description: 'Display current humidity percentage',
            hass,
            data: { show_humidity: climateModule.show_humidity !== false },
            schema: [this.booleanField('show_humidity')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_humidity: e.detail.value.show_humidity }),
          },
        ]
      )}

      <!-- Control Buttons -->
      ${this.renderSettingsSection(
        'Control Buttons',
        'Toggle the optional buttons below the dial',
        [
          {
            title: 'Show Mode Switcher',
            description: 'Display HVAC mode buttons (heat, cool, off, etc.)',
            hass,
            data: { show_mode_switcher: climateModule.show_mode_switcher !== false },
            schema: [this.booleanField('show_mode_switcher')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_mode_switcher: e.detail.value.show_mode_switcher }),
          },
          {
            title: 'Show Power Toggle',
            description: 'Display the power on/off button',
            hass,
            data: { show_power_button: climateModule.show_power_button !== false },
            schema: [this.booleanField('show_power_button')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_power_button: e.detail.value.show_power_button }),
          },
          {
            title: 'Show Fan Controls',
            description: 'Display fan mode controls',
            hass,
            data: { show_fan_controls: climateModule.show_fan_controls || false },
            schema: [this.booleanField('show_fan_controls')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_fan_controls: e.detail.value.show_fan_controls }),
          },
          {
            title: 'Show Preset Modes',
            description: 'Display preset mode controls (home, away, sleep, etc.)',
            hass,
            data: { show_preset_modes: climateModule.show_preset_modes || false },
            schema: [this.booleanField('show_preset_modes')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_preset_modes: e.detail.value.show_preset_modes }),
          },
        ]
      )}

      <!-- Dial Configuration -->
      ${this.renderSettingsSection('Dial Configuration', 'Customize the circular dial appearance', [
        {
          title: 'Dial Size',
          description: 'Diameter of the circular dial in pixels (200-400)',
          hass,
          data: { dial_size: climateModule.dial_size || 280 },
          schema: [this.numberField('dial_size', 200, 400, 10)],
          onChange: (e: CustomEvent) => updateModule({ dial_size: e.detail.value.dial_size }),
        },
        {
          title: 'Temperature Unit',
          description: 'Display unit for temperature (auto-detects from entity)',
          hass,
          data: { temperature_unit: climateModule.temperature_unit || 'auto' },
          schema: [
            this.selectField('temperature_unit', [
              { value: 'auto', label: 'Auto (from entity)' },
              { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
              { value: 'celsius', label: 'Celsius (°C)' },
            ]),
          ],
          onChange: (e: CustomEvent) =>
            updateModule({ temperature_unit: e.detail.value.temperature_unit }),
        },
        {
          title: 'Control Button Size',
          description: 'Size of the +/- temperature control buttons (24-60px)',
          hass,
          data: { temp_control_size: climateModule.temp_control_size || 32 },
          schema: [this.numberField('temp_control_size', 24, 60, 2)],
          onChange: (e: CustomEvent) =>
            updateModule({ temp_control_size: e.detail.value.temp_control_size }),
        },
      ])}

      <!-- Colors -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">Colors</h3>
          <p class="section-description">Customize colors for different states and elements</p>
        </div>
        <div class="section-content">
          <!-- Dynamic Colors Toggle -->
          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
            >
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; margin: 0; white-space: nowrap;"
              >
                Dynamic Colors
              </div>
              ${this.renderUcForm(
                hass,
                { dynamic_colors: climateModule.dynamic_colors !== false },
                [this.booleanField('dynamic_colors')],
                (e: CustomEvent) => updateModule({ dynamic_colors: e.detail.value.dynamic_colors }),
                false
              )}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              Automatically use reddish-orange for heating and blue for cooling. When disabled, use
              custom colors below.
            </div>
          </div>

          <!-- Conditional Color Pickers -->
          ${climateModule.dynamic_colors === false
            ? html`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Heating Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when heating is active
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.dial_color_heating || '#ff6b6b'}
                    .defaultValue=${'#ff6b6b'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ dial_color_heating: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Cooling Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when cooling is active
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.dial_color_cooling || '#4dabf7'}
                    .defaultValue=${'#4dabf7'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ dial_color_cooling: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Idle Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when idle (on but not actively heating/cooling)
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.dial_color_idle || 'var(--primary-color)'}
                    .defaultValue=${'var(--primary-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ dial_color_idle: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Off Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when HVAC is off
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.dial_color_off || 'var(--disabled-text-color)'}
                    .defaultValue=${'var(--disabled-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ dial_color_off: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              `
            : ''}

          <!-- Current Temperature Color (hidden when Dynamic Colors is enabled) -->
          ${climateModule.dynamic_colors === false
            ? html`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Current Temperature Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the large temperature value in the dial center
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.current_temp_color || 'var(--primary-text-color)'}
                    .defaultValue=${'var(--primary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ current_temp_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              `
            : ''}

          <!-- Target Temperature Color (hidden when Dynamic Colors is enabled) -->
          ${climateModule.dynamic_colors === false
            ? html`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Target Temperature Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the set temperature row
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.target_temp_color || 'var(--secondary-text-color)'}
                    .defaultValue=${'var(--secondary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ target_temp_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              `
            : ''}

          <!-- Preset Text Color (hidden when Dynamic Colors is enabled) -->
          ${climateModule.dynamic_colors === false
            ? html`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Preset Text Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color for preset mode labels in the top display
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.mode_text_color || 'var(--secondary-text-color)'}
                    .defaultValue=${'var(--secondary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ mode_text_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              `
            : ''}

          <!-- Humidity Color (hidden when Dynamic Colors is enabled) -->
          ${climateModule.dynamic_colors === false
            ? html`
                <div style="margin-bottom: 0;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Humidity Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the humidity label and value
                  </div>
                  <ultra-color-picker
                    .value=${climateModule.humidity_color || 'var(--secondary-text-color)'}
                    .defaultValue=${'var(--secondary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ humidity_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const climateModule = module as ClimateModule;

    // Validate entity
    if (!climateModule.entity) {
      return this.renderGradientErrorState(
        'No Climate Entity',
        'Select a climate entity in the General tab'
      );
    }

    const entity = hass.states[climateModule.entity];
    if (!entity) {
      return this.renderGradientErrorState(
        'Entity Not Found',
        `Climate entity "${climateModule.entity}" not found`
      );
    }

    // Extract climate data
    const currentTemp = entity.attributes.current_temperature;
    const targetTemp = entity.attributes.temperature;
    const targetTempHigh = entity.attributes.target_temp_high;
    const targetTempLow = entity.attributes.target_temp_low;
    const minTemp = entity.attributes.min_temp || 44.6;
    const maxTemp = entity.attributes.max_temp || 95;
    const tempStep = climateModule.temp_step_override || entity.attributes.target_temp_step || 0.5;

    // Check if humidity attribute exists and is a valid number
    const humidityAttr = entity.attributes.current_humidity;
    const hasHumidity =
      humidityAttr !== undefined && humidityAttr !== null && !isNaN(Number(humidityAttr));
    const humidity = hasHumidity ? Number(humidityAttr) : undefined;

    const hvacMode = entity.state; // 'heat', 'cool', 'heat_cool', 'off', etc.
    const hvacAction = entity.attributes.hvac_action; // 'heating', 'cooling', 'idle', 'off'
    const hvacModes = entity.attributes.hvac_modes || [];

    // Check if fan attributes exist (works for Nest, Ecobee, and other climate controllers)
    const fanModeAttr = entity.attributes.fan_mode;
    const hasFanMode = fanModeAttr !== undefined && fanModeAttr !== null;
    const fanMode = hasFanMode ? fanModeAttr : undefined;
    const fanModesAttr = entity.attributes.fan_modes;
    const fanModes =
      fanModesAttr !== undefined &&
      fanModesAttr !== null &&
      Array.isArray(fanModesAttr) &&
      fanModesAttr.length > 0
        ? fanModesAttr
        : [];

    // Check if preset attributes exist (works for Nest, Ecobee, and other climate controllers)
    const presetModeAttr = entity.attributes.preset_mode;
    const hasPresetMode = presetModeAttr !== undefined && presetModeAttr !== null;
    const presetMode = hasPresetMode ? presetModeAttr : undefined;
    const presetModesAttr = entity.attributes.preset_modes;
    const presetModes =
      presetModesAttr !== undefined &&
      presetModesAttr !== null &&
      Array.isArray(presetModesAttr) &&
      presetModesAttr.length > 0
        ? presetModesAttr
        : [];
    const dialSize = climateModule.dial_size || 280;
    const showDial = climateModule.show_dial !== false;

    let tempUnit = '°F'; // Default to Fahrenheit
    if (climateModule.temperature_unit === 'fahrenheit') {
      tempUnit = '°F';
    } else if (climateModule.temperature_unit === 'celsius') {
      tempUnit = '°C';
    } else {
      const entityUnit = entity.attributes.unit_of_measurement;
      const tempUnitAttr = entity.attributes.temperature_unit;

      if (tempUnitAttr) {
        tempUnit = tempUnitAttr === 'C' ? '°C' : '°F';
      } else if (entityUnit) {
        tempUnit = entityUnit.includes('C') ? '°C' : '°F';
      }
    }

    // Determine dial color based on HVAC action and mode
    let dialColor = climateModule.dial_color_idle || 'var(--primary-color)';

    // Use dynamic colors if enabled (default: true)
    if (climateModule.dynamic_colors !== false) {
      if (hvacMode === 'off') {
        dialColor = '#6b7280'; // Gray for off
      } else if (hvacAction === 'heating' || hvacMode === 'heat') {
        // Vibrant reddish orange for heating (check both action and mode)
        dialColor = '#ff4500'; // More vibrant red-orange (OrangeRed)
      } else if (hvacAction === 'cooling' || hvacMode === 'cool') {
        // Vibrant blue for cooling (check both action and mode)
        dialColor = '#1e90ff'; // More vibrant blue (DodgerBlue)
      } else if (hvacMode === 'heat_cool' || hvacMode === 'auto') {
        // For heat_cool/auto mode, use color based on current action
        if (hvacAction === 'heating') {
          dialColor = '#ff4500'; // Red-orange when heating
        } else if (hvacAction === 'cooling') {
          dialColor = '#1e90ff'; // Blue when cooling
        } else {
          // Idle in heat_cool mode - neutral color
          dialColor = '#6366f1'; // Indigo (neutral)
        }
      } else {
        // Idle - neutral color
        dialColor = '#6366f1'; // Indigo
      }
    } else {
      // Use configured colors when dynamic colors disabled
      if (hvacMode === 'off') {
        dialColor = climateModule.dial_color_off || 'var(--disabled-text-color)';
      } else if (hvacAction === 'heating' || hvacMode === 'heat') {
        dialColor = climateModule.dial_color_heating || '#ff6b6b';
      } else if (hvacAction === 'cooling' || hvacMode === 'cool') {
        dialColor = climateModule.dial_color_cooling || '#4dabf7';
      } else {
        dialColor = climateModule.dial_color_idle || 'var(--primary-color)';
      }
    }

    const targetColor = climateModule.target_temp_color || 'var(--secondary-text-color)';

    if (this._lastRenderedEntity !== climateModule.entity) {
      this._liveTargetValue = undefined;
      this._liveTargetLow = undefined;
      this._liveTargetHigh = undefined;
      this._lastRenderedEntity = climateModule.entity;
    }

    const useRangeSlider =
      showDial &&
      hvacMode === 'heat_cool' &&
      targetTempLow !== undefined &&
      targetTempHigh !== undefined;

    if (!useRangeSlider) {
      this._liveTargetLow = undefined;
      this._liveTargetHigh = undefined;
    }

    const sliderModes: Record<string, 'start' | 'end' | 'full'> = {
      heat: 'start',
      cool: 'end',
      heat_cool: 'full',
      auto: 'full',
      dry: 'full',
      fan_only: 'full',
      off: 'full',
    };

    const sliderMode = sliderModes[hvacMode] ?? 'full';

    const fallbackTarget = targetTemp ?? currentTemp ?? minTemp;
    const displayTarget = this._liveTargetValue ?? fallbackTarget ?? minTemp;
    const displayLow = this._liveTargetLow ?? targetTempLow ?? fallbackTarget ?? minTemp;
    const displayHigh = this._liveTargetHigh ?? targetTempHigh ?? fallbackTarget ?? maxTemp;

    const heatingColor =
      climateModule.dynamic_colors !== false
        ? '#ff4500'
        : climateModule.dial_color_heating || '#ff6b6b';
    const coolingColor =
      climateModule.dynamic_colors !== false
        ? '#1e90ff'
        : climateModule.dial_color_cooling || '#4dabf7';

    const sliderStyleParts = [
      `--control-circular-slider-color: ${dialColor}`,
      `--control-circular-slider-background: rgba(var(--rgb-primary-text-color), 0.12)`,
      `--control-circular-slider-background-opacity: 0.5`,
    ];

    if (useRangeSlider) {
      sliderStyleParts.push(`--control-circular-slider-low-color: ${heatingColor}`);
      sliderStyleParts.push(`--control-circular-slider-high-color: ${coolingColor}`);
    }

    const sliderStyle = sliderStyleParts.join('; ');
    const sliderDisabled = !showDial || climateModule.enable_dial_interaction === false;
    const sliderInactive = hvacMode === 'off' || !showDial;

    const formatPresetName = (value?: string): string => {
      if (!value) return 'None';
      return value
        .split('_')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    };

    const presetDisplayValue = formatPresetName(presetMode);

    const handleSliderValueChanging = (event: CustomEvent<{ value?: number }>) => {
      if (sliderDisabled) return;
      const nextValue = typeof event.detail.value === 'number' ? event.detail.value : undefined;
      this._liveTargetValue = nextValue;
      // Removed triggerPreviewUpdate - ha-control-circular-slider handles visual feedback during drag
    };

    const handleSliderValueChanged = async (event: CustomEvent<{ value?: number }>) => {
      if (sliderDisabled) return;
      const nextValue =
        typeof event.detail.value === 'number'
          ? event.detail.value
          : (this._liveTargetValue ?? targetTemp);
      this._liveTargetValue = undefined;
      this.triggerPreviewUpdate(true);
      if (nextValue === undefined || Number.isNaN(nextValue)) return;
      await this.callClimateService(
        'set_temperature',
        climateModule.entity,
        { temperature: nextValue },
        hass
      );
    };

    const handleSliderLowChanging = (event: CustomEvent<{ value?: number }>) => {
      if (!useRangeSlider || sliderDisabled) return;
      const nextValue = typeof event.detail.value === 'number' ? event.detail.value : undefined;
      this._liveTargetLow = nextValue;
      // Removed triggerPreviewUpdate - ha-control-circular-slider handles visual feedback during drag
    };

    const handleSliderHighChanging = (event: CustomEvent<{ value?: number }>) => {
      if (!useRangeSlider || sliderDisabled) return;
      const nextValue = typeof event.detail.value === 'number' ? event.detail.value : undefined;
      this._liveTargetHigh = nextValue;
      // Removed triggerPreviewUpdate - ha-control-circular-slider handles visual feedback during drag
    };

    const handleSliderLowChanged = async (event: CustomEvent<{ value?: number }>) => {
      if (!useRangeSlider || sliderDisabled) return;
      const lowValue =
        typeof event.detail.value === 'number'
          ? event.detail.value
          : (this._liveTargetLow ?? targetTempLow);
      const highValue = this._liveTargetHigh ?? targetTempHigh ?? lowValue;
      this._liveTargetLow = undefined;
      this.triggerPreviewUpdate(true);
      if (
        lowValue === undefined ||
        Number.isNaN(lowValue) ||
        highValue === undefined ||
        Number.isNaN(highValue)
      ) {
        return;
      }
      await this.callClimateService(
        'set_temperature',
        climateModule.entity,
        { target_temp_low: lowValue, target_temp_high: highValue },
        hass
      );
    };

    const handleSliderHighChanged = async (event: CustomEvent<{ value?: number }>) => {
      if (!useRangeSlider || sliderDisabled) return;
      const highValue =
        typeof event.detail.value === 'number'
          ? event.detail.value
          : (this._liveTargetHigh ?? targetTempHigh);
      const lowValue = this._liveTargetLow ?? targetTempLow ?? highValue;
      this._liveTargetHigh = undefined;
      this.triggerPreviewUpdate(true);
      if (
        highValue === undefined ||
        Number.isNaN(highValue) ||
        lowValue === undefined ||
        Number.isNaN(lowValue)
      ) {
        return;
      }
      await this.callClimateService(
        'set_temperature',
        climateModule.entity,
        { target_temp_low: lowValue, target_temp_high: highValue },
        hass
      );
    };

    // Render mode icon
    const getModeIcon = (mode: string): string => {
      const icons: Record<string, string> = {
        heat: 'mdi:fire',
        cool: 'mdi:snowflake',
        heat_cool: 'mdi:thermostat-auto',
        auto: 'mdi:thermostat-auto',
        off: 'mdi:power',
        dry: 'mdi:water-percent',
        fan_only: 'mdi:fan',
      };
      return icons[mode] || 'mdi:thermostat';
    };

    // Temperature adjustment handlers
    const handleTempIncrease = async (e: Event) => {
      e.stopPropagation();
      if (!targetTemp) return;

      const newTemp = Math.min(maxTemp, targetTemp + tempStep);
      await this.callClimateService(
        'set_temperature',
        climateModule.entity,
        { temperature: newTemp },
        hass
      );
    };

    const handleTempDecrease = async (e: Event) => {
      e.stopPropagation();
      if (!targetTemp) return;

      const newTemp = Math.max(minTemp, targetTemp - tempStep);
      await this.callClimateService(
        'set_temperature',
        climateModule.entity,
        { temperature: newTemp },
        hass
      );
    };

    // Mode change handler
    const handleModeChange = async (mode: string) => {
      await this.callClimateService(
        'set_hvac_mode',
        climateModule.entity,
        { hvac_mode: mode },
        hass
      );
    };

    // Fan mode change handler
    const handleFanModeChange = async (mode: string) => {
      await this.callClimateService('set_fan_mode', climateModule.entity, { fan_mode: mode }, hass);
    };

    // Preset mode change handler
    const handlePresetModeChange = async (mode: string) => {
      await this.callClimateService(
        'set_preset_mode',
        climateModule.entity,
        { preset_mode: mode },
        hass
      );
    };

    // Get hover effect
    const hoverEffect = (climateModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <style>
        ${this.getStyles()}
      </style>

      <div
        class="climate-module-container ${hoverEffectClass}"
        @click=${(e: Event) => {
          const target = e.target as HTMLElement;
          if (
            target.closest('.climate-mode-popup') ||
            target.closest('.climate-fan-popup') ||
            target.closest('.climate-preset-popup') ||
            target.closest('.climate-info-popup') ||
            target.closest('.climate-bottom-icon') ||
            target.closest('.climate-preset-display')
          ) {
            return;
          }

          (e.currentTarget as HTMLElement)
            .querySelectorAll(
              '.climate-mode-popup.show, .climate-fan-popup.show, .climate-preset-popup.show, .climate-info-popup.show'
            )
            .forEach(popup => popup.classList.remove('show'));
        }}
      >
        <!-- Circular Dial -->
        <div
          class="climate-dial-wrapper"
          style="--dial-color: ${dialColor}; --dial-size: ${dialSize}px;"
        >
          <!-- Pulse Circles (shown when heating/cooling) - Background layer -->
          ${hvacAction === 'heating' || hvacAction === 'cooling'
            ? html`
                <div class="climate-pulse-background" style="--pulse-color: ${dialColor};">
                  <div class="climate-pulse-circle"></div>
                  <div class="climate-pulse-circle"></div>
                  <div class="climate-pulse-circle"></div>
                  <div class="climate-pulse-circle"></div>
                  <!-- Center mask to hide animation in the middle -->
                  <div class="climate-pulse-mask"></div>
                </div>
              `
            : ''}
          ${showDial
            ? useRangeSlider
              ? html`
                  <ha-control-circular-slider
                    class="climate-ha-slider"
                    style="${sliderStyle}"
                    .dual=${true}
                    .mode=${sliderMode}
                    .low=${displayLow}
                    .high=${displayHigh}
                    .current=${currentTemp}
                    .min=${minTemp}
                    .max=${maxTemp}
                    .step=${tempStep}
                    .inactive=${sliderInactive}
                    .disabled=${sliderDisabled}
                    .readonly=${sliderDisabled}
                    @low-changing=${handleSliderLowChanging}
                    @low-changed=${handleSliderLowChanged}
                    @high-changing=${handleSliderHighChanging}
                    @high-changed=${handleSliderHighChanged}
                    @value-changing=${handleSliderValueChanging}
                    @value-changed=${handleSliderValueChanged}
                  ></ha-control-circular-slider>
                `
              : html`
                  <ha-control-circular-slider
                    class="climate-ha-slider"
                    style="${sliderStyle}"
                    .mode=${sliderMode}
                    .value=${displayTarget}
                    .current=${currentTemp}
                    .min=${minTemp}
                    .max=${maxTemp}
                    .step=${tempStep}
                    .inactive=${sliderInactive}
                    .disabled=${sliderDisabled}
                    .readonly=${sliderDisabled}
                    @value-changing=${handleSliderValueChanging}
                    @value-changed=${handleSliderValueChanged}
                  ></ha-control-circular-slider>
                `
            : ''}

          <!-- Center content -->
          <div class="climate-dial-center">
            <!-- Items wrapper for centering when some are disabled -->
            <div class="climate-dial-items">
              <!-- Preset Display -->
              ${climateModule.show_preset_modes && hasPresetMode && presetModes.length > 0
                ? html`
                    <div
                      class="climate-preset-display"
                      style="color: ${climateModule.dynamic_colors === false
                        ? climateModule.mode_text_color || 'var(--secondary-text-color)'
                        : 'var(--secondary-text-color)'};"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const wrapper = (e.currentTarget as HTMLElement).closest(
                          '.climate-dial-wrapper'
                        );
                        wrapper
                          ?.querySelectorAll('.climate-mode-popup.show, .climate-fan-popup.show')
                          .forEach(popup => popup.classList.remove('show'));
                        const presetPopup = wrapper?.querySelector('.climate-preset-popup');
                        if (presetPopup) {
                          presetPopup.classList.toggle('show');
                        }
                      }}
                      title="Current preset"
                    >
                      <span class="climate-preset-value">${presetDisplayValue}</span>
                    </div>
                  `
                : ''}

              <!-- Current Temperature -->
              ${climateModule.show_current_temp !== false && currentTemp !== undefined
                ? html`
                    <div
                      class="climate-current-temp"
                      style="color: ${climateModule.current_temp_color ||
                      'var(--primary-text-color)'}; cursor: pointer;"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const wrapper = (e.currentTarget as HTMLElement).closest(
                          '.climate-dial-wrapper'
                        );
                        wrapper
                          ?.querySelectorAll('.climate-info-popup.show')
                          .forEach(popup => popup.classList.remove('show'));
                        const infoPopup = wrapper?.querySelector('.climate-temp-info-popup');
                        if (infoPopup) {
                          infoPopup.classList.toggle('show');
                        }
                      }}
                      title="Tap for temperature details"
                    >
                      ${Math.round(currentTemp)}${tempUnit}
                    </div>
                  `
                : ''}

              <!-- Target Temperature -->
              ${(() => {
                const showTargetRow =
                  (climateModule.show_target_temp !== false ||
                    climateModule.show_temp_controls !== false) &&
                  (climateModule.show_target_temp !== false || hvacMode !== 'off');
                if (!showTargetRow) {
                  return '';
                }
                const controlSize = climateModule.temp_control_size || 26;
                const showControls =
                  climateModule.show_temp_controls !== false && hvacMode !== 'off';
                const buttonSize = controlSize - 6;
                const iconSize = Math.max(12, Math.floor(buttonSize * 0.5));
                return html`
                  <div class="climate-target-stack" style="color: ${targetColor}">
                    <div class="climate-target-row">
                      ${showControls
                        ? html`
                            <button
                              class="climate-control-btn-inline"
                              style="width: ${buttonSize}px; height: ${buttonSize}px; --icon-size: ${iconSize}px; border-color: ${dialColor}; color: ${dialColor};"
                              @click=${handleTempDecrease}
                              ?disabled=${!targetTemp || targetTemp <= minTemp}
                            >
                              <ha-icon icon="mdi:minus"></ha-icon>
                            </button>
                          `
                        : ''}
                      ${climateModule.show_target_temp !== false
                        ? html`
                            <div
                              class="climate-target-temp"
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                const wrapper = (e.currentTarget as HTMLElement).closest(
                                  '.climate-dial-wrapper'
                                );
                                wrapper
                                  ?.querySelectorAll('.climate-info-popup.show')
                                  .forEach(popup => popup.classList.remove('show'));
                                const infoPopup = wrapper?.querySelector(
                                  '.climate-target-info-popup'
                                );
                                if (infoPopup) {
                                  infoPopup.classList.toggle('show');
                                }
                              }}
                              title="Tap for target temperature details"
                              style="cursor: pointer;"
                            >
                              ${useRangeSlider &&
                              displayLow !== undefined &&
                              displayHigh !== undefined
                                ? html`${Math.round(displayLow)}-${Math.round(
                                    displayHigh
                                  )}${tempUnit}`
                                : displayTarget !== undefined
                                  ? html`${Math.round(displayTarget)}${tempUnit}`
                                  : ''}
                            </div>
                          `
                        : ''}
                      ${showControls
                        ? html`
                            <button
                              class="climate-control-btn-inline"
                              style="width: ${buttonSize}px; height: ${buttonSize}px; --icon-size: ${iconSize}px; border-color: ${dialColor}; color: ${dialColor};"
                              @click=${handleTempIncrease}
                              ?disabled=${!targetTemp || targetTemp >= maxTemp}
                            >
                              <ha-icon icon="mdi:plus"></ha-icon>
                            </button>
                          `
                        : ''}
                    </div>
                  </div>
                `;
              })()}

              <!-- Humidity Display (Below target temp) -->
              ${climateModule.show_humidity && hasHumidity && humidity !== undefined
                ? html`
                    <div
                      class="climate-humidity-row"
                      style="color: ${climateModule.dynamic_colors === false
                        ? climateModule.humidity_color || 'var(--secondary-text-color)'
                        : 'var(--secondary-text-color)'}; cursor: pointer;"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const wrapper = (e.currentTarget as HTMLElement).closest(
                          '.climate-dial-wrapper'
                        );
                        wrapper
                          ?.querySelectorAll('.climate-info-popup.show')
                          .forEach(popup => popup.classList.remove('show'));
                        const infoPopup = wrapper?.querySelector('.climate-humidity-info-popup');
                        if (infoPopup) {
                          infoPopup.classList.toggle('show');
                        }
                      }}
                      title="Tap for humidity details"
                    >
                      <span class="climate-humidity-label">Humidity:</span>
                      <span class="climate-humidity-value">${Math.round(humidity)}%</span>
                    </div>
                  `
                : ''}

              <!-- Bottom Control Icons (power, mode, fan) -->
            ${(() => {
              const buttonCount =
                (climateModule.show_mode_switcher !== false ? 1 : 0) +
                (climateModule.show_power_button !== false ? 1 : 0) +
                (climateModule.show_fan_controls && fanModes.length > 0 ? 1 : 0);
              return html`
                <div class="climate-bottom-controls climate-bottom-controls-${buttonCount}">
                  <!-- Mode Icon -->
                  ${climateModule.show_mode_switcher !== false
                    ? html`
                        <div
                          class="climate-bottom-icon ${hvacMode !== 'off' ? 'active' : ''}"
                          style="${hvacMode !== 'off'
                            ? `background-color: ${dialColor}; border-color: ${dialColor};`
                            : ''}"
                          @click=${(e: Event) => {
                            e.stopPropagation();
                            const wrapper = (e.currentTarget as HTMLElement).closest(
                              '.climate-dial-wrapper'
                            );
                            wrapper
                              ?.querySelectorAll(
                                '.climate-fan-popup.show, .climate-preset-popup.show'
                              )
                              .forEach(popup => popup.classList.remove('show'));
                            const modePopup = wrapper?.querySelector('.climate-mode-popup');
                            if (modePopup) {
                              modePopup.classList.toggle('show');
                            }
                          }}
                          title="${hvacMode.replace('_', ' ').toUpperCase()}"
                        >
                          <ha-icon icon="${getModeIcon(hvacMode)}"></ha-icon>
                        </div>
                      `
                    : ''}

                  <!-- Power Icon -->
                  ${climateModule.show_power_button !== false
                    ? html`
                        <div
                          class="climate-bottom-icon ${hvacMode === 'off' ? 'power-off' : 'active'}"
                          style="${hvacMode !== 'off'
                            ? `background-color: ${dialColor}; border-color: ${dialColor};`
                            : ''}"
                          @click=${async (e: Event) => {
                            e.stopPropagation();
                            const newMode = hvacMode === 'off' ? 'heat' : 'off';
                            await handleModeChange(newMode);
                          }}
                          title="Power ${hvacMode === 'off' ? 'On' : 'Off'}"
                        >
                          <ha-icon icon="mdi:power"></ha-icon>
                        </div>
                      `
                    : ''}

                  <!-- Fan Icon -->
                  ${climateModule.show_fan_controls && hasFanMode && fanModes.length > 0
                    ? html`
                        <div
                          class="climate-bottom-icon ${fanMode === 'on' || fanMode === 'auto'
                            ? 'active'
                            : ''}"
                          style="${fanMode === 'on' || fanMode === 'auto'
                            ? `background-color: ${dialColor}; border-color: ${dialColor};`
                            : ''}"
                          @click=${(e: Event) => {
                            e.stopPropagation();
                            const wrapper = (e.currentTarget as HTMLElement).closest(
                              '.climate-dial-wrapper'
                            );
                            wrapper
                              ?.querySelectorAll(
                                '.climate-mode-popup.show, .climate-preset-popup.show'
                              )
                              .forEach(popup => popup.classList.remove('show'));
                            const fanPopup = wrapper?.querySelector('.climate-fan-popup');
                            if (fanPopup) {
                              fanPopup.classList.toggle('show');
                            }
                          }}
                          title="Fan: ${(fanMode || 'auto').replace('_', ' ').toUpperCase()}"
                        >
                          <ha-icon icon="mdi:fan"></ha-icon>
                        </div>
                      `
                    : ''}
                </div>
              `;
            })()}
            </div>

            <!-- Mode Popup (hidden by default, shows when mode icon clicked) -->
            ${climateModule.show_mode_switcher !== false && hvacModes.length > 0
              ? html`
                  <div class="climate-mode-popup">
                    <div class="climate-mode-popup-content">
                      ${hvacModes.map(
                        mode => html`
                          <button
                            class="climate-mode-popup-btn ${mode === hvacMode ? 'active' : ''}"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              handleModeChange(mode);
                              // Hide popup after selection
                              const popup = (e.currentTarget as HTMLElement).closest(
                                '.climate-mode-popup'
                              );
                              if (popup) {
                                popup.classList.remove('show');
                              }
                            }}
                          >
                            <ha-icon icon="${getModeIcon(mode)}"></ha-icon>
                            <span>${mode.replace('_', ' ')}</span>
                          </button>
                        `
                      )}
                    </div>
                  </div>
                `
              : ''}

            <!-- Fan Popup (hidden by default, shows when fan icon clicked) -->
            ${climateModule.show_fan_controls && hasFanMode && fanModes.length > 0
              ? html`
                  <div class="climate-fan-popup climate-mode-popup">
                    <div class="climate-mode-popup-content">
                      ${fanModes.map(
                        mode => html`
                          <button
                            class="climate-mode-popup-btn ${mode === fanMode ? 'active' : ''}"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              handleFanModeChange(mode);
                              // Hide popup after selection
                              const popup = (e.currentTarget as HTMLElement).closest(
                                '.climate-fan-popup'
                              );
                              if (popup) {
                                popup.classList.remove('show');
                              }
                            }}
                          >
                            <ha-icon icon="mdi:fan"></ha-icon>
                            <span>${mode.replace('_', ' ').toUpperCase()}</span>
                          </button>
                        `
                      )}
                    </div>
                  </div>
                `
              : ''}
            ${climateModule.show_preset_modes && hasPresetMode && presetModes.length > 0
              ? html`
                  <div class="climate-preset-popup climate-mode-popup">
                    <div class="climate-mode-popup-content">
                      ${presetModes.map(
                        mode => html`
                          <button
                            class="climate-mode-popup-btn ${mode === presetMode ? 'active' : ''}"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              handlePresetModeChange(mode);
                              const popup = (e.currentTarget as HTMLElement).closest(
                                '.climate-preset-popup'
                              );
                              if (popup) {
                                popup.classList.remove('show');
                              }
                            }}
                          >
                            <span>${formatPresetName(mode)}</span>
                          </button>
                        `
                      )}
                    </div>
                  </div>
                `
              : ''}

            <!-- Temperature Info Popup -->
            <div class="climate-info-popup climate-temp-info-popup">
              <div class="climate-info-popup-content">
                <div class="climate-info-popup-title">Current Temperature</div>
                <div class="climate-info-popup-value">${Math.round(currentTemp)}${tempUnit}</div>
                <div class="climate-info-popup-detail">Min: ${Math.round(minTemp)}${tempUnit}</div>
                <div class="climate-info-popup-detail">Max: ${Math.round(maxTemp)}${tempUnit}</div>
              </div>
            </div>

            <!-- Target Temperature Info Popup -->
            <div class="climate-info-popup climate-target-info-popup">
              <div class="climate-info-popup-content">
                <div class="climate-info-popup-title">Target Temperature</div>
                <div class="climate-info-popup-value">
                  ${useRangeSlider && displayLow !== undefined && displayHigh !== undefined
                    ? html`${Math.round(displayLow)}-${Math.round(displayHigh)}${tempUnit}`
                    : displayTarget !== undefined
                      ? html`${Math.round(displayTarget)}${tempUnit}`
                      : 'N/A'}
                </div>
                <div class="climate-info-popup-detail">Step: ${tempStep}${tempUnit}</div>
              </div>
            </div>

            <!-- Humidity Info Popup -->
            ${hasHumidity && humidity !== undefined
              ? html`
                  <div class="climate-info-popup climate-humidity-info-popup">
                    <div class="climate-info-popup-content">
                      <div class="climate-info-popup-title">Humidity</div>
                      <div class="climate-info-popup-value">${Math.round(humidity)}%</div>
                      <div class="climate-info-popup-detail">Relative Humidity</div>
                    </div>
                  </div>
                `
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const climateModule = module as ClimateModule;
    const errors = [...baseValidation.errors];

    // Validate entity
    if (!climateModule.entity || climateModule.entity.trim() === '') {
      errors.push('Climate entity is required');
    }

    // Validate entity domain
    if (climateModule.entity && !climateModule.entity.startsWith('climate.')) {
      errors.push('Entity must be a climate domain entity (climate.*)');
    }

    // Validate dial size
    if (
      climateModule.dial_size &&
      (climateModule.dial_size < 200 || climateModule.dial_size > 400)
    ) {
      errors.push('Dial size must be between 200 and 400 pixels');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Call a climate service
   */
  private async callClimateService(
    service: string,
    entityId: string,
    serviceData: any,
    hass: HomeAssistant
  ): Promise<void> {
    try {
      await hass.callService('climate', service, {
        entity_id: entityId,
        ...serviceData,
      });
    } catch (error) {
      console.error(`Failed to call climate.${service}:`, error);
    }
  }

  getStyles(): string {
    return `
      /* Climate Module Container */
      .climate-module-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
      }

      /* Info Section */
      .climate-info-top,
      .climate-info-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 320px;
      }

      .climate-mode-display,
      .climate-humidity {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .climate-mode-display ha-icon,
      .climate-humidity ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      /* Dial Wrapper */
      .climate-dial-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--dial-size, 280px);
        height: var(--dial-size, 280px);
        z-index: 1;
      }
 
      .climate-ha-slider {
        width: 100%;
        height: auto;
        display: block;
        z-index: 1;
        position: relative;
      }

      /* Dial Center Content */
      .climate-dial-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
        width: 80%;
        height: 80%;
        z-index: 10;
      }

      /* Enable pointer events on interactive elements inside dial center */
      .climate-dial-center .climate-preset-display,
      .climate-dial-center .climate-current-temp,
      .climate-dial-center .climate-target-stack,
      .climate-dial-center .climate-humidity-row,
      .climate-dial-center .climate-bottom-controls,
      .climate-dial-center .climate-mode-popup,
      .climate-dial-center .climate-fan-popup,
      .climate-dial-center .climate-preset-popup,
      .climate-dial-center .climate-info-popup {
        pointer-events: auto;
      }

      /* Dial items wrapper to keep items centered when some are disabled */
      .climate-dial-items {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding-top: 20px;
        width: 100%;
        height: 100%;
      }

      .climate-mode-indicator {
        position: absolute;
        top: 2%;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        pointer-events: auto;
      }

      .climate-mode-indicator:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .climate-humidity-row {
        position: static;
        transform: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 500;
        opacity: 0.7;
        text-align: center;
        flex: 0 0 auto;
        margin-top: 8px;
      }

      .climate-humidity-label {
        text-transform: uppercase;
        letter-spacing: 0.6px;
        font-weight: 700;
        opacity: 0.8;
      }

      .climate-humidity-value {
        font-weight: 700;
      }

      .climate-current-temp {
        position: static;
        transform: none;
        font-size: 56px;
        font-weight: 700;
        line-height: 1;
        transition: font-size 0.3s ease;
        flex: 0 0 auto;
      }

      .climate-target-temp {
        position: static;
        transform: none;
        font-size: 14px;
        font-weight: 500;
        opacity: 0.8;
        text-align: center;
      }

      .climate-target-stack {
        position: static;
        transform: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        pointer-events: auto;
        flex: 0 0 auto;
        padding-top: 4px;
      }
 
       .climate-target-row {
        display: flex;
        align-items: center;
        gap: 8px;
       }
 
       /* Bottom Control Icons (power, mode, fan) */
       .climate-bottom-controls {
         position: static;
         transform: none;
         display: flex;
         gap: 9px;
         align-items: center;
         justify-content: center;
         pointer-events: auto;
         margin-top: 10px;
         flex: 0 0 auto;
       }

       /* Center button groups based on count */
       .climate-bottom-controls-1 {
         width: 50px;
       }

       .climate-bottom-controls-2 {
         width: 100px;
       }

       .climate-bottom-controls-3 {
         width: 150px;
       }
 
       .climate-preset-display {
         position: static;
         transform: none;
         display: inline-flex;
         align-items: center;
         padding: 1px 10px;
         border-radius: 999px;
         border: none;
         background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.18);
         font-size: 12px;
         font-weight: 600;
         letter-spacing: 0.3px;
         cursor: pointer;
         pointer-events: auto;
         transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
         flex: 0 0 auto;
         margin-bottom: 4px;
       }

       .climate-preset-display:hover {
        background: rgba(var(--rgb-primary-color), 0.22);
        color: var(--text-primary-color);
        transform: translateY(-1px);
      }

      .climate-preset-value {
        text-transform: capitalize;
        font-weight: 700;
      }

      .climate-bottom-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--divider-color);
        background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.05);
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .climate-bottom-icon:hover {
        background: rgba(var(--rgb-primary-color), 0.2);
        border-color: var(--primary-color);
        transform: scale(1.05);
      }

      .climate-bottom-icon.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      .climate-bottom-icon ha-icon {
        --mdc-icon-size: 14px;
        transform: translateY(-1px);
        display: block;
      }

      .climate-bottom-icon.power-off {
        opacity: 0.5;
      }

      .climate-control-btn-inline {
        /* Size controlled via inline style, color controlled via inline style */
        border-radius: 50%;
        border: 2px solid;
        background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      }

      .climate-control-btn-inline:hover:not(:disabled) {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        opacity: 0.8;
      }

      .climate-control-btn-inline:active:not(:disabled) {
        transform: scale(0.95);
      }

      .climate-control-btn-inline:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .climate-control-btn-inline ha-icon {
        --mdc-icon-size: var(--icon-size, 20px);
        display: block;
      }

      /* Mode Popup */
      .climate-mode-popup {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: all 0.2s ease;
      }

      .climate-mode-popup.show {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .climate-mode-popup-content {
        background: var(--card-background-color);
        border-radius: 12px;
        padding: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        border: 2px solid var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 140px;
      }

      .climate-mode-popup-btn {
        padding: 12px 16px;
        border-radius: 8px;
        border: none;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        font-weight: 500;
        text-transform: capitalize;
        text-align: left;
      }

      .climate-mode-popup-btn ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .climate-mode-popup-btn:hover {
        background: var(--secondary-background-color);
      }

      .climate-mode-popup-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .climate-mode-popup-btn.active ha-icon {
        color: var(--text-primary-color);
      }

      /* Info Popups */
      .climate-info-popup {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: all 0.2s ease;
      }

      .climate-info-popup.show {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .climate-info-popup-content {
        background: var(--card-background-color);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        border: 2px solid var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 160px;
        text-align: center;
      }

      .climate-info-popup-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        letter-spacing: 0.5px;
      }

      .climate-info-popup-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1;
      }

      .climate-info-popup-detail {
        font-size: 12px;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }

      /* Fan and Preset Controls */
      .climate-fan-controls,
      .climate-preset-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        max-width: 320px;
      }

      .climate-control-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .climate-chip-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .climate-chip {
        padding: 6px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: capitalize;
      }

      .climate-chip:hover {
        background: var(--secondary-background-color);
        border-color: var(--primary-color);
      }

      .climate-chip.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      /* Pulse Effect - Growing circles when heating/cooling (background) */
      .climate-pulse-background {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: var(--dial-size, 280px);
        height: var(--dial-size, 280px);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
      }

      .climate-pulse-circle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--pulse-color);
        border-radius: 50%;
        opacity: 0.3;
        animation: climate-pulse-grow 2s ease-out infinite;
      }

      .climate-pulse-circle:nth-of-type(1) {
        animation-delay: 0s;
      }

      .climate-pulse-circle:nth-of-type(2) {
        animation-delay: 0.5s;
      }

      .climate-pulse-circle:nth-of-type(3) {
        animation-delay: 1s;
      }

      .climate-pulse-circle:nth-of-type(4) {
        animation-delay: 1.5s;
      }

      @keyframes climate-pulse-grow {
        0% {
          width: 60%;
          height: 60%;
          opacity: 0.4;
        }
        100% {
          width: 100%;
          height: 100%;
          opacity: 0;
        }
      }

      .climate-pulse-mask {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 75%;
        height: 75%;
        border-radius: 50%;
        background-color: var(--card-background-color, var(--ha-card-background, white));
        z-index: 5;
        pointer-events: none;
      }

      /* Dial style variations removed */

      /* Animations removed */

      /* Responsive Design */
      @media (max-width: 768px) {
        .climate-module-container {
          padding: 12px;
        }

        .climate-current-temp {
          font-size: 36px;
        }

        .climate-target-temp {
          font-size: 12px;
        }

        .climate-mode-btn {
          min-width: 60px;
          padding: 6px 10px;
          font-size: 10px;
        }
      }
    `;
  }
}
