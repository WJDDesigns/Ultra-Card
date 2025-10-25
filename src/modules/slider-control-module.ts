import { TemplateResult, html, css } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, SliderControlModule } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { EntityIconService } from '../services/entity-icon-service';

export class UltraSliderControlModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'slider_control',
    title: 'Slider Control',
    description: 'Interactive slider for controlling entity values',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:tune-vertical',
    category: 'interactive',
    tags: ['slider', 'control', 'light', 'cover', 'fan', 'interactive', 'entity'],
  };

  // Drag state management
  private dragState = new Map<
    string,
    {
      isDragging: boolean;
      startX: number;
      startY: number;
      startValue: number;
      currentValue: number;
    }
  >();

  createDefault(id?: string, hass?: HomeAssistant): SliderControlModule {
    // Auto-detect suitable entity (prefer lights, then covers, then fans, then input_numbers)
    let autoEntity = '';
    if (hass?.states) {
      const entityIds = Object.keys(hass.states);
      const light = entityIds.find(id => id.startsWith('light.'));
      const cover = entityIds.find(id => id.startsWith('cover.'));
      const fan = entityIds.find(id => id.startsWith('fan.'));
      const inputNumber = entityIds.find(id => id.startsWith('input_number.'));
      autoEntity = light || cover || fan || inputNumber || '';
    }

    return {
      id: id || this.generateId('slider_control'),
      type: 'slider_control',

      // Entity Configuration
      entity: autoEntity,

      // Value Range - will be auto-detected from entity
      min_value: 0,
      max_value: 100,
      step: 1,

      // Orientation & Layout
      orientation: 'horizontal',
      layout_mode: 'outside',
      overlay_position: 'left',
      bar_fill_percentage: 100,
      outside_position: 'top',
      outside_alignment: 'start',
      split_bar_position: 'left',
      split_info_position: 'right',
      split_ratio: 60,

      // Slider Visual Style
      slider_style: 'flat',
      slider_height: 55,
      slider_radius: 'round',
      border_radius: 10,
      slider_track_color: '', // Empty = auto-calculate from fill at 25% opacity
      slider_fill_color: 'var(--primary-color)',
      dynamic_fill_color: false,
      glass_blur_amount: 8,

      // Gradient Support
      use_gradient: false,
      gradient_stops: [],

      // Display Elements
      show_icon: true,
      dynamic_icon: true,
      icon_as_toggle: true,
      icon_size: 24,
      icon_color: 'var(--primary-text-color)',
      auto_contrast: true,

      show_name: true,
      name_size: 14,
      name_color: 'var(--primary-text-color)',
      name_bold: true,

      show_state: false,
      state_size: 12,
      state_color: 'var(--secondary-text-color)',
      state_bold: false,

      show_value: true,
      value_size: 14,
      value_color: 'var(--primary-text-color)',
      value_suffix: '%',

      // Toggle Integration
      show_toggle: false,
      toggle_position: 'right',
      toggle_size: 28,
      toggle_color_on: 'var(--primary-color)',
      toggle_color_off: 'rgba(var(--rgb-primary-text-color), 0.3)',

      // Light Color Control
      show_color_picker: false,
      color_picker_position: 'below',
      color_picker_size: 'medium',

      // Animation
      animate_on_change: true,
      transition_duration: 200,
      haptic_feedback: true,

      // Entity-specific
      light_control_mode: 'brightness',
      cover_invert: false,

      // Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Hover
      enable_hover_effect: false,

      // Logic
      display_mode: 'always',
      display_conditions: [],
      smart_scaling: true,
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sliderControl = module as SliderControlModule;
    const lang = hass?.locale?.language || 'en';

    // Detect entity domain for conditional sections
    const entityDomain = sliderControl.entity ? sliderControl.entity.split('.')[0] : '';
    const isLight = entityDomain === 'light';
    const isCover = entityDomain === 'cover';

    return html`
      <div class="slider-control-general-tab">
        ${this.injectUcFormStyles()}
        <style>
          .slider-control-general-tab {
            padding: 8px;
          }
          .settings-section {
            background: var(--secondary-background-color);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--primary-color);
            margin-bottom: 16px;
            letter-spacing: 0.5px;
          }
          .field-container {
            margin-bottom: 16px;
          }
          .field-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--primary-text-color);
          }
          .field-description {
            font-size: 13px;
            color: var(--secondary-text-color);
            margin-bottom: 12px;
            opacity: 0.8;
            line-height: 1.4;
          }
          .conditional-fields-group {
            margin-top: 16px;
            border-left: 4px solid var(--primary-color);
            background: rgba(var(--rgb-primary-color), 0.08);
            border-radius: 0 8px 8px 0;
            padding: 16px;
          }
        </style>

        <!-- ENTITY CONFIGURATION -->
        <div class="settings-section">
          <div class="section-title">ENTITY CONFIGURATION</div>
          
          ${this.renderFieldSection(
            'Entity',
            'Select the entity to control with this slider',
            hass,
            { entity: sliderControl.entity || '' },
            [this.entityField('entity')],
            (e: CustomEvent) => updateModule({ entity: e.detail.value.entity })
          )}
          
          ${this.renderFieldSection(
            'Name',
            'Override the entity name (leave empty to use entity name)',
            hass,
            { name: sliderControl.name || '' },
            [this.textField('name')],
            (e: CustomEvent) => updateModule({ name: e.detail.value.name })
          )}
          

          
          ${this.renderFieldSection(
            'Min Value',
            'Minimum value for the slider',
            hass,
            { min_value: sliderControl.min_value ?? 0 },
            [this.numberField('min_value', 0, 1000, 1)],
            (e: CustomEvent) => updateModule({ min_value: e.detail.value.min_value })
          )}
          
          ${this.renderFieldSection(
            'Max Value',
            'Maximum value for the slider',
            hass,
            { max_value: sliderControl.max_value ?? 100 },
            [this.numberField('max_value', 0, 1000, 1)],
            (e: CustomEvent) => updateModule({ max_value: e.detail.value.max_value })
          )}
          
          ${this.renderFieldSection(
            'Step',
            'Step increment for value changes',
            hass,
            { step: sliderControl.step ?? 1 },
            [this.numberField('step', 0.1, 100, 0.1)],
            (e: CustomEvent) => updateModule({ step: e.detail.value.step })
          )}
          
          ${
            sliderControl.entity && hass.states[sliderControl.entity]
              ? html` <div class="conditional-fields-group"></div> `
              : ''
          }
          
          ${
            isLight
              ? html`
                  <div class="field-container" style="margin-top: 16px;">
                    <div class="field-title">Light Control Mode</div>
                    <div class="field-description">What aspect of the light to control</div>
                    ${this.renderFieldSection(
                      '',
                      '',
                      hass,
                      { light_control_mode: sliderControl.light_control_mode || 'brightness' },
                      [
                        this.selectField('light_control_mode', [
                          { value: 'brightness', label: 'Brightness' },
                          { value: 'color_temp', label: 'Color Temperature' },
                          { value: 'rgb', label: 'RGB Color' },
                          { value: 'both', label: 'Brightness + RGB' },
                          { value: 'all', label: 'Brightness + RGB + Color Temp' },
                        ]),
                      ],
                      (e: CustomEvent) =>
                        updateModule({ light_control_mode: e.detail.value.light_control_mode })
                    )}
                  </div>
                `
              : ''
          }
          
          ${
            isCover
              ? html`
                  <div
                    style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;"
                  >
                    <div>
                      <div class="field-title">Invert Direction</div>
                      <div class="field-description">Reverse the slider direction for covers</div>
                    </div>
                    <ha-switch
                      .checked=${sliderControl.cover_invert ?? false}
                      @change=${(e: Event) => {
                        const target = e.target as any;
                        updateModule({ cover_invert: target.checked });
                      }}
                    ></ha-switch>
                  </div>
                `
              : ''
          }
        </div>

        <!-- LAYOUT & ORIENTATION -->
        <div class="settings-section">
          <div class="section-title">LAYOUT & ORIENTATION</div>
          
          ${this.renderFieldSection(
            'Orientation',
            'Slider direction: horizontal or vertical',
            hass,
            { orientation: sliderControl.orientation || 'horizontal' },
            [
              this.selectField('orientation', [
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical', label: 'Vertical' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ orientation: e.detail.value.orientation })
          )}
          
          ${this.renderFieldSection(
            'Layout Mode',
            'How to position information relative to the slider',
            hass,
            { layout_mode: sliderControl.layout_mode || 'outside' },
            [
              this.selectField('layout_mode', [
                { value: 'outside', label: 'Outside (info beside slider)' },
                { value: 'overlay', label: 'Overlay (info on slider)' },
                { value: 'split', label: 'Split (adjustable ratio)' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ layout_mode: e.detail.value.layout_mode })
          )}
          
          ${
            sliderControl.layout_mode === 'outside'
              ? html`
                  <div class="conditional-fields-group">
                    ${this.renderFieldSection(
                      'Outside Position',
                      'Where to position information (top or bottom)',
                      hass,
                      { outside_position: sliderControl.outside_position || 'top' },
                      [
                        this.selectField('outside_position', [
                          { value: 'top', label: 'Top' },
                          { value: 'bottom', label: 'Bottom' },
                        ]),
                      ],
                      (e: CustomEvent) =>
                        updateModule({ outside_position: e.detail.value.outside_position })
                    )}
                    ${this.renderFieldSection(
                      'Outside Alignment',
                      'How to align the information',
                      hass,
                      { outside_alignment: sliderControl.outside_alignment || 'start' },
                      [
                        this.selectField('outside_alignment', [
                          { value: 'start', label: 'Start' },
                          { value: 'center', label: 'Center' },
                          { value: 'end', label: 'End' },
                        ]),
                      ],
                      (e: CustomEvent) =>
                        updateModule({ outside_alignment: e.detail.value.outside_alignment })
                    )}
                  </div>
                `
              : sliderControl.layout_mode === 'overlay'
                ? html`
                    <div class="conditional-fields-group">
                      ${this.renderFieldSection(
                        'Overlay Position',
                        'Where to position information on the slider',
                        hass,
                        { overlay_position: sliderControl.overlay_position || 'left' },
                        [
                          this.selectField('overlay_position', [
                            { value: 'left', label: 'Left' },
                            { value: 'center', label: 'Center' },
                            { value: 'right', label: 'Right' },
                          ]),
                        ],
                        (e: CustomEvent) =>
                          updateModule({ overlay_position: e.detail.value.overlay_position })
                      )}

                      <div class="field-container">
                        <div class="field-title">Bar Fill Percentage</div>
                        <div class="field-description">
                          How much of the module the bar fills (50-100%)
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            step="1"
                            .value="${sliderControl.bar_fill_percentage || 100}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ bar_fill_percentage: parseInt(target.value) });
                            }}
                            style="flex: 1;"
                          />
                          <input
                            type="number"
                            min="50"
                            max="100"
                            .value="${sliderControl.bar_fill_percentage || 100}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ bar_fill_percentage: parseInt(target.value) });
                            }}
                            style="width: 70px;"
                          />
                        </div>
                      </div>
                    </div>
                  `
                : ''
          }
          
          ${
            sliderControl.layout_mode === 'split'
              ? html`
                  <div class="conditional-fields-group">
                    ${this.renderFieldSection(
                      'Bar Position',
                      'Where to position the slider bar (left or right)',
                      hass,
                      { split_bar_position: sliderControl.split_bar_position || 'left' },
                      [
                        this.selectField('split_bar_position', [
                          { value: 'left', label: 'Left' },
                          { value: 'right', label: 'Right' },
                        ]),
                      ],
                      (e: CustomEvent) =>
                        updateModule({ split_bar_position: e.detail.value.split_bar_position })
                    )}
                    ${this.renderFieldSection(
                      'Info Position',
                      'How to align information in the info section',
                      hass,
                      { split_info_position: sliderControl.split_info_position || 'center' },
                      [
                        this.selectField('split_info_position', [
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Center' },
                          { value: 'right', label: 'Right' },
                        ]),
                      ],
                      (e: CustomEvent) =>
                        updateModule({ split_info_position: e.detail.value.split_info_position })
                    )}

                    <div class="field-container">
                      <div class="field-title">Split Ratio</div>
                      <div class="field-description">Percentage for bar vs info (10-90)</div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="5"
                          .value="${sliderControl.split_ratio || 50}"
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            updateModule({ split_ratio: parseInt(target.value) });
                          }}
                          style="flex: 1;"
                        />
                        <input
                          type="number"
                          min="10"
                          max="90"
                          .value="${sliderControl.split_ratio || 50}"
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            updateModule({ split_ratio: parseInt(target.value) });
                          }}
                          style="width: 70px;"
                        />
                      </div>
                    </div>
                  </div>
                `
              : ''
          }
        </div>

        <!-- SLIDER STYLE -->
        <div class="settings-section">
          <div class="section-title">SLIDER STYLE</div>
          
          ${this.renderFieldSection(
            'Slider Style',
            'Visual appearance of the slider',
            hass,
            { slider_style: sliderControl.slider_style || 'flat' },
            [
              this.selectField('slider_style', [
                { value: 'flat', label: 'Flat' },
                { value: 'glossy', label: 'Glossy' },
                { value: 'embossed', label: 'Embossed' },
                { value: 'inset', label: 'Inset' },
                { value: 'neon-glow', label: 'Neon Glow' },
                { value: 'outline', label: 'Outline' },
                { value: 'glass', label: 'Glass' },
                { value: 'metallic', label: 'Metallic' },
                { value: 'neumorphic', label: 'Neumorphic' },
                { value: 'minimal', label: 'Minimal' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ slider_style: e.detail.value.slider_style })
          )}
          
          <div class="field-container">
            <div class="field-title">Slider Height</div>
            <div class="field-description">Height in pixels (for horizontal) or width (for vertical)</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                .value="${sliderControl.slider_height || 40}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ slider_height: parseInt(target.value) });
                }}
                style="flex: 1;"
              />
              <input
                type="number"
                min="20"
                max="200"
                .value="${sliderControl.slider_height || 40}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ slider_height: parseInt(target.value) });
                }}
                style="width: 70px;"
              />
            </div>
          </div>
          
          ${this.renderFieldSection(
            'Border Radius',
            'Slider border radius style',
            hass,
            { slider_radius: sliderControl.slider_radius || 'round' },
            [
              this.selectField('slider_radius', [
                { value: 'square', label: 'Square' },
                { value: 'round', label: 'Round' },
                { value: 'pill', label: 'Pill' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ slider_radius: e.detail.value.slider_radius })
          )}
          
          ${
            sliderControl.slider_style === 'glass'
              ? html`
                  <div class="conditional-fields-group">
                    <div class="field-container">
                      <div class="field-title">Glass Blur Amount</div>
                      <div class="field-description">Backdrop filter blur amount (0-20px)</div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          .value="${sliderControl.glass_blur_amount || 8}"
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            updateModule({ glass_blur_amount: parseInt(target.value) });
                          }}
                          style="flex: 1;"
                        />
                        <input
                          type="number"
                          min="0"
                          max="20"
                          .value="${sliderControl.glass_blur_amount || 8}"
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            updateModule({ glass_blur_amount: parseInt(target.value) });
                          }}
                          style="width: 70px;"
                        />
                      </div>
                    </div>
                  </div>
                `
              : ''
          }
        </div>

        <!-- SLIDER COLORS -->
        <div class="settings-section">
          <div class="section-title">SLIDER COLORS</div>
          
          <div class="field-container">
            <div class="field-title">Track Color</div>
            <div class="field-description">Background color (leave empty for auto: fill at 25% opacity)</div>
            <ultra-color-picker
              .value=${sliderControl.slider_track_color || ''}
              .defaultValue={''}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => updateModule({ slider_track_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
          
          <div class="field-container">
            <div class="field-title">Fill Color</div>
            <div class="field-description">Color of the filled portion of the slider</div>
            <ultra-color-picker
              .value=${sliderControl.slider_fill_color || ''}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => updateModule({ slider_fill_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
            <div>
              <div class="field-title">Dynamic Fill Color</div>
              <div class="field-description">Use entity color (RGB lights, etc.)</div>
            </div>
            <ha-switch
              .checked=${sliderControl.dynamic_fill_color || false}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ dynamic_fill_color: target.checked });
              }}
            ></ha-switch>
          </div>
        </div>

        <!-- DISPLAY ELEMENTS -->
        <div class="settings-section">
          <div class="section-title">DISPLAY ELEMENTS</div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div>
              <div class="field-title">Auto Contrast</div>
              <div class="field-description">Automatically adjust text/icon color based on fill</div>
            </div>
            <ha-switch
              .checked=${sliderControl.auto_contrast ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ auto_contrast: target.checked });
              }}
            ></ha-switch>
          </div>
          
          <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <div class="field-title">Show Icon</div>
                <div class="field-description">Display an icon on the slider</div>
              </div>
              <ha-switch
                .checked=${sliderControl.show_icon ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ show_icon: target.checked });
                }}
              ></ha-switch>
            </div>
            
            ${
              sliderControl.show_icon
                ? html`
                    <div class="conditional-fields-group">
                      ${this.renderFieldSection(
                        'Icon',
                        'Icon to display (leave empty for entity icon)',
                        hass,
                        { icon: sliderControl.icon || '' },
                        [this.iconField('icon')],
                        (e: CustomEvent) => updateModule({ icon: e.detail.value.icon })
                      )}

                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Dynamic Icon</div>
                          <div class="field-description">Use entity's default icon</div>
                        </div>
                        <ha-switch
                          .checked=${sliderControl.dynamic_icon ?? true}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            updateModule({ dynamic_icon: target.checked });
                          }}
                        ></ha-switch>
                      </div>

                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Icon as Toggle</div>
                          <div class="field-description">
                            Click icon to toggle entity on/off (icon changes with state)
                          </div>
                        </div>
                        <ha-switch
                          .checked=${sliderControl.icon_as_toggle ?? true}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            updateModule({ icon_as_toggle: target.checked });
                          }}
                        ></ha-switch>
                      </div>

                      <div class="field-container">
                        <div class="field-title">Icon Size</div>
                        <div class="field-description">Icon size in pixels</div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <input
                            type="range"
                            min="16"
                            max="48"
                            step="2"
                            .value="${sliderControl.icon_size || 24}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ icon_size: parseInt(target.value) });
                            }}
                            style="flex: 1;"
                          />
                          <input
                            type="number"
                            min="16"
                            max="48"
                            .value="${sliderControl.icon_size || 24}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ icon_size: parseInt(target.value) });
                            }}
                            style="width: 70px;"
                          />
                        </div>
                      </div>

                      <div class="field-container">
                        <div class="field-title">Icon Color</div>
                        <div class="field-description">Color for the icon</div>
                        <ultra-color-picker
                          .value=${sliderControl.icon_color || ''}
                          .defaultValue=${'var(--primary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ icon_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  `
                : ''
            }
          </div>
          
          <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <div class="field-title">Show Name</div>
                <div class="field-description">Display entity name</div>
              </div>
              <ha-switch
                .checked=${sliderControl.show_name ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ show_name: target.checked });
                }}
              ></ha-switch>
            </div>
            
            ${
              sliderControl.show_name
                ? html`
                    <div class="conditional-fields-group">
                      <div class="field-container">
                        <div class="field-title">Name Size</div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <input
                            type="range"
                            min="10"
                            max="24"
                            step="1"
                            .value="${sliderControl.name_size || 14}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ name_size: parseInt(target.value) });
                            }}
                            style="flex: 1;"
                          />
                          <input
                            type="number"
                            min="10"
                            max="24"
                            .value="${sliderControl.name_size || 14}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ name_size: parseInt(target.value) });
                            }}
                            style="width: 70px;"
                          />
                        </div>
                      </div>

                      <div class="field-container">
                        <div class="field-title">Name Color</div>
                        <ultra-color-picker
                          .value=${sliderControl.name_color || ''}
                          .defaultValue=${'var(--primary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ name_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>

                      <div
                        style="display: flex; align-items: center; justify-content: space-between;"
                      >
                        <div class="field-title">Bold</div>
                        <ha-switch
                          .checked=${sliderControl.name_bold ?? true}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            updateModule({ name_bold: target.checked });
                          }}
                        ></ha-switch>
                      </div>
                    </div>
                  `
                : ''
            }
          </div>
          
          <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <div class="field-title">Show Value</div>
                <div class="field-description">Display current numeric value</div>
              </div>
              <ha-switch
                .checked=${sliderControl.show_value ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ show_value: target.checked });
                }}
              ></ha-switch>
            </div>
            
            ${
              sliderControl.show_value
                ? html`
                    <div class="conditional-fields-group">
                      <div class="field-container">
                        <div class="field-title">Value Size</div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <input
                            type="range"
                            min="10"
                            max="24"
                            step="1"
                            .value="${sliderControl.value_size || 14}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ value_size: parseInt(target.value) });
                            }}
                            style="flex: 1;"
                          />
                          <input
                            type="number"
                            min="10"
                            max="24"
                            .value="${sliderControl.value_size || 14}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ value_size: parseInt(target.value) });
                            }}
                            style="width: 70px;"
                          />
                        </div>
                      </div>

                      <div class="field-container">
                        <div class="field-title">Value Color</div>
                        <ultra-color-picker
                          .value=${sliderControl.value_color || ''}
                          .defaultValue=${'var(--primary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ value_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>

                      ${this.renderFieldSection(
                        'Value Suffix',
                        'Text to append to value (e.g., %, °C, °F)',
                        hass,
                        { value_suffix: sliderControl.value_suffix || '' },
                        [this.textField('value_suffix')],
                        (e: CustomEvent) =>
                          updateModule({ value_suffix: e.detail.value.value_suffix })
                      )}
                    </div>
                  `
                : ''
            }
          </div>
        </div>

        <!-- TOGGLE CONTROL -->
        <div class="settings-section">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div class="section-title" style="margin-bottom: 0;">TOGGLE CONTROL</div>
            <ha-switch
              .checked=${sliderControl.show_toggle || false}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ show_toggle: target.checked });
              }}
            ></ha-switch>
          </div>
          
          ${
            sliderControl.show_toggle
              ? html`
                  ${this.renderFieldSection(
                    'Toggle Position',
                    'Where to place the toggle switch',
                    hass,
                    { toggle_position: sliderControl.toggle_position || 'right' },
                    [
                      this.selectField('toggle_position', [
                        { value: 'left', label: 'Left' },
                        { value: 'right', label: 'Right' },
                        { value: 'top', label: 'Top' },
                        { value: 'bottom', label: 'Bottom' },
                      ]),
                    ],
                    (e: CustomEvent) =>
                      updateModule({ toggle_position: e.detail.value.toggle_position })
                  )}

                  <div class="field-container">
                    <div class="field-title">Toggle Size</div>
                    <div class="field-description">Size of the toggle switch in pixels</div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <input
                        type="range"
                        min="20"
                        max="48"
                        step="2"
                        .value="${sliderControl.toggle_size || 28}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          updateModule({ toggle_size: parseInt(target.value) });
                        }}
                        style="flex: 1;"
                      />
                      <input
                        type="number"
                        min="20"
                        max="48"
                        .value="${sliderControl.toggle_size || 28}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          updateModule({ toggle_size: parseInt(target.value) });
                        }}
                        style="width: 70px;"
                      />
                    </div>
                  </div>

                  <div class="field-container">
                    <div class="field-title">Toggle Color (On)</div>
                    <ultra-color-picker
                      .value=${sliderControl.toggle_color_on || ''}
                      .defaultValue=${'var(--primary-color)'}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ toggle_color_on: e.detail.value })}
                    ></ultra-color-picker>
                  </div>

                  <div class="field-container">
                    <div class="field-title">Toggle Color (Off)</div>
                    <ultra-color-picker
                      .value=${sliderControl.toggle_color_off || ''}
                      .defaultValue=${'rgba(var(--rgb-primary-text-color), 0.3)'}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ toggle_color_off: e.detail.value })}
                    ></ultra-color-picker>
                  </div>
                `
              : html`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    Enable toggle to add on/off control
                  </div>
                `
          }
        </div>



      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sliderControl = module as SliderControlModule;

    return html`
      <div class="actions-tab">
        ${this.injectUcFormStyles()}
        <style>
          .actions-tab {
            padding: 8px;
          }
        </style>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          ${UltraLinkComponent.render(
            hass,
            {
              tap_action: sliderControl.tap_action || { action: 'nothing' },
              hold_action: sliderControl.hold_action || { action: 'nothing' },
              double_tap_action: sliderControl.double_tap_action || { action: 'nothing' },
            },
            (updates: any) => {
              const moduleUpdates: Partial<SliderControlModule> = {};
              if (updates.tap_action) moduleUpdates.tap_action = updates.tap_action;
              if (updates.hold_action) moduleUpdates.hold_action = updates.hold_action;
              if (updates.double_tap_action)
                moduleUpdates.double_tap_action = updates.double_tap_action;
              updateModule(moduleUpdates);
            },
            'Link Configuration'
          )}
        </div>
      </div>
    `;
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updateModule);
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const sliderControl = module as SliderControlModule;

    if (!sliderControl.entity) {
      return html`
        <div style="padding: 20px; text-align: center; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:tune-vertical" style="font-size: 48px; opacity: 0.3;"></ha-icon>
          <div style="margin-top: 12px;">No entity selected</div>
        </div>
      `;
    }

    const entityState = hass.states[sliderControl.entity];
    if (!entityState) {
      return html`
        <div style="padding: 20px; text-align: center; color: var(--error-color);">
          <ha-icon icon="mdi:alert-circle" style="font-size: 48px;"></ha-icon>
          <div style="margin-top: 12px;">Entity not found: ${sliderControl.entity}</div>
        </div>
      `;
    }

    // Extract entity info
    const domain = sliderControl.entity.split('.')[0];
    const entityName =
      sliderControl.name || entityState.attributes.friendly_name || sliderControl.entity;
    const isOn = entityState.state === 'on' || entityState.state === 'open';

    // Get icon - use a key to force re-render when entity state changes
    let displayIcon = sliderControl.icon;
    if (sliderControl.dynamic_icon || !displayIcon) {
      displayIcon =
        EntityIconService.getEntityIcon(sliderControl.entity, hass) ||
        entityState.attributes.icon ||
        'mdi:help-circle';
    }

    // If icon_as_toggle is enabled and entity is a light, change icon based on state
    if (sliderControl.icon_as_toggle && domain === 'light') {
      if (isOn) {
        displayIcon = displayIcon || 'mdi:lightbulb-on';
      } else {
        displayIcon = displayIcon.replace('-on', '-off') || 'mdi:lightbulb-off';
        // Special handling for common light icons
        if (displayIcon === 'mdi:lightbulb') {
          displayIcon = 'mdi:lightbulb-off';
        } else if (!displayIcon.includes('-off') && !displayIcon.includes('-outline')) {
          displayIcon = displayIcon + '-off';
        }
      }
    }

    // Calculate value and percentage
    let currentValue = 0;
    let displayValue = '0';
    let percentage = 0;

    if (domain === 'light') {
      const brightness = entityState.attributes.brightness || 0;
      currentValue = Math.round((brightness / 255) * 100);
      percentage = currentValue;
      displayValue = `${currentValue}`;
    } else if (domain === 'cover') {
      currentValue = parseInt(entityState.attributes.current_position) || 0;
      percentage = sliderControl.cover_invert ? 100 - currentValue : currentValue;
      displayValue = `${currentValue}`;
    } else if (domain === 'fan') {
      currentValue = parseInt(entityState.attributes.percentage) || 0;
      percentage = currentValue;
      displayValue = `${currentValue}`;
    } else if (domain === 'input_number') {
      const value = parseFloat(entityState.state) || 0;
      const min = sliderControl.min_value ?? parseFloat(entityState.attributes.min) ?? 0;
      const max = sliderControl.max_value ?? parseFloat(entityState.attributes.max) ?? 100;
      currentValue = value;
      percentage = ((value - min) / (max - min)) * 100;
      displayValue = value.toFixed(1);
    } else if (domain === 'climate') {
      currentValue = parseFloat(entityState.attributes.temperature) || 0;
      const min = sliderControl.min_value ?? 16;
      const max = sliderControl.max_value ?? 30;
      percentage = ((currentValue - min) / (max - min)) * 100;
      displayValue = currentValue.toFixed(1);
    } else {
      // Generic numeric entity
      currentValue = parseFloat(entityState.state) || 0;
      const min = sliderControl.min_value ?? 0;
      const max = sliderControl.max_value ?? 100;
      percentage = ((currentValue - min) / (max - min)) * 100;
      displayValue = currentValue.toFixed(0);
    }

    // Clamp percentage
    percentage = Math.max(0, Math.min(100, percentage));

    // Get light control mode
    const controlMode = sliderControl.light_control_mode || 'brightness';
    console.log('=== MODULE INIT ===');
    console.log('Entity:', sliderControl.entity);
    console.log('Control Mode:', controlMode);
    console.log('Domain:', domain);
    console.log('Entity State:', entityState);

    // Handle slider interaction
    const handleSliderInput = async (e: Event) => {
      const input = e.target as HTMLInputElement;
      const newPercentage = parseFloat(input.value);

      // Check if this is an RGB or color temp slider
      const sliderType = (input as any).dataset.sliderType || 'value';
      console.log('=== SLIDER INPUT EVENT ===');
      console.log('Slider type:', sliderType);
      console.log('New percentage:', newPercentage);
      console.log('Entity:', sliderControl.entity);
      console.log('Domain:', domain);

      // Calculate actual value from percentage
      const min = sliderControl.min_value ?? 0;
      const max = sliderControl.max_value ?? 100;
      let newValue = (newPercentage / 100) * (max - min) + min;

      // Call appropriate service
      try {
        if (domain === 'light') {
          const serviceData: any = { entity_id: sliderControl.entity };

          if (sliderType === 'brightness') {
            const brightness = Math.round((newPercentage / 100) * 255);
            serviceData.brightness = brightness;
          } else if (sliderType === 'rgb') {
            // Rainbow slider: convert hue (0-100%) to RGB
            // Use full saturation and brightness for vibrant colors
            const hue = newPercentage / 100; // 0-1
            const rgb = hsvToRgb(hue, 1, 1);
            serviceData.rgb_color = rgb;
            // Clear any active effects to switch to RGB mode
            serviceData.effect = 'None';
            console.log(
              'RGB mode activated! Hue:',
              hue,
              'RGB:',
              rgb,
              'Entity:',
              sliderControl.entity
            );
          } else if (sliderType === 'red') {
            const red = Math.round(newPercentage * 2.55);
            const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
            serviceData.rgb_color = [red, rgbColor[1], rgbColor[2]];
          } else if (sliderType === 'green') {
            const green = Math.round(newPercentage * 2.55);
            const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
            serviceData.rgb_color = [rgbColor[0], green, rgbColor[2]];
          } else if (sliderType === 'blue') {
            const blue = Math.round(newPercentage * 2.55);
            const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
            serviceData.rgb_color = [rgbColor[0], rgbColor[1], blue];
          } else if (sliderType === 'color_temp') {
            // Color temp ranges from 154 (warm) to 500 (cool) in mireds
            const minTemp = 154;
            const maxTemp = 500;
            const colorTemp = Math.round(maxTemp - (newPercentage / 100) * (maxTemp - minTemp));
            serviceData.color_temp = colorTemp;
            // Clear any active effects to switch to color temp mode
            serviceData.effect = 'None';
            console.log('Setting color_temp:', colorTemp, 'for entity:', sliderControl.entity);
          }

          console.log('=== CALLING LIGHT.TURN_ON ===');
          console.log('Service Data:', JSON.stringify(serviceData, null, 2));
          console.log('Entity State Before:', entityState);
          
          const result = await hass.callService('light', 'turn_on', serviceData);
          
          console.log('Service call result:', result);
          
          // Wait a moment and check entity state
          setTimeout(() => {
            const newState = hass.states[sliderControl.entity];
            console.log('Entity State After:', newState);
            console.log('RGB Color After:', newState?.attributes?.rgb_color);
            console.log('Color Mode After:', newState?.attributes?.color_mode);
          }, 500);
        } else if (domain === 'cover') {
          const position = sliderControl.cover_invert ? 100 - newPercentage : newPercentage;
          await hass.callService('cover', 'set_cover_position', {
            entity_id: sliderControl.entity,
            position: Math.round(position),
          });
        } else if (domain === 'fan') {
          await hass.callService('fan', 'set_percentage', {
            entity_id: sliderControl.entity,
            percentage: Math.round(newPercentage),
          });
        } else if (domain === 'input_number') {
          await hass.callService('input_number', 'set_value', {
            entity_id: sliderControl.entity,
            value: newValue,
          });
        } else if (domain === 'climate') {
          await hass.callService('climate', 'set_temperature', {
            entity_id: sliderControl.entity,
            temperature: newValue,
          });
        }

        // Haptic feedback
        if (sliderControl.haptic_feedback && 'vibrate' in navigator) {
          navigator.vibrate(10);
        }
      } catch (error) {
        console.error('Failed to update entity:', error);
      }
    };

    const handleToggle = async () => {
      try {
        if (domain === 'light' || domain === 'fan' || domain === 'switch') {
          await hass.callService(domain, isOn ? 'turn_off' : 'turn_on', {
            entity_id: sliderControl.entity,
          });
        } else if (domain === 'cover') {
          await hass.callService('cover', isOn ? 'close_cover' : 'open_cover', {
            entity_id: sliderControl.entity,
          });
        }

        if (sliderControl.haptic_feedback && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
      } catch (error) {
        console.error('Failed to toggle entity:', error);
      }
    };

    // Get dynamic fill color if enabled
    let dynamicFillColor = sliderControl.slider_fill_color || 'var(--primary-color)';
    let fillRgb = [33, 150, 243]; // Default primary color RGB

    if (sliderControl.dynamic_fill_color && domain === 'light' && isOn) {
      const rgbColor = entityState.attributes.rgb_color;
      if (rgbColor && Array.isArray(rgbColor) && rgbColor.length === 3) {
        dynamicFillColor = `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
        fillRgb = rgbColor;
      }
    } else if (sliderControl.slider_fill_color) {
      // Try to extract RGB from the fill color for luminance calculation
      fillRgb = this.extractRgbFromColor(sliderControl.slider_fill_color);
    }

    // Calculate luminance and determine contrast color
    const luminance = (0.299 * fillRgb[0] + 0.587 * fillRgb[1] + 0.114 * fillRgb[2]) / 255;
    const isDarkBackground = luminance < 0.5;
    const contrastColor = isDarkBackground ? '#ffffff' : '#000000';

    // Determine colors based on auto-contrast
    const getIconColor = () => {
      if (!sliderControl.auto_contrast) {
        return sliderControl.icon_color || 'var(--primary-text-color)';
      }
      return contrastColor;
    };

    const getNameColor = () => {
      if (!sliderControl.auto_contrast) {
        return sliderControl.name_color || 'var(--primary-text-color)';
      }
      return contrastColor;
    };

    const getValueColor = () => {
      if (!sliderControl.auto_contrast) {
        return sliderControl.value_color || 'var(--primary-text-color)';
      }
      return contrastColor;
    };

    // Render toggle switch
    const renderToggle = () => {
      if (!sliderControl.show_toggle) return '';

      const togglePos = sliderControl.toggle_position || 'right';
      const toggleColorOn = sliderControl.toggle_color_on || 'var(--primary-color)';
      const toggleColorOff = sliderControl.toggle_color_off || 'var(--secondary-text-color)';

      return html`
        <ha-switch
          .checked=${isOn}
          @change=${handleToggle}
          style="
            --switch-checked-button-color: ${toggleColorOn};
            --switch-checked-track-color: ${toggleColorOn};
            --switch-unchecked-button-color: ${toggleColorOff};
            --switch-unchecked-track-color: ${toggleColorOff};
            --mdc-theme-secondary: ${toggleColorOn};
          "
        ></ha-switch>
      `;
    };

    // Render content elements
    const renderInfo = () => {
      const togglePos = sliderControl.toggle_position || 'right';

      return html`
        <div style="display: flex; align-items: center; gap: 12px;">
          ${togglePos === 'left' ? renderToggle() : ''}
          ${sliderControl.show_icon
            ? html`
                <ha-icon
                  .icon="${displayIcon}"
                  style="
                    font-size: ${sliderControl.icon_size || 24}px;
                    color: ${getIconColor()};
                    cursor: ${sliderControl.icon_as_toggle ? 'pointer' : 'default'};
                    pointer-events: ${sliderControl.icon_as_toggle ? 'auto' : 'none'};
                  "
                  @click=${sliderControl.icon_as_toggle ? handleToggle : null}
                ></ha-icon>
              `
            : ''}
          <div style="flex: 1; min-width: 0;">
            ${sliderControl.show_name
              ? html`
                  <div
                    style="
                      font-size: ${sliderControl.name_size || 14}px;
                      color: ${getNameColor()};
                      font-weight: ${sliderControl.name_bold ? '700' : '400'};
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                  >
                    ${entityName}
                  </div>
                `
              : ''}
            ${sliderControl.show_value
              ? html`
                  <div
                    style="
                      font-size: ${sliderControl.value_size || 14}px;
                      color: ${getValueColor()};
                      opacity: 0.9;
                    "
                  >
                    ${displayValue}${sliderControl.value_suffix || '%'}
                  </div>
                `
              : ''}
          </div>
          ${togglePos === 'right' ? renderToggle() : ''}
        </div>
      `;
    };

    const orientation = sliderControl.orientation || 'horizontal';
    const layoutMode = sliderControl.layout_mode || 'outside';
    const sliderHeight = sliderControl.slider_height || 55;
    const fillColor = dynamicFillColor; // Use the dynamic color we calculated above

    // Default track color: use fill color at 25% opacity (like Mushroom card)
    let trackColor = sliderControl.slider_track_color;
    if (!trackColor) {
      // Create a semi-transparent version of the fill color
      if (fillColor.startsWith('rgb(')) {
        trackColor = fillColor.replace('rgb(', 'rgba(').replace(')', ', 0.25)');
      } else if (fillColor.startsWith('rgba(')) {
        // Extract RGB and set alpha to 0.25
        const rgbaMatch = fillColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbaMatch) {
          trackColor = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, 0.25)`;
        } else {
          trackColor = 'rgba(var(--rgb-primary-color), 0.25)';
        }
      } else {
        trackColor = 'rgba(var(--rgb-primary-color), 0.25)';
      }
    }

    const sliderStyle = sliderControl.slider_style || 'flat';

    let borderRadius = '10px';
    if (sliderControl.slider_radius === 'square') borderRadius = '0';
    else if (sliderControl.slider_radius === 'pill') borderRadius = `${sliderHeight / 2}px`;
    else borderRadius = '10px';

    // Build container and slider styles based on slider_style
    const isVertical = orientation === 'vertical';
    const gradientDirection = isVertical ? 'to top' : 'to right';

    let containerStyles = '';
    let sliderTrackStyles = '';
    let overlayContent = '';

    const baseBackground = `linear-gradient(${gradientDirection}, ${fillColor} 0%, ${fillColor} ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%)`;

    switch (sliderStyle) {
      case 'flat':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
        `;
        break;

      case 'glossy':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
          box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
        `;
        overlayContent = `
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%);
        `;
        break;

      case 'embossed':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
          box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3);
        `;
        break;

      case 'inset':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
        `;
        break;

      case 'neon-glow':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
          box-shadow: 0 0 15px ${fillColor}, 0 0 30px ${fillColor}80, 0 0 45px ${fillColor}40;
          filter: brightness(1.2);
        `;
        break;

      case 'outline':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
          border: 2px solid ${fillColor};
        `;
        break;

      case 'glass':
        const blurAmount = sliderControl.glass_blur_amount || 8;
        containerStyles = `
          background: transparent;
          border-radius: ${borderRadius};
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        overlayContent = `
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(${blurAmount}px);
        `;
        break;

      case 'metallic':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
        `;
        overlayContent = `
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.15) 100%);
        `;
        break;

      case 'neumorphic':
        containerStyles = `
          background: ${baseBackground};
          border-radius: ${borderRadius};
          box-shadow: -4px -4px 8px rgba(255, 255, 255, 0.5), 4px 4px 8px rgba(0, 0, 0, 0.2);
        `;
        break;

      case 'minimal':
        // Minimal style: thin bar with visible dot slider
        containerStyles = `
          background: ${trackColor};
          border-radius: 10px;
        `;
        overlayContent = `
          background: linear-gradient(${gradientDirection}, ${fillColor} 0%, ${fillColor} ${percentage}%, transparent ${percentage}%, transparent 100%);
          opacity: 0.8;
        `;
        break;
    }

    // Slider input styles (transparent, sits on top of styled container)
    // For minimal style, always show thumb (like bar module)
    const showThumb = sliderStyle === 'minimal';
    const transition = sliderControl.animate_on_change
      ? `all ${sliderControl.transition_duration || 200}ms ease`
      : 'none';

    // For minimal style, use relative positioning so flexbox centering works
    const sliderInputStyles =
      sliderStyle === 'minimal'
        ? `
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 100%;
      background: transparent;
      outline: none;
      cursor: pointer;
      position: relative;
      z-index: 2;
    `
        : `
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 100%;
      background: transparent;
      outline: none;
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
    `;

    // Thumb size based on slider height or style
    // For minimal style with 8px track, use a 16-20px thumb for visibility
    const thumbSize = sliderStyle === 'minimal' ? 16 : Math.max(sliderHeight * 0.8, 20);
    const thumbColor = '#ffffff';

    const thumbStyles = showThumb
      ? `
      -webkit-appearance: none;
      appearance: none;
      width: ${thumbSize}px;
      height: ${thumbSize}px;
      background: ${thumbColor};
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.1s ease;
    `
      : `
      -webkit-appearance: none;
      appearance: none;
      width: 0;
      height: 0;
      background: transparent;
      border: none;
      cursor: pointer;
    `;

    // Render a single slider with custom value and type
    const renderSingleSlider = (
      sliderValue: number,
      sliderType: string = 'brightness',
      label: string = '',
      color: string = fillColor
    ) => {
      // Determine if this is a gradient (contains 'linear-gradient' or multiple rgb values)
      const isGradient = color.includes('linear-gradient');

      // Use selector ring for RGB and color temp gradients
      const useSelectorRing = sliderType === 'rgb' || sliderType === 'color_temp';
      const selectorRingSize = sliderHeight * 1.2;

      let baseBackground: string;

      if (isGradient) {
        // For gradients, use the full gradient as the track background
        // For slider fill, we need to overlay on top - this is a simplified approach
        // We'll use a pseudo-element for the fill in the actual implementation
        const trackGradient = color;
        baseBackground = trackGradient;
      } else {
        // Solid color background
        let trackColorForSlider = trackColor;
        if (color.startsWith('rgb(')) {
          trackColorForSlider = color.replace('rgb(', 'rgba(').replace(')', ', 0.25)');
        } else if (color.startsWith('rgba(')) {
          const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (rgbaMatch) {
            trackColorForSlider = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, 0.25)`;
          }
        }
        baseBackground = `linear-gradient(${gradientDirection}, ${color} 0%, ${color} ${sliderValue}%, ${trackColorForSlider} ${sliderValue}%, ${trackColorForSlider} 100%)`;
      }

      return html`
        <div
          style="display: flex; flex-direction: column; gap: 4px; width: 100%; ${controlMode ===
            'all' || controlMode === 'both'
            ? 'margin-bottom: 16px;'
            : ''}"
        >
          ${label
            ? html`<div
                style="font-size: 11px; color: var(--secondary-text-color); text-transform: uppercase; font-weight: 600;"
              >
                ${label}
              </div>`
            : ''}
          <div
            class="slider-track-container"
            style="
              position: relative;
              height: ${sliderStyle === 'minimal' ? 8 : sliderHeight}px;
              width: 100%;
              ${isGradient ? `background: ${baseBackground};` : baseBackground};
              border-radius: ${borderRadius};
              transition: ${transition};
              overflow: ${sliderStyle === 'minimal' ? 'visible' : 'hidden'};
              ${sliderStyle === 'minimal' ? 'display: flex; align-items: center;' : ''}
            "
          >
            ${isGradient
              ? html`
                  <!-- Dim the unfilled portion -->
                  <div
                    style="
                  position: absolute;
                  top: 0;
                  left: ${sliderValue}%;
                  width: ${100 - sliderValue}%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.3);
                  border-radius: ${borderRadius};
                  pointer-events: none;
                  z-index: 0;
                "
                  ></div>
                `
              : ''}
            ${overlayContent
              ? html`
                  <div
                    style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                ${overlayContent}
                border-radius: ${borderRadius};
                pointer-events: none;
                z-index: 1;
              "
                  ></div>
                `
              : ''}
            <input
              type="range"
              data-slider-type="${sliderType}"
              class="${useSelectorRing ? 'selector-ring-thumb' : ''}"
              min="0"
              max="100"
              step="${sliderControl.step || 1}"
              .value="${sliderValue}"
              @input=${handleSliderInput}
              style="${sliderInputStyles}${useSelectorRing
                ? ` --thumb-size: ${selectorRingSize}px;`
                : ''}"
            />
            ${useSelectorRing
              ? html`
                  <style>
                    input.selector-ring-thumb::-webkit-slider-thumb {
                      width: 4px !important;
                      height: ${selectorRingSize}px !important;
                      border: none !important;
                      border-left: 3px solid #ffffff !important;
                      border-right: 3px solid #ffffff !important;
                      background: transparent !important;
                      border-radius: 0 !important;
                      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3) !important;
                      cursor: pointer !important;
                      -webkit-appearance: none !important;
                      appearance: none !important;
                      position: relative !important;
                    }
                    input.selector-ring-thumb::-moz-range-thumb {
                      width: 4px !important;
                      height: ${selectorRingSize}px !important;
                      border: none !important;
                      border-left: 3px solid #ffffff !important;
                      border-right: 3px solid #ffffff !important;
                      background: transparent !important;
                      border-radius: 0 !important;
                      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3) !important;
                      cursor: pointer !important;
                    }
                  </style>
                `
              : ''}
          </div>
        </div>
      `;
    };

    // Render slider with container
    const renderSliderWithStyles = () => {
      // For vertical, use a better auto-fit height
      const verticalHeight = sliderHeight * 4;
      const verticalWidth = Math.max(sliderHeight, 60); // Minimum width for vertical

      // For minimal style, make it thinner like a bar module
      const actualHeight = sliderStyle === 'minimal' ? 8 : sliderHeight;
      const actualVerticalWidth = sliderStyle === 'minimal' ? 8 : verticalWidth;

      return html`
        <div
          class="slider-track-container"
          style="
            position: relative;
            ${isVertical
            ? `height: ${verticalHeight}px; width: ${actualVerticalWidth}px;`
            : `height: ${actualHeight}px; width: 100%;`}
            ${containerStyles}
            transition: ${transition};
            overflow: ${sliderStyle === 'minimal' ? 'visible' : 'hidden'};
            ${sliderStyle === 'minimal' ? 'display: flex; align-items: center;' : ''}
          "
        >
          ${overlayContent
            ? html`
                <div
                  style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              ${overlayContent}
              border-radius: ${borderRadius};
              pointer-events: none;
              z-index: 1;
            "
                ></div>
              `
            : ''}
          <input
            type="range"
            min="0"
            max="100"
            step="${sliderControl.step || 1}"
            .value="${percentage}"
            @input=${handleSliderInput}
            style="${sliderInputStyles}${isVertical
              ? ' transform: rotate(-90deg); transform-origin: center;'
              : ''}"
          />
        </div>
      `;
    };

    // Get current RGB and color temp values for multi-slider modes
    let rgbValues = [255, 255, 255];
    let colorTempValue = 0;

    if (
      domain === 'light' &&
      entityState.attributes.rgb_color &&
      Array.isArray(entityState.attributes.rgb_color)
    ) {
      rgbValues = entityState.attributes.rgb_color;
    }

    if (domain === 'light' && entityState.attributes.color_temp) {
      // Color temp ranges from 154 (warm) to 500 (cool)
      const minTemp = 154;
      const maxTemp = 500;
      const currentTemp = entityState.attributes.color_temp;
      // Convert to percentage (154 = 100%, 500 = 0%)
      colorTempValue = ((maxTemp - currentTemp) / (maxTemp - minTemp)) * 100;
    }

    // Calculate individual RGB percentages
    const redPercent = (rgbValues[0] / 255) * 100;
    const greenPercent = (rgbValues[1] / 255) * 100;
    const bluePercent = (rgbValues[2] / 255) * 100;

    // Calculate combined RGB value (0-100) for rainbow slider
    // Convert RGB to HSL and use H (hue) for the slider position
    const rgbToHue = (r: number, g: number, b: number): number => {
      r = r / 255;
      g = g / 255;
      b = b / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      if (delta === 0) return 0;

      let hue = 0;
      if (max === r) {
        hue = (((g - b) / delta) % 6) / 6;
      } else if (max === g) {
        hue = ((b - r) / delta + 2) / 6;
      } else {
        hue = ((r - g) / delta + 4) / 6;
      }

      // Ensure hue is between 0 and 1
      if (hue < 0) hue += 1;
      if (hue > 1) hue -= 1;

      return hue * 100; // Convert to 0-100 range
    };

    const rgbHuePercent = rgbToHue(rgbValues[0], rgbValues[1], rgbValues[2]);

    // Helper to convert HSV to RGB (h in range 0-1, s and v in range 0-1)
    const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
      const c = v * s;
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
      const m = v - c;

      let r = 0,
        g = 0,
        b = 0;

      if (h < 1 / 6) {
        r = c;
        g = x;
        b = 0;
      } else if (h < 2 / 6) {
        r = x;
        g = c;
        b = 0;
      } else if (h < 3 / 6) {
        r = 0;
        g = c;
        b = x;
      } else if (h < 4 / 6) {
        r = 0;
        g = x;
        b = c;
      } else if (h < 5 / 6) {
        r = x;
        g = 0;
        b = c;
      } else {
        r = c;
        g = 0;
        b = x;
      }

      return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
    };

    // Build final layout based on mode
    let finalLayout;

    // For multi-slider modes, wrap the sliders
    let slidersContent = renderSliderWithStyles();

    // Replace with multi-slider content if needed
    if (domain === 'light') {
      if (controlMode === 'rgb') {
        // Rainbow gradient for RGB
        const rainbowGradient =
          'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 127, 0) 16.67%, rgb(255, 255, 0) 33.33%, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 66.67%, rgb(75, 0, 130) 83.33%, rgb(148, 0, 211) 100%)';
        slidersContent = html`${renderSingleSlider(
          rgbHuePercent,
          'rgb',
          'RGB Color',
          rainbowGradient
        )}`;
      } else if (controlMode === 'both') {
        const rainbowGradient =
          'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 127, 0) 16.67%, rgb(255, 255, 0) 33.33%, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 66.67%, rgb(75, 0, 130) 83.33%, rgb(148, 0, 211) 100%)';
        slidersContent = html`
          ${renderSingleSlider(rgbHuePercent, 'rgb', 'RGB Color', rainbowGradient)}
          ${renderSingleSlider(percentage, 'brightness', 'Brightness', fillColor)}
        `;
      } else if (controlMode === 'all') {
        const rainbowGradient =
          'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 127, 0) 16.67%, rgb(255, 255, 0) 33.33%, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 66.67%, rgb(75, 0, 130) 83.33%, rgb(148, 0, 211) 100%)';
        const tempGradient =
          'linear-gradient(90deg, rgb(255, 103, 0) 0%, rgb(255, 147, 41) 12.5%, rgb(255, 196, 136) 25%, rgb(255, 215, 176) 37.5%, rgb(255, 246, 213) 50%, rgb(241, 250, 255) 62.5%, rgb(208, 232, 255) 75%, rgb(169, 200, 255) 87.5%, rgb(130, 170, 255) 100%)';
        slidersContent = html`
          ${renderSingleSlider(rgbHuePercent, 'rgb', 'RGB Color', rainbowGradient)}
          ${renderSingleSlider(colorTempValue, 'color_temp', 'Color Temp', tempGradient)}
          ${renderSingleSlider(percentage, 'brightness', 'Brightness', fillColor)}
        `;
      } else if (controlMode === 'color_temp') {
        const tempGradient =
          'linear-gradient(90deg, rgb(255, 103, 0) 0%, rgb(255, 147, 41) 12.5%, rgb(255, 196, 136) 25%, rgb(255, 215, 176) 37.5%, rgb(255, 246, 213) 50%, rgb(241, 250, 255) 62.5%, rgb(208, 232, 255) 75%, rgb(169, 200, 255) 87.5%, rgb(130, 170, 255) 100%)';
        slidersContent = html`${renderSingleSlider(
          colorTempValue,
          'color_temp',
          'Color Temp',
          tempGradient
        )}`;
      }
    }

    if (layoutMode === 'outside') {
      // Outside mode: info positioned outside the slider (top/bottom only)
      const outsidePos = sliderControl.outside_position || 'top';
      const outsideAlign = sliderControl.outside_alignment || 'start';

      const alignmentStyle =
        outsideAlign === 'center' ? 'center' : outsideAlign === 'end' ? 'flex-end' : 'flex-start';

      if (outsidePos === 'top') {
        finalLayout = html`
          <div
            style="display: flex; flex-direction: column; gap: 12px; align-items: ${alignmentStyle};"
          >
            <div style="flex-shrink: 0;">${renderInfo()}</div>
            ${slidersContent}
          </div>
        `;
      } else {
        // bottom
        finalLayout = html`
          <div
            style="display: flex; flex-direction: column; gap: 12px; align-items: ${alignmentStyle};"
          >
            ${slidersContent}
            <div style="flex-shrink: 0;">${renderInfo()}</div>
          </div>
        `;
      }
    } else if (layoutMode === 'overlay') {
      const overlayPos = sliderControl.overlay_position || 'left';

      // On slider overlay
      finalLayout = html`
        <div
          style="position: relative; ${isVertical
            ? 'display: flex; flex-direction: column; align-items: center;'
            : ''}"
        >
          ${slidersContent}
          <div
            style="
              position: absolute;
              ${isVertical
              ? `left: 50%; transform: translateX(-50%); ${overlayPos === 'left' || overlayPos === 'center' ? 'top: 12px;' : 'bottom: 12px;'}`
              : `top: 50%; left: ${overlayPos === 'left' ? '12px' : overlayPos === 'right' ? 'auto' : '50%'}; right: ${overlayPos === 'right' ? '12px' : 'auto'}; transform: translate(${overlayPos === 'center' ? '-50%' : '0'}, -50%);`}
              pointer-events: none;
              z-index: 3;
            "
          >
            ${renderInfo()}
          </div>
        </div>
      `;
    } else {
      // Split mode (left/right only)
      const barPos = sliderControl.split_bar_position || 'left';
      const infoPos = sliderControl.split_info_position || 'right';
      const ratio = sliderControl.split_ratio || 60;

      const sliderPart = html`<div
        style="flex: ${ratio}; display: flex; flex-direction: column; align-items: center; justify-content: center;"
      >
        ${slidersContent}
      </div>`;
      const infoPart = html`
        <div
          style="
          flex: ${100 - ratio}; 
          display: flex; 
          align-items: center;
          justify-content: ${infoPos === 'center'
            ? 'center'
            : infoPos === 'right'
              ? 'flex-end'
              : 'flex-start'};
        "
        >
          ${renderInfo()}
        </div>
      `;

      if (barPos === 'left') {
        finalLayout = html`
          <div style="display: flex; gap: 12px; align-items: center;">
            ${sliderPart} ${infoPart}
          </div>
        `;
      } else {
        // right
        finalLayout = html`
          <div style="display: flex; gap: 12px; align-items: center;">
            ${infoPart} ${sliderPart}
          </div>
        `;
      }
    }

    return html`
      <div class="slider-control-container" style="padding: 16px; position: relative;">
        <style>
          .slider-control-container input[type="range"]::-webkit-slider-track {
            background: transparent;
            height: 100%;
          }
          .slider-control-container input[type="range"]::-moz-range-track {
            background: transparent;
            height: 100%;
          }
          .slider-control-container input[type="range"]::-webkit-slider-thumb {
            ${thumbStyles}
          }
          .slider-control-container input[type="range"]::-moz-range-thumb {
            ${thumbStyles}
          }
          .slider-control-container input[type="range"]:hover::-webkit-slider-thumb {
            transform: ${showThumb ? 'scale(1.1)' : 'none'};
          }
          .slider-control-container input[type="range"]:hover::-moz-range-thumb {
            transform: ${showThumb ? 'scale(1.1)' : 'none'};
          }
        </style>
        ${finalLayout}
      </div>
    `;
  }

  /**
   * Extract RGB values from a color string (hex, rgb, or CSS var)
   * Returns default blue if parsing fails
   */
  private extractRgbFromColor(color: string): [number, number, number] {
    // Try to extract from hex color
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
        ];
      } else if (hex.length === 6) {
        return [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16),
        ];
      }
    }

    // Try to extract from rgb() format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // Try to extract from rgba() format
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
    }

    // Default to primary blue color
    return [33, 150, 243];
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const sliderControl = module as SliderControlModule;
    const errors = [...baseValidation.errors];

    // Entity is required
    if (!sliderControl.entity || sliderControl.entity.trim() === '') {
      errors.push('Entity is required for Slider Control');
    }

    // Validate value ranges
    if (sliderControl.min_value !== undefined && sliderControl.max_value !== undefined) {
      if (sliderControl.min_value >= sliderControl.max_value) {
        errors.push('Min value must be less than max value');
      }
    }

    // Validate slider height
    if (
      sliderControl.slider_height &&
      (sliderControl.slider_height < 20 || sliderControl.slider_height > 200)
    ) {
      errors.push('Slider height must be between 20 and 200 pixels');
    }

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      /* Placeholder for styles */
    `;
  }
}
