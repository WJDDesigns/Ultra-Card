import { html, svg, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, GaugeModule, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { FormUtils } from '../utils/form-utils';
import '../components/ultra-color-picker';
import '../components/uc-gradient-editor';
import '../components/ultra-template-editor';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { GlobalDesignTab } from '../tabs/global-design-tab';
import { TemplateService } from '../services/template-service';
import { parseUnifiedTemplate, hasTemplateError } from '../utils/template-parser';
import { buildEntityContext } from '../utils/template-context';

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

  private _templateService?: TemplateService;

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
      flip_horizontal: false,

      // Pointer Configuration
      pointer_enabled: true,
      pointer_style: 'needle',
      pointer_color: 'var(--primary-color)',
      pointer_length: 80,
      pointer_width: 6,
      pointer_icon: 'mdi:gauge',
      pointer_icon_color: '#FFFFFF',
      pointer_icon_size: 24,

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

      // Gauge Animation (needle/value animation - named to avoid Design tab conflict)
      gauge_animation_enabled: true,
      gauge_animation_duration: '1000ms',
      gauge_animation_easing: 'ease-out',

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

      // Unified template system
      unified_template_mode: false,
      unified_template: '',
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
        .settings-section label {
          width: auto;
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
        .template-section {
          background: var(--card-background-color);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid var(--divider-color);
          margin-bottom: 32px;
        }
        .template-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .template-help {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 12px;
          padding: 12px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-radius: 4px;
        }
        .template-help p {
          margin: 8px 0;
        }
        .template-help ul {
          margin: 8px 0 8px 20px;
        }
        .template-help code {
          background: var(--code-editor-background-color, #1e1e1e);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 11px;
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
    let unifiedTemplateEnabled = gaugeModule.unified_template_mode || false;

    // Auto-migrate: If legacy template exists but unified template mode is off, enable it and migrate
    if (
      !unifiedTemplateEnabled &&
      gaugeModule.value_template &&
      gaugeModule.value_template.trim() !== '' &&
      !gaugeModule.unified_template
    ) {
      // Auto-migrate on render
      const updates: Partial<GaugeModule> = {
        unified_template_mode: true,
        unified_template: gaugeModule.value_template,
        value_type: 'entity',
        value_template: '',
      };
      updateModule(updates);
      unifiedTemplateEnabled = true;
    }

    return html`
      <div class="settings-section">
        <div class="section-title">VALUE CONFIGURATION</div>

        <!-- Value Source -->
        <div class="field-group" style="margin-bottom: 24px; ${unifiedTemplateEnabled ? 'opacity: 0.5; pointer-events: none;' : ''}">
          <div class="field-title">
            Value Source
            ${unifiedTemplateEnabled
              ? html`<span style="font-size: 12px; color: var(--secondary-text-color); margin-left: 8px; font-weight: normal;">(Disabled - Template Mode Active)</span>`
              : ''}
          </div>
          <div class="field-description">
            ${unifiedTemplateEnabled
              ? 'Value Source options are disabled when Template Mode is active. Use the template editor below to control the gauge value.'
              : 'How to calculate the gauge value.'}
          </div>
          ${this.renderUcForm(
            hass,
            { value_type: valueType },
            [
              this.selectField('value_type', [
                { value: 'entity', label: 'Entity State' },
                { value: 'attribute', label: 'Entity Attribute' },
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
        ${valueType === 'attribute' && !unifiedTemplateEnabled
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

        <!-- Template Mode Section -->
        <div class="template-section" style="margin-bottom: 24px; margin-top: 24px;">
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div class="field-title" style="margin: 0;">Template Mode</div>
            <ha-switch
              .checked=${unifiedTemplateEnabled}
              @change=${(e: Event) => {
                const checked = (e.target as HTMLInputElement).checked;
                const updates: Partial<GaugeModule> = { unified_template_mode: checked };
                
                // Migrate existing value_template to unified_template if enabling Template Mode
                if (checked && gaugeModule.value_template && !gaugeModule.unified_template) {
                  updates.unified_template = gaugeModule.value_template;
                  // Clear legacy template mode
                  updates.value_type = 'entity';
                  updates.value_template = '';
                }
                
                updateModule(updates);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ha-switch>
          </div>
          <div class="field-description" style="margin-bottom: 16px;">
            Use Jinja2 templates for dynamic value and color control.
          </div>

          ${unifiedTemplateEnabled
            ? html`
                <div 
                  class="template-content"
                  @mousedown=${(e: Event) => {
                    // Only stop propagation for drag operations, not clicks on the editor
                    const target = e.target as HTMLElement;
                    if (!target.closest('ultra-template-editor') && !target.closest('.cm-editor')) {
                      e.stopPropagation();
                    }
                  }}
                  @dragstart=${(e: Event) => e.stopPropagation()}
                >
                  <ultra-template-editor
                    .hass=${hass}
                    .value=${gaugeModule.unified_template || ''}
                    .placeholder=${'{% set temp = state | float %}\n{\n  "value": {{ temp }},\n  "gauge_color": "{% if temp > 25 %}#FF4444{% elif temp > 20 %}#FF8800{% else %}#00CC00{% endif %}"\n}'}
                    .minHeight=${200}
                    .maxHeight=${500}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({ unified_template: e.detail.value });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  ></ultra-template-editor>
                  <div class="template-help">
                    <p><strong>Return simple number for value-only:</strong></p>
                    <ul>
                      <li><code>{{ states('sensor.temperature') | float }}</code> → Changes gauge value only</li>
                    </ul>
                    <p><strong>Return JSON for multiple properties:</strong></p>
                    <ul>
                      <li><code>{ "value": 75, "gauge_color": "#FF0000" }</code></li>
                      <li>Available properties: <code>value</code> (number), <code>gauge_color</code> (CSS color)</li>
                    </ul>
                    <p><strong>Entity context variables (no need to hardcode entity ID):</strong></p>
                    <ul>
                      <li><code>entity</code> → Entity ID (${gaugeModule.entity || 'N/A'})</li>
                      <li><code>state</code> → Current state value</li>
                      <li><code>name</code> → Entity name</li>
                      <li><code>attributes</code> → All entity attributes</li>
                      <li><code>unit</code> → Unit of measurement</li>
                      <li><code>domain</code> → Entity domain (e.g., 'sensor', 'input_number')</li>
                      <li><code>device_class</code> → Device class</li>
                    </ul>
                    <p><strong>Example - Dynamic color based on temperature:</strong></p>
                    <code
                      style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px;"
                    >
                      {% set temp = state | float %}<br />
                      {<br />
                      &nbsp;&nbsp;"value": {{ temp }},<br />
                      &nbsp;&nbsp;"gauge_color": "{% if temp > 25 %}#FF4444{% elif temp > 20 %}#FF8800{% else %}#00CC00{% endif %}"<br />
                      }
                    </code>
                  </div>
                </div>
              `
            : ''}
        </div>
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
        ${this.renderFlipHorizontalOption(gaugeModule, hass, updateModule)}
      </div>
    `;
  }

  private renderFlipHorizontalOption(
    gaugeModule: GaugeModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const gaugeStyle = gaugeModule.gauge_style || 'modern';
    const showFlipOption = ['arc', 'speedometer'].includes(gaugeStyle);

    if (!showFlipOption) return html``;

    return html`
      <div class="conditional-fields-group" style="margin-top: 16px;">
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px;"
        >
          <div>
            <div class="field-title" style="margin: 0;">Flip Horizontal</div>
            <div class="field-description" style="margin: 4px 0 0 0;">
              Mirror the gauge so it fills from right to left.
            </div>
          </div>
          <ha-switch
            .checked=${gaugeModule.flip_horizontal || false}
            @change=${(e: Event) => {
              updateModule({ flip_horizontal: (e.target as HTMLInputElement).checked });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          ></ha-switch>
        </div>
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
    const showLengthWidth = !['highlight', 'cap', 'icon'].includes(pointerStyle);

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
                        { value: 'icon', label: 'Icon' },
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

                ${gaugeModule.pointer_style === 'icon'
                  ? html`
                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Pointer Icon</div>
                        <div class="field-description">Select an icon to display as the pointer.</div>
                        ${FormUtils.renderField(
                          '',
                          '',
                          hass,
                          { pointer_icon: gaugeModule.pointer_icon || 'mdi:gauge' },
                          [FormUtils.createSchemaItem('pointer_icon', { icon: {} })],
                          (e: CustomEvent) =>
                            updateModule({ pointer_icon: e.detail.value.pointer_icon })
                        )}
                      </div>

                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Icon Color</div>
                        <div class="field-description">Color of the icon pointer.</div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${gaugeModule.pointer_icon_color || ''}
                          .defaultValue=${'#FFFFFF'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ pointer_icon_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>

                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Icon Size</div>
                        <div class="field-description">Size of the icon in pixels (8-48).</div>
                        ${FormUtils.renderCleanForm(
                          hass,
                          { pointer_icon_size: gaugeModule.pointer_icon_size ?? 24 },
                          [
                            FormUtils.createSchemaItem('pointer_icon_size', {
                              number: { mode: 'box', min: 8, max: 48, step: 1 },
                            }),
                          ],
                          (e: CustomEvent) => {
                            const value = e.detail.value.pointer_icon_size;
                            updateModule({ pointer_icon_size: value === '' ? undefined : Number(value) });
                          }
                        )}
                      </div>
                    `
                  : html`
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
                    `}

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
    const unifiedTemplateEnabled = gaugeModule.unified_template_mode || false;

    return html`
      <div class="settings-section">
        <div class="section-title">COLOR CONFIGURATION</div>

        ${unifiedTemplateEnabled
          ? html`
              <div style="padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color); margin-bottom: 16px;">
                <div style="font-size: 12px; color: var(--primary-color); font-weight: 600; margin-bottom: 4px;">
                  Template Mode Active
                </div>
                <div style="font-size: 11px; color: var(--secondary-text-color);">
                  Color settings below are used as fallback. Template Mode (in Value Configuration) can override colors via <code>gauge_color</code> property.
                </div>
              </div>
            `
          : ''}

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
                    Horizontal offset for value positioning (supports negative values).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { value_x_offset: gaugeModule.value_x_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('value_x_offset', {
                        number: { mode: 'box', min: -500, max: 500, step: 1 },
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
                    Vertical offset for value positioning (supports negative values).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { value_y_offset: gaugeModule.value_y_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('value_y_offset', {
                        number: { mode: 'box', min: -500, max: 500, step: 1 },
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
                    Horizontal offset for name positioning (supports negative values).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { name_x_offset: gaugeModule.name_x_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('name_x_offset', {
                        number: { mode: 'box', min: -500, max: 500, step: 1 },
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
                    Vertical offset for name positioning (supports negative values).
                  </div>
                  ${FormUtils.renderCleanForm(
                    hass,
                    { name_y_offset: gaugeModule.name_y_offset ?? 0 },
                    [
                      FormUtils.createSchemaItem('name_y_offset', {
                        number: { mode: 'box', min: -500, max: 500, step: 1 },
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
    const animationEnabled = gaugeModule.gauge_animation_enabled !== false;

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
              updateModule({ gauge_animation_enabled: (e.target as HTMLInputElement).checked })}
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
                    { gauge_animation_duration: gaugeModule.gauge_animation_duration || '1000ms' },
                    [FormUtils.createSchemaItem('gauge_animation_duration', { text: {} })],
                    (e: CustomEvent) => {
                      const value = e.detail.value.gauge_animation_duration;
                      updateModule({ gauge_animation_duration: value === '' ? undefined : value });
                    }
                  )}
                </div>

                <div class="field-group">
                  <div class="field-title">Animation Easing</div>
                  <div class="field-description">Easing function for the animation.</div>
                  ${this.renderUcForm(
                    hass,
                    { gauge_animation_easing: gaugeModule.gauge_animation_easing || 'ease-out' },
                    [
                      this.selectField('gauge_animation_easing', [
                        { value: 'linear', label: 'Linear' },
                        { value: 'ease-in', label: 'Ease In' },
                        { value: 'ease-out', label: 'Ease Out' },
                        { value: 'ease-in-out', label: 'Ease In-Out' },
                        { value: 'bounce', label: 'Bounce' },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.gauge_animation_easing;
                      const prev = gaugeModule.gauge_animation_easing || 'ease-out';
                      if (next === prev) return;
                      updateModule({ gauge_animation_easing: next });
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

  renderDesignTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalDesignTab.render(module as GaugeModule, hass, updates => updateModule(updates));
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

    // Update template service if hass changed
    if (this._templateService && hass) {
      this._templateService.updateHass(hass);
    }

    // GRACEFUL RENDERING: Check for incomplete configuration
    // For template mode or unified template mode, allow rendering even without entity
    if (
      !gaugeModule.unified_template_mode &&
      gaugeModule.value_type !== 'template' &&
      (!gaugeModule.entity || gaugeModule.entity.trim() === '')
    ) {
      return this.renderGradientErrorState(
        'Select Entity',
        'Choose an entity in the General tab',
        'mdi:gauge-empty'
      );
    }

    // Apply design properties with priority - design properties override module properties
    const moduleWithDesign = gaugeModule as any;
    const designProperties = (gaugeModule as any).design || {};

    // Container styles for design system with proper priority
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      overflow: 'visible',
      boxSizing: 'border-box',
      // Apply design properties - padding (no default padding - SVG has overflow:visible for labels)
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : '0',
      // Apply design properties - margin
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '0px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '0px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '0',
      // Apply design properties - background
      background:
        designProperties.background_color ||
        moduleWithDesign.background_color ||
        'transparent',
      // Apply design properties - border
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width || moduleWithDesign.border_width) || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      // Apply design properties - border radius
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      // Apply design properties - box shadow
      boxShadow:
        (designProperties.box_shadow_h || moduleWithDesign.box_shadow_h) &&
        (designProperties.box_shadow_v || moduleWithDesign.box_shadow_v)
          ? `${designProperties.box_shadow_h || moduleWithDesign.box_shadow_h || '0'} ${designProperties.box_shadow_v || moduleWithDesign.box_shadow_v || '0'} ${designProperties.box_shadow_blur || moduleWithDesign.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || moduleWithDesign.box_shadow_spread || '0'} ${designProperties.box_shadow_color || moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
    };

    // Convert containerStyles object to CSS string
    const containerStyleStr = Object.entries(containerStyles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebabKey}: ${value}`;
      })
      .join('; ');

    const value = this.calculateGaugeValue(gaugeModule, hass);
    const displayName = this.getDisplayName(gaugeModule, hass);

    return html`
      <div class="uc-gauge-container" style="${containerStyleStr}">
        ${gaugeModule.show_name && gaugeModule.name_position === 'top'
          ? html`
              <div class="uc-gauge-name" style="${this.getNameStyles(gaugeModule)}">
                ${displayName}
              </div>
            `
          : ''}

        <div
          class="uc-gauge-wrapper"
          style="position: relative; display: ${gaugeModule.show_value && gaugeModule.value_position === 'bottom' ? 'flex' : 'inline-block'}; ${gaugeModule.show_value && gaugeModule.value_position === 'bottom' ? 'flex-direction: column; align-items: center;' : ''} overflow: visible;"
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
            viewBox="${this.getSvgViewBox(gaugeModule)}"
            width="${gaugeModule.gauge_size || 200}"
            height="${this.getSvgHeight(gaugeModule)}"
            style="overflow: visible;"
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
    // PRIORITY 1: Unified template (if enabled)
    if (gaugeModule.unified_template_mode && gaugeModule.unified_template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }
      if (hass) {
        if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
        const templateHash = this._hashString(gaugeModule.unified_template);
        const templateKey = `unified_gauge_${gaugeModule.id}_${templateHash}`;

        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          const context = buildEntityContext(gaugeModule.entity || '', hass, {
            entity: gaugeModule.entity,
          });
          this._templateService.subscribeToTemplate(
            gaugeModule.unified_template,
            templateKey,
            () => {
              if (typeof window !== 'undefined') {
                if (!window._ultraCardUpdateTimer) {
                  window._ultraCardUpdateTimer = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                    window._ultraCardUpdateTimer = null;
                  }, 50);
                }
              }
            },
            context
            // Note: cardConfig not available in calculateGaugeValue - only global variables will work here
          );
        }

        const unifiedResult = hass.__uvc_template_strings?.[templateKey];
        if (unifiedResult && String(unifiedResult).trim() !== '') {
          const parsed = parseUnifiedTemplate(unifiedResult);
          if (!hasTemplateError(parsed)) {
            if (parsed.value !== undefined) {
              const num =
                typeof parsed.value === 'number' ? parsed.value : parseFloat(String(parsed.value));
              if (!isNaN(num)) {
                return num;
              }
            }
          }
        }
      }
    }

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
      // Initialize template service if needed
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      if (hass) {
        // Ensure template string cache exists on hass
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }

        // Create unique template key using hash
        const templateHash = this._hashString(gaugeModule.value_template);
        const templateKey = `gauge_value_${gaugeModule.id}_${templateHash}`;

        // Subscribe to template if not already subscribed
        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          this._templateService.subscribeToTemplate(
            gaugeModule.value_template,
            templateKey,
            () => {
              // Trigger update when template result changes
              if (typeof window !== 'undefined') {
                if (!window._ultraCardUpdateTimer) {
                  window._ultraCardUpdateTimer = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                    window._ultraCardUpdateTimer = null;
                  }, 50);
                }
              }
            }
            // Note: cardConfig not available in calculateGaugeValue - only global variables will work here
          );
        }

        // Get rendered template result
        const rendered = hass.__uvc_template_strings?.[templateKey];
        if (rendered !== undefined && String(rendered).trim() !== '') {
          const num = parseFloat(String(rendered));
          if (!isNaN(num)) {
            return num;
          }
        }
      }

      // Return default if template not yet evaluated or invalid
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
        return this.renderSpeedometerGauge(gaugeModule, value, hass);
      case 'arc':
        return this.renderArcGauge(gaugeModule, value, hass);
      case 'radial':
        return this.renderRadialGauge(gaugeModule, value, hass);
      case 'lines':
        return this.renderLinesGauge(gaugeModule, value, hass);
      case 'block':
        return this.renderBlockGauge(gaugeModule, value, hass);
      case 'minimal':
        return this.renderMinimalGauge(gaugeModule, value, hass);
      case 'inset':
        return this.renderInsetGauge(gaugeModule, value, hass);
      case '3d':
        return this.render3DGauge(gaugeModule, value, hass);
      case 'neon':
        return this.renderNeonGauge(gaugeModule, value, hass);
      case 'digital':
        return this.renderDigitalGauge(gaugeModule, value, hass);
      case 'basic':
        return this.renderBasicGauge(gaugeModule, value, hass);
      case 'modern':
      default:
        return this.renderModernGauge(gaugeModule, value, hass);
    }
  }

  private renderModernGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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
                  gaugeModule.gauge_animation_enabled !== false
                    ? gaugeModule.gauge_animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.gauge_animation_easing || 'ease-out'};`,
                backgroundArc,
                centerX,
                centerY,
                startAngle,
                valueAngle,
                hass
              )
            : svg`
              <path
                d="${valueArc}"
                fill="none"
                stroke="${color}"
                stroke-width="${thickness}"
                stroke-linecap="round"
                style="transition: stroke-dashoffset ${
                  gaugeModule.gauge_animation_enabled !== false
                    ? gaugeModule.gauge_animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.gauge_animation_easing || 'ease-out'};"
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

  private renderBasicGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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
                valueAngle,
                hass
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

  private renderSpeedometerGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);
    const flipHorizontal = gaugeModule.flip_horizontal || false;

    // Graphical content (arcs, pointer) - will be wrapped in flip group if needed
    const graphicalContent = svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, undefined, undefined, hass)}
      
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
                valueAngle,
                hass
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
          ? this.renderTickMarksGraphics(
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
    `;

    // Text content (labels) - rendered outside flip group, with mirrored positions when flipped
    const textContent = svg`
      ${
        gaugeModule.show_ticks !== false && gaugeModule.show_tick_labels
          ? this.renderTickLabels(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              flipHorizontal,
              size
            )
          : ''
      }
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle, flipHorizontal, size)
          : ''
      }
    `;

    // Apply horizontal flip if enabled (only to graphical content)
    if (flipHorizontal) {
      return svg`
        <g transform="scale(-1, 1) translate(-${size}, 0)">
          ${graphicalContent}
        </g>
        ${textContent}
      `;
    }

    return svg`
      ${graphicalContent}
      ${textContent}
    `;
  }

  private renderArcGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);
    const flipHorizontal = gaugeModule.flip_horizontal || false;

    // Graphical content (arcs, pointer) - will be wrapped in flip group if needed
    const graphicalContent = svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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
                valueAngle,
                hass
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
          ? this.renderTickMarksGraphics(
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
    `;

    // Text content (labels) - rendered outside flip group, with mirrored positions when flipped
    const textContent = svg`
      ${
        gaugeModule.show_ticks !== false && gaugeModule.show_tick_labels
          ? this.renderTickLabels(
              gaugeModule,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
              thickness,
              flipHorizontal,
              size
            )
          : ''
      }
      ${
        gaugeModule.show_min_max !== false && !gaugeModule.show_tick_labels
          ? this.renderMinMaxLabels(gaugeModule, centerX, centerY, radius, startAngle, endAngle, flipHorizontal, size)
          : ''
      }
    `;

    // Apply horizontal flip if enabled (only to graphical content)
    if (flipHorizontal) {
      return svg`
        <g transform="scale(-1, 1) translate(-${size}, 0)">
          ${graphicalContent}
        </g>
        ${textContent}
      `;
    }

    return svg`
      ${graphicalContent}
      ${textContent}
    `;
  }

  private renderRadialGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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
                valueAngle,
                hass
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

  private renderLinesGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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
        color = this.getColorAtValue(gaugeModule, linePercentage, hass);
      } else {
        // For gradient/solid modes, only show active lines
        const isActive = linePercentage <= clampedPercentage;
        if (isActive) {
          color = this.getColorAtValue(gaugeModule, linePercentage, hass);
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

  private renderBlockGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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
        color = this.getColorAtValue(gaugeModule, blockEndPercentage, hass);
      } else {
        // For gradient/solid modes, light up blocks if the pointer is within or past the block
        const isActive = clampedPercentage >= blockStartPercentage;
        if (isActive) {
          color = this.getColorAtValue(gaugeModule, blockEndPercentage, hass);
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

  private renderMinimalGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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
                  ? this.getColorAtValue(gaugeModule, clampedPercentage, hass)
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

  private renderInsetGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);
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
                  ? this.getColorAtValue(gaugeModule, clampedPercentage, hass)
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

  private render3DGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);
    const backgroundColor = gaugeModule.gauge_background_color || 'var(--disabled-text-color)';

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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
                  ? this.getColorAtValue(gaugeModule, clampedPercentage, hass)
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

  private renderNeonGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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

    const color = this.getColorAtValue(gaugeModule, clampedPercentage, hass);
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
          return this.getColorAtValue(gaugeModule, clampedPercentage, hass);
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
        return this.getColorAtValue(gaugeModule, clampedPercentage, hass);
      }

      // Use the solid gauge color
      return gaugeModule.gauge_color || 'var(--primary-color)';
    };

    const glowColor = getGlowColor();

    return svg`
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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
                  ? this.getColorAtValue(gaugeModule, clampedPercentage, hass)
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
                  gaugeModule.gauge_animation_enabled !== false
                    ? gaugeModule.gauge_animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.gauge_animation_easing || 'ease-out'};"
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
                  gaugeModule.gauge_animation_enabled !== false
                    ? gaugeModule.gauge_animation_duration || '1000ms'
                    : '0ms'
                } ${gaugeModule.gauge_animation_easing || 'ease-out'};"
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

  private renderDigitalGauge(
    gaugeModule: GaugeModule,
    value: number,
    hass?: HomeAssistant
  ): TemplateResult {
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
        blockColor = this.getColorAtValue(gaugeModule, blockEndPercentage, hass);
      } else {
        // For gradient/solid modes, light up blocks if the pointer is within or past the block
        const isActive = clampedPercentage >= blockStartPercentage;
        if (isActive) {
          blockColor = this.getColorAtValue(gaugeModule, blockEndPercentage, hass);
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
      ${this.renderGradientDefs(gaugeModule, centerX, centerY, radius, startAngle, endAngle, valueAngle, clampedPercentage, hass)}
      
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

  // Render only the tick mark lines (no labels) - used inside flip group
  private renderTickMarksGraphics(
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
      const innerRadius = radius - t / 2 + 2;
      const outerRadius = radius + t / 2 - 2;

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
    }

    return svg`${ticks}`;
  }

  // Render tick labels - rendered outside flip group with mirrored positions when flipped
  private renderTickLabels(
    gaugeModule: GaugeModule,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    thickness?: number,
    flipHorizontal?: boolean,
    size?: number
  ): TemplateResult {
    const tickCount = gaugeModule.tick_count || 10;
    const angleRange = endAngle - startAngle;
    const labels = [];
    const gaugeSize = size || gaugeModule.gauge_size || 200;

    for (let i = 0; i <= tickCount; i++) {
      const angle = startAngle + (angleRange * i) / tickCount;
      const t = thickness || gaugeModule.gauge_thickness || 15;
      const outerRadius = radius + t / 2 - 2;
      const labelRadius = outerRadius + 14;
      
      // When flipped, mirror the label position horizontally
      let labelPoint;
      if (flipHorizontal) {
        // Calculate the mirrored position: mirror around the center X
        const originalPoint = this.polarToCartesian(centerX, centerY, labelRadius, angle);
        labelPoint = {
          x: gaugeSize - originalPoint.x,
          y: originalPoint.y
        };
      } else {
        labelPoint = this.polarToCartesian(centerX, centerY, labelRadius, angle);
      }

      const minValue = gaugeModule.min_value || 0;
      const maxValue = gaugeModule.max_value || 100;
      const value = Math.round(minValue + ((maxValue - minValue) * i) / tickCount);
      const fontSize = gaugeModule.tick_label_font_size || 10;

      labels.push(
        svg`<text 
          x="${labelPoint.x}" 
          y="${labelPoint.y}" 
          fill="${gaugeModule.min_max_color || 'var(--secondary-text-color)'}" 
          font-size="${fontSize}" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >${value}</text>`
      );
    }

    return svg`${labels}`;
  }

  // Original renderTickMarks - for gauges that don't use the flip feature
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
      const innerRadius = radius - t / 2 + 2;
      const outerRadius = radius + t / 2 - 2;

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

    if (pointerStyle === 'icon') {
      // Icon pointer - render icon on the gauge track (like cap style)
      const iconName = gaugeModule.pointer_icon || 'mdi:gauge';
      const iconColor = gaugeModule.pointer_icon_color || '#FFFFFF';
      const iconSize = gaugeModule.pointer_icon_size || 24; // Use dedicated icon size field

      // Calculate icon position on the gauge track (using radius, not pointerLength)
      const iconPoint = this.polarToCartesian(centerX, centerY, radius, angle);

      // Use foreignObject to embed HTML icon (ha-icon) in SVG
      // Position the icon centered on the gauge track point
      // Use --mdc-icon-size CSS variable for proper icon sizing
      // Add padding to foreignObject to prevent clipping
      const padding = 4; // Padding to prevent clipping
      const totalSize = iconSize + padding * 2;
      
      return svg`
        <foreignObject
          x="${iconPoint.x - totalSize / 2}"
          y="${iconPoint.y - totalSize / 2}"
          width="${totalSize}"
          height="${totalSize}"
          style="overflow: visible;"
        >
          <div style="
            width: ${totalSize}px;
            height: ${totalSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: visible;
            box-sizing: border-box;
            position: relative;
          ">
            <ha-icon
              icon="${iconName}"
              style="
                --mdc-icon-size: ${iconSize}px;
                width: ${iconSize}px;
                height: ${iconSize}px;
                color: ${iconColor};
                display: block;
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                line-height: 1;
              "
            ></ha-icon>
          </div>
        </foreignObject>
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
    endAngle: number,
    flipHorizontal?: boolean,
    size?: number
  ): TemplateResult {
    const labelRadius = radius + 20;
    const gaugeSize = size || gaugeModule.gauge_size || 200;
    
    // Calculate original positions
    const originalMinPoint = this.polarToCartesian(centerX, centerY, labelRadius, startAngle);
    const originalMaxPoint = this.polarToCartesian(centerX, centerY, labelRadius, endAngle);

    const fontSize = gaugeModule.min_max_font_size || 12;
    const color = gaugeModule.min_max_color || 'var(--secondary-text-color)';

    // When flipped, mirror the label positions horizontally
    // The min label should appear where max was, and vice versa (visually)
    let minPoint, maxPoint;
    if (flipHorizontal) {
      // Mirror positions around the center X axis
      minPoint = {
        x: gaugeSize - originalMinPoint.x,
        y: originalMinPoint.y
      };
      maxPoint = {
        x: gaugeSize - originalMaxPoint.x,
        y: originalMaxPoint.y
      };
    } else {
      minPoint = originalMinPoint;
      maxPoint = originalMaxPoint;
    }

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

  private getColorAtValue(
    gaugeModule: GaugeModule,
    percentage: number,
    hass?: HomeAssistant
  ): string {
    // PRIORITY 1: Unified template color (if enabled)
    if (gaugeModule.unified_template_mode && gaugeModule.unified_template && hass) {
      if (!this._templateService) {
        this._templateService = new TemplateService(hass);
      }
      if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
      const templateHash = this._hashString(gaugeModule.unified_template);
      const templateKey = `unified_gauge_${gaugeModule.id}_${templateHash}`;

      const unifiedResult = hass.__uvc_template_strings?.[templateKey];
      if (unifiedResult && String(unifiedResult).trim() !== '') {
        const parsed = parseUnifiedTemplate(unifiedResult);
        if (!hasTemplateError(parsed)) {
          if (parsed.gauge_color) {
            return parsed.gauge_color;
          }
        }
      }
    }

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
    clampedPercentage?: number,
    hass?: HomeAssistant
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
        const colorAtPercentage = this.getColorAtValue(gaugeModule, clampedPercentage, hass);
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
    valueAngle?: number,
    hass?: HomeAssistant
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
      ? this.getColorAtValue(gaugeModule, clampedPercentage, hass)
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

  // Calculate SVG viewBox based on gauge style to tightly fit content
  private getSvgViewBox(gaugeModule: GaugeModule): string {
    const size = gaugeModule.gauge_size || 200;
    const style = gaugeModule.gauge_style || 'modern';
    const thickness = gaugeModule.gauge_thickness || 15;
    const center = size / 2;
    const radius = size / 2 - thickness - 10;
    const hasLabels = gaugeModule.show_min_max !== false || gaugeModule.show_tick_labels;
    
    // For full circle gauges, use full viewBox
    if (['radial', 'minimal'].includes(style)) {
      return `0 0 ${size} ${size}`;
    }
    
    // For digital gauge, full size
    if (style === 'digital') {
      return `0 0 ${size} ${size}`;
    }
    
    // Calculate bounds based on arc angles
    let startAngle: number, endAngle: number;
    
    if (style === 'arc') {
      startAngle = -180; endAngle = 0; // Semi-circle
    } else if (style === 'speedometer') {
      startAngle = -225; endAngle = 45; // 270° arc
    } else {
      startAngle = -120; endAngle = 120; // 240° arc (modern, basic, 3d, etc.)
    }
    
    // Calculate the actual bounds of the arc
    const labelOffset = hasLabels ? 25 : 5;
    const outerRadius = radius + thickness / 2 + labelOffset;
    
    // Convert angles to radians and find min/max Y
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Top of arc (always at top for these gauge types)
    const minY = center - outerRadius;
    
    // Bottom of arc - find the lowest point
    const startY = center + outerRadius * Math.sin(startRad);
    const endY = center + outerRadius * Math.sin(endRad);
    const maxY = Math.max(startY, endY, center); // Include center for pointer hub
    
    // Add small padding
    const padding = 5;
    const viewMinY = Math.max(0, minY - padding);
    const viewHeight = maxY - viewMinY + padding;
    
    return `0 ${viewMinY} ${size} ${viewHeight}`;
  }
  
  // Calculate SVG height based on gauge style to remove empty space
  private getSvgHeight(gaugeModule: GaugeModule): number {
    const size = gaugeModule.gauge_size || 200;
    const style = gaugeModule.gauge_style || 'modern';
    const thickness = gaugeModule.gauge_thickness || 15;
    const center = size / 2;
    const radius = size / 2 - thickness - 10;
    const hasLabels = gaugeModule.show_min_max !== false || gaugeModule.show_tick_labels;
    
    // For full circle gauges, use full height
    if (['radial', 'minimal'].includes(style)) {
      return size;
    }
    
    // For digital gauge, full height
    if (style === 'digital') {
      return size;
    }
    
    // Calculate bounds based on arc angles
    let startAngle: number, endAngle: number;
    
    if (style === 'arc') {
      startAngle = -180; endAngle = 0;
    } else if (style === 'speedometer') {
      startAngle = -225; endAngle = 45;
    } else {
      startAngle = -120; endAngle = 120;
    }
    
    const labelOffset = hasLabels ? 25 : 5;
    const outerRadius = radius + thickness / 2 + labelOffset;
    
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const minY = center - outerRadius;
    const startY = center + outerRadius * Math.sin(startRad);
    const endY = center + outerRadius * Math.sin(endRad);
    const maxY = Math.max(startY, endY, center);
    
    const padding = 5;
    const viewMinY = Math.max(0, minY - padding);
    const viewHeight = maxY - viewMinY + padding;
    
    // Scale height proportionally to viewBox
    return viewHeight;
  }

  private getGaugeViewBox(gaugeModule: GaugeModule): string {
    const size = gaugeModule.gauge_size || 200;
    const hasLabels = gaugeModule.show_min_max !== false || gaugeModule.show_tick_labels;
    
    // Add padding for labels that may extend beyond the gauge
    if (hasLabels) {
      const padding = 35; // Padding for labels
      return `-${padding} -${padding} ${size + padding * 2} ${size + padding * 2}`;
    }
    
    return `0 0 ${size} ${size}`;
  }

  private getContainerStyles(gaugeModule: GaugeModule): string {
    const styles: string[] = [
      'display: flex',
      'flex-direction: column',
      'align-items: center',
      'justify-content: center',
      'width: 100%',
      'overflow: visible',
      'padding: 20px 0', // Add padding for labels that extend beyond the gauge
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

    // Apply X and Y offsets
    const xOffset = gaugeModule.value_x_offset || 0;
    const yOffset = gaugeModule.value_y_offset || 0;

    if (gaugeModule.value_position === 'center') {
      styles.push('position: absolute');
      styles.push('top: calc(50% + 32px)'); // Shift down by 32px
      styles.push('left: 50%');
      styles.push(`transform: translate(${-50 + xOffset}%, ${-50 + yOffset}%)`);
    } else if (gaugeModule.value_position === 'top') {
      // Calculate top position based on gauge style
      let topOffset = 16;
      if (gaugeModule.gauge_style === 'minimal') {
        topOffset = size / 2 - 20; // Inside the circle for minimal
      }
      styles.push('position: absolute');
      styles.push(`top: ${topOffset - 32 + yOffset}px`); // Shift up by 32px
      styles.push(`left: ${50 + xOffset}%`);
      styles.push('transform: translateX(-50%)');
      styles.push('z-index: 1');
    } else if (gaugeModule.value_position === 'bottom') {
      // Position value below the gauge - use relative positioning to flow naturally
      styles.push('display: block');
      styles.push('width: 100%');
      styles.push('margin-top: -24px'); // 8px gap minus 32px adjustment
      if (xOffset !== 0 || yOffset !== 0) {
        styles.push(`transform: translate(${xOffset}px, ${yOffset}px)`);
      }
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

  // Helper method to ensure values have proper units
  private addPixelUnit(value: string | number | undefined): string | undefined {
    if (!value && value !== 0) return value as string | undefined;

    // Convert number to string
    const valueStr = String(value);

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(valueStr)) {
      return `${valueStr}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(valueStr)) {
      return valueStr
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return valueStr;
  }

  private _hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
