import { html, svg, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, GaugeModule, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { FormUtils } from '../utils/form-utils';
import '../components/ultra-color-picker';
import '../components/uc-gradient-editor';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';

export class UltraGaugeModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'gauge',
    title: 'Gauge',
    description:
      'Display sensor values as customizable gauges with various styles and pointer options',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:gauge',
    category: 'content',
    tags: ['gauge', 'sensor', 'value', 'indicator', 'speedometer', 'meter'],
  };

  private _templateService?: any;

  createDefault(id?: string, hass?: HomeAssistant): GaugeModule {
    const suitableEntity = this.findSuitableSensor(hass);

    return {
      id: id || this.generateId('gauge'),
      type: 'gauge',
      entity: suitableEntity,
      name: '',

      // Value Configuration
      value_type: 'entity',
      min_value: 0,
      max_value: 100,

      // Gauge Style
      gauge_style: '3d',
      gauge_size: 200,
      gauge_thickness: 15,

      // Pointer Configuration
      pointer_enabled: true,
      pointer_style: 'needle',
      pointer_color: 'var(--primary-color)',
      pointer_length: 80,
      pointer_width: 4,

      // Color Configuration
      gauge_color_mode: 'gradient',
      gauge_color: 'var(--primary-color)',
      gauge_background_color: '#424242',
      use_gradient: true,
      gradient_stops: [
        { id: this.generateId('stop'), position: 0, color: '#4CAF50' },
        { id: this.generateId('stop'), position: 50, color: '#FFC107' },
        { id: this.generateId('stop'), position: 100, color: '#F44336' },
      ],

      // Display Configuration
      show_value: true,
      value_position: 'center',
      value_font_size: 24,
      value_color: 'var(--primary-text-color)',

      // Value formatting defaults
      value_bold: false,
      value_italic: false,
      value_underline: false,
      value_uppercase: false,
      value_strikethrough: false,

      show_name: true,
      name_position: 'top',
      name_font_size: 16,
      name_color: 'var(--secondary-text-color)',

      // Name formatting defaults
      name_bold: false,
      name_italic: false,
      name_underline: false,
      name_uppercase: false,
      name_strikethrough: false,

      show_min_max: true,
      min_max_font_size: 12,
      min_max_color: 'var(--secondary-text-color)',

      // Tick Marks
      show_ticks: true,
      tick_count: 10,
      tick_color: 'var(--divider-color)',
      show_tick_labels: false,
      tick_label_font_size: 10,

      // Animation
      animation_enabled: true,
      animation_duration: '1000ms',
      animation_easing: 'ease-out',

      // Segments (default for segments mode)
      segments: [
        { id: this.generateId('segment'), from: 0, to: 30, color: '#4CAF50', label: 'Low' },
        { id: this.generateId('segment'), from: 30, to: 70, color: '#FFC107', label: 'Medium' },
        { id: this.generateId('segment'), from: 70, to: 100, color: '#F44336', label: 'High' },
      ],

      // Global actions (use Default like Mushroom by storing undefined)
      tap_action: undefined,
      hold_action: undefined,
      double_tap_action: undefined,
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private findSuitableSensor(hass?: HomeAssistant): string {
    if (!hass?.states) return '';

    // Priority list of sensors to look for
    const priorities = [
      'sensor.battery_level',
      'sensor.cpu_temperature',
      'sensor.humidity',
      'sensor.temperature',
    ];

    for (const entityId of priorities) {
      if (hass.states[entityId]) return entityId;
    }

    // Find any numeric sensor
    const numericSensors = Object.keys(hass.states).filter(entityId => {
      if (!entityId.startsWith('sensor.')) return false;
      const state = hass.states[entityId];
      const numValue = parseFloat(state.state);
      return !isNaN(numValue);
    });

    return numericSensors[0] || '';
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as GaugeModule, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const gaugeModule = module as GaugeModule;

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .settings-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 16px;
          padding-bottom: 0;
          border-bottom: none;
          letter-spacing: 0.5px;
        }
        .field-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 4px;
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
          overflow: hidden;
          transition: all 0.2s ease;
          animation: slideInFromLeft 0.3s ease-out;
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .gradient-stops-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        .gradient-stop {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 8px;
          align-items: center;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          border: 1px solid var(--divider-color);
        }
        .add-stop-btn,
        .remove-stop-btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid var(--divider-color);
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
        }
        .add-stop-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .remove-stop-btn {
          padding: 6px 12px;
          background: rgba(var(--rgb-accent-color), 0.1);
          border-color: var(--accent-color);
        }
        .remove-stop-btn:hover {
          background: var(--accent-color);
          color: white;
        }
        .segments-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        .segment-item {
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          border: 1px solid var(--divider-color);
        }
        .segment-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
        }
      </style>

      ${this.renderBasicConfiguration(gaugeModule, hass, updateModule)}
      ${this.renderValueConfiguration(gaugeModule, hass, updateModule)}
      ${this.renderStyleConfiguration(gaugeModule, hass, updateModule)}
      ${this.renderPointerConfiguration(gaugeModule, hass, updateModule)}
      ${this.renderColorConfiguration(gaugeModule, hass, updateModule)}
      ${this.renderDisplayConfiguration(gaugeModule, hass, updateModule)}
      ${this.renderTicksConfiguration(gaugeModule, hass, updateModule)}
      ${this.renderAnimationConfiguration(gaugeModule, hass, updateModule)}
    `;
  }

  private renderBasicConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">BASIC CONFIGURATION</div>

        <div style="margin-bottom: 24px;">
          ${FormUtils.renderField(
            'Entity',
            'Select the sensor entity to display on the gauge.',
            hass,
            { entity: gaugeModule.entity || '' },
            [
              FormUtils.createSchemaItem('entity', {
                entity: { domain: ['sensor', 'input_number'] },
              }),
            ],
            (e: CustomEvent) => updateModule({ entity: e.detail.value.entity })
          )}
        </div>

        <div style="margin-bottom: 24px;">
          ${FormUtils.renderField(
            'Name',
            'Optional display name for the gauge. Leave empty to use entity friendly name.',
            hass,
            { name: gaugeModule.name || '' },
            [FormUtils.createSchemaItem('name', { text: {} })],
            (e: CustomEvent) => updateModule({ name: e.detail.value.name })
          )}
        </div>

        <div class="field-container" style="margin-bottom: 24px;">
          <div class="field-title">Minimum Value</div>
          <div class="field-description">The minimum value for the gauge scale.</div>
          ${FormUtils.renderCleanForm(
            hass,
            { min_value: gaugeModule.min_value ?? 0 },
            [FormUtils.createSchemaItem('min_value', { number: { mode: 'box', step: 1 } })],
            (e: CustomEvent) => {
              const value = e.detail.value.min_value;
              updateModule({ min_value: value === '' ? undefined : Number(value) });
            }
          )}
        </div>

        <div class="field-container" style="margin-bottom: 24px;">
          <div class="field-title">Maximum Value</div>
          <div class="field-description">The maximum value for the gauge scale.</div>
          ${FormUtils.renderCleanForm(
            hass,
            { max_value: gaugeModule.max_value ?? 100 },
            [FormUtils.createSchemaItem('max_value', { number: { mode: 'box', step: 1 } })],
            (e: CustomEvent) => {
              const value = e.detail.value.max_value;
              updateModule({ max_value: value === '' ? undefined : Number(value) });
            }
          )}
        </div>
      </div>
    `;
  }

  private renderValueConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const valueType = gaugeModule.value_type || 'entity';

    return html`
      <div class="settings-section">
        <div class="section-title">VALUE CONFIGURATION</div>

        <div class="field-group" style="margin-bottom: 24px;">
          <div class="field-title">Value Source</div>
          <div class="field-description">How to calculate the gauge value.</div>
          ${this.renderUcForm(
            hass,
            { value_type: valueType },
            [
              this.selectField('value_type', [
                { value: 'entity', label: 'Entity State' },
                { value: 'attribute', label: 'Entity Attribute' },
                { value: 'template', label: 'Template' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.value_type;
              if (next === valueType) return;
              updateModule({ value_type: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>
        ${valueType === 'attribute'
          ? html`
              <div class="conditional-fields-group">
                ${FormUtils.renderField(
                  'Attribute Entity',
                  'Entity containing the attribute.',
                  hass,
                  { value_attribute_entity: gaugeModule.value_attribute_entity || '' },
                  [FormUtils.createSchemaItem('value_attribute_entity', { entity: {} })],
                  (e: CustomEvent) =>
                    updateModule({ value_attribute_entity: e.detail.value.value_attribute_entity })
                )}
                ${FormUtils.renderField(
                  'Attribute Name',
                  'Name of the attribute to use.',
                  hass,
                  { value_attribute_name: gaugeModule.value_attribute_name || '' },
                  [FormUtils.createSchemaItem('value_attribute_name', { text: {} })],
                  (e: CustomEvent) =>
                    updateModule({ value_attribute_name: e.detail.value.value_attribute_name })
                )}
              </div>
            `
          : ''}
        ${valueType === 'template'
          ? html`
              <div class="conditional-fields-group">
                ${FormUtils.renderField(
                  'Value Template',
                  'Jinja2 template to calculate the gauge value. Should return a numeric value.',
                  hass,
                  { value_template: gaugeModule.value_template || '' },
                  [FormUtils.createSchemaItem('value_template', { text: { multiline: true } })],
                  (e: CustomEvent) =>
                    updateModule({ value_template: e.detail.value.value_template })
                )}

                <div
                  class="template-examples"
                  style="margin-top: 12px; padding: 12px; background: var(--code-editor-background-color, #1e1e1e); border-radius: 4px;"
                >
                  <div style="font-size: 12px; color: #9cdcfe; margin-bottom: 8px;">Examples:</div>
                  <div
                    style="font-family: monospace; font-size: 11px; color: #d4d4d4; margin-bottom: 4px;"
                  >
                    {{ states('sensor.battery') | float }}
                  </div>
                  <div style="font-family: monospace; font-size: 11px; color: #d4d4d4;">
                    {{ state_attr('climate.home', 'current_temperature') | float }}
                  </div>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderStyleConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">GAUGE STYLE</div>

        <div class="field-group" style="margin-bottom: 24px;">
          <div class="field-title">Gauge Style</div>
          <div class="field-description">Choose the visual style of the gauge.</div>
          ${this.renderUcForm(
            hass,
            { gauge_style: gaugeModule.gauge_style || 'modern' },
            [
              this.selectField('gauge_style', [
                { value: 'basic', label: 'Basic' },
                { value: 'modern', label: 'Modern' },
                { value: 'speedometer', label: 'Speedometer' },
                { value: 'arc', label: 'Arc' },
                { value: 'radial', label: 'Radial' },
                { value: 'lines', label: 'Lines' },
                { value: 'block', label: 'Block' },
                { value: 'minimal', label: 'Minimal' },
                { value: 'inset', label: 'Inset' },
                { value: '3d', label: '3D' },
                { value: 'neon', label: 'Neon Glow' },
                { value: 'digital', label: 'Digital' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.gauge_style;
              const prev = gaugeModule.gauge_style || 'modern';
              if (next === prev) return;
              updateModule({ gauge_style: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>

        ${this.renderGaugeSizeFields(gaugeModule, hass, updateModule)}
      </div>
    `;
  }

  private renderGaugeSizeFields(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const gaugeStyle = gaugeModule.gauge_style || 'modern';
    const showSizeThickness = !['lines', 'digital'].includes(gaugeStyle);

    if (!showSizeThickness) return html``;

    return html`
      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Gauge Size</div>
        <div class="field-description">Diameter/size of the gauge in pixels (100-400).</div>
        ${FormUtils.renderCleanForm(
          hass,
          { gauge_size: gaugeModule.gauge_size ?? 200 },
          [
            FormUtils.createSchemaItem('gauge_size', {
              number: { mode: 'box', min: 100, max: 400, step: 10 },
            }),
          ],
          (e: CustomEvent) => {
            const value = e.detail.value.gauge_size;
            updateModule({ gauge_size: value === '' ? undefined : Number(value) });
          }
        )}
      </div>

      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Gauge Thickness</div>
        <div class="field-description">Thickness of the gauge track (1-50).</div>
        ${FormUtils.renderCleanForm(
          hass,
          { gauge_thickness: gaugeModule.gauge_thickness ?? 15 },
          [
            FormUtils.createSchemaItem('gauge_thickness', {
              number: { mode: 'box', min: 1, max: 50, step: 1 },
            }),
          ],
          (e: CustomEvent) => {
            const value = e.detail.value.gauge_thickness;
            updateModule({ gauge_thickness: value === '' ? undefined : Number(value) });
          }
        )}
      </div>
    `;
  }

  private renderPointerSizeFields(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const pointerStyle = gaugeModule.pointer_style || 'needle';
    const showLengthWidth = !['highlight', 'cap'].includes(pointerStyle);

    if (!showLengthWidth) return html``;

    return html`
      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Pointer Length</div>
        <div class="field-description">Length as percentage of gauge radius (1-100).</div>
        ${FormUtils.renderCleanForm(
          hass,
          { pointer_length: gaugeModule.pointer_length ?? 80 },
          [
            FormUtils.createSchemaItem('pointer_length', {
              number: { mode: 'box', min: 1, max: 100, step: 1 },
            }),
          ],
          (e: CustomEvent) => {
            const value = e.detail.value.pointer_length;
            updateModule({ pointer_length: value === '' ? undefined : Number(value) });
          }
        )}
      </div>

      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Pointer Width</div>
        <div class="field-description">Width of the pointer in pixels (1-20).</div>
        ${FormUtils.renderCleanForm(
          hass,
          { pointer_width: gaugeModule.pointer_width ?? 4 },
          [
            FormUtils.createSchemaItem('pointer_width', {
              number: { mode: 'box', min: 1, max: 20, step: 1 },
            }),
          ],
          (e: CustomEvent) => {
            const value = e.detail.value.pointer_width;
            updateModule({ pointer_width: value === '' ? undefined : Number(value) });
          }
        )}
      </div>
    `;
  }

  private renderPointerConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const pointerEnabled = gaugeModule.pointer_enabled !== false;

    return html`
      <div class="settings-section">
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="section-title" style="margin: 0;">POINTER CONFIGURATION</div>
          <ha-switch
            .checked=${pointerEnabled}
            @change=${(e: Event) =>
              updateModule({ pointer_enabled: (e.target as HTMLInputElement).checked })}
          ></ha-switch>
        </div>
        <div class="field-description" style="margin-bottom: 16px;">
          Enable and customize the gauge pointer/needle that indicates the current value.
        </div>
        ${pointerEnabled
          ? html`
              <div class="conditional-fields-group">
                <div class="field-group" style="margin-bottom: 24px;">
                  <div class="field-title">Pointer Style</div>
                  <div class="field-description">Visual style of the pointer/needle.</div>
                  ${this.renderUcForm(
                    hass,
                    { pointer_style: gaugeModule.pointer_style || 'needle' },
                    [
                      this.selectField('pointer_style', [
                        { value: 'needle', label: 'Needle' },
                        { value: 'triangle', label: 'Triangle' },
                        { value: 'arrow', label: 'Arrow' },
                        { value: 'line', label: 'Line' },
                        { value: 'circle', label: 'Circle' },
                        { value: 'highlight', label: 'Track Highlight' },
                        { value: 'cap', label: 'Track Cap' },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.pointer_style;
                      const prev = gaugeModule.pointer_style || 'needle';
                      if (next === prev) return;
                      updateModule({ pointer_style: next });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                    false
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Pointer Color</div>
                  <div class="field-description">Color of the pointer.</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${gaugeModule.pointer_color || ''}
                    .defaultValue=${'var(--primary-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ pointer_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                ${this.renderPointerSizeFields(gaugeModule, hass, updateModule)}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderColorConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const colorMode = gaugeModule.gauge_color_mode || 'gradient';

    return html`
      <div class="settings-section">
        <div class="section-title">COLOR CONFIGURATION</div>

        <div class="field-group" style="margin-bottom: 24px;">
          <div class="field-title">Color Mode</div>
          <div class="field-description">How colors are applied to the gauge.</div>
          ${this.renderUcForm(
            hass,
            { gauge_color_mode: colorMode },
            [
              this.selectField('gauge_color_mode', [
                { value: 'solid', label: 'Solid Color' },
                { value: 'gradient', label: 'Gradient' },
                { value: 'segments', label: 'Color Segments' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.gauge_color_mode;
              const prev = colorMode;
              if (next === prev) return;

              const updates: Partial<GaugeModule> = { gauge_color_mode: next };

              // Create default segments if switching to segments mode and none exist
              if (
                next === 'segments' &&
                (!gaugeModule.segments || gaugeModule.segments.length === 0)
              ) {
                updates.segments = [
                  {
                    id: this.generateId('segment'),
                    from: 0,
                    to: 30,
                    color: '#4CAF50',
                    label: 'Low',
                  },
                  {
                    id: this.generateId('segment'),
                    from: 30,
                    to: 70,
                    color: '#FFC107',
                    label: 'Medium',
                  },
                  {
                    id: this.generateId('segment'),
                    from: 70,
                    to: 100,
                    color: '#F44336',
                    label: 'High',
                  },
                ];
              }

              updateModule(updates);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>
        ${colorMode === 'solid'
          ? html`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Gauge Color</div>
                  <div class="field-description">Main color of the gauge.</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${gaugeModule.gauge_color || ''}
                    .defaultValue=${'var(--primary-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ gauge_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}
        ${colorMode === 'gradient'
          ? html`
              <div class="conditional-fields-group">
                <div class="field-group" style="margin-bottom: 16px;">
                  <div class="field-title">Gradient Display Mode</div>
                  <div class="field-description">How the gradient is displayed on the gauge.</div>
                  ${this.renderUcForm(
                    hass,
                    { gradient_display_mode: gaugeModule.gradient_display_mode || 'full' },
                    [
                      this.selectField('gradient_display_mode', [
                        { value: 'full', label: 'Full Gradient' },
                        { value: 'cropped', label: 'Cropped to Value' },
                        { value: 'value-based', label: 'Value-Based Color' },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.gradient_display_mode;
                      const prev = gaugeModule.gradient_display_mode || 'full';
                      if (next === prev) return;
                      updateModule({ gradient_display_mode: next });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                    false
                  )}
                </div>

                <uc-gradient-editor
                  .stops=${gaugeModule.gradient_stops || [
                    { id: this.generateId('stop'), position: 0, color: '#4CAF50' },
                    { id: this.generateId('stop'), position: 50, color: '#FFC107' },
                    { id: this.generateId('stop'), position: 100, color: '#F44336' },
                  ]}
                  .barSize=${'regular'}
                  .barRadius=${'round'}
                  .barStyle=${'flat'}
                  @gradient-changed=${(e: CustomEvent) => {
                    updateModule({ gradient_stops: e.detail.stops });
                  }}
                ></uc-gradient-editor>
              </div>
            `
          : ''}
        ${colorMode === 'segments'
          ? html`
              <div class="conditional-fields-group">
                <div class="field-title">Color Segments</div>
                <div class="field-description">Define discrete color segments with ranges.</div>

                <div class="segments-container">
                  ${(gaugeModule.segments || []).map(
                    (segment, index) => html`
                      <div class="segment-item">
                        <div class="segment-row">
                          <div>
                            <div
                              style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                            >
                              From Value
                            </div>
                            <input
                              type="number"
                              .value="${segment.from}"
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                const segments = [...(gaugeModule.segments || [])];
                                segments[index] = {
                                  ...segments[index],
                                  from: parseFloat(target.value),
                                };
                                updateModule({ segments });
                              }}
                              style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color);"
                            />
                          </div>
                          <div>
                            <div
                              style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                            >
                              To Value
                            </div>
                            <input
                              type="number"
                              .value="${segment.to}"
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                const segments = [...(gaugeModule.segments || [])];
                                segments[index] = {
                                  ...segments[index],
                                  to: parseFloat(target.value),
                                };
                                updateModule({ segments });
                              }}
                              style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color);"
                            />
                          </div>
                        </div>
                        <div style="margin-bottom: 8px;">
                          <div
                            style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                          >
                            Label (optional)
                          </div>
                          <input
                            type="text"
                            .value="${segment.label || ''}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              const segments = [...(gaugeModule.segments || [])];
                              segments[index] = { ...segments[index], label: target.value };
                              updateModule({ segments });
                            }}
                            style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color);"
                          />
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <div style="flex: 1;">
                            <div
                              style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                            >
                              Color
                            </div>
                            <ultra-color-picker
                              style="width: 100%;"
                              .value=${segment.color}
                              .hass=${hass}
                              @value-changed=${(e: CustomEvent) => {
                                const segments = [...(gaugeModule.segments || [])];
                                segments[index] = { ...segments[index], color: e.detail.value };
                                updateModule({ segments });
                              }}
                            ></ultra-color-picker>
                          </div>
                          <button
                            class="remove-stop-btn"
                            @click=${() => {
                              const segments = [...(gaugeModule.segments || [])];
                              segments.splice(index, 1);
                              updateModule({ segments });
                            }}
                            style="margin-top: 20px;"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    `
                  )}
                </div>

                <button
                  class="add-stop-btn"
                  @click=${() => {
                    const segments = [...(gaugeModule.segments || [])];
                    const lastTo =
                      segments.length > 0
                        ? segments[segments.length - 1].to
                        : gaugeModule.min_value || 0;
                    segments.push({
                      id: this.generateId('segment'),
                      from: lastTo,
                      to: lastTo + 20,
                      color: '#4CAF50',
                      label: '',
                    });
                    updateModule({ segments });
                  }}
                  style="margin-top: 12px;"
                >
                  + Add Segment
                </button>
              </div>
            `
          : ''}

        <div class="field-container" style="margin-top: 16px;">
          <div class="field-title">Background Color</div>
          <div class="field-description">Background color for the gauge track.</div>
          <ultra-color-picker
            style="width: 100%;"
            .value=${gaugeModule.gauge_background_color || ''}
            .defaultValue=${'var(--disabled-text-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              updateModule({ gauge_background_color: e.detail.value })}
          ></ultra-color-picker>
        </div>
      </div>
    `;
  }

  private renderDisplayConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const showValue = gaugeModule.show_value !== false;
    const showName = gaugeModule.show_name !== false;
    const showMinMax = gaugeModule.show_min_max !== false;

    return html`
      <div class="settings-section">
        <div class="section-title">DISPLAY CONFIGURATION</div>

        <!-- Value Display -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Show Value</div>
          <ha-switch
            .checked=${showValue}
            @change=${(e: Event) =>
              updateModule({ show_value: (e.target as HTMLInputElement).checked })}
          ></ha-switch>
        </div>

        ${showValue
          ? html`
              <div class="conditional-fields-group" style="margin-bottom: 16px;">
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Value Position</div>
                  <div class="field-description">Where to display the value text.</div>
                  ${this.renderUcForm(
                    hass,
                    { value_position: gaugeModule.value_position || 'center' },
                    [
                      this.selectField('value_position', [
                        { value: 'center', label: 'Center' },
                        { value: 'top', label: 'Top' },
                        { value: 'bottom', label: 'Bottom' },
                        { value: 'none', label: 'None' },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.value_position;
                      const prev = gaugeModule.value_position || 'center';
                      if (next === prev) return;
                      updateModule({ value_position: next });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                    false
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Font Size</div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { value_font_size: gaugeModule.value_font_size ?? 24 },
                    [
                      FormUtils.createSchemaItem('value_font_size', {
                        number: { mode: 'box', min: 8, max: 48, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) => {
                      const value = e.detail.value.value_font_size;
                      updateModule({ value_font_size: value === '' ? undefined : Number(value) });
                    }
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${gaugeModule.value_color || ''}
                    .defaultValue=${'var(--primary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ value_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Text Formatting</div>
                  <div class="field-description">Apply formatting styles to the value text.</div>
                  <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button
                      class="format-btn ${gaugeModule.value_bold ? 'active' : ''}"
                      @click=${() => updateModule({ value_bold: !gaugeModule.value_bold })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.value_bold
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.value_bold
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Bold"
                    >
                      <ha-icon icon="mdi:format-bold"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.value_italic ? 'active' : ''}"
                      @click=${() => updateModule({ value_italic: !gaugeModule.value_italic })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.value_italic
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.value_italic
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Italic"
                    >
                      <ha-icon icon="mdi:format-italic"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.value_underline ? 'active' : ''}"
                      @click=${() =>
                        updateModule({ value_underline: !gaugeModule.value_underline })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.value_underline
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.value_underline
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Underline"
                    >
                      <ha-icon icon="mdi:format-underline"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.value_uppercase ? 'active' : ''}"
                      @click=${() =>
                        updateModule({ value_uppercase: !gaugeModule.value_uppercase })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.value_uppercase
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.value_uppercase
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Uppercase"
                    >
                      <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.value_strikethrough ? 'active' : ''}"
                      @click=${() =>
                        updateModule({
                          value_strikethrough: !gaugeModule.value_strikethrough,
                        })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.value_strikethrough
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.value_strikethrough
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Strikethrough"
                    >
                      <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                    </button>
                  </div>
                </div>

                ${FormUtils.renderField(
                  'Value Format',
                  'Optional format string (e.g., "%.1f°C", "%.0f%%").',
                  hass,
                  { value_format: gaugeModule.value_format || '' },
                  [FormUtils.createSchemaItem('value_format', { text: {} })],
                  (e: CustomEvent) => updateModule({ value_format: e.detail.value.value_format })
                )}

                <div class="field-container" style="margin-bottom: 24px; margin-top: 16px;">
                  <div class="field-title">Value X Offset</div>
                  <div class="field-description">
                    Horizontal offset for value positioning (-50 to 50).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { value_x_offset: gaugeModule.value_x_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('value_x_offset', {
                        number: { mode: 'box', min: -50, max: 50, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) => {
                      const value = e.detail.value.value_x_offset;
                      updateModule({ value_x_offset: value === '' ? undefined : Number(value) });
                    }
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Y Offset</div>
                  <div class="field-description">
                    Vertical offset for value positioning (-50 to 50).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { value_y_offset: gaugeModule.value_y_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('value_y_offset', {
                        number: { mode: 'box', min: -50, max: 50, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) => {
                      const value = e.detail.value.value_y_offset;
                      updateModule({ value_y_offset: value === '' ? undefined : Number(value) });
                    }
                  )}
                </div>
              </div>
            `
          : ''}

        <!-- Name Display -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Show Name</div>
          <ha-switch
            .checked=${showName}
            @change=${(e: Event) =>
              updateModule({ show_name: (e.target as HTMLInputElement).checked })}
          ></ha-switch>
        </div>

        ${showName
          ? html`
              <div class="conditional-fields-group" style="margin-bottom: 16px;">
                <div class="field-group" style="margin-bottom: 24px;">
                  <div class="field-title">Name Position</div>
                  <div class="field-description">Where to display the name/label.</div>
                  ${this.renderUcForm(
                    hass,
                    { name_position: gaugeModule.name_position || 'top' },
                    [
                      this.selectField('name_position', [
                        { value: 'top', label: 'Top' },
                        { value: 'bottom', label: 'Bottom' },
                        { value: 'none', label: 'None' },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.name_position;
                      const prev = gaugeModule.name_position || 'top';
                      if (next === prev) return;
                      updateModule({ name_position: next });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                    false
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Font Size</div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { name_font_size: gaugeModule.name_font_size ?? 16 },
                    [
                      FormUtils.createSchemaItem('name_font_size', {
                        number: { mode: 'box', min: 8, max: 32, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) => {
                      const value = e.detail.value.name_font_size;
                      updateModule({ name_font_size: value === '' ? undefined : Number(value) });
                    }
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${gaugeModule.name_color || ''}
                    .defaultValue=${'var(--secondary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ name_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Text Formatting</div>
                  <div class="field-description">Apply formatting styles to the name text.</div>
                  <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button
                      class="format-btn ${gaugeModule.name_bold ? 'active' : ''}"
                      @click=${() => updateModule({ name_bold: !gaugeModule.name_bold })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.name_bold
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.name_bold
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Bold"
                    >
                      <ha-icon icon="mdi:format-bold"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.name_italic ? 'active' : ''}"
                      @click=${() => updateModule({ name_italic: !gaugeModule.name_italic })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.name_italic
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.name_italic
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Italic"
                    >
                      <ha-icon icon="mdi:format-italic"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.name_underline ? 'active' : ''}"
                      @click=${() => updateModule({ name_underline: !gaugeModule.name_underline })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.name_underline
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.name_underline
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Underline"
                    >
                      <ha-icon icon="mdi:format-underline"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.name_uppercase ? 'active' : ''}"
                      @click=${() => updateModule({ name_uppercase: !gaugeModule.name_uppercase })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.name_uppercase
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.name_uppercase
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Uppercase"
                    >
                      <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${gaugeModule.name_strikethrough ? 'active' : ''}"
                      @click=${() =>
                        updateModule({
                          name_strikethrough: !gaugeModule.name_strikethrough,
                        })}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${gaugeModule.name_strikethrough
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${gaugeModule.name_strikethrough
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Strikethrough"
                    >
                      <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                    </button>
                  </div>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name X Offset</div>
                  <div class="field-description">
                    Horizontal offset for name positioning (-50 to 50).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { name_x_offset: gaugeModule.name_x_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('name_x_offset', {
                        number: { mode: 'box', min: -50, max: 50, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) => {
                      const value = e.detail.value.name_x_offset;
                      updateModule({ name_x_offset: value === '' ? undefined : Number(value) });
                    }
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Y Offset</div>
                  <div class="field-description">
                    Vertical offset for name positioning (-50 to 50).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { name_y_offset: gaugeModule.name_y_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('name_y_offset', {
                        number: { mode: 'box', min: -50, max: 50, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) => {
                      const value = e.detail.value.name_y_offset;
                      updateModule({ name_y_offset: value === '' ? undefined : Number(value) });
                    }
                  )}
                </div>
              </div>
            `
          : ''}

        <!-- Min/Max Display -->
        ${!gaugeModule.show_tick_labels
          ? html`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">Show Min/Max Values</div>
                <div class="field-description">
                  Display minimum and maximum values on the gauge.
                </div>
                ${FormUtils.renderCleanForm(
                  hass,
                  { show_min_max: showMinMax },
                  [FormUtils.createSchemaItem('show_min_max', { boolean: {} })],
                  (e: CustomEvent) => updateModule({ show_min_max: e.detail.value.show_min_max })
                )}
              </div>
            `
          : html`
              <div class="field-container" style="margin-bottom: 16px; opacity: 0.5;">
                <div class="field-title">Show Min/Max Values</div>
                <div class="field-description" style="color: var(--warning-color);">
                  Min/Max values are automatically hidden when tick labels are enabled to avoid
                  visual clutter.
                </div>
              </div>
            `}
        ${showMinMax
          ? html`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Min/Max Font Size</div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { min_max_font_size: gaugeModule.min_max_font_size ?? 12 },
                    [
                      FormUtils.createSchemaItem('min_max_font_size', {
                        number: { mode: 'box', min: 8, max: 20, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) =>
                      updateModule({ min_max_font_size: e.detail.value.min_max_font_size })
                  )}
                </div>

                <div class="field-container">
                  <div class="field-title">Min/Max Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${gaugeModule.min_max_color || ''}
                    .defaultValue=${'var(--secondary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ min_max_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderTicksConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const showTicks = gaugeModule.show_ticks !== false;
    const showTickLabels = gaugeModule.show_tick_labels || false;

    return html`
      <div class="settings-section">
        <div class="section-title">TICK MARKS</div>

        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Show Tick Marks</div>
          <ha-switch
            .checked=${showTicks}
            @change=${(e: Event) =>
              updateModule({ show_ticks: (e.target as HTMLInputElement).checked })}
          ></ha-switch>
        </div>

        ${showTicks
          ? html`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Tick Count</div>
                  <div class="field-description">Number of major tick marks.</div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { tick_count: gaugeModule.tick_count ?? 10 },
                    [
                      FormUtils.createSchemaItem('tick_count', {
                        number: { mode: 'box', min: 2, max: 50, step: 1 },
                      }),
                    ],
                    (e: CustomEvent) => {
                      const value = e.detail.value.tick_count;
                      updateModule({ tick_count: value === '' ? undefined : Number(value) });
                    }
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Tick Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${gaugeModule.tick_color || ''}
                    .defaultValue=${'var(--divider-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ tick_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Show Tick Labels</div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { show_tick_labels: showTickLabels },
                    [FormUtils.createSchemaItem('show_tick_labels', { boolean: {} })],
                    (e: CustomEvent) =>
                      updateModule({ show_tick_labels: e.detail.value.show_tick_labels })
                  )}
                </div>

                ${showTickLabels
                  ? html`
                      <div class="field-container">
                        <div class="field-title">Tick Label Font Size</div>
                        ${FormUtils.renderCleanForm(
                          hass,
                          { tick_label_font_size: gaugeModule.tick_label_font_size ?? 10 },
                          [
                            FormUtils.createSchemaItem('tick_label_font_size', {
                              number: { mode: 'box', min: 6, max: 16, step: 1 },
                            }),
                          ],
                          (e: CustomEvent) => {
                            const value = e.detail.value.tick_label_font_size;
                            updateModule({
                              tick_label_font_size: value === '' ? undefined : Number(value),
                            });
                          }
                        )}
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderAnimationConfiguration(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const animationEnabled = gaugeModule.animation_enabled !== false;

    return html`
      <div class="settings-section">
        <div class="section-title">ANIMATION</div>

        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Enable Animation</div>
          <ha-switch
            .checked=${animationEnabled}
            @change=${(e: Event) =>
              updateModule({ animation_enabled: (e.target as HTMLInputElement).checked })}
          ></ha-switch>
        </div>
        <div class="field-description" style="margin-bottom: 16px;">
          Animate gauge changes smoothly.
        </div>

        ${animationEnabled
          ? html`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Animation Duration</div>
                  <div class="field-description">
                    Duration in milliseconds (e.g., "1000ms", "1s").
                  </div>
                  ${FormUtils.renderField(
                    '',
                    '',
                    hass,
                    { animation_duration: gaugeModule.animation_duration || '1000ms' },
                    [FormUtils.createSchemaItem('animation_duration', { text: {} })],
                    (e: CustomEvent) => {
                      const value = e.detail.value.animation_duration;
                      updateModule({ animation_duration: value === '' ? undefined : value });
                    }
                  )}
                </div>

                <div class="field-group">
                  <div class="field-title">Animation Easing</div>
                  <div class="field-description">Easing function for the animation.</div>
                  ${this.renderUcForm(
                    hass,
                    { animation_easing: gaugeModule.animation_easing || 'ease-out' },
                    [
                      this.selectField('animation_easing', [
                        { value: 'linear', label: 'Linear' },
                        { value: 'ease-in', label: 'Ease In' },
                        { value: 'ease-out', label: 'Ease Out' },
                        { value: 'ease-in-out', label: 'Ease In-Out' },
                        { value: 'bounce', label: 'Bounce' },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.animation_easing;
                      const prev = gaugeModule.animation_easing || 'ease-out';
                      if (next === prev) return;
                      updateModule({ animation_easing: next });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                    false
                  )}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as GaugeModule, hass, updates => updateModule(updates));
  }

  // Split preview for module settings popup - delegate to layout tab's wrapper
  renderSplitPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    // Just render the module content - let the layout tab handle card container styling
    return this.renderPreview(module, hass);
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const gaugeModule = module as GaugeModule;

    // GRACEFUL RENDERING: Check for incomplete configuration
    if (!gaugeModule.entity || gaugeModule.entity.trim() === '') {
      return this.renderGradientErrorState(
        'Select Entity',
        'Choose an entity in the General tab',
        'mdi:gauge-empty'
      );
    }

    const value = this.calculateGaugeValue(gaugeModule, hass);
    const displayName = this.getDisplayName(gaugeModule, hass);

    return html`
      <div class="uc-gauge-container" style="${this.getContainerStyles(gaugeModule)}">
        ${gaugeModule.show_name && gaugeModule.name_position === 'top'
          ? html`
              <div class="uc-gauge-name" style="${this.getNameStyles(gaugeModule)}">
                ${displayName}
              </div>
            `
          : ''}

        <div
          class="uc-gauge-wrapper"
          style="position: relative; display: inline-block; overflow: hidden;"
        >
          ${gaugeModule.show_value && gaugeModule.value_position === 'top'
            ? html`
                <div class="uc-gauge-value-top" style="${this.getValueStyles(gaugeModule)}">
                  ${this.formatValue(value, gaugeModule)}
                </div>
              `
            : ''}
          <svg
            class="uc-gauge-svg"
            viewBox="0 0 ${gaugeModule.gauge_size} ${gaugeModule.gauge_size}"
            width="${gaugeModule.gauge_size}"
            height="${gaugeModule.gauge_size}"
            style="overflow: hidden;"
          >
            ${this.renderGaugeByStyle(gaugeModule, value, hass)}
          </svg>

          ${gaugeModule.show_value && gaugeModule.value_position === 'center'
            ? html`
                <div class="uc-gauge-value-center" style="${this.getValueStyles(gaugeModule)}">
                  ${this.formatValue(value, gaugeModule)}
                </div>
              `
            : ''}
          ${gaugeModule.show_value && gaugeModule.value_position === 'bottom'
            ? html`
                <div class="uc-gauge-value-bottom" style="${this.getValueStyles(gaugeModule)}">
                  ${this.formatValue(value, gaugeModule)}
                </div>
              `
            : ''}
        </div>
        ${gaugeModule.show_name && gaugeModule.name_position === 'bottom'
          ? html`
              <div class="uc-gauge-name" style="${this.getNameStyles(gaugeModule)}">
                ${displayName}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private calculateGaugeValue(gaugeModule: GaugeModule, hass: HomeAssistant): number {
    const valueType = gaugeModule.value_type || 'entity';

    if (valueType === 'entity') {
      const entityState = hass.states[gaugeModule.entity];
      if (!entityState) return gaugeModule.min_value || 0;
      return parseFloat(entityState.state) || 0;
    }

    if (
      valueType === 'attribute' &&
      gaugeModule.value_attribute_entity &&
      gaugeModule.value_attribute_name
    ) {
      const entityState = hass.states[gaugeModule.value_attribute_entity];
      if (!entityState) return gaugeModule.min_value || 0;
      const attrValue = entityState.attributes[gaugeModule.value_attribute_name];
      return parseFloat(attrValue) || 0;
    }

    if (valueType === 'template' && gaugeModule.value_template) {
      // Template evaluation would go here
      // For now, return a default value
      return gaugeModule.min_value || 0;
    }

    return gaugeModule.min_value || 0;
  }

  private getDisplayName(gaugeModule: GaugeModule, hass: HomeAssistant): string {
    if (gaugeModule.name) return gaugeModule.name;
    const entityState = hass.states[gaugeModule.entity];
    return entityState?.attributes.friendly_name || gaugeModule.entity;
  }

  private formatValue(value: number, gaugeModule: GaugeModule): string {
    if (gaugeModule.value_format) {
      // Simple format support (can be enhanced)
      return gaugeModule.value_format
        .replace(/%.(\d*)f/, (match, decimals) => {
          const dec = decimals ? parseInt(decimals) : 0;
          return value.toFixed(dec);
        })
        .replace(/%%/, '%');
    }
    return value.toString();
  }

  private renderGaugeByStyle(
    gaugeModule: GaugeModule,
    value: number,
    hass: HomeAssistant
  ): TemplateResult {
    const style = gaugeModule.gauge_style || 'modern';

    switch (style) {
      case 'speedometer':
        return this.renderSpeedometerGauge(gaugeModule, value);
      case 'arc':
        return this.renderArcGauge(gaugeModule, value);
      case 'radial':
        return this.renderRadialGauge(gaugeModule, value);
      case 'lines':
        return this.renderLinesGauge(gaugeModule, value);
      case 'block':
        return this.renderBlockGauge(gaugeModule, value);
      case 'minimal':
        return this.renderMinimalGauge(gaugeModule, value);
      case 'inset':
        return this.renderInsetGauge(gaugeModule, value);
      case '3d':
        return this.render3DGauge(gaugeModule, value);
      case 'neon':
        return this.renderNeonGauge(gaugeModule, value);
      case 'digital':
        return this.renderDigitalGauge(gaugeModule, value);
      case 'basic':
        return this.renderBasicGauge(gaugeModule, value);
      case 'modern':
      default:
        return this.renderModernGauge(gaugeModule, value);
    }
  }

  private renderModernGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Arc goes from -120° to +120° (240° total)
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const backgroundArc = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const valueArc = this.describeArc(centerX, centerY, radius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <!-- Background arc -->
      <path
        d="${backgroundArc}"
        fill="none"
        stroke="${gaugeModule.gauge_background_color || 'var(--disabled-text-color)'}"
        stroke-width="${thickness}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? this.renderSegmentedArcs(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              value,
              true // Use rounded ends for Modern gauge
            )
          : gaugeModule.gauge_color_mode === 'gradient'
            ? this.renderGradientValueArc(
                gaugeModule,
                valueArc,
                thickness,
                clampedPercentage,
                'round',
                `transition: stroke-dashoffset ${
                  gaugeModule.animation_enabled !== false
                    ? gaugeModule.animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.animation_easing || 'ease-out'};`,
                backgroundArc,
                centerX,
                centerY,
                startAngle,
                valueAngle
              )
            : svg`
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="round"
                style="transition: stroke-dashoffset ${
                  gaugeModule.animation_enabled !== false
                    ? gaugeModule.animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.animation_easing || 'ease-out'};"
              />
            `
      }

      <!-- Tick marks -->
      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness
            )
          : ''
      }

      <!-- Pointer -->
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }

      <!-- Min/Max labels -->
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private renderBasicGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Basic: Simple arc without rounded ends
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const backgroundArc = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const valueArc = this.describeArc(centerX, centerY, radius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <!-- Background arc -->
      <path
        d="${backgroundArc}"
        fill="none"
        stroke="${gaugeModule.gauge_background_color || 'var(--disabled-text-color)'}"
        stroke-width="${thickness}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? this.renderSegmentedArcs(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              value
            )
          : gaugeModule.gauge_color_mode === 'gradient'
            ? this.renderGradientValueArc(
                gaugeModule,
                valueArc,
                thickness,
                clampedPercentage,
                'butt',
                undefined,
                backgroundArc,
                centerX,
                centerY,
                startAngle,
                valueAngle
              )
            : svg`
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
              />
            `
      }

      <!-- Tick marks -->
      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness
            )
          : ''
      }

      <!-- Pointer -->
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }

      <!-- Min/Max labels -->
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private renderSpeedometerGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Speedometer goes from -225° to +45° (270° total, like a car speedometer)
    const startAngle = -225;
    const endAngle = 45;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const backgroundArc = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const valueArc = this.describeArc(centerX, centerY, radius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle)}
      
      <!-- Background arc -->
      <path
        d="${backgroundArc}"
        fill="none"
        stroke="${gaugeModule.gauge_background_color || 'var(--disabled-text-color)'}"
        stroke-width="${thickness}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? this.renderSegmentedArcs(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              value
            )
          : gaugeModule.gauge_color_mode === 'gradient'
            ? this.renderGradientValueArc(
                gaugeModule,
                valueArc,
                thickness,
                clampedPercentage,
                'butt',
                undefined,
                backgroundArc,
                centerX,
                centerY,
                startAngle,
                valueAngle
              )
            : svg`
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
              />
            `
      }

      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness
            )
          : ''
      }
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private renderArcGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Arc style: semi-circle from -180° to 0°
    const startAngle = -180;
    const endAngle = 0;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const backgroundArc = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const valueArc = this.describeArc(centerX, centerY, radius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <!-- Background arc -->
      <path
        d="${backgroundArc}"
        fill="none"
        stroke="${gaugeModule.gauge_background_color || 'var(--disabled-text-color)'}"
        stroke-width="${thickness}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? this.renderSegmentedArcs(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              value
            )
          : gaugeModule.gauge_color_mode === 'gradient'
            ? this.renderGradientValueArc(
                gaugeModule,
                valueArc,
                thickness,
                clampedPercentage,
                'butt',
                undefined,
                backgroundArc,
                centerX,
                centerY,
                startAngle,
                valueAngle
              )
            : svg`
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
              />
            `
      }

      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness
            )
          : ''
      }
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private renderRadialGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Full circle from -90° to 270°
    const startAngle = -90;
    const endAngle = 270;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const backgroundArc = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const valueArc = this.describeArc(centerX, centerY, radius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <!-- Background circle -->
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius}"
        fill="none"
        stroke="${gaugeModule.gauge_background_color || 'var(--disabled-text-color)'}"
        stroke-width="${thickness}"
      />

      <!-- Value arc -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? this.renderSegmentedArcs(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              value
            )
          : gaugeModule.gauge_color_mode === 'gradient'
            ? this.renderGradientValueArc(
                gaugeModule,
                valueArc,
                thickness,
                clampedPercentage,
                'butt',
                undefined,
                backgroundArc,
                centerX,
                centerY,
                startAngle,
                valueAngle
              )
            : svg`
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
              />
            `
      }

      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }
    `;
  }

  private renderLinesGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;

    const lineCount = gaugeModule.tick_count || 20;
    const lines = [];

    for (let i = 0; i <= lineCount; i++) {
      const angle = startAngle + (angleRange * i) / lineCount;
      const linePercentage = (i / lineCount) * 100;

      let color: string;
      if (gaugeModule.gauge_color_mode === 'segments') {
        // For segments mode, always show the segment color regardless of current value
        color = this.getColorAtValue(gaugeModule, linePercentage);
      } else {
        // For gradient/solid modes, only show active lines
        const isActive = linePercentage <= clampedPercentage;
        if (isActive) {
          color = this.getColorAtValue(gaugeModule, linePercentage);
        } else {
          color = gaugeModule.gauge_background_color || 'var(--disabled-text-color)';
        }
      }

      const innerRadius = radius - 15;
      const outerRadius = radius;

      const startPoint = this.polarToCartesian(centerX, centerY, innerRadius, angle);
      const endPoint = this.polarToCartesian(centerX, centerY, outerRadius, angle);

      lines.push(svg`
        <line
          x1="${startPoint.x}"
          y1="${startPoint.y}"
          x2="${endPoint.x}"
          y2="${endPoint.y}"
          stroke="${color}"
          stroke-width="3"
          stroke-linecap="round"
        />
      `);
    }

    return svg`
      ${lines}
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(
              gaugeModule,
              centerX,
              centerY,
              radius - 15,
              startAngle + (angleRange * clampedPercentage) / 100
            )
          : ''
      }
    `;
  }

  private renderBlockGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const thickness = gaugeModule.gauge_thickness || 20;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;

    const blockCount = gaugeModule.tick_count || 12;
    const blockAngle = angleRange / blockCount;
    const gapAngle = 2; // Gap between blocks
    const blocks = [];

    for (let i = 0; i < blockCount; i++) {
      const blockStartAngle = startAngle + i * blockAngle;
      const blockEndAngle = blockStartAngle + blockAngle - gapAngle;
      const blockStartPercentage = (i / blockCount) * 100;
      const blockEndPercentage = ((i + 1) / blockCount) * 100;

      let color: string;
      if (gaugeModule.gauge_color_mode === 'segments') {
        // For segments mode, always show the segment color regardless of current value
        color = this.getColorAtValue(gaugeModule, blockEndPercentage);
      } else {
        // For gradient/solid modes, light up blocks if the pointer is within or past the block
        const isActive = clampedPercentage >= blockStartPercentage;
        if (isActive) {
          color = this.getColorAtValue(gaugeModule, blockEndPercentage);
        } else {
          color = gaugeModule.gauge_background_color || 'var(--disabled-text-color)';
        }
      }

      const arc = this.describeArc(centerX, centerY, radius, blockStartAngle, blockEndAngle);

      blocks.push(svg`
        <path
          d="${arc}"
          fill="none"
          stroke="${color}"
          stroke-width="${thickness}"
          stroke-linecap="butt"
        />
      `);
    }

    return svg`
      ${blocks}
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle + (angleRange * clampedPercentage) / 100
            )
          : ''
      }
    `;
  }

  private renderMinimalGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 8;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    const startAngle = -90;
    const endAngle = 270;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const circumference = 2 * Math.PI * radius;
    const valueLength = (clampedPercentage / 100) * circumference;

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius}"
        fill="none"
        stroke="${gaugeModule.gauge_background_color || 'var(--disabled-text-color)'}"
        stroke-width="${thickness}"
      />

      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? this.renderSegmentedCircle(
              gaugeModule,
              centerX,
              centerY,
              radius,
              thickness,
              value,
              true
            )
          : gaugeModule.gauge_color_mode === 'gradient'
            ? (() => {
                const gradientMode = gaugeModule.gradient_display_mode || 'full';
                const strokeColor = gradientMode === 'value-based' 
                  ? this.getColorAtValue(gaugeModule, clampedPercentage)
                  : `url(#gradient-${gaugeModule.id})`;
                return svg`
                  <circle
                    cx="${centerX}"
                    cy="${centerY}"
                    r="${radius}"
                    fill="none"
                    stroke="${strokeColor}"
                    stroke-width="${thickness}"
                    stroke-linecap="round"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference - valueLength}"
                    transform="rotate(-90 ${centerX} ${centerY})"
                  />
                `;
              })()
            : svg`
            <circle
              cx="${centerX}"
              cy="${centerY}"
              r="${radius}"
              fill="none"
              stroke="${color}"
              stroke-width="${thickness}"
              stroke-linecap="round"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference - valueLength}"
              transform="rotate(-90 ${centerX} ${centerY})"
            />
          `
      }
    `;
  }

  private renderInsetGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Inset: Double-wall effect with inner and outer arcs
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const outerRadius = radius + thickness / 4;
    const innerRadius = radius - thickness / 4;

    const outerBackgroundArc = this.describeArc(
      centerX,
      centerY,
      outerRadius,
      startAngle,
      endAngle
    );
    const innerBackgroundArc = this.describeArc(
      centerX,
      centerY,
      innerRadius,
      startAngle,
      endAngle
    );
    const outerValueArc = this.describeArc(centerX, centerY, outerRadius, startAngle, valueAngle);
    const innerValueArc = this.describeArc(centerX, centerY, innerRadius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);
    const backgroundColor = gaugeModule.gauge_background_color || 'var(--disabled-text-color)';

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, outerRadius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <defs>
        <filter id="inset-shadow-${gaugeModule.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feFlood flood-color="rgba(0,0,0,0.3)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="3d-separator-shadow-${gaugeModule.id}" x="-75%" y="-75%" width="250%" height="250%">
          <!-- CSS-like shadow: 0 0 6px 3px #000 for separator edge -->
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="spread" />
          <feGaussianBlur in="spread" stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- Outer background arc -->
      <path
        d="${outerBackgroundArc}"
        fill="none"
        stroke="${backgroundColor}"
        stroke-width="${thickness / 2}"
        stroke-linecap="butt"
        filter="url(#inset-shadow-${gaugeModule.id})"
      />
      
      <!-- Inner background arc -->
      <path
        d="${innerBackgroundArc}"
        fill="none"
        stroke="${backgroundColor}"
        stroke-width="${thickness / 2}"
        stroke-linecap="butt"
        opacity="0.7"
      />

      <!-- Value arcs -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? svg`
              ${this.renderSegmentedArcsWithInsetStyle(
                gaugeModule,
                centerX,
                centerY,
                outerRadius,
                startAngle,
                endAngle,
                thickness / 2,
                value
              )}
              ${this.renderSegmentedArcsWithInsetStyle(
                gaugeModule,
                centerX,
                centerY,
                innerRadius,
                startAngle,
                endAngle,
                thickness / 2,
                value
              )}
            `
          : gaugeModule.gauge_color_mode === 'gradient'
            ? (() => {
                const gradientMode = gaugeModule.gradient_display_mode || 'full';
                const strokeColor = gradientMode === 'value-based' 
                  ? this.getColorAtValue(gaugeModule, clampedPercentage)
                  : `url(#gradient-${gaugeModule.id})`;
                return svg`
                  <!-- Outer value arc -->
                  <path
                    d="${outerValueArc}"
                    fill="none"
                    stroke="${strokeColor}"
                    stroke-width="${thickness / 2}"
                    stroke-linecap="butt"
                  />
                  
                  <!-- Inner value arc -->
                  <path
                    d="${innerValueArc}"
                    fill="none"
                    stroke="${strokeColor}"
                    stroke-width="${thickness / 2}"
                    stroke-linecap="butt"
                    opacity="0.8"
                  />
                `;
              })()
            : svg`
              <!-- Outer value arc -->
              <path
                d="${outerValueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness / 2}"
                stroke-linecap="butt"
              />
              
              <!-- Inner value arc -->
              <path
                d="${innerValueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness / 2}"
                stroke-linecap="butt"
                opacity="0.8"
              />
            `
      }

      <!-- Tick marks -->
      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness
            )
          : ''
      }

      <!-- Pointer -->
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }

      <!-- Min/Max labels -->
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private render3DGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // 3D: Beveled effect with gradients and shadows
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const backgroundArc = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const valueArc = this.describeArc(centerX, centerY, radius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);
    const backgroundColor = gaugeModule.gauge_background_color || 'var(--disabled-text-color)';

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <defs>
        <linearGradient id="3d-gradient-${gaugeModule.id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.4" />
          <stop offset="50%" style="stop-color:rgb(255,255,255);stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.3" />
        </linearGradient>
        <filter id="3d-shadow-${gaugeModule.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feFlood flood-color="rgba(0,0,0,0.4)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="3d-box-shadow-${gaugeModule.id}" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="6" result="offsetblur" />
          <feFlood flood-color="rgba(0,0,0,0.5)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="3d-segment-shadow-${gaugeModule.id}" x="-75%" y="-75%" width="250%" height="250%">
          <!-- CSS-like shadow: 0 0 8px 4px #000 (no directional offset) -->
          <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="spread" />
          <feGaussianBlur in="spread" stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background arc with 3D effect -->
      <path
        d="${backgroundArc}"
        fill="none"
        stroke="${backgroundColor}"
        stroke-width="${thickness + 2}"
        stroke-linecap="butt"
        filter="url(#3d-shadow-${gaugeModule.id})"
      />
      
      <path
        d="${backgroundArc}"
        fill="none"
        stroke="url(#3d-gradient-${gaugeModule.id})"
        stroke-width="${thickness}"
        stroke-linecap="butt"
      />

      <!-- Value arc with 3D effect -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? this.renderSegmentedArcsWith3DStyle(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              value
            )
          : gaugeModule.gauge_color_mode === 'gradient'
            ? (() => {
                const gradientMode = gaugeModule.gradient_display_mode || 'full';
                const strokeColor = gradientMode === 'value-based' 
                  ? this.getColorAtValue(gaugeModule, clampedPercentage)
                  : `url(#gradient-${gaugeModule.id})`;
                return svg`
                  <path
                    d="${valueArc}"
                    fill="none"
                    stroke="${strokeColor}"
                    stroke-width="${thickness + 2}"
                    stroke-linecap="butt"
                    filter="url(#3d-shadow-${gaugeModule.id})"
                  />
                  <path
                    d="${valueArc}"
                    fill="none"
                    stroke="${strokeColor}"
                    stroke-width="${thickness}"
                    stroke-linecap="butt"
                  />
                `;
              })()
            : svg`
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness + 2}"
                stroke-linecap="butt"
                filter="url(#3d-shadow-${gaugeModule.id})"
              />
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
              />
            `
      }

      <!-- Tick marks -->
      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness
            )
          : ''
      }

      <!-- Pointer -->
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }

      <!-- Min/Max labels -->
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private renderNeonGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const thickness = gaugeModule.gauge_thickness || 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness - 10;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Neon: Glowing effect with dynamic color
    const startAngle = -120;
    const endAngle = 120;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    const backgroundArc = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const valueArc = this.describeArc(centerX, centerY, radius, startAngle, valueAngle);

    const color = this.getColorAtValue(gaugeModule, clampedPercentage);
    const backgroundColor = gaugeModule.gauge_background_color || 'var(--disabled-text-color)';

    // Get glow color - use the color at the end of the fill (like bar module)
    const getGlowColor = (): string => {
      const colorMode = gaugeModule.gauge_color_mode || 'gradient';

      if (
        colorMode === 'gradient' &&
        gaugeModule.gradient_stops &&
        gaugeModule.gradient_stops.length > 0
      ) {
        const gradientMode = gaugeModule.gradient_display_mode || 'full';

        if (gradientMode === 'value-based' || gradientMode === 'cropped') {
          // For value-based and cropped modes, use the color at the current percentage
          return this.getColorAtValue(gaugeModule, clampedPercentage);
        } else {
          // For full mode, use the last color (rightmost/last color)
          const sortedStops = [...gaugeModule.gradient_stops].sort(
            (a, b) => b.position - a.position
          );
          if (sortedStops.length > 0) {
            return sortedStops[0].color;
          }
        }
      } else if (colorMode === 'segments' && gaugeModule.segments) {
        // For segments, use the color at the current percentage
        return this.getColorAtValue(gaugeModule, clampedPercentage);
      }

      // Use the solid gauge color
      return gaugeModule.gauge_color || 'var(--primary-color)';
    };

    const glowColor = getGlowColor();

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <defs>
        <filter id="neon-glow-${gaugeModule.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="neon-background-${gaugeModule.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="softBlur"/>
          <feMerge> 
            <feMergeNode in="softBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="neon-glow-filter-${gaugeModule.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="featheredGlow"/>
          <feMerge> 
            <feMergeNode in="featheredGlow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="light-shine-filter-${gaugeModule.id}" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="softGlow"/>
          <feGaussianBlur stdDeviation="8" result="wideGlow"/>
          <feMerge> 
            <feMergeNode in="wideGlow"/>
            <feMergeNode in="softGlow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background arc with subtle glow -->
      <path
        d="${backgroundArc}"
        fill="none"
        stroke="${backgroundColor}"
        stroke-width="${thickness}"
        stroke-linecap="butt"
        filter="url(#neon-background-${gaugeModule.id})"
        opacity="0.4"
      />

      <!-- Value arc with neon glow effect -->
      ${
        gaugeModule.gauge_color_mode === 'segments'
          ? svg`
              <!-- Subtle glow behind entire filled section -->
              <path
                d="${valueArc}"
                fill="none"
                stroke="${glowColor}"
                stroke-width="${thickness * 1.5}"
                stroke-linecap="butt"
                opacity="0.3"
                filter="url(#neon-glow-${gaugeModule.id})"
              />
              
              ${this.renderSegmentedArcs(
                gaugeModule,
                centerX,
                centerY,
                radius,
                startAngle,
                endAngle,
                thickness,
                value
              )}
              ${this.renderNeonGlowAtEnd(
                gaugeModule,
                centerX,
                centerY,
                radius,
                startAngle,
                endAngle,
                thickness,
                value,
                glowColor
              )}
            `
          : gaugeModule.gauge_color_mode === 'gradient'
            ? (() => {
                const gradientMode = gaugeModule.gradient_display_mode || 'full';
                const strokeColor = gradientMode === 'value-based' 
                  ? this.getColorAtValue(gaugeModule, clampedPercentage)
                  : `url(#gradient-${gaugeModule.id})`;
                return svg`
              <!-- Subtle glow behind entire arc -->
              <path
                d="${valueArc}"
                fill="none"
                stroke="${glowColor}"
                stroke-width="${thickness * 1.5}"
                stroke-linecap="butt"
                opacity="0.3"
                filter="url(#neon-glow-${gaugeModule.id})"
              />
              
              <!-- Main gradient arc -->
              <path
                d="${valueArc}"
                fill="none"
                stroke="${strokeColor}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
                style="transition: stroke-dashoffset ${
                  gaugeModule.animation_enabled !== false
                    ? gaugeModule.animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.animation_easing || 'ease-out'};"
              />
              ${this.renderNeonGlowAtEnd(
                gaugeModule,
                centerX,
                centerY,
                radius,
                startAngle,
                endAngle,
                thickness,
                value,
                glowColor
              )}
            `;
              })()
            : svg`
              <!-- Subtle glow behind entire arc -->
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness * 1.5}"
                stroke-linecap="butt"
                opacity="0.3"
                filter="url(#neon-glow-${gaugeModule.id})"
              />
              
              <!-- Main solid color arc -->
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
                style="transition: stroke-dashoffset ${
                  gaugeModule.animation_enabled !== false
                    ? gaugeModule.animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.animation_easing || 'ease-out'};"
              />
              ${this.renderNeonGlowAtEnd(
                gaugeModule,
                centerX,
                centerY,
                radius,
                startAngle,
                endAngle,
                thickness,
                value,
                glowColor
              )}
            `
      }

      <!-- Tick marks -->
      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness
            )
          : ''
      }

      <!-- Pointer -->
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }

      <!-- Min/Max labels -->
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private renderDigitalGauge(gaugeModule: GaugeModule, value: number): TemplateResult {
    const size = gaugeModule.gauge_size || 200;
    const centerX = size / 2;
    const centerY = size / 2; // Center properly for horizontal semi-circle
    const radius = size / 2 - 30;

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Horizontal semi-circle from -90° to 90° (180° total)
    const startAngle = -90;
    const endAngle = 90;
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    // Create small to large blocks structure with narrow widths and more spacing
    const blockCount = 12; // Number of blocks
    const blocks = [];

    for (let i = 0; i < blockCount; i++) {
      const blockAngle = startAngle + (angleRange * i) / blockCount;
      const nextBlockAngle = startAngle + (angleRange * (i + 1)) / blockCount;
      const blockStartPercentage = (i / blockCount) * 100;
      const blockEndPercentage = ((i + 1) / blockCount) * 100;

      // Block size increases from small to large (height/thickness)
      const blockSizeRatio = (i + 1) / blockCount;
      const minBlockSize = 6;
      const maxBlockSize = 18;
      const blockSize = minBlockSize + (maxBlockSize - minBlockSize) * blockSizeRatio;

      // Block position - center of the segment
      const blockRadius = radius - blockSize / 2;
      const segmentCenterAngle = (blockAngle + nextBlockAngle) / 2;
      const blockCenterPoint = this.polarToCartesian(
        centerX,
        centerY,
        blockRadius,
        segmentCenterAngle
      );

      // Calculate block width as a fraction of the available arc space (much narrower)
      const blockStartPoint = this.polarToCartesian(centerX, centerY, blockRadius, blockAngle);
      const blockEndPoint = this.polarToCartesian(centerX, centerY, blockRadius, nextBlockAngle);
      const maxBlockLength = Math.sqrt(
        Math.pow(blockEndPoint.x - blockStartPoint.x, 2) +
          Math.pow(blockEndPoint.y - blockStartPoint.y, 2)
      );

      // Make blocks only 30% of the available width to create more spacing
      const blockLength = maxBlockLength * 0.3;

      const blockCenterX = blockCenterPoint.x;
      const blockCenterY = blockCenterPoint.y;
      const blockRotation = segmentCenterAngle;

      let blockColor: string;
      if (gaugeModule.gauge_color_mode === 'segments') {
        // For segments mode, always show the segment color regardless of current value
        blockColor = this.getColorAtValue(gaugeModule, blockEndPercentage);
      } else {
        // For gradient/solid modes, light up blocks if the pointer is within or past the block
        const isActive = clampedPercentage >= blockStartPercentage;
        if (isActive) {
          blockColor = this.getColorAtValue(gaugeModule, blockEndPercentage);
        } else {
          blockColor = gaugeModule.gauge_background_color || 'var(--disabled-text-color)';
        }
      }

      blocks.push(svg`
        <rect
          x="${blockCenterX - blockLength / 2}"
          y="${blockCenterY - blockSize / 2}"
          width="${blockLength}"
          height="${blockSize}"
          fill="${blockColor}"
          transform="rotate(${blockRotation} ${blockCenterX} ${blockCenterY})"
          rx="2"
        />
      `);
    }

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage)}
      
      <!-- Digital blocks -->
      ${blocks}

      <!-- Tick marks -->
      ${
        gaugeModule.show_ticks !== false
          ? this.renderTickMarks(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }

      <!-- Pointer -->
      ${
        gaugeModule.pointer_enabled !== false
          ? this.renderPointer(gaugeModule, centerX, centerY, radius, valueAngle)
          : ''
      }

      <!-- Min/Max labels -->
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle)
          : ''
      }
    `;
  }

  private renderTickMarks(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    thickness?: number
  ): TemplateResult {
    const tickCount = gaugeModule.tick_count || 10;
    const angleRange = endAngle - startAngle;
    const ticks = [];

    for (let i = 0; i <= tickCount; i++) {
      const angle = startAngle + (angleRange * i) / tickCount;
      const t = thickness || gaugeModule.gauge_thickness || 15;
      const innerRadius = radius - t / 2 + 2; // Add 2px padding from inner edge
      const outerRadius = radius + t / 2 - 2; // Add 2px padding from outer edge

      const startPoint = this.polarToCartesian(centerX, centerY, innerRadius, angle);
      const endPoint = this.polarToCartesian(centerX, centerY, outerRadius, angle);

      ticks.push(svg`
        <line
          x1="${startPoint.x}"
          y1="${startPoint.y}"
          x2="${endPoint.x}"
          y2="${endPoint.y}"
          stroke="${gaugeModule.tick_color || 'var(--divider-color)'}"
          stroke-width="2"
          stroke-linecap="round"
        />
      `);

      if (gaugeModule.show_tick_labels) {
        const labelRadius = outerRadius + 14;
        const labelPoint = this.polarToCartesian(centerX, centerY, labelRadius, angle);
        const minValue = gaugeModule.min_value || 0;
        const maxValue = gaugeModule.max_value || 100;
        const value = Math.round(minValue + ((maxValue - minValue) * i) / tickCount);
        const fontSize = gaugeModule.tick_label_font_size || 10;
        ticks.push(
          svg`<text x="${labelPoint.x}" y="${labelPoint.y}" fill="${gaugeModule.min_max_color || 'var(--secondary-text-color)'}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${value}</text>`
        );
      }
    }

    return svg`${ticks}`;
  }

  private renderPointer(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    angle: number
  ): TemplateResult {
    const pointerStyle = gaugeModule.pointer_style || 'needle';
    const pointerLength = ((gaugeModule.pointer_length || 80) / 100) * radius;
    const pointerWidth = gaugeModule.pointer_width || 4;
    const pointerColor = gaugeModule.pointer_color || 'var(--primary-color)';

    const endPoint = this.polarToCartesian(centerX, centerY, pointerLength, angle);

    if (pointerStyle === 'needle') {
      // Triangle pointer
      const baseWidth = pointerWidth * 2;
      const leftAngle = angle - 90;
      const rightAngle = angle + 90;

      const leftBase = this.polarToCartesian(centerX, centerY, baseWidth / 2, leftAngle);
      const rightBase = this.polarToCartesian(centerX, centerY, baseWidth / 2, rightAngle);

      return svg`
        <polygon
          points="${leftBase.x},${leftBase.y} ${rightBase.x},${rightBase.y} ${endPoint.x},${endPoint.y}"
          fill="${pointerColor}"
        />
        <circle cx="${centerX}" cy="${centerY}" r="${baseWidth}" fill="${pointerColor}" />
      `;
    }

    if (pointerStyle === 'triangle') {
      const baseWidth = pointerWidth * 3;
      const leftAngle = angle - 90;
      const rightAngle = angle + 90;

      const leftBase = this.polarToCartesian(centerX, centerY, baseWidth, leftAngle);
      const rightBase = this.polarToCartesian(centerX, centerY, baseWidth, rightAngle);

      return svg`
        <polygon
          points="${leftBase.x},${leftBase.y} ${rightBase.x},${rightBase.y} ${endPoint.x},${endPoint.y}"
          fill="${pointerColor}"
        />
      `;
    }

    if (pointerStyle === 'arrow') {
      const arrowWidth = pointerWidth * 2;
      const arrowLength = pointerLength * 0.2;

      const leftArrow = this.polarToCartesian(endPoint.x, endPoint.y, arrowLength, angle - 150);
      const rightArrow = this.polarToCartesian(endPoint.x, endPoint.y, arrowLength, angle + 150);

      return svg`
        <line
          x1="${centerX}"
          y1="${centerY}"
          x2="${endPoint.x}"
          y2="${endPoint.y}"
          stroke="${pointerColor}"
          stroke-width="${pointerWidth}"
          stroke-linecap="round"
        />
        <line
          x1="${endPoint.x}"
          y1="${endPoint.y}"
          x2="${leftArrow.x}"
          y2="${leftArrow.y}"
          stroke="${pointerColor}"
          stroke-width="${pointerWidth}"
          stroke-linecap="round"
        />
        <line
          x1="${endPoint.x}"
          y1="${endPoint.y}"
          x2="${rightArrow.x}"
          y2="${rightArrow.y}"
          stroke="${pointerColor}"
          stroke-width="${pointerWidth}"
          stroke-linecap="round"
        />
      `;
    }

    if (pointerStyle === 'circle') {
      return svg`
        <line
          x1="${centerX}"
          y1="${centerY}"
          x2="${endPoint.x}"
          y2="${endPoint.y}"
          stroke="${pointerColor}"
          stroke-width="${pointerWidth / 2}"
          stroke-linecap="round"
        />
        <circle
          cx="${endPoint.x}"
          cy="${endPoint.y}"
          r="${pointerWidth * 2}"
          fill="${pointerColor}"
        />
      `;
    }

    if (pointerStyle === 'highlight') {
      // A short arc segment on the track itself
      const thickness = gaugeModule.gauge_thickness || 15;
      const highlightAngle = 6; // degrees
      const start = angle - highlightAngle / 2;
      const end = angle + highlightAngle / 2;
      const arc = this.describeArc(centerX, centerY, radius, start, end);
      const highlightPoint = this.polarToCartesian(centerX, centerY, radius, angle);

      return svg`
        <path d="${arc}" fill="none" stroke="${pointerColor}" stroke-width="${thickness}" stroke-linecap="round" />
      `;
    }

    if (pointerStyle === 'cap') {
      // A rounded cap at the end of the value arc sitting on the track
      const thickness = gaugeModule.gauge_thickness || 15;
      const capPoint = this.polarToCartesian(centerX, centerY, radius, angle);

      return svg`
        <circle cx="${capPoint.x}" cy="${capPoint.y}" r="${thickness / 2}" fill="${pointerColor}" />
      `;
    }

    // Default: line pointer
    return svg`
      <line
        x1="${centerX}"
        y1="${centerY}"
        x2="${endPoint.x}"
        y2="${endPoint.y}"
        stroke="${pointerColor}"
        stroke-width="${pointerWidth}"
        stroke-linecap="round"
      />
    `;
  }

  private renderMinMaxLabels(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): TemplateResult {
    const labelRadius = radius + 20;
    const minPoint = this.polarToCartesian(centerX, centerY, labelRadius, startAngle);
    const maxPoint = this.polarToCartesian(centerX, centerY, labelRadius, endAngle);

    const fontSize = gaugeModule.min_max_font_size || 12;
    const color = gaugeModule.min_max_color || 'var(--secondary-text-color)';

    return svg`
      <text
        x="${minPoint.x}"
        y="${minPoint.y}"
        fill="${color}"
        font-size="${fontSize}"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${gaugeModule.min_value || 0}
      </text>
      <text
        x="${maxPoint.x}"
        y="${maxPoint.y}"
        fill="${color}"
        font-size="${fontSize}"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${gaugeModule.max_value || 100}
      </text>
    `;
  }

  private getColorAtValue(gaugeModule: GaugeModule, percentage: number): string {
    const colorMode = gaugeModule.gauge_color_mode || 'gradient';

    if (colorMode === 'solid') {
      return gaugeModule.gauge_color || 'var(--primary-color)';
    }

    if (colorMode === 'segments' && gaugeModule.segments && gaugeModule.segments.length > 0) {
      const minValue = gaugeModule.min_value || 0;
      const maxValue = gaugeModule.max_value || 100;
      const value = minValue + ((maxValue - minValue) * percentage) / 100;

      for (const segment of gaugeModule.segments) {
        if (value >= segment.from && value <= segment.to) {
          return segment.color;
        }
      }
    }

    if (
      colorMode === 'gradient' &&
      gaugeModule.gradient_stops &&
      gaugeModule.gradient_stops.length > 0
    ) {
      const stops = [...gaugeModule.gradient_stops].sort((a, b) => a.position - b.position);

      if (percentage <= stops[0].position) return stops[0].color;
      if (percentage >= stops[stops.length - 1].position) return stops[stops.length - 1].color;

      for (let i = 0; i < stops.length - 1; i++) {
        const stop1 = stops[i];
        const stop2 = stops[i + 1];

        if (percentage >= stop1.position && percentage <= stop2.position) {
          const range = stop2.position - stop1.position;
          const factor = (percentage - stop1.position) / range;
          return this.interpolateColor(stop1.color, stop2.color, factor);
        }
      }
    }

    return gaugeModule.gauge_color || 'var(--primary-color)';
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    if (!c1 || !c2) return color1;

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return this.rgbToHex(r, g, b);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Handle CSS variables by returning a default
    if (hex.startsWith('var(') || hex.startsWith('rgb')) return null;

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  private renderSegmentedArcs(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    thickness: number,
    currentValue: number,
    useRoundedEnds: boolean = false
  ): TemplateResult {
    if (!gaugeModule.segments || gaugeModule.segments.length === 0) {
      return svg``;
    }

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const angleRange = endAngle - startAngle;
    const segments = [];

    // Sort segments by from value
    const sortedSegments = [...gaugeModule.segments].sort((a, b) => a.from - b.from);

    for (const segment of sortedSegments) {
      // Convert segment values to angles
      const segmentStartPercentage = ((segment.from - minValue) / (maxValue - minValue)) * 100;
      const segmentEndPercentage = ((segment.to - minValue) / (maxValue - minValue)) * 100;

      const segmentStartAngle = startAngle + (angleRange * segmentStartPercentage) / 100;
      const segmentEndAngle = startAngle + (angleRange * segmentEndPercentage) / 100;

      // Render the full segment (don't stop at current value)
      if (segmentEndAngle > segmentStartAngle) {
        const segmentArc = this.describeArc(
          centerX,
          centerY,
          radius,
          segmentStartAngle,
          segmentEndAngle
        );

        segments.push(svg`
          <path
            d="${segmentArc}"
            fill="none"
            stroke="${segment.color}"
            stroke-width="${thickness}"
            stroke-linecap="${useRoundedEnds ? 'round' : 'butt'}"
          />
        `);
      }
    }

    return svg`${segments}`;
  }

  private renderSegmentedArcsWithInsetStyle(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    thickness: number,
    currentValue: number
  ): TemplateResult {
    if (!gaugeModule.segments || gaugeModule.segments.length === 0) {
      return svg``;
    }

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const angleRange = endAngle - startAngle;
    const segments = [];

    // Sort segments by from value
    const sortedSegments = [...gaugeModule.segments].sort((a, b) => a.from - b.from);

    for (const segment of sortedSegments) {
      // Convert segment values to angles
      const segmentStartPercentage = ((segment.from - minValue) / (maxValue - minValue)) * 100;
      const segmentEndPercentage = ((segment.to - minValue) / (maxValue - minValue)) * 100;

      const segmentStartAngle = startAngle + (angleRange * segmentStartPercentage) / 100;
      const segmentEndAngle = startAngle + (angleRange * segmentEndPercentage) / 100;

      // Render the full segment (don't stop at current value)
      if (segmentEndAngle > segmentStartAngle) {
        const segmentArc = this.describeArc(
          centerX,
          centerY,
          radius,
          segmentStartAngle,
          segmentEndAngle
        );

        segments.push(svg`
          <!-- Shadow layer -->
          <path
            d="${segmentArc}"
            fill="none"
            stroke="${segment.color}"
            stroke-width="${thickness + 2}"
            stroke-linecap="butt"
            filter="url(#inset-shadow-${gaugeModule.id})"
          />
          <!-- Main segment -->
          <path
            d="${segmentArc}"
            fill="none"
            stroke="${segment.color}"
            stroke-width="${thickness}"
            stroke-linecap="butt"
          />
        `);
      }
    }

    return svg`${segments}`;
  }

  private renderSegmentedArcsWith3DStyle(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    thickness: number,
    currentValue: number
  ): TemplateResult {
    if (!gaugeModule.segments || gaugeModule.segments.length === 0) {
      return svg``;
    }

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const angleRange = endAngle - startAngle;
    const segments = [];

    // Sort segments by from value
    const sortedSegments = [...gaugeModule.segments].sort((a, b) => a.from - b.from);

    for (let i = 0; i < sortedSegments.length; i++) {
      const segment = sortedSegments[i];
      // Convert segment values to angles
      const segmentStartPercentage = ((segment.from - minValue) / (maxValue - minValue)) * 100;
      const segmentEndPercentage = ((segment.to - minValue) / (maxValue - minValue)) * 100;

      const segmentStartAngle = startAngle + (angleRange * segmentStartPercentage) / 100;
      const segmentEndAngle = startAngle + (angleRange * segmentEndPercentage) / 100;

      // Render segments without gaps for seamless appearance
      if (segmentEndAngle > segmentStartAngle) {
        const segmentArc = this.describeArc(
          centerX,
          centerY,
          radius,
          segmentStartAngle,
          segmentEndAngle
        );

        // 1) Draw a thin separator shadow just before the segment start to simulate elevation
        // This creates the perception that the current segment is floating above the previous one
        const separatorStart = Math.max(segmentStartAngle - 0.5, startAngle);
        const separatorArc = this.describeArc(
          centerX,
          centerY,
          radius,
          separatorStart,
          segmentStartAngle
        );

        segments.push(svg`
          <path
            d="${separatorArc}"
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            stroke-width="${thickness}"
            stroke-linecap="butt"
            filter="url(#3d-separator-shadow-${gaugeModule.id})"
          />
          <!-- Main segment with its own shadow for depth -->
          <path
            d="${segmentArc}"
            fill="none"
            stroke="${segment.color}"
            stroke-width="${thickness}"
            stroke-linecap="butt"
            filter="url(#3d-segment-shadow-${gaugeModule.id})"
          />
        `);
      }
    }

    return svg`${segments}`;
  }

  private renderNeonGlowAtEnd(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    thickness: number,
    value: number,
    color: string
  ): TemplateResult {
    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    if (clampedPercentage <= 0) {
      return svg``; // No glow if no fill
    }

    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (angleRange * clampedPercentage) / 100;

    // Calculate the endpoint of the arc
    const endPoint = this.polarToCartesian(centerX, centerY, radius, valueAngle);

    // Create unique gradient ID for this glow
    const glowGradientId = `neon-glow-radial-${gaugeModule.id}-${Date.now()}`;

    // Create smooth radial gradient for natural glow effect
    return svg`
      <defs>
        <radialGradient id="${glowGradientId}">
          <stop offset="0%" stop-color="${color}" stop-opacity="1" />
          <stop offset="30%" stop-color="${color}" stop-opacity="0.8" />
          <stop offset="50%" stop-color="${color}" stop-opacity="0.4" />
          <stop offset="70%" stop-color="${color}" stop-opacity="0.15" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0" />
        </radialGradient>
      </defs>
      
      <!-- Outer soft glow halo -->
      <circle
        cx="${endPoint.x}"
        cy="${endPoint.y}"
        r="${thickness * 2.0}"
        fill="url(#${glowGradientId})"
        opacity="0.6"
      />
      
      <!-- Middle glow layer -->
      <circle
        cx="${endPoint.x}"
        cy="${endPoint.y}"
        r="${thickness * 1.2}"
        fill="url(#${glowGradientId})"
        opacity="0.8"
      />
      
      <!-- Bright inner core -->
      <circle
        cx="${endPoint.x}"
        cy="${endPoint.y}"
        r="${thickness * 0.5}"
        fill="${color}"
        opacity="1"
        style="filter: brightness(1.5);"
      />
    `;
  }

  private renderGradientDefs(
    gaugeModule: GaugeModule,
    centerX?: number,
    centerY?: number,
    radius?: number,
    startAngle?: number,
    endAngle?: number,
    valueAngle?: number,
    clampedPercentage?: number
  ): TemplateResult {
    if (
      gaugeModule.gauge_color_mode !== 'gradient' ||
      !gaugeModule.gradient_stops ||
      gaugeModule.gradient_stops.length === 0
    ) {
      return svg``;
    }

    const displayMode = gaugeModule.gradient_display_mode || 'full';
    const sortedStops = [...gaugeModule.gradient_stops].sort((a, b) => a.position - b.position);
    const gradientId = `gradient-${gaugeModule.id}`;

    // If geometry is provided, create gradient that follows the arc
    if (
      centerX !== undefined &&
      centerY !== undefined &&
      radius !== undefined &&
      startAngle !== undefined &&
      endAngle !== undefined
    ) {
      let gradientStartAngle = startAngle;
      let gradientEndAngle = endAngle;
      let stopsToUse = sortedStops;

      // Handle different display modes
      if (displayMode === 'cropped' && valueAngle !== undefined && clampedPercentage !== undefined) {
        // Cropped mode: gradient only up to current value
        gradientEndAngle = valueAngle;
        
        // Normalize stops to 0-100% range for the cropped section
        const croppedStops = sortedStops.filter(stop => stop.position <= clampedPercentage);
        
        // Always include the color at the exact percentage
        const colorAtPercentage = this.getColorAtValue(gaugeModule, clampedPercentage);
        if (!croppedStops.some(stop => stop.position === clampedPercentage)) {
          croppedStops.push({
            id: `cropped_${clampedPercentage}`,
            position: clampedPercentage,
            color: colorAtPercentage,
          });
        }
        
        // Normalize positions to 0-100% range
        stopsToUse = croppedStops.map(stop => ({
          ...stop,
          position: clampedPercentage > 0 ? (stop.position / clampedPercentage) * 100 : 0,
        })).sort((a, b) => a.position - b.position);
      } else if (displayMode === 'value-based') {
        // Value-based mode: return empty defs (will use solid color instead)
        return svg``;
      }

      // Calculate start and end points of the gradient arc
      const startPoint = this.polarToCartesian(centerX, centerY, radius, gradientStartAngle);
      const endPoint = this.polarToCartesian(centerX, centerY, radius, gradientEndAngle);

      return svg`
        <defs>
          <linearGradient
            id="${gradientId}"
            x1="${startPoint.x}"
            y1="${startPoint.y}"
            x2="${endPoint.x}"
            y2="${endPoint.y}"
            gradientUnits="userSpaceOnUse"
          >
            ${stopsToUse.map(
              stop => svg`
              <stop offset="${stop.position}%" stop-color="${stop.color}" />
            `
            )}
          </linearGradient>
        </defs>
      `;
    }

    // Fallback to horizontal gradient for backward compatibility
    return svg`
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
          ${sortedStops.map(
            stop => svg`
            <stop offset="${stop.position}%" stop-color="${stop.color}" />
          `
          )}
        </linearGradient>
      </defs>
    `;
  }

  private renderGradientValueArc(
    gaugeModule: GaugeModule,
    valueArc: string,
    thickness: number,
    clampedPercentage: number,
    strokeLinecap: string = 'butt',
    additionalStyle?: string,
    fullArc?: string,
    centerX?: number,
    centerY?: number,
    startAngle?: number,
    valueAngle?: number
  ): TemplateResult {
    if (gaugeModule.gauge_color_mode !== 'gradient') {
      return svg``;
    }
    
    const gradientMode = gaugeModule.gradient_display_mode || 'full';
    
    // For "full" mode, render the full arc with gradient visible (no clipping needed)
    if (gradientMode === 'full') {
      return svg`
        <path
          d="${valueArc}"
          fill="none"
          stroke="url(#gradient-${gaugeModule.id})"
          stroke-width="${thickness}"
          stroke-linecap="${strokeLinecap}"
          ${additionalStyle ? `style="${additionalStyle}"` : ''}
        />
      `;
    }
    
    // For "cropped" and "value-based" modes, use the value arc directly
    const strokeColor = gradientMode === 'value-based' 
      ? this.getColorAtValue(gaugeModule, clampedPercentage)
      : `url(#gradient-${gaugeModule.id})`;
    
    return svg`
      <path
        d="${valueArc}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="${thickness}"
        stroke-linecap="${strokeLinecap}"
        ${additionalStyle ? `style="${additionalStyle}"` : ''}
      />
    `;
  }

  private renderSegmentedCircle(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    thickness: number,
    currentValue: number,
    showAllSegments: boolean = false
  ): TemplateResult {
    if (!gaugeModule.segments || gaugeModule.segments.length === 0) {
      return svg``;
    }

    const minValue = gaugeModule.min_value || 0;
    const maxValue = gaugeModule.max_value || 100;
    const circumference = 2 * Math.PI * radius;
    const segments = [];

    // Sort segments by from value
    const sortedSegments = [...gaugeModule.segments].sort((a, b) => a.from - b.from);

    for (const segment of sortedSegments) {
      // Convert segment values to percentages
      const segmentStartPercentage = ((segment.from - minValue) / (maxValue - minValue)) * 100;
      const segmentEndPercentage = ((segment.to - minValue) / (maxValue - minValue)) * 100;

      if (showAllSegments) {
        // Show all segments regardless of current value
        if (segmentEndPercentage > segmentStartPercentage) {
          const segmentLength =
            ((segmentEndPercentage - segmentStartPercentage) / 100) * circumference;
          const segmentOffset =
            circumference - (segmentStartPercentage / 100) * circumference - segmentLength;

          segments.push(svg`
            <circle
              cx="${centerX}"
              cy="${centerY}"
              r="${radius}"
              fill="none"
              stroke="${segment.color}"
              stroke-width="${thickness}"
              stroke-linecap="round"
              stroke-dasharray="${segmentLength} ${circumference - segmentLength}"
              stroke-dashoffset="${segmentOffset}"
              transform="rotate(-90 ${centerX} ${centerY})"
            />
          `);
        }
      } else {
        // Original logic - only show segments up to current value
        const currentPercentage = ((currentValue - minValue) / (maxValue - minValue)) * 100;

        if (segmentStartPercentage <= currentPercentage) {
          const actualEndPercentage = Math.min(segmentEndPercentage, currentPercentage);

          if (actualEndPercentage > segmentStartPercentage) {
            const segmentLength =
              ((actualEndPercentage - segmentStartPercentage) / 100) * circumference;
            const segmentOffset =
              circumference - (segmentStartPercentage / 100) * circumference - segmentLength;

            segments.push(svg`
              <circle
                cx="${centerX}"
                cy="${centerY}"
                r="${radius}"
                fill="none"
                stroke="${segment.color}"
                stroke-width="${thickness}"
                stroke-linecap="butt"
                stroke-dasharray="${segmentLength} ${circumference - segmentLength}"
                stroke-dashoffset="${segmentOffset}"
                transform="rotate(-90 ${centerX} ${centerY})"
              />
            `);
          }
        }
      }
    }

    return svg`${segments}`;
  }

  private describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  }

  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ): { x: number; y: number } {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  private getContainerStyles(gaugeModule: GaugeModule): string {
    const styles: string[] = [
      'display: flex',
      'flex-direction: column',
      'align-items: center',
      'justify-content: center',
      'width: 100%',
      'overflow: hidden',
    ];

    return styles.join('; ');
  }

  private getNameStyles(gaugeModule: GaugeModule): string {
    const styles: string[] = [
      `font-size: ${gaugeModule.name_font_size || 16}px`,
      `color: ${gaugeModule.name_color || 'var(--secondary-text-color)'}`,
      `font-weight: ${gaugeModule.name_bold ? 'bold' : 'normal'}`,
      `font-style: ${gaugeModule.name_italic ? 'italic' : 'normal'}`,
      `text-transform: ${gaugeModule.name_uppercase ? 'uppercase' : 'none'}`,
      'text-align: center',
    ];

    // Handle text decoration (underline and strikethrough)
    const decorations: string[] = [];
    if (gaugeModule.name_underline) decorations.push('underline');
    if (gaugeModule.name_strikethrough) decorations.push('line-through');
    if (decorations.length > 0) {
      styles.push(`text-decoration: ${decorations.join(' ')}`);
    }

    // Apply X and Y offsets
    const xOffset = gaugeModule.name_x_offset || 0;
    const yOffset = gaugeModule.name_y_offset || 0;

    if (gaugeModule.name_position === 'top') {
      styles.push('margin-top: 0');
      styles.push('margin-bottom: 8px');
      styles.push(`transform: translateX(${xOffset}px) translateY(${yOffset}px)`);
    } else if (gaugeModule.name_position === 'bottom') {
      styles.push('margin-top: 8px');
      styles.push('margin-bottom: 0');
      styles.push(`transform: translateX(${xOffset}px) translateY(${yOffset}px)`);
    } else {
      styles.push('margin: 8px 0');
      styles.push(`transform: translateX(${xOffset}px) translateY(${yOffset}px)`);
    }

    return styles.join('; ');
  }

  private getValueStyles(gaugeModule: GaugeModule): string {
    const styles: string[] = [
      `font-size: ${gaugeModule.value_font_size || 24}px`,
      `color: ${gaugeModule.value_color || 'var(--primary-text-color)'}`,
      `font-weight: ${gaugeModule.value_bold ? 'bold' : 'normal'}`,
      `font-style: ${gaugeModule.value_italic ? 'italic' : 'normal'}`,
      `text-transform: ${gaugeModule.value_uppercase ? 'uppercase' : 'none'}`,
      'text-align: center',
    ];

    // Handle text decoration (underline and strikethrough)
    const decorations: string[] = [];
    if (gaugeModule.value_underline) decorations.push('underline');
    if (gaugeModule.value_strikethrough) decorations.push('line-through');
    if (decorations.length > 0) {
      styles.push(`text-decoration: ${decorations.join(' ')}`);
    }

    const size = gaugeModule.gauge_size || 200;
    const centerX = size / 2;
    const centerY = size / 2;

    // Apply X and Y offsets
    const xOffset = gaugeModule.value_x_offset || 0;
    const yOffset = gaugeModule.value_y_offset || 0;

    if (gaugeModule.value_position === 'center') {
      styles.push('position: absolute');
      styles.push('top: 50%');
      styles.push('left: 50%');
      styles.push(`transform: translate(${-50 + xOffset}%, ${-50 + yOffset}%)`);
    } else if (gaugeModule.value_position === 'top') {
      // Calculate top position based on gauge style
      let topOffset = 16;
      if (gaugeModule.gauge_style === 'minimal') {
        topOffset = size / 2 - 20; // Inside the circle for minimal
      }
      styles.push('position: absolute');
      styles.push(`top: ${topOffset + yOffset}px`);
      styles.push(`left: ${50 + xOffset}%`);
      styles.push('transform: translateX(-50%)');
      styles.push('z-index: 10');
    } else if (gaugeModule.value_position === 'bottom') {
      // Calculate bottom position based on gauge style
      let bottomOffset = 16;
      if (gaugeModule.gauge_style === 'speedometer' || gaugeModule.gauge_style === 'arc') {
        bottomOffset = 32; // 16px below needle for speedometer/arc
      } else if (gaugeModule.gauge_style === 'radial') {
        bottomOffset = size / 2 + 16; // Below the full circle for radial
      } else if (gaugeModule.gauge_style === 'minimal') {
        bottomOffset = size / 2 - 20; // Inside the circle for minimal
      } else if (gaugeModule.gauge_style === 'digital') {
        bottomOffset = 40; // Digital gauge has different positioning
      }
      styles.push('position: absolute');
      styles.push(`bottom: ${bottomOffset - yOffset}px`);
      styles.push(`left: ${50 + xOffset}%`);
      styles.push('transform: translateX(-50%)');
      styles.push('z-index: 10');
    }

    return styles.join('; ');
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const gaugeModule = module as GaugeModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow empty entity - UI will show placeholder
    // Only validate for truly breaking errors

    if (gaugeModule.min_value !== undefined && gaugeModule.max_value !== undefined) {
      if (gaugeModule.min_value >= gaugeModule.max_value) {
        errors.push('Minimum value must be less than maximum value');
      }
    }

    // Only validate attribute/template if entity is configured
    if (gaugeModule.entity && gaugeModule.entity.trim() !== '') {
      if (gaugeModule.value_type === 'attribute') {
        if (!gaugeModule.value_attribute_entity || !gaugeModule.value_attribute_name) {
          errors.push(
            'Attribute entity and attribute name are required when using attribute value type'
          );
        }
      }

      if (gaugeModule.value_type === 'template') {
        if (!gaugeModule.value_template || gaugeModule.value_template.trim() === '') {
          errors.push('Template is required when using template value type');
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-gauge-container {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      .uc-gauge-wrapper {
        position: relative;
        display: inline-block;
      }
      
      .uc-gauge-svg {
        display: block;
      }
      
      .uc-gauge-value-center {
        pointer-events: none;
      }
      
      .uc-gauge-value-bottom,
      .uc-gauge-name {
        width: 100%;
        text-align: center;
      }
      
      .uc-gauge-clickable {
        cursor: pointer;
      }
    `;
  }
}
